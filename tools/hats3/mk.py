import sys,json,struct,io,numpy as np
from PIL import Image
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
src,out,TEX=sys.argv[1],sys.argv[2],int(sys.argv[3])
b=open(src,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+n]); B=b[20+n+8:]
def acc(i):
    a=j["accessors"][i]; bv=j["bufferViews"][a["bufferView"]]; o=bv.get("byteOffset",0)+a.get("byteOffset",0)
    dt={5126:np.float32,5125:np.uint32,5123:np.uint16}[a["componentType"]]; c={"SCALAR":1,"VEC2":2,"VEC3":3}[a["type"]]
    return np.frombuffer(B,dtype=dt,count=a["count"]*c,offset=o).reshape(-1,c) if c>1 else np.frombuffer(B,dtype=dt,count=a["count"],offset=o)
pr=j["meshes"][0]["primitives"][0]; P=acc(pr["attributes"]["POSITION"]).copy(); N=acc(pr["attributes"]["NORMAL"]); U=acc(pr["attributes"]["TEXCOORD_0"]); I=acc(pr["indices"]).reshape(-1,3).astype(np.int64)
nd=j["nodes"][0]
if "scale" in nd or "translation" in nd: print("node xform",nd.get("scale"),nd.get("translation"))
im=j["images"][0]; bv=j["bufferViews"][im["bufferView"]]; tex=Image.open(io.BytesIO(B[bv.get("byteOffset",0):bv.get("byteOffset",0)+bv["byteLength"]])).convert("RGB")
print('tex',tex.size,'tris',len(I))
C=P[I].mean(1); mn,mx=P.min(0),P.max(0); midy=(mn[1]+mx[1])/2
# cells by triangle-component centre: 3 columns, 2 rows
key=np.round(P,5); _,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.reshape(-1); J=inv[I]; nn=inv.max()+1
r=np.concatenate([J[:,0],J[:,1],J[:,2]]); c=np.concatenate([J[:,1],J[:,2],J[:,0]])
k,lab=connected_components(coo_matrix((np.ones(len(r)),(r,c)),shape=(nn,nn)),directed=False); tl=lab[J[:,0]]
cell=np.zeros(len(I),int); W=mx[0]-mn[0]
for i in range(k):
    m=tl==i; pts=P[I[m]].reshape(-1,3); a,bb=pts.min(0),pts.max(0); cx=(a[0]+bb[0])/2; cy=(a[1]+bb[1])/2
    col=int(np.clip(np.floor((cx-mn[0])/W*3),0,2)); row=0 if cy>midy else 1; cell[m]=row*3+col
NAMES=['h_claw','h_astro','h_geisha','h_ramen','h_crane','h_cake']
tex=tex.resize((TEX,TEX),Image.LANCZOS)
bin=b""; views=[]; accs=[]; meshes=[]; nodes=[]
def put(q):
    global bin
    while len(bin)%4: bin+=b"\0"
    views.append({"buffer":0,"byteOffset":len(bin),"byteLength":len(q)}); bin+=q; return len(views)-1
o=io.BytesIO(); tex.save(o,"JPEG",quality=86); img=put(o.getvalue()); info={}
for ci,name in enumerate(NAMES):
    T=I[cell==ci]; used=np.unique(T); remap=-np.ones(len(P),np.int64); remap[used]=np.arange(len(used)); T=remap[T]
    p=P[used].copy(); a,bb=p.min(0),p.max(0); p[:,0]-=(a[0]+bb[0])/2; p[:,2]-=(a[2]+bb[2])/2; p[:,1]-=a[1]
    H=bb[1]-a[1]; Wd=bb[0]-a[0]; low=p[:,1]<.18*H; rw=np.ptp(p[low,0]) if low.any() else Wd
    info[name]=dict(W=round(float(Wd),3),H=round(float(H),3),D=round(float(bb[2]-a[2]),3),rimW=round(float(rw),3),tris=len(T))
    ai=len(accs); nv=len(p)
    accs+=[{"bufferView":put(p.astype(np.float32).tobytes()),"componentType":5126,"count":nv,"type":"VEC3","min":p.min(0).tolist(),"max":p.max(0).tolist()},
       {"bufferView":put(N[used].astype(np.float32).tobytes()),"componentType":5126,"count":nv,"type":"VEC3"},
       {"bufferView":put(U[used].astype(np.float32).tobytes()),"componentType":5126,"count":nv,"type":"VEC2"},
       {"bufferView":put(T.astype(np.uint32).tobytes()),"componentType":5125,"count":len(T)*3,"type":"SCALAR"}]
    meshes.append({"primitives":[{"attributes":{"POSITION":ai,"NORMAL":ai+1,"TEXCOORD_0":ai+2},"indices":ai+3,"material":0}]}); nodes.append({"name":name,"mesh":len(meshes)-1})
while len(bin)%4: bin+=b"\0"
gj={"asset":{"version":"2.0"},"scene":0,"scenes":[{"nodes":list(range(len(nodes)))}],"nodes":nodes,"meshes":meshes,"materials":[{"pbrMetallicRoughness":{"baseColorTexture":{"index":0},"metallicFactor":0,"roughnessFactor":.7}}],"textures":[{"source":0}],"images":[{"bufferView":img,"mimeType":"image/jpeg"}],"accessors":accs,"bufferViews":views,"buffers":[{"byteLength":len(bin)}]}
js=json.dumps(gj).encode(); js+=b" "*((4-len(js)%4)%4)
open(out,"wb").write(struct.pack("<III",0x46546C67,2,28+len(js)+len(bin))+struct.pack("<II",len(js),0x4E4F534A)+js+struct.pack("<II",len(bin),0x004E4942)+bin)
json.dump(info,open('info.json','w')); print(json.dumps(info,indent=0))

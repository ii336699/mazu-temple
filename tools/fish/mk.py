# The chair's fish sheet (one glb, ten fish in 2 columns x 5 rows) -> public/fish.glb (ten nodes named by fish id, one shared 768 picture)
# and public/fish/<id>.webp + <id>-d.webp (icon and its dark silhouette for the fish book).
# usage: gltfpack -i sheet.glb -o simp.glb -si 0.03 -noq -kn ; python3 mk.py simp.glb sheet.glb OUT.glb ICON_DIR ; gltfpack -i OUT.glb -o public/fish.glb -cc -kn -noq  (no quantising: the wriggle in the game bends the fish in its own 1-unit-long coordinates)
import sys,json,struct,io,os,numpy as np
from PIL import Image, ImageFilter
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
src,full,out,icd=sys.argv[1:5]
def load(path):
    b=open(path,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+n]); B=b[20+n+8:]
    def acc(i):
        a=j["accessors"][i]; bv=j["bufferViews"][a["bufferView"]]; o=bv.get("byteOffset",0)+a.get("byteOffset",0)
        dt={5126:np.float32,5125:np.uint32,5123:np.uint16}[a["componentType"]]; c={"SCALAR":1,"VEC2":2,"VEC3":3}[a["type"]]; st=bv.get("byteStride",0)
        if st and st!=np.dtype(dt).itemsize*c: raw=np.frombuffer(B,dtype=np.uint8,count=st*a["count"],offset=o).reshape(-1,st)[:,:np.dtype(dt).itemsize*c].copy(); return raw.view(dt).reshape(-1,c)
        return np.frombuffer(B,dtype=dt,count=a["count"]*c,offset=o).reshape(-1,c) if c>1 else np.frombuffer(B,dtype=dt,count=a["count"],offset=o)
    pr=j["meshes"][0]["primitives"][0]; P=acc(pr["attributes"]["POSITION"]).copy(); N=acc(pr["attributes"]["NORMAL"]); U=acc(pr["attributes"]["TEXCOORD_0"]); I=acc(pr["indices"]).reshape(-1,3).astype(np.int64)
    ti=j['materials'][0]['pbrMetallicRoughness']['baseColorTexture']['index']; im=j["images"][j['textures'][ti]['source']]; bv=j["bufferViews"][im["bufferView"]]
    tex=Image.open(io.BytesIO(B[bv.get("byteOffset",0):bv.get("byteOffset",0)+bv["byteLength"]])).convert("RGB"); return P,N,U,I,tex
P,N,U,I,tex=load(src); print('simplified tris',len(I),'tex',tex.size)
mn,mx=P.min(0),P.max(0)
key=np.round(P,5); _,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.reshape(-1); J=inv[I]; nn=inv.max()+1
r=np.concatenate([J[:,0],J[:,1],J[:,2]]); c=np.concatenate([J[:,1],J[:,2],J[:,0]])
k,lab=connected_components(coo_matrix((np.ones(len(r)),(r,c)),shape=(nn,nn)),directed=False); tl=lab[J[:,0]]
cell=np.zeros(len(I),int); H=mx[1]-mn[1]
def cellOf(cx,cy): return (0 if cx<0 else 1)*5+int(np.clip(np.floor((mx[1]-cy)/H*5),0,4))
for i in range(k):
    m=tl==i; pts=P[I[m]].reshape(-1,3); a,bb=pts.min(0),pts.max(0); cell[m]=cellOf((a[0]+bb[0])/2,(a[1]+bb[1])/2)
# left column top to bottom, then right column top to bottom
NAMES=['bass','carp','tilapia','catfish','arowana','trout','goldfish','guppy','zacco','koi']
TEX=768; t2=tex.resize((TEX,TEX),Image.LANCZOS)
bin=b""; views=[]; accs=[]; meshes=[]; nodes=[]; info={}
def put(q):
    global bin
    while len(bin)%4: bin+=b"\0"
    views.append({"buffer":0,"byteOffset":len(bin),"byteLength":len(q)}); bin+=q; return len(views)-1
o=io.BytesIO(); t2.save(o,"JPEG",quality=84); img=put(o.getvalue())
for ci,name in enumerate(NAMES):
    T=I[cell==ci]; used=np.unique(T); remap=-np.ones(len(P),np.int64); remap[used]=np.arange(len(used)); T=remap[T]
    p=P[used].copy(); a,bb=p.min(0),p.max(0); p-= (a+bb)/2; L=bb[0]-a[0]; p/=L   # centred, 1 unit long, head towards -x
    info[name]=dict(H=round(float((bb[1]-a[1])/L),3),D=round(float((bb[2]-a[2])/L),3),tris=len(T)); ai=len(accs); nv=len(p)
    accs+=[{"bufferView":put(p.astype(np.float32).tobytes()),"componentType":5126,"count":nv,"type":"VEC3","min":p.min(0).tolist(),"max":p.max(0).tolist()},
       {"bufferView":put(N[used].astype(np.float32).tobytes()),"componentType":5126,"count":nv,"type":"VEC3"},
       {"bufferView":put(U[used].astype(np.float32).tobytes()),"componentType":5126,"count":nv,"type":"VEC2"},
       {"bufferView":put(T.astype(np.uint32).tobytes()),"componentType":5125,"count":len(T)*3,"type":"SCALAR"}]
    meshes.append({"primitives":[{"attributes":{"POSITION":ai,"NORMAL":ai+1,"TEXCOORD_0":ai+2},"indices":ai+3,"material":0}]}); nodes.append({"name":name,"mesh":len(meshes)-1})
while len(bin)%4: bin+=b"\0"
gj={"asset":{"version":"2.0"},"scene":0,"scenes":[{"nodes":list(range(len(nodes)))}],"nodes":nodes,"meshes":meshes,"materials":[{"pbrMetallicRoughness":{"baseColorTexture":{"index":0},"metallicFactor":0,"roughnessFactor":.55}}],"textures":[{"source":0}],"images":[{"bufferView":img,"mimeType":"image/jpeg"}],"accessors":accs,"bufferViews":views,"buffers":[{"byteLength":len(bin)}]}
js=json.dumps(gj).encode(); js+=b" "*((4-len(js)%4)%4)
open(out,"wb").write(struct.pack("<III",0x46546C67,2,28+len(js)+len(bin))+struct.pack("<II",len(js),0x4E4F534A)+js+struct.pack("<II",len(bin),0x004E4942)+bin)
print(json.dumps(info))
# icons from the full-detail sheet (every vertex painted with its picture colour, seen from the side)
P,N,U,I,tex=load(full); Tx=np.asarray(tex); mn,mx=P.min(0),P.max(0); H=mx[1]-mn[1]; C=P[I[:,0]]
key=np.round(P,5); _,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.reshape(-1); J=inv[I]; nn=inv.max()+1
r=np.concatenate([J[:,0],J[:,1],J[:,2]]); c=np.concatenate([J[:,1],J[:,2],J[:,0]]); k,lab=connected_components(coo_matrix((np.ones(len(r)),(r,c)),shape=(nn,nn)),directed=False); vl=lab[inv]
lo=np.full((k,2),9.); hi=np.full((k,2),-9.); np.minimum.at(lo,vl,P[:,:2]); np.maximum.at(hi,vl,P[:,:2]); cc=(lo+hi)/2
vc=((cc[:,0]>=0).astype(int)*5+np.clip(np.floor((mx[1]-cc[:,1])/H*5),0,4).astype(int))[vl]
os.makedirs(icd,exist_ok=True)
for ci,name in enumerate(NAMES):
    m=vc==ci; p=P[m]; uv=U[m]; a,bb=p.min(0),p.max(0); W=256; s=(W-12)/(bb[0]-a[0]); Hh=160
    x=(6+(p[:,0]-a[0])*s).astype(int).clip(0,W-1); y=(Hh/2-(p[:,1]-(a[1]+bb[1])/2)*s).astype(int).clip(0,Hh-1)
    col=Tx[(uv[:,1]%1*(Tx.shape[0]-1)).astype(int),(uv[:,0]%1*(Tx.shape[1]-1)).astype(int)]
    im=np.zeros((Hh,W,4),np.uint8); o2=np.argsort(p[:,2]); im[y[o2],x[o2],:3]=col[o2]; im[y[o2],x[o2],3]=255
    pic=Image.fromarray(im); al=pic.split()[3].filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)); rgb=pic.convert("RGB").filter(ImageFilter.MedianFilter(3)); pic=Image.merge("RGBA",(*rgb.split(),al))
    pic.save(os.path.join(icd,name+".webp"),quality=86); d=Image.new("RGBA",pic.size,(42,48,56,0)); d.putalpha(al); d.save(os.path.join(icd,name+"-d.webp"),quality=80)
print('icons done')

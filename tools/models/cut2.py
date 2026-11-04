import json,struct,sys,numpy as np
src=sys.argv[1]; boxes=json.loads(sys.argv[2])
b=open(src,"rb").read(); n=struct.unpack("<I",b[12:16])[0]; j=json.loads(b[20:20+n]); B=b[20+n+8:]
def acc(i):
    a=j["accessors"][i]; bv=j["bufferViews"][a["bufferView"]]; o=bv.get("byteOffset",0)+a.get("byteOffset",0)
    dt={5126:np.float32,5125:np.uint32,5123:np.uint16}[a["componentType"]]; c={"SCALAR":1,"VEC2":2,"VEC3":3}[a["type"]]
    return np.frombuffer(B,dtype=dt,count=a["count"]*c,offset=o).reshape(-1,c) if c>1 else np.frombuffer(B,dtype=dt,count=a["count"],offset=o)
pr=j["meshes"][0]["primitives"][0]; P=acc(pr["attributes"]["POSITION"]); N=acc(pr["attributes"]["NORMAL"]); U=acc(pr["attributes"]["TEXCOORD_0"]); I=acc(pr["indices"]).reshape(-1,3).astype(np.int64)
im=j["images"][0]; bv=j["bufferViews"][im["bufferView"]]; jpg=B[bv.get("byteOffset",0):bv.get("byteOffset",0)+bv["byteLength"]]
C=P[I].mean(1); bin=b""; views=[]; acc_=[]; meshes=[]; nodes=[]
def put(q):
    global bin
    while len(bin)%4: bin+=b"\0"
    views.append({"buffer":0,"byteOffset":len(bin),"byteLength":len(q)}); bin+=q; return len(views)-1
for name,(x0,x1,y0,y1) in boxes.items():
    m=(C[:,0]>=x0)&(C[:,0]<=x1)&(C[:,1]>=y0)&(C[:,1]<=y1); T=I[m]; used=np.unique(T); remap=-np.ones(len(P),np.int64); remap[used]=np.arange(len(used)); T=remap[T]
    p=P[used].copy(); mn=p.min(0); mx=p.max(0); p[:,0]-=(mn[0]+mx[0])/2; p[:,2]-=(mn[2]+mx[2])/2; p[:,1]-=mn[1]
    a=len(acc_); nv=len(p)
    acc_+= [{"bufferView":put(p.astype(np.float32).tobytes()),"componentType":5126,"count":nv,"type":"VEC3","min":p.min(0).tolist(),"max":p.max(0).tolist()},
       {"bufferView":put(N[used].astype(np.float32).tobytes()),"componentType":5126,"count":nv,"type":"VEC3"},{"bufferView":put(U[used].astype(np.float32).tobytes()),"componentType":5126,"count":nv,"type":"VEC2"},
       {"bufferView":put(T.astype(np.uint32).tobytes()),"componentType":5125,"count":len(T)*3,"type":"SCALAR"}]
    meshes.append({"primitives":[{"attributes":{"POSITION":a,"NORMAL":a+1,"TEXCOORD_0":a+2},"indices":a+3,"material":0}]}); nodes.append({"name":name,"mesh":len(meshes)-1})
    print(name,len(T),np.round(mx-mn,3))
iv=put(jpg)
while len(bin)%4: bin+=b"\0"
g={"asset":{"version":"2.0"},"scene":0,"scenes":[{"nodes":list(range(len(nodes)))}],"nodes":nodes,"meshes":meshes,
 "materials":[{"pbrMetallicRoughness":{"baseColorTexture":{"index":0},"metallicFactor":0,"roughnessFactor":.8}}],
 "textures":[{"source":0}],"images":[{"bufferView":iv,"mimeType":"image/jpeg"}],"accessors":acc_,"bufferViews":views,"buffers":[{"byteLength":len(bin)}]}
js=json.dumps(g).encode(); js+=b" "*((4-len(js)%4)%4)
open(sys.argv[3],"wb").write(struct.pack("<III",0x46546C67,2,28+len(js)+len(bin))+struct.pack("<II",len(js),0x4E4F534A)+js+struct.pack("<II",len(bin),0x004E4942)+bin)

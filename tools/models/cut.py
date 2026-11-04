import json,struct,sys,numpy as np
sys.path.insert(0,".")
from view import load, shade
def save(f,P,N,I):
    P=P.astype(np.float32); N=N.astype(np.float32); I=I.astype(np.uint32).reshape(-1)
    bp,bn,bi=P.tobytes(),N.tobytes(),I.tobytes(); bin=bp+bn+bi
    j={"asset":{"version":"2.0"},"scene":0,"scenes":[{"nodes":[0]}],"nodes":[{"mesh":0}],"meshes":[{"primitives":[{"attributes":{"POSITION":0,"NORMAL":1},"indices":2}]}],
       "buffers":[{"byteLength":len(bin)}],"bufferViews":[{"buffer":0,"byteOffset":0,"byteLength":len(bp)},{"buffer":0,"byteOffset":len(bp),"byteLength":len(bn)},{"buffer":0,"byteOffset":len(bp)+len(bn),"byteLength":len(bi)}],
       "accessors":[{"bufferView":0,"componentType":5126,"count":len(P),"type":"VEC3","min":P.min(0).tolist(),"max":P.max(0).tolist()},{"bufferView":1,"componentType":5126,"count":len(N),"type":"VEC3"},{"bufferView":2,"componentType":5125,"count":len(I),"type":"SCALAR"}]}
    js=json.dumps(j).encode(); js+=b" "*((4-len(js)%4)%4); bin+=b"\0"*((4-len(bin)%4)%4)
    out=b"glTF"+struct.pack("<II",2,12+8+len(js)+8+len(bin))+struct.pack("<I",len(js))+b"JSON"+js+struct.pack("<I",len(bin))+b"BIN\0"+bin
    open(f,"wb").write(out)
src=sys.argv[1]; boxes=json.loads(sys.argv[2]); P,N,I=load(src); I=I.astype(np.int64); C=P[I].mean(1)
for name,(x0,x1,y0,y1) in boxes.items():
    m=(C[:,0]>=x0)&(C[:,0]<=x1)&(C[:,1]>=y0)&(C[:,1]<=y1); T=I[m]; used=np.unique(T); rm=-np.ones(len(P),np.int64); rm[used]=np.arange(len(used)); T=rm[T]
    p=P[used].copy(); n=N[used].copy(); mn=p.min(0); mx=p.max(0); p[:,0]-=(mn[0]+mx[0])/2; p[:,2]-=(mn[2]+mx[2])/2; p[:,1]-=mn[1]
    save(name+".raw.glb",p,n,T); print(name,len(p),len(T),(mx-mn).round(3))
    for ax in ["front","side"]: shade(p,n,ax,name+"_"+ax+".png",500)

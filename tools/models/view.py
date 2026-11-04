import json,struct,sys,numpy as np
from PIL import Image
def load(f):
    b=open(f,"rb").read(); n=struct.unpack("<I",b[12:16])[0]; j=json.loads(b[20:20+n]); B=b[20+n+8:]
    def acc(i):
        a=j["accessors"][i]; bv=j["bufferViews"][a["bufferView"]]; o=bv.get("byteOffset",0)+a.get("byteOffset",0)
        dt={5126:np.float32,5125:np.uint32,5123:np.uint16}[a["componentType"]]; c={"SCALAR":1,"VEC2":2,"VEC3":3}[a["type"]]
        return np.frombuffer(B,dtype=dt,count=a["count"]*c,offset=o).reshape(-1,c) if c>1 else np.frombuffer(B,dtype=dt,count=a["count"],offset=o)
    pr=j["meshes"][0]["primitives"][0]; P=acc(pr["attributes"]["POSITION"]); N=acc(pr["attributes"]["NORMAL"]); I=acc(pr["indices"]).reshape(-1,3) if "indices" in pr else np.arange(len(P)).reshape(-1,3)
    return P,N,I
def shade(P,N,ax,out,W=900):
    u,v,d={"front":(0,1,2),"top":(0,2,1),"side":(2,1,0)}[ax]
    mn=P.min(0); mx=P.max(0); s=(W-20)/max(mx[u]-mn[u],mx[v]-mn[v])
    H=int((mx[v]-mn[v])*s)+20; img=np.zeros((H,W)); z=np.full((H,W),-1e9)
    x=((P[:,u]-mn[u])*s+10).astype(int); y=(H-10-(P[:,v]-mn[v])*s).astype(int); depth=P[:,d] if ax!="top" else P[:,1]
    l=np.clip(N@np.array([.4,.6,.7]),0,1)*.8+.2
    o=np.argsort(depth); img[y[o],x[o]]=l[o]
    Image.fromarray((img*255).astype(np.uint8)).save(out)
if __name__=="__main__":
    P,N,I=load(sys.argv[1]); print(len(P),len(I))
    for ax in ["front","top","side"]: shade(P,N,ax,sys.argv[1][:-4]+"_"+ax+".png")

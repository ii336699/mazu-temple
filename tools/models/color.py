import json,struct,sys,numpy as np
from view import load
def srgb2lin(c): c=np.asarray(c)/255.0; return np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4)
def save(f,P,N,I,Cl):
    P=P.astype(np.float32); N=N.astype(np.float32); Cl=np.clip(Cl,0,1).astype(np.float32); I=I.astype(np.uint32).reshape(-1)
    parts=[P.tobytes(),N.tobytes(),Cl.tobytes(),I.tobytes()]; offs=np.cumsum([0]+[len(p) for p in parts]); bin=b"".join(parts)
    j={"asset":{"version":"2.0"},"scene":0,"scenes":[{"nodes":[0]}],"nodes":[{"mesh":0}],"materials":[{"pbrMetallicRoughness":{"baseColorFactor":[1,1,1,1],"metallicFactor":0,"roughnessFactor":.85}}],
       "meshes":[{"primitives":[{"attributes":{"POSITION":0,"NORMAL":1,"COLOR_0":2},"indices":3,"material":0}]}],"buffers":[{"byteLength":len(bin)}],
       "bufferViews":[{"buffer":0,"byteOffset":int(offs[k]),"byteLength":len(parts[k])} for k in range(4)],
       "accessors":[{"bufferView":0,"componentType":5126,"count":len(P),"type":"VEC3","min":P.min(0).tolist(),"max":P.max(0).tolist()},{"bufferView":1,"componentType":5126,"count":len(N),"type":"VEC3"},
                    {"bufferView":2,"componentType":5126,"count":len(Cl),"type":"VEC3"},{"bufferView":3,"componentType":5125,"count":len(I),"type":"SCALAR"}]}
    js=json.dumps(j).encode(); js+=b" "*((4-len(js)%4)%4); bin+=b"\0"*((4-len(bin)%4)%4)
    open(f,"wb").write(b"glTF"+struct.pack("<II",2,28+len(js)+len(bin))+struct.pack("<I",len(js))+b"JSON"+js+struct.pack("<I",len(bin))+b"BIN\0"+bin)
def cavity(P,N,I):
    s=np.zeros_like(P,dtype=np.float64); c=np.zeros(len(P))
    for a,b in [(0,1),(1,2),(2,0),(1,0),(2,1),(0,2)]: np.add.at(s,I[:,a],P[I[:,b]]); np.add.at(c,I[:,a],1)
    d=s/np.maximum(c,1)[:,None]-P; cav=(d*N).sum(1); scale=np.percentile(np.abs(cav),95)+1e-9; return np.clip(cav/scale,-1,1)  # >0 concave
def run(name,kind):
    P,N,I=load(name+".raw.glb"); I=I.astype(np.int64); cv=cavity(P,N,I); rng=np.random.default_rng(1)
    # smooth cavity a little over neighbours
    for _ in range(2):
        s=np.zeros(len(P)); c=np.zeros(len(P))
        for a,b in [(0,1),(1,2),(2,0)]: np.add.at(s,I[:,a],cv[I[:,b]]); np.add.at(c,I[:,a],1)
        cv=.5*cv+.5*s/np.maximum(c,1)
    sp=rng.normal(0,1,len(P))*.035  # granite speckle
    if kind=="stone":
        base=srgb2lin([168,162,150]); col=np.tile(base,(len(P),1))*(1+sp)[:,None]
        col*=np.clip(1-.65*np.clip(cv,0,1)+.12*np.clip(-cv,0,1),.25,1.2)[:,None]
    elif kind=="window":
        x,y=P[:,0],P[:,1]-(P[:,1].max()/2); r=np.maximum(np.abs(x),np.abs(y)); r=np.maximum(r,(np.abs(x)+np.abs(y))/1.414); R=r.max()
        frame=r>R*.80; red=srgb2lin([150,28,20]); gold=srgb2lin([214,162,74])
        col=np.where(frame[:,None],red,gold)*(1+sp*.5)[:,None]; col*=np.clip(1-.55*np.clip(cv,0,1),.3,1.1)[:,None]
    elif kind=="rail":
        base=srgb2lin([176,170,158]); col=np.tile(base,(len(P),1))*(1+sp)[:,None]; col*=np.clip(1-.6*np.clip(cv,0,1)+.1*np.clip(-cv,0,1),.25,1.2)[:,None]
    save(name+".col.glb",P,N,I,col); print(name,"ok")
for n,k in [("lionL","stone"),("lionR","stone"),("huachuang","window"),("weiqiang","rail")]: run(n,k)

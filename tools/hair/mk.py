# The chair's hair sheet (tripo glb, grey, no picture: 21 hairs, each its own connected piece — rows 1–2 男 (10), rows 3–4 女 (11))
# → public/hair2-00.glb … hair2-20.glb (one node hNN each), each fitted to the avatar's head (a sphere of radius .26 at the origin of the head group; the
# hollow inside each hair is found by fitting a sphere to its inward-facing wall), the inner wall dropped, thinned on a grid.
# Positions are int16 (value/32767*SPAN), normals int8 — the game turns them back into floats when it loads (hair2Load).
# usage: python3 mk.py SHEET.glb OUT_PREFIX   → OUT_PREFIX-00.glb … -20.glb   (env GRID=cells across, default 60)
import sys,os,json,struct,numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
src,out=sys.argv[1:3]; GRID=int(os.environ.get('GRID','60')); HEAD=.26*1.045; SPAN=.8
b=open(src,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+n]); B=b[20+n+8:]
def acc(i):
    a=j["accessors"][i]; bv=j["bufferViews"][a["bufferView"]]; o=bv.get("byteOffset",0)+a.get("byteOffset",0)
    dt={5126:np.float32,5125:np.uint32,5123:np.uint16}[a["componentType"]]; c={"SCALAR":1,"VEC3":3}[a["type"]]
    return np.frombuffer(B,dtype=dt,count=a["count"]*c,offset=o).reshape(-1,c) if c>1 else np.frombuffer(B,dtype=dt,count=a["count"],offset=o)
pr=j["meshes"][0]["primitives"][0]; P=acc(pr["attributes"]["POSITION"]).astype(np.float64); I=acc(pr["indices"]).reshape(-1,3).astype(np.int64)
key=np.round(P,5); _,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.reshape(-1); J=inv[I]; nn=inv.max()+1
k,lab=connected_components(coo_matrix((np.ones(len(J)*2),(np.concatenate([J[:,0],J[:,1]]),np.concatenate([J[:,1],J[:,2]]))),shape=(nn,nn)),directed=False); vl=lab[inv]; tl=lab[J[:,0]]
cnt=np.bincount(tl,minlength=k); lo=np.full((k,3),1e9); hi=np.full((k,3),-1e9); np.minimum.at(lo,vl,P); np.maximum.at(hi,vl,P)
big=[c for c in range(k) if cnt[c]>50000]; big.sort(key=lambda c:(-round((lo[c,1]+hi[c,1])/2,1),(lo[c,0]+hi[c,0])/2)); assert len(big)==21,len(big)
N=np.zeros_like(P); f=np.cross(P[I[:,1]]-P[I[:,0]],P[I[:,2]]-P[I[:,0]])
for q in range(3): np.add.at(N,I[:,q],f)
def sphere(q):
    A=np.c_[2*q,np.ones(len(q))]; s=np.linalg.lstsq(A,(q**2).sum(1),rcond=None)[0]; c=s[:3]; return c,np.sqrt(s[3]+c@c)
bin=b""; views=[]; accs=[]; meshes=[]; nodes=[]
def put(q,st=0):
    global bin
    while len(bin)%4: bin+=b"\0"
    views.append({"buffer":0,"byteOffset":len(bin),"byteLength":len(q),**({"byteStride":st} if st else {})}); bin+=q; return len(views)-1
for i,c in enumerate(big):
    vm=vl==c; idx=np.where(vm)[0]; rm=-np.ones(len(P),np.int64); rm[idx]=np.arange(len(idx)); p=P[idx]; nr=N[idx]; nu=nr/(np.linalg.norm(nr,axis=1,keepdims=True)+1e-12); T=rm[I[tl==c]]
    a,bb=p.min(0),p.max(0); w=bb[0]-a[0]; c0=np.array([(a[0]+bb[0])/2,bb[1]-w*.45,(a[2]+bb[2])/2]); r=w*.4
    for it in range(4):
        d=p-c0; dist=np.linalg.norm(d,axis=1); inner=((nu*d).sum(1)<-.35*dist)&(dist<r*1.25)&(dist>r*.6)
        if it>0: inner&=np.abs(dist-r)<r*.12
        c0,r=sphere(p[inner])
    d=p-c0; dist=np.linalg.norm(d,axis=1); wall=((nu*d).sum(1)<-.3*dist)&(dist<r*1.13)      # the hollow's wall: nobody sees it
    T=T[~(wall[T].all(1))]
    q=(p-c0)/r*HEAD                                                                         # head units, head centre at 0
    cs=(q.max(0)-q.min(0)).max()/GRID; cell=np.floor((q-q.min(0))/cs).astype(np.int64); used=np.unique(T)
    _,cl=np.unique(cell[used],axis=0,return_inverse=True); cl=cl.reshape(-1); nc=cl.max()+1; wgt=np.bincount(cl,minlength=nc).astype(float)
    av=lambda A:np.stack([np.bincount(cl,A[:,t],nc) for t in range(3)],1)
    Q=av(q[used])/wgt[:,None]; NN=av(nr[used]); ln=np.linalg.norm(NN,axis=1,keepdims=True); rad=Q/(np.linalg.norm(Q,axis=1,keepdims=True)+1e-9)
    NN=np.where(ln>1e-12,NN/(ln+1e-30),rad); weak=(ln[:,0]<np.percentile(ln[:,0],3)); NN[weak]=rad[weak]
    r2=-np.ones(len(p),np.int64); r2[used]=cl; T2=r2[T]; T2=T2[(T2[:,0]!=T2[:,1])&(T2[:,1]!=T2[:,2])&(T2[:,0]!=T2[:,2])]
    ks=np.sort(T2,axis=1); _,ui=np.unique(ks,axis=0,return_index=True); T2=T2[ui]
    assert np.abs(Q).max()<SPAN,(i,np.abs(Q).max()); assert nc<65536
    pos=np.zeros((nc,4),np.int16); pos[:,:3]=np.round(Q/SPAN*32767); nrm=np.zeros((nc,4),np.int8); nrm[:,:3]=np.round(NN*127)
    ai=len(accs)
    accs+=[{"bufferView":put(pos.tobytes(),8),"componentType":5122,"normalized":True,"count":int(nc),"type":"VEC3","min":(pos[:,:3].min(0)/32767).tolist(),"max":(pos[:,:3].max(0)/32767).tolist()},
           {"bufferView":put(nrm.tobytes(),4),"componentType":5120,"normalized":True,"count":int(nc),"type":"VEC3"},
           {"bufferView":put(T2.astype(np.uint16).tobytes()),"componentType":5123,"count":int(len(T2)*3),"type":"SCALAR"}]
    meshes.append({"primitives":[{"attributes":{"POSITION":ai,"NORMAL":ai+1},"indices":ai+2}]}); nodes.append({"name":"h%02d"%i,"mesh":len(meshes)-1})
    # one file per hair (public/hair2-NN.glb): the game fetches a hair only when somebody wears it
    while len(bin)%4: bin+=b"\0"
    gj={"asset":{"version":"2.0"},"extensionsUsed":["KHR_mesh_quantization"],"extensionsRequired":["KHR_mesh_quantization"],"scene":0,"scenes":[{"nodes":[0]}],"nodes":nodes,"meshes":meshes,"accessors":accs,"bufferViews":views,"buffers":[{"byteLength":len(bin)}]}
    js=json.dumps(gj).encode(); js+=b" "*((4-len(js)%4)%4)
    open(out+"-%02d.glb"%i,"wb").write(struct.pack("<III",0x46546C67,2,28+len(js)+len(bin))+struct.pack("<II",len(js),0x4E4F534A)+js+struct.pack("<II",len(bin),0x004E4942)+bin)
    bin=b""; views=[]; accs=[]; meshes=[]; nodes=[]
    print(i,'verts',nc,'tris',len(T2),'r',round(r,4),'ext',np.round(Q.min(0),2),np.round(Q.max(0),2),flush=True)
print('done')

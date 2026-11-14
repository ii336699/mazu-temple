# The chair's later fish sheets (tripo glb, one mesh each, every fish its own connected piece) -> public/fish2.glb + icons public/fish/<id>.webp
# No gltfpack here, so each fish is thinned in numpy: vertices are merged on a grid (about GRID cells along the fish) but only
# within the same UV island, so the picture never smears across a seam. Head points to -x, every fish 1 unit long, as in fish.glb.
# usage: python3 mk2.py GLB_DIR OUT.glb ICON_DIR
import sys,os,json,struct,io,numpy as np
from PIL import Image,ImageFilter
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
gdir,out,icd=sys.argv[1:4]
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'mk.py')).read().split("src,full,out,icd")[0])   # imports
exec("def load"+open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'mk.py')).read().split("def load")[1].split("P,N,U,I,tex=load(src)")[0])
# sheet -> names in reading order (rows top to bottom, left to right); None = not used
SHEETS={
 '1e324bca':['clownfish','mahi','shark','tuna','sunfish','marlin','oarfish',None],
 'c6a3ce1c':['mackerel','seabream','terapon','sardine','milkfish','saury','mullet','puffer','flounder'],
 'be06afbf':['loach','eel','bighead',None,'masu','sturgeon',None,None,None],
 '9eb00065':[None,'medaka','angel','springkoi','goldscale'],
 'fda1cdd3':[None,None,'crucian',None,None,'ayu','kuhua',None,None],
 '33c41eb9':['hairtail','squid','seahorse','grouper','pomfret','redbream','amberjack','octopus'],
}
GRID=int(os.environ.get('GRID','56')); TEX=int(os.environ.get('TEX','768'))
def comps(n,a,b):
    k,l=connected_components(coo_matrix((np.ones(len(a)),(a,b)),shape=(n,n)),directed=False); return k,l
bin=b""; views=[]; accs=[]; meshes=[]; nodes=[]; mats=[]; texs=[]; imgs=[]; info={}
def put(q,st=0):
    global bin
    while len(bin)%4: bin+=b"\0"
    views.append({"buffer":0,"byteOffset":len(bin),"byteLength":len(q),**({"byteStride":st} if st else {})}); bin+=q; return len(views)-1
os.makedirs(icd,exist_ok=True)
for sh,names in SHEETS.items():
    P,N,U,I,tex=load(os.path.join(gdir,sh+'.glb')); Tx=np.asarray(tex)
    key=np.round(P,5); _,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.reshape(-1); J=inv[I]; nn=inv.max()+1
    k,lab=comps(nn,np.concatenate([J[:,0],J[:,1]]),np.concatenate([J[:,1],J[:,2]])); vl=lab[inv]
    cnt=np.bincount(lab[J[:,0]],minlength=k); lo=np.full((k,3),1e9); hi=np.full((k,3),-1e9); np.minimum.at(lo,vl,P); np.maximum.at(hi,vl,P)
    big=[c for c in range(k) if cnt[c]>2000]; big.sort(key=lambda c:(-round((lo[c,1]+hi[c,1])/2,1),(lo[c,0]+hi[c,0])/2))
    assert len(big)==len(names),(sh,len(big))
    # uv islands: pieces joined by shared vertex indices (seams split indices)
    ki,isl=comps(len(P),np.concatenate([I[:,0],I[:,1]]),np.concatenate([I[:,1],I[:,2]]))
    t2=tex.resize((TEX,TEX),Image.LANCZOS); o=io.BytesIO(); t2.save(o,"JPEG",quality=82)
    imgs.append({"bufferView":put(o.getvalue()),"mimeType":"image/jpeg"}); texs.append({"source":len(imgs)-1})
    mats.append({"pbrMetallicRoughness":{"baseColorTexture":{"index":len(texs)-1},"metallicFactor":0,"roughnessFactor":.55}}); mi=len(mats)-1
    tl=lab[J[:,0]]
    for c,name in zip(big,names):
        if not name: continue
        T=I[tl==c]; a,bb=lo[c],hi[c]; Lx=bb[0]-a[0]; cs=(bb-a).max()/GRID
        used=np.unique(T); p=P[used]; cell=np.floor((p-a)/cs).astype(np.int64)
        kk=np.stack([cell[:,0],cell[:,1],cell[:,2],isl[used]],1); _,cl=np.unique(kk,axis=0,return_inverse=True); cl=cl.reshape(-1); nc=cl.max()+1
        w=np.bincount(cl,minlength=nc).astype(np.float64)
        avg=lambda A:np.stack([np.bincount(cl,A[:,i],nc) for i in range(A.shape[1])],1)/w[:,None]
        # position and normal shared by every island in a cell, so the two sides of a seam meet exactly (no cracks)
        _,pc=np.unique(cell,axis=0,return_inverse=True); pc=pc.reshape(-1); npc=pc.max()+1; wp=np.bincount(pc,minlength=npc).astype(np.float64)
        pav=lambda A:np.stack([np.bincount(pc,A[:,i],npc) for i in range(A.shape[1])],1)/wp[:,None]
        PP=pav(p.astype(np.float64)); NN=pav(N[used].astype(np.float64)); first=np.zeros(nc,np.int64); first[cl]=pc
        np_=PP[first]; nN=NN[first]; nN/=np.linalg.norm(nN,axis=1,keepdims=True)+1e-9; nu=avg(U[used].astype(np.float64))
        rm=-np.ones(len(P),np.int64); rm[used]=cl; T2=rm[T]
        ok=(T2[:,0]!=T2[:,1])&(T2[:,1]!=T2[:,2])&(T2[:,0]!=T2[:,2]); T2=T2[ok]
        T2=np.unique(T2,axis=0)
        p2=np_-(a+bb)/2; p2/=Lx
        info[name]=dict(sheet=sh,tris=len(T2),orig=len(T),H=round(float((bb[1]-a[1])/Lx),3))
        ai=len(accs); nv=len(p2)
        assert nu.min()>=-1e-4 and nu.max()<=1+1e-4, (name,nu.min(),nu.max())
        n8=np.zeros((nv,4),np.int8); n8[:,:3]=np.round(nN*127).astype(np.int8)
        accs+=[{"bufferView":put(p2.astype(np.float32).tobytes()),"componentType":5126,"count":nv,"type":"VEC3","min":p2.min(0).tolist(),"max":p2.max(0).tolist()},
           {"bufferView":put(n8.tobytes(),4),"componentType":5120,"normalized":True,"count":nv,"type":"VEC3"},
           {"bufferView":put(np.round(np.clip(nu,0,1)*65535).astype(np.uint16).tobytes()),"componentType":5123,"normalized":True,"count":nv,"type":"VEC2"},
           {"bufferView":put((T2.astype(np.uint16) if nv<65536 else T2.astype(np.uint32)).tobytes()),"componentType":5123 if nv<65536 else 5125,"count":len(T2)*3,"type":"SCALAR"}]
        meshes.append({"primitives":[{"attributes":{"POSITION":ai,"NORMAL":ai+1,"TEXCOORD_0":ai+2},"indices":ai+3,"material":mi}]}); nodes.append({"name":name,"mesh":len(meshes)-1})
        # icon from the full-detail piece, side view, as in mk.py
        m=vl==c; q=P[m]; uv=U[m]; W=256; s=(W-12)/Lx; Hh=160
        if (bb[1]-a[1])*s>Hh-8: s=(Hh-8)/(bb[1]-a[1])
        x=(W/2+(q[:,0]-(a[0]+bb[0])/2)*s).astype(int).clip(0,W-1); y=(Hh/2-(q[:,1]-(a[1]+bb[1])/2)*s).astype(int).clip(0,Hh-1)
        col=Tx[((uv[:,1]%1)*(Tx.shape[0]-1)).astype(int),((uv[:,0]%1)*(Tx.shape[1]-1)).astype(int)]
        im=np.zeros((Hh,W,4),np.uint8); o2=np.argsort(q[:,2]); im[y[o2],x[o2],:3]=col[o2]; im[y[o2],x[o2],3]=255
        pic=Image.fromarray(im); al=pic.split()[3].filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)); rgb=pic.convert("RGB").filter(ImageFilter.MedianFilter(3)); pic=Image.merge("RGBA",(*rgb.split(),al))
        pic.save(os.path.join(icd,name+".webp"),quality=86); d=Image.new("RGBA",pic.size,(42,48,56,0)); d.putalpha(al); d.save(os.path.join(icd,name+"-d.webp"),quality=80)
        print(name,info[name],flush=True)
while len(bin)%4: bin+=b"\0"
gj={"asset":{"version":"2.0"},"extensionsUsed":["KHR_mesh_quantization"],"extensionsRequired":["KHR_mesh_quantization"],"scene":0,"scenes":[{"nodes":list(range(len(nodes)))}],"nodes":nodes,"meshes":meshes,"materials":mats,"textures":texs,"images":imgs,"accessors":accs,"bufferViews":views,"buffers":[{"byteLength":len(bin)}]}
js=json.dumps(gj).encode(); js+=b" "*((4-len(js)%4)%4)
open(out,"wb").write(struct.pack("<III",0x46546C67,2,28+len(js)+len(bin))+struct.pack("<II",len(js),0x4E4F534A)+js+struct.pack("<II",len(bin),0x004E4942)+bin)
print('fish',len(nodes),'bytes',os.path.getsize(out))

import sys,os,json,struct,io,numpy as np,cv2,xatlas,fast_simplification
from scipy import ndimage
from scipy.spatial import cKDTree
from PIL import Image
from glbio import *
CAT={0:"bed",1:"bed",2:"wall",3:"pic",4:"deco",5:"misc",6:"curtain",7:"curtain",8:"curtain",9:"plant",10:"plant",11:"appl",12:"appl",13:"cabinet",14:"cabinet",15:"cabinet",16:"wall",17:"wall",
     18:"deco",19:"chair",20:"chair",21:"table",22:"table",23:"deco",24:"deco",25:"deco",26:"deco",27:"chair",28:"table"}
TRIS={"plant":5000,"pic":1200,"curtain":3500,"deco":3000,"wall":3000}
TEX={"deco":256}
OUT='out/'; os.makedirs(OUT,exist_ok=True)
def clusters(P,res=260):
    mn=P.min(0); mx=P.max(0); s=(res-1)/(mx[0]-mn[0]); g=((P-mn)*s).astype(int); dim=g.max(0)+3; occ=np.zeros(dim,bool); occ[g[:,0]+1,g[:,1]+1,g[:,2]+1]=True
    lab,n=ndimage.label(occ,structure=np.ones((3,3,3))); vl=lab[g[:,0]+1,g[:,1]+1,g[:,2]+1]; cnt=np.bincount(vl,minlength=n+1); cnt[0]=0
    big=[i for i in np.argsort(-cnt) if cnt[i]>len(P)*0.025]; cen=np.array([P[vl==i].mean(0) for i in big]); out=np.full(len(P),-1)
    for k,i in enumerate(big): out[vl==i]=k
    rest=np.where(out<0)[0]
    if len(rest):
        t=cKDTree(P[out>=0]); _,nn=t.query(P[rest]); out[rest]=out[out>=0][nn]
    ys=np.sort(cen[:,1]); gap=np.argmax(np.diff(ys)) if len(ys)>1 else 0; thr=(ys[gap]+ys[gap+1])/2 if len(ys)>1 else 0
    order=sorted(range(len(big)),key=lambda k:(0 if cen[k][1]>thr else 1,cen[k][0])); remap=np.zeros(len(big),int); remap[order]=np.arange(len(big))
    return remap[out],len(big)
def order8(P,lab,n):
    cen=np.array([P[lab==i].mean(0) for i in range(n)]); ys=np.sort(cen[:,1]); gap=np.argmax(np.diff(ys)); thr=(ys[gap]+ys[gap+1])/2
    order=sorted(range(n),key=lambda k:(0 if cen[k][1]>thr else 1,cen[k][0])); remap=np.zeros(n,int); remap[order]=np.arange(n); return remap[lab]
def gridsplit(P):
    mn=P.min(0); mx=P.max(0); h=np.histogram(P[:,1],bins=200,range=(mn[1],mx[1]))[0]; mid=slice(60,140); yc=mn[1]+(60+np.argmin(h[mid])+.5)/200*(mx[1]-mn[1]); lab=np.zeros(len(P),int)
    for r,sel in enumerate([P[:,1]>yc,P[:,1]<=yc]):
        x=P[sel,0]; hx=np.histogram(x,bins=400,range=(mn[0],mx[0]))[0].astype(float); hx=ndimage.uniform_filter1d(hx,5); cuts=[]
        for q in (100,200,300):
            w=slice(q-36,q+36); cuts.append(mn[0]+(q-36+np.argmin(hx[w])+.5)/400*(mx[0]-mn[0]))
        lab[sel]=r*4+np.searchsorted(cuts,x)
    return lab,8
def clusters_auto(P):
    best=None
    for r in (260,340,200,150):
        lab,n=clusters(P,r)
        if n==8: return order8(P,lab,8),8,"cc%d"%r
        if n>8 and (best is None or n<best[1]): best=(lab,n)
    if best is not None:
        lab,n=best
        while n>8:
            cnt=np.bincount(lab,minlength=n); sm=int(np.argmin(cnt)); t=cKDTree(P[lab!=sm][::7]); _,nn=t.query(P[lab==sm][::50]); tgt=np.bincount(lab[lab!=sm][::7][nn]).argmax()
            lab=np.where(lab==sm,tgt,lab); lab=np.where(lab>sm,lab-1,lab); n-=1
        return order8(P,lab,8),8,"merge"
    lab,n=gridsplit(P); return lab,8,"grid"
def vnormals(V,F):
    n=np.cross(V[F[:,1]]-V[F[:,0]],V[F[:,2]]-V[F[:,0]]); N=np.zeros_like(V); 
    for k in range(3): np.add.at(N,F[:,k],n)
    l=np.linalg.norm(N,axis=1,keepdims=True); return N/np.maximum(l,1e-12)
def crease_split(V,F,deg=42):
    """split vertices where the faces around them disagree by more than deg, so hard edges stay hard"""
    fn=np.cross(V[F[:,1]]-V[F[:,0]],V[F[:,2]]-V[F[:,0]]); fa=np.linalg.norm(fn,axis=1,keepdims=True); fu=fn/np.maximum(fa,1e-12)
    sm=vnormals(V,F); cosT=np.cos(np.radians(deg)); newV=[V]; newN=[sm.copy()]; F2=F.copy(); base=len(V); extra=[]; extraN=[]
    for k in range(3):
        d=(fu*sm[F[:,k]]).sum(1); bad=np.where(d<cosT)[0]
        for f in bad: extra.append(V[F[f,k]]); extraN.append(fu[f]); F2[f,k]=base+len(extra)-1
    if extra: V2=np.vstack([V,np.array(extra)]); N2=np.vstack([sm,np.array(extraN)])
    else: V2,N2=V,sm
    # merge split corners that share position and near-identical normal
    key=np.round(np.hstack([V2*1e5,N2*6]),0); _,idx,inv=np.unique(key,axis=0,return_index=True,return_inverse=True)
    return V2[idx].astype(np.float32),N2[idx].astype(np.float32),inv[F2].astype(np.uint32)
def bake(V,F,UVn,size,oP,oF,oUV,tex):
    """for every texel of the new atlas: its 3D point on the small mesh -> closest point on the original -> original texture colour"""
    T=np.asarray(tex).astype(np.float32); th,tw=T.shape[:2]
    pos=np.zeros((size,size,3),np.float32); mask=np.zeros((size,size),bool); uvp=UVn*size
    for f in range(len(F)):
        a,b,c=uvp[F[f]]; x0=max(int(np.floor(min(a[0],b[0],c[0])))-1,0); x1=min(int(np.ceil(max(a[0],b[0],c[0])))+1,size-1); y0=max(int(np.floor(min(a[1],b[1],c[1])))-1,0); y1=min(int(np.ceil(max(a[1],b[1],c[1])))+1,size-1)
        if x1<x0 or y1<y0: continue
        xs,ys=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5); den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
        if abs(den)<1e-12: continue
        w0=((b[1]-c[1])*(xs-c[0])+(c[0]-b[0])*(ys-c[1]))/den; w1=((c[1]-a[1])*(xs-c[0])+(a[0]-c[0])*(ys-c[1]))/den; w2=1-w0-w1; e=-0.6/max(1.0,np.sqrt(abs(den)))
        m=(w0>=e)&(w1>=e)&(w2>=e)
        if not m.any(): continue
        w0=np.clip(w0,0,1); w1=np.clip(w1,0,1); w2=np.clip(w2,0,1); sw=w0+w1+w2
        p=(w0[...,None]*V[F[f,0]]+w1[...,None]*V[F[f,1]]+w2[...,None]*V[F[f,2]])/sw[...,None]
        sub=pos[y0:y1+1,x0:x1+1]; mm=mask[y0:y1+1,x0:x1+1]; sel=m&~mm; sub[sel]=p[sel]; mm[sel]=True
    ys,xs=np.where(mask); Q=pos[ys,xs]
    # closest point on the original surface: nearest original vertices, then the best of the triangles around them
    tree=cKDTree(oP); _,nv=tree.query(Q,k=2)
    inc=[[] for _ in range(len(oP))]
    order=np.argsort(oF.reshape(-1),kind='stable'); flat=oF.reshape(-1)[order]; fid=(order//3)
    start=np.searchsorted(flat,np.arange(len(oP))); end=np.searchsorted(flat,np.arange(len(oP)),side='right')
    K=10; best=np.full(len(Q),1e9,np.float32); buv=np.zeros((len(Q),2),np.float32)
    for kk in range(2):
        v=nv[:,kk]
        for j in range(K):
            ok=(start[v]+j)<end[v]
            if not ok.any(): break
            f=fid[np.minimum(start[v]+j,len(fid)-1)]; A=oP[oF[f,0]]; B=oP[oF[f,1]]; C=oP[oF[f,2]]
            v0=B-A; v1=C-A; v2=Q-A; d00=(v0*v0).sum(1); d01=(v0*v1).sum(1); d11=(v1*v1).sum(1); d20=(v2*v0).sum(1); d21=(v2*v1).sum(1); den=d00*d11-d01*d01; den=np.where(np.abs(den)<1e-20,1e-20,den)
            bv=(d11*d20-d01*d21)/den; bw=(d00*d21-d01*d20)/den; bu=1-bv-bw; bu=np.clip(bu,0,1); bv=np.clip(bv,0,1); bw=np.clip(bw,0,1); s=bu+bv+bw; bu/=s; bv/=s; bw/=s
            cp=bu[:,None]*A+bv[:,None]*B+bw[:,None]*C; dist=((cp-Q)**2).sum(1); dist=np.where(ok,dist,1e9); upd=dist<best
            uv=bu[:,None]*oUV[f*3]+bv[:,None]*oUV[f*3+1]+bw[:,None]*oUV[f*3+2]; buv[upd]=uv[upd]; best[upd]=dist[upd]
    u=buv[:,0]%1*tw-.5; vv=buv[:,1]%1*th-.5; x0=np.floor(u).astype(int); y0=np.floor(vv).astype(int); fx=(u-x0)[:,None]; fy=(vv-y0)[:,None]
    g=lambda yy,xx:T[np.clip(yy,0,th-1),np.clip(xx,0,tw-1)]
    col=(g(y0,x0)*(1-fx)+g(y0,x0+1)*fx)*(1-fy)+(g(y0+1,x0)*(1-fx)+g(y0+1,x0+1)*fx)*fy
    img=np.zeros((size,size,3),np.float32); img[ys,xs]=col
    ind=ndimage.distance_transform_edt(~mask,return_distances=False,return_indices=True); img=img[ind[0],ind[1]]
    return Image.fromarray(np.clip(img,0,255).astype(np.uint8))
def writeglb(path,V,N,UV,F,img,q=86):
    bb=io.BytesIO(); img.save(bb,"WEBP",quality=q,method=6); im=bb.getvalue()
    idx=F.astype(np.uint16 if len(V)<65536 else np.uint32).tobytes(); parts=[V.astype(np.float32).tobytes(),N.astype(np.float32).tobytes(),UV.astype(np.float32).tobytes(),idx,im]; bin=b""; views=[]
    for p in parts:
        while len(bin)%4: bin+=b"\0"
        views.append({"buffer":0,"byteOffset":len(bin),"byteLength":len(p)}); bin+=p
    while len(bin)%4: bin+=b"\0"
    views[0]["target"]=views[1]["target"]=views[2]["target"]=34962; views[3]["target"]=34963
    j={"asset":{"version":"2.0"},"scene":0,"scenes":[{"nodes":[0]}],"nodes":[{"mesh":0}],"meshes":[{"primitives":[{"attributes":{"POSITION":0,"NORMAL":1,"TEXCOORD_0":2},"indices":3,"material":0}]}],
       "materials":[{"pbrMetallicRoughness":{"baseColorTexture":{"index":0},"metallicFactor":0,"roughnessFactor":.85}}],"textures":[{"extensions":{"EXT_texture_webp":{"source":0}}}],"images":[{"bufferView":4,"mimeType":"image/webp"}],
       "extensionsUsed":["EXT_texture_webp"],"extensionsRequired":["EXT_texture_webp"],"buffers":[{"byteLength":len(bin)}],"bufferViews":views,
       "accessors":[{"bufferView":0,"componentType":5126,"count":len(V),"type":"VEC3","min":V.min(0).tolist(),"max":V.max(0).tolist()},{"bufferView":1,"componentType":5126,"count":len(V),"type":"VEC3"},{"bufferView":2,"componentType":5126,"count":len(V),"type":"VEC2"},{"bufferView":3,"componentType":5123 if len(V)<65536 else 5125,"count":F.size,"type":"SCALAR"}]}
    js=json.dumps(j,separators=(",",":")).encode(); js+=b" "*((4-len(js)%4)%4)
    open(path,"wb").write(struct.pack("<III",0x46546C67,2,28+len(js)+len(bin))+struct.pack("<II",len(js),0x4E4F534A)+js+struct.pack("<II",len(bin),0x004E4942)+bin)
def run(si):
    k=IDS[si]; cat=CAT[si]; P,UV,I,tex,j=load(k); P=np.array(P); UV=np.array(UV); I=np.array(I).astype(np.int64)
    lab,n,how=clusters_auto(P); meta=[]; print("sheet",si,k,how)
    fl=lab[I[:,0]]
    for c in range(n):
        Fc=I[fl==c]; used=np.unique(Fc); oP0=P[used]; rem=np.zeros(len(P),np.int64); rem[used]=np.arange(len(used)); Fl=rem[Fc]
        # weld by position for connectivity
        key=np.round(oP0*2e5).astype(np.int64); _,first,inv=np.unique(key,axis=0,return_index=True,return_inverse=True); inv=inv.reshape(-1)
        wP=oP0[first].astype(np.float32); wF=inv[Fl]; good=(wF[:,0]!=wF[:,1])&(wF[:,1]!=wF[:,2])&(wF[:,0]!=wF[:,2]); wF=wF[good]; cornerUV=UV[Fc[good]].reshape(-1,2)
        target=TRIS.get(cat,3000); 
        sV,sF=fast_simplification.simplify(wP,wF.astype(np.int32),target_count=target,agg=5) if len(wF)>target else (wP,wF)
        sV=np.asarray(sV,np.float32); sF=np.asarray(sF,np.int64)
        V2,N2,F2=crease_split(sV,sF)
        size=TEX.get(cat,512); at=xatlas.Atlas(); at.add_mesh(V2,F2,N2); co=xatlas.ChartOptions(); po=xatlas.PackOptions(); po.resolution=size; po.padding=3; po.bilinear=True; at.generate(co,po); vm,Fi,uv=at[0]
        V3=V2[vm]; N3=N2[vm]; F3=Fi.astype(np.int64); img=bake(V3,F3,uv,size,wP,wF,cornerUV,tex)
        # place: wall things hang from their back at mid height, everything else stands on the floor at its middle
        mn=V3.min(0); mx=V3.max(0); wall=cat in("wall","pic","curtain"); org=np.array([(mn[0]+mx[0])/2,(mn[1]+mx[1])/2 if wall else mn[1],mn[2] if wall else (mn[2]+mx[2])/2]); V3=V3-org; dims=(mx-mn)
        uv2=uv.copy(); name="%s_%02d_%d"%(cat,si,c+1); writeglb(OUT+name+".raw.glb",V3,N3,uv2,F3,img)
        meta.append({"id":name,"cat":cat,"sheet":si,"n":c+1,"dims":[round(float(d),4) for d in dims],"tris":int(len(F3)),"verts":int(len(V3)),"srcTris":int(len(Fc)),"tex":size})
        print(name,"src",len(Fc),"->",len(F3),"tris",len(V3),"verts","dims",np.round(dims,3)); sys.stdout.flush()
    json.dump(meta,open(OUT+"meta_%02d.json"%si,"w"))
if __name__=="__main__":
    for a in sys.argv[1:]: run(int(a))

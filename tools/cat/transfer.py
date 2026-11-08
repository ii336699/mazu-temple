import sys,json,struct; sys.path.insert(0,'/root/cat2'); from meshio import read; import numpy as np
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
jo,o=read('/root/cats11/cat_rig.glb'); jn,n=read('/root/cat2/dec.glb')
O=o['POSITION'].astype(float); OI=o['idx'].astype(int); OUV=o['TEXCOORD_0'].astype(float); OJ=o['JOINTS_0'].astype(int); OW=o['WEIGHTS_0'].astype(float)
N0=n['POSITION'].astype(float); NN=n['NORMAL'].astype(float); NI=n['idx'].astype(int)
# old UV islands (vertices connected through triangles)
r=np.concatenate([OI[:,0],OI[:,1],OI[:,2]]); c=np.concatenate([OI[:,1],OI[:,2],OI[:,0]])
_,isl=connected_components(coo_matrix((np.ones(len(r)),(r,c)),shape=(len(O),len(O))),directed=False); tisl=isl[OI[:,0]]
def icp(X,T,mask=None,its=30):
    t=cKDTree(T); R0=np.eye(3); off=np.zeros(3)
    for _ in range(its):
        d,i=t.query(X); m=d<np.percentile(d,90)
        if mask is not None: m&=mask
        A=X[m]; B=T[i[m]]; ca,cb=A.mean(0),B.mean(0); H=(A-ca).T@(B-cb); U,S,Vt=np.linalg.svd(H); R=Vt.T@U.T
        if np.linalg.det(R)<0: Vt[-1]*=-1; R=Vt.T@U.T
        X=(R@(X-ca).T).T+cb
    return X
X=icp(N0.copy(),O)
# part-wise refinement: the head (dominated by head bones) on its own
names=[nd.get('name') for nd in jo['nodes']]; joints=jo['skins'][0]['joints']
headJ=[k for k,ji in enumerate(joints) if names[ji] in ('tripo::Head_1','tripo::Head_2','tripo::Head_3','bone_11')]
oh=np.isin(OJ,headJ); hw=(OW*oh).sum(1); OH=O[hw>.5]
t=cKDTree(O); d,i=t.query(X); nh=hw[i]>.5
Xh=icp(X[nh].copy(),OH,its=25); X[nh]=Xh
d,_=t.query(X); print('fit pct',np.percentile(d,[50,90,99]).round(4))
# closest point on old triangles
cnt=np.bincount(tisl); tcen0=O[OI].mean(1); feat=(cnt[tisl]<80)&(tcen0[:,2]>.3)&(tcen0[:,1]>.45) # eyes, nose, mouth, whiskers: drawn by the shader instead
keep=np.where(~feat)[0]; print('feature tris dropped',feat.sum())
A=O[OI[keep,0]]; B=O[OI[keep,1]]; C=O[OI[keep,2]]; cen=(A+B+C)/3; tc=cKDTree(cen); OI=OI[keep]; tisl=tisl[keep]
def closest(p,a,b,c):
    ab=b-a; ac=c-a; ap=p-a; d1=(ab*ap).sum(-1); d2=(ac*ap).sum(-1)
    n=np.cross(ab,ac); nn=(n*n).sum(-1)+1e-12
    # project to plane then barycentric (clamped)
    q=p-((ap*n).sum(-1)/nn)[...,None]*n
    v0=ab; v1=ac; v2=q-a; d00=(v0*v0).sum(-1); d01=(v0*v1).sum(-1); d11=(v1*v1).sum(-1); d20=(v2*v0).sum(-1); d21=(v2*v1).sum(-1)
    den=d00*d11-d01*d01+1e-12; v=(d11*d20-d01*d21)/den; w=(d00*d21-d01*d20)/den; u=1-v-w
    bc=np.stack([u,v,w],-1); bc=np.clip(bc,0,None); bc/=bc.sum(-1,keepdims=True)+1e-12
    pt=bc[...,0:1]*a+bc[...,1:2]*b+bc[...,2:3]*c; return pt,bc
def assign(P,K=10):
    _,cand=tc.query(P,k=K); best=np.full(len(P),1e9); bt=np.zeros(len(P),int); bb=np.zeros((len(P),3))
    for k in range(K):
        ti=cand[:,k]; pt,bc=closest(P,A[ti],B[ti],C[ti]); d=((pt-P)**2).sum(-1); m=d<best; best[m]=d[m]; bt[m]=ti[m]; bb[m]=bc[m]
    return bt,bb
def uvof(tri,bc): return (bc[:,0:1]*OUV[OI[tri,0]]+bc[:,1:2]*OUV[OI[tri,1]]+bc[:,2:3]*OUV[OI[tri,2]])
def skinof(tri,bc):
    J=np.zeros((len(tri),4),int); W=np.zeros((len(tri),4))
    for r_ in range(len(tri)):
        acc={}
        for k in range(3):
            v=OI[tri[r_],k]
            for jj,ww in zip(OJ[v],OW[v]):
                if ww>0: acc[jj]=acc.get(jj,0)+ww*bc[r_,k]
        top=sorted(acc.items(),key=lambda x:-x[1])[:4]; s=sum(w for _,w in top) or 1
        for q,(jj,ww) in enumerate(top): J[r_,q]=jj; W[r_,q]=ww/s
    return J,W
vt,vb=assign(X); VUV=uvof(vt,vb); VJ,VW=skinof(vt,vb)
# triangles that straddle UV islands get their own corners, all read from one old triangle
outP=list(N0); outN=list(NN); outUV=list(VUV); outJ=list(VJ); outW=list(VW); I=NI.copy(); nfix=0
cent=X[NI].mean(1); ct,cb_=assign(cent)
for f in range(len(NI)):
    vs=NI[f]; isl3=tisl[vt[vs]]; uvspan=np.ptp(VUV[vs],axis=0).max()
    if len(set(isl3))>1 or uvspan>.08:
        tri=np.array([ct[f]]*3); _,bc=closest(X[vs],A[tri],B[tri],C[tri]); uv=uvof(tri,bc); J,W=skinof(tri,bc)
        for k in range(3):
            I[f,k]=len(outP); outP.append(N0[vs[k]]); outN.append(NN[vs[k]]); outUV.append(uv[k]); outJ.append(VJ[vs[k]]); outW.append(VW[vs[k]])
        nfix+=1
print('verts',len(outP),'seam tris',nfix,'of',len(NI))
# bind pose: the skin was made for the old positions; the new mesh is placed as fitted (X) so the old bones drive it
P=np.array(outP); # use fitted coordinates so skinning lines up with the old skeleton
Xall=np.array(outP)
# map each output vertex to its fitted position: welded verts take X, duplicated take X of source
src=list(range(len(N0)))
for f in range(len(NI)):
    for k in range(3):
        if I[f,k]>=len(N0): src.append(NI[f,k]) if len(src)<=I[f,k] else None
src=np.array(src[:len(outP)]); Pf=X[src]
np.savez('/root/cat2/out.npz',P=Pf,N=np.array(outN),UV=np.array(outUV),J=np.array(outJ),W=np.array(outW),I=I)

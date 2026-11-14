# list fish groups in a sheet glb: connected components merged when their XY boxes overlap
import sys,json,numpy as np
sys.argv=[sys.argv[0]]+['x','x','x','x']+sys.argv[1:]
exec(open('/home/claude/mazu-temple/tools/fish/mk.py').read().split("P,N,U,I,tex=load(src)")[0])
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
def groups(P,I):
    key=np.round(P,5); _,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.reshape(-1); J=inv[I]; nn=inv.max()+1
    r=np.concatenate([J[:,0],J[:,1],J[:,2]]); c=np.concatenate([J[:,1],J[:,2],J[:,0]])
    k,lab=connected_components(coo_matrix((np.ones(len(r)),(r,c)),shape=(nn,nn)),directed=False); vl=lab[inv]
    lo=np.full((k,3),1e9); hi=np.full((k,3),-1e9); np.minimum.at(lo,vl,P); np.maximum.at(hi,vl,P)
    cnt=np.bincount(lab[J[:,0]],minlength=k)
    # union boxes that overlap in XY (with small margin)
    par=list(range(k))
    def f(a):
        while par[a]!=a: par[a]=par[par[a]]; a=par[a]
        return a
    big=np.argsort(-cnt)
    m=0.002*(P[:,:2].max(0)-P[:,:2].min(0)).max()
    for _ in range(0):
        for a in range(k):
            for b in range(a+1,k):
                if f(a)==f(b): continue
                if (lo[a,0]-m<=hi[b,0] and lo[b,0]-m<=hi[a,0] and lo[a,1]-m<=hi[b,1] and lo[b,1]-m<=hi[a,1]): par[f(a)]=f(b)
        # refresh merged boxes
        R=np.array([f(a) for a in range(k)])
        for a in range(k):
            ra=R[a]; lo[ra]=np.minimum(lo[ra],lo[a]); hi[ra]=np.maximum(hi[ra],hi[a])
    R=np.array([f(a) for a in range(k)])
    out=[]
    for g in np.unique(R):
        cs=np.where(R==g)[0]; tris=int(cnt[cs].sum())
        out.append(dict(comps=cs,lo=lo[g],hi=hi[g],tris=tris))
    return out,vl
if __name__=="__main__":
    P,N,U,I,tex=load(sys.argv[5]); print('tris',len(I),'tex',tex.size)
    gs,_=groups(P,I)
    gs=[g for g in gs if g['tris']>2000]
    gs.sort(key=lambda g:(-round((g['lo'][1]+g['hi'][1])/2,1),(g['lo'][0]+g['hi'][0])/2))
    for g in gs: print(g['tris'],len(g['comps']),np.round((g['lo']+g['hi'])/2,2),np.round(g['hi']-g['lo'],2))

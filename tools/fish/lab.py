# contact sheet: each component of each sheet splatted side-on, labelled sheet:index
import sys,os,numpy as np
from PIL import Image,ImageDraw,ImageFilter
SH=sys.argv[1:]; sys.argv=[sys.argv[0]]
exec(open('/home/claude/mazu-temple/tools/fish/seg.py').read().split('if __name__')[0])
tiles=[]
for f in SH:
    P,N,U,I,tex=load(os.path.expanduser('~/mz-sim/glb/'+f+'.glb')); Tx=np.asarray(tex)
    gs,vl=groups(P,I); gs=[g for g in gs if g['tris']>2000]
    gs.sort(key=lambda g:(-round((g['lo'][1]+g['hi'][1])/2,1),(g['lo'][0]+g['hi'][0])/2))
    for i,g in enumerate(gs):
        m=np.isin(vl,g['comps']); p=P[m]; uv=U[m]; a,bb=p.min(0),p.max(0); W=300;Hh=200; s=min((W-12)/(bb[0]-a[0]),(Hh-30)/(bb[1]-a[1]))
        x=(W/2+(p[:,0]-(a[0]+bb[0])/2)*s).astype(int).clip(0,W-1); y=(Hh/2+10-(p[:,1]-(a[1]+bb[1])/2)*s).astype(int).clip(0,Hh-1)
        col=Tx[((uv[:,1]%1)*(Tx.shape[0]-1)).astype(int),((uv[:,0]%1)*(Tx.shape[1]-1)).astype(int)]
        im=np.full((Hh,W,3),235,np.uint8); o=np.argsort(p[:,2]); im[y[o],x[o]]=col[o]
        t=Image.fromarray(im); ImageDraw.Draw(t).text((4,2),f"{f[:4]}:{i}",fill=(200,0,0)); tiles.append(t)
cols=6; rows=(len(tiles)+cols-1)//cols; S=Image.new('RGB',(cols*300,rows*200),'white')
for i,t in enumerate(tiles): S.paste(t,((i%cols)*300,(i//cols)*200))
S.save(os.path.expanduser('~/mz-sim/fishwork/lab.png'))

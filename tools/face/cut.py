# The chair's eye sheet (6×8 pairs of eyes) and mouth sheet (8×8) → public/face/eyes.webp and mouths.webp: one fixed-size tile per
# style, in the GAME's order (the free ones first — see ORDER below), each centred on the eyes / the mouth themselves (small extras
# such as a sweat drop or sparkles don't shift it), with nothing from the neighbouring cells.
# usage: python3 cut.py EYES.png MOUTHS.png OUT_DIR
import sys,os,numpy as np
from PIL import Image
from scipy import ndimage as nd
eyes,mouths,out=sys.argv[1:4]; os.makedirs(out,exist_ok=True)
# sheet cell (row*cols+col) for each game index
EYE_ORDER=[0,13,1,5,38,2,11,21,39,12,19,7,8,20,47,  3,4,30,24,16,26,27,18,46,45,  6,9,10,14,15,17,22,23,25,28,29,31,32,33,34,35,36,37,40,41,42,43,44]
MOUTH_ORDER=[3,10,1,5,0,4,7,8,9,15,16,36,  19,13,  2,6,11,12,14,17,18,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63]
def cut(path,cols,rows,order,win,tile,name,percol):
    assert sorted(order)==list(range(cols*rows)),name
    A=np.asarray(Image.open(path).convert('RGBA')).copy(); H,W=A.shape[:2]; cw,ch=W/cols,H/rows; al=A[:,:,3]
    solid=al>90; lab,k=nd.label(nd.binary_dilation(solid,iterations=2)); 
    com=nd.center_of_mass(solid,lab,range(1,k+1)); area=nd.sum(solid,lab,range(1,k+1)); sl=nd.find_objects(lab)
    cellof=np.array([int(min(rows-1,c[0]//ch))*cols+int(min(cols-1,c[1]//cw)) if a>0 else -1 for c,a in zip(com,area)])
    # every pixel belongs to the cell of its nearest solid piece (so a glow goes with its own eyes)
    _,(iy,ix)=nd.distance_transform_edt(lab==0,return_indices=True); pc=np.concatenate([[-1],cellof])[lab[iy,ix]]
    tw,th=tile; S=Image.new('RGBA',(percol*tw,((len(order)+percol-1)//percol)*th),(0,0,0,0))
    for gi,cell in enumerate(order):
        ids=[i for i in range(k) if cellof[i]==cell]; mx=max(area[i] for i in ids); maj=[i for i in ids if area[i]>mx*.3]
        x0=min(sl[i][1].start for i in maj); x1=max(sl[i][1].stop for i in maj); y0=min(sl[i][0].start for i in maj); y1=max(sl[i][0].stop for i in maj)
        ax,ay=(x0+x1)/2,(y0+y1)/2; ww,wh=win; X0,Y0=int(round(ax-ww/2)),int(round(ay-wh/2))
        T=np.zeros((wh,ww,4),np.uint8); sx0,sy0=max(0,X0),max(0,Y0); sx1,sy1=min(W,X0+ww),min(H,Y0+wh)
        sub=A[sy0:sy1,sx0:sx1].copy(); sub[pc[sy0:sy1,sx0:sx1]!=cell,3]=0; sub[sub[:,:,3]<22,3]=0
        T[sy0-Y0:sy1-Y0,sx0-X0:sx1-X0]=sub
        S.alpha_composite(Image.fromarray(T).resize((tw,th),Image.LANCZOS),((gi%percol)*tw,(gi//percol)*th))
    S.save(os.path.join(out,name+'.webp'),quality=88,method=6); print(name,S.size,os.path.getsize(os.path.join(out,name+'.webp')))
cut(eyes,6,8,EYE_ORDER,(256,128),(192,96),'eyes',8)
cut(mouths,8,8,MOUTH_ORDER,(192,128),(144,96),'mouths',8)

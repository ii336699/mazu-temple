# The chair's flower sheet (3c7c3986: transparent PNG, 5 rows) → public/flw/<id>.webp — single stems, wrapping papers, bows.
# usage: python3 cut.py SHEET OUT_DIR
import sys,os,numpy as np
from PIL import Image
from scipy import ndimage as nd
src,out=sys.argv[1:3]; os.makedirs(out,exist_ok=True)
NAMES=[["rose_r","rose_p","rose_w","rose_y","lily_p","lily_w","lily_o","lily_s"],
 ["carn_r","carn_p","carn_w","hyd_b","hyd_p","hyd_v","sunf","gerb_p","gerb_y","gerb_o"],
 ["tul_r","tul_p","tul_y","tul_w","tul_v","daisy","chamo","laven","gyp_w","gyp_p"],
 ["orch_p","orch_w","orch_y","calla_w","calla_y","euca","leafv","fern","monst","ivy"],
 ["wrap_k","wrap_p","wrap_v","wrap_b","wrap_f","wrap_m","bow_r","bow_p","bow_y","bow_v","bow_b"]]
A=np.asarray(Image.open(src).convert('RGBA')); al=A[:,:,3]>170
lab,n=nd.label(al); sl=nd.find_objects(lab); it=[]
for i,s in enumerate(sl):
    m=(lab[s]==i+1); a=int(m.sum())
    if a<60: continue
    ys,xs=np.nonzero(m); it.append(dict(id=i+1,cx=xs.mean()+s[1].start,cy=ys.mean()+s[0].start,area=a))
big=sorted([q for q in it if q['area']>2500],key=lambda q:q['cy'])
rows=[]
for q in big:
    if rows and abs(np.mean([z['cy'] for z in rows[-1]])-q['cy'])<120: rows[-1].append(q)
    else: rows.append([q])
R=[sorted(r,key=lambda q:q['cx']) for r in rows]
for r in R:
    for q in r: q['ids']=[q['id']]
allb=[q for r in R for q in r]
for q in it:
    if q['area']>2500: continue
    b=min(allb,key=lambda z:(z['cx']-q['cx'])**2+(z['cy']-q['cy'])**2*2); b['ids'].append(q['id'])
print([len(r) for r in R])
for names,row in zip(NAMES,R):
    assert len(names)==len(row),(names,len(row))
    for nm,q in zip(names,row):
        own=np.isin(lab,q['ids']); ys,xs=np.where(own); s=(slice(ys.min(),ys.max()+1),slice(xs.min(),xs.max()+1)); sub=A[s].copy(); sub[~own[s],3]=0
        a=sub[:,:,3].astype(float); sub[:,:,3]=(np.clip((a-50)/170,0,1)*255).astype(np.uint8)
        p=Image.fromarray(sub); p=p.crop(p.getbbox()); p.thumbnail((200,240),Image.LANCZOS); p.save(os.path.join(out,nm+'.webp'),quality=86)
print('ok')

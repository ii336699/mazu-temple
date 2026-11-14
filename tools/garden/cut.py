# The chair's growth sheets (transparent PNG, 4 rows each: seed → … → harvest, arrows between) → public/garden/<crop>-<stage>.webp
# Game stages 0..3 (剛種下, 發芽, 長大, 可以收成) are picked from each row's pictures (the seed and the arrows are skipped).
# usage: python3 cut.py SHEET11 SHEET12 SHEET13 OUT_DIR
import sys,os,numpy as np
from PIL import Image
from scipy import ndimage as nd
s11,s12,s13,out=sys.argv[1:5]; os.makedirs(out,exist_ok=True)
def items(path):
    im=Image.open(path).convert('RGBA'); A=np.asarray(im); al=A[:,:,3]>170
    lab,n=nd.label(nd.binary_dilation(al,iterations=3)); sl=nd.find_objects(lab); res=[]
    for i,s in enumerate(sl):
        h=s[0].stop-s[0].start; w=s[1].stop-s[1].start; m=(lab[s]==i+1)&al[s]
        if m.sum()<400: continue
        px=A[s][m][:,:3].astype(int); r,g,b=px.mean(0)
        arrow=h<90 and w<110 and ((r>200 and g>110 and b<90) or (g>140 and r<150 and b<90 and h<70))
        res.append(dict(id=i+1,x1=s[1].stop,y=(s[0].start+s[0].stop)/2,x=s[1].start,s=s,h=h,w=w,arrow=arrow,area=int(m.sum())))
    rows=[]
    for it in sorted([r for r in res if not r['arrow']],key=lambda r:r['y']):
        if rows and abs(rows[-1][0]['y']-it['y'])<150: rows[-1].append(it)
        else: rows.append([it])
    rows=[sorted(r,key=lambda q:q['x']) for r in rows]
    R2=[]
    for r in rows:
        out=[]
        for q in r:
            if out and q['x']<out[-1]['x1']+4:
                p=out[-1]; p['ids'].append(q['id']); p['x1']=max(p['x1'],q['x1']); p['area']+=q['area']
            else: out.append(dict(q,ids=[q['id']]))
        R2.append([q for q in out if q['area']>2500])
    rows=R2
    return im,A,lab,rows
# per sheet: crop names, and which picture (index after the seed) is each game stage
PLAN={s11:[('cabbage',[-5,-4,-2,-1]),('rose',[-5,-4,-3,-1]),('pumpkin',[-6,-4,-3,-1]),('melonW',[-6,-4,-3,-1])],
      s12:[('sun',[-6,-5,-3,-2]),('tulip',[-5,-4,-3,-2]),('tomato',[-6,-5,-3,-1]),('straw',[-6,-5,-3,-1])],
      s13:[('melon',[-5,-4,-3,-1]),('radish',[-5,-4,-3,-1]),('carnation',[-5,-4,-3,-1]),('peony',[-5,-4,-3,-1])]}   # picture index counted from the row's right end (small seeds are not always found)
for path,plan in PLAN.items():
    im,A,lab,rows=items(path); print(os.path.basename(path),[len(r) for r in rows],[[ (q['x'],q['x1']) for q in r] for r in rows][:1])
    for (name,pick),row in zip(plan,rows):
        pics=row
        for st,k in enumerate(pick):
            it=pics[max(k,-len(pics))]; own=np.isin(lab,it['ids']); ys,xs=np.where(own); s=(slice(ys.min(),ys.max()+1),slice(xs.min(),xs.max()+1)); sub=A[s].copy(); own=own[s]
            # keep only this item's pixels; clean the green halo: faint pixels go, edges lose green spill
            sub[~own,3]=0; a=sub[:,:,3].astype(float)
            a=np.clip((a-60)/150,0,1)*255; edge=(a>0)&(a<250); g=sub[:,:,1].astype(int); lim=np.maximum(sub[:,:,0],sub[:,:,2]).astype(int)+40
            sub[:,:,1]=np.where(edge&(g>lim),lim,g).clip(0,255)
            sub[:,:,3]=a.astype(np.uint8); p=Image.fromarray(sub); bb=p.getbbox(); p=p.crop(bb)
            p.thumbnail((256,256),Image.LANCZOS); p.save(os.path.join(out,f'{name}-{st}.webp'),quality=86)
print('ok')

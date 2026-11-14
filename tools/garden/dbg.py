import sys
from PIL import Image,ImageDraw
sys.argv=[sys.argv[0]]+sys.argv[1:4]+['/tmp/x']
src=open('/home/claude/mazu-temple/tools/garden/cut.py').read().split('# per sheet')[0]
exec(src)
for k,p in enumerate(sys.argv[1:4]):
    im,A,lab,rows=items(p); bg=Image.new('RGBA',im.size,(255,255,255,255)); bg.alpha_composite(im); d=ImageDraw.Draw(bg)
    for r in rows:
        for j,q in enumerate(r):
            import numpy as np
            ys,xs=np.where(np.isin(lab,q['ids'])); d.rectangle((xs.min(),ys.min(),xs.max(),ys.max()),outline=(255,0,0),width=3); d.text((xs.min()+3,ys.min()+3),str(j),fill=(255,0,0))
    bg.convert('RGB').resize((im.width//2,im.height//2)).save(f'/root/zipc/dbg{k}.png')

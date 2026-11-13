# cuts the chair's herb sheet (4+4+4+2) into public/herbs/<id>.webp:  python3 tools/burger/cut_herbs.py <sheet.png> public/herbs
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src, out = sys.argv[1:3]
A = Image.open(src).convert("RGBA"); a = np.array(A)
m = ndimage.binary_dilation(a[:,:,3] > 40, iterations=6); lab, n = ndimage.label(m)
objs = [s for s in ndimage.find_objects(lab) if (s[0].stop-s[0].start)*(s[1].stop-s[1].start) > 8000]
objs.sort(key=lambda s: (round((s[0].start+s[0].stop)/2 / a.shape[0] * 4 - .5), (s[1].start+s[1].stop)/2))
IDS = ["renshen","gouqi","hongzao","huangqi","danggui","gancao","chenpi","juhua","rougui","lianzi","fuling","guiyuan","shengjiang","jinyinhua"]
print(len(objs))
for i, s in enumerate(objs[:14]):
    c = A.crop((s[1].start, s[0].start, s[1].stop, s[0].stop)); c = c.crop(c.getbbox()); r = 200 / max(c.size); c = c.resize((max(1,round(c.width*r)), max(1,round(c.height*r))), Image.LANCZOS)
    c.save(f"{out}/{IDS[i]}.webp", quality=86, method=6)

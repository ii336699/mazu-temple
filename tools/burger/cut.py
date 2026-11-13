# cuts the chair's burger sheet (14 ingredients, 2 columns × 7 rows) and the surprised-faces sheet (bird, UFO, 媽祖, 千里眼, 順風耳 + their "!!")
# into separate webp pictures for the 早餐店 stacking game:  python3 tools/burger/cut.py <ingredients.png> <faces.png> <shop.png> public/burger
import sys, numpy as np
from PIL import Image
from scipy import ndimage
ing, fac, shop, out = sys.argv[1:5]
def comps(a, thr=40, dil=6):
    m = a[:,:,3] > thr; m2 = ndimage.binary_dilation(m, iterations=dil); lab, n = ndimage.label(m2)
    return [(s, (lab[s] > 0)) for s in ndimage.find_objects(lab)], lab
def save(im, box, name, w):
    c = im.crop(box); c = c.crop(c.getbbox()); r = w / c.width; c = c.resize((w, max(1, round(c.height * r))), Image.LANCZOS)
    c.save(f"{out}/{name}.webp", quality=88, method=6); return c.size
A = Image.open(ing).convert("RGBA"); a = np.array(A)
NAMES = [["bun_top","bun_bot"],["beef","chicken"],["cheese","lettuce"],["tomato","onion"],["pickle","bacon"],["egg","mushroom"],["ketchup","mayo"]]
objs, _ = comps(a, dil=3); objs = [s for s,_ in objs if (s[0].stop-s[0].start)*(s[1].stop-s[1].start) > 4000]
assert len(objs) == 14, len(objs)
H = a.shape[0]; W = a.shape[1]; sizes = {}
for s in objs:
    cy = (s[0].start + s[0].stop) / 2; cx = (s[1].start + s[1].stop) / 2
    r = min(6, int(cy / H * 7)); c = 0 if cx < W / 2 else 1
    sizes[NAMES[r][c]] = save(A, (s[1].start, s[0].start, s[1].stop, s[0].stop), NAMES[r][c], 240)
print(sizes)
B = Image.open(fac).convert("RGBA"); b = np.array(B)
objs, _ = comps(b, dil=4); big = []; small = []
for s,_ in objs:
    area = (s[0].stop-s[0].start)*(s[1].stop-s[1].start)
    (big if area > 40000 else small).append(s)
assert len(big) == 5, len(big)
def ctr(s): return ((s[1].start+s[1].stop)/2, (s[0].start+s[0].stop)/2)
big.sort(key=lambda s: (round(ctr(s)[1] / b.shape[0] * 2), ctr(s)[0]))
FN = ["bird","ufo","mazu","qianli","shunfeng"]
for i, s in enumerate(big):
    save(B, (s[1].start, s[0].start, s[1].stop, s[0].stop), FN[i], 300)
for s in small:
    cx, cy = ctr(s); j = min(range(5), key=lambda i: (ctr(big[i])[0]-cx)**2 + (big[i][0].start-cy)**2)
    save(B, (s[1].start, s[0].start, s[1].stop, s[0].stop), FN[j] + "-wow", 90)
print("marks", len(small))
S = Image.open(shop).convert("RGB"); S.save(f"{out}/shop.webp", quality=84, method=6); print("shop", S.size)

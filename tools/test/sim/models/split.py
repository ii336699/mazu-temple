import json,struct,numpy as np, io
from PIL import Image
b=open('hats_src.glb','rb').read(); n=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+n]); bin_=b[20+n+8:]
def acc(i):
    a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; off=bv.get('byteOffset',0)+a.get('byteOffset',0)
    dt={5126:np.float32,5125:np.uint32,5123:np.uint16}[a['componentType']]; nc={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
    return np.frombuffer(bin_,dt,a['count']*nc,off).reshape(-1,nc) if nc>1 else np.frombuffer(bin_,dt,a['count'],off)
p=j['meshes'][0]['primitives'][0]; P=acc(p['attributes']['POSITION']); N=acc(p['attributes']['NORMAL']); UV=acc(p['attributes']['TEXCOORD_0']); I=acc(p['indices']).reshape(-1,3).astype(np.int64)
# union-find over vertices welded by position
q=np.round(P*20000).astype(np.int64); _,weld=np.unique(q,axis=0,return_inverse=True); weld=weld.ravel()
par=np.arange(weld.max()+1)
def find(x):
    r=x
    while par[r]!=r: r=par[r]
    while par[x]!=r: par[x],x=r,par[x]
    return r
W=weld[I]
# vectorised-ish union: iterate edges
import sys; sys.setrecursionlimit(10000)
for a,c in [(0,1),(1,2)]:
    for u,v in zip(W[:,a],W[:,c]):
        ru,rv=find(u),find(v)
        if ru!=rv: par[ru]=rv
root=np.array([find(x) for x in range(len(par))]); comp=root[W[:,0]]
uc,ci=np.unique(comp,return_inverse=True); print('components',len(uc))
cent=P[I].mean(1); cnt=np.bincount(ci); cx=np.bincount(ci,cent[:,0])/cnt; cy=np.bincount(ci,cent[:,1])/cnt
# 2 rows x 5 columns: centres from the layout
rowY=[.29,.1]; colX=[-.39,-.2,0,.2,.39]
# refine column centres per row with k-means on big components
cell=np.zeros(len(uc),int)
for k in range(len(uc)):
    r=0 if cy[k]>.195 else 1; c=int(np.argmin([abs(cx[k]-x) for x in colX])); cell[k]=r*5+c
tc=cell[ci]
for h in range(10): print(h,(tc==h).sum())
np.save('tricell.npy',tc)
# write glb: 10 nodes/meshes, basecolor only
img=j['images'][1]; bv=j['bufferViews'][img['bufferView']]; tex=Image.open(io.BytesIO(bin_[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']])).convert('RGB'); o=io.BytesIO(); tex.save(o,'JPEG',quality=88); texb=o.getvalue()
NAMES=["hat_crown","hat_guanmao","hat_douli","hat_peach","hat_catbell","hat_tiger","hat_witch","hat_jasmine","hat_fu","hat_fox"]
blob=bytearray(); views=[]; accs=[]; meshes=[]; nodes=[]
def add(arr,target=None):
    while len(blob)%4: blob.append(0)
    off=len(blob); blob.extend(arr.tobytes()); v={'buffer':0,'byteOffset':off,'byteLength':arr.nbytes}
    if target: v['target']=target
    views.append(v); return len(views)-1
for h in range(10):
    tri=I[tc==h]; used,inv=np.unique(tri.ravel(),return_inverse=True); idx=inv.reshape(-1,3).astype(np.uint32)
    pp=P[used].astype(np.float32); c=np.array([(pp[:,0].min()+pp[:,0].max())/2,pp[:,1].min(),(pp[:,2].min()+pp[:,2].max())/2],np.float32); pp=pp-c
    a0=len(accs); accs.append({'bufferView':add(pp,34962),'componentType':5126,'count':len(pp),'type':'VEC3','min':pp.min(0).tolist(),'max':pp.max(0).tolist()})
    accs.append({'bufferView':add(N[used].astype(np.float32),34962),'componentType':5126,'count':len(pp),'type':'VEC3'})
    accs.append({'bufferView':add(UV[used].astype(np.float32),34962),'componentType':5126,'count':len(pp),'type':'VEC2'})
    accs.append({'bufferView':add(idx.ravel(),34963),'componentType':5125,'count':idx.size,'type':'SCALAR'})
    meshes.append({'name':NAMES[h],'primitives':[{'attributes':{'POSITION':a0,'NORMAL':a0+1,'TEXCOORD_0':a0+2},'indices':a0+3,'material':0}]})
    nodes.append({'name':NAMES[h],'mesh':h,'translation':[float((h%5)*.25-.5),float(.3 if h<5 else 0),0.]})
iv=add(np.frombuffer(texb,np.uint8))
g={'asset':{'version':'2.0'},'scene':0,'scenes':[{'nodes':list(range(10))}],'nodes':nodes,'meshes':meshes,'accessors':accs,'bufferViews':views,
 'buffers':[{'byteLength':0}],'materials':[{'name':'hats','pbrMetallicRoughness':{'baseColorTexture':{'index':0},'metallicFactor':0,'roughnessFactor':.75}}],
 'textures':[{'source':0,'sampler':0}],'samplers':[{'magFilter':9729,'minFilter':9987}],'images':[{'bufferView':iv,'mimeType':'image/jpeg'}]}
while len(blob)%4: blob.append(0)
g['buffers'][0]['byteLength']=len(blob)
js=json.dumps(g).encode()
while len(js)%4: js+=b' '
open('hats_split.glb','wb').write(struct.pack('<III',0x46546C67,2,28+len(js)+len(blob))+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(blob),0x004E4942)+blob)

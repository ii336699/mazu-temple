# gltf(+bin, from gltfpack -cc) -> glb with every image re-encoded as a JPEG of at most MAX px
import json,struct,sys,io
from PIL import Image
src,out,MAX=sys.argv[1],sys.argv[2],int(sys.argv[3]); Q=int(sys.argv[4]) if len(sys.argv)>4 else 85
import os
j=json.load(open(src)); d=os.path.dirname(os.path.abspath(src)); B=open(os.path.join(d,j['buffers'][0]['uri']),'rb').read()
imgviews={im['bufferView']:i for i,im in enumerate(j['images']) if 'bufferView' in im}
# collect chunks referencing buffer 0: (kind, index, offset, length)
refs=[]
for i,bv in enumerate(j['bufferViews']):
    if bv.get('buffer')==0: refs.append(('bv',i,bv.get('byteOffset',0),bv['byteLength']))
    e=bv.get('extensions',{}).get('EXT_meshopt_compression')
    if e and e['buffer']==0: refs.append(('mo',i,e.get('byteOffset',0),e['byteLength']))
refs.sort(key=lambda r:r[2]); nb=bytearray()
for kind,i,off,ln in refs:
    data=B[off:off+ln]
    if kind=='bv' and i in imgviews:
        im=Image.open(io.BytesIO(data)).convert('RGB'); s=min(1,MAX/max(im.size)); im=im.resize((max(1,int(im.size[0]*s)),max(1,int(im.size[1]*s))),Image.LANCZOS)
        o=io.BytesIO(); im.save(o,'JPEG',quality=Q); data=o.getvalue(); j['images'][imgviews[i]]['mimeType']='image/jpeg'
    while len(nb)%4: nb.append(0)
    noff=len(nb); nb+=data
    if kind=='bv': j['bufferViews'][i]['byteOffset']=noff; j['bufferViews'][i]['byteLength']=len(data)
    else: j['bufferViews'][i]['extensions']['EXT_meshopt_compression']['byteOffset']=noff
while len(nb)%4: nb.append(0)
del j['buffers'][0]['uri']; j['buffers'][0]['byteLength']=len(nb)
js=json.dumps(j,separators=(',',':')).encode();
while len(js)%4: js+=b' '
glb=struct.pack('<III',0x46546C67,2,12+8+len(js)+8+len(nb))+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(nb),0x004E4942)+nb
open(out,'wb').write(glb); print(out,len(glb))

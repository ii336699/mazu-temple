import sys,json,struct; sys.path.insert(0,'/root/cat2'); import numpy as np
from meshio import read
d=np.load('/root/cat2/out.npz'); P=d['P'].astype(np.float32); UV=d['UV'].astype(np.float32); J=d['J'].astype(np.uint8); W=d['W'].astype(np.float32); I=d['I'].astype(np.uint32)
# smooth normals over welded positions (duplicated seam corners share them)
key=np.round(P,5); _,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.reshape(-1)
fn=np.cross(P[I[:,1]]-P[I[:,0]],P[I[:,2]]-P[I[:,0]]); acc=np.zeros((inv.max()+1,3))
for k in range(3): np.add.at(acc,inv[I[:,k]],fn)
N=acc[inv]; N/=np.linalg.norm(N,axis=1,keepdims=True)+1e-12; N=N.astype(np.float32)
jo,_=read('/root/cats11/cat_rig.glb')
b=open('/root/cats11/cat_rig.glb','rb').read(); l=struct.unpack('<I',b[12:16])[0]; obin=b[20+l+8:]
sk=jo['skins'][0]; a=jo['accessors'][sk['inverseBindMatrices']]; bv=jo['bufferViews'][a['bufferView']]; ibm=obin[bv.get('byteOffset',0)+a.get('byteOffset',0):][:a['count']*64]
blobs=[P.tobytes(),N.tobytes(),UV.tobytes(),J.tobytes(),W.tobytes(),I.reshape(-1).tobytes(),ibm]
offs=[];o=0;parts=[]
for bl in blobs: offs.append(o); pad=(4-len(bl)%4)%4; parts.append(bl+b'\0'*pad); o+=len(bl)+pad
bin_=b''.join(parts)
mesh_node=[k for k,nd in enumerate(jo['nodes']) if 'mesh' in nd][0]
j={"asset":{"version":"2.0"},"scene":0,"scenes":jo['scenes'],"nodes":jo['nodes'],"skins":[{"joints":sk['joints'],"inverseBindMatrices":6}],
   "meshes":[{"primitives":[{"attributes":{"POSITION":0,"NORMAL":1,"TEXCOORD_0":2,"JOINTS_0":3,"WEIGHTS_0":4},"indices":5,"material":0}]}],
   "materials":[{"pbrMetallicRoughness":{"metallicFactor":0,"roughnessFactor":.9}}],"buffers":[{"byteLength":len(bin_)}],
   "bufferViews":[{"buffer":0,"byteOffset":offs[i],"byteLength":len(blobs[i])} for i in range(7)],
   "accessors":[{"bufferView":0,"componentType":5126,"count":len(P),"type":"VEC3","min":P.min(0).tolist(),"max":P.max(0).tolist()},
     {"bufferView":1,"componentType":5126,"count":len(N),"type":"VEC3"},{"bufferView":2,"componentType":5126,"count":len(UV),"type":"VEC2"},
     {"bufferView":3,"componentType":5121,"count":len(J),"type":"VEC4"},{"bufferView":4,"componentType":5126,"count":len(W),"type":"VEC4"},
     {"bufferView":5,"componentType":5125,"count":I.size,"type":"SCALAR"},{"bufferView":6,"componentType":5126,"count":a['count'],"type":"MAT4"}]}
for nd in j['nodes']:
    if 'mesh' in nd: nd['mesh']=0; nd['skin']=0
js=json.dumps(j).encode(); js+=b' '*((4-len(js)%4)%4)
open('/root/cat2/newrig.glb','wb').write(b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(bin_))+struct.pack('<I',len(js))+b'JSON'+js+struct.pack('<I',len(bin_))+b'BIN\x00'+bin_)
print(len(bin_))

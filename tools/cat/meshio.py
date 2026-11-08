import json,struct,numpy as np
def read(f):
    b=open(f,'rb').read(); l=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+l]); bin_=b[20+l+8:]
    pr=j['meshes'][0]['primitives'][0]
    def acc(i):
        a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]; comp={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
        dt={5126:np.float32,5125:np.uint32,5123:np.uint16,5121:np.uint8}[a['componentType']]
        st=bv.get('byteStride'); n=a['count']; off=bv.get('byteOffset',0)+a.get('byteOffset',0)
        if st and st!=comp*np.dtype(dt).itemsize:
            raw=np.frombuffer(bin_,dtype=np.uint8,count=st*n,offset=off).reshape(n,st)[:,:comp*np.dtype(dt).itemsize]
            return np.frombuffer(raw.tobytes(),dtype=dt).reshape(n,comp)
        return np.frombuffer(bin_,dtype=dt,count=n*comp,offset=off).reshape(n,comp).copy()
    out={k:acc(v) for k,v in pr['attributes'].items()}
    out['idx']=acc(pr['indices']).reshape(-1,3) if 'indices' in pr else np.arange(len(out['POSITION'])).reshape(-1,3)
    return j,out
def write(f,P,N,UV,I):
    P=P.astype(np.float32); N=N.astype(np.float32); UV=UV.astype(np.float32); I=I.astype(np.uint32).reshape(-1)
    blobs=[P.tobytes(),N.tobytes(),UV.tobytes(),I.tobytes()]; offs=[]; o=0
    for bl in blobs: offs.append(o); o+=len(bl); o+=(4-o%4)%4
    bin_=b''.join(bl+b'\0'*((4-len(bl)%4)%4) for bl in blobs)
    j={"asset":{"version":"2.0"},"scene":0,"scenes":[{"nodes":[0]}],"nodes":[{"mesh":0,"name":"cat"}],
       "meshes":[{"primitives":[{"attributes":{"POSITION":0,"NORMAL":1,"TEXCOORD_0":2},"indices":3,"material":0}]}],
       "materials":[{"pbrMetallicRoughness":{"metallicFactor":0,"roughnessFactor":.9}}],
       "buffers":[{"byteLength":len(bin_)}],
       "bufferViews":[{"buffer":0,"byteOffset":offs[i],"byteLength":len(blobs[i])} for i in range(4)],
       "accessors":[{"bufferView":0,"componentType":5126,"count":len(P),"type":"VEC3","min":P.min(0).tolist(),"max":P.max(0).tolist()},
                    {"bufferView":1,"componentType":5126,"count":len(N),"type":"VEC3"},
                    {"bufferView":2,"componentType":5126,"count":len(UV),"type":"VEC2"},
                    {"bufferView":3,"componentType":5125,"count":len(I),"type":"SCALAR"}]}
    js=json.dumps(j).encode(); js+=b' '*((4-len(js)%4)%4)
    open(f,'wb').write(b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(bin_))+struct.pack('<I',len(js))+b'JSON'+js+struct.pack('<I',len(bin_))+b'BIN\x00'+bin_)

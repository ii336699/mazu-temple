import json,struct,io,glob,numpy as np
from PIL import Image
U='/mnt/user-data/uploads/'
IDS="bc85ea6b 5fcf4da9 4792761d f13c08c4 76b8e711 2ac19399 66296d70 62a996ca 09a3650e 867cc374 cd51ac36 36541853 22708481 513bccb7 4b5d0e34 ca3d5b7d fb3f8ac8 67af2bab ffcab3c4 83bd0867 ba20f10e c2da60d7 bfdc3154 bb146390 2fcbf113 9be43502 b802096a b7ea1a01 2696d23b".split()
def load(k):
    f=glob.glob(U+'tripo_convert_'+k+'*.glb')[0]; b=open(f,'rb').read(); n=struct.unpack("<I",b[12:16])[0]; j=json.loads(b[20:20+n]); B=memoryview(b)[20+n+8:]
    def acc(i):
        a=j["accessors"][i]; bv=j["bufferViews"][a["bufferView"]]; o=bv.get("byteOffset",0)+a.get("byteOffset",0)
        dt={5126:np.float32,5125:np.uint32,5123:np.uint16}[a["componentType"]]; c={"SCALAR":1,"VEC2":2,"VEC3":3}[a["type"]]
        r=np.frombuffer(B,dtype=dt,count=a["count"]*c,offset=o); return r.reshape(-1,c) if c>1 else r
    pr=j["meshes"][0]["primitives"][0]; P=acc(pr["attributes"]["POSITION"]); UV=acc(pr["attributes"]["TEXCOORD_0"]); I=acc(pr["indices"]).reshape(-1,3)
    m=j["materials"][pr["material"]]; ti=m["pbrMetallicRoughness"]["baseColorTexture"]["index"]; im=j["images"][j["textures"][ti]["source"]]; bv=j["bufferViews"][im["bufferView"]]
    tex=Image.open(io.BytesIO(bytes(B[bv.get("byteOffset",0):bv.get("byteOffset",0)+bv["byteLength"]]))).convert("RGB")
    node=j["nodes"][0]
    return P,UV,I,tex,j

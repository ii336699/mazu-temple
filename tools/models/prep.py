import json,struct,sys,io
from PIL import Image
src,dst,size,q=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
b=open(src,"rb").read(); jl=struct.unpack("<I",b[12:16])[0]; j=json.loads(b[20:20+jl]); bo=20+jl; bl=struct.unpack("<I",b[bo:bo+4])[0]; B=b[bo+8:bo+8+bl]
for m in j["materials"]:
    for k in ["normalTexture","occlusionTexture","emissiveTexture"]: m.pop(k,None)
    pb=m.setdefault("pbrMetallicRoughness",{}); pb.pop("metallicRoughnessTexture",None); pb["metallicFactor"]=0; pb["roughnessFactor"]=.8
used={j["textures"][m["pbrMetallicRoughness"]["baseColorTexture"]["index"]]["source"] for m in j["materials"] if "baseColorTexture" in m["pbrMetallicRoughness"]}
imgv={j["images"][i]["bufferView"]:i for i in range(len(j["images"]))}
out=bytearray(); nvs=[]
for i,v in enumerate(j["bufferViews"]):
    d=B[v.get("byteOffset",0):v.get("byteOffset",0)+v["byteLength"]]
    if i in imgv:
        if imgv[i] in used:
            im=Image.open(io.BytesIO(d)).convert("RGB")
            if max(im.size)>size: im=im.resize((size,size*im.size[1]//im.size[0]),Image.LANCZOS)
            bb=io.BytesIO(); im.save(bb,"JPEG",quality=q,optimize=True); d=bb.getvalue()
        else: d=b"\0"*4
    while len(out)%4: out.append(0)
    nv=dict(v); nv["byteOffset"]=len(out); nv["byteLength"]=len(d); out+=d; nvs.append(nv)
while len(out)%4: out.append(0)
j["bufferViews"]=nvs; j["buffers"][0]["byteLength"]=len(out)
for im in j["images"]: im["mimeType"]="image/jpeg"
js=json.dumps(j,separators=(",",":")).encode(); js+=b" "*((4-len(js)%4)%4)
open(dst,"wb").write(struct.pack("<III",0x46546C67,2,28+len(js)+len(out))+struct.pack("<II",len(js),0x4E4F534A)+js+struct.pack("<II",len(out),0x004E4942)+out)

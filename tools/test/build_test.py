import os
SP=os.environ.get("MZ_WORK",os.path.expanduser("~/mz-work"))  # working folder: test/ (artifact files) and hook/ (local server) are written here
import sys; s=open(sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),"../../public/index.html"),encoding="utf-8").read(); m=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"mock.js"),encoding="utf-8").read(); import time as _t; m=m.replace("🧪 單機測試版","🧪 單機測試版 "+_t.strftime("%m/%d %H:%M",_t.gmtime(_t.time()+8*3600)))
a='<meta charset="utf-8">\n'; assert s.count(a)==1
s=s.replace(a,a+m).replace("<title>線上媽祖廟</title>","<title>線上媽祖廟 測試版</title>",1)
open(SP+"/test/index.html","w",encoding="utf-8").write(s)
k="const keys=new Set(); const MOVE_KEYS="; assert s.count(k)==1
h=s.replace(k,open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"hooks.js"),encoding="utf-8").read().replace("\n"," ")+k)
open(SP+"/hook/index.html","w",encoding="utf-8").write(h); print("built")

# stall pictures bundled for the preview host
import os, base64, json
_d=os.path.join(os.path.dirname(os.path.abspath(__file__)),"../../public/nm"); _p={f[:-5]:"data:image/webp;base64,"+base64.b64encode(open(os.path.join(_d,f),"rb").read()).decode() for f in sorted(os.listdir(_d)) if f.endswith(".webp")}
open(SP+"/test/nm-pack.js","w").write("window.NM_PACK="+json.dumps(_p)+";")

# preview host: everything the night market needs is put inside the page itself (later downloads don't arrive there)
_h=open(SP+"/test/index.html",encoding="utf-8").read()
_inl="<script>"+open(SP+"/test/nm-pack.js").read()+"</script>"
_h=_h.replace("</head>",_inl+"</head>",1); open(SP+"/test/index.html","w",encoding="utf-8").write(_h)

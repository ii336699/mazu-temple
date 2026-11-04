# Test page (claude.ai artifact) can't fetch .glb files, so each model also ships as NAME-model.js: window.GLB_NAME="base64…"
# usage: python3 make_model_js.py OUT_DIR   (reads ../../public/*.glb)
import os,sys,base64,glob
here=os.path.dirname(os.path.abspath(__file__)); out=sys.argv[1]; os.makedirs(out,exist_ok=True)
for f in sorted(glob.glob(os.path.join(here,"../../public/*.glb"))):
    n=os.path.basename(f)[:-4]; key="GLB_"+n.upper().replace("-","_")
    open(os.path.join(out,n+"-model.js"),"w").write(f'window.{key}="{base64.b64encode(open(f,"rb").read()).decode()}";')
print("done")

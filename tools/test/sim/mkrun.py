# Build a local copy of the game for headless tests: public/* + mock server + test hooks + local three.js libs, into $MZ_SIM (default ~/mz-sim).
# usage: python3 tools/test/sim/mkrun.py [out.html]   (default index.html; use before.html for an "old" copy to compare against)
import os,sys,shutil
REPO=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','..')); SIM=os.environ.get('MZ_SIM',os.path.expanduser('~/mz-sim')); os.makedirs(SIM,exist_ok=True)
for f in os.listdir(os.path.join(REPO,'public')):
    src=os.path.join(REPO,'public',f)
    if os.path.isfile(src) and f!='index.html': shutil.copy2(src,os.path.join(SIM,f))
    elif os.path.isdir(src): shutil.copytree(src,os.path.join(SIM,f),dirs_exist_ok=True)
for f in os.listdir(os.path.join(os.path.dirname(__file__),'lib')): shutil.copy2(os.path.join(os.path.dirname(__file__),'lib',f),os.path.join(SIM,f))
src=sys.argv[2] if len(sys.argv)>2 else os.path.join(REPO,'public','index.html')
s=open(src,encoding='utf-8').read(); m=open(os.path.join(REPO,'tools/test/mock.js'),encoding='utf-8').read()
s=s.replace('<meta charset="utf-8">\n','<meta charset="utf-8">\n'+m,1)
hooks=open(os.path.join(REPO,'tools/test/hooks.js'),encoding='utf-8').read().replace('\n',' ')
k="const keys=new Set(); const MOVE_KEYS="; s=s.replace(k,hooks+k)
for a,b in [('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','three.min.js'),('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','GLTFLoader.js'),('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/meshopt_decoder.js','meshopt_decoder.js'),('https://cdn.jsdelivr.net/npm/pinyin-pro@3.26.0/dist/index.js','pinyin.js')]: s=s.replace(a,b)
s=s.replace('<link rel="stylesheet" href="https://fonts.googleapis.com','<link rel="x" href="https://fonts.googleapis.com')
out=sys.argv[1] if len(sys.argv)>1 else 'index.html'; open(os.path.join(SIM,out),'w',encoding='utf-8').write(s); print(os.path.join(SIM,out))

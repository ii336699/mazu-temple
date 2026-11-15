# Builds the whole test page (claude.ai artifact) folder in one go.
#   MZ_WORK=<folder> python3 tools/test/publish_prep.py
# Writes <folder>/test/ : index.html + every file the page needs, kept under the artifact's 511-file limit, and
# <folder>/test-files.txt : the list of paths (relative to <folder>/test) to put in the artifact's `files`.
# Why the packs: the artifact host does not serve .glb or .m4a and holds at most 511 files, so
#   - every public/*.glb becomes NAME-model.js (window.GLB_NAME = base64), as make_model_js.py does;
#   - room/f/*.glb (furniture) become one room/f/pack-<kind>.wasm per kind (4-byte length + JSON index + the glbs);
#   - busk/*.m4a are copied as .mp4 and the page's ".m4a" become ".mp4";
#   - fish icons go into fish-pack.js (window.FISH_PACK, keyed "<id>" / "<id>-d");
#   - nm/ pictures are already inside the page (build_test.py puts NM_PACK in it), so the files are left out;
#   - a set of picture folders go into img-pack.js (window.IMG_PACK, keyed by path). The page asks IMG_PACK first through MZIMG(),
#     and on the test page only, Image().src is also routed through IMG_PACK (loaded first, in <head>), so pictures loaded
#     by three.js or by new Image() are found there too. Pictures written straight into HTML (<img src=…>) are NOT routed, so
#     only folders loaded from script are packed.
import os, sys, glob, json, base64, shutil, struct, subprocess, re
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.normpath(os.path.join(here, "../.."))
pub = os.path.join(root, "public"); W = os.environ.get("MZ_WORK", os.path.expanduser("~/mz-work")); T = os.path.join(W, "test")
shutil.rmtree(T, ignore_errors=True); os.makedirs(T); os.makedirs(os.path.join(W, "hook"), exist_ok=True)
subprocess.run([sys.executable, os.path.join(here, "build_test.py")], check=True, env=dict(os.environ, MZ_WORK=W))
PACK_DIRS = ["flw", "garden", "congee", "face", "paperph", "ads", "catcoat", "doors"]
PACK_FILES = ["herbs/table.webp", "signs/congee-h.webp"]
def b64(p, mime): return f"data:{mime};base64," + base64.b64encode(open(p, "rb").read()).decode()
mime = lambda p: {"webp": "image/webp", "png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg"}.get(p.rsplit(".", 1)[-1].lower())
img = {}
for d in PACK_DIRS:
    for p in sorted(glob.glob(os.path.join(pub, d, "**", "*"), recursive=True)):
        if os.path.isfile(p) and mime(p): img[os.path.relpath(p, pub)] = b64(p, mime(p))
for f in PACK_FILES: img[f] = b64(os.path.join(pub, f), mime(f))
open(os.path.join(T, "img-pack.js"), "w").write("window.IMG_PACK=" + json.dumps(img) + ";")
fish = {os.path.basename(p)[:-5]: b64(p, "image/webp") for p in sorted(glob.glob(os.path.join(pub, "fish", "*.webp")))}
open(os.path.join(T, "fish-pack.js"), "w").write("window.FISH_PACK=" + json.dumps(fish) + ";")
skip_dirs = set(PACK_DIRS) | {"fish", "nm"}
for p in sorted(glob.glob(os.path.join(pub, "**", "*"), recursive=True)):
    if not os.path.isfile(p): continue
    r = os.path.relpath(p, pub)
    if r == "index.html" or r.endswith(".glb") or r.split("/")[0] in skip_dirs or r in PACK_FILES or r == "room/f/catalog.json": continue
    dst = os.path.join(T, r[:-4] + ".mp4" if r.endswith(".m4a") else r); os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy(p, dst)
for p in sorted(glob.glob(os.path.join(pub, "*.glb"))):
    n = os.path.basename(p)[:-4]; open(os.path.join(T, n + "-model.js"), "w").write(f'window.GLB_{n.upper().replace("-", "_")}="{base64.b64encode(open(p, "rb").read()).decode()}";')
fd = os.path.join(pub, "room", "f")
if os.path.isdir(fd):
    kinds = sorted({re.sub(r"\d+$", "", os.path.basename(p)[:-4]) for p in glob.glob(os.path.join(fd, "*.glb"))})
    for k in kinds:
        idx, data = {}, b""
        for p in sorted(glob.glob(os.path.join(fd, k + "[0-9]*.glb"))):
            b = open(p, "rb").read(); idx[os.path.basename(p)[:-4]] = [len(data), len(b)]; data += b
        h = json.dumps(idx).encode(); open(os.path.join(T, "room", "f", "pack-" + k + ".wasm"), "wb").write(struct.pack("<I", len(h)) + h + data)
# the page: .m4a → .mp4, furniture from the packs, and the packs loaded in <head> (img-pack first, before anything asks for a picture)
ip = os.path.join(T, "index.html"); s = open(ip, encoding="utf-8").read()
s = s.replace(".m4a", ".mp4").replace("if(window.MZ_FPACK){", "if(1){")
route = ("<script>(function(){var d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',"
         "{get:function(){return d.get.call(this);},set:function(v){var k=String(v).replace(/^\\.\\//,'');d.set.call(this,(window.IMG_PACK&&window.IMG_PACK[k])||v);},configurable:true});})();</script>")
s = s.replace("</head>", '<script src="img-pack.js"></script>' + route + '<script src="fish-pack.js" async></script></head>', 1)
open(ip, "w", encoding="utf-8").write(s)
files = sorted(os.path.relpath(p, T) for p in glob.glob(os.path.join(T, "**", "*"), recursive=True) if os.path.isfile(p) and os.path.relpath(p, T) != "index.html")
open(os.path.join(W, "test-files.txt"), "w").write("\n".join(files) + "\n")
tot = sum(os.path.getsize(os.path.join(T, f)) for f in files)
print(f"{len(files)} files besides index.html, {tot/1e6:.1f} MB; img-pack {os.path.getsize(os.path.join(T,'img-pack.js'))/1e6:.1f} MB")

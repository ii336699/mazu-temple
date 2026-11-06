# Headless test runner: python3 tools/test/sim/run.py <script.py> [wait_seconds=40] [arg] [page=index.html]
# The script is exec'd with: pg (Playwright page), E(js) -> evaluates in the game (window.__ev), S (screenshot folder = $MZ_SIM/shots), time, sys.
# Headless runs at ~1 fps: be generous with sleeps; fireworks tests step fwUpdate by hand (see examples/t_s3.py).
import os,time,threading,http.server,functools,sys
from playwright.sync_api import sync_playwright
SIM=os.environ.get('MZ_SIM',os.path.expanduser('~/mz-sim')); S=os.path.join(SIM,'shots'); os.makedirs(S,exist_ok=True)
H=functools.partial(http.server.SimpleHTTPRequestHandler,directory=SIM); H.log_message=lambda *a,**k:None; H.log_request=lambda *a,**k:None
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8780),H); threading.Thread(target=srv.serve_forever,daemon=True).start()
page=sys.argv[4] if len(sys.argv)>4 else 'index.html'
with sync_playwright() as p:
  b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']); pg=b.new_page(viewport={"width":430,"height":860}); errs=[]; pg.add_init_script("window.__errs=[]; window.addEventListener(\"error\",e=>window.__errs.push((e.error&&e.error.stack||e.message).slice(0,500)))")
  pg.on('pageerror',lambda e: errs.append(str(e)[:300])); pg.on('dialog',lambda d:d.accept())
  pg.set_default_timeout(120000); pg.goto('http://127.0.0.1:8780/'+page,wait_until='domcontentloaded'); time.sleep(int(sys.argv[2]) if len(sys.argv)>2 else 40)
  E=lambda c: pg.evaluate('c=>window.__ev(c)',c)
  E('try{ document.querySelectorAll(".code-card,.gift-card").forEach(e=>e.remove()); PROF.shown=true; closeSheet(); const d=document.querySelector("#dlPack"); if(d) d.setAttribute("data-done",""); }catch(e){}')
  exec(open(sys.argv[1]).read())
  print('ERRS',errs[:5]); b.close()
srv.shutdown()

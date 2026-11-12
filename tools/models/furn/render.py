import sys,subprocess,time,base64,io,os
from PIL import Image
from playwright.sync_api import sync_playwright
def render(urls,size=256,yaw=.6,pitch=.42,bg=None,port=8791):
    srv=subprocess.Popen([sys.executable,"-m","http.server",str(port)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,cwd=os.path.dirname(os.path.abspath(__file__))); time.sleep(1); out=[]
    try:
        with sync_playwright() as p:
            b=p.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]); pg=b.new_page(); pg.goto("http://127.0.0.1:%d/view.html"%port); pg.wait_for_function("window.ready===1")
            for u in urls:
                d,t=pg.evaluate("([u,s,y,p,bg])=>window.shot(u,s,y,p,bg)",[u,size,yaw,pitch,bg]); out.append((Image.open(io.BytesIO(base64.b64decode(d.split(",")[1]))).convert("RGBA"),t))
            b.close()
    finally: srv.kill()
    return out
def sheet(urls,path,size=256,cols=8,**kw):
    r=render(urls,size,**kw); rows=(len(r)+cols-1)//cols; o=Image.new("RGB",(cols*size,rows*size),(52,52,56))
    for i,(im,t) in enumerate(r): o.paste(im,((i%cols)*size,(i//cols)*size),im)
    o.save(path); return [t for _,t in r]
if __name__=="__main__":
    print(sheet(sys.argv[2:],sys.argv[1]))

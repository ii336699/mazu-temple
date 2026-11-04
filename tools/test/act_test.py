import asyncio, sys, json
from playwright.async_api import async_playwright
SP=sys.argv[1]; BASE="http://127.0.0.1:8765/"
LOCAL={"three.min.js":SP+"/three/build/three.min.js","GLTFLoader.js":SP+"/three/examples/js/loaders/GLTFLoader.js","meshopt_decoder.js":SP+"/three/examples/js/libs/meshopt_decoder.js"}
async def route(r):
    u=r.request.url
    for k,v in LOCAL.items():
        if u.endswith(k): return await r.fulfill(path=v, content_type="application/javascript")
    if u.startswith(BASE): return await r.continue_()
    return await r.abort()
def ok(c,m): print(("PASS " if c else "FAIL ")+m, flush=True)
HIDE="""(h)=>{ Object.defineProperty(document,'hidden',{configurable:true,get:()=>h}); document.dispatchEvent(new Event('visibilitychange')); }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-angle=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
        pg=await (await b.new_context(viewport={"width":390,"height":760})).new_page(); await pg.context.route("**/*",route); pg.set_default_timeout(120000)
        errs=[]; pg.on("pageerror",lambda e: errs.append(str(e)))
        await pg.goto(BASE,wait_until="domcontentloaded"); await pg.evaluate("localStorage.clear();localStorage.setItem('mz.me',JSON.stringify({name:'測試',look:[0,3,1,0,7,1,0,0,1,0,1,0,0]}));localStorage.setItem('mz.npc','false')")
        await pg.reload(wait_until="domcontentloaded"); await pg.wait_for_timeout(6000)
        sp=await pg.evaluate("[40,80,90,130,153,200,400].map(t=>__act().fakeSplit(t).filter(x=>x>0))"); ok(all(len(x)==1 for x in sp[:2]) and all(v>=86 for x in sp for v in x[:-1]), f"halls fill in order: {sp}")
        await pg.click("#emoBtn"); await pg.wait_for_timeout(600); n=await pg.evaluate("document.querySelectorAll('.act-pick').length"); ok(n==10, f"表情 menu has {n} actions")
        await pg.screenshot(path=SP+"/shots/emo_menu.png"); await pg.click("#sheetClose")
        await pg.add_style_tag(content=".top,.actions,.rot,.joy,.toast,.near-chip,.caption{display:none!important}")
        await pg.evaluate("(()=>{const a=__me(); a.pos.set(0,4); a.target.set(0,4); a.path=[]; a.rotY=Math.PI;})()"); await pg.evaluate("__cam(Math.PI*0.75,0.12,3.0)"); await pg.wait_for_timeout(3000)
        for i,t in [(0,1.2),(3,2.0),(4,1.5),(5,1.3),(6,1.0),(7,1.0),(8,1.1),(9,1.0)]:
            await pg.evaluate(f"(()=>{{ __act().startAct(__me(),{i}); __me().actT={t}; }})()"); await pg.wait_for_timeout(4500)
            await pg.screenshot(path=f"{SP}/shots/act{i}.png",clip={"x":40,"y":160,"width":310,"height":420})
        await pg.evaluate("__act().stopAct(__me())")
        await pg.evaluate("document.querySelector('#emoBtn').click()"); await pg.wait_for_timeout(400); await pg.evaluate("document.querySelector('[data-act=doAct][data-v=\"5\"]').click()"); await pg.wait_for_timeout(5000)
        ok(await pg.evaluate("__me().act")==5 and await pg.evaluate("__act().myAct[0]")==5, "廣場舞 keeps going and is sent to others")
        await pg.keyboard.down("w"); await pg.wait_for_timeout(5000); await pg.keyboard.up("w"); await pg.wait_for_timeout(1500)
        ok(await pg.evaluate("__me().act")==-1 and await pg.evaluate("__act().myAct[0]")==-1, "walking stops it")
        await pg.click("#emoBtn"); await pg.wait_for_timeout(400); await pg.click("[data-act=doAct][data-v='2']"); await pg.wait_for_timeout(12000)
        ok(await pg.evaluate("__me().act")==-1, "開心跳跳 ends by itself")
        ok(not errs, "no page errors "+";".join(errs[:3])); await b.close()
asyncio.run(main())

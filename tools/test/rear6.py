import asyncio,sys
exec(open("act_test.py").read().split("async def main")[0])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-angle=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
        pg=await (await b.new_context(viewport={"width":900,"height":650})).new_page(); await pg.context.route("**/*",route); pg.set_default_timeout(120000)
        errs=[]; pg.on("pageerror",lambda e: errs.append(str(e)[:300]))
        await pg.goto(BASE,wait_until="domcontentloaded"); await pg.evaluate("localStorage.clear();localStorage.setItem('mz.me',JSON.stringify({name:'測試',look:[0,3,1,0,7,1,0,0,1,0,1,0,0]}));localStorage.setItem('mz.npc','false')")
        await pg.reload(wait_until="domcontentloaded"); await pg.wait_for_timeout(8000)
        for k in ["caishen","yuelao","wenchang","tudi","doumu","dizang","guanyin"]:
            await pg.evaluate("(()=>{const a=__me(); a.pos.set(-5.4,18.9); a.target.set(-5.4,18.9); a.path=[];})()")
            await pg.evaluate(f"__go('{k}')"); await pg.wait_for_timeout(300)
            pts=await pg.evaluate("(()=>{const a=__me(); return [[+a.target.x.toFixed(1),+a.target.y.toFixed(1)],...(a.path||[]).map(p=>Array.isArray(p)?p.map(v=>+(+v).toFixed(1)):[+p.x.toFixed(1),+p.y.toFixed(1)])]})()")
            print(k, pts)
        print(errs[:3]); await b.close()
asyncio.run(main())

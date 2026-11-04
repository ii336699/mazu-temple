import asyncio,sys
exec(open("act_test.py").read().split("async def main")[0])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-angle=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
        pg=await (await b.new_context(viewport={"width":900,"height":650})).new_page(); await pg.context.route("**/*",route); pg.set_default_timeout(120000)
        await pg.goto(BASE,wait_until="domcontentloaded"); await pg.evaluate("localStorage.clear();localStorage.setItem('mz.me',JSON.stringify({name:'測試',look:[0,3,1,0,7,1,0,0,1,0,1,0,0]}));localStorage.setItem('mz.npc','false')")
        await pg.reload(wait_until="domcontentloaded"); await pg.wait_for_timeout(40000)
        await pg.add_style_tag(content=".top,.actions,.rot,.joy,.toast,.near-chip,.caption{display:none!important}")
        await pg.evaluate("(()=>{ const M=__mz; const r=M.renderer; const R0=r.render.bind(r); window.__CP=[0,18,45,0,10,10]; r.render=(s,c)=>{ const P=window.__CP; M.camera.position.set(P[0],P[1],P[2]); M.camera.up.set(0,1,0); M.camera.lookAt(P[3],P[4],P[5]); M.camera.updateMatrixWorld(); R0(s,c); }; })()")
        for sh in sys.argv[2:]:
            name,*v=sh.split(","); await pg.evaluate(f"window.__CP=[{','.join(v)}]"); await pg.wait_for_timeout(5000); await pg.screenshot(path=f"shots/{name}.png")
        await b.close()
asyncio.run(main())

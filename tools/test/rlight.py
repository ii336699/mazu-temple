import asyncio,sys,json
exec(open("act_test.py").read().split("async def main")[0])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-angle=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
        pg=await (await b.new_context(viewport={"width":900,"height":650})).new_page(); await pg.context.route("**/*",route); pg.set_default_timeout(180000)
        errs=[]; pg.on("pageerror",lambda e: errs.append(str(e)[:300]))
        await pg.goto(BASE,wait_until="domcontentloaded"); await pg.evaluate("localStorage.clear();localStorage.setItem('mz.me',JSON.stringify({name:'測試',look:[0,3,1,0,7,1,0,0,1,0,1,0,0]}));localStorage.setItem('mz.npc','false')")
        await pg.reload(wait_until="domcontentloaded"); await pg.wait_for_timeout(40000)
        await pg.add_style_tag(content=".top,.actions,.rot,.joy,.toast,.near-chip,.caption{display:none!important}")
        for name,x,z in [("yard",9,-22),("doumu",16.7,-37)]:
            await pg.evaluate(f"(()=>{{const a=__me(); a.pos.set({x},{z}); a.target.set({x},{z}); a.path=[];}})()"); await pg.wait_for_timeout(30000)
            print(await pg.evaluate("__ptdbg()"))
            print(await pg.evaluate("JSON.stringify({spots:__lp().spots.map(s=>[s.tag||'',s.p.x.toFixed(1),s.p.z.toFixed(1)]), lights:__lp().lights.map(l=>[l.position.x.toFixed(1),l.position.z.toFixed(1),l.intensity.toFixed(2),(l.userData.goal||0)])})"))
            print(name, await pg.evaluate("(()=>__me().pos.x.toFixed(1)+','+__me().pos.y.toFixed(1))()"), await pg.evaluate("(()=>{ const L=[]; __scene().traverse(o=>{ if(o.isPointLight&&o.intensity>.05) L.push([o.position.x.toFixed(1),o.position.z.toFixed(1),o.intensity.toFixed(2)]); }); return JSON.stringify(L); })()"))
        await pg.evaluate("(()=>{ const M=__mz; const r=M.renderer; const R0=r.render.bind(r); r.render=(s,c)=>{ M.camera.position.set(16.7,2.2,-29.5); M.camera.lookAt(16.7,1.8,-40); M.camera.updateMatrixWorld(); R0(s,c); }; })()")
        await pg.evaluate("(()=>{const a=__me(); a.pos.set(12,-22); a.target.set(12,-22); a.path=[];})()"); await pg.wait_for_timeout(9000)
        await pg.screenshot(path="shots/doumu_lit.png"); print(errs[:3]); await b.close()
asyncio.run(main())

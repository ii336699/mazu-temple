import asyncio,sys,json
exec(open("act_test.py").read().split("async def main")[0])
TIME=r"""(()=>{ const M=__mz,R=M.renderer,sc=__scene(),cam=M.camera,gl=R.getContext(); const P=window.__CP; cam.position.set(P[0],P[1],P[2]); cam.lookAt(P[3],P[4],P[5]); cam.updateMatrixWorld();
 for(let i=0;i<3;i++){ R.render(sc,cam); } gl.finish(); const t=performance.now(); for(let i=0;i<8;i++){ R.render(sc,cam); gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4)); } return +((performance.now()-t)/8).toFixed(1); })()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-angle=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
        pg=await (await b.new_context(viewport={"width":390,"height":760},device_scale_factor=3,is_mobile=True,has_touch=True)).new_page(); await pg.context.route("**/*",route); pg.set_default_timeout(240000)
        await pg.goto(BASE,wait_until="domcontentloaded"); await pg.evaluate("localStorage.clear();localStorage.setItem('mz.me',JSON.stringify({name:'測試',look:[0,3,1,0,7,1,0,0,1,0,1,0,0]}))")
        await pg.reload(wait_until="domcontentloaded"); await pg.wait_for_timeout(60000)
        await pg.evaluate("__night(); window.requestAnimationFrame=()=>0;")  # freeze the game loop so only our timed renders run
        await pg.wait_for_timeout(1500)
        for name,cp in [("plaza",[0,4,33,0,3,10]),("hall",[0,2.4,8,0,2.5,-14])]:
            await pg.evaluate(f"window.__CP={cp}")
            base=await pg.evaluate(TIME)
            n=await pg.evaluate("(()=>{ let n=0; __scene().traverse(o=>{ if((o.isPointLight||o.isSpotLight)&&o.visible) n++; }); return n; })()")
            await pg.evaluate("window.__off=[]; __scene().traverse(o=>{ if((o.isPointLight||o.isSpotLight)&&o.visible&&!__lp().lights.includes(o)){ o.visible=false; window.__off.push(o); } })")
            pooled=await pg.evaluate(TIME)
            await pg.evaluate("window.__off.forEach(o=>o.visible=true)")
            again=await pg.evaluate(TIME)
            print(name,{"visibleLights":n,"ms_all":base,"ms_poolOnly3":pooled,"ms_all_again":again})
        await b.close()
asyncio.run(main())

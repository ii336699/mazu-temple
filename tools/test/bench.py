import asyncio,sys,json
exec(open("act_test.py").read().split("async def main")[0])
TAG=sys.argv[2] if len(sys.argv)>2 else "run"
SCN=[("plaza",(0,24),(0,4,33),(0,3,10)),("crowd_wide",(0,22),(7,9,42),(0,1,16)),("hall",(0,4),(0,2.4,8),(0,2.5,-14)),("mazu_close",(0,-8),(0,2.2,-7.5),(0,2.6,-14)),("rear",(9,-22),(0,3.2,-17),(0,3,-40))]
MEAS=r"""new Promise(res=>{ const M=__mz, R=M.renderer, sc=__scene(); const r0=R.render.bind(R); let rt=0,n=0,calls=0,tris=0; const P=window.__CP;
 R.render=(s,c)=>{ c.position.set(P[0],P[1],P[2]); c.lookAt(P[3],P[4],P[5]); c.updateMatrixWorld(); const t=performance.now(); r0(s,c); rt+=performance.now()-t; n++; calls+=R.info.render.calls; tris+=R.info.render.triangles; };
 const raf0=window.requestAnimationFrame; let tot=0,fr=0, t0=performance.now(); window.requestAnimationFrame=cb=>raf0(ts=>{ const t=performance.now(); cb(ts); tot+=performance.now()-t; fr++; });
 const h0=performance.memory?performance.memory.usedJSHeapSize:0; let gcDrops=0, last=h0; const iv=setInterval(()=>{ const h=performance.memory?performance.memory.usedJSHeapSize:0; if(h<last-2e5) gcDrops++; last=h; },100);
 setTimeout(()=>{ clearInterval(iv); window.requestAnimationFrame=raf0; R.render=(s,c)=>{ const P=window.__CP; c.position.set(P[0],P[1],P[2]); c.lookAt(P[3],P[4],P[5]); c.updateMatrixWorld(); r0(s,c); };
  let L=0; sc.traverse(o=>{ if((o.isPointLight||o.isSpotLight)&&o.intensity>0.02&&o.visible){ let v=true,q=o; while(q){ if(!q.visible){v=false;break;} q=q.parent; } if(v) L++; } });
  const secs=(performance.now()-t0)/1000;
  res(JSON.stringify({fps:+(fr/secs).toFixed(1),jsMs:+((tot-rt)/fr).toFixed(2),renderCpuMs:+(rt/n).toFixed(2),calls:Math.round(calls/n),tris:Math.round(tris/n),lights:L,dpr:R.getPixelRatio(),geos:R.info.memory.geometries,texs:R.info.memory.textures,progs:R.info.programs.length,heapMB:+((performance.memory?performance.memory.usedJSHeapSize:0)/1e6).toFixed(1),gc:gcDrops,bots:__bots().npcs.length})); },10000); })"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-angle=swiftshader","--enable-unsafe-swiftshader","--no-sandbox","--enable-precise-memory-info"])
        pg=await (await b.new_context(viewport={"width":390,"height":760},device_scale_factor=3,is_mobile=True,has_touch=True)).new_page(); await pg.context.route("**/*",route); pg.set_default_timeout(240000)
        errs=[]; pg.on("pageerror",lambda e: errs.append(str(e)[:300]))
        await pg.goto(BASE,wait_until="domcontentloaded"); await pg.evaluate("localStorage.clear();localStorage.setItem('mz.me',JSON.stringify({name:'測試',look:[0,3,1,0,7,1,0,0,1,0,1,0,0]}))")
        await pg.reload(wait_until="domcontentloaded"); await pg.wait_for_timeout(60000)
        await pg.evaluate("__night(); window.__CP=[0,4,33,0,3,10]; (()=>{ const R=__mz.renderer, r0=R.render.bind(R); R.render=(s,c)=>{ const P=window.__CP; c.position.set(P[0],P[1],P[2]); c.lookAt(P[3],P[4],P[5]); c.updateMatrixWorld(); r0(s,c); }; })()")
        out={}
        for name,(px,pz),cp,lk in SCN:
            await pg.evaluate(f"(()=>{{const a=__me(); a.pos.set({px},{pz}); a.target.set({px},{pz}); a.path=[]; window.__CP=[{cp[0]},{cp[1]},{cp[2]},{lk[0]},{lk[1]},{lk[2]}];}})()"); await pg.wait_for_timeout(15000)
            r=json.loads(await pg.evaluate(MEAS)); out[name]=r; print(name,json.dumps(r)); await pg.screenshot(path=f"shots/bench_{TAG}_{name}.png")
        json.dump(out,open(f"bench_{TAG}.json","w"),indent=1); print("errs",errs[:3]); await b.close()
asyncio.run(main())

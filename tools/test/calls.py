import asyncio,sys,json
exec(open("act_test.py").read().split("async def main")[0])
JS=r"""(()=>{ const sc=__scene(), cam=__mz.camera, T=window.THREE; const P=window.__CP; cam.position.set(P[0],P[1],P[2]); cam.lookAt(P[3],P[4],P[5]); cam.updateMatrixWorld(); sc.updateMatrixWorld(true);
 const fr=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse)), sph=new T.Sphere();
 const vis=o=>{ for(let q=o;q;q=q.parent) if(!q.visible) return false; return true; }; const cat={people:0,scenery_merged:0,statues_models:0,glow_sprites:0,other:0}; let people=0;
 sc.traverse(o=>{ if(!(o.isMesh||o.isSprite||o.isPoints||o.isLine)||!vis(o)) return; if(o.frustumCulled!==false&&o.geometry){ if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); sph.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); if(!fr.intersectsSphere(sph)) return; }
   let av=false; for(let q=o;q;q=q.parent) if(q.userData&&q.userData.isAvatar){ av=true; break; }
   const n=Array.isArray(o.material)?o.material.length:1;
   if(av) cat.people+=n; else if(o.isSprite) cat.glow_sprites+=n; else if(o.matrixAutoUpdate===false&&o.raycast&&String(o.raycast).length<12) cat.scenery_merged+=n; else if(/tripo|mesh_|Scene/.test((o.name||"")+(o.parent&&o.parent.name||""))) cat.statues_models+=n; else cat.other+=n; });
 sc.traverse(o=>{ if(o.userData&&o.userData.isAvatar&&vis(o)) people++; });
 return JSON.stringify({cat,peopleVisibleInScene:people}); })()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-angle=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
        pg=await (await b.new_context(viewport={"width":390,"height":760},device_scale_factor=3,is_mobile=True,has_touch=True)).new_page(); await pg.context.route("**/*",route); pg.set_default_timeout(240000)
        await pg.goto(BASE,wait_until="domcontentloaded"); await pg.evaluate("localStorage.clear();localStorage.setItem('mz.me',JSON.stringify({name:'測試',look:[0,3,1,0,7,1,0,0,1,0,1,0,0]}))")
        await pg.reload(wait_until="domcontentloaded"); await pg.wait_for_timeout(60000)
        for name,cp in [("plaza",[0,4,33,0,3,10]),("hall",[0,2.4,8,0,2.5,-14])]:
            await pg.evaluate(f"window.__CP={cp}"); print(name, await pg.evaluate(JS))
        await b.close()
asyncio.run(main())

import asyncio,sys,json
exec(open("act_test.py").read().split("async def main")[0])
JS=r"""(()=>{ const scene=__scene(); scene.updateMatrixWorld(true); const tris=[]; const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3();
 let mid=0; scene.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh) return; let v=true; let q=o; while(q){ if(!q.visible||(q.userData&&q.userData.isAvatar)) {v=false;break;} q=q.parent; } if(!v) return;
   const g=o.geometry, P=g.attributes.position; if(!P||P.count>60000) return; const I=g.index; const N=I?I.count/3:P.count/3; const mats=Array.isArray(o.material)?o.material:[o.material];
   const mm=mats[0]; const col=(mm&&mm.color?'#'+mm.color.getHexString():'')+(mm&&mm.map?'+map':'')+(mm&&mm.side===2?'+DS':''); mid++;
   for(let t=0;t<N;t++){ const i0=I?I.getX(t*3):t*3, i1=I?I.getX(t*3+1):t*3+1, i2=I?I.getX(t*3+2):t*3+2;
     a.fromBufferAttribute(P,i0).applyMatrix4(o.matrixWorld); b.fromBufferAttribute(P,i1).applyMatrix4(o.matrixWorld); c.fromBufferAttribute(P,i2).applyMatrix4(o.matrixWorld);
     e1.subVectors(b,a); e2.subVectors(c,a); n.crossVectors(e1,e2); const ar=n.length()/2; if(ar<.02) continue; n.normalize();
     tris.push({n:[n.x,n.y,n.z],d:n.dot(a),v:[a.toArray(),b.toArray(),c.toArray()],m:mid,col,nm:o.name||o.type}); } });
 const key=t=>{ let [x,y,z]=t.n, d=t.d; if(x<-1e-6||(Math.abs(x)<1e-6&&(y<-1e-6||(Math.abs(y)<1e-6&&z<0)))){ x=-x;y=-y;z=-z;d=-d; } t.cn=[x,y,z]; t.cd=d; t.flip=(t.n[0]!==x||t.n[1]!==y||t.n[2]!==z); return Math.round(x*50)+','+Math.round(y*50)+','+Math.round(z*50); };
 const B=new Map(); tris.forEach(t=>{ const k=key(t)+'|'+Math.round(t.cd/.02); (B.get(k)||B.set(k,[]).get(k)).push(t); });
 const hits=[]; const seen=new Set();
 B.forEach((L,k)=>{ const [nk,dk]=k.split('|'); const L2=[...L,...(B.get(nk+'|'+(+dk+1))||[])];
   for(let i=0;i<L.length;i++) for(let j=i+1;j<L2.length;j++){ const A=L[i], C=L2[j]; if(A===C) continue; if(Math.abs(A.cd-C.cd)>.012) continue; if(A.n[0]*C.n[0]+A.n[1]*C.n[1]+A.n[2]*C.n[2]<.99&&!(A.col.includes('+DS')||C.col.includes('+DS'))) continue; if(A.n[1]<-.9&&Math.abs(A.cd)<.06) continue; if(A.m===C.m&&Math.abs(A.cd-C.cd)<1e-5) continue;
     const nn=A.cn; const ax=Math.abs(nn[0])>Math.abs(nn[1])&&Math.abs(nn[0])>Math.abs(nn[2])?0:Math.abs(nn[1])>Math.abs(nn[2])?1:2; const u=(ax+1)%3, w=(ax+2)%3;
     const bb=T=>{ const us=T.v.map(p=>p[u]), ws=T.v.map(p=>p[w]); return [Math.min(...us),Math.max(...us),Math.min(...ws),Math.max(...ws)]; };
     const p=bb(A), q=bb(C); const ov=Math.max(0,Math.min(p[1],q[1])-Math.max(p[0],q[0]))*Math.max(0,Math.min(p[3],q[3])-Math.max(p[2],q[2])); if(ov<.03) continue;
     const cx=(Math.max(p[0],q[0])+Math.min(p[1],q[1]))/2, cw=(Math.max(p[2],q[2])+Math.min(p[3],q[3]))/2; const pos=[0,0,0]; pos[u]=cx; pos[w]=cw; pos[ax]=A.cd*nn[ax];
     const id=pos.map(v=>Math.round(v)).join(',')+A.col+C.col; if(seen.has(id)) continue; seen.add(id);
     hits.push({pos:pos.map(v=>+v.toFixed(2)),dd:+(A.cd-C.cd).toFixed(4),a:A.col+' '+A.nm,b:C.col+' '+C.nm,same:A.flip===C.flip,ov:+ov.toFixed(2)}); } });
 return {tris:tris.length,n:hits.length,hits:hits.slice(0,3000)}; })()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--use-angle=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"])
        pg=await (await b.new_context(viewport={"width":600,"height":400})).new_page(); await pg.context.route("**/*",route); pg.set_default_timeout(300000)
        await pg.goto(BASE,wait_until="domcontentloaded"); await pg.evaluate("localStorage.clear();localStorage.setItem('mz.me',JSON.stringify({name:'測試',look:[0,3,1,0,7,1,0,0,1,0,1,0,0]}));localStorage.setItem('mz.npc','false')")
        await pg.reload(wait_until="domcontentloaded"); await pg.wait_for_timeout(50000)
        r=await pg.evaluate(JS.replace("THREE","(window.THREE)"))
        json.dump(r,open("zscan.json","w"),ensure_ascii=False,indent=0); print(r["tris"],r["n"]); await b.close()
asyncio.run(main())

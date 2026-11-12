/* ======================= 衣漾服飾: try each outfit on your own character, buy, wear ======================= */
let CLOTH=null;
function buildCloth(){ if(CLOTH) return CLOTH; const R=new T.Scene(); R.environment=scene.environment; const D={R};
  R.background=cvs(64,256,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,"#3a2436"); g.addColorStop(.6,"#6a3c4a"); g.addColorStop(1,"#2a1a22"); x.fillStyle=g; x.fillRect(0,0,w,h); });
  R.add(new T.HemisphereLight("#fff4ea","#4a3038",.55)); const key=new T.SpotLight("#fff1dc",1.6,12,.5,.6); key.position.set(1.6,3.6,3.2); key.target.position.set(0,.7,0); R.add(key); R.add(key.target); const rim=new T.DirectionalLight("#ffc6e0",.6); rim.position.set(-2.5,2,-2); R.add(rim); const fill=new T.DirectionalLight("#ffffff",.35); fill.position.set(-1,1.5,3); R.add(fill);
  const cur=cvs(256,256,(x,w,h)=>{ for(let i=0;i<w;i++){ const v=Math.sin(i/w*Math.PI*12); const l=90+v*35; x.fillStyle=`rgb(${l+60|0},${l*.45|0},${l*.55|0})`; x.fillRect(i,0,1,h); } const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,"rgba(0,0,0,.35)"); g.addColorStop(.3,"rgba(0,0,0,0)"); x.fillStyle=g; x.fillRect(0,0,w,h); });
  cur.wrapS=T.RepeatWrapping; cur.repeat.set(2,1); const back=new T.Mesh(new T.PlaneGeometry(9,5),new T.MeshStandardMaterial({map:cur,roughness:.9})); back.position.set(0,2.2,-2.2); R.add(back);
  const fl=new T.Mesh(new T.CircleGeometry(6,40),new T.MeshStandardMaterial({color:"#5a3a34",roughness:.55})); fl.rotation.x=-Math.PI/2; R.add(fl);
  const pod=new T.Mesh(new T.CylinderGeometry(.62,.68,.16,40),new T.MeshStandardMaterial({color:"#f3e6d2",roughness:.35})); pod.position.y=.08; R.add(pod); const ring=new T.Mesh(new T.TorusGeometry(.65,.015,8,48),GOLD()); ring.rotation.x=Math.PI/2; ring.position.y=.16; R.add(ring);
  for(const s of [-1,1]){ const rack=new T.Group(); rack.position.set(s*2.0,0,-1.2); rack.rotation.y=-s*.5; R.add(rack); box(1.3,.03,.03,GOLD(),0,1.55,0,rack); for(const e of [-1,1]) cyl(.015,.015,1.55,GOLD(),e*.63,.78,0,rack,6);
    for(let i=0;i<6;i++){ const c=["#d84b6a","#2f507b","#f2c230","#3f6c50","#fff4e8","#8e5bc9","#22305c","#b9322b"][(i+(s>0?3:0))%8]; const cl=box(.05,.62,.4,mat(c,{roughness:.8}),-.5+i*.2,1.18,0,rack); cl.rotation.y=Math.PI/2; } }
  const mir=new T.Group(); mir.position.set(-1.25,0,-1.7); R.add(mir); box(.7,1.6,.04,new T.MeshStandardMaterial({color:"#cfe0ea",roughness:.05,metalness:.9}),0,1.0,0,mir); for(const [w,h,x,y] of [[.78,.05,0,1.82],[.78,.05,0,.18],[.05,1.68,-.37,1.0],[.05,1.68,.37,1.0]]) box(w,h,.06,GOLD(),x,y,0,mir);
  D.cam=new T.PerspectiveCamera(30,1,.05,40); CLOTH=D; return D; }
function hiLook(a,l){ a.isMe=true; try{ a.setLook(l); } finally{ a.isMe=false; } }
function clothStart(){ const D=buildCloth(); const o={exposure:1.0}; const el=enterMode("cloth",o); try{ sfx.dingdong(); }catch(e){}
  let i=Math.max(0,STYLEX.findIndex((s,k)=>!styleOwned(STYLEX0+k))); if(isStyleX(me.look[3])) i=me.look[3]-STYLEX0;
  const look=()=>{ const l=me.look.slice(); l[3]=STYLEX0+i; return l; };
  const av=new Avatar(look(),{npc:true,x:0,z:0}); scene.remove(av.root); D.R.add(av.root); hiLook(av,look()); av.root.position.set(0,.16,0); let rot=-.45, spin=0, drag=null; o.sp=setTimeout(()=>{ spin=.3; },2600);
  el.insertAdjacentHTML("beforeend",`<div class="shx-top"><span class="shx-title">👗 衣漾服飾</span><span class="shx-pill" id="cC"></span><button class="shx-x" id="cX">離開</button></div>
    <button class="shx-nav" id="cL" style="left:10px">‹</button><button class="shx-nav" id="cR" style="right:10px">›</button>
    <div class="shx-panel" id="cP"></div>`);
  const $c=s=>el.querySelector(s);
  const draw=()=>{ const v=STYLEX0+i, S=STYLEX[i], own=styleOwned(v), on=me.look[3]===v; $c("#cC").textContent=`💰 ${bag.coins}`;
    $c("#cP").innerHTML=`<div style="display:flex;align-items:baseline;gap:8px"><b style="font-size:20px;color:#ffe2a0">${S.n}</b><span style="margin-left:auto;font-weight:900;color:${own?"#9fe3a8":"#ffd76a"}">${S.price.toLocaleString()} 平安幣${own?(me.sp&&!((bag.clo|0)&(1<<i))?"・主委免費":"・已擁有"):""}</span></div>
      <p style="margin:6px 0 10px;font-size:14px;line-height:1.5;color:#f3e7d0">${S.d}</p><div style="display:flex;gap:6px;justify-content:center;margin-bottom:10px">${STYLEX.map((_,k)=>`<i data-d="${k}" style="width:${k===i?18:8}px;height:8px;border-radius:4px;background:${k===i?"#d9aa3d":styleOwned(STYLEX0+k)?"#9fe3a8":"rgba(255,255,255,.3)"};display:inline-block;cursor:pointer"></i>`).join("")}</div>
      <div style="display:flex;gap:8px">${own?`<button class="shx-btn" style="flex:1" id="cW" ${on?"disabled":""}>${on?"穿著中":"穿上"}</button>`:`<button class="shx-btn" style="flex:1" id="cB">購買・${S.price} 幣</button>`}</div>
      <p style="margin:8px 0 0;font-size:12px;color:#bba">服飾店的衣服有自己的配色。買了以後隨時可以在「換裝」裡換穿。</p>`;
    const b=$c("#cB"); if(b) b.onclick=buy; const w=$c("#cW"); if(w) w.onclick=wear; $c("#cP").querySelectorAll("[data-d]").forEach(d=>d.onclick=()=>{ i=+d.dataset.d; show(); }); };
  const show=()=>{ hiLook(av,look()); rot=-.45; spin=0; clearTimeout(o.sp); o.sp=setTimeout(()=>{ if(!drag) spin=.3; },2600); draw(); try{ tone(700,.05,.05,"triangle"); }catch(e){} };
  const buy=()=>{ const v=STYLEX0+i, S=STYLEX[i]; if(styleOwned(v)) return; if(bag.coins<S.price){ buzz(); toast(`平安幣不夠（還差 ${S.price-bag.coins}），可以去便利商店打工`,3000); return; }
    bag.coins-=S.price; bag.clo=(bag.clo|0)|(1<<i); saveBag(); markDirty(); try{ profSave(true); }catch(e){} statInc("clothBuy"); chaChing(); toast(`買下「${S.n}」！`,2200); wear(); };
  const wear=()=>{ const v=STYLEX0+i; if(!styleOwned(v)) return; me.look[3]=v; save("mz.me",me); try{ draftLook=me.look.slice(); }catch(e){} meAv.setLook(me.look); markDirty(); try{ profSave(true); }catch(e){} try{ [659,880,1175].forEach((f,k)=>tone(f,.15,.07,"triangle",k*.08)); }catch(e){} draw(); };
  $c("#cL").onclick=()=>{ i=(i+STYLEX.length-1)%STYLEX.length; show(); }; $c("#cR").onclick=()=>{ i=(i+1)%STYLEX.length; show(); }; $c("#cX").onclick=()=>leaveMode();
  const tl=el.querySelector(".shx-touch"); tl.addEventListener("pointerdown",e=>{ drag={x:e.clientX,r:rot}; spin=0; }); tl.addEventListener("pointermove",e=>{ if(drag) rot=drag.r+(e.clientX-drag.x)*.012; }); const up=()=>{ if(drag){ drag=null; setTimeout(()=>{ if(!drag) spin=.25; },1500); } }; tl.addEventListener("pointerup",up); tl.addEventListener("pointercancel",up);
  draw(); o.update=dt=>{ rot+=spin*dt; av.root.rotation.y=rot; av.t+=dt; try{ av.hips.position.y=.3+Math.sin(av.t*1.6)*.004; }catch(e){} };
  o.render=dt=>{ const c=D.cam, asp=innerWidth/innerHeight; c.aspect=asp; const ph=(($c("#cP").offsetHeight||200)+60)/innerHeight; const vt=Math.tan(c.fov*Math.PI/360), ht=vt*asp; const d=Math.min(10,Math.max(1.75/(2*vt*Math.max(.3,1-ph)),.75/ht)); const ly=.86-ph*d*vt; c.position.set(0,ly+.3,d); c.lookAt(0,ly,0); c.updateProjectionMatrix(); renderer.render(D.R,c); };
  o.dispose=()=>{ D.R.remove(av.root); }; }
setTimeout(()=>{ try{ buildWorld(); }catch(e){ console.warn("shop street",e); } },1200);
SX.enter=enterMode; SX.leave=leaveMode; /* other screens (我的房間) borrow the shop layer */
return SX; })();

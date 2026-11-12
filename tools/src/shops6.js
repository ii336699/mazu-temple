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

/* ---------- 小地圖 (top left): where you are, and a big map of every place you can go to, one tap to walk there ---------- */
const MMAP=(()=>{
  const CAT=[["god","神明","#e0453a",["altar","guanyin","zhusheng","jiutian","doumu","dizang","wenchang","tudi","caishen","yuelao","xuantian","guangong","huye"]],
    ["pray","參拜","#d9aa3d",["shop","tiangong","burn","donate","lot","jieqian","lamp","bell","drum","wish","fountain"]],
    ["game","遊戲","#ff6fae",["claw","gacha","cats","fortune","nm:qq","nm:sausage","nm:bbq","nm:fish","nm:pachinko","nm:boba","nm:balloon"]],
    ["shop","商店","#4fb3ff",["cvs","cloth","innDesk","catMom"]]];
  const LBL={innDesk:"禪房櫃台"}; const MM_TOWN=false; /* the town, brook and beach are not open yet: left off the map until they are (set true then) */ const SKIP=new Set(["lampR"]);
  const catOf=k=>{ for(const c of CAT) if(c[3].includes(k)) return c; return ["etc","其他","#7fd08a",[]]; };
  const label=k=>LBL[k]||(typeof STATION_LABEL!=="undefined"&&STATION_LABEL[k])||"";
  const pois=()=>Object.keys(stations).filter(k=>!SKIP.has(k)&&label(k)).map(k=>({k,n:label(k),x:stations[k].approach.x,z:stations[k].approach.y,c:catOf(k)}));
  /* the ground: every walkable spot, sampled once in small steps after the game has loaded */
  let B=[-76,66,-50.5,46.5], ST=.5, W=1, H=1; const base=document.createElement("canvas"); let ready=false, row=0, img=null;
  const sizeUp=()=>{ try{ if(MM_TOWN&&typeof TOWNX!=="undefined"&&TOWNX){ const r=TOWNX.ZR||[-8,182,-137.5,-50.5]; B=[Math.min(B[0],r[0]),Math.max(B[1],r[1]),Math.min(B[2],r[2]),Math.max(B[3],r[3])]; } }catch(e){} /* (the town, when this version has it) */
    ST=Math.max(.5,Math.sqrt((B[1]-B[0])*(B[3]-B[2])/90000)); W=Math.ceil((B[1]-B[0])/ST); H=Math.ceil((B[3]-B[2])/ST); base.width=W; base.height=H; };
  const sample=()=>{ if(!img){ sizeUp(); img=new ImageData(W,H); } const t0=performance.now(); const d=img.data;
    while(row<H&&performance.now()-t0<12){ const z=B[2]+(row+.5)*ST; for(let i=0;i<W;i++){ let ok=false; try{ ok=(MM_TOWN||z>-50.5)&&walkable(B[0]+(i+.5)*ST,z); }catch(e){} if(ok){ const p=(row*W+i)*4; d[p]=236; d[p+1]=223; d[p+2]=196; d[p+3]=255; } } row++; }
    if(row<H){ setTimeout(sample,30); return; }
    const t=document.createElement("canvas"); t.width=W; t.height=H; t.getContext("2d").putImageData(img,0,0); const x=base.getContext("2d");
    const e=document.createElement("canvas"); e.width=W; e.height=H; const ge=e.getContext("2d"); ge.drawImage(t,0,0); ge.globalCompositeOperation="source-in"; ge.fillStyle="#8a6a44"; ge.fillRect(0,0,W,H); /* a brown edge round the paths */ for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) x.drawImage(e,dx,dy); x.drawImage(t,0,0); ready=true; img=null; };
  setTimeout(sample,4000);
  const px=(x)=>(x-B[0])/ST, pz=(z)=>(z-B[2])/ST;
  /* the small map + the 精力 bar, above the guide */
  const css=document.createElement("style"); css.textContent=`.mm-row{display:flex;gap:6px;align-items:flex-start}
#mmBox{position:relative;width:92px;height:92px;border-radius:16px;overflow:hidden;border:1.5px solid var(--gold-soft);background:rgba(30,18,14,.72);padding:0;flex:none;cursor:pointer}
#mmBox canvas{width:100%;height:100%;display:block}#mmBox span{position:absolute;left:0;right:0;bottom:2px;text-align:center;font-size:10px;font-weight:900;color:#ffe2a0;text-shadow:0 1px 2px #000}
#enPill{display:flex;align-items:center;gap:6px;padding:6px 10px 6px 8px;border-radius:14px;border:1.5px solid var(--gold-soft);font-weight:900;color:#fff3da;font-size:15px;line-height:1;cursor:pointer}
#enPill .bar{width:64px;height:10px;border-radius:5px;background:rgba(255,255,255,.18);overflow:hidden}#enPill .bar i{display:block;height:100%;border-radius:5px;transition:width .4s,background .4s}
#enPill .ic{font-size:17px}#enPill small{font-size:11px;color:#e9d9b8;font-weight:700}
#mmBig{position:fixed;inset:0;z-index:60;background:rgba(10,6,4,.78);display:flex;flex-direction:column;align-items:center;padding:calc(env(safe-area-inset-top) + 10px) 10px calc(env(safe-area-inset-bottom) + 10px);gap:8px}
#mmBig .hd{display:flex;align-items:center;gap:8px;width:100%;max-width:560px}#mmBig .hd b{font-size:17px;color:#ffe2a0;flex:1}
#mmBig .cats{display:flex;gap:6px;flex-wrap:wrap;width:100%;max-width:560px}#mmBig .cats button{border-radius:999px;padding:5px 12px;font-weight:900;font-size:13px;border:1.5px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff}
#mmBig .cats button[aria-pressed="true"]{background:var(--c);border-color:var(--c);color:#1a0f08}
#mmBig .map{position:relative;width:100%;max-width:560px;flex:1 1 auto;min-height:160px;border-radius:14px;overflow:hidden;background:#22160f;border:1.5px solid var(--gold-soft)}#mmBig .map canvas{position:absolute;inset:0;width:100%;height:100%}
#mmBig .list{display:flex;gap:6px;flex-wrap:wrap;width:100%;max-width:560px;max-height:30vh;overflow:auto}#mmBig .list button{border-radius:12px;padding:8px 12px;font-weight:900;font-size:14px;color:#fff;background:rgba(255,255,255,.1);border:1.5px solid var(--c)}
#mmBig .x{border-radius:999px;padding:6px 14px;font-weight:900;background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.3)}`; document.head.appendChild(css);
  const hall=document.querySelector(".top .hall"); const rowEl=document.createElement("div"); rowEl.className="mm-row";
  rowEl.innerHTML=`<button id="mmBox" class="glass" aria-label="地圖"><canvas id="mmCv"></canvas><span>地圖・導航</span></button><div id="enPill" class="glass" role="button" aria-label="精力"><span class="ic">⚡</span><span class="bar"><i></i></span><b id="enNum">100</b><small>精力</small></div>`;
  if(hall) hall.prepend(rowEl);
  const cv=rowEl.querySelector("#mmCv"), cx=cv.getContext("2d"); const DPR=Math.min(2,devicePixelRatio||1); cv.width=cv.height=Math.round(92*DPR);
  const enUpd=()=>{ try{ const v=Math.max(0,Math.min(100,Math.round(bag.en))); const el=document.querySelector("#enNum"); if(!el) return; if(el.textContent!==String(v)) el.textContent=v; const i=document.querySelector("#enPill .bar i"); i.style.width=v+"%"; i.style.background=v>50?"#4cd964":v>20?"#ffcc00":"#ff3b30"; }catch(e){} };
  rowEl.querySelector("#enPill").onclick=()=>{ try{ toast(`精力 ${Math.round(bag.en)} / 100・打工一班要 33・泡溫泉每分鐘 +2、靜坐 +1，吃東西最快`,3200); }catch(e){} };
  const arrow=(g,x,y,a,s,c)=>{ g.save(); g.translate(x,y); g.rotate(a); g.fillStyle=c; g.strokeStyle="#000"; g.lineWidth=1.5*DPR; g.beginPath(); g.moveTo(0,-s); g.lineTo(s*.7,s*.75); g.lineTo(0,s*.35); g.lineTo(-s*.7,s*.75); g.closePath(); g.fill(); g.stroke(); g.restore(); };
  const drawMini=()=>{ const w=cv.width, h=cv.height, k=2.2*DPR*ST; /* px per sample */ cx.fillStyle="#2a1a12"; cx.fillRect(0,0,w,h); if(!ready){ return; }
    const mx=meAv.pos.x, mz=meAv.pos.y; cx.imageSmoothingEnabled=true; cx.drawImage(base,w/2-px(mx)*k,h/2-pz(mz)*k,W*k,H*k);
    for(const p of pois()){ const x=w/2+(p.x-mx)/ST*k, y=h/2+(p.z-mz)/ST*k; if(x<-4||y<-4||x>w+4||y>h+4) continue; cx.fillStyle=p.c[2]; cx.beginPath(); cx.arc(x,y,2.6*DPR,0,7); cx.fill(); }
    arrow(cx,w/2,h/2,Math.PI-meAv.rotY,6*DPR,"#ffe14a"); };
  setInterval(()=>{ enUpd(); if(document.hidden||document.body.classList.contains("shopmode")) return; try{ drawMini(); }catch(e){} },250);
  /* the big map */
  let cat="god";
  const open=()=>{ try{ ensureAudio(); }catch(e){} try{ closeSheet(); }catch(e){} let o=document.querySelector("#mmBig"); if(o) o.remove(); o=document.createElement("div"); o.id="mmBig";
    o.innerHTML=`<div class="hd"><b>🗺️ 地圖・點一下就走過去</b>${(bag.cat&&bag.cat.pet&&!bag.cat.pet.home&&!bag.cat.pet.vet&&typeof catRescue==="function")?`<button class="x" id="mmCat">🆘 貓咪救援</button>`:""}<button class="x" id="mmX">關閉</button></div><div class="cats">${CAT.map(c=>`<button data-c="${c[0]}" style="--c:${c[2]}" aria-pressed="${c[0]===cat}">${c[1]}</button>`).join("")}</div><div class="map"><canvas></canvas></div><div class="list"></div>`;
    document.body.appendChild(o); const mc=o.querySelector(".map canvas"), box=o.querySelector(".map"); let fit=null;
    const go=k=>{ o.remove(); if(stations[k]) goStation(k); else toast("那裡現在去不了",2000); };
    const draw=()=>{ const r=box.getBoundingClientRect(), d=Math.min(2,devicePixelRatio||1); mc.width=Math.round(r.width*d); mc.height=Math.round(r.height*d); const g=mc.getContext("2d");
      const P=pois(), sel=P.filter(p=>p.c[0]===cat); /* fit the whole grounds, centred */ const s=Math.min(mc.width/W,mc.height/H)*.96, ox=(mc.width-W*s)/2, oy=(mc.height-H*s)/2; fit={s,ox,oy,d};
      g.fillStyle="#22160f"; g.fillRect(0,0,mc.width,mc.height); if(ready) g.drawImage(base,ox,oy,W*s,H*s); else { g.fillStyle="#e9d9b8"; g.font=`${14*d}px sans-serif`; g.textAlign="center"; g.fillText("地圖準備中…",mc.width/2,mc.height/2); }
      const X=x=>ox+px(x)*s, Y=z=>oy+pz(z)*s;
      for(const p of P){ if(p.c[0]===cat) continue; g.fillStyle="rgba(255,255,255,.35)"; g.beginPath(); g.arc(X(p.x),Y(p.z),2.2*d,0,7); g.fill(); }
      g.font=`900 ${11*d}px sans-serif`; g.textAlign="center"; g.lineJoin="round";
      for(const p of sel){ const x=X(p.x), y=Y(p.z); g.fillStyle=p.c[2]; g.strokeStyle="#1a0f08"; g.lineWidth=2*d; g.beginPath(); g.arc(x,y,5*d,0,7); g.fill(); g.stroke(); g.lineWidth=3*d; g.strokeText(p.n,x,y-8*d); g.fillStyle="#fff"; g.fillText(p.n,x,y-8*d); }
      arrow(g,X(meAv.pos.x),Y(meAv.pos.y),Math.PI-meAv.rotY,8*d,"#ffe14a");
      o.querySelector(".list").innerHTML=sel.map(p=>`<button data-k="${p.k}" style="--c:${p.c[2]}">${p.n}</button>`).join("")||`<span style="color:#d9c9a8;font-size:13px">這一類現在沒有地方可以去</span>`;
      o.querySelectorAll(".list button").forEach(b=>b.onclick=()=>go(b.dataset.k)); };
    o.querySelector("#mmX").onclick=()=>o.remove(); { const c=o.querySelector("#mmCat"); if(c) c.onclick=()=>{ o.remove(); catRescue(); }; } o.querySelectorAll(".cats button").forEach(b=>b.onclick=()=>{ cat=b.dataset.c; o.querySelectorAll(".cats button").forEach(x=>x.setAttribute("aria-pressed",x===b)); draw(); });
    mc.addEventListener("click",e=>{ if(!fit) return; const r=mc.getBoundingClientRect(), x=(e.clientX-r.left)*fit.d, y=(e.clientY-r.top)*fit.d; let best=null, bd=22*fit.d;
      for(const p of pois()){ if(p.c[0]!==cat) continue; const dx=fit.ox+px(p.x)*fit.s-x, dy=fit.oy+pz(p.z)*fit.s-y, dd=Math.hypot(dx,dy); if(dd<bd){ bd=dd; best=p; } } if(best) go(best.k); });
    requestAnimationFrame(draw); };
  rowEl.querySelector("#mmBox").onclick=open;
  return {open};
})();
/* 主委: unlimited 平安幣 and 扭蛋幣 — topped up again straight after anything is spent */
setInterval(()=>{ try{ if(!(me&&me.sp)) return; let ch=0; if((bag.coins|0)<999999){ bag.coins=999999; ch=1; } if((bag.gacha|0)<200){ bag.gacha=200; ch=1; } if(ch) saveBag(); }catch(e){} },400);
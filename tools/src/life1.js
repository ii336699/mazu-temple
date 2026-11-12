/* ================= 小鎮生活 (11/13): fishing and the fish book first; the townsfolk, the salon and barber, the stall games,
   the meteor and your own garden are added below as they are made. Everything a player owns here lives in bag.lf.
   Fish models are drawn in code for now (a body, a tail, a fin, colours and markings per kind): when the chair's models arrive,
   FISHGLB[id] is the only thing that has to be filled in. ================= */
LIFE=(()=>{
const L={};
const LF=()=>{ if(!bag.lf||typeof bag.lf!=="object") bag.lf={}; const d=bag.lf; d.fish=d.fish||{}; d.inv=Array.isArray(d.inv)?d.inv:[]; d.rod=d.rod|0; return d; };
const save=()=>{ try{ saveBag(); markDirty(); }catch(e){} };
const sm=(a,b,v)=>{ const t=Math.max(0,Math.min(1,(v-a)/(b-a))); return t*t*(3-2*t); };
/* the hour of the game's day: 0 清晨 (dawn), 1 白天, 2 黃昏, 3 夜晚 — the same sky everyone sees */
L.slot=()=>{ let p=(Date.now()/1000%TOD_LEN)/TOD_LEN; if(typeof window.MZ_TOD==="number") p=window.MZ_TOD; return p<.32||p>=.97?1:p<.5?2:p<.86?3:0; };
const SLOTN=["清晨","白天","黃昏","夜晚"];
L.rain=()=>{ try{ return (WX.r||0)>.3; }catch(e){ return false; } };
/* ---------- fish: id, name, where (r 大河, b 溪谷, s 泉池, g 女神泉, o 海), rarity 1–4, when (slots, "" = any), "rain" needs rain,
   "star" needs a meteor night, size range in cm, price, shadow 1–6, colours [back, belly, markings], marking kind, a line ---------- */
const FISH=[
 ["tilapia","吳郭魚","rb",1,"","",[18,35],40,2,["#6a7a6a","#c9d2c0","#4a5a4a"],"bars","河邊最常見的魚，很好養也很好釣。"],
 ["carp","鯉魚","r",1,"","",[30,70],90,4,["#b08a4a","#f0d8a0","#8a6a3a"],"scale","河裡的老面孔，力氣不小。"],
 ["crucian","鯽魚","rb",1,"","",[10,25],35,2,["#8a8a6a","#d8d8b8","#6a6a4a"],"plain","小小一隻，煮湯很鮮。"],
 ["guppy","大肚魚","rbs",1,"","",[3,6],20,1,["#9aa8a0","#e8eee8","#ffb060"],"tailcol","小水溝裡也看得到的小魚。"],
 ["zacco","溪哥","b",1,"01","",[8,16],60,1,["#7a9aa8","#e8f0f0","#e8604a"],"bars","公魚身上有漂亮的紅綠條紋。"],
 ["ayu","香魚","b",2,"1","",[15,28],180,2,["#8a9a7a","#f0f0e0","#f2c230"],"spot","帶著西瓜香的溪魚，白天在清澈的溪裡。"],
 ["kuhua","苦花","b",2,"01","",[15,30],220,2,["#5a6a5a","#d8dcd0","#3a4a3a"],"plain","愛在急流石頭邊刮青苔吃。"],
 ["catfish","鯰魚","r",2,"23","",[40,90],250,5,["#4a4a42","#b8b4a0","#2a2a24"],"whisk","晚上才出來覓食，鬍鬚很長。"],
 ["loach","泥鰍","rb",2,"","rain",[10,20],200,1,["#8a7a5a","#d8c8a0","#5a4a3a"],"spot","下雨天會從泥巴裡鑽出來。"],
 ["eel","鱔魚","r",2,"3","rain",[40,80],320,4,["#5a4a2a","#c8b070","#3a2a1a"],"eel","雨夜在河岸邊游動，滑溜溜的。"],
 ["bighead","大頭鰱","r",2,"12","",[50,100],280,6,["#7a8a8a","#e0e4e0","#5a6a6a"],"plain","頭大大的，在河中央慢慢游。"],
 ["koi","錦鯉","r",3,"1","",[40,80],900,4,["#ffffff","#ffffff","#e8402e"],"koi","河裡偶爾會出現被放生的錦鯉，聽說會帶來好運。"],
 ["masu","櫻花鉤吻鮭","b",3,"0","",[25,40],1500,3,["#7a8aa0","#f0d8e0","#e87a9a"],"spot","國寶魚，清晨才在溪谷上游現身。"],
 ["sturgeon","鱘龍魚","r",3,"3","rain",[100,200],2000,6,["#5a6470","#c8ccd0","#3a4048"],"plates","下雨的夜晚，大河深處的古老大魚。"],
 ["medaka","青鱂魚","s",1,"","",[3,5],45,1,["#b8c8c0","#f0f4f0","#7ab0d0"],"plain","泉水裡一群群的小魚，眼睛亮晶晶。"],
 ["angel","七彩神仙","s",2,"","",[10,18],380,2,["#4a8ad0","#f0c060","#e8604a"],"stripe","不知道誰放的，在泉池裡活得好好的。"],
 ["springkoi","泉之錦鯉","sg",3,"12","",[50,90],1800,4,["#f2c230","#fff6d0","#ffffff"],"koi","全身金黃，只在泉池出現。"],
 ["goldscale","金鱗仙魚","g",4,"3","star",[60,100],8000,5,["#ffd84a","#fff6c8","#ffffff"],"glow","流星夜，女神泉裡會游出一條會發光的魚。"],
 ["mackerel","竹筴魚","o",1,"","",[15,30],50,2,["#5a7a9a","#e8eef4","#8aa0b8"],"line","海邊最常釣到的魚。"],
 ["seabream","黑鯛","o",1,"","",[20,45],120,3,["#4a5058","#c0c4c8","#2a3038"],"bars","海邊石頭旁的老朋友。"],
 ["terapon","花身鯻","o",1,"12","",[15,25],70,2,["#b8b0a0","#f0ece0","#4a4a40"],"line","身上有幾條黑線，會咕咕叫。"],
 ["sardine","沙丁魚","o",1,"01","",[10,18],40,1,["#5a8ab0","#f0f4f8","#3a6a90"],"spot","一大群一起游。"],
 ["puffer","河豚","o",2,"","",[15,35],260,2,["#c8b880","#f8f0d8","#5a4a2a"],"spot","被釣起來會氣嘟嘟地脹起來。"],
 ["flounder","比目魚","o",2,"23","",[25,50],300,3,["#8a7a5a","#f0e8d8","#5a4a30"],"spot","兩個眼睛長在同一邊，躲在沙裡。"],
 ["hairtail","白帶魚","o",2,"3","",[60,120],350,4,["#d8dce4","#ffffff","#a8b0c0"],"eel","銀亮亮的，晚上才靠岸。"],
 ["squid","透抽","o",2,"3","",[20,40],330,2,["#f0d8d0","#fff4f0","#e89a8a"],"squid","夜裡被燈光吸引過來。"],
 ["seahorse","海馬","o",2,"1","",[8,15],420,1,["#f2a65a","#ffe0b0","#d0803a"],"plain","尾巴捲捲的，抱著海草。"],
 ["grouper","石斑","o",2,"2","",[40,80],480,5,["#8a6a4a","#d8c0a0","#4a3020"],"spot","黃昏時在礁石洞口等晚餐。"],
 ["mahi","鬼頭刀","o",3,"1","",[70,140],1200,5,["#3ab08a","#f2e050","#2a7aa0"],"spot","陽光下閃著綠金色的大魚，衝勁很強。"],
 ["oarfish","皇帶魚","o",4,"3","rain",[300,500],6000,6,["#d8dce8","#ffffff","#e8402e"],"oar","雨夜才浮上來的傳說大魚。"],
 ["sunfish","翻車魚","o",3,"1","",[150,250],2500,6,["#8a98a8","#e0e4ea","#6a7888"],"plain","圓滾滾的，白天在海面上曬太陽。"],
 ["shark","鯊魚","o",3,"23","",[150,300],3000,6,["#6a7888","#e8ecf0","#4a5868"],"plain","海邊的大傢伙，背鰭露出水面。"],
 ["dragonbream","龍王鯛","o",4,"0","star",[50,90],7000,4,["#e84a3a","#ffd0b0","#f2c230"],"scale","流星劃過的清晨，海邊會出現紅金色的龍王鯛。"],
].map(a=>({id:a[0],n:a[1],w:a[2],r:a[3],t:a[4],need:a[5],sz:a[6],p:a[7],sh:a[8],c:a[9],mk:a[10],d:a[11]}));
const FBY={}; FISH.forEach(f=>FBY[f.id]=f);
const RW={1:10,2:3.2,3:.7,4:.25}, RN=["","常見","少見","稀有","傳說"];
const WN={r:"大河",b:"溪谷",s:"泉池",g:"女神泉",o:"大海"};
L.FISH=FISH;
/* which fish can bite here, now */
function pool(kind){ const s=String(L.slot()), rain=L.rain(), star=!!L.starNight; return FISH.filter(f=>f.w.includes(kind)&&(!f.t||f.t.includes(s))&&(f.need!=="rain"||rain)&&(f.need!=="star"||star)); }
function roll(kind){ const P=pool(kind); let tot=0; P.forEach(f=>tot+=RW[f.r]*(LF().rod>=2&&f.r>=3?1.5:1)); let x=Math.random()*tot; for(const f of P){ x-=RW[f.r]*(LF().rod>=2&&f.r>=3?1.5:1); if(x<=0) return f; } return P[0]; }
/* ---------- a fish drawn in code: for the book, the bag and the catch card ---------- */
const ICON={};
function fishIcon(id,dark){ const k=id+(dark?"_d":""); if(ICON[k]) return ICON[k]; const f=FBY[id]; const c=document.createElement("canvas"); c.width=128; c.height=80; const x=c.getContext("2d");
  const [b,bl,mk]=f.c, eel=f.mk==="eel"||f.mk==="oar", sq=f.mk==="squid", L0=eel?108:84, H0=eel?18:f.id==="sunfish"?56:f.id==="flounder"?40:f.id==="puffer"?46:30, cx=58, cy=40;
  const fill=(col)=>dark?"#2a3038":col; x.save();
  if(sq){ x.fillStyle=fill(b); x.beginPath(); x.moveTo(20,cy); x.quadraticCurveTo(70,cy-22,104,cy); x.quadraticCurveTo(70,cy+22,20,cy); x.fill(); for(let i=0;i<6;i++){ x.strokeStyle=fill(mk); x.lineWidth=3; x.beginPath(); x.moveTo(22,cy-8+i*3); x.quadraticCurveTo(8,cy-12+i*5,2,cy-14+i*6); x.stroke(); } }
  else { /* tail */ x.fillStyle=fill(f.mk==="tailcol"?mk:b); x.beginPath(); const tx=cx+L0/2-6; x.moveTo(tx,cy); x.lineTo(tx+20,cy-H0*.55); x.quadraticCurveTo(tx+12,cy,tx+20,cy+H0*.55); x.closePath(); x.fill();
    /* back fin */ x.beginPath(); x.moveTo(cx-6,cy-H0/2+2); x.quadraticCurveTo(cx+8,cy-H0/2-14,cx+20,cy-H0/2+3); x.fill();
    /* body */ const g=x.createLinearGradient(0,cy-H0/2,0,cy+H0/2); g.addColorStop(0,fill(b)); g.addColorStop(.55,fill(b)); g.addColorStop(1,fill(bl)); x.fillStyle=g; x.beginPath(); x.ellipse(cx,cy,L0/2,H0/2,0,0,6.283); x.fill();
    if(!dark){ x.save(); x.beginPath(); x.ellipse(cx,cy,L0/2,H0/2,0,0,6.283); x.clip(); x.fillStyle=mk; x.strokeStyle=mk;
      if(f.mk==="bars"||f.mk==="stripe") for(let i=0;i<5;i++){ x.globalAlpha=.55; x.fillRect(cx-L0/2+14+i*L0/6,cy-H0/2,f.mk==="stripe"?7:4,H0); }
      if(f.mk==="spot") for(let i=0;i<14;i++){ x.globalAlpha=.6; x.beginPath(); x.arc(cx-L0/2+10+((i*37)%(L0-20)),cy-H0/2+4+((i*23)%(H0-6)),2.4,0,6.283); x.fill(); }
      if(f.mk==="line"){ x.globalAlpha=.7; x.lineWidth=2.5; x.beginPath(); x.moveTo(cx-L0/2,cy); x.quadraticCurveTo(cx,cy-4,cx+L0/2,cy); x.stroke(); }
      if(f.mk==="koi") for(let i=0;i<4;i++){ x.globalAlpha=.85; x.beginPath(); x.ellipse(cx-L0/3+i*L0/5,cy-H0/5+(i%2)*6,9,7,i,0,6.283); x.fill(); }
      if(f.mk==="scale"){ x.globalAlpha=.35; x.lineWidth=1.2; for(let i=0;i<8;i++) for(let j=0;j<3;j++){ x.beginPath(); x.arc(cx-L0/2+12+i*9,cy-H0/2+8+j*9,5,1.2,2*Math.PI-1.2,true); x.stroke(); } }
      if(f.mk==="plates"){ x.globalAlpha=.6; for(let i=0;i<7;i++){ x.beginPath(); x.moveTo(cx-L0/2+12+i*11,cy-H0/2+3); x.lineTo(cx-L0/2+17+i*11,cy-H0/2+9); x.lineTo(cx-L0/2+22+i*11,cy-H0/2+3); x.fill(); } }
      if(f.mk==="oar"){ x.globalAlpha=1; x.fillRect(cx-L0/2,cy-H0/2,L0,3); }
      if(f.mk==="glow"){ x.globalAlpha=.5; const gg=x.createRadialGradient(cx,cy,2,cx,cy,L0/2); gg.addColorStop(0,"#ffffff"); gg.addColorStop(1,"rgba(255,255,255,0)"); x.fillStyle=gg; x.fillRect(0,0,128,80); }
      x.restore(); }
    if(f.mk==="whisk"&&!dark){ x.strokeStyle=b; x.lineWidth=1.6; x.beginPath(); x.moveTo(cx-L0/2+4,cy+2); x.quadraticCurveTo(cx-L0/2-10,cy+12,cx-L0/2-14,cy+20); x.moveTo(cx-L0/2+4,cy); x.quadraticCurveTo(cx-L0/2-12,cy-6,cx-L0/2-16,cy-2); x.stroke(); }
    /* eye */ x.fillStyle=dark?"#4a525c":"#ffffff"; x.beginPath(); x.arc(cx-L0/2+12,cy-H0/8,dark?2.5:4,0,6.283); x.fill(); if(!dark){ x.fillStyle="#1a1a1a"; x.beginPath(); x.arc(cx-L0/2+12.6,cy-H0/8,2.2,0,6.283); x.fill(); } }
  x.restore(); return ICON[k]=c.toDataURL(); }
L.bic=(k,cls)=>{ const id=k.slice(3); return `<span class="bic ${cls||""}" style="background:url(${fishIcon(id)}) center/contain no-repeat"></span>`; };
/* a fish as a 3D thing (held up when caught): a stand-in until the models arrive */
const FISHGLB={};
function fishMesh(f){ const g=new T.Group(); const t=new T.CanvasTexture(Object.assign(document.createElement("canvas"),{width:2,height:2})); const im=new Image(); im.onload=()=>{ t.image=im; t.needsUpdate=true; }; im.src=fishIcon(f.id); t.encoding=T.sRGBEncoding;
  const m=new T.Mesh(new T.PlaneGeometry(.64,.4),new T.MeshBasicMaterial({map:t,transparent:true,side:T.DoubleSide,toneMapped:false})); g.add(m); g.userData.tex=t; return g; }
/* ---------- the water: where it is and which kind ---------- */
const waterAt=(x,z)=>{ try{ return TOWNX&&TOWNX.water?TOWNX.water(x,z):null; }catch(e){ return null; } };
let near=null, nearT=0;
function findWater(){ const p=meAv.pos; let best=null; for(const d of [1.2,2,2.8,3.6]) for(let a=0;a<16;a++){ const an=a/16*6.283, x=p.x+Math.sin(an)*d, z=p.y+Math.cos(an)*d, w=waterAt(x,z); if(w&&(!best||d<best.d)){ best={x,z,d,w}; } if(best) break; } return best; }
/* ---------- the 釣魚 button ---------- */
let chip=null;
function css(){ if(document.getElementById("lfCss")) return; const st=document.createElement("style"); st.id="lfCss"; st.textContent=`
#lfChip{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 128px);z-index:9;border:0;border-radius:999px;padding:11px 20px;font:900 16px ${UI_FONT};color:#fff;background:linear-gradient(#4fa8d8,#2f7fb0);box-shadow:0 4px 14px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.4)}
#lfChip[hidden]{display:none}
.lf-ov{position:fixed;inset:0;z-index:60;touch-action:none;user-select:none;-webkit-user-select:none;font-family:${UI_FONT}}
.lf-top{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 200px);text-align:center;color:#fff;font-weight:900;font-size:18px;text-shadow:0 2px 6px rgba(0,0,0,.6);pointer-events:none}
.lf-x{position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);border:1px solid rgba(255,255,255,.4);border-radius:99px;background:rgba(0,0,0,.45);color:#fff;font-weight:800;font-size:15px;padding:8px 14px}
.lf-bar{position:absolute;left:8%;right:8%;bottom:calc(env(safe-area-inset-bottom,0px) + 190px);height:26px;border-radius:13px;background:rgba(0,0,0,.45);border:2px solid rgba(255,255,255,.7);overflow:hidden}
.lf-bar .g{position:absolute;top:0;bottom:0;background:rgba(120,230,140,.75)}.lf-bar .p{position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;background:#fff;box-shadow:0 0 6px #000}
.lf-prog{position:absolute;left:8%;right:8%;bottom:calc(env(safe-area-inset-bottom,0px) + 228px);height:10px;border-radius:5px;background:rgba(0,0,0,.4);overflow:hidden}.lf-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffd76a,#ff9a3a)}
.lf-btn{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 70px);transform:translateX(-50%);width:120px;height:96px;border-radius:48px;border:3px solid #fff;background:radial-gradient(#ffb04a,#e8702e);color:#fff;font-weight:900;font-size:22px;box-shadow:0 6px 18px rgba(0,0,0,.4)}
.lf-btn.on{transform:translateX(-50%) scale(.94);background:radial-gradient(#ffc87a,#d8601e)}
.lf-card{text-align:center}.lf-card img{width:220px;height:138px;object-fit:contain;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35))}.lf-card .nm{font-size:24px;font-weight:900;color:#ffe2a0}.lf-card .st{color:#ffd76a;font-size:15px}
.lf-new{display:inline-block;background:#e8402e;color:#fff;border-radius:99px;padding:3px 10px;font-weight:900;font-size:13px;margin:6px 0}
.lf-dex{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.lf-dex button{border:1px solid rgba(255,220,150,.25);border-radius:10px;background:rgba(255,255,255,.05);padding:4px 2px;color:inherit;font:inherit;font-size:11.5px}
.lf-dex img{display:block;width:100%;height:46px;object-fit:contain}.lf-dex .no{opacity:.75}.lf-dex b{display:block;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lf-row{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.08)}.lf-row img{width:64px;height:40px;object-fit:contain}.lf-row .t{flex:1}.lf-row small{color:#bba}`; document.head.appendChild(st); }
function chipInit(){ css(); chip=document.createElement("button"); chip.id="lfChip"; chip.hidden=true; chip.textContent="🎣 釣魚"; chip.onclick=()=>startFish(); document.body.appendChild(chip); }
/* ---------- fishing ---------- */
let F=null;
const busy=()=>{ try{ return !!(sheetKind||customizing||(SHOPX&&SHOPX.on)||miniOpen||meAv.seat>=0||(typeof pendingStation!=="undefined"&&pendingStation)); }catch(e){ return false; } };
function startFish(){ if(F) return; const d=LF(); if(!d.rod&&!me.sp){ toast("🎣 要先到老街的釣具行買一支釣竿",2800); return; } const w=near||findWater(); if(!w){ toast("離水邊再近一點",1800); return; }
  if(d.inv.length>=40){ toast("背包裡的魚滿了（40 條），先到釣具行或雜貨店賣掉一些",3000); return; }
  meAv.target.copy(meAv.pos); meAv.path=[]; const face=Math.atan2(w.x-meAv.pos.x,w.z-meAv.pos.y); meAv.rotY=face; meAv.faceGoal=face;
  const ov=document.createElement("div"); ov.className="lf-ov"; ov.innerHTML=`<div class="lf-top" id="lfMsg">拋竿……</div><button class="lf-x" id="lfX">收竿</button><button class="lf-btn" id="lfB">拉！</button>`; document.body.appendChild(ov);
  const bob=new T.Group(); const b1=new T.Mesh(new T.SphereGeometry(.07,12,8),new T.MeshStandardMaterial({color:"#e8402e",roughness:.4})); b1.position.y=.03; bob.add(b1); const b2=new T.Mesh(new T.SphereGeometry(.072,12,8,0,6.283,0,1.2),new T.MeshStandardMaterial({color:"#ffffff",roughness:.4})); b2.position.y=.04; bob.add(b2); scene.add(bob);
  const sh=new T.Mesh(new T.CircleGeometry(1,20),new T.MeshBasicMaterial({color:"#0a1a24",transparent:true,opacity:0,depthWrite:false})); sh.rotation.x=-Math.PI/2; scene.add(sh);
  const ring=new T.Mesh(new T.RingGeometry(.12,.16,24),new T.MeshBasicMaterial({color:"#ffffff",transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide})); ring.rotation.x=-Math.PI/2; scene.add(ring);
  const line=new T.Mesh(new T.CylinderGeometry(.006,.006,1,4),new T.MeshBasicMaterial({color:"#f4f4f0"})); scene.add(line);
  const rod=new T.Mesh(new T.CylinderGeometry(.012,.024,1.7,6),new T.MeshStandardMaterial({color:"#6b4a2e",roughness:.6})); rod.position.set(.18,1.15,.55); rod.rotation.x=1.0; meAv.root.add(rod);
  F={ph:"cast",t:0,w,ov,bob,sh,ring,line,rod,y:w.w.y,fish:null,taps:0,nib:0};
  try{ tone(900,.12,.04,"sine"); tone(500,.2,.03,"sine",.1); }catch(e){} chip.hidden=true;
  const B=ov.querySelector("#lfB"); const down=e=>{ e.preventDefault(); B.classList.add("on"); F&&(F.hold=true); press(); }, upf=e=>{ B.classList.remove("on"); F&&(F.hold=false); };
  B.addEventListener("pointerdown",down); B.addEventListener("pointerup",upf); B.addEventListener("pointercancel",upf); B.addEventListener("pointerleave",upf);
  ov.querySelector("#lfX").onclick=()=>endFish(); statInc&&statInc("lfCast"); }
const msg=t=>{ const m=F&&F.ov.querySelector("#lfMsg"); if(m) m.textContent=t; };
function press(){ if(!F) return; if(F.ph==="wait"||F.ph==="nibble"){ msg("太早拉了，魚嚇跑了……"); try{ tone(240,.15,.05,"triangle"); }catch(e){} F.ph="miss"; F.t=0; return; }
  if(F.ph==="bite"){ F.ph="fight"; F.t=0; startFight(); return; } }
function startFight(){ const f=F.fish, d=LF(); F.tn=.35; F.prog=.15; F.gc=.5; F.gw=Math.max(.14,(f.r===1?.34:f.r===2?.27:f.r===3?.21:.17)+(d.rod>=2?.06:0)); F.over=0; F.slack=0;
  F.ov.insertAdjacentHTML("beforeend",`<div class="lf-prog"><i id="lfP"></i></div><div class="lf-bar"><div class="g" id="lfG"></div><div class="p" id="lfPt"></div></div>`); msg("上鉤了！按住「拉」收線，讓白線留在綠色裡"); try{ navigator.vibrate&&navigator.vibrate(60); }catch(e){} }
function endFish(){ if(!F) return; const o=F; F=null; [o.bob,o.sh,o.ring,o.line].forEach(m=>{ scene.remove(m); m.traverse(q=>{ if(q.isMesh){ q.geometry.dispose(); q.material.dispose(); } }); }); if(o.rod.parent) o.rod.parent.remove(o.rod); o.rod.geometry.dispose(); o.ov.remove(); meAv.faceGoal=null; }
function caught(){ const f=F.fish, d=LF(), size=Math.round((f.sz[0]+(f.sz[1]-f.sz[0])*Math.pow(Math.random(),1.6))*10)/10; const e=d.fish[f.id]||(d.fish[f.id]=[0,0,Date.now()]); const first=!e[0]; e[0]++; e[1]=Math.max(e[1],size);
  d.inv.push([f.id,size]); save(); try{ statInc("lfFish"); statInc("lfR"+f.r); }catch(e2){}
  const hold=fishMesh(f); hold.position.set(0,2.1,0); meAv.root.add(hold); setTimeout(()=>{ if(hold.parent) hold.parent.remove(hold); hold.children[0].geometry.dispose(); hold.children[0].material.dispose(); hold.userData.tex.dispose(); },2600);
  try{ [523,659,784,1047].forEach((q,k)=>tone(q,.14,.06,"triangle",k*.09)); if(f.r>=3) [1319,1568].forEach((q,k)=>tone(q,.2,.05,"sine",.4+k*.12)); }catch(e2){}
  endFish(); setTimeout(()=>card(f,size,first),700); }
function card(f,size,first){ openSheet("lfCard","🎣 釣到了！",`<div class="lf-card"><img src="${fishIcon(f.id)}" alt=""><div class="nm">${f.n}</div><div class="st">${"★".repeat(f.r)}${"☆".repeat(4-f.r)}　${RN[f.r]}・${f.w.includes("o")?"海水魚":"淡水魚"}</div>
  ${first?`<div class="lf-new">第一次釣到！已登錄圖鑑</div>`:""}<p class="lead" style="margin:8px 0">${size} 公分。${f.d}</p><div class="row"><button class="primary" data-act="lfAgain">再釣一次</button><button class="secondary" data-act="lfRelease">放生</button></div><p class="note">釣到的魚收在背包裡，可以到釣具行或雜貨店賣，一條 ${price(f,size)} 平安幣左右。</p></div>`); }
const price=(f,size)=>Math.round(f.p*(.8+.4*(size-f.sz[0])/Math.max(1,f.sz[1]-f.sz[0])));
HANDLERS.lfAgain=()=>{ closeSheet(); setTimeout(startFish,250); };
HANDLERS.lfRelease=()=>{ const d=LF(); const e=d.inv.pop(); save(); closeSheet(); if(e) toast(`放生了「${FBY[e[0]].n}」，牠開心地游走了`,2200); };
function fishTick(dt){ if(!F){ nearT-=dt; if(nearT<=0){ nearT=.35; const can=!busy()&&TOWNX&&TOWNX.on; near=can?findWater():null; if(chip) chip.hidden=!near; } return; }
  F.t+=dt; const w=F.w, y=F.y, a=meAv.root.position;
  /* the line from the rod tip to the float */ const tip=new T.Vector3(.18,1.15+.85*Math.cos(1.0),.55+.85*Math.sin(1.0)).applyMatrix4(meAv.root.matrixWorld), bp=F.bob.position, mid=tip.clone().add(bp).multiplyScalar(.5), L=tip.distanceTo(bp); F.line.position.copy(mid); F.line.scale.set(1,L,1); F.line.lookAt(bp); F.line.rotateX(Math.PI/2);
  if(F.ph==="cast"){ const k=Math.min(1,F.t/.6); bp.set(a.x+(w.x-a.x)*k,y+Math.sin(k*Math.PI)*1.4+(1-k)*1.2,a.z+(w.z-a.z)*k); if(k>=1){ F.ph="wait"; F.t=0; F.wt=2+Math.random()*4.5; F.fish=roll(w.w.k); msg("等魚靠過來……"); F.ring.position.set(w.x,y+.01,w.z); F.ring.material.opacity=.7; F.rt=0; try{ tone(300,.08,.05,"sine"); }catch(e){} } return; }
  F.rt=(F.rt||0)+dt; F.ring.scale.setScalar(1+F.rt*3); F.ring.material.opacity=Math.max(0,.7-F.rt*.8);
  const bob=Math.sin(F.t*2.2)*.012; bp.set(w.x,y+bob,w.z);
  if(F.ph==="wait"){ const f=F.fish, s=.12+f.sh*.07; if(F.t>F.wt*.4){ const k=sm(F.wt*.4,F.wt,F.t), an=F.an??(F.an=Math.random()*6.283), dd=(1-k)*2.6+.25; F.sh.position.set(w.x+Math.sin(an)*dd,y-.03,w.z+Math.cos(an)*dd); F.sh.scale.set(s,s*1.8,1); F.sh.rotation.z=-an; F.sh.material.opacity=.45*sm(F.wt*.4,F.wt*.6,F.t); }
    if(F.t>F.wt){ F.ph="nibble"; F.t=0; F.nn=1+(Math.random()*3|0); F.nt=.5; } return; }
  if(F.ph==="nibble"){ F.nt-=dt; if(F.nt<=0){ if(F.nn<=0){ F.ph="bite"; F.t=0; bp.y=y-.12; F.rt=0; F.ring.material.opacity=.9; msg("咕咚！快拉！"); try{ tone(180,.18,.08,"sine"); tone(120,.25,.06,"sine",.05); navigator.vibrate&&navigator.vibrate(120); }catch(e){} return; } F.nn--; F.nt=.7+Math.random()*.8; bp.y=y-.04; F.rt=0; F.ring.material.opacity=.5; try{ tone(420,.05,.03,"sine"); }catch(e){} } return; }
  if(F.ph==="bite"){ bp.y=y-.12+Math.sin(F.t*30)*.02; if(F.t>(F.fish.r>=3?.75:.95)){ msg("魚跑掉了……"); F.ph="miss"; F.t=0; } return; }
  if(F.ph==="miss"){ F.sh.material.opacity=Math.max(0,F.sh.material.opacity-dt); if(F.t>1.4){ F.ph="wait"; F.t=0; F.wt=2+Math.random()*4.5; F.fish=roll(w.w.k); F.an=null; msg("再等等……"); } return; }
  if(F.ph==="fight"){ const f=F.fish, pull=(f.r+f.sh*.35)*.18; F.tn+=(F.hold?.95:-.75)*dt; F.tn+=(Math.sin(F.t*(2+f.r))*pull+(Math.random()-.5)*pull*2.2)*dt; F.gc=.5+Math.sin(F.t*.9*(1+f.r*.3))*.22*(f.r>1?1:.5); F.tn=Math.max(0,Math.min(1,F.tn));
    const inG=Math.abs(F.tn-F.gc)<F.gw/2; F.prog+=(inG?.2/(1+f.r*.18):-.07)*dt; F.over=F.tn>=.99?F.over+dt:0; F.slack=F.tn<=.01?F.slack+dt:0;
    bp.set(w.x+Math.sin(F.t*3)*.15*(1-F.prog),y-.05,w.z+Math.cos(F.t*2.3)*.15*(1-F.prog)); F.sh.material.opacity=.5; F.sh.position.set(bp.x,y-.03,bp.z);
    const g=F.ov.querySelector("#lfG"), p=F.ov.querySelector("#lfPt"), pr=F.ov.querySelector("#lfP"); if(g){ g.style.left=((F.gc-F.gw/2)*100)+"%"; g.style.width=(F.gw*100)+"%"; p.style.left=(F.tn*100)+"%"; pr.style.width=(Math.max(0,F.prog)*100)+"%"; }
    if(F.prog>=1){ caught(); return; } if(F.over>.6||F.prog<-.05){ msg(F.over>.6?"線斷了！拉太用力了……":"魚掙脫了……"); try{ tone(200,.2,.06,"sawtooth"); }catch(e){} F.ov.querySelectorAll(".lf-prog,.lf-bar").forEach(e=>e.remove()); F.ph="miss"; F.t=0; }
    if(F.slack>2.2){ msg("線太鬆，魚掙脫了……"); F.ov.querySelectorAll(".lf-prog,.lf-bar").forEach(e=>e.remove()); F.ph="miss"; F.t=0; } } }
/* ---------- the fish book ---------- */
let dexTab="r";
function dex(){ const d=LF(), got=FISH.filter(f=>d.fish[f.id]).length; const tabs=[["r","淡水"],["o","海水"]];
  const list=FISH.filter(f=>dexTab==="o"?f.w.includes("o"):!f.w.includes("o"));
  openSheet("lfDex","📖 圖鑑・魚",`<p class="lead">釣到 ${got} / ${FISH.length} 種。沒釣過的只看得到黑影。</p><div class="row">${tabs.map(t=>`<button class="${dexTab===t[0]?"primary":"secondary"}" data-act="lfDexTab" data-v="${t[0]}">${t[1]}</button>`).join("")}</div>
   <div class="lf-dex">${list.map(f=>{ const e=d.fish[f.id]; return `<button data-act="lfDexOne" data-v="${f.id}" class="${e?"":"no"}"><img src="${fishIcon(f.id,!e)}" alt=""><b>${e?f.n:"？？？"}</b>${e?`<small>${e[0]} 條</small>`:`<small>${"★".repeat(f.r)}</small>`}</button>`; }).join("")}</div><p class="note">之後會加上蟲、花、貝殼的圖鑑。</p>`); }
HANDLERS.lfDexTab=v=>{ dexTab=v; dex(); };
HANDLERS.lfDexOne=v=>{ const f=FBY[v], e=LF().fish[v]; if(!f) return; const when=f.t?f.t.split("").map(c=>SLOTN[+c]).join("、"):"整天";
  openSheet("lfDexOne","📖 "+(e?f.n:"？？？"),`<div class="lf-card"><img src="${fishIcon(f.id,!e)}" alt=""><div class="nm">${e?f.n:"還沒釣到"}</div><div class="st">${"★".repeat(f.r)}${"☆".repeat(4-f.r)}　${RN[f.r]}・${f.w.includes("o")?"海水魚":"淡水魚"}</div>
   ${e?`<p class="lead" style="margin:8px 0">${f.d}</p><p class="note">出沒：${f.w.split("").map(c=>WN[c]).join("、")}｜時段：${when}${f.need==="rain"?"｜要下雨":""}${f.need==="star"?"｜流星夜":""}<br>釣過 ${e[0]} 條，最大 ${e[1]} 公分。</p>`:`<p class="lead" style="margin:8px 0">出沒：${f.w.split("").map(c=>WN[c]).join("、")}。其他的要自己釣釣看，或問問鎮上的人。</p>`}<div class="row"><button class="secondary" data-act="lfDex">回圖鑑</button></div></div>`); };
HANDLERS.lfDex=()=>dex(); L.dex=dex;
/* ---------- selling, the tackle shop ---------- */
function sellSheet(kind){ const d=LF(), cnt={}; d.inv.forEach(([id,s])=>{ const c=cnt[id]||(cnt[id]={n:0,v:0}); c.n++; c.v+=price(FBY[id],s); }); const tot=Object.values(cnt).reduce((a,c)=>a+c.v,0);
  return `${Object.keys(cnt).length?Object.keys(cnt).map(id=>`<div class="lf-row"><img src="${fishIcon(id)}" alt=""><div class="t"><b>${FBY[id].n}</b> ×${cnt[id].n}<br><small>共 ${cnt[id].v} 平安幣</small></div><button class="secondary" data-act="lfSell" data-v="${kind}:${id}">賣</button></div>`).join("")+`<div class="row" style="margin-top:8px"><button class="primary" data-act="lfSell" data-v="${kind}:*">全部賣掉・${tot} 幣</button></div>`:`<p class="note">背包裡還沒有魚。</p>`}`; }
function sell(id){ const d=LF(); let got=0, n=0; d.inv=d.inv.filter(([i,s])=>{ if(id==="*"||i===id){ got+=price(FBY[i],s); n++; return false; } return true; }); if(!n) return 0; bag.coins+=got; save(); try{ profSave(true); chaChing(); }catch(e){} toast(`賣了 ${n} 條魚，拿到 ${got} 平安幣`,2400); return got; }
function tackle(){ const d=LF(); const rods=[[1,"竹釣竿",300,"可以在所有水邊釣魚。"],[2,"好釣竿",1800,"綠色區比較寬，也比較容易遇到稀有的魚。"]];
  openSheet("lfTackle","🎣 釣具行",`<p class="lead">老闆：「河、溪、泉水、海邊都能釣，有水的地方就有魚。淡水魚跟海水魚不一樣喔。」</p>
   ${rods.map(r=>`<div class="lf-row"><div class="t"><b>${r[1]}</b>　${r[2]} 幣<br><small>${r[3]}</small></div>${d.rod>=r[0]?`<button class="secondary" disabled>已擁有</button>`:`<button class="primary" data-act="lfRod" data-v="${r[0]}">${me.sp?"拿":"買"}</button>`}</div>`).join("")}
   <h4 style="margin:14px 0 4px">收購魚</h4>${sellSheet("t")}<div class="row" style="margin-top:10px"><button class="secondary" data-act="lfDex">📖 魚圖鑑</button></div>`); }
HANDLERS.lfRod=v=>{ const d=LF(), n=+v, p=n===1?300:1800; if(d.rod>=n) return; if(!me.sp){ if(bag.coins<p){ try{ buzz(); }catch(e){} toast(`平安幣不夠（還差 ${p-bag.coins}）`,2400); return; } bag.coins-=p; } d.rod=n; save(); try{ profSave(true); chaChing(); }catch(e){} toast(n===1?"買了竹釣竿！走到水邊就會出現「🎣 釣魚」":"換了好釣竿！",3000); tackle(); };
HANDLERS.lfSell=v=>{ const [k,id]=v.split(":"); sell(id); if(k==="t") tackle(); else grocer(); };
function grocer(){ openSheet("lfGrocer","🧺 雜貨店",`<p class="lead">阿姨：「魚啊、種的菜跟花，我都收。」</p><h4 style="margin:10px 0 4px">收購魚</h4>${sellSheet("g")}${L.cropSell?L.cropSell():""}`); }
/* ---------- the bag ---------- */
L.bagEntries=(out,tab)=>{ if(tab!=="all"&&tab!=="goods") return; const d=LF(), cnt={}; d.inv.forEach(([id])=>cnt[id]=(cnt[id]||0)+1); Object.keys(cnt).forEach(id=>{ const f=FBY[id]; out.push({id:"lf:"+id,ic:"lf_"+id,n:cnt[id],name:f.n,desc:`${f.w.includes("o")?"海水魚":"淡水魚"}・${RN[f.r]}。${f.d}可以到釣具行或雜貨店賣。`}); }); };
L.bagActs=(k,e)=>`<button class="chip" data-act="lfDex">看圖鑑</button>`;
/* ---------- stations in the town ---------- */
L.station=k=>{ if(k==="tw:tackle"){ tackle(); return true; } if(k==="tw:grocer"){ grocer(); return true; } if(k==="tw:fish"){ toast(LF().rod||me.sp?"站到水邊就能釣魚，按「🎣 釣魚」":"先到老街的釣具行買釣竿，就能在水邊釣魚",3000); return true; } return L.more?L.more(k):false; };
L.tick=dt=>{ try{ fishTick(dt); }catch(e){ console.warn("fish",e); F&&endFish(); } try{ L.tick2&&L.tick2(dt); }catch(e){ console.warn("life",e); } };

/* ---------- 女神泉: toss a coin in, the goddess rises and asks which one was yours (once a day) ---------- */
const today=()=>{ try{ return dayN(); }catch(e){ return Math.floor((Date.now()+288e5)/864e5); } };
let GD=null;
function goddessRise(){ const g=new T.Group(); g.position.set(104,-2.4,-183); scene.add(g); const M=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.5},o||{}));
  const robe=new T.Mesh(new T.ConeGeometry(.75,2.2,20,1,true),M("#e8f4ff",{side:T.DoubleSide,emissive:"#9fd8ff",emissiveIntensity:.35})); robe.position.y=1.1; g.add(robe);
  const body=new T.Mesh(new T.CylinderGeometry(.24,.34,.8,14),M("#f6fbff",{emissive:"#cfeaff",emissiveIntensity:.3})); body.position.y=2.25; g.add(body);
  const head=new T.Mesh(new T.SphereGeometry(.27,18,14),M("#ffe3d2")); head.position.y=2.86; g.add(head);
  const hair=new T.Mesh(new T.SphereGeometry(.3,18,14,0,6.283,0,1.9),M("#d6ecff",{emissive:"#9fd8ff",emissiveIntensity:.3})); hair.position.set(0,2.92,-.04); g.add(hair);
  const back=new T.Mesh(new T.CylinderGeometry(.26,.42,1.1,14,1,true,Math.PI*.6,Math.PI*.8),M("#d6ecff",{side:T.DoubleSide,emissive:"#9fd8ff",emissiveIntensity:.3})); back.position.set(0,2.35,-.08); g.add(back);
  for(const s of [-1,1]){ const e=new T.Mesh(new T.SphereGeometry(.035,8,6),M("#3a4a6a")); e.position.set(s*.09,2.88,.25); g.add(e); const a=new T.Mesh(new T.CylinderGeometry(.06,.07,.7,8),M("#f6fbff",{emissive:"#cfeaff",emissiveIntensity:.3})); a.position.set(s*.36,2.3,.12); a.rotation.z=s*.5; a.rotation.x=-.6; g.add(a); }
  const halo=new T.Mesh(new T.TorusGeometry(.38,.035,8,32),new T.MeshBasicMaterial({color:"#ffe58a",toneMapped:false})); halo.position.set(0,3.25,-.12); halo.rotation.x=-.3; g.add(halo);
  const glow=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:new T.Color("#bfe8ff"),transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,opacity:.8})); glow.scale.set(5,6,1); glow.position.y=2; g.add(glow);
  const coins=[]; [["#ffd84a",-.9],["#e0e4ea",0],["#c9a24a",.9]].forEach(([c,x])=>{ const k=new T.Mesh(new T.CylinderGeometry(.18,.18,.04,20),new T.MeshStandardMaterial({color:c,metalness:.7,roughness:.25,emissive:c,emissiveIntensity:.15})); k.rotation.x=Math.PI/2; k.position.set(x,3.7,.3); k.visible=false; g.add(k); coins.push(k); });
  GD={g,t:0,coins,ph:"up"}; try{ [523,784,1047,1319,1568].forEach((f,k)=>tone(f,.4,.04,"sine",k*.18)); }catch(e){} }
function goddessTick(dt){ if(!GD) return; GD.t+=dt; const g=GD.g; if(GD.ph==="up"){ g.position.y=-2.4+Math.min(1,GD.t/2.2)*2.2; if(GD.t>2.4){ GD.ph="ask"; GD.coins.forEach(c=>c.visible=true); askGoddess(); } }
  if(GD.ph==="down"){ g.position.y-=dt*1.4; if(g.position.y<-3){ scene.remove(g); g.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material&&o.material!==glowTex) o.material.dispose(); }); GD=null; return; } }
  g.children.forEach(o=>{ if(o.isMesh&&o.geometry.type==="CylinderGeometry"&&o.visible&&o.position.y>3.5) o.rotation.z+=dt*2; }); g.rotation.y=Math.sin(GD.t*.6)*.08; g.position.y+=Math.sin(GD.t*1.5)*.002; }
function askGoddess(){ openSheet("lfGod","✨ 湖之女神",`<p class="lead">泉水發出光，一位女神緩緩升起：「你掉進泉裡的，是這枚<b>金色</b>的平安幣、這枚<b>銀色</b>的，還是這枚<b>普通</b>的平安幣呢？」</p><div class="row"><button class="secondary" data-act="lfGodPick" data-v="g">金色的</button><button class="secondary" data-act="lfGodPick" data-v="s">銀色的</button><button class="primary" data-act="lfGodPick" data-v="n">普通的</button></div>`); }
HANDLERS.lfGodPick=v=>{ closeSheet(); const d=LF(); if(GD) GD.ph="down"; if(v==="n"){ bag.coins+=100+500; bag.gacha=Math.min(255,(bag.gacha||0)+1); d.godOK=(d.godOK|0)+1; save(); try{ profSave(true); chaChing(); }catch(e){}
    setTimeout(()=>openSheet("lfGod2","✨ 湖之女神",`<p class="lead">「誠實的孩子，這三枚都送給你吧。」</p><p class="note">拿回你的平安幣，另外得到 500 平安幣和 1 枚扭蛋幣。明天再來吧。</p>`),400); }
  else { save(); try{ tone(220,.4,.05,"sine"); }catch(e){} setTimeout(()=>openSheet("lfGod2","✨ 湖之女神",`<p class="lead">女神微微一笑，什麼也沒說，帶著光沉回了泉底……</p><p class="note">你丟下去的平安幣沒有回來。明天再來試試吧。</p>`),400); } };
function goddess(){ const d=LF(); if(GD) return; if(d.god===today()&&!me.sp){ toast("泉水靜靜的。女神今天已經出現過了，明天再來吧",2600); return; }
  openSheet("lfGodAsk","⛲ 女神泉",`<p class="lead">清澈的泉水微微發光。傳說丟一枚平安幣下去許願，會發生好事。</p><div class="row"><button class="primary" data-act="lfGodToss">丟 100 平安幣下去</button></div><p class="note">一天一次。</p>`); }
HANDLERS.lfGodToss=()=>{ const d=LF(); if(bag.coins<100&&!me.sp){ toast("平安幣不夠",2000); return; } if(!me.sp) bag.coins-=100; d.god=today(); save(); closeSheet(); try{ tone(1200,.08,.05,"sine"); tone(600,.3,.04,"sine",.15); }catch(e){} toast("噗通——",1400); setTimeout(goddessRise,900); };
/* ---------- 營火, 海邊咖啡, 躺椅 ---------- */
const energy=n=>{ bag.en=Math.min(100,(bag.en??100)+n); save(); try{ SHOPX&&SHOPX.wallet&&SHOPX.wallet(); }catch(e){} };
function camp(){ const d=LF(); const n=d.mm===today()?(d.mmN|0):0; openSheet("lfCamp","🔥 營火",`<p class="lead">營火劈哩啪啦地燒著，從山頂看得到整個小鎮。</p><div class="row"><button class="primary" data-act="lfMallow" ${n>=3?"disabled":""}>🍡 烤棉花糖（今天 ${n}/3）</button></div><p class="note">烤到金黃色就拿起來：太早不熟，太晚會焦。烤得好精力 +5。</p>`); }
let MM=null;
HANDLERS.lfMallow=()=>{ const d=LF(); if(d.mm!==today()){ d.mm=today(); d.mmN=0; } if(d.mmN>=3) return; MM={t:0,ready:2.5+Math.random()*2}; openSheet("lfMallow","🍡 烤棉花糖",`<p class="lead" id="lfMm">慢慢轉……</p><div class="row"><button class="primary" data-act="lfMallowUp">拿起來！</button></div>`); };
HANDLERS.lfMallowUp=()=>{ if(!MM) return; const d=LF(), dt=MM.t-MM.ready; MM=null; d.mmN=(d.mmN|0)+1; save(); let t;
  if(dt<0) t="還是白白的，沒烤熟……"; else if(dt<1.4){ t="金黃酥脆，完美！精力 +5"; energy(5); try{ [784,988,1175].forEach((f,k)=>tone(f,.12,.05,"triangle",k*.08)); }catch(e){} } else t="烤焦了，黑黑的……還是吃掉吧。";
  openSheet("lfMallow","🍡 烤棉花糖",`<p class="lead">${t}</p><div class="row"><button class="secondary" data-act="lfCamp">回營火</button></div>`); };
HANDLERS.lfCamp=()=>camp();
function mmTick(dt){ if(!MM) return; MM.t+=dt; const el=document.getElementById("lfMm"); if(el){ const k=MM.t-MM.ready; el.textContent=k<-1?"慢慢轉……":k<0?"快好了……":k<1.4?"✨ 金黃色了！":"冒煙了！"; } }
const DRINKS=[["coco","椰子汁",60,15],["mango","芒果冰",90,25],["latte","冰咖啡",45,10]];
function cafe(){ openSheet("lfCafe","☕ 海邊咖啡",`<p class="lead">「來杯涼的吧！」</p>${DRINKS.map(k=>`<div class="lf-row"><div class="t"><b>${k[1]}</b>　${k[2]} 幣<br><small>精力 +${k[3]}</small></div><button class="primary" data-act="lfDrink" data-v="${k[0]}">買來喝</button></div>`).join("")}`); }
HANDLERS.lfDrink=v=>{ const k=DRINKS.find(q=>q[0]===v); if(!k) return; if(!me.sp){ if(bag.coins<k[2]){ try{ buzz(); }catch(e){} toast("平安幣不夠",2000); return; } bag.coins-=k[2]; } energy(k[3]); try{ chaChing(); }catch(e){} toast(`喝了${k[1]}，精力 +${k[3]}`,2200); cafe(); };
L.more=k=>{ if(k==="tw:goddess"){ goddess(); return true; } if(k==="tw:camp"){ camp(); return true; } if(k==="tw:cafe"){ cafe(); return true; } if(k==="tw:lounge"){ toast("🏖️ 躺在躺椅上，聽著一波一波的海浪……",2800); return true; } return L.more2?L.more2(k):false; };
L.tick2=dt=>{ goddessTick(dt); mmTick(dt); if(L.tick3) L.tick3(dt); };
setTimeout(()=>{ try{ chipInit(); }catch(e){} },1800);
L.dbg=()=>({F,near,LF:LF(),pool}); L.press=()=>press(); L.start=()=>startFish();
return L; })();

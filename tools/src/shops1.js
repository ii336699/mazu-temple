/* ================= 商店街 (north of the 禪房): 便利商店 (購物・打工), 夾娃娃機, 服飾店, and 精力 =================
   The three shops stand in a row on a stone plaza beside the inn; a path along the inn's west wall leads there from the inn's front path.
   Inside a shop the game draws a small scene of its own (the temple is not drawn meanwhile), with its own buttons on top. */
SHOPX=(()=>{
const SX={on:false,busy:false,mode:null};
const PATHR=[34.45,36.65,-26.5,-13.3], PLAZA=[25.5,57.5,-13.95,-8.7];
const inR=(r,x,z,m=0)=>x>r[0]+m&&x<r[1]-m&&z>r[2]+m&&z<r[3]-m;
SX.walk=()=>false; SX.inP=()=>false; /* (the street is part of the 禪房 grounds now: innWalkableL) */
if(typeof bag.en!=="number") bag.en=100; bag.snk=bag.snk&&typeof bag.snk==="object"?bag.snk:{}; bag.clo=bag.clo|0;
const EN_SHIFT=33, CLAW_COST=50, EN_REC_MAX=66; /* 精力: 100 each day; a shift costs 33 (three a day); up to 66 can be won back per day */
/* daily limits: 打工 five shifts a day, 夾娃娃 five wins a day */
const WORK_MAX=3, CLAW_WIN_MAX=5;
function dayCount(k){ if(bag[k+"Day"]!==today){ bag[k+"Day"]=today; bag[k]=0; } return bag[k]|0; }
function dayAdd(k){ dayCount(k); bag[k]=(bag[k]|0)+1; saveBag(); }
const GACHA_PRICE=1000;
/* snacks: 平安幣 price in the shop, 精力 they give back, and the NT$ shelf price used in the cashier game */
const SNACKS=[
  {k:"drink",n:"草莓汽水",p:35,e:10,nt:30,col:"#ef7d98",tag:"汽水"},
  {k:"cookie",n:"奶油餅乾",p:15,e:5,nt:35,col:"#e7b33c",tag:"餅乾"},
  {k:"noodle",n:"洋芋片",p:45,e:15,nt:39,col:"#efb02e",tag:"洋芋片"},
  {k:"energy",n:"柳橙汁",p:99,e:33,nt:35,col:"#f39a3a",tag:"果汁"},
  {k:"beer",n:"礦泉水",p:20,e:6,nt:20,col:"#5aa7e6",tag:"礦泉水"},
  {k:"bread",n:"水果糖",p:30,e:10,nt:29,col:"#f08bb4",tag:"糖果"}];
/* (the keys stay as they were so old save codes keep their counts: drink 汽水, cookie 餅乾, noodle 洋芋片, energy 柳橙汁, beer 礦泉水, bread 糖果) */
const SN=Object.fromEntries(SNACKS.map(s=>[s.k,s]));
/* ---------- snack pictures (drawn once, used in the bag, the shop and the cashier) ---------- */
function drawSnack(x,k,w,h){ x.clearRect(0,0,w,h); x.save(); x.translate(w/2,h/2); const s=w/100; x.scale(s,s); x.lineJoin="round"; x.lineCap="round";
  const rr=(X,Y,W,H,r)=>{ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+W,Y,X+W,Y+H,r); x.arcTo(X+W,Y+H,X,Y+H,r); x.arcTo(X,Y+H,X,Y,r); x.arcTo(X,Y,X+W,Y,r); x.closePath(); };
  const shine=(X,Y,W,H)=>{ x.fillStyle="rgba(255,255,255,.35)"; rr(X,Y,W,H,W/2); x.fill(); };
  const txt=(t,y,sz,c)=>{ x.fillStyle=c; x.font=`900 ${sz}px ${UI_FONT}`; x.textAlign="center"; x.textBaseline="middle"; x.fillText(t,0,y); };
  if(k==="drink"){ x.fillStyle="#7a2f17"; rr(-17,-30,34,72,10); x.fill(); x.fillStyle="#b4502e"; rr(-15,-28,30,68,9); x.fill(); x.fillStyle="#f2efe6"; rr(-11,-46,22,18,4); x.fill(); x.fillStyle="#d9d4c6"; x.fillRect(-11,-34,22,4); x.fillStyle="#fff7e0"; rr(-17,-6,34,26,3); x.fill(); txt("紅茶",7,14,"#9c2b16"); shine(-12,-24,6,40); }
  if(k==="cookie"){ x.rotate(-.12); x.fillStyle="#b9801c"; rr(-30,-34,60,72,6); x.fill(); x.fillStyle="#f4c44a"; rr(-28,-36,56,70,6); x.fill(); x.fillStyle="#4f9a44"; x.fillRect(-28,-36,56,16); txt("蔥餅乾",-28,13,"#fff"); for(let i=0;i<3;i++){ x.fillStyle="#e2a64a"; x.beginPath(); x.arc(-15+i*15,8,10,0,7); x.fill(); x.fillStyle="#3f8a3b"; x.fillRect(-18+i*15,5,6,3); }
    x.fillStyle="#c0392b"; x.font=`900 11px ${UI_FONT}`; x.textAlign="center"; x.fillText("香脆",0,28); }
  if(k==="noodle"){ x.fillStyle="#c9c3b6"; x.beginPath(); x.ellipse(0,-30,34,9,0,0,7); x.fill(); x.fillStyle="#f2efe8"; x.beginPath(); x.moveTo(-32,-28); x.lineTo(32,-28); x.lineTo(24,38); x.lineTo(-24,38); x.closePath(); x.fill(); x.fillStyle="#cf3b2a"; x.beginPath(); x.moveTo(-30,-12); x.lineTo(30,-12); x.lineTo(26,20); x.lineTo(-26,20); x.closePath(); x.fill(); txt("牛肉麵",4,14,"#fff");
    x.fillStyle="#efe8d7"; x.beginPath(); x.ellipse(0,-31,33,8,0,0,7); x.fill(); x.strokeStyle="#cf3b2a"; x.lineWidth=2; x.stroke(); x.fillStyle="#cf3b2a"; x.beginPath(); x.moveTo(26,-34); x.lineTo(40,-44); x.lineTo(42,-38); x.closePath(); x.fill(); }
  if(k==="energy"){ x.fillStyle="#1d4f97"; rr(-16,-40,32,82,8); x.fill(); x.fillStyle="#2d78d2"; rr(-14,-38,28,78,7); x.fill(); x.fillStyle="#c9d2dc"; rr(-14,-44,28,8,3); x.fill(); x.fillStyle="#ffe14a"; x.beginPath(); x.moveTo(4,-26); x.lineTo(-9,2); x.lineTo(0,2); x.lineTo(-5,26); x.lineTo(10,-6); x.lineTo(1,-6); x.closePath(); x.fill(); shine(-11,-32,5,60); }
  if(k==="beer"){ x.fillStyle="#a8791a"; rr(-18,-38,36,80,8); x.fill(); x.fillStyle="#e4b230"; rr(-16,-36,32,76,7); x.fill(); x.fillStyle="#d8dde2"; rr(-16,-42,32,8,3); x.fill(); x.fillStyle="#fff"; x.fillRect(-16,-8,32,18); txt("啤酒",1,13,"#2f6a3a"); x.fillStyle="#2f6a3a"; x.fillRect(-16,12,32,4); shine(-12,-30,5,58); }
  if(k==="bread"){ x.fillStyle="rgba(255,255,255,.55)"; rr(-40,-32,80,66,14); x.fill(); x.strokeStyle="rgba(180,190,200,.8)"; x.lineWidth=2; x.stroke(); x.fillStyle="#c27a2c"; x.beginPath(); x.ellipse(0,4,32,24,0,0,7); x.fill(); x.fillStyle="#e7ae52"; x.beginPath(); x.ellipse(0,0,30,21,0,0,7); x.fill(); x.strokeStyle="#c78533"; x.lineWidth=2;
    for(let i=-3;i<=3;i++){ x.beginPath(); x.moveTo(i*9-14,-18); x.lineTo(i*9+14,20); x.stroke(); x.beginPath(); x.moveTo(i*9+14,-18); x.lineTo(i*9-14,20); x.stroke(); } x.fillStyle="#d84b3a"; x.fillRect(-8,-36,16,6); }
  x.restore(); }
function snackIcon(k){ return "shop/sn-"+k+".webp"; } /* the chair's pictures (public/shop/sn-*.webp) */
SX.bic=(k,cls="")=>`<span class="bic ${cls}" style="background:url(${snackIcon(k.slice(3))}) center/contain no-repeat"></span>`;
const snImg=(k,sz=40)=>`<img src="${snackIcon(k)}" width="${sz}" height="${sz}" alt="" style="display:block">`;
/* ---------- 精力 ---------- */
/* a new day: 精力 back to 100, and the day's 66 points of rest start again */
function enDay(){ if(bag.enDay!==today){ bag.enDay=today; bag.en=100; bag.enRec=0; try{ saveBag(); }catch(e){} } }
enDay();
const recLeft=()=>{ enDay(); return Math.max(0,EN_REC_MAX-(bag.enRec||0)); };
const en=()=>Math.round(bag.en);
SX.wallet=()=>{ let e=$("#enCap"); const cap=document.querySelector("#bagBtn .cap"); if(!e&&cap){ e=document.createElement("span"); e.id="enCap"; cap.appendChild(e); } if(e) e.textContent=`⚡${en()}`; };
SX.bagTop=()=>`<div class="inv-top"><span class="inv-coin">⚡<b>${en()}</b>精力</span><span class="inv-note">每天 100；打工一班要 ${EN_SHIFT}。今天還能恢復 ${Math.round(recLeft())}（每天最多 ${EN_REC_MAX}）：套房的床最快，再來通鋪、溫泉、禪堂靜坐，吃東西最方便</span></div>`;
function enAdd(v){ const b=en(); let g=v; if(v>0){ g=Math.min(v,100-bag.en,recLeft()); bag.enRec=(bag.enRec||0)+Math.max(0,g); } bag.en=Math.max(0,Math.min(100,bag.en+g)); if(Math.round(bag.en)!==b){ SX.wallet(); } return g; }
let enAcc=0, enSave=0, enWhy="", enNote=0;
/* 恢復速度 (精力 per second): 套房的床 fastest, then 通鋪, 溫泉, 禪堂靜坐 */
/* 恢復: the dearer, the faster. 套房 (100 幣) 66 in a minute (all of a day's rest in one stay); 通鋪 (50 幣) 33 in a minute;
   溫泉 and 禪堂 are free but slow (33 in about 3½ and 5½ minutes). Snacks are instant and cost the most per point. */
const REGEN={bed:1.1,futon:.55,onsen:.15,zen:.1}, SESS_MAX={bed:66,futon:33,onsen:99,zen:99}; let sess=0;
SX.tick=dt=>{ let why="";
  try{ const st=meAv.seat>=0?SEATS[meAv.seat]:null; if(st&&meAv.kneel>.6){ if(st.kind==="bed") why="bed"; else if(st.kind==="futon") why="futon"; else if(st.zen) why="zen"; else if(st.kind==="tub") why="onsen"; }
    if(!why&&(meAv.gy||0)<1&&innPool(meAv.pos.x,meAv.pos.y)) why="onsen"; }catch(e){}
  if(why!==enWhy) sess=0;
  if(why&&bag.en<100&&recLeft()>0&&sess<SESS_MAX[why]){ const b=Math.floor(bag.en); const g=enAdd(Math.min(REGEN[why]*dt,SESS_MAX[why]-sess)); sess+=g; if(Math.floor(bag.en)!==b) SX.wallet(); enSave+=dt; if(enSave>8){ enSave=0; save("mz.bag",bag); }
    if(recLeft()<=0||sess>=SESS_MAX[why]-.01){ toast(recLeft()<=0?"今天的精力恢復已經到上限了（每天最多 66）":why==="futon"?"睡飽了，通鋪一次最多恢復 33":"恢復飽滿了 ⚡",2800); }
    if(why!==enWhy&&performance.now()-enNote>20000){ enNote=performance.now(); toast({bed:"躺在套房的床上，精力恢復得最快（一次最多 66）⚡",futon:"在通鋪睡一下，精力恢復中（一次最多 33）⚡",onsen:"泡溫泉，精力慢慢恢復 ⚡",zen:"靜坐養神，精力慢慢恢復 ⚡"}[why],2600); } }
  else if(enWhy&&!why) save("mz.bag",bag);
  enWhy=why; if(SX.on&&SX.cur&&SX.cur.update) SX.cur.update(dt); if(!SX.on&&WORLD.ready) worldTick(dt); };
/* ---------- bag: snacks ---------- */
SX.bagEntries=(out,tab)=>{ if(tab!=="all"&&tab!=="goods") return; SNACKS.forEach(s=>{ const n=bag.snk[s.k]||0; if(n) out.push({id:"s:"+s.k,ic:"sn_"+s.k,n,name:s.n,desc:`便利商店買的${s.tag}。吃了精力 +${s.e}。`}); }); };
SX.bagActs=(k,e)=>e.n?`<button class="chip" data-act="snEat" data-v="${k}">${/drink|energy|beer/.test(k)?"喝掉":"吃掉"}（精力 +${SN[k].e}）</button>`:"";
function eat(k,fromBag){ const s=SN[k]; if(!s) return false; if(bag.en>=100){ toast("精力已經是滿的了",1800); return false; } if(recLeft()<=0){ toast("今天的精力恢復已經到上限了（每天最多 66），明天再吃吧",2600); return false; } if(fromBag){ if(!(bag.snk[k]>0)) return false; bag.snk[k]--; }
  enAdd(s.e); saveBag(); markDirty(); try{ tone(880,.08,.08,"triangle"); tone(1320,.12,.06,"triangle",.08); }catch(e){}
  if(!SX.on){ meAv.say(k==="beer"?"嗝～ 精力 +"+s.e:k==="energy"?"精神來了！精力 +"+s.e:"好吃！精力 +"+s.e,"#ffe066",2.4); } return true; }
HANDLERS.snEat=k=>{ if(eat(k,true)){ toast(`${SN[k].n}：精力 +${SN[k].e}（現在 ${en()}）`,2200); if(sheetKind==="bag") openBag(); } };
/* ---------- little voice (the 收驚阿嬤 squeaky babble, without the face) ---------- */
function babble(dur,pitch=1){ const a=soundOn?ensureAudio():null; const v=sVol(); if(!a||v<=0) return; let t=0; const F=[[800,1200],[400,2200],[300,2700],[500,900],[350,800]];
  while(t<dur){ const d=.07+Math.random()*.11, gap=.02+Math.random()*.06, at=a.currentTime+.04+t, f0=(380+Math.random()*320)*pitch, fm=F[(Math.random()*F.length)|0];
    const o=a.createOscillator(); o.type="sawtooth"; o.frequency.setValueAtTime(f0,at); o.frequency.linearRampToValueAtTime(f0*(Math.random()<.5?1.35:.8),at+d);
    const g=a.createGain(); g.gain.setValueAtTime(0,at); g.gain.linearRampToValueAtTime(.13*v,at+.015); g.gain.linearRampToValueAtTime(0,at+d); g.connect(sfxBus(a));
    for(const fr of fm){ const bp=a.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=fr*1.25; bp.Q.value=6; o.connect(bp).connect(g); } o.start(at); o.stop(at+d+.05); t+=d+gap; if(Math.random()<.12) t+=.15; } }
const beep=()=>{ try{ tone(1760,.07,.07,"square"); }catch(e){} };
const chaChing=()=>{ try{ tone(1318,.08,.09,"triangle"); tone(1760,.18,.09,"triangle",.07); tone(2093,.25,.05,"sine",.14); }catch(e){} };
const buzz=()=>{ try{ tone(150,.22,.12,"sawtooth"); tone(110,.25,.1,"sawtooth",.05); }catch(e){} };

/* ---------- 元氣早餐店：疊漢堡 (11/14) — the 擠冰淇淋 rules: the next layer swings left and right above the stack, tap to drop it; land it
   over the layer below or it slides off and the game ends. A bun at the bottom, a bun on top (it goes on by itself when you stop, or when
   something falls), fillings in between at random. The higher the stack, the higher the camera climbs: the shop table, the clouds and the
   birds, space and the UFO, the galaxy, then heaven, where 媽祖, 千里眼 and 順風耳 can't believe their eyes.
   Prizes by height: 10 / 20 / 30 / 40 / 50 (1 扭蛋幣 + 1000) / 100 (2 扭蛋幣 + 2000); 50 and 100 once a day each. One more, unannounced,
   at 1000. 30 平安幣 a game; the first 10 games each day pay prizes. ---------- */
const BG_ING={bun_bot:26,beef:24,chicken:24,cheese:11,lettuce:13,tomato:15,onion:13,pickle:13,bacon:11,egg:13,mushroom:16,ketchup:9,mayo:9,bun_top:30}; /* how much each adds to the height (px, at 130 px wide) */
const BG_FILL=["beef","chicken","cheese","lettuce","tomato","onion","pickle","bacon","egg","mushroom","ketchup","mayo"];
const BG_TIER=[[10,100,0],[20,250,0],[30,450,0],[40,700,0],[50,1000,1],[100,2000,2]];
const BG_IMG={}; function bgImg(n){ let i=BG_IMG[n]; if(!i){ i=new Image(); i.decoding="async"; i.src="burger/"+n+".webp"; BG_IMG[n]=i; } return i; }
const BGD=()=>{ const d=LF(); d.bg=d.bg||{best:0,h:0}; if(!d.bgd||d.bgd.d!==today()) d.bgd={d:today(),n:0,t50:0,t100:0}; return d; };
let BG=null;
function bfastOpen(){ const d=BGD(), b=d.bg;
  openSheet("lfBf","🍔 元氣早餐店",`<p class="lead">老闆娘：「來，疊一個最高的漢堡給我看！疊得越高，獎勵越好喔。」</p>
  <p class="note">料會在上面左右晃，點一下放下去。要疊在下面那層上，歪太多就會滑掉、遊戲結束。隨時可以按「蓋上麵包」收工。</p>
  <div class="lf-row" style="display:block"><b>獎勵</b><br><small>${BG_TIER.map(t=>`${t[0]} 層：${t[1]} 平安幣${t[2]?` ＋ ${t[2]} 枚扭蛋幣`:""}`).join("<br>")}<br>10 層以下：每層 8 平安幣。</small></div>
  <p class="note">一次 30 平安幣；每天前 10 次有獎勵；50 層和 100 層的大獎每天各一次。${b.best?`<br>你的最高紀錄：${b.best} 層。`:""}</p>
  <div class="row"><button class="primary" data-act="lfBg">開始（30 幣）</button></div>`); }
HANDLERS.lfBg=()=>{ closeSheet(); bgStart(); };
function bgStart(){ if(!pay()) return; ["shop","bun_bot","bun_top",...BG_FILL,"bird","ufo","mazu","qianli","shunfeng"].forEach(bgImg);
  const ov=document.createElement("div"); ov.className="lf-ov"; ov.style.cssText="position:fixed;inset:0;z-index:9000;background:#000;touch-action:none";
  ov.innerHTML=`<canvas id="bgC" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
   <div style="position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 10px);text-align:center;pointer-events:none;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.7)"><div id="bgN" style="font:900 34px ${UI_FONT}">0 層</div><div id="bgT" style="font:700 13px ${UI_FONT};opacity:.9"></div></div>
   <button class="lf-x" id="bgX">離開</button><button class="secondary" id="bgS" style="position:absolute;left:12px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:2">🍞 蓋上麵包</button>`;
  document.body.appendChild(ov); const cv=ov.querySelector("#bgC"), dpr=Math.min(2,window.devicePixelRatio||1);
  const fit=()=>{ cv.width=innerWidth*dpr; cv.height=innerHeight*dpr; }; fit(); addEventListener("resize",fit);
  const W=()=>innerWidth, H=()=>innerHeight;
  BG={ov,cv,x:cv.getContext("2d"),dpr,fit,t:0,ph:0,cx:0,stack:[{k:"bun_bot",x:W()/2,y:0,h:BG_ING.bun_bot}],top:BG_ING.bun_bot,next:bgPick(),drop:null,fall:[],cam:0,over:false,n:0,perfect:0,pops:[],seed:Math.random()*1e4,shake:0,lastTier:0};
  BG.cx=W()/2; window.MZ_NO3D=1;
  const tap=e=>{ if(e.target.closest&&e.target.closest("button")) return; e.preventDefault(); bgDrop(); };
  ov.addEventListener("pointerdown",tap); ov.querySelector("#bgX").onclick=()=>bgClose(true); ov.querySelector("#bgS").onclick=e=>{ e.stopPropagation(); bgFinish("收工！蓋上麵包。"); };
  bgHud(); let last=performance.now(); const loop=now=>{ if(!BG||BG.ov!==ov) return; const dt=Math.min(.05,(now-last)/1000); last=now; bgTick(dt); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
function bgPick(){ return BG_FILL[(Math.random()*BG_FILL.length)|0]; }
function bgClose(quit){ const B=BG; if(!B) return; BG=null; window.MZ_NO3D=0; removeEventListener("resize",B.fit); B.ov.remove(); }
function bgSpeed(n){ return 1.6+2.2*(1-Math.exp(-n/30)); }
function bgDrop(){ const B=BG; if(!B||B.drop||B.over) return; B.drop={k:B.next,x:B.dx,sy:B.dy,y:B.dyW,v:0}; B.next=bgPick(); try{ tone(440+Math.min(30,B.n)*18,.06,.05,"triangle"); }catch(e){} }
/* world y: up from the table, in px. On screen the stack top sits a little below the middle; the camera climbs with it */
function bgTick(dt){ const B=BG, x=B.x, W=innerWidth, H=innerHeight, d=B.dpr; B.t+=dt; x.setTransform(d,0,0,d,0,0);
  const TB=H*.86; /* the table line on screen when the camera is at the bottom */
  const want=Math.max(0,B.top-(TB-H*.55)); B.cam+=(want-B.cam)*Math.min(1,dt*3.5); const sy=wy=>TB-(wy-B.cam);
  const topL=B.stack[B.stack.length-1];
  /* the swinging layer: around the stack top, a little off to one side each time, faster the higher you go */
  if(!B.over){ B.ph+=dt*bgSpeed(B.n); B.dx=B.cx+Math.sin(B.ph)*Math.min(W*.36,135); B.dy=H*.17; B.dyW=TB-B.dy+B.cam; }
  bgSky(x,W,H,B,sy);
  /* the stack (only what is on screen) */
  for(const s of B.stack){ const y=sy(s.y); if(y<-80||y>H+80) continue; bgDraw(x,s.k,s.x,y,s.rot||0); }
  if(!B.over&&!B.drop){ x.globalAlpha=.92; bgDraw(x,B.next,B.dx,B.dy+(BG_ING[B.next]),0); x.globalAlpha=1; x.strokeStyle="rgba(255,255,255,.35)"; x.setLineDash([4,6]); x.beginPath(); x.moveTo(B.dx,B.dy+30); x.lineTo(B.dx,sy(B.top)-6); x.stroke(); x.setLineDash([]); }
  if(B.drop){ const q=B.drop; q.v+=dt*2600; q.y-=q.v*dt; const land=B.top+BG_ING[q.k];
    if(q.y<=land){ const off=q.x-topL.x, tol=130*.36;
      if(Math.abs(off)>tol){ B.fall.push({k:q.k,x:q.x,y:B.top,vx:Math.sign(off)*140,vy:120,r:0,vr:Math.sign(off)*4}); B.drop=null; try{ tone(200,.3,.06,"sawtooth"); }catch(e){} B.shake=.4; bgFinish("滑掉了……"); }
      else { const perfect=Math.abs(off)<5; const nx=perfect?topL.x:q.x; B.stack.push({k:q.k,x:nx,y:B.top,h:BG_ING[q.k]}); B.top+=BG_ING[q.k]; B.n++; B.drop=null;
        B.cx=nx+(Math.random()*2-1)*Math.min(50,B.n*2.5);
        if(perfect){ B.perfect++; B.pops.push({t:0,x:nx,y:B.top,s:"完美！"}); try{ tone(988,.08,.05,"triangle"); }catch(e){} }
        bgHud(); } }
    else bgDraw(x,q.k,q.x,sy(q.y-BG_ING[q.k]),0); }
  for(let i=B.fall.length-1;i>=0;i--){ const f=B.fall[i]; f.vy-=dt*1800; f.x+=f.vx*dt; f.y+=f.vy*dt; f.r+=f.vr*dt; bgDraw(x,f.k,f.x,sy(f.y),f.r); if(sy(f.y)>H+120) B.fall.splice(i,1); }
  for(let i=B.pops.length-1;i>=0;i--){ const p=B.pops[i]; p.t+=dt; const y=sy(p.y)-40-p.t*40; x.globalAlpha=Math.max(0,1-p.t/1.1); x.font=`900 20px ${UI_FONT}`; x.textAlign="center"; x.fillStyle="#fff3a0"; x.strokeStyle="rgba(120,60,0,.8)"; x.lineWidth=4; x.strokeText(p.s,p.x,y); x.fillText(p.s,p.x,y); x.globalAlpha=1; if(p.t>1.1) B.pops.splice(i,1); }
  if(B.shake>0) B.shake-=dt; }
function bgDraw(x,k,cx,yb,rot){ const im=bgImg(k); if(!im.complete||!im.naturalWidth) return; const w=130, h=w*im.naturalHeight/im.naturalWidth; x.save(); x.translate(cx,yb); if(rot) x.rotate(rot); x.drawImage(im,-w/2,-h,w,h); x.restore(); }
/* ---- the sky: one colour ladder by height, with things placed at fixed heights in the world ---- */
const BG_SKY=[[0,[255,236,200],[255,214,160]],[440,[150,205,255],[200,232,255]],[700,[96,160,232],[170,214,250]],[790,[40,60,130],[90,120,200]],[860,[10,14,40],[24,30,70]],[960,[24,10,52],[54,22,90]],[1110,[70,30,96],[150,80,140]],[1180,[255,214,150],[255,240,210]],[3000,[255,226,170],[255,246,224]],[14000,[255,232,190],[255,250,236]]];
function bgCol(y,j){ let a=BG_SKY[0], b=BG_SKY[BG_SKY.length-1]; for(let i=0;i<BG_SKY.length-1;i++){ if(y>=BG_SKY[i][0]&&y<BG_SKY[i+1][0]){ a=BG_SKY[i]; b=BG_SKY[i+1]; break; } } if(y>=b[0]) a=b; const t=a===b?0:(y-a[0])/(b[0]-a[0]); const c=a[j].map((v,i)=>Math.round(v+(b[j][i]-v)*t)); return `rgb(${c})`; }
function bgRnd(i){ const s=Math.sin(i*127.1+BG.seed)*43758.5; return s-Math.floor(s); }
function bgSky(x,W,H,B,sy){ const TB=H*.86, yTop=B.cam+TB, yBot=B.cam+TB-H; const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,bgCol(yTop,1)); g.addColorStop(1,bgCol(Math.max(0,yBot),2)); x.fillStyle=g; x.fillRect(0,0,W,H); const t=B.t;
  /* stars from space upward */ if(yTop>780){ for(let i=0;i<160;i++){ const wy=800+bgRnd(i)*(Math.max(yTop,1300)-800+400), sx=bgRnd(i+500)*W; const y=sy(wy); if(y<0||y>H) continue; const a=Math.max(0,Math.min(1,(wy-780)/120))*(.5+.5*Math.sin(t*2+i)); x.fillStyle=`rgba(255,255,255,${a*(wy>1160?.4:1)})`; x.fillRect(sx,y,1.6,1.6); } }
  /* the galaxy band and planets */ if(yTop>900&&yBot<1200){ x.save(); x.translate(W/2,sy(1030)); x.rotate(-.35); const gg=x.createRadialGradient(0,0,10,0,0,W*.9); gg.addColorStop(0,"rgba(255,220,255,.55)"); gg.addColorStop(.4,"rgba(170,120,255,.25)"); gg.addColorStop(1,"rgba(80,40,160,0)"); x.fillStyle=gg; x.scale(1,.28); x.beginPath(); x.arc(0,0,W*.9,0,7); x.fill(); x.restore();
    const pl=(wx,wy,r,c1,c2,ring)=>{ const y=sy(wy); const pg=x.createRadialGradient(wx-r*.3,y-r*.3,r*.1,wx,y,r); pg.addColorStop(0,c1); pg.addColorStop(1,c2); x.fillStyle=pg; x.beginPath(); x.arc(wx,y,r,0,7); x.fill(); if(ring){ x.strokeStyle="rgba(255,230,180,.7)"; x.lineWidth=3; x.beginPath(); x.ellipse(wx,y,r*1.7,r*.45,-.3,0,7); x.stroke(); } };
    pl(W*.18,960,26,"#ffd1a0","#c0603a",true); pl(W*.84,1090,18,"#b8f0ff","#3a7ab0",false); }
  /* the shop (table at world 0), fading into the sky at its top */ const im=bgImg("shop"); if(im.complete&&im.naturalWidth&&yBot<H){ const ih=H*.62, s=ih/im.naturalHeight, w=im.naturalWidth*s, y0=sy(0)-ih*.80; x.fillStyle="#d9a46a"; x.fillRect(0,y0+ih-2,W,H); x.drawImage(im,(W-w)/2,y0,w,ih); const fg=x.createLinearGradient(0,y0-2,0,y0+90); fg.addColorStop(0,bgCol(ih*.80+40,2)); fg.addColorStop(1,"rgba(255,255,255,0)"); x.fillStyle=fg; x.fillRect(0,y0-2,W,92); }
  /* clouds */ for(let i=0;i<14;i++){ const wy=470+i*24+bgRnd(i+40)*16, wx=((bgRnd(i+80)*W*1.6+t*(8+i%3*6))%(W*1.6))-W*.3, y=sy(wy); if(y<-60||y>H+60) continue; x.fillStyle=`rgba(255,255,255,${.75+bgRnd(i)*.2})`; x.beginPath(); for(const [a,b,r] of [[0,0,26],[24,-8,22],[48,0,24],[22,8,22]]){ x.moveTo(wx+a+r,y+b); x.arc(wx+a,y+b,r,0,7); } x.fill(); }
  /* birds: flap and fly across, and stare when the burger passes */ for(let i=0;i<3;i++){ const wy=530+i*80, y=sy(wy); if(y<-80||y>H+80) continue; const dir=i%2?-1:1, sp=40+i*14, wx=dir>0?((t*sp+i*170)%(W+160))-80:W+80-((t*sp+i*170)%(W+160)); bgSprite(x,"bird",wx,y+Math.sin(t*5+i)*6,62,{sx:dir,sy:1+Math.sin(t*14+i)*.08,r:Math.sin(t*3+i)*.08}); }
  /* the UFO: hovers, wobbles, beam pulses */ { const wy=840, y=sy(wy); if(y>-120&&y<H+120){ const wx=W*.72+Math.sin(t*.9)*W*.12; x.fillStyle=`rgba(180,255,200,${.18+.12*Math.sin(t*6)})`; x.beginPath(); x.moveTo(wx-14,y+16); x.lineTo(wx+14,y+16); x.lineTo(wx+44,y+110); x.lineTo(wx-44,y+110); x.closePath(); x.fill(); bgSprite(x,"ufo",wx,y+Math.sin(t*2.4)*8,96,{r:Math.sin(t*1.7)*.12}); } }
  /* heaven: glowing cloud bank, light rays, and the gods peeking out */ if(yTop>1120){ const yh=sy(1220); x.save(); x.globalAlpha=Math.min(1,(yTop-1120)/120); const rg=x.createRadialGradient(W/2,yh-160,10,W/2,yh-160,H*.8); rg.addColorStop(0,"rgba(255,250,220,.9)"); rg.addColorStop(1,"rgba(255,230,170,0)"); x.fillStyle=rg; x.fillRect(0,0,W,H);
      x.translate(W/2,yh-200); for(let i=0;i<12;i++){ x.rotate(Math.PI*2/12); x.fillStyle=`rgba(255,240,180,${.08+.05*Math.sin(t+i)})`; x.beginPath(); x.moveTo(0,0); x.lineTo(-20,-H); x.lineTo(20,-H); x.closePath(); x.fill(); } x.restore();
      for(let i=0;i<10;i++){ const wy=1190+i*90+bgRnd(i+300)*30, y=sy(wy); if(y<-60||y>H+60) continue; const wx=bgRnd(i+320)*W; x.fillStyle="rgba(255,236,200,.85)"; x.beginPath(); for(const [a,b,r] of [[0,0,34],[30,-10,28],[60,0,30],[28,10,30]]){ x.moveTo(wx+a+r,y+b); x.arc(wx+a,y+b,r,0,7); } x.fill(); }
      const near=Math.max(0,1-Math.abs(B.top-1330)/260); /* how close the stack top is to them */
      const god=(k,wx,wy,sz,ph)=>{ const y=sy(wy); if(y<-200||y>H+200) return; const hop=Math.max(0,Math.sin(t*5+ph))*10*near, sq=1+Math.sin(t*10+ph)*.04*(1+near*2); bgSprite(x,k,wx,y-hop,sz,{sx:1/sq,sy:sq,r:Math.sin(t*2.2+ph)*.06}); };
      god("qianli",W*.17,1300+Math.sin(t*.8)*6,92,0); god("mazu",W*.52,1370+Math.sin(t*.7+1)*5,110,1.3); god("shunfeng",W*.84,1290+Math.sin(t*.9+2)*6,92,2.6); } }
function bgSprite(x,k,cx,cy,w,o){ const im=bgImg(k); if(!im.complete||!im.naturalWidth) return; const h=w*im.naturalHeight/im.naturalWidth; x.save(); x.translate(cx,cy); if(o.r) x.rotate(o.r); x.scale(o.sx||1,o.sy||1); x.drawImage(im,-w/2,-h/2,w,h); x.restore(); }
function bgHud(){ const B=BG; if(!B) return; const n=B.n, nx=BG_TIER.find(t=>t[0]>n); B.ov.querySelector("#bgN").textContent=n+" 層"; B.ov.querySelector("#bgT").textContent=nx?`下一個獎勵：${nx[0]} 層`:"已經到最高獎勵了！還可以繼續挑戰紀錄";
  const hit=BG_TIER.filter(t=>t[0]<=n).pop(); if(hit&&hit[0]>B.lastTier){ B.lastTier=hit[0]; B.pops.push({t:0,x:innerWidth/2,y:B.top+40,s:`🎉 ${hit[0]} 層！`}); try{ [784,988,1175].forEach((f,k)=>tone(f,.12,.05,"triangle",k*.08)); }catch(e){} } }
function bgFinish(line){ const B=BG; if(!B||B.over) return; B.over=true; const n=B.n; const tb=()=>{ B.stack.push({k:"bun_top",x:B.stack[B.stack.length-1].x,y:B.top,h:BG_ING.bun_top}); B.top+=BG_ING.bun_top; try{ [523,659,784].forEach((f,k)=>tone(f,.1,.05,"triangle",k*.07)); }catch(e){} };
  setTimeout(()=>{ if(BG!==B) return; tb(); setTimeout(()=>{ if(BG!==B) return; bgClose(); bgResult(n,line,B.perfect); },1300); },line.startsWith("滑")?700:150); }
function bgResult(n,line,perfect){ const d=BGD(), D=d.bgd, b=d.bg; D.n++; const paid=D.n<=10||me.sp; let coins=0, gacha=0, extra="";
  if(paid){ let t=BG_TIER.filter(q=>q[0]<=n); if(n>=100&&D.t100) t=t.filter(q=>q[0]<100); if(n>=50&&D.t50) t=t.filter(q=>q[0]<50); const tier=t.pop();
    if(tier){ coins=tier[1]; gacha=tier[2]; if(tier[0]===100) D.t100=1; if(tier[0]===50) D.t50=1; } else coins=n*8; }
  if(n>=1000&&!b.h){ b.h=1; d.dust=(d.dust|0)+10; extra=`<br>✨ 漢堡碰到了天上的星星……拿到 10 顆星砂！`; }
  const rec=n>(b.best|0); if(rec) b.best=n; if(coins) bag.coins+=coins; if(gacha) bag.gacha=Math.min(255,(bag.gacha||0)+gacha); save(); try{ profSave(true); if(coins) chaChing(); }catch(e){}
  const big=n>=50&&paid&&!gacha?"<br>（50／100 層的大獎今天已經拿過了，明天再來）":"";
  openSheet("lfBf2","🍔 疊漢堡",`<p class="lead">疊了 ${n} 層${perfect?`（完美 ${perfect} 次）`:""}。${line}${rec?"<br>🏆 新紀錄！":""}</p>
   <p class="lead">${paid?(coins||gacha?`拿到 ${coins} 平安幣${gacha?` 和 ${gacha} 枚扭蛋幣`:""}。`:"這次沒有獎勵。"):"今天的獎勵已經拿完了（每天前 10 次有獎勵），玩開心的～"}${big}${extra}</p>
   <div class="row"><button class="primary" data-act="lfBg">再玩一次（30 幣）</button></div>`); }

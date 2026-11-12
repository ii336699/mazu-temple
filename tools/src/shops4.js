/* ---------- the door: shop or work ---------- */
function cvsMenu(){ const e=en(), left=WORK_MAX-dayCount("wk"); openSheet("cvs","M超商",`<p class="lead">叮咚～歡迎光臨！要進去買東西，還是來打工？</p><div class="goods">
  <button class="good" data-act="cvsGo" data-v="buy"><span class="name">🛒 進去買東西</span><span class="meta">飲料、餅乾、泡麵、提神飲料、啤酒、麵包，吃了會恢復精力</span></button>
  <button class="good" data-act="cvsGo" data-v="work"${e<EN_SHIFT||left<=0?' style="opacity:.55"':""}><span class="name">🧑‍💼 打工一班（100 秒）</span><span class="meta">要花 ${EN_SHIFT} 精力・你現在有 ${e} 精力・今天還能打工 ${left} 班（每天最多 ${WORK_MAX} 班）。結帳找零、補貨上架，賺平安幣</span></button></div>
  <p class="note">每天有 100 精力，一班要 ${EN_SHIFT}，每天最多打工 ${WORK_MAX} 班。精力每天最多能恢復 ${EN_REC_MAX}（今天還剩 ${Math.round(recLeft())}）：套房的床最快，再來是通鋪、溫泉、禪堂靜坐；吃東西最快但最貴。</p>`); }
HANDLERS.cvsGo=v=>{ if(v==="work"){ if(dayCount("wk")>=WORK_MAX){ toast(`今天已經打工 ${WORK_MAX} 班了，明天再來`,2800); return; } if(en()<EN_SHIFT){ toast(`精力不夠（要 ${EN_SHIFT}，你有 ${en()}），先吃點東西或去休息`,3000); return; } closeSheet(); workStart(); } else { closeSheet(); buyStart(); } };
SX.station=k=>{ if(k==="cvs"){ cvsMenu(); return true; } if(k==="claw"){ clawStart(); return true; } if(k==="cloth"){ clothStart(); return true; } return false; };

/* ======================= 購物: standing at the counter, the clerk behind it ======================= */
function buyStart(){ const S=buildStore(); const o={exposure:1.05,avs:[]}; const el=enterMode("cvs-buy",o); try{ sfx.dingdong(); }catch(e){}
  S.shelves.forEach(sh=>shelfSet(sh,Math.round(sh.cap*(.55+Math.random()*.45))));
  const clerk=shopAv(S.R,randomLook(),CASHIER[0],CASHIER[1]); clerk.rotY=Math.PI/2; clerk.faceGoal=Math.PI/2; o.avs.push(clerk);
  const meS=shopAv(S.R,meAv.look,DOOR_IN[0],DOOR_IN[1],2.6); o.avs.push(meS); walkAv(meS,COUNTER_SPOT[0],COUNTER_SPOT[1]); meS.arrive=()=>{ meS.faceGoal=-Math.PI/2; };
  const browsers=[]; for(let i=0;i<2;i++){ const sh=STORE_SHELVES[(Math.random()*6)|0]; const b=shopAv(S.R,randomLook(),sh.ap[0]+(Math.random()-.5)*.6,sh.ap[1],1.6); b.faceGoal=sh.face; b.idle=2+Math.random()*4; browsers.push(b); o.avs.push(b); }
  el.insertAdjacentHTML("beforeend",`<div class="shx-top"><span class="shx-title">🏪 M超商</span><span class="shx-pill" id="bCoins"></span><span class="shx-pill" id="bEn"></span><button class="shx-x" id="bX">離開</button></div><div class="shx-panel"><div class="shx-grid" id="bGrid"></div><p style="margin:8px 2px 0;font-size:12px;color:#d9c9a8">「買」放進背包，想吃的時候再拿出來；「買來吃」直接補精力。</p></div>`);
  const draw=()=>{ el.querySelector("#bCoins").textContent=`💰 ${bag.coins}`; el.querySelector("#bEn").textContent=`⚡ ${en()}`;
    el.querySelector("#bGrid").innerHTML=`<div class="shx-item"><span style="font-size:36px;line-height:46px">🎟️</span><b>扭蛋幣</b><span><span class="pr">${GACHA_PRICE} 幣</span></span><span style="font-size:11px;color:#bba">你有 ${bag.gacha||0} 枚</span><div class="bt"><button class="shx-btn" data-g="1">買一枚</button></div></div>`+SNACKS.map(s=>`<div class="shx-item">${snImg(s.k,46)}<b>${s.n}</b><span><span class="pr">${s.p} 幣</span>・<span class="en">⚡+${s.e}</span></span><span style="font-size:11px;color:#bba">背包有 ${bag.snk[s.k]||0}</span><div class="bt"><button class="shx-btn sec" data-b="${s.k}">買</button><button class="shx-btn" data-e="${s.k}">買來吃</button></div></div>`).join(""); };
  draw(); let greeted=false;
  const talk=(t,secs=2.6)=>{ bubble(o,clerk,t,secs); babble(Math.min(1.6,t.length*.12),1.05); };
  el.querySelector("#bGrid").addEventListener("click",ev=>{ const b=ev.target.closest("button"); if(!b) return;
    if(b.dataset.g){ if(bag.coins<GACHA_PRICE){ buzz(); talk("平安幣好像不夠喔～"); return; } bag.coins-=GACHA_PRICE; bag.gacha=Math.min(255,(bag.gacha||0)+1); saveBag(); markDirty(); beep(); setTimeout(chaChing,200); talk("扭蛋幣一枚，祝你轉到想要的！"); draw(); return; } const k=b.dataset.b||b.dataset.e, s=SN[k]; if(!s) return;
    if(bag.coins<s.p){ buzz(); talk("平安幣好像不夠喔～"); return; } if(b.dataset.e&&bag.en>=100){ talk("你看起來精神很好耶，先放背包吧？"); return; } if(b.dataset.e&&recLeft()<=0){ talk("今天吃太多囉，精力補不上去了，先放背包吧？"); return; }
    bag.coins-=s.p; beep(); setTimeout(chaChing,200); if(b.dataset.e){ eat(k,false); bubble(o,meS,`好吃！⚡+${s.e}`,2,"ok"); } else { bag.snk[k]=(bag.snk[k]||0)+1; } saveBag(); markDirty(); statInc("cvsBuy");
    talk(["謝謝光臨～","要不要加購關東煮？","發票要載具嗎？","歡迎再來喔～","這個很好吃喔！","需要袋子嗎？"][(Math.random()*6)|0]); draw(); });
  el.querySelector("#bX").onclick=()=>{ talk("謝謝光臨，歡迎再來～",1.4); try{ sfx.dingdong(); }catch(e){} setTimeout(()=>{ leaveMode(); try{ profSave(true); }catch(e){} },350); };
  o.update=dt=>{ o.avs.forEach(a=>{ avTick(a,dt); if(a.arrive&&atGoal(a)){ const f=a.arrive; a.arrive=null; f(); } });
    if(!greeted&&meS.pos.distanceTo(new T.Vector2(COUNTER_SPOT[0],COUNTER_SPOT[1]))<1.2){ greeted=true; talk("歡迎光臨～需要什麼嗎？",2.8); }
    browsers.forEach(b=>{ if(atGoal(b)){ b.idle-=dt; if(b.idle<=0){ const sh=STORE_SHELVES[(Math.random()*6)|0]; walkAv(b,sh.ap[0]+(Math.random()-.5)*.7,sh.ap[1]+(Math.random()-.5)*.2); b.arrive=()=>{ b.faceGoal=sh.face; }; b.idle=3+Math.random()*5; } } }); };
  o.render=dt=>{ storeCam(S,-3.1,1.9,6.6,.4); renderer.render(S.R,S.cam); bubTick(o,S.cam,dt); };
  o.dispose=()=>{ o.avs.forEach(a=>S.R.remove(a.root)); }; }

/* ======================= 打工: restock the shelves and work the till ======================= */
const NT_DEN=[1000,500,100,50,10,5,1];
const moneyHTML=v=>`<span class="money ${v>=100?"bill":"coin"} m${v}">${v}</span>`;
const breakDown=n=>{ const out=[]; for(const d of NT_DEN){ while(n>=d){ out.push(d); n-=d; } } return out; };
function payFor(t){ const r=Math.random(); if(r<.16) return breakDown(t); if(r<.58){ const b=[100,500,1000].find(b=>b>=t)||1000; return [b]; }
  if(r<.84){ const b=Math.ceil(t/100)*100, extra=t%10; return breakDown(b).concat(extra&&b>t?breakDown(extra):[]); } const b=Math.ceil(t/50)*50; return breakDown(b===t?b+50:b); }
function workStart(){ const S=buildStore(); bag.en=Math.max(0,bag.en-EN_SHIFT); dayAdd("wk"); saveBag(); statInc("cvsWork");
  const o={exposure:1.05,avs:[]}; const el=enterMode("cvs-work",o); SX.busy=true;
  const W={t:100,run:false,done:false,pay:0,served:0,miss:0,err:0,rest:0,carry:null,cust:[],queue:[],spawnT:2,cash:null,dismiss:false};
  S.shelves.forEach(sh=>shelfSet(sh,Math.round(sh.cap*(.3+Math.random()*.45))));
  const P=shopAv(S.R,meAv.look,CASHIER[0],CASHIER[1],3.1); P.faceGoal=Math.PI/2; o.avs.push(P); let box3=null;
  el.insertAdjacentHTML("beforeend",`<div class="shx-top"><span class="shx-pill" id="wT">⏱ 100</span><span class="shx-pill" id="wP">💰 0</span><span class="shx-pill" id="wS">🙂 0</span><span class="shx-title"></span><button class="shx-x" id="wX">下班</button></div><div id="wPanel"></div>`);
  const $w=s=>el.querySelector(s), panel=$w("#wPanel");
  const hud=()=>{ $w("#wT").textContent=`⏱ ${Math.ceil(W.t)}`; $w("#wP").textContent=`💰 ${W.pay}`; $w("#wS").textContent=`🙂 ${W.served}${W.miss?"　😠 "+W.miss:""}`; };
  const card=(html)=>{ const c=document.createElement("div"); c.className="shx-card"; c.innerHTML=html; el.appendChild(c); return c; };
  const intro=card(`<h3>🧑‍💼 打工一班 100 秒</h3><p>👥 客人會自己去貨架拿東西，再到<b>櫃台</b>排隊。</p><p>💵 點櫃台走到收銀機後面就能結帳：看客人付多少，從下面的錢箱點出<b>正確的找零</b>，按「找錢」。</p><p>📦 貨架空了客人會等，等太久就走掉。點左後方的<b>倉庫推車</b>拿一箱貨，再點那個貨架補滿。</p><p>結帳越快、找錢越準，薪水越多；找錯會扣錢。已經花掉 ${EN_SHIFT} 精力。</p><div class="row"><button class="shx-btn" id="wGo">開始上班！</button></div>`);
  intro.querySelector("#wGo").onclick=()=>{ intro.remove(); W.run=true; try{ sfx.dingdong(); }catch(e){} bubble(o,P,"上班囉！",1.6,"ok"); };
  $w("#wX").onclick=()=>{ if(!W.run||W.done){ if(!W.done) finish(true); return; } if(confirmBox) return; confirmBox=card(`<h3>要提早下班嗎？</h3><p>已經賺到的 ${W.pay} 平安幣會照算，精力不會退回。</p><div class="row"><button class="shx-btn sec" id="cNo">繼續上班</button><button class="shx-btn" id="cYes">下班</button></div>`);
    confirmBox.querySelector("#cNo").onclick=()=>{ confirmBox.remove(); confirmBox=null; }; confirmBox.querySelector("#cYes").onclick=()=>{ confirmBox.remove(); confirmBox=null; finish(false); }; };
  let confirmBox=null;
  const goP=(x,z,then)=>{ walkAv(P,x,z); P.arrive=then||null; };
  const carrySet=k=>{ W.carry=k; if(box3){ P.root.remove(box3); box3=null; } if(k){ box3=new T.Group(); const b=box(.42,.3,.3,new T.MeshStandardMaterial({color:"#c8a06a",roughness:.85}),0,0,0,box3); const lb=new T.Mesh(new T.PlaneGeometry(.22,.18),new T.MeshBasicMaterial({map:new T.TextureLoader().load(snackIcon(k)),transparent:true})); lb.position.z=.152; box3.add(lb); box3.position.set(0,.78,.3); P.root.add(box3); } };
  const pickBox=()=>{ panel.innerHTML=`<div class="shx-panel"><b style="font-size:15px">📦 要拿哪一箱？</b><span style="font-size:12px;color:#d9c9a8;margin-left:6px">右上角是貨架還剩多少</span><div class="pick6">${S.shelves.map(sh=>{ const p=Math.round(sh.n/sh.cap*100); return `<button data-k="${sh.k}"><i class="${p<35?"low":""}">${p}%</i>${snImg(sh.k,40)}${SN[sh.k].tag}</button>`; }).join("")}</div><div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="shx-btn sec" id="pkX">先不要</button></div></div>`;
    panel.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{ carrySet(b.dataset.k); panel.innerHTML=""; tone(520,.06,.06,"triangle"); bubble(o,P,`拿了一箱${SN[b.dataset.k].tag}`,1.6); const sh=S.shelves.find(s=>s.k===b.dataset.k); if(sh) goP(sh.ap[0],sh.ap[1],()=>restock(sh)); }); panel.querySelector("#pkX").onclick=()=>{ panel.innerHTML=""; }; };
  const restock=sh=>{ P.faceGoal=sh.face; if(W.carry!==sh.k){ bubble(o,P,W.carry?`這箱是${SN[W.carry].tag}…`:"要先去倉庫推車拿貨",2,"warn"); return; } const was=sh.n/sh.cap; W.busyT=.7; setTimeout(()=>{ if(W.done) return; shelfSet(sh,sh.cap); carrySet(null); W.rest++; if(was<=.5){ W.pay+=10; } tone(660,.07,.07,"triangle"); tone(880,.1,.06,"triangle",.07); bubble(o,P,was<=.5?"補滿了！+10":"補滿了！",1.6,"ok"); hud(); },650); };
  const toCounter=()=>goP(CASHIER[0],CASHIER[1],()=>{ P.faceGoal=Math.PI/2; W.dismiss=false; });
  tapLayer(o,(cx,cy)=>{ if(!W.run||W.done) return; const h=storeTap(o,S,cx,cy); if(!h) return; const u=h.object.userData;
    if(u.cart){ goP(CART_AP[0],CART_AP[1],()=>{ P.faceGoal=-Math.PI/2; pickBox(); }); return; }
    if(u.shelf){ const sh=S.shelves[u.shelf-1]; if(!W.carry){ bubble(o,P,"先到倉庫推車拿一箱貨",2,"warn"); return; } goP(sh.ap[0],sh.ap[1],()=>restock(sh)); return; }
    if(u.counter){ toCounter(); return; } if(u.floor){ goP(h.point.x,h.point.z); if(W.cash) closeCash(); } });
  /* customers */
  const spawn=()=>{ const c={av:shopAv(S.R,randomLook(),DOOR_OUT[0],DOOR_OUT[1],1.9+Math.random()*.5),want:[],got:[],st:"in",t:0}; const n=Math.random()<.45?1:Math.random()<.7?2:3; for(let i=0;i<n;i++) c.want.push(SNACKS[(Math.random()*6)|0].k);
    o.avs.push(c.av); W.cust.push(c); walkAv(c.av,DOOR_IN[0]+(Math.random()-.5)*.6,DOOR_IN[1]); try{ sfx.dingdong(); }catch(e){} };
  const nextShelf=c=>{ if(c.want.length){ const k=c.want.shift(); const sh=S.shelves.find(s=>s.k===k); c.sh=sh; c.st="go"; walkAv(c.av,sh.ap[0]+(Math.random()-.5)*.8,sh.ap[1]+(Math.random()-.5)*.15); return; }
    if(c.got.length){ c.st="queue"; W.queue.push(c); queueMove(); } else { c.st="leave"; bubble(o,c.av,"都沒貨啊…",2.2,"warn"); W.miss++; walkAv(c.av,DOOR_OUT[0],DOOR_OUT[1]); hud(); } };
  const queueMove=()=>{ W.queue.forEach((c,i)=>{ const q=QUEUE[Math.min(i,QUEUE.length-1)]; walkAv(c.av,q[0],q[1]+(i>=QUEUE.length?(i-QUEUE.length+1)*.4:0)); c.qi=i; }); };
  const leaveQ=c=>{ const i=W.queue.indexOf(c); if(i>=0) W.queue.splice(i,1); queueMove(); };
  /* the till */
  const openCash=c=>{ const items=c.got.map(k=>SN[k]); const total=items.reduce((t,s)=>t+s.nt,0); const pay=payFor(total), paid=pay.reduce((a,b)=>a+b,0); W.cash={c,total,paid,pay,give:[],ready:false};
    panel.innerHTML=`<div class="shx-panel cash"><div class="r1"><div class="rc" id="cRc"></div><div class="lcd"><small>應收</small><b id="cTot">---</b></div></div>
      <div class="line"><span>客人付</span><span id="cPaid" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center"></span><b id="cPaidN"></b></div>
      <div class="line"><span>找零</span><span id="cGive" style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;flex:1"></span><b id="cGiveN">$0</b></div>
      <div class="drawer">${[500,100,50,10,5,1].map(v=>`<button data-m="${v}">${moneyHTML(v)}</button>`).join("")}</div>
      <div class="acts"><button class="shx-btn sec" id="cClr">清除</button><button class="shx-btn sec" id="cAway">先去補貨</button><button class="shx-btn" id="cOk" disabled>找錢</button></div></div>`;
    const rc=panel.querySelector("#cRc"); items.forEach((s,i)=>setTimeout(()=>{ if(W.cash&&W.cash.c===c){ rc.insertAdjacentHTML("beforeend",`<div><span>${s.n}</span><span>$${s.nt}</span></div>`); beep(); } },250+i*320));
    setTimeout(()=>{ if(!W.cash||W.cash.c!==c) return; panel.querySelector("#cTot").textContent="$"+total; bubble(o,c.av,paid===total?"剛好，給你～":"給你",1.6); babble(.5,1.1);
      panel.querySelector("#cPaid").innerHTML=pay.map(moneyHTML).join(""); panel.querySelector("#cPaidN").textContent="$"+paid; W.cash.ready=true; const ok=panel.querySelector("#cOk"); ok.disabled=false; ok.textContent=paid===total?"不用找，結帳":"找錢"; },300+items.length*320);
    const giveDraw=()=>{ const g=W.cash.give; panel.querySelector("#cGive").innerHTML=g.map((v,i)=>`<button data-r="${i}" style="border:0;background:none;padding:0">${moneyHTML(v)}</button>`).join(""); panel.querySelector("#cGiveN").textContent="$"+g.reduce((a,b)=>a+b,0); };
    panel.querySelector(".drawer").onclick=ev=>{ const b=ev.target.closest("[data-m]"); if(!b||!W.cash||!W.cash.ready) return; W.cash.give.push(+b.dataset.m); W.cash.give.sort((a,b)=>b-a); tone(+b.dataset.m>=100?380:1200+Math.random()*200,.05,.06,b.dataset.m>=100?"sine":"triangle"); giveDraw(); };
    panel.querySelector("#cGive").onclick=ev=>{ const b=ev.target.closest("[data-r]"); if(!b) return; W.cash.give.splice(+b.dataset.r,1); giveDraw(); };
    panel.querySelector("#cClr").onclick=()=>{ W.cash.give=[]; giveDraw(); }; panel.querySelector("#cAway").onclick=()=>{ W.dismiss=true; closeCash(); };
    panel.querySelector("#cOk").onclick=()=>{ const C=W.cash; if(!C||!C.ready) return; const g=C.give.reduce((a,b)=>a+b,0), need=C.paid-C.total;
      if(g===need){ chaChing(); const quick=c.t<12; const earn=30+(quick?20:0); /* (ten times the first version, at the chair's call) */ W.pay+=earn; W.served++; bubble(o,c.av,["謝謝～","辛苦了！","掰掰～","下次見！"][(Math.random()*4)|0]+(quick?" 好快！":""),2,"ok"); babble(.7,1.15); bubble(o,P,`+${earn}`,1.2,"ok");
        c.st="leave"; walkAv(c.av,DOOR_OUT[0],DOOR_OUT[1]); leaveQ(c); closeCash(); hud(); }
      else { buzz(); W.err++; W.pay=Math.max(0,W.pay-10); bubble(o,c.av,g<need?"少找了喔！":"你多找了啦～",2,"warn"); babble(.6,1.25); C.give=[]; giveDraw(); hud(); } }; };
  const closeCash=()=>{ W.cash=null; panel.innerHTML=""; };
  const finish=early=>{ if(W.done) return; W.done=true; W.run=false; SX.busy=false; closeCash(); const bonus=(!early&&W.served>=8&&W.miss===0&&W.err===0)?80:0; const total=W.pay+bonus; bag.coins+=total; saveBag(); markDirty(); try{ profSave(true); }catch(e){}
    const msg=W.served>=10&&W.miss===0?"店長：「你太厲害了，下次再來幫忙！」":W.served>=5?"店長：「做得不錯，辛苦了！」":"店長：「慢慢來，下次會更好。」";
    const c=card(`<h3>${early?"提早下班":"打烊了！"}</h3><p>🙂 結帳 ${W.served} 位客人${W.miss?`　😠 走掉 ${W.miss} 位`:""}</p><p>📦 補貨 ${W.rest} 次${W.err?`　❌ 找錯 ${W.err} 次`:""}</p>${bonus?`<p>🌟 全勤零失誤獎金 +${bonus}</p>`:""}<p style="font-size:17px;text-align:center;margin-top:10px">今天的薪水 <b style="color:#ffd76a;font-size:24px">${total}</b> 平安幣</p><p style="text-align:center;color:#d9c9a8">${msg}</p>
      <div class="row">${en()>=EN_SHIFT&&dayCount("wk")<WORK_MAX?`<button class="shx-btn sec" id="fAgain">再上一班（⚡−${EN_SHIFT}）</button>`:""}<button class="shx-btn" id="fOut">離開</button></div><p style="text-align:center;font-size:12px;color:#bba;margin-top:8px">⚡ 精力剩 ${en()}・今天還能打工 ${WORK_MAX-dayCount("wk")} 班</p>`);
    try{ chaChing(); }catch(e){} const a=c.querySelector("#fAgain"); if(a) a.onclick=()=>{ leaveMode(); workStart(); }; c.querySelector("#fOut").onclick=()=>{ leaveMode(); toast(`打工賺了 ${total} 平安幣`,2600); }; };
  o.update=dt=>{ o.avs.forEach(a=>{ avTick(a,dt); if(a.arrive&&atGoal(a)){ const f=a.arrive; a.arrive=null; f(); } });
    if(!W.run) return; W.t-=dt; if(W.t<=0){ W.t=0; hud(); finish(false); return; }
    W.spawnT-=dt; const inside=W.cust.filter(c=>c.st!=="gone").length, prog=1-W.t/100; if(W.spawnT<=0&&inside<5){ spawn(); W.spawnT=(6.5-prog*2.8)+Math.random()*2.5; }
    for(const c of W.cust){ const a=c.av; c.t+=dt;
      if(c.st==="in"&&atGoal(a)){ nextShelf(c); }
      else if(c.st==="go"&&atGoal(a)){ a.faceGoal=c.sh.face; c.st="pick"; c.t=0; }
      else if(c.st==="pick"&&c.t>.7){ if(c.sh.n>0){ shelfSet(c.sh,c.sh.n-1); c.got.push(c.sh.k); if(Math.random()<.25&&c.sh.n>0){ shelfSet(c.sh,c.sh.n-1); c.got.push(c.sh.k); } nextShelf(c); } else { c.st="wait"; c.t=0; bubble(o,a,`${SN[c.sh.k].tag}沒貨了？`,9,"warn"); } }
      else if(c.st==="wait"){ if(c.sh.n>0){ bubble(o,a,"有了！",1.2,"ok"); c.st="pick"; c.t=.5; } else if(c.t>9){ bubble(o,a,"算了…",1.8); nextShelf(c); } }
      else if(c.st==="queue"){ if(W.queue[0]===c&&atGoal(a)){ c.st="counter"; c.t=0; a.faceGoal=-Math.PI/2; c.bar=bar(o,a); } }
      else if(c.st==="counter"){ const left=1-c.t/30; if(c.bar){ c.bar.el.firstChild.style.width=Math.max(0,left*100)+"%"; c.bar.el.firstChild.style.background=left>.5?"#4cd964":left>.25?"#ffcc00":"#ff3b30"; }
        if(c.t>30){ if(W.cash&&W.cash.c===c) closeCash(); bubble(o,a,"等太久了！",2,"warn"); W.miss++; c.st="leave"; walkAv(a,DOOR_OUT[0],DOOR_OUT[1]); leaveQ(c); hud(); }
        else if(!W.cash&&!W.dismiss&&P.pos.distanceTo(new T.Vector2(CASHIER[0],CASHIER[1]))<.3&&atGoal(P)) openCash(c); }
      else if(c.st==="leave"&&atGoal(a)&&a.pos.y>4.4){ c.st="gone"; S.R.remove(a.root); o.avs.splice(o.avs.indexOf(a),1); }
      if(c.st!=="counter"&&c.bar){ c.bar.dead=1; c.bar=null; } }
    W.cust=W.cust.filter(c=>c.st!=="gone"); if(W.cash&&P.pos.distanceTo(new T.Vector2(CASHIER[0],CASHIER[1]))>.5) closeCash();
    W.hudT=(W.hudT||0)+dt; if(W.hudT>.25){ W.hudT=0; hud(); } };
  o.render=dt=>{ storeCam(S,-.2,.5,13,W.cash||panel.innerHTML?.36:.5); renderer.render(S.R,S.cam); bubTick(o,S.cam,dt); };
  o.dispose=()=>{ o.avs.forEach(a=>S.R.remove(a.root)); if(box3) P.root.remove(box3); }; hud(); }

/* ================= 小鎮的店家遊戲 (11/14) — every game has a daily ranking on the server (/rank: best score per player per Taiwan day);
   the test page keeps its own. ================= */
const GU=()=>load("mz.id","")||"";
async function rankPost(g,s){ try{ const r=await fetch("/rank",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({g,s:Math.max(0,Math.round(s)),uid:GU(),name:me.name||"香客"})}); return await r.json(); }catch(e){ return null; } }
async function rankGet(g){ try{ const r=await fetch("/rank?g="+g); return await r.json(); }catch(e){ return null; } }
const RK_UNIT={burger:"層",ice:"mm",drink:"分",congee:"分",herb:"分",book:"分",flower:"分"};
function rankHtml(g,j,mine){ if(!j||!j.top) return `<p class="note">（排名暫時連不上）</p>`; return `<h4 style="margin:10px 0 4px">🏆 今日排名</h4>${j.top.length?`<div style="display:grid;grid-template-columns:2.2em 1fr auto;gap:3px 8px;font-size:14px">${j.top.slice(0,10).map((r,i)=>`<b>${["🥇","🥈","🥉"][i]||i+1}</b><span>${String(r[0]).replace(/[<>&]/g,"")}</span><span>${g==="ice"?(r[1]/10).toFixed(1)+" cm":r[1]+" "+RK_UNIT[g]}</span>`).join("")}</div>`:`<p class="note">今天還沒有人上榜，第一名就是你的！</p>`}${mine&&j.rank?`<p class="note">你今天最好 ${g==="ice"?(j.best/10).toFixed(1)+" cm":j.best+" "+RK_UNIT[g]}，目前第 ${j.rank} 名（共 ${j.n} 人）。</p>`:""}`; }
HANDLERS.lfRank=async g=>{ const j=await rankGet(g); openSheet("lfRank","🏆 今日排名",rankHtml(g,j)); };
const GAME_DAY=()=>{ const d=LF(); if(!d.gday||d.gday.d!==today()) d.gday={d:today()}; return d.gday; }; /* (not d.gd: that is the garden) */ /* per-day counters for every game */
const gamePaid=(k,max)=>{ const G=GAME_DAY(); G[k]=(G[k]||0)+1; return me.sp||G[k]<=max; };
function gOverlay(title,bg){ const ov=document.createElement("div"); ov.className="lf-ov"; ov.style.cssText=`position:fixed;inset:0;z-index:9000;background:${bg||"rgba(20,14,10,.86)"};touch-action:none;user-select:none;-webkit-user-select:none`;
  ov.innerHTML=`<div style="position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 12px);text-align:center;color:${bg&&/#f|#e|#d/.test(bg)?"#7a3a1a":"#ffe2a0"};text-shadow:0 1px 0 rgba(255,255,255,.6);font:900 20px ${UI_FONT};pointer-events:none">${title}</div><button class="lf-x" id="gX">離開</button><div id="gB" style="position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 48px);bottom:0;display:flex;flex-direction:column;align-items:center"></div>`;
  document.body.appendChild(ov); window.MZ_NO3D=1; const close=()=>{ window.MZ_NO3D=0; ov.remove(); }; ov.querySelector("#gX").onclick=()=>{ ov._quit=1; close(); }; return {ov,B:ov.querySelector("#gB"),close}; }
const GL=L.games||(L.games={});

/* ---------- 🧋 飲料店：調飲料 — pour each layer up to its line; let go too early and it is short, too late and it is over. Ice may drop in
   halfway and push the level up. 20 real Taiwanese drinks; a shift is 3 cups. ---------- */
const DRK=[["珍珠奶茶",[["珍珠",.16,"#3a2416"],["紅茶",.62,"#a4512a"],["鮮奶",.9,"#f1e3cf"]]],["黑糖珍珠鮮奶",[["黑糖",.1,"#5a2d14"],["珍珠",.24,"#3a2416"],["鮮奶",.9,"#f4ece0"]]],["多多綠茶",[["綠茶",.55,"#c9c86a"],["多多",.88,"#f2e9d0"]]],
 ["冬瓜檸檬",[["冬瓜茶",.65,"#9a5a2a"],["檸檬汁",.86,"#f2e06a"]]],["百香綠茶",[["百香果",.22,"#f2b23a"],["綠茶",.86,"#c9c86a"]]],["楊枝甘露",[["芒果",.3,"#f6b33a"],["西米露",.5,"#f4efe4"],["椰奶",.9,"#fbf6ea"]]],["蜂蜜檸檬",[["蜂蜜",.14,"#e8a530"],["檸檬汁",.34,"#f2e06a"],["冰水",.9,"#d8ecf4"]]],
 ["烏龍奶茶",[["烏龍茶",.62,"#a86a2a"],["奶",.9,"#e9d6bc"]]],["芋頭鮮奶",[["芋泥",.26,"#b59ad0"],["鮮奶",.9,"#f4ece0"]]],["紅茶拿鐵",[["紅茶",.5,"#a4512a"],["鮮奶",.9,"#efe0cc"]]],["青蛙撞奶",[["粉圓",.2,"#2a2018"],["鮮奶",.9,"#f4ece0"]]],
 ["柳橙綠茶",[["柳橙汁",.42,"#f5a03a"],["綠茶",.88,"#c9c86a"]]],["葡萄柚綠",[["葡萄柚",.4,"#ef7a6a"],["綠茶",.88,"#c9c86a"]]],["鐵觀音拿鐵",[["鐵觀音",.55,"#7a4a22"],["鮮奶",.9,"#e9dcc6"]]],["仙草凍奶茶",[["仙草凍",.22,"#1e1a14"],["紅茶",.64,"#a4512a"],["奶",.9,"#e8d2b6"]]],
 ["布丁奶茶",[["布丁",.2,"#f2c84a"],["奶茶",.88,"#c99a6a"]]],["椰果奶茶",[["椰果",.18,"#f4f1e6"],["奶茶",.88,"#c99a6a"]]],["梅子綠茶",[["梅子汁",.24,"#b03a4a"],["綠茶",.88,"#c9c86a"]]],["甘蔗青茶",[["甘蔗汁",.4,"#d9cf7a"],["青茶",.88,"#b9c46a"]]],["檸檬愛玉",[["愛玉",.3,"#f2e8a0"],["檸檬汁",.5,"#f2e06a"],["冰水",.9,"#d8ecf4"]]]];
GL["tw:drink"]=()=>{ openSheet("lfDrink","🧋 飲料店打工",`<p class="lead">小安：「按住出料，放開就停。每一層都要剛好倒到線上！」</p><p class="note">一班 3 杯，倒得越準薪水越多（每天前 5 班有薪水）。中途可能會加冰塊，水位會突然升高喔。</p><div class="row"><button class="primary" data-act="lfDrinkGo">上班！</button><button class="secondary" data-act="lfRank" data-v="drink">今日排名</button></div>`); };
HANDLERS.lfDrinkGo=()=>{ closeSheet(); drinkGame(); };
function drinkGame(){ const G=gOverlay("🧋 調飲料","linear-gradient(#ffe9d6,#ffd2b0)"), B=G.B; const cups=[0,1,2].map(()=>DRK[(Math.random()*DRK.length)|0]);
  B.innerHTML=`<div id="dkT" style="color:#7a3a1a;font:900 18px ${UI_FONT};margin:6px">第 1 杯</div><canvas id="dkC" width="320" height="430" style="width:320px;height:430px"></canvas><button class="lf-btn" style="position:static;transform:none;margin-top:8px;width:150px;height:72px;border-radius:36px;font-size:20px" id="dkB">按住出料</button><div id="dkM" style="color:#7a3a1a;font:700 15px ${UI_FONT};margin-top:6px;min-height:22px"></div>`;
  const cv=B.querySelector("#dkC"), x=cv.getContext("2d"); const S={ci:0,li:0,lv:0,pour:false,ice:0,iceAt:0,score:0,res:[],t:0,wait:0,drops:[]};
  const setCup=()=>{ S.lv=0; S.li=0; S.ice=0; S.drops=[]; S.iceAt=Math.random()<.6?1+((Math.random()*(cups[S.ci][1].length-1))|0)+.5:99; S.layers=[]; B.querySelector("#dkT").textContent=`第 ${S.ci+1} 杯：${cups[S.ci][0]}`; }; setCup();
  const btn=B.querySelector("#dkB"); const down=e=>{ e.preventDefault(); if(S.wait>0) return; S.pour=true; }, up=e=>{ e.preventDefault(); if(!S.pour) return; S.pour=false; judge(); };
  btn.addEventListener("pointerdown",down); btn.addEventListener("pointerup",up); btn.addEventListener("pointerleave",up); btn.addEventListener("pointercancel",up);
  const judge=()=>{ const st=cups[S.ci][1][S.li], err=Math.abs(S.lv-st[1]); const pts=err<.015?30:err<.04?20:err<.08?10:0; S.score+=pts; S.res.push(pts); B.querySelector("#dkM").textContent=pts>=30?"完美！":pts>=20?"很準！":pts>=10?"差一點":"差太多了…"; try{ tone(pts>=20?880:pts?660:220,.1,.05,pts?"triangle":"sawtooth"); }catch(e){}
    S.li++; if(S.lv>=.99) S.li=99; if(S.li>=cups[S.ci][1].length){ S.wait=1.2; setTimeout(()=>{ S.ci++; if(S.ci>=3) return end(); setCup(); },1100); } };
  const end=()=>{ G.close(); const paid=gamePaid("drink",5), pay=paid?Math.round(S.score*1.2):0; if(pay){ bag.coins+=pay; save(); try{ chaChing(); }catch(e){} } rankPost("drink",S.score).then(j=>openSheet("lfDrink2","🧋 下班了",`<p class="lead">三杯一共 ${S.score} 分。${paid?`薪水 ${pay} 平安幣。`:"今天的薪水已經領完了（每天前 5 班），謝謝幫忙～"}</p>${rankHtml("drink",j,1)}<div class="row"><button class="primary" data-act="lfDrinkGo">再上一班</button></div>`)); };
  let last=performance.now(); const loop=now=>{ if(!G.ov.isConnected) return; const dt=Math.min(.05,(now-last)/1000); last=now; S.t+=dt; if(S.wait>0) S.wait-=dt;
    const cup=cups[S.ci]; const L=S.layers;
    if(cup&&S.pour&&S.li<cup[1].length){ const st=cup[1][S.li]; if(!L[S.li]) L[S.li]={c:st[2],from:S.lv,to:S.lv}; S.lv=Math.min(1.02,S.lv+dt*(.16+.05*S.ci)); L[S.li].to=S.lv; if(S.lv>=1.0){ S.pour=false; judge(); B.querySelector("#dkM").textContent="滿出來了！"; } }
    if(cup&&!S.ice&&S.li+.5>=S.iceAt){ S.ice=1; S.lv=Math.min(1.02,S.lv+.07); const top=L.filter(Boolean).pop(); if(top) top.to=S.lv; S.drops=[0,1,2,3].map(k=>({y:-40-k*30,x:128+Math.random()*44})); try{ tone(1400,.05,.05,"square"); tone(1100,.05,.05,"square",.06); }catch(e){} B.querySelector("#dkM").textContent="🧊 加冰塊！水位變高了！"; }
    x.clearRect(0,0,320,430); const cx=160, top=70, bot=400, w0=86, w1=66, Y=v=>bot-(bot-top)*v, W=v=>w1+(w0-w1)*v;
    L.forEach((ly,k)=>{ if(!ly) return; const isTop=k===L.length-1; x.fillStyle=ly.c; x.beginPath(); x.moveTo(cx-W(ly.from),Y(ly.from)); x.lineTo(cx+W(ly.from),Y(ly.from)); x.lineTo(cx+W(ly.to),Y(ly.to)); for(let i=0;i<=20;i++){ const xx=cx+W(ly.to)-i/20*2*W(ly.to); x.lineTo(xx,Y(ly.to)+(isTop?Math.sin(S.t*6+i*.7)*(S.pour?2.5:1):0)); } x.closePath(); x.fill(); });
    if(S.ice) S.drops.forEach(d=>{ d.y=Math.min(Y(S.lv)-10,d.y+dt*600); x.fillStyle="rgba(220,240,255,.85)"; x.strokeStyle="rgba(255,255,255,.95)"; x.lineWidth=2; x.fillRect(d.x,d.y,20,20); x.strokeRect(d.x,d.y,20,20); });
    if(cup&&S.li<cup[1].length){ const st2=cup[1][S.li]; x.strokeStyle="#e8402e"; x.setLineDash([6,5]); x.lineWidth=2.5; x.beginPath(); x.moveTo(cx-W(st2[1])-8,Y(st2[1])); x.lineTo(cx+W(st2[1])+8,Y(st2[1])); x.stroke(); x.setLineDash([]); x.fillStyle="#7a3a1a"; x.font=`900 15px ${UI_FONT}`; x.textAlign="right"; x.fillText(st2[0],cx-W(st2[1])-10,Y(st2[1])+5);
      if(S.pour){ x.fillStyle=st2[2]; x.fillRect(cx-5,34,10,Y(S.lv)-34); for(let i=0;i<4;i++){ x.beginPath(); x.arc(cx+Math.sin(S.t*20+i)*7,Y(S.lv)-2,3,0,7); x.fill(); } } }
    x.strokeStyle="rgba(120,80,60,.9)"; x.lineWidth=3; x.beginPath(); x.moveTo(cx-w0-2,top-6); x.lineTo(cx-w1-2,bot+2); x.lineTo(cx+w1+2,bot+2); x.lineTo(cx+w0+2,top-6); x.stroke(); x.fillStyle="rgba(255,255,255,.2)"; x.fillRect(cx-w0+8,top,10,bot-top-10);
    x.fillStyle="#9a6a4a"; x.fillRect(cx-30,0,60,26); x.fillStyle="#6a4a34"; x.fillRect(cx-8,26,16,10);
    requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

/* ---------- 🥣 一粥七天：記菜單 — a table is shown for 10 s, then set it again from memory; 3 tables, each harder ---------- */
const CG_SIDES=["黃金蛋","鹹蜆仔","素雞","燙青菜","皮蛋豆腐","肝連","粉腸","三色蛋","鯊魚煙","蔥油雞","竹筍沙拉","鮮燙小卷","紹興醉蝦","蒜泥鮮蚵","炸豆腐","炸花枝丸","炸薯條","炸雞塊","炸黑輪","炸銀絲卷","府城蝦捲","炸紅燒肉","蚵仔酥","酥炸土魠魚","炸柳葉魚","魚蛋沙拉"];
const CG_DRK=["阿嬤ㄟ酸梅湯","阿嬤ㄟ紅茶"], CG_SOUP=["虱目魚肚湯","魚丸湯","鮮蚵湯","鱸魚湯"];
GL["tw:congee"]=()=>{ const d=LF(); openSheet("lfCongee","🥣 一粥七天",`<p class="lead">阿秀姨：「先看一眼桌上，10 秒後幫我把一模一樣的菜單點出來！三桌都對，送你三碗鹹粥！」</p><p class="note">要記：鹹粥有沒有加芹菜、有哪些小菜、有沒有飲料、有沒有湯。${(d.cg|0)?`<br>你背包裡有 ${d.cg} 碗鹹粥。`:""}</p><div class="row"><button class="primary" data-act="lfCgGo">開始</button><button class="secondary" data-act="lfRank" data-v="congee">今日排名</button></div>`); };
HANDLERS.lfCgGo=()=>{ closeSheet(); congeeGame(); };
function congeeGame(){ const G=gOverlay("🥣 記菜單","linear-gradient(#fff4e2,#f6dcb8)"), B=G.B; const S={k:0,score:0,ok:0};
  const mk=k=>{ const n=[3,5,7][k]; const sides=[...CG_SIDES].sort(()=>Math.random()-.5).slice(0,n); return {cel:Math.random()<.5,sides,drink:k>0&&Math.random()<.6?CG_DRK[(Math.random()*2)|0]:"",soup:k>0&&Math.random()<.55?CG_SOUP[(Math.random()*CG_SOUP.length)|0]:""}; };
  const chip=(t,on,act,v)=>`<button data-a="${act}" data-v="${v}" style="margin:3px;padding:7px 10px;border-radius:12px;border:2px solid ${on?"#c0392b":"#d9b48a"};background:${on?"#c0392b":"#fffaf0"};color:${on?"#fff":"#5a3a22"};font:800 14px ${UI_FONT}">${t}</button>`;
  const show=()=>{ const T=S.T=mk(S.k); let left=10; const draw=()=>{ B.innerHTML=`<div style="color:#7a3a1a;font:900 18px ${UI_FONT}">第 ${S.k+1} 桌　記住它！ ${left} 秒</div><div style="margin:12px;padding:16px;border-radius:18px;background:#fffaf0;box-shadow:0 4px 14px rgba(120,60,20,.25);max-width:340px;text-align:center;color:#3a2416;font:800 16px ${UI_FONT};line-height:2">🥣 鹹粥（${T.cel?"加芹菜":"不加芹菜"}）<br>${T.sides.map(s=>`🍽️ ${s}`).join("<br>")}${T.drink?`<br>🥤 ${T.drink}`:""}${T.soup?`<br>🍲 ${T.soup}`:""}</div>`; }; draw();
    const iv=setInterval(()=>{ if(!G.ov.isConnected){ clearInterval(iv); return; } left--; if(left<=0){ clearInterval(iv); ask(); } else draw(); },1000); };
  const ask=()=>{ const T=S.T, pool=[...new Set([...T.sides,...[...CG_SIDES].sort(()=>Math.random()-.5).slice(0,4+S.k*2)])].sort(()=>Math.random()-.5); const A={cel:null,sides:new Set(),drink:"",soup:""};
    const draw=()=>{ B.innerHTML=`<div style="color:#7a3a1a;font:900 18px ${UI_FONT}">第 ${S.k+1} 桌　剛剛點了什麼？</div><div style="max-width:360px;text-align:center;margin-top:6px"><div style="font:900 14px ${UI_FONT};color:#7a3a1a;margin-top:6px">鹹粥</div>${chip("加芹菜",A.cel===true,"cel",1)}${chip("不加芹菜",A.cel===false,"cel",0)}
      <div style="font:900 14px ${UI_FONT};color:#7a3a1a;margin-top:6px">小菜</div>${pool.map(s=>chip(s,A.sides.has(s),"side",s)).join("")}<div style="font:900 14px ${UI_FONT};color:#7a3a1a;margin-top:6px">飲料</div>${chip("沒有",!A.drink,"drink","")}${CG_DRK.map(s=>chip(s,A.drink===s,"drink",s)).join("")}
      <div style="font:900 14px ${UI_FONT};color:#7a3a1a;margin-top:6px">湯</div>${chip("沒有",!A.soup,"soup","")}${CG_SOUP.map(s=>chip(s,A.soup===s,"soup",s)).join("")}</div><button class="lf-btn" style="position:static;transform:none;margin:12px;width:160px;height:56px;border-radius:28px;font-size:18px" data-a="ok">上菜！</button>`; };
    draw(); B.onclick=e=>{ const b=e.target.closest("[data-a]"); if(!b) return; const a=b.dataset.a, v=b.dataset.v; if(a==="cel") A.cel=v==="1"; else if(a==="side"){ A.sides.has(v)?A.sides.delete(v):A.sides.add(v); } else if(a==="drink") A.drink=v; else if(a==="soup") A.soup=v; else if(a==="ok"){ B.onclick=null; grade(A); return; } try{ tone(700,.03,.03,"triangle"); }catch(e){} draw(); }; };
  const grade=A=>{ const T=S.T; let good=0, all=0; all++; if(A.cel===T.cel) good++; T.sides.forEach(s=>{ all++; if(A.sides.has(s)) good++; }); A.sides.forEach(s=>{ if(!T.sides.includes(s)) good--; }); all++; if(A.drink===T.drink) good++; all++; if(A.soup===T.soup) good++; good=Math.max(0,good);
    const perfect=good===all; S.score+=Math.round(good/all*100*(1+S.k*.5)); if(perfect) S.ok++; try{ (perfect?[784,988,1175]:[440,330]).forEach((f,i)=>tone(f,.1,.05,"triangle",i*.08)); }catch(e){}
    B.innerHTML=`<div style="margin-top:40px;color:#7a3a1a;font:900 22px ${UI_FONT}">${perfect?"全對！阿秀姨鬆了一口氣":`對了 ${good} / ${all}`}</div>`; S.k++; setTimeout(()=>{ if(!G.ov.isConnected) return; S.k<3?show():end(); },1300); };
  const end=()=>{ G.close(); const d=LF(); const win=S.ok===3, paid=gamePaid("congee",5); let txt=""; if(win&&paid){ d.cg=(d.cg|0)+3; txt="三桌全對！阿秀姨送你三碗鹹粥（在背包，吃了會變幸運）。"; } else if(paid){ const c=S.ok*40; bag.coins+=c; txt=c?`對了 ${S.ok} 桌，阿秀姨塞給你 ${c} 平安幣。`:"沒關係，下次再來幫忙！"; } else txt="今天幫夠多了，謝謝你～（每天前 5 次有謝禮）"; save();
    rankPost("congee",S.score).then(j=>openSheet("lfCongee2","🥣 一粥七天",`<p class="lead">${S.score} 分。${txt}</p>${rankHtml("congee",j,1)}<div class="row"><button class="primary" data-act="lfCgGo">再幫一次</button></div>`)); };
  show(); }
/* 鹹粥: eat for 幸運 (today; up to 50) — fishing finds the rare ones more often, and the treasure hunt will too */
L.luck=()=>{ const d=LF(); return d.lkD===today()?Math.min(50,d.lk|0):0; };
HANDLERS.lfEatCongee=()=>{ const d=LF(); if(!(d.cg>0)) return; d.cg--; if(d.lkD!==today()){ d.lkD=today(); d.lk=0; } d.lk=Math.min(50,(d.lk|0)+10); save(); try{ [523,659,784].forEach((f,i)=>tone(f,.1,.05,"triangle",i*.08)); }catch(e){} toast(`🥣 熱呼呼的鹹粥！今天的幸運 ${d.lk}`,2600); try{ openBag(); }catch(e){} };

/* ---------- 🌿 中藥行：分類藥材 — 陳伯 can't read the labels any more: each herb comes up on the tray, tap the drawer with its name.
   20 herbs, 45 s, at most 3 mistakes. Winning gives a 大還丹 (eat it: 精力上限 +1, up to 200); after 100 of them, money or a 藥材包. ---------- */
const HERB=[["renshen","人參"],["gouqi","枸杞"],["hongzao","紅棗"],["huangqi","黃耆"],["danggui","當歸"],["gancao","甘草"],["chenpi","陳皮"],["juhua","菊花"],["rougui","肉桂"],["lianzi","蓮子"],["fuling","茯苓"],["guiyuan","桂圓"],["shengjiang","生薑"],["jinyinhua","金銀花"]];
const PACKS=[["pk_duck","當歸鴨藥材包"],["pk_siwu","四物湯藥材包"],["pk_lu","滷味藥材包"],["pk_beef","牛肉麵滷包"]];
GL["tw:herb"]=()=>{ const d=LF(); openSheet("lfHerb2","🌿 中藥行",`<p class="lead">陳伯：「年輕人，我眼睛看不太清楚，你能不能幫我把一樣的藥材配成對呢？」</p><p class="note">翻兩張一樣的就配成一對，60 秒內全部配完就成功。${(d.dht|0)<100?`成功會拿到一顆大還丹（已經吃了 ${d.dht|0} 顆）。`:"大還丹你已經吃滿了，陳伯改送別的。"}</p><div class="row"><button class="primary" data-act="lfHerbGo">幫忙分類</button><button class="secondary" data-act="lfRank" data-v="herb">今日排名</button></div>`); };
HANDLERS.lfHerbGo=()=>{ closeSheet(); herbPairs(); };
/* 中藥對對碰 (11/14, the chair: a pairs game, not naming): 16 cards face down, 8 kinds of herb; turn two, the same herb stays open.
   All pairs within 60 s wins (the fewer misses, the higher the score). */
function herbPairs(){ const G=gOverlay("🌿 中藥對對碰","linear-gradient(#f3e6cc,#d9bf94)"), B=G.B; const kinds=[...HERB].sort(()=>Math.random()-.5).slice(0,8); const cards=[...kinds,...kinds].sort(()=>Math.random()-.5).map(h=>({h,open:0,done:0}));
  const S={t:60,miss:0,pairs:0,pick:[],lock:false};
  const draw=()=>{ B.innerHTML=`<div style="display:flex;gap:16px;color:#5a3a1a;font:900 16px ${UI_FONT};margin:4px"><span id="hpT">⏱ ${Math.ceil(S.t)}</span><span>配對 ${S.pairs}/8</span><span>失誤 ${S.miss}</span></div>
    <div style="display:grid;grid-template-columns:repeat(4,78px);gap:8px;margin-top:8px">${cards.map((c,i)=>`<button data-c="${i}" style="height:96px;border-radius:12px;border:3px solid ${c.done?"#4c9a6a":"#6b4a2e"};background:${c.open||c.done?"#fff8ea":"linear-gradient(#a8744a,#7a5234)"};padding:4px;display:flex;flex-direction:column;align-items:center;justify-content:center">${c.open||c.done?`<img src="herbs/${c.h[0]}.webp" style="max-width:64px;max-height:58px"><span style="font:900 13px ${UI_FONT};color:#5a3a1a">${c.h[1]}</span>`:`<span style="font:900 26px ${UI_FONT};color:#ffe2a0">藥</span>`}</button>`).join("")}</div>`; };
  B.onclick=e=>{ const b=e.target.closest("[data-c]"); if(!b||S.lock) return; const c=cards[+b.dataset.c]; if(c.open||c.done) return; c.open=1; S.pick.push(c); try{ tone(620,.04,.04,"triangle"); }catch(_){}
    if(S.pick.length===2){ const [a,b2]=S.pick; S.pick=[]; if(a.h[0]===b2.h[0]){ a.done=b2.done=1; S.pairs++; try{ tone(880,.08,.05,"triangle"); tone(1175,.1,.05,"triangle",.08); }catch(_){} if(S.pairs===8){ draw(); return end(true); } }
      else { S.miss++; S.lock=true; draw(); setTimeout(()=>{ a.open=b2.open=0; S.lock=false; draw(); },650); return; } } draw(); };
  let last=performance.now(); const tick=now=>{ if(!G.ov.isConnected||S.done) return; S.t-=Math.min(.1,(now-last)/1000); last=now; const el=B.querySelector("#hpT"); if(el) el.textContent="⏱ "+Math.max(0,Math.ceil(S.t)); if(S.t<=0) return end(false); requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  const end=win=>{ if(S.done) return; S.done=1; setTimeout(()=>{ G.close(); const d=LF(), paid=gamePaid("herb",5), score=win?Math.max(10,100+Math.round(S.t)*2-S.miss*4):S.pairs*8; let txt="";
    if(win&&paid){ if((d.dht|0)+(d.dhtI|0)<100){ d.dhtI=(d.dhtI|0)+1; txt="陳伯：「好孩子，這顆大還丹給你。」（在背包裡，吃了精力上限 +1）"; } else if(Math.random()<.5){ const c=150+((Math.random()*4)|0)*50; bag.coins+=c; txt=`陳伯塞給你 ${c} 平安幣。`; } else { const P=PACKS[(Math.random()*PACKS.length)|0]; d.pk=d.pk||{}; d.pk[P[0]]=(d.pk[P[0]]|0)+1; txt=`陳伯送你一包「${P[1]}」，可以帶回家煮。`; } }
    else if(win) txt="今天幫夠多了，陳伯說明天再來（每天前 5 次有謝禮）。"; else txt="時間到了，還差一點點！"; save();
    rankPost("herb",score).then(j=>openSheet("lfHerb3","🌿 中藥對對碰",`<p class="lead">${win?"全部配對完成！":`配對了 ${S.pairs} / 8`}（失誤 ${S.miss}，${score} 分）。${txt}</p>${rankHtml("herb",j,1)}<div class="row"><button class="primary" data-act="lfHerbGo">再玩一次</button></div>`)); },win?700:200); }; draw(); }

function herbSort(){ const G=gOverlay("🌿 分類藥材","linear-gradient(#f3e6cc,#d9bf94)"), B=G.B; const S={n:0,ok:0,bad:0,t:45,cur:null,sel:[]};
  const pickRound=()=>{ S.sel=[...HERB].sort(()=>Math.random()-.5).slice(0,4); };
  const nextHerb=()=>{ if(S.n>=20||S.bad>3||S.t<=0) return end(); if(S.n%5===0) pickRound(); S.cur=S.sel[(Math.random()*4)|0]; S.n++; draw(); };
  const draw=()=>{ B.innerHTML=`<div style="display:flex;gap:16px;color:#5a3a1a;font:900 16px ${UI_FONT};margin:4px"><span>⏱ ${Math.ceil(S.t)}</span><span>✅ ${S.ok}</span><span>❌ ${S.bad}/3</span><span>${S.n}/20</span></div>
    <div style="width:230px;height:200px;margin:8px;border-radius:50%;background:radial-gradient(#fff8ea,#e9d2a8);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 -6px 12px rgba(120,80,30,.3)"><img src="herbs/${S.cur[0]}.webp" style="max-width:170px;max-height:150px"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:320px">${S.sel.map(h=>`<button data-h="${h[0]}" style="height:74px;border-radius:12px;border:3px solid #6b4a2e;background:linear-gradient(#a8744a,#7a5234);color:#fff3da;font:900 22px ${UI_FONT};box-shadow:inset 0 2px 0 rgba(255,255,255,.3)">${h[1]}</button>`).join("")}</div>`; };
  B.onclick=e=>{ const b=e.target.closest("[data-h]"); if(!b||!S.cur) return; const good=b.dataset.h===S.cur[0]; good?S.ok++:S.bad++; try{ good?tone(880,.06,.05,"triangle"):tone(200,.2,.05,"sawtooth"); }catch(e){} b.style.background=good?"#4c9a6a":"#c0392b"; S.cur=null; setTimeout(nextHerb,good?160:500); };
  let last=performance.now(); const tick=now=>{ if(!G.ov.isConnected||S.done) return; S.t-=Math.min(.1,(now-last)/1000); last=now; const sp=B.querySelector("span"); if(sp) sp.textContent="⏱ "+Math.max(0,Math.ceil(S.t)); if(S.t<=0){ end(); return; } requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  const end=()=>{ if(S.done) return; S.done=1; G.close(); const d=LF(), win=S.ok>=17&&S.bad<=3, paid=gamePaid("herb",5), score=S.ok*10+Math.max(0,Math.round(S.t))*2-S.bad*5; let txt="";
    if(win&&paid){ if((d.dht|0)+(d.dhtI|0)<100){ d.dhtI=(d.dhtI|0)+1; txt="陳伯：「好孩子，這顆大還丹給你。」（在背包裡，吃了精力上限 +1）"; } else if(Math.random()<.5){ const c=150+((Math.random()*4)|0)*50; bag.coins+=c; txt=`陳伯塞給你 ${c} 平安幣。`; } else { const P=PACKS[(Math.random()*PACKS.length)|0]; d.pk=d.pk||{}; d.pk[P[0]]=(d.pk[P[0]]|0)+1; txt=`陳伯送你一包「${P[1]}」，可以帶回家煮。`; } }
    else if(win) txt="今天幫夠多了，陳伯說明天再來（每天前 5 次有謝禮）。"; else txt=S.bad>3?"放錯太多了，陳伯皺著眉頭重新整理……":"時間到了，還差一點點！"; save();
    rankPost("herb",Math.max(0,score)).then(j=>openSheet("lfHerb3","🌿 中藥行",`<p class="lead">分對 ${S.ok} 樣、錯 ${S.bad} 次（${Math.max(0,score)} 分）。${txt}</p>${rankHtml("herb",j,1)}<div class="row"><button class="primary" data-act="lfHerbGo">再幫一次</button></div>`)); };
  nextHerb(); }
HANDLERS.lfEatDht=()=>{ const d=LF(); if(!(d.dhtI>0)) return; if((d.dht|0)>=100){ toast("大還丹已經吃滿了",2000); return; } d.dhtI--; d.dht=(d.dht|0)+1; bag.en=Math.min(enMax(),bag.en+1); save(); try{ [523,784,1047,1568].forEach((f,i)=>tone(f,.14,.05,"triangle",i*.09)); }catch(e){} toast(`💊 大還丹！精力上限變成 ${enMax()}`,2800); try{ openBag(); }catch(e){} };

/* ---------- 📚 書店：推積木 — the shelf is jammed: slide the books (each only along its own direction) until 文雄老闆's red block gets out
   of the gap on the right. Every game is a new layout, checked to be solvable; the fewer moves, the higher the score. ---------- */
GL["tw:book"]=()=>{ openSheet("lfBook","📚 書店",`<p class="lead">文雄老闆：「把書推開，讓我（紅色那塊）從右邊的缺口出去！」</p><p class="note">書只能沿著它的方向滑。步數越少分數越高；過關會拿到一本書（每天前 5 次）。</p><div class="row"><button class="primary" data-act="lfBookGo">開始整理</button><button class="secondary" data-act="lfRank" data-v="book">今日排名</button></div>`); };
HANDLERS.lfBookGo=()=>{ closeSheet(); bookGame(); };
function bkSolve(bl){ /* BFS on the 6×6 board; returns the fewest moves or -1 */ const key=b=>b.map(q=>q.x+","+q.y).join("|"); const seen=new Set([key(bl)]); let fr=[bl], d=0;
  while(fr.length&&d<40){ const nx=[]; for(const s of fr){ if(s[0].x===4) return d; const g=[]; for(let i=0;i<6;i++) g.push(Array(6).fill(-1)); s.forEach((q,i)=>{ for(let k=0;k<q.len;k++) g[q.y+(q.h?0:k)][q.x+(q.h?k:0)]=i; });
      s.forEach((q,i)=>{ for(const dir of [-1,1]){ let st=1; while(true){ const nx2=q.x+(q.h?dir*st:0), ny=q.y+(q.h?0:dir*st); const tx=q.h?(dir>0?nx2+q.len-1:nx2):nx2, ty=q.h?ny:(dir>0?ny+q.len-1:ny); if(tx<0||tx>5||ty<0||ty>5||g[ty][tx]!==-1) break; const n=s.map(o=>({...o})); n[i].x=nx2; n[i].y=ny; const k2=key(n); if(!seen.has(k2)){ seen.add(k2); nx.push(n); } st++; } } }); }
    fr=nx; d++; if(seen.size>60000) return -1; } return -1; }
function bkMake(){ for(let tries=0;tries<200;tries++){ const bl=[{x:0,y:2,len:2,h:1,c:"#c0392b"}]; const g=[...Array(6)].map(()=>Array(6).fill(0)); g[2][0]=g[2][1]=1; const cols=["#4f86c9","#e8a530","#5f9a6a","#8a5ab0","#d9628a","#3fa8a0","#c97a3a","#6a7a8a"];
    for(let k=0;k<40&&bl.length<12;k++){ const h=Math.random()<.5, len=Math.random()<.7?2:3, x=(Math.random()*(h?7-len:6))|0, y=(Math.random()*(h?6:7-len))|0; if(h&&y===2) continue; let ok=true; for(let i=0;i<len;i++){ if(g[y+(h?0:i)][x+(h?i:0)]){ ok=false; break; } } if(!ok) continue; for(let i=0;i<len;i++) g[y+(h?0:i)][x+(h?i:0)]=1; bl.push({x,y,len,h:h?1:0,c:cols[bl.length%cols.length]}); }
    const m=bkSolve(bl); if(m>=7) return {bl,min:m}; } return null; }
function bookGame(){ const P=bkMake(); if(!P){ toast("書架整理不了，再試一次",2000); return; } const G=gOverlay("📚 推積木","radial-gradient(#8a5a3a,#4a2a18)"), B=G.B; const S={bl:P.bl,moves:0,t0:performance.now()}; const C=48, O=12;
  B.innerHTML=`<div id="bkM" style="color:#ffe2a0;font:900 16px ${UI_FONT};margin:6px">步數 0（最少 ${P.min} 步）</div><canvas id="bkC" width="${C*6+O*2+30}" height="${C*6+O*2}" style="touch-action:none"></canvas>`;
  const cv=B.querySelector("#bkC"), x=cv.getContext("2d"); let drag=null;
  const occ=(ex)=>{ const g=[...Array(6)].map(()=>Array(6).fill(-1)); S.bl.forEach((q,i)=>{ if(i===ex) return; for(let k=0;k<q.len;k++) g[q.y+(q.h?0:k)][q.x+(q.h?k:0)]=i; }); return g; };
  const draw=()=>{ x.clearRect(0,0,cv.width,cv.height); x.fillStyle="#b07a4a"; x.fillRect(0,0,C*6+O*2,C*6+O*2); x.fillStyle="#5a3a22"; x.fillRect(O,O,C*6,C*6); x.fillStyle="#b07a4a"; x.fillRect(C*6+O,O+2*C,O,C); x.fillStyle="#ffe2a0"; x.fillRect(C*6+O*2,O+2*C+C*.3,20,C*.4);
    S.bl.forEach((q,i)=>{ const px=O+(drag&&drag.i===i?drag.px:q.x*C), py=O+(drag&&drag.i===i?drag.py:q.y*C), w=q.h?q.len*C:C, h=q.h?C:q.len*C; x.fillStyle=q.c; x.beginPath(); x.roundRect?x.roundRect(px+3,py+3,w-6,h-6,8):x.rect(px+3,py+3,w-6,h-6); x.fill(); x.fillStyle="rgba(255,255,255,.25)";
      for(let k=0;k<q.len*2;k++){ const cx2=px+(q.h?(k+.5)*C/2:C/2), cy2=py+(q.h?C/2:(k+.5)*C/2); x.beginPath(); x.arc(cx2,cy2,6,0,7); x.fill(); } if(i===0){ x.fillStyle="#fff"; x.font=`900 16px ${UI_FONT}`; x.textAlign="center"; x.fillText("老闆",px+w/2,py+h/2+6); } }); };
  const pos=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*cv.width/r.width-O,(e.clientY-r.top)*cv.height/r.height-O]; };
  cv.addEventListener("pointerdown",e=>{ const [mx,my]=pos(e); const cx=Math.floor(mx/C), cy=Math.floor(my/C); const i=S.bl.findIndex(q=>q.h?(cy===q.y&&cx>=q.x&&cx<q.x+q.len):(cx===q.x&&cy>=q.y&&cy<q.y+q.len)); if(i<0) return; try{ cv.setPointerCapture(e.pointerId); }catch(_){ } const q=S.bl[i], g=occ(i);
    let lo=q.h?q.x:q.y, hi=lo; while(true){ const t=lo-1; if(t<0||(q.h?g[q.y][t]:g[t][q.x])!==-1) break; lo=t; } while(true){ const t=hi+q.len; if(t>5||(q.h?g[q.y][t]:g[t][q.x])!==-1) break; hi++; } if(i===0&&hi===4) hi=4.6;
    drag={i,sx:mx,sy:my,ox:q.x*C,oy:q.y*C,px:q.x*C,py:q.y*C,lo:lo*C,hi:hi*C}; });
  cv.addEventListener("pointermove",e=>{ if(!drag) return; const [mx,my]=pos(e), q=S.bl[drag.i]; if(q.h) drag.px=Math.max(drag.lo,Math.min(drag.hi,drag.ox+mx-drag.sx)); else drag.py=Math.max(drag.lo,Math.min(drag.hi,drag.oy+my-drag.sy)); draw(); });
  const up=()=>{ if(!drag) return; const q=S.bl[drag.i], nv=Math.round((q.h?drag.px:drag.py)/C), ov=q.h?q.x:q.y; const won=drag.i===0&&drag.px>=4.4*C; if(q.h) q.x=Math.min(4,nv); else q.y=nv; if(nv!==ov||won){ S.moves++; try{ tone(520,.04,.04,"triangle"); }catch(e){} } drag=null; B.querySelector("#bkM").textContent=`步數 ${S.moves}（最少 ${P.min} 步）`; draw(); if(won||(q===S.bl[0]&&q.x===4)) end(); };
  cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up); draw();
  const end=()=>{ if(S.done) return; S.done=1; const secs=(performance.now()-S.t0)/1000, score=Math.max(10,Math.round(100+P.min*5-(S.moves-P.min)*4-secs/4)); try{ [784,988,1175,1568].forEach((f,i)=>tone(f,.12,.05,"triangle",i*.08)); }catch(e){}
    setTimeout(()=>{ G.close(); const d=LF(), paid=gamePaid("book",5); let txt="書架整理好了！"; if(paid) txt+=" "+bookPrize(d); else txt+="（今天的書已經送完了，每天前 5 次）"; save(); rankPost("book",score).then(j=>openSheet("lfBook2","📚 書店",`<p class="lead">${S.moves} 步（最少 ${P.min}），${score} 分。${txt}</p>${rankHtml("book",j,1)}<div class="row"><button class="primary" data-act="lfBookGo">再整理一次</button></div>`)); },700); }; }
const RECIPES=["當歸鴨麵線","四物雞湯","滷肉飯","牛肉麵","香菇雞湯","麻油雞","番茄炒蛋","三杯雞","蔥油餅","鹹粥"];
function bookPrize(d){ const r=Math.random(); if(r<.3){ energy(20); return "老闆送你《元氣百科》，翻一翻精神都來了（精力 +20）。"; } if(r<.45&&(d.spd|0)<15){ d.spd=(d.spd|0)+1; lfSpeed(); return `老闆送你《疾走之書》，走路永久變快 1%（現在 +${d.spd}%）。`; }
  if(r<.75){ const left=RECIPES.filter(n=>!(d.rcp||[]).includes(n)); if(left.length){ const n=left[(Math.random()*left.length)|0]; d.rcp=(d.rcp||[]).concat(n); return `老闆送你一本食譜《${n}》（之後可以在家煮）。`; } }
  const c=100+((Math.random()*5)|0)*100; bag.coins+=c; return `老闆送你一本舊書，翻開掉出 ${c} 平安幣！`; }
function lfSpeed(){ try{ const d=LF(); if(me.sp&&typeof CHAIR_SPD!=="undefined"&&CHAIR_SPD>1) return; meAv.moveSpeed=(d.spd|0)?3.31*(1+(d.spd|0)/100):undefined; }catch(e){} }
setTimeout(lfSpeed,3000);

/* ---------- 💐 花店：插花 — 雅琪老師 hands you some flowers; drag each one into the vase (where you let go is where its head goes).
   She scores it the way 花藝 classes do: three main stems at about 1 : ¾ : ½ of a height 1.5–2× the vase (天・地・人), not
   symmetrical, an odd number of focal flowers, two or three colours, balanced over the vase, not crowded, everything used. ---------- */
const FLW=[["玫瑰","#d6334a","focal"],["百合","#fbf6ee","focal"],["向日葵","#f6c22a","focal"],["桔梗","#8a5ac8","focal"],["康乃馨","#f08aa8","focal"],["滿天星","#ffffff","filler"],["尤加利葉","#7fa88a","leaf"],["雪柳","#e8f0e0","line"]];
GL["tw:flower"]=()=>{ openSheet("lfFlw","💐 花店",`<p class="lead">雅琪老師：「你是要來學插花的嗎？請進。」</p><div class="row"><button class="primary" data-act="lfFlwGo">學插花</button><button class="secondary" data-act="lfFlwShop">買種子</button><button class="secondary" data-act="lfRank" data-v="flower">今日排名</button></div><p class="note">分數及格送 1 枚扭蛋幣（每天前 3 次）；老師特別喜歡的作品，她會想留下來。</p>`); };
HANDLERS.lfFlwShop=()=>{ try{ L.flowerShop?L.flowerShop():toast("種子在花店老闆娘那裡買",2000); }catch(e){} };
HANDLERS.lfFlwGo=()=>{ closeSheet(); flowerGame(); };
function flowerGame(){ const G=gOverlay("💐 插花","linear-gradient(#f6f1e8,#e6dccb)"), B=G.B; const kinds=[...FLW].sort(()=>Math.random()-.5).slice(0,3); if(!kinds.some(k=>k[2]==="focal")) kinds[0]=FLW[0];
  const give=[]; kinds.forEach(k=>{ const n=k[2]==="focal"?3+((Math.random()*3)|0):2+((Math.random()*3)|0); for(let i=0;i<n;i++) give.push({f:k}); }); /* (one object per stem) */ const placed=[]; const W2=340, H2=470, VX=W2/2, VY=360, VW=70, VH=96;
  B.innerHTML=`<div style="color:#5a3a22;font:800 14px ${UI_FONT};margin:4px;text-align:center">把花拖進花瓶。放開的位置就是花朵的位置。</div><canvas id="flC" width="${W2}" height="${H2}" style="touch-action:none"></canvas><div class="row" style="gap:10px"><button class="secondary" id="flU">↩ 拿掉一枝</button><button class="primary" id="flOk">請老師評分</button></div>`;
  const cv=B.querySelector("#flC"), x=cv.getContext("2d"); let drag=null;
  const tray=()=>{ const left=give.filter(k=>!k._used); return left; };
  const drawFlower=(k,hx,hy,sx,sy,a)=>{ x.globalAlpha=a||1; x.strokeStyle=k[2]==="leaf"?"#5a8a62":"#4f7f4a"; x.lineWidth=3; x.beginPath(); x.moveTo(sx,sy); x.quadraticCurveTo((sx+hx)/2+(hx-sx)*.1,(sy+hy)/2,hx,hy); x.stroke();
    if(k[2]==="leaf"){ x.fillStyle=k[1]; for(let i=0;i<5;i++){ const t=.3+i*.15, px=sx+(hx-sx)*t, py=sy+(hy-sy)*t; x.beginPath(); x.ellipse(px+8,py,9,6,.5,0,7); x.ellipse(px-8,py,9,6,-.5,0,7); x.fill(); } }
    else if(k[2]==="filler"){ x.fillStyle=k[1]; for(let i=0;i<9;i++){ x.beginPath(); x.arc(hx+Math.cos(i*2.4)*12*Math.random(),hy+Math.sin(i*2.4)*10*Math.random(),3,0,7); x.fill(); } }
    else if(k[2]==="line"){ x.fillStyle=k[1]; for(let i=0;i<8;i++){ const t=.4+i*.08; x.beginPath(); x.arc(sx+(hx-sx)*t+4,sy+(hy-sy)*t,2.5,0,7); x.fill(); } }
    else { x.fillStyle=k[1]; x.strokeStyle="rgba(0,0,0,.18)"; x.lineWidth=1; for(let i=0;i<7;i++){ x.beginPath(); x.ellipse(hx+Math.cos(i*.9)*7,hy+Math.sin(i*.9)*6,9,7,i,0,7); x.fill(); x.stroke(); } x.fillStyle=k[0]==="向日葵"?"#6a3a1a":"rgba(255,230,160,.9)"; x.beginPath(); x.arc(hx,hy,k[0]==="向日葵"?7:3,0,7); x.fill(); } x.globalAlpha=1; };
  const draw=()=>{ x.clearRect(0,0,W2,H2); x.fillStyle="#efe6d6"; x.fillRect(0,H2-80,W2,80);
    placed.forEach(p=>drawFlower(p.k,p.x,p.y,VX+(p.x-VX)*.12,VY-VH+10));
    x.fillStyle="#3f6a8a"; x.beginPath(); x.moveTo(VX-VW/2,VY-VH); x.lineTo(VX+VW/2,VY-VH); x.quadraticCurveTo(VX+VW*.75,VY-VH*.4,VX+VW*.45,VY); x.lineTo(VX-VW*.45,VY); x.quadraticCurveTo(VX-VW*.75,VY-VH*.4,VX-VW/2,VY-VH); x.fill(); x.fillStyle="rgba(255,255,255,.25)"; x.fillRect(VX-VW/2+8,VY-VH+8,6,VH-20);
    const t=tray(); t.forEach((q,i)=>{ const k=q.f; const tx=26+i*(W2-40)/Math.max(1,t.length-1||1)*(t.length>1?1:0)+(t.length===1?W2/2-26:0), ty=H2-40; q._tx=tx; q._ty=ty; drawFlower(k,tx,ty-16,tx,ty+22,drag&&drag.q===q?.3:1); });
    if(drag) drawFlower(drag.q.f,drag.x,drag.y,VX,VY-VH+10,.9); };
  const pos=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*W2/r.width,(e.clientY-r.top)*H2/r.height]; };
  cv.addEventListener("pointerdown",e=>{ const [mx,my]=pos(e); const t=tray(); let k=null, bd=26; t.forEach(q=>{ const d=Math.hypot(mx-q._tx,my-(q._ty-10)); if(d<bd){ bd=d; k=q; } }); if(!k) return; try{ cv.setPointerCapture(e.pointerId); }catch(_){ } drag={q:k,x:mx,y:my}; draw(); });
  cv.addEventListener("pointermove",e=>{ if(!drag) return; [drag.x,drag.y]=pos(e); draw(); });
  const up=()=>{ if(!drag) return; const ok=drag.y<VY-VH-6&&Math.abs(drag.x-VX)<W2/2-10; if(ok){ drag.q._used=1; placed.push({k:drag.q.f,q:drag.q,x:drag.x,y:drag.y}); try{ tone(660+placed.length*30,.05,.04,"triangle"); }catch(e){} } drag=null; draw(); };
  cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
  B.querySelector("#flU").onclick=()=>{ const p=placed.pop(); if(p) p.q._used=0; draw(); }; B.querySelector("#flOk").onclick=()=>grade();
  const grade=()=>{ if(!placed.length){ toast("先插幾枝花吧",1500); return; } const mouthY=VY-VH, ht=p=>mouthY-p.y, byH=[...placed].sort((a,b)=>ht(b)-ht(a)), notes=[]; let sc=0;
    const h1=ht(byH[0]), h2=byH[1]?ht(byH[1]):0, h3=byH[2]?ht(byH[2]):0, rH=h1/VH; const s1=Math.max(0,20-Math.abs(rH-1.75)*30); sc+=s1; if(s1<10) notes.push(rH<1.75?"最高的那枝可以再高一點（花瓶的一倍半到兩倍）":"最高的那枝太高了");
    const s2=byH[2]?Math.max(0,20-Math.abs(h2/h1-.75)*50-Math.abs(h3/h1-.5)*50):0; sc+=s2; if(s2<10) notes.push("主枝的高低可以拉開：天、地、人大約 1：¾：½");
    const L=placed.filter(p=>p.x<VX-10).length, R=placed.filter(p=>p.x>VX+10).length, sym=Math.abs(L-R)===0&&L>0; const s3=sym?6:15; sc+=s3; if(sym) notes.push("左右太對稱了，花藝喜歡有一點不對稱的美");
    const foc=placed.filter(p=>p.k[2]==="focal").length; const s4=foc%2===1?10:4; sc+=s4; if(foc%2===0) notes.push("主花用單數會更自然");
    const cols=new Set(placed.map(p=>p.k[1])).size; const s5=cols>=2&&cols<=3?10:5; sc+=s5;
    const cx=placed.reduce((a,p)=>a+p.x,0)/placed.length; const s6=Math.max(0,10-Math.abs(cx-VX)/6); sc+=s6; if(s6<5) notes.push("整體重心偏一邊了");
    let close=0; for(let i=0;i<placed.length;i++) for(let j=i+1;j<placed.length;j++) if(Math.hypot(placed[i].x-placed[j].x,placed[i].y-placed[j].y)<22) close++; const s7=Math.max(0,10-close*3); sc+=s7; if(close>1) notes.push("有幾朵擠在一起，留一點空間會更好看");
    const used=placed.length/give.length; sc+=Math.round(5*used); sc=Math.round(Math.min(100,sc));
    G.close(); const G2=GAME_DAY(); const paid=me.sp||(G2.flw|0)<3; let txt=""; if(sc>=60&&paid){ G2.flw=(G2.flw|0)+1; if(sc>=90&&!G2.flwBig){ G2.flwBig=1; bag.gacha=Math.min(255,(bag.gacha||0)+5); txt="雅琪老師：「這盆花……太美了！！！我這裡有五枚扭蛋幣，你能把這盆花留給我嗎？我要好好學習。」（扭蛋幣 +5）"; } else { bag.gacha=Math.min(255,(bag.gacha||0)+1); txt="老師點點頭：「不錯喔。」（扭蛋幣 +1）"; } }
    else if(sc>=60) txt="老師：「很好，今天就練到這裡吧。」（每天前 3 次有獎勵）"; else txt="老師：「再試試看，慢慢來。」"; save();
    rankPost("flower",sc).then(j=>openSheet("lfFlw2","💐 老師評分",`<p class="lead">${sc} 分。${txt}</p>${notes.length?`<p class="note">${notes.slice(0,3).map(n=>"・"+n).join("<br>")}</p>`:""}${rankHtml("flower",j,1)}<div class="row"><button class="primary" data-act="lfFlwGo">再插一盆</button></div>`)); };
  draw(); }

/* ---------- 🍦 超巨大冰淇淋 (3D): hold your finger down to let the soft serve flow, and twist the cookie cone left/right by dragging. Turn it
   at the right speed for the flow: too slow and the cream piles up on one side (the tower leans and falls), too fast and the ribbon
   thins and snaps. Each full turn is a ring; the cone is lowered as it grows. Ranked by rings each day: next day the top 5 get
   2 扭蛋幣, 6–10th 500 平安幣, everyone else who played 300. ---------- */
GL["tw:ice"]=async()=>{ const j=await rankGet("ice"); let got=""; try{ const r=await fetch("/rankclaim",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({g:"ice",uid:GU(),name:me.name||"香客"})}); const c=await r.json();
    if(c&&c.rank){ if(c.rank<=5){ bag.gacha=Math.min(255,(bag.gacha||0)+2); got=`🎉 昨天你是第 ${c.rank} 名！奶奶送你 2 枚扭蛋幣。`; } else if(c.rank<=10){ bag.coins+=500; got=`昨天你是第 ${c.rank} 名，奶奶送你 500 平安幣。`; } else { bag.coins+=300; got=`謝謝你昨天來玩（第 ${c.rank} 名），奶奶送你 300 平安幣。`; } save(); } }catch(e){}
  openSheet("lfIce3","🍦 超巨大冰淇淋",`${got?`<p class="lead">${got}</p>`:""}<p class="lead">奶奶：「冰淇淋會一直流下來喔！用下面的圓盤轉餅乾杯、移動杯子，讓冰平均地疊上去，越高越好！」</p><p class="note">一次 30 平安幣。每天的排名第二天結算：前 5 名 2 枚扭蛋幣、6～10 名 500 平安幣、其他參加的人 300 平安幣。</p><div class="row"><button class="primary" data-act="lfIceGo">來擠！（30 幣）</button></div>${rankHtml("ice",j)}`); };
HANDLERS.lfIceGo=()=>{ closeSheet(); if(!pay()) return; iceGame(); };
function iceGame(){ /* 11/14 (the chair, after softserve.nog.cc): the nozzle above never stops; you hold a pointed waffle cone and, with the dial
   below, turn it (around the dial) and move it (in and out from the dial's centre) so the cream lands evenly. Where your finger is on
   the dial is where the cream lands on the cone. Cream heaps up and slides where it is too steep; what lands off the cone falls away;
   if the heap leans too far it topples. Ranked by height. */
  const G=gOverlay("🍦 超巨大冰淇淋","#fbf6ec"), B=G.B; B.style.top="0";
  B.innerHTML=`<canvas id="icC" style="position:absolute;left:0;top:0;width:100%;height:62%"></canvas><div id="icN" style="position:absolute;right:18px;top:calc(62% - 64px);color:#3f4f4a;font:900 34px ${UI_FONT};pointer-events:none">0.0 cm</div><div id="icH" style="position:absolute;left:14px;top:calc(62% - 40px);color:#7a6a5a;font:800 13px ${UI_FONT};pointer-events:none"></div>
   <div id="icD" style="position:absolute;left:0;right:0;bottom:0;height:38%;background:#e8ecdf;border-radius:28px 28px 0 0;touch-action:none"><svg viewBox="-150 -150 300 300" style="position:absolute;left:50%;top:50%;width:270px;height:270px;transform:translate(-50%,-50%);pointer-events:none"><circle r="120" fill="none" stroke="#9aa89a" stroke-width="3" stroke-dasharray="6 9"/><circle r="5" fill="#7a8a7a"/><circle id="icK" r="16" fill="rgba(122,140,122,.25)" stroke="#7a8a7a" stroke-width="3" cx="0" cy="0"/></svg></div><button class="secondary" id="icDone" style="position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 56px)">完成</button>`;
  const cv=B.querySelector("#icC"); let R; try{ R=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true}); }catch(e){ G.close(); toast("這台裝置畫不出 3D 冰淇淋",2000); return; }
  const sc=new T.Scene(), cam=new T.PerspectiveCamera(30,1,.05,60); sc.add(new T.HemisphereLight("#fffaf2","#d9c8b0",1.05)); const dl=new T.DirectionalLight("#ffffff",.85); dl.position.set(2,5,4); sc.add(dl);
  const fit=()=>{ const w=cv.clientWidth, h=cv.clientHeight; R.setPixelRatio(Math.min(2,devicePixelRatio||1)); R.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); }; fit(); addEventListener("resize",fit);
  /* nozzle */ const steel=new T.MeshStandardMaterial({color:"#62726c",roughness:.55,metalness:.2}); const pipe=new T.Mesh(new T.CylinderGeometry(.09,.09,1.6,24),steel); pipe.position.y=1.45; sc.add(pipe); const col=new T.Mesh(new T.CylinderGeometry(.19,.19,.12,28),steel); col.position.y=.66; sc.add(col); const tip=new T.Mesh(new T.CylinderGeometry(.15,.15,.2,28),steel); tip.position.y=.52; sc.add(tip);
  /* the cone (pointed waffle) */ const cone=new T.Group(); sc.add(cone); const waffle=cvs(128,128,(x,w,h)=>{ x.fillStyle="#c98e52"; x.fillRect(0,0,w,h); x.strokeStyle="#e2b47a"; x.lineWidth=3; for(let i=-w;i<w*2;i+=16){ x.beginPath(); x.moveTo(i,0); x.lineTo(i+h,h); x.stroke(); x.beginPath(); x.moveTo(i,h); x.lineTo(i+h,0); x.stroke(); } }); waffle.wrapS=waffle.wrapT=T.RepeatWrapping; waffle.repeat.set(3,2);
  const cm=new T.Mesh(new T.ConeGeometry(.3,.78,36,1,true),new T.MeshStandardMaterial({map:waffle,roughness:.85,side:T.DoubleSide})); cm.rotation.x=Math.PI; cm.position.y=-.39; cone.add(cm); const rim=new T.Mesh(new T.TorusGeometry(.3,.022,10,36),new T.MeshStandardMaterial({color:"#d9a066",roughness:.8})); rim.rotation.x=Math.PI/2; cone.add(rim);
  const inner=new T.Mesh(new T.CircleGeometry(.29,36),new T.MeshStandardMaterial({color:"#8a5a30",roughness:.9})); inner.rotation.x=-Math.PI/2; inner.position.y=-.03; cone.add(inner);
  const pile=new T.Group(); cone.add(pile);
  /* the heap: a height map over the cone mouth (local units; 1 unit = 20 cm) */
  const N=40, RG=.42, cell=2*RG/N, H=new Float32Array(N*N); const idx=(i,j)=>j*N+i; const toC=v=>Math.floor((v+RG)/cell);
  const hAt=(x,z)=>{ const i=toC(x), j=toC(z); return i<0||j<0||i>=N||j>=N?0:H[idx(i,j)]; };
  const cream=new T.MeshStandardMaterial({color:"#fff7ea",roughness:.42}), cream2=new T.MeshStandardMaterial({color:"#fbefdc",roughness:.42});
  const stream=new T.Mesh(new T.CylinderGeometry(.032,.036,.2,12),cream); stream.position.y=.37; sc.add(stream); /* (the cream always coming down) */
  const S={rho:0,phi:0,touch:false,pts:[],segs:0,top:0,t:0,over:false,spill:0,lean:new T.Vector2(),vol:0,last:new T.Vector3()};
  const D=B.querySelector("#icD"), K=B.querySelector("#icK"); const dial=e=>{ const r=D.getBoundingClientRect(); const cx=r.left+r.width/2, cy=r.top+r.height/2, s=270/300; const dx=(e.clientX-cx)/s, dy=(e.clientY-cy)/s; const d=Math.hypot(dx,dy); S.rho=Math.min(1,d/120); S.phi=Math.atan2(dy,dx); K.setAttribute("cx",Math.cos(S.phi)*S.rho*120); K.setAttribute("cy",Math.sin(S.phi)*S.rho*120); };
  D.addEventListener("pointerdown",e=>{ e.preventDefault(); S.touch=true; try{ D.setPointerCapture(e.pointerId); }catch(_){ } dial(e); }); D.addEventListener("pointermove",e=>{ if(S.touch) dial(e); }); const up=()=>{ S.touch=false; }; D.addEventListener("pointerup",up); D.addEventListener("pointercancel",up);
  B.querySelector("#icDone").onclick=()=>finish("完成！");
  const RM=.27; /* farthest from the middle the dial can put the cream */
  const deposit=(x,z,amt)=>{ /* a soft bump, then let too-steep cream slide down, and what is off the cone fall away */ const ci=toC(x), cj=toC(z), rr=3;
    for(let j=cj-rr;j<=cj+rr;j++) for(let i=ci-rr;i<=ci+rr;i++){ if(i<0||j<0||i>=N||j>=N) continue; const px=-RG+(i+.5)*cell, pz=-RG+(j+.5)*cell, w=Math.exp(-((px-x)**2+(pz-z)**2)/(2*.035*.035)); H[idx(i,j)]+=amt*w*.9; }
    for(let pass=0;pass<2;pass++) for(let j=1;j<N-1;j++) for(let i=1;i<N-1;i++){ const k=idx(i,j), h=H[k]; if(h<=0) continue; const nb=[k-1,k+1,k-N,k+N]; for(const n of nb){ const dh=h-H[n]; if(dh>cell*1.15){ const m=(dh-cell*1.15)*.25; H[k]-=m; H[n]+=m; } } }
    let vol=0, mx=0, mz=0, top=0; for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const k=idx(i,j); let h=H[k]; if(h<=0) continue; const px=-RG+(i+.5)*cell, pz=-RG+(j+.5)*cell, r=Math.hypot(px,pz);
      if(r>.3){ /* off the rim: stays only if the heap next to it (towards the middle) holds it up */ const ii=Math.round(i-(px/r)*1.5), jj=Math.round(j-(pz/r)*1.5); const sup=H[idx(Math.max(0,Math.min(N-1,ii)),Math.max(0,Math.min(N-1,jj)))]; if(sup<h*.9||r>RG-cell*2){ S.spill+=h; H[k]=0; continue; } }
      vol+=h; mx+=px*h; mz+=pz*h; if(h>top) top=h; } S.vol=vol; S.top=top; if(vol>0){ S.lean.set(mx/vol,mz/vol); } };
  const seg=()=>{ if(S.pts.length<4) return; const curve=new T.CatmullRomCurve3(S.pts.slice()); const m=new T.Mesh(new T.TubeGeometry(curve,S.pts.length*2,.034,8,false),S.segs%5===4?cream2:cream); pile.add(m); S.segs++; S.pts=S.pts.slice(-1); };
  const finish=line=>{ if(S.over) return; S.over=true; S.line=line; S.endT=0; try{ (line.startsWith("完成")?[784,988,1175,1568]:[300,220]).forEach((f,i)=>tone(f,.14,.05,line.startsWith("完成")?"triangle":"sawtooth",i*.09)); }catch(e){} };
  cam.position.set(0,.55,3.4); cam.lookAt(0,.05,0);
  let last=performance.now(), acc=0; const loop=now=>{ if(!G.ov.isConnected){ R.dispose(); try{ R.forceContextLoss(); }catch(e){} removeEventListener("resize",fit); return; }
    const dt=Math.min(.05,(now-last)/1000); last=now; S.t+=dt;
    if(!S.over){ const r=S.rho*RM, lx=Math.cos(-S.phi)*r, lz=Math.sin(-S.phi)*r; /* where the cream lands, in the cone's own frame */
      cone.rotation.y=S.phi; cone.position.x=-r; /* (turned by the dial, and moved so the nozzle is over that spot) */
      const hy=hAt(lx,lz); cone.position.y=.3-hy-.03; /* lowered as the heap grows so the top stays under the nozzle */
      const amt=dt*.026; deposit(lx,lz,amt); acc+=dt; const p=new T.Vector3(lx,hAt(lx,lz)+.02,lz); if(acc>.04&&p.distanceTo(S.last)>.012){ acc=0; S.pts.push(p); S.last.copy(p); if(S.pts.length>=10) seg(); }
      const cmH=S.top; const lean=S.lean.length()/(cmH*.9+.06); pile.rotation.z=S.lean.x*cmH*1.4; pile.rotation.x=-S.lean.y*cmH*1.4; if(cmH>.12&&lean>.62) finish("歪掉了，整坨倒下來了！");
      const cmv=cmH*20; B.querySelector("#icN").textContent=cmv.toFixed(1)+" cm"; B.querySelector("#icH").textContent=S.spill>.05?"有冰掉出杯子了！":lean>.45&&cmH>.1?"⚠️ 有點歪了":"";
      /* the falling stream */ }
    else { S.endT+=dt; if(S.line.startsWith("完成")){ const z=Math.min(1,S.endT/1.2); cam.position.set(0,.55+S.top*.4*z,3.4+S.top*3*z); cam.lookAt(0,.05-S.top*.2*z,0); cone.rotation.y+=dt*.8; } else { cone.rotation.z+=dt*1.6; cone.position.y-=dt*.8; }
      if(S.endT>2.2&&!S.sent){ S.sent=1; const mm=Math.round(S.top*200); G.close(); rankPost("ice",mm).then(j=>openSheet("lfIce4","🍦 超巨大冰淇淋",`<p class="lead">${S.line} 高 ${(mm/10).toFixed(1)} cm！</p>${rankHtml("ice",j,1)}<p class="note">排名明天結算，記得回來找奶奶領獎。</p><div class="row"><button class="primary" data-act="lfIceGo">再擠一支（30 幣）</button></div>`)); } }
    R.render(sc,cam); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

/* the burger game ranks too */ L.rankBurger=n=>rankPost("burger",n);
/* the shop prizes in the bag: 大還丹, 鹹粥, 藥材包, 食譜, 疾走之書 */
{ const E0=L.bagEntries, A0=L.bagActs, I0=L.bic; const EM={g_dht:"💊",g_cg:"🥣",g_rcp:"📕",g_spd:"👟"}; PACKS.forEach(p=>EM["g_"+p[0]]="🧧");
  L.bic=(k,cls)=>{ const id=k.slice(3); if(EM[id]) return `<span class="bic ${cls||""}" style="display:flex;align-items:center;justify-content:center;font-size:34px;background:none">${EM[id]}</span>`; return I0(k,cls); };
  L.bagEntries=(out,tab)=>{ E0(out,tab); if(tab!=="all"&&tab!=="goods") return; const d=LF();
    if(d.dhtI>0) out.push({id:"lf:g_dht",ic:"lf_g_dht",n:d.dhtI,name:"大還丹",desc:`中藥行陳伯給的。吃了精力上限永久 +1（已經吃了 ${d.dht|0} / 100 顆，上限 ${enMax()}）。`});
    if(d.cg>0) out.push({id:"lf:g_cg",ic:"lf_g_cg",n:d.cg,name:"鹹粥",desc:`一粥七天的鹹粥。吃了今天會比較幸運（現在 ${L.luck()}，最多 50），釣魚比較容易遇到稀有的魚。`});
    PACKS.forEach(p=>{ const n=d.pk&&d.pk[p[0]]; if(n>0) out.push({id:"lf:g_"+p[0],ic:"lf_g_"+p[0],n,name:p[1],desc:"中藥行陳伯送的。之後可以帶回家煮成料理，自己吃或送給鎮上的人。"}); });
    if((d.rcp||[]).length) out.push({id:"lf:g_rcp",ic:"lf_g_rcp",n:d.rcp.length,name:"食譜",desc:"書店老闆送的食譜："+d.rcp.join("、")+"。之後可以在家照著煮。"});
    if(d.spd>0) out.push({id:"lf:g_spd",ic:"lf_g_spd",name:"疾走之書",desc:`讀過以後走路永久變快（現在 +${d.spd}%，最多 15%）。`}); };
  L.bagActs=(k,e)=>k==="g_dht"?`<button class="chip" data-act="lfEatDht">吃一顆</button>`:k==="g_cg"?`<button class="chip" data-act="lfEatCongee">吃一碗</button>`:k.startsWith("g_")?"":A0(k,e); }

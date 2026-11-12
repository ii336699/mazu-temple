/* ================= 今日功課: 每日簽到, 三件每日功課＋寶箱, 回鍋禮, 功德簿 (long goals) and 香火位階 (a title before your name) =================
   Everything here is plain HTML in the bottom sheet and is driven by things that already happen (statInc and a few direct calls):
   nothing is drawn in 3D and nothing runs every frame, so it costs a phone nothing. Days turn over at midnight Taiwan time. */
DQ=(()=>{
const D={off:0};
const dayN=()=>Math.floor((Date.now()+288e5)/864e5)+D.off;
const SG=()=>{ if(!bag.sg||typeof bag.sg!=="object") bag.sg={n:0,st:0,last:0}; return bag.sg; };
const QD=()=>{ const d=dayN(); if(!bag.dq||bag.dq.d!==d) bag.dq={d,p:{},c:0}; if(!bag.dq.p||typeof bag.dq.p!=="object") bag.dq.p={}; return bag.dq; };
const LT=()=>{ if(!bag.lt||typeof bag.lt!=="object") bag.lt={}; return bag.lt; };
const AC=()=>{ if(!bag.ach||typeof bag.ach!=="object") bag.ach={}; return bag.ach; };
const keep=()=>{ try{ save("mz.bag",bag); }catch(e){} };
/* ---- 農曆與節慶: the lunar date comes from the browser's own calendar (no table to keep up to date). 初一 and 十五 and the big
        temple days double the 平安幣 of sign-in and 功課, and a finished 參拜 that day opens a 節日紅包. ---- */
let LF=null; try{ LF=new Intl.DateTimeFormat("en-u-ca-chinese",{timeZone:"Asia/Taipei",month:"numeric",day:"numeric"}); }catch(e){}
const LCACHE={};
const lunarOf=dn=>{ if(dn in LCACHE) return LCACHE[dn]; let r=null; try{ if(LF){ let m="",d=""; LF.formatToParts(new Date(dn*864e5+4*3600e3)).forEach(p=>{ if(p.type==="month") m=p.value; if(p.type==="day") d=p.value; });
    const mi=parseInt(m,10), di=parseInt(d,10); if(mi>=1&&mi<=12&&di>=1&&di<=30) r={m:mi,d:di,leap:/[^0-9]/.test(String(m).trim())}; } }catch(e){} return LCACHE[dn]=r; };
const LM=["正","二","三","四","五","六","七","八","九","十","冬","臘"], LD1=["初","十","廿","三"], LD2=["十","一","二","三","四","五","六","七","八","九"];
const ldName=d=>d===10?"初十":d===20?"二十":d===30?"三十":LD1[Math.floor(d/10)]+LD2[d%10];
const lName=l=>l?`農曆${l.leap?"閏":""}${LM[l.m-1]}月${ldName(l.d)}`:"";
const FEST=[[1,1,"春節","新年第一天，到廟裡走春"],[1,9,"天公生","玉皇上帝聖誕"],[1,15,"元宵節","上元天官賜福"],[2,2,"土地公生","福德正神聖誕"],[2,19,"觀音誕","觀世音菩薩聖誕"],[3,23,"媽祖誕辰","天上聖母聖誕，一年最大的日子"],
  [5,5,"端午節","午時水、掛艾草"],[6,24,"關聖帝君誕","關聖帝君聖誕"],[7,7,"七夕","月下老人牽紅線"],[7,15,"中元節","中元地官赦罪"],[8,15,"中秋節","月圓人團圓"],[9,9,"重陽節","媽祖昇天紀念日"]];
/* what today is: null, or {n:name, d:why, big:0 初一十五 / 1 a festival / 2 媽祖誕辰} */
const festOf=dn=>{ const l=dn===dayN()&&D.fake?D.fake:lunarOf(dn); if(!l) return null; const f=!l.leap&&FEST.find(x=>x[0]===l.m&&x[1]===l.d);
  if(f) return {n:f[2],d:f[3],big:f[2]==="媽祖誕辰"?2:1}; if(!l.leap&&l.m===12){ const t=lunarOf(dn+1); if(t&&t.m===1&&t.d===1) return {n:"除夕",d:"圍爐守歲，來跟媽祖說聲謝謝",big:1}; }
  if(l.d===1) return {n:"初一",d:"每月初一，到廟裡上香",big:0}; if(l.d===15) return {n:"十五",d:"每月十五，到廟裡上香",big:0}; return null; };
const fest=()=>festOf(dayN());
const mult=()=>fest()?2:1;
const FREW=[{c:300,g:1},{c:888,g:2},{c:2323,g:3}];
const QF=["bai",1,"🧧 節日紅包","今天完成一次參拜（燒化金紙圓滿，一鍵參拜也算）就能領",0];
/* the next 初一/十五 and the next festival, looking up to 400 days ahead (worked out once a day) */
let AHEAD=null; const ahead=()=>{ const d0=dayN(); if(AHEAD&&AHEAD.d===d0) return AHEAD; const o={d:d0,moon:null,big:null,list:[]};
  for(let i=1;i<=400&&!(o.moon&&o.big);i++){ const f=festOf(d0+i); if(!f) continue; if(!o.moon) o.moon={i,n:f.n}; if(f.big&&!o.big) o.big={i,n:f.n}; } return AHEAD=o; };
const mdOf=dn=>{ const t=new Date(dn*864e5+4*3600e3+288e5); return `${t.getUTCMonth()+1}/${t.getUTCDate()}`; };
/* ---- rewards ---- */
function give(r){ const t=[]; if(r.c){ bag.coins+=r.c; t.push(`平安幣 +${r.c}`); } if(r.g){ bag.gacha=Math.min(255,(bag.gacha||0)+r.g); t.push(`扭蛋幣 +${r.g}`); }
  if(r.s){ bag.snk=bag.snk&&typeof bag.snk==="object"?bag.snk:{}; bag.snk.energy=Math.min(63,(bag.snk.energy||0)+r.s); t.push(`提神飲料 ×${r.s}`); }
  saveBag(); markDirty(); try{ profSave(true); }catch(e){} try{ chaChing(); }catch(e){ try{ sfx.coin(); }catch(_){} } return t.join("、"); }
const rtxt=r=>[r.c?`${r.c} 幣`:"",r.g?`扭蛋幣×${r.g}`:"",r.s?`提神飲料×${r.s}`:""].filter(Boolean).join("＋");
/* ---- 簽到: a seven-day card that goes round and round (a missed day does not send you back to day one);
        coming on consecutive days adds 20 幣 a day on top, up to +200 ---- */
const SIGN=[{c:100},{c:150},{c:200},{c:100,s:1},{c:300},{c:400},{c:500,g:1}];
const signCan=()=>SG().last!==dayN();
const streakNow=()=>{ const s=SG(), d=dayN(); return s.last===d||s.last===d-1?(s.st||0):0; };
const signBonus=st=>20*Math.min(10,Math.max(0,st-1));
/* ---- 香火位階: from the number of days signed in; shown before your name (you can hide it) ---- */
const TITLES=[[3,"善信"],[7,"信眾"],[14,"虔信"],[30,"居士"],[60,"護持"],[100,"護法"],[200,"大護法"],[365,"長老"]];
const rankOf=n=>{ let r=0; TITLES.forEach((t,i)=>{ if(n>=t[0]) r=i+1; }); return r; };
D.title=()=>bag.ttlOff?0:rankOf(SG().n);
D.ttl=i=>{ i=i===undefined?D.title():(i|0); return i>=1&&i<=TITLES.length?TITLES[i-1][1]:""; };
function relabel(){ try{ meAv.setName(myLabel()); markDirty(); }catch(e){} }
/* ---- 每日功課: three a day, one from each group, picked by the date (everyone gets the same three) ---- */
const QA=[["bow",3,"🙏 參拜 3 次","按畫面下方的「拜」",100],["jiao",1,"🌙 擲筊 1 次","按畫面下方的「筊」",100],["lot",1,"🎋 求一支籤","按畫面下方的「籤」",100],["bai",1,"🔥 完成一次參拜","照參拜指引走完並燒化金紙，一鍵參拜也算",150]];
const QB=[["work",1,"🏪 在 M超商打工一班","禪房對面的商店街，一班要 33 精力",100],["claw",2,"🕹️ 夾娃娃 2 次","商店街的夾鬼夾怪，有沒有夾中都算",150],["buy",1,"🧃 在 M超商買一樣東西","商店街的 M超商",100],["cat",1,"🐈 摸摸貓咪","廟埕的流浪貓或自己養的貓都算",100]];
const QC=[["on",10,"⏳ 在廟裡待 10 分鐘","畫面開著才算",100],["zen",2,"🧘 在禪堂待 2 分鐘","走進禪堂就開始算",100],["chat",1,"💬 跟大家說一句話","聊天或快捷語都算",100]];
const QNM=["nm",1,"🏮 夜市玩一攤（加碼）","夜市每天 17:00–00:00，不算在寶箱裡",100];
const CHEST={c:200,g:1};
const hsh=(d,k)=>(Math.imul(d,2654435761|0)^Math.imul(k+1,40503))>>>0;
const todayQ=()=>{ const d=dayN(); return [QA[hsh(d,1)%QA.length],QB[hsh(d,2)%QB.length],QC[hsh(d,3)%QC.length]]; };
const prog=q=>Math.min(q[1],QD().p[q[0]]||0), isDone=q=>prog(q)>=q[1], got=i=>!!(QD().c&(1<<i));
/* ---- 功德簿: long goals; each step pays once ---- */
const bitsOn=v=>{ let n=0; v=v|0; while(v){ n+=v&1; v>>>=1; } return n; };
const ACH=[
  ["sign","📅 累計簽到",[3,7,14,30,60,100,200,365],"天",()=>SG().n],
  ["bai","🔥 參拜圓滿",[1,5,20,50,100],"次"],
  ["lot","🎋 求籤",[1,10,30,60],"支"],
  ["dq","🎁 每日功課全部完成",[1,7,30,100],"天"],
  ["work","🏪 超商打工",[1,10,30,100],"班"],
  ["clawWin","🕹️ 夾中娃娃",[1,10,30,100],"次"],
  ["nmW","🏮 夜市過關",[1,10,30,100],"次"],
  ["gacha","🎰 轉扭蛋",[1,10,30,60],"次"],
  ["zen","🧘 禪堂靜心",[10,60,300],"分鐘"],
  ["chat","💬 跟大家說話",[1,20,100],"句"],
  ["cat","🐈 摸摸貓咪",[1,20,100],"次"],
  ["clo","👗 服飾店的衣服",[1,3,6,9],"套",()=>bitsOn(bag.clo)],
  ["acc","🎩 收集飾品",[5,15,30,50],"個",()=>{ try{ const a=accState(); return ACC_IDS.filter(id=>a.owned[id]).length; }catch(e){ return 0; } }],
];
const LTK=["bai","lot","dq","work","clawWin","nmW","gacha","zen","chat","cat"];
const AREW=[100,200,400,800,1200,2000,3000,5000];
const arew=i=>({c:AREW[Math.min(i,AREW.length-1)],g:i>=2?1:0});
const aval=a=>a[4]?a[4]():(LT()[a[0]]||0);
const atier=a=>Math.min(a[2].length,AC()[a[0]]|0);
const acan=a=>{ const t=atier(a); return t<a[2].length&&aval(a)>=a[2][t]; };
/* ---- what happened: called from statInc and from a few places directly ---- */
const STATMAP={b_bowBtn:"bow",cvsWork:"work",clawPlay:"claw",clawWin:"clawWin",cvsBuy:"buy",minOnline:"on",minZen:"zen",gachaSpin:"gacha"};
D.stat=(k,n)=>{ const e=STATMAP[k]||(k.indexOf("nmP_")===0?"nm":k.indexOf("nmW_")===0?"nmW":""); if(e) D.ev(e,n); };
D.ev=(k,n)=>{ n=n||1; let ch=false; if(LTK.includes(k)){ const lt=LT(); lt[k]=Math.min(4095,(lt[k]||0)+n); ch=true; }
  const qs=todayQ().concat(fest()?[QNM,QF]:[QNM]), q=qs.find(x=>x[0]===k); if(q){ const d=QD(), b=d.p[k]||0; if(b<q[1]){ d.p[k]=b+n; ch=true; if(b+n>=q[1]) toast(q===QF?"🧧 參拜圓滿！到左上的按鈕領節日紅包":`✅ 每日功課完成：${q[2].replace(/^\S+\s/,"")}　到左上「📅 今日」領獎`,3600); } }
  if(ch){ keep(); dot(); if(sheetKind==="daily") try{ D.redraw(); }catch(e){} } };
/* ---- the button (beside 一鍵參拜) and its red dot ---- */
function css(){ if($("#dqCss")) return; const st=document.createElement("style"); st.id="dqCss"; st.textContent=`
.dq-row{order:2;display:flex;gap:6px;align-self:flex-start;align-items:center}.dq-row .auto-btn{order:0}
.dq-btn{position:relative}.dq-dot{position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:#ff4d3d;border:2px solid #2a0f0a}
.dq-hd{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}.dq-hd span{border:1px solid var(--gold-soft);border-radius:999px;padding:4px 10px;font-size:13px}.dq-hd b{color:#ffe2a0}
.dq-sec{font-size:13px;letter-spacing:.1em;color:var(--gold);margin:14px 0 6px;display:flex;align-items:baseline;gap:8px}.dq-sec small{letter-spacing:0;color:var(--muted);font-size:12px}
.dq-week{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.dq-day{border:1px solid var(--gold-soft);border-radius:10px;padding:6px 2px;text-align:center;font-size:11px;line-height:1.35;background:rgba(255,255,255,.04)}
.dq-day b{display:block;font-size:12px;color:#ffe2a0}.dq-day.ok{opacity:.5}.dq-day.now{border-color:#ffd76a;background:rgba(217,170,61,.22);opacity:1}
.dq-q{display:flex;align-items:center;gap:10px;border:1px solid var(--gold-soft);border-radius:12px;padding:9px 10px;margin-bottom:6px;background:rgba(255,255,255,.04)}
.dq-q .tx{flex:1;min-width:0}.dq-q .tx b{display:block;font-size:15px;font-weight:600}.dq-q .tx small{display:block;font-size:12px;color:var(--muted)}
.dq-bar{height:5px;border-radius:3px;background:rgba(255,255,255,.14);margin-top:5px;overflow:hidden}.dq-bar i{display:block;height:100%;background:#d9aa3d}
.dq-q button,.dq-go{flex:none;border:1px solid var(--gold-soft);border-radius:999px;padding:6px 12px;font-size:13px;white-space:nowrap}
.dq-q button.can{background:#b3261e;border-color:#ffd76a;color:#fff3da;font-weight:700}.dq-q button:disabled{opacity:.55}
.dq-q.done{opacity:.6}.dq-gift{border-color:#ffd76a;background:rgba(217,170,61,.18)}
.dq-wide{width:100%;margin-top:8px}
.dq-btn.dq-fest{border-color:#ffd76a;background:rgba(142,28,20,.6);color:#ffe2a0}
.dq-fb{border:1px solid #ffd76a;border-radius:12px;padding:10px 12px;margin-bottom:10px;background:linear-gradient(135deg,rgba(179,38,30,.55),rgba(217,170,61,.22))}.dq-fb b{display:block;font-size:17px;color:#ffe2a0}.dq-fb small{display:block;font-size:12.5px;line-height:1.5;color:#f3e7d0}
.dq-cal{font-size:12.5px;color:var(--muted);margin:-4px 0 10px;line-height:1.6}.dq-cal b{color:#ffe2a0;font-weight:600}`; document.head.appendChild(st); }
function mkBtn(){ if($("#dayBtn")) return; css(); const ab=$("#autoBtn"); if(!ab) return; const row=document.createElement("div"); row.className="dq-row"; ab.parentNode.insertBefore(row,ab); row.appendChild(ab);
  const b=document.createElement("button"); b.className="pill glass auto-btn dq-btn"; b.id="dayBtn"; b.setAttribute("aria-label","今日功課"); b.innerHTML=`📅 今日<i class="dq-dot" id="dqDot" hidden></i>`; row.appendChild(b);
  b.onclick=()=>{ try{ ensureAudio(); }catch(e){} if(sheetKind==="daily") closeSheet(); else D.open(); }; }
const pending=()=>{ const qs=todayQ(); let n=0; if(signCan()) n++; if(bag.cb) n++; qs.forEach((q,i)=>{ if(isDone(q)&&!got(i)) n++; }); if(qs.every((q,i)=>got(i))&&!got(3)) n++; if(isDone(QNM)&&!got(4)) n++; if(fest()&&isDone(QF)&&!got(5)) n++; ACH.forEach(a=>{ if(acan(a)) n++; }); return n; };
function dot(){ const e=$("#dqDot"); if(e) e.hidden=!pending(); const b=$("#dayBtn"), f=fest(); if(b){ const t=f?`🏮 ${f.n}`:"📅 今日"; if(b.firstChild&&b.firstChild.nodeValue!==t) b.firstChild.nodeValue=t; b.classList.toggle("dq-fest",!!f); } }
/* ---- the sheet ---- */
const qrow=(q,i,extra)=>{ const p=prog(q), dn=p>=q[1], g=got(i), r={c:q[4]*mult()};
  return `<div class="dq-q${g?" done":""}"><div class="tx"><b>${q[2]}</b><small>${q[3]}${extra||""}</small><div class="dq-bar"><i style="width:${Math.round(p/q[1]*100)}%"></i></div></div>
    <button data-act="dqClaim" data-v="${i}" class="${dn&&!g?"can":""}" ${dn&&!g?"":"disabled"}>${g?"已領取":dn?`領 ${rtxt(r)}`:`${p}/${q[1]}・${rtxt(r)}`}</button></div>`; };
D.redraw=()=>{ if(D.page==="ach") achDraw(); else D.open(); };
D.open=()=>{ D.page="day"; css(); const s=SG(), can=signCan(), qs=todayQ(), st=streakNow(), idx=can?s.n%7:(s.n+6)%7, rk=rankOf(s.n);
  const week=SIGN.map((r,i)=>{ const ok=can?i<idx:i<=idx, now=can&&i===idx; return `<div class="dq-day${ok?" ok":""}${now?" now":""}"><b>${ok?"✓":"第"+(i+1)+"天"}</b>${r.c}幣${r.s?"<br>🥤":""}${r.g?"<br>🎟️🪑":""}</div>`; }).join("");
  const nx=SIGN[s.n%7], allGot=qs.every((q,i)=>got(i)), nAch=ACH.filter(acan).length;
  const cb=bag.cb?`<div class="dq-q dq-gift"><div class="tx"><b>🎁 好久不見！回鍋禮</b><small>離開了 ${bag.cb} 天，媽祖一直惦記著你</small></div><button class="can" data-act="dqCb">領 ${rtxt(cbRew(bag.cb))}</button></div>`:"";
  const F=fest(), L=D.fake||lunarOf(dayN()), A=ahead(), fr=F?FREW[F.big]:null;
  const fb=F?`<div class="dq-fb"><b>🏮 今天是${F.n}</b><small>${F.d}。今天簽到、每日功課、寶箱的平安幣全部加倍，完成一次參拜還能領節日紅包。</small></div>`:"";
  const cal=L?`<div class="dq-cal">今天是 <b>${lName(L)}</b>${A.moon?`　下一個${A.moon.n}：<b>${mdOf(dayN()+A.moon.i)}</b>（還有 ${A.moon.i} 天）`:""}${A.big&&(!A.moon||A.big.i!==A.moon.i||A.big.n!==A.moon.n)?`　下一個節日：<b>${A.big.n} ${mdOf(dayN()+A.big.i)}</b>（還有 ${A.big.i} 天）`:""}<br>初一、十五和節日當天獎勵加倍，還有節日紅包。</div>`:"";
  const frow=F?`<div class="dq-q${got(5)?" done":" dq-gift"}"><div class="tx"><b>${QF[2]}・${F.n}</b><small>${QF[3]}，還有一件節日限定家具</small><div class="dq-bar"><i style="width:${isDone(QF)?100:0}%"></i></div></div><button data-act="dqFest" class="${isDone(QF)&&!got(5)?"can":""}" ${isDone(QF)&&!got(5)?"":"disabled"}>${got(5)?"已領取":(isDone(QF)?"領 ":"")+rtxt(fr)}</button></div>`:"";
  openSheet("daily",F?`🏮 ${F.n}・今日功課`:"📅 今日功課",`${fb}<div class="dq-hd"><span>連續 <b>${can?st:s.st||0}</b> 天</span><span>累計簽到 <b>${s.n}</b> 天</span>${rk?`<span>位階 <b>${TITLES[rk-1][1]}</b></span>`:""}</div>${cal}${cb}${frow}
    <div class="dq-sec">每日簽到<small>七天一輪；連續來每天多 20 幣（最多 +200）</small></div><div class="dq-week">${week}</div>
    <button class="primary dq-wide" data-act="dqSign" ${can?"":"disabled"}>${can?`簽到領取　${rtxt({...nx,c:(nx.c+signBonus(st+1))*mult()})}`:`今天簽到過了・明天可領 ${rtxt({...nx,c:(nx.c+signBonus((s.st||0)+1))*(festOf(dayN()+1)?2:1)})}`}</button>
    <div class="dq-sec">每日功課<small>每天 00:00 換新${F?"・今天加倍":""}</small></div>${qs.map((q,i)=>qrow(q,i)).join("")}
    <div class="dq-q${got(3)?" done":allGot?" dq-gift":""}"><div class="tx"><b>🎁 三件都完成的寶箱</b><small>三件功課的獎勵都領了就能開，裡面還有一件家具</small></div><button data-act="dqChest" class="${allGot&&!got(3)?"can":""}" ${allGot&&!got(3)?"":"disabled"}>${got(3)?"已領取":rtxt({...CHEST,c:CHEST.c*mult()})}</button></div>
    ${qrow(QNM,4)}
    <button class="secondary dq-wide" data-act="roomOpen">🏠 我的房間（佈置地板、壁紙、地毯、家具）</button>
    <button class="secondary dq-wide" data-act="dqAch">📖 功德簿・香火位階${nAch?`（${nAch} 個可領）`:""}</button>
    ${me.sp?`<div class="dq-sec">主委測試<small>只有主委看得到</small></div><div class="row"><button class="secondary" data-act="dqTNext">⏭ 跳到明天</button><button class="secondary" data-act="dqTSkip">⏭ 跳過 4 天（回鍋禮）</button><button class="secondary" data-act="dqTDone">✅ 今天功課全部做完</button><button class="secondary" data-act="dqTF" data-v="1">🏮 把今天當十五</button><button class="secondary" data-act="dqTF" data-v="2">🏮 把今天當媽祖誕辰</button><button class="secondary" data-act="dqTF" data-v="0">↩️ 還原成真正的日期</button></div><button class="secondary dq-wide" data-act="dqFwSched">🎆 節慶煙火：${load("mz.festFw",0)?"已開（按一下關掉）":"自動排進定時活動（按一下打開）"}</button><p class="note">打開後，接下來 30 天內的初一、十五和節日，晚上 8 點會自動放一場煙火（排在「定時活動」裡，可以個別刪掉）。伺服器一次只能排 30 天，所以主委每次進遊戲時會自動補排。</p>`:""}`); dot(); };
const cbRew=g=>({c:300+100*Math.min(7,g),g:1,s:2});
function achDraw(){ D.page="ach"; css(); const s=SG(), rk=rankOf(s.n), nxt=TITLES[rk];
  const rows=ACH.map(a=>{ const t=atier(a), v=aval(a), full=t>=a[2].length, tg=full?a[2][t-1]:a[2][t], can=!full&&v>=tg, r=arew(t);
    return `<div class="dq-q${full?" done":""}"><div class="tx"><b>${a[1]}</b><small>${full?`全部達成（${v} ${a[3]}）`:`第 ${t+1}/${a[2].length} 階：${Math.min(v,tg)}/${tg} ${a[3]}`}</small><div class="dq-bar"><i style="width:${full?100:Math.round(Math.min(1,v/tg)*100)}%"></i></div></div>
      <button data-act="dqAchGet" data-v="${a[0]}" class="${can?"can":""}" ${can?"":"disabled"}>${full?"圓滿":can?`領 ${rtxt(r)}`:rtxt(r)}</button></div>`; }).join("");
  openSheet("daily","📖 功德簿",`<button class="secondary" data-act="dqOpen" style="margin-bottom:10px">‹ 回今日功課</button>
    <div class="dq-sec">香火位階<small>累計簽到天數越多越高，會顯示在名字前面</small></div>
    <div class="dq-hd">${TITLES.map((t,i)=>`<span style="${i<rk?"border-color:#ffd76a":"opacity:.55"}">${i<rk?"✓ ":""}<b>${t[1]}</b> ${t[0]} 天</span>`).join("")}</div>
    <p class="note" style="margin:0 0 8px">${rk?`現在是「${TITLES[rk-1][1]}」。`:"簽到滿 3 天就有第一個位階。"}${nxt?`再簽到 ${nxt[0]-s.n} 天升「${nxt[1]}」。`:""}</p>
    ${rk?`<button class="secondary dq-wide" data-act="dqTtl" style="margin-top:0">${bag.ttlOff?"名字前面顯示位階":"名字前面不要顯示位階"}</button>`:""}
    <div class="dq-sec">功德簿<small>每一階只能領一次</small></div>${rows}`); dot(); }
Object.assign(HANDLERS,{
  dqOpen:()=>D.open(), dqAch:()=>achDraw(),
  dqSign:()=>{ if(!signCan()) return; const s=SG(), d=dayN(), r0=rankOf(s.n); s.st=s.last===d-1?(s.st||0)+1:1; const r={...SIGN[s.n%7]}; r.c=(r.c+signBonus(s.st))*mult(); const d7=s.n%7===6; s.n=Math.min(1023,s.n+1); s.last=d; const fu=(()=>{ try{ return ROOMX&&d7?ROOMX.grant("g"):""; }catch(e){ return ""; } })(); const t=give(r)+(fu?`、家具「${fu}」`:""); try{ statInc("dqSign"); }catch(e){}
    const r1=rankOf(s.n); if(r1>r0){ relabel(); toast(`📅 簽到成功：${t}　🎉 位階升為「${TITLES[r1-1][1]}」`,4200); } else toast(`📅 簽到成功：${t}`,3000); D.open(); },
  dqClaim:v=>{ const i=+v, q=i===4?QNM:todayQ()[i]; if(!q||got(i)||!isDone(q)) return; QD().c|=1<<i; const t=give({c:q[4]*mult()}); toast(`領取：${t}`,2400); D.open(); },
  dqChest:()=>{ if(got(3)||!todayQ().every((q,i)=>got(i))) return; QD().c|=8; const lt=LT(); lt.dq=Math.min(4095,(lt.dq||0)+1); const fu=(()=>{ try{ return ROOMX?ROOMX.grant("q"):""; }catch(e){ return ""; } })(); const t=give({...CHEST,c:CHEST.c*mult()})+(fu?`、家具「${fu}」`:""); try{ statInc("dqChest"); }catch(e){} toast(`🎁 寶箱：${t}`,4200); D.open(); },
  dqCb:()=>{ if(!bag.cb) return; const r=cbRew(bag.cb); delete bag.cb; const fu=(()=>{ try{ return ROOMX?ROOMX.grant("q"):""; }catch(e){ return ""; } })(); const t=give(r)+(fu?`、家具「${fu}」`:""); try{ statInc("dqBack"); }catch(e){} toast(`🎁 歡迎回來！${t}`,3600); D.open(); },
  dqAchGet:v=>{ const a=ACH.find(x=>x[0]===v); if(!a||!acan(a)) return; const t=atier(a); AC()[a[0]]=t+1; const tx=give(arew(t)); toast(`📖 ${a[1].replace(/^\S+\s/,"")} 第 ${t+1} 階：${tx}`,3200); achDraw(); },
  dqTtl:()=>{ bag.ttlOff=bag.ttlOff?0:1; saveBag(); relabel(); achDraw(); },
  dqTNext:()=>{ if(!me.sp) return; D.off++; toast("（測試）現在是明天",1800); D.open(); },
  dqTSkip:()=>{ if(!me.sp) return; D.off+=4; bag.cb=4; keep(); toast("（測試）過了 4 天",1800); D.open(); },
  dqFest:()=>{ const F=fest(); if(!F||got(5)||!isDone(QF)) return; QD().c|=32; const fu=(()=>{ try{ return ROOMX?ROOMX.grant("f"):""; }catch(e){ return ""; } })(); const t=give(FREW[F.big])+(fu?`、家具「${fu}」`:""); try{ statInc("dqFest"); }catch(e){} toast(`🧧 ${F.n}紅包：${t}`,3600); D.open(); },
  dqTF:v=>{ if(!me.sp) return; D.fake=v==="1"?{m:10,d:15,leap:false}:v==="2"?{m:3,d:23,leap:false}:null; AHEAD=null; D.open(); },
  dqFwSched:async()=>{ if(!me.sp) return; const on=!load("mz.festFw",0); save("mz.festFw",on?1:0); if(on){ const n=await festFw(true); toast(n<0?"沒有排成功（請先在主委工具輸入密碼）":`節慶煙火已打開，這次新排了 ${n} 場`,3200); } else toast("節慶煙火已關掉（已經排好的請到定時活動刪除）",3200); D.open(); },
  dqTDone:()=>{ if(!me.sp) return; const d=QD(); todayQ().concat([QNM,QF]).forEach(q=>{ d.p[q[0]]=q[1]; }); keep(); D.open(); },
});
/* ---- 取回碼: the sign-in card, today's claims, the 功德簿 and its counters travel with the character ---- */
D.pack=()=>{ const s=SG(), q=QD(), a=AC(), lt=LT(); const out=[[s.n,10],[s.st||0,10],[Math.max(0,s.last-D.off)&65535,16],[Math.max(0,q.d-D.off)&65535,16],[q.c&63,6],[bag.ttlOff?1:0,1]];
  ACH.forEach(x=>out.push([Math.min(15,a[x[0]]|0),4])); LTK.forEach(k=>out.push([Math.min(4095,lt[k]|0),12])); return out; };
D.unpack=get=>{ const o={n:get(10),st:get(10),last:get(16),qd:get(16),qc:get(6),off:get(1),ach:{},lt:{}}; ACH.forEach(x=>{ o.ach[x[0]]=get(4); }); LTK.forEach(k=>{ o.lt[k]=get(12); }); return o; };
D.restore=o=>{ if(!o) return; const s=SG(); if(o.n>s.n||(o.n===s.n&&o.last>s.last)){ s.n=o.n; s.st=o.st; s.last=o.last; } const q=QD(); if(o.qd===q.d) q.c|=o.qc; bag.ttlOff=o.off?1:0;
  const a=AC(), lt=LT(); ACH.forEach(x=>{ a[x[0]]=Math.max(a[x[0]]|0,o.ach[x[0]]|0); }); LTK.forEach(k=>{ lt[k]=Math.max(lt[k]|0,o.lt[k]|0); }); keep(); dot(); relabel(); };
/* ---- 節慶煙火 (chair only): puts a show at 20:00 Taiwan time on every 初一, 十五 and festival of the next 30 days into 定時活動
        (the server keeps at most 30 days), and tops the list up whenever the chair opens the game ---- */
async function festFw(loud){ try{ if(!me.sp) return -1; if(USE_CF&&!ck()) return -1; if(!SCHED.loaded) await schedLoad(); if(!SCHED.loaded) return -1; const d0=dayN()-D.off, now=Date.now(); let n=0;
    for(let i=0;i<30;i++){ const dn=d0+i, f=festOf(dn); if(!f) continue; const at=dn*864e5+12*3600e3, id="fs"+dn; if(at<now+60000||SCHED.items.some(e=>e.id===id)) continue; if(SCHED.items.length>=30) break;
      SCHED.items.push({id,at,k:"fw",sh:f.big===2?0:Math.floor(dn/15)%4,txt:`${f.n}平安煙火`,daily:false}); n++; }
    if(n&&!(await schedSave())) return -1; return n; }catch(e){ return -1; } }
if(me.sp) setTimeout(()=>{ try{ if(load("mz.festFw",0)) festFw(false); }catch(e){} },25000);
/* ---- start: 回鍋禮 for anyone away three days or more, the button, and (once a day) the card opens by itself ---- */
try{ if(bag.pday){ const g=Math.round((Date.parse(today)-Date.parse(bag.pday))/864e5); delete bag.pday; if(g>=3&&g<4000&&(bag.sg||bag.flow||(bag.coins|0)!==300)) bag.cb=Math.max(bag.cb|0,g); keep(); } }catch(e){}
mkBtn(); dot(); if(D.title()) relabel();
setTimeout(()=>{ try{ const F=fest(); if(F&&!firstVisitPending) toast(`🏮 今天是${F.n}：簽到和功課獎勵加倍，參拜圓滿可以領節日紅包`,5200); }catch(e){} },4500);
let tries=0; const auto=()=>{ if(!signCan()&&!bag.cb) return; const pe=$("#paper"); const busy=firstVisitPending||customizing||sheetKind||miniOpen||(SHOPX&&SHOPX.on)||(pe&&!pe.hidden)||document.hidden;
  if(busy){ if(++tries<20) setTimeout(auto,6000); return; } D.open(); };
setTimeout(auto,9000);
setInterval(()=>{ try{ dot(); }catch(e){} },60000);
return D; })();

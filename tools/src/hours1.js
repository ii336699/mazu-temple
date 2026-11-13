/* ---------- 營業時間與鎮民生活 (11/14): each shop keeps (Taiwan) hours. Outside them the shop shows its hours and its people are out
   walking up and down their street; the chair can always go in. Every day you visit a shop its people like you a little more
   (+1, up to 100); at 10, 30 and 60 they start telling you things — gossip about the others, a secret, a request. ---------- */
const HOURS={"tw:bfast":[6,13],"tw:congee":[18,26],"tw:drink":[10,22],"tw:ice":[11,21],"tw:herb":[9,20],"tw:book":[10,21],"tw:flower":[9,19],"tw:beauty":[10,20],"tw:photo":[10,19],"tw:tackle":[5,20],"tw:furn":[10,21]};
const twHour=()=>{ const d=new Date(Date.now()+8*3600e3); return d.getUTCHours()+d.getUTCMinutes()/60; };
const isOpen=k=>{ const h=HOURS[k]; if(!h) return true; const t=twHour(); return h[1]>24?(t>=h[0]||t<h[1]-24):(t>=h[0]&&t<h[1]); };
const hrs=k=>{ const h=HOURS[k], f=v=>String(v%24).padStart(2,"0")+":00"; return `${f(h[0])}–${f(h[1])}`; };
const GOSSIP={
 "tw:bfast":[["阿龍：「其實……我們每天吵，是因為她記性比我好，我不想輸啦。」"],["秀琴：「偷偷跟你說，阿龍年輕時追我，每天送我一份蘿蔔糕。」"],["兩個人一起：「你可以幫我們找一張『結婚那天』的照片嗎？聽說照相館阿光的爺爺有拍……」（隱藏任務）"]],
 "tw:herb":[["陳伯：「冰淇淋奶奶年輕的時候，可是鎮上最漂亮的姑娘。」"],["陳伯：「我年輕時常常去她的攤子買冰……一買就是五十年。」"],["陳伯：「我想送她一包桂圓，可是……你能幫我拿過去嗎？」（隱藏任務）"]],
 "tw:ice":[["奶奶：「中藥行的陳伯每天下午都來買一支香草的，從來不換口味。」"],["奶奶：「他以為我不知道他眼睛不好……其實我都幫他擠大支一點。」"],["奶奶：「我想吃他的藥膳，可是開不了口……」"]],
 "tw:drink":[["小安：「阿哲每天偷喝一杯全糖珍奶，然後說他在試新口味。」"],["阿哲：「小安喜歡書店的文雄老闆，每次都多送他一顆布丁。」"],["小安：「可以幫我送一杯烏龍奶茶給文雄老闆嗎？不要說是我送的！」（隱藏任務）"]],
 "tw:book":[["文雄：「書店裡最貴的書，是一本沒有名字的相簿，我一直在等它的主人。」"],["文雄：「照相館的阿光小時候常來看圖鑑，看到睡著。」"],["文雄：「那本相簿……好像是阿光爺爺寄放在這裡的。」（照相館隱藏線索）"]],
 "tw:photo":[["阿光：「爺爺說，奶奶最喜歡天后宮廟埕的燈籠。」"],["阿光：「書店的文雄老闆好像知道一些爺爺的事，可是他每次都說『時候還沒到』。」"],["阿光：「如果相簿拍滿五十張……爺爺說，最後一頁會告訴我一件事。」（相簿最後的秘密）"]],
 "tw:flower":[["雅琪：「美容院的 Kevin 每週都來買一枝白色桔梗，從來不說要送誰。」"],["雅琪：「我以前在台北教花，是為了照顧媽媽才回小鎮的。」"],["雅琪：「Kevin 說的『那個人』……好像就是我？」"]],
 "tw:beauty":[["Kevin：「花店的雅琪老師，是我國中時的家教老師。」"],["Kevin：「我開美容院，是因為她說過『你剪頭髮很有天分』。」"],["Kevin：「幫我想想，要怎麼跟她說謝謝比較好？」（隱藏任務）"]],
 "tw:tackle":[["阿財伯：「女神泉那裡，傳說有人釣到過金色的魚。」"],["阿財伯：「老王跟我年輕時比釣魚，比了三十年還沒分出勝負。」"],["阿財伯：「流星夜的海邊，會有平常看不到的魚……噓，別說是我講的。」"]],
 "tw:furn":[["美雲：「我會打瞌睡，是因為半夜都在做木工，送給鎮上的小朋友。」"],["美雲：「一粥七天的阿秀，是我小學同學，每天半夜我都去她那裡吃粥。」"],["美雲：「你房間要不要一張特別的椅子？我做給你。」（隱藏任務）"]],
 "tw:congee":[["阿秀：「家具行的美雲每天半夜一點來，一碗鹹粥不加芹菜。」"],["阿秀：「早餐店的阿龍和秀琴，其實是我介紹認識的。」"],["阿秀：「我的鹹粥秘方，是用陳伯的陳皮熬的高湯。」"]]};
const KA=k=>{ const d=LF(); d.ka=d.ka||{}; return d.ka[k]=d.ka[k]||{a:0,d:0}; };
/* wrap the keeper scene: closed → a sign; open → the day's affection, and now and then a piece of gossip after the scene */
{ const K0=L.keeper; L.keeper=(k,open)=>{ if(!KEEP[k]) return K0(k,open); if(!isOpen(k)&&!me.sp){ toast(`🕒 ${KEEP[k].ppl.map(p=>p.n).join("和")}不在店裡（營業時間 ${hrs(k)}）`,3000); return true; }
    const A=KA(k); if(A.d!==today()){ A.d=today(); A.a=Math.min(100,A.a+1); save(); } const r=K0(k,open); const t=A.a>=60?3:A.a>=30?2:A.a>=10?1:0;
    if(t&&GOSSIP[k]&&Math.random()<.45){ const line=GOSSIP[k][Math.min(t,GOSSIP[k].length)-1+0][0]; setTimeout(()=>{ try{ const S=KS[k]; if(S) keepSay(S.avs[0],line.replace(/^[^：]+：「?|」?（.*）$|」$/g,"").slice(0,40)); toast("💬 "+line,5200); }catch(e){} },4200); } return r; }; }
/* outside the hours: the shop people stroll along the street in front of their shop */
L.tick7=dt=>{ try{ for(const k in KS){ const S=KS[k]; const open=isOpen(k); S.avs.forEach((av,i)=>{ if(open){ if(av._out){ av._out=0; av.moveSpeed=0; av.pos.set(av._home[0],av._home[1]); av.target.copy(av.pos); av.root.position.set(av._home[0],0,av._home[1]); } return; }
      if(!av._home) av._home=[av.root.position.x,av.root.position.z]; if(!av._out){ av._out=1; av.moveSpeed=1.1; } if(av.target.distanceTo(av.pos)<.2){ const sp=S.sp, along=[Math.cos(sp.ry),-Math.sin(sp.ry)], o=(Math.random()*2-1)*14; av.target.set(av._home[0]+sp.fx*1.6+along[0]*o,av._home[1]+sp.fz*1.6+along[1]*o); } }); if(!open&&S.ctr) S.ctr.visible=false; else if(S.ctr) S.ctr.visible=true; } }catch(e){} if(L.tick8) L.tick8(dt); };

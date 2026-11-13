/* ================= 小鎮生活 (11/13): fishing and the fish book first; the townsfolk, the salon and barber, the stall games,
   the meteor and your own garden are added below as they are made. Everything a player owns here lives in bag.lf.
   Fish models are drawn in code for now (a body, a tail, a fin, colours and markings per kind): when the chair's models arrive,
   FISHGLB[id] is the only thing that has to be filled in. ================= */
LIFE=(()=>{
const L={};
const LF=()=>{ if(!bag.lf||typeof bag.lf!=="object") bag.lf={}; const d=bag.lf; d.fish=d.fish||{}; d.inv=Array.isArray(d.inv)?d.inv:[]; d.rod=d.rod|0; if(d.rod&&!d.rods) d.rods=d.rod>=2?0b1000011:1; /* (the first version had two rods) */ d.rods=d.rods|0; if(!Array.isArray(d.bait)||d.bait.length!==20) d.bait=Array(20).fill(0); return d; };
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
 ["guppy","孔雀魚","rbs",1,"","",[3,6],20,1,["#9aa8a0","#e8eee8","#ffb060"],"tailcol","尾巴像一把彩色的小扇子。"],
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
 /* (11/13, with the chair's models: new kinds go at the end — the save code counts on the order) */
 ["bass","鱸魚","r",2,"02","",[25,60],240,4,["#6a7a4a","#e8ecd8","#3a4a2a"],"line","嘴巴很大，清晨和黃昏最愛追小魚。"],
 ["arowana","龍魚","r",3,"3","",[50,90],1600,5,["#c8c8b8","#f0f0e4","#a8a898"],"scale","大河深處的銀龍，夜裡才浮上來。"],
 ["trout","虹鱒","b",2,"01","",[20,45],260,3,["#8a9a9a","#f0f0f0","#e88aa0"],"spot","身上一道粉紅色的彩虹，喜歡冰涼的溪水。"],
 ["goldfish","金魚","s",2,"","",[6,15],300,1,["#f08a2a","#ffd8a0","#ffffff"],"plain","不知道是誰放進泉池的，尾巴像一朵花。"],
].map(a=>({id:a[0],n:a[1],w:a[2],r:a[3],t:a[4],need:a[5],sz:a[6],p:a[7],sh:a[8],c:a[9],mk:a[10],d:a[11]}));
const FBY={}; FISH.forEach(f=>FBY[f.id]=f);
const RW={1:10,2:3.2,3:.7,4:.25}, RN=["","常見","少見","稀有","傳說"];
const WN={r:"大河",b:"溪谷",s:"泉池",g:"女神泉",o:"大海"};
L.FISH=FISH;
/* which fish can bite here, now */
function pool(kind){ const s=String(L.slot()), rain=L.rain(), star=!!L.starNight; return FISH.filter(f=>f.w.includes(kind)&&(!f.t||f.t.includes(s))&&(f.need!=="rain"||rain)&&(f.need!=="star"||star)); }
/* ---------- 釣竿 and 釣餌 (11/13). Rods: five for fresh water (溪釣: river, brook, springs), five for the sea, and one hidden one
   each. ctl widens the green zone and forgives pulling too hard, pow reels faster and tires the fish, luck brings rarer fish, win
   is extra time to strike when the float goes under. Baits follow what anglers really use: each has the fish that like it (they
   bite about four times as often, come sooner, and stay hooked better). One bait is used up each time a fish takes it. ---------- */
const RODS=[
 {k:"f",n:"竹製手竿",p:300,ctl:0,pow:1,luck:1,win:0,d:"一根竹子加一條線，最單純的釣法。"},
 {k:"f",n:"玻纖溪流竿",p:1500,ctl:.03,pow:1.12,luck:1.15,win:.05,d:"輕巧有彈性，溪邊走跳很順手。"},
 {k:"f",n:"碳纖長竿",p:4000,ctl:.06,pow:1.25,luck:1.3,win:.1,d:"又長又輕，大鯉魚也拉得住。"},
 {k:"f",n:"路亞竿",p:9000,ctl:.085,pow:1.4,luck:1.6,win:.14,d:"配捲線器的假餌竿，專門對付會追餌的大魚。"},
 {k:"f",n:"和竿",p:22000,ctl:.11,pow:1.55,luck:1.9,win:.18,d:"老師傅用竹節一段一段接成的名竿，手感細膩。"},
 {k:"f",n:"女神的金釣竿",p:0,hid:1,ctl:.15,pow:1.75,luck:2.6,win:.25,d:"泉水裡升起的釣竿，握著會微微發光。"},
 {k:"s",n:"岸拋入門竿",p:500,ctl:0,pow:1,luck:1,win:0,d:"站在沙灘就能拋出去，海釣的第一支竿。"},
 {k:"s",n:"磯釣竿",p:2500,ctl:.03,pow:1.12,luck:1.15,win:.05,d:"在礁石上釣黑鯛用的細長竿子。"},
 {k:"s",n:"遠投竿",p:6000,ctl:.06,pow:1.25,luck:1.3,win:.1,d:"能把餌拋到很遠的深水區。"},
 {k:"s",n:"船釣竿",p:14000,ctl:.085,pow:1.4,luck:1.6,win:.14,d:"又短又粗，專門跟大魚拔河。"},
 {k:"s",n:"石鯛竿",p:30000,ctl:.11,pow:1.55,luck:1.9,win:.18,d:"磯釣人的夢幻逸品，腰力驚人。"},
 {k:"s",n:"星辰釣竿",p:0,hid:1,ctl:.15,pow:1.75,luck:2.6,win:.25,d:"用天上掉下來的石頭打造的，夜裡像一道流星。"},
];
const BAITS=[
 {k:"f",n:"練餌",p:40,t:["tilapia","crucian","goldfish","carp"],d:"粉加水揉成的餌團，池塘河邊釣鯽魚、吳郭魚的基本款。"},
 {k:"f",n:"蚯蚓",p:60,t:["carp","crucian","catfish","loach","eel","tilapia"],d:"萬用活餌，河裡大多數的魚都吃。"},
 {k:"f",n:"紅蟲",p:60,t:["guppy","medaka","zacco","goldfish","angel"],d:"細細小小的紅色蟲，小型魚最愛。"},
 {k:"f",n:"地瓜玉米餌",p:80,t:["carp","koi","springkoi","bighead"],d:"蒸過的地瓜拌玉米粒，甜甜的，鯉魚抗拒不了。"},
 {k:"f",n:"溪蝦肉",p:90,t:["kuhua","zacco","bass","catfish"],d:"剝好的小蝦肉，溪流和河邊的肉食魚都會咬。"},
 {k:"f",n:"川蟲",p:120,t:["trout","masu","kuhua","ayu"],d:"翻溪裡石頭找到的水棲昆蟲，鱒魚的天然食物。"},
 {k:"f",n:"毛鉤",p:150,t:["trout","masu","ayu","zacco"],d:"用羽毛綁成的假蟲，在急流水面上輕輕點。"},
 {k:"f",n:"雞肝",p:100,t:["catfish","eel","sturgeon"],d:"味道很重，夜裡的鯰魚聞到就來。"},
 {k:"f",n:"活餌小魚",p:200,t:["bass","arowana","catfish","sturgeon"],d:"活蹦亂跳的小魚，引大型掠食魚出來。"},
 {k:"f",n:"路亞假餌",p:260,t:["bass","arowana","koi","goldscale"],d:"會閃會游的假魚，拋出去再慢慢收回來。"},
 {k:"s",n:"南極蝦",p:50,t:["mackerel","sardine","terapon","seahorse"],d:"海釣最常用的小蝦，什麼小魚都吃。"},
 {k:"s",n:"青蟲",p:70,t:["flounder","terapon","seabream"],d:"住在沙裡的海蟲，沙灘底棲魚的最愛。"},
 {k:"s",n:"活蝦",p:120,t:["seabream","grouper","puffer"],d:"鉤在尾巴上讓牠游，黑鯛和石斑最難抗拒。"},
 {k:"s",n:"誘餌粉",p:80,t:["mackerel","sardine","terapon"],d:"撒下去會散開一片，把成群的魚聚過來。"},
 {k:"s",n:"魷魚條",p:110,t:["hairtail","grouper","puffer","oarfish"],d:"切成長條的魷魚，又韌又耐咬，夜釣常用。"},
 {k:"s",n:"魚肉塊",p:130,t:["hairtail","shark","grouper"],d:"切塊的鯖魚肉，血水味會引來大傢伙。"},
 {k:"s",n:"木蝦",p:180,t:["squid"],d:"做成蝦子樣子的假餌，專門釣透抽、軟絲。"},
 {k:"s",n:"小螃蟹",p:160,t:["seabream","dragonbream","puffer"],d:"鯛魚會用牙齒咬碎殼來吃，釣大鯛的秘密武器。"},
 {k:"s",n:"活餌鯖魚",p:240,t:["mahi","shark","grouper","sunfish"],d:"整條活的小鯖魚，鬼頭刀看到會衝過來。"},
 {k:"s",n:"鐵板",p:280,t:["mahi","mackerel","hairtail","dragonbream"],d:"沉甸甸的金屬假餌，抽動時像受傷的小魚一樣閃。"},
];
const hasRod=i=>!!me.sp||!!(LF().rods&(1<<i));
function rodFor(kind){ const k=kind==="o"?"s":"f", d=LF(), eq=k==="f"?d.eqF:d.eqS; if(eq&&RODS[eq-1]&&RODS[eq-1].k===k&&hasRod(eq-1)) return RODS[eq-1]; let best=null; RODS.forEach((r,i)=>{ if(r.k===k&&hasRod(i)) best=r; }); return best; }
function baitFor(kind){ const k=kind==="o"?"s":"f", d=LF(), i=(k==="f"?d.bF:d.bS)|0; return i&&BAITS[i-1]&&BAITS[i-1].k===k&&d.bait[i-1]>0?BAITS[i-1]:null; }
function roll(kind,rod,bait){ const P=pool(kind), W=f=>RW[f.r]*(f.r>=3&&rod?rod.luck:1)*(bait&&bait.t.includes(f.id)?4:1); let tot=0; P.forEach(f=>tot+=W(f)); let x=Math.random()*tot; for(const f of P){ x-=W(f); if(x<=0) return f; } return P[0]; }
/* ---------- a fish drawn in code: for the book, the bag and the catch card ---------- */
const ICON={};
const FMODEL={bass:1,carp:1,tilapia:1,catfish:1,arowana:1,trout:1,goldfish:1,guppy:1,zacco:1,koi:1}; /* the kinds that have the chair's model (public/fish.glb, icons in public/fish/) */
function fishIcon(id,dark){ if(FMODEL[id]) return (window.FISH_PACK&&window.FISH_PACK[id+(dark?"-d":"")])||`fish/${id}${dark?"-d":""}.webp`; const k=id+(dark?"_d":""); if(ICON[k]) return ICON[k]; const f=FBY[id]; const c=document.createElement("canvas"); c.width=128; c.height=80; const x=c.getContext("2d");
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
L.bic=(k,cls)=>{ const id=k.slice(3); if(id.startsWith("c_")&&SB[id.slice(2)]) return `<span class="bic ${cls||""}" style="display:flex;align-items:center;justify-content:center;font-size:34px;background:none">${SB[id.slice(2)][5]}</span>`; if(id==="dex") return `<span class="bic ${cls||""}" style="display:flex;align-items:center;justify-content:center;font-size:34px;background:none">📖</span>`; return `<span class="bic ${cls||""}" style="background:url(${fishIcon(id)}) center/contain no-repeat"></span>`; };
/* a fish as a 3D thing (held up when caught): a stand-in until the models arrive */
let FGLB=null, FGLBwait=false; const WU={uT:{value:0}};
function fishLoad(){ if(FGLB||FGLBwait) return; FGLBwait=true; try{ loadRaw0("fish",false,sc=>{ FGLB={}; sc.traverse(o=>{ if(o.isMesh){ let n=o; while(n&&!FMODEL[n.name]) n=n.parent; if(n) FGLB[n.name]=o; } }); },()=>{}); }catch(e){} }
/* the body bends like a swimming fish: a wave runs from the head (−x) to the tail (+x), growing towards the tail */
let WM=null; function wagMat(src){ if(WM) return WM; WM=src.clone(); WM.onBeforeCompile=sh=>{ sh.uniforms.uT=WU.uT; sh.vertexShader="uniform float uT;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\n float fw=smoothstep(-.5,.5,position.x); transformed.z+=sin(position.x*6.5-uT*17.)*(.025+.16*fw*fw); transformed.x-=.03*fw*sin(uT*17.)*sin(uT*17.);"); }; WM.customProgramCacheKey=()=>"fishwag"; return WM; }
function fishMesh(f){ const g=new T.Group(); const src=FGLB&&FGLB[f.id];
  if(src){ const m=new T.Mesh(src.geometry,wagMat(src.material)); m.frustumCulled=false; g.add(m); g.userData.model=1; return g; }
  const t=new T.CanvasTexture(Object.assign(document.createElement("canvas"),{width:2,height:2})); const im=new Image(); im.onload=()=>{ t.image=im; t.needsUpdate=true; }; im.src=fishIcon(f.id); t.encoding=T.sRGBEncoding;
  const m=new T.Mesh(new T.PlaneGeometry(1,.62),new T.MeshBasicMaterial({map:t,transparent:true,side:T.DoubleSide,toneMapped:false})); g.add(m); g.userData.tex=t; return g; }
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
function startFish(){ if(F) return; const d=LF(); const w=near||findWater(); if(!w){ toast("離水邊再近一點",1800); return; } const rodS=rodFor(w.w.k); if(!rodS){ toast(w.w.k==="o"?"🎣 海邊要用海釣竿，老街的釣具行有賣":"🎣 要先到老街的釣具行買一支溪釣竿",3000); return; }
  if(d.inv.length>=40){ toast("背包裡的魚滿了（40 條），先到釣具行或雜貨店賣掉一些",3000); return; }
  meAv.target.copy(meAv.pos); meAv.path=[]; const face=Math.atan2(w.x-meAv.pos.x,w.z-meAv.pos.y); meAv.rotY=face; meAv.faceGoal=face;
  const ov=document.createElement("div"); ov.className="lf-ov"; ov.innerHTML=`<div class="lf-top" id="lfMsg">拋竿……</div><button class="lf-x" id="lfX">收竿</button><button id="lfBait" style="position:absolute;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 262px);border:1px solid rgba(255,255,255,.4);border-radius:12px;background:rgba(0,0,0,.5);color:#fff;font:800 13px ${UI_FONT};padding:7px 10px;text-align:left;max-width:60%"></button><button class="lf-btn" id="lfB">拉竿！</button>`; fishLoad(); document.body.appendChild(ov);
  /* the float: a slim stick float standing in the water — red tip, white body, the thin stem below the surface */
  const bob=new T.Group(); { const M=c=>new T.MeshStandardMaterial({color:c,roughness:.4}); const tip=new T.Mesh(new T.CylinderGeometry(.018,.03,.2,10),M("#e8402e")); tip.position.y=.26; bob.add(tip); const top=new T.Mesh(new T.SphereGeometry(.03,10,8),M("#ffd84a")); top.position.y=.37; bob.add(top);
    const body=new T.Mesh(new T.SphereGeometry(.07,14,10),M("#ffffff")); body.scale.set(1,1.5,1); body.position.y=.08; bob.add(body); const band=new T.Mesh(new T.CylinderGeometry(.071,.071,.03,14),M("#e8402e")); band.position.y=.1; bob.add(band); const stem=new T.Mesh(new T.CylinderGeometry(.008,.008,.3,6),M("#3a3a3a")); stem.position.y=-.15; bob.add(stem); } scene.add(bob);
  const sh=new T.Mesh(new T.CircleGeometry(1,20),new T.MeshBasicMaterial({color:"#0a1a24",transparent:true,opacity:0,depthWrite:false})); sh.rotation.x=-Math.PI/2; scene.add(sh);
  const ring=new T.Mesh(new T.RingGeometry(.12,.16,24),new T.MeshBasicMaterial({color:"#ffffff",transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide})); ring.rotation.x=-Math.PI/2; scene.add(ring);
  const line=new T.Mesh(new T.CylinderGeometry(.006,.006,1,4),new T.MeshBasicMaterial({color:"#f4f4f0"})); scene.add(line);
  const rod=new T.Mesh(new T.CylinderGeometry(.012,.024,1.7,6),new T.MeshStandardMaterial({color:"#6b4a2e",roughness:.6})); rod.position.set(.18,1.15,.55); rod.rotation.x=1.0; meAv.root.add(rod);
  F={ph:"cast",t:0,w,ov,bob,sh,ring,line,rod,y:w.w.y,fish:null,taps:0,nib:0,R:rodS};
  const bk=w.w.k==="o"?"s":"f", bb=ov.querySelector("#lfBait"), showBait=()=>{ const b=baitFor(w.w.k); bb.innerHTML=`🎣 ${F?F.R.n:rodS.n}<br>${b?`🪱 ${b.n} ×${d.bait[BAITS.indexOf(b)]}`:"🪱 沒有用餌"}　<span style="opacity:.7">換餌 ▸</span>`; };
  bb.onclick=()=>{ if(!F||["bite","fight","reel"].includes(F.ph)) return; const own=BAITS.map((b,i)=>i).filter(i=>BAITS[i].k===bk&&d.bait[i]>0), cur=(bk==="f"?d.bF:d.bS)|0, at=own.indexOf(cur-1), nx=at+1<own.length?own[at+1]+1:(at<0&&own.length?own[0]+1:0); if(bk==="f") d.bF=nx; else d.bS=nx; save(); showBait(); if(!own.length) toast("沒有這種水域的釣餌，釣具行有賣",2200); if(F.ph==="wait"){ F.fish=roll(w.w.k,F.R,baitFor(w.w.k)); } }; showBait(); F.showBait=showBait;
  try{ tone(900,.12,.04,"sine"); tone(500,.2,.03,"sine",.1); }catch(e){} chip.hidden=true;
  const B=ov.querySelector("#lfB"); const down=e=>{ e.preventDefault(); B.classList.add("on"); F&&(F.hold=true); press(); }, upf=e=>{ B.classList.remove("on"); F&&(F.hold=false); };
  B.addEventListener("pointerdown",down); B.addEventListener("pointerup",upf); B.addEventListener("pointercancel",upf); B.addEventListener("pointerleave",upf);
  ov.querySelector("#lfX").onclick=()=>endFish(); statInc&&statInc("lfCast"); }
const msg=t=>{ const m=F&&F.ov.querySelector("#lfMsg"); if(m) m.textContent=t; };
/* you watch the float and choose the moment: little dips are the fish tasting the bait (strike now and it bolts); when the whole
   float goes under, strike — the rarer the fish, the shorter that moment, and the more it teases with deeper dips first */
function press(){ if(!F) return; if(F.ph==="cast"||F.ph==="reel"||F.ph==="miss") return;
  if(F.ph==="fight") return;
  if(F.ph==="bite"){ F.good=F.bt<.25; F.ph="fight"; F.t=0; startFight(); try{ tone(660,.08,.06,"triangle"); tone(990,.12,.05,"triangle",.07); navigator.vibrate&&navigator.vibrate(60); }catch(e){} return; }
  msg(F.ph==="nibble"?"太早拉了，魚嚇跑了……":"還沒有魚咬餌，再等等"); if(F.ph==="nibble"){ try{ tone(240,.15,.05,"triangle"); }catch(e){} F.ph="miss"; F.t=0; } }
const biteWin=f=>[0,.95,.8,.62,.5][f.r]+(F&&F.R?F.R.win:0)+(F&&F.bm?.1:0);
/* the tug of war: hold 拉 to reel in, let go to give line; keep the white mark inside the green zone until the bar fills. The rarer and
   bigger the fish, the narrower the zone, the harder it runs and the slower the bar — a better rod and the right bait make up for it */
function startFight(){ const f=F.fish, R=F.R; F.tn=.35; F.prog=F.good?.25:.12; F.gc=.5; F.gw=Math.max(.13,[0,.34,.27,.2,.16][f.r]+R.ctl+(F.bm?.02:0)); F.over=0; F.slack=0; F.hold=true;
  F.ov.insertAdjacentHTML("beforeend",`<div class="lf-prog"><i id="lfP"></i></div><div class="lf-bar"><div class="g" id="lfG"></div><div class="p" id="lfPt"></div></div>`); F.ov.querySelector("#lfB").textContent="收線"; msg((F.good?"漂亮！":"中魚了！")+"按住收線、放開放線，白線留在綠色裡"); }
function fightOff(){ F.ov.querySelectorAll(".lf-prog,.lf-bar").forEach(e=>e.remove()); F.ov.querySelector("#lfB").textContent="拉竿！"; }
function endFish(){ if(!F) return; const o=F; F=null; [o.bob,o.sh,o.ring,o.line].forEach(m=>{ scene.remove(m); m.traverse(q=>{ if(q.isMesh){ q.geometry.dispose(); q.material.dispose(); } }); }); if(o.rod.parent) o.rod.parent.remove(o.rod); o.rod.geometry.dispose(); o.ov.remove(); meAv.faceGoal=null; }
function caught(){ const f=F.fish, d=LF(), size=Math.round((f.sz[0]+(f.sz[1]-f.sz[0])*Math.pow(Math.random(),1.6))*10)/10; const e=d.fish[f.id]||(d.fish[f.id]=[0,0,Date.now()]); const first=!e[0]; e[0]++; e[1]=Math.max(e[1],size);
  d.inv.push([f.id,size]); save(); try{ statInc("lfFish"); statInc("lfR"+f.r); }catch(e2){}
  /* the fish leaps out of the water to your hand and hangs there, thrashing */
  const hold=fishMesh(f), len=Math.max(.3,Math.min(1.5,size/100*1.5+.22)), from=F.bob.position.clone(); hold.scale.setScalar(len); scene.add(hold); HELD={g:hold,t:0,from,len};
  try{ /* a little fanfare, two seconds: a run up, three bright notes, a held chord */ [[392,0,.12],[523,.11,.12],[659,.22,.12],[784,.33,.2],[784,.6,.1],[880,.72,.1],[1047,.86,.9]].forEach(([q,at,du])=>tone(q,du,.06,"triangle",at)); [[523,.86],[659,.86],[1319,1.1]].forEach(([q,at])=>tone(q,.85,.03,"sine",at)); [[196,0],[262,.33],[262,.86]].forEach(([q,at])=>tone(q,.3,.045,"sine",at)); if(f.r>=3) [1568,2093].forEach((q,k)=>tone(q,.5,.03,"sine",1.2+k*.15)); }catch(e2){}
  endFish(); setTimeout(()=>card(f,size,first),2700); }
let HELD=null; const _hv2=new T.Vector3(), _c1=new T.Vector3(), _c2=new T.Vector3(); let camK=0;
/* while you fish the view swings to one side and a little above, so the float is in plain sight between you and the water */
const _cl=new T.Vector3(), _cp=new T.Vector3(); let camL=0;
function fishCam(dt,fx,fz,fy,held){ const a=meAv.root.position, dx=fx-a.x, dz=fz-a.z, L=Math.hypot(dx,dz)||1, ux=dx/L, uz=dz/L; camK=Math.min(1,camK+dt*1.6); const k=camK*camK*(3-2*camK);
  if(held){ /* the catch: the view comes round in front, on you and the fish beside you */ _c1.set(.3,1.55,3.2).applyMatrix4(meAv.root.matrixWorld); _c2.set(.27,.85,0).applyMatrix4(meAv.root.matrixWorld); }
  else { _c1.set(a.x-ux*2.3+uz*2.1,a.y+2.5,a.z-uz*2.3-ux*2.1); _c2.set(a.x+dx*.62,fy+.5,a.z+dz*.62); }
  if(!camL){ _cl.copy(_c2); _cp.copy(camera.position); camL=1; } _cl.lerp(_c2,Math.min(1,dt*4)); _cp.lerp(_c1,Math.min(1,dt*3.5)); camera.position.copy(_cp); camera.lookAt(_cl); } /* (its own position, eased: the game's camera is put back behind you every frame) */
function heldTick(dt){ WU.uT.value+=dt; if(!F&&!HELD){ camK=0; camL=0; return; } if(!HELD) return; const H=HELD, g=H.g; H.t+=dt; fishCam(dt,H.from.x,H.from.z,0,H.t>.35); const k=Math.min(1,H.t/.55), to=_hv2.set(.52,.5+H.len*.5,.28).applyMatrix4(meAv.root.matrixWorld);
  g.position.lerpVectors(H.from,to,k); g.position.y+=Math.sin(k*Math.PI)*1.3; const hang=k*k; /* leaps out, then hangs head up from the line */
  g.rotation.set(0,meAv.rotY,-Math.PI/2*hang+Math.sin(H.t*9)*.18); /* (its side towards the view, head up) */ if(!g.userData.model) g.rotation.set(0,meAv.rotY,0);
  if(L.heldFreeze&&H.t>2) H.t=1.2; if(H.t>3.6||(sheetKind==="lfCard"&&H.t>3.3)){ scene.remove(g); if(!g.userData.model) g.traverse(q=>{ if(q.isMesh){ q.geometry.dispose(); q.material.dispose(); } }); if(g.userData.tex) g.userData.tex.dispose(); HELD=null; } }
function card(f,size,first){ openSheet("lfCard","🎣 釣到了！",`<div class="lf-card"><img src="${fishIcon(f.id)}" alt=""><div class="nm">${f.n}</div><div class="st">${"★".repeat(f.r)}${"☆".repeat(4-f.r)}　${RN[f.r]}・${f.w.includes("o")?"海水魚":"淡水魚"}</div>
  ${first?`<div class="lf-new">第一次釣到！已登錄圖鑑</div>`:""}<p class="lead" style="margin:8px 0">${size} 公分。${f.d}</p><div class="row"><button class="primary" data-act="lfAgain">再釣一次</button><button class="secondary" data-act="lfRelease">放生</button></div><p class="note">釣到的魚收在背包裡，可以到釣具行或雜貨店賣，一條 ${price(f,size)} 平安幣左右。</p></div>`); }
const price=(f,size)=>Math.round(f.p*(.8+.4*(size-f.sz[0])/Math.max(1,f.sz[1]-f.sz[0])));
HANDLERS.lfAgain=()=>{ closeSheet(); setTimeout(startFish,250); };
HANDLERS.lfRelease=()=>{ if(HELD) HELD.t=9; const d=LF(); const e=d.inv.pop(); save(); closeSheet(); if(e) toast(`放生了「${FBY[e[0]].n}」，牠開心地游走了`,2200); };
function fishTick(dt){ if(!F){ nearT-=dt; if(nearT<=0){ nearT=.35; const can=!busy()&&TOWNX&&TOWNX.on; near=can&&!HELD?findWater():null; if(chip) chip.hidden=!near; } return; }
  F.t+=dt; const w=F.w, y=F.y, a=meAv.root.position; fishCam(dt,w.x,w.z,y);
  /* the line from the rod tip to the float */ const tip=new T.Vector3(.18,1.15+.85*Math.cos(1.0),.55+.85*Math.sin(1.0)).applyMatrix4(meAv.root.matrixWorld), bp=F.bob.position, mid=tip.clone().add(bp).multiplyScalar(.5), L=tip.distanceTo(bp); F.line.position.copy(mid); F.line.scale.set(1,L,1); F.line.lookAt(bp); F.line.rotateX(Math.PI/2);
  if(F.ph==="cast"){ const k=Math.min(1,F.t/.6); bp.set(a.x+(w.x-a.x)*k,y+Math.sin(k*Math.PI)*1.4+(1-k)*1.2,a.z+(w.z-a.z)*k); if(k>=1){ F.ph="wait"; F.t=0; F.wt=(2+Math.random()*4.5)*(baitFor(w.w.k)?.6:1); F.fish=roll(w.w.k,F.R,baitFor(w.w.k)); msg("等魚靠過來……浮標整個沉下去再拉"); F.ring.position.set(w.x,y+.01,w.z); F.ring.material.opacity=.7; F.rt=0; try{ tone(300,.08,.05,"sine"); }catch(e){} } return; }
  F.rt=(F.rt||0)+dt; F.ring.scale.setScalar(1+F.rt*3); F.ring.material.opacity=Math.max(0,.7-F.rt*.8);
  const bob=Math.sin(F.t*2.2)*.012; bp.set(w.x,y+bob,w.z);
  if(F.ph==="wait"){ const f=F.fish, s=.12+f.sh*.07; if(F.t>F.wt*.4){ const k=sm(F.wt*.4,F.wt,F.t), an=F.an??(F.an=Math.random()*6.283), dd=(1-k)*2.6+.25; F.sh.position.set(w.x+Math.sin(an)*dd,y-.03,w.z+Math.cos(an)*dd); F.sh.scale.set(s,s*1.8,1); F.sh.rotation.z=-an; F.sh.material.opacity=.45*sm(F.wt*.4,F.wt*.6,F.t); }
    if(F.t>F.wt){ F.ph="nibble"; F.t=0; F.nn=1+(Math.random()*(1+f.r)|0); F.nt=.5; F.dip=0; msg("有動靜了……看浮標"); const b=baitFor(w.w.k); F.bm=!!(b&&b.t.includes(f.id)); if(b){ const d=LF(), bi=BAITS.indexOf(b); d.bait[bi]--; save(); F.showBait(); } } return; }
  if(F.ph==="nibble"){ F.dip=Math.max(0,F.dip-dt*.35); bp.y=y+bob-F.dip; F.nt-=dt; if(F.nt<=0){ if(F.nn<=0){ F.ph="bite"; F.t=0; F.bt=0; F.rt=0; F.ring.material.opacity=.95; msg("浮標沉下去了！"); try{ tone(180,.18,.08,"sine"); tone(120,.25,.06,"sine",.05); navigator.vibrate&&navigator.vibrate(120); }catch(e){} return; }
      F.nn--; F.nt=.65+Math.random()*.9; F.dip=F.fish.r>=2&&Math.random()<.35?.2:.07+Math.random()*.05; /* (a teasing deeper dip now and then) */ F.rt=0; F.ring.material.opacity=.5; try{ tone(420,.05,.03,"sine"); }catch(e){} } return; }
  if(F.ph==="bite"){ F.bt=F.t; bp.y=y-.42+Math.sin(F.t*30)*.015; F.sh.position.set(w.x,y-.03,w.z); if(F.t>biteWin(F.fish)){ msg("慢了一步，魚吃完餌跑掉了……"); try{ tone(200,.2,.05,"triangle"); }catch(e){} F.ph="miss"; F.t=0; } return; }
  if(F.ph==="fight"){ const f=F.fish, R=F.R, pull=(f.r*.9+f.sh*.3)*.2/(.75+R.pow*.25); F.tn+=(F.hold?.95:-.75)*dt; F.tn+=(Math.sin(F.t*(2+f.r))*pull+(Math.random()-.5)*pull*2.2)*dt; F.gc=.5+Math.sin(F.t*.9*(1+f.r*.3))*(.1+f.r*.05); F.tn=Math.max(0,Math.min(1,F.tn));
    const inG=Math.abs(F.tn-F.gc)<F.gw/2; F.prog+=(inG?.21/(1+f.r*.22)*R.pow*(F.bm?1.15:1):-(.05+f.r*.012))*dt; F.over=F.tn>=.99?F.over+dt:0; F.slack=F.tn<=.01?F.slack+dt:0;
    bp.set(w.x+Math.sin(F.t*3)*.18*(1-F.prog),y-.3,w.z+Math.cos(F.t*2.3)*.18*(1-F.prog)); F.sh.material.opacity=.5; F.sh.position.set(bp.x,y-.03,bp.z); F.rod.rotation.x=1.0-.25*F.tn;
    const g=F.ov.querySelector("#lfG"), pp=F.ov.querySelector("#lfPt"), pr=F.ov.querySelector("#lfP"); if(g){ g.style.left=((F.gc-F.gw/2)*100)+"%"; g.style.width=(F.gw*100)+"%"; pp.style.left=(F.tn*100)+"%"; pr.style.width=(Math.max(0,F.prog)*100)+"%"; }
    if(F.prog>=1){ fightOff(); F.ph="reel"; F.t=0; msg("拉上來了！"); return; }
    if(F.over>.55+R.ctl*2.5){ msg("線斷了！拉太用力了……"); try{ tone(200,.2,.06,"sawtooth"); }catch(e){} fightOff(); F.ph="miss"; F.t=0; return; }
    if(F.prog<-.04||F.slack>2){ msg(F.slack>2?"線太鬆，魚掙脫了……":"魚掙脫了……"); try{ tone(200,.2,.05,"triangle"); }catch(e){} fightOff(); F.ph="miss"; F.t=0; } return; }
  if(F.ph==="reel"){ const k=Math.min(1,F.t/.5); bp.set(w.x+(a.x-w.x)*k*.35,y-.3+k*.3,w.z+(a.z-w.z)*k*.35); F.rod.rotation.x=1.0-k*.7; F.sh.material.opacity=.5*(1-k); if(F.t>.5){ caught(); } return; }
  if(F.ph==="miss"){ F.sh.material.opacity=Math.max(0,F.sh.material.opacity-dt); bp.y=y+bob; if(F.t>1.4){ F.ph="wait"; F.t=0; F.wt=(2+Math.random()*4.5)*(baitFor(w.w.k)?.6:1); F.fish=roll(w.w.k,F.R,baitFor(w.w.k)); F.an=null; msg("再等等……"); } return; } }
/* ---------- the fish book ---------- */
let dexTab="r";
function dex(){ const d=LF(), got=FISH.filter(f=>d.fish[f.id]).length; const tabs=[["r","淡水"],["o","海水"]];
  const list=FISH.filter(f=>dexTab==="o"?f.w.includes("o"):!f.w.includes("o"));
  openSheet("lfDex","📖 圖鑑・魚",`<p class="lead">釣到 ${got} / ${FISH.length} 種。沒釣過的只看得到黑影。</p><div class="row">${tabs.map(t=>`<button class="${dexTab===t[0]?"primary":"secondary"}" data-act="lfDexTab" data-v="${t[0]}">${t[1]}</button>`).join("")}</div>
   <div class="lf-dex">${list.map(f=>{ const e=d.fish[f.id]; return `<button data-act="lfDexOne" data-v="${f.id}" class="${e?"":"no"}"><img src="${fishIcon(f.id,!e)}" alt=""><b>${e?f.n:"？？？"}</b>${e?`<small>${e[0]} 條</small>`:`<small>${"★".repeat(f.r)}</small>`}</button>`; }).join("")}</div><p class="note">之後會加上蟲、花、貝殼的圖鑑。</p>`); }
HANDLERS.lfDexTab=v=>{ dexTab=v; dex(); };
HANDLERS.lfDexOne=v=>{ const f=FBY[v], e=LF().fish[v]; if(!f) return; const when=f.t?f.t.split("").map(c=>SLOTN[+c]).join("、"):"整天";
  openSheet("lfDexOne","📖 "+(e?f.n:"？？？"),`<div class="lf-card"><img src="${fishIcon(f.id,!e)}" alt=""><div class="nm">${e?f.n:"還沒釣到"}</div><div class="st">${"★".repeat(f.r)}${"☆".repeat(4-f.r)}　${RN[f.r]}・${f.w.includes("o")?"海水魚":"淡水魚"}</div>
   ${e?`<p class="lead" style="margin:8px 0">${f.d}</p><p class="note">出沒：${f.w.split("").map(c=>WN[c]).join("、")}｜時段：${when}${f.need==="rain"?"｜要下雨":""}${f.need==="star"?"｜流星夜":""}<br>釣過 ${e[0]} 條，最大 ${e[1]} 公分。${BAITS.some(b=>b.t.includes(f.id))?`<br>愛吃：${BAITS.filter(b=>b.t.includes(f.id)).map(b=>b.n).join("、")}`:""}</p>`:`<p class="lead" style="margin:8px 0">出沒：${f.w.split("").map(c=>WN[c]).join("、")}。其他的要自己釣釣看，或問問鎮上的人。</p>`}<div class="row"><button class="secondary" data-act="lfDex">回圖鑑</button></div></div>`); };
HANDLERS.lfDex=()=>dex(); L.dex=dex;
/* ---------- selling, the tackle shop ---------- */
function sellSheet(kind){ const d=LF(), cnt={}; d.inv.forEach(([id,s])=>{ const c=cnt[id]||(cnt[id]={n:0,v:0}); c.n++; c.v+=price(FBY[id],s); }); const tot=Object.values(cnt).reduce((a,c)=>a+c.v,0);
  return `${Object.keys(cnt).length?Object.keys(cnt).map(id=>`<div class="lf-row"><img src="${fishIcon(id)}" alt=""><div class="t"><b>${FBY[id].n}</b> ×${cnt[id].n}<br><small>共 ${cnt[id].v} 平安幣</small></div><button class="secondary" data-act="lfSell" data-v="${kind}:${id}">賣</button></div>`).join("")+`<div class="row" style="margin-top:8px"><button class="primary" data-act="lfSell" data-v="${kind}:*">全部賣掉・${tot} 幣</button></div>`:`<p class="note">背包裡還沒有魚。</p>`}`; }
function sell(id){ const d=LF(); let got=0, n=0; d.inv=d.inv.filter(([i,s])=>{ if(id==="*"||i===id){ got+=price(FBY[i],s); n++; return false; } return true; }); if(!n) return 0; bag.coins+=got; save(); try{ profSave(true); chaChing(); }catch(e){} toast(`賣了 ${n} 條魚，拿到 ${got} 平安幣`,2400); return got; }
let tkTab="rf";
const stars=(v,lo,hi)=>{ const n=Math.max(1,Math.min(5,Math.round(1+4*(v-lo)/(hi-lo)))); return "★".repeat(n)+"☆".repeat(5-n); };
function tackle(){ const d=LF(); const tabs=[["rf","溪釣竿"],["rs","海釣竿"],["bf","溪釣餌"],["bs","海釣餌"],["sell","賣魚"]]; let body="";
  if(tkTab==="rf"||tkTab==="rs"){ const k=tkTab==="rf"?"f":"s", eq=k==="f"?d.eqF:d.eqS, cur=rodFor(k==="f"?"r":"o");
    body=`<p class="note" style="margin:6px 0">${k==="f"?"溪釣竿用在大河、溪谷和泉池。":"海釣竿用在海邊。"}釣竿不會壞。越稀有的魚越難拉，好竿子拉起來比較穩。</p>`+RODS.map((r,i)=>{ if(r.k!==k) return ""; const own=hasRod(i), using=cur===r;
      if(r.hid&&!own){ const can=i===11&&((d.stone|0)>=1||(d.dust|0)>=8); return `<div class="lf-row"><div class="t"><b>？？？</b><br><small>${can?"老闆：「這石頭……我可以幫你打一支特別的竿子。」":"聽說有人見過一支很特別的釣竿……"}</small></div>${can?`<button class="primary" data-act="lfForge">打造</button>`:""}</div>`; }
      return `<div class="lf-row"><div class="t"><b>${r.n}</b>${r.hid?"":`　${r.p} 幣`}<br><small>${r.d}<br>操控 ${stars(r.ctl,0,.15)}　力量 ${stars(r.pow,1,1.75)}　魚運 ${stars(r.luck,1,2.6)}</small></div>${own?`<button class="${using?"secondary":"primary"}" data-act="lfRodEq" data-v="${i}" ${using?"disabled":""}>${using?"使用中":"換這支"}</button>`:`<button class="primary" data-act="lfRod" data-v="${i}">買</button>`}</div>`; }).join(""); }
  else if(tkTab==="bf"||tkTab==="bs"){ const k=tkTab==="bf"?"f":"s"; body=`<p class="note" style="margin:6px 0">一包 10 份，魚咬一次用掉一份。不用餌也能釣，只是魚來得慢。釣魚時按左上角可以換餌。</p>`+BAITS.map((b,i)=>b.k!==k?"":`<div class="lf-row"><div class="t"><b>${b.n}</b>　${b.p} 幣／10 份${d.bait[i]?`｜有 ${d.bait[i]} 份`:""}<br><small>${b.d}</small></div><button class="primary" data-act="lfBait" data-v="${i}">買</button></div>`).join(""); }
  else body=`<h4 style="margin:10px 0 4px">收購魚</h4>${sellSheet("t")}`;
  openSheet("lfTackle","🎣 釣具行",`<p class="lead">老闆：「河、溪、泉水用溪釣竿，海邊用海釣竿。什麼魚吃什麼餌，學問可大了。」</p><div style="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px">${tabs.map(t=>`<button class="${tkTab===t[0]?"primary":"secondary"}" style="flex:none;width:auto;min-height:0;padding:8px 12px;font-size:14px" data-act="lfTk" data-v="${t[0]}">${t[1]}</button>`).join("")}</div>${body}<div class="row" style="margin-top:10px"><button class="secondary" data-act="lfDex">📖 魚圖鑑</button></div>`); }
HANDLERS.lfTk=v=>{ tkTab=v; tackle(); };
HANDLERS.lfRod=v=>{ const d=LF(), i=+v, r=RODS[i]; if(!r||r.hid||hasRod(i)) return; if(!me.sp){ if(bag.coins<r.p){ try{ buzz(); }catch(e){} toast(`平安幣不夠（還差 ${r.p-bag.coins}）`,2400); return; } bag.coins-=r.p; } d.rods|=1<<i; if(r.k==="f") d.eqF=i+1; else d.eqS=i+1; save(); try{ profSave(true); chaChing(); }catch(e){} toast(`買了${r.n}！走到${r.k==="f"?"河邊、溪邊或泉池":"海邊"}就會出現「🎣 釣魚」`,3200); tackle(); };
HANDLERS.lfRodEq=v=>{ const d=LF(), i=+v, r=RODS[i]; if(!r||!hasRod(i)) return; if(r.k==="f") d.eqF=i+1; else d.eqS=i+1; save(); tackle(); };
HANDLERS.lfBait=v=>{ const d=LF(), i=+v, b=BAITS[i]; if(!b) return; if(d.bait[i]>=90){ toast("這種餌帶太多了",1800); return; } if(!me.sp){ if(bag.coins<b.p){ try{ buzz(); }catch(e){} toast(`平安幣不夠（還差 ${b.p-bag.coins}）`,2400); return; } bag.coins-=b.p; } d.bait[i]+=10; if(b.k==="f"){ if(!d.bF) d.bF=i+1; } else if(!d.bS) d.bS=i+1; save(); try{ chaChing(); }catch(e){} tackle(); };
HANDLERS.lfForge=()=>{ const d=LF(); if(hasRod(11)) return; if((d.stone|0)>=1) d.stone--; else if((d.dust|0)>=8) d.dust-=8; else return; d.rods|=1<<11; d.eqS=12; save(); try{ profSave(true); [784,988,1175,1568,2093].forEach((f,k)=>tone(f,.2,.06,"triangle",k*.1)); }catch(e){} toast("✨ 老闆把流星的石頭打成了「星辰釣竿」！",3600); tkTab="rs"; tackle(); };
HANDLERS.lfSell=v=>{ const [k,id]=v.split(":"); sell(id); if(k==="t") tackle(); else grocer(); };
function grocer(){ openSheet("lfGrocer","🧺 雜貨店",`<p class="lead">阿姨：「魚啊、種的菜跟花，我都收。」</p><h4 style="margin:10px 0 4px">收購魚</h4>${sellSheet("g")}${L.cropSell?L.cropSell():""}`); }
/* ---------- the bag ---------- */
L.bagEntries=(out,tab)=>{ if(tab!=="all"&&tab!=="goods") return; const d=LF(), cnt={}; out.push({id:"lf:dex",ic:"lf_dex",name:"圖鑑",desc:`釣過的魚都記在這裡（${FISH.filter(f=>d.fish[f.id]).length}/${FISH.length}）。之後會加上蟲、花、貝殼。`}); L.cropList().forEach(c=>out.push({id:"lf:c_"+c.id,ic:"lf_c_"+c.id,n:c.k,name:c.n,desc:"在自己的花圃種出來的。可以賣給花店、雜貨店，或送給鎮上的人。"})); d.inv.forEach(([id])=>cnt[id]=(cnt[id]||0)+1); Object.keys(cnt).forEach(id=>{ const f=FBY[id]; out.push({id:"lf:"+id,ic:"lf_"+id,n:cnt[id],name:f.n,desc:`${f.w.includes("o")?"海水魚":"淡水魚"}・${RN[f.r]}。${f.d}可以到釣具行或雜貨店賣。`}); }); };
L.bagActs=(k,e)=>k.startsWith("c_")?"":`<button class="chip" data-act="lfDex">看圖鑑</button>`;
/* ---------- stations in the town ---------- */
L.station=k=>{ if(k==="tw:tackle"){ tackle(); return true; } if(k==="tw:grocer"){ grocer(); return true; } if(k==="tw:fish"){ toast(rodFor("r")?"站到水邊就能釣魚，按「🎣 釣魚」":"先到老街的釣具行買釣竿，就能在水邊釣魚",3000); return true; } return L.more?L.more(k):false; };
L.tick=dt=>{ try{ fishTick(dt); heldTick(dt); }catch(e){ console.warn("fish",e); F&&endFish(); } try{ L.tick2&&L.tick2(dt); }catch(e){ console.warn("life",e); } };

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
HANDLERS.lfGodPick=v=>{ closeSheet(); const d=LF(); if(GD) GD.ph="down"; if(v==="n"){ bag.coins+=100+500; bag.gacha=Math.min(255,(bag.gacha||0)+1); d.godOK=(d.godOK|0)+1; if(d.godOK>=3&&!(d.rods&32)){ d.rods|=32; d.eqF=6; setTimeout(()=>toast("✨ 女神：「你一直都很誠實。這支釣竿也送給你。」得到「女神的金釣竿」！",5000),2600); } save(); try{ profSave(true); chaChing(); }catch(e){}
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

/* ---------- 鎮民: ten townsfolk, each a different shape and age (scaled bodies plus a few things of their own: a cane, glasses,
   an apron, a backpack, a beard...). They wander near their spot, turn to you when you talk, and remember you: talking once a
   day +1, a gift once a day +3 (+5 if it is what they like). The closer you are, the more they tell you (tips about rare fish,
   the meteor, the goddess), and at 10 / 30 / 60 they give you something back. ---------- */
const NPCS=[
 {id:"tu",n:"阿土伯",look:[1,18,5,0,1,3,0,1,1,0,0,2,0],sh:{leg:.86,tor:.92,w:1.12,d:1.08,head:1,arm:.94},home:[61,-66.8],rad:2.6,sp:.55,hunch:.32,cane:1,likes:["koi","springkoi"],kind:"old",
  L:[["年輕人，小鎮住得慣嗎？","這座噴水池啊，比我年紀還大喔。"],["你常來找我聊天，阿伯很開心。","早上的溪谷空氣最好，去走走吧。"],["我年輕的時候，也在大河釣過一條錦鯉。","你是個好孩子。"],["有你這個朋友，阿伯每天都很期待。"]],tip:"fish"},
 {id:"lin",n:"林阿姨",look:[0,22,1,11,3,0,0,1,1,1,1,0,0],sh:{leg:.92,tor:1,w:1.34,d:1.3,head:1,arm:.96},home:[49.5,-74.6],rad:2,sp:.9,apron:1,likes:["tilapia","carp","mackerel"],kind:"aunt",
  L:[["要買什麼？雜貨店什麼都有喔！","今天的菜很新鮮呢。"],["你釣的魚阿姨都收，價錢公道啦。","吃飽了沒？"],["來，這個給你帶著路上吃。","有空多來店裡坐坐。"],["你就像我自己的孩子一樣。"]],tip:"garden"},
 {id:"pang",n:"小胖",look:[2,13,0,15,8,4,4,0,0,1,1,6,0],sh:{leg:.72,tor:.82,w:1.3,d:1.28,head:1.12,arm:.82},home:[41,-94],rad:3.5,sp:1.3,likes:["puffer","guppy"],kind:"kid",
  L:[["冰淇淋！我最愛冰淇淋了！","你會擠冰淇淋嗎？我都擠歪掉。"],["你擠的冰淇淋好高喔！","我長大要開冰淇淋店！"],["我跟你說一個秘密……中藥行阿嬤其實很愛吃甜的。","我們是好朋友對不對？"],["你是我最好的朋友！"]],tip:"games"},
 {id:"xiang",n:"阿翔",look:[1,13,1,5,5,1,4,0,1,0,0,1,5],sh:{leg:1.28,tor:1.08,w:.9,d:.9,head:.95,arm:1.14},home:[63.2,-208.6],rad:2.2,sp:1.0,likes:["masu","ayu"],kind:"hiker",
  L:[["爬上來不容易吧？這裡看得到整個小鎮。","山頂的晚上，星星多到數不完。"],["你也喜歡露營嗎？","營火烤棉花糖，要等它金黃色再拿起來。"],["我在山上看過流星掉進森林裡。","下次一起看日出吧。"],["我的帳篷隨時歡迎你。"]],tip:"meteor"},
 {id:"ling",n:"美玲",look:[0,7,6,7,7,4,0,2,1,1,1,3,1],sh:{leg:1.2,tor:1.05,w:.86,d:.86,head:.96,arm:1.08},home:[143.6,-109.6],rad:2,sp:.8,likes:["seahorse","angel","flowers"],kind:"lady",
  L:[["歡迎光臨海邊咖啡～","海風好舒服對吧？"],["你的髮型很好看呢。理髮廳最近出了新款喔。","美容院可以換眼睛、鼻子跟嘴巴。"],["我其實是為了看海才開這家店的。","下次請你喝咖啡。"],["跟你聊天是我一天最開心的時候。"]],tip:"salon"},
 {id:"wang",n:"老王",look:[2,0,0,8,4,2,1,9,2,3,0,2,0],sh:{leg:.98,tor:1.04,w:1.28,d:1.24,head:1,arm:1.02},home:[28,-135.8],rad:.8,sp:.6,likes:["sturgeon","catfish","bighead","eel"],kind:"fisher",
  L:[["噓——魚會被你嚇跑。","釣魚啊，要有耐心。"],["浮標沉下去的那一下，馬上拉！","拉力太大線會斷，放鬆一點。"],["我釣了四十年，還沒釣過皇帶魚。","你的手感越來越好了。"],["我的釣魚秘訣，只告訴你一個人。"]],tip:"fish"},
 {id:"po",n:"阿嬤",look:[0,22,2,0,7,1,0,1,1,0,1,0,9],sh:{leg:.78,tor:.86,w:1,d:1,head:.98,arm:.9},home:[6,-107.8],rad:4,sp:.5,hunch:.2,likes:["crucian","loach"],kind:"granny",
  L:[["乖孫，吃飽沒？","天氣涼了，要多穿一點。"],["阿嬤種的菜很好吃喔。","花圃的菜要記得澆水。"],["來，阿嬤給你的。","你小時候阿嬤就認識你了……咦，是嗎？"],["阿嬤最疼你了。"]],tip:"garden"},
 {id:"kai",n:"阿凱",look:[2,20,0,2,0,3,4,9,2,2,0,4,0],sh:{leg:1.14,tor:1.14,w:1.42,d:1.22,head:.94,arm:1.12,thick:1.35},home:[76,-77.2],rad:4,sp:1.1,likes:["shark","mahi","grouper"],kind:"buff",
  L:[["喔！你好！","今天也要元氣滿滿！"],["你應該多爬爬山，練腿力！","我每天都爬天后山兩趟。"],["你知道嗎，女神泉要說實話才有好東西。","兄弟！"],["有事儘管找我！"]],tip:"goddess"},
 {id:"yu",n:"小雨",look:[0,1,6,14,7,4,13,2,0,1,1,11,8],sh:{leg:.66,tor:.76,w:.88,d:.88,head:1.16,arm:.8},home:[9,-121.5],rad:4,sp:1.2,likes:["medaka","seahorse","flowers"],kind:"girl",
  L:[["你看你看，蝴蝶！","我在等我的氣球飛回來。"],["我們來玩捉迷藏好不好？","晚上公園有螢火蟲喔。"],["這是我最寶貝的東西，借你看一下下。","你是我的好朋友！"],["我長大要跟你一樣厲害！"]],tip:"games"},
 {id:"doc",n:"博士",look:[0,18,5,13,2,4,0,0,3,0,0,1,0],sh:{leg:1.2,tor:1.08,w:.86,d:.86,head:1.02,arm:1.08},home:[45,-157],rad:3,sp:.7,coat:1,likes:["goldscale","dragonbream","oarfish","sunfish"],kind:"prof",
  L:[["嗯？你對自然有興趣嗎？","這片森林的泉水，是從天后山流下來的。"],["圖鑑做得怎麼樣了？","淡水魚跟海水魚，可是完全不一樣的喔。"],["流星掉下來的石頭，叫做隕石，很珍貴的。","你的觀察力很好。"],["你是我最得意的研究夥伴。"]],tip:"meteor"},
];
const NB={}; NPCS.forEach(n=>NB[n.id]=n);
const NR=id=>{ const d=LF(); d.npc=d.npc||{}; return d.npc[id]||(d.npc[id]={a:0,d:0,g:0,r:0}); };
const tier=a=>a>=60?3:a>=30?2:a>=10?1:0, hearts=a=>{ const h=Math.min(10,Math.floor(a/6)); return "❤️".repeat(Math.ceil(h/2))+"🤍".repeat(5-Math.ceil(h/2)); };
function tipFor(n){ const r=FISH.filter(f=>f.r>=2); const f=r[(Math.random()*r.length)|0]; const when=f.t?f.t.split("").map(c=>SLOTN[+c]).join("、"):"任何時候";
  const fishTip=`聽說${f.w.split("").map(c=>WN[c]).join("或")}在${when}${f.need==="rain"?"、而且下雨的時候":f.need==="star"?"、有流星的晚上":""}，會出現${f.n}。`;
  if(n.tip==="fish") return fishTip; if(n.tip==="meteor") return L.meteorHint?L.meteorHint():"晚上偶爾會有流星，第一個找到的人會有好運。";
  if(n.tip==="goddess") return "森林最裡面有一座女神泉，丟一枚平安幣下去，女神問你的時候要說實話喔。";
  if(n.tip==="garden") return "河濱公園的「我的花圃」可以種東西，種子在花店買，記得澆水才長得快。";
  if(n.tip==="salon") return "西側巷弄的理髮廳有新的精緻髮型，美容院可以換眼睛、鼻子、嘴巴。";
  if(n.tip==="games") return "小吃廣場有擠冰淇淋跟中藥對對碰，玩得好會有平安幣喔。"; return fishTip; }
const GIFTS={10:[300,0,""],30:[0,1,"q"],60:[1000,2,"q"]}, GF={10:1,30:2,60:4}; /* (which return gifts were given: one bit each) */
function npcSheet(n,line){ const R=NR(n.id), t=tier(R.a); openSheet("lfNpc","💬 "+n.n,`<p class="note" style="margin:0 0 6px">${hearts(R.a)}　好感 ${R.a}</p><p class="lead">「${line}」</p>
   <div class="row"><button class="primary" data-act="lfNpcTalk" data-v="${n.id}">聊聊天</button><button class="secondary" data-act="lfNpcGift" data-v="${n.id}">送禮物</button>${t>=2?`<button class="secondary" data-act="lfNpcTip" data-v="${n.id}">打聽消息</button>`:""}</div>
   <p class="note">每天聊天、送禮物，好感會增加。${t<2?"再熟一點，會跟你說一些小道消息。":""}</p>`); }
function talk(n){ const R=NR(n.id), day=today(); let gain=0; if(R.d!==day){ R.d=day; R.a=Math.min(100,R.a+1); gain=1; } const t=tier(R.a), pool=n.L[t].concat(t?n.L[t-1]:[]); let line=pool[(Math.random()*pool.length)|0];
  for(const k of [10,30,60]) if(R.a>=k&&!(R.r&GF[k])){ R.r|=GF[k]; const G=GIFTS[k]; bag.coins+=G[0]; if(G[1]) bag.gacha=Math.min(255,(bag.gacha||0)+G[1]); let fu=""; if(G[2]&&typeof ROOMX!=="undefined"&&ROOMX) try{ fu=ROOMX.grant(G[2]); }catch(e){}
    line+=`……對了，這個送你。`; setTimeout(()=>toast(`🎁 ${n.n}送你：${[G[0]?G[0]+" 平安幣":"",G[1]?G[1]+" 枚扭蛋幣":"",fu?"「"+fu+"」":""].filter(Boolean).join("、")}`,3600),600); try{ profSave(true); }catch(e){} }
  save(); if(gain) try{ tone(880,.08,.04,"triangle"); }catch(e){} npcSheet(n,line); }
HANDLERS.lfNpcTalk=v=>talk(NB[v]);
HANDLERS.lfNpcTip=v=>{ const n=NB[v]; npcSheet(n,tipFor(n)); };
HANDLERS.lfNpcGift=v=>{ const n=NB[v], R=NR(v), d=LF(); if(R.g===today()){ npcSheet(n,"今天已經收過你的禮物了，謝謝你！"); return; } const cnt={}; d.inv.forEach(([id])=>cnt[id]=(cnt[id]||0)+1); const crops=L.cropList?L.cropList():[];
  if(!Object.keys(cnt).length&&!crops.length){ npcSheet(n,"心意到了就好～（你身上還沒有可以送的東西：去釣魚或種東西吧）"); return; }
  openSheet("lfNpcG","🎁 送給"+n.n,`<p class="lead">要送什麼呢？</p>${Object.keys(cnt).map(id=>`<div class="lf-row"><img src="${fishIcon(id)}" alt=""><div class="t"><b>${FBY[id].n}</b> ×${cnt[id]}</div><button class="primary" data-act="lfNpcGive" data-v="${v}:f:${id}">送</button></div>`).join("")}${crops.map(c=>`<div class="lf-row"><span style="font-size:30px;width:64px;text-align:center">${c.ic}</span><div class="t"><b>${c.n}</b> ×${c.k}</div><button class="primary" data-act="lfNpcGive" data-v="${v}:c:${c.id}">送</button></div>`).join("")}`); };
HANDLERS.lfNpcGive=v=>{ const [nid,k,id]=v.split(":"), n=NB[nid], R=NR(nid), d=LF(); let ok=false, liked=false;
  if(k==="f"){ const i=d.inv.findIndex(e=>e[0]===id); if(i>=0){ d.inv.splice(i,1); ok=true; liked=n.likes.includes(id)||n.likes.includes("fish"); } } else if(L.cropTake&&L.cropTake(id)){ ok=true; liked=n.likes.includes("flowers")||n.likes.includes(id); }
  if(!ok) return; R.g=today(); R.a=Math.min(100,R.a+(liked?5:3)); save(); try{ [659,784,988].forEach((f,q)=>tone(f,.1,.05,"triangle",q*.07)); }catch(e){}
  npcSheet(n,liked?"哇！這是我最喜歡的！太謝謝你了！":"謝謝你，我收下了！"); };
/* bodies */
const NL={}; let talkChip=null, talkN=null;
/* 鎮民的身材 (11/14, the chair: "don't stretch the whole person — make people with different proportions"): no scaling of the whole
   body any more. Legs get longer or shorter (the body is lifted to match), the torso wider, deeper or taller, arms longer, the head a
   size of its own — and small things (shoes, hands, buttons) keep their shape and just move with the part they sit on. */
function bodyShape(av,P){ if(!P) return; const L=P.leg||1, Tt=P.tor||1, W=P.w||1, D=P.d||W, Hd=P.head||1, A=P.arm||1, TH=P.thick||(1+(W-1)*.6), bb=new T.Box3(), sz=new T.Vector3();
  const big=o=>{ bb.setFromObject(o); bb.getSize(sz); return sz.y>.14; };
  if(!av.lift){ av.lift=new T.Group(); av.root.add(av.lift); av.root.remove(av.parts); av.lift.add(av.parts); } av.lift.position.y=.3*(L-1);
  av.legs.forEach(lg=>{ lg.position.x*=W>1?1+(W-1)*.7:W; lg.children.slice().forEach(c=>{ if(big(c)){ c.scale.y*=L; c.scale.x*=TH; c.scale.z*=TH; c.position.y*=L; } else c.position.y*=L; }); });
  const skip=new Set([av.head,...av.arms,av.amulet].filter(Boolean));
  av.torso.children.slice().forEach(c=>{ if(skip.has(c)) return; c.scale.x*=W; c.scale.z*=D; c.scale.y*=Tt; c.position.x*=W; c.position.z*=D; c.position.y*=Tt; });
  av.arms.forEach((a,i)=>{ a.position.x*=W; a.position.y*=Tt; a.children.slice().forEach(c=>{ if(av.hands.includes(c)||!big(c)){ c.position.y*=A; c.position.x*=TH; } else { c.scale.y*=A; c.scale.x*=TH; c.scale.z*=TH; c.position.y*=A; } }); });
  if(av.amulet){ av.amulet.position.y*=Tt; av.amulet.position.z*=D; }
  av.head.position.y*=Tt; av.head.scale.setScalar(Hd); }
function npcMake(n){ const look=sanitizeLook(n.look.slice()); const av=new Avatar(look,{npc:true,x:n.home[0],z:n.home[1]}); av.isMe=true; try{ av.setLook(look); }finally{ av.isMe=false; } av.setName(n.n); av.moveSpeed=n.sp;
  const M=c=>new T.MeshStandardMaterial({color:c,roughness:.7});
  if(n.cane){ const c=new T.Mesh(new T.CylinderGeometry(.018,.018,.75,6),M("#6b4a2e")); c.position.set(0,-.55,.06); av.arms[1].add(c); }
  if(n.apron){ const a=new T.Mesh(new T.CylinderGeometry(.215,.25,.46,20,1,true,-1.05,2.1),new T.MeshStandardMaterial({color:"#f2e6c8",roughness:.8,side:T.DoubleSide})); a.position.set(0,.16,0); av.torso.add(a); } /* (an apron that wraps round the front, not a board) */
  if(n.pack){ const b=new T.Mesh(new T.BoxGeometry(.32,.4,.18),M("#d9624a")); b.position.set(0,.3,-.22); av.torso.add(b); const r=new T.Mesh(new T.CylinderGeometry(.07,.07,.34,10),M("#3f6a52")); r.rotation.z=Math.PI/2; r.position.set(0,.55,-.24); av.torso.add(r); }
  if(n.coat){ const c=new T.Mesh(new T.CylinderGeometry(.24,.3,.62,12,1,true),new T.MeshStandardMaterial({color:"#fbfaf6",roughness:.7,side:T.DoubleSide})); c.position.y=.2; av.torso.add(c); }
  bodyShape(av,n.sh); /* (after the apron, backpack and coat, so they fit the body) */
  return av; }
function npcTick(dt){ const p=meAv.pos, inTown=TOWNX&&TOWNX.on; let best=null, bd=2.4;
  for(const n of NPCS){ const d=Math.hypot(p.x-n.home[0],p.y-n.home[1]); let o=NL[n.id];
    if(!o&&inTown&&d<55){ try{ o=NL[n.id]={av:npcMake(n),t:2+Math.random()*4}; }catch(e){ console.warn("npc",e); continue; } }
    if(o&&(!inTown||d>75)){ try{ scene.remove(o.av.root); o.av.dispose&&o.av.dispose(); }catch(e){} delete NL[n.id]; continue; } if(!o) continue;
    const av=o.av; o.t-=dt; const talking=sheetKind&&sheetKind.indexOf("lfNpc")===0&&talkN===n;
    if(talking){ av.target.copy(av.pos); av.path=[]; av.faceGoal=Math.atan2(p.x-av.pos.x,p.y-av.pos.y); }
    else if(o.t<=0){ o.t=6+Math.random()*9; av.faceGoal=null; for(let k=0;k<6;k++){ const a=Math.random()*6.283, rr=Math.random()*n.rad, x=n.home[0]+Math.sin(a)*rr, z=n.home[1]+Math.cos(a)*rr; if(TOWNX.walk(x,z)){ av.moveTo(x,z); break; } } }
    av.update(dt); if(n.hunch) av.torso.rotation.x+=n.hunch; const dd=Math.hypot(p.x-av.pos.x,p.y-av.pos.y); if(dd<bd){ bd=dd; best=n; } }
  if(!talkChip){ talkChip=document.createElement("button"); talkChip.id="lfTalk"; talkChip.style.cssText="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 178px);z-index:9;border:0;border-radius:999px;padding:10px 18px;font:900 15px "+UI_FONT+";color:#3a2a10;background:linear-gradient(#ffe7a8,#f2c25a);box-shadow:0 4px 14px rgba(0,0,0,.35)"; talkChip.hidden=true; talkChip.onclick=()=>{ if(talkN) talk(talkN); }; document.body.appendChild(talkChip); }
  const show=best&&!busy()&&!F; if(show&&talkN!==best){ talkChip.textContent=`💬 跟${best.n}說話`; } talkN=best||talkN; if(!best) talkN=sheetKind&&sheetKind.indexOf("lfNpc")===0?talkN:null; talkChip.hidden=!show; }
L.npcs=()=>NL; L.npcLine=(x0,z,old)=>NPCS.map((n,i)=>{ const keep=n.sh; if(old) n.sh=null; const av=npcMake(n); n.sh=keep; if(old&&old[n.id]) av.root.scale.set(...old[n.id]); av.pos.set(x0+i*1.3,z); av.target.copy(av.pos); av.root.position.set(x0+i*1.3,0,z); av.rotY=0; av.root.rotation.y=0; return av; }); /* (test: the ten in a row) */

/* ---------- 理髮廳 and 美容院: pay once for a style, then wear it whenever you like (it also shows in 換裝 once bought) ---------- */
const HP=[1800,2000,1600,2200,1800,2400,2000,2600,2200,3000], EP=[900,800,1000,1200,900,1100,800,1000,900,800], MP=[800,900,700,800,1000,800,700,800,900,1200], NP=[600,700,700,800,900,1000,800,600,600,900];
const OWN=()=>{ const d=LF(); d.own=d.own||{h:0,e:0,m:0,n:0}; return d.own; };
let PV=null; /* a style being tried on: [look before] */
function tryOn(i,n){ if(!PV) PV=me.look.slice(); const l=PV.slice(); l[i]=n; try{ meAv.setLook(sanitizeLook(l,!!me.sp)); }catch(e){} }
function endTry(){ if(!PV) return; try{ meAv.setLook(me.look); }catch(e){} PV=null; }
function wearNow(i,n){ const l=me.look.slice(); l[i]=n; me.look=sanitizeLook(l,!!me.sp); PV=null; try{ localStorage.setItem("mz.me",JSON.stringify(me)); }catch(e){} try{ draftLook=me.look.slice(); }catch(e){} meAv.setLook(me.look); markDirty(); try{ profSave(true); }catch(e){} try{ [659,880,1175].forEach((f,k)=>tone(f,.12,.05,"triangle",k*.07)); }catch(e){} }
const owned2=(k,n)=>me.sp||!!((OWN()[k]|0)&(1<<n));
function barber(){ const rows=(lo,hi,lab)=>`<h4 style="margin:10px 0 4px">${lab}</h4>`+[...Array(hi-lo)].map((_,j)=>{ const n=lo+j, k=n-25, own=owned2("h",k), on=me.look[1]===n; return `<div class="lf-row"><div class="t"><b>${HAIRS[n].replace("✂️ ","")}</b>　${own?"<small>已擁有</small>":HP[k]+" 幣"}</div><button class="secondary" data-act="lfTry" data-v="1:${n}">試試看</button>${own?`<button class="primary" data-act="lfWear" data-v="1:${n}" ${on?"disabled":""}>${on?"現在的髮型":"換上"}</button>`:`<button class="primary" data-act="lfBuy" data-v="1:${n}">剪這個</button>`}</div>`; }).join("");
  openSheet("lfBarber","✂️ 理髮廳",`<p class="lead">設計師：「要不要換個新造型？這幾款比較精緻，買過以後在換裝裡也能隨時換回來。」</p>${rows(25,30,"男生款")}${rows(30,35,"女生款")}<p class="note">髮色在「換裝」裡可以另外換。</p>`); }
function beauty(){ const sec=(i,lo,cnt,P,k,lab,names)=>`<h4 style="margin:10px 0 4px">${lab}</h4>`+[...Array(cnt)].map((_,j)=>{ const n=lo+j, own=owned2(k,j), on=me.look[i]===n; return `<div class="lf-row"><div class="t"><b>${names[n].replace("💄 ","")}</b>　${own?"<small>已擁有</small>":P[j]+" 幣"}</div><button class="secondary" data-act="lfTry" data-v="${i}:${n}">試試看</button>${own?`<button class="primary" data-act="lfWear" data-v="${i}:${n}" ${on?"disabled":""}>${on?"現在的":"換上"}</button>`:`<button class="primary" data-act="lfBuy" data-v="${i}:${n}">買</button>`}</div>`; }).join("");
  openSheet("lfBeauty","💄 美容院",`<p class="lead">「眼睛、鼻子、嘴巴，各有十款可以挑喔。」</p>${sec(7,15,10,EP,"e","眼睛",EYES)}${sec(13,1,10,NP,"n","鼻子",NOSES)}${sec(9,4,10,MP,"m","嘴巴",MOUTHS)}<p class="note">買過的在「換裝」的臉部也能換。想拿掉鼻子：換裝裡選「無」。</p>`); }
const slotOf=(i,n)=>i===1?["h",n-25,HP]:i===7?["e",n-15,EP]:i===13?["n",n-1,NP]:["m",n-4,MP];
HANDLERS.lfTry=v=>{ const [i,n]=v.split(":").map(Number); tryOn(i,n); toast("試試看：關掉面板就會換回原本的樣子",2000); };
HANDLERS.lfWear=v=>{ const [i,n]=v.split(":").map(Number); wearNow(i,n); i===1?barber():beauty(); };
HANDLERS.lfBuy=v=>{ const [i,n]=v.split(":").map(Number), [k,j,P]=slotOf(i,n), o=OWN(); if(owned2(k,j)) return; if(bag.coins<P[j]&&!me.sp){ try{ buzz(); }catch(e){} toast(`平安幣不夠（還差 ${P[j]-bag.coins}）`,2400); return; } if(!me.sp) bag.coins-=P[j]; o[k]=(o[k]|0)|(1<<j); save(); try{ chaChing(); statInc("lfBuy"+k); }catch(e){} wearNow(i,n); toast("換好了！好看喔",2200); i===1?barber():beauty(); };
L.tick3=dt=>{ if(PV&&!(sheetKind==="lfBarber"||sheetKind==="lfBeauty")) endTry(); if(L.tick4) L.tick4(dt); };
L.more2=k=>{ if(k==="tw:barber"){ barber(); return true; } if(k==="tw:beauty"){ beauty(); return true; } return L.more3?L.more3(k):false; };

/* ---------- 小吃廣場的兩個攤位: 擠冰淇淋 (stack the swirls straight) and 中藥對對碰 (find the pairs) ---------- */
const MG=()=>{ const d=LF(); if(!d.mg||d.mg.d!==today()) d.mg={d:today(),n:0}; return d.mg; };
const PLAY=30;
function mgOverlay(title){ const ov=document.createElement("div"); ov.className="lf-ov"; ov.style.background="rgba(20,14,10,.72)"; ov.innerHTML=`<div style="position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 14px);text-align:center;color:#ffe2a0;font-weight:900;font-size:20px">${title}</div><button class="lf-x" id="mgX">離開</button><div id="mgB" style="position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 54px);bottom:0;display:flex;flex-direction:column;align-items:center"></div>`; document.body.appendChild(ov); return ov; }
function pay(){ if(me.sp) return true; if(bag.coins<PLAY){ try{ buzz(); }catch(e){} toast("平安幣不夠",2000); return false; } bag.coins-=PLAY; save(); return true; }
function reward(score,max,line){ const m=MG(); m.n++; const paid=m.n<=10; const coins=paid?Math.round(PLAY*3*score/max):0; if(coins) bag.coins+=coins; if(paid&&score>=max*.6) energy(3); save(); try{ profSave(true); if(coins) chaChing(); }catch(e){}
  return `${line}<br>${paid?`拿到 ${coins} 平安幣${score>=max*.6?"，精力 +3":""}。`:"今天的獎勵已經拿完了（每天前 10 次有獎勵），玩開心的～"}`; }
let IC=null;
function iceStart(){ if(!pay()) return; const ov=mgOverlay("🍦 擠冰淇淋"), B=ov.querySelector("#mgB"); B.innerHTML=`<p style="color:#fff;margin:4px 12px 8px;text-align:center;font-size:14px">出口會左右移動，按下去擠一圈。對準就疊得高，歪太多會倒！疊 7 層就完美。</p><canvas id="icC" width="320" height="420" style="width:320px;height:420px;border-radius:16px;background:linear-gradient(#ffe8f0,#fff6e0)"></canvas><button class="lf-btn" style="position:static;transform:none;margin-top:12px" id="icB">擠！</button>`;
  const cv=B.querySelector("#icC"), x=cv.getContext("2d"); IC={ov,x,t:0,stack:[{x:160,w:84}],drop:null,over:false,done:false};
  const tap=e=>{ e.preventDefault(); if(!IC||IC.drop||IC.over) return; IC.drop={x:IC.nx,y:70,w:IC.stack[IC.stack.length-1].w*.94}; try{ tone(520+IC.stack.length*60,.08,.05,"triangle"); }catch(err){} };
  B.querySelector("#icB").addEventListener("pointerdown",tap); cv.addEventListener("pointerdown",tap); ov.querySelector("#mgX").onclick=()=>{ IC=null; ov.remove(); }; }
function iceTick(dt){ if(!IC) return; const I=IC, x=I.x; I.t+=dt; const n=I.stack.length, sp=1.2+n*.32; I.nx=160+Math.sin(I.t*sp)*110;
  x.clearRect(0,0,320,420); x.fillStyle="#d9a066"; x.beginPath(); x.moveTo(118,330); x.lineTo(202,330); x.lineTo(160,412); x.closePath(); x.fill(); x.strokeStyle="#b07a40"; x.lineWidth=2; for(let k=0;k<5;k++){ x.beginPath(); x.moveTo(124+k*16,330); x.lineTo(150+k*6,400); x.stroke(); }
  const top=k=>330-k*30; I.stack.forEach((s,k)=>{ if(!k) return; const y=top(k); x.fillStyle=k%2?"#fff8ee":"#fde6ee"; x.beginPath(); x.ellipse(s.x,y+8,s.w/2,16,0,0,6.283); x.fill(); x.strokeStyle="rgba(200,160,140,.5)"; x.lineWidth=2; x.beginPath(); x.ellipse(s.x,y+4,s.w/2-6,9,0,Math.PI*.1,Math.PI*.9); x.stroke(); });
  x.fillStyle="#c8c8d0"; x.fillRect(I.nx-16,0,32,46); x.fillStyle="#a0a0ac"; x.beginPath(); x.moveTo(I.nx-12,46); x.lineTo(I.nx+12,46); x.lineTo(I.nx,62); x.closePath(); x.fill();
  if(I.drop){ const d=I.drop; d.y+=dt*520; const ty=top(n); x.fillStyle="#fff8ee"; x.beginPath(); x.ellipse(d.x,Math.min(d.y,ty)+8,d.w/2,16,0,0,6.283); x.fill();
    if(d.y>=ty){ const below=I.stack[n-1], off=d.x-below.x; I.drop=null; if(Math.abs(off)>below.w*.45){ I.over=true; try{ tone(200,.3,.06,"sawtooth"); }catch(e){} iceEnd(n-1,"歪掉了，倒下來了……"); return; } I.stack.push({x:below.x+off*.6,w:d.w}); if(I.stack.length>7){ I.over=true; try{ [784,988,1175,1568].forEach((f,k)=>tone(f,.14,.06,"triangle",k*.08)); }catch(e){} iceEnd(7,"完美！七層的冰淇淋塔！"); } } }
  if(I.over&&I.stack.length>7){ const s=I.stack[7]; x.fillStyle="#e8402e"; x.beginPath(); x.arc(s.x,top(7)-14,9,0,6.283); x.fill(); } }
function iceEnd(layers,line){ const I=IC; setTimeout(()=>{ if(I.ov.parentNode) I.ov.remove(); if(IC===I) IC=null; openSheet("lfIce","🍦 擠冰淇淋",`<p class="lead">${reward(layers,7,`疊了 ${layers} 層。${line}`)}</p><div class="row"><button class="primary" data-act="lfIce">再玩一次（${PLAY} 幣）</button></div>`); },900); }
HANDLERS.lfIce=()=>{ closeSheet(); iceStart(); };
const HERBS=[["當歸","#a0704a"],["枸杞","#e8402e"],["紅棗","#b3261e"],["人參","#e8c87a"],["黃耆","#f2c230"],["甘草","#c9a46a"],["川芎","#8a6a4a"],["菊花","#f6d84a"]];
let HM=null;
function herbStart(){ if(!pay()) return; const ov=mgOverlay("🌿 中藥對對碰"), B=ov.querySelector("#mgB"); const cards=[...HERBS.keys(),...HERBS.keys()].sort(()=>Math.random()-.5);
  B.innerHTML=`<p style="color:#fff;margin:4px 12px 8px;text-align:center;font-size:14px">翻兩張，一樣的藥材就配對成功。60 秒內全部找到！</p><div id="hmT" style="color:#ffe2a0;font-weight:900;margin-bottom:8px">60</div><div id="hmG" style="display:grid;grid-template-columns:repeat(4,72px);gap:8px">${cards.map((c,i)=>`<button data-i="${i}" style="height:86px;border-radius:12px;border:2px solid #d9aa3d;background:linear-gradient(#7a4a3a,#5a3226);color:#fff;font:900 16px ${UI_FONT}">中藥</button>`).join("")}</div>`;
  HM={ov,cards,open:[],got:0,miss:0,t:60}; B.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>flip(+b.dataset.i,b)); ov.querySelector("#mgX").onclick=()=>{ HM=null; ov.remove(); }; }
function face(b,c,up){ const H=HERBS[c]; b.innerHTML=up?`<span style="display:block;width:30px;height:30px;margin:0 auto 4px;border-radius:50%;background:${H[1]};box-shadow:inset -4px -4px 0 rgba(0,0,0,.2)"></span>${H[0]}`:"中藥"; b.style.background=up?"#fff6e0":"linear-gradient(#7a4a3a,#5a3226)"; b.style.color=up?"#3a2a1a":"#fff"; }
function flip(i,b){ if(!HM||HM.open.length>=2||b.dataset.done||HM.open.some(o=>o[0]===i)) return; face(b,HM.cards[i],true); try{ tone(700,.04,.04,"triangle"); }catch(e){} HM.open.push([i,b]);
  if(HM.open.length===2){ const [[i1,b1],[i2,b2]]=HM.open; if(HM.cards[i1]===HM.cards[i2]){ b1.dataset.done=b2.dataset.done=1; b1.style.opacity=b2.style.opacity=.7; HM.open=[]; HM.got++; try{ [880,1175].forEach((f,k)=>tone(f,.08,.05,"triangle",k*.06)); }catch(e){} if(HM.got===8) herbEnd(true); }
    else { HM.miss++; setTimeout(()=>{ if(!HM) return; face(b1,0,false); face(b2,0,false); HM.open=[]; },650); } } }
function herbTick(dt){ if(!HM) return; HM.t-=dt; const el=HM.ov.querySelector("#hmT"); if(el) el.textContent=Math.max(0,Math.ceil(HM.t))+" 秒"; if(HM.t<=0) herbEnd(false); }
function herbEnd(all){ const H=HM; HM=null; const score=all?Math.max(4,8-Math.max(0,H.miss-4)*.5):H.got; setTimeout(()=>{ H.ov.remove(); openSheet("lfHerb","🌿 中藥對對碰",`<p class="lead">${reward(score,8,all?`全部配對成功！錯了 ${H.miss} 次。`:`時間到，配對了 ${H.got} 組。`)}</p><div class="row"><button class="primary" data-act="lfHerb">再玩一次（${PLAY} 幣）</button></div>`); },500); }
HANDLERS.lfHerb=()=>{ closeSheet(); herbStart(); };
L.more3=k=>{ if(k==="tw:ice"){ openSheet("lfIce","🍦 擠冰淇淋",`<p class="lead">「來試試看能疊幾層！」</p><div class="row"><button class="primary" data-act="lfIce">玩一次（${PLAY} 幣）</button></div><p class="note">每天前 10 次（兩個攤位合計）有平安幣獎勵。</p>`); return true; }
  if(k==="tw:herb"){ openSheet("lfHerb","🌿 中藥對對碰",`<p class="lead">中藥行阿嬤：「認得這些藥材嗎？來玩玩看。」</p><div class="row"><button class="primary" data-act="lfHerb">玩一次（${PLAY} 幣）</button></div><p class="note">每天前 10 次（兩個攤位合計）有平安幣獎勵。</p>`); return true; }
  return L.more4?L.more4(k):false; };
L.tick4=dt=>{ iceTick(dt); herbTick(dt); if(L.tick5) L.tick5(dt); };

/* ---------- 流星: on about one game night in three, a meteor falls somewhere in or around the town — the same night, the same
   moment and the same place for everyone (worked out from the game day). A beam of light shows where it came down; whoever gets
   there first (the server keeps track) gets a special prize, everyone after still gets a little stardust. ---------- */
const MSPOT=[[61.5,-150,"南岸森林"],[66,-206.6,"天后山頂"],[148,-100,"望海沙灘"],[12,-125,"河濱公園"],[62,-68.5,"噴水池廣場"],[114,-80,"溪谷草地"],[44,-170,"森林深處"],[150,-74,"燈塔附近"],[8,-87,"西側巷弄"],[50,-129,"河堤邊"]];
const hsh=n=>{ n=(n^61)^(n>>>16); n=Math.imul(n,9); n^=n>>>4; n=Math.imul(n,0x27d4eb2d); n^=n>>>15; return n>>>0; };
function meteorOf(D){ const h=hsh(D*7919+13); if(h%3&&!(L.forceD===D)) return null; const p=.58+((h>>>3)%100)/100*.2, at=(D+p)*TOD_LEN*1000; const sp=MSPOT[(h>>>11)%MSPOT.length]; return {id:D,at,end:(D+.86)*TOD_LEN*1000,x:sp[0],z:sp[1],nm:sp[2]}; }
const curD=()=>Math.floor(Date.now()/1000/TOD_LEN);
let MET=null; /* the live one: {m, ph, t, streak, beam, rock, got} */
L.meteorHint=()=>{ for(let k=0;k<4;k++){ const m=meteorOf(curD()+k); if(m&&m.end>Date.now()){ const mins=Math.max(0,Math.round((m.at-Date.now())/60000)); return mins<=0?`流星已經掉下來了，在${m.nm}那邊，快去找！`:`我觀察星象……大概 ${mins} 分鐘後的晚上會有流星，可能掉在${m.nm}一帶。`; } } return "這幾個晚上大概不會有流星。"; };
function metMake(m){ const g=new T.Group(); scene.add(g); const y=(TOWNX&&TOWNX.ground?TOWNX.ground(m.x,m.z):0)||0;
  const rock=new T.Mesh(new T.IcosahedronGeometry(.28,1),new T.MeshStandardMaterial({color:"#8a7ad0",emissive:"#b8a8ff",emissiveIntensity:1.4,roughness:.3,metalness:.4})); rock.position.set(m.x,y+.3,m.z); g.add(rock);
  const beam=new T.Mesh(new T.CylinderGeometry(.35,.9,60,16,1,true),new T.MeshBasicMaterial({color:"#c8b8ff",transparent:true,opacity:.28,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false})); beam.position.set(m.x,y+30,m.z); g.add(beam);
  const glow=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:new T.Color("#c8b8ff"),transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false})); glow.scale.set(3,3,1); glow.position.set(m.x,y+.5,m.z); g.add(glow);
  const streak=new T.Mesh(new T.CylinderGeometry(.05,.5,14,8,1,true),new T.MeshBasicMaterial({color:"#fff6d8",transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false})); g.add(streak);
  return {g,rock,beam,glow,streak,y}; }
function metFree(){ if(!MET) return; scene.remove(MET.o.g); MET.o.g.traverse(q=>{ if(q.geometry) q.geometry.dispose(); if(q.material) q.material.dispose(); }); MET=null; }
let metChip=null, metT=0;
function meteorTick(dt){ metT-=dt; if(metT<=0){ metT=1; const now=Date.now(); let m=meteorOf(curD()); if(L.testMet) m=L.testMet; L.starNight=!!(m&&now>=m.at&&now<m.end);
    if(m&&now>=m.at-4000&&now<m.end){ if(!MET||MET.m.id!==m.id){ metFree(); MET={m,o:metMake(m),t:(now-m.at)/1000,got:!!(LF().met&&LF().met[m.id])}; if(now<m.at+60000){ setTimeout(()=>{ try{ toast(`🌠 流星掉到「${m.nm}」了！第一個找到的人有特別的獎勵！`,4200); [1568,1319,1047,784].forEach((f,k)=>tone(f,.25,.04,"sine",k*.12)); }catch(e){} },Math.max(0,m.at-now+2600)); } } }
    else if(MET) metFree(); }
  if(!MET) return; const M=MET, o=M.o; M.t+=dt; const k=Math.min(1,Math.max(0,(M.t+4)/3)); /* the fall: from high in the sky down to its spot over 3 s */
  const sx=M.m.x-60, sy=70, sz=M.m.z+40; if(k<1){ const x=sx+(M.m.x-sx)*k, y=sy+(o.y-sy)*k, z=sz+(M.m.z-sz)*k; o.streak.visible=true; o.streak.position.set(x,y,z); o.streak.lookAt(M.m.x,o.y,M.m.z); o.streak.rotateX(Math.PI/2); o.rock.visible=false; o.beam.visible=false; o.glow.visible=false; return; }
  o.streak.visible=false; o.rock.visible=!M.got; o.glow.visible=!M.got; o.beam.visible=!M.got; o.rock.rotation.y+=dt; o.rock.position.y=o.y+.3+Math.sin(M.t*2)*.05; o.beam.material.opacity=.18+.1*Math.sin(M.t*3); o.glow.material.opacity=.7+.3*Math.sin(M.t*4);
  if(!metChip){ metChip=document.createElement("button"); metChip.style.cssText="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 226px);z-index:9;border:0;border-radius:999px;padding:11px 20px;font:900 16px "+UI_FONT+";color:#fff;background:linear-gradient(#a890ff,#6a50d8);box-shadow:0 4px 14px rgba(0,0,0,.35)"; metChip.textContent="🌠 撿起流星碎片"; metChip.hidden=true; metChip.onclick=claimMet; document.body.appendChild(metChip); }
  metChip.hidden=M.got||busy()||Math.hypot(meAv.pos.x-M.m.x,meAv.pos.y-M.m.z)>2.4; }
async function claimMet(){ if(!MET||MET.got||MET.busy) return; const M=MET; M.busy=1; let j={ok:false}; try{ const r=await fetch("/meteor",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:M.m.id,uid:load("mz.id",""),name:(me.name||"香客").slice(0,10)})}); j=await r.json(); }catch(e){} M.busy=0;
  const d=LF(); d.met=d.met||{}; d.met[M.m.id]=1; M.got=true; if(metChip) metChip.hidden=true; let msg2;
  if(j.ok&&j.first){ bag.gacha=Math.min(255,(bag.gacha||0)+3); bag.coins+=1000; d.stone=(d.stone|0)+1; msg2=`🌠 你是第一個找到流星的人！<br>得到「流星石」、3 枚扭蛋幣和 1000 平安幣。`; try{ [784,988,1175,1568,2093].forEach((f,k)=>tone(f,.2,.06,"triangle",k*.1)); statInc("metFirst"); }catch(e){} }
  else { bag.coins+=200; d.dust=(d.dust|0)+1; msg2=`✨ 撿到一些星砂和 200 平安幣。${j.by?`<br>第一個找到的是「${String(j.by).replace(/[<>&"]/g,"")}」。`:""}`; try{ [988,1319].forEach((f,k)=>tone(f,.15,.05,"triangle",k*.1)); }catch(e){} }
  save(); try{ profSave(true); }catch(e){} openSheet("lfMet","🌠 流星",`<p class="lead">${msg2}</p><p class="note">流星夜裡，女神泉和大海會出現平常看不到的魚。</p>`); }
L.meteorTest=(x,z)=>{ const D=curD(); L.testMet={id:"t"+Date.now(),at:Date.now()+500,end:Date.now()+600000,x:x??meAv.pos.x+4,z:z??meAv.pos.y,nm:"附近"}; metT=0; };
L.tick5=dt=>{ try{ meteorTick(dt); }catch(e){ console.warn("meteor",e); } if(L.tick6) L.tick6(dt); };

/* ---------- 我的花圃: your own garden (its own little scene, like your room — nobody else's plants are in it). Twelve beds; seeds
   from the 花店. A plant grows in three steps (sprout, young plant, flowers or fruit) on real time, but only while it has been
   watered: water it, and again after each step. Forgetting does not kill it, it just waits. Sell the harvest at the 花店 or the
   雜貨店, or give it to someone. ---------- */
const SEEDS=[["sun","向日葵",60,20,150,"🌻","#f2c230"],["tulip","鬱金香",80,30,200,"🌷","#e8607a"],["tomato","番茄",70,25,180,"🍅","#e8402e"],["straw","草莓",100,40,260,"🍓","#d8303e"],["cabbage","高麗菜",120,60,330,"🥬","#8fd06a"],["rose","玫瑰",150,90,450,"🌹","#c8203e"],["pumpkin","南瓜",200,120,600,"🎃","#f08a2a"]];
const SB={}; SEEDS.forEach(q=>SB[q[0]]=q);
const GD2=()=>{ const d=LF(); d.gd=d.gd||{beds:Array(12).fill(null),seed:{},crop:{}}; if(!Array.isArray(d.gd.beds)||d.gd.beds.length!==12) d.gd.beds=Array(12).fill(null); return d.gd; };
/* a bed: {s:seed id, p:0..3 progress (steps), w:1 if watered for the step it is in, t:last update} */
function grow(b,now){ if(!b) return; const S=SB[b.s]; if(!S){ return; } if(b.w&&b.p<3){ const step=Math.floor(b.p)+1, per=S[3]*60000/3; let np=b.p+(now-b.t)/per; if(np>=step){ np=step; b.w=0; } b.p=Math.min(3,np); } b.t=now; }
const stage=b=>!b?-1:b.p>=3?3:Math.floor(b.p);
L.cropList=()=>{ const c=GD2().crop; return Object.keys(c).filter(k=>c[k]>0).map(k=>({id:k,n:SB[k][1],k:c[k],ic:SB[k][5]})); };
L.cropTake=id=>{ const c=GD2().crop; if(!(c[id]>0)) return false; c[id]--; save(); return true; };
L.cropSell=()=>{ const L2=L.cropList(); if(!L2.length) return ""; const tot=L2.reduce((a,c)=>a+SB[c.id][4]*c.k,0); return `<h4 style="margin:12px 0 4px">收購花和菜</h4>${L2.map(c=>`<div class="lf-row"><span style="font-size:30px;width:64px;text-align:center">${c.ic}</span><div class="t"><b>${c.n}</b> ×${c.k}<br><small>一個 ${SB[c.id][4]} 幣</small></div></div>`).join("")}<div class="row" style="margin-top:8px"><button class="primary" data-act="lfCropSell">全部賣掉・${tot} 幣</button></div>`; };
HANDLERS.lfCropSell=()=>{ const g=GD2(); let tot=0, n=0; for(const k in g.crop){ tot+=SB[k][4]*g.crop[k]; n+=g.crop[k]; g.crop[k]=0; } if(!n) return; bag.coins+=tot; save(); try{ profSave(true); chaChing(); }catch(e){} toast(`賣了 ${n} 個，拿到 ${tot} 平安幣`,2400); closeSheet(); };
function flower(){ const g=GD2(); openSheet("lfFlower","🌷 花店",`<p class="lead">「種子在這裡買，到河濱公園的『我的花圃』種。記得澆水喔！」</p>${SEEDS.map(q=>`<div class="lf-row"><span style="font-size:30px;width:56px;text-align:center">${q[5]}</span><div class="t"><b>${q[1]}種子</b>　${q[2]} 幣<br><small>約 ${q[3]} 分鐘長大（要澆 3 次水），收成賣 ${q[4]} 幣${g.seed[q[0]]?`｜有 ${g.seed[q[0]]} 包`:""}</small></div><button class="primary" data-act="lfSeed" data-v="${q[0]}">買</button></div>`).join("")}${L.cropSell()}`); }
HANDLERS.lfSeed=v=>{ const q=SB[v], g=GD2(); if(!me.sp){ if(bag.coins<q[2]){ try{ buzz(); }catch(e){} toast("平安幣不夠",2000); return; } bag.coins-=q[2]; } g.seed[v]=(g.seed[v]|0)+1; save(); try{ chaChing(); }catch(e){} flower(); };
let GS=null;
function gardenOpen(){ if(!SHOPX||!SHOPX.enter) return; const S=new T.Scene(); S.background=new T.Color("#9fd4f5").convertSRGBToLinear(); S.add(new T.HemisphereLight("#fff6e0","#4a6a3a",.5)); const sun=new T.DirectionalLight("#fff2d8",.55); sun.position.set(4,8,5); S.add(sun);
  const M=(c,o)=>{ const m=new T.MeshStandardMaterial(Object.assign({color:c,roughness:.9},o||{})); m.color.convertSRGBToLinear(); return m; }; const add=(geo,m,x,y,z)=>{ const o=new T.Mesh(geo,m); o.position.set(x,y,z); S.add(o); return o; };
  const grass=add(new T.PlaneGeometry(30,30),M("#8fd06a"),0,0,0); grass.rotation.x=-Math.PI/2;
  for(let i=0;i<40;i++){ const a=Math.random()*6.283, d=8+Math.random()*6; add(new T.SphereGeometry(.12,8,6),M(["#ff8fb0","#fff1a0","#ffffff","#c5a8f5"][i%4]),Math.cos(a)*d,.12,Math.sin(a)*d); }
  for(const [x,z,w,d] of [[0,-6,12.4,.2],[0,6,12.4,.2],[-6.2,0,.2,12],[6.2,0,.2,12]]){ add(new T.BoxGeometry(w,.6,d),M("#d8b890"),x,.3,z); }
  for(const [x,z] of [[-8,-8],[8,-9],[-9,7],[9,8]]){ add(new T.CylinderGeometry(.18,.24,1.6,8),M("#8a6a4a"),x,.8,z); add(new T.SphereGeometry(1.4,14,10),M("#5fae5f"),x,2.3,z); }
  { const sh=new T.Group(); sh.position.set(-4.6,0,-8.2); S.add(sh); const b=new T.Mesh(new T.BoxGeometry(2.6,2,2),M("#f6e2c8")); b.position.y=1; sh.add(b); const r=new T.Mesh(new T.ConeGeometry(2.1,1.1,4),M("#d9624a")); r.rotation.y=Math.PI/4; r.position.y=2.55; sh.add(r); }
  const beds=[]; for(let i=0;i<12;i++){ const cx=-3.9+(i%4)*2.6, cz=-2.6+Math.floor(i/4)*2.6; const soil=add(new T.BoxGeometry(2.1,.22,2.1),M("#7a5236"),cx,.11,cz); const top=add(new T.BoxGeometry(1.9,.04,1.9),M("#5a3a24"),cx,.24,cz); const g=new T.Group(); g.position.set(cx,.26,cz); S.add(g); beds.push({cx,cz,soil,top,g}); }
  const cam=new T.PerspectiveCamera(40,1,.1,100); const o={exposure:1.0}; const el=SHOPX.enter("garden",o); const D=GD2(); let sel=-1;
  el.insertAdjacentHTML("beforeend",`<div class="shx-top"><span class="shx-title">🌱 我的花圃</span><span class="shx-pill" id="gC"></span><button class="shx-x" id="gX">離開</button></div><div class="shx-panel" id="gP"></div>`);
  const $g=q=>el.querySelector(q);
  const draw=()=>{ const now=Date.now(); D.beds.forEach(b=>grow(b,now)); $g("#gC").textContent=`💰 ${bag.coins}`; const b=sel>=0?D.beds[sel]:null; const seeds=SEEDS.filter(q=>D.seed[q[0]]>0);
    let h=`<p class="rm-tip" style="font-size:13.5px;color:#f3e7d0;margin:0 2px 8px">${sel<0?"點一塊田。種子在小鎮主街的花店買。":b?`${SB[b.s][5]} ${SB[b.s][1]}：${["剛種下","發芽了","長大了","可以收成了！"][stage(b)]}${stage(b)<3?(b.w?"（澆過水，正在長）":"（需要澆水）"):""}`:"空的田，可以種東西。"}</p>`;
    if(sel>=0&&!b) h+=seeds.length?`<div class="rm-chips">${seeds.map(q=>`<button data-sd="${q[0]}">${q[5]} ${q[1]} ×${D.seed[q[0]]}</button>`).join("")}</div>`:`<p class="rm-tip">身上沒有種子，先到花店買。</p>`;
    if(b&&stage(b)<3) h+=`<div class="rm-row"><button class="shx-btn" id="gW" ${b.w?"disabled":""}>💧 澆水</button></div>`;
    if(b&&stage(b)>=3) h+=`<div class="rm-row"><button class="shx-btn" id="gH">🧺 收成</button></div>`;
    h+=`<div class="rm-row"><button class="shx-btn alt" id="gWA">💧 全部澆水</button></div><p class="rm-tip">收成的東西可以賣給花店、雜貨店，或送給鎮上的人。</p>`; $g("#gP").innerHTML=h;
    $g("#gP").querySelectorAll("[data-sd]").forEach(q=>q.onclick=()=>{ const id=q.dataset.sd; if(!(D.seed[id]>0)) return; D.seed[id]--; D.beds[sel]={s:id,p:0,w:0,t:Date.now()}; save(); try{ tone(440,.08,.05,"triangle"); }catch(e){} paint(); draw(); });
    const w=$g("#gW"); if(w) w.onclick=()=>{ b.w=1; b.t=Date.now(); save(); try{ tone(880,.1,.04,"sine"); tone(660,.12,.03,"sine",.08); }catch(e){} splash(sel); draw(); };
    $g("#gWA").onclick=()=>{ let n=0; D.beds.forEach((q,i)=>{ if(q&&stage(q)<3&&!q.w){ q.w=1; q.t=Date.now(); n++; splash(i); } }); save(); if(n) try{ tone(880,.1,.04,"sine"); }catch(e){} draw(); };
    const hv=$g("#gH"); if(hv) hv.onclick=()=>{ const n=b.s==="straw"||b.s==="tomato"?3:1; D.crop[b.s]=(D.crop[b.s]|0)+n; D.beds[sel]=null; save(); try{ [659,784,988].forEach((f,k)=>tone(f,.1,.05,"triangle",k*.07)); statInc("gdHarvest"); }catch(e){} toast(`收成了 ${n} 個${SB[b.s][1]}！`,2000); paint(); draw(); }; };
  const drops=[]; const splash=i=>{ const B=beds[i]; for(let k=0;k<10;k++){ const m=new T.Mesh(new T.SphereGeometry(.05,6,4),new T.MeshBasicMaterial({color:"#7ec8f0"})); m.position.set(B.cx+(Math.random()-.5)*1.4,1.6+Math.random()*.5,B.cz+(Math.random()-.5)*1.4); S.add(m); drops.push({m,v:0}); } };
  const paint=()=>{ const now=Date.now(); beds.forEach((B,i)=>{ while(B.g.children.length){ const c=B.g.children[0]; B.g.remove(c); c.geometry.dispose(); c.material.dispose(); } const b=D.beds[i]; grow(b,now); B.top.material.color.set(b&&b.w?"#3e2616":"#5a3a24").convertSRGBToLinear(); if(!b) return; const st=stage(b), S2=SB[b.s], col=S2[6];
      const add2=(geo,c,x,y,z)=>{ const o=new T.Mesh(geo,M(c)); o.position.set(x,y,z); B.g.add(o); return o; };
      for(const [dx,dz] of [[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]]){ if(st===0) add2(new T.SphereGeometry(.07,6,4),"#8a6a4a",dx,.02,dz); else if(st===1){ add2(new T.ConeGeometry(.08,.3,6),"#6fbf5a",dx,.15,dz); } else { add2(new T.CylinderGeometry(.03,.03,st===3?.7:.5,6),"#4f9a4a",dx,st===3?.35:.25,dz); add2(new T.SphereGeometry(.16,8,6),"#6fbf5a",dx,st===3?.45:.4,dz).scale.set(1.3,.6,1.3);
          if(st===3){ if(["sun","tulip","rose"].includes(b.s)) add2(new T.SphereGeometry(b.s==="sun"?.16:.12,10,8),col,dx,.78,dz); else if(b.s==="cabbage") add2(new T.SphereGeometry(.22,10,8),col,dx,.25,dz); else if(b.s==="pumpkin") add2(new T.SphereGeometry(.2,10,8),col,dx,.2,dz).scale.set(1.2,.8,1.2); else for(let k=0;k<3;k++) add2(new T.SphereGeometry(.07,8,6),col,dx+(k-1)*.1,.6-k*.05,dz+.05); } } } }); };
  paint(); draw();
  const ray=new T.Raycaster(), v2=new T.Vector2(); const tl=el.querySelector(".shx-touch"); let yaw=0, drag=null;
  tl.addEventListener("pointerdown",e=>{ drag={x:e.clientX,y0:yaw,mv:0}; }); tl.addEventListener("pointermove",e=>{ if(!drag) return; drag.mv=Math.max(drag.mv,Math.abs(e.clientX-drag.x)); if(drag.mv>8) yaw=Math.max(-.7,Math.min(.7,drag.y0-(e.clientX-drag.x)*.006)); });
  tl.addEventListener("pointerup",e=>{ const d=drag; drag=null; if(!d||d.mv>8) return; v2.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1); ray.setFromCamera(v2,cam); const hits=ray.intersectObjects(beds.flatMap(B=>[B.soil,B.top]),false); if(hits.length){ sel=beds.findIndex(B=>B.soil===hits[0].object||B.top===hits[0].object); try{ tone(700,.04,.04,"triangle"); }catch(err){} draw(); } });
  $g("#gX").onclick=()=>SHOPX.leave(); let tt=0;
  o.update=dt=>{ tt+=dt; for(let i=drops.length-1;i>=0;i--){ const q=drops[i]; q.v+=dt*9; q.m.position.y-=q.v*dt; if(q.m.position.y<.3){ S.remove(q.m); q.m.geometry.dispose(); q.m.material.dispose(); drops.splice(i,1); } } if(tt>5){ tt=0; paint(); if(sel>=0) draw(); } };
  o.render=dt=>{ const asp=innerWidth/innerHeight; cam.aspect=asp; const ph=Math.min(.55,(($g("#gP").offsetHeight||200))/innerHeight); const d=Math.max(16,9/asp); cam.position.set(Math.sin(yaw)*d,d*.85,Math.cos(yaw)*d); cam.lookAt(0,-ph*d*.55,0); cam.updateProjectionMatrix(); renderer.render(S,cam); };
  o.dispose=()=>{ S.traverse(q=>{ if(q.geometry) q.geometry.dispose(); if(q.material) q.material.dispose(); }); save(); try{ profSave(true); }catch(e){} }; }
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
HANDLERS.lfBg=()=>{ closeSheet(); bgStart(); }; L.bgTest={get:()=>BG,drop:()=>bgDrop(),open:()=>bfastOpen(),stack:n=>{ const B=BG; for(let i=0;i<n;i++){ const k=bgPick(); B.stack.push({k,x:B.stack[B.stack.length-1].x+(Math.random()*2-1)*6,y:B.top,h:BG_ING[k]}); B.top+=BG_ING[k]; B.n++; } B.cam=Math.max(0,B.top-(innerHeight*.86-innerHeight*.55)); bgHud(); }};
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
L.more4=k=>{ if(k==="tw:bfast"){ bfastOpen(); return true; } if(k==="tw:garden"){ gardenOpen(); return true; } if(k==="tw:flower"){ flower(); return true; } return false; };
L.garden=gardenOpen;

/* ---------- into the save code (the 取回碼 and the server's copy): rod, bought styles, the fish book, fish in the bag (how many of
   each kind; sizes come back as a typical size), the townsfolk's affinity, the garden (seeds, harvest, what grows in each bed), and
   meteor finds. Order matters: FISH, NPCS and SEEDS may only ever be added to at the end. ---------- */
L.pack=put=>{ const d=LF(), o=d.own||{}, g=GD2(); put(4,3); /* (version 3: + rods, baits; 4: + 疊漢堡 best and the 1000 prize) */ put(FISH.length,7); put(d.rod|0,2); ["h","e","m","n"].forEach(k=>put(o[k]|0,10));
  FISH.forEach(f=>{ const e=d.fish[f.id]; put(e?Math.min(63,e[0]):0,6); if(e) put(Math.min(511,Math.round(e[1])),9); });
  const ic={}; d.inv.forEach(([id])=>ic[id]=(ic[id]||0)+1); FISH.forEach(f=>put(Math.min(40,ic[f.id]||0),6));
  NPCS.forEach(n=>{ const R=(d.npc||{})[n.id]||{}; put(Math.min(100,R.a|0),7); put((R.r|0)&7,3); });
  SEEDS.forEach(q=>put(Math.min(31,g.seed[q[0]]|0),5)); SEEDS.forEach(q=>put(Math.min(127,g.crop[q[0]]|0),7));
  g.beds.forEach(b=>{ const i=b?SEEDS.findIndex(q=>q[0]===b.s):-1; put(i+1,3); if(i>=0){ grow(b,Date.now()); put(Math.min(15,Math.round(b.p*5)),4); put(b.w?1:0,1); } });
  put(Math.min(63,d.stone|0),6); put(Math.min(255,d.dust|0),8); put(d.rods&4095,12); put(d.eqF|0,4); put(d.eqS|0,4); put(Math.min(15,d.godOK|0),4); d.bait.forEach(n=>put(Math.min(127,n|0),7)); put(d.bF|0,5); put(d.bS|0,5); const bb=d.bg||{}; put(Math.min(1023,bb.best|0),10); put(bb.h?1:0,1); };
L.unpack=get=>{ const v=get(3); if(v<1||v>4) return null; const NF=v===1?33:Math.min(FISH.length,get(7)), FL=FISH.slice(0,NF); const o={rod:get(2),own:{h:get(10),e:get(10),m:get(10),n:get(10)},fish:{},inv:[],npc:{},seed:{},crop:{},beds:[]};
  FL.forEach(f=>{ const n=get(6); if(n) o.fish[f.id]=[n,get(9),Date.now()]; }); FL.forEach(f=>{ const n=get(6); for(let k=0;k<n;k++) o.inv.push([f.id,Math.round((f.sz[0]+f.sz[1])/2)]); });
  NPCS.forEach(n=>{ o.npc[n.id]={a:get(7),r:get(3),d:0,g:0}; }); SEEDS.forEach(q=>o.seed[q[0]]=get(5)); SEEDS.forEach(q=>o.crop[q[0]]=get(7));
  for(let i=0;i<12;i++){ const k=get(3); if(k){ const p=get(4)/5, w=get(1); o.beds.push(SEEDS[k-1]?{s:SEEDS[k-1][0],p,w,t:Date.now()}:null); } else o.beds.push(null); }
  o.stone=get(6); o.dust=get(8); if(v>=3){ o.rods=get(12); o.eqF=get(4); o.eqS=get(4); o.godOK=get(4); o.bait=[]; for(let i=0;i<20;i++) o.bait.push(get(7)); o.bF=get(5); o.bS=get(5); } if(v>=4){ o.bgBest=get(10); o.bgH=get(1); } return o; };
L.restore=o=>{ if(!o) return; const d=LF(), g=GD2(); d.rod=Math.max(d.rod|0,o.rod); if(o.rods!=null){ d.rods=(d.rods|0)|o.rods; d.eqF=d.eqF||o.eqF; d.eqS=d.eqS||o.eqS; d.godOK=Math.max(d.godOK|0,o.godOK); o.bait.forEach((n,i)=>{ d.bait[i]=Math.max(d.bait[i]|0,n); }); d.bF=d.bF||o.bF; d.bS=d.bS||o.bS; } else if(o.rod&&!d.rods) d.rods=o.rod>=2?0b1000011:1; d.own=d.own||{}; for(const k in o.own) d.own[k]=(d.own[k]|0)|o.own[k];
  for(const id in o.fish){ const e=d.fish[id], n=o.fish[id]; d.fish[id]=e?[Math.max(e[0],n[0]),Math.max(e[1],n[1]),e[2]]:n; }
  if(o.inv.length>=d.inv.length) d.inv=o.inv; d.npc=d.npc||{}; for(const id in o.npc){ const R=d.npc[id]; if(!R||R.a<o.npc[id].a) d.npc[id]=Object.assign(R||{d:0,g:0},{a:o.npc[id].a,r:(R?R.r|0:0)|o.npc[id].r}); }
  for(const k in o.seed) g.seed[k]=Math.max(g.seed[k]|0,o.seed[k]); for(const k in o.crop) g.crop[k]=Math.max(g.crop[k]|0,o.crop[k]); if(o.beds.some(b=>b)&&!g.beds.some(b=>b)) g.beds=o.beds;
  d.stone=Math.max(d.stone|0,o.stone); d.dust=Math.max(d.dust|0,o.dust); if(o.bgBest!=null){ d.bg=d.bg||{best:0,h:0}; d.bg.best=Math.max(d.bg.best|0,o.bgBest); d.bg.h=d.bg.h||o.bgH; } save(); };
L.tick2=dt=>{ goddessTick(dt); mmTick(dt); try{ npcTick(dt); }catch(e){ console.warn("npcs",e); } if(L.tick3) L.tick3(dt); };
setTimeout(()=>{ try{ chipInit(); }catch(e){} },1800);
L.dbg=()=>({F,near,LF:LF(),pool,FGLB,HELD}); L.press=()=>press(); L.start=()=>startFish(); L.hold=id=>{ fishLoad(); const go=()=>{ if(!FGLB){ setTimeout(go,300); return; } const f=FBY[id], g=fishMesh(f); g.scale.setScalar(.8); scene.add(g); HELD={g,t:.6,from:meAv.root.position.clone().add(new T.Vector3(Math.sin(meAv.rotY)*3,0,Math.cos(meAv.rotY)*3)),len:.8}; L.heldFreeze=1; }; go(); };
return L; })();

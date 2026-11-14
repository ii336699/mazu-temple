/* ================= 小鎮生活 (11/13): fishing and the fish book first; the townsfolk, the salon and barber, the stall games,
   the meteor and your own garden are added below as they are made. Everything a player owns here lives in bag.lf.
   Fish models are drawn in code for now (a body, a tail, a fin, colours and markings per kind): when the chair's models arrive,
   FISHGLB[id] is the only thing that has to be filled in. ================= */
LIFE=(()=>{
const L={};
const MZIMG=p=>(window.IMG_PACK&&window.IMG_PACK[p])||p; /* (test page: newer pictures come packed in img-pack.js — the test page may hold only 512 files) */
/* 主委測試模式 (11/14): only for the chair; nothing is saved — a reload turns it off. on: shops ignore their hours and games their daily limits; hour: the shop clock */
const TM={on:false,hour:null}; L.TM=TM;
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
 /* 11/14: ten more sea fish (the chair) */
 ["milkfish","虱目魚","o",1,"","",[25,50],60,2,["#9aa8b8","#f0f4f8","#6a7a8a"],"plain","台灣人的早餐魚，煮粥最好吃。"],
 ["saury","秋刀魚","o",1,"01","",[25,35],55,1,["#3a5a8a","#e8eef4","#f2c230"],"line","細細長長，秋天的味道。"],
 ["mullet","烏魚","o",1,"23","",[30,60],80,3,["#5a6470","#d8dce0","#3a4048"],"line","冬天成群游過來，魚卵就是烏魚子。"],
 ["pomfret","白鯧","o",2,"","",[20,35],380,2,["#d8dce4","#ffffff","#b8c0cc"],"plain","扁扁亮亮的，過年桌上的大菜。"],
 ["redbream","赤鯮","o",2,"12","",[18,30],360,2,["#e8706a","#ffe0d8","#f2c230"],"scale","粉紅色的小鯛魚，清蒸最鮮。"],
 ["amberjack","紅魽","o",2,"12","",[60,110],520,5,["#6a8098","#f0f0e8","#f2c230"],"line","一道黃線從頭到尾，咬餌很兇。"],
 ["octopus","章魚","o",2,"3","",[30,60],450,3,["#c86a5a","#f2c8b8","#8a3a2a"],"squid","八隻腳緊緊抓著石頭，晚上才出來。"],
 ["clownfish","小丑魚","o",2,"1","",[6,11],400,1,["#f07a2a","#ffffff","#2a2a2a"],"bars","住在海葵裡的橘白條紋小魚。"],
 ["tuna","黑鮪魚","o",3,"0","",[150,280],3500,6,["#2a3a5a","#d8dce4","#f2c230"],"line","清晨從深海衝上來的海中霸王。"],
 ["marlin","旗魚","o",3,"12","",[180,320],3200,6,["#2a4a8a","#e8eef4","#4a8ad0"],"plain","嘴巴像一把長劍，跳出海面時閃閃發光。"],
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
 {k:"s",n:"南極蝦",p:50,t:["mackerel","sardine","terapon","seahorse","saury","mullet"],d:"海釣最常用的小蝦，什麼小魚都吃。"},
 {k:"s",n:"青蟲",p:70,t:["flounder","terapon","seabream","milkfish","mullet"],d:"住在沙裡的海蟲，沙灘底棲魚的最愛。"},
 {k:"s",n:"活蝦",p:120,t:["seabream","grouper","puffer","redbream","clownfish"],d:"鉤在尾巴上讓牠游，黑鯛和石斑最難抗拒。"},
 {k:"s",n:"白蝦仁",p:80,t:["mackerel","sardine","terapon","saury","milkfish","pomfret"],d:"剝好的小白蝦，鯖魚、沙丁魚這些成群的小魚最愛。"},
 {k:"s",n:"魷魚條",p:110,t:["hairtail","grouper","puffer","oarfish"],d:"切成長條的魷魚，又韌又耐咬，夜釣常用。"},
 {k:"s",n:"魚肉塊",p:130,t:["hairtail","shark","grouper","amberjack"],d:"切塊的鯖魚肉，血水味會引來大傢伙。"},
 {k:"s",n:"木蝦",p:180,t:["squid","octopus"],d:"做成蝦子樣子的假餌，專門釣透抽、軟絲。"},
 {k:"s",n:"小螃蟹",p:160,t:["seabream","dragonbream","puffer"],d:"鯛魚會用牙齒咬碎殼來吃，釣大鯛的秘密武器。"},
 {k:"s",n:"活餌鯖魚",p:240,t:["mahi","shark","grouper","sunfish","tuna","marlin"],d:"整條活的小鯖魚，鬼頭刀看到會衝過來。"},
 {k:"s",n:"鐵板",p:280,t:["mahi","mackerel","hairtail","dragonbream","amberjack","tuna"],d:"沉甸甸的金屬假餌，抽動時像受傷的小魚一樣閃。"},
];
/* ---------- the 12 rods as held 3D models (shaped after the chair's rod pictures, public/rods/r0-11.webp) ---------- */
const ROD_LOOK=[
 {bl:"#d9a24a",gr:"#5a3a22",cap:"#c99040",bam:1,g:0},                                   /* 竹製手竿 */
 {bl:"#f2efe8",gr:"#4a4a4e",cap:"#c8ccd2",bd:[[.42,"#d2232a"],[.6,"#d2232a"],[.76,"#d2232a"],[.88,"#d2232a"]],g:4},  /* 玻纖溪流竿 */
 {bl:"#26282c",gr:"#26282c",cap:"#1a1a1c",bd:[[.04,"#e0b030"],[.07,"#e0b030"],[.42,"#e0b030"],[.45,"#e0b030"]],g:0,tex:"carbon"}, /* 碳纖長竿 */
 {bl:"#3c3a40",gr:"#4a4a4e",cap:"#c8202a",bd:[[.36,"#c8202a"],[.5,"#c8202a"]],g:5,reel:"spin"}, /* 路亞竿 */
 {bl:"#1c1416",gr:"#1c1416",cap:"#d8a830",bd:[[.3,"#d8a830"],[.62,"#1a1a1a"],[.8,"#1a1a1a"]],g:0,tex:"sakura"},   /* 和竿 */
 {bl:"#e8b830",gr:"#f4f0e8",cap:"#e8b830",bd:[[.3,"#f0c840"]],g:3,gold:1,wing:1},        /* 女神的金釣竿 */
 {bl:"#3a3e46",gr:"#1e1e20",cap:"#c8ccd2",bd:[[.04,"#2a7ae0"],[.2,"#c8ccd2"],[.3,"#2a7ae0"],[.5,"#2a7ae0"]],g:4,reel:"spin",lc:"#9ad06a"},                  /* 岸拋入門竿 (11/14 picture: blue rings, green line) */
 {bl:"#5a1418",gr:"#202022",cap:"#d8a830",bd:[[.04,"#d8a830"],[.24,"#d8a830"],[.3,"#7a1a1e"],[.55,"#d8a830"],[.82,"#d8a830"]],g:4,reel:"spin",lc:"#c0392b",gloss:1},  /* 磯釣竿 */
 {bl:"#d8dade",gr:"#202022",cap:"#c8ccd2",bd:[[.04,"#1e2a6a"],[.22,"#c8ccd2"],[.32,"#1e2a6a"],[.45,"#1e2a6a"],[.62,"#1e2a6a"]],g:4,reel:"spin",lc:"#4aa8d8",metal:1},   /* 遠投竿 */
 {bl:"#26262a",gr:"#202022",cap:"#e8641c",bd:[[.04,"#e8641c"],[.26,"#c8ccd2"],[.34,"#e8641c"],[.55,"#e8641c"],[.75,"#e8641c"]],g:4,reel:"drum",lc:"#e8641c"}, /* 船釣竿 */
 {bl:"#5a5c60",gr:"#5a5c60",cap:"#c8ccd2",bd:[[.04,"#c8ccd2"],[.3,"#c8ccd2"],[.38,"#c8ccd2"],[.6,"#c8ccd2"]],g:4,tex:"stone2",thick:1.25,reel:"drum",lc:"#8aa080"},  /* 石鯛竿 */
 {bl:"#1e3a8a",gr:"#1e3a8a",cap:"#d8a830",bd:[[.04,"#d8a830"],[.3,"#d8a830"],[.48,"#d8a830"],[.66,"#d8a830"]],g:3,tex:"galaxy2",star:1,reel:"spin",lc:"#3a6ad8",gold:0}, /* 星辰釣竿 */
];
const ROD_TEX={};
function rodTex(k){ if(ROD_TEX[k]) return ROD_TEX[k]; const c=document.createElement("canvas"); c.width=64; c.height=256; const x=c.getContext("2d");
  if(k==="carbon"){ x.fillStyle="#232529"; x.fillRect(0,0,64,256); for(let y=0;y<256;y+=4) for(let i=0;i<64;i+=4){ x.fillStyle=((i+y)/4)%2?"#2e3036":"#1c1d21"; x.fillRect(i,y,4,4); } }
  else if(k==="sakura"){ x.fillStyle="#17110f"; x.fillRect(0,0,64,256); for(let n=0;n<26;n++){ const cx=Math.random()*64, cy=Math.random()*256, r=3+Math.random()*4; x.fillStyle=["#f2a2a8","#f6c2b0","#e88a90"][n%3]; for(let p=0;p<5;p++){ const a=p*1.2566; x.beginPath(); x.arc(cx+Math.cos(a)*r*.55,cy+Math.sin(a)*r*.55,r*.5,0,7); x.fill(); } x.fillStyle="#f0d060"; x.beginPath(); x.arc(cx,cy,r*.22,0,7); x.fill(); } }
  else if(k==="stone"){ x.fillStyle="#bdbab2"; x.fillRect(0,0,64,256); x.lineWidth=3; for(let n=0;n<10;n++){ const cx=Math.random()*64, cy=Math.random()*256; x.strokeStyle="rgba(90,88,84,.6)"; x.beginPath(); for(let t=0;t<12;t+=.2){ const r=t*1.1; x.lineTo(cx+Math.cos(t)*r,cy+Math.sin(t)*r); } x.stroke(); } }
  else if(k==="stone2"){ x.fillStyle="#55585c"; x.fillRect(0,0,64,256); for(let n=0;n<400;n++){ x.fillStyle=`rgba(${Math.random()<.5?"30,30,34":"120,124,128"},.5)`; x.fillRect(Math.random()*64,Math.random()*256,2,2); } x.strokeStyle="rgba(220,222,226,.85)"; x.lineWidth=3; for(let n=0;n<3;n++){ const cy=40+n*80; x.beginPath(); for(let t=0;t<9;t+=.2){ const r=t*1.3; x.lineTo(32+Math.cos(t)*r,cy+Math.sin(t)*r*1.4); } x.stroke(); } }
  else if(k==="galaxy2"){ x.fillStyle="#1c3480"; x.fillRect(0,0,64,256); x.fillStyle="#d8a830"; x.save(); x.translate(0,0); for(let y=-64;y<256;y+=48){ x.beginPath(); x.moveTo(0,y); x.lineTo(64,y+40); x.lineTo(64,y+46); x.lineTo(0,y+6); x.fill(); } x.restore(); for(let n=0;n<26;n++){ const cx=Math.random()*64, cy=Math.random()*256, r=1.5+Math.random()*2.5; x.beginPath(); for(let p=0;p<8;p++){ const a=p*Math.PI/4, rr=p%2?r*.4:r; x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr); } x.fill(); } }
  else if(k==="galaxy"){ const g=x.createLinearGradient(0,0,0,256); g.addColorStop(0,"#241a6a"); g.addColorStop(.5,"#5a2aa0"); g.addColorStop(1,"#1c1650"); x.fillStyle=g; x.fillRect(0,0,64,256); for(let n=0;n<70;n++){ x.fillStyle=`rgba(255,255,255,${.4+Math.random()*.6})`; x.fillRect(Math.random()*64,Math.random()*256,1+Math.random()*1.5,1+Math.random()*1.5); } for(let n=0;n<6;n++){ x.fillStyle="rgba(200,140,255,.25)"; x.beginPath(); x.arc(Math.random()*64,Math.random()*256,8+Math.random()*10,0,7); x.fill(); } }
  const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; t.wrapS=t.wrapT=T.RepeatWrapping; ROD_TEX[k]=t; return t; }
/* a rod 1.7 long along +Y, centred on 0 (the same place the old plain stick was) */
function rodModel(i){ const S=ROD_LOOK[i]||ROD_LOOK[0], G=new T.Group(), H=1.7, y0=-H/2, th=S.thick||1;
  const mat=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:new T.Color(c).convertSRGBToLinear(),roughness:.45,metalness:0},o||{})); /* (picture colours → the renderer's linear colours, so black stays black) */
  const metal=c=>mat(c,{roughness:.35,metalness:.6});
  const cyl=(r0,r1,a,b,m,seg)=>{ const h=(b-a)*H, me=new T.Mesh(new T.CylinderGeometry(r1,r0,h,seg||10),m); me.position.y=y0+(a*H)+h/2; G.add(me); return me; };
  const gl=S.bam?.14:.24; /* how much of the rod is grip */
  const R=f=>(.026-.019*f)*th; /* the blank gets thinner toward the tip */
  const bm=S.tex?mat("#ffffff",{map:rodTex(S.tex),roughness:S.tex==="galaxy"?.3:.55,emissive:S.tex==="galaxy"?new T.Color("#2a1660"):new T.Color(0)}):S.gold?metal(S.bl):S.metal?mat(S.bl,{roughness:.28,metalness:.55}):mat(S.bl,{roughness:S.gloss?.25:.45});
  cyl(R(gl),R(1),gl,1,bm,8);
  cyl(.03*th,.028*th,.02,gl,mat(S.gr,{roughness:.85}));          /* grip */
  cyl(.032*th,.032*th,0,.025,S.bam?mat(S.cap):metal(S.cap));      /* butt cap */
  if(S.bam){ for(let f=.2;f<.98;f+=.11) cyl(R(f)*1.18,R(f)*1.18,f,f+.012,mat("#b07a30")); }
  (S.bd||[]).forEach(([f,c])=>{ const r=(f<gl?.031*th:R(f)*1.15); cyl(r,r,f,f+.018,c==="#d8a830"||c==="#e0b030"||c==="#f0c840"||c==="#c8ccd2"?metal(c):mat(c,{roughness:.3})); });
  for(let k=0;k<S.g;k++){ const f=.42+k*(.55/S.g), r=R(f), ring=new T.Mesh(new T.TorusGeometry(.016+.01*(1-f),.003,5,12),S.gold?metal("#f0c840"):metal("#b8bcc4")); ring.position.set(0,y0+f*H,-(r+.02)); ring.rotation.y=Math.PI/2; G.add(ring); }
  const tipR=new T.Mesh(new T.TorusGeometry(.01,.003,5,10),metal(S.gold?"#f0c840":"#b8bcc4")); tipR.position.y=y0+H; tipR.rotation.y=Math.PI/2; G.add(tipR);
  if(S.reel==="spin"){ const rg=new T.Group(), m=metal("#a8acb4"); const st=new T.Mesh(new T.BoxGeometry(.012,.012,.07),m); st.position.z=-.04; rg.add(st);
    const sp=new T.Mesh(new T.CylinderGeometry(.034,.034,.03,14),mat(S.lc||"#9aaa90",{roughness:.4})); sp.rotation.x=Math.PI/2; sp.position.set(0,.03,-.09); rg.add(sp);
    const bd=new T.Mesh(new T.SphereGeometry(.032,10,8),metal("#7a7e86")); bd.position.set(0,-.01,-.09); rg.add(bd);
    const hd=new T.Mesh(new T.CylinderGeometry(.004,.004,.06,5),m); hd.rotation.z=Math.PI/2; hd.position.set(.04,-.01,-.09); rg.add(hd);
    const kn=new T.Mesh(new T.SphereGeometry(.009,8,6),mat("#c8202a")); kn.position.set(.07,-.01,-.09); rg.add(kn);
    rg.position.y=y0+.27*H; G.add(rg); }
  if(S.reel==="drum"){ /* a round 両軸 reel sitting on top of the rod */ const rg=new T.Group(), m=metal("#a8acb4"); const dr=new T.Mesh(new T.CylinderGeometry(.045,.045,.07,18),m); dr.rotation.z=Math.PI/2; dr.position.z=-.06; rg.add(dr); const ln=new T.Mesh(new T.CylinderGeometry(.038,.038,.05,18),mat(S.lc||"#8aa0b0",{roughness:.4})); ln.rotation.z=Math.PI/2; ln.position.z=-.06; rg.add(ln);
    [-1,1].forEach(sd=>{ const pl=new T.Mesh(new T.CylinderGeometry(.05,.05,.01,18),mat(S.lc||"#c8ccd2",{roughness:.3,metalness:.4})); pl.rotation.z=Math.PI/2; pl.position.set(sd*.04,0,-.06); rg.add(pl); });
    const hd=new T.Mesh(new T.CylinderGeometry(.004,.004,.05,5),m); hd.position.set(.06,-.02,-.06); rg.add(hd); const kn=new T.Mesh(new T.SphereGeometry(.012,8,6),mat("#2a2a2c")); kn.position.set(.065,-.045,-.06); rg.add(kn); rg.position.y=y0+.27*H; G.add(rg); }
  if(S.seat){ const m=metal("#b8bcc4"); const sb=new T.Mesh(new T.BoxGeometry(.012,.09,.03),m); sb.position.set(0,y0+.28*H,-.03); G.add(sb); }
  if(S.wing){ const wm=new T.MeshStandardMaterial({color:"#ffffff",roughness:.6,side:T.DoubleSide,emissive:new T.Color("#40382a")}), sh=new T.Shape(); sh.moveTo(0,0); sh.quadraticCurveTo(.06,.16,.2,.22); sh.quadraticCurveTo(.14,.12,.17,.08); sh.quadraticCurveTo(.1,.06,.12,.02); sh.quadraticCurveTo(.06,.01,0,0);
    [1,-1].forEach(s=>{ const w=new T.Mesh(new T.ShapeGeometry(sh),wm); w.scale.set(s*.7,.7,.7); w.position.set(s*.02,y0+.3*H,0); w.rotation.y=s*.5; G.add(w); });
    const gem=new T.Mesh(new T.OctahedronGeometry(.026),mat("#3aa8ff",{roughness:.1,metalness:.3,emissive:new T.Color("#1a5aa0")})); gem.position.set(0,y0+.3*H,.035); G.add(gem);
    const orn=new T.Mesh(new T.SphereGeometry(.038,10,8),metal("#e8b830")); orn.scale.set(1,1.4,1); orn.position.y=y0+.3*H; G.add(orn);
    G.userData.glow=1; }
  if(S.star){ const sh=new T.Shape(); for(let k=0;k<8;k++){ const a=k*Math.PI/4, r=k%2?.014:.04; if(k) sh.lineTo(Math.sin(a)*r,Math.cos(a)*r); else sh.moveTo(0,r); } [.3,.04].forEach(f=>{ const st=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:.01,bevelEnabled:false}),metal("#f0c840")); st.position.set(0,y0+f*H,.03); G.add(st); }); }
  G.traverse(q=>{ if(q.isMesh) q.castShadow=false; });
  return G; }
function rodDispose(g){ g.traverse(q=>{ if(q.isMesh){ q.geometry.dispose(); if(!q.material.map) q.material.dispose(); } }); }
const hasRod=i=>!!me.sp||!!(LF().rods&(1<<i));
function rodFor(kind){ const k=kind==="o"?"s":"f", d=LF(), eq=k==="f"?d.eqF:d.eqS; if(eq&&RODS[eq-1]&&RODS[eq-1].k===k&&hasRod(eq-1)) return RODS[eq-1]; let best=null; RODS.forEach((r,i)=>{ if(r.k===k&&hasRod(i)) best=r; }); return best; }
function baitFor(kind){ const k=kind==="o"?"s":"f", d=LF(), i=(k==="f"?d.bF:d.bS)|0; return i&&BAITS[i-1]&&BAITS[i-1].k===k&&d.bait[i-1]>0?BAITS[i-1]:null; }
function roll(kind,rod,bait){ const P=pool(kind), W=f=>RW[f.r]*(f.r>=3&&rod?rod.luck:1)*(bait&&bait.t.includes(f.id)?4:1)*(f.r>=3&&L.luck?1+L.luck()/50:1); /* (鹹粥 luck: up to ×2 for the rare ones) */ let tot=0; P.forEach(f=>tot+=W(f)); let x=Math.random()*tot; for(const f of P){ x-=W(f); if(x<=0) return f; } return P[0]; }
/* ---------- a fish drawn in code: for the book, the bag and the catch card ---------- */
const ICON={};
const FMODEL={bass:1,carp:1,tilapia:1,catfish:1,arowana:1,trout:1,goldfish:1,guppy:1,zacco:1,koi:1, /* fish2.glb: */ clownfish:1,mahi:1,shark:1,tuna:1,sunfish:1,marlin:1,oarfish:1,mackerel:1,seabream:1,terapon:1,sardine:1,milkfish:1,saury:1,mullet:1,puffer:1,flounder:1,loach:1,eel:1,bighead:1,masu:1,sturgeon:1,medaka:1,angel:1,springkoi:1,goldscale:1,crucian:1,ayu:1,kuhua:1,hairtail:1,squid:1,seahorse:1,grouper:1,pomfret:1,redbream:1,amberjack:1,octopus:1}; /* the kinds that have the chair's model (public/fish.glb, icons in public/fish/) */
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
function fishLoad(){ if(FGLB||FGLBwait) return; FGLBwait=true; for(const nm of ["fish","fish2"]) try{ loadRaw0(nm,false,sc=>{ FGLB=FGLB||{}; sc.traverse(o=>{ if(o.isMesh){ let n=o; while(n&&!FMODEL[n.name]) n=n.parent; if(n) FGLB[n.name]=o; } }); },()=>{}); }catch(e){} }
/* the body bends like a swimming fish: a wave runs from the head (−x) to the tail (+x), growing towards the tail */
const WMS=new Map(); function wagMat(src){ let WM=WMS.get(src); if(WM) return WM; WM=src.clone(); WMS.set(src,WM); WM.onBeforeCompile=sh=>{ sh.uniforms.uT=WU.uT; sh.vertexShader="uniform float uT;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\n float fw=smoothstep(-.5,.5,position.x); transformed.z+=sin(position.x*6.5-uT*17.)*(.025+.16*fw*fw); transformed.x-=.03*fw*sin(uT*17.)*sin(uT*17.);"); }; WM.customProgramCacheKey=()=>"fishwag"; return WM; }
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
.lf-row{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.08)}.lf-row img{width:64px;height:40px;object-fit:contain}.lf-row img.rodic{width:56px;height:56px}.lf-row .t{flex:1}.lf-row small{color:#bba}`; document.head.appendChild(st); }
function chipInit(){ css(); chip=document.createElement("button"); chip.id="lfChip"; chip.hidden=true; chip.textContent="🎣 釣魚"; chip.onclick=()=>startFish(); document.body.appendChild(chip); }
/* ---------- fishing ---------- */
let F=null;
const busy=()=>{ try{ return !!(sheetKind||customizing||(SHOPX&&SHOPX.on)||miniOpen||meAv.seat>=0||(typeof pendingStation!=="undefined"&&pendingStation)); }catch(e){ return false; } };
function startFish(){ if(F) return; const d=LF(); const w=near||findWater(); if(!w){ toast("離水邊再近一點",1800); return; } const rodS=rodFor(w.w.k); if(!rodS){ toast(w.w.k==="o"?"🎣 海邊要用海釣竿，老街的釣具行有賣":"🎣 要先到老街的釣具行買一支溪釣竿",3000); return; }
  if(d.inv.length>=40){ toast("背包裡的魚滿了（40 條），先到釣具行或雜貨店賣掉一些",3000); return; }
  /* no bait, no cast (主委 11/14): use the chosen bait, or the first one you have for this water */ { const bk0=w.w.k==="o"?"s":"f"; if(!baitFor(w.w.k)){ const i=BAITS.findIndex((b,j)=>b.k===bk0&&d.bait[j]>0); if(i<0){ toast(w.w.k==="o"?"🪱 沒有海釣餌不能拋竿，老街的釣具行有賣":"🪱 沒有溪釣餌不能拋竿，老街的釣具行有賣",3200); return; } if(bk0==="f") d.bF=i+1; else d.bS=i+1; save(); } }
  meAv.target.copy(meAv.pos); meAv.path=[]; const face=Math.atan2(w.x-meAv.pos.x,w.z-meAv.pos.y); meAv.rotY=face; meAv.faceGoal=face;
  const ov=document.createElement("div"); ov.className="lf-ov"; ov.innerHTML=`<div class="lf-top" id="lfMsg">拋竿……</div><button class="lf-x" id="lfX">收竿</button><button id="lfBait" style="position:absolute;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 262px);border:1px solid rgba(255,255,255,.4);border-radius:12px;background:rgba(0,0,0,.5);color:#fff;font:800 13px ${UI_FONT};padding:7px 10px;text-align:left;max-width:60%"></button><button class="lf-btn" id="lfB">拉竿！</button>`; fishLoad(); document.body.appendChild(ov);
  /* the float: a slim stick float standing in the water — red tip, white body, the thin stem below the surface */
  const bob=new T.Group(); { const M=c=>new T.MeshStandardMaterial({color:c,roughness:.4}); const tip=new T.Mesh(new T.CylinderGeometry(.018,.03,.2,10),M("#e8402e")); tip.position.y=.26; bob.add(tip); const top=new T.Mesh(new T.SphereGeometry(.03,10,8),M("#ffd84a")); top.position.y=.37; bob.add(top);
    const body=new T.Mesh(new T.SphereGeometry(.07,14,10),M("#ffffff")); body.scale.set(1,1.5,1); body.position.y=.08; bob.add(body); const band=new T.Mesh(new T.CylinderGeometry(.071,.071,.03,14),M("#e8402e")); band.position.y=.1; bob.add(band); const stem=new T.Mesh(new T.CylinderGeometry(.008,.008,.3,6),M("#3a3a3a")); stem.position.y=-.15; bob.add(stem); } scene.add(bob);
  const sh=new T.Mesh(new T.CircleGeometry(1,20),new T.MeshBasicMaterial({color:"#0a1a24",transparent:true,opacity:0,depthWrite:false})); sh.rotation.x=-Math.PI/2; scene.add(sh);
  const ring=new T.Mesh(new T.RingGeometry(.12,.16,24),new T.MeshBasicMaterial({color:"#ffffff",transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide})); ring.rotation.x=-Math.PI/2; scene.add(ring);
  const line=new T.Mesh(new T.CylinderGeometry(.006,.006,1,4),new T.MeshBasicMaterial({color:"#f4f4f0"})); scene.add(line);
  const rod=rodModel(RODS.indexOf(rodS)); rod.position.set(.18,1.15,.55); rod.rotation.x=1.0; meAv.root.add(rod);
  F={ph:"cast",t:0,w,ov,bob,sh,ring,line,rod,y:w.w.y,fish:null,taps:0,nib:0,R:rodS};
  const bk=w.w.k==="o"?"s":"f", bb=ov.querySelector("#lfBait"), showBait=()=>{ const b=baitFor(w.w.k); bb.innerHTML=`🎣 ${F?F.R.n:rodS.n}<br>${b?`🪱 ${b.n} ×${d.bait[BAITS.indexOf(b)]}`:"🪱 沒有餌了"}　<span style="opacity:.8">換竿・換餌 ▸</span>`; };
  /* 換竿・換餌 while fishing (主委 11/14): a little panel beside you with your rods and baits for this water */
  bb.onclick=()=>{ if(!F||["bite","fight","reel"].includes(F.ph)){ toast("魚上鉤時不能換",1400); return; } const old=ov.querySelector("#lfPick"); if(old){ old.remove(); return; }
    const pk=document.createElement("div"); pk.id="lfPick"; pk.style.cssText=`position:absolute;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 312px);max-height:42vh;overflow:auto;background:rgba(255,252,246,.97);border-radius:16px;padding:10px;color:#3b2416;font:700 14px ${UI_FONT};box-shadow:0 8px 24px rgba(0,0,0,.35);z-index:5`;
    const draw=()=>{ const eq=rodFor(w.w.k), cb=baitFor(w.w.k); pk.innerHTML=`<div style="font:900 14px ${UI_FONT};color:#8e1c14;margin:0 0 6px">釣竿</div><div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px">${RODS.map((r,i)=>r.k!==bk||!hasRod(i)?"":`<button data-r="${i}" style="flex:none;width:76px;border-radius:12px;border:2px solid ${eq===r?"#c0392b":"#e2d2bc"};background:#fff;padding:4px;font:800 11px ${UI_FONT};color:#3b2416"><img src="rods/r${i}.webp" style="width:52px;height:52px;object-fit:contain;display:block;margin:0 auto">${r.n}</button>`).join("")}</div>
      <div style="font:900 14px ${UI_FONT};color:#8e1c14;margin:8px 0 6px">釣餌</div><div style="display:flex;flex-wrap:wrap;gap:6px">${BAITS.map((b,i)=>b.k!==bk||!(d.bait[i]>0)?"":`<button data-b="${i}" style="border-radius:12px;border:2px solid ${cb===b?"#c0392b":"#e2d2bc"};background:${cb===b?"#fff1ec":"#fff"};padding:4px 8px 4px 4px;font:800 13px ${UI_FONT};color:#3b2416;display:flex;align-items:center;gap:6px"><img src="baits/b${i}.webp" style="width:34px;height:34px;border-radius:8px">${b.n} ×${d.bait[i]}</button>`).join("")||`<span style="color:#9a7a5a">沒有這種水域的釣餌</span>`}</div>`; };
    draw(); pk.onclick=e=>{ const r=e.target.closest("[data-r]"), b=e.target.closest("[data-b]"); if(r){ const i=+r.dataset.r; if(bk==="f") d.eqF=i+1; else d.eqS=i+1; F.R=RODS[i]; const nr=rodModel(i); nr.position.copy(F.rod.position); nr.rotation.copy(F.rod.rotation); if(F.rod.parent) F.rod.parent.add(nr); F.rod.parent&&F.rod.parent.remove(F.rod); rodDispose(F.rod); F.rod=nr; }
      if(b){ const i=+b.dataset.b; if(bk==="f") d.bF=i+1; else d.bS=i+1; } if(r||b){ save(); try{ tone(700,.05,.04,"triangle"); }catch(_){ } showBait(); draw(); if(F.ph==="wait") F.fish=roll(w.w.k,F.R,baitFor(w.w.k)); } };
    ov.appendChild(pk); };
  showBait(); F.showBait=showBait;
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
function endFish(){ if(!F) return; const o=F; F=null; [o.bob,o.sh,o.ring,o.line].forEach(m=>{ scene.remove(m); m.traverse(q=>{ if(q.isMesh){ q.geometry.dispose(); q.material.dispose(); } }); }); if(o.rod.parent) o.rod.parent.remove(o.rod); rodDispose(o.rod); o.ov.remove(); meAv.faceGoal=null; }
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
function fishTick(dt){ if(F&&F.ph==="wait"&&!baitFor(F.w.w.k)){ F.ph="nobait"; F.t=0; msg("釣餌用完了，到釣具行補貨吧"); } if(F&&F.ph==="nobait"){ F.t+=dt; if(F.t>2.2) endFish(); return; } if(!F){ nearT-=dt; if(nearT<=0){ nearT=.35; const can=!busy()&&TOWNX&&TOWNX.on; near=can&&!HELD?findWater():null; if(chip) chip.hidden=!near; } return; }
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
      return `<div class="lf-row"><img class="rodic" src="rods/r${i}.webp" alt=""><div class="t"><b>${r.n}</b>${r.hid?"":`　${r.p} 幣`}<br><small>${r.d}<br>操控 ${stars(r.ctl,0,.15)}　力量 ${stars(r.pow,1,1.75)}　魚運 ${stars(r.luck,1,2.6)}</small></div>${own?`<button class="${using?"secondary":"primary"}" data-act="lfRodEq" data-v="${i}" ${using?"disabled":""}>${using?"使用中":"換這支"}</button>`:`<button class="primary" data-act="lfRod" data-v="${i}">買</button>`}</div>`; }).join(""); }
  else if(tkTab==="bf"||tkTab==="bs"){ const k=tkTab==="bf"?"f":"s"; body=`<p class="note" style="margin:6px 0">一包 10 份，魚咬一次用掉一份。沒有餌不能拋竿。釣魚時按左下角可以換釣竿和釣餌。</p>`+BAITS.map((b,i)=>b.k!==k?"":`<div class="lf-row"><img class="rodic" src="baits/b${i}.webp" alt="" style="border-radius:12px"><div class="t"><b>${b.n}</b>　${b.p} 幣／10 份${d.bait[i]?`｜有 ${d.bait[i]} 份`:""}<br><small>${b.d}</small></div><button class="primary" data-act="lfBait" data-v="${i}">買</button></div>`).join(""); }
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
const energy=n=>{ bag.en=Math.min(enMax(),(bag.en??100)+n); save(); try{ SHOPX&&SHOPX.wallet&&SHOPX.wallet(); }catch(e){} };
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
L.more=k=>{ if(k==="tw:goddess"){ goddess(); return true; } if(k==="tw:camp"){ camp(); return true; } if(k==="tw:cafe"){ cafe(); return true; } if(k==="tw:lounge"){ try{ const taken=new Set(); remotes.forEach(r=>taken.add(r.seat)); const L=(TOWNX.lounge||[]).filter(i=>!taken.has(i)).sort((a,b)=>Math.hypot(SEATS[a].x-meAv.pos.x,SEATS[a].y-meAv.pos.y)-Math.hypot(SEATS[b].x-meAv.pos.x,SEATS[b].y-meAv.pos.y)); if(!L.length){ toast("躺椅都有人躺了",2000); return true; } meAv.path=[]; meAv.sitAt(L[0]); { const S0=SEATS[L[0]]; if(Math.hypot(S0.x-meAv.pos.x,S0.y-meAv.pos.y)<8) meAv.pos.copy(S0); } /* (the loungers stand in each other's way: step straight onto it) */ toast("🏖️ 躺在躺椅上，聽著一波一波的海浪……",2800); }catch(e){ console.warn(e); } return true; } return L.more2?L.more2(k):false; };

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
/* townsfolk faces: no two-dot (nostril) or pig noses — they read as two dots on the small faces (主委 11/14) */
function npcLook(l){ const o=sanitizeLook(l.slice()); if(o[13]===8||o[13]===5) o[13]=1; return o; }
/* an older face (wrinkles, eye bags, smile lines, white eyebrows) drawn over the usual face, and pure white hair — 許伯 (主委 11/14) */
function agedFace(av,look,o){ try{ o=o||{}; const hm=av.head&&av.head.children.find(q=>q.isMesh); if(hm&&o.old){ const base=faceTexture(look).image, W=base.width, H=base.height; const tex=cvs(W,H,x=>{ x.drawImage(base,0,0); x.scale(W/512,H/256); const cx=128, ey=140; x.lineCap="round";
    x.strokeStyle="rgba(110,64,40,.5)"; x.lineWidth=2.2; for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(cx-30+i*3,ey-44-i*9); x.quadraticCurveTo(cx,ey-50-i*9,cx+30-i*3,ey-44-i*9); x.stroke(); }
    for(const s of [-1,1]){ for(let i=0;i<3;i++){ x.beginPath(); x.moveTo(cx+s*50,ey-6+i*6); x.lineTo(cx+s*60,ey-9+i*8); x.stroke(); }
      x.beginPath(); x.moveTo(cx+s*30,ey+10); x.quadraticCurveTo(cx+s*24,ey+15,cx+s*16,ey+12); x.stroke();
      x.beginPath(); x.moveTo(cx+s*15,ey+16); x.quadraticCurveTo(cx+s*24,ey+30,cx+s*20,ey+44); x.stroke(); }
    x.strokeStyle="#f4f2ec"; x.lineWidth=7; for(const s of [-1,1]){ x.beginPath(); x.moveTo(cx+s*13,ey-22); x.quadraticCurveTo(cx+s*26,ey-30,cx+s*40,ey-20); x.stroke(); } });
    hm.material=new T.MeshStandardMaterial({map:tex,roughness:.7}); }
  if(o.white){ const hc=new T.Color(HAIRC[look[2]]); av.root.traverse(q=>{ if(q.isMesh&&q!==hm&&q.material&&q.material.color&&q.material.color.equals(hc)){ q.material=q.material.clone(); q.material.color.set("#fbfaf7"); q.material.emissive&&q.material.emissive.set("#3a3a38"); } }); } }catch(e){ console.warn("agedFace",e); } }
function npcMake(n){ const look=npcLook(n.look); const av=new Avatar(look,{npc:true,x:n.home[0],z:n.home[1]}); av.isMe=true; try{ av.setLook(look); }finally{ av.isMe=false; } av.setName(n.n); av.moveSpeed=n.sp;
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
  salonOpen("h",`${rows(25,30,"男生款")}${rows(30,35,"女生款")}<p class="note">髮色在「換裝」裡可以另外換。</p>`); }
function beauty(){ const sec=(i,lo,cnt,P,k,lab,names)=>`<h4 style="margin:10px 0 4px">${lab}</h4>`+[...Array(cnt)].map((_,j)=>{ const n=lo+j, own=owned2(k,j), on=me.look[i]===n; return `<div class="lf-row"><div class="t"><b>${names[n].replace("💄 ","")}</b>　${own?"<small>已擁有</small>":P[j]+" 幣"}</div><button class="secondary" data-act="lfTry" data-v="${i}:${n}">試試看</button>${own?`<button class="primary" data-act="lfWear" data-v="${i}:${n}" ${on?"disabled":""}>${on?"現在的":"換上"}</button>`:`<button class="primary" data-act="lfBuy" data-v="${i}:${n}">買</button>`}</div>`; }).join("");
  salonOpen("f",`${sec(7,15,10,EP,"e","眼睛",EYES)}${sec(13,1,10,NP,"n","鼻子",NOSES)}${sec(9,4,10,MP,"m","嘴巴",MOUTHS)}<p class="note">買過的在「換裝」的臉部也能換。想拿掉鼻子：換裝裡選「無」。</p>`); }
/* 美容院 (11/14: the barber and the beauty salon are one shop now): hair and face on two tabs */
function salonOpen(tab,body){ openSheet("lfSalon","💇 美容院",`<p class="lead">設計師：「您好，請問有預約、有指定設計師嗎？」</p><div class="row" style="margin-bottom:6px"><button class="${tab==="h"?"primary":"secondary"}" data-act="lfSalon" data-v="h">✂️ 髮型</button><button class="${tab==="f"?"primary":"secondary"}" data-act="lfSalon" data-v="f">💄 五官</button></div>${body}`); }
HANDLERS.lfSalon=v=>v==="f"?beauty():barber();
const slotOf=(i,n)=>i===1?["h",n-25,HP]:i===7?["e",n-15,EP]:i===13?["n",n-1,NP]:["m",n-4,MP];
HANDLERS.lfTry=v=>{ const [i,n]=v.split(":").map(Number); tryOn(i,n); toast("試試看：關掉面板就會換回原本的樣子",2000); };
HANDLERS.lfWear=v=>{ const [i,n]=v.split(":").map(Number); wearNow(i,n); i===1?barber():beauty(); };
HANDLERS.lfBuy=v=>{ const [i,n]=v.split(":").map(Number), [k,j,P]=slotOf(i,n), o=OWN(); if(owned2(k,j)) return; if(bag.coins<P[j]&&!me.sp){ try{ buzz(); }catch(e){} toast(`平安幣不夠（還差 ${P[j]-bag.coins}）`,2400); return; } if(!me.sp) bag.coins-=P[j]; o[k]=(o[k]|0)|(1<<j); save(); try{ chaChing(); statInc("lfBuy"+k); }catch(e){} wearNow(i,n); toast("換好了！好看喔",2200); i===1?barber():beauty(); };
L.tick3=dt=>{ if(PV&&sheetKind!=="lfSalon") endTry(); if(L.tick4) L.tick4(dt); };
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
L.more3=k=>{ if(k==="tw:ice"&&!L.games){ openSheet("lfIce","🍦 擠冰淇淋",`<p class="lead">「來試試看能疊幾層！」</p><div class="row"><button class="primary" data-act="lfIce">玩一次（${PLAY} 幣）</button></div><p class="note">每天前 10 次（兩個攤位合計）有平安幣獎勵。</p>`); return true; }
  if(k==="tw:herb"&&!L.games){ openSheet("lfHerb","🌿 中藥對對碰",`<p class="lead">中藥行阿嬤：「認得這些藥材嗎？來玩玩看。」</p><div class="row"><button class="primary" data-act="lfHerb">玩一次（${PLAY} 幣）</button></div><p class="note">每天前 10 次（兩個攤位合計）有平安幣獎勵。</p>`); return true; }
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
  /* 11/14 (the chair): the fallen piece is a glowing golden star, shedding golden sparks, under a golden beam of light */
  const sh=new T.Shape(); for(let k=0;k<10;k++){ const a=k*Math.PI/5, r=k%2?.15:.36; if(k) sh.lineTo(Math.sin(a)*r,Math.cos(a)*r); else sh.moveTo(0,r); } const sg=new T.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:true,bevelSize:.04,bevelThickness:.05,bevelSegments:2}); sg.center();
  const rock=new T.Mesh(sg,new T.MeshStandardMaterial({color:"#ffd34a",emissive:"#ffb81a",emissiveIntensity:1.6,roughness:.25,metalness:.6,toneMapped:false})); rock.position.set(m.x,y+.6,m.z); g.add(rock);
  const beam=new T.Mesh(new T.CylinderGeometry(.35,.9,60,16,1,true),new T.MeshBasicMaterial({color:"#ffd060",transparent:true,opacity:.28,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false})); beam.position.set(m.x,y+30,m.z); g.add(beam);
  const glow=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:new T.Color("#ffcc40"),transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false})); glow.scale.set(3.4,3.4,1); glow.position.set(m.x,y+.6,m.z); g.add(glow);
  const N=40, P=new Float32Array(N*3), ph=[]; for(let i=0;i<N;i++){ ph.push([Math.random()*6.28,.3+Math.random()*1.1,Math.random()]); }
  const pg=new T.BufferGeometry(); pg.setAttribute("position",new T.BufferAttribute(P,3)); const sp=new T.Points(pg,new T.PointsMaterial({map:glowTex,color:"#ffd34a",size:.28,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false})); sp.frustumCulled=false; g.add(sp); sp.userData.ph=ph; sp.userData.c=[m.x,y,m.z];
  const streak=new T.Mesh(new T.CylinderGeometry(.05,.5,14,8,1,true),new T.MeshBasicMaterial({color:"#fff6d8",transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false})); g.add(streak);
  return {g,rock,beam,glow,streak,y,sp}; }
function metFree(){ if(!MET) return; scene.remove(MET.o.g); MET.o.g.traverse(q=>{ if(q.geometry) q.geometry.dispose(); if(q.material) q.material.dispose(); }); MET=null; }
let metChip=null, metT=0;
function meteorTick(dt){ metT-=dt; if(metT<=0){ metT=1; const now=Date.now(); let m=meteorOf(curD()); if(L.testMet) m=L.testMet; L.starNight=!!(m&&now>=m.at&&now<m.end);
    if(m&&now>=m.at-4000&&now<m.end){ if(!MET||MET.m.id!==m.id){ metFree(); MET={m,o:metMake(m),t:(now-m.at)/1000,got:!!(LF().met&&LF().met[m.id])}; if(now<m.at+60000){ setTimeout(()=>{ try{ toast(`🌠 流星掉到「${m.nm}」了！第一個找到的人有特別的獎勵！`,4200); [1568,1319,1047,784].forEach((f,k)=>tone(f,.25,.04,"sine",k*.12)); }catch(e){} },Math.max(0,m.at-now+2600)); } } }
    else if(MET) metFree(); }
  if(!MET) return; const M=MET, o=M.o; M.t+=dt; const k=Math.min(1,Math.max(0,(M.t+4)/3)); /* the fall: from high in the sky down to its spot over 3 s */
  const sx=M.m.x-60, sy=70, sz=M.m.z+40; if(k<1){ const x=sx+(M.m.x-sx)*k, y=sy+(o.y-sy)*k, z=sz+(M.m.z-sz)*k; o.streak.visible=true; o.streak.position.set(x,y,z); o.streak.lookAt(M.m.x,o.y,M.m.z); o.streak.rotateX(Math.PI/2); o.rock.visible=false; o.beam.visible=false; o.glow.visible=false; return; }
  o.streak.visible=false; o.rock.visible=!M.got; o.glow.visible=!M.got; o.beam.visible=!M.got; o.rock.rotation.y+=dt*1.4; o.rock.position.y=o.y+.6+Math.sin(M.t*2)*.08; if(o.sp){ o.sp.visible=!M.got; const P=o.sp.geometry.attributes.position.array, c=o.sp.userData.c; o.sp.userData.ph.forEach((q,i)=>{ const f=(M.t*.35+q[2])%1, a=q[0]+M.t*.6; P[i*3]=c[0]+Math.cos(a)*q[1]*(1-f*.5); P[i*3+1]=c[1]+.3+f*3.2; P[i*3+2]=c[2]+Math.sin(a)*q[1]*(1-f*.5); }); o.sp.geometry.attributes.position.needsUpdate=true; } o.beam.material.opacity=.18+.1*Math.sin(M.t*3); o.glow.material.opacity=.7+.3*Math.sin(M.t*4);
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
const GTX={}; function GTEX(id,st){ const k=id+"-"+st; if(!GTX[k]){ const t=new T.TextureLoader().load(MZIMG("garden/"+k+".webp")); t.encoding=T.sRGBEncoding; GTX[k]=t; } return GTX[k]; }
function gardenOpen(){ if(!SHOPX||!SHOPX.enter) return; const S=new T.Scene(); S.background=new T.Color("#9fd4f5").convertSRGBToLinear(); S.add(new T.HemisphereLight("#fff6e0","#4a6a3a",.5)); const sun=new T.DirectionalLight("#fff2d8",.55); sun.position.set(4,8,5); S.add(sun);
  const M=(c,o)=>{ const m=new T.MeshStandardMaterial(Object.assign({color:c,roughness:.9},o||{})); m.color.convertSRGBToLinear(); return m; }; const add=(geo,m,x,y,z)=>{ const o=new T.Mesh(geo,m); o.position.set(x,y,z); S.add(o); return o; };
  const grass=add(new T.PlaneGeometry(30,30),M("#8fd06a"),0,0,0); grass.rotation.x=-Math.PI/2;
  /* 11/14 晚上 (the chair): inside you see only the lawn and the beds — no greenhouse frame, no shed, no trees. The beds are the chair's soil
     picture, and the plants are the chair's growth pictures (public/garden/<crop>-<stage>.webp), standing up facing you. */
  const soilT=new T.TextureLoader().load(MZIMG("garden/soil.webp")); soilT.encoding=T.sRGBEncoding; soilT.anisotropy=4;
  for(let i=0;i<70;i++){ const a=Math.random()*6.283, d=7.2+Math.random()*7; const t=add(new T.ConeGeometry(.06,.22+Math.random()*.15,4),M(["#6fbf4a","#7fcf5a","#5aa840"][i%3]),Math.cos(a)*d,.1,Math.sin(a)*d); t.rotation.z=(Math.random()-.5)*.4; } /* a few grass tufts */
  const beds=[]; for(let i=0;i<12;i++){ const cx=-3.9+(i%4)*2.6, cz=-2.6+Math.floor(i/4)*2.6; const soil=add(new T.BoxGeometry(2.1,.22,2.1),M("#8a6038"),cx,.11,cz); const tm=M("#ffffff"); tm.map=soilT; const top=add(new T.BoxGeometry(1.9,.04,1.9),tm,cx,.24,cz); const g=new T.Group(); g.position.set(cx,.26,cz); S.add(g); beds.push({cx,cz,soil,top,g}); }
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
  const paint=()=>{ const now=Date.now(); beds.forEach((B,i)=>{ while(B.g.children.length){ const c=B.g.children[0]; B.g.remove(c); if(!c.isSprite) c.geometry.dispose(); c.material.dispose(); } const b=D.beds[i]; grow(b,now); B.top.material.color.set(b&&b.w?"#9a8a80":"#ffffff").convertSRGBToLinear(); if(!b) return; const st=stage(b), S2=SB[b.s], col=S2[6];
      const sp=new T.Sprite(new T.SpriteMaterial({map:GTEX(b.s,st),transparent:true,alphaTest:.3})); const sz=[.95,1.25,1.55,1.75][st]; sp.scale.set(sz,sz,1); sp.center.set(.5,.08); sp.position.set(0,.02,.15); B.g.add(sp); }); };
  paint(); draw();
  const ray=new T.Raycaster(), v2=new T.Vector2(); const tl=el.querySelector(".shx-touch"); let yaw=0, drag=null;
  tl.addEventListener("pointerdown",e=>{ drag={x:e.clientX,y0:yaw,mv:0}; }); tl.addEventListener("pointermove",e=>{ if(!drag) return; drag.mv=Math.max(drag.mv,Math.abs(e.clientX-drag.x)); if(drag.mv>8) yaw=Math.max(-.7,Math.min(.7,drag.y0-(e.clientX-drag.x)*.006)); });
  tl.addEventListener("pointerup",e=>{ const d=drag; drag=null; if(!d||d.mv>8) return; v2.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1); ray.setFromCamera(v2,cam); const hits=ray.intersectObjects(beds.flatMap(B=>[B.soil,B.top]),false); if(hits.length){ sel=beds.findIndex(B=>B.soil===hits[0].object||B.top===hits[0].object); try{ tone(700,.04,.04,"triangle"); }catch(err){} draw(); } });
  $g("#gX").onclick=()=>SHOPX.leave(); let tt=0;
  o.update=dt=>{ tt+=dt; for(let i=drops.length-1;i>=0;i--){ const q=drops[i]; q.v+=dt*9; q.m.position.y-=q.v*dt; if(q.m.position.y<.3){ S.remove(q.m); q.m.geometry.dispose(); q.m.material.dispose(); drops.splice(i,1); } } if(tt>5){ tt=0; paint(); if(sel>=0) draw(); } };
  o.render=dt=>{ const asp=innerWidth/innerHeight; cam.aspect=asp; const ph=Math.min(.55,(($g("#gP").offsetHeight||200))/innerHeight); const d=Math.max(16,9/asp); cam.position.set(Math.sin(yaw)*d,d*.85,Math.cos(yaw)*d); cam.lookAt(0,-ph*d*.55,0); cam.updateProjectionMatrix(); renderer.render(S,cam); };
  o.dispose=()=>{ S.traverse(q=>{ if(q.geometry) q.geometry.dispose(); if(q.material) q.material.dispose(); }); save(); try{ profSave(true); }catch(e){} }; }
/* ---------- 店家老闆 (11/14): every shop has its own people standing at the door with a little counter. Tapping the shop plays a short
   scene — the tackle man hums and fiddles with a rod, the furniture lady dozes and wakes with a start, the breakfast couple bicker — in
   bubbles with a babbling voice pitched for each person (old men low and slow, girls high and quick; a question rises, a shout is
   louder), then the shop's panel or game opens. The full scene plays when you haven't been in for a while; otherwise a quick hello. ---------- */
const babble=(d,p)=>{ try{ if(window.MZ_BABBLE) window.MZ_BABBLE(d,p); }catch(e){} }; /* the shops module's talking sound (it is not reachable by name from here) */
const KV={oldm:{p:.66,r:.9},man:{p:.82,r:1},woman:{p:1.18,r:1},oldw:{p:1.02,r:.9},girl:{p:1.38,r:1.15},boy:{p:1.12,r:1.1}};
const KEEP={
 "tw:tackle":{ppl:[{n:"阿財伯",v:"oldm",look:[2,18,2,8,1,2,4,7,0,1,0,2,0,1],sh:{leg:.94,tor:1.02,w:1.12,d:1.1,head:1,arm:1},rod:1}],mode:"hum",openAt:0,
   lines:[[0,"♪～竿子要彈、線要韌，耐心等魚來咬～♪"],[0,"喔！少年仔來啦？竿子、餌都在這，自己挑！"]],quick:[[0,"♪～今天魚會咬喔～♪"]]},
 "tw:furn":{ppl:[{n:"美雲姐",v:"woman",look:[0,14,1,11,7,1,0,0,0,2,1,0,3,2],sh:{leg:.94,tor:.98,w:1.16,d:1.12,head:1,arm:.96}}],mode:"doze",
   lines:[[0,"呼……呼……zzZ"],["wake"],[0,"！！！"],[0,"啊、啊！歡迎光臨！我、我沒有在睡喔！"]],quick:[[0,"歡迎光臨～慢慢看喔！"]]},
 "tw:bfast":{ppl:[{n:"阿龍老闆",v:"man",look:[1,13,0,11,2,3,12,2,0,3,0,0,0,1],sh:{leg:1.02,tor:1.06,w:1.2,d:1.16,head:1,arm:1.04}},{n:"秀琴老闆娘",v:"woman",look:[0,22,1,11,3,4,2,1,1,4,1,0,0,2],sh:{leg:.92,tor:.96,w:1.08,d:1.04,head:1,arm:.96}}],mode:"argue",
   fights:[[[0,"剛剛就說要大冰奶！你做快一點啦，人家等很久了！"],[1,"我就說是蘿蔔糕啊！你自己聽錯還怪我！"]],[[1,"鐵板上的蛋都焦了啦！"],[0,"是妳一直叫我去拿吐司啊！"]],[[0,"火腿蛋吐司不要美乃滋，妳又加了！"],[1,"客人說『要』美乃滋！耳朵拿去洗啦！"]],
     [[1,"豆漿是溫的還是冰的啦？"],[0,"單子上寫『溫』！妳寫的字只有妳自己看得懂！"]],[[0,"鐵板麵要黑胡椒還是蘑菇？"],[1,"兩個都要！他剛剛講過三次了啦！"]],[[1,"你又把奶茶做成全糖！"],[0,"單子上畫一個圈，誰知道是全糖還是無糖！"]],
     [[0,"蛋餅要加起司還是玉米？"],[1,"起司玉米！起司玉米！我喊到喉嚨都啞了！"]],[[1,"外帶的袋子又不夠了啦！"],[0,"昨天叫妳叫貨，妳說『好好好』！"]]],
   end:[[-1,"你！要不要來幫忙！？當然我們會給你報酬！"]],quick:[[-1,"來來來，幫忙疊漢堡！"]]},
 "tw:herb":{ppl:[{n:"許伯",v:"oldm",old:1,white:1,look:[0,18,5,0,1,0,0,7,0,1,0,1,0,1],sh:{leg:.86,tor:.92,w:.96,d:.96,head:1,arm:.94},hunch:.18}],mode:"squint",
   lines:[[0,"嗯……嗯？"],[0,"年輕人，我眼睛看不太清楚，你能不能幫我一起分類這些藥材呢？"]],quick:[[0,"喔，是你啊，又來幫忙啦？"]]},
 "tw:book":{ppl:[{n:"文雄老闆",v:"man",look:[0,26,0,13,6,2,0,0,0,1,0,1,1,1],sh:{leg:1.14,tor:1.06,w:.9,d:.9,head:.98,arm:1.08}}],mode:"stuck",
   lines:[[0,"欸欸，等一下……"],[0,"最近書進貨太多了，我的書架亂七八糟，我都出不去了……能不能幫我一起整理一下呢？"]],quick:[[0,"書架又塞住了，拜託你啦！"]]},
 "tw:ice":{ppl:[{n:"冰淇淋奶奶",v:"oldw",look:[0,22,5,11,7,1,0,1,0,2,1,0,0,1],sh:{leg:.8,tor:.88,w:1.06,d:1.04,head:1.02,arm:.92}}],mode:"wave",spot:{x:38,z:-99.3,ry:0},
   lines:[[0,"小朋友，你要不要來試試看超巨～～～～～～～～～～大冰淇淋呀？加量不加價唷！"]],quick:[[0,"又來啦？今天也要擠得高高的喔！"]]},
 "tw:congee":{ppl:[{n:"玲姊",v:"woman",look:[1,14,1,11,3,2,2,0,0,3,1,0,0,2],sh:{leg:.9,tor:.96,w:1.14,d:1.1,head:1,arm:.98}},{n:"君君",v:"girl",look:[0,5,0,4,5,3,0,1,0,2,1,0,0,1],sh:{leg:1.04,tor:.98,w:.9,d:.9,head:1.02,arm:1}}],mode:"panic",
   lines:[[0,"糟糕了糟糕了……"],[1,"玲姊，三桌又在喊了啦！"],[-1,"@NAME！你能不能來幫我們記菜單？照分數給你錢喔！"]],quick:[[-1,"@NAME！又滿桌了，快來幫我們記！"]]},
 "tw:flower":{ppl:[{n:"雅琪店長",v:"woman",look:[0,23,0,14,7,3,15,15,1,4,1,3,0,2],sh:{leg:1.12,tor:1.04,w:.88,d:.88,head:.98,arm:1.06}}],mode:"grace",
   lines:[[0,"啊，工讀生來啦！今天訂單有點多喔。"]],quick:[[0,"來啦～今天也麻煩你囉！"]]},
 "tw:drink":{ppl:[{n:"小安",v:"girl",look:[0,5,11,3,5,3,4,2,0,3,0,0,0,1],sh:{leg:1.02,tor:.98,w:.92,d:.92,head:1.04,arm:1}},{n:"阿哲",v:"boy",look:[1,25,0,3,5,3,4,1,0,2,0,6,0,1],sh:{leg:1.08,tor:1.02,w:1,d:.98,head:1,arm:1.02}}],mode:"cheer",
   lines:[[-1,"歡迎光臨！珍奶第二杯半價喔！"],[-1,"要不要加入我們的工作行列啊？當然老闆會給薪水的！"]],quick:[[-1,"歡迎光臨～！"]]},
 "tw:beauty":{ppl:[{n:"設計師 Kevin",v:"man",look:[0,27,9,1,0,5,0,10,0,3,0,0,2,1],sh:{leg:1.12,tor:1.04,w:.92,d:.9,head:.98,arm:1.04}}],mode:"pose",
   lines:[[0,"您好，請問有預約、有指定設計師嗎？"]],quick:[[0,"今天想換什麼風格呢？"]]},
};
const KS={}; /* the keepers standing at their shops: key → {avs, spot, t, mode, until, last} */
function keepSpot(k){ const K=KEEP[k]; if(K.spot) return K.spot; const b=TOWNX&&TOWNX.bOf?TOWNX.bOf(k):null; if(!b) return null; const fx=Math.sin(b.ry), fz=Math.cos(b.ry); return {x:b.x+fx*.35,z:b.z+fz*.35,ry:b.ry,fx,fz,shop:1}; }
function keepMake(k){ const K=KEEP[k], sp=keepSpot(k); if(!sp) return null; const n=K.ppl.length, px=Math.cos(sp.ry), pz=-Math.sin(sp.ry), avs=[];
  K.ppl.forEach((P,i)=>{ const off=n>1?(i-(n-1)/2)*1.1:0, x=sp.x+px*off, z=sp.z+pz*off; const look=npcLook(P.look); const av=new Avatar(look,{npc:true,x,z,r:sp.ry}); av.isMe=true; try{ av.setLook(look); }finally{ av.isMe=false; } av.setName(P.n); av.moveSpeed=0; av.rotY=sp.ry; av.faceGoal=sp.ry; bodyShape(av,P.sh);
    if(P.rod){ const r=new T.Mesh(new T.CylinderGeometry(.012,.02,1.3,6),new T.MeshStandardMaterial({color:"#6b4a2e",roughness:.6})); r.position.set(0,-.3,.35); r.rotation.x=1.1; av.arms[1].add(r); }
    av._P=P; avs.push(av); });
  /* the counter in front of them (shops only) */ let ctr=null; if(sp.shop){ ctr=new T.Mesh(new T.BoxGeometry(Math.max(1.3,n*1.2),.92,.42),new T.MeshStandardMaterial({color:"#8a5a3a",roughness:.7})); ctr.position.set(sp.x+sp.fx*.62,.46,sp.z+sp.fz*.62); ctr.rotation.y=sp.ry; scene.add(ctr); }
  return KS[k]={avs,sp,ctr,t:0,mode:K.mode,step:-1,last:0,busy:false}; }
function keepDrop(k){ const S=KS[k]; if(!S) return; S.avs.forEach(av=>{ try{ scene.remove(av.root); av.dispose&&av.dispose(); }catch(e){} }); if(S.ctr){ scene.remove(S.ctr); S.ctr.geometry.dispose(); } delete KS[k]; }
/* talk: the bubble and a babble pitched for the speaker; "？" rises at the end, "！" is louder and higher */
function keepSay(av,text,secs){ const P=av._P||{}, V=KV[P.v]||KV.man; text=text.replace(/@NAME/g,me.name||"你"); av.say(text,"#ffe2a0",secs||Math.min(6,1.6+text.length*.12));
  const ex=/[！!]/.test(text), q=/[？?]$/.test(text); try{ babble(Math.min(2.4,.35+text.length*.09/V.r),V.p*(ex?1.12:1)); if(q){ const f=420*V.p; setTimeout(()=>{ try{ tone(f,.12,.05,"triangle"); tone(f*1.3,.14,.05,"triangle",.1); }catch(e){} },Math.min(2200,text.length*80)); } }catch(e){} }
/* the scene: a list of [who, text] (who −1 = everyone together, "wake" = the start), one after another; open the shop at openAt or at the end */
L.keeper=(k,open)=>{ const K=KEEP[k]; if(!K) return false; const S=KS[k]||keepMake(k); const go=()=>{ try{ (K.go||(()=>open&&open()))(); }catch(e){ console.warn(e); } };
  if(!S){ go(); return true; } if(S.busy){ go(); return true; } /* (tapping again during the scene skips to the shop) */
  const full=Date.now()-S.last>180e3; S.last=Date.now(); let lines=full?(K.fights?[...K.fights[(Math.random()*K.fights.length)|0],...K.end]:K.lines):K.quick; const openAt=full&&K.openAt!=null?K.openAt:lines.length;
  S.busy=true; S.mode=K.mode; S.t=0; S.woke=0; let i=0;
  const next=()=>{ if(KS[k]!==S) return; if(i===openAt) go(); if(i>=lines.length){ S.busy=false; S.mode=K.mode==="doze"?"idle":K.mode; return; } const [w,text]=lines[i++];
    if(w==="wake"){ S.mode="wake"; S.t=0; try{ tone(880,.08,.06,"square"); }catch(e){} setTimeout(next,700); return; }
    const who=w===-1?S.avs:[S.avs[w]]; who.forEach(av=>keepSay(av,text)); if(K.mode==="argue"&&w>=0){ S.spk=w; } setTimeout(next,Math.min(3400,900+text.length*95)); };
  next(); return true; };
/* little body language, every frame, after the avatar's own update */
function keepTick(dt){ const p=meAv.pos; for(const k in KS){ const S=KS[k]; if(Math.hypot(p.x-S.sp.x,p.y-S.sp.z)>70){ keepDrop(k); continue; } S.t+=dt; const t=S.t;
    S.avs.forEach((av,i)=>{ if(av._out){ try{ av.update(dt); }catch(e){} return; } /* (out walking: just walk) */ av.pos.set(av.root.position.x,av.root.position.z); av.target.copy(av.pos); try{ av.update(dt); }catch(e){} const H=av.head, A=av.arms, P=av._P||{};
      if(P.hunch) av.torso.rotation.x+=P.hunch;
      switch(S.mode){
        case "hum": H.rotation.z=Math.sin(t*3)*.16; A[1].rotation.x=-.9+Math.sin(t*2.2)*.25; A[1].rotation.z=Math.sin(t*1.7)*.12; break;
        case "doze": H.rotation.x=.42+Math.sin(t*1.4)*.1; H.rotation.z=Math.sin(t*.7)*.08; if(Math.random()<dt*.5) av.say("zzZ","#cfe3ff",1.2); break;
        case "wake": { const k2=Math.min(1,t/.5); av.lift&&(av.lift.position.y=(av._ly??(av._ly=av.lift.position.y))+Math.sin(k2*Math.PI)*.18); H.rotation.x=-.2*(1-k2); A[0].rotation.z=-1.2*Math.sin(k2*Math.PI); A[1].rotation.z=1.2*Math.sin(k2*Math.PI); if(t>.6) S.mode="idle"; break; }
        case "argue": { const me2=S.spk===i; const o=S.avs[1-i]; if(o){ const yaw=Math.atan2(o.root.position.x-av.root.position.x,o.root.position.z-av.root.position.z); av.root.rotation.y=yaw; } if(me2){ A[0].rotation.x=-1.2+Math.sin(t*9)*.4; A[1].rotation.z=.4+Math.sin(t*7)*.3; H.rotation.x=Math.sin(t*10)*.08; } else { A[0].rotation.z=-.5; A[1].rotation.z=.5; } break; }
        case "squint": H.rotation.x=-.12; H.rotation.y=Math.sin(t*.8)*.3; break;
        case "stuck": A[0].rotation.x=-2.6+Math.sin(t*6)*.2; A[1].rotation.x=-2.6+Math.cos(t*6)*.2; H.rotation.z=Math.sin(t*2)*.1; break;
        case "wave": A[1].rotation.z=2.3+Math.sin(t*7)*.35; H.rotation.z=Math.sin(t*2)*.08; break;
        case "panic": H.rotation.y=Math.sin(t*4)*.5; A[0].rotation.x=-1.5+Math.sin(t*8)*.3; A[1].rotation.x=-1.5+Math.cos(t*8)*.3; break;
        case "grace": H.rotation.z=.08+Math.sin(t*.9)*.05; A[0].rotation.x=-.5; A[0].rotation.z=.4; A[1].rotation.x=-.5; A[1].rotation.z=-.4; break;
        case "cheer": { const hop=Math.abs(Math.sin(t*5+i)); av.lift&&(av.lift.position.y=(av._ly??(av._ly=av.lift.position.y))+hop*.08); A[i?0:1].rotation.z=(i?-1:1)*(2.4+Math.sin(t*10)*.3); break; }
        case "pose": H.rotation.z=-.1; A[1].rotation.x=-1.9; A[1].rotation.z=.6; break;
        default: H.rotation.x=Math.sin(t*.6)*.04; } });
    if(S.mode!=="argue") S.avs.forEach(av=>{ if(!av._out) av.root.rotation.y=S.sp.ry; }); } }
/* spawn the keepers of shops near you (so the street looks lived in) */
L.openNow=k=>{ try{ return isOpen(k); }catch(e){ return true; } }; L.keepers=()=>KS; L.isOpen=k=>{ try{ return TM.on||isOpen(k); }catch(e){ return true; } }; L.starTube=(...a)=>starTube(...a);
/* ---------- 🧪 主委測試模式: one page with everything to try in the latest version. Add a section here with every new version. ---------- */
const TP_SHOPS=[["tw:bfast","元氣早餐店"],["tw:congee","一粥七天"],["tw:herb","中藥行"],["tw:tackle","釣具行"],["tw:furn","家具行"],["tw:book","書店"],["tw:drink","飲料店"],["tw:flower","花店"],["tw:photo","照相館"],["tw:beauty","美容院"],["tw:ice","擠冰淇淋"]];
L.testPanel=()=>{ if(!me.sp) return; const b=(act,v,t,cls)=>`<button class="${cls||"secondary"}" style="flex:none;width:auto;min-height:0;padding:8px 12px;font-size:14px;margin:3px" data-act="${act}" data-v="${v}">${t}</button>`;
  const hr=TM.hour, hrs=[-1,6,9,12,15,18,21,0,3];
  openSheet("tmode","🧪 測試模式",`<p class="lead">只有主委看得到。重新整理就會關掉，不會存檔。</p>
   <div class="row" style="margin:6px 0">${b("tmOn",TM.on?0:1,TM.on?"✅ 測試模式開著（點一下關）":"⬜ 開啟測試模式",TM.on?"primary":"secondary")}</div>
   <p class="note">開著時：店家不管營業時間都能進、小遊戲沒有每日次數限制。關掉時主委也跟一般玩家一樣。</p>
   <h4 style="margin:10px 0 4px">店家時鐘（決定開不開門）</h4><div>${hrs.map(h=>b("tmHour",h,h<0?"真實時間":h+" 點",(h<0&&hr==null)||h===hr?"primary":"secondary")).join("")}</div>
   <p class="note">現在：${hr==null?"真實時間":hr+" 點"}。各店營業時間：${Object.keys(HOURS).map(k=>`${(TP_SHOPS.find(q=>q[0]===k)||[0,k])[1]} ${hrs_(k)}`).join("、")}</p>
   <h4 style="margin:10px 0 4px">傳送／進店</h4><div>${b("tmGo","town","🏮 小鎮鎮口")}${b("tmGo","zen","🧘 禪房裡（測走出來會不會卡）")}${b("tmGo","temple","⛩️ 廟前")}</div><div>${TP_SHOPS.map(([k,n])=>b("tmShop",k,n)).join("")}</div>
   <h4 style="margin:10px 0 4px">直接玩（不用找店）</h4><div>${[["tw:bfast","🍔 疊漢堡"],["tw:ice","🍦 冰淇淋"],["tw:herb","🌿 中藥對對碰"],["tw:congee","🥣 記菜單"],["tw:drink","🧋 調飲料"],["tw:book","📚 推書櫃"],["tw:flower","💐 插花"]].map(([k,n])=>b("tmGame",k,n)).join("")}</div>
   <h4 style="margin:10px 0 4px">這次改版（11/14）</h4><div>${b("tmRods",1,"🎣 拿到全部 12 支釣竿")}${b("tmRain",1,"🧧 撒紅包＋假人來搶")}</div><h4 style="margin:10px 0 4px">這次改版（11/14 下午）</h4><div>${b("tmIceDrink",1,"🧋 飲料：一定會加冰（看 3 秒提示和藍線）")}${b("tmGo","town","🏠 看屋頂（人字屋頂變少）")}${b("tmGame","tw:ice","🍦 新冰淇淋（照錄影重做）")}${b("tmBait",1,"🪱 每種釣餌各 10 份＋全部釣竿")}${b("tmBait",0,"🪱 清空釣餌（測沒餌不能拋竿）")}</div><h4 style="margin:10px 0 4px">這次改版（11/14 晚上）</h4><div>${b("tmShop","tw:congee","🥣 一粥七天（新櫥窗、招牌）")}${b("tmShop","tw:tackle","🎣 釣具行（立體櫥窗、門）")}${b("tmGo","alley","🏚️ 收藏家小屋")}${b("tmGame","tw:herb","🌿 中藥對對碰（木桌＋碗）")}${b("tmMet",1,"🌠 流星（金色星星）")}</div><h4 style="margin:10px 0 4px">這次改版（11/14 晚上 2）</h4><div>${b("tmGo","beach","🏖️ 海邊（橋、躺椅、太陽、沒霧）")}${b("tmGo","garden","🌱 溫室花圃")}${b("tmGo","pier","🎣 車站旁的河（草皮不再跑出來）")}${b("tmNight",1,"🌙 變晚上（路燈）")}${b("tmNight",0,"☀️ 變白天")}</div><h4 style="margin:10px 0 4px">這次改版（11/14 晚上 3：魚模型）</h4><div>${b("tmFish",1,"🐟 下一隻新魚模型（每按一次換一隻）")}${b("tmDexAll",1,"📖 圖鑑全部點亮（看新圖示）")}</div><h4 style="margin:10px 0 4px">這次改版（11/14 晚上 4）</h4><div>${b("tmBq",1,"💐 花束打工（隨機一張訂單）")}${b("tmGo","furn","🛋️ 得意屋家具（招牌＋櫥窗）")}${b("tmHour",3,"🌙 時鐘撥到 3 點（店都關：招牌不亮、櫥窗暗）")}${b("tmHour",-1,"🕒 時鐘恢復")}${b("tmGo","garden","🌱 三間溫室")}${b("tmGarden",1,"🌱 花圃：每塊田放不同作物和階段")}${b("tmTown",1,"🔎 小鎮讀取狀態（缺一塊時按這個截圖給我）")}</div>`); };
HANDLERS.tmNight=v=>{ window.MZ_TOD=v==="1"?.7:.2; toast(v==="1"?"🌙 晚上":"☀️ 白天",1200); };
const NEWFISH=["clownfish","mahi","shark","tuna","sunfish","marlin","oarfish","mackerel","seabream","terapon","sardine","milkfish","saury","mullet","puffer","flounder","loach","eel","bighead","masu","sturgeon","medaka","angel","springkoi","goldscale","crucian","ayu","kuhua","hairtail","squid","seahorse","grouper","pomfret","redbream","amberjack","octopus"]; let nfI=0;
HANDLERS.tmFish=()=>{ closeSheet(); const id=NEWFISH[nfI++%NEWFISH.length]; try{ L.hold(id); toast("🐟 "+FBY[id].n+"（"+nfI+"/"+NEWFISH.length+"）",1800); }catch(e){ console.warn(e); } };
HANDLERS.tmDexAll=()=>{ const d=LF(); FISH.forEach(f=>{ if(!d.fish[f.id]) d.fish[f.id]=[1,f.sz[1],Date.now()]; }); dex(); };
HANDLERS.tmTown=()=>{ let t=""; try{ const X=TOWNX; t=`已載入：${(X.live?X.live():[]).join("、")}<br>錯誤：${(X.loadErr||[]).join("<br>")||"沒有"}<br>位置：${meAv.pos.x.toFixed(1)}, ${meAv.pos.y.toFixed(1)}`; }catch(e){ t="讀不到："+e.message; } openSheet("tmTown","🔎 小鎮讀取狀態",`<p class="note" style="word-break:break-all">${t}</p>`); };
HANDLERS.tmBq=()=>{ closeSheet(); bqGame(); };
HANDLERS.tmGarden=()=>{ closeSheet(); const D=GD2(), now=Date.now(); for(let i=0;i<12;i++){ const q=SEEDS[i%SEEDS.length]; D.beds[i]={s:q[0],p:[0,1,2,3][(i+Math.floor(i/7))%4],w:0,t:now}; } save(); gardenOpen(); };
HANDLERS.tmMet=()=>{ closeSheet(); try{ L.meteorTest(); }catch(e){ console.warn(e); } };
HANDLERS.tmBait=v=>{ const d=LF(); if(v==="1"){ d.rods=4095; BAITS.forEach((b,i)=>{ d.bait[i]=Math.max(d.bait[i]|0,10); }); toast("🪱 釣餌、釣竿都給你了。到水邊釣魚，左下角可以換竿換餌",3000); } else { d.bait=d.bait.map(()=>0); d.bF=0; d.bS=0; toast("釣餌清空了",1800); } save(); };
HANDLERS.tmIceDrink=()=>{ closeSheet(); window.MZ_DRINK_ICE=1; try{ drinkGame(); }finally{ window.MZ_DRINK_ICE=0; } };
const hrs_=k=>{ try{ return hrs(k); }catch(e){ return ""; } };
HANDLERS.tmOn=v=>{ TM.on=v==="1"; toast(TM.on?"🧪 測試模式開啟":"測試模式關閉",1600); L.testPanel(); };
HANDLERS.tmHour=v=>{ const h=+v; TM.hour=h<0?null:h; L.testPanel(); };
HANDLERS.tmGo=v=>{ closeSheet(); const P={furn:[34.5,-75.5],town:[28,-62],zen:[-30,-28],temple:[0,30],alley:[8.2,-86.5],beach:[148,-112],garden:[42,-120.5],pier:[28,-136.6],street:[60,-77]}[v]; if(P){ meAv.pos.set(P[0],P[1]); meAv.target.set(P[0],P[1]); meAv.path=[]; } };
HANDLERS.tmShop=v=>{ closeSheet(); const b=TOWNX&&TOWNX.bOf&&TOWNX.bOf(v); if(b){ const fx=b.x+Math.sin(b.ry)*2.2, fz=b.z+Math.cos(b.ry)*2.2; meAv.pos.set(fx,fz); meAv.target.set(fx,fz); meAv.path=[]; } setTimeout(()=>{ try{ openStation(v); }catch(e){ console.warn(e); } },b?900:50); };
HANDLERS.tmGame=v=>{ closeSheet(); try{ GL[v](); }catch(e){ console.warn(e); toast("這個遊戲還打不開",1800); } };
HANDLERS.tmRain=()=>{ closeSheet(); try{ hbStart({id:"test"+Date.now(),seed:(Math.random()*1e9)|0,n:24,x:meAv.pos.x,z:meAv.pos.y,at:Date.now()}); }catch(e){ console.warn(e); } };
HANDLERS.tmRods=()=>{ const d=LF(); d.rods=4095; save(); toast("🎣 12 支釣竿都給你了，到釣具行或水邊換著試",2600); }; L.rodModel=rodModel;
/* ---------- 走進店裡 (11/14, the chair: tapping the door changes the scene to inside the shop, then the window opens): a small room of its
   own — floor, walls, shelves in the shop's colours, a counter — with the shop's people behind the counter doing their thing; their
   lines come up in a box at the top, each with its babbling voice; then the shop's panel or game opens over it. Leaving (or closing
   everything) brings you back outside. ---------- */
const ROOMC={"tw:tackle":["#3f6a7a","#e8e2d2",["#4f86b8","#e8a530","#5f9a6a","#c0392b"]],"tw:furn":["#8a6a4a","#efe4d0",["#a8744a","#d9b48a","#7a5234","#c9a27a"]],"tw:bfast":["#e8a530","#fff4e0",["#f2c84a","#e86a3a","#f4ece0","#c98a4a"]],"tw:herb":["#6a4a2e","#e9dcc2",["#a8744a","#7a5234","#c9a27a","#8a5a3a"]],
 "tw:book":["#5a4a6a","#ece6da",["#4f86c9","#e8a530","#5f9a6a","#8a5ab0","#d9628a"]],"tw:ice":["#f2a6bf","#fff6f0",["#ffd6e2","#fff6e8","#c98a52","#9ad0e8"]],"tw:congee":["#a83a2a","#f6ead2",["#f4efe4","#c0392b","#e8c06a","#7a5a3a"]],"tw:flower":["#7fa88a","#f4f0e6",["#d6334a","#fbf6ee","#f6c22a","#8a5ac8","#f08aa8"]],
 "tw:drink":["#3fa8a0","#f2fbf8",["#a4512a","#c9c86a","#f1e3cf","#f2b23a"]],"tw:beauty":["#2a2a3a","#f2eef6",["#e8c0d0","#c8d4dc","#ffffff","#b9a0d9"]],"tw:photo":["#4a4038","#efe8dc",["#2a2a2a","#c9b48a","#8a7a6a","#e8e0d0"]]};
const IV={scene:null,cam:null,k:null,avs:[],deco:null,t:0,lines:null};
function ivBuild(k){ const C=ROOMC[k]||["#8a6a4a","#efe4d0",["#ccc"]], s=new T.Scene(); s.background=new T.Color(C[1]); s.add(new T.HemisphereLight("#fffaf2","#b8a890",.95)); const pl=new T.PointLight("#fff2dc",.9,14); pl.position.set(0,3,1.5); s.add(pl); const dl=new T.DirectionalLight("#ffffff",.5); dl.position.set(2,4,3); s.add(dl);
  const M=c=>new T.MeshStandardMaterial({color:c,roughness:.8}); const box=(w,h,d,c,x,y,z)=>{ const m=new T.Mesh(new T.BoxGeometry(w,h,d),M(c)); m.position.set(x,y,z); s.add(m); return m; };
  box(8,.1,6,"#b08a62",0,-.05,0); box(8,3.4,.1,C[1],0,1.7,-2.4); box(.1,3.4,6,C[1],-3.6,1.7,0); box(.1,3.4,6,C[1],3.6,1.7,0); box(8,.5,.12,C[0],0,3.2,-2.33); /* floor, walls, the shop-colour band */
  for(let r=0;r<3;r++){ box(5.6,.06,.4,"#8a6246",0,.6+r*.62,-2.15); for(let i=0;i<9;i++){ const c=C[2][(i+r)%C[2].length]; box(.28+((i*7+r)%3)*.08,.3+((i*3+r)%3)*.06,.26,c,-2.5+i*.62,.6+r*.62+.2,-2.12); } } /* shelves with goods */
  box(3.2,.5,.6,"#8a5a3a",0,.25,-.25); box(3.4,.06,.7,"#6b4a2e",0,.53,-.25); /* the counter (the people here are small) */
  /* the chair's picture of this shop as the back wall (11/14): it covers the plain shelves */ if(TOWNX&&TOWNX.SHOP_PIC&&TOWNX.SHOP_PIC[k]){ const H=2.6, m=new T.MeshBasicMaterial({color:"#ffffff"}); const pl=new T.Mesh(new T.PlaneGeometry(1,1),m); pl.position.set(0,1.05,-2.3); pl.visible=false; s.add(pl);
    { const RC=TOWNX.SHOP_ROOM&&TOWNX.SHOP_ROOM[TOWNX.SHOP_PIC[k]]; if(RC){ s.background=new T.Color(RC[0]); s.children.forEach(o=>{ if(!o.isMesh) return; const p=o.position; if(Math.abs(Math.abs(p.x)-3.6)<.01||Math.abs(p.z+2.4)<.01||Math.abs(p.y-3.2)<.01) o.material.color.set(RC[0]); else if(Math.abs(p.y+.05)<.01) o.material.color.set(RC[1]); }); } } /* (the room round the picture in the picture's own wall and floor colours) */
    TOWNX.shopTex(k,t=>{ const a=t.image.width/t.image.height; pl.scale.set(H*a,H,1); m.map=t; m.needsUpdate=true; pl.visible=true; s.children.forEach(o=>{ if(o.isMesh&&o.position.z<-2.05&&o!==pl) o.visible=false; }); }); }
  const cam=new T.PerspectiveCamera(40,innerWidth/innerHeight,.1,40); cam.position.set(0,.98,2.3); cam.lookAt(0,.62,-1.2); return {s,cam}; }
function ivOpen(k,open){ ivClose(true); const K=KEEP[k]; const R=ivBuild(k); IV.scene=R.s; IV.cam=R.cam; IV.k=k; IV.t=0; IV.avs=[]; const n=K.ppl.length; if(n>1){ IV.cam.position.z+=.55; IV.cam.position.y+=.06; IV.cam.lookAt(0,.62,-1.2); } /* (two people: step back so both fit on a phone) */
  K.ppl.forEach((P,i)=>{ const x=n>1?(i-(n-1)/2)*.62:0, z=-1.05; const look=npcLook(P.look); const av=new Avatar(look,{npc:true,x,z,r:0}); av.isMe=true; try{ av.setLook(look); }finally{ av.isMe=false; } av.moveSpeed=0; av.rotY=0; av.faceGoal=0; bodyShape(av,P.sh); agedFace(av,look,P); try{ if(av.label) av.label.visible=false; if(av.nameTag) av.nameTag.visible=false; }catch(e){}
    scene.remove(av.root); IV.scene.add(av.root); av.root.position.set(x,0,z); av._P=P;
    if(P.rod){ const r=new T.Mesh(new T.CylinderGeometry(.012,.02,1.3,6),new T.MeshStandardMaterial({color:"#6b4a2e",roughness:.6})); r.position.set(0,-.3,.35); r.rotation.x=1.1; av.arms[1].add(r); } IV.avs.push(av); });
  KS[k]={avs:IV.avs,sp:{x:meAv.pos.x,z:meAv.pos.y,ry:0},t:0,mode:K.mode,last:0,busy:true,inside:1};
  window.MZ_VIEW={scene:IV.scene,cam:IV.cam}; document.body.classList.add("inshop");
  const ui=document.createElement("div"); ui.id="ivUI"; ui.innerHTML=`<div id="ivBox" style="position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:30;background:rgba(255,252,246,.96);border:2px solid #c9a27a;border-radius:16px;padding:10px 14px;box-shadow:0 6px 18px rgba(80,40,10,.25);color:#3b2416;font:700 16px/1.6 ${UI_FONT};min-height:52px"><b id="ivName" style="color:#8e1c14;font-size:14px"></b><div id="ivText"></div></div><button class="secondary" id="ivX" style="position:fixed;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:30">🚪 離開</button>`;
  document.body.appendChild(ui); ui.querySelector("#ivX").onclick=()=>{ closeSheet(); ivClose(); };
  IV.open=open; IV.opened=false; IV.idle=0; return K; }
function ivClose(quiet){ if(!IV.scene) return; IV.avs.forEach(av=>{ try{ IV.scene.remove(av.root); av.dispose&&av.dispose(); }catch(e){} }); IV.scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material&&o.material.dispose) o.material.dispose(); }); if(KS[IV.k]) delete KS[IV.k];
  IV.scene=null; IV.cam=null; IV.avs=[]; window.MZ_VIEW=null; document.body.classList.remove("inshop"); const u=document.getElementById("ivUI"); if(u) u.remove(); }
function ivLine(who,text){ const K=KEEP[IV.k]; if(!K) return; text=text.replace(/@NAME/g,me.name||"你"); const nm=who===-1?K.ppl.map(p=>p.n).join("、"):K.ppl[who].n; const N=document.getElementById("ivName"), X=document.getElementById("ivText"); if(N) N.textContent=nm; if(X) X.textContent="";
  let i=0; const iv=setInterval(()=>{ if(!X||!X.isConnected){ clearInterval(iv); return; } i++; X.textContent=text.slice(0,i); if(i>=text.length) clearInterval(iv); },38);
  (who===-1?IV.avs:[IV.avs[who]]).forEach((av,j)=>{ const V=KV[(av._P||{}).v]||KV.man, ex=/[！!]/.test(text), q=/[？?]$/.test(text); setTimeout(()=>{ try{ babble(Math.min(2.6,.4+text.length*.08/V.r),V.p*(ex?1.12:1)); if(q){ const f=420*V.p; setTimeout(()=>{ try{ tone(f,.12,.06,"triangle"); tone(f*1.3,.14,.06,"triangle",.1); }catch(e){} },Math.min(2400,text.length*70)); } }catch(e){} },j*60); }); }
L.keeper=(k,open)=>{ const K=KEEP[k]; if(!K) return false; if(IV.scene&&IV.k===k){ open&&open(); return true; }
  if(typeof isOpen==="function"&&!isOpen(k)&&!TM.on){ toast(`🕒 ${K.ppl.map(p=>p.n).join("和")}不在店裡（營業時間 ${hrs(k)}）`,3000); return true; }
  try{ if(typeof KA==="function"){ const A=KA(k); if(A.d!==today()){ A.d=today(); A.a=Math.min(100,A.a+1); save(); } } }catch(e){}
  ivOpen(k,open); const go=()=>{ if(IV.opened) return; IV.opened=true; try{ (K.go||(()=>open&&open()))(); }catch(e){ console.warn(e); } };
  const S=KS[k]; const full=Date.now()-(K._last||0)>180e3; K._last=Date.now(); let lines=full?(K.fights?[...K.fights[(Math.random()*K.fights.length)|0],...K.end]:K.lines):K.quick; const openAt=full&&K.openAt!=null?K.openAt:lines.length;
  try{ const A=KA(k), t=A.a>=60?3:A.a>=30?2:A.a>=10?1:0; if(t&&GOSSIP[k]&&Math.random()<.45) lines=lines.concat([[0,GOSSIP[k][t-1][0].replace(/^[^：]+：「?/,"").replace(/」?（.*）$|」$/,"")]]); }catch(e){}
  let i=0; const next=()=>{ if(!IV.scene||IV.k!==k) return; if(i===openAt) go(); if(i>=lines.length){ S.busy=false; S.mode=(K.mode==="doze"||S.inv)?"idle":K.mode; go(); return; } const [w,text]=lines[i++];
    if(w==="wake"){ S.mode="wake"; S.t=0; try{ tone(880,.08,.06,"square"); }catch(e){} setTimeout(next,700); return; } if(K.mode==="argue"&&w>=0) S.spk=w; if(w===-1||/幫忙|要不要/.test(text)){ S.mode="idle"; S.inv=1; } /* (asking you: everyone turns to look at you) */ ivLine(w,text); setTimeout(next,Math.min(3600,1000+text.length*95)); };
  setTimeout(next,450); return true; };
/* leave the shop when nothing is open any more */
L.tick6=dt=>{ try{ keepTick(dt); if(IV.scene){ const busy=!!sheetKind||document.querySelector(".lf-ov"); { const x=document.getElementById("ivX"); if(x) x.style.display=busy?"none":""; } /* (the panel has its own 關閉; leaving it closes the shop too) */ if(IV.opened&&!busy){ IV.idle+=dt; if(IV.idle>.6) ivClose(); } else IV.idle=0; } }catch(e){ console.warn("shop view",e); } if(L.tick7) L.tick7(dt); };

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
      else { const perfect=Math.abs(off)<5; const nx=perfect?topL.x:q.x; B.stack.push({k:q.k,x:nx,y:B.top,h:BG_ING[q.k]}); B.top+=BG_ING[q.k]; B.n++; GSN.thud(); B.drop=null;
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
  rankPost("burger",n).then(j=>{ if(sheetKind==="lfBf2"){ const el=document.querySelector("#bgRk"); if(el) el.innerHTML=rankHtml("burger",j,1); } }); openSheet("lfBf2","🍔 疊漢堡",`<div id="bgRk" style="float:none"></div><p class="lead">疊了 ${n} 層${perfect?`（完美 ${perfect} 次）`:""}。${line}${rec?"<br>🏆 新紀錄！":""}</p>
   <p class="lead">${paid?(coins||gacha?`拿到 ${coins} 平安幣${gacha?` 和 ${gacha} 枚扭蛋幣`:""}。`:"這次沒有獎勵。"):"今天的獎勵已經拿完了（每天前 10 次有獎勵），玩開心的～"}${big}${extra}</p>
   <div class="row"><button class="primary" data-act="lfBg">再玩一次（30 幣）</button></div>`); }
/* ================= 小鎮的店家遊戲 (11/14) — every game has a daily ranking on the server (/rank: best score per player per Taiwan day);
   the test page keeps its own. ================= */
const GU=()=>load("mz.id","")||"";
async function rankPost(g,s){ try{ const r=await fetch("/rank",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({g,s:Math.max(0,Math.round(s)),uid:GU(),name:me.name||"香客"})}); return await r.json(); }catch(e){ return null; } }
async function rankGet(g){ try{ const r=await fetch("/rank?g="+g); return await r.json(); }catch(e){ return null; } }
const RK_UNIT={burger:"層",ice:"mm",drink:"分",congee:"分",herb:"分",book:"分",flower:"分"};
function rankHtml(g,j,mine){ if(!j||!j.top) return `<p class="note">（排名暫時連不上）</p>`; return `<h4 style="margin:10px 0 4px">🏆 今日排名</h4>${j.top.length?`<div style="display:grid;grid-template-columns:2.2em 1fr auto;gap:3px 8px;font-size:14px">${j.top.slice(0,10).map((r,i)=>`<b>${["🥇","🥈","🥉"][i]||i+1}</b><span>${String(r[0]).replace(/[<>&]/g,"")}</span><span>${g==="ice"?(r[1]/10).toFixed(1)+" cm":r[1]+" "+RK_UNIT[g]}</span>`).join("")}</div>`:`<p class="note">今天還沒有人上榜，第一名就是你的！</p>`}${mine&&j.rank?`<p class="note">你今天最好 ${g==="ice"?(j.best/10).toFixed(1)+" cm":j.best+" "+RK_UNIT[g]}，目前第 ${j.rank} 名（共 ${j.n} 人）。</p>`:""}`; }
HANDLERS.lfRank=async g=>{ const j=await rankGet(g); openSheet("lfRank","🏆 今日排名",rankHtml(g,j)); };
const GAME_DAY=()=>{ const d=LF(); if(!d.gday||d.gday.d!==today()) d.gday={d:today()}; return d.gday; }; /* (not d.gd: that is the garden) */ /* per-day counters for every game */
const gamePaid=(k,max)=>{ const G=GAME_DAY(); G[k]=(G[k]||0)+1; return TM.on||G[k]<=max; }; /* (主委 only skips the daily limit in 測試模式) */
/* ---------- game sounds (11/14, the chair: every game has its sounds) — made on the spot, no files ---------- */
const GSN=(()=>{ const nb=(d,v,f,dl)=>{ try{ noiseBurst(d,v,f,dl||0); }catch(e){} }, t=(f,d,v,w,dl)=>{ try{ tone(f,d,v,w,dl||0); }catch(e){} };
  return { pour:()=>nb(.12,.05,500+Math.random()*300), squish:()=>{ nb(.09,.05,320+Math.random()*120); }, flip:()=>{ nb(.05,.07,2800); t(900,.04,.03,"triangle"); }, clack:()=>{ t(1250,.05,.05,"triangle"); t(1870,.04,.03,"triangle",.02); },
    miss:()=>{ t(260,.14,.05,"sawtooth"); t(196,.18,.05,"sawtooth",.1); }, good:()=>{ t(880,.08,.05,"triangle"); t(1175,.1,.05,"triangle",.08); }, slide:()=>nb(.14,.05,900), snip:()=>{ nb(.04,.08,4200); t(1900,.03,.03,"square"); },
    thud:()=>{ t(150,.12,.08,"sine"); nb(.06,.06,500); }, serve:()=>{ t(1500,.08,.05,"triangle"); t(2250,.1,.04,"triangle",.04); nb(.05,.04,3000); }, tick:()=>t(1000,.03,.03,"square"), start:()=>[523,659,784].forEach((f,i)=>t(f,.09,.05,"triangle",i*.07)),
    win:()=>[784,988,1175,1568].forEach((f,i)=>t(f,.14,.05,"triangle",i*.09)), lose:()=>[392,330,262].forEach((f,i)=>t(f,.18,.05,"sawtooth",i*.12)) }; })(); L.GS=GSN;
function gOverlay(title,bg){ const ov=document.createElement("div"); ov.className="lf-ov"; ov.style.cssText=`position:fixed;inset:0;z-index:9000;background:${bg||"rgba(20,14,10,.86)"};touch-action:none;user-select:none;-webkit-user-select:none`;
  ov.innerHTML=`<div style="position:absolute;z-index:3;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 12px);text-align:center;color:${bg&&/#f|#e|#d/.test(bg)?"#7a3a1a":"#ffe2a0"};text-shadow:0 1px 0 rgba(255,255,255,.6);font:900 20px ${UI_FONT};pointer-events:none">${title}</div><button class="lf-x" id="gX">離開</button><div id="gB" style="position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 48px);bottom:0;display:flex;flex-direction:column;align-items:center"></div>`;
  document.body.appendChild(ov); window.MZ_NO3D=1; const close=()=>{ window.MZ_NO3D=0; ov.remove(); }; ov.querySelector("#gX").onclick=()=>{ ov._quit=1; close(); }; return {ov,B:ov.querySelector("#gB"),close}; }
const GL=L.games||(L.games={});

/* ---------- 🧋 飲料店：調飲料 — pour each layer up to its line; let go too early and it is short, too late and it is over. Ice may drop in
   halfway and push the level up. 20 real Taiwanese drinks; a shift is 3 cups. ---------- */
const DRK=[["珍珠奶茶",[["珍珠",.16,"#3a2416"],["紅茶",.62,"#a4512a"],["鮮奶",.9,"#f1e3cf"]]],["黑糖珍珠鮮奶",[["黑糖",.1,"#5a2d14"],["珍珠",.24,"#3a2416"],["鮮奶",.9,"#f4ece0"]]],["多多綠茶",[["綠茶",.55,"#c9c86a"],["多多",.88,"#f2e9d0"]]],
 ["冬瓜檸檬",[["冬瓜茶",.65,"#9a5a2a"],["檸檬汁",.86,"#f2e06a"]]],["百香綠茶",[["百香果",.22,"#f2b23a"],["綠茶",.86,"#c9c86a"]]],["楊枝甘露",[["芒果",.3,"#f6b33a"],["西米露",.5,"#f4efe4"],["椰奶",.9,"#fbf6ea"]]],["蜂蜜檸檬",[["蜂蜜",.14,"#e8a530"],["檸檬汁",.34,"#f2e06a"],["冰水",.9,"#d8ecf4"]]],
 ["烏龍奶茶",[["烏龍茶",.62,"#a86a2a"],["奶",.9,"#e9d6bc"]]],["芋頭鮮奶",[["芋泥",.26,"#b59ad0"],["鮮奶",.9,"#f4ece0"]]],["紅茶拿鐵",[["紅茶",.5,"#a4512a"],["鮮奶",.9,"#efe0cc"]]],["青蛙撞奶",[["粉圓",.2,"#2a2018"],["鮮奶",.9,"#f4ece0"]]],
 ["柳橙綠茶",[["柳橙汁",.42,"#f5a03a"],["綠茶",.88,"#c9c86a"]]],["葡萄柚綠",[["葡萄柚",.4,"#ef7a6a"],["綠茶",.88,"#c9c86a"]]],["鐵觀音拿鐵",[["鐵觀音",.55,"#7a4a22"],["鮮奶",.9,"#e9dcc6"]]],["仙草凍奶茶",[["仙草凍",.22,"#1e1a14"],["紅茶",.64,"#a4512a"],["奶",.9,"#e8d2b6"]]],
 ["布丁奶茶",[["布丁",.2,"#f2c84a"],["奶茶",.88,"#c99a6a"]]],["椰果奶茶",[["椰果",.18,"#f4f1e6"],["奶茶",.88,"#c99a6a"]]],["梅子綠茶",[["梅子汁",.24,"#b03a4a"],["綠茶",.88,"#c9c86a"]]],["甘蔗青茶",[["甘蔗汁",.4,"#d9cf7a"],["青茶",.88,"#b9c46a"]]],["檸檬愛玉",[["愛玉",.3,"#f2e8a0"],["檸檬汁",.5,"#f2e06a"],["冰水",.9,"#d8ecf4"]]]];
GL["tw:drink"]=()=>{ openSheet("lfDrink","🧋 飲料店打工",`<p class="lead">小安：「按住出料，放開就停。每一層都要剛好倒到線上！」</p><p class="note">一班 3 杯，每杯有時間限制。倒得越準薪水越多（每天前 5 班有薪水）。中途可能會加冰塊，水位會突然升高喔。</p><div class="row"><button class="primary" data-act="lfDrinkGo">上班！</button><button class="secondary" data-act="lfRank" data-v="drink">今日排名</button></div>`); };
HANDLERS.lfDrinkGo=()=>{ closeSheet(); drinkGame(); };
function drinkGame(){ /* 11/14 (the chair): a 3D see-through cup. The liquid sloshes (two tilting modes + ripples from the stream), the stream keeps
   landing for a moment after you let go, ice cubes drop in and push the level up and bob over the line, and each cup has a time limit —
   you cannot read the level exactly the moment you let go; you judge by feel. Scored on the settled level. No physics library: a small
   spring-and-wave model, cheap enough for phones. */
  const G=gOverlay("🧋 調飲料","linear-gradient(#ffe2cc,#f2b48a)"), B=G.B; B.style.top="0"; const cups=[0,1,2].map(()=>DRK[(Math.random()*DRK.length)|0]);
  B.innerHTML=`<canvas id="dkC" style="position:absolute;left:0;top:0;width:100%;height:76%"></canvas><div id="dkT" style="position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 46px);text-align:center;color:#7a3a1a;font:900 17px ${UI_FONT};pointer-events:none">第 1 杯</div>
   <div id="dkBar" style="position:absolute;left:18%;right:18%;top:calc(env(safe-area-inset-top,0px) + 74px);height:8px;border-radius:4px;background:rgba(122,58,26,.18);pointer-events:none"><i id="dkBarI" style="display:block;height:100%;width:100%;border-radius:4px;background:#e8706a"></i></div>
   <div style="position:absolute;left:0;right:0;bottom:0;height:24%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px"><div id="dkM" style="color:#7a3a1a;font:800 15px ${UI_FONT};min-height:22px"></div><button class="lf-btn" style="position:static;transform:none;width:170px;height:76px;border-radius:38px;font-size:20px;touch-action:none" id="dkB">按住出料</button></div>`;
  const cv=B.querySelector("#dkC"); let R; try{ R=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true}); }catch(e){ G.close(); toast("這台裝置畫不出 3D 杯子",2000); return; }
  const sc=new T.Scene(), cam=new T.PerspectiveCamera(34,1,.1,60); sc.add(new T.HemisphereLight("#fffaf2","#c9a888",1.0)); const dl=new T.DirectionalLight("#ffffff",.8); dl.position.set(3,6,5); sc.add(dl);
  const fit=()=>{ const w=cv.clientWidth, h=cv.clientHeight; R.setPixelRatio(Math.min(2,devicePixelRatio||1)); R.setSize(w,h,false); cam.aspect=w/h; cam.fov=w/h<.75?40:32; cam.updateProjectionMatrix(); }; fit(); addEventListener("resize",fit);
  cam.position.set(0,3.0,5.6); cam.lookAt(0,1.05,0);
  const HC=2.2, RB=.6, RT=.82, rAt=y=>RB+(RT-RB)*Math.max(0,Math.min(1,y/HC)); const NA=48, NR=6;
  /* the glass: inside and outside, see-through */ const gmat=new T.MeshStandardMaterial({color:"#eaf6ff",roughness:.08,metalness:0,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide});
  const glass=new T.Mesh(new T.CylinderGeometry(RT+.04,RB+.04,HC+.25,NA,1,true),gmat); glass.position.y=(HC+.25)/2-.02; glass.renderOrder=5; sc.add(glass);
  const base=new T.Mesh(new T.CylinderGeometry(RB+.05,RB+.08,.12,NA),new T.MeshStandardMaterial({color:"#e8f2f8",roughness:.1,transparent:true,opacity:.45,depthWrite:false})); base.position.y=-.06; base.renderOrder=5; sc.add(base);
  const lip=new T.Mesh(new T.TorusGeometry(RT+.04,.025,8,NA),new T.MeshStandardMaterial({color:"#ffffff",roughness:.1,transparent:true,opacity:.6})); lip.rotation.x=Math.PI/2; lip.position.y=HC+.23; sc.add(lip);
  const shine=new T.Mesh(new T.PlaneGeometry(.08,HC*.9),new T.MeshBasicMaterial({color:"#ffffff",transparent:true,opacity:.35,depthWrite:false})); shine.position.set(-.5,HC*.5,.62); shine.rotation.y=-.5; shine.renderOrder=6; sc.add(shine);
  /* the dispenser */ const steel=new T.MeshStandardMaterial({color:"#8a6a50",roughness:.5}); const head=new T.Mesh(new T.BoxGeometry(1.2,.35,.7),steel); head.position.y=HC+1.55; sc.add(head); const noz=new T.Mesh(new T.CylinderGeometry(.08,.1,.25,16),new T.MeshStandardMaterial({color:"#5a4030",roughness:.4})); noz.position.y=HC+1.25; sc.add(noz);
  const stream=new T.Mesh(new T.CylinderGeometry(.055,.06,1,12),new T.MeshStandardMaterial({color:"#a4512a",roughness:.3})); stream.visible=false; sc.add(stream);
  /* the target line, round the outside of the glass */ const line=new T.Mesh(new T.TorusGeometry(1,.012,6,NA),new T.MeshBasicMaterial({color:"#e8402e"})); line.rotation.x=Math.PI/2; sc.add(line);
  const ghost=new T.Mesh(new T.TorusGeometry(1,.016,6,NA),new T.MeshBasicMaterial({color:"#3aa0e8",transparent:true,opacity:.8})); ghost.rotation.x=Math.PI/2; ghost.visible=false; sc.add(ghost); /* where the ice will push the level */
  const lab=document.createElement("div"); lab.style.cssText=`position:absolute;color:#c0392b;font:900 14px ${UI_FONT};pointer-events:none;white-space:nowrap;text-shadow:0 1px 0 #fff`; B.appendChild(lab);
  /* liquid: finished layers are plain tapered pieces; the top layer has a moving surface and a wall that follows it */
  const layersG=new T.Group(); sc.add(layersG);
  const topWall=new T.BufferGeometry(); topWall.setAttribute("position",new T.BufferAttribute(new Float32Array((NA+1)*2*3),3)); { const ix=[]; for(let a=0;a<NA;a++){ const p=a*2; ix.push(p,p+2,p+1, p+1,p+2,p+3); } topWall.setIndex(ix); }
  const surf=new T.BufferGeometry(); surf.setAttribute("position",new T.BufferAttribute(new Float32Array((1+NR*NA)*3),3)); { const ix=[]; for(let a=0;a<NA;a++){ const a1=(a+1)%NA; ix.push(0,1+a1,1+a); for(let r=0;r<NR-1;r++){ const p=1+r*NA+a, q=1+r*NA+a1, p2=p+NA, q2=q+NA; ix.push(p,q,p2, q,q2,p2); } } surf.setIndex(ix); }
  const tMat=new T.MeshStandardMaterial({color:"#a4512a",roughness:.35,side:T.DoubleSide}), sMat=new T.MeshStandardMaterial({color:"#b86a40",roughness:.18,side:T.DoubleSide});
  const wallM=new T.Mesh(topWall,tMat), surfM=new T.Mesh(surf,sMat); sc.add(wallM); sc.add(surfM);
  const iceM=new T.MeshStandardMaterial({color:"#e8f6ff",roughness:.05,transparent:true,opacity:.62}); const iceG=new T.BoxGeometry(.32,.3,.32);
  const S={ci:0,li:0,lv:0,pour:false,score:0,t:0,wait:0,tail:0,settle:0,ax:0,az:0,vx:0,vz:0,rip:[],ice:[],iceAt:99,cupT:0,cupMax:10,from:0,forceIce:!!window.MZ_DRINK_ICE};
  const btn=B.querySelector("#dkB"), msg=t=>{ B.querySelector("#dkM").textContent=t; };
  const layerMesh=(y0,y1,c)=>{ const m=new T.Mesh(new T.CylinderGeometry(rAt(y1)-.005,rAt(y0)-.005,Math.max(.001,y1-y0),NA,1,false),new T.MeshStandardMaterial({color:c,roughness:.35})); m.position.y=(y0+y1)/2; layersG.add(m); };
  const setCup=()=>{ while(layersG.children.length){ const m=layersG.children.pop(); m.geometry.dispose(); m.material.dispose(); } S.ice.forEach(q=>sc.remove(q.m)); S.ice=[]; S.lv=0; S.li=0; S.from=0; S.ax=S.az=S.vx=S.vz=0; S.rip=[]; S.settle=0; S.tail=0;
    const L=cups[S.ci][1]; S.cupMax=5+L.length*3.2; S.cupT=S.cupMax; S.iceAt=(S.forceIce||Math.random()<.7)?((Math.random()*L.length)|0):99; S.iceDone=false; S.iceWarn=null; ghost.visible=false; B.querySelector("#dkT").textContent=`第 ${S.ci+1} 杯：${cups[S.ci][0]}（${L.map(q=>q[0]).join(" → ")}）`; setLayer(); };
  const setLayer=()=>{ const st=cups[S.ci][1][S.li]; if(!st) return; tMat.color.set(st[2]); sMat.color.set(st[2]).offsetHSL(0,0,.06); stream.material.color.set(st[2]); const y=st[1]*HC; line.scale.set(rAt(y)+.05,rAt(y)+.05,1); line.position.y=y; S.from=S.lv; };
  const down=e=>{ e.preventDefault(); if(S.wait>0||S.settle>0||S.over) return; S.pour=true; try{ btn.setPointerCapture(e.pointerId); }catch(_){ } }, up=e=>{ e.preventDefault(); if(!S.pour) return; S.pour=false; S.tail=.22; S.settle=.9; msg("……"); };
  btn.addEventListener("pointerdown",down); btn.addEventListener("pointerup",up); btn.addEventListener("pointercancel",up);
  const judge=()=>{ const st=cups[S.ci][1][S.li], err=Math.abs(S.lv-st[1]); const pts=err<.015?30:err<.035?20:err<.07?10:0; S.score+=pts; msg(pts>=30?"完美！":pts>=20?"很準！":pts>=10?"差一點":(S.lv>st[1]?"太多了…":"太少了…")); try{ tone(pts>=20?880:pts?660:220,.1,.05,pts?"triangle":"sawtooth"); }catch(e){}
    layerMesh(S.from*HC,S.lv*HC,cups[S.ci][1][S.li][2]); S.li++; if(S.lv>=.99) S.li=99; if(S.li>=cups[S.ci][1].length) nextCup(); else setLayer(); };
  const nextCup=()=>{ S.wait=1.3; setTimeout(()=>{ S.ci++; if(S.ci>=3) return end(); setCup(); },1200); };
  const end=()=>{ if(S.over) return; S.over=true; G.close(); const paid=gamePaid("drink",5), pay=paid?Math.round(S.score*1.2):0; if(pay){ bag.coins+=pay; save(); try{ chaChing(); }catch(e){} } rankPost("drink",S.score).then(j=>openSheet("lfDrink2","🧋 下班了",`<p class="lead">三杯一共 ${S.score} 分。${paid?`薪水 ${pay} 平安幣。`:"今天的薪水已經領完了（每天前 5 班），謝謝幫忙～"}</p>${rankHtml("drink",j,1)}<div class="row"><button class="primary" data-act="lfDrinkGo">再上一班</button></div>`)); };
  const kick=(s)=>{ const a=Math.random()*6.283; S.vx+=Math.cos(a)*s; S.vz+=Math.sin(a)*s; };
  const hAt=(x,z,t)=>{ let h=S.ax*x+S.az*z; for(const w of S.rip){ const d=Math.hypot(x-w.x,z-w.z), age=t-w.t0, fr=d-age*1.6; if(fr>0) continue; h+=w.a*Math.exp(-age*1.4)*Math.sin(fr*9)*Math.exp(fr*1.2); } return h; };
  let last=performance.now(); const loop=now=>{ if(!G.ov.isConnected){ R.dispose(); try{ R.forceContextLoss(); }catch(e){} removeEventListener("resize",fit); lab.remove(); return; }
    const dt=Math.min(.05,(now-last)/1000); last=now; S.t+=dt; if(S.wait>0) S.wait-=dt; const cup=cups[S.ci];
    if(cup&&S.wait<=0&&!S.over){ S.cupT-=dt; const bi=B.querySelector("#dkBar>i"); if(bi){ bi.style.width=Math.max(0,S.cupT/S.cupMax*100)+"%"; bi.style.background=S.cupT<3?"#c0392b":"#e8706a"; }
      if(S.cupT<=0&&S.li<cup[1].length){ S.pour=false; S.settle=0; msg("⏰ 時間到！客人等不及了"); try{ tone(240,.2,.05,"sawtooth"); }catch(e){} if(S.lv>S.from) layerMesh(S.from*HC,S.lv*HC,cup[1][S.li][2]); S.li=99; nextCup(); } }
    const rate=.17+.05*S.ci, flowing=S.pour||S.tail>0;
    if(cup&&flowing&&S.li<cup[1].length){ S.ps=(S.ps||0)-dt; if(S.ps<=0){ S.ps=.1; GSN.pour(); } S.lv=Math.min(1.03,S.lv+dt*rate); if(S.tail>0) S.tail-=dt; kick(dt*2); if(Math.random()<dt*7) S.rip.push({x:(Math.random()-.5)*.08,z:(Math.random()-.5)*.08,t0:S.t,a:.05}); if(S.lv>=1.0){ S.pour=false; S.tail=0; S.settle=.4; msg("滿出來了！"); } }
    if(S.settle>0&&S.tail<=0){ S.settle-=dt; if(S.settle<=0&&S.li<cup[1].length) judge(); }
    /* ice: 3 s warning (with where the level will be after it), then it drops (主委 11/14) */
    if(cup&&!S.iceDone&&S.iceWarn==null&&S.li===S.iceAt&&S.wait<=0&&S.lv>S.from+.03){ /* (once you have started pouring that layer) */ S.iceN=2+((Math.random()*3)|0); S.iceRise=S.iceN*.022; S.iceWarn=3; try{ tone(1200,.06,.05,"square"); }catch(e){} }
    if(S.iceWarn!=null&&!S.iceDone){ S.iceWarn-=dt; const yy=Math.min(1.03,S.lv+S.iceRise)*HC; ghost.visible=true; ghost.position.y=yy; ghost.scale.set(rAt(yy)+.06,rAt(yy)+.06,1); ghost.material.opacity=.55+.35*Math.sin(S.t*8); msg(`🧊 ${Math.max(1,Math.ceil(S.iceWarn))} 秒後加 ${S.iceN} 顆冰塊！水位會升到藍線`); }
    if(cup&&!S.iceDone&&S.iceWarn!=null&&S.iceWarn<=0){ S.iceDone=true; S.iceWarn=null; ghost.visible=false; const n=S.iceN; for(let k=0;k<n;k++){ const m=new T.Mesh(iceG,iceM); const a=Math.random()*6.283, r=Math.random()*.35; m.position.set(Math.cos(a)*r,HC+1.0+k*.35,Math.sin(a)*r); m.rotation.set(Math.random(),Math.random(),Math.random()); sc.add(m); S.ice.push({m,vy:0,in:false,ph:Math.random()*6}); } try{ tone(1400,.05,.05,"square"); tone(1100,.05,.05,"square",.06); }catch(e){} msg("🧊 加冰塊了！"); }
    const ly=S.lv*HC; S.ice.forEach(q=>{ const m=q.m, sy=ly+hAt(m.position.x,m.position.z,S.t); if(!q.in){ q.vy-=dt*9; m.position.y+=q.vy*dt; if(m.position.y<sy+.05){ q.in=true; S.lv=Math.min(1.03,S.lv+.022); kick(.5); S.rip.push({x:m.position.x,z:m.position.z,t0:S.t,a:.07}); try{ tone(500+Math.random()*200,.05,.04,"triangle"); }catch(e){} } }
      else { m.position.y+= (sy-.06+Math.sin(S.t*2.2+q.ph)*.025-m.position.y)*Math.min(1,dt*6); m.rotation.y+=dt*.3; } });
    /* the slosh: two damped springs (tilt in x and z) */ const w2=70, damp=1.5; S.vx+=(-w2*S.ax-damp*S.vx)*dt; S.vz+=(-w2*S.az-damp*S.vz)*dt; S.ax+=S.vx*dt; S.az+=S.vz*dt; S.ax=Math.max(-.12,Math.min(.12,S.ax)); S.az=Math.max(-.12,Math.min(.12,S.az)); S.rip=S.rip.filter(w=>S.t-w.t0<3).slice(-14);
    /* the moving top: surface and the wall under it */ const yb=S.from*HC, show=S.lv>S.from+.002&&S.li<(cup?cup[1].length:0); wallM.visible=surfM.visible=show;
    if(show){ const P=surf.attributes.position.array, W=topWall.attributes.position.array; P[0]=0; P[1]=ly+hAt(0,0,S.t); P[2]=0;
      for(let r=0;r<NR;r++) for(let a=0;a<NA;a++){ const ang=a/NA*6.283, rr=rAt(ly)*(r+1)/NR-.006, x=Math.cos(ang)*rr, z=Math.sin(ang)*rr, k=(1+r*NA+a)*3; P[k]=x; P[k+1]=ly+hAt(x,z,S.t); P[k+2]=z; }
      for(let a=0;a<=NA;a++){ const ang=(a%NA)/NA*6.283, rT=rAt(ly)-.006, rB=rAt(yb)-.006, x=Math.cos(ang), z=Math.sin(ang), k=a*6; W[k]=x*rB; W[k+1]=yb; W[k+2]=z*rB; W[k+3]=x*rT; W[k+4]=ly+hAt(x*rT,z*rT,S.t); W[k+5]=z*rT; }
      surf.attributes.position.needsUpdate=true; topWall.attributes.position.needsUpdate=true; surf.computeVertexNormals(); topWall.computeVertexNormals(); }
    stream.visible=flowing&&S.li<(cup?cup[1].length:0); if(stream.visible){ const y0=HC+1.12, y1=ly; stream.scale.y=y0-y1; stream.position.y=(y0+y1)/2; }
    /* the line's name, beside the glass */ if(cup&&S.li<cup[1].length){ const v=new T.Vector3(-(rAt(line.position.y)+.12),line.position.y,0).project(cam); lab.style.display=""; lab.textContent=cup[1][S.li][0]+" →"; lab.style.right=((1-(v.x*.5+.5))*cv.clientWidth+2)+"px"; lab.style.left="auto"; lab.style.top=((-v.y*.5+.5)*cv.clientHeight-9)+"px"; } else lab.style.display="none";
    R.render(sc,cam); requestAnimationFrame(loop); }; setCup(); requestAnimationFrame(loop); }

/* ---------- 🥣 一粥七天：記菜單 — a table is shown for 10 s, then set it again from memory; 3 tables, each harder ---------- */
const CG_SIDES=["黃金蛋","鹹蜆仔","素雞","燙青菜","皮蛋豆腐","肝連","粉腸","三色蛋","鯊魚煙","蔥油雞","竹筍沙拉","鮮燙小卷","紹興醉蝦","蒜泥鮮蚵","炸豆腐","炸花枝丸","炸薯條","炸雞塊","炸黑輪","炸銀絲卷","府城蝦捲","炸紅燒肉","蚵仔酥","酥炸土魠魚","炸柳葉魚","魚蛋沙拉"];
const CG_DRK=["阿嬤ㄟ酸梅湯","阿嬤ㄟ紅茶"], CG_SOUP=["虱目魚肚湯","魚丸湯","鮮蚵湯","鱸魚湯"];
GL["tw:congee"]=()=>{ const d=LF(); openSheet("lfCongee","🥣 一粥七天",`<p class="lead">玲姊：「先看一眼桌上，10 秒後幫我把一模一樣的菜單點出來！記得越準，給你越多錢。」君君：「三桌全對還送你三碗鹹粥！」</p><p class="note">要記：鹹粥有沒有加芹菜、有哪些小菜、有沒有飲料、有沒有湯。${(d.cg|0)?`<br>你背包裡有 ${d.cg} 碗鹹粥。`:""}</p><div class="row"><button class="primary" data-act="lfCgGo">開始</button><button class="secondary" data-act="lfRank" data-v="congee">今日排名</button></div>`); };
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
  const grade=A=>{ GSN.serve(); const T=S.T; let good=0, all=0; all++; if(A.cel===T.cel) good++; T.sides.forEach(s=>{ all++; if(A.sides.has(s)) good++; }); A.sides.forEach(s=>{ if(!T.sides.includes(s)) good--; }); all++; if(A.drink===T.drink) good++; all++; if(A.soup===T.soup) good++; good=Math.max(0,good);
    const perfect=good===all; S.score+=Math.round(good/all*100*(1+S.k*.5)); if(perfect) S.ok++; try{ (perfect?[784,988,1175]:[440,330]).forEach((f,i)=>tone(f,.1,.05,"triangle",i*.08)); }catch(e){}
    B.innerHTML=`<div style="margin-top:40px;color:#7a3a1a;font:900 22px ${UI_FONT}">${perfect?"全對！玲姊鬆了一口氣":`對了 ${good} / ${all}`}</div>`; S.k++; setTimeout(()=>{ if(!G.ov.isConnected) return; S.k<3?show():end(); },1300); };
  const end=()=>{ G.close(); const d=LF(); const win=S.ok===3, paid=gamePaid("congee",5); let txt=""; if(paid){ const c=Math.round(S.score*.8); bag.coins+=c; txt=c?`玲姊照分數給你 ${c} 平安幣。`:"沒關係，下次再來幫忙！"; if(win){ d.cg=(d.cg|0)+3; txt+="三桌全對，君君再送你三碗鹹粥（在背包，吃了會變幸運）。"; } } else txt="今天幫夠多了，謝謝你～（每天前 5 次有謝禮）"; /* (pay by score, 主委 11/14: up to 450 分 → 360 幣) */ save();
    rankPost("congee",S.score).then(j=>openSheet("lfCongee2","🥣 一粥七天",`<p class="lead">${S.score} 分。${txt}</p>${rankHtml("congee",j,1)}<div class="row"><button class="primary" data-act="lfCgGo">再幫一次</button></div>`)); };
  show(); }
/* 鹹粥: eat for 幸運 (today; up to 50) — fishing finds the rare ones more often, and the treasure hunt will too */
L.luck=()=>{ const d=LF(); return d.lkD===today()?Math.min(50,d.lk|0):0; };
HANDLERS.lfEatCongee=()=>{ const d=LF(); if(!(d.cg>0)) return; d.cg--; if(d.lkD!==today()){ d.lkD=today(); d.lk=0; } d.lk=Math.min(50,(d.lk|0)+10); save(); try{ [523,659,784].forEach((f,i)=>tone(f,.1,.05,"triangle",i*.08)); }catch(e){} toast(`🥣 熱呼呼的鹹粥！今天的幸運 ${d.lk}`,2600); try{ openBag(); }catch(e){} };

/* ---------- 🌿 中藥行：分類藥材 — 許伯 can't read the labels any more: each herb comes up on the tray, tap the drawer with its name.
   20 herbs, 45 s, at most 3 mistakes. Winning gives a 大還丹 (eat it: 精力上限 +1, up to 200); after 100 of them, money or a 藥材包. ---------- */
const HERB=[["renshen","人參"],["gouqi","枸杞"],["hongzao","紅棗"],["huangqi","黃耆"],["danggui","當歸"],["gancao","甘草"],["chenpi","陳皮"],["juhua","菊花"],["rougui","肉桂"],["lianzi","蓮子"],["fuling","茯苓"],["guiyuan","桂圓"],["shengjiang","生薑"],["jinyinhua","金銀花"]];
const PACKS=[["pk_duck","當歸鴨藥材包"],["pk_siwu","四物湯藥材包"],["pk_lu","滷味藥材包"],["pk_beef","牛肉麵滷包"]];
GL["tw:herb"]=()=>{ try{ herbLoad(HERB.map(h=>h[0])); }catch(e){} const d=LF(); openSheet("lfHerb2","🌿 中藥行",`<p class="lead">許伯：「年輕人，我眼睛看不太清楚，你能不能幫我把一樣的藥材配成對呢？」</p><p class="note">翻兩張一樣的就配成一對，60 秒內全部配完就成功。${(d.dht|0)<100?`成功會拿到一顆大還丹（已經吃了 ${d.dht|0} 顆）。`:"大還丹你已經吃滿了，許伯改送別的。"}</p><div class="row"><button class="primary" data-act="lfHerbGo">幫忙分類</button><button class="secondary" data-act="lfRank" data-v="herb">今日排名</button></div>`); };
/* the herb pictures are loaded (and decoded) before the cards are dealt — a card used to turn over blank on a slow phone (11/14) */
const HIMG={}; function herbLoad(ids){ return Promise.all(ids.map(id=>HIMG[id]||(HIMG[id]=new Promise(res=>{ const im=new Image(); im.onload=()=>{ (im.decode?im.decode():Promise.resolve()).catch(()=>{}).then(()=>res(im)); }; im.onerror=()=>{ delete HIMG[id]; res(null); }; im.src="herbs/"+id+".webp"; })))); }
HANDLERS.lfHerbGo=()=>{ closeSheet(); herbPairs(); };
/* 中藥對對碰 (11/14, the chair: a pairs game, not naming): 16 cards face down, 8 kinds of herb; turn two, the same herb stays open.
   All pairs within 60 s wins (the fewer misses, the higher the score). */
function herbPairs(){ const G0=gOverlay("🌿 中藥對對碰",`url(${MZIMG("herbs/table.webp")}) center/cover no-repeat,#3a2414`); /* (11/14: the chair's old wooden table) */ G0.B.innerHTML=`<div style="margin-top:40px;color:#ffe2a0;font:900 18px ${UI_FONT}">許伯在抓藥材…</div>`; const kinds=[...HERB].sort(()=>Math.random()-.5).slice(0,8);
  herbLoad(kinds.map(h=>h[0]).concat(["bowl"])).then(()=>{ if(G0.ov.isConnected) herbPairs2(G0,kinds); }); }
function herbPairs2(G,kinds){ const B=G.B; const cards=[...kinds,...kinds].sort(()=>Math.random()-.5).map(h=>({h,open:0,done:0}));
  const S={t:60,miss:0,pairs:0,pick:[],lock:false};
  const draw=()=>{ B.innerHTML=`<div style="display:flex;gap:16px;color:#ffe2a0;font:900 16px ${UI_FONT};margin:4px"><span id="hpT">⏱ ${Math.ceil(S.t)}</span><span>配對 ${S.pairs}/8</span><span>失誤 ${S.miss}</span></div>
    <div style="display:grid;grid-template-columns:repeat(4,80px);gap:8px;margin-top:10px;padding:12px;border-radius:18px;background:rgba(40,20,8,.12)">${cards.map((c,i)=>`<button data-c="${i}" style="position:relative;height:84px;border:0;background:none;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center">${c.open||c.done?`<img src="herbs/${c.h[0]}.webp" style="max-width:66px;max-height:54px;filter:drop-shadow(0 3px 2px rgba(0,0,0,.35))${c.done?";opacity:.55":""}"><span style="font:900 12px ${UI_FONT};color:#fff6e0;text-shadow:0 1px 2px #3a1a08">${c.h[1]}</span>`:`<img src="herbs/bowl.webp" style="width:74px;height:74px;filter:drop-shadow(0 4px 3px rgba(0,0,0,.4))">`}</button>`).join("")}</div>`; }; /* (11/14: a wooden table; each herb hides under an upturned blue-and-white bowl) */
  B.onclick=e=>{ const b=e.target.closest("[data-c]"); if(!b||S.lock) return; const c=cards[+b.dataset.c]; if(c.open||c.done) return; c.open=1; GSN.clack(); GSN.flip(); S.pick.push(c); try{ tone(620,.04,.04,"triangle"); }catch(_){}
    if(S.pick.length===2){ const [a,b2]=S.pick; S.pick=[]; if(a.h[0]===b2.h[0]){ a.done=b2.done=1; S.pairs++; try{ tone(880,.08,.05,"triangle"); tone(1175,.1,.05,"triangle",.08); }catch(_){} if(S.pairs===8){ draw(); return end(true); } }
      else { S.miss++; GSN.miss(); S.lock=true; draw(); setTimeout(()=>{ a.open=b2.open=0; S.lock=false; draw(); },650); return; } } draw(); };
  let last=performance.now(); const tick=now=>{ if(!G.ov.isConnected||S.done) return; S.t-=Math.min(.1,(now-last)/1000); last=now; const el=B.querySelector("#hpT"); if(el) el.textContent="⏱ "+Math.max(0,Math.ceil(S.t)); if(S.t<=0) return end(false); requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  const end=win=>{ if(S.done) return; S.done=1; setTimeout(()=>{ G.close(); const d=LF(), paid=gamePaid("herb",5), score=win?Math.max(10,100+Math.round(S.t)*2-S.miss*4):S.pairs*8; let txt="";
    if(win&&paid){ if((d.dht|0)+(d.dhtI|0)<100){ d.dhtI=(d.dhtI|0)+1; txt="許伯：「好孩子，這顆大還丹給你。」（在背包裡，吃了精力上限 +1）"; } else if(Math.random()<.5){ const c=150+((Math.random()*4)|0)*50; bag.coins+=c; txt=`許伯塞給你 ${c} 平安幣。`; } else { const P=PACKS[(Math.random()*PACKS.length)|0]; d.pk=d.pk||{}; d.pk[P[0]]=(d.pk[P[0]]|0)+1; txt=`許伯送你一包「${P[1]}」，可以帶回家煮。`; } }
    else if(win) txt="今天幫夠多了，許伯說明天再來（每天前 5 次有謝禮）。"; else txt="時間到了，還差一點點！"; save();
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
    if(win&&paid){ if((d.dht|0)+(d.dhtI|0)<100){ d.dhtI=(d.dhtI|0)+1; txt="許伯：「好孩子，這顆大還丹給你。」（在背包裡，吃了精力上限 +1）"; } else if(Math.random()<.5){ const c=150+((Math.random()*4)|0)*50; bag.coins+=c; txt=`許伯塞給你 ${c} 平安幣。`; } else { const P=PACKS[(Math.random()*PACKS.length)|0]; d.pk=d.pk||{}; d.pk[P[0]]=(d.pk[P[0]]|0)+1; txt=`許伯送你一包「${P[1]}」，可以帶回家煮。`; } }
    else if(win) txt="今天幫夠多了，許伯說明天再來（每天前 5 次有謝禮）。"; else txt=S.bad>3?"放錯太多了，許伯皺著眉頭重新整理……":"時間到了，還差一點點！"; save();
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
  const up=()=>{ if(!drag) return; GSN.slide(); const q=S.bl[drag.i], nv=Math.round((q.h?drag.px:drag.py)/C), ov=q.h?q.x:q.y; const won=drag.i===0&&drag.px>=4.4*C; if(q.h) q.x=Math.min(4,nv); else q.y=nv; if(nv!==ov||won){ S.moves++; try{ tone(520,.04,.04,"triangle"); }catch(e){} } drag=null; B.querySelector("#bkM").textContent=`步數 ${S.moves}（最少 ${P.min} 步）`; draw(); if(won||(q===S.bl[0]&&q.x===4)) end(); };
  cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up); draw();
  const end=()=>{ if(S.done) return; S.done=1; const secs=(performance.now()-S.t0)/1000, score=Math.max(10,Math.round(100+P.min*5-(S.moves-P.min)*4-secs/4)); try{ [784,988,1175,1568].forEach((f,i)=>tone(f,.12,.05,"triangle",i*.08)); }catch(e){}
    setTimeout(()=>{ G.close(); const d=LF(), paid=gamePaid("book",5); let txt="書架整理好了！"; if(paid) txt+=" "+bookPrize(d); else txt+="（今天的書已經送完了，每天前 5 次）"; save(); rankPost("book",score).then(j=>openSheet("lfBook2","📚 書店",`<p class="lead">${S.moves} 步（最少 ${P.min}），${score} 分。${txt}</p>${rankHtml("book",j,1)}<div class="row"><button class="primary" data-act="lfBookGo">再整理一次</button></div>`)); },700); }; }
const RECIPES=["當歸鴨麵線","四物雞湯","滷肉飯","牛肉麵","香菇雞湯","麻油雞","番茄炒蛋","三杯雞","蔥油餅","鹹粥"];
function bookPrize(d){ const r=Math.random(); if(r<.3){ energy(20); return "老闆送你《元氣百科》，翻一翻精神都來了（精力 +20）。"; } if(r<.45&&(d.spd|0)<15){ d.spd=(d.spd|0)+1; lfSpeed(); return `老闆送你《疾走之書》，走路永久變快 1%（現在 +${d.spd}%）。`; }
  if(r<.75){ const left=RECIPES.filter(n=>!(d.rcp||[]).includes(n)); if(left.length){ const n=left[(Math.random()*left.length)|0]; d.rcp=(d.rcp||[]).concat(n); return `老闆送你一本食譜《${n}》（之後可以在家煮）。`; } }
  const c=100+((Math.random()*5)|0)*100; bag.coins+=c; return `老闆送你一本舊書，翻開掉出 ${c} 平安幣！`; }
function lfSpeed(){ try{ const d=LF(); if(me.sp&&typeof CHAIR_SPD!=="undefined"&&CHAIR_SPD>1) return; meAv.moveSpeed=(d.spd|0)?3.31*(1+(d.spd|0)/100):undefined; }catch(e){} }
setTimeout(lfSpeed,3000);

GL["tw:flower"]=()=>{ openSheet("lfFlw","💐 心語花店",`<p class="lead">雅琪店長：「工讀生來啦！今天的訂單麻煩你囉。客人要什麼花、什麼顏色、什麼感覺，照著包就對了。」</p><div class="row"><button class="primary" data-act="lfFlwGo">開始打工</button><button class="secondary" data-act="lfFlwShop">買種子</button><button class="secondary" data-act="lfRank" data-v="flower">今日排名</button></div><p class="note">每張單照星星發打工費：★★★ 500、★★ 300、★ 200 平安幣。</p>`); };
HANDLERS.lfFlwShop=()=>{ try{ L.flowerShop?L.flowerShop():toast("種子在花店老闆娘那裡買",2000); }catch(e){} };
HANDLERS.lfFlwGo=()=>{ closeSheet(); bqGame(); };
/* ---------- 💐 心語花店・花束打工 (11/14 晚上, the chair's rules): you are the part-timer. A customer asks for a bouquet — which flowers, how
   many, what colours, what feel for the paper — and you build it: drag stems from the shelf into the bouquet (back / middle / front row),
   pick a paper (drawn behind the flowers and again in front of the stems) and a bow, then hand it over before time runs out. No prices,
   no budget, no costs anywhere: the shop pays a fixed wage by stars — ★★★ 500, ★★ 300, ★ 200, under one star nothing.
   Score (100): the asked-for flowers 35 · colours 25 · counts and "please don't" 20 · paper and bow fit the feel 10 · time 10.
   Missing an asked-for flower caps the order at two stars. Pictures: public/flw/<id>.webp (cut from the chair's sheet, tools/flower/cut.py). ---------- */
const BQF=[ /* id, name, kind, colour */
 ["rose_r","紅玫瑰","rose","red"],["rose_p","粉玫瑰","rose","pink"],["rose_w","白玫瑰","rose","white"],["rose_y","黃玫瑰","rose","yellow"],
 ["lily_w","白百合","lily","white"],["lily_p","粉百合","lily","pink"],["lily_s","香水百合","lily","pink"],["lily_o","橘百合","lily","orange"],
 ["carn_r","紅康乃馨","carn","red"],["carn_p","粉康乃馨","carn","pink"],["carn_w","白康乃馨","carn","white"],
 ["hyd_b","藍繡球","hyd","blue"],["hyd_p","粉繡球","hyd","pink"],["hyd_v","紫繡球","hyd","purple"],["sunf","向日葵","sunf","yellow"],
 ["gerb_p","粉非洲菊","gerb","pink"],["gerb_y","黃非洲菊","gerb","yellow"],["gerb_o","橘非洲菊","gerb","orange"],
 ["tul_r","紅鬱金香","tul","red"],["tul_p","粉鬱金香","tul","pink"],["tul_y","黃鬱金香","tul","yellow"],["tul_w","白鬱金香","tul","white"],["tul_v","紫鬱金香","tul","purple"],
 ["orch_p","粉蝴蝶蘭","orch","pink"],["orch_w","白蝴蝶蘭","orch","white"],["orch_y","黃蝴蝶蘭","orch","yellow"],["calla_w","白海芋","calla","white"],["calla_y","黃海芋","calla","yellow"],
 ["daisy","雛菊","daisy","white"],["chamo","洋甘菊","daisy","white"],["laven","薰衣草","laven","purple"],["gyp_w","白滿天星","gyp","white"],["gyp_p","粉滿天星","gyp","pink"],
 ["euca","尤加利葉","leaf","green"],["leafv","斑葉","leaf","green"],["fern","蕨葉","leaf","green"],["monst","龜背芋","leaf","green"],["ivy","常春藤","leaf","green"]];
const BQB={}; BQF.forEach(f=>BQB[f[0]]=f);
const BQW=[["wrap_k","牛皮紙"],["wrap_p","粉紅紙"],["wrap_v","淡紫紙"],["wrap_b","淺藍紙"],["wrap_f","碎花紙"],["wrap_m","薄荷點點紙"]], BQR=[["bow_r","紅緞帶"],["bow_p","粉緞帶"],["bow_y","黃緞帶"],["bow_v","紫緞帶"],["bow_b","藍條紋緞帶"]];
const BQK={rose:"玫瑰",lily:"百合",carn:"康乃馨",hyd:"繡球花",sunf:"向日葵",gerb:"非洲菊",tul:"鬱金香",orch:"蝴蝶蘭",calla:"海芋",daisy:"小雛菊",laven:"薰衣草",gyp:"滿天星",leaf:"葉材"};
const BQC={red:"紅",pink:"粉紅",white:"白",yellow:"黃",orange:"橘",purple:"紫",blue:"藍"};
/* the orders: what the customer says, and what it means. req: [kind, colour or "", how many, exact?]; col: the colours wanted (the green
   leaves never count against you); no: "please don't"; tot: [fewest, most] stems; wrap/bow: what fits the feel */
const BQO=[
 {who:"👩 陳小姐",say:"我想送媽媽一束粉紅色的花，裡面要有兩朵康乃馨，包裝也想要溫柔一點。",req:[["carn","",2,1]],col:["pink","white"],tot:[4,10],wrap:["wrap_p","wrap_v","wrap_f"],bow:["bow_p","bow_v"]},
 {who:"🧑 阿傑",say:"幫我做一束適合告白的花束，要有紅玫瑰，搭配白色花朵。",req:[["rose","red",3,0]],col:["red","white"],tot:[5,12],wrap:["wrap_p","wrap_f","wrap_k"],bow:["bow_r","bow_p"]},
 {who:"👵 林阿嬤",say:"我要帶去廟裡拜拜，請幫我準備一束有百合的花束，看起來莊重一點。",req:[["lily","",2,0]],col:["white","yellow"],no:{col:["red","pink","purple","blue","orange"]},tot:[4,10],wrap:["wrap_k","wrap_m"],bow:["bow_y","bow_b"],noTxt:"不要太花俏的顏色"},
 {who:"🧒 小宇",say:"我朋友畢業了！我想送一束很有活力的花，要三朵向日葵，黃色系的。",req:[["sunf","",3,1]],col:["yellow","orange","white"],tot:[4,10],wrap:["wrap_k","wrap_b"],bow:["bow_y","bow_b"]},
 {who:"👨 王先生",say:"同事住院了，想帶一束明亮的花去看他。要有非洲菊，但是不要百合，香味太重了。",req:[["gerb","",2,0]],col:["yellow","orange","white","pink"],no:{kind:["lily"]},tot:[4,10],wrap:["wrap_m","wrap_b","wrap_k"],bow:["bow_y","bow_b"],noTxt:"不要百合"},
 {who:"👧 小雨",say:"今天是我閨蜜生日～我要一束繽紛的鬱金香，三朵以上，顏色越多越好！",req:[["tul","",3,0]],col:["*"],tot:[4,12],wrap:["wrap_f","wrap_p","wrap_v"],bow:["bow_p","bow_y","bow_v"]},
 {who:"👩 美玲",say:"我跟男朋友吵架了……想送一束藍色的花道歉，要一朵藍色繡球花，配白色的小花。",req:[["hyd","blue",1,1]],col:["blue","white"],tot:[3,9],wrap:["wrap_b","wrap_m"],bow:["bow_b"]},
 {who:"🧔 老王",say:"朋友新店開張，送一束喜氣的蘭花，要兩枝蝴蝶蘭，黃色或白色，包裝穩重一點。",req:[["orch","",2,1]],col:["yellow","white"],tot:[3,9],wrap:["wrap_k"],bow:["bow_y","bow_r"]},
 {who:"👴 許伯",say:"結婚紀念日，想送老伴一束紅玫瑰，剛好九朵就好，不要別的花，可以加點葉子。",req:[["rose","red",9,1]],col:["red"],no:{other:1},tot:[9,14],wrap:["wrap_k","wrap_p","wrap_f"],bow:["bow_r"],noTxt:"除了紅玫瑰和葉子，不要別的花"},
 {who:"👩 秀琴",say:"想放在家裡的一小束紫色的花，有薰衣草就好，簡單清爽，不要超過六枝。",req:[["laven","",1,0]],col:["purple","white"],tot:[2,6],wrap:["wrap_v","wrap_k","wrap_m"],bow:["bow_v"],noTxt:"不要超過六枝"},
 {who:"🧑 阿翔",say:"要去求婚！拜託做一束超浪漫的，粉玫瑰五朵，再配滿天星。",req:[["rose","pink",5,1],["gyp","",1,0]],col:["pink","white"],tot:[7,14],wrap:["wrap_p","wrap_f"],bow:["bow_p","bow_r"]},
 {who:"👩‍🏫 吳老師",say:"教師節學生要送的花，想要白海芋兩枝，看起來高雅一點。",req:[["calla","white",2,1]],col:["white","green","yellow"],tot:[3,9],wrap:["wrap_m","wrap_k","wrap_b"],bow:["bow_b","bow_y"]}];
const BQIMG={}; const bqImg=id=>BQIMG[id]||(BQIMG[id]=(()=>{ const im=new Image(); im.src=MZIMG("flw/"+id+".webp"); return im; })());
const BQT=100; /* seconds per order */
function bqGame(){ BQF.forEach(f=>bqImg(f[0])); BQW.forEach(w=>bqImg(w[0])); BQR.forEach(r=>bqImg(r[0]));
  const BS=on=>`flex:none;border:1px solid ${on?"#c0506a":"#e2cbb4"};border-radius:12px;background:${on?"#d0607a":"#fffaf3"};color:${on?"#fff":"#6a4a32"};font:800 12.5px ${UI_FONT};`; const O=BQO[(Math.random()*BQO.length)|0], G=gOverlay("💐 心語花店・花束打工","linear-gradient(#fbf3ea,#f0e2d2)"), B=G.B; const W2=340, H2=400, CX=W2/2;
  const st={pl:[],row:1,wrap:null,bow:null,t:BQT,done:0}; let drag=null;
  B.innerHTML=`<div style="width:min(94vw,420px);display:flex;gap:8px;align-items:flex-start;margin:2px 0 4px"><div style="flex:1;background:#fff;border-radius:14px;padding:8px 10px;box-shadow:0 2px 8px rgba(120,80,40,.15);color:#5a3a22;font:700 13.5px/1.45 ${UI_FONT}"><b>${O.who}</b>：「${O.say}」</div><div id="bqT" style="min-width:58px;text-align:center;background:#7a3a1a;color:#fff;border-radius:12px;padding:6px 4px;font:900 16px ${UI_FONT}">${BQT}</div></div>
   <canvas id="bqC" width="${W2}" height="${H2}" style="touch-action:none;width:min(80vw,340px,46vh*.85);background:radial-gradient(#fffaf2,#f3e6d4);border-radius:18px"></canvas>
   <div style="display:flex;gap:6px;margin:4px 0" id="bqRow">${["後排","中排","前排"].map((t,i)=>`<button data-r="${i}" style="${BS(i===1)}padding:6px 14px">${t}</button>`).join("")}<button id="bqU" style="${BS(0)}padding:6px 12px">↩ 拿掉</button></div>
   <div id="bqS" style="width:min(96vw,440px);display:flex;gap:6px;overflow-x:auto;padding:4px 2px;touch-action:pan-x">${BQF.map(f=>`<div data-f="${f[0]}" style="flex:none;width:58px;text-align:center;font:800 10.5px ${UI_FONT};color:#6a4a32;background:#fffaf3;border-radius:10px;padding:2px 0"><img src="${MZIMG("flw/"+f[0]+".webp")}" draggable="false" style="height:54px;max-width:58px;object-fit:contain;pointer-events:none"><br><span style="color:#5a3a22!important;opacity:1;text-shadow:none;pointer-events:none">${f[1]}</span></div>`).join("")}</div>
   <div style="width:min(96vw,440px);display:flex;gap:5px;overflow-x:auto;padding:2px" id="bqW">${BQW.map(w=>`<button data-w="${w[0]}" style="${BS(0)}padding:3px 7px"><img src="${MZIMG("flw/"+w[0]+".webp")}" style="height:30px;vertical-align:middle">${w[1]}</button>`).join("")}</div>
   <div style="width:min(96vw,440px);display:flex;gap:5px;overflow-x:auto;padding:2px" id="bqR">${BQR.map(w=>`<button data-b="${w[0]}" style="${BS(0)}padding:3px 7px"><img src="${MZIMG("flw/"+w[0]+".webp")}" style="height:26px;vertical-align:middle">${w[1]}</button>`).join("")}</div>
   <button class="primary" id="bqOk" style="margin:6px 0 calc(env(safe-area-inset-bottom,0px) + 8px);padding:9px 26px">💐 完成，交給客人</button>`;
  const cv=B.querySelector("#bqC"), x=cv.getContext("2d"); const RS=[.82,1,1.12];
  const wrapBox=()=>({w:236,h:236,x:CX-118,y:H2-250});
  const fH=f=>f[2]==="leaf"||f[2]==="gyp"?150:f[2]==="hyd"||f[2]==="sunf"?118:130;
  const drawF=(p,a)=>{ const f=BQB[p.id], im=bqImg(p.id); if(!im.complete||!im.naturalWidth) return; const h=fH(f)*RS[p.r], w=h*im.naturalWidth/im.naturalHeight; x.globalAlpha=a||1; x.save(); x.translate(p.x,p.y); x.rotate((p.x-CX)/700); x.drawImage(im,-w/2,-h*.18,w,h); x.restore(); x.globalAlpha=1; };
  const draw=()=>{ x.clearRect(0,0,W2,H2); const wb=wrapBox();
    if(st.wrap){ const im=bqImg(st.wrap); if(im.naturalWidth) x.drawImage(im,wb.x,wb.y,wb.w,wb.h); } /* paper, back layer */
    [0,1,2].forEach(r=>st.pl.filter(p=>p.r===r&&p!==drag?.p).forEach(p=>drawF(p)));
    if(st.wrap){ const im=bqImg(st.wrap); if(im.naturalWidth){ const c=.46; x.drawImage(im,0,im.naturalHeight*c,im.naturalWidth,im.naturalHeight*(1-c),wb.x,wb.y+wb.h*c,wb.w,wb.h*(1-c)); } } /* paper, front layer over the stems */
    else { x.fillStyle="rgba(90,60,40,.25)"; x.beginPath(); x.ellipse(CX,H2-30,46,12,0,0,7); x.fill(); x.fillStyle="#7a5a3a"; x.font=`700 12px ${UI_FONT}`; x.textAlign="center"; x.fillText("（還沒選包裝紙）",CX,H2-8); }
    if(st.bow){ const im=bqImg(st.bow); if(im.naturalWidth){ const w=92, h=w*im.naturalHeight/im.naturalWidth; x.drawImage(im,CX-w/2,wb.y+wb.h*.66-h/2,w,h); } }
    if(drag&&drag.p) drawF(drag.p,.85); else if(drag) drawF({id:drag.id,x:drag.x,y:drag.y,r:st.row},.75);
    x.fillStyle="#7a5a3a"; x.font=`800 12px ${UI_FONT}`; x.textAlign="left"; x.fillText(`${st.pl.length} 枝`,8,16); };
  const pos=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*W2/r.width,(e.clientY-r.top)*H2/r.height,e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom]; };
  const inZone=(px,py)=>px>40&&px<W2-40&&py>30&&py<H2-150;
  /* from the shelf: press a flower and pull it up (a sideways swipe still scrolls the shelf), or just tap it to drop it in the middle */
  const sh=B.querySelector("#bqS"); let pd=null;
  sh.addEventListener("pointerdown",e=>{ const it=e.target.closest("[data-f]"); if(!it) return; pd={id:it.dataset.f,x0:e.clientX,y0:e.clientY,pid:e.pointerId}; });
  const mv=e=>{ if(pd&&!drag){ const dx=e.clientX-pd.x0, dy=e.clientY-pd.y0; if(dy<-12&&Math.abs(dy)>Math.abs(dx)){ drag={id:pd.id,x:0,y:0}; GSN.slide(); } else if(Math.abs(dx)>14) pd=null; }
    if(drag){ const [px,py]=pos(e); if(drag.p){ drag.p.x=px; drag.p.y=py; } else { drag.x=px; drag.y=py; } draw(); } };
  const upF=e=>{ if(drag){ const [px,py,inside]=pos(e); if(drag.p){ if(!inside||!inZone(px,py)){ st.pl.splice(st.pl.indexOf(drag.p),1); GSN.miss(); } else GSN.snip(); } else if(inside&&inZone(px,py)){ st.pl.push({id:drag.id,x:px,y:py,r:st.row}); GSN.snip(); } drag=null; draw(); }
    else if(pd&&Math.hypot(e.clientX-pd.x0,e.clientY-pd.y0)<10){ st.pl.push({id:pd.id,x:CX+(Math.random()-.5)*90,y:110+Math.random()*70,r:st.row}); GSN.snip(); draw(); } pd=null; };
  window.addEventListener("pointermove",mv); window.addEventListener("pointerup",upF); window.addEventListener("pointercancel",upF);
  /* move a flower that is already in: press it (the front-most under your finger); pull it out of the bouquet to take it away */
  cv.addEventListener("pointerdown",e=>{ const [px,py]=pos(e); for(const r of [2,1,0]){ const hit=[...st.pl].reverse().find(p=>p.r===r&&Math.abs(p.x-px)<26&&py>p.y-28&&py<p.y+60); if(hit){ drag={p:hit}; draw(); return; } } });
  B.querySelectorAll("#bqRow [data-r]").forEach(b=>b.onclick=()=>{ st.row=+b.dataset.r; B.querySelectorAll("#bqRow [data-r]").forEach(q=>q.style.cssText=BS(q===b)+"padding:6px 14px"); GSN.clack(); });
  B.querySelector("#bqU").onclick=()=>{ st.pl.pop(); GSN.slide(); draw(); };
  B.querySelectorAll("[data-w]").forEach(b=>b.onclick=()=>{ st.wrap=b.dataset.w; B.querySelectorAll("[data-w]").forEach(q=>q.style.cssText=BS(q===b)+"padding:3px 7px"); GSN.flip(); draw(); });
  B.querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{ st.bow=b.dataset.b; B.querySelectorAll("[data-b]").forEach(q=>q.style.cssText=BS(q===b)+"padding:3px 7px"); GSN.flip(); draw(); });
  const fin=()=>{ if(st.done) return; st.done=1; clearInterval(tm); window.removeEventListener("pointermove",mv); window.removeEventListener("pointerup",upF); window.removeEventListener("pointercancel",upF); };
  const tm=setInterval(()=>{ if(G.ov._quit||!G.ov.isConnected){ fin(); return; } st.t--; const el=B.querySelector("#bqT"); if(el){ el.textContent=Math.max(0,st.t); el.style.background=st.t<=15?"#c0392b":"#7a3a1a"; } if(st.t<=15&&st.t>0) GSN.tick(); if(st.t<=0) hand(true); },1000);
  B.querySelector("#bqOk").onclick=()=>{ if(!st.pl.length){ toast("先放幾枝花進去吧",1500); return; } hand(false); };
  const hand=late=>{ fin(); draw(); const pic=cv.toDataURL("image/png"); const R=bqScore(O,st,late); G.close(); bqResult(O,R,pic); };
  setTimeout(draw,300); setTimeout(draw,1200); draw(); GSN.start(); }
function bqScore(O,st,late){ const P=st.pl.map(p=>BQB[p.id]), notes=[]; let miss=false;
  /* 1. the asked-for flowers (35) */ let s1=0; O.req.forEach(([k,c,n])=>{ const have=P.filter(f=>f[2]===k&&(!c||f[3]===c)).length; if(!have){ miss=true; notes.push(`少了客人指定的${c?BQC[c]:""}${BQK[k]}`); } else if(have<n) notes.push(`${c?BQC[c]:""}${BQK[k]}要 ${n} 枝，只放了 ${have} 枝`); s1+=35/O.req.length*Math.min(1,have/n); });
  /* 2. colours (25): the share of flowers (not leaves) in the colours asked for; "*" = as many colours as you can */ const fl=P.filter(f=>f[3]!=="green"); let s2=0;
  if(O.col[0]==="*"){ const n=new Set(fl.map(f=>f[3])).size; s2=25*Math.min(1,n/3); if(n<3) notes.push("客人想要更多種顏色"); }
  else if(fl.length){ const ok=fl.filter(f=>O.col.includes(f[3])).length/fl.length; s2=25*ok; if(ok<.8) notes.push(`有些花的顏色不是客人要的（${O.col.filter(c=>BQC[c]).map(c=>BQC[c]).join("、")}色）`); }
  /* 3. counts and "please don't" (20) */ let s3=0; const exact=O.req.every(([k,c,n,ex])=>{ const have=P.filter(f=>f[2]===k&&(!c||f[3]===c)).length; return ex?have===n:have>=n; }); if(exact) s3+=8; else if(!miss) notes.push("指定的數量不太對");
  const tot=P.length; if(tot>=O.tot[0]&&tot<=O.tot[1]) s3+=6; else notes.push(tot<O.tot[0]?"花束有點太少了":"花束放太多枝了");
  let bad=0; if(O.no){ if(O.no.kind) bad+=P.filter(f=>O.no.kind.includes(f[2])).length; if(O.no.col) bad+=P.filter(f=>O.no.col.includes(f[3])).length; if(O.no.other) bad+=P.filter(f=>f[3]!=="green"&&!O.req.some(([k,c])=>f[2]===k&&(!c||f[3]===c))).length; } if(!bad) s3+=6; else notes.push(`客人說了：${O.noTxt||"有不要的花"}`);
  /* 4. paper and bow (10) */ let s4=0; if(st.wrap&&O.wrap.includes(st.wrap)) s4+=6; else notes.push(st.wrap?"包裝紙跟客人想要的感覺不太搭":"忘了包裝紙"); if(st.bow&&O.bow.includes(st.bow)) s4+=4; else notes.push(st.bow?"緞帶顏色可以再搭一點":"忘了緞帶");
  /* 5. time (10) */ const s5=late?0:Math.round(Math.min(10,2+16*st.t/BQT)); if(late) notes.push("時間到了，客人等太久");
  let sc=Math.round(s1+s2+s3+s4+s5); if(miss) sc=Math.min(sc,89); /* (missing what they asked for: two stars at most) */
  const star=sc>=90?3:sc>=70?2:sc>=50?1:0; return {sc,star,notes,parts:[s1,s2,s3,s4,s5].map(Math.round)}; }
function bqResult(O,R,pic){ const pay=[0,200,300,500][R.star]; if(pay){ bag.coins+=pay; save(); try{ profSave(true); chaChing(); }catch(e){} } (R.star?GSN.win:GSN.lose)();
  const said=R.star===3?"哇！跟我想的一模一樣，謝謝你！":R.star===2?"很漂亮，謝謝！":R.star===1?"嗯……還可以，謝謝。":"這……好像不是我要的耶。";
  rankPost("flower",R.sc).then(j=>openSheet("lfFlw2","💐 交給客人",`<div style="text-align:center"><img src="${pic}" style="width:62%;max-width:240px;border-radius:14px;background:#fff6ea"></div><p class="lead" style="text-align:center;font-size:22px;margin:4px 0">${"★".repeat(R.star)}${"☆".repeat(3-R.star)}　${R.sc} 分</p><p class="lead">${O.who}：「${said}」</p><p class="note">指定花材 ${R.parts[0]}/35・顏色 ${R.parts[1]}/25・數量與要求 ${R.parts[2]}/20・包裝 ${R.parts[3]}/10・時間 ${R.parts[4]}/10${R.notes.length?"<br>"+R.notes.slice(0,4).map(n=>"・"+n).join("<br>"):""}</p><p class="lead">${pay?`雅琪店長：「辛苦了！這是這張單的打工費。」（平安幣 +${pay}）`:"雅琪店長：「沒關係，下一張單再加油！」"}</p>${rankHtml("flower",j,1)}<div class="row"><button class="primary" data-act="lfFlwGo">接下一張單</button></div>`)); }
L.bqScore=bqScore; L.bqGame=()=>bqGame();

/* ---------- 🍦 超巨大冰淇淋 (3D): hold your finger down to let the soft serve flow, and twist the cookie cone left/right by dragging. Turn it
   at the right speed for the flow: too slow and the cream piles up on one side (the tower leans and falls), too fast and the ribbon
   thins and snaps. Each full turn is a ring; the cone is lowered as it grows. Ranked by rings each day: next day the top 5 get
   2 扭蛋幣, 6–10th 500 平安幣, everyone else who played 300. ---------- */
GL["tw:ice"]=async()=>{ const j=await rankGet("ice"); let got=""; try{ const r=await fetch("/rankclaim",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({g:"ice",uid:GU(),name:me.name||"香客"})}); const c=await r.json();
    if(c&&c.rank){ if(c.rank<=5){ bag.gacha=Math.min(255,(bag.gacha||0)+2); got=`🎉 昨天你是第 ${c.rank} 名！奶奶送你 2 枚扭蛋幣。`; } else if(c.rank<=10){ bag.coins+=500; got=`昨天你是第 ${c.rank} 名，奶奶送你 500 平安幣。`; } else { bag.coins+=300; got=`謝謝你昨天來玩（第 ${c.rank} 名），奶奶送你 300 平安幣。`; } save(); } }catch(e){}
  openSheet("lfIce3","🍦 超巨大冰淇淋",`${got?`<p class="lead">${got}</p>`:""}<p class="lead">奶奶：「冰淇淋會一直流下來喔！用下面的圓盤轉餅乾杯、移動杯子，讓冰平均地疊上去，越高越好！」</p><p class="note">一次 30 平安幣。每天的排名第二天結算：前 5 名 2 枚扭蛋幣、6～10 名 500 平安幣、其他參加的人 300 平安幣。</p><div class="row"><button class="primary" data-act="lfIceGo">來擠！（30 幣）</button></div>${rankHtml("ice",j)}`); };
HANDLERS.lfIceGo=()=>{ closeSheet(); if(!pay()) return; iceGame(); };
/* a soft-serve rope: a 6-pointed star in cross-section (real ridges, not a picture), slowly twisting along its length */
function starTube(pts,R,tw0,old){ const curve=new T.CatmullRomCurve3(pts); curve.arcLengthDivisions=Math.max(200,pts.length*8); const L=curve.getLength(), seg=Math.max(2,Math.round(L/.02)), RS=30;
  const g=new T.TubeGeometry(curve,seg,R,RS,false), P=g.attributes.position.array, Nm=g.attributes.normal.array; /* three's own tube, then each ring is pushed in and out into a 6-pointed star */
  for(let i=0;i<=seg;i++){ const tw=tw0+(i/seg)*L*1.6; for(let j=0;j<=RS;j++){ const k=(i*(RS+1)+j)*3, a=j/RS*Math.PI*2, f=.8+.2*Math.cos(6*(a+tw))-1; P[k]+=Nm[k]*R*f; P[k+1]+=Nm[k+1]*R*f; P[k+2]+=Nm[k+2]*R*f; } }
  g.computeVertexNormals(); if(old) old.dispose(); return {g,len:L}; }
function iceGame(){ /* 11/14 (the chair's recording of the softserve game): the nozzle stays put and the cream comes out as one thick ridged rope that
   bends down to wherever it lands. Your finger on the pad moves the cone under it (where your finger is = where the cone is), so going
   round in circles lays the rope in rings and the tower grows. Rope landing with nothing under it droops or falls off; a tower whose top
   drifts away from its base starts to lean and sway, and past a point it topples. The camera backs off as it grows. Ranked by height. */
  const G=gOverlay("🍦 超巨大冰淇淋","linear-gradient(#d9e8ec,#aac6d0)"), B=G.B; B.style.top="0";
  B.innerHTML=`<canvas id="icC" style="position:absolute;left:0;top:0;width:100%;height:66%"></canvas><div id="icN" style="position:absolute;right:18px;top:calc(66% - 58px);color:#2f3f3a;font:900 36px ${UI_FONT};pointer-events:none">0.0</div><div id="icH" style="position:absolute;left:14px;top:calc(66% - 34px);color:#8e1c14;font:800 14px ${UI_FONT};pointer-events:none"></div>
   <div id="icD" style="position:absolute;left:0;right:0;bottom:0;height:34%;background:#e2ecd8;border-radius:24px 24px 0 0;touch-action:none"><svg id="icS" viewBox="-150 -150 300 300" style="position:absolute;left:50%;top:46%;width:min(62vw,250px);height:min(62vw,250px);transform:translate(-50%,-50%);pointer-events:none"><circle r="120" fill="none" stroke="#9ab09a" stroke-width="3" stroke-dasharray="4 8"/><circle r="5" fill="#6f8a70"/><circle id="icK" r="18" fill="rgba(111,138,112,.25)" stroke="#6f8a70" stroke-width="3" cx="0" cy="0" opacity="0"/></svg><div style="position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);text-align:center;color:#6f8a70;font:700 13px ${UI_FONT};pointer-events:none">手指在這裡畫圈，移動甜筒接住冰淇淋</div></div><button class="primary" id="icDone" style="position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 56px);width:auto;min-height:0;padding:8px 16px">完成</button>`;
  const cv=B.querySelector("#icC"); let R; try{ R=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true}); }catch(e){ G.close(); toast("這台裝置畫不出 3D 冰淇淋",2000); return; }
  const sc=new T.Scene(), cam=new T.PerspectiveCamera(32,1,.05,80); sc.add(new T.HemisphereLight("#fffaf0","#c9b89c",1.05)); sc.add(new T.AmbientLight("#ffffff",.18)); const dl=new T.DirectionalLight("#ffffff",.7); /* (softer: the cream's shadows were too dark — 主委 11/14) */ dl.position.set(2.5,4,3.5); sc.add(dl); const dl2=new T.DirectionalLight("#dfe8ff",.35); dl2.position.set(-3,1,-2); sc.add(dl2);
  const fit=()=>{ const w=cv.clientWidth, h=cv.clientHeight; R.setPixelRatio(Math.min(2,devicePixelRatio||1)); R.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); }; fit(); addEventListener("resize",fit);
  const NOZ=1.0, RR=.1, CR=.3, CM=8.3; /* nozzle tip height, rope radius, cone mouth radius, cm per unit */
  const steel=new T.MeshStandardMaterial({color:"#5f7a70",roughness:.5,metalness:.15}); const pipe=new T.Mesh(new T.CylinderGeometry(.07,.07,6,20),steel); pipe.position.y=NOZ+3.2; sc.add(pipe); const col=new T.Mesh(new T.CylinderGeometry(.15,.15,.12,24),steel); col.position.y=NOZ+.2; sc.add(col); const tip=new T.Mesh(new T.CylinderGeometry(.11,.12,.14,24),steel); tip.position.y=NOZ+.07; sc.add(tip);
  /* the ridged cream (stripes round the rope) */ const rib=cvs(16,64,(x,w,h)=>{ for(let y=0;y<h;y++){ const v=.5+.5*Math.cos(y/h*Math.PI*2*7); const c=Math.round(205+45*v); x.fillStyle=`rgb(${c},${Math.round(c*.965)},${Math.round(c*.86)})`; x.fillRect(0,y,w,1); } }); rib.wrapS=rib.wrapT=T.RepeatWrapping;
  const cream=new T.MeshStandardMaterial({color:"#f6e8c8",roughness:.55,emissive:"#1c170e"});
  const cone=new T.Group(); sc.add(cone); const tilt=new T.Group(); cone.add(tilt);
  const waffle=cvs(128,128,(x,w,h)=>{ x.fillStyle="#c98e52"; x.fillRect(0,0,w,h); x.strokeStyle="#e2b47a"; x.lineWidth=3; for(let i=-w;i<w*2;i+=16){ x.beginPath(); x.moveTo(i,0); x.lineTo(i+h,h); x.stroke(); x.beginPath(); x.moveTo(i,h); x.lineTo(i+h,0); x.stroke(); } }); waffle.wrapS=waffle.wrapT=T.RepeatWrapping; waffle.repeat.set(3,2);
  const cm=new T.Mesh(new T.ConeGeometry(CR,.82,40,1,true),new T.MeshStandardMaterial({map:waffle,roughness:.85,side:T.DoubleSide})); cm.rotation.x=Math.PI; cm.position.y=-.41; cone.add(cm); const rim=new T.Mesh(new T.TorusGeometry(CR,.022,10,40),new T.MeshStandardMaterial({color:"#d9a066",roughness:.8})); rim.rotation.x=Math.PI/2; cone.add(rim);
  const inner=new T.Mesh(new T.CircleGeometry(CR-.01,40),new T.MeshStandardMaterial({color:"#9a6a3a",roughness:.9})); inner.rotation.x=-Math.PI/2; inner.position.y=-.05; cone.add(inner);
  const pile=new T.Group(); tilt.add(pile);
  /* what is under each spot (cone-local), so the rope stacks */ const N=60, EX=.75, cell=2*EX/N, H=new Float32Array(N*N).fill(-99); const ci=v=>Math.floor((v+EX)/cell);
  const sup=(x,z)=>{ let m=-99; const r=Math.ceil(RR*.4/cell), i0=ci(x), j0=ci(z); for(let j=j0-r;j<=j0+r;j++) for(let i=i0-r;i<=i0+r;i++){ if(i<0||j<0||i>=N||j>=N) continue; if(H[j*N+i]>m) m=H[j*N+i]; } if(m<-50&&Math.hypot(x,z)<CR-.03) m=-.05; return m; };
  const stamp=(x,z,y)=>{ const r=Math.ceil(RR*.75/cell), i0=ci(x), j0=ci(z); for(let j=j0-r;j<=j0+r;j++) for(let i=i0-r;i<=i0+r;i++){ if(i<0||j<0||i>=N||j>=N) continue; const px=-EX+(i+.5)*cell, pz=-EX+(j+.5)*cell; if(Math.hypot(px-x,pz-z)>RR*.75) continue; const k=j*N+i; if(y>H[k]) H[k]=y; } };
  /* a scoop already fills the cone mouth, so the first ring has something to sit on */ { const dome=new T.Mesh(new T.SphereGeometry(CR*.97,36,12,0,Math.PI*2,0,Math.PI/2),cream); dome.scale.y=.42; dome.position.y=-.04; cone.add(dome); /* (the cone and its first scoop never lean: only the cream above does — 主委 11/14) */ for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const px=-EX+(i+.5)*cell, pz=-EX+(j+.5)*cell, r=Math.hypot(px,pz); if(r<CR*.97) H[j*N+i]=-.04+CR*.97*.42*Math.sqrt(1-(r/(CR*.97))**2); } }
  cone.position.y=NOZ-.42; /* (start where it will be, not rising into place under the cream) */
  const S={tx:0,tz:0,x:0,z:0,touch:false,seg:[],pts:[],top:0,dist:0,spill:0,t:0,over:false,sway:0,lean:0,lx:0,lz:0,camY:0,fall:new T.Vector3(0,0,0),drop:false}; window.__ICE=S; S._cone=cone; S._tilt=tilt;
  const D=B.querySelector("#icD"), K=B.querySelector("#icK"), SV=B.querySelector("#icS");
  const dial=e=>{ const r=SV.getBoundingClientRect(); const cx=r.left+r.width/2, cy=r.top+r.height/2, rad=r.width/2*120/150; let dx=(e.clientX-cx)/rad, dy=(e.clientY-cy)/rad; const d=Math.hypot(dx,dy); if(d>1){ dx/=d; dy/=d; } S.tx=dx*.34; S.tz=dy*.34; K.setAttribute("cx",dx*120); K.setAttribute("cy",dy*120); K.setAttribute("opacity","1"); };
  D.addEventListener("pointerdown",e=>{ e.preventDefault(); S.touch=true; try{ D.setPointerCapture(e.pointerId); }catch(_){ } dial(e); }); D.addEventListener("pointermove",e=>{ if(S.touch) dial(e); }); const up=()=>{ S.touch=false; K.setAttribute("opacity",".4"); }; D.addEventListener("pointerup",up); D.addEventListener("pointercancel",up);
  B.querySelector("#icDone").onclick=()=>finish("完成！");
  let live=null; const liveDraw=()=>{ if(S.seg.length<2){ if(live) live.visible=false; return; } const r=starTube(S.seg.map(p=>p.v),RR,S.tw||0,live&&live.geometry); if(!live){ live=new T.Mesh(r.g,cream); pile.add(live); } else if(live.geometry!==r.g) live.geometry=r.g; live.visible=true; };
  const flush=()=>{ if(S.seg.length<2){ S.seg=S.seg.slice(-1); return; } const r=starTube(S.seg.map(p=>p.v),RR,S.tw||0); pile.add(new T.Mesh(r.g,cream)); S.tw=(S.tw||0)+r.len*1.6; S.seg=S.seg.slice(-1); if(live) live.visible=false; }; /* (the piece being laid is redrawn every frame, so the cream grows smoothly instead of appearing a chunk at a time) */
  let rope=null; const ropeAt=(a,b)=>{ const mid=new T.Vector3((a.x+b.x)*.5,(a.y+b.y)*.5+.04,(a.z+b.z)*.5); const r=starTube([a,new T.Vector3(0,a.y-.14,0),mid,b],RR*1.02,-S.t*2.5,rope&&rope.geometry); if(!rope){ rope=new T.Mesh(r.g,cream); sc.add(rope); } else if(rope.geometry!==r.g) rope.geometry=r.g; };
  const finish=line=>{ if(S.over) return; S.over=true; S.line=line; S.endT=0; flush(); if(rope) rope.visible=false; try{ (line.startsWith("完成")?[784,988,1175,1568]:[300,220]).forEach((f,i)=>tone(f,.14,.05,line.startsWith("完成")?"triangle":"sawtooth",i*.09)); }catch(e){} };
  const lay=(lx,lz)=>{ const prev=S.pts[S.pts.length-1]; let s=sup(lx,lz), y;
    /* soft cream does not stand on a point: on top of a narrow heap it squashes into it instead of building a stick (keep moving the cone to build up) */
    const nv=[]; if(s>-50) for(let k=0;k<6;k++){ const a=k*Math.PI/3, q=sup(lx+Math.cos(a)*RR*1.7,lz+Math.sin(a)*RR*1.7); nv.push(q<-50?-.05:q); } nv.sort((a,b)=>b-a); const cap=nv.length?nv[1]+RR*1.7:99; /* (a stick has nothing high beside it; a ring has its own coil on both sides) */
    if(s<-50){ S.off=(S.off||0)+1; if(prev&&S.off<2){ y=prev.y-.03; } else { finish("冰沒接到，掉到地上了！"); return; } } /* (cream that misses the cone falls: the round is over — 主委 11/14) */ /* (nothing under it: it can hang over the edge for a moment, then the whole thing comes down) */ /* (nothing below: it droops off the last bit for a moment, then falls off) */
    else { S.off=Math.max(0,(S.off||0)-.34); y=Math.min(s+RR*.82,cap,S.still>.35?(S.mvTop??.09)+RR*1.3:99); /* (holding the cone still only makes a little knob: you have to keep circling to build it up) */ if(prev&&Math.hypot(lx-prev.x,lz-prev.z)<.06) y=prev.y+Math.max(-.045,Math.min(.012,y-prev.y)); } /* (the rope climbs and dips gently, not in steps) */
    if(prev&&Math.hypot(lx-prev.x,y-prev.y,lz-prev.z)<.008) return; /* (two points on one spot break the rope's curve and it vanished) */ const p={x:lx,y,z:lz,v:new T.Vector3(lx,y,lz),h:s<-50}; S.pts.push(p); S.seg.push(p); const old=S.pts[S.pts.length-9]; if(old&&!old.h) stamp(old.x,old.z,old.y+RR*.75); /* (a bit hanging over the edge holds nothing up) */ /* (a bit of rope only holds up what comes after the next few: the rope cannot sit on itself as it is laid) */ if(y+RR>S.top) S.top=y+RR; if(S.seg.length>=40) flush(); };
  const balance=()=>{ /* how far the upper half of the tower has drifted from the lower half */ if(S.pts.length<30) return 0; const h=S.top*.5; let ax=0,az=0,an=0,bx=0,bz=0,bn=0; for(const p of S.pts){ if(p.y>h){ ax+=p.x; az+=p.z; an++; } else { bx+=p.x; bz+=p.z; bn++; } } if(!an||!bn) return 0; const dx=ax/an-bx/bn, dz=az/an-bz/bn; S.ldx=dx; S.ldz=dz; return Math.hypot(dx,dz); };
  let last=performance.now(); const loop=now=>{ if(!G.ov.isConnected){ R.dispose(); try{ R.forceContextLoss(); }catch(e){} removeEventListener("resize",fit); return; }
    const dt=Math.min(.05,(now-last)/1000); last=now; S.t+=dt;
    if(!S.over){ const k=Math.min(1,dt*9); S.x+=(S.tx-S.x)*k; S.z+=(S.tz-S.z)*k; const sp=Math.hypot(S.x-(S.px??S.x),S.z-(S.pz??S.z))/Math.max(dt,1e-3); S.px=S.x; S.pz=S.z; S.vs=(S.vs||0)+(sp-(S.vs||0))*Math.min(1,dt*4); if(S.vs<.12) S.still=(S.still||0)+dt; else { S.still=0; S.mvTop=S.top; } const lx=-S.x, lz=-S.z; /* (on a still cone the cream coils by itself in a small ring, as soft serve does; moving the cone takes over) the nozzle is at x=z=0: in the cone's own frame it lands at minus the cone's offset */
      S.dist+=(S.still>.35||!S.moved)?0:dt*.95; if(S.vs>.12) S.moved=1; /* (held still: the cream sinks into the top instead of laying more rope) */ const nst=Math.floor(S.dist/.026), px0=S.plx??lx, pz0=S.plz??lz; for(let k=1;k<=nst;k++){ S.dist-=.026; const f=k/nst; lay(px0+(lx-px0)*f,pz0+(lz-pz0)*f); } if(nst){ S.plx=lx; S.plz=lz; S.ss=(S.ss||0)-dt; if(S.ss<=0){ S.ss=.17; GSN.squish(); } } /* (spread along the way the cone moved this frame: on a slow frame they all landed on one spot) */ liveDraw();
      const off=balance(), risk=off*Math.max(.4,S.top)*3.2; S.sway+=dt*(1.6+S.top*.6); const st=Math.max(0,Math.min(1,(S.top-.35)/.4)); /* (the first layers stick to the cone and do not sway) */ const sw=Math.min(.12,S.top*.02+risk*.25)*Math.sin(S.sway)*st; const ang=Math.min(.6,risk*.45)*st;
      const dir=Math.atan2(S.ldz||0,S.ldx||0); tilt.rotation.z=-Math.cos(dir)*ang+sw; tilt.rotation.x=Math.sin(dir)*ang+sw*.4;
      if(S.top>.6&&risk>1) finish("失去平衡了！");
      const gy=NOZ-.42-S.top; cone.position.set(S.x,cone.position.y+(gy-cone.position.y)*Math.min(1,dt*4),S.z);
      const tp=S.pts[S.pts.length-1]; const land=tp&&!(S.still>.35)&&S.moved?new T.Vector3(tp.x,tp.y,tp.z):new T.Vector3(lx,Math.max(-.05,sup(lx,lz))-RR*.25,lz); /* (sinks a little into the cream, so it plainly lands) */ tilt.localToWorld(land); S.fall.lerp(land,S.fall.lengthSq()?Math.min(1,dt*12):1); ropeAt(new T.Vector3(0,NOZ,0),S.fall.clone());
      B.querySelector("#icN").textContent=(S.top*CM).toFixed(1); B.querySelector("#icH").textContent=risk>.6&&S.top>.4?"⚠️ 快倒了！把甜筒移回中間":S.spill>8&&S.t-S.spt<2?"冰掉出去了！":"";
      if(S.spill!==S.spl){ S.spl=S.spill; S.spt=S.t; } }
    else { S.endT+=dt; if(S.line.startsWith("完成")){ cone.rotation.y+=dt*.8; } else { const d=S.fd||(S.fd=(tilt.rotation.z>=0?1:-1)); tilt.rotation.z+=dt*(1+S.endT*2.5)*d; tilt.position.y-=dt*S.endT*1.6; tilt.position.x+=dt*d*-.5; } /* (only the cream topples off; the cone stays where it is) */
      if(S.endT>2.2&&!S.sent){ S.sent=1; const mm=Math.round(S.top*CM*10); G.close(); rankPost("ice",mm).then(j=>openSheet("lfIce4","🍦 超巨大冰淇淋",`<p class="lead">${S.line} 高 ${(mm/10).toFixed(1)} cm！</p>${rankHtml("ice",j,1)}<p class="note">排名明天結算，記得回來找奶奶領獎。</p><div class="row"><button class="primary" data-act="lfIceGo">再擠一支（30 幣）</button></div>`)); } }
    /* the camera backs off so the nozzle and the whole cone stay in view */ const lo=cone.position.y-.9, hi=NOZ+.35, span=hi-lo, mid=(lo+hi)/2; const dist=span/2/Math.tan(cam.fov*Math.PI/360)*1.12/Math.min(1,cam.aspect*1.6); S.camY+=(mid-S.camY)*Math.min(1,dt*3); cam.position.set(0,S.camY+span*.08,Math.max(2.4,dist)); cam.lookAt(0,S.camY,0);
    R.render(sc,cam); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

/* the burger game ranks too */ L.rankBurger=n=>rankPost("burger",n);
/* the shop prizes in the bag: 大還丹, 鹹粥, 藥材包, 食譜, 疾走之書 */
{ const E0=L.bagEntries, A0=L.bagActs, I0=L.bic; const EM={g_dht:"💊",g_cg:"🥣",g_rcp:"📕",g_spd:"👟"}; PACKS.forEach(p=>EM["g_"+p[0]]="🧧");
  L.bic=(k,cls)=>{ const id=k.slice(3); if(EM[id]) return `<span class="bic ${cls||""}" style="display:flex;align-items:center;justify-content:center;font-size:34px;background:none">${EM[id]}</span>`; return I0(k,cls); };
  L.bagEntries=(out,tab)=>{ E0(out,tab); if(tab!=="all"&&tab!=="goods") return; const d=LF();
    if(d.dhtI>0) out.push({id:"lf:g_dht",ic:"lf_g_dht",n:d.dhtI,name:"大還丹",desc:`中藥行許伯給的。吃了精力上限永久 +1（已經吃了 ${d.dht|0} / 100 顆，上限 ${enMax()}）。`});
    if(d.cg>0) out.push({id:"lf:g_cg",ic:"lf_g_cg",n:d.cg,name:"鹹粥",desc:`一粥七天的鹹粥。吃了今天會比較幸運（現在 ${L.luck()}，最多 50），釣魚比較容易遇到稀有的魚。`});
    PACKS.forEach(p=>{ const n=d.pk&&d.pk[p[0]]; if(n>0) out.push({id:"lf:g_"+p[0],ic:"lf_g_"+p[0],n,name:p[1],desc:"中藥行許伯送的。之後可以帶回家煮成料理，自己吃或送給鎮上的人。"}); });
    if((d.rcp||[]).length) out.push({id:"lf:g_rcp",ic:"lf_g_rcp",n:d.rcp.length,name:"食譜",desc:"書店老闆送的食譜："+d.rcp.join("、")+"。之後可以在家照著煮。"});
    if(d.spd>0) out.push({id:"lf:g_spd",ic:"lf_g_spd",name:"疾走之書",desc:`讀過以後走路永久變快（現在 +${d.spd}%，最多 15%）。`}); };
  L.bagActs=(k,e)=>k==="g_dht"?`<button class="chip" data-act="lfEatDht">吃一顆</button>`:k==="g_cg"?`<button class="chip" data-act="lfEatCongee">吃一碗</button>`:k.startsWith("g_")?"":A0(k,e); }

/* ---------- 📷 照相館：爺爺奶奶的相簿 (11/14). The first visit, 阿光 tells the story and gives you his grandparents' camera; a 📷 button
   appears. The album has the places the chair has set (up to 50): each damp, blurred old photo shows where grandpa and grandma once
   stood. Go there, face the same way, and take the picture — it goes into the album in its place. The chair's camera has one more
   button: 「設為委託地點」 takes the photo with grandpa and grandma standing in the middle, and saves the spot for everyone. ---------- */
KEEP["tw:photo"]={ppl:[{n:"阿光",v:"man",look:[0,13,1,13,2,2,0,1,0,1,0,1,0,1],sh:{leg:1.08,tor:1.02,w:.94,d:.92,head:1,arm:1.04}}],mode:"idle",
  lines:[[0,"歡迎光臨……啊，你是第一次來吧？"]],quick:[[0,"相簿的照片，有找到新的地方嗎？"]]};
const PH=()=>{ const d=LF(); d.ph=d.ph||{cam:0,got:{}}; d.ph.got=d.ph.got||{}; return d.ph; };
let PS=null; async function psList(force){ if(PS&&!force) return PS; try{ const r=await fetch("/photospots",{cache:"no-store"}); const j=await r.json(); PS=(j&&j.list)||[]; }catch(e){ PS=PS||[]; } return PS; }
const PSI={}; async function psImg(i){ if(PSI[i]) return PSI[i]; try{ const r=await fetch("/photospot?i="+i); const j=await r.json(); if(j&&j.img) PSI[i]=j.img; }catch(e){} return PSI[i]||""; }
const myPhoto=i=>{ try{ return localStorage.getItem("mz.ph."+i)||""; }catch(e){ return ""; } };
const STORY=["這間照相館，是我爺爺奶奶留下來的。","他們兩個年輕的時候，最喜歡一起到處走走、到處拍照。","走之前，他們把一本相簿交給我，裡面全是他們去過的地方……","可是最近相簿受潮了，照片一張一張壞掉，連在哪裡都快看不出來了。","我想把爺爺奶奶看過的世界留下來。你可以幫我嗎？","這台是爺爺的相機，借你。照著相簿，到那些地方，從一樣的角度拍一張就好。"];
GL["tw:photo"]=()=>{ const P=PH(); if(!P.cam){ let i=0; const step=()=>{ openSheet("lfPhStory","📷 照相館・阿光",`<p class="lead" style="line-height:1.9">「${STORY[i]}」</p><div class="row"><button class="primary" data-act="lfPhNext">${i<STORY.length-1?"……":"好，交給我！"}</button></div>`); try{ const S=KS["tw:photo"]; if(S) keepSay(S.avs[0],STORY[i].slice(0,18)+(STORY[i].length>18?"……":"")); }catch(e){} }; HANDLERS.lfPhNext=()=>{ i++; if(i<STORY.length) step(); else { P.cam=1; save(); camBtn(); try{ [523,659,784,1047].forEach((f,k)=>tone(f,.12,.05,"triangle",k*.08)); }catch(e){} toast("📷 拿到爺爺奶奶的相機！右下角多了相機按鈕",3600); album(); } }; step(); return; } album(); };
async function album(){ const L=await psList(true), P=PH(), got=Object.keys(P.got).length;
  openSheet("lfAlbum","📔 爺爺奶奶的相簿",`<p class="lead">已經拍回 ${got} / ${L.length||0} 張。${L.length?"點一張看看它在哪裡。":"阿光還在整理相簿，過幾天再來看看。"}</p><div id="alG" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${L.map(s=>`<button data-act="lfPhOne" data-v="${s.i}" style="position:relative;aspect-ratio:4/3;border-radius:8px;border:2px solid ${P.got[s.i]?"#4c9a6a":"#c9b48a"};background:#e9dcc2 center/cover;overflow:hidden;padding:0" id="al${s.i}"><span style="position:absolute;left:4px;bottom:3px;font:800 11px ${UI_FONT};color:#fff;text-shadow:0 1px 2px #000">${s.i+1}${P.got[s.i]?" ✔":""}</span></button>`).join("")}</div>${me.sp?`<p class="note">主委：拿出相機，按「📌 設為委託地點」就能新增一張（最多 50 張）。</p>`:""}`);
  L.forEach(async s=>{ const mine=P.got[s.i]&&myPhoto(s.i); const el=()=>document.getElementById("al"+s.i); if(mine){ const e=el(); if(e) e.style.backgroundImage=`url(${mine})`; return; } const img=await psImg(s.i); const e=el(); if(e&&img){ e.style.backgroundImage=`linear-gradient(135deg,rgba(120,90,40,.35),rgba(60,80,60,.2) 40%,rgba(140,110,60,.45)),url(${img})`; e.style.filter="sepia(.75) blur(1.6px) contrast(.8) brightness(1.05)"; } }); }
HANDLERS.lfPhOne=async v=>{ const i=+v, L=await psList(), s=L.find(q=>q.i===i); if(!s) return; const P=PH(), mine=P.got[i]&&myPhoto(i), img=await psImg(i);
  openSheet("lfPhOne",`📔 第 ${i+1} 張・${s.name}`,`<div style="display:grid;grid-template-columns:${mine?"1fr 1fr":"1fr"};gap:8px"><div><img src="${img}" style="width:100%;border-radius:10px;${mine?"":"filter:sepia(.75) blur(1.6px) contrast(.8)"}"><p class="note" style="text-align:center">爺爺奶奶的照片</p></div>${mine?`<div><img src="${mine}" style="width:100%;border-radius:10px"><p class="note" style="text-align:center">你拍的</p></div>`:""}</div><p class="lead">${s.area?`地點：${s.area}。`:""}${mine?"已經拍回來了！":"去那裡，面向同一個方向拍一張。"}</p>${me.sp?`<div class="row"><button class="secondary" data-act="lfPhDel" data-v="${i}">刪掉這個地點（主委）</button></div>`:""}`); };
HANDLERS.lfPhDel=async v=>{ const key=ck(); if(!key){ toast("先在主委工具輸入密碼",2400); return; } try{ const r=await fetch("/photospot",{method:"POST",headers:{"content-type":"application/json","x-key":key},body:JSON.stringify({del:+v})}); const j=await r.json(); if(j.ok){ PS=j.list; delete PSI[+v]; toast("刪掉了",1600); album(); } else toast("刪不掉（密碼？）",2000); }catch(e){ toast("連不上伺服器",2000); } };
/* the 📷 button and the camera */
function camBtn(){ if(!PH().cam||document.getElementById("camBtn")) return; const b=document.createElement("button"); b.id="camBtn"; b.className="glass"; b.textContent="📷"; b.setAttribute("aria-label","相機");
  b.style.cssText="position:fixed;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 150px);width:48px;height:48px;border-radius:50%;font-size:22px;z-index:6;color:#fff"; b.onclick=e=>{ e.stopPropagation(); camOpen(); }; document.body.appendChild(b); }
setTimeout(camBtn,2500);
const camYaw=()=>{ const d=new T.Vector3(); camera.getWorldDirection(d); return Math.atan2(d.x,d.z); };
function snap(w){ renderer.render(scene,camera); const src=renderer.domElement, h=Math.round(w*src.height/src.width), c=document.createElement("canvas"); c.width=w; c.height=h; c.getContext("2d").drawImage(src,0,0,w,h); return c.toDataURL("image/jpeg",.72); }
function camOpen(){ if(document.getElementById("camOv")) return; const ov=document.createElement("div"); ov.id="camOv"; ov.style.cssText="position:fixed;inset:0;z-index:40;pointer-events:none";
  ov.innerHTML=`<div style="position:absolute;inset:12% 8% 22% 8%;border:2px solid rgba(255,255,255,.85);border-radius:6px;box-shadow:0 0 0 2000px rgba(0,0,0,.25)"></div><div style="position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 14px);text-align:center;color:#fff;font:900 16px ${UI_FONT};text-shadow:0 1px 3px #000">📷 爺爺的相機　轉動視角，對好就按快門</div>
   <div style="position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);display:flex;justify-content:center;gap:16px;align-items:center;pointer-events:auto"><button class="secondary" id="camX">離開</button><button id="camS" style="width:74px;height:74px;border-radius:50%;border:5px solid #fff;background:rgba(255,255,255,.35)"></button><button class="secondary" id="camA">相簿</button>${me.sp?`<button class="primary" id="camSet">📌 設為委託地點</button>`:""}</div>`;
  document.body.appendChild(ov); document.body.classList.add("hideui"); const close=()=>{ ov.remove(); document.body.classList.remove("hideui"); };
  ov.querySelector("#camX").onclick=close; ov.querySelector("#camA").onclick=()=>{ close(); album(); };
  ov.querySelector("#camS").onclick=async()=>{ const flash=document.createElement("div"); flash.style.cssText="position:fixed;inset:0;background:#fff;z-index:41;opacity:.9;transition:opacity .4s;pointer-events:none"; document.body.appendChild(flash); setTimeout(()=>flash.style.opacity=0,30); setTimeout(()=>flash.remove(),450); try{ tone(2400,.03,.06,"square"); tone(1200,.05,.05,"square",.05); }catch(e){}
    const url=snap(360), L=await psList(), P=PH(), x=meAv.pos.x, z=meAv.pos.y, yaw=camYaw(); let hit=null;
    for(const s of L){ if(P.got[s.i]) continue; const d=Math.hypot(x-s.x,z-s.z), dy=Math.abs(Math.atan2(Math.sin(yaw-s.yaw),Math.cos(yaw-s.yaw))); if(d<5&&dy<.7){ hit=s; break; } }
    if(hit){ P.got[hit.i]=1; try{ localStorage.setItem("mz.ph."+hit.i,url); }catch(e){} const n=Object.keys(P.got).length; let gift=100; bag.coins+=gift; let extra=""; if(n%10===0){ bag.gacha=Math.min(255,(bag.gacha||0)+1); extra="，還有 1 枚扭蛋幣"; } save(); try{ profSave(true); [784,988,1175,1568].forEach((f,k)=>tone(f,.14,.05,"triangle",k*.08)); }catch(e){}
      close(); openSheet("lfPhGot","📔 拍回來了！",`<p class="lead">第 ${hit.i+1} 張「${hit.name}」，和爺爺奶奶的照片一模一樣的角度！</p><img src="${url}" style="width:100%;border-radius:10px"><p class="note">阿光送你 ${gift} 平安幣${extra}。（已經拍回 ${n} 張）</p><div class="row"><button class="primary" data-act="lfPhAlbum">看相簿</button></div>`); }
    else { const near=L.filter(s=>!P.got[s.i]).map(s=>[s,Math.hypot(x-s.x,z-s.z)]).sort((a,b)=>a[1]-b[1])[0]; toast(near&&near[1]<5?"位置對了，但角度不太一樣，轉一下視角再拍":near&&near[1]<15?"附近好像有相簿裡的地方……":"拍好了！（這裡不是相簿裡的地方）",2600); } };
  const setBtn=ov.querySelector("#camSet"); if(setBtn) setBtn.onclick=()=>chairSetSpot(close); }
HANDLERS.lfPhAlbum=()=>album(); L.ph={album:()=>album(),cam:()=>camOpen(),set:()=>chairSetSpot(()=>{ const o=document.getElementById("camOv"); if(o){ o.remove(); document.body.classList.remove("hideui"); } })}; /* (test hooks) */
/* the chair: put grandpa and grandma in the middle of the picture, take it, and save the spot */
const GPA=[0,18,5,4,1,0,11,1,0,1,0,1,0,1], GMA=[0,22,5,7,3,4,0,1,0,2,1,0,1,2];
async function chairSetSpot(close){ const key=ck(); if(!key){ toast("先在主委工具輸入密碼",2600); return; } const d=new T.Vector3(); camera.getWorldDirection(d); d.y=0; d.normalize(); const side=new T.Vector3(d.z,0,-d.x);
  /* their feet go where the line through the lower middle of the picture meets the ground, so they stand in the middle of the photo */
  const rc=new T.Raycaster(); rc.setFromCamera(new T.Vector2(0,-.3),camera); const rd=rc.ray.direction; let dist=rd.y<-.02?(camera.position.y-0)/(-rd.y):7; dist=Math.max(3,Math.min(14,dist)); const hit=camera.position.clone().addScaledVector(rd,dist); const base=new T.Vector3(hit.x,0,hit.z); const avs=[];
  [[GPA,-.45,"爺爺"],[GMA,.45,"奶奶"]].forEach(([look,o,n])=>{ const p=base.clone().addScaledVector(side,o); const av=new Avatar(sanitizeLook(look.slice()),{npc:true,x:p.x,z:p.z}); av.root.rotation.y=Math.atan2(-d.x,-d.z)+(o<0?.25:-.25); av.rotY=av.root.rotation.y; try{ av.update(.016); av.root.rotation.y=av.rotY; if(av.label) av.label.visible=false; if(av.nameTag) av.nameTag.visible=false; }catch(e){} avs.push(av); });
  const hideMe=meAv.root.visible; meAv.root.visible=false; await new Promise(r=>setTimeout(r,120)); const url=snap(420); meAv.root.visible=hideMe; avs.forEach(av=>{ try{ scene.remove(av.root); av.dispose&&av.dispose(); }catch(e){} });
  close(); openSheet("lfPhSet","📌 設為委託地點",`<img src="${url}" style="width:100%;border-radius:10px"><p class="lead">替這張照片取個名字，再寫個地點提示：</p><input id="phN" maxlength="20" placeholder="例如：老街的燈籠" style="width:100%;margin:4px 0;padding:8px;border-radius:8px"><input id="phA" maxlength="20" placeholder="例如：小鎮・老街" style="width:100%;margin:4px 0;padding:8px;border-radius:8px"><div class="row"><button class="primary" data-act="lfPhSave">存成委託地點</button></div>`);
  HANDLERS.lfPhSave=async()=>{ const name=(document.getElementById("phN")||{}).value||"", area=(document.getElementById("phA")||{}).value||""; try{ const r=await fetch("/photospot",{method:"POST",headers:{"content-type":"application/json","x-key":key},body:JSON.stringify({x:meAv.pos.x,z:meAv.pos.y,yaw:camYaw(),name,area,img:url})}); const j=await r.json(); if(j.ok){ PS=j.list; PSI[j.i]=url; toast(`📌 存好了，第 ${j.i+1} 張`,2400); album(); } else toast(j.full?"已經 50 張了":j.big?"照片太大":"存不進去（密碼？）",2600); }catch(e){ toast("連不上伺服器",2000); } }; }

/* ---------- 營業時間與鎮民生活 (11/14): each shop keeps (Taiwan) hours. Outside them the shop shows its hours and its people are out
   walking up and down their street; the chair can always go in. Every day you visit a shop its people like you a little more
   (+1, up to 100); at 10, 30 and 60 they start telling you things — gossip about the others, a secret, a request. ---------- */
const HOURS={"tw:bfast":[6,13],"tw:congee":[18,26],"tw:drink":[10,22],"tw:ice":[11,21],"tw:herb":[9,20],"tw:book":[10,21],"tw:flower":[9,19],"tw:beauty":[10,20],"tw:photo":[10,19],"tw:tackle":[5,20],"tw:furn":[10,21]};
const twHour=()=>{ if(typeof TM.hour==="number") return TM.hour; const d=new Date(Date.now()+8*3600e3); return d.getUTCHours()+d.getUTCMinutes()/60; }; /* (主委測試模式 can set the clock) */
const isOpen=k=>{ const h=HOURS[k]; if(!h) return true; const t=twHour(); return h[1]>24?(t>=h[0]||t<h[1]-24):(t>=h[0]&&t<h[1]); };
const hrs=k=>{ const h=HOURS[k], f=v=>String(v%24).padStart(2,"0")+":00"; return `${f(h[0])}–${f(h[1])}`; };
const GOSSIP={
 "tw:bfast":[["阿龍：「其實……我們每天吵，是因為她記性比我好，我不想輸啦。」"],["秀琴：「偷偷跟你說，阿龍年輕時追我，每天送我一份蘿蔔糕。」"],["兩個人一起：「你可以幫我們找一張『結婚那天』的照片嗎？聽說照相館阿光的爺爺有拍……」（隱藏任務）"]],
 "tw:herb":[["許伯：「冰淇淋奶奶年輕的時候，可是鎮上最漂亮的姑娘。」"],["許伯：「我年輕時常常去她的攤子買冰……一買就是五十年。」"],["許伯：「我想送她一包桂圓，可是……你能幫我拿過去嗎？」（隱藏任務）"]],
 "tw:ice":[["奶奶：「中藥行的許伯每天下午都來買一支香草的，從來不換口味。」"],["奶奶：「他以為我不知道他眼睛不好……其實我都幫他擠大支一點。」"],["奶奶：「我想吃他的藥膳，可是開不了口……」"]],
 "tw:drink":[["小安：「阿哲每天偷喝一杯全糖珍奶，然後說他在試新口味。」"],["阿哲：「小安喜歡書店的文雄老闆，每次都多送他一顆布丁。」"],["小安：「可以幫我送一杯烏龍奶茶給文雄老闆嗎？不要說是我送的！」（隱藏任務）"]],
 "tw:book":[["文雄：「書店裡最貴的書，是一本沒有名字的相簿，我一直在等它的主人。」"],["文雄：「照相館的阿光小時候常來看圖鑑，看到睡著。」"],["文雄：「那本相簿……好像是阿光爺爺寄放在這裡的。」（照相館隱藏線索）"]],
 "tw:photo":[["阿光：「爺爺說，奶奶最喜歡天后宮廟埕的燈籠。」"],["阿光：「書店的文雄老闆好像知道一些爺爺的事，可是他每次都說『時候還沒到』。」"],["阿光：「如果相簿拍滿五十張……爺爺說，最後一頁會告訴我一件事。」（相簿最後的秘密）"]],
 "tw:flower":[["雅琪：「美容院的 Kevin 每週都來買一枝白色桔梗，從來不說要送誰。」"],["雅琪：「我以前在台北教花，是為了照顧媽媽才回小鎮的。」"],["雅琪：「Kevin 說的『那個人』……好像就是我？」"]],
 "tw:beauty":[["Kevin：「花店的雅琪老師，是我國中時的家教老師。」"],["Kevin：「我開美容院，是因為她說過『你剪頭髮很有天分』。」"],["Kevin：「幫我想想，要怎麼跟她說謝謝比較好？」（隱藏任務）"]],
 "tw:tackle":[["阿財伯：「女神泉那裡，傳說有人釣到過金色的魚。」"],["阿財伯：「老王跟我年輕時比釣魚，比了三十年還沒分出勝負。」"],["阿財伯：「流星夜的海邊，會有平常看不到的魚……噓，別說是我講的。」"]],
 "tw:furn":[["美雲：「我會打瞌睡，是因為半夜都在做木工，送給鎮上的小朋友。」"],["美雲：「一粥七天的玲姊，是我小學同學，每天半夜我都去她那裡吃粥。」"],["美雲：「你房間要不要一張特別的椅子？我做給你。」（隱藏任務）"]],
 "tw:congee":[["玲姊：「家具行的美雲每天半夜一點來，一碗鹹粥不加芹菜。」"],["阿秀：「早餐店的阿龍和秀琴，其實是我介紹認識的。」"],["阿秀：「我的鹹粥秘方，是用許伯的陳皮熬的高湯。」"]]};
const KA=k=>{ const d=LF(); d.ka=d.ka||{}; return d.ka[k]=d.ka[k]||{a:0,d:0}; };
/* (11/14: the hours and the gossip are handled when you walk into the shop — see 走進店裡) */

L.flowerShop=()=>flower();
const SOON={"tw:gh2":["🌱 溫室二號","溫室二號"],"tw:gh3":["🌱 溫室三號","溫室三號"]};
L.more4=k=>{ if(SOON[k]&&!(L.games&&L.games[k])){ openSheet("lfSoon",SOON[k][0],`<p class="lead">${SOON[k][1]}正在準備中，很快就好！</p>`); return true; } if(L.games&&L.games[k]){ L.games[k](); return true; } if(k==="tw:bfast"){ bfastOpen(); return true; } if(k==="tw:garden"){ gardenOpen(); return true; } if(k==="tw:flower"){ flower(); return true; } return false; };
L.garden=gardenOpen;

/* ---------- into the save code (the 取回碼 and the server's copy): rod, bought styles, the fish book, fish in the bag (how many of
   each kind; sizes come back as a typical size), the townsfolk's affinity, the garden (seeds, harvest, what grows in each bed), and
   meteor finds. Order matters: FISH, NPCS and SEEDS may only ever be added to at the end. ---------- */
L.pack=put=>{ const d=LF(), o=d.own||{}, g=GD2(); put(5,3); /* (version 3: + rods, baits; 4: + 疊漢堡 best and the 1000 prize; 5: + camera, album, 大還丹, 走路) */ put(FISH.length,7); put(d.rod|0,2); ["h","e","m","n"].forEach(k=>put(o[k]|0,10));
  FISH.forEach(f=>{ const e=d.fish[f.id]; put(e?Math.min(63,e[0]):0,6); if(e) put(Math.min(511,Math.round(e[1])),9); });
  const ic={}; d.inv.forEach(([id])=>ic[id]=(ic[id]||0)+1); FISH.forEach(f=>put(Math.min(40,ic[f.id]||0),6));
  NPCS.forEach(n=>{ const R=(d.npc||{})[n.id]||{}; put(Math.min(100,R.a|0),7); put((R.r|0)&7,3); });
  SEEDS.forEach(q=>put(Math.min(31,g.seed[q[0]]|0),5)); SEEDS.forEach(q=>put(Math.min(127,g.crop[q[0]]|0),7));
  g.beds.forEach(b=>{ const i=b?SEEDS.findIndex(q=>q[0]===b.s):-1; put(i+1,3); if(i>=0){ grow(b,Date.now()); put(Math.min(15,Math.round(b.p*5)),4); put(b.w?1:0,1); } });
  put(Math.min(63,d.stone|0),6); put(Math.min(255,d.dust|0),8); put(d.rods&4095,12); put(d.eqF|0,4); put(d.eqS|0,4); put(Math.min(15,d.godOK|0),4); d.bait.forEach(n=>put(Math.min(127,n|0),7)); put(d.bF|0,5); put(d.bS|0,5); const bb=d.bg||{}; put(Math.min(1023,bb.best|0),10); put(bb.h?1:0,1); const ph=d.ph||{}; put(ph.cam?1:0,1); for(let i=0;i<50;i++) put(ph.got&&ph.got[i]?1:0,1); put(Math.min(100,d.dht|0),7); put(Math.min(127,d.dhtI|0),7); put(Math.min(15,d.spd|0),4); };
L.unpack=get=>{ const v=get(3); if(v<1||v>5) return null; const NF=v===1?33:Math.min(FISH.length,get(7)), FL=FISH.slice(0,NF); const o={rod:get(2),own:{h:get(10),e:get(10),m:get(10),n:get(10)},fish:{},inv:[],npc:{},seed:{},crop:{},beds:[]};
  FL.forEach(f=>{ const n=get(6); if(n) o.fish[f.id]=[n,get(9),Date.now()]; }); FL.forEach(f=>{ const n=get(6); for(let k=0;k<n;k++) o.inv.push([f.id,Math.round((f.sz[0]+f.sz[1])/2)]); });
  NPCS.forEach(n=>{ o.npc[n.id]={a:get(7),r:get(3),d:0,g:0}; }); SEEDS.forEach(q=>o.seed[q[0]]=get(5)); SEEDS.forEach(q=>o.crop[q[0]]=get(7));
  for(let i=0;i<12;i++){ const k=get(3); if(k){ const p=get(4)/5, w=get(1); o.beds.push(SEEDS[k-1]?{s:SEEDS[k-1][0],p,w,t:Date.now()}:null); } else o.beds.push(null); }
  o.stone=get(6); o.dust=get(8); if(v>=3){ o.rods=get(12); o.eqF=get(4); o.eqS=get(4); o.godOK=get(4); o.bait=[]; for(let i=0;i<20;i++) o.bait.push(get(7)); o.bF=get(5); o.bS=get(5); } if(v>=4){ o.bgBest=get(10); o.bgH=get(1); } if(v>=5){ o.phCam=get(1); o.phGot={}; for(let i=0;i<50;i++) if(get(1)) o.phGot[i]=1; o.dht=get(7); o.dhtI=get(7); o.spd=get(4); } return o; };
L.restore=o=>{ if(!o) return; const d=LF(), g=GD2(); d.rod=Math.max(d.rod|0,o.rod); if(o.rods!=null){ d.rods=(d.rods|0)|o.rods; d.eqF=d.eqF||o.eqF; d.eqS=d.eqS||o.eqS; d.godOK=Math.max(d.godOK|0,o.godOK); o.bait.forEach((n,i)=>{ d.bait[i]=Math.max(d.bait[i]|0,n); }); d.bF=d.bF||o.bF; d.bS=d.bS||o.bS; } else if(o.rod&&!d.rods) d.rods=o.rod>=2?0b1000011:1; d.own=d.own||{}; for(const k in o.own) d.own[k]=(d.own[k]|0)|o.own[k];
  for(const id in o.fish){ const e=d.fish[id], n=o.fish[id]; d.fish[id]=e?[Math.max(e[0],n[0]),Math.max(e[1],n[1]),e[2]]:n; }
  if(o.inv.length>=d.inv.length) d.inv=o.inv; d.npc=d.npc||{}; for(const id in o.npc){ const R=d.npc[id]; if(!R||R.a<o.npc[id].a) d.npc[id]=Object.assign(R||{d:0,g:0},{a:o.npc[id].a,r:(R?R.r|0:0)|o.npc[id].r}); }
  for(const k in o.seed) g.seed[k]=Math.max(g.seed[k]|0,o.seed[k]); for(const k in o.crop) g.crop[k]=Math.max(g.crop[k]|0,o.crop[k]); if(o.beds.some(b=>b)&&!g.beds.some(b=>b)) g.beds=o.beds;
  d.stone=Math.max(d.stone|0,o.stone); d.dust=Math.max(d.dust|0,o.dust); if(o.bgBest!=null){ d.bg=d.bg||{best:0,h:0}; d.bg.best=Math.max(d.bg.best|0,o.bgBest); d.bg.h=d.bg.h||o.bgH; } if(o.phCam!=null){ d.ph=d.ph||{cam:0,got:{}}; d.ph.cam=d.ph.cam||o.phCam; d.ph.got=Object.assign(d.ph.got||{},o.phGot); d.dht=Math.max(d.dht|0,o.dht); d.dhtI=Math.max(d.dhtI|0,o.dhtI); d.spd=Math.max(d.spd|0,o.spd); } save(); };
L.tick2=dt=>{ goddessTick(dt); mmTick(dt); try{ npcTick(dt); }catch(e){ console.warn("npcs",e); } if(L.tick3) L.tick3(dt); };
setTimeout(()=>{ try{ chipInit(); }catch(e){} },1800);
L.dbg=()=>({F,near,LF:LF(),pool,FGLB,HELD}); L.press=()=>press(); L.start=()=>startFish(); L.hold=id=>{ fishLoad(); let tries=0; const go=()=>{ if((!FGLB||!FGLB[id])&&tries++<200){ setTimeout(go,300); return; } if(HELD&&HELD.g&&HELD.g.parent) HELD.g.parent.remove(HELD.g); const f=FBY[id], g=fishMesh(f); g.scale.setScalar(.8); scene.add(g); HELD={g,t:.6,from:meAv.root.position.clone().add(new T.Vector3(Math.sin(meAv.rotY)*3,0,Math.cos(meAv.rotY)*3)),len:.8}; L.heldFreeze=1; }; go(); };
return L; })();

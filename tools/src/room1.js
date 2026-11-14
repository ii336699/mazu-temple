/* ================= 我的房間: a room of your own. Floor (10 patterns) and wallpaper (10 patterns) are drawn in code and take two
   colours each from a palette; rugs are the chair's pictures (public/room/rugNN.webp, loaded only when the room is opened).
   It is its own little scene shown through the shop layer (SHOPX.enter), so the temple is not drawn while you are inside. ================= */
ROOMX=(()=>{
const RM={};
const RW=6, RD=5, RH=2.8;
const PAL=["#f6efe2","#e8d5b5","#c9a47a","#a06a42","#6b432c","#3d2a20","#f6c9cf","#e58c8c","#b3261e","#7a1f24","#f3d98b","#d9aa3d","#b9d7b0","#5f8f6a","#2f5a44","#bcd9ea","#4f7fb0","#2c3550","#b9a6d9","#6d5a9c","#ffffff","#bdbdbd","#6b6b6b","#2b2b2b"];
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const sh=(h,k)=>{ const c=hx(h); return `rgb(${c.map(v=>Math.max(0,Math.min(255,Math.round(k>1?v+(255-v)*(k-1):v*k)))).join(",")})`; };
const al=(h,a)=>{ const c=hx(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
const rnd=s=>{ let a=s>>>0; return ()=>{ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; };
/* every pattern draws one 512×512 tile that repeats cleanly; a,b are the two colours */
const FLOORS=[
 {n:"原木地板",p:0,d:(x,a,b)=>{ const r=rnd(7); x.fillStyle=sh(a,.7); x.fillRect(0,0,512,512); for(let j=0;j<8;j++){ const off=(j*147)%256; for(let i=-1;i<3;i++){ x.fillStyle=sh(a,.86+r()*.22); x.fillRect(i*256+off+1,j*64+1,254,62); x.fillStyle=al(b,.10+r()*.08); for(let k=0;k<3;k++) x.fillRect(i*256+off+6,j*64+10+k*18+r()*6,244,1.5); } } }},
 {n:"人字拼木",p:0,d:(x,a,b)=>{ const r=rnd(11); x.fillStyle=sh(a,.65); x.fillRect(0,0,512,512); for(let c=0;c<8;c++){ const up=c%2?1:-1; for(let j=-3;j<19;j++){ const y=j*32; x.fillStyle=(j+c)%5===0?al(b,.9):sh(a,.84+r()*.26); x.beginPath(); x.moveTo(c*64+1,y+(up>0?64:0)); x.lineTo(c*64+63,y+(up>0?0:64)); x.lineTo(c*64+63,y+(up>0?0:64)+30); x.lineTo(c*64+1,y+(up>0?64:0)+30); x.closePath(); x.fill(); } } }},
 {n:"棋盤格磚",p:1500,d:(x,a,b)=>{ for(let j=0;j<4;j++) for(let i=0;i<4;i++){ x.fillStyle=(i+j)%2?b:a; x.fillRect(i*128,j*128,128,128); x.fillStyle="rgba(255,255,255,.07)"; x.fillRect(i*128+4,j*128+4,120,40); } x.strokeStyle="rgba(0,0,0,.18)"; x.lineWidth=2; for(let i=0;i<=4;i++){ x.beginPath(); x.moveTo(i*128,0); x.lineTo(i*128,512); x.moveTo(0,i*128); x.lineTo(512,i*128); x.stroke(); } }},
 {n:"大理石",p:1500,d:(x,a,b)=>{ const r=rnd(23); x.fillStyle=a; x.fillRect(0,0,512,512); for(let k=0;k<26;k++){ const x0=r()*512,y0=r()*512,l=80+r()*220,an=r()*6.28,w=.6+r()*2.4; x.strokeStyle=al(b,.10+r()*.28); x.lineWidth=w; for(const ox of [-512,0,512]) for(const oy of [-512,0,512]){ x.beginPath(); x.moveTo(x0+ox,y0+oy); x.bezierCurveTo(x0+ox+Math.cos(an)*l*.3+r()*30,y0+oy+Math.sin(an)*l*.3,x0+ox+Math.cos(an)*l*.6,y0+oy+Math.sin(an)*l*.6+30,x0+ox+Math.cos(an)*l,y0+oy+Math.sin(an)*l); x.stroke(); } } x.strokeStyle="rgba(0,0,0,.16)"; x.lineWidth=2; for(let i=0;i<=2;i++){ x.beginPath(); x.moveTo(i*256,0); x.lineTo(i*256,512); x.moveTo(0,i*256); x.lineTo(512,i*256); x.stroke(); } }},
 {n:"六角磚",p:1500,d:(x,a,b)=>{ const r=rnd(5), R=512/12, W=512/7; x.fillStyle=sh(b,.8); x.fillRect(0,0,512,512); for(let j=-1;j<9;j++) for(let i=-1;i<8;i++){ const cx=i*W+(j%2?W/2:0), cy=j*R*1.5; const m=(((i*3+j*5)%7)+7)%7; x.fillStyle=m===0?b:sh(a,.92+r()*.14); x.beginPath(); for(let k=0;k<6;k++){ const t=Math.PI/6+k*Math.PI/3; x.lineTo(cx+Math.cos(t)*(W/Math.sqrt(3)-2),cy+Math.sin(t)*(R-2)); } x.closePath(); x.fill(); } }},
 {n:"榻榻米",p:2000,d:(x,a,b)=>{ const mat=(X,Y,w,h,v)=>{ x.fillStyle=b; x.fillRect(X,Y,w,h); x.fillStyle=a; x.fillRect(X+(v?10:2),Y+(v?2:10),w-(v?20:4),h-(v?4:20)); x.strokeStyle="rgba(0,0,0,.07)"; x.lineWidth=1; for(let k=4;k<(v?w:h)-4;k+=4){ x.beginPath(); if(v){ x.moveTo(X+k,Y+2); x.lineTo(X+k,Y+h-2); } else { x.moveTo(X+2,Y+k); x.lineTo(X+w-2,Y+k); } x.stroke(); } x.strokeStyle="rgba(0,0,0,.3)"; x.strokeRect(X+.5,Y+.5,w-1,h-1); };
   mat(0,0,256,128,0); mat(0,128,256,128,0); mat(256,0,128,256,1); mat(384,0,128,256,1); mat(0,256,128,256,1); mat(128,256,128,256,1); mat(256,256,256,128,0); mat(256,384,256,128,0); }},
 {n:"水磨石",p:2000,d:(x,a,b)=>{ const r=rnd(41); x.fillStyle=a; x.fillRect(0,0,512,512); const cs=[b,sh(b,1.4),sh(b,.6),"#ffffff",sh(a,.7)]; for(let k=0;k<230;k++){ const cx=r()*512, cy=r()*512, s=3+r()*11, n=3+Math.floor(r()*4), c=cs[Math.floor(r()*cs.length)], an=r()*6.28; x.fillStyle=c; for(const ox of [-512,0,512]) for(const oy of [-512,0,512]){ if(cx+ox<-20||cx+ox>532||cy+oy<-20||cy+oy>532) continue; x.beginPath(); for(let i=0;i<n;i++){ const t=an+i/n*6.28; x.lineTo(cx+ox+Math.cos(t)*s*(.6+((i*7)%5)/8),cy+oy+Math.sin(t)*s*(.6+((i*3)%5)/8)); } x.closePath(); x.fill(); } } }},
 {n:"復古花磚",p:2500,d:(x,a,b)=>{ for(let j=0;j<4;j++) for(let i=0;i<4;i++){ const X=i*128, Y=j*128; x.fillStyle=a; x.fillRect(X,Y,128,128); x.fillStyle=b; for(const [cx,cy] of [[0,0],[128,0],[0,128],[128,128]]){ x.beginPath(); x.moveTo(X+cx,Y+cy); x.arc(X+cx,Y+cy,46,0,6.283); x.fill(); } x.fillStyle=a; for(const [cx,cy] of [[0,0],[128,0],[0,128],[128,128]]){ x.beginPath(); x.arc(X+cx,Y+cy,26,0,6.283); x.fill(); } x.fillStyle=b; x.beginPath(); x.moveTo(X+64,Y+40); x.lineTo(X+88,Y+64); x.lineTo(X+64,Y+88); x.lineTo(X+40,Y+64); x.closePath(); x.fill(); x.fillStyle=a; x.beginPath(); x.arc(X+64,Y+64,8,0,6.283); x.fill(); } x.save(); x.beginPath(); x.rect(0,0,512,512); x.clip(); x.strokeStyle="rgba(0,0,0,.2)"; x.lineWidth=2; for(let i=0;i<=4;i++){ x.beginPath(); x.moveTo(i*128,0); x.lineTo(i*128,512); x.moveTo(0,i*128); x.lineTo(512,i*128); x.stroke(); } x.restore(); }},
 {n:"編織拼花木",p:2500,d:(x,a,b)=>{ const r=rnd(3); x.fillStyle=sh(a,.6); x.fillRect(0,0,512,512); for(let j=0;j<4;j++) for(let i=0;i<4;i++){ const v=(i+j)%2; for(let k=0;k<4;k++){ x.fillStyle=k===0&&v?al(b,.85):sh(a,.86+r()*.24); if(v) x.fillRect(i*128+k*32+1,j*128+1,30,126); else x.fillRect(i*128+1,j*128+k*32+1,126,30); } } }},
 {n:"菱格磚",p:2500,d:(x,a,b)=>{ x.fillStyle=a; x.fillRect(0,0,512,512); x.fillStyle=b; for(let j=-1;j<9;j++) for(let i=-1;i<9;i++){ if((i+j)%2) continue; const cx=i*64, cy=j*64; x.beginPath(); x.moveTo(cx,cy-64); x.lineTo(cx+64,cy); x.lineTo(cx,cy+64); x.lineTo(cx-64,cy); x.closePath(); x.fill(); } x.strokeStyle="rgba(0,0,0,.16)"; x.lineWidth=2; for(let k=-8;k<=16;k++){ x.beginPath(); x.moveTo(k*64,0); x.lineTo(k*64+512,512); x.moveTo(k*64,0); x.lineTo(k*64-512,512); x.stroke(); } }},
];
const WALLS=[
 {n:"素色",p:0,d:(x,a,b)=>{ const r=rnd(9); x.fillStyle=a; x.fillRect(0,0,512,512); for(let k=0;k<900;k++){ x.fillStyle=al(b,.03+r()*.05); x.fillRect(r()*512,r()*512,2+r()*5,1); } }},
 {n:"直條紋",p:0,d:(x,a,b)=>{ x.fillStyle=a; x.fillRect(0,0,512,512); x.fillStyle=b; for(let i=0;i<8;i++){ x.fillRect(i*64+16,0,32,512); } x.fillStyle=al(a,.5); for(let i=0;i<8;i++) x.fillRect(i*64+30,0,4,512); }},
 {n:"圓點",p:1500,d:(x,a,b)=>{ x.fillStyle=a; x.fillRect(0,0,512,512); x.fillStyle=b; for(let j=0;j<9;j++) for(let i=0;i<9;i++){ x.beginPath(); x.arc(i*64+(j%2?32:0),j*64,11,0,6.283); x.fill(); } }},
 {n:"菱格",p:1500,d:(x,a,b)=>{ x.fillStyle=a; x.fillRect(0,0,512,512); x.strokeStyle=b; x.lineWidth=3; for(let k=-4;k<=8;k++){ x.beginPath(); x.moveTo(k*128,0); x.lineTo(k*128+256,512); x.moveTo(k*128,0); x.lineTo(k*128-256,512); x.stroke(); } x.fillStyle=b; for(let j=0;j<=4;j++) for(let i=0;i<=8;i++){ x.beginPath(); x.arc(i*64,j*128+(i%2?64:0),6,0,6.283); x.fill(); } }},
 {n:"小碎花",p:1500,d:(x,a,b)=>{ x.fillStyle=a; x.fillRect(0,0,512,512); const fl=(cx,cy,s)=>{ x.fillStyle=b; for(let k=0;k<5;k++){ const t=k/5*6.283-1.57; x.beginPath(); x.ellipse(cx+Math.cos(t)*s*.55,cy+Math.sin(t)*s*.55,s*.42,s*.3,t,0,6.283); x.fill(); } x.fillStyle=sh(b,1.6); x.beginPath(); x.arc(cx,cy,s*.24,0,6.283); x.fill(); x.strokeStyle=al(b,.55); x.lineWidth=2; x.beginPath(); x.moveTo(cx,cy+s); x.quadraticCurveTo(cx+s*.6,cy+s*1.6,cx+s*.2,cy+s*2.2); x.stroke(); };
   for(let j=0;j<5;j++) for(let i=0;i<5;i++){ fl(i*128+(j%2?64:0),j*128,(i+j)%2?16:12); } }},
 {n:"大馬士革",p:2000,d:(x,a,b)=>{ x.fillStyle=a; x.fillRect(0,0,512,512); const mo=(cx,cy)=>{ x.fillStyle=al(b,.85); const leaf=(dx,dy,rx,ry,t)=>{ x.beginPath(); x.ellipse(cx+dx,cy+dy,rx,ry,t,0,6.283); x.fill(); }; leaf(0,-52,16,40,0); leaf(0,48,22,34,0); leaf(-34,-8,13,36,.7); leaf(34,-8,13,36,-.7); leaf(-52,44,10,26,1.1); leaf(52,44,10,26,-1.1); leaf(-22,-70,7,18,-.5); leaf(22,-70,7,18,.5); x.fillStyle=a; leaf(0,-52,6,24,0); leaf(0,48,9,18,0); x.beginPath(); x.arc(cx,cy-2,9,0,6.283); x.fill(); x.fillStyle=al(b,.85); x.beginPath(); x.arc(cx,cy-2,4,0,6.283); x.fill(); x.beginPath(); x.arc(cx,cy+100,6,0,6.283); x.fill(); };
   for(let j=-1;j<3;j++) for(let i=-1;i<3;i++){ mo(i*256+128,j*256+128); mo(i*256,j*256); } }},
 {n:"青海波",p:2000,d:(x,a,b)=>{ x.fillStyle=a; x.fillRect(0,0,512,512); for(let j=17;j>=-1;j--) for(let i=-1;i<9;i++){ const cx=i*64+(j%2?32:0), cy=j*32; for(let k=0;k<4;k++){ x.fillStyle=k%2?a:b; x.beginPath(); x.arc(cx,cy,32-k*8,Math.PI,0); x.closePath(); x.fill(); } } }},
 {n:"格紋",p:2000,d:(x,a,b)=>{ x.fillStyle=a; x.fillRect(0,0,512,512); x.fillStyle=al(b,.42); for(let i=0;i<4;i++){ x.fillRect(i*128+24,0,56,512); x.fillRect(0,i*128+24,512,56); } x.fillStyle=al(b,.7); for(let i=0;i<4;i++){ x.fillRect(i*128+100,0,5,512); x.fillRect(0,i*128+100,512,5); } }},
 {n:"星星",p:2500,d:(x,a,b)=>{ const r=rnd(77); x.fillStyle=a; x.fillRect(0,0,512,512); const st=(cx,cy,s)=>{ x.beginPath(); for(let k=0;k<10;k++){ const t=k/10*6.283-1.57, q=k%2?s*.42:s; x.lineTo(cx+Math.cos(t)*q,cy+Math.sin(t)*q); } x.closePath(); x.fill(); };
   for(let j=0;j<8;j++) for(let i=0;i<8;i++){ const s=5+r()*11; x.fillStyle=al(b,.55+r()*.45); st(i*64+(j%2?32:0)+16,j*64+24,s); } }},
 {n:"腰板",p:2500,vr:1,d:(x,a,b)=>{ x.fillStyle=a; x.fillRect(0,0,512,512); x.fillStyle=al(b,.10); for(let i=0;i<16;i++) x.fillRect(i*32+14,0,4,320); x.fillStyle=b; x.fillRect(0,318,512,194); x.fillStyle=sh(b,1.35); x.fillRect(0,312,512,14); x.fillStyle=sh(b,.7); x.fillRect(0,326,512,3); for(let i=0;i<2;i++){ x.strokeStyle=sh(b,.72); x.lineWidth=4; x.strokeRect(i*256+26,352,204,132); x.strokeStyle=sh(b,1.25); x.lineWidth=2; x.strokeRect(i*256+34,360,188,116); } x.fillStyle=sh(b,.6); x.fillRect(0,496,512,16); }},
];
/* rugs: [file number, name, width in metres at the middle size, price] */
const RUGS=[[1,"玫瑰米白地毯",2.4,4000],[2,"紅藍波斯地毯",2.4,5000],[3,"米灰幾何地毯",2.4,3000],[4,"藍紅金線地毯",2.4,4500],[5,"乳牛紋地毯",2.4,3000],[6,"虎紋地毯",2.4,3500],[7,"玫瑰酒紅地毯",2.4,4000],
  [8,"虎紋長毯",2.0,2000],[9,"乳牛紋長毯",2.0,2000],[10,"黑金幾何長毯",2.0,2500],[11,"粉紅貓掌毯",2.0,3500],[12,"流蘇棉麻長毯",2.2,2000],[13,"老虎造型毯",1.5,6000],[14,"乳牛紋圓毯",1.6,3000],[15,"抹茶雲朵毯",1.7,3000],[16,"黑金大理石地毯",2.2,3500],[17,"米白素面地毯",2.2,1500]];
const RSZ=[.75,1,1.3];
/* furniture: the chair's 232 models (public/room/f/<id>.glb, about 3000 triangles and one small picture each, fetched only when a piece
   is put out; <id>.webp is the shop thumbnail). One entry per piece: id|name|width|height|depth in metres|price|how you get it|flags|top.
   how: b buy, c 夾娃娃 gift box, q 每日功課 chest, f 節日紅包, g seventh sign-in day. flags: w hangs on a wall, s small enough to stand on a table,
   x not offered (kept out until the chair decides). top: height of the surface small things may stand on (0 = none).
   ONLY ADD TO THE END of this list: what players own is stored by position in it. */
const FM={}; const fm=(c,o)=>{ const k=c+(o?JSON.stringify(o):""); if(!FM[k]){ FM[k]=new T.MeshStandardMaterial({roughness:.8,...(o||{})}); FM[k].color.set(c).convertSRGBToLinear(); } return FM[k]; };
const FD="bed01|泡麵床|1.48|1.88|2.1|3900|f||0;bed02|馬桶床|1.23|1.61|2.1|4200|f||0;bed03|棺材床|1.35|1.49|2.1|2500|f||0;bed04|蝦壽司床|1.26|1.58|2.1|2900|f||0;bed05|香蕉床|1.51|1.43|2.1|3200|f||0;bed06|柴犬床|1.19|1.38|2.1|3600|f||0;bed07|元寶床|1.16|0.96|2.1|4000|f||0;bed08|街機床|1.37|1.73|2.1|4400|f||0;bed09|原木單人床|1.12|0.99|2.0|2600|b||0;bed10|花漾白床|1.15|1.26|2.0|3000|b||0;bed11|藤編床|1.05|1.16|2.0|3400|b||0;bed12|黑鐵木床|1.15|0.99|2.0|3800|b||0;bed13|中式紅木床|1.21|1.42|2.0|4100|b||0;bed14|青苔石床|1.08|1.11|2.0|4500|b||0;bed15|星月床|1.29|1.43|2.0|2800|b||0;bed16|貓咪床|1.14|1.3|2.0|3100|b||0;chair01|原木椅|0.63|0.9|0.81|1200|b||0;chair02|圓木椅|0.71|0.9|0.87|1400|b||0;chair03|白漆雕花椅|0.62|0.9|0.66|600|b||0;chair04|溫莎椅|0.62|0.9|0.66|800|b||0;chair05|鑄鐵咖啡椅|0.54|0.9|0.65|900|b||0;chair06|藤編扶手椅|0.82|0.9|0.77|1100|b||0;chair07|綠格紋軟墊椅|0.63|0.9|0.75|1300|b||0;chair08|小花椅|0.6|0.9|0.61|1400|g||0;chair09|松木椅|0.64|0.9|0.74|700|b||0;chair10|藍格坐墊白椅|0.67|0.9|0.76|800|b||0;chair11|樹枝椅|0.68|0.9|0.74|1000|b||0;chair12|黑鐵藤編椅|0.6|0.9|0.64|1200|b||0;chair13|白墊藤椅|0.78|0.9|0.96|1300|b||0;chair14|粉紅皮椅|0.64|0.9|0.76|1500|b||0;chair15|宮廷椅|0.61|0.9|0.69|700|b||0;chair16|和風座椅|0.6|0.55|0.58|900|b||0;chair17|直背木椅|0.6|0.9|0.74|1000|b||0;chair18|深色溫莎椅|0.61|0.9|0.71|1200|b||0;chair19|奶油雕花椅|0.64|0.9|0.69|1400|b||0;chair20|紅格坐墊木椅|0.72|0.9|0.8|600|b||0;chair21|課桌椅|0.62|0.9|0.7|800|b||0;chair22|白色殼椅|0.68|0.9|0.72|900|b||0;chair23|墨綠絨布椅|0.6|0.9|0.72|1100|b||0;chair24|美式餐廳椅|0.62|0.9|0.77|1300|g||0;table01|原木方桌|1.03|0.77|1.1|1600|b||0.77;table02|粉紅桌巾圓桌|1.1|0.76|1.1|1800|b||0.76;table03|樹樁桌|1.1|0.73|1.04|800|b||0.73;table04|玫瑰雕花桌|1.1|0.73|1.06|1000|b||0.73;table05|白色矮桌|1.1|0.5|0.74|1200|b||0.5;table06|愛心花邊桌|1.1|0.88|1.09|1500|b||0.88;table07|蘑菇桌|1.09|0.94|1.1|1700|g||0.94;table08|厚實工作桌|1.1|0.66|0.88|1900|b||0.66;table09|竹編桌|1.1|0.68|1.04|900|b||0.68;table10|雲朵桌|1.09|0.72|1.1|1100|b||0.72;table11|貝殼珊瑚桌|1.1|0.84|1.09|1300|b||0.84;table12|工業風木桌|1.1|0.74|1.07|1600|b||0.74;table13|檸檬桌|1.1|0.83|1.08|1800|g||0.83;table14|大理石宮廷桌|1.1|0.75|1.06|2000|b||0.75;table15|石雕圓桌|1.1|0.74|1.1|1000|b||0.74;table16|美式餐廳桌|1.1|0.8|1.02|1200|b||0.8;table17|黑大理石金腳桌|1.1|0.58|0.89|1400|b||0.58;table18|粉紅玻璃圓桌|1.06|0.59|1.1|1600|b||0.59;table19|白色豆豆桌|1.1|0.5|0.93|1800|b||0.5;table20|中式方桌|1.03|0.59|1.1|800|b||0.59;table21|愛心公主桌|1.1|0.74|0.93|1000|b||0.74;table22|鐵架推車桌|1.1|0.69|0.77|1200|b||0.69;table23|六角金架桌|1.1|0.49|0.84|1500|b||0.49;table24|炫彩果凍桌|1.1|0.64|1.07|1700|g||0.64;cabinet01|綠藤白衣櫃|1.3|1.9|1.02|4200|b||0;cabinet02|和風格子櫃|1.3|1.9|1.23|4700|b||0;cabinet03|星夜窗簾櫃|1.26|1.9|0.88|2500|b||0;cabinet04|森林精靈櫃|1.48|1.9|1.14|3000|b|x|0;cabinet05|古典雕花衣櫃|1.31|1.9|0.87|3400|b||0;cabinet06|鐵皮置物櫃|1.28|1.9|1.05|3900|b||0;cabinet07|中式紅漆櫃|1.5|1.9|1.2|4400|b||0;cabinet08|草莓蛋糕櫃|1.3|1.9|1.08|4800|b||0;cabinet09|城堡木門櫃|1.34|1.9|1.08|2700|b||0;cabinet10|白色鏡面衣櫃|1.28|1.9|0.79|3100|b||0;cabinet11|海洋貝殼櫃|1.4|1.9|0.92|3600|b||0;cabinet12|竹屋櫃|1.44|1.9|1.46|4100|b||0;cabinet13|工業風展示櫃|1.27|1.9|0.96|4500|b||0;cabinet14|紫色棺材櫃|1.33|1.9|1.14|5000|b||0;cabinet15|廟會攤車櫃|1.58|1.9|1.34|2800|b||0;cabinet16|彩虹雲朵櫃|1.3|1.9|0.94|3300|b||0;cabinet17|原木衣櫃|1.21|1.9|1.08|3800|b||0;cabinet18|奶油花卉衣櫃|1.24|1.9|0.85|4200|b||0;cabinet19|中式紅木櫃|1.29|1.9|1.07|4700|b||0;cabinet20|橘貓衣櫃|1.26|1.9|0.98|2500|b||0;cabinet21|櫻花矮櫃|0.72|1.0|0.52|3000|b||1.0;cabinet22|灰色鐵櫃|1.22|1.9|1.03|3400|b||0;cabinet23|星月衣櫃|1.3|1.9|0.83|3900|b||0;cabinet24|百葉矮櫃|0.85|1.0|0.68|4400|b||1.0;appl01|貓掌咖啡機|0.27|0.42|0.42|3000|c|s|0;appl02|貓咪電子鍋|0.28|0.3|0.3|3600|c|s|0;appl03|氣炸鍋|0.33|0.36|0.48|800|c|s|0;appl04|飲水機|0.51|1.05|0.55|1400|c||0;appl05|復古電暖器|0.45|0.5|0.3|2000|c|s|0;appl06|香氛水氧機|0.21|0.32|0.22|2600|c|s|0;appl07|貓咪掃地機器人|0.19|0.12|0.2|3200|c||0;appl08|掌上遊戲機|0.34|0.24|0.17|3800|c|s|0;appl09|映像管電視|0.5|0.62|0.47|1000|b|s|0;appl10|液晶電視櫃|1.11|1.05|0.62|1600|b||0;appl11|大型街機|0.9|1.7|1.46|2200|b||0;appl12|冰箱|1.08|1.7|1.16|2800|b||0;appl13|洗衣機|0.69|0.9|0.59|3400|b||0.9;appl14|冷氣機|0.7|0.32|0.28|4000|b|w|0;appl15|電風扇|0.59|1.0|0.5|1200|b||0;appl16|微波爐|0.47|0.34|0.45|1800|b|s|0;misc01|報紙床|1.77|1.3|1.9|500|c||0;misc02|紙箱桌|1.0|0.87|0.97|500|c||0.87;misc03|垃圾袋沙發|1.07|1.17|1.1|500|c||0;misc04|塑膠籃置物架|1.33|1.5|1.34|500|c||0;misc05|水桶椅|0.57|0.8|0.64|500|c||0;misc06|輪胎桌|0.84|0.77|0.85|500|c||0.77;misc07|塑膠袋燈|0.33|0.45|0.32|500|c|s|0;misc08|舊布門簾|1.68|1.7|0.67|500|c||0;plant01|繡球花|0.58|0.7|0.56|1000|b|s|0;plant02|紅玫瑰|0.61|0.7|0.52|1100|b|s|0;plant03|百合|0.53|0.7|0.48|600|b|s|0;plant04|向日葵|0.55|0.7|0.48|700|b|s|0;plant05|櫻花盆景|0.54|0.7|0.37|800|b|s|0;plant06|紫藤花架|0.79|0.9|0.66|900|b|s|0;plant07|牡丹|0.64|0.7|0.52|1000|b|s|0;plant08|荷花缽|0.54|0.7|0.54|1200|b|s|0;plant09|楓葉盆景|0.6|0.7|0.49|600|q|s|0;plant10|仙人掌|0.47|0.7|0.5|800|q|s|0;plant11|蝴蝶蘭|0.48|0.7|0.34|900|q|s|0;plant12|開運竹|0.51|0.7|0.34|1000|q|s|0;plant13|紫藤盆景|0.82|0.9|0.56|1100|q|s|0;plant14|多肉玻璃屋|0.59|0.7|0.6|1200|q|s|0;plant15|苔球蕨|0.64|0.7|0.54|700|q|s|0;plant16|燈籠果|0.56|0.7|0.43|800|q|s|0;deco01|水母水晶球|0.31|0.34|0.28|700|c|s|0;deco02|藍水晶|0.24|0.34|0.25|800|c|s|0;deco03|寶箱|0.33|0.3|0.34|400|c|s|0;deco04|麥克風獎座|0.26|0.34|0.26|500|c|s|0;deco05|場記板獎座|0.34|0.26|0.27|600|c|s|0;deco06|遊戲手把獎座|0.34|0.33|0.3|700|c|s|0;deco07|泡麵擺飾|0.34|0.33|0.28|800|c|s|0;deco08|摩天輪|0.28|0.34|0.28|900|c|s|0;deco09|小盆栽|0.3|0.34|0.28|400|b|s|0;deco10|書本書擋|0.33|0.27|0.34|500|b|s|0;deco11|布罩檯燈|0.29|0.34|0.28|600|b|s|0;deco12|手提唱片機|0.34|0.33|0.32|700|b|s|0;deco13|茶壺組|0.31|0.22|0.34|800|b|s|0;deco14|蘑菇玻璃罩|0.27|0.34|0.28|900|b|s|0;deco15|香氛蠟燭|0.3|0.32|0.34|500|b|s|0;deco16|小花瓶|0.28|0.34|0.23|600|b|s|0;deco17|玫瑰蠟燭|0.34|0.33|0.33|600|q|s|0;deco18|骷髏書擋|0.34|0.27|0.31|700|q|s|0;deco19|暗色提燈|0.22|0.34|0.23|800|q|s|0;deco20|黑盆黃金葛|0.32|0.31|0.34|400|q|s|0;deco21|紫水晶|0.3|0.34|0.32|500|q|s|0;deco22|紫沙漏|0.26|0.34|0.26|600|q|s|0;deco23|星象儀|0.23|0.34|0.21|700|q|s|0;deco24|小香爐|0.34|0.27|0.34|800|q|s|0;deco25|金環雕塑|0.29|0.34|0.29|900|b|s|0;deco26|擴香瓶|0.31|0.34|0.3|400|b|s|0;deco27|黑金地球儀|0.25|0.34|0.22|500|b|s|0;deco28|相框與盆栽|0.34|0.32|0.32|600|b|s|0;deco29|威士忌酒組|0.34|0.28|0.31|700|b|s|0;deco30|相機與書|0.34|0.25|0.31|800|b|s|0;deco31|翻頁鐘|0.34|0.27|0.21|900|b|s|0;deco32|飛機模型|0.34|0.29|0.29|500|b|s|0;deco33|留聲機|0.27|0.34|0.23|600|c|s|0;deco34|雪屋水晶球|0.28|0.34|0.27|600|c|s|0;deco35|達摩不倒翁|0.34|0.31|0.32|700|c|s|0;deco36|鳥籠|0.26|0.34|0.25|800|c|s|0;deco37|禮物盒|0.31|0.34|0.33|400|c|s|0;deco38|青瓷香爐|0.19|0.27|0.34|500|c|s|0;deco39|生態瓶|0.28|0.34|0.29|600|c|s|0;deco40|月兔燈|0.31|0.34|0.27|700|c|s|0;deco41|櫻花小盆景|0.29|0.34|0.23|800|q|s|0;deco42|招財貓|0.34|0.32|0.32|900|q|s|0;deco43|古董地球儀|0.23|0.34|0.21|400|q|s|0;deco44|木沙漏|0.22|0.34|0.22|500|q|s|0;deco45|金魚缸|0.27|0.34|0.25|600|q|s|0;deco46|信件盒|0.34|0.27|0.17|700|q|s|0;deco47|和紙燈籠|0.2|0.34|0.2|800|q|s|0;deco48|書上睡貓|0.33|0.34|0.32|900|q|s|0;curtain01|碎花蕾絲窗簾|1.7|1.91|0.53|1800|b|w|0;curtain02|星月深藍窗簾|1.7|1.92|0.6|1900|b|w|0;curtain03|中式紅金窗簾|1.7|1.92|0.58|1200|b|w|0;curtain04|龜背葉窗簾|1.7|1.9|0.52|1400|b|w|0;curtain05|紫藤窗簾|1.7|1.91|0.6|1500|b|w|0;curtain06|北歐馴鹿窗簾|1.7|1.94|0.55|1600|b|w|0;curtain07|黑金絲絨窗簾|1.7|1.91|0.53|1800|b|w|0;curtain08|粉格雲朵窗簾|1.7|1.87|0.59|2000|b|w|0;curtain09|紅絲絨窗簾|1.7|2.01|0.52|1200|q|w|0;curtain10|玫瑰蕾絲窗簾|1.7|1.98|0.49|1400|q|w|0;curtain11|夜空窗簾|1.7|1.95|0.45|1600|q|w|0;curtain12|竹葉米色窗簾|1.7|1.87|0.43|1700|q|w|0;curtain13|貓掌粉格窗簾|1.7|1.93|0.57|1800|q|w|0;curtain14|紫櫻和風窗簾|1.7|1.93|0.5|2000|q|w|0;curtain15|扶桑花窗簾|1.7|1.93|0.43|1300|q|w|0;curtain16|深灰素面窗簾|1.7|1.98|0.46|1400|q|w|0;curtain17|米白蝴蝶結窗簾|1.7|1.75|0.43|1600|b|w|0;curtain18|皇冠紅絨窗簾|1.7|1.98|0.52|1800|b|w|0;curtain19|粉格荷葉邊窗簾|1.7|1.79|0.48|1900|b|w|0;curtain20|小花綠結窗簾|1.7|1.75|0.43|1200|b|w|0;curtain21|淺灰素面窗簾|1.7|1.82|0.43|1400|b|w|0;curtain22|編織流蘇窗簾|1.7|1.89|0.53|1500|b|w|0;curtain23|紫色星月窗簾|1.7|1.86|0.46|1600|b|w|0;curtain24|海洋貝殼窗簾|1.7|1.88|0.51|1800|b|w|0;wall01|彩繪玻璃蝴蝶|0.64|0.7|0.12|1500|q|w|0;wall02|閃電霓虹燈|0.52|0.7|0.35|1700|q|w|0;wall03|太陽臉掛飾|0.7|0.68|0.22|800|q|w|0;wall04|咕咕鐘|0.41|0.7|0.23|1000|q|w|0;wall05|編織掛毯|0.51|0.8|0.08|1200|q|w|0;wall06|嘉年華面具|0.52|0.7|0.33|1400|q|w|0;wall07|編織圓盤|0.66|0.7|0.09|1600|q|w|0;wall08|水晶壁燈|0.46|0.7|0.21|1700|q|w|0;wall09|古董掛鐘|0.47|0.7|0.14|900|b|w|0;wall10|青花瓷盤|0.67|0.7|0.35|1000|b|w|0;wall11|農家斗笠籃|0.55|0.7|0.26|1200|b|w|0;wall12|獅頭門環|0.7|0.7|0.53|1400|b|w|0;wall13|金框鏡子|0.49|0.7|0.08|1600|b|w|0;wall14|鑰匙掛架|0.68|0.7|0.17|1800|b|w|0;wall15|鹿頭骨掛飾|0.63|0.7|0.16|900|b|w|0;wall16|壁掛小書架|0.72|0.8|0.35|1100|b|w|0;wall17|衣帽掛架|0.61|0.7|0.23|1300|b|w|0;wall18|紙燈籠壁燈|0.39|0.7|0.42|1500|b|w|0;wall19|編織吊盆|0.46|0.7|0.38|1700|b|w|0;wall20|咖啡店招牌|0.59|0.7|0.39|800|b|w|0;wall21|紅色信箱|0.51|0.7|0.4|1000|b|w|0;wall22|民族風掛毯|0.55|0.8|0.11|1200|b|w|0;wall23|鯉魚木雕|0.6|0.7|0.07|1400|b|w|0;wall24|星球風鈴|0.39|0.7|0.57|1600|b|w|0;pic01|冒險電影海報|0.56|0.8|0.09|1500|g|wx|0;pic02|星夜|0.68|0.8|0.1|1500|g|w|0;pic03|神奈川沖浪裏|0.6|0.8|0.1|1500|g|w|0;pic04|黑白電影海報|0.56|0.8|0.1|1500|g|wx|0;pic05|太空電影海報|0.59|0.8|0.37|1500|g|wx|0;pic06|普普風肖像|0.62|0.8|0.1|1500|g|wx|0;pic07|古地圖|0.75|0.8|0.11|1500|g|w|0;pic08|台北風景畫|0.59|0.8|0.1|1500|g|w|0";
const FURN=FD.split(";").map(r=>{ const a=r.split("|"); return {id:a[0],c:a[0].replace(/\d+$/,""),n:a[1],w:+a[2],h:+a[3],d:+a[4],p:+a[5],src:a[6],wall:a[7].includes("w"),small:a[7].includes("s"),hide:a[7].includes("x"),top:+a[8],k:parseInt(a[0].replace(/^\D+/,""),10)-1}; });
const FCAT=[["bed","床"],["chair","椅子"],["table","桌子"],["cabinet","櫃子"],["appl","家電"],["misc","克難"],["plant","盆栽"],["deco","擺飾"],["curtain","窗簾"],["wall","壁掛"],["pic","掛畫"]];
const SRCN={b:"",c:"夾娃娃機的神秘禮物盒",q:"每日功課的寶箱",f:"節日紅包",g:"簽到第 7 天"}, SRCS={c:"夾娃娃",q:"功課寶箱",f:"節日紅包",g:"簽到獎勵"};
const fidx=id=>FURN.findIndex(f=>f.id===id);
const MAXIT=24, MAXOWN=3;
/* models: fetched once per kind while you are in the room, shared by every copy, thrown away when you leave */
let GL={};
function model(F,cb){ let m=GL[F.id]; if(m&&m.sc){ cb(m.sc); return; } if(m){ m.w.push(cb); return; } m=GL[F.id]={w:[cb]}; if(!T.GLTFLoader) return; const gl=new T.GLTFLoader(); if(window.MeshoptDecoder) gl.setMeshoptDecoder(window.MeshoptDecoder);
  const done=g=>{ if(GL[F.id]!==m){ g.scene.traverse(o=>{ if(o.isMesh){ o.geometry.dispose(); if(o.material.map) o.material.map.dispose(); o.material.dispose(); } }); return; }
    const sc=g.scene; sc.traverse(o=>{ if(o.isMesh){ o.material.metalness=0; o.material.envMapIntensity=.6; if(o.material.map) o.material.map.anisotropy=4; } }); sc.updateMatrixWorld(true);
    const bb=new T.Box3().setFromObject(sc), sz=bb.getSize(new T.Vector3()), c=bb.getCenter(new T.Vector3()), k=F.h/Math.max(sz.y,1e-6); const wrap=new T.Group(); sc.scale.multiplyScalar(k); sc.position.set(-c.x*k,F.wall?-c.y*k:-bb.min.y*k,F.wall?-bb.min.z*k:-c.z*k); wrap.add(sc); m.sc=wrap; m.w.splice(0).forEach(f=>{ try{ f(wrap); }catch(e){} }); }, fail=()=>{ if(GL[F.id]===m) delete GL[F.id]; };
  /* the test page cannot serve one file per piece, so there the pieces of a kind come in one pack */
  if(window.MZ_FPACK){ fpack(F.c).then(p=>{ const e=p.idx[F.id]; gl.parse(p.buf.slice(e[0],e[0]+e[1]),"",done,fail); }).catch(fail); } else gl.load(`room/f/${F.id}.glb`,done,undefined,fail); }
let PK={}; const fpack=c=>PK[c]||(PK[c]=fetch(`room/f/pack-${c}.wasm`).then(r=>r.arrayBuffer()).then(b=>{ const n=new DataView(b).getUint32(0,true); return {idx:JSON.parse(new TextDecoder().decode(new Uint8Array(b,4,n))),buf:b.slice(4+n)}; }));
function modelsFree(){ for(const k in GL){ const m=GL[k]; if(m.sc) m.sc.traverse(o=>{ if(o.isMesh){ o.geometry.dispose(); if(o.material.map) o.material.map.dispose(); o.material.dispose(); } }); } GL={}; PK={}; }
/* ---- what you own and how the room is set ---- */
const DEF={f:0,fa:2,fb:4,w:0,wa:0,wb:1,r:-1,rx:0,rz:.4,rr:0,rs:1,of:3,ow:3,or:0};
/* it: what is out. A piece on the floor is [kind, x, z, quarter turns]; a piece on a wall is [kind, along the wall, height of its middle, wall 0 back / 1 left / 2 right].
   inv: how many of each kind you own (the ones out included). Everyone starts with a bed, a table, a chair and a plant. */
const ST=()=>{ if(!bag.room||typeof bag.room!=="object") bag.room={}; const r=bag.room; for(const k in DEF) if(typeof r[k]!=="number") r[k]=DEF[k]; r.of|=3; r.ow|=3;
  if(r.v!==2||!Array.isArray(r.it)||!r.inv||typeof r.inv!=="object"){ r.v=2; r.it=[[fidx("bed09"),-2.4,-1.4,0],[fidx("plant01"),2.6,-2.1,0]]; r.inv={}; for(const id of ["bed09","plant01","table01","chair01"]) r.inv[fidx(id)]=1; } return r; };
const invN=i=>ST().inv[i]|0, usedN=i=>ST().it.filter(t=>t[0]===i).length;
/* a piece won somewhere else in the game: one you do not have yet if there is one */
RM.grant=src=>{ try{ const s=ST(); const pool=FURN.map((f,i)=>i).filter(i=>FURN[i].src===src&&!FURN[i].hide); let p=pool.filter(i=>!(s.inv[i]|0)); if(!p.length) p=pool.filter(i=>(s.inv[i]|0)<MAXOWN); if(!p.length) return ""; const i=p[(Math.random()*p.length)|0]; s.inv[i]=(s.inv[i]|0)+1; save("mz.bag",bag); return FURN[i].n; }catch(e){ return ""; } };
const owned=(k,i)=>me.sp||!!(ST()[k==="f"?"of":k==="w"?"ow":"or"]&(1<<i));
const LIST={f:FLOORS,w:WALLS};
const priceOf=(k,i)=>k==="r"?RUGS[i][3]:LIST[k][i].p;
const nameOf=(k,i)=>k==="r"?RUGS[i][1]:LIST[k][i].n;
/* ---- the scene ---- */
let R=null;
function uvPlane(w,h,ru,rv){ const g=new T.PlaneGeometry(w,h); const uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*ru,uv.getY(i)*rv); return g; }
function canTex(){ const c=document.createElement("canvas"); c.width=c.height=512; const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy()); return t; }
function paint(t,P,a,b){ const x=t.image.getContext("2d"); x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,512,512); P.d(x,PAL[a]||PAL[0],PAL[b]||PAL[1]); t.needsUpdate=true; }
function build(){ if(R) return R; const S=new T.Scene(); const D={S};
  S.background=cvs(32,256,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,"#3a2a22"); g.addColorStop(.55,"#24180f"); g.addColorStop(1,"#120c08"); x.fillStyle=g; x.fillRect(0,0,w,h); }); /* (a warm dark round the little house, not a cold void) */
  try{ S.environment=scene.environment; }catch(e){} D.hemi=new T.HemisphereLight("#fff1dc","#7a5a48",.8); S.add(D.hemi); const dl=new T.DirectionalLight("#fff2dc",.4); dl.position.set(2.5,5,4); S.add(dl);
  /* the sun comes in through the window: from behind and to the left */
  D.sun=new T.DirectionalLight("#ffe2b0",.7); D.sun.position.set(-3.2,4.2,-5); D.sun.target.position.set(.4,0,.6); S.add(D.sun); S.add(D.sun.target);
  /* 溫馨: a warm wall lamp on the left wall that lights the room (brightest at night), a pool of its light on the floor,
     and soft shade where the floor meets the walls and in the corners, so the room has depth instead of flat even light */
  D.lamp=new T.PointLight("#ffb46b",.6,7.5,1.6); D.lamp.position.set(-RW/2+.45,1.95,.6); S.add(D.lamp);
  { const sh=new T.Mesh(new T.SphereGeometry(.13,16,10,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:"#fff0d8",emissive:new T.Color("#ffc27a"),emissiveIntensity:1,roughness:.6,side:T.DoubleSide})); sh.rotation.z=Math.PI; sh.position.set(-RW/2+.16,1.95,.6); S.add(sh); D.lampShade=sh;
    const arm=new T.Mesh(new T.CylinderGeometry(.015,.015,.14,6),GOLD()); arm.rotation.z=Math.PI/2; arm.position.set(-RW/2+.07,1.98,.6); S.add(arm);
    D.lampGlow=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:new T.Color("#ffb46b"),transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,opacity:.55})); D.lampGlow.position.set(-RW/2+.2,1.9,.6); D.lampGlow.scale.set(1.3,1.3,1); S.add(D.lampGlow);
    const pool=new T.Mesh(new T.PlaneGeometry(3.4,3.4),new T.MeshBasicMaterial({map:glowTex,color:new T.Color("#ffb46b"),transparent:true,opacity:.16,blending:T.AdditiveBlending,depthWrite:false})); pool.rotation.x=-Math.PI/2; pool.position.set(-RW/2+1.1,.014,.6); pool.renderOrder=2; S.add(pool); D.lampPool=pool;
    const grad=(vert)=>cvs(vert?8:64,vert?64:8,(x,w,h)=>{ const g=vert?x.createLinearGradient(0,h,0,0):x.createLinearGradient(0,0,w,0); g.addColorStop(0,"rgba(40,22,10,.5)"); g.addColorStop(.45,"rgba(40,22,10,.16)"); g.addColorStop(1,"rgba(40,22,10,0)"); x.fillStyle=g; x.fillRect(0,0,w,h); });
    const ao=(w,h,tex,x,y,z,rx,ry)=>{ const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3})); m.position.set(x,y,z); m.rotation.set(rx,ry,0); m.renderOrder=1; S.add(m); return m; };
    const gf=grad(false), gv=grad(true);
    ao(RW,.55,gv,0,.013,-RD/2+.275,-Math.PI/2,0).rotation.set(-Math.PI/2,0,Math.PI); /* floor along the back wall */
    ao(RD,.55,gv,-RW/2+.275,.013,0,-Math.PI/2,0).rotation.set(-Math.PI/2,0,-Math.PI/2); ao(RD,.55,gv,RW/2-.275,.013,0,-Math.PI/2,0).rotation.set(-Math.PI/2,0,Math.PI/2);
    ao(RW,.45,gv,0,.225,-RD/2+.012,0,0); ao(RD,.45,gv,-RW/2+.012,.225,0,0,Math.PI/2); ao(RD,.45,gv,RW/2-.012,.225,0,0,-Math.PI/2); /* the foot of each wall */
    for(const [x,ry,flip] of [[-RW/2+.2,0,1],[RW/2-.2,0,-1]]){ const m=ao(.4,RH,gf,x,RH/2,-RD/2+.011,0,ry); if(flip<0) m.rotation.y=Math.PI; } /* the two back corners */
    for(const [z,ry] of [[-RD/2+.2,Math.PI/2],[-RD/2+.2,-Math.PI/2]]){ const m=ao(.4,RH,gf,ry>0?-RW/2+.011:RW/2-.011,RH/2,z,0,ry); if(ry<0) m.rotation.y=-Math.PI/2+Math.PI; } }
  D.ft=canTex(); D.wt=canTex();
  D.floor=new T.Mesh(uvPlane(RW,RD,RW/2,RD/2),new T.MeshStandardMaterial({map:D.ft,roughness:1,metalness:0,envMapIntensity:.22})); D.rt=canTex(); D.rt.encoding=T.LinearEncoding; D.floor.material.roughnessMap=D.rt; D.floor.material.bumpMap=D.rt; D.floor.material.bumpScale=.02; D.floor.rotation.x=-Math.PI/2; S.add(D.floor);
  const wm=new T.MeshStandardMaterial({map:D.wt,roughness:.95}); D.wm=wm; D.walls=[];
  const wall=(w,x,z,ry)=>{ const m=new T.Mesh(new T.PlaneGeometry(w,RH),wm); m.position.set(x,RH/2,z); m.rotation.y=ry; m.userData.w=w; S.add(m); D.walls.push(m); };
  wall(RW,0,-RD/2,0); wall(RD,-RW/2,0,Math.PI/2); wall(RD,RW/2,0,-Math.PI/2);
  const trim=fm("#f3ece0",{roughness:.7}), dark=fm("#5a4234",{roughness:.7});
  const bx=(w,h,d,m,x,y,z)=>{ const o=new T.Mesh(new T.BoxGeometry(w,h,d),m); o.position.set(x,y,z); S.add(o); return o; };
  bx(RW,.12,.04,trim,0,.06,-RD/2+.02); bx(.04,.12,RD,trim,-RW/2+.02,.06,0); bx(.04,.12,RD,trim,RW/2-.02,.06,0);
  bx(RW+.3,.3,.15,dark,0,-.16,RD/2+.07); bx(RW+.3,.3,RD+.3,dark,0,-.16,0).position.y=-.16;
  /* a window and a door on the back wall */
  D.skyTex=new T.CanvasTexture(Object.assign(document.createElement("canvas"),{width:384,height:288})); D.skyTex.encoding=T.sRGBEncoding; D.sky=new T.MeshBasicMaterial({map:D.skyTex}); /* the view out of the window is real: a small 3D landscape behind the back wall (grass, a path, trees, a temple down the hill, far hills,
     sky with sun or moon), seen only through the window — the window pane marks the stencil, the landscape draws only there — so it
     shifts properly as you turn the room */
  { const win=new T.Mesh(new T.PlaneGeometry(1.5,1.1),new T.MeshBasicMaterial({colorWrite:false,depthWrite:false,stencilWrite:true,stencilRef:1,stencilFunc:T.AlwaysStencilFunc,stencilZPass:T.ReplaceStencilOp}));
    win.position.set(-1.2,1.55,-RD/2+.03); win.renderOrder=10; S.add(win); D.view=roomView(S); }
  /* the patch of light the window throws on the floor, and two faint sheets of light from the window down to it */
  { const c=document.createElement("canvas"); c.width=c.height=128; const x=c.getContext("2d"); for(const [px,py] of [[6,6],[67,6],[6,67],[67,67]]){ const g=x.createLinearGradient(0,py,0,py+55); g.addColorStop(0,"rgba(255,255,255,.95)"); g.addColorStop(1,"rgba(255,255,255,.55)"); x.fillStyle=g; x.fillRect(px,py,55,55); }
    const t=new T.CanvasTexture(c); const quad=(P,tex,op)=>{ const g=new T.BufferGeometry(); g.setAttribute("position",new T.Float32BufferAttribute(P.flat(),3)); g.setAttribute("uv",new T.Float32BufferAttribute([0,1,1,1,1,0,0,0],2)); g.setIndex([0,2,1,0,3,2]); const m=new T.Mesh(g,new T.MeshBasicMaterial({map:tex,color:"#ffe9c0",transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide})); m.renderOrder=3; S.add(m); return m; };
    D.patch=quad([[-1.75,.016,-1.75],[-.25,.016,-1.75],[.95,.016,.55],[-.55,.016,.55]],t,.34);
    const sc=document.createElement("canvas"); sc.width=8; sc.height=64; const sx=sc.getContext("2d"), sg=sx.createLinearGradient(0,0,0,64); sg.addColorStop(0,"rgba(255,255,255,.9)"); sg.addColorStop(1,"rgba(255,255,255,0)"); sx.fillStyle=sg; sx.fillRect(0,0,8,64); const st=new T.CanvasTexture(sc);
    D.shafts=[quad([[-1.95,2.1,-RD/2+.05],[-.45,2.1,-RD/2+.05],[.95,.02,.55],[-.55,.02,.55]],st,.09),quad([[-1.95,1.0,-RD/2+.05],[-.45,1.0,-RD/2+.05],[-.25,.02,-1.75],[-1.75,.02,-1.75]],st,.07)]; }
  for(const [w,h,x,y] of [[1.66,.08,-1.2,2.14],[1.66,.08,-1.2,.96],[.08,1.26,-1.99,1.55],[.08,1.26,-.41,1.55],[.05,1.1,-1.2,1.55],[1.5,.05,-1.2,1.55]]) bx(w,h,.06,trim,x,y,-RD/2+.04);
  bx(1.8,.05,.16,trim,-1.2,.94,-RD/2+.09);
  { const hole=new T.Mesh(new T.PlaneGeometry(.95,2.05),new T.MeshBasicMaterial({map:cvs(8,64,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,"#1a120e"); g.addColorStop(1,"#6a4a30"); x.fillStyle=g; x.fillRect(0,0,w,h); })})); hole.position.set(1.9,1.025,-RD/2+.014); S.add(hole);
    D.door=new T.Group(); D.door.position.set(1.425,0,-RD/2+.04); S.add(D.door); const slab=new T.Mesh(new T.BoxGeometry(.95,2.05,.05),fm("#8a6246",{roughness:.6})); slab.position.set(.475,1.025,0); D.door.add(slab); const kn=new T.Mesh(new T.SphereGeometry(.045,10,8),GOLD()); kn.position.set(.8,1.0,.05); D.door.add(kn); }
  bx(1.07,.08,.07,trim,1.9,2.09,-RD/2+.04); bx(.06,2.1,.07,trim,1.4,1.05,-RD/2+.04); bx(.06,2.1,.07,trim,2.4,1.05,-RD/2+.04);
  D.rugMat=new T.MeshStandardMaterial({roughness:.95,transparent:true,alphaTest:.35,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}); D.rug=new T.Mesh(new T.PlaneGeometry(1,1),D.rugMat); D.rug.rotation.x=-Math.PI/2; D.rug.position.y=.012; D.rug.visible=false; S.add(D.rug); D.rugTex={};
  D.fg=new T.Group(); S.add(D.fg); D.sel=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({color:"#ffd76a",transparent:true,opacity:.45,depthWrite:false})); D.sel.rotation.x=-Math.PI/2; D.sel.position.y=.02; D.sel.visible=false; S.add(D.sel);
  /* three lights kept ready for the lamps you switch on (a fixed number, so switching never stalls the screen) */
  D.pl=[0,1,2].map(()=>{ const l=new T.PointLight("#ffcf8a",0,3.6,2); l.position.set(0,-5,0); S.add(l); return l; }); D.glows=[];
  D.cam=new T.PerspectiveCamera(36,1,.1,80); D.ray=new T.Raycaster(); D.plane=new T.Plane(new T.Vector3(0,1,0),0); R=D; return D; }
/* the landscape behind the window (see build): plain unlit colours, shaded by vertex colour, recoloured for day / dusk / night */
function roomView(S){ const V={g:new T.Group(),m:{},O:new T.Scene(),cam:new T.PerspectiveCamera(42,1,.1,300),wpos:new T.Vector3(-1.2,1.55,-RD/2),wc:new T.Vector3()}; V.O.add(V.g); let ro=11; /* (its own little scene, drawn after the room with its own camera looking straight out from the window — see o.render — and only where the window pane marked the stencil) */
  const mat=(k,o={})=>V.m[k]||(V.m[k]=new T.MeshBasicMaterial(Object.assign({vertexColors:true,depthTest:false,depthWrite:false,stencilWrite:true,stencilWriteMask:0,stencilRef:1,stencilFunc:T.EqualStencilFunc},o)));
  const shade=(g,top,bot,ax="y")=>{ g.computeBoundingBox(); const b=g.boundingBox, p=g.attributes.position, c=[]; const lo=b.min[ax], hi=b.max[ax]||1; for(let i=0;i<p.count;i++){ const v=(p["get"+ax.toUpperCase()](i)-lo)/((hi-lo)||1); c.push(bot+(top-bot)*v); } g.setAttribute("shade",new T.Float32BufferAttribute(c,1)); return g; };
  const put=(g,k,x,y,z,order)=>{ const m=new T.Mesh(g,mat(k)); m.position.set(x,y,z); m.renderOrder=order??ro++; m.frustumCulled=false; V.g.add(m); return m; };
  /* (drawn back to front: painter's order, since the window shows them over the wall) */
  put(shade(new T.PlaneGeometry(160,70,1,8),1,0),"sky",0,24,-60,11);
  V.sun=put(shade(new T.CircleGeometry(2.2,24),1,1),"sun",9,15,-58,12);
  const ridge=(w,h,n,seed)=>{ const r=rnd(seed), P=[], I=[]; for(let i=0;i<=n;i++){ const x=-w/2+w*i/n, y=h*(.55+.45*Math.sin(i/n*7+seed)*.6+r()*.35); P.push(x,y,0,x,-2,0); if(i<n){ const a=i*2; I.push(a,a+1,a+2,a+1,a+3,a+2); } } const g=new T.BufferGeometry(); g.setAttribute("position",new T.Float32BufferAttribute(P,3)); g.setIndex(I); return shade(g,1,.55); };
  put(ridge(140,9,26,3),"hill3",0,-1,-48,13); put(ridge(110,6,22,7),"hill2",0,-1.2,-34,14); /* (the house stands up on a hill: the land falls away below the window) */
  /* a temple down the hill: red walls and a curved tiled roof with swept-up ends */
  { const tg=new T.Group(); tg.position.set(6,-1.4,-26); V.g.add(tg); const add=(g,k)=>{ const m=new T.Mesh(g,mat(k)); m.renderOrder=15; m.frustumCulled=false; tg.add(m); return m; };
    add(shade(new T.BoxGeometry(6,2.2,3).translate(0,1.1,0),1,.7),"twall"); const roof=new T.CylinderGeometry(.01,1,1,4,1).rotateY(Math.PI/4).scale(4.6,1.5,2.6).translate(0,2.95,0); add(shade(roof,1,.65),"troof");
    for(const s of [-1,1]) add(shade(new T.ConeGeometry(.2,.9,4).rotateZ(-s*1.1).translate(s*3.3,2.6,0),1,.7),"troof"); add(shade(new T.BoxGeometry(.5,.18,.18).translate(0,3.7,0),1,.7),"tgold");
    V.lit=[]; for(const x of [-1.6,0,1.6]){ const w=add(new T.PlaneGeometry(.55,.75).translate(x,1.1,1.51),"twin"); V.lit.push(w); } }
  put(ridge(80,2.5,18,11),"hill1",0,-1.6,-18,16);
  /* the garden right outside: grass falling away from the house, a stone path, trees, a few flowers */
  put(shade(new T.PlaneGeometry(90,40,1,6).rotateX(-Math.PI/2),.75,1,"z"),"grass",0,-1.2,-26,17);
  { const sl=new T.PlaneGeometry(14,8,1,4).rotateX(-Math.PI/2); const p=sl.attributes.position; for(let i=0;i<p.count;i++){ const z=p.getZ(i); p.setY(i,z>0?-.35:-.35-Math.min(1,-z/4)*.85); } put(shade(sl,1,.7),"grass",0,0,-4,17); } /* the slope just outside: level by the house, then down */
  put(shade(new T.PlaneGeometry(1.1,4).rotateX(-Math.PI/2),1,.85,"z"),"path",1.4,-.33,-2,18);
  const tree=(x,z,s,seed,y=-.35)=>{ const r=rnd(seed); put(shade(new T.CylinderGeometry(.12*s,.18*s,1.6*s,6).translate(0,.8*s,0),1,.6),"trunk",x,y,z,ro++);
    for(let i=0;i<4;i++) put(shade(new T.IcosahedronGeometry((.75+r()*.35)*s,1).translate((r()-.5)*1.1*s,(1.9+r()*.8)*s,(r()-.5)*.8*s),1,.55),i%2?"leaf2":"leaf",x,y,z,ro++); };
  tree(-6,-14,1.6,2,-1.2); tree(5,-11,1.3,5,-1.2); tree(-2.8,-6,1,9,-1.2); tree(3.4,-4.2,.9,4,-.9); tree(-10,-19,1.8,7,-1.2);
  const fr=rnd(21); for(let i=0;i<26;i++){ put(shade(new T.SphereGeometry(.09,6,4),1,.7),["fl1","fl2","fl3"][i%3],(fr()-.5)*6,-.28,-.4-fr()*1.4,ro++); }
  V.stars=new T.Points(new T.BufferGeometry().setAttribute("position",new T.Float32BufferAttribute(Array.from({length:240},(_,i)=>i%3===0?(Math.random()-.5)*150:i%3===1?14+Math.random()*30:-59),3)),new T.PointsMaterial({color:"#ffffff",size:.35,depthTest:false,depthWrite:false,stencilWrite:true,stencilWriteMask:0,stencilRef:1,stencilFunc:T.EqualStencilFunc,transparent:true,opacity:.9})); V.stars.renderOrder=12; V.stars.frustumCulled=false; V.g.add(V.stars);
  /* vertex colours: each material's colour times the shade attribute (set in roomViewTint) */
  for(const o of V.g.children.concat(V.g.children.flatMap(c=>c.children||[]))) if(o.isMesh&&o.geometry.attributes.shade&&!o.geometry.attributes.color){ const s=o.geometry.attributes.shade.array; o.geometry.setAttribute("color",new T.Float32BufferAttribute(Array.from(s).flatMap(v=>[v,v,v]),3)); }
  for(const k in V.m) if(!["sky"].includes(k)) V.m[k].vertexColors=true; return V; }
function roomViewTint(V,mode){ const C={ /* day, dusk, night */
    sky:["#7cc0f5","#f2925a","#0d1838"], sun:["#fff6d6","#ffd28a","#f6f0d8"], hill3:["#9cc4c8","#b98a8a","#1d2a48"], hill2:["#7fae86","#a0705e","#16233c"], hill1:["#5e9a62","#7a5a40","#112032"],
    twall:["#c8423a","#a03a2c","#3a1c24"], troof:["#d8a04a","#b07a3a","#4a3a3a"], tgold:["#ffd24a","#ffb24a","#8a7040"], twin:["#5a2a20","#4a2418","#ffc870"],
    grass:["#7cbc5e","#8a8a4a","#1c3428"], path:["#d8c8a8","#c09878","#3a3a48"], trunk:["#7a5232","#5a3a24","#1e1a20"], leaf:["#4f9e4e","#7a7a38","#16302a"], leaf2:["#63b45a","#8a6a34","#1a3a30"],
    fl1:["#ff8fb8","#ff9a7a","#5a3a5a"], fl2:["#fff1a0","#ffd08a","#5a5a4a"], fl3:["#ffffff","#ffe0c0","#4a4a5a"] };
  for(const k in V.m){ const c=C[k]; if(c) V.m[k].color.set(c[mode]).convertSRGBToLinear(); } /* (colours as they should look on screen) */
  /* the sky: lighter towards the horizon */ const sk=V.g.children[0].geometry, sp=sk.attributes.position, top=new T.Color(["#4aa0ea","#7a4a8a","#050a20"][mode]), bot=new T.Color(["#d6efff","#ffcf98","#22305a"][mode]), col=[];
  sk.computeBoundingBox(); for(let i=0;i<sp.count;i++){ const v=(sp.getY(i)-sk.boundingBox.min.y)/(sk.boundingBox.max.y-sk.boundingBox.min.y); const c=bot.clone().lerp(top,v).convertSRGBToLinear(); col.push(c.r,c.g,c.b); } sk.setAttribute("color",new T.Float32BufferAttribute(col,3)); V.m.sky.color.set("#ffffff");
  V.sun.position.set(mode===1?-8:9,mode===1?3.5:15,-58); V.sun.scale.setScalar(mode===2?.8:1); V.stars.visible=mode===2; }
/* the view from the window and the light in the room, by the hour in Taiwan: day, dusk or night */
function daylight(force){ const D=R, h=new Date(Date.now()+288e5).getUTCHours(), mode=force!=null?force:h>=6&&h<17?0:h>=17&&h<19?1:2; const c=D.skyTex.image, x=c.getContext("2d"), W=c.width, H=c.height;
  const sky=[["#6fb7f2","#d5eeff"],["#f08a4b","#ffd9a0"],["#0b1230","#27345e"]][mode], g=x.createLinearGradient(0,0,0,H*.75); g.addColorStop(0,sky[0]); g.addColorStop(1,sky[1]); x.fillStyle=g; x.fillRect(0,0,W,H);
  if(mode===2){ const r=rnd(5); x.fillStyle="#fff"; for(let i=0;i<60;i++){ x.globalAlpha=.3+r()*.7; x.fillRect(r()*W,r()*H*.6,1.6,1.6); } x.globalAlpha=1; x.fillStyle="#fdf6d8"; x.beginPath(); x.arc(W*.78,H*.2,20,0,6.283); x.fill(); x.fillStyle=sky[0]; x.beginPath(); x.arc(W*.78+9,H*.2-5,18,0,6.283); x.fill(); }
  else { x.fillStyle=mode?"#fff1c9":"#fffbe6"; x.beginPath(); x.arc(W*.2,mode?H*.5:H*.2,mode?26:20,0,6.283); x.fill(); x.fillStyle=mode?"rgba(255,220,190,.8)":"rgba(255,255,255,.9)"; for(const [cx,cy,s] of [[W*.55,H*.18,1],[W*.86,H*.3,.7],[W*.36,H*.34,.6]]) for(const [dx,dy,rr] of [[0,0,16],[16,4,13],[-15,5,12],[4,-8,12]]){ x.beginPath(); x.arc(cx+dx*s,cy+dy*s,rr*s,0,6.283); x.fill(); } }
  const hill=(y,amp,col,ph)=>{ x.fillStyle=col; x.beginPath(); x.moveTo(0,H); for(let i=0;i<=W;i+=8) x.lineTo(i,y+Math.sin(i/W*6.283*1.3+ph)*amp+Math.sin(i/W*6.283*3.1+ph*2)*amp*.35); x.lineTo(W,H); x.closePath(); x.fill(); };
  hill(H*.62,16,["#8fc0a0","#b9866a","#1a2a44"][mode],.4); hill(H*.72,12,["#5f9e72","#8a5a48","#12203a"][mode],2.1);
  /* a temple roof down the hill, and the tree by the window */
  const rc=["#b3261e","#8a2a1c","#3a1420"][mode]; x.fillStyle=rc; x.beginPath(); x.moveTo(W*.5,H*.7); x.quadraticCurveTo(W*.53,H*.63,W*.6,H*.62); x.lineTo(W*.78,H*.62); x.quadraticCurveTo(W*.85,H*.63,W*.9,H*.7); x.quadraticCurveTo(W*.84,H*.67,W*.8,H*.68); x.lineTo(W*.6,H*.68); x.quadraticCurveTo(W*.56,H*.67,W*.5,H*.7); x.fill();
  x.fillStyle=["#e9dcc0","#c9a888","#2a2a40"][mode]; x.fillRect(W*.6,H*.68,W*.2,H*.12); if(mode===2){ x.fillStyle="#ffcf70"; x.fillRect(W*.64,H*.71,10,12); x.fillRect(W*.72,H*.71,10,12); }
  hill(H*.84,8,["#3f7d4f","#5a4030","#0c1628"][mode],4.2);
  x.fillStyle=["#5a3a22","#3a2416","#0a0a14"][mode]; x.fillRect(W*.06,H*.4,10,H*.6); x.fillStyle=["#3d8a4c","#7a5a2e","#0f2030"][mode]; for(const [cx,cy,rr] of [[W*.08,H*.38,40],[W*.0,H*.5,34],[W*.17,H*.5,30]]){ x.beginPath(); x.arc(cx,cy,rr,0,6.283); x.fill(); }
  D.skyTex.needsUpdate=true; try{ roomViewTint(D.view,mode); }catch(err){}
  const col=["#ffe9c0","#ffb070","#9fb6ff"][mode], op=[.2,.17,.06][mode]; D.patch.material.color.set(col); D.patch.material.opacity=op; D.shafts.forEach((m,i)=>{ m.material.color.set(col); m.material.opacity=[.05,.045,.015][mode]*(i?.75:1); });
  D.sun.color.set(["#ffe2b0","#ff9a55","#8ea4ff"][mode]); D.sun.intensity=[.42,.36,.1][mode]; D.hemi.intensity=[.7,.6,.38][mode]; D.hemi.color.set(["#fff1dc","#ffdcb8","#d9cfff"][mode]);
  D.base={sun:D.sun.intensity,hemi:D.hemi.intensity}; D.mode=mode; wallLamp(); }
/* the wall lamp: on unless you switched it off; warmest at night */
function wallLamp(){ const D=R, mode=D.mode|0, on=ST().wl===0?0:1; D.lamp.intensity=[.35,.75,1.15][mode]*on; D.lampGlow.visible=!!on; D.lampGlow.material.opacity=[.25,.5,.7][mode]; D.lampPool.visible=!!on; D.lampPool.material.opacity=[.08,.14,.22][mode]; D.lampShade.material.emissiveIntensity=[.5,.9,1.2][mode]*on+.04; }
/* how shiny each floor is (wood, tile, marble, tatami...) */
const GLOSS=[.5,.5,.32,.24,.34,.95,.36,.38,.5,.33];
/* the shine follows the pattern: the same floor drawn in white shows where the joints are; joints are matt and sit a little lower,
   the tiles or boards between them shine. Red = height, green = roughness (what three.js reads for the bump and the roughness). */
function relief(t,P,g){ const c=t.image, x=c.getContext("2d"); x.setTransform(1,0,0,1,0,0); x.fillStyle="#fff"; x.fillRect(0,0,512,512); P.d(x,"#ffffff","#ffffff"); const im=x.getImageData(0,0,512,512), d=im.data, gv=Math.round(g*255);
  for(let i=0;i<d.length;i+=4){ const joint=d[i]<216; d[i]=joint?40:255; d[i+1]=joint?255:gv; d[i+2]=0; d[i+3]=255; } x.putImageData(im,0,0); t.needsUpdate=true; }
/* what is showing right now (may be a preview of something not bought yet) */
let V=null;
function apply(){ const D=R; paint(D.ft,FLOORS[V.f],V.fa,V.fb); relief(D.rt,FLOORS[V.f],GLOSS[V.f]); paint(D.wt,WALLS[V.w],V.wa,V.wb);
  const vr=WALLS[V.w].vr||2; D.walls.forEach(m=>{ const uv=m.geometry.attributes.uv, ru=m.userData.w/(RH/vr); const base=[[0,1],[1,1],[0,0],[1,0]]; for(let i=0;i<4;i++) uv.setXY(i,base[i][0]*ru,base[i][1]*vr); uv.needsUpdate=true; });
  rugApply(); }
function rugApply(){ const D=R; if(V.r<0){ D.rug.visible=false; return; } const n=RUGS[V.r][0]; let t=D.rugTex[n];
  const fit=()=>{ const im=t.image; if(!im||!im.width) return; const w=RUGS[V.r][2]*RSZ[V.rs], h=w*im.height/im.width; D.rug.scale.set(w,h,1); D.rug.rotation.z=V.rr?Math.PI/2:0; const hw=(V.rr?h:w)/2, hd=(V.rr?w:h)/2; V.rx=Math.max(-RW/2+hw,Math.min(RW/2-hw,V.rx)); V.rz=Math.max(-RD/2+hd,Math.min(RD/2-hd,V.rz)); D.rug.position.set(V.rx,.012,V.rz); D.rug.userData.hw=hw; D.rug.userData.hd=hd; D.rugMat.map=t; D.rugMat.needsUpdate=true; D.rug.visible=true; };
  if(t){ fit(); return; } D.rug.visible=false; const want=V.r; t=D.rugTex[n]=new T.TextureLoader().load(`room/rug${n<10?"0":""}${n}.webp`,()=>{ t.encoding=T.sRGBEncoding; t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy()); if(V&&V.r===want) rugApply(); }); t.encoding=T.sRGBEncoding; }
/* placed furniture: one group per piece (a faint box until its model has arrived), rebuilt only when the list changes */
/* t[4] = size (1 = as made; 擺飾・盆栽・壁掛・掛畫 grow or shrink, a curtain only gets wider or narrower), t[5] = a fine turn in degrees
   (-45..45: on the floor it turns the piece, on a wall it tilts it, so a model that came a little crooked can be set straight), t[6] = a lamp is on */
const SCL=c=>c==="deco"||c==="plant"||c==="wall"||c==="pic"?"u":c==="curtain"?"x":"";
const isc=t=>{ const v=+t[4]; return v>0?Math.max(.5,Math.min(2.5,v)):1; }, ian=t=>Math.max(-45,Math.min(45,Math.round(+t[5]||0)));
const kOf=t=>SCL(FURN[t[0]].c)?isc(t):1, hgt=t=>FURN[t[0]].h*(SCL(FURN[t[0]].c)==="u"?isc(t):1);
const foot=t=>{ const F=FURN[t[0]], k=SCL(F.c)==="u"?isc(t):1; let w=F.w*k, d=F.d*k; if(t[3]%2){ const q=w; w=d; d=q; } const a=Math.abs(ian(t))*Math.PI/180, c=Math.cos(a), s=Math.sin(a); return [(c*w+s*d)/2,(s*w+c*d)/2]; };
/* a hanging's half width and half height on its wall (after size and tilt) */
const wdim=t=>{ const F=FURN[t[0]], m=SCL(F.c), k=m?isc(t):1, w=F.w*k, h=F.h*(m==="u"?k:1), a=Math.abs(ian(t))*Math.PI/180, c=Math.cos(a), s=Math.sin(a); return [(c*w+s*h)/2,(s*w+c*h)/2]; };
const wallLen=w=>w===0?RW:RD;
const clampIt=t=>{ const F=FURN[t[0]]; if(F.wall){ t[3]=Math.max(0,Math.min(2,t[3]|0)); const [hw,hh]=wdim(t), hl=Math.max(0,wallLen(t[3])/2-hw); t[1]=Math.round(Math.max(-hl,Math.min(hl,t[1]))*20)/20; t[2]=Math.round(Math.max(hh+.05,Math.min(Math.max(hh+.05,RH-hh),t[2]))*20)/20; return; }
  const [hw,hd]=foot(t); t[1]=Math.round(Math.max(-RW/2+hw,Math.min(RW/2-hw,t[1]))*20)/20; t[2]=Math.round(Math.max(-RD/2+hd,Math.min(RD/2-hd,t[2]))*20)/20; };
/* small things stand on the table or cupboard under them */
const restY=t=>{ const F=FURN[t[0]]; if(!F.small) return 0; let y=0; for(const u of ST().it){ const G=FURN[u[0]]; if(u===t||!G||!G.top||G.wall) continue; const [hw,hd]=foot(u); if(Math.abs(t[1]-u[1])<=hw&&Math.abs(t[2]-u[2])<=hd) y=Math.max(y,G.top); } return y; };
function place(g,t){ const F=FURN[t[0]], m=SCL(F.c), k=m?isc(t):1, a=ian(t)*Math.PI/180; g.scale.set(k,m==="u"?k:1,m==="u"?k:1);
  if(F.wall){ const w=t[3]; let ry=0; if(w===0) g.position.set(t[1],t[2],-RD/2+.012); else if(w===1){ g.position.set(-RW/2+.012,t[2],t[1]); ry=Math.PI/2; } else { g.position.set(RW/2-.012,t[2],t[1]); ry=-Math.PI/2; } g.rotation.set(0,ry,a); }
  else { g.position.set(t[1],restY(t)+(g.userData.hop||0),t[2]); g.rotation.set(0,-t[3]*Math.PI/2+a,0); } }
/* nothing may overlap: two pieces on the floor whose footprints and heights cross (a small thing standing on a table top is fine),
   two hangings on the same wall, or a hanging and a piece standing right against that wall at the same height */
function clash(a,b){ const A=FURN[a[0]], B=FURN[b[0]]; if(!A||!B) return false;
  if(A.wall&&B.wall){ if(a[3]!==b[3]) return false; const p=wdim(a), q=wdim(b); return Math.abs(a[1]-b[1])<p[0]+q[0]-.01&&Math.abs(a[2]-b[2])<p[1]+q[1]-.01; }
  if(A.wall||B.wall){ const W=A.wall?a:b, L=A.wall?b:a, FW=FURN[W[0]], [hw,hd]=foot(L), [ww,wh]=wdim(W), dep=Math.min(FW.c==="curtain"?.12:.3,FW.d*kOf(W)), y0=restY(L), y1=y0+hgt(L);
    if(W[2]-wh>y1-.01||W[2]+wh<y0+.01) return false;
    if(W[3]===0) return L[2]-hd< -RD/2+dep&&Math.abs(L[1]-W[1])<hw+ww-.01;
    if(W[3]===1) return L[1]-hw< -RW/2+dep&&Math.abs(L[2]-W[1])<hd+ww-.01;
    return L[1]+hw>RW/2-dep&&Math.abs(L[2]-W[1])<hd+ww-.01; }
  const p=foot(a), q=foot(b); if(!(Math.abs(a[1]-b[1])<p[0]+q[0]-.01&&Math.abs(a[2]-b[2])<p[1]+q[1]-.01)) return false;
  const ay=restY(a), by=restY(b); return ay<by+hgt(b)-.01&&by<ay+hgt(a)-.01; }
const blocked=t=>ST().it.some(u=>u!==t&&clash(t,u));
/* move a piece: if the new spot overlaps something, slide along one direction only, else stay put */
function tryMove(t,set){ const old=t.slice(); set(); clampIt(t); if(!blocked(t)) return 1; const nw=t.slice(); if(nw[3]===old[3]) for(const k of [1,2]){ t.splice(0,t.length,...old); t[k]=nw[k]; clampIt(t); if(!blocked(t)) return 2; } t.splice(0,t.length,...old); return 0; }
/* a free spot for a piece just put out */
function freeSpot(t){ clampIt(t); if(!blocked(t)) return true; const F=FURN[t[0]];
  if(F.wall){ for(const w of [t[3],0,1,2]) for(let y=1.6;y>.3;y-=.15) for(let u=0;u<3;u+=.1) for(const sg of [1,-1]){ t[3]=w; t[1]=u*sg; t[2]=y; clampIt(t); if(!blocked(t)) return true; } return false; }
  for(let r=0;r<4;r+=.1){ const n=Math.max(1,Math.round(r*20)); for(let k=0;k<n;k++){ const a=k/n*Math.PI*2; t[1]=Math.cos(a)*r; t[2]=.6+Math.sin(a)*r; clampIt(t); if(!blocked(t)) return true; } } return false; }
function furnDraw(sel){ const D=R, s=ST(); while(D.fg.children.length) D.fg.remove(D.fg.children[0]);
  s.it.forEach(t=>{ const F=FURN[t[0]], g=new T.Group(); D.fg.add(g); if(!F) return; const ph=new T.Mesh(new T.BoxGeometry(F.w,F.h,F.d),fm("#d9c9a8",{transparent:true,opacity:.35,depthWrite:false})); ph.position.set(0,F.wall?0:F.h/2,F.wall?F.d/2:0); g.add(ph); place(g,t);
    model(F,sc=>{ if(g.parent!==D.fg) return; g.remove(ph); ph.geometry.dispose(); g.add(sc.clone()); g.userData.ready=1; try{ lampsApply(); }catch(e){} }); }); furnSel(sel); }
function furnSel(sel){ const D=R, its=ST().it, t=sel>=0?its[sel]:null; its.forEach((u,n)=>{ const g=D.fg.children[n]; if(g&&FURN[u[0]]) place(g,u); }); try{ lampsApply(); }catch(e){} if(!t){ D.sel.visible=false; return; } const F=FURN[t[0]], g=D.fg.children[sel];
  if(F.wall){ const [hw,hh]=wdim(t); D.sel.rotation.set(0,g.rotation.y,0); D.sel.scale.set(hw*2+.14,hh*2+.14,1); D.sel.position.copy(g.position); D.sel.position.x+=Math.sin(g.rotation.y)*.004; D.sel.position.z+=Math.cos(g.rotation.y)*.004; }
  else { const [hw,hd]=foot(t); D.sel.rotation.set(-Math.PI/2,0,0); D.sel.scale.set(hw*2+.12,hd*2+.12,1); D.sel.position.set(t[1],restY(t)+.02,t[2]); } D.sel.visible=true; }
function selFlash(){ const m=R.sel.material; m.color.set("#ff5a4a"); clearTimeout(selFlash.t); selFlash.t=setTimeout(()=>{ m.color.set("#ffd76a"); },350); try{ tone(160,.08,.05,"square"); }catch(e){} }
/* 隨機擺放: lays out what you own in a sensible, different way each time. Big things go against a wall, tables in the open,
   chairs up to a table, small things on a table top, hangings on a free stretch of wall, one curtain on the window. Nothing overlaps
   and the doorway is kept clear. */
function shuffleRoom(){ const s=ST(), rnd0=Math.random, sh=a=>{ for(let i=a.length-1;i>0;i--){ const j=(rnd0()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const own={}; FURN.forEach((f,i)=>{ if(!f.hide&&(s.inv[i]|0)>0) (own[f.c]=own[f.c]||[]).push(i); }); for(const c in own) sh(own[c]);
  const quota={bed:1,table:2,chair:4,cabinet:2,appl:2,misc:1,plant:3,deco:5,curtain:1,wall:2,pic:1}, pickd=[], rest=[];
  for(const c in own){ own[c].forEach((i,n)=>{ (n<(quota[c]||0)?pickd:rest).push(i); }); } sh(rest); while(pickd.length<MAXIT&&rest.length){ const i=rest.pop(); if(FURN[i].c!=="curtain"&&FURN[i].c!=="bed") pickd.push(i); }
  const it=[], rects=[[1.25,2.55,-RD/2,-1.35]], wr=[[0,1.3,2.5,0,2.25],[0,-2.1,-.3,.85,2.25]];
  const free=(x0,x1,z0,z1,m)=>x0>=-RW/2-.001&&x1<=RW/2+.001&&z0>=-RD/2-.001&&z1<=RD/2+.001&&!rects.some(r=>x0<r[1]+m&&x1>r[0]-m&&z0<r[3]+m&&z1>r[2]-m);
  const putF=(i,x,z,r,m)=>{ const F=FURN[i], hw=(r%2?F.d:F.w)/2, hd=(r%2?F.w:F.d)/2; if(!free(x-hw,x+hw,z-hd,z+hd,m===undefined?.08:m)) return false; rects.push([x-hw,x+hw,z-hd,z+hd,i,r]); it.push([i,Math.round(x*20)/20,Math.round(z*20)/20,r]); return true; };
  const byWall=i=>{ const F=FURN[i]; for(let n=0;n<40;n++){ const w=(rnd0()*3)|0; let ok=false; if(w===0){ const x=(rnd0()*2-1)*(RW/2-F.w/2); ok=putF(i,x,-RD/2+F.d/2+.03,0); } else { const zl=RD/2-F.w/2, z=F.h>1.2?-zl+rnd0()*(zl+.3):(rnd0()*2-1)*zl; /* tall things stay toward the back so they do not hide the room */ ok=putF(i,w===1?-RW/2+F.d/2+.03:RW/2-F.d/2-.03,z,w===1?3:1); } if(ok) return true; } return false; };
  const order=c=>pickd.filter(i=>FURN[i].c===c);
  order("bed").forEach(byWall); order("cabinet").forEach(byWall); pickd.filter(i=>(FURN[i].c==="appl"||FURN[i].c==="misc")&&!FURN[i].small&&!FURN[i].wall).forEach(byWall);
  const tables=[]; order("table").forEach(i=>{ const F=FURN[i]; for(let n=0;n<40;n++){ const x=(rnd0()*2-1)*(RW/2-F.w/2-.9), z=-.6+rnd0()*(RD/2-F.d/2-.3); const r=rnd0()<.5?0:1; if(putF(i,x,z,r,.55)){ tables.push(rects[rects.length-1]); return; } } byWall(i); });
  order("chair").forEach((i,n)=>{ const F=FURN[i]; const ts=sh(tables.slice()); for(const t of ts){ const cx=(t[0]+t[1])/2, cz=(t[2]+t[3])/2; for(const side of sh([0,1,2,3])){ const g=.02; let ok=false; if(side===0) ok=putF(i,cx,t[3]+F.d/2+g,2,.02); else if(side===1) ok=putF(i,cx,t[2]-F.d/2-g,0,.02); else if(side===2) ok=putF(i,t[1]+F.d/2+g,cz,1,.02); else ok=putF(i,t[0]-F.d/2-g,cz,3,.02); if(ok) return; } } byWall(i); });
  /* small things: on a table or cupboard top if there is room, otherwise on the floor by a wall */
  const tops=rects.filter(r=>r.length>4&&FURN[r[4]].top), used=[];
  pickd.filter(i=>FURN[i].small).forEach(i=>{ const F=FURN[i]; for(const t of sh(tops.slice())){ for(let n=0;n<12;n++){ const hw=Math.max(.05,(t[1]-t[0])/2-F.w/2-.03), hd=Math.max(.05,(t[3]-t[2])/2-F.d/2-.03), x=(t[0]+t[1])/2+(rnd0()*2-1)*hw, z=(t[2]+t[3])/2+(rnd0()*2-1)*hd; if((t[1]-t[0])<F.w||(t[3]-t[2])<F.d) break; if(used.some(u=>Math.abs(u[0]-x)<(u[2]+F.w)/2+.02&&Math.abs(u[1]-z)<(u[3]+F.d)/2+.02)) continue; used.push([x,z,F.w,F.d]); it.push([i,Math.round(x*20)/20,Math.round(z*20)/20,0]); return; } } if(F.c==="plant"||F.h>.3) byWall(i); });
  /* on the walls: clear of the door, the window (unless it is the curtain), other hangings and any tall furniture standing there */
  const wfree=(w,u0,u1,y0,y1)=>{ if(wr.some(r=>r[0]===w&&u0<r[2]+.08&&u1>r[1]-.08&&y0<r[4]+.08&&y1>r[3]-.08)) return false; return !rects.some(r=>{ if(r.length<5) return false; const F=FURN[r[4]]; if(F.h<y0-.05) return false; if(w===0) return r[2]<-RD/2+.5&&u0<r[1]&&u1>r[0]; if(w===1) return r[0]<-RW/2+.5&&u0<r[3]&&u1>r[2]; return r[1]>RW/2-.5&&u0<r[3]&&u1>r[2]; }); };
  const cur=order("curtain")[0]; if(cur!==undefined){ const F=FURN[cur]; it.push([cur,-1.2,Math.min(RH-F.h/2,1.55),0]); wr.push([0,-1.2-F.w/2,-1.2+F.w/2,1.55-F.h/2,1.55+F.h/2]); }
  pickd.filter(i=>FURN[i].wall&&FURN[i].c!=="curtain").forEach(i=>{ const F=FURN[i]; for(let n=0;n<50;n++){ const w=(rnd0()*3)|0, hl=wallLen(w)/2-F.w/2-.1, u=(rnd0()*2-1)*hl, y=Math.min(RH-F.h/2-.05,Math.max(F.h/2+1.0,1.45+rnd0()*.55)); if(wfree(w,u-F.w/2,u+F.w/2,y-F.h/2,y+F.h/2)){ wr.push([w,u-F.w/2,u+F.w/2,y-F.h/2,y+F.h/2]); it.push([i,Math.round(u*20)/20,Math.round(y*20)/20,w]); return; } } });
  s.prev=s.it; s.it=it.slice(0,MAXIT); save("mz.bag",bag); return s.it.length; }

/* ================= living in the room: lamps, little effects, walking round the furniture, the bed and its quilt ================= */
/* lamps: where the light sits (share of the height; a hanging's light sits at its middle) and its colour */
const LAMPS={deco11:[.8,"#ffd29a"],deco19:[.55,"#ffb860"],deco40:[.5,"#fff0c0"],deco47:[.5,"#ffc070"],misc07:[.6,"#fff4d8"],deco15:[.75,"#ffb050"],deco17:[.75,"#ffb050"],wall08:[0,"#fff0d0"],wall18:[0,"#ffc070"],wall02:[0,"#ffe14a"]};
const kindOf=F=>!F?"":F.c==="bed"||F.id==="misc01"?"bed":F.c==="chair"||F.id==="misc03"||F.id==="misc05"?"seat":F.c==="cabinet"?"closet":LAMPS[F.id]?"lamp":"";
const _lv=new T.Vector3();
function lampPos(n,out){ const t=ST().it[n], F=FURN[t[0]], g=R.fg.children[n]; if(!g) return null; const L=LAMPS[F.id]; g.updateMatrixWorld(true); return g.localToWorld(out.set(0,F.wall?0:F.h*L[0],F.wall?F.d*.6:0)); }
function lampsApply(){ const D=R; if(!D||!D.pl) return; const its=ST().it, on=[]; its.forEach((t,n)=>{ const F=FURN[t[0]]; if(F&&LAMPS[F.id]&&t[6]) on.push(n); });
  D.pl.forEach((l,i)=>{ const n=on[i]; if(n===undefined||!lampPos(n,l.position)){ l.intensity=0; l.position.set(0,-5,0); return; } l.color.set(LAMPS[FURN[its[n][0]].id][1]); l.intensity=.95; });
  while(D.glows.length<on.length){ const sp=new T.Sprite(new T.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,opacity:.8})); sp.renderOrder=6; D.S.add(sp); D.glows.push(sp); }
  D.glows.forEach((sp,i)=>{ const n=on[i]; if(n===undefined){ sp.visible=false; return; } lampPos(n,sp.position); const F=FURN[its[n][0]], k=kOf(its[n]); sp.material.color.set(LAMPS[F.id][1]); sp.scale.setScalar(.75*Math.max(.6,k)); sp.visible=true; }); }
/* little floating pictures (sparkles, notes, Zzz...) that rise and fade */
const EMO={}; const emoTex=e=>EMO[e]||(EMO[e]=cvs(128,128,(x)=>{ x.font='92px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign="center"; x.textBaseline="middle"; x.fillText(e,64,72); }));
let FX=[];
function fx(p,list,n,o={}){ if(!R) return; for(let i=0;i<n;i++){ const e=list[i%list.length], s=new T.Sprite(new T.SpriteMaterial({map:emoTex(e),transparent:true,depthWrite:false,opacity:0})); const sz=(o.s||.2)*(.8+Math.random()*.4); s.scale.set(sz,sz,1); s.position.copy(p); s.position.x+=(Math.random()-.5)*(o.r??.3); s.position.y+=(Math.random()-.5)*(o.ry||0); s.position.z+=(Math.random()-.5)*(o.r??.3); s.renderOrder=20; s.visible=false; R.S.add(s);
    FX.push({s,v:new T.Vector3((Math.random()-.5)*(o.sp??.5),(o.up??.6)+Math.random()*.3,(Math.random()-.5)*(o.sp??.5)),t:0,life:(o.life||1.3)+Math.random()*.4,d:i*(o.gap??.05),sz,sway:o.sway||0,k:i}); } }
function fxTick(dt){ for(let i=FX.length-1;i>=0;i--){ const f=FX[i]; if(f.d>0){ f.d-=dt; continue; } f.s.visible=true; f.t+=dt; const k=f.t/f.life; if(k>=1){ R.S.remove(f.s); f.s.material.dispose(); FX.splice(i,1); continue; }
    f.s.position.addScaledVector(f.v,dt); if(f.sway) f.s.position.x+=Math.sin(f.t*3+f.k)*f.sway*dt; f.v.multiplyScalar(1-dt*.9); f.s.material.opacity=k<.15?k/.15:1-Math.max(0,(k-.55)/.45); const sc=f.sz*(k<.15?.5+k/.3:1); f.s.scale.set(sc,sc,1); } }
function fxClear(){ FX.forEach(f=>{ if(R) R.S.remove(f.s); f.s.material.dispose(); }); FX=[]; }
/* walking: a grid of 10 cm cells over the floor, furniture (and a body's width round it) is blocked; the shortest way round, straightened */
function walkPath(x0,z0,x1,z1,skip){ const S=.1, NX=Math.round(RW/S), NZ=Math.round(RD/S), occ=new Uint8Array(NX*NZ), r=.17, cx=i=>-RW/2+(i+.5)*S, cz=j=>-RD/2+(j+.5)*S;
  for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++) if(Math.abs(cx(i))>RW/2-.22||Math.abs(cz(j))>RD/2-.22) occ[i+j*NX]=1;
  ST().it.forEach((t,n)=>{ const F=FURN[t[0]]; if(!F||F.wall||n===skip||restY(t)>0||(F.small&&hgt(t)<.3)) return; const [hw,hd]=foot(t); for(let j=0;j<NZ;j++){ if(Math.abs(cz(j)-t[2])>=hd+r) continue; for(let i=0;i<NX;i++) if(Math.abs(cx(i)-t[1])<hw+r) occ[i+j*NX]=1; } });
  const ci=x=>Math.max(0,Math.min(NX-1,Math.floor((x+RW/2)/S))), cj=z=>Math.max(0,Math.min(NZ-1,Math.floor((z+RD/2)/S)));
  const s0=ci(x0)+cj(z0)*NX, g=ci(x1)+cj(z1)*NX, gi=g%NX, gj=(g/NX)|0; const prev=new Int32Array(NX*NZ).fill(-2); prev[s0]=-1; const q=[s0]; let best=s0, bd=1e9;
  for(let h=0;h<q.length;h++){ const c=q[h], i=c%NX, j=(c/NX)|0, d=Math.hypot(i-gi,j-gj); if(d<bd&&(!occ[c]||c===g)){ bd=d; best=c; } if(c===g) break;
    for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){ const ni=i+di, nj=j+dj; if(ni<0||nj<0||ni>=NX||nj>=NZ) continue; const n=ni+nj*NX; const esc=occ[c]||c===s0; /* (starting inside furniture: step out any way) */ if(prev[n]!==-2||(occ[n]&&!esc)) continue; if(!esc&&di&&dj&&(occ[ni+j*NX]||occ[i+nj*NX])) continue; prev[n]=c; q.push(n); } }
  const cells=[]; for(let c=best;c>=0;c=prev[c]) cells.unshift(c); const pts=cells.map(c=>[cx(c%NX),cz((c/NX)|0)]); if(best===g&&pts.length) pts[pts.length-1]=[x1,z1]; pts[0]=[x0,z0];
  const clear=(a,b)=>{ const L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.ceil(L/.04); for(let k=1;k<n;k++){ const x=a[0]+(b[0]-a[0])*k/n, z=a[1]+(b[1]-a[1])*k/n; if(occ[ci(x)+cj(z)*NX]&&!(a===pts[0]&&occ[s0])) return false; } return true; };
  const out=[]; let a=0; while(a<pts.length-1){ let b=pts.length-1; while(b>a+1&&!clear(pts[a],pts[b])) b--; out.push(pts[b]); a=b; } return {pts:out,ok:best===g}; }
/* feeling a model with straight-down rays (in the piece's own coordinates) */
const RAY=new T.Raycaster(), _o=new T.Vector3(), _dn=new T.Vector3(0,-1,0);
function meshesOf(g){ const m=[]; g.traverse(o=>{ if(o.isMesh&&!o.userData.bl) m.push(o); }); return m; }
function probe(g,ms,x,z,top){ _o.set(x,top,z); g.localToWorld(_o); RAY.set(_o,_dn); RAY.far=50; const h=RAY.intersectObjects(ms,false)[0]; return h?g.worldToLocal(h.point.clone()).y:null; }
/* the colour at a point of a model: its picture under the point times the material colour (as seen on screen) */
const PIX=new Map();
function texel(h){ const c=new T.Color(1,1,1), mt=h.object.material, m=mt&&mt.map; if(m&&m.image&&h.uv){ let p=PIX.get(m.image); if(!p){ p={d:null}; try{ const im=m.image, cv=document.createElement("canvas"); cv.width=Math.min(256,im.width||256); cv.height=Math.min(256,im.height||256); const x=cv.getContext("2d"); x.drawImage(im,0,0,cv.width,cv.height); p={d:x.getImageData(0,0,cv.width,cv.height).data,w:cv.width,h:cv.height}; }catch(e){} PIX.set(m.image,p); }
    if(p.d){ const uv=h.uv.clone(), at=h.object.geometry.attributes.uv; if(at&&at.normalized){ const A=at.array, mx=A instanceof Uint16Array?65535:A instanceof Uint8Array?255:A instanceof Int16Array?32767:A instanceof Int8Array?127:1; uv.multiplyScalar(1/mx); } m.updateMatrix(); uv.applyMatrix3(m.matrix); let u=uv.x%1, v=uv.y%1; if(u<0) u+=1; if(v<0) v+=1; if(m.flipY) v=1-v; const i=(Math.min(p.h-1,(v*p.h)|0)*p.w+Math.min(p.w-1,(u*p.w)|0))*4; c.setRGB(p.d[i]/255,p.d[i+1]/255,p.d[i+2]/255); } }
  if(mt&&mt.color) c.multiply(mt.color.clone().convertLinearToSRGB()); return c; }
/* a bed: where the mattress is, which end the head goes, how wide, whether there is a footboard, and the colour of its frame.
   Worked out in a frame where the head is at -z (hs = +1 when the model's head end is really at +z) */
function bedInfo(n){ const t=ST().it[n], F=FURN[t[0]], g=R.fg.children[n]; if(!g||!g.userData.ready) return null; g.updateMatrixWorld(true); const ms=meshesOf(g), L=F.d, top=F.h+.6;
  const hs0=[];
  const P=(x,z,hs)=>probe(g,ms,hs>0?-x:x,hs>0?-z:z,top);
  const mid=[]; for(let z=-L*.28;z<=L*.28;z+=.07){ const y=P(0,z,-1); if(y!=null) mid.push(y); } if(!mid.length) return null; mid.sort((a,b)=>a-b); const M=mid[mid.length>>1];
  const endH=sg=>{ let m=-1; for(const x of [-.25,0,.25]){ const y=P(x,sg*(L/2-.1),-1); if(y!=null) m=Math.max(m,y); } return m; }; const eA=endH(-1), eB=endH(1); const hs=eB>eA+.05?1:-1;
  let hw=F.w/2-.02; for(const sg of [-1,1]){ let x=0; for(;x<F.w/2;x+=.02){ const y=P(sg*x,0,hs); if(y==null||Math.abs(y-M)>.07) break; } hw=Math.min(hw,x-.02); } hw=Math.max(.3,hw);
  let zf=0, board=false; for(;zf<L/2;zf+=.02){ const y=P(0,zf,hs); if(y==null) break; if(Math.abs(y-M)>.07){ board=y>M; break; } } zf=Math.max(.3,zf-.02);
  /* the frame's colour: the headboard if there is one, else the side rail below the mattress */
  const hits=[]; const look=(ox,oy,oz,dx,dz)=>{ _o.set(hs>0?-ox:ox,oy,hs>0?-oz:oz); g.localToWorld(_o); const d=new T.Vector3(hs>0?-dx:dx,0,hs>0?-dz:dz).transformDirection(g.matrixWorld); RAY.set(_o,d); RAY.far=3; const h=RAY.intersectObjects(ms,false)[0]; if(h) hits.push(texel(h)); };
  const hb=Math.max(eA,eB); if(hb>M+.15) for(const x of [-.3,-.1,.1,.3]) look(x,M+(hb-M)*.55,-L/2+.6,0,-1);
  if(!hits.length) for(const z of [-.4,0,.4]) look(F.w/2+.3,Math.max(.06,M-.1),z,-1,0);
  let col=new T.Color("#d9c4a4"); if(hits.length){ col=new T.Color(0,0,0); hits.forEach(c=>col.add(c)); col.multiplyScalar(1/hits.length); }
  const hsl={}; col.getHSL(hsl); if(hsl.s<.08) hsl.s*=1.0; col.setHSL(hsl.h,Math.min(.85,hsl.s*1.05),Math.max(.32,Math.min(.72,hsl.l)));
  return {M,hs,L,hw,zf,board,col,g,zr:-L/2+.73}; }
/* the quilt: a sheet laid over the sleeper. The body under it is felt with rays (so it follows the real shape: chest, arms, legs, feet),
   the cloth is then smoothed so it drapes instead of clinging, falls over both sides of the mattress (and the foot end when there is
   no footboard), and has a turned-down fold at the top. Coloured like the bed frame. */
let QT=null; const quiltTex=()=>QT||(QT=(()=>{ const t=cvs(128,128,(x,w,h)=>{ x.fillStyle="#fff"; x.fillRect(0,0,w,h); x.strokeStyle="rgba(60,40,30,.16)"; x.lineWidth=2; x.setLineDash([5,4]); x.beginPath(); x.moveTo(0,64); x.lineTo(64,0); x.lineTo(128,64); x.lineTo(64,128); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(0,0); x.lineTo(0,0); x.stroke();
  const g=x.createRadialGradient(64,64,6,64,64,60); g.addColorStop(0,"rgba(255,255,255,.0)"); g.addColorStop(1,"rgba(80,60,40,.07)"); x.fillStyle=g; x.fillRect(0,0,w,h); }); t.wrapS=t.wrapT=T.RepeatWrapping; return t; })());
function quilt(B,av){ const g=B.g, M=B.M, hw=B.hw, z0=B.zr-.17, z1=B.zf, NU=26, NV=36, drop=Math.min(.26,Math.max(.05,M-.04)), dropF=B.board?0:drop;
  /* the sleeper's top surface, in the bed's head-at--z frame */
  const ms=[]; av.root.updateMatrixWorld(true); av.root.traverse(o=>{ if(o.isMesh&&o.visible) ms.push(o); });
  const fr=(x,y,z)=>{ const v=new T.Vector3(B.hs>0?-x:x,y,B.hs>0?-z:z); return g.localToWorld(v); };
  const H=[]; for(let j=0;j<=NV;j++){ const z=z0+(z1-z0)*j/NV, row=[]; for(let i=0;i<=NU;i++){ const x=-hw+2*hw*i/NU; RAY.set(fr(x,M+1.2,z),_dn); RAY.far=3; const h=RAY.intersectObjects(ms,false)[0]; const y=h?g.worldToLocal(h.point.clone()).y:-1; row.push(Math.max(M+.03,y+.04)); } H.push(row); }
  /* widen every bump by one cell, so the cloth between two sample points cannot dip into a toe or a hand */
  { const H2=H.map((r,j)=>r.map((v,i)=>{ let m=v; for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){ const q=H[j+dj]&&H[j+dj][i+di]; if(q!=null&&q>m) m=q; } return m; })); H.splice(0,H.length,...H2); }
  /* smooth (the cloth spans the hollows), but never sink into the body */
  let A=H.map(r=>r.slice()); for(let it=0;it<4;it++){ const B2=A.map(r=>r.slice()); for(let j=0;j<=NV;j++) for(let i=0;i<=NU;i++){ let s=0,c=0; for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){ const r=A[j+dj]; if(!r||r[i+di]==null) continue; s+=r[i+di]; c++; } B2[j][i]=s/c; } A=B2.map((r,j)=>r.map((v,i)=>Math.max(v,H[j][i]-(it<3?.0:.0)))); }
  for(let j=0;j<=NV;j++) for(let i=0;i<=NU;i++){ const x=-hw+2*hw*i/NU, z=z0+(z1-z0)*j/NV; A[j][i]+=.004*Math.sin(x*21+z*5)*Math.sin(z*11+x*3); }
  /* vertices: the top (grid) plus a hanging edge on the sides (and foot) */
  const ED=5, cols=NU+1+2*ED, rows=NV+1+(dropF?ED:0), P=[], C=[], U=[], base=B.col.clone().convertSRGBToLinear(), fold=B.col.clone().lerp(new T.Color("#fffaf0"),.72).convertSRGBToLinear();
  const at=(i,j)=>{ const ii=Math.max(0,Math.min(NU,i)), jj=Math.max(0,Math.min(NV,j)); return A[jj][ii]; };
  for(let r=0;r<rows;r++){ for(let c=0;c<cols;c++){ const i=c-ED, j=Math.min(r,NV); let x=-hw+2*hw*Math.max(0,Math.min(NU,i))/NU, z=z0+(z1-z0)*j/NV, y=at(i,j);
      const es=i<0?-i:i>NU?i-NU:0, ef=r>NV?r-NV:0;
      if(es){ const e=es/ED, sg=i<0?-1:1, rr=.05; const s=e*(drop+rr); x+=sg*(s<rr?rr*Math.sin(s/rr*Math.PI/2):rr); y-=s<rr?rr*(1-Math.cos(s/rr*Math.PI/2)):rr+(s-rr); x+=sg*.012*Math.sin(z*9+sg); }
      if(ef){ const e=ef/ED, rr=.05, s=e*(dropF+rr); z+=s<rr?rr*Math.sin(s/rr*Math.PI/2):rr; y-=s<rr?rr*(1-Math.cos(s/rr*Math.PI/2)):rr+(s-rr); }
      const fz=z-z0; if(fz<.14&&!es){ y+=.012*Math.sin(Math.min(1,fz/.14)*Math.PI); }
      P.push(x,y-M,z); const cc=fz<.13?fold:base; C.push(cc.r,cc.g,cc.b); U.push(x*1.6,z*1.6); } }
  const I=[]; for(let r=0;r<rows-1;r++) for(let c=0;c<cols-1;c++){ const a=r*cols+c, b=a+1, d=a+cols, e=d+1; I.push(a,d,b,b,d,e); }
  const geo=new T.BufferGeometry(); geo.setAttribute("position",new T.Float32BufferAttribute(P,3)); geo.setAttribute("color",new T.Float32BufferAttribute(C,3)); geo.setAttribute("uv",new T.Float32BufferAttribute(U,2)); geo.setIndex(I); geo.computeVertexNormals();
  const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({map:quiltTex(),vertexColors:true,roughness:.92,metalness:0,side:T.DoubleSide})); mesh.userData.bl=1;
  const grp=new T.Group(); grp.userData.bl=1; grp.position.y=M; grp.rotation.y=B.hs>0?Math.PI:0; grp.add(mesh); g.add(grp); grp.userData.z1=z1; return grp; }
function quiltFree(q){ if(!q) return; if(q.parent) q.parent.remove(q); q.traverse(o=>{ if(o.isMesh){ o.geometry.dispose(); o.material.dispose(); } }); }
const thumbs={};
function thumb(k,i,a,b){ const key=k+i+"_"+a+"_"+b; if(thumbs[key]) return thumbs[key]; const c=document.createElement("canvas"); c.width=c.height=96; const x=c.getContext("2d"); x.scale(96/512,96/512); LIST[k][i].d(x,PAL[a],PAL[b]); return thumbs[key]=c.toDataURL("image/jpeg",.8); }
function css(){ if($("#rmCss")) return; const st=document.createElement("style"); st.id="rmCss"; st.textContent=`
.rm-tabs{display:flex;gap:6px;margin-bottom:8px}.rm-tabs button{flex:1;border:1px solid rgba(255,220,150,.35);border-radius:10px;padding:8px 4px;background:rgba(255,255,255,.06);color:#f3e7d0;font-weight:800;font-size:14px;font-family:inherit}.rm-tabs button.on{background:#d9aa3d;color:#2a1a08}
.rm-list{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;-webkit-overflow-scrolling:touch;touch-action:pan-x}.rm-it{flex:none;width:78px;border:2px solid transparent;border-radius:10px;background:rgba(255,255,255,.06);padding:4px;text-align:center;color:#f3e7d0;font-family:inherit}
.rm-it.on{border-color:#ffd76a}.rm-it img,.rm-it .none{display:block;width:66px;height:52px;object-fit:cover;border-radius:6px;margin:0 auto 3px;background:#3a2f2a}.rm-it img.rug{object-fit:contain;background:#55483f}.rm-it .none{line-height:52px;font-size:22px}
.rm-it b{display:block;font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rm-it small{display:block;font-size:10.5px;color:#ffd76a}.rm-it small.own{color:#9fe3a8}
.rm-pal{display:flex;align-items:center;gap:5px;overflow-x:auto;padding:2px 2px 6px;touch-action:pan-x}.rm-pal span{flex:none;font-size:12px;color:#cbb;width:30px}.rm-pal i{flex:none;width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.25)}.rm-pal i.on{border-color:#ffd76a;box-shadow:0 0 0 2px #ffd76a}
.rm-row{display:flex;gap:6px;margin-top:4px}.rm-row .shx-btn{font-size:14px;padding:9px 8px}.rm-row .alt{background:rgba(255,255,255,.12);color:#f3e7d0;border:1px solid rgba(255,220,150,.35)}
.rm-it .th{display:block;width:56px;height:56px;margin:0 auto 1px;background-size:448px auto;background-repeat:no-repeat;border-radius:6px;background-color:#55483f}
.rm-it .ico{display:block;width:66px;height:52px;line-height:52px;font-size:30px;border-radius:6px;margin:0 auto 3px;background:#3a2f2a}
.rm-chips{display:flex;gap:5px;overflow-x:auto;padding:0 2px 7px;touch-action:pan-x}.rm-chips button{flex:none;border:1px solid rgba(255,220,150,.3);border-radius:999px;padding:5px 11px;background:rgba(255,255,255,.05);color:#f3e7d0;font-size:12.5px;font-family:inherit}.rm-chips button.on{background:#ffe2a0;color:#2a1a08;font-weight:800}
.rm-tip{font-size:12px;color:#bba;margin:6px 0 0}
.rm-sl{display:flex;align-items:center;gap:8px;margin:7px 2px 2px;color:#f3e7d0;font-size:13px}.rm-sl span{flex:none;width:34px;font-weight:800}.rm-sl input{flex:1;min-width:0;accent-color:#d9aa3d;height:26px}.rm-sl b{flex:none;width:44px;text-align:right;font-size:12.5px;color:#ffd76a}
.rm-s0{flex:none;border:1px solid rgba(255,220,150,.35);border-radius:8px;background:rgba(255,255,255,.08);color:#f3e7d0;font-size:12px;padding:5px 7px;font-family:inherit}
.rm-lab{font-size:12px;color:#cbb;margin:2px 2px 4px;font-weight:700}.rm-ttl{font-weight:900;font-size:16px;color:#ffe2a0;margin:0 2px 6px}`; document.head.appendChild(st); }
RM.dbg=()=>R; RM.tint=m=>daylight(m); RM.blk=t=>blocked(t); RM.fs=t=>freeSpot(t); /* (for tests) */
RM.open=()=>{ if(!SHOPX||!SHOPX.enter){ toast("房間還沒準備好，請稍等一下",2200); return; } const D=build(), s=ST(); css(); V={...s}; const o={exposure:1.0}; const el=SHOPX.enter("room",o); try{ statInc("roomOpen"); }catch(e){}
  daylight();
  apply(); furnDraw(-1);
  const av=new Avatar(me.look.slice(),{npc:true,x:1.9,z:-RD/2+.3}); scene.remove(av.root); D.S.add(av.root); av.isMe=true; try{ av.setLook(me.look.slice()); }finally{ av.isMe=false; } av.moveSpeed=1.7; av.path=[]; av.update(0); av.root.position.y=0; av.root.visible=false; let tIn=0, went=false;
  let tab="l", yaw=-.38, drag=null;
  el.insertAdjacentHTML("beforeend",`<div class="shx-top"><span class="shx-title">🏠 我的房間</span><span class="shx-pill" id="rC"></span><button class="shx-x" id="rX">離開</button></div><div class="shx-panel" id="rP"></div>`);
  const $r=q=>el.querySelector(q);
  const cur=()=>tab==="r"?V.r:V[tab];
  const tabsH=k=>`<div class="rm-tabs">${[["l","生活"],["f","地板"],["w","壁紙"],["r","地毯"],["u","家具"]].map(([t,n])=>`<button data-t="${t}" class="${k===t?"on":""}">${n}</button>`).join("")}</div>`;
  const commit=()=>{ const s=ST(); for(const k of ["fa","fb","wa","wb","rx","rz","rr","rs"]) s[k]=V[k]; if(owned("f",V.f)) s.f=V.f; if(owned("w",V.w)) s.w=V.w; if(V.r<0||owned("r",V.r)) s.r=V.r; save("mz.bag",bag); };
  let sel=-1, pick=fidx("bed09");
  const pal=(lab,key)=>`<div class="rm-pal"><span>${lab}</span>${PAL.map((c,i)=>`<i data-c="${key}:${i}" class="${V[key]===i?"on":""}" style="background:${c}"></i>`).join("")}</div>`;
  let fcat="own";
  const drawU=()=>{ const s=ST(), F=FURN[pick], have=invN(pick), used=usedN(pick), t=sel>=0?s.it[sel]:null;
    const list=FURN.map((f,j)=>j).filter(j=>!FURN[j].hide&&(fcat==="own"?invN(j)>0:FURN[j].c===fcat));
    const items=list.map(j=>{ const f=FURN[j]; return `<button class="rm-it${pick===j?" on":""}" data-u="${j}"><i class="th" style="background-image:url(room/f/thumb-${f.c}.webp);background-position:-${(f.k%8)*56}px -${Math.floor(f.k/8)*56}px"></i><b>${f.n}</b><small class="${invN(j)?"own":""}">${invN(j)?`有 ${invN(j)}・擺 ${usedN(j)}`:f.src==="b"?f.p+" 幣":SRCS[f.src]}</small></button>`; }).join("")||`<p class="rm-tip" style="margin:14px 6px">這一類還沒有。</p>`;
    const chips=[["own","我有的"]].concat(FCAT).map(c=>`<button data-fc="${c[0]}" class="${fcat===c[0]?"on":""}">${c[1]}</button>`).join("");
    const canBuy=false, full=have>=MAXOWN; /* (11/14: furniture is bought at 家具行 in town; at home you only place what you have) */
    $r("#rP").innerHTML=`${tabsH("u")}<div class="rm-chips" id="rK">${chips}</div><div class="rm-list" id="rL">${items}</div>
      ${F&&!F.hide?`<div class="rm-row">${have>used?`<button class="shx-btn" id="uPut">擺出「${F.n}」</button>`:""}${canBuy&&!full?`<button class="shx-btn${have>used?" alt":""}" id="uBuy">${me.sp?"拿":"買"}一件${have>used?"":"「"+F.n+"」"}${me.sp?"":"・"+F.p+" 幣"}</button>`:""}</div>${!have?`<p class="rm-tip">${F.src==="b"?`「${F.n}」要到天后小鎮的「家具行」買，買了回家就能擺。`:`「${F.n}」不能用買的，要從${SRCN[F.src]}拿到。`}</p>`:""}`:""}
      ${t?`<div class="rm-row">${FURN[t[0]].wall?"":`<button class="shx-btn alt" id="uRot">↻ 轉 90 度</button>`}<button class="shx-btn alt" id="uOff">收起「${FURN[t[0]].n}」</button></div>
      <div class="rm-sl"><span>${FURN[t[0]].wall?"傾斜":"角度"}</span><input type="range" id="uAng" min="-45" max="45" step="1" value="${ian(t)}"><b id="uAngV">${ian(t)}°</b><button class="rm-s0" id="uAng0">擺正</button></div>
      ${SCL(FURN[t[0]].c)?`<div class="rm-sl"><span>${SCL(FURN[t[0]].c)==="x"?"寬度":"大小"}</span><input type="range" id="uSz" min="${SCL(FURN[t[0]].c)==="x"?60:50}" max="${SCL(FURN[t[0]].c)==="x"?160:250}" step="5" value="${Math.round(isc(t)*100)}"><b id="uSzV">${Math.round(isc(t)*100)}%</b><button class="rm-s0" id="uSz0">原本</button></div>`:""}`:""}
      <div class="rm-row"><button class="shx-btn alt" id="uRnd">🎲 隨機擺放</button>${Array.isArray(s.prev)?`<button class="shx-btn alt" id="uUndo">↩️ 回到上一個擺法</button>`:""}</div>
      <p class="rm-tip">${t?(FURN[t[0]].wall?"按住它可以在牆上拖動，也能拖到另一面牆。":"按住它可以拖動。小東西拖到桌子、櫃子上會自己放上去。")+"家具不能重疊。":"點房間裡的家具可以選它，再拖動、旋轉或收起來。"}最多擺 ${MAXIT} 件（現在 ${s.it.length} 件），同一種最多 ${MAXOWN} 件。</p>`;
    $r("#rP").querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{ tab=b.dataset.t; sel=-1; furnSel(-1); draw(); });
    const keepSl=f=>{ const sl=$r("#rL").scrollLeft, sk=$r("#rK").scrollLeft; f(); draw(); if($r("#rL")) $r("#rL").scrollLeft=sl; if($r("#rK")) $r("#rK").scrollLeft=sk; };
    $r("#rP").querySelectorAll("[data-fc]").forEach(b=>b.onclick=()=>{ const sk=$r("#rK").scrollLeft; fcat=b.dataset.fc; { const l=FURN.map((f,j)=>j).filter(j=>!FURN[j].hide&&(fcat==="own"?invN(j)>0:FURN[j].c===fcat)); if(l.length&&!l.includes(pick)) pick=l[0]; } draw(); $r("#rK").scrollLeft=sk; });
    $r("#rP").querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>keepSl(()=>{ pick=+b.dataset.u; }));
    const put=$r("#uPut"); if(put) put.onclick=()=>keepSl(()=>{ if(s.it.length>=MAXIT){ toast(`房間最多擺 ${MAXIT} 件，先收起幾件`,2400); return; } const t=F.wall?[pick,F.c==="curtain"?-1.2:0,F.c==="curtain"?1.55:1.6,0]:[pick,0,.6,0]; if(!freeSpot(t)){ toast("房間裡沒有空位放這件了，先移開或收起一些",2600); return; } s.it.push(t); sel=s.it.length-1; save("mz.bag",bag); furnDraw(sel); try{ tone(520,.06,.06,"triangle"); }catch(e){} });
    const by=$r("#uBuy"); if(by) by.onclick=()=>keepSl(()=>{ if(invN(pick)>=MAXOWN){ toast(`同一種家具最多 ${MAXOWN} 件`,2200); return; } if(!me.sp){ if(bag.coins<F.p){ try{ buzz(); }catch(e){} toast(`平安幣不夠（還差 ${F.p-bag.coins}）`,2600); return; } bag.coins-=F.p; } s.inv[pick]=invN(pick)+1; saveBag(); markDirty(); try{ profSave(true); }catch(e){} try{ statInc("roomBuy"); }catch(e){} try{ chaChing(); }catch(e){} toast(`${me.sp?"拿到":"買下"}「${F.n}」，按「擺出」放進房間`,2600); });
    $r("#uRnd").onclick=()=>keepSl(()=>{ sel=-1; const n=shuffleRoom(); furnDraw(-1); try{ [523,659,784].forEach((f,k)=>tone(f,.1,.05,"triangle",k*.07)); }catch(e){} toast(`🎲 幫你把擁有的家具重新擺了 ${n} 件。不喜歡可以再按一次，或按「回到上一個擺法」`,3600); });
    const ud=$r("#uUndo"); if(ud) ud.onclick=()=>keepSl(()=>{ const p=s.prev; s.prev=s.it; s.it=p.filter(t=>FURN[t[0]]); sel=-1; save("mz.bag",bag); furnDraw(-1); });
    const rt=$r("#uRot"); if(rt) rt.onclick=()=>{ const old=t.slice(); t[3]=(t[3]+1)%4; clampIt(t); if(blocked(t)){ t.splice(0,t.length,...old); selFlash(); toast("旁邊有東西，轉不過去",1800); } save("mz.bag",bag); furnSel(sel); };
    /* fine turn and size: a change that would make it overlap something is refused */
    const adj=(k,v)=>{ const old=t.slice(); if(k===5) t[5]=v; else t[4]=v; clampIt(t); if(blocked(t)){ t.splice(0,t.length,...old); selFlash(); return false; } furnSel(sel); return true; };
    const sl=(id,k,get,fmt,dflt)=>{ const el=$r("#"+id); if(!el) return; const show=()=>{ el.value=get(); $r("#"+id+"V").textContent=fmt(); }; el.oninput=()=>{ adj(k,k===5?+el.value:+el.value/100); show(); }; el.onchange=()=>save("mz.bag",bag); const z=$r("#"+id+"0"); if(z) z.onclick=()=>{ adj(k,dflt); show(); save("mz.bag",bag); }; };
    if(t){ sl("uAng",5,()=>ian(t),()=>ian(t)+"°",0); sl("uSz",4,()=>Math.round(isc(t)*100),()=>Math.round(isc(t)*100)+"%",1); }
    const off=$r("#uOff"); if(off) off.onclick=()=>keepSl(()=>{ s.it.splice(sel,1); sel=-1; save("mz.bag",bag); furnDraw(-1); }); };
  const draw=()=>{ $r("#rC").textContent=`💰 ${bag.coins}`; if(tab==="u"){ drawU(); return; } if(tab==="l"){ drawL(); return; } if(tab==="c"){ drawC(); return; } const k=tab, i=cur(); let items="", extra="";
    if(k==="r"){ items=`<button class="rm-it${V.r<0?" on":""}" data-i="-1"><span class="none">🚫</span><b>不放地毯</b><small class="own">&nbsp;</small></button>`+RUGS.map((r,j)=>`<button class="rm-it${V.r===j?" on":""}" data-i="${j}"><img class="rug" loading="lazy" src="room/rug${r[0]<10?"0":""}${r[0]}.webp" alt=""><b>${r[1]}</b><small class="${owned("r",j)?"own":""}">${owned("r",j)?"已擁有":r[3]+" 幣"}</small></button>`).join("");
      extra=V.r>=0?`<div class="rm-row"><button class="shx-btn alt" id="rRot">↻ 轉 90 度</button><button class="shx-btn alt" id="rSz">大小：${["小","中","大"][V.rs]}</button></div><p class="rm-tip">在「地毯」分頁裡，用手指按住地毯可以拖到想放的位置。</p>`:""; }
    else { const a=k==="f"?V.fa:V.wa, b=k==="f"?V.fb:V.wb; items=LIST[k].map((P,j)=>`<button class="rm-it${V[k]===j?" on":""}" data-i="${j}"><img src="${thumb(k,j,a,b)}" alt=""><b>${P.n}</b><small class="${owned(k,j)?"own":""}">${owned(k,j)?(P.p?"已擁有":"免費"):P.p+" 幣"}</small></button>`).join("");
      extra=pal("主色",k+"a")+pal("配色",k+"b"); }
    const need=i>=0&&!owned(k,i);
    $r("#rP").innerHTML=`${tabsH(k)}<div class="rm-list" id="rL">${items}</div>${extra}
      ${need?`<div class="rm-row"><button class="shx-btn" id="rBuy">購買「${nameOf(k,i)}」・${priceOf(k,i)} 幣</button></div><p class="rm-tip">現在看到的是試鋪的樣子，還沒買的話離開房間就會換回原本的。顏色可以隨時免費換。</p>`:""}`;
    $r("#rP").querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{ tab=b.dataset.t; if(tab==="u") endAct(); draw(); });
    $r("#rP").querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{ const j=+b.dataset.i, sl=$r("#rL").scrollLeft; if(k==="r") V.r=j; else V[k]=j; commit(); apply(); draw(); $r("#rL").scrollLeft=sl; try{ tone(700,.05,.05,"triangle"); }catch(e){} });
    $r("#rP").querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{ const [key,ci]=b.dataset.c.split(":"), sl=$r("#rL").scrollLeft, pls=[...$r("#rP").querySelectorAll(".rm-pal")].map(p=>p.scrollLeft); V[key]=+ci; commit(); apply(); draw(); $r("#rL").scrollLeft=sl; [...$r("#rP").querySelectorAll(".rm-pal")].forEach((p,n)=>{ p.scrollLeft=pls[n]||0; }); });
    const by=$r("#rBuy"); if(by) by.onclick=()=>{ const p=priceOf(k,i); if(bag.coins<p){ try{ buzz(); }catch(e){} toast(`平安幣不夠（還差 ${p-bag.coins}）`,2600); return; } bag.coins-=p; const s=ST(); const ok=k==="f"?"of":k==="w"?"ow":"or"; s[ok]|=1<<i; commit(); saveBag(); markDirty(); try{ profSave(true); }catch(e){} try{ statInc("roomBuy"); }catch(e){} try{ chaChing(); }catch(e){} toast(`買下「${nameOf(k,i)}」！`,2200); draw(); };
    const rt=$r("#rRot"); if(rt) rt.onclick=()=>{ V.rr=V.rr?0:1; commit(); rugApply(); }; const sz=$r("#rSz"); if(sz) sz.onclick=()=>{ V.rs=(V.rs+1)%3; commit(); rugApply(); draw(); }; };

  /* ---------- living: tap a piece to use it ---------- */
  const ACT={k:"",n:-1,ph:"",b:0,t:0,next:-1}, FOC={k:0}, hops=new Map(); let dimK=1;
  const its=()=>ST().it, grpOf=n=>D.fg.children[n];
  const W2=(g,x,y,z)=>{ g.updateMatrixWorld(true); return g.localToWorld(new T.Vector3(x,y,z)); };
  const inRoom=p=>Math.abs(p.x)<RW/2-.25&&Math.abs(p.z)<RD/2-.25;
  const goTo=(x,z,skip)=>{ const r=walkPath(av.pos.x,av.pos.y,x,z,skip); if(!r.pts.length) return r; av.moveTo(r.pts[0][0],r.pts[0][1]); av.path=r.pts.slice(1); return r; };
  const atRest=()=>!(av.path&&av.path.length)&&av.target.distanceTo(av.pos)<.05;
  const headMesh=()=>av.head&&av.head.children.find(o=>o.isMesh&&o.material&&o.material.map);
  const eyes=shut=>{ const hm=headMesh(); if(!hm) return; if(shut){ if(!hm.userData.open) hm.userData.open=hm.material.map; const l=me.look.slice(); l[7]=3; hm.material.map=faceTexture(l); } else if(hm.userData.open){ hm.material.map=hm.userData.open; hm.userData.open=null; } };
  const walkTo=(x,z)=>{ if(ACT.k&&ACT.ph!=="go"){ ACT.nextP=[x,z]; getUp(); return; } ACT.k=""; ACT.ph=""; goTo(x,z,-1); };
  const toggleWall=()=>{ const s=ST(); s.wl=s.wl===0?1:0; save("mz.bag",bag); wallLamp(); fx(D.lampShade.position.clone().add(new T.Vector3(.15,0,0)),s.wl?["✨","💡"]:["💤"],s.wl?6:2,{s:.15,r:.15,up:.35}); try{ tone(s.wl?1180:640,.05,.06,"square"); }catch(e){} if(tab==="l") draw(); };
  const POKE={deco12:["🎵","🎶"],deco33:["🎵","🎶"],appl08:["🎮","✨"],appl11:["🎮","⭐"],deco42:["💰","✨"],deco45:["🫧"],deco37:["🎁","✨"],deco34:["❄️","✨"],deco01:["🫧","✨"],appl01:["☕"],appl03:["🍟"],appl02:["🍚"],appl15:["🍃"],appl05:["🔥"],wall04:["🐦"],deco08:["🎡","✨"],deco35:["✨"],deco48:["💤"],appl07:["🐾"]};
  const poke=n=>{ const t=its()[n], F=FURN[t[0]], g=grpOf(n); if(!g) return; const top=F.wall?W2(g,0,0,F.d*.8):W2(g,0,F.h*.9,0); const L=POKE[F.id]||(F.c==="plant"?["🌸","🍃"]:["✨"]); fx(top,L,6,{s:.16,r:.22,up:.45,sway:.25});
    if(!F.wall&&F.c!=="bed") hops.set(n,0);
    try{ if(L[0]==="🎵") [523,659,784,659,880,784].forEach((f,k)=>tone(f,.16,.05,"triangle",k*.16)); else if(F.id==="wall04") [784,622,784,622].forEach((f,k)=>tone(f,.14,.06,"sine",k*.22)); else if(L[0]==="🎮") [880,1320,1760].forEach((f,k)=>tone(f,.06,.04,"square",k*.07)); else tone(990+Math.random()*200,.07,.04,"triangle"); }catch(e){}
    if(/^(deco31|wall09|deco22|deco44)$/.test(F.id)){ const d=new Date(Date.now()+288e5); toast(`🕰️ 現在 ${d.getUTCHours()}:${String(d.getUTCMinutes()).padStart(2,"0")}`,2000); } };
  const hopTick=dt=>{ hops.forEach((h,n)=>{ h+=dt; const g=grpOf(n), t=its()[n]; if(!g||!t){ hops.delete(n); return; } g.userData.hop=h<.36?Math.sin(h/.36*Math.PI)*.07:0; place(g,t); if(h>=.36) hops.delete(n); else hops.set(n,h); }); };
  const interact=n=>{ const t=its()[n], F=t&&FURN[t[0]], g=grpOf(n); if(!F||!g) return; const kd=kindOf(F);
    if(kd==="lamp"){ t[6]=t[6]?0:1; save("mz.bag",bag); lampsApply(); const p=lampPos(n,new T.Vector3()); if(p) fx(p,t[6]?["✨","💡"]:["💤"],t[6]?6:2,{s:.15,r:.2,up:.35}); try{ tone(t[6]?1180:640,.05,.06,"square"); tone(t[6]?1560:480,.06,.04,"triangle",.05); }catch(e){} return; }
    if(!kd){ poke(n); return; }
    if(ACT.k&&ACT.ph!=="go"){ if(ACT.n===n&&ACT.k!=="closet") return; ACT.next=n; getUp(); return; }
    if(kd==="bed"&&!g.userData.ready){ toast("床還在準備，等一下再點",1800); return; }
    const C=kd==="bed"?[W2(g,F.w/2+.3,0,0),W2(g,-F.w/2-.3,0,0),W2(g,F.w/2+.3,0,.4),W2(g,-F.w/2-.3,0,.4),W2(g,0,0,F.d/2+.3)]:[W2(g,0,0,F.d/2+(kd==="closet"?.4:.32)),W2(g,F.w/2+.3,0,0),W2(g,-F.w/2-.3,0,0)];
    const cand=C.filter(inRoom).map(p=>({p,r:walkPath(av.pos.x,av.pos.y,p.x,p.z,n)})); let c=cand.find(q=>q.r.ok); if(!c){ toast("走不過去，有東西擋住了",2000); return; }
    Object.assign(ACT,{k:kd,n,ph:"go",b:0,t:0,ax:c.p.x,az:c.p.z,nextP:null}); av.moveTo(c.r.pts[0][0],c.r.pts[0][1]); av.path=c.r.pts.slice(1); try{ tone(620,.05,.04,"triangle"); }catch(e){} };
  const start=()=>{ const n=ACT.n, t=its()[n], F=t&&FURN[t[0]], g=grpOf(n); if(!F||!g){ ACT.k=""; ACT.ph=""; return; }
    av.pos.set(av.root.position.x,av.root.position.z); av.target.copy(av.pos); av.path=[]; const P={p0:new T.Vector3(av.pos.x,0,av.pos.y),r0:av.rotY};
    if(ACT.k==="seat"){ g.updateMatrixWorld(true); let sy=probe(g,meshesOf(g),0,F.d*.06,F.h+.4); if(sy==null||sy>.8||sy<.12) sy=Math.min(.46,F.h*.5); P.p1=W2(g,0,sy-.25,F.d*.04); P.r1=g.rotation.y; }
    else if(ACT.k==="bed"){ const B=bedInfo(n); if(!B){ toast("床還在準備，等一下再點",1800); ACT.k=""; ACT.ph=""; return; } ACT.B=B; P.p1=W2(g,B.hs>0?0:0,B.M,B.hs>0?-B.zr:B.zr); P.r1=g.rotation.y+(B.hs>0?Math.PI:0); }
    else { P.p1=P.p0.clone(); P.r1=yaw; /* (turns round to face you, to show the clothes) */ fx(W2(g,0,F.h*.6,F.d/2+.05),["✨","👗","✨"],7,{s:.17,r:.5,up:.4,sway:.3}); try{ tone(220,.18,.05,"sawtooth"); [784,988,1175].forEach((f,k)=>tone(f,.12,.05,"triangle",.15+k*.07)); }catch(e){} }
    ACT.P=P; ACT.ph="in"; ACT.b=0; ACT.t=0; };
  const getUp=()=>{ if(!ACT.k) return; if(ACT.ph==="go"){ ACT.k=""; ACT.ph=""; return; } if(ACT.k==="closet"){ finish(); return; } ACT.ph="out"; eyes(false); };
  const endAct=()=>{ if(!ACT.k) return; if(ACT.ph==="go"){ ACT.k=""; ACT.ph=""; return; } ACT.b=0; ACT.next=-1; ACT.nextP=null; finish(); };
  const finish=()=>{ quiltFree(ACT.q); ACT.q=null; eyes(false); av.parts.rotation.set(0,0,0); av.parts.position.set(0,0,0); if(ACT.P){ av.root.position.copy(ACT.P.p0); av.pos.set(ACT.P.p0.x,ACT.P.p0.z); av.target.copy(av.pos); }
    const was=ACT.k; ACT.k=""; ACT.ph=""; ACT.P=null; ACT.B=null; if(was==="closet"||tab==="c"){ tab="l"; try{ profSave(true); }catch(e){} } if(tab==="l") draw();
    const nx=ACT.next, np=ACT.nextP; ACT.next=-1; ACT.nextP=null; if(nx>=0) interact(nx); else if(np) goTo(np[0],np[1],-1); };
  const pose=()=>{ const P=ACT.P; if(!P) return; const b=Math.max(0,Math.min(1,ACT.b)), k=b*b*(3-2*b);
    av.root.position.lerpVectors(P.p0,P.p1,k); if(ACT.k==="bed") av.root.position.y+=Math.sin(k*Math.PI)*.16;
    let ry=lerpAngle(P.r0,P.r1,Math.min(1,k*1.5)); if(ACT.k==="closet"&&ACT.tw>0) ry+=(1-ACT.tw/.7)*Math.PI*2; av.root.rotation.y=ry; av.rotY=ry;
    if(ACT.k==="bed"){ av.parts.rotation.x=-Math.PI/2*k; av.parts.position.set(0,.12*k,.55*k); for(const L of av.legs) L.rotation.x*=1-k; av.arms.forEach((a,i)=>{ a.rotation.x=a.rotation.x*(1-k)+.1*k; a.rotation.z=a.rotation.z*(1-k)+(i?.15:-.15)*k; }); av.torso.rotation.x*=1-k; av.head.rotation.x*=1-k; }
    if(ACT.k==="seat"){ const sw=ACT.ph==="on"?Math.sin(ACT.t*2.3)*.13:0; av.legs[0].rotation.x=-1.45*k+sw; av.legs[1].rotation.x=-1.45*k-sw; av.arms.forEach((a,i)=>{ a.rotation.x=a.rotation.x*(1-k)-.55*k; a.rotation.z=a.rotation.z*(1-k)+(i?.12:-.12)*k; }); } };
  const _hv=new T.Vector3();
  const actTick=dt=>{ ACT.t+=dt;
    if(ACT.ph==="go"&&atRest()){ if(Math.hypot(av.pos.x-ACT.ax,av.pos.y-ACT.az)>.5){ ACT.k=""; ACT.ph=""; toast("走不過去，有東西擋住了",2000); } else start(); }
    if(ACT.ph==="in"){ ACT.b+=dt/(ACT.k==="bed"?.75:.5); if(ACT.b>=1){ ACT.b=1; ACT.ph="on"; ACT.t=0; ACT.zz=.6;
        if(ACT.k==="bed"){ pose(); eyes(true); try{ ACT.q=quilt(ACT.B,av); ACT.qa=0; }catch(e){ console.warn("quilt",e); } try{ [392,330,262].forEach((f,k)=>tone(f,.3,.04,"sine",k*.25)); }catch(e){} }
        if(ACT.k==="seat"){ fx(av.root.position.clone().add(new T.Vector3(0,.3,0)),["✨"],4,{s:.13,r:.4,up:.3}); try{ tone(330,.08,.05,"sine"); }catch(e){} }
        if(ACT.k==="closet"){ tab="c"; } draw(); } }
    if(ACT.ph==="out"){ ACT.b-=dt/.5; if(ACT.q){ ACT.qa=Math.max(0,(ACT.qa||0)-dt*3); } if(ACT.b<=0){ ACT.b=0; pose(); finish(); return; } }
    if(ACT.ph==="on"&&ACT.k==="closet"&&ACT.tw>0) ACT.tw=Math.max(0,ACT.tw-dt);
    if(ACT.q){ if(ACT.ph==="on") ACT.qa=Math.min(1,(ACT.qa||0)+dt/.8); const m=ACT.q.children[0], a=ACT.qa||0, sm=a*a*(3-2*a), z1=ACT.q.userData.z1, s=.1+.9*sm; m.scale.z=s; m.position.z=z1*(1-s); m.scale.y=1+.022*Math.sin(ACT.t*1.7)*sm; ACT.q.visible=a>.01; }
    if(ACT.ph==="on"&&ACT.k==="bed"){ ACT.zz-=dt; if(ACT.zz<=0){ ACT.zz=1.7; av.head.getWorldPosition(_hv); _hv.y+=.12; fx(_hv,["💤"],1,{s:.2,r:.05,up:.22,sp:.08,sway:.25,life:2.2}); } }
    if(ACT.P&&ACT.ph!=="go") pose();
    const want=ACT.k==="bed"&&ACT.ph==="on"?.55:1; dimK+=(want-dimK)*Math.min(1,dt*1.2); if(D.base){ D.hemi.intensity=D.base.hemi*dimK; D.sun.intensity=D.base.sun*dimK; } };
  /* the 生活 panel, and the wardrobe */
  const drawL=()=>{ const s=ST(), posed=ACT.k&&ACT.ph!=="go";
    $r("#rP").innerHTML=`${tabsH("l")}<p class="rm-tip" style="margin:2px 2px 8px;font-size:13.5px;color:#f3e7d0">點房間裡的東西：床可以睡覺、椅子可以坐、衣櫃可以換衣服、燈可以開關。點地板就走過去。</p>
      <div class="rm-row">${posed?`<button class="shx-btn" id="lUp">${ACT.k==="bed"?"🌅 起床":"🧍 站起來"}</button>`:""}<button class="shx-btn alt" id="lLamp">${s.wl===0?"💡 打開壁燈":"💡 關掉壁燈"}</button></div>
      <p class="rm-tip">「家具」分頁可以移動、轉角度；擺飾、盆栽、壁掛、掛畫可以調大小，窗簾可以調寬度。</p>`;
    $r("#rP").querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{ tab=b.dataset.t; if(tab==="u") endAct(); sel=-1; furnSel(-1); draw(); });
    const u=$r("#lUp"); if(u) u.onclick=()=>getUp(); $r("#lLamp").onclick=toggleWall; };
  const wear=(i,n)=>{ if(i===3&&(!styleOwned(n)||(n===16&&!me.sp))) return; const l=me.look.slice(); l[i]=n; if(i===1&&n>0) l[2]=HAIR_PRESET_COLOR[n]; const s2=sanitizeLook(l,!!me.sp); me.look=s2; save("mz.me",me); try{ draftLook=s2.slice(); }catch(e){} try{ meAv.setLook(me.look); }catch(e){}
    av.isMe=true; try{ av.setLook(s2.slice()); }finally{ av.isMe=false; } markDirty(); ACT.tw=.7; fx(av.root.position.clone().add(new T.Vector3(0,.7,0)),["✨","🌟"],8,{s:.14,r:.55,up:.45}); try{ [659,880,1175].forEach((f,k)=>tone(f,.12,.05,"triangle",k*.07)); }catch(e){} };
  const drawC=()=>{ const l=me.look, sty=STYLES.map((x,i)=>i).filter(i=>(i!==16||me.sp)&&styleOwned(i)), all=a=>a.map((x,i)=>i);
    const chips=(lab,idx,list,names)=>`<div class="rm-lab">${lab}</div><div class="rm-chips">${list.map(i=>`<button data-w="${idx}:${i}" class="${l[idx]===i?"on":""}">${names[i]}</button>`).join("")}</div>`;
    const sw=(lab,idx,cols)=>`<div class="rm-pal"><span>${lab}</span>${cols.map((c,i)=>`<i data-w="${idx}:${i}" class="${l[idx]===i?"on":""}" style="background:${c}"></i>`).join("")}</div>`;
    const keep=[...$r("#rP").querySelectorAll(".rm-chips,.rm-pal")].map(e=>e.scrollLeft);
    $r("#rP").innerHTML=`<div class="rm-ttl">👗 衣櫃</div>${chips("款式",3,sty,STYLES)}${sw("衣服",4,OUTFIT)}${sw("配色",5,ACCENT)}${chips("頭飾",6,all(HATS),HATS)}${chips("配件",12,all(GEAR),GEAR)}${chips("髮型",1,all(HAIRS),HAIRS)}<div class="rm-row"><button class="shx-btn" id="cDone">換好了</button></div>`;
    [...$r("#rP").querySelectorAll(".rm-chips,.rm-pal")].forEach((e,i)=>{ e.scrollLeft=keep[i]||0; });
    $r("#rP").querySelectorAll("[data-w]").forEach(b=>b.onclick=()=>{ const [i,n]=b.dataset.w.split(":").map(Number); wear(i,n); draw(); });
    $r("#cDone").onclick=()=>{ finish(); }; };
  RM.use=n=>interact(n); RM.up=()=>getUp(); RM.act=()=>ACT; /* (for tests) */
  $r("#rX").onclick=()=>SHOPX.leave();
  /* drag: on the rug (地毯 tab) moves it, anywhere else turns the view; a tap on the floor walks there */
  const tl=el.querySelector(".shx-touch"), v2=new T.Vector2(), hit=new T.Vector3();
  const floorAt=e=>{ v2.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1); D.ray.setFromCamera(v2,D.cam); return D.ray.ray.intersectPlane(D.plane,hit)?hit:null; };
  const WP=[[new T.Plane(new T.Vector3(0,0,1),RD/2),0],[new T.Plane(new T.Vector3(1,0,0),RW/2),1],[new T.Plane(new T.Vector3(-1,0,0),RW/2),2]], wh=new T.Vector3();
  /* where on a wall the finger points: the nearest wall that faces the camera, as [wall, along, height] */
  const wallAt=e=>{ v2.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1); D.ray.setFromCamera(v2,D.cam); let best=null; for(const [pl,w] of WP){ if(D.ray.ray.direction.dot(pl.normal)>=0) continue; if(!D.ray.ray.intersectPlane(pl,wh)) continue; const u=w===0?wh.x:wh.z; if(Math.abs(u)>wallLen(w)/2+.4||wh.y<-.3||wh.y>RH+.6) continue; const dd=wh.distanceToSquared(D.ray.ray.origin); if(!best||dd<best[3]) best=[w,u,wh.y,dd]; } return best; };
  const pickIt=e=>{ v2.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1); D.ray.setFromCamera(v2,D.cam); let hs=[]; try{ hs=D.ray.intersectObjects(D.fg.children,true); }catch(_){} for(const h of hs){ let o=h.object; while(o&&o.parent!==D.fg) o=o.parent; if(o){ const n=D.fg.children.indexOf(o); if(n>=0) return n; } } return -1; };
  tl.addEventListener("pointerdown",e=>{ drag={x:e.clientX,y:e.clientY,yaw,mv:0,rug:false,it:-1};
    if(tab==="u"){ const h=pickIt(e), its=ST().it; if(h>=0&&FURN[its[h][0]]){ drag.it=h; if(FURN[its[h][0]].wall){ const q=wallAt(e); drag.ox=q&&q[0]===its[h][3]?its[h][1]-q[1]:0; drag.oz=q&&q[0]===its[h][3]?its[h][2]-q[2]:0; } else { const p=floorAt(e); drag.ox=p?its[h][1]-p.x:0; drag.oz=p?its[h][2]-p.z:0; if(restY(its[h])>0){ drag.ox=0; drag.oz=0; drag.lift=1; } } if(sel!==h){ sel=h; pick=its[h][0]; furnSel(sel); draw(); } } }
    const p=floorAt(e); if(drag.it<0&&p&&tab==="r"&&V.r>=0&&D.rug.visible&&Math.abs(p.x-V.rx)<D.rug.userData.hw&&Math.abs(p.z-V.rz)<D.rug.userData.hd){ drag.rug=true; drag.ox=V.rx-p.x; drag.oz=V.rz-p.z; } try{ tl.setPointerCapture(e.pointerId); }catch(_){} });
  tl.addEventListener("pointermove",e=>{ if(!drag) return; drag.mv=Math.max(drag.mv,Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y));
    if(drag.it>=0){ const t=ST().it[drag.it]; if(!t||drag.mv<=6) return; if(FURN[t[0]].wall){ const q=wallAt(e); if(q){ const ox=q[0]!==t[3]?0:drag.ox, oz=q[0]!==t[3]?0:drag.oz; if(!tryMove(t,()=>{ t[3]=q[0]; t[1]=q[1]+ox; t[2]=q[2]+oz; })) selFlash(); else if(q[0]===t[3]){ drag.ox=ox; drag.oz=oz; } furnSel(drag.it); } } else { const p=floorAt(e); if(p){ if(!tryMove(t,()=>{ t[1]=p.x+drag.ox; t[2]=p.z+drag.oz; })) selFlash(); furnSel(drag.it); } } }
    else if(drag.rug){ const p=floorAt(e); if(p){ V.rx=p.x+drag.ox; V.rz=p.z+drag.oz; rugApply(); } } else if(drag.mv>8) yaw=Math.max(-.62,Math.min(.62,drag.yaw-(e.clientX-drag.x)*.006)); });
  const up=e=>{ if(!drag) return; const d=drag; drag=null; if(d.it>=0){ save("mz.bag",bag); return; } if(d.rug){ commit(); return; } if(d.mv<=8&&tab==="u"&&sel>=0){ sel=-1; furnSel(-1); draw(); return; } if(d.mv<=8){ if(tab!=="u"&&tab!=="c"){ const h=pickIt(e); if(h>=0){ interact(h); return; } v2.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1); D.ray.setFromCamera(v2,D.cam); if(D.ray.ray.distanceToPoint(D.lampShade.position)<.24){ toggleWall(); return; } }
      const p=floorAt(e); if(p&&Math.abs(p.x)<RW/2-.3&&Math.abs(p.z)<RD/2-.3) walkTo(p.x,p.z); } };
  tl.addEventListener("pointerup",up); tl.addEventListener("pointercancel",()=>{ if(drag&&drag.rug) commit(); drag=null; });
  draw();
  /* coming in: the door swings open, you step through it and walk to the middle, the door closes behind you, and the view pulls back */
  o.update=dt=>{ tIn+=dt; const op=tIn<2.3?Math.min(1,tIn/.45):Math.max(0,1-(tIn-2.3)/.5); D.door.rotation.y=-1.45*op*op*(3-2*op); if(!went&&tIn>.4){ went=true; av.root.visible=true; av.moveSpeed=1.7; goTo(.9,.5,-1); try{ tone(180,.12,.05,"sine"); }catch(e){} } if(tIn>3.2) av.moveSpeed=2.2; av.update(dt); av.root.position.y=0; actTick(dt); fxTick(dt); hopTick(dt); };
  o.render=dt=>{ const c=D.cam, asp=innerWidth/innerHeight; c.aspect=asp; const ph=Math.min(.6,(($r("#rP").offsetHeight||220))/innerHeight); const vt=Math.tan(c.fov*Math.PI/360), ht=vt*asp;
    const need=Math.max((RW/2+.5)/ht,(RH+2.2)/(2*vt*Math.max(.3,1-ph))); const d0=Math.min(40,need), pit=.5; let k=Math.min(1,Math.max(0,(tIn-.5)/2.2)); k=k*k*(3-2*k);
    /* while you sleep, sit or change, the view moves in on you */ FOC.k+=((ACT.k&&ACT.ph!=="go"?1:0)-FOC.k)*Math.min(1,(dt||.016)*2.2); const fk=FOC.k*k*FOC.k*(3-2*FOC.k);
    let d=d0*(.5+.5*k)*(1-.42*fk), tx=1.5*(1-k), tz=-1.2*(1-k), cy=1.0; if(fk>.001){ const fp=av.root.position; tx+=(fp.x-tx)*fk*.85; tz+=(fp.z-tz)*fk*.85; cy+=(fp.y+.42-cy)*fk; } const ty=cy-ph*d*vt*.95;
    c.position.set(tx+Math.sin(yaw)*Math.cos(pit)*d,ty+Math.sin(pit)*d,tz+Math.cos(yaw)*Math.cos(pit)*d); c.lookAt(tx,ty,tz); c.updateProjectionMatrix(); renderer.render(D.S,c);
    if(D.view){ /* the view out of the window: a camera standing at the window looking straight out (turning a little as you turn the room), its picture centred on the window */
      const V=D.view, C2=V.cam, W=innerWidth, H=innerHeight; let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
      for(const [dx,dy] of [[-.75,-.55],[.75,-.55],[.75,.55],[-.75,.55]]){ V.wc.set(V.wpos.x+dx,V.wpos.y+dy,V.wpos.z).project(c); const sx=(V.wc.x*.5+.5)*W, sy=(V.wc.y*.5+.5)*H; x0=Math.min(x0,sx); x1=Math.max(x1,sx); y0=Math.min(y0,sy); y1=Math.max(y1,sy); }
      if(x1>x0+2&&y1>y0+2){ C2.aspect=(x1-x0)/(y1-y0); C2.fov=48; C2.position.set(0,1.5,1); C2.rotation.set(-.03,yaw*.45,0,"YXZ"); C2.updateProjectionMatrix();
        const vp=V.vp||(V.vp=new T.Vector4()); renderer.getViewport(vp); const ac=renderer.autoClear; renderer.autoClear=false; renderer.setViewport(x0,y0,x1-x0,y1-y0);
        try{ renderer.render(V.O,C2); } finally{ renderer.autoClear=ac; renderer.setViewport(vp.x,vp.y,vp.z,vp.w); } } } };
  o.dispose=()=>{ try{ commit(); }catch(e){} try{ quiltFree(ACT.q); }catch(e){} fxClear(); D.glows.forEach(sp=>sp.visible=false); D.pl.forEach(l=>{ l.intensity=0; }); PIX.clear(); if(D.base){ D.hemi.intensity=D.base.hemi; D.sun.intensity=D.base.sun; } while(D.fg.children.length) D.fg.remove(D.fg.children[0]); D.sel.visible=false; modelsFree(); D.S.remove(av.root); try{ av.dispose(); }catch(e){} saveBag(); markDirty(); try{ profSave(true); }catch(e){} V=null; }; };
HANDLERS.roomOpen=()=>{ closeSheet(); RM.open(); };
/* 取回碼 */
RM.pack=()=>{ const s=ST(); return [[s.f,4],[s.w,4],[s.fa,5],[s.fb,5],[s.wa,5],[s.wb,5],[s.r+1,5],[Math.round((s.rx+3)*10),6],[Math.round((s.rz+2.5)*10),6],[s.rr,1],[s.rs,2],[s.of&1023,10],[s.ow&1023,10],[s.or&1023,10],[(s.or>>>10)&1023,10]].concat(FURN.map((f,i)=>[Math.min(MAXOWN,s.inv[i]|0),2]),[[Math.min(MAXIT,s.it.length),5]],...s.it.slice(0,MAXIT).map(t=>[[t[0],8],[Math.round((t[1]+3)*10),6],[Math.round((t[2]+2.5)*10),6],[t[3]&3,2]]),[[1,1]],...s.it.slice(0,MAXIT).map(t=>[[Math.round((isc(t)-.5)/.05),6],[ian(t)+64,7]])); }; /* (size and fine turn come last: older codes simply read as none) */
RM.unpack=get=>{ const o={f:get(4),w:get(4),fa:get(5),fb:get(5),wa:get(5),wb:get(5),r:get(5)-1,rx:get(6)/10-3,rz:get(6)/10-2.5,rr:get(1),rs:get(2),of:get(10),ow:get(10),or:get(10)|(get(10)<<10)}; const inv={}; FURN.forEach((f,i)=>{ const n=get(2); if(n) inv[i]=n; }); const n=get(5), raw=[]; for(let k=0;k<n;k++) raw.push([get(8),get(6)/10-3,get(6)/10-2.5,get(2)]); if(get(1)) raw.forEach(t=>{ const a=get(6), b=get(7); if(a!==10) t[4]=Math.round((.5+a*.05)*100)/100; if(b!==64) t[5]=b-64; }); const it=raw.filter(t=>FURN[t[0]]); o.inv=inv; o.it=it; return o; };
RM.restore=o=>{ if(!o) return; const s=ST(), of=s.of|o.of, ow=s.ow|o.ow, or=s.or|o.or; const inv={...s.inv}; for(const k in o.inv) inv[k]=Math.max(inv[k]|0,o.inv[k]|0); Object.assign(s,o); s.v=2; s.inv=inv; s.it.forEach(t=>{ inv[t[0]]=Math.max(inv[t[0]]|0,s.it.filter(u=>u[0]===t[0]).length); }); s.of=of; s.ow=ow; s.or=or; s.f=Math.min(FLOORS.length-1,s.f); s.w=Math.min(WALLS.length-1,s.w); s.r=Math.min(RUGS.length-1,s.r); s.rs=Math.min(2,s.rs); save("mz.bag",bag); };
/* 家具行 (11/14): the shop counter — browse by kind, buy; it goes into your home's 「我有的」 to place */
let FS_CAT="bed";
RM.furnShop=()=>{ const cats=FCAT.filter(c=>FURN.some(f=>!f.hide&&f.src==="b"&&f.c===c[0])); if(!cats.some(c=>c[0]===FS_CAT)) FS_CAT=cats[0][0];
  const list=FURN.map((f,j)=>j).filter(j=>!FURN[j].hide&&FURN[j].src==="b"&&FURN[j].c===FS_CAT);
  const tab=c=>`<button class="${FS_CAT===c[0]?"primary":"secondary"}" style="flex:none;width:auto;min-height:0;padding:7px 11px;font-size:14px" data-act="fsCat" data-v="${c[0]}">${c[1]}</button>`;
  openSheet("lfFurn","🪑 家具行",`<p class="lead">美雲姐：「慢慢看，喜歡哪件跟我說。買了回家，在房間的「家具」分頁就能擺出來。」</p><div style="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px">${cats.map(tab).join("")}</div>`+list.map(j=>{ const f=FURN[j], n=invN(j), full=n>=MAXOWN;
    return `<div class="lf-row"><i style="flex:none;width:56px;height:56px;background-size:448px auto;background-repeat:no-repeat;background-image:url(room/f/thumb-${f.c}.webp);background-position:-${(f.k%8)*56}px -${Math.floor(f.k/8)*56}px;border-radius:10px;background-color:#f4ede2"></i><div class="t"><b>${f.n}</b>　${f.p} 幣<br><small>${n?`家裡有 ${n} 件`:"家裡還沒有"}${full?`（最多 ${MAXOWN} 件）`:""}</small></div>${full?"":`<button class="primary" data-act="fsBuy" data-v="${j}">買</button>`}</div>`; }).join("")); };
HANDLERS.fsCat=v=>{ FS_CAT=v; RM.furnShop(); };
HANDLERS.fsBuy=v=>{ const j=+v, F=FURN[j]; if(!F||F.hide||F.src!=="b") return; const s=ST(); if(invN(j)>=MAXOWN){ toast(`同一種家具最多 ${MAXOWN} 件`,2200); return; } if(bag.coins<F.p){ try{ buzz(); }catch(e){} toast(`平安幣不夠（還差 ${F.p-bag.coins}）`,2600); return; } bag.coins-=F.p; s.inv[j]=invN(j)+1; saveBag(); markDirty(); try{ profSave(true); statInc("roomBuy"); chaChing(); }catch(e){} toast(`買下「${F.n}」！回家在「家具」分頁按「擺出」`,2800); RM.furnShop(); };
return RM; })();

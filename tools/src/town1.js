/* ================= 天后小鎮: the town down the road past the 禪房 (the stretch that used to be closed for road works).
   It is part of the same world — you walk in, there is no change of screen — but it is built in districts ("chunks"): only the
   districts near you exist, the far ones are thrown away again, so the town can keep growing without the phone holding all of it.
   Everything here is a stand-in shape (boxes with a painted front and a sign that says what the place is) until the chair's
   models arrive: a district's build function is the only thing that has to change then.
   World: the main street carries on from the old road (x 24.6–31.4) towards −z.
     z −52…−73   鎮口: 牌樓, 公告欄, 公車站
     z −73…−81   老街 (east–west), shops on both sides
     z −90…−100  小吃廣場 (east of the main street)
     z −105…−111 住宅巷 (east–west), sixteen houses; the first one west of the main street is yours
     z −117…−131 河堤公園: 花圃, 涼亭; the river beyond, a 釣魚 pier at the end of the main street, the station across the water
   ================= */
TOWNX=(()=>{
const TW={on:false};
const LINK=[28,-49.8], MOUTH=[28,-51.3];
const ZR=[-8,88,-137.5,-50.5];
/* where you can walk: streets, the square, the park, the pier — minus the solid things standing on them */
const WALK=[[22.8,33.2,-131,-51.6],[33.2,88,-81,-73],[33.2,60,-100,-90],[-8,66,-111,-105],[-8,66,-131,-117],[26.2,29.8,-137.5,-130.5]];
/* (the old street runs east only: west of the main street stands the great 媽祖 statue, 42 m tall, at x 0, z −65) */
const SHOPS_N=[["家具行","#c96a3a",34.5,"tw:furn"],["花店","#5f9a6a",43.5,"tw:flower"],["釣具行","#3f7fa8",52.5,"tw:tackle"],["早餐店","#e2a23a",61.5,"tw:soon:早餐店"],["飲料店","#d9628a",70.5,"tw:soon:飲料店"],["書店","#7a6aa8",79.5,"tw:soon:書店"]];
const SHOPS_S=[["理髮廳","#4a8fb0",34.5],["五金行","#8a6a4a",43.5],["中藥行","#7a4a3a",52.5],["雜貨店","#b0863a",61.5],["照相館","#6a7a8a",70.5],["鐘錶行","#5a6a5a",79.5]];
const HOUSE_X=[15.5,8.5,1.5,-5.5,34.5,41.5,48.5,55.5], HCOL=["#e8dcc8","#d9c7b0","#c9d6cf","#e3cfc4","#d2d6e0","#e6dfb8","#d8c4c4","#cfe0d0"];
const STALLS=[38,44,50,56], BEDS=[38,42,46,50,54,58];
const BLOCK=[[23.1,24.1,-58.5,-57.5],[31.9,32.9,-58.5,-57.5]].concat(STALLS.map(x=>[x-1.5,x+1.5,-99.6,-97.4]),BEDS.map(x=>[x-1.5,x+1.5,-127.2,-124.8]),[[10.2,10.8,-125.8,-125.2],[13.2,13.8,-125.8,-125.2],[10.2,10.8,-122.8,-122.2],[13.2,13.8,-122.8,-122.2]]);
const inR=(r,x,z)=>x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3];
TW.in=(x,z)=>z<-50.5;
TW.walk=(x,z)=>{ for(const b of BLOCK) if(inR(b,x,z)) return false; for(const w of WALK) if(inR(w,x,z)) return true; return false; };
/* ---- finding the way: straight if nothing is in between, otherwise along a one-metre grid (A*) and then straightened ---- */
const clear=(ax,az,bx,bz)=>{ const d=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.ceil(d/.4)); for(let i=1;i<=n;i++){ const t=i/n; if(!TW.walk(ax+(bx-ax)*t,az+(bz-az)*t)) return false; } return true; };
let GRID=null; const GX0=ZR[0]-1, GZ0=ZR[2]-1, GNX=Math.ceil(ZR[1]-ZR[0])+2, GNZ=Math.ceil(ZR[3]-ZR[2])+2;
function grid(){ if(GRID) return GRID; GRID=new Uint8Array(GNX*GNZ); for(let j=0;j<GNZ;j++) for(let i=0;i<GNX;i++) GRID[j*GNX+i]=TW.walk(GX0+i+.5,GZ0+j+.5)?1:0; return GRID; }
function tpath(fx,fz,tx,tz){ if(clear(fx,fz,tx,tz)) return [[tx,tz]]; const g=grid(), ci=x=>Math.max(0,Math.min(GNX-1,Math.floor(x-GX0))), cj=z=>Math.max(0,Math.min(GNZ-1,Math.floor(z-GZ0)));
  const near=(i,j)=>{ if(g[j*GNX+i]) return [i,j]; for(let r=1;r<6;r++) for(let dj=-r;dj<=r;dj++) for(let di=-r;di<=r;di++){ const a=i+di, b=j+dj; if(a>=0&&b>=0&&a<GNX&&b<GNZ&&g[b*GNX+a]) return [a,b]; } return null; };
  const s=near(ci(fx),cj(fz)), e=near(ci(tx),cj(tz)); if(!s||!e) return [[tx,tz]]; const S=s[1]*GNX+s[0], E=e[1]*GNX+e[0];
  const cost=new Float32Array(GNX*GNZ).fill(1e9), from=new Int32Array(GNX*GNZ).fill(-1), open=[S]; cost[S]=0; const hx=k=>Math.hypot(k%GNX-e[0],Math.floor(k/GNX)-e[1]); let guard=0;
  while(open.length&&guard++<20000){ let bi=0; for(let k=1;k<open.length;k++) if(cost[open[k]]+hx(open[k])<cost[open[bi]]+hx(open[bi])) bi=k; const c=open.splice(bi,1)[0]; if(c===E) break; const ci0=c%GNX, cj0=Math.floor(c/GNX);
    for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){ if(!di&&!dj) continue; const a=ci0+di, b=cj0+dj; if(a<0||b<0||a>=GNX||b>=GNZ||!g[b*GNX+a]) continue; if(di&&dj&&(!g[cj0*GNX+a]||!g[b*GNX+ci0])) continue; const n=b*GNX+a, nc=cost[c]+(di&&dj?1.414:1); if(nc<cost[n]){ if(cost[n]>=1e9) open.push(n); cost[n]=nc; from[n]=c; } } }
  if(from[E]<0&&E!==S) return [[tx,tz]]; const cells=[]; for(let c=E;c>=0&&c!==S;c=from[c]) cells.unshift([GX0+c%GNX+.5,GZ0+Math.floor(c/GNX)+.5]);
  const out=[]; let ax=fx, az=fz, k=0; while(k<cells.length){ let far=k; for(let m=cells.length-1;m>k;m--) if(clear(ax,az,cells[m][0],cells[m][1])){ far=m; break; } out.push(cells[far]); ax=cells[far][0]; az=cells[far][1]; k=far+1; }
  if(TW.walk(tx,tz)) out.push([tx,tz]); return out.length?out:[[tx,tz]]; }
TW.route=(fx,fz,tx,tz,fg,tg)=>{ const a=TW.in(fx,fz), b=TW.in(tx,tz); if(a&&b) return tpath(fx,fz,tx,tz);
  if(a) return tpath(fx,fz,MOUTH[0],MOUTH[1]).concat([LINK.slice()],planPath(LINK[0],LINK[1],tx,tz,0,tg));
  return planPath(fx,fz,LINK[0],LINK[1],fg,0).concat([MOUTH.slice()],tpath(MOUTH[0],MOUTH[1],tx,tz)); };
/* ---- shared pictures and paints (made once, kept) ---- */
let TX=null;
function tex(){ if(TX) return TX; const rep=t=>{ t.wrapS=t.wrapT=T.RepeatWrapping; return t; }; const sp=(x,w,h,n,f)=>{ for(let i=0;i<n;i++){ x.fillStyle=f(); x.fillRect(Math.random()*w,Math.random()*h,2,2); } };
  TX={ asphalt:rep(cvs(128,128,(x,w,h)=>{ x.fillStyle="#48494c"; x.fillRect(0,0,w,h); sp(x,w,h,1400,()=>{ const l=50+Math.random()*60|0; return `rgba(${l},${l},${l+3},.5)`; }); })),
    pave:rep(cvs(128,128,(x,w,h)=>{ x.fillStyle="#a89a88"; x.fillRect(0,0,w,h); for(let j=0;j<8;j++) for(let i=0;i<4;i++){ const l=150+((i*7+j*13)%5)*8; x.fillStyle=`rgb(${l+14},${l},${l-16})`; x.fillRect(i*32+(j%2?16:0)-16+1,j*16+1,30,14); x.fillRect(i*32+(j%2?16:0)+112+1,j*16+1,30,14); } })),
    grass:rep(cvs(128,128,(x,w,h)=>{ x.fillStyle="#5d8a4a"; x.fillRect(0,0,w,h); sp(x,w,h,1600,()=>`rgba(${60+Math.random()*50|0},${120+Math.random()*60|0},${50+Math.random()*30|0},.6)`); })),
    plaza:rep(cvs(128,128,(x,w,h)=>{ x.fillStyle="#c9b9a2"; x.fillRect(0,0,w,h); x.strokeStyle="rgba(90,70,50,.35)"; x.lineWidth=2; for(let i=0;i<=2;i++){ x.beginPath(); x.moveTo(i*64,0); x.lineTo(i*64,h); x.moveTo(0,i*64); x.lineTo(w,i*64); x.stroke(); } sp(x,w,h,500,()=>"rgba(120,100,80,.25)"); })),
    water:rep(cvs(128,128,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,"#3f8fb0"); g.addColorStop(1,"#2f6f96"); x.fillStyle=g; x.fillRect(0,0,w,h); x.strokeStyle="rgba(255,255,255,.22)"; x.lineWidth=2; for(let j=0;j<6;j++){ x.beginPath(); for(let i=0;i<=w;i+=8) x.lineTo(i,j*22+10+Math.sin(i/w*6.283*2+j)*3); x.stroke(); } })),
    /* one bay (4 m wide, two floors) of a shop front and of a house front, drawn pale so each building's paint tints it */
    shop:rep(cvs(256,256,(x,w,h)=>{ x.fillStyle="#f4f0e8"; x.fillRect(0,0,w,h); x.fillStyle="#3a4654"; x.fillRect(30,24,78,74); x.fillRect(148,24,78,74); x.fillStyle="#e9e3d6"; x.fillRect(66,24,6,74); x.fillRect(184,24,6,74); x.fillRect(30,58,78,5); x.fillRect(148,58,78,5);
      x.fillStyle="#8a8f96"; x.fillRect(0,122,w,10); x.fillStyle="#2c3640"; x.fillRect(14,142,228,104); x.fillStyle="#cfe0ea"; x.globalAlpha=.25; x.fillRect(20,148,100,92); x.fillRect(136,148,100,92); x.globalAlpha=1; x.fillStyle="#e9e3d6"; x.fillRect(124,142,8,104); x.fillStyle="#6b6258"; x.fillRect(0,246,w,10); })),
    house:rep(cvs(256,256,(x,w,h)=>{ x.fillStyle="#f4f0e8"; x.fillRect(0,0,w,h); const win=(X,Y,W,H)=>{ x.fillStyle="#e9e3d6"; x.fillRect(X-5,Y-5,W+10,H+10); x.fillStyle="#3a4654"; x.fillRect(X,Y,W,H); x.fillStyle="#e9e3d6"; x.fillRect(X+W/2-2,Y,4,H); x.fillRect(X,Y+H/2-2,W,4); };
      win(40,30,64,64); win(152,30,64,64); x.fillStyle="#8a8f96"; x.fillRect(0,120,w,8); win(34,150,70,62); x.fillStyle="#e9e3d6"; x.fillRect(150,140,66,116); x.fillStyle="#7a5236"; x.fillRect(156,146,54,110); x.fillStyle="#d9aa3d"; x.beginPath(); x.arc(200,204,5,0,6.283); x.fill(); x.fillStyle="#6b6258"; x.fillRect(0,246,150,10); x.fillRect(216,246,40,10); })) };
  return TX; }
const FMAT={}; const fmat=(kind,col)=>FMAT[kind+col]||(FMAT[kind+col]=new T.MeshStandardMaterial({map:tex()[kind],color:col,roughness:.9}));
const GMAT={}; const gmat=(kind,o)=>GMAT[kind]||(GMAT[kind]=new T.MeshStandardMaterial(Object.assign({map:tex()[kind],roughness:.95,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},o||{})));
/* ---- building blocks ---- */
function ground(C,kind,x0,x1,z0,z1,y,pick,tile){ const w=x1-x0, d=z1-z0, g=new T.PlaneGeometry(w,d), uv=g.attributes.uv, k=tile||3; for(let i=0;i<uv.count;i++) uv.setXY(i,(uv.getX(i)*w+x0)/k,(uv.getY(i)*d-z1)/k);
  const m=new T.Mesh(g,gmat(kind)); m.rotation.x=-Math.PI/2; m.position.set((x0+x1)/2,y,(z0+z1)/2); if(pick){ m.userData.floor=1; m.userData.keep=1; pickables.push(m); C.picks.push(m); } else m.userData.gnd=1; C.g.add(m); return m; }
function sign(C,text,w,h,x,y,z,ry,bg,fg){ const t=cvs(256,Math.round(256*h/w),(c,W,H)=>{ c.fillStyle=bg||"#fbf6ea"; c.fillRect(0,0,W,H); c.strokeStyle="rgba(0,0,0,.35)"; c.lineWidth=6; c.strokeRect(3,3,W-6,H-6); c.fillStyle=fg||"#2a1a12"; c.textAlign="center"; c.textBaseline="middle"; let fs=H*.62; c.font=`900 ${fs}px ${DISPLAY_FONT}`; const tw=c.measureText(text).width; if(tw>W*.86){ fs*=W*.86/tw; c.font=`900 ${fs}px ${DISPLAY_FONT}`; } c.fillText(text,W/2,H/2+2); });
  const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:t,roughness:.6,emissive:"#ffffff",emissiveMap:t,emissiveIntensity:.25})); m.position.set(x,y,z); m.rotation.y=ry; m.userData.keep=1; m.userData.own=1; C.g.add(m); return m; }
/* a building: a painted box, its front one way or the other along z (dir −1 faces −z, +1 faces +z), a roof and a sign */
function bld(C,x0,w,zf,dep,dir,col,kind,name,roof){ const H=6.2, cx=x0+w/2, cz=zf-dir*dep/2; box(w,H,dep,mat(col,{roughness:.9}),cx,H/2,cz,C.g);
  const fg=new T.PlaneGeometry(w,H), uv=fg.attributes.uv; for(let i=0;i<uv.count;i++) uv.setX(i,uv.getX(i)*w/4); const f=new T.Mesh(fg,fmat(kind,col)); f.position.set(cx,H/2,zf+dir*.02); f.rotation.y=dir>0?0:Math.PI; C.g.add(f);
  const rc=mat(roof||"#8a4a3a",{roughness:.8}); box(w+.3,.3,dep+.5,rc,cx,H+.15,cz,C.g); if(kind==="house") box(w+.3,.5,dep*.5,rc,cx,H+.55,cz,C.g); else box(w+.1,.5,.2,mat("#d8d2c6",{roughness:.8}),cx,H+.55,zf+dir*.1,C.g);
  if(kind==="shop"){ box(w-.2,.12,1.1,mat(col,{roughness:.7}),cx,3.15,zf+dir*.55,C.g); if(name) sign(C,name,Math.min(w-1.2,5),.85,cx,3.75,zf+dir*.08,dir>0?0:Math.PI); }
  else if(name) sign(C,name,1.5,.42,cx+(dir>0?1:-1)*(w*.5-2.3),2.72,zf+dir*.05,dir>0?0:Math.PI,"#fbf6ea"); }
function tree(C,x,z,s){ s=s||1; cyl(.12*s,.16*s,1.6*s,mat("#6b4a2e",{roughness:.9}),x,.8*s,z,C.g,6); for(const [dx,dy,dz,r] of [[0,2.3,0,1.05],[.5,1.9,.3,.75],[-.5,2.0,-.2,.8]]){ const m=new T.Mesh(new T.IcosahedronGeometry(r*s,0),mat("#3f8a4a",{roughness:.95})); m.position.set(x+dx*s,dy*s,z+dz*s); C.g.add(m); } }
function lamp(C,x,z){ cyl(.05,.07,3.4,mat("#3a3a3e",{roughness:.6}),x,1.7,z,C.g,6); const b=new T.Mesh(new T.SphereGeometry(.2,8,6),mat("#fff0c8",{emissive:"#ffd98a",emissiveIntensity:1.2,roughness:.6})); b.position.set(x,3.5,z); C.g.add(b); }
function bench(C,x,z,ry){ const g=new T.Group(); g.position.set(x,0,z); g.rotation.y=ry||0; C.g.add(g); box(1.5,.07,.42,mat("#8a6246",{roughness:.8}),0,.45,0,g); box(1.5,.4,.06,mat("#8a6246",{roughness:.8}),0,.75,-.2,g); for(const s of [-.6,.6]) box(.07,.45,.4,mat("#3a3a3e"),s,.22,0,g); }
function street(C,x0,x1,z0,z1,along){ /* asphalt with a paved walk on each side; along "z" or "x" */ if(along==="z"){ ground(C,"asphalt",x0+1.8,x1-1.8,z0,z1,.012,true); ground(C,"pave",x0,x0+1.8,z0,z1,.02,true,2); ground(C,"pave",x1-1.8,x1,z0,z1,.02,true,2); const y=mat("#f2c230",{roughness:.7}); for(let z=z0+1;z<z1-1;z+=4) box(.12,.012,2,y,(x0+x1)/2,.022,z+1,C.g); }
  else { ground(C,"asphalt",x0,x1,z0+1.4,z1-1.4,.012,true); ground(C,"pave",x0,x1,z0,z0+1.4,.02,true,2); ground(C,"pave",x0,x1,z1-1.4,z1,.02,true,2); } }
/* ---- the districts: each knows its middle and its size; build(C) puts its things into C.g ---- */
const CH=[
 {id:"gate",c:[28,-62],r:16,build:C=>{ street(C,22.8,33.2,-73,-52,"z"); ground(C,"grass",17,22.8,-89,-52,.006); ground(C,"grass",33.2,48,-65,-52,.006); /* west of the street stays open: the great statue stands there */ sign(C,"← 媽祖大神像",2.2,.45,22.4,2.0,-70,Math.PI/2,"#8e1c14","#ffe2a0"); cyl(.05,.05,2.2,mat("#3a3a3e"),22.4,1.1,-70,C.g,6);
   /* 牌樓 */ const red=mat("#b3261e",{roughness:.6}), gold=mat("#d9aa3d",{roughness:.4,metalness:.3}); for(const x of [23.6,32.4]){ cyl(.32,.36,6,red,x,3,-58,C.g,10); box(.9,.5,.9,mat("#8a8a86"),x,.25,-58,C.g); } box(10.6,.5,.7,red,28,5.6,-58,C.g); box(11.6,.35,1.3,mat("#3f6a52",{roughness:.6}),28,6.55,-58,C.g); box(9,.3,1.0,mat("#3f6a52",{roughness:.6}),28,7.1,-58,C.g); box(4.6,.14,.1,gold,28,5.2,-57.6,C.g);
   sign(C,"天后小鎮",4.2,1.0,28,6.0,-57.62,0,"#8e1c14","#ffe2a0"); sign(C,"天后小鎮",4.2,1.0,28,6.0,-58.38,Math.PI,"#8e1c14","#ffe2a0");
   /* 公告欄 */ box(2.2,1.5,.12,mat("#6b432c",{roughness:.8}),21.9,1.55,-61,C.g).rotation.y=Math.PI/2; for(const dz of [-1,1]) cyl(.06,.06,2.3,mat("#6b432c"),21.9,1.15,-61+dz,C.g,6); sign(C,"公告欄・今日功課",2.0,.42,21.98,2.1,-61,Math.PI/2);
   /* 公車站 */ box(.1,2.4,3.2,mat("#cfe0ea",{roughness:.3,transparent:true,opacity:.5}),34.4,1.2,-64,C.g).userData.keep=1; box(1.4,.1,3.4,mat("#3f6a8a",{roughness:.5}),34.0,2.45,-64,C.g); for(const dz of [-1.5,1.5]) cyl(.05,.05,2.4,mat("#3a3a3e"),33.5,1.2,-64+dz,C.g,6); bench(C,34.05,-64,-Math.PI/2); sign(C,"公車站・往天后宮",2.4,.42,33.42,2.75,-64,-Math.PI/2,"#3f6a8a","#ffffff");
   for(const z of [-54,-66]){ lamp(C,23,z); lamp(C,33,z); } for(const [x,z] of [[19,-56],[20,-66],[38,-55],[43,-61],[37,-62]]) tree(C,x,z,1.2); }},
 {id:"oldE1",c:[47,-77],r:20,build:C=>{ street(C,33.2,61,-81,-73,"x"); SHOPS_N.filter(s=>s[2]<61).forEach(s=>bld(C,s[2],8,-73,8,-1,s[1],"shop",s[0])); SHOPS_S.filter(s=>s[2]<61).forEach(s=>bld(C,s[2],8,-81,8,1,s[1],"shop",s[0],"#6a6a6e")); for(const x of [40,52]) lamp(C,x,-73.6); for(const x of [46,58]) lamp(C,x,-80.4); }},
 {id:"oldE2",c:[75,-77],r:20,build:C=>{ street(C,61,88,-81,-73,"x"); SHOPS_N.filter(s=>s[2]>=61).forEach(s=>bld(C,s[2],8,-73,8,-1,s[1],"shop",s[0])); SHOPS_S.filter(s=>s[2]>=61).forEach(s=>bld(C,s[2],8,-81,8,1,s[1],"shop",s[0],"#6a6a6e")); for(const x of [64,76,87]) lamp(C,x,-73.6); for(const x of [70,82]) lamp(C,x,-80.4); ground(C,"grass",88,94,-89,-65,.006); }},
 {id:"mid",c:[28,-93],r:14,build:C=>{ street(C,22.8,33.2,-105,-73,"z"); ground(C,"grass",8,22.8,-100,-89,.006); for(const z of [-86,-98]){ lamp(C,23,z); lamp(C,33,z); } for(const [x,z] of [[19,-93],[13,-96],[16,-91]]) tree(C,x,z,1.15); }},
 {id:"plaza",c:[47,-95],r:16,build:C=>{ ground(C,"plaza",33.2,60,-100,-90,.016,true,4); sign(C,"小吃廣場",3,.7,35.2,3.2,-90.2,0,"#b3261e","#ffe2a0"); for(const dx of [-1.4,1.4]) cyl(.06,.06,3.6,mat("#3a3a3e"),35.2+dx,1.8,-90.2,C.g,6);
   STALLS.forEach((x,i)=>{ const col=["#d9628a","#e2a23a","#5f9a6a","#4a8fb0"][i]; box(3,1.0,2.2,mat("#e9e3d6",{roughness:.8}),x,.5,-98.5,C.g); box(3.4,.12,2.8,mat(col,{roughness:.7}),x,2.5,-98.3,C.g); for(const [dx,dz] of [[-1.5,-1.2],[1.5,-1.2],[-1.5,1.0],[1.5,1.0]]) cyl(.04,.04,2.5,mat("#3a3a3e"),x+dx,1.25,-98.5+dz,C.g,6); sign(C,["蔥油餅","豆花","滷味","紅茶冰"][i],1.8,.5,x,2.1,-97.25,0,col,"#ffffff"); });
   for(const [x,z] of [[39,-93],[45,-94],[51,-93],[57,-94]]){ cyl(.5,.5,.06,mat("#f3ece0",{roughness:.6}),x,.74,z,C.g,12); cyl(.05,.05,.74,mat("#3a3a3e"),x,.37,z,C.g,6); for(const a of [0,2.1,4.2]) cyl(.18,.18,.45,mat("#c96a3a",{roughness:.8}),x+Math.cos(a)*.85,.22,z+Math.sin(a)*.85,C.g,8); } for(const x of [36,48,59]) lamp(C,x,-90.6); }},
 {id:"laneW",c:[8,-108],r:22,build:C=>{ street(C,-8,22.8,-111,-105,"x"); HOUSE_X.filter(x=>x<22).forEach((x,i)=>{ bld(C,x,6,-105,5,-1,HCOL[i],"house",i===0?"我的家":"",["#8a4a3a","#5a6a7a","#6a5a4a","#7a4a4a"][i]); bld(C,x,6,-111,5.5,1,HCOL[i+4],"house","",["#5a6a7a","#7a4a4a","#8a4a3a","#6a5a4a"][i]); box(.3,.9,.3,mat(i===0?"#b3261e":"#5a6a7a",{roughness:.5}),x+.6,.45,-105.3,C.g); }); for(const x of [-2,12]) lamp(C,x,-105.5); ground(C,"grass",-12,-8,-117,-99,.006); }},
 {id:"laneE",c:[50,-108],r:22,build:C=>{ street(C,33.2,66,-111,-105,"x"); HOUSE_X.filter(x=>x>22).forEach((x,i)=>{ bld(C,x,6,-105,5,-1,HCOL[(i+2)%8],"house","",["#6a5a4a","#8a4a3a","#5a6a7a","#7a4a4a"][i]); bld(C,x,6,-111,5.5,1,HCOL[(i+6)%8],"house","",["#7a4a4a","#6a5a4a","#8a4a3a","#5a6a7a"][i]); box(.3,.9,.3,mat("#5a6a7a",{roughness:.5}),x+.6,.45,-105.3,C.g); }); for(const x of [40,54]) lamp(C,x,-105.5); ground(C,"grass",62,70,-117,-99,.006); }},
 {id:"pier",c:[28,-124],r:18,build:C=>{ street(C,22.8,33.2,-117,-105,"z"); ground(C,"plaza",22.8,33.2,-131,-117,.016,true,4); const wood=mat("#8a6246",{roughness:.85}); box(3.6,.1,7.2,wood,28,0,-134,C.g); { const d=new T.Mesh(new T.PlaneGeometry(3.6,7),mat("#8a6246",{roughness:.85})); d.rotation.x=-Math.PI/2; d.position.set(28,.056,-134); d.userData.floor=1; d.userData.keep=1; pickables.push(d); C.picks.push(d); C.g.add(d); } for(const [x,z] of [[26.2,-131],[29.8,-131],[26.2,-137.4],[29.8,-137.4]]) cyl(.1,.1,1.4,wood,x,.3,z,C.g,6);
   sign(C,"釣魚碼頭",2,.5,28,2.3,-130.6,0,"#3f6a8a","#ffffff"); for(const dx of [-.9,.9]) cyl(.05,.05,2.5,mat("#3a3a3e"),28+dx,1.25,-130.6,C.g,6);
   /* the river, and the station across it (not reachable yet) */ { const w=new T.Mesh(new T.PlaneGeometry(90,12),new T.MeshStandardMaterial({map:tex().water,roughness:.25,metalness:.1,transparent:true,opacity:.92})); w.material.map.repeat.set(1,1); const uv=w.geometry.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*15,uv.getY(i)*2); w.rotation.x=-Math.PI/2; w.position.set(28,-.12,-137.5); w.userData.keep=1; C.g.add(w); C.water=w; }
   ground(C,"grass",-14,72,-150,-143.5,.006); box(14,4.2,6,mat("#d9c7b0",{roughness:.9}),28,2.1,-148,C.g); box(15,.4,7,mat("#8a4a3a",{roughness:.8}),28,4.4,-148,C.g); sign(C,"天后車站（興建中）",6,.9,28,3.3,-144.95,0,"#fbf6ea"); for(const z of [-112,-124]){ lamp(C,23,z); lamp(C,33,z); } }},
 {id:"parkW",c:[8,-124],r:24,build:C=>{ ground(C,"grass",-8,22.8,-131,-117,.014,true,4); ground(C,"pave",-8,22.8,-120.2,-118.8,.02,true,2); /* 涼亭 */ const red=mat("#b3261e",{roughness:.6}); for(const [x,z] of [[10.5,-125.5],[13.5,-125.5],[10.5,-122.5],[13.5,-122.5]]) cyl(.14,.14,2.8,red,x,1.4,z,C.g,8); { const r=new T.Mesh(new T.ConeGeometry(3.1,1.5,4),mat("#3f6a52",{roughness:.7})); r.position.set(12,3.55,-124); r.rotation.y=Math.PI/4; C.g.add(r); } box(3.6,.12,3.6,mat("#c9b9a2",{roughness:.8}),12,.06,-124,C.g); bench(C,12,-125.1,0);
   for(const [x,z] of [[-4,-123],[2,-128],[6,-122],[18,-128],[20,-122],[-6,-129]]) tree(C,x,z,1.25); bench(C,0,-121,0); bench(C,17,-121,0); for(const x of [-4,8,20]) lamp(C,x,-118.4); ground(C,"grass",-14,22.8,-131.6,-131,.006); }},
 {id:"parkE",c:[50,-124],r:24,build:C=>{ ground(C,"grass",33.2,66,-131,-117,.014,true,4); ground(C,"pave",33.2,66,-120.2,-118.8,.02,true,2); sign(C,"社區花圃",2.4,.55,36.2,1.9,-123.6,0,"#5f9a6a","#ffffff"); for(const dx of [-1,1]) cyl(.05,.05,1.9,mat("#3a3a3e"),36.2+dx,.95,-123.6,C.g,6);
   BEDS.forEach(x=>{ box(3,.28,2.4,mat("#8a6246",{roughness:.9}),x,.14,-126,C.g); box(2.7,.06,2.1,mat("#4a3426",{roughness:1}),x,.3,-126,C.g); }); for(const [x,z] of [[62,-122],[64,-128],[35,-129]]) tree(C,x,z,1.25); bench(C,45,-121,0); bench(C,57,-121,0); for(const x of [38,50,62]) lamp(C,x,-118.4); }},
];
/* ---- a district is merged into a few big meshes (one per paint) once it is built, so it costs only a few draws ---- */
function bake(C){ const g=C.g; g.updateMatrixWorld(true); const bk=new Map(), gone=[]; g.traverse(o=>{ if(!o.isMesh||o.userData.keep||o.userData.own) return; const m=o.material; if(Array.isArray(m)||m.transparent) return; const a=o.geometry.attributes; if(!a.normal||!a.uv) return; if(!bk.has(m)) bk.set(m,[]); bk.get(m).push(o); gone.push(o); });
  bk.forEach((list,m)=>{ let vc=0, ic=0; const parts=list.map(o=>{ const q=o.geometry.clone(); q.applyMatrix4(o.matrixWorld); if(!q.index){ const n=q.attributes.position.count, ix=new Uint32Array(n); for(let i=0;i<n;i++) ix[i]=i; q.setIndex(new T.BufferAttribute(ix,1)); } vc+=q.attributes.position.count; ic+=q.index.count; return q; });
    const P=new Float32Array(vc*3), N=new Float32Array(vc*3), U=new Float32Array(vc*2), I=new Uint32Array(ic); let vo=0, io=0; parts.forEach(q=>{ P.set(q.attributes.position.array,vo*3); N.set(q.attributes.normal.array,vo*3); U.set(q.attributes.uv.array,vo*2); const ix=q.index.array; for(let i=0;i<ix.length;i++) I[io+i]=ix[i]+vo; vo+=q.attributes.position.count; io+=ix.length; q.dispose(); });
    const G=new T.BufferGeometry(); G.setAttribute("position",new T.BufferAttribute(P,3)); G.setAttribute("normal",new T.BufferAttribute(N,3)); G.setAttribute("uv",new T.BufferAttribute(U,2)); G.setIndex(new T.BufferAttribute(I,1)); G.computeBoundingSphere(); const M=new T.Mesh(G,m); M.matrixAutoUpdate=false; M.raycast=()=>{}; M.userData.keep=1; C.baked.push(M); });
  gone.forEach(o=>{ if(o.parent) o.parent.remove(o); o.geometry.dispose(); }); C.baked.forEach(M=>g.add(M)); }
const LIVE={};
function load(d){ const C={g:new T.Group(),picks:[],baked:[]}; C.g.userData.noMerge=1; d.build(C); bake(C); scene.add(C.g); LIVE[d.id]=C; try{ if(typeof WORLD!=="undefined") WORLD.warm=2; }catch(e){} }
function unload(id){ const C=LIVE[id]; if(!C) return; scene.remove(C.g); C.picks.forEach(m=>{ const i=pickables.indexOf(m); if(i>=0) pickables.splice(i,1); }); C.g.traverse(o=>{ if(o.isMesh){ o.geometry.dispose(); if(o.userData.own){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } } }); delete LIVE[id]; }
/* near enough to see through the haze: build; well out of sight: throw away. One district per look, so a step never builds two. */
/* deep in the town the temple is behind the haze: its big merged meshes are skipped until you come back within sight of them */
let hid=[]; function fogCull(px,pz){ try{ if(typeof MERGED==="undefined") return; if(pz>-58){ if(hid.length){ hid.forEach(M=>{ M.visible=true; }); hid=[]; } return; } const far=(scene.fog&&scene.fog.far||90)+8, cx=camera.position.x, cz=camera.position.z;
    for(const M of MERGED){ const bs=M.geometry.boundingSphere; if(!bs) continue; const out=Math.hypot(bs.center.x-cx,bs.center.z-cz)-bs.radius>far; if(out&&M.visible){ M.visible=false; hid.push(M); } else if(!out&&!M.visible&&hid.includes(M)){ M.visible=true; hid.splice(hid.indexOf(M),1); } } }catch(e){} }
let acc=0, greeted=false, wt=0;
TW.tick=dt=>{ wt+=dt; for(const id in LIVE){ const w=LIVE[id].water; if(w){ w.material.map.offset.x=wt*.02; } } acc+=dt; if(acc<.4) return; acc=0; if(typeof meAv==="undefined"||!meAv) return; const px=meAv.pos.x, pz=meAv.pos.y; TW.on=TW.in(px,pz); fogCull(px,pz);
  let built=false; for(const d of CH){ const dist=Math.hypot(px-d.c[0],pz-d.c[1])-d.r; if(!LIVE[d.id]){ if(dist<75&&!built){ load(d); built=true; } } else if(dist>105) unload(d.id); }
  if(TW.on&&!greeted&&pz<-56){ greeted=true; try{ toast("🏮 歡迎來到天后小鎮",2600); statInc("townIn"); }catch(e){} } if(!TW.on&&pz>-40) greeted=false; };
/* ---- things you can walk up to ---- */
const ST=[["tw:board",22.6,-61,Math.PI/2*-1,21.9,-61,1.2,2.2],["tw:bus",33.0,-64,Math.PI/2,34.2,-64,1.5,2.4],["tw:home",18.5,-105.6,0,18.5,-104.6,1.3,2.6],["tw:fish",28,-136.4,Math.PI,28,-137.6,1.8,1.2]]
  .concat(SHOPS_N.map(s=>[s[3],s[2]+4,-73.6,0,s[2]+4,-72.8,3.2,3.0]),BEDS.map((x,i)=>["tw:bed:"+i,x,-124.4,Math.PI,x,-126,1.5,.8]),
          HOUSE_X.slice(1).map((x,i)=>["tw:house:"+(i+1),x+3,-105.6,0,x+3,-104.6,1.3,2.6]),HOUSE_X.map((x,i)=>["tw:house:"+(i+8),x+3,-110.4,Math.PI,x+3,-111.4,1.3,2.6]));
setTimeout(()=>{ try{ ST.forEach(s=>{ station(s[0],[s[1],s[2]],s[3]); addHit(s[0],s[4],0,s[5],s[6],s[7]); }); }catch(e){ console.warn("town stations",e); } },1500);
function warp(x,z){ try{ if(meAv.seat>=0) meAv.seat=-1; }catch(e){} meAv.pos.set(x,z); meAv.target.set(x,z); meAv.path=[]; try{ pendingStation=null; }catch(e){} markDirty(); }
TW.station=k=>{ if(k.indexOf("tw:")!==0) return false;
  if(k==="tw:board"){ try{ DQ.open(); }catch(e){} return true; }
  if(k==="tw:home"){ try{ ROOMX.open(); }catch(e){} return true; }
  if(k==="tw:bus"){ openSheet("townBus","🚌 公車站",`<p class="lead">搭公車回天后宮，一下子就到廟埕。</p><div class="row"><button class="primary" data-act="twBus" data-v="temple">回天后宮廟埕</button><button class="secondary" data-act="twBus" data-v="inn">到禪房門口</button></div><p class="note">之後車站蓋好，這裡也會有去別的地方的車。</p>`); return true; }
  if(k==="tw:furn"){ openSheet("townFurn","🪑 家具行",`<p class="lead">家具行的家具，在你家的「家具」分頁裡就能買，買了直接擺。</p><div class="row"><button class="primary" data-act="roomOpen">回我的房間看家具</button></div>`); return true; }
  if(k==="tw:flower"){ toast("🌷 花店準備中：之後在這裡買種子，到河堤的社區花圃種",3200); return true; }
  if(k==="tw:tackle"){ toast("🎣 釣具行準備中：之後在這裡買釣竿和魚餌",3200); return true; }
  if(k==="tw:fish"){ toast("🎣 釣魚準備中：之後在這個碼頭就能釣魚",3000); return true; }
  if(k.indexOf("tw:bed:")===0){ toast("🌱 花圃準備中：之後每個人都能在這裡種自己的花",3000); return true; }
  if(k.indexOf("tw:house:")===0){ toast("🏠 這一戶還沒有人住。之後可以進去參觀別人的家",3000); return true; }
  if(k.indexOf("tw:soon:")===0){ toast(`${k.slice(8)}還在準備中`,2400); return true; }
  return true; };
HANDLERS.twBus=v=>{ closeSheet(); if(v==="inn") warp(28,INN.G); else { const c=[0,HZ+6]; warp(c[0],c[1]); } try{ toast(v==="inn"?"🚌 到禪房門口了":"🚌 回到天后宮了",2200); }catch(e){} };
TW.zrect=ZR; TW.live=()=>Object.keys(LIVE);
return TW; })();

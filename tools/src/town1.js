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
const ZR=[-8,182,-137.5,-50.5]; /* (out to the beach since 11/12) */
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
TW.walk=(x,z)=>{ for(const b of BLOCK) if(inR(b,x,z)) return false; for(const w of WALK) if(inR(w,x,z)) return true; return x>86&&NT.walk(x,z); };
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
 {id:"oldE2",c:[75,-77],r:20,build:C=>{ street(C,61,88,-81,-73,"x"); SHOPS_N.filter(s=>s[2]>=61).forEach(s=>bld(C,s[2],8,-73,8,-1,s[1],"shop",s[0])); SHOPS_S.filter(s=>s[2]>=61).forEach(s=>bld(C,s[2],8,-81,8,1,s[1],"shop",s[0],"#6a6a6e")); for(const x of [64,76,87]) lamp(C,x,-73.6); for(const x of [70,82]) lamp(C,x,-80.4); }},
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
/*<<NATURE*/
/* ================= 溪谷步道 and 望海沙灘 (11/12, the chair: "a brook and a coast, both in a soothing style").
   Two quiet places east of the old street. The trail leaves the end of the old street (x 88), runs up the west bank of a small
   brook to a waterfall lookout, crosses a little arched footbridge, and goes down through a meadow to a sandy beach where the
   brook runs out into a turquoise sea. Soft, rounded shapes and pastel colours: smooth rocks, hydrangeas, reeds, round trees,
   stone lanterns, fireflies at night; on the beach slow waves with foam, a parasol, shells, a lighthouse on the point and gulls.
   Everything is made in code (no pictures), built and thrown away with the other districts; the water is a few small shaders.
   ================= */
const NT={};
const sstep=(a,b,v)=>{ const t=Math.max(0,Math.min(1,(v-a)/(b-a))); return t*t*(3-2*t); };
const segD=(px,pz,ax,az,bx,bz)=>{ const dx=bx-ax, dz=bz-az, L=dx*dx+dz*dz||1; let t=((px-ax)*dx+(pz-az)*dz)/L; t=Math.max(0,Math.min(1,t)); const x=ax+dx*t-px, z=az+dz*t-pz; return [Math.sqrt(x*x+z*z),t]; };
const lineD=(P,x,z)=>{ let best=1e9, bi=0, bt=0; for(let i=0;i<P.length-1;i++){ const r=segD(x,z,P[i][0],P[i][1],P[i+1][0],P[i+1][1]); if(r[0]<best){ best=r[0]; bi=i; bt=r[1]; } } return [best,bi,bt]; };
const rng=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
/* the brook, smoothed into close points: from the pool under the waterfall, round the meadow, out east into the sea */
const BROOK=(()=>{ const c=new T.CatmullRomCurve3([[110,-55.6],[108.8,-60],[105,-66.5],[103.2,-73.5],[104.4,-80.5],[109.5,-87],[117,-91.8],[126,-94.6],[134,-96.2],[142,-97],[152,-97.6],[162,-98]].map(p=>new T.Vector3(p[0],0,p[1])),false,"centripetal");
  return c.getSpacedPoints(150).map(v=>[v.x,v.z]); })();
const BN=BROOK.length-1;
const brookW=(i,t)=>{ const k=(i+t)/BN; return k<.03?2.3:1.05+1.15*k+.3*Math.sin(k*11); }; /* half width: the pool, then wider downstream */
const TRAIL=[[87.4,-77],[95.5,-77],[99.4,-74.6],[100.2,-68],[101.2,-63.4]]; /* up the west bank to the waterfall lookout */
const TRAIL2=[[99.4,-76.4],[102,-76.4],[106.4,-76.4],[110.5,-77.4],[114.5,-78.6],[121,-82.4],[128.5,-86.4],[136.5,-88.4]]; /* over the bridge, through the meadow, down to the beach */
const MEADOW=[[101.4,-62.6,4.0],[114.6,-79.2,4.4],[124.8,-84.2,2.8]];
const shoreX=z=>160+2.6*Math.sin(z*.13)+1.6*Math.sin(z*.31+1.3); /* where the sand meets the sea (the sea shader has the same line) */
const BEACH=[135.5,-62.5,-127.5];
const BRIDGE=[101.2,106.8,-77.6,-75.2], MOUTHB=[141.5,147.5,-100.2,-94.2];
NT.block=[[149,-80,.35],[151,-90,.9],[166,-63,5.5]]; /* [x,z,r] solid things on the walkable ground: the parasol pole, the sand castle, the rocks of the point */
const inRect=(r,x,z)=>x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3];
NT.walk=(x,z)=>{ if(x<86||x>182||z>-52||z<-131) return false;
  if(inRect(BRIDGE,x,z)||inRect(MOUTHB,x,z)) return true;
  const b=lineD(BROOK,x,z); if(b[0]<brookW(b[1],b[2])+.45) return false;
  for(const r of NT.block) if(Math.hypot(x-r[0],z-r[1])<r[2]) return false;
  if(x>=BEACH[0]&&z<=BEACH[1]&&z>=BEACH[2]) return x<shoreX(z)-1.7;
  if(lineD(TRAIL,x,z)[0]<1.25||lineD(TRAIL2,x,z)[0]<1.25) return true;
  for(const m of MEADOW) if(Math.hypot(x-m[0],z-m[1])<m[2]) return true;
  return false; };
/* ---- shared bits: one set of uniforms (time, night) for all the water and the fireflies; paints made once ---- */
NT.U={uT:{value:0},uNight:{value:0}};
let NM=null; function nmat(){ if(NM) return NM; const S=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.92,metalness:0},o||{}));
  NM={ rock:["#a29eb2","#93a3aa","#ad9f8c","#8e9c92"].map(c=>S(c)), moss:S("#8fbf8a"), leaf:["#8fd19e","#a8dca0","#7cc49a"].map(c=>S(c)), pink:S("#ffc9da"), maple:S("#ffb48a"), trunk:S("#8a6a55"),
    hyd:["#9fb8ff","#c5a8f5","#ffb3d1","#b8e0ff"].map(c=>S(c,{roughness:.8})), bush:S("#6fb07c"), reed:S("#9cc77a"), flower:["#fff2a8","#ffd1e0","#ffffff","#d6c6ff","#ffcf9e"].map(c=>S(c,{roughness:.7})),
    wood:S("#b08a68"), woodD:S("#8f6b4f"), stone:S("#d6d2c8"), lamp:S("#fff1c4",{emissive:"#ffd88a",emissiveIntensity:.4}), pad:S("#7cc08a",{roughness:.7}), lotus:S("#ffd0e2",{roughness:.6}),
    sand:S("#e2cb9a"), white:S("#fbfaf6",{roughness:.6}), coral:S("#ff9f8f",{roughness:.7}), mint:S("#9fe0cf",{roughness:.7}), red:S("#e8706a",{roughness:.6}), shell:["#ffe4ea","#fff6e8","#f6d9c2"].map(c=>S(c,{roughness:.5})), star:S("#ffab6a",{roughness:.7}), drift:S("#c9b8a4"),
    glow:S("#fff4c8",{emissive:"#ffe08a",emissiveIntensity:1.2}) };
  return NM; }
const GEO={}; const gsph=()=>GEO.s||(GEO.s=new T.SphereGeometry(1,14,10)), gico=()=>GEO.i||(GEO.i=new T.IcosahedronGeometry(1,1)), gcone=()=>GEO.c||(GEO.c=new T.ConeGeometry(1,1,7));
function put(C,geo,m,x,y,z,sx,sy,sz,ry,rx,rz){ const o=new T.Mesh(geo,m); o.position.set(x,y,z); o.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz); o.rotation.set(rx||0,ry||0,rz||0); C.g.add(o); return o; }
const rock=(C,r,x,y,z,s,k)=>put(C,gico(),NM.rock[(k==null?(r()*4|0):k)%4],x,y,z,s*(.9+r()*.5),s*(.55+r()*.35),s*(.9+r()*.5),r()*6.28,(r()-.5)*.4,(r()-.5)*.4);
function softTree(C,r,x,z,s,kind){ const h=1.5*s; put(C,gsph(),NM.trunk,x,h/2,z,.13*s,h/2,.13*s); const m=kind==="pink"?NM.pink:kind==="maple"?NM.maple:NM.leaf[r()*3|0];
  for(const [dx,dy,dz,rr] of [[0,1.9,0,1.05],[.55,1.55,.25,.72],[-.5,1.6,-.25,.75],[.1,2.45,-.1,.7]]) put(C,gsph(),m,x+dx*s,dy*s,z+dz*s,rr*s); }
function hydrangea(C,r,x,z){ put(C,gsph(),NM.bush,x,.35,z,.55,.4,.55); const m=NM.hyd[r()*4|0]; for(let k=0;k<5;k++){ const a=r()*6.28, d=.25+r()*.25; put(C,gsph(),m,x+Math.cos(a)*d,.5+r()*.25,z+Math.sin(a)*d,.2+r()*.08); } }
function reeds(C,r,x,z){ for(let k=0;k<6;k++){ const a=r()*6.28, d=r()*.35, h=.8+r()*.7; put(C,gcone(),NM.reed,x+Math.cos(a)*d,h/2,z+Math.sin(a)*d,.04,h,.04,0,(r()-.5)*.25,(r()-.5)*.25); } }
function flowers(C,r,cx,cz,rad,n){ for(let k=0;k<n;k++){ const a=r()*6.28, d=Math.sqrt(r())*rad, x=cx+Math.cos(a)*d, z=cz+Math.sin(a)*d; put(C,gsph(),NM.flower[r()*5|0],x,.12,z,.07+r()*.04); } }
function lantern(C,x,z){ put(C,GEO.b||(GEO.b=new T.BoxGeometry(1,1,1)),NM.stone,x,.3,z,.36,.6,.36); put(C,GEO.b,NM.stone,x,.68,z,.18,.2,.18); const L=put(C,GEO.b,NM.lamp,x,.92,z,.3,.28,.3); L.userData.keep=1; put(C,gcone(),NM.stone,x,1.2,z,.36,.3,.36,Math.PI/4); }
function nbench(C,x,z,ry){ const g=new T.Group(); g.position.set(x,0,z); g.rotation.y=ry||0; C.g.add(g); const B=GEO.b||(GEO.b=new T.BoxGeometry(1,1,1)); const p=(m,sx,sy,sz,px,py,pz)=>{ const o=new T.Mesh(B,m); o.scale.set(sx,sy,sz); o.position.set(px,py,pz); g.add(o); };
  p(NM.wood,1.6,.08,.45,0,.45,0); p(NM.wood,1.6,.32,.06,0,.75,-.2); for(const s of [-.65,.65]){ p(NM.woodD,.08,.45,.4,s,.22,0); } }
/* ---- the ground: a gentle valley (flat where you walk, hills round it, a cliff behind the waterfall), painted by vertex colours ---- */
const nz=(x,z)=>Math.sin(x*.21+z*.13)*Math.cos(z*.17-x*.07)+.5*Math.sin(x*.47-z*.39);
const walkGap=(x,z)=>{ let d=Math.min(lineD(TRAIL,x,z)[0]-1.25,lineD(TRAIL2,x,z)[0]-1.25); for(const m of MEADOW) d=Math.min(d,Math.hypot(x-m[0],z-m[1])-m[2]); return Math.max(0,d); };
function valleyH(x,z){ const w=walkGap(x,z); let h=sstep(1.2,9,w)*(1.7+1.2*nz(x,z)); h+=sstep(-59,-52.5,z)*sstep(14,4,Math.abs(x-110))*6.5; /* the cliff the waterfall drops from */
  h*=sstep(134.5,127,x)*sstep(86.5,90,x); const b=lineD(BROOK,x,z), hw=brookW(b[1],b[2]), k=sstep(hw-.3,hw+1.3,b[0]); return -.55*(1-k)+h*k; }
function terrain(C,x0,x1,z0,z1,hf,cf,y0){ const nx=Math.round(x1-x0), nzc=Math.round(z1-z0), g=new T.PlaneGeometry(x1-x0,z1-z0,nx,nzc); g.rotateX(-Math.PI/2); g.translate((x0+x1)/2,0,(z0+z1)/2);
  const P=g.attributes.position, col=new Float32Array(P.count*3), c=new T.Color(); for(let i=0;i<P.count;i++){ const x=P.getX(i), z=P.getZ(i), h=hf(x,z); P.setY(i,h+(y0||0)); cf(x,z,h,c); col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; }
  g.setAttribute("color",new T.BufferAttribute(col,3)); g.computeVertexNormals(); const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true})); m.userData.keep=1; m.userData.floor=1; m.userData.own=1; C.g.add(m); pickables.push(m); C.picks.push(m); return m; }
const CL=s=>new T.Color(s).convertSRGBToLinear();
const VC={g1:CL("#86c96c"),g2:CL("#62b060"),moss:CL("#4f9a80"),path:CL("#d8c49a"),cliff:CL("#84a093"),sand:CL("#e6cf9e"),wet:CL("#c4a878"),dune:CL("#9cc97c")}; /* (deeper than they look: the bright daylight washes pale colours out to white) */
function valleyC(x,z,h,c){ const n=.5+.5*nz(x*1.7,z*1.7); c.copy(VC.g1).lerp(VC.g2,n*.7); const b=lineD(BROOK,x,z); c.lerp(VC.moss,sstep(brookW(b[1],b[2])+2.2,brookW(b[1],b[2]),b[0])*.75);
  c.lerp(VC.cliff,sstep(2.6,5.5,h)*.6); const t=Math.min(lineD(TRAIL,x,z)[0],lineD(TRAIL2,x,z)[0]); c.lerp(VC.path,sstep(1.25,.75,t)); }
function beachH(x,z){ const s=shoreX(z), h=-.75*sstep(s-2.2,s+5,x)+sstep(138,135.2,x)*.25+(sstep(-60,-46,z)*4.5+sstep(-127,-138,z)*3.5)*sstep(s+2,s-6,x), b=lineD(BROOK,x,z), hw=brookW(b[1],b[2]), k=sstep(hw-.3,hw+1.3,b[0]); return Math.min(h,-.55*(1-k)+h*k); } /* (dunes close the beach at both ends) */
function beachC(x,z,h,c){ const s=shoreX(z); c.copy(VC.sand).lerp(VC.wet,sstep(s-5,s-1.2,x)*.85); c.lerp(VC.dune,sstep(138.5,135.6,x)*.8); }
/* ---- water ---- */
const FOGV="#include <fog_pars_vertex>\n", FOGF="#include <fog_pars_fragment>\n";
function wmat(vs,fs,o){ return new T.ShaderMaterial(Object.assign({uniforms:Object.assign(T.UniformsUtils.merge([T.UniformsLib.fog]),NT.U),vertexShader:FOGV+vs,fragmentShader:FOGF+fs,transparent:true,depthWrite:false,fog:true},o||{})); }
function brookMesh(C){ const n=BROOK.length, P=new Float32Array(n*2*3), UV=new Float32Array(n*2*2), I=[]; let along=0;
  for(let i=0;i<n;i++){ const a=BROOK[Math.max(0,i-1)], b=BROOK[Math.min(n-1,i+1)], dx=b[0]-a[0], dz=b[1]-a[1], L=Math.hypot(dx,dz)||1, px=-dz/L, pz=dx/L, hw=brookW(Math.min(BN-1,i),0)+.25, x=BROOK[i][0], z=BROOK[i][1];
    if(i) along+=Math.hypot(x-BROOK[i-1][0],z-BROOK[i-1][1]); const y=-.1;
    P.set([x+px*hw,y,z+pz*hw,x-px*hw,y,z-pz*hw],i*6); UV.set([0,along,1,along],i*4); if(i<n-1){ const k=i*2; I.push(k,k+1,k+2,k+1,k+3,k+2); } }
  const g=new T.BufferGeometry(); g.setAttribute("position",new T.BufferAttribute(P,3)); g.setAttribute("uv",new T.BufferAttribute(UV,2)); g.setIndex(I); g.computeBoundingSphere();
  const m=new T.Mesh(g,wmat(`uniform float uT; varying vec2 vUv; varying vec3 vW; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vec4 mvPosition=viewMatrix*w; gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}`,
    `uniform float uT; uniform float uNight; varying vec2 vUv; varying vec3 vW; void main(){ float e=abs(vUv.x-.5)*2.; float f=vUv.y*.9-uT*1.1;
      float st=sin(f*3.1+sin(vUv.x*9.+vUv.y*.7)*1.3)*.5+.5; st=smoothstep(.72,1.,st)*(1.-e*.6);
      vec3 c=mix(vec3(.38,.76,.80),vec3(.62,.90,.88),e*e); c+=st*.22; float foam=smoothstep(.72,1.,e)*(.55+.45*sin(vUv.y*2.3-uT*2.6+vUv.x*5.)); c=mix(c,vec3(.97,.99,1.),foam*.65);
      float sp=pow(max(0.,sin(vW.x*3.1+uT*2.3)*sin(vW.z*2.7-uT*1.9)),30.)*(1.-uNight); c+=sp*.7; c*=mix(1.,.38,uNight);
      gl_FragColor=vec4(c,.86-e*.12);\n#include <fog_fragment>\n}`));
  m.material.side=T.DoubleSide; m.renderOrder=2; m.userData.keep=1; m.userData.own=1; m.raycast=()=>{}; C.g.add(m); }
function waterfall(C){ const g=new T.PlaneGeometry(2.4,6.4,1,8); const m=new T.Mesh(g,wmat(`varying vec2 vUv; void main(){ vUv=uv; vec4 mvPosition=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}`,
    `uniform float uT; uniform float uNight; varying vec2 vUv; void main(){ float e=abs(vUv.x-.5)*2.; float s=sin((vUv.y*7.+uT*3.2)+sin(vUv.x*17.)*1.8)*.5+.5; vec3 c=mix(vec3(.72,.92,.95),vec3(1.),smoothstep(.45,1.,s)*.8); c*=mix(1.,.4,uNight);
      gl_FragColor=vec4(c,(.78-e*e*.6)*smoothstep(0.,.08,vUv.y));\n#include <fog_fragment>\n}`,{side:T.DoubleSide}));
  m.position.set(110,3.05,-53.6); m.rotation.x=-.12; m.userData.keep=1; m.userData.own=1; m.raycast=()=>{}; C.g.add(m);
  const pg=new T.CircleGeometry(2.3,28); pg.rotateX(-Math.PI/2); const pool=new T.Mesh(pg,wmat(`varying vec3 vL; void main(){ vL=position; vec4 mvPosition=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}`,
    `uniform float uT; uniform float uNight; varying vec3 vL; void main(){ float r=length(vL.xz); float ring=smoothstep(.15,0.,abs(fract(r*.9-uT*.6)-.5)-.3)*(1.-r/2.3); vec3 c=vec3(.97,.99,1.)*mix(1.,.4,uNight); gl_FragColor=vec4(c,ring*.5+smoothstep(1.2,0.,r)*.35);\n#include <fog_fragment>\n}`));
  pool.position.set(110,-.06,-55.4); pool.renderOrder=3; pool.userData.keep=1; pool.userData.own=1; pool.raycast=()=>{}; C.g.add(pool); }
function sea(C){ const g=new T.PlaneGeometry(240,220,48,40); g.rotateX(-Math.PI/2); g.translate(270,0,-95);
  const m=new T.Mesh(g,wmat(`uniform float uT; varying vec3 vW; float sx(float z){ return 160.+2.6*sin(z*.13)+1.6*sin(z*.31+1.3); } void main(){ vec4 w=modelMatrix*vec4(position,1.); float d=w.x-sx(w.z);
      w.y+=-.18+(sin(w.x*.16+uT*.8)*.13+sin(w.z*.21-uT*.62+w.x*.05)*.1)*smoothstep(2.,14.,d); vW=w.xyz; vec4 mvPosition=viewMatrix*w; gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}`,
    `uniform float uT; uniform float uNight; varying vec3 vW; float sx(float z){ return 160.+2.6*sin(z*.13)+1.6*sin(z*.31+1.3); } void main(){ float d=vW.x-sx(vW.z);
      vec3 sh=vec3(.62,.92,.86), mi=vec3(.36,.78,.84), de=vec3(.24,.55,.78); vec3 c=mix(sh,mi,smoothstep(0.,12.,d)); c=mix(c,de,smoothstep(12.,70.,d));
      float sw=1.2+1.4*sin(uT*.55+vW.z*.04); float foam=smoothstep(sw+.9,sw,d)*smoothstep(-1.2,-.3,d)*(.65+.35*sin(vW.z*1.1+uT*1.8));
      float lines=smoothstep(.08,0.,abs(fract(d*.07-uT*.045)-.5)-.42)*smoothstep(32.,4.,d)*.4;
      float sp=pow(max(0.,sin(vW.x*1.9+uT*1.5)*sin(vW.z*2.3-uT*1.2)),28.)*(1.-uNight)*smoothstep(3.,20.,d);
      c=mix(c,vec3(.98,1.,1.),clamp(foam+lines,0.,1.)); c+=sp*.8; c*=mix(1.,.34,uNight); gl_FragColor=vec4(c,.9*smoothstep(-1.4,.4,d));\n#include <fog_fragment>\n}`));
  m.renderOrder=2; m.userData.keep=1; m.userData.own=1; m.raycast=()=>{}; C.g.add(m); }
function fireflies(C,n,cx,cz,rad,seed){ const r=rng(seed), P=new Float32Array(n*3), PH=new Float32Array(n); for(let i=0;i<n;i++){ const a=r()*6.28, d=Math.sqrt(r())*rad; P.set([cx+Math.cos(a)*d,.5+r()*1.8,cz+Math.sin(a)*d],i*3); PH[i]=r()*100; }
  const g=new T.BufferGeometry(); g.setAttribute("position",new T.BufferAttribute(P,3)); g.setAttribute("ph",new T.BufferAttribute(PH,1)); g.computeBoundingSphere();
  const m=new T.Points(g,new T.ShaderMaterial({uniforms:NT.U,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:`uniform float uT; attribute float ph; varying float vA; void main(){ vec3 p=position+vec3(sin(uT*.31+ph)*.9,sin(uT*.53+ph*1.7)*.35,cos(uT*.27+ph*.6)*.9); vec4 mv=modelViewMatrix*vec4(p,1.); vA=.5+.5*sin(uT*2.2+ph*3.); gl_PointSize=clamp(90./-mv.z,2.,14.); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`uniform float uNight; varying float vA; void main(){ float r=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,r)*vA*smoothstep(.25,.6,uNight); gl_FragColor=vec4(vec3(.85,1.,.55)*a,a); }`}));
  m.userData.keep=1; m.userData.own=1; m.raycast=()=>{}; C.g.add(m); }
/* the temple's big lawn (300 m square, y −0.02) reaches out here and would lie over the brook bed and the shallows: it is not drawn inside this rectangle */
function lawnHole(){ try{ const m=outsideGround.material; if(m.userData.hole) return; m.userData.hole=1; m.onBeforeCompile=sh=>{ sh.vertexShader="varying vec3 vHW;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\n vHW=(modelMatrix*vec4(position,1.)).xyz;");
      sh.fragmentShader="varying vec3 vHW;\n"+sh.fragmentShader.replace("#include <clipping_planes_fragment>","#include <clipping_planes_fragment>\n if(vHW.x>86.5&&vHW.z<-50.&&vHW.z>-140.) discard;"); }; m.customProgramCacheKey=()=>"lawnhole"; m.needsUpdate=true; }catch(e){} }
/* ---- the districts ---- */
const NCH=[
 {id:"brook",c:[110,-78],r:30,build:C=>{ nmat(); lawnHole(); const r=rng(11);
   terrain(C,86.5,135,-120,-50,valleyH,valleyC); brookMesh(C); waterfall(C);
   /* the cliff and the rocks round the pool */ for(let k=0;k<26;k++){ const a=Math.PI*(.05+.9*r()), d=2.6+r()*2.4, x=110+Math.cos(a)*d*1.3, z=-54.6+Math.sin(a)*d*.5+(r()-.2)*1.4; if(Math.abs(x-110)<1.5&&z>-55) continue; rock(C,r,x,valleyH(x,z)+.2,z,.7+r()*1.1); }
   for(let k=0;k<7;k++) rock(C,r,107.6+r()*4.8,4.6+r()*2.2,-52.3-r()*.8,1.0+r()*.8); for(const [x,z] of [[106,-50.8],[114.5,-51.2],[103,-52],[117.5,-52.6]]) softTree(C,r,x,z,1.3,r()<.4?"pink":"");
   /* stones along both banks, reeds and lily pads */ for(let i=4;i<BN-30;i+=3){ const p=BROOK[i], q=BROOK[i+1], dx=q[0]-p[0], dz=q[1]-p[1], L=Math.hypot(dx,dz)||1, hw=brookW(i,0);
     for(const s of [-1,1]){ if(inRect([100.8,107.2,-78,-75],p[0],p[1])) continue; const d=hw+.25+r()*.5, x=p[0]-dz/L*d*s, z=p[1]+dx/L*d*s; if(r()<.7) rock(C,r,x,-.05,z,.25+r()*.4); if(r()<.35){ const d2=hw+.9+r()*.6; reeds(C,r,p[0]-dz/L*d2*s,p[1]+dx/L*d2*s); } }
     if(r()<.22){ const o=(r()-.5)*hw, x=p[0]-dz/L*o, z=p[1]+dx/L*o; const pad=put(C,GEO.pad||(GEO.pad=new T.CircleGeometry(1,12).rotateX(-Math.PI/2)),NM.pad,x,-.07,z,.32+r()*.18); pad.userData.keep=1; if(r()<.35) put(C,gsph(),NM.lotus,x+.1,0,z,.12,.08,.12); } }
   /* stepping stones below the meadow */ { const i=66, p=BROOK[i], q=BROOK[i+1], dx=q[0]-p[0], dz=q[1]-p[1], L=Math.hypot(dx,dz)||1; for(let k=0;k<5;k++){ const o=(k-2)*.62; put(C,gico(),NM.rock[1],p[0]-dz/L*o,-.02,p[1]+dx/L*o,.3,.12,.3,k); } }
   /* the footbridge: planks on a low arch, rails */ for(let k=0;k<=12;k++){ const t=k/12, x=101.2+t*5.6, y=.08+.32*Math.sin(Math.PI*t); put(C,GEO.b||(GEO.b=new T.BoxGeometry(1,1,1)),NM.wood,x,y,-76.4,.42,.07,2.1); }
   for(const z of [-77.42,-75.38]){ for(let k=0;k<=6;k++){ const t=k/6, x=101.3+t*5.4; put(C,GEO.b,NM.woodD,x,.45+.32*Math.sin(Math.PI*t),z,.07,.75,.07); } for(let k=0;k<6;k++){ const t=(k+.5)/6, x=101.3+t*5.4; put(C,GEO.b,NM.wood,x,.82+.32*Math.sin(Math.PI*t),z,.95,.06,.08,0,0,Math.cos(Math.PI*t)*-.3); } }
   /* plants, trees, flowers */ for(let k=0;k<70;k++){ const x=88+r()*46, z=-103+r()*50; if(NT.walk(x,z)) continue; const b=lineD(BROOK,x,z); if(b[0]<brookW(b[1],b[2])+.8) continue; const w=walkGap(x,z); const h=valleyH(x,z);
     if(w<2.2&&r()<.55) hydrangea(C,r,x,z+0); else if(w>3&&r()<.5) softTree(C,r,x,valleyH(x,z)>0?z:z,1.0+r()*.5,r()<.3?"pink":r()<.25?"maple":""); }
   for(const m of MEADOW) flowers(C,r,m[0],m[1],m[2]+1.2,40); for(let k=0;k<60;k++){ const x=88+r()*46, z=-103+r()*50; if(walkGap(x,z)>1.5&&valleyH(x,z)<1.2&&!NT.walk(x,z)) put(C,gsph(),NM.flower[r()*5|0],x,valleyH(x,z)+.1,z,.08); }
   /* lanterns, benches, signs */ for(const [x,z] of [[93,-78.6],[99,-71],[101.5,-66],[109.6,-79],[118,-81.6],[126,-86.6],[132.5,-88.8]]) lantern(C,x,z);
   nbench(C,101.4,-60.2,Math.PI); nbench(C,114.6,-82.4,0); nbench(C,117.4,-76.6,Math.PI*.9);
   sign(C,"溪谷步道",1.6,.42,92,1.5,-75.55,0,"#7fb89a","#ffffff"); for(const dx of [-.6,.6]) cyl(.04,.04,1.5,mat("#8f6b4f"),92+dx,.75,-75.55,C.g,6);
   sign(C,"→ 望海沙灘",1.6,.38,131,1.3,-87.2,0,"#7fb6d6","#ffffff"); cyl(.04,.04,1.3,mat("#8f6b4f"),131,.65,-87.25,C.g,6);
   fireflies(C,70,112,-74,16,5); fireflies(C,30,104,-60,6,6); }},
 {id:"coast",c:[154,-94],r:34,build:C=>{ nmat(); lawnHole(); const r=rng(29);
   terrain(C,134.5,182,-140,-40,beachH,beachC,.012); sea(C);
   /* where the brook comes out: a little plank walk over it */ for(let k=0;k<=10;k++){ const x=141.6+k*.58; put(C,GEO.b||(GEO.b=new T.BoxGeometry(1,1,1)),NM.wood,x,.12,-97.2,.5,.07,2.4); } for(const z of [-98.5,-95.9]) put(C,GEO.b,NM.woodD,144.5,.42,z,6.2,.07,.07);
   /* the point to the north: rocks, the lighthouse, and a lookout deck with a bench */ for(let k=0;k<22;k++){ const x=163+r()*12, z=-60-r()*7; rock(C,r,x,-.3+r()*.6,z,.9+r()*1.4); }
   { const lx=169.5, lz=-62.5; rock(C,r,lx,0,lz,2.4,1); for(const [y,rr,m] of [[1.6,1.1,NM.white],[3.0,.98,NM.mint],[4.3,.88,NM.white],[5.5,.8,NM.mint]]) put(C,GEO.cy||(GEO.cy=new T.CylinderGeometry(1,1,1,16)),m,lx,y+.9,lz,rr,1.3,rr);
     const top=put(C,GEO.cy,NM.glow,lx,7.35,lz,.6,.7,.6); top.userData.keep=1; put(C,gcone(),NM.red,lx,8.1,lz,.95,.9,.95); }
   for(let k=0;k<=12;k++) put(C,GEO.b,NM.wood,139+k*.85,.1,-65.2,.8,.08,3.4); for(const z of [-66.8,-63.6]) put(C,GEO.b,NM.woodD,144.1,.6,z,10.6,.07,.07); nbench(C,144,-64.4,-Math.PI/2+Math.PI); 
   /* parasol and loungers, a sand castle, shells and starfish, driftwood, dune grass */
   { const px=149, pz=-80; put(C,GEO.cy||(GEO.cy=new T.CylinderGeometry(1,1,1,16)),NM.white,px,1.2,pz,.05,2.4,.05); for(let k=0;k<8;k++){ const s=put(C,GEO.wedge||(GEO.wedge=new T.ConeGeometry(1.7,.7,8,1,true,0,Math.PI/4)),k%2?NM.coral:NM.white,px,2.45,pz,1,1,1,k*Math.PI/4); s.material.side=T.DoubleSide; } 
     for(const dx of [-1,1]){ const g=new T.Group(); g.position.set(px+dx*1.2,0,pz-1.4); C.g.add(g); const L=new T.Mesh(GEO.b,NM.mint); L.scale.set(.7,.08,1.7); L.position.y=.3; g.add(L); const Bk=new T.Mesh(GEO.b,NM.mint); Bk.scale.set(.7,.08,.7); Bk.position.set(0,.55,.95); Bk.rotation.x=-.9; g.add(Bk); for(const sx of [-.3,.3]) for(const sz of [-.7,.7]){ const f=new T.Mesh(GEO.b,NM.white); f.scale.set(.05,.3,.05); f.position.set(sx,.15,sz); g.add(f); } } }
   { const cx=151, cz=-90; for(const [dx,dz,h] of [[0,0,.7],[.55,.3,.45],[-.5,.35,.5],[.1,-.5,.42]]){ put(C,GEO.cy,NM.sand,cx+dx,h/2,cz+dz,.26,h,.26); put(C,gcone(),NM.sand,cx+dx,h+.14,cz+dz,.3,.28,.3); } put(C,GEO.b,NM.coral,cx,1.15,cz,.02,.3,.02); }
   for(let k=0;k<26;k++){ const z=-64-r()*62, x=shoreX(z)-2.5-r()*8; if(!NT.walk(x,z)&&r()<.5) continue; if(r()<.7) put(C,gsph(),NM.shell[r()*3|0],x,0,z,.1+r()*.06,.05,.1+r()*.06,r()*6);
     else { const st=put(C,GEO.star||(GEO.star=(()=>{ const s=new T.Shape(); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2+Math.PI/2, rr=i%2?.42:1; s[i?"lineTo":"moveTo"](Math.cos(a)*rr,Math.sin(a)*rr); } const g=new T.ShapeGeometry(s); g.rotateX(-Math.PI/2); return g; })()),NM.star,x,.03,z,.16,1,.16,r()*6); st.userData.keep=1; } }
   for(const [x,z,ry] of [[141,-110,.4],[155,-119,-.6]]){ put(C,GEO.cy,NM.drift,x,.16,z,.16,2.6,.16,ry,0,Math.PI/2); }
   for(let k=0;k<40;k++){ const z=-60-r()*68, x=135.4+r()*3; for(let j=0;j<4;j++) put(C,gcone(),NM.reed,x+(r()-.5)*.4,.3,z+(r()-.5)*.4,.035,.6+r()*.3,.035,0,(r()-.5)*.4,(r()-.5)*.4); }
   for(const [x,z] of [[135.5,-70],[136,-104],[135.2,-120]]) softTree(C,r,x,z,1.2,"");
   sign(C,"望海沙灘",1.6,.42,138.4,1.5,-87.1,-Math.PI/2,"#7fb6d6","#ffffff"); cyl(.04,.04,1.5,mat("#8f6b4f"),138.45,.75,-87.1,C.g,6);
   /* gulls: three little white Vs circling over the water */ C.gulls=[]; for(let k=0;k<3;k++){ const g=new T.Group(); for(const s of [-1,1]){ const w=new T.Mesh(GEO.b,NM.white); w.scale.set(.55,.03,.14); w.position.x=s*.26; w.rotation.z=s*.35; g.add(w); } g.userData.keep=1; g.traverse(o=>o.userData.keep=1); C.g.add(g); C.gulls.push({g,ph:k*2.1,r:9+k*3,h:7+k}); }
   NT.coastBuilt=1; }},
];
/* ---- every frame: the shared clock, the lanterns at night, the gulls, and the sound of water when you are near ---- */
let NA=null;
NT.tick=(dt,LIVE)=>{ NT.U.uT.value+=dt; const night=typeof _dn!=="undefined"?_dn.night:0; NT.U.uNight.value=night; if(NM){ NM.lamp.emissiveIntensity=.35+night*1.6; NM.glow.emissiveIntensity=.9+night*2; }
  const C=LIVE.coast; if(C&&C.gulls) C.gulls.forEach(q=>{ const t=NT.U.uT.value*.25+q.ph; q.g.position.set(176+Math.cos(t)*q.r,q.h+Math.sin(t*2.3)*.4,-88+Math.sin(t)*q.r*1.4); q.g.rotation.y=-t; q.g.children.forEach((w,i)=>{ w.rotation.z=(i?1:-1)*(.35+Math.sin(NT.U.uT.value*5+q.ph)*.25); }); });
  sound(dt); };
function sound(dt){ try{ if(typeof meAv==="undefined"||!meAv) return; const px=meAv.pos.x, pz=meAv.pos.y; const near=px>80&&pz<-48;
    if(!near&&!NA) return; if(!NA){ if(typeof soundOn!=="undefined"&&!soundOn) return; const A=wxAudio(); if(!A) return; const a=A.a; const loop=()=>{ const s=a.createBufferSource(); s.buffer=A.b; s.loop=true; s.start(0,Math.random()*1.9); return s; };
      const bf=a.createBiquadFilter(); bf.type="bandpass"; bf.frequency.value=1700; bf.Q.value=.7; const bf2=a.createBiquadFilter(); bf2.type="highpass"; bf2.frequency.value=600; const bG=a.createGain(); bG.gain.value=0; loop().connect(bf).connect(bf2).connect(bG).connect(audioOut(a));
      const wf=a.createBiquadFilter(); wf.type="lowpass"; wf.frequency.value=520; wf.Q.value=.6; const wG=a.createGain(); wG.gain.value=0; loop().connect(wf).connect(wG).connect(audioOut(a)); NA={a,bG,wG,t:0}; }
    const a=NA.a, v=(typeof sVol==="function"?sVol():1)*((typeof soundOn!=="undefined"&&!soundOn)||document.hidden?0:1); NA.t+=dt;
    const b=lineD(BROOK,px,pz)[0], fall=Math.hypot(px-110,pz+55.5), kb=Math.max(1-sstep(3,24,b),(1-sstep(4,30,fall))*1.3), ks=1-sstep(6,48,Math.abs(shoreX(pz)-px)+Math.max(0,pz+60)*1.5+Math.max(0,-128-pz)*1.5);
    const swell=.55+.45*Math.sin(NA.t*.82)*Math.sin(NA.t*.31+1);
    NA.bG.gain.setTargetAtTime(v*.16*kb*(.85+.15*Math.sin(NA.t*3.1)),a.currentTime,.25); NA.wG.gain.setTargetAtTime(v*.5*ks*swell,a.currentTime,.3); }catch(e){} }
/*NATURE>>*/
CH.push(...NCH);
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
TW.tick=dt=>{ try{ NT.tick(dt,LIVE); }catch(e){} wt+=dt; for(const id in LIVE){ const w=LIVE[id].water; if(w){ w.material.map.offset.x=wt*.02; } } acc+=dt; if(acc<.4) return; acc=0; if(typeof meAv==="undefined"||!meAv) return; const px=meAv.pos.x, pz=meAv.pos.y; TW.on=TW.in(px,pz); fogCull(px,pz);
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

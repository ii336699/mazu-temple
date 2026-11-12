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
const ZR=[-8,182,-258,-50.5]; /* (south over the river to the mountain since 11/13) */ /* (out to the beach since 11/12) */
/* where you can walk: streets, the square, the park, the pier — minus the solid things standing on them */
const WALK=[[22.8,33.2,-131,-51.6],[33.2,88,-81,-73],[33.2,60,-100,-90],[-8,66,-111,-105],[-8,66,-131,-117],[26.2,29.8,-137.5,-130.5],[4,22.8,-90,-84],[57.4,66.6,-73,-66.2],[59.9,63.1,-143.8,-131]]; /* (+ the west alley and the fountain square, 11/13) */
/* (the old street runs east only: west of the main street stands the great 媽祖 statue, 42 m tall, at x 0, z −65) */
const SHOPS_N=[["家具行","#c96a3a",34.5,"tw:furn"],["花店","#5f9a6a",43.5,"tw:flower"],["釣具行","#3f7fa8",52.5,"tw:tackle"],["早餐店","#e2a23a",61.5,"tw:soon:早餐店"],["飲料店","#d9628a",70.5,"tw:soon:飲料店"],["書店","#7a6aa8",79.5,"tw:soon:書店"]];
const SHOPS_S=[["理髮廳","#4a8fb0",34.5],["五金行","#8a6a4a",43.5],["中藥行","#7a4a3a",52.5],["雜貨店","#b0863a",61.5],["照相館","#6a7a8a",70.5],["鐘錶行","#5a6a5a",79.5]];
const HOUSE_X=[15.5,8.5,1.5,-5.5,34.5,41.5,48.5,55.5], HCOL=["#e8dcc8","#d9c7b0","#c9d6cf","#e3cfc4","#d2d6e0","#e6dfb8","#d8c4c4","#cfe0d0"];
const STALLS=[38,44,50,56], BEDS=[38,42,46,50,54,58];
const BLOCK=[[23.1,24.1,-58.5,-57.5],[31.9,32.9,-58.5,-57.5],[60.2,63.8,-71.3,-67.7],[38.2,39,-123.4,-122.6],[45,45.8,-123.4,-122.6]].concat(STALLS.map(x=>[x-1.5,x+1.5,-99.6,-97.4]),[[10.2,10.8,-125.8,-125.2],[13.2,13.8,-125.8,-125.2],[10.2,10.8,-122.8,-122.2],[13.2,13.8,-122.8,-122.2]]);
const inR=(r,x,z)=>x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3];
TW.in=(x,z)=>z<-50.5;
TW.walk=(x,z)=>{ for(const b of BLOCK) if(inR(b,x,z)) return false; for(const w of WALK) if(inR(w,x,z)) return true; if(z<-143.6) return SW.walk(x,z); return x>86&&NT.walk(x,z); };
TW.ground=(x,z)=>z<-143.6?southH(x,z):null;
/* the camera may not go inside a building, into the mountain or the valley hills (it was slipping into roofs) */
let CAMBOX=null; const camBoxes=()=>CAMBOX||(CAMBOX=TOWNB.filter(b=>!b.deco).map(b=>{ const d=b.d||7, H=(b.fl||2)*3.05+3; let x0,x1,z0,z1; if(b.axis==="x"){ x0=b.c-b.w/2; x1=b.c+b.w/2; if(Math.abs(b.ry)<.1){ z0=b.f-d; z1=b.f; } else { z0=b.f; z1=b.f+d; } } else { z0=b.c-b.w/2; z1=b.c+b.w/2; if(b.ry>0){ x0=b.f-d; x1=b.f; } else { x0=b.f; x1=b.f+d; } } return [x0-.35,x1+.35,z0-.35,z1+.35,H]; }));
TW.camOK=(x,y,z)=>{ if(y<.35) return false; for(const B of camBoxes()) if(x>B[0]&&x<B[1]&&z>B[2]&&z<B[3]&&y<B[4]) return false;
  if(z<-143.6) return y>southH(x,z)+.6; if(x>86.5&&x<134.5&&z<-50&&z>-120) return y>valleyH(x,z)+.6; if(x>134.5&&z<-40) return y>beachH(x,z)+.5; return y<40; };
/* ---- finding the way: straight if nothing is in between, otherwise along a one-metre grid (A*) and then straightened ---- */
const clear=(ax,az,bx,bz)=>{ const d=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.ceil(d/.4)); for(let i=1;i<=n;i++){ const t=i/n; if(!TW.walk(ax+(bx-ax)*t,az+(bz-az)*t)) return false; } return true; };
let GRID=null; const GX0=ZR[0]-1, GZ0=ZR[2]-1, GNX=Math.ceil(ZR[1]-ZR[0])+2, GNZ=Math.ceil(ZR[3]-ZR[2])+2;
function grid(){ if(GRID) return GRID; GRID=new Uint8Array(GNX*GNZ); for(let j=0;j<GNZ;j++) for(let i=0;i<GNX;i++) GRID[j*GNX+i]=TW.walk(GX0+i+.5,GZ0+j+.5)?1:0; return GRID; }
function tpath(fx,fz,tx,tz){ if(clear(fx,fz,tx,tz)) return [[tx,tz]]; const g=grid(), ci=x=>Math.max(0,Math.min(GNX-1,Math.floor(x-GX0))), cj=z=>Math.max(0,Math.min(GNZ-1,Math.floor(z-GZ0)));
  const near=(i,j)=>{ if(g[j*GNX+i]) return [i,j]; for(let r=1;r<6;r++) for(let dj=-r;dj<=r;dj++) for(let di=-r;di<=r;di++){ const a=i+di, b=j+dj; if(a>=0&&b>=0&&a<GNX&&b<GNZ&&g[b*GNX+a]) return [a,b]; } return null; };
  const s=near(ci(fx),cj(fz)), e=near(ci(tx),cj(tz)); if(!s||!e) return [[tx,tz]]; const S=s[1]*GNX+s[0], E=e[1]*GNX+e[0];
  const cost=new Float32Array(GNX*GNZ).fill(1e9), from=new Int32Array(GNX*GNZ).fill(-1), open=[S]; cost[S]=0; const hx=k=>Math.hypot(k%GNX-e[0],Math.floor(k/GNX)-e[1]); let guard=0;
  while(open.length&&guard++<60000){ let bi=0; for(let k=1;k<open.length;k++) if(cost[open[k]]+hx(open[k])<cost[open[bi]]+hx(open[bi])) bi=k; const c=open.splice(bi,1)[0]; if(c===E) break; const ci0=c%GNX, cj0=Math.floor(c/GNX);
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
const ROAD_A0=26.2, ROAD_A1=32; /* the main street's asphalt lines up with the old road past the temple (moved outside the balustrade 11/12) */
function street(C,x0,x1,z0,z1,along,a0,a1){ /* asphalt with a paved walk on each side; along "z" or "x" (a0..a1: where the asphalt runs, if not centred) */ if(along==="z"){ a0=a0??x0+1.8; a1=a1??x1-1.8; ground(C,"asphalt",a0,a1,z0,z1,.012,true); ground(C,"pave",x0,a0,z0,z1,.02,true,2); ground(C,"pave",a1,x1,z0,z1,.02,true,2); const y=mat("#f2c230",{roughness:.7}); for(let z=z0+1;z<z1-1;z+=4) box(.12,.012,2,y,(a0+a1)/2,.022,z+1,C.g); }
  else { ground(C,"asphalt",x0,x1,z0+1.4,z1-1.4,.012,true); ground(C,"pave",x0,x1,z0,z0+1.4,.02,true,2); ground(C,"pave",x0,x1,z1-1.4,z1,.02,true,2); } }
const krng=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
/* ================= 房子組件 (11/13, the chair: "buildings not all the same, heights can differ, mix a few parts; the street needs a soul").
   Every building is put together from parts chosen by a seed — walls in soft pastels or brick, a 騎樓 arcade or not, balconies,
   iron window grilles, air conditioners, flower boxes, a water tank and a rooftop shed, gable / hip / old tiled roofs with a round
   window or a chimney, shop fronts with awnings and signs (flat or the tall vertical kind) — so no two match and they are 1 to 4
   floors tall. Chunky and rounded in the spirit of Animal Crossing. A building stands with its front on the line it is given:
   ry 0 faces +z (the body goes back towards −z), ry π faces −z, −π/2 faces −x, π/2 faces +x. ================= */
const KP={ wall:["#f3e3c8","#e9d2b4","#f6d6cf","#d7e4d3","#d9e2ee","#f2e6a8","#e8cfe0","#cfe3e6","#f0d5b5","#e6dccb","#c9dcc2","#f4cdb8"],
  trim:["#ffffff","#f7f0e2","#efe3cf"], roof:["#d9624a","#4f7fb0","#5f9a6a","#8a5a9a","#c9853a","#6a7a8a","#3f6a8a","#b3473e","#e08a5a","#7a9a4a"],
  awn:["#e8706a","#5fa0d0","#7cc08a","#f2c230","#d9628a","#8a7ad0","#f08a4a","#4fb0a8"], door:["#7a5236","#4f7fb0","#b3473e","#5f8a5a","#8a5a9a","#c9853a"] };
const km=(c,o)=>mat(c,Object.assign({roughness:.85},o||{}));
const KM={}; const winM=k=>KM["w"+k]||(KM["w"+k]=new T.MeshStandardMaterial({color:"#41566b",roughness:.22,metalness:.1,emissive:new T.Color(k?"#ffd28a":"#ffe7b8"),emissiveIntensity:0}));
const KG={}; const kprism=()=>KG.pr||(KG.pr=(()=>{ const s=new T.Shape(); s.moveTo(-.5,0); s.lineTo(.5,0); s.lineTo(0,1); s.closePath(); const g=new T.ExtrudeGeometry(s,{depth:1,bevelEnabled:false}); g.translate(0,0,-.5); return g; })());
const khip=()=>KG.hip||(KG.hip=(()=>{ const g=new T.ConeGeometry(Math.SQRT1_2,1,4,1); g.rotateY(Math.PI/4); g.translate(0,.5,0); return g; })());
const kbox=()=>KG.b||(KG.b=new T.BoxGeometry(1,1,1)), kcyl=()=>KG.c||(KG.c=new T.CylinderGeometry(1,1,1,14)), ksph=()=>KG.s||(KG.s=new T.SphereGeometry(1,12,9));
function kp(g,geo,m,x,y,z,sx,sy,sz,ry,rx,rz){ const o=new T.Mesh(geo,m); o.position.set(x,y,z); o.scale.set(sx,sy,sz); if(ry||rx||rz) o.rotation.set(rx||0,ry||0,rz||0); g.add(o); return o; }
const KB=(g,sx,sy,sz,m,x,y,z,ry)=>kp(g,kbox(),m,x,y,z,sx,sy,sz,ry);
/* a painted sign in a building's own coordinates; vertical ones stack the characters top to bottom */
function ksign(g,text,w,h,x,y,z,ry,bg,fg,vert){ const W=vert?96:256, Hh=Math.round(W*h/w); const t=cvs(W,Hh,(c,Wd,Ht)=>{ c.fillStyle=bg; c.fillRect(0,0,Wd,Ht); c.strokeStyle="rgba(255,255,255,.75)"; c.lineWidth=5; c.strokeRect(5,5,Wd-10,Ht-10); c.fillStyle=fg; c.textAlign="center"; c.textBaseline="middle";
    if(vert){ const ch=[...text], fs=Math.min(Wd*.66,(Ht-16)/ch.length*.9); c.font=`900 ${fs}px ${DISPLAY_FONT}`; ch.forEach((k,i)=>c.fillText(k,Wd/2,8+(i+.5)*(Ht-16)/ch.length)); }
    else { let fs=Ht*.6; c.font=`900 ${fs}px ${DISPLAY_FONT}`; const tw=c.measureText(text).width; if(tw>Wd*.86){ fs*=Wd*.86/tw; c.font=`900 ${fs}px ${DISPLAY_FONT}`; } c.fillText(text,Wd/2,Ht/2+2); } });
  const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:t,roughness:.6,emissive:"#ffffff",emissiveMap:t,emissiveIntensity:.22})); m.position.set(x,y,z); m.rotation.y=ry||0; m.userData.keep=1; m.userData.own=1; g.add(m);
  if(vert){ const b=new T.Mesh(new T.PlaneGeometry(w,h),m.material); b.position.set(x,y,z); b.rotation.y=(ry||0)+Math.PI; b.userData.keep=1; g.add(b); } return m; }
function pot(g,x,z,s,r,y=0){ const m=km(["#c9744a","#e8dccb","#6a8aa0","#b85a4a"][r()*4|0]); kp(g,kcyl(),m,x,y+.18*s,z,.2*s,.36*s,.2*s); const f=km(["#5f9a6a","#4f8a5a","#7cb06a"][r()*3|0]); kp(g,ksph(),f,x,y+.5*s,z,.28*s,.26*s,.28*s); if(r()<.6) kp(g,ksph(),km(["#ff8fb0","#fff1a0","#ffffff","#c5a8f5","#ff9f6a"][r()*5|0]),x+.08*s,y+.68*s,z+.05*s,.09*s,.09*s,.09*s); }
/* the building */
function kbld(C,o){ const r=krng(o.seed||7), pick=a=>a[(r()*a.length)|0], g=new T.Group(); g.position.set(o.x,0,o.z); g.rotation.y=o.ry||0; C.g.add(g);
  const w=o.w, d=o.d||7, fl=o.fl||1+(r()*3|0), FH=3.05, H=fl*FH, shop=o.kind==="shop", col=o.col||pick(KP.wall), brick=o.brick??(r()<.18&&!o.col), wm=km(brick?"#c0705a":col), tm=km(o.trim||pick(KP.trim));
  const arc=o.arcade??(shop&&fl>1&&r()<.6), A=arc?1.8:0, roofK=o.roof||(fl>=3?pick(["flat","flat","hip"]):pick(["gable","gable","hip","tile","flat"])), rcol=o.rcol||pick(KP.roof), rm=km(rcol,{roughness:.7});
  const winK=r()<.5?1:0, grille=r()<.38, acs=r()<.6, bal=r()<.55, round=r()<.4;
  /* walls */ if(A){ KB(g,w,FH,d-A,wm,0,FH/2,-A-(d-A)/2); if(fl>1) KB(g,w,H-FH,d,wm,0,FH+(H-FH)/2,-d/2); KB(g,w,.2,A,tm,0,FH-.1,-A/2); const n=Math.max(2,Math.round(w/3.2)); for(let i=0;i<=n;i++) KB(g,.36,FH-.2,.36,tm,-w/2+.2+i*(w-.4)/n,(FH-.2)/2,-.2); KB(g,w,.03,A,km("#d8cfc0"),0,.015,-A/2); }
  else KB(g,w,H,d,wm,0,H/2,-d/2);
  if(brick) for(let f=0;f<fl;f++) KB(g,w+.02,.06,.02,km("#a85a46"),0,f*FH+.9,.01); /* (a hint of brick courses) */
  for(let f=1;f<fl;f++) KB(g,w+.1,.16,.12,tm,0,f*FH,.04); KB(g,.16,H,.16,tm,-w/2+.06,H/2,.06); KB(g,.16,H,.16,tm,w/2-.06,H/2,.06);
  /* ground floor */ const gz=-A;
  if(shop){ const ac=o.awn||pick(KP.awn); KB(g,w-.9,2.05,.08,winM(1),-.35,1.25,gz+.03); KB(g,w-.7,.12,.14,tm,-.35,2.32,gz+.06); const dx=w/2-.9; KB(g,1.0,2.25,.1,km(pick(KP.door)),dx,1.12,gz+.05);
    if(!A){ const n=Math.max(3,Math.round(w/.6)); for(let i=0;i<n;i++) kp(g,kbox(),km(i%2?"#ffffff":ac),-w/2+(i+.5)*w/n,2.62,gz+.6,w/n+.01,.06,1.25,0,.38); KB(g,w,.12,.06,km(ac),0,2.4,gz+1.18); }
    if(o.name){ ksign(g,o.name,Math.min(w-.8,4.6),.82,0,A?FH-.62:3.15,gz+.1+(A?.0:0),0,o.sbg||ac,"#ffffff"); if(fl>1&&(o.vsign??r()<.6)) ksign(g,o.name,.62,Math.min(2.6,fl*FH-3.6),w/2-.2,FH+Math.min(2.6,fl*FH-3.6)/2+.4,.45,Math.PI/2,o.sbg||ac,"#ffffff",true); }
    for(let k=0;k<2;k++) if(r()<.7) pot(g,-w/2+.45+k*.6,gz+.45,1,r); }
  else { const dx=(r()<.5?-1:1)*(w/2-1.3); KB(g,1.25,2.35,.12,tm,dx,1.17,gz+.05); KB(g,1.0,2.15,.14,km(pick(KP.door)),dx,1.08,gz+.06); kp(g,ksph(),km("#d9aa3d",{roughness:.4,metalness:.3}),dx+.32,1.05,gz+.15,.05,.05,.05);
    kp(g,kbox(),km(pick(KP.awn)),dx,2.55,gz+.38,1.6,.08,.8,0,.3); KB(g,1.4,.16,.6,km("#cfc6b6"),dx,.08,gz+.3); /* door, its little roof, a step */
    const wx=-dx*.55; KB(g,1.5,1.3,.1,tm,wx,1.55,gz+.04); KB(g,1.3,1.1,.12,winM(winK),wx,1.55,gz+.05); if(r()<.6) KB(g,1.5,.22,.32,km("#8a6246"),wx,.86,gz+.18); /* window, flower box */
    if(r()<.5){ KB(g,.36,.5,.22,km("#c94a3a"),dx+(dx>0?-1:1)*.95,1.1,gz+.16); } for(let k=0;k<3;k++) if(r()<.55) pot(g,wx-.6+k*.6,gz+.35,.9,r); }
  /* upper floors */ const bays=Math.max(1,Math.round(w/2.5));
  for(let f=1;f<fl;f++){ const y=f*FH+1.5, hasBal=bal&&(f===1||r()<.4);
    for(let b=0;b<bays;b++){ const x=-w/2+(b+.5)*w/bays, wk=r()<.25?1-winK:winK;
      if(round&&f===fl-1&&b===(bays>>1)&&roofK!=="flat"){ kp(g,kcyl(),tm,x,y,.03,.62,.1,.62,0,Math.PI/2); kp(g,kcyl(),winM(wk),x,y,.06,.5,.1,.5,0,Math.PI/2); continue; }
      KB(g,1.36,1.56,.1,tm,x,y,.03); KB(g,1.14,1.34,.12,winM(wk),x,y,.04); KB(g,.06,1.34,.14,tm,x,y,.05);
      if(grille&&!hasBal){ KB(g,1.3,1.5,.05,km("#7a8a8a",{roughness:.5,metalness:.4}),x,y,.36); for(let k=0;k<6;k++) KB(g,.03,1.5,.42,km("#7a8a8a",{roughness:.5,metalness:.4}),x-.55+k*.22,y,.18); }
      else if(r()<.45) KB(g,1.3,.2,.3,km("#8a6246"),x,y-.86,.15); /* flower box */
      if(acs&&r()<.5){ KB(g,.78,.5,.42,km("#eeeeea",{roughness:.6}),x+(r()<.5?-.25:.25),y-1.22,.22); kp(g,kcyl(),km("#9a9a9a"),x,y-1.22,.44,.16,.02,.16,0,Math.PI/2); } }
    if(hasBal){ KB(g,w-.5,.14,1.0,tm,0,f*FH+.07,.5); KB(g,w-.5,.06,.06,tm,0,f*FH+1.05,.98); const n=Math.round((w-.5)/.25); for(let k=0;k<=n;k++) KB(g,.04,.9,.04,tm,-w/2+.25+k*(w-.5)/n,f*FH+.55,.98);
      for(let k=0;k<2;k++) if(r()<.7) pot(g,-w/2+.7+r()*(w-1.4),.6,.85,r,f*FH+.14); if(r()<.4){ /* laundry */ KB(g,w-1,.02,.02,km("#9a9a9a"),0,f*FH+1.9,.9); for(let k=0;k<4;k++) KB(g,.36,.5,.02,km(pick(["#ffffff","#8fb8e8","#f2c230","#e8706a"])),-w/2+1+k*.6+r()*.2,f*FH+1.6,.9); } } }
  /* the roof */ if(roofK==="flat"){ for(const [sx,sz,x,z] of [[w,.2,0,-.1],[w,.2,0,-d+.1],[.2,d,-w/2+.1,-d/2],[.2,d,w/2-.1,-d/2]]) KB(g,sx,.6,sz,tm,x,H+.3,z);
      if(r()<.8){ const tx=(r()-.5)*(w-2), tz=-d*.6; for(const [dx,dz] of [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]) KB(g,.08,.8,.08,km("#8a8a8a"),tx+dx,H+.4,tz+dz); kp(g,kcyl(),km(pick(["#e8e8e4","#5fa0d0","#d8c09a"]),{roughness:.5}),tx,H+1.35,tz,.62,1.1,.62); } /* 水塔 */
      if(r()<.45){ const sw=Math.min(3.2,w*.45), sx=(r()<.5?-1:1)*(w/2-sw/2-.2); KB(g,sw,2.2,2.6,km(pick(KP.wall)),sx,H+1.1,-d+1.5); kp(g,kbox(),km("#6a8aa0",{roughness:.5,metalness:.3}),sx,H+2.35,-d+1.5,sw+.4,.08,3.0,0,.12); } /* 頂樓加蓋 */
      for(let k=0;k<3;k++) if(r()<.5) pot(g,-w/2+.6+r()*(w-1.2),-.6-r()*(d-1.2),1,r,H); }
  else if(roofK==="hip"){ kp(g,khip(),rm,0,H,-d/2,w+.7,2.0+r()*.8,d+.7); }
  else { const th=roofK==="tile"?1.5:2.2+r()*.9, along=r()<.5; /* ridge along the street or across it */
    if(along) kp(g,kprism(),rm,0,H,-d/2,w+.7,th,d+.7); else kp(g,kprism(),rm,0,H,-d/2,d+.7,th,w+.7,Math.PI/2);
    if(roofK==="tile"){ if(along) KB(g,w+.9,.2,.24,km("#7a3a2e"),0,H+th,-d/2); else KB(g,.24,.2,d+.9,km("#7a3a2e"),0,H+th,-d/2); }
    if(r()<.5) KB(g,.55,1.6,.55,km(brick?"#a85a46":"#b9a48a"),w*.25,H+th*.6,-d*.7); }
  if(o.cat&&r()<.6) kp(g,ksph(),km(pick(["#f2a65a","#3a3a3a","#ffffff","#b0a090"])),w/2-.4,.2,gz+.5,.16,.14,.24);
  return g; }
/* street life: utility poles with sagging wires, parked scooters, a vending machine, a little 土地公 shrine, red lanterns over a street */
function scooter(g,x,z,ry,r){ const s=new T.Group(); s.position.set(x,0,z); s.rotation.y=ry; g.add(s); const c=km(["#e8706a","#5fa0d0","#f2f2ee","#7cc08a","#f2c230"][r()*5|0],{roughness:.5});
  kp(s,kcyl(),km("#2a2a2a"),0,.22,.55,.22,.1,.22,0,0,Math.PI/2); kp(s,kcyl(),km("#2a2a2a"),0,.22,-.55,.22,.1,.22,0,0,Math.PI/2); KB(s,.4,.35,1.1,c,0,.45,0); KB(s,.36,.12,.6,km("#3a3a3a"),0,.68,-.15); KB(s,.36,.6,.12,c,0,.75,.42); KB(s,.6,.05,.05,km("#444"),0,1.08,.45); }
function pole(g,x,z){ kp(g,kcyl(),km("#9a9488"),x,4,z,.12,8,.12); KB(g,1.2,.1,.1,km("#6a6458"),x,7.4,z); kp(g,kcyl(),km("#7a7a7a"),x+.4,6.8,z,.22,.5,.22); }
function wire(g,a,b,y,sag){ const n=10; for(let i=0;i<n;i++){ const t0=i/n, t1=(i+1)/n, p0=[a[0]+(b[0]-a[0])*t0,y-sag*4*t0*(1-t0),a[1]+(b[1]-a[1])*t0], p1=[a[0]+(b[0]-a[0])*t1,y-sag*4*t1*(1-t1),a[1]+(b[1]-a[1])*t1];
  const dx=p1[0]-p0[0], dy=p1[1]-p0[1], dz=p1[2]-p0[2], L=Math.hypot(dx,dy,dz); const m=kp(g,kcyl(),km("#2a2a2a"),(p0[0]+p1[0])/2,(p0[1]+p1[1])/2,(p0[2]+p1[2])/2,.018,L,.018); m.lookAt(p1[0],p1[1],p1[2]); m.rotateX(Math.PI/2); } }
function lanternLine(g,a,b,y,n,glow){ for(let i=1;i<n;i++){ const t=i/n, x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t, yy=y-.9*4*t*(1-t); const L=kp(g,ksph(),glow,x,yy,z,.22,.28,.22); L.userData.keep=1; kp(g,kcyl(),km("#d9aa3d"),x,yy+.3,z,.08,.06,.08); } wire(g,a,b,y+.3,.9); }
function vend(g,x,z,ry){ const s=new T.Group(); s.position.set(x,0,z); s.rotation.y=ry; g.add(s); KB(s,1.0,1.85,.75,km(["#d9533e","#4f7fb0","#f2f2ee"][Math.abs(x*7+z)%3|0],{roughness:.5}),0,.93,0); KB(s,.8,.9,.02,winM(1),0,1.25,.38); KB(s,.5,.12,.04,km("#2a2a2a"),0,.45,.38); }
function shrine(g,x,z,ry){ const s=new T.Group(); s.position.set(x,0,z); s.rotation.y=ry; g.add(s); KB(s,.9,.7,.7,km("#c9b9a2"),0,.35,0); KB(s,.8,.7,.6,km("#b3261e"),0,1.05,0); kp(s,kprism(),km("#3f6a52"),0,1.4,0,1.15,.45,.85); KB(s,.3,.36,.04,km("#2a1a12"),0,1.05,.31); kp(s,kcyl(),km("#d9aa3d"),0,.78,.32,.06,.12,.06); }
/* ---- where the buildings stand (worked out once, the same for everyone): rows along the streets, each a run of buildings of
   different widths and heights with gaps, alleys and the odd yard between them; a few are fixed (the shops you can go into) ---- */
const TOWNB=(()=>{ const out=[]; let sd=101;
  /* axis "x": the row runs along x, fronts on the line z=f; axis "z": along z, fronts on x=f. ry: which way the fronts face. */
  const row=(id,axis,f,ry,a0,a1,kind,fixed,o)=>{ const r=krng(sd+=17); let a=a0; const fx=(fixed||[]).slice().sort((p,q)=>p.a-q.a);
    while(a<a1-3){ const nx=fx.find(s=>s.a>=a-.01&&s.a<a+12);
      if(nx&&nx.a-a<5.2){ if(nx.a-a>1.4&&r()<.6) out.push({row:id,deco:"pots",axis,f,ry,c:(a+nx.a)/2}); out.push(Object.assign({row:id,axis,f,ry,c:nx.a+nx.w/2,seed:sd+(nx.a|0)},nx)); a=nx.a+nx.w+.3+r()*.6; fx.splice(fx.indexOf(nx),1); continue; }
      let w=kind==="house"?5.2+r()*2.2:5+r()*4.5; if(nx) w=Math.min(w,nx.a-a-.4); if(a+w>a1) w=a1-a; if(w<4.2) break;
      const k2=kind==="mix"?(r()<.62?"shop":"house"):kind, fl=(o&&o.fl)?o.fl(r):k2==="house"?1+(r()<.55?1:0)+(r()<.15?1:0):1+(r()*4|0);
      out.push({row:id,axis,f,ry,c:a+w/2,w,kind:k2,seed:(sd*31+(a*7|0))|0,fl,arcade:(o&&o.arcade!=null)?o.arcade:k2==="shop"&&fl>1&&r()<.6,d:k2==="house"?5.2+r()*.6:6.8+r()*1.2});
      a+=w+(r()<.22?2.2+r()*1.2:.15+r()*.5); /* now and then a gap: an alley, a yard */ }
    fx.forEach(nx=>out.push(Object.assign({row:id,axis,f,ry,c:nx.a+nx.w/2,seed:sd+(nx.a|0)},nx))); };
  const S=(a,w,name,key,o)=>Object.assign({a,w,kind:"shop",name,key,fl:2},o||{});
  /* 老街, north side (fronts face −z) and south side (+z); the gap at x 57–67 opens onto the fountain square */
  row("oN","x",-73,Math.PI,33.6,57,"mix",[S(34,8,"家具行","tw:furn",{fl:3,arcade:true,sbg:"#c96a3a"}),S(46,7,"雜貨店","tw:grocer",{fl:2,sbg:"#b0863a"})]);
  row("oN2","x",-73,Math.PI,67,88,"mix",[S(70,6.5,"書店","tw:soon:書店",{fl:3,sbg:"#7a6aa8"}),S(80,6,"飲料店","tw:soon:飲料店",{fl:1,sbg:"#d9628a"})]);
  row("oS","x",-81,0,33.6,88,"mix",[S(34.2,7.4,"釣具行","tw:tackle",{fl:2,sbg:"#3f7fa8"}),S(51,6,"中藥行","tw:soon:中藥行",{fl:3,brick:true,roof:"tile",sbg:"#7a4a3a"}),S(64,7,"早餐店","tw:soon:早餐店",{fl:2,sbg:"#e2a23a"}),S(76,6,"照相館","tw:soon:照相館",{fl:4,sbg:"#6a7a8a"})]);
  /* the main street's west side: two short runs either side of the west alley; 花店 just above the houses */
  row("mW","z",22.8,Math.PI/2,-83.6,-73.6,"mix",[],{fl:r=>1+(r()*3|0)});
  row("mW2","z",22.8,Math.PI/2,-98.8,-90.4,"mix",[S(-98.6,8,"花店","tw:flower",{fl:2,sbg:"#5f9a6a",arcade:false})]);
  /* 西側巷弄: a narrow lane off the main street with the barber's and the beauty salon */
  row("aN","x",-84,Math.PI,4,15.4,"mix",[S(8.2,7,"理髮廳","tw:barber",{fl:2,sbg:"#4a8fb0",arcade:false})]);
  row("aS","x",-90,0,4,15.4,"mix",[S(8.6,6.6,"美容院","tw:beauty",{fl:2,sbg:"#d9628a",arcade:false})]);
  /* 住宅巷: houses, each a little different; the first one west of the main street is yours */
  row("hN","x",-105,Math.PI,-8,22.4,"house",[{a:15.5,w:6,kind:"house",name:"我的家",key:"tw:home",fl:2,col:"#f6d6cf",rcol:"#d9624a",roof:"gable"}]);
  row("hN2","x",-105,Math.PI,33.6,66,"house");
  row("hS","x",-111,0,-8,22.4,"house"); row("hS2","x",-111,0,33.6,66,"house");
  let hn=0; out.forEach(b=>{ if(b.kind==="house"&&!b.key&&!b.deco) b.key="tw:house:"+(++hn); });
  /* where each one stands in the world */ out.forEach(b=>{ if(b.axis==="x"){ b.x=b.c; b.z=b.f; } else { b.x=b.f; b.z=b.c; } });
  return out; })();
/* the door of a building: [where you stand, where you tap] */
const bDoor=b=>{ const fx=Math.sin(b.ry), fz=Math.cos(b.ry); return {ax:b.x+fx*1.4,az:b.z+fz*1.4,hx:b.x-fx*.6,hz:b.z-fz*.6,face:Math.atan2(-fx,-fz)}; };
function rowBuild(C,ids,xr){ TOWNB.forEach(b=>{ if(!ids.includes(b.row)||(xr&&(b.x<xr[0]||b.x>=xr[1]))) return;
    if(b.deco==="pots"){ const r=krng(b.c*13|0), g=new T.Group(); g.position.set(b.x,0,b.z); g.rotation.y=b.ry; C.g.add(g); for(let k=0;k<3;k++) pot(g,(k-1)*.55,-.6-r()*.6,1.1,r); if(r()<.5) vend(g,0,-1.3,0); return; }
    kbld(C,Object.assign({},b,{x:b.x,z:b.z,ry:b.ry,cat:1})); }); }
/* the street's soul: poles and wires along the old street, red lanterns across it, scooters in the arcades, a vending machine or two */
function oldStreetLife(C,x0,x1){ const g=new T.Group(); C.g.add(g); const glow=KM.lan||(KM.lan=new T.MeshStandardMaterial({color:"#e8402e",emissive:"#ff6a3a",emissiveIntensity:.4,roughness:.5}));
  let prev=null; for(let x=x0+2;x<x1;x+=11){ pole(g,x,-73.5); if(prev) wire(g,[prev+.4,-73.5],[x+.4,-73.5],6.8,.5); prev=x; }
  for(let x=x0+6;x<x1-2;x+=12){ kp(g,kcyl(),km("#6b4a2e"),x,3,-73.6,.07,6,.07); kp(g,kcyl(),km("#6b4a2e"),x,3,-80.4,.07,6,.07); lanternLine(g,[x,-73.6],[x,-80.4],5.6,6,glow); }
  const r=krng(x0|0); TOWNB.forEach(b=>{ if(b.axis!=="x"||b.x<x0||b.x>x1||!b.arcade||!(b.row[0]==="o")) return; if(r()<.8){ const s=new T.Group(); s.position.set(b.x,0,b.z); s.rotation.y=b.ry; C.g.add(s); for(let k=0;k<1+(r()*3|0);k++) scooter(s,-b.w/2+1.2+k*.75,-.9,Math.PI/2+(r()-.5)*.3,r); } }); }
/* ---- the districts: each knows its middle and its size; build(C) puts its things into C.g ---- */
const CH=[
 {id:"gate",c:[28,-62],r:16,build:C=>{ street(C,22.8,33.2,-73,-52,"z",ROAD_A0,ROAD_A1); ground(C,"grass",17,22.8,-89,-52,.006); ground(C,"grass",33.2,48,-65,-52,.006); /* west of the street stays open: the great statue stands there */ sign(C,"← 媽祖大神像",2.2,.45,22.4,2.0,-70,Math.PI/2,"#8e1c14","#ffe2a0"); cyl(.05,.05,2.2,mat("#3a3a3e"),22.4,1.1,-70,C.g,6);
   /* 牌樓 */ const red=mat("#b3261e",{roughness:.6}), gold=mat("#d9aa3d",{roughness:.4,metalness:.3}); for(const x of [23.6,32.4]){ cyl(.32,.36,6,red,x,3,-58,C.g,10); box(.9,.5,.9,mat("#8a8a86"),x,.25,-58,C.g); } box(10.6,.5,.7,red,28,5.6,-58,C.g); box(11.6,.35,1.3,mat("#3f6a52",{roughness:.6}),28,6.55,-58,C.g); box(9,.3,1.0,mat("#3f6a52",{roughness:.6}),28,7.1,-58,C.g); box(4.6,.14,.1,gold,28,5.2,-57.6,C.g);
   sign(C,"天后小鎮",4.2,1.0,28,6.0,-57.62,0,"#8e1c14","#ffe2a0"); sign(C,"天后小鎮",4.2,1.0,28,6.0,-58.38,Math.PI,"#8e1c14","#ffe2a0");
   /* 公告欄 */ box(2.2,1.5,.12,mat("#6b432c",{roughness:.8}),21.9,1.55,-61,C.g).rotation.y=Math.PI/2; for(const dz of [-1,1]) cyl(.06,.06,2.3,mat("#6b432c"),21.9,1.15,-61+dz,C.g,6); sign(C,"公告欄・今日功課",2.0,.42,21.98,2.1,-61,Math.PI/2);
   /* 公車站 */ box(.1,2.4,3.2,mat("#cfe0ea",{roughness:.3,transparent:true,opacity:.5}),34.4,1.2,-64,C.g).userData.keep=1; box(1.4,.1,3.4,mat("#3f6a8a",{roughness:.5}),34.0,2.45,-64,C.g); for(const dz of [-1.5,1.5]) cyl(.05,.05,2.4,mat("#3a3a3e"),33.5,1.2,-64+dz,C.g,6); bench(C,34.05,-64,-Math.PI/2); sign(C,"公車站・往天后宮",2.4,.42,33.42,2.75,-64,-Math.PI/2,"#3f6a8a","#ffffff");
   for(const z of [-54,-66]){ lamp(C,23,z); lamp(C,33,z); } for(const [x,z] of [[19,-56],[20,-66],[38,-55],[43,-61],[37,-62]]) tree(C,x,z,1.2); }},
 {id:"oldE1",c:[47,-77],r:22,build:C=>{ street(C,33.2,61,-81,-73,"x"); rowBuild(C,["oN","oS"],[33,61]); oldStreetLife(C,33.2,61); for(const x of [46,58]) lamp(C,x,-80.4); }},
 {id:"oldE2",c:[75,-77],r:22,build:C=>{ street(C,61,88,-81,-73,"x"); rowBuild(C,["oN2","oS"],[61,90]); oldStreetLife(C,61,88); for(const x of [70,82]) lamp(C,x,-80.4);
   /* the fountain square opening off the old street */ ground(C,"plaza",57.4,66.6,-73,-66.2,.016,true,3); const g=new T.Group(); g.position.set(62,0,-69.5); C.g.add(g); const st=km("#e2dccf",{roughness:.6});
   kp(g,kcyl(),st,0,.28,0,1.75,.56,1.75); kp(g,kcyl(),km("#7ec8d8",{roughness:.15}),0,.5,0,1.55,.1,1.55).userData.keep=1; kp(g,kcyl(),st,0,.95,0,.22,1.3,.22); kp(g,kcyl(),st,0,1.6,0,.75,.14,.75); kp(g,ksph(),km("#bfe8f0",{roughness:.1,transparent:true,opacity:.75}),0,1.75,0,.55,.35,.55).userData.keep=1;
   for(const [x,z,ry] of [[58.6,-67.4,Math.PI/2],[65.4,-67.4,-Math.PI/2]]) bench(C,x,z,ry); for(const [x,z] of [[58.2,-71.8],[65.8,-71.8]]) tree(C,x,z,1.1); { const r=krng(5); for(let k=0;k<5;k++) pot(g,-3.8+k*1.9,3.0,1.1,r); } shrine(C.g,57.9,-66.7,Math.PI/2+.2); }},
 {id:"mid",c:[22,-91],r:16,build:C=>{ street(C,22.8,33.2,-105,-73,"z",ROAD_A0,ROAD_A1); ground(C,"grass",8,22.8,-104,-73.6,.006); rowBuild(C,["mW","mW2"]); for(const z of [-86,-98]){ lamp(C,23,z); lamp(C,33,z); }
   /* 西側巷弄 */ ground(C,"pave",4,22.8,-90,-84,.02,true,2); rowBuild(C,["aN","aS"]); { const g=new T.Group(); C.g.add(g); for(let x=6;x<22;x+=5.5){ kp(g,kcyl(),km("#6b4a2e"),x,2.6,-84.3,.06,5.2,.06); kp(g,kcyl(),km("#6b4a2e"),x,2.6,-89.7,.06,5.2,.06); lanternLine(g,[x,-84.3],[x,-89.7],4.9,5,KM.lan||(KM.lan=new T.MeshStandardMaterial({color:"#e8402e",emissive:"#ff6a3a",emissiveIntensity:.4,roughness:.5}))); }
     shrine(g,3.3,-87,Math.PI/2); vend(g,4.6,-84.6,Math.PI); tree(C,3.6,-84.2,1); tree(C,3.6,-89.8,1.05); sign(C,"西側巷弄・理髮廳・美容院",3.2,.5,22.6,2.6,-87,Math.PI/2,"#4a8fb0","#ffffff"); cyl(.05,.05,2.6,mat("#3a3a3e"),22.6,1.3,-85.4,C.g,6); } }},
 {id:"plaza",c:[47,-95],r:16,build:C=>{ ground(C,"plaza",33.2,60,-100,-90,.016,true,4); sign(C,"小吃廣場",3,.7,35.2,3.2,-90.2,0,"#b3261e","#ffe2a0"); for(const dx of [-1.4,1.4]) cyl(.06,.06,3.6,mat("#3a3a3e"),35.2+dx,1.8,-90.2,C.g,6);
   STALLS.forEach((x,i)=>{ const col=["#d9628a","#e2a23a","#5f9a6a","#4a8fb0"][i]; box(3,1.0,2.2,mat("#e9e3d6",{roughness:.8}),x,.5,-98.5,C.g); box(3.4,.12,2.8,mat(col,{roughness:.7}),x,2.5,-98.3,C.g); for(const [dx,dz] of [[-1.5,-1.2],[1.5,-1.2],[-1.5,1.0],[1.5,1.0]]) cyl(.04,.04,2.5,mat("#3a3a3e"),x+dx,1.25,-98.5+dz,C.g,6); sign(C,["擠冰淇淋","中藥對對碰","豆花","紅茶冰"][i],1.8,.5,x,2.1,-97.25,0,col,"#ffffff"); if(i===0){ const cn=new T.Group(); cn.position.set(x+.8,1.0,-98.2); C.g.add(cn); kp(cn,new T.ConeGeometry(.12,.32,10),km("#e2a65a"),0,.16,0,1,-1,1); for(let k=0;k<3;k++) kp(cn,ksph(),km("#fff6e8"),0,.36+k*.1,0,.13-k*.03,.07,.13-k*.03); } });
   for(const [x,z] of [[39,-93],[45,-94],[51,-93],[57,-94]]){ cyl(.5,.5,.06,mat("#f3ece0",{roughness:.6}),x,.74,z,C.g,12); cyl(.05,.05,.74,mat("#3a3a3e"),x,.37,z,C.g,6); for(const a of [0,2.1,4.2]) cyl(.18,.18,.45,mat("#c96a3a",{roughness:.8}),x+Math.cos(a)*.85,.22,z+Math.sin(a)*.85,C.g,8); } for(const x of [36,48,59]) lamp(C,x,-90.6); }},
 {id:"laneW",c:[8,-108],r:22,build:C=>{ street(C,-8,22.8,-111,-105,"x"); rowBuild(C,["hN","hS"]); for(const x of [-2,12]) lamp(C,x,-105.5); ground(C,"grass",-12,-8,-117,-99,.006); { const g=new T.Group(); C.g.add(g); pole(g,0,-110.6); pole(g,14,-110.6); wire(g,[.4,-110.6],[14.4,-110.6],6.8,.5); scooter(g,20.6,-105.6,0,krng(3)); } }},
 {id:"laneE",c:[50,-108],r:22,build:C=>{ street(C,33.2,66,-111,-105,"x"); rowBuild(C,["hN2","hS2"]); for(const x of [40,54]) lamp(C,x,-105.5); ground(C,"grass",62,70,-117,-99,.006); { const g=new T.Group(); C.g.add(g); pole(g,36,-110.6); pole(g,50,-110.6); pole(g,64,-110.6); wire(g,[36.4,-110.6],[50.4,-110.6],6.8,.5); wire(g,[50.4,-110.6],[64.4,-110.6],6.8,.5); vend(g,65.4,-105.6,Math.PI); } }},
 {id:"pier",c:[28,-124],r:18,build:C=>{ street(C,22.8,33.2,-117,-105,"z",ROAD_A0,ROAD_A1); ground(C,"plaza",22.8,33.2,-131,-117,.016,true,4); const wood=mat("#8a6246",{roughness:.85}); box(3.6,.1,7.2,wood,28,0,-134,C.g); { const d=new T.Mesh(new T.PlaneGeometry(3.6,7),mat("#8a6246",{roughness:.85})); d.rotation.x=-Math.PI/2; d.position.set(28,.056,-134); d.userData.floor=1; d.userData.keep=1; pickables.push(d); C.picks.push(d); C.g.add(d); } for(const [x,z] of [[26.2,-131],[29.8,-131],[26.2,-137.4],[29.8,-137.4]]) cyl(.1,.1,1.4,wood,x,.3,z,C.g,6);
   sign(C,"釣魚碼頭",2,.5,28,2.3,-130.6,0,"#3f6a8a","#ffffff"); for(const dx of [-.9,.9]) cyl(.05,.05,2.5,mat("#3a3a3e"),28+dx,1.25,-130.6,C.g,6);
   /* the river, and the station across it (not reachable yet) */ { const w=new T.Mesh(new T.PlaneGeometry(90,12),new T.MeshStandardMaterial({map:tex().water,roughness:.25,metalness:.1,transparent:true,opacity:.92})); w.material.map.repeat.set(1,1); const uv=w.geometry.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*15,uv.getY(i)*2); w.rotation.x=-Math.PI/2; w.position.set(28,-.12,-137.5); w.userData.keep=1; C.g.add(w); C.water=w; }
   ground(C,"grass",-14,72,-150,-143.5,.006); box(14,4.2,6,mat("#d9c7b0",{roughness:.9}),28,2.1,-148,C.g); box(15,.4,7,mat("#8a4a3a",{roughness:.8}),28,4.4,-148,C.g); sign(C,"天后車站（興建中）",6,.9,28,3.3,-144.95,0,"#fbf6ea"); for(const z of [-112,-124]){ lamp(C,23,z); lamp(C,33,z); } }},
 {id:"parkW",c:[8,-124],r:24,build:C=>{ ground(C,"grass",-8,22.8,-131,-117,.014,true,4); ground(C,"pave",-8,22.8,-120.2,-118.8,.02,true,2); /* 涼亭 */ const red=mat("#b3261e",{roughness:.6}); for(const [x,z] of [[10.5,-125.5],[13.5,-125.5],[10.5,-122.5],[13.5,-122.5]]) cyl(.14,.14,2.8,red,x,1.4,z,C.g,8); { const r=new T.Mesh(new T.ConeGeometry(3.1,1.5,4),mat("#3f6a52",{roughness:.7})); r.position.set(12,3.55,-124); r.rotation.y=Math.PI/4; C.g.add(r); } box(3.6,.12,3.6,mat("#c9b9a2",{roughness:.8}),12,.06,-124,C.g); bench(C,12,-125.1,0);
   for(const [x,z] of [[-4,-123],[2,-128],[6,-122],[18,-128],[20,-122],[-6,-129]]) tree(C,x,z,1.25); bench(C,0,-121,0); bench(C,17,-121,0); for(const x of [-4,8,20]) lamp(C,x,-118.4); ground(C,"grass",-14,22.8,-131.6,-131,.006); }},
 {id:"parkE",c:[50,-124],r:24,build:C=>{ ground(C,"grass",33.2,66,-131,-117,.014,true,4); ground(C,"pave",33.2,66,-120.2,-118.8,.02,true,2); sign(C,"社區花圃",2.4,.55,36.2,1.9,-123.6,0,"#5f9a6a","#ffffff"); for(const dx of [-1,1]) cyl(.05,.05,1.9,mat("#3a3a3e"),36.2+dx,.95,-123.6,C.g,6);
   /* the gate to your own garden (inside, everyone has their own plot) */ { const g=new T.Group(); g.position.set(42,0,-123); C.g.add(g); const wd=km("#8a6246"); KB(g,.8,2.6,.8,wd,-3.4,1.3,0); KB(g,.8,2.6,.8,wd,3.4,1.3,0); KB(g,7.6,.35,.9,km("#5f9a6a"),0,2.75,0); kp(g,kprism(),km("#d9624a"),0,2.9,0,8.2,.8,1.2);
     ksign(g,"我的花圃",2.4,.6,0,2.3,.48,0,"#5f9a6a","#ffffff"); for(const s2 of [-1,1]) for(let k=0;k<5;k++) kp(g,ksph(),km("#5f9a6a"),s2*(4.2+k*.9),.45,-.1,.55,.5,.4); const r=krng(9); for(let k=0;k<8;k++) kp(g,ksph(),km(["#ff8fb0","#fff1a0","#ffffff","#c5a8f5"][k%4]),-6+r()*12,.85,.2,.1,.1,.1); }
for(const [x,z] of [[62,-122],[64,-128],[35,-129]]) tree(C,x,z,1.25); bench(C,45,-121,0); bench(C,57,-121,0); for(const x of [38,50,62]) lamp(C,x,-118.4); }},
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
NT.tick=(dt,LIVE)=>{ NT.U.uT.value+=dt; const night=typeof _dn!=="undefined"?_dn.night:0; NT.U.uNight.value=night; if(KM.w1){ KM.w1.emissiveIntensity=night*.9; } if(KM.w0) KM.w0.emissiveIntensity=night*.25; if(KM.lan) KM.lan.emissiveIntensity=.4+night*1.6; if(NM){ NM.lamp.emissiveIntensity=.35+night*1.6; NM.glow.emissiveIntensity=.9+night*2; }
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
/* ================= 南岸 (11/13): over a footbridge from the riverside park — a forest with three springs (the deepest one is the
   goddess's), and 天后山 rising behind it: a real mountain 34 m high, a path winding round it up to a flat top with a campsite.
   The mountain's height is a function of the distance from its middle, and the path is a spiral cut into it at the height of the
   slope where it runs, so the path lies level across and climbs gently (about 1 in 10). ================= */
const SW={};
const MT={cx:66,cz:-212,H:34,R:42,top:7.4};
const mtProf=r=>MT.H*(1-sstep(MT.top-.4,MT.R,r));
const SPIRAL=(()=>{ const P=[]; for(let i=0;i<=320;i++){ const t=i/320, a=t*2.35*Math.PI*2, r=40-(40-MT.top-.3)*t; P.push([MT.cx+Math.sin(a)*r,MT.cz+Math.cos(a)*r,r]); } return P; })();
const SPI2=SPIRAL.map(p=>[p[0],p[1]]);
const FOREST=[14,118,-176,-143.6]; /* x0,x1,z0,z1: the level forest floor north of the mountain */
NT.springs=[[34,-157,3.3,"s",-.22],[100,-158.5,3.6,"s",-.22],[104,-183,4.4,"g",-.22]]; /* x, z, radius, kind, water level */
/* a path through the forest from the footbridge: to the springs, round the mountain's foot, to the start of the climb */
const FPATH=[[61.5,-144],[61.5,-150],[55,-155],[44,-157.5],[38.4,-157.6],[44,-160],[56,-163],[66,-168.4],[78,-165],[92,-161.2],[96.2,-160],[92,-164],[98,-172],[100.5,-178.6]];
const TREES=(()=>{ const r=krng(77), out=[]; for(let k=0;k<150;k++){ const x=FOREST[0]+2+r()*(FOREST[1]-FOREST[0]-4), z=FOREST[2]+r()*(FOREST[3]-FOREST[2]-3); const d=Math.hypot(x-MT.cx,z-MT.cz);
    if(Math.abs(x-61.5)<5&&z>-158) continue; if(NT.springs.some(S=>Math.hypot(x-S[0],z-S[1])<S[2]+2.5)) continue; if(lineD(SPI2,x,z)[0]<3.5||d<MT.R-1.5) continue; if(Math.abs(x-28)<9&&z>-152) continue; if(lineD(FPATH,x,z)[0]<2.6) continue; out.push([x,z,.9+r()*.7,r()<.5?1:0]); } return out; })();
function southH(x,z){ if(z>-143.6) return 0; const r=Math.hypot(x-MT.cx,z-MT.cz); let h=r<MT.R+2?mtProf(r)+(sstep(MT.R,MT.R-12,r)*sstep(MT.top+2,MT.top+8,r))*1.1*nz(x*.6,z*.6):0;
  if(r<MT.R+3){ const L=lineD(SPI2,x,z); if(L[0]<4){ const i=L[1], t=L[2], rr=SPIRAL[i][2]+(SPIRAL[Math.min(SPIRAL.length-1,i+1)][2]-SPIRAL[i][2])*t, th=mtProf(rr), k=sstep(1.5,3.6,L[0]); h=th*(1-k)+h*k; } }
  for(const S of NT.springs){ const d=Math.hypot(x-S[0],z-S[1]); if(d<S[2]+1.2) h=Math.min(h,-.55*sstep(S[2]+1.2,S[2]-.6,d)); }
  return h; }
SW.walk=(x,z)=>{ if(x<FOREST[0]||x>FOREST[1]||z>-143.6||z<-256) return false; for(const S of NT.springs) if(Math.hypot(x-S[0],z-S[1])<S[2]+.35) return false;
  const r=Math.hypot(x-MT.cx,z-MT.cz); if(r<MT.top+.2) return !CAMPB.some(b=>Math.hypot(x-b[0],z-b[1])<b[2]);
  if(r<MT.R-1.2) return lineD(SPI2,x,z)[0]<1.35;
  if(z<FOREST[2]&&r>MT.R+.5) return false;
  for(const t of TREES) if(Math.hypot(x-t[0],z-t[1])<.55*t[2]) return false; return true; };
const CAMPB=[[MT.cx,MT.cz,.9],[MT.cx-3.2,MT.cz-2.4,1.3],[MT.cx+3.3,MT.cz-1.8,1.3],[MT.cx+2.4,MT.cz+3.1,.9]]; /* fire, two tents, the table */
const VS=s=>new T.Color(s).convertSRGBToLinear();
const SC={g1:VS("#7cc46a"),g2:VS("#5aa45c"),dark:VS("#3f8a5a"),rock:VS("#9a9a8e"),path:VS("#d8c49a"),moss:VS("#6aa880"),top:VS("#a8d07a")};
function southC(x,z,h,c){ const n=.5+.5*nz(x*1.3,z*1.3); c.copy(SC.g1).lerp(SC.g2,n*.8); const r=Math.hypot(x-MT.cx,z-MT.cz);
  if(r<MT.R){ c.lerp(SC.dark,sstep(4,16,h)*.5); c.lerp(SC.rock,sstep(22,30,h)*.55*(r>MT.top+1?1:0)); if(r<MT.top+.6) c.copy(SC.top); }
  const L=lineD(SPI2,x,z)[0], P=lineD(FPATH,x,z)[0]; if(r<MT.R+2) c.lerp(SC.path,sstep(1.5,.9,L)); c.lerp(SC.path,sstep(1.4,.8,P)*.85);
  for(const S of NT.springs){ const d=Math.hypot(x-S[0],z-S[1]); if(d<S[2]+2) c.lerp(SC.moss,sstep(S[2]+2,S[2],d)); } }
function pine(C,x,y,z,s,r){ put(C,gsph(),NM.trunk,x,y+.7*s,z,.14*s,.75*s,.14*s); const m=NM.pine||(NM.pine=new T.MeshStandardMaterial({color:"#4f9a6a",roughness:.9})); for(let k=0;k<3;k++) put(C,gcone(),m,x,y+(1.3+k*.75)*s,z,(1.1-k*.27)*s,1.2*s,(1.1-k*.27)*s,r()*6); }
function mushroom(C,x,z,r){ const y=0; put(C,GEO.cy||(GEO.cy=new T.CylinderGeometry(1,1,1,16)),NM.white,x,y+.07,z,.035,.14,.035); put(C,gsph(),r()<.5?NM.red:NM.maple,x,y+.15,z,.1,.06,.1); }
function springPool(C,S,r){ const [x,z,R,k,y]=S; const g=new T.CircleGeometry(R+.2,32); g.rotateX(-Math.PI/2); const m=new T.Mesh(g,wmat(`varying vec3 vL; void main(){ vL=position; vec4 mvPosition=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}`,
   `uniform float uT; uniform float uNight; varying vec3 vL; void main(){ float r=length(vL.xz)/${(R+.2).toFixed(2)}; vec3 c=mix(vec3(.55,.92,.95),vec3(.25,.62,.82),r); ${k==="g"?"c=mix(c,vec3(.75,.95,1.),.35+.15*sin(uT*1.3));":""} float ring=smoothstep(.06,0.,abs(fract(r*3.-uT*.25)-.5)-.44)*.25; c+=ring; c*=mix(1.,${k==="g"?".7":".42"},uNight); gl_FragColor=vec4(c,.88);\n#include <fog_fragment>\n}`));
  m.position.set(x,y,z); m.renderOrder=2; m.userData.keep=1; m.userData.own=1; m.raycast=()=>{}; C.g.add(m);
  for(let k2=0;k2<22;k2++){ const a=k2/22*6.283+r()*.2, d=R+.15+r()*.3; rock(C,r,x+Math.cos(a)*d,-.05,z+Math.sin(a)*d,.35+r()*.35); } for(let k2=0;k2<6;k2++){ const a=r()*6.283; reeds(C,r,x+Math.cos(a)*(R+.9),z+Math.sin(a)*(R+.9)); }
  for(let k2=0;k2<5;k2++){ const a=r()*6.283, d=r()*R*.7; const pad=put(C,GEO.pad||(GEO.pad=new T.CircleGeometry(1,12).rotateX(-Math.PI/2)),NM.pad,x+Math.cos(a)*d,y+.02,z+Math.sin(a)*d,.3); pad.userData.keep=1; }
  if(k==="g"){ /* the goddess's spring: white stone steps, two lamps, a carved stone tablet */ for(const s of [-1,1]) lantern(C,x+s*2.6,z+R+1.4); sign(C,"女神泉",1.4,.42,x,1.0,z+R+1.9,0,"#9fd8e8","#2a4a5a"); cyl(.05,.05,1,mat("#8f6b4f"),x,.5,z+R+1.9,C.g,6); fireflies(C,40,x,z,R+3,21); }
  else sign(C,"泉池",1.1,.36,x+R+1.2,1.0,z,-Math.PI/2,"#9fd8e8","#2a4a5a"); }
SW.build=C=>{ nmat(); lawnHole2(); const r=krng(5);
  terrain(C,FOREST[0],FOREST[1],-176,-143.6,southH,southC,.012);
  /* the footbridge over the river */ for(let k=0;k<=16;k++){ const z=-131.2-k*.8, y=.2+.55*Math.sin(Math.PI*k/16); put(C,GEO.b||(GEO.b=new T.BoxGeometry(1,1,1)),NM.wood,61.5,y,z,3.4,.1,.78); }
   for(const x of [59.9,63.1]){ for(let k=0;k<=8;k++){ const z=-131.2-k*1.6, y=.2+.55*Math.sin(Math.PI*k/8); put(C,GEO.b,NM.woodD,x,y+.45,z,.08,.85,.08); } for(let k=0;k<8;k++){ const z=-132-k*1.6, y=.2+.55*Math.sin(Math.PI*(k+.5)/8); put(C,GEO.b,NM.wood,x,y+.85,z,.08,.08,1.62,0,Math.sin(Math.PI*(k+.5)/8-Math.PI/2)*.0); } }
  sign(C,"南岸森林・天后山",2.6,.5,61.5,2.2,-130.6,0,"#5f9a6a","#ffffff"); for(const dx of [-1.2,1.2]) cyl(.05,.05,2.2,mat("#8f6b4f"),61.5+dx,1.1,-130.6,C.g,6);
  TREES.forEach(([x,z,s,k])=>{ if(k) pine(C,x,0,z,s*1.3,r); else softTree(C,r,x,z,s*1.25,r()<.15?"maple":""); });
  for(let k=0;k<60;k++){ const x=FOREST[0]+r()*(FOREST[1]-FOREST[0]), z=-174+r()*29; if(!SW.walk(x,z)) continue; if(lineD(FPATH,x,z)[0]<1.6) continue; if(r()<.5) mushroom(C,x,z,r); else if(r()<.5) put(C,gsph(),NM.bush,x,.25,z,.5,.32,.5); else flowers(C,r,x,z,.8,5); }
  for(let k=0;k<14;k++){ const x=FOREST[0]+r()*(FOREST[1]-FOREST[0]), z=-174+r()*28; if(lineD(FPATH,x,z)[0]<2) continue; put(C,GEO.cy||(GEO.cy=new T.CylinderGeometry(1,1,1,16)),NM.woodD,x,.22,z,.22,1.8,.22,r()*6,0,Math.PI/2); }
  NT.springs.forEach(S=>springPool(C,S,r)); for(const [x,z] of [[55,-155],[88,-161.5],[70,-167.5]]) lantern(C,x,z);
  sign(C,"↑ 天后山登山口",2,.42,66,1.4,-169.4,0,"#7a6a4a","#ffffff"); cyl(.05,.05,1.4,mat("#8f6b4f"),66,.7,-169.4,C.g,6);
  fireflies(C,60,60,-160,18,31); };
SW.buildMt=C=>{ nmat(); const r=krng(9);
  terrain(C,MT.cx-MT.R-3,MT.cx+MT.R+3,MT.cz-MT.R-3,-176,southH,southC,.012);
  /* trees on the slopes, off the path */ for(let k=0;k<180;k++){ const a=r()*6.283, d=MT.top+3+r()*(MT.R-MT.top-4), x=MT.cx+Math.sin(a)*d, z=MT.cz+Math.cos(a)*d; if(z>-170.5) continue; if(lineD(SPI2,x,z)[0]<3.2) continue; const h=southH(x,z); if(r()<.65) pine(C,x,h-.1,z,1+r()*.6,r); else { softTree(C,r,x,z,1+r()*.4,""); C.g.children.slice(-5).forEach(o=>o.position.y+=h-.1); } }
  for(let k=0;k<40;k++){ const a=r()*6.283, d=MT.top+2+r()*(MT.R-MT.top-3), x=MT.cx+Math.sin(a)*d, z=MT.cz+Math.cos(a)*d; if(z>-170.5||lineD(SPI2,x,z)[0]<2.6) continue; rock(C,r,x,southH(x,z),z,.5+r()*.9); }
  /* rails on the outer edge of the path, every few metres, and resting benches */ for(let i=6;i<SPIRAL.length-4;i+=6){ const p=SPIRAL[i], q=SPIRAL[i+1], dx=q[0]-p[0], dz=q[1]-p[1], L=Math.hypot(dx,dz)||1, ox=(p[0]-MT.cx)/p[2], oz=(p[1]-MT.cz)/p[2], x=p[0]+ox*1.45, z=p[1]+oz*1.45, h=mtProf(p[2]); if(z>-171) continue;
     put(C,GEO.b||(GEO.b=new T.BoxGeometry(1,1,1)),NM.woodD,x,h+.45,z,.1,.9,.1); const p2=SPIRAL[i+6]; if(p2){ const x2=p2[0]+(p2[0]-MT.cx)/p2[2]*1.45, z2=p2[1]+(p2[1]-MT.cz)/p2[2]*1.45, h2=mtProf(p2[2]); const m=put(C,GEO.b,NM.wood,(x+x2)/2,(h+h2)/2+.82,(z+z2)/2,.07,.07,Math.hypot(x2-x,z2-z,h2-h)); m.lookAt(x2,h2+.82,z2); } }
  for(const i of [90,180,260]){ const p=SPIRAL[i], ox=(p[0]-MT.cx)/p[2], oz=(p[1]-MT.cz)/p[2]; const g=new T.Group(); g.position.set(p[0]-ox*1.6,mtProf(p[2]),p[1]-oz*1.6); g.rotation.y=Math.atan2(ox,oz); C.g.add(g); const B=GEO.b; for(const [sx,sy,sz,y,z] of [[1.4,.07,.4,.45,0],[1.4,.35,.06,.72,-.18]]){ const m=new T.Mesh(B,NM.wood); m.scale.set(sx,sy,sz); m.position.set(0,y,z); g.add(m); } }
  /* the top: a meadow with the campsite — a fire ring, two tents, logs to sit on, a picnic table, lanterns, a telescope, a sign */
  const y=MT.H, cx=MT.cx, cz=MT.cz; for(let k=0;k<10;k++){ const a=k/10*6.283; rock(C,r,cx+Math.cos(a)*.75,y,cz+Math.sin(a)*.75,.22,1); }
  for(const [dx,dz,ry] of [[0,0,0],[.3,.2,1.1],[-.2,.25,2.2]]) put(C,GEO.cy||(GEO.cy=new T.CylinderGeometry(1,1,1,16)),NM.woodD,cx+dx*.3,y+.12,cz+dz*.3,.07,.8,.07,ry,0,Math.PI/2.4);
  const fire=new T.Mesh(new T.ConeGeometry(.35,.9,8),new T.MeshBasicMaterial({color:"#ffb040",transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false})); fire.position.set(cx,y+.5,cz); fire.userData.keep=1; fire.userData.own=1; C.g.add(fire); C.fire=fire;
  const fl=new T.PointLight("#ff9a4a",1.4,10,2); fl.position.set(cx,y+1,cz); C.g.add(fl); C.fl=fl;
  for(const [dx,dz,c] of [[-3.2,-2.4,"#e8706a"],[3.3,-1.8,"#5fa0d0"]]){ const t=new T.Mesh(kprism(),km(c,{roughness:.8})); t.scale.set(2.2,1.7,2.4); t.position.set(cx+dx,y,cz+dz); t.rotation.y=Math.atan2(dx,dz); C.g.add(t); kp(C.g,kbox(),km("#3a2a20"),cx+dx*.62,y+.5,cz+dz*.62,.7,1,.05,Math.atan2(dx,dz)); }
  for(const a of [.6,2.3,4.0]) put(C,GEO.cy,NM.wood,cx+Math.cos(a)*1.9,y+.2,cz+Math.sin(a)*1.9,.2,1.3,.2,-a,0,Math.PI/2);
  { const g=new T.Group(); g.position.set(cx+2.4,y,cz+3.1); C.g.add(g); KB(g,1.6,.08,.8,km("#b08a68"),0,.75,0); for(const sx of [-.7,.7]) KB(g,.08,.75,.7,km("#8f6b4f"),sx,.37,0); for(const sz of [-.75,.75]) KB(g,1.6,.06,.3,km("#b08a68"),0,.42,sz); }
  for(const a of [1.2,3.0,4.9]) lantern(C,cx+Math.cos(a)*5.6,cz+Math.sin(a)*5.6); for(let k=0;k<6;k++){ const a=r()*6.283; flowers(C,r,cx+Math.cos(a)*5,cz+Math.sin(a)*5,1,8); C.g.children.slice(-8).forEach(o=>o.position.y+=y); }
  { const g=new T.Group(); g.position.set(cx-4.6,y,cz+3.4); C.g.add(g); for(const a of [0,2.1,4.2]){ const l=KB(g,.04,1.2,.04,km("#3a3a3a"),Math.cos(a)*.25,.55,Math.sin(a)*.25); l.rotation.set(Math.sin(a)*.25,0,-Math.cos(a)*.25); } kp(g,kcyl(),km("#e8e8e4",{roughness:.4}),0,1.2,0,.12,.8,.12,0,1.1); }
  sign(C,"天后山・露營區　海拔 34 m",3,.5,cx,1.6+y,cz+6.3,0,"#7a6a4a","#ffffff"); cyl(.05,.05,1.6,mat("#8f6b4f"),cx,y+.8,cz+6.3,C.g,6);
  fireflies(C,40,cx,cz,9,41); C.g.children.slice(-1)[0].position.y=y; };
function lawnHole2(){ try{ lawnHole(); const m=outsideGround.material; if(m.userData.hole2) return; m.userData.hole2=1; const prev=m.onBeforeCompile; m.onBeforeCompile=sh=>{ prev&&prev(sh); sh.fragmentShader=sh.fragmentShader.replace("if(vHW.x>86.5&&vHW.z<-50.&&vHW.z>-140.) discard;","if(vHW.x>86.5&&vHW.z<-50.&&vHW.z>-140.) discard; if(vHW.z<-143.&&vHW.x>13.&&vHW.x<119.) discard;"); }; m.customProgramCacheKey=()=>"lawnhole2"; m.needsUpdate=true; }catch(e){} }
NCH.push({id:"forest",c:[66,-160],r:50,build:C=>SW.build(C)},{id:"mount",c:[66,-212],r:44,build:C=>SW.buildMt(C)});

/* 望海沙灘: a beach café (a wooden kiosk with a striped awning, tables under parasols) and a row of loungers */
NT.block.push([146,-113.2,2.2],[141.8,-108.6,.7],[141.8,-116.4,.7],[150.6,-108.4,.7]);
NCH.push({id:"cafe",c:[148,-112],r:14,build:C=>{ nmat(); const r=krng(12), g=new T.Group(); g.position.set(146,0,-113.2); g.rotation.y=-Math.PI/2; C.g.add(g);
  KB(g,4.2,2.4,3.2,km("#f6efe2"),0,1.2,-1.6); KB(g,4.4,.14,3.4,km("#b08a68"),0,2.47,-1.6); const n=10; for(let i=0;i<n;i++) kp(g,kbox(),km(i%2?"#ffffff":"#4fb0a8"),-2.2+(i+.5)*4.4/n,2.7,.35,4.4/n+.01,.06,1.1,0,.32);
  KB(g,3.6,1.05,.6,km("#b08a68"),0,.52,.25); KB(g,3.8,.08,.75,km("#8f6b4f"),0,1.08,.25); KB(g,2.8,1.0,.04,winM(1),0,1.75,0.02); ksign(g,"海邊咖啡",2.6,.6,0,3.2,.36,0,"#4fb0a8","#ffffff");
  kp(g,kcyl(),km("#f2c230"),-1.2,1.22,.25,.09,.2,.09); kp(g,ksph(),km("#7cc08a"),1.3,1.25,.3,.12,.12,.12); kp(g,kbox(),km("#2a2a2a"),1.6,1.75,.03,.6,.8,.02);
  for(const [x,z,c] of [[141.8,-108.6,"#e8706a"],[141.8,-116.4,"#f2c230"],[150.6,-108.4,"#5fa0d0"]]){ const t=new T.Group(); t.position.set(x,0,z); C.g.add(t); kp(t,kcyl(),km("#ffffff"),0,.72,0,.45,.05,.45); kp(t,kcyl(),km("#bbbbbb"),0,.36,0,.04,.72,.04); kp(t,kcyl(),km("#ffffff"),0,1.3,0,.03,2.6,.03); kp(t,new T.ConeGeometry(1.3,.5,8),km(c),0,2.55,0,1,1,1); for(const a of [0,2.1,4.2]) kp(t,kcyl(),km("#d8c8a8"),Math.cos(a)*.75,.24,Math.sin(a)*.75,.18,.48,.18); }
  for(let k=0;k<4;k++){ const z=-120.5-k*2.2, x=152.6; const L=new T.Group(); L.position.set(x,0,z); L.rotation.y=Math.PI/2; C.g.add(L); const c=km(["#4fb0a8","#e8706a","#f2c230","#8a7ad0"][k]); KB(L,.65,.08,1.7,c,0,.32,0); KB(L,.65,.08,.75,c,0,.62,-.75).rotation.x=-.6; for(const sx of [-.28,.28]) for(const sz of [-.7,.7]) KB(L,.05,.3,.05,km("#ffffff"),sx,.15,sz); kp(L,ksph(),km("#ffffff"),0,.42,.7,.18,.06,.12); }
  { const p=new T.Group(); p.position.set(152.6,0,-123.8); C.g.add(p); kp(p,kcyl(),km("#ffffff"),0,1.2,0,.04,2.4,.04); for(let k=0;k<8;k++) kp(p,new T.ConeGeometry(1.7,.7,8,1,true,0,Math.PI/4),km(k%2?"#4fb0a8":"#ffffff",{side:T.DoubleSide}),0,2.45,0,1,1,1,k*Math.PI/4); }
  sign(C,"海邊咖啡・躺椅",2.2,.42,140.2,1.4,-112,-Math.PI/2,"#4fb0a8","#ffffff"); cyl(.04,.04,1.4,mat("#8f6b4f"),140.25,.7,-112,C.g,6); }});

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
const ST=[["tw:board",22.6,-61,Math.PI/2*-1,21.9,-61,1.2,2.2],["tw:bus",33.0,-64,Math.PI/2,34.2,-64,1.5,2.4],["tw:fish",28,-136.4,Math.PI,28,-137.6,1.8,1.2],
    ["tw:ice",38,-96.6,Math.PI,38,-98.5,1.6,2.4],["tw:goddess",104,-188.6,Math.PI,104,-183,4.4,2],["tw:camp",66,-209.6,Math.PI,66,-212,1.2,1.6+34],["tw:cafe",143.4,-113.2,Math.PI/2,145.2,-113.2,2,2.6],["tw:lounge",151.4,-121.6,Math.PI/2,152.6,-121.6,1.2,1],["tw:herb",44,-96.6,Math.PI,44,-98.5,1.6,2.4],["tw:garden",42,-121.4,Math.PI,42,-123,2.6,3]]
  .concat(TOWNB.filter(b=>b.key).map(b=>{ const d=bDoor(b); return [b.key,d.ax,d.az,d.face,d.hx,d.hz,Math.min(2.6,b.w/2),3.2]; }));
const STN={"tw:goddess":"女神泉","tw:camp":"營火","tw:cafe":"海邊咖啡","tw:lounge":"躺椅","tw:board":"公告欄","tw:bus":"公車站","tw:fish":"釣魚碼頭","tw:ice":"擠冰淇淋","tw:herb":"中藥對對碰","tw:garden":"我的花圃"}; TOWNB.forEach(b=>{ if(b.key) STN[b.key]=b.name||"鄰居的家"; });
setTimeout(()=>{ try{ ST.forEach(s=>{ station(s[0],[s[1],s[2]],s[3]); addHit(s[0],s[4],0,s[5],s[6],s[7]); try{ if(STN[s[0]]) STATION_LABEL[s[0]]=STN[s[0]]; }catch(e){} }); }catch(e){ console.warn("town stations",e); } },1500);
function warp(x,z){ try{ if(meAv.seat>=0) meAv.seat=-1; }catch(e){} meAv.pos.set(x,z); meAv.target.set(x,z); meAv.path=[]; try{ pendingStation=null; }catch(e){} markDirty(); }
TW.station=k=>{ if(k.indexOf("tw:")!==0) return false;
  if(k==="tw:board"){ try{ DQ.open(); }catch(e){} return true; }
  if(k==="tw:home"){ try{ ROOMX.open(); }catch(e){} return true; }
  if(k==="tw:bus"){ openSheet("townBus","🚌 公車站",`<p class="lead">搭公車回天后宮，一下子就到廟埕。</p><div class="row"><button class="primary" data-act="twBus" data-v="temple">回天后宮廟埕</button><button class="secondary" data-act="twBus" data-v="inn">到禪房門口</button></div><p class="note">之後車站蓋好，這裡也會有去別的地方的車。</p>`); return true; }
  if(k==="tw:furn"){ openSheet("townFurn","🪑 家具行",`<p class="lead">家具行的家具，在你家的「家具」分頁裡就能買，買了直接擺。</p><div class="row"><button class="primary" data-act="roomOpen">回我的房間看家具</button></div>`); return true; }
  try{ if(typeof LIFE!=="undefined"&&LIFE&&LIFE.station(k)) return true; }catch(e){ console.warn("life",e); }
  if(k==="tw:flower"){ toast("🌷 花店準備中：之後在這裡買種子，到河堤的社區花圃種",3200); return true; }
  if(k==="tw:tackle"){ toast("🎣 釣具行準備中：之後在這裡買釣竿和魚餌",3200); return true; }
  if(k==="tw:fish"){ toast("🎣 釣魚準備中：之後在這個碼頭就能釣魚",3000); return true; }
  if(k.indexOf("tw:bed:")===0){ toast("🌱 花圃準備中：之後每個人都能在這裡種自己的花",3000); return true; }
  if(k.indexOf("tw:house:")===0){ toast("🏠 這一戶還沒有人住。之後可以進去參觀別人的家",3000); return true; }
  if(k.indexOf("tw:soon:")===0){ toast(`${k.slice(8)}還在準備中`,2400); return true; }
  return true; };
HANDLERS.twBus=v=>{ closeSheet(); if(v==="inn") warp(28,INN.G); else { const c=[0,HZ+6]; warp(c[0],c[1]); } try{ toast(v==="inn"?"🚌 到禪房門口了":"🚌 回到天后宮了",2200); }catch(e){} };
/* where there is water to fish in: 大河 (r), 溪谷 (b), 泉池 (s / g for the goddess's spring), 大海 (o); y is its surface */
TW.water=(x,z)=>{ if(TW.walk(x,z)) return null; for(const S of (NT.springs||[])) if(Math.hypot(x-S[0],z-S[1])<S[2]-.15) return {k:S[3],y:S[4]};
  if(z<-131.6&&z>-143.4&&x>-17&&x<73) return {k:"r",y:-.12};
  if(x>86&&x<182&&z<-50&&z>-140){ if(x>shoreX(z)+.4) return {k:"o",y:-.18}; const b=lineD(BROOK,x,z); if(b[0]<brookW(b[1],b[2])-.1) return {k:"b",y:-.1}; }
  return null; };
TW.zrect=ZR; TW.live=()=>Object.keys(LIVE);
return TW; })();

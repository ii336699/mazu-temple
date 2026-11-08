/* ================= 貓咪: three strays wander the courtyard, nap and come to people who are kind to them; feed and pet one until it
   trusts you and you can adopt it. Then it follows you, eats one can a day, needs its litter cleaned and loves being petted, and
   learns tricks a little each day. 愛心媽媽 by the cats sells cans (10 平安幣); 土地公 sometimes digs one up. Each cat's coat is drawn
   on the one shared model by a small shader (no pictures), so no two look alike and they cost almost nothing to show. ================= */
const CAT_COATS=[["橘虎斑",{mode:0,base:"#eb9441",c2:"#c4601c",c3:"#f7e1bb"}],["灰虎斑",{mode:0,base:"#9d9b99",c2:"#4b4947",c3:"#f1eeea",m:1,nose:"#2a2220"}],["棕虎斑",{mode:0,base:"#9b5b2a",c2:"#4a2610",c3:"#f5e0bf",nose:"#2a1a14"}],
  ["三花",{mode:1,base:"#f7f2ea",c2:"#e8862c",c3:"#262120"}],["玳瑁",{mode:2,base:"#d5772a",c2:"#241b18",nose:"#2a1a14"}],["賓士",{mode:3,base:"#1c1918",c3:"#f6f3ef"}],
  ["橘白",{mode:4,base:"#f8f3eb",c2:"#e9944a",nose:"#d98a80"}],["暹羅",{mode:5,base:"#f1e5d0",c2:"#5a3a29",nose:"#3a2620",ear:"#b27b6e"}],["銀虎斑",{mode:0,base:"#c9c9cc",c2:"#3c3c40",c3:"#fbfbfb",m:1,nose:"#3a2a26"}],
  ["豹紋",{mode:6,base:"#dc9d4a",c2:"#5a3315",c3:"#f6e1bd",nose:"#3a2216"}]];
const CAT_NAMES=["咪咪","小橘","阿花","黑糖","布丁","麻糬","湯圓","奶茶","芝麻","豆花","可樂","饅頭","小虎","雪球","肉圓","米糕","珍珠","仙草","花生","Lucky"];
const TRICKS=[["sit","坐下",2],["paw","握手",3],["spin","轉圈",3],["roll","翻滾",4],["jump","跳高",4],["wave","招財貓招手",5],["flip","後空翻",7]];
const CAT={geo:null,ents:[],t:0,pend:null,mom:{x:15.2,z:28.6},bed:{x:16.6,z:30.6},hearts:[],ready:false};
const catDay=()=>Math.floor((Date.now()+8*3600e3)/864e5);
const CAT_GLSL=`
float h3(vec3 p){ p=fract(p*.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ return vn(p)*.55+vn(p*2.1)*.3+vn(p*4.3)*.15; }
float cell(vec3 p){ vec3 i=floor(p), f=fract(p); float d=9.; for(int a=-1;a<=1;a++)for(int b=-1;b<=1;b++)for(int c=-1;c<=1;c++){ vec3 o=vec3(a,b,c); vec3 r=o+vec3(h3(i+o),h3(i+o+11.),h3(i+o+23.))*.8-f; d=min(d,dot(r,r)); } return sqrt(d); }
const vec3 F=vec3(-.09,.56,.47); const vec3 HC=vec3(-.03,.64,.12);
vec3 coat(vec3 p){
  vec3 q=p+uSeed; float n=fbm(q*5.); float fx=p.x-F.x;
  float head=1.-smoothstep(.34,.40,length(p-HC));
  float ears=smoothstep(.83,.87,p.y);
  float earIn=ears*smoothstep(.225,.25,p.z)*smoothstep(.86,.89,p.y)*(1.-smoothstep(.95,.97,p.y));
  float tail=smoothstep(.14,.18,p.x)*(1.-smoothstep(-.27,-.23,p.z))*smoothstep(.42,.47,p.y)*(1.-head);
  float body=(1.-head)*(1.-tail)*(1.-ears);
  float mask=head*(1.-smoothstep(.13,.22,length(vec2(fx,(p.y-.53)*1.25))))*smoothstep(.22,.32,p.z);
  float chest=body*(1.-smoothstep(.13,.22,abs(p.x+.02)))*smoothstep(.10,.22,p.z)*smoothstep(.06,.14,p.y);
  float belly=body*(1.-smoothstep(.10,.18,abs(p.x)))*(1.-smoothstep(.13,.2,p.y));
  float paws=1.-smoothstep(.055,.085,p.y);
  float light=clamp(max(max(mask,chest),max(belly,paws)),0.,1.);
  float sb=body*smoothstep(.15,.30,p.y)*smoothstep(.55,.9,sin(p.z*30.+n*4.+uSeed.x))*(1.-chest);
  float sl=body*(1.-smoothstep(.22,.30,p.y))*smoothstep(.09,.13,p.y)*smoothstep(.5,.9,sin(p.y*48.+n*2.))*smoothstep(.12,.2,abs(p.x));
  float sf=head*smoothstep(.70,.76,p.y)*(1.-smoothstep(.13,.17,abs(fx)))*smoothstep(.15,.3,p.z)*smoothstep(.45,.9,sin(fx*62.+1.5));
  float sm=head*smoothstep(.66,.70,p.y)*(1.-smoothstep(.72,.75,p.y))*(1.-smoothstep(.10,.13,abs(fx)))*smoothstep(.3,.36,p.z)*smoothstep(.2,.8,sin(abs(fx)*90.));
  float sc=head*smoothstep(.17,.22,abs(fx))*(1.-ears)*smoothstep(.5,.9,sin(p.y*42.+n*2.))*smoothstep(.40,.48,p.y);
  float st=tail*smoothstep(.45,.85,sin(p.y*34.));
  float stripes=clamp(sb+sl+sf+sc+st+sm*uM,0.,1.);
  vec3 c=uBase;
  if(uMode==0){ c=mix(uBase,uC2,stripes*.95); c=mix(c,uC3,light); }
  else if(uMode==1){ float a=smoothstep(.50,.54,fbm(q*2.2)), b=smoothstep(.52,.56,fbm(q*2.4+7.)); c=mix(uBase,uC2,a); c=mix(c,uC3,b*(1.-a)); c=mix(c,uBase,max(light,head*(1.-smoothstep(.06,.12,abs(fx)))*smoothstep(.25,.35,p.z)*(1.-smoothstep(.70,.80,p.y)))); }
  else if(uMode==2){ c=mix(uBase,uC2,smoothstep(.42,.58,fbm(q*7.))); }
  else if(uMode==3){ float v=head*(1.-smoothstep(.0,.03,abs(fx)-max(0.,(.63-p.y))*1.1-.01))*smoothstep(.25,.35,p.z)*(1.-smoothstep(.63,.66,p.y)); c=mix(uBase,uC3,clamp(max(v,max(chest,1.-smoothstep(.08,.12,p.y))),0.,1.)); }
  else if(uMode==4){ float cap=head*smoothstep(.60,.66,p.y+.05*n)*(1.-(1.-smoothstep(.0,.02,abs(fx)-max(0.,.80-p.y)*.35))*smoothstep(.2,.3,p.z)); float back=body*smoothstep(.30,.36,p.y+.06*n)*(1.-smoothstep(-.05,.05,p.z+.1*n)); float tb=tail*smoothstep(.46,.5,p.y)*(1.-smoothstep(.66,.7,p.y)); c=mix(uBase,uC2,clamp(max(max(cap,ears),max(back,tb)),0.,1.)); }
  else if(uMode==5){ float pt=max(max(ears,tail),1.-smoothstep(.12,.18,p.y)); pt=max(pt,head*(1.-smoothstep(.10,.20,length(vec2(fx,(p.y-.57)*1.1))))*smoothstep(.25,.36,p.z)); c=mix(uBase,uC2,clamp(pt,0.,1.)); }
  else { float cd=cell(q*vec3(7.,8.,7.)); float sp=(1.-smoothstep(.30,.38,cd))*body*smoothstep(.10,.18,p.y)*(1.-chest); float ring=sp*smoothstep(.14,.22,cd); float hs=head*(1.-smoothstep(.16,.22,cell(q*13.)))*(1.-mask)*smoothstep(.45,.5,p.y); c=mix(uBase,uC2,clamp(ring*1.2+hs+sf+st+sl,0.,1.)); c=mix(c,mix(uBase,uC2,.35),sp*(1.-ring)); c=mix(c,uC3,light); }
  c*=.94+.12*n;
  c=mix(c,uEarC,earIn*(1.-smoothstep(.0,.02,abs(p.x-(p.x<-.09?-.27:.085))-.032)));
  float eye=0., hl=0.; for(int k=0;k<2;k++){ float sx=k==0?-1.:1.; vec2 e=p.xy-vec2(F.x+sx*.097,.622); eye=max(eye,1.-smoothstep(.8,1.,length(e/.03))); hl=max(hl,1.-smoothstep(.5,1.,length((e-vec2(.009,.01))/.009))); } eye*=step(.42,p.z); hl*=eye;
  c=mix(c,uEyeC,eye); c=mix(c,vec3(1.),hl*.9);
  float nose=(1.-smoothstep(.7,1.,length((p.xy-vec2(F.x,.567))/vec2(.02,.013))))*step(.44,p.z); c=mix(c,uNose,nose);
  float mo=0.; for(int k=0;k<2;k++){ float sx=k==0?-1.:1.; vec2 m=p.xy-vec2(F.x+sx*.017,.552); float d=abs(length(m)-.016); mo=max(mo,(1.-smoothstep(.002,.0045,d))*step(m.y,0.)); }
  mo=max(mo,(1.-smoothstep(.002,.004,abs(fx)))*step(.551,p.y)*step(p.y,.562)); mo*=step(.45,p.z); c=mix(c,vec3(.25,.15,.12),mo);
  return c; }`;
function catMat(t,sd){ const o=(CAT_COATS[t]||CAT_COATS[0])[1], C=v=>new T.Color(v).convertSRGBToLinear(), s=(sd%997)*.37;
  const m=new T.MeshStandardMaterial({color:0xffffff,roughness:.85});
  m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,{uBase:{value:C(o.base)},uC2:{value:C(o.c2||o.base)},uC3:{value:C(o.c3||"#f3e3c4")},uNose:{value:C(o.nose||"#e8949a")},uEarC:{value:C(o.ear||"#f0a9a8")},uEyeC:{value:C(o.eye||"#1d1412")},uMode:{value:o.mode|0},uM:{value:o.m?1:0},uSeed:{value:new T.Vector3(s,s*1.7,s*2.3)}});
    sh.vertexShader="varying vec3 vCP;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\n vCP=position;");
    sh.fragmentShader="varying vec3 vCP; uniform vec3 uBase,uC2,uC3,uNose,uEarC,uEyeC,uSeed; uniform int uMode; uniform float uM;\n"+CAT_GLSL+"\n"+sh.fragmentShader.replace("vec4 diffuseColor = vec4( diffuse, opacity );","vec4 diffuseColor = vec4( diffuse*coat(vCP), opacity );"); };
  m.customProgramCacheKey=()=>"catcoat"; return m; }

/* ---- the saved state (bag.cat): s = the strays (id, t coat, sd seed, nm name, a 好感度, fd day last fed, pd/pn petted today), pet = your cat ---- */
function catNewStray(){ return {id:Math.random().toString(36).slice(2,8),t:(Math.random()*CAT_COATS.length)|0,sd:(Math.random()*65535)|0,nm:CAT_NAMES[(Math.random()*CAT_NAMES.length)|0],a:0,fd:0,pd:0,pn:0}; }
function catData(){ const d=catDay(); if(!bag.cat||typeof bag.cat!=="object") bag.cat={s:[],pet:null}; const C=bag.cat; C.s=Array.isArray(C.s)?C.s:[];
  if(C.s.length<3&&(!C.next||d>=C.next)){ while(C.s.length<3) C.s.push(catNewStray()); C.next=0; }
  C.s.forEach(s=>{ if(s.pd!==d){ s.pd=d; s.pn=0; } });
  if(C.pet&&!C.pet.away&&catDays(C.pet,"lf")>=4){ C.pet.away=true; C.pet.home=false; setTimeout(()=>toast(`${C.pet.nm} 好幾天沒吃東西，跑去愛心媽媽那裡了。去找愛心媽媽帶牠回來吧`,5000),4000); }
  return C; }
const catCans=()=>bag.items.can||0;
function catDays(p,k){ return p&&p[k]?catDay()-p[k]:99; }
function catMood(p){ if(!p) return 0; const f=catDays(p,"lf"), l=catDays(p,"ll"), t=catDays(p,"lp"); return Math.max(0,Math.min(100,100-30*Math.max(0,f-1)-15*Math.max(0,l-1)-10*Math.max(0,t-1)-(f>=1?10:0)-(l>=1?5:0))); }
function catLearned(p){ return TRICKS.filter(([k,,n])=>(p.tr&&p.tr[k]||0)>=n); }

/* ---- the figures ---- */
function catEnt(kind,ref){ if(!CAT.geo) return null; const g=new T.Group(), body=new T.Group(), mesh=new T.Mesh(CAT.geo,catMat(ref.t,ref.sd)); mesh.castShadow=true; body.add(mesh); g.add(body); g.scale.setScalar(.5); g.userData.noMerge=1; scene.add(g);
  const sp=catSpot(); g.position.set(sp[0],0,sp[1]); const e={kind,ref,g,body,mesh,st:"sit",tt:rand(2,6),tx:sp[0],tz:sp[1],ph:Math.random()*9,trick:null,z:null};
  e.hit=addHit("cat:"+(kind==="pet"?"pet":ref.id),sp[0],0,sp[1],.32,.5); CAT.ents.push(e); return e; }
function catDrop(e){ scene.remove(e.g); try{ e.mesh.material.dispose(); }catch(_){} if(e.z){ scene.remove(e.z); } scene.remove(e.hit); const i=pickables.indexOf(e.hit); if(i>=0) pickables.splice(i,1); CAT.ents.splice(CAT.ents.indexOf(e),1); }
const CAT_NAP=[[7.6,32.6],[12.4,24.8],[-7.6,29.4],[-5.2,17.6],[5.4,17.8],[13.4,36.4],[-12.6,35.6]];
function catSpot(near){ for(let k=0;k<30;k++){ let x,z; if(near){ x=near[0]+rand(-2.5,2.5); z=near[1]+rand(-2.5,2.5); } else { x=rand(-14,14); z=rand(HZ+2.5,HZ+YX+13); } if(walkable(x,z)) return [x,z]; } return [CAT.mom.x-1,CAT.mom.z+1]; }
function catSync(){ if(!CAT.ready) return; const C=catData(); const want=new Set(C.s.map(s=>s.id));
  for(const e of CAT.ents.slice()){ if(e.kind==="stray"&&!want.has(e.ref.id)) catDrop(e); }
  C.s.forEach(s=>{ const e=CAT.ents.find(x=>x.kind==="stray"&&x.ref.id===s.id); if(e) e.ref=s; else catEnt("stray",s); });
  const pe=CAT.ents.find(x=>x.kind==="pet"); const p=C.pet&&!C.pet.away?C.pet:null;
  if(pe&&(!p||pe.ref.sd!==p.sd)) catDrop(pe); if(p){ const e2=CAT.ents.find(x=>x.kind==="pet"); if(e2) e2.ref=p; else { const e=catEnt("pet",p); if(e&&!p.home){ e.g.position.set(meAv.pos.x+.8,0,meAv.pos.y+.8); } } } }
function catLoad(){ loadModel("cat",m=>{ let geo=null; m.traverse(o=>{ if(o.isMesh&&!geo) geo=o.geometry; }); if(!geo) return; CAT.geo=geo; CAT.ready=true; catSync(); }); catBuildHome(); }

/* ---- 愛心媽媽, the cat bed and the litter box ---- */
function catBuildHome(){ const M=CAT.mom, B=CAT.bed;
  const av=new Avatar([1,6,0,9,2,4,0,3,1,0,1,0,0],{npc:true,x:M.x,z:M.z}); av.sjBusy=1; av.rotY=-Math.PI/2; av.faceGoal=-Math.PI/2; av.root.rotation.y=-Math.PI/2; av.story=1; av.setName("愛心媽媽"); CAT.momAv=av; av.talkIn=rand(6,14);
  station("catMom",[M.x-1.6,M.z],Math.PI/2); STATION_LABEL.catMom="愛心媽媽"; STATION_HINT.catMom="走向愛心媽媽"; addHit("catMom",M.x,0,M.z,.5,1.7);
  const g=new T.Group(); g.position.set(B.x,0,B.z); g.userData.noMerge=1; scene.add(g);
  const bed=new T.Mesh(new T.TorusGeometry(.32,.12,10,24),mat("#c96a6a",{roughness:.9})); bed.rotation.x=-Math.PI/2; bed.position.y=.1; g.add(bed);
  const pad=new T.Mesh(new T.CylinderGeometry(.3,.3,.06,20),mat("#f2dccb",{roughness:1})); pad.position.y=.05; g.add(pad);
  const box=new T.Group(); box.position.set(.95,0,.1); g.add(box); const tray=new T.Mesh(new T.BoxGeometry(.6,.16,.45),mat("#6aa0c8",{roughness:.6})); tray.position.y=.08; box.add(tray);
  const sand=new T.Mesh(new T.BoxGeometry(.52,.02,.37),mat("#e8d9b0",{roughness:1})); sand.position.y=.16; box.add(sand);
  const dirt=new T.Group(); for(let i=0;i<5;i++){ const d=new T.Mesh(new T.SphereGeometry(.035,6,5),mat("#6b4a2a",{roughness:1})); d.position.set(rand(-.2,.2),.17,rand(-.14,.14)); d.scale.y=.6; dirt.add(d); } box.add(dirt); CAT.dirt=dirt;
  const sc=new T.Mesh(new T.BoxGeometry(.06,.02,.2),mat("#e2c341",{roughness:.6})); sc.position.set(.38,.17,0); sc.rotation.z=.4; box.add(sc);
  const bowl=new T.Mesh(new T.CylinderGeometry(.12,.09,.07,16),mat("#e9e3da",{roughness:.4})); bowl.position.set(-.55,.035,.25); g.add(bowl);
  addHit("catLitter",B.x+.95,0,B.z+.1,.4,.3); }

/* ---- every frame ---- */
function catTick(dt){ CAT.t+=dt; if(CAT.momAv){ CAT.momAv.update(dt); if((CAT.momAv.talkIn-=dt)<0){ CAT.momAv.talkIn=rand(14,30); if(Math.hypot(meAv.pos.x-CAT.mom.x,meAv.pos.y-CAT.mom.z)<9) CAT.momAv.say(["小貓咪要吃飯囉～","罐頭一罐 10 塊，貓咪一天吃一罐","摸摸牠們，牠們就會記得你","領養之前要想清楚喔","貓砂每天都要清一次"][(Math.random()*5)|0],"#f7ecd6",3); } }
  if(CAT.dirt){ const p=bag.cat&&bag.cat.pet; CAT.dirt.visible=!!(p&&catDays(p,"ll")>=1); }
  if(!CAT.ents.length) return; const me2=meAv.pos;
  for(const e of CAT.ents){ const g=e.g, b=e.body; e.ph+=dt;
    if(e.trick){ catTrickStep(e,dt); }
    else if(e.kind==="pet"&&!e.ref.home){ /* following you: a little behind and to the side; dozes off when you stay put */
      const fx=Math.sin(meAv.rotY), fz=Math.cos(meAv.rotY), tx=me2.x-fx*1.0+fz*.55, tz=me2.y-fz*1.0-fx*.55, d=Math.hypot(tx-g.position.x,tz-g.position.z);
      if(d>22){ g.position.set(tx,0,tz); e.st="sit"; } else if(d>(e.st==="sleep"?2.6:.45)){ catMove(e,tx,tz,Math.min(3.4,.9+d*1.3),dt); e.st="walk"; e.idle=0; }
      else { e.idle=(e.idle||0)+dt; if(e.st!=="sleep") e.st=e.idle>30?"sleep":e.idle>12&&((e.idle*10)|0)%97===0?"groom":e.st==="groom"&&e.idle%8>4?"sit":e.st==="walk"?"sit":e.st; if(e.st!=="sleep") g.rotation.y=lerpAngle(g.rotation.y,meAv.rotY,dt*2); } }
    else { /* wandering, sitting, napping */
      e.tt-=dt; if(e.st==="walk"){ if(catMove(e,e.tx,e.tz,e.kind==="pet"?.8:.75,dt)) { e.st=Math.random()<.35?"sleep":Math.random()<.5?"groom":"sit"; e.tt=e.st==="sleep"?rand(25,70):rand(4,12); } }
      else if(e.tt<0){ let to; const near=e.kind==="pet"?[CAT.bed.x,CAT.bed.z]:null;
        if(e.kind==="stray"&&e.ref.a>=40&&Math.hypot(me2.x-g.position.x,me2.y-g.position.z)<10&&Math.random()<.5) to=catSpot([me2.x,me2.y]); else if(!near&&Math.random()<.3){ const n=CAT_NAP[(Math.random()*CAT_NAP.length)|0]; to=[n[0]+rand(-.5,.5),n[1]+rand(-.5,.5)]; if(!walkable(to[0],to[1])) to=catSpot(); } else to=catSpot(near);
        e.tx=to[0]; e.tz=to[1]; e.st="walk"; e.tt=30; } }
    /* poses */
    let by=0, rz=0, rx=0, sy=1;
    if(!e.trick){ if(e.st==="walk"){ by=Math.abs(Math.sin(e.ph*13))*.07; rz=Math.sin(e.ph*13)*.05; }
      else if(e.st==="sleep"){ rz=1.3; by=.36; sy=1+Math.sin(e.ph*1.6)*.03; }
      else if(e.st==="groom"){ rx=Math.sin(e.ph*5)*.08; sy=.96; }
      else { sy=.97+Math.sin(e.ph*2)*.015; }
      b.position.y+=(by-b.position.y)*Math.min(1,dt*10); b.rotation.z+=(rz-b.rotation.z)*Math.min(1,dt*(e.st==="sleep"?2:10)); b.rotation.x+=(rx-b.rotation.x)*Math.min(1,dt*8); b.scale.y+=(sy-b.scale.y)*Math.min(1,dt*6); b.rotation.y=0; }
    /* Zz over a sleeping cat */
    if(e.st==="sleep"&&!e.trick){ if(!e.z){ e.z=textSprite("Zz",{fs:40,h:.18,color:"#dfe8ff"}); scene.add(e.z); } e.z.position.set(g.position.x,.55+Math.sin(e.ph*1.4)*.05,g.position.z); } else if(e.z){ scene.remove(e.z); e.z=null; }
    e.hit.position.set(g.position.x,.25,g.position.z);
    if(CAT.pend===e&&Math.hypot(me2.x-g.position.x,me2.y-g.position.z)<1.8){ CAT.pend=null; catOpen(e); } }
  if(CAT.litterGo&&Math.hypot(me2.x-CAT.bed.x-.95,me2.y-CAT.bed.z)<2){ CAT.litterGo=false; catLitter(); }
  for(let i=CAT.hearts.length-1;i>=0;i--){ const h=CAT.hearts[i]; h.t+=dt; h.s.position.y+=dt*.5; h.s.material.opacity=Math.max(0,1-h.t/1.4); if(h.t>1.4){ scene.remove(h.s); h.s.material.dispose(); CAT.hearts.splice(i,1); } } }
function catMove(e,tx,tz,sp,dt){ const g=e.g, dx=tx-g.position.x, dz=tz-g.position.z, d=Math.hypot(dx,dz); if(d<.15) return true;
  const st=Math.min(d,sp*dt), nx=g.position.x+dx/d*st, nz=g.position.z+dz/d*st; g.rotation.y=lerpAngle(g.rotation.y,Math.atan2(dx,dz),Math.min(1,dt*8));
  if(e.kind==="pet"||walkable(nx,nz)){ g.position.x=nx; g.position.z=nz; } else { e.tt=0; e.st="sit"; return true; } return false; }

/* ---- hearts, meows, purrs ---- */
let CAT_HEART=null; function catHearts(e,n=4){ if(!CAT_HEART) CAT_HEART=cvs(64,64,x=>{ x.font="48px sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillStyle="#ff6b8a"; x.fillText("❤",32,36); });
  for(let i=0;i<n;i++){ const s=new T.Sprite(new T.SpriteMaterial({map:CAT_HEART,transparent:true,depthWrite:false})); s.scale.setScalar(.18); s.position.set(e.g.position.x+rand(-.2,.2),.45+i*.08,e.g.position.z+rand(-.2,.2)); scene.add(s); CAT.hearts.push({s,t:-i*.15}); } }
function catMeow(hi){ const a=soundOn?ensureAudio():null, v=sVol(); if(!a||v<=0) return; const t=a.currentTime+.02, o=a.createOscillator(), f=a.createBiquadFilter(), g=a.createGain(); o.type="sawtooth"; const b=hi?820:640;
  o.frequency.setValueAtTime(b*.8,t); o.frequency.linearRampToValueAtTime(b*1.25,t+.12); o.frequency.linearRampToValueAtTime(b*.7,t+.42); f.type="bandpass"; f.frequency.setValueAtTime(900,t); f.frequency.linearRampToValueAtTime(1500,t+.15); f.frequency.linearRampToValueAtTime(700,t+.42); f.Q.value=3;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.16*v,t+.04); g.gain.linearRampToValueAtTime(.12*v,t+.3); g.gain.linearRampToValueAtTime(0,t+.45); o.connect(f); f.connect(g); g.connect(sfxBus(a)); o.start(t); o.stop(t+.5); }
function catPurr(){ const a=soundOn?ensureAudio():null, v=sVol(); if(!a||v<=0) return; const t=a.currentTime+.02, o=a.createOscillator(), lfo=a.createOscillator(), lg=a.createGain(), g=a.createGain(); o.type="triangle"; o.frequency.value=58; lfo.frequency.value=24; lg.gain.value=.06*v;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.07*v,t+.2); g.gain.linearRampToValueAtTime(0,t+1.4); lfo.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(sfxBus(a)); o.start(t); lfo.start(t); o.stop(t+1.5); lfo.stop(t+1.5); }

/* ---- tricks: the whole little body moves (the model has no animations of its own) ---- */
const TRICK_T={sit:1.4,paw:1.4,spin:1.1,roll:1.3,jump:1.0,wave:1.8,flip:1.1};
function catTrick(e,k,fail){ e.trick={k,t:0,fail}; e.st="sit"; if(e.z){ scene.remove(e.z); e.z=null; } }
function catTrickStep(e,dt){ const k=e.trick.k, D=TRICK_T[k]||1.2, u=Math.min(1,(e.trick.t+=dt)/D), b=e.body, A=e.trick.fail?.45:1, s=Math.sin(u*Math.PI);
  b.rotation.set(0,0,0); b.position.set(0,0,0); b.scale.set(1,1,1);
  if(k==="sit"){ b.scale.y=1-.14*s; b.rotation.x=-.3*s*A; }
  else if(k==="paw"){ b.rotation.z=-.25*s*A; b.rotation.x=-.15*s; b.position.y=.03*s; }
  else if(k==="spin"){ b.rotation.y=Math.PI*2*u*A; b.position.y=.05*s; }
  else if(k==="roll"){ b.rotation.z=Math.PI*2*u*A; b.position.y=.28*s; }
  else if(k==="jump"){ b.position.y=1.0*s*A; b.scale.y=1+.08*s; }
  else if(k==="wave"){ b.rotation.z=Math.sin(u*Math.PI*6)*.18*A; b.scale.y=1-.06*s; }
  else if(k==="flip"){ b.position.y=1.5*s*A; b.rotation.x=-Math.PI*2*(u<1?u*u*(3-2*u):1)*A; }
  if(e.trick.fail&&u>.6){ b.rotation.z+=Math.sin(e.trick.t*30)*.12*(1-u); }
  if(u>=1){ b.rotation.set(0,0,0); b.position.set(0,0,0); b.scale.set(1,1,1); e.trick=null; } }

/* ---- tapping a cat ---- */
function catTap(id){ const e=id==="pet"?CAT.ents.find(x=>x.kind==="pet"):CAT.ents.find(x=>x.kind==="stray"&&x.ref.id===id); if(!e) return;
  const d=Math.hypot(meAv.pos.x-e.g.position.x,meAv.pos.y-e.g.position.z); if(d<2.4){ catOpen(e); return; } CAT.pend=e; walkTo(e.g.position.x,e.g.position.z); }
function catOpen(e){ catMeow(e.ref.a>60||e.kind==="pet"); if(e.st==="sleep"){ e.st="sit"; e.idle=0; } if(e.st==="walk"){ e.st="sit"; e.tt=rand(6,12); } e.g.rotation.y=Math.atan2(meAv.pos.x-e.g.position.x,meAv.pos.y-e.g.position.z); CAT.cur=e; if(e.kind==="pet") catPetSheet(); else catStraySheet(); }
const catBar=(v,col)=>`<div style="height:12px;border-radius:8px;background:rgba(255,255,255,.12);overflow:hidden;margin:6px 0"><i style="display:block;height:100%;width:${Math.max(0,Math.min(100,v))}%;background:${col||"linear-gradient(90deg,#ff8fb0,#ff5c8a)"}"></i></div>`;
function catStraySheet(){ const e=CAT.cur; if(!e||e.kind!=="stray") return; const s=e.ref, C=catData(), d=catDay(), coat=CAT_COATS[s.t][0];
  HANDLERS.catPet=catPet; HANDLERS.catFeed=catFeed; HANDLERS.catAdopt=catAdopt; HANDLERS.goCatMom=()=>{ closeSheet(); goStation("catMom"); };
  openSheet("cat",`🐈 ${s.nm}（${coat}）`,`<p class="lead">${s.a<20?"牠還有點怕生，慢慢靠近牠吧。":s.a<60?"牠開始認得你了，會跟在你旁邊。":s.a<100?"牠很喜歡你，常常來找你！":"牠已經把你當成家人了 ❤"}</p>
    <p class="note">好感度 ${s.a}/100</p>${catBar(s.a)}
    <div class="goods"><button class="good" data-act="catPet"><span class="name">🤚 摸摸牠</span><span class="meta">今天 ${s.pn}/3 次・好感 +5</span></button>
    <button class="good" data-act="catFeed" ${s.fd===d?"disabled":""}><span class="name">🥫 餵罐頭</span><span class="meta">${s.fd===d?"今天吃飽了":`好感 +20・你有 ${catCans()} 罐`}</span></button>
    ${s.a>=100?`<button class="good" data-act="catAdopt"><span class="name">🏠 領養牠</span><span class="meta">${C.pet?"你已經有一隻貓了（一次只能養一隻）":"帶牠回家，每天照顧牠"}</span></button>`:""}</div>
    <p class="note">罐頭可以跟廟埕的愛心媽媽買（一罐 10 平安幣），土地公尋寶也挖得到。好感度滿 100 就可以領養。</p><div class="chips"><button class="chip" data-act="goCatMom">去找愛心媽媽</button></div>`); }
function catPet(){ const e=CAT.cur; if(!e) return; if(e.kind==="pet"){ const p=e.ref; const first=p.lp!==catDay(); p.lp=catDay(); catHearts(e,first?6:3); catPurr(); catTrick(e,"sit"); saveBag(); markDirty(); toast(first?`${p.nm} 舒服得呼嚕呼嚕叫`:`${p.nm} 蹭了蹭你的手`,1800); catPetSheet(); return; }
  const s=e.ref; if(s.pn>=3){ toast(`${s.nm} 今天被摸夠了，明天再來吧`,2000); return; } s.pn++; s.a=Math.min(100,s.a+5); catHearts(e,3); catPurr(); saveBag(); markDirty(); toast(s.a>=100?`${s.nm} 好感度滿了！可以領養牠了`:`${s.nm} 瞇起眼睛，好感 +5`,2000); catStraySheet(); }
function catFeed(){ const e=CAT.cur; if(!e) return; if(catCans()<1){ toast("沒有罐頭了，到愛心媽媽那裡買",2400); return; } const d=catDay();
  if(e.kind==="pet"){ const p=e.ref; if(p.lf===d){ toast(`${p.nm} 今天吃飽了，一天一罐就好`,2200); return; } bag.items.can--; p.lf=d; catHearts(e,5); catMeow(true); saveBag(); markDirty(); toast(`${p.nm} 吃得好開心！`,1800); catPetSheet(); return; }
  const s=e.ref; if(s.fd===d){ toast(`${s.nm} 今天吃飽了`,1800); return; } bag.items.can--; s.fd=d; s.a=Math.min(100,s.a+20); catHearts(e,6); catMeow(true); saveBag(); markDirty(); toast(s.a>=100?`${s.nm} 好感度滿了！可以領養牠了`:`${s.nm} 吃得津津有味，好感 +20`,2200); catStraySheet(); }
function catAdopt(){ const e=CAT.cur, C=catData(); if(!e||e.kind!=="stray") return; if(C.pet){ toast("一次只能養一隻貓，先好好照顧你家的貓吧",2600); return; } if(e.ref.a<100) return; const s=e.ref, d=catDay();
  C.pet={t:s.t,sd:s.sd,nm:s.nm,born:d,lf:s.fd===d?d:d-1,ll:d,lp:d,tr:{},tt:{},home:false}; C.s=C.s.filter(x=>x!==s); C.next=d+1; const pos=[e.g.position.x,e.g.position.z]; catDrop(e); catSync();
  const pe=CAT.ents.find(x=>x.kind==="pet"); if(pe){ pe.g.position.set(pos[0],0,pos[1]); catHearts(pe,10); } catMeow(true); saveBag(); markDirty(); profSave(true); statInc("catAdopt");
  closeSheet(); toast(`你領養了 ${s.nm}！記得每天餵一罐、清貓砂、摸摸牠`,4000); setTimeout(()=>{ CAT.cur=pe; catPetSheet(); },900); }

/* ---- your cat ---- */
function catPetSheet(){ const e=CAT.ents.find(x=>x.kind==="pet"); const C=catData(), p=C.pet; if(!p){ closeSheet(); return; } CAT.cur=e; const d=catDay(), mood=catMood(p), coat=CAT_COATS[p.t][0];
  Object.assign(HANDLERS,{catPet,catFeed,catLitter,catTrainOpen,catShowOpen,catRename,catHome});
  const fed=p.lf===d, clean=p.ll===d, pet=p.lp===d, learned=catLearned(p);
  openSheet("cat",`🐈 ${esc(p.nm)}（${coat}）`,`<p class="lead">${mood>=80?"心情很好，一直蹭你":mood>=50?"還不錯，想要你多陪陪牠":mood>=25?"有點不開心……":"很難過，好像快要離家出走了"}</p>
    <p class="note">心情 ${mood}/100</p>${catBar(mood,mood>=50?"linear-gradient(90deg,#9be38a,#4cc36a)":"linear-gradient(90deg,#ffcf6a,#ff8a4c)")}
    <div class="goods"><button class="good" data-act="catFeed" ${fed?"disabled":""}><span class="name">🥫 ${fed?"今天吃過了":"肚子餓了，餵一罐"}</span><span class="meta">一天一罐・你有 ${catCans()} 罐</span></button>
    <button class="good" data-act="catLitter" ${clean?"disabled":""}><span class="name">🧹 ${clean?"貓砂很乾淨":"清貓砂"}</span><span class="meta">${clean?"今天清過了":"貓砂盆在愛心媽媽旁邊，每天清一次"}</span></button>
    <button class="good" data-act="catPet"><span class="name">🤚 摸摸牠</span><span class="meta">${pet?"今天摸過了，再摸也很開心":"牠在等你摸摸"}</span></button>
    <button class="good" data-act="catTrainOpen"><span class="name">🎓 訓練</span><span class="meta">學會 ${learned.length}/${TRICKS.length} 個動作</span></button>
    ${learned.length?`<button class="good" data-act="catShowOpen"><span class="name">🎪 表演</span><span class="meta">讓牠做學會的動作</span></button>`:""}</div>
    <div class="chips"><button class="chip" data-act="catHome">${p.home?"🐾 帶牠出門（跟著我）":"🏠 讓牠回貓窩休息"}</button><button class="chip" data-act="catRename">✏️ 改名字</button></div>
    <p class="note">每天要餵一罐、清貓砂、摸摸牠，心情才會好。三天以上沒吃東西，牠會跑去愛心媽媽那裡。養了 ${d-p.born+1} 天。</p>`); }
function catLitter(){ const p=catData().pet; if(!p) return; const B=CAT.bed; if(Math.hypot(meAv.pos.x-B.x-.95,meAv.pos.y-B.z)>3.2){ CAT.litterGo=true; walkTo(B.x+.2,B.z+1.1); toast("走去貓砂盆……",1500); return; }
  if(p.ll===catDay()){ toast("貓砂今天清過了",1500); return; } p.ll=catDay(); try{ [300,260,320].forEach((f,i)=>tone(f,.08,.05,"square",i*.12)); }catch(_){} saveBag(); markDirty(); toast("貓砂清好了，乾乾淨淨！",1800); const e=CAT.ents.find(x=>x.kind==="pet"); if(e) catHearts(e,2); }
function catTrainOpen(){ const p=catData().pet; if(!p) return; const d=catDay(); p.tt=p.tt&&p.tt.d===d?p.tt:{d,n:0}; const mood=catMood(p), learned=catLearned(p).length; HANDLERS.catTrain=catTrain;
  openSheet("cat",`🎓 訓練 ${esc(p.nm)}`,`${backBtnCat()}<p class="lead">每個動作每天可以練一次，一天最多練 3 次。要先吃飽、心情 40 以上才肯練。</p>
    <div class="goods">${TRICKS.map(([k,n,need])=>{ const v=Math.min(need,p.tr[k]||0), done=v>=need, lock=k==="flip"&&learned<3&&!done, today=p.tt[k];
      return `<button class="good" data-act="catTrain" data-v="${k}" ${done||lock||today?"disabled":""}><span class="name">${done?"✅":lock?"🔒":"🐾"} ${n}</span><span class="meta">${done?"學會了":lock?"先學會 3 個動作才能練":today?"今天練過了":`進度 ${v}/${need}`}</span></button>`; }).join("")}</div>
    <p class="note">今天練了 ${p.tt.n}/3 次・心情 ${mood}・${p.lf===d?"吃飽了":"還沒吃飯"}</p>`); }
const backBtnCat=()=>`<button class="chip" data-act="catBack" style="margin-bottom:8px">← 回到貓咪</button>`;
HANDLERS.catBack=()=>catPetSheet();
function catTrain(k){ const p=catData().pet, e=CAT.ents.find(x=>x.kind==="pet"); if(!p||!e) return; const d=catDay(), T0=TRICKS.find(x=>x[0]===k); if(!T0) return;
  if(p.lf!==d){ toast(`${p.nm} 肚子餓，不想練習`,2200); return; } if(catMood(p)<40){ toast(`${p.nm} 心情不好，先摸摸牠吧`,2200); return; } if(p.tt.n>=3){ toast("今天練夠了，明天再來",2000); return; } if(p.tt[k]) return;
  p.tt[k]=1; p.tt.n++; p.tr[k]=Math.min(T0[2],(p.tr[k]||0)+1); const done=p.tr[k]>=T0[2]; closeSheet(); catTrick(e,k,!done); saveBag(); markDirty(); if(done) profSave(true);
  setTimeout(()=>{ if(done){ catHearts(e,10); catMeow(true); toast(`🎉 ${p.nm} 學會「${T0[1]}」了！`,3200); statInc("catTrick"); } else toast(`${p.nm} 試著${T0[1]}……還不太會（${p.tr[k]}/${T0[2]}）`,2400); },TRICK_T[k]*1000); }
function catShowOpen(){ const p=catData().pet; if(!p) return; HANDLERS.catShow=k=>{ const e=CAT.ents.find(x=>x.kind==="pet"); closeSheet(); if(e){ catTrick(e,k); setTimeout(()=>catHearts(e,3),TRICK_T[k]*900); } };
  openSheet("cat",`🎪 ${esc(p.nm)} 表演`,`${backBtnCat()}<div class="goods">${catLearned(p).map(([k,n])=>`<button class="good" data-act="catShow" data-v="${k}"><span class="name">${n}</span></button>`).join("")}</div>`); }
function catRename(){ const p=catData().pet; if(!p) return; HANDLERS.catNameSave=()=>{ const v=cleanName((($("#catNm")||{}).value||"").trim()).slice(0,6); if(!v){ toast("請輸入名字"); return; } if(chatCheck&&chatCheck(v)){ toast("換一個名字吧",1800); return; } p.nm=v; saveBag(); markDirty(); profSave(true); toast(`牠現在叫 ${v} 了`,1800); catPetSheet(); };
  openSheet("cat","✏️ 幫貓咪取名字",`${backBtnCat()}<div class="mail-row"><input class="mail-box" id="catNm" maxlength="6" value="${esc(p.nm)}" autocomplete="off"><button class="good mail-copy" data-act="catNameSave"><span class="name">好了</span></button></div><p class="note">最多 6 個字。</p>`); }
function catHome(){ const p=catData().pet; if(!p) return; p.home=!p.home; const e=CAT.ents.find(x=>x.kind==="pet"); if(e){ e.st="walk"; const sp=p.home?catSpot([CAT.bed.x,CAT.bed.z]):[meAv.pos.x,meAv.pos.y]; e.tx=sp[0]; e.tz=sp[1]; } saveBag(); markDirty(); toast(p.home?`${p.nm} 回貓窩休息了`:`${p.nm} 跟著你出門了`,1800); catPetSheet(); }

/* ---- 愛心媽媽 ---- */
function catMomOpen(){ const C=catData(), p=C.pet; HANDLERS.catBuy=n=>{ n=+n; const cost=n*10; if(bag.coins<cost){ toast("平安幣不夠",1800); return; } bag.coins-=cost; bag.items.can=Math.min(99,(bag.items.can||0)+n); saveBag(); markDirty(); try{ sfx.coin(); }catch(_){} toast(`買了 ${n} 罐貓罐頭（共 ${catCans()} 罐）`,1800); catMomOpen(); };
  HANDLERS.catBack2=()=>{ if(!p||!p.away) return; if(catCans()<1){ toast("要先有 1 個罐頭餵牠，跟我買一罐吧",2400); return; } bag.items.can--; p.away=false; p.lf=catDay(); p.ll=catDay(); p.lp=catDay(); p.home=false; saveBag(); markDirty(); catSync(); toast(`${p.nm} 吃了罐頭，開心地跟你回家了。以後要每天照顧牠喔`,3600); closeSheet(); };
  openSheet("contact","👵 愛心媽媽",`<p class="lead">「廟裡的貓都是我在餵的。你喜歡貓的話，買幾個罐頭去餵牠們吧！牠們吃飽了、被摸舒服了，就會把你當家人。」</p>
    ${p&&p.away?`<div class="group"><span class="group-label">你的貓在這裡</span><p class="lead">「${esc(p.nm)} 好幾天沒吃東西，跑來我這裡。餵牠一罐，牠就跟你回去。」</p><div class="goods"><button class="good" data-act="catBack2"><span class="name">🥫 餵牠，帶牠回家</span><span class="meta">用掉 1 罐</span></button></div></div>`:""}
    <div class="inv-top"><span class="inv-coin">${bic("coin")}<b>${bag.coins}</b>平安幣</span><span class="inv-note">🥫 你有 ${catCans()} 罐</span></div>
    <div class="goods">${[1,5,10].map(n=>`<button class="good" data-act="catBuy" data-v="${n}"><span class="name">🥫 貓罐頭 ×${n}</span><span class="meta">${n*10} 平安幣</span></button>`).join("")}</div>
    <p class="note">貓咪一天吃一罐。摸摸 +5、餵罐頭 +20 好感，好感滿 100 就能領養（一次一隻）。領養後要每天餵食、清貓砂（就在我旁邊）、摸摸牠，還可以教牠做動作，最厲害的是後空翻！</p>`); }

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

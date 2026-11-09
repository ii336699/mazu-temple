/* ---- 貓咪骨架: one rigged model (the chair's), a coat picture per cat, and all the moves made in code by turning the bones ----
   The model stands with its body turned about 35° and its face to the front; a fixed turn lines the body up with +z and the head is
   turned back to match. Bones: Spine_0 (back), Head_1 (neck/head), 0_Left/Right_Limb_0-1 (front legs), bone_15-16 (back left),
   bone_18-19 (back right), bone_21-22 (tail). A bone is turned about an axis given in the model's own frame (through its parent's
   rest orientation), so the numbers read as "swing forward / back" whatever each bone's own setup. */
const CAT_FWD=Math.atan2(-.578,.816); /* the way the body points in the model */
const CAT_AX={L:new THREE.Vector3(1,0,0),U:new THREE.Vector3(0,1,0),F:new THREE.Vector3(0,0,1)}; /* (the parents' rest turn already includes the 35° straightening, so the swing axes are the straightened body's own: sideways = x, forward = z) */
function catRigMake(src,tex,face){ const T=THREE;
  const root=new T.Group(), body=new T.Group(), yaw=new T.Group(); root.add(body); body.add(yaw); body.position.y=.3; yaw.position.y=-.3; yaw.rotation.y=-CAT_FWD;
  const m=src.clone(true); yaw.add(m); let sm=null, srcSm=null; m.traverse(o=>{ if(o.isSkinnedMesh) sm=o; }); src.traverse(o=>{ if(o.isSkinnedMesh) srcSm=o; });
  const bones=srcSm.skeleton.bones.map(b=>m.getObjectByName(b.name)); sm.bind(new T.Skeleton(bones,srcSm.skeleton.boneInverses),srcSm.bindMatrix);
  if(tex){ tex.flipY=false; tex.encoding=T.sRGBEncoding; } sm.material=new T.MeshStandardMaterial({map:tex||null,color:tex?0xffffff:0xd9d2c8,roughness:.9,skinning:true}); if(face) catFaceMat(sm.material,face); sm.frustumCulled=false; sm.castShadow=true;
  m.updateMatrixWorld(true); const B={}, rest={};
  bones.forEach(b=>{ const k=b.name.replace(/^tripo/,""); B[k]=b; const pw=new T.Quaternion(); b.parent.getWorldQuaternion(pw); rest[k]={q:b.quaternion.clone(),pw,pwi:pw.clone().invert()}; });
  return {root,body,yaw,mesh:sm,B,rest,P:catRigZero(),tmp:new T.Quaternion(),tq:new T.Quaternion()}; }
function catRigZero(){ return {fl0:0,fl1:0,fr0:0,fr1:0,bl0:0,bl1:0,br0:0,br1:0,fla:0,bla:0,fra:0,bra:0,sp:0,hy:0,hp:0,ty:0,tp:0,t2:0,by:0,rx:0,rz:0}; }
function catRigTurn(c,k,rots){ const r=c.rest[k], b=c.B[k]; if(!b) return; const R=c.tmp.identity(); for(const [ax,a] of rots){ if(a) R.multiply(c.tq.setFromAxisAngle(ax,a)); } b.quaternion.copy(r.pwi).multiply(R).multiply(r.pw).multiply(r.q); }
function catRigApply(c){ const P=c.P, L=CAT_AX.L, U=CAT_AX.U, F=CAT_AX.F; /* (fla/bla/fra/bra: a leg swung in or out sideways, + = away from the body) */
  catRigTurn(c,"0_Left_Limb_0",[[F,P.fla],[L,P.fl0]]); catRigTurn(c,"0_Left_Limb_1",[[L,P.fl1]]); catRigTurn(c,"0_Right_Limb_0",[[F,-P.fra],[L,P.fr0]]); catRigTurn(c,"0_Right_Limb_1",[[L,P.fr1]]);
  catRigTurn(c,"bone_15",[[F,P.bla],[L,P.bl0]]); catRigTurn(c,"bone_16",[[L,P.bl1]]); catRigTurn(c,"bone_18",[[F,-P.bra],[L,P.br0]]); catRigTurn(c,"bone_19",[[L,P.br1]]);
  catRigTurn(c,"Spine_0",[[L,P.sp]]); catRigTurn(c,"Head_1",[[U,P.hy+CAT_FWD],[L,P.hp]]); catRigTurn(c,"bone_21",[[U,P.ty],[L,P.tp]]); catRigTurn(c,"bone_22",[[U,P.ty*.8],[L,P.t2]]);
  c.body.position.y=.3+P.by; c.body.rotation.set(P.rx,0,P.rz); }
/* the moves: each gives the pose t seconds in */
const CAT_ANIM={
  idle:t=>({sp:Math.sin(t*2)*.02,ty:Math.sin(t*1.3)*.3,tp:-.2}),
  sit:t=>({bl0:-1.0,bl1:1.7,br0:-1.0,br1:1.7,fl0:.42,fr0:.42,rx:-.42,by:-.1,hp:.25,ty:Math.sin(t*1.1)*.35+.6,tp:.6,sp:Math.sin(t*2)*.02}),
  walk:t=>{ const p=t*Math.PI*2*1.7, A=.42, lg=(ph,s)=>[-A*Math.sin(ph),s*.55*Math.max(0,Math.cos(ph))]; const [a,b]=lg(p,1),[c2,d]=lg(p+Math.PI,1),[e,f]=lg(p+Math.PI,-1),[g,h]=lg(p,-1);
    return {fl0:a,fl1:b,fr0:c2,fr1:d,bl0:e,bl1:f,br0:g,br1:h,by:Math.abs(Math.cos(p))*.015,ty:Math.sin(p*.5)*.3,tp:-.35,hp:Math.sin(p*2)*.03}; },
  run:t=>{ const p=t*Math.PI*2*2.8, A=.85, s=Math.sin(p); return {fl0:-A*Math.sin(p),fl1:.7*Math.max(0,Math.cos(p)),fr0:-A*Math.sin(p+.5),fr1:.7*Math.max(0,Math.cos(p+.5)),bl0:-A*Math.sin(p+Math.PI),bl1:-.7*Math.max(0,Math.cos(p+Math.PI)),br0:-A*Math.sin(p+Math.PI+.5),br1:-.7*Math.max(0,Math.cos(p+Math.PI+.5)),sp:.18*s,rx:.08*s,by:.05*Math.max(0,s),tp:-.6,ty:Math.sin(p*.5)*.15}; },
  loaf:t=>({fl0:-1.35,fl1:.15,fr0:-1.35,fr1:.15,bl0:-1.1,bl1:2.1,br0:-1.1,br1:2.1,by:-.19,hp:.22,ty:1.1,tp:.9,t2:.6,sp:Math.sin(t*1.4)*.02}),
  side:t=>({rz:1.42,by:-.14,fl0:-.5,fl1:.35,fr0:-.35,fr1:.2,bl0:-.4,bl1:-.25,br0:-.25,br1:-.1,fla:-.62,bla:-.55,fra:.1,bra:.1,hp:.15,ty:.9,tp:.3,sp:Math.sin(t*1.3)*.025}),
  dig:t=>{ const p=t*14; return {rx:.24,by:-.04,fl0:-.55+.55*Math.sin(p),fl1:.7*Math.max(0,Math.cos(p)),fr0:-.55+.55*Math.sin(p+Math.PI),fr1:.7*Math.max(0,Math.cos(p+Math.PI)),bl0:-.25,bl1:-.35,br0:-.25,br1:-.35,hp:.35,tp:-.8,ty:Math.sin(t*6)*.25}; },
  flip:t=>{ const u=Math.min(1,t/1.1), sm=u*u*(3-2*u), up=Math.sin(Math.PI*u); return {rx:-Math.PI*2*sm,by:1.3*up,fl0:-.9*up,fl1:1.1*up,fr0:-.9*up,fr1:1.1*up,bl0:-.7*up,bl1:-1.1*up,br0:-.7*up,br1:-1.1*up,tp:-.5}; },
};
function catRigPose(c,anim,t,k){ const tgt=Object.assign(catRigZero(),(CAT_ANIM[anim]||CAT_ANIM.idle)(t)); const P=c.P; k=k==null?1:k; for(const key in tgt){ if(k>=1||key==="rx"&&anim==="flip") P[key]=tgt[key]; else P[key]+=(tgt[key]-P[key])*k; } catRigApply(c); }

/* the face is drawn on the smooth head by the shader (round eyes with a shine, a pink nose, an ω mouth, whiskers), in the model's rest
   coordinates so it moves with the head. face = {eL, eR, nose, wh} colours. */
const CAT_FACE_GLSL=`
vec3 catFaceCol(vec3 c,vec3 p){ const float FX=-.093; float fx=p.x-FX; if(p.z<.28) return c;
  float wh=0.; for(int s=0;s<2;s++){ float sx=s==0?-1.:1.; for(int k=0;k<3;k++){ float a=(float(k)-1.)*.16; vec2 o=vec2(sx*.085,.545); vec2 d=vec2(sx*cos(a),sin(a)); vec2 q=vec2(fx,p.y)-o; float t=dot(q,d); float e=length(q-d*t); wh=max(wh,(1.-smoothstep(.0016,.0034,e))*step(0.,t)*step(t,.11)); } }
  c=mix(c,uWh,wh*.9);
  float eye=0., hl=0.; vec3 ec=uEL; for(int s=0;s<2;s++){ float sx=s==0?-1.:1.; vec2 e=vec2(fx-sx*.112,p.y-.630); float r=length(e/vec2(.026,.031)); if(r<1.){ eye=max(eye,1.-smoothstep(.82,1.,r)); ec=s==0?uEL:uER; } hl=max(hl,1.-smoothstep(.5,1.,length((e-vec2(.008,.011))/.0085))); }
  eye*=step(.38,p.z); float op=1.-uSleep; c=mix(c,ec,eye*op); c=mix(c,vec3(1.),hl*eye*.95*op);
  float cl=0.; for(int s=0;s<2;s++){ float sx=s==0?-1.:1.; vec2 m=vec2(fx-sx*.112,p.y-.640); float d=abs(length(m/vec2(1.,.8))-.022); cl=max(cl,(1.-smoothstep(.0022,.0042,d))*step(m.y,.0)); }
  c=mix(c,vec3(.2,.12,.09),cl*uSleep*step(.38,p.z)); /* closed eyes: two little ‿ when asleep */
  float nose=(1.-smoothstep(.75,1.,length(vec2(fx,(p.y-.573)*1.25)/.02)))*step(.40,p.z); c=mix(c,uNose,nose);
  float mo=0.; for(int s=0;s<2;s++){ float sx=s==0?-1.:1.; vec2 m=vec2(fx-sx*.0165,p.y-.556); float d=abs(length(m)-.0165); mo=max(mo,(1.-smoothstep(.0018,.0038,d))*step(m.y,0.)); }
  mo=max(mo,(1.-smoothstep(.0018,.0036,abs(fx)))*step(.556,p.y)*step(p.y,.566)); c=mix(c,vec3(.24,.13,.1),mo*step(.40,p.z));
  return c; }`;
function catFaceMat(m,f){ const C=v=>new THREE.Color(v).convertSRGBToLinear();
  m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,{uEL:{value:C(f.eL||"#2a1a12")},uER:{value:C(f.eR||f.eL||"#2a1a12")},uNose:{value:C(f.nose||"#ef9aa4")},uWh:{value:C(f.wh||"#6b4a3a")},uSleep:{value:0}}); m.userData.u=sh.uniforms;
    sh.vertexShader="varying vec3 vCP;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\n vCP=position;");
    sh.fragmentShader="varying vec3 vCP; uniform vec3 uEL,uER,uNose,uWh; uniform float uSleep;\n"+CAT_FACE_GLSL+"\n"+sh.fragmentShader.replace("#include <map_fragment>","#include <map_fragment>\n diffuseColor.rgb=catFaceCol(diffuseColor.rgb,vCP);"); };
  m.customProgramCacheKey=()=>"catface"; }
const CAT_FACES=[{},{},{eL:"#3d7fc8",eR:"#e2a41c"},{},{},{wh:"#e9dccb"},{},{},{wh:"#f2f2f2",eL:"#1a1210"},{},{nose:"#5a3a30",wh:"#e9dccb"}];

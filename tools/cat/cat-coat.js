window.COAT2=`
float h3(vec3 p){ p=fract(p*.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ return vn(p)*.55+vn(p*2.1)*.3+vn(p*4.3)*.15; }
float cell(vec3 p){ vec3 i=floor(p), f=fract(p); float d=9.; for(int a=-1;a<=1;a++)for(int b=-1;b<=1;b++)for(int c=-1;c<=1;c++){ vec3 o=vec3(a,b,c); vec3 r=o+vec3(h3(i+o),h3(i+o+11.),h3(i+o+23.))*.8-f; d=min(d,dot(r,r)); } return sqrt(d); }
const vec3 F=vec3(-.09,.56,.47); const vec3 HC=vec3(-.03,.64,.12);
vec3 coat(vec3 p){
  vec3 q=p+uSeed; float n=fbm(q*5.);
  float fx=p.x-F.x;
  float head=1.-smoothstep(.34,.40,length((p-HC)*vec3(1.,1.05,1.)));
  float ears=smoothstep(.83,.87,p.y);
  float earIn=ears*smoothstep(.225,.25,p.z)*smoothstep(.86,.89,p.y)*(1.-smoothstep(.95,.97,p.y));
  float tail=smoothstep(.14,.18,p.x)*(1.-smoothstep(-.27,-.23,p.z))*smoothstep(.42,.47,p.y)*(1.-head);
  float body=(1.-head)*(1.-tail)*(1.-ears);
  // the light parts of a tabby: lower face, chest, belly, paws
  float mask=head*(1.-smoothstep(.13,.22,length(vec2(fx*1.,(p.y-.53)*1.25))))*smoothstep(.22,.32,p.z);
  float chest=body*(1.-smoothstep(.13,.22,abs(p.x+.02)))*smoothstep(.10,.22,p.z)*smoothstep(.06,.14,p.y);
  float belly=body*(1.-smoothstep(.10,.18,abs(p.x)))*(1.-smoothstep(.13,.2,p.y));
  float paws=1.-smoothstep(.055,.085,p.y);
  float light=clamp(max(max(mask,chest),max(belly,paws)),0.,1.);
  // stripes
  float sb=body*smoothstep(.15,.30,p.y)*smoothstep(.55,.9,sin(p.z*30.+n*4.+uSeed.x))*(1.-chest);
  float sl=body*(1.-smoothstep(.22,.30,p.y))*smoothstep(.09,.13,p.y)*smoothstep(.5,.9,sin(p.y*48.+n*2.))*smoothstep(.12,.2,abs(p.x));
  float sf=head*smoothstep(.70,.76,p.y)*(1.-smoothstep(.13,.17,abs(fx)))*smoothstep(.15,.3,p.z)*smoothstep(.45,.9,sin(fx*62.+1.5));
  float sm=head*smoothstep(.66,.70,p.y)*(1.-smoothstep(.72,.75,p.y))*(1.-smoothstep(.10,.13,abs(fx)))*smoothstep(.3,.36,p.z)*smoothstep(.2,.8,sin(abs(fx)*90.)); // the M
  float sc=head*smoothstep(.17,.22,abs(fx))*(1.-ears)*smoothstep(.5,.9,sin(p.y*42.+n*2.))*smoothstep(.40,.48,p.y);
  float st=tail*smoothstep(.45,.85,sin(p.y*34.));
  float stripes=clamp(sb+sl+sf+sc+st+sm*uM,0.,1.);
  vec3 c=uBase;
  if(uMode==0){ c=mix(uBase,uC2,stripes*.95); c=mix(c,uC3,light); }
  else if(uMode==1){ float a=smoothstep(.50,.54,fbm(q*2.2)), b=smoothstep(.52,.56,fbm(q*2.4+7.)); c=mix(uBase,uC2,a); c=mix(c,uC3,b*(1.-a)); c=mix(c,uBase,max(light,head*(1.-smoothstep(.06,.12,abs(fx)))*smoothstep(.25,.35,p.z)*(1.-smoothstep(.70,.80,p.y)))); }
  else if(uMode==2){ float m=fbm(q*7.); c=mix(uBase,uC2,smoothstep(.42,.58,m)); }
  else if(uMode==3){ float v=head*(1.-smoothstep(.0,.03,abs(fx)-max(0.,(.63-p.y))*1.1-.01))*smoothstep(.25,.35,p.z)*(1.-smoothstep(.63,.66,p.y)); c=mix(uBase,uC3,clamp(max(v,max(chest,max(belly*.0,1.-smoothstep(.08,.12,p.y)))),0.,1.)); c=mix(c,uC3,max(mask*smoothstep(.62,.55,p.y),0.)); }
  else if(uMode==4){ float cap=head*smoothstep(.60,.66,p.y+.05*n)*(1.-(1.-smoothstep(.0,.02,abs(fx)-max(0.,.80-p.y)*.35))*smoothstep(.2,.3,p.z)); float back=body*smoothstep(.30,.36,p.y+.06*n)*(1.-smoothstep(-.05,.05,p.z+.1*n)); float tb=tail*smoothstep(.46,.5,p.y)*(1.-smoothstep(.66,.7,p.y)); c=mix(uBase,uC2,clamp(max(max(cap,ears),max(back,tb)),0.,1.)); }
  else if(uMode==5){ float pt=max(max(ears,tail),1.-smoothstep(.12,.18,p.y)); pt=max(pt,head*(1.-smoothstep(.10,.20,length(vec2(fx,(p.y-.57)*1.1))))*smoothstep(.25,.36,p.z)); c=mix(uBase,uC2,clamp(pt,0.,1.)); }
  else if(uMode==6){ float cd=cell(q*vec3(7.,8.,7.)); float sp=(1.-smoothstep(.30,.38,cd))*body*smoothstep(.10,.18,p.y)*(1.-chest); float ring=sp*smoothstep(.14,.22,cd); float hs=head*(1.-smoothstep(.16,.22,cell(q*13.)))*(1.-mask)*smoothstep(.45,.5,p.y); c=mix(uBase,uC2,clamp(ring*1.2+hs+sf+st+sl,0.,1.)); c=mix(c,mix(uBase,uC2,.35),sp*(1.-ring)); c=mix(c,uC3,light); }
  c*=.94+.12*n;
  c=mix(c,uEarC,earIn*(1.-smoothstep(.0,.02,abs(p.x-(p.x<-.09?-.27:.085))-.032)));
  // face
  float eye=0., hl=0.; for(int k=0;k<2;k++){ float sx=k==0?-1.:1.; vec2 e=p.xy-vec2(F.x+sx*uEye.x,uEye.y); eye=max(eye,1.-smoothstep(.8,1.,length(e/vec2(.03,.03)))); hl=max(hl,1.-smoothstep(.5,1.,length((e-vec2(.009,.01))/.009))); } eye*=step(.42,p.z); hl*=eye;
  c=mix(c,uEyeC,eye); c=mix(c,vec3(1.),hl*.9);
  float nose=(1.-smoothstep(.7,1.,length((p.xy-vec2(F.x,.567))/vec2(.02,.013))))*step(.44,p.z); c=mix(c,uNose,nose);
  float mo=0.; for(int k=0;k<2;k++){ float sx=k==0?-1.:1.; vec2 m=p.xy-vec2(F.x+sx*.017,.552); float d=abs(length(m)-.016); mo=max(mo,(1.-smoothstep(.002,.0045,d))*step(m.y,0.)); }
  mo=max(mo,(1.-smoothstep(.002,.004,abs(fx)))*step(.551,p.y)*step(p.y,.562)); mo*=step(.45,p.z); c=mix(c,vec3(.25,.15,.12),mo);
  return c; }`;
window.coat2=(o)=>{ const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,side:THREE.DoubleSide}); const C=v=>new THREE.Color(v).convertSRGBToLinear();
  m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,{uBase:{value:C(o.base)},uC2:{value:C(o.c2||o.base)},uC3:{value:C(o.c3||"#f3e3c4")},uNose:{value:C(o.nose||"#e8949a")},uEarC:{value:C(o.ear||"#f0a9a8")},uEyeC:{value:C(o.eye||"#1d1412")},uMode:{value:o.mode|0},uM:{value:o.m?1:0},uEye:{value:new THREE.Vector2(.097,.622)},uSeed:{value:new THREE.Vector3(o.seed||0,(o.seed||0)*1.7,(o.seed||0)*2.3)}});
    sh.vertexShader="varying vec3 vCP;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\n vCP=position;");
    sh.fragmentShader="varying vec3 vCP; uniform vec3 uBase,uC2,uC3,uNose,uEarC,uEyeC,uSeed; uniform vec2 uEye; uniform int uMode; uniform float uM;\n"+COAT2+"\n"+sh.fragmentShader.replace("vec4 diffuseColor = vec4( diffuse, opacity );","vec4 diffuseColor = vec4( diffuse*coat(vCP), opacity );"); };
  return m; };
window.OPT=[{mode:0,base:"#eb9441",c2:"#c4601c",c3:"#f7e1bb",seed:1},{mode:0,base:"#9d9b99",c2:"#4b4947",c3:"#f1eeea",m:1,seed:2,nose:"#2a2220"},{mode:0,base:"#9b5b2a",c2:"#4a2610",c3:"#f5e0bf",seed:3,nose:"#2a1a14"},
 {mode:1,base:"#f7f2ea",c2:"#e8862c",c3:"#262120",seed:4},{mode:2,base:"#d5772a",c2:"#241b18",seed:5,nose:"#2a1a14"},{mode:3,base:"#1c1918",c3:"#f6f3ef",seed:6},
 {mode:4,base:"#f8f3eb",c2:"#e9944a",seed:7,nose:"#d98a80"},{mode:5,base:"#f1e5d0",c2:"#5a3a29",seed:8,nose:"#3a2620",ear:"#b27b6e"},{mode:0,base:"#c9c9cc",c2:"#3c3c40",c3:"#fbfbfb",m:1,seed:9,nose:"#3a2a26"},{mode:6,base:"#dc9d4a",c2:"#5a3315",c3:"#f6e1bd",seed:10,nose:"#3a2216"}];

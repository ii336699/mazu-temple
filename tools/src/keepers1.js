/* ---------- 店家老闆 (11/14): every shop has its own people standing at the door with a little counter. Tapping the shop plays a short
   scene — the tackle man hums and fiddles with a rod, the furniture lady dozes and wakes with a start, the breakfast couple bicker — in
   bubbles with a babbling voice pitched for each person (old men low and slow, girls high and quick; a question rises, a shout is
   louder), then the shop's panel or game opens. The full scene plays when you haven't been in for a while; otherwise a quick hello. ---------- */
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
 "tw:herb":{ppl:[{n:"陳伯",v:"oldm",look:[0,18,5,0,1,0,0,7,0,1,0,1,0,1],sh:{leg:.86,tor:.92,w:.96,d:.96,head:1,arm:.94},hunch:.18}],mode:"squint",
   lines:[[0,"嗯……嗯？"],[0,"年輕人，我眼睛看不太清楚，你能不能幫我一起分類這些藥材呢？"]],quick:[[0,"喔，是你啊，又來幫忙啦？"]]},
 "tw:book":{ppl:[{n:"文雄老闆",v:"man",look:[0,26,0,13,6,2,0,0,0,1,0,1,1,1],sh:{leg:1.14,tor:1.06,w:.9,d:.9,head:.98,arm:1.08}}],mode:"stuck",
   lines:[[0,"欸欸，等一下……"],[0,"最近書進貨太多了，我的書架亂七八糟，我都出不去了……能不能幫我一起整理一下呢？"]],quick:[[0,"書架又塞住了，拜託你啦！"]]},
 "tw:ice":{ppl:[{n:"冰淇淋奶奶",v:"oldw",look:[0,22,5,11,7,1,0,1,0,2,1,0,0,1],sh:{leg:.8,tor:.88,w:1.06,d:1.04,head:1.02,arm:.92}}],mode:"wave",spot:{x:38,z:-99.3,ry:0},
   lines:[[0,"小朋友，你要不要來試試看超巨～～～～～～～～～～大冰淇淋呀？加量不加價唷！"]],quick:[[0,"又來啦？今天也要擠得高高的喔！"]]},
 "tw:congee":{ppl:[{n:"阿秀姨",v:"woman",look:[1,14,1,11,3,2,2,0,0,3,1,0,0,2],sh:{leg:.9,tor:.96,w:1.14,d:1.1,head:1,arm:.98}}],mode:"panic",
   lines:[[0,"糟糕了糟糕了……"],[0,"一忙就記不住大家的菜單怎麼辦……@NAME，你能不能來幫幫我？"]],quick:[[0,"@NAME！又滿桌了，快來幫我記！"]]},
 "tw:flower":{ppl:[{n:"雅琪老師",v:"woman",look:[0,23,0,14,7,3,15,15,1,4,1,3,0,2],sh:{leg:1.12,tor:1.04,w:.88,d:.88,head:.98,arm:1.06}}],mode:"grace",
   lines:[[0,"你是要來學插花的嗎？請進。"]],quick:[[0,"歡迎，今天的花很漂亮喔。"]]},
 "tw:drink":{ppl:[{n:"小安",v:"girl",look:[0,5,11,3,5,3,4,2,0,3,0,0,0,1],sh:{leg:1.02,tor:.98,w:.92,d:.92,head:1.04,arm:1}},{n:"阿哲",v:"boy",look:[1,25,0,3,5,3,4,1,0,2,0,6,0,1],sh:{leg:1.08,tor:1.02,w:1,d:.98,head:1,arm:1.02}}],mode:"cheer",
   lines:[[-1,"歡迎光臨！珍奶第二杯半價喔！"],[-1,"要不要加入我們的工作行列啊？當然老闆會給薪水的！"]],quick:[[-1,"歡迎光臨～！"]]},
 "tw:beauty":{ppl:[{n:"設計師 Kevin",v:"man",look:[0,27,9,1,0,5,0,10,0,3,0,0,2,1],sh:{leg:1.12,tor:1.04,w:.92,d:.9,head:.98,arm:1.04}}],mode:"pose",
   lines:[[0,"您好，請問有預約、有指定設計師嗎？"]],quick:[[0,"今天想換什麼風格呢？"]]},
};
const KS={}; /* the keepers standing at their shops: key → {avs, spot, t, mode, until, last} */
function keepSpot(k){ const K=KEEP[k]; if(K.spot) return K.spot; const b=TOWNX&&TOWNX.bOf?TOWNX.bOf(k):null; if(!b) return null; const fx=Math.sin(b.ry), fz=Math.cos(b.ry); return {x:b.x+fx*.35,z:b.z+fz*.35,ry:b.ry,fx,fz,shop:1}; }
function keepMake(k){ const K=KEEP[k], sp=keepSpot(k); if(!sp) return null; const n=K.ppl.length, px=Math.cos(sp.ry), pz=-Math.sin(sp.ry), avs=[];
  K.ppl.forEach((P,i)=>{ const off=n>1?(i-(n-1)/2)*1.1:0, x=sp.x+px*off, z=sp.z+pz*off; const look=sanitizeLook(P.look.slice()); const av=new Avatar(look,{npc:true,x,z,r:sp.ry}); av.isMe=true; try{ av.setLook(look); }finally{ av.isMe=false; } av.setName(P.n); av.moveSpeed=0; av.rotY=sp.ry; av.faceGoal=sp.ry; bodyShape(av,P.sh);
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
    S.avs.forEach((av,i)=>{ av.pos.set(av.root.position.x,av.root.position.z); av.target.copy(av.pos); try{ av.update(dt); }catch(e){} const H=av.head, A=av.arms, P=av._P||{};
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
    if(S.mode!=="argue") S.avs.forEach(av=>{ av.root.rotation.y=S.sp.ry; }); } }
/* spawn the keepers of shops near you (so the street looks lived in) */
let keepAcc=0; function keepNear(dt){ keepAcc+=dt; if(keepAcc<1) return; keepAcc=0; if(!(TOWNX&&TOWNX.on)) return; const p=meAv.pos; for(const k in KEEP){ if(KS[k]) continue; const sp=keepSpot(k); if(sp&&Math.hypot(p.x-sp.x,p.y-sp.z)<38){ keepMake(k); break; } } }
L.tick6=dt=>{ try{ keepNear(dt); keepTick(dt); }catch(e){ console.warn("keepers",e); } if(L.tick7) L.tick7(dt); };
L.keepers=()=>KS;

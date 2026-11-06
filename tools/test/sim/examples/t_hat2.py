E('closeSheet(); document.body.classList.add("hideui"); loadRaw0("hats",false,m=>{ SHARED.hats={m,q:[]}; },()=>{})')
for k in range(20):
  time.sleep(2)
  if E("!!(SHARED.hats&&SHARED.hats.m)"): break
N=["hat_crown","hat_guanmao","hat_douli","hat_peach","hat_catbell","hat_tiger","hat_witch","hat_jasmine","hat_fu","hat_fox"]
for i,n in enumerate(N):
  E(f'meAv.pos.set(6,30); meAv.target.set(6,30); meAv.rotY=Math.PI*({i}%2?.25:.75); meAv.faceGoal=null; meAv.setAcc(["{n}",0,0,0]); camYaw=0; camPitch=.12; camDist=4'); time.sleep(4)
  pg.screenshot(path=f'{S}/hs{i}.png')

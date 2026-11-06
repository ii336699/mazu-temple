E('fwGodsLoad(); todPhase=()=>({night:1,day:0}); closeSheet(); FW.seed=0; fwStart(9292,0,3,"")'); time.sleep(4)
E('FWV=2; trainTo(true,FW_SPOTS[1])'); time.sleep(6); E('document.body.classList.add("hideui")')
for name,T in [('a',35.5),('b',150)]:
  E(f'(()=>{{ fwA.fill(0); FW.rockets.length=0; FW.wheels.length=0; FW.gerbs.length=0; FW.sweeps=[]; FW.fanjets=[]; FW.i=0; FW.t0=performance.now()-{T}*1000; while(FW.i<FW.ev.length&&FW.ev[FW.i].t<{T}-.1) FW.i++; for(let k=0;k<100;k++){{ FW.t0-=1000/30; fwUpdate(1/30); }} }})()'); time.sleep(3); pg.screenshot(path=f'{S}/lk{name}.png')
print(E('JSON.stringify([LAKE.on, LAKE.fwMirror.visible, window.__errs])'))

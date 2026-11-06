import sys
pre=sys.argv[3]
E('fwGodsLoad()'); time.sleep(4); E('todPhase=()=>({night:1,day:0}); closeSheet(); FW.seed=0; fwStart(9292,0,3,"")'); time.sleep(3)
E('$("#fwViewBtn").click()'); time.sleep(4); E('document.body.classList.add("hideui")')
for name,T in [('a',163.4),('b',169.9),('c',176.4)]:
  E(f'(()=>{{ fwA.fill(0); FW.rockets.length=0; FW.wheels.length=0; FW.gerbs.length=0; FW.sweeps=[]; FW.i=0; FW.t0=performance.now()-{T}*1000; while(FW.i<FW.ev.length&&FW.ev[FW.i].t<{T}-.1) FW.i++; for(let k=0;k<110;k++){{ FW.t0-=1000/30; fwUpdate(1/30); }} }})()'); print(name,E("(()=>{ let n=0; for(let i=0;i<FWN;i++) if(fwA[i]>0) n++; return n+\" \"+FW.on+\" \"+fwStreak.visible+\" \"+FW.rockets.length; })()")); time.sleep(3); pg.screenshot(path=f"{S}/{pre}{name}.png")
print(E('JSON.stringify(window.__errs)'))

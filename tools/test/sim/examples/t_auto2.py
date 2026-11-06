E('closeSheet(); bag.coins=500; bag.planted=[]; bag.flow={}; bag.bowed={}; bag.stuck=null; delete bag.items.fu; saveBag(); const og=goStation; goStation=k=>{ const s=stations[k]; meAv.pos.set(s.approach.x,s.approach.y); meAv.target.set(s.approach.x,s.approach.y); meAv.path=[]; og(k); }; fuAnims.forEach(f=>f.dur=.5)'); time.sleep(2)
E('const op=passFu; passFu=(a,k,d)=>op(a,k,.6); $("#autoBtn").click()')
for k in range(14):
  time.sleep(12); print(E('JSON.stringify([$("#autoBtn").textContent,(bag.planted||[]).length,bag.items.xiang,bag.items.fu,bag.fuGuo,bag.coins,JSON.stringify(bag.flow),window.__errs.length])'))

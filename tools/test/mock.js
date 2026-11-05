<script>
/* 單機測試版：在瀏覽器裡假裝伺服器，資料只存在這台裝置。正式版不會有這段。 */
(function(){
  window.MZ_SIM=true; /* tells the page to use the simulated character server below */
  var NS="mzt.", TTL=864e5;
  function get(k,d){ try{ var v=localStorage.getItem(NS+k); return v?JSON.parse(v):d; }catch(e){ return d; } }
  function put(k,v){ try{ localStorage.setItem(NS+k,JSON.stringify(v)); }catch(e){} }
  function J(o,s){ return new Response(JSON.stringify(o),{status:s||200,headers:{"content-type":"application/json"}}); }
  var real=window.fetch.bind(window);
  window.fetch=async function(input,init){
    init=init||{}; var u; try{ u=new URL(typeof input==="string"?input:input.url,location.href); }catch(e){ return real(input,init); }
    var p=u.pathname, isApi=/^\/(lb|me|me\/claim|gift|gifts|halls|board|msg|msgs|reply|letters|stage|puppet|crowd|market|nmrec|announce|fireworks|lanterns|zhan|lamps|lamp|wishes|wish)$/.test(p);
    if(!isApi) return real(input,init);
    var method=(init.method||"GET").toUpperCase(), h=init.headers||{}, key=String(h["x-key"]||h["X-Key"]||"").trim();
    var body={}; try{ body=JSON.parse(init.body||"{}"); }catch(e){}
    var now=Date.now();
    /* 角色存檔：每台「手機」有一個 uid（正式版是伺服器發的 cookie）；按畫面下方的測試徽章可以模擬換手機 */
    var uid=get("uid",""); if(!uid){ uid=Math.random().toString(16).slice(2,14); put("uid",uid); }
    switch(p){
      case "/lb": { var gg=method==="POST"?body.g:u.searchParams.get("g");
        if(gg==="wenchang"){ var W2=get("lb:wenchang:c",[]); if(method==="POST"){ var s2=Math.round(+body.s), a2=Math.round(+body.a), t2=Math.round(+body.t||0); if(s2>=0&&s2<=1240){ var c2=null; W2.forEach(function(e){ if(e.id===body.id) c2=e; }); if(!c2) W2.push({id:body.id,name:body.name||"香客",s:s2,a:a2,t:t2,at:now}); else if(s2>c2.s||(s2===c2.s&&t2<c2.t)){ c2.s=s2; c2.a=a2; c2.t=t2; c2.at=now; }
          W2.sort(function(a,c){ return c.s-a.s||a.t-c.t; }); W2=W2.slice(0,20); put("lb:wenchang:c",W2); } } return J({ok:true,top:W2.slice(0,10)}); }
        var L=get("lb:"+gg,[]);
        if(method==="POST"){ var tt=Math.round(+body.t||0); if(tt>=1500){ var cu=null; L.forEach(function(e){ if(e.id===body.id) cu=e; }); if(!cu) L.push({id:body.id,name:body.name||"香客",t:tt,at:now}); else if(tt<cu.t){ cu.t=tt; cu.at=now; cu.name=body.name||cu.name; }
          L.sort(function(a,c){ return a.t-c.t||a.at-c.at; }); L=L.slice(0,20); put("lb:"+gg,L); } }
        return J({ok:true,top:L.slice(0,10)}); }
      case "/me": { var P=get("P:"+uid,null);
        if(method!=="POST") return J({ok:true,p:P?{code:P.code,snap:P.snap}:null});
        var snap=String(body.snap||""); if(!/^MZ-[A-Za-z0-9_-]{10,900}$/.test(snap)) return J({ok:false});
        P=P||{}; if(!P.code){ var AB="23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; do{ P.code=""; for(var i=0;i<7;i++) P.code+=AB[(Math.random()*AB.length)|0]; }while(get("C:"+P.code,null)); put("C:"+P.code,uid); }
        P.snap=snap; P.at=now; if(body.id){ P.id=String(body.id); put("I:"+P.id,uid); } put("P:"+uid,P); return J({ok:true,code:P.code}); }
      case "/me/claim": { var code=String(body.code||"").toUpperCase().replace(/[^0-9A-Z]/g,"").slice(0,7), owner=code.length===7?get("C:"+code,null):null, OP=owner?get("P:"+owner,null):null;
        if(!OP) return J({ok:false}); put("uid",owner); return J({ok:true,switchTo:owner,p:{code:OP.code,snap:OP.snap}}); }
      case "/gift": { if(!key) return J({ok:false}); var to=body.to==="me"?uid:get("I:"+String(body.to||""),null); if(!to) return J({ok:false,nouser:true});
        var G=get("G:"+to,[]); G.push({g:Math.random().toString(36).slice(2,10),kind:body.kind,k:body.k||"",n:body.n|0||1,from:body.from||"主委",at:now}); put("G:"+to,G.slice(-30)); return J({ok:true}); }
      case "/gifts": { var GG=get("G:"+uid,[]); put("G:"+uid,[]); return J({ok:true,gifts:GG}); }
      case "/market": { var st=get("market",{open:{}}); if(method==="POST"){ if(!key) return J({ok:false}); var K=["qq","sausage","bbq","fish","pachinko","boba","balloon"]; if(body.all!=null) K.forEach(function(k,i){ if(body.all) st.open[k]=st.open[k]||now+i; else delete st.open[k]; }); else if(K.indexOf(body.k)>=0){ if(body.on) st.open[body.k]=now; else delete st.open[body.k]; } put("market",st); return J(Object.assign({ok:true},st)); } return J(st); }
      case "/nmrec": { var st=get("market",{open:{}}), all=get("nmrec",{}), LOW={bbq:1,boba:1,balloon:1};
        if(method==="POST"){ var k=String(body.k||""), v=Number(body.v); if(!st.open[k]||!(v>0)) return J({ok:false}); var r=all[k]; if(!r||r.s!==st.open[k]) r=all[k]={s:st.open[k],list:[]};
          var cur=r.list.filter(function(e){return e.id===body.id;})[0]; if(!cur) r.list.push({id:body.id,name:body.name,v:v,at:now}); else if(LOW[k]?v<cur.v:v>cur.v){ cur.v=v; cur.name=body.name; }
          r.list.sort(function(a,c){ return LOW[k]?a.v-c.v:c.v-a.v; }); r.list=r.list.slice(0,10); put("nmrec",all); return J({ok:true}); }
        var kk=u.searchParams.get("k"), rr=all[kk]; return J({list:rr&&st.open[kk]&&rr.s===st.open[kk]?rr.list:[]}); }
      case "/halls": return J({error:"單機測試版沒有大殿伺服器"},503);
      case "/board": if(method==="POST"){ if(!key) return J({ok:false}); var b={text:String(body.text||"").trim().slice(0,1000),at:now}; put("board",b); return J(Object.assign({ok:true},b)); } return J(get("board",{text:"",at:0}));
      case "/msg": { var m=get("msgs",[]); var it={name:body.name||"香客",text:String(body.text||""),at:now}; if(body.id) it.id=body.id; m.unshift(it); put("msgs",m); return J({ok:true}); }
      case "/msgs": return key?J({ok:true,msgs:get("msgs",[])}):J({ok:false});
      case "/reply": { if(!key) return J({ok:false}); var ms=get("msgs",[]), x=null; for(var i=0;i<ms.length;i++) if(ms[i].at===Number(body.at)) x=ms[i]; if(!x||!x.id) return J({ok:false,noid:true});
        var t=String(body.text||"").trim().slice(0,500); x.reply={text:t,at:now}; put("msgs",ms); var box=get("L:"+x.id,[]).filter(function(l){ return now-l.at<TTL; }); box.unshift({at:now,text:t,q:x.text.slice(0,80)}); put("L:"+x.id,box.slice(0,10)); return J({ok:true}); }
      case "/letters": { var id=u.searchParams.get("id")||""; var bx=get("L:"+id,[]).filter(function(l){ return now-l.at<TTL; }); if(method==="POST"&&u.searchParams.get("del")==="1"){ var at=Number(u.searchParams.get("at")); bx=bx.filter(function(l){ return l.at!==at; }); } put("L:"+id,bx); return J({letters:bx,ttl:TTL}); }
      case "/puppet": if(method==="POST"){ if(!key) return J({ok:false}); var pv=get("puppet",{on:false,at:0}); var ps={on:!!body.on,at:(body.on&&pv.on)?pv.at:now,text:String(body.text||"").slice(0,24),name:String(body.name||"").slice(0,8)}; put("puppet",ps); return J(Object.assign({ok:true},ps)); } return J(get("puppet",{on:false,at:0,text:""}));
      case "/stage": if(method==="POST"){ if(!key) return J({ok:false}); var sp0=get("stage",{on:false,at:0}); var st={on:!!body.on,at:(body.on&&sp0.on)?sp0.at:now,name:String(body.name||"").slice(0,8),cats:body.cats!==false}; put("stage",st); return J(Object.assign({ok:true},st)); } return J(get("stage",{on:false,at:0}));
      case "/crowd": if(method==="POST"){ if(!key) return J({ok:false}); var c={target:body.real?0:(body.target==null?null:Math.max(0,Math.min(900,Math.round(+body.target||0)))),from:Math.round(+body.from||0),at:now,real:!!body.real}; put("crowd",c); return J(Object.assign({ok:true},c)); } return J(get("crowd",{target:null,from:null,at:0}));
      case "/lamps": return J({lit:[]});
      case "/wishes": return J({wishes:get("wishes",[])});
      case "/wish": { var w=get("wishes",[]); w.unshift({name:body.name||"香客",text:String(body.text||""),at:now}); put("wishes",w.slice(0,300)); return J({ok:true}); }
    }
    return J({ok:false},404);
  };
  // 單人模式：不連到任何共用的多人伺服器
  var ap=Node.prototype.appendChild;
  Node.prototype.appendChild=function(n){ if(n&&n.tagName==="SCRIPT"&&/supabase/.test(n.src||"")){ setTimeout(function(){ n.onerror&&n.onerror(new Event("error")); },0); return n; } return ap.call(this,n); };
  /* 模擬換手機：清掉這台的角色、背包和裝置編號（伺服器那份留著），重新整理後就像一支新手機，可以用取回碼找回角色 */
  function newPhone(){ if(!confirm("模擬換一支新手機？\n這台的角色、背包會清掉，重新整理後輸入取回碼就能找回。")) return;
    try{ var ks=[]; for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(k&&k.indexOf("mz.")===0) ks.push(k); } ks.forEach(function(k){ localStorage.removeItem(k); }); }catch(e){}
    put("uid",Math.random().toString(16).slice(2,14)); location.reload(); }
  addEventListener("DOMContentLoaded",function(){ var t=document.createElement("div"); t.textContent="🧪 單機測試版";
    t.style.cssText="position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 4px);transform:translateX(-50%);z-index:30;font:600 10px/1 system-ui,sans-serif;color:#ffe9a8;background:rgba(80,20,10,.75);border:1px solid rgba(230,184,100,.5);border-radius:999px;padding:3px 8px;letter-spacing:.05em;cursor:pointer"; t.title="按一下：模擬換手機"; t.textContent+="・📱換手機"; t.style.whiteSpace="nowrap"; t.onclick=newPhone;
    document.body.appendChild(t); });
})();
</script>

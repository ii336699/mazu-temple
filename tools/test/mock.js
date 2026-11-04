<script>
/* 單機測試版：在瀏覽器裡假裝伺服器，資料只存在這台裝置。正式版不會有這段。 */
(function(){
  var NS="mzt.", TTL=864e5;
  function get(k,d){ try{ var v=localStorage.getItem(NS+k); return v?JSON.parse(v):d; }catch(e){ return d; } }
  function put(k,v){ try{ localStorage.setItem(NS+k,JSON.stringify(v)); }catch(e){} }
  function J(o,s){ return new Response(JSON.stringify(o),{status:s||200,headers:{"content-type":"application/json"}}); }
  var real=window.fetch.bind(window);
  window.fetch=async function(input,init){
    init=init||{}; var u; try{ u=new URL(typeof input==="string"?input:input.url,location.href); }catch(e){ return real(input,init); }
    var p=u.pathname, isApi=/^\/(halls|board|msg|msgs|reply|letters|stage|puppet|crowd|market|nmrec|announce|fireworks|lanterns|zhan|lamps|lamp|wishes|wish)$/.test(p);
    if(!isApi) return real(input,init);
    var method=(init.method||"GET").toUpperCase(), h=init.headers||{}, key=String(h["x-key"]||h["X-Key"]||"").trim();
    var body={}; try{ body=JSON.parse(init.body||"{}"); }catch(e){}
    var now=Date.now();
    switch(p){
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
      case "/puppet": if(method==="POST"){ if(!key) return J({ok:false}); var pv=get("puppet",{on:false,at:0}); var ps={on:!!body.on,at:(body.on&&pv.on)?pv.at:now,text:String(body.text||"").slice(0,24)}; put("puppet",ps); return J(Object.assign({ok:true},ps)); } return J(get("puppet",{on:false,at:0,text:""}));
      case "/stage": if(method==="POST"){ if(!key) return J({ok:false}); var st={on:!!body.on,at:now}; put("stage",st); return J(Object.assign({ok:true},st)); } return J(get("stage",{on:false,at:0}));
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
  addEventListener("DOMContentLoaded",function(){ var t=document.createElement("div"); t.textContent="🧪 單機測試版";
    t.style.cssText="position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 4px);transform:translateX(-50%);z-index:30;font:600 10px/1 system-ui,sans-serif;color:#ffe9a8;background:rgba(80,20,10,.75);border:1px solid rgba(230,184,100,.5);border-radius:999px;padding:3px 8px;pointer-events:none;letter-spacing:.05em";
    document.body.appendChild(t); });
})();
</script>

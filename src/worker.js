// 雲端天后宮 multiplayer: one Durable Object per hall relays player state over WebSockets.
// Outgoing WebSocket messages are free; incoming ones are billed at 20:1, so the server only relays.
import { DurableObject } from "cloudflare:workers";

const HALLS = 10, CAP = 100, MAX_MSG = 4000;
const MEMO = new Map(), MEMO_TTL = { "/halls": 8000, "/lamps": 60000, "/wishes": 30000, "/board": 30000, "/stage": 5000, "/puppet": 5000, "/crowd": 5000, "/market": 5000, "/layout": 5000 };
const LOBBY_PATHS = ["/lamps", "/lamp", "/wishes", "/wish", "/msg", "/msgs", "/announce", "/fireworks", "/zhan", "/lanterns", "/board", "/reply", "/letters", "/stage", "/puppet", "/crowd", "/market", "/nmrec", "/hongbao", "/hbclaim", "/layout"];
const MEMO_OF = { "/lamp": "/lamps", "/wish": "/wishes", "/board": "/board", "/stage": "/stage", "/puppet": "/puppet", "/crowd": "/crowd", "/market": "/market", "/layout": "/layout" }; // a POST here makes that cached list stale

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/ws" || url.pathname === "/halls" || LOBBY_PATHS.includes(url.pathname) || PROFILE_PATHS.includes(url.pathname)) {
      try { return await api(req, env, url); }
      catch (e) { return new Response(JSON.stringify({ error: String(e && e.message || e).slice(0, 300) }), { status: 503, headers: { "content-type": "application/json", "cache-control": "no-store" } }); }
    }
    return env.ASSETS.fetch(req);
  }
};

// 角色存檔 and 主委送禮. A long-lived cookie (set by this server, so Safari keeps it) names each player's saved character;
// the lobby keeps the save, a short 取回碼 for moving to another app or phone, and any gifts waiting to be opened.
const PROFILE_PATHS = ["/me", "/me/claim", "/gift", "/gifts"];
async function profile(req, env, url) {
  const m = (req.headers.get("cookie") || "").match(/(?:^|;\s*)mzu=([a-f0-9]{24,40})/); let uid = m ? m[1] : "";
  if (!uid) uid = crypto.randomUUID().replace(/-/g, "");
  const lobby = env.LOBBY.get(env.LOBBY.idFromName("lobby"));
  const r = await lobby.fetch(new Request("https://lobby" + url.pathname, { method: req.method, headers: { "content-type": "application/json", "x-uid": uid, "x-key": req.headers.get("x-key") || "", "x-ip": req.headers.get("cf-connecting-ip") || "" }, body: req.method === "POST" ? await req.text() : undefined }));
  let body = await r.text(); try { const j = JSON.parse(body); if (j && j.switchTo) { uid = j.switchTo; delete j.switchTo; body = JSON.stringify(j); } } catch {}
  return new Response(body, { status: r.status, headers: { "content-type": "application/json", "cache-control": "no-store", "set-cookie": `mzu=${uid}; Max-Age=34560000; Path=/; HttpOnly; Secure; SameSite=Lax` } });
}

async function api(req, env, url) {
    if (PROFILE_PATHS.includes(url.pathname)) return profile(req, env, url);
    if (url.pathname === "/ws") {
      if (req.headers.get("Upgrade") !== "websocket") return new Response("expected websocket", { status: 426 });
      const h = Math.max(0, Math.min(HALLS - 1, parseInt(url.searchParams.get("hall") || "0", 10) || 0));
      return env.HALL.get(env.HALL.idFromName("hall-" + h)).fetch(req);
    }
    // Shared read-only lists are cached in this worker's memory so thousands of players don't each wake the Durable Object.
    if (req.method === "GET" && MEMO_TTL[url.pathname]) {
      const m = MEMO.get(url.pathname);
      if (m && Date.now() - m.at < MEMO_TTL[url.pathname]) return new Response(m.body, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }
    if (LOBBY_PATHS.includes(url.pathname)) {
      if (req.method === "POST" && MEMO_OF[url.pathname]) MEMO.delete(MEMO_OF[url.pathname]);
      const lobby = env.LOBBY.get(env.LOBBY.idFromName("lobby"));
      const r = await lobby.fetch(new Request("https://lobby" + url.pathname + url.search, { method: req.method, headers: req.headers, body: req.method === "POST" ? await req.text() : undefined }));
      const body = await r.text(); if (req.method === "GET" && r.ok && MEMO_TTL[url.pathname]) MEMO.set(url.pathname, { at: Date.now(), body });
      return new Response(body, { status: r.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }
    if (url.pathname === "/halls") {
      const r = await env.LOBBY.get(env.LOBBY.idFromName("lobby")).fetch("https://lobby/counts");
      const body = await r.text(); if (r.ok) MEMO.set("/halls", { at: Date.now(), body });
      return new Response(body, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }
    return env.ASSETS.fetch(req);
}

export class Hall extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.env = env; }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/fireworks") { // from the lobby: everyone here starts the same seeded 3-minute show
      let b = {}; try { b = await req.json(); } catch {}
      const fw = { seed: (b.seed | 0) >>> 0, at: Date.now() }; await this.ctx.storage.put("fw", fw);
      const out = JSON.stringify({ t: "fw", seed: fw.seed, el: 0 }); for (const w of this.ctx.getWebSockets()) { try { w.send(out); } catch {} } return new Response("ok");
    }
    if (url.pathname === "/lanterns") { let b = {}; try { b = await req.json(); } catch {} const out = JSON.stringify({ t: "sl50", seed: (b.seed | 0) >>> 0 }); for (const w of this.ctx.getWebSockets()) { try { w.send(out); } catch {} } return new Response("ok"); }
    if (url.pathname === "/announce") { // from the lobby: push the chair's announcement to everyone in this hall
      let b = {}; try { b = await req.json(); } catch {}
      const ann = { t: "ann", text: String(b.text || "").slice(0, 80), at: Number(b.at) || Date.now() }; if (Number.isInteger(b.h) && b.h >= 0 && b.h < HALLS) ann.h = b.h; await this.ctx.storage.put("ann", ann);
      const out = JSON.stringify(ann); for (const w of this.ctx.getWebSockets()) { try { w.send(out); } catch {} } return new Response("ok");
    }
    if (url.pathname === "/giftping") { // from the lobby: a gift is waiting for this player; their page fetches it
      let b = {}; try { b = await req.json(); } catch {} const to = String(b.to || "").replace(/[^a-z0-9]/g, "").slice(0, 16);
      if (to) for (const w of this.ctx.getWebSockets(to)) { try { w.send(JSON.stringify({ t: "gift" })); } catch {} } return new Response("ok");
    }
    if (url.pathname === "/layout") { // from the lobby: the chair saved a new building layout; pages fetch it again
      const out = JSON.stringify({ t: "layout", at: Date.now() }); for (const w of this.ctx.getWebSockets()) { try { w.send(out); } catch {} } return new Response("ok");
    }
    if (url.pathname === "/hongbao") { // from the lobby: 財神爺 throws a handful of red envelopes; every screen drops the same ones
      let b = {}; try { b = await req.json(); } catch {}
      const out = JSON.stringify({ t: "hb", id: String(b.id || "").slice(0, 16), seed: (b.seed | 0) >>> 0, n: b.n | 0, x: Number(b.x) || 0, z: Number(b.z) || 0, at: Number(b.at) || Date.now() });
      for (const w of this.ctx.getWebSockets()) { try { w.send(out); } catch {} } return new Response("ok");
    }
    if (url.pathname === "/market") { // from the lobby: the chair opened or closed night-market stalls
      let b = {}; try { b = await req.json(); } catch {}
      const out = JSON.stringify({ t: "market", open: b.open || {} }); for (const w of this.ctx.getWebSockets()) { try { w.send(out); } catch {} } return new Response("ok");
    }
    if (url.pathname === "/puppet") { // from the lobby: the chair put the 布袋戲 stage out, changed its banner, or packed it away
      let b = {}; try { b = await req.json(); } catch {}
      const st = { t: "puppet", on: !!b.on, at: Number(b.at) || Date.now(), text: String(b.text || "").slice(0, 24), name: String(b.name || "").slice(0, 8) }; await this.ctx.storage.put("puppet", st);
      const out = JSON.stringify(st); for (const w of this.ctx.getWebSockets()) { try { w.send(out); } catch {} } return new Response("ok");
    }
    if (url.pathname === "/stage") { // from the lobby: the chair put the opera stage out or packed it away
      let b = {}; try { b = await req.json(); } catch {}
      const st = { t: "stage", on: !!b.on, at: Number(b.at) || Date.now(), name: String(b.name || "").slice(0, 8), cats: b.cats !== false }; await this.ctx.storage.put("stage", st);
      const out = JSON.stringify(st); for (const w of this.ctx.getWebSockets()) { try { w.send(out); } catch {} } return new Response("ok");
    }
    const h = Math.max(0, Math.min(HALLS - 1, parseInt(url.searchParams.get("hall") || "0", 10) || 0));
    const id = (url.searchParams.get("id") || "").replace(/[^a-z0-9]/g, "").slice(0, 16) || crypto.randomUUID().slice(0, 12);
    // the same player reconnecting (bad signal, phone woke up) replaces their old connection, so nobody is counted twice
    for (const old of this.ctx.getWebSockets(id)) { const a = old.deserializeAttachment() || {}; a.gone = 1; a.u = 0; try { old.serializeAttachment(a); } catch {} try { old.close(4001, "replaced"); } catch {} }
    const active = this.liveCount();
    const pair = new WebSocketPair(); const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server, [id]);
    server.serializeAttachment({ id, h, p: null, u: 1, at: Date.now() });
    if (active >= CAP) { server.send(JSON.stringify({ t: "full" })); server.close(4000, "full"); return new Response(null, { status: 101, webSocket: client }); }
    // send everyone already here to the newcomer
    const peers = [];
    for (const w of this.ctx.getWebSockets()) { if (w === server) continue; const a = w.deserializeAttachment() || {}; if (a.p && !a.gone) peers.push({ id: a.id, p: a.p }); }
    server.send(JSON.stringify({ t: "hello", peers }));
    const ann = await this.ctx.storage.get("ann"); if (ann && Date.now() - ann.at < 5 * 60 * 1000) server.send(JSON.stringify(ann));
    const stage = await this.ctx.storage.get("stage"); if (stage && stage.on) server.send(JSON.stringify(stage));
    const puppet = await this.ctx.storage.get("puppet"); if (puppet && puppet.on) server.send(JSON.stringify(puppet));
    const fw = await this.ctx.storage.get("fw"); if (fw && Date.now() - fw.at < 218000) server.send(JSON.stringify({ t: "fw", seed: fw.seed, el: Date.now() - fw.at }));
    this.report(h);
    return new Response(null, { status: 101, webSocket: client });
  }
  async webSocketMessage(ws, msg) {
    if (typeof msg !== "string" || msg.length > MAX_MSG) return;
    let m; try { m = JSON.parse(msg); } catch { return; }
    if (!m || m.t !== "st" || typeof m.p !== "object" || !m.p) return;
    const a = ws.deserializeAttachment() || {};
    const p = m.p; const u = p.u === 0 ? 0 : 1; const was = a.u;
    const s = JSON.stringify(p);
    if (a.gone) return;
    a.p = s.length < 1900 ? p : null; a.u = u; a.at = Date.now(); ws.serializeAttachment(a);
    const out = JSON.stringify({ t: "st", id: a.id, p });
    for (const w of this.ctx.getWebSockets()) { if (w !== ws) { try { w.send(out); } catch {} } }
    if (was !== u || Date.now() - (this.swept || 0) > 30000) this.report(a.h);
  }
  async webSocketClose(ws) { this.leave(ws); }
  async webSocketError(ws) { this.leave(ws); }
  leave(ws) {
    const a = ws.deserializeAttachment() || {};
    if (a.gone) { try { ws.close(1000, "bye"); } catch {} this.report(a.h); return; } // replaced by a newer connection: that player is still here
    const out = JSON.stringify({ t: "leave", id: a.id });
    for (const w of this.ctx.getWebSockets()) { if (w !== ws) { try { w.send(out); } catch {} } }
    try { ws.close(1000, "bye"); } catch {}
    this.report(a.h);
  }
  // a phone that was locked or lost signal can leave its connection hanging open without ever saying goodbye; every
  // player sends a heartbeat at least once a minute, so anyone silent for 3 minutes is gone — they are removed and not counted
  sweep() {
    const now = Date.now(); this.swept = now;
    for (const w of this.ctx.getWebSockets()) { const a = w.deserializeAttachment() || {}; if (!a.gone && now - (a.at || now) > 180000) this.leave(w); }
  }
  // real people here: one per player, only connections that are open, not hidden, and heard from in the last 3 minutes
  liveCount() {
    const now = Date.now(), ids = new Set();
    for (const w of this.ctx.getWebSockets()) { const a = w.deserializeAttachment() || {}; if (a.gone || a.u === 0 || w.readyState !== 1 || now - (a.at || now) > 180000) continue; ids.add(a.id); }
    return ids.size;
  }
  // Head-count updates to the lobby are batched: at most one every 5 seconds, and only when the number changed.
  report(h) {
    this.h = h | 0; if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.sweep(); const n = this.liveCount();
      if (n === this.lastN) return; this.lastN = n;
      this.env.LOBBY.get(this.env.LOBBY.idFromName("lobby")).fetch("https://lobby/set?h=" + this.h + "&n=" + n).catch(() => {});
    }, 5000);
  }
}

const LAMPS = 140;
const clean = (t, n) => String(t || "").replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff<>]/g, "").replace(/\s+/g, " ").trim().slice(0, n);
const addsLine = t => /(加|\+|十|＋)(賴|赖|line|ㄌㄞ)/i.test(String(t || "").normalize("NFKC").replace(/[\s._\-~*·・、，,。]/g, "")); // 加賴 / +賴 is refused everywhere
const looksLikeAd = t => addsLine(t) || /(https?:|www\.|\.com|\.tw|line|@)/i.test(t) || (t.match(/\d/g) || []).length >= 6;
const plain = (t, n) => String(t || "").replace(/[\u0000-\u0008\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").trim().slice(0, n); // keeps line breaks
const LETTER_TTL = 24 * 3600 * 1000;
const json = o => new Response(JSON.stringify(o), { headers: { "content-type": "application/json" } });

export class Lobby extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.env = env; }
  async checkKey(req) {
      // Reading needs the long password kept in Cloudflare Secrets Store (binding ADMIN_KEY); it never appears in this repo or the page.
      let secret = ""; try { const k = this.env.ADMIN_KEY; secret = String((k && typeof k.get === "function") ? await k.get() : (k || "")); } catch {}
      if (!secret) return { ok: false, unset: true };
      const day = new Date().toISOString().slice(0, 10); const f = (await this.ctx.storage.get("fails")) || { day, n: 0 }; if (f.day !== day) { f.day = day; f.n = 0; }
      if (f.n >= 10) return { ok: false, locked: true };
      // both sides tidied the same way: a stray space or line break saved with the secret, or full-width letters, no longer make a right password fail
      const norm = v => String(v || "").normalize("NFKC").replace(/[\s\u200b-\u200f\u2060\ufeff]/g, "");
      secret = norm(secret); const given = norm(req.headers.get("x-key")).slice(0, 200);
      const h = async t => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)));
      const [a, b] = await Promise.all([h(given), h(secret)]); let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
      if (!given || diff !== 0) { f.n++; await this.ctx.storage.put("fails", f); return { ok: false }; }
    return { ok: true };
  }

  async fetch(req) {
    const url = new URL(req.url);
    // 聯絡作者: private messages. Reading needs the ADMIN_KEY secret (set in the Cloudflare dashboard, never in this public repo);
    // wrong keys are limited to 10 per day so the short code cannot be guessed.
    if (url.pathname === "/msg" && req.method === "POST") {
      let b = {}; try { b = await req.json(); } catch {}
      const text = String(b.text || "").replace(/[\u0000-\u0008\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").trim().slice(0, 500), name = clean(b.name, 16) || "香客", id = clean(b.id, 16);
      if (!text || addsLine(text)) return json({ ok: false, line: addsLine(text) });
      this.lastMsg = this.lastMsg || new Map(); const now = Date.now(); const key = id || req.headers.get("cf-connecting-ip") || "?";
      if (now - (this.lastMsg.get(key) || 0) < 30000) return json({ ok: false, slow: true }); this.lastMsg.set(key, now);
      const m = (await this.ctx.storage.get("msgs")) || []; m.unshift(id ? { name, text, at: now, id } : { name, text, at: now }); await this.ctx.storage.put("msgs", m.slice(0, 1000)); return json({ ok: true });
    }
    if (url.pathname === "/announce" && req.method === "POST") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      let b = {}; try { b = await req.json(); } catch {}
      const text = clean(b.text, 80); if (!text) return json({ ok: false }); const at = Date.now(); // one id for every hall, so switching halls doesn't replay it
      await Promise.all(Array.from({ length: HALLS }, (_, h) => this.env.HALL.get(this.env.HALL.idFromName("hall-" + h)).fetch("https://hall/announce", { method: "POST", body: JSON.stringify({ text, at, h: Number.isInteger(b.h) ? b.h : -1 }) }).catch(() => {})));
      return json({ ok: true });
    }
    // 公告欄: one board the chair can rewrite any time; the page lights its button until each player has read the newest version
    if (url.pathname === "/board" && req.method === "POST") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      let b = {}; try { b = await req.json(); } catch {}
      const board = { text: plain(b.text, 1000), at: Date.now() }; await this.ctx.storage.put("board", board);
      return json({ ok: true, ...board });
    }
    if (url.pathname === "/board") return json((await this.ctx.storage.get("board")) || { text: "", at: 0 });
    // 主委回信: a reply lands in the sender's mailbox (keyed by their device id) for 24 hours, or until they delete it
    if (url.pathname === "/reply" && req.method === "POST") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      let b = {}; try { b = await req.json(); } catch {}
      const text = plain(b.text, 500), at = Number(b.at) || 0; if (!text || !at) return json({ ok: false });
      const m = (await this.ctx.storage.get("msgs")) || []; const msg = m.find(x => x.at === at);
      if (!msg || !msg.id) return json({ ok: false, noid: true });
      const now = Date.now(); msg.reply = { text, at: now }; await this.ctx.storage.put("msgs", m);
      const key = "L:" + msg.id; const box = ((await this.ctx.storage.get(key)) || []).filter(l => now - l.at < LETTER_TTL);
      box.unshift({ at: now, text, q: msg.text.slice(0, 80) }); await this.ctx.storage.put(key, box.slice(0, 10));
      return json({ ok: true });
    }
    if (url.pathname === "/letters") {
      const id = clean(url.searchParams.get("id"), 16); if (!id) return json({ letters: [] });
      const key = "L:" + id, now = Date.now(), box = (await this.ctx.storage.get(key)) || [];
      let live = box.filter(l => now - l.at < LETTER_TTL);
      if (req.method === "POST" && url.searchParams.get("del") === "1") { const at = Number(url.searchParams.get("at")) || 0; live = live.filter(l => l.at !== at); }
      if (live.length !== box.length) { if (live.length) await this.ctx.storage.put(key, live); else await this.ctx.storage.delete(key); }
      return json({ letters: live, ttl: LETTER_TTL });
    }
    // 歌仔戲台: the chair puts the stage out in the courtyard; it stays (and the troupe keeps performing) until put away again
    if (url.pathname === "/stage" && req.method === "POST") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      let b = {}; try { b = await req.json(); } catch {}
      const prev = (await this.ctx.storage.get("stage")) || { on: false, at: 0 }; /* changing only the troupe name keeps the show running */
      const st = { on: !!b.on, at: b.on && prev.on ? prev.at : Date.now(), name: clean(b.name, 8), cats: b.cats !== false }; await this.ctx.storage.put("stage", st); /* cats: the chair can put the dancing cats away */
      await Promise.all(Array.from({ length: HALLS }, (_, h) => this.env.HALL.get(this.env.HALL.idFromName("hall-" + h)).fetch("https://hall/stage", { method: "POST", body: JSON.stringify(st) }).catch(() => {})));
      return json({ ok: true, ...st });
    }
    if (url.pathname === "/stage") return json((await this.ctx.storage.get("stage")) || { on: false, at: 0 });
    // 布袋戲台: same idea, plus the chair's line of text for the red cloth; changing the text keeps the show running
    if (url.pathname === "/puppet" && req.method === "POST") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      let b = {}; try { b = await req.json(); } catch {}
      const prev = (await this.ctx.storage.get("puppet")) || { on: false, at: 0 };
      const st = { on: !!b.on, at: b.on && prev.on ? prev.at : Date.now(), text: clean(b.text, 24), name: clean(b.name, 8) }; await this.ctx.storage.put("puppet", st);
      await Promise.all(Array.from({ length: HALLS }, (_, h) => this.env.HALL.get(this.env.HALL.idFromName("hall-" + h)).fetch("https://hall/puppet", { method: "POST", body: JSON.stringify(st) }).catch(() => {})));
      return json({ ok: true, ...st });
    }
    if (url.pathname === "/puppet") return json((await this.ctx.storage.get("puppet")) || { on: false, at: 0, text: "" });
    // 夜市: which stalls are open and when each was opened (that order is the order along the wall)
    if (url.pathname === "/market" && req.method === "POST") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      let b = {}; try { b = await req.json(); } catch {}
      const KEYS = ["qq", "sausage", "bbq", "fish", "pachinko", "boba", "balloon"], st = (await this.ctx.storage.get("market")) || { open: {} }, now = Date.now();
      if (b.all != null) KEYS.forEach((k, i) => { if (b.all) st.open[k] = st.open[k] || now + i; else delete st.open[k]; });
      else if (KEYS.includes(b.k)) { if (b.on) st.open[b.k] = now; else delete st.open[b.k]; }
      await this.ctx.storage.put("market", st);
      await Promise.all(Array.from({ length: HALLS }, (_, h) => this.env.HALL.get(this.env.HALL.idFromName("hall-" + h)).fetch("https://hall/market", { method: "POST", body: JSON.stringify(st) }).catch(() => {})));
      return json({ ok: true, ...st });
    }
    if (url.pathname === "/market") return json((await this.ctx.storage.get("market")) || { open: {} });
    // 夜市紀錄保持者: best results per stall since it was last put out; lower is better for times
    if (url.pathname === "/nmrec") {
      const LOW = { bbq: 1, boba: 1, balloon: 1 }, MAX = { qq: 60, bbq: 999, fish: 5000, pachinko: 1000000, boba: 999, balloon: 999 };
      const st = (await this.ctx.storage.get("market")) || { open: {} }, all = (await this.ctx.storage.get("nmrec")) || {};
      if (req.method === "POST") {
        let b = {}; try { b = await req.json(); } catch {}
        const k = String(b.k || ""), v = Number(b.v), id = clean(b.id, 16) || "anon", name = clean(b.name, 10) || "香客";
        if (!(k in MAX) || !st.open[k] || !(v > 0) || v > MAX[k]) return json({ ok: false });
        let r = all[k]; if (!r || r.s !== st.open[k]) r = all[k] = { s: st.open[k], list: [] };
        const better = (a, c) => LOW[k] ? a < c : a > c; const cur = r.list.find(e => e.id === id);
        if (!cur) r.list.push({ id, name, v, at: Date.now() }); else if (better(v, cur.v)) { cur.v = v; cur.name = name; cur.at = Date.now(); }
        r.list.sort((a, c) => LOW[k] ? a.v - c.v || a.at - c.at : c.v - a.v || a.at - c.at); r.list = r.list.slice(0, 10);
        await this.ctx.storage.put("nmrec", all); return json({ ok: true });
      }
      const k = url.searchParams.get("k") || "", r = all[k];
      return json({ list: r && st.open[k] && r.s === st.open[k] ? r.list.map(e => ({ name: e.name, v: e.v })) : [] });
    }
    // 線上人數: the chair sets a target the shown count eases to over about half an hour (null = back to the time-of-day pattern).
    // Each phone works the number out from these three values and the clock, so this is read rarely and never pushed.
    if (url.pathname === "/crowd" && req.method === "POST") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      let b = {}; try { b = await req.json(); } catch {}
      const t = b.target == null ? null : Math.max(0, Math.min(900, Math.round(Number(b.target) || 0)));
      const from = Math.max(0, Math.min(1000, Math.round(Number(b.from) || 0)));
      const real = !!b.real; /* real: show only real players, no demo crowd */
      const c = { target: real ? 0 : t, from, at: Date.now(), real }; await this.ctx.storage.put("crowd", c); return json({ ok: true, ...c });
    }
    if (url.pathname === "/crowd") return json((await this.ctx.storage.get("crowd")) || { target: null, from: null, at: 0 });
    // 斬小人排行榜: best score per player, top 20 kept
    if (url.pathname === "/zhan" && req.method === "POST") {
      let b = {}; try { b = await req.json(); } catch {}
      const score = Math.max(0, Math.min(999, b.score | 0)) /* no 120 cap any more; 999 only stops made-up requests */, name = clean(b.name, 10) || "香客", id = clean(b.id, 16) || "anon";
      this.lastZhan = this.lastZhan || new Map(); const now = Date.now(); const ok = now - (this.lastZhan.get(id) || 0) > 12000; this.lastZhan.set(id, now);
      let top = (await this.ctx.storage.get("zhan")) || [];
      if (ok) { const cur = top.find(e => e.id === id); if (!cur) top.push({ id, name, score, at: now }); else if (score > cur.score) { cur.score = score; cur.name = name; cur.at = now; } else cur.name = name;
        top.sort((a, b) => b.score - a.score || a.at - b.at); top = top.slice(0, 20); await this.ctx.storage.put("zhan", top); }
      return json({ ok, top: top.slice(0, 10) });
    }
    if (url.pathname === "/lanterns" && req.method === "POST") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      const last = (await this.ctx.storage.get("slAt")) || 0; if (Date.now() - last < 30000) return json({ ok: false, busy: true });
      await this.ctx.storage.put("slAt", Date.now()); const seed = (Math.random() * 4294967295) >>> 0;
      await Promise.all(Array.from({ length: HALLS }, (_, h) => this.env.HALL.get(this.env.HALL.idFromName("hall-" + h)).fetch("https://hall/lanterns", { method: "POST", body: JSON.stringify({ seed }) }).catch(() => {})));
      return json({ ok: true });
    }
    // 財神爺撒紅包: the chair throws envelopes; the lobby decides what is inside each one, so a page can't make up its own prize.
    // Each envelope can be caught once, and each player keeps at most 3 per throw.
    if (url.pathname === "/hongbao" && req.method === "POST") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      let b = {}; try { b = await req.json(); } catch {}
      const cur = this.hb || (await this.ctx.storage.get("hb")); if (cur && Date.now() - cur.at < 8000) return json({ ok: false, busy: true });
      const n = 30, id = Math.random().toString(36).slice(2, 10), seed = (Math.random() * 4294967295) >>> 0, at = Date.now();
      const pick = () => { const r = Math.random(); return r < .02 ? 500 : r < .12 ? 100 : 50; }; // only 50 / 100 / 500 (chair's choice, 11/04): 500 2%, 100 10%, 50 88%
      this.hb = { id, at, n, amt: Array.from({ length: n }, pick), taken: {}, per: {} }; await this.ctx.storage.put("hb", this.hb);
      const x = Math.max(-40, Math.min(40, Number(b.x) || 0)), z = Math.max(-50, Math.min(60, Number(b.z) || 0));
      await Promise.all(Array.from({ length: HALLS }, (_, h) => this.env.HALL.get(this.env.HALL.idFromName("hall-" + h)).fetch("https://hall/hongbao", { method: "POST", body: JSON.stringify({ id, seed, n, x, z, at }) }).catch(() => {})));
      return json({ ok: true, id, seed, n, x, z, at });
    }
    // 建築模式: where the chair has put, moved or resized models. Only numbers and known model names are kept.
    if (url.pathname === "/layout" && req.method === "POST") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      let b = {}; try { b = await req.json(); } catch {}
      const L = b.layout || {}, n = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; };
      const v3 = (a, lo, hi, d) => Array.isArray(a) && a.length === 3 ? a.map(x => +n(x, lo, hi, d).toFixed(3)) : [d, d, d];
      const okId = t => typeof t === "string" && /^[a-z0-9:_-]{1,40}$/i.test(t);
      const out = { mods: {}, adds: [] };
      if (L.mods && typeof L.mods === "object") for (const [id, m] of Object.entries(L.mods).slice(0, 300)) { if (!okId(id) || !m || typeof m !== "object") continue; out.mods[id] = { p: v3(m.p, -200, 200, 0), r: +n(m.r, -100, 100, 0).toFixed(4), s: v3(m.s, .001, 500, 1), hide: !!m.hide }; }
      if (Array.isArray(L.adds)) for (const a of L.adds.slice(0, 200)) { if (!a || !okId(a.id) || !okId(a.m)) continue; const e = { id: a.id, m: a.m, p: v3(a.p, -200, 200, 0), r: +n(a.r, -100, 100, 0).toFixed(4), s: v3(a.s, .001, 500, 1) }; if (okId(a.pair)) e.pair = a.pair; out.adds.push(e); }
      const st = { layout: out, at: Date.now() }; await this.ctx.storage.put("layout", st);
      await Promise.all(Array.from({ length: HALLS }, (_, h) => this.env.HALL.get(this.env.HALL.idFromName("hall-" + h)).fetch("https://hall/layout", { method: "POST" }).catch(() => {})));
      return json({ ok: true, at: st.at });
    }
    if (url.pathname === "/layout") return json((await this.ctx.storage.get("layout")) || { layout: null, at: 0 });
    // ---- 角色存檔 / 取回碼 / 主委送禮 (reached through profile() above, which adds x-uid from the player's cookie) ----
    if (url.pathname === "/me" || url.pathname === "/me/claim" || url.pathname === "/gift" || url.pathname === "/gifts") {
      const uid = String(req.headers.get("x-uid") || "").replace(/[^a-f0-9]/g, "").slice(0, 40); if (!uid) return json({ ok: false });
      if (url.pathname === "/me" && req.method === "GET") { const P = await this.ctx.storage.get("P:" + uid); return json({ ok: true, p: P ? { code: P.code, snap: P.snap } : null }); }
      if (url.pathname === "/me" && req.method === "POST") {
        this.lastSave = this.lastSave || new Map(); const now = Date.now(); if (now - (this.lastSave.get(uid) || 0) < 8000) return json({ ok: false, slow: true }); this.lastSave.set(uid, now);
        let b = {}; try { b = await req.json(); } catch {} const snap = String(b.snap || ""); if (!/^MZ-[A-Za-z0-9_-]{10,900}$/.test(snap)) return json({ ok: false });
        const P = (await this.ctx.storage.get("P:" + uid)) || {};
        if (!P.code) { const AB = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; for (let k = 0; k < 12 && !P.code; k++) { let c = ""; for (let i = 0; i < 7; i++) c += AB[(Math.random() * AB.length) | 0]; if (!(await this.ctx.storage.get("C:" + c))) P.code = c; } if (!P.code) return json({ ok: false }); await this.ctx.storage.put("C:" + P.code, uid); }
        P.snap = snap; P.at = now; const id = clean(b.id, 16).replace(/[^a-z0-9]/g, ""); if (id && P.id !== id) { P.id = id; await this.ctx.storage.put("I:" + id, uid); }
        await this.ctx.storage.put("P:" + uid, P); return json({ ok: true, code: P.code });
      }
      if (url.pathname === "/me/claim" && req.method === "POST") {
        const ip = clean(req.headers.get("x-ip"), 64) || "?", day = new Date().toISOString().slice(0, 10), tk = "CL:" + ip + ":" + day, tries = (await this.ctx.storage.get(tk)) || 0;
        if (tries >= 20) return json({ ok: false, locked: true });
        let b = {}; try { b = await req.json(); } catch {} const code = String(b.code || "").toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 7);
        const owner = code.length === 7 ? await this.ctx.storage.get("C:" + code) : null; const P = owner ? await this.ctx.storage.get("P:" + owner) : null;
        if (!P) { await this.ctx.storage.put(tk, tries + 1); return json({ ok: false }); }
        return json({ ok: true, switchTo: owner, p: { code: P.code, snap: P.snap } });
      }
      if (url.pathname === "/gift" && req.method === "POST") {
        const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
        let b = {}; try { b = await req.json(); } catch {} const to = clean(b.to, 16).replace(/[^a-z0-9]/g, ""), kind = b.kind === "item" ? "item" : b.kind === "acc" ? "acc" : "coins";
        const k = kind !== "coins" ? String(b.k || "").replace(/[^a-z]/g, "").slice(0, 12) : "", n = kind === "acc" ? 1 : Math.max(1, Math.min(kind === "item" ? 99 : 100000, Math.floor(Number(b.n) || 0)));
        if (!to || (kind !== "coins" && !k)) return json({ ok: false });
        const owner = await this.ctx.storage.get("I:" + to); if (!owner) return json({ ok: false, nouser: true });
        const G = (await this.ctx.storage.get("G:" + owner)) || []; G.push({ g: Math.random().toString(36).slice(2, 10), kind, k, n, from: clean(b.from, 16) || "主委", at: Date.now() }); await this.ctx.storage.put("G:" + owner, G.slice(-30));
        await Promise.all(Array.from({ length: HALLS }, (_, h) => this.env.HALL.get(this.env.HALL.idFromName("hall-" + h)).fetch("https://hall/giftping", { method: "POST", body: JSON.stringify({ to }) }).catch(() => {})));
        return json({ ok: true });
      }
      if (url.pathname === "/gifts") { const G = (await this.ctx.storage.get("G:" + uid)) || []; if (G.length) await this.ctx.storage.delete("G:" + uid); return json({ ok: true, gifts: G }); }
      return json({ ok: false });
    }
    if (url.pathname === "/hbclaim" && req.method === "POST") {
      let b = {}; try { b = await req.json(); } catch {}
      const hb = this.hb || (this.hb = await this.ctx.storage.get("hb")); const i = b.i | 0, uid = clean(b.uid, 40) || "";
      if (!hb || hb.id !== b.id || Date.now() - hb.at > 60000 || i < 0 || i >= hb.n || !uid) return json({ ok: false, gone: true });
      if ((hb.per[uid] || 0) >= 3) return json({ ok: false, max: true });
      if (hb.taken[i]) return json({ ok: false, taken: true });
      hb.taken[i] = uid; hb.per[uid] = (hb.per[uid] || 0) + 1; await this.ctx.storage.put("hb", hb);
      return json({ ok: true, amt: hb.amt[i], got: hb.per[uid] });
    }
    if (url.pathname === "/fireworks" && req.method === "POST") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      const last = (await this.ctx.storage.get("fwAt")) || 0; if (Date.now() - last < 224000) return json({ ok: false, busy: true });
      await this.ctx.storage.put("fwAt", Date.now()); const seed = (Math.random() * 4294967295) >>> 0;
      await Promise.all(Array.from({ length: HALLS }, (_, h) => this.env.HALL.get(this.env.HALL.idFromName("hall-" + h)).fetch("https://hall/fireworks", { method: "POST", body: JSON.stringify({ seed }) }).catch(() => {})));
      return json({ ok: true });
    }
    if (url.pathname === "/msgs") {
      const auth = await this.checkKey(req); if (!auth.ok) return json(auth);
      return json({ ok: true, msgs: (await this.ctx.storage.get("msgs")) || [] });
    }
    // 光明燈: every lit lamp stays lit until its owner turns it off
    if (url.pathname === "/lamps") { const m = (await this.ctx.storage.get("lamps")) || {}; return json({ lit: Object.keys(m).map(Number) }); }
    if (url.pathname === "/lamp" && req.method === "POST") {
      const i = parseInt(url.searchParams.get("i"), 10), id = clean(url.searchParams.get("id"), 16), off = url.searchParams.get("off") === "1";
      if (!(i >= 0 && i < LAMPS) || !id) return json({ ok: false });
      const m = (await this.ctx.storage.get("lamps")) || {};
      if (off) { if (m[i] === id) delete m[i]; } else if (!m[i]) { for (const k in m) if (m[k] === id) delete m[k]; m[i] = id; }
      await this.ctx.storage.put("lamps", m); return json({ ok: true, lit: Object.keys(m).map(Number) });
    }
    // 許願樹: newest 300 wishes, one per person every 10 seconds
    if (url.pathname === "/wishes") { return json({ wishes: (await this.ctx.storage.get("wishes")) || [] }); }
    if (url.pathname === "/wish" && req.method === "POST") {
      let b = {}; try { b = await req.json(); } catch {}
      const text = clean(b.text, 40), name = (addsLine(b.name) ? "" : clean(b.name, 10)) || "香客", id = clean(b.id, 16);
      if (!text || looksLikeAd(text)) return json({ ok: false });
      this.last = this.last || new Map(); const now = Date.now(); if (id && now - (this.last.get(id) || 0) < 10000) return json({ ok: false, slow: true }); if (id) this.last.set(id, now);
      const w = (await this.ctx.storage.get("wishes")) || []; w.unshift({ name, text, at: now }); await this.ctx.storage.put("wishes", w.slice(0, 300)); return json({ ok: true });
    }
    let c = (await this.ctx.storage.get("c")) || new Array(HALLS).fill(0);
    if (url.pathname === "/set") { const h = parseInt(url.searchParams.get("h"), 10), n = parseInt(url.searchParams.get("n"), 10); if (h >= 0 && h < HALLS && n >= 0) { c[h] = n; await this.ctx.storage.put("c", c); } return new Response("ok"); }
    return new Response(JSON.stringify({ cap: CAP, counts: c }));
  }
}

// 線上媽祖廟 multiplayer: one Durable Object per hall relays player state over WebSockets.
// Outgoing WebSocket messages are free; incoming ones are billed at 20:1, so the server only relays.
import { DurableObject } from "cloudflare:workers";

const HALLS = 10, CAP = 100, MAX_MSG = 4000;
const MEMO = new Map(), MEMO_TTL = { "/halls": 8000, "/lamps": 60000, "/wishes": 30000 };

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/ws" || url.pathname === "/halls" || ["/lamps", "/lamp", "/wishes", "/wish", "/msg", "/msgs"].includes(url.pathname)) {
      try { return await api(req, env, url); }
      catch (e) { return new Response(JSON.stringify({ error: String(e && e.message || e).slice(0, 300) }), { status: 503, headers: { "content-type": "application/json", "cache-control": "no-store" } }); }
    }
    return env.ASSETS.fetch(req);
  }
};

async function api(req, env, url) {
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
    if (["/lamps", "/lamp", "/wishes", "/wish", "/msg", "/msgs"].includes(url.pathname)) {
      if (req.method === "POST") MEMO.delete(url.pathname === "/lamp" ? "/lamps" : "/wishes");
      const lobby = env.LOBBY.get(env.LOBBY.idFromName("lobby"));
      const r = await lobby.fetch(new Request("https://lobby" + url.pathname + url.search, { method: req.method, headers: req.headers, body: req.method === "POST" ? await req.text() : undefined }));
      const body = await r.text(); if (req.method === "GET" && r.ok) MEMO.set(url.pathname, { at: Date.now(), body });
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
    const h = Math.max(0, Math.min(HALLS - 1, parseInt(url.searchParams.get("hall") || "0", 10) || 0));
    const id = (url.searchParams.get("id") || "").replace(/[^a-z0-9]/g, "").slice(0, 16) || crypto.randomUUID().slice(0, 12);
    const active = this.ctx.getWebSockets().filter(w => (w.deserializeAttachment() || {}).u !== 0).length;
    const pair = new WebSocketPair(); const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server, [id]);
    server.serializeAttachment({ id, h, p: null, u: 1 });
    if (active >= CAP) { server.send(JSON.stringify({ t: "full" })); server.close(4000, "full"); return new Response(null, { status: 101, webSocket: client }); }
    // send everyone already here to the newcomer
    const peers = [];
    for (const w of this.ctx.getWebSockets()) { if (w === server) continue; const a = w.deserializeAttachment() || {}; if (a.p) peers.push({ id: a.id, p: a.p }); }
    server.send(JSON.stringify({ t: "hello", peers }));
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
    a.p = s.length < 1900 ? p : null; a.u = u; ws.serializeAttachment(a);
    const out = JSON.stringify({ t: "st", id: a.id, p });
    for (const w of this.ctx.getWebSockets()) { if (w !== ws) { try { w.send(out); } catch {} } }
    if (was !== u) this.report(a.h);
  }
  async webSocketClose(ws) { this.leave(ws); }
  async webSocketError(ws) { this.leave(ws); }
  leave(ws) {
    const a = ws.deserializeAttachment() || {};
    const out = JSON.stringify({ t: "leave", id: a.id });
    for (const w of this.ctx.getWebSockets()) { if (w !== ws) { try { w.send(out); } catch {} } }
    try { ws.close(1000, "bye"); } catch {}
    this.report(a.h);
  }
  // Head-count updates to the lobby are batched: at most one every 5 seconds, and only when the number changed.
  report(h) {
    this.h = h | 0; if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      const n = this.ctx.getWebSockets().filter(w => { const a = w.deserializeAttachment() || {}; return a.u !== 0 && w.readyState === 1; }).length;
      if (n === this.lastN) return; this.lastN = n;
      this.env.LOBBY.get(this.env.LOBBY.idFromName("lobby")).fetch("https://lobby/set?h=" + this.h + "&n=" + n).catch(() => {});
    }, 5000);
  }
}

const LAMPS = 140;
const clean = (t, n) => String(t || "").replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff<>]/g, "").replace(/\s+/g, " ").trim().slice(0, n);
const looksLikeAd = t => /(https?:|www\.|\.com|\.tw|line|@)/i.test(t) || (t.match(/\d/g) || []).length >= 6;
const json = o => new Response(JSON.stringify(o), { headers: { "content-type": "application/json" } });

export class Lobby extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.env = env; }
  async fetch(req) {
    const url = new URL(req.url);
    // 聯絡作者: private messages. Reading needs the ADMIN_KEY secret (set in the Cloudflare dashboard, never in this public repo);
    // wrong keys are limited to 10 per day so the short code cannot be guessed.
    if (url.pathname === "/msg" && req.method === "POST") {
      let b = {}; try { b = await req.json(); } catch {}
      const text = String(b.text || "").replace(/[\u0000-\u0008\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").trim().slice(0, 500), name = clean(b.name, 16) || "香客", id = clean(b.id, 16);
      if (!text) return json({ ok: false });
      this.lastMsg = this.lastMsg || new Map(); const now = Date.now(); const key = id || req.headers.get("cf-connecting-ip") || "?";
      if (now - (this.lastMsg.get(key) || 0) < 30000) return json({ ok: false, slow: true }); this.lastMsg.set(key, now);
      const m = (await this.ctx.storage.get("msgs")) || []; m.unshift({ name, text, at: now }); await this.ctx.storage.put("msgs", m.slice(0, 1000)); return json({ ok: true });
    }
    if (url.pathname === "/msgs") {
      // Reading needs the long password kept in Cloudflare Secrets Store (binding ADMIN_KEY); it never appears in this repo or the page.
      let secret = ""; try { const k = this.env.ADMIN_KEY; secret = String((k && typeof k.get === "function") ? await k.get() : (k || "")); } catch {}
      if (!secret) return json({ ok: false, unset: true });
      const day = new Date().toISOString().slice(0, 10); const f = (await this.ctx.storage.get("fails")) || { day, n: 0 }; if (f.day !== day) { f.day = day; f.n = 0; }
      if (f.n >= 10) return json({ ok: false, locked: true });
      const given = String(req.headers.get("x-key") || "").trim().slice(0, 200);
      const h = async t => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)));
      const [a, b] = await Promise.all([h(given), h(secret)]); let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
      if (!given || diff !== 0) { f.n++; await this.ctx.storage.put("fails", f); return json({ ok: false }); }
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
      const text = clean(b.text, 40), name = clean(b.name, 10) || "香客", id = clean(b.id, 16);
      if (!text || looksLikeAd(text)) return json({ ok: false });
      this.last = this.last || new Map(); const now = Date.now(); if (id && now - (this.last.get(id) || 0) < 10000) return json({ ok: false, slow: true }); if (id) this.last.set(id, now);
      const w = (await this.ctx.storage.get("wishes")) || []; w.unshift({ name, text, at: now }); await this.ctx.storage.put("wishes", w.slice(0, 300)); return json({ ok: true });
    }
    let c = (await this.ctx.storage.get("c")) || new Array(HALLS).fill(0);
    if (url.pathname === "/set") { const h = parseInt(url.searchParams.get("h"), 10), n = parseInt(url.searchParams.get("n"), 10); if (h >= 0 && h < HALLS && n >= 0) { c[h] = n; await this.ctx.storage.put("c", c); } return new Response("ok"); }
    return new Response(JSON.stringify({ cap: CAP, counts: c }));
  }
}

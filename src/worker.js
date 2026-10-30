// 線上媽祖廟 multiplayer: one Durable Object per hall relays player state over WebSockets.
// Outgoing WebSocket messages are free; incoming ones are billed at 20:1, so the server only relays.
import { DurableObject } from "cloudflare:workers";

const HALLS = 10, CAP = 100, MAX_MSG = 4000;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      if (req.headers.get("Upgrade") !== "websocket") return new Response("expected websocket", { status: 426 });
      const h = Math.max(0, Math.min(HALLS - 1, parseInt(url.searchParams.get("hall") || "0", 10) || 0));
      return env.HALL.get(env.HALL.idFromName("hall-" + h)).fetch(req);
    }
    if (url.pathname === "/halls") {
      const r = await env.LOBBY.get(env.LOBBY.idFromName("lobby")).fetch("https://lobby/counts");
      return new Response(await r.text(), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }
    return env.ASSETS.fetch(req);
  }
};

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
  report(h) {
    const n = this.ctx.getWebSockets().filter(w => { const a = w.deserializeAttachment() || {}; return a.u !== 0 && w.readyState === 1; }).length;
    this.ctx.waitUntil(this.env.LOBBY.get(this.env.LOBBY.idFromName("lobby")).fetch("https://lobby/set?h=" + (h | 0) + "&n=" + n).catch(() => {}));
  }
}

export class Lobby extends DurableObject {
  async fetch(req) {
    const url = new URL(req.url);
    let c = (await this.ctx.storage.get("c")) || new Array(HALLS).fill(0);
    if (url.pathname === "/set") { const h = parseInt(url.searchParams.get("h"), 10), n = parseInt(url.searchParams.get("n"), 10); if (h >= 0 && h < HALLS && n >= 0) { c[h] = n; await this.ctx.storage.put("c", c); } return new Response("ok"); }
    return new Response(JSON.stringify({ cap: CAP, counts: c }));
  }
}

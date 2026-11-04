/* 雲端天后宮: lets phones install the game to the home screen, and keeps the big files on the phone.
   The page itself always comes fresh from the internet (never an old copy).
   Models (.glb), pictures (.webp/.jpg/.png) and sounds (.mp3) are kept after the first download: the next visit uses the copy on the
   phone at once, and once a day quietly checks the internet for a newer one in the background (so an updated model still arrives).
   The 設定 → 預先下載 button fills this store ahead of time. */
const KEEP = "mz-assets-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("mz-") && k !== KEEP).map(k => caches.delete(k)))).then(() => self.clients.claim())));
const BIG = /\.(glb|webp|jpg|jpeg|png|mp3)$/i;
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => new Response("<meta charset=utf-8><body style='background:#140906;color:#f0e0c0;font:18px sans-serif;text-align:center;padding-top:40vh'>需要網路才能進廟，請連上網路再開一次。", { headers: { "content-type": "text/html; charset=utf-8" } })));
    return;
  }
  if (e.request.method !== "GET" || u.origin !== location.origin || e.request.headers.has("range")) return;
  if (!(u.pathname.startsWith("/nm/") || BIG.test(u.pathname))) return;
  e.respondWith(caches.open(KEEP).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => {
    // keep a copy stamped with when it was fetched; a copy older than a day is checked again in the background (at most once a day,
    // so phones don't re-download everything on every visit)
    const get = () => fetch(e.request).then(async r => { if (r.ok && r.status === 200) { const h = new Headers(r.headers); h.set("x-mz-at", String(Date.now())); await c.put(e.request, new Response(await r.clone().blob(), { status: 200, headers: h })); } return r; });
    if (hit) { const at = +hit.headers.get("x-mz-at") || 0; if (Date.now() - at > 86400000) e.waitUntil(get().catch(() => {})); return hit; }
    return get();
  })));
});

/* 雲端天后宮: lets phones install the game to the home screen. The page itself always comes fresh from the internet
   (never an old copy). Night-market pictures and stall models are kept after the first download, so the next time
   they open at once even on a slow connection. */
const KEEP = "mz-nm-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("mz-nm-") && k !== KEEP).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => new Response("<meta charset=utf-8><body style='background:#140906;color:#f0e0c0;font:18px sans-serif;text-align:center;padding-top:40vh'>需要網路才能進廟，請連上網路再開一次。", { headers: { "content-type": "text/html; charset=utf-8" } })));
    return;
  }
  if (e.request.method === "GET" && u.origin === location.origin && (u.pathname.startsWith("/nm/") || /^\/stall-[a-z]+(-lite)?\.glb$/.test(u.pathname))) {
    e.respondWith(caches.open(KEEP).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
  }
});

/* 線上媽祖廟: lets phones install the game to the home screen. It keeps nothing offline and never serves an old copy:
   opening the game always loads the newest version from the internet. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  if (e.request.mode !== "navigate") return; // everything else goes straight to the network as usual
  e.respondWith(fetch(e.request).catch(() => new Response("<meta charset=utf-8><body style='background:#140906;color:#f0e0c0;font:18px sans-serif;text-align:center;padding-top:40vh'>需要網路才能進廟，請連上網路再開一次。", { headers: { "content-type": "text/html; charset=utf-8" } })));
});

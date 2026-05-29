/* Conjure — minimal service worker
   Caches the app shell so the first-paint works offline.
   AI features still need internet (they call the Cloudflare Worker). */

const CACHE = "conjure-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  // Never cache AI/Worker calls — always go to network
  if (req.url.indexOf("conjureapp-help.workers.dev") !== -1) return;
  // Cache-first for everything else (the app shell)
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => caches.match("./index.html")))
  );
});

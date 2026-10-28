// Tiny offline cache for this app only (network first, cache fallback).
const CACHE = 'plate-cache-v24';
const SCOPE = self.registration.scope;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './apple-touch-icon.png', './manifest.webmanifest'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('plate-cache-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(SCOPE)) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./'))));
});

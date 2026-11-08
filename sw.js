/* YAJUGÁ · service worker: primero la red (siempre lo último), si no hay red usa lo guardado */
const C = 'yajuga-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(C).then((c) => c.addAll(['/', '/jugar', '/leyendas', '/adivina', '/dc.js', '/net.js', '/sfx.js', '/pwa.js', '/manifest.json']).catch(() => {}))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;
  const isAsset = u.pathname.startsWith('/assets/') || u.pathname.startsWith('/icons/');
  if (isAsset) { e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); } return res; }))); return; }
  e.respondWith(fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); } return res; }).catch(() => caches.match(r).then((hit) => hit || caches.match('/'))));
});

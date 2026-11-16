// CartoTable web page - keeps the page and its data on the device, and the map tiles saved for offline.
const APP = 'cartotable-app-20261116044738', TILES = 'cartotable-tiles';
self.addEventListener('install', e => { e.waitUntil(caches.open(APP).then(c => Promise.all(["./","index.html","manifest.webmanifest","icon.svg","icon.png","icon-192.png"].map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cartotable-app-') && k !== APP).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = e.request.url;
  if (/\/tile\/\d+\/\d+\/\d+/.test(u)) { e.respondWith(caches.open(TILES).then(c => c.match(u).then(r => r || fetch(e.request)))); return; }
  if (u.indexOf('cdnjs.cloudflare.com/ajax/libs/pdf.js/') >= 0) { e.respondWith(caches.open(APP).then(c => c.match(u).then(r => r || fetch(e.request).then(n => { c.put(u, n.clone()); return n; })))); return; }
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});

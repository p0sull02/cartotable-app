// CartoTable web page - keeps the page and its data on the device, and the map tiles saved for offline.
const APP = 'cartotable-next-20261117060952', TILES = 'cartotable-tiles';
self.addEventListener('install', e => { e.waitUntil(caches.open(APP).then(c => Promise.all(["./","index.html","manifest.webmanifest","icon.svg","icon.png","icon-192.png"].map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cartotable-next-') && k !== APP).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = e.request.url;
  if (/\/tile\/\d+\/\d+\/\d+/.test(u)) { e.respondWith(caches.open(TILES).then(c => c.match(u).then(r => r || fetch(e.request)))); return; }
  if (u.indexOf('cdnjs.cloudflare.com/ajax/libs/pdf.js/') >= 0) { e.respondWith(caches.open(APP).then(c => c.match(u).then(r => r || fetch(e.request).then(n => { c.put(u, n.clone()); return n; })))); return; }
  if (e.request.method !== 'GET') return;
  // the page itself: the network first (so an update shows the first time it opens), the kept copy when there's no signal or it's slow
  // (Sully, 16 Nov 2026, asking whether the phone app can detect updates - cache-first kept showing the old page)
  if (e.request.mode === 'navigate' || /\/(index\.html)?(\?.*)?$/.test(u) || /version\.json/.test(u)) {
    e.respondWith(new Promise(done => {
      let settled = false; const kept = () => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'));
      const t = setTimeout(() => kept().then(r => { if (r && !settled) { settled = true; done(r); } }), 4000);
      fetch(e.request, { cache: 'no-store' }).then(n => { clearTimeout(t); if (n.ok && !/version\.json/.test(u)) { const copy = n.clone(); caches.open(APP).then(c => c.put(u.split('?')[0], copy)); } if (!settled) { settled = true; done(n); } })
        .catch(() => kept().then(r => { if (!settled) { settled = true; done(r || Response.error()); } }));
    }));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});

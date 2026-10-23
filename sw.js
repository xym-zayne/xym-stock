// XYM Inventory – offline shell. Page is always fetched fresh when online (so updates arrive by themselves);
// the saved copy is only used when there is no internet.
const CACHE = 'xym-v20';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'mascot.png', 'mascot-marks.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // data calls go straight to Google
  e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); return res; })
    .catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
});

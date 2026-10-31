// XYM Inventory – offline shell. Page is always fetched fresh when online (so updates arrive by themselves);
// the saved copy is only used when there is no internet.
const CACHE = 'xym-v68';
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

// Phone notifications (Firebase Cloud Messaging): show it, and open the app on Deliveries when tapped
self.addEventListener('push', e => {
  let d = {}; try { const j = e.data ? e.data.json() : {}; d = j.data || j.notification || j; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'XYM Inventory', { body: d.body || '', tag: d.tag || 'xym', renotify: true,
    icon: 'icon-192.png', badge: 'icon-192.png', data: { link: d.link || './?go=deliv' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const link = (e.notification.data && e.notification.data.link) || './?go=deliv';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if ('focus' in c) { c.postMessage({ push: 1 }); return c.focus(); }
    return clients.openWindow(link);
  }));
});

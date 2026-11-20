// Ubah angka versi ini setiap kali Anda mengganti index.html
var C = 'gudang-v4';
var FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(C).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

// Buka dari cache dulu (bisa offline), lalu perbarui diam-diam kalau ada internet
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(C).then(function (c) {
    return c.match(e.request).then(function (cached) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.ok && res.type === 'basic') c.put(e.request, res.clone());
        return res;
      }).catch(function () { return cached || c.match('index.html'); });
      return cached || net;
    });
  }));
});

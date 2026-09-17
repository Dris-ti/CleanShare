self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('cleanshare-v1').then(cache =>
      cache.addAll(['/', '/index.html', '/clean.js', '/style.css'])
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
var CACHE_NAME = 'bo-gifts-v3';
var urlsToCache = ['./', './index.html', './config.js', './manifest.json', './icon-192.png', './apple-touch-icon.png', './pencil.png'];

self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(urlsToCache); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(names) {
    return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  // Let Firebase / Google auth go straight to the network
  if (event.request.method !== 'GET' || url.indexOf('googleapis.com') >= 0 || url.indexOf('gstatic.com') >= 0 ||
      url.indexOf('firebaseio.com') >= 0 || url.indexOf('firebaseapp.com') >= 0 || url.indexOf('google.com') >= 0) return;
  // Network first, fall back to cache when offline
  event.respondWith(
    fetch(event.request).then(function(response) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
      return response;
    }).catch(function() { return caches.match(event.request); })
  );
});

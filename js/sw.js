var staticCacheName = 'rest-static-v3';

if (navigator.serviceWorker) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('js/sw.js').then(function (reg) {
            if (!navigator.serviceWorker.controller) {
                return;
            }

            if (reg.waiting) {
                indexController._updateReady(reg.waiting);
                return;
            }

            if (reg.installing) {
                indexController._trackInstalling(reg.installing);
                return;
            }

            reg.addEventListener('updatefound', function () {
                indexController._trackInstalling(reg.installing);
            });
        });
    });

    self.addEventListener('install', function (event) {
        event.waitUntil(
            caches.open(staticCacheName).then(function (cache) {
                return cache.addAll([
                    '/skeleton',
                    '/index.html',
                    '/restaurant.html',
                    'js/dbhelper.js',
                    'js/restaurant-info.js',
                    'js/main.js',
                    'css/main.css',
                ]);
            })
        );
    });

    self.addEventListener('activate', function (event) {
        event.waitUntil(
            caches.keys().then(function (cacheNames) {
                return Promise.all(
                    cacheNames.filter(function (cacheName) {
                        return cacheName.startsWith('wittr-') &&
                            cacheName != staticCacheName;
                    }).map(function (cacheName) {
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    });

    self.addEventListener('fetch', function (event) {
        // TODO: respond to requests for the root page with
        // the page skeleton from the cache
        let requestUrl = new URL(event.request.url);

        if (requestUrl.origin === location.origin) {
            if (requestUrl.pathname = "/") {
                event.respondWith(caches.match('/skeleton'));
                return;
            }
        }

        event.respondWith(
            caches.match(event.request).then(function (response) {
                return response || fetch(event.request);
            })
        );
    });

    self.addEventListener('message', function (event) {
        if (event.data.action === 'skipWaiting') {
            self.skipWaiting();
        }
    });
}
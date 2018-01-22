var staticCacheName = 'rest-static-v3';

if (navigator.serviceWorker) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').then(function (reg) {

        }).catch(function (err) {
            console.log(err);
        });
    });
}

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
                '/skeleton',
                '/data/restaurants.json',
                '/index.html',
                'restaurant.html',
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
                    return cacheName.startsWith('rest-static-v3') &&
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

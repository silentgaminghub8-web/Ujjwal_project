// Change version number to trigger an update
const CACHE_NAME = 'silent-tournaments-v1'; 

// List of files to cache when the app is installed
const urlsToCache = [
  '/',
  '/index.html'
  // Note: Your CSS and JS are inside index.html, so you don't need to add them here.
  // If you create separate files like style.css, add them to this list.
];

// Install event: This caches the essential app files.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: This cleans up old, unused caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: This serves content from the cache or network.
self.addEventListener('fetch', event => {
  // IMPORTANT: Do not cache API requests to Google Apps Script.
  // Always fetch them from the network to get live data.
  if (event.request.method !== 'GET' || event.request.url.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For all other GET requests, try the cache first.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If we have it in cache, return it.
        if (response) {
          return response;
        }
        // Otherwise, fetch it from the network.
        return fetch(event.request);
      }
    )
  );
});

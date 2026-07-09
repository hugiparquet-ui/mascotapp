// public/sw.js
// Service Worker para Mascotapp - Soporte offline y caché

const CACHE_NAME = 'mascotapp-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalación: guardar en caché los archivos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Archivos cacheados correctamente');
        return cache.addAll(urlsToCache);
      })
      .catch(error => console.error('❌ Error al cachear:', error))
  );
});

// Activación: limpiar cachés antiguas (si cambia la versión)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: servir desde caché o desde la red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devolverlo
        if (response) {
          return response;
        }
        // Si no, ir a la red
        return fetch(event.request).catch(() => {
          // Si falla la red, mostrar página offline (opcional)
          return new Response('Offline - No se pudo cargar el recurso', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
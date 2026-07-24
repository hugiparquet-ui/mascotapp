// public/sw.js - Service Worker optimizado para PWA
// ============================================
// 1. INSTALACIÓN: precache de assets estáticos
// ============================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('mascotapp-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/favicon.svg',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/icons/apple-icon-180.png',
        // Agrega aquí otros assets estáticos que quieras cachear
        // No incluyas rutas dinámicas como /login, /register, /profile, etc.
      ]);
    })
  );
  self.skipWaiting();
});

// ============================================
// 2. ACTIVACIÓN: limpiar cachés antiguas
// ============================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== 'mascotapp-v1')
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ============================================
// 3. INTERCEPTACIÓN DE SOLICITUDES
// ============================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ✅ NO cachear rutas dinámicas (API, autenticación, páginas dinámicas)
  const isDynamicRoute = 
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/profile') ||
    url.pathname.startsWith('/my-pets') ||
    url.pathname.startsWith('/pet/') ||
    url.pathname.startsWith('/adopt') ||
    url.pathname.startsWith('/lost/') ||
    url.pathname.startsWith('/walkers') ||
    url.pathname.startsWith('/businesses') ||
    url.pathname.startsWith('/stray') ||
    url.pathname.startsWith('/rest/v1/') || // API de Supabase
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/functions/');

  // ✅ Cachear solo assets estáticos (JS, CSS, imágenes, fuentes)
  const isStaticAsset = 
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.includes('/icons/') ||
    url.pathname.includes('/assets/');

  // ✅ Estrategia: Network First para páginas dinámicas, Cache First para assets estáticos
  if (isDynamicRoute) {
    // Network First: siempre buscar en la red, y solo si falla, usar caché
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clonar la respuesta para cachearla (opcional)
          return response;
        })
        .catch(() => {
          // Si falla la red, responder con la página offline
          return caches.match('/offline.html');
        })
    );
  } else if (isStaticAsset) {
    // Cache First: buscar en caché, y si no está, ir a la red
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  } else {
    // Para el resto (HTML), usar Network First
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline.html'))
    );
  }
});

// ============================================
// 4. NOTIFICACIONES PUSH
// ============================================
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Mascotapp', {
      body: data.body || '¡Alerta de Mascotapp!',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const url = event.notification.data?.url || '/';
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
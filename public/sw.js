// public/sw.js (Service Worker mejorado con estrategia de cache)

const CACHE_NAME = 'mascotapp-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Limpiar caches antiguas
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Estrategia de cache: Network First para HTML y API, Cache First para estáticos
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Si es una solicitud a la API de Supabase o a la página HTML, no cachear
  if (url.pathname.startsWith('/rest/v1/') || 
      url.pathname === '/' || 
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/register') ||
      url.pathname.startsWith('/pet/')) {
    // Network First: intenta obtener del network, si falla, muestra offline
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clonar la respuesta para almacenarla en caché (opcional)
          return response
        })
        .catch(() => {
          // Si falla, devolver página offline
          return caches.match('/offline.html')
        })
    )
    return
  }

  // Para assets estáticos (JS, CSS, imágenes), usar Cache First
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response
        }
        return fetch(request).then(response => {
          // Guardar en caché para futuras visitas
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone)
          })
          return response
        })
      })
  )
})

// Manejador de notificaciones push (igual que antes)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Mascotapp', {
      body: data.body || '¡Alerta de Mascotapp!',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const url = event.notification.data?.url || '/'
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
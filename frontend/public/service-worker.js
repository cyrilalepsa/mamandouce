const CACHE_NAME = 'mamandouce-v1';
const STATIC_CACHE = 'mamandouce-static-v1';
const DYNAMIC_CACHE = 'mamandouce-dynamic-v1';

// Assets à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Cache des assets statiques');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'no-cache' })))
        .catch(err => {
          console.log('[Service Worker] Erreur cache statique:', err);
        });
    })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas mettre en cache les requêtes API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Stocker les données dans le cache dynamique
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Retourner depuis le cache si hors ligne
          return caches.match(request).then(response => {
            if (response) {
              return response;
            }
            // Retourner une réponse offline personnalisée
            return new Response(JSON.stringify({
              error: 'offline',
              message: 'Vous êtes hors ligne. Les données seront synchronisées lors de la reconnexion.'
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Stratégie Cache First pour les autres ressources
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Mise à jour en arrière-plan
        fetch(request).then(response => {
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, response);
          });
        }).catch(() => {});
        return cachedResponse;
      }

      // Sinon, récupérer depuis le réseau et mettre en cache
      return fetch(request).then((response) => {
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, response.clone());
          return response;
        });
      }).catch(() => {
        // Page offline de fallback
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Background Sync pour les données en attente
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  // Récupérer les données en attente depuis IndexedDB
  const pendingRequests = await getPendingRequests();
  
  for (const req of pendingRequests) {
    try {
      await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body
      });
      // Supprimer de la file d'attente
      await removePendingRequest(req.id);
    } catch (error) {
      console.log('[Service Worker] Sync failed:', error);
    }
  }
}

// Helpers pour IndexedDB (simplifié)
async function getPendingRequests() {
  // Implémentation IndexedDB à faire
  return [];
}

async function removePendingRequest(id) {
  // Implémentation IndexedDB à faire
}

// Notifications Push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push reçu');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MamanDouce';
  const options = {
    body: data.body || 'Nouveau rappel',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Click sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

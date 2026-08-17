// Version du cache - INCRÉMENTEZ À CHAQUE MISE À JOUR IMPORTANTE
const CACHE_VERSION = 'v2.6.3-md-same-origin';
const N2_API_HOST = 'api.neriacorp.com';
const CACHE_NAME = `mamandouce-${CACHE_VERSION}`;
const STATIC_CACHE = `mamandouce-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `mamandouce-dynamic-${CACHE_VERSION}`;

// Assets à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] Installation ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Cache des assets statiques');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
        .catch(err => {
          console.log('[Service Worker] Erreur cache statique:', err);
        });
    })
  );
  // Force l'activation immédiate du nouveau SW
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] Activation ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Supprimer TOUS les anciens caches
            return name.startsWith('mamandouce-') && 
                   name !== STATIC_CACHE && 
                   name !== DYNAMIC_CACHE &&
                   name !== CACHE_NAME;
          })
          .map((name) => {
            console.log(`[Service Worker] Suppression ancien cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log(`[Service Worker] ${CACHE_VERSION} actif et contrôle les clients`);
    })
  );
  // Prendre le contrôle immédiatement de toutes les pages
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Scope PWA = origine courante (mamandouce.neriacorp.com).
  // Ne jamais intercepter https://api.neriacorp.com ni les autres origines.
  if (url.origin !== self.location.origin || url.hostname === N2_API_HOST) {
    return;
  }

  // Same-origin /api/ : réseau uniquement, aucun cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // HTML / navigation : réseau uniquement, JAMAIS de cache index.html
  if (request.destination === 'document' ||
      request.mode === 'navigate' ||
      url.pathname === '/' ||
      url.pathname === '/index.html' ||
      url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // NETWORK FIRST pour JS/CSS
  if (url.pathname.includes('/static/js/') ||
      url.pathname.includes('/static/css/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache First pour les images et autres ressources statiques
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Mise à jour en arrière-plan (stale-while-revalidate)
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
        if (request.destination === 'document') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Message pour forcer la mise à jour depuis le client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skip waiting demandé');
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[Service Worker] Vidage du cache demandé');
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
});

// Background Sync pour les données en attente
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  const pendingRequests = await getPendingRequests();
  
  for (const req of pendingRequests) {
    try {
      await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body
      });
      await removePendingRequest(req.id);
    } catch (error) {
      console.log('[Service Worker] Sync failed:', error);
    }
  }
}

async function getPendingRequests() {
  return [];
}

async function removePendingRequest(id) {
  // Implémentation IndexedDB
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

/* eslint-disable no-restricted-globals */

// VERSION - Increment this to force cache update
const APP_VERSION = '2.2.0';
const CACHE_NAME = `mamandouce-v${APP_VERSION}`;
const STATIC_CACHE = `mamandouce-static-v${APP_VERSION}`;
const DYNAMIC_CACHE = `mamandouce-dynamic-v${APP_VERSION}`;
const OFFLINE_QUEUE_CACHE = `mamandouce-offline-queue-v${APP_VERSION}`;

// Assets to cache on install (expanded for better offline experience)
const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/app-icon-192.png',
  '/app-icon-512.png'
];

// API endpoints to cache for offline use (expanded)
const CACHEABLE_API_PATTERNS = [
  '/api/tips/weekly/',
  '/api/foods',
  '/api/maternity-bag',
  '/api/medical/appointments',
  '/api/embryo/week/',
  '/api/pregnancy/profile',
  '/api/postpartum/content',
  '/api/food-library',
  '/api/birth-list',
  '/api/medical/scheduled-reminders',
  '/api/auth/me'
];

// API endpoints that should be queued when offline (POST/PUT/DELETE)
const QUEUEABLE_API_PATTERNS = [
  '/api/medical/schedule-reminder',
  '/api/medical/complete/',
  '/api/maternity-bag/check',
  '/api/favorites',
  '/api/contact/send'
];

// Install event - cache minimal static assets and skip waiting
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing Service Worker v${APP_VERSION}`);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - DELETE ALL old caches to force fresh content
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating Service Worker v${APP_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete ANY cache that doesn't match current version
            return !name.includes(APP_VERSION);
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] All old caches cleared');
      // Immediately claim all clients
      return self.clients.claim();
    }).then(() => {
      // Notify all clients to refresh
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: APP_VERSION
          });
        });
      });
    })
  );
});

// Check if request should be cached (API data)
const shouldCacheApi = (url) => {
  return CACHEABLE_API_PATTERNS.some(pattern => url.includes(pattern));
};

// Network first strategy - ALWAYS try network first
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.ok && shouldCacheApi(request.url)) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    // Also cache successful static assets for offline use
    if (networkResponse.ok && isStaticAsset(request.url)) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache (offline):', request.url);
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
};

// Check if URL is a static asset worth caching
const isStaticAsset = (url) => {
  return url.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ttf)(\?|$)/);
};

// Check if request should be queued when offline
const shouldQueueOffline = (url) => {
  return QUEUEABLE_API_PATTERNS.some(pattern => url.includes(pattern));
};

// Queue a request for later sync
const queueRequest = async (request) => {
  try {
    const body = await request.clone().text();
    const queueItem = {
      id: Date.now().toString(),
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      timestamp: new Date().toISOString()
    };
    
    const cache = await caches.open(OFFLINE_QUEUE_CACHE);
    const existingQueue = await cache.match('queue');
    let queue = [];
    
    if (existingQueue) {
      queue = await existingQueue.json();
    }
    
    queue.push(queueItem);
    await cache.put('queue', new Response(JSON.stringify(queue)));
    
    console.log('[SW] Request queued for sync:', request.url);
    return true;
  } catch (error) {
    console.error('[SW] Failed to queue request:', error);
    return false;
  }
};

// Process queued requests when back online
const processOfflineQueue = async () => {
  try {
    const cache = await caches.open(OFFLINE_QUEUE_CACHE);
    const existingQueue = await cache.match('queue');
    
    if (!existingQueue) return { processed: 0, failed: 0 };
    
    const queue = await existingQueue.json();
    let processed = 0;
    let failed = 0;
    const remainingQueue = [];
    
    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body || undefined
        });
        
        if (response.ok) {
          processed++;
          console.log('[SW] Synced queued request:', item.url);
        } else {
          failed++;
          remainingQueue.push(item);
        }
      } catch (error) {
        failed++;
        remainingQueue.push(item);
        console.error('[SW] Failed to sync:', item.url, error);
      }
    }
    
    // Update queue with remaining items
    if (remainingQueue.length > 0) {
      await cache.put('queue', new Response(JSON.stringify(remainingQueue)));
    } else {
      await cache.delete('queue');
    }
    
    return { processed, failed };
  } catch (error) {
    console.error('[SW] Error processing queue:', error);
    return { processed: 0, failed: 0 };
  }
};

// Fetch event - ALWAYS network first for HTML/JS/CSS
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching, but handle offline queue
  if (request.method !== 'GET') {
    if (shouldQueueOffline(request.url)) {
      event.respondWith(
        fetch(request.clone())
          .catch(async () => {
            // Queue the request for later sync
            const queued = await queueRequest(request);
            if (queued) {
              return new Response(
                JSON.stringify({ 
                  success: true, 
                  offline: true, 
                  message: 'Action enregistrée, sera synchronisée en ligne' 
                }),
                { 
                  headers: { 'Content-Type': 'application/json' },
                  status: 202 
                }
              );
            }
            return new Response(
              JSON.stringify({ error: 'Offline and could not queue' }),
              { status: 503 }
            );
          })
      );
    }
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // ALWAYS use network first for everything important
  // This ensures users always get the latest version
  event.respondWith(networkFirst(request));
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-data' || event.tag === 'sync-offline-queue') {
    event.waitUntil(
      processOfflineQueue().then(result => {
        console.log(`[SW] Sync complete: ${result.processed} processed, ${result.failed} failed`);
        
        // Notify clients about sync completion
        if (result.processed > 0) {
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_COMPLETE',
                processed: result.processed,
                failed: result.failed
              });
            });
          });
        }
      })
    );
  }
});

// IndexedDB helpers for offline queue (legacy - kept for compatibility)
const DB_NAME = 'mamandouce-offline';
const STORE_NAME = 'pending-actions';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

const getPendingActions = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const removePendingAction = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Push notification handler with scheduled reminders support
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/app-icon-512.png',
    badge: '/app-icon-512.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'default',
    renotify: true,
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'MamanDouce', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Message handler for manual cache clear and sync
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    }).then(() => {
      event.source.postMessage({ type: 'CACHE_CLEARED' });
    });
  }
  
  if (event.data && event.data.type === 'SYNC_NOW') {
    processOfflineQueue().then(result => {
      event.source.postMessage({
        type: 'SYNC_COMPLETE',
        processed: result.processed,
        failed: result.failed
      });
    });
  }
  
  if (event.data && event.data.type === 'GET_QUEUE_STATUS') {
    caches.open(OFFLINE_QUEUE_CACHE).then(async (cache) => {
      const existingQueue = await cache.match('queue');
      if (existingQueue) {
        const queue = await existingQueue.json();
        event.source.postMessage({
          type: 'QUEUE_STATUS',
          pendingCount: queue.length
        });
      } else {
        event.source.postMessage({
          type: 'QUEUE_STATUS',
          pendingCount: 0
        });
      }
    });
  }
});

console.log(`[SW] Service Worker v${APP_VERSION} loaded`);

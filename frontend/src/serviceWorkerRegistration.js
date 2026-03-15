// Enregistrement du Service Worker pour PWA et mode offline
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Use sw.js directly
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('✓ Service Worker enregistré:', registration.scope);
          
          // Vérifier les mises à jour immédiatement
          registration.update();
          
          // Vérifier les mises à jour régulièrement (toutes les 5 minutes)
          setInterval(() => {
            registration.update();
          }, 5 * 60 * 1000);
          
          // Écouter les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // Nouvelle version disponible - forcer la mise à jour
                    console.log('✓ Nouvelle version disponible - mise à jour automatique');
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('✗ Erreur Service Worker:', error);
        });

      // Écouter les messages du Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log('✓ Service Worker mis à jour vers v' + event.data.version);
          // Recharger automatiquement pour obtenir la nouvelle version
          window.location.reload();
        }
        if (event.data && event.data.type === 'CACHE_CLEARED') {
          console.log('✓ Cache vidé');
          window.location.reload();
        }
      });

      // Quand le service worker contrôle change, recharger
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        console.log('✓ Nouveau Service Worker actif - rechargement');
        window.location.reload();
      });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Force le vidage du cache et le rechargement
export async function forceUpdate() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    
    // Demander au SW de vider le cache
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
    
    // Mettre à jour le service worker
    await registration.update();
    
    return true;
  }
  return false;
}

// Gestion de l'installation PWA
let deferredPrompt;

export function setupPWAInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Afficher le bouton d'installation personnalisé
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
    }
    
    console.log('✓ PWA peut être installée');
  });

  window.addEventListener('appinstalled', () => {
    console.log('✓ PWA installée avec succès');
    deferredPrompt = null;
  });
}

export async function installPWA() {
  if (!deferredPrompt) {
    console.log('PWA déjà installée ou non disponible');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`Installation PWA: ${outcome}`);
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

// Détection du mode offline
export function setupOfflineDetection() {
  function updateOnlineStatus() {
    const status = navigator.onLine ? 'online' : 'offline';
    console.log(`Statut connexion: ${status}`);
    
    // Dispatche un événement personnalisé
    window.dispatchEvent(new CustomEvent('connectionChange', { 
      detail: { online: navigator.onLine } 
    }));
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Vérifier le statut initial
  updateOnlineStatus();
}

// Enregistrement Background Sync
export async function registerBackgroundSync(tag = 'sync-data') {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.sync.register(tag);
      console.log('✓ Background Sync enregistré');
      return true;
    } catch (error) {
      console.error('✗ Erreur Background Sync:', error);
      return false;
    }
  }
  return false;
}

// Demande de permission pour les notifications push
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Ce navigateur ne supporte pas les notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Sauvegarder les données localement (fallback offline)
export function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde localStorage:', error);
    return false;
  }
}

export function getFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur lecture localStorage:', error);
    return null;
  }
}

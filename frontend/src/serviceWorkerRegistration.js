// Enregistrement du Service Worker pour PWA et mode offline
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('✓ Service Worker enregistré:', registration.scope);
          
          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('✓ Nouvelle version disponible');
                  // Optionnel: afficher un message pour recharger
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('✗ Erreur Service Worker:', error);
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

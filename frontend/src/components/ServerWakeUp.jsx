import { useState, useEffect, useCallback } from 'react';

/**
 * Composant qui vérifie si le backend est disponible et le réveille si nécessaire.
 * Affiche un écran de chargement élégant pendant le processus.
 * Cache également la bannière "Wake up servers" d'Emergent.
 */
export function ServerWakeUp({ children }) {
  const [serverStatus, setServerStatus] = useState('checking'); // checking, waking, ready, error
  const [attempt, setAttempt] = useState(0);
  const maxAttempts = 10; // Plus de tentatives
  
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const checkServer = useCallback(async () => {
    try {
      // Essayer de contacter le backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setServerStatus('ready');
        // Cacher la bannière Emergent si elle existe
        hideEmergentBanner();
      } else {
        throw new Error('Server not ready');
      }
    } catch (error) {
      if (attempt < maxAttempts) {
        setServerStatus('waking');
        setAttempt(prev => prev + 1);
        // Réessayer après un délai
        setTimeout(() => checkServer(), 2000);
      } else {
        setServerStatus('error');
      }
    }
  }, [API_URL, attempt, maxAttempts]);

  // Fonction pour cacher la bannière Emergent
  const hideEmergentBanner = () => {
    // Chercher et cacher les éléments de la bannière Emergent
    const selectors = [
      '[class*="wake"]',
      '[class*="preview"]',
      '[id*="wake"]',
      '[id*="preview"]'
    ];
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el.textContent?.toLowerCase().includes('wake') || 
              el.textContent?.toLowerCase().includes('preview')) {
            el.style.display = 'none';
          }
        });
      } catch (e) {
        // Ignorer les erreurs
      }
    });

    // Observer pour cacher les futurs éléments
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const text = node.textContent?.toLowerCase() || '';
            if (text.includes('wake') && text.includes('server')) {
              node.style.display = 'none';
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    // Arrêter l'observer après 30 secondes
    setTimeout(() => observer.disconnect(), 30000);
  };

  useEffect(() => {
    // Injecter le CSS pour cacher la bannière Emergent
    const style = document.createElement('style');
    style.textContent = `
      /* Cacher la bannière Wake up servers d'Emergent */
      [class*="emergent-wake"],
      [class*="preview-banner"],
      [id*="emergent-wake"],
      div[style*="position: fixed"][style*="bottom"]:has(button:contains("Wake")),
      .emergent-banner,
      .wake-banner {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    // Commencer à vérifier le serveur
    checkServer();

    // Essayer de cacher la bannière immédiatement
    hideEmergentBanner();

    // Vérifier périodiquement et cacher la bannière
    const interval = setInterval(hideEmergentBanner, 1000);
    
    return () => {
      clearInterval(interval);
      document.head.removeChild(style);
    };
  }, []);

  // Retry manuel
  const handleRetry = () => {
    setAttempt(0);
    setServerStatus('checking');
    checkServer();
  };

  // Si le serveur est prêt, afficher l'application
  if (serverStatus === 'ready') {
    return children;
  }

  // Afficher l'écran de chargement pendant le réveil
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sky-100 via-pink-50 to-purple-100 flex items-center justify-center z-[99999]">
      <div className="text-center p-8">
        {/* Logo animé */}
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto relative">
            {/* Cercle de chargement */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#fce7f3"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="70 200"
                className="origin-center"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Icône centrale */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">🤱</span>
            </div>
          </div>
        </div>

        {/* Texte de chargement */}
        <h1 
          className="text-2xl font-bold text-slate-700 mb-2"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          MamanDouce
        </h1>
        
        <div className="space-y-2">
          {serverStatus === 'checking' && (
            <p className="text-slate-500 animate-pulse">Connexion en cours...</p>
          )}
          
          {serverStatus === 'waking' && (
            <>
              <p className="text-slate-500">Réveil de l'application...</p>
              <p className="text-xs text-slate-400">Cela peut prendre quelques secondes</p>
              <div className="flex justify-center gap-1 mt-3">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i < attempt ? 'bg-pink-400' : 'bg-pink-200'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {serverStatus === 'error' && (
            <div className="space-y-3">
              <p className="text-rose-500">Le serveur met du temps à répondre</p>
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>

        {/* Message d'encouragement */}
        {serverStatus !== 'error' && (
          <p className="text-xs text-slate-400 mt-6 max-w-xs mx-auto">
            Merci de votre patience
          </p>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

/**
 * Composant qui vérifie si le backend est disponible et le réveille si nécessaire.
 * Affiche un écran de chargement élégant pendant le processus.
 */
export function ServerWakeUp({ children }) {
  const [serverStatus, setServerStatus] = useState('checking'); // checking, waking, ready, error
  const [attempt, setAttempt] = useState(0);
  const maxAttempts = 5;
  
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      setServerStatus('checking');
      
      // Essayer de contacter le backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${API_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setServerStatus('ready');
      } else {
        throw new Error('Server not ready');
      }
    } catch (error) {
      if (attempt < maxAttempts) {
        setServerStatus('waking');
        setAttempt(prev => prev + 1);
        // Réessayer après un délai
        setTimeout(checkServer, 3000);
      } else {
        setServerStatus('error');
      }
    }
  };

  // Si le serveur est prêt, afficher l'application
  if (serverStatus === 'ready') {
    return children;
  }

  // Afficher l'écran de chargement pendant le réveil
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sky-100 via-pink-50 to-purple-100 flex items-center justify-center z-[9999]">
      <div className="text-center p-8">
        {/* Logo animé */}
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto relative">
            {/* Cercle de chargement */}
            <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
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
              <p className="text-slate-500">Préparation de l'application...</p>
              <div className="flex justify-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < attempt ? 'bg-pink-400' : 'bg-pink-200'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {serverStatus === 'error' && (
            <div className="space-y-3">
              <p className="text-rose-500">Impossible de se connecter au serveur</p>
              <button
                onClick={() => {
                  setAttempt(0);
                  checkServer();
                }}
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
            L'application se prépare pour vous offrir la meilleure expérience
          </p>
        )}
      </div>
      
      {/* Animation CSS */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * NewsBubble.jsx
 * Bulle "Nouveautés" en forme de fleur de lotus
 * S'ouvre quand il y a des nouveautés, fermée sinon
 */

import { useState, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { getLatestVersion, getUpdatesSince } from '../../data/appUpdates';

const NEWS_STORAGE_KEY = 'mamandouce_last_seen_version';

/**
 * Hook pour gérer l'état des nouveautés
 */
export function useNews() {
  const [hasNews, setHasNews] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  useEffect(() => {
    checkForNews();
  }, []);
  
  const checkForNews = () => {
    const lastSeenVersion = localStorage.getItem(NEWS_STORAGE_KEY);
    const currentVersion = getLatestVersion();
    
    if (!lastSeenVersion || lastSeenVersion !== currentVersion) {
      const newUpdates = getUpdatesSince(lastSeenVersion);
      if (newUpdates.length > 0) {
        setUpdates(newUpdates);
        setHasNews(true);
      }
    }
  };
  
  const markAsSeen = () => {
    localStorage.setItem(NEWS_STORAGE_KEY, getLatestVersion());
    localStorage.setItem('mamandouce_badges_seen', JSON.stringify([]));
    setHasNews(false);
    setIsPopupOpen(false);
  };
  
  const openPopup = () => {
    setIsPopupOpen(true);
  };
  
  const closePopup = () => {
    setIsPopupOpen(false);
  };
  
  return {
    hasNews,
    updates,
    isPopupOpen,
    openPopup,
    closePopup,
    markAsSeen
  };
}

/**
 * Bulle Ampoule - Nouveautés
 * Allumée (jaune brillant) = il y a des nouveautés
 * Éteinte (grise) = rien de nouveau
 * Position: fixe, au-dessus du bouton info, même taille (w-10 h-10)
 * SANS BULLE - juste l'icône ampoule
 */
export function NewsBubble({ hasNews, onClick }) {
  return (
    <button
      onClick={onClick}
      data-testid="news-bubble"
      style={{
        position: 'fixed',
        bottom: '3.25rem',
        left: '0.75rem',
        zIndex: 9999,
        width: 38,
        height: 38,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hasNews
          ? 'linear-gradient(160deg, #fef9c3 0%, #fde68a 40%, #fbbf24 80%, #f59e0b 100%)'
          : 'linear-gradient(160deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
        boxShadow: hasNews
          ? '0 4px 10px -2px rgba(245,158,11,0.35), inset -2px -2px 6px rgba(0,0,0,0.06), inset 2px 2px 6px rgba(255,255,255,0.7)'
          : '0 3px 8px -2px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(0,0,0,0.04), inset 2px 2px 5px rgba(255,255,255,0.7)',
        border: '1px solid rgba(255,255,255,0.6)',
        overflow: 'visible',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Ampoule SVG - Sans fond, juste l'icône */}
      <svg 
        viewBox="0 0 24 24" 
        className="w-7 h-7 drop-shadow-lg"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Corps de l'ampoule */}
        <path 
          d="M9 18h6" 
          stroke={hasNews ? '#eab308' : '#94a3b8'}
        />
        <path 
          d="M10 22h4" 
          stroke={hasNews ? '#eab308' : '#94a3b8'}
        />
        <path 
          d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"
          fill={hasNews ? '#fef08a' : 'transparent'}
          stroke={hasNews ? '#ca8a04' : '#94a3b8'}
        />
        
        {/* Rayons lumineux - visibles seulement quand allumée */}
        {hasNews && (
          <g stroke="#facc15" strokeWidth="2.5" className="animate-pulse">
            <line x1="12" y1="-1" x2="12" y2="0" />
            <line x1="4.5" y1="4.5" x2="5.5" y2="5.5" />
            <line x1="19.5" y1="4.5" x2="18.5" y2="5.5" />
            <line x1="2" y1="10" x2="3" y2="10" />
            <line x1="21" y1="10" x2="22" y2="10" />
          </g>
        )}
      </svg>
      
      {/* Badge notification quand allumée */}
      {hasNews && (
        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-md" />
      )}
    </button>
  );
}

/**
 * Popup des nouveautés - Style nuage pastel
 */
export function NewsPopup({ isVisible, updates, onClose, onMarkAsSeen }) {
  if (!isVisible || !updates || updates.length === 0) return null;
  
  const latestUpdate = updates[0];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Overlay doux rose */}
      <div className="absolute inset-0 bg-pink-100/60 backdrop-blur-md"></div>
      
      {/* Modal nuage */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm w-full select-none animate-in zoom-in-95 duration-300"
      >
        {/* Effets nuage rose */}
        <div className="absolute -top-6 -left-4 w-24 h-24 bg-pink-200/60 rounded-full blur-3xl"></div>
        <div className="absolute -top-4 -right-6 w-20 h-20 bg-rose-100/60 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 bg-fuchsia-100/50 rounded-full blur-2xl"></div>
        
        {/* Contenu */}
        <div 
          className="relative rounded-[32px] overflow-hidden shadow-[0_8px_40px_rgba(236,72,153,0.2)] border border-pink-100/60"
        >
          {/* Header gradient */}
          <div 
            className="p-5 text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)'
            }}
          >
            {/* Décorations */}
            <div className="absolute top-2 left-4 text-xl animate-bounce">🌸</div>
            <div className="absolute top-3 right-8 text-lg animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
            
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Nouveautés</h2>
                <p className="text-white/80 text-xs">Version {latestUpdate.version}</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div 
            className="p-5 max-h-[50vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(253,242,248,0.95) 100%)'
            }}
          >
            {updates.length > 1 && (
              <p className="text-xs text-slate-500 mb-3">
                {updates.length} mise(s) à jour depuis votre dernière visite
              </p>
            )}
            
            <ul className="space-y-2.5">
              {updates.slice(0, 2).flatMap(update => 
                update.features.map((feature, index) => (
                  <li key={`${update.version}-${index}`} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-slate-700">{feature.text}</span>
                      {feature.badge && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                          <Sparkles className="w-2.5 h-2.5" />
                          NOUVEAU
                        </span>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
          
          {/* Footer */}
          <div className="p-4 bg-pink-50/80 border-t border-pink-100">
            <button
              onClick={onMarkAsSeen}
              className="w-full py-3 rounded-2xl font-bold text-white transition-all active:scale-[0.98] relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4), inset 0 -3px 8px rgba(0,0,0,0.1)'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                C'est parti ! <ArrowRight className="w-4 h-4" />
              </span>
              {/* Reflet glossy */}
              <div 
                className="absolute top-0 left-1 right-1 h-[45%] rounded-full pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}
              />
            </button>
            
            <p className="text-center text-[10px] text-slate-400 mt-2">
              Retrouvez l'historique dans Profil → Mises à jour
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsBubble;

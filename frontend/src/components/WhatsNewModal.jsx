import { useState, useEffect } from 'react';
import { X, Sparkles, Gift, ArrowRight, Check } from 'lucide-react';
import { getLatestVersion, getUpdatesSince } from '../data/appUpdates';

export default function WhatsNewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    // Vérifier si l'utilisateur a vu la dernière version
    const lastSeenVersion = localStorage.getItem('mamandouce_last_seen_version');
    const currentVersion = getLatestVersion();
    
    // Si pas de version vue ou version différente
    if (!lastSeenVersion || lastSeenVersion !== currentVersion) {
      const newUpdates = getUpdatesSince(lastSeenVersion);
      if (newUpdates.length > 0) {
        setUpdates(newUpdates);
        // Petit délai pour que l'app charge d'abord
        setTimeout(() => setIsOpen(true), 1500);
      }
    }
  }, []);

  const handleClose = () => {
    // Marquer comme vu
    localStorage.setItem('mamandouce_last_seen_version', getLatestVersion());
    localStorage.setItem('mamandouce_badges_seen', JSON.stringify([]));
    setIsOpen(false);
  };

  if (!isOpen || updates.length === 0) return null;

  const latestUpdate = updates[0];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-white relative overflow-hidden">
          {/* Confetti decoration */}
          <div className="absolute top-2 left-4 text-2xl animate-bounce">🎉</div>
          <div className="absolute top-4 right-6 text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
          <div className="absolute bottom-2 right-12 text-lg animate-bounce" style={{ animationDelay: '0.4s' }}>🎊</div>
          
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Quoi de neuf ?</h2>
              <p className="text-white/80 text-sm">Version {latestUpdate.version}</p>
            </div>
          </div>
          
          <p className="text-white/90 text-sm">{latestUpdate.title}</p>
        </div>
        
        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[50vh]">
          {updates.length > 1 && (
            <p className="text-xs text-slate-500 mb-4">
              {updates.length} mise(s) à jour depuis votre dernière visite
            </p>
          )}
          
          {updates.slice(0, 2).map((update, updateIndex) => (
            <div key={update.version} className={updateIndex > 0 ? 'mt-6 pt-6 border-t border-slate-100' : ''}>
              {updateIndex > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-slate-700">{update.title}</span>
                  <span className="text-xs text-slate-400">v{update.version}</span>
                </div>
              )}
              
              <ul className="space-y-3">
                {update.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-slate-700">{feature.text}</span>
                      {feature.badge && (
                        <span className="ml-2 inline-flex items-center gap-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" />
                          NOUVEAU
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {updates.length > 2 && (
            <p className="text-xs text-center text-slate-400 mt-4">
              + {updates.length - 2} autre(s) mise(s) à jour
            </p>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            C'est parti ! <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="text-center text-xs text-slate-400 mt-3">
            Retrouvez l'historique dans Profil → Mises à jour
          </p>
        </div>
      </div>
    </div>
  );
}

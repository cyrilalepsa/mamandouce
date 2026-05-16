import { useState, useEffect } from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

/**
 * Maintenance Banner Component
 * Displays a dismissible alert when there are known service issues
 * 
 * To disable this banner, set SHOW_BANNER to false or delete this component import from App.js
 */

const SHOW_BANNER = false; // Set to true to show the banner

const MaintenanceBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed this banner (for this session)
    const dismissed = sessionStorage.getItem('maintenance_banner_dismissed_april2025');
    if (!dismissed && SHOW_BANNER) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('maintenance_banner_dismissed_april2025', 'true');
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (!isVisible || !SHOW_BANNER) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        isDismissed ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="bg-gradient-to-r from-sky-200 via-blue-200 to-sky-200 text-slate-700 px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-blue-300/50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-700">
                Perturbations temporaires
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Notre hébergeur rencontre des difficultés techniques. 
                Si vous avez des problèmes de connexion, veuillez réessayer dans quelques minutes.
                Vos données sont en sécurité.
              </p>
              
              {/* Actions */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-400/30 hover:bg-blue-400/50 
                           text-blue-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Réessayer
                </button>
                <span className="text-xs text-slate-500">
                  Mise à jour : 2 avril 2025
                </span>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-400/20 hover:bg-slate-400/30 
                       flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceBanner;

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pin, X, Lightbulb } from 'lucide-react';

const STORAGE_KEY = 'mamandouce_pin_tip_seen';

export function PinTipBanner({ onDismiss }) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu le tip
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="mb-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-amber-800">{t('home.pinTip', 'Astuce')}</span>
            <Pin className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-sm text-amber-700">
            {t('home.pinTipBanner', 'Épinglez vos catégories préférées pour les garder toujours ouvertes !')}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-amber-600" />
        </button>
      </div>
      <button
        onClick={handleDismiss}
        className="mt-3 w-full py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-semibold rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all"
      >
        {t('home.gotIt', 'Compris !')}
      </button>
    </div>
  );
}

export function PinTooltip({ show, onClose, targetRef }) {
  const { t } = useTranslation();
  
  if (!show) return null;

  return (
    <div className="absolute z-50 right-0 top-full mt-2 w-48 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-lg animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Pin className="w-3 h-3" />
        <span className="font-semibold">{t('home.pinTip', 'Astuce')}</span>
      </div>
      <p className="text-slate-300">
        {t('home.pinTipBanner', 'Cliquez ici pour épingler cette section')}
      </p>
      <div className="absolute -top-2 right-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-slate-800"></div>
      <button 
        onClick={onClose}
        className="mt-2 text-amber-400 hover:text-amber-300 font-medium"
      >
        {t('home.gotIt', 'OK')}
      </button>
    </div>
  );
}

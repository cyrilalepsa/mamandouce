import { useState, useEffect, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/card';
import { Lock, ChevronDown, Pin, PinOff } from 'lucide-react';
import { toast } from 'sonner';

// Styles pastel "CHAMALLOW 3D" pour les cartes - Semi-transparent avec backdrop-filter
export const PASTEL_STYLES = {
  pink: {
    background: 'rgba(255, 240, 245, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  sky: {
    background: 'rgba(224, 247, 250, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  green: {
    background: 'rgba(220, 252, 231, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  purple: {
    background: 'rgba(243, 232, 255, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  amber: {
    background: 'rgba(254, 243, 199, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  red: {
    background: 'rgba(254, 226, 226, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  violet: {
    background: 'rgba(245, 243, 255, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
  slate: {
    background: 'rgba(241, 245, 249, 0.7)',
    boxShadow: '10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF',
  },
};

// Composant carte pastel "CHAMALLOW 3D" bombée pour mosaïques
export function PastelMosaicCard({ color = 'pink', onClick, children, className = '', testId, locked = false }) {
  const style = PASTEL_STYLES[color] || PASTEL_STYLES.pink;
  return (
    <div
      onClick={onClick}
      data-testid={testId}
      className={`relative overflow-hidden rounded-2xl p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center ${className}`}
      style={{
        background: locked ? PASTEL_STYLES.slate.background : style.background,
        boxShadow: locked ? PASTEL_STYLES.slate.boxShadow : style.boxShadow,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '20px',
        color: '#4A4A4A',
      }}
    >
      {/* Voile blanc supprimé */}
      <div className="relative" style={{ color: '#4A4A4A' }}>
        {children}
      </div>
    </div>
  );
}

// Composant carte pastel "CHAMALLOW 3D" pleine largeur (pill)
export function PastelPillCard({ color = 'purple', onClick, children, className = '', testId }) {
  const style = PASTEL_STYLES[color] || PASTEL_STYLES.purple;
  return (
    <div
      onClick={onClick}
      data-testid={testId}
      className={`relative overflow-hidden rounded-full px-4 py-2.5 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${className}`}
      style={{
        background: style.background,
        boxShadow: style.boxShadow,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: '#4A4A4A',
      }}
    >
      {/* Voile blanc supprimé */}
      <div className="relative" style={{ color: '#4A4A4A' }}>
        {children}
      </div>
    </div>
  );
}

// Context pour gérer les sections épinglées
const PinnedSectionsContext = createContext({
  pinnedSections: [],
  togglePin: () => {},
  isPinned: () => false
});

export function PinnedSectionsProvider({ children }) {
  const [pinnedSections, setPinnedSections] = useState([]);

  useEffect(() => {
    // Charger les sections épinglées depuis localStorage
    const saved = localStorage.getItem('mamandouce_pinned_sections');
    if (saved) {
      setPinnedSections(JSON.parse(saved));
    }
  }, []);

  const togglePin = (sectionId) => {
    setPinnedSections(prev => {
      const newPinned = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
      
      localStorage.setItem('mamandouce_pinned_sections', JSON.stringify(newPinned));
      // Les toasts sont gérés dans CollapsibleSection pour avoir accès aux traductions
      return newPinned;
    });
  };

  const isPinned = (sectionId) => pinnedSections.includes(sectionId);

  return (
    <PinnedSectionsContext.Provider value={{ pinnedSections, togglePin, isPinned }}>
      {children}
    </PinnedSectionsContext.Provider>
  );
}

export function usePinnedSections() {
  return useContext(PinnedSectionsContext);
}

// Composant réutilisable pour les sections déroulantes - exporté pour usage externe
export function CollapsibleSection({ title, icon: Icon, iconColor, children, defaultOpen = false, sectionId }) {
  const { t } = useTranslation();
  const { isPinned, togglePin } = usePinnedSections();
  const pinned = sectionId ? isPinned(sectionId) : false;
  const [isOpen, setIsOpen] = useState(defaultOpen || pinned);
  
  // Mettre à jour l'état si la section est épinglée
  useEffect(() => {
    if (pinned) {
      setIsOpen(true);
    }
  }, [pinned]);
  
  // Si title est un composant React, on l'affiche directement
  const isCustomTitle = typeof title !== 'string';
  
  const handleToggle = () => {
    // Si épinglée, on ne peut pas fermer (sauf si on désépingle)
    if (pinned && isOpen) {
      toast.info(t('home.pinnedCantClose', 'Cette section est épinglée. Cliquez sur 📌 pour la désépingler.'));
      return;
    }
    setIsOpen(!isOpen);
  };
  
  const handlePin = () => {
    const wasPinned = pinned;
    togglePin(sectionId);
    // Le message toast est géré ici au lieu du provider pour avoir accès à t()
    if (!wasPinned) {
      toast.success(t('home.sectionPinned', 'Section épinglée ! Elle restera toujours ouverte.'));
    } else {
      toast.info(t('home.sectionUnpinned', 'Section désépinglée.'));
    }
  };
  
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1">
        <button 
          onClick={handleToggle}
          className="flex-1 flex items-center justify-between py-2 group"
        >
          {isCustomTitle ? (
            <h2 className="text-base font-bold text-slate-600 flex items-center gap-2 truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {title}
              {pinned && <Pin className="w-3 h-3 text-pink-500 fill-pink-500 flex-shrink-0" />}
            </h2>
          ) : (
            <h2 className="text-base font-bold text-slate-600 flex items-center gap-2 truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {Icon && <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />}
              <span className="truncate">{title}</span>
              {pinned && <Pin className="w-3 h-3 text-pink-500 fill-pink-500 flex-shrink-0" />}
            </h2>
          )}
          <ChevronDown 
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {/* Bouton épingler */}
        {sectionId && (
          <button
            onClick={handlePin}
            className={`p-1.5 transition-all hover:scale-110 flex-shrink-0 ${
              pinned 
                ? 'text-pink-600' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title={pinned ? t('home.unpinSection', 'Désépingler cette section') : t('home.pinSection', 'Épingler cette section (toujours ouverte)')}
          >
            {pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pt-2">
          {children}
          
          {/* Bouton fermer en bas */}
          <button
            onClick={() => {
              if (pinned) {
                toast.info(t('home.pinnedCantClose', 'Cette section est épinglée. Cliquez sur 📌 pour la désépingler.'));
                return;
              }
              setIsOpen(false);
            }}
            className={`w-full mt-3 p-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
              pinned 
                ? 'bg-pink-50 text-pink-400 cursor-not-allowed' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5 rotate-180" />
            <span className="text-xs font-semibold">{pinned ? t('home.sectionPinnedLabel', 'Section épinglée') : t('common.close', 'Fermer')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


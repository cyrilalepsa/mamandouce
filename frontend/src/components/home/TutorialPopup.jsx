import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Info, Lightbulb, Hand, Trash2, FolderPlus, Copy, Home, Moon, ChevronRight, ChevronLeft, Sparkles, Play } from 'lucide-react';

const TUTORIAL_STORAGE_KEY = 'mamandouce_tutorial_dismissed';
const INTERACTIVE_TUTORIAL_KEY = 'mamandouce_interactive_tutorial_done';

// Contenu du popup info (astuces) - mis à jour avec les nouvelles fonctionnalités
const INFO_CONTENT = [
  {
    icon: Copy,
    titleKey: 'tutorial.duplicate',
    title: 'Dupliquer une carte',
    descKey: 'tutorial.duplicateDesc',
    desc: 'Appui long (1s) sur une carte pour la dupliquer vers vos pages personnalisées'
  },
  {
    icon: Trash2,
    titleKey: 'tutorial.delete',
    title: 'Supprimer une carte',
    descKey: 'tutorial.deleteDesc',
    desc: 'Sur vos pages perso, appui long (1s) sur une carte pour la supprimer'
  },
  {
    icon: FolderPlus,
    titleKey: 'tutorial.createGroup',
    title: 'Créer un groupe',
    descKey: 'tutorial.createGroupDesc',
    desc: 'Appui long sur une carte puis glissez sur une autre pour les grouper'
  },
  {
    icon: Hand,
    titleKey: 'tutorial.deletePage',
    title: 'Supprimer une page',
    descKey: 'tutorial.deletePageDesc',
    desc: 'Appui long sur une zone vide d\'une page vide pour la supprimer'
  },
  {
    icon: Home,
    titleKey: 'tutorial.homeButton',
    title: 'Bouton Accueil',
    descKey: 'tutorial.homeButtonDesc',
    desc: 'Tap = aller à l\'accueil • Appui long = définir la page actuelle comme accueil'
  },
  {
    icon: Moon,
    titleKey: 'tutorial.darkMode',
    title: 'Mode sombre',
    descKey: 'tutorial.darkModeDesc',
    desc: 'Cliquez sur la lune en haut à gauche pour activer/désactiver le mode sombre'
  },
  {
    icon: Lightbulb,
    titleKey: 'tutorial.newsBubble',
    title: 'Nouveautés',
    descKey: 'tutorial.newsBubbleDesc',
    desc: 'L\'ampoule s\'allume quand il y a des nouveautés. Cliquez pour les consulter'
  }
];

// Étapes du tutoriel interactif (première connexion)
const INTERACTIVE_STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenue sur MamanDouce ! 🌸',
    description: 'Découvrons ensemble les fonctionnalités de votre application',
    popupPosition: 'center',
    highlight: null
  },
  {
    id: 'dark-mode',
    title: 'Mode sombre 🌙',
    description: 'Appuyez sur la lune pour activer le mode sombre',
    popupPosition: 'bottom', // Photo 1: Popup en bas
    highlight: 'dark-mode-toggle'
  },
  {
    id: 'swipe',
    title: 'Navigation par swipe 👆',
    description: 'Glissez vers la gauche pour accéder à vos pages personnalisées',
    popupPosition: 'top',
    highlight: null,
    showSwipeAnimation: true
  },
  {
    id: 'duplicate',
    title: 'Dupliquer une carte 📋',
    description: 'Appui long (1 seconde) sur une carte pour la dupliquer vers vos pages',
    popupPosition: 'bottom',
    highlight: null,
    showLongPressAnimation: true
  },
  {
    id: 'pagination',
    title: 'Navigation entre pages 📍',
    description: 'Utilisez les bulles colorées pour naviguer entre vos pages',
    popupPosition: 'top', // Photo 2: Popup en haut
    highlight: 'page-dots'
  },
  {
    id: 'home-button',
    title: 'Bouton Accueil 🏠',
    description: 'Tap = retour à l\'accueil\nAppui long = définir comme page par défaut',
    popupPosition: 'top', // Photo 3: Popup en haut
    highlight: 'page-dots'
  },
  {
    id: 'news',
    title: 'Nouveautés 💡',
    description: 'L\'ampoule s\'allume quand il y a des nouveautés à découvrir !',
    popupPosition: 'top', // Photo 4: Popup en haut
    highlight: 'news-bubble'
  },
  {
    id: 'info',
    title: 'Aide & Astuces ℹ️',
    description: 'Cliquez ici à tout moment pour revoir ces astuces',
    popupPosition: 'top', // Photo 5: Popup en haut
    highlight: 'tutorial-info-button'
  },
  {
    id: 'done',
    title: 'Vous êtes prête ! ✨',
    description: 'Explorez et personnalisez votre espace à votre guise',
    popupPosition: 'center',
    highlight: null
  }
];

// Fonction pour lancer les confettis CSS de célébration
const launchConfetti = () => {
  // Créer le conteneur de confettis
  const container = document.createElement('div');
  container.id = 'confetti-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `;
  document.body.appendChild(container);

  // Couleurs des confettis - style MamanDouce
  const colors = ['#f472b6', '#ec4899', '#fbbf24', '#f9a8d4', '#fde68a', '#a78bfa', '#34d399'];
  
  // Créer 50 confettis
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 2 + Math.random() * 2;
    const size = 8 + Math.random() * 8;
    
    confetti.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${left}%;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confetti-fall ${duration}s ease-out ${delay}s forwards;
    `;
    container.appendChild(confetti);
  }

  // Ajouter l'animation CSS si elle n'existe pas
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Supprimer le conteneur après l'animation
  setTimeout(() => {
    container.remove();
  }, 4000);
};

// Composant tutoriel interactif (première connexion)
export function InteractiveTutorial({ isVisible, onComplete, isFirstTime = true }) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Reset step when becoming visible
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  const step = INTERACTIVE_STEPS[currentStep];
  const isLastStep = currentStep === INTERACTIVE_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  
  const handleNext = () => {
    if (isLastStep) {
      // Lancer les confettis seulement à la première fois
      if (isFirstTime) {
        launchConfetti();
      }
      // Délai pour voir les confettis avant de fermer
      setTimeout(() => {
        onComplete();
      }, isFirstTime ? 800 : 0);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };

  // Calculer la position du popup en fonction de l'étape
  const getPopupPositionClass = () => {
    switch (step.popupPosition) {
      case 'top':
        return 'top-20 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'bottom-28 left-1/2 -translate-x-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Overlay semi-transparent avec trou pour l'élément highlight */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={handleSkip}
      />
      
      {/* Spotlight sur l'élément à mettre en évidence */}
      {step.highlight && (
        <HighlightSpotlight elementId={step.highlight} popupPosition={step.popupPosition} />
      )}
      
      {/* Animation de swipe */}
      {step.showSwipeAnimation && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative w-40 h-20">
            <div className="absolute w-12 h-12 rounded-full bg-white/30 animate-swipe-demo flex items-center justify-center">
              <span className="text-2xl">👆</span>
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2" />
            <ChevronLeft className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50" />
          </div>
        </div>
      )}
      
      {/* Animation d'appui long */}
      {step.showLongPressAnimation && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 animate-long-press-demo">
              <div className="w-full h-full rounded-full bg-pink-400/50 animate-ping" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">👆</span>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-xs whitespace-nowrap">
              Maintenir 1 seconde
            </div>
          </div>
        </div>
      )}
      
      {/* Popup avec info de l'étape - position dynamique */}
      <div 
        className={`absolute ${getPopupPositionClass()} max-w-[300px] w-[85vw] pointer-events-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="relative rounded-3xl p-5 shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(253,242,248,0.95) 100%)',
            border: '2px solid rgba(244, 114, 182, 0.3)'
          }}
        >
          {/* Indicateur d'étape */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1">
              {INTERACTIVE_STEPS.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'bg-pink-500 w-4' 
                      : index < currentStep 
                        ? 'bg-pink-300' 
                        : 'bg-pink-100'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Passer
            </button>
          </div>
          
          {/* Contenu */}
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            {step.title}
          </h3>
          <p className="text-sm text-slate-600 whitespace-pre-line mb-4">
            {step.description}
          </p>
          
          {/* Boutons de navigation */}
          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="flex-1 py-2.5 rounded-xl font-medium text-slate-600 transition-all active:scale-95"
                style={{
                  background: 'rgba(241, 245, 249, 0.9)',
                  border: '1px solid rgba(203, 213, 225, 0.5)'
                }}
              >
                <ChevronLeft className="w-4 h-4 inline mr-1" />
                Précédent
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 rounded-xl font-bold text-white transition-all active:scale-95 relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
              }}
            >
              <span className="relative z-10">
                {isLastStep ? 'C\'est parti ! 🎉' : 'Suivant'}
                {!isLastStep && <ChevronRight className="w-4 h-4 inline ml-1" />}
              </span>
              <div 
                className="absolute top-0 left-1 right-1 h-[45%] rounded-full pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}
              />
            </button>
          </div>
        </div>
      </div>
      
      {/* CSS pour les animations */}
      <style>{`
        @keyframes swipe-demo {
          0%, 100% { transform: translateX(40px); opacity: 1; }
          50% { transform: translateX(-40px); opacity: 0.5; }
        }
        .animate-swipe-demo {
          animation: swipe-demo 2s ease-in-out infinite;
        }
        @keyframes long-press-demo {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(0.9); }
        }
        .animate-long-press-demo {
          animation: long-press-demo 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Composant spotlight pour mettre en évidence un élément
function HighlightSpotlight({ elementId, popupPosition }) {
  const [position, setPosition] = useState(null);
  
  useEffect(() => {
    // Fonction pour trouver et positionner le spotlight
    const findAndHighlight = () => {
      const element = document.querySelector(`[data-testid="${elementId}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top - 12,
          left: rect.left - 12,
          width: rect.width + 24,
          height: rect.height + 24,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        });
        return true;
      }
      return false;
    };
    
    // Essayer immédiatement
    if (findAndHighlight()) return;
    
    // Si pas trouvé, réessayer plusieurs fois avec délai
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts++;
      if (findAndHighlight() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, [elementId]);
  
  // Positions de fallback avec coordonnées fixes
  const fallbackPositions = {
    'dark-mode-toggle': { top: 85, left: 120, width: 60, height: 60, centerX: 150, centerY: 115 },
    'news-bubble': { top: 'calc(100vh - 190px)', left: 14, width: 60, height: 60, useFallbackStyle: true },
    'tutorial-info-button': { top: 'calc(100vh - 140px)', left: 14, width: 60, height: 60, useFallbackStyle: true },
    'page-dots': { top: 'calc(100vh - 110px)', left: 'calc(50% - 80px)', width: 160, height: 50, useFallbackStyle: true }
  };

  const pos = position || fallbackPositions[elementId];
  if (!pos) return null;

  // Déterminer si la flèche doit pointer vers le haut ou vers le bas
  // Si le popup est en haut (popupPosition === 'top'), l'élément est en bas → flèche pointe vers le bas (sous l'élément)
  // Si le popup est en bas (popupPosition === 'bottom'), l'élément est en haut → flèche pointe vers le haut (au-dessus de l'élément)
  const arrowPointsUp = popupPosition === 'bottom'; // L'élément est en HAUT, donc on pointe vers le haut
  
  // Calculer la position de la flèche
  const getArrowStyle = () => {
    if (arrowPointsUp) {
      // Flèche AU-DESSUS de l'élément (élément en haut de l'écran)
      return {
        top: typeof pos.top === 'number' ? pos.top + pos.height + 10 : `calc(${pos.top} + ${pos.height}px + 10px)`,
        left: typeof pos.left === 'number' ? pos.left + pos.width / 2 - 20 : `calc(${pos.left} + ${pos.width / 2}px - 20px)`
      };
    } else {
      // Flèche EN-DESSOUS pointant vers le haut (élément en bas de l'écran)
      return {
        top: typeof pos.top === 'number' ? pos.top - 50 : `calc(${pos.top} - 50px)`,
        left: typeof pos.left === 'number' ? pos.left + pos.width / 2 - 20 : `calc(${pos.left} + ${pos.width / 2}px - 20px)`
      };
    }
  };

  return (
    <>
      {/* Cercle lumineux pulsant autour de l'élément */}
      <div 
        className="fixed pointer-events-none z-[199]"
        style={{
          top: pos.top,
          left: pos.left,
          width: pos.width,
          height: pos.height
        }}
      >
        {/* Cercle extérieur pulsant */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            border: '4px solid #f472b6',
            boxShadow: '0 0 20px rgba(244, 114, 182, 0.8), 0 0 40px rgba(244, 114, 182, 0.4), inset 0 0 20px rgba(244, 114, 182, 0.3)',
            animation: 'spotlight-pulse 1.5s ease-in-out infinite'
          }}
        />
        
        {/* Cercle intérieur */}
        <div 
          className="absolute inset-2 rounded-full"
          style={{
            border: '2px dashed rgba(255, 255, 255, 0.8)',
            animation: 'spotlight-rotate 4s linear infinite'
          }}
        />
      </div>
      
      {/* Flèche pointant vers l'élément - direction dynamique */}
      <div 
        className="fixed pointer-events-none z-[199]"
        style={getArrowStyle()}
      >
        <div 
          className="text-4xl"
          style={{
            animation: arrowPointsUp ? 'arrow-bounce 1s ease-in-out infinite' : 'arrow-bounce-down 1s ease-in-out infinite',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            transform: arrowPointsUp ? 'rotate(0deg)' : 'rotate(180deg)'
          }}
        >
          👆
        </div>
      </div>
      
      {/* CSS pour les animations */}
      <style>{`
        @keyframes spotlight-pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        @keyframes spotlight-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes arrow-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes arrow-bounce-down {
          0%, 100% { transform: translateY(0) rotate(180deg); }
          50% { transform: translateY(10px) rotate(180deg); }
        }
      `}</style>
    </>
  );
}

// Composant flèche pour le tutoriel
function TutorialArrow({ direction }) {
  const getArrowStyle = () => {
    switch (direction) {
      case 'top-left':
        return { top: '-20px', left: '20px', transform: 'rotate(-135deg)' };
      case 'top-right':
        return { top: '-20px', right: '20px', transform: 'rotate(-45deg)' };
      case 'bottom':
        return { bottom: '-20px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' };
      case 'left':
        return { top: '50%', left: '-20px', transform: 'translateY(-50%) rotate(135deg)' };
      case 'right':
        return { top: '50%', right: '-20px', transform: 'translateY(-50%) rotate(-45deg)' };
      default:
        return {};
    }
  };
  
  return (
    <div 
      className="absolute w-4 h-4 bg-white border-b-2 border-r-2 border-pink-300"
      style={getArrowStyle()}
    />
  );
}

// Popup info (astuces) - accessible via le bouton info
export function TutorialPopup({ isVisible, onClose, isPremium = false, onReplayTutorial }) {
  const { t } = useTranslation();
  
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Overlay doux vert menthe */}
      <div className="absolute inset-0 bg-emerald-50/60 backdrop-blur-sm"></div>
      
      {/* Modal nuage blanc vert menthe - taille comme sur la photo */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full select-none animate-in slide-in-from-bottom-4 duration-300"
        style={{ 
          WebkitUserSelect: 'none', 
          WebkitTouchCallout: 'none'
        }}
      >
        {/* Effets nuage vert menthe */}
        <div className="absolute -top-6 -left-4 w-24 h-24 bg-emerald-100/60 rounded-full blur-3xl"></div>
        <div className="absolute -top-4 -right-6 w-20 h-20 bg-teal-100/60 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 bg-cyan-100/50 rounded-full blur-2xl"></div>
        
        {/* Contenu */}
        <div 
          className="relative rounded-[32px] p-5 shadow-[0_8px_40px_rgba(16,185,129,0.15)] border border-emerald-100/60 flex flex-col"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(236,253,245,0.95) 40%, rgba(167,243,208,0.85) 80%, rgba(110,231,183,0.75) 100%)',
            maxHeight: 'calc(100vh - 120px)'
          }}
        >
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-sm z-10"
          >
            <X className="w-5 h-5 text-emerald-500" />
          </button>
          
          {/* Header */}
          <div className="text-center mb-4">
            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                boxShadow: '0 4px 15px rgba(16,185,129,0.4)'
              }}
            >
              <Info className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-emerald-800">
              {t('tutorial.title', 'Astuces & Aide')}
            </h3>
          </div>
          
          {/* Liste des astuces - scrollable */}
          <div className="space-y-2 mb-4 overflow-y-auto flex-1 pr-1" style={{ maxHeight: 'calc(100vh - 350px)' }}>
            {INFO_CONTENT.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="flex items-start gap-3 bg-white/70 rounded-xl p-3 border border-emerald-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-emerald-800 text-sm">
                      {t(item.titleKey, item.title)}
                    </h4>
                    <p className="text-xs text-emerald-700 leading-snug mt-0.5">
                      {t(item.descKey, item.desc)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Message Premium si non premium */}
          {!isPremium && (
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-2 mb-3 border border-yellow-200">
              <p className="text-xs text-yellow-700 text-center">
                <span className="font-semibold">✨ Premium :</span> Déplacez et redimensionnez !
              </p>
            </div>
          )}
          
          {/* Boutons d'action */}
          <div className="flex gap-3 flex-shrink-0">
            {/* Bouton Revoir le tutoriel - Jaune foncé */}
            {onReplayTutorial && (
              <button
                onClick={() => {
                  onClose();
                  onReplayTutorial();
                }}
                className="flex-1 py-3 rounded-2xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
                  boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)',
                  color: '#92400e',
                  border: '1px solid rgba(251, 191, 36, 0.4)'
                }}
              >
                <Play className="w-4 h-4" />
                <span>Tutoriel</span>
              </button>
            )}
            
            {/* Bouton Compris */}
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(209,250,229,0.9) 50%, rgba(167,243,208,0.85) 100%)',
                boxShadow: '0 4px 15px rgba(16,185,129,0.2)',
                color: '#059669',
                border: '1px solid rgba(16,185,129,0.3)'
              }}
            >
              {t('tutorial.gotIt', 'Compris !')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bouton Info flottant - VERT DÉGRADÉ NUAGE BOMBÉ GLOSSY 3D
export function InfoButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      data-testid="tutorial-info-button"
      style={{
        position: 'fixed',
        bottom: '4.5rem',
        left: '0.75rem',
        zIndex: 9999,
        width: 38,
        height: 38,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #d1fae5 0%, #6ee7b7 40%, #34d399 80%, #10b981 100%)',
        boxShadow: '0 4px 10px -2px rgba(16,185,129,0.35), inset -2px -2px 6px rgba(0,0,0,0.06), inset 2px 2px 6px rgba(255,255,255,0.7)',
        border: '1px solid rgba(255,255,255,0.6)',
        overflow: 'visible',
      }}
    >
      <Info className="w-4 h-4" style={{ color: '#FFFFFF' }} />
    </button>
  );
}

// Hook pour gérer l'état du tutoriel
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInteractiveTutorial, setShowInteractiveTutorial] = useState(false);
  const [tutorialDismissed, setTutorialDismissed] = useState(false);
  const [isFirstTimeTutorial, setIsFirstTimeTutorial] = useState(true);
  
  useEffect(() => {
    // Vérifier si le tutoriel interactif a déjà été complété
    const interactiveDone = localStorage.getItem(INTERACTIVE_TUTORIAL_KEY);
    const tutorialDone = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    
    if (interactiveDone) {
      // Tutoriel interactif déjà fait = ne plus l'afficher
      setTutorialDismissed(true);
      setIsFirstTimeTutorial(false);
    } else {
      // Première connexion = afficher le tutoriel interactif
      setShowInteractiveTutorial(true);
      setIsFirstTimeTutorial(true);
    }
  }, []);
  
  const completeInteractiveTutorial = () => {
    localStorage.setItem(INTERACTIVE_TUTORIAL_KEY, 'true');
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setShowInteractiveTutorial(false);
    setTutorialDismissed(true);
    setIsFirstTimeTutorial(false);
  };
  
  const dismissTutorial = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setShowTutorial(false);
  };
  
  const openTutorial = () => {
    setShowTutorial(true);
  };
  
  // Rejouer le tutoriel interactif à la demande (pas de confettis)
  const replayInteractiveTutorial = () => {
    setShowTutorial(false);
    setIsFirstTimeTutorial(false);
    setShowInteractiveTutorial(true);
  };
  
  // Fermer le tutoriel interactif lors du replay
  const closeInteractiveTutorial = () => {
    setShowInteractiveTutorial(false);
  };
  
  return {
    showTutorial,
    showInteractiveTutorial,
    tutorialDismissed,
    isFirstTimeTutorial,
    dismissTutorial,
    openTutorial,
    completeInteractiveTutorial,
    replayInteractiveTutorial,
    closeInteractiveTutorial
  };
}

export default TutorialPopup;

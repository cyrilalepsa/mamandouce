import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, ChevronRight, Check, Pin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useHomeLayout } from '../contexts/HomeLayoutContext';
import { useTheme } from '../contexts/ThemeContext';

// Métadonnées des sections
// Métadonnées des sections - Dégradés accentués vers le blanc + bonbon pastel
const SECTION_META = {
  'preconception': { 
    icon: Sparkles, 
    name: 'En route vers la grossesse',
    nameKey: 'sections.preconception',
    description: 'Préparez votre corps et votre esprit',
    descKey: 'sections.preconceptionDesc',
    bgGradient: 'from-white/95 via-violet-100/70 to-purple-100/50',
    borderColor: 'border-violet-200/50',
    iconColor: 'text-violet-600',
  },
  'pregnancy': { 
    icon: Baby, 
    name: 'Grossesse',
    nameKey: 'sections.pregnancy',
    description: 'Suivez votre grossesse semaine par semaine',
    descKey: 'sections.pregnancyDesc',
    bgGradient: 'from-white/95 via-pink-100/70 to-rose-100/50',
    borderColor: 'border-pink-200/50',
    iconColor: 'text-pink-600',
  },
  'baby-preparation': { 
    icon: Gift, 
    name: 'Préparer l\'arrivée de bébé',
    nameKey: 'sections.babyPreparation',
    description: 'Tout pour accueillir votre bébé',
    descKey: 'sections.babyPreparationDesc',
    bgGradient: 'from-white/95 via-purple-100/70 to-violet-100/50',
    borderColor: 'border-purple-200/50',
    iconColor: 'text-purple-600',
  },
  'postpartum': { 
    icon: HeartHandshake, 
    name: 'Suivi post-partum',
    nameKey: 'sections.postpartum',
    description: 'Accompagnement après l\'accouchement',
    descKey: 'sections.postpartumDesc',
    bgGradient: 'from-white/95 via-rose-100/70 to-pink-100/50',
    borderColor: 'border-rose-200/50',
    iconColor: 'text-rose-600',
  },
  'services': { 
    icon: Settings, 
    name: 'Services et ressources',
    nameKey: 'sections.services',
    description: 'Outils et ressources utiles',
    descKey: 'sections.servicesDesc',
    bgGradient: 'from-white/95 via-sky-100/70 to-blue-100/50',
    borderColor: 'border-sky-200/50',
    iconColor: 'text-sky-600',
  },
};

const SECTIONS_ORDER = ['preconception', 'pregnancy', 'baby-preparation', 'postpartum', 'services'];

// Items pour l'accordéon - correspondant exactement à SectionDetailPage
const SECTION_ITEMS = {
  'preconception': [
    { id: 'cycle-tracking', icon: '📅', name: 'Suivi de fertilité', nameKey: 'preconception.cycleTracking', route: '/cycle-tracking' },
    { id: 'fertility-calc', icon: '📊', name: 'Calculateur fertilité', nameKey: 'preconception.fertilityCalc', route: '/fertility-calculator' },
    { id: 'preparation-advice', icon: '💡', name: 'Préparation et conseils', nameKey: 'preconception.preparationAdvice', route: '/preconception-tips' },
  ],
  'pregnancy': [
    { id: 'food-scanner', icon: '📷', name: 'Scanner aliments', nameKey: 'pregnancy.scanner', route: '/scanner', color: 'yellow' },
    { id: 'tips-evolution', icon: '📖', name: 'Évolution et conseils', nameKey: 'pregnancy.tipsAndEvolution', route: '/tips', color: 'yellow' },
    { id: 'medical-appointments', icon: '🩺', name: 'Rendez-vous médicaux', nameKey: 'pregnancy.appointments', route: '/medical', color: 'yellow' },
    { id: 'pregnancy-tracking', icon: '📈', name: 'Suivi grossesse', nameKey: 'pregnancy.tracking', route: '/tracking', color: 'yellow' },
    { id: 'baby-names', icon: '👶', name: 'Liste des Prénoms', nameKey: 'pregnancy.babyNames', route: '/baby-names', color: 'blue' },
    { id: 'reminders', icon: '🔔', name: 'Rappels', nameKey: 'pregnancy.reminders', route: '/reminders', color: 'red' },
    { id: 'recipes', icon: '🍽️', name: 'Recettes bébé', nameKey: 'pregnancy.recipes', route: '/recipes', color: 'red' },
    { id: 'baby-weight', icon: '⚖️', name: 'Poids de bébé', nameKey: 'pregnancy.babyWeight', route: '/baby-weight', color: 'red' },
    { id: 'kick-counter', icon: '👣', name: 'Compteur de coups', nameKey: 'pregnancy.kickCounter', route: '/kick-counter', color: 'red' },
    { id: 'parental-leave', icon: '⚖️', name: 'Congés parentaux', nameKey: 'pregnancy.parentalLeave', route: '/parental-leave', color: 'green' },
    { id: 'maternity-leave', icon: '📅', name: 'Mon congé maternité', nameKey: 'pregnancy.maternityLeave', route: '/section/pregnancy?focus=maternity-leave', color: 'violet' },
  ],
  'baby-preparation': [
    { id: 'birth-list', icon: '📝', name: 'Liste de naissance', nameKey: 'babyPrep.birthList', route: '/birth-list' },
    { id: 'maternity-bag', icon: '🧳', name: 'Valise maternité', nameKey: 'babyPrep.maternityBag', route: '/maternity-bag' },
    { id: 'prep-tips', icon: '💡', name: 'Conseils & Préparation', nameKey: 'babyPrep.prepTips', route: '/baby-prep-tips' },
    { id: 'videos-resources', icon: '🎬', name: 'Vidéos & Ressources', nameKey: 'babyPrep.videosResources', route: '/baby-videos' },
  ],
  'postpartum': [
    { id: 'postpartum-rdv', icon: '🩺', name: 'RDV médicaux', nameKey: 'postpartum.rdv', route: '/postpartum/rdv' },
    { id: 'postpartum-alimentation', icon: '🍼', name: 'Alimentation', nameKey: 'postpartum.alimentation', route: '/postpartum/alimentation' },
    { id: 'postpartum-soins', icon: '👶', name: 'Soins quotidiens', nameKey: 'postpartum.soins', route: '/postpartum/soins' },
    { id: 'postpartum-securite', icon: '🛡️', name: 'Sécurité', nameKey: 'postpartum.securite', route: '/postpartum/securite' },
  ],
  'services': [
    { id: 'caf', icon: '🏛️', name: 'CAF', nameKey: 'services.caf', route: 'https://www.caf.fr', external: true },
    { id: 'ameli', icon: '🏥', name: 'Ameli', nameKey: 'services.ameli', route: 'https://www.ameli.fr', external: true },
    { id: 'maps', icon: '📍', name: 'Mairie proche', nameKey: 'services.maps', route: 'https://www.google.com/maps/search/mairie', external: true },
    { id: 'videos', icon: '🎬', name: 'Vidéos', nameKey: 'services.videos', route: 'https://www.youtube.com/results?search_query=grossesse+conseils', external: true },
  ],
};

// Popup discret pour dupliquer - Style gris translucide iOS
function DuplicatePopup({ sectionId, sectionName, pages, onDuplicate, onCancel, onCreatePage, t }) {
  const userPages = pages.filter(p => !p.isDefault);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  
  // Première page utilisateur comme défaut
  const firstUserPage = userPages.length > 0 ? userPages[0] : null;
  
  const handleCreateAndDuplicate = () => {
    const pageName = newPageName.trim(); // Nom optionnel - peut être vide
    onCreatePage(pageName, sectionId);
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4 select-none"
      onClick={onCancel}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
    >
      {/* Popup avec fond gris translucide */}
      <div 
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
        className="relative rounded-[28px] p-5 mx-4 max-w-[300px] w-full select-none animate-in zoom-in-95 duration-200"
        style={{ 
          background: 'rgba(60, 60, 67, 0.45)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'blur(40px)',
          WebkitUserSelect: 'none', 
          WebkitTouchCallout: 'none' 
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div 
            className="w-11 h-11 mx-auto mb-2 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35), inset 0 -3px 8px rgba(0,0,0,0.1)'
            }}
          >
            <span className="text-white text-lg relative z-10">📋</span>
            {/* Voile blanc supprimé */}
          </div>
          <h3 className="text-base font-bold text-white">
            {t('journey.duplicateTo', 'Dupliquer vers...')}
          </h3>
          {sectionName && (
            <p className="text-xs text-white/60 mt-0.5">{sectionName}</p>
          )}
        </div>
            
        {/* Liste des pages */}
        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
          {userPages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => onDuplicate(page.id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all active:scale-[0.97]"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: page.color || ['#c7d2fe', '#fecdd3', '#bbf7d0', '#fde68a', '#ddd6fe'][index % 5]
                }}
              />
              <span className="font-medium text-white/90 text-sm">Page {index + 1}</span>
              {index === 0 && (
                <span className="text-[10px] bg-white/20 text-white/70 px-1.5 py-0.5 rounded-full ml-auto">
                  {t('duplicate.default', 'défaut')}
                </span>
              )}
            </button>
          ))}
          
          {userPages.length === 0 && (
            <p className="text-center text-white/50 text-xs py-2">
              {t('journey.noUserPages', 'Aucune page personnalisée')}
            </p>
          )}
              
          {/* Bouton créer nouvelle page - Effet bombé rose */}
          <button
            onClick={handleCreateAndDuplicate}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl transition-all active:scale-[0.97] relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 40%, #f9a8d4 100%)',
              boxShadow: '0 4px 15px rgba(244, 114, 182, 0.3), inset 0 -3px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(244, 114, 182, 0.3)'
            }}
          >
            <span className="text-pink-600 text-base relative z-10">+</span>
            <span className="font-semibold text-pink-700 text-sm relative z-10">
              {t('journey.createNewPage', 'Créer une nouvelle page')}
            </span>
            {/* Voile blanc supprimé */}
          </button>
        </div>
            
        {/* Bouton Annuler - Semi-transparent */}
        <button 
          onClick={onCancel}
          className="w-full p-2.5 rounded-2xl transition-all active:scale-[0.97]"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <span className="font-medium text-white/90 text-sm">
            {t('common.cancel', 'Annuler')}
          </span>
        </button>
      </div>
    </div>
  );
}

// Carte de section style PILL avec épingle accordéon
function SectionCard({ sectionId, onClick, onLongPress, isSelected, isPinned, onTogglePin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const meta = SECTION_META[sectionId];
  const Icon = meta.icon;
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  const items = SECTION_ITEMS[sectionId] || [];
  
  // Couleurs de texte conditionnelles pour le mode sombre
  // Couleurs de texte avec ombre pour lisibilité en mode sombre
  const textColorTitle = isDarkMode ? 'text-white' : 'text-slate-700';
  const textColorDesc = isDarkMode ? 'text-white' : 'text-slate-500';
  const textColorItem = isDarkMode ? 'text-white' : 'text-slate-600';
  
  // Style d'ombre pour mode sombre
  const darkTextShadow = isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {};
  
  // Fond des cartes - adapté au mode sombre
  const getCardBackground = (id) => {
    if (isDarkMode) {
      return 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(30,41,59,0.9) 50%, rgba(15,23,42,0.85) 100%)';
    }
    // Mode clair : Blanc Intense Nacré Bombé — blanc brillant avec subtile nacre
    return 'linear-gradient(160deg, #ffffff 0%, #fefefe 20%, #fafafa 50%, #f5f5f7 80%, #f0f0f2 100%)';
  };
  
  // Bordure des cartes
  const getCardBorder = (id) => {
    if (isDarkMode) {
      switch(id) {
        case 'preconception': return '2px solid rgba(234,179,8,0.4)';
        case 'pregnancy': return '2px solid rgba(14,165,233,0.4)';
        case 'baby-preparation': return '2px solid rgba(239,68,68,0.4)';
        case 'postpartum': return '2px solid rgba(34,197,94,0.4)';
        default: return '2px solid rgba(139,92,246,0.4)';
      }
    }
    // Bordure perle — blanc semi-transparent
    return '1px solid rgba(255,255,255,0.7)';
  };
  
  // Box shadow des cartes - NACRE BOMBÉ GLOSSY
  const getCardShadow = (id) => {
    if (isDarkMode) {
      return '0 8px 20px -4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)';
    }
    // Double box-shadow : ombre portée + ombre interne pour volume bombé
    return '0 6px 18px -2px rgba(0,0,0,0.12), 0 3px 8px -1px rgba(0,0,0,0.06), inset -4px -4px 10px rgba(0,0,0,0.06), inset 4px 4px 10px rgba(255,255,255,0.9)';
  };

  const handleTouchStart = (e) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      onLongPress(sectionId, t(meta.nameKey, meta.name));
    }, 500);
  };

  const handleTouchEnd = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    // Si c'était un appui court (pas un long press), simuler le clic
    if (!isLongPress.current) {
      // Le handleClick sera déclenché naturellement
    }
  };
  
  const handleTouchMove = (e) => {
    // Annuler le long press si l'utilisateur bouge
    clearTimeout(longPressTimer.current);
  };

  const handleClick = (e) => {
    // Si appui long ou si déroulé, ne pas naviguer
    if (isLongPress.current || isPinned) return;
    onClick();
  };

  const handlePinClick = (e) => {
    e.stopPropagation();
    onTogglePin?.(sectionId);
  };

  // Navigation vers un item spécifique (ou lien externe)
  const handleItemClick = (route, external = false) => {
    if (external) {
      window.open(route, '_blank', 'noopener,noreferrer');
    } else {
      navigate(route);
    }
  };

  return (
    <div className="transition-all duration-300">
      {/* Carte principale - style pill fine avec coins demi-cercle et effet bombé */}
      <div 
        className={`
          relative overflow-hidden cursor-pointer select-none section-card
          rounded-full px-5 py-2.5
          transition-all duration-300
          ${!isPinned ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
          ${isSelected ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
        `}
        style={{ 
          background: getCardBackground(sectionId),
          border: getCardBorder(sectionId),
          boxShadow: getCardShadow(sectionId),
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          borderRadius: '20px',
          color: '#000000',
          WebkitUserSelect: 'none', 
          WebkitTouchCallout: 'none' 
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={() => clearTimeout(longPressTimer.current)}
        onContextMenu={(e) => e.preventDefault()}
        data-testid={`section-card-${sectionId}`}
      >
        {/* Voile blanc supprimé — Zéro voile sur les cartes */}
        
        {/* Badge sélection */}
        {isSelected && (
          <div className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center z-10 shadow-sm">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
        
        <div className="relative flex items-center gap-4 pr-4">
          {/* Icône dans bulle COLORÉE pleine + icône blanche */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: sectionId === 'preconception' ? 'linear-gradient(145deg, #fbbf24, #f59e0b)'
                : sectionId === 'pregnancy' ? 'linear-gradient(145deg, #60a5fa, #3b82f6)'
                : sectionId === 'baby-preparation' ? 'linear-gradient(145deg, #f87171, #ef4444)'
                : sectionId === 'postpartum' ? 'linear-gradient(145deg, #4ade80, #22c55e)'
                : 'linear-gradient(145deg, #a78bfa, #8b5cf6)',
              boxShadow: '0 4px 10px -2px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)',
              border: 'none',
            }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          
          {/* Texte */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold ${textColorTitle} text-base`} style={{ ...darkTextShadow, position: 'relative', zIndex: 10 }}>
              {t(meta.nameKey, meta.name)}
            </h3>
            <p className={`text-sm ${textColorDesc} truncate`} style={{ ...darkTextShadow, position: 'relative', zIndex: 10 }}>
              {isPinned ? t('journey.tapItemToEnter', 'Touchez un élément') : t(meta.descKey, meta.description)}
            </p>
          </div>
          
          {/* Bouton épingle - bulle nacre bombée */}
          <button
            onClick={handlePinClick}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isPinned 
                ? 'linear-gradient(145deg, #fce7f3, #fbcfe8)' 
                : 'linear-gradient(160deg, #ffffff 0%, #fafafa 40%, #f0f0f2 100%)',
              border: isPinned 
                ? '1px solid rgba(244, 114, 182, 0.3)' 
                : '1px solid rgba(255,255,255,0.7)',
              boxShadow: '0 3px 6px -1px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(0,0,0,0.05), inset 2px 2px 5px rgba(255,255,255,0.8)'
            }}
            data-testid={`pin-${sectionId}`}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'text-pink-500 rotate-45' : 'text-red-300'}`} />
          </button>
        </div>
      </div>

      {/* Contenu déroulé (mosaïque blanche) */}
      {isPinned && (
        <div className="mt-2 mx-0.5 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-3 gap-1.5">
            {items.slice(0, 6).map((item, index) => {
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.route, item.external)}
                  className="relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all active:scale-95"
                  style={{ 
                    background: isDarkMode ? 'rgba(30,41,59,0.9)' : 'linear-gradient(160deg, #ffffff 0%, #fefefe 25%, #fafafa 55%, #f5f5f7 100%)',
                    border: isDarkMode ? '1px solid rgba(71,85,105,0.5)' : '1px solid rgba(255,255,255,0.9)',
                    boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.06)' : '0 4px 12px -2px rgba(0,0,0,0.08), inset -2px -2px 6px rgba(0,0,0,0.04), inset 2px 2px 6px rgba(255,255,255,0.9)',
                    animationDelay: `${index * 30}ms` 
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`text-[10px] ${textColorItem} font-medium text-center leading-tight`} style={{ ...darkTextShadow, position: 'relative', zIndex: 10 }}>{t(item.nameKey, item.name)}</span>
                </button>
              );
            })}
          </div>
          {items.length > 6 && (
            <button
              onClick={() => navigate(`/section/${sectionId}`)}
              className="w-full mt-2 px-4 py-2 text-center text-xs text-pink-500 font-medium hover:text-pink-600"
            >
              {t('journey.seeAll', 'Voir tout')} ({items.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function JourneyStepsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pages, addPage, duplicateItemToPage } = useHomeLayout();
  const { isDarkMode } = useTheme();
  
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSectionName, setSelectedSectionName] = useState('');
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  
  // Style d'ombre pour mode sombre
  const darkTextShadow = isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {};
  
  // État des sections épinglées/déroulées (stockées dans localStorage)
  const [pinnedSections, setPinnedSections] = useState(() => {
    const saved = localStorage.getItem('mamandouce_expanded_journey_sections');
    return saved ? JSON.parse(saved) : [];
  });

  // Toggle épingle = dérouler/replier (uniquement par clic direct sur l'épingle)
  const togglePin = (sectionId) => {
    setPinnedSections(prev => {
      const newPinned = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
      localStorage.setItem('mamandouce_expanded_journey_sections', JSON.stringify(newPinned));
      return newPinned;
    });
  };

  // Navigation vers la page de détail de la section
  const handleSectionClick = (sectionId) => {
    // Pour postpartum, rediriger directement vers la page de contenu
    if (sectionId === 'postpartum') {
      navigate('/postpartum');
    } else {
      navigate(`/section/${sectionId}`);
    }
  };

  // Appui long pour dupliquer
  const handleLongPress = (sectionId, sectionName) => {
    setSelectedSection(sectionId);
    setSelectedSectionName(sectionName);
    setShowDuplicatePopup(true);
  };

  // Dupliquer vers une page existante
  const handleDuplicate = async (pageId) => {
    if (duplicateItemToPage && selectedSection) {
      await duplicateItemToPage(selectedSection, pageId);
      toast.success(t('journey.duplicatedSuccess', 'Section dupliquée !'));
    }
    setShowDuplicatePopup(false);
    setSelectedSection(null);
  };

  // Créer une nouvelle page et dupliquer
  const handleCreatePageAndDuplicate = async (pageName, sectionId) => {
    if (addPage) {
      // pageName peut être vide - c'est optionnel
      const success = await addPage(pageName);
      if (success) {
        // Attendre un peu puis dupliquer
        setTimeout(async () => {
          const newPages = pages;
          const newPage = newPages[newPages.length - 1];
          if (newPage && !newPage.isDefault && duplicateItemToPage) {
            await duplicateItemToPage(sectionId, newPage.id);
            toast.success(t('journey.pageCreatedAndDuplicated', 'Page créée et section dupliquée !'));
          }
        }, 300);
      }
    }
    setShowDuplicatePopup(false);
    setSelectedSection(null);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 pt-8 sm:pt-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-white/50'}`}
            data-testid="back-button"
          >
            <ArrowLeft className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-slate-600'}`} />
          </Button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
              <h1 
                className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500'}`}
                style={{ fontFamily: "'Caveat', cursive", ...darkTextShadow }}
              >
                {t('home.journeySteps', 'Les étapes de votre plus beau voyage')}
              </h1>
              <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-white' : 'text-slate-400'}`} style={darkTextShadow}>
              {t('journey.longPressHint', 'Appui long pour dupliquer · Clic pour entrer')}
            </p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Les 5 sections en cartes pill avec accordéon */}
        <div className="space-y-3">
          {SECTIONS_ORDER.map((sectionId) => (
            <SectionCard
              key={sectionId}
              sectionId={sectionId}
              onClick={() => handleSectionClick(sectionId)}
              onLongPress={handleLongPress}
              isSelected={selectedSection === sectionId}
              isPinned={pinnedSections.includes(sectionId)}
              onTogglePin={togglePin}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
            <Heart className="w-4 h-4 text-pink-300" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Popup de duplication */}
      {showDuplicatePopup && (
        <DuplicatePopup
          sectionId={selectedSection}
          sectionName={selectedSectionName}
          pages={pages}
          onDuplicate={handleDuplicate}
          onCancel={() => {
            setShowDuplicatePopup(false);
            setSelectedSection(null);
          }}
          onCreatePage={handleCreatePageAndDuplicate}
          t={t}
        />
      )}
    </div>
  );
}

export default JourneyStepsPage;

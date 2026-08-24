import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, 
  Check, Pin, PinOff, CalendarHeart, ScanBarcode, Apple, History,
  Stethoscope, Bell, BookHeart, Users, ChevronRight, Crown, Lock,
  ClipboardList, Briefcase, Video, Youtube, Book, Phone, LineChart,
  Scale, Lightbulb, Building2, Hospital, MapPin, ExternalLink, Utensils, Shield, FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useHomeLayout } from '../contexts/HomeLayoutContext';
import { useSubscription } from '../components/SubscriptionGate';
import { useTheme } from '../contexts/ThemeContext';
import { MaternityLeaveSummaryCard } from '../components/pregnancy/MaternityLeaveSummaryCard';

// Métadonnées des sections
const SECTION_META = {
  'preconception': { 
    icon: Sparkles, 
    name: 'En route vers la grossesse',
    nameKey: 'sections.preconception',
    bgGradient: 'from-white/95 via-violet-50/70 to-purple-50/50',
    accentColor: 'text-violet-600',
    bgColor: 'bg-violet-50/50',
  },
  'pregnancy': { 
    icon: Baby, 
    name: 'Grossesse',
    nameKey: 'sections.pregnancy',
    bgGradient: 'from-white/95 via-pink-50/70 to-rose-50/50',
    accentColor: 'text-pink-600',
    bgColor: 'bg-pink-50/50',
  },
  'baby-preparation': { 
    icon: Gift, 
    name: 'Préparer l\'arrivée de bébé',
    nameKey: 'sections.babyPreparation',
    bgGradient: 'from-white/95 via-purple-50/70 to-violet-50/50',
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50/50',
  },
  'postpartum': { 
    icon: HeartHandshake, 
    name: 'Suivi post-partum',
    nameKey: 'sections.postpartum',
    bgGradient: 'from-white/95 via-rose-50/70 to-pink-50/50',
    accentColor: 'text-rose-600',
    bgColor: 'bg-rose-50/50',
  },
  'services': { 
    icon: Settings, 
    name: 'Services et ressources',
    nameKey: 'sections.services',
    bgGradient: 'from-white/95 via-sky-50/70 to-blue-50/50',
    accentColor: 'text-sky-600',
    bgColor: 'bg-sky-50/50',
  },
};

// Contenu de chaque section (cartes individuelles) - Dégradés accentués vers le blanc + bonbon pastel
const SECTION_ITEMS = {
  'preconception': [
    { id: 'cycle-tracking', icon: CalendarHeart, iconColor: 'text-yellow-500', bgColor: 'yellow', title: 'Suivi de fertilité', titleKey: 'preconception.cycleTracking', desc: 'Règles, ovulation, nidation', descKey: 'preconception.cycleDesc', route: '/cycle-tracking' },
    { id: 'fertility-calc', icon: LineChart, iconColor: 'text-blue-600', bgColor: 'blue', title: 'Calculateur fertilité', titleKey: 'preconception.fertilityCalc', desc: 'Prochaines règles & ovulation', descKey: 'preconception.fertilityDesc', route: '/fertility-calculator' },
    { id: 'preparation-advice', icon: Lightbulb, iconColor: 'text-red-600', bgColor: 'red', title: 'Préparation et conseils', titleKey: 'preconception.preparationAdvice', desc: 'Acide folique, nutrition...', descKey: 'preconception.preparationDesc', route: '/preconception-tips' },
  ],
  'pregnancy': [
    // Partie Alimentation (4 premières cartes) - ORANGE PÊCHE avec effet bombé
    { id: 'food-scanner', icon: ScanBarcode, iconColor: 'text-yellow-500', bgColor: 'yellow', title: 'Scanner', titleKey: 'pregnancy.scanner', desc: 'Aliments', descKey: 'pregnancy.foods', route: '/scanner' },
    { id: 'food-library', icon: Apple, iconColor: 'text-yellow-500', bgColor: 'yellow', title: 'Bibliothèque', titleKey: 'pregnancy.library', desc: 'Aliments', descKey: 'pregnancy.foods', route: '/library' },
    { id: 'favorites', icon: Heart, iconColor: 'text-yellow-500', bgColor: 'yellow', title: 'Favoris', titleKey: 'pregnancy.favorites', desc: 'Sauvegardés', descKey: 'pregnancy.saved', route: '/favorites' },
    { id: 'history', icon: History, iconColor: 'text-yellow-500', bgColor: 'yellow', title: 'Historique', titleKey: 'pregnancy.history', desc: 'Recherches', descKey: 'pregnancy.searches', route: '/history' },
    // Séparateur : Liste des Prénoms (carte large) - BLEU
    { id: 'baby-names', icon: Users, iconColor: 'text-blue-600', bgColor: 'blue', title: 'Liste des Prénoms', titleKey: 'pregnancy.babyNames', desc: 'Europe & Amérique - Signification et personnalité', descKey: 'pregnancy.namesDescFull', route: '/baby-names', premium: 'partial', wide: true },
    // Partie Médicale et Suivi (4 cartes) - ROUGE
    { id: 'tips-evolution', icon: BookHeart, iconColor: 'text-red-600', bgColor: 'red', title: 'Évolution et conseils', titleKey: 'pregnancy.tipsAndEvolution', desc: 'Semaine par semaine', descKey: 'pregnancy.weekByWeek', route: '/tips' },
    { id: 'medical-appointments', icon: Stethoscope, iconColor: 'text-red-600', bgColor: 'red', title: 'Rendez-vous', titleKey: 'pregnancy.appointments', desc: 'Suivi médical', descKey: 'pregnancy.medicalFollowUp', route: '/medical' },
    { id: 'pregnancy-tracking', icon: LineChart, iconColor: 'text-red-600', bgColor: 'red', title: 'Suivi grossesse', titleKey: 'pregnancy.tracking', desc: 'Poids maman & bébé', descKey: 'pregnancy.stats', route: '/tracking' },
    { id: 'reminders', icon: Bell, iconColor: 'text-red-600', bgColor: 'red', title: 'Rappels', titleKey: 'pregnancy.reminders', desc: 'Notifications', descKey: 'pregnancy.notifications', route: '/reminders' },
    // Séparateur : Congés parentaux (carte large en bas) - VERT
    { id: 'parental-leave', icon: Scale, iconColor: 'text-green-600', bgColor: 'green', title: 'Congés parentaux', titleKey: 'pregnancy.parentalLeave', desc: 'Nouvelle loi 2024 - Vos droits', descKey: 'pregnancy.parentalLeaveDesc', route: '/parental-leave', wide: true },
  ],
  'baby-preparation': [
    { id: 'birth-list', icon: ClipboardList, iconColor: 'text-yellow-500', bgColor: 'yellow', title: 'Liste de naissance', titleKey: 'babyPrep.birthList', desc: 'Préparez tout', descKey: 'babyPrep.birthListDesc', route: '/birth-list' },
    { id: 'maternity-bag', icon: Briefcase, iconColor: 'text-blue-600', bgColor: 'blue', title: 'Valise maternité', titleKey: 'babyPrep.maternityBag', desc: 'Checklist', descKey: 'babyPrep.checklistDesc', route: '/maternity-bag' },
    { id: 'prep-tips', icon: BookHeart, iconColor: 'text-red-600', bgColor: 'red', title: 'Conseils & Préparation', titleKey: 'babyPrep.prepTips', desc: 'Guide complet', descKey: 'babyPrep.prepTipsDesc', route: '/baby-prep-tips' },
    { id: 'videos-resources', icon: Video, iconColor: 'text-green-600', bgColor: 'green', title: 'Vidéos & Ressources', titleKey: 'babyPrep.videosResources', desc: 'Tutoriels & conseils', descKey: 'babyPrep.videosResourcesDesc', route: '/baby-videos' },
  ],
  'postpartum': [
    { id: 'postpartum-rdv', icon: Stethoscope, iconColor: 'text-yellow-500', bgColor: 'yellow', title: 'RDV médicaux', titleKey: 'postpartum.rdv', desc: 'Suivi post-accouchement', descKey: 'postpartum.rdvDesc', route: '/postpartum/rdv' },
    { id: 'postpartum-alimentation', icon: Utensils, iconColor: 'text-blue-600', bgColor: 'blue', title: 'Alimentation', titleKey: 'postpartum.alimentation', desc: 'Allaitement, biberons, diversification', descKey: 'postpartum.alimentationDesc', route: '/postpartum/alimentation' },
    { id: 'postpartum-soins', icon: Baby, iconColor: 'text-red-600', bgColor: 'red', title: 'Soins quotidiens', titleKey: 'postpartum.soins', desc: 'Coucher, change, portage', descKey: 'postpartum.soinsDesc', route: '/postpartum/soins' },
    { id: 'postpartum-securite', icon: Shield, iconColor: 'text-green-600', bgColor: 'green', title: 'Sécurité', titleKey: 'postpartum.securite', desc: 'Difficultés, précautions', descKey: 'postpartum.securiteDesc', route: '/postpartum/securite' },
  ],
  'services': [
    { id: 'caf', icon: Building2, iconColor: 'text-yellow-500', bgColor: 'yellow', title: 'CAF', titleKey: 'services.caf', desc: 'Allocations familiales', descKey: 'services.cafDesc', route: 'https://www.caf.fr', external: true },
    { id: 'ameli', icon: Hospital, iconColor: 'text-blue-600', bgColor: 'blue', title: 'Ameli', titleKey: 'services.ameli', desc: 'Assurance maladie', descKey: 'services.ameliDesc', route: 'https://www.ameli.fr', external: true },
    { id: 'maps', icon: MapPin, iconColor: 'text-red-600', bgColor: 'red', title: 'Mairie proche', titleKey: 'services.maps', desc: 'Démarches administratives', descKey: 'services.mapsDesc', route: 'https://www.google.com/maps/search/mairie', external: true },
    { id: 'videos', icon: Video, iconColor: 'text-green-600', bgColor: 'green', title: 'Vidéos', titleKey: 'services.videos', desc: 'Tutoriels YouTube', descKey: 'services.tutorials', route: 'https://www.youtube.com/results?search_query=grossesse+conseils', external: true },
  ],
};

// Popup bulle pour dupliquer - Style gris translucide iOS
function DuplicatePopup({ itemName, pages, onDuplicate, onCancel, onCreatePage, t }) {
  const userPages = pages.filter(p => !p.isDefault);
  
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
          {itemName && (
            <p className="text-xs text-white/60 mt-0.5">{itemName}</p>
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
            onClick={() => onCreatePage('')}
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

// Carte individuelle avec appui long - style bombé avec dégradé prononcé
function ItemCard({ item, onNavigate, onLongPress, isSelected }) {
  const { t } = useTranslation();
  const { isPremium } = useSubscription();
  const { isDarkMode } = useTheme();
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  
  const Icon = item.icon;
  const isLocked = item.premium === 'full' && !isPremium;
  const isPartialPremium = item.premium === 'partial' && !isPremium;
  
  // Couleur du texte — TOUJOURS NOIR PUR #000000
  const textColorTitle = 'text-black';
  const textColorDesc = 'text-black';
  
  // Déterminer la couleur principale de l'item à partir de bgColor
  const getColorFromBgColor = () => {
    if (!item.bgColor) return { color: 'slate', rgb: '148,163,184' };
    // Couleurs vives pour effet bombé pastel nuage
    if (item.bgColor === 'yellow') return { color: 'yellow', rgb: '234,179,8' }; // Jaune vif
    if (item.bgColor === 'blue') return { color: 'blue', rgb: '59,130,246' }; // Bleu vif
    if (item.bgColor === 'pink') return { color: 'pink', rgb: '236,72,153' }; // Rose vif
    if (item.bgColor === 'green') return { color: 'green', rgb: '34,197,94' }; // Vert vif
    if (item.bgColor === 'red') return { color: 'red', rgb: '239,68,68' }; // Rouge vif
    if (item.bgColor === 'emerald') return { color: 'emerald', rgb: '16,185,129' }; // Émeraude vif
    if (item.bgColor === 'amber') return { color: 'amber', rgb: '245,158,11' }; // Ambre vif
    if (item.bgColor === 'sky') return { color: 'sky', rgb: '14,165,233' }; // Bleu ciel vif
    if (item.bgColor === 'rose') return { color: 'rose', rgb: '244,63,94' }; // Rose vif
    // Anciennes couleurs (gradient strings)
    if (item.bgColor.includes('pink') || item.bgColor.includes('rose')) return { color: 'pink', rgb: '236,72,153' };
    if (item.bgColor.includes('sky') || item.bgColor.includes('blue')) return { color: 'sky', rgb: '14,165,233' };
    if (item.bgColor.includes('emerald') || item.bgColor.includes('green')) return { color: 'green', rgb: '34,197,94' };
    if (item.bgColor.includes('violet') || item.bgColor.includes('purple')) return { color: 'violet', rgb: '139,92,246' };
    if (item.bgColor.includes('amber') || item.bgColor.includes('yellow') || item.bgColor.includes('orange')) return { color: 'amber', rgb: '245,158,11' };
    if (item.bgColor.includes('red')) return { color: 'red', rgb: '239,68,68' };
    if (item.bgColor.includes('teal') || item.bgColor.includes('cyan')) return { color: 'teal', rgb: '20,184,166' };
    if (item.bgColor.includes('indigo')) return { color: 'indigo', rgb: '99,102,241' };
    return { color: 'slate', rgb: '148,163,184' };
  };
  
  const colorInfo = getColorFromBgColor();
  
  // Gradient coloré plein pour la bulle de logo
  const getBubbleGradient = () => {
    switch(item.bgColor) {
      case 'yellow': case 'amber': return 'linear-gradient(145deg, #fbbf24, #f59e0b)';
      case 'blue': case 'sky': return 'linear-gradient(145deg, #60a5fa, #3b82f6)';
      case 'green': case 'emerald': return 'linear-gradient(145deg, #4ade80, #22c55e)';
      case 'red': case 'rose': case 'pink': return 'linear-gradient(145deg, #f87171, #ef4444)';
      case 'violet': case 'purple': return 'linear-gradient(145deg, #a78bfa, #8b5cf6)';
      default: return 'linear-gradient(145deg, #94a3b8, #64748b)';
    }
  };
  
  // Générer les styles de fond — BLANC INTENSE NACRÉ 3D BOMBÉ
  const getVibrantBackground = () => {
    return {
      bg: 'linear-gradient(160deg, #ffffff 0%, #fefefe 20%, #fafafa 50%, #f5f5f7 80%, #f0f0f2 100%)',
      border: 'rgba(255,255,255,0.9)',
      shadow: '0,0,0'
    };
  };
  
  const vibrantStyle = getVibrantBackground();
  
  const handleTouchStart = (e) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      onLongPress(item);
    }, 500);
  };

  const handleTouchEnd = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };
  
  const handleTouchMove = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleClick = () => {
    if (!isLongPress.current && !isLocked) {
      onNavigate(item.route, item.external);
    }
  };

  // Carte large (bannière) - style pill fine avec coins demi-cercle - RÉDUITE sans réduire le texte
  if (item.wide) {
    return (
      <div 
        className={`
          relative overflow-hidden
          rounded-full px-3 py-1.5 select-none
          cursor-pointer transition-all col-span-2 sm:col-span-3
          hover:scale-[1.01] active:scale-[0.99]
          ${isLocked ? 'opacity-60' : ''}
          ${isSelected ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
        `}
        style={{ 
          background: vibrantStyle.bg,
          border: `2px solid ${vibrantStyle.border}`,
          boxShadow: `0 6px 18px -2px rgba(0,0,0,0.12), 0 3px 8px -1px rgba(0,0,0,0.06), inset -4px -4px 10px rgba(0,0,0,0.06), inset 4px 4px 10px rgba(255,255,255,0.9)`,
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
        data-testid={`item-card-${item.id}`}
      >
        {/* Voile blanc supprimé */}
        
        <div className="relative flex items-center gap-2">
          {/* Icône dans bulle COLORÉE pleine + icône blanche */}
          <div 
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{
              background: getBubbleGradient(),
              boxShadow: '0 3px 8px -1px rgba(0,0,0,0.15), inset 0 1px 3px rgba(255,255,255,0.3)',
              border: 'none',
            }}
          >
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-semibold ${textColorTitle}`}>
                {t(item.titleKey, item.title)}
              </h3>
              {isPartialPremium && (
                <span className="flex items-center gap-0.5 bg-amber-100/80 text-amber-700 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                  <Crown className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
            <p className={`text-sm ${textColorDesc}`}>
              {t(item.descKey, item.desc)}
            </p>
          </div>
        </div>
        
        {/* Badge sélection */}
        {isSelected && (
          <div className="absolute top-2 left-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center z-10">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    );
  }

  // Carte normale (carrée) - style bombé compact - RÉDUITE sans réduire le texte
  return (
    <div 
      className={`
        relative overflow-hidden
        rounded-xl p-1.5 select-none
        cursor-pointer transition-all text-center
        hover:scale-[1.02] active:scale-[0.98]
        ${isLocked ? 'opacity-60' : ''}
        ${isSelected ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
      `}
      style={{ 
        background: vibrantStyle.bg,
        border: `1px solid ${vibrantStyle.border}`,
        boxShadow: `0 5px 14px -2px rgba(0,0,0,0.1), 0 2px 6px -1px rgba(0,0,0,0.05), inset -3px -3px 8px rgba(0,0,0,0.06), inset 3px 3px 8px rgba(255,255,255,0.9)`,
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
      data-testid={`item-card-${item.id}`}
    >
      {/* Voile blanc supprimé */}
      
      {/* Badge premium */}
      {isPartialPremium && (
        <div className="absolute top-1 right-1">
          <span className="flex items-center gap-0.5 bg-amber-100/80 text-amber-700 px-1 py-0.5 rounded-full text-[9px] font-medium">
            <Crown className="w-2 h-2" />
          </span>
        </div>
      )}
      
      {/* Badge lien externe */}
      {item.external && !isPartialPremium && !isLocked && (
        <div className="absolute top-1 right-1">
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </div>
      )}
      
      {/* Badge lock */}
      {isLocked && (
        <div className="absolute top-1 right-1">
          <Lock className="w-3 h-3 text-slate-400" />
        </div>
      )}
      
      {/* Badge sélection */}
      {isSelected && (
        <div className="absolute top-1 left-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center z-10">
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      
      {/* Icône dans bulle COLORÉE pleine + icône blanche */}
      <div 
        className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-1"
        style={{
          background: getBubbleGradient(),
          boxShadow: '0 3px 8px -1px rgba(0,0,0,0.15), inset 0 1px 3px rgba(255,255,255,0.3)',
          border: 'none',
        }}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className={`text-sm font-semibold ${textColorTitle} leading-tight relative z-10`}>
        {t(item.titleKey, item.title)}
      </h3>
      <p className={`text-xs ${textColorDesc} mt-0.5 leading-tight relative z-10`}>
        {t(item.descKey, item.desc)}
      </p>
    </div>
  );
}

function SectionDetailPage() {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const { t } = useTranslation();
  const { pages, addPage, duplicateItemToPage } = useHomeLayout();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);

  const meta = SECTION_META[sectionId];
  const items = SECTION_ITEMS[sectionId] || [];

  // Navigation
  const handleNavigate = (route, external = false) => {
    if (external) {
      window.open(route, '_blank', 'noopener,noreferrer');
    } else {
      navigate(route);
    }
  };

  // Appui long sur une carte
  const handleLongPress = (item) => {
    setSelectedItem(item);
    setShowDuplicatePopup(true);
  };

  // Dupliquer vers une page
  const handleDuplicate = async (pageId) => {
    if (duplicateItemToPage && selectedItem) {
      await duplicateItemToPage(selectedItem.id, pageId);
      toast.success(t('journey.duplicatedSuccess', 'Élément dupliqué !'));
    }
    setShowDuplicatePopup(false);
    setSelectedItem(null);
  };

  // Créer une page et dupliquer
  const handleCreatePageAndDuplicate = async (pageName) => {
    if (addPage && selectedItem) {
      const success = await addPage(pageName);
      if (success) {
        setTimeout(async () => {
          const newPage = pages[pages.length - 1];
          if (newPage && !newPage.isDefault && duplicateItemToPage) {
            await duplicateItemToPage(selectedItem.id, newPage.id);
            toast.success(t('journey.pageCreatedAndDuplicated', 'Page créée et élément dupliqué !'));
          }
        }, 300);
      }
    }
    setShowDuplicatePopup(false);
    setSelectedItem(null);
  };

  // Section invalide
  if (!meta) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <p className="text-slate-500">{t('common.notFound', 'Section non trouvée')}</p>
      </div>
    );
  }

  const Icon = meta.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${meta.bgGradient}`}>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
            data-testid="back-button"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <Icon className={`w-5 h-5 ${meta.accentColor}`} />
              <h1 className={`text-lg font-bold ${meta.accentColor}`}>
                {t(meta.nameKey, meta.name)}
              </h1>
            </div>
          </div>
          
          {/* Espace pour équilibrer le header */}
          <div className="w-10"></div>
        </div>

        {/* Message d'instruction */}
        <div className="text-center mb-4">
          <span className={`inline-block text-xs ${meta.accentColor} opacity-70 px-4 py-1.5 rounded-full ${meta.bgColor}`}>
            {t('section.longPressToSelect', 'Appui long pour dupliquer')}
          </span>
        </div>

        {/* Grille des cartes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onNavigate={handleNavigate}
              onLongPress={handleLongPress}
              isSelected={selectedItem?.id === item.id}
            />
          ))}
          {sectionId === 'pregnancy' && <MaternityLeaveSummaryCard />}
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
      {showDuplicatePopup && selectedItem && (
        <DuplicatePopup
          itemName={t(selectedItem.titleKey, selectedItem.title)}
          pages={pages}
          onDuplicate={handleDuplicate}
          onCancel={() => {
            setShowDuplicatePopup(false);
            setSelectedItem(null);
          }}
          onCreatePage={handleCreatePageAndDuplicate}
          t={t}
        />
      )}
    </div>
  );
}

export default SectionDetailPage;

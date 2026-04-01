import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Heart, Sparkles, Baby, Gift, HeartHandshake, Settings, 
  Check, Pin, PinOff, CalendarHeart, ScanBarcode, Apple, History,
  Stethoscope, Bell, BookHeart, Users, ChevronRight, Crown, Lock,
  ClipboardList, Briefcase, Video, Youtube, Book, Phone, LineChart,
  Scale, Lightbulb, Building2, Hospital, MapPin, ExternalLink, Utensils, Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useHomeLayout } from '../contexts/HomeLayoutContext';
import { useSubscription } from '../components/SubscriptionGate';

// Métadonnées des sections
const SECTION_META = {
  'preconception': { 
    icon: Sparkles, 
    name: 'En route vers la grossesse',
    nameKey: 'sections.preconception',
    bgGradient: 'from-amber-50 to-orange-50',
    accentColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  'pregnancy': { 
    icon: Baby, 
    name: 'Grossesse',
    nameKey: 'sections.pregnancy',
    bgGradient: 'from-pink-50 to-rose-50',
    accentColor: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  'baby-preparation': { 
    icon: Gift, 
    name: 'Préparer l\'arrivée de bébé',
    nameKey: 'sections.babyPreparation',
    bgGradient: 'from-purple-50 to-violet-50',
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  'postpartum': { 
    icon: HeartHandshake, 
    name: 'Suivi post-partum',
    nameKey: 'sections.postpartum',
    bgGradient: 'from-rose-50 to-pink-50',
    accentColor: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  'services': { 
    icon: Settings, 
    name: 'Services et ressources',
    nameKey: 'sections.services',
    bgGradient: 'from-slate-50 to-gray-50',
    accentColor: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
};

// Contenu de chaque section (cartes individuelles)
const SECTION_ITEMS = {
  'preconception': [
    { id: 'cycle-tracking', icon: CalendarHeart, iconColor: 'text-pink-500', bgColor: 'bg-pink-50', title: 'Suivi de fertilité', titleKey: 'preconception.cycleTracking', desc: 'Règles, ovulation, nidation', descKey: 'preconception.cycleDesc', route: '/cycle-tracking' },
    { id: 'fertility-calc', icon: LineChart, iconColor: 'text-purple-500', bgColor: 'bg-purple-50', title: 'Calculateur fertilité', titleKey: 'preconception.fertilityCalc', desc: 'Prochaines règles & ovulation', descKey: 'preconception.fertilityDesc', route: '/fertility-calculator' },
    { id: 'preparation-advice', icon: Lightbulb, iconColor: 'text-amber-500', bgColor: 'bg-amber-50', title: 'Préparation et conseils', titleKey: 'preconception.preparationAdvice', desc: 'Acide folique, nutrition...', descKey: 'preconception.preparationDesc', route: '/preconception-tips' },
  ],
  'pregnancy': [
    // Partie Alimentation (4 premières cartes)
    { id: 'food-scanner', icon: ScanBarcode, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50', title: 'Scanner', titleKey: 'pregnancy.scanner', desc: 'Aliments', descKey: 'pregnancy.foods', route: '/scanner' },
    { id: 'food-library', icon: Apple, iconColor: 'text-red-400', bgColor: 'bg-red-50', title: 'Bibliothèque', titleKey: 'pregnancy.library', desc: 'Aliments', descKey: 'pregnancy.foods', route: '/library' },
    { id: 'favorites', icon: Heart, iconColor: 'text-pink-400', bgColor: 'bg-pink-50', title: 'Favoris', titleKey: 'pregnancy.favorites', desc: 'Sauvegardés', descKey: 'pregnancy.saved', route: '/favorites' },
    { id: 'history', icon: History, iconColor: 'text-purple-400', bgColor: 'bg-purple-50', title: 'Historique', titleKey: 'pregnancy.history', desc: 'Recherches', descKey: 'pregnancy.searches', route: '/history' },
    // Séparateur : Liste des Prénoms (carte large)
    { id: 'baby-names', icon: Users, iconColor: 'text-violet-500', bgColor: 'bg-gradient-to-r from-violet-50 to-purple-50', title: 'Liste des Prénoms', titleKey: 'pregnancy.babyNames', desc: 'Europe & Amérique - Signification et personnalité', descKey: 'pregnancy.namesDescFull', route: '/baby-names', premium: 'partial', wide: true },
    // Partie Médicale et Suivi
    { id: 'tips-evolution', icon: BookHeart, iconColor: 'text-pink-500', bgColor: 'bg-pink-50', title: 'Évolution et conseils', titleKey: 'pregnancy.tipsAndEvolution', desc: 'Semaine par semaine', descKey: 'pregnancy.weekByWeek', route: '/tips' },
    { id: 'medical-appointments', icon: Stethoscope, iconColor: 'text-sky-500', bgColor: 'bg-sky-50', title: 'Rendez-vous', titleKey: 'pregnancy.appointments', desc: 'Suivi médical', descKey: 'pregnancy.medicalFollowUp', route: '/medical' },
    { id: 'pregnancy-tracking', icon: LineChart, iconColor: 'text-teal-500', bgColor: 'bg-teal-50', title: 'Suivi grossesse', titleKey: 'pregnancy.tracking', desc: 'Poids maman & bébé', descKey: 'pregnancy.stats', route: '/tracking' },
    { id: 'reminders', icon: Bell, iconColor: 'text-orange-500', bgColor: 'bg-orange-50', title: 'Rappels', titleKey: 'pregnancy.reminders', desc: 'Notifications', descKey: 'pregnancy.notifications', route: '/reminders' },
    // Séparateur : Congés parentaux (carte large en bas)
    { id: 'parental-leave', icon: Scale, iconColor: 'text-indigo-500', bgColor: 'bg-gradient-to-r from-indigo-50 to-blue-50', title: 'Congés parentaux', titleKey: 'pregnancy.parentalLeave', desc: 'Nouvelle loi 2024 - Vos droits', descKey: 'pregnancy.parentalLeaveDesc', route: '/parental-leave', wide: true },
  ],
  'baby-preparation': [
    { id: 'birth-list', icon: ClipboardList, iconColor: 'text-purple-500', bgColor: 'bg-purple-50', title: 'Liste de naissance', titleKey: 'babyPrep.birthList', desc: 'Préparez tout', descKey: 'babyPrep.birthListDesc', route: '/birth-list' },
    { id: 'maternity-bag', icon: Briefcase, iconColor: 'text-pink-500', bgColor: 'bg-pink-50', title: 'Valise maternité', titleKey: 'babyPrep.maternityBag', desc: 'Checklist', descKey: 'babyPrep.checklistDesc', route: '/maternity-bag' },
    { id: 'prep-tips', icon: BookHeart, iconColor: 'text-violet-500', bgColor: 'bg-violet-50', title: 'Conseils & Préparation', titleKey: 'babyPrep.prepTips', desc: 'Guide complet', descKey: 'babyPrep.prepTipsDesc', route: '/baby-prep-tips' },
    { id: 'videos-resources', icon: Video, iconColor: 'text-rose-500', bgColor: 'bg-rose-50', title: 'Vidéos & Ressources', titleKey: 'babyPrep.videosResources', desc: 'Tutoriels & conseils', descKey: 'babyPrep.videosResourcesDesc', route: '/baby-videos' },
  ],
  'postpartum': [
    { id: 'postpartum-rdv', icon: Stethoscope, iconColor: 'text-rose-500', bgColor: 'bg-rose-50', title: 'RDV médicaux', titleKey: 'postpartum.rdv', desc: 'Suivi post-accouchement', descKey: 'postpartum.rdvDesc', route: '/postpartum/rdv' },
    { id: 'postpartum-alimentation', icon: Utensils, iconColor: 'text-amber-500', bgColor: 'bg-amber-50', title: 'Alimentation', titleKey: 'postpartum.alimentation', desc: 'Allaitement, biberons, diversification', descKey: 'postpartum.alimentationDesc', route: '/postpartum/alimentation' },
    { id: 'postpartum-soins', icon: Baby, iconColor: 'text-sky-500', bgColor: 'bg-sky-50', title: 'Soins quotidiens', titleKey: 'postpartum.soins', desc: 'Coucher, change, portage', descKey: 'postpartum.soinsDesc', route: '/postpartum/soins' },
    { id: 'postpartum-securite', icon: Shield, iconColor: 'text-violet-500', bgColor: 'bg-violet-50', title: 'Sécurité', titleKey: 'postpartum.securite', desc: 'Difficultés, précautions', descKey: 'postpartum.securiteDesc', route: '/postpartum/securite' },
  ],
  'services': [
    { id: 'chatbot', icon: Phone, iconColor: 'text-sky-500', bgColor: 'bg-sky-50', title: 'Assistant IA', titleKey: 'services.chatbot', desc: 'Disponible 24/7', descKey: 'services.available247', route: '/chatbot' },
    { id: 'caf', icon: Building2, iconColor: 'text-blue-600', bgColor: 'bg-blue-50', title: 'CAF', titleKey: 'services.caf', desc: 'Allocations familiales', descKey: 'services.cafDesc', route: 'https://www.caf.fr', external: true },
    { id: 'ameli', icon: Hospital, iconColor: 'text-green-600', bgColor: 'bg-green-50', title: 'Ameli', titleKey: 'services.ameli', desc: 'Assurance maladie', descKey: 'services.ameliDesc', route: 'https://www.ameli.fr', external: true },
    { id: 'maps', icon: MapPin, iconColor: 'text-red-500', bgColor: 'bg-red-50', title: 'Mairie proche', titleKey: 'services.maps', desc: 'Démarches administratives', descKey: 'services.mapsDesc', route: 'https://www.google.com/maps/search/mairie', external: true },
    { id: 'videos', icon: Video, iconColor: 'text-rose-500', bgColor: 'bg-rose-50', title: 'Vidéos', titleKey: 'services.videos', desc: 'Tutoriels YouTube', descKey: 'services.tutorials', route: 'https://www.youtube.com/results?search_query=grossesse+conseils', external: true },
  ],
};

// Popup bulle pour dupliquer
function DuplicatePopup({ itemName, pages, onDuplicate, onCancel, onCreatePage, t }) {
  const userPages = pages.filter(p => !p.isDefault);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center pb-20 bg-black/20 backdrop-blur-[2px] select-none"
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
    >
      <div 
        className="relative bg-white/95 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 mx-4 max-w-sm w-full select-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(253,242,248,0.9) 100%)',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Flèche bulle */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-r border-b border-white/50"></div>
        
        {/* Décoration nuage */}
        <div className="absolute -top-3 -right-3 w-16 h-16 bg-pink-100/50 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-purple-100/50 rounded-full blur-xl"></div>
        
        <div className="relative">
          {!showCreateForm ? (
            <>
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📋</span>
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  {t('journey.duplicateTo', 'Dupliquer vers...')}
                </h3>
                <p className="text-sm text-slate-500">{itemName}</p>
              </div>
              
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {userPages.length > 0 ? (
                  userPages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => onDuplicate(page.id)}
                      className="w-full p-3.5 text-left rounded-2xl bg-white/60 hover:bg-pink-50 hover:text-pink-600 transition-all border border-slate-100 hover:border-pink-200 active:scale-[0.98]"
                    >
                      <span className="font-medium">{page.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4 px-3 rounded-2xl bg-slate-50/50">
                    <p className="text-sm text-slate-400">
                      {t('journey.noUserPages', 'Aucune page personnalisée')}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full p-3.5 text-left rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 hover:from-pink-100 hover:to-purple-100 transition-all font-medium border border-pink-100 active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">+</span>
                    {t('journey.createNewPage', 'Créer une nouvelle page')}
                  </span>
                </button>
              </div>
              
              <button 
                onClick={onCancel} 
                className="w-full py-2.5 rounded-2xl bg-slate-100/80 text-slate-600 font-medium hover:bg-slate-200/80 transition-all active:scale-95"
              >
                {t('common.cancel', 'Annuler')}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">✨</span>
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  {t('home.createPage', 'Créer une page')}
                </h3>
              </div>
              
              <Input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder={t('home.pageNamePlaceholder', 'Nom de la page...')}
                className="w-full mb-4 rounded-2xl border-slate-200 focus:border-pink-300 focus:ring-pink-200"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && newPageName.trim() && onCreatePage(newPageName.trim())}
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateForm(false)} 
                  className="flex-1 py-2.5 rounded-2xl bg-slate-100/80 text-slate-600 font-medium hover:bg-slate-200/80 transition-all active:scale-95"
                >
                  {t('common.back', 'Retour')}
                </button>
                <button 
                  onClick={() => newPageName.trim() && onCreatePage(newPageName.trim())}
                  disabled={!newPageName.trim()}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium shadow-lg shadow-pink-500/25 hover:shadow-xl disabled:opacity-50 transition-all active:scale-95"
                >
                  {t('common.create', 'Créer')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Carte individuelle avec appui long
function ItemCard({ item, onNavigate, onLongPress, isSelected }) {
  const { t } = useTranslation();
  const { isPremium } = useSubscription();
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  
  const Icon = item.icon;
  const isLocked = item.premium === 'full' && !isPremium;
  const isPartialPremium = item.premium === 'partial' && !isPremium;
  
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

  // Carte large (bannière)
  if (item.wide) {
    return (
      <Card 
        className={`
          relative ${item.bgColor} rounded-2xl p-4 select-none
          shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-violet-100 
          hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] 
          cursor-pointer transition-all col-span-2 sm:col-span-3
          select-none
          ${isLocked ? 'opacity-60' : ''}
          ${isSelected ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
        `}
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
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
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-700">
                {t(item.titleKey, item.title)}
              </h3>
              {isPartialPremium && (
                <span className="flex items-center gap-0.5 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                  <Crown className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(item.descKey, item.desc)}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-violet-400 flex-shrink-0" />
        </div>
        
        {/* Badge sélection */}
        {isSelected && (
          <div className="absolute top-2 left-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center z-10">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </Card>
    );
  }

  // Carte normale (carrée)
  return (
    <Card 
      className={`
        relative bg-white rounded-2xl p-4 select-none
        shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 
        hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] 
        cursor-pointer transition-all text-center
        select-none
        ${isLocked ? 'opacity-60' : ''}
        ${isSelected ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
      `}
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
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
      {/* Badge premium */}
      {isPartialPremium && (
        <div className="absolute top-1 right-1">
          <span className="flex items-center gap-0.5 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
            <Crown className="w-2.5 h-2.5" />
          </span>
        </div>
      )}
      
      {/* Badge lien externe */}
      {item.external && !isPartialPremium && !isLocked && (
        <div className="absolute top-1 right-1">
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </div>
      )}
      
      {/* Badge lock */}
      {isLocked && (
        <div className="absolute top-1 right-1">
          <Lock className="w-4 h-4 text-slate-400" />
        </div>
      )}
      
      {/* Badge sélection */}
      {isSelected && (
        <div className="absolute top-1 left-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center z-10">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      
      <Icon className={`w-8 h-8 ${item.iconColor} mx-auto mb-2`} />
      <h3 className="text-sm font-bold text-slate-700">
        {t(item.titleKey, item.title)}
      </h3>
      <p className="text-xs text-slate-500">
        {t(item.descKey, item.desc)}
      </p>
    </Card>
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
            onClick={() => navigate('/journey-steps')}
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

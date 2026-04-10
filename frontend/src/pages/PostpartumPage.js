import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  ArrowLeft, Calendar, Heart, AlertTriangle, Baby, Droplets,
  Shield, Stethoscope, Info, CalendarDays, Check, Lock, Gift, Crown, Sparkles, Utensils, HandHeart, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { ToggleAllSections } from '../components/ToggleAllSections';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useHomeLayout } from '../contexts/HomeLayoutContext';
import { DuplicatePopup } from '../components/home/DuplicatePopup';

// Import refactored components
import {
  AppointmentsSection,
  DifficultiesSection,
  BreastfeedingSection,
  FormulaSection,
  DiapersSection,
  BabywearingSection,
  DiversificationSection,
  RecipesSection,
  PrecautionsSection
} from '../components/postpartum';

export default function PostpartumPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    appointments: false,
    difficulties: false,
    breastfeeding: false,
    formula: false,
    diapers: false,
    babywearing: false,
    diversification: false,
    recipes: false,
    precautions: false
  });
  
  // Langue actuelle
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  
  // Traduction automatique du contenu postpartum
  const { translated: translatedContent, isLoading: isTranslating } = useAutoTranslate(
    content,
    {
      fields: ['title', 'description', 'content', 'advice', 'tips', 'when', 'what', 'symptoms', 'solutions', 'name', 'ingredients', 'instructions'],
      enabled: currentLang !== 'fr' && content !== null
    }
  );
  
  // Utiliser le contenu traduit ou original
  const displayContent = currentLang !== 'fr' && translatedContent ? translatedContent : content;
  
  // Postpartum status
  const [postpartumStatus, setPostpartumStatus] = useState(null);
  const [birthDate, setBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [savingBirthDate, setSavingBirthDate] = useState(false);
  
  // Favorites
  const [favorites, setFavorites] = useState([]);
  
  // Duplication vers page personnalisée
  const { pages, addPage, duplicateItemToPage } = useHomeLayout();
  const [selectedForDuplicate, setSelectedForDuplicate] = useState(null);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [showCreatePageForm, setShowCreatePageForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const longPressTimer = useRef(null);
  
  // Check if all sections are open
  const allSectionsOpen = Object.values(expandedSections).every(Boolean);
  
  // Toggle all sections
  const toggleAllSections = (open) => {
    setExpandedSections({
      appointments: open,
      difficulties: open,
      breastfeeding: open,
      formula: open,
      diapers: open,
      babywearing: open,
      diversification: open,
      recipes: open,
      precautions: open
    });
  };
  
  // Full subscription status
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  
  // Super admin check
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const ADMIN_EMAIL = "cyrilalepsa@gmail.com";

  useEffect(() => {
    checkSuperAdmin();
    loadContent();
    loadPostpartumStatus();
    loadSubscriptionStatus();
    loadFavorites();
    sendDueReminders();
  }, []);
  
  const checkSuperAdmin = async () => {
    try {
      const response = await api.auth.me();
      if (response.data.email === ADMIN_EMAIL || response.data.role === 'admin') {
        setIsSuperAdmin(true);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const loadContent = async () => {
    try {
      const response = await api.postpartum.getContent();
      setContent(response.data);
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadPostpartumStatus = async () => {
    try {
      const response = await api.postpartum.getStatus();
      setPostpartumStatus(response.data);
      if (response.data.actual_birth_date) {
        setBirthDate(response.data.actual_birth_date.split('T')[0]);
      }
      if (response.data.baby_name) {
        setBabyName(response.data.baby_name);
      }
    } catch (error) {
      console.error('Erreur chargement statut:', error);
    }
  };
  
  const loadSubscriptionStatus = async () => {
    try {
      const response = await api.subscription.getFullStatus();
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Erreur statut abonnement:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await api.postpartum.getFavorites();
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    }
  };
  
  const sendDueReminders = async () => {
    try {
      await api.postpartum.sendDueReminders();
    } catch (error) {
      // Silently fail
    }
  };
  
  const handleSaveBirthDate = async () => {
    if (!birthDate) {
      toast.error(t('postpartumPage.enterBirthDate'));
      return;
    }
    
    setSavingBirthDate(true);
    try {
      await api.postpartum.setBirthDate(birthDate, babyName);
      toast.success(t('postpartumPage.birthDateSaved'));
      loadPostpartumStatus();
    } catch (error) {
      toast.error(t('postpartumPage.saveError'));
    } finally {
      setSavingBirthDate(false);
    }
  };

  // Déterminer l'accès - Super admin a accès à tout
  const hasPostpartumAccess = postpartumStatus?.postpartum_unlocked || isSuperAdmin;
  const hasGivenBirth = postpartumStatus?.actual_birth_date || isSuperAdmin;
  const canViewFullContent = hasPostpartumAccess && hasGivenBirth;
  
  // Section actuellement ouverte (une seule à la fois, en plein écran)
  // Utilise le paramètre URL si présent
  const sectionFromUrl = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(sectionFromUrl);

  // Mettre à jour activeSection si le paramètre URL change
  useEffect(() => {
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);

  const openSection = (sectionId) => {
    setActiveSection(sectionId);
  };
  
  const closeSection = () => {
    setActiveSection(null);
    // Utiliser navigate(-1) pour respecter l'historique de navigation
    navigate(-1);
  };
  
  // Retour vers la section postpartum
  const goBackToJourney = () => {
    navigate(-1);
  };

  const toggleSection = (section) => {
    const wasExpanded = expandedSections[section];
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getColorClasses = (color) => {
    const colors = {
      pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
      sky: { bg: 'bg-sky-100', text: 'text-sky-600' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
      violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-600' }
    };
    return colors[color] || colors.pink;
  };

  // Fonctions pour la duplication
  const handleLongPressStart = (categoryId) => {
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      setSelectedForDuplicate(categoryId);
      setShowDuplicatePopup(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleDuplicate = async (pageId) => {
    if (duplicateItemToPage && selectedForDuplicate) {
      // Mapper l'ID de catégorie vers l'ID d'item approprié
      const itemIdMap = {
        'alimentation': 'postpartum',
        'soins': 'postpartum',
        'securite': 'postpartum',
        'rdv': 'postpartum'
      };
      const itemId = itemIdMap[selectedForDuplicate] || 'postpartum';
      await duplicateItemToPage(itemId, pageId);
      toast.success(t('journey.duplicatedSuccess', 'Élément dupliqué !'));
    }
    setShowDuplicatePopup(false);
    setSelectedForDuplicate(null);
  };

  const handleCreatePageAndDuplicate = async () => {
    // Créer directement la page sans demander de nom
    if (addPage) {
      // Générer un nom par défaut basé sur le nombre de pages
      const userPages = pages.filter(p => !p.isDefault);
      const defaultName = `Page ${userPages.length + 1}`;
      const newPage = await addPage(defaultName);
      if (newPage && duplicateItemToPage && selectedForDuplicate) {
        const itemId = 'postpartum';
        await duplicateItemToPage(itemId, newPage.id);
        toast.success(t('journey.duplicatedSuccess', 'Élément dupliqué !'));
      }
    }
    setShowDuplicatePopup(false);
    setSelectedForDuplicate(null);
    setShowCreatePageForm(false);
    setNewPageName('');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // 4 catégories principales avec navigation vers sous-pages
  const mainCategories = [
    { 
      id: 'alimentation', 
      label: 'Alimentation', 
      desc: 'Allaitement, biberons, diversification',
      icon: Utensils, 
      color: 'orange',
      route: '/postpartum/alimentation'
    },
    { 
      id: 'soins', 
      label: 'Soins quotidiens', 
      desc: 'Coucher, change, portage',
      icon: Baby, 
      color: 'sky',
      route: '/postpartum/soins'
    },
    { 
      id: 'securite', 
      label: 'Sécurité', 
      desc: 'Difficultés, précautions',
      icon: Shield, 
      color: 'violet',
      route: '/postpartum/securite'
    },
    { 
      id: 'rdv', 
      label: 'RDV médicaux', 
      desc: 'Suivi post-accouchement',
      icon: Calendar, 
      color: 'pink',
      route: '/postpartum/rdv'
    },
  ];
  
  // Anciennes sections pour l'affichage détaillé (quand on clique sur une section)
  const sections = [
    { id: 'appointments', label: t('postpartumPage.sections.appointments'), icon: Calendar, color: 'pink' },
    { id: 'difficulties', label: t('postpartumPage.sections.difficulties'), icon: AlertTriangle, color: 'amber' },
    { id: 'breastfeeding', label: t('postpartumPage.sections.breastfeeding'), icon: Heart, color: 'rose' },
    { id: 'formula', label: t('postpartumPage.sections.formula'), icon: Baby, color: 'sky' },
    { id: 'diapers', label: t('postpartumPage.sections.diapers'), icon: Droplets, color: 'cyan' },
    { id: 'babywearing', label: t('postpartumPage.sections.babywearing'), icon: HandHeart, color: 'violet' },
    { id: 'diversification', label: t('postpartumPage.sections.diversification'), icon: Utensils, color: 'orange' },
    { id: 'recipes', label: t('postpartumPage.sections.recipes'), icon: Sparkles, color: 'emerald', badge: content?.recipes?.length || 0 },
    { id: 'precautions', label: t('postpartumPage.sections.precautions'), icon: Shield, color: 'slate' },
  ];

  // ==================== APERÇU POUR NON-ACHETEURS ====================
  if (!hasPostpartumAccess) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              className="bg-white rounded-full p-2 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {t('postpartumPage.title')}
              </h1>
              <p className="text-sm text-slate-500">{t('postpartumPage.subtitle')}</p>
            </div>
          </div>
          
          {/* Aperçu attractif */}
          <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-3xl p-6 border border-rose-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Baby className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {t('postpartumPage.accompanyTitle')}
              </h2>
              <p className="text-slate-600">
                {t('postpartumPage.accompanyDesc')}
              </p>
            </div>
            
            {/* Ce qui est inclus */}
            <div className="bg-white rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                {t('postpartumPage.whatAwaits')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('postpartumPage.features.appointments')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('postpartumPage.features.breastfeedingGuide')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('postpartumPage.features.formulaAdvice')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('postpartumPage.features.diapersGuide')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('postpartumPage.features.babyBlues')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{t('postpartumPage.features.recipes')}</span>
                </div>
              </div>
            </div>
            
            {/* Aperçu des RDV */}
            <div className="bg-white rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-slate-700 mb-3">{t('postpartumPage.appointmentsPreview')}</h3>
              <div className="space-y-2">
                {content?.appointments?.slice(0, 3).map((apt, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      apt.type === 'obligatoire' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{apt.title}</p>
                      <p className="text-xs text-slate-500">{t('postpartumPage.week')} {apt.week}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      apt.type === 'obligatoire' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {apt.type}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-2">
                  <Lock className="w-4 h-4" />
                  <span>{t('postpartumPage.moreAppointments')}</span>
                </div>
              </div>
            </div>
            
            {/* Prix et options */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl p-5 text-center">
                <p className="text-sm opacity-90 mb-1">{t('postpartumPage.fullAccess')}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold">8€</span>
                  <span className="text-lg opacity-90">{t('postpartumPage.oneTimePayment')}</span>
                </div>
                <p className="text-sm opacity-80 mt-2">
                  {t('postpartumPage.accessAfterBirth')}
                </p>
              </div>
              
              <Button
                onClick={() => navigate('/subscription/checkout?product=postpartum')}
                data-testid="buy-postpartum-button"
                className="w-full bg-white text-rose-600 border-2 border-rose-500 rounded-full py-4 font-bold text-lg hover:bg-rose-50"
              >
                <Crown className="w-5 h-5 mr-2" />
                {t('postpartumPage.buyPostpartum')}
              </Button>
              
              {/* Option parrainage */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-purple-800">{t('postpartumPage.getItFree')}</span>
                </div>
                <p className="text-sm text-purple-700">
                  {t('postpartumPage.referralOffer')}
                </p>
                <Button
                  onClick={() => navigate('/settings')}
                  className="mt-3 bg-purple-100 text-purple-700 rounded-full px-4 py-2 text-sm font-semibold hover:bg-purple-200"
                >
                  {t('postpartumPage.goToSettings')}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Rassurance */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              {t('postpartumPage.whyImportant')}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {t('postpartumPage.whyImportantDesc')}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Check className="w-4 h-4 text-green-500" />
              <span>{t('postpartumPage.validatedByProfessionals')}</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== ACCÈS ACHETÉ MAIS PAS ENCORE ACCOUCHÉ ====================
  if (hasPostpartumAccess && !hasGivenBirth) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              className="bg-white rounded-full p-2 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {t('postpartumPage.title')}
              </h1>
              <p className="text-sm text-slate-500">{t('postpartumPage.subtitle')}</p>
            </div>
          </div>
          
          {/* Statut */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-700">{t('postpartumPage.accessActivated')}</h2>
                <p className="text-sm text-slate-500">
                  {postpartumStatus?.postpartum_free_via_referral 
                    ? t('postpartumPage.freeViaReferral')
                    : t('postpartumPage.purchaseConfirmed')}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <CalendarDays className="w-6 h-6 text-rose-500" />
                <h3 className="font-bold text-slate-700">{t('postpartumPage.enterBirthDateTitle')}</h3>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                {t('postpartumPage.enterBirthDateDesc')}
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('postpartumPage.birthDateLabel')}</label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="rounded-xl border-green-200"
                    data-testid="birth-date-input"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('postpartumPage.babyNameLabel')}</label>
                  <Input
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    placeholder={t('postpartumPage.babyNamePlaceholder')}
                    className="rounded-xl border-green-200"
                    data-testid="baby-name-input"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSaveBirthDate}
                disabled={savingBirthDate}
                data-testid="confirm-birth-button"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-3 font-semibold"
              >
                <Baby className="w-5 h-5 mr-2" />
                {savingBirthDate ? t('postpartumPage.saving') : t('postpartumPage.iGaveBirth')}
              </Button>
            </div>
          </Card>
          
          {/* Aperçu de ce qui attend */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-3">{t('postpartumPage.whatAwaits')}</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Calendar className="w-6 h-6 text-rose-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">{t('postpartumPage.preview.appointments')}</p>
                <p className="text-xs text-slate-500">{t('postpartumPage.preview.detailed')}</p>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl">
                <Heart className="w-6 h-6 text-sky-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">{t('postpartumPage.preview.breastfeeding')}</p>
                <p className="text-xs text-slate-500">{t('postpartumPage.preview.andFormula')}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Shield className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">{t('postpartumPage.preview.advice')}</p>
                <p className="text-xs text-slate-500">{t('postpartumPage.preview.sixMonths')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== CONTENU COMPLET (ACCÈS + ACCOUCHÉ) ====================
  
  // Si une section est active, afficher son contenu en plein écran
  if (activeSection) {
    const section = sections.find(s => s.id === activeSection);
    if (section) {
      const Icon = section.icon;
      const colorClasses = getColorClasses(section.color);
      
      return (
        <div className="min-h-screen gradient-bg">
          <div className="max-w-2xl mx-auto p-6 space-y-4">
            {/* Header avec bouton retour */}
            <div className={`${colorClasses.bg} rounded-2xl p-4 flex items-center gap-3`}>
              <Button
                onClick={closeSection}
                className="bg-white/50 rounded-full p-2 shadow-sm"
                data-testid="back-from-section"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
              <div className={`w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colorClasses.text}`} />
              </div>
              <h1 className={`text-xl font-bold ${colorClasses.text}`}>
                {section.label}
              </h1>
            </div>
            
            {/* Contenu de la section */}
            <Card className="bg-white rounded-3xl shadow-sm p-4">
              {/* Indicateur de traduction */}
              {isTranslating && currentLang !== 'fr' && (
                <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('common.translating')}</span>
                </div>
              )}
              {activeSection === 'appointments' && (
                <AppointmentsSection appointments={displayContent?.appointments} />
              )}
              {activeSection === 'difficulties' && (
                <DifficultiesSection difficulties={displayContent?.difficulties} />
              )}
              {activeSection === 'breastfeeding' && (
                <BreastfeedingSection breastfeeding={displayContent?.breastfeeding} />
              )}
              {activeSection === 'formula' && (
                <FormulaSection formula={displayContent?.formula} />
              )}
              {activeSection === 'diapers' && (
                <DiapersSection diapers={displayContent?.diapers} />
              )}
              {activeSection === 'babywearing' && (
                <BabywearingSection babywearing={displayContent?.babywearing} />
              )}
              {activeSection === 'diversification' && (
                <DiversificationSection diversification={displayContent?.diversification} />
              )}
              {activeSection === 'recipes' && (
                <RecipesSection 
                  babyRecipes={displayContent?.baby_recipes} 
                  favorites={favorites}
                  onFavoritesChange={setFavorites}
                />
              )}
              {activeSection === 'precautions' && (
                <PrecautionsSection precautions={displayContent?.precautions} />
              )}
            </Card>
          </div>
        </div>
      );
    }
  }
  
  // Affichage de la grille de mosaïque
  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/journey-steps')}
            className="bg-white rounded-full p-2 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {t('postpartumPage.title')}
            </h1>
            <p className="text-sm text-slate-500">
              {babyName ? `${babyName} - ` : ''}{t('postpartumPage.week')} {postpartumStatus?.current_postpartum_week || 0}
            </p>
          </div>
        </div>
        
        {/* Info bébé */}
        {postpartumStatus?.actual_birth_date && (
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-700">
                  {babyName || t('postpartumPage.baby')} {t('postpartumPage.babyAge', { days: postpartumStatus?.days_since_birth || 0 })}
                </p>
                <p className="text-sm text-slate-500">
                  {t('postpartumPage.bornOn')} {new Date(postpartumStatus.actual_birth_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Disclaimer - quasi transparent */}
        <Card className="bg-amber-50/30 border border-amber-200/40 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500/70 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700/80">
              {t('postpartumPage.disclaimer')}
            </p>
          </div>
        </Card>

        {/* 4 Catégories principales en Mosaïque - Style bombé nuage pastel */}
        <div className="grid grid-cols-2 gap-4">
          {mainCategories.map((category) => {
            const Icon = category.icon;
            
            // Couleurs pastels par catégorie
            const colorStyles = {
              orange: {
                bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,237,213,0.95) 30%, rgba(254,215,170,0.85) 60%, rgba(253,186,116,0.7) 100%)',
                shadow: 'rgba(251,146,60,0.25)',
                border: 'rgba(251,146,60,0.35)',
                iconBg: 'from-orange-400 to-amber-500'
              },
              sky: {
                bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.95) 30%, rgba(186,230,253,0.85) 60%, rgba(125,211,252,0.7) 100%)',
                shadow: 'rgba(56,189,248,0.25)',
                border: 'rgba(56,189,248,0.35)',
                iconBg: 'from-sky-400 to-blue-500'
              },
              violet: {
                bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(237,233,254,0.95) 30%, rgba(221,214,254,0.85) 60%, rgba(196,181,253,0.7) 100%)',
                shadow: 'rgba(139,92,246,0.25)',
                border: 'rgba(139,92,246,0.35)',
                iconBg: 'from-violet-400 to-purple-500'
              },
              pink: {
                bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(252,231,243,0.95) 30%, rgba(251,207,232,0.85) 60%, rgba(249,168,212,0.7) 100%)',
                shadow: 'rgba(236,72,153,0.25)',
                border: 'rgba(236,72,153,0.35)',
                iconBg: 'from-pink-400 to-rose-500'
              }
            };
            
            const style = colorStyles[category.color] || colorStyles.pink;
            
            return (
              <Card 
                key={category.id} 
                onClick={() => navigate(category.route)}
                onTouchStart={() => handleLongPressStart(category.id)}
                onTouchEnd={handleLongPressEnd}
                onTouchMove={handleLongPressEnd}
                onMouseDown={() => handleLongPressStart(category.id)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                className={`relative overflow-hidden rounded-3xl p-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border-0 select-none ${
                  selectedForDuplicate === category.id ? 'ring-2 ring-pink-400' : ''
                }`}
                style={{ 
                  background: style.bg,
                  boxShadow: `
                    0 8px 24px -4px ${style.shadow},
                    0 4px 8px -2px ${style.shadow},
                    inset 0 2px 4px rgba(255,255,255,0.9),
                    inset 0 -2px 4px ${style.shadow}
                  `,
                  border: `2px solid ${style.border}`,
                  WebkitUserSelect: 'none', 
                  WebkitTouchCallout: 'none' 
                }}
                data-testid={`category-${category.id}`}
              >
                {/* Effet de reflet bombé */}
                <div 
                  className="absolute top-0 left-4 right-4 h-2/5 rounded-t-full pointer-events-none"
                  style={{ 
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  }}
                />
                
                {/* Icône avec bulle quasi-transparente */}
                <div 
                  className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3`}
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)`,
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)'
                  }}
                >
                  <Icon className={`w-7 h-7 ${
                    category.color === 'orange' ? 'text-orange-500' :
                    category.color === 'sky' ? 'text-sky-500' :
                    category.color === 'violet' ? 'text-violet-500' :
                    'text-pink-500'
                  }`} />
                </div>
                
                <div className="relative text-center">
                  <h3 className="font-bold text-slate-700 dark:text-black text-base mb-1">{category.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-700">{category.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Popup de duplication avec fond gris transparent */}
        <DuplicatePopup
          isVisible={showDuplicatePopup}
          onClose={() => {
            setShowDuplicatePopup(false);
            setSelectedForDuplicate(null);
            setShowCreatePageForm(false);
          }}
          onSelectPage={handleDuplicate}
          onCreateNewPage={handleCreatePageAndDuplicate}
          pages={pages}
          itemName="Post-partum"
          t={t}
        />
      </div>
    </div>
  );
}

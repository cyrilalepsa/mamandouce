/**
 * WeeklyTipsPage.js - Page "Ma Grossesse" v2.0
 * Design lumineux pastel avec bébé 3D animé
 * Carrousel horizontal élégant pour les semaines
 * Conseils IA contextuels et bouton administratif
 */
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  BookOpen, ChevronRight, ChevronLeft, AlertTriangle, Lock, Crown, 
  Loader2, Heart, Sparkles, Download, Camera, Scale, Ruler,
  FileText, Brain, Apple, ArrowLeft
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { useSubscription } from '../components/SubscriptionGate';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useTheme } from '../contexts/ThemeContext';
import { normalizeWeeklyTip } from '../utils/weeklyTips';

// Lazy load du visuel pour performance
const Baby3DContainer = lazy(() => import('../components/pregnancy/Baby3DContainer'));

function WeeklyTipsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [currentTip, setCurrentTip] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [touched3D, setTouched3D] = useState(false);
  const [fetusImages, setFetusImages] = useState({});
  const carouselRef = useRef(null);
  
  // Langue actuelle
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  
  // Traduction automatique du contenu
  const { translated: translatedTip, isLoading: isTranslating } = useAutoTranslate(
    currentTip,
    {
      fields: [
        'title',
        'description',
        'development',
        'fruit_comparison',
        'embryo_size',
        'embryo_weight',
      ],
      enabled: currentLang !== 'fr'
    }
  );
  
  // Utiliser le contenu traduit ou original
  const displayTip = normalizeWeeklyTip(
    currentLang !== 'fr' && translatedTip ? translatedTip : currentTip,
    selectedWeek,
  );
  
  // Semaines gratuites (1-4)
  const FREE_WEEKS = [1, 2, 3, 4];
  
  // Toutes les semaines
  const allWeeks = Array.from({ length: 41 }, (_, i) => i + 1);

  useEffect(() => {
    loadPregnancyProfile();
    api.get('/pregnancy/fetus-visuals')
      .then((response) => setFetusImages(response.data?.images || {}))
      .catch(() => setFetusImages({}));
  }, []);

  useEffect(() => {
    if (selectedWeek) {
      loadWeeklyTip(selectedWeek);
    }
  }, [selectedWeek]);
  
  // Scroll automatique vers la semaine sélectionnée
  useEffect(() => {
    if (carouselRef.current && selectedWeek) {
      const weekElement = carouselRef.current.querySelector(`[data-week="${selectedWeek}"]`);
      if (weekElement) {
        weekElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedWeek]);

  const loadPregnancyProfile = async () => {
    try {
      const response = await api.pregnancy.getProfile();
      if (response.data && response.data.current_week) {
        setPregnancyProfile(response.data);
        const currentWeek = response.data.current_week;
        if (!isPremium && currentWeek > 4) {
          setSelectedWeek(4);
        } else {
          setSelectedWeek(currentWeek);
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const loadWeeklyTip = async (week) => {
    try {
      const response = await api.tips.getWeekly(week);
      setCurrentTip(normalizeWeeklyTip(response.data, week));
    } catch (error) {
      console.error('Erreur chargement conseil:', error);
    }
  };

  const handleWeekSelect = (week) => {
    if (!isPremium && !FREE_WEEKS.includes(week)) {
      toast.error('Passez Premium pour accéder à cette semaine');
      return;
    }
    setSelectedWeek(week);
  };
  
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  const handle3DTouch = () => {
    setTouched3D(true);
    toast.success('Coucou petit bébé ! 👶', { duration: 1500 });
    setTimeout(() => setTouched3D(false), 2000);
  };
  
  // Conseils IA contextuels basés sur la semaine
  const getAIAdvice = (week) => {
    const advices = {
      1: { icon: '🌱', text: "Votre corps se prépare. Vérifiez votre apport en acide folique avec le scanner alimentaire.", action: "Scanner" },
      2: { icon: '🧬', text: "L'ovulation approche. C'est le moment idéal pour optimiser votre alimentation.", action: "Scanner" },
      3: { icon: '⚡', text: "L'implantation consomme de l'énergie. Scannez vos aliments pour vérifier votre apport en magnésium aujourd'hui.", action: "Scanner" },
      4: { icon: '🫀', text: "Le cœur commence à battre ! Vérifiez vos apports en fer et vitamines.", action: "Scanner" },
      8: { icon: '🧠', text: "Le cerveau se développe rapidement. Les oméga-3 sont essentiels cette semaine.", action: "Scanner" },
      12: { icon: '✨', text: "Fin du 1er trimestre ! Pensez à varier vos sources de protéines.", action: "Scanner" },
      16: { icon: '💪', text: "Bébé prend des forces. Vérifiez vos apports en calcium.", action: "Scanner" },
      20: { icon: '👀', text: "Les sens se développent. Privilégiez les aliments riches en vitamine A.", action: "Scanner" },
      24: { icon: '🫁', text: "Les poumons se forment. Surveillez votre glycémie.", action: "Scanner" },
      28: { icon: '🧘', text: "3ème trimestre ! Réduisez le sel et augmentez le potassium.", action: "Scanner" },
      32: { icon: '🍼', text: "Préparez-vous à l'allaitement. Vérifiez vos apports en vitamine D.", action: "Scanner" },
      36: { icon: '🎯', text: "Dernière ligne droite ! Privilégiez les petits repas fréquents.", action: "Scanner" },
      40: { icon: '🎉', text: "Bébé arrive bientôt ! Restez hydratée et écoutez votre corps.", action: "Scanner" },
    };
    return advices[week] || advices[3];
  };
  
  // Documents administratifs par semaine
  const getAdminDoc = (week) => {
    if (week <= 4) {
      return {
        show: true,
        title: "C'est le moment !",
        description: "Téléchargez votre guide pour la déclaration de grossesse (CAF/CPAM).",
        buttonText: "Guide déclaration",
        icon: FileText
      };
    }
    if (week <= 12) {
      return {
        show: true,
        title: "Démarches 1er trimestre",
        description: "Déclaration de grossesse et 1ère échographie à prévoir.",
        buttonText: "Checklist T1",
        icon: FileText
      };
    }
    if (week <= 28) {
      return {
        show: true,
        title: "Préparez le congé maternité",
        description: "Pensez à informer votre employeur et préparer votre dossier.",
        buttonText: "Guide congé",
        icon: FileText
      };
    }
    return null;
  };
  
  const aiAdvice = getAIAdvice(selectedWeek);
  const adminDoc = getAdminDoc(selectedWeek);
  
  // Styles pour le mode clair/sombre
  const textColor = isDarkMode ? 'text-white' : 'text-slate-700';
  const textMuted = isDarkMode ? 'text-slate-300' : 'text-slate-500';
  const textShadow = isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {};

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'gradient-bg'} pb-24`}>
      {/* Header lumineux */}
      <div className="relative overflow-hidden">
        {/* Navigation */}
        <div className="relative px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-white/90'} shadow-lg flex items-center justify-center border ${isDarkMode ? 'border-slate-700' : 'border-pink-100'}`}
            >
              <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-pink-500'}`} />
            </button>
            <h1 className={`text-xl font-bold ${textColor}`} style={{ fontFamily: 'Nunito, sans-serif', ...textShadow }}>
              Ma Grossesse
            </h1>
            <div className="w-10" />
          </div>
        </div>
        
        {/* Indicateur semaine actuelle */}
        {pregnancyProfile && (
          <div className="relative px-6 py-2">
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              <span className={`${isDarkMode ? 'text-pink-300' : 'text-pink-500'} font-medium`} style={textShadow}>
                Vous êtes à la semaine {pregnancyProfile.current_week} SA
              </span>
            </div>
          </div>
        )}
        
        {/* Carrousel des semaines - Style bombé pastel */}
        <div className="relative px-2 py-4">
          {/* Bouton gauche */}
          <button 
            onClick={() => scrollCarousel('left')}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-white/95'} shadow-lg flex items-center justify-center border ${isDarkMode ? 'border-slate-700' : 'border-pink-100'}`}
          >
            <ChevronLeft className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-pink-500'}`} />
          </button>
          
          {/* Carrousel */}
          <div 
            ref={carouselRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-8 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allWeeks.map((week) => {
              const isLocked = !isPremium && !FREE_WEEKS.includes(week);
              const isSelected = selectedWeek === week;
              const isCurrent = pregnancyProfile?.current_week === week;
              
              return (
                <button
                  key={week}
                  data-week={week}
                  data-testid={`week-${week}-button`}
                  onClick={() => handleWeekSelect(week)}
                  disabled={isLocked}
                  className={`
                    relative flex-shrink-0 snap-center overflow-hidden
                    w-12 h-12 rounded-2xl font-bold text-sm
                    transition-all duration-300 ease-out
                    ${isSelected ? 'scale-110' : isLocked ? '' : 'hover:scale-105'}
                  `}
                  style={isSelected ? {
                    background: 'linear-gradient(145deg, rgba(236,72,153,0.95) 0%, rgba(244,114,182,1) 50%, rgba(251,182,206,0.9) 100%)',
                    boxShadow: '0 6px 20px rgba(236,72,153,0.35), inset 0 2px 4px rgba(255,255,255,0.4)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.5)'
                  } : isLocked ? {
                    background: isDarkMode ? 'rgba(51,65,85,0.5)' : 'linear-gradient(145deg, rgba(241,245,249,0.8) 0%, rgba(226,232,240,0.6) 100%)',
                    color: isDarkMode ? '#64748b' : '#94a3b8',
                    border: '1px solid rgba(148,163,184,0.2)'
                  } : {
                    background: isDarkMode 
                      ? 'linear-gradient(145deg, rgba(51,65,85,0.9) 0%, rgba(71,85,105,0.8) 100%)'
                      : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(252,231,243,0.95) 50%, rgba(251,207,232,0.85) 100%)',
                    boxShadow: isDarkMode 
                      ? '0 4px 12px rgba(0,0,0,0.2)' 
                      : '0 4px 12px rgba(236,72,153,0.12), inset 0 2px 4px rgba(255,255,255,0.9)',
                    color: isDarkMode ? '#f1f5f9' : '#be185d',
                    border: isDarkMode ? '1px solid rgba(100,116,139,0.3)' : '1px solid rgba(251,182,206,0.5)'
                  }}
                >
                  <span className="relative z-10">{week}</span>
                  {isLocked && (
                    <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-slate-400" />
                  )}
                  {isCurrent && !isSelected && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-pink-400 border-2 border-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Bouton droite */}
          <button 
            onClick={() => scrollCarousel('right')}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-white/95'} shadow-lg flex items-center justify-center border ${isDarkMode ? 'border-slate-700' : 'border-pink-100'}`}
          >
            <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-pink-500'}`} />
          </button>
        </div>
        
        {/* Banner Premium */}
        {!subscriptionLoading && !isPremium && (
          <div 
            className="mx-4 mb-4 rounded-2xl p-3 flex items-center justify-between"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(145deg, rgba(126,34,206,0.2) 0%, rgba(219,39,119,0.2) 100%)'
                : 'linear-gradient(145deg, rgba(243,232,255,0.95) 0%, rgba(252,231,243,0.95) 100%)',
              border: isDarkMode ? '1px solid rgba(168,85,247,0.3)' : '2px solid rgba(168,85,247,0.25)',
              boxShadow: '0 4px 15px rgba(168,85,247,0.1)'
            }}
          >
            <div className="flex items-center gap-2">
              <Lock className={`w-4 h-4 ${isDarkMode ? 'text-purple-300' : 'text-purple-500'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>Semaines 1-4 gratuites</span>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md"
            >
              <Crown className="w-3 h-3" />
              Tout débloquer
            </button>
          </div>
        )}
      </div>
      
      {/* Contenu principal */}
      <div className="px-4 space-y-4">
        {/* Indicateur de traduction */}
        {isTranslating && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('common.translating')}</span>
          </div>
        )}
        
        {displayTip && (
          <>
            {/* Titre de la semaine */}
            <div className="text-center py-2">
              <span 
                className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-2"
                style={{
                  background: isDarkMode ? 'rgba(236,72,153,0.2)' : 'linear-gradient(135deg, rgba(251,207,232,0.8) 0%, rgba(244,114,182,0.3) 100%)',
                  color: isDarkMode ? '#f9a8d4' : '#be185d',
                  border: isDarkMode ? '1px solid rgba(236,72,153,0.3)' : '1px solid rgba(244,114,182,0.4)'
                }}
              >
                Semaine {displayTip.week}
              </span>
              <h2 className={`text-2xl font-bold ${textColor}`} style={{ fontFamily: 'Nunito, sans-serif', ...textShadow }}>
                {displayTip.title}
              </h2>
            </div>
            
            {/* Carte 3D du bébé - Style bombé lumineux */}
            <Card 
              className="relative overflow-hidden rounded-3xl border-0"
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(51,65,85,0.8) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(254,242,247,0.95) 45%, rgba(252,231,243,0.85) 100%)',
                boxShadow: isDarkMode 
                  ? '0 8px 24px rgba(0,0,0,0.3)'
                  : '0 10px 40px -6px rgba(236,72,153,0.2), inset 0 2px 4px rgba(255,255,255,0.9)',
                border: isDarkMode ? '1px solid rgba(100,116,139,0.3)' : '2px solid rgba(251,182,206,0.4)'
              }}
            >
              {/* Zone 3D - Model Viewer (Google) */}
              <div className="relative pt-2">
                <Suspense fallback={
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto mb-2" />
                      <p className={`${textMuted} text-sm`}>Chargement...</p>
                    </div>
                  </div>
                }>
                  <Baby3DContainer 
                    week={selectedWeek}
                    height="340px"
                    imageUrl={fetusImages[String(selectedWeek)] || null}
                  />
                </Suspense>
                
                {/* Indication tactile */}
                <div className="absolute bottom-2 left-0 right-0 text-center z-20">
                  <span className={`text-xs ${textMuted}`} style={{ textShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}>
                    Semaine {selectedWeek} de développement
                  </span>
                </div>
              </div>
              
              {/* Stats du bébé */}
              <div className="relative p-4 pt-2">
                <div className="grid grid-cols-3 gap-3">
                  <div 
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: isDarkMode ? 'rgba(56,189,248,0.1)' : 'linear-gradient(145deg, rgba(224,242,254,0.9) 0%, rgba(186,230,253,0.7) 100%)',
                      border: isDarkMode ? '1px solid rgba(56,189,248,0.2)' : '1px solid rgba(56,189,248,0.3)'
                    }}
                  >
                    <Ruler className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                    <p className={`text-xs ${textMuted} mb-1`}>Taille</p>
                    <p className="text-lg font-bold text-sky-600">{displayTip.embryo_size}</p>
                  </div>
                  <div 
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: isDarkMode ? 'rgba(236,72,153,0.1)' : 'linear-gradient(145deg, rgba(252,231,243,0.9) 0%, rgba(251,207,232,0.7) 100%)',
                      border: isDarkMode ? '1px solid rgba(236,72,153,0.2)' : '1px solid rgba(244,114,182,0.3)'
                    }}
                  >
                    <Scale className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                    <p className={`text-xs ${textMuted} mb-1`}>Poids</p>
                    <p className="text-lg font-bold text-pink-500">{displayTip.embryo_weight || '< 1 g'}</p>
                  </div>
                  <div 
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: isDarkMode ? 'rgba(239,68,68,0.1)' : 'linear-gradient(145deg, rgba(254,226,226,0.9) 0%, rgba(254,202,202,0.7) 100%)',
                      border: isDarkMode ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(248,113,113,0.3)'
                    }}
                  >
                    <Heart className="w-5 h-5 text-red-400 mx-auto mb-1 animate-pulse" />
                    <p className={`text-xs ${textMuted} mb-1`}>Cœur</p>
                    <p className="text-lg font-bold text-red-500">{selectedWeek >= 6 ? '💓' : '...'}</p>
                  </div>
                </div>
                
                {displayTip.fruit_comparison && (
                  <div 
                    className="mt-3 rounded-xl p-3 text-center"
                    style={{
                      background: isDarkMode ? 'rgba(245,158,11,0.1)' : 'linear-gradient(145deg, rgba(254,249,195,0.9) 0%, rgba(253,230,138,0.7) 100%)',
                      border: isDarkMode ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(251,191,36,0.4)'
                    }}
                  >
                    <p className={`text-sm ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                      <span className="font-semibold">Comparable à :</span> {displayTip.fruit_comparison}
                    </p>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Description */}
            <Card 
              className="relative overflow-hidden rounded-2xl p-5 border-0"
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(51,65,85,0.8) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(241,245,249,0.95) 100%)',
                boxShadow: isDarkMode ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 15px rgba(100,116,139,0.1)',
                border: isDarkMode ? '1px solid rgba(100,116,139,0.3)' : '1px solid rgba(226,232,240,0.8)'
              }}
            >
              <p className={`relative ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`} style={textShadow}>
                {displayTip.description}
              </p>
            </Card>
            
            {/* Développement du bébé */}
            {displayTip.development && (
              <Card 
                className="relative overflow-hidden rounded-2xl p-5 border-0"
                style={{
                  background: isDarkMode 
                    ? 'linear-gradient(145deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%)'
                    : 'linear-gradient(145deg, rgba(252,231,243,0.95) 0%, rgba(243,232,255,0.95) 100%)',
                  boxShadow: isDarkMode ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 15px rgba(236,72,153,0.1)',
                  border: isDarkMode ? '1px solid rgba(236,72,153,0.2)' : '2px solid rgba(244,114,182,0.25)'
                }}
              >
                <h4 className={`relative font-bold ${isDarkMode ? 'text-pink-300' : 'text-pink-600'} mb-2 flex items-center gap-2`} style={textShadow}>
                  <Sparkles className="w-5 h-5" />
                  Développement cette semaine
                </h4>
                <p className={`relative ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} style={textShadow}>{displayTip.development}</p>
              </Card>
            )}
            
            {/* Bouton Administratif Contextuel */}
            {adminDoc?.show && (
              <Card 
                className="relative overflow-hidden rounded-2xl p-5 border-0"
                style={{
                  background: isDarkMode 
                    ? 'linear-gradient(145deg, rgba(245,158,11,0.1) 0%, rgba(251,191,36,0.05) 100%)'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(254,249,195,0.5) 100%)',
                  boxShadow: isDarkMode ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 15px rgba(245,158,11,0.1)',
                  border: isDarkMode ? '1px solid rgba(245,158,11,0.3)' : '2px solid rgba(251,191,36,0.4)'
                }}
              >
                <div className="relative flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.3) 100%)',
                      border: '1px solid rgba(245,158,11,0.3)'
                    }}
                  >
                    <adminDoc.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-700'} mb-1`} style={textShadow}>{adminDoc.title}</h4>
                    <p className={`${textMuted} text-sm mb-3`} style={textShadow}>{adminDoc.description}</p>
                    <Button
                      onClick={() => navigate('/parental-leave')}
                      className="bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl px-4 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {adminDoc.buttonText}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Conseil IA Nutrition */}
            <Card 
              className="relative overflow-hidden rounded-2xl p-5 border-0"
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(145deg, rgba(34,197,94,0.1) 0%, rgba(16,185,129,0.05) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(220,252,231,0.5) 100%)',
                boxShadow: isDarkMode ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 15px rgba(34,197,94,0.1)',
                border: isDarkMode ? '1px solid rgba(34,197,94,0.3)' : '2px solid rgba(74,222,128,0.35)'
              }}
            >
              <div className="relative flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(74,222,128,0.2) 0%, rgba(34,197,94,0.3) 100%)',
                    border: '1px solid rgba(34,197,94,0.3)'
                  }}
                >
                  <Brain className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{aiAdvice.icon}</span>
                    <h4 className={`font-bold ${isDarkMode ? 'text-green-300' : 'text-green-700'}`} style={textShadow}>Conseil IA du jour</h4>
                  </div>
                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} text-sm mb-3`} style={textShadow}>{aiAdvice.text}</p>
                  <Button
                    onClick={() => navigate('/library')}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl px-4 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Scanner mes aliments
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Note importante */}
            <Card 
              className="relative overflow-hidden rounded-2xl p-5 border-0"
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(145deg, rgba(239,68,68,0.1) 0%, rgba(236,72,153,0.05) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(254,226,226,0.5) 100%)',
                boxShadow: isDarkMode ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 15px rgba(239,68,68,0.1)',
                border: isDarkMode ? '1px solid rgba(239,68,68,0.3)' : '2px solid rgba(248,113,113,0.3)'
              }}
            >
              <div className="relative flex items-start gap-3">
                <AlertTriangle className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-rose-500'} flex-shrink-0`} />
                <div>
                  <h4 className={`font-bold ${isDarkMode ? 'text-red-300' : 'text-rose-600'} mb-2`} style={textShadow}>Note importante</h4>
                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} text-sm mb-3`} style={textShadow}>
                    <strong className={isDarkMode ? 'text-red-300' : 'text-rose-600'}>Ne négligez pas vos dents et vos cheveux !</strong> Durant la grossesse, ils sont fragilisés par les changements hormonaux.
                  </p>
                  <div className={`space-y-2 ${textMuted} text-sm`}>
                    <p style={textShadow}>🦷 <strong className={textColor}>Dents :</strong> Consultez votre dentiste et signalez tout saignement.</p>
                    <p style={textShadow}>💇 <strong className={textColor}>Cheveux :</strong> Une chute peut survenir. Consultez si nécessaire.</p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
        
        {!displayTip && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeklyTipsPage;

import { useState, useEffect } from 'react';
import { PartyPopper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppTitle from '../components/AppTitle';
import { AvatarPreview } from '../components/profile/AvatarBuilder';
import PremiumSunAvatar from '../components/profile/PremiumSunAvatar';
import { isNameCelebratedToday } from '../data/saintsCalendar';
import LanguageBubble from '../components/LanguageBubble';
import {
  TopBar,
  CustomizableHome,
  TutorialPopup,
  InfoButton,
  useTutorial,
  InteractiveTutorial
} from '../components/home';
import { NewsBubble, NewsPopup, useNews } from '../components/home/NewsBubble';

const ADMIN_EMAIL = 'cyrilalepsa@gmail.com';

function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userAvatarConfig, setUserAvatarConfig] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [isPremium, setIsPremium] = useState(false);
  const [currentPageType, setCurrentPageType] = useState('default');
  const [hasRapportInFertileWindow, setHasRapportInFertileWindow] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [earnedTrophy, setEarnedTrophy] = useState(null); // 'bronze', 'silver', 'gold' ou null
  
  // Hook pour le tutoriel
  const { 
    showTutorial, 
    showInteractiveTutorial, 
    tutorialDismissed, 
    isFirstTimeTutorial,
    dismissTutorial, 
    openTutorial, 
    completeInteractiveTutorial, 
    replayInteractiveTutorial,
    closeInteractiveTutorial 
  } = useTutorial();
  
  // Hook pour les nouveautés (fleur de lotus)
  const { hasNews, updates, isPopupOpen, openPopup, closePopup, markAsSeen } = useNews();

  useEffect(() => {
    loadUserData();
    loadTrophyData();
  }, []);

  // Vérifie si un rapport a été enregistré dans une fenêtre de fertilité
  const checkRapportInFertileWindow = (profile) => {
    if (!profile || !profile.last_period_date) return false;
    
    // Charger les rapports depuis localStorage
    const savedRapports = localStorage.getItem('mamandouce_rapports');
    if (!savedRapports) return false;
    
    const rapportDates = JSON.parse(savedRapports);
    if (rapportDates.length === 0) return false;
    
    // Calculer la fenêtre de fertilité
    const lastPeriod = new Date(profile.last_period_date);
    const cycleLength = profile.cycle_length || 28;
    const lutealPhase = 14;
    const ovulationDay = cycleLength - lutealPhase;
    
    // Calculer la date d'ovulation
    const ovulationDate = new Date(lastPeriod);
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
    
    // Fenêtre de fertilité: 5 jours avant l'ovulation jusqu'à 1 jour après
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    // Ajuster pour les cycles suivants si nécessaire
    const today = new Date();
    while (fertileEnd < today) {
      // Passer au cycle suivant
      const daysToAdd = cycleLength;
      fertileStart.setDate(fertileStart.getDate() + daysToAdd);
      fertileEnd.setDate(fertileEnd.getDate() + daysToAdd);
    }
    
    // Vérifier si un rapport est dans la fenêtre de fertilité actuelle ou passée récente
    for (const rapportDateStr of rapportDates) {
      const rapportDate = new Date(rapportDateStr);
      
      // Vérifier pour le cycle actuel et le cycle précédent
      // Cycle actuel
      if (rapportDate >= fertileStart && rapportDate <= fertileEnd) {
        return true;
      }
      
      // Cycle précédent (pour couvrir une grossesse potentielle en cours)
      const prevFertileStart = new Date(fertileStart);
      prevFertileStart.setDate(prevFertileStart.getDate() - cycleLength);
      const prevFertileEnd = new Date(fertileEnd);
      prevFertileEnd.setDate(prevFertileEnd.getDate() - cycleLength);
      
      if (rapportDate >= prevFertileStart && rapportDate <= prevFertileEnd) {
        return true;
      }
    }
    
    return false;
  };

  const loadUserData = async () => {
    try {
      const userRes = await api.auth.getMe();
      setUserName(userRes.data.name);
      setDisplayName(userRes.data.display_name || '');
      setUserAvatar(userRes.data.avatar || '');
      setUserAvatarConfig(userRes.data.avatar_config || null);
      setUserEmail(userRes.data.email);
      setUserRole(userRes.data.role || 'user');
      setIsPremium(userRes.data.subscription_status === 'premium' || userRes.data.subscription_status === 'trial');
      
      const profileRes = await api.pregnancy.getProfile();
      setPregnancyProfile(profileRes.data);
      
      // Vérifier si un rapport est dans une fenêtre de fertilité
      const hasRapport = checkRapportInFertileWindow(profileRes.data);
      setHasRapportInFertileWindow(hasRapport);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      // Marquer comme chargé pour éviter les saccades
      setTimeout(() => setIsLoaded(true), 100);
    }
  };

  const loadTrophyData = async () => {
    try {
      const res = await api.get('/api/trophies/progress');
      const progress = res.data;
      if (progress?.gold?.earned) setEarnedTrophy('gold');
      else if (progress?.silver?.earned) setEarnedTrophy('silver');
      else if (progress?.bronze?.earned) setEarnedTrophy('bronze');
    } catch (e) {
      // Pas de trophée ou API non disponible
    }
  };


  // Navigation vers la page de modification d'avatar
  const handleAvatarClick = () => {
    navigate('/profile?tab=avatar');
  };

  const isAdmin = userRole === 'admin' || userEmail === ADMIN_EMAIL;
  // La carte Semaine X ne s'affiche que si:
  // 1. Il y a un profil de grossesse avec une semaine
  // 2. ET un rapport a été enregistré dans une fenêtre de fertilité
  const hasPregnancyProfile = pregnancyProfile && pregnancyProfile.current_week && hasRapportInFertileWindow;

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">

        <div className="relative z-10">
          <div 
            className={`max-w-4xl mx-auto p-6 space-y-6 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ contain: 'layout style' }}
          >
            
            <TopBar 
              isAdmin={isAdmin}
              userAvatar={userAvatar}
              userAvatarConfig={userAvatarConfig}
            />

            {/* Logo et bienvenue - visible UNIQUEMENT sur la page socle (default) */}
            <div 
              className="min-h-[180px]"
              style={{ 
                display: currentPageType === 'default' ? 'block' : 'none',
                contain: 'layout style'
              }}
            >
              <div className="text-center py-4">
                <AppTitle size="xl" showSubtitle={false} />
              </div>

              {/* Salutation avec avatar CLIQUABLE - hauteur fixe pour éviter le layout shift */}
              <div className="flex flex-col items-center gap-3 min-h-[100px]">
                {/* Avatar Premium avec aura solaire */}
                <PremiumSunAvatar
                  isPremium={isPremium}
                  userAvatar={userAvatar}
                  userAvatarConfig={userAvatarConfig}
                  size={64}
                  onClick={handleAvatarClick}
                  title={t('profile.editAvatar', 'Modifier mon avatar')}
                  testId="home-avatar"
                  earnedTrophy={earnedTrophy}
                />
                <h2 className="text-2xl sm:text-3xl text-center" data-testid="user-welcome">
                  <span className="text-slate-500 font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>{t('home.welcome')}, </span>
                  <span 
                    className="text-4xl sm:text-5xl font-semibold user-name-display" 
                    style={{ fontFamily: "'Caveat', cursive", color: '#FF8C9F', WebkitTextFillColor: '#FF8C9F' }}
                    data-testid="user-name"
                  >
                    {displayName || userName || ' '}
                  </span>
                  <span className="text-pink-400 ml-2">❤️</span>
                </h2>
                
                {/* Message Bonne Fête si le prénom de l'utilisateur est fêté aujourd'hui */}
                {isNameCelebratedToday(displayName || userName) && (
                  <div className="mt-3 bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 rounded-2xl px-4 py-3 border-2 border-amber-300 shadow-lg animate-bounce-slow">
                    <div className="flex items-center justify-center gap-2">
                      <PartyPopper className="w-5 h-5 text-amber-600" />
                      <span className="text-lg font-bold text-amber-700" style={{ fontFamily: "'Caveat', cursive" }}>
                        🎉 {t('home.happyNameDay')} {displayName || userName} ! 🎉
                      </span>
                      <PartyPopper className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contenu personnalisable avec pages multiples */}
            <div className="pt-8">
              <CustomizableHome 
                pregnancyProfile={pregnancyProfile}
                hasPregnancyProfile={hasPregnancyProfile}
                userName={displayName || userName}
                userAvatar={userAvatar}
                userAvatarConfig={userAvatarConfig}
                onPageTypeChange={setCurrentPageType}
                onAvatarClick={handleAvatarClick}
              />
            </div>

          </div>
        </div>
        
        {/* Tutoriel interactif (première connexion ou replay) */}
        <InteractiveTutorial 
          isVisible={showInteractiveTutorial} 
          onComplete={isFirstTimeTutorial ? completeInteractiveTutorial : closeInteractiveTutorial}
          isFirstTime={isFirstTimeTutorial}
        />
        
        {/* Popup tutoriel/astuces (accessible via le bouton info) */}
        <TutorialPopup 
          isVisible={showTutorial} 
          onClose={dismissTutorial}
          isPremium={isPremium}
          onReplayTutorial={replayInteractiveTutorial}
        />
        
        {/* Bulle ampoule - Nouveautés (toujours visible après le tutoriel interactif) */}
        {tutorialDismissed && (
          <NewsBubble hasNews={hasNews} onClick={openPopup} />
        )}
        
        {/* Popup des nouveautés */}
        <NewsPopup 
          isVisible={isPopupOpen}
          updates={updates}
          onClose={closePopup}
          onMarkAsSeen={markAsSeen}
        />
        
        {/* Bouton info en bas à gauche */}
        {tutorialDismissed && (
          <InfoButton onClick={openTutorial} />
        )}
      </div>
  );
}

export default HomePage;

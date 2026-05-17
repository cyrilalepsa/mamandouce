import { useState, useEffect, useRef } from 'react';
import { PartyPopper, RefreshCw } from 'lucide-react'; // Ajout de RefreshCw pour un indicateur visuel nacre
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
  
  // 🧼 ÉTATS POUR LE PULL-TO-REFRESH CUSTOM
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const scrollContainerRef = useRef(null);
  const touchStartRef = useRef(0);
  
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
    
    const savedRapports = localStorage.getItem('mamandouce_rapports');
    if (!savedRapports) return false;
    
    const rapportDates = JSON.parse(savedRapports);
    if (rapportDates.length === 0) return false;
    
    const lastPeriod = new Date(profile.last_period_date);
    const cycleLength = profile.cycle_length || 28;
    const lutealPhase = 14;
    const ovulationDay = cycleLength - lutealPhase;
    
    const ovulationDate = new Date(lastPeriod);
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
    
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    const today = new Date();
    while (fertileEnd < today) {
      const daysToAdd = cycleLength;
      fertileStart.setDate(fertileStart.getDate() + daysToAdd);
      fertileEnd.setDate(fertileEnd.getDate() + daysToAdd);
    }
    
    for (const rapportDateStr of rapportDates) {
      const rapportDate = new Date(rapportDateStr);
      if (rapportDate >= fertileStart && rapportDate <= fertileEnd) {
        return true;
      }
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
      
      const hasRapport = checkRapportInFertileWindow(profileRes.data);
      setHasRapportInFertileWindow(hasRapport);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
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
    } catch (e) {}
  };

  // 🧼 GESTION DU REFRESH MANUEL (TACTILE & SOURIS)
  const handleTouchStart = (e) => {
    if (scrollContainerRef.current.scrollTop === 0 && !isRefreshing) {
      touchStartRef.current = e.touches ? e.touches[0].clientY : e.clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartRef.current === 0 || isRefreshing) return;
    
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    const pull = currentY - touchStartRef.current;
    
    // Si on tire vers le bas au sommet du défilement
    if (pull > 0 && scrollContainerRef.current.scrollTop === 0) {
      // Résistance élastique pour faire premium
      const resistance = Math.min(70, pull * 0.4);
      setPullDistance(resistance);
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    touchStartRef.current = 0;
    if (pullDistance >= 50) {
      setIsRefreshing(true);
      setPullDistance(50);
      
      // Lancement du rechargement frais depuis Python (Railway)
      await Promise.all([loadUserData(), loadTrophyData()]);
      
      setIsRefreshing(false);
      setPullDistance(0);
    } else {
      setPullDistance(0);
    }
  };

  const handleAvatarClick = () => {
    navigate('/profile?tab=avatar');
  };

  const isAdmin = userRole === 'admin' || userEmail === ADMIN_EMAIL;
  const hasPregnancyProfile = pregnancyProfile && pregnancyProfile.current_week && hasRapportInFertileWindow;

  return (
    <div 
      className="gradient-bg relative" 
      style={{ height: '100dvh', overflow: 'hidden', overscrollBehaviorY: 'contain' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
    >
        {/* INDICATEUR DE SOURIS / PULL REFRESH IRISÉ STYLE BULLE */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-200 pointer-events-none z-50"
          style={{
            top: `${pullDistance - 35}px`,
            opacity: pullDistance > 15 ? 1 : 0,
          }}
        >
          <div className="nacre-bombe flex items-center justify-center w-10 h-10 border-radius-full" style={{ borderRadius: '50%', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(5px)' }}>
            <RefreshCw className={`w-5 h-5 text-pink-400 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDistance * 5}deg)` }} />
          </div>
        </div>

        {/* CONTENEUR DE SCROLL INTERNE PRINCIPAL */}
        <div 
          ref={scrollContainerRef}
          className="relative z-10 w-full h-full overflow-y-auto"
          style={{ 
            transition: pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.1, 0.8, 0.2, 1)' : 'none',
            transform: `translateY(${pullDistance}px)`,
            height: '100dvh'
          }}
        >
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

              {/* Salutation avec avatar CLIQUABLE */}
              <div className="flex flex-col items-center gap-3 min-h-[100px]">
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
                
                {/* Message Bonne Fête */}
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
                disabledScroll={pullDistance > 0} // Optionnel pour bloquer les actions pendant le tirage
              />
            </div>

          </div>
        </div>
        
        {/* Tutoriels et popups (en dehors du scroll principal pour rester fixes) */}
        <InteractiveTutorial 
          isVisible={showInteractiveTutorial} 
          onComplete={isFirstTimeTutorial ? completeInteractiveTutorial : closeInteractiveTutorial}
          isFirstTime={isFirstTimeTutorial}
        />
        
        <TutorialPopup 
          isVisible={showTutorial} 
          onClose={dismissTutorial}
          isPremium={isPremium}
          onReplayTutorial={replayInteractiveTutorial}
        />
        
        {tutorialDismissed && (
          <NewsBubble hasNews={hasNews} onClick={openPopup} />
        )}
        
        <NewsPopup 
          isVisible={isPopupOpen}
          updates={updates}
          onClose={closePopup}
          onMarkAsSeen={markAsSeen}
        />
        
        {tutorialDismissed && (
          <InfoButton onClick={openTutorial} />
        )}
      </div>
  );
}

export default HomePage;
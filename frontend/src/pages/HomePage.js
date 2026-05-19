import { useState, useEffect, useRef } from 'react';
import { PartyPopper, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppTitle from '../components/AppTitle';
import { AvatarPreview } from '../components/profile/AvatarBuilder';
import PremiumSunAvatar from '../components/profile/PremiumSunAvatar';
import { isNameCelebratedToday } from '../data/saintsCalendar';
import LanguageBubble from '../components/LanguageBubble';
import CustomizableHome from '../components/home/CustomizableHome'; // 👈 Import par défaut isolé corrigé
import {
  TopBar,
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
  const [earnedTrophy, setEarnedTrophy] = useState(null);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const scrollContainerRef = useRef(null);
  const touchStartRef = useRef(0);
  
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
  
  const { hasNews, updates, isPopupOpen, openPopup, closePopup, markAsSeen } = useNews();

  useEffect(() => {
    loadUserData();
    loadTrophyData();
  }, []);

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

  const handleTouchStart = (e) => {
    if (scrollContainerRef.current.scrollTop === 0 && !isRefreshing) {
      touchStartRef.current = e.touches ? e.touches[0].clientY : e.clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartRef.current === 0 || isRefreshing) return;
    
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    const pull = currentY - touchStartRef.current;
    
    if (pull > 0 && scrollContainerRef.current.scrollTop === 0) {
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
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-200 pointer-events-none z-50"
          style={{
            top: `${pullDistance - 35}px`,
            opacity: pullDistance > 15 ? 1 : 0,
          }}
        >
          <div className="nacre-bombe flex items-center justify-center w-10 h-10" style={{ borderRadius: '50%', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(5px)' }}>
            <RefreshCw className={`w-5 h-5 text-pink-400 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDistance * 5}deg)` }} />
          </div>
        </div>

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
                
                {isNameCelebratedToday(displayName || userName) && (
                  <div className="mt-3 bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 rounded-2xl px-4 py-3 border-2 border-amber-300 shadow-lg animate-bounce-slow">
                    <div className="flex items-center justify-center gap-2">
                      <PartyPopper className="w-5 h-5 text-amber-600" />
                      <span className="text-lg font-bold text-amber-700" style={{ fontFamily: "'Caveat', cursive" }}>
                        🎉 {t('home.happyNameDay')} {displayName || userName} ! 🎉
                      </span>
                    </div>
                  </div>
                )}

                {/* 🎯 CARTES REHAUSSÉES À MIN-H-[96PX] ET AVEC PADDING HARMONIEUX */}
                <div className="w-full max-w-sm mx-auto mt-2 px-2">
                  <div className="grid grid-cols-2 gap-3">
                    
                    <button 
                      onClick={() => navigate('/cycle-tracking')}
                      className="bulle-savon-test flex flex-col justify-between items-center text-center min-h-[96px] w-full p-3 box-border transition-transform active:scale-95 cursor-pointer focus:outline-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 140, 159, 0.22), rgba(255, 255, 255, 0.45))',
                        border: '1px solid rgba(255, 140, 159, 0.35)',
                        borderRadius: '20px'
                      }}
                    >
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {t('home.youAreAt', 'Vous êtes à la')}
                      </span>
                      <span className="text-lg font-bold text-pink-500 my-0.5">
                        Semaine {pregnancyProfile?.current_week || '9'}
                      </span>
                      <span className="text-[10px] text-sky-500 font-medium bg-white/40 px-2 py-0.5 rounded-full shadow-sm">
                        Trimestre 1 • SA
                      </span>
                    </button>

                    <button 
                      onClick={() => navigate('/cycle-tracking?tab=calendar')}
                      className="bulle-savon-test flex flex-col justify-between items-center text-center min-h-[96px] w-full p-3 box-border transition-transform active:scale-95 cursor-pointer focus:outline-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(255, 255, 255, 0.45))',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        borderRadius: '20px'
                      }}
                    >
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {t('home.nameDay', 'Fête du jour')}
                      </span>
                      <span className="text-lg font-bold text-amber-600 my-0.5">
                        🎉 Pascal
                      </span>
                      <span className="text-[10px] text-amber-600 font-medium bg-white/40 px-2 py-0.5 rounded-full shadow-sm">
                        17 mai
                      </span>
                    </button>

                  </div>
                </div>
              </div>
            </div>

            {/* Injection des sélecteurs CSS pour nettoyer le doublon "Yves" de CustomizableHome */}
            <div className="pt-4 [&_#celebrate-section]:hidden [&_div[class*='celebrate']]:hidden">
              <CustomizableHome 
                pregnancyProfile={pregnancyProfile}
                hasPregnancyProfile={hasPregnancyProfile}
                userName={displayName || userName}
                userAvatar={userAvatar}
                userAvatarConfig={userAvatarConfig}
                onPageTypeChange={setCurrentPageType}
                onAvatarClick={handleAvatarClick}
                disabledScroll={pullDistance > 0}
              />
            </div>

          </div>
        </div>
        
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
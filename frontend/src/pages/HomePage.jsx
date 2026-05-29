import { useState, useEffect, useRef } from 'react';
import { PartyPopper, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; //[cite: 73]
import AppTitle from '../components/AppTitle'; //[cite: 73]
import { AvatarPreview } from '../components/profile/AvatarBuilder'; //[cite: 73]
import PremiumSunAvatar from '../components/profile/PremiumSunAvatar'; //[cite: 73]
import { isNameCelebratedToday, getSaintOfTheDay } from '../data/saintsCalendar'; //[cite: 73]
import LanguageBubble from '../components/LanguageBubble'; //[cite: 73]
import CustomizableHome from '../components/home/CustomizableHome'; //[cite: 73]
import {
  TopBar,
  TutorialPopup,
  InfoButton,
  useTutorial,
  InteractiveTutorial
} from '../components/home'; //[cite: 73]
import { NewsBubble, NewsPopup, useNews } from '../components/home/NewsBubble'; //[cite: 73]

const ADMIN_EMAIL = 'cyrilalepsa@gmail.com'; //[cite: 73]

// 🌐 CONFIGURATION OPTIMISATION CLOUDINARY (Réduction drastique de la consommation data/batterie)[cite: 72]
// Remplace 'ton-cloud-id' par ton identifiant Cloudinary réel.
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/ton-cloud-id/image/upload/f_auto,q_auto,w_300";
// f_auto: convertit automatiquement en WebP/AVIF ultra-léger selon le mobile de la maman[cite: 72]
// q_auto: compresse intelligemment l'image sans perte visuelle discernable[cite: 72]

function HomePage() {
  const { t } = useTranslation(); //[cite: 73]
  const navigate = useNavigate(); //[cite: 73]
  const [userName, setUserName] = useState(''); //[cite: 73]
  const [displayName, setDisplayName] = useState(''); //[cite: 73]
  const [userAvatar, setUserAvatar] = useState(''); //[cite: 73]
  const [userAvatarConfig, setUserAvatarConfig] = useState(null); //[cite: 73]
  const [userEmail, setUserEmail] = useState(''); //[cite: 73]
  const [pregnancyProfile, setPregnancyProfile] = useState(null); //[cite: 73]
  const [userRole, setUserRole] = useState('user'); //[cite: 73]
  const [isPremium, setIsPremium] = useState(false); //[cite: 73]
  const [currentPageType, setCurrentPageType] = useState('default'); //[cite: 73]
  const [hasRapportInFertileWindow, setHasRapportInFertileWindow] = useState(false); //[cite: 73]
  const [isLoaded, setIsLoaded] = useState(false); //[cite: 73]
  const [earnedTrophy, setEarnedTrophy] = useState(null); //[cite: 73]
  
  const [isRefreshing, setIsRefreshing] = useState(false); //[cite: 73]
  const [pullDistance, setPullDistance] = useState(0); //[cite: 73]
  const scrollContainerRef = useRef(null); //[cite: 73]
  const touchStartRef = useRef(0); //[cite: 73]
  
  const [nameOfTheDay, setNameOfTheDay] = useState(''); //[cite: 73]
  
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
  } = useTutorial(); //[cite: 73]
  
  const { hasNews, updates, isPopupOpen, openPopup, closePopup, markAsSeen } = useNews(); //[cite: 73]

  useEffect(() => {
    loadUserData();
    loadTrophyData();
    
    // 🎯 Correction : Chargement automatique du saint du jour pour éviter l'état vide[cite: 73]
    const todaySaint = getSaintOfTheDay(new Date());
    if (todaySaint) {
      setNameOfTheDay(todaySaint);
    }
  }, []);

  const checkRapportInFertileWindow = (profile) => {
    if (!profile || !profile.last_period_date) return false; //[cite: 73]
    
    const savedRapports = localStorage.getItem('mamandouce_rapports'); //[cite: 73]
    if (!savedRapports) return false; //[cite: 73]
    
    const rapportDates = JSON.parse(savedRapports); //[cite: 73]
    if (rapportDates.length === 0) return false; //[cite: 73]
    
    const lastPeriod = new Date(profile.last_period_date); //[cite: 73]
    const cycleLength = profile.cycle_length || 28; //[cite: 73]
    const lutealPhase = 14; //[cite: 73]
    const ovulationDay = cycleLength - lutealPhase; //[cite: 73]
    
    const ovulationDate = new Date(lastPeriod); //[cite: 73]
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDay); //[cite: 73]
    
    const fertileStart = new Date(ovulationDate); //[cite: 73]
    fertileStart.setDate(fertileStart.getDate() - 5); //[cite: 73]
    const fertileEnd = new Date(ovulationDate); //[cite: 73]
    fertileEnd.setDate(fertileEnd.getDate() + 1); //[cite: 73]
    
    const today = new Date(); //[cite: 73]
    while (fertileEnd < today) {
      const daysToAdd = cycleLength; //[cite: 73]
      fertileStart.setDate(fertileStart.getDate() + daysToAdd); //[cite: 73]
      fertileEnd.setDate(fertileEnd.getDate() + daysToAdd); //[cite: 73]
    }
    
    for (const rapportDateStr of rapportDates) {
      const rapportDate = new Date(rapportDateStr); //[cite: 73]
      if (rapportDate >= fertileStart && rapportDate <= fertileEnd) {
        return true; //[cite: 73]
      }
      const prevFertileStart = new Date(fertileStart); //[cite: 73]
      prevFertileStart.setDate(prevFertileStart.getDate() - cycleLength); //[cite: 73]
      const prevFertileEnd = new Date(fertileEnd); //[cite: 73]
      prevFertileEnd.setDate(prevFertileEnd.getDate() - cycleLength); //[cite: 73]
      
      if (rapportDate >= prevFertileStart && rapportDate <= prevFertileEnd) {
        return true; //[cite: 73]
      }
    }
    return false; //[cite: 73]
  };

  const loadUserData = async () => {
    try {
      const userRes = await api.auth.getMe(); //[cite: 73]
      setUserName(userRes.data.name); //[cite: 73]
      setDisplayName(userRes.data.display_name || ''); //[cite: 73]
      setUserAvatar(userRes.data.avatar || ''); //[cite: 73]
      setUserAvatarConfig(userRes.data.avatar_config || null); //[cite: 73]
      setUserEmail(userRes.data.email); //[cite: 73]
      setUserRole(userRes.data.role || 'user'); //[cite: 73]
      setIsPremium(userRes.data.subscription_status === 'premium' || userRes.data.subscription_status === 'trial'); //[cite: 73]
      
      const profileRes = await api.pregnancy.getProfile(); //[cite: 73]
      setPregnancyProfile(profileRes.data); //[cite: 73]
      
      const hasRapport = checkRapportInFertileWindow(profileRes.data); //[cite: 73]
      setHasRapportInFertileWindow(hasRapport); //[cite: 73]
    } catch (error) {
      console.error('Erreur chargement données:', error); //[cite: 73]
    } finally {
      setTimeout(() => setIsLoaded(true), 100); //[cite: 73]
    }
  };

  const loadTrophyData = async () => {
    try {
      const res = await api.get('/api/trophies/progress'); //[cite: 73]
      const progress = res.data; //[cite: 73]
      if (progress?.gold?.earned) setEarnedTrophy('gold'); //[cite: 73]
      else if (progress?.silver?.earned) setEarnedTrophy('silver'); //[cite: 73]
      else if (progress?.bronze?.earned) setEarnedTrophy('bronze'); //[cite: 73]
    } catch (e) {}
  };

  const handleTouchStart = (e) => {
    if (scrollContainerRef.current.scrollTop === 0 && !isRefreshing) {
      touchStartRef.current = e.touches ? e.touches[0].clientY : e.clientY; //[cite: 73]
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartRef.current === 0 || isRefreshing) return; //[cite: 73]
    
    const currentY = e.touches ? e.touches[0].clientY : e.clientY; //[cite: 73]
    const pull = currentY - touchStartRef.current; //[cite: 73]
    
    if (pull > 0 && scrollContainerRef.current.scrollTop === 0) {
      const resistance = Math.min(70, pull * 0.4); //[cite: 73]
      setPullDistance(resistance); //[cite: 73]
      if (e.cancelable) e.preventDefault(); //[cite: 73]
    }
  };

  const handleTouchEnd = async () => {
    touchStartRef.current = 0; //[cite: 73]
    if (pullDistance >= 50) {
      setIsRefreshing(true); //[cite: 73]
      setPullDistance(50); //[cite: 73]
      
      await Promise.all([loadUserData(), loadTrophyData()]); //[cite: 73]
      
      setIsRefreshing(false); //[cite: 73]
      setPullDistance(0); //[cite: 73]
    } else {
      setPullDistance(0); //[cite: 73]
    }
  };

  const handleAvatarClick = () => {
    navigate('/profile?tab=avatar'); //[cite: 73]
  };

  const isAdmin = userRole === 'admin' || userEmail === ADMIN_EMAIL; //[cite: 73]
  const hasPregnancyProfile = pregnancyProfile && pregnancyProfile.current_week && hasRapportInFertileWindow; //[cite: 73]

  // Définition de la photo de fœtus dynamique (ex: semaine 9) via Cloudinary pour économiser l'espace[cite: 72]
  const fetusWeekToken = pregnancyProfile?.current_week || '9';
  const optimizedFetusThumbUrl = `${CLOUDINARY_BASE_URL}/mamandouce/fetus_week_${fetusWeekToken}.jpg`;

  return (
    <div 
      className="gradient-bg relative" 
      style={{ height: '100dvh', overflow: 'hidden', overscrollBehaviorY: 'contain' }} //[cite: 73]
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
            <RefreshCw className={`w-5 h-5 text-pink-400 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDistance * 5}deg)` }} /> {/*[cite: 73] */}
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="relative z-10 w-full h-full overflow-y-auto"
          style={{ 
            transition: pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.1, 0.8, 0.2, 1)' : 'none', //[cite: 73]
            transform: `translateY(${pullDistance}px)`, //[cite: 73]
            height: '100dvh' //[cite: 73]
          }}
        >
          <div 
            className={`max-w-4xl mx-auto p-6 space-y-6 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} //[cite: 73]
            style={{ contain: 'layout style' }} //[cite: 73]
          >
            
            <TopBar 
              isAdmin={isAdmin}
              userAvatar={userAvatar}
              userAvatarConfig={userAvatarConfig}
            />

            <div 
              className="min-h-[180px]"
              style={{ 
                display: currentPageType === 'default' ? 'block' : 'none', //[cite: 73]
                contain: 'layout style' //[cite: 73]
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
                  title={t('profile.editAvatar', 'Modifier mon avatar')} //[cite: 73]
                  testId="home-avatar"
                  earnedTrophy={earnedTrophy}
                />
                <h2 className="text-2xl sm:text-3xl text-center" data-testid="user-welcome">
                  <span className="text-slate-500 font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>{t('home.welcome')}, </span> {/*[cite: 73] */}
                  <span 
                    className="text-4xl sm:text-5xl font-semibold user-name-display" 
                    style={{ fontFamily: "'Caveat', cursive", color: '#FF8C9F', WebkitTextFillColor: '#FF8C9F' }} //[cite: 73]
                    data-testid="user-name"
                  >
                    {displayName || userName || ' '} {/*[cite: 73] */}
                  </span>
                  <span className="text-pink-400 ml-2">❤️</span>
                </h2>
                
                {isNameCelebratedToday(displayName || userName) && (
                  <div className="mt-3 bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 rounded-2xl px-4 py-3 border-2 border-amber-300 shadow-lg animate-bounce-slow">
                    <div className="flex items-center justify-center gap-2">
                      <PartyPopper className="w-5 h-5 text-amber-600" />
                      <span className="text-lg font-bold text-amber-700" style={{ fontFamily: "'Caveat', cursive" }}>
                        🎉 {t('home.happyNameDay')} {displayName || userName} ! 🎉 {/*[cite: 73] */}
                      </span>
                    </div>
                  </div>
                )}

                {/* 🎯 CARTES REHAUSSÉES - EFFET BULLE DE SAVON APPLIQUÉ SUR LES RECTANGLES EXISTANTS */}
                <div className="w-full max-w-sm mx-auto mt-2 px-2">
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* BOUTON NOMBRE DE SEMAINE */}
                    <button 
                      onClick={() => navigate('/cycle-tracking')} //[cite: 73]
                      className="flex flex-col justify-between items-center text-center min-h-[96px] w-full p-3 box-border transition-all active:scale-95 cursor-pointer focus:outline-none relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 100%)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 140, 159, 0.45)', // Liseré Rose Corail signature[cite: 60]
                        borderRadius: '20px',
                        boxShadow: 'inset 0 12px 24px -4px rgba(255, 255, 255, 0.65), inset 6px 0 14px -2px rgba(255, 140, 159, 0.25), inset -6px -6px 14px -2px rgba(196, 181, 253, 0.25), 0 8px 24px -8px rgba(74, 74, 74, 0.06)'
                      }}
                    >
                      {/* Reflet glossy supérieur simulé en surcouche */}
                      <div className="absolute top-[3px] left-[6%] right-[6%] pointer-events-none rounded-[inherit]" style={{ height: '26%', background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)' }} />
                      
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold relative z-10">
                        {t('home.youAreAt', 'Vous êtes à la')} {/*[cite: 73] */}
                      </span>
                      <span className="text-lg font-bold text-pink-500 my-0.5 relative z-10">
                        Semaine {pregnancyProfile?.current_week || '9'} {/*[cite: 73] */}
                      </span>
                      <span className="text-[10px] text-sky-500 font-medium bg-white/50 px-2 py-0.5 rounded-full shadow-sm relative z-10">
                        Trimestre 1 • SA {/*[cite: 73] */}
                      </span>
                    </button>

                    {/* BOUTON JOUR DE FÊTE */}
                    <button 
                      onClick={() => navigate('/cycle-tracking?calendar=true')} //[cite: 73]
                      className="flex flex-col justify-between items-center text-center min-h-[96px] w-full p-3 box-border transition-all active:scale-95 cursor-pointer focus:outline-none relative overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 100%)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(234, 179, 8, 0.4)', // Liseré Ambre/Or pour la fête
                        borderRadius: '20px',
                        boxShadow: 'inset 0 12px 24px -4px rgba(255, 255, 255, 0.65), inset 6px 0 14px -2px rgba(234, 179, 8, 0.2), inset -6px -6px 14px -2px rgba(196, 181, 253, 0.25), 0 8px 24px -8px rgba(74, 74, 74, 0.06)'
                      }}
                    >
                      {/* Reflet glossy supérieur simulé en surcouche */}
                      <div className="absolute top-[3px] left-[6%] right-[6%] pointer-events-none rounded-[inherit]" style={{ height: '26%', background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%)' }} />

                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold relative z-10">
                        {t('home.nameDay', 'Fête du jour')} {/*[cite: 73] */}
                      </span>
                      <span className="text-lg font-bold text-slate-800 my-0.5 capitalize relative z-10">
                        🎉 {nameOfTheDay || 'À fêter'} {/*[cite: 73] */}
                      </span>
                      <span className="text-[10px] text-slate-800 font-medium bg-white/60 px-2 py-0.5 rounded-full shadow-sm relative z-10">
                        {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} {/*[cite: 73] */}
                      </span>
                    </button>

                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 [&_#celebrate-section]:hidden [&_div[class*='celebrate']]:hidden">
              <CustomizableHome 
                pregnancyProfile={pregnancyProfile}
                hasPregnancyProfile={hasPregnancyProfile}
                userName={displayName || userName} //[cite: 73]
                userAvatar={userAvatar}
                userAvatarConfig={userAvatarConfig}
                onPageTypeChange={setCurrentPageType}
                onAvatarClick={handleAvatarClick}
                disabledScroll={pullDistance > 0} //[cite: 73]
              />
            </div>

          </div>
        </div>
        
        <InteractiveTutorial 
          isVisible={showInteractiveTutorial} 
          onComplete={isFirstTimeTutorial ? completeInteractiveTutorial : closeInteractiveTutorial} //[cite: 73]
          isFirstTime={isFirstTimeTutorial}
        />
        
        <TutorialPopup 
          isVisible={showTutorial} 
          onClose={dismissTutorial} //[cite: 73]
          isPremium={isPremium}
          onReplayTutorial={replayInteractiveTutorial}
        />
        
        {tutorialDismissed && (
          <NewsBubble hasNews={hasNews} onClick={openPopup} />
        )}
        
        <NewsPopup 
          isVisible={isPopupOpen}
          updates={updates}
          onClose={closePopup} //[cite: 73]
          onMarkAsSeen={markAsSeen} //[cite: 73]
        />
        
        {tutorialDismissed && (
          <InfoButton onClick={openTutorial} /> //[cite: 73]
        )}
      </div>
  );
}

export default HomePage;
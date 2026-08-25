import { useState, useEffect, useRef, useCallback } from 'react';
import { PartyPopper, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { isSuperAdmin } from '../utils/superadmin';
import { useAuth } from '../contexts/AuthContext';
import AppTitle from '../components/AppTitle';
import PremiumSunAvatar from '../components/profile/PremiumSunAvatar';
import { isNameCelebratedToday, getSaintOfTheDay } from '../data/saintsCalendar';
import CustomizableHome from '../components/home/CustomizableHome';
import { PREGNANT_EVENT, PregnancyToggle } from '../components/cycle/PregnancyToggle';
import { isPregnancyActive } from '../utils/pregnancyStatus';
import {
  TopBar,
  TutorialPopup,
  InfoButton,
  useTutorial,
  InteractiveTutorial
} from '../components/home';

import { NewsBubble, NewsPopup, useNews } from '../components/home/NewsBubble';

function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    isAdmin: authIsAdmin,
    isPremium: authIsPremium,
    user: authUser,
    refreshMe,
  } = useAuth();
  const userName = authUser?.name || authUser?.first_name || '';
  const displayName = authUser?.display_name || '';
  const userAvatar = authUser?.avatar || '';
  const userAvatarConfig = authUser?.avatar_config || null;
  const userEmail = authUser?.email || '';
  const userRole = authUser?.role || 'user';
  const localIsPremium = Boolean(
    authUser?.subscription_status === 'premium'
    || authUser?.subscription_status === 'trial'
    || authUser?.is_admin
    || authUser?.is_superadmin
    || authUser?.is_premium
  );
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [currentPageType, setCurrentPageType] = useState('default');
  const [earnedTrophy, setEarnedTrophy] = useState(null);
  const [isPregnantHome, setIsPregnantHome] = useState(
    () => isPregnancyActive({
      user: authUser,
      storedPregnant: localStorage.getItem('mamandouce_pregnant'),
    })
  );
  const [dueDateHome, setDueDateHome] = useState(
    () => localStorage.getItem('mamandouce_due_date') || ''
  );
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const scrollContainerRef = useRef(null);
  const touchStartRef = useRef(0);
  
  const [nameOfTheDay, setNameOfTheDay] = useState('');
  
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

  // Resync cartes grossesse à chaque retour sur l'accueil
  useEffect(() => {
    const syncPregnant = () => {
      setIsPregnantHome(isPregnancyActive({
        profile: pregnancyProfile,
        user: authUser,
        storedPregnant: localStorage.getItem('mamandouce_pregnant'),
      }));
      setDueDateHome(
        pregnancyProfile?.estimated_due_date
        || localStorage.getItem('mamandouce_due_date')
        || '',
      );
    };
    syncPregnant();
    window.addEventListener('focus', syncPregnant);
    window.addEventListener('storage', syncPregnant);
    window.addEventListener(PREGNANT_EVENT, syncPregnant);
    return () => {
      window.removeEventListener('focus', syncPregnant);
      window.removeEventListener('storage', syncPregnant);
      window.removeEventListener(PREGNANT_EVENT, syncPregnant);
    };
  }, [authUser, pregnancyProfile]);

  const loadUserData = useCallback(async ({ cancelled = () => false } = {}) => {
    try {
      // AuthProvider is the single source of truth for name/avatar. Home only
      // owns the pregnancy profile, avoiding another /auth/me request.
      const profileRes = await api.pregnancy.getProfile();
      if (!cancelled()) setPregnancyProfile(profileRes.data || null);
    } catch (profileError) {
      // A missing optional profile must not clear the already-rendered user.
      if (profileError?.response?.status !== 404) {
        console.error('Erreur chargement profil grossesse:', profileError);
      }
    }
  }, []);

  const loadTrophyData = useCallback(async ({ cancelled = () => false } = {}) => {
    try {
      // Use the implemented badge endpoint, not the removed legacy progress route.
      const res = await api.contributions.getBadgeProgress();
      if (cancelled()) return;
      const progress = res.data;
      const names = Array.isArray(progress?.badge_names) ? progress.badge_names : [];
      if (progress?.gold?.earned || progress?.progress?.has_gold || names.includes('Marraine Or')) {
        setEarnedTrophy('gold');
      } else if (progress?.silver?.earned || progress?.progress?.has_silver) {
        setEarnedTrophy('silver');
      } else if (progress?.bronze?.earned || progress?.progress?.has_bronze) {
        setEarnedTrophy('bronze');
      }
    } catch (error) {
      // Optional home decoration: a missing endpoint is an empty result,
      // never a state reset or retry trigger.
      if (error?.response?.status !== 404) {
        console.error('Erreur chargement progression badges:', error);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    loadUserData({ cancelled: isCancelled });
    loadTrophyData({ cancelled: isCancelled });

    // 🎯 Extraction sécurisée pour éviter l'erreur React #31
    if (typeof getSaintOfTheDay === 'function') {
      try {
        const todaySaint = getSaintOfTheDay(new Date());
        if (todaySaint) {
          const saintName = typeof todaySaint === 'object' ? todaySaint.name : todaySaint;
          setNameOfTheDay(saintName || '');
        }
      } catch (e) {
        console.error("Erreur calendrier des saints:", e);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [loadUserData, loadTrophyData]);

  const handleAvatarClick = () => {
    navigate('/profile?tab=avatar');
  };

  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const loadUserDataRef = useRef(loadUserData);
  const loadTrophyDataRef = useRef(loadTrophyData);
  const refreshMeRef = useRef(refreshMe);
  loadUserDataRef.current = loadUserData;
  loadTrophyDataRef.current = loadTrophyData;
  refreshMeRef.current = refreshMe;

  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;

    const onStart = (e) => {
      if (isRefreshingRef.current) return;
      if (scroller.scrollTop > 0) {
        touchStartRef.current = 0;
        return;
      }
      const point = e.touches ? e.touches[0] : e;
      touchStartRef.current = point.clientY;
    };

    const onMove = (e) => {
      if (!touchStartRef.current || isRefreshingRef.current) return;
      if (scroller.scrollTop > 0) return;
      const point = e.touches ? e.touches[0] : e;
      const pull = point.clientY - touchStartRef.current;
      if (pull > 8) {
        if (e.cancelable) e.preventDefault();
        const next = Math.min(70, pull * 0.4);
        pullDistanceRef.current = next;
        setPullDistance(next);
      }
    };

    const onEnd = async () => {
      const dist = pullDistanceRef.current;
      touchStartRef.current = 0;
      if (dist >= 50 && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setPullDistance(50);
        try {
          await Promise.allSettled([
            refreshMeRef.current(),
            loadUserDataRef.current(),
            loadTrophyDataRef.current(),
          ]);
        } finally {
          isRefreshingRef.current = false;
          setIsRefreshing(false);
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    scroller.addEventListener('touchstart', onStart, { passive: true });
    scroller.addEventListener('touchmove', onMove, { passive: false });
    scroller.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      scroller.removeEventListener('touchstart', onStart);
      scroller.removeEventListener('touchmove', onMove);
      scroller.removeEventListener('touchend', onEnd);
    };
  }, []);

  const isAdmin = authIsAdmin || isSuperAdmin(userEmail || authUser?.email, userRole || authUser?.role);
  const isPremium = Boolean(
    authIsPremium
    || localIsPremium
    || authUser?.is_premium
    || authUser?.subscription_status === 'premium'
    || isSuperAdmin(userEmail || authUser?.email, userRole || authUser?.role)
  );
  const hasPregnancyProfile = Boolean(
    isPregnantHome
  );

  return (
    <div 
      className="gradient-bg relative" 
      style={{ height: '100dvh', overflow: 'hidden', overscrollBehaviorY: 'auto' }}
      data-testid="home-scroll-root"
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
            className="max-w-4xl mx-auto p-6 space-y-6"
            style={{ contain: 'layout style' }}
            data-testid="home-content"
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

                <div className="w-full max-w-sm mx-auto mt-2 px-2">
                  <PregnancyToggle
                    mode="home"
                    isPregnant={isPregnantHome}
                    dueDate={dueDateHome}
                    lastPeriodDate={pregnancyProfile?.last_period_date}
                    cycleLength={pregnancyProfile?.cycle_length || pregnancyProfile?.cycle_duration || 28}
                    currentWeek={pregnancyProfile?.current_week}
                    trimester={pregnancyProfile?.trimester}
                    city={authUser?.city}
                    onPregnant={(dpaStr) => {
                      setIsPregnantHome(true);
                      setDueDateHome(dpaStr);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
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
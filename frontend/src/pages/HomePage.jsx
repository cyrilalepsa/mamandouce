import { useState, useEffect, useRef } from 'react';
import { PartyPopper, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppTitle from '../components/AppTitle';
import PremiumSunAvatar from '../components/profile/PremiumSunAvatar';
import { isNameCelebratedToday, getSaintOfTheDay } from '../data/saintsCalendar'; 
import LanguageBubble from '../components/LanguageBubble';
import CustomizableHome from '../components/home/CustomizableHome';
import {
  TopBar, TutorialPopup, InfoButton, useTutorial, InteractiveTutorial
} from '../components/home';
import { NewsBubble, NewsPopup, useNews } from '../components/home/NewsBubble';

const ADMIN_EMAIL = 'cyrilalepsa@gmail.com';

function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // États
  const [user, setUser] = useState({ name: '', displayName: '', avatar: '', avatarConfig: null, email: '', role: 'user', isPremium: false });
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [nameOfTheDay, setNameOfTheDay] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [earnedTrophy, setEarnedTrophy] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const scrollContainerRef = useRef(null);
  const touchStartRef = useRef(0);
  
  const { showTutorial, showInteractiveTutorial, tutorialDismissed, isFirstTimeTutorial, dismissTutorial, openTutorial, completeInteractiveTutorial, replayInteractiveTutorial, closeInteractiveTutorial } = useTutorial();
  const { hasNews, updates, isPopupOpen, openPopup, closePopup, markAsSeen } = useNews();

  useEffect(() => {
    loadData();
    const saintData = getSaintOfTheDay();
    if (saintData) setNameOfTheDay(saintData.name);
  }, []);

  const loadData = async () => {
    try {
      const [userRes, profileRes] = await Promise.all([api.auth.getMe(), api.pregnancy.getProfile()]);
      setUser({
        name: userRes.data.name,
        displayName: userRes.data.display_name,
        avatar: userRes.data.avatar,
        avatarConfig: userRes.data.avatar_config,
        email: userRes.data.email,
        role: userRes.data.role,
        isPremium: ['premium', 'trial'].includes(userRes.data.subscription_status)
      });
      setPregnancyProfile(profileRes.data);
      
      // Trophy loading
      const trophyRes = await api.get('/api/trophies/progress').catch(() => ({ data: {} }));
      const p = trophyRes.data;
      setEarnedTrophy(p?.gold?.earned ? 'gold' : p?.silver?.earned ? 'silver' : p?.bronze?.earned ? 'bronze' : null);
    } catch (e) { console.error(e); }
    finally { setIsLoaded(true); }
  };

  // Logique Touch (Pull to refresh)
  const handleTouch = (e) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      if (e.type === 'touchstart') touchStartRef.current = e.touches[0].clientY;
      else if (e.type === 'touchmove' && touchStartRef.current) {
        const pull = e.touches[0].clientY - touchStartRef.current;
        if (pull > 0) setPullDistance(Math.min(70, pull * 0.4));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= 50) {
      setIsRefreshing(true);
      await loadData();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    touchStartRef.current = 0;
  };

  const isAdmin = user.role === 'admin' || user.email === ADMIN_EMAIL;

  return (
    <div className="gradient-bg relative h-[100dvh] overflow-hidden" 
         onTouchStart={handleTouch} onTouchMove={handleTouch} onTouchEnd={handleTouchEnd}>
      
      {/* Header compact avec LanguageBubble fixe */}
      <div className="flex justify-between items-center p-4 z-20">
        <TopBar isAdmin={isAdmin} userAvatar={user.avatar} userAvatarConfig={user.avatarConfig} />
        <div className="scale-90"><LanguageBubble /></div>
      </div>

      <div ref={scrollContainerRef} className="relative z-10 w-full h-full overflow-y-auto pb-20" 
           style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? 'transform 0.3s' : 'none' }}>
        
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="text-center"><AppTitle size="xl" /></div>

          <div className="flex flex-col items-center">
            <PremiumSunAvatar isPremium={user.isPremium} userAvatar={user.avatar} userAvatarConfig={user.avatarConfig} size={64} earnedTrophy={earnedTrophy} />
            <h2 className="text-2xl mt-2 font-semibold text-pink-400">{user.displayName || user.name}</h2>
          </div>

          {/* Bulles Glassmorphism */}
          <div className="grid grid-cols-2 gap-3">
             {pregnancyProfile?.current_week && (
               <div className="bg-white/20 backdrop-blur-md border border-white/30 p-3 rounded-2xl text-center shadow-sm">
                 <span className="text-[10px] uppercase text-slate-500 font-bold block">SA</span>
                 <span className="text-lg font-bold text-pink-500">Semaine {pregnancyProfile.current_week}</span>
               </div>
             )}
             <div className="bg-white/20 backdrop-blur-md border border-white/30 p-3 rounded-2xl text-center shadow-sm heart-burst">
               <span className="text-[10px] uppercase text-slate-500 font-bold block">Fête du jour</span>
               <span className="text-sm font-bold text-slate-800">🎉 {nameOfTheDay}</span>
             </div>
          </div>

          <div className="pt-2">
            <CustomizableHome pregnancyProfile={pregnancyProfile} hasPregnancyProfile={!!pregnancyProfile?.current_week} />
          </div>
        </div>
      </div>

      {/* Popups */}
      <InteractiveTutorial isVisible={showInteractiveTutorial} onComplete={completeInteractiveTutorial} />
      <TutorialPopup isVisible={showTutorial} onClose={dismissTutorial} />
      {tutorialDismissed && <NewsBubble hasNews={hasNews} onClick={openPopup} />}
      <NewsPopup isVisible={isPopupOpen} updates={updates} onClose={closePopup} />
      {tutorialDismissed && <InfoButton onClick={openTutorial} />}
    </div>
  );
}

export default HomePage;
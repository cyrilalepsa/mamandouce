import { useState, useEffect } from 'react';
import { Cloud, Feather, PartyPopper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import AppTitle from '../components/AppTitle';
import { AvatarPreview } from '../components/profile/AvatarBuilder';
import { useTheme } from '../contexts/ThemeContext';
import { isNameCelebratedToday } from '../data/saintsCalendar';
import LanguageBubble from '../components/LanguageBubble';
import { HomeLayoutProvider } from '../contexts/HomeLayoutContext';
import {
  TopBar,
  CustomizableHome
} from '../components/home';

const ADMIN_EMAIL = 'cyrilalepsa@gmail.com';

function HomePage() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [userName, setUserName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userAvatarConfig, setUserAvatarConfig] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userRes = await api.auth.getMe();
      setUserName(userRes.data.name);
      setDisplayName(userRes.data.display_name || '');
      setUserAvatar(userRes.data.avatar || '');
      setUserAvatarConfig(userRes.data.avatar_config || null);
      setUserEmail(userRes.data.email);
      setUserRole(userRes.data.role || 'user');
      
      const profileRes = await api.pregnancy.getProfile();
      setPregnancyProfile(profileRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const isAdmin = userRole === 'admin' || userEmail === ADMIN_EMAIL;
  const hasPregnancyProfile = pregnancyProfile && pregnancyProfile.current_week;

  return (
    <HomeLayoutProvider>
      <div className="min-h-screen gradient-bg relative overflow-hidden">
        {/* Language Bubble - suit le scroll de la page */}
        <LanguageBubble />
        
        <Cloud className="absolute top-20 left-10 w-40 h-40 text-sky-200 opacity-10 animate-float" />
        <Feather className="absolute top-40 right-20 w-32 h-32 text-pink-200 opacity-20 animate-float-delayed" />
        <Cloud className="absolute bottom-40 right-40 w-48 h-48 text-sky-100 opacity-10 animate-float" />
        <Feather className="absolute bottom-20 left-40 w-24 h-24 text-pink-100 opacity-20 animate-float-delayed" />

        <div className="relative z-10">
          <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
            
            <TopBar isAdmin={isAdmin} />

            {/* Logo et bienvenue */}
            <div className="text-center py-4">
              <AppTitle size="xl" showSubtitle={false} />
            </div>

            {/* Salutation avec avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    data-testid="home-user-avatar"
                  />
                ) : userAvatarConfig ? (
                  <AvatarPreview config={userAvatarConfig} size={64} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center" data-testid="home-default-avatar">
                    <svg viewBox="0 0 24 24" className="w-10 h-10 text-white/90" fill="currentColor">
                      <circle cx="12" cy="6" r="4" />
                      <path d="M12 12c-4 0-6 2-6 4v1c0 .5.2 1 .6 1.3.5.4 1.2.7 2.4.7h6c1.2 0 1.9-.3 2.4-.7.4-.3.6-.8.6-1.3v-1c0-2-2-4-6-4z" />
                      <path d="M9 19c-.3 1.5-.5 2.5-.5 3h7c0-.5-.2-1.5-.5-3H9z" />
                    </svg>
                  </div>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl text-center" data-testid="user-welcome">
                <span className="text-slate-500 font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>{t('home.welcome')}, </span>
                <span className="text-slate-700 text-4xl sm:text-5xl font-semibold" style={{ fontFamily: "'Caveat', cursive" }}>
                  {displayName || userName}
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

            {/* Contenu personnalisable avec pages multiples */}
            <CustomizableHome 
              pregnancyProfile={pregnancyProfile}
              hasPregnancyProfile={hasPregnancyProfile}
            />

          </div>
        </div>
      </div>
    </HomeLayoutProvider>
  );
}

export default HomePage;

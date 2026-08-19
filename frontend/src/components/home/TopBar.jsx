import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Crown, User, Settings, LogOut, Shield, MoreVertical, Share2, Download, MessageSquare, PiggyBank } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { AvatarPreview } from '../profile/AvatarBuilder';
import { languages, changeLanguage, getCurrentLanguage } from '../../i18n';
import { Check, X } from 'lucide-react';

// Drapeau langue inline (glyphe nu, pas de bulle)
function LanguageInlineFlag() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const dropdownRef = useRef(null);
  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const checkLang = () => setCurrentLang(getCurrentLanguage());
    window.addEventListener('languageChanged', checkLang);
    return () => window.removeEventListener('languageChanged', checkLang);
  }, []);

  const handleChange = (langCode) => {
    changeLanguage(langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
    const lang = languages.find(l => l.code === langCode);
    toast.success(`${lang.flag} ${lang.name}`);
    window.dispatchEvent(new Event('languageChanged'));
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ width: 28, height: 28, flexShrink: 0, alignSelf: 'center' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }}
        className="flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
        data-testid="language-bubble-btn"
      >
        <span style={{ fontSize: 20, lineHeight: '28px', display: 'block' }}>{currentLanguage.flag}</span>
      </button>
      {isOpen && (
        <div className="absolute top-10 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" style={{ minWidth: '200px', zIndex: 9999 }}>
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-600">Langue</span>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 hover:bg-slate-200 rounded-full">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto py-1">
            {languages.map((lang) => (
              <button key={lang.code} onClick={(e) => { e.stopPropagation(); handleChange(lang.code); }}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 ${lang.code === currentLang ? 'bg-pink-50' : ''}`}
                data-testid={`lang-inline-${lang.code}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`font-medium ${lang.code === currentLang ? 'text-pink-600' : 'text-slate-700'}`}>{lang.name}</span>
                </div>
                {lang.code === currentLang && <Check className="w-5 h-5 text-pink-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopBar({ isAdmin: isAdminProp, userAvatar = null, userAvatarConfig = null }) {
  const navigate = useNavigate();
  const { isAdmin: isAdminAuth, logout } = useAuth();
  const isAdmin = Boolean(isAdminAuth || isAdminProp);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [adminUnreadMessages, setAdminUnreadMessages] = useState(0);
  const menuRef = useRef(null);
  const menuDropdownRef = useRef(null);

  // URL et message de partage
  const appUrl = "https://mamandouce.neriacorp.com";
  const shareMessage = `Découvre MamanDouce, l'app qui m'accompagne pendant ma grossesse ! 🤰✨ ${appUrl}`;

  // Charger les messages non lus
  useEffect(() => {
    const loadUnreadMessages = async () => {
      try {
        // Messages utilisateur
        const userResponse = await api.contact.getMyMessages();
        const userMessages = userResponse.data.messages || [];
        const unreadReplies = userMessages.filter(
          m => m.admin_reply && !m.user_read_reply
        ).length;
        setUnreadMessages(unreadReplies);

        // Messages admin (si admin)
        if (isAdmin) {
          const adminResponse = await api.admin.getMessages();
          const adminMessages = adminResponse.data.messages || adminResponse.data || [];
          const unreadAdmin = Array.isArray(adminMessages) 
            ? adminMessages.filter(m => !m.is_read).length 
            : (adminResponse.data.stats?.unread || 0);
          setAdminUnreadMessages(unreadAdmin);
        }
      } catch (error) {
        console.log('Error loading unread messages');
      }
    };

    loadUnreadMessages();
    // Recharger toutes les 30 secondes
    const interval = setInterval(loadUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const hasNotifications = unreadMessages > 0 || adminUnreadMessages > 0;

  // Fermer le menu quand on clique ailleurs (mais PAS sur le dropdown lui-même)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const insideTrigger = menuRef.current && menuRef.current.contains(event.target);
      const insideDropdown = menuDropdownRef.current && menuDropdownRef.current.contains(event.target);
      if (!insideTrigger && !insideDropdown) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Détecter si l'app peut être installée
  useEffect(() => {
    // Vérifier si déjà installée
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    setIsInstalled(standalone);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const handleShare = async () => {
    setMenuOpen(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MamanDouce - App Grossesse',
          text: shareMessage,
          url: appUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Fallback: copier le lien
          await navigator.clipboard.writeText(appUrl);
          toast.success('Lien copié !');
        }
      }
    } else {
      // Fallback: copier le lien
      try {
        await navigator.clipboard.writeText(appUrl);
        toast.success('Lien copié !');
      } catch {
        toast.error('Erreur lors de la copie');
      }
    }
  };

  const handleInstall = async () => {
    setMenuOpen(false);
    
    // Pour iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      toast.info(
        <div>
          <p className="font-bold">Pour installer sur iPhone/iPad :</p>
          <p>1. Appuyez sur <strong>⬆️ Partager</strong></p>
          <p>2. Puis <strong>"Sur l'écran d'accueil"</strong></p>
        </div>,
        { duration: 8000 }
      );
      return;
    }

    // Pour Android/Desktop avec deferredPrompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('Installation en cours...');
      }
      setDeferredPrompt(null);
    } else {
      // Réactiver la bannière si elle était cachée
      localStorage.removeItem('pwa-banner-dismissed');
      toast.info('Rechargez la page pour voir la bannière d\'installation');
    }
  };

  const menuItems = [
    ...(!isAdmin ? [{
      icon: Crown,
      label: 'Premium',
      onClick: () => { navigate('/pricing'); setMenuOpen(false); },
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-300'
    }] : []),
    // Option d'installation (seulement si pas déjà installée)
    ...(!isInstalled ? [{
      icon: Download,
      label: 'Installer',
      onClick: handleInstall,
      iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500'
    }] : []),
    {
      icon: Share2,
      label: 'Partager',
      onClick: handleShare,
      iconBg: 'bg-gradient-to-br from-pink-400 to-purple-500'
    },
    ...(isAdmin ? [{
      icon: Shield,
      label: 'Admin',
      onClick: () => { navigate('/admin'); setMenuOpen(false); },
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      badge: adminUnreadMessages > 0 ? adminUnreadMessages : null,
      testId: 'admin-dashboard-link',
    }] : []),
    {
      icon: User,
      label: 'Profil',
      onClick: () => { navigate('/profile'); setMenuOpen(false); },
      iconBg: 'bg-gradient-to-br from-sky-400 to-blue-500',
      badge: unreadMessages > 0 ? unreadMessages : null
    },
    {
      icon: Settings,
      label: 'Paramètres',
      onClick: () => { navigate('/settings'); setMenuOpen(false); },
      iconBg: 'bg-gradient-to-br from-slate-400 to-slate-500'
    },
    {
      icon: LogOut,
      label: 'Déconnexion',
      onClick: handleLogout,
      iconBg: 'bg-gradient-to-br from-rose-400 to-red-500',
      danger: true,
      testId: 'logout-menu-item',
    }
  ];

  return (
    <div className="flex justify-between items-center relative" style={{ zIndex: 50 }}>
      {/* À gauche : Couronne Premium + Tirelire */}
      <div className="flex items-center gap-2">
        {/* Bouton Premium - COURONNE OR GLOSSY 3D INTENSE */}
        {!isAdmin && (
        <Button
          onClick={() => navigate('/pricing')}
          data-testid="premium-button"
          className="premium-crown text-white rounded-full p-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          style={{
            background: 'linear-gradient(145deg, rgba(255, 248, 160, 1) 0%, rgba(253, 230, 80, 1) 30%, rgba(250, 204, 21, 1) 60%, rgba(234, 179, 8, 1) 100%)',
            boxShadow: '4px 4px 10px rgba(180, 150, 60, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.9), 0 0 25px rgba(250, 204, 21, 0.5), 0 0 50px rgba(250, 204, 21, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.95), inset 0 -2px 6px rgba(202, 138, 4, 0.3)',
          }}
          title="Premium"
        >
          <Crown className="w-5 h-5" style={{ color: '#78350f' }} />
        </Button>
        )}

        {/* Tirelire — fond jaune CLAIR, cochon rose, SANS contour */}
        <button
          onClick={() => navigate('/tirelire')}
          data-testid="tirelire-button"
          aria-label="Ma Tirelire"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #fffde7, #fef9c3, #fef08a)',
            boxShadow: '3px 3px 8px rgba(209,180,100,0.2), -2px -2px 6px rgba(255,255,255,0.9), inset 0 1px 3px rgba(255,255,255,0.8)',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Ma Tirelire"
        >
          <PiggyBank className="w-4 h-4" style={{ color: '#ec4899' }} />
        </button>
      </div>

      {/* À droite : Drapeau + 3 points — glyphes nus, FIXES */}
      <div className="flex items-center gap-3" ref={menuRef}>
        <LanguageInlineFlag />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          data-testid="account-menu-btn"
          className="flex items-center justify-center"
          style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '4px', width: '32px', height: '32px' }}
        >
          <MoreVertical className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Menu déroulant — positionné FIXE dans le viewport, ne déplace rien */}
      {menuOpen && (
        <div 
          className="fixed right-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in"
          ref={menuDropdownRef}
          style={{ 
            top: '52px',
            zIndex: 9999, 
            minWidth: '180px',
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: 'calc(100dvh - 70px)',
            overflowY: 'auto'
          }}
        >
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  data-testid={item.testId}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors ${
                    item.danger 
                      ? 'hover:bg-rose-50 text-rose-600' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-7 h-7 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    {/* Badge de notification */}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
    </div>
  );
}

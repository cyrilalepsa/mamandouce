import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Crown, User, Settings, LogOut, Shield, MoreVertical, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';

export function TopBar({ isAdmin }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const menuRef = useRef(null);

  // URL et message de partage
  const appUrl = "https://femme-enceinte-app.preview.emergentagent.com";
  const shareMessage = `Découvre MamanDouce, l'app qui m'accompagne pendant ma grossesse ! 🤰✨ ${appUrl}`;

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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
    localStorage.removeItem('token');
    navigate('/auth');
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
    // Option d'installation (seulement si pas déjà installée)
    ...(!isInstalled ? [{
      icon: Download,
      label: 'Installer l\'app',
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
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500'
    }] : []),
    {
      icon: User,
      label: 'Profil',
      onClick: () => { navigate('/profile'); setMenuOpen(false); },
      iconBg: 'bg-gradient-to-br from-sky-400 to-blue-500'
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
      danger: true
    }
  ];

  return (
    <div className="flex justify-between items-center">
      {/* Premium à gauche */}
      <Button
        onClick={() => navigate('/pricing')}
        data-testid="premium-button"
        className="bg-gradient-to-r from-amber-400 to-amber-300 text-white rounded-full p-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        title="Premium"
      >
        <Crown className="w-5 h-5" />
      </Button>

      {/* Menu déroulant discret à droite */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          data-testid="account-menu-btn"
          className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-full shadow-sm hover:shadow-md hover:bg-white transition-all flex items-center justify-center"
        >
          <MoreVertical className="w-5 h-5 text-slate-500" />
        </button>

        {/* Menu déroulant */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 min-w-[160px] animate-fade-in">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                    item.danger 
                      ? 'hover:bg-rose-50 text-rose-600' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

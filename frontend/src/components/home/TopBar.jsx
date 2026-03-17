import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Crown, User, Settings, LogOut, Shield, MoreVertical } from 'lucide-react';

export function TopBar({ isAdmin }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const menuItems = [
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

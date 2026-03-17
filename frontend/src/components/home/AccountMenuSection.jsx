import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react';

export function AccountMenuSection({ isAdmin }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const menuItems = [
    ...(isAdmin ? [{
      icon: Shield,
      label: 'Administration',
      onClick: () => navigate('/admin'),
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      testId: 'menu-admin'
    }] : []),
    {
      icon: User,
      label: 'Mon profil',
      onClick: () => navigate('/profile'),
      iconBg: 'bg-gradient-to-br from-sky-400 to-blue-500',
      testId: 'menu-profile'
    },
    {
      icon: Settings,
      label: 'Paramètres',
      onClick: () => navigate('/settings'),
      iconBg: 'bg-gradient-to-br from-slate-400 to-slate-500',
      testId: 'menu-settings'
    },
    {
      icon: LogOut,
      label: 'Déconnexion',
      onClick: handleLogout,
      iconBg: 'bg-gradient-to-br from-rose-400 to-red-500',
      testId: 'menu-logout',
      danger: true
    }
  ];

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="account-menu-toggle"
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-pink-600" />
          </div>
          <h3 className="font-bold text-slate-700">Mon compte</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-2 animate-fade-in">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.testId}
                onClick={item.onClick}
                data-testid={item.testId}
                className={`w-full p-3 flex items-center gap-3 rounded-xl transition-colors ${
                  item.danger 
                    ? 'hover:bg-rose-50' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`font-medium ${item.danger ? 'text-rose-600' : 'text-slate-700'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}

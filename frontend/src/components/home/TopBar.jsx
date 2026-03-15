import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { User, Settings, LogOut, Crown, Shield } from 'lucide-react';

export function TopBar({ isAdmin }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => navigate('/pricing')}
          data-testid="premium-button"
          className="bg-gradient-to-r from-amber-400 to-amber-300 text-white rounded-full p-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          title="Premium"
        >
          <Crown className="w-5 h-5" />
        </Button>
        {isAdmin && (
          <Button
            onClick={() => navigate('/admin')}
            data-testid="admin-button"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            title="Administration"
          >
            <Shield className="w-5 h-5" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => navigate('/profile')}
          data-testid="profile-button"
          className="bg-white text-slate-500 border border-slate-200 rounded-full p-2.5 hover:bg-slate-50"
          title="Profil"
        >
          <User className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => navigate('/settings')}
          data-testid="settings-button"
          className="bg-white text-slate-500 border border-slate-200 rounded-full p-2.5 hover:bg-slate-50"
          title="Paramètres"
        >
          <Settings className="w-5 h-5" />
        </Button>
        <Button
          onClick={handleLogout}
          data-testid="logout-button"
          className="bg-white text-slate-500 border border-slate-200 rounded-full p-2.5 hover:bg-slate-50"
          title="Déconnexion"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Users, HeartHandshake, Landmark, CalendarHeart, ScanBarcode, History, Bell, BookOpen, User, LogOut, Cloud, Feather, RotateCw, Settings, Heart, AlertTriangle, ShieldCheck, Lightbulb } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadUserData();
    loadAlerts();
  }, []);

  const loadUserData = async () => {
    try {
      const userRes = await api.auth.getMe();
      setUserName(userRes.data.name);
      
      const profileRes = await api.pregnancy.getProfile();
      setPregnancyProfile(profileRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await api.alerts.getPersonalized();
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'caution':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'safe':
        return <ShieldCheck className="w-5 h-5 text-green-500" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-sky-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'caution':
        return 'bg-yellow-50 border-yellow-200';
      case 'safe':
        return 'bg-green-50 border-green-200';
      case 'tip':
        return 'bg-sky-50 border-sky-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const handleServiceClick = (service) => {
    const urls = {
      caf: 'https://www.caf.fr',
      ameli: 'https://www.ameli.fr',
      mairie: 'https://www.service-public.fr/particuliers/vosdroits/F1175'
    };
    window.open(urls[service], '_blank');
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <Cloud className="absolute top-20 left-10 w-40 h-40 text-sky-200 opacity-10 animate-float" />
      <Feather className="absolute top-40 right-20 w-32 h-32 text-pink-200 opacity-20 animate-float-delayed" />
      <Cloud className="absolute bottom-40 right-40 w-48 h-48 text-sky-100 opacity-10 animate-float" />
      <Feather className="absolute bottom-20 left-40 w-24 h-24 text-pink-100 opacity-20 animate-float-delayed" />

      <div className="relative z-10">
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <img 
                src="/logo-mamandouce-header.png" 
                alt="MamanDouce" 
                className="h-16 object-contain"
                data-testid="app-logo"
              />
              <p className="text-lg text-slate-500 mt-2">Bonjour, {userName} ❤️</p>
            </div>
            <Button
              onClick={handleLogout}
              data-testid="logout-button"
              className="bg-white text-sky-500 border border-sky-100 rounded-full px-6 py-2 font-semibold hover:bg-sky-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>

          {pregnancyProfile && pregnancyProfile.current_week && (
            <Card className="bg-gradient-to-br from-pink-100 to-sky-100 rounded-3xl p-6 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" data-testid="pregnancy-status-card">
              <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Votre grossesse</h2>
              <p className="text-3xl font-bold text-sky-600 mt-2">Semaine {pregnancyProfile.current_week}</p>
              <p className="text-slate-600 mt-2">Date prévue d'accouchement: {new Date(pregnancyProfile.estimated_due_date).toLocaleDateString('fr-FR')}</p>
            </Card>
          )}

          {/* Personalized Alerts Section */}
          {alerts.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-600 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Vos alertes personnalisées</h2>
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert, index) => (
                  <Card 
                    key={index} 
                    className={`rounded-2xl p-4 border-2 ${getAlertStyle(alert.type)}`}
                    data-testid={`alert-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-700 text-sm">{alert.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-semibold text-slate-600 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Services administratifs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                onClick={() => handleServiceClick('caf')}
                data-testid="caf-button"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-400 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>CAF</h3>
                <p className="text-slate-500 text-sm mt-2">Caisse d'Allocations Familiales</p>
              </Card>

              <Card
                onClick={() => handleServiceClick('ameli')}
                data-testid="ameli-button"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-400 rounded-2xl flex items-center justify-center mb-4">
                  <HeartHandshake className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Ameli</h3>
                <p className="text-slate-500 text-sm mt-2">Assurance Maladie</p>
              </Card>

              <Card
                onClick={() => handleServiceClick('mairie')}
                data-testid="mairie-button"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-400 rounded-2xl flex items-center justify-center mb-4">
                  <Landmark className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Mairie</h3>
                <p className="text-slate-500 text-sm mt-2">Services municipaux</p>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-600 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Fonctionnalités</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card
                onClick={() => navigate('/calculator')}
                data-testid="calculator-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <CalendarHeart className="w-12 h-12 text-sky-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Calculateur</h3>
              </Card>

              <Card
                onClick={() => navigate('/wheel')}
                data-testid="wheel-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <RotateCw className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Disque</h3>
              </Card>

              <Card
                onClick={() => navigate('/scanner')}
                data-testid="scanner-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <ScanBarcode className="w-12 h-12 text-pink-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Scanner</h3>
              </Card>

              <Card
                onClick={() => navigate('/embryo')}
                data-testid="embryo-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <HeartHandshake className="w-12 h-12 text-rose-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Évolution</h3>
              </Card>

              <Card
                onClick={() => navigate('/favorites')}
                data-testid="favorites-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Heart className="w-12 h-12 text-pink-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Favoris</h3>
              </Card>

              <Card
                onClick={() => navigate('/history')}
                data-testid="history-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <History className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Historique</h3>
              </Card>

              <Card
                onClick={() => navigate('/notifications')}
                data-testid="notifications-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Bell className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Rappels</h3>
              </Card>

              <Card
                onClick={() => navigate('/tips')}
                data-testid="tips-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <BookOpen className="w-12 h-12 text-teal-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Conseils</h3>
              </Card>

              <Card
                onClick={() => navigate('/settings')}
                data-testid="settings-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Settings className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Paramètres</h3>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

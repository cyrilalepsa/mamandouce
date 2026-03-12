import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Users, HeartHandshake, Landmark, CalendarHeart, ScanBarcode, History, Bell, BookOpen, User, LogOut, Cloud, Feather, RotateCw, Settings, Heart, AlertTriangle, ShieldCheck, Lightbulb, Stethoscope, Calendar, Scan, TestTube, Crown, MapPin, Apple, Baby, Library, Youtube, Gift } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import AppTitle from '../components/AppTitle';

function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    loadUserData();
    loadAlerts();
    loadUpcomingAppointments();
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

  const loadUpcomingAppointments = async () => {
    try {
      const response = await api.medical.getUpcoming();
      setUpcomingAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
    }
  };

  const getAppointmentIcon = (type) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="w-4 h-4" />;
      case 'echographie':
        return <Scan className="w-4 h-4" />;
      case 'prise_sang':
        return <TestTube className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getAppointmentColor = (type, isUrgent) => {
    if (isUrgent) return 'bg-amber-100 border-amber-300 text-amber-800';
    switch (type) {
      case 'echographie':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'prise_sang':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-sky-50 border-sky-200 text-sky-700';
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
        <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
          
          {/* Top Bar - Premium à gauche, Déconnexion à droite */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => navigate('/pricing')}
              data-testid="premium-button"
              className="bg-gradient-to-r from-amber-400 to-amber-300 text-white rounded-full px-5 py-2 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Premium
            </Button>
            <Button
              onClick={handleLogout}
              data-testid="logout-button"
              className="bg-white text-slate-500 border border-slate-200 rounded-full p-2.5 hover:bg-slate-50"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* Logo MamanDouce centré */}
          <div className="text-center py-4">
            <AppTitle size="xl" showSubtitle={false} />
          </div>

          {/* Message de bienvenue avec prénom en valeur */}
          <div className="text-center">
            <h2 
              className="text-2xl sm:text-3xl"
              data-testid="user-welcome"
            >
              <span className="text-slate-500 font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>Bonjour, </span>
              <span 
                className="text-slate-700 font-bold text-3xl sm:text-4xl"
                style={{ fontFamily: "'Nunito', sans-serif", letterSpacing: '0.5px' }}
              >
                {userName}
              </span>
              <span className="text-pink-400 ml-2">❤️</span>
            </h2>
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

          {/* Upcoming Medical Appointments */}
          {upcomingAppointments.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-slate-600" style={{ fontFamily: 'Nunito, sans-serif' }}>Rendez-vous à venir</h2>
                <Button
                  onClick={() => navigate('/medical')}
                  className="text-sky-500 bg-transparent hover:bg-sky-50 text-sm"
                >
                  Voir tout
                </Button>
              </div>
              <div className="space-y-2">
                {upcomingAppointments.slice(0, 3).map((apt, index) => (
                  <Card 
                    key={apt.id} 
                    className={`rounded-2xl p-4 border-2 cursor-pointer hover:shadow-md transition-all ${getAppointmentColor(apt.type, apt.is_urgent)}`}
                    onClick={() => navigate('/medical')}
                    data-testid={`upcoming-apt-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${apt.is_urgent ? 'bg-amber-200' : 'bg-white/60'}`}>
                        {getAppointmentIcon(apt.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{apt.title}</h4>
                          {apt.is_urgent && (
                            <span className="text-xs bg-amber-200 px-2 py-0.5 rounded-full font-medium">Maintenant</span>
                          )}
                        </div>
                        <p className="text-xs opacity-80 mt-0.5">
                          Semaines {apt.week_start}-{apt.week_end}
                          {apt.weeks_until > 0 && ` • Dans ${apt.weeks_until} semaine${apt.weeks_until > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-slate-600 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>Services & Ressources</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => handleServiceClick('caf')}
                data-testid="caf-button"
                className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-700">CAF</span>
              </button>

              <button
                onClick={() => handleServiceClick('ameli')}
                data-testid="ameli-button"
                className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-400 rounded-full flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-700">Ameli</span>
              </button>

              <a
                href="https://www.youtube.com/c/LaMaisondesMaternelles"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="youtube-button"
                className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer transition-all hover:-translate-y-0.5 no-underline"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-700">Maternelles TV</span>
              </a>

              <a
                href="https://www.google.com/maps/search/mairie/"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="maps-button"
                className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer transition-all hover:-translate-y-0.5 no-underline"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-700">Maps</span>
              </a>
            </div>
          </div>

          {/* Catégorie Alimentation */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-600 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <Apple className="w-6 h-6 text-green-500" />
              Alimentation
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card
                onClick={() => navigate('/scanner')}
                data-testid="scanner-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <ScanBarcode className="w-12 h-12 text-pink-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Scanner</h3>
                <p className="text-xs text-slate-500 mt-1">Caméra ou manuel</p>
              </Card>

              <Card
                onClick={() => navigate('/library')}
                data-testid="library-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Library className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Bibliothèque</h3>
                <p className="text-xs text-slate-500 mt-1">Tous les aliments</p>
              </Card>

              <Card
                onClick={() => navigate('/favorites')}
                data-testid="favorites-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Heart className="w-12 h-12 text-pink-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Favoris</h3>
                <p className="text-xs text-slate-500 mt-1">Aliments sauvegardés</p>
              </Card>

              <Card
                onClick={() => navigate('/history')}
                data-testid="history-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <History className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Historique</h3>
                <p className="text-xs text-slate-500 mt-1">Recherches récentes</p>
              </Card>
            </div>
          </div>

          {/* Catégorie Grossesse */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-600 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <Baby className="w-6 h-6 text-pink-500" />
              Grossesse
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card
                onClick={() => navigate('/calculator')}
                data-testid="calculator-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <CalendarHeart className="w-12 h-12 text-sky-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Calculateur</h3>
                <p className="text-xs text-slate-500 mt-1">Dates clés</p>
              </Card>

              <Card
                onClick={() => navigate('/birth-list')}
                data-testid="birthlist-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Gift className="w-12 h-12 text-pink-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Liste de naissance</h3>
                <p className="text-xs text-slate-500 mt-1">À partager</p>
              </Card>

              <Card
                onClick={() => navigate('/medical')}
                data-testid="medical-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Stethoscope className="w-12 h-12 text-sky-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Rendez-vous</h3>
                <p className="text-xs text-slate-500 mt-1">Suivi médical</p>
              </Card>

              <Card
                onClick={() => navigate('/tips')}
                data-testid="tips-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <BookOpen className="w-12 h-12 text-teal-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Conseils</h3>
                <p className="text-xs text-slate-500 mt-1">Hebdomadaires</p>
              </Card>

              <Card
                onClick={() => navigate('/notifications')}
                data-testid="notifications-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Bell className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Rappels</h3>
                <p className="text-xs text-slate-500 mt-1">Notifications</p>
              </Card>

              <Card
                onClick={() => navigate('/settings')}
                data-testid="settings-nav"
                className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Settings className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Paramètres</h3>
                <p className="text-xs text-slate-500 mt-1">Préférences</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

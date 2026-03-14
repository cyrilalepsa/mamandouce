import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  Users, HeartHandshake, CalendarHeart, ScanBarcode, History, Bell, BookOpen, 
  User, LogOut, Cloud, Feather, Settings, Heart, Stethoscope, Calendar, 
  Scan, TestTube, Crown, MapPin, Apple, Baby, Library, Youtube, Gift, Shield,
  Sparkles, BookHeart, Video, Book, TrendingUp, ClipboardList, ChevronRight
} from 'lucide-react';
import api from '../utils/api';
import AppTitle from '../components/AppTitle';

const ADMIN_EMAIL = 'cyrilalepsa@gmail.com';

function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [userRole, setUserRole] = useState('user');
  const [fertilityStatus, setFertilityStatus] = useState(null);

  useEffect(() => {
    loadUserData();
    loadUpcomingAppointments();
    loadFertilityStatus();
  }, []);

  const loadUserData = async () => {
    try {
      const userRes = await api.auth.getMe();
      setUserName(userRes.data.name);
      setUserEmail(userRes.data.email);
      setUserRole(userRes.data.role || 'user');
      
      const profileRes = await api.pregnancy.getProfile();
      setPregnancyProfile(profileRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const isAdmin = userRole === 'admin' || userEmail === ADMIN_EMAIL;

  const loadUpcomingAppointments = async () => {
    try {
      const response = await api.medical.getUpcoming();
      setUpcomingAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
    }
  };

  const loadFertilityStatus = async () => {
    try {
      const response = await api.pregnancy.checkFertilityWindow();
      setFertilityStatus(response.data);
    } catch (error) {
      console.error('Erreur chargement statut fertilité:', error);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Détermine si l'utilisateur a un profil de grossesse configuré
  const hasPregnancyProfile = pregnancyProfile && pregnancyProfile.current_week;

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <Cloud className="absolute top-20 left-10 w-40 h-40 text-sky-200 opacity-10 animate-float" />
      <Feather className="absolute top-40 right-20 w-32 h-32 text-pink-200 opacity-20 animate-float-delayed" />
      <Cloud className="absolute bottom-40 right-40 w-48 h-48 text-sky-100 opacity-10 animate-float" />
      <Feather className="absolute bottom-20 left-40 w-24 h-24 text-pink-100 opacity-20 animate-float-delayed" />

      <div className="relative z-10">
        <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
          
          {/* Barre supérieure */}
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

          {/* Logo et bienvenue */}
          <div className="text-center py-4">
            <AppTitle size="xl" showSubtitle={false} />
          </div>

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl" data-testid="user-welcome">
              <span className="text-slate-500 font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>Bonjour, </span>
              <span className="text-slate-700 text-4xl sm:text-5xl font-semibold" style={{ fontFamily: "'Caveat', cursive" }}>
                {userName}
              </span>
              <span className="text-pink-400 ml-2">❤️</span>
            </h2>
          </div>

          {/* ========== AGENDA ========== */}
          <Card className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100" data-testid="agenda-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Mon agenda</h2>
            </div>
            
            {hasPregnancyProfile ? (
              <div className="space-y-3">
                {/* Semaine actuelle */}
                <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-sky-50 rounded-2xl p-4">
                  <div>
                    <p className="text-sm text-slate-500">Vous êtes à la</p>
                    <p className="text-2xl font-bold text-sky-600">Semaine {pregnancyProfile.current_week}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Accouchement prévu</p>
                    <p className="text-lg font-bold text-pink-600">
                      {new Date(pregnancyProfile.estimated_due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>

                {/* Prochains rendez-vous */}
                {upcomingAppointments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-600">Prochains rendez-vous</p>
                    {upcomingAppointments.slice(0, 2).map((apt) => (
                      <div 
                        key={apt.id}
                        className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 cursor-pointer hover:bg-slate-100 transition-all"
                        onClick={() => navigate('/medical')}
                      >
                        <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">
                          {getAppointmentIcon(apt.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-700 text-sm">{apt.title}</p>
                          <p className="text-xs text-slate-500">Semaines {apt.week_start}-{apt.week_end}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Fertilité si applicable */}
                {fertilityStatus && fertilityStatus.in_fertile_window && (
                  <div 
                    className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => navigate('/calculator')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-400 rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-rose-700">
                            {fertilityStatus.is_ovulation_day ? "Jour d'ovulation !" : "Période fertile"}
                          </p>
                          <span className="animate-pulse w-2 h-2 bg-rose-500 rounded-full"></span>
                        </div>
                        <p className="text-sm text-rose-600">
                          {fertilityStatus.is_ovulation_day 
                            ? "Moment idéal pour concevoir"
                            : `Ovulation dans ${fertilityStatus.days_to_ovulation} jour(s)`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500 mb-3">Renseignez vos informations pour personnaliser votre agenda</p>
                <Button
                  onClick={() => navigate('/calculator')}
                  className="bg-gradient-to-r from-sky-400 to-pink-400 text-white rounded-full px-6 py-2"
                >
                  Configurer mon cycle
                </Button>
              </div>
            )}
          </Card>

          {/* ========== CATÉGORIE 1: EN ROUTE VERS LA GROSSESSE ========== */}
          <div>
            <h2 className="text-xl font-bold text-slate-600 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <Sparkles className="w-5 h-5 text-amber-500" />
              En route vers la grossesse
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Card
                onClick={() => navigate('/calculator')}
                data-testid="calculator-nav"
                className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <CalendarHeart className="w-10 h-10 text-sky-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Calculateur</h3>
                <p className="text-xs text-slate-500 mt-1">Ovulation et dates clés</p>
              </Card>

              <Card
                onClick={() => navigate('/tips')}
                data-testid="preconception-tips-nav"
                className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <BookHeart className="w-10 h-10 text-pink-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Conseils</h3>
                <p className="text-xs text-slate-500 mt-1">Préparer sa grossesse</p>
              </Card>
            </div>
            
            {/* Avertissement médical */}
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700">
                <strong>Information :</strong> Les conseils fournis sont à titre informatif et ne remplacent pas l'avis d'un médecin. 
                Consultez un professionnel de santé avant toute prise de médicaments ou compléments.
              </p>
            </div>
          </div>

          {/* ========== CATÉGORIE 2: GROSSESSE ========== */}
          <div>
            <h2 className="text-xl font-bold text-slate-600 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <Baby className="w-5 h-5 text-pink-500" />
              Grossesse
            </h2>

            {/* Carte de suivi de grossesse */}
            {hasPregnancyProfile && (
              <Card 
                className="bg-gradient-to-br from-pink-100 to-sky-100 rounded-3xl p-5 mb-4 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate('/tips')}
                data-testid="pregnancy-progress-card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Baby className="w-8 h-8 text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600">Votre bébé grandit</p>
                    <p className="text-2xl font-bold text-slate-700">Semaine {pregnancyProfile.current_week}</p>
                    <p className="text-sm text-slate-500">
                      Trimestre {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)}
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-400" />
                </div>
              </Card>
            )}

            {/* Grille alimentation et suivi */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Card
                onClick={() => navigate('/scanner')}
                data-testid="scanner-nav"
                className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <ScanBarcode className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Scanner</h3>
                <p className="text-xs text-slate-500">Aliments</p>
              </Card>

              <Card
                onClick={() => navigate('/library')}
                data-testid="library-nav"
                className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Apple className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Bibliothèque</h3>
                <p className="text-xs text-slate-500">Aliments</p>
              </Card>

              <Card
                onClick={() => navigate('/favorites')}
                data-testid="favorites-nav"
                className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Favoris</h3>
                <p className="text-xs text-slate-500">Sauvegardés</p>
              </Card>

              <Card
                onClick={() => navigate('/history')}
                data-testid="history-nav"
                className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <History className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Historique</h3>
                <p className="text-xs text-slate-500">Recherches</p>
              </Card>
            </div>

            {/* Évolution, RDV, Rappels */}
            <div className="grid grid-cols-3 gap-3">
              <Card
                onClick={() => navigate('/tips')}
                data-testid="evolution-nav"
                className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <TrendingUp className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Évolution</h3>
                <p className="text-xs text-slate-500">et démarches</p>
              </Card>

              <Card
                onClick={() => navigate('/medical')}
                data-testid="medical-nav"
                className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Stethoscope className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Rendez-vous</h3>
                <p className="text-xs text-slate-500">Suivi médical</p>
              </Card>

              <Card
                onClick={() => navigate('/notifications')}
                data-testid="notifications-nav"
                className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Bell className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Rappels</h3>
                <p className="text-xs text-slate-500">Notifications</p>
              </Card>
            </div>
          </div>

          {/* ========== CATÉGORIE 3: PRÉPARER L'ARRIVÉE DE BÉBÉ ========== */}
          <div>
            <h2 className="text-xl font-bold text-slate-600 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <Gift className="w-5 h-5 text-purple-500" />
              Préparer l'arrivée de bébé
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Card
                onClick={() => navigate('/birth-list')}
                data-testid="birthlist-nav"
                className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <ClipboardList className="w-10 h-10 text-pink-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Liste de naissance</h3>
                <p className="text-xs text-slate-500 mt-1">À partager</p>
              </Card>

              <a
                href="https://www.youtube.com/results?search_query=préparation+accouchement"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <Card
                  data-testid="birth-videos-nav"
                  className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center h-full"
                >
                  <Video className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Vidéos</h3>
                  <p className="text-xs text-slate-500 mt-1">Préparation accouchement</p>
                </Card>
              </a>

              <a
                href="https://www.youtube.com/c/LaMaisondesMaternelles"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <Card
                  data-testid="maternelles-nav"
                  className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center h-full"
                >
                  <Youtube className="w-10 h-10 text-red-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Les Maternelles</h3>
                  <p className="text-xs text-slate-500 mt-1">Chaîne YouTube</p>
                </Card>
              </a>

              <a
                href="https://www.amazon.fr/s?k=livre+grossesse+bébé"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <Card
                  data-testid="books-nav"
                  className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center h-full"
                >
                  <Book className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Livres</h3>
                  <p className="text-xs text-slate-500 mt-1">Utiles et pratiques</p>
                </Card>
              </a>
            </div>
          </div>

          {/* ========== CATÉGORIE 4: SERVICES & RESSOURCES ========== */}
          <div>
            <h2 className="text-xl font-bold text-slate-600 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <Library className="w-5 h-5 text-blue-500" />
              Services et ressources
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://www.caf.fr"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="caf-button"
                className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer transition-all hover:-translate-y-0.5 no-underline"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-700">CAF</span>
              </a>

              <a
                href="https://www.ameli.fr"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="ameli-button"
                className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer transition-all hover:-translate-y-0.5 no-underline"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-400 rounded-full flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-700">Ameli</span>
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
                <span className="font-semibold text-slate-700">Mairies proches</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default HomePage;

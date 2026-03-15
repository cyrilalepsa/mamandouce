import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  Users, HeartHandshake, CalendarHeart, ScanBarcode, History, Bell, BookOpen, 
  User, LogOut, Cloud, Feather, Settings, Heart, Stethoscope, Calendar, 
  Scan, TestTube, Crown, MapPin, Apple, Baby, Library, Youtube, Gift, Shield,
  Sparkles, BookHeart, Video, Book, TrendingUp, ClipboardList, ChevronRight,
  CalendarDays, Droplets, Egg, Save, CalendarRange, Briefcase, MessageCircle, Bot
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import AppTitle from '../components/AppTitle';
import FertilityCalendar from '../components/FertilityCalendar';

const ADMIN_EMAIL = 'cyrilalepsa@gmail.com';

function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [userRole, setUserRole] = useState('user');
  const [fertilityStatus, setFertilityStatus] = useState(null);
  
  // Agenda states
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [agendaData, setAgendaData] = useState(null);
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [rapportDates, setRapportDates] = useState([]);

  useEffect(() => {
    loadUserData();
    loadUpcomingAppointments();
    loadFertilityStatus();
    loadRapportDates();
  }, []);

  const loadUserData = async () => {
    try {
      const userRes = await api.auth.getMe();
      setUserName(userRes.data.name);
      setUserEmail(userRes.data.email);
      setUserRole(userRes.data.role || 'user');
      
      const profileRes = await api.pregnancy.getProfile();
      setPregnancyProfile(profileRes.data);
      
      // Si un profil existe, charger les données de l'agenda
      if (profileRes.data && profileRes.data.last_period_date) {
        setLastPeriodDate(profileRes.data.last_period_date.split('T')[0]);
        setCycleLength(profileRes.data.cycle_length || 28);
        calculateAgendaDates(profileRes.data.last_period_date, profileRes.data.cycle_length || 28);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  // Calculer les dates de l'agenda
  const calculateAgendaDates = (periodDate, cycle) => {
    if (!periodDate) return;
    
    const lastPeriod = new Date(periodDate);
    const cycleLen = cycle || 28;
    
    // Calcul de l'ovulation (généralement 14 jours avant les prochaines règles)
    const lutealPhase = 14;
    const ovulationDay = cycleLen - lutealPhase;
    
    // Date d'ovulation
    const ovulationDate = new Date(lastPeriod);
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
    
    // Fenêtre de fertilité (5 jours avant ovulation + jour d'ovulation + 1 jour après)
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    // Prochaines règles
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLen);
    
    // Si les dates sont passées, calculer pour le prochain cycle
    const today = new Date();
    let adjustedOvulation = ovulationDate;
    let adjustedFertileStart = fertileStart;
    let adjustedFertileEnd = fertileEnd;
    let adjustedNextPeriod = nextPeriod;
    
    while (adjustedNextPeriod < today) {
      adjustedOvulation.setDate(adjustedOvulation.getDate() + cycleLen);
      adjustedFertileStart.setDate(adjustedFertileStart.getDate() + cycleLen);
      adjustedFertileEnd.setDate(adjustedFertileEnd.getDate() + cycleLen);
      adjustedNextPeriod.setDate(adjustedNextPeriod.getDate() + cycleLen);
    }
    
    // Vérifier si on est dans la fenêtre fertile
    const inFertileWindow = today >= adjustedFertileStart && today <= adjustedFertileEnd;
    const isOvulationDay = today.toDateString() === adjustedOvulation.toDateString();
    const daysToOvulation = Math.ceil((adjustedOvulation - today) / (1000 * 60 * 60 * 24));
    const daysToNextPeriod = Math.ceil((adjustedNextPeriod - today) / (1000 * 60 * 60 * 24));
    
    setAgendaData({
      ovulationDate: adjustedOvulation,
      fertileStart: adjustedFertileStart,
      fertileEnd: adjustedFertileEnd,
      nextPeriod: adjustedNextPeriod,
      inFertileWindow,
      isOvulationDay,
      daysToOvulation: daysToOvulation > 0 ? daysToOvulation : 0,
      daysToNextPeriod: daysToNextPeriod > 0 ? daysToNextPeriod : 0,
      cycleLength: cycleLen
    });
  };

  const handleSaveAgenda = async () => {
    if (!lastPeriodDate) {
      toast.error('Veuillez renseigner la date de vos dernières règles');
      return;
    }
    
    setAgendaLoading(true);
    try {
      await api.pregnancy.calculate({
        last_period_date: lastPeriodDate,
        cycle_length: cycleLength
      });
      
      calculateAgendaDates(lastPeriodDate, cycleLength);
      setShowAgendaForm(false);
      toast.success('Agenda mis à jour !');
      
      // Recharger le profil
      loadUserData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setAgendaLoading(false);
    }
  };

  const formatDateFull = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatDateShort = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Charger les dates de rapports depuis le localStorage
  const loadRapportDates = () => {
    const saved = localStorage.getItem('mamandouce_rapports');
    if (saved) {
      setRapportDates(JSON.parse(saved));
    }
  };

  // Ajouter une date de rapport
  const handleAddRapport = (date) => {
    const newDates = [...rapportDates, date].sort();
    setRapportDates(newDates);
    localStorage.setItem('mamandouce_rapports', JSON.stringify(newDates));
    toast.success('Rapport enregistré');
  };

  // Supprimer une date de rapport
  const handleRemoveRapport = (date) => {
    const newDates = rapportDates.filter(d => d !== date);
    setRapportDates(newDates);
    localStorage.setItem('mamandouce_rapports', JSON.stringify(newDates));
    toast.success('Rapport supprimé');
  };

  // Calculer la prochaine nidation estimée
  const getNextImplantation = () => {
    if (rapportDates.length === 0) return null;
    
    const today = new Date();
    let nextImplantation = null;
    
    for (const rapportDate of rapportDates) {
      const rapport = new Date(rapportDate);
      // Nidation 6-12 jours après le rapport
      const implantationEarly = new Date(rapport);
      implantationEarly.setDate(implantationEarly.getDate() + 6);
      const implantationLate = new Date(rapport);
      implantationLate.setDate(implantationLate.getDate() + 12);
      
      if (implantationLate >= today) {
        if (!nextImplantation || implantationEarly < nextImplantation.early) {
          nextImplantation = { early: implantationEarly, late: implantationLate, rapportDate: rapport };
        }
      }
    }
    
    return nextImplantation;
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

          {/* ========== AGENDA INTERACTIF ========== */}
          <Card className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100" data-testid="agenda-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Mon agenda</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowCalendar(true)}
                  className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 rounded-full p-2 hover:from-purple-200 hover:to-pink-200"
                  title="Ouvrir le calendrier"
                  data-testid="open-calendar-btn"
                >
                  <CalendarRange className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setShowAgendaForm(!showAgendaForm)}
                  className="bg-slate-100 text-slate-600 rounded-full p-2 hover:bg-slate-200"
                  title="Modifier"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Formulaire de saisie */}
            {showAgendaForm && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 mb-4 space-y-3">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">
                    Date de vos dernières règles
                  </label>
                  <Input
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="rounded-xl border-slate-200"
                    data-testid="agenda-period-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">
                    Durée de votre cycle
                  </label>
                  <select
                    value={cycleLength}
                    onChange={(e) => setCycleLength(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-600"
                    data-testid="agenda-cycle-select"
                  >
                    {[24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map(days => (
                      <option key={days} value={days}>{days} jours {days === 28 && '(standard)'}</option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleSaveAgenda}
                  disabled={agendaLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-2"
                  data-testid="agenda-save-button"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {agendaLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            )}

            {/* Affichage des dates calculées */}
            {agendaData ? (
              <div className="space-y-3">
                {/* Alerte période fertile */}
                {agendaData.inFertileWindow && (
                  <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-4 border-2 border-rose-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-400 rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-rose-700">
                            {agendaData.isOvulationDay ? "Jour d'ovulation !" : "Période fertile en cours"}
                          </p>
                          <span className="animate-pulse w-2 h-2 bg-rose-500 rounded-full"></span>
                        </div>
                        <p className="text-sm text-rose-600">
                          {agendaData.isOvulationDay 
                            ? "C'est le moment idéal pour concevoir"
                            : `Pic d'ovulation dans ${agendaData.daysToOvulation} jour(s)`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pic d'ovulation */}
                <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-indigo-400 rounded-xl flex items-center justify-center">
                      <Egg className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 font-semibold">Pic d'ovulation</p>
                      <p className="text-lg font-bold text-sky-600">{formatDateFull(agendaData.ovulationDate)}</p>
                      {agendaData.daysToOvulation > 0 && !agendaData.isOvulationDay && (
                        <p className="text-xs text-slate-500">Dans {agendaData.daysToOvulation} jour(s)</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fenêtre de fertilité */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 font-semibold">Fenêtre de fertilité</p>
                      <p className="text-base font-bold text-emerald-600">
                        Du {formatDateShort(agendaData.fertileStart)} au {formatDateShort(agendaData.fertileEnd)}
                      </p>
                      <p className="text-xs text-slate-500">Période la plus favorable à la conception</p>
                    </div>
                  </div>
                </div>

                {/* Prochaines règles */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-xl flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 font-semibold">Prochaines règles</p>
                      <p className="text-lg font-bold text-pink-600">{formatDateFull(agendaData.nextPeriod)}</p>
                      {agendaData.daysToNextPeriod > 0 && (
                        <p className="text-xs text-slate-500">Dans {agendaData.daysToNextPeriod} jour(s)</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nidation estimée si rapports enregistrés */}
                {getNextImplantation() && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                        <Baby className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 font-semibold">Nidation estimée</p>
                        <p className="text-base font-bold text-amber-600">
                          Du {formatDateShort(getNextImplantation().early)} au {formatDateShort(getNextImplantation().late)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Basé sur le rapport du {formatDateShort(getNextImplantation().rapportDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rapports enregistrés */}
                {rapportDates.length > 0 && (
                  <div className="bg-rose-50 rounded-2xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span className="text-sm font-semibold text-rose-700">Rapports enregistrés</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rapportDates.slice(-5).map((date, index) => (
                        <span key={index} className="bg-white text-rose-600 text-xs px-2 py-1 rounded-full border border-rose-200">
                          {formatDateShort(date)}
                        </span>
                      ))}
                      {rapportDates.length > 5 && (
                        <span className="text-xs text-rose-500">+{rapportDates.length - 5}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Info cycle */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    Cycle de {agendaData.cycleLength} jours • Dernières règles : {formatDateShort(lastPeriodDate)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-3">Renseignez la date de vos dernières règles pour voir vos prévisions</p>
                <Button
                  onClick={() => setShowAgendaForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2"
                >
                  Configurer mon cycle
                </Button>
              </div>
            )}
          </Card>

          {/* ========== GROSSESSE EN COURS ========== */}
          {hasPregnancyProfile && pregnancyProfile.current_week && (
            <Card className="bg-gradient-to-br from-pink-100 to-sky-100 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0" data-testid="pregnancy-status-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Vous êtes à la</p>
                  <p className="text-2xl font-bold text-sky-600">Semaine {pregnancyProfile.current_week}</p>
                  <p className="text-sm text-slate-500">Trimestre {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Accouchement prévu</p>
                  <p className="text-xl font-bold text-pink-600">
                    {new Date(pregnancyProfile.estimated_due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
              
              {/* Prochains rendez-vous */}
              {upcomingAppointments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/50">
                  <p className="text-sm font-semibold text-slate-600 mb-2">Prochains rendez-vous</p>
                  <div className="space-y-2">
                    {upcomingAppointments.slice(0, 2).map((apt) => (
                      <div 
                        key={apt.id}
                        className="flex items-center gap-3 bg-white/60 rounded-xl p-3 cursor-pointer hover:bg-white/80 transition-all"
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
                </div>
              )}
            </Card>
          )}

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

              <Card
                onClick={() => navigate('/maternity-bag')}
                data-testid="maternity-bag-nav"
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
              >
                <Briefcase className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Sac de maternité</h3>
                <p className="text-xs text-slate-500 mt-1">Check-list interactive</p>
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
                className="no-underline col-span-2"
              >
                <Card
                  data-testid="books-nav"
                  className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center h-full"
                >
                  <Book className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Livres utiles</h3>
                  <p className="text-xs text-slate-500 mt-1">Grossesse et bébé</p>
                </Card>
              </a>
            </div>
          </div>

          {/* ========== CATÉGORIE 4: SUIVI POST-PARTUM ========== */}
          <div>
            <h2 className="text-xl font-bold text-slate-600 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <Heart className="w-5 h-5 text-rose-500" />
              Suivi post-partum
            </h2>
            <Card
              onClick={() => navigate('/postpartum')}
              data-testid="postpartum-nav"
              className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Baby className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Les 6 premiers mois avec bébé</h3>
                  <p className="text-sm text-slate-500 mt-1">Conseils, rendez-vous, allaitement, couches et précautions</p>
                </div>
                <ChevronRight className="w-6 h-6 text-rose-400" />
              </div>
            </Card>
          </div>

          {/* ========== CATÉGORIE 5: SERVICES & RESSOURCES ========== */}
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

      {/* Calendrier Modal */}
      <FertilityCalendar
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        agendaData={agendaData}
        rapportDates={rapportDates}
        onAddRapport={handleAddRapport}
        onRemoveRapport={handleRemoveRapport}
      />
    </div>
  );
}

export default HomePage;

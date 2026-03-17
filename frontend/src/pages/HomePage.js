import { useState, useEffect } from 'react';
import { Cloud, Feather } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import AppTitle from '../components/AppTitle';
import FertilityCalendar from '../components/FertilityCalendar';
import {
  AgendaCard,
  PregnancyStatusCard,
  TopBar,
  PreconceptionSection,
  PregnancySection,
  BabyPreparationSection,
  PostpartumSection,
  ServicesSection
} from '../components/home';

const ADMIN_EMAIL = 'cyrilalepsa@gmail.com';

function HomePage() {
  const [userName, setUserName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [userRole, setUserRole] = useState('user');
  
  // Agenda states
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [agendaData, setAgendaData] = useState(null);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [rapportDates, setRapportDates] = useState([]);

  useEffect(() => {
    loadUserData();
    loadRapportDates();
  }, []);

  const loadUserData = async () => {
    try {
      const userRes = await api.auth.getMe();
      setUserName(userRes.data.name);
      setDisplayName(userRes.data.display_name || '');
      setUserAvatar(userRes.data.avatar || '');
      setUserEmail(userRes.data.email);
      setUserRole(userRes.data.role || 'user');
      
      const profileRes = await api.pregnancy.getProfile();
      setPregnancyProfile(profileRes.data);
      
      if (profileRes.data && profileRes.data.last_period_date) {
        setLastPeriodDate(profileRes.data.last_period_date.split('T')[0]);
        setCycleLength(profileRes.data.cycle_length || 28);
        calculateAgendaDates(profileRes.data.last_period_date, profileRes.data.cycle_length || 28);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const calculateAgendaDates = (periodDate, cycle) => {
    if (!periodDate) return;
    
    const lastPeriod = new Date(periodDate);
    const cycleLen = cycle || 28;
    const lutealPhase = 14;
    const ovulationDay = cycleLen - lutealPhase;
    
    const ovulationDate = new Date(lastPeriod);
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
    
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLen);
    
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
      toast.success('Agenda mis à jour !');
      loadUserData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setAgendaLoading(false);
    }
  };

  const loadRapportDates = () => {
    const saved = localStorage.getItem('mamandouce_rapports');
    if (saved) {
      setRapportDates(JSON.parse(saved));
    }
  };

  const handleAddRapport = (date) => {
    const newDates = [...rapportDates, date].sort();
    setRapportDates(newDates);
    localStorage.setItem('mamandouce_rapports', JSON.stringify(newDates));
    toast.success('Rapport enregistré');
  };

  const handleRemoveRapport = (date) => {
    const newDates = rapportDates.filter(d => d !== date);
    setRapportDates(newDates);
    localStorage.setItem('mamandouce_rapports', JSON.stringify(newDates));
    toast.success('Rapport supprimé');
  };

  const getNextImplantation = () => {
    if (rapportDates.length === 0) return null;
    
    const today = new Date();
    let nextImplantation = null;
    
    for (const rapportDate of rapportDates) {
      const rapport = new Date(rapportDate);
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
  const hasPregnancyProfile = pregnancyProfile && pregnancyProfile.current_week;

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
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
            {userAvatar && (
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={userAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  data-testid="home-user-avatar"
                />
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl text-center" data-testid="user-welcome">
              <span className="text-slate-500 font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>Bonjour, </span>
              <span className="text-slate-700 text-4xl sm:text-5xl font-semibold" style={{ fontFamily: "'Caveat', cursive" }}>
                {displayName || userName}
              </span>
              <span className="text-pink-400 ml-2">❤️</span>
            </h2>
          </div>

          {/* Agenda interactif */}
          <AgendaCard
            agendaData={agendaData}
            lastPeriodDate={lastPeriodDate}
            setLastPeriodDate={setLastPeriodDate}
            cycleLength={cycleLength}
            setCycleLength={setCycleLength}
            onSave={handleSaveAgenda}
            loading={agendaLoading}
            onOpenCalendar={() => setShowCalendar(true)}
            rapportDates={rapportDates}
            getNextImplantation={getNextImplantation}
          />

          {/* Statut de grossesse */}
          {hasPregnancyProfile && (
            <PregnancyStatusCard
              pregnancyProfile={pregnancyProfile}
            />
          )}

          {/* Sections de navigation */}
          <PreconceptionSection />
          <PregnancySection 
            hasPregnancyProfile={hasPregnancyProfile} 
            pregnancyProfile={pregnancyProfile} 
          />
          <BabyPreparationSection />
          <PostpartumSection />
          <ServicesSection />

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

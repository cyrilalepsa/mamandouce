import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarDays, Settings, Save, CalendarRange, Egg, Heart, Droplets, Baby, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import api from '../utils/api';
import FertilityCalendar from '../components/FertilityCalendar';
import { getCurrentLanguage } from '../i18n';

function CycleTrackingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentLang = getCurrentLanguage();
  
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [agendaData, setAgendaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [rapportDates, setRapportDates] = useState([]);

  useEffect(() => {
    loadData();
    loadRapportDates();
  }, []);

  const loadData = async () => {
    try {
      const profileRes = await api.pregnancy.getProfile();
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

  const handleSave = async () => {
    if (!lastPeriodDate) {
      toast.error(t('fertility.enterPeriodDate'));
      return;
    }
    
    setLoading(true);
    try {
      await api.pregnancy.calculate({
        last_period_date: lastPeriodDate,
        cycle_length: cycleLength
      });
      
      calculateAgendaDates(lastPeriodDate, cycleLength);
      toast.success(t('common.saved', 'Enregistré !'));
      setShowForm(false);
    } catch (error) {
      toast.error(t('common.error', 'Erreur'));
    } finally {
      setLoading(false);
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
    toast.success(t('fertility.intercourseRecorded', 'Rapport enregistré'));
  };

  const handleRemoveRapport = (date) => {
    const newDates = rapportDates.filter(d => d !== date);
    setRapportDates(newDates);
    localStorage.setItem('mamandouce_rapports', JSON.stringify(newDates));
    toast.success(t('fertility.intercourseRemoved', 'Rapport supprimé'));
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

  // Locale for date formatting
  const getLocale = () => {
    const localeMap = {
      'fr': 'fr-FR',
      'en': 'en-US',
      'es': 'es-ES',
      'pt': 'pt-PT',
      'it': 'it-IT',
      'de': 'de-DE'
    };
    return localeMap[currentLang] || 'fr-FR';
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatDateFull = (date) => {
    if (!date) return '';
    const formatted = new Date(date).toLocaleDateString(getLocale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    return capitalize(formatted);
  };

  const formatDateShort = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(getLocale(), {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/journey-steps')}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
            data-testid="back-button"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {t('home.cycleTracking', 'Suivi de cycles')}
            </h1>
            <p className="text-sm text-slate-500">{t('fertility.trackYourCycle', 'Calendrier fertilité')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCalendar(true)}
              className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 rounded-full p-2 hover:from-purple-200 hover:to-pink-200"
              title={t('fertility.openCalendar', 'Ouvrir le calendrier')}
              data-testid="open-calendar-btn"
            >
              <CalendarRange className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-slate-100 text-slate-600 rounded-full p-2 hover:bg-slate-200"
              title={t('common.edit')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Formulaire de configuration */}
        {showForm && (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 mb-4 space-y-3 border-0">
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">
                {t('home.lastPeriodDate', 'Date des dernières règles')}
              </label>
              <Input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="rounded-xl border-slate-200"
                data-testid="period-date-input"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">
                {t('home.cycleLength', 'Durée du cycle')}
              </label>
              <select
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-600"
                data-testid="cycle-length-select"
              >
                {[24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map(days => (
                  <option key={days} value={days}>{days} {t('home.days', 'jours')} {days === 28 && `(${t('common.standard', 'standard')})`}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-2"
              data-testid="save-button"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? t('common.sending', 'Envoi...') : t('common.save', 'Enregistrer')}
            </Button>
          </Card>
        )}

        {/* Contenu principal */}
        {agendaData ? (
          <div className="space-y-4">
            {/* Alerte période fertile */}
            {agendaData.inFertileWindow && (
              <Card className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-4 border-2 border-rose-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rose-400 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-rose-700 text-lg">
                        {agendaData.isOvulationDay ? t('fertility.ovulationToday', "Jour d'ovulation !") : t('fertility.inFertileWindow', 'Période fertile !')}
                      </p>
                      <span className="animate-pulse w-3 h-3 bg-rose-500 rounded-full"></span>
                    </div>
                    <p className="text-sm text-rose-600">
                      {agendaData.isOvulationDay 
                        ? t('calculator.ovulationTip', "C'est le moment idéal pour concevoir")
                        : `${t('calculator.ovulationPeak', 'Pic d\'ovulation')} ${t('calculator.inDays', { days: agendaData.daysToOvulation })}`}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Pic d'ovulation */}
            <Card className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-4 border-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-indigo-400 rounded-xl flex items-center justify-center">
                  <Egg className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 font-semibold">{t('calculator.ovulationPeak', 'Pic d\'ovulation')}</p>
                  <p className="text-xl font-bold text-sky-600">{formatDateFull(agendaData.ovulationDate)}</p>
                  {agendaData.daysToOvulation > 0 && !agendaData.isOvulationDay && (
                    <p className="text-xs text-slate-500">{t('calculator.inDays', { days: agendaData.daysToOvulation })}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Fenêtre de fertilité */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 font-semibold">{t('calculator.fertileWindow', 'Fenêtre de fertilité')}</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {t('calculator.from', 'Du')} {formatDateShort(agendaData.fertileStart)} {t('calculator.to', 'au')} {formatDateShort(agendaData.fertileEnd)}
                  </p>
                  <p className="text-xs text-slate-500">{t('calculator.favorableDays', 'jours les plus fertiles')}</p>
                </div>
              </div>
              
              {/* Conseil test d'ovulation */}
              <div className="mt-3 pt-3 border-t border-emerald-100">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div className="flex-1">
                    <p className="text-xs text-emerald-700 font-medium">
                      {t('fertility.clearblueAdvice', 'Pensez au test d\'ovulation Clearblue Digital pour identifier vos jours les plus fertiles')}
                    </p>
                  </div>
                  <a 
                    href="https://fr.clearblue.com/tests-ovulation" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow border border-emerald-200"
                    title={t('common.info')}
                  >
                    <Info className="w-4 h-4 text-emerald-600" />
                  </a>
                </div>
              </div>
            </Card>

            {/* Prochaines règles */}
            <Card className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 border-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-400 rounded-xl flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 font-semibold">{t('fertility.nextPeriod', 'Prochaines règles')}</p>
                  <p className="text-xl font-bold text-pink-600">{formatDateFull(agendaData.nextPeriod)}</p>
                  {agendaData.daysToNextPeriod > 0 && (
                    <p className="text-xs text-slate-500">{t('calculator.inDays', { days: agendaData.daysToNextPeriod })}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Nidation estimée si rapports enregistrés DANS LA FENÊTRE DE FERTILITÉ */}
            {(() => {
              const implantation = getNextImplantation();
              if (!implantation || !agendaData) return null;
              
              // Vérifier si le rapport est dans la fenêtre de fertilité
              const rapportDate = new Date(implantation.rapportDate);
              const fertileStart = new Date(agendaData.fertileStart);
              const fertileEnd = new Date(agendaData.fertileEnd);
              
              const isInFertileWindow = rapportDate >= fertileStart && rapportDate <= fertileEnd;
              
              if (!isInFertileWindow) return null;
              
              return (
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                      <Baby className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 font-semibold">{t('fertility.estimatedImplantation', 'Nidation estimée')}</p>
                      <p className="text-lg font-bold text-amber-600">
                        {t('calculator.from', 'Du')} {formatDateShort(implantation.early)} {t('calculator.to', 'au')} {formatDateShort(implantation.late)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t('fertility.basedOnIntercourse', 'Basé sur le rapport du')} {formatDateShort(implantation.rapportDate)} ({t('fertility.fertileWindow', 'période fertile')})
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Rapports enregistrés */}
            {rapportDates && rapportDates.length > 0 && (
              <Card className="bg-rose-50 rounded-2xl p-4 border-0">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <span className="text-base font-semibold text-rose-700">{t('fertility.recordedIntercourse', 'Rapports enregistrés')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rapportDates.slice(-5).map((date, index) => (
                    <span key={index} className="bg-white text-rose-600 text-sm px-3 py-1.5 rounded-full border border-rose-200">
                      {formatDateShort(date)}
                    </span>
                  ))}
                  {rapportDates.length > 5 && (
                    <span className="text-sm text-rose-500 self-center">+{rapportDates.length - 5}</span>
                  )}
                </div>
              </Card>
            )}

            {/* Info cycle */}
            <div className="text-center pt-2">
              <p className="text-sm text-slate-400">
                {t('home.cycleLength', 'Durée du cycle')}: {agendaData.cycleLength} {t('home.days', 'jours')} • {t('home.lastPeriodDate', 'Dernières règles')}: {formatDateShort(lastPeriodDate)}
              </p>
            </div>
          </div>
        ) : (
          <Card className="bg-white rounded-3xl p-8 text-center border-0 shadow-lg">
            <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4 text-lg">{t('fertility.enterPeriodDate', 'Renseignez la date de vos dernières règles pour voir vos prévisions')}</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-8 py-3 text-lg"
            >
              {t('home.configureMyeCycle', 'Configurer mon cycle')}
            </Button>
          </Card>
        )}
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

export default CycleTrackingPage;

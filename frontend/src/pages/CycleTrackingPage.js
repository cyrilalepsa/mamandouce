import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarDays, Settings, Save, CalendarRange, Egg, Heart, Droplets, Baby, Info, TestTube, Moon, Sun, Sparkles, Plus, X, History, Brain, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import api from '../utils/api';
import FertilityCalendar from '../components/FertilityCalendar';
import { getCurrentLanguage } from '../i18n';
import { useTheme } from '../contexts/ThemeContext';
import { SYMPTOM_OPTIONS, MOOD_OPTIONS } from '../components/cycle/constants';
import { SymptomsModal } from '../components/cycle/SymptomsModal';
import { CycleHistoryModal } from '../components/cycle/CycleHistoryModal';
import { InitialSetupModal } from '../components/cycle/InitialSetupModal';
import { CycleReportModal } from '../components/cycle/CycleReportModal';
import { PregnancyToggle } from '../components/cycle/PregnancyToggle';

function CycleTrackingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const currentLang = getCurrentLanguage();
  const { isDarkMode } = useTheme();
  
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [agendaData, setAgendaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // Ouvrir le calendrier automatiquement si ?calendar=true dans l'URL
  const [showCalendar, setShowCalendar] = useState(searchParams.get('calendar') === 'true');
  const [rapportDates, setRapportDates] = useState([]);
  
  // Nouveaux états
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isPregnant, setIsPregnant] = useState(() => localStorage.getItem('mamandouce_pregnant') === 'true');
  const [dueDate, setDueDate] = useState(() => localStorage.getItem('mamandouce_due_date') || '');
  const [todaySymptoms, setTodaySymptoms] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [todayTemp, setTodayTemp] = useState('');
  const [symptomsHistory, setSymptomsHistory] = useState({});
  const [cycleHistory, setCycleHistory] = useState([]);
  
  // États pour l'IA des cycles
  const [useAICalculation, setUseAICalculation] = useState(true);
  const [cycleAnalysis, setCycleAnalysis] = useState(null);
  const [showIrregularBanner, setShowIrregularBanner] = useState(true);
  const [showInitialSetup, setShowInitialSetup] = useState(false);
  const [initialDates, setInitialDates] = useState(['', '', '']);
  const [showCycleReport, setShowCycleReport] = useState(false);
  const [cycleReport, setCycleReport] = useState(null);
  
  // Couleurs mode sombre - BLANC PUR pour lisibilité maximale
  const cardBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';
  const cardBgGradient = isDarkMode ? 'bg-slate-800' : '';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-700';
  const textSecondary = isDarkMode ? 'text-white' : 'text-slate-600';
  const textMuted = isDarkMode ? 'text-white/90' : 'text-slate-500';
  const inputBg = isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200';
  const dropdownBg = isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-700';
  
  // Ombre de texte obligatoire pour lisibilité sur fond glossy
  const textShadow = isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {};
  
  // Couleurs thématiques avec luminosité augmentée pour mode sombre
  const getThemeColor = (baseColor, darkColor) => isDarkMode ? darkColor : baseColor;

useEffect(() => {
    loadCycleData();
    loadRapportDates();

    // 🎯 Détection universelle du paramètre ?calendar=true
    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar') === 'true') {
      setShowCalendar(true);
    }
  }, []); // 👈 On laisse le tableau vide pour que ça ne s'exécute qu'UNE SEULE FOIS au chargement

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
    } finally {
      setInitialLoading(false);
    }
  };
  
  // Charger l'analyse IA des cycles
  const loadCycleAnalysis = async () => {
    try {
      const response = await api.get('/api/cycle/intelligence');
      if (response.data && response.data.analysis) {
        setCycleAnalysis(response.data.analysis);
        
        // Si pas assez de données ET jamais configuré, proposer la configuration
        if (!response.data.analysis.has_enough_data) {
          const alreadySetup = localStorage.getItem('cycle_initial_setup_done');
          if (!alreadySetup) {
            setShowInitialSetup(true);
          }
        } else if (response.data.analysis.recommended_cycle_length) {
          // Mettre à jour la durée recommandée par l'IA
          setCycleLength(response.data.analysis.recommended_cycle_length);
        }
      }
    } catch (error) {
      console.error('Erreur chargement analyse IA:', error);
    }
  };
  
  // Vérifier si la bannière doit être affichée
  const checkBannerStatus = async () => {
    try {
      const response = await api.get('/api/cycle/banner-status');
      setShowIrregularBanner(response.data?.show_banner !== false);
    } catch (error) {
      console.error('Erreur statut bannière:', error);
    }
  };
  
  // Masquer la bannière d'irrégularité
  const dismissBanner = async () => {
    try {
      await api.post('/api/cycle/dismiss-banner');
      setShowIrregularBanner(false);
      toast.success('Bannière masquée');
    } catch (error) {
      console.error('Erreur masquage bannière:', error);
    }
  };
  
  // Sauvegarder les dates initiales pour l'IA
  const saveInitialDates = async () => {
    const validDates = initialDates.filter(d => d);
    if (validDates.length < 2) {
      toast.error('Entrez au moins 2 dates de règles');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/api/cycle/history/initial', {
        period_dates: validDates
      });
      
      if (response.data?.success) {
        toast.success('Historique enregistré ! L\'IA analyse vos cycles...');
        setCycleAnalysis(response.data.analysis);
        setShowInitialSetup(false);
        localStorage.setItem('cycle_initial_setup_done', 'true');
        
        // Mettre à jour la durée de cycle recommandée
        if (response.data.analysis?.recommended_cycle_length) {
          setCycleLength(response.data.analysis.recommended_cycle_length);
        }
      }
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger le rapport de cycle
  const loadCycleReport = async () => {
    try {
      const response = await api.get(`/api/cycle/report?current_cycle_length=${cycleLength}`);
      if (response.data) {
        setCycleReport(response.data);
        setShowCycleReport(true);
      }
    } catch (error) {
      console.error('Erreur chargement rapport:', error);
    }
  };

  const calculateAgendaDates = (periodDate, cycle, analysis = cycleAnalysis) => {
    if (!periodDate) return;
    
    const lastPeriod = new Date(periodDate);
    const cycleLen = cycle || 28;
    const lutealPhase = 14;
    const ovulationDay = cycleLen - lutealPhase;
    
    // Marge de sécurité pour cycles irréguliers
    const isIrregular = analysis?.is_irregular || false;
    const safetyMargin = isIrregular ? (analysis?.safety_margin || 2) : 0;
    
    const ovulationDate = new Date(lastPeriod);
    ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
    
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5 - safetyMargin);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1 + safetyMargin);
    
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLen);
    
    const today = new Date();
    let adjustedOvulation = ovulationDate;
    let adjustedFertileStart = fertileStart;
    let adjustedFertileEnd = fertileEnd;
    let adjustedNextPeriod = nextPeriod;
    let adjustedLastPeriod = new Date(lastPeriod);
    
    while (adjustedNextPeriod < today) {
      adjustedOvulation.setDate(adjustedOvulation.getDate() + cycleLen);
      adjustedFertileStart.setDate(adjustedFertileStart.getDate() + cycleLen);
      adjustedFertileEnd.setDate(adjustedFertileEnd.getDate() + cycleLen);
      adjustedLastPeriod.setDate(adjustedLastPeriod.getDate() + cycleLen);
      adjustedNextPeriod.setDate(adjustedNextPeriod.getDate() + cycleLen);
    }
    
    const inFertileWindow = today >= adjustedFertileStart && today <= adjustedFertileEnd;
    const isOvulationDay = today.toDateString() === adjustedOvulation.toDateString();
    const daysToOvulation = Math.ceil((adjustedOvulation - today) / (1000 * 60 * 60 * 24));
    const daysToNextPeriod = Math.ceil((adjustedNextPeriod - today) / (1000 * 60 * 60 * 24));
    
    // Calcul du jour actuel du cycle
    const dayOfCycle = Math.floor((today - adjustedLastPeriod) / (1000 * 60 * 60 * 24)) + 1;
    
    // Phase du cycle
    const phase = dayOfCycle <= ovulationDay ? 'follicular' : 'luteal';
    
    // Date de test de grossesse recommandée (1 jour après les règles prévues)
    const testDate = new Date(adjustedNextPeriod);
    testDate.setDate(testDate.getDate() + 1);
    
    // Plages de dates pour cycles irréguliers
    let ovulationRange = null;
    let nextPeriodRange = null;
    
    if (isIrregular && safetyMargin > 0) {
      const ovulationStart = new Date(adjustedOvulation);
      ovulationStart.setDate(ovulationStart.getDate() - safetyMargin);
      const ovulationEnd = new Date(adjustedOvulation);
      ovulationEnd.setDate(ovulationEnd.getDate() + safetyMargin);
      ovulationRange = { start: ovulationStart, end: ovulationEnd };
      
      const periodStart = new Date(adjustedNextPeriod);
      periodStart.setDate(periodStart.getDate() - safetyMargin);
      const periodEnd = new Date(adjustedNextPeriod);
      periodEnd.setDate(periodEnd.getDate() + safetyMargin);
      nextPeriodRange = { start: periodStart, end: periodEnd };
    }
    
    setAgendaData({
      ovulationDate: adjustedOvulation,
      ovulationRange,
      fertileStart: adjustedFertileStart,
      fertileEnd: adjustedFertileEnd,
      nextPeriod: adjustedNextPeriod,
      nextPeriodRange,
      inFertileWindow,
      isOvulationDay,
      daysToOvulation: daysToOvulation > 0 ? daysToOvulation : 0,
      daysToNextPeriod: daysToNextPeriod > 0 ? daysToNextPeriod : 0,
      cycleLength: cycleLen,
      dayOfCycle: dayOfCycle > 0 ? dayOfCycle : 1,
      phase,
      testDate,
      lastPeriodAdjusted: adjustedLastPeriod,
      isIrregular,
      safetyMargin
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
      
      // Sauvegarder dans l'historique des cycles
      saveCycleToHistory(lastPeriodDate, cycleLength);
      
      calculateAgendaDates(lastPeriodDate, cycleLength);
      toast.success(t('common.saved', 'Enregistré !'));
      setShowForm(false);
    } catch (error) {
      toast.error(t('common.error', 'Erreur'));
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'historique des cycles
  const loadCycleHistory = () => {
    const saved = localStorage.getItem('mamandouce_cycle_history');
    if (saved) {
      setCycleHistory(JSON.parse(saved));
    }
  };

  const saveCycleToHistory = (periodDate, length) => {
    const newEntry = {
      id: Date.now(),
      startDate: periodDate,
      cycleLength: length,
      recordedAt: new Date().toISOString()
    };
    
    const updated = [newEntry, ...cycleHistory.filter(c => c.startDate !== periodDate)].slice(0, 12);
    setCycleHistory(updated);
    localStorage.setItem('mamandouce_cycle_history', JSON.stringify(updated));
  };

  const deleteCycleFromHistory = (id) => {
    const updated = cycleHistory.filter(c => c.id !== id);
    setCycleHistory(updated);
    localStorage.setItem('mamandouce_cycle_history', JSON.stringify(updated));
    toast.success('Cycle supprimé');
  };

  // Gestion des symptômes
  const loadSymptoms = () => {
    const saved = localStorage.getItem('mamandouce_symptoms');
    if (saved) {
      const data = JSON.parse(saved);
      setSymptomsHistory(data);
      
      const today = new Date().toISOString().split('T')[0];
      if (data[today]) {
        setTodaySymptoms(data[today].symptoms || []);
        setTodayMood(data[today].mood || null);
        setTodayTemp(data[today].temperature || '');
      }
    }
  };

  const saveSymptoms = () => {
    const today = new Date().toISOString().split('T')[0];
    const updated = {
      ...symptomsHistory,
      [today]: {
        symptoms: todaySymptoms,
        mood: todayMood,
        temperature: todayTemp
      }
    };
    setSymptomsHistory(updated);
    localStorage.setItem('mamandouce_symptoms', JSON.stringify(updated));
    toast.success('Symptômes enregistrés !');
    setShowSymptomModal(false);
  };

  const toggleSymptom = (symptomId) => {
    if (todaySymptoms.includes(symptomId)) {
      setTodaySymptoms(todaySymptoms.filter(s => s !== symptomId));
    } else {
      setTodaySymptoms([...todaySymptoms, symptomId]);
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

  // Calculer la moyenne des cycles
  const getAverageCycleLength = () => {
    if (cycleHistory.length < 2) return null;
    const total = cycleHistory.reduce((sum, c) => sum + c.cycleLength, 0);
    return Math.round(total / cycleHistory.length);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-white/50'}`}
            data-testid="back-button"
          >
            <ArrowLeft className={`w-6 h-6 ${textSecondary}`} />
          </Button>
          <div className="flex-1">
            <h1 className={`text-2xl font-bold ${textPrimary}`} style={{ fontFamily: 'Nunito, sans-serif', ...textShadow }}>
              {t('home.cycleTracking', 'Suivi de cycles')}
            </h1>
            <p className={`text-sm ${textMuted}`} style={textShadow}>{t('fertility.trackYourCycle', 'Calendrier fertilité')}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Bouton rapport de cycle */}
            {cycleAnalysis?.has_enough_data && (
              <Button
                onClick={loadCycleReport}
                className={`rounded-full p-2 ${isDarkMode ? 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800/50' : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-600 hover:from-emerald-200 hover:to-green-200'}`}
                title="Voir le bilan du cycle"
                data-testid="cycle-report-btn"
              >
                <TrendingUp className="w-5 h-5" />
              </Button>
            )}
            <Button
              onClick={() => setShowCalendar(true)}
              className={`rounded-full p-2 ${isDarkMode ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50' : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 hover:from-purple-200 hover:to-pink-200'}`}
              title={t('fertility.openCalendar', 'Ouvrir le calendrier')}
              data-testid="open-calendar-btn"
            >
              <CalendarRange className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className={`rounded-full p-2 ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title={t('common.edit')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Bannière cycle irrégulier détecté */}
        {showIrregularBanner && cycleAnalysis?.is_irregular && (
          <Card className={`rounded-2xl p-4 mb-4 border ${isDarkMode ? 'bg-amber-900/30 border-amber-700' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-amber-800/50' : 'bg-amber-100'}`}>
                <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`} style={textShadow}>
                  Cycle irrégulier détecté
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-amber-200/80' : 'text-amber-700'}`} style={textShadow}>
                  J'ajuste vos fenêtres de fertilité avec une marge de sécurité de {cycleAnalysis.safety_margin} jour{cycleAnalysis.safety_margin > 1 ? 's' : ''}.
                </p>
              </div>
              <Button
                onClick={dismissBanner}
                variant="ghost"
                className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-amber-800/50 text-amber-400' : 'hover:bg-amber-200 text-amber-600'}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Formulaire de configuration */}
        {showForm && (
          <Card className={`rounded-2xl p-4 mb-4 space-y-4 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-0'}`}>
            {/* Toggle IA vs Manuel */}
            <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white/70'}`}>
              <div className="flex items-center gap-2">
                <Brain className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className={`font-medium ${textPrimary}`} style={textShadow}>Calcul automatique par IA</span>
              </div>
              <button
                onClick={() => setUseAICalculation(!useAICalculation)}
                className={`relative w-12 h-6 rounded-full transition-colors ${useAICalculation ? 'bg-gradient-to-r from-purple-500 to-pink-500' : isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${useAICalculation ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            
            {/* Info IA */}
            {useAICalculation && cycleAnalysis?.has_enough_data && (
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-purple-900/30 border border-purple-800' : 'bg-purple-50 border border-purple-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`font-medium text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`} style={textShadow}>Analyse IA ({cycleAnalysis.cycle_count} cycles)</span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-purple-200/80' : 'text-purple-600'}`} style={textShadow}>
                  Durée moyenne : <strong>{cycleAnalysis.average_length}</strong> jours 
                  (variation : ±{cycleAnalysis.variation_days} jours)
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-purple-300/60' : 'text-purple-500'}`} style={textShadow}>
                  Score de régularité : {cycleAnalysis.regularity_score}%
                </p>
              </div>
            )}
            
            <div>
              <label className={`text-sm font-semibold ${textSecondary} mb-1 block`} style={textShadow}>
                {t('home.lastPeriodDate', 'Date de début des dernières règles')}
              </label>
              <Input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className={`rounded-xl ${inputBg}`}
                data-testid="period-date-input"
              />
            </div>
            
            {/* Sélecteur de durée - conditionnel */}
            {!useAICalculation && (
              <div>
                <label className={`text-sm font-semibold ${textSecondary} mb-1 block`} style={textShadow}>
                  {t('home.cycleLength', 'Durée du cycle')}
                </label>
                <select
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  className={`w-full rounded-xl border px-4 py-2 ${dropdownBg}`}
                  style={textShadow}
                  data-testid="cycle-length-select"
                >
                  {[24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map(days => (
                    <option key={days} value={days}>{days} {t('home.days', 'jours')} {days === 28 && `(${t('common.standard', 'standard')})`}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Affichage durée calculée par IA */}
            {useAICalculation && (
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white/70'}`}>
                <span className={`text-sm ${textSecondary}`} style={textShadow}>Durée calculée par l'IA :</span>
                <span className={`font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} style={textShadow}>
                  {cycleAnalysis?.recommended_cycle_length || cycleLength} jours
                </span>
              </div>
            )}
            
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
        {initialLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : agendaData ? (
          <div className="space-y-3">
            
            {/* NOUVEAU: Jour actuel du cycle + Phase */}
            <Card className={`rounded-xl p-3 border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-0'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-lg font-bold text-white" style={textShadow}>J{agendaData.dayOfCycle}</span>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-500'}`} style={textShadow}>Jour du cycle</p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`} style={textShadow}>
                      Jour {agendaData.dayOfCycle} sur {agendaData.cycleLength}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${
                  agendaData.phase === 'follicular' 
                    ? (isDarkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700')
                    : (isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700')
                }`}>
                  {agendaData.phase === 'follicular' ? (
                    <>
                      <Sun className="w-3 h-3" />
                      <span className="text-[10px] font-semibold" style={textShadow}>Folliculaire</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3 h-3" />
                      <span className="text-[10px] font-semibold" style={textShadow}>Lutéale</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Barre de progression du cycle */}
              <div className="mt-3">
                <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-white/60'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((agendaData.dayOfCycle / agendaData.cycleLength) * 100, 100)}%` }}
                  />
                </div>
                <div className={`flex justify-between mt-1 text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} style={textShadow}>
                  <span>Règles</span>
                  <span>Ovulation</span>
                  <span>Fin</span>
                </div>
              </div>
            </Card>

            {/* Alerte période fertile */}
            {agendaData.inFertileWindow && (
              <Card className={`rounded-xl p-3 border ${isDarkMode ? 'bg-rose-900/30 border-rose-800' : 'bg-gradient-to-r from-rose-100 to-pink-100 border-rose-200'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-rose-400 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm ${isDarkMode ? 'text-rose-300' : 'text-rose-700'}`} style={textShadow}>
                        {agendaData.isOvulationDay ? t('fertility.ovulationToday', "Jour d'ovulation !") : t('fertility.inFertileWindow', 'Période fertile !')}
                      </p>
                      <span className="animate-pulse w-2 h-2 bg-rose-500 rounded-full"></span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-rose-200' : 'text-rose-600'}`} style={textShadow}>
                      {agendaData.isOvulationDay 
                        ? t('calculator.ovulationTip', "C'est le moment idéal pour concevoir")
                        : `${t('calculator.ovulationPeak', 'Pic d\'ovulation')} ${t('calculator.inDays', { days: agendaData.daysToOvulation })}`}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Pic d'ovulation */}
            <Card className={`rounded-xl p-3 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-sky-50 to-indigo-50 border-0'}`}>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-indigo-400 rounded-lg flex items-center justify-center">
                  <Egg className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-500'}`} style={textShadow}>{t('calculator.ovulationPeak', 'Pic d\'ovulation')}</p>
                  {agendaData.ovulationRange ? (
                    <p className={`text-base font-bold ${isDarkMode ? 'text-sky-300' : 'text-sky-600'}`} style={textShadow}>
                      Du {formatDateShort(agendaData.ovulationRange.start)} au {formatDateShort(agendaData.ovulationRange.end)}
                    </p>
                  ) : (
                    <p className={`text-base font-bold ${isDarkMode ? 'text-sky-300' : 'text-sky-600'}`} style={textShadow}>{formatDateFull(agendaData.ovulationDate)}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Fenêtre de fertilité */}
            <Card className={`rounded-xl p-3 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-0'}`}>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-500'}`} style={textShadow}>{t('calculator.fertileWindow', 'Fenêtre de fertilité')}</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`} style={textShadow}>
                    {formatDateShort(agendaData.fertileStart)} → {formatDateShort(agendaData.fertileEnd)}
                  </p>
                </div>
              </div>
              
              {/* Conseil test d'ovulation */}
              <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-slate-700' : 'border-emerald-100'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">💡</span>
                  <p className={`text-[10px] flex-1 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`} style={textShadow}>
                    Test d'ovulation Clearblue Digital recommandé
                  </p>
                  <a 
                    href="https://fr.clearblue.com/tests-ovulation" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center shadow-sm border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-emerald-200'}`}
                  >
                    <Info className={`w-3 h-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </a>
                </div>
              </div>
            </Card>

            {/* Prochaines règles */}
            <Card className={`rounded-xl p-3 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-pink-50 to-rose-50 border-0'}`}>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-500'}`} style={textShadow}>{t('fertility.nextPeriod', 'Prochaines règles')}</p>
                  {agendaData.nextPeriodRange ? (
                    <p className={`text-base font-bold ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`} style={textShadow}>
                      Du {formatDateShort(agendaData.nextPeriodRange.start)} au {formatDateShort(agendaData.nextPeriodRange.end)}
                    </p>
                  ) : (
                    <p className={`text-base font-bold ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`} style={textShadow}>{formatDateFull(agendaData.nextPeriod)}</p>
                  )}
                  {agendaData.daysToNextPeriod > 0 && (
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} style={textShadow}>Dans {agendaData.daysToNextPeriod} jours</p>
                  )}
                </div>
              </div>
            </Card>

            {/* NOUVEAU: Date de test de grossesse */}
            <Card className={`rounded-xl p-3 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-cyan-50 to-sky-50 border-0'}`}>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <TestTube className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-500'}`} style={textShadow}>Test de grossesse fiable</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'}`} style={textShadow}>À partir du {formatDateFull(agendaData.testDate)}</p>
                </div>
              </div>
              <p className={`text-[10px] mt-2 pl-11 ${isDarkMode ? 'text-cyan-300/80' : 'text-cyan-700'}`} style={textShadow}>
                💡 Attendez 1 jour après le retard de règles pour un résultat fiable
              </p>
            </Card>

            {/* NOUVEAU: Bouton pour noter les symptômes */}
            <Card 
              onClick={() => setShowSymptomModal(true)}
              className={`rounded-xl p-3 border cursor-pointer hover:shadow-md transition-all active:scale-[0.98] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-0'}`}
              data-testid="symptoms-btn"
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-500'}`} style={textShadow}>Notez vos symptômes</p>
                  {todaySymptoms.length > 0 || todayMood ? (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {todayMood && (
                        <span className="text-sm">{MOOD_OPTIONS.find(m => m.id === todayMood)?.emoji}</span>
                      )}
                      {todaySymptoms.slice(0, 4).map(s => (
                        <span key={s} className="text-sm">{SYMPTOM_OPTIONS.find(opt => opt.id === s)?.emoji}</span>
                      ))}
                      {todaySymptoms.length > 4 && (
                        <span className={`text-[10px] self-center ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>+{todaySymptoms.length - 4}</span>
                      )}
                    </div>
                  ) : (
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`} style={textShadow}>Humeur, douleurs...</p>
                  )}
                </div>
                <Plus className={`w-5 h-5 ${isDarkMode ? 'text-amber-300' : 'text-amber-500'}`} />
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
                <Card className={`rounded-xl p-3 border ${isDarkMode ? 'bg-slate-800 border-amber-700' : 'bg-gradient-to-r from-orange-50 to-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-sky-500 rounded-lg flex items-center justify-center">
                      <Baby className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-500'}`} style={textShadow}>{t('fertility.estimatedImplantation', 'Nidation estimée')}</p>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`} style={textShadow}>
                        {formatDateShort(implantation.early)} → {formatDateShort(implantation.late)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Rapports enregistrés */}
            {rapportDates && rapportDates.length > 0 && (
              <Card className={`rounded-xl p-3 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-rose-50 border-0'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className={`w-4 h-4 ${isDarkMode ? 'text-rose-400' : 'text-rose-500'}`} />
                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-rose-300' : 'text-rose-700'}`} style={textShadow}>{t('fertility.recordedIntercourse', 'Rapports enregistrés')}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {rapportDates.slice(-5).map((date, index) => (
                    <span key={index} className="text-xs px-2 py-1 rounded-full border" style={{ background: '#ffffff', color: '#ef4444', borderColor: '#fecaca', fontWeight: 600 }}>
                      {formatDateShort(date)}
                    </span>
                  ))}
                  {rapportDates.length > 5 && (
                    <span className={`text-xs self-center ${isDarkMode ? 'text-rose-400' : 'text-rose-500'}`}>+{rapportDates.length - 5}</span>
                  )}
                </div>
              </Card>
            )}

            {/* NOUVEAU: Historique des cycles */}
            {cycleHistory.length > 0 && (
              <Card 
                onClick={() => setShowHistoryModal(true)}
                className={`rounded-xl p-3 border cursor-pointer hover:shadow-md transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-slate-50 to-gray-50 border-0'}`}
                data-testid="history-btn"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-500'}`} style={textShadow}>Historique des cycles</p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`} style={textShadow}>
                      {cycleHistory.length} cycle{cycleHistory.length > 1 ? 's' : ''}
                      {getAverageCycleLength() && <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}> • Moy: {getAverageCycleLength()}j</span>}
                    </p>
                  </div>
                  <CalendarDays className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                </div>
              </Card>
            )}

            {/* Info cycle */}
            <div className="text-center pt-1">
              <p className="text-xs text-slate-400">
                Cycle: {agendaData.cycleLength}j • Dernières règles: {formatDateShort(lastPeriodDate)}
              </p>

            {/* Bouton "Je suis enceinte !" + Affichage DPA — composant extrait */}
            <PregnancyToggle
              isPregnant={isPregnant}
              dueDate={dueDate}
              lastPeriodDate={lastPeriodDate}
              onPregnant={(dpaStr) => {
                setIsPregnant(true);
                setDueDate(dpaStr);
              }}
            />
            </div>
          </div>
        ) : (
          <Card className="bg-white rounded-2xl p-6 text-center border-0 shadow-lg">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-3 text-sm">{t('fertility.enterPeriodDate', 'Renseignez la date de début de vos dernières règles pour voir vos prévisions')}</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2 text-sm"
            >
              {t('home.configureMyeCycle', 'Configurer mon cycle')}
            </Button>
          </Card>
        )}
      </div>


      {/* Modal Symptômes (composant extrait) */}
      <SymptomsModal
        isOpen={showSymptomModal}
        onClose={() => setShowSymptomModal(false)}
        isDarkMode={isDarkMode}
        textShadow={textShadow}
        todayMood={todayMood}
        setTodayMood={setTodayMood}
        todaySymptoms={todaySymptoms}
        toggleSymptom={toggleSymptom}
        todayTemp={todayTemp}
        setTodayTemp={setTodayTemp}
        onSave={saveSymptoms}
      />

      {/* Modal Historique des cycles (composant extrait) */}
      <CycleHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        isDarkMode={isDarkMode}
        textShadow={textShadow}
        cycleHistory={cycleHistory}
        averageCycleLength={getAverageCycleLength()}
        onDelete={deleteCycleFromHistory}
        getLocale={getLocale}
      />

      {/* Calendrier Modal */}
      <FertilityCalendar
        isOpen={showCalendar}
        onClose={() => {
          setShowCalendar(false);
          // Si on est venu directement au calendrier via ?calendar=true, revenir à la page précédente
          if (searchParams.get('calendar') === 'true') {
            navigate(-1);
          }
        }}
        agendaData={agendaData}
        rapportDates={rapportDates}
        onAddRapport={handleAddRapport}
        onRemoveRapport={handleRemoveRapport}
      />
      

      {/* Modal Configuration Initiale IA (composant extrait) */}
      <InitialSetupModal
        isOpen={showInitialSetup}
        onSkip={() => { setShowInitialSetup(false); localStorage.setItem('cycle_initial_setup_done', 'true'); }}
        onSave={saveInitialDates}
        isDarkMode={isDarkMode}
        textShadow={textShadow}
        textSecondary={textSecondary}
        textMuted={textMuted}
        inputBg={inputBg}
        initialDates={initialDates}
        setInitialDates={setInitialDates}
        loading={loading}
      />

      {/* Modal Rapport de Cycle (composant extrait) */}
      <CycleReportModal
        isOpen={showCycleReport}
        onClose={() => setShowCycleReport(false)}
        isDarkMode={isDarkMode}
        textShadow={textShadow}
        textSecondary={textSecondary}
        textMuted={textMuted}
        cycleReport={cycleReport}
      />
    </div>
  );
}

export default CycleTrackingPage;

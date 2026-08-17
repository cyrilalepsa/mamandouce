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
import {
  buildCycleSavePayload,
  extractApiErrorDetail,
  parseHabitualLength,
  toYearMonthDay,
} from '../utils/cycleForm';
import confetti from 'canvas-confetti';

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
    // 🎯 Détection du paramètre ?calendar=true
    const params = new URLSearchParams(window.location.search);
    const openCalendar = params.get('calendar') === 'true';
    if (openCalendar) {
      setShowCalendar(true);
    }

    // Toujours charger les données cycle (sinon calendrier sans couleurs/légende utile)
    loadCycleData();
    loadRapportDates();
  }, []);

  // 🔥 NOM CORRIGÉ : "loadCycleData" pour correspondre au useEffect
  const loadCycleData = async () => {
    try {
      const profileRes = await api.pregnancy.getProfile();
      if (profileRes.data && profileRes.data.last_period_date) {
        const ymd = toYearMonthDay(profileRes.data.last_period_date);
        const length = parseHabitualLength(profileRes.data.cycle_length, 28);
        setLastPeriodDate(ymd);
        setCycleLength(length);
        calculateAgendaDates(ymd, length);
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
    const habitualLength = cycleLength;
    const payload = buildCycleSavePayload(lastPeriodDate, parseInt(habitualLength, 10));

    if (!payload.valid) {
      if (payload.errors.includes('date')) {
        toast.error(t('fertility.enterPeriodDate'));
      } else {
        toast.error(t('fertility.invalidCycleLength', 'Durée du cycle invalide (21 à 45 jours)'));
      }
      return;
    }

    setLoading(true);
    try {
      await api.pregnancy.calculate({
        last_period_date: payload.last_period_date,
        cycle_length: payload.cycle_length,
      });

      setLastPeriodDate(payload.last_period_date);
      setCycleLength(payload.cycle_length);
      saveCycleToHistory(payload.last_period_date, payload.cycle_length);
      calculateAgendaDates(payload.last_period_date, payload.cycle_length);
      toast.success(t('common.saved', 'Enregistré !'));
      setShowForm(false);
    } catch (error) {
      console.error('Erreur enregistrement cycle:', error);
      toast.error(
        extractApiErrorDetail(error) || t('common.error', 'Erreur'),
      );
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
            onClick={() => navigate('/')}
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
              className={`rounded-full p-2 ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-700 shadow-sm'}`}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Bannière d'irrégularité */}
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
              <Button onClick={dismissBanner} variant="ghost" className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-amber-800/50 text-amber-400' : 'hover:bg-amber-200 text-amber-600'}`}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Formulaire de configuration */}
        {showForm && (
          <Card className={`rounded-2xl p-4 mb-4 space-y-4 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-0'}`}>
            <div className={`flex flex-col gap-2`}>
              <label className={`text-sm font-medium ${textSecondary}`}>Date des dernières règles :</label>
              <Input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(toYearMonthDay(e.target.value))}
                className={inputBg}
                data-testid="cycle-period-input"
              />
            </div>
            <div className={`flex flex-col gap-2`}>
              <label className={`text-sm font-medium ${textSecondary}`}>Durée habituelle du cycle (jours) :</label>
              <Input
                type="number"
                min={21}
                max={45}
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value, 10) || 28)}
                className={inputBg}
                data-testid="cycle-length-input"
              />
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-2" data-testid="save-button">
              <Save className="w-4 h-4 mr-2" />
              {loading ? t('common.sending', 'Envoi...') : t('common.save', 'Enregistrer')}
            </Button>
          </Card>
        )}

        {/* Contenu principal de l'agenda */}
        {initialLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : agendaData ? (
          <div className="space-y-4">
            {/* Infos clés du cycle */}
            <Card className={`rounded-xl p-4 border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-0'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-500'}`}>Jour du cycle</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Jour {agendaData.dayOfCycle} sur {agendaData.cycleLength}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                  J{agendaData.dayOfCycle}
                </div>
              </div>
            </Card>

            {/* Boutons d'historique et symptômes */}
            <div className="grid grid-cols-2 gap-3">
              <Card onClick={() => setShowSymptomModal(true)} className="rounded-xl p-3 border cursor-pointer hover:shadow-md transition-all text-center bg-white border-slate-100">
                <Sparkles className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Symptômes</span>
              </Card>
              <Card onClick={() => setShowHistoryModal(true)} className="rounded-xl p-3 border cursor-pointer hover:shadow-md transition-all text-center bg-white border-slate-100">
                <History className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Historique</span>
              </Card>
            </div>

            {/* Info cycle & Bouton "Je suis enceinte" */}
            <div className="text-center pt-2">
              <p className={`text-xs ${textMuted} mb-3`}>
                Cycle: {agendaData.cycleLength}j • Dernières règles: {formatDateShort(lastPeriodDate)}
              </p>

              {/* 🎯 INTEGRATION DE L'EFFET COMBINÉ (Cœurs + Scintillements) */}
              <PregnancyToggle
                isPregnant={isPregnant}
                dueDate={dueDate}
                lastPeriodDate={lastPeriodDate}
                onPregnant={(dpaStr) => {
                  setIsPregnant(true);
                  setDueDate(dpaStr);

                  // 🚀 1. LES JETS DE COEURS
                  const scalar = 2;
                  const heart1 = confetti.shapeFromText({ text: '❤️', scalar });
                  const heart2 = confetti.shapeFromText({ text: '💖', scalar });
                  const heart3 = confetti.shapeFromText({ text: '💝', scalar });

                  const defaults = {
                    spread: 360,
                    ticks: 140,
                    gravity: 0.45,
                    decay: 0.94,
                    startVelocity: 35,
                    shapes: [heart1, heart2, heart3],
                    scalar
                  };
                  confetti({ ...defaults, particleCount: 45, origin: { y: 0.6 } });
                  confetti({ ...defaults, particleCount: 25, angle: 60, spread: 70, origin: { x: 0.05, y: 0.8 } });
                  confetti({ ...defaults, particleCount: 25, angle: 120, spread: 70, origin: { x: 0.95, y: 0.8 } });

                  // ✨ 2. LES 8 SCINTILLEMENTS FIXES
                  const sparkleContainer = document.createElement('div');
                  sparkleContainer.style.position = 'fixed';
                  sparkleContainer.style.top = '0';
                  sparkleContainer.style.left = '0';
                  sparkleContainer.style.width = '100vw';
                  sparkleContainer.style.height = '100vh';
                  sparkleContainer.style.pointerEvents = 'none';
                  sparkleContainer.style.zIndex = '9999';
                  document.body.appendChild(sparkleContainer);

                  if (!document.getElementById('sparkle-animation-style')) {
                    const style = document.createElement('style');
                    style.id = 'sparkle-animation-style';
                    style.innerHTML = `
                      @keyframes sparkleGlow {
                        0%, 100% { transform: scale(0.6); opacity: 0.3; }
                        50% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 10px #fff, 0 0 20px rgba(255,255,255,0.8); }
                      }
                    `;
                    document.head.appendChild(style);
                  }

                  const sparkles = [
                    ['5%','50%',5],  ['10%','90%',4], ['25%','5%',5],  ['50%','95%',6],
                    ['75%','5%',4],  ['90%','85%',5], ['50%','12%',4], ['15%','15%',6]
                  ];

                  sparkles.forEach(([t, l, s], i) => {
                    const el = document.createElement('div');
                    el.style.position = 'absolute';
                    el.style.top = t;
                    el.style.left = l;
                    el.style.width = `${s}px`;
                    el.style.height = `${s}px`;
                    el.style.background = '#ffffff';
                    el.style.borderRadius = '50%';
                    el.style.boxShadow = '0 0 4px #fff, 0 0 8px rgba(255,255,255,0.6)';
                    el.style.animation = `sparkleGlow ${1.8 + (i % 3) * 0.4}s ease-in-out infinite`;
                    el.style.animationDelay = `${(i * 0.3) % 2}s`;
                    sparkleContainer.appendChild(el);
                  });

                  setTimeout(() => {
                    sparkleContainer.style.transition = 'opacity 1s ease-out';
                    sparkleContainer.style.opacity = '0';
                    setTimeout(() => sparkleContainer.remove(), 1000);
                  }, 4000);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">Configurez votre cycle pour commencer.</div>
        )}
      </div>

      {/* Modals de l'application */}
      <FertilityCalendar
        isOpen={showCalendar}
        onClose={() => {
          setShowCalendar(false);
          // Si ouvert depuis la carte « Fête du jour », retour accueil
          if (searchParams.get('calendar') === 'true') {
            navigate('/');
          }
        }}
        agendaData={agendaData}
        rapportDates={rapportDates}
        onAddRapport={handleAddRapport}
        onRemoveRapport={handleRemoveRapport}
      />
      <SymptomsModal
        isOpen={showSymptomModal}
        onClose={() => setShowSymptomModal(false)}
        onSave={saveSymptoms}
        symptoms={todaySymptoms}
        toggleSymptom={toggleSymptom}
        mood={todayMood}
        setMood={setTodayMood}
        temperature={todayTemp}
        setTemperature={setTodayTemp}
        isDarkMode={isDarkMode}
      />
      <CycleHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={cycleHistory}
        averageCycleLength={getAverageCycleLength()}
        onDelete={deleteCycleFromHistory}
        getLocale={getLocale}
      />
      <InitialSetupModal
        isOpen={showInitialSetup}
        onSkip={() => { setShowInitialSetup(false); localStorage.setItem('cycle_initial_setup_done', 'true'); }}
        onSave={saveInitialDates}
        isDarkMode={isDarkMode}
        initialDates={initialDates}
        setInitialDates={setInitialDates}
        loading={loading}
      />
      <CycleReportModal
        isOpen={showCycleReport}
        onClose={() => setShowCycleReport(false)}
        isDarkMode={isDarkMode}
        cycleReport={cycleReport}
      />
    </div>
  );
}

export default CycleTrackingPage;
 
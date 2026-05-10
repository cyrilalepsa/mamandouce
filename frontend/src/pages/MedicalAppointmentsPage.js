import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Stethoscope, Scan, TestTube, Baby, Activity, UserCog, Check, Calendar, Clock, AlertTriangle, ChevronDown, ChevronUp, Edit3, Save, X, Heart, Scale, Ruler, Bell, BellOff, Lock, Crown } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import { useSubscription } from '../components/SubscriptionGate';

function MedicalAppointmentsPage() {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const [appointments, setAppointments] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [allNotes, setAllNotes] = useState({});
  const [expandedTrimesters, setExpandedTrimesters] = useState({ 1: false, 2: false, 3: false });
  const [noteForm, setNoteForm] = useState({
    weight: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    baby_heartbeat: '',
    baby_weight: '',
    baby_size: '',
    notes: '',
    doctor_name: ''
  });
  const [scheduledReminders, setScheduledReminders] = useState({});
  const [settingReminder, setSettingReminder] = useState(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderType, setReminderType] = useState('both'); // push, email, both
  const [showAutoReminderSuggestion, setShowAutoReminderSuggestion] = useState(null);

  useEffect(() => {
    loadAppointments();
    loadAllNotes();
    loadScheduledReminders();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.medical.getAppointments();
      const apts = response.data.appointments || [];
      setAppointments(apts);
      setCurrentWeek(response.data.current_week || 1);
      
      // Check for "current" appointments that don't have reminders - show suggestion
      const currentApt = apts.find(a => a.status === 'current' && !a.is_completed);
      if (currentApt) {
        // Will check for existing reminder after loading them
        setTimeout(() => {
          setShowAutoReminderSuggestion(prev => {
            // Only suggest if no reminder exists for this appointment
            return prev;
          });
        }, 500);
      }
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllNotes = async () => {
    try {
      const response = await api.medical.getAllNotes();
      setAllNotes(response.data || {});
    } catch (error) {
      console.error('Erreur chargement notes:', error);
    }
  };

  const loadScheduledReminders = async () => {
    try {
      const response = await api.medical.getScheduledReminders();
      const remindersMap = {};
      (response.data.reminders || []).forEach(r => {
        remindersMap[r.appointment_id] = r;
      });
      setScheduledReminders(remindersMap);
      
      // Check if there's a "current" appointment without reminder
      const currentApt = appointments.find(a => a.status === 'current' && !a.is_completed);
      if (currentApt && !remindersMap[currentApt.id]) {
        setShowAutoReminderSuggestion(currentApt.id);
      }
    } catch (error) {
      console.error('Erreur chargement rappels:', error);
    }
  };

  const scheduleReminder = async (appointmentId, autoSuggest = false) => {
    if (!reminderDate && !autoSuggest) {
      toast.error('Veuillez sélectionner une date');
      return;
    }
    
    let dateToUse = reminderDate;
    if (autoSuggest) {
      // For auto-suggest, use tomorrow at 9am
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateToUse = tomorrow.toISOString().split('T')[0];
    }
    
    const reminderDatetime = `${dateToUse}T${reminderTime}:00`;
    
    try {
      await api.medical.scheduleReminder(appointmentId, reminderDatetime, reminderType);
      toast.success('Rappel programmé !');
      setSettingReminder(null);
      setReminderDate('');
      setShowAutoReminderSuggestion(null);
      loadScheduledReminders();
    } catch (error) {
      toast.error('Erreur lors de la programmation');
    }
  };

  const deleteReminder = async (appointmentId) => {
    try {
      await api.medical.deleteReminder(appointmentId);
      toast.success('Rappel supprimé');
      loadScheduledReminders();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleComplete = async (appointmentId, isCompleted) => {
    try {
      if (isCompleted) {
        await api.medical.unmarkComplete(appointmentId);
        toast.success('Rendez-vous marqué comme à faire');
      } else {
        await api.medical.markComplete(appointmentId);
        toast.success('Rendez-vous complété !');
      }
      loadAppointments();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const startEditingNotes = (apt) => {
    const existingNotes = allNotes[apt.id] || {};
    setNoteForm({
      weight: existingNotes.weight || '',
      blood_pressure_systolic: existingNotes.blood_pressure_systolic || '',
      blood_pressure_diastolic: existingNotes.blood_pressure_diastolic || '',
      baby_heartbeat: existingNotes.baby_heartbeat || '',
      baby_weight: existingNotes.baby_weight || '',
      baby_size: existingNotes.baby_size || '',
      notes: existingNotes.notes || '',
      doctor_name: existingNotes.doctor_name || ''
    });
    setEditingNotes(apt.id);
    setExpandedId(apt.id);
  };

  const cancelEditingNotes = () => {
    setEditingNotes(null);
    setNoteForm({
      weight: '',
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      baby_heartbeat: '',
      baby_weight: '',
      baby_size: '',
      notes: '',
      doctor_name: ''
    });
  };

  const saveNotes = async (appointmentId) => {
    try {
      const dataToSend = {
        weight: noteForm.weight ? parseFloat(noteForm.weight) : null,
        blood_pressure_systolic: noteForm.blood_pressure_systolic ? parseInt(noteForm.blood_pressure_systolic) : null,
        blood_pressure_diastolic: noteForm.blood_pressure_diastolic ? parseInt(noteForm.blood_pressure_diastolic) : null,
        baby_heartbeat: noteForm.baby_heartbeat ? parseInt(noteForm.baby_heartbeat) : null,
        baby_weight: noteForm.baby_weight ? parseFloat(noteForm.baby_weight) : null,
        baby_size: noteForm.baby_size ? parseFloat(noteForm.baby_size) : null,
        notes: noteForm.notes || null,
        doctor_name: noteForm.doctor_name || null
      };

      await api.medical.saveNotes(appointmentId, dataToSend);
      toast.success('Notes enregistrées !');
      setEditingNotes(null);
      loadAllNotes();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="w-5 h-5" />;
      case 'echographie':
        return <Scan className="w-5 h-5" />;
      case 'prise_sang':
        return <TestTube className="w-5 h-5" />;
      case 'preparation':
        return <Baby className="w-5 h-5" />;
      case 'monitoring':
        return <Activity className="w-5 h-5" />;
      default:
        return <UserCog className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'consultation':
        return 'bg-sky-100 text-sky-600 border-sky-200';
      case 'echographie':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'prise_sang':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'preparation':
        return 'bg-pink-100 text-pink-600 border-pink-200';
      case 'monitoring':
        return 'bg-amber-100 text-amber-600 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusStyle = (status, isCompleted) => {
    if (isCompleted) return 'bg-green-50 border-green-300';
    switch (status) {
      case 'current':
        return 'bg-amber-50 border-amber-300 border-2';
      case 'upcoming':
        return 'bg-white border-slate-200';
      case 'past':
        return 'bg-slate-50 border-slate-200 opacity-60';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long'
    });
  };

  const groupByTrimester = () => {
    const groups = {
      1: appointments.filter(a => a.week_start <= 13),
      2: appointments.filter(a => a.week_start > 13 && a.week_start <= 27),
      3: appointments.filter(a => a.week_start > 27)
    };
    return groups;
  };

  const trimesters = groupByTrimester();
  const completedCount = appointments.filter(a => a.is_completed).length;
  const currentCount = appointments.filter(a => a.status === 'current' && !a.is_completed).length;

  const toggleTrimester = (trimester) => {
    setExpandedTrimesters(prev => ({
      ...prev,
      [trimester]: !prev[trimester]
    }));
  };

  const getTrimesterStats = (trimester) => {
    const apts = trimesters[trimester] || [];
    const completed = apts.filter(a => a.is_completed).length;
    return { total: apts.length, completed };
  };

  const hasNotes = (aptId) => {
    const note = allNotes[aptId];
    return note && (note.weight || note.notes || note.baby_weight || note.blood_pressure_systolic);
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Rendez-vous médicaux" />

        {loading ? (
          <Card className="bg-white rounded-3xl p-8 text-center">
            <p className="text-slate-500">Chargement...</p>
          </Card>
        ) : appointments.length === 0 ? (
          <Card className="bg-white rounded-3xl p-8 text-center" data-testid="no-profile">
            <Calendar className="w-16 h-16 text-sky-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Configurez votre grossesse</h3>
            <p className="text-slate-500 mb-4">Utilisez le calculateur pour voir vos rendez-vous</p>
            <Button
              onClick={() => navigate('/calculator')}
              className="bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-6 py-2"
            >
              Configurer
            </Button>
          </Card>
        ) : (
          <>
            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-3xl p-6 border-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-600 font-medium">Semaine actuelle</p>
                  <p className="text-3xl font-bold text-sky-600">Semaine {currentWeek} SA</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600 font-medium">Progression</p>
                  <p className="text-2xl font-bold text-green-600">{completedCount}/{appointments.length}</p>
                </div>
              </div>
              
              {currentCount > 0 && (
                <div className="bg-amber-100 rounded-2xl p-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-800 font-medium">{currentCount} rendez-vous à planifier maintenant</span>
                </div>
              )}
              
              {/* Auto-reminder suggestion */}
              {showAutoReminderSuggestion && !scheduledReminders[showAutoReminderSuggestion] && (
                <div className="mt-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Bell className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-purple-800 text-sm">Programmer un rappel ?</h4>
                      <p className="text-purple-700 text-xs mt-1">
                        Vous avez un RDV à planifier. Voulez-vous recevoir un rappel demain matin ?
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={() => scheduleReminder(showAutoReminderSuggestion, true)}
                          data-testid="auto-reminder-accept"
                          className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-4 py-1.5 text-xs"
                        >
                          Oui, me rappeler
                        </Button>
                        <Button
                          onClick={() => setShowAutoReminderSuggestion(null)}
                          className="bg-white text-purple-600 rounded-full px-4 py-1.5 text-xs border border-purple-200"
                        >
                          Plus tard
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Trimester sections with collapsible headers - Style bombé nuage pastel */}
            {[1, 2, 3].map((trimester) => {
              const stats = getTrimesterStats(trimester);
              const isExpanded = expandedTrimesters[trimester];
              const trimesterColor = trimester === 1 ? 'sky' : trimester === 2 ? 'purple' : 'pink';
              const isLocked = !isPremium && trimester > 1;
              
              // Couleurs pastels par trimestre
              const colorStyles = {
                1: {
                  bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.95) 30%, rgba(186,230,253,0.85) 60%, rgba(125,211,252,0.7) 100%)',
                  shadow: 'rgba(56,189,248,0.25)',
                  border: 'rgba(56,189,248,0.35)',
                  iconBg: 'bg-sky-400',
                  text: 'text-sky-600'
                },
                2: {
                  bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(243,232,255,0.95) 30%, rgba(233,213,255,0.85) 60%, rgba(216,180,254,0.7) 100%)',
                  shadow: 'rgba(168,85,247,0.25)',
                  border: 'rgba(168,85,247,0.35)',
                  iconBg: 'bg-purple-400',
                  text: 'text-purple-600'
                },
                3: {
                  bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(252,231,243,0.95) 30%, rgba(251,207,232,0.85) 60%, rgba(249,168,212,0.7) 100%)',
                  shadow: 'rgba(236,72,153,0.25)',
                  border: 'rgba(236,72,153,0.35)',
                  iconBg: 'bg-pink-400',
                  text: 'text-pink-600'
                }
              };
              
              const style = colorStyles[trimester];
              
              return trimesters[trimester].length > 0 && (
                <div key={trimester}>
                  {/* Collapsible Trimester Header - Style bombé */}
                  <button
                    onClick={() => isLocked ? navigate('/pricing') : toggleTrimester(trimester)}
                    className={`relative overflow-hidden w-full flex items-center gap-3 mb-3 p-4 rounded-3xl transition-all hover:scale-[1.01] active:scale-[0.99] ${isLocked ? 'opacity-80' : ''}`}
                    style={{
                      background: isLocked 
                        ? 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.95) 50%, rgba(226,232,240,0.85) 100%)'
                        : style.bg,
                      boxShadow: `
                        0 8px 24px -4px ${isLocked ? 'rgba(100,116,139,0.15)' : style.shadow},
                        0 4px 8px -2px ${isLocked ? 'rgba(100,116,139,0.1)' : style.shadow},
                        inset 0 2px 4px rgba(255,255,255,0.9),
                        inset 0 -2px 4px ${isLocked ? 'rgba(100,116,139,0.05)' : style.shadow}
                      `,
                      border: `2px solid ${isLocked ? 'rgba(148,163,184,0.25)' : style.border}`
                    }}
                    data-testid={`toggle-trimestre-${trimester}`}
                  >
                    {/* Effet de reflet bombé */}
                    {/* Voile blanc supprimé */}
                    
                    {/* Icône avec bulle quasi-transparente */}
                    <div 
                      className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                      style={{
                        background: isLocked 
                          ? 'linear-gradient(135deg, rgba(148,163,184,0.3) 0%, rgba(148,163,184,0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)',
                        backdropFilter: 'none',
                        border: '1px solid rgba(255,255,255,0.4)',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)'
                      }}
                    >
                      {isLocked ? <Lock className={`w-5 h-5 ${isLocked ? 'text-slate-500' : style.text}`} /> : <span className={style.text}>T{trimester}</span>}
                    </div>
                    
                    <div className="relative flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h2 className={`text-lg font-bold ${isLocked ? 'text-slate-500' : style.text}`}>
                          {trimester === 1 ? '1er' : `${trimester}ème`} trimestre
                        </h2>
                        {isLocked && (
                          <span className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                            <Crown className="w-3 h-3" /> Premium
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isLocked ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isLocked 
                          ? 'Débloquez avec Premium pour voir ces rendez-vous' 
                          : `${stats.completed}/${stats.total} rendez-vous complétés`
                        }
                      </p>
                    </div>
                    {/* Progress indicator or lock */}
                    {isLocked ? (
                      <div className="relative flex items-center gap-2">
                        <span className="text-xs text-amber-600 font-medium">Voir</span>
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      </div>
                    ) : (
                      <div className="relative flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              trimester === 1 ? 'bg-sky-500' : trimester === 2 ? 'bg-purple-500' : 'bg-pink-500'
                            }`}
                            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                          style={{
                            background: isExpanded 
                              ? 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%)'
                              : 'rgba(255,255,255,0.3)',
                          }}
                        >
                          {isExpanded ? <ChevronUp className={`w-5 h-5 ${style.text}`} /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                        </div>
                      </div>
                    )}
                  </button>
                  
                  {/* Collapsible Content - only show if not locked */}
                  {!isLocked && (
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="space-y-3 mb-6">
                        {trimesters[trimester].map((apt) => (
                      <Card 
                        key={apt.id} 
                        className={`rounded-2xl p-4 border transition-all ${getStatusStyle(apt.status, apt.is_completed)}`}
                        data-testid={`appointment-${apt.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(apt.type)}`}>
                            {getIcon(apt.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-bold ${apt.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                    {apt.title}
                                  </h4>
                                  {hasNotes(apt.id) && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Notes</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>Semaines {apt.week_start}-{apt.week_end}</span>
                                  <span className="text-slate-300">•</span>
                                  <span>{formatDate(apt.start_date)} - {formatDate(apt.end_date)}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    if (scheduledReminders[apt.id]) {
                                      deleteReminder(apt.id);
                                    } else {
                                      setSettingReminder(apt.id);
                                      // Pre-fill with appointment start date
                                      const startDate = new Date(apt.start_date);
                                      startDate.setDate(startDate.getDate() - 1); // Day before
                                      setReminderDate(startDate.toISOString().split('T')[0]);
                                    }
                                  }}
                                  data-testid={`reminder-${apt.id}`}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    scheduledReminders[apt.id]
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                                  }`}
                                  title={scheduledReminders[apt.id] ? 'Supprimer le rappel' : 'Programmer un rappel'}
                                >
                                  {scheduledReminders[apt.id] ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => startEditingNotes(apt)}
                                  data-testid={`notes-${apt.id}`}
                                  className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"
                                  title="Ajouter des notes"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => toggleComplete(apt.id, apt.is_completed)}
                                  data-testid={`complete-${apt.id}`}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    apt.is_completed 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'
                                  }`}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {apt.status === 'current' && !apt.is_completed && (
                              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                <Clock className="w-3 h-3" />
                                À planifier maintenant
                              </div>
                            )}
                            
                            {/* Reminder indicator */}
                            {scheduledReminders[apt.id] && (
                              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-medium ml-2">
                                <Bell className="w-3 h-3" />
                                Rappel le {new Date(scheduledReminders[apt.id].reminder_datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </div>
                            )}
                            
                            {/* Reminder scheduling form */}
                            {settingReminder === apt.id && (
                              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 animate-fade-in">
                                <h5 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
                                  <Bell className="w-4 h-4" /> Programmer un rappel
                                </h5>
                                <div className="flex flex-wrap items-end gap-2">
                                  <div>
                                    <label className="text-xs text-slate-500 block mb-1">Date</label>
                                    <Input
                                      type="date"
                                      value={reminderDate}
                                      onChange={(e) => setReminderDate(e.target.value)}
                                      className="text-sm h-9 rounded-xl w-40"
                                      data-testid="reminder-date"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-500 block mb-1">Heure</label>
                                    <Input
                                      type="time"
                                      value={reminderTime}
                                      onChange={(e) => setReminderTime(e.target.value)}
                                      className="text-sm h-9 rounded-xl w-24"
                                      data-testid="reminder-time"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-500 block mb-1">Type</label>
                                    <select
                                      value={reminderType}
                                      onChange={(e) => setReminderType(e.target.value)}
                                      className="text-sm h-9 rounded-xl px-2 border border-slate-200 bg-white"
                                      data-testid="reminder-type"
                                    >
                                      <option value="both">Push + Email</option>
                                      <option value="push">Push seul</option>
                                      <option value="email">Email seul</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    onClick={() => scheduleReminder(apt.id)}
                                    data-testid="save-reminder"
                                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-sm"
                                  >
                                    Programmer
                                  </Button>
                                  <Button
                                    onClick={() => setSettingReminder(null)}
                                    className="bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl px-3 py-2 text-sm"
                                  >
                                    Annuler
                                  </Button>
                                </div>
                                <p className="text-xs text-amber-600 mt-2">
                                  {reminderType === 'both' ? 'Vous recevrez une notification push et un email.' :
                                   reminderType === 'push' ? 'Vous recevrez une notification push.' :
                                   'Vous recevrez un email.'}
                                </p>
                              </div>
                            )}
                            
                            {/* Expandable details */}
                            <button
                              onClick={() => setExpandedId(expandedId === apt.id ? null : apt.id)}
                              className="mt-2 text-sm text-sky-500 hover:text-sky-600 flex items-center gap-1"
                            >
                              {expandedId === apt.id ? (
                                <>Masquer les détails <ChevronUp className="w-4 h-4" /></>
                              ) : (
                                <>Voir les détails <ChevronDown className="w-4 h-4" /></>
                              )}
                            </button>
                            
                            {expandedId === apt.id && (
                              <div className="mt-3 space-y-3 animate-fade-in">
                                {/* Info section */}
                                <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                                  <p className="text-sm text-slate-600">{apt.description}</p>
                                  {apt.documents && apt.documents.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs font-semibold text-slate-500 mb-1">Documents à prévoir :</p>
                                      <div className="flex flex-wrap gap-1">
                                        {apt.documents.map((doc, i) => (
                                          <span key={i} className="text-xs bg-white px-2 py-1 rounded-full text-slate-600 border border-slate-200">
                                            {doc}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Display existing notes if not editing */}
                                {!editingNotes && hasNotes(apt.id) && (
                                  <div className="p-3 bg-blue-50 rounded-xl">
                                    <h5 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                                      <Edit3 className="w-4 h-4" /> Mes notes
                                    </h5>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {allNotes[apt.id].weight && (
                                        <div className="flex items-center gap-1">
                                          <Scale className="w-3 h-3 text-blue-500" />
                                          <span>Poids: {allNotes[apt.id].weight} kg</span>
                                        </div>
                                      )}
                                      {allNotes[apt.id].blood_pressure_systolic && (
                                        <div className="flex items-center gap-1">
                                          <Heart className="w-3 h-3 text-red-500" />
                                          <span>Tension: {allNotes[apt.id].blood_pressure_systolic}/{allNotes[apt.id].blood_pressure_diastolic}</span>
                                        </div>
                                      )}
                                      {allNotes[apt.id].baby_heartbeat && (
                                        <div className="flex items-center gap-1">
                                          <Heart className="w-3 h-3 text-pink-500" />
                                          <span>Cœur bébé: {allNotes[apt.id].baby_heartbeat} bpm</span>
                                        </div>
                                      )}
                                      {allNotes[apt.id].baby_weight && (
                                        <div className="flex items-center gap-1">
                                          <Scale className="w-3 h-3 text-purple-500" />
                                          <span>Poids bébé: {allNotes[apt.id].baby_weight} g</span>
                                        </div>
                                      )}
                                      {allNotes[apt.id].baby_size && (
                                        <div className="flex items-center gap-1">
                                          <Ruler className="w-3 h-3 text-green-500" />
                                          <span>Taille bébé: {allNotes[apt.id].baby_size} cm</span>
                                        </div>
                                      )}
                                      {allNotes[apt.id].doctor_name && (
                                        <div className="flex items-center gap-1 col-span-2">
                                          <Stethoscope className="w-3 h-3 text-sky-500" />
                                          <span>Dr. {allNotes[apt.id].doctor_name}</span>
                                        </div>
                                      )}
                                    </div>
                                    {allNotes[apt.id].notes && (
                                      <p className="mt-2 text-xs text-slate-600 bg-white p-2 rounded-lg">
                                        {allNotes[apt.id].notes}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Notes editing form */}
                                {editingNotes === apt.id && (
                                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <h5 className="text-sm font-bold text-blue-700 flex items-center gap-2">
                                        <Edit3 className="w-4 h-4" /> Mes notes du rendez-vous
                                      </h5>
                                      <button
                                        onClick={cancelEditingNotes}
                                        className="text-slate-400 hover:text-slate-600"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                      {/* Maman */}
                                      <div className="col-span-2">
                                        <p className="text-xs font-semibold text-pink-600 mb-1">👩 Maman</p>
                                      </div>
                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Poids (kg)</label>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          placeholder="ex: 65.5"
                                          value={noteForm.weight}
                                          onChange={(e) => setNoteForm({...noteForm, weight: e.target.value})}
                                          className="text-sm h-9 rounded-xl"
                                          data-testid="note-weight"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Tension (sys/dia)</label>
                                        <div className="flex gap-1">
                                          <Input
                                            type="number"
                                            placeholder="120"
                                            value={noteForm.blood_pressure_systolic}
                                            onChange={(e) => setNoteForm({...noteForm, blood_pressure_systolic: e.target.value})}
                                            className="text-sm h-9 rounded-xl w-16"
                                            data-testid="note-bp-sys"
                                          />
                                          <span className="text-slate-400 self-center">/</span>
                                          <Input
                                            type="number"
                                            placeholder="80"
                                            value={noteForm.blood_pressure_diastolic}
                                            onChange={(e) => setNoteForm({...noteForm, blood_pressure_diastolic: e.target.value})}
                                            className="text-sm h-9 rounded-xl w-16"
                                            data-testid="note-bp-dia"
                                          />
                                        </div>
                                      </div>

                                      {/* Bébé */}
                                      <div className="col-span-2 mt-2">
                                        <p className="text-xs font-semibold text-sky-600 mb-1">👶 Bébé</p>
                                      </div>
                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Cœur (bpm)</label>
                                        <Input
                                          type="number"
                                          placeholder="ex: 145"
                                          value={noteForm.baby_heartbeat}
                                          onChange={(e) => setNoteForm({...noteForm, baby_heartbeat: e.target.value})}
                                          className="text-sm h-9 rounded-xl"
                                          data-testid="note-heartbeat"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Poids (g)</label>
                                        <Input
                                          type="number"
                                          placeholder="ex: 1500"
                                          value={noteForm.baby_weight}
                                          onChange={(e) => setNoteForm({...noteForm, baby_weight: e.target.value})}
                                          className="text-sm h-9 rounded-xl"
                                          data-testid="note-baby-weight"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Taille (cm)</label>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          placeholder="ex: 35"
                                          value={noteForm.baby_size}
                                          onChange={(e) => setNoteForm({...noteForm, baby_size: e.target.value})}
                                          className="text-sm h-9 rounded-xl"
                                          data-testid="note-baby-size"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-slate-500 block mb-1">Médecin</label>
                                        <Input
                                          type="text"
                                          placeholder="Nom du médecin"
                                          value={noteForm.doctor_name}
                                          onChange={(e) => setNoteForm({...noteForm, doctor_name: e.target.value})}
                                          className="text-sm h-9 rounded-xl"
                                          data-testid="note-doctor"
                                        />
                                      </div>

                                      {/* Notes libres */}
                                      <div className="col-span-2">
                                        <label className="text-xs text-slate-500 block mb-1">Notes personnelles</label>
                                        <textarea
                                          placeholder="Observations, questions pour le prochain RDV..."
                                          value={noteForm.notes}
                                          onChange={(e) => setNoteForm({...noteForm, notes: e.target.value})}
                                          className="w-full text-sm p-2 rounded-xl border border-slate-200 resize-none h-20"
                                          data-testid="note-text"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-3">
                                      <Button
                                        onClick={cancelEditingNotes}
                                        className="bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl px-4 py-2 text-sm"
                                      >
                                        Annuler
                                      </Button>
                                      <Button
                                        onClick={() => saveNotes(apt.id)}
                                        data-testid="save-notes"
                                        className="bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl px-4 py-2 text-sm flex items-center gap-2"
                                      >
                                        <Save className="w-4 h-4" /> Enregistrer
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default MedicalAppointmentsPage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Stethoscope, Scan, TestTube, Baby, Activity, UserCog, Check, Calendar, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

function MedicalAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.medical.getAppointments();
      setAppointments(response.data.appointments || []);
      setCurrentWeek(response.data.current_week || 1);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            data-testid="back-button"
            className="bg-white text-sky-500 border border-sky-100 rounded-full p-2 hover:bg-sky-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Rendez-vous médicaux</h1>
        </div>

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
                  <p className="text-3xl font-bold text-sky-600">Semaine {currentWeek}</p>
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
            </Card>

            {/* Trimester sections */}
            {[1, 2, 3].map((trimester) => (
              trimesters[trimester].length > 0 && (
                <div key={trimester}>
                  <h2 className="text-lg font-bold text-slate-600 mb-3 flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      trimester === 1 ? 'bg-sky-400' : trimester === 2 ? 'bg-purple-400' : 'bg-pink-400'
                    }`}>
                      T{trimester}
                    </span>
                    {trimester === 1 ? '1er' : `${trimester}ème`} trimestre
                  </h2>
                  
                  <div className="space-y-3">
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
                                <h4 className={`font-bold ${apt.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                  {apt.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>Semaines {apt.week_start}-{apt.week_end}</span>
                                  <span className="text-slate-300">•</span>
                                  <span>{formatDate(apt.start_date)} - {formatDate(apt.end_date)}</span>
                                </div>
                              </div>
                              
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
                            
                            {apt.status === 'current' && !apt.is_completed && (
                              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                <Clock className="w-3 h-3" />
                                À planifier maintenant
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
                              <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-2 animate-fade-in">
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
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default MedicalAppointmentsPage;

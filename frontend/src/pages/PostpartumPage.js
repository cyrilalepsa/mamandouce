import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  ArrowLeft, Calendar, Heart, AlertTriangle, Baby, Droplets, 
  Shield, ChevronDown, ChevronUp, Stethoscope, Clock, Info, CalendarDays, Check, Lock
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

export default function PostpartumPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('appointments');
  const [expandedDifficulty, setExpandedDifficulty] = useState(null);
  
  // Postpartum status
  const [postpartumStatus, setPostpartumStatus] = useState(null);
  const [birthDate, setBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [savingBirthDate, setSavingBirthDate] = useState(false);

  useEffect(() => {
    loadContent();
    loadPostpartumStatus();
    // Envoyer les rappels dus au chargement de la page
    sendDueReminders();
  }, []);

  const loadContent = async () => {
    try {
      const response = await api.postpartum.getContent();
      setContent(response.data);
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };
  
  const loadPostpartumStatus = async () => {
    try {
      const response = await api.postpartum.getStatus();
      setPostpartumStatus(response.data);
      if (response.data.actual_birth_date) {
        setBirthDate(response.data.actual_birth_date.split('T')[0]);
      }
      if (response.data.baby_name) {
        setBabyName(response.data.baby_name);
      }
    } catch (error) {
      console.error('Erreur chargement statut:', error);
    }
  };
  
  const sendDueReminders = async () => {
    try {
      await api.postpartum.sendDueReminders();
    } catch (error) {
      // Silently fail
    }
  };
  
  const handleSaveBirthDate = async () => {
    if (!birthDate) {
      toast.error('Veuillez entrer la date d\'accouchement');
      return;
    }
    
    setSavingBirthDate(true);
    try {
      await api.postpartum.setBirthDate(birthDate, babyName);
      toast.success('Date d\'accouchement enregistrée ! Les rappels de RDV sont programmés.');
      loadPostpartumStatus();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSavingBirthDate(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const sections = [
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
    { id: 'difficulties', label: 'Difficultés', icon: AlertTriangle },
    { id: 'breastfeeding', label: 'Allaitement', icon: Heart },
    { id: 'formula', label: 'Lait infantile', icon: Baby },
    { id: 'diapers', label: 'Couches', icon: Droplets },
    { id: 'precautions', label: 'Précautions', icon: Shield },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            className="bg-white rounded-full p-2 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Suivi post-partum
            </h1>
            <p className="text-sm text-slate-500">Les 6 premiers mois avec bébé</p>
          </div>
        </div>
        
        {/* Birth Date Section - Show at 7th month or later */}
        {postpartumStatus && (
          <Card className={`rounded-2xl p-5 ${
            postpartumStatus.actual_birth_date 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
              : postpartumStatus.can_set_birth_date
                ? 'bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200'
                : 'bg-slate-50 border border-slate-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                postpartumStatus.actual_birth_date
                  ? 'bg-green-500'
                  : postpartumStatus.can_set_birth_date
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
              }`}>
                {postpartumStatus.actual_birth_date ? (
                  <Check className="w-6 h-6 text-white" />
                ) : postpartumStatus.can_set_birth_date ? (
                  <CalendarDays className="w-6 h-6 text-white" />
                ) : (
                  <Lock className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-700">
                  {postpartumStatus.actual_birth_date 
                    ? `Bébé${postpartumStatus.baby_name ? ` ${postpartumStatus.baby_name}` : ''} est né(e) !`
                    : postpartumStatus.can_set_birth_date
                      ? 'Date d\'accouchement'
                      : 'Date d\'accouchement (à saisir au 7ème mois)'}
                </h3>
                <p className="text-sm text-slate-500">
                  {postpartumStatus.actual_birth_date 
                    ? `Semaine ${postpartumStatus.current_postpartum_week} du post-partum`
                    : postpartumStatus.can_set_birth_date
                      ? 'Renseignez votre date d\'accouchement prévue ou réelle'
                      : `Actuellement à ${postpartumStatus.weeks_pregnant} SA`}
                </p>
              </div>
            </div>
            
            {!postpartumStatus.actual_birth_date && postpartumStatus.can_set_birth_date && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Date d'accouchement</label>
                    <Input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="rounded-xl border-rose-200"
                      data-testid="birth-date-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Prénom de bébé (optionnel)</label>
                    <Input
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      placeholder="Prénom"
                      className="rounded-xl border-rose-200"
                      data-testid="baby-name-input"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveBirthDate}
                  disabled={savingBirthDate}
                  data-testid="save-birth-date-button"
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-2"
                >
                  {savingBirthDate ? 'Enregistrement...' : 'Enregistrer et programmer les rappels'}
                </Button>
                <p className="text-xs text-center text-slate-500">
                  Vous recevrez des rappels 7 jours et 3 jours avant chaque RDV post-partum
                </p>
              </div>
            )}
            
            {postpartumStatus.actual_birth_date && (
              <div className="text-sm text-slate-600">
                <p>Date de naissance : <strong>{new Date(postpartumStatus.actual_birth_date).toLocaleDateString('fr-FR')}</strong></p>
                <p className="mt-1">Les rappels de RDV sont programmés automatiquement.</p>
              </div>
            )}
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Ces informations sont données à titre indicatif et ne remplacent pas l'avis d'un professionnel de santé. 
              En cas de doute, consultez votre médecin ou sage-femme.
            </p>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-semibold">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Sections */}
        {activeSection === 'appointments' && content?.appointments && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">Rendez-vous sur 6 mois</h2>
            {content.appointments.map((apt, index) => (
              <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    apt.type === 'obligatoire' 
                      ? 'bg-rose-100 text-rose-600' 
                      : 'bg-sky-100 text-sky-600'
                  }`}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-700">{apt.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        apt.type === 'obligatoire'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}>
                        {apt.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{apt.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Semaine {apt.week}
                      </span>
                      {apt.duration && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {apt.duration}
                        </span>
                      )}
                      {apt.who && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {apt.who}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Expandable details */}
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  {/* For Mom */}
                  {apt.for_mom && apt.for_mom.length > 0 && (
                    <div className="bg-pink-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-pink-700 mb-2 flex items-center gap-1">
                        <Heart className="w-4 h-4" /> Pour maman
                      </h4>
                      <ul className="text-xs text-pink-800 space-y-1">
                        {apt.for_mom.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-pink-400 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* For Baby */}
                  {apt.for_baby && apt.for_baby.length > 0 && (
                    <div className="bg-sky-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-sky-700 mb-2 flex items-center gap-1">
                        <Baby className="w-4 h-4" /> Pour bébé
                      </h4>
                      <ul className="text-xs text-sky-800 space-y-1">
                        {apt.for_baby.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-sky-400 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Vaccines */}
                  {apt.vaccines && apt.vaccines.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
                        <Shield className="w-4 h-4" /> Vaccins administrés
                      </h4>
                      <div className="space-y-2">
                        {apt.vaccines.map((vax, i) => (
                          <div key={i} className="text-xs">
                            <span className="font-semibold text-green-800">{vax.name}</span>
                            <p className="text-green-600 mt-0.5">Protection contre : {vax.protects}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Side effects */}
                  {apt.side_effects && apt.side_effects.length > 0 && (
                    <div className="bg-amber-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Effets secondaires possibles
                      </h4>
                      <ul className="text-xs text-amber-800 space-y-1">
                        {apt.side_effects.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* What to do */}
                  {apt.what_to_do && apt.what_to_do.length > 0 && (
                    <div className="bg-blue-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-blue-700 mb-2">Que faire après ?</h4>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {apt.what_to_do.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Why - for reeducation */}
                  {apt.why && apt.why.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-purple-700 mb-2">Pourquoi c'est important ?</h4>
                      <ul className="text-xs text-purple-800 space-y-1">
                        {apt.why.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Methods - for reeducation */}
                  {apt.methods && apt.methods.length > 0 && (
                    <div className="bg-indigo-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-indigo-700 mb-2">Méthodes utilisées</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {apt.methods.map((method, i) => (
                          <div key={i} className="text-xs bg-white/60 rounded-lg p-2">
                            <span className="font-semibold text-indigo-800">{method.name}</span>
                            <p className="text-indigo-600 mt-0.5">{method.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Milestones at 6 months */}
                  {apt.milestones_6_months && apt.milestones_6_months.length > 0 && (
                    <div className="bg-teal-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-teal-700 mb-2">Développement attendu à 6 mois</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {apt.milestones_6_months.map((item, i) => (
                          <span key={i} className="text-xs text-teal-800 flex items-center gap-1">
                            <span className="text-teal-400">✓</span> {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Diversification */}
                  {apt.diversification && apt.diversification.length > 0 && (
                    <div className="bg-orange-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-orange-700 mb-2">Diversification alimentaire</h4>
                      <ul className="text-xs text-orange-800 space-y-1">
                        {apt.diversification.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-400 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Questions to ask */}
                  {apt.questions_to_ask && apt.questions_to_ask.length > 0 && (
                    <div className="bg-violet-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-violet-700 mb-2">Questions à poser au médecin</h4>
                      <ul className="text-xs text-violet-800 space-y-1">
                        {apt.questions_to_ask.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-violet-400 mt-0.5">?</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Documents */}
                  {apt.documents && apt.documents.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-semibold text-slate-500">Documents à apporter :</span>
                      {apt.documents.map((doc, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {doc}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Tips */}
                  {apt.tips && (
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3 border border-pink-100">
                      <p className="text-xs text-slate-700">
                        <span className="font-bold text-pink-600">💡 Conseil :</span> {apt.tips}
                      </p>
                    </div>
                  )}
                  
                  {/* Reimbursement */}
                  {apt.reimbursement && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                        💰 {apt.reimbursement}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeSection === 'difficulties' && content?.difficulties && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-700">Difficultés possibles</h2>
            {content.difficulties.map((diff, index) => (
              <Card 
                key={index} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedDifficulty(expandedDifficulty === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-slate-700">{diff.title}</span>
                  </div>
                  {expandedDifficulty === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                {expandedDifficulty === index && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                    <p className="text-sm text-slate-600">{diff.description}</p>
                    
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Symptômes :</p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {diff.symptoms.map((s, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1">Conseil :</p>
                      <p className="text-sm text-green-600">{diff.advice}</p>
                    </div>
                    
                    <div className="bg-rose-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-rose-700 mb-1">Quand consulter :</p>
                      <p className="text-sm text-rose-600">{diff.alert}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {activeSection === 'breastfeeding' && content?.breastfeeding && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">Allaitement maternel</h2>
            
            <Card className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4">
              <h3 className="font-bold text-slate-700 mb-3">Les bienfaits</h3>
              <ul className="space-y-2">
                {content.breastfeeding.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </Card>
            
            <Card className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-3">Conseils pratiques</h3>
              <ul className="space-y-2">
                {content.breastfeeding.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-2 flex-shrink-0"></span>
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
            
            <Card className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-3">Positions d'allaitement</h3>
              <div className="flex flex-wrap gap-2">
                {content.breastfeeding.positions.map((p, i) => (
                  <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {p}
                  </span>
                ))}
              </div>
            </Card>
            
            <Card className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <p className="text-sm text-rose-700">
                <strong>Important :</strong> {content.breastfeeding.alert}
              </p>
            </Card>
          </div>
        )}

        {activeSection === 'formula' && content?.formula && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">Lait infantile</h2>
            
            <Card className="bg-sky-50 rounded-2xl p-4">
              <p className="text-sm text-sky-700">{content.formula.info}</p>
            </Card>
            
            <Card className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-3">Préparation du biberon</h3>
              <ul className="space-y-2">
                {content.formula.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-2 flex-shrink-0"></span>
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
            
            <Card className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-3">Types de lait</h3>
              <div className="space-y-3">
                {content.formula.types.map((type, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">{type.name}</p>
                      <p className="text-xs text-slate-500">{type.age} - {type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm text-amber-700">
                <strong>Attention :</strong> {content.formula.alert}
              </p>
            </Card>
          </div>
        )}

        {activeSection === 'diapers' && content?.diapers && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">Les couches</h2>
            
            <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4">
              <h3 className="font-bold text-slate-700 mb-2">Fréquence des changes</h3>
              <p className="text-sm text-slate-600">{content.diapers.frequency}</p>
            </Card>
            
            <Card className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-3">Conseils pour le change</h3>
              <ul className="space-y-2">
                {content.diapers.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2 flex-shrink-0"></span>
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
            
            <Card className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-3">Guide des tailles</h3>
              <div className="grid grid-cols-2 gap-2">
                {content.diapers.sizes.map((size, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-teal-600">Taille {size.size}</p>
                    <p className="text-sm text-slate-600">{size.weight}</p>
                    <p className="text-xs text-slate-400">{size.age}</p>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <p className="text-sm text-rose-700">
                <strong>Attention :</strong> {content.diapers.alert}
              </p>
            </Card>
          </div>
        )}

        {activeSection === 'precautions' && content?.precautions && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">Précautions importantes</h2>
            
            {content.precautions.map((prec, index) => (
              <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <h3 className="font-bold text-slate-700">{prec.title}</h3>
                </div>
                <ul className="space-y-2">
                  {prec.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

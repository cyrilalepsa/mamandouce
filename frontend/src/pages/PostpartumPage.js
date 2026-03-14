import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  ArrowLeft, Calendar, Heart, AlertTriangle, Baby, Droplets, 
  Shield, ChevronDown, ChevronUp, Stethoscope, Clock, Info
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

export default function PostpartumPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('appointments');
  const [expandedDifficulty, setExpandedDifficulty] = useState(null);

  useEffect(() => {
    loadContent();
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
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-700">Rendez-vous sur 6 mois</h2>
            {content.appointments.map((apt, index) => (
              <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    apt.type === 'obligatoire' 
                      ? 'bg-rose-100 text-rose-600' 
                      : 'bg-sky-100 text-sky-600'
                  }`}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>Semaine {apt.week}</span>
                    </div>
                  </div>
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

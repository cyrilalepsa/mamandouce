import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Calculator, 
  Apple, 
  Calendar, 
  Gift, 
  ChevronRight, 
  Check,
  Heart,
  Baby,
  Sparkles
} from 'lucide-react';

const GUIDE_STEPS = [
  {
    id: 'calculate',
    title: 'Calculez vos dates clés',
    description: 'Entrez la date de vos dernières règles pour connaître votre DPA, vos trimestres et toutes les dates importantes.',
    icon: Calculator,
    color: 'from-pink-500 to-rose-400',
    link: '/calculator'
  },
  {
    id: 'scan',
    title: 'Scannez vos aliments',
    description: 'Vérifiez si un aliment est autorisé pendant la grossesse en scannant son code-barres ou en le recherchant.',
    icon: Apple,
    color: 'from-green-500 to-emerald-400',
    link: '/scanner'
  },
  {
    id: 'appointments',
    title: 'Suivez vos rendez-vous',
    description: 'Consultez tous vos rendez-vous médicaux obligatoires et recommandés. Ne manquez aucune échographie !',
    icon: Calendar,
    color: 'from-sky-500 to-cyan-400',
    link: '/medical'
  },
  {
    id: 'birthlist',
    title: 'Créez votre liste de naissance',
    description: 'Préparez votre arrivée de bébé et partagez votre liste avec vos proches.',
    icon: Gift,
    color: 'from-purple-500 to-violet-400',
    link: '/birth-list'
  }
];

function GuidePage() {
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepClick = (stepId, link) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    navigate(link);
  };

  const allCompleted = completedSteps.length === GUIDE_STEPS.length;

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Baby className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Bienvenue sur MamanDouce !
          </h1>
          <p className="text-slate-500">
            Découvrez comment nous allons vous accompagner
          </p>
        </div>

        {/* Progress */}
        <Card className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-600">Votre progression</span>
            <span className="text-sm font-bold text-pink-500">
              {completedSteps.length}/{GUIDE_STEPS.length} étapes
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps.length / GUIDE_STEPS.length) * 100}%` }}
            />
          </div>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          {GUIDE_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isActive = index === currentStep;
            
            return (
              <Card 
                key={step.id}
                onClick={() => {
                  setCurrentStep(index);
                  handleStepClick(step.id, step.link);
                }}
                data-testid={`guide-step-${step.id}`}
                className={`rounded-3xl p-5 cursor-pointer transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : isActive
                      ? 'bg-white border-2 border-pink-200 shadow-lg'
                      : 'bg-white border border-slate-100 hover:border-pink-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-green-500'
                      : `bg-gradient-to-br ${step.color}`
                  }`}>
                    {isCompleted ? (
                      <Check className="w-7 h-7 text-white" />
                    ) : (
                      <StepIcon className="w-7 h-7 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${
                      isCompleted ? 'text-green-700' : 'text-slate-700'
                    }`} style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {step.description}
                    </p>
                  </div>
                  
                  <ChevronRight className={`w-6 h-6 flex-shrink-0 ${
                    isCompleted ? 'text-green-400' : 'text-slate-300'
                  }`} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Completion Message */}
        {allCompleted && (
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 border-2 border-pink-200 text-center animate-fade-in">
            <Sparkles className="w-12 h-12 text-pink-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Bravo ! Vous êtes prête !
            </h3>
            <p className="text-slate-500 mb-4">
              Vous avez découvert toutes les fonctionnalités principales.
            </p>
            <Button
              onClick={() => navigate('/section/pregnancy')}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full px-8 py-3 font-semibold"
            >
              <Heart className="w-5 h-5 mr-2" />
              Continuer l'aventure
            </Button>
          </Card>
        )}

        {/* Skip Button */}
        {!allCompleted && (
          <div className="text-center pt-4">
            <Button
              onClick={() => navigate('/section/pregnancy')}
              variant="ghost"
              className="text-slate-400 hover:text-slate-600"
            >
              Passer le guide
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GuidePage;

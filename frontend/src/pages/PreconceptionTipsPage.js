import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Lightbulb, Check, Pill, Apple, Dumbbell, Moon, Cigarette, Wine, Brain } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const PRECONCEPTION_TIPS = [
  {
    id: 'folic-acid',
    icon: Pill,
    iconColor: 'text-pink-500',
    bgColor: 'bg-pink-50',
    title: 'Acide folique',
    titleKey: 'preconceptionTips.folicAcid',
    description: 'Commencez à prendre de l\'acide folique (vitamine B9) au moins 1 mois avant la conception. Dose recommandée : 400 µg/jour. Aide à prévenir les malformations du tube neural.',
    descKey: 'preconceptionTips.folicAcidDesc',
    important: true
  },
  {
    id: 'balanced-diet',
    icon: Apple,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50',
    title: 'Alimentation équilibrée',
    titleKey: 'preconceptionTips.balancedDiet',
    description: 'Adoptez une alimentation riche en fruits, légumes, protéines et grains entiers. Évitez les aliments transformés et privilégiez le bio quand possible.',
    descKey: 'preconceptionTips.balancedDietDesc',
    important: true
  },
  {
    id: 'exercise',
    icon: Dumbbell,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
    title: 'Activité physique régulière',
    titleKey: 'preconceptionTips.exercise',
    description: 'Maintenez une activité physique modérée : 30 minutes de marche, natation ou yoga par jour. Un poids santé améliore la fertilité.',
    descKey: 'preconceptionTips.exerciseDesc',
    important: false
  },
  {
    id: 'sleep',
    icon: Moon,
    iconColor: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    title: 'Sommeil de qualité',
    titleKey: 'preconceptionTips.sleep',
    description: 'Dormez 7 à 9 heures par nuit. Un bon sommeil régule les hormones de fertilité et réduit le stress.',
    descKey: 'preconceptionTips.sleepDesc',
    important: false
  },
  {
    id: 'no-smoking',
    icon: Cigarette,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
    title: 'Arrêter de fumer',
    titleKey: 'preconceptionTips.noSmoking',
    description: 'Le tabac réduit la fertilité chez l\'homme et la femme. Arrêtez au moins 3 mois avant d\'essayer de concevoir.',
    descKey: 'preconceptionTips.noSmokingDesc',
    important: true
  },
  {
    id: 'limit-alcohol',
    icon: Wine,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
    title: 'Limiter l\'alcool',
    titleKey: 'preconceptionTips.limitAlcohol',
    description: 'L\'alcool peut affecter la fertilité et le développement du bébé. Idéalement, évitez complètement l\'alcool pendant cette période.',
    descKey: 'preconceptionTips.limitAlcoholDesc',
    important: true
  },
  {
    id: 'reduce-stress',
    icon: Brain,
    iconColor: 'text-teal-500',
    bgColor: 'bg-teal-50',
    title: 'Gérer le stress',
    titleKey: 'preconceptionTips.reduceStress',
    description: 'Le stress chronique peut perturber l\'ovulation. Pratiquez la méditation, le yoga ou des activités relaxantes.',
    descKey: 'preconceptionTips.reduceStressDesc',
    important: false
  },
  {
    id: 'medical-checkup',
    icon: Check,
    iconColor: 'text-sky-500',
    bgColor: 'bg-sky-50',
    title: 'Bilan médical',
    titleKey: 'preconceptionTips.medicalCheckup',
    description: 'Consultez votre médecin pour un bilan préconceptionnel : vérification des vaccins, dépistages, et discussion sur vos antécédents médicaux.',
    descKey: 'preconceptionTips.medicalCheckupDesc',
    important: true
  },
];

function PreconceptionTipsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [checkedItems, setCheckedItems] = useState({});

  const toggleChecked = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const importantTips = PRECONCEPTION_TIPS.filter(tip => tip.important);
  const otherTips = PRECONCEPTION_TIPS.filter(tip => !tip.important);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/section/preconception')}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h1 className="text-lg font-bold text-amber-600">
                {t('preconception.preparationAdvice', 'Préparation et conseils')}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('preconceptionTips.subtitle', 'Préparez votre corps pour accueillir bébé')}
            </p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Section prioritaire */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            {t('preconceptionTips.essential', 'Essentiels')}
          </h2>
          <div className="space-y-3">
            {importantTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <Card 
                  key={tip.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    checkedItems[tip.id] 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 ${tip.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${tip.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-700">
                          {t(tip.titleKey, tip.title)}
                        </h3>
                        <button
                          onClick={() => toggleChecked(tip.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            checkedItems[tip.id]
                              ? 'bg-green-500 border-green-500'
                              : 'border-slate-300 hover:border-green-400'
                          }`}
                        >
                          {checkedItems[tip.id] && <Check className="w-4 h-4 text-white" />}
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {t(tip.descKey, tip.description)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Autres conseils */}
        <div>
          <h2 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
            {t('preconceptionTips.recommended', 'Recommandés')}
          </h2>
          <div className="space-y-3">
            {otherTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <Card 
                  key={tip.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    checkedItems[tip.id] 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white/80 border-slate-100'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 ${tip.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${tip.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-700">
                          {t(tip.titleKey, tip.title)}
                        </h3>
                        <button
                          onClick={() => toggleChecked(tip.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            checkedItems[tip.id]
                              ? 'bg-green-500 border-green-500'
                              : 'border-slate-300 hover:border-green-400'
                          }`}
                        >
                          {checkedItems[tip.id] && <Check className="w-4 h-4 text-white" />}
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {t(tip.descKey, tip.description)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
            <Heart className="w-4 h-4 text-amber-300" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            {t('preconceptionTips.disclaimer', 'Ces conseils ne remplacent pas un avis médical professionnel.')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PreconceptionTipsPage;

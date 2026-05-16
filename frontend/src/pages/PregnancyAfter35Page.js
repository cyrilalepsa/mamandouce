import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Stethoscope, Brain, Baby, Clock, 
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Calendar, Pill, Users, Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ToggleAllSections } from '../components/ToggleAllSections';

// Composant de section déroulante
function CollapsibleSection({ title, icon: Icon, children, isOpen, onToggle, color = "pink" }) {
  const colorClasses = {
    pink: "from-pink-100 to-purple-100 text-pink-600",
    amber: "from-amber-100 to-orange-100 text-amber-600",
    teal: "from-teal-100 to-cyan-100 text-teal-600",
    violet: "from-violet-100 to-purple-100 text-violet-600",
    rose: "from-rose-100 to-pink-100 text-rose-600",
  };

  return (
    <Card className="bg-white rounded-2xl overflow-hidden border-0 shadow-sm">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-700 text-left">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 animate-fade-in">
          {children}
        </div>
      )}
    </Card>
  );
}

// Liste à puces stylisée
function BulletList({ items, color = "pink" }) {
  const dotColors = {
    pink: "bg-pink-400",
    amber: "bg-amber-400",
    teal: "bg-teal-400",
    violet: "bg-violet-400",
  };

  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className={`w-2 h-2 ${dotColors[color]} rounded-full mt-2 flex-shrink-0`} />
          <span className="text-sm text-slate-600">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PregnancyAfter35Page() {
  const navigate = useNavigate();
  
  // État des sections
  const [openSections, setOpenSections] = useState({
    fertility: false,
    exams: false,
    risks: false,
    lifestyle: false,
    support: false,
    positive: false
  });
  
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const allOpen = Object.values(openSections).every(Boolean);
  
  const toggleAllSections = (open) => {
    setOpenSections({
      fertility: open,
      exams: open,
      risks: open,
      lifestyle: open,
      support: open,
      positive: open
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Grossesse après 35 ans
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Introduction */}
        <Card className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-6 border-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Heart className="w-7 h-7 text-pink-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-700">Devenir maman après 35 ans</h2>
              <p className="text-sm text-slate-600">Un projet tout à fait réalisable !</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            De plus en plus de femmes choisissent d'avoir un enfant après 35 ans. 
            Si cette période apporte maturité et stabilité, elle nécessite aussi un suivi médical 
            adapté. Cette page vous guide à travers les informations essentielles et les bonnes pratiques 
            pour vivre sereinement cette belle aventure.
          </p>
        </Card>

        {/* Avertissement */}
        <Card className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Important :</strong> Les informations fournies sont à titre éducatif et ne remplacent 
              pas l'avis d'un professionnel de santé. Consultez toujours votre médecin ou gynécologue.
            </p>
          </div>
        </Card>

        {/* Toggle All Button */}
        <div className="flex justify-end">
          <ToggleAllSections 
            allOpen={allOpen} 
            onToggle={toggleAllSections}
          />
        </div>

        {/* Section 1: Fertilité après 35 ans */}
        <CollapsibleSection 
          title="Fertilité après 35 ans" 
          icon={Sparkles} 
          color="pink"
          isOpen={openSections.fertility}
          onToggle={() => toggleSection('fertility')}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              La fertilité féminine diminue naturellement avec l'âge, plus particulièrement après 35 ans. 
              Voici ce qu'il faut savoir :
            </p>
            
            <div className="bg-pink-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-700 mb-2">Ce qui change</h4>
              <BulletList 
                color="pink"
                items={[
                  "La réserve ovarienne (nombre d'ovocytes) diminue progressivement",
                  "La qualité des ovocytes peut être affectée",
                  "Le délai de conception peut être plus long (6 à 12 mois est normal)",
                  "Après 40 ans, environ 1 femme sur 2 peut rencontrer des difficultés"
                ]}
              />
            </div>
            
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Bonnes nouvelles
              </h4>
              <BulletList 
                color="teal"
                items={[
                  "De nombreuses femmes conçoivent naturellement après 35 ans",
                  "Les techniques d'aide à la procréation ont beaucoup progressé",
                  "Un mode de vie sain peut optimiser vos chances",
                  "Un suivi préconceptionnel peut vous aider à préparer votre corps"
                ]}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 2: Examens recommandés */}
        <CollapsibleSection 
          title="Examens et tests recommandés" 
          icon={Stethoscope} 
          color="teal"
          isOpen={openSections.exams}
          onToggle={() => toggleSection('exams')}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Un suivi médical adapté permet de surveiller votre grossesse et celle de bébé. 
              Voici les examens spécifiques proposés :
            </p>
            
            <div className="space-y-3">
              <div className="bg-teal-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-700 mb-2">Avant la grossesse</h4>
                <BulletList 
                  color="teal"
                  items={[
                    "Bilan de fertilité (AMH, FSH, échographie pelvienne)",
                    "Bilan sanguin complet et sérologies",
                    "Consultation préconceptionnelle",
                    "Mise à jour des vaccinations"
                  ]}
                />
              </div>
              
              <div className="bg-violet-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-700 mb-2">Pendant la grossesse</h4>
                <BulletList 
                  color="violet"
                  items={[
                    "Dépistage de la trisomie 21 (prise de sang + échographie au 1er trimestre)",
                    "Test ADN fœtal libre (DPNI) - non invasif et très fiable",
                    "Amniocentèse (proposée si risque élevé, optionnelle)",
                    "Échographies morphologiques détaillées",
                    "Surveillance plus fréquente de la tension et du diabète gestationnel",
                    "Monitoring fœtal en fin de grossesse"
                  ]}
                />
              </div>
            </div>
            
            <Card className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>À savoir :</strong> L'amniocentèse n'est plus systématique. 
                Le test DPNI (prise de sang) est souvent proposé en première intention 
                car il est sans risque pour le bébé et très fiable.
              </p>
            </Card>
          </div>
        </CollapsibleSection>

        {/* Section 3: Risques et précautions */}
        <CollapsibleSection 
          title="Risques et précautions" 
          icon={AlertTriangle} 
          color="amber"
          isOpen={openSections.risks}
          onToggle={() => toggleSection('risks')}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Certains risques sont statistiquement plus élevés après 35 ans, 
              mais un suivi adapté permet de les surveiller et de les gérer efficacement.
            </p>
            
            <div className="bg-amber-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-700 mb-2">Risques à surveiller</h4>
              <BulletList 
                color="amber"
                items={[
                  "Fausse couche : risque légèrement augmenté au 1er trimestre",
                  "Anomalies chromosomiques : risque augmenté avec l'âge",
                  "Diabète gestationnel : dépistage systématique recommandé",
                  "Hypertension et pré-éclampsie : surveillance régulière",
                  "Placenta prævia : détectable à l'échographie",
                  "Accouchement prématuré : surveillance en fin de grossesse"
                ]}
              />
            </div>
            
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Comment limiter les risques
              </h4>
              <BulletList 
                color="teal"
                items={[
                  "Suivre scrupuleusement les rendez-vous médicaux",
                  "Adopter une alimentation équilibrée",
                  "Pratiquer une activité physique adaptée",
                  "Éviter tabac, alcool et substances nocives",
                  "Gérer son stress et bien se reposer",
                  "Prendre l'acide folique dès le projet de grossesse"
                ]}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 4: Suivi médical renforcé */}
        <CollapsibleSection 
          title="Suivi médical renforcé" 
          icon={Calendar} 
          color="violet"
          isOpen={openSections.lifestyle}
          onToggle={() => toggleSection('lifestyle')}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Les grossesses après 35 ans bénéficient souvent d'un suivi plus rapproché. 
              Voici à quoi vous attendre :
            </p>
            
            <div className="bg-violet-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-700 mb-2">Qu'est-ce que le suivi "gériatrique" ?</h4>
              <p className="text-sm text-slate-600 mb-3">
                Le terme "grossesse gériatrique" (ou grossesse tardive) est un terme médical 
                qui désigne simplement une grossesse après 35 ans. Il ne signifie pas que 
                vous êtes "vieille" mais que votre suivi sera adapté.
              </p>
              <BulletList 
                color="violet"
                items={[
                  "Consultations prénatales plus fréquentes",
                  "Échographies supplémentaires si nécessaire",
                  "Surveillance de la croissance fœtale au 3ème trimestre",
                  "Suivi par un gynécologue-obstétricien (vs sage-femme seule)",
                  "Possible déclenchement proposé à 39-40 SA selon les cas"
                ]}
              />
            </div>
            
            <div className="bg-pink-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-700 mb-2">Équipe médicale</h4>
              <BulletList 
                color="pink"
                items={[
                  "Gynécologue-obstétricien pour le suivi global",
                  "Sage-femme pour l'accompagnement et la préparation",
                  "Échographiste spécialisé en médecine fœtale",
                  "Endocrinologue si diabète gestationnel",
                  "Anesthésiste consultation obligatoire"
                ]}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 5: Accompagnement psychologique */}
        <CollapsibleSection 
          title="Accompagnement psychologique" 
          icon={Brain} 
          color="rose"
          isOpen={openSections.support}
          onToggle={() => toggleSection('support')}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Devenir mère après 35 ans peut susciter des émotions variées. 
              L'accompagnement psychologique fait partie intégrante du parcours.
            </p>
            
            <div className="bg-rose-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-700 mb-2">Ce que vous pourriez ressentir</h4>
              <BulletList 
                color="pink"
                items={[
                  "Anxiété liée aux risques statistiques",
                  "Pression du \"temps qui passe\"",
                  "Culpabilité de ne pas avoir commencé plus tôt",
                  "Fatigue différente de celle des jeunes mamans",
                  "Questionnements sur la conciliation travail/famille"
                ]}
              />
            </div>
            
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Ressources d'aide
              </h4>
              <BulletList 
                color="teal"
                items={[
                  "Entretien prénatal précoce (gratuit, avec une sage-femme)",
                  "Psychologue spécialisé en périnatalité",
                  "Groupes de parole entre futures mamans",
                  "Applications et forums de soutien",
                  "Accompagnement par une doula"
                ]}
              />
            </div>
            
            <Card className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-purple-800">
                <strong>N'oubliez pas :</strong> Vous avez la maturité, l'expérience et la stabilité 
                de votre côté. Ce sont des atouts précieux pour accueillir un enfant ! 💜
              </p>
            </Card>
          </div>
        </CollapsibleSection>

        {/* Section 6: Avantages */}
        <CollapsibleSection 
          title="Les avantages d'être maman plus tard" 
          icon={Users} 
          color="pink"
          isOpen={openSections.positive}
          onToggle={() => toggleSection('positive')}
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4">
              <BulletList 
                color="pink"
                items={[
                  "Plus grande stabilité émotionnelle et financière",
                  "Maturité et patience accrues",
                  "Carrière souvent bien établie",
                  "Meilleure connaissance de soi et de ses limites",
                  "Couple généralement plus solide",
                  "Décision mûrement réfléchie et désirée",
                  "Expérience de vie enrichissante à transmettre"
                ]}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Conseils pratiques */}
        <Card className="bg-gradient-to-br from-teal-100 to-cyan-100 rounded-3xl p-6 border-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Conseils pratiques</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-teal-500 font-bold">1.</span>
              Commencez l'acide folique 3 mois avant la conception
            </p>
            <p className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-teal-500 font-bold">2.</span>
              Consultez pour un bilan préconceptionnel
            </p>
            <p className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-teal-500 font-bold">3.</span>
              Optimisez votre hygiène de vie dès maintenant
            </p>
            <p className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-teal-500 font-bold">4.</span>
              N'attendez pas trop si des difficultés apparaissent (consultez après 6 mois)
            </p>
            <p className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-teal-500 font-bold">5.</span>
              Entourez-vous d'une équipe médicale de confiance
            </p>
          </div>
        </Card>

        {/* Bouton retour */}
        <Button
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full py-3 font-semibold"
        >
          Retour à l'accueil
        </Button>

        <div className="h-8" />
      </div>
    </div>
  );
}

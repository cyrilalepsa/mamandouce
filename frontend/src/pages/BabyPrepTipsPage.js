import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Heart, Stethoscope, FileText, Brain, Baby, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Calendar, Phone, Home, ShoppingBag, Users, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

// Styles glossy 3D nuage par couleur
const glossyStyles = {
  pink: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(252,231,243,0.9) 45%, rgba(251,207,232,0.75) 70%, rgba(249,168,212,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(244,114,182,0.25), 0 6px 12px -4px rgba(244,114,182,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(244,114,182,0.1)',
    border: '2px solid rgba(244,114,182,0.25)'
  },
  blue: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(224,242,254,0.9) 45%, rgba(186,230,253,0.75) 70%, rgba(125,211,252,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(56,189,248,0.25), 0 6px 12px -4px rgba(56,189,248,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(56,189,248,0.1)',
    border: '2px solid rgba(125,211,252,0.3)'
  },
  purple: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(243,232,255,0.9) 45%, rgba(233,213,255,0.75) 70%, rgba(216,180,254,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(168,85,247,0.25), 0 6px 12px -4px rgba(168,85,247,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(168,85,247,0.1)',
    border: '2px solid rgba(216,180,254,0.3)'
  },
  amber: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(254,243,199,0.9) 45%, rgba(253,230,138,0.75) 70%, rgba(251,191,36,0.5) 100%)',
    shadow: '0 10px 28px -6px rgba(245,158,11,0.25), 0 6px 12px -4px rgba(245,158,11,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(245,158,11,0.1)',
    border: '2px solid rgba(251,191,36,0.3)'
  }
};

// Map couleur catégorie -> style glossy
const categoryGlossyMap = {
  medical: 'pink',
  admin: 'blue',
  psychological: 'purple',
  practical: 'amber'
};

// Reflet glossy
const GlossyReflect = () => (
  {/* Voile blanc supprimé */}
);

const PREP_CATEGORIES = [
  {
    id: 'medical',
    title: 'Préparation médicale',
    icon: Stethoscope,
    color: 'from-rose-400 to-pink-500',
    bgColor: 'bg-rose-50',
    disclaimer: 'Ces informations ne remplacent pas l\'avis de votre médecin ou sage-femme.',
    items: [
      {
        title: 'Choix de la maternité',
        desc: 'Visitez plusieurs maternités avant le 6ème mois. Renseignez-vous sur : le niveau de la maternité (1, 2 ou 3), la présence d\'un pédiatre 24h/24, les pratiques (péridurale, positions d\'accouchement, peau à peau).',
        timeline: 'Avant 6 mois'
      },
      {
        title: 'Préparation à l\'accouchement',
        desc: 'Inscrivez-vous aux cours de préparation (8 séances remboursées). Plusieurs méthodes existent : classique, sophrologie, haptonomie, yoga prénatal, hypnose.',
        timeline: 'Dès 7 mois'
      },
      {
        title: 'Entretien prénatal précoce',
        desc: 'RDV individuel avec une sage-femme pour discuter de vos attentes, craintes et projet de naissance. Gratuit et remboursé.',
        timeline: '4ème mois'
      },
      {
        title: 'Dossier médical',
        desc: 'Préparez : carte vitale, carte de groupe sanguin, échographies, résultats d\'analyses. Gardez une copie dans votre valise maternité.',
        timeline: 'Avant 8 mois'
      },
      {
        title: 'Choix du pédiatre',
        desc: 'Prenez RDV avec plusieurs pédiatres pour trouver celui qui vous convient. Premier RDV bébé dans les 8 jours après la naissance.',
        timeline: 'Avant 8 mois'
      }
    ]
  },
  {
    id: 'admin',
    title: 'Démarches administratives',
    icon: FileText,
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50',
    items: [
      {
        title: 'Déclaration de grossesse',
        desc: 'À faire avant la fin du 3ème mois auprès de la CAF et de l\'Assurance Maladie. Vous recevrez votre carnet de maternité.',
        timeline: 'Avant 14 SA'
      },
      {
        title: 'Reconnaissance anticipée',
        desc: 'Pour les couples non mariés : le père peut reconnaître l\'enfant avant la naissance en mairie. Document utile en cas d\'urgence.',
        timeline: 'Dès que possible'
      },
      {
        title: 'Mode de garde',
        desc: 'Inscrivez-vous tôt ! Crèche : dès le 6ème mois de grossesse. Assistante maternelle : commencez les recherches au 5ème mois.',
        timeline: '5-6 mois'
      },
      {
        title: 'Congé maternité',
        desc: 'Informez votre employeur par lettre recommandée. Dates : 6 semaines avant (1er enfant) ou 8 semaines (3ème+). Sinon perte de 3 semaines.',
        timeline: 'Avant 7 mois'
      },
      {
        title: 'Prime de naissance',
        desc: 'Versée par la CAF au 7ème mois (sous conditions de ressources). Montant : environ 1000€. Pensez à déclarer votre grossesse tôt !',
        timeline: '7ème mois'
      },
      {
        title: 'Mutuelle bébé',
        desc: 'Ajoutez bébé à votre mutuelle dans les 3 mois suivant la naissance. Certaines mutuelles offrent des forfaits naissance.',
        timeline: 'À la naissance'
      }
    ]
  },
  {
    id: 'psychological',
    title: 'Préparation psychologique',
    icon: Brain,
    color: 'from-purple-400 to-violet-500',
    bgColor: 'bg-purple-50',
    items: [
      {
        title: 'Accepter les changements',
        desc: 'Votre corps, votre couple, votre quotidien vont changer. C\'est normal d\'avoir des peurs. Parlez-en avec votre partenaire ou un professionnel.',
        icon: Heart
      },
      {
        title: 'Projet de naissance',
        desc: 'Rédigez vos souhaits : péridurale ou non, positions, musique, peau à peau, allaitement... Partagez-le avec l\'équipe médicale.',
        icon: FileText
      },
      {
        title: 'Préparer l\'aîné',
        desc: 'Si vous avez déjà un enfant : impliquez-le, lisez des livres sur le sujet, ne faites pas de grands changements juste avant la naissance.',
        icon: Users
      },
      {
        title: 'Créer un réseau de soutien',
        desc: 'Identifiez les personnes qui pourront vous aider : famille, amis, voisins. Acceptez l\'aide, surtout les premières semaines.',
        icon: Users
      },
      {
        title: 'Prendre soin de soi',
        desc: 'Profitez des dernières semaines pour vous reposer, faire ce que vous aimez. Le sommeil et le bien-être sont précieux.',
        icon: Sparkles
      },
      {
        title: 'Baby blues vs Dépression',
        desc: 'Baby blues (3-10 jours) = normal. Si tristesse persistante > 2 semaines, parlez-en à votre médecin. L\'aide existe, n\'hésitez pas.',
        icon: AlertCircle
      }
    ]
  },
  {
    id: 'practical',
    title: 'Préparation pratique',
    icon: Home,
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    items: [
      {
        title: 'Chambre de bébé',
        desc: 'Essentiel : lit à barreaux aux normes, matelas ferme, gigoteuse (pas de couette), température 18-20°C, sans peluches dans le lit.',
        icon: Home
      },
      {
        title: 'Repas préparés',
        desc: 'Cuisinez et congelez des repas avant l\'accouchement. Vous n\'aurez pas le temps de cuisiner les premières semaines !',
        icon: ShoppingBag
      },
      {
        title: 'Trajet maternité',
        desc: 'Faites le trajet plusieurs fois. Prévoyez un itinéraire bis. Notez les numéros importants (maternité, sage-femme, taxi).',
        icon: Calendar
      },
      {
        title: 'Numéros d\'urgence',
        desc: 'Gardez à portée : maternité, SAMU (15), sage-femme, médecin, pédiatre. Enregistrez-les dans vos téléphones.',
        icon: Phone
      },
      {
        title: 'Installation siège auto',
        desc: 'Installez le siège auto (dos à la route obligatoire) avant l\'accouchement. Vérifiez qu\'il est bien fixé !',
        icon: Baby
      }
    ]
  }
];

function BabyPrepTipsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState('medical');

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
            data-testid="back-button"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Conseils & Préparation
            </h1>
            <p className="text-sm text-slate-500">Guide complet avant l'arrivée de bébé</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center">
            <Baby className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Disclaimer global */}
        <Card className="bg-amber-50 border-amber-200 rounded-2xl p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Ces conseils sont donnés à titre informatif et ne remplacent pas l'avis de votre médecin, sage-femme ou autre professionnel de santé.
            </p>
          </div>
        </Card>

        {/* Catégories accordéon avec effet glossy */}
        <div className="space-y-3">
          {PREP_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategory === category.id;
            const glossyColor = categoryGlossyMap[category.id] || 'pink';
            const style = glossyStyles[glossyColor];
            
            return (
              <div 
                key={category.id} 
                className="relative overflow-hidden rounded-2xl"
                style={{
                  background: style.bg,
                  boxShadow: style.shadow,
                  border: style.border
                }}
              >
                <GlossyReflect />
                {/* Header de catégorie */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="relative w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-slate-700">{category.title}</h2>
                    <p className="text-xs text-slate-500">{category.items.length} conseils</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {/* Contenu de catégorie */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {category.disclaimer && (
                      <p className="text-xs text-slate-500 italic bg-white/50 rounded-xl p-2">
                        {category.disclaimer}
                      </p>
                    )}
                    
                    {category.items.map((item, index) => (
                      <div 
                        key={index}
                        className="bg-white/70 backdrop-blur rounded-xl p-3"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-slate-700 text-sm">{item.title}</h3>
                              {item.timeline && (
                                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                  {item.timeline}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            N'hésitez pas à poser vos questions à votre sage-femme ou médecin
          </p>
        </div>
      </div>
    </div>
  );
}

export default BabyPrepTipsPage;

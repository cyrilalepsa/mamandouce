import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Baby, Moon, Thermometer, Droplets, AlertCircle, Heart, HelpCircle, Smile, Shield, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';

const FAQ_ITEMS = [
  {
    id: 'coliques',
    icon: AlertCircle,
    color: 'from-yellow-400 to-amber-500',
    question: 'Mon bébé pleure beaucoup le soir, est-ce des coliques ?',
    answer: 'Les coliques du nourrisson sont très fréquentes entre 2 semaines et 3-4 mois. Bébé pleure souvent en fin de journée, se tortille et a le ventre dur. Essayez le portage en écharpe, le massage du ventre dans le sens des aiguilles d\'une montre, ou la position "avion" (bébé sur l\'avant-bras, ventre contre votre main). Consultez si les pleurs sont accompagnés de fièvre, vomissements ou refus de manger.'
  },
  {
    id: 'sommeil',
    icon: Moon,
    color: 'from-blue-400 to-sky-500',
    question: 'Mon bébé ne dort que 30 minutes en journée, c\'est normal ?',
    answer: 'Oui ! Les cycles de sommeil d\'un nourrisson durent 30-45 minutes. Certains bébés enchaînent les cycles naturellement, d\'autres se réveillent entre chaque. Créez un environnement propice : obscurité, bruit blanc, emmaillotage. Les siestes s\'allongent généralement vers 4-6 mois. Un bébé de 0-3 mois dort en moyenne 14-17h par jour, mais de façon très fractionnée.'
  },
  {
    id: 'eczema',
    icon: Droplets,
    color: 'from-red-400 to-rose-500',
    question: 'Bébé a des plaques rouges sur les joues, que faire ?',
    answer: 'L\'eczéma atopique touche 15-20% des bébés. Les plaques rouges, sèches et qui démangent apparaissent souvent sur les joues, le front et les plis. Hydratez quotidiennement avec un émollient (Dexeryl, Lipikar). Évitez les bains trop chauds (max 37°C) et les savons classiques. Utilisez un syndet doux. Si les plaques suintent ou s\'infectent, consultez votre pédiatre pour un traitement adapté.'
  },
  {
    id: 'temperature',
    icon: Thermometer,
    color: 'from-green-400 to-emerald-500',
    question: 'À quelle température est-ce de la fièvre chez un nouveau-né ?',
    answer: 'Chez le nourrisson, la fièvre est définie à partir de 38°C en température rectale. ATTENTION : avant 3 mois, toute fièvre ≥ 38°C nécessite une consultation en urgence. Prenez toujours la température en rectal pour plus de fiabilité. Ne couvrez pas trop bébé, proposez-lui à boire régulièrement. Le paracétamol (Doliprane) est possible dès 3 kg sous avis médical.'
  },
  {
    id: 'allaitement',
    icon: Heart,
    color: 'from-violet-400 to-purple-500',
    question: 'Mon bébé tète très souvent, a-t-il assez de lait ?',
    answer: 'Un nouveau-né tète en moyenne 8 à 12 fois par jour, parfois plus lors des pics de croissance (jour 3, 3 semaines, 6 semaines, 3 mois). Les signes que bébé mange assez : 5-6 couches mouillées/jour, prise de poids régulière, bébé calme après les tétées. Le "cluster feeding" (tétées groupées le soir) est normal et stimule la production de lait. Faites confiance à votre corps !'
  },
  {
    id: 'regurgitations',
    icon: Baby,
    color: 'from-yellow-400 to-amber-500',
    question: 'Bébé régurgite après chaque biberon, dois-je m\'inquiéter ?',
    answer: 'Les régurgitations sont très courantes chez le nourrisson (le cardia n\'est pas encore mature). Elles sont bénignes si bébé prend du poids normalement et ne souffre pas. Gardez bébé en position verticale 20-30 min après le repas, fractionnez les biberons, faites des pauses rot. Consultez si les régurgitations sont en jet, verdâtres, ou accompagnées de perte de poids.'
  },
  {
    id: 'peau',
    icon: Smile,
    color: 'from-blue-400 to-sky-500',
    question: 'Bébé a des petits boutons blancs sur le visage, c\'est grave ?',
    answer: 'Les grains de milium (petits points blancs) et l\'acné du nourrisson (petits boutons rouges) sont très fréquents et bénins. Ils disparaissent spontanément en quelques semaines. Ne percez pas les boutons, nettoyez simplement le visage à l\'eau. Les croûtes de lait (squames jaunâtres sur le cuir chevelu) se traitent avec de l\'huile d\'amande douce et un brossage doux.'
  },
  {
    id: 'pleurs',
    icon: HelpCircle,
    color: 'from-red-400 to-rose-500',
    question: 'Comment savoir pourquoi mon bébé pleure ?',
    answer: 'Les causes principales : faim (porte les mains à la bouche), fatigue (bâille, se frotte les yeux), inconfort (couche sale, trop chaud/froid), besoin de contact (se calme dans les bras), douleur (pleurs aigus et soudains). Avec le temps, vous apprendrez à distinguer les différents pleurs. En cas de doute, la méthode des 5S de Harvey Karp peut aider : Swaddling, Side/Stomach, Shushing, Swinging, Sucking.'
  },
  {
    id: 'bain',
    icon: Sun,
    color: 'from-green-400 to-emerald-500',
    question: 'À quelle fréquence dois-je donner le bain ?',
    answer: 'Un bain tous les 2-3 jours suffit pour un nourrisson (leur peau est fragile). Entre les bains, nettoyez le visage, les mains, les plis et le siège avec un coton et de l\'eau. Eau à 37°C, pièce à 22-24°C. Le bain est aussi un moment de détente et de lien. Le cordon ombilical peut être immergé sans risque, séchez-le bien après.'
  },
  {
    id: 'securite',
    icon: Shield,
    color: 'from-violet-400 to-purple-500',
    question: 'Comment coucher bébé en toute sécurité ?',
    answer: 'Règles d\'or du sommeil sûr : TOUJOURS sur le dos, sur un matelas ferme et plat, sans oreiller, couette, tour de lit, peluches ni couverture. Gigoteuse adaptée à la température. Chambre entre 18-20°C. Bébé dans votre chambre (mais pas dans votre lit) les 6 premiers mois. Ces recommandations réduisent considérablement le risque de mort subite du nourrisson.'
  }
];

export default function FaqBabyPage() {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Cycle couleurs pour les icônes
  const cycleColors = [
    'from-yellow-400 to-amber-500',
    'from-blue-400 to-sky-500', 
    'from-red-400 to-rose-500',
    'from-green-400 to-emerald-500',
    'from-violet-400 to-purple-500',
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header texte brut */}
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
            <h1 className="text-2xl font-bold text-black" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Tout va bien ?
            </h1>
            <p className="text-sm text-slate-500">Les questions fréquentes des 0-6 premiers mois</p>
          </div>
        </div>

        {/* Message d'accueil */}
        <div className="mb-6 p-4 rounded-2xl" style={{
          background: 'linear-gradient(160deg, #ffffff 0%, #fefefe 15%, #fafafa 40%, #f5f5f7 65%, #f0f0f2 100%)',
          boxShadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}>
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-semibold text-black">Pas de panique !</span> Les premiers mois avec bébé soulèvent beaucoup de questions. 
            Voici les réponses aux inquiétudes les plus courantes des jeunes parents.
          </p>
        </div>

        {/* Questions/Réponses */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const logoColor = cycleColors[index % cycleColors.length];
            const isOpen = openItems[item.id];

            return (
              <div key={item.id} data-testid={`faq-item-${item.id}`}>
                {/* Question — Bombé 3D cliquable */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-all nacre-bombe"
                  style={{
                    background: 'linear-gradient(160deg, #ffffff 0%, #fefefe 15%, #fafafa 40%, #f5f5f7 65%, #f0f0f2 100%)',
                    boxShadow: isOpen 
                      ? '0 2px 8px -2px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(0,0,0,0.03), inset 2px 2px 6px rgba(255,255,255,0.9)'
                      : '0 6px 18px -4px rgba(0,0,0,0.1), 0 3px 8px -2px rgba(0,0,0,0.05), inset -4px -4px 10px rgba(0,0,0,0.05), inset 4px 4px 10px rgba(255,255,255,0.9)',
                    border: '1px solid rgba(255,255,255,0.9)',
                  }}
                  data-testid={`faq-btn-${item.id}`}
                >
                  <div className={`w-10 h-10 flex-shrink-0 bg-gradient-to-br ${logoColor} rounded-xl flex items-center justify-center`}
                    style={{ boxShadow: '0 3px 8px -1px rgba(0,0,0,0.15)' }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="flex-1 font-medium text-black text-sm">{item.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Réponse — Glossy Plat informatif */}
                {isOpen && (
                  <div 
                    className="mt-1 mx-2 p-4 rounded-xl animate-fade-in"
                    style={{
                      background: 'linear-gradient(160deg, #ffffff 0%, #fefefe 30%, #fafafa 100%)',
                      boxShadow: '0 2px 8px -4px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(240,240,242,0.8)',
                    }}
                    data-testid={`faq-answer-${item.id}`}
                  >
                    <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Note en bas */}
        <div className="mt-8 p-4 rounded-2xl text-center" style={{
          background: 'linear-gradient(160deg, #fff 0%, #fef 30%, #fdf 100%)',
          border: '1px solid rgba(252,231,243,0.5)',
        }}>
          <p className="text-xs text-slate-500">
            Ces informations sont données à titre indicatif. En cas de doute, consultez toujours votre pédiatre ou sage-femme.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Baby } from 'lucide-react';
import { getFetusImageUrl, getDefaultFetusImageUrl } from '../../utils/fetusAssets';

// Données d'évolution du bébé par semaine
const weeklyData = {
  4: {
    title: "L'implantation",
    size: "1-2 mm",
    weight: "< 1 g",
    fruit: "🫘 une graine de pavot",
    fruitEmoji: "🫘",
    description: "L'embryon s'implante dans la paroi utérine. C'est le moment où vous pourriez avoir un test positif !",
    development: "Le cœur commence à se former"
  },
  5: {
    title: "Formation du cœur",
    size: "2 mm",
    weight: "< 1 g",
    fruit: "🌱 une graine de sésame",
    fruitEmoji: "🌱",
    description: "Le tube cardiaque commence à battre ! Les premiers vaisseaux sanguins se développent.",
    development: "Les bourgeons des bras et des jambes apparaissent"
  },
  6: {
    title: "Premier battement",
    size: "4-5 mm",
    weight: "< 1 g",
    fruit: "🌾 un grain de riz",
    fruitEmoji: "🌾",
    description: "Le cœur bat maintenant à environ 110 battements par minute. Le tube neural se forme.",
    development: "Les traits du visage commencent à se dessiner"
  },
  8: {
    title: "Tous les organes",
    size: "1.6 cm",
    weight: "1 g",
    fruit: "🫐 une myrtille",
    fruitEmoji: "🫐",
    description: "Tous les organes vitaux sont maintenant présents ! Les doigts et orteils commencent à se former.",
    development: "Les membres se développent rapidement"
  },
  10: {
    title: "Un vrai bébé",
    size: "3 cm",
    weight: "4 g",
    fruit: "🍓 une fraise",
    fruitEmoji: "🍓",
    description: "Bébé passe d'embryon à fœtus ! Tous les organes vitaux sont en place et continuent de se développer.",
    development: "Les ongles commencent à pousser"
  },
  12: {
    title: "Fin du 1er trimestre",
    size: "5.4 cm",
    weight: "14 g",
    fruit: "🍋 un citron vert",
    fruitEmoji: "🍋",
    description: "Les traits du visage sont bien formés. Bébé peut maintenant ouvrir et fermer sa bouche.",
    development: "Les os commencent à durcir"
  },
  14: {
    title: "Mouvements actifs",
    size: "8.7 cm",
    weight: "43 g",
    fruit: "🍑 une pêche",
    fruitEmoji: "🍑",
    description: "Bébé bouge énormément ! Ses expressions faciales se développent.",
    development: "Le duvet (lanugo) commence à apparaître"
  },
  16: {
    title: "Coordination",
    size: "11.6 cm",
    weight: "100 g",
    fruit: "🥑 un avocat",
    fruitEmoji: "🥑",
    description: "Les mouvements deviennent plus coordonnés. Vous pourriez bientôt les sentir !",
    development: "Le système nerveux se perfectionne"
  },
  18: {
    title: "Vous le sentez !",
    size: "14 cm",
    weight: "190 g",
    fruit: "🥭 une mangue",
    fruitEmoji: "🥭",
    description: "C'est le moment magique où vous commencez vraiment à sentir bébé bouger !",
    development: "Le vernix caseosa recouvre la peau"
  },
  20: {
    title: "Mi-grossesse",
    size: "16.4 cm",
    weight: "300 g",
    fruit: "🍌 une banane",
    fruitEmoji: "🍌",
    description: "Vous êtes à la moitié ! Bébé entend maintenant votre voix et votre cœur.",
    development: "Les empreintes digitales se forment"
  },
  22: {
    title: "Sens développés",
    size: "27.8 cm",
    weight: "430 g",
    fruit: "🥥 une noix de coco",
    fruitEmoji: "🥥",
    description: "Bébé perçoit la lumière et réagit aux sons extérieurs.",
    development: "Les paupières et sourcils sont visibles"
  },
  24: {
    title: "Viabilité",
    size: "30 cm",
    weight: "600 g",
    fruit: "🌽 un épi de maïs",
    fruitEmoji: "🌽",
    description: "Si bébé naissait maintenant, il aurait des chances de survivre avec soins intensifs.",
    development: "Les poumons se préparent à respirer"
  },
  26: {
    title: "Respiration",
    size: "35.6 cm",
    weight: "760 g",
    fruit: "🥬 une laitue",
    fruitEmoji: "🥬",
    description: "Bébé pratique la respiration en inhalant du liquide amniotique.",
    development: "Les yeux peuvent s'ouvrir et se fermer"
  },
  28: {
    title: "3ème trimestre",
    size: "37.6 cm",
    weight: "1 kg",
    fruit: "🍆 une aubergine",
    fruitEmoji: "🍆",
    description: "Bienvenue au dernier trimestre ! Bébé grandit très rapidement maintenant.",
    development: "La graisse sous-cutanée s'accumule"
  },
  30: {
    title: "Croissance rapide",
    size: "39.9 cm",
    weight: "1.3 kg",
    fruit: "🥒 un concombre",
    fruitEmoji: "🥒",
    description: "Bébé prend environ 200g par semaine ! Ses cycles de sommeil sont réguliers.",
    development: "Le cerveau se développe rapidement"
  },
  32: {
    title: "Position finale",
    size: "42.4 cm",
    weight: "1.7 kg",
    fruit: "🥖 une baguette",
    fruitEmoji: "🥖",
    description: "Bébé commence probablement à se positionner tête en bas pour la naissance.",
    development: "Les ongles atteignent le bout des doigts"
  },
  34: {
    title: "Presque prêt",
    size: "45 cm",
    weight: "2.1 kg",
    fruit: "🎃 une petite citrouille",
    fruitEmoji: "🎃",
    description: "Les poumons sont presque complètement matures. Bébé est presque prêt !",
    development: "Le vernix s'épaissit pour protéger la peau"
  },
  36: {
    title: "À terme précoce",
    size: "47.4 cm",
    weight: "2.6 kg",
    fruit: "🍉 un melon",
    fruitEmoji: "🍉",
    description: "Si bébé naît maintenant, il est considéré comme à terme précoce.",
    development: "La peau devient lisse et rose"
  },
  38: {
    title: "Prêt à naître",
    size: "49.8 cm",
    weight: "3 kg",
    fruit: "🍍 un ananas",
    fruitEmoji: "🍍",
    description: "Bébé est prêt ! Il pourrait arriver n'importe quel jour maintenant.",
    development: "Tous les organes sont matures"
  },
  40: {
    title: "Date prévue",
    size: "51 cm",
    weight: "3.4 kg",
    fruit: "🎃 une citrouille",
    fruitEmoji: "🎃",
    description: "C'est le grand jour prévu ! Mais rappelez-vous, seulement 5% des bébés naissent pile à la date prévue.",
    development: "Bébé est prêt à découvrir le monde !"
  }
};

const getFetuImage = (week) => getFetusImageUrl(week);

const BabyEvolutionWidget = () => {
  const [selectedWeek, setSelectedWeek] = useState(12);
  const [data, setData] = useState(weeklyData[12]);

  useEffect(() => {
    // Charger la semaine actuelle de grossesse si disponible
    const storedProfile = localStorage.getItem('pregnancyProfile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        if (profile.current_week) {
          const week = Math.min(40, Math.max(4, Math.floor(profile.current_week)));
          setSelectedWeek(week);
          setData(weeklyData[week] || weeklyData[12]);
        }
      } catch (e) {
        console.error('Error loading pregnancy profile:', e);
      }
    }
  }, []);

  const handleWeekChange = (e) => {
    const week = parseInt(e.target.value);
    if (week >= 4 && week <= 40) {
      setSelectedWeek(week);
      setData(weeklyData[week] || weeklyData[12]);
    }
  };

  if (!data) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6" data-testid="baby-evolution-widget">
      {/* Champ de saisie de la semaine */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <label 
          htmlFor="week-input" 
          className="text-sm font-semibold"
          style={{ color: '#4A4A4A' }}
        >
          Semaine de grossesse :
        </label>
        <input
          id="week-input"
          type="number"
          min="4"
          max="40"
          value={selectedWeek}
          onChange={handleWeekChange}
          className="w-20 px-3 py-2 text-center font-bold text-lg border-2 focus:outline-none focus:ring-2"
          style={{
            borderRadius: '16px',
            borderColor: '#FFD1DC',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#4A4A4A',
            boxShadow: '0 4px 12px rgba(255, 183, 197, 0.2)',
            transition: 'all 0.3s ease'
          }}
        />
      </div>

      {/* Badge Semaine */}
      <div 
        className="inline-flex items-center gap-2 px-6 py-2 mb-4"
        style={{
          background: 'linear-gradient(135deg, #FFD1DC 0%, #FFB7C5 100%)',
          borderRadius: '24px',
          boxShadow: '0 4px 16px rgba(255, 183, 197, 0.3)',
          color: 'white',
          fontWeight: '600',
          fontSize: '0.95rem'
        }}
      >
        <Baby size={18} />
        Semaine {selectedWeek}
      </div>

      {/* Titre principal */}
      <h2 
        className="text-3xl font-bold mb-6"
        style={{ 
          color: '#4A4A4A',
          fontFamily: "'Nunito', sans-serif"
        }}
      >
        {data.title}
      </h2>

      {/* Bloc central : Image bébé + fruit */}
      <div 
        className="relative mb-6 p-8 flex items-center justify-center gap-8"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 250, 252, 0.95) 0%, rgba(255, 245, 248, 0.9) 100%)',
          backdropFilter: 'none',
          borderRadius: '32px',
          boxShadow: '0 8px 32px rgba(255, 183, 197, 0.15), 0 2px 8px rgba(255, 183, 197, 0.1)',
          border: '1px solid rgba(255, 220, 230, 0.5)',
          minHeight: '280px'
        }}
      >
        {/* Emoji du fruit - à gauche */}
        <div 
          className="text-7xl"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
          }}
        >
          {data.fruitEmoji}
        </div>

        {/* Image du bébé 3D */}
        <div className="relative">
          <img
            src={getFetuImage(selectedWeek)}
            alt={`Bébé semaine ${selectedWeek}`}
            className="w-48 h-48 object-contain"
            style={{
              filter: 'drop-shadow(0 8px 16px rgba(255, 183, 197, 0.3))'
            }}
            onError={(e) => {
              if (e.target.dataset.fallbackApplied === '1') {
                e.target.style.display = 'none';
                return;
              }
              e.target.dataset.fallbackApplied = '1';
              e.target.src = getDefaultFetusImageUrl();
            }}
          />
        </div>
      </div>

      {/* Blocs Taille et Poids côte à côte */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Bloc Taille */}
        <div 
          className="p-5 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(173, 216, 230, 0.3) 0%, rgba(135, 206, 235, 0.2) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(135, 206, 235, 0.3)',
            boxShadow: '0 4px 16px rgba(135, 206, 235, 0.15)'
          }}
        >
          <div 
            className="text-sm font-medium mb-2"
            style={{ color: '#6B7280' }}
          >
            Taille
          </div>
          <div 
            className="text-2xl font-bold"
            style={{ color: '#0EA5E9' }}
          >
            {data.size}
          </div>
        </div>

        {/* Bloc Poids */}
        <div 
          className="p-5 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(255, 192, 203, 0.2) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 182, 193, 0.4)',
            boxShadow: '0 4px 16px rgba(255, 183, 197, 0.15)'
          }}
        >
          <div 
            className="text-sm font-medium mb-2"
            style={{ color: '#6B7280' }}
          >
            Poids
          </div>
          <div 
            className="text-2xl font-bold"
            style={{ color: '#EC4899' }}
          >
            {data.weight}
          </div>
        </div>
      </div>

      {/* Bloc de comparaison (jaune crème) */}
      <div 
        className="p-5 mb-5 text-center"
        style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          boxShadow: '0 4px 16px rgba(251, 191, 36, 0.15)'
        }}
      >
        <span 
          className="text-base font-semibold"
          style={{ color: '#92400E' }}
        >
          Taille comparable à : {data.fruit}
        </span>
      </div>

      {/* Bloc de texte explicatif */}
      <div 
        className="p-6 mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 250, 252, 0.9) 100%)',
          borderRadius: '28px',
          border: '1px solid rgba(255, 220, 230, 0.4)',
          boxShadow: '0 6px 24px rgba(255, 183, 197, 0.12)'
        }}
      >
        <p 
          className="text-base leading-relaxed"
          style={{ 
            color: '#4A4A4A',
            fontFamily: "'Quicksand', sans-serif"
          }}
        >
          {data.description}
        </p>
      </div>

      {/* Section Développement */}
      <div 
        className="p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(243, 244, 246, 0.8) 0%, rgba(249, 250, 251, 0.7) 100%)',
          borderRadius: '28px',
          border: '1px solid rgba(209, 213, 219, 0.4)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
        }}
      >
        <h3 
          className="text-xl font-bold mb-3"
          style={{ 
            color: '#4A4A4A',
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          Développement
        </h3>
        <p 
          className="text-base"
          style={{ 
            color: '#6B7280',
            fontFamily: "'Quicksand', sans-serif"
          }}
        >
          {data.development}
        </p>
      </div>
    </div>
  );
};

export default BabyEvolutionWidget;

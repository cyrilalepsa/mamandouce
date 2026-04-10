/**
 * Baby3DContainer.jsx
 * Composant avec image hyperréaliste du bébé
 * Effet veilleuse (halos lumineux pastel) derrière l'image
 * Thème: Doux, Pastel et Lumineux
 */
import { useTheme } from '../../contexts/ThemeContext';

// Images hyperréalistes du fœtus par semaine (20 images uniques générées par IA)
const FETUS_IMAGES = {
  // Semaines 1-4: Embryon précoce
  1: '/assets/fetus/week-04.png',
  2: '/assets/fetus/week-04.png',
  3: '/assets/fetus/week-04.png',
  4: '/assets/fetus/week-04.png',
  // Semaines 5-6: Embryon avec bourgeon cardiaque
  5: '/assets/fetus/week-05.png',
  6: '/assets/fetus/week-06.png',
  // Semaines 7-8: Embryon - membres visibles
  7: '/assets/fetus/week-08.png',
  8: '/assets/fetus/week-08.png',
  // Semaines 9-10: Transition embryon/fœtus
  9: '/assets/fetus/week-10.png',
  10: '/assets/fetus/week-10.png',
  // Semaines 11-12: Fœtus - traits du visage
  11: '/assets/fetus/week-12.png',
  12: '/assets/fetus/week-12.png',
  // Semaines 13-14: Fœtus - coordination
  13: '/assets/fetus/week-14.png',
  14: '/assets/fetus/week-14.png',
  // Semaines 15-16: Fœtus - mouvements actifs
  15: '/assets/fetus/week-16.png',
  16: '/assets/fetus/week-16.png',
  // Semaines 17-18: Fœtus - vernix caseosa
  17: '/assets/fetus/week-18.png',
  18: '/assets/fetus/week-18.png',
  // Semaines 19-20: Fœtus - mi-grossesse
  19: '/assets/fetus/week-20.png',
  20: '/assets/fetus/week-20.png',
  // Semaines 21-22: Fœtus - lanugo visible
  21: '/assets/fetus/week-22.png',
  22: '/assets/fetus/week-22.png',
  // Semaines 23-24: Fœtus - yeux s'ouvrent
  23: '/assets/fetus/week-24.png',
  24: '/assets/fetus/week-24.png',
  // Semaines 25-26: Fœtus - respiration
  25: '/assets/fetus/week-26.png',
  26: '/assets/fetus/week-26.png',
  // Semaines 27-28: Fœtus - graisse sous-cutanée
  27: '/assets/fetus/week-28.png',
  28: '/assets/fetus/week-28.png',
  // Semaines 29-30: Fœtus - croissance rapide
  29: '/assets/fetus/week-30.png',
  30: '/assets/fetus/week-30.png',
  // Semaines 31-32: Fœtus - peau lisse
  31: '/assets/fetus/week-32.png',
  32: '/assets/fetus/week-32.png',
  // Semaines 33-34: Fœtus - poumons matures
  33: '/assets/fetus/week-34.png',
  34: '/assets/fetus/week-34.png',
  // Semaines 35-36: Fœtus - position céphalique
  35: '/assets/fetus/week-36.png',
  36: '/assets/fetus/week-36.png',
  // Semaines 37-38: Fœtus à terme précoce
  37: '/assets/fetus/week-38.png',
  38: '/assets/fetus/week-38.png',
  // Semaines 39-42: Bébé prêt à naître
  39: '/assets/fetus/week-40.png',
  40: '/assets/fetus/week-40.png',
  41: '/assets/fetus/week-40.png',
  42: '/assets/fetus/week-40.png',
};

// Image par défaut (semaine 22)
const DEFAULT_IMAGE = '/assets/bebe-foetus.png';

export default function Baby3DContainer({ 
  week = 22,
  height = '340px',
  className = ''
}) {
  const { isDarkMode } = useTheme();
  
  // Sélectionner l'image selon la semaine
  const imageSrc = FETUS_IMAGES[week] || DEFAULT_IMAGE;

  // Couleurs des halos - PASTEL LUMINEUX
  const glowOuter = isDarkMode 
    ? 'rgba(232, 164, 184, 0.2)' 
    : 'rgba(255, 218, 233, 0.6)';  // Rose poudré très pâle
  const glowMiddle = isDarkMode 
    ? 'rgba(200, 180, 220, 0.15)' 
    : 'rgba(230, 210, 255, 0.5)';  // Lavande très claire
  const glowInner = isDarkMode 
    ? 'rgba(245, 240, 235, 0.12)' 
    : 'rgba(255, 250, 245, 0.8)';  // Blanc nacré / pêche

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ height, width: '100%' }}
      data-testid="baby-image-container"
    >
      {/* Halo externe - Rose poudré diffus */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '380px',
          height: '380px',
          background: `radial-gradient(circle, ${glowOuter} 0%, ${glowMiddle} 50%, transparent 80%)`,
          filter: 'blur(40px)',
          animation: 'haloOuter 5s ease-in-out infinite'
        }}
      />
      
      {/* Halo intermédiaire - Lavande */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${glowMiddle} 0%, ${glowInner} 60%, transparent 90%)`,
          filter: 'blur(30px)',
          animation: 'haloMiddle 4s ease-in-out infinite'
        }}
      />
      
      {/* Halo central - Blanc nacré lumineux */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '220px',
          height: '220px',
          background: `radial-gradient(circle, ${glowInner} 0%, rgba(255,245,250,0.4) 50%, transparent 80%)`,
          filter: 'blur(20px)',
          animation: 'haloInner 3.5s ease-in-out infinite'
        }}
      />
      
      {/* Image hyperréaliste du bébé */}
      <img 
        src={imageSrc}
        alt="Votre bébé"
        className="relative z-10"
        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
        style={{
          maxWidth: '260px',
          maxHeight: '260px',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          filter: isDarkMode 
            ? 'drop-shadow(0 8px 30px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 40px rgba(232, 164, 184, 0.2))' 
            : 'drop-shadow(0 6px 20px rgba(236, 72, 153, 0.15)) drop-shadow(0 0 50px rgba(255, 200, 220, 0.4))',
          animation: 'floatBaby 6s ease-in-out infinite'
        }}
      />
      
      <style>{`
        @keyframes floatBaby {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes haloOuter {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.03); }
        }
        @keyframes haloMiddle {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.02); }
        }
        @keyframes haloInner {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.015); }
        }
      `}</style>
    </div>
  );
}

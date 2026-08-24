/**
 * Baby3DContainer.jsx
 * Composant avec image hyperréaliste du bébé
 * Effet veilleuse (halos lumineux pastel) derrière l'image
 * Thème: Doux, Pastel et Lumineux
 *
 * Assets : CDN Cloudinary (res.cloudinary.com) via fetusAssets
 * Fallback local /assets/fetus/* si le CDN n'est pas encore injecté.
 */
import { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getFetusImageUrl,
  getDefaultFetusImageUrl,
  DEFAULT_FETUS_IMAGE,
  FETUS_WEEK_FILES,
  localFetusPath,
  subscribeCloudinary,
} from '../../utils/fetusAssets';

export default function Baby3DContainer({ 
  week = 22,
  height = '340px',
  className = ''
}) {
  const { isDarkMode } = useTheme();
  const [, setCdnTick] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  useEffect(() => subscribeCloudinary(() => setCdnTick((n) => n + 1)), []);
  
  const imageSrc = getFetusImageUrl(week);
  const localWeek = localFetusPath(FETUS_WEEK_FILES[week] || 'week-22.png');
  const fallbackSrc = getDefaultFetusImageUrl() || DEFAULT_FETUS_IMAGE;
  const imageCandidates = [...new Set([
    imageSrc,
    localWeek,
    fallbackSrc,
    DEFAULT_FETUS_IMAGE,
  ].filter(Boolean))];
  const activeImageSrc = imageCandidates[fallbackIndex];

  useEffect(() => {
    setImageFailed(false);
    setFallbackIndex(0);
  }, [week]);

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
      {!imageFailed ? <img
        src={activeImageSrc}
        alt="Votre bébé"
        className="relative z-10"
        onError={() => {
          if (fallbackIndex + 1 < imageCandidates.length) {
            setFallbackIndex((index) => index + 1);
          } else {
            setImageFailed(true);
          }
        }}
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
      /> : (
        <div
          className="relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center text-center px-6"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(252,231,243,0.65))',
            border: '1px solid rgba(244,114,182,0.25)',
          }}
          data-testid="baby-image-fallback"
        >
          <span className="text-5xl" aria-hidden="true">👶</span>
          <span className="text-xs text-pink-600 mt-2">Illustration bientôt disponible</span>
        </div>
      )}
      
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

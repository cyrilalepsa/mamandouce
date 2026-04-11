import React from 'react';
import { AvatarPreview } from './AvatarBuilder';

/**
 * PremiumSunAvatar - Avatar avec aura solaire ÉLÉGANTE pour les utilisateurs Premium
 * Soleil de taille raisonnable avec rayons BLANCS qui pulsent délicatement
 * VERSION PREMIUM CHIC ET ÉPURÉE
 */
function PremiumSunAvatar({ 
  isPremium = false, 
  userAvatar = null, 
  userAvatarConfig = null,
  size = 64,
  onClick,
  title,
  testId = "premium-sun-avatar"
}) {
  
  // Avatar de base (sans aura)
  const renderAvatar = () => (
    <div className="w-full h-full rounded-full overflow-hidden">
      {userAvatar ? (
        <img 
          src={userAvatar} 
          alt="Avatar" 
          className="w-full h-full object-cover"
          data-testid={`${testId}-image`}
        />
      ) : userAvatarConfig ? (
        <AvatarPreview config={userAvatarConfig} size={size} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center" data-testid={`${testId}-default`}>
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-white/90" fill="currentColor">
            <circle cx="12" cy="6" r="4" />
            <path d="M12 12c-4 0-6 2-6 4v1c0 .5.2 1 .6 1.3.5.4 1.2.7 2.4.7h6c1.2 0 1.9-.3 2.4-.7.4-.3.6-.8.6-1.3v-1c0-2-2-4-6-4z" />
            <path d="M9 19c-.3 1.5-.5 2.5-.5 3h7c0-.5-.2-1.5-.5-3H9z" />
          </svg>
        </div>
      )}
    </div>
  );

  // Si pas Premium, rendu simple sans aura
  if (!isPremium) {
    return (
      <div 
        className="rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        style={{ width: `${size}px`, height: `${size}px` }}
        onClick={onClick}
        title={title}
        data-testid={testId}
      >
        {renderAvatar()}
      </div>
    );
  }

  // RENDU PREMIUM - Soleil élégant avec rayons blancs
  const auraSize = size + 70; // Taille raisonnable : 134px total (64 + 70)
  const rayLength = size * 0.7; // Rayons proportionnés : ~45px

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ 
        width: `${auraSize}px`, 
        height: `${auraSize}px`
      }}
      data-testid={`${testId}-premium`}
    >
      {/* AURA DORÉE DOUCE - Taille élégante qui respire */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.5) 0%, rgba(253, 224, 71, 0.35) 25%, rgba(250, 204, 21, 0.2) 50%, rgba(252, 211, 77, 0.1) 70%, transparent 100%)',
          filter: 'blur(8px)',
          animation: 'elegant-pulse 3s ease-in-out infinite'
        }}
      />
      
      {/* RAYONS BLANCS ÉLÉGANTS - 12 rayons qui pulsent délicatement */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`white-ray-${i}`}
          className="absolute"
          style={{
            width: '3px',
            height: `${rayLength}px`,
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0.4) 70%, transparent 100%)',
            transformOrigin: 'center bottom',
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 30}deg) translateY(-${size / 2 + 5}px)`,
            opacity: 0.8,
            animation: `white-ray-pulse ${3 + (i % 3) * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.12}s`,
            filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))'
          }}
        />
      ))}
      
      {/* HALO DORÉ DOUX - Lumière dorée qui pulse autour de l'avatar */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${size + 40}px`,
          height: `${size + 40}px`,
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.4) 0%, rgba(253, 224, 71, 0.25) 50%, transparent 100%)',
          filter: 'blur(6px)',
          animation: 'halo-breathe 2.5s ease-in-out infinite alternate'
        }}
      />
      
      {/* AVATAR CENTRAL avec BORDURE DORÉE ÉLÉGANTE */}
      <div 
        className="relative rounded-full overflow-hidden border-4 shadow-2xl flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all z-10"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          borderColor: '#fbbf24',
          boxShadow: '0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(254, 240, 138, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.3)'
        }}
        onClick={onClick}
        title={title}
      >
        {renderAvatar()}
      </div>
      
      {/* STYLES CSS POUR LES ANIMATIONS ÉLÉGANTES */}
      <style jsx>{`
        @keyframes elegant-pulse {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
        
        @keyframes white-ray-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: translateX(-50%) rotate(var(--rotation)) translateY(var(--distance)) scaleY(0.95);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) rotate(var(--rotation)) translateY(var(--distance)) scaleY(1.05);
          }
        }
        
        @keyframes halo-breathe {
          0% {
            opacity: 0.6;
            transform: scale(0.98);
          }
          100% {
            opacity: 0.9;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}

export default PremiumSunAvatar;

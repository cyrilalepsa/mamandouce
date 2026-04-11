import React from 'react';
import { AvatarPreview } from './AvatarBuilder';

/**
 * PremiumSunAvatar - Avatar avec effet "AURORE STELLAIRE" VERSION FINALE
 * Rayons jaunes à ondulation lente + Poussière d'étoiles blanches scintillantes
 * Chaleureux, sophistiqué et plein de vie
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

  // RENDU PREMIUM - AURORE STELLAIRE FINALE
  const auraSize = size + 90; // 154px total
  const rayLength = size * 0.9; // ~58px

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ 
        width: `${auraSize}px`, 
        height: `${auraSize}px`
      }}
      data-testid={`${testId}-premium`}
    >
      {/* GRANDE AURA DORÉE TRÈS DIFFUSE - Base chaude */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 247, 205, 0.7) 0%, rgba(254, 240, 138, 0.6) 15%, rgba(253, 224, 71, 0.45) 30%, rgba(250, 204, 21, 0.3) 50%, rgba(252, 211, 77, 0.15) 70%, rgba(251, 191, 36, 0.05) 85%, transparent 100%)',
          filter: 'blur(12px)',
          animation: 'aurora-breathe 4s ease-in-out infinite'
        }}
      />
      
      {/* COUCHE INTERMÉDIAIRE DORÉE */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${size + 60}px`,
          height: `${size + 60}px`,
          background: 'radial-gradient(circle, rgba(255, 247, 205, 0.6) 0%, rgba(254, 240, 138, 0.45) 30%, rgba(253, 224, 71, 0.25) 60%, transparent 100%)',
          filter: 'blur(8px)',
          animation: 'aurora-breathe 3.5s ease-in-out infinite alternate'
        }}
      />
      
      {/* RAYONS JAUNES DORÉS - Ondulation TRÈS LENTE (18 rayons principaux) */}
      {[...Array(18)].map((_, i) => (
        <div
          key={`golden-ray-${i}`}
          className="absolute"
          style={{
            width: '3px',
            height: `${rayLength}px`,
            background: 'linear-gradient(to bottom, rgba(254, 240, 138, 0.9) 0%, rgba(253, 224, 71, 0.8) 25%, rgba(250, 204, 21, 0.6) 50%, rgba(252, 211, 77, 0.4) 75%, transparent 100%)',
            transformOrigin: 'center bottom',
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 20}deg) translateY(-${size / 2 + 5}px)`,
            opacity: 0.75,
            animation: `ray-slow-float ${10 + (i % 4) * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            filter: 'drop-shadow(0 0 3px rgba(254, 240, 138, 0.6))',
            '--ray-rotation': `${i * 20}deg`
          }}
        />
      ))}
      
      {/* RAYONS JAUNES SECONDAIRES - Ondulation encore plus lente (18 rayons) */}
      {[...Array(18)].map((_, i) => (
        <div
          key={`secondary-golden-ray-${i}`}
          className="absolute"
          style={{
            width: '2px',
            height: `${rayLength * 0.7}px`,
            background: 'linear-gradient(to bottom, rgba(253, 224, 71, 0.7) 0%, rgba(250, 204, 21, 0.6) 40%, rgba(252, 211, 77, 0.4) 70%, transparent 100%)',
            transformOrigin: 'center bottom',
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 20 + 10}deg) translateY(-${size / 2 + 5}px)`,
            opacity: 0.65,
            animation: `ray-ultra-slow-float ${13 + (i % 3) * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            filter: 'drop-shadow(0 0 2px rgba(253, 224, 71, 0.5))'
          }}
        />
      ))}
      
      {/* COUCHE POUSSIÈRE D'ÉTOILES BLANCHES - Scintillement aléatoire (25 étoiles) */}
      {[...Array(25)].map((_, i) => {
        const angle = (i * 14.4) * (Math.PI / 180);
        const distance = size * 0.6 + (i % 5) * 10;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const starSize = 1.5 + (i % 3) * 0.5;
        
        return (
          <div
            key={`star-dust-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${starSize}px`,
              height: `${starSize}px`,
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.9) 30%, transparent 70%)',
              animation: `star-fade ${3 + (i % 7) * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.9), 0 0 4px rgba(254, 240, 138, 0.5)',
              zIndex: 6,
              opacity: 0
            }}
          />
        );
      })}
      
      {/* POUSSIÈRE D'ÉTOILES BLANCHES SUPPLÉMENTAIRE - Cercle extérieur (20 étoiles) */}
      {[...Array(20)].map((_, i) => {
        const angle = (i * 18 + 9) * (Math.PI / 180);
        const distance = size * 0.75 + (i % 4) * 8;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const starSize = 1 + (i % 2) * 0.5;
        
        return (
          <div
            key={`outer-star-dust-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${starSize}px`,
              height: `${starSize}px`,
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 40%, transparent 80%)',
              animation: `star-fade-delayed ${4 + (i % 6) * 0.7}s ease-in-out infinite`,
              animationDelay: `${i * 0.25 + 1}s`,
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
              zIndex: 5,
              opacity: 0
            }}
          />
        );
      })}
      
      {/* HALO DORÉ PROCHE */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${size + 35}px`,
          height: `${size + 35}px`,
          background: 'radial-gradient(circle, rgba(255, 247, 205, 0.5) 0%, rgba(254, 240, 138, 0.35) 40%, rgba(253, 224, 71, 0.2) 70%, transparent 100%)',
          filter: 'blur(5px)',
          animation: 'halo-pulse 3.5s ease-in-out infinite alternate'
        }}
      />
      
      {/* AVATAR CENTRAL avec BORDURE DORÉE */}
      <div 
        className="relative rounded-full overflow-hidden border-4 shadow-2xl flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all z-10"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          borderColor: '#fbbf24',
          boxShadow: '0 0 25px rgba(254, 240, 138, 0.6), 0 0 45px rgba(253, 224, 71, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.4)'
        }}
        onClick={onClick}
        title={title}
      >
        {renderAvatar()}
      </div>
      
      {/* STYLES CSS - ANIMATIONS FINALES HARMONIEUSES */}
      <style jsx>{`
        @keyframes aurora-breathe {
          0%, 100% {
            opacity: 0.75;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.08) rotate(3deg);
          }
        }
        
        @keyframes ray-slow-float {
          0%, 100% {
            opacity: 0.65;
            transform: translateX(-50%) rotate(var(--ray-rotation, 0deg)) translateY(-${size / 2 + 5}px) scaleY(0.96);
          }
          25% {
            opacity: 0.8;
            transform: translateX(-50%) rotate(calc(var(--ray-rotation, 0deg) + 1.5deg)) translateY(-${size / 2 + 5}px) scaleY(1.02);
          }
          50% {
            opacity: 0.75;
            transform: translateX(-50%) rotate(calc(var(--ray-rotation, 0deg) + 0.5deg)) translateY(-${size / 2 + 5}px) scaleY(1.04);
          }
          75% {
            opacity: 0.7;
            transform: translateX(-50%) rotate(calc(var(--ray-rotation, 0deg) - 1deg)) translateY(-${size / 2 + 5}px) scaleY(0.98);
          }
        }
        
        @keyframes ray-ultra-slow-float {
          0%, 100% {
            opacity: 0.55;
            transform: translateX(-50%) rotate(var(--ray-rotation, 0deg)) translateY(-${size / 2 + 5}px) scaleY(0.94);
          }
          33% {
            opacity: 0.75;
            transform: translateX(-50%) rotate(calc(var(--ray-rotation, 0deg) + 1deg)) translateY(-${size / 2 + 5}px) scaleY(1.03);
          }
          66% {
            opacity: 0.65;
            transform: translateX(-50%) rotate(calc(var(--ray-rotation, 0deg) - 1.2deg)) translateY(-${size / 2 + 5}px) scaleY(0.97);
          }
        }
        
        @keyframes star-fade {
          0%, 100% {
            opacity: 0;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.3);
          }
          5% {
            opacity: 0.3;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.6);
          }
          15% {
            opacity: 0.9;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.2);
          }
          30% {
            opacity: 1;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(1);
          }
          70% {
            opacity: 0.95;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.95);
          }
          85% {
            opacity: 0.5;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.7);
          }
          95% {
            opacity: 0.1;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.4);
          }
        }
        
        @keyframes star-fade-delayed {
          0%, 100% {
            opacity: 0;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.2);
          }
          8% {
            opacity: 0.4;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.7);
          }
          20% {
            opacity: 0.85;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.1);
          }
          35% {
            opacity: 1;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.9);
          }
          65% {
            opacity: 0.9;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.85);
          }
          80% {
            opacity: 0.4;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.6);
          }
          92% {
            opacity: 0.15;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.3);
          }
        }
        
        @keyframes halo-pulse {
          0% {
            opacity: 0.65;
            transform: scale(0.98);
          }
          100% {
            opacity: 0.85;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}

export default PremiumSunAvatar;

import React from 'react';
import { AvatarPreview } from './AvatarBuilder';

/**
 * PremiumSunAvatar - Avatar avec effet "AURORE STELLAIRE" pour les utilisateurs Premium
 * Fusion : Grande aura dorée diffuse + Rayons blancs éclatants + Scintillements permanents + Ondulation fluide
 * VERSION FINALE - Chaleureux, sophistiqué et plein de vie
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

  // RENDU PREMIUM - AURORE STELLAIRE
  const auraSize = size + 90; // Taille équilibrée : 154px total
  const rayLength = size * 0.9; // Rayons bien visibles : ~58px

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ 
        width: `${auraSize}px`, 
        height: `${auraSize}px`
      }}
      data-testid={`${testId}-premium`}
    >
      {/* GRANDE AURA DORÉE TRÈS DIFFUSE - Effet Aurore (du 2ème visuel) */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 247, 205, 0.7) 0%, rgba(254, 240, 138, 0.6) 15%, rgba(253, 224, 71, 0.45) 30%, rgba(250, 204, 21, 0.3) 50%, rgba(252, 211, 77, 0.15) 70%, rgba(251, 191, 36, 0.05) 85%, transparent 100%)',
          filter: 'blur(12px)',
          animation: 'aurora-breathe 4s ease-in-out infinite'
        }}
      />
      
      {/* COUCHE INTERMÉDIAIRE DORÉE - Plus de profondeur */}
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
      
      {/* RAYONS BLANCS ÉCLATANTS ET NOMBREUX - Du 1er visuel (18 rayons nets) */}
      {[...Array(18)].map((_, i) => (
        <div
          key={`white-ray-${i}`}
          className="absolute"
          style={{
            width: '3px',
            height: `${rayLength}px`,
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.9) 25%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.4) 75%, transparent 100%)',
            transformOrigin: 'center bottom',
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 20}deg) translateY(-${size / 2 + 5}px)`,
            opacity: 0.85,
            animation: `ray-float ${3.5 + (i % 4) * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))',
            // Variables CSS pour l'animation
            '--ray-index': i
          }}
        />
      ))}
      
      {/* RAYONS SECONDAIRES BLANCS - Effet densité (18 rayons intermédiaires) */}
      {[...Array(18)].map((_, i) => (
        <div
          key={`secondary-ray-${i}`}
          className="absolute"
          style={{
            width: '2px',
            height: `${rayLength * 0.7}px`,
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 40%, rgba(255, 255, 255, 0.3) 70%, transparent 100%)',
            transformOrigin: 'center bottom',
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 20 + 10}deg) translateY(-${size / 2 + 5}px)`,
            opacity: 0.7,
            animation: `ray-float-secondary ${4 + (i % 3) * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.12}s`,
            filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.6))'
          }}
        />
      ))}
      
      {/* PARTICULES SCINTILLANTES PERMANENTES - 20 étoiles qui apparaissent/disparaissent */}
      {[...Array(20)].map((_, i) => {
        const angle = (i * 18) * (Math.PI / 180);
        const distance = size * 0.65 + (i % 4) * 12;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        return (
          <div
            key={`sparkle-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 247, 205, 0.8) 40%, transparent 100%)',
              animation: `sparkle-twinkle ${1.2 + (i % 5) * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.08}s`,
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.9), 0 0 12px rgba(254, 240, 138, 0.5)',
              zIndex: 5
            }}
          />
        );
      })}
      
      {/* PARTICULES FLOTTANTES ALÉATOIRES - 15 étoiles qui bougent */}
      {[...Array(15)].map((_, i) => {
        const angle = (i * 24 + 12) * (Math.PI / 180);
        const distance = size * 0.55 + (i % 3) * 10;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        return (
          <div
            key={`float-particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: '2px',
              height: '2px',
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(253, 224, 71, 0.7) 50%, transparent 100%)',
              animation: `particle-float ${2 + (i % 4) * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
              zIndex: 4
            }}
          />
        );
      })}
      
      {/* HALO DORÉ PROCHE - Transition douce */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${size + 35}px`,
          height: `${size + 35}px`,
          background: 'radial-gradient(circle, rgba(255, 247, 205, 0.5) 0%, rgba(254, 240, 138, 0.35) 40%, rgba(253, 224, 71, 0.2) 70%, transparent 100%)',
          filter: 'blur(5px)',
          animation: 'halo-pulse 2.8s ease-in-out infinite alternate'
        }}
      />
      
      {/* AVATAR CENTRAL avec BORDURE DORÉE LUMINEUSE */}
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
      
      {/* STYLES CSS POUR LES ANIMATIONS AURORE STELLAIRE */}
      <style jsx>{`
        @keyframes aurora-breathe {
          0%, 100% {
            opacity: 0.75;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.12) rotate(5deg);
          }
        }
        
        @keyframes ray-float {
          0%, 100% {
            opacity: 0.7;
            transform: translateX(-50%) rotate(calc(var(--ray-index, 0) * 20deg)) translateY(-${size / 2 + 5}px) scaleY(0.95);
          }
          33% {
            opacity: 0.95;
            transform: translateX(-50%) rotate(calc(var(--ray-index, 0) * 20deg + 2deg)) translateY(-${size / 2 + 5}px) scaleY(1.05);
          }
          66% {
            opacity: 0.85;
            transform: translateX(-50%) rotate(calc(var(--ray-index, 0) * 20deg - 2deg)) translateY(-${size / 2 + 5}px) scaleY(1);
          }
        }
        
        @keyframes ray-float-secondary {
          0%, 100% {
            opacity: 0.55;
            transform: translateX(-50%) rotate(calc(var(--ray-index, 0) * 20deg + 10deg)) translateY(-${size / 2 + 5}px) scaleY(0.92);
          }
          50% {
            opacity: 0.85;
            transform: translateX(-50%) rotate(calc(var(--ray-index, 0) * 20deg + 12deg)) translateY(-${size / 2 + 5}px) scaleY(1.08);
          }
        }
        
        @keyframes sparkle-twinkle {
          0%, 100% {
            opacity: 0;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.5);
          }
          10% {
            opacity: 1;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.3);
          }
          20% {
            opacity: 0.9;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.1);
          }
          80% {
            opacity: 0.8;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.9);
          }
          90% {
            opacity: 0.3;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.6);
          }
        }
        
        @keyframes particle-float {
          0%, 100% {
            opacity: 0.3;
            transform: translate(var(--tx, 0), var(--ty, 0)) translate(-2px, 2px) scale(0.8);
          }
          25% {
            opacity: 0.8;
            transform: translate(var(--tx, 0), var(--ty, 0)) translate(2px, -1px) scale(1.2);
          }
          50% {
            opacity: 1;
            transform: translate(var(--tx, 0), var(--ty, 0)) translate(-1px, -2px) scale(1);
          }
          75% {
            opacity: 0.7;
            transform: translate(var(--tx, 0), var(--ty, 0)) translate(1px, 2px) scale(0.9);
          }
        }
        
        @keyframes halo-pulse {
          0% {
            opacity: 0.65;
            transform: scale(0.97);
          }
          100% {
            opacity: 0.9;
            transform: scale(1.03);
          }
        }
      `}</style>
    </div>
  );
}

export default PremiumSunAvatar;

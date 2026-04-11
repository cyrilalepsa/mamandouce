import React from 'react';
import { AvatarPreview } from './AvatarBuilder';

/**
 * PremiumSunAvatar - Avatar avec AURA SOLAIRE ÉCLATANTE pour les utilisateurs Premium
 * L'avatar devient le cœur d'un SOLEIL INTENSE avec rayons dorés brillants
 * VERSION AMPLIFIÉE - Effet "WAHOU" impossible à manquer !
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

  // RENDU PREMIUM - SOLEIL ÉCLATANT IMPOSSIBLE À MANQUER !
  const auraSize = size + 200; // ÉNORME aura : +200px au lieu de +60px
  const rayLength = size * 2; // Rayons TRÈS LONGS : 2x la taille de l'avatar

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ 
        width: `${auraSize}px`, 
        height: `${auraSize}px`,
        margin: '20px' // Espace autour pour ne pas couper l'effet
      }}
      data-testid={`${testId}-premium`}
    >
      {/* AURA EXTERNE MASSIVE - Dégradé jaune doré INTENSE qui se diffuse TRÈS loin */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.95) 0%, rgba(253, 224, 71, 0.85) 15%, rgba(250, 204, 21, 0.7) 30%, rgba(252, 211, 77, 0.5) 45%, rgba(251, 191, 36, 0.3) 60%, rgba(250, 204, 21, 0.15) 75%, rgba(254, 240, 138, 0.05) 90%, transparent 100%)',
          filter: 'blur(8px)',
          animation: 'mega-pulse 2.5s ease-in-out infinite'
        }}
      />
      
      {/* AURA INTERMÉDIAIRE - Couche supplémentaire pour plus d'intensité */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${size + 140}px`,
          height: `${size + 140}px`,
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.9) 0%, rgba(253, 224, 71, 0.7) 30%, rgba(250, 204, 21, 0.4) 60%, transparent 100%)',
          filter: 'blur(6px)',
          animation: 'mega-pulse 2s ease-in-out infinite alternate'
        }}
      />
      
      {/* RAYONS SOLAIRES BRILLANTS - 16 rayons LONGS et VISIBLES */}
      {[...Array(16)].map((_, i) => (
        <div
          key={`ray-${i}`}
          className="absolute"
          style={{
            width: '4px', // Plus larges : 4px au lieu de 2px
            height: `${rayLength}px`, // TRÈS LONGS
            background: 'linear-gradient(to bottom, rgba(254, 240, 138, 1) 0%, rgba(253, 224, 71, 0.9) 30%, rgba(250, 204, 21, 0.6) 60%, transparent 100%)',
            transformOrigin: 'center bottom',
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 22.5}deg) translateY(-${size / 2 + 10}px)`,
            opacity: 0.9, // Très visible : 0.9 au lieu de 0.6
            animation: `intense-ray-flicker ${1.5 + (i % 4) * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.08}s`,
            boxShadow: '0 0 10px rgba(254, 240, 138, 0.8)' // Glow autour des rayons
          }}
        />
      ))}
      
      {/* ÉCLATS SECONDAIRES - Rayons intermédiaires plus courts pour plus de densité */}
      {[...Array(16)].map((_, i) => (
        <div
          key={`secondary-ray-${i}`}
          className="absolute"
          style={{
            width: '2px',
            height: `${rayLength * 0.6}px`,
            background: 'linear-gradient(to bottom, rgba(253, 224, 71, 0.8) 0%, rgba(250, 204, 21, 0.5) 50%, transparent 100%)',
            transformOrigin: 'center bottom',
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 22.5 + 11.25}deg) translateY(-${size / 2 + 10}px)`,
            opacity: 0.7,
            animation: `secondary-ray-pulse ${2 + (i % 3) * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
      
      {/* HALO PROCHE - Cercle de lumière dorée très intense autour de l'avatar */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${size + 80}px`,
          height: `${size + 80}px`,
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.95) 0%, rgba(253, 224, 71, 0.8) 40%, rgba(250, 204, 21, 0.5) 70%, transparent 100%)',
          filter: 'blur(4px)',
          animation: 'intense-glow 1.8s ease-in-out infinite alternate',
          boxShadow: '0 0 40px rgba(254, 240, 138, 0.8), 0 0 80px rgba(253, 224, 71, 0.5)'
        }}
      />
      
      {/* CERCLE DE LUMIÈRE INTERNE - Anneau lumineux juste autour de l'avatar */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${size + 20}px`,
          height: `${size + 20}px`,
          background: 'radial-gradient(circle, transparent 40%, rgba(254, 240, 138, 1) 50%, rgba(253, 224, 71, 0.9) 60%, transparent 70%)',
          animation: 'ring-pulse 2s ease-in-out infinite'
        }}
      />
      
      {/* AVATAR CENTRAL avec BORDURE DORÉE BRILLANTE */}
      <div 
        className="relative rounded-full overflow-hidden border-[5px] shadow-2xl flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all z-10"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          borderColor: '#fbbf24',
          boxShadow: `
            0 0 30px rgba(254, 240, 138, 1),
            0 0 60px rgba(253, 224, 71, 0.8),
            0 0 90px rgba(250, 204, 21, 0.6),
            inset 0 0 20px rgba(255, 255, 255, 0.5),
            inset 0 2px 10px rgba(254, 240, 138, 0.8)
          `
        }}
        onClick={onClick}
        title={title}
      >
        {renderAvatar()}
      </div>
      
      {/* PARTICULES DE LUMIÈRE FLOTTANTES - Petites étoiles dorées qui scintillent */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30) * (Math.PI / 180);
        const distance = size * 0.8 + (i % 3) * 15;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        return (
          <div
            key={`particle-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              background: 'radial-gradient(circle, rgba(254, 240, 138, 1) 0%, rgba(253, 224, 71, 0.8) 50%, transparent 100%)',
              animation: `particle-twinkle ${1.5 + (i % 4) * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
              boxShadow: '0 0 8px rgba(254, 240, 138, 0.9)',
              zIndex: 5
            }}
          />
        );
      })}
      
      {/* STYLES CSS POUR LES ANIMATIONS INTENSES */}
      <style jsx>{`
        @keyframes mega-pulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
        
        @keyframes intense-glow {
          0% {
            opacity: 0.8;
            transform: scale(1);
          }
          100% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        @keyframes intense-ray-flicker {
          0%, 100% {
            opacity: 0.7;
            transform: translateX(-50%) rotate(var(--rotation)) translateY(var(--distance)) scaleY(1);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) rotate(var(--rotation)) translateY(var(--distance)) scaleY(1.1);
          }
        }
        
        @keyframes secondary-ray-pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.9;
          }
        }
        
        @keyframes ring-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        
        @keyframes particle-twinkle {
          0%, 100% {
            opacity: 0.4;
            transform: translate(var(--tx), var(--ty)) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translate(var(--tx), var(--ty)) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}

export default PremiumSunAvatar;

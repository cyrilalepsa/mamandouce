import React from 'react';
import { AvatarPreview } from './AvatarBuilder';

/**
 * PremiumSunAvatar - Avatar avec effet "MAMAN SOLEIL VAPOREUSE"
 * Présence lumineuse évanescente - Dégradé extrême, rayons diffus qui s'évaporent
 * Ultra-doux, apaisant, pas technique
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

  // RENDU PREMIUM - MAMAN SOLEIL VAPOREUSE
  const auraSize = size + 90; // 154px total
  const rayLength = size * 1.1; // Rayons plus longs pour fade progressif

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ 
        width: `${auraSize}px`, 
        height: `${auraSize}px`
      }}
      data-testid={`${testId}-premium`}
    >
      {/* GRANDE AURA DORÉE VAPOREUSE - Base ultra-diffuse */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 250, 240, 0.8) 0%, rgba(255, 247, 205, 0.7) 10%, rgba(254, 240, 138, 0.6) 20%, rgba(253, 230, 100, 0.45) 35%, rgba(250, 215, 60, 0.3) 50%, rgba(252, 211, 77, 0.18) 65%, rgba(251, 200, 50, 0.08) 78%, rgba(250, 204, 21, 0.03) 88%, transparent 100%)',
          filter: 'blur(16px)',
          animation: 'maman-breathe 5s ease-in-out infinite'
        }}
      />
      
      {/* COUCHE INTERMÉDIAIRE VAPOREUSE */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${size + 70}px`,
          height: `${size + 70}px`,
          background: 'radial-gradient(circle, rgba(255, 250, 240, 0.75) 0%, rgba(255, 247, 205, 0.65) 15%, rgba(254, 240, 138, 0.5) 30%, rgba(253, 224, 71, 0.32) 50%, rgba(250, 204, 21, 0.15) 70%, transparent 90%)',
          filter: 'blur(14px)',
          animation: 'maman-breathe 4.5s ease-in-out infinite alternate'
        }}
      />
      
      {/* RAYONS JAUNES VAPOREUX - Dégradé extrême, très diffus (18 rayons) */}
      {[...Array(18)].map((_, i) => (
        <div
          key={`vapor-ray-${i}`}
          className="absolute"
          style={{
            width: '8px', // Plus larges pour effet vaporeux
            height: `${rayLength}px`,
            // Dégradé extrême : lumineux au centre → transparent très rapidement
            background: `
              radial-gradient(ellipse at center, 
                rgba(255, 250, 240, 0.85) 0%,
                rgba(255, 247, 205, 0.75) 5%,
                rgba(254, 240, 138, 0.6) 12%,
                rgba(253, 230, 100, 0.45) 20%,
                rgba(252, 220, 80, 0.3) 30%,
                rgba(250, 204, 21, 0.18) 42%,
                rgba(248, 195, 30, 0.1) 55%,
                rgba(245, 185, 25, 0.05) 68%,
                rgba(240, 175, 20, 0.02) 80%,
                transparent 92%
              )
            `,
            transformOrigin: 'center bottom',
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 20}deg) translateY(-${size / 2 + 5}px)`,
            opacity: 0.5, // Opacity réduite pour effet vaporeux
            animation: `ray-vapor-float ${12 + (i % 4) * 3}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            // Blur EXTRÊME pour effet vaporeux
            filter: 'blur(10px)',
            '--ray-rotation': `${i * 20}deg`
          }}
        />
      ))}
      
      {/* RAYONS SECONDAIRES ENCORE PLUS VAPOREUX (18 rayons) */}
      {[...Array(18)].map((_, i) => (
        <div
          key={`secondary-vapor-ray-${i}`}
          className="absolute"
          style={{
            width: '6px',
            height: `${rayLength * 0.75}px`,
            // Dégradé ultra-rapide vers transparent
            background: `
              radial-gradient(ellipse at center,
                rgba(255, 247, 205, 0.7) 0%,
                rgba(254, 240, 138, 0.55) 8%,
                rgba(253, 224, 71, 0.38) 18%,
                rgba(250, 210, 50, 0.22) 32%,
                rgba(248, 200, 40, 0.12) 48%,
                rgba(245, 190, 30, 0.06) 65%,
                transparent 85%
              )
            `,
            transformOrigin: 'center bottom',
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 20 + 10}deg) translateY(-${size / 2 + 5}px)`,
            opacity: 0.45,
            animation: `ray-vapor-float-slow ${15 + (i % 3) * 3}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            filter: 'blur(12px)' // Encore plus flou
          }}
        />
      ))}
      
      {/* LUCIOLES BLANCHES - Nuée de petits points scintillants (30 lucioles) */}
      {[...Array(30)].map((_, i) => {
        const angle = (i * 12) * (Math.PI / 180);
        const distance = size * 0.6 + (i % 5) * 10;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const fireflSize = 1.2 + (i % 3) * 0.6;
        
        return (
          <div
            key={`firefly-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${fireflSize}px`,
              height: `${fireflSize}px`,
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 25%, rgba(255, 250, 240, 0.7) 50%, transparent 80%)',
              animation: `firefly-glow ${2.5 + (i % 8) * 0.9}s ease-in-out infinite`,
              animationDelay: `${i * 0.18}s`,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.95), 0 0 6px rgba(255, 250, 240, 0.7)',
              zIndex: 8,
              opacity: 0
            }}
          />
        );
      })}
      
      {/* LUCIOLES EXTÉRIEURES - Cercle plus large (25 lucioles) */}
      {[...Array(25)].map((_, i) => {
        const angle = (i * 14.4 + 7) * (Math.PI / 180);
        const distance = size * 0.75 + (i % 4) * 9;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const fireflSize = 1 + (i % 2) * 0.5;
        
        return (
          <div
            key={`outer-firefly-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${fireflSize}px`,
              height: `${fireflSize}px`,
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.9) 30%, rgba(255, 250, 240, 0.6) 60%, transparent 85%)',
              animation: `firefly-glow-delayed ${3.5 + (i % 7) * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.22 + 1.2}s`,
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.9)',
              zIndex: 7,
              opacity: 0
            }}
          />
        );
      })}
      
      {/* HALO DORÉ VAPOREUX PROCHE */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${size + 40}px`,
          height: `${size + 40}px`,
          background: 'radial-gradient(circle, rgba(255, 250, 240, 0.65) 0%, rgba(255, 247, 205, 0.5) 25%, rgba(254, 240, 138, 0.35) 50%, rgba(253, 224, 71, 0.18) 75%, transparent 95%)',
          filter: 'blur(8px)',
          animation: 'halo-vapor-pulse 4s ease-in-out infinite alternate'
        }}
      />
      
      {/* AVATAR CENTRAL avec BORDURE DORÉE DOUCE */}
      <div 
        className="relative rounded-full overflow-hidden border-4 shadow-2xl flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all z-10"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          borderColor: '#f5c842',
          boxShadow: '0 0 30px rgba(255, 247, 205, 0.5), 0 0 50px rgba(254, 240, 138, 0.25), inset 0 0 20px rgba(255, 255, 255, 0.35)'
        }}
        onClick={onClick}
        title={title}
      >
        {renderAvatar()}
      </div>
      
      {/* STYLES CSS - ANIMATIONS MAMAN SOLEIL VAPOREUSE */}
      <style jsx>{`
        @keyframes maman-breathe {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.1) rotate(4deg);
          }
        }
        
        @keyframes ray-vapor-float {
          0%, 100% {
            opacity: 0.45;
            transform: translateX(-50%) rotate(var(--ray-rotation, 0deg)) translateY(-${size / 2 + 5}px) scaleY(0.94);
          }
          25% {
            opacity: 0.65;
            transform: translateX(-50%) rotate(calc(var(--ray-rotation, 0deg) + 1.2deg)) translateY(-${size / 2 + 5}px) scaleY(1.03);
          }
          50% {
            opacity: 0.55;
            transform: translateX(-50%) rotate(calc(var(--ray-rotation, 0deg) + 0.4deg)) translateY(-${size / 2 + 5}px) scaleY(1.05);
          }
          75% {
            opacity: 0.5;
            transform: translateX(-50%) rotate(calc(var(--ray-rotation, 0deg) - 0.9deg)) translateY(-${size / 2 + 5}px) scaleY(0.97);
          }
        }
        
        @keyframes ray-vapor-float-slow {
          0%, 100% {
            opacity: 0.38;
            transform: translateX(-50%) rotate(var(--ray-rotation, 0deg)) translateY(-${size / 2 + 5}px) scaleY(0.92);
          }
          33% {
            opacity: 0.6;
            transform: translateX(-50%) rotate(calc(var(--ray-rotation, 0deg) + 1deg)) translateY(-${size / 2 + 5}px) scaleY(1.04);
          }
          66% {
            opacity: 0.48;
            transform: translateX(-50%) rotate(calc(var(--ray-rotation, 0deg) - 1.1deg)) translateY(-${size / 2 + 5}px) scaleY(0.95);
          }
        }
        
        @keyframes firefly-glow {
          0%, 100% {
            opacity: 0;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.2);
          }
          6% {
            opacity: 0.35;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.7);
          }
          18% {
            opacity: 0.95;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.25);
          }
          35% {
            opacity: 1;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.05);
          }
          65% {
            opacity: 0.92;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.95);
          }
          82% {
            opacity: 0.48;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.65);
          }
          94% {
            opacity: 0.15;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.35);
          }
        }
        
        @keyframes firefly-glow-delayed {
          0%, 100% {
            opacity: 0;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.15);
          }
          10% {
            opacity: 0.42;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.75);
          }
          25% {
            opacity: 0.88;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(1.15);
          }
          40% {
            opacity: 1;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.95);
          }
          60% {
            opacity: 0.85;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.85);
          }
          78% {
            opacity: 0.38;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.55);
          }
          90% {
            opacity: 0.12;
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.28);
          }
        }
        
        @keyframes halo-vapor-pulse {
          0% {
            opacity: 0.6;
            transform: scale(0.96);
          }
          100% {
            opacity: 0.85;
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}

export default PremiumSunAvatar;

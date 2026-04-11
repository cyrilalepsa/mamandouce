import React from 'react';
import { AvatarPreview } from './AvatarBuilder';

/**
 * PremiumSunAvatar - Avatar avec effet "MAMAN SOLEIL VAPOREUSE"
 * Présence lumineuse évanescente + 20 scintillements blancs physiques
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
            width: '8px',
            height: `${rayLength}px`,
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
            opacity: 0.5,
            animation: `ray-vapor-float ${12 + (i % 4) * 3}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
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
            filter: 'blur(12px)'
          }}
        />
      ))}
      
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
      
      {/* SCINTILLEMENTS BLANCS - 30 DIVS DISPERSÉS TOUT AUTOUR */}
      {/* Zone Haut-Droite */}
      <div className="sparkle" style={{ top: '8%', left: '75%', width: '2px', height: '2px', animationDuration: '2.5s', animationDelay: '0s' }}></div>
      <div className="sparkle" style={{ top: '15%', left: '85%', width: '3px', height: '3px', animationDuration: '3s', animationDelay: '0.2s' }}></div>
      <div className="sparkle" style={{ top: '22%', left: '92%', width: '1px', height: '1px', animationDuration: '2.8s', animationDelay: '0.4s' }}></div>
      
      {/* Zone Droite */}
      <div className="sparkle" style={{ top: '35%', left: '90%', width: '2px', height: '2px', animationDuration: '3.2s', animationDelay: '0.6s' }}></div>
      <div className="sparkle" style={{ top: '48%', left: '94%', width: '1px', height: '1px', animationDuration: '2.7s', animationDelay: '0.8s' }}></div>
      <div className="sparkle" style={{ top: '58%', left: '88%', width: '3px', height: '3px', animationDuration: '3.1s', animationDelay: '1s' }}></div>
      
      {/* Zone Bas-Droite */}
      <div className="sparkle" style={{ top: '70%', left: '82%', width: '2px', height: '2px', animationDuration: '2.9s', animationDelay: '1.2s' }}></div>
      <div className="sparkle" style={{ top: '80%', left: '72%', width: '1px', height: '1px', animationDuration: '3.3s', animationDelay: '1.4s' }}></div>
      <div className="sparkle" style={{ top: '88%', left: '62%', width: '2px', height: '2px', animationDuration: '2.6s', animationDelay: '1.6s' }}></div>
      
      {/* Zone Bas */}
      <div className="sparkle" style={{ top: '92%', left: '50%', width: '3px', height: '3px', animationDuration: '3.4s', animationDelay: '1.8s' }}></div>
      <div className="sparkle" style={{ top: '90%', left: '38%', width: '1px', height: '1px', animationDuration: '2.4s', animationDelay: '2s' }}></div>
      
      {/* Zone Bas-Gauche */}
      <div className="sparkle" style={{ top: '85%', left: '28%', width: '2px', height: '2px', animationDuration: '3.5s', animationDelay: '2.2s' }}></div>
      <div className="sparkle" style={{ top: '78%', left: '18%', width: '3px', height: '3px', animationDuration: '2.8s', animationDelay: '2.4s' }}></div>
      <div className="sparkle" style={{ top: '68%', left: '10%', width: '1px', height: '1px', animationDuration: '3.6s', animationDelay: '2.6s' }}></div>
      
      {/* Zone Gauche */}
      <div className="sparkle" style={{ top: '55%', left: '6%', width: '2px', height: '2px', animationDuration: '3s', animationDelay: '2.8s' }}></div>
      <div className="sparkle" style={{ top: '42%', left: '8%', width: '3px', height: '3px', animationDuration: '2.7s', animationDelay: '0.1s' }}></div>
      <div className="sparkle" style={{ top: '30%', left: '12%', width: '1px', height: '1px', animationDuration: '3.1s', animationDelay: '0.3s' }}></div>
      
      {/* Zone Haut-Gauche */}
      <div className="sparkle" style={{ top: '18%', left: '15%', width: '2px', height: '2px', animationDuration: '2.9s', animationDelay: '0.5s' }}></div>
      <div className="sparkle" style={{ top: '10%', left: '25%', width: '1px', height: '1px', animationDuration: '3.3s', animationDelay: '0.7s' }}></div>
      <div className="sparkle" style={{ top: '5%', left: '38%', width: '2px', height: '2px', animationDuration: '2.5s', animationDelay: '0.9s' }}></div>
      
      {/* Zone Haut */}
      <div className="sparkle" style={{ top: '4%', left: '52%', width: '3px', height: '3px', animationDuration: '3.2s', animationDelay: '1.1s' }}></div>
      <div className="sparkle" style={{ top: '7%', left: '65%', width: '1px', height: '1px', animationDuration: '2.6s', animationDelay: '1.3s' }}></div>
      
      {/* Points intermédiaires pour remplissage harmonieux */}
      <div className="sparkle" style={{ top: '25%', left: '70%', width: '2px', height: '2px', animationDuration: '3.4s', animationDelay: '1.5s' }}></div>
      <div className="sparkle" style={{ top: '45%', left: '78%', width: '3px', height: '3px', animationDuration: '2.8s', animationDelay: '1.7s' }}></div>
      <div className="sparkle" style={{ top: '65%', left: '65%', width: '1px', height: '1px', animationDuration: '3.5s', animationDelay: '1.9s' }}></div>
      <div className="sparkle" style={{ top: '75%', left: '45%', width: '2px', height: '2px', animationDuration: '2.7s', animationDelay: '2.1s' }}></div>
      <div className="sparkle" style={{ top: '62%', left: '32%', width: '3px', height: '3px', animationDuration: '3.1s', animationDelay: '2.3s' }}></div>
      <div className="sparkle" style={{ top: '38%', left: '22%', width: '1px', height: '1px', animationDuration: '2.9s', animationDelay: '2.5s' }}></div>
      <div className="sparkle" style={{ top: '20%', left: '48%', width: '2px', height: '2px', animationDuration: '3.3s', animationDelay: '2.7s' }}></div>
      <div className="sparkle" style={{ top: '12%', left: '58%', width: '3px', height: '3px', animationDuration: '2.4s', animationDelay: '2.9s' }}></div>
      
      {/* STYLES CSS POUR SCINTILLEMENTS */}
      <style>{`
        .sparkle {
          background: white;
          border-radius: 50%;
          position: absolute;
          z-index: 2000 !important;
          pointer-events: none;
          animation: sparkle-magic ease-in-out infinite;
          box-shadow: 0 0 8px white;
        }
        
        @keyframes sparkle-magic {
          0%, 100% {
            opacity: 0;
            transform: translate(0, 0);
          }
          25% {
            opacity: 0.6;
            transform: translate(1px, -1px);
          }
          50% {
            opacity: 1;
            transform: translate(2px, 1px);
          }
          75% {
            opacity: 0.7;
            transform: translate(-1px, 2px);
          }
        }
      `}</style>
      
      {/* STYLES CSS - ANIMATIONS + SCINTILLEMENTS */}
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
        
        @keyframes sparkle-blink {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes sparkle-twinkle {
          0%, 100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          15% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1.2);
          }
          30% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          70% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1);
          }
          85% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(0.8);
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

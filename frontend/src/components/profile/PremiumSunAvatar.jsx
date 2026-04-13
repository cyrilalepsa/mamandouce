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
  testId = "premium-sun-avatar",
  earnedTrophy = null
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
        height: `${auraSize}px`,
        overflow: 'visible',
        animation: 'floating-avatar 10s ease-in-out infinite'
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
        className="relative rounded-full overflow-hidden border-4 flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all z-10"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          borderColor: '#f5c842',
          boxShadow: 'none'
        }}
        onClick={onClick}
        title={title}
      >
        {renderAvatar()}
      </div>
      
      {/* TROPHÉE MAT — petit, discret, bas-droit de l'avatar, seulement si gagné */}
      {earnedTrophy && (
        <div
          style={{
            position: 'absolute',
            bottom: `${(auraSize - size) / 2 - 4}px`,
            right: `${(auraSize - size) / 2 - 4}px`,
            zIndex: 20,
            width: 22,
            height: 22,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: earnedTrophy === 'gold' ? '#b8860b'
              : earnedTrophy === 'silver' ? '#808080'
              : '#8B4513',
            border: '1.5px solid rgba(255,255,255,0.5)',
            boxShadow: 'none',
          }}
          data-testid="avatar-trophy-medal"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        </div>
      )}
      
      {/* 25 SPARKLES DISPERSÉS SUR LE HALO (2-4px) */}
      {[['-5%','50%',3],['-2%','82%',2],['8%','105%',4],['22%','-8%',3],['40%','115%',2],
        ['58%','110%',4],['78%','100%',2],['95%','75%',3],['105%','50%',2],['100%','25%',4],
        ['88%','-5%',3],['68%','-10%',2],['45%','-12%',3],['25%','-8%',4],['5%','18%',2],
        ['15%','72%',3],['35%','90%',2],['62%','88%',4],['85%','42%',2],['50%','8%',3],
        ['30%','55%',2],['70%','62%',3],['48%','38%',4],['12%','48%',2],['92%','58%',3],
      ].map(([t,l,s], i) => (
        <div key={`sp-${i}`} className="sparkle" style={{ top:t, left:l, width:`${s}px`, height:`${s}px`, animationDuration:`${2.4+(i%5)*0.3}s`, animationDelay:`${(i*0.4)%3}s` }} />
      ))}
      
      {/* STYLES CSS POUR SCINTILLEMENTS + FLOATING */}
      <style>{`
        .sparkle {
          background: #ffffff;
          border-radius: 50%;
          position: absolute;
          z-index: 10000 !important;
          pointer-events: none;
          animation: sparkle-magic ease-in-out infinite;
          box-shadow: 0 0 4px #ffffff, 0 0 8px rgba(255,255,255,0.6);
        }
        
        @keyframes sparkle-magic {
          0%, 100% { opacity: 0; }
          40% { opacity: 1; }
          60% { opacity: 0.8; }
        }
        
        @keyframes floating-avatar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
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

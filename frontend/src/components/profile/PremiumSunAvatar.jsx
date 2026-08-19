import React from 'react';
import { AvatarPreview } from './AvatarBuilder';
import { useAuth } from '../../contexts/AuthContext';
import { shouldShowPremiumHalo } from '../../utils/superadmin';

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
  const { isPremium: authIsPremium, is_premium: authIsPremiumSnake, user } = useAuth();
  const showHalo = shouldShowPremiumHalo(user, Boolean(
    isPremium || authIsPremium || authIsPremiumSnake
  ));

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
  if (!showHalo) {
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

  // RENDU PREMIUM - HALO JAUNE SCINTILLANT + BORDURE DORÉE
  const haloSize = size + 50;
  
  return (
    <div 
      className="premium-halo relative flex items-center justify-center"
      style={{ 
        width: `${haloSize}px`, 
        height: `${haloSize}px`,
        overflow: 'visible',
      }}
      data-testid={`${testId}-premium`}
    >
      {/* HALO DORÉ — glow vaporeux autour de l'avatar */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${haloSize}px`,
          height: `${haloSize}px`,
          background: 'radial-gradient(circle, rgba(255, 250, 220, 0.7) 0%, rgba(254, 240, 138, 0.5) 25%, rgba(253, 224, 71, 0.3) 45%, rgba(250, 204, 21, 0.15) 65%, transparent 85%)',
          filter: 'blur(8px)',
          animation: 'haloBreath 4s ease-in-out infinite',
        }}
      />

      {/* SCINTILLEMENTS (8 sparkles) */}
      {[['-5%','50%',3],['10%','90%',2],['25%','-5%',3],['50%','105%',4],
        ['75%','-5%',2],['90%','85%',3],['50%','-8%',2],['15%','15%',4]
      ].map(([t,l,s], i) => (
        <div key={`sp-${i}`} style={{
          position: 'absolute', top: t, left: l,
          width: `${s}px`, height: `${s}px`,
          background: '#ffffff', borderRadius: '50%',
          boxShadow: '0 0 4px #fff, 0 0 8px rgba(255,255,255,0.6)',
          pointerEvents: 'none', zIndex: 15,
          animation: `sparkleGlow ${2.2 + (i % 3) * 0.5}s ease-in-out infinite`,
          animationDelay: `${(i * 0.4) % 2.5}s`,
        }} />
      ))}

      {/* AVATAR CENTRAL avec BORDURE DORÉE */}
      <div 
        className="relative rounded-full overflow-hidden border-4 flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all z-10"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          borderColor: '#f5c842',
          boxShadow: '0 0 18px rgba(250, 204, 21, 0.5), 0 0 40px rgba(250, 204, 21, 0.2)'
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
            bottom: `${(haloSize - size) / 2 - 4}px`,
            right: `${(haloSize - size) / 2 - 4}px`,
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

      <style>{`
        @keyframes haloBreath {
          0%, 100% { opacity: 0.7; transform: scale(0.97); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        @keyframes sparkleGlow {
          0%, 100% { opacity: 0; transform: scale(0); }
          40% { opacity: 1; transform: scale(1.2); }
          60% { opacity: 0.8; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default PremiumSunAvatar;

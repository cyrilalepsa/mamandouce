import React from 'react';
import { AvatarPreview } from './AvatarBuilder';

/**
 * PremiumSunAvatar - Avatar avec aura solaire pour les utilisateurs Premium
 * L'avatar devient le cœur d'un soleil avec rayons dorés
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

  // Rendu Premium avec aura solaire
  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: `${size + 60}px`, height: `${size + 60}px` }}
      data-testid={`${testId}-premium`}
    >
      {/* Aura externe - Dégradé jaune doré qui se diffuse */}
      <div 
        className="absolute inset-0 rounded-full animate-pulse-slow"
        style={{
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.5) 0%, rgba(253, 224, 71, 0.3) 30%, rgba(250, 204, 21, 0.15) 50%, rgba(252, 211, 77, 0.05) 70%, transparent 100%)',
          filter: 'blur(4px)',
          animation: 'pulse-glow 3s ease-in-out infinite'
        }}
      />
      
      {/* Rayons solaires subtils - 12 rayons */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: '2px',
            height: `${size * 0.4}px`,
            background: 'linear-gradient(to bottom, rgba(254, 240, 138, 0.6), transparent)',
            transformOrigin: 'center bottom',
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 30}deg) translateY(-${size / 2 + 8}px)`,
            opacity: 0.6,
            animation: `ray-flicker ${2 + (i % 3) * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
      
      {/* Halo intermédiaire */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${size + 30}px`,
          height: `${size + 30}px`,
          background: 'radial-gradient(circle, rgba(253, 224, 71, 0.25) 0%, rgba(250, 204, 21, 0.15) 60%, transparent 100%)',
          filter: 'blur(2px)',
          animation: 'pulse-glow 2s ease-in-out infinite alternate'
        }}
      />
      
      {/* Avatar central avec bordure dorée */}
      <div 
        className="relative rounded-full overflow-hidden border-4 shadow-2xl flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all z-10"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          borderColor: '#fbbf24',
          boxShadow: '0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(254, 240, 138, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.3)'
        }}
        onClick={onClick}
        title={title}
      >
        {renderAvatar()}
      </div>
      
      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }
        
        @keyframes ray-flicker {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}

export default PremiumSunAvatar;

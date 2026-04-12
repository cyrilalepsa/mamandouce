import React from 'react';
import { AvatarPreview } from './AvatarBuilder';

const SPARKLE_POSITIONS = [
  [0.72,0.14,2],[0.28,0.05,1],[0.91,0.33,3],[0.08,0.41,1],[0.55,0.02,2],
  [0.95,0.62,3],[0.03,0.68,1],[0.82,0.88,2],[0.18,0.92,1],[0.50,1.02,3],
  [0.38,0.15,2],[0.65,0.08,1],[1.01,0.48,2],[-.03,0.52,1],[0.48,0.93,3],
  [0.85,0.18,1],[0.12,0.22,2],[0.76,0.72,3],[0.22,0.78,1],[0.60,0.58,2],
  [0.40,0.42,1],[0.90,0.50,3],[0.10,0.55,2],[0.68,0.30,1],[0.32,0.65,2],
];

function PremiumSunAvatar({
  isPremium = false,
  userAvatar = null,
  userAvatarConfig = null,
  size = 64,
  onClick,
  title,
  testId = "premium-sun-avatar"
}) {

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

  const auraSize = size + 90;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: `${auraSize}px`, height: `${auraSize}px`, overflow: 'visible' }}
      data-testid={`${testId}-premium`}
    >
      {/* HALO JAUNE VAPOREUX — NE PAS MODIFIER */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,250,240,0.8) 0%, rgba(254,240,138,0.6) 20%, rgba(250,215,60,0.3) 50%, rgba(250,204,21,0.03) 88%, transparent 100%)',
          filter: 'blur(16px)',
          animation: 'halo-breathe 5s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: `${size + 70}px`,
          height: `${size + 70}px`,
          background: 'radial-gradient(circle, rgba(255,250,240,0.75) 0%, rgba(254,240,138,0.5) 30%, rgba(250,204,21,0.15) 70%, transparent 90%)',
          filter: 'blur(14px)',
          animation: 'halo-breathe 4.5s ease-in-out infinite alternate',
        }}
      />

      {/* AVATAR CENTRAL — animation floating appliquée ici */}
      <div
        className="relative rounded-full overflow-hidden border-4 shadow-2xl flex-shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all z-10"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderColor: '#f5c842',
          boxShadow: '0 0 30px rgba(255,247,205,0.5), 0 0 50px rgba(254,240,138,0.25), inset 0 0 20px rgba(255,255,255,0.35)',
          animation: 'floating-avatar 10s ease-in-out infinite',
        }}
        onClick={onClick}
        title={title}
      >
        {renderAvatar()}
      </div>

      {/* 25 SPARKLES — points blancs dispersés, tailles 1-3px */}
      {SPARKLE_POSITIONS.map(([rx, ry, s], i) => (
        <div
          key={`sp-${i}`}
          style={{
            position: 'absolute',
            left: `${rx * auraSize}px`,
            top: `${ry * auraSize}px`,
            width: `${s}px`,
            height: `${s}px`,
            background: '#fff',
            borderRadius: '50%',
            zIndex: 10000,
            pointerEvents: 'none',
            boxShadow: '0 0 3px 1px #fff, 0 0 6px 2px rgba(255,255,255,0.6)',
            opacity: 0,
            animation: `twinkle ${2 + (i % 5) * 0.4}s ease-in-out ${(i * 0.4) % 3}s infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes floating-avatar {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes halo-breathe {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.08); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          40% { opacity: 1; }
          60% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default PremiumSunAvatar;

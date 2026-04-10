/**
 * Fetus3D.jsx - Bébé animé avec CSS 3D et SVG
 * Version compatible React 19 sans Three.js
 * Effet "Veilleuse" (Nightlight) pour Mode Nuit Douce
 * Animations fluides avec CSS keyframes
 */
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Styles CSS dynamiques avec effet veilleuse
const getStyles = (isDarkMode) => ({
  container: {
    width: '100%',
    height: '320px',
    perspective: '800px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  // Effet veilleuse - halo lumineux ambiant
  nightlightOuter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '340px',
    height: '340px',
    borderRadius: '50%',
    background: isDarkMode 
      ? 'radial-gradient(circle, rgba(232,164,184,0.12) 0%, rgba(184,164,216,0.08) 35%, rgba(200,180,232,0.04) 60%, transparent 80%)'
      : 'radial-gradient(circle, rgba(255,182,193,0.15) 0%, rgba(255,192,203,0.08) 50%, transparent 70%)',
    filter: 'blur(30px)',
    animation: 'nightlightPulse 4s ease-in-out infinite',
    pointerEvents: 'none',
  },
  // Halo intérieur plus intense
  nightlightInner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    background: isDarkMode 
      ? 'radial-gradient(circle, rgba(245,240,235,0.08) 0%, rgba(232,164,184,0.1) 30%, rgba(184,164,216,0.06) 60%, transparent 85%)'
      : 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,182,193,0.2) 40%, transparent 70%)',
    filter: 'blur(15px)',
    animation: 'nightlightPulseInner 3s ease-in-out infinite',
    pointerEvents: 'none',
  },
  // Zone centrale lumineuse (spot de veilleuse)
  nightlightSpot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: isDarkMode 
      ? 'radial-gradient(circle, rgba(245,240,235,0.15) 0%, rgba(232,164,184,0.08) 50%, transparent 100%)'
      : 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,220,230,0.3) 50%, transparent 100%)',
    filter: 'blur(8px)',
    animation: 'spotGlow 2.5s ease-in-out infinite',
    pointerEvents: 'none',
  },
  scene: {
    width: '200px',
    height: '200px',
    position: 'relative',
    transformStyle: 'preserve-3d',
    animation: 'float 3s ease-in-out infinite, rotate3d 8s linear infinite',
    zIndex: 10,
  },
  // Ancien glow (maintenu pour compatibilité)
  glow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    background: isDarkMode
      ? 'radial-gradient(circle, rgba(232,164,184,0.2) 0%, rgba(184,164,216,0.12) 50%, transparent 70%)'
      : 'radial-gradient(circle, rgba(255,182,193,0.3) 0%, rgba(255,192,203,0.1) 50%, transparent 70%)',
    filter: 'blur(10px)',
    animation: 'pulse 2s ease-in-out infinite',
    zIndex: 5,
  },
  particles: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 2,
  },
  particle: (i, isDark) => ({
    position: 'absolute',
    width: isDark ? '4px' : '6px',
    height: isDark ? '4px' : '6px',
    borderRadius: '50%',
    background: isDark 
      ? 'rgba(232, 164, 184, 0.35)'
      : 'rgba(255, 192, 203, 0.4)',
    boxShadow: isDark ? '0 0 6px rgba(232, 164, 184, 0.4)' : 'none',
    animation: `particle${i % 5} ${3 + i * 0.5}s ease-in-out infinite`,
    top: `${20 + (i * 20) % 60}%`,
    left: `${10 + (i * 15) % 80}%`,
  }),
});

// Keyframes globales avec effet veilleuse
const keyframes = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotateX(5deg); }
    50% { transform: translateY(-10px) rotateX(-5deg); }
  }
  
  @keyframes rotate3d {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
  }
  
  /* Effet veilleuse - pulsation douce externe */
  @keyframes nightlightPulse {
    0%, 100% { 
      opacity: 0.6; 
      transform: translate(-50%, -50%) scale(1);
    }
    50% { 
      opacity: 0.85; 
      transform: translate(-50%, -50%) scale(1.08);
    }
  }
  
  /* Effet veilleuse - pulsation interne décalée */
  @keyframes nightlightPulseInner {
    0%, 100% { 
      opacity: 0.7; 
      transform: translate(-50%, -50%) scale(1);
    }
    50% { 
      opacity: 0.95; 
      transform: translate(-50%, -50%) scale(1.05);
    }
  }
  
  /* Spot lumineux central */
  @keyframes spotGlow {
    0%, 100% { 
      opacity: 0.8; 
      transform: translate(-50%, -50%) scale(1);
      filter: blur(8px);
    }
    50% { 
      opacity: 1; 
      transform: translate(-50%, -50%) scale(1.1);
      filter: blur(6px);
    }
  }
  
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    15% { transform: scale(1.15); }
    30% { transform: scale(1); }
    45% { transform: scale(1.1); }
    60% { transform: scale(1); }
  }
  
  @keyframes particle0 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
    50% { transform: translate(10px, -20px) scale(0.8); opacity: 0.6; }
  }
  
  @keyframes particle1 {
    0%, 100% { transform: translate(0, 0) scale(0.8); opacity: 0.4; }
    50% { transform: translate(-15px, -15px) scale(1); opacity: 0.5; }
  }
  
  @keyframes particle2 {
    0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.2; }
    50% { transform: translate(20px, 10px) scale(0.9); opacity: 0.4; }
  }
  
  @keyframes particle3 {
    0%, 100% { transform: translate(0, 0) scale(0.9); opacity: 0.35; }
    50% { transform: translate(-10px, 15px) scale(1.1); opacity: 0.5; }
  }
  
  @keyframes particle4 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
    50% { transform: translate(5px, -25px) scale(0.85); opacity: 0.45; }
  }
  
  @keyframes touched {
    0% { transform: scale(1) rotateY(0deg); }
    50% { transform: scale(1.1) rotateY(180deg); }
    100% { transform: scale(1) rotateY(360deg); }
  }
`;

// Composant SVG du fœtus selon la semaine
function FetusSVG({ week, touched, isDarkMode }) {
  const getSize = () => {
    if (week <= 4) return 60;
    if (week <= 8) return 80;
    if (week <= 12) return 100;
    if (week <= 20) return 120;
    if (week <= 28) return 140;
    return 160;
  };
  
  const size = getSize();
  const showHeart = week >= 6;
  const showEyes = week > 12;
  const showLimbs = week > 8;
  
  // Couleurs adaptées au mode nuit douce
  const skinPrimary = isDarkMode ? "#f5e8ec" : "#ffe4ec";
  const skinSecondary = isDarkMode ? "#e8d1dc" : "#ffd1dc";
  const heartColor = isDarkMode ? "#ff8fa8" : "#ff6b8a";
  const glowColor = isDarkMode ? "rgba(232,164,184,0.35)" : "rgba(255,182,193,0.4)";
  
  if (week <= 4) {
    // Blastocyste / Cellule
    return (
      <svg 
        viewBox="0 0 100 100" 
        width={size} 
        height={size}
        style={{
          filter: isDarkMode 
            ? 'drop-shadow(0 4px 25px rgba(232,164,184,0.5)) drop-shadow(0 0 15px rgba(245,240,235,0.2))'
            : 'drop-shadow(0 4px 20px rgba(255,182,193,0.4))',
          animation: touched ? 'touched 1s ease-out' : undefined,
        }}
      >
        {/* Cellule principale */}
        <defs>
          <radialGradient id="cellGrad" cx="40%" cy="40%">
            <stop offset="0%" stopColor={isDarkMode ? "#faf5f7" : "#fff5f7"} />
            <stop offset="50%" stopColor={skinPrimary} />
            <stop offset="100%" stopColor={skinSecondary} />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Halo */}
        <circle cx="50" cy="50" r="45" fill={glowColor} />
        
        {/* Cellule */}
        <circle cx="50" cy="50" r="35" fill="url(#cellGrad)" filter="url(#glow)" />
        
        {/* Noyau */}
        <circle cx="45" cy="45" r="15" fill={isDarkMode ? "#f0b8c8" : "#ffb6c1"} opacity="0.8" />
        
        {/* Reflet */}
        <ellipse cx="40" cy="38" rx="8" ry="6" fill={isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)"} />
      </svg>
    );
  }
  
  if (week <= 8) {
    // Embryon
    return (
      <svg 
        viewBox="0 0 100 120" 
        width={size} 
        height={size * 1.2}
        style={{
          filter: isDarkMode 
            ? 'drop-shadow(0 4px 25px rgba(232,164,184,0.5)) drop-shadow(0 0 15px rgba(245,240,235,0.2))'
            : 'drop-shadow(0 4px 20px rgba(255,182,193,0.4))',
          animation: touched ? 'touched 1s ease-out' : undefined,
        }}
      >
        <defs>
          <radialGradient id="headGrad" cx="40%" cy="30%">
            <stop offset="0%" stopColor={isDarkMode ? "#faf5f7" : "#fff5f7"} />
            <stop offset="100%" stopColor={skinPrimary} />
          </radialGradient>
          <radialGradient id="bodyGrad" cx="50%" cy="40%">
            <stop offset="0%" stopColor={skinPrimary} />
            <stop offset="100%" stopColor={skinSecondary} />
          </radialGradient>
        </defs>
        
        {/* Tête */}
        <ellipse cx="50" cy="35" rx="25" ry="28" fill="url(#headGrad)" />
        <ellipse cx="45" cy="28" rx="8" ry="5" fill={isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.5)"} />
        
        {/* Corps */}
        <ellipse cx="50" cy="75" rx="18" ry="22" fill="url(#bodyGrad)" />
        
        {/* Bourgeons bras */}
        <ellipse cx="30" cy="60" rx="8" ry="6" fill={skinSecondary} />
        <ellipse cx="70" cy="60" rx="8" ry="6" fill={skinSecondary} />
        
        {/* Cœur */}
        {showHeart && (
          <g style={{ animation: 'heartbeat 0.8s ease-in-out infinite' }}>
            <circle cx="50" cy="70" r="6" fill={heartColor} />
            <circle cx="50" cy="70" r="9" fill={isDarkMode ? "rgba(255,143,168,0.35)" : "rgba(255,107,138,0.3)"} />
          </g>
        )}
      </svg>
    );
  }
  
  // Fœtus développé (semaine 9+)
  return (
    <svg 
      viewBox="0 0 120 150" 
      width={size} 
      height={size * 1.25}
      style={{
        filter: isDarkMode 
          ? 'drop-shadow(0 6px 30px rgba(232,164,184,0.55)) drop-shadow(0 0 20px rgba(245,240,235,0.25))'
          : 'drop-shadow(0 6px 25px rgba(255,182,193,0.45))',
        animation: touched ? 'touched 1s ease-out' : undefined,
      }}
    >
      <defs>
        <radialGradient id="headGradDev" cx="35%" cy="30%">
          <stop offset="0%" stopColor={isDarkMode ? "#faf8fa" : "#fff8fa"} />
          <stop offset="100%" stopColor={skinPrimary} />
        </radialGradient>
        <radialGradient id="bodyGradDev" cx="50%" cy="30%">
          <stop offset="0%" stopColor={skinPrimary} />
          <stop offset="100%" stopColor={skinSecondary} />
        </radialGradient>
        <linearGradient id="limbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={skinPrimary} />
          <stop offset="100%" stopColor={skinSecondary} />
        </linearGradient>
      </defs>
      
      {/* Tête */}
      <ellipse cx="60" cy="35" rx="28" ry="30" fill="url(#headGradDev)" />
      
      {/* Yeux */}
      {showEyes && (
        <>
          <ellipse cx="52" cy="35" rx="3" ry="2.5" fill={isDarkMode ? "#3d3548" : "#2d3748"} />
          <ellipse cx="68" cy="35" rx="3" ry="2.5" fill={isDarkMode ? "#3d3548" : "#2d3748"} />
          <circle cx="51" cy="34" r="1" fill="white" />
          <circle cx="67" cy="34" r="1" fill="white" />
        </>
      )}
      
      {/* Reflet tête */}
      <ellipse cx="50" cy="25" rx="10" ry="7" fill={isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.5)"} />
      
      {/* Corps */}
      <ellipse cx="60" cy="85" rx="22" ry="35" fill="url(#bodyGradDev)" />
      
      {/* Bras */}
      {showLimbs && (
        <>
          <path 
            d="M 38 70 Q 25 65 22 80 Q 20 90 25 95" 
            stroke="url(#limbGrad)" 
            strokeWidth="10" 
            fill="none" 
            strokeLinecap="round"
          />
          <path 
            d="M 82 70 Q 95 65 98 80 Q 100 90 95 95" 
            stroke="url(#limbGrad)" 
            strokeWidth="10" 
            fill="none" 
            strokeLinecap="round"
          />
        </>
      )}
      
      {/* Jambes */}
      {showLimbs && (
        <>
          <path 
            d="M 50 115 Q 40 130 35 145" 
            stroke="url(#limbGrad)" 
            strokeWidth="12" 
            fill="none" 
            strokeLinecap="round"
          />
          <path 
            d="M 70 115 Q 80 130 85 145" 
            stroke="url(#limbGrad)" 
            strokeWidth="12" 
            fill="none" 
            strokeLinecap="round"
          />
        </>
      )}
      
      {/* Cœur battant */}
      {showHeart && (
        <g style={{ animation: 'heartbeat 0.75s ease-in-out infinite' }}>
          <ellipse cx="55" cy="80" rx="7" ry="6" fill={heartColor} />
          <ellipse cx="55" cy="80" rx="11" ry="10" fill={isDarkMode ? "rgba(255,143,168,0.3)" : "rgba(255,107,138,0.25)"} />
        </g>
      )}
    </svg>
  );
}

export default function Fetus3D({ week = 8, onTouch, className = "" }) {
  const { isDarkMode } = useTheme();
  const [touched, setTouched] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  
  // Obtenir les styles dynamiques selon le mode
  const styles = getStyles(isDarkMode);
  
  // Injecter les keyframes
  useEffect(() => {
    const styleId = 'fetus-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = keyframes;
      document.head.appendChild(style);
    }
  }, []);
  
  const handleTouch = () => {
    if (!isDragging) {
      setTouched(true);
      onTouch?.();
      setTimeout(() => setTouched(false), 1000);
    }
  };
  
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };
  
  const handlePointerMove = (e) => {
    if (isDragging) {
      const delta = e.clientX - startX;
      setRotation((prev) => prev + delta * 0.5);
      setStartX(e.clientX);
    }
  };
  
  const handlePointerUp = () => {
    setIsDragging(false);
  };
  
  return (
    <div 
      className={`relative baby-3d-zone ${className}`}
      style={styles.container}
      onClick={handleTouch}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      data-testid="fetus-3d-container"
    >
      {/* Effet veilleuse - halo externe */}
      <div style={styles.nightlightOuter} />
      
      {/* Effet veilleuse - halo interne */}
      <div style={styles.nightlightInner} />
      
      {/* Effet veilleuse - spot central */}
      <div style={styles.nightlightSpot} />
      
      {/* Glow effect classique */}
      <div style={styles.glow} />
      
      {/* Particules */}
      <div style={styles.particles}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={styles.particle(i, isDarkMode)} />
        ))}
      </div>
      
      {/* Fœtus */}
      <div 
        style={{
          ...styles.scene,
          transform: `rotateY(${rotation}deg)`,
          animation: isDragging ? 'none' : 'float 3s ease-in-out infinite',
        }}
      >
        <FetusSVG week={week} touched={touched} isDarkMode={isDarkMode} />
      </div>
      
      {/* Indicateur tactile */}
      <div className="absolute bottom-2 left-0 right-0 text-center z-20">
        <span 
          className="text-xs"
          style={{ 
            color: isDarkMode ? 'var(--md-night-text-muted)' : '#94a3b8',
            textShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.5)' : 'none'
          }}
        >
          Touchez et faites glisser pour interagir
        </span>
      </div>
    </div>
  );
}

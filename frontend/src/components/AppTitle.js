import React from 'react';

/**
 * AppTitle - Composant pour afficher le nom "MamanDouce" avec un style calligraphique
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' pour différentes tailles
 * @param {boolean} showSubtitle - Afficher le sous-titre
 * @param {string} className - Classes CSS additionnelles
 */
function AppTitle({ size = 'md', showSubtitle = false, className = '' }) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl sm:text-6xl'
  };

  return (
    <div className={`text-center ${className}`} data-testid="app-title">
      <h1 
        className={`${sizeClasses[size]} font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-coral-400 bg-clip-text text-transparent drop-shadow-sm`}
        style={{ 
          fontFamily: "'Dancing Script', cursive",
          textShadow: '0 2px 4px rgba(244, 114, 182, 0.15)'
        }}
      >
        MamanDouce
      </h1>
      {showSubtitle && (
        <p className="text-slate-500 mt-1 text-sm sm:text-base" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Votre compagnon de grossesse
        </p>
      )}
    </div>
  );
}

export default AppTitle;

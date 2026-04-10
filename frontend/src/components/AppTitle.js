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
        className={`${sizeClasses[size]} font-bold mamandouce-title drop-shadow-sm`}
        style={{ 
          fontFamily: "'Dancing Script', cursive",
          color: '#FFB7C5',
          WebkitTextFillColor: '#FFB7C5',
          textShadow: '0 2px 12px rgba(255, 183, 197, 0.4)'
        }}
        data-testid="mamandouce-logo"
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

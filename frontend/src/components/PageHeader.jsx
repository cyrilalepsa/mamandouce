import React from 'react';
import { BackButton } from './BackButton';

/**
 * PageHeader - En-tête de page avec bouton retour et titre calligraphique
 * @param {string} title - Titre de la page
 * @param {string} backPath - Chemin de retour explicite
 * @param {Function} onBack - Handler retour prioritaire
 */
function PageHeader({ title, backPath, onBack }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <BackButton
        onBack={onBack}
        backPath={backPath}
        className="bg-white text-sky-500 border border-sky-100 rounded-full p-2 hover:bg-sky-50"
        iconClassName="w-5 h-5"
      />
      <div className="flex-1">
        <h1 
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-coral-400 bg-clip-text text-transparent"
          style={{ 
            fontFamily: "'Dancing Script', cursive",
            textShadow: '0 1px 2px rgba(244, 114, 182, 0.1)'
          }}
          data-testid="page-title"
        >
          {title}
        </h1>
      </div>
    </div>
  );
}

export default PageHeader;

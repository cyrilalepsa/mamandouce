/**
 * CloudCard.jsx
 * Composant de carte avec effet 3D bombé nuage pastel
 * Réutilisable dans toute l'application
 */

import React from 'react';

// Palettes de couleurs pour l'effet nuage
const colorPalettes = {
  pink: {
    gradient: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(252,231,243,0.9) 45%, rgba(251,207,232,0.75) 70%, rgba(249,168,212,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(244,114,182,0.25), 0 6px 12px -4px rgba(244,114,182,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(244,114,182,0.1)',
    border: '2px solid rgba(244,114,182,0.25)'
  },
  blue: {
    gradient: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(224,242,254,0.9) 45%, rgba(186,230,253,0.75) 70%, rgba(125,211,252,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(56,189,248,0.25), 0 6px 12px -4px rgba(56,189,248,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(56,189,248,0.1)',
    border: '2px solid rgba(125,211,252,0.3)'
  },
  amber: {
    gradient: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(254,243,199,0.9) 45%, rgba(253,230,138,0.75) 70%, rgba(251,191,36,0.5) 100%)',
    shadow: '0 10px 28px -6px rgba(245,158,11,0.25), 0 6px 12px -4px rgba(245,158,11,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(245,158,11,0.1)',
    border: '2px solid rgba(251,191,36,0.3)'
  },
  green: {
    gradient: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(220,252,231,0.9) 45%, rgba(187,247,208,0.75) 70%, rgba(134,239,172,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(34,197,94,0.25), 0 6px 12px -4px rgba(34,197,94,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(34,197,94,0.1)',
    border: '2px solid rgba(134,239,172,0.3)'
  },
  purple: {
    gradient: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(243,232,255,0.9) 45%, rgba(233,213,255,0.75) 70%, rgba(216,180,254,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(168,85,247,0.25), 0 6px 12px -4px rgba(168,85,247,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(168,85,247,0.1)',
    border: '2px solid rgba(216,180,254,0.3)'
  },
  red: {
    gradient: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(254,226,226,0.9) 45%, rgba(254,202,202,0.75) 70%, rgba(252,165,165,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(239,68,68,0.25), 0 6px 12px -4px rgba(239,68,68,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(239,68,68,0.1)',
    border: '2px solid rgba(252,165,165,0.3)'
  },
  orange: {
    gradient: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(255,237,213,0.9) 45%, rgba(254,215,170,0.75) 70%, rgba(253,186,116,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(249,115,22,0.25), 0 6px 12px -4px rgba(249,115,22,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(249,115,22,0.1)',
    border: '2px solid rgba(253,186,116,0.3)'
  },
  sky: {
    gradient: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(224,247,250,0.9) 45%, rgba(186,242,250,0.75) 70%, rgba(125,225,252,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(14,165,233,0.25), 0 6px 12px -4px rgba(14,165,233,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(14,165,233,0.1)',
    border: '2px solid rgba(125,225,252,0.3)'
  },
  emerald: {
    gradient: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(209,250,229,0.9) 45%, rgba(167,243,208,0.75) 70%, rgba(110,231,183,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(16,185,129,0.25), 0 6px 12px -4px rgba(16,185,129,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(16,185,129,0.1)',
    border: '2px solid rgba(110,231,183,0.3)'
  }
};

/**
 * CloudCard - Carte avec effet 3D bombé nuage pastel
 * @param {string} color - Couleur de la palette (pink, blue, amber, green, purple, red, orange, sky, emerald)
 * @param {string} className - Classes CSS additionnelles
 * @param {boolean} pill - Si true, utilise un border-radius très arrondi (pill shape)
 * @param {boolean} onClick - Fonction de clic (rend la carte cliquable)
 * @param {boolean} noReflect - Désactive l'effet de reflet en haut
 * @param {object} style - Styles inline additionnels
 * @param {string} testId - data-testid pour les tests
 */
export function CloudCard({ 
  children, 
  color = 'pink', 
  className = '', 
  pill = false,
  onClick,
  noReflect = false,
  style = {},
  testId,
  ...props 
}) {
  const palette = colorPalettes[color] || colorPalettes.pink;
  
  return (
    <div
      className={`relative overflow-hidden ${pill ? 'rounded-full' : 'rounded-3xl'} ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
      style={{
        background: palette.gradient,
        boxShadow: palette.shadow,
        border: palette.border,
        transform: 'translateZ(0)',
        ...style
      }}
      onClick={onClick}
      data-testid={testId}
      {...props}
    >
      {/* Voile blanc supprimé — Zéro voile sur les cartes */}
      
      {/* Contenu */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

/**
 * CloudPill - Version pill de CloudCard (bouton allongé arrondi)
 */
export function CloudPill({ children, color = 'pink', className = '', ...props }) {
  return (
    <CloudCard color={color} pill className={`px-6 py-2.5 ${className}`} {...props}>
      {children}
    </CloudCard>
  );
}

export default CloudCard;

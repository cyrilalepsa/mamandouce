import React from 'react';
import { ChevronsUp, ChevronsDown } from 'lucide-react';

/**
 * Bouton pour ouvrir/fermer toutes les sections d'une page
 * 
 * @param {Object} props
 * @param {boolean} props.allOpen - Si toutes les sections sont ouvertes
 * @param {Function} props.onToggle - Callback appelé avec le nouvel état (true = tout ouvrir, false = tout fermer)
 * @param {string} props.className - Classes CSS additionnelles
 */
export function ToggleAllSections({ allOpen, onToggle, className = '' }) {
  return (
    <button
      onClick={() => onToggle(!allOpen)}
      data-testid="toggle-all-sections"
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
        allOpen
          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          : 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 hover:from-pink-200 hover:to-purple-200'
      } ${className}`}
    >
      {allOpen ? (
        <>
          <ChevronsUp className="w-4 h-4" />
          <span>Tout fermer</span>
        </>
      ) : (
        <>
          <ChevronsDown className="w-4 h-4" />
          <span>Tout ouvrir</span>
        </>
      )}
    </button>
  );
}

/**
 * Hook personnalisé pour gérer l'état de plusieurs sections
 * 
 * @param {number} count - Nombre de sections
 * @param {boolean} initialState - État initial (true = ouvert, false = fermé)
 * @returns {Object} { openSections, toggleSection, openAll, closeAll, allOpen }
 */
export function useCollapsibleSections(count, initialState = false) {
  const [openSections, setOpenSections] = React.useState(
    new Array(count).fill(initialState)
  );

  const toggleSection = (index) => {
    setOpenSections(prev => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const openAll = () => setOpenSections(new Array(count).fill(true));
  const closeAll = () => setOpenSections(new Array(count).fill(false));
  
  const allOpen = openSections.every(Boolean);
  const allClosed = openSections.every(s => !s);

  return {
    openSections,
    toggleSection,
    openAll,
    closeAll,
    allOpen,
    allClosed,
    setAllOpen: (open) => open ? openAll() : closeAll()
  };
}

export default ToggleAllSections;

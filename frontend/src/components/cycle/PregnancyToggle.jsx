import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti'; 
import NameOfTheDay from './NameOfTheDay'; 

// Path SVG pour l'effet wow pluie de cœurs
const heart = confetti.shapeFromPath({ 
  path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' 
});

/**
 * Composant Caméléon PregnancyToggle - Version FEUX D'ARTIFICE NERIA
 */
export function PregnancyToggle({ isPregnant, dueDate, lastPeriodDate, onPregnant, mode = "home" }) {
  const navigate = useNavigate();

  // 🧮 Calcul de la Semaine d'Aménorrhée (SA) et du Trimestre
  const pregnancyInfo = useMemo(() => {
    if (!lastPeriodDate) return { week: 10, trimester: 1 };
    const start = new Date(lastPeriodDate);
    const today = new Date();
    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.max(1, Math.floor(diffDays / 7) + 1);
    let trimester = 1;
    if (currentWeek > 14 && currentWeek <= 28) trimester = 2;
    if (currentWeek > 28) trimester = 3;
    return { week: currentWeek, trimester };
  }, [lastPeriodDate]);

  /**
   * ❤️🎆 Clic sur "Je suis enceinte" : Sequence de FEUX D'ARTIFICE Magique
   */
  const handleClick = () => {
    // ✨ Définition des éléments magiques
    const shapes = {
      hearts: [heart],
      sparkles: ['circle'] // Les petits cercles rapides font l'effet scintillement
    };

    const palettes = {
      bonbonPinks: ['#ff85b3', '#ff4d94', '#ffd1e1', '#ffffff'],
      magicLights: ['#ffffff', '#FFD700', '#AEC6CF'] // Blanc, Or pur, Argent scintillant
    };

    // Fonction helper pour lancer un tir precis
    const shoot = (opts) => confetti(Object.assign({
      ticks: 300,        // Durée de vie des particules
      gravity: 0.9,      // Chute un peu plus lente pour faire aérien
      startVelocity: 45, // Vitesse initiale
      zIndex: 100,       // Toujours au-dessus de tout
      spread: 100        // Largeur de l'explosion
    }, opts));

    // 💥💥 1. LANCEMENT DE LA SÉQUENCE MAGIQUE EN cascade (Timing précis)

    // A. Premier bouquet de COEUURS BONBON (Centre-Gauche, Bas)
    shoot({ 
      particleCount: 80, 
      origin: { x: 0.40, y: 0.70 }, 
      shapes: shapes.hearts, 
      colors: palettes.bonbonPinks, 
      scalar: 2.2 // Gros cœurs
    });

    // B. Deuxième bouquet de COEURS NACRÉS (Centre-Droite, un peu plus tard)
    setTimeout(() => shoot({ 
      particleCount: 70, 
      origin: { x: 0.60, y: 0.60 }, 
      shapes: shapes.hearts, 
      colors: palettes.bonbonPinks, 
      scalar: 1.8 // Un peu plus petits
    }), 200);

    // C. 💥💥💥 L'EXPLOSION CENTRALE DE SCINTILLEMENTS LUMINEUX (Haut, Rapide, Diffuse)
    // C'est ICI que se crée l'effet "Avatar/Magie"
    setTimeout(() => shoot({ 
      particleCount: 200, // Plein de petites particules !
      origin: { x: 0.50, y: 0.40 }, // Plus haut dans l'écran
      shapes: shapes.sparkles, 
      colors: palettes.magicLights, // La palette de LUMIÈRE
      scalar: 0.7, // Minuscules particules scintillantes
      startVelocity: 60, // EXPLOSION ultra-rapide
      spread: 360, // Dans toutes les directions
      gravity: 1.1, // Chute plus rapide (scintillements qui tombent)
      ticks: 200 // Durent moins longtemps
    }), 450);

    // D. Un rappel final mix (Milieu)
    setTimeout(() => shoot({ 
      particleCount: 100, 
      origin: { x: 0.50, y: 0.50 }, 
      shapes: ['circle', heart], 
      colors: [...palettes.bonbonPinks, ...palettes.magicLights], 
      scalar: 1.3, 
      spread: 200, 
      gravity: 0.6 
    }), 800);

    // ---💾 Traitement des données---
    const dpa = new Date(lastPeriodDate);
    dpa.setDate(dpa.getDate() + 280);
    const dpaStr = dpa.toISOString().split('T')[0];
    localStorage.setItem('mamandouce_pregnant', 'true');
    localStorage.setItem('mamandouce_due_date', dpaStr);
    onPregnant(dpaStr);
  };

  // ---RENDU (AUCUN CHANGEMENT ICI)---

  // 🌸 CAS 1 : PAGE SUIVI DE CYCLE (mode="cycle")
  if (mode === "cycle") {
    // ÉTAT : Déjà enceinte
    if (isPregnant && dueDate) {
      const formattedDate = new Date(dueDate).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      return (
        <div className="w-full mt-4 animate-fade-in">
          <div className="card_nacre w-full p-4 flex flex-col items-center text-center">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
              Félicitations • Votre Grossesse
            </span>
            <span className="text-base font-bold text-white mt-1">
              Date prévue d'accouchement
            </span>
            <span className="mt-2 text-xs font-medium px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white">
              {formattedDate}
            </span>
          </div>
        </div>
      );
    } 
    
    // ÉTAT : Pas encore enceinte (Bouton Rose Bonbon)
    return (
      <button
        onClick={handleClick}
        className="w-full mt-4 py-4 rounded-2xl text-white font-bold text-lg relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, #ffa6c9 0%, #ff66a2 50%, #ff3385 100%)',
          boxShadow: '0 8px 25px -6px rgba(255,102,162,0.4), 0 0 30px rgba(255,166,201,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
          border: '2px solid rgba(255,255,255,0.3)',
          letterSpacing: '0.05em',
        }}
        data-testid="pregnant-button"
      >
        <span style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>Je suis enceinte !</span>
      </button>
    );
  }

  // 🏠 CAS 2 : PAGE D'ACCUEIL (mode="home")
  if (mode === "home") {
    if (isPregnant && dueDate) {
      return (
        <div className="w-full mt-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-3 w-full">
            <div 
              onClick={() => navigate('/cycle-tracking')}
              className="card_nacre relative overflow-hidden px-4 py-3 cursor-pointer w-full flex flex-col justify-between items-center text-center transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ height: '112px', minHeight: '112px', maxHeight: '112px' }}
              data-testid="sa-week-card"
            >
              <span className="relative z-10 text-[10px] text-white/70 uppercase tracking-wider font-semibold leading-none mt-1">vous êtes à la</span>
              <span className="relative z-10 text-xl font-bold text-white leading-tight my-auto">Semaine {pregnancyInfo.week}</span>
              <span className="relative z-10 text-[10px] text-white/90 font-medium px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">Trimestre {pregnancyInfo.trimester} • SA</span>
            </div>
            <NameOfTheDay compact={true} />
          </div>
        </div>
      );
    }
    return (
      <div className="w-full mt-4 animate-fade-in">
        <NameOfTheDay compact={false} />
      </div>
    );
  }
  return null;
}
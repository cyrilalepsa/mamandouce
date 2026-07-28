import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti'; 
import NameOfTheDay from '../NameOfTheDay'; 

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
    if (!lastPeriodDate) return { week: 10, trimester: 1 }; // Fallback par défaut
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
    // 🛡️ SÉCURITÉ : Évite un crash fatal si la date est manquante ou invalide
    if (!lastPeriodDate) {
      console.error("Impossible de calculer la DPA : lastPeriodDate est manquant.");
      return;
    }

    const shapes = {
      hearts: [heart],
      sparkles: ['circle']
    };

    const palettes = {
      bonbonPinks: ['#ff85b3', '#ff4d94', '#ffd1e1', '#ffffff'],
      magicLights: ['#ffffff', '#FFD700', '#AEC6CF']
    };

    const shoot = (opts) => confetti(Object.assign({
      ticks: 300,        
      gravity: 0.9,      
      startVelocity: 45, 
      zIndex: 100,       
      spread: 100        
    }, opts));

    // A. Premier bouquet de COEURS BONBON (Centre-Gauche, Bas)
    shoot({ 
      particleCount: 80, 
      origin: { x: 0.40, y: 0.70 }, 
      shapes: shapes.hearts, 
      colors: palettes.bonbonPinks, 
      scalar: 2.2 
    });

    // B. Deuxième bouquet de COEURS NACRÉS (Centre-Droite)
    setTimeout(() => shoot({ 
      particleCount: 70, 
      origin: { x: 0.60, y: 0.60 }, 
      shapes: shapes.hearts, 
      colors: palettes.bonbonPinks, 
      scalar: 1.8 
    }), 200);

    // C. L'EXPLOSION CENTRALE DE SCINTILLEMENTS LUMINEUX
    setTimeout(() => shoot({ 
      particleCount: 200, 
      origin: { x: 0.50, y: 0.40 }, 
      shapes: shapes.sparkles, 
      colors: palettes.magicLights, 
      scalar: 0.7, 
      startVelocity: 60, 
      spread: 360, 
      gravity: 1.1, 
      ticks: 200 
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

    // 💾 --- Traitement des données & Sauvegarde ---
    const dpa = new Date(lastPeriodDate);
    dpa.setDate(dpa.getDate() + 280);
    const dpaStr = dpa.toISOString().split('T')[0];
    
    localStorage.setItem('mamandouce_pregnant', 'true');
    localStorage.setItem('mamandouce_due_date', dpaStr);
    
    // Déclenchement du callback parent
    if (onPregnant) {
      onPregnant(dpaStr);
    }
  };

  // ==========================================
  // ---               RENDU                ---
  // ==========================================

  // 🌸 CAS 1 : PAGE SUIVI DE CYCLE (mode="cycle")
  if (mode === "cycle") {
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
        <div className="w-full mt-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={() => navigate('/cycle-tracking')}
              className="relative overflow-hidden flex flex-col justify-between items-center text-center w-full p-3 box-border transition-all active:scale-95 cursor-pointer focus:outline-none card-glass-interactive glass-accent-pink rounded-[20px]"
              style={{
                height: '112px',
                minHeight: '112px',
              }}
              data-testid="sa-week-card"
            >
              <span className="relative z-10 text-[10px] text-[#2C2C2C]/80 uppercase tracking-wider font-semibold">
                Vous êtes à la
              </span>
              <span className="relative z-10 text-lg font-bold text-pink-600 my-0.5">
                Semaine {pregnancyInfo.week}
              </span>
              <span className="relative z-10 text-[10px] text-[#2C2C2C] font-medium bg-white/55 px-2.5 py-0.5 rounded-full shadow-sm">
                Trimestre {pregnancyInfo.trimester} • SA
              </span>
            </button>
            <NameOfTheDay compact={true} />
          </div>
        </div>
      );
    }
    // Pas encore enceinte : uniquement la fête du jour (pleine largeur)
    return (
      <div className="w-full mt-2 animate-fade-in" style={{ width: '100%' }}>
        <NameOfTheDay compact={false} fullWidth={true} />
      </div>
    );
  }

  return null;
}
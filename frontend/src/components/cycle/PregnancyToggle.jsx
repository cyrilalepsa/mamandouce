/**
 * Bouton "Je suis enceinte !" + carte DPA (Date Prévue d'Accouchement)
 * Effet "waouh" (sans confettis) : dégradé rose intense + multi-shadow + scale au hover
 */
export function PregnancyToggle({ isPregnant, dueDate, lastPeriodDate, onPregnant }) {
  const handleClick = () => {
    // DPA = dernières règles + 280 jours
    const dpa = new Date(lastPeriodDate);
    dpa.setDate(dpa.getDate() + 280);
    const dpaStr = dpa.toISOString().split('T')[0];
    localStorage.setItem('mamandouce_pregnant', 'true');
    localStorage.setItem('mamandouce_due_date', dpaStr);
    onPregnant(dpaStr);
  };

  if (!isPregnant) {
    return (
      <button
        onClick={handleClick}
        className="w-full mt-4 py-4 rounded-2xl text-white font-bold text-lg relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 25%, #db2777 50%, #be185d 75%, #9d174d 100%)',
          boxShadow: '0 8px 30px -6px rgba(219,39,119,0.5), 0 0 40px rgba(236,72,153,0.2), inset 0 2px 6px rgba(255,255,255,0.3)',
          border: '2px solid rgba(255,200,220,0.5)',
          letterSpacing: '0.05em',
        }}
        data-testid="pregnant-button"
      >
        <span style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>Je suis enceinte !</span>
      </button>
    );
  }

  if (!dueDate) return null;

  return (
    <div
      className="mt-4 p-4 rounded-2xl text-center animate-fade-in"
      style={{
        background: 'linear-gradient(145deg, rgba(252,231,243,0.9) 0%, rgba(251,207,232,0.7) 50%, rgba(249,168,212,0.5) 100%)',
        boxShadow: '0 8px 25px -4px rgba(236,72,153,0.3), inset 0 2px 6px rgba(255,255,255,0.8)',
        border: '2px solid rgba(251,207,232,0.5)',
      }}
      data-testid="dpa-card"
    >
      <p className="text-pink-600 font-bold text-lg" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        Félicitations !
      </p>
      <p className="text-pink-700 text-sm mt-1">Date prévue d'accouchement</p>
      <p className="text-pink-800 font-bold text-2xl mt-2">
        {new Date(dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      <p className="text-pink-500 text-xs mt-2">
        {Math.max(0, Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24)))} jours restants
      </p>
    </div>
  );
}

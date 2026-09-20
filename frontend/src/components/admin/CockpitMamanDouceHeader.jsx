/**
 * En-tête aligné sur le shell Cockpit NeriaCorp (FIRST-PARTY + API PASSWORD).
 */
export default function CockpitMamanDouceHeader({ onApiPasswordClick }) {
  return (
    <header className="space-y-3" data-testid="cockpit-mamandouce-header">
      <p
        className="text-xs font-semibold tracking-wide text-emerald-500 uppercase"
        data-testid="cockpit-first-party-label"
      >
        Cockpit • First-party
      </p>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard MamanDouce</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Accès SuperAdmin via proxy Noyau — jetons admin MamanDouce côté serveur.
        </p>
      </div>
      <button
        type="button"
        onClick={onApiPasswordClick}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-950/20 px-5 text-sm font-bold text-emerald-700 dark:text-emerald-300 active:bg-emerald-900/30 touch-manipulation"
        data-testid="cockpit-api-password-btn"
      >
        API PASSWORD
      </button>
    </header>
  );
}

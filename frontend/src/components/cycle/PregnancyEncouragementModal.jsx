import { Heart, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export const PREGNANCY_ENCOURAGEMENT_DISMISSED_KEY = 'mamandouce_cycle_congrats_dismissed';

export function PregnancyEncouragementModal({ isOpen, onClose, onGoToPregnancy }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
      role="presentation"
      data-testid="pregnancy-encouragement-overlay"
    >
      <Card
        className="relative w-full max-w-sm p-6 rounded-3xl border-2 border-pink-200 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        data-testid="pregnancy-encouragement-modal"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center bg-white/80 hover:bg-white text-slate-500 hover:text-slate-700 shadow-sm"
          aria-label="Fermer"
          data-testid="pregnancy-encouragement-close"
        >
          <X className="w-5 h-5" />
        </button>

        <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
        <h2 className="font-bold text-pink-700 text-lg">Félicitations !</h2>
        <p className="text-sm text-pink-600 mt-1 leading-relaxed">
          Cette première escale est achevée. Toute l’équipe MamanDouce vous souhaite
          une belle grossesse et beaucoup de courage pour la suite !
        </p>

        <div className="mt-5 space-y-2">
          <Button
            type="button"
            onClick={onGoToPregnancy}
            className="w-full rounded-2xl py-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold"
            data-testid="pregnancy-encouragement-go"
          >
            Accéder à mon espace Grossesse
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full rounded-2xl py-5 border-pink-200 text-pink-700 bg-white/80"
            data-testid="pregnancy-encouragement-dismiss"
          >
            Fermer
          </Button>
        </div>
      </Card>
    </div>
  );
}

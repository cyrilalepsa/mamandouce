import { CalendarHeart } from 'lucide-react';
import { Button } from '../ui/button';

export function MultiplePregnancyModal({ open, onClose, onSelect, saving = false }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
      onClick={onClose}
      data-testid="multiple-pregnancy-modal"
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl border border-violet-100/80"
        style={{
          background:
            'linear-gradient(160deg, #ffffff 0%, #faf5ff 35%, #f3e8ff 70%, #ede9fe 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #a78bfa, #7c3aed)',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
            }}
          >
            <CalendarHeart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-violet-900">Félicitations !</h3>
            <p className="text-sm text-violet-700/80">2e échographie du 5e mois</p>
          </div>
        </div>

        <p className="text-slate-700 text-sm leading-relaxed mb-5">
          Félicitations pour votre 2e échographie ! Pour ajuster les dates exactes de votre congé
          maternité : attendez-vous des jumeaux ou des triplés ?
        </p>

        <div className="space-y-2">
          <Button
            disabled={saving}
            onClick={() => onSelect('none')}
            data-testid="multiple-pregnancy-single"
            className="w-full rounded-2xl py-3 bg-white text-violet-800 border-2 border-violet-200 hover:bg-violet-50"
          >
            Un seul bébé
          </Button>
          <Button
            disabled={saving}
            onClick={() => onSelect('twins')}
            data-testid="multiple-pregnancy-twins"
            className="w-full rounded-2xl py-3 text-white"
            style={{
              background: 'linear-gradient(145deg, #a78bfa, #8b5cf6)',
            }}
          >
            Jumeaux
          </Button>
          <Button
            disabled={saving}
            onClick={() => onSelect('triplets_or_more')}
            data-testid="multiple-pregnancy-triplets"
            className="w-full rounded-2xl py-3 text-white"
            style={{
              background: 'linear-gradient(145deg, #7c3aed, #6d28d9)',
            }}
          >
            Triplés ou +
          </Button>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-700"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}

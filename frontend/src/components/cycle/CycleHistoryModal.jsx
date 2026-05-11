import { History, X } from 'lucide-react';
import { Button } from '../ui/button';

export function CycleHistoryModal({
  isOpen,
  onClose,
  isDarkMode,
  textShadow,
  cycleHistory,
  averageCycleLength,
  onDelete,
  getLocale,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className={`rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`p-4 flex items-center justify-between ${isDarkMode ? 'bg-gradient-to-r from-slate-700 to-gray-700' : 'bg-gradient-to-r from-slate-100 to-gray-100'}`}>
          <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-700'}`} style={textShadow}>
            <History className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            Historique des cycles
          </h3>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-white/80 hover:bg-white'}`}
            data-testid="history-modal-close"
          >
            <X className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {averageCycleLength && (
            <div className={`rounded-xl p-3 mb-4 ${isDarkMode ? 'bg-purple-900/30 border border-purple-800' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-purple-200' : 'text-slate-600'}`} style={textShadow}>
                <span className="font-semibold">Durée moyenne :</span> {averageCycleLength} jours
              </p>
            </div>
          )}

          <div className="space-y-2">
            {cycleHistory.map((cycle) => (
              <div
                key={cycle.id}
                className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}
              >
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-700'}`} style={textShadow}>
                    {new Date(cycle.startDate).toLocaleDateString(getLocale(), {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{cycle.cycleLength} jours</p>
                </div>
                <button
                  onClick={() => onDelete(cycle.id)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/30' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                  data-testid={`delete-cycle-${cycle.id}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {cycleHistory.length === 0 && (
            <p className={`text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Aucun cycle enregistré</p>
          )}
        </div>

        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <Button
            onClick={onClose}
            className={`w-full rounded-xl ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gradient-to-r from-slate-500 to-gray-500 text-white'}`}
            style={textShadow}
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

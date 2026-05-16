import { Brain } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function InitialSetupModal({
  isOpen,
  onSkip,
  onSave,
  isDarkMode,
  textShadow,
  textSecondary,
  textMuted,
  inputBg,
  initialDates,
  setInitialDates,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-3xl overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className={`p-6 ${isDarkMode ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50' : 'bg-gradient-to-r from-purple-100 to-pink-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-800/50' : 'bg-white'}`}>
              <Brain className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={textShadow}>
                Configurez l'IA
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-purple-200' : 'text-purple-600'}`} style={textShadow}>
                Pour des prédictions personnalisées
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className={`text-sm ${textSecondary}`} style={textShadow}>
            Entrez vos <strong>3 dernières dates de règles</strong> pour que l'IA analyse votre cycle :
          </p>

          {initialDates.map((date, index) => (
            <div key={index}>
              <label className={`text-sm font-medium ${textMuted} mb-1 block`} style={textShadow}>
                {index === 0 ? 'Dernières règles' : index === 1 ? 'Règles précédentes' : 'Règles d\'avant'}
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  const newDates = [...initialDates];
                  newDates[index] = e.target.value;
                  setInitialDates(newDates);
                }}
                className={`rounded-xl ${inputBg}`}
                data-testid={`initial-date-${index}`}
              />
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onSkip}
              variant="outline"
              className={`flex-1 rounded-xl ${isDarkMode ? 'border-slate-600 text-slate-300' : ''}`}
            >
              Plus tard
            </Button>
            <Button
              onClick={onSave}
              disabled={loading || initialDates.filter(d => d).length < 2}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
              data-testid="initial-setup-save"
            >
              {loading ? 'Analyse...' : 'Analyser'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Sparkles, X, Thermometer, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { SYMPTOM_OPTIONS, MOOD_OPTIONS } from './constants';

export function SymptomsModal({
  isOpen,
  onClose,
  isDarkMode,
  textShadow,
  todayMood,
  setTodayMood,
  todaySymptoms,
  toggleSymptom,
  todayTemp,
  setTodayTemp,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className={`rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`p-4 flex items-center justify-between ${isDarkMode ? 'bg-gradient-to-r from-amber-900/50 to-yellow-900/50' : 'bg-gradient-to-r from-amber-100 to-yellow-100'}`}>
          <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-700'}`} style={textShadow}>
            <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
            Comment vous sentez-vous ?
          </h3>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/80 hover:bg-white'}`}
            data-testid="symptoms-modal-close"
          >
            <X className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-5">
          {/* Humeur */}
          <div>
            <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} style={textShadow}>Votre humeur</p>
            <div className="grid grid-cols-3 gap-2">
              {MOOD_OPTIONS.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setTodayMood(todayMood === mood.id ? null : mood.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    todayMood === mood.id
                      ? `bg-gradient-to-br ${mood.color} border-transparent text-white shadow-lg scale-105`
                      : isDarkMode ? 'bg-slate-700 border-slate-600 hover:border-slate-500 text-slate-200' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  data-testid={`mood-${mood.id}`}
                >
                  <span className="text-2xl block mb-1">{mood.emoji}</span>
                  <span className="text-xs font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symptômes */}
          <div>
            <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} style={textShadow}>Symptômes ressentis</p>
            <div className="grid grid-cols-4 gap-2">
              {SYMPTOM_OPTIONS.map(symptom => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`p-2 rounded-xl border-2 transition-all ${
                    todaySymptoms.includes(symptom.id)
                      ? isDarkMode ? 'bg-amber-900/50 border-amber-500 shadow-sm' : 'bg-amber-100 border-amber-400 shadow-sm'
                      : isDarkMode ? 'bg-slate-700 border-slate-600 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  data-testid={`symptom-${symptom.id}`}
                >
                  <span className="text-xl block">{symptom.emoji}</span>
                  <span className={`text-[10px] leading-tight block mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{symptom.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Température */}
          <div>
            <p className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} style={textShadow}>
              <Thermometer className="w-4 h-4 text-rose-500" />
              Température basale (optionnel)
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                min="35"
                max="40"
                value={todayTemp}
                onChange={(e) => setTodayTemp(e.target.value)}
                placeholder="36.5"
                className="w-24 rounded-xl text-center"
                style={{ background: '#ffffff', color: '#000000', border: '1px solid #e2e8f0' }}
              />
              <span className="text-slate-500" style={{ color: '#000000' }}>°C</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`p-4 border-t flex gap-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <Button
            onClick={onClose}
            className="flex-1 rounded-xl text-slate-600"
            style={{
              background: 'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)',
              color: 'white',
              boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3), inset 0 1px 3px rgba(255,255,255,0.5)',
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={onSave}
            className="flex-1 rounded-xl"
            style={{
              background: 'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)',
              color: 'white',
              boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(244,63,94,0.15)',
            }}
            data-testid="symptoms-save-btn"
          >
            <Check className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}

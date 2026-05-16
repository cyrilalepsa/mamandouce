import { X, TrendingUp, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { exportCycleReportToPDF } from './cycleReportPdf';

export function CycleReportModal({
  isOpen,
  onClose,
  isDarkMode,
  textShadow,
  textSecondary,
  textMuted,
  cycleReport,
}) {
  if (!isOpen || !cycleReport) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-3xl overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className={`p-6 ${isDarkMode ? 'bg-gradient-to-r from-emerald-900/50 to-green-900/50' : 'bg-gradient-to-r from-emerald-100 to-green-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-800/50' : 'bg-white'}`}>
                <span className="text-2xl">{cycleReport.status_emoji}</span>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={textShadow}>
                  Bilan de votre cycle
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-emerald-200' : 'text-emerald-600'}`} style={textShadow}>
                  {cycleReport.status_message}
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-emerald-800/50 text-emerald-300' : 'hover:bg-emerald-200'}`}
              data-testid="cycle-report-close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Statistiques principales */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-xl text-center ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={textShadow}>
                {cycleReport.average_length}
              </p>
              <p className={`text-xs ${textMuted}`} style={textShadow}>jours en moyenne</p>
            </div>
            <div className={`p-4 rounded-xl text-center ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={textShadow}>
                ±{cycleReport.variation_days}
              </p>
              <p className={`text-xs ${textMuted}`} style={textShadow}>jours de variation</p>
            </div>
          </div>

          {/* Score de régularité */}
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-emerald-50 to-green-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${textSecondary}`} style={textShadow}>Score de régularité</span>
              <span className={`font-bold ${cycleReport.regularity_score >= 75 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-amber-400' : 'text-amber-600')}`} style={textShadow}>
                {cycleReport.regularity_score}%
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
                style={{ width: `${cycleReport.regularity_score}%` }}
              />
            </div>
          </div>

          {/* Message d'amélioration */}
          {cycleReport.improvement_percentage !== 0 && (
            <div className={`flex items-center gap-2 p-3 rounded-xl ${
              cycleReport.improvement_percentage > 0
                ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700')
                : (isDarkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-50 text-amber-700')
            }`}>
              <TrendingUp className={`w-5 h-5 ${cycleReport.improvement_percentage < 0 ? 'rotate-180' : ''}`} />
              <span className="text-sm font-medium" style={textShadow}>{cycleReport.improvement_message}</span>
            </div>
          )}

          {/* Recommandation */}
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-purple-900/30 border border-purple-800' : 'bg-purple-50 border border-purple-100'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`} style={textShadow}>
              💡 {cycleReport.recommendation}
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => exportCycleReportToPDF(cycleReport)}
              variant="outline"
              className={`flex-1 rounded-xl ${isDarkMode ? 'border-emerald-700 text-emerald-300 hover:bg-emerald-900/30' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}
              data-testid="export-pdf-btn"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter en PDF
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl"
            >
              C'est compris !
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

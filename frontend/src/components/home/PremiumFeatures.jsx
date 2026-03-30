import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Maximize2, 
  Minimize2, 
  Palette, 
  Download, 
  Upload, 
  Crown,
  Check,
  X
} from 'lucide-react';
import { useSubscription } from '../SubscriptionGate';
import { useHomeLayout } from '../../contexts/HomeLayoutContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';

// Thèmes de couleur disponibles pour les pages (Premium)
export const PAGE_THEMES = [
  { id: 'default', name: 'Par défaut', colors: { bg: 'bg-white', accent: 'pink' } },
  { id: 'ocean', name: 'Océan', colors: { bg: 'bg-gradient-to-br from-sky-50 to-blue-100', accent: 'sky' } },
  { id: 'sunset', name: 'Coucher de soleil', colors: { bg: 'bg-gradient-to-br from-orange-50 to-pink-100', accent: 'orange' } },
  { id: 'forest', name: 'Forêt', colors: { bg: 'bg-gradient-to-br from-emerald-50 to-teal-100', accent: 'emerald' } },
  { id: 'lavender', name: 'Lavande', colors: { bg: 'bg-gradient-to-br from-purple-50 to-violet-100', accent: 'purple' } },
  { id: 'rose', name: 'Rose', colors: { bg: 'bg-gradient-to-br from-pink-50 to-rose-100', accent: 'rose' } },
  { id: 'gold', name: 'Doré', colors: { bg: 'bg-gradient-to-br from-amber-50 to-yellow-100', accent: 'amber' } },
  { id: 'night', name: 'Nuit', colors: { bg: 'bg-gradient-to-br from-slate-100 to-gray-200', accent: 'slate' } },
];

// Tailles de widgets disponibles (Premium)
export const WIDGET_SIZES = {
  small: { cols: 1, rows: 1, label: 'Petit' },
  medium: { cols: 2, rows: 1, label: 'Moyen' },
  large: { cols: 2, rows: 2, label: 'Grand' },
};

// Sélecteur de thème de page
export function PageThemeSelector({ currentTheme, onSelectTheme, isOpen, onClose }) {
  const { t } = useTranslation();
  const { isPremium } = useSubscription();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-slate-700">
              {t('premium.pageTheme', 'Thème de la page')}
            </h3>
            <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
              <Crown className="w-3 h-3" /> Premium
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {!isPremium ? (
          <div className="text-center py-6">
            <Crown className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">
              {t('premium.unlockThemes', 'Débloquez les thèmes personnalisés avec Premium')}
            </p>
            <Button 
              onClick={() => window.location.href = '/subscription'}
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full"
            >
              {t('premium.upgrade', 'Passer à Premium')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {PAGE_THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  toast.success(t('premium.themeApplied', 'Thème appliqué !'));
                }}
                className={`relative p-3 rounded-xl transition-all ${theme.colors.bg} ${
                  currentTheme === theme.id 
                    ? 'ring-2 ring-purple-500 ring-offset-2' 
                    : 'hover:scale-105'
                }`}
              >
                <div className={`w-full h-8 rounded-lg bg-${theme.colors.accent}-400 mb-2`}></div>
                <span className="text-xs font-medium text-slate-600">{theme.name}</span>
                {currentTheme === theme.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Contrôles de taille de widget
export function WidgetSizeControls({ currentSize, onResize, itemId }) {
  const { t } = useTranslation();
  const { isPremium } = useSubscription();

  if (!isPremium) {
    return (
      <div className="flex items-center gap-1 opacity-50">
        <Crown className="w-3 h-3 text-amber-400" />
        <span className="text-xs text-slate-400">Premium</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onResize(itemId, 'small')}
        className={`p-1 rounded ${currentSize === 'small' ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:bg-slate-100'}`}
        title={t('premium.sizeSmall', 'Petit')}
      >
        <Minimize2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onResize(itemId, 'large')}
        className={`p-1 rounded ${currentSize === 'large' ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:bg-slate-100'}`}
        title={t('premium.sizeLarge', 'Grand')}
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// Export/Import de configuration (Premium)
export function ConfigExportImport() {
  const { t } = useTranslation();
  const { isPremium } = useSubscription();
  const { layout, saveLayout } = useHomeLayout();
  const [showImport, setShowImport] = useState(false);

  const handleExport = () => {
    if (!isPremium) {
      toast.error(t('premium.required', 'Fonctionnalité Premium requise'));
      return;
    }

    const data = JSON.stringify(layout, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mamandouce-layout.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('premium.exported', 'Configuration exportée !'));
  };

  const handleImport = (event) => {
    if (!isPremium) {
      toast.error(t('premium.required', 'Fonctionnalité Premium requise'));
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedLayout = JSON.parse(e.target.result);
        await saveLayout(importedLayout);
        toast.success(t('premium.imported', 'Configuration importée !'));
        setShowImport(false);
      } catch (error) {
        toast.error(t('common.error', 'Erreur lors de l\'import'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleExport}
        variant="outline"
        size="sm"
        className={`rounded-full ${!isPremium ? 'opacity-50' : ''}`}
        disabled={!isPremium}
      >
        <Download className="w-4 h-4 mr-1" />
        {t('premium.export', 'Exporter')}
        {!isPremium && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
      </Button>

      <Button
        onClick={() => isPremium ? setShowImport(true) : toast.error(t('premium.required', 'Premium requis'))}
        variant="outline"
        size="sm"
        className={`rounded-full ${!isPremium ? 'opacity-50' : ''}`}
        disabled={!isPremium}
      >
        <Upload className="w-4 h-4 mr-1" />
        {t('premium.import', 'Importer')}
        {!isPremium && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
      </Button>

      {/* Modal d'import */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-700 mb-4">
              {t('premium.importConfig', 'Importer une configuration')}
            </h3>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="w-full p-2 border rounded-xl"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowImport(false)}>
                {t('common.cancel', 'Annuler')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Panneau de contrôle Premium (affiché en mode édition)
export function PremiumControlPanel({ isVisible, currentPageTheme, onThemeChange }) {
  const { t } = useTranslation();
  const { isPremium } = useSubscription();
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  if (!isVisible) return null;

  return (
    <>
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-4 border border-purple-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-slate-700">
              {t('premium.customization', 'Personnalisation avancée')}
            </span>
          </div>
          {!isPremium && (
            <Button 
              onClick={() => window.location.href = '/subscription'}
              size="sm"
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full text-xs"
            >
              {t('premium.unlock', 'Débloquer')}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Thème de page */}
          <Button
            onClick={() => setShowThemeSelector(true)}
            variant="outline"
            size="sm"
            className={`rounded-full ${!isPremium ? 'opacity-60' : ''}`}
          >
            <Palette className="w-4 h-4 mr-1" />
            {t('premium.theme', 'Thème')}
            {!isPremium && <Crown className="w-3 h-3 ml-1 text-amber-400" />}
          </Button>

          {/* Export/Import */}
          <ConfigExportImport />
        </div>
      </Card>

      {/* Sélecteur de thème */}
      <PageThemeSelector
        currentTheme={currentPageTheme}
        onSelectTheme={onThemeChange}
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
    </>
  );
}

export default PremiumControlPanel;

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Styles pastel bombés
const PASTEL_STYLES = {
  purple: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(243,232,255,0.95) 30%, rgba(233,213,255,0.85) 70%, rgba(216,180,254,0.75) 100%)',
    shadow: '0 6px 16px -4px rgba(139,92,246,0.2), 0 3px 6px -2px rgba(139,92,246,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(139,92,246,0.08)',
    iconBg: 'bg-purple-100/60',
    chevron: 'text-purple-400'
  },
  sky: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.95) 30%, rgba(186,230,253,0.85) 70%, rgba(125,211,252,0.75) 100%)',
    shadow: '0 6px 16px -4px rgba(14,165,233,0.2), 0 3px 6px -2px rgba(14,165,233,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(14,165,233,0.08)',
    iconBg: 'bg-sky-100/60',
    chevron: 'text-sky-400'
  },
  pink: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(252,231,243,0.95) 30%, rgba(251,207,232,0.85) 70%, rgba(249,168,212,0.75) 100%)',
    shadow: '0 6px 16px -4px rgba(236,72,153,0.2), 0 3px 6px -2px rgba(236,72,153,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(236,72,153,0.08)',
    iconBg: 'bg-pink-100/60',
    chevron: 'text-pink-400'
  },
  slate: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.95) 30%, rgba(226,232,240,0.85) 70%, rgba(203,213,225,0.75) 100%)',
    shadow: '0 6px 16px -4px rgba(100,116,139,0.2), 0 3px 6px -2px rgba(100,116,139,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(100,116,139,0.08)',
    iconBg: 'bg-slate-100/60',
    chevron: 'text-slate-400'
  }
};

// Mapping des couleurs d'icônes vers les styles pastel
const colorToStyle = {
  'text-purple-600': 'purple',
  'text-sky-600': 'sky',
  'text-pink-600': 'pink',
  'text-slate-600': 'slate'
};

export function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  badge = null,
  iconBg = 'bg-gradient-to-br from-slate-100 to-slate-200',
  iconColor = 'text-slate-600',
  'data-testid': dataTestId
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Déterminer le style pastel selon la couleur d'icône
  const styleKey = colorToStyle[iconColor] || 'slate';
  const style = PASTEL_STYLES[styleKey];

  return (
    <div className="overflow-hidden rounded-3xl" data-testid={dataTestId}>
      {/* Header avec effet bombé */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 cursor-pointer transition-all duration-200 hover:scale-[1.005] active:scale-[0.995] relative overflow-hidden"
        style={{
          background: style.bg,
          boxShadow: style.shadow
        }}
        data-testid={dataTestId ? `${dataTestId}-header` : undefined}
      >
        {/* Voile blanc supprimé */}
<div className="flex items-center gap-3 relative">
          <div className={`w-10 h-10 ${style.iconBg} backdrop-blur-sm rounded-xl flex items-center justify-center`}
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <h3 className="font-bold text-slate-700">{title}</h3>
        </div>
        <div className="flex items-center gap-2 relative">
          {badge && (
            <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className={`w-5 h-5 ${style.chevron}`} />
          ) : (
            <ChevronDown className={`w-5 h-5 ${style.chevron}`} />
          )}
        </div>
      </button>
      
      {/* Contenu */}
      {isOpen && (
        <div className="px-4 pb-4 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200 bg-white/80 backdrop-blur-sm">
          {children}
          
          {/* Bouton fermer avec style pastel */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className={`w-full p-2.5 rounded-xl ${style.iconBg} backdrop-blur-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]`}
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <ChevronUp className={`w-4 h-4 ${style.chevron}`} />
            <span className={`text-sm font-semibold ${iconColor}`}>Fermer</span>
          </button>
        </div>
      )}
    </div>
  );
}

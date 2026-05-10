import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Styles pastel pour effet bombé 3D
const PASTEL_COLORS = {
  pink: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(252,231,243,0.95) 30%, rgba(251,207,232,0.85) 70%, rgba(249,168,212,0.75) 100%)',
    border: 'rgba(236,72,153,0.3)',
    shadow: 'rgba(236,72,153,0.2)',
    iconBg: 'bg-pink-100/60',
    iconText: 'text-pink-600',
    text: 'text-pink-800'
  },
  sky: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.95) 30%, rgba(186,230,253,0.85) 70%, rgba(125,211,252,0.75) 100%)',
    border: 'rgba(14,165,233,0.3)',
    shadow: 'rgba(14,165,233,0.2)',
    iconBg: 'bg-sky-100/60',
    iconText: 'text-sky-600',
    text: 'text-sky-800'
  },
  amber: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(254,243,199,0.95) 30%, rgba(253,230,138,0.85) 70%, rgba(252,211,77,0.75) 100%)',
    border: 'rgba(245,158,11,0.3)',
    shadow: 'rgba(245,158,11,0.2)',
    iconBg: 'bg-amber-100/60',
    iconText: 'text-amber-600',
    text: 'text-amber-800'
  },
  red: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(254,226,226,0.95) 30%, rgba(254,202,202,0.85) 70%, rgba(252,165,165,0.75) 100%)',
    border: 'rgba(239,68,68,0.3)',
    shadow: 'rgba(239,68,68,0.2)',
    iconBg: 'bg-red-100/60',
    iconText: 'text-red-600',
    text: 'text-red-800'
  },
  purple: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(243,232,255,0.95) 30%, rgba(233,213,255,0.85) 70%, rgba(216,180,254,0.75) 100%)',
    border: 'rgba(139,92,246,0.3)',
    shadow: 'rgba(139,92,246,0.2)',
    iconBg: 'bg-purple-100/60',
    iconText: 'text-purple-600',
    text: 'text-purple-800'
  },
  green: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(220,252,231,0.95) 30%, rgba(187,247,208,0.85) 70%, rgba(134,239,172,0.75) 100%)',
    border: 'rgba(34,197,94,0.3)',
    shadow: 'rgba(34,197,94,0.2)',
    iconBg: 'bg-green-100/60',
    iconText: 'text-green-600',
    text: 'text-green-800'
  },
  violet: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(245,243,255,0.95) 30%, rgba(237,233,254,0.85) 70%, rgba(196,181,253,0.75) 100%)',
    border: 'rgba(124,58,237,0.3)',
    shadow: 'rgba(124,58,237,0.2)',
    iconBg: 'bg-violet-100/60',
    iconText: 'text-violet-600',
    text: 'text-violet-800'
  },
  rose: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,228,230,0.95) 30%, rgba(254,205,211,0.85) 70%, rgba(253,164,175,0.75) 100%)',
    border: 'rgba(244,63,94,0.3)',
    shadow: 'rgba(244,63,94,0.2)',
    iconBg: 'bg-rose-100/60',
    iconText: 'text-rose-600',
    text: 'text-rose-800'
  },
  cyan: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(207,250,254,0.95) 30%, rgba(165,243,252,0.85) 70%, rgba(103,232,249,0.75) 100%)',
    border: 'rgba(6,182,212,0.3)',
    shadow: 'rgba(6,182,212,0.2)',
    iconBg: 'bg-cyan-100/60',
    iconText: 'text-cyan-600',
    text: 'text-cyan-800'
  },
  orange: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,237,213,0.95) 30%, rgba(254,215,170,0.85) 70%, rgba(253,186,116,0.75) 100%)',
    border: 'rgba(249,115,22,0.3)',
    shadow: 'rgba(249,115,22,0.2)',
    iconBg: 'bg-orange-100/60',
    iconText: 'text-orange-600',
    text: 'text-orange-800'
  }
};

// Accordéon avec effet bombé pastel - PAS DE CONTOUR pour menus déroulants
export function PastelAccordion({ title, icon, color = 'pink', defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const style = PASTEL_COLORS[color] || PASTEL_COLORS.pink;
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-3xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden"
        style={{
          background: style.bg,
          boxShadow: `0 8px 20px -4px ${style.shadow}, 0 4px 8px -2px ${style.shadow}, inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px ${style.shadow}`,
        }}
      >
        {/* Effet de reflet bombé */}
        {/* Voile blanc supprimé */}
        
        <div className="relative px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${style.iconBg} backdrop-blur-sm`}
              style={{
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <span className="text-xl">{icon}</span>
            </div>
            <h3 className={`font-bold text-left ${style.text}`}>{title}</h3>
          </div>
          {isOpen ? <ChevronUp className={`w-5 h-5 ${style.iconText}`} /> : <ChevronDown className={`w-5 h-5 ${style.iconText}`} />}
        </div>
      </button>
      
      {isOpen && (
        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {children}
          
          {/* Bouton fermer en bas - style discret */}
          <button
            onClick={() => setIsOpen(false)}
            className={`w-full p-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] ${style.iconBg} backdrop-blur-sm`}
            style={{
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.03)'
            }}
          >
            <ChevronUp className={`w-4 h-4 ${style.iconText}`} />
            <span className={`text-sm font-semibold ${style.iconText}`}>Fermer</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Carte avec effet bombé pastel - pour les éléments en mosaïque (icône quasi transparente)
export function PastelCard({ color = 'pink', className = '', children, onClick, style: customStyle = {} }) {
  const colorStyle = PASTEL_COLORS[color] || PASTEL_COLORS.pink;
  
  return (
    <div 
      className={`relative rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: colorStyle.bg,
        boxShadow: `0 6px 16px -4px ${colorStyle.shadow}, 0 3px 6px -2px ${colorStyle.shadow}, inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px ${colorStyle.shadow}`,
        ...customStyle
      }}
      onClick={onClick}
    >
      {/* Effet de reflet bombé */}
      {/* Voile blanc supprimé */}
      
      <div className="relative p-3">
        {children}
      </div>
    </div>
  );
}

// Carte large (pill) avec effet bombé - pour éléments pleine largeur
export function PastelPillCard({ color = 'pink', className = '', children, onClick }) {
  const colorStyle = PASTEL_COLORS[color] || PASTEL_COLORS.pink;
  
  return (
    <div 
      className={`relative rounded-full overflow-hidden transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: colorStyle.bg,
        boxShadow: `0 8px 20px -4px ${colorStyle.shadow}, 0 4px 8px -2px ${colorStyle.shadow}, inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px ${colorStyle.shadow}`,
      }}
      onClick={onClick}
    >
      {/* Effet de reflet bombé */}
      {/* Voile blanc supprimé */}
      
      <div className="relative px-4 py-2.5">
        {children}
      </div>
    </div>
  );
}

// Bulle d'icône quasi transparente
export function TransparentIconBubble({ color = 'pink', icon, className = '' }) {
  const colorStyle = PASTEL_COLORS[color] || PASTEL_COLORS.pink;
  
  return (
    <div 
      className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorStyle.iconBg} backdrop-blur-sm ${className}`}
      style={{
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)'
      }}
    >
      {typeof icon === 'string' ? (
        <span className="text-xl">{icon}</span>
      ) : (
        icon
      )}
    </div>
  );
}

export { PASTEL_COLORS };

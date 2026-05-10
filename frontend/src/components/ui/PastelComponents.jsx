import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Couleurs vives pour les logos — cycle J→B→R→V→Vi
const LOGO_COLORS = {
  yellow: 'from-yellow-400 to-amber-500',
  blue: 'from-blue-400 to-sky-500',
  red: 'from-red-400 to-rose-500',
  green: 'from-green-400 to-emerald-500',
  violet: 'from-violet-400 to-purple-500',
};

// Teintes de fond pour le contenu (couleur du logo infusée, sans bombé)
const CONTENT_TINTS = {
  pink: { bg: 'rgba(252,231,243,0.25)', text: 'text-slate-700' },
  sky: { bg: 'rgba(224,242,254,0.25)', text: 'text-slate-700' },
  amber: { bg: 'rgba(254,243,199,0.25)', text: 'text-slate-700' },
  red: { bg: 'rgba(254,226,226,0.25)', text: 'text-slate-700' },
  purple: { bg: 'rgba(243,232,255,0.25)', text: 'text-slate-700' },
  green: { bg: 'rgba(220,252,231,0.25)', text: 'text-slate-700' },
  violet: { bg: 'rgba(237,233,254,0.25)', text: 'text-slate-700' },
  rose: { bg: 'rgba(255,228,230,0.25)', text: 'text-slate-700' },
  cyan: { bg: 'rgba(207,250,254,0.25)', text: 'text-slate-700' },
  orange: { bg: 'rgba(255,237,213,0.25)', text: 'text-slate-700' },
};

// Styles pastel (gardés pour compatibilité avec code existant)
const PASTEL_COLORS = {
  pink: { bg: 'linear-gradient(145deg, rgba(252,231,243,0.3) 0%, rgba(251,207,232,0.2) 100%)', border: 'rgba(236,72,153,0.15)', shadow: 'rgba(236,72,153,0.08)', iconBg: 'bg-pink-100/60', iconText: 'text-pink-600', text: 'text-pink-800' },
  sky: { bg: 'linear-gradient(145deg, rgba(224,242,254,0.3) 0%, rgba(186,230,253,0.2) 100%)', border: 'rgba(14,165,233,0.15)', shadow: 'rgba(14,165,233,0.08)', iconBg: 'bg-sky-100/60', iconText: 'text-sky-600', text: 'text-sky-800' },
  amber: { bg: 'linear-gradient(145deg, rgba(254,243,199,0.3) 0%, rgba(253,230,138,0.2) 100%)', border: 'rgba(245,158,11,0.15)', shadow: 'rgba(245,158,11,0.08)', iconBg: 'bg-amber-100/60', iconText: 'text-amber-600', text: 'text-amber-800' },
  red: { bg: 'linear-gradient(145deg, rgba(254,226,226,0.3) 0%, rgba(254,202,202,0.2) 100%)', border: 'rgba(239,68,68,0.15)', shadow: 'rgba(239,68,68,0.08)', iconBg: 'bg-red-100/60', iconText: 'text-red-600', text: 'text-red-800' },
  purple: { bg: 'linear-gradient(145deg, rgba(243,232,255,0.3) 0%, rgba(233,213,255,0.2) 100%)', border: 'rgba(139,92,246,0.15)', shadow: 'rgba(139,92,246,0.08)', iconBg: 'bg-purple-100/60', iconText: 'text-purple-600', text: 'text-purple-800' },
  green: { bg: 'linear-gradient(145deg, rgba(220,252,231,0.3) 0%, rgba(187,247,208,0.2) 100%)', border: 'rgba(34,197,94,0.15)', shadow: 'rgba(34,197,94,0.08)', iconBg: 'bg-green-100/60', iconText: 'text-green-600', text: 'text-green-800' },
  violet: { bg: 'linear-gradient(145deg, rgba(237,233,254,0.3) 0%, rgba(221,214,254,0.2) 100%)', border: 'rgba(124,58,237,0.15)', shadow: 'rgba(124,58,237,0.08)', iconBg: 'bg-violet-100/60', iconText: 'text-violet-600', text: 'text-violet-800' },
  rose: { bg: 'linear-gradient(145deg, rgba(255,228,230,0.3) 0%, rgba(254,205,211,0.2) 100%)', border: 'rgba(244,63,94,0.15)', shadow: 'rgba(244,63,94,0.08)', iconBg: 'bg-rose-100/60', iconText: 'text-rose-600', text: 'text-rose-800' },
  cyan: { bg: 'linear-gradient(145deg, rgba(207,250,254,0.3) 0%, rgba(165,243,252,0.2) 100%)', border: 'rgba(6,182,212,0.15)', shadow: 'rgba(6,182,212,0.08)', iconBg: 'bg-cyan-100/60', iconText: 'text-cyan-600', text: 'text-cyan-800' },
  orange: { bg: 'linear-gradient(145deg, rgba(255,237,213,0.3) 0%, rgba(254,215,170,0.2) 100%)', border: 'rgba(249,115,22,0.15)', shadow: 'rgba(249,115,22,0.08)', iconBg: 'bg-orange-100/60', iconText: 'text-orange-600', text: 'text-orange-800' },
};

// Accordéon — Tiroir BLANC INTENSE BOMBÉ 3D GLOSSY + Logo coloré vif
export function PastelAccordion({ title, icon, color = 'pink', defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const style = PASTEL_COLORS[color] || PASTEL_COLORS.pink;
  
  return (
    <div className="mb-4">
      {/* TIROIR FERMÉ — Blanc intense bombé 3D glossy */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-2xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden nacre-bombe"
        style={{
          background: 'linear-gradient(160deg, #ffffff 0%, #ffffff 20%, #fefefe 45%, #fafafa 70%, #f5f5f7 100%)',
          boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1), 0 4px 8px -2px rgba(0,0,0,0.05), inset -4px -4px 10px rgba(0,0,0,0.04), inset 4px 4px 10px rgba(255,255,255,0.95)',
          border: '1px solid rgba(255,255,255,0.95)',
        }}
      >
        <div className="relative px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Bulle logo colorée vive */}
            <div 
              className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                color === 'pink' || color === 'rose' ? 'from-red-400 to-rose-500' :
                color === 'sky' || color === 'blue' ? 'from-blue-400 to-sky-500' :
                color === 'amber' || color === 'yellow' ? 'from-yellow-400 to-amber-500' :
                color === 'green' ? 'from-green-400 to-emerald-500' :
                color === 'purple' || color === 'violet' ? 'from-violet-400 to-purple-500' :
                color === 'red' ? 'from-red-400 to-rose-500' :
                color === 'orange' ? 'from-orange-400 to-amber-500' :
                color === 'cyan' ? 'from-cyan-400 to-sky-500' :
                'from-yellow-400 to-amber-500'
              }`}
              style={{ boxShadow: '0 3px 8px -1px rgba(0,0,0,0.2), inset 0 1px 3px rgba(255,255,255,0.3)' }}
            >
              <span className="text-xl">{icon}</span>
            </div>
            <h3 className="font-bold text-left text-black">{title}</h3>
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>
      
      {/* CONTENU OUVERT — Couleur du logo infusée, SANS bombé */}
      {isOpen && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {children}
          
          <button
            onClick={() => setIsOpen(false)}
            className="w-full p-2 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-50"
            style={{ background: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronUp className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-400">Fermer</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Carte contenu — Prend la TEINTE du logo parent, SANS bombé (glossy plat)
export function PastelCard({ color = 'pink', className = '', children, onClick, style: customStyle = {} }) {
  const tint = CONTENT_TINTS[color] || CONTENT_TINTS.pink;
  
  return (
    <div 
      className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''} ${className}`}
      style={{
        background: `linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 30%, ${tint.bg} 100%)`,
        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
        border: '1px solid rgba(240,240,242,0.6)',
        ...customStyle
      }}
      onClick={onClick}
    >
      <div className="relative p-3">
        {children}
      </div>
    </div>
  );
}

// Carte pill pleine largeur — Blanc bombé
export function PastelPillCard({ color = 'pink', className = '', children, onClick }) {
  return (
    <div 
      className={`relative rounded-full overflow-hidden transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'linear-gradient(160deg, #ffffff 0%, #ffffff 20%, #fefefe 45%, #fafafa 70%, #f5f5f7 100%)',
        boxShadow: '0 6px 16px -4px rgba(0,0,0,0.08), 0 3px 6px -2px rgba(0,0,0,0.04), inset -3px -3px 8px rgba(0,0,0,0.03), inset 3px 3px 8px rgba(255,255,255,0.95)',
        border: '1px solid rgba(255,255,255,0.95)',
      }}
      onClick={onClick}
    >
      <div className="relative px-4 py-2.5">
        {children}
      </div>
    </div>
  );
}

// Bulle d'icône colorée vive
export function TransparentIconBubble({ color = 'pink', icon, className = '' }) {
  const colorStyle = PASTEL_COLORS[color] || PASTEL_COLORS.pink;
  
  return (
    <div 
      className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorStyle.iconBg} ${className}`}
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

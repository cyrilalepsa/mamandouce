import { useState } from 'react';
import { Card } from '../ui/card';
import { Check, Play, ExternalLink, Shield, Info, ChevronDown, ChevronUp } from 'lucide-react';

// Composant Accordéon avec style bombé pastel
function AccordionCard({ title, icon, color, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Couleurs pastel pour l'effet bombé
  const colorStyles = {
    purple: {
      bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(243,232,255,0.95) 30%, rgba(233,213,255,0.85) 70%, rgba(216,180,254,0.75) 100%)',
      border: 'rgba(139,92,246,0.3)',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      shadow: 'rgba(139,92,246,0.2)'
    },
    sky: {
      bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.95) 30%, rgba(186,230,253,0.85) 70%, rgba(125,211,252,0.75) 100%)',
      border: 'rgba(14,165,233,0.3)',
      iconBg: 'bg-sky-100',
      iconText: 'text-sky-600',
      shadow: 'rgba(14,165,233,0.2)'
    },
    red: {
      bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(254,226,226,0.95) 30%, rgba(254,202,202,0.85) 70%, rgba(252,165,165,0.75) 100%)',
      border: 'rgba(239,68,68,0.3)',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      shadow: 'rgba(239,68,68,0.2)'
    },
    pink: {
      bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(252,231,243,0.95) 30%, rgba(251,207,232,0.85) 70%, rgba(249,168,212,0.75) 100%)',
      border: 'rgba(236,72,153,0.3)',
      iconBg: 'bg-pink-100',
      iconText: 'text-pink-600',
      shadow: 'rgba(236,72,153,0.2)'
    },
    amber: {
      bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(254,243,199,0.95) 30%, rgba(253,230,138,0.85) 70%, rgba(252,211,77,0.75) 100%)',
      border: 'rgba(245,158,11,0.3)',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      shadow: 'rgba(245,158,11,0.2)'
    },
    green: {
      bg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(220,252,231,0.95) 30%, rgba(187,247,208,0.85) 70%, rgba(134,239,172,0.75) 100%)',
      border: 'rgba(34,197,94,0.3)',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      shadow: 'rgba(34,197,94,0.2)'
    }
  };
  
  const style = colorStyles[color] || colorStyles.purple;
  
  return (
    <div 
      className="rounded-3xl overflow-hidden transition-all duration-300 relative"
      style={{
        background: style.bg,
        boxShadow: `0 8px 20px -4px ${style.shadow}, 0 4px 8px -2px ${style.shadow}, inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px ${style.shadow}`,
      }}
    >
      {/* Voile blanc supprimé */}
{/* Header cliquable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center gap-3 relative"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.iconBg} flex-shrink-0`}
          style={{
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          {icon || <Shield className={`w-5 h-5 ${style.iconText}`} />}
        </div>
        <h3 className="flex-1 text-left font-bold text-slate-700">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
      </button>
      
      {/* Contenu déroulant */}
      {isOpen && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export function PrecautionsSection({ precautions }) {
  if (!precautions) return null;

  // Couleurs pour chaque index
  const colors = ['amber', 'sky', 'red', 'green', 'purple'];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">Précautions générales</h2>
      <p className="text-sm text-slate-500 mb-4">Ces conseils de sécurité sont essentiels pour le bien-être de bébé et votre récupération.</p>
      
      {precautions.map((precaution, index) => {
        const color = colors[index % colors.length];
        const colorStyles = {
          purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
          sky: { iconBg: 'bg-sky-100', iconText: 'text-sky-600' },
          red: { iconBg: 'bg-red-100', iconText: 'text-red-600' },
          pink: { iconBg: 'bg-pink-100', iconText: 'text-pink-600' },
          amber: { iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
          green: { iconBg: 'bg-green-100', iconText: 'text-green-600' },
        };
        const style = colorStyles[color];
        
        return (
          <AccordionCard 
            key={index} 
            title={precaution.title}
            color={color}
            icon={<Shield className={`w-5 h-5 ${style.iconText}`} />}
            defaultOpen={index === 0}
          >
            {/* Description détaillée */}
            {precaution.description && (
              <p className="text-sm text-slate-600 mb-3 bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/50">
                {precaution.description}
              </p>
            )}
            
            {/* Points clés (tips) */}
            {precaution.tips && precaution.tips.length > 0 && (
              <ul className="text-sm text-slate-600 space-y-2 mb-3">
                {precaution.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Explications détaillées - style quasi transparent */}
            {precaution.details && precaution.details.length > 0 && (
              <div className="bg-amber-50/40 backdrop-blur-sm rounded-xl p-3 border border-amber-200/30">
                <h4 className="text-sm font-bold text-amber-700/90 mb-2">Pourquoi c'est important ?</h4>
                <ul className="text-xs text-amber-700/80 space-y-1">
                  {precaution.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Info className="w-3 h-3 text-amber-500/70 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Vidéo si disponible */}
            {precaution.video_url && (
              <a 
                href={precaution.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-100/80 text-red-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-red-200/80 transition-colors mt-3"
              >
                <Play className="w-4 h-4" />
                Voir en vidéo
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </AccordionCard>
        );
      })}
    </div>
  );
}

import { useState } from 'react';
import { Card } from '../ui/card';
import { Check, Play, ExternalLink, Shield, Info, ChevronDown, ChevronUp } from 'lucide-react';

// Composant Accordéon — BLANC INTENSE BOMBÉ 3D + logo coloré vif
function AccordionCard({ title, icon, color, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Couleurs logo vives par cycle
  const logoColorMap = {
    amber: 'from-yellow-400 to-amber-500',
    sky: 'from-blue-400 to-sky-500',
    red: 'from-red-400 to-rose-500',
    green: 'from-green-400 to-emerald-500',
    purple: 'from-violet-400 to-purple-500',
    pink: 'from-red-400 to-rose-500',
    violet: 'from-violet-400 to-purple-500',
  };
  
  const logoGradient = logoColorMap[color] || logoColorMap.amber;
  
  return (
    <div className="mb-3">
      {/* Tiroir — Blanc intense bombé 3D */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] nacre-bombe"
        style={{
          background: 'linear-gradient(160deg, #ffffff 0%, #ffffff 20%, #fefefe 45%, #fafafa 70%, #f5f5f7 100%)',
          boxShadow: '0 8px 20px -4px rgba(0,0,0,0.1), 0 4px 8px -2px rgba(0,0,0,0.05), inset -4px -4px 10px rgba(0,0,0,0.04), inset 4px 4px 10px rgba(255,255,255,0.95)',
          border: '1px solid rgba(255,255,255,0.95)',
        }}
      >
        <div className="px-4 py-3.5 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${logoGradient} flex-shrink-0`}
            style={{ boxShadow: '0 3px 8px -1px rgba(0,0,0,0.2), inset 0 1px 3px rgba(255,255,255,0.3)' }}
          >
            {icon || <Shield className="w-5 h-5 text-white" />}
          </div>
          <h3 className="flex-1 text-left font-bold text-black">{title}</h3>
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>
      
      {/* Contenu — couleur du logo infusée, SANS bombé */}
      {isOpen && (
        <div className="mt-2 px-2 pb-2 animate-in slide-in-from-top-2 duration-200">
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
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 mt-3"
                style={{
                  background: 'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)',
                  boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3), inset 0 1px 3px rgba(255,255,255,0.5)',
                }}
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

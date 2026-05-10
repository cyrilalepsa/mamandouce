import { Check, Play, ExternalLink, Heart, AlertTriangle } from 'lucide-react';
import { PastelAccordion, PastelCard } from '../ui/PastelComponents';

export function DifficultiesSection({ difficulties }) {
  if (!difficulties) return null;

  const colors = ['amber', 'sky', 'rose', 'green', 'purple'];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">Difficultés post-partum</h2>
      <p className="text-sm text-slate-500 mb-4">Cliquez sur chaque difficulté pour découvrir les conseils et solutions.</p>
      
      {difficulties.map((diff, index) => {
        const color = colors[index % colors.length];
        return (
          <PastelAccordion 
            key={index} 
            title={diff.title}
            icon={diff.video_url ? "🎬" : "⚠️"}
            color={color}
            defaultOpen={index === 0}
          >
            <PastelCard color={color} className="p-4 mb-3">
              <p className="text-sm text-slate-600 mb-3">{diff.description}</p>
              
              {/* Symptômes - style quasi transparent */}
              {diff.symptoms && diff.symptoms.length > 0 && (
                <div className="bg-amber-50/50 backdrop-blur-sm rounded-xl p-3 mb-3 border border-amber-200/40"
                  style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}
                >
                  <h4 className="text-sm font-bold text-amber-700/90 mb-2">Symptômes à reconnaître</h4>
                  <ul className="text-xs text-amber-800/80 space-y-1">
                    {diff.symptoms.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500/70">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Conseils pratiques */}
              {diff.advice && diff.advice.length > 0 && (
                <div className="bg-green-50/50 backdrop-blur-sm rounded-xl p-3 mb-3 border border-green-200/40"
                  style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}
                >
                  <h4 className="text-sm font-bold text-green-700/90 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Conseils pour aller mieux
                  </h4>
                  <ul className="text-xs text-green-800/80 space-y-2">
                    {diff.advice.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500/80 flex-shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Ressources utiles */}
              {diff.resources && diff.resources.length > 0 && (
                <div className="bg-sky-50/50 backdrop-blur-sm rounded-xl p-3 mb-3 border border-sky-200/40"
                  style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}
                >
                  <h4 className="text-sm font-bold text-sky-700/90 mb-2">Ressources utiles</h4>
                  <ul className="text-xs text-sky-800/80 space-y-1">
                    {diff.resources.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>📞</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Alerte - quasi transparent */}
              {diff.alert && (
                <div className="bg-red-50/40 backdrop-blur-sm rounded-xl p-3 mb-3 border-l-4 border-red-500/60">
                  <h4 className="text-sm font-bold text-red-700/90 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Quand consulter ?
                  </h4>
                  <p className="text-xs text-red-800/80">{diff.alert}</p>
                </div>
              )}
              
              {/* Vidéo explicative */}
              {diff.video_url && (
                <a 
                  href={diff.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)',
                    boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3), inset 0 1px 3px rgba(255,255,255,0.5)'
                  }}
                >
                  <Play className="w-4 h-4" />
                  Voir la vidéo explicative
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </PastelCard>
          </PastelAccordion>
        );
      })}
    </div>
  );
}

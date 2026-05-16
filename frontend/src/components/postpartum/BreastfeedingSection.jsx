import { Card } from '../ui/card';
import { Check, Play, ExternalLink, AlertTriangle } from 'lucide-react';
import { PastelAccordion, PastelCard } from '../ui/PastelComponents';

export function BreastfeedingSection({ breastfeeding }) {
  if (!breastfeeding) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">{breastfeeding.title || "Guide de l'allaitement"}</h2>
      <p className="text-sm text-slate-600">{breastfeeding.description}</p>
      <p className="text-sm text-slate-500 mb-4">Cliquez sur une section pour voir les détails</p>
      
      {/* Bénéfices */}
      <PastelAccordion title="Les bienfaits de l'allaitement" icon="💝" color="pink" defaultOpen={true}>
        <PastelCard color="pink" className="p-4">
          <div className="grid grid-cols-1 gap-2">
            {breastfeeding.benefits?.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">{benefit}</span>
              </div>
            ))}
          </div>
        </PastelCard>
      </PastelAccordion>
      
      {/* Positions */}
      {breastfeeding.positions && Array.isArray(breastfeeding.positions) && breastfeeding.positions[0]?.name && (
        <PastelAccordion title="Les positions d'allaitement" icon="🤱" color="sky">
          {breastfeeding.positions.map((pos, index) => (
            <PastelCard key={index} color="sky" className="p-4 mb-3">
              <h4 className="font-bold text-slate-700 mb-2">{pos.name}</h4>
              <p className="text-sm text-slate-600 mb-3">{pos.description}</p>
              {pos.video_url && (
                <a href={pos.video_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105" style={{background:'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)', boxShadow:'-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3), inset 0 1px 3px rgba(255,255,255,0.5)'}}>
                  <Play className="w-4 h-4" />Voir en vidéo<ExternalLink className="w-3 h-3" />
                </a>
              )}
            </PastelCard>
          ))}
        </PastelAccordion>
      )}
      
      {/* Conseils */}
      <PastelAccordion title="Conseils pratiques" icon="💡" color="amber">
        <PastelCard color="amber" className="p-4">
          <ul className="space-y-2">
            {breastfeeding.tips?.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span>💡</span><span>{tip}</span>
              </li>
            ))}
          </ul>
        </PastelCard>
      </PastelAccordion>
      
      {/* Problèmes et solutions */}
      {breastfeeding.problems_solutions && (
        <PastelAccordion title="Problèmes fréquents et solutions" icon="🔧" color="red">
          {breastfeeding.problems_solutions.map((item, index) => (
            <PastelCard key={index} color="rose" className="p-4 mb-3">
              <h4 className="font-bold text-slate-700 mb-2">{item.problem}</h4>
              <ul className="text-sm text-slate-600 space-y-1 mb-3">
                {item.solutions?.map((sol, i) => (
                  <li key={i}>• {sol}</li>
                ))}
              </ul>
              {item.video_url && (
                <a href={item.video_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-100/60 text-red-700 px-3 py-2 rounded-full text-xs font-semibold hover:bg-red-200/60 backdrop-blur-sm">
                  <Play className="w-3 h-3" />Vidéo explicative
                </a>
              )}
            </PastelCard>
          ))}
        </PastelAccordion>
      )}
      
      {/* Ressources */}
      {breastfeeding.resources && (
        <PastelAccordion title="Ressources utiles" icon="📞" color="purple">
          <PastelCard color="purple" className="p-4">
            <ul className="text-sm text-purple-700 space-y-1">
              {breastfeeding.resources.map((res, i) => (
                <li key={i}>📞 {res}</li>
              ))}
            </ul>
          </PastelCard>
        </PastelAccordion>
      )}
      
      {/* Vidéo générale */}
      {breastfeeding.video_general && (
        <a href={breastfeeding.video_general} target="_blank" rel="noopener noreferrer"
          className="block rounded-2xl p-4 text-center hover:opacity-90 transition-all"
          style={{
            background: 'linear-gradient(145deg, rgba(239,68,68,0.9) 0%, rgba(236,72,153,0.9) 100%)',
            boxShadow: '0 8px 20px -4px rgba(239,68,68,0.3)'
          }}
        >
          <Play className="w-8 h-8 mx-auto mb-2 text-white" />
          <p className="font-bold text-white">Guide complet de l'allaitement en vidéo</p>
        </a>
      )}
      
      {/* Alerte - quasi transparent */}
      {breastfeeding.alert && (
        <div className="bg-amber-50/40 backdrop-blur-sm border-l-4 border-amber-400/60 p-3 rounded-r-xl">
          <p className="text-sm text-amber-700/90"><AlertTriangle className="w-4 h-4 inline mr-2" />{breastfeeding.alert}</p>
        </div>
      )}
    </div>
  );
}

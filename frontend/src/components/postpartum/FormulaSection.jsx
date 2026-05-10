import { Play, ExternalLink, AlertTriangle } from 'lucide-react';
import { PastelAccordion, PastelCard } from '../ui/PastelComponents';

export function FormulaSection({ formula }) {
  if (!formula) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">{formula.title || "Guide du biberon"}</h2>
      <p className="text-sm text-slate-600">{formula.description || formula.info}</p>
      <p className="text-sm text-slate-500 mb-4">Cliquez sur une section pour voir les détails</p>
      
      {/* Préparation */}
      {formula.preparation && (
        <PastelAccordion title="Préparation du biberon" icon="🍼" color="sky" defaultOpen={true}>
          <PastelCard color="sky" className="p-4">
            <ol className="text-sm text-slate-600 space-y-2">
              {formula.preparation.steps?.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="bg-sky-400/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 backdrop-blur-sm">{i+1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {formula.preparation.video_url && (
              <a href={formula.preparation.video_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105" style={{background:'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)', boxShadow:'-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3), inset 0 1px 3px rgba(255,255,255,0.5)'}}>
                <Play className="w-4 h-4" />Voir en vidéo
              </a>
            )}
          </PastelCard>
        </PastelAccordion>
      )}
      
      {/* Types de lait */}
      {formula.types && formula.types.length > 0 && (
        <PastelAccordion title="Types de lait infantile" icon="🥛" color="purple">
          {formula.types?.map((type, index) => (
            <PastelCard key={index} color="purple" className="p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{type.icon || '🍼'}</span>
                  <h4 className="font-bold text-slate-700">{type.name}</h4>
                </div>
                <span className="bg-sky-100/60 text-sky-700 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">{type.age}</span>
              </div>
              <p className="text-sm text-slate-600">{type.description}</p>
            </PastelCard>
          ))}
        </PastelAccordion>
      )}
      
      {/* Quantités par âge */}
      {formula.quantities && (
        <PastelAccordion title="Quantités selon l'âge" icon="📊" color="green">
          <PastelCard color="green" className="p-4">
            <div className="space-y-2">
              {formula.quantities.map((q, i) => (
                <div key={i} className="flex justify-between items-center text-sm bg-white/50 backdrop-blur-sm rounded-lg p-2">
                  <span className="font-semibold text-slate-700">{q.age}</span>
                  <span className="text-slate-600">{q.quantity} × {q.frequency}</span>
                </div>
              ))}
            </div>
          </PastelCard>
        </PastelAccordion>
      )}
      
      {/* Conseils */}
      {formula.tips && formula.tips.length > 0 && (
        <PastelAccordion title="Conseils pratiques" icon="💡" color="amber">
          <PastelCard color="amber" className="p-4">
            <ul className="space-y-2">
              {formula.tips?.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                  <span>💡</span><span>{tip}</span>
                </li>
              ))}
            </ul>
          </PastelCard>
        </PastelAccordion>
      )}
      
      {/* Problèmes et solutions */}
      {formula.problems_solutions && (
        <PastelAccordion title="Problèmes fréquents" icon="🔧" color="red">
          {formula.problems_solutions.map((item, index) => (
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
      
      {/* Vidéo générale */}
      {formula.video_general && (
        <a href={formula.video_general} target="_blank" rel="noopener noreferrer"
          className="block rounded-2xl p-4 text-center hover:opacity-90 transition-all"
          style={{
            background: 'linear-gradient(145deg, rgba(239,68,68,0.9) 0%, rgba(236,72,153,0.9) 100%)',
            boxShadow: '0 8px 20px -4px rgba(239,68,68,0.3)'
          }}
        >
          <Play className="w-8 h-8 mx-auto mb-2 text-white" />
          <p className="font-bold text-white">Guide complet du biberon en vidéo</p>
        </a>
      )}
      
      {/* Alerte - quasi transparent */}
      {formula.alert && (
        <div className="bg-amber-50/40 backdrop-blur-sm border-l-4 border-amber-400/60 p-3 rounded-r-xl">
          <p className="text-sm text-amber-700/90"><AlertTriangle className="w-4 h-4 inline mr-2" />{formula.alert}</p>
        </div>
      )}
    </div>
  );
}

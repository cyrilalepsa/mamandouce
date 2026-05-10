import { Check, Play, ExternalLink, AlertTriangle } from 'lucide-react';
import { PastelCard, PastelAccordion } from '../ui/PastelComponents';

export function DiapersSection({ diapers }) {
  if (!diapers) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">{diapers.title || "Guide des couches"}</h2>
      <p className="text-sm text-slate-600">{diapers.description}</p>
      <p className="text-sm text-pink-600 bg-pink-50/50 backdrop-blur-sm p-3 rounded-xl">Fréquence : {diapers.frequency}</p>
      
      {/* Tailles */}
      <PastelAccordion title="Tailles par âge et poids" icon="👶" color="sky" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-3">
          {diapers.sizes?.map((size, index) => {
            const colors = ['amber', 'sky', 'rose', 'green', 'purple'];
            const color = colors[index % colors.length];
            return (
              <PastelCard key={index} color={color} className="p-3 text-center">
                <div className="text-2xl mb-1">{size.icon || '👶'}</div>
                <div className="bg-sky-400/70 text-white rounded-full px-2.5 py-0.5 text-base font-bold inline-block mb-1.5 backdrop-blur-sm">T{size.size}</div>
                <p className="text-sm font-semibold text-slate-700">{size.weight}</p>
                <p className="text-xs text-slate-500">{size.age}</p>
                {size.per_day && <p className="text-xs text-pink-600 mt-0.5">{size.per_day}/jour</p>}
              </PastelCard>
            );
          })}
        </div>
      </PastelAccordion>
      
      {/* Astuces économies */}
      {diapers.money_saving_tips && (
        <PastelAccordion title="Astuces pour économiser" icon="💰" color="green">
          {diapers.money_saving_tips.map((tip, index) => (
            <PastelCard key={index} color="green" className="p-4 mb-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tip.icon}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-green-800">{tip.tip}</h4>
                  <p className="text-sm text-green-700">{tip.description}</p>
                  {tip.url && (
                    <a href={tip.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-green-600 text-sm mt-2 hover:underline">
                      Voir le site <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </PastelCard>
          ))}
        </PastelAccordion>
      )}
      
      {/* Conseils */}
      <PastelAccordion title="Conseils pour le change" icon="💡" color="amber">
        <PastelCard color="amber" className="p-4">
          <ul className="space-y-2">
            {diapers.tips?.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </PastelCard>
      </PastelAccordion>
      
      {/* Tutoriel change */}
      {diapers.change_tutorial && (
        <PastelAccordion title="Comment changer bébé" icon="🧷" color="sky">
          <PastelCard color="sky" className="p-4">
            <ol className="text-sm text-sky-700 space-y-2">
              {diapers.change_tutorial.steps?.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="bg-sky-400/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 backdrop-blur-sm">{i+1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {diapers.change_tutorial.video_url && (
              <a href={diapers.change_tutorial.video_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105" style={{background:'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)', boxShadow:'-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3), inset 0 1px 3px rgba(255,255,255,0.5)'}}>
                <Play className="w-4 h-4" />Voir en vidéo
              </a>
            )}
          </PastelCard>
        </PastelAccordion>
      )}
      
      {/* Alerte - quasi transparent */}
      {diapers.alert && (
        <div className="bg-amber-50/40 backdrop-blur-sm border-l-4 border-amber-400/60 p-3 rounded-r-xl">
          <p className="text-sm text-amber-700/90"><AlertTriangle className="w-4 h-4 inline mr-2" />{diapers.alert}</p>
        </div>
      )}
    </div>
  );
}

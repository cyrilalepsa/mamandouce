import { Check, Play, ExternalLink, AlertTriangle } from 'lucide-react';
import { PastelAccordion, PastelCard } from '../ui/PastelComponents';

export function DiversificationSection({ diversification }) {
  if (!diversification) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">{diversification.title}</h2>
      <p className="text-sm text-slate-600">{diversification.description}</p>
      
      {/* Quand commencer */}
      <PastelAccordion title="Quand commencer ?" icon="🌱" color="green" defaultOpen={true}>
        <PastelCard color="green" className="p-4">
          <p className="text-sm text-green-700 mb-2">{diversification.when_to_start?.age}</p>
          <h4 className="text-sm font-semibold text-green-800 mb-2">Signes que bébé est prêt :</h4>
          <ul className="space-y-1">
            {diversification.when_to_start?.signs?.map((sign, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </PastelCard>
      </PastelAccordion>
      
      {/* Étapes */}
      <PastelAccordion title="Les étapes de la diversification" icon="📈" color="sky">
        {diversification.stages?.map((stage, index) => (
          <PastelCard key={index} color="sky" className="p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-700">{stage.title}</h4>
              <span className="bg-sky-100/60 text-sky-700 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                {stage.age}
              </span>
            </div>
            <div className="space-y-2 mb-3">
              <p className="text-sm text-slate-600"><strong>Aliments :</strong> {stage.foods?.join(', ')}</p>
              <p className="text-sm text-slate-600"><strong>Texture :</strong> {stage.texture}</p>
              <p className="text-sm text-slate-600"><strong>Quantité :</strong> {stage.quantity}</p>
              <p className="text-sm text-pink-600 bg-pink-50/50 backdrop-blur-sm p-2 rounded-lg">💡 {stage.tips}</p>
            </div>
            {stage.video_url && (
              <a 
                href={stage.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-100/60 text-red-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-red-200/60 transition-colors backdrop-blur-sm"
              >
                <Play className="w-4 h-4" />
                Vidéo explicative
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </PastelCard>
        ))}
      </PastelAccordion>
      
      {/* Aliments interdits - quasi transparent */}
      <PastelAccordion title="Aliments à éviter" icon="⚠️" color="red">
        <PastelCard color="red" className="p-4">
          <div className="space-y-2">
            {diversification.forbidden_foods?.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-lg p-2">
                <span className="font-semibold text-red-800">{item.food}</span>
                <span className="text-xs text-red-600 bg-red-100/60 px-2 py-1 rounded-full backdrop-blur-sm">
                  Avant {item.until}
                </span>
              </div>
            ))}
          </div>
        </PastelCard>
      </PastelAccordion>
      
      {/* Premiers aliments */}
      <div className="grid grid-cols-2 gap-4">
        <PastelCard color="orange" className="p-4">
          <h4 className="font-bold text-orange-800 mb-2">Premiers légumes</h4>
          <div className="flex flex-wrap gap-1">
            {diversification.first_vegetables?.map((veg, i) => (
              <span key={i} className="bg-white/60 backdrop-blur-sm text-orange-700 px-2 py-1 rounded-full text-xs">
                {veg}
              </span>
            ))}
          </div>
        </PastelCard>
        <PastelCard color="pink" className="p-4">
          <h4 className="font-bold text-pink-800 mb-2">Premiers fruits</h4>
          <div className="flex flex-wrap gap-1">
            {diversification.first_fruits?.map((fruit, i) => (
              <span key={i} className="bg-white/60 backdrop-blur-sm text-pink-700 px-2 py-1 rounded-full text-xs">
                {fruit}
              </span>
            ))}
          </div>
        </PastelCard>
      </div>
      
      {/* Vidéo générale */}
      {diversification.video_general && (
        <a 
          href={diversification.video_general} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block rounded-2xl p-4 text-center hover:opacity-90 transition-all"
          style={{
            background: 'linear-gradient(145deg, rgba(239,68,68,0.9) 0%, rgba(236,72,153,0.9) 100%)',
            boxShadow: '0 8px 20px -4px rgba(239,68,68,0.3)'
          }}
        >
          <Play className="w-8 h-8 mx-auto mb-2 text-white" />
          <p className="font-bold text-white">Guide complet de la diversification</p>
        </a>
      )}
    </div>
  );
}

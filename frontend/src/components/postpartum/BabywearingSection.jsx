import { Check, Play, ExternalLink, AlertTriangle, Shield } from 'lucide-react';
import { PastelAccordion, PastelCard } from '../ui/PastelComponents';

export function BabywearingSection({ babywearing }) {
  if (!babywearing) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">{babywearing.title}</h2>
      <p className="text-sm text-slate-600">{babywearing.description}</p>
      
      {/* Bénéfices */}
      <PastelAccordion title="Bienfaits du portage" icon="💝" color="pink" defaultOpen={true}>
        <PastelCard color="pink" className="p-4">
          <div className="grid grid-cols-1 gap-2">
            {babywearing.benefits?.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">{benefit}</span>
              </div>
            ))}
          </div>
        </PastelCard>
      </PastelAccordion>
      
      {/* Types de portage */}
      <PastelAccordion title="Types de porte-bébé" icon="🤱" color="rose">
        {babywearing.types?.map((type, index) => (
          <PastelCard key={index} color="rose" className="p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-700">{type.name}</h4>
              <span className="bg-rose-100/60 text-rose-700 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                {type.age}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{type.description}</p>
            {type.video_url && (
              <a 
                href={type.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105" style={{background:'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)', boxShadow:'-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3), inset 0 1px 3px rgba(255,255,255,0.5)'}}
              >
                <Play className="w-4 h-4" />
                Voir le tutoriel vidéo
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </PastelCard>
        ))}
      </PastelAccordion>
      
      {/* Règles de sécurité - quasi transparent */}
      <PastelAccordion title="Règles de sécurité" icon="⚠️" color="amber">
        <PastelCard color="amber" className="p-4">
          <ul className="space-y-2">
            {babywearing.safety_rules?.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </PastelCard>
      </PastelAccordion>
      
      {/* Vidéo générale */}
      {babywearing.video_general && (
        <a 
          href={babywearing.video_general} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block rounded-2xl p-4 text-center hover:opacity-90 transition-all"
          style={{
            background: 'linear-gradient(145deg, rgba(239,68,68,0.9) 0%, rgba(236,72,153,0.9) 100%)',
            boxShadow: '0 8px 20px -4px rgba(239,68,68,0.3)'
          }}
        >
          <Play className="w-8 h-8 mx-auto mb-2 text-white" />
          <p className="font-bold text-white">Voir la vidéo complète sur le portage</p>
        </a>
      )}
    </div>
  );
}

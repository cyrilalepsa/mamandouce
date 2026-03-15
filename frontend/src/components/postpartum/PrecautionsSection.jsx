import { Card } from '../ui/card';
import { Check, Play, ExternalLink, Shield, Info } from 'lucide-react';

export function PrecautionsSection({ precautions }) {
  if (!precautions) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">Précautions générales</h2>
      <p className="text-sm text-slate-500">Ces conseils de sécurité sont essentiels pour le bien-être de bébé et votre récupération.</p>
      {precautions.map((precaution, index) => (
        <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              index === 0 ? 'bg-purple-100' : 
              index === 1 ? 'bg-sky-100' : 
              index === 2 ? 'bg-red-100' : 'bg-pink-100'
            }`}>
              <Shield className={`w-5 h-5 ${
                index === 0 ? 'text-purple-600' : 
                index === 1 ? 'text-sky-600' : 
                index === 2 ? 'text-red-600' : 'text-pink-600'
              }`} />
            </div>
            <h3 className="font-bold text-slate-700">{precaution.title}</h3>
          </div>
          
          {/* Description détaillée */}
          {precaution.description && (
            <p className="text-sm text-slate-600 mb-3 bg-slate-50 p-3 rounded-xl">{precaution.description}</p>
          )}
          
          {/* Points clés (tips) */}
          <ul className="text-sm text-slate-600 space-y-2 mb-3">
            {precaution.tips?.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          
          {/* Explications détaillées */}
          {precaution.details && precaution.details.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <h4 className="text-sm font-bold text-amber-800 mb-2">Pourquoi c'est important ?</h4>
              <ul className="text-xs text-amber-700 space-y-1">
                {precaution.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Info className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
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
              className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors mt-3"
            >
              <Play className="w-4 h-4" />
              Voir en vidéo
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </Card>
      ))}
    </div>
  );
}

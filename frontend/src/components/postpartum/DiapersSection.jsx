import { Card } from '../ui/card';
import { Check, Play, ExternalLink, AlertTriangle } from 'lucide-react';

export function DiapersSection({ diapers }) {
  if (!diapers) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">{diapers.title || "Guide des couches"}</h2>
      <p className="text-sm text-slate-600">{diapers.description}</p>
      <p className="text-sm text-pink-600 bg-pink-50 p-3 rounded-xl">Fréquence : {diapers.frequency}</p>
      
      {/* Tailles */}
      <h3 className="font-bold text-slate-700">Tailles par âge et poids</h3>
      <div className="grid grid-cols-2 gap-3">
        {diapers.sizes?.map((size, index) => (
          <Card key={index} className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="text-3xl mb-1">{size.icon || '👶'}</div>
            <div className="bg-sky-500 text-white rounded-full px-3 py-1 text-lg font-bold inline-block mb-2">T{size.size}</div>
            <p className="text-sm font-semibold text-slate-700">{size.weight}</p>
            <p className="text-xs text-slate-500">{size.age}</p>
            {size.per_day && <p className="text-xs text-pink-600 mt-1">{size.per_day}/jour</p>}
          </Card>
        ))}
      </div>
      
      {/* Astuces économies */}
      {diapers.money_saving_tips && (
        <>
          <h3 className="font-bold text-slate-700">Astuces pour économiser</h3>
          {diapers.money_saving_tips.map((tip, index) => (
            <Card key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 shadow-sm border border-green-200">
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
            </Card>
          ))}
        </>
      )}
      
      {/* Conseils */}
      <Card className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <h3 className="font-bold text-amber-800 mb-3">Conseils pour le change</h3>
        <ul className="space-y-2">
          {diapers.tips?.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
              <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Card>
      
      {/* Tutoriel change */}
      {diapers.change_tutorial && (
        <Card className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
          <h3 className="font-bold text-sky-800 mb-3">Comment changer bébé</h3>
          <ol className="text-sm text-sky-700 space-y-2">
            {diapers.change_tutorial.steps?.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-sky-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">{i+1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {diapers.change_tutorial.video_url && (
            <a href={diapers.change_tutorial.video_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-red-200 mt-3">
              <Play className="w-4 h-4" />Voir en vidéo
            </a>
          )}
        </Card>
      )}
      
      {/* Alerte */}
      {diapers.alert && (
        <div className="bg-amber-100 border-l-4 border-amber-500 p-3 rounded-r-xl">
          <p className="text-sm text-amber-800"><AlertTriangle className="w-4 h-4 inline mr-2" />{diapers.alert}</p>
        </div>
      )}
    </div>
  );
}

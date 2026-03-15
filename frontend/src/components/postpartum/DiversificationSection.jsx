import { Card } from '../ui/card';
import { Check, Play, ExternalLink, AlertTriangle } from 'lucide-react';

export function DiversificationSection({ diversification }) {
  if (!diversification) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">{diversification.title}</h2>
      <p className="text-sm text-slate-600">{diversification.description}</p>
      
      {/* Quand commencer */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 shadow-sm border border-green-200">
        <h3 className="font-bold text-green-800 mb-3">Quand commencer ?</h3>
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
      </Card>
      
      {/* Étapes */}
      <h3 className="font-bold text-slate-700">Les étapes de la diversification</h3>
      {diversification.stages?.map((stage, index) => (
        <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-700">{stage.title}</h4>
            <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded-full text-xs font-semibold">
              {stage.age}
            </span>
          </div>
          <div className="space-y-2 mb-3">
            <p className="text-sm text-slate-600"><strong>Aliments :</strong> {stage.foods?.join(', ')}</p>
            <p className="text-sm text-slate-600"><strong>Texture :</strong> {stage.texture}</p>
            <p className="text-sm text-slate-600"><strong>Quantité :</strong> {stage.quantity}</p>
            <p className="text-sm text-pink-600 bg-pink-50 p-2 rounded-lg">💡 {stage.tips}</p>
          </div>
          {stage.video_url && (
            <a 
              href={stage.video_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors"
            >
              <Play className="w-4 h-4" />
              Vidéo explicative
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </Card>
      ))}
      
      {/* Aliments interdits */}
      <Card className="bg-red-50 rounded-2xl p-4 border border-red-200">
        <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Aliments à éviter
        </h3>
        <div className="space-y-2">
          {diversification.forbidden_foods?.map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-white rounded-lg p-2">
              <span className="font-semibold text-red-800">{item.food}</span>
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                Avant {item.until}
              </span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Premiers aliments */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-orange-50 rounded-2xl p-4">
          <h4 className="font-bold text-orange-800 mb-2">Premiers légumes</h4>
          <div className="flex flex-wrap gap-1">
            {diversification.first_vegetables?.map((veg, i) => (
              <span key={i} className="bg-white text-orange-700 px-2 py-1 rounded-full text-xs">
                {veg}
              </span>
            ))}
          </div>
        </Card>
        <Card className="bg-pink-50 rounded-2xl p-4">
          <h4 className="font-bold text-pink-800 mb-2">Premiers fruits</h4>
          <div className="flex flex-wrap gap-1">
            {diversification.first_fruits?.map((fruit, i) => (
              <span key={i} className="bg-white text-pink-700 px-2 py-1 rounded-full text-xs">
                {fruit}
              </span>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Vidéo générale */}
      {diversification.video_general && (
        <a 
          href={diversification.video_general} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity"
        >
          <Play className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">Guide complet de la diversification</p>
        </a>
      )}
    </div>
  );
}

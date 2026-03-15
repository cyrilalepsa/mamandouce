import { Card } from '../ui/card';
import { Check, Play, ExternalLink, AlertTriangle } from 'lucide-react';

export function BreastfeedingSection({ breastfeeding }) {
  if (!breastfeeding) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">{breastfeeding.title || "Guide de l'allaitement"}</h2>
      <p className="text-sm text-slate-600">{breastfeeding.description}</p>
      
      {/* Bénéfices */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-slate-700 mb-3">Les bienfaits de l'allaitement</h3>
        <div className="grid grid-cols-1 gap-2">
          {breastfeeding.benefits?.map((benefit, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-600">{benefit}</span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Positions */}
      {breastfeeding.positions && Array.isArray(breastfeeding.positions) && breastfeeding.positions[0]?.name && (
        <>
          <h3 className="font-bold text-slate-700">Les positions d'allaitement</h3>
          {breastfeeding.positions.map((pos, index) => (
            <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="font-bold text-slate-700 mb-2">{pos.name}</h4>
              <p className="text-sm text-slate-600 mb-3">{pos.description}</p>
              {pos.video_url && (
                <a href={pos.video_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-red-200">
                  <Play className="w-4 h-4" />Voir en vidéo<ExternalLink className="w-3 h-3" />
                </a>
              )}
            </Card>
          ))}
        </>
      )}
      
      {/* Conseils */}
      <Card className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <h3 className="font-bold text-amber-800 mb-3">Conseils pratiques</h3>
        <ul className="space-y-2">
          {breastfeeding.tips?.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
              <span>💡</span><span>{tip}</span>
            </li>
          ))}
        </ul>
      </Card>
      
      {/* Problèmes et solutions */}
      {breastfeeding.problems_solutions && (
        <>
          <h3 className="font-bold text-slate-700">Problèmes fréquents et solutions</h3>
          {breastfeeding.problems_solutions.map((item, index) => (
            <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-pink-400">
              <h4 className="font-bold text-slate-700 mb-2">{item.problem}</h4>
              <ul className="text-sm text-slate-600 space-y-1 mb-3">
                {item.solutions?.map((sol, i) => (
                  <li key={i}>• {sol}</li>
                ))}
              </ul>
              {item.video_url && (
                <a href={item.video_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-full text-xs font-semibold hover:bg-red-200">
                  <Play className="w-3 h-3" />Vidéo explicative
                </a>
              )}
            </Card>
          ))}
        </>
      )}
      
      {/* Ressources */}
      {breastfeeding.resources && (
        <Card className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
          <h3 className="font-bold text-sky-800 mb-2">Ressources utiles</h3>
          <ul className="text-sm text-sky-700 space-y-1">
            {breastfeeding.resources.map((res, i) => (
              <li key={i}>📞 {res}</li>
            ))}
          </ul>
        </Card>
      )}
      
      {/* Vidéo générale */}
      {breastfeeding.video_general && (
        <a href={breastfeeding.video_general} target="_blank" rel="noopener noreferrer"
          className="block bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-4 text-center hover:opacity-90">
          <Play className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">Guide complet de l'allaitement en vidéo</p>
        </a>
      )}
      
      {/* Alerte */}
      {breastfeeding.alert && (
        <div className="bg-amber-100 border-l-4 border-amber-500 p-3 rounded-r-xl">
          <p className="text-sm text-amber-800"><AlertTriangle className="w-4 h-4 inline mr-2" />{breastfeeding.alert}</p>
        </div>
      )}
    </div>
  );
}

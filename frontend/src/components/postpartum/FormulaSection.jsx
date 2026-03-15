import { Card } from '../ui/card';
import { Play, ExternalLink, AlertTriangle } from 'lucide-react';

export function FormulaSection({ formula }) {
  if (!formula) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">{formula.title || "Guide du biberon"}</h2>
      <p className="text-sm text-slate-600">{formula.description || formula.info}</p>
      
      {/* Préparation */}
      {formula.preparation && (
        <Card className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-3">Préparation du biberon</h3>
          <ol className="text-sm text-slate-600 space-y-2">
            {formula.preparation.steps?.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-sky-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">{i+1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {formula.preparation.video_url && (
            <a href={formula.preparation.video_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-red-200 mt-3">
              <Play className="w-4 h-4" />Voir en vidéo
            </a>
          )}
        </Card>
      )}
      
      {/* Types de lait */}
      <h3 className="font-bold text-slate-700">Types de lait infantile</h3>
      {formula.types?.map((type, index) => (
        <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{type.icon || '🍼'}</span>
              <h4 className="font-bold text-slate-700">{type.name}</h4>
            </div>
            <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded-full text-xs font-semibold">{type.age}</span>
          </div>
          <p className="text-sm text-slate-600">{type.description}</p>
        </Card>
      ))}
      
      {/* Quantités par âge */}
      {formula.quantities && (
        <Card className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <h3 className="font-bold text-green-800 mb-3">Quantités selon l'âge</h3>
          <div className="space-y-2">
            {formula.quantities.map((q, i) => (
              <div key={i} className="flex justify-between items-center text-sm bg-white rounded-lg p-2">
                <span className="font-semibold text-slate-700">{q.age}</span>
                <span className="text-slate-600">{q.quantity} × {q.frequency}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Conseils */}
      <Card className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <h3 className="font-bold text-amber-800 mb-3">Conseils pratiques</h3>
        <ul className="space-y-2">
          {formula.tips?.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
              <span>💡</span><span>{tip}</span>
            </li>
          ))}
        </ul>
      </Card>
      
      {/* Problèmes et solutions */}
      {formula.problems_solutions && (
        <>
          <h3 className="font-bold text-slate-700">Problèmes fréquents</h3>
          {formula.problems_solutions.map((item, index) => (
            <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-sky-400">
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
      
      {/* Vidéo générale */}
      {formula.video_general && (
        <a href={formula.video_general} target="_blank" rel="noopener noreferrer"
          className="block bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-4 text-center hover:opacity-90">
          <Play className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">Guide complet du biberon en vidéo</p>
        </a>
      )}
      
      {/* Alerte */}
      {formula.alert && (
        <div className="bg-amber-100 border-l-4 border-amber-500 p-3 rounded-r-xl">
          <p className="text-sm text-amber-800"><AlertTriangle className="w-4 h-4 inline mr-2" />{formula.alert}</p>
        </div>
      )}
    </div>
  );
}

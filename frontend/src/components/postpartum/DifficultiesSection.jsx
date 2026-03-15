import { useState } from 'react';
import { Card } from '../ui/card';
import { 
  AlertTriangle, ChevronDown, ChevronUp, Heart, Check, Play, ExternalLink
} from 'lucide-react';

export function DifficultiesSection({ difficulties }) {
  const [expandedDifficulty, setExpandedDifficulty] = useState(null);

  if (!difficulties) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-slate-700">Difficultés post-partum</h2>
      <p className="text-sm text-slate-500">Cliquez sur chaque difficulté pour découvrir les conseils et solutions.</p>
      {difficulties.map((diff, index) => (
        <Card key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div
            onClick={() => setExpandedDifficulty(expandedDifficulty === index ? null : index)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
            data-testid={`difficulty-${index}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700">{diff.title}</h3>
                {diff.video_url && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <Play className="w-3 h-3" /> Vidéo disponible
                  </span>
                )}
              </div>
            </div>
            {expandedDifficulty === index ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
          {expandedDifficulty === index && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-sm text-slate-600">{diff.description}</p>
              
              {/* Symptômes */}
              {diff.symptoms && diff.symptoms.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <h4 className="text-sm font-bold text-amber-700 mb-2">Symptômes à reconnaître</h4>
                  <ul className="text-xs text-amber-800 space-y-1">
                    {diff.symptoms.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Conseils pratiques */}
              {diff.advice && diff.advice.length > 0 && (
                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                  <h4 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Conseils pour aller mieux
                  </h4>
                  <ul className="text-xs text-green-800 space-y-2">
                    {diff.advice.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Ressources utiles */}
              {diff.resources && diff.resources.length > 0 && (
                <div className="bg-sky-50 rounded-xl p-3 border border-sky-200">
                  <h4 className="text-sm font-bold text-sky-700 mb-2">Ressources utiles</h4>
                  <ul className="text-xs text-sky-800 space-y-1">
                    {diff.resources.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>📞</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Alerte */}
              {diff.alert && (
                <div className="bg-red-50 rounded-xl p-3 border-l-4 border-red-500">
                  <h4 className="text-sm font-bold text-red-700 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Quand consulter ?
                  </h4>
                  <p className="text-xs text-red-800">{diff.alert}</p>
                </div>
              )}
              
              {/* Vidéo explicative */}
              {diff.video_url && (
                <a 
                  href={diff.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  <Play className="w-5 h-5" />
                  Voir la vidéo explicative
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

import { Card } from '../ui/card';
import { Check, Play, ExternalLink, AlertTriangle, Shield } from 'lucide-react';

export function BabywearingSection({ babywearing }) {
  if (!babywearing) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">{babywearing.title}</h2>
      <p className="text-sm text-slate-600">{babywearing.description}</p>
      
      {/* Bénéfices */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-slate-700 mb-3">Bienfaits du portage</h3>
        <div className="grid grid-cols-2 gap-2">
          {babywearing.benefits?.map((benefit, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-600">{benefit}</span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Types de portage */}
      <h3 className="font-bold text-slate-700">Types de porte-bébé</h3>
      {babywearing.types?.map((type, index) => (
        <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-700">{type.name}</h4>
            <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-xs font-semibold">
              {type.age}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-3">{type.description}</p>
          {type.video_url && (
            <a 
              href={type.video_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors"
            >
              <Play className="w-4 h-4" />
              Voir le tutoriel vidéo
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </Card>
      ))}
      
      {/* Règles de sécurité */}
      <Card className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Règles de sécurité
        </h3>
        <ul className="space-y-2">
          {babywearing.safety_rules?.map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
              <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </Card>
      
      {/* Vidéo générale */}
      {babywearing.video_general && (
        <a 
          href={babywearing.video_general} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity"
        >
          <Play className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">Voir la vidéo complète sur le portage</p>
        </a>
      )}
    </div>
  );
}

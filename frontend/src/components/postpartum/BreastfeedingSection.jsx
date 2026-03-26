import { useState } from 'react';
import { Card } from '../ui/card';
import { Check, Play, ExternalLink, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

function AccordionSection({ title, icon, color, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const colorClasses = {
    pink: "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-200",
    sky: "bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-800 border-sky-200",
    amber: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200",
    red: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200",
    purple: "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200",
  };
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 rounded-2xl border ${colorClasses[color]} flex items-center justify-between transition-all duration-200 hover:shadow-md`}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <h3 className="font-bold text-left">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {isOpen && (
        <div className="mt-3 space-y-3 pl-2 border-l-4 border-slate-200 ml-4 animate-fade-in">
          {children}
          
          {/* Bouton fermer en bas */}
          <button
            onClick={() => setIsOpen(false)}
            className={`w-full p-3 rounded-xl border ${colorClasses[color]} flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md mt-4`}
          >
            <ChevronUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Fermer</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function BreastfeedingSection({ breastfeeding }) {
  if (!breastfeeding) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">{breastfeeding.title || "Guide de l'allaitement"}</h2>
      <p className="text-sm text-slate-600">{breastfeeding.description}</p>
      <p className="text-sm text-slate-500 mb-4">Cliquez sur une section pour voir les détails</p>
      
      {/* Bénéfices */}
      <AccordionSection title="Les bienfaits de l'allaitement" icon="💝" color="pink" defaultOpen={true}>
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-2">
            {breastfeeding.benefits?.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-600">{benefit}</span>
              </div>
            ))}
          </div>
        </Card>
      </AccordionSection>
      
      {/* Positions */}
      {breastfeeding.positions && Array.isArray(breastfeeding.positions) && breastfeeding.positions[0]?.name && (
        <AccordionSection title="Les positions d'allaitement" icon="🤱" color="sky">
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
        </AccordionSection>
      )}
      
      {/* Conseils */}
      <AccordionSection title="Conseils pratiques" icon="💡" color="amber">
        <Card className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
          <ul className="space-y-2">
            {breastfeeding.tips?.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span>💡</span><span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      </AccordionSection>
      
      {/* Problèmes et solutions */}
      {breastfeeding.problems_solutions && (
        <AccordionSection title="Problèmes fréquents et solutions" icon="🔧" color="red">
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
        </AccordionSection>
      )}
      
      {/* Ressources */}
      {breastfeeding.resources && (
        <AccordionSection title="Ressources utiles" icon="📞" color="purple">
          <Card className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
            <ul className="text-sm text-sky-700 space-y-1">
              {breastfeeding.resources.map((res, i) => (
                <li key={i}>📞 {res}</li>
              ))}
            </ul>
          </Card>
        </AccordionSection>
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

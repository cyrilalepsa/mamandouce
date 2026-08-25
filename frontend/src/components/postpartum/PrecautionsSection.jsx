import { Check, Play, ExternalLink, Shield, Info } from 'lucide-react';
import { AccordionCard, SubCard } from '../ui/SoftClayCards';

export function PrecautionsSection({ precautions }) {
  if (!precautions) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">Précautions générales</h2>
      <p className="text-sm text-slate-500 mb-4">
        Ces conseils de sécurité sont essentiels pour le bien-être de bébé et votre récupération.
      </p>

      {precautions.map((precaution, index) => (
        <AccordionCard
          key={index}
          index={index}
          title={precaution.title}
          icon={<Shield className="w-5 h-5 text-white" />}
          defaultOpen={index === 0}
        >
          {precaution.description && (
            <SubCard accent={index} level={4} className="mb-3">
              <p className="text-sm text-slate-700">{precaution.description}</p>
            </SubCard>
          )}

          {precaution.tips && precaution.tips.length > 0 && (
            <ul className="text-sm text-slate-700 space-y-2 mb-3">
              {precaution.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}

          {precaution.details && precaution.details.length > 0 && (
            <SubCard accent="yellow" level={4}>
              <h4 className="text-sm font-bold text-amber-800 mb-2">Pourquoi c&apos;est important ?</h4>
              <ul className="text-xs text-amber-900/80 space-y-1">
                {precaution.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Info className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </SubCard>
          )}

          {precaution.video_url && (
            <a
              href={precaution.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 mt-3 bg-gradient-to-r from-rose-400 to-pink-500"
            >
              <Play className="w-4 h-4" />
              Voir en vidéo
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </AccordionCard>
      ))}
    </div>
  );
}

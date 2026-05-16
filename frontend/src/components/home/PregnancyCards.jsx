import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Baby, ChevronRight, Calendar } from 'lucide-react';

export function PregnancyStatusCard({ pregnancyProfile }) {
  const navigate = useNavigate();
  
  if (!pregnancyProfile || !pregnancyProfile.current_week) return null;

  return (
    <Card 
      className="relative overflow-hidden rounded-3xl p-5 border-0 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(254,205,211,0.9) 30%, rgba(251,207,232,0.85) 60%, rgba(244,114,182,0.5) 100%)',
        boxShadow: `
          0 10px 30px -6px rgba(244,114,182,0.35),
          0 6px 12px -4px rgba(244,114,182,0.2),
          inset 0 2px 6px rgba(255,255,255,0.95),
          inset 0 -3px 6px rgba(244,114,182,0.15)
        `,
        border: '2px solid rgba(244,114,182,0.3)'
      }}
      onClick={() => navigate('/cycle-tracking')}
      data-testid="pregnancy-status-card"
    >
      {/* Voile blanc supprimé */}
<div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icône avec bulle quasi-transparente */}
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6)'
            }}
          >
            <Calendar className="w-7 h-7 text-pink-500" />
          </div>
          <div>
            <p className="text-sm text-slate-600 font-medium">Vous êtes à la</p>
            <p className="text-2xl font-bold" style={{
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Semaine {pregnancyProfile.current_week} SA</p>
            <p className="text-sm text-slate-500">Trimestre {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 font-medium">Accouchement prévu</p>
          <p className="text-xl font-bold text-pink-600">
            {new Date(pregnancyProfile.estimated_due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function PregnancyProgressCard({ pregnancyProfile }) {
  const navigate = useNavigate();

  if (!pregnancyProfile || !pregnancyProfile.current_week) return null;

  return (
    <Card 
      className="bg-gradient-to-br from-pink-100 to-sky-100 rounded-3xl p-5 mb-4 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer hover:shadow-lg transition-all"
      onClick={() => navigate('/tips')}
      data-testid="pregnancy-progress-card"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
          <Baby className="w-8 h-8 text-pink-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600">Votre bébé grandit</p>
          <p className="text-2xl font-bold text-slate-700">Semaine {pregnancyProfile.current_week} SA</p>
          <p className="text-sm text-slate-500">
            Trimestre {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)}
          </p>
        </div>
        <ChevronRight className="w-6 h-6 text-slate-400" />
      </div>
    </Card>
  );
}

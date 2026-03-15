import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Baby, ChevronRight } from 'lucide-react';

export function PregnancyStatusCard({ pregnancyProfile }) {
  if (!pregnancyProfile || !pregnancyProfile.current_week) return null;

  return (
    <Card className="bg-gradient-to-br from-pink-100 to-sky-100 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0" data-testid="pregnancy-status-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Vous êtes à la</p>
          <p className="text-2xl font-bold text-sky-600">Semaine {pregnancyProfile.current_week}</p>
          <p className="text-sm text-slate-500">Trimestre {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Accouchement prévu</p>
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
          <p className="text-2xl font-bold text-slate-700">Semaine {pregnancyProfile.current_week}</p>
          <p className="text-sm text-slate-500">
            Trimestre {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)}
          </p>
        </div>
        <ChevronRight className="w-6 h-6 text-slate-400" />
      </div>
    </Card>
  );
}

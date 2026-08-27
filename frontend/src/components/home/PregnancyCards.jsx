import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Baby, ChevronRight, Calendar } from 'lucide-react';
import { IconWell } from '../ui/IconWell';
import { cardSoftClayClasses } from '../../utils/accentTokens';

export function PregnancyStatusCard({ pregnancyProfile }) {
  const navigate = useNavigate();

  if (!pregnancyProfile || !pregnancyProfile.current_week) return null;

  return (
    <Card
      className={`${cardSoftClayClasses('pink')} p-5 border-0 shadow-none cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
      onClick={() => navigate('/grossesse')}
      data-testid="pregnancy-status-card"
      data-accent="pink"
    >
      <div className="relative z-[2] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <IconWell accent="pink" size="lg">
            <Calendar className="w-7 h-7 text-white" />
          </IconWell>
          <div>
            <p className="text-sm text-slate-600 font-medium">Vous êtes à la</p>
            <p className="text-2xl font-bold text-slate-800">
              Semaine {pregnancyProfile.current_week} SA
            </p>
            <p className="text-sm text-slate-600">
              Trimestre {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 font-medium">Accouchement prévu</p>
          <p className="text-xl font-bold text-pink-600">
            {new Date(pregnancyProfile.estimated_due_date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
            })}
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
      className={`${cardSoftClayClasses('sky')} p-5 mb-4 border-0 shadow-none cursor-pointer hover:brightness-[1.02] transition-all`}
      onClick={() => navigate('/tips')}
      data-testid="pregnancy-progress-card"
      data-accent="sky"
    >
      <div className="relative z-[2] flex items-center gap-4">
        <IconWell accent="sky" size="xl">
          <Baby className="w-8 h-8 text-white" />
        </IconWell>
        <div className="flex-1">
          <p className="text-sm text-slate-600">Votre bébé grandit</p>
          <p className="text-2xl font-bold text-slate-800">
            Semaine {pregnancyProfile.current_week} SA
          </p>
          <p className="text-sm text-slate-600">
            Trimestre {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)}
          </p>
        </div>
        <ChevronRight className="w-6 h-6 text-sky-500" />
      </div>
    </Card>
  );
}

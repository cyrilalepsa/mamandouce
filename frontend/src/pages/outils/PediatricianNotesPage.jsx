import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PediatricianNotesCard } from '../components/outils/PediatricianNotesCard';

function PediatricianNotesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
            data-testid="back-button"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <h1 className="text-lg font-bold text-slate-700 flex-1 text-center pr-10">
            {t('outils.pediatrician.title', 'Cher pédiatre')}
          </h1>
        </div>
        <PediatricianNotesCard embedded />
      </div>
    </div>
  );
}

export default PediatricianNotesPage;

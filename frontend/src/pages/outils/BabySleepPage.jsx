import { useTranslation } from 'react-i18next';
import { BackButton } from '../../components/BackButton';
import { BabySleepAudioCard } from '../../components/outils/BabySleepAudioCard';

function BabySleepPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <BackButton
            backPath="/section/outils"
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
          />
          <h1 className="text-lg font-bold text-slate-700 flex-1 text-center pr-10">
            {t('outils.sleep.title', 'Bonne nuit bébé')}
          </h1>
        </div>
        <BabySleepAudioCard embedded />
      </div>
    </div>
  );
}

export default BabySleepPage;

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Stethoscope, AlertCircle, Wrench } from 'lucide-react';
import { CollapsibleSection, PastelMosaicCard, IconWell } from './_shared';

export function OutilsSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const cards = [
    {
      id: 'baby-sleep',
      route: '/outils/bonne-nuit-bebe',
      icon: Moon,
      accent: 'violet',
      titleKey: 'outils.sleep.title',
      title: 'Bonne nuit bébé',
      descKey: 'outils.sleep.shortDesc',
      desc: 'Bruits blancs & murmure',
      testId: 'outil-baby-sleep',
    },
    {
      id: 'pediatrician',
      route: '/outils/cher-pediatre',
      icon: Stethoscope,
      accent: 'sky',
      titleKey: 'outils.pediatrician.title',
      title: 'Cher pédiatre',
      descKey: 'outils.pediatrician.shortDesc',
      desc: 'Notes & synthèse',
      testId: 'outil-pediatrician',
    },
    {
      id: 'emergency',
      route: '/outils/fiche-urgence',
      icon: AlertCircle,
      accent: 'red',
      titleKey: 'outils.emergency.title',
      title: 'Fiche urgence naissance',
      descKey: 'outils.emergency.shortDesc',
      desc: 'Partage rapide relais',
      testId: 'outil-emergency',
    },
  ];

  return (
    <CollapsibleSection
      title={t('sections.outils', 'Outils')}
      icon={Wrench}
      iconColor="text-slate-600"
      defaultOpen={false}
      sectionId="outils"
    >
      <div className="grid grid-cols-1 gap-3">
        {cards.map((card) => (
          <PastelMosaicCard
            key={card.id}
            color={card.accent}
            onClick={() => navigate(card.route)}
            testId={card.testId}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <IconWell accent={card.accent} size="sm">
                <card.icon className="w-5 h-5 text-white" />
              </IconWell>
              <div className="text-left min-w-0">
                <span className="font-semibold text-slate-700 block text-sm">
                  {t(card.titleKey, card.title)}
                </span>
                <span className="text-xs text-slate-500 block truncate">
                  {t(card.descKey, card.desc)}
                </span>
              </div>
            </div>
          </PastelMosaicCard>
        ))}
      </div>
    </CollapsibleSection>
  );
}

export default OutilsSection;

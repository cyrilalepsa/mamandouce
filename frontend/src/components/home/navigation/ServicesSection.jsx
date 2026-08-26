import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles, Baby, Gift, Heart, Library,
  CalendarHeart, BookHeart, ScanBarcode, Apple,
  History, Stethoscope, Bell,
  ClipboardList, Briefcase, Video, Youtube, Book, ChevronRight, ChevronDown, LineChart, Lock, Crown, Users, Pin, PinOff, Phone, PiggyBank, Award, HandHeart, HelpCircle
} from 'lucide-react';
import { useSubscription } from '../../SubscriptionGate';
import { PastelMosaicCard, PastelPillCard, CollapsibleSection, IconWell } from './_shared';
import { softClayCardClasses } from '../../../utils/accentTokens';

export function ServicesSection() {
  const { t, i18n } = useTranslation();
  const { getServicesForLanguage } = require('../../../data/servicesByCountry');
  
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  const countryData = getServicesForLanguage(currentLang);
  
  const iconMap = {
    building: Library,
    heart: Heart,
    mapPin: Gift,
    phone: Phone,
    baby: Baby
  };
  
  const colorToPastel = {
    blue: 'sky',
    purple: 'violet',
    pink: 'pink',
    green: 'green',
    red: 'red',
    amber: 'yellow'
  };

  return (
    <CollapsibleSection 
      title={t('sections.services', 'Services et ressources')}
      icon={Library} 
      iconColor="text-blue-500"
      defaultOpen={false}
      sectionId="services"
    >
      <div className="flex items-center justify-center gap-2 mb-4 text-sm text-slate-500">
        <span>{countryData.flag}</span>
        <span>{countryData.country}</span>
      </div>
      
      <div className="space-y-3 mb-4">
        {countryData.services.slice(0, 3).map((service) => {
          const IconComponent = iconMap[service.icon] || Library;
          const accent = colorToPastel[service.color] || 'sky';
          
          return (
            <a
              key={service.id}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`service-${service.id}`}
              className="block no-underline"
            >
              <div
                data-accent={accent}
                className={`soft-clay-premium soft-clay-from-accent soft-clay-text-flat relative overflow-hidden transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow ${softClayCardClasses(accent, { pill: true })} px-4 py-2.5`}
                style={{ color: '#2C2C2C' }}
              >
                <div className="relative z-[2] flex items-center gap-3">
                  <IconWell accent={accent} size="sm">
                    <IconComponent className="w-5 h-5 text-white" />
                  </IconWell>
                  <div className="text-left">
                    <span className="font-semibold text-slate-700 block text-sm">{service.name}</span>
                    <span className="text-xs text-slate-500">{service.description}</span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {countryData.services.slice(3).map((service) => {
          const IconComponent = iconMap[service.icon] || Library;
          const isEmergency = service.id === 'emergency';
          const accent = isEmergency ? 'red' : 'pink';
          
          return (
            <a
              key={service.id}
              href={service.url}
              target={isEmergency ? "_self" : "_blank"}
              rel="noopener noreferrer"
              data-testid={`service-${service.id}`}
              className="block no-underline"
            >
              <PastelMosaicCard color={accent} className="h-full">
                <div className="flex items-center gap-2">
                  <IconWell accent={accent} size="sm">
                    <IconComponent className="w-4 h-4 text-white" />
                  </IconWell>
                  <div className="text-left min-w-0 flex-1">
                    <span className="font-semibold block truncate text-sm text-slate-700">
                      {service.name}
                    </span>
                    <span className="text-xs truncate block text-slate-500">
                      {service.description}
                    </span>
                  </div>
                </div>
              </PastelMosaicCard>
            </a>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { useTranslation } from 'react-i18next';
import {
  Sparkles, Baby, Gift, Heart, Library,
  CalendarHeart, BookHeart, ScanBarcode, Apple,
  History, Stethoscope, Bell,
  ClipboardList, Briefcase, Video, Youtube, Book, ChevronRight, ChevronDown, LineChart, Lock, Crown, Users, Pin, PinOff, Phone, PiggyBank, Award, HandHeart, HelpCircle
} from 'lucide-react';
import { useSubscription } from '../../SubscriptionGate';
import { toast } from 'sonner';
import api from '../../../utils/api';
import { PastelMosaicCard, PastelPillCard, CollapsibleSection, usePinnedSections, PASTEL_STYLES } from './_shared';

export function ServicesSection() {
  const { t, i18n } = useTranslation();
  const { getServicesForLanguage, serviceColors } = require('../../../data/servicesByCountry');
  
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  const countryData = getServicesForLanguage(currentLang);
  
  // Mapping des icônes
  const iconMap = {
    building: Library,
    heart: Heart,
    mapPin: Gift,
    phone: Phone,
    baby: Baby
  };
  
  // Mapping couleurs vers pastel
  const colorToPastel = {
    blue: 'sky',
    purple: 'purple',
    pink: 'pink',
    green: 'green',
    red: 'red',
    amber: 'amber'
  };

  return (
    <CollapsibleSection 
      title={t('sections.services', 'Services et ressources')}
      icon={Library} 
      iconColor="text-blue-500"
      defaultOpen={false}
      sectionId="services"
    >
      {/* Indicateur du pays */}
      <div className="flex items-center justify-center gap-2 mb-4 text-sm text-slate-500">
        <span>{countryData.flag}</span>
        <span>{countryData.country}</span>
      </div>
      
      {/* Services principaux (3 premiers) - style pill */}
      <div className="space-y-3 mb-4">
        {countryData.services.slice(0, 3).map((service) => {
          const IconComponent = iconMap[service.icon] || Library;
          const pastelColor = colorToPastel[service.color] || 'sky';
          const style = PASTEL_STYLES[pastelColor] || PASTEL_STYLES.sky;
          
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
                className="relative overflow-hidden rounded-full px-4 py-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: style.background,
                  boxShadow: style.boxShadow,
                }}
              >
                {/* Voile blanc supprimé */}
                <div className="relative flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${pastelColor}-100/60 backdrop-blur-sm flex-shrink-0`}
                    style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
                  >
                    <IconComponent className={`w-5 h-5 text-${pastelColor}-500`} />
                  </div>
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
      
      {/* Urgences et site officiel (2 derniers) - style mosaïque */}
      <div className="grid grid-cols-2 gap-3">
        {countryData.services.slice(3).map((service) => {
          const IconComponent = iconMap[service.icon] || Library;
          const isEmergency = service.id === 'emergency';
          const pastelColor = isEmergency ? 'red' : 'pink';
          
          return (
            <a
              key={service.id}
              href={service.url}
              target={isEmergency ? "_self" : "_blank"}
              rel="noopener noreferrer"
              data-testid={`service-${service.id}`}
              className="block no-underline"
            >
              <PastelMosaicCard color={pastelColor} className="h-full">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEmergency ? 'bg-red-100/60' : 'bg-pink-100/60'} backdrop-blur-sm flex-shrink-0`}
                    style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
                  >
                    <IconComponent className={`w-4 h-4 ${isEmergency ? 'text-red-500' : 'text-pink-500'}`} />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <span className={`font-semibold block truncate text-sm ${isEmergency ? 'text-red-700' : 'text-pink-700'}`}>
                      {service.name}
                    </span>
                    <span className={`text-xs truncate block ${isEmergency ? 'text-red-600' : 'text-pink-600'}`}>
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

/**
 * SolidaritySection - Section Tirelire et Badges sur la page d'accueil
 */

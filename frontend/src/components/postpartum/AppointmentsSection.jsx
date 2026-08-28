import { useState } from 'react';
import { 
  Calendar, Heart, Baby, Shield, Stethoscope, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { PastelAccordion, PastelCard } from '../ui/PastelComponents';
import { IconWell } from '../ui/IconWell';

// Grouper les rendez-vous par période
const groupAppointmentsByPeriod = (appointments) => {
  const groups = {
    "Semaine 1 - Sortie de maternité": [],
    "Semaines 2-4 - Premier mois": [],
    "Mois 2 - Premiers vaccins": [],
    "Mois 3-4 - Suivi régulier": [],
    "Mois 5-6 - Bilan et diversification": []
  };
  
  appointments?.forEach(apt => {
    const week = apt.week || 0;
    if (week <= 1) {
      groups["Semaine 1 - Sortie de maternité"].push(apt);
    } else if (week <= 4) {
      groups["Semaines 2-4 - Premier mois"].push(apt);
    } else if (week <= 8) {
      groups["Mois 2 - Premiers vaccins"].push(apt);
    } else if (week <= 16) {
      groups["Mois 3-4 - Suivi régulier"].push(apt);
    } else {
      groups["Mois 5-6 - Bilan et diversification"].push(apt);
    }
  });
  
  return groups;
};

function AppointmentCard({ apt, color }) {
  // Style selon le type
  const isObligatoire = apt.type === 'obligatoire';
  const cardColor = isObligatoire ? 'rose' : 'sky';
  
  return (
    <PastelCard color={cardColor} className="p-4 mb-3">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
          <IconWell accent={isObligatoire ? 'red' : 'sky'} size="md">
            <Stethoscope className="w-5 h-5 text-white" />
          </IconWell>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-700">{apt.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isObligatoire
                ? 'bg-rose-100/60 text-rose-700'
                : 'bg-sky-100/60 text-sky-700'
            } backdrop-blur-sm`}>
              {apt.type}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{apt.description}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Semaine {apt.week} SA
            </span>
            {apt.duration && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {apt.duration}
              </span>
            )}
            {apt.who && (
              <span className="bg-purple-100/60 text-purple-700 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {apt.who}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Details */}
      <div className="space-y-2.5">
        {apt.for_mom && apt.for_mom.length > 0 && (
          <div className="card-inner-cream rounded-xl p-2.5">
            <h4 className="text-sm font-bold text-pink-700 mb-1.5 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> Pour maman
            </h4>
            <ul className="text-xs text-pink-800 space-y-0.5">
              {apt.for_mom.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {apt.for_baby && apt.for_baby.length > 0 && (
          <div className="card-inner-cream rounded-xl p-2.5">
            <h4 className="text-sm font-bold text-sky-700 mb-1.5 flex items-center gap-1">
              <Baby className="w-3.5 h-3.5" /> Pour bébé
            </h4>
            <ul className="text-xs text-sky-800 space-y-0.5">
              {apt.for_baby.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sky-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {apt.vaccines && apt.vaccines.length > 0 && (
          <div className="card-inner-cream rounded-xl p-2.5">
            <h4 className="text-sm font-bold text-green-700 mb-1.5 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Vaccins
            </h4>
            {apt.vaccines.map((vax, i) => (
              <div key={i} className="text-xs mb-1">
                <span className="font-semibold text-green-800">{vax.name}</span>
                <p className="text-green-600">{vax.protects}</p>
              </div>
            ))}
          </div>
        )}
        
        {apt.tips && (
          <div className="card-inner-cream rounded-xl p-2.5">
            <p className="text-xs text-amber-900">
              <span className="font-bold text-amber-700">💡 Conseil :</span> {apt.tips}
            </p>
          </div>
        )}
        
        {apt.reimbursement && (
          <span className="inline-block bg-green-100/60 text-green-700 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            {apt.reimbursement}
          </span>
        )}
      </div>
    </PastelCard>
  );
}

export function AppointmentsSection({ appointments }) {
  if (!appointments || appointments.length === 0) return null;

  const groupedAppointments = groupAppointmentsByPeriod(appointments);
  
  const periods = [
    { title: "Semaine 1 - Sortie de maternité", icon: "🏥", color: "rose", defaultOpen: false },
    { title: "Semaines 2-4 - Premier mois", icon: "👶", color: "sky", defaultOpen: false },
    { title: "Mois 2 - Premiers vaccins", icon: "💉", color: "green", defaultOpen: false },
    { title: "Mois 3-4 - Suivi régulier", icon: "📋", color: "purple", defaultOpen: false },
    { title: "Mois 5-6 - Bilan et diversification", icon: "🥣", color: "amber", defaultOpen: false },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">Rendez-vous sur 6 mois</h2>
      <p className="text-sm text-slate-500 mb-4">Cliquez sur une période pour voir les détails</p>
      
      {periods.map((period) => {
        const periodAppointments = groupedAppointments[period.title];
        if (!periodAppointments || periodAppointments.length === 0) return null;
        
        return (
          <PastelAccordion
            key={period.title}
            title={`${period.title} (${periodAppointments.length})`}
            icon={period.icon}
            color={period.color}
            defaultOpen={period.defaultOpen}
          >
            {periodAppointments.map((apt, index) => (
              <AppointmentCard key={index} apt={apt} color={period.color} />
            ))}
          </PastelAccordion>
        );
      })}
    </div>
  );
}

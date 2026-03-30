import { useState } from 'react';
import { Card } from '../ui/card';
import { 
  Calendar, Heart, Baby, Shield, Stethoscope, Clock, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

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

function AppointmentCard({ apt, index }) {
  return (
    <Card className="bg-white rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          apt.type === 'obligatoire' 
            ? 'bg-rose-100 text-rose-600' 
            : 'bg-sky-100 text-sky-600'
        }`}>
          <Stethoscope className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-700">{apt.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              apt.type === 'obligatoire'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-sky-100 text-sky-700'
            }`}>
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
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {apt.who}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Details */}
      <div className="border-t border-slate-100 pt-3 space-y-3">
        {apt.for_mom && apt.for_mom.length > 0 && (
          <div className="bg-pink-50 rounded-xl p-3">
            <h4 className="text-sm font-bold text-pink-700 mb-2 flex items-center gap-1">
              <Heart className="w-4 h-4" /> Pour maman
            </h4>
            <ul className="text-xs text-pink-800 space-y-1">
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
          <div className="bg-sky-50 rounded-xl p-3">
            <h4 className="text-sm font-bold text-sky-700 mb-2 flex items-center gap-1">
              <Baby className="w-4 h-4" /> Pour bébé
            </h4>
            <ul className="text-xs text-sky-800 space-y-1">
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
          <div className="bg-green-50 rounded-xl p-3">
            <h4 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
              <Shield className="w-4 h-4" /> Vaccins
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
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3 border border-pink-100">
            <p className="text-xs text-slate-700">
              <span className="font-bold text-pink-600">Conseil :</span> {apt.tips}
            </p>
          </div>
        )}
        
        {apt.reimbursement && (
          <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
            {apt.reimbursement}
          </span>
        )}
      </div>
    </Card>
  );
}

function PeriodAccordion({ title, appointments, icon, color, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (!appointments || appointments.length === 0) return null;
  
  const colorClasses = {
    rose: "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 border-rose-200",
    sky: "bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-800 border-sky-200",
    green: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200",
    purple: "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200",
    amber: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200",
  };
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 rounded-2xl border ${colorClasses[color]} flex items-center justify-between transition-all duration-200 hover:shadow-md`}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div className="text-left">
            <h3 className="font-bold">{title}</h3>
            <p className="text-xs opacity-75">{appointments.length} rendez-vous</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {isOpen && (
        <div className="mt-3 space-y-3 pl-2 border-l-4 border-slate-200 ml-4 animate-fade-in">
          {appointments.map((apt, index) => (
            <AppointmentCard key={index} apt={apt} index={index} />
          ))}
          
          {/* Bouton fermer en bas */}
          <button
            onClick={() => setIsOpen(false)}
            className={`w-full p-3 rounded-xl border ${colorClasses[color]} flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md mt-4`}
          >
            <ChevronUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Fermer</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function AppointmentsSection({ appointments }) {
  if (!appointments || appointments.length === 0) return null;

  const groupedAppointments = groupAppointmentsByPeriod(appointments);
  
  const periods = [
    { title: "Semaine 1 - Sortie de maternité", icon: "🏥", color: "rose", defaultOpen: true },
    { title: "Semaines 2-4 - Premier mois", icon: "👶", color: "sky", defaultOpen: false },
    { title: "Mois 2 - Premiers vaccins", icon: "💉", color: "green", defaultOpen: false },
    { title: "Mois 3-4 - Suivi régulier", icon: "📋", color: "purple", defaultOpen: false },
    { title: "Mois 5-6 - Bilan et diversification", icon: "🥣", color: "amber", defaultOpen: false },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">Rendez-vous sur 6 mois</h2>
      <p className="text-sm text-slate-500 mb-4">Cliquez sur une période pour voir les détails</p>
      
      {periods.map((period) => (
        <PeriodAccordion
          key={period.title}
          title={period.title}
          appointments={groupedAppointments[period.title]}
          icon={period.icon}
          color={period.color}
          defaultOpen={period.defaultOpen}
        />
      ))}
    </div>
  );
}

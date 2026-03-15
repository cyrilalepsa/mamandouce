import { Card } from '../ui/card';
import { 
  Calendar, Heart, Baby, Shield, Stethoscope, Clock, AlertTriangle
} from 'lucide-react';

export function AppointmentsSection({ appointments }) {
  if (!appointments) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700">Rendez-vous sur 6 mois</h2>
      {appointments.map((apt, index) => (
        <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
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
                  Semaine {apt.week}
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
      ))}
    </div>
  );
}

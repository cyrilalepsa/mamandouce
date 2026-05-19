import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  ChevronLeft, ChevronRight, X, Heart, Droplets, Egg, Baby, 
  MapPin, Calendar as CalendarIcon
} from 'lucide-react';

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

const formatDateWithWeekday = (date) => {
  return capitalize(date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
};

// Vacances scolaires par zone
const SCHOOL_HOLIDAYS = {
  A: [
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-07', end: '2026-02-22' },
    { name: 'Printemps', start: '2026-04-04', end: '2026-04-19' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-17' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
  ],
  B: [
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-14', end: '2026-03-01' },
    { name: 'Printemps', start: '2026-04-11', end: '2026-04-26' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-17' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
  ],
  C: [
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-21', end: '2026-03-08' },
    { name: 'Printemps', start: '2026-04-18', end: '2026-05-03' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-17' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
  ],
};

const PUBLIC_HOLIDAYS = [
  { date: '2026-01-01', name: 'Jour de l\'An' },
  { date: '2026-04-06', name: 'Lundi de Pâques' },
  { date: '2026-05-01', name: 'Fête du Travail' },
  { date: '2026-05-08', name: 'Victoire 1945' },
  { date: '2026-05-14', name: 'Ascension' },
  { date: '2026-05-25', name: 'Lundi de Pentecôte' },
  { date: '2026-07-14', name: 'Fête Nationale' },
  { date: '2026-08-15', name: 'Assomption' },
  { date: '2026-11-01', name: 'Toussaint' },
  { date: '2026-11-11', name: 'Armistice' },
  { date: '2026-12-25', name: 'Noël' },
];

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const isSchoolHoliday = (date, zone) => {
  const holidays = SCHOOL_HOLIDAYS[zone] || [];
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  for (const holiday of holidays) {
    if (dateStr >= holiday.start && dateStr <= holiday.end) return holiday.name;
  }
  return null;
};

const isPublicHoliday = (date) => {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const holiday = PUBLIC_HOLIDAYS.find(h => h.date === dateStr);
  return holiday ? holiday.name : null;
};

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function FertilityCalendar({ 
  isOpen, 
  onClose, 
  agendaData,
  rapportDates = [],
  onAddRapport,
  onRemoveRapport
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedZone, setSelectedZone] = useState(() => {
    return localStorage.getItem('mamandouce_school_zone') || 'A';
  });
  const [showAddRapport, setShowAddRapport] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
    localStorage.setItem('mamandouce_school_zone', zone);
  };

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  
  const days = [];
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const isToday = (date) => date.toDateString() === new Date().toDateString();

  const getCycleData = () => {
    if (!agendaData || !agendaData.cycleLength) return [];
    const cycles = [];
    const cycleLen = agendaData.cycleLength;
    let currentPeriodStart = agendaData.nextPeriod ? new Date(agendaData.nextPeriod) : null;
    if (!currentPeriodStart) return [];
    
    const today = new Date();
    while (currentPeriodStart > today) {
      currentPeriodStart.setDate(currentPeriodStart.getDate() - cycleLen);
    }
    
    for (let i = 0; i < 6; i++) {
      const periodStart = new Date(currentPeriodStart);
      periodStart.setDate(periodStart.getDate() + (i * cycleLen));
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 5);
      const ovulation = new Date(periodStart);
      ovulation.setDate(ovulation.getDate() + (cycleLen - 14));
      const fertileStart = new Date(ovulation);
      fertileStart.setDate(fertileStart.getDate() - 5);
      const fertileEnd = new Date(ovulation);
      fertileEnd.setDate(fertileEnd.getDate() + 1);
      
      cycles.push({ periodStart, periodEnd, ovulation, fertileStart, fertileEnd });
    }
    return cycles;
  };

  const cycleData = getCycleData();

  const isFertileDay = (date) => {
    if (cycleData.length === 0) return false;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    for (const cycle of cycleData) {
      const startStr = `${cycle.fertileStart.getFullYear()}-${String(cycle.fertileStart.getMonth() + 1).padStart(2, '0')}-${String(cycle.fertileStart.getDate()).padStart(2, '0')}`;
      const endStr = `${cycle.fertileEnd.getFullYear()}-${String(cycle.fertileEnd.getMonth() + 1).padStart(2, '0')}-${String(cycle.fertileEnd.getDate()).padStart(2, '0')}`;
      if (dateStr >= startStr && dateStr <= endStr) return true;
    }
    return false;
  };

  const isOvulationDay = (date) => cycleData.some(c => date.toDateString() === c.ovulation.toDateString());
  const isPeriodDay = (date) => cycleData.some(c => date >= c.periodStart && date <= c.periodEnd);

  const isRapportDay = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return rapportDates.some(d => {
      if (typeof d === 'string') return d === dateStr;
      const r = new Date(d);
      return `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, '0')}-${String(r.getDate()).padStart(2, '0')}` === dateStr;
    });
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowAddRapport(true);
  };

  // Gestion des couleurs d'arrière-plan du cycle MEDICAL uniquement
  const getCycleBg = (ovulation, period, fertile, implantation, isCurrentMonth) => {
    if (!isCurrentMonth) return 'transparent';
    if (ovulation) return '#0ea5e9'; // Bleu ciel ovulation
    if (period) return '#f9a8d4';    // Rose règles
    if (fertile) return '#86efac';   // Vert fertile
    if (implantation && !period) return '#fde68a'; // Jaune nidation
    return 'transparent';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header Title */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Calendrier
          </h2>
          <Button onClick={onClose} className="bg-slate-100 rounded-full p-2 hover:bg-slate-200">
            <X className="w-5 h-5 text-slate-600" />
          </Button>
        </div>

        {/* Sélecteur de Zone Scolaire */}
        <div className="px-4 py-3 border-b bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-600">Zone scolaire :</span>
            </div>
            <div className="flex gap-1 bg-slate-200/70 p-1 rounded-full">
              {['A', 'B', 'C'].map(zone => {
                const isActive = selectedZone === zone;
                return (
                  <button
                    key={zone}
                    onClick={() => handleZoneChange(zone)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-purple-600 text-white shadow-sm scale-105' 
                        : 'bg-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Zone {zone}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bouton Règles aujourd'hui */}
        <div className="px-4 py-2 border-b">
          <button
            onClick={() => {
              const today = new Date();
              localStorage.setItem('mamandouce_last_period_start', `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
              setSelectedDate(today);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-rose-400 to-pink-500 shadow-sm"
          >
            <Droplets className="w-4 h-4" />
            Début de règles aujourd'hui
          </button>
        </div>

        {/* Navigation Mois */}
        <div className="flex items-center justify-between px-4 py-2">
          <Button onClick={prevMonth} className="bg-slate-100 rounded-full p-1.5 hover:bg-slate-200">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Button>
          <h3 className="text-md font-bold text-slate-700">
            {MONTHS_FR[month]} {year}
          </h3>
          <Button onClick={nextMonth} className="bg-slate-100 rounded-full p-1.5 hover:bg-slate-200">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Button>
        </div>

        {/* Grille Calendrier principale */}
        <div className="px-4 pb-4">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-8 gap-1 mb-2 text-center">
            <div className="text-xs font-bold text-slate-400">S.</div>
            {DAYS_FR.map(day => (
              <div key={day} className="text-xs font-bold text-slate-500">{day}</div>
            ))}
          </div>

          {/* Semaines et Jours */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-8 gap-1 items-center">
              
              {/* Colonne Numéro de Semaine (Propre et isolée) */}
              <div className="text-center text-xs text-slate-400 font-medium py-2">
                {getWeekNumber(week[0].date)}
              </div>
              
              {/* Les 7 jours de la semaine */}
              {week.map((day, dayIndex) => {
                const holiday = isSchoolHoliday(day.date, selectedZone);
                const publicHoliday = isPublicHoliday(day.date);
                const fertile = isFertileDay(day.date);
                const ovulation = isOvulationDay(day.date);
                const period = isPeriodDay(day.date);
                const rapport = isRapportDay(day.date);
                const today = isToday(day.date);

                const cycleBg = getCycleBg(ovulation, period, fertile, false, day.isCurrentMonth);

                return (
                  <div 
                    key={dayIndex} 
                    className="flex flex-col items-center justify-between p-0.5 h-12 min-w-0"
                  >
                    {/* BOUTON DU JOUR (Rond médical parfait) */}
                    <button
                      onClick={() => handleDayClick(day.date)}
                      className={`
                        relative w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all focus:outline-none
                        ${!day.isCurrentMonth ? 'text-slate-300 pointer-events-none' : 'text-slate-800'}
                        ${today ? 'font-black' : ''}
                      `}
                      style={{
                        background: cycleBg,
                        color: !day.isCurrentMonth ? '#cbd5e1' : (ovulation ? '#ffffff' : '#1e293b'),
                        border: today ? '2px solid #a855f7' : (rapport ? '2px solid #f43f5e' : 'none'),
                      }}
                    >
                      <span>{day.date.getDate()}</span>
                      
                      {/* Mini cœur flottant pour le rapport */}
                      {rapport && day.isCurrentMonth && (
                        <Heart className="absolute -top-1 -right-1 w-3 h-3 text-rose-500 fill-rose-500" />
                      )}
                    </button>
                    
                    {/* CONTENEUR DES INFOS CONTEXTUELLES (Vacances / Fériés) */}
                    {/* Aligné de force en bas, hauteur fixe de 4px pour ne JAMAIS bouger la grille */}
                    <div className="w-full h-1 flex justify-center gap-0.5 mt-0.5">
                      {holiday && day.isCurrentMonth && (
                        <span className="w-4 h-1 bg-blue-500 rounded-sm block"></span>
                      )}
                      {publicHoliday && day.isCurrentMonth && (
                        <span className="w-4 h-1 bg-red-500 rounded-sm block"></span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Légende */}
        <div className="px-4 py-3 border-t bg-slate-50 text-xs rounded-b-3xl">
          <p className="font-bold mb-2 text-slate-700">Légende</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0ea5e9]"></div>
              <span>Pic d'ovulation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#86efac]"></div>
              <span>Fenêtre fertile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f9a8d4]"></div>
              <span>Règles prévues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500 rounded-sm"></div>
              <span>Vacances scolaires</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-red-500 rounded-sm"></div>
              <span>Jour férié</span>
            </div>
          </div>
        </div>

      </Card>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  ChevronLeft, ChevronRight, X, Heart, Droplets, Egg, Baby, 
  MapPin, Calendar as CalendarIcon, Plus
} from 'lucide-react';

// Capitalize first letter of a string
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

// Format date with capitalized weekday
const formatDateWithWeekday = (date) => {
  const formatted = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return capitalize(formatted);
};

// Vacances scolaires françaises 2025-2030 par zone (dates officielles)
const SCHOOL_HOLIDAYS = {
  A: [
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-07', end: '2026-02-22' },
    { name: 'Printemps', start: '2026-04-04', end: '2026-04-19' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-17' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
    { name: 'Toussaint', start: '2026-10-17', end: '2026-11-01' },
    { name: 'Noël', start: '2026-12-19', end: '2027-01-03' },
    { name: 'Hiver', start: '2027-02-13', end: '2027-02-28' },
    { name: 'Printemps', start: '2027-04-10', end: '2027-04-25' },
    { name: 'Ascension', start: '2027-05-13', end: '2027-05-16' },
    { name: 'Été', start: '2027-07-03', end: '2027-08-31' },
  ],
  B: [
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-14', end: '2026-03-01' },
    { name: 'Printemps', start: '2026-04-11', end: '2026-04-26' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-17' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
    { name: 'Toussaint', start: '2026-10-17', end: '2026-11-01' },
    { name: 'Noël', start: '2026-12-19', end: '2027-01-03' },
    { name: 'Hiver', start: '2027-02-20', end: '2027-03-07' },
    { name: 'Printemps', start: '2027-04-17', end: '2027-05-02' },
    { name: 'Ascension', start: '2027-05-13', end: '2027-05-16' },
    { name: 'Été', start: '2027-07-03', end: '2027-08-31' },
  ],
  C: [
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-21', end: '2026-03-08' },
    { name: 'Printemps', start: '2026-04-18', end: '2026-05-03' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-17' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
    { name: 'Toussaint', start: '2026-10-17', end: '2026-11-01' },
    { name: 'Noël', start: '2026-12-19', end: '2027-01-03' },
    { name: 'Hiver', start: '2027-02-27', end: '2027-03-14' },
    { name: 'Printemps', start: '2027-04-24', end: '2027-05-09' },
    { name: 'Ascension', start: '2027-05-13', end: '2027-05-16' },
    { name: 'Été', start: '2027-07-03', end: '2027-08-31' },
  ],
};

const PUBLIC_HOLIDAYS = [
  { date: '2025-01-01', name: 'Jour de l\'An' },
  { date: '2025-04-21', name: 'Lundi de Pâques' },
  { date: '2025-05-01', name: 'Fête du Travail' },
  { date: '2025-05-08', name: 'Victoire 1945' },
  { date: '2025-05-29', name: 'Ascension' },
  { date: '2025-06-09', name: 'Lundi de Pentecôte' },
  { date: '2025-07-14', name: 'Fête Nationale' },
  { date: '2025-08-15', name: 'Assomption' },
  { date: '2025-11-01', name: 'Toussaint' },
  { date: '2025-11-11', name: 'Armistice' },
  { date: '2025-12-25', name: 'Noël' },
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  for (const holiday of holidays) {
    if (dateStr >= holiday.start && dateStr <= holiday.end) {
      return holiday.name;
    }
  }
  return null;
};

const isPublicHoliday = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
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
    const saved = localStorage.getItem('mamandouce_school_zone');
    return saved || 'A';
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
      if (typeof d === 'string' && d.match(/^\d{4}-\d{2}-\d{2}$/)) return d === dateStr;
      const r = new Date(d);
      return `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, '0')}-${String(r.getDate()).padStart(2, '0')}` === dateStr;
    });
  };

  const getEstimatedImplantation = (rapportDate) => {
    let rapport = (typeof rapportDate === 'string' && rapportDate.match(/^\d{4}-\d{2}-\d{2}$/)) 
      ? new Date(...rapportDate.split('-').map((v, i) => i === 1 ? v - 1 : v)) 
      : new Date(rapportDate);
    const early = new Date(rapport); early.setDate(early.getDate() + 6);
    const late = new Date(rapport); late.setDate(late.getDate() + 12);
    return { early, late };
  };

  const isImplantationDay = (date) => {
    return rapportDates.some(rd => {
      const { early, late } = getEstimatedImplantation(rd);
      return date >= early && date <= late;
    });
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowAddRapport(true);
  };

  const handleAddRapport = () => {
    if (selectedDate && onAddRapport) {
      onAddRapport(`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`);
      setShowAddRapport(false); setSelectedDate(null);
    }
  };

  const handleRemoveRapport = () => {
    if (selectedDate && onRemoveRapport) {
      onRemoveRapport(`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`);
      setShowAddRapport(false); setSelectedDate(null);
    }
  };

  const getDayBackground = (day, ovulation, period, fertile, implantation) => {
    if (!day.isCurrentMonth) return 'transparent';
    if (ovulation) return '#0ea5e9';
    if (period) return '#f9a8d4';
    if (fertile) return '#86efac';
    if (implantation && !period) return '#fde68a';
    return 'transparent';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="fertility-calendar bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Calendrier
          </h2>
          <Button onClick={onClose} className="bg-slate-100 rounded-full p-2 hover:bg-slate-200">
            <X className="w-5 h-5 text-slate-600" />
          </Button>
        </div>

        {/* Zone scolaire mise en valeur graphiquement */}
        <div className="px-4 py-3 border-b bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-600">Zone scolaire :</span>
            </div>
            {/* Boutons de sélection de zone très distincts */}
            <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-full">
              {['A', 'B', 'C'].map(zone => {
                const isActive = selectedZone === zone;
                return (
                  <button
                    key={zone}
                    onClick={() => handleZoneChange(zone)}
                    className={`px-3.5 py-1 rounded-full text-sm font-bold transition-all duration-200 ${
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
          <p className="text-xs text-slate-500 italic">
            {selectedZone === 'A' && 'Besançon, Bordeaux, Clermont-Ferrand, Dijon, Grenoble, Limoges, Lyon, Poitiers'}
            {selectedZone === 'B' && 'Aix-Marseille, Amiens, Caen, Lille, Nancy-Metz, Nantes, Nice, Orléans-Tours, Reims, Rennes, Rouen, Strasbourg'}
            {selectedZone === 'C' && 'Créteil, Montpellier, Paris, Toulouse, Versailles'}
          </p>
        </div>

        {/* Bouton manuel Début de règles */}
        <div className="px-4 py-3 border-b">
          <button
            onClick={() => {
              const today = new Date();
              localStorage.setItem('mamandouce_last_period_start', `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
              setSelectedDate(today);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold transition-all"
            style={{
              background: 'linear-gradient(145deg, #fda4af 0%, #fb7185 40%, #f43f5e 100%)',
              boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 10px rgba(244,63,94,0.3), inset 0 1px 3px rgba(255,255,255,0.5)',
              border: '1px solid rgba(254,205,211,0.6)',
            }}
            data-testid="period-start-btn"
          >
            <Droplets className="w-5 h-5" />
            Début de règles aujourd'hui
          </button>
        </div>

        {/* Navigation mois */}
        <div className="flex items-center justify-between p-4">
          <Button onClick={prevMonth} className="bg-slate-100 rounded-full p-2 hover:bg-slate-200">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <h3 className="text-lg font-bold text-slate-700">
            {MONTHS_FR[month]} {year}
          </h3>
          <Button onClick={nextMonth} className="bg-slate-100 rounded-full p-2 hover:bg-slate-200">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </Button>
        </div>

        {/* Calendrier */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="text-center text-xs font-semibold text-slate-400 py-1">S</div>
            {DAYS_FR.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-8 gap-1 mb-1">
              <div className="flex items-center justify-center text-xs text-slate-400 font-medium">
                {getWeekNumber(week[0].date)}
              </div>
              
              {week.map((day, dayIndex) => {
                const holiday = isSchoolHoliday(day.date, selectedZone);
                const publicHoliday = isPublicHoliday(day.date);
                const fertile = isFertileDay(day.date);
                const ovulation = isOvulationDay(day.date);
                const period = isPeriodDay(day.date);
                const rapport = isRapportDay(day.date);
                const implantation = isImplantationDay(day.date);
                const today = isToday(day.date);

                const currentBg = getDayBackground(day, ovulation, period, fertile, implantation);

                return (
                  <button
                    key={dayIndex}
                    onClick={() => handleDayClick(day.date)}
                    title={publicHoliday || holiday || ''}
                    className={`
                      relative w-9 h-9 rounded-full flex flex-col items-center justify-center text-sm transition-all
                      ${!day.isCurrentMonth ? 'text-slate-300' : ''}
                      ${today ? 'font-bold' : ''}
                    `}
                    style={{
                      overflow: 'visible',
                      color: !day.isCurrentMonth ? '#cbd5e1' : (ovulation && day.isCurrentMonth ? '#FFFFFF' : '#000000'),
                      fontWeight: today || (ovulation && day.isCurrentMonth) ? 700 : 400,
                      background: currentBg,
                      outline: today ? '2.5px solid #a855f7' : rapport ? '2.5px solid #f43f5e' : 'none',
                      outlineOffset: '1px',
                      borderRadius: '50%',
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: 2 }}>{day.date.getDate()}</span>
                    
                    {/* LES BARRES DE SUPERPOSITION TOUJOURS PRÉSENTES */}
                    <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5" style={{ zIndex: 3 }}>
                      {holiday && day.isCurrentMonth && (
                        <span style={{ width: 8, height: 2.5, background: '#3b82f6', borderRadius: 1 }}></span>
                      )}
                      {publicHoliday && day.isCurrentMonth && (
                        <span style={{ width: 8, height: 2.5, background: '#ef4444', borderRadius: 1 }}></span>
                      )}
                    </div>
                    
                    {rapport && (
                      <Heart className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-rose-500 fill-rose-500" style={{ zIndex: 30, filter: 'drop-shadow(0 1px 2px rgba(244,63,94,0.5))' }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Légende */}
        <div className="px-4 pb-4 border-t pt-4">
          <p className="text-xs font-semibold mb-2" style={{ color: '#000000' }}>Légende</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#0ea5e9' }}></div>
              <span style={{ color: '#000000' }}>Pic d'ovulation</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#86efac' }}></div>
              <span style={{ color: '#000000' }}>Fenêtre fertile</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#f9a8d4' }}></div>
              <span style={{ color: '#000000' }}>Règles prévues</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fde68a' }}></div>
              <span style={{ color: '#000000' }}>Nidation estimée</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 16, height: 4, background: '#3b82f6', borderRadius: 1 }}></div>
              <span style={{ color: '#000000' }}>Vacances scolaires</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 16, height: 4, background: '#ef4444', borderRadius: 1 }}></div>
              <span style={{ color: '#000000' }}>Jour férié</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2.5px solid #f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart className="w-2 h-2 text-rose-500 fill-rose-500" />
              </div>
              <span style={{ color: '#000000' }}>Rapport</span>
            </div>
          </div>
        </div>

        {/* Liste des rapports en bas */}
        {rapportDates.length > 0 && (
          <div className="px-4 pb-4 border-t pt-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">Rapports enregistrés</p>
            <div className="space-y-2">
              {rapportDates.map((date, index) => {
                let rapportDate = (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) 
                  ? new Date(...date.split('-').map((v, i) => i === 1 ? v - 1 : v)) 
                  : new Date(date);
                const { early, late } = getEstimatedImplantation(date);
                return (
                  <div key={index} className="bg-rose-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span className="text-sm font-semibold text-slate-700">
                          {rapportDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <button onClick={() => onRemoveRapport && onRemoveRapport(date)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Baby className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-slate-500">
                        Nidation estimée : {early.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {late.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal au clic sur un jour */}
        {showAddRapport && selectedDate && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <Card className="bg-white rounded-2xl p-5 w-full max-w-xs">
              <h4 className="text-lg font-bold text-slate-700 mb-2">
                {formatDateWithWeekday(selectedDate)}
              </h4>
              
              <div className="space-y-1.5 mb-4 text-xs">
                {isPeriodDay(selectedDate) && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-pink-50 rounded-lg">
                    <Droplets className="w-3.5 h-3.5 text-pink-500" />
                    <span className="text-pink-700 font-medium">Jour de règles</span>
                  </div>
                )}
                {isOvulationDay(selectedDate) && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-sky-50 rounded-lg">
                    <Egg className="w-3.5 h-3.5 text-sky-500" />
                    <span className="text-sky-700 font-medium">Pic d'ovulation</span>
                  </div>
                )}
                {isFertileDay(selectedDate) && !isOvulationDay(selectedDate) && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-50 rounded-lg">
                    <Heart className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-700 font-medium">Fenêtre fertile</span>
                  </div>
                )}
                {isImplantationDay(selectedDate) && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-amber-50 rounded-lg">
                    <Baby className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-700 font-medium">Nidation possible</span>
                  </div>
                )}
                {isSchoolHoliday(selectedDate, selectedZone) && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 rounded-lg">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-blue-700 font-medium">Vacances : {isSchoolHoliday(selectedDate, selectedZone)}</span>
                  </div>
                )}
                {isPublicHoliday(selectedDate) && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-red-50 rounded-lg">
                    <CalendarIcon className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-red-700 font-medium">{isPublicHoliday(selectedDate)}</span>
                  </div>
                )}
                {!isPeriodDay(selectedDate) && !isFertileDay(selectedDate) && !isImplantationDay(selectedDate) && !isSchoolHoliday(selectedDate, selectedZone) && !isPublicHoliday(selectedDate) && (
                  <div className="px-2 py-1 text-slate-400">Aucun événement ce jour</div>
                )}
              </div>

              {isRapportDay(selectedDate) ? (
                <div className="flex gap-2">
                  <Button onClick={handleRemoveRapport} className="flex-1 bg-rose-500 text-white rounded-full py-2">
                    Supprimer
                  </Button>
                  <Button onClick={() => { setShowAddRapport(false); setSelectedDate(null); }} className="flex-1 bg-slate-200 text-slate-700 rounded-full py-2">
                    Fermer
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleAddRapport} className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-full py-2">
                    <Heart className="w-4 h-4 mr-1" />
                    Rapport
                  </Button>
                  <Button onClick={() => { setShowAddRapport(false); setSelectedDate(null); }} className="flex-1 bg-slate-200 text-slate-700 rounded-full py-2">
                    Fermer
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  ChevronLeft, ChevronRight, X, Heart, Droplets, Egg, Baby, 
  MapPin, Calendar as CalendarIcon, Plus
} from 'lucide-react';

// Vacances scolaires françaises 2025-2026 par zone (dates officielles)
const SCHOOL_HOLIDAYS_2025_2026 = {
  A: [ // Besançon, Bordeaux, Clermont-Ferrand, Dijon, Grenoble, Limoges, Lyon, Poitiers
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-03' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-05' },
    { name: 'Hiver', start: '2026-02-14', end: '2026-03-02' },
    { name: 'Printemps', start: '2026-04-11', end: '2026-04-27' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
  ],
  B: [ // Aix-Marseille, Amiens, Caen, Lille, Nancy-Metz, Nantes, Nice, Orléans-Tours, Reims, Rennes, Rouen, Strasbourg
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-03' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-05' },
    { name: 'Hiver', start: '2026-02-07', end: '2026-02-23' },
    { name: 'Printemps', start: '2026-04-04', end: '2026-04-20' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
  ],
  C: [ // Créteil, Montpellier, Paris, Toulouse, Versailles
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-03' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-05' },
    { name: 'Hiver', start: '2026-02-21', end: '2026-03-09' },
    { name: 'Printemps', start: '2026-04-18', end: '2026-05-04' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
  ],
};

// Jours fériés français 2025-2026
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
  // 2026
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

// Obtenir le numéro de semaine ISO
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Vérifier si une date est dans les vacances
const isSchoolHoliday = (date, zone) => {
  const holidays = SCHOOL_HOLIDAYS_2025_2026[zone] || [];
  const dateStr = date.toISOString().split('T')[0];
  
  for (const holiday of holidays) {
    if (dateStr >= holiday.start && dateStr <= holiday.end) {
      return holiday.name;
    }
  }
  return null;
};

// Vérifier si une date est un jour férié
const isPublicHoliday = (date) => {
  const dateStr = date.toISOString().split('T')[0];
  const holiday = PUBLIC_HOLIDAYS.find(h => h.date === dateStr);
  return holiday ? holiday.name : null;
};

// Jours de la semaine en français
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
  const [selectedZone, setSelectedZone] = useState('A');
  const [showAddRapport, setShowAddRapport] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Premier jour du mois
  const firstDay = new Date(year, month, 1);
  // Dernier jour du mois
  const lastDay = new Date(year, month + 1, 0);
  
  // Jour de la semaine du premier jour (0 = dimanche, on veut lundi = 0)
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  
  // Générer les jours du calendrier
  const days = [];
  
  // Jours du mois précédent
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false
    });
  }
  
  // Jours du mois actuel
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }
  
  // Jours du mois suivant pour compléter la grille
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }

  // Regrouper par semaines
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFertileDay = (date) => {
    if (!agendaData) return false;
    const dateStr = date.toISOString().split('T')[0];
    const fertileStart = agendaData.fertileStart?.toISOString().split('T')[0];
    const fertileEnd = agendaData.fertileEnd?.toISOString().split('T')[0];
    return dateStr >= fertileStart && dateStr <= fertileEnd;
  };

  const isOvulationDay = (date) => {
    if (!agendaData) return false;
    return date.toDateString() === agendaData.ovulationDate?.toDateString();
  };

  const isPeriodDay = (date) => {
    if (!agendaData) return false;
    // Période = 5 jours à partir de nextPeriod
    const periodStart = agendaData.nextPeriod;
    if (!periodStart) return false;
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 5);
    return date >= periodStart && date <= periodEnd;
  };

  const isRapportDay = (date) => {
    return rapportDates.some(d => new Date(d).toDateString() === date.toDateString());
  };

  // Calculer la nidation estimée basée sur les rapports
  const getEstimatedImplantation = (rapportDate) => {
    // La nidation a lieu 6-12 jours après la fécondation
    // Si le rapport est proche de l'ovulation, la fécondation peut avoir lieu
    const rapport = new Date(rapportDate);
    const implantationEarly = new Date(rapport);
    implantationEarly.setDate(implantationEarly.getDate() + 6);
    const implantationLate = new Date(rapport);
    implantationLate.setDate(implantationLate.getDate() + 12);
    return { early: implantationEarly, late: implantationLate };
  };

  const isImplantationDay = (date) => {
    if (rapportDates.length === 0) return false;
    
    for (const rapportDate of rapportDates) {
      const { early, late } = getEstimatedImplantation(rapportDate);
      if (date >= early && date <= late) {
        return true;
      }
    }
    return false;
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowAddRapport(true);
  };

  const handleAddRapport = () => {
    if (selectedDate && onAddRapport) {
      onAddRapport(selectedDate.toISOString().split('T')[0]);
      setShowAddRapport(false);
      setSelectedDate(null);
    }
  };

  const handleRemoveRapport = () => {
    if (selectedDate && onRemoveRapport) {
      onRemoveRapport(selectedDate.toISOString().split('T')[0]);
      setShowAddRapport(false);
      setSelectedDate(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Calendrier
          </h2>
          <Button onClick={onClose} className="bg-slate-100 rounded-full p-2 hover:bg-slate-200">
            <X className="w-5 h-5 text-slate-600" />
          </Button>
        </div>

        {/* Zone scolaire */}
        <div className="px-4 py-3 border-b bg-slate-50">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-600">Zone scolaire :</span>
            <div className="flex gap-1">
              {['A', 'B', 'C'].map(zone => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                    selectedZone === zone 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {selectedZone === 'A' && 'Besançon, Bordeaux, Clermont-Ferrand, Dijon, Grenoble, Limoges, Lyon, Poitiers'}
            {selectedZone === 'B' && 'Aix-Marseille, Amiens, Caen, Lille, Nancy-Metz, Nantes, Nice, Orléans-Tours, Reims, Rennes, Rouen, Strasbourg'}
            {selectedZone === 'C' && 'Créteil, Montpellier, Paris, Toulouse, Versailles'}
          </p>
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
          {/* En-tête jours */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="text-center text-xs font-semibold text-slate-400 py-1">S</div>
            {DAYS_FR.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-8 gap-1 mb-1">
              {/* Numéro de semaine */}
              <div className="flex items-center justify-center text-xs text-slate-400 font-medium">
                {getWeekNumber(week[0].date)}
              </div>
              
              {/* Jours */}
              {week.map((day, dayIndex) => {
                const holiday = isSchoolHoliday(day.date, selectedZone);
                const publicHoliday = isPublicHoliday(day.date);
                const fertile = isFertileDay(day.date);
                const ovulation = isOvulationDay(day.date);
                const period = isPeriodDay(day.date);
                const rapport = isRapportDay(day.date);
                const implantation = isImplantationDay(day.date);
                const today = isToday(day.date);

                return (
                  <button
                    key={dayIndex}
                    onClick={() => handleDayClick(day.date)}
                    title={publicHoliday || holiday || ''}
                    className={`
                      relative w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all
                      ${!day.isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                      ${today ? 'ring-2 ring-purple-500 font-bold' : ''}
                      ${publicHoliday && day.isCurrentMonth ? 'bg-red-100 text-red-700 font-semibold' : ''}
                      ${holiday && !publicHoliday && day.isCurrentMonth ? 'bg-blue-100' : ''}
                      ${fertile && day.isCurrentMonth && !publicHoliday ? 'bg-emerald-100' : ''}
                      ${ovulation && day.isCurrentMonth ? 'bg-sky-400 text-white font-bold' : ''}
                      ${period && day.isCurrentMonth && !publicHoliday ? 'bg-pink-200' : ''}
                      ${implantation && day.isCurrentMonth && !publicHoliday ? 'bg-amber-200' : ''}
                      ${rapport ? 'ring-2 ring-rose-500' : ''}
                      hover:bg-slate-100
                    `}
                  >
                    {day.date.getDate()}
                    {rapport && (
                      <Heart className="absolute -top-1 -right-1 w-3 h-3 text-rose-500 fill-rose-500" />
                    )}
                    {publicHoliday && !rapport && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Légende */}
        <div className="px-4 pb-4 border-t pt-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Légende</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-sky-400"></div>
              <span className="text-slate-600">Pic d'ovulation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300"></div>
              <span className="text-slate-600">Fenêtre fertile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-pink-200"></div>
              <span className="text-slate-600">Règles prévues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-200"></div>
              <span className="text-slate-600">Nidation estimée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-100 border border-blue-300"></div>
              <span className="text-slate-600">Vacances scolaires</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-100 border border-red-300 relative">
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </div>
              <span className="text-slate-600">Jour férié</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-rose-500 flex items-center justify-center">
                <Heart className="w-2 h-2 text-rose-500 fill-rose-500" />
              </div>
              <span className="text-slate-600">Rapport</span>
            </div>
          </div>
        </div>

        {/* Dates de rapports enregistrées */}
        {rapportDates.length > 0 && (
          <div className="px-4 pb-4 border-t pt-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">Rapports enregistrés</p>
            <div className="space-y-2">
              {rapportDates.map((date, index) => {
                const { early, late } = getEstimatedImplantation(date);
                return (
                  <div key={index} className="bg-rose-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span className="text-sm font-semibold text-slate-700">
                          {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <button 
                        onClick={() => onRemoveRapport && onRemoveRapport(date)}
                        className="text-slate-400 hover:text-slate-600"
                      >
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

        {/* Modal ajout rapport */}
        {showAddRapport && selectedDate && (
          <div className="fixed inset-0 bg-black/30 z-60 flex items-center justify-center p-4">
            <Card className="bg-white rounded-2xl p-5 w-full max-w-xs">
              <h4 className="text-lg font-bold text-slate-700 mb-2">
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>
              
              {isRapportDay(selectedDate) ? (
                <>
                  <p className="text-sm text-slate-500 mb-4">Un rapport est déjà enregistré ce jour.</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRemoveRapport}
                      className="flex-1 bg-rose-500 text-white rounded-full py-2"
                    >
                      Supprimer
                    </Button>
                    <Button
                      onClick={() => { setShowAddRapport(false); setSelectedDate(null); }}
                      className="flex-1 bg-slate-200 text-slate-700 rounded-full py-2"
                    >
                      Annuler
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-4">Enregistrer un rapport à cette date ?</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddRapport}
                      className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-full py-2"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Ajouter
                    </Button>
                    <Button
                      onClick={() => { setShowAddRapport(false); setSelectedDate(null); }}
                      className="flex-1 bg-slate-200 text-slate-700 rounded-full py-2"
                    >
                      Annuler
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  ChevronLeft, ChevronRight, X, Heart, Droplets, MapPin
} from 'lucide-react';

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');

const formatDateWithWeekday = (date) =>
  capitalize(date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));

const toDateStr = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/**
 * Vacances scolaires FR — années scolaires 2025-26 et 2026-27
 * (dates officielles approximatives Education Nationale, zones A/B/C)
 */
const SCHOOL_HOLIDAYS = {
  A: [
    // 2025-2026
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-07', end: '2026-02-22' },
    { name: 'Printemps', start: '2026-04-04', end: '2026-04-19' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-18' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
    // 2026-2027
    { name: 'Toussaint', start: '2026-10-17', end: '2026-11-01' },
    { name: 'Noël', start: '2026-12-19', end: '2027-01-03' },
    { name: 'Hiver', start: '2027-02-06', end: '2027-02-21' },
    { name: 'Printemps', start: '2027-04-03', end: '2027-04-18' },
    { name: 'Été', start: '2027-07-06', end: '2027-08-31' },
  ],
  B: [
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-14', end: '2026-03-01' },
    { name: 'Printemps', start: '2026-04-11', end: '2026-04-26' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-18' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
    { name: 'Toussaint', start: '2026-10-17', end: '2026-11-01' },
    { name: 'Noël', start: '2026-12-19', end: '2027-01-03' },
    { name: 'Hiver', start: '2027-02-13', end: '2027-02-28' },
    { name: 'Printemps', start: '2027-04-10', end: '2027-04-25' },
    { name: 'Été', start: '2027-07-06', end: '2027-08-31' },
  ],
  C: [
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-21', end: '2026-03-08' },
    { name: 'Printemps', start: '2026-04-18', end: '2026-05-03' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-18' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
    { name: 'Toussaint', start: '2026-10-17', end: '2026-11-01' },
    { name: 'Noël', start: '2026-12-19', end: '2027-01-03' },
    { name: 'Hiver', start: '2027-02-20', end: '2027-03-07' },
    { name: 'Printemps', start: '2027-04-17', end: '2027-05-02' },
    { name: 'Été', start: '2027-07-06', end: '2027-08-31' },
  ],
};

const PUBLIC_HOLIDAYS = [
  { date: '2026-01-01', name: "Jour de l'An" },
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
  { date: '2027-01-01', name: "Jour de l'An" },
  { date: '2027-05-01', name: 'Fête du Travail' },
  { date: '2027-05-08', name: 'Victoire 1945' },
  { date: '2027-07-14', name: 'Fête Nationale' },
  { date: '2027-08-15', name: 'Assomption' },
  { date: '2027-11-01', name: 'Toussaint' },
  { date: '2027-11-11', name: 'Armistice' },
  { date: '2027-12-25', name: 'Noël' },
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
  const dateStr = toDateStr(date);
  for (const holiday of holidays) {
    if (dateStr >= holiday.start && dateStr <= holiday.end) return holiday.name;
  }
  return null;
};

const isPublicHoliday = (date) => {
  const dateStr = toDateStr(date);
  const holiday = PUBLIC_HOLIDAYS.find((h) => h.date === dateStr);
  return holiday ? holiday.name : null;
};

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const LEGEND_ITEMS = [
  { key: 'ovulation', label: "Pic d'ovulation", swatch: 'circle', color: '#0ea5e9' },
  { key: 'fertile', label: 'Fenêtre fertile', swatch: 'circle', color: '#86efac' },
  { key: 'period', label: 'Règles prévues', swatch: 'circle', color: '#f9a8d4' },
  { key: 'rapport', label: 'Rapport', swatch: 'heart' },
  { key: 'school', label: 'Vacances scolaires', swatch: 'bar', color: '#3b82f6' },
  { key: 'public', label: 'Jour férié', swatch: 'bar', color: '#ef4444' },
];

export default function FertilityCalendar({
  isOpen,
  onClose,
  agendaData,
  rapportDates = [],
  onAddRapport,
  onRemoveRapport,
  variant = 'modal',
  hideFertilityFeatures = false,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedZone, setSelectedZone] = useState(() =>
    localStorage.getItem('mamandouce_school_zone') || 'A'
  );
  const [showAddRapport, setShowAddRapport] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
    localStorage.setItem('mamandouce_school_zone', zone);
  };

  const isPage = variant === 'page';
  if (!isOpen && !isPage) return null;

  const legendItems = hideFertilityFeatures
    ? LEGEND_ITEMS.filter((item) => item.key === 'school' || item.key === 'public')
    : LEGEND_ITEMS;

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
    today.setHours(0, 0, 0, 0);
    currentPeriodStart.setHours(0, 0, 0, 0);

    while (currentPeriodStart > today) {
      currentPeriodStart.setDate(currentPeriodStart.getDate() - cycleLen);
    }

    for (let i = 0; i < 6; i++) {
      const periodStart = new Date(currentPeriodStart);
      periodStart.setDate(periodStart.getDate() + i * cycleLen);
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
    const dateStr = toDateStr(date);
    return cycleData.some((cycle) => {
      const startStr = toDateStr(cycle.fertileStart);
      const endStr = toDateStr(cycle.fertileEnd);
      return dateStr >= startStr && dateStr <= endStr;
    });
  };

  const isOvulationDay = (date) =>
    cycleData.some((c) => toDateStr(date) === toDateStr(c.ovulation));

  const isPeriodDay = (date) => {
    const dateStr = toDateStr(date);
    return cycleData.some((c) => {
      const startStr = toDateStr(c.periodStart);
      const endStr = toDateStr(c.periodEnd);
      return dateStr >= startStr && dateStr <= endStr;
    });
  };

  const isRapportDay = (date) => {
    const dateStr = toDateStr(date);
    return rapportDates.some((d) => {
      if (typeof d === 'string') return d === dateStr || d.startsWith(dateStr);
      return toDateStr(new Date(d)) === dateStr;
    });
  };

  const handleDayClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setShowAddRapport(true);
  };

  const getCycleBg = (ovulation, period, fertile, isCurrentMonth) => {
    if (!isCurrentMonth) return 'transparent';
    if (ovulation) return '#0ea5e9';
    if (period) return '#f9a8d4';
    if (fertile) return '#86efac';
    return 'transparent';
  };

  // Bandeau info vacances du mois affiché
  const monthHolidayNames = [
    ...new Set(
      days
        .filter((d) => d.isCurrentMonth)
        .map((d) => isSchoolHoliday(d.date, selectedZone))
        .filter(Boolean)
    ),
  ];

  const selectedDateStr = selectedDate ? toDateStr(selectedDate) : null;
  const selectedHasRapport = selectedDate ? isRapportDay(selectedDate) : false;

  const cardClassName = isPage
    ? 'fertility-calendar-page card-glass-modal bg-white rounded-3xl w-full border-0 shadow-xl overflow-hidden'
    : 'fertility-calendar-modal card-glass-modal bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden border-0 shadow-2xl';

  const content = (
      <Card className={cardClassName} data-testid={isPage ? 'calendar-page-card' : undefined}>
        {/* Header (modal only) */}
        {!isPage && (
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Calendrier
            </h2>
            <Button onClick={onClose} className="bg-slate-100 rounded-full p-2 hover:bg-slate-200">
              <X className="w-5 h-5 text-slate-600" />
            </Button>
          </div>
        )}

        {/* Zone scolaire */}
        <div
          className={`px-4 py-3 border-b border-slate-100 bg-slate-50 ${isPage ? 'rounded-t-3xl' : ''}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-sm font-semibold text-slate-600 truncate">Zone scolaire :</span>
            </div>
            <div className="flex gap-1 bg-slate-200/70 p-1 rounded-full shrink-0">
              {['A', 'B', 'C'].map((zone) => {
                const isActive = selectedZone === zone;
                return (
                  <button
                    key={zone}
                    type="button"
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
          {monthHolidayNames.length > 0 && (
            <p className="mt-2 text-[11px] text-blue-700 bg-blue-50 rounded-lg px-2 py-1.5 leading-snug">
              Vacances ce mois (zone {selectedZone}) :{' '}
              <span className="font-semibold">{monthHolidayNames.join(', ')}</span>
            </p>
          )}
        </div>

        {/* Bouton règles */}
        {!hideFertilityFeatures && (
          <div className="px-4 py-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                localStorage.setItem('mamandouce_last_period_start', toDateStr(today));
                setSelectedDate(today);
                setShowAddRapport(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-rose-400 to-pink-500 shadow-sm"
            >
              <Droplets className="w-4 h-4" />
              Début de règles aujourd&apos;hui
            </button>
          </div>
        )}

        {/* Navigation mois */}
        <div className="flex items-center justify-between px-4 py-2">
          <Button type="button" onClick={prevMonth} className="bg-slate-100 rounded-full p-1.5 hover:bg-slate-200">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Button>
          <h3 className="text-md font-bold text-slate-700">
            {MONTHS_FR[month]} {year}
          </h3>
          <Button type="button" onClick={nextMonth} className="bg-slate-100 rounded-full p-1.5 hover:bg-slate-200">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Button>
        </div>

        {/* Grille */}
        <div className="px-3 pb-3 sm:px-4">
          <div className="grid grid-cols-8 gap-0.5 mb-1 text-center">
            <div className="text-[10px] font-bold text-slate-400 py-1">S.</div>
            {DAYS_FR.map((day) => (
              <div key={day} className="text-[10px] font-bold text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-8 gap-0.5 items-stretch">
              <div className="flex items-center justify-center text-[10px] text-slate-400 font-medium">
                {getWeekNumber(week[0].date)}
              </div>

              {week.map((day, dayIndex) => {
                const holiday = isSchoolHoliday(day.date, selectedZone);
                const publicHoliday = isPublicHoliday(day.date);
                const fertile = isFertileDay(day.date);
                const ovulation = isOvulationDay(day.date);
                const period = isPeriodDay(day.date);
                const rapport = isRapportDay(day.date);
                const today = isToday(day.date);
                const cycleBg = getCycleBg(ovulation, period, fertile, day.isCurrentMonth);
                const tip = [holiday && `Vacances : ${holiday}`, publicHoliday && `Férié : ${publicHoliday}`]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <div
                    key={dayIndex}
                    className="flex flex-col items-center justify-start pt-0.5 pb-1 min-h-[52px] min-w-0"
                    title={tip || undefined}
                  >
                    <button
                      type="button"
                      onClick={() => day.isCurrentMonth && !hideFertilityFeatures && handleDayClick(day.date)}
                      disabled={!day.isCurrentMonth}
                      className={`
                        relative w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all focus:outline-none shrink-0
                        ${!day.isCurrentMonth ? 'text-slate-300' : 'text-slate-800'}
                        ${today ? 'font-black' : 'font-medium'}
                      `}
                      style={{
                        background: cycleBg,
                        color: !day.isCurrentMonth ? '#cbd5e1' : ovulation ? '#ffffff' : '#1e293b',
                        border: today
                          ? '2px solid #a855f7'
                          : rapport
                            ? '2px solid #f43f5e'
                            : '2px solid transparent',
                        boxSizing: 'border-box',
                      }}
                    >
                      <span>{day.date.getDate()}</span>
                      {rapport && day.isCurrentMonth && (
                        <Heart className="absolute -top-0.5 -right-0.5 w-3 h-3 text-rose-500 fill-rose-500 drop-shadow-sm" />
                      )}
                    </button>

                    {/* Indicateurs vacances / fériés — visibles (plus de h-1 trop fins) */}
                    <div className="w-full flex justify-center items-center gap-0.5 mt-1 min-h-[6px]">
                      {holiday && day.isCurrentMonth && (
                        <span
                          className="block w-5 h-1.5 rounded-full bg-blue-500 shadow-sm"
                          aria-label={`Vacances ${holiday}`}
                        />
                      )}
                      {publicHoliday && day.isCurrentMonth && (
                        <span
                          className="block w-5 h-1.5 rounded-full bg-red-500 shadow-sm"
                          aria-label={`Férié ${publicHoliday}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Légende — grille stable, textes contrastés */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
          <p className="font-bold mb-2.5 text-slate-700 text-xs uppercase tracking-wide">Légende</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {legendItems.map((item) => (
              <div key={item.key} className="flex items-center gap-2 min-w-0">
                {item.swatch === 'circle' && (
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/5"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                {item.swatch === 'bar' && (
                  <span
                    className="w-5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                {item.swatch === 'heart' && (
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                )}
                <span className="text-xs text-slate-600 leading-tight truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
  );

  return (
    <div
      className={isPage ? 'w-full' : 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'}
      data-testid={isPage ? 'fertility-calendar-page' : undefined}
    >
      {content}

      {/* Modal ajout / suppression rapport — était manquant */}
      {!hideFertilityFeatures && showAddRapport && selectedDate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
          <Card className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border-0">
            <h3 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {formatDateWithWeekday(selectedDate)}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {selectedHasRapport
                ? 'Un rapport est déjà enregistré pour ce jour.'
                : 'Enregistrer un rapport pour ce jour ?'}
            </p>
            <div className="flex flex-col gap-2">
              {!selectedHasRapport ? (
                <Button
                  type="button"
                  className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white"
                  onClick={() => {
                    if (onAddRapport && selectedDateStr) {
                      onAddRapport(selectedDateStr);
                    }
                    setShowAddRapport(false);
                    setSelectedDate(null);
                  }}
                >
                  <Heart className="w-4 h-4 mr-2 fill-white" />
                  Enregistrer un rapport
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full rounded-xl bg-slate-700 hover:bg-slate-800 text-white"
                  onClick={() => {
                    if (onRemoveRapport && selectedDateStr) {
                      onRemoveRapport(selectedDateStr);
                    }
                    setShowAddRapport(false);
                    setSelectedDate(null);
                  }}
                >
                  Supprimer le rapport
                </Button>
              )}
              <Button
                type="button"
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={() => {
                  setShowAddRapport(false);
                  setSelectedDate(null);
                }}
              >
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

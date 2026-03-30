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
// Format: début = samedi, fin = dimanche (reprise lundi)
const SCHOOL_HOLIDAYS = {
  A: [
    // 2025-2026
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-07', end: '2026-02-22' },
    { name: 'Printemps', start: '2026-04-04', end: '2026-04-19' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-17' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
    // 2026-2027
    { name: 'Toussaint', start: '2026-10-17', end: '2026-11-01' },
    { name: 'Noël', start: '2026-12-19', end: '2027-01-03' },
    { name: 'Hiver', start: '2027-02-13', end: '2027-02-28' },
    { name: 'Printemps', start: '2027-04-10', end: '2027-04-25' },
    { name: 'Ascension', start: '2027-05-13', end: '2027-05-16' },
    { name: 'Été', start: '2027-07-03', end: '2027-08-31' },
    // 2027-2028
    { name: 'Toussaint', start: '2027-10-23', end: '2027-11-07' },
    { name: 'Noël', start: '2027-12-18', end: '2028-01-02' },
    { name: 'Hiver', start: '2028-02-12', end: '2028-02-27' },
    { name: 'Printemps', start: '2028-04-08', end: '2028-04-23' },
    { name: 'Ascension', start: '2028-05-25', end: '2028-05-28' },
    { name: 'Été', start: '2028-07-08', end: '2028-08-31' },
    // 2028-2029
    { name: 'Toussaint', start: '2028-10-21', end: '2028-11-05' },
    { name: 'Noël', start: '2028-12-23', end: '2029-01-07' },
    { name: 'Hiver', start: '2029-02-10', end: '2029-02-25' },
    { name: 'Printemps', start: '2029-04-07', end: '2029-04-22' },
    { name: 'Ascension', start: '2029-05-10', end: '2029-05-13' },
    { name: 'Été', start: '2029-07-07', end: '2029-08-31' },
    // 2029-2030
    { name: 'Toussaint', start: '2029-10-20', end: '2029-11-04' },
    { name: 'Noël', start: '2029-12-22', end: '2030-01-05' },
    { name: 'Hiver', start: '2030-02-09', end: '2030-02-23' },
    { name: 'Printemps', start: '2030-04-06', end: '2030-04-21' },
    { name: 'Ascension', start: '2030-05-30', end: '2030-06-02' },
    { name: 'Été', start: '2030-07-06', end: '2030-08-31' },
  ],
  B: [
    // 2025-2026
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-14', end: '2026-03-01' },
    { name: 'Printemps', start: '2026-04-11', end: '2026-04-26' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-17' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
    // 2026-2027
    { name: 'Toussaint', start: '2026-10-17', end: '2026-11-01' },
    { name: 'Noël', start: '2026-12-19', end: '2027-01-03' },
    { name: 'Hiver', start: '2027-02-20', end: '2027-03-07' },
    { name: 'Printemps', start: '2027-04-17', end: '2027-05-02' },
    { name: 'Ascension', start: '2027-05-13', end: '2027-05-16' },
    { name: 'Été', start: '2027-07-03', end: '2027-08-31' },
    // 2027-2028
    { name: 'Toussaint', start: '2027-10-23', end: '2027-11-07' },
    { name: 'Noël', start: '2027-12-18', end: '2028-01-02' },
    { name: 'Hiver', start: '2028-02-19', end: '2028-03-05' },
    { name: 'Printemps', start: '2028-04-15', end: '2028-04-30' },
    { name: 'Ascension', start: '2028-05-25', end: '2028-05-28' },
    { name: 'Été', start: '2028-07-08', end: '2028-08-31' },
    // 2028-2029
    { name: 'Toussaint', start: '2028-10-21', end: '2028-11-05' },
    { name: 'Noël', start: '2028-12-23', end: '2029-01-07' },
    { name: 'Hiver', start: '2029-02-24', end: '2029-03-11' },
    { name: 'Printemps', start: '2029-04-21', end: '2029-05-06' },
    { name: 'Ascension', start: '2029-05-10', end: '2029-05-13' },
    { name: 'Été', start: '2029-07-07', end: '2029-08-31' },
    // 2029-2030
    { name: 'Toussaint', start: '2029-10-20', end: '2029-11-04' },
    { name: 'Noël', start: '2029-12-22', end: '2030-01-05' },
    { name: 'Hiver', start: '2030-02-23', end: '2030-03-09' },
    { name: 'Printemps', start: '2030-04-20', end: '2030-05-05' },
    { name: 'Ascension', start: '2030-05-30', end: '2030-06-02' },
    { name: 'Été', start: '2030-07-06', end: '2030-08-31' },
  ],
  C: [
    // 2025-2026
    { name: 'Toussaint', start: '2025-10-18', end: '2025-11-02' },
    { name: 'Noël', start: '2025-12-20', end: '2026-01-04' },
    { name: 'Hiver', start: '2026-02-21', end: '2026-03-08' },
    { name: 'Printemps', start: '2026-04-18', end: '2026-05-03' },
    { name: 'Ascension', start: '2026-05-14', end: '2026-05-17' },
    { name: 'Été', start: '2026-07-04', end: '2026-08-31' },
    // 2026-2027
    { name: 'Toussaint', start: '2026-10-17', end: '2026-11-01' },
    { name: 'Noël', start: '2026-12-19', end: '2027-01-03' },
    { name: 'Hiver', start: '2027-02-27', end: '2027-03-14' },
    { name: 'Printemps', start: '2027-04-24', end: '2027-05-09' },
    { name: 'Ascension', start: '2027-05-13', end: '2027-05-16' },
    { name: 'Été', start: '2027-07-03', end: '2027-08-31' },
    // 2027-2028
    { name: 'Toussaint', start: '2027-10-23', end: '2027-11-07' },
    { name: 'Noël', start: '2027-12-18', end: '2028-01-02' },
    { name: 'Hiver', start: '2028-02-26', end: '2028-03-12' },
    { name: 'Printemps', start: '2028-04-22', end: '2028-05-07' },
    { name: 'Ascension', start: '2028-05-25', end: '2028-05-28' },
    { name: 'Été', start: '2028-07-08', end: '2028-08-31' },
    // 2028-2029
    { name: 'Toussaint', start: '2028-10-21', end: '2028-11-05' },
    { name: 'Noël', start: '2028-12-23', end: '2029-01-07' },
    { name: 'Hiver', start: '2029-03-03', end: '2029-03-18' },
    { name: 'Printemps', start: '2029-04-28', end: '2029-05-13' },
    { name: 'Ascension', start: '2029-05-10', end: '2029-05-13' },
    { name: 'Été', start: '2029-07-07', end: '2029-08-31' },
    // 2029-2030
    { name: 'Toussaint', start: '2029-10-20', end: '2029-11-04' },
    { name: 'Noël', start: '2029-12-22', end: '2030-01-05' },
    { name: 'Hiver', start: '2030-03-02', end: '2030-03-16' },
    { name: 'Printemps', start: '2030-04-27', end: '2030-05-12' },
    { name: 'Ascension', start: '2030-05-30', end: '2030-06-02' },
    { name: 'Été', start: '2030-07-06', end: '2030-08-31' },
  ],
};

// Jours fériés français 2025-2030
const PUBLIC_HOLIDAYS = [
  // 2025
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
  // 2027
  { date: '2027-01-01', name: 'Jour de l\'An' },
  { date: '2027-03-29', name: 'Lundi de Pâques' },
  { date: '2027-05-01', name: 'Fête du Travail' },
  { date: '2027-05-06', name: 'Ascension' },
  { date: '2027-05-08', name: 'Victoire 1945' },
  { date: '2027-05-17', name: 'Lundi de Pentecôte' },
  { date: '2027-07-14', name: 'Fête Nationale' },
  { date: '2027-08-15', name: 'Assomption' },
  { date: '2027-11-01', name: 'Toussaint' },
  { date: '2027-11-11', name: 'Armistice' },
  { date: '2027-12-25', name: 'Noël' },
  // 2028
  { date: '2028-01-01', name: 'Jour de l\'An' },
  { date: '2028-04-17', name: 'Lundi de Pâques' },
  { date: '2028-05-01', name: 'Fête du Travail' },
  { date: '2028-05-08', name: 'Victoire 1945' },
  { date: '2028-05-25', name: 'Ascension' },
  { date: '2028-06-05', name: 'Lundi de Pentecôte' },
  { date: '2028-07-14', name: 'Fête Nationale' },
  { date: '2028-08-15', name: 'Assomption' },
  { date: '2028-11-01', name: 'Toussaint' },
  { date: '2028-11-11', name: 'Armistice' },
  { date: '2028-12-25', name: 'Noël' },
  // 2029
  { date: '2029-01-01', name: 'Jour de l\'An' },
  { date: '2029-04-02', name: 'Lundi de Pâques' },
  { date: '2029-05-01', name: 'Fête du Travail' },
  { date: '2029-05-08', name: 'Victoire 1945' },
  { date: '2029-05-10', name: 'Ascension' },
  { date: '2029-05-21', name: 'Lundi de Pentecôte' },
  { date: '2029-07-14', name: 'Fête Nationale' },
  { date: '2029-08-15', name: 'Assomption' },
  { date: '2029-11-01', name: 'Toussaint' },
  { date: '2029-11-11', name: 'Armistice' },
  { date: '2029-12-25', name: 'Noël' },
  // 2030
  { date: '2030-01-01', name: 'Jour de l\'An' },
  { date: '2030-04-22', name: 'Lundi de Pâques' },
  { date: '2030-05-01', name: 'Fête du Travail' },
  { date: '2030-05-08', name: 'Victoire 1945' },
  { date: '2030-05-30', name: 'Ascension' },
  { date: '2030-06-10', name: 'Lundi de Pentecôte' },
  { date: '2030-07-14', name: 'Fête Nationale' },
  { date: '2030-08-15', name: 'Assomption' },
  { date: '2030-11-01', name: 'Toussaint' },
  { date: '2030-11-11', name: 'Armistice' },
  { date: '2030-12-25', name: 'Noël' },
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
  const holidays = SCHOOL_HOLIDAYS[zone] || [];
  // Format YYYY-MM-DD sans UTC pour éviter les décalages
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

// Vérifier si une date est un jour férié
const isPublicHoliday = (date) => {
  // Format YYYY-MM-DD sans UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
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
  // Charger la zone scolaire depuis localStorage
  const [selectedZone, setSelectedZone] = useState(() => {
    const saved = localStorage.getItem('mamandouce_school_zone');
    return saved || 'A';
  });
  const [showAddRapport, setShowAddRapport] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Sauvegarder la zone scolaire quand elle change
  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
    localStorage.setItem('mamandouce_school_zone', zone);
  };

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

  // Calculer tous les cycles sur 6 mois
  const getCycleData = () => {
    if (!agendaData || !agendaData.cycleLength) return [];
    
    const cycles = [];
    const cycleLen = agendaData.cycleLength;
    const lutealPhase = 14;
    const ovulationDay = cycleLen - lutealPhase;
    
    // Calculer les 6 prochains cycles à partir des dernières règles stockées
    let currentPeriodStart = agendaData.nextPeriod ? new Date(agendaData.nextPeriod) : null;
    
    if (!currentPeriodStart) return [];
    
    // Reculer au cycle actuel si nécessaire
    const today = new Date();
    while (currentPeriodStart > today) {
      currentPeriodStart.setDate(currentPeriodStart.getDate() - cycleLen);
    }
    
    // Générer 6 cycles
    for (let i = 0; i < 6; i++) {
      const periodStart = new Date(currentPeriodStart);
      periodStart.setDate(periodStart.getDate() + (i * cycleLen));
      
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 5);
      
      const ovulation = new Date(periodStart);
      ovulation.setDate(ovulation.getDate() + ovulationDay);
      
      const fertileStart = new Date(ovulation);
      fertileStart.setDate(fertileStart.getDate() - 5);
      
      const fertileEnd = new Date(ovulation);
      fertileEnd.setDate(fertileEnd.getDate() + 1);
      
      cycles.push({
        periodStart,
        periodEnd,
        ovulation,
        fertileStart,
        fertileEnd
      });
    }
    
    return cycles;
  };

  const cycleData = getCycleData();

  const isFertileDay = (date) => {
    if (cycleData.length === 0) return false;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    for (const cycle of cycleData) {
      const startYear = cycle.fertileStart.getFullYear();
      const startMonth = String(cycle.fertileStart.getMonth() + 1).padStart(2, '0');
      const startDay = String(cycle.fertileStart.getDate()).padStart(2, '0');
      const startStr = `${startYear}-${startMonth}-${startDay}`;
      
      const endYear = cycle.fertileEnd.getFullYear();
      const endMonth = String(cycle.fertileEnd.getMonth() + 1).padStart(2, '0');
      const endDay = String(cycle.fertileEnd.getDate()).padStart(2, '0');
      const endStr = `${endYear}-${endMonth}-${endDay}`;
      
      if (dateStr >= startStr && dateStr <= endStr) {
        return true;
      }
    }
    return false;
  };

  const isOvulationDay = (date) => {
    if (cycleData.length === 0) return false;
    
    for (const cycle of cycleData) {
      if (date.toDateString() === cycle.ovulation.toDateString()) {
        return true;
      }
    }
    return false;
  };

  const isPeriodDay = (date) => {
    if (cycleData.length === 0) return false;
    
    for (const cycle of cycleData) {
      if (date >= cycle.periodStart && date <= cycle.periodEnd) {
        return true;
      }
    }
    return false;
  };

  const isRapportDay = (date) => {
    // Comparer avec le format local YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return rapportDates.some(d => {
      // Si d est déjà une string YYYY-MM-DD, comparer directement
      if (typeof d === 'string' && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return d === dateStr;
      }
      // Sinon, convertir en date locale
      const rapportDate = new Date(d);
      const rYear = rapportDate.getFullYear();
      const rMonth = String(rapportDate.getMonth() + 1).padStart(2, '0');
      const rDay = String(rapportDate.getDate()).padStart(2, '0');
      return `${rYear}-${rMonth}-${rDay}` === dateStr;
    });
  };

  // Calculer la nidation estimée basée sur les rapports
  const getEstimatedImplantation = (rapportDate) => {
    // La nidation a lieu 6-12 jours après la fécondation
    // Parser correctement la date
    let rapport;
    if (typeof rapportDate === 'string' && rapportDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = rapportDate.split('-').map(Number);
      rapport = new Date(y, m - 1, d);
    } else if (rapportDate instanceof Date) {
      rapport = new Date(rapportDate);
    } else {
      rapport = new Date(rapportDate);
    }
    
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
      // Utiliser le format local YYYY-MM-DD pour éviter les décalages de fuseau horaire
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      onAddRapport(dateStr);
      setShowAddRapport(false);
      setSelectedDate(null);
    }
  };

  const handleRemoveRapport = () => {
    if (selectedDate && onRemoveRapport) {
      // Utiliser le format local YYYY-MM-DD pour éviter les décalages de fuseau horaire
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      onRemoveRapport(dateStr);
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
                  onClick={() => handleZoneChange(zone)}
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
                      relative w-9 h-9 rounded-lg flex flex-col items-center justify-center text-sm transition-all overflow-visible
                      ${!day.isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                      ${today ? 'ring-2 ring-purple-500 font-bold' : ''}
                      ${fertile && day.isCurrentMonth && !ovulation ? 'bg-emerald-50' : ''}
                      ${ovulation && day.isCurrentMonth ? 'bg-sky-400 text-white font-bold' : ''}
                      ${period && day.isCurrentMonth ? 'bg-pink-100' : ''}
                      ${implantation && day.isCurrentMonth && !ovulation && !period ? 'bg-amber-50' : ''}
                      ${rapport ? 'ring-2 ring-rose-500' : ''}
                      hover:bg-slate-100
                    `}
                  >
                    <span>{day.date.getDate()}</span>
                    {/* Barres en bas */}
                    <div className="absolute -bottom-0.5 left-0 right-0 flex justify-center gap-0.5">
                      {/* Barre bleue pour vacances scolaires */}
                      {holiday && day.isCurrentMonth && (
                        <span className="w-2 h-1 bg-blue-500 rounded-sm"></span>
                      )}
                      {/* Barre rouge pour jour férié */}
                      {publicHoliday && day.isCurrentMonth && (
                        <span className="w-2 h-1 bg-red-500 rounded-sm"></span>
                      )}
                    </div>
                    {/* Coeur pour rapport */}
                    {rapport && (
                      <Heart className="absolute -top-1 -right-1 w-3 h-3 text-rose-500 fill-rose-500" />
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
              <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200"></div>
              <span className="text-slate-600">Fenêtre fertile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-pink-100 border border-pink-200"></div>
              <span className="text-slate-600">Règles prévues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-50 border border-amber-200"></div>
              <span className="text-slate-600">Nidation estimée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 rounded flex items-end justify-center pb-0.5">
                <span className="w-4 h-0.5 bg-blue-400 rounded-full"></span>
              </div>
              <span className="text-slate-600">Vacances scolaires</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 rounded flex items-end justify-center pb-0.5">
                <span className="w-4 h-0.5 bg-red-500 rounded-full"></span>
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
                // Parser la date correctement pour éviter les décalages UTC
                let rapportDate;
                if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  const [y, m, d] = date.split('-').map(Number);
                  rapportDate = new Date(y, m - 1, d);
                } else {
                  rapportDate = new Date(date);
                }
                const { early, late } = getEstimatedImplantation(rapportDate);
                return (
                  <div key={index} className="bg-rose-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span className="text-sm font-semibold text-slate-700">
                          {rapportDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
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
                {formatDateWithWeekday(selectedDate)}
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

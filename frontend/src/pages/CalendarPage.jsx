import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import api from '../utils/api';
import { withTimeout } from '../utils/backendUrl';
import FertilityCalendar from '../components/FertilityCalendar';
import { useTheme } from '../contexts/ThemeContext';
import { parseHabitualLength, toYearMonthDay } from '../utils/cycleForm';
import { isPregnancyActive } from '../utils/pregnancyStatus';

const PROFILE_LOAD_TIMEOUT_MS = 8000;

function readStoredPregnancyFlag() {
  return localStorage.getItem('mamandouce_pregnant') === 'true';
}

function buildAgendaData(periodDate, cycleLen = 28) {
  const lastPeriod = new Date(periodDate);
  const nextPeriod = new Date(lastPeriod);
  nextPeriod.setDate(nextPeriod.getDate() + cycleLen);
  return { nextPeriod, cycleLength: cycleLen };
}

function loadRapportDatesFromStorage() {
  const saved = localStorage.getItem('mamandouce_rapports');
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  const [agendaData, setAgendaData] = useState(null);
  const [rapportDates, setRapportDates] = useState([]);
  const [isPregnant, setIsPregnant] = useState(() => readStoredPregnancyFlag());
  const [loading, setLoading] = useState(true);

  const textSecondary = isDarkMode ? 'text-white' : 'text-slate-600';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-700';
  const textMuted = isDarkMode ? 'text-white/90' : 'text-slate-500';

  useEffect(() => {
    const initialize = async () => {
      let pregnancyActive = isPregnancyActive({
        storedPregnant: readStoredPregnancyFlag(),
      });

      try {
        const profileRes = await withTimeout(
          api.pregnancy.getProfile(),
          PROFILE_LOAD_TIMEOUT_MS,
          'pregnancy.profile',
        );
        const profile = profileRes.data;
        pregnancyActive = isPregnancyActive({
          profile,
          storedPregnant: readStoredPregnancyFlag(),
        });

        if (!pregnancyActive && profile?.last_period_date) {
          const ymd = toYearMonthDay(profile.last_period_date);
          const length = parseHabitualLength(profile.cycle_length, 28);
          setAgendaData(buildAgendaData(ymd, length));
        }
      } catch (error) {
        console.warn('Profil indisponible pour le calendrier :', error?.response?.status || error.message);
      }

      setIsPregnant(pregnancyActive);
      if (!pregnancyActive) {
        setRapportDates(loadRapportDatesFromStorage());
      }
      setLoading(false);
    };

    initialize();
  }, []);

  const handleAddRapport = (date) => {
    const newDates = [...rapportDates, date].sort();
    setRapportDates(newDates);
    localStorage.setItem('mamandouce_rapports', JSON.stringify(newDates));
    toast.success(t('fertility.intercourseRecorded', 'Rapport enregistré'));
  };

  const handleRemoveRapport = (date) => {
    const newDates = rapportDates.filter((d) => d !== date);
    setRapportDates(newDates);
    localStorage.setItem('mamandouce_rapports', JSON.stringify(newDates));
    toast.success(t('fertility.intercourseRemoved', 'Rapport supprimé'));
  };

  return (
    <div className="min-h-screen gradient-bg" data-testid="calendar-page">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={() => navigate('/')}
            variant="ghost"
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-white/50'}`}
            data-testid="calendar-back-button"
          >
            <ArrowLeft className={`w-6 h-6 ${textSecondary}`} />
          </Button>
          <div className="flex-1">
            <h1
              className={`text-2xl font-bold ${textPrimary}`}
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {t('fertility.calendar', 'Calendrier')}
            </h1>
            <p className={`text-sm ${textMuted}`}>
              {t('fertility.calendarSubtitle', 'Vacances scolaires, jours fériés et suivi')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12" data-testid="calendar-page-loading">
            <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="calendar-page-card-shell pt-1" data-testid="calendar-page-card-shell">
            <FertilityCalendar
            variant="page"
            isOpen={true}
            onClose={() => navigate('/')}
            agendaData={isPregnant ? null : agendaData}
            rapportDates={isPregnant ? [] : rapportDates}
            onAddRapport={handleAddRapport}
            onRemoveRapport={handleRemoveRapport}
            hideFertilityFeatures={isPregnant}
          />
          </div>
        )}
      </div>
    </div>
  );
}

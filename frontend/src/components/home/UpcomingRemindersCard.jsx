import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Calendar, ChevronRight, Clock, X } from 'lucide-react';
import { Card } from '../ui/card';
import api from '../../utils/api';

// Calcule la différence en jours
const getDaysUntil = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Formate la date
const formatDate = (dateString, t) => {
  const date = new Date(dateString);
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('fr-FR', options);
};

export function UpcomingRemindersCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [upcomingItems, setUpcomingItems] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUpcomingReminders = useCallback(async ({ cancelled = () => false } = {}) => {
    try {
      const items = [];

      // Both endpoints exist on FastAPI. The legacy `/api/reminders` route
      // does not and must not be retried from the home dashboard.
      const [appointmentsResult, remindersResult] = await Promise.allSettled([
        api.medical.getAppointments(),
        api.medical.getScheduledReminders(),
      ]);

      if (cancelled()) return;

      if (appointmentsResult.status === 'fulfilled') {
        const medicalRes = appointmentsResult.value;
        const appointments = medicalRes.data || [];

        appointments.forEach(apt => {
          if (apt.date) {
            const daysUntil = getDaysUntil(apt.date);
            if (daysUntil >= 0 && daysUntil <= 7) {
              items.push({
                id: apt._id || apt.id || `apt-${apt.date}`,
                type: 'appointment',
                title: apt.title || apt.name || t('medical.appointment', 'Rendez-vous médical'),
                date: apt.date,
                daysUntil,
                icon: '🩺',
                color: 'pink',
                route: '/medical'
              });
            }
          }
        });
      } else if (appointmentsResult.reason?.response?.status !== 404) {
        console.error('Error loading medical appointments:', appointmentsResult.reason);
      }

      if (remindersResult.status === 'fulfilled') {
        const remindersRes = remindersResult.value;
        const reminders = remindersRes.data?.reminders || [];

        reminders.forEach(rem => {
          const date = rem.datetime || rem.reminder_datetime || rem.date;
          if (date) {
            const daysUntil = getDaysUntil(date);
            if (daysUntil >= 0 && daysUntil <= 7) {
              items.push({
                id: rem._id || rem.id || `rem-${date}`,
                type: 'reminder',
                title: rem.title || t('reminders.reminder', 'Rappel'),
                date,
                daysUntil,
                icon: '🔔',
                color: 'amber',
                route: '/reminders'
              });
            }
          }
        });
      } else if (remindersResult.reason?.response?.status !== 404) {
        console.error('Error loading scheduled reminders:', remindersResult.reason);
      }

      // Trier par date la plus proche
      items.sort((a, b) => a.daysUntil - b.daysUntil);
      
      // Charger les items dismissés du localStorage
      const savedDismissed = localStorage.getItem('mamandouce_dismissed_reminders');
      if (savedDismissed) {
        try {
          const parsed = JSON.parse(savedDismissed);
          if (Array.isArray(parsed)) setDismissed(parsed);
        } catch {
          // Invalid local data is equivalent to no dismissed reminders.
        }
      }

      if (!cancelled()) setUpcomingItems(items);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      if (!cancelled()) setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    loadUpcomingReminders({ cancelled: () => cancelled });
    return () => {
      cancelled = true;
    };
  }, [loadUpcomingReminders]);

  const handleDismiss = (id) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem('mamandouce_dismissed_reminders', JSON.stringify(newDismissed));
  };

  // Filtrer les items non dismissés
  const visibleItems = upcomingItems.filter(item => !dismissed.includes(item.id));

  if (isLoading || visibleItems.length === 0) {
    return null;
  }

  const item = visibleItems[0]; // Afficher seulement le prochain

  const getTimeLabel = (daysUntil) => {
    if (daysUntil === 0) return t('reminders.today', "Aujourd'hui");
    if (daysUntil === 1) return t('reminders.tomorrow', 'Demain');
    return t('reminders.inDays', 'Dans {{days}} jours', { days: daysUntil });
  };

  const colorClasses = {
    pink: {
      bg: 'bg-gradient-to-r from-pink-50 to-rose-50',
      border: 'border-pink-200',
      badge: 'bg-pink-500',
      text: 'text-pink-600',
      accent: 'text-pink-500'
    },
    amber: {
      bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
      border: 'border-amber-200',
      badge: 'bg-amber-500',
      text: 'text-amber-600',
      accent: 'text-amber-500'
    }
  };

  const colors = colorClasses[item.color] || colorClasses.pink;

  return (
    <Card 
      className={`relative overflow-hidden ${colors.bg} ${colors.border} border rounded-2xl p-4 mb-4 cursor-pointer hover:shadow-md transition-all`}
      onClick={() => navigate(item.route)}
    >
      {/* Badge "Bientôt" */}
      {item.daysUntil <= 2 && (
        <div className={`absolute top-2 right-10 ${colors.badge} text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse`}>
          {item.daysUntil === 0 ? "AUJOURD'HUI" : 'BIENTÔT'}
        </div>
      )}

      {/* Bouton fermer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss(item.id);
        }}
        className="absolute top-2 right-2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm"
      >
        <X className="w-3.5 h-3.5 text-slate-400" />
      </button>

      <div className="flex items-center gap-3">
        {/* Icône */}
        <div className={`w-12 h-12 ${colors.badge} rounded-xl flex items-center justify-center shadow-md`}>
          <span className="text-xl">{item.icon}</span>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Bell className={`w-3.5 h-3.5 ${colors.accent}`} />
            <span className={`text-xs font-bold ${colors.text}`}>
              {getTimeLabel(item.daysUntil)}
            </span>
          </div>
          <h3 className="font-bold text-slate-700 text-sm truncate">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3 text-slate-400" />
            <p className="text-xs text-slate-500">
              {formatDate(item.date)}
            </p>
          </div>
        </div>

        {/* Flèche */}
        <ChevronRight className={`w-5 h-5 ${colors.accent}`} />
      </div>

      {/* Nombre d'autres rappels */}
      {visibleItems.length > 1 && (
        <p className="text-[10px] text-slate-400 text-center mt-2">
          +{visibleItems.length - 1} {t('reminders.otherReminders', 'autre(s) rappel(s) cette semaine')}
        </p>
      )}
    </Card>
  );
}

export default UpcomingRemindersCard;

import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function NextReminder() {
  const navigate = useNavigate();
  const [nextReminder, setNextReminder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNextReminder() {
      try {
        const response = await api.medical.getScheduledReminders();
        const list = response.data?.reminders || [];
        
        // Filtrer pour ne garder que les événements futurs
        const now = new Date();
        const upcoming = list
          .filter(r => r.datetime && new Date(r.datetime) > now)
          // Les trier du plus proche au plus lointain
          .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

        if (upcoming.length > 0) {
          setNextReminder(upcoming[0]); // On prend le plus imminent !
        }
      } catch (error) {
        console.error('Erreur chargement prochain rappel accueil:', error);
      } finally {
        setLoading(false);
      }
    }
    loadNextReminder();
  }, []);

  // Si ça charge ou s'il n'y a aucun rappel à venir, on n'affiche RIEN (écran clean)
  if (loading || !nextReminder) return null;

  // Formatage propre de la date (ex: "25 mai à 14:30")
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + 
             ' à ' + 
             d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div 
      onClick={() => navigate('/reminders')} // Redirige vers ta page de rappels
      className="w-full relative overflow-hidden px-5 py-4 cursor-pointer flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 shadow-lg transition-all duration-200 hover:bg-white/20 active:scale-95"
      style={{
        borderRadius: '20px',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="bg-purple-500/20 p-2.5 rounded-xl text-purple-200 flex-shrink-0 animate-pulse">
          <Bell className="w-5 h-5 text-purple-300" />
        </div>
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider leading-none mb-1">
            ⏳ PROCHAIN RAPPEL
          </span>
          <p className="text-base font-bold text-white leading-tight truncate w-full">
            {nextReminder.title || 'Rappel médical'}
          </p>
          <span className="text-xs text-purple-200/80 font-medium mt-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Le {formatDate(nextReminder.datetime)}
          </span>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-white/40 flex-shrink-0 ml-2" />
    </div>
  );
}
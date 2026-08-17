import { useState, useEffect, useCallback } from 'react';
import { X, Heart, Sparkles, Baby } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import api from '../utils/api';
import confetti from 'canvas-confetti';

// 🌟 Forme de cœur pour le feu d'artifice
const heartShape = confetti.shapeFromPath({ 
  path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' 
});

// Celebration Modal for special events
const CelebrationModal = ({ event, onClose }) => {
  useEffect(() => {
    if (event?.celebration) {
      const colors = event.type === 'pregnancy_announcement' 
        ? ['#FFD700', '#FF69B4', '#FFA500', '#FF1493']
        : ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FFE4E1'];
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors
      });
    }
  }, [event]);

  if (!event) return null;

  const getGradient = () => {
    switch (event.type) {
      case 'birthday': return 'from-amber-100 via-pink-50 to-amber-100';
      case 'christmas': return 'from-red-100 via-green-50 to-red-100';
      case 'valentine': return 'from-pink-100 via-rose-50 to-pink-100';
      case 'mothers_day': return 'from-rose-100 via-pink-50 to-rose-100';
      case 'pregnancy_milestone': return 'from-sky-100 via-pink-50 to-sky-100';
      case 'pregnancy_announcement': return 'from-pink-200 via-rose-100 to-pink-200';
      case 'cycle_alert': return 'from-purple-100 via-pink-50 to-purple-100';
      default: return 'from-pink-100 via-white to-pink-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
      <Card className={`bg-gradient-to-br ${getGradient()} p-8 rounded-3xl shadow-2xl max-w-sm text-center relative`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-5xl mb-4">{event.icon}</div>
        
        <h2 className="text-2xl font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {event.title}
        </h2>
        
        <p className="text-slate-600 mb-4 leading-relaxed">
          {event.message}
        </p>
        
        {event.suggestion && (
          <p className="text-sm text-pink-600 italic mb-4">
            {event.suggestion}
          </p>
        )}
        
        <Button 
          onClick={onClose}
          className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full font-bold"
        >
          Merci ! ❤️
        </Button>
      </Card>
    </div>
  );
};

// 🎆 Écran géant de célébration (Feu d'artifice Avatar sécurisé)
const PregnancyAnnouncementCelebration = ({ onComplete }) => {
  useEffect(() => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;

    const pinkHeartsColors = ['#ff85b3', '#ff4d94', '#ffd1e1', '#ffffff'];
    const shimmerColors = ['#FFD700', '#ffffff', '#FFE4E1', '#E2E8F0'];

    // 🌟 Utilisation d'un Intervalle avec nettoyage strict
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const randomX = Math.random() * 0.6 + 0.2;

      // Salves de cœurs alternées gauche / droite
      confetti({
        particleCount: 35,
        startVelocity: 40,
        spread: 70,
        origin: { x: Math.random() > 0.5 ? 0.25 : 0.75, y: 0.6 },
        shapes: [heartShape],
        colors: pinkHeartsColors,
        scalar: 2,
        gravity: 0.8
      });

      // Explosion de scintillements Or et Diamant en hauteur
      if (Math.random() > 0.3) {
        confetti({
          particleCount: 50,
          startVelocity: 50,
          spread: 120,
          origin: { x: randomX, y: Math.floor(Math.random() * 0.2) + 0.3 },
          shapes: ['circle'],
          colors: shimmerColors,
          scalar: 0.6,
          gravity: 1.1,
          ticks: 100
        });
      }
    }, 300);

    const timeout = setTimeout(onComplete, duration);

    // ✨ NETTOYAGE CRUCIAL : Si le composant se ferme, on stoppe TOUT immédiatement
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-500/95 via-rose-400/95 to-amber-400/95 backdrop-blur-md animate-fade-in">
      <div className="text-center p-8">
        <div className="relative">
          <Baby className="w-24 h-24 text-white mx-auto mb-6 animate-bounce" />
          <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-yellow-300 animate-spin" />
          <Heart className="absolute -bottom-2 -left-4 w-10 h-10 text-red-300 animate-pulse" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg" style={{ fontFamily: 'Nunito, sans-serif' }}>
          ✨ Félicitations ! ✨
        </h1>
        
        <p className="text-2xl text-white/90 mb-6">
          Une merveilleuse nouvelle !
        </p>
        
        <p className="text-white/80 max-w-md mx-auto mb-8">
          Une nouvelle aventure commence... 
          MamanDouce t'accompagne dans ce magnifique voyage ! 🌸
        </p>
        
        <Button 
          onClick={onComplete}
          className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
        >
          Commencer l'aventure 🚀
        </Button>
      </div>
    </div>
  );
};

// Main Emotional Intelligence Provider Component
export function EmotionalIntelligenceProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [showPregnancyCelebration, setShowPregnancyCelebration] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/api/emotional/pending-notifications');
      if (res.data.notifications?.length > 0) {
        setNotifications(res.data.notifications);
        setCurrentNotification(res.data.notifications[0]);
      }
    } catch (error) {
      console.log('Emotional notifications check failed');
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000 * 30);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleCloseNotification = async () => {
    if (currentNotification) {
      try {
        await api.post('/api/emotional/mark-celebrated', null, {
          params: { event_type: currentNotification.type }
        });
      } catch (e) {}
    }
    
    const remaining = notifications.slice(1);
    setNotifications(remaining);
    setCurrentNotification(remaining[0] || null);
  };

  return (
    <>
      {children}
      
      {currentNotification && !showPregnancyCelebration && (
        <CelebrationModal 
          event={currentNotification} 
          onClose={handleCloseNotification} 
        />
      )}
      
      {showPregnancyCelebration && (
        <PregnancyAnnouncementCelebration 
          onComplete={() => setShowPregnancyCelebration(false)} 
        />
      )}
    </>
  );
}

export function useEmotionalIntelligence() {
  const announcePregnancy = async () => {
    try {
      const res = await api.post('/api/emotional/pregnancy-announced');
      return res.data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const checkCycleStatus = async () => {
    try {
      const res = await api.cycle.status();
      return res.data;
    } catch (error) {
      return null;
    }
  };

  const checkSpecialDates = async () => {
    try {
      const res = await api.get('/api/emotional/special-dates');
      return res.data;
    } catch (error) {
      return null;
    }
  };

  return {
    announcePregnancy,
    checkCycleStatus,
    checkSpecialDates
  };
}

export default EmotionalIntelligenceProvider;
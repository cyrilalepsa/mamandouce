import { useState, useEffect, useCallback } from 'react';
import { X, Heart, Cake, Gift, Sparkles, PartyPopper, Baby, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import api from '../utils/api';
import confetti from 'canvas-confetti';

// Celebration Modal for special events
const CelebrationModal = ({ event, onClose }) => {
  useEffect(() => {
    if (event?.celebration) {
      // Trigger confetti for celebrations
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
          Merci ! 💕
        </Button>
      </Card>
    </div>
  );
};

// Pregnancy Announcement Celebration (special WAOUH effect)
const PregnancyAnnouncementCelebration = ({ onComplete }) => {
  useEffect(() => {
    // Multiple confetti bursts
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const colors = ['#FFD700', '#FF69B4', '#FFA500', '#FF1493', '#FFB6C1'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    const timeout = setTimeout(onComplete, duration);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-500/90 via-rose-400/90 to-amber-400/90 backdrop-blur-md animate-fade-in">
      <div className="text-center p-8">
        <div className="relative">
          <Baby className="w-24 h-24 text-white mx-auto mb-6 animate-bounce" />
          <Sparkles className="absolute -top-4 -right-4 w-12 h-12 text-yellow-300 animate-spin" />
          <Heart className="absolute -bottom-2 -left-4 w-10 h-10 text-red-300 animate-pulse" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg" style={{ fontFamily: 'Nunito, sans-serif' }}>
          🎉 Félicitations ! 🎉
        </h1>
        
        <p className="text-2xl text-white/90 mb-6">
          Une merveilleuse nouvelle !
        </p>
        
        <p className="text-white/80 max-w-md mx-auto mb-8">
          Une nouvelle aventure commence... 
          MamanDouce t'accompagne dans ce magnifique voyage ! 💕
        </p>
        
        <Button 
          onClick={onComplete}
          className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
        >
          Commencer l'aventure ✨
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

      const res = await api.get('/emotional/pending-notifications');
      if (res.data.notifications?.length > 0) {
        setNotifications(res.data.notifications);
        setCurrentNotification(res.data.notifications[0]);
      }
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.log('Emotional notifications check failed');
    }
  }, []);

  useEffect(() => {
    // Check on mount and periodically
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000 * 30); // Every 30 minutes
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleCloseNotification = async () => {
    if (currentNotification) {
      try {
        await api.post('/emotional/mark-celebrated', null, {
          params: { event_type: currentNotification.type }
        });
      } catch (e) {
        // Silently fail
      }
    }
    
    // Show next notification or close
    const remaining = notifications.slice(1);
    setNotifications(remaining);
    setCurrentNotification(remaining[0] || null);
  };

  const announcePregnancy = async () => {
    try {
      const res = await api.post('/emotional/pregnancy-announced');
      if (res.data.trigger_celebration) {
        setShowPregnancyCelebration(true);
      }
    } catch (error) {
      console.error('Error announcing pregnancy:', error);
    }
  };

  return (
    <>
      {children}
      
      {/* Celebration Modal */}
      {currentNotification && !showPregnancyCelebration && (
        <CelebrationModal 
          event={currentNotification} 
          onClose={handleCloseNotification} 
        />
      )}
      
      {/* Pregnancy Announcement Celebration */}
      {showPregnancyCelebration && (
        <PregnancyAnnouncementCelebration 
          onComplete={() => setShowPregnancyCelebration(false)} 
        />
      )}
    </>
  );
}

// Hook to trigger pregnancy announcement
export function useEmotionalIntelligence() {
  const announcePregnancy = async () => {
    try {
      const res = await api.post('/emotional/pregnancy-announced');
      return res.data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const checkCycleStatus = async () => {
    try {
      const res = await api.get('/emotional/cycle-status');
      return res.data;
    } catch (error) {
      return null;
    }
  };

  const checkSpecialDates = async () => {
    try {
      const res = await api.get('/emotional/special-dates');
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

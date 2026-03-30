import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Smartphone, ChevronRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const LOGIN_COUNT_KEY = 'mamandouce_login_count';
const REMINDER_DISMISSED_KEY = 'mamandouce_push_reminder_dismissed';
const MIN_LOGINS_FOR_REMINDER = 3;

export function PushNotificationReminder() {
  const navigate = useNavigate();
  const [showReminder, setShowReminder] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    checkShouldShowReminder();
  }, []);

  const checkShouldShowReminder = async () => {
    // Vérifier si les notifications push sont supportées
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      return;
    }

    // Vérifier si déjà activées
    if (Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setPushEnabled(true);
          return; // Déjà activé, pas besoin de rappel
        }
      } catch (e) {
        console.log('Error checking push subscription');
      }
    }

    // Vérifier si le rappel a été dismissé
    const dismissed = localStorage.getItem(REMINDER_DISMISSED_KEY);
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now - dismissedDate) / (1000 * 60 * 60 * 24);
      // Ne pas réafficher avant 7 jours
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Vérifier le nombre de connexions
    const loginCount = parseInt(localStorage.getItem(LOGIN_COUNT_KEY) || '0', 10);
    if (loginCount >= MIN_LOGINS_FOR_REMINDER) {
      setShowReminder(true);
    }
  };

  const handleDismiss = () => {
    setShowReminder(false);
    localStorage.setItem(REMINDER_DISMISSED_KEY, new Date().toISOString());
  };

  const handleGoToSettings = () => {
    setShowReminder(false);
    navigate('/settings');
  };

  // Incrémenter le compteur de connexions (appelé depuis AuthPage ou App)
  // Cette fonction est exportée pour être appelée ailleurs
  if (!showReminder || pushEnabled) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl p-4 mb-4 shadow-lg">
      {/* Bouton fermer */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
        data-testid="dismiss-push-reminder"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      <div className="flex items-start gap-3">
        {/* Icône animée */}
        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
          <Bell className="w-6 h-6 text-white animate-bounce" />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm mb-1">
            Ne manquez rien !
          </h3>
          <p className="text-white/90 text-xs leading-relaxed mb-3">
            Activez les notifications pour recevoir vos rappels de RDV et conseils personnalisés, même quand l'app est fermée.
          </p>

          {/* Bouton d'action */}
          <Button
            onClick={handleGoToSettings}
            data-testid="go-to-push-settings"
            className="bg-white text-purple-600 hover:bg-white/90 rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2 shadow-md"
          >
            <Smartphone className="w-4 h-4" />
            Activer les notifications
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Étoiles décoratives */}
      <div className="absolute top-1 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
      <div className="absolute bottom-3 right-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-300" />
    </Card>
  );
}

// Fonction utilitaire pour incrémenter le compteur de connexions
export function incrementLoginCount() {
  const currentCount = parseInt(localStorage.getItem(LOGIN_COUNT_KEY) || '0', 10);
  localStorage.setItem(LOGIN_COUNT_KEY, String(currentCount + 1));
}

// Fonction pour vérifier si les notifications sont activées
export function checkPushEnabled() {
  return new Promise(async (resolve) => {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      resolve(false);
      return;
    }
    
    if (Notification.permission !== 'granted') {
      resolve(false);
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      resolve(!!subscription);
    } catch (e) {
      resolve(false);
    }
  });
}

export default PushNotificationReminder;

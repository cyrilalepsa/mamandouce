import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Bell, BellRing, Calendar, BookOpen, Clock, Smartphone, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

export function PushNotificationsSection({ preferences, setPreferences, onSave }) {
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const [subscribing, setSubscribing] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const checkPushSupport = useCallback(async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
      
      // Check existing subscription
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
        if (sub) {
          setPreferences(prev => ({ ...prev, push_enabled: true }));
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    }
  }, [setPreferences]);

  useEffect(() => {
    checkPushSupport();
  }, [checkPushSupport]);

  const subscribeToPush = async () => {
    if (!pushSupported) {
      toast.error('Les notifications push ne sont pas supportées sur votre appareil');
      return;
    }

    setSubscribing(true);
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission !== 'granted') {
        toast.error('Permission refusée pour les notifications');
        setSubscribing(false);
        return;
      }

      // Get VAPID public key
      let publicKey;
      try {
        const { data: vapidData } = await api.get('/notifications/vapid-public-key');
        publicKey = vapidData.publicKey;
      } catch (vapidError) {
        console.error('VAPID key error:', vapidError);
        toast.error('Erreur de configuration du serveur');
        setSubscribing(false);
        return;
      }

      // Subscribe to push
      let sub;
      try {
        const registration = await navigator.serviceWorker.ready;
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      } catch (subError) {
        console.error('Push subscribe error:', subError);
        // Specific error messages
        if (subError.name === 'NotAllowedError') {
          toast.error('Notifications bloquées. Vérifiez les paramètres de votre navigateur.');
        } else if (subError.name === 'AbortError') {
          toast.error('L\'inscription a été interrompue. Réessayez.');
        } else if (subError.message && subError.message.includes('gcm_sender_id')) {
          toast.error('Configuration serveur manquante. Contactez le support.');
        } else {
          toast.error(`Erreur: ${subError.message || 'Impossible d\'activer les notifications'}`);
        }
        setSubscribing(false);
        return;
      }

      // Send subscription to server
      try {
        await api.post('/notifications/subscribe', {
          subscription: {
            endpoint: sub.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
              auth: arrayBufferToBase64(sub.getKey('auth'))
            }
          }
        });
      } catch (serverError) {
        console.error('Server subscribe error:', serverError);
        // Still mark as enabled locally since the browser is subscribed
      }

      setSubscription(sub);
      setPreferences(prev => ({ ...prev, push_enabled: true }));
      toast.success('Notifications push activées !');
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Erreur lors de l\'activation des notifications');
    } finally {
      setSubscribing(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    setSubscribing(true);
    try {
      await subscription.unsubscribe();
      
      await api.post('/notifications/unsubscribe', {
        subscription: {
          endpoint: subscription.endpoint,
          keys: { p256dh: '', auth: '' }
        }
      });

      setSubscription(null);
      setPreferences(prev => ({ ...prev, push_enabled: false }));
      toast.success('Notifications push désactivées');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Erreur lors de la désactivation');
    } finally {
      setSubscribing(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper functions
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return window.btoa(binary);
  }

  return (
    <div className="space-y-4">
      {/* Activation des notifications push */}
      <Card className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-5 border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-700">Notifications Push</h3>
              <p className="text-sm text-slate-500">
                {!pushSupported 
                  ? 'Non disponible sur cet appareil'
                  : preferences.push_enabled 
                    ? 'Activées sur cet appareil' 
                    : 'Recevez des alertes instantanées'}
              </p>
            </div>
          </div>
          
          {pushSupported && (
            <Button
              onClick={preferences.push_enabled ? unsubscribeFromPush : subscribeToPush}
              disabled={subscribing}
              data-testid="toggle-push-notifications"
              className={`rounded-full px-5 py-2 font-semibold transition-all ${
                preferences.push_enabled
                  ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-lg'
              }`}
            >
              {subscribing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ...
                </span>
              ) : preferences.push_enabled ? (
                <span className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Désactiver
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Activer
                </span>
              )}
            </Button>
          )}
        </div>
        
        {pushPermission === 'denied' && (
          <div className="mt-3 p-3 bg-red-100 rounded-xl text-sm text-red-700">
            Les notifications sont bloquées. Veuillez les autoriser dans les paramètres de votre navigateur.
          </div>
        )}
      </Card>

      {/* Options de notification (visible uniquement si push activé) */}
      {preferences.push_enabled && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm text-slate-500 font-medium px-1">Choisissez vos notifications :</p>
          
          {/* Conseils hebdomadaires */}
          <div
            onClick={() => handleToggle('push_weekly_tips')}
            data-testid="toggle-push-weekly-tips"
            className="flex items-center justify-between p-4 bg-white rounded-2xl cursor-pointer hover:bg-slate-50 border border-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Conseils hebdomadaires</p>
                <p className="text-sm text-slate-500">Chaque semaine, selon votre grossesse</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full flex items-center transition-colors ${
              preferences.push_weekly_tips ? 'bg-teal-400' : 'bg-slate-200'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                preferences.push_weekly_tips ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </div>

          {/* Rappels de rendez-vous */}
          <div
            onClick={() => handleToggle('push_appointment_reminders')}
            data-testid="toggle-push-appointment-reminders"
            className="flex items-center justify-between p-4 bg-white rounded-2xl cursor-pointer hover:bg-slate-50 border border-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Rappels de rendez-vous</p>
                <p className="text-sm text-slate-500">Ne manquez aucun RDV médical</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full flex items-center transition-colors ${
              preferences.push_appointment_reminders ? 'bg-amber-400' : 'bg-slate-200'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                preferences.push_appointment_reminders ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </div>

          {/* Sous-options pour les rappels de RDV */}
          {preferences.push_appointment_reminders && (
            <div className="ml-6 space-y-2 animate-fade-in">
              {/* 24h avant */}
              <div
                onClick={() => handleToggle('push_appointment_24h')}
                data-testid="toggle-push-24h"
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">24h avant le rendez-vous</span>
                </div>
                <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                  preferences.push_appointment_24h ? 'bg-violet-400' : 'bg-slate-200'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    preferences.push_appointment_24h ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
              </div>

              {/* Le jour même */}
              <div
                onClick={() => handleToggle('push_appointment_day')}
                data-testid="toggle-push-day"
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Le jour du rendez-vous</span>
                </div>
                <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                  preferences.push_appointment_day ? 'bg-violet-400' : 'bg-slate-200'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    preferences.push_appointment_day ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
              </div>
            </div>
          )}

          {/* Rappels essai Premium */}
          <div
            onClick={() => handleToggle('push_trial_reminders')}
            data-testid="toggle-push-trial-reminders"
            className="flex items-center justify-between p-4 bg-white rounded-2xl cursor-pointer hover:bg-slate-50 border border-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Rappels fin d'essai</p>
                <p className="text-sm text-slate-500">Avant l'expiration de votre essai Premium</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full flex items-center transition-colors ${
              preferences.push_trial_reminders !== false ? 'bg-purple-400' : 'bg-slate-200'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                preferences.push_trial_reminders !== false ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </div>

          {/* Promotions et actualités */}
          <div
            onClick={() => handleToggle('push_promotions')}
            data-testid="toggle-push-promotions"
            className="flex items-center justify-between p-4 bg-white rounded-2xl cursor-pointer hover:bg-slate-50 border border-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Promotions et actualités</p>
                <p className="text-sm text-slate-500">Offres spéciales et nouveautés</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full flex items-center transition-colors ${
              preferences.push_promotions ? 'bg-pink-400' : 'bg-slate-200'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                preferences.push_promotions ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </div>
        </div>
      )}

      {/* Info box */}
      <Card className="bg-gradient-to-br from-sky-50 to-violet-50 rounded-2xl p-4 border-0">
        <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          À propos des notifications push
        </h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Recevez des alertes même quand l'app est fermée</li>
          <li>• Fonctionne sur mobile et ordinateur</li>
          <li>• Vous pouvez les désactiver à tout moment</li>
          <li>• Aucune donnée personnelle n'est partagée</li>
        </ul>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, User, Baby, Settings, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { isBiometricEnabled, checkBiometricSupport, isPinEnabled } from '../utils/biometricAuth';
import { AccountStatusSection } from '../components/settings';
import {
  SubscriptionStatusCards,
  UserInfoCard,
  PregnancyCard,
  NotificationsCard,
  QuickLoginCard,
  FertilityRemindersCard,
  CollapsibleSection,
  MessagingSection,
  ProfileEditCard
} from '../components/profile';

// Helper function to convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  // Push notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  
  // Biometric login
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  
  // Fertility reminders
  const [fertilityRemindersEnabled, setFertilityRemindersEnabled] = useState(false);
  const [fertilityRemindersLoading, setFertilityRemindersLoading] = useState(false);
  
  // Subscription status
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [fullStatus, setFullStatus] = useState(null);

  useEffect(() => {
    loadUserData();
    checkNotificationStatus();
    setBiometricEnabled(isBiometricEnabled());
    setPinEnabled(isPinEnabled());
    loadFertilityRemindersStatus();
    loadSubscriptionStatus();
    loadFullSubscriptionStatus();
    loadUnreadMessages();
    
    const checkSupport = async () => {
      const support = await checkBiometricSupport();
      setBiometricSupported(support.platformAuthenticator);
    };
    checkSupport();
  }, []);

  const loadUserData = async () => {
    try {
      const userRes = await api.auth.getMe();
      setUser(userRes.data);
      
      const profileRes = await api.pregnancy.getProfile();
      setPregnancyProfile(profileRes.data);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const response = await api.subscription.getStatus();
      setSubscriptionStatus(response.data.subscription_status || 'free');
    } catch (error) {
      console.error('Erreur chargement statut:', error);
    }
  };
  
  const loadFullSubscriptionStatus = async () => {
    try {
      const response = await api.subscription.getFullStatus();
      setFullStatus(response.data);
    } catch (error) {
      console.error('Erreur chargement statut complet:', error);
    }
  };

  const loadUnreadMessages = async () => {
    try {
      const response = await api.contact.getMyMessages();
      const unread = response.data.unread_replies || 0;
      setUnreadMessages(unread);
    } catch (error) {
      console.error('Erreur chargement messages non lus:', error);
    }
  };

  const checkNotificationStatus = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setNotificationsSupported(true);
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setNotificationsEnabled(!!subscription);
      } catch (error) {
        console.error('Error checking notification status:', error);
      }
    }
  };

  const loadFertilityRemindersStatus = async () => {
    try {
      const response = await api.pregnancy.getFertilityRemindersStatus();
      setFertilityRemindersEnabled(response.data.enabled);
    } catch (error) {
      console.error('Error loading fertility reminders status:', error);
    }
  };

  const toggleFertilityReminders = async () => {
    setFertilityRemindersLoading(true);
    try {
      const newStatus = !fertilityRemindersEnabled;
      await api.pregnancy.toggleFertilityReminders(newStatus);
      setFertilityRemindersEnabled(newStatus);
      
      if (newStatus) {
        const windowCheck = await api.pregnancy.checkFertilityWindow();
        if (windowCheck.data.in_fertile_window) {
          toast.success('Rappels activés ! Vous êtes actuellement dans votre période fertile.');
        } else {
          toast.success('Rappels de fertilité activés !');
        }
      } else {
        toast.success('Rappels de fertilité désactivés');
      }
    } catch (error) {
      console.error('Error toggling fertility reminders:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setFertilityRemindersLoading(false);
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsSupported) {
      toast.error('Les notifications ne sont pas supportées sur cet appareil');
      return;
    }

    setNotificationsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (notificationsEnabled) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await api.notifications.unsubscribe({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
              auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
            }
          });
        }
        setNotificationsEnabled(false);
        toast.success('Notifications désactivées');
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error('Permission refusée pour les notifications');
          setNotificationsLoading(false);
          return;
        }

        const vapidResponse = await api.notifications.getVapidKey();
        const vapidKey = urlBase64ToUint8Array(vapidResponse.data.publicKey);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey
        });

        const subscriptionJSON = subscription.toJSON();
        await api.notifications.subscribe({
          endpoint: subscriptionJSON.endpoint,
          keys: {
            p256dh: subscriptionJSON.keys.p256dh,
            auth: subscriptionJSON.keys.auth
          }
        }, user?.email);

        setNotificationsEnabled(true);
        toast.success('Notifications activées ! Vous serez alertée des nouvelles réponses.');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('Erreur lors de la configuration des notifications');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            data-testid="back-button"
            className="bg-white text-sky-500 border border-sky-100 rounded-full p-2 hover:bg-sky-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Mon profil</h1>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-3">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Carte d'édition du profil (Avatar + Nom) */}
            <ProfileEditCard 
              user={user} 
              onUpdate={(updatedUser) => setUser(prev => ({ ...prev, ...updatedUser }))}
            />
            
            {/* Section Mon Compte - Toujours visible en premier */}
            <CollapsibleSection
              title="Mon compte"
              icon={User}
              defaultOpen={true}
              iconBg="bg-gradient-to-br from-purple-100 to-pink-100"
              iconColor="text-purple-600"
              data-testid="account-section"
            >
              <SubscriptionStatusCards 
                subscriptionStatus={subscriptionStatus} 
                fullStatus={fullStatus} 
              />
              <UserInfoCard user={user} formatDate={formatDate} />
              <AccountStatusSection />
            </CollapsibleSection>

            {/* Section Grossesse */}
            <CollapsibleSection
              title="Grossesse & Fertilité"
              icon={Baby}
              defaultOpen={false}
              iconBg="bg-gradient-to-br from-pink-100 to-rose-100"
              iconColor="text-pink-600"
              data-testid="pregnancy-section"
            >
              <PregnancyCard
                pregnancyProfile={pregnancyProfile}
                subscriptionStatus={subscriptionStatus}
                setSubscriptionStatus={setSubscriptionStatus}
                onLoadFullStatus={loadFullSubscriptionStatus}
                formatDate={formatDate}
              />
              <FertilityRemindersCard
                pregnancyProfile={pregnancyProfile}
                fertilityRemindersEnabled={fertilityRemindersEnabled}
                fertilityRemindersLoading={fertilityRemindersLoading}
                onToggle={toggleFertilityReminders}
              />
            </CollapsibleSection>

            {/* Section Paramètres */}
            <CollapsibleSection
              title="Paramètres"
              icon={Settings}
              defaultOpen={false}
              iconBg="bg-gradient-to-br from-slate-100 to-gray-200"
              iconColor="text-slate-600"
              data-testid="settings-section"
            >
              <NotificationsCard
                notificationsSupported={notificationsSupported}
                notificationsEnabled={notificationsEnabled}
                notificationsLoading={notificationsLoading}
                onToggle={toggleNotifications}
              />
              <QuickLoginCard
                biometricEnabled={biometricEnabled}
                biometricSupported={biometricSupported}
                pinEnabled={pinEnabled}
                setBiometricEnabled={setBiometricEnabled}
                setPinEnabled={setPinEnabled}
              />
            </CollapsibleSection>

            {/* Section Messagerie */}
            <CollapsibleSection
              title="Messagerie"
              icon={MessageSquare}
              defaultOpen={false}
              iconBg="bg-gradient-to-br from-sky-100 to-blue-100"
              iconColor="text-sky-600"
              badge={unreadMessages > 0 ? unreadMessages : null}
              data-testid="messaging-section"
            >
              <MessagingSection onMessagesRead={() => setUnreadMessages(0)} />
            </CollapsibleSection>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;

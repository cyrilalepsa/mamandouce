import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, User, Mail, Calendar, MessageSquare, Send, CheckCircle, Clock, ChevronDown, ChevronUp, Inbox, Bell, BellOff, Fingerprint, KeyRound, Heart, Crown, Baby, Check } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { isBiometricEnabled, disableBiometricLogin, checkBiometricSupport, isPinEnabled, disablePinLogin, disableAllQuickLogin } from '../utils/biometricAuth';
import { PregnancyInfoSection } from '../components/settings';

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
  
  // Contact form
  const [showContactForm, setShowContactForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  
  // Message history
  const [myMessages, setMyMessages] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  
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
  
  // Subscription status (for pregnancy info section)
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
    
    // Check biometric support
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
      
      // Load message history
      const messagesRes = await api.contact.getMyMessages();
      setMyMessages(messagesRes.data.messages || []);
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

  const checkNotificationStatus = async () => {
    // Check if push notifications are supported
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
        // Check current fertility window
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
        // Unsubscribe
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
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error('Permission refusée pour les notifications');
          setNotificationsLoading(false);
          return;
        }

        // Get VAPID key from server
        const vapidResponse = await api.notifications.getVapidKey();
        const vapidKey = urlBase64ToUint8Array(vapidResponse.data.publicKey);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey
        });

        // Send subscription to server
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

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    setSending(true);
    try {
      await api.contact.sendMessage({ subject, message });
      setMessageSent(true);
      toast.success('Message envoyé !');
      setSubject('');
      setMessage('');
      
      // Reload messages
      const messagesRes = await api.contact.getMyMessages();
      setMyMessages(messagesRes.data.messages || []);
      
      setTimeout(() => {
        setShowContactForm(false);
        setMessageSent(false);
      }, 2000);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const messagesWithReplies = myMessages.filter(m => m.admin_reply);
  const pendingMessages = myMessages.filter(m => !m.admin_reply);

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
          <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
            <p className="text-slate-500">Chargement...</p>
          </Card>
        ) : (
          <>
            <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100" data-testid="user-info-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-300 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{user?.name}</h2>
                  <p className="text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <Mail className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-semibold text-slate-700">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-xs text-slate-500">Membre depuis</p>
                    <p className="font-semibold text-slate-700">{formatDate(user?.created_at)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Carte Statut Abonnement */}
            <Card className={`rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${
              subscriptionStatus === 'premium' 
                ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' 
                : 'bg-white border-slate-100'
            }`} data-testid="subscription-status-card">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  subscriptionStatus === 'premium'
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-400'
                    : 'bg-gradient-to-br from-slate-300 to-slate-200'
                }`}>
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Statut Premium
                  </h3>
                  <p className={`text-sm font-semibold ${
                    subscriptionStatus === 'premium' ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    {subscriptionStatus === 'premium' ? '✓ Activé' : 'Non activé'}
                  </p>
                </div>
                {subscriptionStatus !== 'premium' && (
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    Activer
                  </Button>
                )}
              </div>
              
              {/* Statut Post-partum */}
              <div className={`rounded-2xl p-4 ${
                fullStatus?.postpartum_unlocked 
                  ? 'bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200' 
                  : fullStatus?.has_postpartum
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                    : 'bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    fullStatus?.postpartum_unlocked
                      ? 'bg-gradient-to-br from-rose-500 to-pink-500'
                      : fullStatus?.has_postpartum
                        ? 'bg-gradient-to-br from-purple-400 to-pink-400'
                        : 'bg-slate-300'
                  }`}>
                    <Baby className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">Suivi Post-partum</p>
                    <p className={`text-xs ${
                      fullStatus?.postpartum_unlocked 
                        ? 'text-rose-600' 
                        : fullStatus?.has_postpartum
                          ? 'text-purple-600'
                          : 'text-slate-500'
                    }`}>
                      {fullStatus?.postpartum_unlocked 
                        ? '✓ Débloqué - Accès activé !' 
                        : fullStatus?.has_postpartum
                          ? '⏳ Acheté - En attente de déblocage'
                          : 'Non acheté'}
                    </p>
                  </div>
                  {fullStatus?.postpartum_unlocked && (
                    <Button
                      onClick={() => navigate('/postpartum')}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full px-3 py-1.5 text-xs font-semibold"
                    >
                      Accéder
                    </Button>
                  )}
                  {!fullStatus?.has_postpartum && (
                    <Button
                      onClick={() => navigate('/pricing')}
                      className="bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-full px-3 py-1.5 text-xs font-semibold"
                    >
                      Acheter 8€
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {pregnancyProfile && (
              <Card className="bg-gradient-to-br from-pink-50 to-sky-50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100" data-testid="pregnancy-info-card">
                <h3 className="text-2xl font-bold text-slate-700 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>Informations de grossesse</h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-sm text-slate-500 font-semibold">Date des dernières règles</p>
                    <p className="text-lg font-bold text-slate-700">{formatDate(pregnancyProfile.last_period_date)}</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-sm text-slate-500 font-semibold">Date de conception estimée</p>
                    <p className="text-lg font-bold text-pink-600">{formatDate(pregnancyProfile.estimated_conception_date)}</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-sm text-slate-500 font-semibold">Date prévue d'accouchement</p>
                    <p className="text-lg font-bold text-rose-600">{formatDate(pregnancyProfile.estimated_due_date)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-2xl p-4">
                    <p className="text-sm text-slate-600 font-semibold">Semaine actuelle</p>
                    <p className="text-3xl font-bold text-slate-700">{pregnancyProfile.current_week} semaines</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Section J'ai accouché (pour les premium) */}
            <PregnancyInfoSection
              subscriptionStatus={subscriptionStatus}
              setSubscriptionStatus={setSubscriptionStatus}
              onLoadFullStatus={loadSubscriptionStatus}
            />

            {/* Notifications Card */}
            {notificationsSupported && (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-amber-100" data-testid="notifications-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notificationsEnabled 
                        ? 'bg-gradient-to-br from-amber-400 to-orange-400' 
                        : 'bg-slate-300'
                    }`}>
                      {notificationsEnabled ? (
                        <Bell className="w-5 h-5 text-white" />
                      ) : (
                        <BellOff className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Notifications</h3>
                      <p className="text-sm text-slate-500">
                        {notificationsEnabled 
                          ? 'Vous recevrez une alerte pour les nouvelles réponses'
                          : 'Activez pour être alertée des réponses'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={toggleNotifications}
                    disabled={notificationsLoading}
                    data-testid="toggle-notifications"
                    className={`rounded-full px-6 py-2 transition-all ${
                      notificationsEnabled
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:opacity-90'
                    }`}
                  >
                    {notificationsLoading ? '...' : notificationsEnabled ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Biometric/PIN Login Card */}
            <Card className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-100" data-testid="biometric-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    biometricEnabled || pinEnabled
                      ? 'bg-gradient-to-br from-pink-400 to-purple-400' 
                      : 'bg-slate-300'
                  }`}>
                    {biometricEnabled ? (
                      <Fingerprint className="w-5 h-5 text-white" />
                    ) : pinEnabled ? (
                      <KeyRound className="w-5 h-5 text-white" />
                    ) : (
                      <Fingerprint className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Connexion rapide</h3>
                    <p className="text-sm text-slate-500">
                      {biometricEnabled 
                        ? 'Empreinte digitale / Face ID activé'
                        : pinEnabled
                          ? 'Code PIN activé'
                          : biometricSupported
                            ? 'Utilisez votre empreinte pour vous connecter'
                            : 'Non disponible sur cet appareil'}
                    </p>
                  </div>
                </div>
                {(biometricEnabled || pinEnabled) && (
                  <Button
                    onClick={() => {
                      disableAllQuickLogin();
                      setBiometricEnabled(false);
                      setPinEnabled(false);
                      toast.success('Connexion rapide désactivée');
                    }}
                    data-testid="disable-quick-login"
                    className="rounded-full px-6 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300"
                  >
                    Désactiver
                  </Button>
                )}
              </div>
              {!biometricEnabled && !pinEnabled && biometricSupported && (
                <p className="mt-3 text-xs text-slate-500 bg-white/50 rounded-xl p-3">
                  Pour activer la connexion par empreinte, déconnectez-vous puis reconnectez-vous. L'option vous sera proposée automatiquement.
                </p>
              )}
              {!biometricEnabled && !pinEnabled && !biometricSupported && (
                <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-xl p-3">
                  Votre appareil ne supporte pas l'authentification biométrique. Déconnectez-vous et reconnectez-vous pour configurer un code PIN rapide.
                </p>
              )}
            </Card>

            {/* Fertility Reminders Card */}
            {pregnancyProfile && (
              <Card className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-100" data-testid="fertility-reminders-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      fertilityRemindersEnabled 
                        ? 'bg-gradient-to-br from-rose-400 to-pink-400' 
                        : 'bg-slate-300'
                    }`}>
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Rappels de fertilité</h3>
                      <p className="text-sm text-slate-500">
                        {fertilityRemindersEnabled 
                          ? 'Notifications activées pour votre fenêtre fertile'
                          : 'Recevez une alerte pendant votre période fertile'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={toggleFertilityReminders}
                    disabled={fertilityRemindersLoading}
                    data-testid="toggle-fertility-reminders"
                    className={`rounded-full px-6 py-2 transition-all ${
                      fertilityRemindersEnabled
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-gradient-to-r from-rose-400 to-pink-400 text-white hover:opacity-90'
                    }`}
                  >
                    {fertilityRemindersLoading ? '...' : fertilityRemindersEnabled ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
                <p className="mt-3 text-xs text-slate-500 bg-white/50 rounded-xl p-3">
                  Vous recevrez une notification quand vous serez dans votre fenêtre de fertilité, avec un rappel spécial le jour de l'ovulation.
                </p>
              </Card>
            )}

            {/* Contact Admin Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100" data-testid="contact-admin-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Contacter l'équipe</h3>
              </div>
              
              {!showContactForm ? (
                <div className="text-center">
                  <p className="text-slate-600 mb-4">Une question, une suggestion ou un problème ?</p>
                  <Button
                    onClick={() => setShowContactForm(true)}
                    data-testid="open-contact-form"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2 hover:opacity-90"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Envoyer un message
                  </Button>
                </div>
              ) : messageSent ? (
                <div className="text-center py-4 animate-fade-in">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-600 font-semibold">Message envoyé avec succès !</p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="text-sm text-slate-600 font-semibold mb-1 block">Sujet</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ex: Question sur les aliments"
                      className="rounded-xl"
                      data-testid="contact-subject"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-semibold mb-1 block">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Décrivez votre question ou suggestion..."
                      className="w-full rounded-xl border border-slate-200 p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-200"
                      data-testid="contact-message"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 bg-slate-200 text-slate-700 rounded-full py-2 hover:bg-slate-300"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={sending}
                      data-testid="send-contact-message"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-2 hover:opacity-90"
                    >
                      {sending ? 'Envoi...' : <><Send className="w-4 h-4 mr-2" />Envoyer</>}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Message History */}
            {myMessages.length > 0 && (
              <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100" data-testid="message-history-card">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-purple-400 rounded-full flex items-center justify-center">
                      <Inbox className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        Mes échanges
                      </h3>
                      <p className="text-sm text-slate-500">
                        {messagesWithReplies.length} réponse(s) • {pendingMessages.length} en attente
                      </p>
                    </div>
                  </div>
                  {showHistory ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {showHistory && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    {myMessages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`rounded-xl border overflow-hidden ${
                          msg.admin_reply ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <button
                          onClick={() => setExpandedMessageId(expandedMessageId === msg.id ? null : msg.id)}
                          className="w-full p-4 text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {msg.admin_reply ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Clock className="w-4 h-4 text-amber-500" />
                                )}
                                <h4 className="font-bold text-slate-700">{msg.subject}</h4>
                              </div>
                              <p className="text-xs text-slate-500">
                                Envoyé le {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              msg.admin_reply 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {msg.admin_reply ? 'Répondu' : 'En attente'}
                            </span>
                          </div>
                        </button>

                        {expandedMessageId === msg.id && (
                          <div className="px-4 pb-4 space-y-3 animate-fade-in">
                            {/* Original message */}
                            <div className="p-3 bg-white rounded-lg border border-slate-200">
                              <p className="text-xs text-slate-500 font-semibold mb-1">Votre message :</p>
                              <p className="text-sm text-slate-700">{msg.message}</p>
                            </div>

                            {/* Admin reply */}
                            {msg.admin_reply ? (
                              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400">
                                <p className="text-xs text-purple-600 font-semibold mb-1">Réponse de l'équipe :</p>
                                <p className="text-sm text-slate-700">{msg.admin_reply}</p>
                                <p className="text-xs text-slate-400 mt-2">
                                  Répondu le {new Date(msg.replied_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            ) : (
                              <div className="p-3 bg-amber-100/50 rounded-lg text-center">
                                <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                <p className="text-sm text-amber-700">En attente de réponse</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;

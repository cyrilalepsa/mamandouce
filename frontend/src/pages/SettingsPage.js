import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Bell, Mail, BookOpen, Calendar, Check, Gift, Crown, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

function SettingsPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    weekly_tips: true,
    appointment_reminders: true,
    email_address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [redeemingCode, setRedeemingCode] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');

  useEffect(() => {
    loadPreferences();
    loadSubscriptionStatus();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await api.preferences.get();
      setPreferences(response.data);
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.preferences.update(preferences);
      toast.success('Préférences enregistrées!');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleRedeemCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Veuillez entrer un code');
      return;
    }
    
    setRedeemingCode(true);
    try {
      const response = await api.subscription.redeemCode(promoCode);
      toast.success(response.data.message);
      setSubscriptionStatus('premium');
      setPromoCode('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Code invalide');
    } finally {
      setRedeemingCode(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Paramètres" />

        {loading ? (
          <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
            <p className="text-slate-500">Chargement...</p>
          </Card>
        ) : (
          <>
            {/* Section Code Promo */}
            <Card className={`rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${
              subscriptionStatus === 'premium' 
                ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' 
                : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  subscriptionStatus === 'premium'
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-br from-pink-500 to-pink-400'
                }`}>
                  {subscriptionStatus === 'premium' ? (
                    <Crown className="w-6 h-6 text-white" />
                  ) : (
                    <Gift className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {subscriptionStatus === 'premium' ? 'Premium activé' : 'Code promo'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {subscriptionStatus === 'premium' 
                      ? 'Vous bénéficiez de l\'accès premium à vie !' 
                      : 'Entrez votre code pour activer le premium'}
                  </p>
                </div>
              </div>

              {subscriptionStatus === 'premium' ? (
                <div className="flex items-center gap-2 p-4 bg-amber-100 rounded-2xl">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <p className="text-amber-800 font-semibold">Merci d'être une beta testeuse !</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="BETA-XXXXX"
                    className="flex-1 rounded-xl border-slate-200 uppercase"
                    data-testid="promo-code-input"
                  />
                  <Button
                    onClick={handleRedeemCode}
                    disabled={redeemingCode}
                    data-testid="redeem-code-button"
                    className="bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-xl px-6 font-semibold"
                  >
                    {redeemingCode ? '...' : 'Activer'}
                  </Button>
                </div>
              )}
            </Card>

            <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-300 rounded-2xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Notifications par email</h2>
                  <p className="text-slate-500">Gérez vos préférences de notifications</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-slate-600 font-semibold">Adresse email</Label>
                  <Input
                    id="email"
                    data-testid="email-address-input"
                    type="email"
                    value={preferences.email_address}
                    onChange={(e) => setPreferences({ ...preferences, email_address: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 bg-white px-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div className="pt-4 space-y-4">
                  {/* Notifications générales */}
                  <div
                    onClick={() => handleToggle('email_notifications')}
                    data-testid="toggle-email-notifications"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-sky-500" />
                      <div>
                        <p className="font-semibold text-slate-700">Notifications par email</p>
                        <p className="text-sm text-slate-500">Recevoir des emails de rappel</p>
                      </div>
                    </div>
                    <div
                      className={`w-14 h-8 rounded-full flex items-center transition-colors ${
                        preferences.email_notifications ? 'bg-sky-400' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          preferences.email_notifications ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Conseils hebdomadaires */}
                  <div
                    onClick={() => handleToggle('weekly_tips')}
                    data-testid="toggle-weekly-tips"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="font-semibold text-slate-700">Conseils hebdomadaires</p>
                        <p className="text-sm text-slate-500">Recevoir les conseils chaque semaine</p>
                      </div>
                    </div>
                    <div
                      className={`w-14 h-8 rounded-full flex items-center transition-colors ${
                        preferences.weekly_tips ? 'bg-teal-400' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          preferences.weekly_tips ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Rappels rendez-vous */}
                  <div
                    onClick={() => handleToggle('appointment_reminders')}
                    data-testid="toggle-appointment-reminders"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-semibold text-slate-700">Rappels de rendez-vous</p>
                        <p className="text-sm text-slate-500">Rappels pour vos rdv médicaux</p>
                      </div>
                    </div>
                    <div
                      className={`w-14 h-8 rounded-full flex items-center transition-colors ${
                        preferences.appointment_reminders ? 'bg-amber-400' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          preferences.appointment_reminders ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSave}
                data-testid="save-preferences-button"
                disabled={saving}
                className="w-full mt-6 bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-sky-200/50 hover:-translate-y-0.5"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
              </Button>
            </Card>

            <Card className="bg-gradient-to-br from-sky-50 to-teal-50 rounded-3xl p-6 border-0">
              <h4 className="font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                <Mail className="inline w-5 h-5 mr-2" />
                À propos des notifications email
              </h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Les emails sont envoyés automatiquement selon vos préférences</li>
                <li>• Vous recevrez un conseil hebdomadaire adapté à votre semaine de grossesse</li>
                <li>• Les rappels de rendez-vous sont envoyés la veille</li>
                <li>• Vous pouvez désactiver les notifications à tout moment</li>
                <li>• Configuration requise : Clé API Resend dans le backend</li>
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;

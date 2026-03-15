import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import {
  PromoCodeSection,
  AccountSection,
  PasswordSection,
  ReferralSection,
  RefundSection,
  PostpartumStatusSection,
  NotificationsSection,
  TwoFactorSection
} from '../components/settings';

function SettingsPage() {
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    weekly_tips: true,
    appointment_reminders: true,
    email_address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [referralStatus, setReferralStatus] = useState(null);
  const [fullStatus, setFullStatus] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    loadPreferences();
    loadSubscriptionStatus();
    loadReferralStatus();
    loadFullSubscriptionStatus();
    loadUserInfo();
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
  
  const loadReferralStatus = async () => {
    try {
      const response = await api.referral.getStatus();
      setReferralStatus(response.data);
    } catch (error) {
      console.error('Erreur chargement parrainages:', error);
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
  
  const loadUserInfo = async () => {
    try {
      const response = await api.auth.me();
      setUserInfo(response.data);
    } catch (error) {
      console.error('Erreur chargement infos utilisateur:', error);
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
            {/* Section Code Promo / Premium */}
            <PromoCodeSection 
              subscriptionStatus={subscriptionStatus}
              setSubscriptionStatus={setSubscriptionStatus}
              onLoadFullStatus={loadFullSubscriptionStatus}
            />
            
            {/* Section Compte - Email */}
            <AccountSection 
              userInfo={userInfo}
              emailAddress={preferences?.email_address}
              onReloadUserInfo={loadUserInfo}
            />
            
            {/* Section Mot de passe */}
            <PasswordSection />
            
            {/* Section 2FA */}
            <TwoFactorSection />
            
            {/* Section Parrainage */}
            <ReferralSection 
              referralStatus={referralStatus}
              onReloadStatus={loadReferralStatus}
            />
            
            {/* Section Post-partum (si éligible) */}
            <PostpartumStatusSection 
              fullStatus={fullStatus}
              subscriptionStatus={subscriptionStatus}
            />
            
            {/* Section Remboursement - Fausse couche */}
            <RefundSection subscriptionStatus={subscriptionStatus} />

            {/* Section Notifications */}
            <NotificationsSection 
              preferences={preferences}
              setPreferences={setPreferences}
              saving={saving}
              onSave={handleSave}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;

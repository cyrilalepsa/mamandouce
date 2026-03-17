import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import { Gift, Shield, Bell, CreditCard, Users, Key, ChevronDown } from 'lucide-react';
import {
  PromoCodeSection,
  AccountSection,
  ReferralSection,
  RefundSection,
  NotificationsSection,
  TwoFactorSection
} from '../components/settings';

// Composant CollapsibleSection pour les paramètres
function CollapsibleSettingsSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  iconBg = "bg-gradient-to-br from-slate-100 to-slate-200",
  iconColor = "text-slate-600"
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <h3 className="font-bold text-slate-700">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 animate-fade-in">
          {children}
        </div>
      )}
    </Card>
  );
}

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
    <div className="min-h-screen gradient-bg p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        <PageHeader title="Paramètres" />

        {loading ? (
          <Card className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-2 text-sm">Chargement...</p>
          </Card>
        ) : (
          <>
            {/* Section Code Promo / Premium */}
            <CollapsibleSettingsSection
              title="Code promo"
              icon={Gift}
              defaultOpen={false}
              iconBg="bg-gradient-to-br from-amber-100 to-orange-100"
              iconColor="text-amber-600"
            >
              <PromoCodeSection 
                subscriptionStatus={subscriptionStatus}
                setSubscriptionStatus={setSubscriptionStatus}
                onLoadFullStatus={loadFullSubscriptionStatus}
              />
            </CollapsibleSettingsSection>
            
            {/* Section Compte - Email et Mot de passe */}
            <CollapsibleSettingsSection
              title="Mon compte"
              icon={Key}
              defaultOpen={false}
              iconBg="bg-gradient-to-br from-blue-100 to-indigo-100"
              iconColor="text-blue-600"
            >
              <AccountSection 
                userInfo={userInfo}
                emailAddress={preferences?.email_address}
                onReloadUserInfo={loadUserInfo}
              />
            </CollapsibleSettingsSection>
            
            {/* Section 2FA */}
            <CollapsibleSettingsSection
              title="Sécurité (2FA)"
              icon={Shield}
              defaultOpen={false}
              iconBg="bg-gradient-to-br from-green-100 to-emerald-100"
              iconColor="text-green-600"
            >
              <TwoFactorSection />
            </CollapsibleSettingsSection>
            
            {/* Section Parrainage */}
            <CollapsibleSettingsSection
              title="Parrainage"
              icon={Users}
              defaultOpen={false}
              iconBg="bg-gradient-to-br from-purple-100 to-pink-100"
              iconColor="text-purple-600"
            >
              <ReferralSection 
                referralStatus={referralStatus}
                onReloadStatus={loadReferralStatus}
              />
            </CollapsibleSettingsSection>
            
            {/* Section Remboursement - Fausse couche */}
            <CollapsibleSettingsSection
              title="Remboursement"
              icon={CreditCard}
              defaultOpen={false}
              iconBg="bg-gradient-to-br from-rose-100 to-red-100"
              iconColor="text-rose-600"
            >
              <RefundSection subscriptionStatus={subscriptionStatus} />
            </CollapsibleSettingsSection>

            {/* Section Notifications */}
            <CollapsibleSettingsSection
              title="Notifications"
              icon={Bell}
              defaultOpen={false}
              iconBg="bg-gradient-to-br from-sky-100 to-cyan-100"
              iconColor="text-sky-600"
            >
              <NotificationsSection 
                preferences={preferences}
                setPreferences={setPreferences}
                saving={saving}
                onSave={handleSave}
              />
            </CollapsibleSettingsSection>
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;

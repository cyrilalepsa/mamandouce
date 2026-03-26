import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import { Gift, Shield, Bell, BellRing, CreditCard, Users, Key, ChevronDown, Moon, Sun, Sparkles, History, Globe } from 'lucide-react';
import { ToggleAllSections } from '../components/ToggleAllSections';
import { useTheme } from '../contexts/ThemeContext';
import { getLatestVersion } from '../data/appUpdates';
import { useTranslation } from 'react-i18next';
import {
  PromoCodeSection,
  AccountSection,
  ReferralSection,
  RefundSection,
  NotificationsSection,
  TwoFactorSection,
  PushNotificationsSection,
  LanguageSelector
} from '../components/settings';

// Composant CollapsibleSection pour les paramètres
function CollapsibleSettingsSection({ 
  title, 
  icon: Icon, 
  children, 
  isOpen,
  onToggle,
  iconBg = "bg-gradient-to-br from-slate-100 to-slate-200",
  iconColor = "text-slate-600"
}) {
  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        onClick={onToggle}
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
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t } = useTranslation();
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
  
  // Gestion des sections ouvertes/fermées
  const [openSections, setOpenSections] = useState({
    language: false,
    appearance: false,
    promo: false,
    account: false,
    security: false,
    referral: false,
    refund: false,
    emailNotifs: false,
    pushNotifs: false
  });
  
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const allOpen = Object.values(openSections).every(Boolean);
  
  const toggleAllSections = (open) => {
    setOpenSections({
      language: open,
      appearance: open,
      promo: open,
      account: open,
      security: open,
      referral: open,
      refund: open,
      emailNotifs: open,
      pushNotifs: open
    });
  };

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
            {/* Toggle All Button */}
            <div className="flex justify-end">
              <ToggleAllSections 
                allOpen={allOpen} 
                onToggle={toggleAllSections}
              />
            </div>
            
            {/* Section Langue */}
            <CollapsibleSettingsSection
              title={t('settings.language')}
              icon={Globe}
              isOpen={openSections.language}
              onToggle={() => toggleSection('language')}
              iconBg="bg-gradient-to-br from-emerald-100 to-teal-100"
              iconColor="text-emerald-600"
            >
              <LanguageSelector />
            </CollapsibleSettingsSection>
            
            {/* Section Apparence - Mode sombre */}
            <CollapsibleSettingsSection
              title="Apparence"
              icon={isDarkMode ? Moon : Sun}
              isOpen={openSections.appearance}
              onToggle={() => toggleSection('appearance')}
              iconBg={isDarkMode ? "bg-gradient-to-br from-slate-700 to-slate-800" : "bg-gradient-to-br from-yellow-100 to-orange-100"}
              iconColor={isDarkMode ? "text-yellow-400" : "text-orange-500"}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">Mode sombre</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Activer le thème sombre pour l'application</p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    data-testid="dark-mode-toggle"
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      isDarkMode ? 'bg-pink-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                    {isDarkMode ? (
                      <Moon className="absolute left-1.5 w-4 h-4 text-slate-600" />
                    ) : (
                      <Sun className="absolute right-1.5 w-4 h-4 text-yellow-500" />
                    )}
                  </button>
                </div>
              </div>
            </CollapsibleSettingsSection>
            
            {/* Section Code Promo / Premium */}
            <CollapsibleSettingsSection
              title="Code promo"
              icon={Gift}
              isOpen={openSections.promo}
              onToggle={() => toggleSection('promo')}
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
              isOpen={openSections.account}
              onToggle={() => toggleSection('account')}
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
              isOpen={openSections.security}
              onToggle={() => toggleSection('security')}
              iconBg="bg-gradient-to-br from-green-100 to-emerald-100"
              iconColor="text-green-600"
            >
              <TwoFactorSection />
            </CollapsibleSettingsSection>
            
            {/* Section Parrainage */}
            <CollapsibleSettingsSection
              title="Parrainage"
              icon={Users}
              isOpen={openSections.referral}
              onToggle={() => toggleSection('referral')}
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
              isOpen={openSections.refund}
              onToggle={() => toggleSection('refund')}
              iconBg="bg-gradient-to-br from-rose-100 to-red-100"
              iconColor="text-rose-600"
            >
              <RefundSection subscriptionStatus={subscriptionStatus} />
            </CollapsibleSettingsSection>

            {/* Section Notifications Email */}
            <CollapsibleSettingsSection
              title="Notifications Email"
              icon={Bell}
              isOpen={openSections.emailNotifs}
              onToggle={() => toggleSection('emailNotifs')}
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

            {/* Section Notifications Push */}
            <CollapsibleSettingsSection
              title="Notifications Push"
              icon={BellRing}
              isOpen={openSections.pushNotifs}
              onToggle={() => toggleSection('pushNotifs')}
              iconBg="bg-gradient-to-br from-violet-100 to-pink-100"
              iconColor="text-violet-600"
            >
              <PushNotificationsSection 
                preferences={preferences}
                setPreferences={setPreferences}
                onSave={handleSave}
              />
            </CollapsibleSettingsSection>
            
            {/* Section Mises à jour */}
            <Card 
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/updates')}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700">Mises à jour</h3>
                    <p className="text-xs text-slate-500">Version {getLatestVersion()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Voir l'historique
                  </span>
                  <History className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;

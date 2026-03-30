import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../utils/api';
import { Cloud, Feather } from 'lucide-react';
import AppTitle from '../components/AppTitle';
import { useTranslation } from 'react-i18next';
import LanguageBubble from '../components/LanguageBubble';
import { 
  isBiometricAvailable,
  authenticateWithBiometric, 
  enableBiometricLogin,
  checkBiometricSupport,
  enablePinLogin,
  authenticateWithPin,
  isQuickLoginAvailable,
  getQuickLoginType
} from '../utils/biometricAuth';
import {
  LoginForm,
  RegisterForm,
  TwoFactorInput,
  ForgotPasswordForm,
  BiometricPrompt,
  PinSetupPrompt,
  PinSetupInput,
  BiometricLoginButton,
  PinLoginSection
} from '../components/auth';
import { incrementLoginCount } from '../components/home/PushNotificationReminder';

function AuthPage({ setIsAuthenticated }) {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showBiometricOption, setShowBiometricOption] = useState(false);
  const [showEnableBiometric, setShowEnableBiometric] = useState(false);
  const [showEnablePin, setShowEnablePin] = useState(false);
  const [isPinSetup, setIsPinSetup] = useState(false);
  const [showPinLogin, setShowPinLogin] = useState(false);
  const [pinValue, setPinValue] = useState('');
  
  // 2FA state
  const [show2FAInput, setShow2FAInput] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pending2FAEmail, setPending2FAEmail] = useState('');
  const [pending2FAPassword, setPending2FAPassword] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkQuickLogin = async () => {
      const loginType = await getQuickLoginType();
      if (loginType === 'biometric') {
        setShowBiometricOption(true);
      } else if (loginType === 'pin') {
        setShowPinLogin(true);
      }
    };
    checkQuickLogin();
  }, []);

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const credentials = await authenticateWithBiometric();
      if (credentials) {
        const response = await api.auth.login({ 
          email: credentials.email, 
          password: credentials.password 
        });
        localStorage.setItem('token', response.data.access_token);
        setIsAuthenticated(true);
        toast.success('Connexion réussie !');
        navigate('/');
      }
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      
      if (error.message === 'Authentification annulée') {
        toast.info('Authentification annulée');
      } else if (status === 423) {
        toast.error(detail || 'Compte temporairement bloqué', { duration: 6000 });
      } else {
        toast.error(detail || error.message || 'Échec de la connexion biométrique');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async () => {
    if (pinValue.length < 4) {
      toast.error('Entrez votre code PIN');
      return;
    }
    
    setLoading(true);
    try {
      const credentials = authenticateWithPin(pinValue);
      if (credentials) {
        const response = await api.auth.login({ 
          email: credentials.email, 
          password: credentials.password 
        });
        localStorage.setItem('token', response.data.access_token);
        setIsAuthenticated(true);
        toast.success('Connexion réussie !');
        navigate('/');
      }
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      
      if (status === 423) {
        toast.error(detail || 'Compte temporairement bloqué', { duration: 6000 });
      } else {
        toast.error(detail || error.message || 'Code PIN incorrect');
      }
      setPinValue('');
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = async (isNewUser = false) => {
    // Incrémenter le compteur de connexions pour le rappel de notifications
    if (!isNewUser) {
      incrementLoginCount();
    }
    
    // Pour les nouveaux utilisateurs, rediriger vers la page d'abonnement
    if (isNewUser) {
      setIsAuthenticated(true);
      toast.success('Inscription réussie ! Choisissez votre formule.');
      navigate('/subscription/checkout?onboarding=true');
      return;
    }
    
    // Pour les utilisateurs existants, vérifier s'ils ont un abonnement
    try {
      const subResponse = await api.subscription.getFullStatus();
      const status = subResponse.data;
      const hasActiveSubscription = status.is_premium || status.postpartum_purchased;
      
      if (!hasActiveSubscription) {
        // Pas d'abonnement, rediriger vers choix
        setIsAuthenticated(true);
        toast.success('Connexion réussie !');
        navigate('/subscription/checkout?onboarding=true');
        return;
      }
    } catch (error) {
      // En cas d'erreur, continuer normalement
    }
    
    if (!isQuickLoginAvailable()) {
      const canUseBiometric = await isBiometricAvailable();
      if (canUseBiometric) {
        setShowEnableBiometric(true);
        setLoading(false);
        return;
      } else {
        setShowEnablePin(true);
        setLoading(false);
        return;
      }
    }
    
    setIsAuthenticated(true);
    toast.success('Connexion réussie!');
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        try {
          const response = await api.auth.login({ email: formData.email, password: formData.password });
          localStorage.setItem('token', response.data.access_token);
        } catch (loginError) {
          if (loginError.response?.status === 403) {
            setPending2FAEmail(formData.email);
            setPending2FAPassword(formData.password);
            setShow2FAInput(true);
            setLoading(false);
            toast.success('Code de vérification envoyé par email');
            return;
          }
          throw loginError;
        }
        await completeLogin(false);
      } else {
        const response = await api.auth.register(formData);
        localStorage.setItem('token', response.data.access_token);
        await completeLogin(true); // Nouveau utilisateur
      }
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      
      if (status === 423) {
        toast.error(detail || 'Compte temporairement bloqué', { duration: 6000 });
      } else {
        toast.error(detail || 'Une erreur est survenue');
      }
      setLoading(false);
    }
  };
  
  const handle2FAVerify = async () => {
    if (twoFactorCode.length !== 6) {
      toast.error('Veuillez entrer le code à 6 chiffres');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.auth.verify2FACode(pending2FAEmail, twoFactorCode, pending2FAPassword);
      localStorage.setItem('token', response.data.access_token);
      setFormData({ ...formData, email: pending2FAEmail, password: pending2FAPassword });
      setShow2FAInput(false);
      await completeLogin();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Code invalide');
      setTwoFactorCode('');
      setLoading(false);
    }
  };

  const handle2FAResend = async () => {
    try {
      await api.auth.request2FACode(pending2FAEmail);
      toast.success('Nouveau code envoyé !');
      setTwoFactorCode('');
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleEnableBiometric = async (enable) => {
    if (enable) {
      const success = await enableBiometricLogin(formData.email, formData.password);
      if (success) {
        toast.success('Connexion rapide activée !');
      }
    } else {
      setShowEnableBiometric(false);
      setShowEnablePin(true);
      return;
    }
    setIsAuthenticated(true);
    navigate('/');
  };

  const handlePinSetupComplete = (pin) => {
    try {
      enablePinLogin(formData.email, formData.password, pin);
      toast.success('Code PIN activé !');
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSkipPinSetup = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.auth.forgotPassword(formData.email);
      setEmailSent(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsForgotPassword(false);
    setEmailSent(false);
    setShowEnableBiometric(false);
    setShowEnablePin(false);
    setIsPinSetup(false);
    setShowPinLogin(false);
    setPinValue('');
    setShow2FAInput(false);
    setTwoFactorCode('');
    setPending2FAEmail('');
    setPending2FAPassword('');
    setFormData({ email: '', password: '', name: '' });
  };

  // Déterminer quel contenu afficher
  const renderContent = () => {
    if (show2FAInput) {
      return (
        <TwoFactorInput
          email={pending2FAEmail}
          code={twoFactorCode}
          setCode={setTwoFactorCode}
          onVerify={handle2FAVerify}
          onResend={handle2FAResend}
          onCancel={resetForm}
          loading={loading}
        />
      );
    }
    
    if (showEnableBiometric) {
      return (
        <BiometricPrompt
          onEnable={handleEnableBiometric}
          onSkip={() => handleEnableBiometric(false)}
        />
      );
    }
    
    if (showEnablePin && !isPinSetup) {
      return (
        <PinSetupPrompt
          onSetup={() => setIsPinSetup(true)}
          onSkip={handleSkipPinSetup}
        />
      );
    }
    
    if (showEnablePin && isPinSetup) {
      return (
        <PinSetupInput
          onComplete={handlePinSetupComplete}
          onSkip={handleSkipPinSetup}
        />
      );
    }
    
    if (isForgotPassword) {
      return (
        <ForgotPasswordForm
          email={formData.email}
          setEmail={(email) => setFormData({ ...formData, email })}
          emailSent={emailSent}
          onSubmit={handleForgotPassword}
          onBack={resetForm}
          loading={loading}
        />
      );
    }
    
    // Formulaire principal de connexion/inscription
    return (
      <>
        {/* Quick Login Options */}
        {showPinLogin && isLogin && (
          <PinLoginSection
            pinValue={pinValue}
            setPinValue={setPinValue}
            onLogin={handlePinLogin}
            loading={loading}
          />
        )}

        {showBiometricOption && isLogin && !showPinLogin && (
          <BiometricLoginButton
            onLogin={handleBiometricLogin}
            loading={loading}
          />
        )}
        
        {isLogin ? (
          <LoginForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
            onForgotPassword={() => setIsForgotPassword(true)}
            onToggleMode={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
            onToggleMode={() => setIsLogin(true)}
          />
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Language Bubble - suit le scroll de la page */}
      <LanguageBubble />
      
      <Cloud className="absolute top-10 left-10 w-32 h-32 text-sky-200 opacity-20 animate-float" />
      <Feather className="absolute top-20 right-20 w-24 h-24 text-pink-200 opacity-30 animate-float-delayed" />
      <Cloud className="absolute bottom-20 right-40 w-40 h-40 text-sky-100 opacity-20 animate-float" />
      <Feather className="absolute bottom-10 left-20 w-20 h-20 text-pink-100 opacity-30 animate-float-delayed" />

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-white/40 relative z-10 animate-fade-in" data-testid="auth-card">
        <div className="text-center mb-8">
          <AppTitle size="xl" showSubtitle={true} className="mb-4" />
        </div>

        {renderContent()}
      </Card>
    </div>
  );
}

export default AuthPage;

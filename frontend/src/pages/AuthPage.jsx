import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api, { formatApiError } from '../utils/api';
import { authApiUrl } from '../utils/backendUrl';
import AppTitle from '../components/AppTitle';
import { useTranslation } from 'react-i18next';
import LanguageBubble from '../components/LanguageBubble';
import { 
  authenticateWithBiometric, 
  enableBiometricLogin,
  enablePinLogin,
  authenticateWithPin,
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
import { withTimeout } from '../utils/backendUrl';
import { destinationAfterAuth } from '../utils/postLogin';
import { useAuth } from '../contexts/AuthContext';

function AuthPage({ setIsAuthenticated }) {
  const { t } = useTranslation();
  const auth = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', city: '' });
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
        await completeLogin(false, response.data);
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
        await completeLogin(false, response.data);
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

  const markAuthenticated = (value) => {
    auth.setAuthenticated(value);
    if (typeof setIsAuthenticated === 'function') setIsAuthenticated(value);
  };

  const completeLogin = async (isNewUser = false, loginPayload = null) => {
    try {
      if (!isNewUser) {
        incrementLoginCount();
      }

      if (loginPayload) {
        auth.ingestUser(loginPayload);
      }

      let user = loginPayload;
      try {
        const me = await withTimeout(api.auth.me(), 8000, 'auth.me');
        user = auth.ingestUser(me.data);
      } catch (error) {
        console.error('[auth] /auth/me après connexion', error);
      }

      markAuthenticated(true);
      toast.success(
        isNewUser
          ? t('auth.registerSuccess', 'Inscription réussie !')
          : t('auth.loginSuccess', 'Connexion réussie !')
      );
      navigate(destinationAfterAuth(user), { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        let response;
        try {
          response = await api.auth.login({ email: formData.email, password: formData.password });
          localStorage.setItem('token', response.data.access_token);
          auth.ingestUser(response.data);
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
        await completeLogin(false, response.data);
      } else {
        const response = await api.auth.register(formData);
        localStorage.setItem('token', response.data.access_token);
        auth.ingestUser(response.data);
        await completeLogin(true, response.data);
      }
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      
      if (status === 423) {
        toast.error(detail || 'Compte temporairement bloqué', { duration: 6000 });
      } else {
        toast.error(detail || 'Une erreur est survenue');
      }
    } finally {
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
      auth.ingestUser(response.data);
      setFormData({ ...formData, email: pending2FAEmail, password: pending2FAPassword });
      setShow2FAInput(false);
      await completeLogin(false, response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Code invalide');
      setTwoFactorCode('');
    } finally {
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
    const email = String(formData.email || "").trim().toLowerCase();
    const url = authApiUrl("forgot-password");
    console.info("[forgot-password] POST", url, { email });

    try {
      const response = await api.auth.forgotPassword(email);
      console.info("[forgot-password] response", response.status, response.data);
      if (response.data?.note) {
        console.warn("[forgot-password] note", response.data.note);
      }
      setEmailSent(true);
      toast.success(response.data?.message || "Email de réinitialisation envoyé !");
    } catch (error) {
      console.error("[forgot-password] error", error.response?.status, error.response?.data || error);
      toast.error(formatApiError(error));
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
    setFormData({ email: '', password: '', name: '', city: '' });
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../utils/api';
import { Cloud, Feather, ArrowLeft, Mail, Fingerprint, KeyRound } from 'lucide-react';
import AppTitle from '../components/AppTitle';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp";
import { 
  isBiometricEnabled, 
  isBiometricAvailable,
  authenticateWithBiometric, 
  enableBiometricLogin,
  checkBiometricSupport,
  isPinEnabled,
  enablePinLogin,
  authenticateWithPin,
  isQuickLoginAvailable,
  getQuickLoginType
} from '../utils/biometricAuth';

function AuthPage({ setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showBiometricOption, setShowBiometricOption] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [showEnableBiometric, setShowEnableBiometric] = useState(false);
  const [showEnablePin, setShowEnablePin] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [confirmPinValue, setConfirmPinValue] = useState('');
  const [isPinSetup, setIsPinSetup] = useState(false);
  const [showPinLogin, setShowPinLogin] = useState(false);
  const [quickLoginType, setQuickLoginType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if quick login is available
    const checkQuickLogin = async () => {
      const support = await checkBiometricSupport();
      setBiometricSupported(support.platformAuthenticator);
      
      const loginType = await getQuickLoginType();
      setQuickLoginType(loginType);
      
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
      // This will trigger the device's biometric prompt (fingerprint/Face ID)
      const credentials = await authenticateWithBiometric();
      
      if (credentials) {
        // Use the credentials to login
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
      console.error('Biometric login error:', error);
      if (error.message === 'Authentification annulée') {
        toast.info('Authentification annulée');
      } else {
        toast.error(error.message || 'Échec de la connexion biométrique');
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
      console.error('PIN login error:', error);
      toast.error(error.message || 'Code PIN incorrect');
      setPinValue('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = isLogin
        ? await api.auth.login({ email: formData.email, password: formData.password })
        : await api.auth.register(formData);

      localStorage.setItem('token', response.data.access_token);
      
      // After successful login, check if we should offer quick login
      if (isLogin && !isQuickLoginAvailable()) {
        // Check if device supports biometric
        const canUseBiometric = await isBiometricAvailable();
        if (canUseBiometric) {
          setShowEnableBiometric(true);
          setLoading(false);
          return;
        } else {
          // Offer PIN as fallback
          setShowEnablePin(true);
          setLoading(false);
          return;
        }
      }
      
      setIsAuthenticated(true);
      toast.success(isLogin ? 'Connexion réussie!' : 'Inscription réussie!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableBiometric = async (enable) => {
    if (enable) {
      const success = await enableBiometricLogin(formData.email, formData.password);
      if (success) {
        toast.success('Connexion rapide activée !');
      }
    } else {
      // Offer PIN as alternative
      setShowEnableBiometric(false);
      setShowEnablePin(true);
      return;
    }
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleEnablePin = (enable) => {
    if (enable) {
      setIsPinSetup(true);
    } else {
      setIsAuthenticated(true);
      navigate('/');
    }
  };

  const handlePinSetup = () => {
    if (pinValue.length < 4) {
      toast.error('Le code PIN doit contenir au moins 4 chiffres');
      return;
    }
    if (pinValue !== confirmPinValue) {
      toast.error('Les codes PIN ne correspondent pas');
      setConfirmPinValue('');
      return;
    }
    
    try {
      enablePinLogin(formData.email, formData.password, pinValue);
      toast.success('Code PIN activé !');
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
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
    setConfirmPinValue('');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      <Cloud className="absolute top-10 left-10 w-32 h-32 text-sky-200 opacity-20 animate-float" />
      <Feather className="absolute top-20 right-20 w-24 h-24 text-pink-200 opacity-30 animate-float-delayed" />
      <Cloud className="absolute bottom-20 right-40 w-40 h-40 text-sky-100 opacity-20 animate-float" />
      <Feather className="absolute bottom-10 left-20 w-20 h-20 text-pink-100 opacity-30 animate-float-delayed" />

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-white/40 relative z-10 animate-fade-in" data-testid="auth-card">
        <div className="text-center mb-8">
          <AppTitle size="xl" showSubtitle={true} className="mb-4" />
        </div>

        {/* Enable Biometric Prompt */}
        {showEnableBiometric ? (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Fingerprint className="w-10 h-10 text-pink-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Connexion rapide</h2>
            <p className="text-slate-500 text-sm mb-6">
              Voulez-vous activer la connexion rapide par empreinte digitale pour vos prochaines visites ?
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => handleEnableBiometric(true)}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full px-6 py-3 font-bold"
              >
                <Fingerprint className="w-5 h-5 mr-2" />
                Oui, activer
              </Button>
              <Button
                onClick={() => handleEnableBiometric(false)}
                variant="outline"
                className="w-full rounded-full px-6 py-3 font-semibold text-slate-600"
              >
                Non, utiliser un code PIN
              </Button>
            </div>
          </div>
        ) : showEnablePin && !isPinSetup ? (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-10 h-10 text-sky-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Code PIN rapide</h2>
            <p className="text-slate-500 text-sm mb-6">
              Créez un code PIN à 4-6 chiffres pour vous connecter rapidement sans mot de passe.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => handleEnablePin(true)}
                className="w-full bg-gradient-to-r from-sky-400 to-teal-400 text-white rounded-full px-6 py-3 font-bold"
              >
                <KeyRound className="w-5 h-5 mr-2" />
                Créer un code PIN
              </Button>
              <Button
                onClick={() => handleEnablePin(false)}
                variant="outline"
                className="w-full rounded-full px-6 py-3 font-semibold text-slate-600"
              >
                Non, plus tard
              </Button>
            </div>
          </div>
        ) : showEnablePin && isPinSetup ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-sky-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">
              {confirmPinValue === '' && pinValue === '' ? 'Créez votre code PIN' : 
               pinValue !== '' && confirmPinValue === '' ? 'Confirmez votre code PIN' : 
               'Codes PIN'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {confirmPinValue === '' && pinValue === '' ? 'Choisissez un code à 4-6 chiffres' : 
               pinValue !== '' && confirmPinValue === '' ? 'Saisissez-le à nouveau' : ''}
            </p>
            <div className="flex justify-center mb-6">
              {pinValue === '' || (pinValue !== '' && confirmPinValue === '') ? (
                <InputOTP
                  maxLength={6}
                  value={pinValue === '' ? pinValue : confirmPinValue}
                  onChange={(value) => {
                    if (pinValue === '') {
                      setPinValue(value);
                    } else {
                      setConfirmPinValue(value);
                    }
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-2xl" />
                  </InputOTPGroup>
                </InputOTP>
              ) : (
                <div className="text-green-500 font-semibold">Codes saisis ✓</div>
              )}
            </div>
            <div className="space-y-3">
              {pinValue !== '' && confirmPinValue !== '' && (
                <Button
                  onClick={handlePinSetup}
                  className="w-full bg-gradient-to-r from-sky-400 to-teal-400 text-white rounded-full px-6 py-3 font-bold"
                >
                  Valider
                </Button>
              )}
              {pinValue !== '' && confirmPinValue === '' && pinValue.length >= 4 && (
                <Button
                  onClick={() => {}}
                  className="w-full bg-gradient-to-r from-sky-400 to-teal-400 text-white rounded-full px-6 py-3 font-bold"
                >
                  Continuer
                </Button>
              )}
              <Button
                onClick={() => {
                  setPinValue('');
                  setConfirmPinValue('');
                  setIsPinSetup(false);
                  setShowEnablePin(false);
                  setIsAuthenticated(true);
                  navigate('/');
                }}
                variant="outline"
                className="w-full rounded-full px-6 py-3 font-semibold text-slate-600"
              >
                Passer cette étape
              </Button>
            </div>
          </div>
        ) : isForgotPassword ? (
          <div className="space-y-5">
            {!emailSent ? (
              <>
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
                
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-pink-500" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-700">Mot de passe oublié ?</h2>
                  <p className="text-slate-500 text-sm mt-2">
                    Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <Label htmlFor="reset-email" className="text-slate-600 font-semibold">Email</Label>
                    <Input
                      id="reset-email"
                      data-testid="reset-email-input"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-2xl border-slate-200 bg-white/80 px-4 py-3 text-slate-600 focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    data-testid="reset-submit-button"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-pink-200/50 hover:-translate-y-0.5"
                  >
                    {loading ? 'Envoi...' : 'Envoyer le lien'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-700 mb-2">Email envoyé !</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Si un compte existe avec l'adresse <strong>{formData.email}</strong>, vous recevrez un email avec les instructions.
                </p>
                <p className="text-slate-400 text-xs mb-6">
                  N'oubliez pas de vérifier vos spams.
                </p>
                <Button
                  onClick={resetForm}
                  className="bg-slate-100 text-slate-600 rounded-full px-6 py-2 font-semibold hover:bg-slate-200"
                >
                  Retour à la connexion
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Login/Register Form */
          <>
            {/* PIN Quick Login */}
            {showPinLogin && isLogin && (
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-8 h-8 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Connexion rapide</h3>
                  <p className="text-slate-500 text-sm">Entrez votre code PIN</p>
                </div>
                <div className="flex justify-center mb-4">
                  <InputOTP
                    maxLength={6}
                    value={pinValue}
                    onChange={(value) => {
                      setPinValue(value);
                      if (value.length >= 4) {
                        // Auto-submit when PIN is complete
                      }
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-11 h-12 text-xl" />
                      <InputOTPSlot index={1} className="w-11 h-12 text-xl" />
                      <InputOTPSlot index={2} className="w-11 h-12 text-xl" />
                      <InputOTPSlot index={3} className="w-11 h-12 text-xl" />
                      <InputOTPSlot index={4} className="w-11 h-12 text-xl" />
                      <InputOTPSlot index={5} className="w-11 h-12 text-xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  onClick={handlePinLogin}
                  disabled={loading || pinValue.length < 4}
                  className="w-full bg-gradient-to-r from-sky-400 to-teal-400 text-white rounded-full px-6 py-3 font-bold shadow-lg hover:shadow-sky-200/50"
                  data-testid="pin-login-button"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-slate-400 text-sm">ou</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>
              </div>
            )}

            {/* Biometric Quick Login Button */}
            {showBiometricOption && isLogin && !showPinLogin && (
              <div className="mb-6">
                <Button
                  onClick={handleBiometricLogin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full px-6 py-4 font-bold shadow-lg hover:shadow-pink-200/50"
                  data-testid="biometric-login-button"
                >
                  <Fingerprint className="w-6 h-6 mr-2" />
                  {loading ? 'Connexion...' : 'Connexion rapide'}
                </Button>
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-slate-400 text-sm">ou</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-slate-600 font-semibold">Nom</Label>
                  <Input
                    id="name"
                    data-testid="name-input"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 bg-white/80 px-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    required={!isLogin}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email" className="text-slate-600 font-semibold">Email</Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-2xl border-slate-200 bg-white/80 px-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-600 font-semibold">Mot de passe</Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-2xl border-slate-200 bg-white/80 px-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  required
                />
              </div>
              
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                    data-testid="forgot-password-link"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
              
              <Button
                type="submit"
                data-testid="submit-button"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-sky-200/50 hover:-translate-y-0.5"
              >
                {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'S\'inscrire'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                data-testid="toggle-auth-mode"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sky-500 hover:text-sky-600 font-semibold"
              >
                {isLogin ? 'Créer un compte' : 'Déjà inscrit ? Se connecter'}
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AuthPage;

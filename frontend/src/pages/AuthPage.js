import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../utils/api';
import { Cloud, Feather, ArrowLeft, Mail } from 'lucide-react';
import AppTitle from '../components/AppTitle';

function AuthPage({ setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = isLogin
        ? await api.auth.login({ email: formData.email, password: formData.password })
        : await api.auth.register(formData);

      localStorage.setItem('token', response.data.access_token);
      setIsAuthenticated(true);
      toast.success(isLogin ? 'Connexion réussie!' : 'Inscription réussie!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setLoading(false);
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

        {/* Forgot Password View */}
        {isForgotPassword ? (
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

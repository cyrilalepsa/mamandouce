import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../utils/api';
import { Lock, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import AppTitle from '../components/AppTitle';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [isValidToken, setIsValidToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setIsValidToken(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await api.auth.verifyResetToken(token);
      setIsValidToken(true);
      setUserEmail(response.data.email);
    } catch (error) {
      setIsValidToken(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.auth.resetPassword(token, password);
      setSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-white/40 relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <AppTitle size="xl" showSubtitle={true} className="mb-4" />
        </div>

        {/* Loading state */}
        {isValidToken === null && (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Vérification du lien...</p>
          </div>
        )}

        {/* Invalid token */}
        {isValidToken === false && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Lien invalide ou expiré</h2>
            <p className="text-slate-500 text-sm mb-6">
              Ce lien de réinitialisation n'est plus valide. Veuillez en demander un nouveau.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full px-6 py-2 font-semibold"
            >
              Retour à la connexion
            </Button>
          </div>
        )}

        {/* Success state */}
        {success && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Mot de passe modifié !</h2>
            <p className="text-slate-500 text-sm mb-6">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full px-6 py-2 font-semibold"
            >
              Se connecter
            </Button>
          </div>
        )}

        {/* Reset form */}
        {isValidToken === true && !success && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-pink-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-700">Nouveau mot de passe</h2>
              <p className="text-slate-500 text-sm mt-2">
                Créez un nouveau mot de passe pour <strong>{userEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="new-password" className="text-slate-600 font-semibold">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border-slate-200 bg-white/80 px-4 py-3 pr-12 text-slate-600 focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                    placeholder="Minimum 6 caractères"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirm-password" className="text-slate-600 font-semibold">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border-slate-200 bg-white/80 px-4 py-3 text-slate-600 focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                  placeholder="Répétez le mot de passe"
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={loading || password !== confirmPassword}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-pink-200/50 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ResetPasswordPage;

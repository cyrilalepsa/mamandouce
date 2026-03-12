import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import api from '../utils/api';
import { Cloud, Feather } from 'lucide-react';

function AuthPage({ setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      <Cloud className="absolute top-10 left-10 w-32 h-32 text-sky-200 opacity-20 animate-float" />
      <Feather className="absolute top-20 right-20 w-24 h-24 text-pink-200 opacity-30 animate-float-delayed" />
      <Cloud className="absolute bottom-20 right-40 w-40 h-40 text-sky-100 opacity-20 animate-float" />
      <Feather className="absolute bottom-10 left-20 w-20 h-20 text-pink-100 opacity-30 animate-float-delayed" />

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-white/40 relative z-10 animate-fade-in" data-testid="auth-card">
        <div className="text-center mb-8">
          <img 
            src="/logo-mamandouce.png" 
            alt="MamanDouce" 
            className="w-full max-w-sm mx-auto mb-4"
          />
          <p className="text-slate-500">Votre compagnon de grossesse</p>
        </div>

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
      </Card>
    </div>
  );
}

export default AuthPage;

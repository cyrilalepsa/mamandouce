import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function RegisterForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  loading, 
  onToggleMode 
}) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="name" className="text-slate-600 font-semibold">Nom</Label>
          <Input
            id="name"
            data-testid="name-input"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-2xl border-slate-200 bg-white/80 px-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            required
          />
        </div>
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
          {loading ? 'Chargement...' : "S'inscrire"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          data-testid="toggle-auth-mode"
          onClick={onToggleMode}
          className="text-sky-500 hover:text-sky-600 font-semibold"
        >
          Déjà inscrit ? Se connecter
        </button>
      </div>
    </>
  );
}

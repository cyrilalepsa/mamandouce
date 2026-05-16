import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Eye, EyeOff, MapPin, Calendar, Heart, Baby } from 'lucide-react';

export function RegisterForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  loading, 
  onToggleMode 
}) {
  const [showPassword, setShowPassword] = useState(false);

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
        
        {/* Date de naissance - Style Nuage/Nacre */}
        <div>
          <Label htmlFor="birth_date" className="text-slate-600 font-semibold">Date de naissance</Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400">
              <Calendar className="w-5 h-5" />
            </div>
            <Input
              id="birth_date"
              data-testid="birth-date-input"
              type="date"
              value={formData.birth_date || ''}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="w-full rounded-2xl border-pink-200/60 bg-gradient-to-r from-white/90 via-pink-50/50 to-white/90 pl-12 pr-4 py-3 text-slate-600 focus:border-pink-300 focus:ring-4 focus:ring-pink-100/50 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(236,72,153,0.1)]"
            />
          </div>
        </div>
        
        {/* Statut - Envie de bébé / Enceinte */}
        <div>
          <Label className="text-slate-600 font-semibold mb-3 block">Votre situation</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              data-testid="status-envie-bebe"
              onClick={() => setFormData({ ...formData, status: 'envie_bebe' })}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                formData.status === 'envie_bebe'
                  ? 'border-pink-400 bg-gradient-to-br from-pink-100 via-pink-50 to-white shadow-lg scale-[1.02]'
                  : 'border-slate-200 bg-white/80 hover:border-pink-200 hover:bg-pink-50/30'
              }`}
            >
              <Heart className={`w-8 h-8 mx-auto mb-2 ${formData.status === 'envie_bebe' ? 'text-pink-500' : 'text-slate-400'}`} />
              <span className={`block text-sm font-medium ${formData.status === 'envie_bebe' ? 'text-pink-600' : 'text-slate-500'}`}>
                Envie de bébé
              </span>
              {formData.status === 'envie_bebe' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
            
            <button
              type="button"
              data-testid="status-enceinte"
              onClick={() => setFormData({ ...formData, status: 'enceinte' })}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                formData.status === 'enceinte'
                  ? 'border-sky-400 bg-gradient-to-br from-sky-100 via-sky-50 to-white shadow-lg scale-[1.02]'
                  : 'border-slate-200 bg-white/80 hover:border-sky-200 hover:bg-sky-50/30'
              }`}
            >
              <Baby className={`w-8 h-8 mx-auto mb-2 ${formData.status === 'enceinte' ? 'text-sky-500' : 'text-slate-400'}`} />
              <span className={`block text-sm font-medium ${formData.status === 'enceinte' ? 'text-sky-600' : 'text-slate-500'}`}>
                Enceinte
              </span>
              {formData.status === 'enceinte' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          </div>
        </div>
        
        {/* Champ City - Style Nuage/Nacre avec icône */}
        <div>
          <Label htmlFor="city" className="text-slate-600 font-semibold">Ville</Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400">
              <MapPin className="w-5 h-5" />
            </div>
            <Input
              id="city"
              data-testid="city-input"
              type="text"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Où se trouve votre cocon ?"
              className="w-full rounded-2xl border-sky-200/60 bg-gradient-to-r from-white/90 via-sky-50/50 to-white/90 pl-12 pr-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100/50 placeholder:text-sky-300/80 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(135,206,250,0.1)]"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="password" className="text-slate-600 font-semibold">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              data-testid="password-input"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-2xl border-slate-200 bg-white/80 px-4 py-3 pr-12 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              data-testid="toggle-password-visibility"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Bouton d'inscription - Style Cloud 3D Bleu */}
        <Button
          type="submit"
          data-testid="submit-button"
          disabled={loading}
          className="btn-cloud-3d-blue w-full text-white rounded-full px-8 py-3 font-bold"
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

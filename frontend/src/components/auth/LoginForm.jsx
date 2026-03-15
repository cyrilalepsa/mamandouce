import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function LoginForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  loading, 
  onForgotPassword,
  onToggleMode 
}) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
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
        
        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-pink-500 hover:text-pink-600 text-sm font-medium"
            data-testid="forgot-password-link"
          >
            Mot de passe oublié ?
          </button>
        </div>
        
        <Button
          type="submit"
          data-testid="submit-button"
          disabled={loading}
          className="w-full bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-sky-200/50 hover:-translate-y-0.5"
        >
          {loading ? 'Chargement...' : 'Se connecter'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          data-testid="toggle-auth-mode"
          onClick={onToggleMode}
          className="text-sky-500 hover:text-sky-600 font-semibold"
        >
          Créer un compte
        </button>
      </div>
    </>
  );
}

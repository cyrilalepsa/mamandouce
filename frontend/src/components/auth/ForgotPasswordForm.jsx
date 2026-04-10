import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Mail } from 'lucide-react';

export function ForgotPasswordForm({ 
  email,
  setEmail,
  emailSent,
  onSubmit,
  onBack,
  loading 
}) {
  if (emailSent) {
    return (
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Email envoyé !</h2>
        <p className="text-slate-500 text-sm mb-4">
          Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec les instructions.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-amber-800 text-sm font-semibold mb-2">Vous ne recevez pas l'email ?</p>
          <ul className="text-amber-700 text-xs space-y-1">
            <li>• Vérifiez votre dossier <strong>Spam/Courrier indésirable</strong></li>
            <li>• L'email peut prendre quelques minutes à arriver</li>
            <li>• Vérifiez que l'adresse email est correcte</li>
            <li>• Si le problème persiste, contactez le support</li>
          </ul>
        </div>
        <Button
          onClick={onBack}
          className="bg-slate-100 text-slate-600 rounded-full px-6 py-2 font-semibold hover:bg-slate-200"
        >
          Retour à la connexion
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
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

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="reset-email" className="text-slate-600 font-semibold">Email</Label>
          <Input
            id="reset-email"
            data-testid="reset-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
    </div>
  );
}

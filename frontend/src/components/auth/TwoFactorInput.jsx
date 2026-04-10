import { Button } from '../ui/button';
import { Mail } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";

export function TwoFactorInput({ 
  email,
  code,
  setCode,
  onVerify,
  onResend,
  onCancel,
  loading 
}) {
  return (
    <div className="text-center py-4" data-testid="2fa-input-section">
      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Mail className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-700 mb-2">Vérification en 2 étapes</h2>
      <p className="text-slate-500 text-sm mb-6">
        Un code à 6 chiffres a été envoyé à<br/>
        <span className="font-semibold text-slate-700">{email}</span>
      </p>
      
      <div className="flex justify-center mb-6">
        <InputOTP
          value={code}
          onChange={setCode}
          maxLength={6}
          data-testid="2fa-code-input"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
            <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
            <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
            <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
            <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
            <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
          </InputOTPGroup>
        </InputOTP>
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={onVerify}
          disabled={loading || code.length !== 6}
          data-testid="2fa-verify-button"
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full py-3 font-semibold"
        >
          {loading ? 'Vérification...' : 'Vérifier le code'}
        </Button>
        <Button
          onClick={onResend}
          className="w-full bg-slate-100 text-slate-600 rounded-full py-2"
        >
          Renvoyer le code
        </Button>
        <Button
          onClick={onCancel}
          className="w-full text-slate-400 text-sm"
        >
          Annuler
        </Button>
      </div>
      
      <p className="text-xs text-slate-400 mt-4">
        Le code expire dans 10 minutes
      </p>
    </div>
  );
}

import { Button } from '../ui/button';
import { Fingerprint, KeyRound } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";

export function BiometricLoginButton({ onLogin, loading }) {
  return (
    <div className="mb-6">
      <Button
        onClick={onLogin}
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
  );
}

export function PinLoginSection({ pinValue, setPinValue, onLogin, loading }) {
  return (
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
          onChange={setPinValue}
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
        onClick={onLogin}
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
  );
}

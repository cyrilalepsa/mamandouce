import { useState } from 'react';
import { Button } from '../ui/button';
import { KeyRound } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";

export function PinSetupPrompt({ onSetup, onSkip }) {
  return (
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
          onClick={onSetup}
          className="w-full bg-gradient-to-r from-sky-400 to-teal-400 text-white rounded-full px-6 py-3 font-bold"
        >
          <KeyRound className="w-5 h-5 mr-2" />
          Créer un code PIN
        </Button>
        <Button
          onClick={onSkip}
          variant="outline"
          className="w-full rounded-full px-6 py-3 font-semibold text-slate-600"
        >
          Non, plus tard
        </Button>
      </div>
    </div>
  );
}

export function PinSetupInput({ onComplete, onSkip }) {
  const [pinValue, setPinValue] = useState('');
  const [confirmPinValue, setConfirmPinValue] = useState('');
  const [step, setStep] = useState(1); // 1 = enter PIN, 2 = confirm PIN

  const handlePinChange = (value) => {
    if (step === 1) {
      setPinValue(value);
      if (value.length >= 4) {
        setTimeout(() => setStep(2), 300);
      }
    } else {
      setConfirmPinValue(value);
    }
  };

  const handleValidate = () => {
    if (pinValue !== confirmPinValue) {
      setConfirmPinValue('');
      setStep(1);
      setPinValue('');
      return false;
    }
    onComplete(pinValue);
    return true;
  };

  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <KeyRound className="w-8 h-8 text-sky-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-700 mb-2">
        {step === 1 ? 'Créez votre code PIN' : 'Confirmez votre code PIN'}
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        {step === 1 ? 'Choisissez un code à 4-6 chiffres' : 'Saisissez-le à nouveau'}
      </p>
      <div className="flex justify-center mb-6">
        <InputOTP
          maxLength={6}
          value={step === 1 ? pinValue : confirmPinValue}
          onChange={handlePinChange}
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
      </div>
      <div className="space-y-3">
        {step === 2 && confirmPinValue.length >= 4 && (
          <Button
            onClick={handleValidate}
            className="w-full bg-gradient-to-r from-sky-400 to-teal-400 text-white rounded-full px-6 py-3 font-bold"
          >
            Valider
          </Button>
        )}
        <Button
          onClick={onSkip}
          variant="outline"
          className="w-full rounded-full px-6 py-3 font-semibold text-slate-600"
        >
          Passer cette étape
        </Button>
      </div>
    </div>
  );
}

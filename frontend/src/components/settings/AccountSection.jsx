import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Mail, Edit2 } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function AccountSection({ userInfo, emailAddress, onReloadUserInfo }) {
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);

  const handleEmailChange = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }
    
    setChangingEmail(true);
    try {
      await api.auth.updateEmail(newEmail);
      toast.success('Adresse email mise à jour !');
      setShowEmailChange(false);
      setNewEmail('');
      onReloadUserInfo?.();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors du changement');
    } finally {
      setChangingEmail(false);
    }
  };

  return (
    <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-400 rounded-2xl flex items-center justify-center">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Mon compte
          </h2>
          <p className="text-slate-500 text-sm">
            Votre compte est lié à votre adresse email
          </p>
        </div>
      </div>
      
      <div className="bg-slate-50 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">Adresse email actuelle</p>
            <p className="font-semibold text-slate-700">{userInfo?.email || emailAddress || '...'}</p>
          </div>
          {!showEmailChange && (
            <Button
              onClick={() => setShowEmailChange(true)}
              data-testid="change-email-button"
              className="bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-full px-4 py-2 text-sm"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Modifier
            </Button>
          )}
        </div>
        
        {showEmailChange && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Nouvelle adresse email</label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nouvelle@email.com"
                className="rounded-xl border-sky-200"
                data-testid="new-email-input"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowEmailChange(false);
                  setNewEmail('');
                }}
                className="flex-1 bg-slate-100 text-slate-600 rounded-full py-2"
              >
                Annuler
              </Button>
              <Button
                onClick={handleEmailChange}
                disabled={changingEmail}
                data-testid="save-email-button"
                className="flex-1 bg-sky-500 text-white rounded-full py-2"
              >
                {changingEmail ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-slate-400 mt-3">
        Votre abonnement et vos données sont liés à votre adresse email, pas à votre carte bancaire.
      </p>
    </Card>
  );
}

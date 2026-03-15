import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { User, Mail, Key, Edit2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function AccountSection({ userInfo, emailAddress, onReloadUserInfo }) {
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

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

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      toast.error('Veuillez entrer votre mot de passe actuel');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    setChangingPassword(true);
    try {
      await api.auth.updatePassword(currentPassword, newPassword);
      toast.success('Mot de passe mis à jour !');
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors du changement');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-400 rounded-2xl flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Mon compte
          </h2>
          <p className="text-slate-500 text-sm">
            Gérer votre email et votre mot de passe
          </p>
        </div>
      </div>
      
      {/* Section Email */}
      <div className="bg-slate-50 rounded-2xl p-4 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-sky-500" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Adresse email</p>
              <p className="font-semibold text-slate-700">{userInfo?.email || emailAddress || '...'}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowEmailChange(!showEmailChange)}
            data-testid="change-email-button"
            className="bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-full px-3 py-1.5 text-sm"
          >
            {showEmailChange ? <ChevronUp className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </Button>
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
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowEmailChange(false);
                  setNewEmail('');
                }}
                className="flex-1 bg-slate-100 text-slate-600 rounded-full py-2 text-sm"
              >
                Annuler
              </Button>
              <Button
                onClick={handleEmailChange}
                disabled={changingEmail}
                data-testid="save-email-button"
                className="flex-1 bg-sky-500 text-white rounded-full py-2 text-sm"
              >
                {changingEmail ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Section Mot de passe */}
      <div className="bg-slate-50 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-violet-500" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Mot de passe</p>
              <p className="font-semibold text-slate-700">••••••••</p>
            </div>
          </div>
          <Button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            data-testid="change-password-button"
            className="bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-full px-3 py-1.5 text-sm"
          >
            {showPasswordChange ? <ChevronUp className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </Button>
        </div>
        
        {showPasswordChange && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Mot de passe actuel</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl border-violet-200"
                data-testid="current-password-input"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Nouveau mot de passe</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="rounded-xl border-violet-200"
                data-testid="new-password-input"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Confirmer le mot de passe</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez le nouveau mot de passe"
                className="rounded-xl border-violet-200"
                data-testid="confirm-password-input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowPasswordChange(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 bg-slate-100 text-slate-600 rounded-full py-2 text-sm"
              >
                Annuler
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={changingPassword}
                data-testid="save-password-button"
                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full py-2 text-sm"
              >
                {changingPassword ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-slate-400 mt-3">
        Votre compte sera verrouillé après 4 tentatives de connexion échouées.
      </p>
    </Card>
  );
}

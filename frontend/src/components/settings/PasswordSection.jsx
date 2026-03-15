import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Key } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function PasswordSection() {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

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
        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-400 rounded-2xl flex items-center justify-center">
          <Key className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Mot de passe
          </h2>
          <p className="text-slate-500 text-sm">
            Modifier votre mot de passe de connexion
          </p>
        </div>
      </div>
      
      {!showPasswordChange ? (
        <Button
          onClick={() => setShowPasswordChange(true)}
          data-testid="change-password-button"
          className="w-full bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-full py-3 font-semibold"
        >
          <Key className="w-4 h-4 mr-2" />
          Modifier le mot de passe
        </Button>
      ) : (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 space-y-4">
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
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowPasswordChange(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="flex-1 bg-slate-100 text-slate-600 rounded-full py-2"
            >
              Annuler
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={changingPassword}
              data-testid="save-password-button"
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full py-2"
            >
              {changingPassword ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      )}
      
      <p className="text-xs text-slate-400 mt-3">
        Votre compte sera verrouillé après 4 tentatives de connexion échouées pour des raisons de sécurité.
      </p>
    </Card>
  );
}

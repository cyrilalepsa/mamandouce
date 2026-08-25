import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mail, MapPin, User, Users } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import {
  buildFullName,
  normalizeChildrenAtHome,
  splitUserName,
} from '../../utils/userProfile';

export function PersonalFamilyInfoSection({ userInfo, onReloadUserInfo }) {
  const { ingestUser } = useAuth();
  const initialNames = splitUserName(userInfo);

  const [firstName, setFirstName] = useState(initialNames.firstName);
  const [lastName, setLastName] = useState(initialNames.lastName);
  const [city, setCity] = useState(userInfo?.city || '');
  const [childrenAtHome, setChildrenAtHome] = useState(
    String(userInfo?.children_at_home ?? 0)
  );
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const names = splitUserName(userInfo);
    setFirstName(names.firstName);
    setLastName(names.lastName);
    setCity(userInfo?.city || '');
    setChildrenAtHome(String(userInfo?.children_at_home ?? 0));
  }, [userInfo]);

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

  const handleSave = async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedCity = city.trim();

    if (!trimmedFirst) {
      toast.error('Le prénom est requis');
      return;
    }

    const parsedChildren = normalizeChildrenAtHome(childrenAtHome);

    setSaving(true);
    try {
      const response = await api.auth.updateProfile({
        first_name: trimmedFirst,
        last_name: trimmedLast,
        city: trimmedCity || null,
        children_at_home: parsedChildren,
      });

      if (response.data?.user) {
        ingestUser(response.data.user);
      } else {
        ingestUser({
          ...userInfo,
          first_name: trimmedFirst,
          last_name: trimmedLast,
          name: buildFullName(trimmedFirst, trimmedLast),
          city: trimmedCity || null,
          children_at_home: parsedChildren,
        });
      }

      toast.success('Informations mises à jour');
      onReloadUserInfo?.();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="personal-family-info-section">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-slate-600 mb-1 block">Prénom</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            data-testid="profile-first-name-input"
            className="rounded-xl border-sky-200"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600 mb-1 block">Nom</label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            data-testid="profile-last-name-input"
            className="rounded-xl border-sky-200"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Mail className="w-5 h-5 text-sky-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Adresse e-mail</p>
              <p className="font-semibold text-slate-700 truncate">{userInfo?.email}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowEmailChange(!showEmailChange)}
            data-testid="profile-change-email-button"
            className="bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-full px-3 py-1.5 text-sm"
          >
            Modifier
          </Button>
        </div>
        {showEmailChange && (
          <div className="mt-3 space-y-2">
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Nouvelle adresse email"
              data-testid="profile-new-email-input"
              className="rounded-xl"
            />
            <Button
              onClick={handleEmailChange}
              disabled={changingEmail}
              className="w-full rounded-full bg-sky-500 text-white"
            >
              {changingEmail ? 'Mise à jour…' : 'Confirmer le nouvel email'}
            </Button>
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-600 mb-1 block">Ville</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            data-testid="profile-city-input"
            placeholder="Votre ville"
            className="rounded-xl border-sky-200 pl-10"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-600 mb-1 block">
          Enfants à charge
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
          <Input
            type="number"
            min={0}
            max={20}
            value={childrenAtHome}
            onChange={(e) => setChildrenAtHome(e.target.value)}
            data-testid="profile-children-at-home-input"
            className="rounded-xl border-violet-200 pl-10"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Utilisé pour le calcul de votre congé maternité.
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        data-testid="personal-family-info-save"
        className="w-full rounded-full text-white"
        style={{ background: 'linear-gradient(145deg, #38bdf8, #0ea5e9)' }}
      >
        <User className="w-4 h-4 mr-2" />
        {saving ? 'Enregistrement…' : 'Enregistrer les informations'}
      </Button>
    </div>
  );
}

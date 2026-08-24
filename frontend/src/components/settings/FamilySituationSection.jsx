import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Users } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { normalizeMultiplePregnancy } from '../../utils/maternityLeave';

export function FamilySituationSection({ userInfo, onReloadUserInfo }) {
  const { ingestUser } = useAuth();
  const [childrenAtHome, setChildrenAtHome] = useState(
    String(userInfo?.children_at_home ?? 0)
  );
  const [multiplePregnancy, setMultiplePregnancy] = useState(
    normalizeMultiplePregnancy(userInfo?.multiple_pregnancy)
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsed = parseInt(childrenAtHome, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      toast.error('Le nombre d\'enfants à charge doit être un nombre positif ou zéro');
      return;
    }

    setSaving(true);
    try {
      const response = await api.auth.updateProfile({
        children_at_home: parsed,
        multiple_pregnancy: multiplePregnancy,
      });
      if (response.data?.user) {
        ingestUser(response.data.user);
      }
      toast.success('Situation familiale mise à jour');
      onReloadUserInfo?.();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="family-situation-section">
      <p className="text-sm text-slate-600">
        Ces informations permettent d&apos;estimer précisément les dates de votre congé maternité.
      </p>

      <div>
        <label className="text-sm font-semibold text-slate-600 mb-1 block">
          Enfants déjà à charge
        </label>
        <Input
          type="number"
          min={0}
          max={20}
          value={childrenAtHome}
          onChange={(e) => setChildrenAtHome(e.target.value)}
          data-testid="children-at-home-input"
          className="rounded-xl border-violet-200"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-600 mb-1 block">
          Grossesse multiple
        </label>
        <select
          value={multiplePregnancy}
          onChange={(e) => setMultiplePregnancy(e.target.value)}
          data-testid="multiple-pregnancy-select"
          className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-slate-700"
        >
          <option value="none">Grossesse unique</option>
          <option value="twins">Jumeaux</option>
          <option value="triplets_or_more">Triplés ou +</option>
        </select>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        data-testid="family-situation-save"
        className="w-full rounded-full text-white"
        style={{ background: 'linear-gradient(145deg, #a78bfa, #7c3aed)' }}
      >
        <Users className="w-4 h-4 mr-2" />
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </div>
  );
}

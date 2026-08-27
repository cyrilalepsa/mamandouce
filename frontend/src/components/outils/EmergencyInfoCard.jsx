import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Share2, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { toast } from 'sonner';

const STORAGE_KEY = 'mamandouce_emergency_birth_info';

const DEFAULT_FORM = {
  motherName: '',
  dueDate: '',
  bloodGroup: '',
  allergies: '',
  hospital: '',
  midwifePhone: '',
  partnerName: '',
  partnerPhone: '',
  pediatrician: '',
  specialNotes: '',
};

function loadForm() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_FORM, ...JSON.parse(raw) } : { ...DEFAULT_FORM };
  } catch {
    return { ...DEFAULT_FORM };
  }
}

function buildExportText(form, t) {
  return [
    t('outils.emergency.exportTitle', 'FICHE D\'URGENCE NAISSANCE — MamanDouce'),
    '—',
    `${t('outils.emergency.motherName', 'Maman')}: ${form.motherName}`,
    `${t('outils.emergency.dueDate', 'Date prévue')}: ${form.dueDate}`,
    `${t('outils.emergency.bloodGroup', 'Groupe sanguin')}: ${form.bloodGroup}`,
    `${t('outils.emergency.allergies', 'Allergies')}: ${form.allergies}`,
    `${t('outils.emergency.hospital', 'Maternité')}: ${form.hospital}`,
    `${t('outils.emergency.midwifePhone', 'Sage-femme / suivi')}: ${form.midwifePhone}`,
    `${t('outils.emergency.partnerName', 'Personne relais')}: ${form.partnerName}`,
    `${t('outils.emergency.partnerPhone', 'Téléphone relais')}: ${form.partnerPhone}`,
    `${t('outils.emergency.pediatrician', 'Pédiatre')}: ${form.pediatrician}`,
    `${t('outils.emergency.specialNotes', 'Notes importantes')}: ${form.specialNotes}`,
  ].join('\n');
}

export function EmergencyInfoCard({ embedded = false }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    setForm(loadForm());
  }, []);

  const update = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const exportText = () => buildExportText(form, t);

  const handleShare = async () => {
    const text = exportText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('outils.emergency.title', 'Fiche d\'urgence naissance'),
          text,
        });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('outils.emergency.copied', 'Fiche copiée — partagez-la à votre relais'));
    } catch {
      toast.error(t('common.error', 'Erreur'));
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fiche-urgence-naissance-mamandouce.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('outils.emergency.exported', 'Fiche exportée'));
  };

  const wrapperClass = embedded ? '' : 'min-h-screen gradient-bg p-6';

  return (
    <div className={wrapperClass} data-testid="emergency-info-card">
      <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-700">
              {t('outils.emergency.title', 'Fiche d\'urgence naissance')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('outils.emergency.subtitle', 'Formulaire synthétique pour la maternité et votre relais')}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            placeholder={t('outils.emergency.motherName', 'Nom de la maman')}
            value={form.motherName}
            onChange={(e) => update('motherName', e.target.value)}
            className="rounded-xl"
            data-testid="emergency-mother-name"
          />
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) => update('dueDate', e.target.value)}
            className="rounded-xl"
            data-testid="emergency-due-date"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder={t('outils.emergency.bloodGroup', 'Groupe sanguin')}
              value={form.bloodGroup}
              onChange={(e) => update('bloodGroup', e.target.value)}
              className="rounded-xl"
              data-testid="emergency-blood"
            />
            <Input
              placeholder={t('outils.emergency.allergies', 'Allergies')}
              value={form.allergies}
              onChange={(e) => update('allergies', e.target.value)}
              className="rounded-xl"
              data-testid="emergency-allergies"
            />
          </div>
          <Input
            placeholder={t('outils.emergency.hospital', 'Maternité choisie')}
            value={form.hospital}
            onChange={(e) => update('hospital', e.target.value)}
            className="rounded-xl"
            data-testid="emergency-hospital"
          />
          <Input
            placeholder={t('outils.emergency.midwifePhone', 'Sage-femme / suivi (tél.)')}
            value={form.midwifePhone}
            onChange={(e) => update('midwifePhone', e.target.value)}
            className="rounded-xl"
            data-testid="emergency-midwife"
          />
          <Input
            placeholder={t('outils.emergency.partnerName', 'Personne relais')}
            value={form.partnerName}
            onChange={(e) => update('partnerName', e.target.value)}
            className="rounded-xl"
            data-testid="emergency-partner-name"
          />
          <Input
            placeholder={t('outils.emergency.partnerPhone', 'Téléphone relais')}
            value={form.partnerPhone}
            onChange={(e) => update('partnerPhone', e.target.value)}
            className="rounded-xl"
            data-testid="emergency-partner-phone"
          />
          <Input
            placeholder={t('outils.emergency.pediatrician', 'Pédiatre')}
            value={form.pediatrician}
            onChange={(e) => update('pediatrician', e.target.value)}
            className="rounded-xl"
            data-testid="emergency-pediatrician"
          />
          <textarea
            placeholder={t('outils.emergency.specialNotes', 'Notes importantes (préférences, complications...)')}
            value={form.specialNotes}
            onChange={(e) => update('specialNotes', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
            data-testid="emergency-notes"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleShare}
            data-testid="emergency-share"
            className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {t('outils.emergency.share', 'Partager au relais')}
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            data-testid="emergency-export"
            className="flex-1 rounded-full border-slate-200"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('outils.emergency.export', 'Exporter')}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default EmergencyInfoCard;

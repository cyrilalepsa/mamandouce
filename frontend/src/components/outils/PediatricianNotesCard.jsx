import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stethoscope, Plus, FileText, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { toast } from 'sonner';

const STORAGE_KEY = 'mamandouce_pediatrician_notes';

const FORM_FIELD_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400';

const EMPTY_NOTE = {
  date: '',
  weight: '',
  symptoms: '',
  questions: '',
  medications: '',
};

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function buildSynthesis(notes, t) {
  const lines = [
    t('outils.pediatrician.synthesisHeader', 'Synthèse pour consultation pédiatre'),
    '—',
  ];
  notes.forEach((note, index) => {
    lines.push(
      `${index + 1}. ${note.date || t('outils.pediatrician.noDate', 'Sans date')}`,
      note.weight ? `${t('outils.pediatrician.weight', 'Poids')}: ${note.weight}` : null,
      note.symptoms ? `${t('outils.pediatrician.symptoms', 'Symptômes')}: ${note.symptoms}` : null,
      note.medications ? `${t('outils.pediatrician.medications', 'Traitements')}: ${note.medications}` : null,
      note.questions ? `${t('outils.pediatrician.questions', 'Questions')}: ${note.questions}` : null,
      '',
    );
  });
  return lines.filter(Boolean).join('\n');
}

export function PediatricianNotesCard({ embedded = false }) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(EMPTY_NOTE);
  const [synthesis, setSynthesis] = useState('');

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const persist = (next) => {
    setNotes(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addNote = () => {
    if (!form.symptoms?.trim() && !form.questions?.trim()) {
      toast.error(t('outils.pediatrician.needContent', 'Ajoutez au moins un symptôme ou une question.'));
      return;
    }
    const next = [...notes, { ...form, id: Date.now() }];
    persist(next);
    setForm(EMPTY_NOTE);
    toast.success(t('outils.pediatrician.noteAdded', 'Note ajoutée'));
  };

  const removeNote = (id) => {
    persist(notes.filter((n) => n.id !== id));
  };

  const generateSynthesis = () => {
    if (notes.length === 0) {
      toast.error(t('outils.pediatrician.noNotes', 'Ajoutez des notes avant la synthèse.'));
      return;
    }
    const text = buildSynthesis(notes, t);
    setSynthesis(text);
  };

  const copySynthesis = async () => {
    if (!synthesis) return;
    try {
      await navigator.clipboard.writeText(synthesis);
      toast.success(t('outils.pediatrician.copied', 'Synthèse copiée'));
    } catch {
      toast.error(t('common.error', 'Erreur'));
    }
  };

  const wrapperClass = embedded ? '' : 'min-h-screen gradient-bg p-6';

  return (
    <div className={wrapperClass} data-testid="pediatrician-notes-card">
      <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-4 [color-scheme:light]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-700">
              {t('outils.pediatrician.title', 'Cher pédiatre')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('outils.pediatrician.subtitle', 'Notes santé et synthèse pour vos consultations')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="rounded-xl text-slate-900 bg-white placeholder:text-slate-400"
            data-testid="ped-note-date"
          />
          <Input
            placeholder={t('outils.pediatrician.weightPlaceholder', 'Poids (kg)')}
            value={form.weight}
            onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
            className="rounded-xl text-slate-900 bg-white placeholder:text-slate-400"
            data-testid="ped-note-weight"
          />
        </div>
        <textarea
          placeholder={t('outils.pediatrician.symptomsPlaceholder', 'Symptômes observés...')}
          value={form.symptoms}
          onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))}
          className={`${FORM_FIELD_CLASS} min-h-[72px]`}
          data-testid="ped-note-symptoms"
        />
        <textarea
          placeholder={t('outils.pediatrician.medsPlaceholder', 'Traitements / température...')}
          value={form.medications}
          onChange={(e) => setForm((f) => ({ ...f, medications: e.target.value }))}
          className={`${FORM_FIELD_CLASS} min-h-[56px]`}
          data-testid="ped-note-meds"
        />
        <textarea
          placeholder={t('outils.pediatrician.questionsPlaceholder', 'Questions pour le pédiatre...')}
          value={form.questions}
          onChange={(e) => setForm((f) => ({ ...f, questions: e.target.value }))}
          className={`${FORM_FIELD_CLASS} min-h-[56px]`}
          data-testid="ped-note-questions"
        />
        <Button
          onClick={addNote}
          data-testid="ped-add-note"
          className="w-full rounded-full bg-sky-500 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('outils.pediatrician.addNote', 'Ajouter la note')}
        </Button>

        {notes.length > 0 && (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-600">
              {t('outils.pediatrician.history', 'Historique')} ({notes.length})
            </p>
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 relative"
                data-testid={`ped-note-${note.id}`}
              >
                <button
                  type="button"
                  onClick={() => removeNote(note.id)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <p className="font-semibold text-slate-700">{note.date || '—'}</p>
                {note.weight && <p>{t('outils.pediatrician.weight')}: {note.weight}</p>}
                {note.symptoms && <p>{note.symptoms}</p>}
                {note.medications && <p className="text-slate-500">{note.medications}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <Button
            onClick={generateSynthesis}
            data-testid="ped-generate-synthesis"
            className="w-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('outils.pediatrician.generate', 'Générer la synthèse')}
          </Button>
          {synthesis && (
            <div className="rounded-xl bg-slate-50 p-3">
              <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans">{synthesis}</pre>
              <Button
                onClick={copySynthesis}
                variant="ghost"
                className="mt-2 text-sky-600 text-sm"
                data-testid="ped-copy-synthesis"
              >
                {t('outils.pediatrician.copy', 'Copier la synthèse')}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default PediatricianNotesCard;

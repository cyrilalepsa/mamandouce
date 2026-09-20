import { useEffect, useState } from 'react';
import { FileText, RefreshCw, Save } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export default function LegalContentTab() {
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await api.admin.getContentConfigs();
      const texts = (response.data?.items || []).filter((item) => item.type === 'text');
      setItems(texts);
      const nextDrafts = {};
      texts.forEach((item) => {
        nextDrafts[item.key] = item.value || '';
      });
      setDrafts(nextDrafts);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Impossible de charger les textes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const saveItem = async (key) => {
    setSavingKey(key);
    try {
      const response = await api.admin.upsertContentConfig(key, drafts[key] || '');
      setItems((current) =>
        current.map((item) => (item.key === key ? response.data : item)),
      );
      toast.success('Contenu enregistré');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Échec de la sauvegarde');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
        <RefreshCw className="h-5 w-5 animate-spin" />
        Chargement des contenus…
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="legal-content-tab">
      <p className="text-xs text-slate-500">
        Mentions légales, CGU, politique de confidentialité et encadrés d&apos;information configurables.
      </p>
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          data-testid={`legal-config-${item.key}`}
        >
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-500" />
            <h4 className="text-sm font-bold text-slate-700">{item.label}</h4>
          </div>
          <textarea
            value={drafts[item.key] ?? ''}
            onChange={(event) =>
              setDrafts((current) => ({ ...current, [item.key]: event.target.value }))
            }
            rows={8}
            className="w-full min-h-[160px] rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
            placeholder="Contenu (texte ou Markdown)…"
            data-testid={`legal-textarea-${item.key}`}
          />
          <button
            type="button"
            onClick={() => saveItem(item.key)}
            disabled={savingKey !== null}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-violet-500 text-sm font-bold text-white active:bg-violet-600 disabled:opacity-60 sm:w-auto sm:px-6"
            data-testid={`legal-save-${item.key}`}
          >
            {savingKey === item.key ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </button>
        </div>
      ))}
    </div>
  );
}

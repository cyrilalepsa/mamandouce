import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Lightbulb, Plus, RefreshCw, Clock } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isWithin14Days(value) {
  if (!value) return false;
  const created = new Date(value);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  return created >= cutoff;
}

export function WhatsNewAdminSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const loadItems = async () => {
    try {
      const response = await api.admin.getWhatsNew();
      setItems(response.data?.items || []);
    } catch (error) {
      console.error('Erreur chargement whats_new:', error);
      toast.error('Impossible de charger les nouveautés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Titre et description requis');
      return;
    }

    setSaving(true);
    try {
      await api.admin.upsertWhatsNew({
        title: title.trim(),
        description: description.trim(),
      });
      toast.success('Nouveauté publiée');
      setTitle('');
      setDescription('');
      await loadItems();
    } catch (error) {
      toast.error('Erreur lors de la publication');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async (item) => {
    setRefreshingId(item.id);
    try {
      await api.admin.upsertWhatsNew({ id: item.id });
      toast.success('Visibilité relancée pour 14 jours');
      await loadItems();
    } catch (error) {
      toast.error('Erreur lors du rafraîchissement');
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-700">Nouveautés (bulle ampoule)</h3>
          <p className="text-sm text-slate-500">Visibles 14 jours · point rouge si non lu</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-5 border border-amber-100 space-y-3">
        <h4 className="font-semibold text-slate-700">Ajouter une nouveauté</h4>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          data-testid="whats-new-title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description courte"
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none"
          data-testid="whats-new-description"
        />
        <Button
          onClick={handleCreate}
          disabled={saving}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
          data-testid="whats-new-create"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2 inline" />
              Publier
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">Aucune nouveauté enregistrée.</p>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto">
          {items.map((item) => {
            const visible = isWithin14Days(item.created_at);
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 border border-slate-100"
                data-testid={`whats-new-item-${item.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700">{item.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${
                      visible
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {visible ? 'Visible' : 'Expirée'}
                  </span>
                </div>
                <Button
                  onClick={() => handleRefresh(item)}
                  disabled={refreshingId === item.id}
                  variant="outline"
                  className="w-full mt-3 rounded-xl text-sm"
                  data-testid={`whats-new-refresh-${item.id}`}
                >
                  {refreshingId === item.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 inline" />
                      Rafraîchir (14 jours)
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default WhatsNewAdminSection;

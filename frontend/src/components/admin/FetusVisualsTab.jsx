import { useEffect, useState } from 'react';
import { Image as ImageIcon, RefreshCw, Trash2, Upload } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

const EMPTY_VISUALS = Array.from({ length: 40 }, (_, index) => ({
  week: index + 1,
  image_url: null,
}));

export default function FetusVisualsTab() {
  const [visuals, setVisuals] = useState(EMPTY_VISUALS);
  const [folder, setFolder] = useState('mamandouce/foetus');
  const [loading, setLoading] = useState(true);
  const [uploadingWeek, setUploadingWeek] = useState(null);

  const loadVisuals = async () => {
    setLoading(true);
    try {
      const response = await api.admin.getFetusVisuals();
      setVisuals(
        Array.isArray(response.data?.visuals)
          ? response.data.visuals
          : EMPTY_VISUALS,
      );
      setFolder(response.data?.folder || 'mamandouce/foetus');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Impossible de charger les visuels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisuals();
  }, []);

  const uploadVisual = async (week, file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format accepté : JPEG, PNG ou WebP');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 10 Mo)');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploadingWeek(week);
    try {
      const response = await api.admin.uploadFetusVisual(week, formData);
      setVisuals((current) => current.map((visual) => (
        visual.week === week ? response.data : visual
      )));
      toast.success(`Visuel semaine ${week} mis à jour`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Échec de l'upload Cloudinary");
    } finally {
      setUploadingWeek(null);
    }
  };

  const removeVisual = async (week) => {
    try {
      await api.admin.deleteFetusVisual(week);
      setVisuals((current) => current.map((visual) => (
        visual.week === week ? { week, image_url: null } : visual
      )));
      toast.success(`Fallback restauré pour la semaine ${week}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Suppression impossible');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin" />
        Chargement des 40 semaines…
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="fetus-visuals-manager">
      <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-violet-50 border border-pink-100 p-4">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-pink-500" />
          <div>
            <h3 className="font-bold text-slate-700">Gestion des Visuels Fœtus (40 Semaines)</h3>
            <p className="text-xs text-slate-500">
              Upload Cloudinary dans <code>{folder}</code>. Sans image, le fallback MamanDouce reste affiché.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visuals.map((visual) => (
          <div
            key={visual.week}
            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            data-testid={`fetus-visual-week-${visual.week}`}
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-pink-50 to-violet-100 flex items-center justify-center">
              {visual.image_url ? (
                <img
                  src={visual.image_url}
                  alt={`Fœtus semaine ${visual.week}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <span className="text-4xl" aria-hidden="true">👶</span>
                  <p className="text-[10px] mt-1">Placeholder</p>
                </div>
              )}
            </div>
            <p className="font-bold text-slate-700 text-center mt-2">
              Semaine {visual.week}
            </p>
            <div className="flex gap-2 mt-2">
              <label className="flex-1 cursor-pointer rounded-xl bg-pink-500 text-white text-xs font-bold py-2 px-2 flex items-center justify-center gap-1 hover:bg-pink-600">
                {uploadingWeek === visual.week ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                Upload
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploadingWeek !== null}
                  onChange={(event) => {
                    uploadVisual(visual.week, event.target.files?.[0]);
                    event.target.value = '';
                  }}
                  data-testid={`upload-fetus-week-${visual.week}`}
                />
              </label>
              {visual.image_url && (
                <button
                  onClick={() => removeVisual(visual.week)}
                  className="rounded-xl border border-rose-200 text-rose-500 p-2 hover:bg-rose-50"
                  aria-label={`Supprimer le visuel semaine ${visual.week}`}
                  data-testid={`delete-fetus-week-${visual.week}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

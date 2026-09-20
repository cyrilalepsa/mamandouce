import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon, RefreshCw, Trash2, Upload } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import {
  FETUS_UPLOAD_ACCEPT,
  isAcceptedFetusUpload,
} from '../../utils/fetusUploadMime';

const PERIOD_CONFIG = {
  week: { label: 'Semaines', max: 40, subtitle: 'Semaine d\'aménorrhée (1–40)' },
  month: { label: 'Mois', max: 9, subtitle: 'Mois de grossesse (1–9)' },
  day: { label: 'Jours', max: 280, subtitle: 'Jour de grossesse (1–280)' },
};

function emptyVisuals(kind) {
  const max = PERIOD_CONFIG[kind].max;
  return Array.from({ length: max }, (_, index) => ({
    kind,
    period: index + 1,
    week: kind === 'week' ? index + 1 : undefined,
    image_url: null,
  }));
}

function DropZone({ active, onFile, children, testId }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer?.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      data-testid={testId}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed transition-colors ${
        dragging ? 'border-pink-400 bg-pink-50' : 'border-slate-200 bg-slate-50/80'
      } ${active ? '' : 'opacity-60 pointer-events-none'}`}
    >
      {children}
    </div>
  );
}

export default function FetusVisualsTab() {
  const [periodKind, setPeriodKind] = useState('week');
  const [visuals, setVisuals] = useState(() => emptyVisuals('week'));
  const [folder, setFolder] = useState('mamandouce/foetus');
  const [loading, setLoading] = useState(true);
  const [uploadingPeriod, setUploadingPeriod] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);

  const periodMeta = PERIOD_CONFIG[periodKind];

  const loadVisuals = async (kind = periodKind) => {
    setLoading(true);
    try {
      const response = await api.admin.getFetusVisuals(kind);
      setVisuals(
        Array.isArray(response.data?.visuals)
          ? response.data.visuals
          : emptyVisuals(kind),
      );
      setFolder(response.data?.folder || 'mamandouce/foetus');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Impossible de charger les visuels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisuals(periodKind);
  }, [periodKind]);

  const uploadVisual = async (period, file) => {
    if (!file) return;
    if (!isAcceptedFetusUpload(file)) {
      toast.error('Format accepté : JPEG, PNG, WEBP, HEIC ou HEIF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 10 Mo)');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploadingPeriod(period);
    try {
      const response = await api.admin.uploadFetusVisualPeriod(periodKind, period, formData);
      setVisuals((current) =>
        current.map((visual) =>
          (visual.period ?? visual.week) === period ? response.data : visual,
        ),
      );
      toast.success(`Visuel ${periodMeta.label.toLowerCase()} ${period} mis à jour`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Échec de l'upload Cloudinary");
    } finally {
      setUploadingPeriod(null);
    }
  };

  const removeVisual = async (period) => {
    try {
      await api.admin.deleteFetusVisualPeriod(periodKind, period);
      setVisuals((current) =>
        current.map((visual) =>
          (visual.period ?? visual.week) === period
            ? { ...visual, image_url: null, public_id: null }
            : visual,
        ),
      );
      toast.success(`Fallback restauré (${periodMeta.label} ${period})`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Suppression impossible');
    }
  };

  const gridVisuals = useMemo(() => {
    if (periodKind !== 'day') return visuals;
    const match = visuals.find((visual) => (visual.period ?? visual.week) === selectedDay);
    return match ? [match] : [{ kind: 'day', period: selectedDay, image_url: null }];
  }, [periodKind, visuals, selectedDay]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin" />
        Chargement des visuels fœtus…
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="fetus-visuals-manager">
      <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-violet-50 border border-pink-100 p-4">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-pink-500" />
          <div>
            <h3 className="font-bold text-slate-700">
              Gestion des Visuels Fœtus (Jours/Mois)
            </h3>
            <p className="text-xs text-slate-500">
              Upload Cloudinary dans <code>{folder}</code> — JPEG, PNG, WEBP, HEIC/HEIF (conversion auto).
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="fetus-period-kind-tabs">
        {Object.entries(PERIOD_CONFIG).map(([kind, cfg]) => (
          <button
            key={kind}
            type="button"
            onClick={() => setPeriodKind(kind)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              periodKind === kind
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
            data-testid={`fetus-period-tab-${kind}`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">{periodMeta.subtitle}</p>

      {periodKind === 'day' && (
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Jour de grossesse
          <input
            type="number"
            min={1}
            max={280}
            value={selectedDay}
            onChange={(event) => setSelectedDay(Number(event.target.value) || 1)}
            className="rounded-xl border border-slate-200 px-3 py-2 w-full max-w-xs"
            data-testid="fetus-day-selector"
          />
        </label>
      )}

      <div
        className={`grid gap-3 ${
          periodKind === 'day'
            ? 'grid-cols-1'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        }`}
      >
        {(periodKind === 'day' ? gridVisuals : visuals).map((visual) => {
          const period = visual.period ?? visual.week;
          const testSuffix =
            periodKind === 'week' ? `week-${period}` : `${periodKind}-${period}`;
          return (
            <div
              key={`${periodKind}-${period}`}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              data-testid={`fetus-visual-${testSuffix}`}
            >
              <DropZone
                active={uploadingPeriod === null}
                testId={`fetus-drop-${testSuffix}`}
                onFile={(file) => uploadVisual(period, file)}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-pink-50 to-violet-100 flex items-center justify-center p-2">
                  {visual.image_url ? (
                    <img
                      src={visual.image_url}
                      alt={`Fœtus ${periodMeta.label} ${period}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <span className="text-4xl" aria-hidden="true">👶</span>
                      <p className="text-[10px] mt-1">Glisser-déposer ou choisir un fichier</p>
                    </div>
                  )}
                </div>
              </DropZone>
              <p className="font-bold text-slate-700 text-center mt-2">
                {periodMeta.label} {period}
              </p>
              <div className="flex gap-2 mt-2">
                <label className="flex-1 cursor-pointer rounded-xl bg-pink-500 text-white text-xs font-bold py-2 px-2 flex items-center justify-center gap-1 hover:bg-pink-600">
                  {uploadingPeriod === period ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  Upload
                  <input
                    type="file"
                    accept={FETUS_UPLOAD_ACCEPT}
                    className="hidden"
                    disabled={uploadingPeriod !== null}
                    onChange={(event) => {
                      uploadVisual(period, event.target.files?.[0]);
                      event.target.value = '';
                    }}
                    data-testid={`upload-fetus-${testSuffix}`}
                  />
                </label>
                {visual.image_url && (
                  <button
                    type="button"
                    onClick={() => removeVisual(period)}
                    className="rounded-xl border border-rose-200 text-rose-500 p-2 hover:bg-rose-50"
                    aria-label={`Supprimer le visuel ${period}`}
                    data-testid={`delete-fetus-${testSuffix}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

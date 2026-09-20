import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

function FetusVisualCard({
  period,
  periodKind,
  periodLabel,
  visual,
  testSuffix,
  uploading,
  disabled,
  onUpload,
  onRemove,
}) {
  const inputRef = useRef(null);

  const openNativePicker = useCallback(() => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  }, [disabled, uploading]);

  const handleFile = (file) => {
    if (file) onUpload(period, file);
  };

  return (
    <article
      className="flex w-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm touch-manipulation"
      data-testid={`fetus-visual-${testSuffix}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={FETUS_UPLOAD_ACCEPT}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
        data-testid={`upload-fetus-${testSuffix}`}
      />

      <button
        type="button"
        onClick={openNativePicker}
        disabled={disabled}
        className="w-full min-w-0 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-2 text-left transition-colors active:border-pink-400 active:bg-pink-50 disabled:opacity-60"
        data-testid={`fetus-drop-${testSuffix}`}
        aria-label={`Choisir une image pour ${periodLabel} ${period}`}
      >
        <div
          className="flex min-h-[140px] max-h-[min(60vw,280px)] w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-pink-50 to-violet-100 sm:min-h-[160px] sm:max-h-none sm:aspect-square"
        >
          {visual.image_url ? (
            <img
              src={visual.image_url}
              alt={`Fœtus ${periodLabel} ${period}`}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="px-3 text-center text-slate-400">
              <span className="text-4xl" aria-hidden="true">👶</span>
              <p className="mt-2 text-xs leading-snug">
                Toucher pour choisir une photo
              </p>
              <p className="mt-1 hidden text-[10px] sm:block">
                ou glisser-déposer sur ordinateur
              </p>
            </div>
          )}
        </div>
      </button>

      <p className="mt-2 text-center text-sm font-bold text-slate-700">
        {periodLabel} {period}
      </p>

      <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={openNativePicker}
          disabled={disabled}
          className="flex min-h-[44px] w-full flex-1 items-center justify-center gap-2 rounded-xl bg-pink-500 px-3 text-sm font-bold text-white active:bg-pink-600 disabled:opacity-60"
        >
          {uploading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? 'Envoi…' : 'Choisir une photo'}
        </button>
        {visual.image_url && (
          <button
            type="button"
            onClick={() => onRemove(period)}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 text-sm font-semibold text-rose-500 active:bg-rose-50 sm:w-auto sm:min-w-[44px] sm:px-2"
            aria-label={`Supprimer le visuel ${period}`}
            data-testid={`delete-fetus-${testSuffix}`}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sm:hidden">Supprimer</span>
          </button>
        )}
      </div>
    </article>
  );
}

export default function FetusVisualsTab({ embedded = false }) {
  const [periodKind, setPeriodKind] = useState('week');
  const [visuals, setVisuals] = useState(() => emptyVisuals('week'));
  const [folder, setFolder] = useState('mamandouce/foetus');
  const [loading, setLoading] = useState(true);
  const [uploadingPeriod, setUploadingPeriod] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);

  const periodMeta = PERIOD_CONFIG[periodKind];
  const uploadDisabled = uploadingPeriod !== null;

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
      <div className="flex items-center justify-center gap-2 p-8 text-slate-500">
        <RefreshCw className="h-5 w-5 animate-spin" />
        Chargement des visuels fœtus…
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden" data-testid="fetus-visuals-manager">
      {!embedded && (
        <div className="rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50 to-violet-50 p-4">
          <div className="flex min-w-0 items-start gap-3">
            <ImageIcon className="h-6 w-6 shrink-0 text-pink-500" />
            <div className="min-w-0">
              <h3 className="font-bold text-slate-700">
                Gestion des Visuels Fœtus (Jours/Mois)
              </h3>
              <p className="text-xs leading-relaxed text-slate-500 break-words">
                Upload Cloudinary dans{' '}
                <code className="break-all text-[11px]">{folder}</code>
                {' '}— JPEG, PNG, WEBP, HEIC/HEIF (conversion auto).
              </p>
            </div>
          </div>
        </div>
      )}
      {embedded && (
        <p className="text-xs text-slate-500 break-words">
          Dossier Cloudinary : <code className="break-all text-[11px]">{folder}</code>
        </p>
      )}

      <div
        className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin]"
        data-testid="fetus-period-kind-tabs"
        role="tablist"
        aria-label="Type de période"
      >
        {Object.entries(PERIOD_CONFIG).map(([kind, cfg]) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={periodKind === kind}
            onClick={() => setPeriodKind(kind)}
            className={`shrink-0 snap-start rounded-full px-5 py-2.5 text-sm font-bold transition-colors min-h-[44px] ${
              periodKind === kind
                ? 'bg-pink-500 text-white shadow-md'
                : 'border border-slate-200 bg-white text-slate-600'
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
            className="min-h-[44px] w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2 text-base"
            data-testid="fetus-day-selector"
          />
        </label>
      )}

      <div
        className={`grid w-full min-w-0 gap-3 ${
          periodKind === 'day'
            ? 'grid-cols-1'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}
      >
        {(periodKind === 'day' ? gridVisuals : visuals).map((visual) => {
          const period = visual.period ?? visual.week;
          const testSuffix =
            periodKind === 'week' ? `week-${period}` : `${periodKind}-${period}`;
          return (
            <FetusVisualCard
              key={`${periodKind}-${period}`}
              period={period}
              periodKind={periodKind}
              periodLabel={periodMeta.label}
              visual={visual}
              testSuffix={testSuffix}
              uploading={uploadingPeriod === period}
              disabled={uploadDisabled}
              onUpload={uploadVisual}
              onRemove={removeVisual}
            />
          );
        })}
      </div>
    </div>
  );
}

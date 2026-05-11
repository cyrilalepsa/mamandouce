/**
 * NeriaCorpScannerTab — Section spéciale ADMIN-ONLY
 *
 * Pipeline : Image (compressée 800x600) OU texte OU métadonnées → GPT-4o
 * (prompt "NeriaCorp Intelligence") → JSON strict 4 sections :
 *   1. metadata (source_app, confidence_score, operation_mode='Admin_Only')
 *   2. business (modules métier selon app détectée)
 *   3. display_card (title, summary, main_action, theme_color, visual_type)
 *   4. financial (estimated_revenue, currency)
 *
 * Visualisation : adapte selon `visual_type` (LIST / GRID / REPORT).
 * Audit : dashboard cumulatif en bas avec total_revenue + by_app.
 */
import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, Loader2, Sparkles, Type, RefreshCw, AlertCircle, TrendingUp, ShieldCheck, FileJson, Video } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import api from '../../utils/api';

/**
 * Compresse une image en JPEG 800x600 max, qualité 0.85
 * Retourne { base64, preview }
 */
async function compressImage(file, maxW = 800, maxH = 600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ base64: dataUrl.split(',')[1], preview: dataUrl, width: w, height: h });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Rendu dynamique de business selon visual_type
function BusinessRenderer({ business, visualType, themeColor }) {
  if (!business || Object.keys(business).length === 0) {
    return <p className="text-sm text-slate-500 italic">Aucune donnée métier détectée.</p>;
  }

  if (visualType === 'GRID') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(business).flatMap(([key, val]) => {
          if (Array.isArray(val)) {
            return val.map((item, idx) => (
              <div
                key={`${key}-${idx}`}
                className="rounded-xl p-3 bg-white"
                style={{ border: `1.5px solid ${themeColor}40` }}
                data-testid={`neriacorp-grid-${key}-${idx}`}
              >
                {typeof item === 'object' && item !== null ? (
                  Object.entries(item).map(([k, v]) => (
                    <div key={k} className="text-xs">
                      <span className="font-semibold text-slate-700">{k}:</span>{' '}
                      <span className="text-slate-600">{v === null ? 'null' : String(v)}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm">{String(item)}</span>
                )}
              </div>
            ));
          }
          return [];
        })}
      </div>
    );
  }

  if (visualType === 'REPORT') {
    return (
      <div className="space-y-3">
        {Object.entries(business).map(([section, content]) => (
          <div key={section} className="rounded-xl p-3 bg-white" style={{ borderLeft: `4px solid ${themeColor}` }}>
            <h4 className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: themeColor }}>
              {section.replace(/_/g, ' ')}
            </h4>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
              {typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content)}
            </pre>
          </div>
        ))}
      </div>
    );
  }

  // LIST (default)
  return (
    <div className="space-y-1.5">
      {Object.entries(business).flatMap(([key, val]) => {
        if (Array.isArray(val)) {
          return val.map((item, idx) => (
            <div
              key={`${key}-${idx}`}
              className="rounded-lg px-3 py-2 bg-white flex items-center gap-2"
              style={{ borderLeft: `3px solid ${themeColor}` }}
              data-testid={`neriacorp-list-${key}-${idx}`}
            >
              <span className="text-xs text-slate-500 font-mono">#{idx + 1}</span>
              <span className="text-sm text-slate-700 flex-1">
                {typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)}
              </span>
            </div>
          ));
        }
        return [
          <div key={key} className="rounded-lg px-3 py-2 bg-white" style={{ borderLeft: `3px solid ${themeColor}` }}>
            <span className="text-xs font-semibold text-slate-700">{key.replace(/_/g, ' ')}:</span>{' '}
            <span className="text-sm text-slate-600">
              {val === null ? 'null' : typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </span>
          </div>,
        ];
      })}
    </div>
  );
}

export default function NeriaCorpScannerTab() {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [metadataInput, setMetadataInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [audit, setAudit] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);

  const loadAudit = async () => {
    try {
      const { data } = await api.scanner.getAudit();
      setAudit(data);
    } catch (e) {
      // silencieux : audit n'est pas critique
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const handlePublish = async () => {
    if (!result) return;
    const target = result.metadata?.source_app;
    if (!target) {
      toast.error('App cible non détectée');
      return;
    }
    setPublishing(true);
    try {
      const { data } = await api.scanner.publish({
        target_app: target,
        scan_id: result.id,
        payload: { business: result.business, display_card: result.display_card },
      });
      setPublishResult(data);
      toast.success(`✓ Injecté dans ${target} — ${data.publication_id}`);
      await loadAudit();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Erreur publication');
    } finally {
      setPublishing(false);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp|heic|heif)/i.test(file.type)) {
      toast.error('Format non supporté');
      return;
    }
    try {
      const { base64, preview: prev, width, height } = await compressImage(file);
      setImageBase64(base64);
      setPreview(prev);
      toast.success(`Compressé ${width}×${height}`);
    } catch {
      toast.error('Impossible de lire l\'image');
    }
  };

  const handleAnalyze = async () => {
    // === VIDÉO : upload multipart prioritaire ===
    if (videoFile) {
      setLoading(true);
      setUploadProgress(0);
      try {
        const fd = new FormData();
        fd.append('file', videoFile);
        if (textInput) fd.append('text_input', textInput);
        const { data } = await api.scanner.analyzeVideo(fd, (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        });
        setResult(data);
        await loadAudit();
        toast.success(
          `${data.metadata.source_app || 'Vidéo'} — annonce générée (${Math.round(
            (data.metadata.confidence_score || 0) * 100
          )}%)`
        );
      } catch (e) {
        const msg = e?.response?.data?.detail || e.message || 'Erreur IA Vidéo';
        toast.error(msg);
      } finally {
        setLoading(false);
        setUploadProgress(0);
      }
      return;
    }

    // === IMAGE / TEXTE / MÉTADONNÉES ===
    if (!imageBase64 && !textInput && !metadataInput) {
      toast.error('Fournis au moins une image, une vidéo, du texte ou des métadonnées');
      return;
    }

    let metadata = null;
    if (metadataInput.trim()) {
      try {
        metadata = JSON.parse(metadataInput);
      } catch {
        toast.error('Métadonnées : JSON invalide');
        return;
      }
    }

    setLoading(true);
    try {
      const { data } = await api.scanner.analyze({
        image_base64: imageBase64 || undefined,
        text_input: textInput || undefined,
        metadata: metadata || undefined,
      });
      setResult(data);
      await loadAudit();
      toast.success(
        `${data.metadata.source_app || '?'} — confiance ${Math.round(
          (data.metadata.confidence_score || 0) * 100
        )}%`
      );
    } catch (e) {
      const msg = e?.response?.data?.detail || e.message || 'Erreur IA';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoFile = (file) => {
    if (!file) return;
    if (!/^video\/(mp4|quicktime|webm|x-matroska|mpeg)/i.test(file.type)) {
      toast.error('Format vidéo non supporté (MP4, MOV, WebM)');
      return;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 50) {
      toast.error('Vidéo trop volumineuse (max 50 MB)');
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setImageBase64(null);
    setPreview(null);
    toast.success(`Vidéo prête (${sizeMB.toFixed(1)} MB)`);
  };

  const resetAll = () => {
    setPreview(null);
    setImageBase64(null);
    setTextInput('');
    setMetadataInput('');
    setResult(null);
    setPublishResult(null);
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
  };

  const themeColor = result?.display_card?.theme_color || '#7c3aed';

  return (
    <div className="space-y-4">
      {/* Bannière confidentialité */}
      <div className="rounded-xl p-3 bg-amber-50 border border-amber-200 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800">
          <strong>Section Admin-Only — No-Log :</strong> Les contenus métier ne sont pas persistés.
          Seul un audit anonymisé (app, confidence, revenu estimé) est conservé.
        </div>
      </div>

      {/* Étape 1 : Input */}
      {!result && (
        <Card className="bg-white rounded-2xl p-4 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <FileJson className="w-4 h-4 text-violet-600" />
            Source à analyser
          </h3>

          {/* Image */}
          {preview ? (
            <div className="relative mb-3">
              <img src={preview} alt="Aperçu" className="w-full rounded-xl border border-slate-200" />
              <button
                onClick={() => { setPreview(null); setImageBase64(null); }}
                className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded-lg text-xs shadow"
                data-testid="neriacorp-remove-image"
              >
                Retirer
              </button>
            </div>
          ) : videoPreview ? (
            <div className="relative mb-3">
              <video src={videoPreview} controls className="w-full rounded-xl border border-slate-200 max-h-64" />
              <div className="text-xs text-slate-500 mt-1">
                📹 {videoFile?.name} — {(videoFile?.size / (1024 * 1024)).toFixed(1)} MB
              </div>
              <button
                onClick={() => { setVideoFile(null); URL.revokeObjectURL(videoPreview); setVideoPreview(null); }}
                className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded-lg text-xs shadow"
                data-testid="neriacorp-remove-video"
              >
                Retirer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="rounded-xl py-3 px-2 bg-violet-50 hover:bg-violet-100 flex flex-col items-center gap-1 transition-all"
                data-testid="neriacorp-take-photo"
              >
                <Camera className="w-5 h-5 text-violet-600" />
                <span className="text-[11px] font-semibold text-slate-700">Photo</span>
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-xl py-3 px-2 bg-sky-50 hover:bg-sky-100 flex flex-col items-center gap-1 transition-all"
                data-testid="neriacorp-upload"
              >
                <Upload className="w-5 h-5 text-sky-600" />
                <span className="text-[11px] font-semibold text-slate-700">Importer</span>
              </button>
              <button
                onClick={() => videoRef.current?.click()}
                className="rounded-xl py-3 px-2 bg-amber-50 hover:bg-amber-100 flex flex-col items-center gap-1 transition-all"
                data-testid="neriacorp-upload-video"
              >
                <Video className="w-5 h-5 text-amber-600" />
                <span className="text-[11px] font-semibold text-slate-700">Vidéo 30s</span>
              </button>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/webm,video/mpeg" className="hidden" onChange={(e) => handleVideoFile(e.target.files?.[0])} />
            </div>
          )}

          {/* Texte */}
          <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Type className="w-3 h-3" /> Texte (optionnel)
          </label>
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Description ou contexte additionnel"
            className="rounded-lg text-sm mb-3 min-h-[60px]"
            data-testid="neriacorp-text-input"
          />

          {/* Métadonnées */}
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Métadonnées JSON (optionnel)</label>
          <Input
            value={metadataInput}
            onChange={(e) => setMetadataInput(e.target.value)}
            placeholder='{"user_id":"abc","timestamp":"..."}'
            className="rounded-lg text-xs font-mono mb-3"
            data-testid="neriacorp-metadata-input"
          />

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full btn-rose-bonbon rounded-xl py-3"
            data-testid="neriacorp-analyze-btn"
          >
            {loading ? (
              uploadProgress > 0 && uploadProgress < 100 ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Upload vidéo {uploadProgress}%…</>
              ) : (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {videoFile ? 'Gemini analyse la vidéo…' : 'Analyse NeriaCorp…'}</>
              )
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> {videoFile ? 'Générer l\'annonce de vente' : 'Analyser via NeriaCorp Intelligence'}</>
            )}
          </Button>
        </Card>
      )}

      {/* Résultat */}
      {result && (
        <>
          {/* En-tête display_card avec theme_color dynamique */}
          <Card
            className="rounded-2xl p-4 border-2 text-white"
            style={{
              background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}CC 100%)`,
              borderColor: themeColor,
            }}
            data-testid="neriacorp-display-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                {result.metadata?.source_app || 'Unknown App'}
              </span>
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">
                {Math.round((result.metadata?.confidence_score || 0) * 100)}% confiance
              </span>
            </div>
            <h3 className="text-lg font-bold mb-1">{result.display_card?.title || '—'}</h3>
            <p className="text-sm opacity-90 mb-3">{result.display_card?.summary || '—'}</p>
            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="bg-white hover:bg-white/90 font-semibold"
              style={{ color: themeColor }}
              data-testid="neriacorp-main-action"
            >
              {publishing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publication…</>
              ) : (
                result.display_card?.main_action || 'Valider'
              )}
            </Button>
            {publishResult && (
              <div className="mt-2 text-[11px] bg-white/15 rounded-lg px-2 py-1.5">
                ✓ <span className="font-mono font-bold">{publishResult.publication_id}</span> ·
                <span className="ml-1">+{publishResult.revenue_billed} {publishResult.currency}</span>
              </div>
            )}
          </Card>

          {/* Section financière */}
          <Card className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Revenu estimé</p>
                <p className="text-2xl font-bold text-emerald-800">
                  {result.financial?.estimated_revenue ?? '—'} {result.financial?.currency || ''}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </Card>

          {/* Section business — rendu dynamique */}
          <Card className="rounded-2xl p-4 bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-700">
                Modules métier <span className="text-xs font-normal text-slate-500">({result.display_card?.visual_type || 'LIST'})</span>
              </h4>
              <button
                onClick={() => setShowJson((s) => !s)}
                className="text-xs text-violet-600 underline"
                data-testid="neriacorp-toggle-json"
              >
                {showJson ? 'Vue UI' : 'Voir JSON brut'}
              </button>
            </div>
            {showJson ? (
              <pre className="text-[10px] font-mono bg-slate-900 text-emerald-300 p-3 rounded-lg overflow-x-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <BusinessRenderer
                business={result.business}
                visualType={result.display_card?.visual_type}
                themeColor={themeColor}
              />
            )}
          </Card>

          <Button onClick={resetAll} className="w-full btn-rose-bonbon-outline rounded-xl" data-testid="neriacorp-new-scan">
            <RefreshCw className="w-4 h-4 mr-2" /> Nouveau scan
          </Button>
        </>
      )}

      {/* Dashboard audit financier (toujours visible en bas) */}
      {audit && audit.total_count > 0 && (
        <Card className="rounded-2xl p-4 bg-white border border-slate-200 mt-4">
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Audit cumulé (No-Log)
          </h4>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Scans totaux</p>
              <p className="text-xl font-bold text-slate-800">{audit.total_count}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Revenu cumulé</p>
              <p className="text-xl font-bold text-emerald-800">
                {audit.total_revenue} {audit.currency}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {Object.entries(audit.by_app || {}).map(([app, stats]) => (
              <div key={app} className="flex items-center justify-between text-xs rounded-lg bg-slate-50 px-3 py-1.5">
                <span className="font-semibold text-slate-700">{app}</span>
                <span className="text-slate-600">
                  {stats.count} scan{stats.count > 1 ? 's' : ''} · {stats.revenue.toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!audit && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-4">
          <AlertCircle className="w-3 h-3" /> Audit indisponible
        </div>
      )}
    </div>
  );
}

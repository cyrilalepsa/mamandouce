/**
 * ScannerAIPage — Scanner IA multi-catégories
 * - Photo via caméra OU upload
 * - Compression 800x600 côté client (qualité 0.85 JPEG) avant envoi
 * - Sélection catégorie : alimentation / textile / auto / documents / menu / facture / admin / product
 * - Édition manuelle ligne par ligne post-scan
 * - Bouton "+ Ajouter un critère" + photo jointe
 * - Partage Web Share API
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, Share2, Plus, Edit3, Trash2, Loader2, Image as ImageIcon, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import api from '../utils/api';

const CATEGORY_META = [
  { id: 'alimentation', label: 'Alimentation', emoji: '🍎', color: 'logo-bubble-yellow' },
  { id: 'textile', label: 'Textile', emoji: '👕', color: 'logo-bubble-blue' },
  { id: 'auto', label: 'Auto', emoji: '🚗', color: 'logo-bubble-red' },
  { id: 'documents', label: 'Documents / Livres', emoji: '📚', color: 'logo-bubble-green' },
  { id: 'menu', label: 'Menu restaurant', emoji: '🍴', color: 'logo-bubble-violet' },
  { id: 'facture', label: 'Facture / Reçu', emoji: '🧾', color: 'logo-bubble-yellow' },
  { id: 'admin', label: 'Document admin', emoji: '📋', color: 'logo-bubble-blue' },
  { id: 'product', label: 'Annonce produit', emoji: '🏷️', color: 'logo-bubble-red' },
];

/**
 * Compresse une image en JPEG 800x600 max, qualité 0.85
 * Retourne une base64 string (sans le prefix data:)
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
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const b64 = dataUrl.split(',')[1];
        resolve({ base64: b64, preview: dataUrl, width: w, height: h });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Aplatit un objet récursif en lignes éditables key=label, value=string
 */
function flattenFields(data, prefix = '') {
  const out = [];
  if (!data || typeof data !== 'object') return out;
  Object.entries(data).forEach(([key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const label = key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
    if (Array.isArray(val)) {
      if (val.length === 0) {
        out.push({ key: fullKey, label, value: '', isArray: true, raw: [] });
      } else if (typeof val[0] === 'object') {
        val.forEach((item, idx) => {
          Object.entries(item).forEach(([ck, cv]) => {
            out.push({
              key: `${fullKey}[${idx}].${ck}`,
              label: `${label} #${idx + 1} → ${ck.replace(/_/g, ' ')}`,
              value: cv === null || cv === undefined ? '' : String(cv),
              isArrayItem: true,
            });
          });
        });
      } else {
        out.push({ key: fullKey, label, value: val.join(', '), isArray: true, raw: val });
      }
    } else if (val !== null && typeof val === 'object') {
      out.push(...flattenFields(val, fullKey));
    } else {
      out.push({
        key: fullKey,
        label,
        value: val === null || val === undefined ? '' : String(val),
      });
    }
  });
  return out;
}

export default function ScannerAIPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [preview, setPreview] = useState(null); // dataURL pour affichage
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]); // [{key, label, value, photoB64?}]
  const [scanMeta, setScanMeta] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp|heic|heif)/i.test(file.type)) {
      toast.error('Format non supporté. JPEG, PNG ou WEBP uniquement.');
      return;
    }
    try {
      const { base64, preview: prev, width, height } = await compressImage(file);
      setImageBase64(base64);
      setPreview(prev);
      setImageMeta({ width, height, sizeKB: Math.round((base64.length * 3) / 4 / 1024) });
      toast.success(`Image compressée ${width}×${height}`);
    } catch (e) {
      toast.error('Impossible de lire l\'image');
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64 || !selectedCategory) {
      toast.error('Choisis une catégorie et une image');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.scanner.analyzeDocument({
        image_base64: imageBase64,
        category: selectedCategory,
        custom_prompt: customPrompt || undefined,
      });
      const flat = flattenFields(data.data);
      setFields(flat);
      setScanMeta({
        confidence: data.confidence,
        templateLabel: data.template_label,
        rawText: data.raw_text,
      });
      toast.success(`Analyse terminée — confiance ${Math.round((data.confidence || 0) * 100)}%`);
    } catch (e) {
      const msg = e?.response?.data?.detail || e.message || 'Erreur d\'analyse';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (idx, value) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, value } : f)));
  };

  const removeField = (idx) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const addCustomField = () => {
    setFields((prev) => [
      ...prev,
      { key: `custom_${Date.now()}`, label: 'Nouveau critère', value: '', custom: true },
    ]);
  };

  const attachPhotoToField = async (idx, file) => {
    if (!file) return;
    try {
      const { preview: prev } = await compressImage(file, 400, 300, 0.8);
      setFields((prev2) => prev2.map((f, i) => (i === idx ? { ...f, photoB64: prev } : f)));
      toast.success('Photo ajoutée');
    } catch {
      toast.error('Impossible de joindre la photo');
    }
  };

  const handleShare = async () => {
    const lines = [
      `📋 ${scanMeta?.templateLabel || 'Scan IA'}`,
      '',
      ...fields.map((f) => `• ${f.label} : ${f.value || '—'}`),
      '',
      '— généré avec MamanDouce IA',
    ];
    const text = lines.join('\n');
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Scan IA — MamanDouce', text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copié dans le presse-papiers');
    }
  };

  const resetAll = () => {
    setPreview(null);
    setImageBase64(null);
    setImageMeta(null);
    setFields([]);
    setScanMeta(null);
    setCustomPrompt('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
          data-testid="scanner-back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Scanner IA
          </h1>
          <p className="text-xs text-slate-500">Photographie un document → extraction auto</p>
        </div>
        {fields.length > 0 && (
          <button
            onClick={resetAll}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
            data-testid="scanner-reset"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Step 1 : Catégorie */}
        {!fields.length && (
          <Card className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-700 mb-3">1. Catégorie</h2>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORY_META.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                    selectedCategory === c.id ? 'bg-violet-50 ring-2 ring-violet-400' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                  data-testid={`scanner-category-${c.id}`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl ${c.color}`}>
                    {c.emoji}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Step 2 : Photo */}
        {!fields.length && (
          <Card className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-700 mb-3">2. Photo</h2>
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Aperçu" className="w-full rounded-2xl border border-slate-200" />
                {imageMeta && (
                  <div className="text-xs text-slate-500 mt-2">
                    📐 {imageMeta.width}×{imageMeta.height} — {imageMeta.sizeKB} KB compressé
                  </div>
                )}
                <button
                  onClick={() => { setPreview(null); setImageBase64(null); setImageMeta(null); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"
                  data-testid="scanner-remove-image"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-pink-50 hover:from-violet-100 hover:to-pink-100 transition-all"
                  data-testid="scanner-take-photo"
                >
                  <Camera className="w-8 h-8 text-violet-500" />
                  <span className="text-sm font-semibold text-slate-700">Prendre une photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 transition-all"
                  data-testid="scanner-upload"
                >
                  <Upload className="w-8 h-8 text-sky-500" />
                  <span className="text-sm font-semibold text-slate-700">Importer</span>
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>
            )}
          </Card>
        )}

        {/* Step 3 : Custom prompt + bouton Analyser */}
        {!fields.length && preview && (
          <Card className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
            <h2 className="text-base font-bold text-slate-700">3. Instructions optionnelles</h2>
            <Input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ex : Indique aussi si le produit contient du gluten"
              className="rounded-xl"
              data-testid="scanner-custom-prompt"
            />
            <Button
              onClick={handleAnalyze}
              disabled={!selectedCategory || loading}
              className="w-full btn-rose-bonbon rounded-2xl py-3 text-base"
              data-testid="scanner-analyze-btn"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyse IA en cours…</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Analyser avec l'IA</>
              )}
            </Button>
          </Card>
        )}

        {/* Résultat : Champs détectés */}
        {fields.length > 0 && (
          <>
            {preview && (
              <Card className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100">
                <img src={preview} alt="Document scanné" className="w-full rounded-2xl max-h-48 object-contain" />
              </Card>
            )}

            <Card className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-700">{scanMeta?.templateLabel}</h2>
                  <p className="text-xs text-slate-500">
                    Confiance : {Math.round((scanMeta?.confidence || 0) * 100)}%
                  </p>
                </div>
                <Edit3 className="w-5 h-5 text-violet-500" />
              </div>

              <div className="space-y-3" data-testid="scanner-fields">
                {fields.map((f, idx) => (
                  <div key={f.key} className="bg-slate-50/70 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs font-semibold text-slate-600 flex-1">{f.label}</Label>
                      <button
                        onClick={() => removeField(idx)}
                        className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center"
                        data-testid={`scanner-field-delete-${idx}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                    <Input
                      value={f.value}
                      onChange={(e) => updateField(idx, e.target.value)}
                      placeholder="—"
                      className="rounded-lg bg-white"
                      data-testid={`scanner-field-input-${idx}`}
                    />
                    {f.photoB64 && (
                      <img src={f.photoB64} alt="Pièce jointe" className="w-full rounded-lg max-h-32 object-cover" />
                    )}
                    <label className="inline-flex items-center gap-1 text-xs text-violet-600 cursor-pointer">
                      <ImageIcon className="w-3.5 h-3.5" /> Joindre une photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => attachPhotoToField(idx, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                ))}
              </div>

              <Button
                onClick={addCustomField}
                variant="outline"
                className="w-full mt-4 rounded-xl border-dashed border-violet-300 text-violet-600 hover:bg-violet-50"
                data-testid="scanner-add-field"
              >
                <Plus className="w-4 h-4 mr-1" /> Ajouter un critère
              </Button>
            </Card>

            {scanMeta?.rawText && (
              <details className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <summary className="text-xs font-semibold text-slate-500 cursor-pointer">Texte brut détecté</summary>
                <p className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">{scanMeta.rawText}</p>
              </details>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={resetAll}
                className="btn-rose-bonbon-outline rounded-2xl py-3"
                data-testid="scanner-new-scan"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Nouveau scan
              </Button>
              <Button
                onClick={handleShare}
                className="btn-rose-bonbon rounded-2xl py-3"
                data-testid="scanner-share-btn"
              >
                <Share2 className="w-4 h-4 mr-2" /> Partager
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

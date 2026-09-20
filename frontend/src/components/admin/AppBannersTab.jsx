import { useEffect, useRef, useState } from 'react';
import { ImageIcon, RefreshCw, Upload } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import {
  FETUS_UPLOAD_ACCEPT,
  isAcceptedFetusUpload,
} from '../../utils/fetusUploadMime';

export default function AppBannersTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState(null);
  const inputRefs = useRef({});

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await api.admin.getContentConfigs();
      const banners = (response.data?.items || []).filter((item) => item.type === 'image');
      setItems(banners);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Impossible de charger les bannières');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const openPicker = (key) => {
    if (uploadingKey) return;
    inputRefs.current[key]?.click();
  };

  const uploadBanner = async (key, file) => {
    if (!file || !isAcceptedFetusUpload(file)) {
      toast.error('Format accepté : JPEG, PNG, WEBP, HEIC ou HEIF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 10 Mo)');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploadingKey(key);
    try {
      const response = await api.admin.uploadContentConfigImage(key, formData);
      setItems((current) =>
        current.map((item) => (item.key === key ? response.data : item)),
      );
      toast.success('Bannière mise à jour');
    } catch (error) {
      toast.error(error.response?.data?.detail || "Échec de l'upload");
    } finally {
      setUploadingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
        <RefreshCw className="h-5 w-5 animate-spin" />
        Chargement des bannières…
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="app-banners-tab">
      <p className="text-xs text-slate-500">
        Illustrations d&apos;interface, bannières d&apos;accueil et visuels dynamiques (Cloudinary).
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.key}
            className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            data-testid={`banner-config-${item.key}`}
          >
            <input
              ref={(node) => {
                inputRefs.current[item.key] = node;
              }}
              type="file"
              accept={FETUS_UPLOAD_ACCEPT}
              className="sr-only"
              disabled={uploadingKey !== null}
              onChange={(event) => {
                uploadBanner(item.key, event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            <div className="mb-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-sky-500" />
              <h4 className="text-sm font-bold text-slate-700">{item.label}</h4>
            </div>
            <button
              type="button"
              onClick={() => openPicker(item.key)}
              disabled={uploadingKey !== null}
              className="w-full min-h-[140px] max-h-[min(55vw,240px)] overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 active:border-sky-400 active:bg-sky-50"
            >
              {item.image_url || item.value ? (
                <img
                  src={item.image_url || item.value}
                  alt={item.label}
                  className="mx-auto max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400">Toucher pour ajouter une image</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => openPicker(item.key)}
              disabled={uploadingKey !== null}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-bold text-white active:bg-sky-600 disabled:opacity-60"
            >
              {uploadingKey === item.key ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploadingKey === item.key ? 'Envoi…' : 'Choisir une image'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

/**
 * FoodScannerAI - Scanner IA pour analyser les aliments
 * Utilise la caméra ou l'upload pour identifier les aliments
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  Camera, Upload, X, CheckCircle2, AlertTriangle, XCircle,
  Sparkles, Leaf, Info, RefreshCw,
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { ScannedProductActions } from './ScannedProductActions';
import { getFoodStatusLabel, normalizeScannedFood, verdictToSafetyStatus } from '../../utils/foodSafety';

// Configuration des couleurs selon le verdict
const VERDICT_CONFIG = {
  autorise: {
    color: 'green',
    bgColor: 'bg-emerald-600',
    bgLight: 'bg-green-50 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-300 dark:border-green-700',
    icon: CheckCircle2,
    label: 'AUTORISÉ',
    emoji: '✅'
  },
  limite: {
    color: 'orange',
    bgColor: 'bg-amber-500',
    bgLight: 'bg-amber-50 dark:bg-amber-900/30',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-300 dark:border-amber-700',
    icon: AlertTriangle,
    label: 'AVEC PRÉCAUTION',
    emoji: '⚠️'
  },
  deconseille: {
    color: 'red',
    bgColor: 'bg-red-600',
    bgLight: 'bg-red-50 dark:bg-red-900/30',
    textColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-300 dark:border-red-700',
    icon: XCircle,
    label: 'INTERDIT',
    emoji: '🚫'
  }
};

export default function FoodScannerAI({ isOpen, onClose }) {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState('choose'); // choose, camera, preview, analyzing, result
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Arrêter le flux caméra à la fermeture / démontage (évite fuite média)
  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return undefined;
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);
  
  const textShadow = isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {};
  const cardBg = isDarkMode ? 'bg-slate-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  
  // Convertir l'image en base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Gérer l'upload de fichier
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    
    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5MB)');
      return;
    }
    
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setStep('preview');
  };
  
  // Démarrer la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStep('camera');
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('Impossible d\'accéder à la caméra');
    }
  };
  
  // Capturer la photo
  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setImage(file);
      setImagePreview(canvas.toDataURL('image/jpeg'));
      stopCamera();
      setStep('preview');
    }, 'image/jpeg', 0.8);
  };
  
  // Arrêter la caméra
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  // Analyser l'image avec l'IA
  const analyzeImage = async () => {
    if (!image) return;
    
    setLoading(true);
    setStep('analyzing');
    setError(null);
    
    try {
      const base64 = await imageToBase64(image);
      
      const response = await api.scan.image({
        image_base64: base64,
      });

      if (response.data.success) {
        const raw = response.data.result || response.data.data;
        setResult({
          ...normalizeScannedFood({
            ...raw,
            food_name: raw?.food_name,
            safe_for_pregnancy: raw?.safe_for_pregnancy || verdictToSafetyStatus(raw?.verdict),
            image_preview: imagePreview,
          }),
          image_preview: imagePreview,
        });
        setStep('result');
      } else {
        throw new Error(response.data.detail || 'Erreur d\'analyse');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || 'Erreur lors de l\'analyse');
      
      if (err.response?.status === 403) {
        toast.error('Limite de scans atteinte cette semaine');
      } else {
        toast.error('Erreur lors de l\'analyse');
      }
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset
  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    stopCamera();
    setStep('choose');
  };
  
  // Fermer le modal
  const handleClose = () => {
    handleReset();
    onClose();
  };
  
  // Cleanup on unmount
  const handleModalChange = (open) => {
    if (!open) {
      handleClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleModalChange}>
      <DialogContent className={`${cardBg} max-w-md rounded-3xl border-0 p-0 overflow-hidden`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center gap-3" style={textShadow}>
              <Sparkles className="w-6 h-6" />
              Scanner Alimentaire IA
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/80 text-sm mt-1" style={textShadow}>
            Photographiez un aliment pour connaître son verdict
          </p>
        </div>
        
        <div className="p-5">
          {/* Step: Choose input method */}
          {step === 'choose' && (
            <div className="space-y-4">
              <p className={`text-center ${textMuted}`} style={textShadow}>
                Comment souhaitez-vous scanner votre aliment ?
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={startCamera}
                  className={`p-6 rounded-2xl border-2 ${isDarkMode ? 'border-slate-600 hover:border-cyan-500' : 'border-slate-200 hover:border-cyan-400'} transition-all flex flex-col items-center gap-3 hover:scale-105`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <span className={`font-medium ${textColor}`} style={textShadow}>Prendre une photo</span>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 ${isDarkMode ? 'border-slate-600 hover:border-purple-500' : 'border-slate-200 hover:border-purple-400'} transition-all flex flex-col items-center gap-3 hover:scale-105`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-white" />
                  </div>
                  <span className={`font-medium ${textColor}`} style={textShadow}>Importer une image</span>
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div className={`mt-4 p-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-xl`}>
                <p className={`text-xs ${textMuted} text-center`} style={textShadow}>
                  💡 Pour de meilleurs résultats, photographiez l'aliment sur un fond neutre avec un bon éclairage
                </p>
              </div>
            </div>
          )}
          
          {/* Step: Camera */}
          {step === 'camera' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Overlay guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white/50 rounded-2xl" />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => { stopCamera(); setStep('choose'); }}
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  Annuler
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capturer
                </Button>
              </div>
            </div>
          )}
          
          {/* Step: Preview */}
          {step === 'preview' && imagePreview && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  Reprendre
                </Button>
                <Button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyser
                </Button>
              </div>
            </div>
          )}
          
          {/* Step: Analyzing */}
          {step === 'analyzing' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center animate-pulse">
                <Sparkles className="w-10 h-10 text-white animate-spin" />
              </div>
              <p className={`font-medium ${textColor}`} style={textShadow}>Analyse en cours...</p>
              <p className={`text-sm ${textMuted}`} style={textShadow}>
                L'IA identifie l'aliment et vérifie sa compatibilité avec la grossesse
              </p>
            </div>
          )}
          
          {/* Step: Result */}
          {step === 'result' && result && (
            <div className="space-y-4">
              {result.image_preview && (
                <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                  <img
                    src={result.image_preview}
                    alt={result.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {/* Food name & verdict */}
              <div className={`text-center p-5 rounded-2xl border-2 ${(VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.limite).borderColor} ${(VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.limite).bgLight}`}>
                <p className={`text-2xl font-bold ${textColor} mb-2`} style={textShadow}>
                  {result.name}
                </p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${(VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.limite).bgColor} text-white font-bold`}>
                  {(() => {
                    const cfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.limite;
                    const IconComponent = cfg.icon;
                    return <IconComponent className="w-5 h-5" />;
                  })()}
                  {getFoodStatusLabel(result.safe_for_pregnancy)}
                </div>
              </div>
              
              {/* Explanation */}
              <div className={`p-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-2xl`}>
                <div className="flex items-start gap-3">
                  <Info className={`w-5 h-5 ${(VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.limite).textColor} flex-shrink-0 mt-0.5`} />
                  <p className={`text-sm ${textColor}`} style={textShadow}>
                    {result.reason || result.explanation}
                  </p>
                </div>
              </div>
              
              {/* Nutrients info (if available) */}
              {result.nutrients_info && (
                <div className={`p-4 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-2xl border border-green-200 dark:border-green-800`}>
                  <div className="flex items-start gap-3">
                    <Leaf className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-sm ${textColor}`} style={textShadow}>
                      {result.nutrients_info}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Alternatives (if available) */}
              {result.alternatives && (
                <div className={`p-4 ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50'} rounded-2xl border border-amber-200 dark:border-amber-800`}>
                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className={`text-sm font-medium ${textColor} mb-1`} style={textShadow}>Alternatives suggérées</p>
                      <p className={`text-sm ${textMuted}`} style={textShadow}>
                        {result.alternatives}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <ScannedProductActions food={result} />

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Nouveau scan
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full"
                >
                  Terminé
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

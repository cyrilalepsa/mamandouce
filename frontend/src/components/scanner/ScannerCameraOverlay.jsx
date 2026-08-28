import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import api from '../../utils/api';
import { useSubscription } from '../SubscriptionGate';

const READER_ID = 'scanner-overlay-qr-reader';

/**
 * Viseur caméra plein écran — ouverture directe sans menu intermédiaire.
 */
export function ScannerCameraOverlay({ onClose, onScanComplete }) {
  const { isPremium, subscriptionStatus } = useSubscription();
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const scansThisWeek = subscriptionStatus?.scans_this_week || 0;
  const scansRemaining = isPremium ? -1 : Math.max(0, 5 - scansThisWeek);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Erreur arrêt scanner:', err);
      }
    }
    setScanning(false);
  };

  const handleBarcodeScanned = async (code) => {
    if (!isPremium && scansRemaining <= 0) {
      toast.error('Limite de 5 scans/semaine atteinte.');
      await stopScanner();
      onClose();
      return;
    }

    setLoading(true);
    try {
      const response = await api.scan.barcode(code);
      const data = response.data;

      if (!data) {
        await stopScanner();
        onScanComplete({ barcode: code, result: null, barcodeNotFound: true });
        return;
      }

      const isUnknown =
        data.is_unknown || data.can_contribute || data.safe_for_pregnancy === 'unknown';

      await stopScanner();
      onScanComplete({
        barcode: code,
        result: data,
        barcodeNotFound: isUnknown,
      });
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Limite de scans atteinte.');
        await stopScanner();
        onClose();
      } else {
        await stopScanner();
        onScanComplete({ barcode: code, result: null, barcodeNotFound: true });
      }
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  const startScanner = async () => {
    if (isProcessingRef.current) return;
    try {
      await stopScanner();
      setScanning(true);
      isProcessingRef.current = false;

      const html5QrCode = new Html5Qrcode(READER_ID);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 180 }, aspectRatio: 1.0 },
        async (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          await handleBarcodeScanned(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error('Erreur démarrage caméra:', err);
      toast.error("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setScanning(false);
      isProcessingRef.current = false;
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex flex-col bg-black/95"
      data-testid="scanner-camera-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Scanner alimentaire"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-black/60">
        <div className="flex items-center gap-2 text-white">
          <Camera className="w-5 h-5" />
          <span className="font-semibold text-sm">Scanner un produit</span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          data-testid="scanner-overlay-close"
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-10 h-10 animate-spin text-pink-400" />
            <p className="text-sm text-white/80">Analyse du produit…</p>
          </div>
        ) : (
          <>
            <p className="text-white/80 text-sm mb-4 text-center">
              Pointez la caméra vers le code-barres
            </p>
            <div
              id={READER_ID}
              className="w-full max-w-md rounded-2xl overflow-hidden border-2 border-white/20"
            />
            {scanning && (
              <p className="mt-4 text-xs text-white/50 animate-pulse">Recherche en cours…</p>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default ScannerCameraOverlay;

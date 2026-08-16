/**
 * PublicationQRCode — Génère un QR scannable depuis publication_id.
 * Payload encodé : `{resolveBackendUrl()}/api/scanner/publications/{id}`
 * (admin-only une fois résolu — sécurise le No-Log).
 *
 * Actions :
 *  - Aperçu canvas
 *  - Télécharger en PNG
 *  - Partager via Web Share API (fallback presse-papiers)
 */
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, QrCode } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { apiUrl } from '../../utils/backendUrl';

export default function PublicationQRCode({ publicationId, themeColor, targetApp }) {
  const canvasRef = useRef(null);
  const [dataUrl, setDataUrl] = useState(null);
  const [open, setOpen] = useState(false);

  const payloadUrl = apiUrl(`/api/scanner/publications/${publicationId}`);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    QRCode.toCanvas(
      canvasRef.current,
      payloadUrl,
      {
        width: 220,
        margin: 1,
        color: {
          dark: themeColor || '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) {
          toast.error('Erreur génération QR');
          return;
        }
        try {
          setDataUrl(canvasRef.current.toDataURL('image/png'));
        } catch {}
      }
    );
  }, [open, payloadUrl, themeColor]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `neriacorp-${publicationId}.png`;
    link.href = dataUrl;
    link.click();
    toast.success('QR téléchargé');
  };

  const handleShare = async () => {
    const text = `📦 NeriaCorp Publication\nID : ${publicationId}\nApp : ${targetApp}\nLien : ${payloadUrl}`;

    // Web Share API avec fichier (si supporté)
    if (navigator.share && dataUrl && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `neriacorp-${publicationId}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `NeriaCorp · ${publicationId}`,
            text,
            files: [file],
          });
          return;
        }
      } catch {
        // Continue with text fallback
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: 'NeriaCorp Publication', text });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copié dans le presse-papiers');
    } catch {
      toast.error('Partage indisponible');
    }
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="mt-2 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg py-1.5 h-auto"
        data-testid="neriacorp-show-qr-btn"
      >
        <QrCode className="w-3.5 h-3.5 mr-1.5" />
        Afficher le QR partageable
      </Button>
    );
  }

  return (
    <div
      className="mt-2 rounded-xl bg-white p-3 flex flex-col items-center gap-2"
      data-testid="neriacorp-qr-container"
    >
      <canvas ref={canvasRef} className="rounded-lg" />
      <div className="text-[10px] text-slate-500 font-mono break-all text-center">
        {publicationId}
      </div>
      <div className="flex gap-2 w-full">
        <Button
          onClick={handleDownload}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg py-1.5 h-auto"
          data-testid="neriacorp-qr-download"
        >
          <Download className="w-3.5 h-3.5 mr-1" /> PNG
        </Button>
        <Button
          onClick={handleShare}
          className="flex-1 text-white text-xs rounded-lg py-1.5 h-auto"
          style={{ background: themeColor || '#0f172a' }}
          data-testid="neriacorp-qr-share"
        >
          <Share2 className="w-3.5 h-3.5 mr-1" /> Partager
        </Button>
      </div>
    </div>
  );
}

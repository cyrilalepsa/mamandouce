import { useState } from 'react';
import { Button } from '../ui/button';
import { Share2, Copy, Check, MessageCircle, Mail, Link2 } from 'lucide-react';
import { toast } from 'sonner';

export function ShareAppSection() {
  const [copied, setCopied] = useState(false);
  
  // URL de l'application web
  const appUrl = "https://femme-enceinte-app.preview.emergentagent.com";
  
  // Message de partage
  const shareMessage = `Découvre MamanDouce, l'app qui m'accompagne pendant ma grossesse ! 🤰✨ Scanner d'aliments, conseils personnalisés, chatbot IA... Tout pour vivre sereinement cette belle aventure. ${appUrl}`;
  
  const shortMessage = `Découvre MamanDouce, l'app parfaite pour la grossesse ! 🤰 ${appUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MamanDouce - App Grossesse',
          text: shortMessage,
          url: appUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Erreur lors du partage');
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSMSShare = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
    window.location.href = smsUrl;
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Découvre MamanDouce - L'app parfaite pour la grossesse !");
    const body = encodeURIComponent(shareMessage);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Partagez MamanDouce avec vos amies enceintes ou qui prévoient une grossesse !
      </p>
      
      {/* Aperçu du lien */}
      <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-600 truncate">{appUrl}</span>
        </div>
        <Button
          onClick={handleCopyLink}
          data-testid="copy-link-btn"
          className={`flex-shrink-0 rounded-lg px-3 py-2 text-sm ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copié
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copier
            </>
          )}
        </Button>
      </div>

      {/* Bouton de partage principal */}
      <Button
        onClick={handleNativeShare}
        data-testid="share-app-btn"
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl py-3 font-semibold hover:opacity-90"
      >
        <Share2 className="w-5 h-5 mr-2" />
        Partager l'application
      </Button>

      {/* Options de partage spécifiques */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleWhatsAppShare}
          className="flex flex-col items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
        >
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs text-slate-600 font-medium">WhatsApp</span>
        </button>
        
        <button
          onClick={handleSMSShare}
          className="flex flex-col items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
        >
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs text-slate-600 font-medium">SMS</span>
        </button>
        
        <button
          onClick={handleEmailShare}
          className="flex flex-col items-center gap-2 p-3 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
        >
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs text-slate-600 font-medium">Email</span>
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Partagez le lien pour que vos amies puissent découvrir et installer l'application
      </p>
    </div>
  );
}

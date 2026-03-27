import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Image, QrCode } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function CarteVisitePage() {
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(true);

  const handleDownload = (type) => {
    const files = {
      pdf: '/MamanDouce_CarteVisite_v2.pdf',
      pngRecto: '/carte_recto_v2.png',
      pngVerso: '/carte_verso_v2.png',
      jpgRecto: '/MamanDouce_Recto_v2.jpg',
      jpgVerso: '/MamanDouce_Verso_v2.jpg'
    };
    
    if (files[type]) {
      window.open(files[type], '_blank');
    }
  };

  return (
    <div 
      className="min-h-screen p-6"
      style={{ 
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        fontFamily: "'Quicksand', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => navigate(-1)}
          className="bg-white rounded-full p-2 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Carte de Visite MamanDouce</h1>
          <p className="text-slate-500 text-sm">Modèle prêt à imprimer - Format 85mm x 55mm</p>
        </div>
      </div>

      {/* Toggle QR Code */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-full p-1 shadow-md flex gap-1">
          <button
            onClick={() => setShowQRCode(false)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              !showQRCode 
                ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sans QR Code
          </button>
          <button
            onClick={() => setShowQRCode(true)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              showQRCode 
                ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Avec QR Code
          </button>
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <button
          onClick={() => handleDownload('pdf')}
          className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-white text-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
        >
          <FileText className="w-4 h-4" />
          Télécharger PDF
        </button>
        <button
          onClick={() => handleDownload('pngRecto')}
          className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-white text-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899)' }}
        >
          <Image className="w-4 h-4" />
          PNG Recto
        </button>
        <button
          onClick={() => handleDownload('pngVerso')}
          className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-white text-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
        >
          <Image className="w-4 h-4" />
          PNG Verso
        </button>
      </div>

      {/* Cards Container */}
      <div className="flex flex-wrap justify-center gap-8 mb-10">
        {/* RECTO */}
        <div className="text-center">
          <div className="font-bold text-slate-800 mb-4 text-lg">RECTO</div>
          <div 
            className="w-[340px] h-[220px] rounded-xl overflow-hidden"
            style={{ 
              boxShadow: '0 10px 40px rgba(236, 72, 153, 0.2)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%)'
            }}
          >
            <div className="h-full flex flex-col items-center justify-center p-5 relative">
              {/* Top gradient bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: 'linear-gradient(90deg, #f472b6, #fb7185, #f97316)' }}
              />
              
              <div className="text-4xl mb-1">🤱</div>
              <div 
                className="text-3xl font-semibold"
                style={{ 
                  fontFamily: "'Dancing Script', cursive",
                  background: 'linear-gradient(90deg, #f472b6, #fb7185, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                MamanDouce
              </div>
              <div className="text-slate-500 text-xs mt-1 text-center leading-tight">
                Votre compagnon avant, pendant<br/>et après la grossesse
              </div>
              
              {showQRCode && (
                <div className="flex items-center gap-3 mt-4">
                  <div 
                    className="w-14 h-14 border-2 border-dashed border-pink-400 rounded-lg flex items-center justify-center text-pink-400 text-[10px] font-semibold"
                  >
                    QR<br/>CODE
                  </div>
                  <div className="text-[10px] text-slate-500 leading-snug text-left">
                    Scannez pour<br/>télécharger l'app
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VERSO */}
        <div className="text-center">
          <div className="font-bold text-slate-800 mb-4 text-lg">VERSO</div>
          <div 
            className="w-[340px] h-[220px] rounded-xl overflow-hidden p-4 flex flex-col justify-between"
            style={{ 
              boxShadow: '0 10px 40px rgba(236, 72, 153, 0.15)',
              background: 'linear-gradient(145deg, #fdf2f8 0%, #fce7f3 25%, #fbcfe8 50%, #f9a8d4 80%, #f472b6 100%)'
            }}
          >
            <ul className="space-y-0.5 text-left">
              <li className="flex items-center gap-2 text-[11px] font-bold text-pink-600">
                <span className="text-pink-500">✓</span> Suivi règles & ovulation
              </li>
              <li className="flex items-center gap-2 text-[11px] text-pink-700">
                <span className="text-pink-500">✓</span> Suivi grossesse semaine/semaine
              </li>
              <li className="flex items-center gap-2 text-[11px] text-pink-700">
                <span className="text-pink-500">✓</span> Scanner d'aliments autorisés
              </li>
              <li className="flex items-center gap-2 text-[11px] text-pink-700">
                <span className="text-pink-500">✓</span> Idées de prénoms
              </li>
              <li className="flex items-center gap-2 text-[11px] text-pink-700">
                <span className="text-pink-500">✓</span> Chatbot IA disponible 24/7
              </li>
              <li className="flex items-center gap-2 text-[11px] text-pink-700">
                <span className="text-pink-500">✓</span> Recettes post-partum
              </li>
              <li className="flex items-center gap-2 text-[11px] text-pink-700">
                <span className="text-pink-500">✓</span> 100% adapté à la France
              </li>
              <li className="flex items-center justify-center gap-1 text-[11px] font-medium mt-1 text-pink-600">
                <span className="text-[8px]">💕</span>
                <span className="text-[10px]">❤️</span>
                <span className="text-[12px]">💗</span>
                <span className="mx-1">... et bien d'autres !</span>
                <span className="text-[12px]">💗</span>
                <span className="text-[10px]">❤️</span>
                <span className="text-[8px]">💕</span>
              </li>
            </ul>
            
            <div className="border-t border-pink-300/50 pt-2 mt-1">
              <div className="flex flex-col gap-1 text-xs text-pink-700">
                <span className="flex items-center gap-2">📞 06 08 76 67 38</span>
                <span className="flex items-center gap-2">📧 cyrilalepsa@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions d'impression */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          🖨️ Instructions d'impression
        </h2>
        <ul className="text-slate-600 space-y-2 text-sm">
          <li><strong>Format :</strong> 85mm x 55mm (format carte de visite standard)</li>
          <li><strong>Papier recommandé :</strong> 350g/m² couché mat ou soft touch premium</li>
          <li><strong>Finition :</strong> Coins arrondis (rayon 3mm) pour un look moderne</li>
          <li><strong>Impression :</strong> Recto-verso, quadrichromie (CMJN)</li>
          <li><strong>Quantité suggérée :</strong> 500 exemplaires (~40-60€ chez Vistaprint, Moo)</li>
        </ul>
        
        {showQRCode && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4 rounded-r-lg">
            <strong className="text-amber-800">💡 QR Code :</strong>
            <span className="text-amber-700 text-sm ml-1">
              Une fois votre application publiée sur Google Play, générez votre QR Code sur 
              <a href="https://www.qr-code-generator.com/" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                qr-code-generator.com
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

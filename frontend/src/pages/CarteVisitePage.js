import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Image } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function CarteVisitePage() {
  const navigate = useNavigate();

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
            <div className="h-full flex flex-col items-center justify-center p-6 relative">
              {/* Top gradient bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: 'linear-gradient(90deg, #f472b6, #fb7185, #f97316)' }}
              />
              
              <div className="text-5xl mb-2">🤱</div>
              <div 
                className="text-4xl font-semibold"
                style={{ 
                  fontFamily: "'Dancing Script', cursive",
                  background: 'linear-gradient(90deg, #f472b6, #fb7185, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                MamanDouce
              </div>
              <div className="text-slate-500 text-sm mt-2">Votre compagnon de grossesse</div>
              
              <div className="flex items-center gap-4 mt-4">
                <div 
                  className="w-14 h-14 border-2 border-dashed border-pink-400 rounded-lg flex items-center justify-center text-pink-400 text-xs font-semibold"
                >
                  QR<br/>CODE
                </div>
                <div className="text-xs text-slate-500 leading-snug">
                  Scannez pour<br/>télécharger l'app
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VERSO */}
        <div className="text-center">
          <div className="font-bold text-slate-800 mb-4 text-lg">VERSO</div>
          <div 
            className="w-[340px] h-[220px] rounded-xl overflow-hidden text-white p-5 flex flex-col justify-between"
            style={{ 
              boxShadow: '0 10px 40px rgba(236, 72, 153, 0.2)',
              background: 'linear-gradient(135deg, #f472b6 0%, #fb7185 50%, #f97316 100%)'
            }}
          >
            <ul className="space-y-1.5 text-left">
              <li className="flex items-center gap-2 text-sm font-bold">
                <span>✓</span> Suivi et calcul des règles et ovulation
              </li>
              <li className="flex items-center gap-2 text-xs">
                <span>✓</span> Suivi semaine par semaine
              </li>
              <li className="flex items-center gap-2 text-xs">
                <span>✓</span> Scanner d'aliments autorisés
              </li>
              <li className="flex items-center gap-2 text-xs">
                <span>✓</span> Chatbot IA disponible 24/7
              </li>
              <li className="flex items-center gap-2 text-xs">
                <span>✓</span> Recettes post-partum
              </li>
              <li className="flex items-center gap-2 text-xs">
                <span>✓</span> 100% adapté à la France
              </li>
            </ul>
            
            <div className="border-t border-white/30 pt-3 mt-2">
              <div className="flex flex-col gap-1.5 text-sm">
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
        
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4 rounded-r-lg">
          <strong className="text-amber-800">💡 QR Code :</strong>
          <span className="text-amber-700 text-sm ml-1">
            Une fois votre application publiée sur Google Play, générez votre QR Code sur 
            <a href="https://www.qr-code-generator.com/" target="_blank" rel="noopener noreferrer" className="underline ml-1">
              qr-code-generator.com
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

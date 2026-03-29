import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Image, QrCode, ChevronDown, Printer, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function CarteVisitePage() {
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCarteVisite, setShowCarteVisite] = useState(true);

  const handleDownload = (type) => {
    const filesWithQR = {
      pdf: '/MamanDouce_CarteVisite_v2.pdf',
      pngRecto: '/carte_recto_v2.png',
      pngVerso: '/carte_verso_v2.png',
    };
    
    const filesWithoutQR = {
      pdf: '/MamanDouce_CarteVisite.pdf',
      pngRecto: '/carte_recto.png',
      pngVerso: '/carte_verso.png',
    };
    
    const files = showQRCode ? filesWithQR : filesWithoutQR;
    
    if (files[type]) {
      window.open(files[type], '_blank');
    }
  };

  // Composant cœurs flottants (bulles)
  const FloatingHearts = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Cœurs comme des bulles flottantes */}
      <div className="absolute top-3 left-4 text-[10px] opacity-30" style={{ filter: 'drop-shadow(0 0 3px rgba(244,114,182,0.5))' }}>💗</div>
      <div className="absolute top-6 right-6 text-[14px] opacity-25" style={{ filter: 'drop-shadow(0 0 4px rgba(244,114,182,0.5))' }}>💕</div>
      <div className="absolute top-12 left-8 text-[8px] opacity-40" style={{ filter: 'drop-shadow(0 0 2px rgba(244,114,182,0.5))' }}>❤️</div>
      <div className="absolute bottom-16 right-4 text-[12px] opacity-20" style={{ filter: 'drop-shadow(0 0 4px rgba(244,114,182,0.5))' }}>💗</div>
      <div className="absolute bottom-20 left-6 text-[6px] opacity-35" style={{ filter: 'drop-shadow(0 0 2px rgba(244,114,182,0.5))' }}>💕</div>
      <div className="absolute top-16 right-12 text-[7px] opacity-30" style={{ filter: 'drop-shadow(0 0 2px rgba(244,114,182,0.5))' }}>❤️</div>
    </div>
  );

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
          <h1 className="text-2xl font-bold text-slate-800">Kit Business MamanDouce</h1>
          <p className="text-slate-500 text-sm">Outils de communication pour promouvoir votre application</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Instructions d'impression - Menu déroulant */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-slate-800">Instructions d'impression</h2>
                <p className="text-slate-500 text-sm">Format, papier, finitions recommandées</p>
              </div>
            </div>
            <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
          </button>
          
          {showInstructions && (
            <div className="px-5 pb-5 border-t border-slate-100 animate-fade-in">
              <ul className="text-slate-600 space-y-3 text-sm mt-4">
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <div><strong>Format :</strong> 85mm x 55mm (format carte de visite standard)</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <div><strong>Papier recommandé :</strong> 350g/m² couché mat ou soft touch premium</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <div><strong>Finition :</strong> Coins arrondis (rayon 3mm) pour un look moderne</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <div><strong>Impression :</strong> Recto-verso, quadrichromie (CMJN)</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <div><strong>Quantité suggérée :</strong> 500 exemplaires (~40-60€ chez Vistaprint, Moo)</div>
                </li>
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
          )}
        </div>

        {/* Carte de visite - Menu déroulant */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => setShowCarteVisite(!showCarteVisite)}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-slate-800">Carte de visite</h2>
                <p className="text-slate-500 text-sm">Aperçu recto/verso et fichiers téléchargeables</p>
              </div>
            </div>
            <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${showCarteVisite ? 'rotate-180' : ''}`} />
          </button>
          
          {showCarteVisite && (
            <div className="px-5 pb-5 border-t border-slate-100 animate-fade-in">
              
              {/* Toggle QR Code */}
              <div className="flex justify-center my-4">
                <div className="bg-slate-100 rounded-full p-1 flex gap-1">
                  <button
                    onClick={() => setShowQRCode(false)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      !showQRCode 
                        ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white' 
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Sans QR Code
                  </button>
                  <button
                    onClick={() => setShowQRCode(true)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                      showQRCode 
                        ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white' 
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    Avec QR Code
                  </button>
                </div>
              </div>

              {/* Aperçu Recto / Verso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                
                {/* RECTO */}
                <div className="text-center">
                  <div className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Recto</div>
                  <div 
                    className="w-full max-w-[340px] mx-auto aspect-[85/55] rounded-xl overflow-hidden relative"
                    style={{ 
                      boxShadow: '0 10px 40px rgba(236, 72, 153, 0.2)',
                      background: 'linear-gradient(160deg, #bfdbfe 0%, #dbeafe 15%, #f8fafc 35%, #f8fafc 50%, #fce7f3 65%, #fbcfe8 80%, #f9a8d4 100%)'
                    }}
                  >
                    {/* Cœurs flottants */}
                    <FloatingHearts />
                    
                    <div className="h-full flex flex-col items-center justify-center py-4 px-5 relative z-10">
                      {/* Top gradient bar */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-2"
                        style={{ background: 'linear-gradient(90deg, #93c5fd 0%, #bfdbfe 20%, #f1f5f9 40%, #f1f5f9 60%, #fbcfe8 80%, #f9a8d4 100%)' }}
                      />
                      
                      {/* Contenu centré au milieu */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-4xl mb-1">🤱</div>
                        <div 
                          className="font-semibold text-2xl"
                          style={{ 
                            fontFamily: "'Dancing Script', cursive",
                            color: '#ec4899'
                          }}
                        >
                          MamanDouce
                        </div>
                        <div 
                          className="text-center leading-snug mt-2 text-[11px] font-medium"
                          style={{ 
                            fontFamily: "'Quicksand', sans-serif",
                            color: '#475569'
                          }}
                        >
                          Votre compagnon, pas à pas,<br/>jusqu'à la rencontre.
                        </div>
                      </div>
                      
                      {/* URL en bas */}
                      <div 
                        className="absolute bottom-3 text-[9px] font-semibold tracking-wide"
                        style={{ color: '#ec4899' }}
                      >
                        mamandouce.cycafamily.com
                      </div>
                    </div>
                  </div>
                </div>

                {/* VERSO */}
                <div className="text-center">
                  <div className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Verso</div>
                  <div 
                    className="w-full max-w-[340px] mx-auto aspect-[85/55] rounded-xl overflow-hidden relative"
                    style={{ 
                      boxShadow: '0 10px 40px rgba(236, 72, 153, 0.15)',
                      background: 'linear-gradient(160deg, #bfdbfe 0%, #dbeafe 15%, #f8fafc 35%, #f8fafc 50%, #fce7f3 65%, #fbcfe8 80%, #f9a8d4 100%)'
                    }}
                  >
                    {/* Cœurs flottants */}
                    <FloatingHearts />
                    
                    <div className="h-full flex flex-col items-center justify-center py-4 px-5 relative z-10">
                      {/* Barre du haut */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-2"
                        style={{ background: 'linear-gradient(90deg, #93c5fd 0%, #bfdbfe 20%, #f1f5f9 40%, #f1f5f9 60%, #fbcfe8 80%, #f9a8d4 100%)' }}
                      />
                      
                      {/* Contenu centré au milieu */}
                      <div className="flex flex-col items-center justify-center">
                        {/* Titre principal en style Dancing Script comme MamanDouce */}
                        <div 
                          className="font-semibold text-lg text-center leading-tight"
                          style={{ 
                            fontFamily: "'Dancing Script', cursive",
                            color: '#ec4899'
                          }}
                        >
                          Vivez votre grossesse<br/>en toute sérénité
                        </div>
                        
                        <div 
                          className="text-[9px] mt-1.5 text-center leading-snug font-medium"
                          style={{ 
                            fontFamily: "'Quicksand', sans-serif",
                            color: '#475569'
                          }}
                        >
                          Une bulle de douceur et de confiance<br/>pour vous accompagner
                        </div>
                        
                        {/* QR Code ou Halo */}
                        {showQRCode ? (
                          <div className="flex flex-col items-center mt-1.5">
                            <div 
                              className="relative"
                              style={{
                                filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 25px rgba(255,255,255,0.7))'
                              }}
                            >
                              <div 
                                className="w-14 h-14 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-[8px] font-bold"
                                style={{
                                  boxShadow: '0 0 20px rgba(255,255,255,0.9), 0 0 35px rgba(255,255,255,0.6)'
                                }}
                              >
                                QR<br/>CODE
                              </div>
                            </div>
                            <div 
                              className="text-[7px] text-slate-500 text-center mt-1 font-medium"
                              style={{ fontFamily: "'Quicksand', sans-serif" }}
                            >
                              ✨ Scannez pour rejoindre l'aventure ✨
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="text-[7px] text-slate-500 text-center mt-5 px-2 py-1 font-medium whitespace-nowrap"
                            style={{ 
                              fontFamily: "'Quicksand', sans-serif",
                              textShadow: '0 0 15px rgba(255,255,255,1), 0 0 30px rgba(255,255,255,0.8)',
                              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, transparent 70%)'
                            }}
                          >
                            ✨ Ajoutez l'application à votre écran d'accueil ✨
                          </div>
                        )}
                      </div>
                      
                      {/* Contact en bas */}
                      <div className="absolute bottom-2 w-full border-t border-pink-300/40 pt-1.5">
                        <div className="flex justify-center gap-3 text-[8px] text-slate-500">
                          <span>📞 06 08 76 67 38</span>
                          <span>📧 cyrilalepsa@gmail.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons de téléchargement */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 text-center">📥 Fichiers téléchargeables</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={() => handleDownload('pdf')}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl px-4 py-2 hover:opacity-90 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    PDF Complet
                  </Button>
                  <Button
                    onClick={() => handleDownload('pngRecto')}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl px-4 py-2 hover:opacity-90 flex items-center gap-2"
                  >
                    <Image className="w-4 h-4" />
                    PNG Recto
                  </Button>
                  <Button
                    onClick={() => handleDownload('pngVerso')}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl px-4 py-2 hover:opacity-90 flex items-center gap-2"
                  >
                    <Image className="w-4 h-4" />
                    PNG Verso
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

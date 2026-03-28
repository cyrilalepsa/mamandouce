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

  // Icône maman-bébé en SVG
  const MamanBebeIcon = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="18" r="10" fill="#f9a8d4"/>
      <ellipse cx="24" cy="42" rx="14" ry="18" fill="#f472b6"/>
      <path d="M14 18c0-8 6-14 14-14s10 6 10 14c0-4-4-8-10-8s-14 4-14 8z" fill="#854d0e"/>
      <circle cx="21" cy="16" r="1.5" fill="#374151"/>
      <circle cx="27" cy="16" r="1.5" fill="#374151"/>
      <path d="M22 21c1 1.5 3 1.5 4 0" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="44" cy="32" r="8" fill="#fcd34d"/>
      <ellipse cx="44" cy="48" rx="8" ry="10" fill="#fbbf24"/>
      <circle cx="42" cy="31" r="1" fill="#374151"/>
      <circle cx="46" cy="31" r="1" fill="#374151"/>
      <path d="M42 35c0.8 1 2.2 1 3 0" stroke="#374151" strokeWidth="1" strokeLinecap="round"/>
      <path d="M34 36c4-2 8 0 10 4" stroke="#f472b6" strokeWidth="4" strokeLinecap="round"/>
      <path d="M30 28c-1-2 1-4 3-3 2-1 4 1 3 3l-3 4-3-4z" fill="#ef4444"/>
    </svg>
  );

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
                    className="w-full max-w-[340px] mx-auto aspect-[85/55] rounded-xl overflow-hidden"
                    style={{ 
                      boxShadow: '0 10px 40px rgba(236, 72, 153, 0.2)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%)'
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-between py-4 px-5 relative">
                      {/* Top gradient bar */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ background: 'linear-gradient(90deg, #f472b6, #fb7185, #f97316)' }}
                      />
                      
                      {/* Contenu centré */}
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <MamanBebeIcon size={showQRCode ? 40 : 52} />
                        <div 
                          className={`font-semibold mt-1 ${showQRCode ? 'text-2xl' : 'text-3xl'}`}
                          style={{ 
                            fontFamily: "'Dancing Script', cursive",
                            background: 'linear-gradient(90deg, #f472b6, #fb7185, #f97316)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          MamanDouce
                        </div>
                        <div className={`text-slate-600 text-center leading-snug font-medium mt-2 ${showQRCode ? 'text-[9px]' : 'text-[11px]'}`}>
                          Votre compagnon, pas à pas,<br/>jusqu'à la rencontre.
                        </div>
                      </div>
                      
                      {/* URL en bas */}
                      <div className="text-[9px] text-pink-500 font-semibold tracking-wide">
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
                      background: 'linear-gradient(160deg, #ffffff 0%, #ffffff 30%, #fdf2f8 50%, #fce7f3 70%, #fbcfe8 90%, #f9a8d4 100%)'
                    }}
                  >
                    {/* Cœurs flottants en bulles */}
                    <FloatingHearts />
                    
                    <div className="h-full flex flex-col items-center justify-between py-3 px-4 relative z-10">
                      
                      {/* Titre principal */}
                      <div className="text-center mt-1">
                        <div 
                          className="text-[13px] font-bold text-pink-600 leading-tight"
                          style={{ letterSpacing: '0.5px' }}
                        >
                          Vivez votre grossesse en toute sérénité
                        </div>
                        <div 
                          className="text-[9px] text-pink-500/80 mt-1 leading-snug"
                          style={{ 
                            fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                            fontStyle: 'italic'
                          }}
                        >
                          Une bulle de douceur et de confiance<br/>pour vous accompagner
                        </div>
                      </div>
                      
                      {/* QR Code avec halo (ou espace si sans QR) */}
                      {showQRCode ? (
                        <div className="flex items-center gap-3 my-2">
                          {/* QR Code avec halo lumineux */}
                          <div 
                            className="relative"
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(244,114,182,0.4)) drop-shadow(0 0 16px rgba(251,191,36,0.3))'
                            }}
                          >
                            <div 
                              className="w-12 h-12 bg-white border-2 border-pink-300 rounded-lg flex items-center justify-center text-pink-500 text-[8px] font-bold"
                              style={{
                                boxShadow: '0 0 20px rgba(244,114,182,0.3), inset 0 0 10px rgba(251,191,36,0.1)'
                              }}
                            >
                              QR<br/>CODE
                            </div>
                          </div>
                          <div 
                            className="text-[8px] text-pink-600 leading-snug text-left"
                            style={{ fontFamily: "'Dancing Script', cursive" }}
                          >
                            Scannez pour<br/>commencer l'aventure
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center my-2">
                          <div 
                            className="text-[10px] text-pink-500 font-medium text-center px-4 py-2 rounded-full"
                            style={{ 
                              background: 'rgba(255,255,255,0.7)',
                              fontFamily: "'Dancing Script', cursive"
                            }}
                          >
                            ✨ Commencez l'aventure sur notre app ✨
                          </div>
                        </div>
                      )}
                      
                      {/* Contact en bas */}
                      <div className="w-full border-t border-pink-200/50 pt-2">
                        <div className="flex justify-center gap-4 text-[8px] text-pink-700">
                          <span className="flex items-center gap-1">📞 06 08 76 67 38</span>
                          <span className="flex items-center gap-1">📧 cyrilalepsa@gmail.com</span>
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

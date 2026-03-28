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

  // Icône maman-bébé en SVG pour cohérence entre aperçu et téléchargement
  const MamanBebeIcon = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Maman */}
      <circle cx="24" cy="18" r="10" fill="#f9a8d4"/>
      <ellipse cx="24" cy="42" rx="14" ry="18" fill="#f472b6"/>
      {/* Cheveux */}
      <path d="M14 18c0-8 6-14 14-14s10 6 10 14c0-4-4-8-10-8s-14 4-14 8z" fill="#854d0e"/>
      {/* Visage maman */}
      <circle cx="21" cy="16" r="1.5" fill="#374151"/>
      <circle cx="27" cy="16" r="1.5" fill="#374151"/>
      <path d="M22 21c1 1.5 3 1.5 4 0" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Bébé */}
      <circle cx="44" cy="32" r="8" fill="#fcd34d"/>
      <ellipse cx="44" cy="48" rx="8" ry="10" fill="#fbbf24"/>
      {/* Visage bébé */}
      <circle cx="42" cy="31" r="1" fill="#374151"/>
      <circle cx="46" cy="31" r="1" fill="#374151"/>
      <path d="M42 35c0.8 1 2.2 1 3 0" stroke="#374151" strokeWidth="1" strokeLinecap="round"/>
      {/* Bras maman tenant bébé */}
      <path d="M34 36c4-2 8 0 10 4" stroke="#f472b6" strokeWidth="4" strokeLinecap="round"/>
      {/* Coeur */}
      <path d="M30 28c-1-2 1-4 3-3 2-1 4 1 3 3l-3 4-3-4z" fill="#ef4444"/>
    </svg>
  );

  return (
    <div 
      className="min-h-screen p-6"
      style={{ 
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        fontFamily: "'Quicksand', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      {/* Header - Kit Business */}
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
        
        {/* 🖨️ INSTRUCTIONS D'IMPRESSION - Menu déroulant */}
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

        {/* 📇 CARTE DE VISITE - Menu déroulant */}
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
                      <div 
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ background: 'linear-gradient(90deg, #f472b6, #fb7185, #f97316)' }}
                      />
                      
                      {showQRCode ? (
                        <>
                          <div className="flex flex-col items-center pt-2">
                            <MamanBebeIcon size={36} />
                            <div 
                              className="text-xl font-semibold mt-1"
                              style={{ 
                                fontFamily: "'Dancing Script', cursive",
                                background: 'linear-gradient(90deg, #f472b6, #fb7185, #f97316)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                              }}
                            >
                              MamanDouce
                            </div>
                            <div className="text-slate-500 text-[9px] mt-0.5 text-center leading-tight">
                              Votre compagnon avant, pendant<br/>et après la grossesse
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1">
                            <div className="w-10 h-10 border-2 border-dashed border-pink-400 rounded-lg flex items-center justify-center text-pink-400 text-[8px] font-semibold">
                              QR<br/>CODE
                            </div>
                            <div className="text-[8px] text-slate-500 leading-snug text-left">
                              Scannez pour<br/>télécharger l'app
                            </div>
                          </div>
                          
                          <div className="text-[8px] text-pink-400 font-medium tracking-wide">
                            mamandouce.cycafamily.com
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 flex flex-col items-center justify-center">
                            <MamanBebeIcon size={52} />
                            <div 
                              className="text-2xl font-semibold mt-1"
                              style={{ 
                                fontFamily: "'Dancing Script', cursive",
                                background: 'linear-gradient(90deg, #f472b6, #fb7185, #f97316)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                              }}
                            >
                              MamanDouce
                            </div>
                            <div className="text-slate-600 text-[10px] text-center leading-snug font-medium mt-1">
                              Votre compagnon avant, pendant<br/>et après la grossesse
                            </div>
                          </div>
                          
                          <div className="text-[9px] text-pink-500 font-semibold tracking-wide">
                            mamandouce.cycafamily.com
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* VERSO */}
                <div className="text-center">
                  <div className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Verso</div>
                  <div 
                    className="w-full max-w-[340px] mx-auto aspect-[85/55] rounded-xl overflow-hidden p-3 flex flex-col justify-between"
                    style={{ 
                      boxShadow: '0 10px 40px rgba(236, 72, 153, 0.15)',
                      background: 'linear-gradient(160deg, #ffffff 0%, #ffffff 20%, #fdf2f8 35%, #fce7f3 50%, #fbcfe8 70%, #f9a8d4 90%, #f472b6 100%)'
                    }}
                  >
                    <ul className="space-y-0 text-left">
                      <li className="flex items-center gap-1.5 text-[9px] font-bold text-pink-700">
                        <span className="text-pink-600">✓</span> Suivi règles & ovulation
                      </li>
                      <li className="flex items-center gap-1.5 text-[9px] text-pink-700">
                        <span className="text-pink-600">✓</span> Suivi grossesse semaine/semaine
                      </li>
                      <li className="flex items-center gap-1.5 text-[9px] text-pink-700">
                        <span className="text-pink-600">✓</span> Scanner d'aliments autorisés
                      </li>
                      <li className="flex items-center gap-1.5 text-[9px] text-pink-700">
                        <span className="text-pink-600">✓</span> Idées de prénoms
                      </li>
                      <li className="flex items-center gap-1.5 text-[9px] text-pink-700">
                        <span className="text-pink-600">✓</span> Chatbot IA disponible 24/7
                      </li>
                      <li className="flex items-center gap-1.5 text-[9px] text-pink-700">
                        <span className="text-pink-600">✓</span> Recettes post-partum
                      </li>
                      <li className="flex items-center gap-1.5 text-[9px] text-pink-700">
                        <span className="text-pink-600">✓</span> 100% adapté à la France
                      </li>
                      <li className="flex items-center justify-center gap-0.5 text-[9px] font-medium mt-0.5 text-pink-700">
                        <span style={{ filter: 'drop-shadow(0 0 4px white) drop-shadow(0 0 6px white)' }}>💕</span>
                        <span style={{ filter: 'drop-shadow(0 0 5px white) drop-shadow(0 0 8px white)' }}>❤️</span>
                        <span style={{ filter: 'drop-shadow(0 0 6px white) drop-shadow(0 0 10px white)' }}>💗</span>
                        <span className="mx-0.5">... et bien d'autres !</span>
                        <span style={{ filter: 'drop-shadow(0 0 6px white) drop-shadow(0 0 10px white)' }}>💗</span>
                        <span style={{ filter: 'drop-shadow(0 0 5px white) drop-shadow(0 0 8px white)' }}>❤️</span>
                        <span style={{ filter: 'drop-shadow(0 0 4px white) drop-shadow(0 0 6px white)' }}>💕</span>
                      </li>
                    </ul>
                    
                    <div className="border-t border-pink-400/40 pt-1.5 mt-1">
                      <div className="flex flex-col gap-0.5 text-[9px] text-pink-800">
                        <span className="flex items-center gap-1.5">📞 06 08 76 67 38</span>
                        <span className="flex items-center gap-1.5">📧 cyrilalepsa@gmail.com</span>
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

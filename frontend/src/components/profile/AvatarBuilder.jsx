import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { X, Check, Camera, ChevronLeft, ChevronRight } from 'lucide-react';

// Configuration des options d'avatar
const AVATAR_OPTIONS = {
  faceShape: [
    { id: 'round', name: 'Rond', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
    { id: 'oval', name: 'Ovale', path: 'M12 2C8 2 4 6 4 12s4 10 8 10 8-4 8-10-4-10-8-10z' },
    { id: 'heart', name: 'Cœur', path: 'M12 2C7 2 3 5 3 10c0 6 9 12 9 12s9-6 9-12c0-5-4-8-9-8z' },
    { id: 'square', name: 'Carré', path: 'M4 4h16v16H4z', rx: 4 },
  ],
  skinTone: [
    { id: 'light', name: 'Claire', color: '#FDEBD0' },
    { id: 'light-medium', name: 'Claire-Moyenne', color: '#F5CBA7' },
    { id: 'medium', name: 'Moyenne', color: '#E0A370' },
    { id: 'medium-dark', name: 'Moyenne-Foncée', color: '#C68642' },
    { id: 'dark', name: 'Foncée', color: '#8D5524' },
    { id: 'deep', name: 'Très Foncée', color: '#5C3317' },
  ],
  hairStyle: [
    { id: 'long-straight', name: 'Long Lisse' },
    { id: 'long-wavy', name: 'Long Ondulé' },
    { id: 'medium-straight', name: 'Mi-long Lisse' },
    { id: 'medium-curly', name: 'Mi-long Bouclé' },
    { id: 'short', name: 'Court' },
    { id: 'curly', name: 'Bouclé' },
    { id: 'afro', name: 'Afro' },
    { id: 'braids', name: 'Tresses' },
    { id: 'bun', name: 'Chignon' },
    { id: 'hijab', name: 'Hijab' },
  ],
  hairColor: [
    { id: 'black', name: 'Noir', color: '#1a1a1a' },
    { id: 'dark-brown', name: 'Brun Foncé', color: '#3d2314' },
    { id: 'brown', name: 'Châtain', color: '#6b4423' },
    { id: 'light-brown', name: 'Châtain Clair', color: '#a67c52' },
    { id: 'blonde', name: 'Blond', color: '#d4a76a' },
    { id: 'red', name: 'Roux', color: '#b55239' },
    { id: 'gray', name: 'Gris', color: '#9e9e9e' },
    { id: 'white', name: 'Blanc', color: '#e8e8e8' },
  ],
  glasses: [
    { id: 'none', name: 'Sans lunettes' },
    { id: 'round', name: 'Rondes' },
    { id: 'square', name: 'Carrées' },
    { id: 'cat', name: 'Œil de chat' },
  ],
};

// Composant pour générer l'avatar SVG
function AvatarPreview({ config, size = 120 }) {
  const { faceShape, skinTone, hairStyle, hairColor, glasses } = config;
  
  const skin = AVATAR_OPTIONS.skinTone.find(s => s.id === skinTone)?.color || '#F5CBA7';
  const hair = AVATAR_OPTIONS.hairColor.find(h => h.id === hairColor)?.color || '#3d2314';
  
  // Rendu des cheveux selon le style
  const renderHair = () => {
    const hairPaths = {
      'long-straight': (
        <>
          <path d="M6 8c0-4 3-6 6-6s6 2 6 6v2c0 1-1 2-2 2h-8c-1 0-2-1-2-2V8z" fill={hair} />
          <path d="M5 10c0 0-1 4-1 8s1 6 1 6h2s-1-2-1-6 1-8 1-8H5z" fill={hair} />
          <path d="M19 10c0 0 1 4 1 8s-1 6-1 6h-2s1-2 1-6-1-8-1-8h3z" fill={hair} />
        </>
      ),
      'long-wavy': (
        <>
          <path d="M6 8c0-4 3-6 6-6s6 2 6 6v2c0 1-1 2-2 2h-8c-1 0-2-1-2-2V8z" fill={hair} />
          <path d="M5 10c0 0-2 4-1 8s1 6 2 6c0 0-1-3 0-6s1-8 1-8H5z" fill={hair} />
          <path d="M19 10c0 0 2 4 1 8s-1 6-2 6c0 0 1-3 0-6s-1-8-1-8h3z" fill={hair} />
        </>
      ),
      'medium-straight': (
        <>
          <path d="M6 8c0-4 3-6 6-6s6 2 6 6v2c0 1-1 2-2 2h-8c-1 0-2-1-2-2V8z" fill={hair} />
          <path d="M5 10v4c0 1 1 2 2 2h1v-6H5z" fill={hair} />
          <path d="M19 10v4c0 1-1 2-2 2h-1v-6h3z" fill={hair} />
        </>
      ),
      'medium-curly': (
        <>
          <path d="M6 8c0-4 3-6 6-6s6 2 6 6v2c0 1-1 2-2 2h-8c-1 0-2-1-2-2V8z" fill={hair} />
          <ellipse cx="5" cy="12" rx="2" ry="3" fill={hair} />
          <ellipse cx="19" cy="12" rx="2" ry="3" fill={hair} />
          <ellipse cx="6" cy="15" rx="1.5" ry="2" fill={hair} />
          <ellipse cx="18" cy="15" rx="1.5" ry="2" fill={hair} />
        </>
      ),
      'short': (
        <path d="M6 9c0-4 3-6 6-6s6 2 6 6c0 2-1 3-2 3h-8c-1 0-2-1-2-3z" fill={hair} />
      ),
      'curly': (
        <>
          <ellipse cx="8" cy="6" rx="3" ry="3" fill={hair} />
          <ellipse cx="12" cy="4" rx="3" ry="3" fill={hair} />
          <ellipse cx="16" cy="6" rx="3" ry="3" fill={hair} />
          <ellipse cx="6" cy="9" rx="2" ry="2" fill={hair} />
          <ellipse cx="18" cy="9" rx="2" ry="2" fill={hair} />
        </>
      ),
      'afro': (
        <>
          <ellipse cx="12" cy="8" rx="9" ry="8" fill={hair} />
          <ellipse cx="5" cy="10" rx="3" ry="4" fill={hair} />
          <ellipse cx="19" cy="10" rx="3" ry="4" fill={hair} />
        </>
      ),
      'braids': (
        <>
          <path d="M6 8c0-4 3-6 6-6s6 2 6 6v2c0 1-1 2-2 2h-8c-1 0-2-1-2-2V8z" fill={hair} />
          <path d="M5 10l-1 12h2l1-12H5z" fill={hair} />
          <path d="M19 10l1 12h-2l-1-12h2z" fill={hair} />
          <path d="M8 10v10h1.5V10H8z" fill={hair} />
          <path d="M14.5 10v10H16V10h-1.5z" fill={hair} />
        </>
      ),
      'bun': (
        <>
          <path d="M6 9c0-4 3-6 6-6s6 2 6 6c0 2-1 3-2 3h-8c-1 0-2-1-2-3z" fill={hair} />
          <ellipse cx="12" cy="3" rx="4" ry="3" fill={hair} />
        </>
      ),
      'hijab': (
        <>
          <path d="M4 10c0-5 4-9 8-9s8 4 8 9c0 3-2 5-4 6v6H8v-6c-2-1-4-3-4-6z" fill={hair} />
          <path d="M8 22v-4c2 1 4 1 8 0v4c-2 1-6 1-8 0z" fill={hair} />
        </>
      ),
    };
    return hairPaths[hairStyle] || hairPaths['medium-straight'];
  };

  // Rendu des lunettes
  const renderGlasses = () => {
    if (glasses === 'none') return null;
    const glassesStyles = {
      'round': (
        <>
          <circle cx="9" cy="12" r="2.5" fill="none" stroke="#333" strokeWidth="0.5" />
          <circle cx="15" cy="12" r="2.5" fill="none" stroke="#333" strokeWidth="0.5" />
          <path d="M11.5 12h1" stroke="#333" strokeWidth="0.5" />
          <path d="M6.5 12H5M17.5 12H19" stroke="#333" strokeWidth="0.5" />
        </>
      ),
      'square': (
        <>
          <rect x="6.5" y="10" width="5" height="4" rx="0.5" fill="none" stroke="#333" strokeWidth="0.5" />
          <rect x="12.5" y="10" width="5" height="4" rx="0.5" fill="none" stroke="#333" strokeWidth="0.5" />
          <path d="M11.5 12h1" stroke="#333" strokeWidth="0.5" />
          <path d="M6.5 12H5M17.5 12H19" stroke="#333" strokeWidth="0.5" />
        </>
      ),
      'cat': (
        <>
          {/* Lunettes œil de chat - centrées sur les yeux */}
          <path d="M7 11.5l1.5-1h2l1.5 1v2l-1.5 1h-2l-1.5-1v-2z" fill="none" stroke="#333" strokeWidth="0.5" />
          <path d="M12 11.5l1.5-1h2l1.5 1v2l-1.5 1h-2l-1.5-1v-2z" fill="none" stroke="#333" strokeWidth="0.5" />
          <path d="M11 12h1" stroke="#333" strokeWidth="0.5" />
          <path d="M7 12H5.5M17 12h1.5" stroke="#333" strokeWidth="0.5" />
        </>
      ),
    };
    return glassesStyles[glasses];
  };

  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      {/* Fond */}
      <defs>
        <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#avatarBg)" />
      
      {/* Cheveux (arrière) */}
      <g transform="translate(0, 2)">
        {renderHair()}
      </g>
      
      {/* Visage */}
      <ellipse cx="12" cy="13" rx="6" ry="7" fill={skin} />
      
      {/* Yeux */}
      <ellipse cx="9.5" cy="12" rx="1" ry="1.2" fill="#4a3728" />
      <ellipse cx="14.5" cy="12" rx="1" ry="1.2" fill="#4a3728" />
      <circle cx="9.7" cy="11.7" r="0.3" fill="white" />
      <circle cx="14.7" cy="11.7" r="0.3" fill="white" />
      
      {/* Sourcils */}
      <path d="M8 10.5c0.5-0.3 1.5-0.3 2 0" stroke="#5a4a3a" strokeWidth="0.4" fill="none" />
      <path d="M14 10.5c0.5-0.3 1.5-0.3 2 0" stroke="#5a4a3a" strokeWidth="0.4" fill="none" />
      
      {/* Nez */}
      <path d="M12 13v2" stroke={skin} strokeWidth="0.5" opacity="0.5" />
      
      {/* Bouche */}
      <path d="M10 16c1 1 3 1 4 0" stroke="#d4756a" strokeWidth="0.6" fill="none" />
      
      {/* Joues (blush) */}
      <ellipse cx="8" cy="14" rx="1.2" ry="0.6" fill="#f4a4a4" opacity="0.4" />
      <ellipse cx="16" cy="14" rx="1.2" ry="0.6" fill="#f4a4a4" opacity="0.4" />
      
      {/* Lunettes */}
      {renderGlasses()}
    </svg>
  );
}

// Sélecteur d'option
function OptionSelector({ title, options, value, onChange, renderOption }) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-slate-600 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              value === option.id
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {renderOption ? renderOption(option) : option.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// Sélecteur de couleur
function ColorSelector({ title, options, value, onChange }) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-slate-600 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            title={option.name}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              value === option.id
                ? 'border-pink-500 scale-110 shadow-md'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: option.color }}
          />
        ))}
      </div>
    </div>
  );
}

export function AvatarBuilder({ currentConfig, onSave, onCancel, onUseCamera }) {
  const [config, setConfig] = useState(currentConfig || {
    faceShape: 'oval',
    skinTone: 'medium',
    hairStyle: 'long-straight',
    hairColor: 'dark-brown',
    glasses: 'none',
  });
  
  const [step, setStep] = useState(0);
  const steps = [
    { key: 'skinTone', title: 'Couleur de peau' },
    { key: 'hairStyle', title: 'Coiffure' },
    { key: 'hairColor', title: 'Couleur des cheveux' },
    { key: 'glasses', title: 'Lunettes' },
  ];

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-700">Créer mon avatar</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Aperçu de l'avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <AvatarPreview config={config} size={140} />
          </div>
        </div>

        {/* Bouton caméra */}
        <button
          onClick={onUseCamera}
          className="w-full mb-4 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
        >
          <Camera className="w-5 h-5" />
          <span className="text-sm font-medium">Utiliser une vraie photo</span>
        </button>

        <div className="border-t border-slate-100 my-4" />

        {/* Navigation par étapes */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="p-2 rounded-full bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-500">
            {steps[step].title} ({step + 1}/{steps.length})
          </span>
          <button
            onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
            disabled={step === steps.length - 1}
            className="p-2 rounded-full bg-slate-100 disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Options selon l'étape */}
        <div className="min-h-[120px]">
          {step === 0 && (
            <ColorSelector
              title="Choisissez votre couleur de peau"
              options={AVATAR_OPTIONS.skinTone}
              value={config.skinTone}
              onChange={(v) => updateConfig('skinTone', v)}
            />
          )}
          {step === 1 && (
            <OptionSelector
              title="Choisissez votre coiffure"
              options={AVATAR_OPTIONS.hairStyle}
              value={config.hairStyle}
              onChange={(v) => updateConfig('hairStyle', v)}
            />
          )}
          {step === 2 && (
            <ColorSelector
              title="Choisissez la couleur de vos cheveux"
              options={AVATAR_OPTIONS.hairColor}
              value={config.hairColor}
              onChange={(v) => updateConfig('hairColor', v)}
            />
          )}
          {step === 3 && (
            <OptionSelector
              title="Portez-vous des lunettes ?"
              options={AVATAR_OPTIONS.glasses}
              value={config.glasses}
              onChange={(v) => updateConfig('glasses', v)}
            />
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl"
          >
            <Check className="w-4 h-4 mr-2" />
            Valider
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Export du composant de prévisualisation pour une utilisation externe
export { AvatarPreview, AVATAR_OPTIONS };

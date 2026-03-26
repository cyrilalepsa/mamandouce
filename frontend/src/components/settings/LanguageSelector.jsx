import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, changeLanguage, getCurrentLanguage } from '../../i18n';
import { Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export function LanguageSelector() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = getCurrentLanguage();
  
  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
    const lang = languages.find(l => l.code === langCode);
    toast.success(`${lang.flag} ${lang.name}`);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">{t('settings.selectLanguage')}</p>
      
      {/* Langue actuelle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
        data-testid="language-selector-btn"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentLanguage.flag}</span>
          <span className="font-medium text-slate-700">{currentLanguage.name}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Liste des langues */}
      {isOpen && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors ${
                lang.code === currentLang ? 'bg-pink-50' : ''
              }`}
              data-testid={`lang-option-${lang.code}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <span className={`font-medium ${lang.code === currentLang ? 'text-pink-600' : 'text-slate-700'}`}>
                  {lang.name}
                </span>
              </div>
              {lang.code === currentLang && (
                <Check className="w-5 h-5 text-pink-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

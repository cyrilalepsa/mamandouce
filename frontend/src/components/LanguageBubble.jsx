import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, changeLanguage, getCurrentLanguage } from '../i18n';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function LanguageBubble() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const dropdownRef = useRef(null);
  
  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Listen for language changes
  useEffect(() => {
    const checkLang = () => setCurrentLang(getCurrentLanguage());
    window.addEventListener('languageChanged', checkLang);
    return () => window.removeEventListener('languageChanged', checkLang);
  }, []);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
    const lang = languages.find(l => l.code === langCode);
    toast.success(`${lang.flag} ${lang.name}`);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  return (
    <div className="absolute top-4 right-14" style={{ zIndex: 50 }} ref={dropdownRef}>
      {/* Language dropdown */}
      {isOpen && (
        <div 
          className="absolute top-10 left-20 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          style={{ 
            minWidth: '200px',
            zIndex: 9999,
            animation: 'fadeInDown 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-600">{t('settings.language')}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="p-1 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          
          {/* Language list */}
          <div className="max-h-[300px] overflow-y-auto py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={(e) => { e.stopPropagation(); handleLanguageChange(lang.code); }}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors ${
                  lang.code === currentLang ? 'bg-pink-50' : ''
                }`}
                data-testid={`lang-bubble-${lang.code}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
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
        </div>
      )}

      {/* Flag button (no bubble) */}
      <button
        onClick={toggleDropdown}
        className="p-1 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:opacity-80"
        title={t('settings.selectLanguage')}
        data-testid="language-bubble-btn"
      >
        <span className="text-2xl">{currentLanguage.flag}</span>
      </button>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default LanguageBubble;

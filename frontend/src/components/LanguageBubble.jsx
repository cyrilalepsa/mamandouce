import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, changeLanguage, getCurrentLanguage } from '../i18n';
import { LanguagePopoverMenu } from './LanguagePopoverMenu';
import { toast } from 'sonner';

/**
 * Sélecteur de langue (bulle drapeau).
 * Mode non contrôlé par défaut ; props isOpen/onToggle optionnelles (mode contrôlé).
 */
export function LanguageBubble({ isOpen: controlledOpen, onToggle } = {}) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const isControlled = typeof controlledOpen === 'boolean' && typeof onToggle === 'function';
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next) => {
    if (isControlled) onToggle(next);
    else setInternalOpen(next);
  };

  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      const inButton = buttonRef.current?.contains(event.target);
      const inMenu = menuRef.current?.contains(event.target);
      if (!inButton && !inMenu) {
        setOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const checkLang = () => setCurrentLang(getCurrentLanguage());
    window.addEventListener('languageChanged', checkLang);
    return () => window.removeEventListener('languageChanged', checkLang);
  }, []);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setCurrentLang(langCode);
    setOpen(false);
    const lang = languages.find((l) => l.code === langCode);
    if (lang) toast.success(`${lang.flag} ${lang.name}`);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setOpen(!isOpen);
  };

  return (
    <div className="absolute top-4 right-14 z-50">
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          className="p-1 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:opacity-80"
          title={t('settings.selectLanguage')}
          data-testid="language-bubble-btn"
        >
          <span className="text-2xl">{currentLanguage.flag}</span>
        </button>
      </div>
      <div ref={menuRef}>
        <LanguagePopoverMenu
          anchorRef={buttonRef}
          isOpen={isOpen}
          onClose={() => setOpen(false)}
          languages={languages}
          currentLang={currentLang}
          onSelect={handleLanguageChange}
          title={t('settings.language')}
          testIdPrefix="lang-bubble"
        />
      </div>
    </div>
  );
}

export default LanguageBubble;

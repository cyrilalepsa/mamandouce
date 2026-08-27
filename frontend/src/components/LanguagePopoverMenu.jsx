import { useLayoutEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { usePopoverMountTransition } from '../hooks/usePopoverMountTransition';
import { popoverMenuAnimationClass } from '../utils/popoverMenuAnimation';

const MENU_CLASS =
  'fixed z-[9999] w-48 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden';

export function LanguagePopoverMenu({
  anchorRef,
  isOpen,
  onClose,
  languages,
  currentLang,
  onSelect,
  title = 'Langue',
  testIdPrefix = 'lang-inline',
}) {
  const { shouldRender, isShown } = usePopoverMountTransition(isOpen, { exitMs: 150 });
  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    if (!shouldRender || !anchorRef?.current) {
      if (!shouldRender) setPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [shouldRender, anchorRef]);

  if (!shouldRender || !position) return null;

  return (
    <div
      className={`${MENU_CLASS} ${popoverMenuAnimationClass(isShown)}`}
      style={{ top: position.top, right: position.right }}
      data-testid="language-popover-menu"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-slate-100">
        <span className="text-sm font-semibold text-slate-600">{title}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 hover:bg-slate-200 rounded-full"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="max-h-[300px] overflow-y-auto py-1">
        {languages.map((lang) => (
          <button
            type="button"
            key={lang.code}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(lang.code);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 ${
              lang.code === currentLang ? 'bg-pink-50' : ''
            }`}
            data-testid={`${testIdPrefix}-${lang.code}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <span
                className={`font-medium ${
                  lang.code === currentLang ? 'text-pink-600' : 'text-slate-700'
                }`}
              >
                {lang.name}
              </span>
            </div>
            {lang.code === currentLang && <Check className="w-5 h-5 text-pink-500" />}
          </button>
        ))}
      </div>
    </div>
  );
}

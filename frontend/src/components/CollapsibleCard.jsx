import { useState } from 'react';
import { Card } from './ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { IconWell } from './ui/IconWell';
import { cardSoftClayClasses, normalizeAccent } from '../utils/accentTokens';

export function CollapsibleCard({
  title,
  icon: Icon,
  accent = 'pink',
  children,
  defaultOpen = false,
  badge = null,
  subtitle = null,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const name = normalizeAccent(accent);

  return (
    <Card
      variant="flat"
      className={`${cardSoftClayClasses(name)} overflow-hidden border-0 shadow-none ${className}`}
      data-accent={name}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center gap-3 soft-clay-text-flat rounded-none border-0 hover:brightness-[1.02] transition-all"
        data-testid={`collapsible-${title?.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {Icon && (
          <IconWell accent={name} size="md">
            <Icon className="w-5 h-5 text-white" />
          </IconWell>
        )}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 bg-white/50 text-pink-600 text-xs rounded-full font-medium">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isOpen ? 'bg-white/40 text-pink-600' : 'bg-white/30 text-slate-500'
          }`}
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2 border-t border-white/40">
          {children}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 p-3 rounded-xl bg-white/35 hover:bg-white/50 flex items-center justify-center gap-2 transition-all duration-200 text-slate-700"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Fermer</span>
          </button>
        </div>
      </div>
    </Card>
  );
}

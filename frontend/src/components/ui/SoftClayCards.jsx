import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { IconWell } from './IconWell';
import {
  cardSoftClayClasses,
  cycleAccentByIndex,
  cardInnerCreamClasses,
  normalizeAccent,
} from '../../utils/accentTokens';

function resolveAccent(accent, index) {
  if (accent) return normalizeAccent(accent);
  return cycleAccentByIndex(index ?? 0);
}

/** Niveau 2 — carte ressource / tuile de catégorie cliquable */
export function ResourceCard({
  accent,
  index = 0,
  onClick,
  children,
  className = '',
  testId,
  level = 2,
  ...props
}) {
  const name = resolveAccent(accent, index);
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      data-accent={name}
      data-testid={testId}
      className={`${cardSoftClayClasses(name, { level })} relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : ''
      } ${className}`}
      {...props}
    >
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}

/** Niveau 2/3 — tuile de catégorie (mosaïque, hub post-partum) */
export function CategoryDetailTile({
  accent,
  index = 0,
  title,
  subtitle,
  icon,
  onClick,
  className = '',
  testId,
  level = 2,
  selected = false,
  ...props
}) {
  const name = resolveAccent(accent, index);
  return (
    <ResourceCard
      accent={name}
      index={index}
      onClick={onClick}
      level={level}
      testId={testId}
      className={`p-5 ${selected ? 'ring-2 ring-pink-400 ring-offset-2' : ''} ${className}`}
      {...props}
    >
      {icon && (
        <div className="flex justify-center mb-3">
          <IconWell accent={name} size="xl">
            {typeof icon === 'string' ? (
              <span className="text-2xl">{icon}</span>
            ) : (
              icon
            )}
          </IconWell>
        </div>
      )}
      {title && <h3 className="font-bold text-slate-800 text-base text-center mb-1">{title}</h3>}
      {subtitle && <p className="text-xs text-slate-600 text-center">{subtitle}</p>}
    </ResourceCard>
  );
}

/** Niveau 3 — accordéon Soft-Clay */
export function AccordionCard({
  accent,
  index = 0,
  title,
  icon,
  defaultOpen = false,
  open: controlledOpen,
  onToggle,
  children,
  className = '',
  testId,
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const name = resolveAccent(accent, index);

  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalOpen((open) => !open);
  };

  return (
    <div className={`mb-3 ${className}`} data-testid={testId}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        data-accent={name}
        className={`w-full ${cardSoftClayClasses(name, { level: 3 })} px-4 py-3.5 flex items-center gap-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99]`}
      >
        {icon ? (
          <IconWell accent={name} size="md">
            {typeof icon === 'string' ? <span className="text-xl">{icon}</span> : icon}
          </IconWell>
        ) : null}
        <h3 className="flex-1 font-bold text-slate-800 text-left">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200 px-1">
          {children}
        </div>
      )}
    </div>
  );
}

/** Niveau 3 — sous-carte intérieure */
export function SubCard({
  accent,
  index = 0,
  children,
  className = '',
  onClick,
  level = 3,
  testId,
  ...props
}) {
  const name = resolveAccent(accent, index);
  return (
    <div
      data-accent={name}
      data-testid={testId}
      onClick={onClick}
      className={`${cardSoftClayClasses(name, { level })} p-3 ${
        onClick ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : ''
      } ${className}`}
      {...props}
    >
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}

/** Niveau 4 — ligne d'article / widget indicateur (blanc crème interne) */
export function ListItemCard({
  accent,
  index = 0,
  children,
  className = '',
  onClick,
  level = 4,
  testId,
  cream = true,
  ...props
}) {
  const name = resolveAccent(accent, index);
  const surfaceClasses = cream
    ? cardInnerCreamClasses(className, { level })
    : cardSoftClayClasses(name, { level });
  return (
    <div
      data-accent={cream ? undefined : name}
      data-testid={testId}
      onClick={onClick}
      className={`${surfaceClasses} p-2.5 ${
        onClick ? 'cursor-pointer hover:brightness-[1.02] active:scale-[0.99]' : ''
      }`}
      {...props}
    >
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}

export { cycleAccentByIndex, cardSoftClayClasses };

import { AccordionCard as SoftClayAccordion, SubCard, ListItemCard } from './SoftClayCards';
import { IconWell } from './IconWell';
import { normalizeAccent, cardSoftClayClasses } from '../../utils/accentTokens';

// Accordéon — Soft-Clay pastel assorti à l'accent
export function PastelAccordion({ title, icon, color = 'pink', defaultOpen = false, children }) {
  return (
    <SoftClayAccordion
      accent={color}
      title={title}
      icon={icon}
      defaultOpen={defaultOpen}
    >
      {children}
    </SoftClayAccordion>
  );
}

// Carte contenu — sous-carte niveau 3/4
export function PastelCard({ color = 'pink', className = '', children, onClick, style: customStyle = {}, level = 3 }) {
  const accent = normalizeAccent(color);
  const Component = level >= 4 ? ListItemCard : SubCard;
  return (
    <Component accent={accent} onClick={onClick} level={level} className={className} style={customStyle}>
      {children}
    </Component>
  );
}

// Carte pill — déléguée à _shared PastelPillCard en pratique ; fallback soft-clay
export function PastelPillCard({ color = 'pink', className = '', children, onClick }) {
  const accent = normalizeAccent(color);
  return (
    <div
      onClick={onClick}
      data-accent={accent}
      className={`${cardSoftClayClasses(accent, { pill: true })} transition-all ${
        onClick ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : ''
      } ${className}`}
    >
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}

// Bulle d'icône colorée vive
export function TransparentIconBubble({ color = 'pink', icon, className = '' }) {
  const accent = normalizeAccent(color);
  return (
    <IconWell accent={accent} size="md" className={className}>
      {typeof icon === 'string' ? <span className="text-xl">{icon}</span> : icon}
    </IconWell>
  );
}

// Legacy export — mapping pour code existant
export const PASTEL_COLORS = {
  pink: { accent: 'pink' },
  sky: { accent: 'sky' },
  amber: { accent: 'yellow' },
  red: { accent: 'red' },
  purple: { accent: 'violet' },
  green: { accent: 'green' },
  violet: { accent: 'violet' },
  rose: { accent: 'red' },
  cyan: { accent: 'sky' },
  orange: { accent: 'red' },
};

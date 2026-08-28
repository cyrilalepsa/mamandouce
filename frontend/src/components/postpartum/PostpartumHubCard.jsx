import { accentFromSectionId, sectionInteractiveCardClasses } from '../../utils/accentTokens';
import { IconWell } from '../ui/IconWell';

const POSTPARTUM_SECTION = 'postpartum';

/**
 * Carte hub post-partum — hérite récursivement de l'accent section parent (vert).
 */
export function PostpartumHubCard({
  title,
  desc,
  icon,
  emoji,
  onClick,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  selected = false,
  className = '',
}) {
  const sectionAccent = accentFromSectionId(POSTPARTUM_SECTION);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(e)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      data-accent={sectionAccent}
      className={`${sectionInteractiveCardClasses(POSTPARTUM_SECTION)} relative overflow-hidden p-4 cursor-pointer select-none ${
        selected ? 'ring-2 ring-pink-400' : ''
      } ${className}`}
      style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
    >
      <div className="relative text-center">
        <div className="flex justify-center mb-2">
          <IconWell accent={sectionAccent} size="lg">
            {emoji ? <span className="text-2xl">{emoji}</span> : icon}
          </IconWell>
        </div>
        <h3 className="font-semibold text-slate-700 text-sm mb-1">{title}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export default PostpartumHubCard;

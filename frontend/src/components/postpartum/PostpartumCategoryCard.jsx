import { POSTPARTUM_SECTION_ID } from '../../config/sectionNavigation';
import { accentFromSectionId, sectionInteractiveCardClasses } from '../../utils/accentTokens';
import { IconWell } from '../ui/IconWell';

/**
 * Carte de catégorie post-partum — thème injecté depuis la config centralisée (`postpartum`).
 */
export function PostpartumCategoryCard({
  title,
  subtitle,
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
  testId,
  className = '',
}) {
  const sectionAccent = accentFromSectionId(POSTPARTUM_SECTION_ID);

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
      data-testid={testId}
      data-accent={sectionAccent}
      data-section={POSTPARTUM_SECTION_ID}
      className={`${sectionInteractiveCardClasses(POSTPARTUM_SECTION_ID)} relative overflow-hidden p-4 cursor-pointer select-none ${
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
        {title && <h3 className="font-semibold text-slate-700 text-sm mb-1">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export default PostpartumCategoryCard;

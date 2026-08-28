import { useTranslation } from 'react-i18next';
import { getPostpartumItemsForCategory } from '../../config/sectionNavigation';
import { PostpartumCategoryCard } from './PostpartumCategoryCard';

/**
 * Grille dynamique des sous-cartes d'une catégorie post-partum (config centralisée).
 */
export function PostpartumCategoryGrid({
  categoryId,
  onItemClick,
  onLongPressStart,
  onLongPressEnd,
  selectedId = null,
}) {
  const { t } = useTranslation();
  const items = getPostpartumItemsForCategory(categoryId);

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <PostpartumCategoryCard
          key={item.id}
          title={t(item.titleKey, item.title)}
          subtitle={t(item.descKey, item.desc)}
          emoji={item.emoji}
          selected={selectedId === item.id}
          onClick={() => onItemClick?.(item)}
          onTouchStart={() => onLongPressStart?.(item.id)}
          onTouchEnd={onLongPressEnd}
          onTouchMove={onLongPressEnd}
          onMouseDown={() => onLongPressStart?.(item.id)}
          onMouseUp={onLongPressEnd}
          onMouseLeave={onLongPressEnd}
        />
      ))}
    </div>
  );
}

export default PostpartumCategoryGrid;

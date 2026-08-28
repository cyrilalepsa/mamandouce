import { POSTPARTUM_SECTION_ID } from '../../config/sectionNavigation';
import { accentFromSectionId } from '../../utils/accentTokens';
import { IconWell } from '../ui/IconWell';
import { resolveSectionIcon } from '../../config/sectionIcons';

/**
 * En-tête de sous-page post-partum — icône et libellés depuis la config.
 */
export function PostpartumSectionHeader({ category, title, subtitle, iconKey }) {
  const sectionAccent = accentFromSectionId(POSTPARTUM_SECTION_ID);
  const Icon = resolveSectionIcon(iconKey || category?.icon);
  const displayTitle = title ?? category?.title ?? '';
  const displaySubtitle = subtitle ?? category?.desc ?? '';

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-slate-700">{displayTitle}</h1>
        <p className="text-sm text-slate-500">{displaySubtitle}</p>
      </div>
      <IconWell accent={sectionAccent} size="md">
        <Icon className="w-5 h-5 text-white" />
      </IconWell>
    </div>
  );
}

export default PostpartumSectionHeader;

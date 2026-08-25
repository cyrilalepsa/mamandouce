import { normalizeAccent, softClayIconWellClasses } from '../../utils/accentTokens';

const SIZE_CLASSES = {
  xs: 'w-7 h-7 rounded-md',
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-11 h-11 rounded-2xl',
  xl: 'w-12 h-12 rounded-2xl',
};

/**
 * Pastille d'icône vive (dégradé saturé) — contraste sur carte pastel assortie.
 */
export function IconWell({ accent = 'slate', size = 'sm', className = '', children, ...props }) {
  const name = normalizeAccent(accent);
  return (
    <div
      data-accent={name}
      className={`soft-clay-icon-from-accent flex items-center justify-center flex-shrink-0 ${SIZE_CLASSES[size] || SIZE_CLASSES.sm} ${softClayIconWellClasses(accent, className)}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default IconWell;

export const POPOVER_MENU_ANIMATION = {
  base: 'transition-all origin-top-right',
  open: 'opacity-100 scale-100 duration-200 ease-out',
  closed: 'opacity-0 scale-95 duration-150 ease-in pointer-events-none',
};

export function popoverMenuAnimationClass(isShown) {
  return `${POPOVER_MENU_ANIMATION.base} ${
    isShown ? POPOVER_MENU_ANIMATION.open : POPOVER_MENU_ANIMATION.closed
  }`;
}

/**
 * DragDropComponents.jsx — BARREL
 * Les 4 composants ont été extraits dans ./dragdrop/ pour la maintenabilité.
 *  - dragdrop/DraggableItem.jsx
 *  - dragdrop/ItemGroup.jsx
 *  - dragdrop/GroupContentPopup.jsx
 *  - dragdrop/DropZone.jsx
 *  - dragdrop/constants.js (ITEM_ICONS, ITEM_NAMES, ITEM_STYLES, ITEM_ROUTES, GROUP_COLORS)
 */
export { DraggableItem } from './dragdrop/DraggableItem';
export { ItemGroup } from './dragdrop/ItemGroup';
export { GroupContentPopup } from './dragdrop/GroupContentPopup';
export { DropZone } from './dragdrop/DropZone';
export {
  ITEM_ICONS, ITEM_NAMES, ITEM_TRANSLATION_KEYS,
  ITEM_STYLES, ITEM_ROUTES, GROUP_COLORS
} from './dragdrop/constants';

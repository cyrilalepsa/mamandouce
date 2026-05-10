export { AgendaCard } from './AgendaCard';
export { PregnancyStatusCard, PregnancyProgressCard } from './PregnancyCards';
export { 
  PreconceptionSection, 
  PregnancySection, 
  BabyPreparationSection, 
  PostpartumSection, 
  ServicesSection,
  FaqBabySection,
  PinnedSectionsProvider,
  CollapsibleSection,
  usePinnedSections
} from './NavigationSections';
export { TopBar } from './TopBar';
export { PinTipBanner, PinTooltip } from './PinTip';
export {
  PageHeader,
  LayoutTutorialBanner,
  EditModeButton,
  ResetLayoutButton,
  DraggableItem,
  PremiumFeatureBadge
} from './HomeCustomization';
export { CustomizableHome } from './CustomizableHome';
export { 
  PremiumControlPanel, 
  PageThemeSelector, 
  WidgetSizeControls,
  ConfigExportImport,
  PAGE_THEMES,
  WIDGET_SIZES
} from './PremiumFeatures';
export { TutorialPopup, InfoButton, useTutorial, InteractiveTutorial } from './TutorialPopup';
export { CustomizableElement } from './CustomizableElement';

// Composants extraits (refactoring de CustomizableHome.jsx)
export { WeekDisplayWidget, JourneyStepsCard, UserWelcomeHeader } from './HomeWidgets';
export { CreatePagePopup, DeletePageConfirmPopup, CreateGroupPopup } from './HomePopups';
export { PageDots } from './HomePagination';
export { CustomizableUserElement, UserSectionCard } from './CustomizableElements';

/**
 * Icon system for Zeno Design System
 * Uses Lucide Icons as defaults with swappable icon registry
 */

export interface IconProps {
  size?: number | string;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

export interface IconComponent {
  (_props: IconProps): unknown;
}

// Placeholder icon components that stories can import
// These would be replaced with actual icon implementations
const createIconComponent = (name: string): IconComponent => {
  return (props: IconProps) => ({
    name: `Icon-${name}`,
    props,
  });
};

// Export individual icon components for stories
export const Download = createIconComponent('Download');
export const ChevronRight = createIconComponent('ChevronRight');
export const Settings = createIconComponent('Settings');
export const Heart = createIconComponent('Heart');
export const Send = createIconComponent('Send');
export const Sparkles = createIconComponent('Sparkles');
export const InfoCircle = createIconComponent('InfoCircle');
export const CheckCircle = createIconComponent('CheckCircle');
export const WarningCircle = createIconComponent('WarningCircle');
export const XCircle = createIconComponent('XCircle');
export const QuestionCircle = createIconComponent('QuestionCircle');

export interface IconRegistry {
  // Data table icons
  sortAscending: IconComponent;
  sortDescending: IconComponent;
  sortUnsorted: IconComponent;
  search: IconComponent;
  filterList: IconComponent;

  // Pagination icons
  chevronLeft: IconComponent;
  chevronRight: IconComponent;
  chevronDoubleLeft: IconComponent;
  chevronDoubleRight: IconComponent;

  // Accordion icons
  chevronDown: IconComponent;
  chevronUp: IconComponent;
  add: IconComponent;
  subtract: IconComponent;

  // Stepper icons
  checkmark: IconComponent;
  errorFilled: IconComponent;
  warning: IconComponent;

  // Tab icons
  close: IconComponent;

  // File upload icons
  upload: IconComponent;
  document: IconComponent;
  image: IconComponent;

  // Form icons
  view: IconComponent;
  viewOff: IconComponent;
  calendar: IconComponent;
  time: IconComponent;

  // General utility icons
  information: IconComponent;
  help: IconComponent;
  settings: IconComponent;
  menu: IconComponent;
  more: IconComponent;
}

// Global icon registry
let iconRegistry: IconRegistry | null = null;

/**
 * Register a custom icon set
 */
export function registerIcons(icons: IconRegistry): void {
  iconRegistry = icons;
}

/**
 * Register a subset of icons (partial update)
 */
export function registerPartialIcons(icons: Partial<IconRegistry>): void {
  if (!iconRegistry) {
    throw new Error(
      'No icon registry found. Call registerIcons() first with a complete icon set.'
    );
  }
  iconRegistry = { ...iconRegistry, ...icons };
}

/**
 * Get an icon component by name
 */
export function getIcon(name: keyof IconRegistry): IconComponent {
  if (!iconRegistry) {
    throw new Error('No icon registry found. Call registerIcons() first.');
  }

  const icon = iconRegistry[name];
  if (!icon) {
    throw new Error(`Icon "${name}" not found in registry.`);
  }

  return icon;
}

/**
 * Get the entire icon registry
 */
export function getIconRegistry(): IconRegistry | null {
  return iconRegistry;
}

/**
 * Check if icons are registered
 */
export function hasIcons(): boolean {
  return iconRegistry !== null;
}

// Default icon names for easy reference
export const ICON_NAMES = {
  // Data table
  SORT_ASCENDING: 'sortAscending' as const,
  SORT_DESCENDING: 'sortDescending' as const,
  SORT_UNSORTED: 'sortUnsorted' as const,
  SEARCH: 'search' as const,
  FILTER_LIST: 'filterList' as const,

  // Pagination
  CHEVRON_LEFT: 'chevronLeft' as const,
  CHEVRON_RIGHT: 'chevronRight' as const,
  CHEVRON_DOUBLE_LEFT: 'chevronDoubleLeft' as const,
  CHEVRON_DOUBLE_RIGHT: 'chevronDoubleRight' as const,

  // Accordion
  CHEVRON_DOWN: 'chevronDown' as const,
  CHEVRON_UP: 'chevronUp' as const,
  ADD: 'add' as const,
  SUBTRACT: 'subtract' as const,

  // Stepper
  CHECKMARK: 'checkmark' as const,
  ERROR_FILLED: 'errorFilled' as const,
  WARNING: 'warning' as const,

  // Tab
  CLOSE: 'close' as const,

  // File upload
  UPLOAD: 'upload' as const,
  DOCUMENT: 'document' as const,
  IMAGE: 'image' as const,

  // Form
  VIEW: 'view' as const,
  VIEW_OFF: 'viewOff' as const,
  CALENDAR: 'calendar' as const,
  TIME: 'time' as const,

  // General
  INFORMATION: 'information' as const,
  HELP: 'help' as const,
  SETTINGS: 'settings' as const,
  MENU: 'menu' as const,
  MORE: 'more' as const,
} as const;

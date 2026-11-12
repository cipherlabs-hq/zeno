/**
 * Type definitions for Lit components
 */

// Constructor type for mixins
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mixin constructors must accept any[]
export type Constructor<T = object> = new (...args: any[]) => T;

// Common event detail types
export interface ClickDetail {
  x: number;
  y: number;
  target: EventTarget | null;
}

export interface ChangeDetail<T = unknown> {
  value: T;
  oldValue?: T;
}

export interface ToggleDetail {
  open: boolean;
}

// Re-export core types for convenience
export type { ComponentSize, FormValue } from '../../types/base.js';

export type { ButtonVariant, ButtonSize } from '../../types/components.js';

// Button type
export type ButtonType = 'button' | 'submit' | 'reset';

// Component-specific types
export type AccordionSize = 'sm' | 'md' | 'lg';
export interface AccordionItem {
  id: string;
  value: string;
  title: string;
  label: string;
  content: string;
  icon?: string;
  disabled?: boolean;
  expanded?: boolean;
}

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'square' | 'rounded';
export type AvatarVariant = 'solid' | 'soft' | 'outlined' | 'plain';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
}

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (_value: unknown, _row: DataTableRow) => string;
}

export interface DataTableRow {
  id: string;
  [key: string]: unknown;
}

export type DataTableSize = 'sm' | 'md' | 'lg';
export type SortDirection = 'asc' | 'desc' | null;

export type DatePickerSize = 'sm' | 'md' | 'lg';

export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'full';

export type FileUploadSize = 'sm' | 'md' | 'lg';

export type HamburgerSize = 'sm' | 'md' | 'lg';
export type HamburgerVariant =
  'basic' | 'spin' | 'squeeze' | 'vortex' | 'elastic';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'outlined' | 'filled' | 'underlined';
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'color'
  | 'range';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface NavRailItem {
  id: string;
  value: string;
  label: string;
  icon?: string;
  href?: string;
  target?: string;
  rel?: string;
  section?: string;
  disabled?: boolean;
  badge?: string | number;
}

export type PaginationSize = 'sm' | 'md' | 'lg';

export type ProgressBarSize = 'sm' | 'md' | 'lg';
export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';
export type ProgressBarVariant =
  'primary' | 'success' | 'warning' | 'error' | 'info';

export type RadioSize = 'sm' | 'md' | 'lg';
export type Orientation = 'horizontal' | 'vertical';

export type SelectSize = 'sm' | 'md' | 'lg';

export type SkeletonVariant =
  | 'text'
  | 'title'
  | 'paragraph'
  | 'avatar'
  | 'button'
  | 'input'
  | 'image'
  | 'card';

export type SliderSize = 'sm' | 'md' | 'lg';

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  disabled?: boolean;
  error?: boolean;
}

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperSize = 'sm' | 'md' | 'lg';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface TabItem {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  badge?: string | number;
}

export interface StepItem {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type TabsSize = 'sm' | 'md' | 'lg';
export type TabsVariant = 'line' | 'pills' | 'card';

export type TagSize = 'xs' | 'sm' | 'md' | 'lg';
export type TagVariant = 'default' | 'outline' | 'ghost';

export type TextareaSize = 'sm' | 'md' | 'lg';

export type ThemeToggleSize = 'sm' | 'md' | 'lg';

export type ToastVariant = 'default' | 'info' | 'success' | 'warning' | 'error';
export type ToastPosition =
  'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

// CSS Part names for styling
export const CSS_PARTS = {
  base: 'base',
  label: 'label',
  input: 'input',
  button: 'button',
  icon: 'icon',
  prefix: 'prefix',
  suffix: 'suffix',
  error: 'error',
  helper: 'helper',
  content: 'content',
  header: 'header',
  footer: 'footer',
  overlay: 'overlay',
  trigger: 'trigger',
} as const;

// Animation durations from design tokens
export const ANIMATION_DURATION = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
  slowest: 1000,
} as const;

// Z-index levels
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const;

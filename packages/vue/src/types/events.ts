/**
 * Zeno Vue Component Event Types
 * Centralized emit interfaces for all components
 */

import type {
  NavItem,
  TabItem,
  BreadcrumbItem,
  AccordionItem,
} from './navigation';
import type { AlertAction } from './feedback';
import type { ToastItem } from '@usezeno/core';
import type { SelectOption } from './forms';
import type {
  AutocompleteOption,
  ColorValue,
  FileItem,
  TimeValue,
} from './advanced';
import type { FormValue } from './base';
import type { SortDirection } from './data';
import type { DateValue } from './forms';

// Base event types that many components share
export interface BaseEmits {
  close: [];
  open: [];
}

export interface ModelValueEmits<T = boolean> {
  'update:modelValue': [value: T];
}

// Specific component emit interfaces
export interface ZDrawerEmits extends BaseEmits, ModelValueEmits<boolean> {
  // Inherits: close, open, update:modelValue
}

// ToastItem is now imported from feedback.ts which imports from core

export interface ZToastEmits {
  action: [toast: ToastItem];
  dismiss: [id: string];
}

export interface ZModalEmits extends BaseEmits, ModelValueEmits<boolean> {
  // Inherits: close, open, update:modelValue
  'before-close': [close: () => void];
  escape: [];
  'overlay-click': [];
}

export interface ZButtonEmits {
  click: [event: MouseEvent];
}

export interface ZInputEmits<T = string | number> extends ModelValueEmits<T> {
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  change: [value: T];
  input: [value: T];
  clear: [];
  enter: [];
}

// Form component emits
export interface ZCheckboxEmits extends ModelValueEmits<
  boolean | (string | number)[]
> {
  change: [event: Event, checked: boolean];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}

export interface ZRadioEmits<T = FormValue> extends ModelValueEmits<T> {
  change: [event: Event, value: T];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}

export interface ZRadioGroupEmits<T = FormValue> extends ModelValueEmits<T> {
  change: [value: T];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}

export interface ZSelectEmits<
  T = string | number | boolean | (string | number | boolean)[],
> extends ModelValueEmits<T> {
  change: [event: Event, value: T, selectedOption?: SelectOption];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}

// Navigation emits
export interface NavRailItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  active?: boolean;
  disabled?: boolean;
}

export interface ZNavRailEmits {
  'item-click': [item: NavItem];
  'item-select': [itemId: string];
  'update:activeItem': [itemId: string];
  toggle: [];
}

export interface ZTabsEmits extends ModelValueEmits<string | number> {
  'tab-change': [tab: TabItem, previousTab: TabItem | null];
  'tab-close': [tab: TabItem];
  'tab-focus': [tab: TabItem];
  'tab-blur': [tab: TabItem];
  'tab-click': [tabId: string | number, event: MouseEvent];
}

// Data component emits
export interface ZDataTableEmits<T = Record<string, unknown>> {
  'row-click': [row: T, index: number];
  'sort-change': [column: string, direction: SortDirection | null];
  'page-change': [page: number];
  'page-size-change': [pageSize: number];
  'selection-change': [selectedRows: T[]];
  'row-select': [row: T];
  'row-deselect': [row: T];
  'filter-change': [filters: Record<string, unknown>];
  'expand-change': [expandedRows: (string | number)[]];
}

export interface ZPaginationEmits {
  'page-change': [page: number];
  'size-change': [size: number];
}

// Feedback component emits

export interface ZAlertEmits {
  dismiss: [];
  'action-click': [action: AlertAction, event: MouseEvent];
  'before-enter': [];
  enter: [];
  leave: [];
  'after-leave': [];
}

// Utility type for Vue's defineEmits
export type DefineEmits<T> = {
  [K in keyof T]: T[K] extends unknown[]
    ? (..._args: T[K]) => void
    : () => void;
};

// ==================== Chip Events ====================
export interface ZChipEmits {
  remove: [];
}

// ==================== Tag Events ====================
export interface ZTagEmits {
  close: [];
}

// ==================== Switch Events ====================
export interface ZSwitchEmits extends ModelValueEmits<boolean> {
  change: [event: Event, checked: boolean];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}

// ==================== Slider Events ====================
export interface ZSliderEmits extends ModelValueEmits<number> {
  change: [event: Event, value: number];
  input: [event: Event, value: number];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  'drag-start': [];
  'drag-end': [];
}

// ==================== Textarea Events ====================
export interface ZTextareaEmits extends ModelValueEmits<string> {
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  change: [event: Event, value: string];
  input: [event: Event, value: string];
  keydown: [event: KeyboardEvent];
}

// ==================== Avatar Events ====================
export interface ZAvatarEmits {
  click: [event: MouseEvent];
  error: [event: Event];
  load: [event: Event];
}

// ==================== Badge Events ====================
export interface ZBadgeEmits {
  click: [event: MouseEvent];
}

// ==================== Icon Events ====================
export interface ZIconEmits {
  click: [event: MouseEvent];
}

// ==================== Spinner Events ====================
// Spinner has no events

// ==================== Skeleton Events ====================
// Skeleton has no events

// ==================== Progress Events ====================
// Progress has no events

// ==================== Tooltip Events ====================
export interface ZTooltipEmits {
  show: [];
  hide: [];
  'update:open': [open: boolean];
}

// ==================== Popover Events ====================
export interface ZPopoverEmits extends ModelValueEmits<boolean> {
  show: [];
  hide: [];
}

// ==================== Accordion Events ====================
export interface ZAccordionEmits extends ModelValueEmits<
  (string | number)[] | string | number
> {
  collapse: [key: string];
  expand: [key: string];
  'update:modelValue': [value: (string | number)[] | string | number];
  'item-toggle': [item: AccordionItem, expanded: boolean];
}

// ==================== Breadcrumb Events ====================

export interface ZBreadcrumbEmits {
  'item-click': [item: BreadcrumbItem, index: number];
}

// ==================== Stepper Events ====================
export interface ZStepperEmits {
  'update:activeStep': [step: number];
  'step-click': [step: number];
  'step-complete': [step: number];
}

// ==================== DatePicker Events ====================
export interface ZDatePickerEmits extends ModelValueEmits<DateValue> {
  'update:modelValue': [value: DateValue];
  change: [value: DateValue];
  'internal-model-change': [value: DateValue];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  clear: [];
  open: [];
  close: [];
  cleared: [];
  'text-submit': [value: string, preventDefault: () => void];
  'invalid-select': [value: Date];
}

// ==================== FileUpload Events ====================

export interface ZFileUploadEmits extends ModelValueEmits<
  File[] | File | null
> {
  change: [event: Event, files: File[]];
  remove: [file: FileItem];
  preview: [file: FileItem];
  exceed: [files: File[]];
  progress: [event: ProgressEvent, file: FileItem];
  success: [response: unknown, file: FileItem];
  error: [error: Error, file: FileItem];
  'file-error': [error: string, file: File];
  'file-added': [file: File];
  'file-removed': [file: File, index: number];
}

// ==================== ColorPicker Events ====================

export interface ZColorPickerEmits extends ModelValueEmits<
  string | ColorValue
> {
  change: [value: string | ColorValue];
  'active-change': [value: string | ColorValue];
}

// ==================== TimePicker Events ====================

export interface ZTimePickerEmits extends ModelValueEmits<
  string | Date | TimeValue
> {
  change: [value: string | Date | TimeValue];
  clear: [];
  'open-change': [open: boolean];
}

// ==================== Autocomplete Events ====================

export interface ZAutocompleteEmits extends ModelValueEmits<
  string | number | boolean
> {
  change: [value: string | number | boolean];
  select: [option: AutocompleteOption];
  search: [query: string];
  clear: [];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}

// ==================== Hamburger Events ====================
export interface ZHamburgerEmits {
  'update:isOpen': [isOpen: boolean];
  toggle: [isOpen: boolean];
}

// ==================== ThemeToggle Events ====================
export interface ZThemeToggleEmits {
  'update:theme': [theme: string];
  'update:mode': [mode: string];
  'theme-change': [theme: string, mode: string];
}

// ==================== Container Events ====================
// Container has no events

// ==================== Grid Events ====================
// Grid has no events

// ==================== Paper Events ====================
export interface ZPaperEmits {
  click: [event: MouseEvent];
}

// ==================== Card Events ====================
export interface ZCardEmits {
  click: [event: MouseEvent];
}

// ==================== Divider Events ====================
// Divider has no events

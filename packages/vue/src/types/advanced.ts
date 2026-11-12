/**
 * Advanced Component Types
 * DatePicker, FileUpload, ColorPicker, etc.
 */

import type { ZComponentBase, FormValue } from './base';
import type {
  FileUploadSize,
  FileUploadVariant,
  FileItem,
  AutocompleteOption,
  AutocompleteSize,
  ColorValue,
  ColorFormat,
  ColorPickerSize,
  TimeValue,
  TimeFormat,
  TimePickerSize,
} from '@usezeno/core';

// DatePicker types are exported from forms.ts to avoid conflicts

// ==================== FileUpload Types ====================
// Re-export from core for backward compatibility
export type {
  FileUploadSize,
  FileUploadVariant,
  FileUploadStatus,
  FileItem,
} from '@usezeno/core';

export interface ZFileUploadProps extends ZComponentBase {
  /** Component ID */
  id?: string;
  /** v-model binding */
  modelValue?: File[] | File | null;
  /** Accepted file types */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Size variant */
  size?: FileUploadSize;
  /** Visual variant */
  variant?: FileUploadVariant;
  /** Disabled state */
  disabled?: boolean;
  /** Show file list */
  showList?: boolean;
  /** Auto upload on select */
  autoUpload?: boolean;
  /** Upload URL */
  action?: string;
  /** HTTP method */
  method?: 'POST' | 'PUT';
  /** Request headers */
  headers?: Record<string, string>;
  /** Additional data */
  data?: Record<string, unknown>;
  /** Field name */
  name?: string;
  /** With credentials */
  withCredentials?: boolean;
  /** Custom upload function */
  customUpload?: (_file: File) => Promise<FileItem | void>;
  /** Before upload hook */
  beforeUpload?: (_file: File) => boolean | Promise<boolean>;
  /** Drag and drop text */
  dragText?: string;
  /** Button text */
  buttonText?: string;
  /** Hint text */
  hintText?: string;
  /** Field label */
  label?: string;
  /** Required field */
  required?: boolean;
  /** Error state or message */
  error?: boolean | string;
  /** Hint text */
  hint?: string;
  /** ARIA describedby */
  ariaDescribedby?: string;
  /** Show file preview */
  showPreview?: boolean;
}

// ==================== ColorPicker Types ====================
// Re-export from core for backward compatibility
export type { ColorFormat, ColorPickerSize, ColorValue } from '@usezeno/core';

// Vue-specific color picker types
export type ColorPickerVariant = 'default' | 'compact' | 'minimal';

export interface ZColorPickerProps extends ZComponentBase {
  /** v-model binding */
  modelValue?: string | ColorValue;
  /** Color format */
  format?: ColorFormat;
  /** Size variant */
  size?: ColorPickerSize;
  /** Visual variant */
  variant?: ColorPickerVariant;
  /** Show alpha channel */
  showAlpha?: boolean;
  /** Preset colors */
  presets?: string[];
  /** Show input */
  showInput?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Inline mode */
  inline?: boolean;
  /** Swatches per row */
  swatchesPerRow?: number;
}

// ==================== TimePicker Types ====================
// Re-export from core for backward compatibility
export type { TimePickerSize, TimeFormat, TimeValue } from '@usezeno/core';

// Vue-specific time picker types
export type TimePickerVariant = 'default' | 'glass' | 'minimal';

export interface ZTimePickerProps extends ZComponentBase {
  /** v-model binding */
  modelValue?: string | Date | TimeValue;
  /** Time format */
  format?: TimeFormat;
  /** Size variant */
  size?: TimePickerSize;
  /** Visual variant */
  variant?: TimePickerVariant;
  /** Show seconds */
  showSeconds?: boolean;
  /** Minute step */
  minuteStep?: number;
  /** Second step */
  secondStep?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Readonly state */
  readonly?: boolean;
  /** Placeholder */
  placeholder?: string;
  /** Show clear button */
  clearable?: boolean;
  /** Min time */
  minTime?: string | Date | TimeValue;
  /** Max time */
  maxTime?: string | Date | TimeValue;
  /** Disabled hours */
  disabledHours?: number[];
  /** Disabled minutes */
  disabledMinutes?: number[];
  /** Disabled seconds */
  disabledSeconds?: number[];
}

// ==================== Autocomplete Types ====================
// Re-export from core for backward compatibility
export type {
  AutocompleteSize,
  AutocompleteOption,
  AutocompleteVariant,
} from '@usezeno/core';

export interface ZAutocompleteProps extends ZComponentBase {
  /** v-model binding */
  modelValue?: FormValue;
  /** Options list */
  options?: AutocompleteOption[];
  /** Size variant */
  size?: AutocompleteSize;
  /** Placeholder */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Clearable */
  clearable?: boolean;
  /** Minimum characters before search */
  minChars?: number;
  /** Debounce delay in ms */
  debounce?: number;
  /** Filter function */
  filterFn?: (_query: string, _option: AutocompleteOption) => boolean;
  /** Remote search function */
  searchFn?: (_query: string) => Promise<AutocompleteOption[]>;
  /** No data text */
  noDataText?: string;
  /** Loading text */
  loadingText?: string;
  /** Highlight matches */
  highlightMatches?: boolean;
  /** Max results to show */
  maxResults?: number;
}

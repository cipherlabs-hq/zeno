/**
 * Form Types
 * Types specific to form components and validation
 */

import type { ComponentSize } from './base.js';

// ==================== Input Types ====================
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
  | 'datetime-local';

// ==================== Textarea Types ====================
export type TextareaSize = 'sm' | 'md' | 'lg';

// ==================== Checkbox Types ====================
export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxVariant = 'default' | 'primary' | 'accent';

// ==================== Radio Types ====================
export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioVariant = 'default' | 'primary' | 'accent';
export type RadioGroupOrientation = 'horizontal' | 'vertical';
export type RadioGroupSize = 'sm' | 'md' | 'lg';
export type RadioGroupVariant = 'default' | 'primary' | 'accent';

// ==================== Select Types ====================
export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'default' | 'primary' | 'accent';

// ==================== Switch Types ====================
export type SwitchSize = 'sm' | 'md' | 'lg';
export type SwitchVariant = 'default' | 'primary' | 'accent';

export interface TrackLabels {
  on?: string;
  off?: string;
}

// ==================== Slider Types ====================
export type SliderSize = 'sm' | 'md' | 'lg';

// ==================== Date Picker Types ====================
export type DatePickerSize = 'sm' | 'md' | 'lg';

// ==================== File Upload Types ====================
export type FileUploadSize = ComponentSize;
export type FileUploadVariant = 'default' | 'drag' | 'button' | 'minimal';

// ==================== Color Picker Types ====================
export type ColorPickerSize = 'sm' | 'md' | 'lg';
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

// ==================== Time Picker Types ====================
export type TimePickerSize = 'sm' | 'md' | 'lg';
export type TimeFormat = '12' | '24';

// ==================== Autocomplete Types ====================
export type AutocompleteSize = 'sm' | 'md' | 'lg';
export type AutocompleteVariant = 'default' | 'primary' | 'accent';

// ==================== Validation Types ====================
export interface ValidationRule {
  required?: boolean | { value: boolean; message: string };
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  email?: boolean | { value: boolean; message: string };
  custom?: (_value: unknown) => boolean | string;
}

export type ValidatorFunction = (_value: unknown) => string | null;

/**
 * Form Component Types
 * All form-related components and their variants
 */

import type {
  ZComponentBase,
  ComponentSize,
  FormValue,
  FormValueArray,
} from './base';
import type {
  ButtonVariant,
  ButtonSize,
  InputType,
  TextareaSize,
  CheckboxSize,
  CheckboxVariant,
  RadioSize,
  RadioVariant,
  RadioOption,
  RadioGroupOrientation,
  RadioGroupSize,
  RadioGroupVariant,
  SelectOption,
  SelectSize,
  SelectVariant,
  SwitchSize,
  SwitchVariant,
  TrackLabels,
  SliderSize,
  DatePickerSize,
  DateValue,
} from '@usezeno/core';

// ==================== Date Picker Types ====================
// Re-export from core for backward compatibility
export type { DatePickerSize, DateValue } from '@usezeno/core';

// ==================== Button Types ====================
// Re-export from core for backward compatibility
export type { ButtonVariant, ButtonSize } from '@usezeno/core';

export interface ZButtonProps extends ZComponentBase {
  /** Visual style variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Loading state with spinner */
  loading?: boolean;
  /** Pressed state for toggle buttons */
  pressed?: boolean;
  /** Elevated appearance with enhanced shadow */
  elevated?: boolean;
  /** Disable ripple effect */
  noRipple?: boolean;
  /** Whether the button should take full width (alias for fullWidth) */
  block?: boolean;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
}

// ==================== Input Types ====================
export interface ZInputProps extends ZComponentBase {
  /** Input value */
  modelValue?: string | number;
  /** Input type */
  type?: InputType;
  /** Placeholder text */
  placeholder?: string;
  /** Field label */
  label?: string;
  /** Help text */
  helpText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Readonly state */
  readonly?: boolean;
  /** Custom field ID */
  id?: string;
  /** Validation rules */
  validator?:
    | ((_value: string | number) => string | null)
    | ((_value: string | number) => string | null)[]
    | {
        required?: boolean | { value: boolean; message: string };
        minLength?: number | { value: number; message: string };
        maxLength?: number | { value: number; message: string };
        pattern?: RegExp | { value: RegExp; message: string };
        email?: boolean | { value: boolean; message: string };
        custom?: (_value: string | number) => boolean | string;
      };
  /** Show validation on blur instead of real-time */
  validateOnBlur?: boolean;
  /** Show clear button */
  clearable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Use floating label */
  floatingLabel?: boolean;
  /** Leading icon */
  leadingIcon?: string;
  /** Trailing icon */
  trailingIcon?: string;
  /** Autocomplete attribute */
  autocomplete?: string;
  /** Min value for number inputs */
  min?: number | string;
  /** Max value for number inputs */
  max?: number | string;
  /** Step value for number inputs */
  step?: number | string;
  /** Input size variant */
  size?: ComponentSize;
  /** Error state */
  error?: boolean;
}

// ==================== Textarea Types ====================
// Re-export from core for backward compatibility
export type { TextareaSize } from '@usezeno/core';

export interface ZTextareaProps extends ZComponentBase {
  /** Enable auto-resize behavior */
  autoResize?: boolean;
  /** Number of columns */
  cols?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Maximum character length */
  maxLength?: number;
  /** v-model value */
  modelValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Number of rows */
  rows?: number;
  /** Size variant */
  size?: TextareaSize;
  /** Alternate value prop */
  value?: string;
  /** Field label */
  label?: string;
  /** Read-only state */
  readonly?: boolean;
  /** Required field */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Hint/helper text */
  hint?: string;
  /** Show character count */
  charCount?: boolean;
  /** Minimum rows for auto-resize */
  minRows?: number;
  /** Maximum rows for auto-resize */
  maxRows?: number;
  /** Custom ID */
  id?: string;
  /** ARIA describedby */
  ariaDescribedby?: string;
}

// ==================== Checkbox Types ====================
// Re-export from core for backward compatibility
export type { CheckboxSize, CheckboxVariant } from '@usezeno/core';

export interface ZCheckboxProps extends ZComponentBase {
  /** v-model binding for checked state */
  modelValue?: boolean;
  /** Controlled checked state (when not using v-model) */
  checked?: boolean;
  /** Whether checkbox is in indeterminate state */
  indeterminate?: boolean;
  /** Value attribute for form submission */
  value?: string | number;
  /** Name attribute for form submission */
  name?: string;
  /** Label text */
  label?: string;
  /** Helper text displayed below the checkbox */
  helperText?: string;
  /** Error message (overrides helper text when invalid) */
  errorMessage?: string;
  /** Size variant */
  size?: CheckboxSize;
  /** Visual variant */
  variant?: CheckboxVariant;
  /** Whether checkbox is disabled */
  disabled?: boolean;
  /** Whether checkbox is required for form validation */
  required?: boolean;
  /** Whether checkbox is in invalid state */
  invalid?: boolean;
  /** Loading state with spinner */
  loading?: boolean;
  /** Custom id attribute */
  id?: string;
  /** ARIA describedby attribute */
  ariaDescribedby?: string;
  /** Custom ARIA label */
  ariaLabel?: string;
  /** Test ID for automated testing */
  testId?: string;
}

// ==================== Radio Types ====================
// Re-export from core for backward compatibility
export type { RadioSize, RadioVariant, RadioOption } from '@usezeno/core';

export interface ZRadioProps extends ZComponentBase {
  /** Controlled checked state */
  checked?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** v-model value */
  modelValue?: FormValue;
  /** Form field name */
  name?: string;
  /** Radio value */
  value?: FormValue;
  /** Size variant */
  size?: RadioSize;
  /** Visual variant */
  variant?: RadioVariant;
  /** Helper text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Loading state */
  loading?: boolean;
  /** Invalid/error state */
  invalid?: boolean;
  /** Required field */
  required?: boolean;
  /** Custom ID */
  id?: string;
  /** ARIA describedby */
  ariaDescribedby?: string;
  /** ARIA label */
  ariaLabel?: string;
  /** Test ID for automated testing */
  testId?: string;
}

// Re-export from core for backward compatibility
export type {
  RadioGroupOrientation,
  RadioGroupSize,
  RadioGroupVariant,
} from '@usezeno/core';

export interface ZRadioGroupProps extends ZComponentBase {
  /** Disabled state for all radios */
  disabled?: boolean;
  /** v-model value */
  modelValue?: FormValue;
  /** Form field name */
  name?: string;
  /** Layout orientation */
  orientation?: RadioGroupOrientation;
  /** Radio options */
  options?: RadioOption[];
  /** Size variant for all radios */
  size?: RadioGroupSize;
  /** Visual variant for all radios */
  variant?: RadioGroupVariant;
  /** Field label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Invalid/error state */
  invalid?: boolean;
  /** Required field */
  required?: boolean;
  /** ARIA describedby */
  ariaDescribedby?: string;
  /** Test ID for automated testing */
  testId?: string;
}

// ==================== Select Types ====================
// Re-export from core for backward compatibility
export type { SelectSize, SelectVariant, SelectOption } from '@usezeno/core';

export interface ZSelectProps extends ZComponentBase {
  /** Allow clearing selection */
  clearable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Selected value(s) */
  modelValue?: FormValue | FormValueArray;
  /** Allow multiple selections */
  multiple?: boolean;
  /** Available options */
  options?: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Enable search functionality */
  searchable?: boolean;
  /** Size variant */
  size?: SelectSize;
  /** Visual variant */
  variant?: SelectVariant;
  /** Form field name */
  name?: string;
  /** Required field */
  required?: boolean;
  /** Read-only state */
  readonly?: boolean;
  /** Invalid/error state */
  invalid?: boolean;
  /** Field label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Maximum visible tags for multi-select */
  maxVisibleTags?: number;
  /** Number of visible options in native multi-select */
  visibleOptions?: number;
  /** Custom ID */
  id?: string;
  /** ARIA describedby */
  ariaDescribedby?: string;
  /** ARIA label */
  ariaLabel?: string;
  /** Test ID for automated testing */
  testId?: string;
}

// ==================== Switch Types ====================
// Re-export from core for backward compatibility
export type { SwitchSize, SwitchVariant, TrackLabels } from '@usezeno/core';

export interface ZSwitchProps extends ZComponentBase {
  /** Controlled checked state */
  checked?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** v-model value */
  modelValue?: boolean;
  /** Size variant */
  size?: SwitchSize;
  /** Visual variant */
  variant?: SwitchVariant;
  /** Track labels for on/off states */
  trackLabels?: TrackLabels;
  /** Form field name */
  name?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Required field */
  required?: boolean;
  /** Invalid/error state */
  invalid?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Show icon in track */
  showIcon?: boolean;
  /** Custom ID */
  id?: string;
  /** ARIA describedby */
  ariaDescribedby?: string;
  /** ARIA label */
  ariaLabel?: string;
  /** Test ID for automated testing */
  testId?: string;
}

// ==================== Slider Types ====================
// Re-export from core for backward compatibility
export type { SliderSize } from '@usezeno/core';

export interface ZSliderProps extends ZComponentBase {
  /** Disabled state */
  disabled?: boolean;
  /** Maximum value */
  max?: number;
  /** Minimum value */
  min?: number;
  /** v-model value */
  modelValue?: number;
  /** Show min/max labels */
  showLabels?: boolean;
  /** Show current value tooltip */
  showValue?: boolean;
  /** Step increment */
  step?: number;
  /** Size variant */
  size?: SliderSize;
  /** Alternate value prop */
  value?: number;
  /** Field label */
  label?: string;
  /** Required field */
  required?: boolean;
  /** Show tooltip on hover/drag */
  showTooltip?: boolean;
  /** Show min/max values */
  showMinMax?: boolean;
  /** Custom ID */
  id?: string;
  /** ARIA describedby */
  ariaDescribedby?: string;
}

// File Upload types moved to advanced.ts

// Date Picker types moved to advanced.ts

export interface ZDatePickerProps extends ZComponentBase {
  /** Disabled state */
  disabled?: boolean;
  /** Date format string */
  format?: string;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Minimum selectable date */
  minDate?: Date;
  /** v-model value */
  modelValue?: DateValue;
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: DatePickerSize;
  /** Field label */
  label?: string;
  /** Required field */
  required?: boolean;
  /** Read-only state */
  readonly?: boolean;
  /** Allow clearing selection */
  clearable?: boolean;
  /** Error state */
  invalid?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Hide offset dates */
  hideOffsetDates?: boolean;
  /** Horizontal position of the menu relative to the input */
  position?: 'left' | 'center' | 'right';
  /** Use UTC timezone */
  utc?: boolean;
  /** Timezone */
  timezone?: string;
  /** ARIA label */
  ariaLabel?: string;
  /** Week start day (0 = Sunday, 1 = Monday, etc.) */
  weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Auto apply selection */
  autoApply?: boolean;
  /** Enable time picker */
  enableTimePicker?: boolean;
  /** Range mode */
  range?: boolean;
  /** Multi-calendar mode */
  multiCalendars?: boolean;
  /** Inline mode */
  inline?: boolean;
  /** Close on select */
  closeOnSelect?: boolean;
  /** Prevent min/max navigation */
  preventMinMaxNavigation?: boolean;
  /** Text input options */
  textInput?: boolean | object;
  /** Month change on scroll */
  monthChangeOnScroll?: boolean;
  /** Close the menu when the page scrolls */
  closeOnScroll?: boolean;
  /** Show only the time picker */
  timePickerOnly?: boolean;
  /** Locale passed to the picker */
  locale?: string;
  /** Format of the preview shown in the action row */
  previewFormat?: string;
  /** Label of the select button */
  selectText?: string;
  /** Label of the "now" button */
  nowButtonLabel?: string;
  /** Date the calendar opens on */
  startDate?: Date | string;
  /** Class added to the menu */
  menuClassName?: string;
  /** Class added to the calendar */
  calendarClassName?: string;
  /** Class added to the input */
  inputClassName?: string;
  /** Teleport the menu (true teleports to body) */
  teleport?: boolean | string;
  /** Centre the teleported menu */
  teleportCenter?: boolean;
  /** Vertical calendar layout */
  vertical?: boolean;
  /** Menu offset in pixels */
  offset?: number;
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Custom ID */
  id?: string;
  /** Test ID for automation */
  testId?: string;
}

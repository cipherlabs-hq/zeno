<template>
  <BaseField
    :id="id"
    :label="label"
    :help-text="helperText"
    :error="displayError"
    :required="required"
    :disabled="disabled"
  >
    <template #default="{ fieldId, hasError, describedBy }">
      <div :class="selectClasses" :data-testid="testId">
        <!-- Hidden native select input for accessibility -->
        <select
          :id="fieldId"
          ref="selectRef"
          :value="modelValue"
          :name="name"
          :disabled="disabled"
          :required="required"
          :multiple="multiple"
          :size="
            multiple
              ? Math.min(visibleOptions, normalizedOptions.length)
              : undefined
          "
          :aria-invalid="hasError ? 'true' : 'false'"
          :aria-describedby="describedBy"
          :aria-label="ariaLabel"
          :class="selectInputClasses"
          @change="handleChange"
          @blur="handleBlur"
          @focus="handleFocus"
          @keydown="handleKeydown"
        >
          <option
            v-if="placeholder && !multiple"
            value=""
            disabled
            :selected="!modelValue"
          >
            {{ placeholder }}
          </option>
          <option
            v-for="option in normalizedOptions"
            :key="getOptionKey(option)"
            :value="option.value"
            :disabled="option.disabled"
            :selected="isOptionSelected(option)"
          >
            {{ option.label }}
          </option>
        </select>

        <!-- Visual select container with enhanced design -->
        <label :for="fieldId" class="z-select__label">
          <!-- Select display area -->
          <div class="z-select__display">
            <!-- Loading spinner -->
            <div v-if="loading" class="z-select__spinner">
              <svg class="z-select__spinner-svg" viewBox="0 0 16 16">
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-dasharray="18.85"
                  stroke-dashoffset="18.85"
                >
                  <animate
                    attributeName="stroke-dasharray"
                    dur="1.5s"
                    values="0 18.85;9.425 9.425;0 18.85"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-dashoffset"
                    dur="1.5s"
                    values="0;-9.425;-18.85"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>

            <!-- Selected value display -->
            <div v-if="!loading" class="z-select__value">
              <span v-if="!hasSelectedValue" class="z-select__placeholder">
                {{ placeholder || 'Select an option...' }}
              </span>
              <template v-else>
                <!-- Single selection display -->
                <span v-if="!multiple" class="z-select__selected-text">
                  {{ selectedOptionLabel }}
                </span>
                <!-- Multiple selection display -->
                <div v-else class="z-select__selected-multiple">
                  <span
                    v-for="option in selectedOptions"
                    :key="getOptionKey(option)"
                    class="z-select__selected-tag"
                  >
                    {{ option.label }}
                    <button
                      v-if="!disabled && !readonly"
                      type="button"
                      class="z-select__remove-tag"
                      :aria-label="`Remove ${option.label}`"
                      @click.stop="removeOption(option)"
                    >
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        class="z-select__remove-icon"
                      >
                        <path
                          d="M9 3L3 9M3 3L9 9"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  </span>
                  <span
                    v-if="selectedOptions.length > maxVisibleTags"
                    class="z-select__overflow-count"
                  >
                    +{{ selectedOptions.length - maxVisibleTags }} more
                  </span>
                </div>
              </template>
            </div>

            <!-- Dropdown arrow -->
            <div v-if="!loading" class="z-select__icon" :aria-hidden="true">
              <svg viewBox="0 0 12 12" fill="none">
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </label>
      </div>
    </template>
  </BaseField>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BaseField from './base/BaseField.vue';
import type { FormValue } from '../types/base';

export interface SelectOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export interface ZSelectProps {
  /** The selected value(s) */
  modelValue?: string | number | boolean | (string | number | boolean)[];
  /** Array of options or array of strings/numbers */
  options?: SelectOption[] | string[] | number[];
  /** Placeholder text */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the select is required */
  required?: boolean;
  /** Whether multiple selection is allowed */
  multiple?: boolean;
  /** Whether the select is readonly */
  readonly?: boolean;
  /** Helper text to display */
  helperText?: string;
  /** Label for the select */
  label?: string;
  /** Name attribute for the select */
  name?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'filled' | 'outlined';
  /** Whether the select is in a loading state */
  loading?: boolean;
  /** Maximum number of visible tags in multiple mode */
  maxVisibleTags?: number;
  /** Number of visible options in multiple mode */
  visibleOptions?: number;
  /** Test ID for testing */
  testId?: string;
  /** ARIA label */
  ariaLabel?: string;
  /** Custom ID for the select */
  id?: string;
  /** Validation rules */
  validators?: Array<(_value: FormValue) => string | null>;
  /** Validation rule (legacy support) */
  validator?: (_value: FormValue) => string | null;
  /** Validate on blur */
  validateOnBlur?: boolean;
}

const props = withDefaults(defineProps<ZSelectProps>(), {
  size: 'md',
  variant: 'default',
  maxVisibleTags: 3,
  visibleOptions: 5,
  validators: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [
    _value: string | number | boolean | (string | number | boolean)[],
  ];
  change: [
    _value: string | number | boolean | (string | number | boolean)[],
    _selectedOption?: SelectOption,
  ];
  focus: [_event: FocusEvent];
  blur: [_event: FocusEvent];
}>();

// Refs
const selectRef = ref<HTMLSelectElement>();

// Normalize options to consistent format
const normalizedOptions = computed<SelectOption[]>(() => {
  if (!props.options) return [];

  return props.options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return {
        label: String(option),
        value: option,
        disabled: false,
      };
    }
    return option;
  });
});

// Check if option is selected
const isOptionSelected = (option: SelectOption): boolean => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return (props.modelValue as (string | number | boolean)[]).includes(
      option.value
    );
  }
  return props.modelValue === option.value;
};

// Get selected options for multiple mode
const selectedOptions = computed<SelectOption[]>(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return [];

  return normalizedOptions.value.filter(option =>
    (props.modelValue as (string | number | boolean)[])?.includes(option.value)
  );
});

// Get selected option label for single mode
const selectedOptionLabel = computed<string>(() => {
  if (props.multiple) return '';

  const selectedOption = normalizedOptions.value.find(
    option => option.value === props.modelValue
  );
  return selectedOption?.label || '';
});

// Check if there's a selected value
const hasSelectedValue = computed<boolean>(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0;
  }
  return (
    props.modelValue !== undefined &&
    props.modelValue !== null &&
    props.modelValue !== ''
  );
});

// Generate option key
const getOptionKey = (option: SelectOption): string => {
  return `${option.value}-${option.label}`;
};

// Validation state
const validationError = ref<string | null>(null);
const hasBeenBlurred = ref(false);

const validateValue = (value: any): string | null => {
  if (!props.validator) {
    return null;
  }

  // For empty values, pass empty string to validator
  if (value === undefined || value === null || value === '') {
    return props.validator('');
  }

  // For arrays (multiple selection), validate the array
  if (Array.isArray(value)) {
    return props.validator(value as any);
  }

  // For single values
  return props.validator(value);
};

// Watch for value changes and validate
watch(
  () => props.modelValue,
  newValue => {
    if (!props.validateOnBlur || hasBeenBlurred.value) {
      validationError.value = validateValue(newValue);
    }
  },
  { immediate: true }
);

// Display error - either from validation or external
const displayError = computed(() => {
  return validationError.value || undefined;
});

// Computed classes
const selectClasses = computed(() => [
  'z-select',
  `z-select--${props.size}`,
  `z-select--${props.variant}`,
  {
    'z-select--disabled': props.disabled,
    'z-select--readonly': props.readonly,
    'z-select--invalid': !!validationError.value,
    'z-select--multiple': props.multiple,
    'z-select--loading': props.loading,
    'z-select--has-value': hasSelectedValue.value,
  },
]);

// Classes for the select input element
const selectInputClasses = computed(() => [
  'z-select__input',
  {
    'z-select--error': !!validationError.value,
    'z-select--disabled': props.disabled,
    'z-select--placeholder': !hasSelectedValue.value && !!props.placeholder,
  },
]);

// Event handlers
const handleChange = (event: Event) => {
  if (props.disabled || props.readonly) return;

  const target = event.target as HTMLSelectElement;
  let newValue: string | number | boolean | (string | number | boolean)[];

  if (props.multiple) {
    const selectedValues: (string | number | boolean)[] = [];
    for (const option of target.selectedOptions) {
      const optionData = normalizedOptions.value.find(
        opt => String(opt.value) === option.value
      );
      if (optionData) {
        selectedValues.push(optionData.value);
      }
    }
    newValue = selectedValues;
    emit('update:modelValue', newValue);
    emit('change', newValue);
  } else {
    const selectedOption = normalizedOptions.value.find(
      opt => String(opt.value) === target.value
    );
    newValue = selectedOption?.value || target.value;
    emit('update:modelValue', newValue);
    emit('change', newValue, selectedOption);
  }

  // Validate after change
  if (!props.validateOnBlur) {
    validationError.value = validateValue(newValue);
  }
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  hasBeenBlurred.value = true;
  emit('blur', event);
  // Always validate on blur
  validationError.value = validateValue(props.modelValue);
};

const handleKeydown = (event: KeyboardEvent) => {
  // Handle keyboard navigation if needed
  if (props.disabled || props.readonly) {
    event.preventDefault();
    return;
  }
};

// Remove option in multiple mode
const removeOption = (optionToRemove: SelectOption) => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return;

  const newValue = (props.modelValue as (string | number | boolean)[]).filter(
    value => value !== optionToRemove.value
  );
  emit('update:modelValue', newValue);
  emit('change', newValue);

  // Validate after removal
  if (!props.validateOnBlur) {
    validationError.value = validateValue(newValue);
  }
};

// Focus method for external use
const focus = () => {
  selectRef.value?.focus();
};

// Blur method for external use
const blur = () => {
  selectRef.value?.blur();
};

// Expose methods
defineExpose({
  focus,
  blur,
  validate: () => {
    validationError.value = validateValue(props.modelValue);
    return !validationError.value;
  },
  validationError: computed(() => validationError.value),
});
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Select Component
 * Principles: Clear option selection, enhanced accessibility, intuitive interaction
 * Accessibility: WCAG 2.1 Level AA compliance, keyboard navigation, screen reader support
 * Motion: Smooth dropdown animations with spatial continuity
 */

.z-select {
  /* Base foundation */
  position: relative;
  display: inline-flex;
  flex-direction: column;
  gap: tokens.$spacing-2; /* 8px */
  font-family: tokens.$typography-font-family-primary;
  width: 100%;

  /* Physics-based transitions */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

/* Hidden native select for accessibility */
.z-select__input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  cursor: pointer;
  z-index: 1;

  /* Ensure proper selection behavior */
  &:not(.z-select--multiple &) {
    top: 0;
    left: 0;
  }

  /* Multiple select visibility */
  &.z-select--multiple & {
    position: relative;
    opacity: 1;
    height: auto;
    max-height: 200px;
    padding: tokens.$spacing-2;
    border: 2px solid var(--zeno-color-border-default);
    border-radius: tokens.$radius-md;
    background: var(--zeno-color-background-surface);
  }
}

/* Label container with enhanced interaction */
.z-select__label {
  display: flex;
  flex-direction: column;
  gap: tokens.$spacing-2; /* 8px */
  cursor: pointer;
  font-size: tokens.$typography-font-size-md; /* 16px */
  font-weight: tokens.$typography-font-weight-normal; /* 400 */
  line-height: tokens.$typography-line-height-relaxed;
  color: var(--zeno-color-text-primary);
  user-select: none;
  position: relative;
}

/* Visual select display area with enhanced design */
.z-select__display {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px; /* iOS Human Interface Guidelines minimum */
  padding: tokens.$spacing-3 tokens.$spacing-10 tokens.$spacing-3
    tokens.$spacing-3; /* Space for arrow */
  border: 2px solid var(--zeno-color-border-default);
  border-radius: tokens.$radius-md; /* 8px */
  background: var(--zeno-color-background-surface);

  /* Physics-based motion choreography */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  will-change: background-color, border-color, box-shadow;

  /* Hover enhancement */
  &:hover:not(.z-select--disabled &) {
    border-color: var(--zeno-color-border-strong);
    background: var(--zeno-color-background-subtle);
  }
}

/* Size variants optimized for readability and touch */
.z-select--sm {
  .z-select__display {
    min-height: 36px;
    padding: tokens.$spacing-2 tokens.$spacing-8 tokens.$spacing-2
      tokens.$spacing-2;
  }

  .z-select__text {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }

  .z-select__value {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }

  .z-select__helper,
  .z-select__error {
    font-size: tokens.$typography-font-size-xs; /* 12px */
  }

  .z-select__selected-tag {
    padding: tokens.$spacing-1 tokens.$spacing-2;
    font-size: tokens.$typography-font-size-xs; /* 12px */
  }
}

.z-select--md {
  .z-select__display {
    min-height: 44px;
    padding: tokens.$spacing-3 tokens.$spacing-10 tokens.$spacing-3
      tokens.$spacing-3;
  }

  .z-select__text {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }

  .z-select__value {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }

  .z-select__helper,
  .z-select__error {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }

  .z-select__selected-tag {
    padding: tokens.$spacing-1 tokens.$spacing-2;
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }
}

.z-select--lg {
  .z-select__display {
    min-height: 52px;
    padding: tokens.$spacing-4 tokens.$spacing-12 tokens.$spacing-4
      tokens.$spacing-4;
  }

  .z-select__text {
    font-size: tokens.$typography-font-size-lg; /* 18px */
  }

  .z-select__value {
    font-size: tokens.$typography-font-size-lg; /* 18px */
  }

  .z-select__helper,
  .z-select__error {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }

  .z-select__selected-tag {
    padding: tokens.$spacing-2 tokens.$spacing-3;
    font-size: tokens.$typography-font-size-md; /* 16px */
  }
}

/* Variant styles following design system hierarchy */

/* Default variant - neutral styling */
.z-select--default {
  .z-select__input:focus + .z-select__label .z-select__display {
    border-color: var(--zeno-color-focus-ring);
    box-shadow: 0 0 0 3px rgba(var(--zeno-color-accent-solid), 0.15);
  }
}

/* Primary variant */
.z-select--primary {
  .z-select__input:focus + .z-select__label .z-select__display {
    border-color: tokens.$color-accent;
    box-shadow: 0 0 0 3px rgba(tokens.$color-accent, 0.2);
  }

  .z-select__arrow {
    color: tokens.$color-accent;
  }
}

/* Accent variant */
.z-select--accent {
  .z-select__input:focus + .z-select__label .z-select__display {
    border-color: tokens.$color-accent;
    box-shadow: 0 0 0 3px rgba(tokens.$color-accent, 0.2);
  }

  .z-select__arrow {
    color: tokens.$color-accent;
  }
}

/* State modifiers */

/* Loading state */
.z-select--loading {
  .z-select__label {
    cursor: progress;
  }

  .z-select__display {
    background: var(--zeno-color-background-subtle);
    border-color: var(--zeno-color-border-subtle);
  }
}

/* Disabled state - enhanced accessibility */
.z-select--disabled {
  .z-select__label {
    cursor: not-allowed;
    opacity: 0.6;

    &:hover .z-select__display {
      background: var(--zeno-color-background-surface);
      border-color: var(--zeno-color-border-subtle);
    }
  }

  .z-select__display {
    background-color: var(--zeno-color-background-subtle);
    border-color: var(--zeno-color-border-subtle);
    color: var(--zeno-color-text-tertiary);
  }

  .z-select__arrow {
    color: var(--zeno-color-text-tertiary);
  }
}

/* Readonly state */
.z-select--readonly {
  .z-select__label {
    cursor: default;
  }

  .z-select__display {
    background-color: var(--zeno-color-background-muted);
    border-color: var(--zeno-color-border-subtle);

    &:hover {
      background-color: var(--zeno-color-background-muted);
      border-color: var(--zeno-color-border-subtle);
    }
  }
}

/* Invalid state - error styling */
.z-select--invalid {
  .z-select__display {
    border-color: var(--zeno-color-danger-solid);
    box-shadow: 0 0 0 1px rgba(var(--zeno-color-danger-solid), 0.2);
  }

  .z-select__input:focus + .z-select__label .z-select__display {
    border-color: var(--zeno-color-danger-solid);
    box-shadow: 0 0 0 3px rgba(var(--zeno-color-danger-solid), 0.15);
  }
}

/* Content structure */
.z-select__content {
  display: flex;
  flex-direction: column;
  gap: tokens.$spacing-1; /* 4px */
}

.z-select__text {
  color: inherit;
  line-height: tokens.$typography-line-height-normal;
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
}

.z-select__required {
  color: var(--zeno-color-danger-text);
  font-weight: tokens.$typography-font-weight-bold; /* 700 */
  margin-left: tokens.$spacing-1; /* 4px */
}

.z-select__helper {
  color: var(--zeno-color-text-secondary);
  line-height: tokens.$typography-line-height-relaxed;
  margin-top: tokens.$spacing-1; /* 4px */
}

.z-select__error {
  color: var(--zeno-color-danger-text);
  line-height: tokens.$typography-line-height-relaxed;
  margin-top: tokens.$spacing-1; /* 4px */
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
}

/* Value display area */
.z-select__value {
  flex: 1;
  display: flex;
  align-items: center;
  gap: tokens.$spacing-2; /* 8px */
  min-height: 1.5em;
  line-height: tokens.$typography-line-height-normal;
}

.z-select__placeholder {
  color: var(--zeno-color-text-placeholder);
  font-style: italic;
}

.z-select__selected-text {
  color: var(--zeno-color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Multiple selection styling */
.z-select__selected-multiple {
  display: flex;
  flex-wrap: wrap;
  gap: tokens.$spacing-1; /* 4px */
  align-items: center;
  max-width: 100%;
}

.z-select__selected-tag {
  display: inline-flex;
  align-items: center;
  gap: tokens.$spacing-1; /* 4px */
  padding: tokens.$spacing-1 tokens.$spacing-2;
  background: var(--zeno-color-background-subtle);
  border: 1px solid var(--zeno-color-border-subtle);
  border-radius: tokens.$radius-sm; /* 4px */
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  /* Micro-interaction feedback */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;

  &:hover {
    background: var(--zeno-color-background-muted);
    border-color: var(--zeno-color-border-default);
  }
}

.z-select__remove-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  border-radius: tokens.$radius-sm;
  cursor: pointer;
  color: var(--zeno-color-text-secondary);
  flex-shrink: 0;

  /* Enhanced interaction feedback */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;

  &:hover {
    background: var(--zeno-color-danger-subtle);
    color: var(--zeno-color-danger-text);
  }

  &:focus {
    outline: 2px solid var(--zeno-color-focus-ring);
    outline-offset: 1px;
  }
}

.z-select__remove-icon {
  width: 10px;
  height: 10px;
  stroke: currentColor;
}

.z-select__overflow-count {
  font-size: tokens.$typography-font-size-sm; /* 14px */
  color: var(--zeno-color-text-secondary);
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
  white-space: nowrap;
}

/* Loading spinner */
.z-select__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.z-select__spinner-svg {
  width: 16px;
  height: 16px;
  stroke: var(--zeno-color-text-secondary);
}

/* Dropdown arrow */
.z-select__arrow,
.z-select__icon {
  position: absolute;
  right: tokens.$spacing-3; /* 12px */
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--zeno-color-text-secondary);
  pointer-events: none;

  /* Smooth rotation animation */
  transition: transform tokens.$motion-duration-md
    tokens.$motion-easing-ease-out;

  svg {
    width: 12px;
    height: 12px;
    stroke: currentColor;
  }
}

.z-select__arrow-svg {
  width: 12px;
  height: 12px;
  stroke: currentColor;
}

/* Arrow rotation on focus */
.z-select__input:focus + .z-select__label .z-select__arrow,
.z-select__input:focus + .z-select__label .z-select__icon {
  transform: translateY(-50%) rotate(180deg);
}

/* Multiple select specific styling */
.z-select--multiple {
  .z-select__display {
    min-height: auto;
    padding: tokens.$spacing-2;
  }

  .z-select__input {
    position: relative;
    opacity: 1;
    height: auto;
    max-height: 200px;
    z-index: 0;
  }

  .z-select__arrow,
  .z-select__icon {
    display: none; /* Hide arrow for multiple selects */
  }
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-select {
    transition: none;
  }

  .z-select__display,
  .z-select__arrow,
  .z-select__selected-tag,
  .z-select__remove-tag {
    transition: none;
  }

  .z-select__input:focus + .z-select__label .z-select__arrow {
    transform: translateY(-50%) rotate(180deg);
    transition: none;
  }

  .z-select__spinner-svg animate {
    animation-duration: 2s;
  }
}

/* High contrast mode support */
@media (forced-colors: active) {
  .z-select__display {
    border: 2px solid ButtonText;
    background: ButtonFace;
  }

  .z-select__input:focus + .z-select__label .z-select__display {
    border-color: Highlight;
    outline: 2px solid Highlight;
  }

  .z-select__selected-tag {
    border: 1px solid ButtonText;
    background: ButtonFace;
  }

  .z-select__remove-tag {
    border: 1px solid ButtonText;

    &:hover {
      background: Highlight;
      color: HighlightText;
    }
  }

  .z-select--disabled .z-select__display {
    border-color: GrayText;
    background: ButtonFace;
    color: GrayText;
  }

  .z-select__arrow {
    color: ButtonText;
  }

  .z-select--disabled .z-select__arrow {
    color: GrayText;
  }
}
</style>

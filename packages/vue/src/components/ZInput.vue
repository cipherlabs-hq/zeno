<template>
  <BaseField
    :id="id"
    :label="floatingLabel ? '' : label"
    :help-text="helpText"
    :error="displayError"
    :required="required"
    :disabled="disabled"
  >
    <template #default="{ fieldId, hasError, describedBy }">
      <div class="z-input-wrapper" :class="wrapperClasses">
        <!-- Floating label -->
        <label
          v-if="floatingLabel && label"
          :for="fieldId"
          class="z-input__floating-label"
          :class="{ 'z-input__floating-label--float': shouldFloat }"
        >
          {{ label }}
          <span v-if="required" class="z-input__required" aria-label="required"
            >*</span
          >
        </label>

        <!-- Leading icon/addon -->
        <div v-if="$slots.leading || leadingIcon" class="z-input__leading">
          <slot name="leading">
            <span v-if="leadingIcon" class="z-input__icon">{{
              leadingIcon
            }}</span>
          </slot>
        </div>

        <!-- Input field -->
        <input
          :id="fieldId"
          ref="inputRef"
          :type="type"
          :placeholder="floatingLabel ? '' : placeholder"
          :value="modelValue"
          :disabled="disabled"
          :required="required"
          :readonly="readonly"
          :aria-invalid="hasError"
          :aria-describedby="describedBy"
          :autocomplete="autocomplete"
          :min="min"
          :max="max"
          :step="step"
          class="z-input"
          :class="inputClasses"
          @input="handleInput"
          @blur="handleBlur"
          @focus="handleFocus"
          @keydown="handleKeydown"
        />

        <!-- Clear button -->
        <button
          v-if="clearable && modelValue && !disabled && !readonly"
          type="button"
          class="z-input__clear"
          aria-label="Clear input"
          @click="handleClear"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M8 8.707l3.646 3.647.708-.708L8.707 8l3.647-3.646-.708-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.708L8 8.707z"
            />
          </svg>
        </button>

        <!-- Trailing icon/addon -->
        <div v-if="$slots.trailing || trailingIcon" class="z-input__trailing">
          <slot name="trailing">
            <span v-if="trailingIcon" class="z-input__icon">{{
              trailingIcon
            }}</span>
          </slot>
        </div>

        <!-- Progress bar for loading state -->
        <div v-if="loading" class="z-input__progress" aria-hidden="true"></div>
      </div>
    </template>
  </BaseField>
</template>

<script setup lang="ts">
import { computed, ref, watch, useSlots } from 'vue';
import BaseField from './base/BaseField.vue';
import type { ZInputProps } from '../types/forms';

// Re-export type for backward compatibility
export type { ZInputProps };

// Get slots
const slots = useSlots();

const props = withDefaults(defineProps<ZInputProps>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  label: '',
  helpText: '',
  required: false,
  disabled: false,
  readonly: false,
  id: '',
  validator: undefined,
  validateOnBlur: false,
  clearable: false,
  loading: false,
  floatingLabel: false,
  leadingIcon: '',
  trailingIcon: '',
  autocomplete: 'off',
  size: 'md',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  clear: [];
  enter: [];
}>();

// Template refs
const inputRef = ref<HTMLInputElement>();

// Local state
const validationError = ref<string | null>(null);
const hasBeenBlurred = ref(false);
const isFocused = ref(false);

// Computed properties
const displayError = computed(() => {
  if (props.validateOnBlur && !hasBeenBlurred.value) {
    return undefined;
  }
  return validationError.value || undefined;
});

const shouldFloat = computed(() => {
  return (
    isFocused.value ||
    !!props.modelValue ||
    props.type === 'date' ||
    props.type === 'time' ||
    props.type === 'datetime-local'
  );
});

const inputClasses = computed(() => [
  `z-input--${props.size}`,
  {
    'z-input--error': Boolean(displayError.value),
    'z-input--disabled': props.disabled,
    'z-input--readonly': props.readonly,
    'z-input--has-leading': !!props.leadingIcon || !!slots.leading,
    'z-input--has-trailing':
      !!props.trailingIcon || !!slots.trailing || props.clearable,
    'z-input--floating-label': props.floatingLabel,
  },
]);

const wrapperClasses = computed(() => [
  'z-input-wrapper',
  `z-input-wrapper--${props.size}`,
  {
    'z-input-wrapper--focused': isFocused.value,
    'z-input-wrapper--error': Boolean(displayError.value),
    'z-input-wrapper--disabled': props.disabled,
    'z-input-wrapper--loading': props.loading,
  },
]);

// Validation logic
const validateValue = (value: string | number): string | null => {
  // Check required validation first
  if (props.required && (!value || value === '')) {
    return 'This field is required';
  }

  // Run custom validators if provided
  if (props.validator) {
    // Handle function validators
    if (typeof props.validator === 'function') {
      const error = props.validator(value);
      if (error) return error;
    } else if (Array.isArray(props.validator)) {
      // Handle array of function validators
      for (const validator of props.validator) {
        if (typeof validator === 'function') {
          const error = validator(value);
          if (error) return error;
        }
      }
    }
    // Note: Object-style validators would be handled here if needed
  }

  return null;
};

// Event handlers
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = props.type === 'number' ? Number(target.value) : target.value;

  emit('update:modelValue', value);

  if (!props.validateOnBlur) {
    validationError.value = validateValue(value);
  }
};

const handleBlur = (event: FocusEvent) => {
  hasBeenBlurred.value = true;
  isFocused.value = false;
  validationError.value = validateValue(props.modelValue);
  emit('blur', event);
};

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleClear = () => {
  emit('update:modelValue', '');
  emit('clear');
  validationError.value = null;
  inputRef.value?.focus();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    emit('enter');
  }
};

// Watch for external value changes
watch(
  () => props.modelValue,
  newValue => {
    if (!props.validateOnBlur || hasBeenBlurred.value) {
      validationError.value = validateValue(newValue);
    }
  }
);

// Auto-validate required fields
watch(
  () => props.required,
  isRequired => {
    if (isRequired && !props.validator) {
      validationError.value = validateValue(props.modelValue);
    }
  },
  { immediate: true }
);

// Initial validation on mount
watch(
  () => [props.modelValue, props.validator, props.required],
  () => {
    if (!props.validateOnBlur || hasBeenBlurred.value) {
      validationError.value = validateValue(props.modelValue);
    }
  },
  { immediate: true }
);

// Expose methods
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
  clear: handleClear,
});
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Input Component
 * Principles: Intuitive data entry, clear visual feedback, frictionless interaction
 * Accessibility: WCAG 2.1 Level AA compliance, comprehensive keyboard navigation
 * Motion: Smooth micro-interactions for enhanced user feedback
 */

.z-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--zeno-color-background-surface);
  border: 2px solid var(--zeno-color-border-default);
  border-radius: tokens.$radius-lg; /* 12px - Apple-style corners */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  overflow: hidden;

  /* Size variants */
  &--sm {
    min-height: 36px;
  }

  &--md {
    min-height: 44px;
  }

  &--lg {
    min-height: 52px;
  }

  /* State variations */
  &--focused {
    border-color: var(--zeno-color-accent-solid);
    box-shadow:
      0 0 0 3px var(--zeno-color-background-surface),
      0 0 0 5px rgba(var(--zeno-color-accent-solid), 0.2);
  }

  &--error {
    border-color: var(--zeno-color-danger-solid);

    &.z-input-wrapper--focused {
      box-shadow:
        0 0 0 3px var(--zeno-color-background-surface),
        0 0 0 5px rgba(var(--zeno-color-danger-solid), 0.2);
    }
  }

  &--disabled {
    background-color: var(--zeno-color-background-subtle);
    border-color: var(--zeno-color-border-subtle);
    cursor: not-allowed;
    opacity: 0.7;
  }

  &--loading {
    pointer-events: none;
  }

  &:hover:not(.z-input-wrapper--disabled):not(.z-input-wrapper--focused) {
    border-color: var(--zeno-color-border-strong);
    background-color: var(--zeno-color-background-surface);
  }
}

.z-input {
  flex: 1;
  width: 100%;
  padding: 0 tokens.$spacing-4; /* 16px */
  font-family: tokens.$typography-font-family-primary;
  font-weight: tokens.$typography-font-weight-normal;
  line-height: tokens.$typography-line-height-normal;
  color: var(--zeno-color-text-primary);
  background: transparent;
  border: none;
  outline: none;
  transition: color tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  -webkit-appearance: none;

  /* Size variants */
  &--sm {
    font-size: tokens.$typography-font-size-sm; /* 14px */
    padding: tokens.$spacing-2 tokens.$spacing-3;
  }

  &--md {
    font-size: tokens.$typography-font-size-md; /* 16px */
    padding: tokens.$spacing-3 tokens.$spacing-4;
  }

  &--lg {
    font-size: tokens.$typography-font-size-lg; /* 18px */
    padding: tokens.$spacing-4 tokens.$spacing-5;
  }

  /* Adjust padding for icons */
  &--has-leading {
    padding-left: 0;
  }

  &--has-trailing {
    padding-right: 0;
  }

  /* Floating label adjustment */
  &--floating-label {
    padding-top: tokens.$spacing-5;
    padding-bottom: tokens.$spacing-1;
  }

  &::placeholder {
    color: var(--zeno-color-text-tertiary);
    opacity: 1;
    transition: opacity tokens.$motion-duration-md
      tokens.$motion-easing-ease-out;
  }

  &:focus::placeholder {
    opacity: 0.7;
  }

  &--disabled {
    color: var(--zeno-color-text-tertiary);
    cursor: not-allowed;
  }

  &--readonly {
    cursor: default;
  }

  /* Remove spinners from number inputs */
  &[type='number'] {
    -moz-appearance: textfield;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  /* Date/time input styling */
  &[type='date'],
  &[type='time'],
  &[type='datetime-local'] {
    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 0.6;
      transition: opacity tokens.$motion-duration-md
        tokens.$motion-easing-ease-out;

      &:hover {
        opacity: 1;
      }
    }
  }
}

/* Floating label - Material Design inspired */
.z-input__floating-label {
  position: absolute;
  left: tokens.$spacing-4;
  top: 50%;
  transform: translateY(-50%);
  font-size: tokens.$typography-font-size-md;
  font-weight: tokens.$typography-font-weight-normal;
  color: var(--zeno-color-text-tertiary);
  pointer-events: none;
  transition: all tokens.$motion-duration-md cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
  white-space: nowrap;
  max-width: calc(100% - 80px);
  overflow: hidden;
  text-overflow: ellipsis;

  &--float {
    top: tokens.$spacing-2;
    transform: translateY(0) scale(0.75);
    color: var(--zeno-color-accent-text);
    font-weight: tokens.$typography-font-weight-medium;
    letter-spacing: 0.025em;
  }

  .z-input-wrapper--error & {
    &--float {
      color: var(--zeno-color-danger-text);
    }
  }
}

.z-input__required {
  color: var(--zeno-color-danger-text);
  margin-left: tokens.$spacing-1;
}

/* Icon slots */
.z-input__leading,
.z-input__trailing {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 tokens.$spacing-3;
  color: var(--zeno-color-text-secondary);
  flex-shrink: 0;

  .z-input-wrapper--focused & {
    color: var(--zeno-color-accent-text);
  }

  .z-input-wrapper--error & {
    color: var(--zeno-color-danger-text);
  }
}

.z-input__icon {
  font-size: tokens.$typography-font-size-lg;
  line-height: 1;
}

/* Clear button */
.z-input__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  margin-right: tokens.$spacing-2;
  background: transparent;
  border: none;
  border-radius: tokens.$radius-md;
  color: var(--zeno-color-text-secondary);
  cursor: pointer;
  outline: none;
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  flex-shrink: 0;

  &:hover {
    background-color: var(--zeno-color-background-subtle);
    color: var(--zeno-color-text-primary);
    transform: scale(1.1);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--zeno-color-accent-solid);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

/* Progress bar for loading state */
.z-input__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--zeno-color-accent-solid),
    transparent
  );
  animation: input-progress 1.5s ease-in-out infinite;
  transform-origin: left center;
}

@keyframes input-progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .z-input-wrapper,
  .z-input,
  .z-input__floating-label,
  .z-input__clear,
  .z-input__progress {
    transition: none;
  }

  .z-input__progress {
    animation: none;
    opacity: 0.5;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .z-input-wrapper {
    border-width: 3px;

    &--focused {
      outline: 3px solid var(--zeno-color-accent-solid);
      outline-offset: 2px;
    }
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .z-input__clear:hover {
    transform: none;
    background-color: transparent;
  }
}
</style>

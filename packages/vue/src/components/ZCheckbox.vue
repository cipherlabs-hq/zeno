<template>
  <div :class="checkboxClasses" :data-testid="testId">
    <!-- Hidden native input for accessibility and form submission -->
    <input
      :id="inputId"
      ref="inputRef"
      type="checkbox"
      :checked="isChecked"
      :indeterminate="indeterminate"
      :disabled="disabled"
      :required="required"
      :aria-describedby="ariaDescribedby"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-label="ariaLabel"
      :value="value"
      :name="name"
      class="z-checkbox__input"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />

    <!-- Visual checkbox with label -->
    <label :for="inputId" class="z-checkbox__label">
      <!-- Checkbox indicator with enhanced animations -->
      <div class="z-checkbox__indicator" :aria-hidden="true">
        <!-- Loading spinner -->
        <div v-if="loading" class="z-checkbox__spinner">
          <svg class="z-checkbox__spinner-svg" viewBox="0 0 16 16">
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

        <!-- Check mark icon -->
        <Transition name="z-checkbox-check" mode="out-in">
          <svg
            v-if="isChecked && !indeterminate && !loading"
            class="z-checkbox__check"
            :width="iconSize"
            :height="iconSize"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M13.5 4.5L6 12L2.5 8.5"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Transition>

        <!-- Indeterminate icon -->
        <Transition name="z-checkbox-indeterminate" mode="out-in">
          <svg
            v-if="indeterminate && !loading"
            class="z-checkbox__indeterminate"
            :width="iconSize"
            :height="iconSize"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 8H12"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        </Transition>
      </div>

      <!-- Label content -->
      <div v-if="$slots.default || label" class="z-checkbox__content">
        <span class="z-checkbox__text">
          <slot>{{ label }}</slot>
        </span>

        <!-- Helper text -->
        <span v-if="helperText && !invalid" class="z-checkbox__helper">
          {{ helperText }}
        </span>

        <!-- Error message -->
        <span v-if="invalid && errorMessage" class="z-checkbox__error">
          {{ errorMessage }}
        </span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import type {
  ZCheckboxProps,
  CheckboxSize,
  CheckboxVariant,
} from '../types/forms';
import type { ZCheckboxEmits } from '../types/events';

// Re-export types for backward compatibility
export type { ZCheckboxProps, CheckboxSize, CheckboxVariant, ZCheckboxEmits };

const props = withDefaults(defineProps<ZCheckboxProps>(), {
  size: 'md',
  variant: 'default',
  disabled: false,
  required: false,
  invalid: false,
  loading: false,
  indeterminate: false,
});

const emit = defineEmits<ZCheckboxEmits>();

// Template refs
const inputRef = ref<HTMLInputElement>();

// Computed properties
const inputId = computed(
  () => props.id || `z-checkbox-${Math.random().toString(36).slice(2, 8)}`
);

// Local state for uncontrolled mode
const internalChecked = ref(props.checked || false);

const isControlled = computed(() => props.modelValue !== undefined);

const isChecked = computed(() => {
  if (isControlled.value) {
    if (Array.isArray(props.modelValue)) {
      return (
        props.value !== undefined && props.modelValue.includes(props.value)
      );
    }
    return !!props.modelValue;
  }
  return props.checked !== undefined ? props.checked : internalChecked.value;
});

const iconSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 12;
    case 'lg':
      return 16;
    default:
      return 14;
  }
});

const checkboxClasses = computed(() => [
  'z-checkbox',
  `z-checkbox--${props.size}`,
  `z-checkbox--${props.variant}`,
  {
    'z-checkbox--checked': isChecked.value,
    'z-checkbox--indeterminate': props.indeterminate,
    'z-checkbox--disabled': props.disabled,
    'z-checkbox--invalid': props.invalid,
    'z-checkbox--loading': props.loading,
    'z-checkbox--required': props.required,
  },
]);

// Event handlers
const handleChange = (event: Event) => {
  if (props.disabled || props.loading) return;

  const target = event.target as HTMLInputElement;
  const newChecked = target.checked;

  if (isControlled.value) {
    if (Array.isArray(props.modelValue) && props.value !== undefined) {
      const newValue = [...props.modelValue];
      if (newChecked) {
        if (!newValue.includes(props.value)) {
          newValue.push(props.value);
        }
      } else {
        const index = newValue.indexOf(props.value);
        if (index > -1) {
          newValue.splice(index, 1);
        }
      }
      emit('update:modelValue', newValue);
    } else {
      emit('update:modelValue', newChecked);
    }
  } else {
    // Update internal state for uncontrolled mode
    internalChecked.value = newChecked;
  }

  emit('change', event, newChecked);
};

const handleFocus = (event: FocusEvent) => {
  if (props.disabled) return;
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  if (props.disabled) return;
  emit('blur', event);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.loading) return;

  // Space key should toggle the checkbox
  if (event.key === ' ') {
    event.preventDefault();
    const newChecked = !isChecked.value;

    if (isControlled.value) {
      if (Array.isArray(props.modelValue) && props.value !== undefined) {
        const newValue = [...props.modelValue];
        if (newChecked) {
          if (!newValue.includes(props.value)) {
            newValue.push(props.value);
          }
        } else {
          const index = newValue.indexOf(props.value);
          if (index > -1) {
            newValue.splice(index, 1);
          }
        }
        emit('update:modelValue', newValue);
      } else {
        emit('update:modelValue', newChecked);
      }
    } else {
      // Update internal state for uncontrolled mode
      internalChecked.value = newChecked;
    }

    // Create a synthetic change event
    const syntheticEvent = new Event('change', { bubbles: true });
    Object.defineProperty(syntheticEvent, 'target', {
      value: { checked: newChecked },
      enumerable: true,
    });

    emit('change', syntheticEvent, newChecked);
  }
};

// Watch for checked state changes and update native input
watch(
  isChecked,
  newChecked => {
    if (inputRef.value) {
      inputRef.value.checked = newChecked;
    }
  },
  { immediate: true }
);

// Watch for indeterminate state changes and update native input
watch(
  () => props.indeterminate,
  newIndeterminate => {
    if (inputRef.value) {
      inputRef.value.indeterminate = newIndeterminate;
    }
  },
  { immediate: true }
);

// Update indeterminate state on next tick to ensure DOM is ready
watch(
  inputRef,
  newInputRef => {
    if (newInputRef) {
      nextTick(() => {
        newInputRef.indeterminate = props.indeterminate;
        newInputRef.checked = isChecked.value;
      });
    }
  },
  { immediate: true }
);

// Expose methods for programmatic control
defineExpose({
  /** Focus the checkbox input */
  focus: () => inputRef.value?.focus(),
  /** Blur the checkbox input */
  blur: () => inputRef.value?.blur(),
  /** Get reference to the input element */
  getInputElement: () => inputRef.value,
});
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Checkbox Component
 * Principles: Intuitive interaction, clear visual feedback, accessible design
 * Accessibility: WCAG 2.1 Level AA compliance, enhanced focus states
 * Motion: Smooth micro-interactions for spatial continuity
 */

.z-checkbox {
  /* Base foundation */
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  gap: tokens.$spacing-3; /* 12px - optimal cognitive spacing */
  font-family: tokens.$typography-font-family-primary;

  /* Enhanced touch targets for mobile */
  min-height: 44px; /* iOS Human Interface Guidelines minimum */

  /* Physics-based transitions */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

/* Hidden native input for accessibility */
.z-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  pointer-events: none;

  /* Ensure input is still accessible to screen readers */
  &:focus {
    outline: none;
  }
}

/* Label container with enhanced interaction */
.z-checkbox__label {
  display: flex;
  align-items: flex-start;
  gap: tokens.$spacing-3; /* 12px */
  cursor: pointer;
  font-size: tokens.$typography-font-size-md; /* 16px */
  font-weight: tokens.$typography-font-weight-normal; /* 400 */
  line-height: tokens.$typography-line-height-relaxed;
  color: var(--zeno-color-text-primary);
  user-select: none;

  /* Enhanced touch area */
  padding: tokens.$spacing-1; /* 4px padding for better touch targets */
  margin: -#{tokens.$spacing-1}; /* Negative margin to maintain visual alignment */
  border-radius: tokens.$radius-sm; /* 4px */

  /* Smooth interaction feedback */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;

  &:hover:not(.z-checkbox--disabled &) {
    background-color: var(--zeno-color-background-subtle);
  }
}

/* Visual checkbox indicator with enhanced design */
.z-checkbox__indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--zeno-color-border-default);
  border-radius: tokens.$radius-sm; /* 4px - Apple-style subtle corners */
  background: var(--zeno-color-background-surface);

  /* Physics-based motion choreography */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  will-change: background-color, border-color, transform, box-shadow;

  /* Hover enhancement */
  &:hover {
    border-color: var(--zeno-color-border-strong);
    transform: scale(1.05);
  }
}

/* Size variants optimized for readability and touch */
.z-checkbox--sm {
  .z-checkbox__indicator {
    width: 16px;
    height: 16px;
  }

  .z-checkbox__text {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }

  .z-checkbox__helper,
  .z-checkbox__error {
    font-size: tokens.$typography-font-size-xs; /* 12px */
  }
}

.z-checkbox--md {
  .z-checkbox__indicator {
    width: 20px;
    height: 20px;
  }

  .z-checkbox__text {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }

  .z-checkbox__helper,
  .z-checkbox__error {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }
}

.z-checkbox--lg {
  .z-checkbox__indicator {
    width: 24px;
    height: 24px;
  }

  .z-checkbox__text {
    font-size: tokens.$typography-font-size-lg; /* 18px */
  }

  .z-checkbox__helper,
  .z-checkbox__error {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }
}

/* Variant styles following design system hierarchy */

/* Default variant - neutral styling */
.z-checkbox--default {
  .z-checkbox--checked &,
  .z-checkbox--indeterminate & {
    .z-checkbox__indicator {
      background: var(--zeno-color-accent-solid);
      border-color: var(--zeno-color-accent-solid);
      color: var(--zeno-color-text-inverse);
      box-shadow: 0 2px 4px rgba(var(--zeno-color-accent-solid), 0.2);
    }
  }
}

/* Primary variant */
.z-checkbox--primary {
  .z-checkbox--checked &,
  .z-checkbox--indeterminate & {
    .z-checkbox__indicator {
      background: linear-gradient(
        135deg,
        tokens.$color-accent 0%,
        tokens.$color-accent-hover 100%
      );
      border-color: tokens.$color-accent;
      color: tokens.$color-white;
      box-shadow: 0 2px 4px rgba(tokens.$color-accent, 0.3);
    }
  }
}

/* Accent variant */
.z-checkbox--accent {
  .z-checkbox--checked &,
  .z-checkbox--indeterminate & {
    .z-checkbox__indicator {
      background: tokens.$color-accent;
      border-color: tokens.$color-accent;
      color: tokens.$color-white;
      box-shadow: 0 2px 4px rgba(tokens.$color-accent, 0.3);
    }
  }
}

/* Enhanced focus accessibility */
.z-checkbox__input:focus-visible + .z-checkbox__label .z-checkbox__indicator {
  outline: 3px solid var(--zeno-color-focus-ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(var(--zeno-color-accent-solid), 0.15);
  border-color: var(--zeno-color-focus-ring);
}

/* State modifiers */

/* Checked state with enhanced visual feedback */
.z-checkbox--checked {
  .z-checkbox__indicator {
    transform: scale(1.02);
  }
}

/* Loading state */
.z-checkbox--loading {
  .z-checkbox__label {
    cursor: progress;
  }

  .z-checkbox__indicator {
    background: var(--zeno-color-background-subtle);
    border-color: var(--zeno-color-border-subtle);
  }
}

/* Disabled state - enhanced accessibility */
.z-checkbox--disabled {
  .z-checkbox__label {
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background-color: transparent;
    }
  }

  .z-checkbox__indicator {
    background-color: var(--zeno-color-background-subtle);
    border-color: var(--zeno-color-border-subtle);

    &:hover {
      transform: none;
      border-color: var(--zeno-color-border-subtle);
    }
  }
}

/* Invalid state - error styling */
.z-checkbox--invalid {
  .z-checkbox__indicator {
    border-color: var(--zeno-color-danger-solid);
    box-shadow: 0 0 0 1px rgba(var(--zeno-color-danger-solid), 0.2);
  }

  .z-checkbox__input:focus-visible + .z-checkbox__label .z-checkbox__indicator {
    border-color: var(--zeno-color-danger-solid);
    box-shadow: 0 0 0 6px rgba(var(--zeno-color-danger-solid), 0.15);
  }
}

/* Content structure */
.z-checkbox__content {
  display: flex;
  flex-direction: column;
  gap: tokens.$spacing-1; /* 4px */
  margin-top: 1px; /* Align with checkbox center */
}

.z-checkbox__text {
  color: inherit;
  line-height: tokens.$typography-line-height-normal;
}

.z-checkbox__helper {
  color: var(--zeno-color-text-secondary);
  line-height: tokens.$typography-line-height-relaxed;
  margin-top: tokens.$spacing-1; /* 4px */
}

.z-checkbox__error {
  color: var(--zeno-color-danger-text);
  line-height: tokens.$typography-line-height-relaxed;
  margin-top: tokens.$spacing-1; /* 4px */
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
}

/* Loading spinner */
.z-checkbox__spinner {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.z-checkbox__spinner-svg {
  width: 12px;
  height: 12px;
  stroke: var(--zeno-color-text-secondary);
}

/* Check and indeterminate icons */
.z-checkbox__check,
.z-checkbox__indeterminate {
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  stroke: currentColor;
}

/* Transition animations for enhanced UX */
.z-checkbox-check-enter-active,
.z-checkbox-check-leave-active,
.z-checkbox-indeterminate-enter-active,
.z-checkbox-indeterminate-leave-active {
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

.z-checkbox-check-enter-from,
.z-checkbox-check-leave-to,
.z-checkbox-indeterminate-enter-from,
.z-checkbox-indeterminate-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-checkbox {
    transition: none;
  }

  .z-checkbox__label,
  .z-checkbox__indicator,
  .z-checkbox__check,
  .z-checkbox__indeterminate {
    transition: none;
  }

  .z-checkbox__indicator:hover {
    transform: none;
  }

  .z-checkbox-check-enter-active,
  .z-checkbox-check-leave-active,
  .z-checkbox-indeterminate-enter-active,
  .z-checkbox-indeterminate-leave-active {
    transition: opacity 0.1s ease;
  }

  .z-checkbox__spinner-svg animate {
    animation-duration: 2s;
  }
}

/* High contrast mode support */
@media (forced-colors: active) {
  .z-checkbox__indicator {
    border: 2px solid ButtonText;
    background: ButtonFace;
  }

  .z-checkbox--checked .z-checkbox__indicator,
  .z-checkbox--indeterminate .z-checkbox__indicator {
    background: Highlight;
    border-color: Highlight;
    color: HighlightText;
  }

  .z-checkbox--disabled .z-checkbox__indicator {
    border-color: GrayText;
    background: ButtonFace;
  }
}
</style>

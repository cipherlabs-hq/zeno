<template>
  <div :class="radioClasses" :data-testid="testId">
    <!-- Hidden native radio input -->
    <input
      :id="inputId"
      ref="inputRef"
      type="radio"
      :name="computedName"
      :value="value"
      :checked="isChecked"
      :disabled="isDisabled"
      :required="isRequired"
      :aria-describedby="ariaDescribedby"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-label="ariaLabel"
      class="z-radio__input"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />

    <!-- Visual radio with label -->
    <label :for="inputId" class="z-radio__label">
      <!-- Radio indicator with enhanced animations -->
      <div class="z-radio__indicator" :aria-hidden="true">
        <!-- Loading spinner -->
        <div v-if="loading" class="z-radio__spinner">
          <svg class="z-radio__spinner-svg" viewBox="0 0 16 16">
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

        <!-- Radio dot with enhanced animation -->
        <Transition name="z-radio-dot" mode="out-in">
          <div v-if="isChecked && !loading" class="z-radio__dot" />
        </Transition>
      </div>

      <!-- Label content -->
      <div v-if="$slots.default || label" class="z-radio__content">
        <span class="z-radio__text">
          <slot>{{ label }}</slot>
        </span>

        <!-- Helper text -->
        <span v-if="helperText && !invalid" class="z-radio__helper">
          {{ helperText }}
        </span>

        <!-- Error message -->
        <span v-if="invalid && errorMessage" class="z-radio__error">
          {{ errorMessage }}
        </span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue';
import type { ZRadioProps, RadioSize, RadioVariant } from '../types/forms';
import type { ZRadioEmits } from '../types/events';

// Re-export types for backward compatibility
export type { ZRadioProps, RadioSize, RadioVariant, ZRadioEmits };

const props = withDefaults(defineProps<ZRadioProps>(), {
  size: 'md',
  variant: 'default',
  disabled: false,
  required: false,
  invalid: false,
  loading: false,
});

const emit = defineEmits<ZRadioEmits>();

// Template refs
const inputRef = ref<HTMLInputElement>();

// Inject radio group context if available
const radioGroup = inject<any>('radioGroup', null);

// Computed properties
const inputId = computed(
  () => props.id || `z-radio-${Math.random().toString(36).slice(2, 8)}`
);

// Use group context values if available, otherwise fall back to props
const computedName = computed(() => {
  if (radioGroup?.name?.value) return radioGroup.name.value;
  return props.name || 'radio-group';
});

const computedSize = computed(() => {
  if (radioGroup?.size?.value) return radioGroup.size.value;
  return props.size;
});

const isDisabled = computed(() => {
  if (radioGroup?.disabled?.value) return true;
  return props.disabled;
});

const isRequired = computed(() => {
  if (radioGroup?.required?.value) return true;
  return props.required;
});

const isChecked = computed(() => {
  if (radioGroup?.modelValue?.value !== undefined) {
    return radioGroup.modelValue.value === props.value;
  }
  return props.modelValue === props.value;
});

const radioClasses = computed(() => [
  'z-radio',
  `z-radio--${computedSize.value}`,
  `z-radio--${props.variant}`,
  {
    'z-radio--checked': isChecked.value,
    'z-radio--disabled': isDisabled.value,
    'z-radio--invalid': props.invalid,
    'z-radio--loading': props.loading,
    'z-radio--required': isRequired.value,
  },
]);

// Event handlers
const handleChange = (event: Event) => {
  if (isDisabled.value || props.loading) return;

  const target = event.target as HTMLInputElement;
  if (target.checked) {
    // If part of a group, use group's update method
    if (radioGroup?.updateValue) {
      radioGroup.updateValue(props.value);
    } else {
      // Standalone radio
      emit('update:modelValue', props.value);
    }

    emit('change', event, props.value);
  }
};

const handleFocus = (event: FocusEvent) => {
  if (isDisabled.value) return;
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  if (isDisabled.value) return;
  emit('blur', event);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (isDisabled.value || props.loading) return;

  // Space key should select the radio
  if (event.key === ' ') {
    event.preventDefault();

    if (radioGroup?.updateValue) {
      radioGroup.updateValue(props.value);
    } else {
      emit('update:modelValue', props.value);
    }

    // Create a synthetic change event
    const syntheticEvent = new Event('change', { bubbles: true });
    Object.defineProperty(syntheticEvent, 'target', {
      value: { checked: true, value: props.value },
      enumerable: true,
    });

    emit('change', syntheticEvent, props.value);
  }
};

// Expose methods for programmatic control
defineExpose({
  /** Focus the radio input */
  focus: () => inputRef.value?.focus(),
  /** Blur the radio input */
  blur: () => inputRef.value?.blur(),
  /** Get reference to the input element */
  getInputElement: () => inputRef.value,
});
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Radio Component
 * Principles: Clear selection states, intuitive interaction, accessible design
 * Accessibility: WCAG 2.1 Level AA compliance, enhanced focus states
 * Motion: Smooth micro-interactions for spatial continuity
 */

.z-radio {
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
.z-radio__input {
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
.z-radio__label {
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

  &:hover:not(.z-radio--disabled &) {
    background-color: var(--zeno-color-background-subtle);
  }
}

/* Visual radio indicator with enhanced design */
.z-radio__indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--zeno-color-border-default);
  border-radius: 50%; /* Perfect circle */
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
.z-radio--sm {
  .z-radio__indicator {
    width: 16px;
    height: 16px;
  }

  .z-radio__text {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }

  .z-radio__helper,
  .z-radio__error {
    font-size: tokens.$typography-font-size-xs; /* 12px */
  }

  .z-radio__dot {
    width: 6px;
    height: 6px;
  }
}

.z-radio--md {
  .z-radio__indicator {
    width: 20px;
    height: 20px;
  }

  .z-radio__text {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }

  .z-radio__helper,
  .z-radio__error {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }

  .z-radio__dot {
    width: 8px;
    height: 8px;
  }
}

.z-radio--lg {
  .z-radio__indicator {
    width: 24px;
    height: 24px;
  }

  .z-radio__text {
    font-size: tokens.$typography-font-size-lg; /* 18px */
  }

  .z-radio__helper,
  .z-radio__error {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }

  .z-radio__dot {
    width: 10px;
    height: 10px;
  }
}

/* Variant styles following design system hierarchy */

/* Default variant - neutral styling */
.z-radio--default {
  .z-radio--checked & {
    .z-radio__indicator {
      border-color: var(--zeno-color-accent-solid);
      box-shadow: 0 2px 4px rgba(var(--zeno-color-accent-solid), 0.2);
    }

    .z-radio__dot {
      background: var(--zeno-color-accent-solid);
    }
  }
}

/* Primary variant */
.z-radio--primary {
  .z-radio--checked & {
    .z-radio__indicator {
      border-color: tokens.$color-accent;
      box-shadow: 0 2px 4px rgba(tokens.$color-accent, 0.3);
    }

    .z-radio__dot {
      background: linear-gradient(
        135deg,
        tokens.$color-accent 0%,
        tokens.$color-accent-hover 100%
      );
    }
  }
}

/* Accent variant */
.z-radio--accent {
  .z-radio--checked & {
    .z-radio__indicator {
      border-color: tokens.$color-accent;
      box-shadow: 0 2px 4px rgba(tokens.$color-accent, 0.3);
    }

    .z-radio__dot {
      background: tokens.$color-accent;
    }
  }
}

/* Enhanced focus accessibility */
.z-radio__input:focus-visible + .z-radio__label .z-radio__indicator {
  outline: 3px solid var(--zeno-color-focus-ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(var(--zeno-color-accent-solid), 0.15);
  border-color: var(--zeno-color-focus-ring);
}

/* State modifiers */

/* Checked state with enhanced visual feedback and improved contrast */
.z-radio--checked {
  .z-radio__indicator {
    transform: scale(1.02);
    /* Enhanced contrast for checked state */
    background: var(--zeno-color-accent-solid);
    border-color: var(--zeno-color-accent-solid);
    border-width: 3px; /* Thicker border for better visibility */
    box-shadow:
      0 0 0 2px var(--zeno-color-background-surface),
      0 0 0 4px var(--zeno-color-accent-solid),
      0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .z-radio__dot {
    background: var(--zeno-color-text-inverse);
    /* Ensure dot is always visible with high contrast */
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }

  /* Enhanced hover state for checked radios */
  .z-radio__label:hover .z-radio__indicator {
    transform: scale(1.05);
    box-shadow:
      0 0 0 2px var(--zeno-color-background-surface),
      0 0 0 4px var(--zeno-color-accent-solid),
      0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

/* Enhanced unchecked state for better baseline contrast */
.z-radio:not(.z-radio--checked) {
  .z-radio__indicator {
    border-width: 2px;
    border-color: var(
      --zeno-color-border-strong
    ); /* Use stronger border instead of muted */
    background: var(--zeno-color-background-surface);

    &:hover {
      border-color: var(--zeno-color-accent-solid);
      background: color-mix(
        in srgb,
        var(--zeno-color-accent-solid) 5%,
        var(--zeno-color-background-surface)
      );
    }
  }
}

/* Loading state */
.z-radio--loading {
  .z-radio__label {
    cursor: progress;
  }

  .z-radio__indicator {
    background: var(--zeno-color-background-subtle);
    border-color: var(--zeno-color-border-subtle);
  }
}

/* Disabled state - enhanced accessibility */
.z-radio--disabled {
  .z-radio__label {
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background-color: transparent;
    }
  }

  .z-radio__indicator {
    background-color: var(--zeno-color-background-subtle);
    border-color: var(--zeno-color-border-subtle);

    &:hover {
      transform: none;
      border-color: var(--zeno-color-border-subtle);
    }
  }

  /* Disabled checked state needs special handling for contrast */
  &.z-radio--checked .z-radio__indicator {
    background: var(--zeno-color-background-disabled);
    border-color: var(--zeno-color-border-subtle);
    box-shadow: none;
  }

  &.z-radio--checked .z-radio__dot {
    background: var(--zeno-color-text-disabled);
  }
}

/* Invalid state - error styling */
.z-radio--invalid {
  .z-radio__indicator {
    border-color: var(--zeno-color-danger-solid);
    box-shadow: 0 0 0 1px rgba(var(--zeno-color-danger-solid), 0.2);
  }

  .z-radio__input:focus-visible + .z-radio__label .z-radio__indicator {
    border-color: var(--zeno-color-danger-solid);
    box-shadow: 0 0 0 6px rgba(var(--zeno-color-danger-solid), 0.15);
  }

  /* Invalid checked state */
  &.z-radio--checked .z-radio__indicator {
    background: var(--zeno-color-danger-solid);
    border-color: var(--zeno-color-danger-solid);
    box-shadow:
      0 0 0 2px var(--zeno-color-background-surface),
      0 0 0 4px var(--zeno-color-danger-solid),
      0 2px 4px rgba(var(--zeno-color-danger-solid), 0.3);
  }
}

/* Content structure */
.z-radio__content {
  display: flex;
  flex-direction: column;
  gap: tokens.$spacing-1; /* 4px */
  margin-top: 1px; /* Align with radio center */
}

.z-radio__text {
  color: inherit;
  line-height: tokens.$typography-line-height-normal;
}

.z-radio__helper {
  color: var(--zeno-color-text-secondary);
  line-height: tokens.$typography-line-height-relaxed;
  margin-top: tokens.$spacing-1; /* 4px */
}

.z-radio__error {
  color: var(--zeno-color-danger-text);
  line-height: tokens.$typography-line-height-relaxed;
  margin-top: tokens.$spacing-1; /* 4px */
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
}

/* Loading spinner */
.z-radio__spinner {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.z-radio__spinner-svg {
  width: 12px;
  height: 12px;
  stroke: var(--zeno-color-text-secondary);
}

/* Radio dot with enhanced animation */
.z-radio__dot {
  border-radius: 50%;
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Transition animations for enhanced UX */
.z-radio-dot-enter-active,
.z-radio-dot-leave-active {
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

.z-radio-dot-enter-from,
.z-radio-dot-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-radio {
    transition: none;
  }

  .z-radio__label,
  .z-radio__indicator,
  .z-radio__dot {
    transition: none;
  }

  .z-radio__indicator:hover {
    transform: none;
  }

  .z-radio-dot-enter-active,
  .z-radio-dot-leave-active {
    transition: opacity 0.1s ease;
  }

  .z-radio__spinner-svg animate {
    animation-duration: 2s;
  }
}

/* High contrast mode support */
@media (forced-colors: active) {
  .z-radio__indicator {
    border: 2px solid ButtonText;
    background: ButtonFace;
  }

  .z-radio--checked .z-radio__indicator {
    border-color: Highlight;
  }

  .z-radio__dot {
    background: Highlight;
  }

  .z-radio--disabled .z-radio__indicator {
    border-color: GrayText;
    background: ButtonFace;
  }
}
</style>

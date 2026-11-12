<template>
  <div :class="switchClasses" :data-testid="testId">
    <!-- Hidden native checkbox input with switch role -->
    <input
      :id="inputId"
      ref="inputRef"
      type="checkbox"
      role="switch"
      :checked="isChecked"
      :disabled="disabled"
      :required="required"
      :aria-describedby="ariaDescribedby"
      :aria-checked="isChecked"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-label="ariaLabel"
      :name="name"
      class="z-switch__input"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />

    <!-- Visual switch with label -->
    <label :for="inputId" class="z-switch__label">
      <!-- Switch track and knob -->
      <div class="z-switch__track" :aria-hidden="true">
        <!-- Loading spinner -->
        <div v-if="loading" class="z-switch__spinner">
          <svg class="z-switch__spinner-svg" viewBox="0 0 16 16">
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

        <!-- Switch knob with enhanced animations -->
        <div v-if="!loading" class="z-switch__knob">
          <!-- Optional check icon when checked -->
          <Transition name="z-switch-icon" mode="out-in">
            <svg
              v-if="isChecked && showIcon"
              class="z-switch__icon"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M10 3L4.5 8.5L2 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </Transition>
        </div>

        <!-- Track labels (optional) -->
        <span v-if="trackLabels" class="z-switch__track-labels">
          <span class="z-switch__track-label z-switch__track-label--off">
            {{ trackLabels.off || 'OFF' }}
          </span>
          <span class="z-switch__track-label z-switch__track-label--on">
            {{ trackLabels.on || 'ON' }}
          </span>
        </span>
      </div>

      <!-- Label content -->
      <div v-if="$slots.default || label" class="z-switch__content">
        <span class="z-switch__text">
          <slot>{{ label }}</slot>
        </span>

        <!-- Helper text -->
        <span v-if="helperText && !invalid" class="z-switch__helper">
          {{ helperText }}
        </span>

        <!-- Error message -->
        <span v-if="invalid && errorMessage" class="z-switch__error">
          {{ errorMessage }}
        </span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type {
  ZSwitchProps,
  SwitchSize,
  SwitchVariant,
  TrackLabels,
} from '../types/forms';
import type { ZSwitchEmits } from '../types/events';

// Re-export types for backward compatibility
export type {
  ZSwitchProps,
  SwitchSize,
  SwitchVariant,
  TrackLabels,
  ZSwitchEmits,
};

const props = withDefaults(defineProps<ZSwitchProps>(), {
  size: 'md',
  variant: 'default',
  disabled: false,
  required: false,
  invalid: false,
  loading: false,
  showIcon: false,
});

const emit = defineEmits<ZSwitchEmits>();

// Template refs
const inputRef = ref<HTMLInputElement>();

// Computed properties
const inputId = computed(
  () => props.id || `z-switch-${Math.random().toString(36).slice(2, 8)}`
);

const isControlled = computed(() => props.modelValue !== undefined);

const isChecked = computed(() => {
  if (isControlled.value) {
    return props.modelValue || false;
  }
  return props.checked || false;
});

const switchClasses = computed(() => [
  'z-switch',
  `z-switch--${props.size}`,
  `z-switch--${props.variant}`,
  {
    'z-switch--checked': isChecked.value,
    'z-switch--disabled': props.disabled,
    'z-switch--invalid': props.invalid,
    'z-switch--loading': props.loading,
    'z-switch--required': props.required,
    'z-switch--with-icon': props.showIcon,
    'z-switch--with-labels': props.trackLabels,
  },
]);

// Event handlers
const handleChange = (event: Event) => {
  if (props.disabled || props.loading) return;

  const target = event.target as HTMLInputElement;
  const newChecked = target.checked;

  if (isControlled.value) {
    emit('update:modelValue', newChecked);
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

  // Space or Enter key should toggle the switch
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    const newChecked = !isChecked.value;

    if (isControlled.value) {
      emit('update:modelValue', newChecked);
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

// Expose methods for programmatic control
defineExpose({
  /** Focus the switch input */
  focus: () => inputRef.value?.focus(),
  /** Blur the switch input */
  blur: () => inputRef.value?.blur(),
  /** Get reference to the input element */
  getInputElement: () => inputRef.value,
});
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Switch Component
 * Principles: Clear on/off states, smooth animations, accessible design
 * Accessibility: WCAG 2.1 Level AA compliance, enhanced focus states
 * Motion: Physics-based toggle animations with spatial continuity
 */

.z-switch {
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
.z-switch__input {
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
.z-switch__label {
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

  &:hover:not(.z-switch--disabled &) {
    background-color: var(--zeno-color-background-subtle);
  }
}

/* Visual switch track with enhanced design and improved contrast */
.z-switch__track {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border: 2px solid var(--zeno-color-border-strong); /* Use stronger border for better contrast */
  border-radius: 100px; /* Pill shape */
  background: var(--zeno-color-background-subtle);
  overflow: hidden;

  /* Physics-based motion choreography */
  transition: all tokens.$motion-duration-lg tokens.$motion-easing-ease-out;
  will-change: background-color, border-color, box-shadow;

  /* Enhanced contrast for unchecked state */
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.05);

  /* Hover enhancement with better contrast */
  &:hover {
    border-color: var(--zeno-color-accent-solid);
    background: color-mix(
      in srgb,
      var(--zeno-color-accent-solid) 8%,
      var(--zeno-color-background-subtle)
    );
  }
}

/* Size variants optimized for readability and touch */
.z-switch--sm {
  .z-switch__track {
    width: 36px;
    height: 20px;
  }

  .z-switch__text {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }

  .z-switch__helper,
  .z-switch__error {
    font-size: tokens.$typography-font-size-xs; /* 12px */
  }

  .z-switch__knob {
    width: 14px;
    height: 14px;
    left: 2px;
  }

  &.z-switch--checked .z-switch__knob {
    transform: translateY(-50%) translateX(18px);
  }
}

.z-switch--md {
  .z-switch__track {
    width: 44px;
    height: 24px;
  }

  .z-switch__text {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }

  .z-switch__helper,
  .z-switch__error {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }

  .z-switch__knob {
    width: 18px;
    height: 18px;
    left: 2px;
  }

  &.z-switch--checked .z-switch__knob {
    transform: translateY(-50%) translateX(22px);
  }
}

.z-switch--lg {
  .z-switch__track {
    width: 52px;
    height: 28px;
  }

  .z-switch__text {
    font-size: tokens.$typography-font-size-lg; /* 18px */
  }

  .z-switch__helper,
  .z-switch__error {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }

  .z-switch__knob {
    width: 22px;
    height: 22px;
    left: 2px;
  }

  &.z-switch--checked .z-switch__knob {
    transform: translateY(-50%) translateX(26px);
  }
}

/* Switch knob with enhanced design and contrast */
.z-switch__knob {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%; /* Perfect circle */
  background: var(--zeno-color-background-surface);
  /* Enhanced shadow for better depth and contrast */
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);

  /* Physics-based motion choreography */
  transition: all tokens.$motion-duration-lg tokens.$motion-easing-ease-out;
  will-change: transform, background-color, box-shadow;

  /* Enhanced micro-interaction feedback */
  &:hover {
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

/* Variant styles with enhanced contrast */

/* Default variant - enhanced neutral styling */
.z-switch--default {
  &.z-switch--checked {
    .z-switch__track {
      background: var(--zeno-color-accent-solid);
      border-color: var(--zeno-color-accent-solid);
      /* Enhanced glow effect for checked state */
      box-shadow:
        0 0 0 2px rgba(var(--zeno-color-accent-solid), 0.2),
        0 2px 4px rgba(var(--zeno-color-accent-solid), 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .z-switch__knob {
      background: var(--zeno-color-text-inverse);
      /* Enhanced contrast for checked knob */
      box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.2),
        0 1px 2px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }
  }
}

/* Primary variant */
.z-switch--primary {
  &.z-switch--checked {
    .z-switch__track {
      background: linear-gradient(
        135deg,
        tokens.$color-accent 0%,
        tokens.$color-accent-hover 100%
      );
      border-color: tokens.$color-accent;
      /* Enhanced glow with brand colors */
      box-shadow:
        0 0 0 2px rgba(tokens.$color-accent, 0.3),
        0 2px 4px rgba(tokens.$color-accent, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .z-switch__knob {
      background: tokens.$color-white;
      /* Enhanced contrast for primary variant */
      box-shadow:
        0 2px 4px rgba(tokens.$color-accent, 0.3),
        0 1px 2px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
    }
  }
}

/* Accent variant */
.z-switch--accent {
  &.z-switch--checked {
    .z-switch__track {
      background: tokens.$color-accent;
      border-color: tokens.$color-accent;
      /* Glow in the accent colour */
      box-shadow:
        0 0 0 2px rgba(tokens.$color-accent, 0.3),
        0 2px 4px rgba(tokens.$color-accent, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .z-switch__knob {
      background: tokens.$color-white;
      color: tokens.$color-accent;
      /* Enhanced contrast for accent variant */
      box-shadow:
        0 2px 4px rgba(tokens.$color-accent, 0.3),
        0 1px 2px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(tokens.$color-accent, 0.2);
    }
  }
}

/* Enhanced focus accessibility with better contrast */
.z-switch__input:focus-visible + .z-switch__label .z-switch__track {
  outline: 3px solid var(--zeno-color-focus-ring);
  outline-offset: 2px;
  /* Enhanced focus ring with better visibility */
  box-shadow:
    0 0 0 6px rgba(var(--zeno-color-accent-solid), 0.2),
    0 0 0 2px var(--zeno-color-background-surface),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
  border-color: var(--zeno-color-focus-ring);
}

/* State modifiers with enhanced contrast */

/* Checked state with enhanced visual feedback */
.z-switch--checked {
  .z-switch__knob {
    background: var(--zeno-color-background-surface);
    /* Enhanced shadow for checked state */
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.2),
      0 1px 3px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

/* Loading state with better contrast */
.z-switch--loading {
  .z-switch__label {
    cursor: progress;
  }

  .z-switch__track {
    background: var(--zeno-color-background-subtle);
    border-color: var(--zeno-color-border-subtle);
    /* Reduced contrast for loading state */
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .z-switch__knob {
    background: var(--zeno-color-background-subtle);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
}

/* Disabled state - enhanced accessibility with proper contrast */
.z-switch--disabled {
  .z-switch__label {
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background-color: transparent;
    }
  }

  .z-switch__track {
    background-color: var(--zeno-color-background-disabled);
    border-color: var(--zeno-color-border-subtle);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: var(--zeno-color-border-subtle);
      background: var(--zeno-color-background-disabled);
    }
  }

  .z-switch__knob {
    background-color: var(--zeno-color-background-subtle);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  /* Disabled checked state needs proper contrast */
  &.z-switch--checked .z-switch__track {
    background: var(--zeno-color-background-disabled);
    border-color: var(--zeno-color-border-subtle);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  }
}

/* Invalid state - enhanced error styling */
.z-switch--invalid {
  .z-switch__track {
    border-color: var(--zeno-color-danger-solid);
    box-shadow:
      0 0 0 1px rgba(var(--zeno-color-danger-solid), 0.2),
      inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .z-switch__input:focus-visible + .z-switch__label .z-switch__track {
    border-color: var(--zeno-color-danger-solid);
    box-shadow:
      0 0 0 6px rgba(var(--zeno-color-danger-solid), 0.15),
      0 0 0 2px var(--zeno-color-background-surface),
      inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Invalid checked state */
  &.z-switch--checked .z-switch__track {
    background: var(--zeno-color-danger-solid);
    border-color: var(--zeno-color-danger-solid);
    box-shadow:
      0 0 0 2px rgba(var(--zeno-color-danger-solid), 0.2),
      0 2px 4px rgba(var(--zeno-color-danger-solid), 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
}

/* Content structure */
.z-switch__content {
  display: flex;
  flex-direction: column;
  gap: tokens.$spacing-1; /* 4px */
  margin-top: 1px; /* Align with switch center */
}

.z-switch__text {
  color: inherit;
  line-height: tokens.$typography-line-height-normal;
}

.z-switch__helper {
  color: var(--zeno-color-text-secondary);
  line-height: tokens.$typography-line-height-relaxed;
  margin-top: tokens.$spacing-1; /* 4px */
}

.z-switch__error {
  color: var(--zeno-color-danger-text);
  line-height: tokens.$typography-line-height-relaxed;
  margin-top: tokens.$spacing-1; /* 4px */
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
}

/* Loading spinner */
.z-switch__spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.z-switch__spinner-svg {
  width: 12px;
  height: 12px;
  stroke: var(--zeno-color-text-secondary);
}

/* Switch icon in knob */
.z-switch__icon {
  width: 8px;
  height: 8px;
  stroke: var(--zeno-color-text-inverse);
  stroke-width: 2;
}

/* Track labels styling */
.z-switch__track-labels {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 tokens.$spacing-2;
  font-size: tokens.$typography-font-size-xs; /* 10px */
  font-weight: tokens.$typography-font-weight-bold; /* 700 */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  pointer-events: none;
}

.z-switch__track-label {
  color: var(--zeno-color-text-secondary);
  transition: color tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  opacity: 0.7;

  &--off {
    margin-right: auto;
  }

  &--on {
    margin-left: auto;
  }
}

.z-switch--checked {
  .z-switch__track-label--on {
    color: var(--zeno-color-text-inverse);
    opacity: 1;
  }
}

.z-switch--with-labels {
  .z-switch__track {
    padding: 0 tokens.$spacing-1;
  }
}

/* Transition animations for enhanced UX */
.z-switch-icon-enter-active,
.z-switch-icon-leave-active {
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

.z-switch-icon-enter-from,
.z-switch-icon-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(45deg);
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-switch {
    transition: none;
  }

  .z-switch__label,
  .z-switch__track,
  .z-switch__knob,
  .z-switch__track-label {
    transition: none;
  }

  .z-switch__knob:hover {
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.1),
      0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .z-switch-icon-enter-active,
  .z-switch-icon-leave-active {
    transition: opacity 0.1s ease;
  }

  .z-switch__spinner-svg animate {
    animation-duration: 2s;
  }
}

/* High contrast mode support */
@media (forced-colors: active) {
  .z-switch__track {
    border: 2px solid ButtonText;
    background: ButtonFace;
  }

  .z-switch--checked .z-switch__track {
    border-color: Highlight;
    background: Highlight;
  }

  .z-switch__knob {
    background: ButtonFace;
    border: 1px solid ButtonText;
  }

  .z-switch--checked .z-switch__knob {
    background: HighlightText;
  }

  .z-switch--disabled .z-switch__track {
    border-color: GrayText;
    background: ButtonFace;
  }

  .z-switch--disabled .z-switch__knob {
    background: ButtonFace;
    border-color: GrayText;
  }

  .z-switch__track-label {
    color: ButtonText;
  }

  .z-switch--checked .z-switch__track-label--on {
    color: HighlightText;
  }
}
</style>

<template>
  <div
    ref="groupRef"
    :class="radioGroupClasses"
    role="radiogroup"
    :aria-labelledby="labelId"
    :aria-describedby="computedAriaDescribedby"
    :aria-invalid="invalid ? 'true' : undefined"
    :aria-required="required ? 'true' : undefined"
    :data-testid="testId"
    @keydown="handleKeydown"
  >
    <!-- Group label -->
    <div
      v-if="label || $slots.label"
      :id="labelId"
      class="z-radio-group__label"
    >
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="z-radio-group__required" aria-hidden="true"
        >*</span
      >
    </div>

    <!-- Helper text -->
    <div
      v-if="helperText && !invalid"
      :id="helperId"
      class="z-radio-group__helper"
    >
      {{ helperText }}
    </div>

    <!-- Options container -->
    <div class="z-radio-group__options">
      <slot />
    </div>

    <!-- Error message -->
    <div
      v-if="invalid && errorMessage"
      :id="errorId"
      class="z-radio-group__error"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, provide, onMounted, nextTick, watch } from 'vue';
import type {
  ZRadioGroupProps,
  RadioGroupOrientation,
  RadioGroupSize,
  RadioGroupVariant,
} from '../types/forms';
import type { ZRadioGroupEmits } from '../types/events';

// Re-export types for backward compatibility
export type {
  ZRadioGroupProps,
  RadioGroupOrientation,
  RadioGroupSize,
  RadioGroupVariant,
  ZRadioGroupEmits,
};

const props = withDefaults(defineProps<ZRadioGroupProps>(), {
  orientation: 'vertical',
  size: 'md',
  variant: 'default',
  disabled: false,
  required: false,
  invalid: false,
});

const emit = defineEmits<ZRadioGroupEmits>();

// Template refs
const groupRef = ref<HTMLElement>();

// Computed properties
const labelId = computed(
  () => `z-radio-group-label-${Math.random().toString(36).slice(2, 8)}`
);

const errorId = computed(
  () => `z-radio-group-error-${Math.random().toString(36).slice(2, 8)}`
);

const helperId = computed(
  () => `z-radio-group-helper-${Math.random().toString(36).slice(2, 8)}`
);

const groupName = computed(
  () => props.name || `z-radio-group-${Math.random().toString(36).slice(2, 8)}`
);

const computedAriaDescribedby = computed(() => {
  const ids = [];

  if (props.ariaDescribedby) {
    ids.push(props.ariaDescribedby);
  }

  if (props.helperText && !props.invalid) {
    ids.push(helperId.value);
  }

  if (props.invalid && props.errorMessage) {
    ids.push(errorId.value);
  }

  return ids.length > 0 ? ids.join(' ') : undefined;
});

const radioGroupClasses = computed(() => [
  'z-radio-group',
  `z-radio-group--${props.orientation}`,
  `z-radio-group--${props.size}`,
  `z-radio-group--${props.variant}`,
  {
    'z-radio-group--disabled': props.disabled,
    'z-radio-group--invalid': props.invalid,
    'z-radio-group--required': props.required,
  },
]);

// Provide context to child radio components
provide('radioGroup', {
  modelValue: computed(() => props.modelValue),
  name: groupName,
  size: computed(() => props.size),
  variant: computed(() => props.variant),
  disabled: computed(() => props.disabled),
  required: computed(() => props.required),
  invalid: computed(() => props.invalid),
  updateValue: (value: string | number | boolean) => {
    emit('update:modelValue', value);
    emit('change', value);
  },
});

// Utility functions
const getRadioInputs = (): HTMLInputElement[] => {
  if (!groupRef.value) return [];
  return Array.from(
    groupRef.value.querySelectorAll('input[type="radio"]:not([disabled])')
  );
};

const updateTabIndices = () => {
  const inputs = getRadioInputs();
  const checkedInput = inputs.find(input => input.checked);

  inputs.forEach((input, index) => {
    if (checkedInput) {
      input.tabIndex = input === checkedInput ? 0 : -1;
    } else {
      input.tabIndex = index === 0 ? 0 : -1;
    }
  });
};

// Event handlers
const handleKeydown = (event: KeyboardEvent) => {
  const inputs = getRadioInputs();
  if (inputs.length === 0 || props.disabled) return;

  const currentIndex = inputs.findIndex(
    input => input === document.activeElement
  );

  if (currentIndex === -1) return;

  let nextIndex: number;

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      event.preventDefault();
      nextIndex = (currentIndex + 1) % inputs.length;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      event.preventDefault();
      nextIndex = currentIndex === 0 ? inputs.length - 1 : currentIndex - 1;
      break;
    case 'Home':
      event.preventDefault();
      nextIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      nextIndex = inputs.length - 1;
      break;
    default:
      return;
  }

  if (nextIndex !== currentIndex && inputs[nextIndex]) {
    // Focus the next radio
    inputs[nextIndex].focus();

    // Select the radio
    inputs[nextIndex].checked = true;

    // Update the model value
    const radioValue = inputs[nextIndex].value;
    emit('update:modelValue', radioValue);
    emit('change', radioValue);

    // Update tab indices
    updateTabIndices();
  }
};

const handleFocus = (event: FocusEvent) => {
  if (!props.disabled) {
    emit('focus', event);
  }
};

const handleBlur = (event: FocusEvent) => {
  if (!props.disabled) {
    emit('blur', event);
  }
};

// Watch for modelValue changes to update tab indices
watch(
  () => props.modelValue,
  () => {
    nextTick(() => {
      updateTabIndices();
    });
  }
);

// Setup on mount
onMounted(() => {
  nextTick(() => {
    updateTabIndices();

    // Add focus and blur listeners to radio inputs
    const inputs = getRadioInputs();
    inputs.forEach(input => {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    });
  });
});

// Expose methods for programmatic control
defineExpose({
  /** Focus the first radio or checked radio */
  focus: () => {
    const inputs = getRadioInputs();
    const checkedInput = inputs.find(input => input.checked);
    const firstInput = inputs[0];

    (checkedInput || firstInput)?.focus();
  },

  /** Get all radio input elements */
  getRadioInputs,

  /** Update tab indices manually */
  updateTabIndices,
});
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Radio Group Component
 * Principles: Clear hierarchy, intuitive grouping, accessible navigation
 * Accessibility: WCAG 2.1 Level AA compliance, keyboard navigation
 * Motion: Subtle feedback animations for state changes
 */

.z-radio-group {
  /* Base foundation */
  display: flex;
  flex-direction: column;
  gap: tokens.$spacing-3; /* 12px */
  font-family: tokens.$typography-font-family-primary;

  /* Physics-based transitions */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

/* Orientation variants */
.z-radio-group--horizontal {
  flex-direction: column;

  .z-radio-group__options {
    display: flex;
    flex-direction: row;
    gap: tokens.$spacing-6; /* 24px - more space for horizontal layout */
    align-items: flex-start;
    flex-wrap: wrap;
  }
}

.z-radio-group--vertical {
  .z-radio-group__options {
    display: flex;
    flex-direction: column;
    gap: tokens.$spacing-3; /* 12px */
  }
}

/* Group label with enhanced typography */
.z-radio-group__label {
  font-size: tokens.$typography-font-size-md; /* 16px */
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
  line-height: tokens.$typography-line-height-normal;
  color: var(--zeno-color-text-primary);
  margin-bottom: tokens.$spacing-2; /* 8px */

  /* Enhanced readability */
  letter-spacing: -0.01em;
}

/* Required indicator */
.z-radio-group__required {
  color: var(--zeno-color-danger-text);
  font-weight: tokens.$typography-font-weight-bold; /* 700 */
  margin-left: tokens.$spacing-1; /* 4px */
}

/* Helper text styling */
.z-radio-group__helper {
  font-size: tokens.$typography-font-size-sm; /* 14px */
  line-height: tokens.$typography-line-height-relaxed;
  color: var(--zeno-color-text-secondary);
  margin-bottom: tokens.$spacing-2; /* 8px */
}

/* Error message styling */
.z-radio-group__error {
  font-size: tokens.$typography-font-size-sm; /* 14px */
  line-height: tokens.$typography-line-height-relaxed;
  color: var(--zeno-color-danger-text);
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
  margin-top: tokens.$spacing-2; /* 8px */

  /* Enhanced visibility for errors */
  animation: shake 0.3s ease-in-out;
}

/* Size variants */
.z-radio-group--sm {
  gap: tokens.$spacing-2; /* 8px */

  .z-radio-group__label {
    font-size: tokens.$typography-font-size-sm; /* 14px */
    margin-bottom: tokens.$spacing-1; /* 4px */
  }

  .z-radio-group__helper,
  .z-radio-group__error {
    font-size: tokens.$typography-font-size-xs; /* 12px */
  }

  .z-radio-group--vertical & .z-radio-group__options {
    gap: tokens.$spacing-2; /* 8px */
  }

  .z-radio-group--horizontal & .z-radio-group__options {
    gap: tokens.$spacing-4; /* 16px */
  }
}

.z-radio-group--md {
  gap: tokens.$spacing-3; /* 12px */

  .z-radio-group__label {
    font-size: tokens.$typography-font-size-md; /* 16px */
    margin-bottom: tokens.$spacing-2; /* 8px */
  }

  .z-radio-group__helper,
  .z-radio-group__error {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }

  .z-radio-group--vertical & .z-radio-group__options {
    gap: tokens.$spacing-3; /* 12px */
  }

  .z-radio-group--horizontal & .z-radio-group__options {
    gap: tokens.$spacing-6; /* 24px */
  }
}

.z-radio-group--lg {
  gap: tokens.$spacing-4; /* 16px */

  .z-radio-group__label {
    font-size: tokens.$typography-font-size-lg; /* 18px */
    margin-bottom: tokens.$spacing-3; /* 12px */
  }

  .z-radio-group__helper,
  .z-radio-group__error {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }

  .z-radio-group--vertical & .z-radio-group__options {
    gap: tokens.$spacing-4; /* 16px */
  }

  .z-radio-group--horizontal & .z-radio-group__options {
    gap: tokens.$spacing-8; /* 32px */
  }
}

/* Variant styles following design system hierarchy */
.z-radio-group--default {
  /* Default styling already applied */
}

.z-radio-group--primary {
  .z-radio-group__label {
    color: var(--zeno-color-text-primary);
  }
}

.z-radio-group--accent {
  .z-radio-group__label {
    color: var(--zeno-color-text-primary);
  }
}

/* State modifiers */

/* Disabled state - enhanced accessibility */
.z-radio-group--disabled {
  opacity: 0.6;
  pointer-events: none;

  .z-radio-group__label {
    color: var(--zeno-color-text-tertiary);
  }

  .z-radio-group__helper {
    color: var(--zeno-color-text-tertiary);
  }
}

/* Invalid state */
.z-radio-group--invalid {
  .z-radio-group__label {
    color: var(--zeno-color-text-primary);
  }

  /* Add subtle border for invalid groups */
  &::before {
    content: '';
    position: absolute;
    left: -#{tokens.$spacing-2};
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--zeno-color-danger-solid);
    border-radius: tokens.$radius-sm;
    opacity: 0.6;
  }

  position: relative;
  padding-left: tokens.$spacing-3; /* 12px */
}

/* Required state indicator */
.z-radio-group--required {
  .z-radio-group__label {
    /* Label styling remains the same, required indicator is separate */
  }
}

/* Shake animation for error states */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .z-radio-group--horizontal {
    .z-radio-group__options {
      flex-direction: column;
      gap: tokens.$spacing-3; /* 12px - stack vertically on mobile */
      align-items: flex-start;
    }
  }
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-radio-group {
    transition: none;
  }

  .z-radio-group__error {
    animation: none;
  }
}

/* High contrast mode support */
@media (forced-colors: active) {
  .z-radio-group__label {
    color: ButtonText;
  }

  .z-radio-group__helper {
    color: ButtonText;
  }

  .z-radio-group__error {
    color: ButtonText;
    font-weight: tokens.$typography-font-weight-bold;
  }

  .z-radio-group--invalid::before {
    background: ButtonText;
  }

  .z-radio-group--disabled {
    .z-radio-group__label,
    .z-radio-group__helper {
      color: GrayText;
    }
  }
}
</style>

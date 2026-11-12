<template>
  <div class="z-base-field" :class="fieldClasses">
    <!-- Label -->
    <label v-if="label" :for="fieldId" class="z-base-field__label">
      {{ label }}
      <span
        v-if="required"
        class="z-base-field__required"
        aria-label="required"
      >
        *
      </span>
    </label>

    <!-- Field Content Slot -->
    <div class="z-base-field__input-wrapper">
      <slot
        :field-id="fieldId"
        :error-id="errorId"
        :help-id="helpId"
        :has-error="hasError"
        :described-by="describedBy"
      />
    </div>

    <!-- Help Text -->
    <div v-if="helpText && !hasError" :id="helpId" class="z-base-field__help">
      {{ helpText }}
    </div>

    <!-- Error Message -->
    <div
      v-if="hasError && error"
      :id="errorId"
      class="z-base-field__error"
      role="alert"
      aria-live="polite"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import type { ZComponentBase } from '../../types/base';

export interface BaseFieldProps extends ZComponentBase {
  /** Field label */
  label?: string;
  /** Help text */
  helpText?: string;
  /** Error message */
  error?: string;
  /** Required field indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom field ID */
  id?: string;
}

const props = withDefaults(defineProps<BaseFieldProps>(), {
  label: '',
  helpText: '',
  error: '',
  required: false,
  disabled: false,
  id: '',
});

// Generate unique IDs
const generatedId = useId();
const fieldId = computed(() => props.id || `field-${generatedId}`);
const errorId = computed(() => `${fieldId.value}-error`);
const helpId = computed(() => `${fieldId.value}-help`);

// Computed properties
const hasError = computed(() => Boolean(props.error));

const describedBy = computed(() => {
  const ids = [];
  if (props.helpText && !hasError.value) ids.push(helpId.value);
  if (hasError.value) ids.push(errorId.value);
  return ids.length > 0 ? ids.join(' ') : undefined;
});

const fieldClasses = computed(() => ({
  'z-base-field--error': hasError.value,
  'z-base-field--disabled': props.disabled,
  'z-base-field--required': props.required,
}));
</script>

<style lang="scss" scoped>
.z-base-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;

  &.z-base-field--disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

.z-base-field__label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--zeno-color-accent-solid-hover);
  margin-bottom: 2px;

  [data-theme='dark'] & {
    color: var(--zeno-color-accent-on-solid);
  }
}

.z-base-field__required {
  color: var(--zeno-color-accent-text);
  font-weight: 600;
}

.z-base-field__input-wrapper {
  position: relative;
}

.z-base-field__help {
  font-size: 12px;
  color: var(--zeno-color-accent-text);
  margin-top: -2px;

  [data-theme='dark'] & {
    color: var(--zeno-color-accent-text);
  }
}

.z-base-field__error {
  font-size: 12px;
  color: var(--zeno-color-danger-text);
  font-weight: 500;
  margin-top: -2px;

  [data-theme='dark'] & {
    color: var(--zeno-color-danger-text);
  }
}

// High contrast support
@media (prefers-contrast: high) {
  .z-base-field__error {
    color: var(--zeno-color-danger-text);
    font-weight: 600;

    [data-theme='dark'] & {
      color: var(--zeno-color-danger-text);
    }
  }
}
</style>

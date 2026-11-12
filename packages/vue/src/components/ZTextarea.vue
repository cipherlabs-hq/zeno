<template>
  <div :class="textareaClasses">
    <label v-if="label" :for="inputId" class="z-textarea__label">
      {{ label }}
      <span v-if="required" class="z-textarea__required" aria-label="required"
        >*</span
      >
    </label>
    <div class="z-textarea__wrapper">
      <textarea
        :id="inputId"
        ref="textareaRef"
        :value="currentValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :maxlength="maxLength"
        :aria-describedby="ariaDescribedby"
        :aria-invalid="error ? 'true' : undefined"
        :rows="currentRows"
        class="z-textarea__input"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      <div
        v-if="charCount && maxLength"
        class="z-textarea__char-count"
        :class="{
          'z-textarea__char-count--warning': charCountPercentage > 80,
          'z-textarea__char-count--error': charCountPercentage >= 100,
        }"
      >
        {{ currentValue.length }} / {{ maxLength }}
      </div>
    </div>
    <div v-if="error || hint" class="z-textarea__help">
      <span v-if="error" class="z-textarea__error">{{ error }}</span>
      <span v-else-if="hint" class="z-textarea__hint">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, watch } from 'vue';
import type { ZTextareaProps, TextareaSize } from '../types/forms';
import type { ZTextareaEmits } from '../types/events';

// Re-export types for backward compatibility
export type { ZTextareaProps, TextareaSize, ZTextareaEmits };

const props = withDefaults(defineProps<ZTextareaProps>(), {
  modelValue: '',
  value: '',
  size: 'md',
  disabled: false,
  required: false,
  readonly: false,
  charCount: false,
  autoResize: true,
  minRows: 3,
  maxRows: 10,
});

const emit = defineEmits<ZTextareaEmits>();

const textareaRef = ref<HTMLTextAreaElement>();
const inputId = computed(
  () => props.id || `textarea-${Math.random().toString(36).slice(2)}`
);
const currentRows = ref(props.minRows);

const isControlled = computed(() => props.modelValue !== undefined);
const currentValue = computed(() =>
  isControlled.value ? props.modelValue : props.value
);

const charCountPercentage = computed(() => {
  if (!props.maxLength) return 0;
  return (currentValue.value.length / props.maxLength) * 100;
});

const textareaClasses = computed(() => [
  'z-textarea',
  `z-textarea--${props.size}`,
  {
    'z-textarea--disabled': props.disabled,
    'z-textarea--readonly': props.readonly,
    'z-textarea--error': props.error,
    'z-textarea--auto-resize': props.autoResize,
  },
]);

const calculateRows = () => {
  if (!props.autoResize || !textareaRef.value) return;

  const textarea = textareaRef.value;

  // Reset height to calculate scroll height properly
  textarea.style.height = 'auto';

  // Calculate number of lines based on content
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
  const padding =
    parseInt(getComputedStyle(textarea).paddingTop, 10) +
    parseInt(getComputedStyle(textarea).paddingBottom, 10);

  const contentHeight = textarea.scrollHeight - padding;
  const lines = Math.ceil(contentHeight / lineHeight);

  // Constrain between minRows and maxRows
  const newRows = Math.max(props.minRows, Math.min(props.maxRows, lines));
  currentRows.value = newRows;

  // Set the height explicitly
  textarea.style.height = `${newRows * lineHeight + padding}px`;
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  const newValue = target.value;

  if (isControlled.value) {
    emit('update:modelValue', newValue);
  }

  emit('input', event, newValue);

  // Auto-resize after input
  if (props.autoResize) {
    nextTick(() => {
      calculateRows();
    });
  }
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('change', event, target.value);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event);

  // Handle common keyboard shortcuts
  if (event.key === 'Tab' && !event.shiftKey && !props.readonly) {
    // Allow default tab behavior
    return;
  }

  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    // Submit on Ctrl/Cmd + Enter
    const form = textareaRef.value?.closest('form');
    if (form) {
      event.preventDefault();
      form.requestSubmit();
    }
  }
};

// Watch for value changes to recalculate size
watch(
  () => currentValue.value,
  () => {
    if (props.autoResize) {
      nextTick(() => {
        calculateRows();
      });
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.autoResize) {
    calculateRows();
  }
});

// Expose methods for programmatic control
defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
  select: () => textareaRef.value?.select(),
  setSelectionRange: (start: number, end: number) =>
    textareaRef.value?.setSelectionRange(start, end),
});
</script>

<style scoped>
.z-textarea {
  display: flex;
  flex-direction: column;
  gap: var(--zeno-spacing-1);
}

.z-textarea__label {
  font-size: 0.875rem;
  font-weight: var(--zeno-font-weight-medium);
  color: var(--zeno-color-text-primary);
}

.z-textarea--sm .z-textarea__label {
  font-size: 0.75rem;
}

.z-textarea--lg .z-textarea__label {
  font-size: 1rem;
}

.z-textarea__required {
  color: var(--zeno-color-danger-text);
  margin-left: var(--zeno-spacing-1);
}

.z-textarea__wrapper {
  position: relative;
}

.z-textarea__input {
  width: 100%;
  border: 2px solid var(--zeno-color-border-default);
  border-radius: var(--zeno-radius-md);
  background: var(--zeno-color-background-surface);
  color: var(--zeno-color-text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  transition: all var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-textarea--sm .z-textarea__input {
  padding: var(--zeno-spacing-2);
  font-size: 0.75rem;
}

.z-textarea--md .z-textarea__input {
  padding: var(--zeno-spacing-3);
  font-size: 0.875rem;
}

.z-textarea--lg .z-textarea__input {
  padding: var(--zeno-spacing-4);
  font-size: 1rem;
}

.z-textarea__input::placeholder {
  color: var(--zeno-color-text-placeholder);
}

.z-textarea__input:focus {
  outline: none;
  border-color: var(--zeno-color-focus-ring);
  box-shadow: 0 0 0 3px var(--zeno-color-accent-subtle);
}

.z-textarea--disabled .z-textarea__input {
  background: var(--zeno-color-background-disabled);
  color: var(--zeno-color-text-disabled);
  cursor: not-allowed;
}

.z-textarea--readonly .z-textarea__input {
  background: var(--zeno-color-background-subtle);
  cursor: default;
}

.z-textarea--error .z-textarea__input {
  border-color: var(--zeno-color-danger-solid);
}

.z-textarea--error .z-textarea__input:focus {
  border-color: var(--zeno-color-danger-solid);
  box-shadow: 0 0 0 3px var(--zeno-color-danger-subtle);
}

.z-textarea--auto-resize .z-textarea__input {
  overflow-y: hidden;
}

.z-textarea__char-count {
  position: absolute;
  bottom: var(--zeno-spacing-2);
  right: var(--zeno-spacing-2);
  font-size: 0.75rem;
  color: var(--zeno-color-text-secondary);
  background: var(--zeno-color-background-surface);
  padding: var(--zeno-spacing-1);
  border-radius: var(--zeno-radius-sm);
  pointer-events: none;
}

.z-textarea__char-count--warning {
  color: var(--zeno-color-warning-text);
}

.z-textarea__char-count--error {
  color: var(--zeno-color-danger-text);
}

.z-textarea__help {
  font-size: 0.75rem;
  line-height: 1.4;
}

.z-textarea__error {
  color: var(--zeno-color-danger-text);
}

.z-textarea__hint {
  color: var(--zeno-color-text-secondary);
}

/* Scrollbar styling for when content overflows */
.z-textarea__input::-webkit-scrollbar {
  width: 8px;
}

.z-textarea__input::-webkit-scrollbar-track {
  background: var(--zeno-color-background-subtle);
  border-radius: 4px;
}

.z-textarea__input::-webkit-scrollbar-thumb {
  background: var(--zeno-color-border-default);
  border-radius: 4px;
}

.z-textarea__input::-webkit-scrollbar-thumb:hover {
  background: var(--zeno-color-text-secondary);
}
</style>

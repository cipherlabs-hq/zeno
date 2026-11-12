<template>
  <div
    :class="chipClasses"
    :tabindex="removable ? 0 : undefined"
    role="button"
    :aria-label="removable ? `Remove ${displayLabel}` : undefined"
    @keydown="handleKeydown"
  >
    <span class="z-chip__label">
      <slot>{{ label }}</slot>
    </span>
    <button
      v-if="removable"
      class="z-chip__remove"
      :aria-label="`Remove ${displayLabel}`"
      type="button"
      @click="handleRemove"
      @keydown.stop
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        />
      </svg>
    </button>
  </div>
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    {{ announceText }}
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import type { ZChipProps } from '../types/feedback';
import type { ZChipEmits } from '../types/events';

// Re-export types for backward compatibility
export type { ZChipProps, ZChipEmits };

const props = withDefaults(defineProps<ZChipProps>(), {
  removable: false,
  disabled: false,
});

const emit = defineEmits<ZChipEmits>();

// Get slots
const slots = useSlots();

const announceText = ref('');

// Get display label for accessibility
const displayLabel = computed(() => {
  if (props.label) return props.label;
  // For slot content, we'll use a generic label
  return slots.default ? 'item' : '';
});

const chipClasses = computed(() => [
  'z-chip',
  {
    'z-chip--removable': props.removable,
    'z-chip--disabled': props.disabled,
  },
]);

const handleRemove = () => {
  if (props.disabled) return;
  announceText.value = `${displayLabel.value} removed`;
  emit('remove');

  // Clear announcement after screen reader reads it
  setTimeout(() => {
    announceText.value = '';
  }, 1000);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.removable || props.disabled) return;

  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    handleRemove();
  }
};
</script>

<style scoped>
.z-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--zeno-spacing-2);
  padding: var(--zeno-spacing-1) var(--zeno-spacing-3);
  background: var(--zeno-color-background-subtle);
  color: var(--zeno-color-text-primary);
  border-radius: var(--zeno-radius-full);
  font-size: 0.875rem;
  font-weight: var(--zeno-font-weight-medium);
  max-width: 100%;
  transition: background-color var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-chip--removable {
  cursor: pointer;
}

.z-chip--removable:hover:not(.z-chip--disabled) {
  background: var(--zeno-color-background-muted);
}

.z-chip--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.z-chip__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.z-chip__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--zeno-color-text-secondary);
  cursor: pointer;
  transition:
    color var(--zeno-motion-duration-md) var(--zeno-motion-easing-ease-out),
    background-color var(--zeno-motion-duration-md)
      var(--zeno-motion-easing-ease-out);
}

.z-chip__remove:hover {
  color: var(--zeno-color-text-primary);
  background: var(--zeno-color-background-muted);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

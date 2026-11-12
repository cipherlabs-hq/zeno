<template>
  <span :class="tagClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ZTagProps, TagVariant, TagColor } from '../types/feedback';

// Re-export types for backward compatibility
export type { ZTagProps, TagVariant, TagColor };

const props = withDefaults(defineProps<ZTagProps>(), {
  variant: 'tonal',
  color: 'primary',
});

const tagClasses = computed(() => [
  'z-tag',
  `z-tag--${props.variant}`,
  `z-tag--${props.color}`,
]);
</script>

<style scoped>
.z-tag {
  display: inline-flex;
  align-items: center;
  padding: var(--zeno-spacing-1) var(--zeno-spacing-3);
  border-radius: var(--zeno-radius-md);
  font-size: 0.75rem;
  font-weight: var(--zeno-font-weight-medium);
  line-height: 1.2;
  white-space: nowrap;
}

/* Tonal variants */
.z-tag--tonal.z-tag--primary {
  background: var(--zeno-color-accent-subtle);
  color: var(--zeno-color-accent-text);
}

.z-tag--tonal.z-tag--secondary {
  background: var(--zeno-color-neutral-subtle);
  color: var(--zeno-color-neutral-text);
}

.z-tag--tonal.z-tag--accent {
  background: var(--zeno-color-accent-subtle);
  color: var(--zeno-color-accent-text);
}

.z-tag--tonal.z-tag--success {
  background: var(--zeno-color-success-subtle);
  color: var(--zeno-color-success-text);
}

.z-tag--tonal.z-tag--warning {
  background: var(--zeno-color-warning-subtle);
  color: var(--zeno-color-warning-text);
}

.z-tag--tonal.z-tag--danger {
  background: var(--zeno-color-danger-subtle);
  color: var(--zeno-color-danger-text);
}

/* Outlined variants */
.z-tag--outlined {
  background: transparent;
  border: 1px solid;
}

.z-tag--outlined.z-tag--primary {
  border-color: var(--zeno-color-accent-solid);
  color: var(--zeno-color-accent-text);
}

.z-tag--outlined.z-tag--secondary {
  border-color: var(--zeno-color-neutral-solid);
  color: var(--zeno-color-neutral-text);
}

.z-tag--outlined.z-tag--accent {
  border-color: var(--zeno-color-accent-solid);
  color: var(--zeno-color-accent-text);
}

.z-tag--outlined.z-tag--success {
  border-color: var(--zeno-color-success-solid);
  color: var(--zeno-color-success-text);
}

.z-tag--outlined.z-tag--warning {
  border-color: var(--zeno-color-warning-solid);
  color: var(--zeno-color-warning-text);
}

.z-tag--outlined.z-tag--danger {
  border-color: var(--zeno-color-danger-solid);
  color: var(--zeno-color-danger-text);
}
</style>

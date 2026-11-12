<template>
  <div :class="paperClasses" :style="paperStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { ZPaperProps, PaperElevation, PaperRadius } from '../types/layout';
import {
  getPaperStyles,
  getPaperClasses,
  DEFAULT_PAPER_PROPS,
  PAPER_ANIMATION,
} from '@usezeno/core';

// Re-export types for backward compatibility
export type { ZPaperProps, PaperElevation, PaperRadius };

const props = withDefaults(defineProps<ZPaperProps>(), DEFAULT_PAPER_PROPS);

const isVisible = ref(false);

/**
 * Computed classes for the paper using shared utilities
 */
const paperClasses = computed(() =>
  getPaperClasses(props, 'z-paper', [isVisible.value && 'z-paper--visible'])
);

/**
 * Computed styles for the paper using shared utilities
 */
const paperStyles = computed(() => {
  const baseStyles = getPaperStyles(props);

  // Add animation state
  return {
    ...baseStyles,
    opacity: isVisible.value
      ? PAPER_ANIMATION.visible.opacity
      : PAPER_ANIMATION.initial.opacity,
    transform: isVisible.value
      ? PAPER_ANIMATION.visible.transform
      : PAPER_ANIMATION.initial.transform,
  };
});

/**
 * Mount animation with tokenized duration
 */
onMounted(() => {
  // Trigger enter animation on next tick
  requestAnimationFrame(() => {
    isVisible.value = true;
  });
});
</script>

<style scoped>
.z-paper {
  background: var(--zeno-color-background-surface);
  color: var(--zeno-color-text-primary);
  transition:
    opacity var(--zeno-motion-duration-md) var(--zeno-motion-easing-ease-out),
    transform var(--zeno-motion-duration-md) var(--zeno-motion-easing-ease-out),
    box-shadow var(--zeno-motion-duration-md) var(--zeno-motion-easing-ease-out);

  /* Initial state for mount animation */
  opacity: 0;
  transform: scale(0.95);
}

.z-paper--visible {
  opacity: 1;
  transform: scale(1);
}

.z-paper--outlined {
  box-shadow: none !important;
}

/* Elevation-specific styles if needed for overrides */
.z-paper--elevation-0 {
  box-shadow: none;
}
</style>

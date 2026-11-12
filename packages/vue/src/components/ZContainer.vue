<template>
  <div :class="containerClasses" :style="containerStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ZContainerProps, ContainerMaxWidth } from '../types/layout';

// Re-export types for backward compatibility
export type { ZContainerProps, ContainerMaxWidth };

const props = withDefaults(defineProps<ZContainerProps>(), {
  fluid: false,
  maxWidth: 'lg',
});

/**
 * Computed classes for the container
 */
const containerClasses = computed(() => [
  'z-container',
  {
    'z-container--fluid': props.fluid,
  },
]);

/**
 * Computed styles for the container
 */
const containerStyles = computed(() => {
  const styles: Record<string, string> = {
    paddingLeft: 'var(--zeno-spacing-4)',
    paddingRight: 'var(--zeno-spacing-4)',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  if (!props.fluid) {
    const maxWidthMap = {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    };
    styles.maxWidth = maxWidthMap[props.maxWidth];
  }

  return styles;
});
</script>

<style scoped lang="scss">
@use '../tokens.scss' as tokens;

.z-container {
  width: 100%;
  box-sizing: border-box;
}

.z-container--fluid {
  max-width: none !important;
}
</style>

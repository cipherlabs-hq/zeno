<template>
  <div :class="gridClasses" :style="gridStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  ZGridProps,
  ResponsiveValue,
  GridAlign,
  GridJustify,
} from '../types/layout';

// Re-export types for backward compatibility
export type { ZGridProps, ResponsiveValue, GridAlign, GridJustify };

const props = withDefaults(defineProps<ZGridProps>(), {
  cols: 1,
  gap: 4,
  align: 'stretch',
  justify: 'start',
});

/**
 * Convert responsive value to CSS custom properties
 */
function generateResponsiveStyles<T>(
  value: ResponsiveValue<T>,
  property: string,
  transform: (_val: T) => string = val => String(val)
): Record<string, string> {
  const styles: Record<string, string> = {};

  if (typeof value === 'object' && value !== null) {
    // Handle responsive object
    const breakpoints = ['sm', 'md', 'lg', 'xl'] as const;

    breakpoints.forEach(bp => {
      if ((value as any)[bp] !== undefined) {
        styles[`--${property}-${bp}`] = transform((value as any)[bp]);
      }
    });
  } else {
    // Handle primitive value
    styles[`--${property}`] = transform(value as T);
  }

  return styles;
}

/**
 * Computed classes for the grid
 */
const gridClasses = computed(() => ['z-grid']);

/**
 * Computed styles for the grid
 */
const gridStyles = computed(() => {
  const styles: Record<string, string> = {};

  // Generate responsive columns
  Object.assign(
    styles,
    generateResponsiveStyles(
      props.cols,
      'cols',
      (val: number) => `repeat(${val}, 1fr)`
    )
  );

  // Generate responsive gap
  Object.assign(
    styles,
    generateResponsiveStyles(
      props.gap,
      'gap',
      (val: string | number) => `var(--zeno-spacing-${val})`
    )
  );

  // Static alignment properties
  styles['--align'] = props.align;
  styles['--justify'] = props.justify;

  return styles;
});
</script>

<style scoped>
.z-grid {
  display: grid;
  grid-template-columns: var(--cols, repeat(1, 1fr));
  gap: var(--gap, var(--zeno-spacing-4));
  align-items: var(--align, stretch);
  justify-content: var(--justify, start);
}

/* Responsive breakpoints */
@media (min-width: 640px) {
  .z-grid {
    grid-template-columns: var(--cols-sm, var(--cols, repeat(1, 1fr)));
    gap: var(--gap-sm, var(--gap, var(--zeno-spacing-4)));
  }
}

@media (min-width: 768px) {
  .z-grid {
    grid-template-columns: var(
      --cols-md,
      var(--cols-sm, var(--cols, repeat(1, 1fr)))
    );
    gap: var(--gap-md, var(--gap-sm, var(--gap, var(--zeno-spacing-4))));
  }
}

@media (min-width: 1024px) {
  .z-grid {
    grid-template-columns: var(
      --cols-lg,
      var(--cols-md, var(--cols-sm, var(--cols, repeat(1, 1fr))))
    );
    gap: var(
      --gap-lg,
      var(--gap-md, var(--gap-sm, var(--gap, var(--zeno-spacing-4))))
    );
  }
}

@media (min-width: 1280px) {
  .z-grid {
    grid-template-columns: var(
      --cols-xl,
      var(
        --cols-lg,
        var(--cols-md, var(--cols-sm, var(--cols, repeat(1, 1fr))))
      )
    );
    gap: var(
      --gap-xl,
      var(
        --gap-lg,
        var(--gap-md, var(--gap-sm, var(--gap, var(--zeno-spacing-4))))
      )
    );
  }
}
</style>

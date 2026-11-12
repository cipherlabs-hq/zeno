<template>
  <div
    :class="skeletonClasses"
    :style="skeletonStyle"
    :data-testid="testId"
    role="img"
    :aria-label="ariaLabel"
    :aria-hidden="ariaHidden"
  >
    <!-- Text skeleton with multiple lines -->
    <div v-if="variant === 'text'" class="z-skeleton__lines">
      <div
        v-for="(_, index) in normalizedLines"
        :key="index"
        class="z-skeleton__line"
        :class="getLineClasses(index)"
        :style="getLineStyle(index)"
        :aria-hidden="true"
      />
    </div>

    <!-- Avatar skeleton -->
    <div v-else-if="variant === 'avatar'" class="z-skeleton__avatar">
      <div class="z-skeleton__avatar-circle" :aria-hidden="true" />
      <div v-if="showText" class="z-skeleton__avatar-text">
        <div class="z-skeleton__avatar-title" :aria-hidden="true" />
        <div class="z-skeleton__avatar-subtitle" :aria-hidden="true" />
      </div>
    </div>

    <!-- Card skeleton with structured content -->
    <div v-else-if="variant === 'card'" class="z-skeleton__card">
      <div
        v-if="showImage"
        class="z-skeleton__card-image"
        :aria-hidden="true"
      />
      <div class="z-skeleton__card-content">
        <div class="z-skeleton__card-title" :aria-hidden="true" />
        <div class="z-skeleton__card-text" :aria-hidden="true" />
        <div
          class="z-skeleton__card-text"
          :style="{ width: '80%' }"
          :aria-hidden="true"
        />
        <div v-if="showActions" class="z-skeleton__card-actions">
          <div class="z-skeleton__card-action" :aria-hidden="true" />
          <div class="z-skeleton__card-action" :aria-hidden="true" />
        </div>
      </div>
    </div>

    <!-- Table skeleton with rows and columns -->
    <div v-else-if="variant === 'table'" class="z-skeleton__table">
      <div class="z-skeleton__table-header">
        <div
          v-for="col in columns"
          :key="`header-${col}`"
          class="z-skeleton__table-cell z-skeleton__table-cell--header"
          :aria-hidden="true"
        />
      </div>
      <div
        v-for="row in rows"
        :key="`row-${row}`"
        class="z-skeleton__table-row"
      >
        <div
          v-for="col in columns"
          :key="`cell-${row}-${col}`"
          class="z-skeleton__table-cell"
          :aria-hidden="true"
        />
      </div>
    </div>

    <!-- List skeleton with multiple items -->
    <div v-else-if="variant === 'list'" class="z-skeleton__list">
      <div
        v-for="item in items"
        :key="`item-${item}`"
        class="z-skeleton__list-item"
      >
        <div
          v-if="showIcon"
          class="z-skeleton__list-icon"
          :aria-hidden="true"
        />
        <div class="z-skeleton__list-content">
          <div class="z-skeleton__list-title" :aria-hidden="true" />
          <div class="z-skeleton__list-subtitle" :aria-hidden="true" />
        </div>
        <div
          v-if="showAction"
          class="z-skeleton__list-action"
          :aria-hidden="true"
        />
      </div>
    </div>

    <!-- Basic geometric shapes -->
    <div
      v-else-if="variant === 'circle'"
      class="z-skeleton__circle"
      :aria-hidden="true"
    />
    <div v-else class="z-skeleton__rect" :aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  ZSkeletonProps,
  SkeletonVariant,
  SkeletonSize,
  SkeletonTheme,
} from '../types/feedback';

// Re-export types for backward compatibility
export type { ZSkeletonProps, SkeletonVariant, SkeletonSize, SkeletonTheme };

const props = withDefaults(defineProps<ZSkeletonProps>(), {
  variant: 'rect',
  size: 'md',
  theme: 'default',
  lines: 3,
  rows: 3,
  columns: 4,
  items: 3,
  animated: true,
  showImage: true,
  showText: true,
  showActions: false,
  showIcon: true,
  showAction: false,
  progress: 0,
  ariaLabel: 'Loading content...',
  ariaHidden: false,
});

// Computed properties
const skeletonClasses = computed(() => [
  'z-skeleton',
  `z-skeleton--${props.variant}`,
  `z-skeleton--${props.size}`,
  `z-skeleton--${props.theme}`,
  {
    'z-skeleton--animated': props.animated,
    'z-skeleton--with-progress': props.progress > 0,
  },
]);

const skeletonStyle = computed(() => {
  const style: Record<string, string> = {};

  // Custom dimensions
  if (props.width) {
    style.width =
      typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  if (
    props.height &&
    !['text', 'avatar', 'card', 'table', 'list'].includes(props.variant)
  ) {
    style.height =
      typeof props.height === 'number' ? `${props.height}px` : props.height;
  }

  // Custom border radius
  if (props.borderRadius) {
    style.borderRadius =
      typeof props.borderRadius === 'number'
        ? `${props.borderRadius}px`
        : props.borderRadius;
  }

  // Progress indicator
  if (props.progress > 0) {
    style['--skeleton-progress'] =
      `${Math.min(100, Math.max(0, props.progress))}%`;
  }

  return style;
});

// Text lines configuration
const normalizedLines = computed(() => {
  if (Array.isArray(props.lines)) {
    return props.lines;
  }
  return Array.from({ length: props.lines }, (_, i) => i);
});

// Line styling for text variant
const getLineStyle = (index: number): Record<string, string> => {
  const totalLines = Array.isArray(props.lines)
    ? props.lines.length
    : props.lines;
  const isLast = index === totalLines - 1;

  // Varied widths for more realistic text skeleton
  const widths = ['100%', '95%', '85%', '90%', '75%', '88%', '92%'];
  const width = isLast ? '60%' : widths[index % widths.length];

  return { width };
};

const getLineClasses = (
  index: number
): (string | Record<string, boolean>)[] => {
  const totalLines = Array.isArray(props.lines)
    ? props.lines.length
    : props.lines;
  const isFirst = index === 0;
  const isLast = index === totalLines - 1;

  return [
    'z-skeleton__line',
    {
      'z-skeleton__line--first': isFirst,
      'z-skeleton__line--last': isLast,
    },
  ].filter(Boolean);
};

// Expose methods for programmatic control
defineExpose({
  /** Get the skeleton element */
  getSkeletonElement: () => document.getElementById(props.id || ''),
  /** Check if skeleton is currently animating */
  isAnimated: () => props.animated,
  /** Get current progress percentage */
  getProgress: () => props.progress,
});
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Skeleton Component
 * Principles: Smooth loading states, realistic content previews, accessible placeholders
 * Accessibility: WCAG 2.1 Level AA compliance, semantic loading indicators
 * Motion: Subtle animations that communicate progress without distraction
 */

/* Base skeleton container */
.z-skeleton {
  position: relative;
  display: block;
  background: var(--zeno-color-background-subtle);
  border-radius: tokens.$radius-md; /* 8px */
  overflow: hidden;

  /* CSS custom properties for theming */
  --skeleton-base: var(--zeno-color-background-subtle);
  --skeleton-highlight: var(--zeno-color-background-muted);
  --skeleton-shimmer: var(--zeno-color-background-surface);
}

/* Size variants for consistent scaling */
.z-skeleton--sm {
  --skeleton-line-height: 14px;
  --skeleton-spacing: #{tokens.$spacing-1}; /* 4px */
  --skeleton-border-radius: #{tokens.$radius-sm}; /* 4px */
}

.z-skeleton--md {
  --skeleton-line-height: 18px;
  --skeleton-spacing: #{tokens.$spacing-2}; /* 8px */
  --skeleton-border-radius: #{tokens.$radius-md}; /* 8px */
}

.z-skeleton--lg {
  --skeleton-line-height: 22px;
  --skeleton-spacing: #{tokens.$spacing-3}; /* 12px */
  --skeleton-border-radius: #{tokens.$radius-lg}; /* 12px */
}

/* Animation themes */

/* Default theme - subtle shimmer */
.z-skeleton--default.z-skeleton--animated {
  &::after,
  .z-skeleton__line::after,
  [class*='z-skeleton__']::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--skeleton-shimmer) 50%,
      transparent 100%
    );
    animation: skeleton-shimmer 2s ease-in-out infinite;
    opacity: 0.6;
  }
}

/* Pulse theme - breathing effect */
.z-skeleton--pulse.z-skeleton--animated {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

/* Wave theme - flowing animation */
.z-skeleton--wave.z-skeleton--animated {
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    animation: skeleton-wave 2s ease-in-out infinite;
    z-index: 1;
  }
}

/* Variant-specific styling */

/* Text skeleton - multiple lines with realistic proportions */
.z-skeleton--text {
  background: transparent;
  padding: 0;
}

.z-skeleton__lines {
  display: flex;
  flex-direction: column;
  gap: var(--skeleton-spacing);
}

.z-skeleton__line {
  height: var(--skeleton-line-height);
  background: var(--skeleton-base);
  border-radius: var(--skeleton-border-radius);
  position: relative;
  overflow: hidden;

  &--first {
    /* First line can be slightly taller for headings */
    height: calc(var(--skeleton-line-height) * 1.2);
  }

  &--last {
    /* Last line is typically shorter */
    width: 65% !important;
  }
}

/* Circle skeleton - perfect circles for avatars */
.z-skeleton--circle {
  border-radius: 50%;
  aspect-ratio: 1;
  width: 48px; /* Default avatar size */
  height: 48px;
}

.z-skeleton--sm.z-skeleton--circle {
  width: 32px;
  height: 32px;
}

.z-skeleton--lg.z-skeleton--circle {
  width: 64px;
  height: 64px;
}

/* Rectangle skeleton - flexible content blocks */
.z-skeleton__rect {
  width: 100%;
  height: 100%;
  min-height: 20px;
  background: var(--skeleton-base);
  border-radius: var(--skeleton-border-radius);
}

/* Avatar skeleton - profile with text */
.z-skeleton--avatar {
  background: transparent;
  padding: 0;
}

.z-skeleton__avatar {
  display: flex;
  align-items: center;
  gap: var(--skeleton-spacing);
}

.z-skeleton__avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--skeleton-base);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.z-skeleton__avatar-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: calc(var(--skeleton-spacing) / 2);
}

.z-skeleton__avatar-title {
  height: var(--skeleton-line-height);
  width: 120px;
  background: var(--skeleton-base);
  border-radius: var(--skeleton-border-radius);
  position: relative;
  overflow: hidden;
}

.z-skeleton__avatar-subtitle {
  height: calc(var(--skeleton-line-height) * 0.8);
  width: 80px;
  background: var(--skeleton-base);
  border-radius: var(--skeleton-border-radius);
  position: relative;
  overflow: hidden;
}

/* Card skeleton - structured content preview */
.z-skeleton--card {
  background: transparent;
  padding: 0;
}

.z-skeleton__card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--zeno-color-border-subtle);
  border-radius: var(--skeleton-border-radius);
  overflow: hidden;
}

.z-skeleton__card-image {
  height: 160px;
  background: var(--skeleton-base);
  position: relative;
  overflow: hidden;
}

.z-skeleton__card-content {
  padding: var(--skeleton-spacing);
  display: flex;
  flex-direction: column;
  gap: var(--skeleton-spacing);
}

.z-skeleton__card-title {
  height: calc(var(--skeleton-line-height) * 1.2);
  width: 70%;
  background: var(--skeleton-base);
  border-radius: var(--skeleton-border-radius);
  position: relative;
  overflow: hidden;
}

.z-skeleton__card-text {
  height: var(--skeleton-line-height);
  width: 100%;
  background: var(--skeleton-base);
  border-radius: var(--skeleton-border-radius);
  position: relative;
  overflow: hidden;
}

.z-skeleton__card-actions {
  display: flex;
  gap: var(--skeleton-spacing);
  margin-top: var(--skeleton-spacing);
}

.z-skeleton__card-action {
  height: 32px;
  width: 80px;
  background: var(--skeleton-base);
  border-radius: var(--skeleton-border-radius);
  position: relative;
  overflow: hidden;
}

/* Table skeleton - tabular data preview */
.z-skeleton--table {
  background: transparent;
  padding: 0;
}

.z-skeleton__table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--zeno-color-border-subtle);
  border-radius: var(--skeleton-border-radius);
  overflow: hidden;
}

.z-skeleton__table-header {
  display: grid;
  grid-template-columns: repeat(var(--skeleton-columns, 4), 1fr);
  gap: 1px;
  background: var(--zeno-color-background-muted);
  padding: var(--skeleton-spacing);
}

.z-skeleton__table-row {
  display: grid;
  grid-template-columns: repeat(var(--skeleton-columns, 4), 1fr);
  gap: 1px;
  padding: var(--skeleton-spacing);
  border-bottom: 1px solid var(--zeno-color-border-subtle);

  &:last-child {
    border-bottom: none;
  }
}

.z-skeleton__table-cell {
  height: var(--skeleton-line-height);
  background: var(--skeleton-base);
  border-radius: var(--skeleton-border-radius);
  position: relative;
  overflow: hidden;

  &--header {
    height: calc(var(--skeleton-line-height) * 1.1);
    background: var(--skeleton-highlight);
  }
}

/* List skeleton - repeated items */
.z-skeleton--list {
  background: transparent;
  padding: 0;
}

.z-skeleton__list {
  display: flex;
  flex-direction: column;
  gap: var(--skeleton-spacing);
}

.z-skeleton__list-item {
  display: flex;
  align-items: center;
  gap: var(--skeleton-spacing);
  padding: var(--skeleton-spacing);
  border: 1px solid var(--zeno-color-border-subtle);
  border-radius: var(--skeleton-border-radius);
}

.z-skeleton__list-icon {
  width: 24px;
  height: 24px;
  border-radius: tokens.$radius-sm;
  background: var(--skeleton-base);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.z-skeleton__list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: calc(var(--skeleton-spacing) / 2);
}

.z-skeleton__list-title {
  height: var(--skeleton-line-height);
  width: 60%;
  background: var(--skeleton-base);
  border-radius: var(--skeleton-border-radius);
  position: relative;
  overflow: hidden;
}

.z-skeleton__list-subtitle {
  height: calc(var(--skeleton-line-height) * 0.8);
  width: 40%;
  background: var(--skeleton-base);
  border-radius: var(--skeleton-border-radius);
  position: relative;
  overflow: hidden;
}

.z-skeleton__list-action {
  width: 60px;
  height: 28px;
  background: var(--skeleton-base);
  border-radius: var(--skeleton-border-radius);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

/* Progress indicator */
.z-skeleton--with-progress {
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 2px;
    width: var(--skeleton-progress, 0%);
    background: var(--zeno-color-accent-solid);
    transition: width 0.3s ease;
    z-index: 2;
  }
}

/* Animation keyframes */
@keyframes skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes skeleton-wave {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-skeleton--animated {
    &::after,
    &::before,
    .z-skeleton__line::after,
    [class*='z-skeleton__']::after {
      animation: none;
    }
  }

  .z-skeleton--pulse.z-skeleton--animated {
    animation: none;
  }

  .z-skeleton--with-progress::before {
    transition: none;
  }
}

/* High contrast mode support */
@media (forced-colors: active) {
  .z-skeleton {
    background: ButtonFace;
    border: 1px solid ButtonText;
  }

  .z-skeleton__line,
  [class*='z-skeleton__'] {
    background: ButtonText;
    opacity: 0.3;
  }

  .z-skeleton--animated {
    &::after,
    &::before,
    .z-skeleton__line::after,
    [class*='z-skeleton__']::after {
      display: none;
    }
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .z-skeleton__table-header,
  .z-skeleton__table-row {
    grid-template-columns: repeat(2, 1fr); /* Fewer columns on mobile */
  }

  .z-skeleton__card-actions {
    flex-direction: column;

    .z-skeleton__card-action {
      width: 100%;
    }
  }

  .z-skeleton__list-item {
    flex-direction: column;
    align-items: stretch;
    text-align: center;

    .z-skeleton__list-content {
      align-items: center;
    }
  }
}
</style>

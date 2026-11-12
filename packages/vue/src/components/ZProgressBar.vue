<template>
  <div
    :class="progressClasses"
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-label="ariaLabel"
  >
    <div
      v-if="showLabel && labelPosition === 'top'"
      class="z-progress__label z-progress__label--top"
    >
      <span class="z-progress__label-text">{{ labelText }}</span>
      <span v-if="showValue" class="z-progress__label-value">{{
        valueText
      }}</span>
    </div>

    <div class="z-progress__wrapper">
      <div class="z-progress__track">
        <div v-if="!indeterminate" class="z-progress__fill" :style="fillStyle">
          <div v-if="striped" class="z-progress__stripes" />
          <div v-if="animated && !striped" class="z-progress__shimmer" />
        </div>
        <div v-else class="z-progress__fill z-progress__fill--indeterminate">
          <div v-if="variant === 'pulse'" class="z-progress__pulse" />
        </div>

        <div
          v-if="showLabel && labelPosition === 'inside'"
          class="z-progress__label z-progress__label--inside"
        >
          {{ labelText }}
        </div>
      </div>

      <div v-if="segments && segments.length > 1" class="z-progress__segments">
        <div
          v-for="(_segment, index) in segments"
          :key="index"
          class="z-progress__segment"
        />
      </div>
    </div>

    <div
      v-if="showLabel && labelPosition === 'bottom'"
      class="z-progress__label z-progress__label--bottom"
    >
      <span class="z-progress__label-text">{{ labelText }}</span>
      <span v-if="showValue" class="z-progress__label-value">{{
        valueText
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  ZProgressBarProps,
  ProgressSize,
  ProgressVariant,
  LabelPosition,
} from '../types/feedback';

// Re-export types for backward compatibility
export type { ZProgressBarProps, ProgressSize, ProgressVariant, LabelPosition };

const props = withDefaults(defineProps<ZProgressBarProps>(), {
  value: 0,
  max: 100,
  size: 'md',
  variant: 'default',
  indeterminate: false,
  showLabel: false,
  showValue: true,
  labelPosition: 'bottom',
  striped: false,
  animated: true,
  segments: () => [],
  rounded: true,
  duration: 300,
});

const progressClasses = computed(() => [
  'z-progress',
  `z-progress--${props.size}`,
  `z-progress--${props.variant}`,
  {
    'z-progress--indeterminate': props.indeterminate,
    'z-progress--striped': props.striped,
    'z-progress--animated': props.animated,
    'z-progress--segmented': props.segments && props.segments.length > 1,
    'z-progress--rounded': props.rounded,
    'z-progress--has-label': props.showLabel,
  },
]);

const fillStyle = computed(() => {
  const width = `${Math.min(100, Math.max(0, props.value))}%`;
  const duration = `${props.duration}ms`;

  return {
    width,
    transitionDuration: duration,
  };
});

const labelText = computed(() => {
  if (props.label) return props.label;
  if (props.indeterminate) return 'Loading...';
  return '';
});

const valueText = computed(() => {
  if (props.indeterminate) return '';
  return `${Math.round(props.value)}%`;
});

const ariaLabel = computed(() => {
  if (props.label) return props.label;
  if (props.indeterminate) return 'Loading';
  return `${Math.round(props.value)}% complete`;
});
</script>

<style scoped lang="scss">
@use '../tokens.scss' as tokens;
@use 'sass:math';

.z-progress {
  width: 100%;
  font-family: tokens.$typography-font-family-primary;
}

.z-progress__wrapper {
  position: relative;
}

.z-progress__track {
  width: 100%;
  background: var(--zeno-color-background-subtle);
  overflow: hidden;
  position: relative;
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease;

  // Rounded corners
  .z-progress--rounded & {
    border-radius: tokens.$radius-full;
  }

  // Inner shadow for depth
  box-shadow: inset 0 1px 3px
    color-mix(in srgb, var(--zeno-color-text-primary) 10%, transparent);

  [data-theme='dark'] & {
    background: var(--zeno-color-text-primary);
    box-shadow: inset 0 1px 3px
      color-mix(in srgb, var(--zeno-color-text-primary) 30%, transparent);
  }
}

// Size variations
.z-progress--xs .z-progress__track {
  height: 2px;
}

.z-progress--sm .z-progress__track {
  height: 4px;
}

.z-progress--md .z-progress__track {
  height: 8px;
}

.z-progress--lg .z-progress__track {
  height: 12px;
}

.z-progress--xl .z-progress__track {
  height: 16px;
}

// Progress fill
.z-progress__fill {
  height: 100%;
  border-radius: inherit;
  transition: width 300ms tokens.$motion-easing-spring;
  position: relative;
  will-change: width;

  // Variant styles
  .z-progress--default & {
    background: var(--zeno-color-accent-solid);
  }

  .z-progress--brand & {
    background: linear-gradient(
      90deg,
      var(--zeno-color-accent-solid-hover),
      var(--zeno-color-accent-solid)
    );
  }

  .z-progress--success & {
    background: var(--zeno-color-success-solid);
  }

  .z-progress--warning & {
    background: var(--zeno-color-warning-solid);
  }

  .z-progress--error & {
    background: var(--zeno-color-danger-solid);
  }

  .z-progress--info & {
    background: var(--zeno-color-info-solid);
  }

  .z-progress--gradient & {
    background: linear-gradient(
      90deg,
      var(--zeno-color-accent-solid) 0%,
      var(--zeno-color-accent-solid-hover) 100%
    );
  }

  .z-progress--pulse & {
    background: var(--zeno-color-accent-solid);
  }
}

// Indeterminate animation
.z-progress__fill--indeterminate {
  width: 30%;
  animation: progress-indeterminate 2s ease-in-out infinite;

  .z-progress--pulse & {
    width: 100%;
    animation: none;
    opacity: 0.3;
  }
}

// Pulse effect for indeterminate
.z-progress__pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  animation: progress-pulse 2s ease-in-out infinite;
}

// Shimmer effect
.z-progress__shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 2s linear infinite;
}

// Striped pattern
.z-progress__stripes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;

  .z-progress--animated & {
    animation: stripes 1s linear infinite;
  }
}

// Segments
.z-progress__segments {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 2px;
  pointer-events: none;
}

.z-progress__segment {
  flex: 1;
  background: var(--zeno-color-background-surface);
  opacity: 0.3;
}

// Labels
.z-progress__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: tokens.$spacing-2;
  font-size: tokens.$typography-font-size-sm;
  color: var(--zeno-color-text-secondary);
  line-height: tokens.$typography-line-height-normal;

  &--top {
    margin-bottom: tokens.$spacing-1;
  }

  &--bottom {
    margin-top: tokens.$spacing-1;
  }

  &--inside {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 tokens.$spacing-2;
    font-size: tokens.$typography-font-size-xs;
    font-weight: tokens.$typography-font-weight-semibold;
    color: var(--zeno-color-accent-on-solid);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
    z-index: 1;

    .z-progress--xs &,
    .z-progress--sm & {
      display: none;
    }
  }
}

.z-progress__label-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.z-progress__label-value {
  flex-shrink: 0;
  font-weight: tokens.$typography-font-weight-semibold;
  color: var(--zeno-color-text-primary);
}

// Animations
@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

@keyframes progress-pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

@keyframes shimmer {
  100% {
    left: 100%;
  }
}

@keyframes stripes {
  100% {
    background-position: 1rem 0;
  }
}

// Accessibility
@media (prefers-reduced-motion: reduce) {
  .z-progress__fill {
    transition: none !important;
  }

  .z-progress__shimmer,
  .z-progress__stripes,
  .z-progress__pulse,
  .z-progress__fill--indeterminate {
    animation: none !important;
  }
}

// High contrast mode
@media (prefers-contrast: high) {
  .z-progress__track {
    border: 1px solid var(--zeno-color-border-default);
  }

  .z-progress__fill {
    border: 1px solid;
  }
}
</style>

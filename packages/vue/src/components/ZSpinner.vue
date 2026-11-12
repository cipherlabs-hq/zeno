<template>
  <div :class="spinnerClasses" role="status" :aria-label="ariaLabel">
    <div class="z-spinner__wrapper">
      <div v-if="type === 'ring'" class="z-spinner__ring">
        <svg
          :width="computedSize"
          :height="computedSize"
          viewBox="0 0 48 48"
          fill="none"
          class="z-spinner__svg"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            :stroke-width="strokeWidth"
            class="z-spinner__track"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            :stroke-width="strokeWidth"
            :stroke-dasharray="strokeDasharray"
            :stroke-dashoffset="strokeDashoffset"
            class="z-spinner__fill"
          />
        </svg>
      </div>

      <div v-else-if="type === 'dots'" class="z-spinner__dots">
        <span v-for="i in 3" :key="i" class="z-spinner__dot" />
      </div>

      <div v-else-if="type === 'pulse'" class="z-spinner__pulse">
        <span class="z-spinner__pulse-ring" />
        <span class="z-spinner__pulse-ring" />
        <span class="z-spinner__pulse-ring" />
      </div>

      <div v-else-if="type === 'bars'" class="z-spinner__bars">
        <span v-for="i in 5" :key="i" class="z-spinner__bar" />
      </div>

      <div v-else-if="type === 'grid'" class="z-spinner__grid">
        <span v-for="i in 9" :key="i" class="z-spinner__grid-item" />
      </div>
    </div>

    <span
      v-if="showLabel && labelPosition === 'right'"
      class="z-spinner__label z-spinner__label--right"
    >
      {{ labelText }}
    </span>

    <span class="sr-only">{{ ariaLabel }}</span>
  </div>

  <div
    v-if="showLabel && labelPosition === 'bottom'"
    class="z-spinner__label z-spinner__label--bottom"
  >
    {{ labelText }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  ZSpinnerProps,
  SpinnerSize,
  SpinnerType,
  SpinnerVariant,
  SpinnerLabelPosition,
} from '../types/feedback';

// Re-export types for backward compatibility
export type {
  ZSpinnerProps,
  SpinnerSize,
  SpinnerType,
  SpinnerVariant,
  SpinnerLabelPosition as LabelPosition,
};

const props = withDefaults(defineProps<ZSpinnerProps>(), {
  size: 'md',
  type: 'ring',
  variant: 'default',
  thickness: 2,
  speed: 'normal',
  label: 'Loading...',
  showLabel: false,
  labelPosition: 'right',
  overlay: false,
  fullscreen: false,
});

const spinnerClasses = computed(() => [
  'z-spinner',
  `z-spinner--${props.type}`,
  `z-spinner--${props.variant}`,
  `z-spinner--${props.speed}`,
  typeof props.size === 'string' ? `z-spinner--${props.size}` : '',
  {
    'z-spinner--with-label': props.showLabel,
    'z-spinner--label-right':
      props.showLabel && props.labelPosition === 'right',
    'z-spinner--label-bottom':
      props.showLabel && props.labelPosition === 'bottom',
    'z-spinner--overlay': props.overlay,
    'z-spinner--fullscreen': props.fullscreen,
  },
]);

const computedSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size;
  }

  const sizeMap = {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
  };

  return sizeMap[props.size];
});

const strokeWidth = computed(() => {
  if (props.thickness) return props.thickness;

  const thicknessMap = {
    xs: 2,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  };

  return typeof props.size === 'string' ? thicknessMap[props.size] : 3;
});

const strokeDasharray = computed(() => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  return `${circumference * 0.75} ${circumference * 0.25}`;
});

const strokeDashoffset = computed(() => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  return circumference * 0.25;
});

const labelText = computed(() => props.label || 'Loading...');
const ariaLabel = computed(() => props.label || 'Loading');
</script>

<style scoped lang="scss">
@use '../tokens.scss' as tokens;

.z-spinner {
  display: inline-flex;
  align-items: center;
  gap: tokens.$spacing-2;
  font-family: tokens.$typography-font-family-primary;

  // Variant colors
  &--default {
    color: var(--zeno-color-accent-text);
  }

  &--brand {
    color: var(--zeno-color-accent-solid-hover);
  }

  &--success {
    color: var(--zeno-color-success-text);
  }

  &--warning {
    color: var(--zeno-color-warning-text);
  }

  &--error {
    color: var(--zeno-color-danger-text);
  }

  &--info {
    color: var(--zeno-color-info-text);
  }

  // Overlay styles
  &--overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--zeno-color-background-surface) 80%,
      transparent
    );
    backdrop-filter: blur(2px);
    z-index: 1000;
  }

  // Fullscreen styles
  &--fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--zeno-color-background-surface) 95%,
      transparent
    );
    backdrop-filter: blur(4px);
    z-index: 9999;
  }

  // Label positioning
  &--label-bottom {
    flex-direction: column;
  }
}

.z-spinner__wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

// Ring spinner
.z-spinner__ring {
  display: inline-flex;
}

.z-spinner__svg {
  animation: spinner-rotate var(--spinner-duration, 1s) linear infinite;

  .z-spinner--slow & {
    --spinner-duration: 2s;
  }

  .z-spinner--normal & {
    --spinner-duration: 1s;
  }

  .z-spinner--fast & {
    --spinner-duration: 0.6s;
  }
}

.z-spinner__track {
  stroke: currentColor;
  opacity: 0.15;
  fill: none;
}

.z-spinner__fill {
  stroke: currentColor;
  fill: none;
  stroke-linecap: round;
  transform-origin: center;
  animation: spinner-dash 1.5s ease-in-out infinite;
}

// Dots spinner
.z-spinner__dots {
  display: flex;
  gap: calc(var(--dot-size, 8px) * 0.5);

  .z-spinner--xs & {
    --dot-size: 4px;
  }

  .z-spinner--sm & {
    --dot-size: 6px;
  }

  .z-spinner--md & {
    --dot-size: 8px;
  }

  .z-spinner--lg & {
    --dot-size: 10px;
  }

  .z-spinner--xl & {
    --dot-size: 12px;
  }
}

.z-spinner__dot {
  width: var(--dot-size, 8px);
  height: var(--dot-size, 8px);
  border-radius: 50%;
  background: currentColor;
  animation: dot-bounce var(--spinner-duration, 1.4s) ease-in-out infinite both;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }

  &:nth-child(2) {
    animation-delay: -0.16s;
  }
}

// Pulse spinner
.z-spinner__pulse {
  position: relative;
  width: var(--pulse-size, 40px);
  height: var(--pulse-size, 40px);

  .z-spinner--xs & {
    --pulse-size: 20px;
  }

  .z-spinner--sm & {
    --pulse-size: 30px;
  }

  .z-spinner--md & {
    --pulse-size: 40px;
  }

  .z-spinner--lg & {
    --pulse-size: 60px;
  }

  .z-spinner--xl & {
    --pulse-size: 80px;
  }
}

.z-spinner__pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid currentColor;
  border-radius: 50%;
  opacity: 0;
  animation: pulse-ring var(--spinner-duration, 1.2s)
    cubic-bezier(0.215, 0.61, 0.355, 1) infinite;

  &:nth-child(2) {
    animation-delay: -0.3s;
  }

  &:nth-child(3) {
    animation-delay: -0.6s;
  }
}

// Bars spinner
.z-spinner__bars {
  display: flex;
  gap: calc(var(--bar-width, 3px) * 0.5);
  height: var(--bar-height, 40px);

  .z-spinner--xs & {
    --bar-width: 2px;
    --bar-height: 20px;
  }

  .z-spinner--sm & {
    --bar-width: 2px;
    --bar-height: 30px;
  }

  .z-spinner--md & {
    --bar-width: 3px;
    --bar-height: 40px;
  }

  .z-spinner--lg & {
    --bar-width: 4px;
    --bar-height: 50px;
  }

  .z-spinner--xl & {
    --bar-width: 5px;
    --bar-height: 60px;
  }
}

.z-spinner__bar {
  width: var(--bar-width, 3px);
  height: 100%;
  background: currentColor;
  animation: bar-scale var(--spinner-duration, 1s) ease-in-out infinite;

  @for $i from 1 through 5 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 0.1}s;
    }
  }
}

// Grid spinner
.z-spinner__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(var(--grid-size, 10px) * 0.3);
  width: calc(var(--grid-size, 10px) * 3 + var(--grid-size, 10px) * 0.6);
  height: calc(var(--grid-size, 10px) * 3 + var(--grid-size, 10px) * 0.6);

  .z-spinner--xs & {
    --grid-size: 6px;
  }

  .z-spinner--sm & {
    --grid-size: 8px;
  }

  .z-spinner--md & {
    --grid-size: 10px;
  }

  .z-spinner--lg & {
    --grid-size: 14px;
  }

  .z-spinner--xl & {
    --grid-size: 18px;
  }
}

.z-spinner__grid-item {
  width: var(--grid-size, 10px);
  height: var(--grid-size, 10px);
  background: currentColor;
  animation: grid-fill var(--spinner-duration, 1.3s) ease-in-out infinite;

  @for $i from 1 through 9 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 0.1}s;
    }
  }
}

// Label styles
.z-spinner__label {
  font-size: tokens.$typography-font-size-sm;
  font-weight: tokens.$typography-font-weight-medium;
  color: var(--zeno-color-text-secondary);
  line-height: tokens.$typography-line-height-normal;

  &--bottom {
    margin-top: tokens.$spacing-2;
    text-align: center;
  }
}

// Screen reader only
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

// Animations
@keyframes spinner-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 1 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100 200;
    stroke-dashoffset: -15;
  }
  100% {
    stroke-dasharray: 100 200;
    stroke-dashoffset: -125;
  }
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

@keyframes bar-scale {
  0%,
  40%,
  100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

@keyframes grid-fill {
  0%,
  70%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  35% {
    transform: scale(1);
    opacity: 1;
  }
}

// Accessibility
@media (prefers-reduced-motion: reduce) {
  .z-spinner__svg,
  .z-spinner__fill,
  .z-spinner__dot,
  .z-spinner__pulse-ring,
  .z-spinner__bar,
  .z-spinner__grid-item {
    animation: none !important;
  }

  .z-spinner__fill {
    opacity: 0.5;
  }
}

// High contrast mode
@media (prefers-contrast: high) {
  .z-spinner__track {
    opacity: 0.3;
  }

  .z-spinner {
    &--overlay,
    &--fullscreen {
      background: var(--zeno-color-background-surface);
      border: 2px solid var(--zeno-color-border-default);
    }
  }
}
</style>

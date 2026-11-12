<template>
  <div ref="triggerRef" v-bind="triggerProps" class="z-tooltip-trigger">
    <slot name="trigger" />

    <Teleport to="body">
      <div
        v-if="isVisible"
        ref="tooltipRef"
        v-bind="tooltipProps"
        :class="tooltipClasses"
        :style="tooltipStyles"
      >
        <div v-if="hasIcon" class="z-tooltip__icon">
          <slot name="icon" />
        </div>
        <div class="z-tooltip__content">
          <div v-if="title" class="z-tooltip__title">{{ title }}</div>
          <slot>{{ content }}</slot>
        </div>
        <div v-if="showArrow" class="z-tooltip__arrow" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { useTooltip } from '../composables/useTooltip';
import type { ZTooltipProps } from '../types';

const props = withDefaults(defineProps<ZTooltipProps>(), {
  delay: 200,
  offset: 8,
  placement: 'top',
  variant: 'default',
  size: 'md',
  showArrow: true,
  animation: 'scale',
  interactive: false,
});

const slots = useSlots();
const hasIcon = computed(() => !!slots.icon);

const { isVisible, position, triggerProps, tooltipProps } = useTooltip({
  delay: props.delay as number,
  offset:
    typeof props.offset === 'number' ? props.offset : (props.offset?.[1] ?? 8),
  placement: props.placement?.split('-')[0] as
    'top' | 'bottom' | 'left' | 'right',
});

const tooltipClasses = computed(() => [
  'z-tooltip',
  `z-tooltip--${position.value.placement}`,
  `z-tooltip--${props.variant}`,
  `z-tooltip--${props.size}`,
  `z-tooltip--animation-${props.animation}`,
  {
    'z-tooltip--interactive': props.interactive,
    'z-tooltip--has-icon': hasIcon.value,
    'z-tooltip--has-title': !!props.title,
  },
]);

const tooltipStyles = computed(() => ({
  position: 'fixed' as const,
  left: `${position.value.x || -9999}px`,
  top: `${position.value.y || -9999}px`,
  zIndex: 9999,
  maxWidth:
    typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
  pointerEvents: props.interactive ? ('auto' as const) : ('none' as const),
  visibility: position.value.x ? ('visible' as const) : ('hidden' as const),
}));
</script>

<style scoped lang="scss">
@use '../tokens.scss' as tokens;
@use 'sass:math';
@use 'sass:map';

.z-tooltip-trigger {
  display: inline-block;
}

.z-tooltip {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: tokens.$spacing-2;
  max-width: 320px;
  word-wrap: break-word;
  font-family: tokens.$typography-font-family-primary;
  line-height: tokens.$typography-line-height-normal;
  letter-spacing: tokens.$typography-letter-spacing-normal;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  will-change: transform, opacity;

  // Size variants
  &--xs {
    padding: tokens.$spacing-1 tokens.$spacing-2;
    font-size: tokens.$typography-font-size-xs;
    font-weight: tokens.$typography-font-weight-medium;
    max-width: 200px;

    .z-tooltip__title {
      font-size: tokens.$typography-font-size-xs;
      margin-bottom: tokens.$spacing-0;
    }

    .z-tooltip__arrow {
      width: 8px;
      height: 8px;
    }
  }

  &--sm {
    padding: math.div(tokens.$spacing-2, 1.5) tokens.$spacing-2;
    font-size: tokens.$typography-font-size-sm;
    font-weight: tokens.$typography-font-weight-medium;
    max-width: 240px;

    .z-tooltip__title {
      font-size: tokens.$typography-font-size-sm;
      margin-bottom: tokens.$spacing-1;
    }

    .z-tooltip__arrow {
      width: 10px;
      height: 10px;
    }
  }

  &--md {
    padding: tokens.$spacing-2 tokens.$spacing-3;
    font-size: tokens.$typography-font-size-sm;
    font-weight: tokens.$typography-font-weight-medium;

    .z-tooltip__title {
      font-size: tokens.$typography-font-size-md;
      margin-bottom: tokens.$spacing-1;
    }

    .z-tooltip__arrow {
      width: 12px;
      height: 12px;
    }
  }

  &--lg {
    padding: tokens.$spacing-3 tokens.$spacing-4;
    font-size: tokens.$typography-font-size-md;
    font-weight: tokens.$typography-font-weight-normal;
    max-width: 400px;

    .z-tooltip__title {
      font-size: tokens.$typography-font-size-lg;
      margin-bottom: tokens.$spacing-2;
    }

    .z-tooltip__arrow {
      width: 14px;
      height: 14px;
    }
  }

  // Variant styles
  &--default {
    background: color-mix(
      in srgb,
      var(--zeno-color-background-inverse) 95%,
      transparent
    );
    color: var(--zeno-color-text-inverse);
    border-radius: tokens.$radius-md;
    box-shadow:
      0 0 0 1px
        color-mix(in srgb, var(--zeno-color-text-inverse) 10%, transparent),
      tokens.$elevation-shadow-md;
    backdrop-filter: blur(8px);

    [data-theme='dark'] & {
      background: color-mix(
        in srgb,
        var(--zeno-color-text-inverse) 95%,
        transparent
      );
      color: var(--zeno-color-background-inverse);
      box-shadow:
        0 0 0 1px
          color-mix(
            in srgb,
            var(--zeno-color-background-inverse) 10%,
            transparent
          ),
        tokens.$elevation-shadow-md;
    }
  }

  &--dark {
    background: color-mix(
      in srgb,
      var(--zeno-color-background-inverse) 98%,
      transparent
    );
    color: var(--zeno-color-text-inverse);
    border-radius: tokens.$radius-md;
    box-shadow: tokens.$elevation-shadow-md;
  }

  &--light {
    background: var(--zeno-color-text-inverse);
    color: var(--zeno-color-background-inverse);
    border-radius: tokens.$radius-md;
    box-shadow:
      0 0 0 1px
        color-mix(in srgb, var(--zeno-color-border-subtle) 50%, transparent),
      tokens.$elevation-shadow-sm;
  }

  &--brand {
    background: linear-gradient(
      135deg,
      var(--zeno-color-accent-solid-hover),
      color-mix(
        in srgb,
        var(--zeno-color-accent-solid-hover) 85%,
        var(--zeno-color-accent-solid)
      )
    );
    color: var(--zeno-color-text-inverse);
    border-radius: tokens.$radius-md;
    box-shadow:
      0 0 20px -5px
        color-mix(
          in srgb,
          var(--zeno-color-accent-solid-hover) 40%,
          transparent
        ),
      tokens.$elevation-shadow-md;
  }

  &--success {
    background: var(--zeno-color-success-solid);
    color: var(--zeno-color-success-on-solid);
    border-radius: tokens.$radius-md;
    box-shadow:
      0 0 16px -4px
        color-mix(in srgb, var(--zeno-color-success-solid) 30%, transparent),
      tokens.$elevation-shadow-sm;
  }

  &--warning {
    background: var(--zeno-color-warning-solid);
    color: var(--zeno-color-background-inverse);
    border-radius: tokens.$radius-md;
    box-shadow:
      0 0 16px -4px
        color-mix(in srgb, var(--zeno-color-warning-solid) 30%, transparent),
      tokens.$elevation-shadow-sm;
  }

  &--error {
    background: var(--zeno-color-danger-solid);
    color: var(--zeno-color-danger-on-solid);
    border-radius: tokens.$radius-md;
    box-shadow:
      0 0 16px -4px
        color-mix(in srgb, var(--zeno-color-danger-solid) 30%, transparent),
      tokens.$elevation-shadow-sm;
  }

  &--info {
    background: var(--zeno-color-info-solid);
    color: var(--zeno-color-info-on-solid);
    border-radius: tokens.$radius-md;
    box-shadow:
      0 0 16px -4px
        color-mix(in srgb, var(--zeno-color-info-solid) 30%, transparent),
      tokens.$elevation-shadow-sm;
  }

  // Interactive tooltips
  &--interactive {
    pointer-events: auto;

    &:hover {
      transform: scale(1.02);
    }
  }
}

.z-tooltip__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25em;
  height: 1.25em;
  opacity: 0.9;
}

.z-tooltip__content {
  flex: 1;
  min-width: 0;
}

.z-tooltip__title {
  font-weight: tokens.$typography-font-weight-semibold;
  letter-spacing: tokens.$typography-letter-spacing-tight;
}

// Arrow styles
.z-tooltip__arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  transform: rotate(45deg);

  .z-tooltip--default & {
    background: inherit;
    box-shadow: -2px -2px 4px -2px
      color-mix(in srgb, var(--zeno-color-background-inverse) 20%, transparent);
  }

  .z-tooltip--dark & {
    background: inherit;
  }

  .z-tooltip--light & {
    background: inherit;
    box-shadow: -1px -1px 2px -1px
      color-mix(in srgb, var(--zeno-color-border-strong) 30%, transparent);
  }

  .z-tooltip--brand &,
  .z-tooltip--success &,
  .z-tooltip--warning &,
  .z-tooltip--error &,
  .z-tooltip--info & {
    background: inherit;
  }
}

// Placement-specific arrow positions
.z-tooltip--top .z-tooltip__arrow {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
}

.z-tooltip--bottom .z-tooltip__arrow {
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
}

.z-tooltip--left .z-tooltip__arrow {
  right: -6px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.z-tooltip--right .z-tooltip__arrow {
  left: -6px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

// Animation variants
.z-tooltip--animation-fade {
  opacity: 0;
  transition: opacity tokens.$motion-duration-md tokens.$motion-easing-ease;

  &[style*='visibility: visible'] {
    opacity: 1;
  }
}

.z-tooltip--animation-scale {
  opacity: 0;
  transform: scale(0.95);
  transition:
    opacity tokens.$motion-duration-md tokens.$motion-easing-ease,
    transform 300ms tokens.$motion-easing-spring;

  &[style*='visibility: visible'] {
    opacity: 1;
    transform: scale(1);
  }

  &.z-tooltip--top {
    transform-origin: center bottom;
  }

  &.z-tooltip--bottom {
    transform-origin: center top;
  }

  &.z-tooltip--left {
    transform-origin: right center;
  }

  &.z-tooltip--right {
    transform-origin: left center;
  }
}

.z-tooltip--animation-slide {
  opacity: 0;
  transition:
    opacity tokens.$motion-duration-md tokens.$motion-easing-ease,
    transform 300ms tokens.$motion-easing-spring;

  &.z-tooltip--top {
    transform: translateY(4px);
  }

  &.z-tooltip--bottom {
    transform: translateY(-4px);
  }

  &.z-tooltip--left {
    transform: translateX(4px);
  }

  &.z-tooltip--right {
    transform: translateX(-4px);
  }

  &[style*='visibility: visible'] {
    opacity: 1;
    transform: translate(0, 0);
  }
}

.z-tooltip--animation-bounce {
  opacity: 0;
  animation-duration: 400ms;
  animation-timing-function: tokens.$motion-easing-spring;
  animation-fill-mode: forwards;

  &[style*='visibility: visible'] {
    animation-name: tooltip-bounce-in;
  }
}

@keyframes tooltip-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

// Accessibility
@media (prefers-reduced-motion: reduce) {
  .z-tooltip {
    transition: none !important;
    animation: none !important;
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .z-tooltip {
    border: 2px solid;

    &--default,
    &--dark {
      border-color: var(--zeno-color-text-inverse);
    }

    &--light {
      border-color: var(--zeno-color-background-inverse);
    }
  }
}
</style>

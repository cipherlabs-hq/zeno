<template>
  <span
    :class="badgeClasses"
    :role="interactive ? 'button' : 'status'"
    :tabindex="interactive ? '0' : undefined"
    :aria-label="
      ariaLabel ||
      (typeof content === 'number' ? `${content} items` : undefined)
    "
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Icon slot for leading icons -->
    <span v-if="$slots.icon && !loading" class="z-badge__icon">
      <slot name="icon" />
    </span>

    <!-- Loading spinner -->
    <span v-if="loading" class="z-badge__spinner" aria-hidden="true">
      <svg class="z-badge__spinner-svg" viewBox="0 0 16 16">
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-dasharray="18.85"
          stroke-dashoffset="18.85"
        >
          <animate
            attributeName="stroke-dasharray"
            dur="1.5s"
            values="0 18.85;9.425 9.425;0 18.85"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-dashoffset"
            dur="1.5s"
            values="0;-9.425;-18.85"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </span>

    <!-- Badge content -->
    <span
      v-if="!isDot && !loading"
      class="z-badge__content"
      :class="{ 'z-badge__content--hidden': loading }"
    >
      <slot>{{ displayContent }}</slot>
    </span>

    <!-- Trailing icon slot -->
    <span v-if="hasTrailing && !loading" class="z-badge__trailing">
      <slot name="trailing" />
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type {
  ZBadgeProps,
  BadgeVariant,
  BadgeSize,
  BadgeShape,
} from '../types/feedback';
import type { BadgePosition } from '../types/data';
import type { ZBadgeEmits } from '../types/events';

// Re-export types for backward compatibility
export type {
  ZBadgeProps,
  BadgeVariant,
  BadgeSize,
  BadgeShape,
  BadgePosition,
  ZBadgeEmits,
};

const props = withDefaults(defineProps<ZBadgeProps>(), {
  variant: 'default',
  size: 'md',
  shape: 'rounded',
  position: 'inline',
  dot: false,
  max: 99,
  pulse: false,
  interactive: false,
  loading: false,
  outline: false,
});

const emit = defineEmits<ZBadgeEmits>();

// Get slots
const slots = useSlots();

// Slot checks
const hasDefault = computed(() => !!slots.default);
const hasIcon = computed(() => !!slots.icon);
const hasTrailing = computed(() => !!slots.trailing);

/**
 * Computed variant that handles legacy color prop
 */
const computedVariant = computed(() => {
  if (props.color) {
    const colorMap = {
      success: 'success',
      warning: 'warning',
      error: 'error',
      info: 'info',
    } as const;
    return (colorMap as Record<string, string>)[props.color] || props.variant;
  }
  return props.variant;
});

/**
 * Whether this is a dot-only badge
 */
const isDot = computed(
  () => props.dot || (props.content === undefined && !hasDefault.value)
);

/**
 * Display content with max number formatting
 */
const displayContent = computed(() => {
  if (typeof props.content === 'number') {
    return props.content > props.max
      ? `${props.max}+`
      : props.content.toString();
  }
  return props.content;
});

/**
 * Computed classes for the badge
 */
const badgeClasses = computed(() => [
  'z-badge',
  `z-badge--${computedVariant.value}`,
  `z-badge--${props.size}`,
  `z-badge--${props.shape}`,
  `z-badge--${props.position}`,
  {
    'z-badge--dot': isDot.value,
    'z-badge--pulse': props.pulse,
    'z-badge--interactive': props.interactive,
    'z-badge--loading': props.loading,
    'z-badge--outline': props.outline,
    'z-badge--has-icon': hasIcon.value,
    'z-badge--has-trailing': hasTrailing.value,
  },
]);

/**
 * Handle badge click
 */
const handleClick = (event: MouseEvent) => {
  if (props.interactive && !props.loading) {
    emit('click', event);
  }
};

/**
 * Handle keyboard navigation
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (
    props.interactive &&
    !props.loading &&
    (event.key === 'Enter' || event.key === ' ')
  ) {
    event.preventDefault();
    handleClick(event as unknown as MouseEvent);
  }
};
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Badge Component
 * Principles: Clear information hierarchy, consistent visual language
 * Accessibility: WCAG 2.1 Level AA compliance, enhanced readability
 * Motion: Subtle animations for attention without distraction
 */

.z-badge {
  /* Base foundation */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: tokens.$spacing-1; /* 4px */
  font-family: tokens.$typography-font-family-primary;
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
  line-height: tokens.$typography-line-height-tight;
  white-space: nowrap;
  vertical-align: middle;
  border: 1px solid transparent;

  /* Physics-based transitions */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  will-change: transform, box-shadow, background-color;

  /* Size variants optimized for readability */
  &--sm {
    font-size: tokens.$typography-font-size-xs; /* 12px */
    padding: 2px tokens.$spacing-2; /* 2px 8px */
    min-height: 20px;
    border-radius: tokens.$radius-sm; /* 4px */
    gap: 2px;

    &.z-badge--dot {
      width: 8px;
      height: 8px;
      min-height: 8px;
      padding: 0;
      border-radius: 50%;
    }
  }

  &--md {
    font-size: tokens.$typography-font-size-sm; /* 14px */
    padding: tokens.$spacing-1 tokens.$spacing-3; /* 4px 12px */
    min-height: 24px;
    border-radius: tokens.$radius-md; /* 6px */

    &.z-badge--dot {
      width: 12px;
      height: 12px;
      min-height: 12px;
      padding: 0;
      border-radius: 50%;
    }
  }

  &--lg {
    font-size: tokens.$typography-font-size-md; /* 16px */
    padding: tokens.$spacing-2 tokens.$spacing-4; /* 8px 16px */
    min-height: 32px;
    border-radius: tokens.$radius-lg; /* 8px */

    &.z-badge--dot {
      width: 16px;
      height: 16px;
      min-height: 16px;
      padding: 0;
      border-radius: 50%;
    }
  }

  /* Shape variants */
  &--pill {
    border-radius: tokens.$radius-full; /* 9999px */

    &.z-badge--dot {
      border-radius: 50%;
    }
  }

  &--square {
    border-radius: 0;

    &.z-badge--dot {
      border-radius: 0;
    }
  }

  /* Position variants */
  &--inline {
    position: relative;
    margin-right: tokens.$spacing-2;
  }

  &--corner {
    position: absolute;
    top: -6px;
    right: -6px;
    border: 2px solid var(--zeno-color-background-surface);
    z-index: 1;
  }

  /* Variant styles following design system colors */

  /* Default: Neutral information */
  &--default {
    background-color: var(--zeno-color-background-subtle);
    color: var(--zeno-color-text-secondary);
    border-color: var(--zeno-color-border-default);

    &.z-badge--outline {
      background-color: transparent;
      border-color: var(--zeno-color-border-strong);
      color: var(--zeno-color-text-primary);
    }
  }

  /* Primary: accent gradient */
  &--primary {
    background: linear-gradient(
      135deg,
      tokens.$color-accent 0%,
      tokens.$color-accent-hover 100%
    );
    color: tokens.$color-white;
    border-color: tokens.$color-accent;
    box-shadow: 0 1px 3px rgba(tokens.$color-accent, 0.2);

    &.z-badge--outline {
      background-color: transparent;
      border-color: tokens.$color-accent;
      color: tokens.$color-accent;
      box-shadow: none;
    }
  }

  /* Secondary: subtle accent */
  &--secondary {
    background-color: rgba(tokens.$color-accent, 0.1);
    color: tokens.$color-accent;
    border-color: rgba(tokens.$color-accent, 0.2);

    &.z-badge--outline {
      background-color: transparent;
      border-color: tokens.$color-accent;
    }
  }

  /* Success: Green tones */
  &--success {
    background-color: var(--zeno-color-success-solid);
    color: var(--zeno-color-accent-on-solid);
    border-color: var(--zeno-color-success-solid);
    box-shadow: 0 1px 3px rgba(16, 185, 129, 0.2);

    &.z-badge--outline {
      background-color: transparent;
      border-color: var(--zeno-color-success-solid);
      color: var(--zeno-color-success-text);
      box-shadow: none;
    }
  }

  /* Warning: Amber tones */
  &--warning {
    background-color: var(--zeno-color-warning-solid);
    color: var(--zeno-color-accent-on-solid);
    border-color: var(--zeno-color-warning-solid);
    box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);

    &.z-badge--outline {
      background-color: transparent;
      border-color: var(--zeno-color-warning-solid);
      color: var(--zeno-color-warning-text);
      box-shadow: none;
    }
  }

  /* Error: Red tones */
  &--error {
    background-color: var(--zeno-color-danger-solid);
    color: var(--zeno-color-accent-on-solid);
    border-color: var(--zeno-color-danger-solid);
    box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);

    &.z-badge--outline {
      background-color: transparent;
      border-color: var(--zeno-color-danger-solid);
      color: var(--zeno-color-danger-text);
      box-shadow: none;
    }
  }

  /* Info: Blue tones */
  &--info {
    background-color: var(--zeno-color-info-solid);
    color: var(--zeno-color-accent-on-solid);
    border-color: var(--zeno-color-info-solid);
    box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);

    &.z-badge--outline {
      background-color: transparent;
      border-color: var(--zeno-color-info-solid);
      color: var(--zeno-color-info-text);
      box-shadow: none;
    }
  }

  /* Accent */
  &--accent {
    background-color: tokens.$color-accent;
    color: tokens.$color-white;
    border-color: tokens.$color-accent;
    box-shadow: 0 1px 3px rgba(tokens.$color-accent, 0.2);

    &.z-badge--outline {
      background-color: transparent;
      border-color: tokens.$color-accent;
      color: tokens.$color-accent;
      box-shadow: none;
    }
  }

  /* Interactive state */
  &--interactive {
    cursor: pointer;
    user-select: none;

    &:hover:not(&--loading) {
      transform: translateY(-1px) scale(1.05);
      filter: brightness(1.1);
    }

    &:active:not(&--loading) {
      transform: translateY(0) scale(1);
      filter: brightness(0.95);
    }

    &:focus-visible {
      outline: 2px solid var(--zeno-color-focus-ring);
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(var(--zeno-color-accent-solid), 0.15);
    }
  }

  /* Pulse animation for attention */
  &--pulse {
    animation: pulse 2s infinite;
  }

  /* Loading state */
  &--loading {
    cursor: progress;

    .z-badge__content {
      opacity: 0.7;
    }
  }

  /* Dot-only styles */
  &--dot {
    .z-badge__content,
    .z-badge__icon,
    .z-badge__trailing {
      display: none;
    }
  }
}

/* Content structure */
.z-badge__content {
  display: flex;
  align-items: center;
  transition: opacity tokens.$motion-duration-md tokens.$motion-easing-ease-out;

  &--hidden {
    opacity: 0;
  }
}

.z-badge__icon,
.z-badge__trailing {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .z-badge--sm & {
    width: 12px;
    height: 12px;
  }

  .z-badge--md & {
    width: 14px;
    height: 14px;
  }

  .z-badge--lg & {
    width: 16px;
    height: 16px;
  }
}

/* Loading spinner */
.z-badge__spinner {
  display: flex;
  align-items: center;
  justify-content: center;

  .z-badge--sm & {
    width: 12px;
    height: 12px;
  }

  .z-badge--md & {
    width: 14px;
    height: 14px;
  }

  .z-badge--lg & {
    width: 16px;
    height: 16px;
  }
}

.z-badge__spinner-svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
}

/* Pulse animation */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-badge {
    transition:
      color 0.15s ease,
      background-color 0.15s ease;

    &--interactive:hover:not(&--loading) {
      transform: none;
    }

    &--interactive:active:not(&--loading) {
      transform: none;
    }

    &--pulse {
      animation: none;
    }
  }

  .z-badge__spinner-svg animate {
    animation-duration: 2s;
  }
}
</style>

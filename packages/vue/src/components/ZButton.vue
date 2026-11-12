<template>
  <button
    ref="buttonRef"
    :type="type"
    :class="buttonClasses"
    :disabled="disabled"
    :aria-pressed="pressed"
    :aria-busy="loading"
    v-bind="$attrs"
    @click="handleClick"
    @mousedown="handleMouseDown"
  >
    <!-- Ripple effect container -->
    <span class="z-button__ripple-container" aria-hidden="true">
      <span
        v-for="ripple in ripples"
        :key="ripple.id"
        class="z-button__ripple"
        :style="ripple.style"
      />
    </span>

    <!-- Loading spinner for async states -->
    <Transition name="button-fade" mode="out-in">
      <span v-if="loading" class="z-button__spinner" aria-hidden="true">
        <svg class="z-button__spinner-svg" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
          />
        </svg>
      </span>
    </Transition>

    <!-- Icon slot for leading icons -->
    <Transition name="button-scale">
      <span v-if="hasIcon && !loading" class="z-button__icon">
        <slot name="icon" />
      </span>
    </Transition>

    <!-- Button content -->
    <span
      class="z-button__content"
      :class="{ 'z-button__content--hidden': loading }"
    >
      <slot />
    </span>

    <!-- Trailing icon slot -->
    <Transition name="button-scale">
      <span v-if="hasTrailing && !loading" class="z-button__trailing">
        <slot name="trailing" />
      </span>
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, reactive, useSlots } from 'vue';
import type { ZButtonProps, ButtonVariant, ButtonSize } from '../types/forms';

// Re-export types for backward compatibility
export type { ZButtonProps, ButtonVariant, ButtonSize };

const props = withDefaults(defineProps<ZButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  fullWidth: false,
  loading: false,
  pressed: false,
  elevated: false,
  noRipple: false,
});

// Get slots
const slots = useSlots();

// Slot checks
const hasIcon = computed(() => !!slots.icon);
const hasTrailing = computed(() => !!slots.trailing);

// Template refs
const buttonRef = ref<HTMLButtonElement>();

// Ripple effect state
interface Ripple {
  id: number;
  style: {
    left: string;
    top: string;
    width: string;
    height: string;
  };
}

const ripples = reactive<Ripple[]>([]);
let rippleId = 0;

/**
 * Create ripple effect on click
 */
const createRipple = (event: MouseEvent) => {
  if (props.noRipple || props.disabled || props.variant === 'link') return;

  const button = buttonRef.value;
  if (!button) return;

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple: Ripple = {
    id: rippleId++,
    style: {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
    },
  };

  ripples.push(ripple);

  // Remove ripple after animation
  setTimeout(() => {
    const index = ripples.findIndex(r => r.id === ripple.id);
    if (index > -1) {
      ripples.splice(index, 1);
    }
  }, 600);
};

/**
 * Handle click event with ripple
 */
const handleClick = (event: MouseEvent) => {
  createRipple(event);
};

/**
 * Handle mouse down for better interaction feedback
 */
const handleMouseDown = (event: MouseEvent) => {
  // Prevent text selection on double click
  if (event.detail > 1) {
    event.preventDefault();
  }
};

/**
 * Computed classes for the button based on props
 */
const buttonClasses = computed(() => [
  'z-button',
  `z-button--${props.variant}`,
  `z-button--${props.size}`,
  {
    'z-button--disabled': props.disabled,
    'z-button--full-width': props.fullWidth,
    'z-button--loading': props.loading,
    'z-button--pressed': props.pressed,
    'z-button--elevated': props.elevated,
  },
]);
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '../tokens.scss' as tokens;

/* Button Component
 * Principles: Bold simplicity, intuitive hierarchy, frictionless interaction
 * Accessibility: WCAG 2.1 Level AA compliance, enhanced focus states
 * Motion: Physics-based micro-interactions for spatial continuity
 */

.z-button {
  /* Base foundation - content-first layout with strategic negative space */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: tokens.$spacing-2; /* 8px - strategic spacing for cognitive breathing room */
  border: none;
  border-radius: tokens.$radius-lg; /* 12px - Apple-style subtle rounded corners */
  font-family: tokens.$typography-font-family-primary;
  font-weight: tokens.$typography-font-weight-medium; /* 500 - Google Material weight */
  line-height: tokens.$typography-line-height-normal;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  overflow: hidden; /* For ripple effect containment */
  -webkit-tap-highlight-color: transparent; /* Remove mobile tap highlight */

  /* Enhanced touch targets - Microsoft Fluent guidelines */
  min-height: 44px; /* iOS Human Interface Guidelines minimum */
  touch-action: manipulation;

  /* Physics-based motion choreography with spring easing */
  transition:
    background-color tokens.$motion-duration-md tokens.$motion-easing-ease-out,
    border-color tokens.$motion-duration-md tokens.$motion-easing-ease-out,
    color tokens.$motion-duration-md tokens.$motion-easing-ease-out,
    transform tokens.$motion-duration-md cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow tokens.$motion-duration-lg tokens.$motion-easing-ease-out;
  will-change: transform, box-shadow;

  /* Focus accessibility - enhanced contrast ratios */
  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px var(--zeno-color-background-surface),
      0 0 0 5px var(--zeno-color-accent-solid);
    transform: translateY(-1px) scale(1.02);
  }

  /* Size variants - optimized for cognitive load and task efficiency */
  &--sm {
    font-size: tokens.$typography-font-size-sm; /* 14px */
    padding: tokens.$spacing-3 tokens.$spacing-4; /* 12px 16px */
    min-height: 40px;
    gap: tokens.$spacing-1; /* 4px */
  }

  &--md {
    font-size: tokens.$typography-font-size-md; /* 16px */
    padding: tokens.$spacing-4 tokens.$spacing-6; /* 16px 24px */
    min-height: 48px;
    gap: tokens.$spacing-2; /* 8px */
  }

  &--lg {
    font-size: tokens.$typography-font-size-lg; /* 20px */
    padding: tokens.$spacing-5 tokens.$spacing-8; /* 20px 32px */
    min-height: 56px;
    gap: tokens.$spacing-2; /* 8px */
  }

  &--xl {
    font-size: tokens.$typography-font-size-xl; /* 24px */
    padding: tokens.$spacing-6 tokens.$spacing-10; /* 24px 40px */
    min-height: 64px;
    gap: tokens.$spacing-3; /* 12px */
  }

  /* Variant styles - visual hierarchy with purposeful accent placement */

  /* Primary: High-emphasis actions - Theme-aware gradient */
  &--primary {
    background: linear-gradient(
      135deg,
      var(--zeno-color-accent-solid) 0%,
      var(--zeno-color-neutral-solid) 100%
    );
    color: tokens.$color-white;
    box-shadow:
      0 2px 8px rgba(var(--zeno-color-accent-solid), 0.3),
      0 1px 3px rgba(0, 0, 0, 0.1);

    &:hover:not(&--disabled):not(&--loading) {
      background: linear-gradient(
        135deg,
        var(--zeno-color-accent-solid-hover) 0%,
        var(--zeno-color-neutral-solid-hover) 100%
      );
      transform: translateY(-2px) scale(1.01);
      box-shadow:
        0 8px 20px rgba(var(--zeno-color-accent-solid), 0.35),
        0 4px 8px rgba(0, 0, 0, 0.12),
        inset 0 1px 1px rgba(255, 255, 255, 0.1);
    }

    &:active:not(&--disabled):not(&--loading) {
      transform: translateY(0) scale(1);
      filter: brightness(0.95);
      box-shadow:
        0 1px 4px rgba(var(--zeno-color-accent-solid), 0.5),
        0 1px 2px rgba(0, 0, 0, 0.2);
    }

    &.z-button--elevated {
      box-shadow:
        0 8px 24px rgba(var(--zeno-color-accent-solid), 0.35),
        0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  /* Secondary: medium emphasis, outlined */
  &--secondary {
    background-color: tokens.$color-white;
    color: var(--zeno-color-accent-text);
    border: 1.5px solid var(--zeno-color-accent-solid);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    &:hover:not(&--disabled):not(&--loading) {
      background-color: rgba(var(--zeno-color-accent-solid), 0.05);
      border-color: var(--zeno-color-neutral-solid);
      color: var(--zeno-color-neutral-text);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(var(--zeno-color-accent-solid), 0.15);
    }

    &:active:not(&--disabled):not(&--loading) {
      transform: translateY(0);
      background-color: rgba(var(--zeno-color-accent-solid), 0.1);
      box-shadow: 0 1px 2px rgba(var(--zeno-color-accent-solid), 0.2);
    }
  }

  /* Outline: Same as secondary - Theme-aware outlined style */
  &--outline {
    background-color: tokens.$color-white;
    color: var(--zeno-color-accent-text);
    border: 1.5px solid var(--zeno-color-accent-solid);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    &:hover:not(&--disabled):not(&--loading) {
      background-color: rgba(var(--zeno-color-accent-solid), 0.05);
      border-color: var(--zeno-color-neutral-solid);
      color: var(--zeno-color-neutral-text);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(var(--zeno-color-accent-solid), 0.15);
    }

    &:active:not(&--disabled):not(&--loading) {
      transform: translateY(0);
      background-color: rgba(var(--zeno-color-accent-solid), 0.1);
      box-shadow: 0 1px 2px rgba(var(--zeno-color-accent-solid), 0.2);
    }
  }

  /* Tertiary: Low-emphasis outlined - Apple style minimal */
  &--tertiary {
    background-color: transparent;
    color: var(--zeno-color-text-secondary);
    border: 1px solid var(--zeno-color-border-subtle);

    &:hover:not(&--disabled):not(&--loading) {
      background-color: var(--zeno-color-background-subtle);
      border-color: var(--zeno-color-border-default);
      color: var(--zeno-color-text-primary);
    }

    &:active:not(&--disabled):not(&--loading) {
      background-color: var(--zeno-color-background-surface);
    }
  }

  /* Accent actions */
  &--accent {
    background: tokens.$color-accent;
    color: tokens.$color-white;
    box-shadow:
      0 2px 8px rgba(tokens.$color-accent, 0.3),
      0 1px 3px rgba(0, 0, 0, 0.1);

    &:hover:not(&--disabled):not(&--loading) {
      background: tokens.$color-accent;
      filter: brightness(1.15);
      transform: translateY(-1px) scale(1.02);
      box-shadow:
        0 4px 16px rgba(tokens.$color-accent, 0.4),
        0 2px 6px rgba(0, 0, 0, 0.15);
    }

    &:active:not(&--disabled):not(&--loading) {
      transform: translateY(0) scale(1);
      filter: brightness(0.95);
      box-shadow:
        0 1px 4px rgba(tokens.$color-accent, 0.5),
        0 1px 2px rgba(0, 0, 0, 0.2);
    }
  }

  /* Destructive: Critical actions with careful color theory */
  &--destructive {
    background-color: var(--zeno-color-danger-solid);
    color: var(--zeno-color-accent-on-solid);
    box-shadow:
      0 2px 8px rgba(220, 38, 38, 0.2),
      0 1px 3px rgba(0, 0, 0, 0.1);

    &:hover:not(&--disabled):not(&--loading) {
      background-color: var(--zeno-color-danger-solid-hover);
      transform: translateY(-1px);
      box-shadow:
        0 4px 16px rgba(220, 38, 38, 0.3),
        0 2px 6px rgba(0, 0, 0, 0.15);
    }

    &:active:not(&--disabled):not(&--loading) {
      background-color: var(--zeno-color-danger-solid-active);
      transform: translateY(0);
    }
  }

  /* Ghost: Minimal emphasis - breatheable whitespace priority */
  &--ghost {
    background-color: transparent;
    color: var(--zeno-color-text-secondary);

    &:hover:not(&--disabled):not(&--loading) {
      background-color: rgba(var(--zeno-color-accent-solid), 0.08);
      color: var(--zeno-color-text-primary);
    }

    &:active:not(&--disabled):not(&--loading) {
      background-color: rgba(var(--zeno-color-accent-solid), 0.12);
    }
  }

  /* Link: Text-like actions with focused interaction design */
  &--link {
    background-color: transparent;
    color: var(--zeno-color-accent-text);
    padding: tokens.$spacing-2 tokens.$spacing-3;
    min-height: auto;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;

    &:hover:not(&--disabled):not(&--loading) {
      color: var(--zeno-color-neutral-text);
      text-decoration-thickness: 2px;
    }

    &:active:not(&--disabled):not(&--loading) {
      color: var(--zeno-color-accent-text);
    }
  }

  /* State modifiers - enhanced accessibility and feedback responsiveness */
  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background-color: var(--zeno-color-background-subtle) !important;
    color: var(--zeno-color-text-tertiary) !important;
    border-color: var(--zeno-color-border-subtle) !important;
    box-shadow: none !important;
    transform: none !important;

    &:hover {
      transform: none !important;
    }
  }

  &--loading {
    cursor: progress;

    .z-button__content {
      opacity: 0.7;
    }
  }

  &--pressed {
    background-color: var(--zeno-color-accent-solid) !important;
    color: var(--zeno-color-text-inverse) !important;
    transform: scale(0.98);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &--full-width {
    width: 100%;
    justify-content: center;
  }

  &--elevated {
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      0 2px 6px rgba(0, 0, 0, 0.1);

    &:hover:not(&--disabled):not(&--loading) {
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.2),
        0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

/* Content structure - systematic information architecture */
.z-button__content {
  display: flex;
  align-items: center;
  transition: opacity tokens.$motion-duration-md tokens.$motion-easing-ease-out;

  &--hidden {
    opacity: 0;
  }
}

.z-button__icon,
.z-button__trailing {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;

  .z-button--sm & {
    width: 16px;
    height: 16px;
  }

  .z-button--lg & {
    width: 20px;
    height: 20px;
  }

  .z-button--xl & {
    width: 24px;
    height: 24px;
  }
}

/* Loading spinner - smooth micro-interaction */
.z-button__spinner {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  animation: button-rotate 1.4s linear infinite;

  .z-button--sm & {
    width: 16px;
    height: 16px;
  }

  .z-button--lg & {
    width: 20px;
    height: 20px;
  }

  .z-button--xl & {
    width: 24px;
    height: 24px;
  }
}

.z-button__spinner-svg {
  width: 100%;
  height: 100%;

  circle {
    stroke-dasharray: 62.83185307179586;
    stroke-dashoffset: 0;
    transform-origin: center;
    animation: button-stroke 1.4s ease-in-out infinite;
  }
}

/* Material Design inspired ripple effect */
.z-button__ripple-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
}

.z-button__ripple {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  opacity: 0;
  pointer-events: none;
  transform: scale(0);
  animation: button-ripple 600ms tokens.$motion-easing-ease-out;
}

/* Ripple opacity variants */
.z-button--primary .z-button__ripple,
.z-button--accent .z-button__ripple,
.z-button--destructive .z-button__ripple {
  background: rgba(255, 255, 255, 0.3);
}

.z-button--secondary .z-button__ripple,
.z-button--outline .z-button__ripple,
.z-button--tertiary .z-button__ripple {
  background: currentColor;
  opacity: 0.1;
}

.z-button--ghost .z-button__ripple {
  background: currentColor;
  opacity: 0.08;
}

/* Keyframe animations */
@keyframes button-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes button-stroke {
  0% {
    stroke-dashoffset: 62.83185307179586;
  }
  50% {
    stroke-dashoffset: 15.707963267948966;
    transform: rotate(135deg);
  }
  100% {
    stroke-dashoffset: 62.83185307179586;
    transform: rotate(450deg);
  }
}

@keyframes button-ripple {
  0% {
    opacity: 0.4;
    transform: scale(0);
  }
  100% {
    opacity: 0;
    transform: scale(4);
  }
}

/* Vue transition classes */
.button-fade-enter-active,
.button-fade-leave-active {
  transition: opacity tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

.button-fade-enter-from,
.button-fade-leave-to {
  opacity: 0;
}

.button-scale-enter-active,
.button-scale-leave-active {
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

.button-scale-enter-from,
.button-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Responsive design - content prioritization at different viewports */
@media (max-width: 768px) {
  .z-button {
    /* Enhanced touch targets for mobile */
    min-height: 48px;

    &--sm {
      min-height: 44px;
    }

    &--lg,
    &--xl {
      min-height: 52px;
    }
  }
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-button {
    transition:
      color 0.15s ease,
      background-color 0.15s ease;

    &:hover:not(&--disabled):not(&--loading) {
      transform: none;
    }

    &:active:not(&--disabled):not(&--loading) {
      transform: none;
    }
  }

  .z-button__spinner-svg animate {
    animation-duration: 3s;
  }
}
</style>

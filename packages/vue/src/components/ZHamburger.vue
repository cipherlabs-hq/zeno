<template>
  <button
    type="button"
    class="z-hamburger"
    :class="[
      `z-hamburger--${variant}`,
      `z-hamburger--${size}`,
      { 'z-hamburger--active': isOpen },
    ]"
    :aria-expanded="isOpen"
    :aria-label="ariaLabel"
    @click="handleToggle"
  >
    <component
      :is="currentIcon"
      :size="iconSize"
      :stroke-width="strokeWidth"
      class="z-hamburger__icon"
    />

    <!-- Screen reader text -->
    <span class="z-hamburger__sr-text">
      {{ isOpen ? 'Close menu' : 'Open menu' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Menu, X } from 'lucide-vue-next';
import type { ComponentSize } from '../types';

// Extend ComponentSize to include larger sizes
type HamburgerSize = ComponentSize | 'xxl' | 'xxxl';

export interface ZHamburgerProps {
  /** Whether the hamburger is in open (X) state */
  isOpen?: boolean;
  /** Custom aria-label for accessibility */
  ariaLabel?: string;
  /** Size variant - xs to xxxl */
  size?: HamburgerSize;
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface ZHamburgerEmits {
  /** Emitted when hamburger is clicked */
  toggle: [isOpen: boolean];
}

const props = withDefaults(defineProps<ZHamburgerProps>(), {
  isOpen: false,
  ariaLabel: '',
  size: 'md',
  variant: 'primary',
});

const emit = defineEmits<ZHamburgerEmits>();

// Current icon based on state
const currentIcon = computed(() => (props.isOpen ? X : Menu));

// Icon sizes based on button size
const iconSize = computed(() => {
  switch (props.size) {
    case 'xs':
      return 12;
    case 'sm':
      return 16;
    case 'md':
      return 20;
    case 'lg':
      return 24;
    case 'xl':
      return 28;
    case 'xxl':
      return 32;
    case 'xxxl':
      return 36;
    default:
      return 20;
  }
});

// Stroke width scales with size
const strokeWidth = computed(() => {
  switch (props.size) {
    case 'xs':
      return 1.5;
    case 'sm':
      return 2;
    case 'md':
      return 2.5;
    case 'lg':
      return 3;
    case 'xl':
      return 3.5;
    case 'xxl':
      return 4;
    case 'xxxl':
      return 4.5;
    default:
      return 2.5;
  }
});

// Computed aria-label
const ariaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel;
  return props.isOpen ? 'Close navigation menu' : 'Open navigation menu';
});

// Handle toggle click
const handleToggle = () => {
  emit('toggle', !props.isOpen);
};
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as zeno;

.z-hamburger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1); // ≤ 250ms as per requirement
  position: relative;
  font-weight: 500;
  outline: none;

  &:focus-visible {
    outline: 2px solid var(--zeno-color-accent-solid);
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }

  // Size variants - t-shirt sizing from xs to xxxl
  &.z-hamburger--xs {
    width: 20px;
    height: 20px;
    padding: 2px;
  }

  &.z-hamburger--sm {
    width: 28px;
    height: 28px;
    padding: 4px;
  }

  &.z-hamburger--md {
    width: 36px;
    height: 36px;
    padding: 6px;
  }

  &.z-hamburger--lg {
    width: 44px;
    height: 44px;
    padding: 8px;
  }

  &.z-hamburger--xl {
    width: 52px;
    height: 52px;
    padding: 10px;
  }

  &.z-hamburger--xxl {
    width: 60px;
    height: 60px;
    padding: 12px;
  }

  &.z-hamburger--xxxl {
    width: 68px;
    height: 68px;
    padding: 14px;
  }

  // Variant styles
  &.z-hamburger--primary {
    background: var(--zeno-color-accent-solid);
    color: var(--zeno-color-text-inverse);

    &:hover {
      background: var(--zeno-color-accent-solid-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  &.z-hamburger--secondary {
    background: var(--zeno-color-background-surface);
    border-color: var(--zeno-color-background-subtle);
    color: var(--zeno-color-text-primary);

    &:hover {
      background: var(--zeno-color-background-subtle);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  &.z-hamburger--ghost {
    background: transparent;
    color: var(--zeno-color-accent-text);

    &:hover {
      background: var(--zeno-color-background-subtle);
      transform: translateY(-2px);
    }
  }
}

.z-hamburger__icon {
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1); // ≤ 250ms transition

  .z-hamburger--active & {
    transform: rotate(90deg);
  }
}

.z-hamburger__sr-text {
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

// High contrast mode support
@media (prefers-contrast: high) {
  .z-hamburger {
    border-width: 2px;
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .z-hamburger,
  .z-hamburger__icon {
    transition: none;
  }
}
</style>

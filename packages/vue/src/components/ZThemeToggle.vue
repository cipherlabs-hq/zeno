<template>
  <button
    class="z-theme-toggle"
    type="button"
    :aria-label="ariaLabel"
    :title="buttonTitle"
    @click="toggleTheme"
  >
    <!-- Light mode icon -->
    <svg
      v-if="!isDark"
      class="z-theme-toggle__icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" />
      <path
        d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
        stroke="currentColor"
        stroke-width="2"
      />
    </svg>

    <!-- Dark mode icon -->
    <svg
      v-else
      class="z-theme-toggle__icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor"
        stroke-width="2"
        fill="currentColor"
      />
    </svg>

    <!-- Optional text label -->
    <span v-if="showLabel" class="z-theme-toggle__label">
      {{ isDark ? lightLabel : darkLabel }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeToggle } from '@usezeno/composables';
import type { ZComponentBase } from '../types';

export interface ZThemeToggleProps extends ZComponentBase {
  /** Show text label next to icon */
  showLabel?: boolean;
  /** Label text for switching to light mode */
  lightLabel?: string;
  /** Label text for switching to dark mode */
  darkLabel?: string;
  /** Custom aria-label for accessibility */
  ariaLabel?: string;
  /** Custom button title for tooltips */
  title?: string;
}

const props = withDefaults(defineProps<ZThemeToggleProps>(), {
  showLabel: false,
  lightLabel: 'Light',
  darkLabel: 'Dark',
  ariaLabel: '',
  title: '',
});

// Use the theme toggle composable
const { isDark, toggleTheme } = useThemeToggle();

// Computed properties for accessibility
const ariaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel;
  return isDark.value
    ? `Switch to ${props.lightLabel} mode`
    : `Switch to ${props.darkLabel} mode`;
});

const buttonTitle = computed(() => {
  if (props.title) return props.title;
  return isDark.value
    ? `Switch to ${props.lightLabel} mode`
    : `Switch to ${props.darkLabel} mode`;
});
</script>

<style lang="scss" scoped>
.z-theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--zeno-color-accent-solid);
  border-radius: 0.375rem;
  color: var(--zeno-color-accent-solid-hover);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.1s ease;

  &:hover {
    background-color: var(--zeno-color-accent-solid);
    color: var(--zeno-color-accent-on-solid);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid var(--zeno-color-accent-solid);
    outline-offset: 2px;
  }

  // Dark theme styles
  [data-theme='dark'] & {
    border-color: var(--zeno-color-accent-solid);
    color: var(--zeno-color-accent-on-solid);

    &:hover {
      background-color: var(--zeno-color-accent-solid);
      color: var(--zeno-color-text-primary);
    }

    &:focus {
      outline-color: var(--zeno-color-accent-solid);
    }
  }
}

.z-theme-toggle__icon {
  flex-shrink: 0;
  transition: transform 0.2s ease;

  .z-theme-toggle:hover & {
    transform: rotate(180deg);
  }
}

.z-theme-toggle__label {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

// Size variants
.z-theme-toggle--sm {
  padding: 0.25rem;

  .z-theme-toggle__icon {
    width: 16px;
    height: 16px;
  }

  .z-theme-toggle__label {
    font-size: 0.75rem;
  }
}

.z-theme-toggle--lg {
  padding: 0.75rem;

  .z-theme-toggle__icon {
    width: 24px;
    height: 24px;
  }

  .z-theme-toggle__label {
    font-size: 1rem;
  }
}
</style>

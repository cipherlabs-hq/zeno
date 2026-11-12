<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :class="cardClasses"
    :style="cardStyles"
    :data-elevation="elevation"
    :tabindex="clickable ? 0 : undefined"
    :role="clickable ? 'button' : undefined"
    :aria-pressed="selected ? 'true' : undefined"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @click="handleClick"
  >
    <!-- Loading overlay -->
    <Transition name="card-fade">
      <div v-if="loading" class="z-card__loading" aria-hidden="true">
        <div class="z-card__loading-spinner"></div>
      </div>
    </Transition>

    <!-- Cover image -->
    <div v-if="hasCover" class="z-card__cover">
      <slot name="cover">
        <img
          v-if="coverImage"
          :src="coverImage"
          :alt="coverImageAlt"
          class="z-card__cover-image"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </slot>
      <div v-if="coverOverlay" class="z-card__cover-overlay"></div>
    </div>

    <!-- Header with optional image/icon -->
    <header v-if="hasHeader" class="z-card__header" :class="headerClasses">
      <div v-if="hasAvatar" class="z-card__avatar">
        <slot name="avatar">
          <img
            v-if="avatar"
            :src="avatar"
            :alt="avatarAlt"
            class="z-card__avatar-image"
          />
        </slot>
      </div>

      <div class="z-card__header-content">
        <slot name="header">
          <h3 v-if="title" class="z-card__title">{{ title }}</h3>
          <p v-if="subtitle" class="z-card__subtitle">{{ subtitle }}</p>
        </slot>
      </div>

      <div v-if="hasHeaderAction" class="z-card__header-action">
        <slot name="header-action" />
      </div>
    </header>

    <!-- Main content -->
    <main class="z-card__content" :class="contentClasses">
      <Transition name="card-content" mode="out-in">
        <div v-if="!loading || !hideContentOnLoad" key="content">
          <slot />
        </div>
        <div v-else key="skeleton" class="z-card__skeleton">
          <slot name="skeleton">
            <div class="z-card__skeleton-line"></div>
            <div class="z-card__skeleton-line"></div>
            <div
              class="z-card__skeleton-line z-card__skeleton-line--short"
            ></div>
          </slot>
        </div>
      </Transition>
    </main>

    <!-- Actions footer -->
    <footer v-if="hasFooter" class="z-card__footer">
      <slot name="footer">
        <div v-if="hasActions" class="z-card__actions">
          <slot name="actions" />
        </div>
      </slot>
    </footer>

    <!-- Selection indicator -->
    <Transition name="card-check">
      <div
        v-if="selectable && selected"
        class="z-card__check"
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      </div>
    </Transition>
  </component>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useSlots } from 'vue';
import type { ZCardProps, CardElevation } from '../types/layout';
import type { ZCardEmits } from '../types/events';

// Re-export types for backward compatibility
export type { ZCardProps, CardElevation };

const props = withDefaults(defineProps<ZCardProps>(), {
  elevation: 1,
  outlined: false,
  interactive: true,
  clickable: false,
  selectable: false,
  selected: false,
  loading: false,
  hideContentOnLoad: false,
  size: 'default',
  variant: 'default',
  fullWidth: false,
  coverImageAlt: '',
  coverOverlay: false,
  avatarAlt: '',
  noAnimation: false,
});

const emit = defineEmits<
  ZCardEmits & {
    'update:selected': [value: boolean];
    'image-load': [];
    'image-error': [event: Event];
  }
>();

// Get slots
const slots = useSlots();

// State
const isHovered = ref(false);
const isVisible = ref(false);
const isPressed = ref(false);
const imageLoaded = ref(false);
const imageError = ref(false);

// Slot checks
const hasCover = computed(() => props.coverImage || !!slots.cover);
const hasHeader = computed(
  () => !!slots.header || props.title || props.subtitle
);
const hasAvatar = computed(() => props.avatar || !!slots.avatar);
const hasHeaderAction = computed(() => !!slots['header-action']);
const hasFooter = computed(() => !!slots.footer || !!slots.actions);
const hasActions = computed(() => !!slots.actions);

/**
 * Handle mouse enter for hover elevation
 */
function handleMouseEnter() {
  if ((props.interactive || props.clickable) && !props.outlined) {
    isHovered.value = true;
  }
}

/**
 * Handle mouse leave for hover elevation
 */
function handleMouseLeave() {
  if ((props.interactive || props.clickable) && !props.outlined) {
    isHovered.value = false;
  }
  isPressed.value = false;
}

/**
 * Handle mouse down for press effect
 */
function handleMouseDown() {
  if (props.clickable) {
    isPressed.value = true;
  }
}

/**
 * Handle mouse up
 */
function handleMouseUp() {
  isPressed.value = false;
}

/**
 * Handle click
 */
function handleClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event);
  }
  if (props.selectable) {
    emit('update:selected', !props.selected);
  }
}

/**
 * Handle image load
 */
function handleImageLoad() {
  imageLoaded.value = true;
  emit('image-load');
}

/**
 * Handle image error
 */
function handleImageError(event: Event) {
  imageError.value = true;
  emit('image-error', event);
}

/**
 * Computed classes for the card
 */
const cardClasses = computed(() => [
  'z-card',
  `z-card--${props.size}`,
  `z-card--${props.variant}`,
  {
    'z-card--outlined': props.outlined,
    'z-card--interactive': props.interactive && !props.clickable,
    'z-card--clickable': props.clickable,
    'z-card--selectable': props.selectable,
    'z-card--selected': props.selected,
    'z-card--hovered': isHovered.value,
    'z-card--pressed': isPressed.value,
    'z-card--visible': isVisible.value,
    'z-card--loading': props.loading,
    'z-card--has-cover': hasCover.value,
    'z-card--has-avatar': hasAvatar.value,
    'z-card--no-animation': props.noAnimation,
    'z-card--full-width': props.fullWidth,
  },
]);

const headerClasses = computed(() => ({
  'z-card__header--with-avatar': hasAvatar.value,
}));

const contentClasses = computed(() => ({
  'z-card__content--loading': props.loading && props.hideContentOnLoad,
}));

/**
 * Computed styles for the card using design tokens
 */
const cardStyles = computed(() => {
  const styles: Record<string, string> = {};

  // Shadow elevation mapping to design tokens
  const shadowMap: Record<CardElevation, string> = {
    0: 'none',
    1: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    2: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    3: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    4: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    5: '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
  };

  // Hover elevation (one level higher)
  const hoverShadowMap: Record<CardElevation, string> = {
    0: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    1: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    2: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    3: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    4: '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    5: '0 35px 60px -15px rgba(0, 0, 0, 0.3)', // Max elevation
  };

  // Apply shadow based on hover state
  if (isHovered.value && props.interactive && !props.outlined) {
    styles.boxShadow = hoverShadowMap[props.elevation];
    styles.transform = 'translateY(-2px)';
  } else {
    styles.boxShadow = props.outlined ? 'none' : shadowMap[props.elevation];
    styles.transform = 'translateY(0)';
  }

  return styles;
});

/**
 * Mount animation with tokenized duration
 */
onMounted(() => {
  // Trigger enter animation on next tick
  requestAnimationFrame(() => {
    isVisible.value = true;
  });
});
</script>

<style scoped lang="scss">
@use '../tokens.scss' as tokens;

/* Card Component
 * Principles: Content-first layouts, breathable whitespace, sophisticated elevation
 * Accessibility: WCAG 2.1 Level AA compliance, proper focus states, semantic HTML
 * Motion: Physics-based transitions for spatial continuity
 */

.z-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--zeno-color-background-surface);
  color: var(--zeno-color-text-primary);
  border-radius: tokens.$radius-lg; /* 16px - Modern corner radius */
  overflow: hidden;
  border: none;
  transition: all tokens.$motion-duration-lg cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Initial state for mount animation */
  opacity: 0;
  transform: translateY(12px) scale(0.98);

  /* Custom CSS properties for theming */
  --card-bg: var(--zeno-color-background-surface);
  --card-text-primary: var(--zeno-color-text-primary);
  --card-text-secondary: var(--zeno-color-text-secondary);
  --card-text-on-brand: var(--zeno-color-text-inverse);
  --card-border: var(--zeno-color-border-default);
  --card-shadow: tokens.$elevation-shadow-sm;

  /* Apple-style shadow system */
  box-shadow:
    0 0.5px 2px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.02);

  /* Size variants */
  &--sm {
    max-width: 320px;
  }

  &--default {
    max-width: 400px;
  }

  &--lg {
    max-width: 600px;
  }

  /* Full width variant - removes max-width constraint */
  &--full-width {
    max-width: none;
    width: 100%;
  }

  &--visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  &--outlined {
    border: 2px solid var(--zeno-color-border-default);
    box-shadow: none !important;
    background: var(--card-bg);

    &:hover {
      border-color: var(--zeno-color-border-strong);
    }
  }

  /* Variant: Brand */
  &--brand {
    background: linear-gradient(
      135deg,
      tokens.$color-accent 0%,
      tokens.$color-accent-hover 100%
    );
    --card-bg: transparent;
    --card-text-primary: tokens.$color-white;
    --card-text-secondary: rgba(255, 255, 255, 0.85);
    --card-text-on-brand: tokens.$color-white;
    --card-border: rgba(255, 255, 255, 0.2);

    /* Enhanced shadow for brand cards */
    box-shadow:
      0 4px 12px rgba(tokens.$color-accent-hover, 0.3),
      0 12px 32px rgba(tokens.$color-accent, 0.2);
  }

  /* Variant: Glass - Apple-inspired glassmorphism */
  &--glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    --card-shadow:
      0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);

    /* Glass effect in dark mode */
  }

  /* Variant: Gradient */
  &--gradient {
    background: linear-gradient(
      135deg,
      var(--zeno-color-background-surface) 0%,
      var(--zeno-color-background-subtle) 100%
    );
    border: 1px solid transparent;
    background-clip: padding-box;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(
        135deg,
        var(--zeno-color-accent-solid),
        var(--zeno-color-accent-solid)
      );
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }
  }

  /* Interactive states */
  &--interactive,
  &--clickable {
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    &:hover:not(.z-card--disabled) {
      transform: translateY(-2px) scale(1.01);
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.08),
        0 8px 24px rgba(0, 0, 0, 0.06),
        0 16px 48px rgba(0, 0, 0, 0.04);
    }

    &:active:not(.z-card--disabled) {
      transform: translateY(0) scale(0.99);
      transition-duration: tokens.$motion-duration-xs;
    }
  }

  /* Pressed state for toggle buttons */
  &--pressed {
    transform: scale(0.98);
    box-shadow:
      inset 0 2px 4px rgba(0, 0, 0, 0.1),
      0 1px 2px rgba(0, 0, 0, 0.05);
  }

  /* Selected state */
  &--selected {
    border: 2px solid var(--zeno-color-accent-solid);
    box-shadow:
      0 0 0 4px rgba(var(--zeno-color-accent-solid), 0.1),
      var(--card-shadow);

    &:hover {
      border-color: var(--zeno-color-accent-solid);
    }
  }

  /* Loading state */
  &--loading {
    pointer-events: none;

    .z-card__content {
      opacity: 0.6;
    }
  }

  /* Focus state for accessibility */
  &--clickable:focus-visible,
  &--selectable:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px var(--zeno-color-background-surface),
      0 0 0 4px var(--zeno-color-accent-solid),
      var(--card-shadow);
  }

  /* Loading overlay */
  .z-card__loading {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .z-card__loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--zeno-color-border-subtle);
    border-top-color: var(--zeno-color-accent-solid);
    border-radius: 50%;
    animation: card-spin 0.8s linear infinite;
  }

  @keyframes card-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Cover image */
  .z-card__cover {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    flex-shrink: 0;

    .z-card--lg & {
      height: 300px;
    }
  }

  .z-card__cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform tokens.$motion-duration-xl
      tokens.$motion-easing-ease-out;

    .z-card--interactive:hover & {
      transform: scale(1.05);
    }
  }

  .z-card__cover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
    pointer-events: none;
  }

  /* Header section */
  .z-card__header {
    display: flex;
    align-items: center;
    gap: tokens.$spacing-4;
    padding: tokens.$spacing-5 tokens.$spacing-6;
    min-height: 72px;

    &--with-avatar {
      padding: tokens.$spacing-4 tokens.$spacing-5;
    }

    .z-card--sm & {
      padding: tokens.$spacing-4 tokens.$spacing-5;
      min-height: 64px;
    }

    .z-card--lg & {
      padding: tokens.$spacing-6 tokens.$spacing-8;
      min-height: 80px;
    }
  }

  /* Avatar */
  .z-card__avatar {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: tokens.$radius-full;
    overflow: hidden;
    background: var(--zeno-color-background-subtle);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .z-card--sm & {
      width: 40px;
      height: 40px;
    }

    .z-card--lg & {
      width: 56px;
      height: 56px;
    }
  }

  .z-card__avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Header content */
  .z-card__header-content {
    flex: 1;
    min-width: 0;
  }

  .z-card__title {
    margin: 0;
    font-size: tokens.$typography-font-size-lg;
    font-weight: tokens.$typography-font-weight-semibold;
    line-height: tokens.$typography-line-height-tight;
    color: var(--card-text-primary);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;

    .z-card--lg & {
      font-size: tokens.$typography-font-size-xl;
    }
  }

  .z-card__subtitle {
    margin: tokens.$spacing-1 0 0;
    font-size: tokens.$typography-font-size-sm;
    font-weight: tokens.$typography-font-weight-normal;
    line-height: tokens.$typography-line-height-normal;
    color: var(--card-text-secondary);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  /* Header action */
  .z-card__header-action {
    flex-shrink: 0;
    margin-left: auto;
  }

  /* Main content */
  .z-card__content {
    flex: 1;
    padding: tokens.$spacing-6;
    line-height: tokens.$typography-line-height-relaxed;
    font-size: tokens.$typography-font-size-md;
    color: var(--card-text-primary);
    transition: opacity tokens.$motion-duration-md
      tokens.$motion-easing-ease-out;

    .z-card--sm & {
      padding: tokens.$spacing-5;
      font-size: tokens.$typography-font-size-sm;
    }

    .z-card--lg & {
      padding: tokens.$spacing-8;
    }

    &--loading {
      opacity: 0.4;
    }
  }

  /* Skeleton loading */
  .z-card__skeleton {
    display: flex;
    flex-direction: column;
    gap: tokens.$spacing-3;
  }

  .z-card__skeleton-line {
    height: 16px;
    background: linear-gradient(
      90deg,
      var(--zeno-color-background-subtle) 0%,
      var(--zeno-color-background-muted) 50%,
      var(--zeno-color-background-subtle) 100%
    );
    background-size: 200% 100%;
    border-radius: tokens.$radius-sm;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;

    &--short {
      width: 60%;
    }
  }

  @keyframes skeleton-shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* Footer section */
  .z-card__footer {
    padding: tokens.$spacing-4 tokens.$spacing-6;
    border-top: 1px solid var(--card-border);
    background: rgba(var(--zeno-color-background-subtle), 0.5);
    backdrop-filter: blur(8px);
    min-height: 64px;

    .z-card--sm & {
      padding: tokens.$spacing-3 tokens.$spacing-5;
      min-height: 56px;
    }

    .z-card--lg & {
      padding: tokens.$spacing-5 tokens.$spacing-8;
      min-height: 72px;
    }

    .z-card--brand & {
      background: rgba(0, 0, 0, 0.1);
      border-top-color: var(--card-border);
    }
  }

  .z-card__actions {
    display: flex;
    align-items: center;
    gap: tokens.$spacing-3;
    width: 100%;
  }

  /* Selection check */
  .z-card__check {
    position: absolute;
    top: tokens.$spacing-4;
    right: tokens.$spacing-4;
    width: 32px;
    height: 32px;
    background: var(--zeno-color-accent-solid);
    color: var(--zeno-color-accent-on-solid);
    border-radius: tokens.$radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 5;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  /* Elevation system - Apple-inspired shadow depths */
  .z-card[data-elevation='0'] {
    box-shadow: none;
  }

  .z-card[data-elevation='1'] {
    box-shadow:
      0 0.5px 2px rgba(0, 0, 0, 0.06),
      0 2px 8px rgba(0, 0, 0, 0.04),
      0 8px 24px rgba(0, 0, 0, 0.02);
  }

  .z-card[data-elevation='2'] {
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(0, 0, 0, 0.06),
      0 12px 32px rgba(0, 0, 0, 0.04);
  }

  .z-card[data-elevation='3'] {
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.1),
      0 8px 24px rgba(0, 0, 0, 0.08),
      0 24px 48px rgba(0, 0, 0, 0.06);
  }

  .z-card[data-elevation='4'] {
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.12),
      0 16px 32px rgba(0, 0, 0, 0.1),
      0 32px 64px rgba(0, 0, 0, 0.08);
  }

  .z-card[data-elevation='5'] {
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.16),
      0 24px 48px rgba(0, 0, 0, 0.14),
      0 48px 96px rgba(0, 0, 0, 0.12);
  }

  /* Transitions */
  .card-fade-enter-active,
  .card-fade-leave-active {
    transition: opacity tokens.$motion-duration-md
      tokens.$motion-easing-ease-out;
  }

  .card-fade-enter-from,
  .card-fade-leave-to {
    opacity: 0;
  }

  .card-content-enter-active,
  .card-content-leave-active {
    transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  }

  .card-content-enter-from {
    opacity: 0;
    transform: translateY(4px);
  }

  .card-content-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }

  .card-check-enter-active {
    transition: all tokens.$motion-duration-lg cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .card-check-leave-active {
    transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  }

  .card-check-enter-from {
    opacity: 0;
    transform: scale(0.6);
  }

  .card-check-leave-to {
    opacity: 0;
    transform: scale(0.8);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .z-card,
    .z-card__cover-image,
    .z-card__loading-spinner {
      transition: none;
    }

    .z-card__skeleton-line {
      animation: none;
      opacity: 0.6;
    }

    .card-fade-enter-active,
    .card-fade-leave-active,
    .card-content-enter-active,
    .card-content-leave-active,
    .card-check-enter-active,
    .card-check-leave-active {
      transition: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .z-card {
      border: 2px solid var(--zeno-color-border-strong);

      &--selected {
        border-width: 3px;
      }
    }

    .z-card--clickable:focus-visible,
    .z-card--selectable:focus-visible {
      outline: 3px solid var(--zeno-color-accent-solid);
      outline-offset: 2px;
    }
  }

  /* Touch device optimizations */
  @media (hover: none) {
    .z-card--interactive:active,
    .z-card--clickable:active {
      transform: scale(0.98);
    }
  }
}
</style>

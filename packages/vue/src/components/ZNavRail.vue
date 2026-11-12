<template>
  <nav
    class="z-nav-rail"
    :class="{
      'z-nav-rail--collapsed': collapsed,
      'z-nav-rail--floating': floating,
      'z-nav-rail--elevated': elevated,
    }"
    role="navigation"
    :aria-label="ariaLabel"
  >
    <!-- Backdrop blur for floating rail -->
    <div v-if="floating" class="z-nav-rail__backdrop"></div>

    <div class="z-nav-rail__container">
      <!-- Header/Logo Section with enhanced spacing -->
      <div v-if="$slots.header" class="z-nav-rail__header">
        <slot name="header" :collapsed="collapsed" />
      </div>

      <!-- Main Navigation Items -->
      <ul class="z-nav-rail__items" role="list">
        <li
          v-for="(item, index) in items"
          :key="item.id || index"
          class="z-nav-rail__item"
        >
          <component
            :is="item.href ? 'a' : 'button'"
            :href="item.href"
            :class="[
              'z-nav-rail__link',
              {
                'z-nav-rail__link--active': activeItem === item.id,
                'z-nav-rail__link--disabled': item.disabled,
                'z-nav-rail__link--has-badge': item.badge && !collapsed,
              },
            ]"
            :aria-current="activeItem === item.id ? 'page' : undefined"
            :disabled="item.disabled"
            @click="handleItemClick(item)"
          >
            <!-- Icon with enhanced visual hierarchy -->
            <span
              class="z-nav-rail__icon"
              :aria-hidden="collapsed ? 'false' : 'true'"
            >
              <component
                :is="item.icon"
                v-if="item.icon"
                class="z-nav-rail__icon-svg"
              />
              <span v-else class="z-nav-rail__icon-placeholder">
                {{ item.label?.[0] || '•' }}
              </span>
            </span>

            <!-- Label with enhanced motion animation -->
            <Transition
              name="z-nav-rail-label"
              @before-enter="onBeforeEnter"
              @enter="onEnter"
              @leave="onLeave"
            >
              <span v-if="!collapsed" class="z-nav-rail__label">
                {{ item.label }}
              </span>
            </Transition>

            <!-- Enhanced Badge with better positioning -->
            <Transition name="z-nav-rail-badge">
              <span
                v-if="item.badge"
                class="z-nav-rail__badge"
                :class="{
                  'z-nav-rail__badge--dot': typeof item.badge === 'boolean',
                }"
                :aria-label="
                  typeof item.badge === 'number'
                    ? `${item.badge} notifications`
                    : 'New notification'
                "
              >
                <span
                  v-if="typeof item.badge === 'number'"
                  class="z-nav-rail__badge-text"
                >
                  {{ item.badge > 99 ? '99+' : item.badge }}
                </span>
              </span>
            </Transition>

            <!-- Active indicator with enhanced animation -->
            <span
              v-if="activeItem === item.id"
              class="z-nav-rail__active-indicator"
              aria-hidden="true"
            ></span>
          </component>
        </li>
      </ul>

      <!-- Divider between main and secondary items -->
      <div v-if="secondaryItems?.length" class="z-nav-rail__divider"></div>

      <!-- Secondary Navigation Items -->
      <ul
        v-if="secondaryItems?.length"
        class="z-nav-rail__secondary"
        role="list"
      >
        <li
          v-for="(item, index) in secondaryItems"
          :key="item.id || `secondary-${index}`"
          class="z-nav-rail__item"
        >
          <component
            :is="item.href ? 'a' : 'button'"
            :href="item.href"
            :class="[
              'z-nav-rail__link',
              'z-nav-rail__link--secondary',
              {
                'z-nav-rail__link--active': activeItem === item.id,
                'z-nav-rail__link--disabled': item.disabled,
              },
            ]"
            :aria-current="activeItem === item.id ? 'page' : undefined"
            :disabled="item.disabled"
            @click="handleItemClick(item)"
          >
            <span class="z-nav-rail__icon">
              <component
                :is="item.icon"
                v-if="item.icon"
                class="z-nav-rail__icon-svg"
              />
              <span v-else class="z-nav-rail__icon-placeholder">
                {{ item.label?.[0] || '•' }}
              </span>
            </span>

            <Transition name="z-nav-rail-label">
              <span v-if="!collapsed" class="z-nav-rail__label">
                {{ item.label }}
              </span>
            </Transition>
          </component>
        </li>
      </ul>

      <!-- Footer Section with enhanced styling -->
      <div v-if="$slots.footer" class="z-nav-rail__footer">
        <slot name="footer" :collapsed="collapsed" />
      </div>
    </div>

    <!-- Collapse/Expand Toggle -->
    <button
      v-if="collapsible"
      class="z-nav-rail__toggle"
      :aria-label="collapsed ? 'Expand navigation' : 'Collapse navigation'"
      @click="$emit('toggle')"
    >
      <svg
        class="z-nav-rail__toggle-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          :d="collapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useMotion } from '@usezeno/composables';
import type { ZNavRailProps, ZNavRailEmits, NavItem } from '../types';

withDefaults(defineProps<ZNavRailProps>(), {
  activeItem: '',
  collapsed: false,
  floating: false,
  elevated: false,
  collapsible: false,
  ariaLabel: 'Primary navigation',
});

const emit = defineEmits<ZNavRailEmits>();

// Use motion for label animations
const { onBeforeEnter, onEnter, onLeave } = useMotion({
  duration: 300,
  easing: 'ease-out',
});

// Handle item click
const handleItemClick = (item: NavItem) => {
  if (item.disabled) return;

  emit('item-click', item);
  emit('update:activeItem', item.id);
};
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Navigation Rail Component
 * Principles: Intuitive navigation, frictionless interaction, spatial continuity
 * Accessibility: WCAG 2.1 Level AA compliance, enhanced focus states
 * Design: Apple sidebar elegance, Google Material navigation patterns, Microsoft Fluent depth
 */

.z-nav-rail {
  /* Base foundation - content-first layout with strategic negative space */
  position: relative;
  display: flex;
  flex-direction: column;
  width: 280px; /* Enhanced width for better content breathing */
  min-height: 100vh;
  background-color: var(--zeno-color-background-surface);
  border-right: 1px solid var(--zeno-color-border-default);

  /* Physics-based motion choreography for spatial continuity */
  transition: all tokens.$motion-duration-lg tokens.$motion-easing-ease-out;
  will-change: width, transform, box-shadow;

  /* Enhanced visual hierarchy with purposeful accent placement */
  &--floating {
    position: fixed;
    top: tokens.$spacing-6; /* 24px */
    left: tokens.$spacing-6; /* 24px */
    bottom: tokens.$spacing-6; /* 24px */
    min-height: auto;
    border-radius: tokens.$radius-xxl; /* 24px - Apple-style rounded corners */
    border: 1px solid var(--zeno-color-border-subtle);
    box-shadow:
      0 20px 50px rgba(0, 0, 0, 0.08),
      0 8px 24px rgba(0, 0, 0, 0.06),
      0 2px 8px rgba(0, 0, 0, 0.04);
    z-index: 100;
  }

  &--elevated {
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 4px 16px rgba(0, 0, 0, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.04);
  }

  &--collapsed {
    width: 80px; /* Enhanced collapsed width for better touch targets */

    .z-nav-rail__label {
      opacity: 0;
      transform: translateX(-12px);
    }

    .z-nav-rail__badge--dot {
      opacity: 1; /* Keep dot badges visible in collapsed state */
      transform: scale(0.8);
    }

    .z-nav-rail__badge:not(.z-nav-rail__badge--dot) {
      opacity: 0;
      transform: scale(0.8);
    }
  }

  /* Responsive design - content prioritization at different viewports */
  @media (max-width: 1024px) {
    width: 80px; /* Auto-collapse on tablet */

    .z-nav-rail__label {
      opacity: 0;
      transform: translateX(-12px);
    }

    .z-nav-rail__badge:not(.z-nav-rail__badge--dot) {
      opacity: 0;
    }
  }

  @media (max-width: 768px) {
    &--floating {
      top: tokens.$spacing-4; /* 16px */
      left: tokens.$spacing-4; /* 16px */
      bottom: tokens.$spacing-4; /* 16px */
      width: 72px; /* Mobile optimized */
    }
  }
}

/* Backdrop blur for floating navigation - Microsoft Fluent glass morphism */
.z-nav-rail__backdrop {
  position: absolute;
  inset: 0;
  background: var(--zeno-color-background-surface);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border-radius: inherit;
  z-index: -1;
}

.z-nav-rail__container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: tokens.$spacing-6 0; /* 24px - generous breathing room */
  position: relative;
  z-index: 1;
}

/* Header section with enhanced typography hierarchy */
.z-nav-rail__header {
  padding: 0 tokens.$spacing-6 tokens.$spacing-8; /* 24px 32px */
  border-bottom: 1px solid var(--zeno-color-border-subtle);
  margin-bottom: tokens.$spacing-6; /* 24px */
}

/* Navigation items with systematic information architecture */
.z-nav-rail__items,
.z-nav-rail__secondary {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0 tokens.$spacing-4; /* 16px horizontal padding */
  display: flex;
  flex-direction: column;
  gap: tokens.$spacing-1; /* 4px - tighter clustering for navigation hierarchy */
}

.z-nav-rail__secondary {
  flex: none;
  margin-top: auto;
}

.z-nav-rail__item {
  margin: 0;
  padding: 0;
}

/* Navigation links - enhanced interaction design with feedback responsiveness */
.z-nav-rail__link {
  position: relative;
  display: flex;
  align-items: center;
  gap: tokens.$spacing-3; /* 12px - optimal cognitive spacing */
  width: 100%;
  padding: tokens.$spacing-3 tokens.$spacing-4; /* 12px 16px */
  border: none;
  border-radius: tokens.$radius-lg; /* 12px - Apple-style subtle rounded corners */
  background: transparent;
  color: var(--zeno-color-text-secondary);
  text-decoration: none;
  font-size: tokens.$typography-font-size-md; /* 16px */
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
  line-height: tokens.$typography-line-height-normal;
  cursor: pointer;
  user-select: none;
  overflow: hidden;

  /* Enhanced touch targets - Microsoft Fluent guidelines */
  min-height: 48px; /* Optimal touch target */
  touch-action: manipulation;

  /* Physics-based motion choreography */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  will-change: background-color, color, transform, box-shadow;

  /* Enhanced focus accessibility */
  &:focus-visible {
    outline: 3px solid var(--zeno-color-focus-ring);
    outline-offset: 2px;
    box-shadow: 0 0 0 6px rgba(75, 0, 110, 0.15);
    background-color: var(--zeno-color-background-subtle);
  }

  /* Hover state with spatial continuity */
  &:hover:not(.z-nav-rail__link--disabled) {
    background-color: var(--zeno-color-background-subtle);
    color: var(--zeno-color-text-primary);
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  /* Active state - bold simplicity with purposeful accent placement */
  &.z-nav-rail__link--active {
    background: var(--zeno-color-accent-solid);
    color: var(--zeno-color-text-inverse);
    font-weight: tokens.$typography-font-weight-semibold; /* 600 */
    box-shadow:
      0 4px 16px rgba(75, 0, 110, 0.25),
      0 2px 8px rgba(0, 0, 0, 0.1);

    /* Accent indicator */
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background: tokens.$color-accent;
      border-radius: 0 2px 2px 0;
      box-shadow: 0 0 8px rgba(tokens.$color-accent, 0.5);
    }

    &:hover {
      transform: translateY(-1px);
      box-shadow:
        0 6px 20px rgba(75, 0, 110, 0.3),
        0 3px 12px rgba(0, 0, 0, 0.15);
    }
  }

  /* Secondary navigation styling */
  &.z-nav-rail__link--secondary {
    font-size: tokens.$typography-font-size-sm; /* 14px */
    padding: tokens.$spacing-2 tokens.$spacing-4; /* 8px 16px */
    min-height: 40px;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }

  /* Disabled state - enhanced accessibility */
  &.z-nav-rail__link--disabled {
    cursor: not-allowed;
    opacity: 0.5;
    color: var(--zeno-color-text-tertiary);

    &:hover {
      background: transparent;
      transform: none;
      box-shadow: none;
    }
  }
}

/* Icon container with enhanced visual hierarchy */
.z-nav-rail__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transition: transform tokens.$motion-duration-md
    tokens.$motion-easing-ease-out;

  .z-nav-rail__link--active & {
    transform: scale(1.1);
  }
}

.z-nav-rail__icon-svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
  stroke: currentColor;
}

.z-nav-rail__icon-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--zeno-color-background-subtle);
  color: var(--zeno-color-text-secondary);
  border-radius: tokens.$radius-md; /* 8px */
  font-size: tokens.$typography-font-size-sm; /* 14px */
  font-weight: tokens.$typography-font-weight-semibold; /* 600 */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;

  .z-nav-rail__link--active & {
    background-color: rgba(255, 255, 255, 0.2);
    color: var(--zeno-color-text-inverse);
  }
}

/* Label with enhanced motion animation */
.z-nav-rail__label {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Enhanced badge system with better positioning and animation */
.z-nav-rail__badge {
  position: absolute;
  top: tokens.$spacing-2; /* 8px */
  right: tokens.$spacing-2; /* 8px */
  background: tokens.$color-accent;
  color: tokens.$color-white;
  font-size: tokens.$typography-font-size-xs; /* 12px */
  font-weight: tokens.$typography-font-weight-semibold; /* 600 */
  padding: 2px 6px;
  border-radius: tokens.$radius-full; /* 9999px */
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  z-index: 1;

  /* Dot indicator for boolean badges */
  &--dot {
    width: 12px;
    height: 12px;
    min-width: 12px;
    padding: 0;
    top: tokens.$spacing-3; /* 12px */
    right: tokens.$spacing-3; /* 12px */
    background: var(--zeno-color-danger-solid);
  }

  .z-nav-rail__link--active & {
    background: rgba(255, 255, 255, 0.9);
    color: var(--zeno-color-accent-text);
  }

  /* Collapsed state positioning */
  .z-nav-rail--collapsed & {
    top: tokens.$spacing-1; /* 4px */
    right: tokens.$spacing-1; /* 4px */
  }
}

.z-nav-rail__badge-text {
  line-height: 1;
}

/* Active indicator with enhanced animation */
.z-nav-rail__active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: var(--zeno-color-accent-solid);
  border-radius: 0 tokens.$radius-sm tokens.$radius-sm 0; /* 4px rounded on right */
  box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);
  animation: slideInLeft 0.3s tokens.$motion-easing-ease-out;
}

@keyframes slideInLeft {
  from {
    transform: translateY(-50%) translateX(-4px);
    opacity: 0;
  }
  to {
    transform: translateY(-50%) translateX(0);
    opacity: 1;
  }
}

/* Divider with enhanced visual separation */
.z-nav-rail__divider {
  height: 1px;
  background: var(--zeno-color-border-subtle);
  margin: tokens.$spacing-6 tokens.$spacing-6; /* 24px */
  border-radius: 1px;
}

/* Footer section with enhanced styling */
.z-nav-rail__footer {
  padding: tokens.$spacing-6 tokens.$spacing-6 0; /* 24px */
  border-top: 1px solid var(--zeno-color-border-subtle);
  margin-top: tokens.$spacing-6; /* 24px */
}

/* Collapse/Expand toggle with enhanced interaction */
.z-nav-rail__toggle {
  position: absolute;
  top: tokens.$spacing-6; /* 24px */
  right: -12px; /* Half outside the rail */
  width: 24px;
  height: 24px;
  background: var(--zeno-color-background-surface);
  border: 1px solid var(--zeno-color-border-default);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  z-index: 2;

  &:hover {
    background: var(--zeno-color-background-subtle);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:focus-visible {
    outline: 2px solid var(--zeno-color-focus-ring);
    outline-offset: 2px;
  }
}

.z-nav-rail__toggle-icon {
  width: 14px;
  height: 14px;
  color: var(--zeno-color-text-secondary);
  transition: transform tokens.$motion-duration-md
    tokens.$motion-easing-ease-out;
}

/* Motion transitions for enhanced user experience */
.z-nav-rail-label-enter-active,
.z-nav-rail-label-leave-active {
  transition: all tokens.$motion-duration-lg tokens.$motion-easing-ease-out;
}

.z-nav-rail-label-enter-from,
.z-nav-rail-label-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.z-nav-rail-badge-enter-active,
.z-nav-rail-badge-leave-active {
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

.z-nav-rail-badge-enter-from,
.z-nav-rail-badge-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-nav-rail {
    transition: width 0.2s ease;
  }

  .z-nav-rail__link {
    transition:
      background-color 0.15s ease,
      color 0.15s ease;

    &:hover:not(.z-nav-rail__link--disabled) {
      transform: none;
    }
  }

  .z-nav-rail__active-indicator {
    animation: none;
  }

  .z-nav-rail-label-enter-active,
  .z-nav-rail-label-leave-active {
    transition: opacity 0.2s ease;
  }
}
</style>

<template>
  <Transition
    :name="transitionName"
    @before-enter="handleBeforeEnter"
    @enter="handleEnter"
    @leave="handleLeave"
    @after-leave="handleAfterLeave"
  >
    <div
      v-if="!dismissed"
      ref="alertRef"
      :class="alertClasses"
      :style="alertStyles"
      :data-testid="testId"
      :role="semanticRole"
      :aria-live="ariaLive"
      :aria-labelledby="title ? titleId : undefined"
      :aria-describedby="bodyId"
      :aria-label="!title ? 'Alert notification' : undefined"
      tabindex="-1"
      @keydown="handleKeydown"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- Progress bar for auto-dismiss -->
      <div
        v-if="showProgress && timeoutId"
        class="z-alert__progress"
        :style="progressStyles"
      >
        <div
          class="z-alert__progress-bar"
          :style="{ animationDuration: `${timeout}ms` }"
        ></div>
      </div>
      <!-- Icon with enhanced visual feedback -->
      <div v-if="showIcon" class="z-alert__icon" :class="iconClasses">
        <slot name="icon" :variant="variant" :size="size">
          <Transition name="z-alert-icon" mode="out-in">
            <svg
              :key="variant"
              class="z-alert__icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              :aria-label="`${variant} icon`"
            >
              <g v-if="variant === 'success'" class="z-alert__icon-group">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  :stroke-width="iconStrokeWidth"
                  fill="none"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  :stroke-width="iconStrokeWidth"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
              <g v-else>
                <path
                  :d="getIconPath(variant)"
                  stroke="currentColor"
                  :stroke-width="iconStrokeWidth"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
            </svg>
          </Transition>
        </slot>
      </div>

      <!-- Content area with enhanced structure -->
      <div class="z-alert__content">
        <h4 v-if="title" :id="titleId" class="z-alert__title">
          <slot name="title">{{ title }}</slot>
        </h4>
        <div :id="bodyId" class="z-alert__message">
          <slot>{{ message }}</slot>
        </div>

        <!-- Action buttons area -->
        <div v-if="$slots.actions || actions?.length" class="z-alert__actions">
          <slot name="actions" :variant="variant" :dismiss="handleDismiss">
            <template v-for="action in actions" :key="action.label">
              <button
                :type="action.type || 'button'"
                :class="getActionClasses(action)"
                :disabled="disabled || action.disabled"
                @click="handleActionClick(action, $event)"
              >
                {{ action.label }}
              </button>
            </template>
          </slot>
        </div>
      </div>

      <!-- Enhanced close button -->
      <button
        v-if="dismissible && !persistent"
        type="button"
        class="z-alert__close"
        :aria-label="closeButtonLabel"
        :disabled="disabled"
        @click="handleDismiss"
      >
        <svg class="z-alert__close-icon" viewBox="0 0 12 12" fill="none">
          <path
            d="M9 3L3 9M3 3L9 9"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onUnmounted, useSlots } from 'vue';
import type {
  ZAlertProps,
  AlertVariant,
  AlertSize,
  AlertAnimation,
  AlertAction,
} from '../types/feedback';
import type { ZAlertEmits } from '../types/events';

// Re-export types for backward compatibility
export type {
  ZAlertProps,
  AlertVariant,
  AlertSize,
  AlertAnimation,
  AlertAction,
  ZAlertEmits,
};

const props = withDefaults(defineProps<ZAlertProps>(), {
  variant: 'info',
  size: 'md',
  dismissible: true,
  persistent: false,
  showIcon: true,
  disabled: false,
  actions: () => [],
  timeout: 0,
  showProgress: true,
  animation: 'fade',
  elevation: 2,
  floating: false,
  closeButtonLabel: 'Dismiss alert',
});

const emit = defineEmits<ZAlertEmits>();
const slots = useSlots();

// Template refs
const alertRef = ref<HTMLElement>();

// State management
const dismissed = ref(false);
const timeoutId = ref<number | null>(null);
const isHovered = ref(false);
const progressPaused = ref(false);

// Computed properties
const alertId = computed(
  () => props.id || `z-alert-${Math.random().toString(36).slice(2, 8)}`
);

const titleId = computed(() => `${alertId.value}-title`);
const bodyId = computed(() => `${alertId.value}-body`);

const semanticRole = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'alert';
    case 'warning':
      return 'alert';
    default:
      return 'status';
  }
});

const ariaLive = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'assertive';
    case 'warning':
      return 'assertive';
    default:
      return 'polite';
  }
});

const alertClasses = computed(() => [
  'z-alert',
  `z-alert--${props.variant}`,
  `z-alert--${props.size}`,
  {
    'z-alert--dismissible': props.dismissible,
    'z-alert--persistent': props.persistent,
    'z-alert--disabled': props.disabled,
    'z-alert--with-icon': props.showIcon,
    'z-alert--with-actions': props.actions.length > 0 || !!slots?.actions,
    'z-alert--floating': props.floating,
    'z-alert--hovered': isHovered.value,
    'z-alert--has-progress': props.showProgress && props.timeout > 0,
  },
]);

const alertStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (props.elevation !== undefined) {
    styles['--alert-elevation'] = String(props.elevation);
  }

  return styles;
});

const iconClasses = computed(() => ({
  'z-alert__icon--pulse': props.variant === 'warning',
  'z-alert__icon--spin': props.variant === 'danger' && props.timeout > 0,
}));

const transitionName = computed(() => {
  if (props.animation === 'scale') return 'z-alert-scale';
  if (props.animation.startsWith('slide')) return `z-alert-${props.animation}`;
  return 'z-alert-fade';
});

const progressStyles = computed(() => ({
  animationPlayState: progressPaused.value ? 'paused' : 'running',
}));

const iconStrokeWidth = computed(() => {
  switch (props.size) {
    case 'sm':
      return '1.5';
    case 'lg':
      return '2';
    default:
      return '1.5';
  }
});

// Icon management with modern outline icons
const getIconPath = (variant: AlertVariant): string => {
  const icons: Record<AlertVariant, string> = {
    info: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    warning:
      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    danger: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    glass: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  };
  return icons[variant] || icons.info;
};

// Action button styling
const getActionClasses = (action: AlertAction): string[] => [
  'z-alert__action',
  `z-alert__action--${action.variant || 'default'}`,
];

// Event handlers
const handleDismiss = () => {
  if (props.disabled || props.persistent) return;

  dismissed.value = true;
  clearTimeout();
  emit('dismiss');
};

const handleMouseEnter = () => {
  isHovered.value = true;
  if (props.timeout > 0 && !props.persistent) {
    progressPaused.value = true;
  }
};

const handleMouseLeave = () => {
  isHovered.value = false;
  if (props.timeout > 0 && !props.persistent) {
    progressPaused.value = false;
  }
};

const handleActionClick = (action: AlertAction, event: MouseEvent) => {
  if (props.disabled || action.disabled) return;

  emit('action-click', action, event);

  if (action.handler) {
    try {
      const result = action.handler(event);
      // Handle async handlers
      if (result instanceof Promise) {
        result.catch(console.error);
      }
    } catch (error) {
      console.error('Alert action handler error:', error);
    }
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  // ESC key dismisses alert
  if (event.key === 'Escape' && props.dismissible && !props.persistent) {
    event.preventDefault();
    handleDismiss();
  }
};

// Transition event handlers
const handleBeforeEnter = () => {
  emit('before-enter');
};

const handleEnter = () => {
  emit('enter');

  // Set up auto-dismiss timeout
  if (props.timeout > 0 && !props.persistent && props.dismissible) {
    timeoutId.value = window.setTimeout(() => {
      handleDismiss();
    }, props.timeout);
  }

  // Focus alert for screen readers if it's an assertive alert
  if (semanticRole.value === 'alert') {
    nextTick(() => {
      alertRef.value?.focus();
    });
  }
};

const handleLeave = () => {
  emit('leave');
  clearTimeout();
};

const handleAfterLeave = () => {
  emit('after-leave');
};

const clearTimeout = () => {
  if (timeoutId.value !== null) {
    window.clearTimeout(timeoutId.value);
    timeoutId.value = null;
  }
};

// Cleanup on unmount
onUnmounted(() => {
  clearTimeout();
});

// Expose methods for programmatic control
defineExpose({
  /** Dismiss the alert programmatically */
  dismiss: handleDismiss,
  /** Focus the alert */
  focus: () => alertRef.value?.focus(),
  /** Get the alert element */
  getAlertElement: () => alertRef.value,
  /** Check if alert is dismissed */
  isDismissed: () => dismissed.value,
  /** Clear any active timeout */
  clearTimeout,
});
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Alert Component
 * Principles: Clear communication, appropriate urgency, accessible notifications
 * Accessibility: WCAG 2.1 Level AA compliance, semantic roles, keyboard navigation
 * Motion: Smooth entry/exit animations with spatial continuity
 */

/* Base alert container */
.z-alert {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: tokens.$spacing-3; /* 12px - optimal information hierarchy */
  padding: tokens.$spacing-4; /* 16px - comfortable content spacing */
  border-radius: tokens.$radius-lg; /* 16px - modern corners */
  background: var(--zeno-color-background-surface);
  font-family: tokens.$typography-font-family-primary;
  overflow: hidden;
  transform-origin: center top;

  /* Apple-style shadow system based on elevation */
  --shadow-elevation-0: none;
  --shadow-elevation-1:
    0 0.5px 2px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-elevation-2:
    0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-elevation-3:
    0 2px 6px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.08);
  --shadow-elevation-4:
    0 4px 12px rgba(0, 0, 0, 0.12), 0 16px 32px rgba(0, 0, 0, 0.1);
  --shadow-elevation-5:
    0 8px 24px rgba(0, 0, 0, 0.16), 0 24px 48px rgba(0, 0, 0, 0.14);

  box-shadow: var(--zeno-shadow-sm);

  /* Use CSS variable for dynamic elevation */
  &[style*='--alert-elevation: 0'] {
    box-shadow: var(--zeno-shadow-none);
  }
  &[style*='--alert-elevation: 1'] {
    box-shadow: var(--zeno-shadow-xs);
  }
  &[style*='--alert-elevation: 2'] {
    box-shadow: var(--zeno-shadow-sm);
  }
  &[style*='--alert-elevation: 3'] {
    box-shadow: var(--zeno-shadow-md);
  }
  &[style*='--alert-elevation: 4'] {
    box-shadow: var(--zeno-shadow-lg);
  }
  &[style*='--alert-elevation: 5'] {
    box-shadow: var(--zeno-shadow-xl);
  }

  /* Enhanced interaction feedback with spring physics */
  transition: all tokens.$motion-duration-lg cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity, box-shadow;

  /* Outline for focus accessibility */
  outline: none;

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px var(--zeno-color-background-surface),
      0 0 0 4px var(--zeno-color-accent-solid),
      var(--zeno-shadow-sm);
  }

  /* Hover state enhancement */
  &--hovered:not(.z-alert--disabled) {
    transform: translateY(-1px);
    box-shadow: var(--zeno-shadow-md);
  }

  /* Floating variant */
  &--floating {
    position: fixed;
    top: tokens.$spacing-6;
    right: tokens.$spacing-6;
    max-width: 420px;
    z-index: 1000;
  }
}

/* Size variants optimized for content hierarchy */
.z-alert--sm {
  padding: tokens.$spacing-3; /* 12px */
  gap: tokens.$spacing-2; /* 8px */

  .z-alert__title {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }

  .z-alert__message {
    font-size: tokens.$typography-font-size-xs; /* 12px */
  }

  .z-alert__icon-svg {
    width: 16px;
    height: 16px;
  }
}

.z-alert--md {
  padding: tokens.$spacing-4; /* 16px */
  gap: tokens.$spacing-3; /* 12px */

  .z-alert__title {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }

  .z-alert__message {
    font-size: tokens.$typography-font-size-sm; /* 14px */
  }

  .z-alert__icon-svg {
    width: 20px;
    height: 20px;
  }
}

.z-alert--lg {
  padding: tokens.$spacing-5; /* 20px */
  gap: tokens.$spacing-4; /* 16px */

  .z-alert__title {
    font-size: tokens.$typography-font-size-lg; /* 18px */
  }

  .z-alert__message {
    font-size: tokens.$typography-font-size-md; /* 16px */
  }

  .z-alert__icon-svg {
    width: 24px;
    height: 24px;
  }
}

/* Variant styles following semantic color system */

/* Info variant - informational messaging */
.z-alert--info {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08) 0%,
    rgba(59, 130, 246, 0.05) 100%
  );
  border: 1px solid rgba(59, 130, 246, 0.3);

  .z-alert__icon {
    color: var(--zeno-color-info-text);
    background: rgba(59, 130, 246, 0.1);
  }

  .z-alert__title {
    color: var(--zeno-color-info-text);
  }

  .z-alert__progress-bar {
    background: var(--zeno-color-info-solid);
  }
}

/* Success variant - positive confirmations */
.z-alert--success {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08) 0%,
    rgba(34, 197, 94, 0.05) 100%
  );
  border: 1px solid rgba(34, 197, 94, 0.3);

  .z-alert__icon {
    color: var(--zeno-color-success-text);
    background: rgba(34, 197, 94, 0.1);
  }

  .z-alert__title {
    color: var(--zeno-color-success-text);
  }

  .z-alert__progress-bar {
    background: var(--zeno-color-success-solid);
  }
}

/* Warning variant - cautionary messaging */
.z-alert--warning {
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08) 0%,
    rgba(245, 158, 11, 0.05) 100%
  );
  border: 1px solid rgba(245, 158, 11, 0.3);

  .z-alert__icon {
    color: var(--zeno-color-warning-text);
    background: rgba(245, 158, 11, 0.1);
  }

  .z-alert__title {
    color: var(--zeno-color-warning-text);
  }

  .z-alert__progress-bar {
    background: var(--zeno-color-warning-solid);
  }
}

/* Danger variant - critical alerts */
.z-alert--danger {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08) 0%,
    rgba(239, 68, 68, 0.05) 100%
  );
  border: 1px solid rgba(239, 68, 68, 0.3);

  .z-alert__icon {
    color: var(--zeno-color-danger-text);
    background: rgba(239, 68, 68, 0.1);
  }

  .z-alert__title {
    color: var(--zeno-color-danger-text);
  }

  .z-alert__progress-bar {
    background: var(--zeno-color-danger-solid);
  }
}

/* Glass variant - modern glassmorphism */
.z-alert--glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  .z-alert__icon {
    color: var(--zeno-color-accent-text);
    background: rgba(255, 255, 255, 0.1);
  }

  .z-alert__title {
    color: var(--zeno-color-text-primary);
  }

  .z-alert__progress-bar {
    background: var(--zeno-color-accent-solid);
  }

  /* Glass effect in dark mode */
}

/* Icon container with enhanced positioning */
.z-alert__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: tokens.$radius-full;
  margin-top: -2px; /* Fine-tune alignment */

  /* Icon animation enhancement */
  transition: all tokens.$motion-duration-lg cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Pulse animation for warnings */
  &--pulse {
    animation: alert-icon-pulse 2s ease-in-out infinite;
  }

  /* Spin animation for critical errors */
  &--spin {
    animation: alert-icon-spin 3s linear infinite;
  }
}

.z-alert__icon-svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

.z-alert__icon-group {
  transform-origin: center;
}

@keyframes alert-icon-pulse {
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

@keyframes alert-icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Content area with improved structure */
.z-alert__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: tokens.$spacing-2; /* 8px between title and message */
}

.z-alert__title {
  margin: 0;
  font-weight: tokens.$typography-font-weight-bold; /* 700 */
  line-height: tokens.$typography-line-height-tight;
  color: var(--zeno-color-text-primary);

  /* Enhanced readability */
  letter-spacing: -0.01em;
}

.z-alert__message {
  margin: 0;
  line-height: tokens.$typography-line-height-relaxed;
  color: var(--zeno-color-text-primary);

  /* Rich content support */
  p {
    margin: 0 0 tokens.$spacing-2 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  a {
    color: var(--zeno-color-link-default);
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      text-decoration: none;
    }
  }
}

/* Action buttons area */
.z-alert__actions {
  display: flex;
  gap: tokens.$spacing-2; /* 8px */
  align-items: center;
  flex-wrap: wrap;
  margin-top: tokens.$spacing-2; /* 8px */
}

.z-alert__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: tokens.$spacing-1 tokens.$spacing-3; /* 4px 12px */
  border: 1px solid transparent;
  border-radius: tokens.$radius-md; /* 8px */
  font-size: tokens.$typography-font-size-sm; /* 14px */
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
  line-height: tokens.$typography-line-height-normal;
  cursor: pointer;
  text-decoration: none;

  /* Enhanced interaction feedback */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  &:focus {
    outline: 2px solid var(--zeno-color-focus-ring);
    outline-offset: 1px;
  }
}

.z-alert__action--default {
  background: var(--zeno-color-background-subtle);
  border-color: var(--zeno-color-border-default);
  color: var(--zeno-color-text-primary);

  &:hover {
    background: var(--zeno-color-background-muted);
    border-color: var(--zeno-color-border-strong);
  }
}

.z-alert__action--primary {
  background: var(--zeno-color-accent-solid);
  border-color: var(--zeno-color-accent-solid);
  color: var(--zeno-color-text-inverse);

  &:hover {
    background: var(--zeno-color-accent-solid-hover);
    border-color: var(--zeno-color-accent-solid-hover);
  }
}

.z-alert__action--danger {
  background: var(--zeno-color-danger-solid);
  border-color: var(--zeno-color-danger-solid);
  color: var(--zeno-color-text-inverse);

  &:hover {
    background: var(--zeno-color-danger-solid-hover);
    border-color: var(--zeno-color-danger-solid-hover);
  }
}

/* Enhanced close button */
.z-alert__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: tokens.$radius-full;
  color: var(--zeno-color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  /* Enhanced interaction feedback with spring animation */
  transition: all tokens.$motion-duration-md cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Ripple effect container */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, currentColor 0%, transparent 70%);
    opacity: 0;
    transform: scale(0);
    transition: all tokens.$motion-duration-lg tokens.$motion-easing-ease-out;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: var(--zeno-color-text-primary);
    transform: scale(1.1) rotate(90deg);

    &::before {
      opacity: 0.1;
      transform: scale(1);
    }
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px var(--zeno-color-background-surface),
      0 0 0 4px var(--zeno-color-accent-solid);
  }

  &:active {
    transform: scale(0.9) rotate(90deg);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;

    &:hover {
      transform: none;
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

.z-alert__close-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}

/* State modifiers */

/* Disabled state */
.z-alert--disabled {
  opacity: 0.6;
  pointer-events: none;

  .z-alert__close {
    cursor: not-allowed;
  }
}

/* Persistent state indicators */
.z-alert--persistent {
  /* Visual indicators for non-dismissible alerts */
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: currentColor;
    border-radius: 0 tokens.$radius-sm tokens.$radius-sm 0;
  }
}

/* Enhanced interaction states */
.z-alert--with-actions {
  .z-alert__content {
    padding-bottom: tokens.$spacing-1; /* Additional space for actions */
  }
}

/* Progress bar for auto-dismiss */
.z-alert__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.z-alert__progress-bar {
  height: 100%;
  width: 100%;
  background: currentColor;
  transform-origin: left center;
  animation: alert-progress linear forwards;
}

@keyframes alert-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transition animations with enhanced physics */
/* Fade animation (default) */
.z-alert-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.z-alert-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.z-alert-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.z-alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* Scale animation */
.z-alert-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.z-alert-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.z-alert-scale-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.z-alert-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Slide animations */
.z-alert-slide-down-enter-active,
.z-alert-slide-up-enter-active,
.z-alert-slide-left-enter-active,
.z-alert-slide-right-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.z-alert-slide-down-leave-active,
.z-alert-slide-up-leave-active,
.z-alert-slide-left-leave-active,
.z-alert-slide-right-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.z-alert-slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.z-alert-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-50%);
}

.z-alert-slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.z-alert-slide-up-leave-to {
  opacity: 0;
  transform: translateY(50%);
}

.z-alert-slide-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.z-alert-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50%);
}

.z-alert-slide-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.z-alert-slide-right-leave-to {
  opacity: 0;
  transform: translateX(50%);
}

/* Icon transition animations with spring physics */
.z-alert-icon-enter-active {
  transition: all tokens.$motion-duration-lg cubic-bezier(0.34, 1.56, 0.64, 1);
}

.z-alert-icon-leave-active {
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

.z-alert-icon-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-180deg);
}

.z-alert-icon-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(180deg);
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-alert,
  .z-alert__icon,
  .z-alert__icon-svg,
  .z-alert__close,
  .z-alert__close::before {
    transition: none;
    animation: none;
  }

  .z-alert__close:hover,
  .z-alert__close:active {
    transform: none;
  }

  .z-alert__icon--pulse,
  .z-alert__icon--spin {
    animation: none;
  }

  .z-alert__progress-bar {
    animation: none;
    display: none;
  }

  .z-alert-fade-enter-active,
  .z-alert-fade-leave-active,
  .z-alert-scale-enter-active,
  .z-alert-scale-leave-active,
  .z-alert-slide-down-enter-active,
  .z-alert-slide-down-leave-active,
  .z-alert-slide-up-enter-active,
  .z-alert-slide-up-leave-active,
  .z-alert-slide-left-enter-active,
  .z-alert-slide-left-leave-active,
  .z-alert-slide-right-enter-active,
  .z-alert-slide-right-leave-active {
    transition: opacity 0.2s ease;
  }

  .z-alert-fade-enter-from,
  .z-alert-fade-leave-to,
  .z-alert-scale-enter-from,
  .z-alert-scale-leave-to,
  .z-alert-slide-down-enter-from,
  .z-alert-slide-down-leave-to,
  .z-alert-slide-up-enter-from,
  .z-alert-slide-up-leave-to,
  .z-alert-slide-left-enter-from,
  .z-alert-slide-left-leave-to,
  .z-alert-slide-right-enter-from,
  .z-alert-slide-right-leave-to {
    transform: none;
  }

  .z-alert-icon-enter-active,
  .z-alert-icon-leave-active {
    transition: opacity 0.1s ease;
  }

  .z-alert-icon-enter-from,
  .z-alert-icon-leave-to {
    transform: none;
  }
}

/* High contrast mode support */
@media (forced-colors: active) {
  .z-alert {
    border: 2px solid ButtonText;
    background: ButtonFace;
  }

  .z-alert__title,
  .z-alert__message {
    color: ButtonText;
  }

  .z-alert__icon {
    color: ButtonText;
  }

  .z-alert__close {
    border: 1px solid ButtonText;
    color: ButtonText;

    &:hover {
      background: Highlight;
      color: HighlightText;
    }

    &:focus {
      outline: 2px solid ButtonText;
    }
  }

  .z-alert__action {
    border: 1px solid ButtonText;
    color: ButtonText;

    &:hover {
      background: Highlight;
      color: HighlightText;
    }

    &:focus {
      outline: 2px solid ButtonText;
    }
  }
}

/* Responsive design enhancements */
@media (max-width: 640px) {
  .z-alert {
    padding: tokens.$spacing-3; /* 12px on mobile */
    gap: tokens.$spacing-2; /* 8px on mobile */
  }

  .z-alert__actions {
    flex-direction: column;
    align-items: stretch;
    gap: tokens.$spacing-1; /* 4px */

    .z-alert__action {
      justify-content: center;
    }
  }

  .z-alert__close {
    width: 28px;
    height: 28px;
  }
}
</style>

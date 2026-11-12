<template>
  <Teleport to="body">
    <div :class="containerClasses" :style="containerStyles">
      <TransitionGroup
        :name="transitionName"
        tag="div"
        @before-enter="onBeforeEnter"
        @enter="onEnter"
      >
        <div
          v-for="(toast, index) in toasts"
          :key="toast.id"
          :class="toastClasses(toast)"
          :style="toastStyles(toast, index)"
          :role="toast.data.variant === 'error' ? 'alert' : 'status'"
          :aria-live="toast.data.variant === 'error' ? 'assertive' : 'polite'"
          @mouseenter="handleMouseEnter(toast)"
          @mouseleave="handleMouseLeave(toast)"
          @mousedown="handleSwipeStart"
          @touchstart="handleSwipeStart"
        >
          <!-- Progress bar for auto-dismiss -->
          <div
            v-if="toast.data.showProgress && toast.data.duration"
            class="z-toast__progress"
          >
            <div
              class="z-toast__progress-bar"
              :style="{
                animationDuration: `${toast.data.duration}ms`,
                animationPlayState: pausedToasts.has(toast.id)
                  ? 'paused'
                  : 'running',
              }"
            ></div>
          </div>
          <div class="z-toast__icon" :class="iconClasses(toast)">
            <Transition name="toast-icon" mode="out-in">
              <svg
                :key="toast.data.variant"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <g
                  v-if="toast.data.variant === 'success'"
                  class="z-toast__icon-group"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path
                    d="M8 12l2 2 4-4"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <g v-else-if="toast.data.variant === 'error'">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path
                    d="M15 9l-6 6M9 9l6 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <g v-else-if="toast.data.variant === 'warning'">
                  <path
                    d="M12 2L2 20h20L12 2z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 9v4M12 17h.01"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </g>
                <g v-else>
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path
                    d="M12 8v4M12 16h.01"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                </g>
              </svg>
            </Transition>
          </div>

          <div class="z-toast__content">
            <h4 v-if="toast.data.title" class="z-toast__title">
              {{ toast.data.title }}
            </h4>
            <p class="z-toast__message">{{ toast.data.message }}</p>
            <div
              v-if="toast.data.action || toast.data.actions"
              class="z-toast__actions"
            >
              <button
                v-if="toast.data.action"
                class="z-toast__action"
                @click.stop="handleAction(toast)"
              >
                {{ toast.data.action.label }}
              </button>
              <button
                v-for="(action, idx) in toast.data.actions"
                :key="idx"
                :class="getActionClasses(action)"
                @click.stop="handleActionMulti(toast, action)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>

          <button
            v-if="toast.data.dismissible !== false"
            class="z-toast__close"
            :class="{ 'z-toast__close--hover': isCloseHovered[toast.id] }"
            aria-label="Dismiss notification"
            @click.stop="dismiss(toast.id)"
            @mouseenter="isCloseHovered[toast.id] = true"
            @mouseleave="isCloseHovered[toast.id] = false"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, provide, reactive } from 'vue';
import { createToastQueue, type QueueItem } from '@usezeno/core';
import type {
  ZToastProps,
  ToastData,
  ToastVariant,
  ToastAnimation,
  ToastAction,
  ToastActionVariant,
  ToastPosition,
} from '../types/feedback';
import type { ZToastEmits } from '../types/events';

// Re-export types for backward compatibility
export type {
  ZToastProps,
  ToastData as ExtendedToastData,
  ToastVariant,
  ToastAnimation,
  ToastAction,
  ToastActionVariant,
  ToastPosition,
  ZToastEmits,
};

const props = withDefaults(defineProps<ZToastProps>(), {
  position: 'bottom-right',
  maxToasts: 5,
  persistent: false,
  animation: 'slide',
  showProgress: true,
  offset: () => ({ x: 0, y: 0 }),
  swipeToDismiss: true,
});

const emit = defineEmits<ZToastEmits>();

const toastQueue = createToastQueue({
  maxSize: props.maxToasts,
  autoCleanup: false,
});
const toasts = ref<QueueItem<ToastData>[]>([]);
const pausedToasts = ref(new Set<string>());
const isCloseHovered = reactive<Record<string, boolean>>({});
const swipeStart = ref({ x: 0, y: 0 });
const swipeThreshold = 100;

// Computed properties
const transitionName = computed(() => {
  const baseAnimation = props.animation;
  const positionModifier = props.position.includes('top') ? '-down' : '-up';

  if (baseAnimation === 'slide') {
    if (props.position.includes('left')) return 'toast-slide-left';
    if (props.position.includes('right')) return 'toast-slide-right';
    return `toast-slide${positionModifier}`;
  }

  return `toast-${baseAnimation}`;
});

const containerClasses = computed(() => [
  'z-toast-container',
  `z-toast-container--${props.position}`,
]);

const containerStyles = computed(() => ({
  '--toast-offset-x': `${props.offset.x || 0}px`,
  '--toast-offset-y': `${props.offset.y || 0}px`,
}));

const toastClasses = (toast: QueueItem<ToastData>) => [
  'z-toast',
  `z-toast--${toast.data.variant || 'info'}`,
  {
    'z-toast--has-title': !!toast.data.title,
    'z-toast--has-progress':
      toast.data.showProgress !== false && toast.data.duration,
    'z-toast--glass': toast.data.variant === 'glass',
  },
];

const toastStyles = (toast: QueueItem<ToastData>, index: number) => {
  const styles: Record<string, string> = {};

  // Stack effect for multiple toasts
  if (index > 0) {
    const scale = 1 - index * 0.02;
    const translateY = props.position.includes('bottom')
      ? index * 8
      : -(index * 8);
    styles.transform = `scale(${scale}) translateY(${translateY}px)`;
    styles.opacity = String(1 - index * 0.1);
  }

  // Elevation
  if (toast.data.elevation !== undefined) {
    styles['--toast-elevation'] = String(toast.data.elevation);
  }

  return styles;
};

const iconClasses = (toast: QueueItem<ToastData>) => ({
  'z-toast__icon--pulse': toast.data.variant === 'warning',
  'z-toast__icon--bounce': toast.data.variant === 'success',
});

const getActionClasses = (action: ToastAction) => [
  'z-toast__action',
  `z-toast__action--${action.variant || 'secondary'}`,
];

// Event handlers
const handleMouseEnter = (toast: QueueItem<ToastData>) => {
  if (toast.data.duration && toast.data.showProgress !== false) {
    pausedToasts.value.add(toast.id);
  }
};

const handleMouseLeave = (toast: QueueItem<ToastData>) => {
  pausedToasts.value.delete(toast.id);
};

const handleSwipeStart = (event: MouseEvent | TouchEvent) => {
  if (!props.swipeToDismiss) return;

  const touch = event.type.includes('touch')
    ? (event as TouchEvent).touches[0]
    : (event as MouseEvent);

  swipeStart.value = { x: touch.clientX, y: touch.clientY };

  const handleSwipeMove = (moveEvent: MouseEvent | TouchEvent) => {
    const moveTouch = moveEvent.type.includes('touch')
      ? (moveEvent as TouchEvent).touches[0]
      : (moveEvent as MouseEvent);

    const deltaX = moveTouch.clientX - swipeStart.value.x;
    const deltaY = moveTouch.clientY - swipeStart.value.y;

    // Horizontal swipe detection
    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaY) < 50) {
      const toastEl = (event.target as HTMLElement).closest('.z-toast');
      const toastId = toastEl?.getAttribute('data-toast-id');
      if (toastId) {
        dismiss(toastId);
      }
      cleanup();
    }
  };

  const cleanup = () => {
    document.removeEventListener('mousemove', handleSwipeMove);
    document.removeEventListener('mouseup', cleanup);
    document.removeEventListener('touchmove', handleSwipeMove);
    document.removeEventListener('touchend', cleanup);
  };

  document.addEventListener(
    event.type.includes('touch') ? 'touchmove' : 'mousemove',
    handleSwipeMove
  );
  document.addEventListener(
    event.type.includes('touch') ? 'touchend' : 'mouseup',
    cleanup
  );
};

// Animation callbacks
const onBeforeEnter = (el: Element) => {
  (el as HTMLElement).style.opacity = '0';
};

const onEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement;
  requestAnimationFrame(() => {
    htmlEl.style.opacity = '1';
    htmlEl.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(done, 300);
  });
};

const show = (data: ToastData) => {
  // Apply defaults
  const toastData: ToastData = {
    ...data,
    animation: data.animation || props.animation,
    showProgress:
      data.showProgress !== undefined ? data.showProgress : props.showProgress,
  };

  const id = toastQueue.enqueue(toastData);
  updateToasts();

  // Auto dismiss
  if (
    !props.persistent &&
    toastData.dismissible !== false &&
    toastData.duration !== 0
  ) {
    const duration = toastData.duration || 5000;
    let elapsed = 0;
    const interval = 100;

    const timer = setInterval(() => {
      if (!pausedToasts.value.has(id)) {
        elapsed += interval;
        if (elapsed >= duration) {
          clearInterval(timer);
          dismiss(id);
        }
      }
    }, interval);

    // Store timer for cleanup
    (toastData as any)._timer = timer;
  }

  return id;
};

const dismiss = (id: string) => {
  const toast = toasts.value.find(t => t.id === id);
  if (toast && (toast.data as any)._timer) {
    clearInterval((toast.data as any)._timer);
  }

  toastQueue.remove(id);
  updateToasts();
  pausedToasts.value.delete(id);
  delete isCloseHovered[id];
  emit('dismiss', id);
};

const handleAction = (toast: QueueItem<ToastData>) => {
  if (toast.data.action) {
    toast.data.action.handler();
    emit('action', toast);
    if (toast.data.action.dismissOnClick !== false) {
      dismiss(toast.id);
    }
  }
};

const handleActionMulti = (
  toast: QueueItem<ToastData>,
  action: ToastAction
) => {
  action.handler();
  emit('action', toast);
  dismiss(toast.id);
};

const updateToasts = () => {
  toasts.value = toastQueue.toArray() as QueueItem<ToastData>[];
};

// Global toast API
const toastApi = {
  show,
  success: (message: string, options?: Partial<ToastData>) =>
    show({ message, variant: 'success', ...options }),
  error: (message: string, options?: Partial<ToastData>) =>
    show({ message, variant: 'error', ...options }),
  warning: (message: string, options?: Partial<ToastData>) =>
    show({ message, variant: 'warning', ...options }),
  info: (message: string, options?: Partial<ToastData>) =>
    show({ message, variant: 'info', ...options }),
  glass: (message: string, options?: Partial<ToastData>) =>
    show({ message, variant: 'glass', ...options }),
  dismiss,
  clear: () => {
    toasts.value.forEach(toast => dismiss(toast.id));
  },
};

const useToast = () => toastApi;

// Keyboard support - dismiss on Escape
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && toasts.value.length > 0) {
    // Dismiss the most recent toast
    const latestToast = toasts.value[toasts.value.length - 1];
    dismiss(latestToast.id);
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Provide to children
provide('toast', useToast());

defineExpose({
  ...toastApi,
  useToast,
});
</script>

<style scoped lang="scss">
@use '../tokens.scss' as tokens;

/* Toast Component
 * Principles: Non-intrusive notifications, smooth animations, intuitive interactions
 * Accessibility: WCAG 2.1 Level AA compliance, proper ARIA roles, keyboard support
 * Motion: Physics-based animations with spring easing
 */

.z-toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: tokens.$spacing-3;
  max-width: 420px;
  pointer-events: none;

  &--bottom-right {
    bottom: calc(tokens.$spacing-6 + var(--toast-offset-y));
    right: calc(tokens.$spacing-6 + var(--toast-offset-x));
  }

  &--bottom-left {
    bottom: calc(tokens.$spacing-6 + var(--toast-offset-y));
    left: calc(tokens.$spacing-6 + var(--toast-offset-x));
  }

  &--top-right {
    top: calc(tokens.$spacing-6 + var(--toast-offset-y));
    right: calc(tokens.$spacing-6 + var(--toast-offset-x));
  }

  &--top-left {
    top: calc(tokens.$spacing-6 + var(--toast-offset-y));
    left: calc(tokens.$spacing-6 + var(--toast-offset-x));
  }

  &--bottom-center {
    bottom: calc(tokens.$spacing-6 + var(--toast-offset-y));
    left: 50%;
    transform: translateX(-50%);
  }

  &--top-center {
    top: calc(tokens.$spacing-6 + var(--toast-offset-y));
    left: 50%;
    transform: translateX(-50%);
  }
}

.z-toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: tokens.$spacing-3;
  padding: tokens.$spacing-4;
  min-width: 300px;
  background: var(--zeno-color-background-surface);
  border-radius: tokens.$radius-lg;
  pointer-events: auto;
  cursor: default;
  overflow: hidden;
  transform-origin: center;
  will-change: transform, opacity;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  /* Apple-style shadow system */
  --shadow-elevation-0: none;
  --shadow-elevation-1:
    0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.12);
  --shadow-elevation-2:
    0 2px 6px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  --shadow-elevation-3:
    0 5px 10px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08);
  --shadow-elevation-4:
    0 8px 16px rgba(0, 0, 0, 0.16), 0 16px 32px rgba(0, 0, 0, 0.12);
  --shadow-elevation-5:
    0 12px 24px rgba(0, 0, 0, 0.2), 0 24px 48px rgba(0, 0, 0, 0.16);

  box-shadow: var(--zeno-shadow-md);

  /* Dynamic elevation */
  &[style*='--toast-elevation: 0'] {
    box-shadow: var(--zeno-shadow-none);
  }
  &[style*='--toast-elevation: 1'] {
    box-shadow: var(--zeno-shadow-xs);
  }
  &[style*='--toast-elevation: 2'] {
    box-shadow: var(--zeno-shadow-sm);
  }
  &[style*='--toast-elevation: 3'] {
    box-shadow: var(--zeno-shadow-md);
  }
  &[style*='--toast-elevation: 4'] {
    box-shadow: var(--zeno-shadow-lg);
  }
  &[style*='--toast-elevation: 5'] {
    box-shadow: var(--zeno-shadow-xl);
  }

  /* Hover effect */
  transition: all tokens.$motion-duration-md cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: var(--zeno-shadow-lg);
  }

  /* Small size adjustments */
  &--has-title {
    min-height: 80px;
  }
}

/* Variant styles with modern gradients */
.z-toast--info {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08) 0%,
    rgba(59, 130, 246, 0.04) 100%
  );
  border: 1px solid rgba(59, 130, 246, 0.2);

  .z-toast__icon {
    color: var(--zeno-color-info-text);
    background: rgba(59, 130, 246, 0.1);
  }

  .z-toast__progress-bar {
    background: var(--zeno-color-info-solid);
  }
}

.z-toast--success {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08) 0%,
    rgba(34, 197, 94, 0.04) 100%
  );
  border: 1px solid rgba(34, 197, 94, 0.2);

  .z-toast__icon {
    color: var(--zeno-color-success-text);
    background: rgba(34, 197, 94, 0.1);
  }

  .z-toast__progress-bar {
    background: var(--zeno-color-success-solid);
  }
}

.z-toast--warning {
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08) 0%,
    rgba(245, 158, 11, 0.04) 100%
  );
  border: 1px solid rgba(245, 158, 11, 0.2);

  .z-toast__icon {
    color: var(--zeno-color-warning-text);
    background: rgba(245, 158, 11, 0.1);
  }

  .z-toast__progress-bar {
    background: var(--zeno-color-warning-solid);
  }
}

.z-toast--error {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08) 0%,
    rgba(239, 68, 68, 0.04) 100%
  );
  border: 1px solid rgba(239, 68, 68, 0.2);

  .z-toast__icon {
    color: var(--zeno-color-danger-text);
    background: rgba(239, 68, 68, 0.1);
  }

  .z-toast__progress-bar {
    background: var(--zeno-color-danger-solid);
  }
}

/* Glass variant */
.z-toast--glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  .z-toast__icon {
    color: var(--zeno-color-accent-text);
    background: rgba(255, 255, 255, 0.1);
  }

  .z-toast__progress-bar {
    background: var(--zeno-color-accent-solid);
  }
}

/* Icon with enhanced styling */
.z-toast__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: tokens.$radius-full;
  transition: all tokens.$motion-duration-lg cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Animation classes */
  &--pulse {
    animation: toast-icon-pulse 2s ease-in-out infinite;
  }

  &--bounce {
    animation: toast-icon-bounce 0.6s ease-out;
  }

  svg {
    width: 24px;
    height: 24px;
  }
}

.z-toast__icon-group {
  transform-origin: center;
}

@keyframes toast-icon-pulse {
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

@keyframes toast-icon-bounce {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Content area */
.z-toast__content {
  flex: 1;
  min-width: 0;
  padding-right: tokens.$spacing-2;
}

.z-toast__title {
  margin: 0 0 tokens.$spacing-1 0;
  font-size: tokens.$typography-font-size-md;
  font-weight: tokens.$typography-font-weight-semibold;
  line-height: tokens.$typography-line-height-tight;
  color: var(--zeno-color-text-primary);
}

.z-toast__message {
  margin: 0;
  font-size: tokens.$typography-font-size-sm;
  line-height: tokens.$typography-line-height-normal;
  color: var(--zeno-color-text-secondary);
  word-break: break-word;
}

/* Action buttons */
.z-toast__actions {
  display: flex;
  gap: tokens.$spacing-2;
  margin-top: tokens.$spacing-3;
}

.z-toast__action {
  padding: tokens.$spacing-1 tokens.$spacing-3;
  border-radius: tokens.$radius-md;
  font-size: tokens.$typography-font-size-sm;
  font-weight: tokens.$typography-font-weight-medium;
  cursor: pointer;
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  border: 1px solid transparent;
  white-space: nowrap;

  &--primary {
    background: var(--zeno-color-accent-solid);
    color: var(--zeno-color-accent-on-solid);

    &:hover {
      background: var(--zeno-color-accent-solid-hover);
      transform: translateY(-1px);
    }
  }

  &--secondary {
    background: transparent;
    color: var(--zeno-color-accent-text);
    border-color: var(--zeno-color-border-default);

    &:hover {
      background: var(--zeno-color-background-subtle);
      border-color: var(--zeno-color-accent-solid);
    }
  }

  &--error {
    background: transparent;
    color: var(--zeno-color-danger-text);

    &:hover {
      background: var(--zeno-color-danger-solid);
      color: var(--zeno-color-danger-on-solid);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--zeno-color-text-secondary);

    &:hover {
      color: var(--zeno-color-text-primary);
      background: var(--zeno-color-background-subtle);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--zeno-color-accent-solid);
    outline-offset: 2px;
  }
}

/* Close button with enhanced interaction */
.z-toast__close {
  position: absolute;
  top: tokens.$spacing-2;
  right: tokens.$spacing-2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: tokens.$radius-full;
  color: var(--zeno-color-text-secondary);
  cursor: pointer;
  transition: all tokens.$motion-duration-md cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0;

  .z-toast:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: var(--zeno-color-text-primary);
    transform: scale(1.1) rotate(90deg);
  }

  &--hover {
    opacity: 1;
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

  svg {
    width: 14px;
    height: 14px;
  }
}

/* Progress bar */
.z-toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.z-toast__progress-bar {
  height: 100%;
  width: 100%;
  background: currentColor;
  transform-origin: left center;
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transition animations */
/* Fade animation */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Scale animation */
.toast-scale-enter-active,
.toast-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-scale-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.toast-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Bounce animation */
.toast-bounce-enter-active {
  animation: toast-bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-bounce-leave-active {
  animation: toast-bounce-out 0.4s ease-in;
}

@keyframes toast-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(100%);
  }
  50% {
    transform: scale(1.05) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes toast-bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.7) translateY(50%);
  }
}

/* Slide animations */
.toast-slide-up-enter-active,
.toast-slide-down-enter-active,
.toast-slide-left-enter-active,
.toast-slide-right-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-up-leave-active,
.toast-slide-down-leave-active,
.toast-slide-left-leave-active,
.toast-slide-right-leave-active {
  transition: all 0.2s ease-in;
}

.toast-slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.toast-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.toast-slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.toast-slide-down-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.toast-slide-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.toast-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-120%);
}

.toast-slide-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-right-leave-to {
  opacity: 0;
  transform: translateX(120%);
}

.toast-move {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Icon transitions */
.toast-icon-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-icon-leave-active {
  transition: all 0.2s ease-out;
}

.toast-icon-enter-from {
  opacity: 0;
  transform: scale(0) rotate(-180deg);
}

.toast-icon-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(180deg);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .z-toast,
  .z-toast__icon,
  .z-toast__close {
    transition: none;
    animation: none;
  }

  .z-toast__progress-bar {
    animation: none;
    display: none;
  }

  .toast-fade-enter-active,
  .toast-fade-leave-active,
  .toast-scale-enter-active,
  .toast-scale-leave-active,
  .toast-bounce-enter-active,
  .toast-bounce-leave-active,
  .toast-slide-up-enter-active,
  .toast-slide-up-leave-active,
  .toast-slide-down-enter-active,
  .toast-slide-down-leave-active,
  .toast-slide-left-enter-active,
  .toast-slide-left-leave-active,
  .toast-slide-right-enter-active,
  .toast-slide-right-leave-active {
    transition: opacity 0.2s ease;
  }

  .toast-fade-enter-from,
  .toast-fade-leave-to,
  .toast-scale-enter-from,
  .toast-scale-leave-to,
  .toast-bounce-enter-from,
  .toast-bounce-leave-to,
  .toast-slide-up-enter-from,
  .toast-slide-up-leave-to,
  .toast-slide-down-enter-from,
  .toast-slide-down-leave-to,
  .toast-slide-left-enter-from,
  .toast-slide-left-leave-to,
  .toast-slide-right-enter-from,
  .toast-slide-right-leave-to {
    transform: none;
  }
}
</style>

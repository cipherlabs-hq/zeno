<template>
  <Teleport to="body">
    <Transition
      :name="transitionName"
      @before-enter="handleBeforeEnter"
      @enter="handleEnter"
      @leave="handleLeave"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave"
    >
      <div
        v-if="modelValue"
        ref="overlayRef"
        :class="overlayClasses"
        :style="overlayStyle"
        :data-testid="testId"
        @click="handleOverlayClick"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Glass blur background effect -->
        <div
          v-if="variant === 'glass'"
          class="z-modal-glass-bg"
          :style="glassStyle"
        ></div>

        <!-- Loading overlay with enhanced spinner -->
        <Transition name="z-modal-loading">
          <div v-if="loading" class="z-modal-loading">
            <div class="z-modal-loading__spinner">
              <div
                v-for="i in 3"
                :key="i"
                class="z-modal-loading__ring"
                :style="{ animationDelay: `${i * 0.15}s` }"
              ></div>
            </div>
            <div v-if="loadingText" class="z-modal-loading__text">
              {{ loadingText }}
            </div>
          </div>
        </Transition>

        <!-- Modal container with enhanced features -->
        <div
          :id="modalId"
          ref="modalRef"
          :class="modalClasses"
          :style="modalStyle"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="hasHeader ? titleId : undefined"
          :aria-describedby="bodyId"
          :aria-label="!hasHeader ? 'Modal dialog' : undefined"
          :aria-busy="loading"
          tabindex="-1"
          @click.stop
          @mousedown="handleModalMouseDown"
        >
          <!-- Drag handle for sheet variant -->
          <div
            v-if="variant === 'sheet' && draggable"
            class="z-modal__drag-handle"
          >
            <div class="z-modal__drag-indicator"></div>
          </div>

          <!-- Modal header with enhanced styling -->
          <header
            v-if="hasHeader"
            class="z-modal__header"
            :class="headerClasses"
          >
            <div v-if="hasIcon" class="z-modal__icon">
              <slot name="icon">
                <component :is="icon" v-if="icon" />
              </slot>
            </div>

            <div class="z-modal__header-content">
              <h2 :id="titleId" class="z-modal__title">
                <slot name="header">{{ title }}</slot>
              </h2>
              <p v-if="subtitle" class="z-modal__subtitle">{{ subtitle }}</p>
            </div>

            <div class="z-modal__header-actions">
              <slot name="header-actions" />
              <button
                v-if="!hideCloseButton && !persistent"
                type="button"
                class="z-modal__close"
                :class="{ 'z-modal__close--hover': isCloseHovered }"
                :aria-label="closeButtonLabel"
                @click="handleClose()"
                @mouseenter="isCloseHovered = true"
                @mouseleave="isCloseHovered = false"
              >
                <Transition name="z-modal-close-icon" mode="out-in">
                  <svg
                    v-if="!isCloseHovered"
                    key="x"
                    class="z-modal__close-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else
                    key="arrow"
                    class="z-modal__close-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M11 17L6 12L11 7M6 12H18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </Transition>
              </button>
            </div>
          </header>

          <!-- Progress bar for multi-step modals -->
          <div v-if="steps && currentStep" class="z-modal__progress">
            <div
              class="z-modal__progress-bar"
              :style="{ width: `${(currentStep / steps) * 100}%` }"
            ></div>
            <div class="z-modal__progress-text">
              Step {{ currentStep }} of {{ steps }}
            </div>
          </div>

          <!-- Modal body with enhanced scrolling -->
          <main :id="bodyId" class="z-modal__body" :class="bodyClasses">
            <div v-if="bodyLoading" class="z-modal__body-loading">
              <div v-for="i in 3" :key="i" class="z-modal__skeleton"></div>
            </div>
            <slot v-else />
          </main>

          <!-- Modal footer with enhanced actions -->
          <footer
            v-if="hasFooter"
            class="z-modal__footer"
            :class="footerClasses"
          >
            <slot name="footer">
              <div v-if="footerActions" class="z-modal__footer-actions">
                <button
                  v-for="(action, index) in footerActions"
                  :key="index"
                  :type="action.type || 'button'"
                  :class="getActionClasses(action)"
                  :disabled="action.disabled || loading"
                  @click="handleActionClick(action)"
                >
                  <span
                    v-if="action.loading"
                    class="z-modal__action-spinner"
                  ></span>
                  {{ action.label }}
                </button>
              </div>
            </slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted, nextTick, useSlots } from 'vue';
import { createFocusTrap, type FocusTrap } from '@usezeno/core';
import type {
  ZModalProps,
  ModalSize,
  ModalVariant,
  ModalPosition,
  ModalAnimation,
  ModalAction,
} from '../types/overlay';
import type { ZModalEmits } from '../types/events';

// Re-export types for backward compatibility
export type {
  ZModalProps,
  ModalSize,
  ModalVariant,
  ModalPosition,
  ModalAnimation,
  ModalAction,
  ZModalEmits,
};

const props = withDefaults(defineProps<ZModalProps>(), {
  size: 'md',
  variant: 'default',
  position: 'center',
  animation: 'fade',
  closeOnEsc: true,
  closeOnOverlay: true,
  hideCloseButton: false,
  closeButtonLabel: 'Close dialog',
  persistent: false,
  loading: false,
  bodyLoading: false,
  scrollable: true,
  zIndex: 1000,
  elevation: 3,
  blurAmount: 20,
  draggable: true,
  sheetMinHeight: 200,
  sheetMaxHeight: 90,
  showHeader: false,
  showFooter: false,
  overlayOpacity: 0.6,
  backdropBlur: true,
  disableFocusTrap: false,
});

const emit = defineEmits<ZModalEmits>();

// Get slots
const slots = useSlots();

// Slot checks
const hasHeader = computed(
  () => !!slots.header || props.title || props.showHeader
);
const hasIcon = computed(() => !!slots.icon || props.icon);
const hasFooter = computed(() => !!slots.footer || props.showFooter);

// Template refs
const overlayRef = ref<HTMLElement>();
const modalRef = ref<HTMLElement>();
const focusTrap = ref<FocusTrap>();

// State management
const isClosing = ref(false);
const isCloseHovered = ref(false);
const modalStack = ref<number>(0);
const sheetPosition = ref(0);
const isDragging = ref(false);
const dragStart = ref({ y: 0, modalY: 0 });
const touchVelocity = ref(0);

// Computed properties
const modalId = computed(
  () => props.id || `z-modal-${Math.random().toString(36).slice(2, 8)}`
);

const titleId = computed(() => `${modalId.value}-title`);
const bodyId = computed(() => `${modalId.value}-body`);

const overlayClasses = computed(() => [
  'z-modal-overlay',
  `z-modal-overlay--${props.position}`,
  `z-modal-overlay--${props.variant}`,
  {
    'z-modal-overlay--loading': props.loading,
    'z-modal-overlay--persistent': props.persistent,
    'z-modal-overlay--no-blur': !props.backdropBlur,
  },
]);

const modalClasses = computed(() => [
  'z-modal',
  `z-modal--${props.size}`,
  `z-modal--${props.variant}`,
  `z-modal--${props.position}`,
  {
    'z-modal--loading': props.loading,
    'z-modal--scrollable': props.scrollable,
    'z-modal--persistent': props.persistent,
    'z-modal--dragging': isDragging.value,
    'z-modal--with-subtitle': !!props.subtitle,
    'z-modal--with-icon': hasIcon.value,
  },
]);

const overlayStyle = computed(() => ({
  zIndex: props.zIndex,
  '--overlay-opacity': props.overlayOpacity,
}));

const modalStyle = computed(() => {
  const styles: Record<string, string> = {
    '--modal-elevation': String(props.elevation),
  };

  if (props.width) {
    styles.width =
      typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  if (props.maxWidth) {
    styles.maxWidth =
      typeof props.maxWidth === 'number'
        ? `${props.maxWidth}px`
        : props.maxWidth;
  }

  if (props.variant === 'sheet' && sheetPosition.value !== 0) {
    styles.transform = `translateY(${sheetPosition.value}px)`;
  }

  return styles;
});

const glassStyle = computed(() => ({
  '--glass-blur': `${props.blurAmount}px`,
}));

const headerClasses = computed(() => ({
  'z-modal__header--minimal': props.variant === 'minimal',
  'z-modal__header--glass': props.variant === 'glass',
}));

const bodyClasses = computed(() => ({
  'z-modal__body--no-header': !hasHeader.value,
  'z-modal__body--no-footer': !hasFooter.value,
}));

const footerClasses = computed(() => ({
  'z-modal__footer--minimal': props.variant === 'minimal',
}));

const transitionName = computed(() => {
  if (props.animation === 'sheet' || props.variant === 'sheet')
    return 'z-modal-sheet';
  if (props.animation === 'zoom') return 'z-modal-zoom';
  if (props.animation === 'flip') return 'z-modal-flip';
  if (props.animation === 'slide') {
    if (props.position === 'left') return 'z-modal-slide-left';
    if (props.position === 'right') return 'z-modal-slide-right';
    if (props.position === 'top') return 'z-modal-slide-down';
    if (props.position === 'bottom') return 'z-modal-slide-up';
  }
  if (props.animation === 'scale') return 'z-modal-scale';
  return 'z-modal-fade';
});

// Action button classes
const getActionClasses = (action: ModalAction) => {
  return [
    'z-modal__action',
    `z-modal__action--${action.variant || 'secondary'}`,
    {
      'z-modal__action--loading': action.loading,
    },
  ];
};

// Modal management
const handleClose = (force = false) => {
  if (props.persistent && !force) return;
  if (isClosing.value) return;

  isClosing.value = true;

  // Emit before-close event with close callback
  let shouldClose = true;
  emit('before-close', () => {
    shouldClose = false;
  });

  // Use nextTick to allow before-close handler to run
  nextTick(() => {
    if (shouldClose) {
      emit('update:modelValue', false);
      emit('close');
    }
    isClosing.value = false;
  });
};

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === overlayRef.value) {
    emit('overlay-click');
    if (props.closeOnOverlay && !props.persistent) {
      handleClose();
    }
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('escape');
    if (props.closeOnEsc && !props.persistent) {
      event.preventDefault();
      handleClose();
    }
  }
};

const handleActionClick = async (action: ModalAction) => {
  if (action.handler) {
    try {
      await action.handler();
    } catch (error) {
      console.error('Modal action error:', error);
    }
  }
};

// Touch handling for sheet variant
const handleTouchStart = (event: TouchEvent) => {
  if (props.variant !== 'sheet' || !props.draggable) return;

  const touch = event.touches[0];
  dragStart.value = {
    y: touch.clientY,
    modalY: sheetPosition.value,
  };
  isDragging.value = true;
  touchVelocity.value = 0;
};

const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value || props.variant !== 'sheet') return;

  const touch = event.touches[0];
  const deltaY = touch.clientY - dragStart.value.y;
  const newPosition = Math.max(0, dragStart.value.modalY + deltaY);

  sheetPosition.value = newPosition;
  touchVelocity.value = deltaY;
};

const handleTouchEnd = () => {
  if (!isDragging.value || props.variant !== 'sheet') return;

  isDragging.value = false;

  // Close if dragged down enough or with enough velocity
  const threshold = window.innerHeight * 0.3;
  if (sheetPosition.value > threshold || touchVelocity.value > 50) {
    handleClose();
  } else {
    // Animate back to position
    sheetPosition.value = 0;
  }
};

const handleModalMouseDown = (event: MouseEvent) => {
  // Prevent text selection while dragging
  if (props.variant === 'sheet' && props.draggable) {
    event.preventDefault();
  }
};

// Transition handlers
const handleBeforeEnter = (el: Element) => {
  const modal = (el as HTMLElement).querySelector('.z-modal') as HTMLElement;
  if (modal && props.variant === 'sheet') {
    modal.style.transform = 'translateY(100%)';
  }
};

const handleEnter = () => {
  modalStack.value++;

  // Only set body overflow on first modal
  if (modalStack.value === 1) {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
  }

  document.addEventListener('keydown', handleKeydown);

  // Reset sheet position
  if (props.variant === 'sheet') {
    sheetPosition.value = 0;
  }
};

const handleAfterEnter = () => {
  if (modalRef.value && !props.disableFocusTrap) {
    try {
      focusTrap.value = createFocusTrap(modalRef.value, {
        onEscape:
          props.closeOnEsc && !props.persistent
            ? () => handleClose()
            : undefined,
        initialFocus:
          modalRef.value.querySelector('[autofocus]') || modalRef.value,
        allowOutsideClick: true,
      });
      focusTrap.value.activate();
    } catch (error) {
      console.warn('Focus trap creation failed:', error);
    }
  }
  emit('open');
};

const handleLeave = () => {
  focusTrap.value?.deactivate();
  document.removeEventListener('keydown', handleKeydown);
};

const handleAfterLeave = () => {
  modalStack.value = Math.max(0, modalStack.value - 1);

  // Only restore body overflow when all modals are closed
  if (modalStack.value === 0) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  // Reset states
  sheetPosition.value = 0;
  isDragging.value = false;
};

// Utility functions
const getScrollbarWidth = (): number => {
  if (typeof window === 'undefined') return 0;

  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
};

// Watchers
watch(
  () => props.modelValue,
  newValue => {
    if (!newValue && focusTrap.value?.isActive()) {
      focusTrap.value.deactivate();
    }
  }
);

// Lifecycle hooks
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  focusTrap.value?.deactivate();

  // Clean up body styles if this was the last modal
  if (modalStack.value > 0) {
    modalStack.value = Math.max(0, modalStack.value - 1);
    if (modalStack.value === 0) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }
});

// Expose methods for programmatic control
defineExpose({
  /** Close the modal programmatically */
  close: (force = false) => handleClose(force),
  /** Focus the modal */
  focus: () => modalRef.value?.focus(),
  /** Get the modal element */
  getModalElement: () => modalRef.value,
  /** Get the overlay element */
  getOverlayElement: () => overlayRef.value,
  /** Check if modal is currently closing */
  isClosing: () => isClosing.value,
});
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Modal Component
 * Principles: Clear focus, smooth interactions, accessible overlay patterns
 * Inspired by Apple's depth system, Google's Material sheets, Microsoft's Fluent overlays
 * Accessibility: WCAG 2.1 Level AA compliance, focus management, keyboard navigation
 * Motion: Physics-based animations with spatial continuity
 */

/* Modal overlay with enhanced backdrop */
.z-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, var(--overlay-opacity, 0.6));
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(8px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: tokens.$spacing-4; /* 16px on mobile */
  overflow-y: auto;
  overscroll-behavior: contain;

  /* Spring physics for smooth appearance */
  animation: modal-overlay-fade-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Enhanced scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: tokens.$radius-full;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  &--no-blur {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  &--glass {
    background: rgba(255, 255, 255, 0.01);
    backdrop-filter: blur(30px) saturate(200%);
    -webkit-backdrop-filter: blur(30px) saturate(200%);
  }

  &--sheet {
    align-items: flex-end;
    padding: 0;
  }

  @media (min-width: 768px) {
    padding: tokens.$spacing-8; /* 32px on desktop */
  }
}

@keyframes modal-overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Position variants */
.z-modal-overlay--center {
  align-items: center;
  justify-content: center;
}

.z-modal-overlay--top {
  align-items: flex-start;
  justify-content: center;
  padding-top: tokens.$spacing-8; /* 32px */
}

.z-modal-overlay--bottom {
  align-items: flex-end;
  justify-content: center;
  padding-bottom: tokens.$spacing-8; /* 32px */
}

.z-modal-overlay--left {
  align-items: center;
  justify-content: flex-start;
  padding-left: tokens.$spacing-8; /* 32px */
}

.z-modal-overlay--right {
  align-items: center;
  justify-content: flex-end;
  padding-right: tokens.$spacing-8; /* 32px */
}

/* Glass background effect */
.z-modal-glass-bg {
  position: absolute;
  inset: -50%;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(139, 92, 246, 0.2) 0%,
    transparent 50%
  );
  filter: blur(var(--glass-blur, 20px));
  pointer-events: none;
  opacity: 0.6;
}

/* Enhanced loading overlay with modern spinner */
.z-modal-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: tokens.$spacing-4;
  z-index: 10;
}

.z-modal-loading__spinner {
  position: relative;
  width: 56px;
  height: 56px;
}

.z-modal-loading__ring {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-top-color: var(--zeno-color-accent-solid);
  border-radius: 50%;
  animation: modal-spinner-rotate 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;

  &:nth-child(2) {
    inset: 8px;
    border-top-color: var(--zeno-color-accent-solid);
    animation-duration: 2s;
    animation-direction: reverse;
  }

  &:nth-child(3) {
    inset: 16px;
    border-top-color: var(--zeno-color-accent-solid);
    animation-duration: 2.5s;
  }
}

.z-modal-loading__text {
  font-size: tokens.$typography-font-size-sm;
  color: var(--zeno-color-accent-on-solid);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@keyframes modal-spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

/* Loading transition */
.z-modal-loading-enter-active {
  transition: opacity 0.2s ease;
}

.z-modal-loading-leave-active {
  transition: opacity 0.3s ease;
}

.z-modal-loading-enter-from,
.z-modal-loading-leave-to {
  opacity: 0;
}

/* Modal container */
.z-modal {
  background: var(--zeno-color-background-surface);
  border-radius: tokens.$radius-xl; /* 24px for modern feel */
  max-height: calc(100vh - 32px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  position: relative;
  transform-origin: center;

  /* Apple-style shadow system based on elevation */
  --shadow-elevation-0: none;
  --shadow-elevation-1:
    0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.12),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  --shadow-elevation-2:
    0 2px 6px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  --shadow-elevation-3:
    0 5px 10px rgba(0, 0, 0, 0.12), 0 8px 30px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  --shadow-elevation-4:
    0 10px 25px rgba(0, 0, 0, 0.15), 0 20px 48px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  --shadow-elevation-5:
    0 20px 40px rgba(0, 0, 0, 0.2), 0 40px 80px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);

  box-shadow: var(--zeno-shadow-md);

  /* Dynamic elevation */
  &[style*='--modal-elevation: 0'] {
    box-shadow: var(--zeno-shadow-none);
  }
  &[style*='--modal-elevation: 1'] {
    box-shadow: var(--zeno-shadow-xs);
  }
  &[style*='--modal-elevation: 2'] {
    box-shadow: var(--zeno-shadow-sm);
  }
  &[style*='--modal-elevation: 3'] {
    box-shadow: var(--zeno-shadow-md);
  }
  &[style*='--modal-elevation: 4'] {
    box-shadow: var(--zeno-shadow-lg);
  }
  &[style*='--modal-elevation: 5'] {
    box-shadow: var(--zeno-shadow-xl);
  }

  /* Enhanced interaction feedback with spring physics */
  transition: all tokens.$motion-duration-lg cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity, box-shadow;

  @media (min-width: 768px) {
    max-height: calc(100vh - 64px);
  }
}

/* Size variants optimized for content */
.z-modal--xs {
  width: 320px;
  max-width: calc(100vw - 32px);
}

.z-modal--sm {
  width: 400px;
  max-width: calc(100vw - 32px);
}

.z-modal--md {
  width: 512px;
  max-width: calc(100vw - 32px);
}

.z-modal--lg {
  width: 768px;
  max-width: calc(100vw - 32px);
}

.z-modal--xl {
  width: 1024px;
  max-width: calc(100vw - 32px);
}

.z-modal--full {
  width: calc(100vw - 32px);
  height: calc(100vh - 32px);
  border-radius: tokens.$radius-lg;

  @media (min-width: 768px) {
    width: calc(100vw - 64px);
    height: calc(100vh - 64px);
  }
}

.z-modal--auto {
  width: auto;
  max-width: calc(100vw - 32px);
  min-width: 320px;
}

/* Variant styless */
.z-modal--default {
  border: 1px solid var(--zeno-color-border-subtle);
}

/* Glass morphism variant - Apple inspired */
.z-modal--glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1);

  .z-modal__header {
    background: rgba(255, 255, 255, 0.05);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .z-modal__footer {
    background: rgba(255, 255, 255, 0.05);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}

/* Sheet variant - Google Material inspired */
.z-modal--sheet {
  border-radius: tokens.$radius-xl tokens.$radius-xl 0 0;
  width: 100%;
  max-width: 100%;
  max-height: var(--sheet-max-height, 90%);
  min-height: var(--sheet-min-height, 200px);
  border: none;
  box-shadow:
    0 -4px 16px rgba(0, 0, 0, 0.12),
    0 -8px 32px rgba(0, 0, 0, 0.08);
  touch-action: pan-y;

  &.z-modal--dragging {
    transition: none;
  }
}

/* Minimal variant - clean and subtle */
.z-modal--minimal {
  border: none;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04);

  .z-modal__header {
    border: none;
    background: transparent;
    padding-bottom: tokens.$spacing-2;
  }

  .z-modal__footer {
    border: none;
    background: transparent;
    padding-top: tokens.$spacing-4;
  }
}

/* Brand variant - premium feel */
.z-modal--brand {
  background: linear-gradient(
    135deg,
    var(--zeno-color-accent-solid-hover) 0%,
    var(--zeno-color-accent-solid) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--zeno-color-accent-on-solid);

  .z-modal__header {
    background: rgba(0, 0, 0, 0.2);
    border-bottom-color: rgba(255, 255, 255, 0.2);
  }

  .z-modal__title,
  .z-modal__subtitle {
    color: var(--zeno-color-accent-on-solid);
  }

  .z-modal__body {
    color: var(--zeno-color-accent-on-solid);
  }

  .z-modal__footer {
    background: rgba(0, 0, 0, 0.2);
    border-top-color: rgba(255, 255, 255, 0.2);
  }

  .z-modal__close {
    color: var(--zeno-color-accent-on-solid);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

/* Semantic variants */
.z-modal--danger {
  border-color: var(--zeno-color-danger-solid);

  .z-modal__header {
    background: linear-gradient(
      to bottom,
      rgba(239, 68, 68, 0.08),
      rgba(239, 68, 68, 0.04)
    );
    border-color: rgba(239, 68, 68, 0.2);
  }

  .z-modal__icon {
    color: var(--zeno-color-danger-text);
  }
}

.z-modal--warning {
  border-color: var(--zeno-color-warning-solid);

  .z-modal__header {
    background: linear-gradient(
      to bottom,
      rgba(245, 158, 11, 0.08),
      rgba(245, 158, 11, 0.04)
    );
    border-color: rgba(245, 158, 11, 0.2);
  }

  .z-modal__icon {
    color: var(--zeno-color-warning-text);
  }
}

.z-modal--success {
  border-color: var(--zeno-color-success-solid);

  .z-modal__header {
    background: linear-gradient(
      to bottom,
      rgba(34, 197, 94, 0.08),
      rgba(34, 197, 94, 0.04)
    );
    border-color: rgba(34, 197, 94, 0.2);
  }

  .z-modal__icon {
    color: var(--zeno-color-success-text);
  }
}

/* Drag handle for sheet variant */
.z-modal__drag-handle {
  display: flex;
  justify-content: center;
  padding: tokens.$spacing-3 0;
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
}

.z-modal__drag-indicator {
  width: 48px;
  height: 4px;
  background: var(--zeno-color-border-default);
  border-radius: tokens.$radius-full;
  transition: all tokens.$motion-duration-md ease;

  .z-modal__drag-handle:hover & {
    background: var(--zeno-color-border-strong);
    width: 64px;
  }
}

/* Modal header */
.z-modal__header {
  display: flex;
  align-items: flex-start;
  gap: tokens.$spacing-4;
  padding: tokens.$spacing-6; /* 24px */
  border-bottom: 1px solid var(--zeno-color-border-subtle);
  background: var(--zeno-color-background-subtle);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  /* Subtle gradient for depth */
  background: linear-gradient(
    to bottom,
    var(--zeno-color-background-subtle),
    transparent
  );

  /* Reveal effect on hover */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(255, 255, 255, 0.05) 0%,
      transparent 50%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover::before {
    opacity: 1;
  }

  &--minimal {
    border: none;
    background: transparent;
    padding-bottom: tokens.$spacing-2;
  }

  &--glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
  }
}

.z-modal__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: tokens.$radius-lg;
  background: var(--zeno-color-background-muted);
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
}

.z-modal__header-content {
  flex: 1;
  min-width: 0;
}

.z-modal__title {
  font-size: tokens.$typography-font-size-xl; /* 20px */
  font-weight: tokens.$typography-font-weight-bold; /* 700 */
  line-height: tokens.$typography-line-height-tight;
  color: var(--zeno-color-text-primary);
  margin: 0;

  /* Enhanced readability */
  letter-spacing: -0.01em;
}

.z-modal__subtitle {
  margin: tokens.$spacing-1 0 0;
  font-size: tokens.$typography-font-size-sm;
  color: var(--zeno-color-text-secondary);
  line-height: tokens.$typography-line-height-normal;
}

.z-modal__header-actions {
  display: flex;
  align-items: center;
  gap: tokens.$spacing-2;
  flex-shrink: 0;
}

/* Close button */
.z-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: tokens.$radius-full;
  color: var(--zeno-color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  /* Enhanced interaction feedback with spring physics */
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
    background: rgba(239, 68, 68, 0.1);
    color: var(--zeno-color-danger-text);
    transform: scale(1.1);

    &::before {
      opacity: 0.1;
      transform: scale(1);
    }
  }

  &--hover {
    .z-modal__close-icon {
      transform: rotate(-90deg);
    }
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px var(--zeno-color-background-surface),
      0 0 0 4px var(--zeno-color-accent-solid);
  }

  &:active {
    transform: scale(0.9);
  }
}

.z-modal__close-icon {
  width: 20px;
  height: 20px;
  transition: transform tokens.$motion-duration-lg
    cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Close icon transition */
.z-modal-close-icon-enter-active,
.z-modal-close-icon-leave-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.z-modal-close-icon-enter-from {
  opacity: 0;
  transform: scale(0) rotate(-180deg);
}

.z-modal-close-icon-leave-to {
  opacity: 0;
  transform: scale(0) rotate(180deg);
}

/* Progress bar for multi-step modals */
.z-modal__progress {
  position: relative;
  height: 4px;
  background: var(--zeno-color-background-muted);
  overflow: hidden;
}

.z-modal__progress-bar {
  height: 100%;
  background: var(--zeno-color-accent-solid);
  transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.z-modal__progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: tokens.$typography-font-size-xs;
  font-weight: tokens.$typography-font-weight-medium;
  color: var(--zeno-color-text-primary);
  white-space: nowrap;
}

/* Modal body */
.z-modal__body {
  padding: tokens.$spacing-6; /* 24px */
  flex: 1;
  color: var(--zeno-color-text-primary);
  line-height: tokens.$typography-line-height-relaxed;
  position: relative;

  /* Smooth iOS-style scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--zeno-color-border-subtle) transparent;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--zeno-color-border-default);
    border-radius: tokens.$radius-full;
    border: 2px solid transparent;
    background-clip: padding-box;

    &:hover {
      background: var(--zeno-color-border-strong);
    }
  }

  .z-modal--scrollable & {
    overflow-y: auto;
    overscroll-behavior: contain;

    /* Momentum scrolling on iOS */
    -webkit-overflow-scrolling: touch;
  }

  .z-modal:not(.z-modal--scrollable) & {
    overflow: visible;
  }

  &--no-header {
    padding-top: tokens.$spacing-8;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
  }

  &--no-footer {
    padding-bottom: tokens.$spacing-8;
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
  }
}

/* Body loading state with skeleton */
.z-modal__body-loading {
  display: flex;
  flex-direction: column;
  gap: tokens.$spacing-4;
}

.z-modal__skeleton {
  height: 16px;
  background: linear-gradient(
    90deg,
    var(--zeno-color-background-subtle) 0%,
    var(--zeno-color-background-muted) 50%,
    var(--zeno-color-background-subtle) 100%
  );
  background-size: 200% 100%;
  border-radius: tokens.$radius-sm;
  animation: skeleton-shimmer 1.5s infinite;

  &:nth-child(1) {
    width: 80%;
  }
  &:nth-child(2) {
    width: 60%;
  }
  &:nth-child(3) {
    width: 70%;
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

/* Modal footer */
.z-modal__footer {
  padding: tokens.$spacing-6; /* 24px */
  border-top: 1px solid var(--zeno-color-border-subtle);
  background: var(--zeno-color-background-subtle);
  display: flex;
  gap: tokens.$spacing-3; /* 12px */
  justify-content: flex-end;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;

  /* Subtle gradient */
  background: linear-gradient(
    to top,
    var(--zeno-color-background-subtle),
    transparent
  );

  &--minimal {
    border: none;
    background: transparent;
    padding-top: tokens.$spacing-4;
  }

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    align-items: stretch;

    /* Stack buttons on mobile */
    > * {
      width: 100%;
    }
  }
}

.z-modal__footer-actions {
  display: flex;
  gap: tokens.$spacing-3;
  align-items: center;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    width: 100%;

    > * {
      width: 100%;
    }
  }
}

/* Action buttons */
.z-modal__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: tokens.$spacing-2;
  padding: tokens.$spacing-2 tokens.$spacing-5;
  border-radius: tokens.$radius-lg;
  font-size: tokens.$typography-font-size-md;
  font-weight: tokens.$typography-font-weight-medium;
  line-height: tokens.$typography-line-height-tight;
  cursor: pointer;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  transition: all tokens.$motion-duration-md cubic-bezier(0.34, 1.56, 0.64, 1);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px var(--zeno-color-background-surface),
      0 0 0 4px var(--zeno-color-accent-solid);
  }

  /* Ripple effect */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, currentColor 0%, transparent 70%);
    opacity: 0;
    transform: scale(0);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:active::before {
    opacity: 0.2;
    transform: scale(2);
    transition: none;
  }
}

.z-modal__action--primary {
  background: var(--zeno-color-accent-solid);
  color: var(--zeno-color-accent-on-solid);

  &:hover {
    background: var(--zeno-color-accent-solid-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
}

.z-modal__action--secondary {
  background: transparent;
  border-color: var(--zeno-color-border-default);
  color: var(--zeno-color-text-primary);

  &:hover {
    background: var(--zeno-color-background-muted);
    border-color: var(--zeno-color-border-strong);
  }
}

.z-modal__action--danger {
  background: var(--zeno-color-danger-solid);
  color: var(--zeno-color-danger-on-solid);

  &:hover {
    background: var(--zeno-color-danger-solid-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
  }
}

.z-modal__action--ghost {
  background: transparent;
  color: var(--zeno-color-text-secondary);

  &:hover {
    background: var(--zeno-color-background-subtle);
    color: var(--zeno-color-text-primary);
  }
}

.z-modal__action--brand {
  background: linear-gradient(
    135deg,
    var(--zeno-color-accent-solid-hover) 0%,
    var(--zeno-color-accent-solid) 100%
  );
  color: var(--zeno-color-accent-on-solid);

  &:hover {
    transform: translateY(-1px);
    box-shadow:
      0 4px 12px rgba(139, 92, 246, 0.3),
      0 8px 24px rgba(139, 92, 246, 0.2);
  }
}

.z-modal__action--loading {
  color: transparent;
  pointer-events: none;
}

.z-modal__action-spinner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: modal-spinner 0.8s linear infinite;
  }
}

@keyframes modal-spinner {
  to {
    transform: rotate(360deg);
  }
}

/* State modifiers */

/* Loading state */
.z-modal--loading {
  .z-modal__body {
    opacity: 0.6;
    pointer-events: none;
  }

  .z-modal__footer {
    pointer-events: none;
  }
}

/* Persistent state (cannot be closed) */
.z-modal--persistent {
  .z-modal__close {
    display: none;
  }
}

/* Position-specific styling */
.z-modal--top {
  align-self: flex-start;
}

.z-modal--bottom {
  align-self: flex-end;
}

.z-modal--center {
  align-self: center;
}

.z-modal--left {
  align-self: center;
  margin-right: auto;
}

.z-modal--right {
  align-self: center;
  margin-left: auto;
}

/* Transition animations */

/* Fade animation (default) */
.z-modal-fade-enter-active {
  transition: opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  .z-modal {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.z-modal-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1);

  .z-modal {
    transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
  }
}

.z-modal-fade-enter-from {
  opacity: 0;

  .z-modal {
    transform: translateY(24px) scale(0.95);
  }
}

.z-modal-fade-leave-to {
  opacity: 0;

  .z-modal {
    transform: translateY(-16px) scale(0.98);
  }
}

/* Scale animation */
.z-modal-scale-enter-active,
.z-modal-scale-leave-active {
  transition: opacity 0.3s ease;

  .z-modal {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.z-modal-scale-enter-from {
  opacity: 0;

  .z-modal {
    transform: scale(0.7);
  }
}

.z-modal-scale-leave-to {
  opacity: 0;

  .z-modal {
    transform: scale(1.1);
  }
}

/* Zoom animation */
.z-modal-zoom-enter-active {
  transition: opacity 0.3s ease;

  .z-modal {
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.z-modal-zoom-leave-active {
  transition: opacity 0.2s ease;

  .z-modal {
    transition: transform 0.3s ease-in;
  }
}

.z-modal-zoom-enter-from {
  opacity: 0;

  .z-modal {
    transform: scale(0.01) rotate(30deg);
  }
}

.z-modal-zoom-leave-to {
  opacity: 0;

  .z-modal {
    transform: scale(2) rotate(-10deg);
  }
}

/* Flip animation */
.z-modal-flip-enter-active,
.z-modal-flip-leave-active {
  transition: opacity 0.4s ease;

  .z-modal {
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-style: preserve-3d;
  }
}

.z-modal-flip-enter-from {
  opacity: 0;

  .z-modal {
    transform: rotateY(90deg);
  }
}

.z-modal-flip-leave-to {
  opacity: 0;

  .z-modal {
    transform: rotateY(-90deg);
  }
}

/* Slide animations */
.z-modal-slide-up-enter-active,
.z-modal-slide-down-enter-active,
.z-modal-slide-left-enter-active,
.z-modal-slide-right-enter-active {
  transition: opacity 0.3s ease;

  .z-modal {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.z-modal-slide-up-leave-active,
.z-modal-slide-down-leave-active,
.z-modal-slide-left-leave-active,
.z-modal-slide-right-leave-active {
  transition: opacity 0.2s ease;

  .z-modal {
    transition: transform 0.2s ease-in;
  }
}

.z-modal-slide-up-enter-from {
  opacity: 0;

  .z-modal {
    transform: translateY(100%);
  }
}

.z-modal-slide-up-leave-to {
  opacity: 0;

  .z-modal {
    transform: translateY(100%);
  }
}

.z-modal-slide-down-enter-from {
  opacity: 0;

  .z-modal {
    transform: translateY(-100%);
  }
}

.z-modal-slide-down-leave-to {
  opacity: 0;

  .z-modal {
    transform: translateY(-100%);
  }
}

.z-modal-slide-left-enter-from {
  opacity: 0;

  .z-modal {
    transform: translateX(-100%);
  }
}

.z-modal-slide-left-leave-to {
  opacity: 0;

  .z-modal {
    transform: translateX(-100%);
  }
}

.z-modal-slide-right-enter-from {
  opacity: 0;

  .z-modal {
    transform: translateX(100%);
  }
}

.z-modal-slide-right-leave-to {
  opacity: 0;

  .z-modal {
    transform: translateX(100%);
  }
}

/* Sheet animation (Material Design inspired) */
.z-modal-sheet-enter-active {
  transition: opacity 0.3s ease;

  .z-modal {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.z-modal-sheet-leave-active {
  transition: opacity 0.2s ease;

  .z-modal {
    transition: transform 0.3s cubic-bezier(0.4, 0, 1, 1);
  }
}

.z-modal-sheet-enter-from {
  opacity: 0;

  .z-modal {
    transform: translateY(100%);
  }
}

.z-modal-sheet-leave-to {
  opacity: 0;

  .z-modal {
    transform: translateY(100%);
  }
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-modal-overlay {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    animation: none;
  }

  .z-modal {
    transition: none;
  }

  .z-modal__close {
    transition: none;

    &::before {
      display: none;
    }

    &:hover {
      transform: none;
    }

    &:active {
      transform: none;
    }
  }

  .z-modal__close-icon {
    transition: none;
  }

  .z-modal__action {
    transition: none;

    &::before {
      display: none;
    }

    &:hover {
      transform: none;
    }
  }

  .z-modal__skeleton {
    animation: none;
    background: var(--zeno-color-background-subtle);
  }

  .z-modal-fade-enter-active,
  .z-modal-fade-leave-active,
  .z-modal-scale-enter-active,
  .z-modal-scale-leave-active,
  .z-modal-zoom-enter-active,
  .z-modal-zoom-leave-active,
  .z-modal-flip-enter-active,
  .z-modal-flip-leave-active,
  .z-modal-slide-up-enter-active,
  .z-modal-slide-up-leave-active,
  .z-modal-slide-down-enter-active,
  .z-modal-slide-down-leave-active,
  .z-modal-slide-left-enter-active,
  .z-modal-slide-left-leave-active,
  .z-modal-slide-right-enter-active,
  .z-modal-slide-right-leave-active,
  .z-modal-sheet-enter-active,
  .z-modal-sheet-leave-active {
    transition: opacity 0.2s ease;

    .z-modal {
      transition: none;
    }
  }

  .z-modal-fade-enter-from .z-modal,
  .z-modal-fade-leave-to .z-modal,
  .z-modal-scale-enter-from .z-modal,
  .z-modal-scale-leave-to .z-modal,
  .z-modal-zoom-enter-from .z-modal,
  .z-modal-zoom-leave-to .z-modal,
  .z-modal-flip-enter-from .z-modal,
  .z-modal-flip-leave-to .z-modal,
  .z-modal-slide-up-enter-from .z-modal,
  .z-modal-slide-up-leave-to .z-modal,
  .z-modal-slide-down-enter-from .z-modal,
  .z-modal-slide-down-leave-to .z-modal,
  .z-modal-slide-left-enter-from .z-modal,
  .z-modal-slide-left-leave-to .z-modal,
  .z-modal-slide-right-enter-from .z-modal,
  .z-modal-slide-right-leave-to .z-modal,
  .z-modal-sheet-enter-from .z-modal,
  .z-modal-sheet-leave-to .z-modal {
    transform: none;
  }
}

/* High contrast mode support */
@media (forced-colors: active) {
  .z-modal {
    border: 2px solid ButtonText;
    background: ButtonFace;
  }

  .z-modal__header {
    border-color: ButtonText;
    background: ButtonFace;
  }

  .z-modal__title,
  .z-modal__subtitle {
    color: ButtonText;
  }

  .z-modal__close {
    border: 1px solid ButtonText;
    color: ButtonText;

    &:hover {
      background: Highlight;
      color: HighlightText;
    }

    &:focus-visible {
      outline: 2px solid ButtonText;
    }
  }

  .z-modal__body {
    color: ButtonText;
  }

  .z-modal__footer {
    border-color: ButtonText;
    background: ButtonFace;
  }

  .z-modal__action {
    border: 1px solid ButtonText;
    color: ButtonText;

    &:hover {
      background: Highlight;
      color: HighlightText;
    }

    &:focus-visible {
      outline: 2px solid ButtonText;
    }
  }

  .z-modal__drag-indicator {
    background: ButtonText;
  }
}

/* Responsive design enhancements */
@media (max-width: 640px) {
  .z-modal-overlay {
    padding: 0;

    &--center,
    &--top,
    &--bottom {
      padding: tokens.$spacing-2; /* 8px on small screens */
    }
  }

  .z-modal {
    border-radius: tokens.$radius-lg; /* Smaller radius on mobile */
    max-height: calc(100vh - 16px);

    &--full {
      width: 100vw;
      height: 100vh;
      border-radius: 0;
      max-height: 100vh;
    }

    &--sheet {
      border-radius: tokens.$radius-xl tokens.$radius-xl 0 0;
    }
  }

  .z-modal__header,
  .z-modal__body,
  .z-modal__footer {
    padding: tokens.$spacing-4; /* 16px on mobile */
  }

  .z-modal__title {
    font-size: tokens.$typography-font-size-lg; /* 18px on mobile */
  }

  .z-modal__icon {
    width: 40px;
    height: 40px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .z-modal__close {
    width: 36px;
    height: 36px;
  }
}

@media (max-height: 600px) {
  .z-modal-overlay {
    align-items: flex-start;
    padding-top: tokens.$spacing-2; /* 8px */
  }

  .z-modal {
    max-height: calc(100vh - 16px);
  }

  .z-modal__body {
    padding-top: tokens.$spacing-4;
    padding-bottom: tokens.$spacing-4;
  }
}

/* Print styles */
@media print {
  .z-modal-overlay {
    position: static;
    background: none;
    padding: 0;
  }

  .z-modal {
    box-shadow: none;
    border: 1px solid #000;
    max-height: none;
  }

  .z-modal__close {
    display: none;
  }
}
</style>

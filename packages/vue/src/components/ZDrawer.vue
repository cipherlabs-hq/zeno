<template>
  <Teleport to="body">
    <Transition
      name="drawer"
      @enter="handleEnter"
      @leave="handleLeave"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave"
    >
      <div
        v-if="modelValue"
        class="z-drawer-overlay"
        @click="handleOverlayClick"
      >
        <div
          ref="drawerRef"
          :class="drawerClasses"
          :style="drawerStyles"
          role="dialog"
          :aria-modal="!persistent"
          :aria-labelledby="titleId"
          @click.stop
        >
          <header v-if="hasHeader" class="z-drawer__header">
            <div :id="titleId" class="z-drawer__title">
              <slot name="header">{{ title }}</slot>
            </div>
            <button
              v-if="!hideCloseButton"
              class="z-drawer__close"
              :aria-label="closeButtonLabel"
              type="button"
              @click="handleClose"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            </button>
          </header>

          <main class="z-drawer__body">
            <slot />
          </main>

          <footer v-if="hasFooter" class="z-drawer__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted, useSlots } from 'vue';
import { createFocusTrap, type FocusTrap } from '@usezeno/core';
import type { ZDrawerProps, ZDrawerEmits } from '../types';

const props = withDefaults(defineProps<ZDrawerProps>(), {
  side: 'right',
  width: '400px',
  persistent: false,
  closeOnEsc: true,
  hideCloseButton: false,
  closeButtonLabel: 'Close drawer',
});

const emit = defineEmits<ZDrawerEmits>();

// Get slots
const slots = useSlots();

// Slot checks
const hasHeader = computed(() => !!slots.header || props.title);
const hasFooter = computed(() => !!slots.footer);

const drawerRef = ref<HTMLElement>();
const focusTrap = ref<FocusTrap>();
const titleId = `drawer-title-${Math.random().toString(36).substr(2, 9)}`;

const drawerClasses = computed(() => [
  'z-drawer',
  `z-drawer--${props.side}`,
  {
    'z-drawer--persistent': props.persistent,
  },
]);

const drawerStyles = computed(() => ({
  width: props.width,
}));

const handleClose = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleOverlayClick = () => {
  if (!props.persistent) {
    handleClose();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEsc && !props.persistent) {
    event.preventDefault();
    handleClose();
  }
};

const handleEnter = () => {
  if (!props.persistent) {
    document.body.style.overflow = 'hidden';
  }
  document.addEventListener('keydown', handleKeydown);
};

const handleAfterEnter = () => {
  if (drawerRef.value && !props.persistent) {
    focusTrap.value = createFocusTrap(drawerRef.value, {
      onEscape: props.closeOnEsc ? handleClose : undefined,
    });
    focusTrap.value.activate();
  }
  emit('open');
};

const handleLeave = () => {
  if (!props.persistent) {
    focusTrap.value?.deactivate();
  }
  document.removeEventListener('keydown', handleKeydown);
};

const handleAfterLeave = () => {
  if (!props.persistent) {
    document.body.style.overflow = '';
  }
};

watch(
  () => props.modelValue,
  newValue => {
    if (!newValue && focusTrap.value?.isActive()) {
      focusTrap.value.deactivate();
    }
  }
);

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  if (!props.persistent) {
    document.body.style.overflow = '';
  }
  focusTrap.value?.deactivate();
});
</script>

<style scoped>
.z-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
}

.z-drawer-overlay:not(.z-drawer--persistent .z-drawer-overlay) {
  background: rgba(0, 0, 0, 0.5);
}

.z-drawer {
  background: var(--zeno-color-background-surface);
  box-shadow: var(--zeno-shadow-2xl);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.z-drawer--left {
  border-right: 1px solid var(--zeno-color-border-default);
}

.z-drawer--right {
  margin-left: auto;
  border-left: 1px solid var(--zeno-color-border-default);
}

.z-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--zeno-spacing-6);
  border-bottom: 1px solid var(--zeno-color-border-default);
  flex-shrink: 0;
}

.z-drawer__title {
  font-size: 1.125rem;
  font-weight: var(--zeno-font-weight-semibold);
  color: var(--zeno-color-text-primary);
  margin: 0;
}

.z-drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--zeno-radius-md);
  color: var(--zeno-color-text-secondary);
  cursor: pointer;
  transition: all var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-drawer__close:hover {
  background: var(--zeno-color-background-subtle);
  color: var(--zeno-color-text-primary);
}

.z-drawer__body {
  padding: var(--zeno-spacing-6);
  overflow-y: auto;
  flex: 1;
  color: var(--zeno-color-text-primary);
}

.z-drawer__footer {
  padding: var(--zeno-spacing-6);
  border-top: 1px solid var(--zeno-color-border-default);
  flex-shrink: 0;
}

/* Transition animations */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--zeno-motion-duration-lg)
    var(--zeno-motion-easing-ease-out);
}

.drawer-enter-active .z-drawer,
.drawer-leave-active .z-drawer {
  transition: transform var(--zeno-motion-duration-lg)
    var(--zeno-motion-easing-ease-out);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .z-drawer--left {
  transform: translateX(-100%);
}

.drawer-leave-to .z-drawer--left {
  transform: translateX(-100%);
}

.drawer-enter-from .z-drawer--right {
  transform: translateX(100%);
}

.drawer-leave-to .z-drawer--right {
  transform: translateX(100%);
}
</style>

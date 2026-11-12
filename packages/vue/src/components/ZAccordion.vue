<template>
  <div :class="accordionClasses" @keydown="handleKeyDown">
    <div
      v-for="(item, index) in items"
      :key="item.value"
      class="z-accordion__item"
      :class="{
        'z-accordion__item--expanded': isExpanded(item.value || item.id),
        'z-accordion__item--disabled': item.disabled,
      }"
    >
      <h3 class="z-accordion__header">
        <button
          :ref="el => setButtonRef(el as HTMLElement, index)"
          type="button"
          class="z-accordion__trigger"
          :aria-expanded="isExpanded(item.value || item.id)"
          :aria-controls="`panel-${item.value}`"
          :aria-disabled="item.disabled"
          :tabindex="getFocusTabIndex(index)"
          @click="handleToggle(item)"
          @focus="handleFocus(index)"
        >
          <span class="z-accordion__trigger-content">
            <span v-if="item.icon" class="z-accordion__icon">
              <slot :name="`icon-${item.value}`" :item="item">
                {{ item.icon }}
              </slot>
            </span>
            <span class="z-accordion__title">{{ item.title }}</span>
            <span v-if="item.badge" class="z-accordion__badge">{{
              item.badge
            }}</span>
          </span>
          <span class="z-accordion__chevron">
            <svg
              class="z-accordion__chevron-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </span>
        </button>
      </h3>
      <div
        :id="`panel-${item.value}`"
        class="z-accordion__panel"
        :aria-labelledby="`header-${item.value}`"
        :hidden="!isExpanded(item.value || item.id)"
        role="region"
      >
        <div class="z-accordion__content">
          <slot :name="item.value" :item="item">
            <div v-if="item.content">{{ item.content }}</div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ZAccordionProps, ZAccordionEmits, AccordionItem } from '../types';

const props = withDefaults(defineProps<ZAccordionProps>(), {
  multiple: false,
  collapsible: true,
  variant: 'default',
  size: 'md',
  disabled: false,
  reduceMotion: false,
});

const emit = defineEmits<ZAccordionEmits>();

// Refs
const buttonRefs = ref<HTMLElement[]>([]);
const currentFocusIndex = ref(0);

// Computed
const accordionClasses = computed(() => [
  'z-accordion',
  `z-accordion--${props.variant}`,
  `z-accordion--${props.size}`,
  {
    'z-accordion--disabled': props.disabled,
    'z-accordion--reduce-motion': props.reduceMotion,
  },
]);

const expandedItems = computed(() => {
  if (!props.modelValue) return [];
  return Array.isArray(props.modelValue)
    ? props.modelValue
    : [props.modelValue];
});

const enabledItems = computed(
  () => props.items?.filter(item => !item.disabled) || []
);

// Check motion preference (unused but kept for future use)
// const prefersReducedMotion = computed(() => {
//   if (typeof window !== 'undefined') {
//     return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
//   }
//   return false;
// });

// Methods
const setButtonRef = (el: HTMLElement | null, index: number) => {
  if (el) {
    buttonRefs.value[index] = el;
  }
};

const isExpanded = (value: string | number | undefined): boolean => {
  if (!value) return false;
  return expandedItems.value.includes(String(value));
};

const getFocusTabIndex = (index: number): number => {
  // Only the focused item should be tabbable
  return index === currentFocusIndex.value ? 0 : -1;
};

const handleToggle = (item: AccordionItem) => {
  if (item.disabled || props.disabled) return;

  const itemValue = String(item.value || item.id);
  const isCurrentlyExpanded = isExpanded(itemValue);
  let newValue: string | string[];

  if (props.multiple) {
    // Multiple mode: toggle item in array
    const current = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : [];
    if (isCurrentlyExpanded) {
      newValue = current.filter(v => v !== itemValue);
    } else {
      newValue = [...current, itemValue];
    }
  } else {
    // Single mode: toggle or set item
    if (isCurrentlyExpanded && props.collapsible) {
      newValue = '';
    } else {
      newValue = itemValue;
    }
  }

  emit('update:modelValue', newValue);
  emit('item-toggle', item, !isCurrentlyExpanded);
};

const handleFocus = (index: number) => {
  currentFocusIndex.value = index;
};

const handleKeyDown = (event: KeyboardEvent) => {
  const { key } = event;

  let nextIndex: number;

  switch (key) {
    case 'ArrowDown':
      event.preventDefault();
      nextIndex =
        currentFocusIndex.value < enabledItems.value.length - 1
          ? currentFocusIndex.value + 1
          : 0;
      break;
    case 'ArrowUp':
      event.preventDefault();
      nextIndex =
        currentFocusIndex.value > 0
          ? currentFocusIndex.value - 1
          : enabledItems.value.length - 1;
      break;
    case 'Home':
      event.preventDefault();
      nextIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      nextIndex = enabledItems.value.length - 1;
      break;
    case 'Enter':
    case ' ': {
      event.preventDefault();
      const targetItem = enabledItems.value[currentFocusIndex.value];
      if (targetItem) {
        handleToggle(targetItem);
      }
      return;
    }
    default:
      return;
  }

  // Find the actual item index in the full items array
  const enabledItem = enabledItems.value[nextIndex];
  const actualIndex =
    props.items?.findIndex(
      item => (item.value || item.id) === (enabledItem.value || enabledItem.id)
    ) ?? -1;

  if (actualIndex !== -1 && buttonRefs.value[actualIndex]) {
    buttonRefs.value[actualIndex].focus();
    currentFocusIndex.value = nextIndex;
  }
};

// Expose methods
defineExpose({
  expandItem: (value: string) => {
    const item = props.items?.find(i => (i.value || i.id) === value);
    if (item && !isExpanded(value)) {
      handleToggle(item);
    }
  },
  collapseItem: (value: string) => {
    const item = props.items?.find(i => (i.value || i.id) === value);
    if (item && isExpanded(value)) {
      handleToggle(item);
    }
  },
  expandAll: () => {
    if (props.multiple) {
      const allValues =
        props.items
          ?.filter(item => !item.disabled)
          .map(item => item.value || item.id) || [];
      emit('update:modelValue', allValues);
    }
  },
  collapseAll: () => {
    if (props.collapsible) {
      emit('update:modelValue', props.multiple ? [] : '');
    }
  },
});
</script>

<style scoped>
.z-accordion {
  border: 1px solid var(--zeno-color-border-default);
  border-radius: var(--zeno-radius-lg);
  overflow: hidden;
}

.z-accordion--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.z-accordion__item {
  border-bottom: 1px solid var(--zeno-color-border-default);

  &:last-child {
    border-bottom: none;
  }

  &.z-input--disabled {
    opacity: 0.6;
  }
}

.z-accordion__header {
  margin: 0;
}

.z-accordion__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--zeno-spacing-4);
  border: none;
  background: var(--zeno-color-background-surface);
  color: var(--zeno-color-text-primary);
  font-size: 0.875rem;
  font-weight: var(--zeno-font-weight-medium);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);

  &:hover:not([aria-disabled='true']) {
    background: var(--zeno-color-background-subtle);
  }

  &:focus {
    outline: none;
    background: var(--zeno-color-background-subtle);
    box-shadow: inset 0 0 0 2px var(--zeno-color-accent-solid);
  }

  &:first-child {
    border-top-left-radius: var(--zeno-radius-lg);
    border-top-right-radius: var(--zeno-radius-lg);
  }

  &:last-child {
    border-bottom-left-radius: var(--zeno-radius-lg);
    border-bottom-right-radius: var(--zeno-radius-lg);
  }

  &[aria-disabled='true'] {
    cursor: not-allowed;
  }
}

.z-accordion--sm .z-accordion__trigger {
  padding: var(--zeno-spacing-3);
  font-size: 0.75rem;
}

.z-accordion--lg .z-accordion__trigger {
  padding: var(--zeno-spacing-5);
  font-size: 1rem;
}

.z-accordion__trigger-content {
  display: flex;
  align-items: center;
  gap: var(--zeno-spacing-3);
  flex: 1;
}

.z-accordion__icon {
  display: flex;
  align-items: center;
  font-size: 1.125em;
  color: var(--zeno-color-text-secondary);
}

.z-accordion__title {
  flex: 1;
}

.z-accordion__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--zeno-spacing-1);
  background: var(--zeno-color-accent-solid);
  color: var(--zeno-color-text-inverse);
  font-size: 0.75rem;
  font-weight: var(--zeno-font-weight-semibold);
  border-radius: var(--zeno-radius-full);
}

.z-accordion__chevron {
  display: flex;
  align-items: center;
  margin-left: var(--zeno-spacing-2);
  color: var(--zeno-color-text-secondary);
  transition: transform var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-accordion__item--expanded .z-accordion__chevron {
  transform: rotate(180deg);
}

.z-accordion__chevron-icon {
  width: 16px;
  height: 16px;
}

.z-accordion__panel {
  overflow: hidden;
  transition: all var(--zeno-motion-duration-lg)
    var(--zeno-motion-easing-ease-out);
}

.z-accordion__content {
  padding: var(--zeno-spacing-4);
  padding-top: 0;
  color: var(--zeno-color-text-secondary);
  line-height: 1.6;
}

.z-accordion--sm .z-accordion__content {
  padding: var(--zeno-spacing-3);
  padding-top: 0;
  font-size: 0.875rem;
}

.z-accordion--lg .z-accordion__content {
  padding: var(--zeno-spacing-5);
  padding-top: 0;
  font-size: 1rem;
}

/* Variant styles */
.z-accordion--filled .z-accordion__trigger {
  background: var(--zeno-color-background-subtle);

  &:hover:not([aria-disabled='true']) {
    background: var(--zeno-color-background-muted);
  }
}

.z-accordion--filled .z-accordion__item--expanded .z-accordion__trigger {
  background: var(--zeno-color-accent-subtle);
}

.z-accordion--bordered .z-accordion__item {
  border: 1px solid var(--zeno-color-border-default);
  border-radius: var(--zeno-radius-md);
  margin-bottom: var(--zeno-spacing-2);

  &:last-child {
    margin-bottom: 0;
  }
}

.z-accordion--bordered .z-accordion__trigger {
  border-radius: var(--zeno-radius-md);
}

.z-accordion--bordered .z-accordion__panel {
  border-top: 1px solid var(--zeno-color-border-default);
  border-radius: 0 0 var(--zeno-radius-md) var(--zeno-radius-md);
}

/* Motion reduction */
.z-accordion--reduce-motion .z-accordion__chevron,
.z-accordion--reduce-motion .z-accordion__panel {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .z-accordion__chevron,
  .z-accordion__panel,
  .z-accordion__trigger {
    transition: none;
  }
}

/* Enhanced panel animations for smooth expand/collapse */
.z-accordion__panel[hidden] {
  display: block;
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.z-accordion__panel:not([hidden]) {
  max-height: 1000px;
  opacity: 1;
}

.z-accordion--reduce-motion .z-accordion__panel[hidden] {
  display: none;
}

.z-accordion--reduce-motion .z-accordion__panel:not([hidden]) {
  max-height: none;
}
</style>

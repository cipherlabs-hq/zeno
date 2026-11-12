<template>
  <div ref="tabsRef" :class="tabsClasses" :data-testid="testId">
    <!-- Tab list -->
    <div
      :id="`${tabsId}-tablist`"
      class="z-tabs__list"
      role="tablist"
      :aria-orientation="orientation"
      :aria-label="($attrs['aria-label'] as string) || 'Tabs'"
      @keydown="handleKeyDown"
    >
      <button
        v-for="(tab, index) in tabs"
        :id="`${tabsId}-tab-${tab.value}`"
        :key="tab.value"
        :ref="el => setTabRef(el as HTMLElement, index)"
        type="button"
        class="z-tabs__tab"
        :class="{
          'z-tabs__tab--active': isTabActive(tab.value),
          'z-tabs__tab--disabled': tab.disabled || disabled,
          'z-tabs__tab--closable': isTabClosable(tab),
        }"
        role="tab"
        :aria-selected="isTabActive(tab.value)"
        :aria-controls="`${tabsId}-panel-${tab.value}`"
        :aria-disabled="tab.disabled || disabled"
        :aria-describedby="
          tab.description ? `${tabsId}-desc-${tab.value}` : undefined
        "
        :tabindex="isTabActive(tab.value) ? 0 : -1"
        :disabled="tab.disabled || disabled"
        @click="handleTabClick(tab)"
        @focus="handleTabFocus(tab, index)"
        @blur="handleTabBlur(tab)"
      >
        <!-- Tab icon -->
        <span v-if="tab.icon" class="z-tabs__tab-icon">
          <slot
            :name="`icon-${tab.value}`"
            :tab="tab"
            :active="isTabActive(tab.value)"
          >
            {{ tab.icon }}
          </slot>
        </span>

        <!-- Tab text -->
        <span class="z-tabs__tab-text">{{ tab.label }}</span>

        <!-- Tab badge -->
        <span v-if="tab.badge" class="z-tabs__tab-badge">
          {{ tab.badge }}
        </span>

        <!-- Close button -->
        <button
          v-if="isTabClosable(tab)"
          type="button"
          class="z-tabs__tab-close"
          :aria-label="`Close ${tab.label} tab`"
          @click="handleTabClose(tab, $event)"
        >
          <svg class="z-tabs__close-icon" viewBox="0 0 12 12" fill="none">
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Hidden description for accessibility -->
        <span
          v-if="tab.description"
          :id="`${tabsId}-desc-${tab.value}`"
          class="z-tabs__tab-description"
        >
          {{ tab.description }}
        </span>
      </button>

      <!-- Active tab indicator -->
      <div
        class="z-tabs__indicator"
        :style="indicatorStyle"
        aria-hidden="true"
      />
    </div>

    <!-- Tab panels -->
    <div class="z-tabs__panels">
      <div
        v-for="(tab, index) in tabs"
        v-show="
          isTabActive(tab.value) || (keepAlive && shouldShowPanel(tab.value))
        "
        :id="`${tabsId}-panel-${tab.value}`"
        :key="`panel-${tab.value}`"
        :ref="el => setPanelRef(el as HTMLElement, index)"
        class="z-tabs__panel"
        :class="{
          'z-tabs__panel--active': isTabActive(tab.value),
          'z-tabs__panel--lazy': lazy && !shouldShowPanel(tab.value),
        }"
        role="tabpanel"
        :aria-labelledby="`${tabsId}-tab-${tab.value}`"
        :tabindex="isTabActive(tab.value) ? 0 : -1"
      >
        <slot
          v-if="!lazy || shouldShowPanel(tab.value)"
          :name="tab.value"
          :tab="tab"
          :active="isTabActive(tab.value)"
        >
          <div v-if="tab.content">{{ tab.content }}</div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  nextTick,
  onMounted,
  watch,
  watchEffect,
  onUnmounted,
} from 'vue';
import type { ZTabsProps, ZTabsEmits, TabItem } from '../types';

const props = withDefaults(defineProps<ZTabsProps>(), {
  orientation: 'horizontal',
  variant: 'line',
  size: 'md',
  disabled: false,
  lazy: false,
  keepAlive: false,
  centered: false,
  fitted: false,
  closable: false,
});

const emit = defineEmits<ZTabsEmits>();

// Template refs
const tabsRef = ref<HTMLElement>();
const tabRefs = ref<HTMLElement[]>([]);
const panelRefs = ref<HTMLElement[]>([]);

// State management
const currentFocusIndex = ref(0);
const indicatorStyle = ref({});
const loadedPanels = ref<Set<string | number>>(new Set());
const resizeObserver = ref<ResizeObserver | null>(null);

// Computed properties
const tabsId = computed(
  () => props.id || `z-tabs-${Math.random().toString(36).slice(2, 8)}`
);

const tabsClasses = computed(() => [
  'z-tabs',
  `z-tabs--${props.orientation}`,
  `z-tabs--${props.variant}`,
  `z-tabs--${props.size}`,
  {
    'z-tabs--disabled': props.disabled,
    'z-tabs--centered': props.centered,
    'z-tabs--fitted': props.fitted,
    'z-tabs--closable': props.closable,
  },
]);

const enabledTabs = computed(
  () => props.tabs?.filter(tab => !tab.disabled && !props.disabled) || []
);

const currentTabIndex = computed(
  () => props.tabs?.findIndex(tab => tab.value === props.modelValue) ?? -1
);

const currentTab = computed(() =>
  props.tabs?.find(tab => tab.value === props.modelValue)
);

const shouldShowPanel = computed(() => (tabValue: string | number) => {
  if (!props.lazy) return true;
  return loadedPanels.value.has(tabValue) || tabValue === props.modelValue;
});

const isTabActive = computed(() => (tabValue: string | number) => {
  return tabValue === props.modelValue;
});

const isTabClosable = computed(() => (tab: TabItem) => {
  return (props.closable || tab.closable) && !tab.disabled && !props.disabled;
});

// Utility functions
const setTabRef = (el: HTMLElement | null, index: number) => {
  if (el) {
    tabRefs.value[index] = el;
  }
};

const setPanelRef = (el: HTMLElement | null, index: number) => {
  if (el) {
    panelRefs.value[index] = el;
  }
};

// Indicator management
const updateIndicator = () => {
  nextTick(() => {
    const activeTabElement = tabRefs.value[currentTabIndex.value];
    if (
      !activeTabElement ||
      props.variant === 'pills' ||
      props.variant === 'soft-rounded' ||
      props.variant === 'solid-rounded'
    ) {
      indicatorStyle.value = { display: 'none' };
      return;
    }

    const rect = activeTabElement.getBoundingClientRect();
    const listElement = activeTabElement.parentElement;
    if (!listElement) return;

    const listRect = listElement.getBoundingClientRect();

    if (props.orientation === 'horizontal') {
      indicatorStyle.value = {
        width: `${rect.width}px`,
        height: '3px',
        transform: `translateX(${rect.left - listRect.left}px)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'block',
      };
    } else {
      indicatorStyle.value = {
        width: '3px',
        height: `${rect.height}px`,
        transform: `translateY(${rect.top - listRect.top}px)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'block',
      };
    }
  });
};

// Event handlers
const handleTabClick = (tab: TabItem) => {
  if (tab.disabled || props.disabled) return;

  const previousTab = currentTab.value ?? null;

  // Mark panel as loaded for lazy loading
  if (props.lazy) {
    loadedPanels.value.add(tab.value);
  }

  emit('update:modelValue', tab.value);
  emit('tab-change', tab, previousTab);
};

const handleTabClose = (tab: TabItem, event: Event) => {
  event.stopPropagation();
  if (tab.disabled || props.disabled) return;

  emit('tab-close', tab);
};

const handleTabFocus = (tab: TabItem, index: number) => {
  if (tab.disabled || props.disabled) return;

  currentFocusIndex.value = index;
  emit('tab-focus', tab);
};

const handleTabBlur = (tab: TabItem) => {
  if (tab.disabled || props.disabled) return;

  emit('tab-blur', tab);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  const { key } = event;
  const isHorizontal = props.orientation === 'horizontal';

  let nextIndex = currentFocusIndex.value;

  switch (key) {
    case 'ArrowLeft':
      if (isHorizontal) {
        event.preventDefault();
        nextIndex =
          currentFocusIndex.value > 0
            ? currentFocusIndex.value - 1
            : enabledTabs.value.length - 1;
      }
      break;
    case 'ArrowRight':
      if (isHorizontal) {
        event.preventDefault();
        nextIndex =
          currentFocusIndex.value < enabledTabs.value.length - 1
            ? currentFocusIndex.value + 1
            : 0;
      }
      break;
    case 'ArrowUp':
      if (!isHorizontal) {
        event.preventDefault();
        nextIndex =
          currentFocusIndex.value > 0
            ? currentFocusIndex.value - 1
            : enabledTabs.value.length - 1;
      }
      break;
    case 'ArrowDown':
      if (!isHorizontal) {
        event.preventDefault();
        nextIndex =
          currentFocusIndex.value < enabledTabs.value.length - 1
            ? currentFocusIndex.value + 1
            : 0;
      }
      break;
    case 'Home':
      event.preventDefault();
      nextIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      nextIndex = enabledTabs.value.length - 1;
      break;
    case 'Enter':
    case ' ': {
      event.preventDefault();
      const targetTab = enabledTabs.value[currentFocusIndex.value];
      if (targetTab) {
        handleTabClick(targetTab);
      }
      return;
    }
    default:
      return;
  }

  // Find the actual tab index in the full tabs array
  const enabledTab = enabledTabs.value[nextIndex];
  const actualIndex =
    props.tabs?.findIndex(tab => tab.value === enabledTab.value) ?? -1;

  if (actualIndex !== -1 && tabRefs.value[actualIndex]) {
    tabRefs.value[actualIndex].focus();
    currentFocusIndex.value = nextIndex;
  }
};

// Responsive behavior
const setupResizeObserver = () => {
  if (typeof ResizeObserver !== 'undefined' && tabsRef.value) {
    resizeObserver.value = new ResizeObserver(() => {
      updateIndicator();
    });
    resizeObserver.value.observe(tabsRef.value);
  }
};

const cleanupResizeObserver = () => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
    resizeObserver.value = null;
  }
};

// Watchers
watch(
  () => props.modelValue,
  newValue => {
    // Mark panel as loaded for lazy loading
    if (props.lazy && newValue) {
      loadedPanels.value.add(newValue);
    }
    updateIndicator();
  },
  { immediate: true }
);

watch(
  () => props.tabs,
  () => {
    updateIndicator();
  },
  { deep: true, flush: 'post' }
);

watch(
  () => [props.orientation, props.variant],
  () => {
    updateIndicator();
  },
  { flush: 'post' }
);

// Initialize lazy loading with current tab
watchEffect(() => {
  if (props.lazy && props.modelValue) {
    loadedPanels.value.add(props.modelValue);
  }
});

// Lifecycle hooks
onMounted(() => {
  nextTick(() => {
    updateIndicator();
    setupResizeObserver();

    // Set initial focus index
    const activeIndex = enabledTabs.value.findIndex(
      tab => tab.value === props.modelValue
    );
    currentFocusIndex.value = Math.max(0, activeIndex);
  });
});

onUnmounted(() => {
  cleanupResizeObserver();
});

// Expose methods for programmatic control
defineExpose({
  /** Focus a specific tab by value */
  focusTab: (value: string) => {
    const index = props.tabs?.findIndex(tab => tab.value === value) ?? -1;
    if (
      index !== -1 &&
      tabRefs.value[index] &&
      !props.tabs?.[index]?.disabled
    ) {
      tabRefs.value[index].focus();
    }
  },

  /** Get the currently active tab */
  getActiveTab: () => currentTab.value,

  /** Get all tab references */
  getTabRefs: () => tabRefs.value,

  /** Get all panel references */
  getPanelRefs: () => panelRefs.value,

  /** Update indicator position manually */
  updateIndicator,

  /** Get the tabs list element */
  getTabsElement: () => tabsRef.value,

  /** Check if a tab is currently active */
  isTabActive: (value: string) => value === props.modelValue,

  /** Get all enabled tabs */
  getEnabledTabs: () => enabledTabs.value,
});
</script>

<style lang="scss" scoped>
@use '../tokens.scss' as tokens;

/* Tabs Component
 * Principles: Clear navigation, intuitive content organization, seamless interactions
 * Accessibility: WCAG 2.1 Level AA compliance, keyboard navigation, screen reader support
 * Motion: Smooth indicator animations with spatial continuity
 */

.z-tabs {
  /* Base foundation */
  display: flex;
  font-family: tokens.$typography-font-family-primary;
  width: 100%;

  /* Physics-based transitions */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
}

/* Orientation layouts */
.z-tabs--horizontal {
  flex-direction: column;
  gap: tokens.$spacing-0; /* No gap for horizontal tabs */
}

.z-tabs--vertical {
  flex-direction: row;
  gap: tokens.$spacing-4; /* 16px gap for vertical tabs */
  align-items: flex-start;
}

/* Tab list container with enhanced design */
.z-tabs__list {
  position: relative;
  display: flex;
  background: var(--zeno-color-background-surface);
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */

  /* Hide scrollbar for WebKit browsers */
  &::-webkit-scrollbar {
    display: none;
  }
}

.z-tabs--horizontal .z-tabs__list {
  flex-direction: row;
  border-bottom: 2px solid var(--zeno-color-border-subtle);
  width: 100%;
}

.z-tabs--vertical .z-tabs__list {
  flex-direction: column;
  border-right: 2px solid var(--zeno-color-border-subtle);
  min-width: 200px;
  max-width: 280px;
  flex-shrink: 0;
}

/* Layout modifiers */
.z-tabs--centered .z-tabs__list {
  justify-content: center;
}

.z-tabs--fitted .z-tabs__list {
  width: 100%;

  .z-tabs__tab {
    flex: 1;
    justify-content: center;
  }
}

/* Individual tab styling with enhanced interaction */
.z-tabs__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: tokens.$spacing-2; /* 8px */
  border: none;
  background: transparent;
  color: var(--zeno-color-text-secondary);
  font-weight: tokens.$typography-font-weight-medium; /* 500 */
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;

  /* Enhanced touch targets */
  min-height: 44px; /* iOS Human Interface Guidelines minimum */

  /* Physics-based motion choreography */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;
  will-change: color, background-color, transform;

  /* Hover enhancement */
  &:hover:not(.z-tabs__tab--disabled) {
    color: var(--zeno-color-text-primary);
    background: var(--zeno-color-background-subtle);
    transform: translateY(-1px);
  }

  /* Enhanced focus accessibility */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--zeno-color-accent-solid), 0.15);
    border-radius: tokens.$radius-sm;
  }

  /* Active state with enhanced feedback */
  &.z-tabs__tab--active {
    color: var(--zeno-color-accent-text);
    background: transparent;
    font-weight: tokens.$typography-font-weight-semibold; /* 600 */

    &:hover {
      color: var(--zeno-color-accent-text);
      transform: none;
    }
  }

  /* Disabled state */
  &.z-tabs__tab--disabled {
    color: var(--zeno-color-text-tertiary);
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.6;

    &:hover {
      transform: none;
    }
  }
}

/* Size variants optimized for readability */
.z-tabs--sm {
  .z-tabs__tab {
    padding: tokens.$spacing-2 tokens.$spacing-3; /* 8px 12px */
    font-size: tokens.$typography-font-size-sm; /* 14px */
    min-height: 36px;
  }
}

.z-tabs--md {
  .z-tabs__tab {
    padding: tokens.$spacing-3 tokens.$spacing-4; /* 12px 16px */
    font-size: tokens.$typography-font-size-md; /* 16px */
    min-height: 44px;
  }
}

.z-tabs--lg {
  .z-tabs__tab {
    padding: tokens.$spacing-4 tokens.$spacing-5; /* 16px 20px */
    font-size: tokens.$typography-font-size-lg; /* 18px */
    min-height: 52px;
  }
}

/* Tab content elements */
.z-tabs__tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  flex-shrink: 0;

  /* Icon animation on active */
  transition: transform tokens.$motion-duration-md
    tokens.$motion-easing-ease-out;

  .z-tabs__tab--active & {
    transform: scale(1.1);
  }
}

.z-tabs__tab-text {
  flex: 1;
  line-height: tokens.$typography-line-height-normal;
}

.z-tabs__tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 tokens.$spacing-1; /* 0 4px */
  background: var(--zeno-color-accent-solid);
  color: var(--zeno-color-text-inverse);
  font-size: tokens.$typography-font-size-xs; /* 12px */
  font-weight: tokens.$typography-font-weight-bold; /* 700 */
  border-radius: tokens.$radius-full;
  flex-shrink: 0;

  /* Badge animation */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;

  .z-tabs__tab--active & {
    background: var(--zeno-color-accent-solid);
    transform: scale(1.05);
  }
}

/* Close button styling */
.z-tabs__tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  margin: 0;
  margin-left: tokens.$spacing-1; /* 4px */
  border: none;
  background: transparent;
  border-radius: tokens.$radius-sm;
  cursor: pointer;
  color: var(--zeno-color-text-secondary);
  flex-shrink: 0;

  /* Enhanced interaction feedback */
  transition: all tokens.$motion-duration-md tokens.$motion-easing-ease-out;

  &:hover {
    background: var(--zeno-color-danger-subtle);
    color: var(--zeno-color-danger-text);
    transform: scale(1.1);
  }

  &:focus {
    outline: 2px solid var(--zeno-color-focus-ring);
    outline-offset: 1px;
  }
}

.z-tabs__close-icon {
  width: 12px;
  height: 12px;
  stroke: currentColor;
}

/* Hidden description for accessibility */
.z-tabs__tab-description {
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

/* Active tab indicator with enhanced animation */
.z-tabs__indicator {
  position: absolute;
  background: var(--zeno-color-accent-solid);
  z-index: 2;
  border-radius: tokens.$radius-sm;

  /* Enhanced motion with physics */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, width, height;
}

.z-tabs--horizontal .z-tabs__indicator {
  bottom: -2px;
  left: 0;
  height: 3px;
}

.z-tabs--vertical .z-tabs__indicator {
  top: 0;
  right: -2px;
  width: 3px;
}

/* Tab panels container */
.z-tabs__panels {
  flex: 1;
  position: relative;
  min-height: 0; /* Allow panels to shrink */
}

.z-tabs__panel {
  padding: tokens.$spacing-4; /* 16px */
  outline: none;

  /* Panel animation */
  transition: opacity tokens.$motion-duration-md tokens.$motion-easing-ease-out;

  &:not(.z-tabs__panel--active) {
    opacity: 0;
    pointer-events: none;
  }

  &.z-tabs__panel--active {
    opacity: 1;
    pointer-events: auto;
  }

  &.z-tabs__panel--lazy {
    display: none;
  }
}

/* Variant styles following design system hierarchy */

/* Line variant - default with indicator */
.z-tabs--line {
  /* Default styling already applied */
}

/* Enclosed variant - card-like tabs */
.z-tabs--enclosed {
  .z-tabs__list {
    border: 2px solid var(--zeno-color-border-default);
    border-radius: tokens.$radius-lg tokens.$radius-lg 0 0;
    background: var(--zeno-color-background-subtle);
  }

  .z-tabs__tab {
    border-right: 1px solid var(--zeno-color-border-subtle);

    &:first-child {
      border-radius: tokens.$radius-lg 0 0 0;
    }

    &:last-child {
      border-right: none;
      border-radius: 0 tokens.$radius-lg 0 0;
    }

    &.z-tabs__tab--active {
      background: var(--zeno-color-background-surface);
      border-bottom: 2px solid var(--zeno-color-background-surface);
      margin-bottom: -2px;
      z-index: 1;
    }
  }

  .z-tabs__indicator {
    display: none; /* Hide indicator for enclosed tabs */
  }
}

/* Soft rounded variant - subtle background */
.z-tabs--soft-rounded {
  .z-tabs__tab {
    border-radius: tokens.$radius-md; /* 8px */
    margin: tokens.$spacing-1; /* 4px */

    &.z-tabs__tab--active {
      background: var(--zeno-color-background-muted);
      color: var(--zeno-color-text-primary);
    }
  }

  .z-tabs__indicator {
    display: none; /* Hide indicator for rounded tabs */
  }
}

/* Solid rounded variant - prominent background */
.z-tabs--solid-rounded {
  .z-tabs__tab {
    border-radius: tokens.$radius-md; /* 8px */
    margin: tokens.$spacing-1; /* 4px */

    &.z-tabs__tab--active {
      background: var(--zeno-color-accent-solid);
      color: var(--zeno-color-text-inverse);

      .z-tabs__tab-badge {
        background: var(--zeno-color-text-inverse);
        color: var(--zeno-color-accent-text);
      }
    }
  }

  .z-tabs__indicator {
    display: none; /* Hide indicator for solid tabs */
  }
}

/* Pills variant - fully rounded */
.z-tabs--pills {
  .z-tabs__tab {
    border-radius: tokens.$radius-full;
    margin: tokens.$spacing-1; /* 4px */

    &.z-tabs__tab--active {
      background: var(--zeno-color-accent-solid);
      color: var(--zeno-color-text-inverse);
      box-shadow: 0 2px 4px rgba(var(--zeno-color-accent-solid), 0.3);

      .z-tabs__tab-badge {
        background: var(--zeno-color-text-inverse);
        color: var(--zeno-color-accent-text);
      }
    }
  }

  .z-tabs__indicator {
    display: none; /* Hide indicator for pill tabs */
  }
}

/* State modifiers */

/* Disabled tabs */
.z-tabs--disabled {
  opacity: 0.6;
  pointer-events: none;

  .z-tabs__tab {
    cursor: not-allowed;
  }
}

/* Closable tabs spacing adjustment */
.z-tabs--closable {
  .z-tabs__tab {
    padding-right: tokens.$spacing-2; /* Reduce right padding when closable */
  }
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .z-tabs {
    transition: none;
  }

  .z-tabs__tab,
  .z-tabs__indicator,
  .z-tabs__panel,
  .z-tabs__tab-icon,
  .z-tabs__tab-badge,
  .z-tabs__tab-close {
    transition: none;
  }

  .z-tabs__tab:hover {
    transform: none;
  }

  .z-tabs__tab--active .z-tabs__tab-icon,
  .z-tabs__tab--active .z-tabs__tab-badge {
    transform: none;
  }
}

/* High contrast mode support */
@media (forced-colors: active) {
  .z-tabs__list {
    border-color: ButtonText;
  }

  .z-tabs__tab {
    color: ButtonText;
    border: 1px solid transparent;

    &:hover {
      border-color: ButtonText;
      background: Highlight;
      color: HighlightText;
    }

    &:focus {
      outline: 2px solid ButtonText;
    }

    &.z-tabs__tab--active {
      background: Highlight;
      color: HighlightText;
      border-color: ButtonText;
    }

    &.z-tabs__tab--disabled {
      color: GrayText;
      border-color: GrayText;
    }
  }

  .z-tabs__indicator {
    background: ButtonText;
  }

  .z-tabs__tab-badge {
    background: ButtonText;
    color: ButtonFace;
    border: 1px solid ButtonText;
  }

  .z-tabs__tab-close {
    border: 1px solid ButtonText;

    &:hover {
      background: ButtonText;
      color: ButtonFace;
    }
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .z-tabs--vertical {
    flex-direction: column;

    .z-tabs__list {
      flex-direction: row;
      border-right: none;
      border-bottom: 2px solid var(--zeno-color-border-subtle);
      min-width: auto;
      max-width: none;
      width: 100%;
    }

    .z-tabs__indicator {
      top: auto;
      bottom: -2px;
      right: auto;
      left: 0;
      width: auto;
      height: 3px;
    }
  }
}
</style>

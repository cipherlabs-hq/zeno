<template>
  <nav class="z-pagination" aria-label="Pagination" role="navigation">
    <div class="z-pagination__controls">
      <!-- Previous button -->
      <button
        type="button"
        class="z-pagination__button z-pagination__button--nav"
        :disabled="currentPage <= 1"
        :aria-label="previousLabel"
        @click="goToPrevious"
      >
        <svg
          class="z-pagination__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="15,18 9,12 15,6" />
        </svg>
        <span v-if="showLabels">{{ previousLabel }}</span>
      </button>

      <!-- Page numbers -->
      <div class="z-pagination__pages">
        <!-- First page -->
        <button
          v-if="showFirstLast && currentPage > 3"
          type="button"
          class="z-pagination__button z-pagination__button--page"
          :aria-label="`Go to page 1`"
          @click="goToPage(1)"
        >
          1
        </button>

        <!-- First ellipsis -->
        <span
          v-if="showFirstLast && currentPage > 4"
          class="z-pagination__ellipsis"
          aria-hidden="true"
        >
          ...
        </span>

        <!-- Visible page numbers -->
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          :class="[
            'z-pagination__button',
            'z-pagination__button--page',
            {
              'z-pagination__button--current': page === currentPage,
            },
          ]"
          :aria-label="`Go to page ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <!-- Last ellipsis -->
        <span
          v-if="showFirstLast && currentPage < totalPages - 3"
          class="z-pagination__ellipsis"
          aria-hidden="true"
        >
          ...
        </span>

        <!-- Last page -->
        <button
          v-if="showFirstLast && currentPage < totalPages - 2"
          type="button"
          class="z-pagination__button z-pagination__button--page"
          :aria-label="`Go to page ${totalPages}`"
          @click="goToPage(totalPages)"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- Next button -->
      <button
        type="button"
        class="z-pagination__button z-pagination__button--nav"
        :disabled="currentPage >= totalPages"
        :aria-label="nextLabel"
        @click="goToNext"
      >
        <span v-if="showLabels">{{ nextLabel }}</span>
        <svg
          class="z-pagination__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </button>
    </div>

    <!-- Page size selector -->
    <div v-if="showSizeChanger" class="z-pagination__size-changer">
      <label class="z-pagination__size-label">
        Show:
        <select
          v-model="currentPageSize"
          class="z-pagination__size-select"
          @change="handlePageSizeChange"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
        per page
      </label>
    </div>

    <!-- Jump to page -->
    <div v-if="showQuickJumper" class="z-pagination__quick-jumper">
      <label class="z-pagination__jump-label">
        Go to:
        <input
          v-model.number="jumpToPageValue"
          type="number"
          :min="1"
          :max="totalPages"
          class="z-pagination__jump-input"
          @keydown.enter="handleQuickJump"
          @blur="handleQuickJump"
        />
      </label>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ZPaginationProps as BaseZPaginationProps } from '../types';

// Extend the base props with additional local props
interface ZPaginationProps extends BaseZPaginationProps {
  totalPages?: number;
  showQuickJumper?: boolean;
  showFirstLast?: boolean;
  showLabels?: boolean;
  maxVisiblePages?: number;
  previousLabel?: string;
  nextLabel?: string;
  disabled?: boolean;
}

export interface ZPaginationEmits {
  'page-change': [page: number];
  'page-size-change': [pageSize: number];
}

const props = withDefaults(defineProps<ZPaginationProps>(), {
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  pageSizeOptions: () => [10, 20, 50, 100],
  showJumper: false,
  showQuickJumper: false, // Alias for showJumper
  showSizeChanger: false,
  showTotal: false,
  showFirstLast: true,
  showBoundaryButtons: true,
  showLabels: false,
  maxVisiblePages: 7,
  previousLabel: 'Previous',
  nextLabel: 'Next',
  disabled: false,
  variant: 'default',
  size: 'md',
});

const emit = defineEmits<ZPaginationEmits>();

// Reactive state
const currentPageSize = ref(props.pageSize);
const jumpToPageValue = ref(props.currentPage);

// Computed
const visiblePages = computed(() => {
  const { currentPage, totalPages, maxVisiblePages } = props;
  const pages: number[] = [];

  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Calculate the start and end of visible pages
    const sidePages = Math.floor((maxVisiblePages - 1) / 2);
    let startPage = Math.max(1, currentPage - sidePages);
    let endPage = Math.min(totalPages, currentPage + sidePages);

    // Adjust if we're at the beginning or end
    if (currentPage <= sidePages) {
      endPage = Math.min(totalPages, maxVisiblePages);
    } else if (currentPage > totalPages - sidePages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  }

  return pages;
});

// Methods
const goToPage = (page: number) => {
  if (
    props.disabled ||
    page < 1 ||
    page > props.totalPages ||
    page === props.currentPage
  ) {
    return;
  }
  emit('page-change', page);
};

const goToPrevious = () => {
  goToPage(props.currentPage - 1);
};

const goToNext = () => {
  goToPage(props.currentPage + 1);
};

const handlePageSizeChange = () => {
  emit('page-size-change', currentPageSize.value);
};

const handleQuickJump = () => {
  const page = jumpToPageValue.value;
  if (page >= 1 && page <= props.totalPages) {
    goToPage(page);
  } else {
    // Reset to current page if invalid
    jumpToPageValue.value = props.currentPage;
  }
};

// Watchers
watch(
  () => props.currentPage,
  newPage => {
    jumpToPageValue.value = newPage;
  }
);

watch(
  () => props.pageSize,
  newPageSize => {
    currentPageSize.value = newPageSize;
  }
);
</script>

<style scoped>
.z-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--zeno-spacing-4);
  flex-wrap: wrap;
}

.z-pagination__controls {
  display: flex;
  align-items: center;
  gap: var(--zeno-spacing-1);
}

.z-pagination__pages {
  display: flex;
  align-items: center;
  gap: var(--zeno-spacing-1);
}

.z-pagination__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
  border: 1px solid var(--zeno-color-border-default);
  border-radius: var(--zeno-radius-md);
  background: var(--zeno-color-background-surface);
  color: var(--zeno-color-text-primary);
  font-size: 0.875rem;
  font-weight: var(--zeno-font-weight-medium);
  cursor: pointer;
  user-select: none;
  transition: all var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);

  &:hover:not(:disabled) {
    background: var(--zeno-color-background-subtle);
    border-color: var(--zeno-color-focus-ring);
  }

  &:focus {
    outline: none;
    border-color: var(--zeno-color-focus-ring);
    box-shadow: 0 0 0 3px var(--zeno-color-accent-subtle);
  }

  &:disabled {
    background: var(--zeno-color-background-disabled);
    color: var(--zeno-color-text-disabled);
    border-color: var(--zeno-color-border-default);
    cursor: not-allowed;
  }

  &.z-input--nav {
    gap: var(--zeno-spacing-2);
  }

  &.z-input--current {
    background: var(--zeno-color-accent-solid);
    color: var(--zeno-color-text-inverse);
    border-color: var(--zeno-color-accent-solid);

    &:hover {
      background: var(--zeno-color-accent-solid);
      border-color: var(--zeno-color-accent-solid);
    }
  }
}

.z-pagination__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.z-pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  color: var(--zeno-color-text-secondary);
  font-size: 0.875rem;
  user-select: none;
}

.z-pagination__size-changer {
  display: flex;
  align-items: center;
}

.z-pagination__size-label {
  display: flex;
  align-items: center;
  gap: var(--zeno-spacing-2);
  font-size: 0.875rem;
  color: var(--zeno-color-text-primary);
}

.z-pagination__size-select {
  padding: var(--zeno-spacing-1) var(--zeno-spacing-2);
  border: 1px solid var(--zeno-color-border-default);
  border-radius: var(--zeno-radius-sm);
  background: var(--zeno-color-background-surface);
  color: var(--zeno-color-text-primary);
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--zeno-color-focus-ring);
    box-shadow: 0 0 0 3px var(--zeno-color-accent-subtle);
  }
}

.z-pagination__quick-jumper {
  display: flex;
  align-items: center;
}

.z-pagination__jump-label {
  display: flex;
  align-items: center;
  gap: var(--zeno-spacing-2);
  font-size: 0.875rem;
  color: var(--zeno-color-text-primary);
}

.z-pagination__jump-input {
  width: 60px;
  padding: var(--zeno-spacing-1) var(--zeno-spacing-2);
  border: 1px solid var(--zeno-color-border-default);
  border-radius: var(--zeno-radius-sm);
  background: var(--zeno-color-background-surface);
  color: var(--zeno-color-text-primary);
  font-size: 0.875rem;
  text-align: center;

  &:focus {
    outline: none;
    border-color: var(--zeno-color-focus-ring);
    box-shadow: 0 0 0 3px var(--zeno-color-accent-subtle);
  }

  /* Hide spinner arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .z-pagination {
    flex-direction: column;
    align-items: stretch;
    gap: var(--zeno-spacing-3);
  }

  .z-pagination__controls {
    justify-content: center;
  }

  .z-pagination__size-changer,
  .z-pagination__quick-jumper {
    justify-content: center;
  }
}
</style>

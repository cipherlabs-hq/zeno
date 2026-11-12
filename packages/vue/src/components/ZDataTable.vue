<template>
  <div :class="dataTableClasses">
    <!-- Header with search and controls -->
    <div v-if="showHeader" class="z-data-table__header">
      <div v-if="enableGlobalFilter" class="z-data-table__search">
        <input
          v-model="globalFilter"
          type="text"
          placeholder="Search..."
          class="z-data-table__search-input"
          aria-label="Search table data"
          @input="handleSearch"
        />
      </div>
      <div class="z-data-table__controls">
        <select
          v-if="showPageSizeSelector"
          v-model="currentPageSize"
          class="z-data-table__page-size"
          aria-label="Rows per page"
          @change="handlePageSizeChange"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }} per page
          </option>
        </select>
      </div>
    </div>

    <!-- Table container -->
    <div ref="containerRef" class="z-data-table__container">
      <table class="z-data-table__table" role="table">
        <thead class="z-data-table__thead">
          <tr class="z-data-table__header-row">
            <th
              v-if="selectable"
              class="z-data-table__header-cell z-data-table__header-cell--selection"
            >
              <input
                type="checkbox"
                :checked="allRowsSelected"
                :indeterminate="someRowsSelected"
                class="z-data-table__checkbox"
                aria-label="Select all rows"
                @change="handleSelectAllChange"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.id"
              :class="[
                'z-data-table__header-cell',
                {
                  'z-data-table__header-cell--sortable':
                    column.sortable !== false && sortable,
                  'z-data-table__header-cell--sorted': getSortDirection(
                    column.id
                  ),
                },
              ]"
              :style="getColumnStyle(column)"
              @click="handleSort(column)"
            >
              <span class="z-data-table__header-content">
                {{ column.header }}
                <span
                  v-if="column.sortable !== false && sortable"
                  class="z-data-table__sort-indicator"
                >
                  <svg
                    v-if="getSortDirection(column.id) === 'asc'"
                    class="z-data-table__sort-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 14l5-5 5 5H7z" />
                  </svg>
                  <svg
                    v-else-if="getSortDirection(column.id) === 'desc'"
                    class="z-data-table__sort-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5H7z" />
                  </svg>
                  <svg
                    v-else
                    class="z-data-table__sort-icon z-data-table__sort-icon--inactive"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 14l5-5 5 5H7z" />
                  </svg>
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody
          class="z-data-table__tbody"
          :style="{ height: `${virtualizer?.getTotalSize() ?? 0}px` }"
        >
          <tr
            v-for="virtualRow in virtualizer?.getVirtualItems() ?? []"
            :key="virtualRow.index"
            :class="[
              'z-data-table__row',
              {
                'z-data-table__row--selected': getRow(virtualRow.index)
                  ?.selected,
              },
            ]"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }"
          >
            <td
              v-if="selectable"
              class="z-data-table__cell z-data-table__cell--selection"
            >
              <input
                type="checkbox"
                :checked="getRow(virtualRow.index)?.selected || false"
                class="z-data-table__checkbox"
                :aria-label="`Select row ${virtualRow.index + 1}`"
                @change="handleRowSelectionChange(virtualRow.index)"
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.id"
              class="z-data-table__cell"
              :style="getColumnStyle(column)"
            >
              <slot
                :name="`cell-${column.id}`"
                :row="getRow(virtualRow.index)"
                :column="column"
                :value="getCellValue(getRow(virtualRow.index), column)"
              >
                {{ getCellValue(getRow(virtualRow.index), column) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination" class="z-data-table__pagination">
      <div class="z-data-table__pagination-info">
        Showing {{ startRow }} to {{ endRow }} of {{ totalRows }} entries
        <span v-if="globalFilter"
          >(filtered from {{ rawDataLength }} total entries)</span
        >
      </div>
      <ZPagination
        :current-page="currentPage + 1"
        :total-pages="totalPages"
        :show-size-changer="false"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue';
import {
  Virtualizer,
  elementScroll,
  observeElementOffset,
  observeElementRect,
} from '@tanstack/virtual-core';
import {
  TableCore,
  type TableColumn as CoreTableColumn,
  type TableRow as CoreTableRow,
  type SortDirection,
} from '@usezeno/core';
import ZPagination from './ZPagination.vue';
import type { ZDataTableProps, ZDataTableEmits } from '../types';

type RowData = Record<string, unknown>;
type TableColumn = CoreTableColumn<RowData>;
type TableRow = CoreTableRow<RowData>;

const props = withDefaults(defineProps<ZDataTableProps>(), {
  sortable: true,
  selectable: false,
  pageSize: 10,
  density: 'comfortable',
  showHeader: true,
  showPagination: true,
  showPageSizeSelector: true,
  enableGlobalFilter: true,
  pageSizeOptions: () => [10, 25, 50, 100],
  virtualHeight: 400,
});

const emit = defineEmits<ZDataTableEmits<TableRow>>();

// Refs
const containerRef = ref<HTMLElement>();
const tableCore = ref<TableCore<RowData>>();
const virtualizer = ref<Virtualizer<any, any>>();
const globalFilter = ref('');
const currentPageSize = ref(props.pageSize);

// Computed
const tableData = computed(() => props.data || props.rows || []);

const dataTableClasses = computed(() => [
  'z-data-table',
  `z-data-table--${props.density}`,
]);

const currentRows = computed(() => {
  if (!tableCore.value) return [];
  return props.showPagination
    ? tableCore.value.getPaginatedRows()
    : tableCore.value.getSortedRows();
});

const allRowsSelected = computed(() => {
  if (!tableCore.value || !props.selectable) return false;
  const filteredRows = tableCore.value.getFilteredRows();
  return (
    filteredRows.length > 0 &&
    filteredRows.every(row => tableCore.value!.getState().selection.has(row.id))
  );
});

const someRowsSelected = computed(() => {
  if (!tableCore.value || !props.selectable) return false;
  const filteredRows = tableCore.value.getFilteredRows();
  const selectedCount = filteredRows.filter(row =>
    tableCore.value!.getState().selection.has(row.id)
  ).length;
  return selectedCount > 0 && selectedCount < filteredRows.length;
});

const currentPage = computed(() => tableCore.value?.getCurrentPage() || 0);
const totalPages = computed(() => tableCore.value?.getPageCount() || 1);
const totalRows = computed(() => tableCore.value?.getTotalRows() || 0);
const rawDataLength = computed(() => tableData.value.length);

const startRow = computed(() => {
  const page = currentPage.value;
  const size = currentPageSize.value;
  return Math.min(page * size + 1, totalRows.value);
});

const endRow = computed(() => {
  const page = currentPage.value;
  const size = currentPageSize.value;
  return Math.min((page + 1) * size, totalRows.value);
});

// Initialize table core
const initializeTable = () => {
  if (!props.columns || props.columns.length === 0) return;

  tableCore.value = new TableCore({
    data: tableData.value,
    columns: props.columns,
    pageSize: currentPageSize.value,
    sortable: props.sortable,
    selectable: props.selectable,
    enableGlobalFilter: props.enableGlobalFilter,
    getRowId: props.getRowId,
  });

  if (globalFilter.value && tableCore.value) {
    tableCore.value.setGlobalFilter(globalFilter.value);
  }
};

// Initialize virtualizer
const initializeVirtualizer = () => {
  if (!containerRef.value) return;

  const rowHeight =
    props.density === 'compact' ? 32 : props.density === 'spacious' ? 56 : 44;

  virtualizer.value = new Virtualizer({
    count: currentRows.value.length,
    getScrollElement: () => containerRef.value!,
    estimateSize: () => rowHeight,
    overscan: 10,
    scrollToFn: elementScroll,
    observeElementRect,
    observeElementOffset,
  });
};

// Methods
const getSortDirection = (columnId: string): SortDirection => {
  if (!tableCore.value) return null;
  const sort = tableCore.value
    .getState()
    .sorting.find(s => s.columnId === columnId);
  return sort?.direction || null;
};

const getColumnStyle = (column: TableColumn) => {
  const styles: any = {};
  if (column.width) styles.width = `${column.width}px`;
  if (column.minWidth) styles.minWidth = `${column.minWidth}px`;
  if (column.maxWidth) styles.maxWidth = `${column.maxWidth}px`;
  return styles;
};

const getRow = (index: number): TableRow | undefined => {
  return currentRows.value[index];
};

const getCellValue = (row: TableRow | undefined, column: TableColumn): any => {
  if (!row) return '';

  if (column.accessorKey) {
    return (row.original as Record<string, unknown>)[column.accessorKey];
  }
  return '';
};

// Event handlers
const handleSort = (column: TableColumn) => {
  if (!tableCore.value || column.sortable === false || !props.sortable) return;

  tableCore.value.toggleSorting(column.id);
  const direction = getSortDirection(column.id);
  emit('sort-change', column.id, direction);

  // Reinitialize virtualizer after sorting
  nextTick(() => {
    initializeVirtualizer();
  });
};

const handleSearch = () => {
  if (!tableCore.value) return;
  tableCore.value.setGlobalFilter(globalFilter.value);

  // Reinitialize virtualizer after filtering
  nextTick(() => {
    initializeVirtualizer();
  });
};

const handlePageChange = (page: number) => {
  if (!tableCore.value) return;
  tableCore.value.setPageIndex(page - 1);
  emit('page-change', page);
};

const handlePageSizeChange = () => {
  if (!tableCore.value) return;
  tableCore.value.setPageSize(currentPageSize.value);
  emit('page-size-change', currentPageSize.value);

  // Reinitialize virtualizer with new page size
  nextTick(() => {
    initializeVirtualizer();
  });
};

const handleSelectAllChange = () => {
  if (!tableCore.value || !props.selectable) return;
  tableCore.value.toggleAllRowsSelection();
  emit('selection-change', tableCore.value.getSelectedRows());
};

const handleRowSelectionChange = (index: number) => {
  if (!tableCore.value || !props.selectable) return;

  const row = getRow(index);
  if (!row) return;

  tableCore.value.toggleRowSelection(row.id);

  if (tableCore.value.getState().selection.has(row.id)) {
    emit('row-select', row);
  } else {
    emit('row-deselect', row);
  }

  emit('selection-change', tableCore.value.getSelectedRows());
};

// Watchers
watch(
  () => props.rows,
  () => {
    if (tableCore.value) {
      tableCore.value.updateData(props.rows ?? []);
      nextTick(() => {
        initializeVirtualizer();
      });
    }
  },
  { deep: true }
);

watch(
  () => props.columns,
  () => {
    if (tableCore.value) {
      tableCore.value.updateColumns(props.columns ?? []);
      nextTick(() => {
        initializeVirtualizer();
      });
    }
  },
  { deep: true }
);

// Lifecycle
onMounted(() => {
  initializeTable();
  nextTick(() => {
    initializeVirtualizer();
  });
});

// Expose methods
defineExpose({
  getTableCore: () => tableCore.value,
  getSelectedRows: () => tableCore.value?.getSelectedRows() || [],
  clearSelection: () => {
    if (tableCore.value) {
      tableCore.value.resetSelection();
      emit('selection-change', []);
    }
  },
  resetTable: () => {
    if (tableCore.value) {
      tableCore.value.reset();
      globalFilter.value = '';
      nextTick(() => {
        initializeVirtualizer();
      });
    }
  },
});
</script>

<style scoped>
.z-data-table {
  display: flex;
  flex-direction: column;
  gap: var(--zeno-spacing-3);
  background: var(--zeno-color-background-surface);
  border-radius: var(--zeno-radius-lg);
  border: 1px solid var(--zeno-color-border-default);
}

.z-data-table__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--zeno-spacing-4);
  border-bottom: 1px solid var(--zeno-color-border-default);
  gap: var(--zeno-spacing-3);
}

.z-data-table__search {
  flex: 1;
  max-width: 300px;
}

.z-data-table__search-input {
  width: 100%;
  padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
  border: 1px solid var(--zeno-color-border-default);
  border-radius: var(--zeno-radius-md);
  background: var(--zeno-color-background-surface);
  color: var(--zeno-color-text-primary);
  font-size: 0.875rem;
  transition: border-color var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);

  &:focus {
    outline: none;
    border-color: var(--zeno-color-focus-ring);
    box-shadow: 0 0 0 3px var(--zeno-color-accent-subtle);
  }

  &::placeholder {
    color: var(--zeno-color-text-placeholder);
  }
}

.z-data-table__controls {
  display: flex;
  align-items: center;
  gap: var(--zeno-spacing-3);
}

.z-data-table__page-size {
  padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
  border: 1px solid var(--zeno-color-border-default);
  border-radius: var(--zeno-radius-md);
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

.z-data-table__container {
  position: relative;
  overflow: auto;
  height: 400px;
  border-bottom: 1px solid var(--zeno-color-border-default);
}

.z-data-table__table {
  width: 100%;
  border-collapse: collapse;
  position: relative;
}

.z-data-table__thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--zeno-color-background-subtle);
}

.z-data-table__header-row {
  border-bottom: 2px solid var(--zeno-color-border-default);
}

.z-data-table__header-cell {
  padding: var(--zeno-spacing-3) var(--zeno-spacing-4);
  text-align: left;
  font-weight: var(--zeno-font-weight-semibold);
  color: var(--zeno-color-text-primary);
  font-size: 0.875rem;
  background: var(--zeno-color-background-subtle);
  border-right: 1px solid var(--zeno-color-border-default);
  position: relative;

  &:last-child {
    border-right: none;
  }

  &.z-input--sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color var(--zeno-motion-duration-md)
      var(--zeno-motion-easing-ease-out);

    &:hover {
      background: var(--zeno-color-background-muted);
    }
  }

  &.z-input--sorted {
    background: var(--zeno-color-accent-subtle);
  }

  &.z-input--selection {
    width: 48px;
    padding: var(--zeno-spacing-3) var(--zeno-spacing-2);
  }
}

.z-data-table__header-content {
  display: flex;
  align-items: center;
  gap: var(--zeno-spacing-2);
}

.z-data-table__sort-indicator {
  display: flex;
  align-items: center;
}

.z-data-table__sort-icon {
  width: 16px;
  height: 16px;
  color: var(--zeno-color-accent-text);
  transition: color var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);

  &.z-input--inactive {
    color: var(--zeno-color-text-tertiary);
  }
}

.z-data-table__tbody {
  position: relative;
}

.z-data-table__row {
  border-bottom: 1px solid var(--zeno-color-border-default);
  transition: background-color var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);

  &:hover {
    background: var(--zeno-color-background-subtle);
  }

  &.z-input--selected {
    background: var(--zeno-color-accent-subtle);

    &:hover {
      background: var(--zeno-color-accent-subtle);
    }
  }
}

.z-data-table__cell {
  padding: var(--zeno-spacing-2) var(--zeno-spacing-4);
  color: var(--zeno-color-text-primary);
  font-size: 0.875rem;
  border-right: 1px solid var(--zeno-color-border-default);
  vertical-align: middle;

  &:last-child {
    border-right: none;
  }

  &.z-input--selection {
    width: 48px;
    padding: var(--zeno-spacing-2);
    text-align: center;
  }
}

.z-data-table__checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.z-data-table__pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--zeno-spacing-4);
  background: var(--zeno-color-background-subtle);
  border-radius: 0 0 var(--zeno-radius-lg) var(--zeno-radius-lg);
}

.z-data-table__pagination-info {
  font-size: 0.875rem;
  color: var(--zeno-color-text-secondary);
}

/* Density variants */
.z-data-table--compact .z-data-table__header-cell {
  padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
  font-size: 0.75rem;
}

.z-data-table--compact .z-data-table__cell {
  padding: var(--zeno-spacing-1) var(--zeno-spacing-3);
  font-size: 0.75rem;
}

.z-data-table--spacious .z-data-table__header-cell {
  padding: var(--zeno-spacing-4) var(--zeno-spacing-5);
  font-size: 1rem;
}

.z-data-table--spacious .z-data-table__cell {
  padding: var(--zeno-spacing-3) var(--zeno-spacing-5);
  font-size: 1rem;
}
</style>

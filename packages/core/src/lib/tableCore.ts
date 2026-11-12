export interface TableColumn<T = unknown> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (_row: T) => unknown;
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface TableRow<T = unknown> {
  id: string;
  original: T;
  selected?: boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface TableState {
  sorting: SortState[];
  pagination: PaginationState;
  selection: Set<string>;
  globalFilter: string;
}

export interface TableOptions<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  pageSize?: number;
  sortable?: boolean;
  selectable?: boolean;
  multiSort?: boolean;
  enableGlobalFilter?: boolean;
  getRowId?: (_row: T, _index: number) => string;
}

export class TableCore<T = unknown> {
  private data: T[];
  private columns: TableColumn<T>[];
  private state: TableState;
  private options: TableOptions<T>;

  constructor(options: TableOptions<T>) {
    this.options = options;
    this.data = options.data;
    this.columns = options.columns;
    this.state = {
      sorting: [],
      pagination: {
        pageIndex: 0,
        pageSize: options.pageSize || 10,
      },
      selection: new Set(),
      globalFilter: '',
    };
  }

  // Data access
  getRawData(): T[] {
    return this.data;
  }

  getColumns(): TableColumn<T>[] {
    return this.columns;
  }

  getRows(): TableRow<T>[] {
    return this.data.map((item, index) => ({
      id: this.options.getRowId?.(item, index) || String(index),
      original: item,
      selected: this.state.selection.has(this.getRowId(item, index)),
    }));
  }

  // Filtering
  getFilteredRows(): TableRow<T>[] {
    const rows = this.getRows();
    if (!this.state.globalFilter || !this.options.enableGlobalFilter) {
      return rows;
    }

    const filter = this.state.globalFilter.toLowerCase();
    return rows.filter(row => {
      return this.columns.some(column => {
        const value = this.getCellValue(row, column);
        return String(value).toLowerCase().includes(filter);
      });
    });
  }

  // Sorting
  getSortedRows(): TableRow<T>[] {
    const filteredRows = this.getFilteredRows();
    if (this.state.sorting.length === 0) {
      return filteredRows;
    }

    return [...filteredRows].sort((a, b) => {
      for (const sort of this.state.sorting) {
        const column = this.columns.find(col => col.id === sort.columnId);
        if (!column || !sort.direction) continue;

        const aValue = this.getCellValue(a, column);
        const bValue = this.getCellValue(b, column);

        let comparison = 0;
        if (aValue === null || aValue === undefined) comparison = 1;
        else if (bValue === null || bValue === undefined) comparison = -1;
        else if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;

        if (comparison !== 0) {
          return sort.direction === 'desc' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  // Pagination
  getPaginatedRows(): TableRow<T>[] {
    const sortedRows = this.getSortedRows();
    const { pageIndex, pageSize } = this.state.pagination;
    const start = pageIndex * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }

  getPageCount(): number {
    const totalRows = this.getFilteredRows().length;
    return Math.ceil(totalRows / this.state.pagination.pageSize);
  }

  getCurrentPage(): number {
    return this.state.pagination.pageIndex;
  }

  getPageSize(): number {
    return this.state.pagination.pageSize;
  }

  getTotalRows(): number {
    return this.getFilteredRows().length;
  }

  // State management
  setSorting(sorting: SortState[]): void {
    this.state.sorting = sorting;
  }

  toggleSorting(columnId: string): void {
    const currentSort = this.state.sorting.find(s => s.columnId === columnId);

    if (!this.options.multiSort) {
      // Single sort mode
      if (!currentSort) {
        this.state.sorting = [{ columnId, direction: 'asc' }];
      } else if (currentSort.direction === 'asc') {
        this.state.sorting = [{ columnId, direction: 'desc' }];
      } else {
        this.state.sorting = [];
      }
    } else {
      // Multi sort mode
      if (!currentSort) {
        this.state.sorting = [
          ...this.state.sorting,
          { columnId, direction: 'asc' },
        ];
      } else if (currentSort.direction === 'asc') {
        currentSort.direction = 'desc';
      } else {
        this.state.sorting = this.state.sorting.filter(
          s => s.columnId !== columnId
        );
      }
    }
  }

  setPageIndex(pageIndex: number): void {
    this.state.pagination.pageIndex = Math.max(
      0,
      Math.min(pageIndex, this.getPageCount() - 1)
    );
  }

  setPageSize(pageSize: number): void {
    this.state.pagination.pageSize = pageSize;
    this.state.pagination.pageIndex = 0; // Reset to first page
  }

  nextPage(): void {
    this.setPageIndex(this.state.pagination.pageIndex + 1);
  }

  previousPage(): void {
    this.setPageIndex(this.state.pagination.pageIndex - 1);
  }

  canNextPage(): boolean {
    return this.state.pagination.pageIndex < this.getPageCount() - 1;
  }

  canPreviousPage(): boolean {
    return this.state.pagination.pageIndex > 0;
  }

  // Selection
  selectRow(rowId: string): void {
    this.state.selection.add(rowId);
  }

  deselectRow(rowId: string): void {
    this.state.selection.delete(rowId);
  }

  toggleRowSelection(rowId: string): void {
    if (this.state.selection.has(rowId)) {
      this.deselectRow(rowId);
    } else {
      this.selectRow(rowId);
    }
  }

  selectAllRows(): void {
    const rows = this.getFilteredRows();
    rows.forEach(row => this.state.selection.add(row.id));
  }

  deselectAllRows(): void {
    this.state.selection.clear();
  }

  toggleAllRowsSelection(): void {
    const filteredRows = this.getFilteredRows();
    const allSelected = filteredRows.every(row =>
      this.state.selection.has(row.id)
    );

    if (allSelected) {
      this.deselectAllRows();
    } else {
      this.selectAllRows();
    }
  }

  getSelectedRows(): TableRow<T>[] {
    return this.getRows().filter(row => this.state.selection.has(row.id));
  }

  getSelectedRowIds(): string[] {
    return Array.from(this.state.selection);
  }

  // Global filter
  setGlobalFilter(filter: string): void {
    this.state.globalFilter = filter;
    this.state.pagination.pageIndex = 0; // Reset to first page
  }

  getGlobalFilter(): string {
    return this.state.globalFilter;
  }

  // Helpers
  private getCellValue(row: TableRow<T>, column: TableColumn<T>): unknown {
    if (column.accessorFn) {
      return column.accessorFn(row.original);
    }
    if (column.accessorKey) {
      return row.original[column.accessorKey];
    }
    return '';
  }

  private getRowId(row: T, index: number): string {
    return this.options.getRowId?.(row, index) || String(index);
  }

  // State access
  getState(): TableState {
    return { ...this.state };
  }

  setState(newState: Partial<TableState>): void {
    this.state = { ...this.state, ...newState };
  }

  // Data updates
  updateData(newData: T[]): void {
    this.data = newData;
    // Clear selection if data changed
    this.state.selection.clear();
    // Reset pagination
    this.state.pagination.pageIndex = 0;
  }

  updateColumns(newColumns: TableColumn<T>[]): void {
    this.columns = newColumns;
    // Clear sorting if columns changed
    this.state.sorting = [];
  }

  // Reset methods
  resetSorting(): void {
    this.state.sorting = [];
  }

  resetPagination(): void {
    this.state.pagination.pageIndex = 0;
  }

  resetSelection(): void {
    this.state.selection.clear();
  }

  resetFilters(): void {
    this.state.globalFilter = '';
    this.resetPagination();
  }

  reset(): void {
    this.resetSorting();
    this.resetPagination();
    this.resetSelection();
    this.resetFilters();
  }
}

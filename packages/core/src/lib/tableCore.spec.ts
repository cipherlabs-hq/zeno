import { describe, it, expect, beforeEach } from 'vitest';
import { TableCore, type TableColumn } from './tableCore.js';

describe('TableCore', () => {
  interface TestRow {
    id: number;
    name: string;
    email: string;
    age: number;
    department: string;
    active: boolean;
  }

  const sampleData: TestRow[] = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      age: 28,
      department: 'Engineering',
      active: true,
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      age: 35,
      department: 'Marketing',
      active: false,
    },
    {
      id: 3,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      age: 42,
      department: 'Engineering',
      active: true,
    },
    {
      id: 4,
      name: 'Diana Prince',
      email: 'diana@example.com',
      age: 31,
      department: 'Sales',
      active: true,
    },
    {
      id: 5,
      name: 'Eve Wilson',
      email: 'eve@example.com',
      age: 25,
      department: 'Marketing',
      active: false,
    },
  ];

  const sampleColumns: TableColumn<TestRow>[] = [
    { id: 'id', header: 'ID', accessorKey: 'id', sortable: true },
    { id: 'name', header: 'Name', accessorKey: 'name', sortable: true },
    { id: 'email', header: 'Email', accessorKey: 'email', sortable: true },
    { id: 'age', header: 'Age', accessorKey: 'age', sortable: true },
    {
      id: 'department',
      header: 'Department',
      accessorKey: 'department',
      sortable: true,
    },
    { id: 'active', header: 'Active', accessorKey: 'active', sortable: false },
  ];

  let tableCore: TableCore<TestRow>;

  beforeEach(() => {
    tableCore = new TableCore({
      data: sampleData,
      columns: sampleColumns,
      pageSize: 3,
      sortable: true,
      selectable: true,
      enableGlobalFilter: true,
    });
  });

  describe('Initialization', () => {
    it('should initialize with provided data and columns', () => {
      expect(tableCore.getRawData()).toEqual(sampleData);
      expect(tableCore.getColumns()).toEqual(sampleColumns);
    });

    it('should set initial page size', () => {
      expect(tableCore.getPageSize()).toBe(3);
    });

    it('should initialize with default sorting state', () => {
      const state = tableCore.getState();
      expect(state.sorting).toEqual([]);
    });

    it('should initialize with empty selection', () => {
      const state = tableCore.getState();
      expect(state.selection.size).toBe(0);
    });
  });

  describe('Data Access', () => {
    it('should return rows with correct structure', () => {
      const rows = tableCore.getRows();
      expect(rows).toHaveLength(5);
      expect(rows[0]).toHaveProperty('id');
      expect(rows[0]).toHaveProperty('original');
      expect(rows[0]).toHaveProperty('selected');
      expect(rows[0].original).toEqual(sampleData[0]);
    });

    it('should return filtered rows when global filter is applied', () => {
      tableCore.setGlobalFilter('Alice');
      const filteredRows = tableCore.getFilteredRows();
      expect(filteredRows).toHaveLength(1);
      expect(filteredRows[0].original.name).toBe('Alice Johnson');
    });

    it('should return sorted rows when sorting is applied', () => {
      tableCore.setSorting([{ columnId: 'name', direction: 'asc' }]);
      const sortedRows = tableCore.getSortedRows();
      expect(sortedRows[0].original.name).toBe('Alice Johnson');
      expect(sortedRows[1].original.name).toBe('Bob Smith');
      expect(sortedRows[2].original.name).toBe('Charlie Brown');
    });

    it('should return paginated rows', () => {
      const paginatedRows = tableCore.getPaginatedRows();
      expect(paginatedRows).toHaveLength(3); // Page size is 3
      expect(paginatedRows[0].original).toEqual(sampleData[0]);
    });
  });

  describe('Sorting', () => {
    it('should sort data by column in ascending order', () => {
      tableCore.setSorting([{ columnId: 'name', direction: 'asc' }]);
      const sortedRows = tableCore.getSortedRows();

      expect(sortedRows[0].original.name).toBe('Alice Johnson');
      expect(sortedRows[1].original.name).toBe('Bob Smith');
      expect(sortedRows[2].original.name).toBe('Charlie Brown');
    });

    it('should sort data by column in descending order', () => {
      tableCore.setSorting([{ columnId: 'name', direction: 'desc' }]);
      const sortedRows = tableCore.getSortedRows();

      expect(sortedRows[0].original.name).toBe('Eve Wilson');
      expect(sortedRows[1].original.name).toBe('Diana Prince');
      expect(sortedRows[2].original.name).toBe('Charlie Brown');
    });

    it('should sort numeric columns correctly', () => {
      tableCore.setSorting([{ columnId: 'age', direction: 'asc' }]);
      const sortedRows = tableCore.getSortedRows();

      expect(sortedRows[0].original.age).toBe(25);
      expect(sortedRows[1].original.age).toBe(28);
      expect(sortedRows[2].original.age).toBe(31);
    });

    it('should toggle sorting correctly', () => {
      // First toggle - ascending
      tableCore.toggleSorting('name');
      let state = tableCore.getState();
      expect(state.sorting[0].columnId).toBe('name');
      expect(state.sorting[0].direction).toBe('asc');

      // Second toggle - descending
      tableCore.toggleSorting('name');
      state = tableCore.getState();
      expect(state.sorting[0].direction).toBe('desc');

      // Third toggle - clear
      tableCore.toggleSorting('name');
      state = tableCore.getState();
      expect(state.sorting).toEqual([]);
    });

    it('should handle multi-column sorting', () => {
      const multiSortTableCore = new TableCore({
        data: sampleData,
        columns: sampleColumns,
        multiSort: true,
      });

      multiSortTableCore.toggleSorting('department');
      multiSortTableCore.toggleSorting('name');

      const state = multiSortTableCore.getState();
      expect(state.sorting).toHaveLength(2);
      expect(state.sorting[0].columnId).toBe('department');
      expect(state.sorting[1].columnId).toBe('name');
    });
  });

  describe('Pagination', () => {
    it('should navigate to next page', () => {
      tableCore.nextPage();
      expect(tableCore.getCurrentPage()).toBe(1);
    });

    it('should navigate to previous page', () => {
      tableCore.setPageIndex(1);
      tableCore.previousPage();
      expect(tableCore.getCurrentPage()).toBe(0);
    });

    it('should set specific page index', () => {
      tableCore.setPageIndex(1);
      expect(tableCore.getCurrentPage()).toBe(1);
    });

    it('should calculate total pages correctly', () => {
      expect(tableCore.getPageCount()).toBe(2); // 5 items / 3 per page = 2 pages
    });

    it('should handle page bounds correctly', () => {
      tableCore.setPageIndex(10); // Beyond max
      expect(tableCore.getCurrentPage()).toBe(1); // Should clamp to max page

      tableCore.setPageIndex(-1); // Below min
      expect(tableCore.getCurrentPage()).toBe(0); // Should clamp to 0
    });

    it('should check if next/previous page is available', () => {
      expect(tableCore.canNextPage()).toBe(true);
      expect(tableCore.canPreviousPage()).toBe(false);

      tableCore.setPageIndex(1);
      expect(tableCore.canNextPage()).toBe(false);
      expect(tableCore.canPreviousPage()).toBe(true);
    });

    it('should change page size', () => {
      tableCore.setPageSize(2);
      expect(tableCore.getPageSize()).toBe(2);
      expect(tableCore.getPageCount()).toBe(3); // 5 items / 2 per page = 3 pages
      expect(tableCore.getCurrentPage()).toBe(0); // Should reset to first page
    });

    it('should return total row count', () => {
      expect(tableCore.getTotalRows()).toBe(5);

      tableCore.setGlobalFilter('Engineering');
      expect(tableCore.getTotalRows()).toBe(2); // Filtered count
    });
  });

  describe('Selection', () => {
    it('should select individual rows', () => {
      const rows = tableCore.getRows();
      tableCore.selectRow(rows[0].id);

      const selectedRows = tableCore.getSelectedRows();
      expect(selectedRows).toHaveLength(1);
      expect(selectedRows[0].original).toEqual(sampleData[0]);
    });

    it('should deselect individual rows', () => {
      const rows = tableCore.getRows();
      tableCore.selectRow(rows[0].id);
      tableCore.deselectRow(rows[0].id);

      const selectedRows = tableCore.getSelectedRows();
      expect(selectedRows).toHaveLength(0);
    });

    it('should toggle row selection', () => {
      const rows = tableCore.getRows();

      tableCore.toggleRowSelection(rows[0].id);
      expect(tableCore.getSelectedRows()).toHaveLength(1);

      tableCore.toggleRowSelection(rows[0].id);
      expect(tableCore.getSelectedRows()).toHaveLength(0);
    });

    it('should select all rows', () => {
      tableCore.selectAllRows();
      expect(tableCore.getSelectedRows()).toHaveLength(5);
    });

    it('should deselect all rows', () => {
      tableCore.selectAllRows();
      tableCore.deselectAllRows();
      expect(tableCore.getSelectedRows()).toHaveLength(0);
    });

    it('should toggle all rows selection', () => {
      tableCore.toggleAllRowsSelection();
      expect(tableCore.getSelectedRows()).toHaveLength(5);

      tableCore.toggleAllRowsSelection();
      expect(tableCore.getSelectedRows()).toHaveLength(0);
    });

    it('should return selected row IDs', () => {
      const rows = tableCore.getRows();
      tableCore.selectRow(rows[0].id);
      tableCore.selectRow(rows[1].id);

      const selectedIds = tableCore.getSelectedRowIds();
      expect(selectedIds).toContain(rows[0].id);
      expect(selectedIds).toContain(rows[1].id);
    });
  });

  describe('Global Filter', () => {
    it('should filter rows by search term', () => {
      tableCore.setGlobalFilter('alice');
      const filteredRows = tableCore.getFilteredRows();
      expect(filteredRows).toHaveLength(1);
      expect(filteredRows[0].original.name).toBe('Alice Johnson');
    });

    it('should be case insensitive', () => {
      tableCore.setGlobalFilter('ALICE');
      const filteredRows = tableCore.getFilteredRows();
      expect(filteredRows).toHaveLength(1);
    });

    it('should search across all columns', () => {
      tableCore.setGlobalFilter('Engineering');
      const filteredRows = tableCore.getFilteredRows();
      expect(filteredRows).toHaveLength(2); // Alice and Charlie
    });

    it('should clear filter when empty string provided', () => {
      tableCore.setGlobalFilter('alice');
      tableCore.setGlobalFilter('');
      const filteredRows = tableCore.getFilteredRows();
      expect(filteredRows).toHaveLength(5);
    });

    it('should reset pagination when filtering', () => {
      tableCore.setPageIndex(1);
      tableCore.setGlobalFilter('alice');
      expect(tableCore.getCurrentPage()).toBe(0);
    });

    it('should get current filter value', () => {
      tableCore.setGlobalFilter('test');
      expect(tableCore.getGlobalFilter()).toBe('test');
    });
  });

  describe('Combined Operations', () => {
    it('should apply filtering then sorting', () => {
      tableCore.setGlobalFilter('Engineering');
      tableCore.setSorting([{ columnId: 'name', direction: 'desc' }]);

      const result = tableCore.getSortedRows();
      expect(result).toHaveLength(2);
      expect(result[0].original.name).toBe('Charlie Brown');
      expect(result[1].original.name).toBe('Alice Johnson');
    });

    it('should apply filtering then pagination', () => {
      tableCore.setGlobalFilter('Engineering');
      tableCore.setPageSize(1);

      const result = tableCore.getPaginatedRows();
      expect(result).toHaveLength(1);
    });

    it('should maintain selection when filtering', () => {
      const rows = tableCore.getRows();
      tableCore.selectRow(rows[0].id); // Select Alice

      tableCore.setGlobalFilter('Engineering');
      const selectedRows = tableCore.getSelectedRows();
      expect(selectedRows).toHaveLength(1); // Alice should still be selected
    });
  });

  describe('State Management', () => {
    it('should provide immutable state access', () => {
      const state1 = tableCore.getState();
      const state2 = tableCore.getState();
      expect(state1).not.toBe(state2); // Different object references
      expect(state1).toEqual(state2); // Same content
    });

    it('should update state correctly', () => {
      const newState = {
        sorting: [{ columnId: 'name', direction: 'asc' as const }],
        pagination: { pageIndex: 1, pageSize: 5 },
      };

      tableCore.setState(newState);
      const state = tableCore.getState();
      expect(state.sorting).toEqual(newState.sorting);
      expect(state.pagination.pageIndex).toBe(1);
      expect(state.pagination.pageSize).toBe(5);
    });
  });

  describe('Data Updates', () => {
    it('should update data and reset state', () => {
      tableCore.selectAllRows();
      tableCore.setPageIndex(1);

      const newData = [
        {
          id: 10,
          name: 'New User',
          email: 'new@example.com',
          age: 30,
          department: 'IT',
          active: true,
        },
      ];
      tableCore.updateData(newData);

      expect(tableCore.getRawData()).toEqual(newData);
      expect(tableCore.getSelectedRows()).toHaveLength(0); // Selection cleared
      expect(tableCore.getCurrentPage()).toBe(0); // Reset to first page
    });

    it('should update columns and reset sorting', () => {
      tableCore.setSorting([{ columnId: 'name', direction: 'asc' }]);

      const newColumns = [
        { id: 'id', header: 'ID', accessorKey: 'id' as keyof TestRow },
      ];
      tableCore.updateColumns(newColumns);

      expect(tableCore.getColumns()).toEqual(newColumns);
      expect(tableCore.getState().sorting).toEqual([]); // Sorting cleared
    });
  });

  describe('Reset Methods', () => {
    it('should reset sorting', () => {
      tableCore.setSorting([{ columnId: 'name', direction: 'asc' }]);
      tableCore.resetSorting();
      expect(tableCore.getState().sorting).toEqual([]);
    });

    it('should reset pagination', () => {
      tableCore.setPageIndex(1);
      tableCore.resetPagination();
      expect(tableCore.getCurrentPage()).toBe(0);
    });

    it('should reset selection', () => {
      tableCore.selectAllRows();
      tableCore.resetSelection();
      expect(tableCore.getSelectedRows()).toHaveLength(0);
    });

    it('should reset filters', () => {
      tableCore.setGlobalFilter('test');
      tableCore.setPageIndex(1);
      tableCore.resetFilters();
      expect(tableCore.getGlobalFilter()).toBe('');
      expect(tableCore.getCurrentPage()).toBe(0);
    });

    it('should reset all state', () => {
      tableCore.setSorting([{ columnId: 'name', direction: 'asc' }]);
      tableCore.setPageIndex(1);
      tableCore.selectAllRows();
      tableCore.setGlobalFilter('test');

      tableCore.reset();

      const state = tableCore.getState();
      expect(state.sorting).toEqual([]);
      expect(state.pagination.pageIndex).toBe(0);
      expect(state.selection.size).toBe(0);
      expect(state.globalFilter).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      const emptyTableCore = new TableCore({
        data: [],
        columns: sampleColumns,
      });

      expect(emptyTableCore.getRows()).toHaveLength(0);
      expect(emptyTableCore.getPageCount()).toBe(0);
      expect(emptyTableCore.getTotalRows()).toBe(0);
    });

    it('should handle data with missing properties', () => {
      const incompleteData = [
        { id: 1, name: 'John' },
        { id: 2, email: 'jane@example.com' },
      ] as unknown as TestRow[];

      expect(() => {
        const incompleteTableCore = new TableCore({
          data: incompleteData,
          columns: sampleColumns,
        });
        incompleteTableCore.getSortedRows();
      }).not.toThrow();
    });

    it('should handle invalid page numbers gracefully', () => {
      tableCore.setPageIndex(-10);
      expect(tableCore.getCurrentPage()).toBe(0);

      tableCore.setPageIndex(100);
      expect(tableCore.getCurrentPage()).toBe(tableCore.getPageCount() - 1);
    });

    it('should handle invalid page sizes', () => {
      tableCore.setPageSize(0);
      expect(tableCore.getPageSize()).toBe(0);
      expect(tableCore.getPageCount()).toBe(Infinity);
    });
  });
});

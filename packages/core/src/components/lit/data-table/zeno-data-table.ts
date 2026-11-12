import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { ZenoElement } from '../base/zeno-element.js';
// Elements this one renders, so that importing it alone is enough.
import '../checkbox/zeno-checkbox.js';
import '../icon/zeno-icon.js';
import '../pagination/zeno-pagination.js';
import '../spinner/zeno-spinner.js';
import type {
  DataTableColumn,
  DataTableRow,
  DataTableSize,
  SortDirection,
} from '../types.js';

/**
 * A table of rows with sortable columns and row selection.
 *
 * @fires {CustomEvent<{ column: string | undefined; direction: SortDirection }>} sort - A sortable column header was activated.
 * @fires {CustomEvent<{ row: DataTableRow; selected: boolean; selectedRows: Array<string | number> }>} row-select - A row was selected or deselected.
 * @fires {CustomEvent<{ selected: boolean; selectedRows: Array<string | number> }>} select-all - The select-all checkbox changed.
 * @fires {CustomEvent<{ row: DataTableRow }>} row-click - A row was clicked.
 * @csspart body
 * @csspart cell
 * @csspart empty
 * @csspart header
 * @csspart header-cell
 * @csspart header-row
 * @csspart loading
 * @csspart pagination
 * @csspart row
 * @csspart table
 * @csspart wrapper
 */
@customElement('zeno-data-table')
export class ZenoDataTable extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --table-background: var(--zeno-color-background-surface);
        --table-border-color: var(--zeno-color-border-subtle);
        --table-header-background: var(--zeno-color-background-subtle);
        --table-header-color: var(--zeno-color-text-primary);
        --table-row-hover: var(--zeno-color-background-hover);
        --table-row-selected: var(--zeno-color-accent-subtle);
        --table-row-striped: var(--zeno-color-background-subtle);
        --table-padding-sm: var(--zeno-spacing-2) var(--zeno-spacing-3);
        --table-padding-md: var(--zeno-spacing-3) var(--zeno-spacing-4);
        --table-padding-lg: var(--zeno-spacing-4) var(--zeno-spacing-5);
        --table-font-size-sm: var(--zeno-font-size-sm);
        --table-font-size-md: var(--zeno-font-size-md);
        --table-font-size-lg: var(--zeno-font-size-lg);
        --table-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: block;
        width: 100%;
      }

      /* Table wrapper */
      .table-wrapper {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        background: var(--table-background);
        border: 1px solid var(--table-border-color);
        border-radius: var(--zeno-radius-lg);
      }

      /* Table */
      .table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--table-font-size);
        line-height: var(--zeno-font-line-height-normal);
      }

      /* Size variants */
      .table--sm {
        font-size: var(--table-font-size-sm);
      }

      .table--sm th,
      .table--sm td {
        padding: var(--table-padding-sm);
      }

      .table--md {
        font-size: var(--table-font-size-md);
      }

      .table--md th,
      .table--md td {
        padding: var(--table-padding-md);
      }

      .table--lg {
        font-size: var(--table-font-size-lg);
      }

      .table--lg th,
      .table--lg td {
        padding: var(--table-padding-lg);
      }

      /* Table header */
      .table__header {
        background: var(--table-header-background);
      }

      .table__header-row {
        border-bottom: 1px solid var(--table-border-color);
      }

      .table__header-cell {
        padding: var(--table-padding);
        text-align: left;
        font-weight: var(--zeno-font-weight-semibold);
        color: var(--table-header-color);
        white-space: nowrap;
        position: relative;
      }

      .table__header-cell--sortable {
        cursor: pointer;
        user-select: none;
        transition: var(--table-transition);
      }

      .table__header-cell--sortable:hover {
        background: var(--zeno-color-background-hover);
      }

      .table__header-cell--numeric {
        text-align: right;
      }

      .table__header-cell--center {
        text-align: center;
      }

      /* Sort indicator */
      .table__sort {
        display: inline-flex;
        align-items: center;
        gap: var(--zeno-spacing-1);
      }

      .table__sort-icon {
        opacity: 0.5;
        transition: var(--table-transition);
      }

      .table__header-cell--sorted .table__sort-icon {
        opacity: 1;
        color: var(--zeno-color-accent-text);
      }

      /* Table body */
      .table__body {
        background: var(--table-background);
      }

      .table__row {
        border-bottom: 1px solid var(--table-border-color);
        transition: var(--table-transition);
      }

      .table__row:last-child {
        border-bottom: none;
      }

      .table__row--hoverable:hover {
        background: var(--table-row-hover);
      }

      .table__row--selected {
        background: var(--table-row-selected);
      }

      .table__row--clickable {
        cursor: pointer;
      }

      /* Striped rows */
      .table--striped .table__row:nth-child(even) {
        background: var(--table-row-striped);
      }

      .table--striped .table__row--selected {
        background: var(--table-row-selected);
      }

      /* Table cell */
      .table__cell {
        padding: var(--table-padding);
        color: var(--zeno-color-text-primary);
      }

      .table__cell--numeric {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      .table__cell--center {
        text-align: center;
      }

      .table__cell--actions {
        text-align: right;
        white-space: nowrap;
      }

      /* Checkbox cell */
      .table__checkbox-cell {
        width: 40px;
        padding: 0 var(--zeno-spacing-3);
      }

      /* Sticky header */
      .table--sticky-header .table__header {
        position: sticky;
        top: 0;
        z-index: 10;
        box-shadow: 0 1px 0 var(--table-border-color);
      }

      /* Loading state */
      .table--loading {
        position: relative;
        pointer-events: none;
      }

      .table--loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: color-mix(
          in srgb,
          var(--zeno-color-background-surface) 70%,
          transparent
        );
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .table__loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 11;
      }

      /* Empty state */
      .table__empty {
        padding: var(--zeno-spacing-8);
        text-align: center;
        color: var(--zeno-color-text-tertiary);
      }

      /* Pagination */
      .table__pagination {
        padding: var(--zeno-spacing-4);
        border-top: 1px solid var(--table-border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .table--responsive {
          display: block;
        }

        .table--responsive thead {
          display: none;
        }

        .table--responsive tbody,
        .table--responsive tr,
        .table--responsive td {
          display: block;
        }

        .table--responsive tr {
          margin-bottom: var(--zeno-spacing-3);
          border: 1px solid var(--table-border-color);
          border-radius: var(--zeno-radius-md);
          padding: var(--zeno-spacing-3);
        }

        .table--responsive td {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--zeno-spacing-2) 0;
          border: none;
        }

        .table--responsive td::before {
          content: attr(data-label);
          font-weight: var(--zeno-font-weight-semibold);
          color: var(--zeno-color-text-secondary);
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .table-wrapper {
          border-width: 2px;
        }

        .table__header-row,
        .table__row {
          border-width: 2px;
        }
      }

      /* Print styles */
      @media print {
        .table-wrapper {
          border: 1px solid #000;
          break-inside: avoid;
        }

        .table__row {
          break-inside: avoid;
        }

        .table__pagination {
          display: none;
        }
      }
    `,
  ];

  @property({ type: Array }) columns: DataTableColumn[] = [];
  @property({ type: Array }) data: DataTableRow[] = [];
  @property({ reflect: true }) size: DataTableSize = 'md';
  @property({ type: Boolean, reflect: true }) striped = false;
  @property({ type: Boolean, reflect: true }) hoverable = true;
  @property({ type: Boolean, reflect: true }) responsive = true;
  @property({ type: Boolean, reflect: true, attribute: 'sticky-header' })
  stickyHeader = false;
  @property({ type: Boolean, reflect: true }) sortable = true;
  @property({ type: Boolean, reflect: true }) selectable = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property() emptyMessage = 'No data available';
  @property({ type: Number, attribute: 'page-size' }) pageSize = 10;
  @property({ type: Boolean, attribute: 'show-pagination' }) showPagination =
    false;

  @state() private sortColumn?: string;
  @state() private sortDirection: SortDirection = 'asc';
  @state() private selectedRows = new Set<string | number>();
  @state() private currentPage = 1;

  /**
   * Get sorted data
   */
  private get sortedData(): DataTableRow[] {
    if (!this.sortColumn || !this.sortable) return this.data;

    return [...this.data].sort((a, b) => {
      const aVal = a[this.sortColumn!];
      const bVal = b[this.sortColumn!];

      if (aVal === bVal) return 0;

      const result =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal ?? '').localeCompare(String(bVal ?? ''));
      return this.sortDirection === 'asc' ? result : -result;
    });
  }

  /**
   * Get paginated data
   */
  private get paginatedData(): DataTableRow[] {
    if (!this.showPagination) return this.sortedData;

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.sortedData.slice(start, end);
  }

  /**
   * Get total pages
   */
  private get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }

  /**
   * Handle sort
   */
  private handleSort(column: DataTableColumn): void {
    if (!this.sortable || !column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.emitEvent('sort', {
      column: this.sortColumn,
      direction: this.sortDirection,
    });
  }

  /**
   * Handle row selection
   */
  private handleRowSelect(row: DataTableRow): void {
    if (!this.selectable) return;

    const id = row.id || this.data.indexOf(row);

    if (this.selectedRows.has(id)) {
      this.selectedRows.delete(id);
    } else {
      this.selectedRows.add(id);
    }

    this.requestUpdate();

    this.emitEvent('row-select', {
      row,
      selected: this.selectedRows.has(id),
      selectedRows: Array.from(this.selectedRows),
    });
  }

  /**
   * Handle select all
   */
  private handleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      this.paginatedData.forEach(row => {
        const id = row.id || this.data.indexOf(row);
        this.selectedRows.add(id);
      });
    } else {
      this.paginatedData.forEach(row => {
        const id = row.id || this.data.indexOf(row);
        this.selectedRows.delete(id);
      });
    }

    this.requestUpdate();

    this.emitEvent('select-all', {
      selected: checkbox.checked,
      selectedRows: Array.from(this.selectedRows),
    });
  }

  /**
   * Handle row click
   */
  private handleRowClick(row: DataTableRow): void {
    this.emitEvent('row-click', { row });
  }

  /**
   * Get cell value
   */
  private getCellValue(row: DataTableRow, column: DataTableColumn): unknown {
    const value = row[column.key];

    if (column.formatter) {
      return column.formatter(value, row);
    }

    return value;
  }

  /**
   * Render sort icon
   */
  private renderSortIcon(column: DataTableColumn) {
    const isActive = this.sortColumn === column.key;
    const direction = isActive ? this.sortDirection : 'asc';

    return html`
      <zeno-icon
        class="table__sort-icon"
        name=${direction === 'asc' ? 'chevron-up' : 'chevron-down'}
        size="16"
      ></zeno-icon>
    `;
  }

  /**
   * Render the component
   */
  override render() {
    const tableClasses = {
      table: true,
      [`table--${this.size}`]: true,
      'table--striped': this.striped,
      'table--sticky-header': this.stickyHeader,
      'table--responsive': this.responsive,
      'table--loading': this.loading,
    };

    const allSelected = this.paginatedData.every(row => {
      const id = row.id || this.data.indexOf(row);
      return this.selectedRows.has(id);
    });

    const someSelected = this.paginatedData.some(row => {
      const id = row.id || this.data.indexOf(row);
      return this.selectedRows.has(id);
    });

    return html`
      <div class="table-wrapper" part="wrapper">
        <table class=${classMap(tableClasses)} part="table">
          <thead class="table__header" part="header">
            <tr class="table__header-row" part="header-row">
              ${
                this.selectable
                  ? html`
                      <th
                        class="table__header-cell table__checkbox-cell"
                        part="header-cell"
                      >
                        <zeno-checkbox
                          .checked=${allSelected}
                          .indeterminate=${someSelected && !allSelected}
                          @change=${this.handleSelectAll}
                          aria-label="Select all rows"
                        ></zeno-checkbox>
                      </th>
                    `
                  : nothing
              }
              ${repeat(
                this.columns,
                col => col.key,
                col => {
                  const isSortable = this.sortable && col.sortable !== false;
                  const isSorted = this.sortColumn === col.key;

                  const headerClasses = {
                    'table__header-cell': true,
                    'table__header-cell--sortable': isSortable,
                    'table__header-cell--sorted': isSorted,
                    'table__header-cell--numeric': col.align === 'right',
                    'table__header-cell--center': col.align === 'center',
                  };

                  return html`
                    <th
                      class=${classMap(headerClasses)}
                      part="header-cell"
                      @click=${() => this.handleSort(col)}
                      tabindex=${isSortable ? '0' : '-1'}
                      role=${isSortable ? 'button' : 'columnheader'}
                      aria-sort=${isSorted ? this.sortDirection : 'none'}
                    >
                      <span class="table__sort">
                        ${col.label}
                        ${isSortable ? this.renderSortIcon(col) : nothing}
                      </span>
                    </th>
                  `;
                }
              )}
            </tr>
          </thead>

          <tbody class="table__body" part="body">
            ${
              this.paginatedData.length === 0
                ? html`
                    <tr class="table__row" part="row">
                      <td
                        class="table__empty"
                        part="empty"
                        colspan=${this.columns.length + (this.selectable ? 1 : 0)}
                      >
                        ${this.emptyMessage}
                      </td>
                    </tr>
                  `
                : repeat(
                    this.paginatedData,
                    row => row.id || this.data.indexOf(row),
                    row => {
                      const id = row.id || this.data.indexOf(row);
                      const isSelected = this.selectedRows.has(id);

                      const rowClasses = {
                        table__row: true,
                        'table__row--hoverable': this.hoverable,
                        'table__row--selected': isSelected,
                        'table__row--clickable': true,
                      };

                      return html`
                        <tr
                          class=${classMap(rowClasses)}
                          part="row"
                          @click=${() => this.handleRowClick(row)}
                        >
                          ${
                            this.selectable
                              ? html`
                                  <td
                                    class="table__cell table__checkbox-cell"
                                    part="cell"
                                  >
                                    <zeno-checkbox
                                      .checked=${isSelected}
                                      @change=${() => this.handleRowSelect(row)}
                                      @click=${(e: Event) => e.stopPropagation()}
                                      aria-label="Select row"
                                    ></zeno-checkbox>
                                  </td>
                                `
                              : nothing
                          }
                          ${repeat(
                            this.columns,
                            col => col.key,
                            col => {
                              const cellClasses = {
                                table__cell: true,
                                'table__cell--numeric': col.align === 'right',
                                'table__cell--center': col.align === 'center',
                                'table__cell--actions': col.key === 'actions',
                              };

                              return html`
                                <td
                                  class=${classMap(cellClasses)}
                                  part="cell"
                                  data-label=${col.label}
                                >
                                  ${this.getCellValue(row, col)}
                                </td>
                              `;
                            }
                          )}
                        </tr>
                      `;
                    }
                  )
            }
          </tbody>
        </table>

        ${
          this.loading
            ? html`
                <div class="table__loading" part="loading">
                  <zeno-spinner size="lg"></zeno-spinner>
                </div>
              `
            : nothing
        }
        ${
          this.showPagination && this.totalPages > 1
            ? html`
                <div class="table__pagination" part="pagination">
                  <zeno-pagination
                    .current=${this.currentPage}
                    .total=${this.data.length}
                    .pageSize=${this.pageSize}
                    size="sm"
                    @change=${(e: CustomEvent) => {
                      this.currentPage = e.detail.current;
                    }}
                  ></zeno-pagination>
                </div>
              `
            : nothing
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-data-table': ZenoDataTable;
  }
}

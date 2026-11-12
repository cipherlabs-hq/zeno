import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { ZenoElement } from '../base/zeno-element.js';
// Elements this one renders, so that importing it alone is enough.
import '../icon/zeno-icon.js';
import type { PaginationSize } from '../types.js';

/**
 * Moves between the pages of a long list.
 *
 * @fires {CustomEvent<{ current: number; pageSize: number; total: number }>} change - The current page changed.
 * @fires {CustomEvent<{ current: number; pageSize: number; total: number }>} size-change - The page size changed.
 * @csspart base
 * @csspart ellipsis
 * @csspart info
 * @csspart jumper
 * @csspart jumper-input
 * @csspart list
 * @csspart nav
 * @csspart next
 * @csspart page
 * @csspart prev
 * @csspart select
 * @csspart size-changer
 */
@customElement('zeno-pagination')
export class ZenoPagination extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --pagination-item-size-sm: 32px;
        --pagination-item-size-md: 40px;
        --pagination-item-size-lg: 48px;
        --pagination-item-gap: var(--zeno-spacing-1);
        --pagination-font-size-sm: var(--zeno-font-size-sm);
        --pagination-font-size-md: var(--zeno-font-size-md);
        --pagination-font-size-lg: var(--zeno-font-size-lg);
        --pagination-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: block;
      }

      /* Pagination container */
      .pagination {
        display: flex;
        align-items: center;
        gap: var(--zeno-spacing-3);
        font-size: var(--pagination-font-size);
      }

      /* Size variants */
      .pagination--sm {
        --pagination-item-size: var(--pagination-item-size-sm);
        font-size: var(--pagination-font-size-sm);
      }

      .pagination--md {
        --pagination-item-size: var(--pagination-item-size-md);
        font-size: var(--pagination-font-size-md);
      }

      .pagination--lg {
        --pagination-item-size: var(--pagination-item-size-lg);
        font-size: var(--pagination-font-size-lg);
      }

      /* Items list */
      .pagination__list {
        display: flex;
        align-items: center;
        gap: var(--pagination-item-gap);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      /* Pagination item */
      .pagination__item {
        display: flex;
      }

      /* Pagination button base */
      .pagination__button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: var(--pagination-item-size);
        height: var(--pagination-item-size);
        padding: 0 var(--zeno-spacing-2);
        border: 1px solid transparent;
        background: transparent;
        color: var(--zeno-color-text-primary);
        font-family: var(--zeno-font-family-sans);
        font-size: inherit;
        font-weight: var(--zeno-font-weight-medium);
        line-height: 1;
        text-decoration: none;
        cursor: pointer;
        border-radius: var(--zeno-radius-md);
        transition: var(--pagination-transition);
        user-select: none;
      }

      .pagination__button:hover:not(:disabled) {
        background: var(--zeno-color-background-hover);
        color: var(--zeno-color-accent-text);
      }

      .pagination__button:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
      }

      /* Active state */
      .pagination__button--active {
        background: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
        pointer-events: none;
      }

      /* Disabled state */
      .pagination__button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Ellipsis */
      .pagination__ellipsis {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: var(--pagination-item-size);
        height: var(--pagination-item-size);
        color: var(--zeno-color-text-tertiary);
        pointer-events: none;
        user-select: none;
      }

      /* Navigation buttons */
      .pagination__nav {
        display: flex;
        align-items: center;
        gap: var(--zeno-spacing-2);
      }

      /* Simple variant */
      .pagination--simple .pagination__list {
        display: none;
      }

      /* Compact variant */
      .pagination--compact {
        gap: var(--zeno-spacing-2);
      }

      .pagination--compact .pagination__nav-text {
        display: none;
      }

      /* Page info */
      .pagination__info {
        color: var(--zeno-color-text-secondary);
        font-size: var(--zeno-font-size-sm);
        white-space: nowrap;
      }

      /* Page jumper */
      .pagination__jumper {
        display: flex;
        align-items: center;
        gap: var(--zeno-spacing-2);
        color: var(--zeno-color-text-secondary);
        font-size: var(--zeno-font-size-sm);
      }

      .pagination__jumper-input {
        width: 60px;
        height: 32px;
        padding: 0 var(--zeno-spacing-2);
        border: 1px solid var(--zeno-color-border-default);
        border-radius: var(--zeno-radius-sm);
        background: var(--zeno-color-background-surface);
        color: var(--zeno-color-text-primary);
        font-size: inherit;
        text-align: center;
        transition: var(--pagination-transition);
      }

      .pagination__jumper-input:focus {
        outline: none;
        border-color: var(--zeno-color-accent-solid);
        box-shadow: 0 0 0 3px var(--zeno-color-accent-subtle-hover);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .pagination__button {
          border-color: ButtonText;
        }

        .pagination__button:hover:not(:disabled) {
          border-width: 2px;
        }

        .pagination__button--active {
          border-color: ButtonText;
          outline: 2px solid ButtonText;
          outline-offset: -4px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .pagination__button,
        .pagination__jumper-input {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .pagination {
          display: none;
        }
      }
    `,
  ];

  @property({ type: Number }) current = 1;
  @property({ type: Number }) total = 1;
  @property({ type: Number, attribute: 'page-size' }) pageSize = 10;
  @property({ type: Number, attribute: 'sibling-count' }) siblingCount = 1;
  @property({ type: Boolean, reflect: true }) simple = false;
  @property({ type: Boolean, reflect: true }) compact = false;
  @property({ type: Boolean, reflect: true, attribute: 'show-total' })
  showTotal = false;
  @property({ type: Boolean, reflect: true, attribute: 'show-jumper' })
  showJumper = false;
  @property({ type: Boolean, reflect: true, attribute: 'show-size-changer' })
  showSizeChanger = false;
  @property({ reflect: true }) size: PaginationSize = 'md';
  @property({ type: Array, attribute: 'page-sizes' }) pageSizes = [
    10, 20, 50, 100,
  ];

  @state() private jumperValue = '';

  /**
   * Calculate page range
   */
  private getPageRange(): (number | 'ellipsis')[] {
    const totalPageCount = Math.ceil(this.total / this.pageSize);
    const totalPageNumbers = this.siblingCount * 2 + 5;

    // If total pages is less than the page numbers we want to show
    if (totalPageCount <= totalPageNumbers) {
      return Array.from({ length: totalPageCount }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(this.current - this.siblingCount, 1);
    const rightSiblingIndex = Math.min(
      this.current + this.siblingCount,
      totalPageCount
    );

    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    const shouldShowRightEllipsis = rightSiblingIndex < totalPageCount - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const leftItemCount = 3 + 2 * this.siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, 'ellipsis', lastPageIndex];
    }

    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      const rightItemCount = 3 + 2 * this.siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPageCount - rightItemCount + i + 1
      );
      return [firstPageIndex, 'ellipsis', ...rightRange];
    }

    if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [
        firstPageIndex,
        'ellipsis',
        ...middleRange,
        'ellipsis',
        lastPageIndex,
      ];
    }

    return [];
  }

  /**
   * Go to a specific page
   */
  goToPage(page: number): void {
    const totalPages = Math.ceil(this.total / this.pageSize);
    const validPage = Math.max(1, Math.min(page, totalPages));

    if (validPage !== this.current) {
      this.current = validPage;
      this.emitEvent('change', {
        current: this.current,
        pageSize: this.pageSize,
        total: this.total,
      });
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    this.goToPage(this.current - 1);
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    this.goToPage(this.current + 1);
  }

  /**
   * Handle page size change
   */
  private handlePageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPageSize = Number(select.value);

    // Calculate new current page to maintain position
    const currentItemIndex = (this.current - 1) * this.pageSize;
    const newCurrent = Math.floor(currentItemIndex / newPageSize) + 1;

    this.pageSize = newPageSize;
    this.current = newCurrent;

    this.emitEvent('size-change', {
      current: this.current,
      pageSize: this.pageSize,
      total: this.total,
    });
  }

  /**
   * Handle jumper input
   */
  private handleJumperInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.jumperValue = input.value;
  }

  /**
   * Handle jumper submit
   */
  private handleJumperSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const page = Number(this.jumperValue);
      if (!isNaN(page)) {
        this.goToPage(page);
        this.jumperValue = '';
      }
    }
  }

  /**
   * Calculate total info
   */
  private getTotalInfo(): string {
    const start = (this.current - 1) * this.pageSize + 1;
    const end = Math.min(this.current * this.pageSize, this.total);
    return `${start}-${end} of ${this.total}`;
  }

  /**
   * Render the component
   */
  override render() {
    const totalPages = Math.ceil(this.total / this.pageSize);
    const isFirstPage = this.current === 1;
    const isLastPage = this.current === totalPages;
    const pageRange = this.getPageRange();

    const classes = {
      pagination: true,
      [`pagination--${this.size}`]: true,
      'pagination--simple': this.simple,
      'pagination--compact': this.compact,
    };

    return html`
      <nav
        class=${classMap(classes)}
        part="base"
        aria-label=${this.ariaLabel || 'Pagination navigation'}
      >
        ${
          this.showTotal
            ? html`
                <span class="pagination__info" part="info">
                  ${this.getTotalInfo()}
                </span>
              `
            : nothing
        }

        <div class="pagination__nav" part="nav">
          <button
            class="pagination__button"
            part="prev"
            type="button"
            ?disabled=${isFirstPage}
            aria-label="Go to previous page"
            @click=${this.previousPage}
          >
            <zeno-icon name="chevron-left" size="20"></zeno-icon>
            <span class="pagination__nav-text">Previous</span>
          </button>
        </div>

        <ul class="pagination__list" part="list">
          ${repeat(
            pageRange,
            (item, index) => `${item}-${index}`,
            item => {
              if (item === 'ellipsis') {
                return html`
                  <li class="pagination__item">
                    <span class="pagination__ellipsis" part="ellipsis"
                      >...</span
                    >
                  </li>
                `;
              }

              const isActive = item === this.current;
              const buttonClasses = {
                pagination__button: true,
                'pagination__button--active': isActive,
              };

              return html`
                <li class="pagination__item">
                  <button
                    class=${classMap(buttonClasses)}
                    part="page"
                    type="button"
                    aria-label=${`Go to page ${item}`}
                    aria-current=${isActive ? 'page' : nothing}
                    @click=${() => this.goToPage(item)}
                  >
                    ${item}
                  </button>
                </li>
              `;
            }
          )}
        </ul>

        <div class="pagination__nav" part="nav">
          <button
            class="pagination__button"
            part="next"
            type="button"
            ?disabled=${isLastPage}
            aria-label="Go to next page"
            @click=${this.nextPage}
          >
            <span class="pagination__nav-text">Next</span>
            <zeno-icon name="chevron-right" size="20"></zeno-icon>
          </button>
        </div>

        ${
          this.showSizeChanger
            ? html`
                <div class="pagination__size-changer" part="size-changer">
                  <select
                    class="pagination__select"
                    part="select"
                    aria-label="Items per page"
                    @change=${this.handlePageSizeChange}
                  >
                    ${this.pageSizes.map(
                      size => html`
                        <option
                          value=${size}
                          ?selected=${size === this.pageSize}
                        >
                          ${size} / page
                        </option>
                      `
                    )}
                  </select>
                </div>
              `
            : nothing
        }
        ${
          this.showJumper
            ? html`
                <div class="pagination__jumper" part="jumper">
                  <span>Go to</span>
                  <input
                    type="number"
                    class="pagination__jumper-input"
                    part="jumper-input"
                    min="1"
                    max=${totalPages}
                    .value=${this.jumperValue}
                    placeholder=${String(this.current)}
                    aria-label="Page number to go to"
                    @input=${this.handleJumperInput}
                    @keydown=${this.handleJumperSubmit}
                  />
                </div>
              `
            : nothing
        }
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-pagination': ZenoPagination;
  }
}

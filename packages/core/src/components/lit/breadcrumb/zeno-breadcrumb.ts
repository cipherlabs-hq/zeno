import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { BreadcrumbItem } from '../types.js';

/**
 * The path from the top of the site to the current page.
 *
 * @fires {CustomEvent<{ item: BreadcrumbItem }>} item-click - A breadcrumb was activated.
 * @fires {CustomEvent<{ items: BreadcrumbItem[] }>} collapsed-click - The collapsed marker was activated; `detail.items` are the hidden breadcrumbs.
 * @csspart base
 * @csspart collapsed
 * @csspart icon
 * @csspart item
 * @csspart label
 * @csspart link
 * @csspart list
 * @csspart separator
 * @csspart text
 */
@customElement('zeno-breadcrumb')
export class ZenoBreadcrumb extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --breadcrumb-separator-spacing: var(--zeno-spacing-2);
        --breadcrumb-font-size: var(--zeno-font-size-sm);
        --breadcrumb-text-color: var(--zeno-color-text-secondary);
        --breadcrumb-link-color: var(--zeno-color-text-primary);
        --breadcrumb-active-color: var(--zeno-color-accent-text);
        --breadcrumb-separator-color: var(--zeno-color-text-tertiary);
        --breadcrumb-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: block;
      }

      /* Breadcrumb container */
      .breadcrumb {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--breadcrumb-separator-spacing);
        font-size: var(--breadcrumb-font-size);
        line-height: 1.5;
      }

      /* Breadcrumb list */
      .breadcrumb__list {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      /* Breadcrumb item */
      .breadcrumb__item {
        display: flex;
        align-items: center;
        color: var(--breadcrumb-text-color);
      }

      /* Breadcrumb link */
      .breadcrumb__link {
        display: inline-flex;
        align-items: center;
        gap: var(--zeno-spacing-1);
        color: var(--breadcrumb-link-color);
        text-decoration: none;
        transition: var(--breadcrumb-transition);
        padding: var(--zeno-spacing-1) 0;
        border-radius: var(--zeno-radius-sm);
      }

      .breadcrumb__link:hover {
        color: var(--zeno-color-accent-text);
        text-decoration: underline;
      }

      .breadcrumb__link:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
      }

      /* Current/active item */
      .breadcrumb__item--current {
        color: var(--breadcrumb-active-color);
        font-weight: var(--zeno-font-weight-medium);
      }

      .breadcrumb__item--current .breadcrumb__link {
        color: inherit;
        cursor: default;
        pointer-events: none;
      }

      .breadcrumb__item--current .breadcrumb__link:hover {
        text-decoration: none;
      }

      /* Disabled item */
      .breadcrumb__item--disabled {
        opacity: 0.5;
      }

      .breadcrumb__item--disabled .breadcrumb__link {
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Icon */
      .breadcrumb__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      /* Separator */
      .breadcrumb__separator {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 var(--breadcrumb-separator-spacing);
        color: var(--breadcrumb-separator-color);
        user-select: none;
      }

      /* Custom separator */
      .breadcrumb__separator--custom {
        font-size: 1.2em;
      }

      /* Collapsed items */
      .breadcrumb__collapsed {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--breadcrumb-link-color);
        cursor: pointer;
        border-radius: var(--zeno-radius-sm);
        transition: var(--breadcrumb-transition);
      }

      .breadcrumb__collapsed:hover {
        background: var(--zeno-color-background-hover);
        color: var(--zeno-color-accent-text);
      }

      .breadcrumb__collapsed:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .breadcrumb__link:hover {
          outline: 1px solid ButtonText;
        }

        .breadcrumb__link:focus-visible {
          outline: 2px solid ButtonText;
        }

        .breadcrumb__item--current {
          text-decoration: underline;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .breadcrumb__link,
        .breadcrumb__collapsed {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .breadcrumb {
          color: #000;
        }

        .breadcrumb__link {
          color: #000;
          text-decoration: underline;
        }

        .breadcrumb__separator {
          color: #666;
        }
      }
    `,
  ];

  @property({ type: Array }) items: BreadcrumbItem[] = [];
  @property() separator = '/';
  @property({ type: Boolean, reflect: true, attribute: 'show-icons' })
  showIcons = false;
  @property({ type: Number, attribute: 'max-items' }) maxItems?: number;

  /**
   * Get visible items based on maxItems
   */
  private getVisibleItems(): {
    start: BreadcrumbItem[];
    collapsed: BreadcrumbItem[];
    end: BreadcrumbItem[];
  } {
    if (!this.maxItems || this.items.length <= this.maxItems) {
      return {
        start: this.items,
        collapsed: [],
        end: [],
      };
    }

    // Always show first and last items
    const start = [this.items[0]];
    const end = this.items.slice(-1);
    const collapsed = this.items.slice(1, -1);

    return { start, collapsed, end };
  }

  /**
   * Handle item click
   */
  private handleItemClick(event: MouseEvent, item: BreadcrumbItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    this.emitEvent('item-click', { item });
  }

  /**
   * Handle collapsed items click
   */
  private handleCollapsedClick(): void {
    this.emitEvent('collapsed-click', {
      items: this.getVisibleItems().collapsed,
    });
  }

  /**
   * Render separator
   */
  private renderSeparator() {
    if (this.separator === '/') {
      return html`
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M5.5 3L10.5 8L5.5 13"
            stroke="currentColor"
            stroke-width="1.5"
            fill="none"
          />
        </svg>
      `;
    }

    return html`<span class="breadcrumb__separator--custom"
      >${this.separator}</span
    >`;
  }

  /**
   * Render breadcrumb item
   */
  private renderItem(item: BreadcrumbItem, index: number, isLast: boolean) {
    const itemClasses = {
      breadcrumb__item: true,
      'breadcrumb__item--current': isLast && !item.href,
      'breadcrumb__item--disabled': item.disabled || false,
    };

    const content = html`
      ${
        this.showIcons && item.icon
          ? html`
              <span class="breadcrumb__icon" part="icon">
                <zeno-icon name=${item.icon} size="16"></zeno-icon>
              </span>
            `
          : nothing
      }
      <span part="label">${item.label}</span>
    `;

    return html`
      <li class=${classMap(itemClasses)} part="item">
        ${
          item.href && !isLast
            ? html`
                <a
                  class="breadcrumb__link"
                  part="link"
                  href=${item.href}
                  target=${item.target || '_self'}
                  rel=${item.rel || ''}
                  aria-current=${isLast ? 'page' : nothing}
                  @click=${(e: MouseEvent) => this.handleItemClick(e, item)}
                >
                  ${content}
                </a>
              `
            : html`
                <span
                  class="breadcrumb__link"
                  part="text"
                  aria-current=${isLast ? 'page' : nothing}
                >
                  ${content}
                </span>
              `
        }
        ${
          !isLast
            ? html`
                <span
                  class="breadcrumb__separator"
                  part="separator"
                  aria-hidden="true"
                >
                  ${this.renderSeparator()}
                </span>
              `
            : nothing
        }
      </li>
    `;
  }

  /**
   * Render the component
   */
  override render() {
    if (this.items.length === 0) return nothing;

    const { start, collapsed, end } = this.getVisibleItems();
    const hasCollapsed = collapsed.length > 0;

    return html`
      <nav
        class="breadcrumb"
        part="base"
        aria-label=${this.ariaLabel || 'Breadcrumb navigation'}
      >
        <ol class="breadcrumb__list" part="list">
          ${repeat(
            start,
            (item, index) => `${item.label}-${index}`,
            (item, index) =>
              this.renderItem(
                item,
                index,
                !hasCollapsed && index === start.length - 1
              )
          )}
          ${
            hasCollapsed
              ? html`
                  <li class="breadcrumb__item" part="item">
                    <button
                      class="breadcrumb__collapsed"
                      part="collapsed"
                      type="button"
                      aria-label="Show more breadcrumb items"
                      @click=${this.handleCollapsedClick}
                    >
                      <zeno-icon name="more-horizontal" size="16"></zeno-icon>
                    </button>
                    <span
                      class="breadcrumb__separator"
                      part="separator"
                      aria-hidden="true"
                    >
                      ${this.renderSeparator()}
                    </span>
                  </li>
                `
              : nothing
          }
          ${
            hasCollapsed
              ? repeat(
                  end,
                  (item, index) => `${item.label}-end-${index}`,
                  (item, index) =>
                    this.renderItem(
                      item,
                      start.length + collapsed.length + index,
                      index === end.length - 1
                    )
                )
              : nothing
          }
        </ol>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-breadcrumb': ZenoBreadcrumb;
  }
}

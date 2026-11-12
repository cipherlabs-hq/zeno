import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
// Elements this one renders, so that importing it alone is enough.
import '../icon/zeno-icon.js';
import type { NavRailItem } from '../types.js';

/**
 * A vertical navigation bar that can collapse to icons.
 *
 * @slot footer - Content below the items.
 * @slot header - Content above the items.
 * @fires {CustomEvent<{ expanded: boolean }>} toggle - The rail was expanded or collapsed.
 * @fires {CustomEvent<{ value: string; item: NavRailItem }>} item-select - An item was selected.
 * @csspart badge
 * @csspart base
 * @csspart footer
 * @csspart header
 * @csspart icon
 * @csspart item
 * @csspart items
 * @csspart label
 * @csspart link
 * @csspart list
 * @csspart section
 * @csspart section-list
 * @csspart section-title
 * @csspart toggle
 * @csspart tooltip
 */
@customElement('zeno-nav-rail')
export class ZenoNavRail extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --nav-rail-width: 80px;
        --nav-rail-width-expanded: 240px;
        --nav-rail-background: var(--zeno-color-background-subtle);
        --nav-rail-border-color: var(--zeno-color-border-subtle);
        --nav-rail-item-height: 56px;
        --nav-rail-item-padding: var(--zeno-spacing-3);
        --nav-rail-transition: all var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);

        display: block;
        height: 100%;
      }

      /* Nav rail container */
      .nav-rail {
        display: flex;
        flex-direction: column;
        width: var(--nav-rail-width);
        height: 100%;
        background: var(--nav-rail-background);
        border-right: 1px solid var(--nav-rail-border-color);
        transition: width var(--nav-rail-transition);
        overflow: hidden;
      }

      .nav-rail--expanded {
        width: var(--nav-rail-width-expanded);
      }

      /* Header */
      .nav-rail__header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--zeno-spacing-4) var(--zeno-spacing-3);
        border-bottom: 1px solid var(--nav-rail-border-color);
      }

      .nav-rail--expanded .nav-rail__header {
        justify-content: space-between;
      }

      /* Toggle button */
      .nav-rail__toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--zeno-color-text-secondary);
        cursor: pointer;
        border-radius: var(--zeno-radius-md);
        transition: var(--nav-rail-transition);
      }

      .nav-rail__toggle:hover {
        background: var(--zeno-color-background-hover);
        color: var(--zeno-color-text-primary);
      }

      .nav-rail__toggle:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
      }

      /* Items container */
      .nav-rail__items {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--zeno-color-border-subtle) transparent;
      }

      .nav-rail__items::-webkit-scrollbar {
        width: 4px;
      }

      .nav-rail__items::-webkit-scrollbar-track {
        background: transparent;
      }

      .nav-rail__items::-webkit-scrollbar-thumb {
        background: var(--zeno-color-border-subtle);
        border-radius: 2px;
      }

      /* Nav list */
      .nav-rail__list {
        list-style: none;
        margin: 0;
        padding: var(--zeno-spacing-2);
      }

      /* Section */
      .nav-rail__section {
        margin-bottom: var(--zeno-spacing-2);
      }

      .nav-rail__section-title {
        display: none;
        padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
        font-size: var(--zeno-font-size-xs);
        font-weight: var(--zeno-font-weight-semibold);
        color: var(--zeno-color-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .nav-rail--expanded .nav-rail__section-title {
        display: block;
      }

      /* Nav item */
      .nav-rail__item {
        position: relative;
        margin-bottom: var(--zeno-spacing-1);
      }

      /* Nav link */
      .nav-rail__link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: var(--nav-rail-item-height);
        padding: var(--nav-rail-item-padding);
        border: none;
        background: transparent;
        color: var(--zeno-color-text-secondary);
        text-decoration: none;
        cursor: pointer;
        border-radius: var(--zeno-radius-md);
        transition: var(--nav-rail-transition);
        gap: var(--zeno-spacing-3);
      }

      .nav-rail--expanded .nav-rail__link {
        justify-content: flex-start;
      }

      .nav-rail__link:hover {
        background: var(--zeno-color-background-hover);
        color: var(--zeno-color-text-primary);
      }

      .nav-rail__link:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: -2px;
      }

      /* Active state */
      .nav-rail__link--active {
        background: var(--zeno-color-accent-subtle);
        color: var(--zeno-color-accent-text);
        font-weight: var(--zeno-font-weight-medium);
      }

      .nav-rail__link--active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 24px;
        background: var(--zeno-color-accent-solid);
        border-radius: 0 3px 3px 0;
      }

      /* Disabled state */
      .nav-rail__link--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Icon */
      .nav-rail__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 24px;
        height: 24px;
      }

      /* Label */
      .nav-rail__label {
        display: none;
        flex: 1;
        font-size: var(--zeno-font-size-md);
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .nav-rail--expanded .nav-rail__label {
        display: block;
      }

      /* Badge */
      .nav-rail__badge {
        position: absolute;
        top: var(--zeno-spacing-2);
        right: var(--zeno-spacing-2);
        min-width: 18px;
        height: 18px;
        padding: 0 var(--zeno-spacing-1);
        background: var(--zeno-color-danger-solid);
        color: var(--zeno-color-danger-on-solid);
        font-size: var(--zeno-font-size-xs);
        font-weight: var(--zeno-font-weight-medium);
        line-height: 18px;
        text-align: center;
        border-radius: var(--zeno-radius-full);
        transition: var(--nav-rail-transition);
      }

      .nav-rail--expanded .nav-rail__badge {
        position: static;
        margin-left: auto;
      }

      /* Tooltip for collapsed state */
      .nav-rail__tooltip {
        position: absolute;
        left: calc(100% + var(--zeno-spacing-2));
        top: 50%;
        transform: translateY(-50%);
        padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
        background: var(--zeno-color-background-inverse);
        color: var(--zeno-color-text-inverse);
        font-size: var(--zeno-font-size-sm);
        white-space: nowrap;
        border-radius: var(--zeno-radius-sm);
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: opacity var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        z-index: var(--zeno-z-index-tooltip);
      }

      .nav-rail__tooltip::before {
        content: '';
        position: absolute;
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        border-right: 4px solid var(--zeno-color-background-inverse);
      }

      .nav-rail:not(.nav-rail--expanded)
        .nav-rail__link:hover
        .nav-rail__tooltip {
        opacity: 1;
        visibility: visible;
      }

      /* Footer */
      .nav-rail__footer {
        padding: var(--zeno-spacing-3);
        border-top: 1px solid var(--nav-rail-border-color);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .nav-rail {
          border-color: ButtonText;
        }

        .nav-rail__link:hover {
          outline: 1px solid ButtonText;
        }

        .nav-rail__link--active {
          outline: 2px solid ButtonText;
          outline-offset: -2px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .nav-rail,
        .nav-rail__link,
        .nav-rail__badge,
        .nav-rail__tooltip {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .nav-rail {
          display: none;
        }
      }
    `,
  ];

  @property({ type: Array }) items: NavRailItem[] = [];
  @property() activeItem = '';
  @property({ type: Boolean, reflect: true }) expanded = false;
  @property({ type: Boolean, reflect: true, attribute: 'show-toggle' })
  showToggle = true;

  /**
   * Toggle expanded state
   */
  toggleExpanded(): void {
    this.expanded = !this.expanded;
    this.emitEvent('toggle', { expanded: this.expanded });
  }

  /**
   * Select an item
   */
  selectItem(value: string): void {
    const item = this.items.find(i => i.value === value);
    if (!item || item.disabled) return;

    this.activeItem = value;
    this.emitEvent('item-select', { value, item });
  }

  /**
   * Handle item click
   */
  private handleItemClick(event: MouseEvent, item: NavRailItem): void {
    if (item.disabled || !item.href) {
      event.preventDefault();
    }

    this.selectItem(item.value);
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyDown(event: KeyboardEvent, currentIndex: number): void {
    const flatItems = this.items.filter(item => !item.disabled);
    if (flatItems.length === 0) return;

    let nextIndex: number;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % flatItems.length;
        break;

      case 'ArrowUp':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + flatItems.length) % flatItems.length;
        break;

      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        nextIndex = flatItems.length - 1;
        break;

      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      const item = flatItems[nextIndex];
      this.selectItem(item.value);
      // Focus the new item
      const links = this.shadowRoot?.querySelectorAll('.nav-rail__link');
      (links?.[nextIndex] as HTMLElement)?.focus();
    }
  }

  /**
   * Render nav item
   */
  private renderItem(item: NavRailItem, index: number) {
    const isActive = item.value === this.activeItem;
    const linkClasses = {
      'nav-rail__link': true,
      'nav-rail__link--active': isActive,
      'nav-rail__link--disabled': item.disabled || false,
    };

    const linkElement = item.href
      ? html`<a
          href=${item.href}
          target=${item.target || '_self'}
          rel=${item.rel || ''}
          class=${classMap(linkClasses)}
          part="link"
          aria-current=${isActive ? 'page' : nothing}
          @click=${(e: MouseEvent) => this.handleItemClick(e, item)}
          @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, index)}
        ></a>`
      : html`<button
          type="button"
          class=${classMap(linkClasses)}
          part="link"
          aria-current=${isActive ? 'true' : 'false'}
          @click=${(e: MouseEvent) => this.handleItemClick(e, item)}
          @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, index)}
        ></button>`;

    return html`
      <li class="nav-rail__item" part="item">
        ${linkElement}
        <span class="nav-rail__icon" part="icon">
          <zeno-icon name=${item.icon} size="24"></zeno-icon>
        </span>

        <span class="nav-rail__label" part="label"> ${item.label} </span>

        ${
          !this.expanded
            ? html`
                <span class="nav-rail__tooltip" part="tooltip">
                  ${item.label}
                </span>
              `
            : nothing
        }
        ${
          item.badge !== undefined
            ? html`
                <span class="nav-rail__badge" part="badge">
                  ${item.badge}
                </span>
              `
            : nothing
        }
        ${item.href ? html`</a>` : html`</button>`}
      </li>
    `;
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      'nav-rail': true,
      'nav-rail--expanded': this.expanded,
    };

    // Group items by section
    const sections = new Map<string | undefined, NavRailItem[]>();
    this.items.forEach(item => {
      const section = item.section;
      if (!sections.has(section)) {
        sections.set(section, []);
      }
      sections.get(section)!.push(item);
    });

    return html`
      <nav
        class=${classMap(classes)}
        part="base"
        aria-label=${this.ariaLabel || 'Navigation rail'}
      >
        ${
          this.showToggle
            ? html`
                <div class="nav-rail__header" part="header">
                  <slot name="header"></slot>
                  <button
                    class="nav-rail__toggle"
                    part="toggle"
                    type="button"
                    aria-label=${
                      this.expanded
                        ? 'Collapse navigation'
                        : 'Expand navigation'
                    }
                    aria-expanded=${this.expanded ? 'true' : 'false'}
                    @click=${this.toggleExpanded}
                  >
                    <zeno-icon
                      name=${this.expanded ? 'chevron-left' : 'menu'}
                      size="20"
                    ></zeno-icon>
                  </button>
                </div>
              `
            : nothing
        }

        <div class="nav-rail__items" part="items">
          <ul class="nav-rail__list" part="list">
            ${Array.from(sections.entries()).map(
              ([section, items]) => html`
                <li class="nav-rail__section" part="section">
                  ${
                    section
                      ? html`
                          <div
                            class="nav-rail__section-title"
                            part="section-title"
                          >
                            ${section}
                          </div>
                        `
                      : nothing
                  }
                  <ul class="nav-rail__list" part="section-list">
                    ${items.map((item, index) => this.renderItem(item, index))}
                  </ul>
                </li>
              `
            )}
          </ul>
        </div>

        <div class="nav-rail__footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-nav-rail': ZenoNavRail;
  }
}

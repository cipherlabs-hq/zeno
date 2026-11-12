import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { AccordionItem, AccordionSize } from '../types.js';

/**
 * A stack of sections that open and close. One section is open at a time
 * unless `multiple` is set.
 *
 * @fires {CustomEvent<{ value: string; item: AccordionItem }>} expand - A section opened.
 * @fires {CustomEvent<{ value: string; item: AccordionItem }>} collapse - A section closed.
 * @fires {CustomEvent<{ expanded: string[] }>} change - The set of open sections changed.
 * @fires {CustomEvent} expand-all - expandAll() opened every section.
 * @fires {CustomEvent} collapse-all - collapseAll() closed every section.
 * @csspart base
 * @csspart content
 * @csspart content-wrapper
 * @csspart expand-icon
 * @csspart header
 * @csspart icon
 * @csspart item
 * @csspart title
 */
@customElement('zeno-accordion')
export class ZenoAccordion extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --accordion-border-color: var(--zeno-color-border-subtle);
        --accordion-background: var(--zeno-color-background-surface);
        --accordion-header-padding-sm: var(--zeno-spacing-3);
        --accordion-header-padding-md: var(--zeno-spacing-4);
        --accordion-header-padding-lg: var(--zeno-spacing-5);
        --accordion-content-padding: var(--zeno-spacing-4);
        --accordion-font-size-sm: var(--zeno-font-size-sm);
        --accordion-font-size-md: var(--zeno-font-size-md);
        --accordion-font-size-lg: var(--zeno-font-size-lg);
        --accordion-transition: all var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);

        display: block;
      }

      /* Accordion container */
      .accordion {
        width: 100%;
        border-radius: var(--zeno-radius-lg);
        overflow: hidden;
      }

      /* Size variants */
      .accordion--sm {
        font-size: var(--accordion-font-size-sm);
      }

      .accordion--md {
        font-size: var(--accordion-font-size-md);
      }

      .accordion--lg {
        font-size: var(--accordion-font-size-lg);
      }

      /* Accordion item */
      .accordion__item {
        background: var(--accordion-background);
        border: 1px solid var(--accordion-border-color);
        margin-bottom: -1px;
      }

      .accordion__item:first-child {
        border-top-left-radius: var(--zeno-radius-lg);
        border-top-right-radius: var(--zeno-radius-lg);
      }

      .accordion__item:last-child {
        border-bottom-left-radius: var(--zeno-radius-lg);
        border-bottom-right-radius: var(--zeno-radius-lg);
      }

      /* Accordion header */
      .accordion__header {
        position: relative;
        width: 100%;
        padding: var(--accordion-header-padding);
        border: none;
        background: transparent;
        color: var(--zeno-color-text-primary);
        font-family: var(--zeno-font-family-sans);
        font-size: inherit;
        font-weight: var(--zeno-font-weight-medium);
        text-align: left;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--zeno-spacing-3);
        transition: var(--accordion-transition);
      }

      .accordion--sm .accordion__header {
        padding: var(--accordion-header-padding-sm);
      }

      .accordion--md .accordion__header {
        padding: var(--accordion-header-padding-md);
      }

      .accordion--lg .accordion__header {
        padding: var(--accordion-header-padding-lg);
      }

      .accordion__header:hover:not(:disabled) {
        background: var(--zeno-color-background-hover);
        color: var(--zeno-color-accent-text);
      }

      .accordion__header:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: -2px;
        z-index: 1;
      }

      .accordion__header:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Header content */
      .accordion__header-content {
        display: flex;
        align-items: center;
        gap: var(--zeno-spacing-2);
        flex: 1;
      }

      /* Icon */
      .accordion__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      /* Title */
      .accordion__title {
        flex: 1;
        line-height: 1.5;
      }

      /* Expand icon */
      .accordion__expand-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--zeno-color-text-secondary);
        transition: transform var(--accordion-transition);
      }

      .accordion__item--expanded .accordion__expand-icon {
        transform: rotate(180deg);
      }

      /* Content wrapper */
      .accordion__content-wrapper {
        overflow: hidden;
        transition: height var(--accordion-transition);
      }

      .accordion__content-wrapper--collapsed {
        height: 0;
      }

      /* Content */
      .accordion__content {
        padding: var(--accordion-content-padding);
        color: var(--zeno-color-text-secondary);
        line-height: var(--zeno-font-line-height-relaxed);
      }

      /* Bordered variant */
      .accordion--bordered .accordion__item {
        border-radius: var(--zeno-radius-lg);
        margin-bottom: var(--zeno-spacing-2);
      }

      .accordion--bordered .accordion__item:last-child {
        margin-bottom: 0;
      }

      /* Ghost variant */
      .accordion--ghost .accordion__item {
        border: none;
        background: transparent;
      }

      .accordion--ghost .accordion__header {
        border-radius: var(--zeno-radius-md);
      }

      .accordion--ghost .accordion__content {
        padding-left: 0;
        padding-right: 0;
      }

      /* Filled variant */
      .accordion--filled .accordion__item {
        background: var(--zeno-color-background-subtle);
        border-color: transparent;
      }

      .accordion--filled .accordion__header:hover:not(:disabled) {
        background: var(--zeno-color-background-muted);
      }

      /* Flush variant */
      .accordion--flush .accordion__item {
        border-left: none;
        border-right: none;
        border-radius: 0;
      }

      .accordion--flush .accordion__header {
        padding-left: 0;
        padding-right: 0;
      }

      .accordion--flush .accordion__content {
        padding-left: 0;
        padding-right: 0;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .accordion__item {
          border-width: 2px;
        }

        .accordion__header:hover:not(:disabled) {
          outline: 1px solid ButtonText;
        }

        .accordion__header:focus-visible {
          outline-width: 3px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .accordion__header,
        .accordion__expand-icon,
        .accordion__content-wrapper {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .accordion__item {
          border-color: #000;
          break-inside: avoid;
        }

        .accordion__content-wrapper {
          height: auto !important;
        }

        .accordion__expand-icon {
          display: none;
        }
      }
    `,
  ];

  @property({ type: Array }) items: AccordionItem[] = [];
  @property({ type: Boolean }) multiple = false;
  @property({ reflect: true }) variant:
    'default' | 'bordered' | 'ghost' | 'filled' | 'flush' = 'default';
  @property({ reflect: true }) size: AccordionSize = 'md';
  @property({ type: Array }) defaultExpanded: string[] = [];

  @state() private expandedItems = new Set<string>();

  /**
   * First updated lifecycle
   */
  protected override firstUpdated(
    changedProperties: Map<string, unknown>
  ): void {
    super.firstUpdated(changedProperties);

    // Set default expanded items
    this.defaultExpanded.forEach(value => {
      this.expandedItems.add(value);
    });
  }

  /**
   * Toggle item expansion
   */
  toggleItem(value: string): void {
    const item = this.items.find(i => i.value === value);
    if (!item || item.disabled) return;

    if (this.expandedItems.has(value)) {
      this.expandedItems.delete(value);
      this.emitEvent('collapse', { value, item });
    } else {
      if (!this.multiple) {
        // Close all other items
        this.expandedItems.clear();
      }
      this.expandedItems.add(value);
      this.emitEvent('expand', { value, item });
    }

    this.requestUpdate();
    this.emitEvent('change', {
      expanded: Array.from(this.expandedItems),
    });
  }

  /**
   * Expand all items
   */
  expandAll(): void {
    this.items.forEach(item => {
      if (!item.disabled) {
        this.expandedItems.add(item.value);
      }
    });
    this.requestUpdate();
    this.emitEvent('expand-all');
  }

  /**
   * Collapse all items
   */
  collapseAll(): void {
    this.expandedItems.clear();
    this.requestUpdate();
    this.emitEvent('collapse-all');
  }

  /**
   * Check if item is expanded
   */
  isExpanded(value: string): boolean {
    return this.expandedItems.has(value);
  }

  /**
   * Handle item click
   */
  private handleItemClick(value: string): void {
    this.toggleItem(value);
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyDown(event: KeyboardEvent, index: number): void {
    const enabledItems = this.items.filter(item => !item.disabled);
    const currentIndex = enabledItems.findIndex(
      item => item === this.items[index]
    );

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleItem(this.items[index].value);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < enabledItems.length - 1) {
          const nextItem = enabledItems[currentIndex + 1];
          const nextIndex = this.items.indexOf(nextItem);
          const buttons =
            this.shadowRoot?.querySelectorAll('.accordion__header');
          (buttons?.[nextIndex] as HTMLElement)?.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          const prevItem = enabledItems[currentIndex - 1];
          const prevIndex = this.items.indexOf(prevItem);
          const buttons =
            this.shadowRoot?.querySelectorAll('.accordion__header');
          (buttons?.[prevIndex] as HTMLElement)?.focus();
        }
        break;
      case 'Home': {
        event.preventDefault();
        const firstEnabledIndex = this.items.indexOf(enabledItems[0]);
        const buttons = this.shadowRoot?.querySelectorAll('.accordion__header');
        (buttons?.[firstEnabledIndex] as HTMLElement)?.focus();
        break;
      }
      case 'End': {
        event.preventDefault();
        const lastEnabledIndex = this.items.indexOf(
          enabledItems[enabledItems.length - 1]
        );
        const buttonsEnd =
          this.shadowRoot?.querySelectorAll('.accordion__header');
        (buttonsEnd?.[lastEnabledIndex] as HTMLElement)?.focus();
        break;
      }
    }
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      accordion: true,
      [`accordion--${this.variant}`]: true,
      [`accordion--${this.size}`]: true,
    };

    return html`
      <div
        class=${classMap(classes)}
        part="base"
        role="region"
        aria-label=${this.ariaLabel || 'Accordion'}
      >
        ${repeat(
          this.items,
          item => item.value,
          (item, index) => {
            const isExpanded = this.isExpanded(item.value);
            const isDisabled = item.disabled || false;

            const itemClasses = {
              accordion__item: true,
              'accordion__item--expanded': isExpanded,
              'accordion__item--disabled': isDisabled,
            };

            const contentClasses = {
              'accordion__content-wrapper': true,
              'accordion__content-wrapper--collapsed': !isExpanded,
            };

            const contentId = `content-${item.value}`;
            const headerId = `header-${item.value}`;

            return html`
              <div class=${classMap(itemClasses)} part="item">
                <button
                  id=${headerId}
                  class="accordion__header"
                  part="header"
                  type="button"
                  ?disabled=${isDisabled}
                  aria-expanded=${isExpanded ? 'true' : 'false'}
                  aria-controls=${contentId}
                  @click=${() => this.handleItemClick(item.value)}
                  @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, index)}
                >
                  <div class="accordion__header-content">
                    ${
                      item.icon
                        ? html`
                            <span class="accordion__icon" part="icon">
                              <zeno-icon
                                name=${item.icon}
                                size="20"
                              ></zeno-icon>
                            </span>
                          `
                        : nothing
                    }
                    <span class="accordion__title" part="title">
                      ${item.label}
                    </span>
                  </div>
                  <span class="accordion__expand-icon" part="expand-icon">
                    <zeno-icon name="chevron-down" size="20"></zeno-icon>
                  </span>
                </button>

                <div
                  id=${contentId}
                  class=${classMap(contentClasses)}
                  part="content-wrapper"
                  role="region"
                  aria-labelledby=${headerId}
                  @transitionend=${this.handleTransitionEnd}
                  style=${`height: ${isExpanded ? 'auto' : '0'}`}
                >
                  <div class="accordion__content" part="content">
                    ${item.content}
                  </div>
                </div>
              </div>
            `;
          }
        )}
      </div>
    `;
  }

  /**
   * Handle transition end for cleanup
   */
  private handleTransitionEnd(event: TransitionEvent): void {
    const wrapper = event.target as HTMLElement;
    if (
      wrapper.classList.contains('accordion__content-wrapper') &&
      !wrapper.classList.contains('accordion__content-wrapper--collapsed')
    ) {
      wrapper.style.height = 'auto';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-accordion': ZenoAccordion;
  }
}

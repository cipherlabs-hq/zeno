import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
// Elements this one renders, so that importing it alone is enough.
import '../spinner/zeno-spinner.js';

/**
 * A bordered surface for one subject, with optional cover, header and footer.
 *
 * @slot - The body.
 * @slot cover - An image or other media above the header.
 * @slot footer - Actions or secondary content.
 * @slot header - Replaces the title and subtitle.
 * @csspart base
 * @csspart body
 * @csspart cover
 * @csspart footer
 * @csspart header
 * @csspart loading
 * @csspart subtitle
 * @csspart title
 */
@customElement('zeno-card')
export class ZenoCard extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --card-padding: var(--zeno-spacing-4);
        --card-border-radius: var(--zeno-radius-lg);
        --card-background: var(--zeno-color-background-surface);
        --card-border-color: var(--zeno-color-border-subtle);
        --card-header-border: var(--zeno-color-border-subtle);

        display: block;
      }

      /* Card container */
      .card {
        position: relative;
        display: flex;
        flex-direction: column;
        background: var(--card-background);
        border-radius: var(--card-border-radius);
        overflow: hidden;
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      /* Elevation variants */
      .card--elevation-0 {
        box-shadow: none;
      }

      .card--elevation-1 {
        box-shadow: var(--zeno-shadow-xs);
      }

      .card--elevation-2 {
        box-shadow: var(--zeno-shadow-sm);
      }

      .card--elevation-3 {
        box-shadow: var(--zeno-shadow-md);
      }

      .card--elevation-4 {
        box-shadow: var(--zeno-shadow-lg);
      }

      /* Outlined variant */
      .card--outlined {
        box-shadow: none;
        border: 1px solid var(--card-border-color);
      }

      /* Interactive states */
      .card--interactive {
        cursor: pointer;
      }

      .card--interactive:hover {
        transform: translateY(-2px);
      }

      .card--interactive.card--elevation-0:hover,
      .card--interactive.card--elevation-1:hover {
        box-shadow: var(--zeno-shadow-sm);
      }

      .card--interactive.card--elevation-2:hover {
        box-shadow: var(--zeno-shadow-md);
      }

      .card--interactive.card--elevation-3:hover,
      .card--interactive.card--elevation-4:hover {
        box-shadow: var(--zeno-shadow-xl);
      }

      .card--interactive:active {
        transform: translateY(0);
      }

      /* Clickable variant */
      .card--clickable {
        cursor: pointer;
      }

      /* Selected state */
      .card--selected {
        border-color: var(--zeno-color-accent-solid);
        box-shadow: 0 0 0 2px var(--zeno-color-accent-solid);
      }

      /* Loading state */
      .card--loading {
        pointer-events: none;
      }

      .card--loading > * {
        opacity: 0.5;
      }

      /* Disabled state */
      .card--disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Card sections */
      .card__cover {
        position: relative;
        width: 100%;
        overflow: hidden;
      }

      .card__cover ::slotted(img),
      .card__cover ::slotted(video) {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .card__header {
        padding: var(--card-padding);
        border-bottom: 1px solid var(--card-header-border);
      }

      .card--no-header-border .card__header {
        border-bottom: none;
      }

      .card__title {
        margin: 0;
        font-size: var(--zeno-font-size-lg);
        font-weight: var(--zeno-font-weight-semibold);
        color: var(--zeno-color-text-primary);
        line-height: var(--zeno-font-line-height-tight);
      }

      .card__subtitle {
        margin: var(--zeno-spacing-1) 0 0;
        font-size: var(--zeno-font-size-sm);
        color: var(--zeno-color-text-secondary);
        line-height: var(--zeno-font-line-height-normal);
      }

      .card__body {
        flex: 1;
        padding: var(--card-padding);
      }

      .card__footer {
        padding: var(--card-padding);
        border-top: 1px solid var(--card-header-border);
        display: flex;
        align-items: center;
        gap: var(--zeno-spacing-2);
      }

      .card--no-footer-border .card__footer {
        border-top: none;
      }

      /* Compact variant */
      .card--compact {
        --card-padding: var(--zeno-spacing-3);
      }

      /* Loading overlay */
      .card__loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(
          in srgb,
          var(--zeno-color-background-surface) 80%,
          transparent
        );
        z-index: 10;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .card {
          border: 2px solid ButtonText;
        }

        .card__header,
        .card__footer {
          border-color: ButtonText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .card {
          transition: none;
        }

        .card--interactive:hover,
        .card--clickable:hover {
          transform: none;
        }
      }

      /* Print styles */
      @media print {
        .card {
          box-shadow: none !important;
          border: 1px solid #000;
          break-inside: avoid;
        }
      }
    `,
  ];

  @property({ type: Number, reflect: true }) elevation: 0 | 1 | 2 | 3 | 4 = 1;
  @property({ type: Boolean, reflect: true }) outlined = false;
  @property({ type: Boolean, reflect: true }) interactive = false;
  @property({ type: Boolean, reflect: true }) clickable = false;
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) compact = false;
  @property({ type: Boolean, reflect: true, attribute: 'no-header-border' })
  noHeaderBorder = false;
  @property({ type: Boolean, reflect: true, attribute: 'no-footer-border' })
  noFooterBorder = false;
  @property() override title = '';
  @property() subtitle?: string;
  @property() href?: string;
  @property() target?: string;
  @property() rel?: string;

  @state() private hasHeader = false;
  @state() private hasFooter = false;
  @state() private hasCover = false;

  /**
   * Handle slot changes to determine which sections are present
   */
  private handleSlotChange(slotName: string): void {
    const slot = this.shadowRoot?.querySelector(
      `slot[name="${slotName}"]`
    ) as HTMLSlotElement;
    const hasContent = slot
      ? slot.assignedNodes({ flatten: true }).length > 0
      : false;

    switch (slotName) {
      case 'header':
        this.hasHeader = hasContent;
        break;
      case 'footer':
        this.hasFooter = hasContent;
        break;
      case 'cover':
        this.hasCover = hasContent;
        break;
    }
  }

  /**
   * Handle click events
   */
  private handleClick(): void {
    if (this.disabled || this.loading || (!this.clickable && !this.interactive))
      return;

    if (this.href) {
      // Navigate to href
      const anchor = document.createElement('a');
      anchor.href = this.href;
      anchor.target = this.target || '_self';
      anchor.rel = this.rel || '';
      anchor.click();
    }
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      card: true,
      [`card--elevation-${this.elevation}`]: !this.outlined,
      'card--outlined': this.outlined,
      'card--interactive': this.interactive,
      'card--clickable': this.clickable || !!this.href,
      'card--selected': this.selected,
      'card--loading': this.loading,
      'card--disabled': this.disabled,
      'card--compact': this.compact,
      'card--no-header-border': this.noHeaderBorder,
      'card--no-footer-border': this.noFooterBorder,
    };

    return html`
      <article
        part="base"
        class=${classMap(classes)}
        role=${this.clickable || this.href ? 'button' : 'article'}
        tabindex=${this.clickable || this.href ? '0' : '-1'}
        aria-label=${this.ariaLabel || this.title}
        aria-pressed=${this.clickable ? String(this.selected) : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        ${
          this.loading
            ? html`
                <div class="card__loading" part="loading">
                  <zeno-spinner size="lg"></zeno-spinner>
                </div>
              `
            : nothing
        }
        ${
          this.hasCover || this.hasSlot('cover')
            ? html`
                <div class="card__cover" part="cover">
                  <slot
                    name="cover"
                    @slotchange=${() => this.handleSlotChange('cover')}
                  ></slot>
                </div>
              `
            : nothing
        }
        ${
          this.hasHeader ||
          this.hasSlot('header') ||
          this.title ||
          this.subtitle
            ? html`
                <header class="card__header" part="header">
                  ${
                    this.hasSlot('header')
                      ? html`<slot
                          name="header"
                          @slotchange=${() => this.handleSlotChange('header')}
                        ></slot>`
                      : html`
                          ${
                            this.title
                              ? html`<h3 class="card__title" part="title">
                                  ${this.title}
                                </h3>`
                              : nothing
                          }
                          ${
                            this.subtitle
                              ? html`<p class="card__subtitle" part="subtitle">
                                  ${this.subtitle}
                                </p>`
                              : nothing
                          }
                        `
                  }
                </header>
              `
            : nothing
        }

        <div class="card__body" part="body">
          <slot></slot>
        </div>

        ${
          this.hasFooter || this.hasSlot('footer')
            ? html`
                <footer class="card__footer" part="footer">
                  <slot
                    name="footer"
                    @slotchange=${() => this.handleSlotChange('footer')}
                  ></slot>
                </footer>
              `
            : nothing
        }
      </article>
    `;
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.clickable && !this.interactive && !this.href) return;
    if (this.disabled || this.loading) return;

    // Only for the element itself: a key pressed in something inside it,
    // such as a button, belongs to that control.
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // A real click, so that listeners get the same event as from a pointer.
      (event.currentTarget as HTMLElement).click();
    }
  }

  /**
   * Check if a slot has content
   */
  private hasSlot(name: string): boolean {
    const slot = this.shadowRoot?.querySelector(
      `slot[name="${name}"]`
    ) as HTMLSlotElement;
    return slot ? slot.assignedNodes({ flatten: true }).length > 0 : false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-card': ZenoCard;
  }
}

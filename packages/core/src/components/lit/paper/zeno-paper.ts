import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';

/**
 * A plain surface with a background, radius and optional shadow.
 *
 * @slot - The content.
 * @csspart base
 */
@customElement('zeno-paper')
export class ZenoPaper extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --paper-padding: var(--zeno-spacing-4);
        --paper-border-radius: var(--zeno-radius-lg);
        --paper-background: var(--zeno-color-background-surface);
        --paper-border-color: var(--zeno-color-border-subtle);
        --paper-border-width: 1px;

        display: block;
      }

      /* Paper container */
      .paper {
        position: relative;
        background: var(--paper-background);
        border-radius: var(--paper-border-radius);
        padding: var(--paper-padding);
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      /* Elevation variants */
      .paper--elevation-0 {
        box-shadow: none;
      }

      .paper--elevation-1 {
        box-shadow: var(--zeno-shadow-xs);
      }

      .paper--elevation-2 {
        box-shadow: var(--zeno-shadow-sm);
      }

      .paper--elevation-3 {
        box-shadow: var(--zeno-shadow-md);
      }

      .paper--elevation-4 {
        box-shadow: var(--zeno-shadow-lg);
      }

      .paper--elevation-5 {
        box-shadow: var(--zeno-shadow-xl);
      }

      /* Outlined variant */
      .paper--outlined {
        box-shadow: none;
        border: var(--paper-border-width) solid var(--paper-border-color);
      }

      /* Interactive states */
      .paper--clickable {
        cursor: pointer;
      }

      .paper--clickable:hover {
        transform: translateY(-2px);
      }

      .paper--clickable.paper--elevation-0:hover,
      .paper--clickable.paper--elevation-1:hover {
        box-shadow: var(--zeno-shadow-sm);
      }

      .paper--clickable.paper--elevation-2:hover {
        box-shadow: var(--zeno-shadow-md);
      }

      .paper--clickable.paper--elevation-3:hover,
      .paper--clickable.paper--elevation-4:hover {
        box-shadow: var(--zeno-shadow-lg);
      }

      .paper--clickable.paper--elevation-5:hover {
        box-shadow: var(--zeno-shadow-xl);
      }

      .paper--clickable:active {
        transform: translateY(0);
      }

      /* Padding variants */
      .paper--padding-none {
        padding: 0;
      }

      .paper--padding-sm {
        padding: var(--zeno-spacing-2);
      }

      .paper--padding-md {
        padding: var(--zeno-spacing-4);
      }

      .paper--padding-lg {
        padding: var(--zeno-spacing-6);
      }

      .paper--padding-xl {
        padding: var(--zeno-spacing-8);
      }

      /* Radius variants */
      .paper--radius-none {
        border-radius: 0;
      }

      .paper--radius-sm {
        border-radius: var(--zeno-radius-sm);
      }

      .paper--radius-md {
        border-radius: var(--zeno-radius-md);
      }

      .paper--radius-lg {
        border-radius: var(--zeno-radius-lg);
      }

      .paper--radius-xl {
        border-radius: var(--zeno-radius-xl);
      }

      .paper--radius-full {
        border-radius: var(--zeno-radius-full);
      }

      /* Background variants */
      .paper--background-primary {
        background: var(--zeno-color-background-surface);
      }

      .paper--background-secondary {
        background: var(--zeno-color-background-subtle);
      }

      .paper--background-tertiary {
        background: var(--zeno-color-background-muted);
      }

      .paper--background-surface {
        background: var(--zeno-color-background-surface);
      }

      /* Glass morphism variant */
      .paper--glass {
        background: color-mix(
          in srgb,
          var(--zeno-color-background-surface) 72%,
          transparent
        );
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid var(--zeno-color-border-default);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .paper {
          border: 1px solid ButtonText;
        }

        .paper--outlined {
          border-width: 2px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .paper {
          transition: none;
        }

        .paper--clickable:hover {
          transform: none;
        }
      }

      /* Print styles */
      @media print {
        .paper {
          box-shadow: none !important;
          border: 1px solid #000;
        }
      }
    `,
  ];

  @property({ type: Number, reflect: true }) elevation: 0 | 1 | 2 | 3 | 4 | 5 =
    1;
  @property({ type: Boolean, reflect: true }) outlined = false;
  @property({ type: Boolean, reflect: true }) clickable = false;
  @property({ reflect: true }) padding: 'none' | 'sm' | 'md' | 'lg' | 'xl' =
    'md';
  @property({ reflect: true }) radius:
    'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
  @property({ reflect: true }) background:
    'primary' | 'secondary' | 'tertiary' | 'surface' = 'primary';
  @property({ type: Boolean, reflect: true }) glass = false;

  /**
   * Render the component
   */
  override render() {
    const classes = {
      paper: true,
      [`paper--elevation-${this.elevation}`]: !this.outlined && !this.glass,
      'paper--outlined': this.outlined,
      'paper--clickable': this.clickable,
      [`paper--padding-${this.padding}`]: true,
      [`paper--radius-${this.radius}`]: true,
      [`paper--background-${this.background}`]: !this.glass,
      'paper--glass': this.glass,
    };

    return html`
      <div
        part="base"
        class=${classMap(classes)}
        role=${this.clickable ? 'button' : 'article'}
        tabindex=${this.clickable ? '0' : '-1'}
        aria-label=${this.ariaLabel}
        @keydown=${this.handleKeyDown}
      >
        <slot></slot>
      </div>
    `;
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.clickable) return;

    // Only for the element itself: a key pressed in something inside it,
    // such as a button, belongs to that control.
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // A real click, so that listeners get the same event as from a pointer.
      (event.currentTarget as HTMLElement).click();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-paper': ZenoPaper;
  }
}

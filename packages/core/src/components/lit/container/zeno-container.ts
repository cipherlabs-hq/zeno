import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';

/**
 * Centres content and keeps it within a maximum width.
 *
 * @slot - The content.
 * @csspart base
 */
@customElement('zeno-container')
export class ZenoContainer extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --container-padding: var(--zeno-spacing-4);

        display: block;
        width: 100%;
      }

      /* Container base */
      .container {
        width: 100%;
        margin-left: auto;
        margin-right: auto;
        padding-left: var(--container-padding);
        padding-right: var(--container-padding);
      }

      /* Max width variants */
      .container--xs {
        max-width: var(--zeno-breakpoint-xs); /* 640px */
      }

      .container--sm {
        max-width: var(--zeno-breakpoint-sm); /* 768px */
      }

      .container--md {
        max-width: var(--zeno-breakpoint-md); /* 1024px */
      }

      .container--lg {
        max-width: var(--zeno-breakpoint-lg); /* 1280px */
      }

      .container--xl {
        max-width: var(--zeno-breakpoint-xl); /* 1536px */
      }

      .container--2xl {
        max-width: var(--zeno-breakpoint-2xl); /* 1920px */
      }

      /* Fluid container */
      .container--fluid {
        max-width: 100%;
      }

      /* No padding modifier */
      .container--no-padding {
        padding-left: 0;
        padding-right: 0;
      }

      /* Responsive padding */
      @media (min-width: 640px) {
        .container {
          --container-padding: var(--zeno-spacing-6);
        }
      }

      @media (min-width: 768px) {
        .container {
          --container-padding: var(--zeno-spacing-8);
        }
      }

      @media (min-width: 1024px) {
        .container {
          --container-padding: var(--zeno-spacing-10);
        }
      }

      @media (min-width: 1280px) {
        .container {
          --container-padding: var(--zeno-spacing-12);
        }
      }

      /* Print styles */
      @media print {
        .container {
          max-width: 100%;
          padding: 0;
        }
      }
    `,
  ];

  @property({ reflect: true }) maxWidth:
    'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'lg';
  @property({ type: Boolean, reflect: true }) fluid = false;
  @property({ type: Boolean, reflect: true, attribute: 'no-padding' })
  noPadding = false;

  /**
   * Render the component
   */
  override render() {
    const classes = {
      container: true,
      [`container--${this.maxWidth}`]: !this.fluid,
      'container--fluid': this.fluid,
      'container--no-padding': this.noPadding,
    };

    return html`
      <div
        part="base"
        class=${classMap(classes)}
        role="region"
        aria-label=${this.ariaLabel || 'Content container'}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-container': ZenoContainer;
  }
}

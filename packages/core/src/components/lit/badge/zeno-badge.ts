import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { ComponentSize } from '../types.js';

/**
 * A count or status dot, shown on its own or on the corner of the slotted
 * element.
 *
 * @slot - The element the badge sits on.
 * @csspart base
 */
@customElement('zeno-badge')
export class ZenoBadge extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --badge-size: var(--zeno-spacing-6);
        --badge-font-size: var(--zeno-font-size-xs);
        --badge-padding: var(--zeno-spacing-1) var(--zeno-spacing-2);
        --badge-min-width: var(--zeno-spacing-5);
        --badge-border-radius: var(--zeno-radius-full);
        --badge-dot-size: var(--zeno-spacing-2);

        display: inline-flex;
        vertical-align: middle;
      }

      /* Size variants */
      :host([size='xs']) {
        --badge-size: var(--zeno-spacing-5);
        --badge-font-size: var(--zeno-font-size-2xs);
        --badge-padding: 0 var(--zeno-spacing-1);
        --badge-min-width: var(--zeno-spacing-4);
        --badge-dot-size: var(--zeno-spacing-1-5);
      }

      :host([size='sm']) {
        --badge-size: var(--zeno-spacing-5);
        --badge-font-size: var(--zeno-font-size-xs);
        --badge-padding: 0 var(--zeno-spacing-1-5);
        --badge-min-width: 1.125rem;
        --badge-dot-size: var(--zeno-spacing-1-5);
      }

      :host([size='lg']) {
        --badge-size: var(--zeno-spacing-7);
        --badge-font-size: var(--zeno-font-size-sm);
        --badge-padding: var(--zeno-spacing-1) var(--zeno-spacing-2-5);
        --badge-min-width: var(--zeno-spacing-6);
        --badge-dot-size: var(--zeno-spacing-2-5);
      }

      /* Badge container */
      .badge {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: var(--badge-min-width);
        height: var(--badge-size);
        padding: var(--badge-padding);
        border-radius: var(--badge-border-radius);
        font-size: var(--badge-font-size);
        font-weight: var(--zeno-font-weight-semibold);
        line-height: 1;
        white-space: nowrap;
        text-align: center;
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        user-select: none;
      }

      /* Dot variant */
      .badge--dot {
        min-width: auto;
        width: var(--badge-dot-size);
        height: var(--badge-dot-size);
        padding: 0;
      }

      /* Variants */
      .badge--primary {
        background-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
      }

      .badge--secondary {
        background-color: var(--zeno-color-neutral-solid);
        color: var(--zeno-color-neutral-on-solid);
      }

      .badge--accent {
        background-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
      }

      .badge--success {
        background-color: var(--zeno-color-success-solid);
        color: var(--zeno-color-success-on-solid);
      }

      .badge--warning {
        background-color: var(--zeno-color-warning-solid);
        color: var(--zeno-color-warning-on-solid);
      }

      .badge--danger {
        background-color: var(--zeno-color-danger-solid);
        color: var(--zeno-color-danger-on-solid);
      }

      .badge--info {
        background-color: var(--zeno-color-info-solid);
        color: var(--zeno-color-info-on-solid);
      }

      .badge--neutral {
        background-color: var(--zeno-color-neutral-solid);
        color: var(--zeno-color-neutral-on-solid);
      }

      /* Outline variant modifier */
      .badge--outline {
        background-color: transparent;
        border: 1px solid currentColor;
      }

      .badge--outline.badge--primary {
        color: var(--zeno-color-accent-text);
      }

      .badge--outline.badge--secondary {
        color: var(--zeno-color-neutral-text);
      }

      .badge--outline.badge--accent {
        color: var(--zeno-color-accent-text);
      }

      .badge--outline.badge--success {
        color: var(--zeno-color-success-text);
      }

      .badge--outline.badge--warning {
        color: var(--zeno-color-warning-text);
      }

      .badge--outline.badge--danger {
        color: var(--zeno-color-danger-text);
      }

      .badge--outline.badge--info {
        color: var(--zeno-color-info-text);
      }

      .badge--outline.badge--neutral {
        color: var(--zeno-color-neutral-text);
      }

      /* Subtle variant modifier */
      .badge--subtle {
        background-color: var(--zeno-color-accent-subtle);
        color: var(--zeno-color-accent-text);
      }

      .badge--subtle.badge--secondary {
        background-color: var(--zeno-color-neutral-subtle);
        color: var(--zeno-color-neutral-text);
      }

      .badge--subtle.badge--accent {
        background-color: var(--zeno-color-accent-subtle);
        color: var(--zeno-color-accent-text);
      }

      .badge--subtle.badge--success {
        background-color: var(--zeno-color-success-subtle);
        color: var(--zeno-color-success-text);
      }

      .badge--subtle.badge--warning {
        background-color: var(--zeno-color-warning-subtle);
        color: var(--zeno-color-warning-text);
      }

      .badge--subtle.badge--danger {
        background-color: var(--zeno-color-danger-subtle);
        color: var(--zeno-color-danger-text);
      }

      .badge--subtle.badge--info {
        background-color: var(--zeno-color-info-subtle);
        color: var(--zeno-color-info-text);
      }

      .badge--subtle.badge--neutral {
        background-color: var(--zeno-color-neutral-subtle);
        color: var(--zeno-color-neutral-text);
      }

      /* Shape variants */
      .badge--rounded {
        border-radius: var(--zeno-radius-md);
      }

      .badge--square {
        border-radius: var(--zeno-radius-sm);
      }

      /* Pulsing animation */
      @keyframes pulse-ring {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }

      .badge--pulse::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: inherit;
        background-color: inherit;
        animation: pulse-ring var(--zeno-motion-duration-xl) ease-out infinite;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .badge {
          border: 1px solid ButtonText;
        }

        .badge:not(.badge--outline) {
          background-color: ButtonText;
          color: ButtonFace;
        }

        .badge--outline {
          background-color: ButtonFace;
          color: ButtonText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .badge--pulse::after {
          animation: none;
        }
      }
    `,
  ];

  @property({ reflect: true }) variant:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral' = 'primary';
  @property({ reflect: true }) size: ComponentSize = 'md';
  @property({ reflect: true }) shape: 'pill' | 'rounded' | 'square' = 'pill';
  @property({ type: Boolean, reflect: true }) outline = false;
  @property({ type: Boolean, reflect: true }) subtle = false;
  @property({ type: Boolean, reflect: true }) dot = false;
  @property({ type: Boolean, reflect: true }) pulse = false;
  @property({ type: Number }) max = 99;
  @property() value?: string | number;

  /**
   * Format the badge value
   */
  private formatValue(): string {
    if (this.value === undefined || this.value === null) {
      return '';
    }

    const numValue =
      typeof this.value === 'number'
        ? this.value
        : parseInt(String(this.value), 10);

    if (!isNaN(numValue) && this.max && numValue > this.max) {
      return `${this.max}+`;
    }

    return String(this.value);
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      badge: true,
      [`badge--${this.variant}`]: true,
      [`badge--${this.shape}`]: this.shape !== 'pill',
      'badge--outline': this.outline,
      'badge--subtle': this.subtle,
      'badge--dot': this.dot,
      'badge--pulse': this.pulse,
    };

    const formattedValue = this.formatValue();

    return html`
      <span
        part="base"
        class=${classMap(classes)}
        role=${this.dot ? 'status' : nothing}
        aria-label=${
          this.dot
            ? this.ariaLabel || `${this.variant} status indicator`
            : nothing
        }
      >
        ${this.dot ? nothing : formattedValue || html`<slot></slot>`}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-badge': ZenoBadge;
  }
}

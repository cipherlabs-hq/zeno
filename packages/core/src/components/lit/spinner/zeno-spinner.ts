import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { ComponentSize } from '../types.js';

/**
 * Shows that something is loading when its duration is not known.
 *
 * @csspart bar
 * @csspart base
 * @csspart dot
 * @csspart fill
 * @csspart track
 */
@customElement('zeno-spinner')
export class ZenoSpinner extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --spinner-size: 2rem;
        --spinner-track-color: var(--zeno-color-border-subtle);
        --spinner-color: var(--zeno-color-accent-text);
        --spinner-width: 3px;

        display: inline-flex;
        vertical-align: middle;
      }

      /* Size variants */
      :host([size='xs']) {
        --spinner-size: 1rem;
        --spinner-width: 2px;
      }

      :host([size='sm']) {
        --spinner-size: 1.5rem;
        --spinner-width: 2px;
      }

      :host([size='md']) {
        --spinner-size: 2rem;
        --spinner-width: 3px;
      }

      :host([size='lg']) {
        --spinner-size: 3rem;
        --spinner-width: 4px;
      }

      :host([size='xl']) {
        --spinner-size: 4rem;
        --spinner-width: 5px;
      }

      /* Container */
      .spinner {
        position: relative;
        width: var(--spinner-size);
        height: var(--spinner-size);
      }

      /* Base spinner styles */
      .spinner__track,
      .spinner__fill {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border-width: var(--spinner-width);
        border-style: solid;
      }

      .spinner__track {
        border-color: var(--spinner-track-color);
      }

      /* Variants */

      /* Circle variant (default) */
      .spinner--circle .spinner__fill {
        border-color: transparent;
        border-top-color: var(--spinner-color);
        animation: spin var(--zeno-motion-duration-xl) linear infinite;
      }

      /* Dots variant */
      .spinner--dots {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: calc(var(--spinner-size) * 0.15);
      }

      .spinner--dots .spinner__dot {
        width: calc(var(--spinner-size) * 0.2);
        height: calc(var(--spinner-size) * 0.2);
        border-radius: 50%;
        background-color: var(--spinner-color);
        animation: pulse var(--zeno-motion-duration-xl) ease-in-out infinite;
      }

      .spinner--dots .spinner__dot:nth-child(2) {
        animation-delay: 0.15s;
      }

      .spinner--dots .spinner__dot:nth-child(3) {
        animation-delay: 0.3s;
      }

      /* Ring variant */
      .spinner--ring .spinner__fill {
        border-color: var(--spinner-color);
        border-right-color: transparent;
        animation: spin var(--zeno-motion-duration-md) ease-in-out infinite;
      }

      /* Bars variant */
      .spinner--bars {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: calc(var(--spinner-size) * 0.1);
      }

      .spinner--bars .spinner__bar {
        width: calc(var(--spinner-size) * 0.15);
        height: calc(var(--spinner-size) * 0.5);
        background-color: var(--spinner-color);
        animation: stretch var(--zeno-motion-duration-xl) ease-in-out infinite;
      }

      .spinner--bars .spinner__bar:nth-child(2) {
        animation-delay: 0.1s;
      }

      .spinner--bars .spinner__bar:nth-child(3) {
        animation-delay: 0.2s;
      }

      /* Pulse variant */
      .spinner--pulse .spinner__fill {
        background-color: var(--spinner-color);
        animation: pulse-scale var(--zeno-motion-duration-xl) ease-in-out
          infinite;
      }

      /* Label */
      .spinner__label {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Animations */
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.3;
        }
      }

      @keyframes stretch {
        0%,
        100% {
          transform: scaleY(0.5);
          opacity: 0.5;
        }
        50% {
          transform: scaleY(1);
          opacity: 1;
        }
      }

      @keyframes pulse-scale {
        0%,
        100% {
          transform: scale(0);
          opacity: 0;
        }
        50% {
          transform: scale(1);
          opacity: 0.5;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .spinner__fill,
        .spinner__dot,
        .spinner__bar {
          animation: none !important;
        }

        .spinner--circle .spinner__fill::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: calc(var(--spinner-size) * 0.3);
          height: calc(var(--spinner-size) * 0.3);
          background-color: var(--spinner-color);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .spinner__track {
          border-color: ButtonFace;
        }

        .spinner__fill,
        .spinner__dot,
        .spinner__bar {
          border-color: ButtonText;
          background-color: ButtonText;
        }
      }
    `,
  ];

  @property({ reflect: true }) variant:
    'circle' | 'dots' | 'ring' | 'bars' | 'pulse' = 'circle';
  @property({ reflect: true }) size: ComponentSize = 'md';
  @property() label = 'Loading';

  /**
   * Render the component
   */
  override render() {
    const classes = {
      spinner: true,
      [`spinner--${this.variant}`]: true,
    };

    return html`
      <div
        part="base"
        class=${classMap(classes)}
        role="status"
        aria-live="polite"
      >
        ${this.renderVariant()}
        <span class="spinner__label">${this.label}</span>
      </div>
    `;
  }

  /**
   * Render variant-specific content
   */
  private renderVariant() {
    switch (this.variant) {
      case 'dots':
        return html`
          <span class="spinner__dot" part="dot"></span>
          <span class="spinner__dot" part="dot"></span>
          <span class="spinner__dot" part="dot"></span>
        `;

      case 'bars':
        return html`
          <span class="spinner__bar" part="bar"></span>
          <span class="spinner__bar" part="bar"></span>
          <span class="spinner__bar" part="bar"></span>
        `;

      case 'circle':
      case 'ring':
      case 'pulse':
      default:
        return html`
          <span class="spinner__track" part="track"></span>
          <span class="spinner__fill" part="fill"></span>
        `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-spinner': ZenoSpinner;
  }
}

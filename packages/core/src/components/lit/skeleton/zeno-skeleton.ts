import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { SkeletonVariant } from '../types.js';

/**
 * A grey placeholder in the shape of content that is still loading.
 *
 * @csspart base
 * @csspart line
 */
@customElement('zeno-skeleton')
export class ZenoSkeleton extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --skeleton-background: var(--zeno-color-background-subtle);
        --skeleton-highlight: var(--zeno-color-background-muted);
        --skeleton-border-radius: var(--zeno-radius-md);
        --skeleton-animation-duration: 1.5s;

        display: block;
      }

      /* Skeleton base */
      .skeleton {
        position: relative;
        overflow: hidden;
        background: var(--skeleton-background);
        border-radius: var(--skeleton-border-radius);
      }

      /* Default dimensions based on variant */
      .skeleton--text {
        height: 1em;
        width: 100%;
      }

      .skeleton--title {
        height: 1.5em;
        width: 50%;
      }

      .skeleton--paragraph {
        height: 1em;
        width: 100%;
      }

      .skeleton--button {
        height: 40px;
        width: 100px;
        border-radius: var(--zeno-radius-md);
      }

      .skeleton--avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .skeleton--image {
        width: 100%;
        height: 200px;
        border-radius: var(--zeno-radius-lg);
      }

      .skeleton--card {
        width: 100%;
        height: 120px;
        border-radius: var(--zeno-radius-lg);
      }

      .skeleton--input {
        height: 40px;
        width: 100%;
        border-radius: var(--zeno-radius-md);
      }

      /* Circle variant */
      .skeleton--circle {
        border-radius: 50%;
      }

      /* Rectangle variant (default) */
      .skeleton--rectangle {
        /* Default border radius */
      }

      /* Wave animation */
      @keyframes skeleton-wave {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      .skeleton--animated::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          transparent,
          var(--skeleton-highlight),
          transparent
        );
        animation: skeleton-wave var(--skeleton-animation-duration) ease-in-out
          infinite;
      }

      /* Pulse animation */
      @keyframes skeleton-pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
        100% {
          opacity: 1;
        }
      }

      .skeleton--pulse {
        animation: skeleton-pulse var(--skeleton-animation-duration) ease-in-out
          infinite;
      }

      /* Multiple lines for paragraph variant */
      .skeleton--paragraph-multiple {
        display: flex;
        flex-direction: column;
        gap: var(--zeno-spacing-2);
      }

      .skeleton__line {
        height: 1em;
        background: var(--skeleton-background);
        border-radius: var(--skeleton-border-radius);
        position: relative;
        overflow: hidden;
      }

      .skeleton--animated .skeleton__line::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          transparent,
          var(--skeleton-highlight),
          transparent
        );
        animation: skeleton-wave var(--skeleton-animation-duration) ease-in-out
          infinite;
      }

      .skeleton__line:last-child {
        width: 80%;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .skeleton {
          background: ButtonFace;
          border: 1px solid ButtonText;
        }

        .skeleton--animated::after {
          background: linear-gradient(
            90deg,
            transparent,
            ButtonText,
            transparent
          );
          opacity: 0.3;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .skeleton--animated::after,
        .skeleton--animated .skeleton__line::after {
          animation: none;
        }

        .skeleton--pulse {
          animation: none;
        }
      }

      /* Print styles */
      @media print {
        .skeleton {
          background: #eee;
          border: 1px solid #ccc;
        }

        .skeleton--animated::after,
        .skeleton--animated .skeleton__line::after {
          display: none;
        }
      }
    `,
  ];

  @property({ reflect: true }) variant: SkeletonVariant = 'text';
  @property({ reflect: true }) shape: 'rectangle' | 'circle' = 'rectangle';
  @property({ type: Boolean, reflect: true }) animated = true;
  @property({ reflect: true }) animation: 'wave' | 'pulse' = 'wave';
  @property() width?: string;
  @property() height?: string;
  @property({ type: Number }) lines?: number;

  /**
   * Render multiple lines for paragraph
   */
  private renderParagraphLines() {
    const lineCount = this.lines || 3;

    return html`
      <div class="skeleton--paragraph-multiple">
        ${Array.from(
          { length: lineCount },
          (_, _i) => html` <div class="skeleton__line" part="line"></div> `
        )}
      </div>
    `;
  }

  /**
   * Render the component
   */
  override render() {
    // For paragraph with multiple lines
    if (this.variant === 'paragraph' && this.lines && this.lines > 1) {
      return this.renderParagraphLines();
    }

    const classes = {
      skeleton: true,
      [`skeleton--${this.variant}`]: true,
      [`skeleton--${this.shape}`]:
        this.shape === 'circle' || this.variant === 'avatar',
      'skeleton--animated': this.animated && this.animation === 'wave',
      'skeleton--pulse': this.animated && this.animation === 'pulse',
    };

    const styles: Record<string, string> = {};

    if (this.width) {
      styles.width = this.width;
    }

    if (this.height) {
      styles.height = this.height;
    }

    return html`
      <div
        class=${classMap(classes)}
        part="base"
        style=${styleMap(styles)}
        role="presentation"
        aria-hidden="true"
        aria-label="Loading"
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-skeleton': ZenoSkeleton;
  }
}

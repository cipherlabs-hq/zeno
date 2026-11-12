import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { ProgressBarVariant, ProgressBarSize } from '../types.js';

/**
 * Shows how much of a task is done.
 *
 * @csspart bar
 * @csspart base
 * @csspart info
 * @csspart label
 * @csspart segment
 * @csspart track
 * @csspart value
 * @csspart wrapper
 */
@customElement('zeno-progress-bar')
export class ZenoProgressBar extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --progress-height-sm: 4px;
        --progress-height-md: 8px;
        --progress-height-lg: 12px;
        --progress-border-radius: var(--zeno-radius-full);
        --progress-background: var(--zeno-color-background-muted);
        --progress-color: var(--zeno-color-accent-solid);
        --progress-stripe: color-mix(
          in srgb,
          var(--zeno-color-background-surface) 20%,
          transparent
        );
        --progress-stripe-size: 1rem;
        --progress-animation-duration: 1s;
        --progress-transition: all var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);

        display: block;
        width: 100%;
      }

      /* Progress container */
      .progress {
        position: relative;
        width: 100%;
        overflow: hidden;
      }

      /* Size variants */
      .progress--sm {
        height: var(--progress-height-sm);
      }

      .progress--md {
        height: var(--progress-height-md);
      }

      .progress--lg {
        height: var(--progress-height-lg);
      }

      /* Progress track */
      .progress__track {
        width: 100%;
        height: 100%;
        background: var(--progress-background);
        border-radius: var(--progress-border-radius);
        overflow: hidden;
      }

      /* Progress bar */
      .progress__bar {
        height: 100%;
        background: var(--progress-color);
        border-radius: var(--progress-border-radius);
        transition: width var(--progress-transition);
        position: relative;
        overflow: hidden;
      }

      /* Variant colors */
      .progress--primary {
        --progress-color: var(--zeno-color-accent-solid);
      }

      .progress--success {
        --progress-color: var(--zeno-color-success-solid);
      }

      .progress--warning {
        --progress-color: var(--zeno-color-warning-solid);
      }

      .progress--error {
        --progress-color: var(--zeno-color-danger-solid);
      }

      .progress--info {
        --progress-color: var(--zeno-color-info-solid);
      }

      /* Striped pattern */
      .progress--striped .progress__bar {
        background-image: linear-gradient(
          45deg,
          var(--progress-stripe) 25%,
          transparent 25%,
          transparent 50%,
          var(--progress-stripe) 50%,
          var(--progress-stripe) 75%,
          transparent 75%,
          transparent
        );
        background-size: var(--progress-stripe-size) var(--progress-stripe-size);
      }

      /* Animated stripes */
      @keyframes progress-stripes {
        from {
          background-position: 0 0;
        }
        to {
          background-position: var(--progress-stripe-size) 0;
        }
      }

      .progress--animated .progress__bar {
        animation: progress-stripes var(--progress-animation-duration) linear
          infinite;
      }

      /* Indeterminate state */
      @keyframes progress-indeterminate {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      .progress--indeterminate .progress__bar {
        width: 30% !important;
        animation: progress-indeterminate 1.5s ease-in-out infinite;
      }

      /* Label */
      .progress__label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: var(--zeno-font-size-xs);
        font-weight: var(--zeno-font-weight-medium);
        color: var(--zeno-color-text-primary);
        white-space: nowrap;
        z-index: 1;
      }

      .progress--sm .progress__label {
        display: none;
      }

      /* External label */
      .progress-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--zeno-spacing-2);
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--zeno-font-size-sm);
      }

      .progress-info__label {
        color: var(--zeno-color-text-primary);
        font-weight: var(--zeno-font-weight-medium);
      }

      .progress-info__value {
        color: var(--zeno-color-text-secondary);
      }

      /* Segmented variant */
      .progress--segmented .progress__track {
        display: flex;
        gap: 2px;
      }

      .progress__segment {
        flex: 1;
        height: 100%;
        background: var(--progress-background);
        border-radius: var(--progress-border-radius);
        overflow: hidden;
        position: relative;
      }

      .progress__segment--filled {
        background: var(--progress-color);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .progress__track {
          border: 1px solid ButtonText;
        }

        .progress__bar,
        .progress__segment--filled {
          background: ButtonText;
        }

        .progress__label {
          color: ButtonText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .progress__bar {
          transition: none;
        }

        .progress--animated .progress__bar,
        .progress--indeterminate .progress__bar {
          animation: none;
        }
      }

      /* Print styles */
      @media print {
        .progress__track {
          border: 1px solid #000;
        }

        .progress__bar,
        .progress__segment--filled {
          background: #000;
        }
      }
    `,
  ];

  @property({ type: Number }) value = 0;
  @property({ type: Number }) max = 100;
  @property({ reflect: true }) variant: ProgressBarVariant = 'primary';
  @property({ reflect: true }) size: ProgressBarSize = 'md';
  @property() label?: string;
  @property({ type: Boolean, reflect: true, attribute: 'show-value' })
  showValue = false;
  @property({ type: Boolean, reflect: true }) striped = false;
  @property({ type: Boolean, reflect: true }) animated = false;
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  @property({ type: Number }) segments?: number;
  @property() formatValue?: (_value: number, _max: number) => string;

  /**
   * Calculate percentage
   */
  private get percentage(): number {
    return Math.min(100, Math.max(0, (this.value / this.max) * 100));
  }

  /**
   * Get formatted value
   */
  private getFormattedValue(): string {
    if (this.formatValue) {
      return this.formatValue(this.value, this.max);
    }
    return `${Math.round(this.percentage)}%`;
  }

  /**
   * Calculate filled segments
   */
  private getFilledSegments(): number {
    if (!this.segments) return 0;
    return Math.round((this.percentage / 100) * this.segments);
  }

  /**
   * Render segmented progress
   */
  private renderSegmented() {
    if (!this.segments || this.segments <= 1) return nothing;

    const filledSegments = this.getFilledSegments();

    return html`
      ${Array.from(
        { length: this.segments },
        (_, i) => html`
          <div
            class=${classMap({
              progress__segment: true,
              'progress__segment--filled': i < filledSegments,
            })}
            part="segment"
          ></div>
        `
      )}
    `;
  }

  /**
   * Render regular progress bar
   */
  private renderBar() {
    const barStyles = {
      width: this.indeterminate ? '30%' : `${this.percentage}%`,
    };

    return html`
      <div
        class="progress__bar"
        part="bar"
        style=${styleMap(barStyles)}
        role="progressbar"
        aria-valuenow=${this.value}
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-label=${this.ariaLabel || this.label || 'Progress'}
      ></div>
    `;
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      progress: true,
      [`progress--${this.variant}`]: true,
      [`progress--${this.size}`]: true,
      'progress--striped': this.striped && !this.segments,
      'progress--animated': this.animated && this.striped && !this.segments,
      'progress--indeterminate': this.indeterminate && !this.segments,
      'progress--segmented': !!this.segments,
    };

    const showExternalLabel = this.label && this.size !== 'lg';
    const showInternalLabel =
      (this.label || this.showValue) && this.size === 'lg' && !this.segments;

    if (showExternalLabel) {
      return html`
        <div class="progress-wrapper" part="wrapper">
          <div class="progress-info" part="info">
            <span class="progress-info__label" part="label">${this.label}</span>
            ${
              this.showValue && !this.indeterminate
                ? html`
                    <span class="progress-info__value" part="value">
                      ${this.getFormattedValue()}
                    </span>
                  `
                : nothing
            }
          </div>
          <div class=${classMap(classes)} part="base">
            <div class="progress__track" part="track">
              ${this.segments ? this.renderSegmented() : this.renderBar()}
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class=${classMap(classes)} part="base">
        <div class="progress__track" part="track">
          ${this.segments ? this.renderSegmented() : this.renderBar()}
          ${
            showInternalLabel
              ? html`
                  <div class="progress__label" part="label">
                    ${
                      this.label ||
                      (this.showValue && !this.indeterminate
                        ? this.getFormattedValue()
                        : '')
                    }
                  </div>
                `
              : nothing
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-progress-bar': ZenoProgressBar;
  }
}

import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { ToastVariant, ToastPosition } from '../types.js';

/**
 * A short message that appears over the page and goes away by itself.
 *
 * @slot - The message.
 * @slot action - A button shown with the message.
 * @fires {CustomEvent} show - The toast appeared.
 * @fires {CustomEvent} hide - The toast finished hiding.
 * @fires {CustomEvent} close - The close button was pressed.
 * @csspart action
 * @csspart base
 * @csspart close
 * @csspart content
 * @csspart icon
 * @csspart message
 * @csspart progress
 * @csspart progress-bar
 * @csspart title
 */
@customElement('zeno-toast')
export class ZenoToast extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --toast-padding: var(--zeno-spacing-3) var(--zeno-spacing-4);
        --toast-border-radius: var(--zeno-radius-md);
        --toast-min-width: 300px;
        --toast-max-width: 500px;
        --toast-font-size: var(--zeno-font-size-md);
        --toast-shadow: var(--zeno-shadow-md);
        --toast-transition: all var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);

        position: fixed;
        z-index: var(--zeno-z-index-toast);
        pointer-events: none;
      }

      /* Position variants */
      :host([position='top']) {
        top: var(--zeno-spacing-4);
        left: 50%;
        transform: translateX(-50%);
      }

      :host([position='top-start']) {
        top: var(--zeno-spacing-4);
        left: var(--zeno-spacing-4);
      }

      :host([position='top-end']) {
        top: var(--zeno-spacing-4);
        right: var(--zeno-spacing-4);
      }

      :host([position='bottom']) {
        bottom: var(--zeno-spacing-4);
        left: 50%;
        transform: translateX(-50%);
      }

      :host([position='bottom-start']) {
        bottom: var(--zeno-spacing-4);
        left: var(--zeno-spacing-4);
      }

      :host([position='bottom-end']) {
        bottom: var(--zeno-spacing-4);
        right: var(--zeno-spacing-4);
      }

      /* Toast container */
      .toast {
        display: flex;
        align-items: center;
        gap: var(--zeno-spacing-3);
        min-width: var(--toast-min-width);
        max-width: var(--toast-max-width);
        padding: var(--toast-padding);
        background: var(--zeno-color-background-inverse);
        color: var(--zeno-color-text-inverse);
        border-radius: var(--toast-border-radius);
        box-shadow: var(--toast-shadow);
        font-size: var(--toast-font-size);
        line-height: var(--zeno-font-line-height-normal);
        pointer-events: auto;
        transition: var(--toast-transition);
      }

      /* Variant styles */
      .toast--info {
        background: var(--zeno-color-info-solid);
      }

      .toast--success {
        background: var(--zeno-color-success-solid);
      }

      .toast--warning {
        background: var(--zeno-color-warning-solid);
      }

      .toast--error {
        background: var(--zeno-color-danger-solid);
      }

      .toast--default {
        background: var(--zeno-color-background-inverse);
      }

      /* Light variant */
      .toast--light {
        background: var(--zeno-color-background-surface);
        color: var(--zeno-color-text-primary);
        border: 1px solid var(--zeno-color-border-subtle);
      }

      .toast--light.toast--info {
        background: var(--zeno-color-info-subtle);
        color: var(--zeno-color-info-text);
        border-color: var(--zeno-color-info-border);
      }

      .toast--light.toast--success {
        background: var(--zeno-color-success-subtle);
        color: var(--zeno-color-success-text);
        border-color: var(--zeno-color-success-border);
      }

      .toast--light.toast--warning {
        background: var(--zeno-color-warning-subtle);
        color: var(--zeno-color-warning-text);
        border-color: var(--zeno-color-warning-border);
      }

      .toast--light.toast--error {
        background: var(--zeno-color-danger-subtle);
        color: var(--zeno-color-danger-text);
        border-color: var(--zeno-color-danger-border);
      }

      /* Icon */
      .toast__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      /* Content */
      .toast__content {
        flex: 1;
        min-width: 0;
      }

      /* Title */
      .toast__title {
        margin: 0 0 var(--zeno-spacing-1) 0;
        font-weight: var(--zeno-font-weight-semibold);
        line-height: var(--zeno-font-line-height-tight);
      }

      /* Message */
      .toast__message {
        margin: 0;
        font-size: var(--zeno-font-size-sm);
        opacity: 0.9;
      }

      /* Action */
      .toast__action {
        margin-left: var(--zeno-spacing-3);
      }

      /* Close button */
      .toast__close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        background: transparent;
        color: currentColor;
        cursor: pointer;
        border-radius: var(--zeno-radius-sm);
        opacity: 0.7;
        transition: opacity var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        margin-left: var(--zeno-spacing-2);
        flex-shrink: 0;
      }

      .toast__close:hover {
        opacity: 1;
      }

      .toast__close:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }

      /* Progress bar */
      .toast__progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: color-mix(in srgb, currentColor 20%, transparent);
        border-radius: 0 0 var(--toast-border-radius) var(--toast-border-radius);
        overflow: hidden;
      }

      .toast__progress-bar {
        height: 100%;
        background: currentColor;
        transition: width linear;
        transform-origin: left;
      }

      /* Animations */
      @keyframes slideInTop {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideInBottom {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOutTop {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }

      @keyframes slideOutBottom {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }

      .toast--animate-in-top {
        animation: slideInTop var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);
      }

      .toast--animate-in-bottom {
        animation: slideInBottom var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);
      }

      .toast--animate-out-top {
        animation: slideOutTop var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);
      }

      .toast--animate-out-bottom {
        animation: slideOutBottom var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .toast {
          border: 2px solid ButtonText;
        }

        .toast--light {
          border-width: 2px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .toast {
          transition: none;
        }

        .toast--animate-in-top,
        .toast--animate-in-bottom,
        .toast--animate-out-top,
        .toast--animate-out-bottom {
          animation: none;
        }

        .toast__progress-bar {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        :host {
          display: none;
        }
      }
    `,
  ];

  @property({ reflect: true }) variant: ToastVariant = 'default';
  @property({ reflect: true }) position: ToastPosition = 'bottom';
  @property({ type: Boolean, reflect: true }) light = false;
  @property() override title = '';
  @property() message?: string;
  @property() icon?: string;
  @property({ type: Boolean }) closable = true;
  @property({ type: Number }) duration = 5000;
  @property({ type: Boolean, attribute: 'show-progress' }) showProgress = false;

  @state() private isVisible = false;
  @state() private isAnimatingOut = false;
  @state() private progress = 100;

  private closeTimeout?: number;
  private progressInterval?: number;

  /**
   * Show the toast
   */
  show(): void {
    this.isVisible = true;
    this.isAnimatingOut = false;
    this.progress = 100;

    this.emitEvent('show');

    if (this.duration > 0) {
      this.startAutoClose();
    }
  }

  /**
   * Hide the toast
   */
  hide(): void {
    this.isAnimatingOut = true;
    this.stopAutoClose();

    // Wait for animation to complete
    setTimeout(() => {
      this.isVisible = false;
      this.isAnimatingOut = false;
      this.emitEvent('hide');
    }, 300);
  }

  /**
   * Start auto close timer
   */
  private startAutoClose(): void {
    if (this.duration <= 0) return;

    this.closeTimeout = window.setTimeout(() => {
      this.hide();
    }, this.duration);

    if (this.showProgress) {
      const startTime = Date.now();
      this.progressInterval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        this.progress = Math.max(0, 100 - (elapsed / this.duration) * 100);

        if (this.progress <= 0) {
          clearInterval(this.progressInterval);
        }
      }, 50);
    }
  }

  /**
   * Stop auto close timer
   */
  private stopAutoClose(): void {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = undefined;
    }

    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
  }

  /**
   * Handle mouse enter (pause auto close)
   */
  private handleMouseEnter(): void {
    this.stopAutoClose();
  }

  /**
   * Handle mouse leave (resume auto close)
   */
  private handleMouseLeave(): void {
    if (this.duration > 0 && this.isVisible && !this.isAnimatingOut) {
      this.startAutoClose();
    }
  }

  /**
   * Handle close button click
   */
  private handleClose(): void {
    this.hide();
    this.emitEvent('close');
  }

  /**
   * Get default icon for variant
   */
  private getDefaultIcon(): string {
    switch (this.variant) {
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert-triangle';
      case 'error':
        return 'x-circle';
      case 'info':
        return 'info';
      default:
        return '';
    }
  }

  /**
   * Render the component
   */
  override render() {
    if (!this.isVisible) return nothing;

    const isTop = this.position.startsWith('top');
    const classes = {
      toast: true,
      [`toast--${this.variant}`]: true,
      'toast--light': this.light,
      [`toast--animate-in-${isTop ? 'top' : 'bottom'}`]: !this.isAnimatingOut,
      [`toast--animate-out-${isTop ? 'top' : 'bottom'}`]: this.isAnimatingOut,
    };

    const iconName = this.icon || this.getDefaultIcon();

    return html`
      <div
        class=${classMap(classes)}
        part="base"
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        ${
          iconName
            ? html`
                <span class="toast__icon" part="icon">
                  <zeno-icon name=${iconName} size="20"></zeno-icon>
                </span>
              `
            : nothing
        }

        <div class="toast__content" part="content">
          ${
            this.title
              ? html`<div class="toast__title" part="title">${this.title}</div>`
              : nothing
          }
          ${
            this.message
              ? html`<div class="toast__message" part="message">
                  ${this.message}
                </div>`
              : html`<slot></slot>`
          }
        </div>

        <slot name="action" class="toast__action" part="action"></slot>

        ${
          this.closable
            ? html`
                <button
                  class="toast__close"
                  part="close"
                  type="button"
                  aria-label="Close toast"
                  @click=${this.handleClose}
                >
                  <zeno-icon name="x" size="16"></zeno-icon>
                </button>
              `
            : nothing
        }
        ${
          this.showProgress && this.duration > 0
            ? html`
                <div class="toast__progress" part="progress">
                  <div
                    class="toast__progress-bar"
                    part="progress-bar"
                    style=${`width: ${this.progress}%; transition-duration: ${this.duration}ms;`}
                  ></div>
                </div>
              `
            : nothing
        }
      </div>
    `;
  }

  /**
   * Cleanup on disconnect
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopAutoClose();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-toast': ZenoToast;
  }
}

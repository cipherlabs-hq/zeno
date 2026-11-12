import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { AlertVariant } from '../types.js';

/**
 * A message shown in the page, with a variant for information, success,
 * warning and error.
 *
 * @slot - The message.
 * @slot actions - Buttons shown with the message.
 * @fires {CustomEvent} show - The alert appeared.
 * @fires {CustomEvent} hide - The alert finished hiding.
 * @fires {CustomEvent} close - The close button was pressed.
 * @csspart actions
 * @csspart base
 * @csspart close
 * @csspart content
 * @csspart icon
 * @csspart message
 * @csspart title
 */
@customElement('zeno-alert')
export class ZenoAlert extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --alert-padding: var(--zeno-spacing-4);
        --alert-border-radius: var(--zeno-radius-md);
        --alert-border-width: 1px;
        --alert-icon-size: 20px;
        --alert-font-size: var(--zeno-font-size-md);
        --alert-transition: all var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);

        display: block;
      }

      /* Alert container */
      .alert {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: var(--zeno-spacing-3);
        padding: var(--alert-padding);
        border: var(--alert-border-width) solid;
        border-radius: var(--alert-border-radius);
        font-size: var(--alert-font-size);
        line-height: var(--zeno-font-line-height-normal);
        transition: var(--alert-transition);
      }

      /* Variant styles */
      .alert--info {
        background: var(--zeno-color-info-subtle);
        border-color: var(--zeno-color-info-border);
        color: var(--zeno-color-info-text);
      }

      .alert--success {
        background: var(--zeno-color-success-subtle);
        border-color: var(--zeno-color-success-border);
        color: var(--zeno-color-success-text);
      }

      .alert--warning {
        background: var(--zeno-color-warning-subtle);
        border-color: var(--zeno-color-warning-border);
        color: var(--zeno-color-warning-text);
      }

      .alert--error {
        background: var(--zeno-color-danger-subtle);
        border-color: var(--zeno-color-danger-border);
        color: var(--zeno-color-danger-text);
      }

      /* Filled variant */
      .alert--filled {
        border-color: transparent;
      }

      .alert--filled.alert--info {
        background: var(--zeno-color-info-solid);
        color: var(--zeno-color-info-on-solid);
      }

      .alert--filled.alert--success {
        background: var(--zeno-color-success-solid);
        color: var(--zeno-color-success-on-solid);
      }

      .alert--filled.alert--warning {
        background: var(--zeno-color-warning-solid);
        color: var(--zeno-color-warning-on-solid);
      }

      .alert--filled.alert--error {
        background: var(--zeno-color-danger-solid);
        color: var(--zeno-color-danger-on-solid);
      }

      /* Outlined variant */
      .alert--outlined {
        background: transparent;
      }

      .alert--outlined.alert--info {
        border-color: var(--zeno-color-info-solid);
        color: var(--zeno-color-info-text);
      }

      .alert--outlined.alert--success {
        border-color: var(--zeno-color-success-solid);
        color: var(--zeno-color-success-text);
      }

      .alert--outlined.alert--warning {
        border-color: var(--zeno-color-warning-solid);
        color: var(--zeno-color-warning-text);
      }

      .alert--outlined.alert--error {
        border-color: var(--zeno-color-danger-solid);
        color: var(--zeno-color-danger-text);
      }

      /* Icon */
      .alert__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: var(--alert-icon-size);
        height: var(--alert-icon-size);
      }

      /* Content */
      .alert__content {
        flex: 1;
        min-width: 0;
      }

      /* Title */
      .alert__title {
        margin: 0 0 var(--zeno-spacing-1) 0;
        font-size: var(--zeno-font-size-lg);
        font-weight: var(--zeno-font-weight-semibold);
        line-height: var(--zeno-font-line-height-tight);
      }

      /* Message */
      .alert__message {
        margin: 0;
      }

      /* Actions */
      .alert__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--zeno-spacing-2);
        margin-top: var(--zeno-spacing-3);
      }

      .alert__actions--empty {
        display: none;
      }

      /* Close button */
      .alert__close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: none;
        background: transparent;
        color: currentColor;
        cursor: pointer;
        border-radius: var(--zeno-radius-sm);
        opacity: 0.7;
        transition: var(--alert-transition);
        margin-left: auto;
        flex-shrink: 0;
      }

      .alert__close:hover {
        opacity: 1;
        background: color-mix(in srgb, currentColor 12%, transparent);
      }

      .alert--filled .alert__close:hover {
        background: color-mix(in srgb, currentColor 12%, transparent);
      }

      .alert__close:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }

      /* Compact variant */
      .alert--compact {
        padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
        font-size: var(--zeno-font-size-sm);
      }

      .alert--compact .alert__icon {
        --alert-icon-size: 16px;
      }

      .alert--compact .alert__title {
        font-size: var(--zeno-font-size-md);
      }

      .alert--compact .alert__close {
        width: 24px;
        height: 24px;
      }

      /* Animation */
      @keyframes slideIn {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(-100%);
          opacity: 0;
        }
      }

      .alert--animate-in {
        animation: slideIn var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);
      }

      .alert--animate-out {
        animation: slideOut var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .alert {
          border-width: 2px;
        }

        .alert--filled {
          border-color: ButtonText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .alert {
          transition: none;
        }

        .alert--animate-in,
        .alert--animate-out {
          animation: none;
        }
      }

      /* Print styles */
      @media print {
        .alert {
          border: 1px solid #000;
          color: #000;
        }

        .alert__close {
          display: none;
        }
      }
    `,
  ];

  @property({ reflect: true }) variant: AlertVariant = 'info';
  @property({ reflect: true }) appearance: 'default' | 'filled' | 'outlined' =
    'default';
  /**
   * The heading. Prefer it to `title`, which the browser also shows as a
   * tooltip when the pointer rests on the alert.
   */
  @property() heading = '';
  /** The level of the heading in the page outline, 1 to 6. */
  @property({ type: Number, attribute: 'heading-level' }) headingLevel = 3;
  /** @deprecated Use `heading`. Kept for existing markup. */
  @property() override title = '';
  /**
   * How assistive technology hears the alert. `auto` makes `error` and
   * `warning` assertive (`role="alert"`) and the other variants polite
   * (`role="status"`). `off` is for an alert that is on the page from the
   * start and is not news.
   */
  @property({ reflect: true }) live: 'auto' | 'polite' | 'assertive' | 'off' =
    'auto';
  /** The name of the close button. */
  @property({ attribute: 'close-label' }) closeLabel = 'Close alert';
  @property() message?: string;
  @property() icon?: string;
  @property({ type: Boolean, reflect: true }) closable = false;
  @property({ type: Boolean, reflect: true }) compact = false;
  @property({ type: Boolean, reflect: true, attribute: 'animate-in' })
  animateIn = false;
  @property({ type: Boolean, reflect: true, attribute: 'animate-out' })
  animateOut = false;

  @state() private isVisible = true;
  @state() private hasActions = false;

  private get politeness(): 'polite' | 'assertive' | 'off' {
    if (this.live !== 'auto') return this.live;
    return this.variant === 'error' || this.variant === 'warning'
      ? 'assertive'
      : 'polite';
  }

  private handleActionsChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    this.hasActions = slot
      .assignedNodes({ flatten: true })
      .some(
        node =>
          node.nodeType === Node.ELEMENT_NODE ||
          (node.textContent ?? '').trim() !== ''
      );
  }

  /**
   * Show the alert
   */
  show(): void {
    this.isVisible = true;
    this.animateIn = true;
    this.animateOut = false;
    this.emitEvent('show');
  }

  /**
   * Hide the alert
   */
  hide(): void {
    this.animateOut = true;
    this.animateIn = false;

    // Wait for animation to complete
    setTimeout(() => {
      this.isVisible = false;
      this.emitEvent('hide');
    }, 300);
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
      default:
        return 'info';
    }
  }

  /**
   * Render the component
   */
  override render() {
    if (!this.isVisible) return nothing;

    const classes = {
      alert: true,
      [`alert--${this.variant}`]: true,
      [`alert--${this.appearance}`]: true,
      'alert--compact': this.compact,
      'alert--animate-in': this.animateIn,
      'alert--animate-out': this.animateOut,
    };

    const iconName = this.icon || this.getDefaultIcon();

    return html`
      <div
        class=${classMap(classes)}
        part="base"
        role=${
          this.politeness === 'off'
            ? nothing
            : this.politeness === 'assertive'
              ? 'alert'
              : 'status'
        }
        aria-live=${this.politeness === 'off' ? nothing : this.politeness}
        aria-atomic=${this.politeness === 'off' ? nothing : 'true'}
      >
        <span class="alert__icon" part="icon" aria-hidden="true">
          <zeno-icon
            name=${iconName}
            size=${this.compact ? '16' : '20'}
          ></zeno-icon>
        </span>

        <div class="alert__content" part="content">
          ${
            this.heading || this.title
              ? html`<div
                  class="alert__title"
                  part="title"
                  role="heading"
                  aria-level=${this.headingLevel}
                >
                  ${this.heading || this.title}
                </div>`
              : nothing
          }
          ${
            this.message
              ? html`<p class="alert__message" part="message">
                  ${this.message}
                </p>`
              : html`<slot></slot>`
          }

          <slot
            name="actions"
            class=${classMap({
              alert__actions: true,
              'alert__actions--empty': !this.hasActions,
            })}
            part="actions"
            @slotchange=${this.handleActionsChange}
          ></slot>
        </div>

        ${
          this.closable
            ? html`
                <button
                  class="alert__close"
                  part="close"
                  type="button"
                  aria-label=${this.closeLabel}
                  @click=${this.handleClose}
                >
                  <zeno-icon
                    name="x"
                    size=${this.compact ? '16' : '20'}
                  ></zeno-icon>
                </button>
              `
            : nothing
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-alert': ZenoAlert;
  }
}

import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ZenoElement } from '../base/zeno-element.js';

/**
 * The label, help text and error message around a control. Use it to lay out a
 * control that does not render these itself.
 *
 * @slot - The control.
 * @slot label-suffix - Content after the label text.
 * @csspart control
 * @csspart field
 * @csspart help-text
 * @csspart label
 * @csspart message
 */
@customElement('zeno-base-field')
export class ZenoBaseField extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --field-spacing: var(--zeno-spacing-2);
        --field-label-color: var(--zeno-color-text-primary);
        --field-help-color: var(--zeno-color-text-secondary);
        --field-error-color: var(--zeno-color-danger-text);
        --field-success-color: var(--zeno-color-success-text);
        --field-warning-color: var(--zeno-color-warning-text);
        --field-label-font-size: var(--zeno-font-size-sm);
        --field-help-font-size: var(--zeno-font-size-xs);
        --field-font-weight-label: var(--zeno-font-weight-medium);

        display: block;
        width: 100%;
      }

      /* Field container */
      .field {
        display: flex;
        flex-direction: column;
        gap: var(--field-spacing);
        width: 100%;
      }

      /* Label styles */
      .field__label {
        display: flex;
        align-items: center;
        gap: var(--zeno-spacing-1);
        color: var(--field-label-color);
        font-family: var(--zeno-font-family-sans);
        font-size: var(--field-label-font-size);
        font-weight: var(--field-font-weight-label);
        line-height: 1.4;
        margin: 0;
      }

      .field__label--required::after {
        content: '*';
        color: var(--field-error-color);
        margin-left: 2px;
      }

      .field__label--disabled {
        opacity: 0.5;
      }

      /* Control wrapper */
      .field__control {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      /* Help text */
      .field__help {
        color: var(--field-help-color);
        font-family: var(--zeno-font-family-sans);
        font-size: var(--field-help-font-size);
        line-height: 1.4;
        margin: 0;
      }

      /* Message styles */
      .field__message {
        display: flex;
        align-items: flex-start;
        gap: var(--zeno-spacing-1);
        font-family: var(--zeno-font-family-sans);
        font-size: var(--field-help-font-size);
        line-height: 1.4;
        margin: 0;
      }

      .field__message--error {
        color: var(--field-error-color);
      }

      .field__message--success {
        color: var(--field-success-color);
      }

      .field__message--warning {
        color: var(--field-warning-color);
      }

      .field__message-icon {
        flex-shrink: 0;
        margin-top: 2px;
      }

      /* Layout variants */
      .field--horizontal {
        flex-direction: row;
        align-items: flex-start;
        gap: var(--zeno-spacing-4);
      }

      .field--horizontal .field__label {
        flex-shrink: 0;
        width: 150px;
        margin-top: var(--zeno-spacing-1);
      }

      .field--horizontal .field__control {
        flex: 1;
      }

      /* Size variants */
      .field--sm {
        --field-spacing: var(--zeno-spacing-1);
        --field-label-font-size: var(--zeno-font-size-xs);
        --field-help-font-size: var(--zeno-font-size-xs);
      }

      .field--lg {
        --field-spacing: var(--zeno-spacing-3);
        --field-label-font-size: var(--zeno-font-size-md);
        --field-help-font-size: var(--zeno-font-size-sm);
      }

      /* State styles */
      .field--invalid .field__label {
        color: var(--field-error-color);
      }

      .field--success .field__label {
        color: var(--field-success-color);
      }

      .field--warning .field__label {
        color: var(--field-warning-color);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .field__label {
          font-weight: var(--zeno-font-weight-bold);
        }

        .field__message {
          font-weight: var(--zeno-font-weight-medium);
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        * {
          transition: none !important;
        }
      }

      /* Print styles */
      @media print {
        .field__message--error,
        .field__message--warning {
          color: #000;
          text-decoration: underline;
        }
      }
    `,
  ];

  @property() label?: string;
  @property({ attribute: 'label-for' }) labelFor?: string;
  @property({ attribute: 'help-text' }) helpText?: string;
  @property({ attribute: 'error-message' }) errorMessage?: string;
  @property({ attribute: 'success-message' }) successMessage?: string;
  @property({ attribute: 'warning-message' }) warningMessage?: string;
  @property({ reflect: true }) layout: 'vertical' | 'horizontal' = 'vertical';
  @property({ reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) invalid = false;
  @property({ type: Boolean, reflect: true }) success = false;
  @property({ type: Boolean, reflect: true }) warning = false;
  @property({ type: Boolean, attribute: 'hide-label' }) hideLabel = false;
  @property({ type: Boolean, attribute: 'show-message-icon' }) showMessageIcon =
    true;

  /**
   * Handle slot changes
   */
  private handleSlotChange(): void {
    this.requestUpdate();
  }

  /**
   * Get the current state message
   */
  private getCurrentMessage(): {
    message: string;
    type: 'error' | 'success' | 'warning';
  } | null {
    if (this.invalid && this.errorMessage) {
      return { message: this.errorMessage, type: 'error' };
    }
    if (this.success && this.successMessage) {
      return { message: this.successMessage, type: 'success' };
    }
    if (this.warning && this.warningMessage) {
      return { message: this.warningMessage, type: 'warning' };
    }
    return null;
  }

  /**
   * Get the message icon name
   */
  private getMessageIcon(type: 'error' | 'success' | 'warning'): string {
    switch (type) {
      case 'error':
        return 'alert-circle';
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert-triangle';
      default:
        return 'info';
    }
  }

  /**
   * Generate unique IDs for accessibility
   */
  private generateId(suffix: string): string {
    return `${this.id || 'field'}-${suffix}`;
  }

  /**
   * Get aria-describedby value
   */
  private getAriaDescribedby(): string | undefined {
    const ids: string[] = [];

    if (this.helpText) {
      ids.push(this.generateId('help'));
    }

    const currentMessage = this.getCurrentMessage();
    if (currentMessage) {
      ids.push(this.generateId('message'));
    }

    return ids.length > 0 ? ids.join(' ') : undefined;
  }

  /**
   * Render the component
   */
  override render() {
    const currentMessage = this.getCurrentMessage();
    const ariaDescribedby = this.getAriaDescribedby();

    const fieldClasses = {
      field: true,
      [`field--${this.layout}`]: true,
      [`field--${this.size}`]: true,
      'field--invalid': this.invalid,
      'field--success': this.success && !this.invalid,
      'field--warning': this.warning && !this.invalid && !this.success,
    };

    const labelClasses = {
      field__label: true,
      'field__label--required': this.required,
      'field__label--disabled': this.disabled,
    };

    return html`
      <div class=${classMap(fieldClasses)} part="field">
        ${
          this.label && !this.hideLabel
            ? html`
                <label
                  part="label"
                  class=${classMap(labelClasses)}
                  for=${ifDefined(this.labelFor)}
                >
                  ${this.label}
                  <slot name="label-suffix"></slot>
                </label>
              `
            : nothing
        }

        <div class="field__control" part="control">
          <slot
            @slotchange=${this.handleSlotChange}
            .assignedElements=${(elements: Element[]) => {
              // Forward accessibility attributes to slotted form controls
              elements.forEach(element => {
                if (element instanceof HTMLElement) {
                  if (ariaDescribedby) {
                    element.setAttribute('aria-describedby', ariaDescribedby);
                  }
                  if (this.required) {
                    element.setAttribute('required', '');
                  }
                  if (this.disabled) {
                    element.setAttribute('disabled', '');
                  }
                  if (this.invalid) {
                    element.setAttribute('aria-invalid', 'true');
                  }
                }
              });
            }}
          ></slot>

          ${
            this.helpText
              ? html`
                  <p
                    id=${this.generateId('help')}
                    class="field__help"
                    part="help-text"
                  >
                    ${this.helpText}
                  </p>
                `
              : nothing
          }
          ${
            currentMessage
              ? html`
                  <p
                    id=${this.generateId('message')}
                    class="field__message field__message--${currentMessage.type}"
                    part="message"
                    role=${currentMessage.type === 'error' ? 'alert' : 'status'}
                    aria-live=${
                      currentMessage.type === 'error' ? 'assertive' : 'polite'
                    }
                  >
                    ${
                      this.showMessageIcon
                        ? html`
                            <zeno-icon
                              class="field__message-icon"
                              name=${this.getMessageIcon(currentMessage.type)}
                              size="14"
                              aria-hidden="true"
                            ></zeno-icon>
                          `
                        : nothing
                    }
                    ${currentMessage.message}
                  </p>
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
    'zeno-base-field': ZenoBaseField;
  }
}

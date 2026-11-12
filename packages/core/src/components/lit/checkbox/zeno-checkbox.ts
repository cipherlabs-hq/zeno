import { html, css, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ZenoElement } from '../base/zeno-element.js';
import { FormFieldMixin, formFieldStyles } from '../mixins/form-field.js';
import type { CheckboxSize } from '../types.js';

/**
 * A checkbox. It takes part in forms as a native checkbox does and has an
 * indeterminate state.
 *
 * @fires {CustomEvent<{ checked: boolean; value: FormValue; indeterminate: boolean }>} input - The user checked or unchecked the box.
 * @fires {CustomEvent<{ checked: boolean; value: FormValue; indeterminate: boolean }>} change - The user checked or unchecked the box.
 * @csspart base
 * @csspart box
 * @csspart error
 * @csspart icon
 * @csspart label
 * @csspart loading
 * @csspart required
 */
@customElement('zeno-checkbox')
export class ZenoCheckbox extends FormFieldMixin(ZenoElement) {
  static override styles = [
    ZenoElement.baseStyles,
    formFieldStyles,
    css`
      :host {
        --checkbox-size-sm: 16px;
        --checkbox-size-md: 20px;
        --checkbox-size-lg: 24px;
        --checkbox-border-width: 2px;
        --checkbox-border-radius: var(--zeno-radius-sm);
        --checkbox-background: var(--zeno-color-background-surface);
        --checkbox-border-color: var(--zeno-color-border-control);
        --checkbox-checked-background: var(--zeno-color-accent-solid);
        --checkbox-checked-border-color: var(--zeno-color-accent-solid);
        --checkbox-focus-ring: 0 0 0 3px var(--zeno-color-accent-subtle-hover);
        --checkbox-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: inline-block;
      }

      /* Label container */
      .checkbox {
        display: inline-flex;
        align-items: center;
        gap: var(--zeno-spacing-2);
        position: relative;
        cursor: pointer;
        user-select: none;
        line-height: 1;
      }

      .checkbox--disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      /* Hidden native input */
      .checkbox__input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      /* Custom checkbox box */
      .checkbox__box {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: var(--checkbox-size);
        height: var(--checkbox-size);
        border: var(--checkbox-border-width) solid var(--checkbox-border-color);
        border-radius: var(--checkbox-border-radius);
        background: var(--checkbox-background);
        transition: var(--checkbox-transition);
      }

      /* Size variants */
      .checkbox--sm {
        --checkbox-size: var(--checkbox-size-sm);
      }

      .checkbox--md {
        --checkbox-size: var(--checkbox-size-md);
      }

      .checkbox--lg {
        --checkbox-size: var(--checkbox-size-lg);
      }

      /* Hover state */
      .checkbox:not(.checkbox--disabled):hover .checkbox__box {
        border-color: var(--zeno-color-accent-solid);
        background: var(--zeno-color-accent-subtle);
      }

      /* Focus state */
      .checkbox__input:focus-visible ~ .checkbox__box {
        outline: none;
        box-shadow: var(--checkbox-focus-ring);
      }

      /* Checked state */
      .checkbox__input:checked ~ .checkbox__box,
      .checkbox__input:indeterminate ~ .checkbox__box {
        background: var(--checkbox-checked-background);
        border-color: var(--checkbox-checked-border-color);
      }

      /* Check icon */
      .checkbox__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: var(--zeno-color-accent-on-solid);
        opacity: 0;
        transform: scale(0.8);
        transition: var(--checkbox-transition);
      }

      .checkbox__input:checked ~ .checkbox__box .checkbox__icon,
      .checkbox__input:indeterminate ~ .checkbox__box .checkbox__icon {
        opacity: 1;
        transform: scale(1);
      }

      /* Label text */
      .checkbox__label {
        color: var(--zeno-color-text-primary);
        font-size: var(--zeno-font-size-md);
        line-height: var(--zeno-font-line-height-normal);
      }

      .checkbox--sm .checkbox__label {
        font-size: var(--zeno-font-size-sm);
      }

      .checkbox--lg .checkbox__label {
        font-size: var(--zeno-font-size-lg);
      }

      /* Invalid state */
      .checkbox--invalid .checkbox__box {
        border-color: var(--zeno-color-danger-solid);
      }

      .checkbox--invalid .checkbox__input:checked ~ .checkbox__box,
      .checkbox--invalid .checkbox__input:indeterminate ~ .checkbox__box {
        background: var(--zeno-color-danger-solid);
        border-color: var(--zeno-color-danger-solid);
      }

      .checkbox--invalid .checkbox__input:focus-visible ~ .checkbox__box {
        box-shadow: 0 0 0 3px var(--zeno-color-danger-subtle-hover);
      }

      /* Required indicator */
      .checkbox__required {
        color: var(--zeno-color-danger-text);
        margin-left: var(--zeno-spacing-1);
      }

      /* Loading state */
      .checkbox--loading .checkbox__box {
        pointer-events: none;
      }

      .checkbox--loading .checkbox__icon {
        display: none;
      }

      .checkbox__loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .checkbox__box {
          border-width: 2px;
        }

        .checkbox__input:focus-visible ~ .checkbox__box {
          outline: 2px solid ButtonText;
          outline-offset: 2px;
          box-shadow: none;
        }

        .checkbox__input:checked ~ .checkbox__box,
        .checkbox__input:indeterminate ~ .checkbox__box {
          background: ButtonText;
          border-color: ButtonText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .checkbox__box,
        .checkbox__icon {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .checkbox__box {
          border-color: #000;
        }

        .checkbox__input:checked ~ .checkbox__box,
        .checkbox__input:indeterminate ~ .checkbox__box {
          background: #000;
          border-color: #000;
        }
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  @property({ reflect: true }) size: CheckboxSize = 'md';
  @property({ type: Boolean, reflect: true }) loading = false;

  @state() private hasFocus = false;

  /** Whether it is checked when its form is reset. */
  defaultChecked = false;

  @query('.checkbox__input') private input!: HTMLInputElement;

  constructor() {
    super();
    // Like a native checkbox: "on" is what a checked box submits by default.
    this.value = 'on';
  }

  override focus(options?: FocusOptions): void {
    this.input?.focus(options);
  }

  override blur(): void {
    this.input?.blur();
  }

  protected override captureDefaults(): void {
    this.defaultChecked = this.checked;
  }

  protected override resetToDefaults(): void {
    this.checked = this.defaultChecked;
    this.indeterminate = false;
  }

  // Only a checked box takes part in the submission.
  protected override formSubmitValue(): string | null {
    return this.checked ? String(this.value || 'on') : null;
  }

  protected override formState(): string {
    return this.checked ? 'checked' : 'unchecked';
  }

  protected override restoreState(restored: string): void {
    this.checked = restored === 'checked';
  }

  protected override isEmpty(): boolean {
    return !this.checked;
  }

  protected override nativeControl(): HTMLInputElement | undefined {
    return this.input ?? undefined;
  }

  protected override activateFromLabel(): void {
    this.input?.click();
  }

  // The native input event crosses the shadow boundary. It is stopped here and
  // sent again with a detail when the change event follows.
  private handleInput(event: Event): void {
    event.stopPropagation();
  }

  private handleChange(): void {
    this.checked = this.input.checked;
    this.indeterminate = false;
    this.markDirty();
    const detail = {
      checked: this.checked,
      value: this.value,
      indeterminate: false,
    };
    this.emitValueEvent('input', detail);
    this.emitValueEvent('change', detail);
  }

  private handleFocus(): void {
    this.hasFocus = true;
  }

  private handleBlur(): void {
    this.hasFocus = false;
    this.markTouched();
  }

  /**
   * Render check icon
   */
  private renderIcon() {
    if (this.indeterminate) {
      return html`
        <svg viewBox="0 0 16 16" fill="currentColor">
          <rect x="3" y="7" width="10" height="2" />
        </svg>
      `;
    }

    return html`
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="3,8 6,11 13,4" />
      </svg>
    `;
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      checkbox: true,
      [`checkbox--${this.size}`]: true,
      'checkbox--checked': this.checked,
      'checkbox--indeterminate': this.indeterminate,
      'checkbox--disabled': this.isDisabled,
      'checkbox--invalid': this.invalid,
      'checkbox--loading': this.loading,
      'checkbox--focused': this.hasFocus,
    };

    return html`
      <label part="base" class=${classMap(classes)}>
        <input
          class="checkbox__input"
          type="checkbox"
          name=${ifDefined(this.name)}
          .checked=${this.checked}
          .indeterminate=${this.indeterminate}
          ?disabled=${this.isDisabled || this.loading}
          ?required=${this.required}
          aria-label=${ifDefined(this.accessibleLabel)}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-invalid=${this.invalid ? 'true' : 'false'}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @focus=${this.handleFocus}
          @blur=${this.handleBlur}
        />

        <span class="checkbox__box" part="box">
          ${
            this.loading
              ? html`
                  <span class="checkbox__loading" part="loading">
                    <zeno-spinner size="xs"></zeno-spinner>
                  </span>
                `
              : html`
                  <span class="checkbox__icon" part="icon">
                    ${this.renderIcon()}
                  </span>
                `
          }
        </span>

        ${
          this.label
            ? html`
                <span class="checkbox__label" part="label">
                  ${this.label}
                  ${
                    this.required && !this.hideRequiredIndicator
                      ? html`<span
                          class="checkbox__required"
                          part="required"
                          aria-hidden="true"
                          >*</span
                        >`
                      : nothing
                  }
                </span>
              `
            : nothing
        }
      </label>
      ${this.renderFieldError()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-checkbox': ZenoCheckbox;
  }
}

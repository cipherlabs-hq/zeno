import { html, css, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { ZenoElement } from '../base/zeno-element.js';
import { FormFieldMixin, formFieldStyles } from '../mixins/form-field.js';
import type { InputVariant, InputSize, InputType } from '../types.js';

/**
 * A single-line text field. It takes part in forms as a native input does.
 *
 * @slot end - An icon or text after the value.
 * @slot start - An icon or text before the value.
 * @fires {CustomEvent<{ value: FormValue }>} input - The value changed while typing.
 * @fires {CustomEvent<{ value: FormValue }>} change - The value was committed.
 * @fires {CustomEvent} clear - The clear button was pressed.
 * @fires {CustomEvent<{ value: FormValue }>} enter - Enter was pressed. Cancel it to stop the form from submitting.
 * @fires {CustomEvent<{ visible: boolean }>} password-toggle - The password was shown or hidden.
 * @csspart clear-button
 * @csspart end-icon
 * @csspart error
 * @csspart input
 * @csspart label
 * @csspart loading
 * @csspart password-toggle
 * @csspart start-icon
 * @csspart wrapper
 */
@customElement('zeno-input')
export class ZenoInput extends FormFieldMixin(ZenoElement) {
  static override styles = [
    ZenoElement.baseStyles,
    formFieldStyles,
    css`
      :host {
        --input-height-sm: 32px;
        --input-height-md: 40px;
        --input-height-lg: 48px;
        --input-padding-x: var(--zeno-spacing-3);
        --input-border-width: 1px;
        --input-border-radius: var(--zeno-radius-md);
        --input-font-size: var(--zeno-font-size-md);
        --input-background: var(--zeno-color-background-surface);
        --input-border-color: var(--zeno-color-border-control);
        --input-text-color: var(--zeno-color-text-primary);
        --input-placeholder-color: var(--zeno-color-text-tertiary);
        --input-focus-ring: 0 0 0 3px var(--zeno-color-accent-subtle-hover);

        display: block;
      }

      /* Input wrapper */
      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
      }

      /* Base input styles */
      .input {
        flex: 1;
        width: 100%;
        padding: 0 var(--input-padding-x);
        border: var(--input-border-width) solid var(--input-border-color);
        border-radius: var(--input-border-radius);
        background: var(--input-background);
        color: var(--input-text-color);
        font-family: var(--zeno-font-family-sans);
        font-size: var(--input-font-size);
        line-height: 1.5;
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        -webkit-appearance: none;
        appearance: none;
      }

      .input::placeholder {
        color: var(--input-placeholder-color);
        opacity: 1;
      }

      /* Size variants */
      .input--sm {
        height: var(--input-height-sm);
        font-size: var(--zeno-font-size-sm);
      }

      .input--md {
        height: var(--input-height-md);
      }

      .input--lg {
        height: var(--input-height-lg);
        font-size: var(--zeno-font-size-lg);
      }

      /* Variant styles */
      .input--outlined {
        background: transparent;
      }

      .input--filled {
        background: var(--zeno-color-background-subtle);
        border-color: transparent;
      }

      .input--ghost {
        background: transparent;
        border-color: transparent;
        padding-left: 0;
        padding-right: 0;
      }

      /* With icon states */
      .input--with-start-icon {
        padding-left: calc(var(--input-padding-x) * 2.5);
      }

      .input--with-end-icon {
        padding-right: calc(var(--input-padding-x) * 2.5);
      }

      /* Icon containers */
      .input__icon {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--zeno-color-text-secondary);
        pointer-events: none;
        z-index: 1;
      }

      .input__icon[hidden] {
        display: none;
      }

      .input__icon--start {
        left: var(--input-padding-x);
      }

      .input__icon--end {
        right: var(--input-padding-x);
      }

      .input__icon--clickable {
        pointer-events: auto;
        cursor: pointer;
        transition: color var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      .input__icon--clickable:hover {
        color: var(--zeno-color-text-primary);
      }

      /* Clear button */
      .input__clear {
        position: absolute;
        right: var(--input-padding-x);
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        background: none;
        color: var(--zeno-color-text-secondary);
        cursor: pointer;
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        border-radius: var(--zeno-radius-sm);
      }

      .input__clear:hover {
        color: var(--zeno-color-text-primary);
        background: var(--zeno-color-background-hover);
      }

      .input--with-clear {
        padding-right: calc(var(--input-padding-x) * 2.5);
      }

      /* Focus states */
      .input:focus {
        outline: none;
        border-color: var(--zeno-color-accent-solid);
        box-shadow: var(--input-focus-ring);
      }

      .input--filled:focus {
        border-color: var(--zeno-color-accent-solid);
        background: var(--zeno-color-background-subtle);
      }

      .input--ghost:focus {
        border-color: var(--zeno-color-border-control);
        padding-left: var(--input-padding-x);
        padding-right: var(--input-padding-x);
      }

      /* Hover states */
      .input:hover:not(:focus):not(:disabled) {
        border-color: var(--zeno-color-border-control-hover);
      }

      .input--filled:hover:not(:focus):not(:disabled) {
        background: var(--zeno-color-background-muted);
      }

      /* Disabled state */
      .input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--zeno-color-background-disabled);
      }

      /* Invalid state */
      .input--invalid {
        border-color: var(--zeno-color-danger-solid);
      }

      .input--invalid:focus {
        box-shadow: 0 0 0 3px var(--zeno-color-danger-subtle-hover);
      }

      /* Success state */
      .input--success {
        border-color: var(--zeno-color-success-solid);
      }

      .input--success:focus {
        box-shadow: 0 0 0 3px var(--zeno-color-success-subtle-hover);
      }

      /* Loading state */
      .input--loading {
        color: transparent;
      }

      .input__loading {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      /* Number input arrows */
      .input[type='number']::-webkit-inner-spin-button,
      .input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      .input[type='number'] {
        -moz-appearance: textfield;
      }

      /* Search input clear button */
      .input[type='search']::-webkit-search-decoration,
      .input[type='search']::-webkit-search-cancel-button,
      .input[type='search']::-webkit-search-results-button,
      .input[type='search']::-webkit-search-results-decoration {
        -webkit-appearance: none;
      }

      /* Password toggle */
      .input__password-toggle {
        position: absolute;
        right: var(--input-padding-x);
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        border-radius: var(--zeno-radius-sm);
        background: none;
        color: var(--zeno-color-text-secondary);
        cursor: pointer;
        transition: color var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      .input__password-toggle:hover {
        color: var(--zeno-color-text-primary);
      }

      .field-help {
        margin-top: var(--zeno-spacing-1-5);
        color: var(--zeno-color-text-secondary);
        font-size: var(--zeno-font-size-sm);
        line-height: var(--zeno-font-line-height-snug);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .input {
          border-width: 2px;
        }

        .input:focus {
          outline: 2px solid ButtonText;
          outline-offset: 2px;
          box-shadow: none;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .input,
        .input__icon--clickable,
        .input__clear,
        .input__password-toggle {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .input {
          border: 1px solid #000;
        }
      }
    `,
  ];

  @property({ reflect: true }) type: InputType = 'text';
  @property({ reflect: true }) variant: InputVariant = 'outlined';
  @property({ reflect: true }) size: InputSize = 'md';
  @property() placeholder?: string;
  @property() pattern?: string;
  @property({ type: Number }) minlength?: number;
  @property({ type: Number }) maxlength?: number;
  @property({ type: Number }) min?: number;
  @property({ type: Number }) max?: number;
  @property({ type: Number }) step?: number;
  @property() autocomplete?: string;
  @property({ type: Boolean, reflect: true }) override autofocus = false;
  @property({ type: Boolean, reflect: true }) clearable = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Boolean, reflect: true }) success = false;
  @property({ type: Boolean, reflect: true, attribute: 'show-password-toggle' })
  showPasswordToggle = false;
  /** Text under the field that helps to fill it in. */
  @property({ attribute: 'help-text' }) helpText?: string;

  @state() private showPassword = false;
  @state() private hasStartIcon = false;
  @state() private hasEndIcon = false;

  @query('.input') private input!: HTMLInputElement;

  /**
   * Focus the input element
   */
  override focus(options?: FocusOptions): void {
    this.input?.focus(options);
  }

  /**
   * Blur the input element
   */
  override blur(): void {
    this.input?.blur();
  }

  /**
   * Select all text in the input
   */
  select(): void {
    this.input?.select();
  }

  /**
   * Set selection range
   */
  setSelectionRange(
    start: number,
    end: number,
    direction?: 'forward' | 'backward' | 'none'
  ): void {
    this.input?.setSelectionRange(start, end, direction);
  }

  /**
   * Handle slot changes
   */
  private handleSlotChange(slot: 'start' | 'end'): void {
    const slotElement = this.shadowRoot?.querySelector(
      `slot[name="${slot}"]`
    ) as HTMLSlotElement;
    const hasContent = slotElement
      ? slotElement.assignedNodes({ flatten: true }).length > 0
      : false;

    if (slot === 'start') {
      this.hasStartIcon = hasContent;
    } else {
      this.hasEndIcon = hasContent;
    }
  }

  protected override nativeControl(): HTMLInputElement | undefined {
    return this.input ?? undefined;
  }

  // The native input event crosses the shadow boundary. It is stopped here so
  // that a listener on the host gets one event, the one with a detail.
  private handleInput(event: Event): void {
    event.stopPropagation();
    this.value = this.input.value;
    this.markDirty();
    this.emitValueEvent('input', { value: this.value });
  }

  private handleChange(): void {
    this.value = this.input.value;
    this.emitValueEvent('change', { value: this.value });
  }

  private handleClear(): void {
    this.value = '';
    this.input.value = '';
    this.markDirty();
    this.emitEvent('clear');
    this.emitValueEvent('input', { value: '' });
    this.emitValueEvent('change', { value: '' });
    this.focus();
  }

  private togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.emitEvent('password-toggle', { visible: this.showPassword });
  }

  private handleBlur(): void {
    this.markTouched();
  }

  // Enter in a native text input submits its form. A custom element has to
  // ask for that itself.
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.isComposing) return;
    const proceed = this.emitEvent(
      'enter',
      { value: this.value },
      { cancelable: true }
    );
    if (proceed && !event.defaultPrevented) {
      this.form?.requestSubmit();
    }
  }

  /** The help text and the error message, when they show. */
  private get descriptionIds(): string | undefined {
    const ids = [this.helpText ? 'field-help' : '', this.describedBy ?? '']
      .filter(Boolean)
      .join(' ');
    return ids || undefined;
  }

  /**
   * Get actual input type
   */
  private getInputType(): string {
    if (this.type === 'password' && this.showPassword) {
      return 'text';
    }
    return this.type;
  }

  /**
   * Render the component
   */
  override render() {
    const showClear =
      this.clearable &&
      Boolean(this.value) &&
      !this.isDisabled &&
      !this.loading &&
      !this.readonly;
    const showPasswordToggle =
      this.type === 'password' && this.showPasswordToggle && !this.isDisabled;

    const classes = {
      input: true,
      [`input--${this.variant}`]: true,
      [`input--${this.size}`]: true,
      'input--invalid': this.invalid,
      'input--success': this.success && !this.invalid,
      'input--loading': this.loading,
      'input--with-start-icon': this.hasStartIcon,
      'input--with-end-icon':
        this.hasEndIcon || showClear || showPasswordToggle,
      'input--with-clear': showClear,
    };

    return html`
      ${this.renderFieldLabel('control')}
      <div class="input-wrapper" part="wrapper">
        <span
          class="input__icon input__icon--start"
          part="start-icon"
          ?hidden=${!this.hasStartIcon}
        >
          <slot
            name="start"
            @slotchange=${() => this.handleSlotChange('start')}
          ></slot>
        </span>

        <input
          id="control"
          part="input"
          class=${classMap(classes)}
          type=${this.getInputType()}
          name=${ifDefined(this.name)}
          .value=${live(this.value)}
          placeholder=${ifDefined(this.placeholder)}
          pattern=${ifDefined(this.pattern)}
          minlength=${ifDefined(this.minlength)}
          maxlength=${ifDefined(this.maxlength)}
          min=${ifDefined(this.min)}
          max=${ifDefined(this.max)}
          step=${ifDefined(this.step)}
          autocomplete=${ifDefined(this.autocomplete)}
          ?autofocus=${this.autofocus}
          ?disabled=${this.isDisabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          aria-label=${ifDefined(this.accessibleLabel)}
          aria-describedby=${ifDefined(this.descriptionIds)}
          aria-invalid=${this.invalid ? 'true' : 'false'}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @blur=${this.handleBlur}
          @keydown=${this.handleKeyDown}
        />

        ${
          this.loading
            ? html`
                <span class="input__loading" part="loading">
                  <zeno-spinner size="sm"></zeno-spinner>
                </span>
              `
            : nothing
        }
        ${
          showClear
            ? html`
                <button
                  type="button"
                  class="input__clear"
                  part="clear-button"
                  aria-label="Clear input"
                  @click=${this.handleClear}
                >
                  <zeno-icon name="x" size="16"></zeno-icon>
                </button>
              `
            : nothing
        }
        ${
          showPasswordToggle
            ? html`
                <button
                  type="button"
                  class="input__password-toggle"
                  part="password-toggle"
                  aria-controls="control"
                  aria-label=${
                    this.showPassword ? 'Hide password' : 'Show password'
                  }
                  @click=${this.togglePasswordVisibility}
                >
                  <zeno-icon
                    name=${this.showPassword ? 'eye-off' : 'eye'}
                    size="16"
                  ></zeno-icon>
                </button>
              `
            : nothing
        }
        <span
          class="input__icon input__icon--end"
          part="end-icon"
          ?hidden=${!this.hasEndIcon || showClear || showPasswordToggle}
        >
          <slot
            name="end"
            @slotchange=${() => this.handleSlotChange('end')}
          ></slot>
        </span>
      </div>
      ${
        this.helpText
          ? html`<div class="field-help" id="field-help" part="help-text">
              ${this.helpText}
            </div>`
          : nothing
      }
      ${this.renderFieldError()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-input': ZenoInput;
  }
}

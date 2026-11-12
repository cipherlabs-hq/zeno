import { html, css, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ZenoElement } from '../base/zeno-element.js';
import { FormFieldMixin, formFieldStyles } from '../mixins/form-field.js';
import type { RadioSize } from '../types.js';

/**
 * One choice of a set. Put several in a `zeno-radio-group`, or give them the
 * same `name`.
 *
 * @fires {CustomEvent<{ checked: boolean; value: FormValue }>} input - The user selected the radio.
 * @fires {CustomEvent<{ checked: boolean; value: FormValue }>} change - The user selected the radio.
 * @csspart base
 * @csspart button
 * @csspart dot
 * @csspart error
 * @csspart label
 * @csspart loading
 * @csspart required
 */
@customElement('zeno-radio')
export class ZenoRadio extends FormFieldMixin(ZenoElement) {
  static override styles = [
    ZenoElement.baseStyles,
    formFieldStyles,
    css`
      :host {
        --radio-size-sm: 16px;
        --radio-size-md: 20px;
        --radio-size-lg: 24px;
        --radio-dot-scale: 0.5;
        --radio-border-width: 2px;
        --radio-background: var(--zeno-color-background-surface);
        --radio-border-color: var(--zeno-color-border-control);
        --radio-checked-border-color: var(--zeno-color-accent-solid);
        --radio-dot-color: var(--zeno-color-accent-solid);
        --radio-focus-ring: 0 0 0 3px var(--zeno-color-accent-subtle-hover);
        --radio-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: inline-block;
      }

      /* Label container */
      .radio {
        display: inline-flex;
        align-items: center;
        gap: var(--zeno-spacing-2);
        position: relative;
        cursor: pointer;
        user-select: none;
        line-height: 1;
      }

      .radio--disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      /* Hidden native input */
      .radio__input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      /* Custom radio button */
      .radio__button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: var(--radio-size);
        height: var(--radio-size);
        border: var(--radio-border-width) solid var(--radio-border-color);
        border-radius: 50%;
        background: var(--radio-background);
        transition: var(--radio-transition);
      }

      /* Size variants */
      .radio--sm {
        --radio-size: var(--radio-size-sm);
      }

      .radio--md {
        --radio-size: var(--radio-size-md);
      }

      .radio--lg {
        --radio-size: var(--radio-size-lg);
      }

      /* Radio dot */
      .radio__dot {
        width: calc(var(--radio-size) * var(--radio-dot-scale));
        height: calc(var(--radio-size) * var(--radio-dot-scale));
        border-radius: 50%;
        background: var(--radio-dot-color);
        opacity: 0;
        transform: scale(0);
        transition: var(--radio-transition);
      }

      /* Hover state */
      .radio:not(.radio--disabled):hover .radio__button {
        border-color: var(--zeno-color-accent-solid);
        background: var(--zeno-color-accent-subtle);
      }

      /* Focus state */
      .radio__input:focus-visible ~ .radio__button {
        outline: none;
        box-shadow: var(--radio-focus-ring);
      }

      /* Checked state */
      .radio__input:checked ~ .radio__button {
        border-color: var(--radio-checked-border-color);
      }

      .radio__input:checked ~ .radio__button .radio__dot {
        opacity: 1;
        transform: scale(1);
      }

      /* Label text */
      .radio__label {
        color: var(--zeno-color-text-primary);
        font-size: var(--zeno-font-size-md);
        line-height: var(--zeno-font-line-height-normal);
      }

      .radio--sm .radio__label {
        font-size: var(--zeno-font-size-sm);
      }

      .radio--lg .radio__label {
        font-size: var(--zeno-font-size-lg);
      }

      /* Invalid state */
      .radio--invalid .radio__button {
        border-color: var(--zeno-color-danger-solid);
      }

      .radio--invalid .radio__input:checked ~ .radio__button {
        border-color: var(--zeno-color-danger-solid);
      }

      .radio--invalid .radio__input:checked ~ .radio__button .radio__dot {
        background: var(--zeno-color-danger-solid);
      }

      .radio--invalid .radio__input:focus-visible ~ .radio__button {
        box-shadow: 0 0 0 3px var(--zeno-color-danger-subtle-hover);
      }

      /* Required indicator */
      .radio__required {
        color: var(--zeno-color-danger-text);
        margin-left: var(--zeno-spacing-1);
      }

      /* Loading state */
      .radio--loading .radio__button {
        pointer-events: none;
      }

      .radio--loading .radio__dot {
        display: none;
      }

      .radio__loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .radio__button {
          border-width: 2px;
        }

        .radio__input:focus-visible ~ .radio__button {
          outline: 2px solid ButtonText;
          outline-offset: 2px;
          box-shadow: none;
        }

        .radio__input:checked ~ .radio__button {
          border-color: ButtonText;
        }

        .radio__dot {
          background: ButtonText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .radio__button,
        .radio__dot {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .radio__button {
          border-color: #000;
        }

        .radio__input:checked ~ .radio__button {
          border-color: #000;
        }

        .radio__dot {
          background: #000;
        }
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ reflect: true }) size: RadioSize = 'md';
  @property({ type: Boolean, reflect: true }) loading = false;

  /** Set by zeno-radio-group. @internal */
  @property({ type: Boolean, attribute: false }) groupDisabled = false;
  /** Set by zeno-radio-group. @internal */
  @property({ type: Boolean, attribute: false }) groupInvalid = false;
  /** Set by zeno-radio-group: whether Tab stops on this radio. @internal */
  @property({ type: Boolean, attribute: false }) tabbable = true;

  @state() private hasFocus = false;

  /** Whether it is checked when its form is reset. */
  defaultChecked = false;

  @query('.radio__input') private input!: HTMLInputElement;

  constructor() {
    super();
    this.value = 'on';
  }

  override focus(options?: FocusOptions): void {
    this.input?.focus(options);
  }

  override blur(): void {
    this.input?.blur();
  }

  // Inside a zeno-radio-group the group is the form control: it submits the
  // value, validates and resets. A radio on its own does those itself.
  private get inGroup(): boolean {
    return this.closest('zeno-radio-group') !== null;
  }

  /** Radios outside a group that share this one's name and form. */
  private peers(): ZenoRadio[] {
    if (!this.name) return [this];
    const scope = this.form ?? (this.getRootNode() as ParentNode);
    return [...scope.querySelectorAll<ZenoRadio>('zeno-radio')].filter(
      radio =>
        radio.name === this.name &&
        radio.form === this.form &&
        !radio.closest('zeno-radio-group')
    );
  }

  protected override captureDefaults(): void {
    this.defaultChecked = this.checked;
  }

  protected override resetToDefaults(): void {
    if (!this.inGroup) this.checked = this.defaultChecked;
  }

  protected override formSubmitValue(): string | null {
    return !this.inGroup && this.checked ? String(this.value || 'on') : null;
  }

  protected override formState(): string | null {
    if (this.inGroup) return null;
    return this.checked ? 'checked' : 'unchecked';
  }

  protected override restoreState(restored: string): void {
    if (!this.inGroup) this.checked = restored === 'checked';
  }

  protected override isEmpty(): boolean {
    return !this.inGroup && !this.peers().some(radio => radio.checked);
  }

  protected override valueMissingMessage(): string {
    return 'Please select one of these options.';
  }

  protected override activateFromLabel(): void {
    this.input?.click();
  }

  private handleInput(event: Event): void {
    event.stopPropagation();
  }

  private handleChange(): void {
    this.checked = this.input.checked;
    if (this.checked && !this.inGroup) {
      for (const radio of this.peers()) {
        if (radio !== this) radio.checked = false;
        // Every radio of the set is valid once one of them is checked.
        radio.requestUpdate();
      }
    }
    this.markDirty();
    const detail = { checked: this.checked, value: this.value };
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
   * Render the component
   */
  override render() {
    const disabled = this.isDisabled || this.groupDisabled;
    const invalid = this.invalid || this.groupInvalid;
    const classes = {
      radio: true,
      [`radio--${this.size}`]: true,
      'radio--checked': this.checked,
      'radio--disabled': disabled,
      'radio--invalid': invalid,
      'radio--loading': this.loading,
      'radio--focused': this.hasFocus,
    };

    return html`
      <label part="base" class=${classMap(classes)}>
        <input
          class="radio__input"
          type="radio"
          name=${ifDefined(this.name)}
          tabindex=${this.tabbable ? 0 : -1}
          .checked=${this.checked}
          ?disabled=${disabled || this.loading}
          ?required=${this.required}
          aria-label=${ifDefined(this.accessibleLabel)}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-invalid=${invalid ? 'true' : 'false'}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @focus=${this.handleFocus}
          @blur=${this.handleBlur}
        />

        <span class="radio__button" part="button">
          ${
            this.loading
              ? html`
                  <span class="radio__loading" part="loading">
                    <zeno-spinner size="xs"></zeno-spinner>
                  </span>
                `
              : html` <span class="radio__dot" part="dot"></span> `
          }
        </span>

        ${
          this.label
            ? html`
                <span class="radio__label" part="label">
                  ${this.label}
                  ${
                    this.required && !this.hideRequiredIndicator
                      ? html`<span
                          class="radio__required"
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
      ${this.inGroup ? nothing : this.renderFieldError()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-radio': ZenoRadio;
  }
}

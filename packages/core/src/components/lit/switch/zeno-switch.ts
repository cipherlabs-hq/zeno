import { html, css, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ZenoElement } from '../base/zeno-element.js';
import { FormFieldMixin, formFieldStyles } from '../mixins/form-field.js';
import type { SwitchSize } from '../types.js';

/**
 * An on/off switch. It takes part in forms as a native checkbox does.
 *
 * @fires {CustomEvent<{ checked: boolean; value: FormValue }>} input - The user turned the switch on or off.
 * @fires {CustomEvent<{ checked: boolean; value: FormValue }>} change - The user turned the switch on or off.
 * @csspart base
 * @csspart error
 * @csspart icon
 * @csspart label
 * @csspart loading
 * @csspart required
 * @csspart thumb
 * @csspart track
 */
@customElement('zeno-switch')
export class ZenoSwitch extends FormFieldMixin(ZenoElement) {
  static override styles = [
    ZenoElement.baseStyles,
    formFieldStyles,
    css`
      :host {
        --switch-width-sm: 36px;
        --switch-width-md: 44px;
        --switch-width-lg: 52px;
        --switch-height-sm: 20px;
        --switch-height-md: 24px;
        --switch-height-lg: 28px;
        --switch-thumb-size-sm: 16px;
        --switch-thumb-size-md: 20px;
        --switch-thumb-size-lg: 24px;
        --switch-thumb-spacing: 2px;
        --switch-background-off: var(--zeno-color-border-control);
        --switch-background-on: var(--zeno-color-accent-solid);
        --switch-thumb-color: var(--zeno-color-accent-on-solid);
        --switch-focus-ring: 0 0 0 3px var(--zeno-color-accent-subtle-hover);
        --switch-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: inline-block;
      }

      /* Label container */
      .switch {
        display: inline-flex;
        align-items: center;
        gap: var(--zeno-spacing-2);
        position: relative;
        cursor: pointer;
        user-select: none;
      }

      .switch--disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      /* Hidden native input */
      .switch__input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      /* Switch track */
      .switch__track {
        position: relative;
        display: inline-flex;
        align-items: center;
        width: var(--switch-width);
        height: var(--switch-height);
        background: var(--switch-background-off);
        border-radius: var(--switch-height);
        transition: var(--switch-transition);
        flex-shrink: 0;
      }

      /* Size variants */
      .switch--sm {
        --switch-width: var(--switch-width-sm);
        --switch-height: var(--switch-height-sm);
        --switch-thumb-size: var(--switch-thumb-size-sm);
      }

      .switch--md {
        --switch-width: var(--switch-width-md);
        --switch-height: var(--switch-height-md);
        --switch-thumb-size: var(--switch-thumb-size-md);
      }

      .switch--lg {
        --switch-width: var(--switch-width-lg);
        --switch-height: var(--switch-height-lg);
        --switch-thumb-size: var(--switch-thumb-size-lg);
      }

      /* Switch thumb */
      .switch__thumb {
        position: absolute;
        top: var(--switch-thumb-spacing);
        left: var(--switch-thumb-spacing);
        width: var(--switch-thumb-size);
        height: var(--switch-thumb-size);
        background: var(--switch-thumb-color);
        border-radius: 50%;
        box-shadow: var(--zeno-shadow-xs);
        transition: var(--switch-transition);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Icons */
      .switch__icon {
        width: calc(var(--switch-thumb-size) - 4px);
        height: calc(var(--switch-thumb-size) - 4px);
        color: var(--switch-background-on);
        opacity: 0;
        transform: scale(0.8);
        transition: var(--switch-transition);
      }

      /* Hover state */
      .switch:not(.switch--disabled):hover .switch__track {
        opacity: 0.8;
      }

      /* Focus state */
      .switch__input:focus-visible ~ .switch__track {
        outline: none;
        box-shadow: var(--switch-focus-ring);
      }

      /* Checked state */
      .switch__input:checked ~ .switch__track {
        background: var(--switch-background-on);
      }

      .switch__input:checked ~ .switch__track .switch__thumb {
        transform: translateX(
          calc(
            var(--switch-width) - var(--switch-thumb-size) - var(
                --switch-thumb-spacing
              ) *
              2
          )
        );
      }

      .switch__input:checked ~ .switch__track .switch__icon {
        opacity: 1;
        transform: scale(1);
      }

      /* Label text */
      .switch__label {
        color: var(--zeno-color-text-primary);
        font-size: var(--zeno-font-size-md);
        line-height: var(--zeno-font-line-height-normal);
      }

      .switch--sm .switch__label {
        font-size: var(--zeno-font-size-sm);
      }

      .switch--lg .switch__label {
        font-size: var(--zeno-font-size-lg);
      }

      /* Label positions */
      .switch--label-start {
        flex-direction: row-reverse;
      }

      /* Invalid state */
      .switch--invalid .switch__track {
        background: var(--zeno-color-danger-subtle-hover);
      }

      .switch--invalid .switch__input:checked ~ .switch__track {
        background: var(--zeno-color-danger-solid);
      }

      .switch--invalid .switch__input:focus-visible ~ .switch__track {
        box-shadow: 0 0 0 3px var(--zeno-color-danger-subtle-hover);
      }

      /* Required indicator */
      .switch__required {
        color: var(--zeno-color-danger-text);
        margin-left: var(--zeno-spacing-1);
      }

      /* Loading state */
      .switch--loading .switch__track {
        pointer-events: none;
      }

      .switch--loading .switch__icon {
        display: none;
      }

      .switch__loading {
        position: absolute;
        width: calc(var(--switch-thumb-size) - 4px);
        height: calc(var(--switch-thumb-size) - 4px);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .switch__track {
          border: 2px solid ButtonText;
        }

        .switch__input:focus-visible ~ .switch__track {
          outline: 2px solid ButtonText;
          outline-offset: 2px;
          box-shadow: none;
        }

        .switch__input:checked ~ .switch__track {
          background: ButtonText;
        }

        .switch__thumb {
          background: ButtonFace;
          border: 1px solid ButtonText;
        }

        .switch__input:checked ~ .switch__track .switch__thumb {
          background: ButtonFace;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .switch__track,
        .switch__thumb,
        .switch__icon {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .switch__track {
          background: #ccc;
        }

        .switch__input:checked ~ .switch__track {
          background: #000;
        }

        .switch__thumb {
          box-shadow: none;
          border: 1px solid #000;
        }
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ reflect: true }) size: SwitchSize = 'md';
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Boolean, reflect: true, attribute: 'show-icon' }) showIcon =
    false;
  @property({ reflect: true, attribute: 'label-position' }) labelPosition:
    'start' | 'end' = 'end';

  @state() private hasFocus = false;

  /** Whether it is checked when its form is reset. */
  defaultChecked = false;

  @query('.switch__input') private input!: HTMLInputElement;

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
    const classes = {
      switch: true,
      [`switch--${this.size}`]: true,
      'switch--checked': this.checked,
      'switch--disabled': this.isDisabled,
      'switch--invalid': this.invalid,
      'switch--loading': this.loading,
      'switch--focused': this.hasFocus,
      [`switch--label-${this.labelPosition}`]: true,
    };

    return html`
      <label part="base" class=${classMap(classes)}>
        <input
          class="switch__input"
          type="checkbox"
          role="switch"
          name=${ifDefined(this.name)}
          .checked=${this.checked}
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

        <span class="switch__track" part="track">
          <span class="switch__thumb" part="thumb">
            ${
              this.loading
                ? html`
                    <span class="switch__loading" part="loading">
                      <zeno-spinner size="xs"></zeno-spinner>
                    </span>
                  `
                : this.showIcon
                  ? html`
                      <span class="switch__icon" part="icon">
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                        >
                          <polyline points="3,8 6,11 13,4" />
                        </svg>
                      </span>
                    `
                  : nothing
            }
          </span>
        </span>

        ${
          this.label
            ? html`
                <span class="switch__label" part="label">
                  ${this.label}
                  ${
                    this.required && !this.hideRequiredIndicator
                      ? html`<span
                          class="switch__required"
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
    'zeno-switch': ZenoSwitch;
  }
}

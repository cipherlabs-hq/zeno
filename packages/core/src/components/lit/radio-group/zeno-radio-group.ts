import { html, css, nothing, type PropertyValues } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  customElement,
  property,
  queryAssignedElements,
} from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
import { FormFieldMixin, formFieldStyles } from '../mixins/form-field.js';
import type { RadioSize, Orientation } from '../types.js';
import type { ZenoRadio } from '../radio/zeno-radio.js';

/**
 * A set of `zeno-radio` elements with one value, a legend and arrow-key
 * navigation.
 *
 * @slot - The zeno-radio elements.
 * @fires {CustomEvent<{ value: FormValue }>} input - The user selected a different radio.
 * @fires {CustomEvent<{ value: FormValue }>} change - The user selected a different radio.
 * @csspart base
 * @csspart error
 * @csspart helper
 * @csspart label
 * @csspart legend
 * @csspart options
 * @csspart required
 */
@customElement('zeno-radio-group')
export class ZenoRadioGroup extends FormFieldMixin(ZenoElement) {
  static override styles = [
    ZenoElement.baseStyles,
    formFieldStyles,
    css`
      :host {
        display: block;
      }

      /* Fieldset styles */
      .radio-group {
        border: none;
        padding: 0;
        margin: 0;
        min-width: 0;
      }

      /* Legend styles */
      .radio-group__legend {
        padding: 0;
        margin: 0 0 var(--zeno-spacing-2) 0;
        font-size: var(--zeno-font-size-md);
        font-weight: var(--zeno-font-weight-medium);
        color: var(--zeno-color-text-primary);
        line-height: var(--zeno-font-line-height-normal);
      }

      .radio-group--sm .radio-group__legend {
        font-size: var(--zeno-font-size-sm);
      }

      .radio-group--lg .radio-group__legend {
        font-size: var(--zeno-font-size-lg);
      }

      /* Required indicator */
      .radio-group__required {
        color: var(--zeno-color-danger-text);
        margin-left: var(--zeno-spacing-1);
      }

      /* Options container */
      .radio-group__options {
        display: flex;
        gap: var(--zeno-spacing-3);
      }

      /* Orientation variants */
      .radio-group--horizontal .radio-group__options {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .radio-group--vertical .radio-group__options {
        flex-direction: column;
      }

      /* Disabled state */
      .radio-group--disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .radio-group--disabled .radio-group__legend {
        color: var(--zeno-color-text-disabled);
      }

      /* Invalid state */
      .radio-group--invalid .radio-group__legend {
        color: var(--zeno-color-danger-text);
      }

      /* Helper text */
      .radio-group__helper {
        margin-top: var(--zeno-spacing-1);
        font-size: var(--zeno-font-size-sm);
        color: var(--zeno-color-text-secondary);
        line-height: var(--zeno-font-line-height-normal);
      }

      .radio-group--invalid .radio-group__helper {
        color: var(--zeno-color-danger-text);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .radio-group--invalid .radio-group__legend {
          text-decoration: underline;
          text-decoration-color: ButtonText;
        }
      }

      /* Print styles */
      @media print {
        .radio-group__legend {
          font-weight: bold;
        }
      }
    `,
  ];

  @property({ attribute: 'helper-text' }) helperText?: string;
  @property({ reflect: true }) orientation: Orientation = 'vertical';
  @property({ reflect: true }) size: RadioSize = 'md';

  @queryAssignedElements({ selector: 'zeno-radio' })
  private radios!: ZenoRadio[];

  constructor() {
    super();
    this.addEventListener('input', this.handleRadioEvent);
    this.addEventListener('change', this.handleRadioEvent);
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('focusout', event => {
      const next = event.relatedTarget;
      if (!(next instanceof Node) || !this.contains(next)) this.markTouched();
    });
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    this.updateRadios();
  }

  override focus(options?: FocusOptions): void {
    const radios = this.radios.filter(radio => !radio.disabled);
    (radios.find(radio => radio.checked) ?? radios[0])?.focus(options);
  }

  protected override valueMissingMessage(): string {
    return 'Please select one of these options.';
  }

  protected override validationAnchor(): HTMLElement | undefined {
    return this.radios.find(radio => !radio.disabled);
  }

  /** Hands the group's state to the radios slotted into it. */
  private updateRadios(): void {
    const radios = this.radios;
    const value = this.value === '' ? undefined : String(this.value);
    const enabled = radios.filter(radio => !radio.disabled);
    const tabStop =
      enabled.find(radio => String(radio.value) === value) ?? enabled[0];

    for (const radio of radios) {
      radio.checked = String(radio.value) === value;
      radio.size = this.size;
      radio.groupDisabled = this.isDisabled;
      radio.groupInvalid = this.invalid;
      // One Tab stop for the whole group, as with native radios.
      radio.tabbable = radio === tabStop;
    }
  }

  // A radio reports its own input and change. The group replaces both with
  // one pair of events that carry the group's value.
  private handleRadioEvent = (event: Event): void => {
    const radio = event.target as ZenoRadio;
    if (event.target === this || radio.localName !== 'zeno-radio') return;
    event.stopPropagation();
    if (event.type !== 'change' || !radio.checked) return;

    this.value = radio.value;
    this.markDirty();
    this.emitValueEvent('input', { value: this.value });
    this.emitValueEvent('change', { value: this.value });
  };

  // Arrow keys move focus and the selection together.
  private handleKeyDown = (event: KeyboardEvent): void => {
    const step =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0;
    if (step === 0) return;

    const radios = this.radios.filter(radio => !radio.disabled);
    if (radios.length === 0 || this.isDisabled) return;
    event.preventDefault();

    const current = radios.findIndex(radio => radio.matches(':focus-within'));
    const next =
      current === -1
        ? step === 1
          ? 0
          : radios.length - 1
        : (current + step + radios.length) % radios.length;
    radios[next].focus();
    radios[next].click();
  };

  override render() {
    const classes = {
      'radio-group': true,
      [`radio-group--${this.orientation}`]: true,
      [`radio-group--${this.size}`]: true,
      'radio-group--disabled': this.isDisabled,
      'radio-group--invalid': this.invalid,
    };
    const describedBy = [
      this.helperText ? 'helper' : '',
      this.describedBy ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <fieldset
        part="base"
        role="radiogroup"
        class=${classMap(classes)}
        aria-labelledby=${ifDefined(this.label ? 'legend' : undefined)}
        aria-label=${ifDefined(this.label ? undefined : this.accessibleLabel)}
        aria-describedby=${ifDefined(describedBy || undefined)}
        aria-required=${this.required ? 'true' : 'false'}
        aria-invalid=${this.invalid ? 'true' : 'false'}
      >
        ${
          this.label
            ? html`
                <legend id="legend" class="radio-group__legend" part="legend">
                  ${this.label}
                  ${
                    this.required && !this.hideRequiredIndicator
                      ? html`<span
                          class="radio-group__required"
                          part="required"
                          aria-hidden="true"
                          >*</span
                        >`
                      : nothing
                  }
                </legend>
              `
            : nothing
        }

        <div class="radio-group__options" part="options">
          <slot @slotchange=${this.updateRadios}></slot>
        </div>

        ${this.renderFieldError()}
        ${
          this.helperText
            ? html`
                <div id="helper" class="radio-group__helper" part="helper">
                  ${this.helperText}
                </div>
              `
            : nothing
        }
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-radio-group': ZenoRadioGroup;
  }
}

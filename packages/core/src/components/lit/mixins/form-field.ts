/**
 * Makes a Lit element a form-associated custom element.
 *
 * The mixin owns everything a form needs from a control: the submitted value,
 * validity, the disabled state (its own and an ancestor fieldset's), reset,
 * state restore and the text of any <label> that points at the element. An
 * element supplies its markup and overrides the hooks at the bottom when the
 * defaults do not fit.
 */

import {
  css,
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type ReactiveElement,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import type { Constructor } from '../types.js';
import type { FormValue } from '../../../types/index.js';

/**
 * The members the mixin adds, written as a class so that the protected hooks
 * keep their visibility for the elements that override them.
 */
export declare class FormFieldInterface {
  value: FormValue;
  defaultValue: FormValue;
  name?: string;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  error?: string;
  touched: boolean;
  dirty: boolean;
  label?: string;
  hideRequiredIndicator: boolean;
  get invalid(): boolean;
  get isDisabled(): boolean;
  get form(): HTMLFormElement | null;
  get labels(): NodeList;
  get validity(): ValidityState;
  get validationMessage(): string;
  get willValidate(): boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
  setCustomValidity(_message: string): void;
  validate(): boolean;
  protected internals: ElementInternals;
  /** The name to give the inner control when no visible label names it. */
  protected get accessibleLabel(): string | undefined;
  /** Id of the error message, when one is showing. */
  protected get describedBy(): string | undefined;
  protected renderFieldLabel(
    _controlId: string
  ): TemplateResult | typeof nothing;
  protected renderFieldError(): TemplateResult | typeof nothing;
  /** Call after a user action changes the value. */
  protected markDirty(): void;
  /** Call when the control loses focus. */
  protected markTouched(): void;
  protected captureDefaults(): void;
  protected resetToDefaults(): void;
  protected formSubmitValue(): File | string | FormData | null;
  protected formState(): File | string | FormData | null;
  protected restoreState(_state: string): void;
  protected isEmpty(): boolean;
  protected valueMissingMessage(): string;
  protected ownValidity(): [ValidityStateFlags, string] | undefined;
  protected nativeControl(): NativeControl | undefined;
  protected validationAnchor(): HTMLElement | undefined;
  protected activateFromLabel(): void;
}

const VALIDITY_FLAGS = [
  'badInput',
  'patternMismatch',
  'rangeOverflow',
  'rangeUnderflow',
  'stepMismatch',
  'tooLong',
  'tooShort',
  'typeMismatch',
  'valueMissing',
] as const;

export type NativeControl =
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Styles for the label and error message the mixin can render. */
export const formFieldStyles = css`
  :host(:disabled) {
    cursor: not-allowed;
    pointer-events: none;
  }

  .field-label {
    display: block;
    margin-bottom: var(--zeno-spacing-1-5);
    color: var(--zeno-color-text-primary);
    font-size: var(--zeno-font-size-sm);
    font-weight: var(--zeno-font-weight-medium);
    line-height: var(--zeno-font-line-height-snug);
  }

  .field-label__required {
    margin-left: var(--zeno-spacing-0-5);
    color: var(--zeno-color-text-invalid);
  }

  .field-error {
    margin-top: var(--zeno-spacing-1-5);
    color: var(--zeno-color-text-invalid);
    font-size: var(--zeno-font-size-sm);
    line-height: var(--zeno-font-line-height-snug);
  }
`;

export function FormFieldMixin<T extends Constructor<LitElement>>(
  superClass: T
) {
  class FormFieldMixinClass extends superClass {
    static formAssociated = true;

    // Focus on the host moves to the first focusable part inside it. That is
    // what makes a click on an outside <label for> focus the control.
    static shadowRootOptions: ShadowRootInit = {
      ...LitElement.shadowRootOptions,
      delegatesFocus: true,
    };

    @property() value: FormValue = '';
    @property({ reflect: true }) name?: string;
    @property({ type: Boolean, reflect: true }) required = false;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: Boolean, reflect: true }) readonly = false;
    /** An error to show, for example one a server returned. */
    @property() error?: string;
    /** A visible label. An outside <label for> works as well. */
    @property() label?: string;
    @property({ type: Boolean, attribute: 'hide-required-indicator' })
    hideRequiredIndicator = false;

    /** True once the user has left the control or a submit was refused. */
    @state() touched = false;
    /** True once the user has changed the value. */
    @state() dirty = false;
    @state() private formDisabled = false;
    @state() private outsideLabel = '';
    @state() private validityMessage = '';

    /** The value the control goes back to when its form is reset. */
    defaultValue: FormValue = '';

    protected internals: ElementInternals;
    private customError = '';
    private defaultsCaptured = false;
    private quietCheck = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- required by the TypeScript mixin pattern
    constructor(...args: any[]) {
      super(...args);
      this.internals = this.attachInternals();
      this.addEventListener('invalid', () => {
        // A refused submit or reportValidity() shows the error from then on.
        if (!this.quietCheck) this.touched = true;
      });
      this.addEventListener('click', event => {
        // A click on an outside <label> arrives on the host itself.
        if (event.composedPath()[0] === this && !this.isDisabled) {
          this.activateFromLabel();
        }
      });
    }

    override connectedCallback(): void {
      super.connectedCallback();
      if (!this.defaultsCaptured) {
        this.defaultsCaptured = true;
        this.captureDefaults();
      }
      // A label can come after the element in the document, so read the
      // labels after parsing has moved on, and again whenever focus arrives.
      requestAnimationFrame(this.readOutsideLabel);
      this.addEventListener('focusin', this.readOutsideLabel);
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      this.removeEventListener('focusin', this.readOutsideLabel);
    }

    get form(): HTMLFormElement | null {
      return this.internals.form;
    }

    get labels(): NodeList {
      return this.internals.labels;
    }

    get validity(): ValidityState {
      return this.internals.validity;
    }

    get validationMessage(): string {
      return this.internals.validationMessage;
    }

    get willValidate(): boolean {
      return this.internals.willValidate;
    }

    /** True when the element or an ancestor fieldset disables it. */
    get isDisabled(): boolean {
      return this.disabled || this.formDisabled;
    }

    /** True when the control should look invalid. */
    get invalid(): boolean {
      return Boolean(this.error) || (this.touched && !this.validity.valid);
    }

    /**
     * Reports whether the value is valid without showing anything. Use
     * reportValidity() or validate() to show the result as well.
     */
    checkValidity(): boolean {
      this.updateValidity();
      this.quietCheck = true;
      try {
        return this.internals.checkValidity();
      } finally {
        this.quietCheck = false;
      }
    }

    reportValidity(): boolean {
      this.updateValidity();
      return this.internals.reportValidity();
    }

    setCustomValidity(message: string): void {
      this.customError = message;
      this.updateValidity();
    }

    /** Checks validity and shows the result on the control. */
    validate(): boolean {
      this.touched = true;
      return this.checkValidity();
    }

    formDisabledCallback(disabled: boolean): void {
      this.formDisabled = disabled;
    }

    formResetCallback(): void {
      this.resetToDefaults();
      this.touched = false;
      this.dirty = false;
      this.error = undefined;
      this.customError = '';
    }

    formStateRestoreCallback(restored: File | string | FormData | null): void {
      if (typeof restored === 'string') {
        this.restoreState(restored);
      }
    }

    protected override updated(changedProperties: PropertyValues): void {
      super.updated(changedProperties);
      this.internals.setFormValue(
        this.isDisabled ? null : this.formSubmitValue(),
        this.formState()
      );
      this.updateValidity();
    }

    protected get accessibleLabel(): string | undefined {
      return this.ariaLabel || this.outsideLabel || undefined;
    }

    protected get describedBy(): string | undefined {
      return this.invalid && this.errorText ? 'field-error' : undefined;
    }

    protected renderFieldLabel(
      controlId: string
    ): TemplateResult | typeof nothing {
      if (!this.label) return nothing;
      return html`<label class="field-label" part="label" for=${controlId}
        >${this.label}${
          this.required && !this.hideRequiredIndicator
            ? html`<span class="field-label__required" aria-hidden="true"
                >*</span
              >`
            : nothing
        }</label
      >`;
    }

    protected renderFieldError(): TemplateResult | typeof nothing {
      if (!this.invalid || !this.errorText) return nothing;
      return html`<div class="field-error" part="error" id="field-error">
        ${this.errorText}
      </div>`;
    }

    protected markDirty(): void {
      this.dirty = true;
    }

    protected markTouched(): void {
      this.touched = true;
    }

    // Hooks. An element overrides these when the default does not fit.

    /** Records what the control resets to. Runs once, on first connect. */
    protected captureDefaults(): void {
      this.defaultValue = this.value;
    }

    protected resetToDefaults(): void {
      this.value = this.defaultValue;
    }

    /** The entry the form submits. `null` submits nothing. */
    protected formSubmitValue(): File | string | FormData | null {
      return this.isEmpty() ? '' : String(this.value);
    }

    /** What the browser keeps to restore the control after navigation. */
    protected formState(): File | string | FormData | null {
      return this.formSubmitValue();
    }

    protected restoreState(restored: string): void {
      this.value = restored;
    }

    /** True when `required` is not satisfied. */
    protected isEmpty(): boolean {
      const value = this.value;
      return value === '' || value === null || value === undefined;
    }

    /** The message for a required control with no value. */
    protected valueMissingMessage(): string {
      return 'Please fill out this field.';
    }

    /**
     * A constraint the element checks itself, as flags and a message.
     * It is consulted after the native control and `required`.
     */
    protected ownValidity(): [ValidityStateFlags, string] | undefined {
      return undefined;
    }

    /** A native control inside the element whose validity it mirrors. */
    protected nativeControl(): NativeControl | undefined {
      return undefined;
    }

    /** Where the browser anchors its validation bubble. */
    protected validationAnchor(): HTMLElement | undefined {
      return (
        this.nativeControl() ??
        this.shadowRoot?.querySelector<HTMLElement>(
          'input, textarea, select, button, [tabindex]'
        ) ??
        undefined
      );
    }

    /** Runs when a click on an outside label activates the control. */
    protected activateFromLabel(): void {
      this.focus();
    }

    private get errorText(): string {
      return this.error || this.validityMessage;
    }

    private readOutsideLabel = (): void => {
      const text = [...this.internals.labels]
        .map(label => label.textContent?.trim() ?? '')
        .filter(Boolean)
        .join(' ');
      if (text !== this.outsideLabel) {
        this.outsideLabel = text;
      }
    };

    private updateValidity(): void {
      const anchor = this.validationAnchor();
      const native = this.nativeControl();
      const custom = this.customError || this.error || '';
      let flags: ValidityStateFlags = {};
      let message = '';

      if (custom) {
        flags = { customError: true };
        message = custom;
      } else if (native && !native.validity.valid) {
        for (const flag of VALIDITY_FLAGS) {
          if (native.validity[flag]) flags[flag] = true;
        }
        message = native.validationMessage;
      } else if (this.required && this.isEmpty()) {
        flags = { valueMissing: true };
        message = this.valueMissingMessage();
      } else {
        const own = this.ownValidity();
        if (own) [flags, message] = own;
      }

      if (message) {
        this.internals.setValidity(flags, message, anchor);
      } else {
        this.internals.setValidity({});
      }
      if (message !== this.validityMessage) {
        this.validityMessage = message;
      }
    }
  }

  // The validation message of a native control is only known after it has
  // rendered, so showing it takes a second update. Lit warns about that in
  // development builds; here it is intended.
  (FormFieldMixinClass as unknown as typeof ReactiveElement).disableWarning?.(
    'change-in-update'
  );

  return FormFieldMixinClass as unknown as Constructor<FormFieldInterface> & T;
}

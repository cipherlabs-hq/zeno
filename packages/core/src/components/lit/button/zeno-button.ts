import { html, css, LitElement, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { ButtonVariant, ButtonSize, ButtonType } from '../types.js';

/**
 * A button, or a link that looks like one when `href` is set. Inside a form,
 * `type="submit"` and `type="reset"` act on that form.
 *
 * @slot - The label.
 * @slot prefix - An icon before the label.
 * @slot suffix - An icon after the label.
 * @csspart base
 * @csspart prefix
 * @csspart suffix
 */
@customElement('zeno-button')
export class ZenoButton extends ZenoElement {
  // Form-associated so that type="submit" and type="reset" act on the form
  // around the element, and a disabled fieldset disables it.
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --button-height: var(--zeno-spacing-10);
        --button-padding-x: var(--zeno-spacing-4);
        --button-font-size: var(--zeno-font-size-md);
        --button-border-radius: var(--zeno-radius-md);
        --button-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: inline-flex;
        vertical-align: middle;
      }

      /* Size variants */
      :host([size='xs']) {
        --button-height: var(--zeno-spacing-7);
        --button-padding-x: var(--zeno-spacing-2);
        --button-font-size: var(--zeno-font-size-xs);
      }

      :host([size='sm']) {
        --button-height: var(--zeno-spacing-8);
        --button-padding-x: var(--zeno-spacing-3);
        --button-font-size: var(--zeno-font-size-sm);
      }

      :host([size='lg']) {
        --button-height: var(--zeno-spacing-11);
        --button-padding-x: var(--zeno-spacing-5);
        --button-font-size: var(--zeno-font-size-lg);
      }

      :host([size='xl']) {
        --button-height: var(--zeno-spacing-12);
        --button-padding-x: var(--zeno-spacing-6);
        --button-font-size: var(--zeno-font-size-xl);
      }

      /* Base button styles */
      .button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--zeno-spacing-2);
        height: var(--button-height);
        padding: 0 var(--button-padding-x);
        border: none;
        border-radius: var(--button-border-radius);
        font-family: inherit;
        font-size: var(--button-font-size);
        font-weight: var(--zeno-font-weight-medium);
        line-height: 1;
        text-decoration: none;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        transition: var(--button-transition);
        -webkit-tap-highlight-color: transparent;

        /* Focus visible for accessibility */
        outline: none;
      }

      .button:focus-visible {
        outline: 2px solid var(--zeno-color-focus-ring);
        outline-offset: 2px;
      }

      /* Disabled state */
      .button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      /* Loading state */
      .button--loading {
        pointer-events: none;
      }

      /* Faded out, not hidden, so the button keeps its name while it spins. */
      .button--loading .button__content {
        opacity: 0;
      }

      /* Full width */
      :host([full-width]) {
        width: 100%;
      }

      :host([full-width]) .button {
        width: 100%;
      }

      /* Icon only */
      .button--icon-only {
        padding: 0;
        width: var(--button-height);
      }

      /* Variants */

      /* Primary variant */
      .button--primary {
        background-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
      }

      .button--primary:hover:not(:disabled) {
        background-color: var(--zeno-color-accent-solid-hover);
        transform: translateY(-1px);
        box-shadow: var(--zeno-shadow-sm);
      }

      .button--primary:active:not(:disabled) {
        background-color: var(--zeno-color-accent-solid-active);
        transform: translateY(0);
        box-shadow: var(--zeno-shadow-xs);
      }

      /* Secondary variant - Neutral */
      .button--secondary {
        background-color: var(--zeno-color-neutral-solid);
        color: var(--zeno-color-neutral-on-solid);
      }

      .button--secondary:hover:not(:disabled) {
        background-color: var(--zeno-color-neutral-solid-hover);
        transform: translateY(-1px);
        box-shadow: var(--zeno-shadow-sm);
      }

      .button--secondary:active:not(:disabled) {
        background-color: var(--zeno-color-neutral-solid-active);
        transform: translateY(0);
        box-shadow: var(--zeno-shadow-xs);
      }

      /* Accent variant */
      .button--accent {
        background-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
      }

      .button--accent:hover:not(:disabled) {
        background-color: var(--zeno-color-accent-solid-hover);
        transform: translateY(-1px);
        box-shadow: var(--zeno-shadow-sm);
      }

      .button--accent:active:not(:disabled) {
        background-color: var(--zeno-color-accent-solid-active);
        transform: translateY(0);
        box-shadow: var(--zeno-shadow-xs);
      }

      /* Ghost variant - Transparent */
      .button--ghost {
        background-color: transparent;
        color: var(--zeno-color-text-primary);
      }

      .button--ghost:hover:not(:disabled) {
        background-color: var(--zeno-color-background-hover);
      }

      .button--ghost:active:not(:disabled) {
        background-color: var(--zeno-color-background-active);
      }

      /* Outline variant - Border only */
      .button--outline {
        background-color: transparent;
        color: var(--zeno-color-accent-text);
        border: 2px solid var(--zeno-color-accent-solid);
      }

      .button--outline:hover:not(:disabled) {
        background-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
        transform: translateY(-1px);
        box-shadow: var(--zeno-shadow-sm);
      }

      .button--outline:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: var(--zeno-shadow-xs);
      }

      /* Destructive variant - Danger actions */
      .button--destructive {
        background-color: var(--zeno-color-danger-solid);
        color: var(--zeno-color-danger-on-solid);
      }

      .button--destructive:hover:not(:disabled) {
        background-color: var(--zeno-color-danger-solid-hover);
        transform: translateY(-1px);
        box-shadow: var(--zeno-shadow-sm);
      }

      .button--destructive:active:not(:disabled) {
        background-color: var(--zeno-color-danger-solid-active);
        transform: translateY(0);
        box-shadow: var(--zeno-shadow-xs);
      }

      /* Content wrapper */
      .button__content {
        display: inline-flex;
        align-items: center;
        gap: var(--zeno-spacing-2);
      }

      /* Icons */
      .button__icon[hidden] {
        display: none;
      }

      .button__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.25em;
        height: 1.25em;
        flex-shrink: 0;
      }

      ::slotted(svg) {
        width: 100%;
        height: 100%;
      }

      /* Loading spinner */
      .button__spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 1.25em;
        height: 1.25em;
      }

      .spinner {
        width: 100%;
        height: 100%;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin var(--zeno-motion-duration-md) linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Ripple effect */
      .button__ripple {
        position: absolute;
        border-radius: 50%;
        background-color: currentColor;
        opacity: 0.2;
        transform: scale(0);
        animation: ripple var(--zeno-motion-duration-lg) ease-out;
        pointer-events: none;
      }

      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .button {
          transition: none;
        }

        .button:hover:not(:disabled) {
          transform: none;
        }

        .spinner {
          animation: none;
          border-top-color: transparent;
          border-right-color: currentColor;
        }

        .button__ripple {
          animation: none;
          display: none;
        }
      }
    `,
  ];

  @property({ reflect: true }) variant: ButtonVariant = 'primary';
  @property({ reflect: true }) size: ButtonSize = 'md';
  @property({ reflect: true }) type: ButtonType = 'button';
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** With `value`, the entry a submit button adds to the form it submits. */
  @property({ reflect: true }) name?: string;
  @property() value?: string;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Boolean, reflect: true, attribute: 'full-width' })
  fullWidth = false;
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) iconOnly =
    false;
  @property() href?: string;
  @property() target?: string;
  @property() rel?: string;
  @property() download?: string;

  @state() private isRippling = false;
  @state() private rippleX = 0;
  @state() private rippleY = 0;

  @state() private formDisabled = false;
  @state() private hasPrefix = false;
  @state() private hasSuffix = false;

  @query('.button') private button!: HTMLButtonElement | HTMLAnchorElement;

  private internals = this.attachInternals();

  /** The form the button belongs to, if any. */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  /** True when the element or an ancestor fieldset disables it. */
  get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  // The native click event already crosses the shadow boundary, so the
  // element does not send one of its own.
  private handleClick(event: MouseEvent): void {
    if (this.isDisabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!this.prefersReducedMotion) {
      const rect = this.button.getBoundingClientRect();
      this.rippleX = event.clientX - rect.left;
      this.rippleY = event.clientY - rect.top;
      this.isRippling = true;
    }

    if (this.href) return;
    const form = this.form;
    if (!form || this.type === 'button') return;
    // A native button acts on its form once the click has finished its
    // journey, so that any listener on the way can cancel the action.
    setTimeout(() => {
      if (event.defaultPrevented || !this.isConnected) return;
      if (this.type === 'reset') {
        form.reset();
      } else {
        this.submit(form);
      }
    });
  }

  private submit(form: HTMLFormElement): void {
    // A custom element cannot be passed to requestSubmit() as the submitter,
    // so its name and value ride along as a form value for this submit only.
    if (this.name) this.internals.setFormValue(this.value ?? '');
    try {
      form.requestSubmit();
    } finally {
      this.internals.setFormValue(null);
    }
  }

  private handleSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const filled = slot.assignedNodes({ flatten: true }).length > 0;
    if (slot.name === 'prefix') this.hasPrefix = filled;
    if (slot.name === 'suffix') this.hasSuffix = filled;
  }

  /**
   * Handle ripple animation end
   */
  private handleRippleEnd(): void {
    this.isRippling = false;
  }

  /**
   * Updated lifecycle
   */
  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // Apply ARIA attributes
    if (this.button) {
      this.applyAriaAttributes(this.button);

      if (this.loading) {
        this.button.setAttribute('aria-busy', 'true');
      } else {
        this.button.removeAttribute('aria-busy');
      }
    }
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      button: true,
      [`button--${this.variant}`]: true,
      'button--loading': this.loading,
      'button--icon-only': this.iconOnly,
    };

    const isLink = !!this.href;

    return html`
      ${
        isLink
          ? html`
              <a
                part="base"
                class=${classMap(classes)}
                href=${ifDefined(this.href)}
                target=${ifDefined(this.target)}
                rel=${ifDefined(this.rel)}
                download=${ifDefined(this.download)}
                aria-disabled=${ifDefined(this.isDisabled ? 'true' : undefined)}
                tabindex=${ifDefined(this.isDisabled ? '-1' : undefined)}
                @click=${this.handleClick}
              >
                ${this.renderContent()}
              </a>
            `
          : html`
              <button
                part="base"
                class=${classMap(classes)}
                type="button"
                ?disabled=${this.isDisabled || this.loading}
                @click=${this.handleClick}
              >
                ${this.renderContent()}
              </button>
            `
      }
    `;
  }

  /**
   * Render button content
   */
  private renderContent() {
    return html`
      <span class="button__content">
        <span
          part="prefix"
          class="button__icon button__prefix"
          ?hidden=${!this.hasPrefix}
        >
          <slot name="prefix" @slotchange=${this.handleSlotChange}></slot>
        </span>
        <slot></slot>
        <span
          part="suffix"
          class="button__icon button__suffix"
          ?hidden=${!this.hasSuffix}
        >
          <slot name="suffix" @slotchange=${this.handleSlotChange}></slot>
        </span>
      </span>
      ${
        this.loading
          ? html`
              <span class="button__spinner" aria-hidden="true">
                <span class="spinner"></span>
              </span>
            `
          : ''
      }
      ${
        this.isRippling
          ? html`
              <span
                class="button__ripple"
                style="left: ${this.rippleX}px; top: ${this.rippleY}px;"
                @animationend=${this.handleRippleEnd}
              ></span>
            `
          : ''
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-button': ZenoButton;
  }
}

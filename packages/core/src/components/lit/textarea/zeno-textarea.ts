import { html, css, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { ZenoElement } from '../base/zeno-element.js';
import { FormFieldMixin, formFieldStyles } from '../mixins/form-field.js';
import type { InputVariant, InputSize } from '../types.js';

/**
 * A multi-line text field that can grow with its content.
 *
 * @fires {CustomEvent<{ value: FormValue }>} input - The value changed while typing.
 * @fires {CustomEvent<{ value: FormValue }>} change - The value was committed.
 * @fires {CustomEvent} clear - The clear button was pressed.
 * @csspart clear-button
 * @csspart count
 * @csspart error
 * @csspart footer
 * @csspart label
 * @csspart loading
 * @csspart textarea
 * @csspart wrapper
 */
@customElement('zeno-textarea')
export class ZenoTextarea extends FormFieldMixin(ZenoElement) {
  static override styles = [
    ZenoElement.baseStyles,
    formFieldStyles,
    css`
      :host {
        --textarea-padding: var(--zeno-spacing-3);
        --textarea-border-width: 1px;
        --textarea-border-radius: var(--zeno-radius-md);
        --textarea-font-size: var(--zeno-font-size-md);
        --textarea-line-height: var(--zeno-font-line-height-relaxed);
        --textarea-background: var(--zeno-color-background-surface);
        --textarea-border-color: var(--zeno-color-border-control);
        --textarea-text-color: var(--zeno-color-text-primary);
        --textarea-placeholder-color: var(--zeno-color-text-tertiary);
        --textarea-focus-ring: 0 0 0 3px var(--zeno-color-accent-subtle-hover);
        --textarea-min-height: 80px;

        display: block;
      }

      /* Textarea wrapper */
      .textarea-wrapper {
        position: relative;
        width: 100%;
      }

      /* Base textarea styles */
      .textarea {
        width: 100%;
        min-height: var(--textarea-min-height);
        padding: var(--textarea-padding);
        border: var(--textarea-border-width) solid var(--textarea-border-color);
        border-radius: var(--textarea-border-radius);
        background: var(--textarea-background);
        color: var(--textarea-text-color);
        font-family: var(--zeno-font-family-sans);
        font-size: var(--textarea-font-size);
        line-height: var(--textarea-line-height);
        resize: vertical;
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        -webkit-appearance: none;
        appearance: none;
      }

      .textarea::placeholder {
        color: var(--textarea-placeholder-color);
        opacity: 1;
      }

      /* Size variants */
      .textarea--sm {
        font-size: var(--zeno-font-size-sm);
        padding: var(--zeno-spacing-2);
        --textarea-min-height: 60px;
      }

      .textarea--md {
        /* Default size */
      }

      .textarea--lg {
        font-size: var(--zeno-font-size-lg);
        padding: var(--zeno-spacing-4);
        --textarea-min-height: 100px;
      }

      /* Variant styles */
      .textarea--outlined {
        background: transparent;
      }

      .textarea--filled {
        background: var(--zeno-color-background-subtle);
        border-color: transparent;
      }

      .textarea--ghost {
        background: transparent;
        border-color: transparent;
        padding-left: 0;
        padding-right: 0;
      }

      /* Resize options */
      .textarea--resize-none {
        resize: none;
      }

      .textarea--resize-vertical {
        resize: vertical;
      }

      .textarea--resize-horizontal {
        resize: horizontal;
      }

      .textarea--resize-both {
        resize: both;
      }

      /* Auto-resize */
      .textarea--auto-resize {
        resize: none;
        overflow: hidden;
      }

      /* Focus states */
      .textarea:focus {
        outline: none;
        border-color: var(--zeno-color-accent-solid);
        box-shadow: var(--textarea-focus-ring);
      }

      .textarea--filled:focus {
        border-color: var(--zeno-color-accent-solid);
        background: var(--zeno-color-background-subtle);
      }

      .textarea--ghost:focus {
        border-color: var(--zeno-color-border-control);
        padding-left: var(--textarea-padding);
        padding-right: var(--textarea-padding);
      }

      /* Hover states */
      .textarea:hover:not(:focus):not(:disabled) {
        border-color: var(--zeno-color-border-control-hover);
      }

      .textarea--filled:hover:not(:focus):not(:disabled) {
        background: var(--zeno-color-background-muted);
      }

      /* Disabled state */
      .textarea:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--zeno-color-background-disabled);
        resize: none;
      }

      /* Invalid state */
      .textarea--invalid {
        border-color: var(--zeno-color-danger-solid);
      }

      .textarea--invalid:focus {
        box-shadow: 0 0 0 3px var(--zeno-color-danger-subtle-hover);
      }

      /* Success state */
      .textarea--success {
        border-color: var(--zeno-color-success-solid);
      }

      .textarea--success:focus {
        box-shadow: 0 0 0 3px var(--zeno-color-success-subtle-hover);
      }

      /* Character count */
      .textarea__footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--zeno-spacing-1);
        padding: 0 var(--zeno-spacing-1);
      }

      .textarea__count {
        font-size: var(--zeno-font-size-xs);
        color: var(--zeno-color-text-tertiary);
      }

      .textarea__count--error {
        color: var(--zeno-color-danger-text);
      }

      /* Clear button */
      .textarea__clear {
        position: absolute;
        top: var(--textarea-padding);
        right: var(--textarea-padding);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        padding: 0;
        border: none;
        background: var(--zeno-color-background-hover);
        color: var(--zeno-color-text-secondary);
        cursor: pointer;
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        border-radius: var(--zeno-radius-sm);
        opacity: 0;
        pointer-events: none;
      }

      .textarea-wrapper:hover .textarea__clear,
      .textarea:focus ~ .textarea__clear {
        opacity: 1;
        pointer-events: auto;
      }

      .textarea__clear:hover {
        color: var(--zeno-color-text-primary);
        background: var(--zeno-color-background-active);
      }

      /* Loading state */
      .textarea--loading {
        color: transparent;
      }

      .textarea__loading {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .textarea {
          border-width: 2px;
        }

        .textarea:focus {
          outline: 2px solid ButtonText;
          outline-offset: 2px;
          box-shadow: none;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .textarea,
        .textarea__clear {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .textarea {
          border: 1px solid #000;
          resize: none;
        }

        .textarea__footer {
          display: none;
        }
      }
    `,
  ];

  @property({ reflect: true }) variant: InputVariant = 'outlined';
  @property({ reflect: true }) size: InputSize = 'md';
  @property() placeholder?: string;
  @property({ type: Number }) rows = 3;
  @property({ type: Number }) minlength?: number;
  @property({ type: Number }) maxlength?: number;
  @property({ reflect: true }) resize:
    'none' | 'vertical' | 'horizontal' | 'both' = 'vertical';
  @property({ type: Boolean, reflect: true, attribute: 'auto-resize' })
  autoResize = false;
  @property({ type: Boolean, reflect: true }) override autofocus = false;
  @property({ type: Boolean, reflect: true }) clearable = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Boolean, reflect: true }) success = false;
  @property({ type: Boolean, reflect: true, attribute: 'show-count' })
  showCount = false;

  @query('.textarea') private textarea!: HTMLTextAreaElement;

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('value') || changedProperties.has('autoResize')) {
      this.adjustHeight();
    }
  }

  private get charCount(): number {
    return String(this.value ?? '').length;
  }

  protected override nativeControl(): HTMLTextAreaElement | undefined {
    return this.textarea ?? undefined;
  }

  /**
   * Focus the textarea element
   */
  override focus(options?: FocusOptions): void {
    this.textarea?.focus(options);
  }

  /**
   * Blur the textarea element
   */
  override blur(): void {
    this.textarea?.blur();
  }

  /**
   * Select all text in the textarea
   */
  select(): void {
    this.textarea?.select();
  }

  /**
   * Set selection range
   */
  setSelectionRange(
    start: number,
    end: number,
    direction?: 'forward' | 'backward' | 'none'
  ): void {
    this.textarea?.setSelectionRange(start, end, direction);
  }

  /**
   * Adjust textarea height for auto-resize
   */
  private adjustHeight(): void {
    if (!this.autoResize || !this.textarea) return;

    // Reset height to recalculate
    this.textarea.style.height = 'auto';

    // Set new height based on scroll height
    const scrollHeight = this.textarea.scrollHeight;
    const minHeight = parseInt(getComputedStyle(this.textarea).minHeight) || 0;
    this.textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
  }

  // The native input event crosses the shadow boundary. It is stopped here so
  // that a listener on the host gets one event, the one with a detail.
  private handleInput(event: Event): void {
    event.stopPropagation();
    this.value = this.textarea.value;
    this.markDirty();
    this.emitValueEvent('input', { value: this.value });
  }

  private handleChange(): void {
    this.value = this.textarea.value;
    this.emitValueEvent('change', { value: this.value });
  }

  private handleClear(): void {
    this.value = '';
    this.textarea.value = '';
    this.markDirty();
    this.emitEvent('clear');
    this.emitValueEvent('input', { value: '' });
    this.emitValueEvent('change', { value: '' });
    this.focus();
  }

  private handleBlur(): void {
    this.markTouched();
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
    const isOverLimit =
      this.maxlength !== undefined && this.charCount > this.maxlength;

    const classes = {
      textarea: true,
      [`textarea--${this.variant}`]: true,
      [`textarea--${this.size}`]: true,
      [`textarea--resize-${this.resize}`]: !this.autoResize,
      'textarea--auto-resize': this.autoResize,
      'textarea--invalid': this.invalid,
      'textarea--success': this.success && !this.invalid,
      'textarea--loading': this.loading,
    };

    return html`
      ${this.renderFieldLabel('control')}
      <div class="textarea-wrapper" part="wrapper">
        <textarea
          id="control"
          part="textarea"
          class=${classMap(classes)}
          name=${ifDefined(this.name)}
          .value=${live(this.value)}
          placeholder=${ifDefined(this.placeholder)}
          rows=${this.rows}
          minlength=${ifDefined(this.minlength)}
          maxlength=${ifDefined(this.maxlength)}
          ?autofocus=${this.autofocus}
          ?disabled=${this.isDisabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          aria-label=${ifDefined(this.accessibleLabel)}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-invalid=${this.invalid ? 'true' : 'false'}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @blur=${this.handleBlur}
        ></textarea>

        ${
          this.loading
            ? html`
                <span class="textarea__loading" part="loading">
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
                  class="textarea__clear"
                  part="clear-button"
                  tabindex="-1"
                  aria-label="Clear textarea"
                  @click=${this.handleClear}
                >
                  <zeno-icon name="x" size="16"></zeno-icon>
                </button>
              `
            : nothing
        }
      </div>
      ${this.renderFieldError()}
      ${
        this.showCount || this.maxlength
          ? html`
              <div class="textarea__footer" part="footer">
                <span></span>
                <span
                  class=${classMap({
                    textarea__count: true,
                    'textarea__count--error': isOverLimit,
                  })}
                  part="count"
                >
                  ${this.charCount}${this.maxlength ? `/${this.maxlength}` : ''}
                </span>
              </div>
            `
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-textarea': ZenoTextarea;
  }
}

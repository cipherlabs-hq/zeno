import { html, css, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ZenoElement } from '../base/zeno-element.js';
import { FormFieldMixin, formFieldStyles } from '../mixins/form-field.js';
import type { SliderSize } from '../types.js';

/**
 * Picks a number from a range by dragging or with the arrow keys.
 *
 * @fires {CustomEvent<{ value: number }>} input - The value changed while dragging.
 * @fires {CustomEvent<{ value: number }>} change - The value was committed.
 * @csspart base
 * @csspart error
 * @csspart fill
 * @csspart label
 * @csspart marks
 * @csspart thumb
 * @csspart tooltip
 * @csspart track
 */
@customElement('zeno-slider')
export class ZenoSlider extends FormFieldMixin(ZenoElement) {
  static override styles = [
    ZenoElement.baseStyles,
    formFieldStyles,
    css`
      :host {
        --slider-height-sm: 4px;
        --slider-height-md: 6px;
        --slider-height-lg: 8px;
        --slider-thumb-size-sm: 16px;
        --slider-thumb-size-md: 20px;
        --slider-thumb-size-lg: 24px;
        --slider-track-color: var(--zeno-color-background-muted);
        --slider-fill-color: var(--zeno-color-accent-solid);
        --slider-thumb-color: var(--zeno-color-accent-solid);
        --slider-thumb-shadow: var(--zeno-shadow-sm);
        --slider-focus-ring: 0 0 0 3px var(--zeno-color-accent-subtle-hover);
        --slider-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: block;
        width: 100%;
      }

      /* Slider container */
      .slider {
        position: relative;
        width: 100%;
        padding: var(--zeno-spacing-2) 0;
      }

      /* Native range input (hidden but functional) */
      .slider__input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
      }

      /* The invisible native thumb is as wide as the drawn one, so a press
         lands on the same value the drawn thumb shows. */
      .slider__input::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: var(--slider-thumb-size);
        height: var(--slider-thumb-size);
      }

      .slider__input::-moz-range-thumb {
        width: var(--slider-thumb-size);
        height: var(--slider-thumb-size);
        border: 0;
      }

      .slider--disabled .slider__input {
        cursor: not-allowed;
      }

      /* Custom track */
      .slider__track {
        position: relative;
        width: 100%;
        height: var(--slider-height);
        background: var(--slider-track-color);
        border-radius: var(--slider-height);
      }

      /* Size variants */
      .slider--sm {
        --slider-height: var(--slider-height-sm);
        --slider-thumb-size: var(--slider-thumb-size-sm);
      }

      .slider--md {
        --slider-height: var(--slider-height-md);
        --slider-thumb-size: var(--slider-thumb-size-md);
      }

      .slider--lg {
        --slider-height: var(--slider-height-lg);
        --slider-thumb-size: var(--slider-thumb-size-lg);
      }

      /* Track fill */
      .slider__fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: var(--slider-fill-color);
        border-radius: var(--slider-height);
        transition: width var(--slider-transition);
      }

      /* Custom thumb */
      .slider__thumb {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: var(--slider-thumb-size);
        height: var(--slider-thumb-size);
        background: var(--slider-thumb-color);
        border-radius: 50%;
        box-shadow: var(--slider-thumb-shadow);
        transition: var(--slider-transition);
        cursor: pointer;
      }

      /* Hover state */
      .slider:not(.slider--disabled):hover .slider__thumb {
        transform: translate(-50%, -50%) scale(1.1);
      }

      /* Focus state */
      .slider__input:focus-visible ~ .slider__track .slider__thumb {
        box-shadow: var(--slider-thumb-shadow), var(--slider-focus-ring);
        outline: var(--zeno-focus-ring-width) solid var(--zeno-color-focus-ring);
        outline-offset: var(--zeno-focus-ring-offset);
      }

      /* Active state */
      .slider__input:active ~ .slider__track .slider__thumb {
        transform: translate(-50%, -50%) scale(0.95);
      }

      /* Disabled state */
      .slider--disabled {
        opacity: 0.5;
      }

      .slider--disabled .slider__thumb {
        cursor: not-allowed;
      }

      /* Invalid state */
      .slider--invalid .slider__fill {
        background: var(--zeno-color-danger-solid);
      }

      .slider--invalid .slider__thumb {
        background: var(--zeno-color-danger-solid);
      }

      .slider--invalid
        .slider__input:focus-visible
        ~ .slider__track
        .slider__thumb {
        box-shadow:
          var(--slider-thumb-shadow),
          0 0 0 3px var(--zeno-color-danger-subtle-hover);
      }

      /* Marks container */
      .slider__marks {
        position: relative;
        width: 100%;
        min-height: calc(
          8px + var(--zeno-spacing-1) + var(--zeno-font-size-xs) * 1.5
        );
        margin-top: var(--zeno-spacing-2);
      }

      /* Mark */
      .slider__mark {
        position: absolute;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--zeno-spacing-1);
      }

      .slider__mark-tick {
        width: 2px;
        height: 8px;
        background: var(--zeno-color-border-default);
        border-radius: 1px;
      }

      .slider__mark-label {
        font-size: var(--zeno-font-size-xs);
        color: var(--zeno-color-text-secondary);
        white-space: nowrap;
      }

      /* Tooltip */
      .slider__tooltip {
        position: absolute;
        bottom: calc(100% + var(--zeno-spacing-2));
        left: 50%;
        transform: translateX(-50%);
        padding: var(--zeno-spacing-1) var(--zeno-spacing-2);
        background: var(--zeno-color-background-inverse);
        color: var(--zeno-color-text-inverse);
        font-size: var(--zeno-font-size-sm);
        border-radius: var(--zeno-radius-sm);
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      .slider__tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid var(--zeno-color-background-inverse);
      }

      .slider:hover .slider__tooltip,
      .slider__input:focus ~ .slider__track .slider__tooltip {
        opacity: 1;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .slider__track {
          border: 1px solid ButtonText;
        }

        .slider__fill {
          background: ButtonText;
        }

        .slider__thumb {
          background: ButtonText;
          border: 2px solid ButtonFace;
        }

        .slider__input:focus-visible ~ .slider__track .slider__thumb {
          outline: 2px solid ButtonText;
          outline-offset: 2px;
          box-shadow: none;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .slider__fill,
        .slider__thumb,
        .slider__tooltip {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .slider__track {
          border: 1px solid #000;
        }

        .slider__fill {
          background: #000;
        }

        .slider__thumb {
          border: 2px solid #000;
          background: white;
          box-shadow: none;
        }
      }
    `,
  ];

  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) step = 1;
  @property({ reflect: true }) size: SliderSize = 'md';
  @property({ type: Boolean, reflect: true, attribute: 'show-tooltip' })
  showTooltip = false;
  @property({ type: Boolean, reflect: true, attribute: 'show-marks' })
  showMarks = false;
  @property({ type: Array }) marks?: Array<{ value: number; label?: string }>;
  @property({ attribute: false }) formatTooltip?: (_value: number) => string;
  @property({ attribute: false }) formatValue?: (_value: number) => string;

  @state() private isDragging = false;

  @query('.slider__input') private input!: HTMLInputElement;

  /** The value as a number. An empty value counts as the minimum. */
  private get numericValue(): number {
    const value = this.value;
    const number = Number(value);
    return value === '' ||
      value === null ||
      value === undefined ||
      isNaN(number)
      ? this.min
      : number;
  }

  private get percentage(): number {
    const span = this.max - this.min;
    return span > 0 ? ((this.numericValue - this.min) / span) * 100 : 0;
  }

  override focus(options?: FocusOptions): void {
    this.input?.focus(options);
  }

  override blur(): void {
    this.input?.blur();
  }

  // A range always has a value, so it always submits one.
  protected override formSubmitValue(): string {
    return String(this.numericValue);
  }

  protected override isEmpty(): boolean {
    return false;
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
    this.emitValueEvent('input', { value: this.numericValue });
  }

  private handleChange(): void {
    this.value = this.input.value;
    this.emitValueEvent('change', { value: this.numericValue });
  }

  private handleBlur(): void {
    this.markTouched();
  }

  /**
   * Handle mouse down
   */
  private handleMouseDown(): void {
    this.isDragging = true;
  }

  /**
   * Handle mouse up
   */
  private handleMouseUp(): void {
    this.isDragging = false;
  }

  private getFormattedValue(): string {
    return this.formatValue
      ? this.formatValue(this.numericValue)
      : String(this.numericValue);
  }

  private getTooltipValue(): string {
    return this.formatTooltip
      ? this.formatTooltip(this.numericValue)
      : String(this.numericValue);
  }

  /**
   * Generate marks
   */
  private getMarks(): Array<{
    value: number;
    label?: string;
    position: number;
  }> {
    if (!this.showMarks && !this.marks) return [];

    const marks = this.marks || [{ value: this.min }, { value: this.max }];

    return marks.map(mark => ({
      ...mark,
      position: ((mark.value - this.min) / (this.max - this.min)) * 100,
    }));
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      slider: true,
      [`slider--${this.size}`]: true,
      'slider--disabled': this.isDisabled,
      'slider--invalid': this.invalid,
      'slider--dragging': this.isDragging,
    };

    const trackStyles = {
      '--slider-percentage': `${this.percentage}%`,
    };

    // The thumb travels between half its width from each end, as the native
    // thumb does.
    const travel = `calc(var(--slider-thumb-size) / 2 + (100% - var(--slider-thumb-size)) * ${this.percentage / 100})`;
    const thumbStyles = { left: travel };

    const marks = this.getMarks();

    return html`
      ${this.renderFieldLabel('control')}
      <div
        part="base"
        class=${classMap(classes)}
        style=${styleMap(trackStyles)}
      >
        <input
          id="control"
          class="slider__input"
          type="range"
          min=${this.min}
          max=${this.max}
          step=${this.step}
          .value=${String(this.numericValue)}
          ?disabled=${this.isDisabled}
          ?required=${this.required}
          name=${ifDefined(this.name)}
          aria-label=${ifDefined(this.accessibleLabel)}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-invalid=${this.invalid ? 'true' : 'false'}
          aria-valuetext=${this.getFormattedValue()}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @blur=${this.handleBlur}
          @mousedown=${this.handleMouseDown}
          @mouseup=${this.handleMouseUp}
        />

        <div class="slider__track" part="track">
          <div
            class="slider__fill"
            part="fill"
            style=${styleMap({ width: travel })}
          ></div>

          <div
            class="slider__thumb"
            part="thumb"
            style=${styleMap(thumbStyles)}
            role="presentation"
          >
            ${
              this.showTooltip
                ? html`
                    <div class="slider__tooltip" part="tooltip">
                      ${this.getTooltipValue()}
                    </div>
                  `
                : nothing
            }
          </div>
        </div>

        ${
          marks.length > 0
            ? html`
                <div class="slider__marks" part="marks">
                  ${marks.map(
                    mark => html`
                      <div
                        class="slider__mark"
                        style=${styleMap({
                          left: `calc(var(--slider-thumb-size) / 2 + (100% - var(--slider-thumb-size)) * ${mark.position / 100})`,
                        })}
                      >
                        <div class="slider__mark-tick"></div>
                        ${
                          mark.label
                            ? html`<div class="slider__mark-label">
                                ${mark.label}
                              </div>`
                            : nothing
                        }
                      </div>
                    `
                  )}
                </div>
              `
            : nothing
        }
      </div>
      ${this.renderFieldError()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-slider': ZenoSlider;
  }
}

import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { StepperSize, StepItem } from '../types.js';

/**
 * The steps of a process and how far along it is.
 *
 * @fires {CustomEvent<{ current: number; step: StepItem }>} change - The current step changed.
 * @csspart base
 * @csspart content
 * @csspart description
 * @csspart icon
 * @csspart indicator
 * @csspart item
 * @csspart line
 * @csspart step
 * @csspart title
 */
@customElement('zeno-stepper')
export class ZenoStepper extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --stepper-step-size-sm: 24px;
        --stepper-step-size-md: 32px;
        --stepper-step-size-lg: 40px;
        --stepper-line-height: 2px;
        --stepper-line-spacing: var(--zeno-spacing-2);
        --stepper-font-size-sm: var(--zeno-font-size-sm);
        --stepper-font-size-md: var(--zeno-font-size-md);
        --stepper-font-size-lg: var(--zeno-font-size-lg);
        --stepper-color-completed: var(--zeno-color-accent-solid);
        --stepper-color-active: var(--zeno-color-accent-text);
        --stepper-color-inactive: var(--zeno-color-border-control);
        --stepper-color-error: var(--zeno-color-danger-text);
        --stepper-transition: all var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);

        display: block;
      }

      /* Stepper container */
      .stepper {
        display: flex;
        width: 100%;
      }

      /* Size variants */
      .stepper--sm {
        --stepper-step-size: var(--stepper-step-size-sm);
        font-size: var(--stepper-font-size-sm);
      }

      .stepper--md {
        --stepper-step-size: var(--stepper-step-size-md);
        font-size: var(--stepper-font-size-md);
      }

      .stepper--lg {
        --stepper-step-size: var(--stepper-step-size-lg);
        font-size: var(--stepper-font-size-lg);
      }

      /* Orientation */
      .stepper--horizontal {
        flex-direction: row;
        align-items: flex-start;
      }

      .stepper--vertical {
        flex-direction: column;
      }

      /* Step item */
      .stepper__item {
        position: relative;
        display: flex;
        flex: 1;
      }

      .stepper--horizontal .stepper__item {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .stepper--vertical .stepper__item {
        flex-direction: row;
        align-items: flex-start;
        min-height: 80px;
      }

      /* Step indicator container */
      .stepper__indicator {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .stepper--horizontal .stepper__indicator {
        width: 100%;
        margin-bottom: var(--zeno-spacing-2);
      }

      .stepper--vertical .stepper__indicator {
        flex-direction: column;
        margin-right: var(--zeno-spacing-3);
      }

      /* Step circle */
      .stepper__step {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--stepper-step-size);
        height: var(--stepper-step-size);
        background: var(--zeno-color-background-surface);
        border: 2px solid var(--stepper-color-inactive);
        border-radius: 50%;
        font-weight: var(--zeno-font-weight-medium);
        color: var(--zeno-color-text-secondary);
        transition: var(--stepper-transition);
        z-index: 1;
        cursor: pointer;
      }

      .stepper__step:hover:not(.stepper__step--disabled) {
        border-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-text);
      }

      .stepper__step:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
      }

      /* Step states */
      .stepper__step--completed {
        background: var(--stepper-color-completed);
        border-color: var(--stepper-color-completed);
        color: var(--zeno-color-accent-on-solid);
      }

      .stepper__step--active {
        border-color: var(--stepper-color-active);
        color: var(--stepper-color-active);
        box-shadow: 0 0 0 4px var(--zeno-color-accent-subtle-hover);
      }

      .stepper__step--error {
        border-color: var(--stepper-color-error);
        color: var(--stepper-color-error);
      }

      .stepper__step--disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Step icon */
      .stepper__icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Step line */
      .stepper__line {
        position: absolute;
        background: var(--stepper-color-inactive);
        transition: var(--stepper-transition);
      }

      .stepper--horizontal .stepper__line {
        top: calc(var(--stepper-step-size) / 2);
        left: calc(
          50% + var(--stepper-step-size) / 2 + var(--stepper-line-spacing)
        );
        right: calc(
          -50% + var(--stepper-step-size) / 2 + var(--stepper-line-spacing)
        );
        height: var(--stepper-line-height);
      }

      .stepper--vertical .stepper__line {
        top: calc(var(--stepper-step-size) + var(--stepper-line-spacing));
        bottom: calc(
          -100% + var(--stepper-step-size) + var(--stepper-line-spacing)
        );
        left: calc(var(--stepper-step-size) / 2);
        width: var(--stepper-line-height);
      }

      .stepper__item:last-child .stepper__line {
        display: none;
      }

      .stepper__line--completed {
        background: var(--stepper-color-completed);
      }

      /* Step content */
      .stepper__content {
        flex: 1;
        padding: 0 var(--zeno-spacing-2);
      }

      .stepper--vertical .stepper__content {
        padding-top: var(--zeno-spacing-1);
        padding-bottom: var(--zeno-spacing-4);
      }

      /* Step title */
      .stepper__title {
        margin: 0;
        font-size: inherit;
        font-weight: var(--zeno-font-weight-medium);
        color: var(--zeno-color-text-primary);
        line-height: 1.5;
      }

      .stepper__item--disabled .stepper__title {
        color: var(--zeno-color-text-tertiary);
      }

      /* Step description */
      .stepper__description {
        margin: var(--zeno-spacing-1) 0 0;
        font-size: var(--zeno-font-size-sm);
        color: var(--zeno-color-text-secondary);
        line-height: 1.5;
      }

      /* Clickable variant */
      .stepper--clickable .stepper__step {
        cursor: pointer;
      }

      .stepper--clickable .stepper__step--disabled {
        cursor: not-allowed;
      }

      /* Alternative label placement */
      .stepper--label-bottom .stepper__indicator {
        flex-direction: column-reverse;
      }

      .stepper--label-bottom .stepper__step {
        margin-top: var(--zeno-spacing-2);
        margin-bottom: 0;
      }

      /* Icon only variant */
      .stepper--icon-only .stepper__content {
        display: none;
      }

      .stepper--icon-only.stepper--horizontal .stepper__indicator {
        margin-bottom: 0;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .stepper__step {
          border-width: 3px;
        }

        .stepper__step--completed {
          border-color: ButtonText;
          background: ButtonText;
        }

        .stepper__step--active {
          outline: 2px solid ButtonText;
          outline-offset: 2px;
          box-shadow: none;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .stepper__step,
        .stepper__line {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .stepper__step {
          border-color: #000;
          color: #000;
        }

        .stepper__step--completed {
          background: #000;
          color: white;
        }

        .stepper__line {
          background: #000;
        }
      }
    `,
  ];

  @property({ type: Array }) steps: StepItem[] = [];
  @property({ type: Number }) current = 0;
  @property({ reflect: true }) orientation: 'horizontal' | 'vertical' =
    'horizontal';
  @property({ reflect: true }) size: StepperSize = 'md';
  @property({ type: Boolean, reflect: true }) clickable = false;
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) iconOnly =
    false;
  @property({ type: Boolean, reflect: true, attribute: 'label-bottom' })
  labelBottom = false;

  @state() private errorSteps = new Set<number>();

  /**
   * Go to a specific step
   */
  goToStep(index: number): void {
    if (index < 0 || index >= this.steps.length) return;

    const step = this.steps[index];
    if (step.disabled) return;

    this.current = index;
    this.emitEvent('change', { current: index, step });
  }

  /**
   * Go to next step
   */
  nextStep(): void {
    this.goToStep(this.current + 1);
  }

  /**
   * Go to previous step
   */
  previousStep(): void {
    this.goToStep(this.current - 1);
  }

  /**
   * Mark step as error
   */
  setStepError(index: number, hasError: boolean): void {
    if (hasError) {
      this.errorSteps.add(index);
    } else {
      this.errorSteps.delete(index);
    }
    this.requestUpdate();
  }

  /**
   * Handle step click
   */
  private handleStepClick(index: number): void {
    if (!this.clickable) return;
    this.goToStep(index);
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyDown(event: KeyboardEvent, index: number): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.handleStepClick(index);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.goToStep(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.goToStep(index - 1);
        break;
    }
  }

  /**
   * Get step status
   */
  private getStepStatus(
    index: number
  ): 'completed' | 'active' | 'error' | 'inactive' {
    if (this.errorSteps.has(index)) return 'error';
    if (index < this.current) return 'completed';
    if (index === this.current) return 'active';
    return 'inactive';
  }

  /**
   * Render step icon
   */
  private renderStepIcon(step: StepItem, index: number, status: string) {
    if (status === 'completed' && !step.icon) {
      return html` <zeno-icon name="check" size="16"></zeno-icon> `;
    }

    if (status === 'error' && !step.icon) {
      return html` <zeno-icon name="x" size="16"></zeno-icon> `;
    }

    if (step.icon) {
      return html` <zeno-icon name=${step.icon} size="16"></zeno-icon> `;
    }

    return html`${index + 1}`;
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      stepper: true,
      [`stepper--${this.orientation}`]: true,
      [`stepper--${this.size}`]: true,
      'stepper--clickable': this.clickable,
      'stepper--icon-only': this.iconOnly,
      'stepper--label-bottom':
        this.labelBottom && this.orientation === 'horizontal',
    };

    return html`
      <div
        class=${classMap(classes)}
        part="base"
        role="navigation"
        aria-label=${this.ariaLabel || 'Progress steps'}
      >
        ${repeat(
          this.steps,
          (step, index) => `${step.value || index}`,
          (step, index) => {
            const status = this.getStepStatus(index);
            const isCompleted = status === 'completed';
            const isActive = status === 'active';
            const isError = status === 'error';
            const isDisabled = step.disabled || false;
            const isLast = index === this.steps.length - 1;

            const stepClasses = {
              stepper__step: true,
              'stepper__step--completed': isCompleted,
              'stepper__step--active': isActive,
              'stepper__step--error': isError,
              'stepper__step--disabled': isDisabled,
            };

            const lineClasses = {
              stepper__line: true,
              'stepper__line--completed': isCompleted,
            };

            return html`
              <div class="stepper__item" part="item">
                <div class="stepper__indicator" part="indicator">
                  <button
                    class=${classMap(stepClasses)}
                    part="step"
                    type="button"
                    role="tab"
                    aria-current=${isActive ? 'step' : nothing}
                    aria-selected=${isActive ? 'true' : 'false'}
                    aria-label=${step.label}
                    ?disabled=${isDisabled || !this.clickable}
                    @click=${() => this.handleStepClick(index)}
                    @keydown=${(e: KeyboardEvent) =>
                      this.handleKeyDown(e, index)}
                  >
                    <span class="stepper__icon" part="icon">
                      ${this.renderStepIcon(step, index, status)}
                    </span>
                  </button>
                  ${
                    !isLast
                      ? html`<div
                          class=${classMap(lineClasses)}
                          part="line"
                        ></div>`
                      : nothing
                  }
                </div>

                ${
                  !this.iconOnly
                    ? html`
                        <div class="stepper__content" part="content">
                          <h3 class="stepper__title" part="title">
                            ${step.label}
                          </h3>
                          ${
                            step.description
                              ? html`
                                  <p
                                    class="stepper__description"
                                    part="description"
                                  >
                                    ${step.description}
                                  </p>
                                `
                              : nothing
                          }
                        </div>
                      `
                    : nothing
                }
              </div>
            `;
          }
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-stepper': ZenoStepper;
  }
}

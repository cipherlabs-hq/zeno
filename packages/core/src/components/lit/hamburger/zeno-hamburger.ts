import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { HamburgerSize, HamburgerVariant } from '../types.js';

/**
 * The three-line button that opens and closes a menu.
 *
 * @fires {CustomEvent<{ active: boolean }>} toggle - The button was toggled.
 * @csspart base
 * @csspart box
 */
@customElement('zeno-hamburger')
export class ZenoHamburger extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --hamburger-size-sm: 24px;
        --hamburger-size-md: 32px;
        --hamburger-size-lg: 40px;
        --hamburger-bar-height: 2px;
        --hamburger-bar-spacing: 6px;
        --hamburger-color: var(--zeno-color-text-primary);
        --hamburger-hover-color: var(--zeno-color-accent-text);
        --hamburger-transition: all var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);

        display: inline-block;
      }

      /* Button base */
      .hamburger {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--hamburger-size);
        height: var(--hamburger-size);
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: var(--hamburger-transition);
        border-radius: var(--zeno-radius-sm);
      }

      /* Size variants */
      .hamburger--sm {
        --hamburger-size: var(--hamburger-size-sm);
        --hamburger-bar-height: 2px;
        --hamburger-bar-spacing: 4px;
      }

      .hamburger--md {
        --hamburger-size: var(--hamburger-size-md);
      }

      .hamburger--lg {
        --hamburger-size: var(--hamburger-size-lg);
        --hamburger-bar-height: 3px;
        --hamburger-bar-spacing: 8px;
      }

      /* Hover state */
      .hamburger:hover {
        background: var(--zeno-color-background-hover);
      }

      .hamburger:hover .hamburger__box {
        color: var(--hamburger-hover-color);
      }

      /* Focus state */
      .hamburger:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
      }

      /* Active state */
      .hamburger:active {
        transform: scale(0.95);
      }

      /* Disabled state */
      .hamburger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Hamburger box */
      .hamburger__box {
        position: relative;
        display: inline-block;
        width: calc(var(--hamburger-size) * 0.6);
        height: calc(
          var(--hamburger-bar-height) * 3 + var(--hamburger-bar-spacing) * 2
        );
        color: var(--hamburger-color);
        transition: var(--hamburger-transition);
      }

      /* Hamburger bars */
      .hamburger__bar {
        position: absolute;
        left: 0;
        width: 100%;
        height: var(--hamburger-bar-height);
        background: currentColor;
        transition: var(--hamburger-transition);
        transform-origin: center;
      }

      .hamburger__bar--top {
        top: 0;
      }

      .hamburger__bar--middle {
        top: calc(var(--hamburger-bar-height) + var(--hamburger-bar-spacing));
      }

      .hamburger__bar--bottom {
        bottom: 0;
      }

      /* Default variant (basic) animations */
      .hamburger--basic.hamburger--active .hamburger__bar--top {
        transform: translateY(
            calc(var(--hamburger-bar-height) + var(--hamburger-bar-spacing))
          )
          rotate(45deg);
      }

      .hamburger--basic.hamburger--active .hamburger__bar--middle {
        opacity: 0;
        transform: scaleX(0);
      }

      .hamburger--basic.hamburger--active .hamburger__bar--bottom {
        transform: translateY(
            calc(
              -1 * (var(--hamburger-bar-height) + var(--hamburger-bar-spacing))
            )
          )
          rotate(-45deg);
      }

      /* Spin variant animations */
      .hamburger--spin .hamburger__box {
        transition-duration: var(--zeno-motion-duration-md);
      }

      .hamburger--spin.hamburger--active .hamburger__box {
        transform: rotate(180deg);
      }

      .hamburger--spin.hamburger--active .hamburger__bar--top {
        transform: translateY(
            calc(var(--hamburger-bar-height) + var(--hamburger-bar-spacing))
          )
          rotate(45deg);
      }

      .hamburger--spin.hamburger--active .hamburger__bar--middle {
        opacity: 0;
        transform: rotate(90deg);
      }

      .hamburger--spin.hamburger--active .hamburger__bar--bottom {
        transform: translateY(
            calc(
              -1 * (var(--hamburger-bar-height) + var(--hamburger-bar-spacing))
            )
          )
          rotate(-45deg);
      }

      /* Squeeze variant animations */
      .hamburger--squeeze .hamburger__bar {
        transition-duration: 0.075s;
      }

      .hamburger--squeeze .hamburger__bar--top {
        transition: transform 0.075s 0.12s
          cubic-bezier(0.55, 0.055, 0.675, 0.19);
      }

      .hamburger--squeeze .hamburger__bar--bottom {
        transition: transform 0.075s 0.12s
          cubic-bezier(0.55, 0.055, 0.675, 0.19);
      }

      .hamburger--squeeze.hamburger--active .hamburger__bar--top {
        transform: translateY(
            calc(var(--hamburger-bar-height) + var(--hamburger-bar-spacing))
          )
          rotate(45deg);
        transition: transform 0.075s cubic-bezier(0.215, 0.61, 0.355, 1);
      }

      .hamburger--squeeze.hamburger--active .hamburger__bar--middle {
        opacity: 0;
        transform: rotate(90deg);
      }

      .hamburger--squeeze.hamburger--active .hamburger__bar--bottom {
        transform: translateY(
            calc(
              -1 * (var(--hamburger-bar-height) + var(--hamburger-bar-spacing))
            )
          )
          rotate(-45deg);
        transition: transform 0.075s cubic-bezier(0.215, 0.61, 0.355, 1);
      }

      /* Vortex variant animations */
      .hamburger--vortex .hamburger__bar {
        transition: transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      }

      .hamburger--vortex.hamburger--active .hamburger__bar--top {
        transform: translateY(
            calc(var(--hamburger-bar-height) + var(--hamburger-bar-spacing))
          )
          rotate(765deg);
      }

      .hamburger--vortex.hamburger--active .hamburger__bar--middle {
        opacity: 0;
        transform: scale(0.1) rotate(180deg);
      }

      .hamburger--vortex.hamburger--active .hamburger__bar--bottom {
        transform: translateY(
            calc(
              -1 * (var(--hamburger-bar-height) + var(--hamburger-bar-spacing))
            )
          )
          rotate(-765deg);
      }

      /* Elastic variant animations */
      .hamburger--elastic .hamburger__bar--top {
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .hamburger--elastic .hamburger__bar--middle {
        transition: opacity 0.3s ease;
      }

      .hamburger--elastic .hamburger__bar--bottom {
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .hamburger--elastic.hamburger--active .hamburger__bar--top {
        transform: translateY(
            calc(var(--hamburger-bar-height) + var(--hamburger-bar-spacing))
          )
          rotate(135deg);
      }

      .hamburger--elastic.hamburger--active .hamburger__bar--middle {
        opacity: 0;
      }

      .hamburger--elastic.hamburger--active .hamburger__bar--bottom {
        transform: translateY(
            calc(
              -1 * (var(--hamburger-bar-height) + var(--hamburger-bar-spacing))
            )
          )
          rotate(-135deg);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .hamburger:hover {
          outline: 1px solid ButtonText;
        }

        .hamburger:focus-visible {
          outline-width: 3px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .hamburger,
        .hamburger__box,
        .hamburger__bar {
          transition: none !important;
        }

        .hamburger--active .hamburger__bar--middle {
          display: none;
        }
      }

      /* Print styles */
      @media print {
        .hamburger {
          display: none;
        }
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) active = false;
  @property({ reflect: true }) variant: HamburgerVariant = 'basic';
  @property({ reflect: true }) size: HamburgerSize = 'md';
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Toggle active state
   */
  toggle(): void {
    if (this.disabled) return;

    this.active = !this.active;
    this.emitEvent('toggle', { active: this.active });
  }

  /**
   * Handle click
   */
  private handleClick(): void {
    this.toggle();
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    }
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      hamburger: true,
      [`hamburger--${this.variant}`]: true,
      [`hamburger--${this.size}`]: true,
      'hamburger--active': this.active,
    };

    return html`
      <button
        class=${classMap(classes)}
        part="base"
        type="button"
        aria-label=${
          this.ariaLabel || (this.active ? 'Close menu' : 'Open menu')
        }
        aria-pressed=${this.active ? 'true' : 'false'}
        ?disabled=${this.disabled}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <span class="hamburger__box" part="box">
          <span
            class="hamburger__bar hamburger__bar--top"
            part="bar bar-top"
          ></span>
          <span
            class="hamburger__bar hamburger__bar--middle"
            part="bar bar-middle"
          ></span>
          <span
            class="hamburger__bar hamburger__bar--bottom"
            part="bar bar-bottom"
          ></span>
        </span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-hamburger': ZenoHamburger;
  }
}

import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { ComponentSize } from '../types.js';

/**
 * A compact label for a choice, filter or attribute. It can be clickable and
 * removable.
 *
 * @slot - The label.
 * @slot prefix - An icon or avatar before the label.
 * @fires {CustomEvent} remove - The remove button was pressed.
 * @csspart base
 * @csspart label
 * @csspart prefix
 * @csspart remove
 */
@customElement('zeno-chip')
export class ZenoChip extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --chip-height: var(--zeno-spacing-8);
        --chip-padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
        --chip-font-size: var(--zeno-font-size-sm);
        --chip-border-radius: var(--zeno-radius-full);
        --chip-gap: var(--zeno-spacing-1-5);

        display: inline-flex;
        vertical-align: middle;
      }

      /* Size variants */
      :host([size='xs']) {
        --chip-height: var(--zeno-spacing-6);
        --chip-padding: var(--zeno-spacing-1) var(--zeno-spacing-2);
        --chip-font-size: var(--zeno-font-size-xs);
        --chip-gap: var(--zeno-spacing-1);
      }

      :host([size='sm']) {
        --chip-height: var(--zeno-spacing-7);
        --chip-padding: var(--zeno-spacing-1-5) var(--zeno-spacing-2-5);
        --chip-font-size: var(--zeno-font-size-sm);
        --chip-gap: var(--zeno-spacing-1);
      }

      :host([size='lg']) {
        --chip-height: var(--zeno-spacing-9);
        --chip-padding: var(--zeno-spacing-2-5) var(--zeno-spacing-3-5);
        --chip-font-size: var(--zeno-font-size-md);
        --chip-gap: var(--zeno-spacing-2);
      }

      /* Chip container */
      .chip {
        display: inline-flex;
        align-items: center;
        gap: var(--chip-gap);
        height: var(--chip-height);
        padding: var(--chip-padding);
        border-radius: var(--chip-border-radius);
        font-size: var(--chip-font-size);
        font-weight: var(--zeno-font-weight-medium);
        line-height: 1;
        white-space: nowrap;
        cursor: default;
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        position: relative;
        overflow: hidden;
      }

      /* Clickable state */
      .chip--clickable {
        cursor: pointer;
      }

      .chip--clickable:hover {
        transform: translateY(-1px);
        box-shadow: var(--zeno-shadow-xs);
      }

      .chip--clickable:active {
        transform: translateY(0);
        box-shadow: none;
      }

      /* Variants */
      .chip--filled {
        background-color: var(--zeno-color-neutral-solid);
        color: var(--zeno-color-neutral-on-solid);
        border: 1px solid transparent;
      }

      .chip--filled.chip--primary {
        background-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
      }

      .chip--filled.chip--accent {
        background-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
      }

      .chip--filled.chip--success {
        background-color: var(--zeno-color-success-solid);
        color: var(--zeno-color-success-on-solid);
      }

      .chip--filled.chip--warning {
        background-color: var(--zeno-color-warning-solid);
        color: var(--zeno-color-warning-on-solid);
      }

      .chip--filled.chip--danger {
        background-color: var(--zeno-color-danger-solid);
        color: var(--zeno-color-danger-on-solid);
      }

      /* Outlined variant */
      .chip--outlined {
        background-color: transparent;
        color: var(--zeno-color-text-primary);
        border: 1px solid var(--zeno-color-border-default);
      }

      .chip--outlined.chip--primary {
        color: var(--zeno-color-accent-text);
        border-color: var(--zeno-color-accent-solid);
      }

      .chip--outlined.chip--accent {
        color: var(--zeno-color-accent-text);
        border-color: var(--zeno-color-accent-solid);
      }

      .chip--outlined.chip--success {
        color: var(--zeno-color-success-text);
        border-color: var(--zeno-color-success-solid);
      }

      .chip--outlined.chip--warning {
        color: var(--zeno-color-warning-text);
        border-color: var(--zeno-color-warning-solid);
      }

      .chip--outlined.chip--danger {
        color: var(--zeno-color-danger-text);
        border-color: var(--zeno-color-danger-solid);
      }

      /* Subtle variant */
      .chip--subtle {
        background-color: var(--zeno-color-neutral-subtle);
        color: var(--zeno-color-text-primary);
        border: 1px solid transparent;
      }

      .chip--subtle.chip--primary {
        background-color: var(--zeno-color-accent-subtle);
        color: var(--zeno-color-accent-text);
      }

      .chip--subtle.chip--accent {
        background-color: var(--zeno-color-accent-subtle);
        color: var(--zeno-color-accent-text);
      }

      .chip--subtle.chip--success {
        background-color: var(--zeno-color-success-subtle);
        color: var(--zeno-color-success-text);
      }

      .chip--subtle.chip--warning {
        background-color: var(--zeno-color-warning-subtle);
        color: var(--zeno-color-warning-text);
      }

      .chip--subtle.chip--danger {
        background-color: var(--zeno-color-danger-subtle);
        color: var(--zeno-color-danger-text);
      }

      /* Selected state */
      .chip--selected {
        background-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
        border-color: var(--zeno-color-accent-solid);
      }

      /* Disabled state */
      .chip--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Icon slots */
      .chip__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.25em;
        height: 1.25em;
        flex-shrink: 0;
      }

      ::slotted(svg),
      ::slotted(zeno-icon) {
        width: 100%;
        height: 100%;
      }

      /* Remove button */
      .chip__remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.25em;
        height: 1.25em;
        margin: calc(var(--zeno-spacing-1) * -1);
        margin-left: var(--zeno-spacing-1);
        padding: 0;
        border: none;
        background: none;
        color: currentColor;
        cursor: pointer;
        border-radius: var(--zeno-radius-sm);
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        flex-shrink: 0;
      }

      .chip__remove:hover {
        background-color: color-mix(in srgb, currentColor 12%, transparent);
      }

      .chip__remove:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: -2px;
      }

      .chip--filled .chip__remove:hover {
        background-color: color-mix(in srgb, currentColor 12%, transparent);
      }

      /* Label */
      .chip__label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .chip {
          border: 1px solid ButtonText;
        }

        .chip--filled {
          background-color: ButtonText;
          color: ButtonFace;
        }

        .chip--outlined,
        .chip--subtle {
          background-color: ButtonFace;
          color: ButtonText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .chip {
          transition: none;
        }

        .chip--clickable:hover {
          transform: none;
        }
      }
    `,
  ];

  @property({ reflect: true }) variant: 'filled' | 'outlined' | 'subtle' =
    'filled';
  @property({ reflect: true }) color:
    'primary' | 'accent' | 'success' | 'warning' | 'danger' = 'primary';
  @property({ reflect: true }) size: ComponentSize = 'md';
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) removable = false;
  @property({ type: Boolean }) clickable = false;
  @property() label?: string;
  @property() removeLabel = 'Remove';

  /**
   * Handle remove button click
   */
  private handleRemove(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) return;

    this.emitEvent('remove');
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      chip: true,
      [`chip--${this.variant}`]: true,
      [`chip--${this.color}`]:
        this.variant !== 'outlined' || this.color !== 'primary',
      'chip--selected': this.selected,
      'chip--disabled': this.disabled,
      'chip--clickable': this.clickable && !this.disabled,
    };

    return html`
      <div
        part="base"
        class=${classMap(classes)}
        role=${this.clickable ? 'button' : nothing}
        aria-pressed=${this.clickable ? String(this.selected) : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
        aria-label=${this.ariaLabel || this.label || nothing}
        tabindex=${this.clickable && !this.disabled ? '0' : nothing}
        @keydown=${this.handleKeyDown}
      >
        ${
          this.hasSlot('prefix')
            ? html`
                <span part="prefix" class="chip__icon chip__prefix">
                  <slot name="prefix"></slot>
                </span>
              `
            : nothing
        }

        <span part="label" class="chip__label">
          ${this.label || html`<slot></slot>`}
        </span>

        ${
          this.removable && !this.disabled
            ? html`
                <button
                  part="remove"
                  class="chip__remove"
                  type="button"
                  aria-label=${this.removeLabel}
                  @click=${this.handleRemove}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              `
            : nothing
        }
      </div>
    `;
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.clickable || this.disabled) return;

    // Only for the element itself: a key pressed in something inside it,
    // such as a button, belongs to that control.
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // A real click, so that listeners get the same event as from a pointer.
      (event.currentTarget as HTMLElement).click();
    }
  }

  /**
   * Check if a slot has content
   */
  private hasSlot(name: string): boolean {
    const slot = this.shadowRoot?.querySelector(
      `slot[name="${name}"]`
    ) as HTMLSlotElement;
    return slot ? slot.assignedNodes({ flatten: true }).length > 0 : false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-chip': ZenoChip;
  }
}

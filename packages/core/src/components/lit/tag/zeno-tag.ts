import { html, css, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { ComponentSize } from '../types.js';

/**
 * A small label for a category or status.
 *
 * @slot - The label.
 * @slot prefix - An icon before the label.
 * @fires {CustomEvent} close - The close button was pressed.
 * @csspart base
 * @csspart close
 * @csspart dot
 * @csspart label
 * @csspart prefix
 */
@customElement('zeno-tag')
export class ZenoTag extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --tag-height: var(--zeno-spacing-7);
        --tag-padding: var(--zeno-spacing-1) var(--zeno-spacing-2);
        --tag-font-size: var(--zeno-font-size-xs);
        --tag-border-radius: var(--zeno-radius-sm);
        --tag-gap: var(--zeno-spacing-1);

        display: inline-flex;
        vertical-align: middle;
      }

      /* Size variants */
      :host([size='xs']) {
        --tag-height: var(--zeno-spacing-5);
        --tag-padding: 0 var(--zeno-spacing-1-5);
        --tag-font-size: var(--zeno-font-size-2xs);
      }

      :host([size='sm']) {
        --tag-height: var(--zeno-spacing-6);
        --tag-padding: var(--zeno-spacing-0-5) var(--zeno-spacing-1-5);
        --tag-font-size: var(--zeno-font-size-xs);
      }

      :host([size='lg']) {
        --tag-height: var(--zeno-spacing-8);
        --tag-padding: var(--zeno-spacing-1-5) var(--zeno-spacing-2-5);
        --tag-font-size: var(--zeno-font-size-sm);
        --tag-gap: var(--zeno-spacing-1-5);
      }

      /* Tag container */
      .tag {
        display: inline-flex;
        align-items: center;
        gap: var(--tag-gap);
        height: var(--tag-height);
        padding: var(--tag-padding);
        border-radius: var(--tag-border-radius);
        font-size: var(--tag-font-size);
        font-weight: var(--zeno-font-weight-medium);
        line-height: 1;
        white-space: nowrap;
        text-decoration: none;
        cursor: default;
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        position: relative;
        overflow: hidden;
        border: 1px solid transparent;
      }

      /* Link variant */
      a.tag {
        cursor: pointer;
      }

      a.tag:hover {
        transform: translateY(-1px);
        box-shadow: var(--zeno-shadow-xs);
      }

      a.tag:active {
        transform: translateY(0);
        box-shadow: none;
      }

      /* Color variants */
      .tag__prefix[hidden] {
        display: none;
      }

      .tag--default {
        background-color: var(--zeno-color-neutral-subtle);
        color: var(--zeno-color-text-primary);
      }

      .tag--primary {
        background-color: var(--zeno-color-accent-subtle);
        color: var(--zeno-color-accent-text);
      }

      .tag--secondary {
        background-color: var(--zeno-color-neutral-subtle);
        color: var(--zeno-color-neutral-text);
      }

      .tag--accent {
        background-color: var(--zeno-color-accent-subtle);
        color: var(--zeno-color-accent-text);
      }

      .tag--success {
        background-color: var(--zeno-color-success-subtle);
        color: var(--zeno-color-success-text);
      }

      .tag--warning {
        background-color: var(--zeno-color-warning-subtle);
        color: var(--zeno-color-warning-text);
      }

      .tag--danger {
        background-color: var(--zeno-color-danger-subtle);
        color: var(--zeno-color-danger-text);
      }

      .tag--info {
        background-color: var(--zeno-color-info-subtle);
        color: var(--zeno-color-info-text);
      }

      /* Solid variant */
      .tag--solid.tag--default {
        background-color: var(--zeno-color-neutral-solid);
        color: var(--zeno-color-neutral-on-solid);
      }

      .tag--solid.tag--primary {
        background-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
      }

      .tag--solid.tag--secondary {
        background-color: var(--zeno-color-neutral-solid);
        color: var(--zeno-color-neutral-on-solid);
      }

      .tag--solid.tag--accent {
        background-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
      }

      .tag--solid.tag--success {
        background-color: var(--zeno-color-success-solid);
        color: var(--zeno-color-success-on-solid);
      }

      .tag--solid.tag--warning {
        background-color: var(--zeno-color-warning-solid);
        color: var(--zeno-color-warning-on-solid);
      }

      .tag--solid.tag--danger {
        background-color: var(--zeno-color-danger-solid);
        color: var(--zeno-color-danger-on-solid);
      }

      .tag--solid.tag--info {
        background-color: var(--zeno-color-info-solid);
        color: var(--zeno-color-info-on-solid);
      }

      /* Bordered modifier */
      .tag--bordered {
        border-color: currentColor;
      }

      .tag--bordered.tag--default {
        border-color: var(--zeno-color-border-default);
      }

      /* Shape variants */
      .tag--rounded {
        border-radius: var(--zeno-radius-full);
      }

      .tag--square {
        border-radius: 0;
      }

      /* Icon slots */
      .tag__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1em;
        height: 1em;
        flex-shrink: 0;
      }

      ::slotted(svg),
      ::slotted(zeno-icon) {
        width: 100%;
        height: 100%;
      }

      /* Close button */
      .tag__close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1em;
        height: 1em;
        margin: -0.25em -0.25em -0.25em 0.25em;
        padding: 0;
        border: none;
        background: none;
        color: currentColor;
        cursor: pointer;
        border-radius: var(--zeno-radius-xs);
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        flex-shrink: 0;
        opacity: 0.7;
      }

      .tag__close:hover {
        opacity: 1;
        background-color: color-mix(in srgb, currentColor 12%, transparent);
      }

      .tag__close:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: -2px;
      }

      .tag--solid .tag__close:hover {
        background-color: color-mix(in srgb, currentColor 12%, transparent);
      }

      /* Dot indicator */
      .tag__dot {
        width: 0.5em;
        height: 0.5em;
        border-radius: var(--zeno-radius-full);
        background-color: currentColor;
        flex-shrink: 0;
      }

      /* Label */
      .tag__label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .tag {
          border: 1px solid ButtonText;
        }

        .tag--solid {
          background-color: ButtonText;
          color: ButtonFace;
        }

        .tag:not(.tag--solid) {
          background-color: ButtonFace;
          color: ButtonText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .tag,
        a.tag {
          transition: none;
        }

        a.tag:hover {
          transform: none;
        }
      }
    `,
  ];

  @property({ reflect: true }) variant:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info' = 'default';
  @property({ type: Boolean, reflect: true }) solid = false;
  @property({ type: Boolean, reflect: true }) bordered = false;
  @property({ reflect: true }) shape: 'default' | 'rounded' | 'square' =
    'default';
  @property({ reflect: true }) size: ComponentSize = 'md';
  @property({ type: Boolean, reflect: true }) closable = false;
  @property({ type: Boolean }) dot = false;
  @property() href?: string;
  @property() target?: string;
  @property() rel?: string;
  @property({ attribute: 'close-label' }) closeLabel = 'Remove tag';

  @state() private hasPrefix = false;

  /**
   * Handle close button click
   */
  private handleClose(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.emitEvent('close');
  }

  /**
   * Render the component
   */
  override render() {
    // The shape goes first: with the default shape its key would be
    // `tag--default`, the same as the default variant's, and switch it off.
    const classes = {
      ...(this.shape !== 'default' ? { [`tag--${this.shape}`]: true } : {}),
      tag: true,
      [`tag--${this.variant}`]: true,
      'tag--solid': this.solid,
      'tag--bordered': this.bordered,
    };

    const content = html`
      ${this.dot ? html`<span part="dot" class="tag__dot"></span>` : nothing}
      <span
        part="prefix"
        class="tag__icon tag__prefix"
        ?hidden=${!this.hasPrefix}
      >
        <slot name="prefix" @slotchange=${this.handlePrefixChange}></slot>
      </span>
      <span part="label" class="tag__label">
        <slot></slot>
      </span>
      ${
        this.closable
          ? html`
              <button
                part="close"
                class="tag__close"
                type="button"
                aria-label=${this.closeLabel}
                @click=${this.handleClose}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M8 4L4 8M4 4L8 8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            `
          : nothing
      }
    `;

    if (this.href) {
      return html`
        <a
          part="base"
          class=${classMap(classes)}
          href=${this.href}
          target=${ifDefined(this.target)}
          rel=${ifDefined(this.rel)}
          aria-label=${this.ariaLabel || nothing}
          >${content}</a
        >
      `;
    }

    return html`
      <span part="base" class=${classMap(classes)}>${content}</span>
    `;
  }

  private handlePrefixChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    this.hasPrefix = slot.assignedNodes({ flatten: true }).length > 0;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-tag': ZenoTag;
  }
}

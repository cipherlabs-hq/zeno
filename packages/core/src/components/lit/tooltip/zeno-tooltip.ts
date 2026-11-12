import { html, css, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ZenoElement } from '../base/zeno-element.js';
import { isPopoverOpen } from '../base/anchored-popover.js';
import type { TooltipPlacement } from '../types.js';

const GAP = 8;
const EDGE = 4;
const LEAVE_DELAY = 100;

type Side = 'top' | 'bottom' | 'left' | 'right';

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * A short text description that appears when the slotted element is hovered or
 * focused. Built on a native popover.
 *
 * @slot - The element the tooltip describes.
 * @fires {CustomEvent} show - The tooltip appeared.
 * @fires {CustomEvent} hide - The tooltip went away.
 * @csspart tooltip - The bubble.
 */
@customElement('zeno-tooltip')
export class ZenoTooltip extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --tooltip-background: var(--zeno-color-background-inverse);
        --tooltip-color: var(--zeno-color-text-inverse);
        --tooltip-max-width: 16rem;

        display: inline-block;
      }

      /* A disabled tooltip is only switched off. What it wraps still works. */
      :host([disabled]) {
        cursor: auto;
        pointer-events: auto;
      }

      .tooltip {
        position: fixed;
        inset: auto;
        margin: 0;
        padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
        border: 0;
        border-radius: var(--zeno-radius-md);
        max-width: min(var(--tooltip-max-width), calc(100vw - 8px));
        overflow: visible;
        background: var(--tooltip-background);
        color: var(--tooltip-color);
        box-shadow: var(--zeno-shadow-sm);
        font-size: var(--zeno-font-size-sm);
        line-height: var(--zeno-font-line-height-normal);
        overflow-wrap: break-word;
      }

      @media (forced-colors: active) {
        .tooltip {
          border: 1px solid CanvasText;
        }
      }
    `,
  ];

  /** The text of the tooltip. */
  @property() content = '';

  /** The preferred side. The tooltip moves to the other side when it would not fit. */
  @property({ reflect: true }) placement: TooltipPlacement = 'top';

  /** How long the pointer rests on the element before the tooltip shows, in ms. */
  @property({ type: Number }) delay = 200;

  /** Turns the tooltip off. The wrapped element is not affected. */
  @property({ type: Boolean }) disabled = false;

  @state() private isOpen = false;

  @query('.tooltip') private bubble!: HTMLElement;

  private timer?: number;
  private described?: Element;

  constructor() {
    super();
    this.addEventListener('pointerenter', () => this.show());
    this.addEventListener('pointerleave', () => this.hide());
    this.addEventListener('focusin', event => {
      // Keyboard focus only: a click should not leave a tooltip behind.
      const target = event.target as Element;
      if (target.matches(':focus-visible')) this.show(0);
    });
    this.addEventListener('focusout', () => this.hide(0));
  }

  /** Shows the tooltip after `delay` milliseconds. */
  show(delay = this.delay): void {
    window.clearTimeout(this.timer);
    if (this.disabled || !this.content || this.isOpen) return;
    this.timer = window.setTimeout(() => this.reveal(), delay);
  }

  /** Hides the tooltip, after a moment by default so the pointer can reach it. */
  hide(delay = LEAVE_DELAY): void {
    window.clearTimeout(this.timer);
    if (!this.isOpen) return;
    this.timer = window.setTimeout(() => this.conceal(), delay);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.timer);
    this.conceal();
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('content') || changedProperties.has('disabled')) {
      this.describe();
      if (this.isOpen && (this.disabled || !this.content)) this.conceal();
    }
  }

  override render() {
    return html`
      <slot @slotchange=${this.describe}></slot>
      <div class="tooltip" part="tooltip" popover="manual" aria-hidden="true">
        ${this.content}
      </div>
    `;
  }

  private get anchor(): Element {
    const slot = this.shadowRoot?.querySelector('slot');
    return slot?.assignedElements({ flatten: true })[0] ?? this;
  }

  /**
   * Gives the wrapped element the text as its description. A reference
   * cannot cross the shadow boundary, so the text itself is set.
   */
  private describe = (): void => {
    const target = this.anchor === this ? undefined : this.anchor;
    const text = this.disabled ? '' : this.content;
    if (this.described && this.described !== target) {
      this.described.removeAttribute('aria-description');
    }
    this.described = target;
    if (!target) return;
    if (text) {
      target.setAttribute('aria-description', text);
    } else {
      target.removeAttribute('aria-description');
    }
  };

  private reveal(): void {
    if (this.isOpen || !this.isConnected || !this.bubble) return;
    this.isOpen = true;
    this.bubble.showPopover?.();
    this.position();
    document.addEventListener('keydown', this.handleKeyDown, true);
    window.addEventListener('scroll', this.handleScroll, true);
    this.emitEvent('show');
  }

  private conceal(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    if (isPopoverOpen(this.bubble)) this.bubble.hidePopover();
    document.removeEventListener('keydown', this.handleKeyDown, true);
    window.removeEventListener('scroll', this.handleScroll, true);
    this.emitEvent('hide');
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      window.clearTimeout(this.timer);
      this.conceal();
    }
  };

  private handleScroll = (): void => {
    window.clearTimeout(this.timer);
    this.conceal();
  };

  private position(): void {
    const anchor = this.anchor.getBoundingClientRect();
    const bubble = this.bubble.getBoundingClientRect();
    const [preferred, align = 'center'] = this.placement.split('-') as [
      Side,
      string?,
    ];
    const room: Record<Side, number> = {
      top: anchor.top,
      bottom: window.innerHeight - anchor.bottom,
      left: anchor.left,
      right: window.innerWidth - anchor.right,
    };
    const vertical = preferred === 'top' || preferred === 'bottom';
    const needed = (vertical ? bubble.height : bubble.width) + GAP;
    const side =
      room[preferred] < needed && room[OPPOSITE[preferred]] > room[preferred]
        ? OPPOSITE[preferred]
        : preferred;

    let top: number;
    let left: number;
    if (side === 'top' || side === 'bottom') {
      top =
        side === 'top' ? anchor.top - bubble.height - GAP : anchor.bottom + GAP;
      if (align === 'start') {
        left = anchor.left;
      } else if (align === 'end') {
        left = anchor.right - bubble.width;
      } else {
        left = anchor.left + (anchor.width - bubble.width) / 2;
      }
    } else {
      left =
        side === 'left' ? anchor.left - bubble.width - GAP : anchor.right + GAP;
      top = anchor.top + (anchor.height - bubble.height) / 2;
    }

    const maxLeft = window.innerWidth - bubble.width - EDGE;
    const maxTop = window.innerHeight - bubble.height - EDGE;
    this.bubble.style.left = `${clamp(left, EDGE, Math.max(EDGE, maxLeft))}px`;
    this.bubble.style.top = `${clamp(top, EDGE, Math.max(EDGE, maxTop))}px`;
    this.bubble.dataset.side = side;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-tooltip': ZenoTooltip;
  }
}

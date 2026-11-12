import { html, css, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ZenoElement } from '../base/zeno-element.js';
// Elements this one renders, so that importing it alone is enough.
import '../icon/zeno-icon.js';
import { AnchoredPopover } from '../base/anchored-popover.js';

/**
 * A small button that opens a note on click, tap, Enter or Space. Unlike a
 * tooltip it works on touch screens and the note can hold links.
 *
 * @slot - The note.
 * @slot icon - The button's icon, in place of the information icon.
 * @fires {CustomEvent} open - The note opened.
 * @fires {CustomEvent} close - The note closed.
 * @csspart button
 * @csspart content
 */
@customElement('zeno-toggletip')
export class ZenoToggletip extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        display: inline-flex;
        vertical-align: middle;
      }

      .toggletip__button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: 0;
        border-radius: var(--zeno-radius-sm);
        background: transparent;
        color: var(--zeno-color-text-secondary);
        cursor: pointer;
      }

      .toggletip__button:hover,
      .toggletip__button[aria-expanded='true'] {
        background: var(--zeno-color-background-hover);
        color: var(--zeno-color-text-primary);
      }

      .toggletip__button zeno-icon {
        --icon-size: 16px;
      }

      /* The note is a popover, so it sits in the top layer and no ancestor
         can clip it. Its place is set from the button. */
      .toggletip__content {
        position: fixed;
        inset: auto;
        box-sizing: border-box;
        max-width: min(18rem, calc(100vw - 16px));
        margin: 0;
        padding: var(--zeno-spacing-3) var(--zeno-spacing-4);
        border: 1px solid var(--zeno-color-border-default);
        border-radius: var(--zeno-radius-md);
        /* The page surface, not an inverse colour, so that links in the note
           keep the contrast they have on the page. */
        background: var(--zeno-color-background-surface);
        color: var(--zeno-color-text-primary);
        box-shadow: var(--zeno-shadow-lg);
        font-family: var(--zeno-font-family-sans);
        font-size: var(--zeno-font-size-sm);
        line-height: var(--zeno-font-line-height-normal);
        z-index: var(--zeno-z-index-popover);
      }

      .toggletip__content:not(:popover-open) {
        display: none;
      }

      ::slotted(p) {
        margin: 0;
      }

      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
      }

      @media (forced-colors: active) {
        .toggletip__content {
          border-color: CanvasText;
        }
      }
    `,
  ];

  /** The name of the button, such as “Why there is no score”. */
  @property() label = 'More information';
  /** True while the note shows. */
  @property({ type: Boolean, reflect: true }) open = false;

  @state() private announcement = '';

  @query('.toggletip__button') private button!: HTMLButtonElement;
  @query('.toggletip__content') private content!: HTMLElement;

  private overlay = new AnchoredPopover(this, {
    anchor: () => this.button,
    popover: () => this.content,
    onOutsidePress: () => this.hide(),
  });

  constructor() {
    super();
    this.addEventListener('focusout', this.handleFocusOut);
  }

  /** Opens the note. */
  show(): void {
    this.open = true;
  }

  /** Closes the note. */
  hide(): void {
    this.open = false;
  }

  toggle(): void {
    this.open = !this.open;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.overlay.hide();
    document.removeEventListener('keydown', this.handleKeyDown, true);
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (!changed.has('open')) return;
    if (this.open && !this.overlay.isShown) {
      this.overlay.show();
      document.addEventListener('keydown', this.handleKeyDown, true);
      // A live region tells screen reader users the note has opened, with
      // its text, without moving their focus.
      this.announcement = this.noteText();
      this.emitEvent('open');
    } else if (!this.open && this.overlay.isShown) {
      this.overlay.hide();
      document.removeEventListener('keydown', this.handleKeyDown, true);
      this.announcement = '';
      this.emitEvent('close');
    }
  }

  override render() {
    return html`
      <button
        type="button"
        class="toggletip__button"
        part="button"
        aria-label=${this.label}
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls="content"
        @click=${this.toggle}
      >
        <slot name="icon"><zeno-icon name="info"></zeno-icon></slot>
      </button>
      <div
        id="content"
        class="toggletip__content"
        part="content"
        popover="manual"
      >
        <slot></slot>
      </div>
      <span class="visually-hidden" role="status">${this.announcement}</span>
    `;
  }

  private noteText(): string {
    return (this.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !this.open) return;
    const active = document.activeElement;
    const hadFocus =
      Boolean(this.shadowRoot?.activeElement) ||
      (active !== null && this.contains(active));
    this.hide();
    if (hadFocus) this.button.focus();
  };

  private handleFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget as Node | null;
    // Focus that moves into the note, or anywhere inside the element, keeps
    // it open. Focus that leaves the page (null) leaves it as it is.
    if (!next || this.contains(next) || this.shadowRoot?.contains(next)) return;
    this.hide();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-toggletip': ZenoToggletip;
  }
}

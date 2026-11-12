/**
 * Shared behaviour of the elements built on a native modal <dialog>:
 * zeno-modal and zeno-drawer.
 *
 * The browser supplies the top layer, the backdrop, making the rest of the
 * page inert, moving focus in and returning it on close. This class keeps the
 * `open` property in step with the dialog and gives every way of dismissing
 * it one cancelable event.
 */

import {
  css,
  html,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ZenoElement } from './zeno-element.js';
import { lockScroll } from './scroll-lock.js';

/** What asked the dialog to close. */
export type DialogCloseSource = 'close-button' | 'backdrop' | 'escape';

export abstract class ZenoDialogElement extends ZenoElement {
  static dialogStyles = css`
    :host {
      display: contents;
    }

    dialog {
      padding: 0;
      border: 0;
      max-width: none;
      max-height: none;
      overflow: hidden;
      background: var(--zeno-color-background-surface);
      color: var(--zeno-color-text-primary);
      font-family: var(--zeno-font-family-sans);
      box-shadow: var(--zeno-shadow-xl);
      opacity: 0;
      transition:
        opacity var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out),
        transform var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out),
        overlay var(--zeno-motion-duration-md) allow-discrete,
        display var(--zeno-motion-duration-md) allow-discrete;
    }

    dialog[open] {
      display: flex;
      opacity: 1;
      transform: none;
    }

    dialog::backdrop {
      background: var(--zeno-color-background-scrim);
      opacity: 0;
      transition:
        opacity var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out),
        overlay var(--zeno-motion-duration-md) allow-discrete,
        display var(--zeno-motion-duration-md) allow-discrete;
    }

    dialog[open]::backdrop {
      opacity: 1;
    }

    @starting-style {
      dialog[open]::backdrop {
        opacity: 0;
      }
    }

    .dialog__panel {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
    }

    .dialog__header {
      display: flex;
      align-items: center;
      gap: var(--zeno-spacing-4);
      padding: var(--zeno-spacing-4) var(--zeno-spacing-6);
      border-bottom: 1px solid var(--zeno-color-border-subtle);
    }

    .dialog__header[hidden],
    .dialog__footer[hidden] {
      display: none;
    }

    .dialog__heading {
      flex: 1;
      min-width: 0;
      margin: 0;
      color: var(--zeno-color-text-primary);
      font-size: var(--zeno-font-size-xl);
      font-weight: var(--zeno-font-weight-semibold);
      line-height: var(--zeno-font-line-height-tight);
    }

    .dialog__close {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      margin-inline-start: auto;
      padding: 0;
      border: 0;
      border-radius: var(--zeno-radius-md);
      background: transparent;
      color: var(--zeno-color-text-secondary);
      cursor: pointer;
    }

    .dialog__close:hover {
      background: var(--zeno-color-background-hover);
      color: var(--zeno-color-text-primary);
    }

    .dialog__close svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .dialog__body {
      flex: 1;
      min-height: 0;
      padding: var(--zeno-spacing-6);
      overflow-y: auto;
      line-height: var(--zeno-font-line-height-relaxed);
    }

    .dialog__footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--zeno-spacing-3);
      padding: var(--zeno-spacing-4) var(--zeno-spacing-6);
      border-top: 1px solid var(--zeno-color-border-subtle);
    }

    @media (forced-colors: active) {
      dialog {
        border: 1px solid CanvasText;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      dialog,
      dialog::backdrop {
        transition: none;
      }
    }
  `;

  /** Whether the dialog is showing. Set it, or call show() and close(). */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * The heading, which also names the dialog. Use the `header` slot for
   * richer content, or `aria-label` when there is no visible heading.
   */
  @property() heading = '';

  @property({ type: Boolean, attribute: 'no-close-button' })
  noCloseButton = false;

  /** Keeps the dialog open when the backdrop is pressed. */
  @property({ type: Boolean, attribute: 'no-backdrop-close' })
  noBackdropClose = false;

  /** Keeps the dialog open when Escape is pressed. */
  @property({ type: Boolean, attribute: 'no-escape-close' })
  noEscapeClose = false;

  /** The name of the close button. */
  @property({ attribute: 'close-label' }) closeLabel = 'Close';

  /** What close() was given, as on a native dialog. */
  returnValue = '';

  @state() private hasHeaderContent = false;
  @state() private hasFooterContent = false;

  @query('dialog') protected dialog!: HTMLDialogElement;

  private releaseScroll?: () => void;
  private pressStartedOnBackdrop = false;

  show(): void {
    this.open = true;
  }

  close(returnValue?: string): void {
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.open = false;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    // A dialog taken out of the page leaves the top layer. Close it, so that
    // `open` does not claim otherwise.
    if (this.dialog?.open) this.dialog.close();
    this.unlockScroll();
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (!changedProperties.has('open')) return;

    if (this.open && !this.dialog.open) {
      this.dialog.showModal();
      this.releaseScroll ??= lockScroll();
      this.emitEvent('open');
    } else if (!this.open && this.dialog.open) {
      this.dialog.close();
    }
  }

  /** The dialog element, with the shared parts inside `content`. */
  protected renderDialog(classes: string): TemplateResult {
    const named = Boolean(this.heading) || this.hasHeaderContent;
    return html`
      <dialog
        part="base"
        class=${classes}
        aria-labelledby=${named ? 'heading' : nothing}
        aria-label=${named ? nothing : (this.ariaLabel ?? nothing)}
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
        @pointerdown=${this.handlePointerDown}
        @click=${this.handleClick}
      >
        <div class="dialog__panel" part="panel">
          <header
            class="dialog__header"
            part="header"
            ?hidden=${!named && this.noCloseButton}
          >
            <h2 id="heading" class="dialog__heading" part="heading">
              <slot name="header" @slotchange=${this.handleSlotChange}
                >${this.heading}</slot
              >
            </h2>
            ${
              this.noCloseButton
                ? nothing
                : html`
                    <button
                      class="dialog__close"
                      part="close"
                      type="button"
                      aria-label=${this.closeLabel}
                      @click=${() => this.requestClose('close-button')}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        aria-hidden="true"
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  `
            }
          </header>
          <div class="dialog__body" part="body"><slot></slot></div>
          <footer
            class="dialog__footer"
            part="footer"
            ?hidden=${!this.hasFooterContent}
          >
            <slot name="footer" @slotchange=${this.handleSlotChange}></slot>
          </footer>
        </div>
      </dialog>
    `;
  }

  /**
   * Asks to close. Sends `request-close` with the source; a listener that
   * calls preventDefault() keeps the dialog open.
   */
  private requestClose(source: DialogCloseSource): void {
    if (source === 'backdrop' && this.noBackdropClose) return;
    if (source === 'escape' && this.noEscapeClose) return;
    const allowed = this.emitEvent(
      'request-close',
      { source },
      { cancelable: true }
    );
    if (allowed) this.close();
  }

  private handleCancel(event: Event): void {
    // Escape. The element decides, so that `open` and the events stay in
    // step with what happens.
    event.preventDefault();
    this.requestClose('escape');
  }

  private handleNativeClose(): void {
    this.unlockScroll();
    this.open = false;
    this.emitEvent('close', { returnValue: this.returnValue });
  }

  private handlePointerDown(event: PointerEvent): void {
    this.pressStartedOnBackdrop = event.target === this.dialog;
  }

  private handleClick(event: MouseEvent): void {
    // The panel covers the dialog, so a click on the dialog itself landed on
    // the backdrop. A drag that began inside the panel does not count.
    const onBackdrop = event.target === this.dialog;
    if (onBackdrop && this.pressStartedOnBackdrop) {
      this.requestClose('backdrop');
    }
    this.pressStartedOnBackdrop = false;
  }

  private handleSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const filled = slot.assignedNodes().length > 0;
    if (slot.name === 'header') this.hasHeaderContent = filled;
    if (slot.name === 'footer') this.hasFooterContent = filled;
  }

  private unlockScroll(): void {
    this.releaseScroll?.();
    this.releaseScroll = undefined;
  }
}

import { css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ZenoElement } from '../base/zeno-element.js';
import { ZenoDialogElement } from '../base/dialog-element.js';
import type { ModalSize } from '../types.js';

/**
 * A dialog in the middle of the page that needs an answer before the page
 * behind it can be used again. Built on a native modal `<dialog>`.
 *
 * @slot - The content.
 * @slot header - Heading content, in place of the `heading` text.
 * @slot footer - Actions. The footer is hidden while this slot is empty.
 * @fires {CustomEvent} open - The modal opened.
 * @fires {CustomEvent<{ returnValue: string }>} close - The modal closed. `detail.returnValue` is what close() was given.
 * @fires {CustomEvent<{ source: DialogCloseSource }>} request-close - The close button, the backdrop or Escape asked to close; `detail.source` says which. Cancel it to keep the modal open.
 * @csspart base - The dialog element.
 * @csspart panel - The column that holds header, body and footer.
 * @csspart header - The header.
 * @csspart heading - The heading.
 * @csspart close - The close button.
 * @csspart body - The scrolling content area.
 * @csspart footer - The footer.
 */
@customElement('zeno-modal')
export class ZenoModal extends ZenoDialogElement {
  static override styles = [
    ZenoElement.baseStyles,
    ZenoDialogElement.dialogStyles,
    css`
      :host {
        --modal-width-sm: 25rem;
        --modal-width-md: 37.5rem;
        --modal-width-lg: 50rem;
        --modal-width-xl: 62.5rem;
        --modal-margin: var(--zeno-spacing-4);
      }

      dialog {
        width: min(var(--modal-width), calc(100vw - 2 * var(--modal-margin)));
        max-height: calc(100dvh - 2 * var(--modal-margin));
        margin: auto;
        border-radius: var(--zeno-radius-lg);
        transform: translateY(var(--zeno-spacing-2));
      }

      @starting-style {
        dialog[open] {
          opacity: 0;
          transform: translateY(var(--zeno-spacing-2));
        }
      }

      .modal--sm {
        --modal-width: var(--modal-width-sm);
      }

      .modal--md {
        --modal-width: var(--modal-width-md);
      }

      .modal--lg {
        --modal-width: var(--modal-width-lg);
      }

      .modal--xl {
        --modal-width: var(--modal-width-xl);
      }

      .modal--full {
        --modal-width: 100vw;
        height: 100dvh;
      }

      @media (max-width: 640px) {
        dialog {
          --modal-margin: 0px;
          --modal-width: 100vw;
          height: 100dvh;
          border-radius: 0;
        }
      }
    `,
  ];

  @property({ reflect: true }) size: ModalSize = 'md';

  override render() {
    return this.renderDialog(`modal modal--${this.size}`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-modal': ZenoModal;
  }
}

import { css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ZenoElement } from '../base/zeno-element.js';
import { ZenoDialogElement } from '../base/dialog-element.js';
import type { DrawerPlacement, DrawerSize } from '../types.js';

/**
 * A panel that slides in from an edge of the page and needs an answer before
 * the page behind it can be used again. Built on a native modal `<dialog>`.
 *
 * @slot - The content.
 * @slot header - Heading content, in place of the `heading` text.
 * @slot footer - Actions. The footer is hidden while this slot is empty.
 * @fires {CustomEvent} open - The drawer opened.
 * @fires {CustomEvent<{ returnValue: string }>} close - The drawer closed. `detail.returnValue` is what close() was given.
 * @fires {CustomEvent<{ source: DialogCloseSource }>} request-close - The close button, the backdrop or Escape asked to close; `detail.source` says which. Cancel it to keep the drawer open.
 * @csspart base - The dialog element.
 * @csspart panel - The column that holds header, body and footer.
 * @csspart header - The header.
 * @csspart heading - The heading.
 * @csspart close - The close button.
 * @csspart body - The scrolling content area.
 * @csspart footer - The footer.
 */
@customElement('zeno-drawer')
export class ZenoDrawer extends ZenoDialogElement {
  static override styles = [
    ZenoElement.baseStyles,
    ZenoDialogElement.dialogStyles,
    css`
      :host {
        --drawer-width-sm: 20rem;
        --drawer-width-md: 25rem;
        --drawer-width-lg: 37.5rem;
        --drawer-height-sm: 30dvh;
        --drawer-height-md: 50dvh;
        --drawer-height-lg: 70dvh;
      }

      dialog {
        margin: 0;
        transform: var(--drawer-away);
      }

      @starting-style {
        dialog[open] {
          opacity: 0;
          transform: var(--drawer-away);
        }
      }

      /* The inline edges: start and end follow the reading direction. */
      .drawer--start,
      .drawer--end {
        inset-block: 0;
        width: min(var(--drawer-size), 100vw);
        height: 100dvh;
      }

      .drawer--start {
        --drawer-away: translateX(-100%);
        inset-inline: 0 auto;
      }

      .drawer--end {
        --drawer-away: translateX(100%);
        inset-inline: auto 0;
      }

      .drawer--start:dir(rtl) {
        --drawer-away: translateX(100%);
      }

      .drawer--end:dir(rtl) {
        --drawer-away: translateX(-100%);
      }

      .drawer--top,
      .drawer--bottom {
        inset-inline: 0;
        width: 100vw;
        height: min(var(--drawer-size), 100dvh);
      }

      .drawer--top {
        --drawer-away: translateY(-100%);
        inset-block: 0 auto;
      }

      .drawer--bottom {
        --drawer-away: translateY(100%);
        inset-block: auto 0;
      }

      .drawer--start.drawer--sm,
      .drawer--end.drawer--sm {
        --drawer-size: var(--drawer-width-sm);
      }

      .drawer--start.drawer--md,
      .drawer--end.drawer--md {
        --drawer-size: var(--drawer-width-md);
      }

      .drawer--start.drawer--lg,
      .drawer--end.drawer--lg {
        --drawer-size: var(--drawer-width-lg);
      }

      .drawer--top.drawer--sm,
      .drawer--bottom.drawer--sm {
        --drawer-size: var(--drawer-height-sm);
      }

      .drawer--top.drawer--md,
      .drawer--bottom.drawer--md {
        --drawer-size: var(--drawer-height-md);
      }

      .drawer--top.drawer--lg,
      .drawer--bottom.drawer--lg {
        --drawer-size: var(--drawer-height-lg);
      }

      .drawer--full {
        --drawer-size: 100vmax;
      }
    `,
  ];

  /** The edge the drawer is attached to. */
  @property({ reflect: true }) placement: DrawerPlacement = 'start';

  @property({ reflect: true }) size: DrawerSize = 'md';

  override render() {
    return this.renderDialog(
      `drawer drawer--${this.placement} drawer--${this.size}`
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-drawer': ZenoDrawer;
  }
}

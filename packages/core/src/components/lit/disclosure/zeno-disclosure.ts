import { html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ZenoElement } from '../base/zeno-element.js';

/**
 * One section that opens and closes, with any content inside. Built on a
 * native `<details>` element. Put several next to each other for an
 * accordion whose panels hold markup.
 *
 * @slot summary - The always-visible line that opens and closes the section.
 * @slot - The content.
 * @fires {CustomEvent<{ open: boolean }>} toggle - The section opened or closed.
 * @csspart base
 * @csspart summary
 * @csspart chevron
 * @csspart content
 */
@customElement('zeno-disclosure')
export class ZenoDisclosure extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        display: block;
        border-top: 1px solid var(--zeno-color-border-subtle);
      }

      /* The last of a run of sections closes the stack with a border. */
      :host(:last-of-type) {
        border-bottom: 1px solid var(--zeno-color-border-subtle);
      }

      .disclosure__summary {
        display: flex;
        align-items: center;
        gap: var(--zeno-spacing-2);
        min-height: 2.75rem;
        padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
        color: var(--zeno-color-text-primary);
        cursor: pointer;
        list-style: none;
        transition: background-color var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      .disclosure__summary::-webkit-details-marker {
        display: none;
      }

      .disclosure__summary:hover {
        background: var(--zeno-color-background-hover);
      }

      .disclosure__summary:focus-visible {
        outline-offset: -2px;
      }

      .disclosure__chevron {
        display: inline-flex;
        flex-shrink: 0;
        transition: transform var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      details[open] .disclosure__chevron {
        transform: rotate(90deg);
      }

      :host(:dir(rtl)) .disclosure__chevron {
        transform: scaleX(-1);
      }

      :host(:dir(rtl)) details[open] .disclosure__chevron {
        transform: rotate(90deg);
      }

      .disclosure__label {
        flex: 1;
        min-width: 0;
      }

      .disclosure__content {
        padding: var(--zeno-spacing-1) var(--zeno-spacing-3)
          var(--zeno-spacing-4) calc(var(--zeno-spacing-3) + 1.5rem);
        color: var(--zeno-color-text-primary);
      }

      @media (forced-colors: active) {
        :host {
          border-color: CanvasText;
        }
      }
    `,
  ];

  /** True while the content shows. */
  @property({ type: Boolean, reflect: true }) open = false;

  @query('details') private details!: HTMLDetailsElement;

  private handleToggle(): void {
    if (this.details.open === this.open) return;
    this.open = this.details.open;
    this.emitEvent('toggle', { open: this.open });
  }

  override render() {
    return html`
      <details part="base" ?open=${this.open} @toggle=${this.handleToggle}>
        <summary class="disclosure__summary" part="summary">
          <span class="disclosure__chevron" part="chevron" aria-hidden="true">
            <zeno-icon name="chevron-right" size="16"></zeno-icon>
          </span>
          <span class="disclosure__label"><slot name="summary"></slot></span>
        </summary>
        <div class="disclosure__content" part="content"><slot></slot></div>
      </details>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-disclosure': ZenoDisclosure;
  }
}

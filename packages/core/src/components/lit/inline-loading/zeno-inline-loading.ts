import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ZenoElement } from '../base/zeno-element.js';

/**
 * A small line that says something is in progress, then that it finished or
 * failed. Use it in place of a button while a form sends, for example.
 *
 * @csspart base
 * @csspart indicator
 * @csspart description
 */
@customElement('zeno-inline-loading')
export class ZenoInlineLoading extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        display: inline-block;
        color: var(--zeno-color-text-secondary);
        font-size: var(--zeno-font-size-sm);
        line-height: var(--zeno-font-line-height-normal);
      }

      .inline-loading {
        display: inline-flex;
        align-items: center;
        gap: var(--zeno-spacing-2);
        min-height: 2rem;
      }

      .inline-loading__indicator {
        display: inline-flex;
        flex-shrink: 0;
        width: 1rem;
        height: 1rem;
      }

      .inline-loading__spinner {
        width: 100%;
        height: 100%;
        border: 2px solid var(--zeno-color-border-default);
        border-top-color: var(--zeno-color-accent-solid);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      :host([status='finished']) .inline-loading__indicator {
        color: var(--zeno-color-success-text);
      }

      :host([status='error']) .inline-loading__indicator {
        color: var(--zeno-color-danger-text);
      }

      .inline-loading__indicator zeno-icon {
        --icon-size: 1rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Without motion the ring stays still, with its coloured quarter. */
      @media (prefers-reduced-motion: reduce) {
        .inline-loading__spinner {
          animation: none;
        }
      }

      @media (forced-colors: active) {
        .inline-loading__spinner {
          border-color: GrayText;
          border-top-color: CanvasText;
        }
      }
    `,
  ];

  /** `active` while the work runs, then `finished` or `error`. */
  @property({ reflect: true }) status: 'active' | 'finished' | 'error' =
    'active';
  /** What is happening, such as “Sending…”. It is announced politely. */
  @property() description = '';

  override render() {
    return html`
      <span
        class="inline-loading"
        part="base"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span class="inline-loading__indicator" part="indicator">
          ${
            this.status === 'active'
              ? html`<span class="inline-loading__spinner"></span>`
              : html`<zeno-icon
                  name=${this.status === 'finished' ? 'check-circle' : 'x-circle'}
                ></zeno-icon>`
          }
        </span>
        <span class="inline-loading__description" part="description"
          >${this.description}</span
        >
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-inline-loading': ZenoInlineLoading;
  }
}

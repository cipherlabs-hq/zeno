import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ZenoElement } from '../base/zeno-element.js';
// Elements this one renders, so that importing it alone is enough.
import '../icon/zeno-icon.js';

/**
 * A text link. With `href` it renders its own anchor. Without one it styles
 * the anchor you put inside it, such as a router's link component, so
 * client-side navigation keeps working.
 *
 * @slot - The link text, or an `<a>` element when there is no `href`.
 * @slot icon - An icon after the text, in place of the external-link icon.
 * @csspart link - The anchor, when the element renders one.
 * @csspart icon
 */
@customElement('zeno-link')
export class ZenoLink extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        display: inline;
        font: inherit;
      }

      .link,
      ::slotted(a) {
        color: var(--zeno-color-accent-text);
        text-decoration-line: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 0.2em;
        border-radius: var(--zeno-radius-xs);
        transition: color var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      .link:hover,
      ::slotted(a:hover) {
        color: var(--zeno-color-accent-solid-hover);
        text-decoration-thickness: 2px;
      }

      .link:focus-visible,
      ::slotted(a:focus-visible) {
        outline: var(--zeno-focus-ring-width) solid var(--zeno-color-focus-ring);
        outline-offset: var(--zeno-focus-ring-offset);
      }

      .link:visited {
        color: var(--zeno-color-accent-text);
      }

      /* A link on its own line, as in a list of actions, needs no underline
         to be told apart from the text around it. */
      :host([standalone]) .link,
      :host([standalone]) ::slotted(a) {
        text-decoration-line: none;
      }

      :host([standalone]) .link:hover,
      :host([standalone]) ::slotted(a:hover) {
        text-decoration-line: underline;
      }

      :host([disabled]) .link {
        color: var(--zeno-color-text-disabled);
        text-decoration-line: none;
        cursor: not-allowed;
      }

      .link__icon {
        display: inline-flex;
        margin-inline-start: 0.25em;
        vertical-align: -0.125em;
      }

      .link__icon zeno-icon {
        --icon-size: 1em;
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
        .link,
        ::slotted(a) {
          color: LinkText;
        }
      }
    `,
  ];

  /** Where the link goes. Leave it out to style a slotted `<a>` instead. */
  @property() href?: string;
  @property() target?: string;
  /**
   * The `rel` of the anchor. A link with `target="_blank"` gets
   * `noopener noreferrer` when this is not set.
   */
  @property() rel?: string;
  /** Downloads the target. The value, when not empty, is the file name. */
  @property() download?: string;
  /** Shows the external-link icon after the text. */
  @property({ type: Boolean, reflect: true }) external = false;
  /** A link on its own, not in running text: no underline until hovered. */
  @property({ type: Boolean, reflect: true }) standalone = false;
  /** Renders the text without a link. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Read by screen readers after the text when the link opens a new tab. */
  @property({ attribute: 'new-tab-label' }) newTabLabel =
    '(opens in a new tab)';

  override render() {
    const icon = this.external
      ? html`<span class="link__icon" part="icon" aria-hidden="true"
          ><slot name="icon"><zeno-icon name="external-link"></zeno-icon></slot
        ></span>`
      : html`<slot name="icon"></slot>`;

    if (!this.href) {
      return html`<slot></slot>${this.external ? icon : nothing}`;
    }

    const newTab = this.target === '_blank';
    const rel = this.rel ?? (newTab ? 'noopener noreferrer' : undefined);

    if (this.disabled) {
      return html`<span class="link" part="link" aria-disabled="true"
        ><slot></slot
      ></span>`;
    }

    return html`<a
      class="link"
      part="link"
      href=${this.href}
      target=${ifDefined(this.target)}
      rel=${ifDefined(rel)}
      download=${ifDefined(this.download)}
      ><slot></slot>${icon}${
        newTab
          ? html`<span class="visually-hidden"> ${this.newTabLabel}</span>`
          : nothing
      }</a
    >`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-link': ZenoLink;
  }
}

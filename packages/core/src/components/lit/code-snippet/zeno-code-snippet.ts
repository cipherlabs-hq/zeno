import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
// Elements this one renders, so that importing it alone is enough.
import '../icon/zeno-icon.js';

const FEEDBACK_MS = 2000;

/**
 * Code to read and copy: a command, a URL or a key. A button copies the text
 * to the clipboard and says so.
 *
 * @slot - The code, as text. Line breaks show as written.
 * @fires {CustomEvent<{ text: string }>} copied - The text was copied.
 * @fires {CustomEvent<{ error: unknown }>} copy-failed - The clipboard refused the text.
 * @csspart base
 * @csspart code
 * @csspart copy-button
 */
@customElement('zeno-code-snippet')
export class ZenoCodeSnippet extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        /* How tall a multi-line snippet grows before it scrolls. */
        --code-snippet-max-height: 20rem;

        display: block;
        max-width: 100%;
      }

      .snippet {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: var(--zeno-spacing-2);
        min-width: 0;
        border: 1px solid var(--zeno-color-border-subtle);
        border-radius: var(--zeno-radius-md);
        background: var(--zeno-color-background-subtle);
        color: var(--zeno-color-text-primary);
      }

      .snippet__code {
        flex: 1;
        min-width: 0;
        margin: 0;
        padding: var(--zeno-spacing-3) var(--zeno-spacing-4);
        overflow-x: auto;
        font-family: var(--zeno-font-family-mono);
        font-size: var(--zeno-font-size-sm);
        line-height: var(--zeno-font-line-height-normal);
        white-space: pre;
        border-radius: inherit;
      }

      .snippet--single .snippet__code {
        white-space: pre;
      }

      .snippet--multi .snippet__code {
        max-height: var(--code-snippet-max-height);
        overflow-y: auto;
      }

      .snippet--wrap .snippet__code {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .snippet__code:focus-visible {
        outline-offset: -2px;
      }

      .snippet__copy {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--zeno-spacing-1);
        min-width: 40px;
        height: 40px;
        margin: var(--zeno-spacing-1);
        padding: 0 var(--zeno-spacing-2);
        border: 0;
        border-radius: var(--zeno-radius-sm);
        background: transparent;
        color: var(--zeno-color-text-secondary);
        font: inherit;
        font-size: var(--zeno-font-size-sm);
        cursor: pointer;
      }

      .snippet__copy:hover {
        background: var(--zeno-color-background-hover);
        color: var(--zeno-color-text-primary);
      }

      .snippet__copy:active {
        background: var(--zeno-color-background-active);
      }

      .snippet__copy--done {
        color: var(--zeno-color-success-text);
      }

      .snippet__feedback {
        white-space: nowrap;
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
        .snippet {
          border-color: CanvasText;
        }
      }
    `,
  ];

  /** `single` keeps one line and scrolls sideways. `multi` keeps line breaks. */
  @property({ reflect: true }) type: 'single' | 'multi' = 'single';
  /** Wraps long lines instead of scrolling. */
  @property({ type: Boolean, reflect: true }) wrap = false;
  /** The name of the code region, read by screen readers. */
  @property() label = 'Code';
  /** The name of the copy button. */
  @property({ attribute: 'copy-label' }) copyLabel = 'Copy to clipboard';
  /** Shown on the button and announced after a copy. */
  @property() feedback = 'Copied';
  /** Announced when the clipboard refuses the text. */
  @property({ attribute: 'error-feedback' }) errorFeedback =
    'Could not copy. Select the text and copy it by hand.';
  /** Hides the copy button, for code that should only be read. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-copy-button' })
  hideCopyButton = false;
  /** The text to copy, when it differs from the text shown. */
  @property() value?: string;

  @state() private status: 'idle' | 'copied' | 'failed' = 'idle';

  private timer?: number;

  /** The text the button copies. */
  get text(): string {
    if (this.value !== undefined) return this.value;
    // Markup indentation around the text is not part of the code.
    return (this.textContent ?? '').replace(/^\s*\n/, '').replace(/\n\s*$/, '');
  }

  /** Copies the text. Resolves to false when the clipboard refused it. */
  async copy(): Promise<boolean> {
    const text = this.text;
    window.clearTimeout(this.timer);
    try {
      await writeClipboard(text);
      this.status = 'copied';
      this.emitEvent('copied', { text });
    } catch (error) {
      this.status = 'failed';
      this.emitEvent('copy-failed', { error });
    }
    this.timer = window.setTimeout(() => {
      this.status = 'idle';
    }, FEEDBACK_MS);
    return this.status === 'copied';
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.timer);
  }

  override render() {
    const copied = this.status === 'copied';
    return html`
      <div
        part="base"
        class=${classMap({
          snippet: true,
          [`snippet--${this.type}`]: true,
          'snippet--wrap': this.wrap,
        })}
      >
        <pre
          class="snippet__code"
          part="code"
          role="group"
          aria-label=${this.label}
          tabindex="0"
        ><code><slot></slot></code></pre>
        ${
          this.hideCopyButton
            ? nothing
            : html`<button
                type="button"
                part="copy-button"
                class=${classMap({
                  snippet__copy: true,
                  'snippet__copy--done': copied,
                })}
                aria-label=${this.copyLabel}
                @click=${() => this.copy()}
              >
                <zeno-icon
                  name=${copied ? 'check' : 'copy'}
                  size="16"
                ></zeno-icon>
                ${
                  copied
                    ? html`<span class="snippet__feedback" aria-hidden="true"
                        >${this.feedback}</span
                      >`
                    : nothing
                }
              </button>`
        }
        <span class="visually-hidden" role="status"
          >${
            this.status === 'copied'
              ? this.feedback
              : this.status === 'failed'
                ? this.errorFeedback
                : ''
          }</span
        >
      </div>
    `;
  }
}

async function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Pages served without HTTPS have no async clipboard.
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position: fixed; opacity: 0; pointer-events: none';
  document.body.append(area);
  area.select();
  const done = document.execCommand('copy');
  area.remove();
  if (!done) throw new Error('The browser refused to copy.');
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-code-snippet': ZenoCodeSnippet;
  }
}

import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ZenoElement } from '../base/zeno-element.js';

/**
 * A line between sections, horizontal or vertical, with optional text.
 *
 * @slot - Optional text shown in the line.
 * @csspart base
 * @csspart content
 */
@customElement('zeno-divider')
export class ZenoDivider extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --divider-color: var(--zeno-color-border-subtle);
        --divider-width: 1px;
        --divider-spacing: var(--zeno-spacing-4);
        --divider-text-color: var(--zeno-color-text-secondary);
        --divider-text-bg: var(--zeno-color-background-surface);

        display: block;
        margin: var(--divider-spacing) 0;
      }

      /* Orientations */
      :host([orientation='vertical']) {
        display: inline-block;
        margin: 0 var(--divider-spacing);
        height: 100%;
        width: auto;
        vertical-align: middle;
      }

      /* Divider line */
      .divider {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      /* Horizontal line */
      .divider--horizontal::before,
      .divider--horizontal::after {
        content: '';
        flex: 1;
        height: var(--divider-width);
        background: var(--divider-color);
      }

      /* Vertical line */
      .divider--vertical {
        flex-direction: column;
      }

      .divider--vertical::before,
      .divider--vertical::after {
        content: '';
        flex: 1;
        width: var(--divider-width);
        min-height: 1em;
        background: var(--divider-color);
      }

      /* Variants */
      .divider--solid::before,
      .divider--solid::after {
        background: var(--divider-color);
      }

      .divider--dashed::before,
      .divider--dashed::after {
        background-image: repeating-linear-gradient(
          to right,
          var(--divider-color) 0,
          var(--divider-color) 4px,
          transparent 4px,
          transparent 8px
        );
      }

      .divider--vertical.divider--dashed::before,
      .divider--vertical.divider--dashed::after {
        background-image: repeating-linear-gradient(
          to bottom,
          var(--divider-color) 0,
          var(--divider-color) 4px,
          transparent 4px,
          transparent 8px
        );
      }

      .divider--dotted::before,
      .divider--dotted::after {
        background-image: repeating-linear-gradient(
          to right,
          var(--divider-color) 0,
          var(--divider-color) 2px,
          transparent 2px,
          transparent 4px
        );
      }

      .divider--vertical.divider--dotted::before,
      .divider--vertical.divider--dotted::after {
        background-image: repeating-linear-gradient(
          to bottom,
          var(--divider-color) 0,
          var(--divider-color) 2px,
          transparent 2px,
          transparent 4px
        );
      }

      /* Text/content alignment */
      .divider--align-start::before {
        flex: 0 0 10%;
      }

      .divider--align-start::after {
        flex: 1;
      }

      .divider--align-end::before {
        flex: 1;
      }

      .divider--align-end::after {
        flex: 0 0 10%;
      }

      /* Content slot */
      .divider__content {
        padding: 0 var(--zeno-spacing-3);
        color: var(--divider-text-color);
        background: var(--divider-text-bg);
        font-size: var(--zeno-font-size-sm);
        font-weight: var(--zeno-font-weight-medium);
        white-space: nowrap;
      }

      .divider--vertical .divider__content {
        padding: var(--zeno-spacing-3) 0;
      }

      /* Hide content wrapper when empty */
      .divider__content:empty {
        display: none;
      }

      /* No line before/after when no content */
      .divider--no-content::before,
      .divider--no-content::after {
        display: none;
      }

      .divider--no-content {
        height: var(--divider-width);
        background: var(--divider-color);
      }

      .divider--vertical.divider--no-content {
        width: var(--divider-width);
        height: 100%;
      }

      /* Spacing variants */
      :host([spacing='none']) {
        margin: 0;
      }

      :host([spacing='sm']) {
        --divider-spacing: var(--zeno-spacing-2);
      }

      :host([spacing='md']) {
        --divider-spacing: var(--zeno-spacing-4);
      }

      :host([spacing='lg']) {
        --divider-spacing: var(--zeno-spacing-6);
      }

      :host([spacing='xl']) {
        --divider-spacing: var(--zeno-spacing-8);
      }

      /* Color modifiers */
      :host([color='primary']) {
        --divider-color: var(--zeno-color-accent-border);
        --divider-text-color: var(--zeno-color-accent-text);
      }

      :host([color='secondary']) {
        --divider-color: var(--zeno-color-neutral-border);
        --divider-text-color: var(--zeno-color-neutral-text);
      }

      :host([color='accent']) {
        --divider-color: var(--zeno-color-accent-border);
        --divider-text-color: var(--zeno-color-accent-text);
      }

      /* Thickness modifiers */
      :host([thickness='thin']) {
        --divider-width: 1px;
      }

      :host([thickness='medium']) {
        --divider-width: 2px;
      }

      :host([thickness='thick']) {
        --divider-width: 4px;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .divider::before,
        .divider::after,
        .divider--no-content {
          background: ButtonText;
        }

        .divider__content {
          color: ButtonText;
          background: ButtonFace;
        }
      }
    `,
  ];

  @property({ reflect: true }) orientation: 'horizontal' | 'vertical' =
    'horizontal';
  @property({ reflect: true }) variant: 'solid' | 'dashed' | 'dotted' = 'solid';
  @property({ reflect: true }) align: 'start' | 'center' | 'end' = 'center';
  @property({ reflect: true }) spacing: 'none' | 'sm' | 'md' | 'lg' | 'xl' =
    'md';
  @property({ reflect: true }) thickness: 'thin' | 'medium' | 'thick' = 'thin';
  @property({ reflect: true }) color?: 'primary' | 'secondary' | 'accent';
  @property({ type: Number }) indent?: number;

  /**
   * Check if slot has content
   */
  private hasContent = false;

  /**
   * Slot change handler
   */
  private handleSlotChange(): void {
    const slot = this.shadowRoot?.querySelector('slot');
    this.hasContent = slot
      ? slot.assignedNodes({ flatten: true }).length > 0
      : false;
    this.requestUpdate();
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      divider: true,
      [`divider--${this.orientation}`]: true,
      [`divider--${this.variant}`]: true,
      [`divider--align-${this.align}`]: this.hasContent,
      'divider--no-content': !this.hasContent,
    };

    const styles: Record<string, string> = {};

    if (this.indent !== undefined) {
      if (this.orientation === 'horizontal') {
        styles['marginLeft'] = `${this.indent}px`;
        styles['marginRight'] = `${this.indent}px`;
      } else {
        styles['marginTop'] = `${this.indent}px`;
        styles['marginBottom'] = `${this.indent}px`;
      }
    }

    return html`
      <div
        part="base"
        class=${classMap(classes)}
        style=${styleMap(styles)}
        role="separator"
        aria-orientation=${this.orientation}
      >
        <span class="divider__content" part="content">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-divider': ZenoDivider;
  }
}

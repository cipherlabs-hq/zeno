import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { ComponentSize } from '../types.js';
import { builtInIcons } from './icon-set.js';

// Icon library registry
const iconRegistry = new Map<string, string>();

/**
 * An icon: one of the registered shapes by `name`, an SVG file by `src`, or
 * a slotted SVG. With a `label` it is announced as an image. Without one it
 * is decoration and hidden from assistive technology.
 *
 * @slot - An inline SVG, used when neither `name` nor `src` is set.
 * @csspart base
 */
@customElement('zeno-icon')
export class ZenoIcon extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --icon-size: 1.25em;
        --icon-color: currentColor;

        display: inline-flex;
        vertical-align: middle;
      }

      /* Size variants */
      :host([size='xs']) {
        --icon-size: 0.75em;
      }

      :host([size='sm']) {
        --icon-size: 1em;
      }

      :host([size='md']) {
        --icon-size: 1.25em;
      }

      :host([size='lg']) {
        --icon-size: 1.5em;
      }

      :host([size='xl']) {
        --icon-size: 2em;
      }

      /* Icon container */
      .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--icon-size);
        height: var(--icon-size);
        fill: none;
        stroke: var(--icon-color);
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      /* Fill variant */
      :host([variant='fill']) .icon {
        fill: var(--icon-color);
        stroke: none;
      }

      /* Outline variant (default) */
      :host([variant='outline']) .icon {
        fill: none;
        stroke: var(--icon-color);
      }

      /* Both variant */
      :host([variant='both']) .icon {
        fill: var(--icon-color);
        stroke: var(--icon-color);
        stroke-width: 1;
      }

      /* Rotating animation */
      :host([rotate]) .icon {
        animation: rotate var(--zeno-motion-duration-xl) linear infinite;
      }

      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      /* Pulse animation */
      :host([pulse]) .icon {
        animation: pulse var(--zeno-motion-duration-md) ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      /* SVG styling */
      svg {
        width: 100%;
        height: 100%;
      }

      /* An icon loaded from a file, drawn in the text colour */
      .icon__image {
        width: 100%;
        height: 100%;
        background-color: var(--icon-color);
        mask: var(--icon-image) center / contain no-repeat;
      }

      /* Slotted content */
      ::slotted(svg) {
        width: 100%;
        height: 100%;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        :host([rotate]) .icon,
        :host([pulse]) .icon {
          animation: none;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .icon {
          stroke: ButtonText;
        }

        :host([variant='fill']) .icon,
        :host([variant='both']) .icon {
          fill: ButtonText;
        }
      }
    `,
  ];

  @property({ reflect: true }) name?: string;
  /**
   * A named size that follows the font size (`xs` to `xl`), or a number of
   * pixels such as `16`.
   */
  @property({ reflect: true }) size: ComponentSize | `${number}` = 'md';
  @property({ reflect: true }) variant: 'outline' | 'fill' | 'both' = 'outline';
  @property({ type: Boolean, reflect: true }) rotate = false;
  @property({ type: Boolean, reflect: true }) pulse = false;
  @property() src?: string;
  @property() label?: string;

  /**
   * Register an icon in the global registry
   */
  static registerIcon(name: string, svg: string): void {
    iconRegistry.set(name, svg);
  }

  /**
   * Register multiple icons
   */
  static registerIcons(icons: Record<string, string>): void {
    Object.entries(icons).forEach(([name, svg]) => {
      iconRegistry.set(name, svg);
    });
  }

  /**
   * Get an icon from the registry
   */
  static getIcon(name: string): string | undefined {
    return iconRegistry.get(name);
  }

  /**
   * Clear all registered icons
   */
  static clearIcons(): void {
    iconRegistry.clear();
  }

  /** The size in pixels when `size` is a number. */
  private get pixelSize(): number | undefined {
    const pixels = Number(this.size);
    return Number.isFinite(pixels) && pixels > 0 ? pixels : undefined;
  }

  override render() {
    const name = this.label || '';
    return html`
      <span
        part="base"
        class="icon"
        style=${this.pixelSize ? `--icon-size: ${this.pixelSize}px` : nothing}
        role=${name ? 'img' : nothing}
        aria-label=${name || nothing}
        aria-hidden=${name ? nothing : 'true'}
      >
        ${this.renderIcon()}
      </span>
    `;
  }

  private renderIcon() {
    if (this.src) {
      // The file is used as a mask, so it takes the text colour like the
      // built-in icons do and nothing inside it can run.
      const url = this.src.replace(
        /["\\\n\r\f]/g,
        character => `\\${character.codePointAt(0)!.toString(16)} `
      );
      return html`<span
        class="icon__image"
        style=${styleMap({ '--icon-image': `url("${url}")` })}
      ></span>`;
    }
    const shapes = this.name ? iconRegistry.get(this.name) : undefined;
    if (shapes) {
      return html`<svg viewBox="0 0 24 24">${unsafeSVG(shapes)}</svg>`;
    }
    return html`<slot></slot>`;
  }
}

// The built-in set. Elements such as zeno-alert and zeno-input use these names.
ZenoIcon.registerIcons(builtInIcons);

declare global {
  interface HTMLElementTagNameMap {
    'zeno-icon': ZenoIcon;
  }
}

import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { ComponentSize } from '../types.js';

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
  @property({ reflect: true }) size: ComponentSize = 'md';
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

  override render() {
    return html`
      <span
        part="base"
        class="icon"
        role=${this.label ? 'img' : nothing}
        aria-label=${this.label || nothing}
        aria-hidden=${this.label ? nothing : 'true'}
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

// Preload some common icons
ZenoIcon.registerIcons({
  'chevron-down': '<polyline points="6 9 12 15 18 9"></polyline>',
  'chevron-up': '<polyline points="18 15 12 9 6 15"></polyline>',
  'chevron-left': '<polyline points="15 18 9 12 15 6"></polyline>',
  'chevron-right': '<polyline points="9 18 15 12 9 6"></polyline>',
  check: '<polyline points="20 6 9 17 4 12"></polyline>',
  x: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
  minus: '<line x1="5" y1="12" x2="19" y2="12"></line>',
  search:
    '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
  settings:
    '<circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m11-6h-6m-6 0H1m18.4-7.4l-4.2 4.2m-6.4 0l-4.2-4.2m0 14.8l4.2-4.2m6.4 0l4.2 4.2"></path>',
  heart:
    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
});

declare global {
  interface HTMLElementTagNameMap {
    'zeno-icon': ZenoIcon;
  }
}

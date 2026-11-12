import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ZenoElement } from '../base/zeno-element.js';
// Elements this one renders, so that importing it alone is enough.
import '../icon/zeno-icon.js';
import type { ThemeToggleSize } from '../types.js';
import {
  getSystemTheme,
  onSystemThemeChange,
  setTheme,
  type ThemeName,
  type ThemePreference,
} from '../../../lib/theme-utils.js';

/**
 * A button that switches the page between the light and dark themes.
 *
 * @fires {CustomEvent<{ theme: ThemeName }>} theme-change - The theme in effect changed.
 * @fires {CustomEvent<{ theme: ThemePreference }>} toggle - The user changed the preference.
 * @csspart base
 * @csspart moon
 * @csspart sun
 * @csspart system
 */
@customElement('zeno-theme-toggle')
export class ZenoThemeToggle extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --toggle-size-sm: 32px;
        --toggle-size-md: 40px;
        --toggle-size-lg: 48px;
        --toggle-icon-size-sm: 16px;
        --toggle-icon-size-md: 20px;
        --toggle-icon-size-lg: 24px;
        --toggle-background: var(--zeno-color-background-subtle);
        --toggle-hover-background: var(--zeno-color-background-hover);
        --toggle-active-background: var(--zeno-color-accent-solid);
        --toggle-color: var(--zeno-color-text-primary);
        --toggle-transition: all var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);

        display: inline-block;
      }

      /* Toggle button */
      .theme-toggle {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--toggle-size);
        height: var(--toggle-size);
        padding: 0;
        border: none;
        background: var(--toggle-background);
        color: var(--toggle-color);
        cursor: pointer;
        border-radius: var(--zeno-radius-full);
        transition: var(--toggle-transition);
        overflow: hidden;
      }

      /* Size variants */
      .theme-toggle--sm {
        --toggle-size: var(--toggle-size-sm);
        --toggle-icon-size: var(--toggle-icon-size-sm);
      }

      .theme-toggle--md {
        --toggle-size: var(--toggle-size-md);
        --toggle-icon-size: var(--toggle-icon-size-md);
      }

      .theme-toggle--lg {
        --toggle-size: var(--toggle-size-lg);
        --toggle-icon-size: var(--toggle-icon-size-lg);
      }

      /* Hover state */
      .theme-toggle:hover {
        background: var(--toggle-hover-background);
        transform: scale(1.05);
      }

      /* Focus state */
      .theme-toggle:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
      }

      /* Active state */
      .theme-toggle:active {
        transform: scale(0.95);
      }

      /* Icon container */
      .theme-toggle__icon {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--toggle-transition);
      }

      /* Icon states */
      .theme-toggle__icon--sun {
        opacity: 1;
        transform: rotate(0deg) scale(1);
      }

      .theme-toggle__icon--moon {
        opacity: 0;
        transform: rotate(-180deg) scale(0);
      }

      .theme-toggle--dark .theme-toggle__icon--sun {
        opacity: 0;
        transform: rotate(180deg) scale(0);
      }

      .theme-toggle--dark .theme-toggle__icon--moon {
        opacity: 1;
        transform: rotate(0deg) scale(1);
      }

      /* Animated variant */
      .theme-toggle--animated .theme-toggle__icon {
        transition: all var(--zeno-motion-duration-lg)
          var(--zeno-motion-easing-spring);
      }

      /* Minimal variant */
      .theme-toggle--minimal {
        background: transparent;
      }

      .theme-toggle--minimal:hover {
        background: var(--toggle-hover-background);
      }

      /* Outlined variant */
      .theme-toggle--outlined {
        background: transparent;
        border: 2px solid var(--zeno-color-border-default);
      }

      .theme-toggle--outlined:hover {
        border-color: var(--zeno-color-accent-solid);
        background: var(--zeno-color-accent-subtle);
      }

      /* System indicator */
      .theme-toggle__system {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 8px;
        height: 8px;
        background: var(--zeno-color-accent-solid);
        border: 2px solid var(--toggle-background);
        border-radius: 50%;
        opacity: 0;
        transition: opacity var(--toggle-transition);
      }

      .theme-toggle--system .theme-toggle__system {
        opacity: 1;
      }

      /* Loading state */
      .theme-toggle--loading {
        pointer-events: none;
      }

      .theme-toggle--loading .theme-toggle__icon {
        animation: rotate 1s linear infinite;
      }

      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .theme-toggle {
          border: 2px solid ButtonText;
        }

        .theme-toggle:hover {
          outline: 1px solid ButtonText;
        }

        .theme-toggle:focus-visible {
          outline-width: 3px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .theme-toggle,
        .theme-toggle__icon {
          transition: none;
        }

        .theme-toggle:hover {
          transform: none;
        }

        .theme-toggle--loading .theme-toggle__icon {
          animation: none;
        }

        .theme-toggle--animated .theme-toggle__icon {
          transition: opacity 0.2s ease;
        }
      }

      /* Print styles */
      @media print {
        .theme-toggle {
          display: none;
        }
      }
    `,
  ];

  /**
   * The chosen theme. `system` follows the operating system and leaves the
   * document without a `data-theme` attribute.
   */
  @property() theme: ThemePreference = 'system';
  @property({ reflect: true }) size: ThemeToggleSize = 'md';
  @property({ reflect: true }) variant: 'default' | 'minimal' | 'outlined' =
    'default';
  @property({ type: Boolean, reflect: true }) animated = true;
  @property({ type: Boolean, reflect: true, attribute: 'show-system' })
  showSystem = false;
  @property({ type: Boolean, reflect: true }) loading = false;

  @state() private resolvedTheme: ThemeName = 'light';
  @state() private systemPreference: ThemeName = 'light';

  private stopListening?: () => void;

  /**
   * Connected callback
   */
  override connectedCallback(): void {
    super.connectedCallback();

    this.systemPreference = getSystemTheme();
    this.stopListening = onSystemThemeChange(theme => {
      this.systemPreference = theme;
      if (this.theme === 'system') {
        this.updateCurrentTheme();
      }
    });

    this.updateCurrentTheme();
  }

  /**
   * Disconnected callback
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopListening?.();
    this.stopListening = undefined;
  }

  /**
   * Updated lifecycle
   */
  protected override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('theme')) {
      this.updateCurrentTheme();
    }
  }

  /**
   * Resolve the chosen theme and write it to the document
   */
  private updateCurrentTheme(): void {
    const resolved =
      this.theme === 'system' ? this.systemPreference : this.theme;
    const changed = resolved !== this.resolvedTheme;
    this.resolvedTheme = resolved;

    setTheme(this.theme);

    if (changed) {
      this.emitEvent('theme-change', { theme: resolved });
    }
  }

  /**
   * Toggle theme
   */
  toggle(): void {
    if (this.loading) return;

    if (this.showSystem) {
      // Cycle through light -> dark -> system
      if (this.theme === 'light') {
        this.theme = 'dark';
      } else if (this.theme === 'dark') {
        this.theme = 'system';
      } else {
        this.theme = 'light';
      }
    } else {
      // Switch to the opposite of what is showing
      this.theme = this.resolvedTheme === 'light' ? 'dark' : 'light';
    }

    this.updateCurrentTheme();
    this.emitEvent('toggle', { theme: this.theme });
  }

  /**
   * Handle click
   */
  private handleClick(): void {
    this.toggle();
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    }
  }

  /**
   * Get icon size
   */
  private getIconSize(): string {
    const sizeMap = {
      sm: '16',
      md: '20',
      lg: '24',
    };
    return sizeMap[this.size];
  }

  /**
   * Get aria label
   */
  private getAriaLabel(): string {
    if (this.ariaLabel) return this.ariaLabel;

    if (this.theme === 'system') {
      return `Theme: System (currently ${this.resolvedTheme})`;
    }

    return `Theme: ${this.theme}`;
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      'theme-toggle': true,
      [`theme-toggle--${this.size}`]: true,
      [`theme-toggle--${this.variant}`]: true,
      'theme-toggle--animated': this.animated,
      'theme-toggle--dark': this.resolvedTheme === 'dark',
      'theme-toggle--system': this.theme === 'system',
      'theme-toggle--loading': this.loading,
    };

    const iconSize = this.getIconSize();

    return html`
      <button
        class=${classMap(classes)}
        part="base"
        type="button"
        aria-label=${this.getAriaLabel()}
        aria-pressed=${this.resolvedTheme === 'dark' ? 'true' : 'false'}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <span class="theme-toggle__icon theme-toggle__icon--sun" part="sun">
          <zeno-icon name="sun" size=${iconSize}></zeno-icon>
        </span>
        <span class="theme-toggle__icon theme-toggle__icon--moon" part="moon">
          <zeno-icon name="moon" size=${iconSize}></zeno-icon>
        </span>

        ${
          this.showSystem
            ? html`<span class="theme-toggle__system" part="system"></span>`
            : ''
        }
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-theme-toggle': ZenoThemeToggle;
  }
}

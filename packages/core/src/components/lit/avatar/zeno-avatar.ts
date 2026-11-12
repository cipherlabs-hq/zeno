import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { AvatarSize, AvatarShape, AvatarVariant } from '../types.js';

/**
 * A picture of a person or thing, falling back to initials or an icon when
 * there is no image.
 *
 * @fires {CustomEvent} load - The image loaded.
 * @fires {CustomEvent} error - The image failed to load and the fallback is showing.
 * @csspart badge
 * @csspart base
 * @csspart icon
 * @csspart image
 * @csspart initials
 * @csspart status
 */
@customElement('zeno-avatar')
export class ZenoAvatar extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --avatar-size-xs: 24px;
        --avatar-size-sm: 32px;
        --avatar-size-md: 40px;
        --avatar-size-lg: 48px;
        --avatar-size-xl: 64px;
        --avatar-size-2xl: 96px;
        --avatar-font-size-xs: var(--zeno-font-size-xs);
        --avatar-font-size-sm: var(--zeno-font-size-sm);
        --avatar-font-size-md: var(--zeno-font-size-md);
        --avatar-font-size-lg: var(--zeno-font-size-lg);
        --avatar-font-size-xl: var(--zeno-font-size-xl);
        --avatar-font-size-2xl: var(--zeno-font-size-2xl);
        --avatar-background: var(--zeno-color-background-muted);
        --avatar-color: var(--zeno-color-text-secondary);
        --avatar-border-width: 2px;
        --avatar-border-color: var(--zeno-color-background-surface);
        --avatar-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: inline-block;
      }

      /* Avatar container */
      .avatar {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--avatar-size);
        height: var(--avatar-size);
        font-size: var(--avatar-font-size);
        font-weight: var(--zeno-font-weight-medium);
        line-height: 1;
        color: var(--avatar-color);
        background: var(--avatar-background);
        user-select: none;
        overflow: hidden;
        transition: var(--avatar-transition);
      }

      /* Size variants */
      .avatar--xs {
        --avatar-size: var(--avatar-size-xs);
        --avatar-font-size: var(--avatar-font-size-xs);
      }

      .avatar--sm {
        --avatar-size: var(--avatar-size-sm);
        --avatar-font-size: var(--avatar-font-size-sm);
      }

      .avatar--md {
        --avatar-size: var(--avatar-size-md);
        --avatar-font-size: var(--avatar-font-size-md);
      }

      .avatar--lg {
        --avatar-size: var(--avatar-size-lg);
        --avatar-font-size: var(--avatar-font-size-lg);
      }

      .avatar--xl {
        --avatar-size: var(--avatar-size-xl);
        --avatar-font-size: var(--avatar-font-size-xl);
      }

      .avatar--2xl {
        --avatar-size: var(--avatar-size-2xl);
        --avatar-font-size: var(--avatar-font-size-2xl);
      }

      /* Shape variants */
      .avatar--circle {
        border-radius: 50%;
      }

      .avatar--square {
        border-radius: var(--zeno-radius-md);
      }

      .avatar--rounded {
        border-radius: var(--zeno-radius-lg);
      }

      /* Variant colors */
      .avatar--primary {
        --avatar-background: var(--zeno-color-accent-solid);
        --avatar-color: var(--zeno-color-accent-on-solid);
      }

      .avatar--secondary {
        --avatar-background: var(--zeno-color-background-subtle);
        --avatar-color: var(--zeno-color-text-primary);
      }

      .avatar--success {
        --avatar-background: var(--zeno-color-success-solid);
        --avatar-color: var(--zeno-color-success-on-solid);
      }

      .avatar--warning {
        --avatar-background: var(--zeno-color-warning-solid);
        --avatar-color: var(--zeno-color-warning-on-solid);
      }

      .avatar--error {
        --avatar-background: var(--zeno-color-danger-solid);
        --avatar-color: var(--zeno-color-danger-on-solid);
      }

      .avatar--info {
        --avatar-background: var(--zeno-color-info-solid);
        --avatar-color: var(--zeno-color-info-on-solid);
      }

      /* Bordered */
      .avatar--bordered {
        border: var(--avatar-border-width) solid var(--avatar-border-color);
      }

      /* Interactive states */
      .avatar--clickable {
        cursor: pointer;
      }

      .avatar--clickable:hover {
        opacity: 0.8;
        transform: scale(1.05);
      }

      .avatar--clickable:active {
        transform: scale(0.95);
      }

      /* Image */
      .avatar__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* Icon */
      .avatar__icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Initials */
      .avatar__initials {
        text-transform: uppercase;
      }

      /* Status indicator */
      .avatar__status {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 25%;
        height: 25%;
        min-width: 8px;
        min-height: 8px;
        background: var(--zeno-color-background-subtle);
        border: 2px solid var(--avatar-border-color);
        border-radius: 50%;
      }

      .avatar__status--online {
        background: var(--zeno-color-success-solid);
      }

      .avatar__status--offline {
        background: var(--zeno-color-text-tertiary);
      }

      .avatar__status--busy {
        background: var(--zeno-color-danger-solid);
      }

      .avatar__status--away {
        background: var(--zeno-color-warning-solid);
      }

      /* Badge */
      .avatar__badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        padding: 0 var(--zeno-spacing-1);
        background: var(--zeno-color-danger-solid);
        color: var(--zeno-color-danger-on-solid);
        font-size: var(--zeno-font-size-xs);
        font-weight: var(--zeno-font-weight-bold);
        line-height: 18px;
        text-align: center;
        border-radius: var(--zeno-radius-full);
        border: 2px solid var(--avatar-border-color);
      }

      /* Group styling (when used in avatar groups) */
      :host(.avatar-group-item) {
        margin-left: calc(var(--avatar-size) * -0.25);
      }

      :host(.avatar-group-item:first-child) {
        margin-left: 0;
      }

      :host(.avatar-group-item) .avatar {
        border: var(--avatar-border-width) solid var(--avatar-border-color);
      }

      /* Loading state */
      .avatar--loading {
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .avatar {
          border: 2px solid ButtonText;
        }

        .avatar__status,
        .avatar__badge {
          border-color: ButtonFace;
          border-width: 3px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .avatar {
          transition: none;
        }

        .avatar--clickable:hover {
          transform: none;
        }

        .avatar--loading {
          animation: none;
        }
      }

      /* Print styles */
      @media print {
        .avatar {
          border: 1px solid #000;
        }

        .avatar__status,
        .avatar__badge {
          display: none;
        }
      }
    `,
  ];

  @property() src?: string;
  @property() alt?: string;
  @property() name?: string;
  @property() initials?: string;
  @property() icon?: string;
  @property({ reflect: true }) size: AvatarSize = 'md';
  @property({ reflect: true }) shape: AvatarShape = 'circle';
  @property({ reflect: true }) variant: AvatarVariant = 'solid';
  @property({ reflect: true }) status?: 'online' | 'offline' | 'busy' | 'away';
  @property({ type: Number }) badge?: number;
  @property({ type: Boolean, reflect: true }) bordered = false;
  @property({ type: Boolean, reflect: true }) clickable = false;

  @state() private imageError = false;
  @state() private imageLoading = true;

  /**
   * Generate initials from name
   */
  private getInitials(): string {
    if (this.initials) return this.initials;

    if (!this.name) return '';

    const parts = this.name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Get icon size based on avatar size
   */
  private getIconSize(): string {
    const sizeMap: Record<AvatarSize, string> = {
      xs: '12',
      sm: '16',
      md: '20',
      lg: '24',
      xl: '32',
      '2xl': '48',
    };
    return sizeMap[this.size];
  }

  /**
   * Handle image load
   */
  private handleImageLoad(): void {
    this.imageLoading = false;
    this.emitEvent('load');
  }

  /**
   * Handle image error
   */
  private handleImageError(): void {
    this.imageError = true;
    this.imageLoading = false;
    this.emitEvent('error');
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.clickable) return;
    // Only for the element itself: a key pressed in something inside it,
    // such as a button, belongs to that control.
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // A real click, so that listeners get the same event as from a pointer.
      (event.currentTarget as HTMLElement).click();
    }
  }

  /**
   * Render avatar content
   */
  private renderContent() {
    // Show image if available and not errored
    if (this.src && !this.imageError) {
      return html`
        <img
          class="avatar__image"
          part="image"
          src=${this.src}
          alt=${this.alt || this.name || 'Avatar'}
          @load=${this.handleImageLoad}
          @error=${this.handleImageError}
        />
      `;
    }

    // Show icon if specified
    if (this.icon) {
      return html`
        <span class="avatar__icon" part="icon">
          <zeno-icon name=${this.icon} size=${this.getIconSize()}></zeno-icon>
        </span>
      `;
    }

    // Show initials
    const initials = this.getInitials();
    if (initials) {
      return html`
        <span class="avatar__initials" part="initials"> ${initials} </span>
      `;
    }

    // Default icon
    return html`
      <span class="avatar__icon" part="icon">
        <zeno-icon name="user" size=${this.getIconSize()}></zeno-icon>
      </span>
    `;
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      avatar: true,
      [`avatar--${this.size}`]: true,
      [`avatar--${this.shape}`]: true,
      [`avatar--${this.variant}`]: true,
      'avatar--bordered': this.bordered,
      'avatar--clickable': this.clickable,
      'avatar--loading': !!(this.imageLoading && this.src && !this.imageError),
    };

    const role = this.clickable ? 'button' : 'img';
    const tabindex = this.clickable ? '0' : undefined;

    return html`
      <div
        class=${classMap(classes)}
        part="base"
        role=${role}
        tabindex=${ifDefined(tabindex)}
        aria-label=${this.ariaLabel || this.alt || this.name || 'Avatar'}
        @keydown=${this.handleKeyDown}
      >
        ${this.renderContent()}
        ${
          this.status
            ? html`
                <span
                  class=${`avatar__status avatar__status--${this.status}`}
                  part="status"
                  aria-label=${`Status: ${this.status}`}
                ></span>
              `
            : nothing
        }
        ${
          this.badge !== undefined
            ? html`
                <span
                  class="avatar__badge"
                  part="badge"
                  aria-label=${`${this.badge} notifications`}
                >
                  ${this.badge > 99 ? '99+' : this.badge}
                </span>
              `
            : nothing
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-avatar': ZenoAvatar;
  }
}

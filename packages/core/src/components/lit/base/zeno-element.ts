/**
 * Base class for all Zeno Lit components
 * Shared styles, event helpers and focus handling. Colours, spacing and type
 * come from the --zeno-* custom properties in @usezeno/tokens/css, which the
 * page must load; elements carry no fallback values of their own.
 */

import { LitElement, type CSSResultGroup, css } from 'lit';

export class ZenoElement extends LitElement {
  /**
   * Global styles shared by all Zeno components
   * Includes CSS custom properties, base resets, and accessibility defaults
   */
  static baseStyles = css`
    :host {
      /* Component defaults */
      box-sizing: border-box;
      display: block;
      font-family: var(--zeno-font-family-sans);

      /* Accessibility defaults */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    :host([hidden]) {
      display: none !important;
    }

    :host([disabled]) {
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Reset box model for all elements */
    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }

    /* Focus visible for accessibility */
    :focus-visible {
      outline: var(--zeno-focus-ring-width) solid var(--zeno-color-focus-ring);
      outline-offset: var(--zeno-focus-ring-offset);
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Forced colours (Windows high contrast): keep the focus ring visible */
    @media (forced-colors: active) {
      :focus-visible {
        outline-color: Highlight;
      }
    }

    /* Slot styling */
    ::slotted(*) {
      font-family: inherit;
    }
  `;

  /**
   * Elements replace this with their own list, which starts with baseStyles.
   * It is a field, not a getter, so that `static styles = [...]` in a subclass
   * can assign over it.
   */
  static override styles: CSSResultGroup = [this.baseStyles];

  /**
   * Common properties shared by components
   */
  /** Test ID for automated testing */
  testId?: string;

  /**
   * Check if reduced motion is preferred
   */
  protected get prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Sends an event from the element. It does not bubble or leave the shadow
   * root the element sits in: with plain names such as `close` and `change`,
   * a bubbling event would also reach the listeners of every Zeno element
   * around this one.
   */
  protected emitEvent<T = unknown>(
    eventName: string,
    detail?: T,
    options?: EventInit
  ): boolean {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: false,
      composed: false,
      cancelable: false,
      ...options,
    });
    return this.dispatchEvent(event);
  }

  /**
   * Sends `input` or `change` from a form control. These bubble and cross
   * shadow roots, as the events of a native control do, so that a form or
   * any ancestor can listen for them.
   */
  protected emitValueEvent<T = unknown>(
    eventName: 'input' | 'change',
    detail?: T
  ): boolean {
    return this.emitEvent(eventName, detail, { bubbles: true, composed: true });
  }

  /**
   * Generate CSS classes with proper BEM naming
   */
  protected generateClasses(
    baseClass: string,
    modifiers: Record<string, boolean | string | undefined> = {},
    additionalClasses: string[] = []
  ): string {
    const classes = [baseClass];

    // Add modifier classes
    Object.entries(modifiers).forEach(([key, value]) => {
      if (value === true) {
        classes.push(`${baseClass}--${key}`);
      } else if (typeof value === 'string' && value) {
        classes.push(`${baseClass}--${key}-${value}`);
      }
    });

    // Add additional classes
    classes.push(...additionalClasses.filter(Boolean));

    return classes.join(' ');
  }

  /**
   * Apply common ARIA attributes
   */
  protected applyAriaAttributes(element: HTMLElement): void {
    if (this.ariaLabel) {
      element.setAttribute('aria-label', this.ariaLabel);
    }
    if ((this as { disabled?: boolean }).disabled) {
      element.setAttribute('aria-disabled', 'true');
    }
    if (this.testId) {
      element.setAttribute('data-testid', this.testId);
    }
  }

  /**
   * Focus the component or its first focusable element
   */
  override focus(): void {
    const focusable = this.shadowRoot?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      focusable.focus();
    } else {
      super.focus();
    }
  }

  /**
   * Blur the component or its focused element
   */
  override blur(): void {
    const focused = this.shadowRoot?.activeElement as HTMLElement;
    if (focused) {
      focused.blur();
    } else {
      super.blur();
    }
  }
}

/**
 * Framework-agnostic focus trap utility
 * Manages focus within a container element and restores focus when deactivated
 */

export interface FocusTrapOptions {
  /** Initial element to focus when activated */
  initialFocus?: HTMLElement | (() => HTMLElement);
  /** Element to focus when deactivated */
  returnFocus?: HTMLElement | (() => HTMLElement);
  /** Allow clicking outside to close */
  allowOutsideClick?: boolean;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
}

export interface FocusTrap {
  activate: () => void;
  deactivate: () => void;
  isActive: () => boolean;
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
    'audio[controls]',
    'video[controls]',
    'iframe',
    'embed',
    'object',
    'summary',
  ].join(', ');

  return Array.from(
    container.querySelectorAll(focusableSelectors)
  ) as HTMLElement[];
}

/**
 * Creates a focus trap for the given container element
 */
export function createFocusTrap(
  container: HTMLElement,
  options: FocusTrapOptions = {}
): FocusTrap {
  let isActive = false;
  let previouslyFocusedElement: HTMLElement | null = null;
  let focusableElements: HTMLElement[] = [];

  const {
    initialFocus,
    returnFocus,
    allowOutsideClick = false,
    onEscape,
  } = options;

  /**
   * Handle keydown events for focus management
   */
  function handleKeyDown(event: KeyboardEvent) {
    if (!isActive) return;

    // Handle escape key
    if (event.key === 'Escape') {
      event.preventDefault();
      if (onEscape) {
        onEscape();
      } else {
        deactivate();
      }
      return;
    }

    // Handle tab navigation
    if (event.key === 'Tab') {
      event.preventDefault();

      focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        return;
      }

      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement
      );

      let nextIndex: number;

      if (event.shiftKey) {
        // Shift + Tab (backward)
        nextIndex =
          currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
      } else {
        // Tab (forward)
        nextIndex =
          currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
      }

      focusableElements[nextIndex]?.focus();
    }
  }

  /**
   * Handle click events outside the container
   */
  function handleOutsideClick(event: MouseEvent) {
    if (!isActive || !allowOutsideClick) return;

    const target = event.target as HTMLElement;
    if (!container.contains(target)) {
      deactivate();
    }
  }

  /**
   * Handle focus events to ensure focus stays within container
   */
  function handleFocusIn(event: FocusEvent) {
    if (!isActive) return;

    const target = event.target as HTMLElement;

    // If focus moves outside container, redirect to first focusable element
    if (!container.contains(target)) {
      event.preventDefault();
      const firstFocusable = getFocusableElements(container)[0];
      firstFocusable?.focus();
    }
  }

  /**
   * Activate the focus trap
   */
  function activate() {
    if (isActive) return;

    // Store the currently focused element
    previouslyFocusedElement = document.activeElement as HTMLElement;

    // Get all focusable elements
    focusableElements = getFocusableElements(container);

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    if (allowOutsideClick) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    // Set initial focus
    let elementToFocus: HTMLElement | null = null;

    if (initialFocus) {
      elementToFocus =
        typeof initialFocus === 'function' ? initialFocus() : initialFocus;
    } else if (focusableElements.length > 0) {
      elementToFocus = focusableElements[0];
    }

    if (elementToFocus) {
      // Use setTimeout to ensure DOM updates are complete
      setTimeout(() => {
        elementToFocus?.focus();
      }, 0);
    }

    isActive = true;
  }

  /**
   * Deactivate the focus trap
   */
  function deactivate() {
    if (!isActive) return;

    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('focusin', handleFocusIn);
    document.removeEventListener('mousedown', handleOutsideClick);

    // Restore focus to previously focused element
    let elementToFocus: HTMLElement | null = null;

    if (returnFocus) {
      elementToFocus =
        typeof returnFocus === 'function' ? returnFocus() : returnFocus;
    } else if (previouslyFocusedElement) {
      elementToFocus = previouslyFocusedElement;
    }

    if (elementToFocus && document.contains(elementToFocus)) {
      elementToFocus.focus();
    }

    isActive = false;
    previouslyFocusedElement = null;
    focusableElements = [];
  }

  /**
   * Check if the focus trap is currently active
   */
  function getIsActive(): boolean {
    return isActive;
  }

  return {
    activate,
    deactivate,
    isActive: getIsActive,
  };
}

/**
 * Utility to check if an element can receive focus
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableElements = getFocusableElements(
    element.parentElement || document.body
  );
  return focusableElements.includes(element);
}

/**
 * Utility to find the next focusable element
 */
export function getNextFocusableElement(
  current: HTMLElement,
  direction: 'forward' | 'backward' = 'forward'
): HTMLElement | null {
  const container = current.closest(
    '[role="dialog"], [role="menu"], body'
  ) as HTMLElement;
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(current);

  if (currentIndex === -1) return null;

  const nextIndex =
    direction === 'forward'
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) %
        focusableElements.length;

  return focusableElements[nextIndex] || null;
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createFocusTrap } from './focusTrap.js';

// Mock DOM elements and methods
const mockFocus = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Create mock elements
function createMockElement(tagName = 'div', focusable = false): HTMLElement {
  const element = {
    tagName: tagName.toUpperCase(),
    focus: mockFocus,
    contains: vi.fn(other => other === element),
    closest: vi.fn(() => element),
    parentElement: null,
    querySelectorAll: vi.fn(() => []),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
  } as unknown as HTMLElement;

  if (focusable) {
    element.tabIndex = 0;
  }

  return element;
}

describe('focusTrap', () => {
  let container: HTMLElement;
  let focusableButton: HTMLElement;
  let focusableInput: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup DOM structure
    container = createMockElement('div');
    focusableButton = createMockElement('button', true);
    focusableInput = createMockElement('input', true);

    // Mock querySelectorAll to return focusable elements
    container.querySelectorAll = vi.fn(selector => {
      if (
        selector.includes('button') ||
        selector.includes('input') ||
        selector.includes('[tabindex]')
      ) {
        return [focusableButton, focusableInput];
      }
      return [];
    }) as unknown as typeof container.querySelectorAll;

    // Mock document
    Object.defineProperty(globalThis, 'document', {
      value: {
        activeElement: focusableButton,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        contains: vi.fn(() => true),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createFocusTrap', () => {
    it('should create focus trap with activate and deactivate methods', () => {
      const trap = createFocusTrap(container);

      expect(trap).toHaveProperty('activate');
      expect(trap).toHaveProperty('deactivate');
      expect(trap).toHaveProperty('isActive');
      expect(typeof trap.activate).toBe('function');
      expect(typeof trap.deactivate).toBe('function');
      expect(typeof trap.isActive).toBe('function');
    });

    it('should not be active initially', () => {
      const trap = createFocusTrap(container);
      expect(trap.isActive()).toBe(false);
    });

    it('should activate focus trap and add event listeners', () => {
      const trap = createFocusTrap(container);

      trap.activate();

      expect(trap.isActive()).toBe(true);
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'focusin',
        expect.any(Function)
      );
    });

    it('should deactivate focus trap and remove event listeners', () => {
      const trap = createFocusTrap(container);

      trap.activate();
      trap.deactivate();

      expect(trap.isActive()).toBe(false);
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'focusin',
        expect.any(Function)
      );
    });

    it('should focus first focusable element on activate', () => {
      const trap = createFocusTrap(container);

      // Use setTimeout to simulate the async focus behavior
      vi.useFakeTimers();
      trap.activate();
      vi.runAllTimers();

      expect(mockFocus).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('should handle escape key when onEscape callback provided', () => {
      const onEscape = vi.fn();
      const trap = createFocusTrap(container, { onEscape });

      trap.activate();

      // Get the keydown handler
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];

      expect(keydownHandler).toBeDefined();

      // Simulate escape key press
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      Object.defineProperty(escapeEvent, 'preventDefault', {
        value: vi.fn(),
        writable: true,
      });

      keydownHandler(escapeEvent);

      expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('should handle tab navigation within focusable elements', () => {
      const trap = createFocusTrap(container);

      trap.activate();

      // Get the keydown handler
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];

      expect(keydownHandler).toBeDefined();

      // Mock document.activeElement
      Object.defineProperty(document, 'activeElement', {
        value: focusableButton,
        writable: true,
      });

      // Simulate tab key press
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      Object.defineProperty(tabEvent, 'preventDefault', {
        value: vi.fn(),
        writable: true,
      });

      keydownHandler(tabEvent);

      expect(tabEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle shift+tab navigation (backward)', () => {
      const trap = createFocusTrap(container);

      trap.activate();

      // Get the keydown handler
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];

      // Mock activeElement as the second focusable element
      Object.defineProperty(document, 'activeElement', {
        value: focusableInput,
        writable: true,
      });

      // Simulate shift+tab key press
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
      });
      Object.defineProperty(shiftTabEvent, 'preventDefault', {
        value: vi.fn(),
        writable: true,
      });

      keydownHandler(shiftTabEvent);

      expect(shiftTabEvent.preventDefault).toHaveBeenCalled();
    });

    it('should restore focus to previously focused element on deactivate', () => {
      const previousElement = createMockElement('button', true);

      // Mock document.activeElement to return the previous element initially
      Object.defineProperty(document, 'activeElement', {
        value: previousElement,
        writable: true,
      });

      const trap = createFocusTrap(container);

      trap.activate();
      trap.deactivate();

      expect(previousElement.focus).toHaveBeenCalled();
    });

    it('should use custom initialFocus when provided', () => {
      const customFocusElement = createMockElement('input', true);
      const trap = createFocusTrap(container, {
        initialFocus: customFocusElement,
      });

      vi.useFakeTimers();
      trap.activate();
      vi.runAllTimers();

      expect(customFocusElement.focus).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should use custom returnFocus when provided', () => {
      const customReturnElement = createMockElement('button', true);
      const trap = createFocusTrap(container, {
        returnFocus: customReturnElement,
      });

      trap.activate();
      trap.deactivate();

      expect(customReturnElement.focus).toHaveBeenCalled();
    });

    it('should handle outside click when allowOutsideClick is true', () => {
      const trap = createFocusTrap(container, {
        allowOutsideClick: true,
      });

      trap.activate();

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'mousedown',
        expect.any(Function)
      );
    });

    it('should not add outside click listener when allowOutsideClick is false', () => {
      const trap = createFocusTrap(container, {
        allowOutsideClick: false,
      });

      trap.activate();

      const mousedownCall = mockAddEventListener.mock.calls.find(
        call => call[0] === 'mousedown'
      );

      expect(mousedownCall).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle container with no focusable elements', () => {
      const emptyContainer = createMockElement('div');
      emptyContainer.querySelectorAll = vi.fn(
        () => []
      ) as unknown as typeof emptyContainer.querySelectorAll;

      const trap = createFocusTrap(emptyContainer);

      expect(() => {
        trap.activate();
        trap.deactivate();
      }).not.toThrow();
    });

    it('should not activate if already active', () => {
      const trap = createFocusTrap(container);

      trap.activate();
      const firstCallCount = mockAddEventListener.mock.calls.length;

      trap.activate(); // Second activation should be ignored
      const secondCallCount = mockAddEventListener.mock.calls.length;

      expect(firstCallCount).toBe(secondCallCount);
    });

    it('should not deactivate if not active', () => {
      const trap = createFocusTrap(container);

      // Try to deactivate without activating first
      expect(() => {
        trap.deactivate();
      }).not.toThrow();

      expect(mockRemoveEventListener).not.toHaveBeenCalled();
    });
  });
});

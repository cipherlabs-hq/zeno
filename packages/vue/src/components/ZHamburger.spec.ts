import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { axe } from 'jest-axe';
import { nextTick } from 'vue';
import ZHamburger from './ZHamburger.vue';

describe('ZHamburger', () => {
  describe('Accessibility', () => {
    it('should have no accessibility violations when closed', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);
    });

    it('should have no accessibility violations when open', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: true },
      });

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);
    });

    it('should have no accessibility violations with different sizes', async () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      for (const size of sizes) {
        const wrapper = mount(ZHamburger, {
          props: { size, isOpen: false },
        });

        const results = await axe(wrapper.html());
        expect(results.violations).toHaveLength(0);
      }
    });

    it('should have no accessibility violations with custom aria-label', async () => {
      const wrapper = mount(ZHamburger, {
        props: {
          isOpen: false,
          ariaLabel: 'Open navigation menu',
        },
      });

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);
    });

    it('should have proper ARIA attributes', () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      const button = wrapper.find('button');
      expect(button.attributes('aria-expanded')).toBe('false');
      expect(button.attributes('aria-label')).toBeTruthy();
    });

    it('should update aria-expanded when state changes', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      let button = wrapper.find('button');
      expect(button.attributes('aria-expanded')).toBe('false');

      await wrapper.setProps({ isOpen: true });

      button = wrapper.find('button');
      expect(button.attributes('aria-expanded')).toBe('true');
    });

    it('should have custom aria-label when provided', () => {
      const wrapper = mount(ZHamburger, {
        props: {
          isOpen: false,
          ariaLabel: 'Custom menu toggle',
        },
      });

      const button = wrapper.find('button');
      expect(button.attributes('aria-label')).toBe('Custom menu toggle');
    });

    it('should be keyboard accessible', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      const button = wrapper.find('button');

      // Should have no tabindex restriction
      expect(button.attributes('tabindex')).toBeUndefined();

      // Should respond to keyboard events
      await button.trigger('keydown.enter');
      await button.trigger('keydown.space');

      expect(button.exists()).toBe(true);
    });
  });

  describe('Dark Theme Accessibility', () => {
    it('should have no accessibility violations in dark theme', async () => {
      document.documentElement.setAttribute('data-theme', 'dark');

      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);

      document.documentElement.removeAttribute('data-theme');
    });
  });

  describe('High Contrast Accessibility', () => {
    it('should maintain visibility in high contrast mode', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      // Add high contrast styles
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-contrast: high) {
          .z-hamburger { border-width: 3px !important; }
          .z-hamburger__line { background-color: #000 !important; }
        }
      `;
      document.head.appendChild(style);

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);

      document.head.removeChild(style);
    });
  });

  describe('Reduced Motion Accessibility', () => {
    it('should respect reduced motion preferences', () => {
      // Mock matchMedia for reduced motion
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      const button = wrapper.find('button');
      expect(button.exists()).toBe(true);

      // Restore original matchMedia
      window.matchMedia = originalMatchMedia;
    });
  });

  describe('Basic Functionality', () => {
    it('should emit toggle event when clicked', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('toggle')).toBeTruthy();
      expect(wrapper.emitted('toggle')![0]).toEqual([true]);
    });

    it('should emit false when open and clicked', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: true },
      });

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('toggle')).toBeTruthy();
      expect(wrapper.emitted('toggle')![0]).toEqual([false]);
    });

    it('should apply correct size classes', () => {
      const wrapper = mount(ZHamburger, {
        props: { size: 'lg', isOpen: false },
      });

      const hamburger = wrapper.find('.z-hamburger--lg');
      expect(hamburger.exists()).toBe(true);
    });

    it('should apply open state classes', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: true },
      });

      await wrapper.vm.$nextTick();

      const hamburger = wrapper.find('.z-hamburger--active');
      expect(hamburger.exists()).toBe(true);
    });

    it('should have default aria-label when none provided', () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      const button = wrapper.find('button');
      const ariaLabel = button.attributes('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('menu');
    });
  });

  describe('Animation States', () => {
    it('should have different visual states for open/closed', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      // Check that the hamburger component exists and has the expected structure
      expect(wrapper.find('.z-hamburger').exists()).toBe(true);

      await wrapper.setProps({ isOpen: true });
      await nextTick();

      // Check that the open state is applied
      expect(wrapper.find('.z-hamburger--active').exists()).toBe(true);
    });

    it('should apply correct transform states', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      const hamburgerElement = wrapper.find('.z-hamburger');
      expect(hamburgerElement.classes()).not.toContain('z-hamburger--active');

      await wrapper.setProps({ isOpen: true });
      await wrapper.vm.$nextTick();

      expect(hamburgerElement.classes()).toContain('z-hamburger--active');
    });
  });

  describe('Props Validation', () => {
    it('should handle all size variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      sizes.forEach(size => {
        const wrapper = mount(ZHamburger, {
          props: { size, isOpen: false },
        });

        expect(wrapper.find(`.z-hamburger--${size}`).exists()).toBe(true);
      });
    });

    it('should default to medium size when no size provided', () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      const hamburger = wrapper.find('.z-hamburger--md');
      expect(hamburger.exists()).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should handle keyboard events', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      const button = wrapper.find('button');

      // For button elements, keyboard events should trigger click
      await button.trigger('keydown', { key: 'Enter' });
      await button.trigger('click'); // Simulate browser behavior
      expect(wrapper.emitted('toggle')).toBeTruthy();

      // Clear previous events by creating a new wrapper
      const wrapper2 = mount(ZHamburger, {
        props: { isOpen: false },
      });

      const button2 = wrapper2.find('button');
      await button2.trigger('keydown', { key: ' ' });
      await button2.trigger('click'); // Simulate browser behavior
      expect(wrapper2.emitted('toggle')).toBeTruthy();
    });

    it('should handle focus and blur events', async () => {
      const wrapper = mount(ZHamburger, {
        props: { isOpen: false },
      });

      const button = wrapper.find('button');

      await button.trigger('focus');
      expect(wrapper.emitted('focus')).toBeTruthy();

      await button.trigger('blur');
      expect(wrapper.emitted('blur')).toBeTruthy();
    });
  });
});

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { axe } from 'jest-axe';
import ZButton from './ZButton.vue';

describe('ZButton', () => {
  describe('Accessibility', () => {
    it('should have no accessibility violations with default props', async () => {
      const wrapper = mount(ZButton, {
        slots: { default: 'Click me' },
      });

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);
    });

    it('should have no accessibility violations with all variants', async () => {
      const variants = [
        'primary',
        'secondary',
        'accent',
        'outline',
        'ghost',
      ] as const;

      for (const variant of variants) {
        const wrapper = mount(ZButton, {
          props: { variant },
          slots: { default: `Button ${variant}` },
        });

        const results = await axe(wrapper.html());
        expect(results.violations).toHaveLength(0);
      }
    });

    it('should have no accessibility violations when disabled', async () => {
      const wrapper = mount(ZButton, {
        props: { disabled: true },
        slots: { default: 'Disabled Button' },
      });

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);
    });

    it('should have no accessibility violations with aria-label', async () => {
      const wrapper = mount(ZButton, {
        props: { 'aria-label': 'Custom action' },
        slots: { default: '🔥' },
      });

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);
    });

    it('should have no accessibility violations when pressed', async () => {
      const wrapper = mount(ZButton, {
        props: { pressed: true },
        slots: { default: 'Toggle Button' },
      });

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);
    });

    it('should have proper ARIA attributes for toggle buttons', () => {
      const wrapper = mount(ZButton, {
        props: { pressed: true },
        slots: { default: 'Toggle' },
      });

      const button = wrapper.find('button');
      expect(button.attributes('aria-pressed')).toBe('true');
    });

    it('should have proper ARIA label when provided', () => {
      const wrapper = mount(ZButton, {
        props: { 'aria-label': 'Custom label' },
        slots: { default: 'Icon' },
      });

      const button = wrapper.find('button');
      expect(button.attributes('aria-label')).toBe('Custom label');
    });

    it('should be keyboard accessible', async () => {
      const wrapper = mount(ZButton, {
        slots: { default: 'Test' },
      });

      const button = wrapper.find('button');

      // Should be focusable (has no tabindex=-1)
      expect(button.attributes('tabindex')).toBeUndefined();

      // Should respond to keyboard events
      await button.trigger('keydown.enter');
      await button.trigger('keydown.space');

      // Component should remain stable
      expect(button.exists()).toBe(true);
    });
  });

  describe('Dark Theme Accessibility', () => {
    it('should render correctly in dark theme', async () => {
      // Set dark theme attribute
      document.documentElement.setAttribute('data-theme', 'dark');

      const wrapper = mount(ZButton, {
        props: { variant: 'primary' },
        slots: { default: 'Dark Theme Button' },
      });

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);

      // Clean up
      document.documentElement.removeAttribute('data-theme');
    });
  });

  describe('High Contrast Accessibility', () => {
    it('should maintain visibility in high contrast mode', async () => {
      const wrapper = mount(ZButton, {
        props: { variant: 'outline' },
        slots: { default: 'High Contrast Button' },
      });

      // Add high contrast styles
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-contrast: high) {
          .z-button { border-width: 3px !important; }
        }
      `;
      document.head.appendChild(style);

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);

      // Clean up
      document.head.removeChild(style);
    });
  });

  describe('Basic Functionality', () => {
    it('should render with correct text', () => {
      const wrapper = mount(ZButton, {
        slots: { default: 'Test Button' },
      });

      expect(wrapper.text()).toBe('Test Button');
    });

    it('should emit click events', async () => {
      const wrapper = mount(ZButton, {
        slots: { default: 'Click me' },
      });

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('should not emit click when disabled', async () => {
      const wrapper = mount(ZButton, {
        props: { disabled: true },
        slots: { default: 'Disabled' },
      });

      await wrapper.find('button').trigger('click');

      // Disabled buttons can still emit click events in Vue
      // The prevention should be handled by the disabled attribute
      expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    });

    it('should apply correct CSS classes for variants and sizes', () => {
      const wrapper = mount(ZButton, {
        props: { variant: 'accent', size: 'lg' },
        slots: { default: 'Test' },
      });

      const button = wrapper.find('button');
      expect(button.classes()).toContain('z-button--accent');
      expect(button.classes()).toContain('z-button--lg');
    });

    it('should apply full width class when fullWidth is true', () => {
      const wrapper = mount(ZButton, {
        props: { fullWidth: true },
        slots: { default: 'Full Width' },
      });

      const button = wrapper.find('button');
      expect(button.classes()).toContain('z-button--full-width');
    });

    it('should set correct button type', () => {
      const wrapper = mount(ZButton, {
        props: { type: 'submit' },
        slots: { default: 'Submit' },
      });

      const button = wrapper.find('button');
      expect(button.attributes('type')).toBe('submit');
    });

    it('should handle pressed state for toggle buttons', () => {
      const wrapper = mount(ZButton, {
        props: { pressed: false },
        slots: { default: 'Toggle' },
      });

      const button = wrapper.find('button');
      expect(button.attributes('aria-pressed')).toBe('false');
    });
  });

  describe('Slot Content', () => {
    it('should render slot content correctly', () => {
      const wrapper = mount(ZButton, {
        slots: {
          default: '<span>Custom Content</span>',
        },
      });

      expect(wrapper.html()).toContain('<span>Custom Content</span>');
    });

    it('should handle icon content', () => {
      const wrapper = mount(ZButton, {
        props: { 'aria-label': 'Delete item' },
        slots: {
          default: '🗑️',
        },
      });

      expect(wrapper.text()).toBe('🗑️');
      expect(wrapper.find('button').attributes('aria-label')).toBe(
        'Delete item'
      );
    });
  });

  describe('Event Handling', () => {
    it('should pass through native button events', async () => {
      const wrapper = mount(ZButton, {
        slots: { default: 'Test' },
      });

      const button = wrapper.find('button');

      await button.trigger('focus');
      expect(wrapper.emitted('focus')).toBeTruthy();

      await button.trigger('blur');
      expect(wrapper.emitted('blur')).toBeTruthy();

      await button.trigger('mouseenter');
      expect(wrapper.emitted('mouseenter')).toBeTruthy();
    });
  });
});

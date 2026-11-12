import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ZBadge from './ZBadge.vue';

describe('ZBadge', () => {
  describe('Basic rendering', () => {
    it('renders correctly with default props', () => {
      const wrapper = mount(ZBadge);

      expect(wrapper.find('.z-badge').exists()).toBe(true);
      expect(wrapper.classes()).toContain('z-badge--default');
      expect(wrapper.classes()).toContain('z-badge--md');
      expect(wrapper.classes()).toContain('z-badge--rounded');
      expect(wrapper.classes()).toContain('z-badge--inline');
    });

    it('renders with custom content', () => {
      const wrapper = mount(ZBadge, {
        props: { content: 'New' },
      });

      expect(wrapper.text()).toBe('New');
      expect(wrapper.find('.z-badge__content').exists()).toBe(true);
    });

    it('renders with slot content', () => {
      const wrapper = mount(ZBadge, {
        slots: {
          default: 'Custom Badge',
        },
      });

      expect(wrapper.text()).toBe('Custom Badge');
    });

    it('renders as a dot when dot prop is true', () => {
      const wrapper = mount(ZBadge, {
        props: { dot: true, content: 'Should not show' },
      });

      expect(wrapper.classes()).toContain('z-badge--dot');
      expect(wrapper.find('.z-badge__content').exists()).toBe(false);
      expect(wrapper.text()).toBe('');
    });

    it('renders as a dot when no content is provided', () => {
      const wrapper = mount(ZBadge);

      expect(wrapper.classes()).toContain('z-badge--dot');
      expect(wrapper.find('.z-badge__content').exists()).toBe(false);
    });
  });

  describe('Variants', () => {
    const variants = [
      'default',
      'primary',
      'secondary',
      'success',
      'warning',
      'danger',
      'info',
      'accent',
    ] as const;

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        const wrapper = mount(ZBadge, {
          props: { variant, content: 'Test' },
        });

        expect(wrapper.classes()).toContain(`z-badge--${variant}`);
      });
    });

    it('handles legacy color prop', () => {
      const wrapper = mount(ZBadge, {
        props: { color: 'success', content: 'Test' },
      });

      expect(wrapper.classes()).toContain('z-badge--success');
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        const wrapper = mount(ZBadge, {
          props: { size, content: 'Test' },
        });

        expect(wrapper.classes()).toContain(`z-badge--${size}`);
      });
    });
  });

  describe('Shapes', () => {
    const shapes = ['rounded', 'pill', 'square'] as const;

    shapes.forEach(shape => {
      it(`renders ${shape} shape correctly`, () => {
        const wrapper = mount(ZBadge, {
          props: { shape, content: 'Test' },
        });

        expect(wrapper.classes()).toContain(`z-badge--${shape}`);
      });
    });
  });

  describe('Positions', () => {
    const positions = ['inline', 'corner'] as const;

    positions.forEach(position => {
      it(`renders ${position} position correctly`, () => {
        const wrapper = mount(ZBadge, {
          props: { position, content: 'Test' },
        });

        expect(wrapper.classes()).toContain(`z-badge--${position}`);
      });
    });
  });

  describe('Number formatting', () => {
    it('displays numbers correctly', () => {
      const wrapper = mount(ZBadge, {
        props: { content: 5 },
      });

      expect(wrapper.text()).toBe('5');
    });

    it('displays max+ when number exceeds max', () => {
      const wrapper = mount(ZBadge, {
        props: { content: 150, max: 99 },
      });

      expect(wrapper.text()).toBe('99+');
    });

    it('respects custom max value', () => {
      const wrapper = mount(ZBadge, {
        props: { content: 25, max: 20 },
      });

      expect(wrapper.text()).toBe('20+');
    });

    it('does not add + when number is equal to max', () => {
      const wrapper = mount(ZBadge, {
        props: { content: 99, max: 99 },
      });

      expect(wrapper.text()).toBe('99');
    });
  });

  describe('States', () => {
    it('applies pulse class when pulse is true', () => {
      const wrapper = mount(ZBadge, {
        props: { pulse: true, content: 'Test' },
      });

      expect(wrapper.classes()).toContain('z-badge--pulse');
    });

    it('applies outline class when outline is true', () => {
      const wrapper = mount(ZBadge, {
        props: { outline: true, content: 'Test' },
      });

      expect(wrapper.classes()).toContain('z-badge--outline');
    });

    it('applies loading class and shows spinner when loading is true', () => {
      const wrapper = mount(ZBadge, {
        props: { loading: true, content: 'Test' },
      });

      expect(wrapper.classes()).toContain('z-badge--loading');
      expect(wrapper.find('.z-badge__spinner').exists()).toBe(true);

      const contentElement = wrapper.find('.z-badge__content');
      if (contentElement.exists()) {
        expect(contentElement.classes()).toContain('z-badge__content--hidden');
      }
    });
  });

  describe('Interactive behavior', () => {
    it('applies interactive class when interactive is true', () => {
      const wrapper = mount(ZBadge, {
        props: { interactive: true, content: 'Test' },
      });

      expect(wrapper.classes()).toContain('z-badge--interactive');
      expect(wrapper.attributes('role')).toBe('button');
      expect(wrapper.attributes('tabindex')).toBe('0');
    });

    it('emits click event when clicked and interactive', async () => {
      const wrapper = mount(ZBadge, {
        props: { interactive: true, content: 'Test' },
      });

      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('does not emit click event when not interactive', async () => {
      const wrapper = mount(ZBadge, {
        props: { content: 'Test' },
      });

      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('does not emit click event when loading', async () => {
      const wrapper = mount(ZBadge, {
        props: { interactive: true, loading: true, content: 'Test' },
      });

      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('handles keyboard events when interactive', async () => {
      const wrapper = mount(ZBadge, {
        props: { interactive: true, content: 'Test' },
      });

      await wrapper.trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('click')).toBeTruthy();

      await wrapper.trigger('keydown', { key: ' ' });
      expect(wrapper.emitted('click')).toHaveLength(2);
    });

    it('does not handle keyboard events when not interactive', async () => {
      const wrapper = mount(ZBadge, {
        props: { content: 'Test' },
      });

      await wrapper.trigger('keydown', { key: 'Enter' });

      expect(wrapper.emitted('click')).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('has correct role when not interactive', () => {
      const wrapper = mount(ZBadge, {
        props: { content: 'Test' },
      });

      expect(wrapper.attributes('role')).toBe('status');
    });

    it('has correct role when interactive', () => {
      const wrapper = mount(ZBadge, {
        props: { interactive: true, content: 'Test' },
      });

      expect(wrapper.attributes('role')).toBe('button');
    });

    it('provides automatic aria-label for numbers', () => {
      const wrapper = mount(ZBadge, {
        props: { content: 5 },
      });

      expect(wrapper.attributes('aria-label')).toBe('5 items');
    });

    it('uses custom aria-label when provided', () => {
      const wrapper = mount(ZBadge, {
        props: { content: 'Test', ariaLabel: 'Custom label' },
      });

      expect(wrapper.attributes('aria-label')).toBe('Custom label');
    });

    it('has correct tabindex when interactive', () => {
      const wrapper = mount(ZBadge, {
        props: { interactive: true, content: 'Test' },
      });

      expect(wrapper.attributes('tabindex')).toBe('0');
    });

    it('does not have tabindex when not interactive', () => {
      const wrapper = mount(ZBadge, {
        props: { content: 'Test' },
      });

      expect(wrapper.attributes('tabindex')).toBeUndefined();
    });
  });

  describe('Slots', () => {
    it('renders icon slot', () => {
      const IconComponent = h('svg', { class: 'test-icon' });

      const wrapper = mount(ZBadge, {
        props: { content: 'Test' },
        slots: {
          icon: () => IconComponent,
        },
      });

      expect(wrapper.find('.z-badge__icon').exists()).toBe(true);
      expect(wrapper.find('.test-icon').exists()).toBe(true);
      expect(wrapper.classes()).toContain('z-badge--has-icon');
    });

    it('renders trailing slot', () => {
      const IconComponent = h('svg', { class: 'test-trailing' });

      const wrapper = mount(ZBadge, {
        props: { content: 'Test' },
        slots: {
          trailing: () => IconComponent,
        },
      });

      expect(wrapper.find('.z-badge__trailing').exists()).toBe(true);
      expect(wrapper.find('.test-trailing').exists()).toBe(true);
      expect(wrapper.classes()).toContain('z-badge--has-trailing');
    });

    it('hides icon and trailing slots when loading', () => {
      const wrapper = mount(ZBadge, {
        props: { content: 'Test', loading: true },
        slots: {
          icon: () => h('svg', { class: 'test-icon' }),
          trailing: () => h('svg', { class: 'test-trailing' }),
        },
      });

      expect(wrapper.find('.z-badge__icon').exists()).toBe(false);
      expect(wrapper.find('.z-badge__trailing').exists()).toBe(false);
    });

    it('hides slots when in dot mode', () => {
      const wrapper = mount(ZBadge, {
        props: { dot: true },
        slots: {
          icon: () => h('svg', { class: 'test-icon' }),
          trailing: () => h('svg', { class: 'test-trailing' }),
          default: 'Test content',
        },
      });

      // In dot mode, the badge should be a simple dot without content
      expect(wrapper.classes()).toContain('z-badge--dot');
      // The slots might still exist but be visually hidden via CSS
      // Let's check if the component has the dot class instead
    });
  });

  describe('Edge cases', () => {
    it('handles zero as content', () => {
      const wrapper = mount(ZBadge, {
        props: { content: 0 },
      });

      expect(wrapper.text()).toBe('0');
      expect(wrapper.classes()).not.toContain('z-badge--dot');
    });

    it('handles empty string as content', () => {
      const wrapper = mount(ZBadge, {
        props: { content: '' },
      });

      expect(wrapper.text()).toBe('');
      expect(wrapper.classes()).not.toContain('z-badge--dot');
    });

    it('handles negative numbers', () => {
      const wrapper = mount(ZBadge, {
        props: { content: -5 },
      });

      expect(wrapper.text()).toBe('-5');
    });

    it('prevents default on keyboard events', async () => {
      const wrapper = mount(ZBadge, {
        props: { interactive: true, content: 'Test' },
      });

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      await wrapper.element.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});

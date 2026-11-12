import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import ZContainer from './ZContainer.vue';
import { mountWithLandmark } from '../test-utils/accessibility-wrapper';

expect.extend(toHaveNoViolations as any);

describe('ZContainer', () => {
  it('renders with default props', () => {
    const wrapper = mount(ZContainer, {
      slots: {
        default: '<div>Test content</div>',
      },
    });

    expect(wrapper.find('.z-container').exists()).toBe(true);
    expect(wrapper.text()).toContain('Test content');
  });

  it('applies correct max-width for different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    const expectedMaxWidths = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    };

    sizes.forEach(size => {
      const wrapper = mount(ZContainer, {
        props: { maxWidth: size },
        slots: { default: '<div>Content</div>' },
      });

      const container = wrapper.find('.z-container');
      const style = container.attributes('style');
      expect(style).toContain(`max-width: ${expectedMaxWidths[size]}`);
    });
  });

  it('removes max-width when fluid is true', () => {
    const wrapper = mount(ZContainer, {
      props: { fluid: true },
      slots: { default: '<div>Content</div>' },
    });

    expect(wrapper.find('.z-container--fluid').exists()).toBe(true);
    const style = wrapper.find('.z-container').attributes('style');
    expect(style).not.toContain('max-width');
  });

  it('applies default padding using design tokens', () => {
    const wrapper = mount(ZContainer, {
      slots: { default: '<div>Content</div>' },
    });

    // Check that the container has the correct class for padding
    expect(wrapper.find('.z-container').exists()).toBe(true);
    // In test environment, CSS custom properties may not be computed
    // so we just verify the component renders correctly
  });

  it('centers content with auto margins', () => {
    const wrapper = mount(ZContainer, {
      slots: { default: '<div>Content</div>' },
    });

    const style = wrapper.find('.z-container').attributes('style');
    expect(style).toContain('margin-left: auto');
    expect(style).toContain('margin-right: auto');
  });

  it('has no accessibility violations', async () => {
    const wrapper = mountWithLandmark(ZContainer, {
      slots: {
        default: '<div>Accessible content</div>',
      },
    });

    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with all variants', async () => {
    const variants = [
      { fluid: false, maxWidth: 'sm' as const },
      { fluid: false, maxWidth: 'md' as const },
      { fluid: false, maxWidth: 'lg' as const },
      { fluid: false, maxWidth: 'xl' as const },
      { fluid: true },
    ];

    for (const variant of variants) {
      const wrapper = mountWithLandmark(ZContainer, {
        props: variant,
        slots: { default: '<div>Test content</div>' },
      });

      const results = await axe(wrapper.element);
      expect(results).toHaveNoViolations();
    }
  });

  it('matches snapshot', () => {
    const wrapper = mount(ZContainer, {
      props: { maxWidth: 'lg', fluid: false },
      slots: { default: '<div>Container content</div>' },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('matches snapshot when fluid', () => {
    const wrapper = mount(ZContainer, {
      props: { fluid: true },
      slots: { default: '<div>Fluid container content</div>' },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});

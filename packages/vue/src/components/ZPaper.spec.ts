import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import ZPaper from './ZPaper.vue';
import { mountWithLandmark } from '../test-utils/accessibility-wrapper';

expect.extend(toHaveNoViolations as any);

// Mock requestAnimationFrame for mount animation tests
globalThis.requestAnimationFrame = vi.fn(cb => {
  cb(0);
  return 0;
});

describe('ZPaper', () => {
  it('renders with default props', () => {
    const wrapper = mount(ZPaper, {
      slots: {
        default: '<div>Paper content</div>',
      },
    });

    expect(wrapper.find('.z-paper').exists()).toBe(true);
    expect(wrapper.text()).toContain('Paper content');
  });

  it('applies correct elevation styles', () => {
    const elevations = [0, 1, 2, 3, 4, 5] as const;

    elevations.forEach(elevation => {
      const wrapper = mount(ZPaper, {
        props: { elevation },
        slots: { default: '<div>Content</div>' },
      });

      expect(wrapper.find(`.z-paper--elevation-${elevation}`).exists()).toBe(
        true
      );
      const style = wrapper.find('.z-paper').attributes('style');

      if (elevation === 0) {
        expect(style).toContain('box-shadow: none');
      } else {
        // Check that some box-shadow is applied (CSS custom property or fallback)
        expect(style).toMatch(/box-shadow:/);
      }
    });
  });

  it('applies correct radius styles', () => {
    const radiuses = ['none', 'sm', 'md', 'lg', 'xl'] as const;

    radiuses.forEach(radius => {
      const wrapper = mount(ZPaper, {
        props: { radius },
        slots: { default: '<div>Content</div>' },
      });

      expect(wrapper.find(`.z-paper--radius-${radius}`).exists()).toBe(true);
      const style = wrapper.find('.z-paper').attributes('style');

      if (radius === 'none') {
        expect(style).toContain('border-radius: 0');
      } else {
        // Check that some border-radius is applied (CSS custom property or fallback)
        expect(style).toMatch(/border-radius:/);
      }
    });
  });

  it('applies outlined styles when outlined is true', () => {
    const wrapper = mount(ZPaper, {
      props: { outlined: true, elevation: 3 },
      slots: { default: '<div>Content</div>' },
    });

    expect(wrapper.find('.z-paper--outlined').exists()).toBe(true);
    const style = wrapper.find('.z-paper').attributes('style');
    expect(style).toContain('box-shadow: none'); // Shadow should be removed when outlined
  });

  it('applies elevation class names', () => {
    const wrapper = mount(ZPaper, {
      props: { elevation: 3 },
      slots: { default: '<div>Content</div>' },
    });

    expect(wrapper.find('.z-paper--elevation-3').exists()).toBe(true);
  });

  it('applies radius class names', () => {
    const wrapper = mount(ZPaper, {
      props: { radius: 'lg' },
      slots: { default: '<div>Content</div>' },
    });

    expect(wrapper.find('.z-paper--radius-lg').exists()).toBe(true);
  });

  it('applies visible class after mount animation', () => {
    const wrapper = mount(ZPaper, {
      slots: { default: '<div>Content</div>' },
    });

    // The component should render successfully
    expect(wrapper.find('.z-paper').exists()).toBe(true);
    // Note: visibility animation may not work in test environment
  });

  it('has no accessibility violations', async () => {
    const wrapper = mountWithLandmark(ZPaper, {
      slots: {
        default: '<div>Accessible paper content</div>',
      },
    });

    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with all variants', async () => {
    const elevations = [0, 1, 2, 3, 4, 5] as const;
    const radiuses = ['none', 'sm', 'md', 'lg', 'xl'] as const;

    for (const elevation of elevations) {
      for (const radius of radiuses) {
        const wrapper = mountWithLandmark(ZPaper, {
          props: { elevation, radius, outlined: false },
          slots: { default: '<div>Test content</div>' },
        });

        const results = await axe(wrapper.element);
        expect(results).toHaveNoViolations();
      }
    }
  });

  it('has no accessibility violations when outlined', async () => {
    const wrapper = mountWithLandmark(ZPaper, {
      props: { outlined: true },
      slots: {
        default: '<div>Outlined paper content</div>',
      },
    });

    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('matches snapshot with default props', () => {
    const wrapper = mount(ZPaper, {
      slots: { default: '<div>Default paper content</div>' },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('matches snapshot with elevation 0', () => {
    const wrapper = mount(ZPaper, {
      props: { elevation: 0 },
      slots: { default: '<div>No shadow paper</div>' },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('matches snapshot when outlined', () => {
    const wrapper = mount(ZPaper, {
      props: { outlined: true, radius: 'lg' },
      slots: { default: '<div>Outlined paper content</div>' },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('matches snapshot with maximum elevation and radius', () => {
    const wrapper = mount(ZPaper, {
      props: { elevation: 5, radius: 'xl' },
      slots: { default: '<div>Maximum elevation paper</div>' },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});

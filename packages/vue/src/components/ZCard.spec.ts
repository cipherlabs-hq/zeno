import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import ZCard from './ZCard.vue';

expect.extend(toHaveNoViolations as any);

// Mock requestAnimationFrame for mount animation tests
globalThis.requestAnimationFrame = vi.fn(cb => {
  cb(0);
  return 0;
});

describe('ZCard', () => {
  it('renders with default props', () => {
    const wrapper = mount(ZCard, {
      slots: {
        default: '<div>Card content</div>',
      },
    });

    expect(wrapper.find('.z-card').exists()).toBe(true);
    expect(wrapper.find('.z-card__content').exists()).toBe(true);
    expect(wrapper.text()).toContain('Card content');
  });

  it('renders header slot when provided', () => {
    const wrapper = mount(ZCard, {
      slots: {
        header: '<h2>Card Title</h2>',
        default: '<div>Card content</div>',
      },
    });

    expect(wrapper.find('.z-card__header').exists()).toBe(true);
    expect(wrapper.find('.z-card__header h2').text()).toBe('Card Title');
  });

  it('renders footer slot when provided', () => {
    const wrapper = mount(ZCard, {
      slots: {
        default: '<div>Card content</div>',
        footer: '<button>Action</button>',
      },
    });

    expect(wrapper.find('.z-card__footer').exists()).toBe(true);
    expect(wrapper.find('.z-card__footer button').text()).toBe('Action');
  });

  it('applies correct elevation styles', () => {
    const wrapper = mount(ZCard, {
      props: { elevation: 3 },
      slots: { default: '<div>Content</div>' },
    });

    const cardElement = wrapper.find('.z-card');
    expect(cardElement.exists()).toBe(true);
    // Check that elevation prop is applied (component should handle styling)
    expect(wrapper.props('elevation')).toBe(3);
  });

  it('applies outlined class when outlined is true', () => {
    const wrapper = mount(ZCard, {
      props: { outlined: true },
      slots: { default: '<div>Content</div>' },
    });

    expect(wrapper.find('.z-card--outlined').exists()).toBe(true);
    expect(wrapper.props('outlined')).toBe(true);
  });

  it('applies interactive class when interactive is true', () => {
    const wrapper = mount(ZCard, {
      props: { interactive: true },
      slots: { default: '<div>Content</div>' },
    });

    expect(wrapper.find('.z-card--interactive').exists()).toBe(true);
  });

  it('handles hover state for interactive cards', async () => {
    const wrapper = mount(ZCard, {
      props: { interactive: true, elevation: 1 as any },
      slots: { default: '<div>Content</div>' },
    });

    // Trigger mouseenter
    await wrapper.find('.z-card').trigger('mouseenter');
    expect(wrapper.find('.z-card--hovered').exists()).toBe(true);

    // Trigger mouseleave
    await wrapper.find('.z-card').trigger('mouseleave');
    expect(wrapper.find('.z-card--hovered').exists()).toBe(false);
  });

  it('does not apply hover effects when not interactive', async () => {
    const wrapper = mount(ZCard, {
      props: { interactive: false, elevation: 1 as any },
      slots: { default: '<div>Content</div>' },
    });

    await wrapper.find('.z-card').trigger('mouseenter');
    expect(wrapper.find('.z-card--hovered').exists()).toBe(false);
  });

  it('does not apply hover effects when outlined', async () => {
    const wrapper = mount(ZCard, {
      props: { interactive: true, outlined: true },
      slots: { default: '<div>Content</div>' },
    });

    await wrapper.find('.z-card').trigger('mouseenter');
    expect(wrapper.find('.z-card--hovered').exists()).toBe(false);
  });

  it('applies visible class after mount animation', async () => {
    const wrapper = mount(ZCard, {
      slots: { default: '<div>Content</div>' },
    });

    // Wait for next tick to allow animation to complete
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.z-card--visible').exists()).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const wrapper = mount(ZCard, {
      slots: {
        default: '<div>Accessible card content</div>',
      },
    });

    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with all variants', async () => {
    const variants = [
      { elevation: 0 as any, outlined: false, interactive: true },
      { elevation: 3 as any, outlined: false, interactive: false },
      { elevation: 2 as any, outlined: true, interactive: true },
      { elevation: 5 as any, outlined: false, interactive: true },
    ];

    for (const variant of variants) {
      const wrapper = mount(ZCard, {
        props: variant,
        slots: {
          header: '<h3>Card Title</h3>',
          default: '<div>Card content</div>',
          footer: '<button>Action</button>',
        },
      });

      const results = await axe(wrapper.element);
      expect(results).toHaveNoViolations();
    }
  });

  it('matches snapshot with default props', () => {
    const wrapper = mount(ZCard, {
      slots: { default: '<div>Default card content</div>' },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('matches snapshot with all slots', () => {
    const wrapper = mount(ZCard, {
      props: { elevation: 2 as any, interactive: true },
      slots: {
        header: '<h3>Card Header</h3>',
        default: '<div>Card main content</div>',
        footer: '<div>Card footer</div>',
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('matches snapshot when outlined', () => {
    const wrapper = mount(ZCard, {
      props: { outlined: true, interactive: false },
      slots: { default: '<div>Outlined card content</div>' },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});

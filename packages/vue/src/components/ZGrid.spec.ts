import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import ZGrid from './ZGrid.vue';
import { mountWithLandmark } from '../test-utils/accessibility-wrapper';

expect.extend(toHaveNoViolations as any);

describe('ZGrid', () => {
  it('renders with default props', () => {
    const wrapper = mount(ZGrid, {
      slots: {
        default:
          '<div class="grid-item">Item 1</div><div class="grid-item">Item 2</div>',
      },
    });

    expect(wrapper.find('.z-grid').exists()).toBe(true);
    expect(wrapper.findAll('.grid-item')).toHaveLength(2);
  });

  it('applies correct columns for simple number', () => {
    const wrapper = mount(ZGrid, {
      props: { cols: 3 },
      slots: { default: '<div>Item</div>' },
    });

    const style = wrapper.find('.z-grid').attributes('style');
    expect(style).toContain('--cols: repeat(3, 1fr)');
  });

  it('applies correct gap for simple number', () => {
    const wrapper = mount(ZGrid, {
      props: { gap: 6 },
      slots: { default: '<div>Item</div>' },
    });

    const style = wrapper.find('.z-grid').attributes('style');
    expect(style).toContain('--gap: var(--zeno-spacing-6)');
  });

  it('handles responsive columns object', () => {
    const responsiveCols = { sm: 1, md: 2, lg: 3, xl: 4 };
    const wrapper = mount(ZGrid, {
      props: { cols: responsiveCols },
      slots: { default: '<div>Item</div>' },
    });

    const style = wrapper.find('.z-grid').attributes('style');
    expect(style).toContain('--cols-sm: repeat(1, 1fr)');
    expect(style).toContain('--cols-md: repeat(2, 1fr)');
    expect(style).toContain('--cols-lg: repeat(3, 1fr)');
    expect(style).toContain('--cols-xl: repeat(4, 1fr)');
  });

  it('handles responsive gap object', () => {
    const responsiveGap = { sm: 2, md: 4, lg: 6 };
    const wrapper = mount(ZGrid, {
      props: { gap: responsiveGap },
      slots: { default: '<div>Item</div>' },
    });

    const style = wrapper.find('.z-grid').attributes('style');
    expect(style).toContain('--gap-sm: var(--zeno-spacing-2)');
    expect(style).toContain('--gap-md: var(--zeno-spacing-4)');
    expect(style).toContain('--gap-lg: var(--zeno-spacing-6)');
  });

  it('applies alignment properties', () => {
    const wrapper = mount(ZGrid, {
      props: { align: 'center', justify: 'space-between' },
      slots: { default: '<div>Item</div>' },
    });

    const style = wrapper.find('.z-grid').attributes('style');
    expect(style).toContain('--align: center');
    expect(style).toContain('--justify: space-between');
  });

  it('renders correct grid template columns when cols={{md:4}}', () => {
    const wrapper = mount(ZGrid, {
      props: { cols: { md: 4 } },
      slots: { default: '<div>Item</div>' },
    });

    const style = wrapper.find('.z-grid').attributes('style');
    expect(style).toContain('--cols-md: repeat(4, 1fr)');

    // Should not have other breakpoint styles
    expect(style).not.toContain('--cols-sm');
    expect(style).not.toContain('--cols-lg');
    expect(style).not.toContain('--cols-xl');
  });

  it('has no accessibility violations', async () => {
    const wrapper = mountWithLandmark(ZGrid, {
      slots: {
        default: `
          <div>Grid item 1</div>
          <div>Grid item 2</div>
          <div>Grid item 3</div>
        `,
      },
    });

    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with all alignment options', async () => {
    const alignOptions = ['start', 'center', 'end', 'stretch'] as const;
    const justifyOptions = [
      'start',
      'center',
      'end',
      'space-between',
      'space-around',
      'space-evenly',
    ] as const;

    for (const align of alignOptions) {
      for (const justify of justifyOptions) {
        const wrapper = mountWithLandmark(ZGrid, {
          props: { align, justify, cols: 2 },
          slots: { default: '<div>Item 1</div><div>Item 2</div>' },
        });

        const results = await axe(wrapper.element);
        expect(results).toHaveNoViolations();
      }
    }
  });

  it('matches snapshot with default props', () => {
    const wrapper = mount(ZGrid, {
      slots: {
        default: '<div>Item 1</div><div>Item 2</div><div>Item 3</div>',
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('matches snapshot with responsive props', () => {
    const wrapper = mount(ZGrid, {
      props: {
        cols: { sm: 1, md: 2, lg: 3 },
        gap: { sm: 2, md: 4 },
        align: 'center',
        justify: 'space-between',
      },
      slots: {
        default: '<div>Item 1</div><div>Item 2</div><div>Item 3</div>',
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});

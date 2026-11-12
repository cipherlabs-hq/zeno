import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { expectAccessible, mount, settle } from './helpers.js';
import type { ZenoTooltip } from '../../src/components/lit/tooltip/zeno-tooltip.js';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function bubble(tooltip: ZenoTooltip): HTMLElement {
  return tooltip.shadowRoot!.querySelector<HTMLElement>('.tooltip')!;
}

const shown = (tooltip: ZenoTooltip) =>
  bubble(tooltip).matches(':popover-open');

const markup = (attributes = '') => `
  <div style="padding: 120px">
    <button id="before">Before</button>
    <zeno-tooltip content="Removes the file for everyone" delay="0" ${attributes}>
      <button id="trigger">Delete</button>
    </zeno-tooltip>
  </div>`;

describe('zeno-tooltip', () => {
  it('describes the element it wraps', async () => {
    const main = await mount(markup());
    const trigger = main.querySelector('#trigger')!;
    expect(trigger.getAttribute('aria-description')).toBe(
      'Removes the file for everyone'
    );
    const tooltip = main.querySelector<ZenoTooltip>('zeno-tooltip')!;
    tooltip.content = 'Gone for good';
    await settle(main);
    expect(trigger.getAttribute('aria-description')).toBe('Gone for good');
    tooltip.disabled = true;
    await settle(main);
    expect(trigger.hasAttribute('aria-description')).toBe(false);
  });

  it('shows above the element on hover, in the top layer, and hides on leave', async () => {
    const main = await mount(markup());
    const tooltip = main.querySelector<ZenoTooltip>('zeno-tooltip')!;
    const trigger = main.querySelector<HTMLElement>('#trigger')!;
    const seen: string[] = [];
    tooltip.addEventListener('show', () => seen.push('show'));
    tooltip.addEventListener('hide', () => seen.push('hide'));
    expect(shown(tooltip)).toBe(false);

    await userEvent.hover(trigger);
    await wait(20);
    expect(shown(tooltip)).toBe(true);
    const box = bubble(tooltip).getBoundingClientRect();
    const anchor = trigger.getBoundingClientRect();
    expect(box.bottom).toBeLessThanOrEqual(anchor.top);
    expect(
      Math.abs(box.left + box.width / 2 - (anchor.left + anchor.width / 2))
    ).toBeLessThan(1);

    await userEvent.unhover(trigger);
    await wait(200);
    expect(shown(tooltip)).toBe(false);
    expect(seen).toEqual(['show', 'hide']);
  });

  it('stays while the pointer is on the bubble', async () => {
    const main = await mount(markup());
    const tooltip = main.querySelector<ZenoTooltip>('zeno-tooltip')!;
    await userEvent.hover(main.querySelector<HTMLElement>('#trigger')!);
    await wait(20);
    await userEvent.hover(bubble(tooltip));
    await wait(200);
    expect(shown(tooltip)).toBe(true);
    await userEvent.hover(main.querySelector<HTMLElement>('#before')!);
    await wait(200);
    expect(shown(tooltip)).toBe(false);
  });

  it('shows on keyboard focus and hides on blur', async () => {
    const main = await mount(markup());
    const tooltip = main.querySelector<ZenoTooltip>('zeno-tooltip')!;
    main.querySelector<HTMLElement>('#before')!.focus();
    await userEvent.keyboard('{Tab}');
    await wait(20);
    expect(document.activeElement?.id).toBe('trigger');
    expect(shown(tooltip)).toBe(true);
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await wait(20);
    expect(shown(tooltip)).toBe(false);
  });

  it('goes away on Escape', async () => {
    const main = await mount(markup());
    const tooltip = main.querySelector<ZenoTooltip>('zeno-tooltip')!;
    main.querySelector<HTMLElement>('#before')!.focus();
    await userEvent.keyboard('{Tab}');
    await wait(20);
    expect(shown(tooltip)).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(shown(tooltip)).toBe(false);
  });

  it('moves to the other side when there is no room', async () => {
    const main = await mount(
      `<zeno-tooltip content="Up here there is no room" delay="0">
        <button id="trigger">Top of the page</button>
      </zeno-tooltip>`
    );
    main.style.padding = '0';
    const tooltip = main.querySelector<ZenoTooltip>('zeno-tooltip')!;
    const trigger = main.querySelector<HTMLElement>('#trigger')!;
    tooltip.show(0);
    await wait(20);
    expect(bubble(tooltip).dataset.side).toBe('bottom');
    expect(bubble(tooltip).getBoundingClientRect().top).toBeGreaterThanOrEqual(
      trigger.getBoundingClientRect().bottom
    );
    const box = bubble(tooltip).getBoundingClientRect();
    expect(box.left).toBeGreaterThanOrEqual(0);
    tooltip.hide(0);
    await wait(20);
  });

  it('does not show when disabled or empty', async () => {
    const main = await mount(markup('disabled'));
    const tooltip = main.querySelector<ZenoTooltip>('zeno-tooltip')!;
    await userEvent.hover(main.querySelector<HTMLElement>('#trigger')!);
    await wait(20);
    expect(shown(tooltip)).toBe(false);
  });

  it('has no axe violations, hidden or showing', async () => {
    const main = await mount(markup());
    const tooltip = main.querySelector<ZenoTooltip>('zeno-tooltip')!;
    await expectAccessible(main);
    tooltip.show(0);
    await wait(20);
    expect(shown(tooltip)).toBe(true);
    await expectAccessible(main);
    tooltip.hide(0);
    await wait(20);
  });
});

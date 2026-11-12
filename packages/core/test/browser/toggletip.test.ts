import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoToggletip } from '../../src/components/lit/toggletip/zeno-toggletip.js';
import { expectAccessible, mount, settle } from './helpers.js';

const button = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>('button')!;
const note = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLElement>('[part="content"]')!;
const shown = (el: Element) => note(el).matches(':popover-open');

const markup = `
  <div style="padding: 80px">
    <button id="outside">Outside</button>
    <zeno-toggletip label="Why there is no score">
      <p>Fewer than two inspections. <a href="/methodology">Read more</a></p>
    </zeno-toggletip>
    <button id="after">After</button>
  </div>`;

describe('zeno-toggletip', () => {
  it('opens on click, below its button, and announces the note', async () => {
    const main = await mount(markup);
    const tip = main.querySelector<ZenoToggletip>('zeno-toggletip')!;
    expect(button(tip).getAttribute('aria-label')).toBe(
      'Why there is no score'
    );
    expect(button(tip).getAttribute('aria-expanded')).toBe('false');
    expect(shown(tip)).toBe(false);

    await userEvent.click(button(tip));
    await settle(main);
    expect(shown(tip)).toBe(true);
    expect(button(tip).getAttribute('aria-expanded')).toBe('true');
    expect(note(tip).getBoundingClientRect().top).toBeGreaterThanOrEqual(
      button(tip).getBoundingClientRect().bottom
    );
    const live = tip.shadowRoot!.querySelector('[role="status"]')!;
    expect(live.textContent).toContain('Fewer than two inspections.');

    await userEvent.click(button(tip));
    await settle(main);
    expect(shown(tip)).toBe(false);
    expect(live.textContent!.trim()).toBe('');
  });

  it('opens with Enter, closes with Escape and gives focus back', async () => {
    const main = await mount(markup);
    const tip = main.querySelector<ZenoToggletip>('zeno-toggletip')!;
    main.querySelector<HTMLElement>('#outside')!.focus();
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Enter}');
    await settle(main);
    expect(tip.open).toBe(true);

    // Tab moves into the note, and the note stays open.
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(tip.querySelector('a'));
    expect(tip.open).toBe(true);

    await userEvent.keyboard('{Escape}');
    await settle(main);
    expect(tip.open).toBe(false);
    expect(tip.shadowRoot!.activeElement).toBe(button(tip));
  });

  it('closes on a press outside and when focus leaves', async () => {
    const main = await mount(markup);
    const tip = main.querySelector<ZenoToggletip>('zeno-toggletip')!;
    const events: string[] = [];
    tip.addEventListener('open', () => events.push('open'));
    tip.addEventListener('close', () => events.push('close'));

    await userEvent.click(button(tip));
    await settle(main);
    await userEvent.click(main.querySelector<HTMLElement>('#outside')!);
    await settle(main);
    expect(tip.open).toBe(false);

    await userEvent.click(button(tip));
    await settle(main);
    main.querySelector<HTMLElement>('#after')!.focus();
    await settle(main);
    expect(tip.open).toBe(false);
    expect(events).toEqual(['open', 'close', 'open', 'close']);
  });

  it('has no axe violations, closed and open', async () => {
    const main = await mount(markup);
    await expectAccessible(main);
    const tip = main.querySelector<ZenoToggletip>('zeno-toggletip')!;
    tip.show();
    await settle(main);
    await expectAccessible(main);
  });
});

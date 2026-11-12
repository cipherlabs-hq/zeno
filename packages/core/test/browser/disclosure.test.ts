import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoDisclosure } from '../../src/components/lit/disclosure/zeno-disclosure.js';
import { expectAccessible, mount, settle } from './helpers.js';

const summary = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLElement>('summary')!;
const details = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLDetailsElement>('details')!;

const markup = `
  <zeno-disclosure>
    <span slot="summary">GET /facilities</span>
    <p>Lists facilities. <a href="/data">Get a key</a></p>
  </zeno-disclosure>
  <zeno-disclosure open>
    <span slot="summary">GET /coverage</span>
    <p>Coverage by county.</p>
  </zeno-disclosure>`;

describe('zeno-disclosure', () => {
  it('opens and closes from the summary and reports it', async () => {
    const main = await mount(markup);
    const section = main.querySelector<ZenoDisclosure>('zeno-disclosure')!;
    const seen: boolean[] = [];
    section.addEventListener('toggle', event =>
      seen.push((event as CustomEvent<{ open: boolean }>).detail.open)
    );
    expect(details(section).open).toBe(false);
    const link = section.querySelector('a')!;
    expect(link.checkVisibility()).toBe(false);

    await userEvent.click(summary(section));
    await settle(main);
    expect(section.open).toBe(true);
    expect(section.hasAttribute('open')).toBe(true);
    expect(link.checkVisibility()).toBe(true);

    await userEvent.click(summary(section));
    await settle(main);
    expect(section.open).toBe(false);
    expect(seen).toEqual([true, false]);
  });

  it('opens with Enter on the focused summary', async () => {
    const main = await mount(markup);
    const section = main.querySelector<ZenoDisclosure>('zeno-disclosure')!;
    summary(section).focus();
    await userEvent.keyboard('{Enter}');
    await settle(main);
    expect(section.open).toBe(true);
  });

  it('follows the open property', async () => {
    const main = await mount(markup);
    const second = main.querySelectorAll<ZenoDisclosure>('zeno-disclosure')[1]!;
    expect(details(second).open).toBe(true);
    second.open = false;
    await settle(main);
    expect(details(second).open).toBe(false);
  });

  it('has no axe violations', async () => {
    const main = await mount(markup);
    await expectAccessible(main);
  });
});

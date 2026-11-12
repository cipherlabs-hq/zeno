import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoLink } from '../../src/components/lit/link/zeno-link.js';
import { expectAccessible, mount } from './helpers.js';

const anchor = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLAnchorElement>('a');

describe('zeno-link', () => {
  it('renders an anchor with the text', async () => {
    const main = await mount(
      `<zeno-link href="/coverage">Coverage</zeno-link>`
    );
    const link = main.querySelector<ZenoLink>('zeno-link')!;
    expect(anchor(link)!.getAttribute('href')).toBe('/coverage');
    expect(anchor(link)!.hasAttribute('rel')).toBe(false);
    expect(getComputedStyle(anchor(link)!).textDecorationLine).toBe(
      'underline'
    );
  });

  it('protects and announces a link that opens a new tab', async () => {
    const main = await mount(
      `<zeno-link href="https://example.com" target="_blank" external>Spec</zeno-link>`
    );
    const link = main.querySelector<ZenoLink>('zeno-link')!;
    const a = anchor(link)!;
    expect(a.rel).toBe('noopener noreferrer');
    expect(a.textContent).toContain('(opens in a new tab)');
    const icon = link.shadowRoot!.querySelector('[part="icon"] zeno-icon')!;
    expect(icon.getAttribute('name')).toBe('external-link');
    expect(icon.shadowRoot!.querySelector('svg')).not.toBeNull();
  });

  it('styles a slotted anchor when it has no href', async () => {
    const main = await mount(
      `<p>Read the <zeno-link><a href="/methodology">methodology</a></zeno-link>.</p>`
    );
    const link = main.querySelector<ZenoLink>('zeno-link')!;
    expect(anchor(link)).toBeNull();
    const slotted = link.querySelector('a')!;
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--zeno-color-accent-text')
      .trim();
    const probe = document.createElement('span');
    probe.style.color = accent;
    main.append(probe);
    expect(getComputedStyle(slotted).color).toBe(getComputedStyle(probe).color);
    expect(getComputedStyle(slotted).textDecorationLine).toBe('underline');
  });

  it('drops the underline when standalone', async () => {
    const main = await mount(
      `<zeno-link href="/about" standalone>About</zeno-link>`
    );
    const a = anchor(main.querySelector('zeno-link')!)!;
    expect(a.matches(':hover')).toBe(false);
    expect(getComputedStyle(a).textDecorationLine).toBe('none');
    await userEvent.hover(a);
    expect(getComputedStyle(a).textDecorationLine).toBe('underline');
  });

  it('has no axe violations', async () => {
    const main = await mount(`
      <p>See <zeno-link href="/a">the page</zeno-link>.</p>
      <p><zeno-link href="https://example.com" target="_blank" external>Out</zeno-link></p>
      <p><zeno-link><a href="/b">Router link</a></zeno-link></p>`);
    await expectAccessible(main);
  });
});

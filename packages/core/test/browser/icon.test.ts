import { describe, expect, it } from 'vitest';
import { expectAccessible, mount } from './helpers.js';
import type { ZenoIcon } from '../../src/components/lit/icon/zeno-icon.js';

const base = (icon: ZenoIcon) =>
  icon.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;

describe('zeno-icon', () => {
  it('draws a registered icon by name, at the size of the text', async () => {
    const main = await mount(
      '<p style="font-size: 20px"><zeno-icon name="check"></zeno-icon></p>'
    );
    const icon = main.querySelector<ZenoIcon>('zeno-icon')!;
    const drawing = icon.shadowRoot!.querySelector('svg')!;
    expect(drawing.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(drawing.querySelector('polyline')).not.toBeNull();
    const box = drawing.getBoundingClientRect();
    expect(box.width).toBe(25);
    expect(box.height).toBe(25);
  });

  it('is decoration without a label and an image with one', async () => {
    const main = await mount(`
      <zeno-icon id="plain" name="check"></zeno-icon>
      <zeno-icon id="named" name="check" label="Done"></zeno-icon>`);
    const plain = base(main.querySelector<ZenoIcon>('#plain')!);
    expect(plain.getAttribute('aria-hidden')).toBe('true');
    expect(plain.hasAttribute('role')).toBe(false);
    const named = base(main.querySelector<ZenoIcon>('#named')!);
    expect(named.getAttribute('role')).toBe('img');
    expect(named.getAttribute('aria-label')).toBe('Done');
    expect(named.hasAttribute('aria-hidden')).toBe(false);
    await expectAccessible(main);
  });

  it('shows slotted SVG when it has no name', async () => {
    const main = await mount(`
      <zeno-icon>
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg>
      </zeno-icon>`);
    const icon = main.querySelector<ZenoIcon>('zeno-icon')!;
    const slot = icon.shadowRoot!.querySelector('slot')!;
    expect(slot.assignedElements()).toHaveLength(1);
    expect(icon.querySelector('svg')!.getBoundingClientRect().width).toBe(20);
  });

  it('uses a file as a mask, so its markup never enters the page', async () => {
    const file =
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onload="window.__iconRan = true"><circle cx="12" cy="12" r="10"/></svg>'
      );
    const main = await mount(`<zeno-icon></zeno-icon>`);
    const icon = main.querySelector<ZenoIcon>('zeno-icon')!;
    icon.src = file;
    await icon.updateComplete;
    const image = icon.shadowRoot!.querySelector<HTMLElement>('.icon__image')!;
    expect(icon.shadowRoot!.querySelector('svg')).toBeNull();
    expect(getComputedStyle(image).maskImage).toContain('data:image/svg+xml');
    expect(image.getBoundingClientRect().width).toBe(20);
    expect((window as { __iconRan?: boolean }).__iconRan).toBeUndefined();
  });

  it('keeps a quote in the file address from ending the CSS value', async () => {
    const main = await mount(`<zeno-icon></zeno-icon>`);
    const icon = main.querySelector<ZenoIcon>('zeno-icon')!;
    icon.src = 'icons/a").png';
    await icon.updateComplete;
    const image = icon.shadowRoot!.querySelector<HTMLElement>('.icon__image')!;
    expect(getComputedStyle(image).maskImage).toMatch(
      /^url\(".*a%22\)\.png"\)$/
    );
  });
});

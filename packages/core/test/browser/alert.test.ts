import { describe, expect, it } from 'vitest';
import type { ZenoAlert } from '../../src/components/lit/alert/zeno-alert.js';
import { expectAccessible, mount, settle } from './helpers.js';

const base = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;

describe('zeno-alert', () => {
  it('is assertive for errors and warnings and polite otherwise', async () => {
    const main = await mount(`
      <zeno-alert id="e" variant="error">Not sent</zeno-alert>
      <zeno-alert id="w" variant="warning">Copy it now</zeno-alert>
      <zeno-alert id="s" variant="success">Sent</zeno-alert>
      <zeno-alert id="i">Sample data</zeno-alert>`);
    const role = (id: string) => base(main.querySelector(`#${id}`)!);
    expect(role('e').getAttribute('role')).toBe('alert');
    expect(role('e').getAttribute('aria-live')).toBe('assertive');
    expect(role('w').getAttribute('role')).toBe('alert');
    expect(role('s').getAttribute('role')).toBe('status');
    expect(role('s').getAttribute('aria-live')).toBe('polite');
    expect(role('i').getAttribute('role')).toBe('status');
  });

  it('is not a live region with live="off"', async () => {
    const main = await mount(
      `<zeno-alert variant="error" live="off">Static note</zeno-alert>`
    );
    const box = base(main.querySelector('zeno-alert')!);
    expect(box.hasAttribute('role')).toBe(false);
    expect(box.hasAttribute('aria-live')).toBe(false);
  });

  it('draws the icon of each variant', async () => {
    const main = await mount(`
      <zeno-alert variant="info">a</zeno-alert>
      <zeno-alert variant="success">b</zeno-alert>
      <zeno-alert variant="warning">c</zeno-alert>
      <zeno-alert variant="error">d</zeno-alert>`);
    for (const alert of main.querySelectorAll('zeno-alert')) {
      const icon = alert.shadowRoot!.querySelector('[part="icon"] zeno-icon')!;
      expect(icon.shadowRoot!.querySelector('svg')).not.toBeNull();
    }
  });

  it('shows a heading at the level asked for, without a native tooltip', async () => {
    const main = await mount(
      `<zeno-alert heading="Not sent" heading-level="2">Try again.</zeno-alert>`
    );
    const alert = main.querySelector<ZenoAlert>('zeno-alert')!;
    const heading = alert.shadowRoot!.querySelector('[part="title"]')!;
    expect(heading.getAttribute('role')).toBe('heading');
    expect(heading.getAttribute('aria-level')).toBe('2');
    expect(heading.textContent!.trim()).toBe('Not sent');
    expect(alert.hasAttribute('title')).toBe(false);
  });

  it('takes no room for actions it does not have', async () => {
    const main = await mount(`
      <zeno-alert id="plain">Text</zeno-alert>
      <zeno-alert id="with"><span>Text</span><button slot="actions">Retry</button></zeno-alert>`);
    await settle(main);
    const actions = (id: string) =>
      main
        .querySelector(`#${id}`)!
        .shadowRoot!.querySelector<HTMLElement>('[part="actions"]')!;
    expect(getComputedStyle(actions('plain')).display).toBe('none');
    expect(getComputedStyle(actions('with')).display).toBe('flex');
  });

  it('names its close button from close-label', async () => {
    const main = await mount(
      `<zeno-alert closable close-label="Dismiss">Text</zeno-alert>`
    );
    const close = main
      .querySelector('zeno-alert')!
      .shadowRoot!.querySelector('[part="close"]')!;
    expect(close.getAttribute('aria-label')).toBe('Dismiss');
  });

  it('has no axe violations', async () => {
    const main = await mount(`
      <zeno-alert variant="error" heading="Not sent">Try again.</zeno-alert>
      <zeno-alert variant="success" live="off">Saved.</zeno-alert>`);
    await expectAccessible(main);
  });
});

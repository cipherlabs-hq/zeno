import { describe, expect, it } from 'vitest';
import type { ZenoInlineLoading } from '../../src/components/lit/inline-loading/zeno-inline-loading.js';
import { expectAccessible, mount, settle } from './helpers.js';

const base = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;

describe('zeno-inline-loading', () => {
  it('is a polite status that reads its description', async () => {
    const main = await mount(
      `<zeno-inline-loading description="Sending…"></zeno-inline-loading>`
    );
    const loading = main.querySelector<ZenoInlineLoading>(
      'zeno-inline-loading'
    )!;
    expect(base(loading).getAttribute('role')).toBe('status');
    expect(base(loading).getAttribute('aria-live')).toBe('polite');
    expect(base(loading).textContent!.trim()).toBe('Sending…');
    expect(
      loading.shadowRoot!.querySelector('.inline-loading__spinner')
    ).not.toBeNull();
  });

  it('shows a check when finished and a cross on error', async () => {
    const main = await mount(
      `<zeno-inline-loading description="Sent"></zeno-inline-loading>`
    );
    const loading = main.querySelector<ZenoInlineLoading>(
      'zeno-inline-loading'
    )!;
    loading.status = 'finished';
    await settle(main);
    const icon = () => loading.shadowRoot!.querySelector('zeno-icon')!;
    expect(icon().getAttribute('name')).toBe('check-circle');
    expect(icon().shadowRoot!.querySelector('svg')).not.toBeNull();
    loading.status = 'error';
    await settle(main);
    expect(icon().getAttribute('name')).toBe('x-circle');
  });

  it('has no axe violations', async () => {
    const main = await mount(`
      <zeno-inline-loading description="Loading"></zeno-inline-loading>
      <zeno-inline-loading status="finished" description="Done"></zeno-inline-loading>
      <zeno-inline-loading status="error" description="Failed"></zeno-inline-loading>`);
    await expectAccessible(main);
  });
});

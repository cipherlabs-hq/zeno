import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoCodeSnippet } from '../../src/components/lit/code-snippet/zeno-code-snippet.js';
import { expectAccessible, mount, settle } from './helpers.js';

const part = (el: Element, name: string) =>
  el.shadowRoot!.querySelector<HTMLElement>(`[part~="${name}"]`)!;
const status = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLElement>('[role="status"]')!;

function stubClipboard(writeText: (text: string) => Promise<void>) {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  return () => {
    if (original) Object.defineProperty(navigator, 'clipboard', original);
    else delete (navigator as { clipboard?: unknown }).clipboard;
  };
}

let restore: (() => void) | undefined;
afterEach(() => {
  restore?.();
  restore = undefined;
});

describe('zeno-code-snippet', () => {
  it('copies its text without the markup indentation and says so', async () => {
    const writeText = vi.fn(async () => {});
    restore = stubClipboard(writeText);
    const main = await mount(`<zeno-code-snippet type="multi">
curl -H "X-API-Key: $KEY" \\
  "https://example.com/api"
</zeno-code-snippet>`);
    const snippet = main.querySelector<ZenoCodeSnippet>('zeno-code-snippet')!;
    const copied: string[] = [];
    snippet.addEventListener('copied', event =>
      copied.push((event as CustomEvent<{ text: string }>).detail.text)
    );

    await userEvent.click(part(snippet, 'copy-button'));
    await settle(main);

    const expected =
      'curl -H "X-API-Key: $KEY" \\\n  "https://example.com/api"';
    expect(writeText).toHaveBeenCalledWith(expected);
    expect(copied).toEqual([expected]);
    expect(status(snippet).textContent!.trim()).toBe('Copied');
    expect(part(snippet, 'copy-button').textContent).toContain('Copied');
  });

  it('copies `value` when it is set, in place of the text shown', async () => {
    const writeText = vi.fn(async () => {});
    restore = stubClipboard(writeText);
    const main = await mount(
      `<zeno-code-snippet value="secret-key">sk_…key</zeno-code-snippet>`
    );
    const snippet = main.querySelector<ZenoCodeSnippet>('zeno-code-snippet')!;
    expect(await snippet.copy()).toBe(true);
    expect(writeText).toHaveBeenCalledWith('secret-key');
  });

  it('announces a refused copy', async () => {
    restore = stubClipboard(async () => {
      throw new Error('denied');
    });
    const main = await mount(`<zeno-code-snippet>npm i</zeno-code-snippet>`);
    const snippet = main.querySelector<ZenoCodeSnippet>('zeno-code-snippet')!;
    let failed = false;
    snippet.addEventListener('copy-failed', () => (failed = true));
    expect(await snippet.copy()).toBe(false);
    await settle(main);
    expect(failed).toBe(true);
    expect(status(snippet).textContent).toContain('Could not copy');
  });

  it('can be scrolled and copied from the keyboard', async () => {
    restore = stubClipboard(vi.fn(async () => {}));
    const main = await mount(`<button id="before">Before</button>
      <zeno-code-snippet label="Base URL">https://example.com</zeno-code-snippet>`);
    const snippet = main.querySelector<ZenoCodeSnippet>('zeno-code-snippet')!;
    main.querySelector<HTMLElement>('#before')!.focus();
    await userEvent.keyboard('{Tab}');
    expect(snippet.shadowRoot!.activeElement).toBe(part(snippet, 'code'));
    expect(part(snippet, 'code').getAttribute('aria-label')).toBe('Base URL');
    await userEvent.keyboard('{Tab}');
    expect(snippet.shadowRoot!.activeElement).toBe(
      part(snippet, 'copy-button')
    );
    expect(part(snippet, 'copy-button').getAttribute('aria-label')).toBe(
      'Copy to clipboard'
    );
  });

  it('keeps one line and scrolls sideways', async () => {
    const main = await mount(
      `<div style="width: 240px"><zeno-code-snippet>${'x'.repeat(200)}</zeno-code-snippet></div>`
    );
    const code = part(main.querySelector('zeno-code-snippet')!, 'code');
    expect(code.scrollWidth).toBeGreaterThan(code.clientWidth);
    expect(code.getBoundingClientRect().height).toBeLessThan(60);
  });

  it('has no axe violations', async () => {
    const main = await mount(`
      <zeno-code-snippet>https://example.com/api</zeno-code-snippet>
      <zeno-code-snippet type="multi">line one
line two</zeno-code-snippet>`);
    await expectAccessible(main);
  });
});

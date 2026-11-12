import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { expectAccessible, mount, nextFrame, settle } from './helpers.js';
import type { ZenoModal } from '../../src/components/lit/modal/zeno-modal.js';
import type { ZenoDrawer } from '../../src/components/lit/drawer/zeno-drawer.js';

type Dialog = ZenoModal | ZenoDrawer;

/**
 * A dialog reports that it closed in a later task, after the element has
 * rendered. Waits long enough for both.
 */
async function task(): Promise<void> {
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve));
}

function native(element: Dialog): HTMLDialogElement {
  return element.shadowRoot!.querySelector('dialog')!;
}

function record(element: Dialog): string[] {
  const seen: string[] = [];
  for (const name of ['open', 'close', 'request-close']) {
    element.addEventListener(name, event => {
      const source = (event as CustomEvent).detail?.source;
      seen.push(source ? `${name}:${source}` : name);
    });
  }
  return seen;
}

describe.each(['zeno-modal', 'zeno-drawer'] as const)('%s', tag => {
  const markup = (attributes = '') => `
    <button id="opener">Open</button>
    <${tag} heading="Delete project" ${attributes}>
      <p>This cannot be undone.</p>
      <button id="inside">Learn more</button>
      <button slot="footer" id="cancel">Cancel</button>
      <button slot="footer" id="confirm">Delete</button>
    </${tag}>`;

  async function open(attributes = '') {
    const main = await mount(markup(attributes));
    const element = main.querySelector<Dialog>(tag)!;
    const opener = main.querySelector<HTMLElement>('#opener')!;
    const seen = record(element);
    opener.focus();
    element.show();
    await settle(main);
    return { main, element, opener, seen };
  }

  it('is closed until asked, then opens as a modal dialog in the top layer', async () => {
    const main = await mount(markup());
    const element = main.querySelector<Dialog>(tag)!;
    expect(native(element).open).toBe(false);
    expect(native(element).getBoundingClientRect().width).toBe(0);

    const seen = record(element);
    element.show();
    await settle(main);
    expect(native(element).open).toBe(true);
    expect(native(element).matches(':modal')).toBe(true);
    expect(element.hasAttribute('open')).toBe(true);
    expect(seen).toEqual(['open']);
    element.close();
    await task();
  });

  it('opens from the attribute', async () => {
    const main = await mount(markup('open'));
    const element = main.querySelector<Dialog>(tag)!;
    expect(native(element).matches(':modal')).toBe(true);
    element.close();
    await task();
  });

  it('is named by its heading', async () => {
    const { element } = await open();
    const dialog = native(element);
    const heading = element.shadowRoot!.getElementById(
      dialog.getAttribute('aria-labelledby')!
    )!;
    expect(heading.textContent!.trim()).toBe('Delete project');
    element.close();
    await task();
  });

  it('moves focus in, keeps Tab inside and returns focus on close', async () => {
    const { element, opener, main } = await open();
    expect(document.activeElement).toBe(element);
    expect(element.shadowRoot!.activeElement?.getAttribute('part')).toBe(
      'close'
    );

    // The page behind is inert: Tab only ever lands inside the dialog.
    const visited = new Set<string>();
    for (let step = 0; step < 6; step++) {
      await userEvent.keyboard('{Tab}');
      const active = document.activeElement;
      if (active && active !== document.body) {
        visited.add(active === element ? 'close' : active.id);
      }
    }
    expect([...visited].sort()).toEqual(
      ['cancel', 'close', 'confirm', 'inside'].sort()
    );
    expect(visited.has('opener')).toBe(false);

    element.close();
    await task();
    await settle(main);
    expect(document.activeElement).toBe(opener);
  });

  it('closes on Escape and says why', async () => {
    const { element, seen, main } = await open();
    await userEvent.keyboard('{Escape}');
    await task();
    await settle(main);
    expect(element.open).toBe(false);
    expect(native(element).open).toBe(false);
    expect(seen).toEqual(['open', 'request-close:escape', 'close']);
  });

  it('closes from the close button', async () => {
    const { element, seen, main } = await open();
    await userEvent.click(
      element.shadowRoot!.querySelector<HTMLElement>('[part="close"]')!
    );
    await task();
    await settle(main);
    expect(element.open).toBe(false);
    expect(seen).toEqual(['open', 'request-close:close-button', 'close']);
  });

  it('closes when the backdrop is pressed, not when the content is', async () => {
    const { element, seen, main } = await open();
    await userEvent.click(main.querySelector<HTMLElement>('p')!);
    await task();
    expect(element.open).toBe(true);

    const box = native(element).getBoundingClientRect();
    // A point outside the panel: the far corner from wherever it sits.
    const x = box.left > 20 ? 5 : window.innerWidth - 5;
    const y = box.top > 20 ? 5 : window.innerHeight - 5;
    const outside = { clientX: x, clientY: y, bubbles: true, composed: true };
    expect(x < box.left || x > box.right || y < box.top || y > box.bottom).toBe(
      true
    );
    native(element).dispatchEvent(new PointerEvent('pointerdown', outside));
    native(element).dispatchEvent(new MouseEvent('click', outside));
    await task();
    await settle(main);
    expect(element.open).toBe(false);
    expect(seen).toEqual(['open', 'request-close:backdrop', 'close']);
  });

  it('stays open when told to ignore the backdrop and Escape', async () => {
    const { element, seen } = await open('no-backdrop-close no-escape-close');
    await userEvent.keyboard('{Escape}');
    const dialog = native(element);
    dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await task();
    expect(element.open).toBe(true);
    expect(seen).toEqual(['open']);
    element.close();
    await task();
  });

  it('stays open when request-close is cancelled', async () => {
    const { element, seen } = await open();
    element.addEventListener('request-close', event => event.preventDefault(), {
      once: true,
    });
    await userEvent.click(
      element.shadowRoot!.querySelector<HTMLElement>('[part="close"]')!
    );
    await task();
    expect(element.open).toBe(true);
    expect(seen).toEqual(['open', 'request-close:close-button']);
    element.close();
    await task();
  });

  it('hands back the value close() was given', async () => {
    const { element } = await open();
    let detail: unknown;
    element.addEventListener('close', event => {
      detail = (event as CustomEvent).detail;
    });
    element.close('confirmed');
    await task();
    expect(detail).toEqual({ returnValue: 'confirmed' });
    expect(element.returnValue).toBe('confirmed');
  });

  it('stops the page scrolling while open, and only then', async () => {
    const root = document.documentElement;
    const { element } = await open();
    expect(root.style.overflow).toBe('hidden');
    element.close();
    await task();
    expect(root.style.overflow).toBe('');
  });

  it('lets go of the page when it is removed while open', async () => {
    const { element } = await open();
    element.remove();
    await task();
    expect(document.documentElement.style.overflow).toBe('');
    expect(element.open).toBe(false);
  });

  it('hides an empty footer', async () => {
    const main = await mount(
      `<${tag} heading="Note" open><p>Saved.</p></${tag}>`
    );
    const element = main.querySelector<Dialog>(tag)!;
    await nextFrame();
    const footer = element.shadowRoot!.querySelector<HTMLElement>('footer')!;
    expect(footer.hidden).toBe(true);
    element.close();
    await task();
  });

  it('has no axe violations while open', async () => {
    const { element, main } = await open();
    await expectAccessible(main);
    element.close();
    await task();
  });
});

describe('zeno-drawer placement', () => {
  it.each([
    ['start', 'left'],
    ['end', 'right'],
    ['top', 'top'],
    ['bottom', 'bottom'],
  ] as const)('%s sits on the %s edge', async (placement, edge) => {
    const main = await mount(
      `<zeno-drawer heading="Filters" placement="${placement}" open><p>Body</p></zeno-drawer>`
    );
    const element = main.querySelector<ZenoDrawer>('zeno-drawer')!;
    await Promise.allSettled(
      native(element)
        .getAnimations()
        .map(animation => animation.finished)
    );
    const box = native(element).getBoundingClientRect();
    const expected = {
      left: [box.left, 0],
      right: [box.right, document.documentElement.clientWidth],
      top: [box.top, 0],
      bottom: [box.bottom, window.innerHeight],
    }[edge];
    expect(Math.round(expected[0])).toBe(expected[1]);
    element.close();
    await task();
  });

  it('follows the reading direction', async () => {
    const main = await mount(
      `<div dir="rtl"><zeno-drawer heading="Filters" placement="start" open><p>Body</p></zeno-drawer></div>`
    );
    const element = main.querySelector<ZenoDrawer>('zeno-drawer')!;
    await Promise.allSettled(
      native(element)
        .getAnimations()
        .map(animation => animation.finished)
    );
    const box = native(element).getBoundingClientRect();
    expect(Math.round(box.right)).toBe(document.documentElement.clientWidth);
    element.close();
    await task();
  });
});

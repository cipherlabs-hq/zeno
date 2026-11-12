import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { entries, expectAccessible, mount, settle } from './helpers.js';
import type { ZenoButton } from '../../src/components/lit/button/zeno-button.js';

const tick = () => new Promise(resolve => setTimeout(resolve));

function inner(button: ZenoButton): HTMLElement {
  return button.shadowRoot!.querySelector<HTMLElement>('.button')!;
}

describe('zeno-button', () => {
  it('sends one click event per click', async () => {
    const main = await mount(`<zeno-button>Save</zeno-button>`);
    const button = main.querySelector<ZenoButton>('zeno-button')!;
    const clicks: Event[] = [];
    button.addEventListener('click', event => clicks.push(event));
    await userEvent.click(inner(button));
    expect(clicks).toHaveLength(1);
    expect(clicks[0]).toBeInstanceOf(MouseEvent);
  });

  it('does nothing to a form by default', async () => {
    const main = await mount(
      `<form><input name="a" value="1" /><zeno-button>Plain</zeno-button></form>`
    );
    const form = main.querySelector('form')!;
    let submits = 0;
    form.addEventListener('submit', event => {
      event.preventDefault();
      submits++;
    });
    await userEvent.click(
      inner(main.querySelector<ZenoButton>('zeno-button')!)
    );
    await tick();
    expect(submits).toBe(0);
  });

  it('submits its form, with its name and value, when type is submit', async () => {
    const main = await mount(
      `<form>
        <input name="a" value="1" />
        <zeno-button type="submit" name="intent" value="save">Save</zeno-button>
      </form>`
    );
    const form = main.querySelector('form')!;
    const submitted: Array<[string, string]>[] = [];
    form.addEventListener('submit', event => {
      event.preventDefault();
      submitted.push(entries(form));
    });
    await userEvent.click(
      inner(main.querySelector<ZenoButton>('zeno-button')!)
    );
    await tick();
    expect(submitted).toEqual([
      [
        ['a', '1'],
        ['intent', 'save'],
      ],
    ]);
    // The entry belongs to that submit only.
    expect(entries(form)).toEqual([['a', '1']]);
  });

  it('submits from the keyboard', async () => {
    const main = await mount(
      `<form><input name="a" value="1" /><zeno-button type="submit">Save</zeno-button></form>`
    );
    const form = main.querySelector('form')!;
    let submits = 0;
    form.addEventListener('submit', event => {
      event.preventDefault();
      submits++;
    });
    main.querySelector('input')!.focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(main.querySelector('zeno-button'));
    await userEvent.keyboard('{Enter}');
    await tick();
    expect(submits).toBe(1);
  });

  it('runs validation before it submits', async () => {
    const main = await mount(
      `<form>
        <zeno-input name="email" label="Email" required></zeno-input>
        <zeno-button type="submit">Save</zeno-button>
      </form>`
    );
    const form = main.querySelector('form')!;
    let submits = 0;
    form.addEventListener('submit', event => {
      event.preventDefault();
      submits++;
    });
    await userEvent.click(
      inner(main.querySelector<ZenoButton>('zeno-button')!)
    );
    await tick();
    await settle(main);
    expect(submits).toBe(0);
    expect(
      main
        .querySelector('zeno-input')!
        .shadowRoot!.querySelector('#field-error')
    ).not.toBeNull();
  });

  it('lets a click listener cancel the submit', async () => {
    const main = await mount(
      `<form><zeno-button type="submit">Save</zeno-button></form>`
    );
    const form = main.querySelector('form')!;
    let submits = 0;
    form.addEventListener('submit', event => {
      event.preventDefault();
      submits++;
    });
    form.addEventListener('click', event => event.preventDefault());
    await userEvent.click(
      inner(main.querySelector<ZenoButton>('zeno-button')!)
    );
    await tick();
    expect(submits).toBe(0);
  });

  it('resets its form when type is reset', async () => {
    const main = await mount(
      `<form>
        <zeno-input name="city" value="Lagos"></zeno-input>
        <zeno-button type="reset">Reset</zeno-button>
      </form>`
    );
    const form = main.querySelector('form')!;
    const input = main.querySelector('zeno-input')!;
    input.value = 'Accra';
    await settle(main);
    expect(entries(form)).toEqual([['city', 'Accra']]);
    await userEvent.click(
      inner(main.querySelector<ZenoButton>('zeno-button')!)
    );
    await tick();
    await settle(main);
    expect(entries(form)).toEqual([['city', 'Lagos']]);
  });

  it('is disabled by its own attribute, by a fieldset and while loading', async () => {
    const main = await mount(
      `<form>
        <zeno-button id="own" type="submit" disabled>One</zeno-button>
        <fieldset disabled><zeno-button id="set" type="submit">Two</zeno-button></fieldset>
        <zeno-button id="busy" type="submit" loading>Three</zeno-button>
      </form>`
    );
    const form = main.querySelector('form')!;
    let submits = 0;
    form.addEventListener('submit', event => {
      event.preventDefault();
      submits++;
    });
    for (const id of ['own', 'set', 'busy']) {
      const button = main.querySelector<ZenoButton>(`#${id}`)!;
      expect((inner(button) as HTMLButtonElement).disabled).toBe(true);
      inner(button).click();
    }
    await tick();
    expect(submits).toBe(0);
    expect(
      inner(main.querySelector<ZenoButton>('#busy')!).getAttribute('aria-busy')
    ).toBe('true');
  });

  it('renders a link when it has an href', async () => {
    const main = await mount(
      `<zeno-button href="#target" variant="outline">Read more</zeno-button>`
    );
    const link = inner(main.querySelector<ZenoButton>('zeno-button')!);
    expect(link.localName).toBe('a');
    expect(link.getAttribute('href')).toBe('#target');
  });

  it('has no axe violations in any variant', async () => {
    const main = await mount(
      ['primary', 'secondary', 'outline', 'ghost', 'danger']
        .map(
          variant =>
            `<zeno-button variant="${variant}">Save</zeno-button>
             <zeno-button variant="${variant}" disabled>Save</zeno-button>`
        )
        .join('') +
        `<zeno-button href="#x">Link</zeno-button>
         <zeno-button loading>Saving</zeno-button>
         <zeno-button icon-only aria-label="Add"><span aria-hidden="true">+</span></zeno-button>`
    );
    await expectAccessible(main);
  });
});

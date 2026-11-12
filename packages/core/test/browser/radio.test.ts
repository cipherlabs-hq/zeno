import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoRadio } from '../../src/components/lit/radio/zeno-radio.js';
import type { ZenoRadioGroup } from '../../src/components/lit/radio-group/zeno-radio-group.js';
import { entries, expectAccessible, mount, settle } from './helpers.js';

const control = (el: Element) => el.shadowRoot!.querySelector('input')!;
// The native input sits under the drawn control, so a pointer meets the label.
const face = (el: Element) => el.shadowRoot!.querySelector('label')!;

const group = (attributes = '') => `
  <zeno-radio-group name="size" label="Size" ${attributes}>
    <zeno-radio value="s" label="Small"></zeno-radio>
    <zeno-radio value="m" label="Medium"></zeno-radio>
    <zeno-radio value="l" label="Large" disabled></zeno-radio>
    <zeno-radio value="xl" label="Extra large"></zeno-radio>
  </zeno-radio-group>`;

describe('zeno-radio-group in a form', () => {
  it('submits one entry, the value of the chosen radio', async () => {
    const main = await mount(`<form>${group('value="m"')}</form>`);
    const radios = [...main.querySelectorAll<ZenoRadio>('zeno-radio')];
    expect(radios.map(radio => radio.checked)).toEqual([
      false,
      true,
      false,
      false,
    ]);
    expect(entries(main.querySelector('form')!)).toEqual([['size', 'm']]);
  });

  it('selects on click and fires one input and one change from the group', async () => {
    const main = await mount(`<form>${group()}</form>`);
    const el = main.querySelector<ZenoRadioGroup>('zeno-radio-group')!;
    const radios = [...main.querySelectorAll<ZenoRadio>('zeno-radio')];
    const seen: string[] = [];
    for (const type of ['input', 'change']) {
      main.addEventListener(type, event =>
        seen.push(
          `${type}:${(event.target as Element).localName}:${(event as CustomEvent).detail.value}`
        )
      );
    }
    await userEvent.click(face(radios[0]));
    await settle(main);
    expect(el.value).toBe('s');
    expect(seen).toEqual([
      'input:zeno-radio-group:s',
      'change:zeno-radio-group:s',
    ]);
    expect(entries(main.querySelector('form')!)).toEqual([['size', 's']]);
  });

  it('has one tab stop and moves the selection with the arrow keys, skipping disabled radios', async () => {
    const main = await mount(
      `<button>before</button>${group('value="m"')}<button>after</button>`
    );
    const el = main.querySelector<ZenoRadioGroup>('zeno-radio-group')!;
    const radios = [...main.querySelectorAll<ZenoRadio>('zeno-radio')];
    main.querySelector('button')!.focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(radios[1]);

    await userEvent.keyboard('{ArrowDown}');
    await settle(main);
    expect(el.value).toBe('xl');
    expect(document.activeElement).toBe(radios[3]);

    await userEvent.keyboard('{ArrowDown}');
    await settle(main);
    expect(el.value).toBe('s');

    await userEvent.keyboard('{ArrowUp}');
    await settle(main);
    expect(el.value).toBe('xl');

    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(main.querySelectorAll('button')[1]);
  });

  it('is invalid while required with nothing chosen', async () => {
    const main = await mount(`<form>${group('required')}</form>`);
    const form = main.querySelector('form')!;
    const el = main.querySelector<ZenoRadioGroup>('zeno-radio-group')!;
    expect(el.validity.valueMissing).toBe(true);
    expect(el.invalid).toBe(false);
    form.requestSubmit();
    await settle(main);
    expect(el.invalid).toBe(true);
    expect(el.shadowRoot!.querySelector('#field-error')).not.toBeNull();

    await userEvent.click(face(main.querySelector('zeno-radio')!));
    await settle(main);
    expect(el.validity.valid).toBe(true);
    expect(el.invalid).toBe(false);
  });

  it('disables every radio inside a disabled fieldset and submits nothing', async () => {
    const main = await mount(
      `<form><fieldset disabled>${group('value="m"')}</fieldset></form>`
    );
    const radios = [...main.querySelectorAll<ZenoRadio>('zeno-radio')];
    expect(radios.every(radio => control(radio).disabled)).toBe(true);
    expect(entries(main.querySelector('form')!)).toEqual([]);
  });

  it('goes back to its first value when the form is reset', async () => {
    const main = await mount(`<form>${group('value="m"')}</form>`);
    const el = main.querySelector<ZenoRadioGroup>('zeno-radio-group')!;
    await userEvent.click(face(main.querySelector('zeno-radio')!));
    await settle(main);
    expect(el.value).toBe('s');
    main.querySelector('form')!.reset();
    await settle(main);
    expect(el.value).toBe('m');
    expect(
      [...main.querySelectorAll<ZenoRadio>('zeno-radio')].map(
        radio => radio.checked
      )
    ).toEqual([false, true, false, false]);
  });

  it('has no axe violations', async () => {
    const main = await mount(
      `${group('value="m" helper-text="You can change this later"')}
       <zeno-radio-group label="Plan" error="Choose a plan" orientation="horizontal">
         <zeno-radio value="a" label="Free"></zeno-radio>
         <zeno-radio value="b" label="Paid"></zeno-radio>
       </zeno-radio-group>`
    );
    await expectAccessible(main);
  });
});

describe('zeno-radio without a group', () => {
  it('submits the checked radio and unchecks the others with the same name', async () => {
    const main = await mount(`<form>
      <zeno-radio name="plan" value="free" label="Free" checked></zeno-radio>
      <zeno-radio name="plan" value="paid" label="Paid"></zeno-radio>
    </form>`);
    const [free, paid] = [...main.querySelectorAll<ZenoRadio>('zeno-radio')];
    expect(entries(main.querySelector('form')!)).toEqual([['plan', 'free']]);
    await userEvent.click(face(paid));
    await settle(main);
    expect([free.checked, paid.checked]).toEqual([false, true]);
    expect(entries(main.querySelector('form')!)).toEqual([['plan', 'paid']]);

    main.querySelector('form')!.reset();
    await settle(main);
    expect([free.checked, paid.checked]).toEqual([true, false]);
  });
});

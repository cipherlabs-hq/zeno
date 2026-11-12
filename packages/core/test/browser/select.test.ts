import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoSelect } from '../../src/components/lit/select/zeno-select.js';
import { entries, expectAccessible, mount, settle } from './helpers.js';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

const trigger = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>('.select__trigger')!;
const dropdown = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLElement>('.select__dropdown')!;
const options = (el: Element) => [
  ...el.shadowRoot!.querySelectorAll<HTMLElement>('[role="option"]'),
];

async function mountSelect(markup: string) {
  const main = await mount(markup);
  const select = main.querySelector<ZenoSelect>('zeno-select')!;
  select.options = OPTIONS;
  await settle(main);
  return { main, select, form: main.querySelector('form') };
}

describe('zeno-select in a form', () => {
  it('submits its value under its name', async () => {
    const { form } = await mountSelect(
      `<form><zeno-select name="fruit" label="Fruit" value="banana"></zeno-select></form>`
    );
    expect(entries(form!)).toEqual([['fruit', 'banana']]);
  });

  it('opens in the top layer, and a click on an option selects it and closes', async () => {
    const { main, select, form } = await mountSelect(
      `<form><zeno-select name="fruit" label="Fruit"></zeno-select></form>`
    );
    const seen: string[] = [];
    for (const type of ['input', 'change']) {
      select.addEventListener(type, event =>
        seen.push(`${type}:${(event as CustomEvent).detail.value}`)
      );
    }
    expect(dropdown(select).matches(':popover-open')).toBe(false);
    await userEvent.click(trigger(select));
    await settle(main);
    expect(trigger(select).getAttribute('aria-expanded')).toBe('true');
    expect(dropdown(select).matches(':popover-open')).toBe(true);
    // Placed under the trigger and as wide as it.
    const anchor = trigger(select).getBoundingClientRect();
    const box = dropdown(select).getBoundingClientRect();
    expect(Math.round(box.left)).toBe(Math.round(anchor.left));
    expect(Math.round(box.width)).toBe(Math.round(anchor.width));
    expect(box.top).toBeGreaterThanOrEqual(anchor.bottom);

    await userEvent.click(options(select)[1]);
    await settle(main);
    expect(select.value).toBe('banana');
    expect(seen).toEqual(['input:banana', 'change:banana']);
    expect(dropdown(select).matches(':popover-open')).toBe(false);
    expect(trigger(select).textContent).toContain('Banana');
    expect(select.shadowRoot!.activeElement).toBe(trigger(select));
    expect(entries(form!)).toEqual([['fruit', 'banana']]);
  });

  it('can be used with the keyboard alone', async () => {
    const { main, select } = await mountSelect(
      `<zeno-select label="Fruit" value="banana"></zeno-select>`
    );
    trigger(select).focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle(main);
    // Opens on the chosen option.
    expect(trigger(select).getAttribute('aria-activedescendant')).toBe(
      options(select)[1].id
    );
    // The disabled option is skipped.
    await userEvent.keyboard('{ArrowDown}');
    await settle(main);
    expect(trigger(select).getAttribute('aria-activedescendant')).toBe(
      options(select)[3].id
    );
    await userEvent.keyboard('{Home}');
    await settle(main);
    expect(trigger(select).getAttribute('aria-activedescendant')).toBe(
      options(select)[0].id
    );
    await userEvent.keyboard('{End}{Enter}');
    await settle(main);
    expect(select.value).toBe('date');
    expect(trigger(select).getAttribute('aria-expanded')).toBe('false');

    await userEvent.keyboard('{Enter}');
    await settle(main);
    expect(trigger(select).getAttribute('aria-expanded')).toBe('true');
    await userEvent.keyboard('{Escape}');
    await settle(main);
    expect(trigger(select).getAttribute('aria-expanded')).toBe('false');
    expect(select.value).toBe('date');
    expect(select.shadowRoot!.activeElement).toBe(trigger(select));
  });

  it('closes on a press outside and when focus leaves', async () => {
    const { main, select } = await mountSelect(
      `<button id="other">Other</button><zeno-select label="Fruit"></zeno-select>`
    );
    await userEvent.click(trigger(select));
    await settle(main);
    expect(dropdown(select).matches(':popover-open')).toBe(true);
    await userEvent.click(main.querySelector('#other')!);
    await settle(main);
    expect(dropdown(select).matches(':popover-open')).toBe(false);

    trigger(select).focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle(main);
    expect(dropdown(select).matches(':popover-open')).toBe(true);
    await userEvent.keyboard('{Tab}');
    await settle(main);
    expect(dropdown(select).matches(':popover-open')).toBe(false);
  });

  it('submits one entry per option when multiple', async () => {
    const { main, select, form } = await mountSelect(
      `<form><zeno-select name="fruit" label="Fruit" multiple></zeno-select></form>`
    );
    await userEvent.click(trigger(select));
    await settle(main);
    await userEvent.click(options(select)[3]);
    await userEvent.click(options(select)[0]);
    await settle(main);
    // Stays open, and the value keeps the order of the options.
    expect(dropdown(select).matches(':popover-open')).toBe(true);
    expect(select.value).toBe('apple,date');
    expect(entries(form!)).toEqual([
      ['fruit', 'apple'],
      ['fruit', 'date'],
    ]);
    expect(options(select).map(o => o.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
      'false',
      'true',
    ]);
    await userEvent.click(options(select)[0]);
    await settle(main);
    expect(entries(form!)).toEqual([['fruit', 'date']]);
  });

  it('filters the options when searchable', async () => {
    const { main, select } = await mountSelect(
      `<zeno-select label="Fruit" searchable></zeno-select>`
    );
    await userEvent.click(trigger(select));
    await settle(main);
    const search =
      select.shadowRoot!.querySelector<HTMLInputElement>('.select__search')!;
    expect(select.shadowRoot!.activeElement).toBe(search);
    let leaked = 0;
    select.addEventListener('input', () => leaked++);
    await userEvent.type(search, 'an');
    await settle(main);
    expect(options(select).map(o => o.textContent!.trim())).toEqual(['Banana']);
    expect(leaked).toBe(0);
    await userEvent.keyboard('{Enter}');
    await settle(main);
    expect(select.value).toBe('banana');
  });

  it('clears with the clear button', async () => {
    const { main, select, form } = await mountSelect(
      `<form><zeno-select name="fruit" label="Fruit" value="apple" clearable></zeno-select></form>`
    );
    const clear =
      select.shadowRoot!.querySelector<HTMLButtonElement>('.select__clear')!;
    expect(clear.closest('.select__trigger')).toBeNull();
    await userEvent.click(clear);
    await settle(main);
    expect(select.value).toBe('');
    expect(entries(form!)).toEqual([['fruit', '']]);
  });

  it('is invalid while required and empty', async () => {
    const { main, select, form } = await mountSelect(
      `<form><zeno-select name="fruit" label="Fruit" required></zeno-select></form>`
    );
    expect(select.validity.valueMissing).toBe(true);
    expect(select.invalid).toBe(false);
    form!.requestSubmit();
    await settle(main);
    expect(select.invalid).toBe(true);
    expect(trigger(select).getAttribute('aria-invalid')).toBe('true');
    expect(trigger(select).getAttribute('aria-describedby')).toBe(
      'field-error'
    );
    select.value = 'apple';
    await settle(main);
    expect(select.validity.valid).toBe(true);
  });

  it('takes its name from an outside label and focuses when that label is clicked', async () => {
    const { select, main } = await mountSelect(
      `<label for="s">Favourite fruit</label><zeno-select id="s"></zeno-select>`
    );
    expect(trigger(select).getAttribute('aria-label')).toBe('Favourite fruit');
    await userEvent.click(main.querySelector('label')!);
    expect(select.shadowRoot!.activeElement).toBe(trigger(select));
  });

  it('cannot be opened inside a disabled fieldset and submits nothing', async () => {
    const { main, select, form } = await mountSelect(
      `<form><fieldset disabled><zeno-select name="fruit" label="Fruit" value="apple"></zeno-select></fieldset></form>`
    );
    expect(trigger(select).disabled).toBe(true);
    select.open();
    await settle(main);
    expect(dropdown(select).matches(':popover-open')).toBe(false);
    expect(entries(form!)).toEqual([]);
  });

  it('goes back to its first value when the form is reset', async () => {
    const { main, select, form } = await mountSelect(
      `<form><zeno-select name="fruit" label="Fruit" value="apple"></zeno-select></form>`
    );
    select.value = 'date';
    await settle(main);
    form!.reset();
    await settle(main);
    expect(select.value).toBe('apple');
    expect(trigger(select).textContent).toContain('Apple');
  });

  it('has no axe violations, closed or open', async () => {
    const { main, select } = await mountSelect(`
      <zeno-select label="Fruit" value="apple" clearable></zeno-select>
      <zeno-select label="Empty"></zeno-select>
      <zeno-select label="Disabled" disabled></zeno-select>
      <zeno-select label="Wrong" error="Choose a fruit"></zeno-select>
    `);
    await expectAccessible(main);
    const second = main.querySelectorAll<ZenoSelect>('zeno-select')[1];
    second.options = OPTIONS;
    second.searchable = true;
    second.multiple = true;
    second.value = 'apple';
    select.open();
    await settle(main);
    await expectAccessible(main);
    select.close();
    second.open();
    await settle(main);
    await expectAccessible(main);
  });
});

import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoDatePicker } from '../../src/components/lit/date-picker/zeno-date-picker.js';
import { entries, expectAccessible, mount, settle } from './helpers.js';

const trigger = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>('.date-picker__input')!;
const calendar = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLElement>('.date-picker__calendar')!;
const day = (el: Element, iso: string) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)!;
const focusedDay = (el: Element) =>
  (el.shadowRoot!.activeElement as HTMLElement | null)?.dataset.date;

async function mountPicker(markup: string) {
  const main = await mount(markup);
  const picker = main.querySelector<ZenoDatePicker>('zeno-date-picker')!;
  return { main, picker, form: main.querySelector('form') };
}

describe('zeno-date-picker in a form', () => {
  it('submits an ISO date and shows it in the chosen format', async () => {
    const { picker, form } = await mountPicker(
      `<form><zeno-date-picker name="due" label="Due" value="2031-03-09" format="DD.MM.YYYY"></zeno-date-picker></form>`
    );
    expect(entries(form!)).toEqual([['due', '2031-03-09']]);
    expect(trigger(picker).textContent!.trim()).toBe('09.03.2031');
    expect(trigger(picker).getAttribute('aria-label')).toBe('Due, 09.03.2031');
  });

  it('opens in the top layer on the chosen day, and a click on a day selects it', async () => {
    const { main, picker, form } = await mountPicker(
      `<form><zeno-date-picker name="due" label="Due" value="2031-03-09"></zeno-date-picker></form>`
    );
    const seen: string[] = [];
    for (const type of ['input', 'change']) {
      picker.addEventListener(type, event =>
        seen.push(`${type}:${(event as CustomEvent).detail.value}`)
      );
    }
    await userEvent.click(trigger(picker));
    await settle(main);
    expect(calendar(picker).matches(':popover-open')).toBe(true);
    expect(trigger(picker).getAttribute('aria-expanded')).toBe('true');
    expect(focusedDay(picker)).toBe('2031-03-09');
    expect(day(picker, '2031-03-09').getAttribute('aria-pressed')).toBe('true');

    await userEvent.click(day(picker, '2031-03-20'));
    await settle(main);
    expect(picker.value).toBe('2031-03-20');
    expect(seen).toEqual(['input:2031-03-20', 'change:2031-03-20']);
    expect(calendar(picker).matches(':popover-open')).toBe(false);
    expect(picker.shadowRoot!.activeElement).toBe(trigger(picker));
    expect(entries(form!)).toEqual([['due', '2031-03-20']]);
  });

  it('can be used with the keyboard alone', async () => {
    const { main, picker } = await mountPicker(
      `<zeno-date-picker label="Due" value="2031-03-09"></zeno-date-picker>`
    );
    trigger(picker).focus();
    await userEvent.keyboard('{Enter}');
    await settle(main);
    expect(focusedDay(picker)).toBe('2031-03-09');

    await userEvent.keyboard('{ArrowRight}');
    await settle(main);
    expect(focusedDay(picker)).toBe('2031-03-10');
    await userEvent.keyboard('{ArrowDown}');
    await settle(main);
    expect(focusedDay(picker)).toBe('2031-03-17');
    // Into the next month, and the view follows.
    await userEvent.keyboard('{PageDown}');
    await settle(main);
    expect(focusedDay(picker)).toBe('2031-04-17');
    await userEvent.keyboard('{Home}');
    await settle(main);
    expect(focusedDay(picker)).toBe('2031-04-13');

    await userEvent.keyboard('{Enter}');
    await settle(main);
    expect(picker.value).toBe('2031-04-13');
    expect(calendar(picker).matches(':popover-open')).toBe(false);

    await userEvent.keyboard('{Enter}');
    await settle(main);
    expect(calendar(picker).matches(':popover-open')).toBe(true);
    await userEvent.keyboard('{Escape}');
    await settle(main);
    expect(calendar(picker).matches(':popover-open')).toBe(false);
    expect(picker.shadowRoot!.activeElement).toBe(trigger(picker));
    expect(picker.value).toBe('2031-04-13');
  });

  it('does not let a day outside min, max or the disabled dates be chosen', async () => {
    const { main, picker } = await mountPicker(
      `<zeno-date-picker label="Due" value="2031-03-09" min="2031-03-05" max="2031-03-25" disabled-dates='["2031-03-12"]'></zeno-date-picker>`
    );
    picker.open();
    await settle(main);
    expect(day(picker, '2031-03-04').disabled).toBe(true);
    expect(day(picker, '2031-03-05').disabled).toBe(false);
    expect(day(picker, '2031-03-12').disabled).toBe(true);
    expect(day(picker, '2031-03-26').disabled).toBe(true);

    picker.value = '2031-04-01';
    await settle(main);
    expect(picker.validity.rangeOverflow).toBe(true);
    picker.value = 'tomorrow';
    await settle(main);
    expect(picker.validity.badInput).toBe(true);
  });

  it('closes on a press outside', async () => {
    const { main, picker } = await mountPicker(
      `<button id="other">Other</button><zeno-date-picker label="Due"></zeno-date-picker>`
    );
    await userEvent.click(trigger(picker));
    await settle(main);
    expect(calendar(picker).matches(':popover-open')).toBe(true);
    await userEvent.click(main.querySelector('#other')!);
    await settle(main);
    expect(calendar(picker).matches(':popover-open')).toBe(false);
  });

  it('is invalid while required and empty', async () => {
    const { main, picker, form } = await mountPicker(
      `<form><zeno-date-picker name="due" label="Due" required></zeno-date-picker></form>`
    );
    expect(picker.validity.valueMissing).toBe(true);
    expect(picker.invalid).toBe(false);
    form!.requestSubmit();
    await settle(main);
    expect(picker.invalid).toBe(true);
    expect(picker.shadowRoot!.querySelector('#field-error')).not.toBeNull();
    picker.value = '2031-03-09';
    await settle(main);
    expect(picker.validity.valid).toBe(true);
  });

  it('takes its name from an outside label and focuses when that label is clicked', async () => {
    const { main, picker } = await mountPicker(
      `<label for="d">Start date</label><zeno-date-picker id="d"></zeno-date-picker>`
    );
    expect(trigger(picker).getAttribute('aria-label')).toBe(
      'Start date, Select date'
    );
    await userEvent.click(main.querySelector('label')!);
    expect(picker.shadowRoot!.activeElement).toBe(trigger(picker));
  });

  it('cannot be opened inside a disabled fieldset and submits nothing', async () => {
    const { main, picker, form } = await mountPicker(
      `<form><fieldset disabled><zeno-date-picker name="due" label="Due" value="2031-03-09"></zeno-date-picker></fieldset></form>`
    );
    expect(trigger(picker).disabled).toBe(true);
    picker.open();
    await settle(main);
    expect(calendar(picker).matches(':popover-open')).toBe(false);
    expect(entries(form!)).toEqual([]);
  });

  it('goes back to its first value when the form is reset', async () => {
    const { main, picker, form } = await mountPicker(
      `<form><zeno-date-picker name="due" label="Due" value="2031-03-09"></zeno-date-picker></form>`
    );
    picker.value = '2031-05-01';
    await settle(main);
    form!.reset();
    await settle(main);
    expect(picker.value).toBe('2031-03-09');
  });

  it('has no axe violations, closed or open', async () => {
    const { main, picker } = await mountPicker(`
      <zeno-date-picker label="Due" value="2031-03-09" min="2031-03-05"></zeno-date-picker>
      <zeno-date-picker label="Empty"></zeno-date-picker>
      <zeno-date-picker label="Disabled" disabled></zeno-date-picker>
      <zeno-date-picker label="Wrong" error="Choose a date"></zeno-date-picker>
    `);
    await expectAccessible(main);
    picker.open();
    await settle(main);
    await expectAccessible(main);
  });
});

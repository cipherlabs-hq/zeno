import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoInput } from '../../src/components/lit/input/zeno-input.js';
import { entries, expectAccessible, mount, settle } from './helpers.js';

const control = (el: Element) => el.shadowRoot!.querySelector('input')!;

describe('zeno-input in a form', () => {
  it('submits its value under its name', async () => {
    const main = await mount(
      `<form><zeno-input name="email" value="a@b.co" label="Email"></zeno-input></form>`
    );
    const form = main.querySelector('form')!;
    expect(entries(form)).toEqual([['email', 'a@b.co']]);

    const input = main.querySelector<ZenoInput>('zeno-input')!;
    input.value = 'c@d.co';
    await settle(main);
    expect(entries(form)).toEqual([['email', 'c@d.co']]);
    expect(input.form).toBe(form);
  });

  it('submits what the user types and fires one input event per key', async () => {
    const main = await mount(
      `<form><zeno-input name="q" label="Search"></zeno-input></form>`
    );
    const input = main.querySelector<ZenoInput>('zeno-input')!;
    const seen: unknown[] = [];
    input.addEventListener('input', event =>
      seen.push((event as CustomEvent).detail.value)
    );
    await userEvent.type(control(input), 'abc');
    await settle(main);
    expect(seen).toEqual(['a', 'ab', 'abc']);
    expect(input.value).toBe('abc');
    expect(entries(main.querySelector('form')!)).toEqual([['q', 'abc']]);
  });

  it('does not fire change when the value is set from script', async () => {
    const main = await mount(`<zeno-input label="Name"></zeno-input>`);
    const input = main.querySelector<ZenoInput>('zeno-input')!;
    let changes = 0;
    input.addEventListener('change', () => changes++);
    input.value = 'set';
    await settle(main);
    expect(changes).toBe(0);
    expect(control(input).value).toBe('set');
  });

  it('is invalid while required and empty, and blocks submission', async () => {
    const main = await mount(
      `<form><zeno-input name="n" required label="Name"></zeno-input></form>`
    );
    const form = main.querySelector('form')!;
    const input = main.querySelector<ZenoInput>('zeno-input')!;
    expect(input.validity.valueMissing).toBe(true);
    expect(input.checkValidity()).toBe(false);
    expect(input.matches(':invalid')).toBe(true);
    expect(form.matches(':invalid')).toBe(true);
    expect(input.validationMessage).not.toBe('');
    // Nothing is shown before the user has had a chance to answer.
    expect(input.invalid).toBe(false);

    let submitted = 0;
    form.addEventListener('submit', event => {
      event.preventDefault();
      submitted++;
    });
    form.requestSubmit();
    await settle(main);
    expect(submitted).toBe(0);
    expect(input.invalid).toBe(true);
    expect(control(input).getAttribute('aria-invalid')).toBe('true');
    const message = input.shadowRoot!.querySelector('#field-error')!;
    expect(message.textContent!.trim()).toBe(input.validationMessage);
    expect(control(input).getAttribute('aria-describedby')).toBe('field-error');

    input.value = 'Ada';
    await settle(main);
    expect(input.validity.valid).toBe(true);
    form.requestSubmit();
    expect(submitted).toBe(1);
  });

  it('mirrors the native constraints of its type', async () => {
    const main = await mount(
      `<zeno-input type="email" value="nope" label="Email"></zeno-input>`
    );
    const input = main.querySelector<ZenoInput>('zeno-input')!;
    expect(input.validity.typeMismatch).toBe(true);
    input.setCustomValidity('Taken');
    expect(input.validity.customError).toBe(true);
    expect(input.validationMessage).toBe('Taken');
    input.setCustomValidity('');
    input.value = 'a@b.co';
    await settle(main);
    expect(input.validity.valid).toBe(true);
  });

  it('takes its accessible name from a label that points at it', async () => {
    const main = await mount(
      `<label for="city">City</label><zeno-input id="city"></zeno-input>`
    );
    const input = main.querySelector<ZenoInput>('zeno-input')!;
    expect(input.labels.length).toBe(1);
    expect(control(input).getAttribute('aria-label')).toBe('City');

    await userEvent.click(main.querySelector('label')!);
    expect(input.shadowRoot!.activeElement).toBe(control(input));
  });

  it('names the control from its own label property', async () => {
    const main = await mount(`<zeno-input label="Phone"></zeno-input>`);
    const input = main.querySelector<ZenoInput>('zeno-input')!;
    const label = input.shadowRoot!.querySelector('label')!;
    expect(label.htmlFor).toBe(control(input).id);
    expect(label.textContent).toContain('Phone');
  });

  it('is disabled by its own attribute and by a fieldset', async () => {
    const main = await mount(
      `<form>
        <zeno-input name="a" value="1" disabled label="A"></zeno-input>
        <fieldset disabled><zeno-input name="b" value="2" label="B"></zeno-input></fieldset>
        <zeno-input name="c" value="3" label="C"></zeno-input>
      </form>`
    );
    const [a, b, c] = main.querySelectorAll<ZenoInput>('zeno-input');
    expect(entries(main.querySelector('form')!)).toEqual([['c', '3']]);
    expect(control(a).disabled).toBe(true);
    expect(control(b).disabled).toBe(true);
    expect(b.matches(':disabled')).toBe(true);
    expect(control(c).disabled).toBe(false);

    main.querySelector('fieldset')!.disabled = false;
    await settle(main);
    expect(control(b).disabled).toBe(false);
    expect(entries(main.querySelector('form')!)).toEqual([
      ['b', '2'],
      ['c', '3'],
    ]);
  });

  it('goes back to its first value when the form is reset', async () => {
    const main = await mount(
      `<form><zeno-input name="n" value="first" label="Name"></zeno-input></form>`
    );
    const form = main.querySelector('form')!;
    const input = main.querySelector<ZenoInput>('zeno-input')!;
    await userEvent.fill(control(input), 'second');
    await settle(main);
    expect(entries(form)).toEqual([['n', 'second']]);
    expect(input.dirty).toBe(true);

    form.reset();
    await settle(main);
    expect(input.value).toBe('first');
    expect(control(input).value).toBe('first');
    expect(input.dirty).toBe(false);
    expect(entries(form)).toEqual([['n', 'first']]);
  });

  it('submits its form when Enter is pressed', async () => {
    const main = await mount(
      `<form><zeno-input name="n" value="x" label="Name"></zeno-input></form>`
    );
    const form = main.querySelector('form')!;
    let submitted = 0;
    form.addEventListener('submit', event => {
      event.preventDefault();
      submitted++;
    });
    control(main.querySelector('zeno-input')!).focus();
    await userEvent.keyboard('{Enter}');
    expect(submitted).toBe(1);
  });

  it('shows content placed in its start slot', async () => {
    const main = await mount(
      `<zeno-input label="Amount"><span slot="start">$</span></zeno-input>`
    );
    const input = main.querySelector<ZenoInput>('zeno-input')!;
    const start = input.shadowRoot!.querySelector<HTMLElement>(
      '.input__icon--start'
    )!;
    expect(start.hidden).toBe(false);
    expect(start.getBoundingClientRect().width).toBeGreaterThan(0);
  });

  it('has no axe violations', async () => {
    const main = await mount(
      `<zeno-input label="Email" type="email" placeholder="you@example.com"></zeno-input>
       <zeno-input label="Name" required error="Enter your name"></zeno-input>
       <zeno-input label="Locked" value="Fixed" disabled></zeno-input>
       <label for="outside">Outside label</label><zeno-input id="outside"></zeno-input>`
    );
    await expectAccessible(main);
  });
});

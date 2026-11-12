import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoTextarea } from '../../src/components/lit/textarea/zeno-textarea.js';
import { entries, expectAccessible, mount, settle } from './helpers.js';

const control = (el: Element) => el.shadowRoot!.querySelector('textarea')!;

describe('zeno-textarea in a form', () => {
  it('submits what the user types', async () => {
    const main = await mount(
      `<form><zeno-textarea name="notes" label="Notes"></zeno-textarea></form>`
    );
    const textarea = main.querySelector<ZenoTextarea>('zeno-textarea')!;
    const seen: unknown[] = [];
    textarea.addEventListener('input', event =>
      seen.push((event as CustomEvent).detail.value)
    );
    await userEvent.type(control(textarea), 'hi');
    await settle(main);
    expect(seen).toEqual(['h', 'hi']);
    expect(entries(main.querySelector('form')!)).toEqual([['notes', 'hi']]);
  });

  it('is invalid while required and empty, and shows it after a refused submit', async () => {
    const main = await mount(
      `<form><zeno-textarea name="notes" required label="Notes"></zeno-textarea></form>`
    );
    const form = main.querySelector('form')!;
    const textarea = main.querySelector<ZenoTextarea>('zeno-textarea')!;
    expect(textarea.validity.valueMissing).toBe(true);
    expect(textarea.invalid).toBe(false);

    form.requestSubmit();
    await settle(main);
    expect(textarea.invalid).toBe(true);
    expect(control(textarea).getAttribute('aria-invalid')).toBe('true');
    expect(textarea.shadowRoot!.querySelector('#field-error')).not.toBeNull();

    textarea.value = 'Something';
    await settle(main);
    expect(textarea.validity.valid).toBe(true);
    expect(textarea.invalid).toBe(false);
  });

  it('takes its name from an outside label and focuses when that label is clicked', async () => {
    const main = await mount(
      `<label for="t">Biography</label><zeno-textarea id="t"></zeno-textarea>`
    );
    const textarea = main.querySelector<ZenoTextarea>('zeno-textarea')!;
    expect(control(textarea).getAttribute('aria-label')).toBe('Biography');
    await userEvent.click(main.querySelector('label')!);
    expect(textarea.shadowRoot!.activeElement).toBe(control(textarea));
  });

  it('is disabled by an ancestor fieldset and submits nothing while disabled', async () => {
    const main = await mount(
      `<form><fieldset disabled><zeno-textarea name="notes" value="x" label="Notes"></zeno-textarea></fieldset></form>`
    );
    const textarea = main.querySelector<ZenoTextarea>('zeno-textarea')!;
    expect(control(textarea).disabled).toBe(true);
    expect(entries(main.querySelector('form')!)).toEqual([]);
    main.querySelector('fieldset')!.disabled = false;
    await settle(main);
    expect(control(textarea).disabled).toBe(false);
    expect(entries(main.querySelector('form')!)).toEqual([['notes', 'x']]);
  });

  it('goes back to its first value when the form is reset', async () => {
    const main = await mount(
      `<form><zeno-textarea name="notes" value="first" label="Notes"></zeno-textarea></form>`
    );
    const textarea = main.querySelector<ZenoTextarea>('zeno-textarea')!;
    await userEvent.type(control(textarea), ' more');
    await settle(main);
    expect(textarea.value).toBe('first more');
    main.querySelector('form')!.reset();
    await settle(main);
    expect(textarea.value).toBe('first');
    expect(control(textarea).value).toBe('first');
  });

  it('has no axe violations', async () => {
    const main = await mount(`
      <zeno-textarea label="Notes" placeholder="Anything else?"></zeno-textarea>
      <zeno-textarea label="Summary" value="Text" show-count maxlength="100"></zeno-textarea>
      <zeno-textarea label="Locked" disabled value="Text"></zeno-textarea>
      <zeno-textarea label="Wrong" error="This needs another look"></zeno-textarea>
    `);
    await expectAccessible(main);
  });
});

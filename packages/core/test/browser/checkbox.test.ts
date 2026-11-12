import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoCheckbox } from '../../src/components/lit/checkbox/zeno-checkbox.js';
import type { ZenoSwitch } from '../../src/components/lit/switch/zeno-switch.js';
import { entries, expectAccessible, mount, settle } from './helpers.js';

const control = (el: Element) => el.shadowRoot!.querySelector('input')!;
// The native input sits under the drawn control, so a pointer meets the label.
const face = (el: Element) => el.shadowRoot!.querySelector('label')!;

for (const tag of ['zeno-checkbox', 'zeno-switch'] as const) {
  type Control = ZenoCheckbox | ZenoSwitch;

  describe(`${tag} in a form`, () => {
    it('submits "on" only while checked, or its own value when it has one', async () => {
      const main = await mount(`<form>
        <${tag} name="a" label="A"></${tag}>
        <${tag} name="b" label="B" checked></${tag}>
        <${tag} name="c" label="C" checked value="yes"></${tag}>
      </form>`);
      expect(entries(main.querySelector('form')!)).toEqual([
        ['b', 'on'],
        ['c', 'yes'],
      ]);
    });

    it('toggles on click and on Space, firing input then change once each', async () => {
      const main = await mount(
        `<form><${tag} name="a" label="Agree"></${tag}></form>`
      );
      const el = main.querySelector<Control>(tag)!;
      const seen: string[] = [];
      for (const type of ['input', 'change']) {
        el.addEventListener(type, event =>
          seen.push(`${type}:${(event as CustomEvent).detail.checked}`)
        );
      }
      await userEvent.click(face(el));
      await settle(main);
      expect(el.checked).toBe(true);
      expect(seen).toEqual(['input:true', 'change:true']);
      expect(entries(main.querySelector('form')!)).toEqual([['a', 'on']]);

      control(el).focus();
      await userEvent.keyboard(' ');
      await settle(main);
      expect(el.checked).toBe(false);
      expect(seen.slice(2)).toEqual(['input:false', 'change:false']);
    });

    it('is invalid while required and unchecked', async () => {
      const main = await mount(
        `<form><${tag} name="a" required label="Agree"></${tag}></form>`
      );
      const form = main.querySelector('form')!;
      const el = main.querySelector<Control>(tag)!;
      expect(el.validity.valueMissing).toBe(true);
      expect(el.invalid).toBe(false);
      form.requestSubmit();
      await settle(main);
      expect(el.invalid).toBe(true);
      expect(control(el).getAttribute('aria-invalid')).toBe('true');
      expect(el.shadowRoot!.querySelector('#field-error')).not.toBeNull();

      await userEvent.click(face(el));
      await settle(main);
      expect(el.validity.valid).toBe(true);
      expect(form.checkValidity()).toBe(true);
    });

    it('takes its name from an outside label, and a click on that label toggles it', async () => {
      const main = await mount(
        `<label for="c">Send me news</label><${tag} id="c"></${tag}>`
      );
      const el = main.querySelector<Control>(tag)!;
      expect(control(el).getAttribute('aria-label')).toBe('Send me news');
      await userEvent.click(main.querySelector('label')!);
      await settle(main);
      expect(el.checked).toBe(true);
    });

    it('cannot be toggled inside a disabled fieldset and submits nothing', async () => {
      const main = await mount(
        `<form><fieldset disabled><${tag} name="a" checked label="A"></${tag}></fieldset></form>`
      );
      const el = main.querySelector<Control>(tag)!;
      expect(control(el).disabled).toBe(true);
      expect(entries(main.querySelector('form')!)).toEqual([]);
    });

    it('goes back to its first state when the form is reset', async () => {
      const main = await mount(
        `<form><${tag} name="a" checked label="A"></${tag}><${tag} name="b" label="B"></${tag}></form>`
      );
      const [a, b] = [...main.querySelectorAll<Control>(tag)];
      await userEvent.click(face(a));
      await userEvent.click(face(b));
      await settle(main);
      expect([a.checked, b.checked]).toEqual([false, true]);
      main.querySelector('form')!.reset();
      await settle(main);
      expect([a.checked, b.checked]).toEqual([true, false]);
      expect(entries(main.querySelector('form')!)).toEqual([['a', 'on']]);
    });

    it('has no axe violations', async () => {
      const main = await mount(`
        <${tag} label="Plain"></${tag}>
        <${tag} label="Checked" checked></${tag}>
        <${tag} label="Required" required></${tag}>
        <${tag} label="Disabled" disabled></${tag}>
        <${tag} label="Wrong" error="You must accept this"></${tag}>
      `);
      await expectAccessible(main);
    });
  });
}

describe('zeno-checkbox', () => {
  it('shows the indeterminate state and clears it when the user chooses', async () => {
    const main = await mount(
      `<zeno-checkbox label="All" indeterminate></zeno-checkbox>`
    );
    const el = main.querySelector<ZenoCheckbox>('zeno-checkbox')!;
    expect(control(el).indeterminate).toBe(true);
    await userEvent.click(face(el));
    await settle(main);
    expect(el.indeterminate).toBe(false);
    expect(el.checked).toBe(true);
  });
});

describe('zeno-switch', () => {
  it('is exposed as a switch', async () => {
    const main = await mount(`<zeno-switch label="Wi-Fi"></zeno-switch>`);
    expect(
      control(main.querySelector('zeno-switch')!).getAttribute('role')
    ).toBe('switch');
  });
});

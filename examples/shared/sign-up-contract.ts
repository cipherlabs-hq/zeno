// The same checks run against every example app. Each app renders the same
// small sign-up form, so one set of checks shows what a framework can and
// cannot do with the elements: pass properties, hear events, keep its own
// state and the element in step in both directions, and submit a form.

import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';

interface Rendering {
  updateComplete?: Promise<unknown>;
}

type Field = HTMLElement & { value: unknown };

function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

/** Waits for the framework and every element to finish rendering. */
async function settle(): Promise<void> {
  for (let pass = 0; pass < 3; pass++) {
    const elements = [
      ...document.querySelectorAll<HTMLElement & Rendering>('*'),
    ];
    await Promise.all(elements.map(element => element.updateComplete));
    await frame();
    await new Promise(resolve => setTimeout(resolve));
  }
}

function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Nothing matches ${selector}`);
  return found;
}

function inner<T extends Element = HTMLElement>(
  host: HTMLElement,
  selector: string
): T {
  const found = host.shadowRoot?.querySelector<T>(selector);
  if (!found) throw new Error(`Nothing matches ${selector} inside the element`);
  return found;
}

function text(testId: string): string {
  return element(`[data-testid="${testId}"]`).textContent?.trim() ?? '';
}

export function signUpContract(
  mount: (target: HTMLElement) => void | Promise<void>,
  unmount: () => void | Promise<void> = () => {}
): void {
  describe('the sign-up form', () => {
    let target: HTMLElement;

    beforeEach(async () => {
      target = document.createElement('div');
      document.body.append(target);
      await mount(target);
      await settle();
    });

    afterEach(async () => {
      await unmount();
      target.remove();
    });

    test('an array reaches the element as a property', () => {
      const select = element<HTMLElement & { options: unknown[] }>(
        'zeno-select'
      );
      expect(select.options).toHaveLength(3);
      expect(select.getAttribute('options')).toBeNull();
    });

    test('typing in a field updates the state of the app', async () => {
      const input = element<Field>('zeno-input');
      await userEvent.fill(inner(input, 'input'), 'grace@example.com');
      await settle();
      expect(text('state')).toContain('email=grace@example.com');
    });

    test('changing the state of the app updates the fields', async () => {
      await userEvent.click(element('#fill'));
      await settle();
      expect(element<Field>('zeno-input').value).toBe('ada@example.com');
      expect(element<Field>('zeno-select').value).toBe('team');
      expect(
        element<HTMLElement & { checked: boolean }>('zeno-checkbox').checked
      ).toBe(true);
      expect(text('state')).toBe('email=ada@example.com plan=team updates=yes');
    });

    test('ticking the checkbox updates the state of the app', async () => {
      const checkbox = element('zeno-checkbox');
      await userEvent.click(inner(checkbox, 'label'));
      await settle();
      expect(text('state')).toContain('updates=yes');
      await userEvent.click(inner(checkbox, 'label'));
      await settle();
      expect(text('state')).toContain('updates=no');
    });

    test('choosing an option updates the state of the app', async () => {
      const select = element('zeno-select');
      await userEvent.click(inner(select, '[part="trigger"]'));
      await settle();
      const options =
        select.shadowRoot!.querySelectorAll<HTMLElement>('[part~="option"]');
      await userEvent.click(options[2]);
      await settle();
      expect(text('state')).toContain('plan=company');
    });

    test('a property opens the modal and its close event comes back', async () => {
      const modal = element<HTMLElement & { open: boolean }>('zeno-modal');
      expect(text('modal-state')).toBe('closed');

      await userEvent.click(element('#show-details'));
      await settle();
      expect(modal.open).toBe(true);
      expect(inner<HTMLDialogElement>(modal, 'dialog').open).toBe(true);
      expect(text('modal-state')).toBe('open');

      await userEvent.keyboard('{Escape}');
      await settle();
      expect(modal.open).toBe(false);
      expect(text('modal-state')).toBe('closed');
    });

    test('the form submits what the fields hold', async () => {
      await userEvent.click(element('#fill'));
      await settle();
      await userEvent.click(element('zeno-button[type="submit"]'));
      await settle();
      expect(text('submitted')).toBe(
        'Submitted: email=ada@example.com&plan=team&updates=on'
      );
    });

    test('an empty required field stops the form from submitting', async () => {
      await userEvent.click(element('zeno-button[type="submit"]'));
      await settle();
      expect(text('submitted')).toBe('');
      expect(element('zeno-input').matches(':invalid')).toBe(true);
    });
  });
}

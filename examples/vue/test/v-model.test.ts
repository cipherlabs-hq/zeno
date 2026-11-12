import { afterEach, expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { createApp, nextTick, type App as VueApp } from 'vue';
import type { ZenoSwitch } from '@usezeno/core/web-components';
import CheckedByType from '../src/CheckedByType.vue';

let app: VueApp | undefined;
let target: HTMLElement | undefined;

afterEach(() => {
  app?.unmount();
  target?.remove();
});

test('v-model with type="checkbox" binds `checked` in both directions', async () => {
  target = document.createElement('div');
  document.body.append(target);
  app = createApp(CheckedByType);
  const view = app.mount(target) as unknown as { on: boolean };
  const element = target.querySelector<ZenoSwitch>('zeno-switch')!;
  const readout = target.querySelector('[data-testid="on"]')!;
  await element.updateComplete;
  expect(element.checked).toBe(false);

  await userEvent.click(element.shadowRoot!.querySelector('label')!);
  await nextTick();
  expect(element.checked).toBe(true);
  expect(readout.textContent).toBe('on');

  view.on = false;
  await nextTick();
  expect(element.checked).toBe(false);
  expect(readout.textContent).toBe('off');
});

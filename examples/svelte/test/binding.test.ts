import { flushSync, mount, unmount } from 'svelte';
import { compile } from 'svelte/compiler';
import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoModal } from '@usezeno/svelte';
import RequestClose from '../src/RequestClose.svelte';

function compileError(source: string): string {
  try {
    compile(source, { generate: 'client' });
    return '';
  } catch (error) {
    return (error as { code?: string }).code ?? String(error);
  }
}

// These two record a limit of Svelte, not of Zeno. If one starts failing,
// Svelte has begun to accept the binding and the examples can use it.
test('Svelte rejects bind:value on a custom element', () => {
  expect(
    compileError(
      '<script>let email = $state("")</script><zeno-input bind:value={email}></zeno-input>'
    )
  ).toBe('bind_invalid_target');
});

test('Svelte rejects bind:checked on a custom element', () => {
  expect(
    compileError(
      '<script>let on = $state(false)</script><zeno-checkbox bind:checked={on}></zeno-checkbox>'
    )
  ).toBe('bind_invalid_target');
});

test('an event with a hyphen in its name is heard and can be cancelled', async () => {
  const target = document.createElement('div');
  document.body.append(target);
  const app = mount(RequestClose, { target });
  flushSync();
  const modal = target.querySelector<ZenoModal>('zeno-modal')!;
  await modal.updateComplete;
  expect(modal.open).toBe(true);

  await userEvent.keyboard('{Escape}');
  flushSync();
  expect(target.querySelector('[data-testid="asked"]')!.textContent).toBe('1');
  expect(modal.open).toBe(true);

  await unmount(app);
  target.remove();
});

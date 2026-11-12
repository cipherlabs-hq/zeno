// No framework: the elements are used the way any HTML element is, with
// properties, attributes and addEventListener.

import '@usezeno/core/web-components';
import type {
  ZenoCheckbox,
  ZenoInput,
  ZenoModal,
  ZenoSelect,
} from '@usezeno/core/web-components';
import { plans, submission } from '../../shared/plans.js';

export function start(root: ParentNode = document): void {
  const find = <T extends Element>(selector: string): T => {
    const found = root.querySelector<T>(selector);
    if (!found) throw new Error(`Nothing matches ${selector}`);
    return found;
  };
  const form = find<HTMLFormElement>('form');
  const email = find<ZenoInput>('zeno-input');
  const plan = find<ZenoSelect>('zeno-select');
  const updates = find<ZenoCheckbox>('zeno-checkbox');
  const modal = find<ZenoModal>('zeno-modal');
  const state = find<HTMLElement>('[data-testid="state"]');
  const submitted = find<HTMLElement>('[data-testid="submitted"]');
  const modalState = find<HTMLElement>('[data-testid="modal-state"]');

  // An array cannot be written as an attribute, so it is set as a property.
  plan.options = plans;
  plan.value = 'free';

  const showState = (): void => {
    state.textContent = `email=${email.value} plan=${plan.value} updates=${
      updates.checked ? 'yes' : 'no'
    }`;
  };
  showState();
  // `input` bubbles from every form control, as it does from native ones.
  form.addEventListener('input', showState);

  find('#fill').addEventListener('click', () => {
    email.value = 'ada@example.com';
    plan.value = 'team';
    updates.checked = true;
    showState();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    submitted.textContent = `Submitted: ${submission(form)}`;
  });

  find('#show-details').addEventListener('click', () => modal.show());
  find('#close-details').addEventListener('click', () => modal.close());
  modal.addEventListener('open', () => (modalState.textContent = 'open'));
  modal.addEventListener('close', () => (modalState.textContent = 'closed'));
}

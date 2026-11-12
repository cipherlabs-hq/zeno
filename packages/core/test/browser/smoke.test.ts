import { expect, it } from 'vitest';

const tags = [
  'accordion',
  'alert',
  'avatar',
  'badge',
  'base-field',
  'breadcrumb',
  'button',
  'card',
  'checkbox',
  'chip',
  'container',
  'data-table',
  'date-picker',
  'divider',
  'drawer',
  'file-upload',
  'grid',
  'hamburger',
  'icon',
  'input',
  'modal',
  'nav-rail',
  'pagination',
  'paper',
  'progress-bar',
  'radio',
  'radio-group',
  'select',
  'skeleton',
  'slider',
  'spinner',
  'stepper',
  'switch',
  'tabs',
  'tag',
  'textarea',
  'theme-toggle',
  'toast',
  'tooltip',
].map(name => `zeno-${name}`);

it.each(tags)('%s is defined and renders', async tag => {
  expect(customElements.get(tag)).toBeDefined();
  const el = document.createElement(tag) as HTMLElement & {
    updateComplete: Promise<boolean>;
  };
  document.body.replaceChildren(el);
  await el.updateComplete;
  expect(el.shadowRoot).not.toBeNull();
});

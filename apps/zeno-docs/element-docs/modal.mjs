export default {
  category: 'Overlays',

  examples: [
    {
      title: 'Confirm an action',
      description:
        'Call `show()` to open the modal. `close(value)` closes it and the `close` event carries that value.',
      html: `<zeno-button variant="destructive">Delete report</zeno-button>
<p data-result>Nothing chosen yet.</p>

<zeno-modal heading="Delete report.pdf?" size="sm">
  <p>The file is removed for everyone. This cannot be undone.</p>
  <zeno-button slot="footer" variant="ghost" value="cancelled">Cancel</zeno-button>
  <zeno-button slot="footer" variant="destructive" value="deleted">Delete</zeno-button>
</zeno-modal>`,
      script: `const modal = document.querySelector('zeno-modal');
document.querySelector('zeno-button').addEventListener('click', () => {
  modal.returnValue = '';
  modal.show();
});
document.querySelectorAll('zeno-button[slot="footer"]').forEach(button => {
  button.addEventListener('click', () => modal.close(button.value));
});
modal.addEventListener('close', event => {
  document.querySelector('[data-result]').textContent =
    'Closed with: ' + (event.detail.returnValue || 'no value');
});`,
    },
    {
      title: 'Sizes',
      description:
        'The size sets the width. On a screen narrower than 640px every modal fills the screen.',
      html: `<div data-openers>
  <zeno-button variant="outline" value="sm">Small</zeno-button>
  <zeno-button variant="outline" value="md">Medium</zeno-button>
  <zeno-button variant="outline" value="lg">Large</zeno-button>
  <zeno-button variant="outline" value="xl">Extra large</zeno-button>
</div>

<zeno-modal heading="Keyboard shortcuts">
  <p>Press Escape or use the close button to close this modal.</p>
</zeno-modal>`,
      script: `const modal = document.querySelector('zeno-modal');
document.querySelectorAll('[data-openers] zeno-button').forEach(button => {
  button.addEventListener('click', () => {
    modal.size = button.value;
    modal.show();
  });
});`,
    },
    {
      title: 'A choice that must be made',
      description:
        'With `no-close-button`, `no-backdrop-close` and `no-escape-close` only the buttons in the footer close the modal.',
      html: `<zeno-button variant="outline">Review terms</zeno-button>

<zeno-modal heading="Updated terms" no-close-button no-backdrop-close no-escape-close>
  <p>The terms of service changed on 1 June. Accept them to keep using your account.</p>
  <zeno-button slot="footer" variant="ghost">Sign out</zeno-button>
  <zeno-button slot="footer">Accept</zeno-button>
</zeno-modal>`,
      script: `const modal = document.querySelector('zeno-modal');
document.querySelector('zeno-button').addEventListener('click', () => modal.show());
document.querySelectorAll('zeno-button[slot="footer"]').forEach(button => {
  button.addEventListener('click', () => modal.close());
});`,
    },
    {
      title: 'Ask before closing',
      description:
        'The close button, the backdrop and Escape fire `request-close` first. Cancel the event to keep the modal open.',
      html: `<zeno-button variant="outline">Write a note</zeno-button>
<p data-result>No close request yet.</p>

<zeno-modal heading="New note">
  <zeno-textarea label="Note"></zeno-textarea>
  <zeno-button slot="footer">Save note</zeno-button>
</zeno-modal>`,
      script: `const modal = document.querySelector('zeno-modal');
const result = document.querySelector('[data-result]');
document.querySelector('zeno-button').addEventListener('click', () => modal.show());
document.querySelector('zeno-button[slot="footer"]').addEventListener('click', () => modal.close());
modal.addEventListener('request-close', event => {
  const note = document.querySelector('zeno-textarea').value;
  if (note) {
    event.preventDefault();
    result.textContent = 'Kept open: the note is not saved. Asked by: ' + event.detail.source;
  } else {
    result.textContent = 'Closed by: ' + event.detail.source;
  }
});`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab', 'Shift+Tab'],
      action:
        'Moves focus between the controls inside the modal. Focus does not leave the modal while it is open.',
    },
    {
      keys: ['Escape'],
      action:
        'Asks the modal to close. Does nothing when `no-escape-close` is set or a `request-close` listener cancels the event.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'On the close button, asks the modal to close.',
    },
  ],

  accessibility: [
    'Renders a native `<dialog>` and opens it with `showModal()`, so the browser moves focus into the modal, keeps it there, makes the page behind inert and returns focus to the opener on close.',
    'The dialog is named by its heading: `aria-labelledby` points at an `<h2>` that holds the `heading` text or the `header` slot. Without a heading, the `aria-label` of the element is copied to the dialog.',
    'The close button is a native `<button>` named by `close-label`, which is “Close” by default. Its icon is hidden from assistive technology.',
    'Page scrolling is locked while the modal is open.',
    'With reduced motion the modal appears and leaves without a transition. In forced colours it gets a border.',
  ],

  gaps: [
    // base/dialog-element.ts:232-238: aria-labelledby only when heading or header slot is filled, else aria-label from the host, else nothing; no warning.
    'A modal with no `heading`, no `header` slot content and no `aria-label` has no accessible name, and the element does not warn about it.',
    // base/dialog-element.ts:238: this.ariaLabel is read in render; it is not a reactive property and no attribute change is observed.
    'The `aria-label` is read when the modal renders. Changing only `aria-label` later does not update the dialog until something else makes it render again.',
    // base/dialog-element.ts:250: the heading is always <h2 id="heading">.
    'The heading is always an `<h2>`. The level cannot be changed.',
    // base/dialog-element.ts:190, 204-207, 318: close() only writes returnValue when given one; show() does not clear it.
    '`returnValue` is not cleared when the modal opens again. A later close by Escape, the backdrop or the close button reports the value of the earlier `close(value)` call.',
    // zeno-modal.ts:39-45 and 70-73: width is min(--modal-width, 100vw - 2 * margin) and max-height is 100dvh - 2 * margin, so `full` cannot reach the screen edges; the radius stays.
    '`size="full"` does not fill a wide screen. The width and height are still limited by the margin around the modal, and the corners stay rounded.',
    // base/scroll-lock.ts:10-15: sets overflow hidden on the root element; no scrollbar-gutter or padding.
    'The scroll lock hides the page scrollbar and does not keep its space, so the page can shift sideways while the modal is open.',
  ],
};

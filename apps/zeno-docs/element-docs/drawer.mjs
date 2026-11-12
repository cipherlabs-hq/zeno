export default {
  category: 'Overlays',

  examples: [
    {
      title: 'Basic drawer',
      description:
        'Call `show()` to open the drawer and `close()` to close it. The close button, the backdrop and Escape also close it.',
      html: `<zeno-button variant="outline">Open filters</zeno-button>

<zeno-drawer heading="Filters">
  <p>Show orders from the last 30 days.</p>
  <zeno-button slot="footer">Done</zeno-button>
</zeno-drawer>`,
      script: `const drawer = document.querySelector('zeno-drawer');
document.querySelector('zeno-button').addEventListener('click', () => drawer.show());
document.querySelector('zeno-button[slot="footer"]').addEventListener('click', () => drawer.close());`,
    },
    {
      title: 'Placement',
      description:
        '`start` and `end` follow the reading direction. `top` and `bottom` span the full width.',
      html: `<div data-openers>
  <zeno-button variant="outline" value="start">Start</zeno-button>
  <zeno-button variant="outline" value="end">End</zeno-button>
  <zeno-button variant="outline" value="top">Top</zeno-button>
  <zeno-button variant="outline" value="bottom">Bottom</zeno-button>
</div>

<zeno-drawer heading="Notifications">
  <p>You have no new notifications.</p>
</zeno-drawer>`,
      script: `const drawer = document.querySelector('zeno-drawer');
document.querySelectorAll('[data-openers] zeno-button').forEach(button => {
  button.addEventListener('click', () => {
    drawer.placement = button.value;
    drawer.show();
  });
});`,
    },
    {
      title: 'Sizes',
      description:
        'On the start and end edges `size` sets the width. On the top and bottom edges it sets the height.',
      html: `<div data-openers>
  <zeno-button variant="outline" value="sm">Small</zeno-button>
  <zeno-button variant="outline" value="md">Medium</zeno-button>
  <zeno-button variant="outline" value="lg">Large</zeno-button>
  <zeno-button variant="outline" value="full">Full</zeno-button>
</div>

<zeno-drawer heading="Order details" placement="end">
  <p>Order 1042 was sent on 3 March.</p>
</zeno-drawer>`,
      script: `const drawer = document.querySelector('zeno-drawer');
document.querySelectorAll('[data-openers] zeno-button').forEach(button => {
  button.addEventListener('click', () => {
    drawer.size = button.value;
    drawer.show();
  });
});`,
    },
    {
      title: 'A form that is not closed by accident',
      description:
        'With `no-backdrop-close` a press outside the drawer does nothing. The `close` event carries the value given to `close()`.',
      html: `<zeno-button>Edit profile</zeno-button>
<p data-result>Nothing saved yet.</p>

<zeno-drawer heading="Edit profile" placement="end" no-backdrop-close>
  <zeno-input label="Display name" value="Ada Lovelace"></zeno-input>
  <zeno-button slot="footer" variant="ghost" value="cancelled">Cancel</zeno-button>
  <zeno-button slot="footer" value="saved">Save changes</zeno-button>
</zeno-drawer>`,
      script: `const drawer = document.querySelector('zeno-drawer');
document.querySelector('zeno-button').addEventListener('click', () => {
  drawer.returnValue = '';
  drawer.show();
});
document.querySelectorAll('zeno-button[slot="footer"]').forEach(button => {
  button.addEventListener('click', () => drawer.close(button.value));
});
drawer.addEventListener('close', event => {
  document.querySelector('[data-result]').textContent =
    'Closed with: ' + (event.detail.returnValue || 'no value');
});`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab', 'Shift+Tab'],
      action:
        'Moves focus between the controls inside the drawer. Focus does not leave the drawer while it is open.',
    },
    {
      keys: ['Escape'],
      action:
        'Asks the drawer to close. Does nothing when `no-escape-close` is set or a `request-close` listener cancels the event.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'On the close button, asks the drawer to close.',
    },
  ],

  accessibility: [
    'Renders a native `<dialog>` and opens it with `showModal()`, so the browser moves focus into the drawer, keeps it there, makes the page behind inert and returns focus to the opener on close.',
    'The dialog is named by its heading: `aria-labelledby` points at an `<h2>` that holds the `heading` text or the `header` slot. Without a heading, the `aria-label` of the element is copied to the dialog.',
    'The close button is a native `<button>` named by `close-label`, which is “Close” by default. Its icon is hidden from assistive technology.',
    'Page scrolling is locked while the drawer is open.',
    'With reduced motion the drawer appears and leaves without a transition. In forced colours it gets a border.',
  ],

  gaps: [
    // base/dialog-element.ts:232-238: aria-labelledby only when heading or header slot is filled, else aria-label from the host, else nothing; no warning.
    'A drawer with no `heading`, no `header` slot content and no `aria-label` has no accessible name, and the element does not warn about it.',
    // base/dialog-element.ts:238: this.ariaLabel is read in render; it is not a reactive property and no attribute change is observed.
    'The `aria-label` is read when the drawer renders. Changing only `aria-label` later does not update the dialog until something else makes it render again.',
    // base/dialog-element.ts:250: the heading is always <h2 id="heading">.
    'The heading is always an `<h2>`. The level cannot be changed.',
    // base/dialog-element.ts:190, 204-207, 318: close() only writes returnValue when given one; show() does not clear it.
    '`returnValue` is not cleared when the drawer opens again. A later close by Escape, the backdrop or the close button reports the value of the earlier `close(value)` call.',
    // base/scroll-lock.ts:10-15: sets overflow hidden on the root element; no scrollbar-gutter or padding.
    'The scroll lock hides the page scrollbar and does not keep its space, so the page can shift sideways while the drawer is open.',
  ],
};

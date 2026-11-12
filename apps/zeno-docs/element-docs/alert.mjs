export default {
  category: 'Feedback',

  examples: [
    {
      title: 'Variants',
      html: `<zeno-alert variant="info" title="New version" message="Version 2.4 is ready to install."></zeno-alert>
<zeno-alert variant="success" title="Saved" message="Your changes are saved."></zeno-alert>
<zeno-alert variant="warning" title="Storage almost full" message="You have used 90% of your space."></zeno-alert>
<zeno-alert variant="error" title="Upload failed" message="report.pdf is larger than 10 MB."></zeno-alert>`,
    },
    {
      title: 'Appearances',
      description: 'The default look, then `filled` and `outlined`.',
      html: `<zeno-alert variant="success" message="Your changes are saved."></zeno-alert>
<zeno-alert variant="success" appearance="filled" message="Your changes are saved."></zeno-alert>
<zeno-alert variant="success" appearance="outlined" message="Your changes are saved."></zeno-alert>`,
    },
    {
      title: 'Slotted text and actions',
      description:
        'Without `message`, the text comes from the default slot. Buttons go in the `actions` slot.',
      html: `<zeno-alert variant="error" title="Upload failed">
  The connection was lost while sending report.pdf.
  <zeno-button slot="actions" size="sm" variant="outline">Try again</zeno-button>
</zeno-alert>`,
    },
    {
      title: 'Closable',
      description:
        'The close button hides the alert and fires `close`, then `hide`. The element stays in the page; call `show()` to bring it back.',
      html: `<zeno-alert closable title="Invitation sent" message="We sent an email to ada@example.com."></zeno-alert>
<p data-result>The alert is open.</p>
<zeno-button variant="outline" size="sm">Show again</zeno-button>`,
      script: `const alert = document.querySelector('zeno-alert');
const result = document.querySelector('[data-result]');
alert.addEventListener('hide', () => {
  result.textContent = 'The alert is hidden.';
});
alert.addEventListener('show', () => {
  result.textContent = 'The alert is open.';
});
document.querySelector('zeno-button').addEventListener('click', () => alert.show());`,
    },
    {
      title: 'Compact, with a chosen icon',
      description:
        '`compact` uses less padding and a smaller icon. `icon` takes the name of a registered icon.',
      html: `<zeno-alert compact variant="success" icon="check" message="Copied to the clipboard."></zeno-alert>
<zeno-alert compact variant="info" icon="star" message="Added to your favourites."></zeno-alert>`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves focus to the close button, when the alert is `closable`.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'On the close button, hides the alert.',
    },
  ],

  accessibility: [
    'The alert has `role="alert"` with `aria-live="polite"` and `aria-atomic="true"`.',
    'The `title` text is rendered as an `<h3>`.',
    'The close button is a native `<button>` with the label “Close alert”.',
    'The icon is decoration and hidden from assistive technology, so the variant is not announced. Say what happened in the text.',
    'The `animate-in` and `animate-out` animations are turned off when the user asks for reduced motion.',
  ],

  gaps: [
    // zeno-alert.ts:339-351 against icon/zeno-icon.ts:233-250: info, check-circle, alert-triangle and x-circle are not registered.
    'The default icon of every variant is missing. The alert asks for `info`, `check-circle`, `alert-triangle` and `x-circle`, and `zeno-icon` does not register these names. The icon space stays empty until you register them or set `icon` to a registered name.',
    // zeno-alert.ts:374-375: role="alert" and aria-live="polite" on the same node.
    '`role="alert"` stands for an assertive live region, and `aria-live="polite"` on the same element says the opposite. There is no attribute to choose one or the other.',
    // zeno-alert.ts:374: the role is always set.
    'Every alert is a live region, also one that is on the page from the start and only gives static information.',
    // zeno-alert.ts:292: the property is named `title`, which is also the global HTML attribute.
    'The heading text uses the `title` attribute, which is also the native tooltip. Hovering the alert shows the same text again as a tooltip.',
    // zeno-alert.ts:388: fixed <h3>.
    'The title is always an `<h3>`. The level cannot be changed to fit the page outline.',
    // zeno-alert.ts:409: literal 'Close alert'.
    'The close button label “Close alert” is English and cannot be changed.',
    // zeno-alert.ts:322-325: setTimeout of 300 ms, not an animationend listener.
    '`hide()` always waits 300 ms before it removes the content, also without `animate-out` and with reduced motion.',
    // zeno-alert.ts:331-334, 357: the close button is removed with the rest and nothing calls focus().
    'When the close button is used, it disappears with the alert and focus is not moved anywhere.',
    // zeno-alert.ts:160-165, 399: the slot itself carries the margin and is always rendered.
    'The `actions` slot always adds its top margin, so an alert without actions has extra space under the text.',
  ],
};

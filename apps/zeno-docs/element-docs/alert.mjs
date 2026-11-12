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
    'With `live="auto"`, the default, an `error` or `warning` alert is assertive (`role="alert"`) and an `info` or `success` alert is polite (`role="status"`). `live="off"` makes an alert that is on the page from the start a plain box.',
    'The `heading` text is a heading at `heading-level`, 3 by default. Prefer `heading` to `title`, which browsers also show as a tooltip.',
    'The close button is a native `<button>` named by `close-label`, “Close alert” by default.',
    'The icon is decoration and hidden from assistive technology, so the variant is not announced. Say what happened in the text.',
    'The `animate-in` and `animate-out` animations are turned off when the user asks for reduced motion.',
  ],

  gaps: [
    // zeno-alert.ts:322-325: setTimeout of 300 ms, not an animationend listener.
    '`hide()` always waits 300 ms before it removes the content, also without `animate-out` and with reduced motion.',
    // zeno-alert.ts:331-334, 357: the close button is removed with the rest and nothing calls focus().
    'When the close button is used, it disappears with the alert and focus is not moved anywhere.',
  ],
};

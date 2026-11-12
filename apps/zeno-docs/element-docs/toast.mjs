export default {
  category: 'Feedback',

  examples: [
    {
      title: 'Variants',
      description:
        'A toast renders nothing until `show()` is called. It then closes by itself after `duration` milliseconds, 5000 by default. The toast is fixed to the browser window, so it appears at the edge of the window and not inside this example.',
      html: `<zeno-button variant="outline">Default</zeno-button>
<zeno-button variant="outline">Info</zeno-button>
<zeno-button variant="outline">Success</zeno-button>
<zeno-button variant="outline">Warning</zeno-button>
<zeno-button variant="outline">Error</zeno-button>
<zeno-toast title="Report" message="The weekly report is ready."></zeno-toast>`,
      script: `const toast = document.querySelector('zeno-toast');
const variants = ['default', 'info', 'success', 'warning', 'error'];
document.querySelectorAll('zeno-button').forEach((button, index) => {
  button.addEventListener('click', () => {
    toast.variant = variants[index];
    toast.show();
  });
});`,
    },
    {
      title: 'Light style and icon',
      description:
        '`light` uses a light background with a coloured border. `icon` names an icon from the icon registry.',
      html: `<zeno-button>Save</zeno-button>
<zeno-toast light variant="success" icon="check" title="Saved" message="Your changes are saved."></zeno-toast>`,
      script: `document.querySelector('zeno-button').addEventListener('click', () => {
  document.querySelector('zeno-toast').show();
});`,
    },
    {
      title: 'Positions',
      description: '`position` chooses the edge or corner of the window.',
      html: `<zeno-button variant="outline">Top start</zeno-button>
<zeno-button variant="outline">Top</zeno-button>
<zeno-button variant="outline">Top end</zeno-button>
<zeno-button variant="outline">Bottom start</zeno-button>
<zeno-button variant="outline">Bottom</zeno-button>
<zeno-button variant="outline">Bottom end</zeno-button>
<zeno-toast duration="2000" message="The link is copied."></zeno-toast>`,
      script: `const toast = document.querySelector('zeno-toast');
const positions = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'];
document.querySelectorAll('zeno-button').forEach((button, index) => {
  button.addEventListener('click', () => {
    toast.position = positions[index];
    toast.show();
  });
});`,
    },
    {
      title: 'Stays open, with an action',
      description:
        'With `duration="0"` the toast stays until it is closed. The text can come from the default slot, and the `action` slot holds a button. The close button sends a `close` event.',
      html: `<zeno-button>Delete the file</zeno-button>
<p data-result>The file is in the list.</p>
<zeno-toast duration="0" position="bottom-end">
  The file was deleted.
  <zeno-button slot="action" size="sm">Undo</zeno-button>
</zeno-toast>`,
      script: `const toast = document.querySelector('zeno-toast');
const result = document.querySelector('[data-result]');
const buttons = document.querySelectorAll('zeno-button');
buttons[0].addEventListener('click', () => {
  result.textContent = 'The file is deleted.';
  toast.show();
});
buttons[1].addEventListener('click', () => {
  result.textContent = 'The file is back in the list.';
  toast.hide();
});
toast.addEventListener('close', () => {
  result.textContent = 'The file is deleted and the toast is closed.';
});`,
    },
    {
      title: 'Progress bar',
      description:
        '`show-progress` draws a bar that shows the time that is left. The timer stops while the mouse pointer is over the toast.',
      html: `<zeno-button>Start the export</zeno-button>
<zeno-toast show-progress duration="8000" variant="info" title="Export started" message="We will send you an email when it is done."></zeno-toast>`,
      script: `document.querySelector('zeno-button').addEventListener('click', () => {
  document.querySelector('zeno-toast').show();
});`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to the action and to the close button of an open toast. The toast keeps its place in the tab order of the page.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'On the close button, closes the toast and sends `close`.',
    },
  ],

  accessibility: [
    'An open toast is a `<div>` with `role="alert"`, `aria-live="polite"` and `aria-atomic="true"`. A closed toast renders nothing.',
    'The close button is a native `<button>` with the `aria-label` “Close toast”.',
    'The timer stops while the mouse pointer is over the toast. `duration="0"` turns the timer off.',
    'Opening a toast does not move focus.',
    'With `prefers-reduced-motion: reduce` the slide animation and the progress transition are turned off.',
  ],

  gaps: [
    // zeno-toast.ts:480-481: role="alert" and aria-live="polite" on the
    // same element.
    'The toast has `role="alert"`, which is assertive, and `aria-live="polite"` on the same element. The two do not agree, and no attribute chooses one.',
    // zeno-toast.ts:444-456: check-circle, alert-triangle, x-circle, info.
    // zeno-icon.ts:233-254: none of these names is in the registry. Checked
    // in Chromium with the built bundle: the icon space is empty.
    'The `info`, `success`, `warning` and `error` variants show no icon. Their default icon names are not in the icon registry, so the space for the icon stays empty.',
    // zeno-toast.ts:468: the variant only adds a class. 490: the icon has no
    // label, and zeno-icon.ts:202-204 hides an icon without one.
    'The variant is not given to assistive technology. It is shown by colour, and by an icon that has no text.',
    // zeno-toast.ts:483-484: mouseenter and mouseleave only; no focusin,
    // focusout or keydown listener in the file.
    'The timer does not stop while keyboard focus is inside the toast, and no key closes the toast. A keyboard user may not reach the action before the toast closes.',
    // zeno-toast.ts:427-430: mouseleave calls startAutoClose(), which sets a
    // new timeout for the whole duration (385-387).
    'After the pointer leaves, the timer starts again from the full `duration`. The progress bar also goes back to full.',
    // zeno-toast.ts:352-362: show() does not call stopAutoClose() before
    // startAutoClose(), so the first timeout stays.
    'A second `show()` on an open toast does not restart the timer. The first timer still runs and closes the toast early.',
    // zeno-toast.ts:338: closable = true with type Boolean.
    '`closable` is on by default and is a Boolean attribute, so HTML cannot turn it off. Set the `closable` property to `false` from script.',
    // zeno-toast.ts:520: aria-label="Close toast".
    'The close button label is the fixed English text “Close toast”. No attribute changes it.',
    // zeno-toast.ts:40-76: every toast is position: fixed at the same offset
    // for its position. Checked in Chromium: two open toasts have the same
    // box.
    'Toasts do not stack. Two open toasts with the same `position` lie on top of each other.',
    // zeno-toast.ts:391-398 updates the width every 50 ms. 535 gives each
    // change a transition as long as the whole duration (222-227). Checked
    // in Chromium: after 1 s of 4 s the bar is still about 97% wide.
    'The progress bar runs late. Each small change of the width gets a transition as long as the whole `duration`, so the bar is still nearly full when the toast closes.',
    // zeno-toast.ts:335: override title. The attribute stays on the host.
    'The `title` attribute is also the native HTML `title`. The browser shows the same text again as a native tooltip when the pointer rests on the toast.',
  ],
};

export default {
  category: 'Feedback',

  examples: [
    {
      title: 'States',
      description:
        'Show it in place of a button while work runs, then set `status` to `finished` or `error`.',
      html: `<zeno-inline-loading description="Sending…"></zeno-inline-loading>
<zeno-inline-loading status="finished" description="Sent"></zeno-inline-loading>
<zeno-inline-loading status="error" description="Not sent"></zeno-inline-loading>`,
    },
  ],

  keyboard: [],

  accessibility: [
    'The element is a polite live region (`role="status"`). A change of `description` is announced.',
    'The spinner and the icons are decoration. The description carries the meaning.',
    'With reduced motion the spinner stands still.',
  ],

  gaps: [
    // zeno-inline-loading.ts: there is no timer in the element.
    'The element does not go back to its first state by itself after `finished`. The page sets `status` again.',
  ],
};

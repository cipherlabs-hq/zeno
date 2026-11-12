export default {
  category: 'Feedback',

  examples: [
    {
      title: 'Variants',
      html: `<zeno-spinner variant="circle"></zeno-spinner>
<zeno-spinner variant="ring"></zeno-spinner>
<zeno-spinner variant="dots"></zeno-spinner>
<zeno-spinner variant="bars"></zeno-spinner>
<zeno-spinner variant="pulse"></zeno-spinner>`,
    },
    {
      title: 'Sizes',
      html: `<zeno-spinner size="xs"></zeno-spinner>
<zeno-spinner size="sm"></zeno-spinner>
<zeno-spinner size="md"></zeno-spinner>
<zeno-spinner size="lg"></zeno-spinner>
<zeno-spinner size="xl"></zeno-spinner>`,
    },
    {
      title: 'Label',
      description:
        'The `label` text is not visible. It is the text that assistive technology reads. The default is “Loading”.',
      html: `<zeno-spinner label="Saving changes"></zeno-spinner>`,
    },
  ],

  keyboard: [],

  accessibility: [
    'Renders a `<div>` with `role="status"`, `aria-live="polite"` and `aria-busy="true"`.',
    'The `label` text is rendered inside the status region and is hidden visually. Set it to say what is loading.',
    'The element cannot take focus and has no keyboard behaviour.',
    'With `prefers-reduced-motion: reduce` the animation stops. The `circle` variant then shows a dot in its centre.',
    'With `prefers-contrast: more` the spinner uses system colours.',
  ],

  gaps: [
    // zeno-spinner.ts:260-262: role="status", aria-live="polite" and a fixed
    // aria-busy="true" on the same element that holds the label.
    '`aria-busy="true"` is always set on the status region itself. `aria-busy` tells assistive technology to wait before it reads a region, so the label may not be announced.',
    // zeno-spinner.ts:206-224: reduced motion removes the animation; only
    // .spinner--circle gets a replacement mark.
    'With reduced motion, the `dots`, `bars`, `ring` and `pulse` variants only stop. They get no static mark like the `circle` variant does.',
  ],
};

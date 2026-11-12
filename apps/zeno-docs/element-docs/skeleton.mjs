export default {
  category: 'Feedback',

  examples: [
    {
      title: 'Variants',
      description:
        'Each variant has a default width and height that matches the content it stands for.',
      html: `<zeno-skeleton variant="title"></zeno-skeleton>
<zeno-skeleton variant="text"></zeno-skeleton>
<zeno-skeleton variant="avatar"></zeno-skeleton>
<zeno-skeleton variant="button"></zeno-skeleton>
<zeno-skeleton variant="input"></zeno-skeleton>
<zeno-skeleton variant="image"></zeno-skeleton>
<zeno-skeleton variant="card"></zeno-skeleton>`,
    },
    {
      title: 'Paragraph with several lines',
      description:
        'With `variant="paragraph"` and `lines` above 1, the element renders one bar for each line. The last bar is shorter.',
      html: `<zeno-skeleton variant="paragraph" lines="4"></zeno-skeleton>`,
    },
    {
      title: 'Custom size and shape',
      description:
        '`width` and `height` take any CSS length. `shape="circle"` makes the placeholder round.',
      html: `<zeno-skeleton width="12rem" height="1.5rem"></zeno-skeleton>
<zeno-skeleton shape="circle" width="4rem" height="4rem"></zeno-skeleton>`,
    },
    {
      title: 'Animation',
      description:
        'The default animation is `wave`. The second placeholder uses `pulse`. The third has no animation: the script sets the `animated` property to `false`.',
      html: `<zeno-skeleton variant="text"></zeno-skeleton>
<zeno-skeleton variant="text" animation="pulse"></zeno-skeleton>
<zeno-skeleton variant="text"></zeno-skeleton>`,
      script: `document.querySelectorAll('zeno-skeleton')[2].animated = false;`,
    },
    {
      title: 'Placeholder for a list row',
      html: `<div style="display: flex; gap: 1rem; align-items: center">
  <zeno-skeleton variant="avatar"></zeno-skeleton>
  <div style="flex: 1; display: grid; gap: 0.5rem">
    <zeno-skeleton variant="title"></zeno-skeleton>
    <zeno-skeleton variant="text"></zeno-skeleton>
  </div>
</div>`,
    },
  ],

  keyboard: [],

  accessibility: [
    'The placeholder is a `<div>` with `role="presentation"` and `aria-hidden="true"`. Assistive technology does not see it, so the element does not announce that content is loading.',
    'The element cannot take focus and has no keyboard behaviour.',
    'With `prefers-reduced-motion: reduce` the wave and pulse animations are turned off.',
    'With `prefers-contrast: more` the placeholder gets a border in system colours.',
  ],

  gaps: [
    // zeno-skeleton.ts:220: @property({ type: Boolean, reflect: true }) animated = true.
    // A Boolean attribute that starts as true cannot be removed in HTML.
    'The animation cannot be turned off from HTML. `animated` is a Boolean that starts as `true`, so only the property works: `element.animated = false`.',
    // zeno-skeleton.ts:233: the wrapper has only the class
    // skeleton--paragraph-multiple. 152: the line animation needs
    // .skeleton--animated on an ancestor. 229-240: width, height and animation
    // are not read and there is no part="base".
    'A paragraph with several lines is never animated. This layout also ignores `width`, `height` and `animation`, and has no `base` part.',
    // zeno-skeleton.ts:275-277: aria-hidden="true" and aria-label="Loading" on
    // the same div.
    'The placeholder has `aria-label="Loading"` on an element that is also `aria-hidden="true"`, so the label is never read. The text is fixed English.',
    // zeno-skeleton.ts:230 has `this.lines || 3`, but 247 only takes that
    // branch when lines > 1.
    'A `paragraph` without `lines`, or with `lines="1"`, renders one bar. The code has a default of three lines that is never reached.',
  ],
};

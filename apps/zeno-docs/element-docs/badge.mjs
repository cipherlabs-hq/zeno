export default {
  category: 'Data display',

  examples: [
    {
      title: 'Variants',
      html: `<zeno-badge variant="primary">Primary</zeno-badge>
<zeno-badge variant="secondary">Secondary</zeno-badge>
<zeno-badge variant="success">Success</zeno-badge>
<zeno-badge variant="warning">Warning</zeno-badge>
<zeno-badge variant="danger">Danger</zeno-badge>
<zeno-badge variant="info">Info</zeno-badge>
<zeno-badge variant="neutral">Neutral</zeno-badge>`,
    },
    {
      title: 'Outline and subtle',
      html: `<zeno-badge outline variant="success">Active</zeno-badge>
<zeno-badge outline variant="warning">Pending</zeno-badge>
<zeno-badge outline variant="danger">Failed</zeno-badge>
<zeno-badge subtle variant="success">Active</zeno-badge>
<zeno-badge subtle variant="warning">Pending</zeno-badge>
<zeno-badge subtle variant="danger">Failed</zeno-badge>`,
    },
    {
      title: 'Sizes and shapes',
      html: `<zeno-badge size="xs">Extra small</zeno-badge>
<zeno-badge size="sm">Small</zeno-badge>
<zeno-badge size="md">Medium</zeno-badge>
<zeno-badge size="lg">Large</zeno-badge>
<zeno-badge shape="pill">Pill</zeno-badge>
<zeno-badge shape="rounded">Rounded</zeno-badge>
<zeno-badge shape="square">Square</zeno-badge>`,
    },
    {
      title: 'Counts',
      description:
        'A number in `value` is cut at `max`, which is 99 unless you change it.',
      html: `<zeno-badge variant="danger" value="5"></zeno-badge>
<zeno-badge variant="danger" value="120"></zeno-badge>
<zeno-badge variant="danger" value="120" max="999"></zeno-badge>`,
    },
    {
      title: 'Dot',
      description:
        'A dot has no text. `pulse` adds a repeating animation to draw attention.',
      html: `<zeno-badge dot variant="success"></zeno-badge>
<zeno-badge dot variant="warning"></zeno-badge>
<zeno-badge dot variant="danger" pulse></zeno-badge>`,
    },
  ],

  keyboard: [],

  accessibility: [
    'A badge with text or a count is a plain `<span>`. It has no role, and its text is read where it stands in the page.',
    'A `dot` badge has `role="status"`. Its name is the `aria-label` you set, or the variant name followed by “status indicator”.',
    'The variant colour is not announced. Put the meaning in the text, or in `aria-label` for a dot.',
  ],

  gaps: [
    // zeno-badge.ts:7-11 against 328: the slot is the badge's own text; no positioning styles exist.
    'The source comment says the badge can sit on the corner of a slotted element. It cannot. The slot is the badge’s own content, and there are no styles that place a badge on another element.',
    // zeno-badge.ts:272 against 32-54: host rules exist for xs, sm and lg only.
    'The `size` type allows `xl`, but there are no styles for it. An `xl` badge looks like `md`.',
    // zeno-badge.ts:321-325: role="status" whenever `dot` is set, with a label built from the variant.
    'Every dot is a `status` live region, also when it only decorates. The fallback name, for example “danger status indicator”, is English and is built from the variant name.',
    // zeno-badge.ts:85-98: .badge--primary and .badge--accent set the same two colours.
    '`primary` and `accent` look the same.',
    // zeno-badge.ts:317-330: a count renders as the bare number, with no label.
    'A count is announced as a bare number, such as “5”. The element has no way to add hidden text that says what is counted.',
  ],
};

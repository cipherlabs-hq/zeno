export default {
  category: 'Data display',

  examples: [
    {
      title: 'Variants',
      description:
        'The `default` tag has no background colour today. See the known gaps.',
      html: `<zeno-tag variant="default">Default</zeno-tag>
<zeno-tag variant="primary">Primary</zeno-tag>
<zeno-tag variant="secondary">Secondary</zeno-tag>
<zeno-tag variant="accent">Accent</zeno-tag>
<zeno-tag variant="success">Paid</zeno-tag>
<zeno-tag variant="warning">Due soon</zeno-tag>
<zeno-tag variant="danger">Overdue</zeno-tag>
<zeno-tag variant="info">Draft</zeno-tag>`,
    },
    {
      title: 'Solid, bordered and dot',
      description:
        '`solid` uses the full colour as the background. `bordered` adds a border. `dot` adds a small dot before the text.',
      html: `<zeno-tag variant="success" solid>Paid</zeno-tag>
<zeno-tag variant="danger" solid>Overdue</zeno-tag>
<zeno-tag variant="info" bordered>Draft</zeno-tag>
<zeno-tag variant="warning" bordered>Due soon</zeno-tag>
<zeno-tag variant="success" dot>Online</zeno-tag>`,
    },
    {
      title: 'Sizes and shapes',
      html: `<zeno-tag variant="info" size="xs">Extra small</zeno-tag>
<zeno-tag variant="info" size="sm">Small</zeno-tag>
<zeno-tag variant="info" size="md">Medium</zeno-tag>
<zeno-tag variant="info" size="lg">Large</zeno-tag>
<zeno-tag variant="info" shape="rounded">Rounded</zeno-tag>
<zeno-tag variant="info" shape="square">Square</zeno-tag>`,
    },
    {
      title: 'Closable',
      description:
        'A closable tag shows a remove button. The button sends a `close` event. The tag does not remove itself, so this example removes it in the listener.',
      html: `<zeno-tag closable variant="info">report.pdf</zeno-tag>
<zeno-tag closable variant="info">notes.txt</zeno-tag>
<zeno-tag closable variant="info">budget.csv</zeno-tag>`,
      script: `document.querySelectorAll('zeno-tag').forEach(tag => {
  tag.addEventListener('close', () => tag.remove());
});`,
    },
    {
      title: 'As a link',
      description: 'With `href` the tag is rendered as a link.',
      html: `<zeno-tag href="#billing" variant="primary">Billing</zeno-tag>
<zeno-tag href="#security" variant="primary">Security</zeno-tag>`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to the link when the tag has `href`, and to the remove button when it is `closable`. A plain tag takes no focus.',
    },
    { keys: ['Enter'], action: 'Follows the link when the tag has `href`.' },
    {
      keys: ['Enter', 'Space'],
      action: 'On the remove button, sends the `close` event.',
    },
  ],

  accessibility: [
    'With `href` the tag is a native `<a>`. Without it the tag is a plain `<span>`, read as text.',
    'The remove button is a native `<button>`. Its name is the `close-label` attribute, “Remove tag” by default.',
    'An `aria-label` on the element is copied to the inner link.',
    'The dot is decoration: a `<span>` with no text.',
    'With `prefers-reduced-motion: reduce` the link transitions are turned off.',
  ],

  gaps: [
    // zeno-tag.ts:369-379: the content, with the <button> from 348, is put
    // inside the <a>.
    'A `closable` tag with `href` puts the remove button inside the link. A button inside a link is not valid HTML.',
    // zeno-tag.ts:302: size is ComponentSize ('xs' | 'sm' | 'md' | 'lg' |
    // 'xl', types/base.ts). 37-53: host styles for xs, sm and lg only.
    'The `size` type lists `xl`, but the element has no styles for it. An `xl` tag looks like `md`.',
    // zeno-tag.ts:98-101 and 108-111: the same two tokens.
    'The `primary` and `accent` variants use the same colours and look the same.',
  ],
};

export default {
  category: 'Layout',

  examples: [
    {
      title: 'Columns',
      description: '`cols` is the number of equal columns.',
      html: `<zeno-grid cols="3">
  <zeno-paper outlined>Inbox</zeno-paper>
  <zeno-paper outlined>Drafts</zeno-paper>
  <zeno-paper outlined>Sent</zeno-paper>
  <zeno-paper outlined>Archive</zeno-paper>
  <zeno-paper outlined>Spam</zeno-paper>
  <zeno-paper outlined>Bin</zeno-paper>
</zeno-grid>`,
    },
    {
      title: 'Gap',
      description:
        'A number picks a step of the spacing scale. `gap="2"` uses `--zeno-spacing-2`.',
      html: `<zeno-grid cols="4" gap="2">
  <zeno-paper outlined>Mon</zeno-paper>
  <zeno-paper outlined>Tue</zeno-paper>
  <zeno-paper outlined>Wed</zeno-paper>
  <zeno-paper outlined>Thu</zeno-paper>
</zeno-grid>
<p>The same grid with a larger gap:</p>
<zeno-grid cols="4" gap="8">
  <zeno-paper outlined>Mon</zeno-paper>
  <zeno-paper outlined>Tue</zeno-paper>
  <zeno-paper outlined>Wed</zeno-paper>
  <zeno-paper outlined>Thu</zeno-paper>
</zeno-grid>`,
    },
    {
      title: 'Alignment',
      description:
        'By default the items stretch to the height of the row. `align` places them at the start, centre or end.',
      html: `<zeno-grid cols="3" align="center">
  <zeno-paper outlined>Short</zeno-paper>
  <zeno-paper outlined>A longer item<br />with a second line<br />and a third line</zeno-paper>
  <zeno-paper outlined>Short</zeno-paper>
</zeno-grid>`,
    },
  ],

  keyboard: [],

  accessibility: [
    'The grid is not interactive and adds no keyboard behaviour.',
    'The inner element has `role="group"`. It is named by the `aria-label` of the element, or “Grid layout” when there is none.',
    'The items keep their order in the page. The grid only changes where they are drawn.',
  ],

  gaps: [
    // zeno-grid.ts:30-77 sets grid-template-columns and gap on .grid in media queries; 161-162 sets both as inline styles on the same element, and inline styles win.
    'Responsive values do not work. With `cols` or `gap` set to an object such as `{ xs: 1, md: 3 }`, only the `xs` value (or the first value) is used at every screen width. The inline style on the grid overrides the media queries.',
    // zeno-grid.ts:91, 165: the value is written to grid-auto-flow as is; CSS needs "row dense" and "column dense".
    '`flow="row-dense"` and `flow="column-dense"` have no effect. They are written to `grid-auto-flow` unchanged, and that is not valid CSS.',
    // zeno-grid.ts:167-169 sets inline-grid on the inner div; 18-27 keeps the host display: block and both at width: 100%.
    '`inline` does not make the grid sit in a line of text. The element itself stays a full-width block.',
    // zeno-grid.ts:82, 107-113: type Object parses the attribute as JSON, so "1rem" is not a valid attribute value.
    'A CSS length for `gap`, such as `1rem`, only works as a property. The attribute is read as JSON, so only a number or a JSON object works there.',
    // zeno-grid.ts:99-102, 164: columns are repeat(n, minmax(0, 1fr)), which leaves no free space for justify-content.
    '`justify` has no visible effect. The columns always fill the full width, so there is no free space to share out.',
    // zeno-grid.ts:208-209: role="group" and the fixed name 'Grid layout'.
    'Every grid is announced as a group named “Grid layout”, in English, unless it has an `aria-label`. The role cannot be removed.',
  ],
};

export default {
  category: 'Layout',

  examples: [
    {
      title: 'Basic',
      description: 'A thin line between two blocks of content.',
      html: `<p>Your plan includes 10 GB of storage.</p>
<zeno-divider></zeno-divider>
<p>You have used 4.2 GB.</p>`,
    },
    {
      title: 'With text',
      description:
        'Content in the default slot sits in the line. `align` moves it to the start or the end.',
      html: `<zeno-divider>Or</zeno-divider>
<zeno-divider align="start">Details</zeno-divider>
<zeno-divider align="end">More</zeno-divider>`,
    },
    {
      title: 'Thickness and colour',
      html: `<zeno-divider thickness="thin"></zeno-divider>
<zeno-divider thickness="medium"></zeno-divider>
<zeno-divider thickness="thick"></zeno-divider>
<zeno-divider thickness="medium" color="primary"></zeno-divider>
<zeno-divider thickness="medium" color="secondary"></zeno-divider>
<zeno-divider color="primary">Step 2</zeno-divider>`,
    },
    {
      title: 'Spacing',
      description:
        '`spacing` sets the margin above and below the line: `none`, `sm`, `md` (the default), `lg` or `xl`.',
      html: `<p>No margin under this line of text.</p>
<zeno-divider spacing="none"></zeno-divider>
<p>A small margin.</p>
<zeno-divider spacing="sm"></zeno-divider>
<p>A large margin.</p>
<zeno-divider spacing="lg"></zeno-divider>
<p>The last line of text.</p>`,
    },
    {
      title: 'Vertical',
      description:
        'A vertical divider is an inline block. Here it sits in a flex row that centres its items.',
      html: `<div style="display: flex; align-items: center; height: 24px">
  <span>Edit</span>
  <zeno-divider orientation="vertical"></zeno-divider>
  <span>Copy</span>
  <zeno-divider orientation="vertical"></zeno-divider>
  <span>Delete</span>
</div>`,
    },
  ],

  keyboard: [],

  accessibility: [
    'Renders a `<div>` with `role="separator"` and an `aria-orientation` that follows `orientation`.',
    'The divider does not take focus and handles no keys.',
    'With `prefers-contrast: more`, the line uses the system colour `ButtonText`.',
  ],

  gaps: [
    // zeno-divider.ts:159-167: without content the pseudo-elements are hidden and the line is a solid background.
    // zeno-divider.ts:50-56, 78-120: with content, the solid `background` colour stays under the gradient of the same colour.
    '`variant="dashed"` and `variant="dotted"` do not work. The line is always solid, with or without text.',
    // zeno-divider.ts:295-300: the slot is inside the element with role="separator".
    'Text in the divider sits inside `role="separator"`. The children of a separator are presentational, so the text may not be read by a screen reader. Do not put information there that is nowhere else.',
    // zeno-divider.ts:196-209: `primary` and `accent` set the same two variables.
    '`color="primary"` and `color="accent"` look the same.',
    // zeno-divider.ts:31-37, 169-172: the vertical host and its line use `height: 100%`; 148-151: the 24px come from the padding of the content span.
    'A vertical divider follows the height of its parent only when the parent has a set height. In other parents it is 24px high, whatever the height of the content next to it.',
    // zeno-divider.ts:41-48, 279-283: the line keeps `width: 100%` and gets a margin on both sides.
    '`indent` does not make a horizontal divider shorter. The line keeps its full width and moves by the indent, so it sticks out of its parent on the far side.',
  ],
};

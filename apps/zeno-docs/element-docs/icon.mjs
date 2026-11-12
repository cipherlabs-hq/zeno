export default {
  category: 'Data display',

  examples: [
    {
      title: 'Built-in names',
      description:
        'These 15 names are built in. An icon without a `label` is decoration and is hidden from assistive technology.',
      html: `<zeno-icon name="home"></zeno-icon>
<zeno-icon name="search"></zeno-icon>
<zeno-icon name="user"></zeno-icon>
<zeno-icon name="settings"></zeno-icon>
<zeno-icon name="heart"></zeno-icon>
<zeno-icon name="star"></zeno-icon>
<zeno-icon name="menu"></zeno-icon>
<zeno-icon name="check"></zeno-icon>
<zeno-icon name="x"></zeno-icon>
<zeno-icon name="plus"></zeno-icon>
<zeno-icon name="minus"></zeno-icon>
<zeno-icon name="chevron-up"></zeno-icon>
<zeno-icon name="chevron-down"></zeno-icon>
<zeno-icon name="chevron-left"></zeno-icon>
<zeno-icon name="chevron-right"></zeno-icon>`,
    },
    {
      title: 'Sizes',
      description:
        'Sizes are in `em`, so an icon grows with the text around it. The icon takes the text colour.',
      html: `<zeno-icon name="star" size="xs"></zeno-icon>
<zeno-icon name="star" size="sm"></zeno-icon>
<zeno-icon name="star" size="md"></zeno-icon>
<zeno-icon name="star" size="lg"></zeno-icon>
<zeno-icon name="star" size="xl"></zeno-icon>`,
    },
    {
      title: 'Variants',
      description:
        '`outline` draws the lines, `fill` fills the shape, and `both` does both. Use `fill` only on icons that are closed shapes.',
      html: `<zeno-icon name="heart" size="xl" variant="outline"></zeno-icon>
<zeno-icon name="heart" size="xl" variant="fill"></zeno-icon>
<zeno-icon name="heart" size="xl" variant="both"></zeno-icon>
<zeno-icon name="star" size="xl" variant="outline"></zeno-icon>
<zeno-icon name="star" size="xl" variant="fill"></zeno-icon>
<zeno-icon name="star" size="xl" variant="both"></zeno-icon>`,
    },
    {
      title: 'An icon with a meaning',
      description:
        'Give the icon a `label` when it stands alone and carries meaning. `rotate` spins the icon and `pulse` fades it in and out.',
      html: `<p><zeno-icon name="check" label="Saved"></zeno-icon></p>
<p><zeno-icon name="settings" rotate></zeno-icon> Applying settings</p>
<p><zeno-icon name="heart" pulse></zeno-icon> Waiting for a reply</p>`,
    },
    {
      title: 'Your own SVG',
      description:
        'Without `name` and `src` the icon shows the SVG placed inside it. The SVG takes the line style and colour of the icon.',
      html: `<zeno-icon size="xl" label="Email">
  <svg viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
    <path d="M3 7l9 6 9-6"></path>
  </svg>
</zeno-icon>`,
    },
  ],

  keyboard: [],

  accessibility: [
    'Without a `label` the icon has `aria-hidden="true"`, so assistive technology skips it.',
    'With a `label` the icon gets `role="img"` and the label as its name.',
    'The icon is not focusable and adds no keyboard behaviour.',
    'With reduced motion the `rotate` and `pulse` animations do not run.',
  ],

  gaps: [
    // zeno-icon.ts:224-228: an unregistered name falls through to the empty slot; no console warning.
    'A `name` that is not registered shows nothing and gives no warning.',
    // zeno-icon.ts:233-252: the element registers 15 names.
    'Only 15 names are built in. Other elements ask for names that are missing, such as `eye` in `zeno-input` and `upload-cloud` in `zeno-file-upload`.',
    // zeno-icon.ts:69-73 sets stroke: none for fill; 239-244: x, plus, minus and menu are made of <line> only.
    '`variant="fill"` removes the stroke. Icons that are only lines (`x`, `plus`, `minus`, `menu`) disappear, and the chevrons and `check` become filled triangles.',
    // zeno-icon.ts:124-129, 212-222: src is drawn as a mask with a background colour; fill and stroke do not apply.
    '`variant` has no effect on an icon loaded with `src`.',
    // zeno-icon.ts:89-91 and 103-105: both rules set `animation` on .icon; the later one wins.
    '`rotate` and `pulse` cannot be used together. Both set the same CSS property, so only `pulse` runs.',
    // zeno-icon.ts:162, 89-100: rotate is a Boolean that starts an endless spin.
    'The name `rotate` suggests an angle, but it is an on or off spin. There is no way to turn an icon by a fixed angle.',
    // zeno-icon.ts:146-149: under prefers-contrast: more the stroke is ButtonText, not --icon-color.
    'When the user asks for more contrast, line icons are drawn in the system `ButtonText` colour and no longer follow the text colour.',
    // zeno-icon.ts:202-204: role and aria-label go on the inner span from `label` only; a host aria-label is not read.
    'An `aria-label` on the element is not used. Only `label` names the icon.',
  ],
};

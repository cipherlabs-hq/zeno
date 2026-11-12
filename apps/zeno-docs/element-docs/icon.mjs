export default {
  category: 'Data display',

  examples: [
    {
      title: 'Built-in names',
      description:
        'These 50 names are built in, drawn from Feather (MIT). Each one here has a `label` with its name. An icon without a `label` is decoration and is hidden from assistive technology.',
      html: `<zeno-icon name="arrow-left" label="arrow-left"></zeno-icon>
<zeno-icon name="arrow-right" label="arrow-right"></zeno-icon>
<zeno-icon name="chevron-down" label="chevron-down"></zeno-icon>
<zeno-icon name="chevron-up" label="chevron-up"></zeno-icon>
<zeno-icon name="chevron-left" label="chevron-left"></zeno-icon>
<zeno-icon name="chevron-right" label="chevron-right"></zeno-icon>
<zeno-icon name="chevrons-left" label="chevrons-left"></zeno-icon>
<zeno-icon name="chevrons-right" label="chevrons-right"></zeno-icon>
<zeno-icon name="check" label="check"></zeno-icon>
<zeno-icon name="x" label="x"></zeno-icon>
<zeno-icon name="plus" label="plus"></zeno-icon>
<zeno-icon name="minus" label="minus"></zeno-icon>
<zeno-icon name="search" label="search"></zeno-icon>
<zeno-icon name="menu" label="menu"></zeno-icon>
<zeno-icon name="more-horizontal" label="more-horizontal"></zeno-icon>
<zeno-icon name="copy" label="copy"></zeno-icon>
<zeno-icon name="download" label="download"></zeno-icon>
<zeno-icon name="upload" label="upload"></zeno-icon>
<zeno-icon name="upload-cloud" label="upload-cloud"></zeno-icon>
<zeno-icon name="external-link" label="external-link"></zeno-icon>
<zeno-icon name="link" label="link"></zeno-icon>
<zeno-icon name="filter" label="filter"></zeno-icon>
<zeno-icon name="refresh-cw" label="refresh-cw"></zeno-icon>
<zeno-icon name="eye" label="eye"></zeno-icon>
<zeno-icon name="eye-off" label="eye-off"></zeno-icon>
<zeno-icon name="info" label="info"></zeno-icon>
<zeno-icon name="help-circle" label="help-circle"></zeno-icon>
<zeno-icon name="alert-circle" label="alert-circle"></zeno-icon>
<zeno-icon name="alert-triangle" label="alert-triangle"></zeno-icon>
<zeno-icon name="check-circle" label="check-circle"></zeno-icon>
<zeno-icon name="x-circle" label="x-circle"></zeno-icon>
<zeno-icon name="map" label="map"></zeno-icon>
<zeno-icon name="map-pin" label="map-pin"></zeno-icon>
<zeno-icon name="crosshair" label="crosshair"></zeno-icon>
<zeno-icon name="navigation" label="navigation"></zeno-icon>
<zeno-icon name="calendar" label="calendar"></zeno-icon>
<zeno-icon name="clock" label="clock"></zeno-icon>
<zeno-icon name="home" label="home"></zeno-icon>
<zeno-icon name="user" label="user"></zeno-icon>
<zeno-icon name="settings" label="settings"></zeno-icon>
<zeno-icon name="mail" label="mail"></zeno-icon>
<zeno-icon name="heart" label="heart"></zeno-icon>
<zeno-icon name="star" label="star"></zeno-icon>
<zeno-icon name="sun" label="sun"></zeno-icon>
<zeno-icon name="moon" label="moon"></zeno-icon>
<zeno-icon name="file" label="file"></zeno-icon>
<zeno-icon name="file-text" label="file-text"></zeno-icon>
<zeno-icon name="image" label="image"></zeno-icon>
<zeno-icon name="music" label="music"></zeno-icon>
<zeno-icon name="film" label="film"></zeno-icon>`,
    },
    {
      title: 'Pixel sizes',
      description:
        'A number in `size` is a size in pixels, for an icon that should not grow with the text.',
      html: `<zeno-icon name="map" size="16"></zeno-icon>
<zeno-icon name="map" size="20"></zeno-icon>
<zeno-icon name="map" size="24"></zeno-icon>`,
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

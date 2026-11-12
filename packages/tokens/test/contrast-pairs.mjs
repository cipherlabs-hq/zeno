// The colour pairs Zeno promises will meet WCAG 2.2 AA in every theme.
//
// TEXT pairs need 4.5:1 (success criterion 1.4.3). UI pairs need 3:1
// (1.4.11): the boundary of a control, a focus indicator, or a filled shape
// that carries meaning. A foreground or background may be a translucent
// layer; `over` names the opaque token it is composited on.
//
// Not listed, on purpose:
//   color.text.disabled, color.border.disabled, color.background.disabled
//     disabled controls are exempt from both criteria
//   color.border.subtle, color.border.default, color.border.strong
//     decorative separators, never the only boundary of a control

export const TEXT = 4.5;
export const UI = 3;

const FAMILIES = ['accent', 'neutral', 'success', 'warning', 'danger', 'info'];
const SURFACES = ['page', 'surface', 'subtle'].map(
  name => `color.background.${name}`
);
const ALL_SURFACES = [...SURFACES, 'color.background.muted'];

/** @type {{ fg: string, bg: string, over?: string, min: number, why: string }[]} */
export const pairs = [];

function add(min, why, foregrounds, backgrounds, over) {
  for (const fg of foregrounds) {
    for (const bg of backgrounds) {
      pairs.push({ fg, bg, over, min, why });
    }
  }
}

add(
  TEXT,
  'body text',
  ['color.text.primary', 'color.text.secondary'],
  [...ALL_SURFACES, 'color.background.selected']
);
add(
  TEXT,
  'hints, captions and placeholders',
  ['color.text.tertiary', 'color.text.placeholder'],
  SURFACES
);
add(TEXT, 'error messages', ['color.text.invalid'], SURFACES);
add(
  TEXT,
  'links in every state',
  [
    'color.link.default',
    'color.link.hover',
    'color.link.active',
    'color.link.visited',
  ],
  SURFACES
);
add(TEXT, 'inverse text', ['color.text.inverse'], ['color.background.inverse']);
add(
  TEXT,
  'selected text',
  ['color.selection.text'],
  ['color.selection.background']
);
add(
  TEXT,
  'selected item label',
  ['color.accent.text'],
  ['color.background.selected']
);
for (const surface of ALL_SURFACES) {
  add(
    TEXT,
    'text on a hovered or pressed neutral item',
    ['color.text.primary', 'color.text.secondary'],
    ['color.background.hover', 'color.background.active'],
    surface
  );
}

add(
  UI,
  'form control boundary',
  ['color.border.control', 'color.border.controlHover', 'color.border.invalid'],
  SURFACES
);
add(
  UI,
  'focus indicator',
  ['color.focus.ring'],
  [...ALL_SURFACES, 'color.background.selected']
);
add(
  UI,
  'filled track against its rail',
  ['color.accent.solid'],
  ['color.background.muted']
);
add(
  UI,
  'switch thumb on its track, off and on',
  ['color.accent.onSolid'],
  ['color.border.control', 'color.accent.solid']
);

for (const family of FAMILIES) {
  const token = name => `color.${family}.${name}`;
  add(
    TEXT,
    `${family}: label on the solid fill`,
    [token('onSolid')],
    [token('solid'), token('solidHover'), token('solidActive')]
  );
  add(
    TEXT,
    `${family}: coloured text`,
    [token('text')],
    [
      token('subtle'),
      token('subtleHover'),
      'color.background.page',
      'color.background.surface',
    ]
  );
  add(UI, `${family}: solid fill as a shape`, [token('solid')], SURFACES);
  add(
    UI,
    `${family}: outline`,
    [token('border')],
    [token('subtle'), 'color.background.page', 'color.background.surface']
  );
}

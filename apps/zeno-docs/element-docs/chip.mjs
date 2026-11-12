export default {
  category: 'Data display',

  examples: [
    {
      title: 'Variants',
      html: `<zeno-chip variant="filled">Filled</zeno-chip>
<zeno-chip variant="outlined">Outlined</zeno-chip>
<zeno-chip variant="subtle">Subtle</zeno-chip>`,
    },
    {
      title: 'Colours',
      description: 'Each `color` works with each variant.',
      html: `<zeno-chip color="success">Published</zeno-chip>
<zeno-chip color="warning">In review</zeno-chip>
<zeno-chip color="danger">Rejected</zeno-chip>
<zeno-chip variant="outlined" color="success">Published</zeno-chip>
<zeno-chip variant="outlined" color="warning">In review</zeno-chip>
<zeno-chip variant="outlined" color="danger">Rejected</zeno-chip>
<zeno-chip variant="subtle" color="success">Published</zeno-chip>
<zeno-chip variant="subtle" color="warning">In review</zeno-chip>
<zeno-chip variant="subtle" color="danger">Rejected</zeno-chip>`,
    },
    {
      title: 'Sizes',
      html: `<zeno-chip size="xs">Extra small</zeno-chip>
<zeno-chip size="sm">Small</zeno-chip>
<zeno-chip size="md">Medium</zeno-chip>
<zeno-chip size="lg">Large</zeno-chip>`,
    },
    {
      title: 'Removable',
      description:
        'The remove button fires `remove`. The chip does not remove itself, so the page does it. Set `removeLabel` so that each button says what it removes. A disabled chip has no remove button.',
      html: `<zeno-chip variant="subtle" removable>report.pdf</zeno-chip>
<zeno-chip variant="subtle" removable>notes.txt</zeno-chip>
<zeno-chip variant="subtle" removable disabled>budget.csv</zeno-chip>`,
      script: `document.querySelectorAll('zeno-chip').forEach(chip => {
  chip.removeLabel = 'Remove ' + chip.textContent.trim();
  chip.addEventListener('remove', () => chip.remove());
});`,
    },
    {
      title: 'Clickable and selected',
      description:
        'A `clickable` chip can take focus and fires a click on Enter or Space. The chip does not change `selected` itself, so the page does it.',
      html: `<zeno-chip variant="outlined" clickable selected>All</zeno-chip>
<zeno-chip variant="outlined" clickable>Documents</zeno-chip>
<zeno-chip variant="outlined" clickable>Images</zeno-chip>
<zeno-chip variant="outlined" clickable disabled>Archived</zeno-chip>`,
      script: `document.querySelectorAll('zeno-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    if (!chip.disabled) chip.selected = !chip.selected;
  });
});`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to a `clickable` chip that is not disabled, and to the remove button of a `removable` chip.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'On a `clickable` chip, fires a click.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'On the remove button, fires `remove`.',
    },
  ],

  accessibility: [
    'A plain chip is text in a `<div>` with no role. It is not in the tab order.',
    'A `clickable` chip has `role="button"`, `tabindex="0"`, and `aria-pressed` that follows `selected`.',
    '`disabled` sets `aria-disabled="true"`, takes the chip out of the tab order and removes the remove button.',
    'The remove button is a native `<button>`. Its name is `removeLabel`, which is “Remove” unless you change it.',
    'A press on the remove button does not also click the chip.',
  ],

  gaps: [
    // zeno-chip.ts:336-344, 395-400: the prefix slot is rendered only when hasSlot('prefix') already finds it.
    'The `prefix` slot does not work. The slot is rendered only when the chip finds content in it, and it cannot find content in a slot that is not rendered. An icon given to `prefix` never shows.',
    // zeno-chip.ts:293 against 36-55: host rules exist for xs, sm and lg only.
    'The `size` type allows `xl`, but there are no styles for it. An `xl` chip looks like `md`.',
    // zeno-chip.ts:98-106: .chip--filled.chip--primary and .chip--filled.chip--accent set the same colours; the same holds for the other variants.
    '`primary` and `accent` look the same.',
    // zeno-chip.ts:291-292: `color` defaults to 'primary'; 92-96: the neutral .chip--filled rule is always overridden.
    'There is no neutral colour. `color` defaults to `primary`, so a filled or subtle chip always has a colour.',
    // zeno-chip.ts:318-319 against 130-133: the colour class is left out for outlined + primary, so .chip--outlined.chip--primary never matches.
    'An outlined chip with `color="primary"` is grey, not the primary colour. The class that the style needs is left out for exactly this pair.',
    // zeno-chip.ts:188-192 against 98-121: .chip--selected has one class, .chip--<variant>.chip--<color> has two and wins.
    '`selected` is hard to see on filled and subtle chips. The colour rules are more specific than the selected rule, so only the border changes. It shows fully only on an outlined chip with the default colour.',
    // zeno-chip.ts:329-330: aria-pressed is set whenever `clickable` is.
    'Every clickable chip is announced as a toggle button, pressed or not pressed, also when it only opens something.',
    // zeno-chip.ts:329, 353: a <button> inside an element with role="button".
    'A chip that is both `clickable` and `removable` puts a button inside a button. Assistive technology may not show the remove button, because a button hides the roles of its children.',
    // zeno-chip.ts:299, 357: default 'Remove'.
    'The default remove label “Remove” is English and the same for every chip. It does not say what is removed.',
    // zeno-chip.ts:299: no `attribute` option, so Lit lower-cases the property name.
    'The attribute for `removeLabel` is `removelabel`, with no hyphen. Other elements use hyphens, as in `max-items`.',
    // zeno-chip.ts:332: aria-label on a <div> that has no role unless `clickable` is set.
    'With `label`, or with `aria-label`, a chip that is not clickable gets an `aria-label` on an element with no role, where it is not allowed.',
  ],
};

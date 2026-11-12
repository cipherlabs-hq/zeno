export default {
  category: 'Layout',

  examples: [
    {
      title: 'Elevation',
      description:
        '`elevation` goes from 0, with no shadow, to 5. The default is 1.',
      html: `<zeno-paper elevation="0">Elevation 0</zeno-paper>
<zeno-paper elevation="1">Elevation 1</zeno-paper>
<zeno-paper elevation="2">Elevation 2</zeno-paper>
<zeno-paper elevation="3">Elevation 3</zeno-paper>
<zeno-paper elevation="4">Elevation 4</zeno-paper>
<zeno-paper elevation="5">Elevation 5</zeno-paper>`,
    },
    {
      title: 'Outlined and glass',
      description:
        '`outlined` draws a border in place of the shadow. `glass` makes the surface partly see-through and blurs what is behind it. Both ignore `elevation`.',
      html: `<zeno-paper outlined>Outlined</zeno-paper>
<zeno-paper glass>Glass</zeno-paper>`,
    },
    {
      title: 'Padding and radius',
      html: `<zeno-paper outlined padding="none" radius="none">No padding, square corners</zeno-paper>
<zeno-paper outlined padding="sm" radius="sm">Small padding, small radius</zeno-paper>
<zeno-paper outlined padding="md" radius="md">Medium padding, medium radius</zeno-paper>
<zeno-paper outlined padding="lg" radius="lg">Large padding, large radius</zeno-paper>
<zeno-paper outlined padding="xl" radius="xl">Extra large padding, extra large radius</zeno-paper>`,
    },
    {
      title: 'Background',
      html: `<zeno-paper outlined background="primary">Primary</zeno-paper>
<zeno-paper outlined background="secondary">Secondary</zeno-paper>
<zeno-paper outlined background="tertiary">Tertiary</zeno-paper>
<zeno-paper outlined background="surface">Surface</zeno-paper>`,
    },
    {
      title: 'Clickable',
      description:
        'A `clickable` paper can take focus. Enter and Space send a `click`, the same as a pointer press.',
      html: `<zeno-paper clickable elevation="2">Open the March invoice</zeno-paper>
<p data-result>Not opened yet.</p>`,
      script: `let count = 0;
document.querySelector('zeno-paper').addEventListener('click', () => {
  count += 1;
  document.querySelector('[data-result]').textContent = 'Opened ' + count + ' times.';
});`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves focus to the paper, only when it is `clickable`.',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'On a `clickable` paper, sends a `click` event. Keys pressed in a control inside the paper are left alone.',
    },
  ],

  accessibility: [
    'A `clickable` paper has `role="button"` and `tabindex="0"`. Any other paper has `role="article"`.',
    'The `aria-label` of the element is copied to the inner element that carries the role.',
    'When the user asks for more contrast, the paper gets a border.',
    'With reduced motion a `clickable` paper has no transition and does not lift on hover.',
  ],

  gaps: [
    // zeno-paper.ts:237: role is 'button' or 'article'; there is no other branch.
    'Every paper that is not `clickable` is an `article`. A page with many papers used only for layout gets many article regions, and the role cannot be removed.',
    // zeno-paper.ts:238: tabindex is '-1' when not clickable.
    'A paper that is not `clickable` has `tabindex="-1"`. A pointer press on it moves focus to the paper, and it can show a focus ring.',
    // zeno-paper.ts:237-239: a clickable paper is a button whose name is its whole content unless aria-label is set; interactive children end up inside a button role.
    'A `clickable` paper is one button. Links or buttons placed inside it are nested inside a button role, which assistive technology does not handle well.',
    // zeno-paper.ts:146-148 and 158-160: both use the same token.
    '`background="primary"` and `background="surface"` are the same colour.',
    // zeno-paper.ts:239: this.ariaLabel is read in render; it is not a reactive property.
    'The `aria-label` is read when the paper renders. Changing only `aria-label` later does not update the inner element until another property changes.',
    // zeno-paper.ts:239: aria-label=${this.ariaLabel} with no `nothing` fallback; Lit writes an empty attribute for null.
    'A paper without an `aria-label` still gets an empty `aria-label=""` on its inner element.',
    // zeno-paper.ts:209, 237-238: no disabled property.
    'A `clickable` paper cannot be disabled.',
  ],
};

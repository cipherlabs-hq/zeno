export default {
  category: 'Layout',

  examples: [
    {
      title: 'Maximum widths',
      description:
        'The container centres its content and stops growing at `maxWidth`: `xs` is 480px, `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px and `2xl` 1536px. The default is `lg`. A container is never wider than the space it is in, so the larger sizes look the same in a narrow preview.',
      html: `<zeno-container maxWidth="xs">
  <zeno-card outlined compact>Extra small: at most 480px wide.</zeno-card>
</zeno-container>
<zeno-container maxWidth="sm">
  <zeno-card outlined compact>Small: at most 640px wide.</zeno-card>
</zeno-container>
<zeno-container maxWidth="md">
  <zeno-card outlined compact>Medium: at most 768px wide.</zeno-card>
</zeno-container>
<zeno-container>
  <zeno-card outlined compact>Default, large: at most 1024px wide.</zeno-card>
</zeno-container>`,
    },
    {
      title: 'Fluid',
      description: '`fluid` removes the maximum width. The side padding stays.',
      html: `<zeno-container fluid>
  <zeno-card outlined compact>This container fills the space it is given.</zeno-card>
</zeno-container>`,
    },
    {
      title: 'No padding',
      description:
        'A container has padding on its left and right side, and the padding grows on wider screens. `no-padding` removes it.',
      html: `<zeno-container maxWidth="sm">
  <zeno-card outlined compact>With side padding.</zeno-card>
</zeno-container>
<zeno-container maxWidth="sm" no-padding>
  <zeno-card outlined compact>Without side padding.</zeno-card>
</zeno-container>`,
    },
  ],

  keyboard: [],

  accessibility: [
    'The container does not take focus and handles no keys.',
    'It renders a `<div>` with `role="region"`. The name of the region is the `aria-label` you set, or “Content container”.',
    'In print, the maximum width and the padding are removed.',
  ],

  gaps: [
    // zeno-container.ts:125-126: role="region" with a default aria-label on every container.
    'Every container is a named `region` landmark. A page with several containers gets several landmarks, all called “Content container” unless each has its own `aria-label`. A layout wrapper should have no role.',
    // zeno-container.ts:126: literal 'Content container'.
    'The default name “Content container” is English.',
    // zeno-container.ts:104: no `attribute` option, so Lit lower-cases the property name; 107 uses 'no-padding'.
    'The attribute for `maxWidth` is `maxwidth`, with no hyphen, while `no-padding` on the same element has one. HTML ignores case, so `maxWidth` in markup also works.',
  ],
};

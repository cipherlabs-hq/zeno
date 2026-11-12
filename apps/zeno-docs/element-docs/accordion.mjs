export default {
  category: 'Data display',

  examples: [
    {
      title: 'Basic',
      description:
        'Sections are set as the `items` property. Each item needs a `value`, a `label` and a `content` string. Opening one section closes the others.',
      html: `<zeno-accordion></zeno-accordion>`,
      script: `document.querySelector('zeno-accordion').items = [
  { value: 'delivery', label: 'Delivery', content: 'Orders leave the warehouse within two working days.' },
  { value: 'returns', label: 'Returns', content: 'You can send an item back within 30 days.' },
  { value: 'payment', label: 'Payment', content: 'We accept cards and bank transfer.' },
];`,
    },
    {
      title: 'Several sections open',
      description:
        'With `multiple`, a section stays open when another one opens. `toggleItem()` opens or closes a section from code.',
      html: `<zeno-accordion multiple></zeno-accordion>`,
      script: `const accordion = document.querySelector('zeno-accordion');
accordion.items = [
  { value: 'profile', label: 'Profile', content: 'Name, photo and time zone.' },
  { value: 'security', label: 'Security', content: 'Password and sign-in methods.' },
  { value: 'billing', label: 'Billing', content: 'Plan, invoices and payment method.' },
];
accordion.toggleItem('profile');
accordion.toggleItem('billing');`,
    },
    {
      title: 'Variants',
      description:
        'The default look, then `bordered`, `filled`, `ghost` and `flush`.',
      html: `<zeno-accordion></zeno-accordion>
<zeno-accordion variant="bordered"></zeno-accordion>
<zeno-accordion variant="filled"></zeno-accordion>
<zeno-accordion variant="ghost"></zeno-accordion>
<zeno-accordion variant="flush"></zeno-accordion>`,
      script: `document.querySelectorAll('zeno-accordion').forEach(accordion => {
  accordion.items = [
    { value: 'summary', label: 'Summary', content: 'Three files changed this week.' },
    { value: 'details', label: 'Details', content: 'report.pdf, notes.txt and budget.csv.' },
  ];
});`,
    },
    {
      title: 'Sizes, icons and a disabled section',
      description:
        'A disabled section cannot be opened and the arrow keys skip it. An item can name an icon to show before its label.',
      html: `<zeno-accordion size="sm"></zeno-accordion>
<zeno-accordion size="lg"></zeno-accordion>`,
      script: `document.querySelectorAll('zeno-accordion').forEach(accordion => {
  accordion.items = [
    { value: 'account', label: 'Account', icon: 'user', content: 'Signed in as ada@example.com.' },
    { value: 'settings', label: 'Settings', icon: 'settings', content: 'Language and notifications.' },
    { value: 'archive', label: 'Archive', content: 'Nothing here yet.', disabled: true },
  ];
});`,
    },
  ],

  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the next section header.' },
    {
      keys: ['Enter', 'Space'],
      action: 'Opens or closes the focused section.',
    },
    {
      keys: ['ArrowDown'],
      action:
        'Moves focus to the next header that is not disabled. It stops at the last one.',
    },
    {
      keys: ['ArrowUp'],
      action:
        'Moves focus to the previous header that is not disabled. It stops at the first one.',
    },
    {
      keys: ['Home'],
      action: 'Moves focus to the first header that is not disabled.',
    },
    {
      keys: ['End'],
      action: 'Moves focus to the last header that is not disabled.',
    },
  ],

  accessibility: [
    'Each header is a native `<button>` with `aria-expanded`, and `aria-controls` that points at its panel.',
    'Each panel has `role="region"` and takes its name from its header with `aria-labelledby`.',
    'A disabled section sets the native `disabled` attribute on its header, so the header leaves the tab order.',
    'The element wraps its sections in `role="region"`. The name is the `aria-label` you set, or “Accordion”.',
    'The chevron and item icons are decoration and hidden from assistive technology.',
  ],

  gaps: [
    // zeno-accordion.ts:291-300: firstUpdated adds to the Set in place, once, with no requestUpdate.
    '`defaultExpanded` is read only once, after the first render, and does not ask for a new render. Sections named there stay closed until something else updates the element, and a value set later is ignored. Use `toggleItem()` for now.',
    // zeno-accordion.ts:284: no `attribute` option, so Lit lower-cases the property name.
    'The attribute for `defaultExpanded` is `defaultexpanded`, with no hyphen. Other elements use hyphens, as in `max-items`.',
    // zeno-accordion.ts:500-502: the panel renders the string `item.content`; there is no slot.
    'Panel content is a plain string. There is no slot, so a panel cannot hold links, lists or other elements.',
    // types.ts:35-44 against zeno-accordion.ts: only value, label, content, icon and disabled are read.
    'The `AccordionItem` type requires `id` and `title` and offers `expanded`, but the element never reads them.',
    // zeno-accordion.ts:458-468: the button sits in a div, not in a heading.
    'Header buttons are not inside heading elements, so screen reader users cannot move between sections by heading.',
    // zeno-accordion.ts:432-433, 495: role="region" on the wrapper and on every panel.
    'The wrapper and every panel are `region` landmarks. An accordion with many sections fills the landmark list.',
    // zeno-accordion.ts:433: literal 'Accordion'.
    'The fallback name “Accordion” is English and can only be changed with `aria-label`.',
    // zeno-accordion.ts:168-176, 491-499: height 0 and overflow hidden only, no `hidden` attribute.
    'A closed panel is hidden only with `height: 0` and `overflow: hidden`. Its text stays in the accessibility tree, so screen readers still read it.',
    // zeno-accordion.ts:41-42, 161, 171: `transition: height all <duration> <easing>` is not valid CSS.
    'Opening and closing do not animate. `--accordion-transition` already starts with `all`, so `transition: height var(--accordion-transition)` and the chevron’s `transition: transform …` are invalid and the browser drops them.',
    // zeno-accordion.ts:48-52, 68-72: every item has `margin-bottom: -1px` and the wrapper has `overflow: hidden`.
    'The bottom border of the last section is cut off in the default look. Every section is pulled up by 1px to share a border with the next one, and the wrapper hides the border of the last one.',
    // zeno-accordion.ts:330-347: expandAll adds every item without checking `multiple`; neither method emits `change`.
    '`expandAll()` opens every section even without `multiple`. `expandAll()` and `collapseAll()` do not fire `change`.',
  ],
};

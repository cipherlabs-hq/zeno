export default {
  category: 'Navigation',

  examples: [
    {
      title: 'Basic',
      description:
        'The trail is set as the `items` property. The last item is the current page and is not a link.',
      html: `<zeno-breadcrumb></zeno-breadcrumb>`,
      script: `document.querySelector('zeno-breadcrumb').items = [
  { label: 'Home', href: '#home' },
  { label: 'Projects', href: '#projects' },
  { label: 'Annual report', href: '#annual-report' },
  { label: 'Budget' },
];`,
    },
    {
      title: 'Text separator',
      description:
        'Any text other than `/` is shown as it is between the items.',
      html: `<zeno-breadcrumb separator="·"></zeno-breadcrumb>
<zeno-breadcrumb separator="-"></zeno-breadcrumb>`,
      script: `document.querySelectorAll('zeno-breadcrumb').forEach(breadcrumb => {
  breadcrumb.items = [
    { label: 'Settings', href: '#settings' },
    { label: 'Team', href: '#team' },
    { label: 'Members' },
  ];
});`,
    },
    {
      title: 'Icons',
      description:
        'With `show-icons`, an item that names an `icon` shows it before its label.',
      html: `<zeno-breadcrumb show-icons></zeno-breadcrumb>`,
      script: `document.querySelector('zeno-breadcrumb').items = [
  { label: 'Home', href: '#home', icon: 'home' },
  { label: 'Account', href: '#account', icon: 'user' },
  { label: 'Settings', icon: 'settings' },
];`,
    },
    {
      title: 'Listening for clicks',
      description:
        '`item-click` fires when a link is used. The event does not bubble, so listen on the element itself.',
      html: `<zeno-breadcrumb></zeno-breadcrumb>
<p data-result>No item clicked yet.</p>`,
      script: `const breadcrumb = document.querySelector('zeno-breadcrumb');
breadcrumb.items = [
  { label: 'Files', href: '#files' },
  { label: 'Reports', href: '#reports' },
  { label: 'report.pdf' },
];
breadcrumb.addEventListener('item-click', event => {
  document.querySelector('[data-result]').textContent = 'Clicked: ' + event.detail.item.label;
});`,
    },
  ],

  keyboard: [
    { keys: ['Tab'], action: 'Moves focus from link to link.' },
    { keys: ['Enter'], action: 'Follows the focused link.' },
    {
      keys: ['Enter', 'Space'],
      action:
        'On the “more” button that `max-items` adds, fires `collapsed-click`.',
    },
  ],

  accessibility: [
    'Renders a `<nav>` that holds an ordered list. The name of the `<nav>` is the `aria-label` you set, or “Breadcrumb navigation”.',
    'An item with `href` is a native link, unless it is the last one. The last item is plain text with `aria-current="page"`.',
    'Separators and icons are hidden from assistive technology.',
    'The “more” button is a native `<button>` with the label “Show more breadcrumb items”.',
  ],

  gaps: [
    // zeno-breadcrumb.ts:383 against icon/zeno-icon.ts:233-250: more-horizontal is not registered.
    'The “more” button that `max-items` adds is empty. It asks for the icon `more-horizontal`, which `zeno-icon` does not register, so the button has a label but nothing to see.',
    // zeno-breadcrumb.ts:251-255: the handler only emits the event.
    'The “more” button does not show the hidden items. It only fires `collapsed-click` with them, and the page has to do the rest.',
    // zeno-breadcrumb.ts:228-231: start is the first item, end is the last, whatever maxItems is.
    '`max-items` is only a limit that turns collapsing on. Above it, the trail always shows just the first and the last item, whatever the number is.',
    // zeno-breadcrumb.ts:261-271: the default '/' is replaced with a chevron SVG.
    'The default separator `/` is drawn as a chevron. A real slash cannot be shown.',
    // zeno-breadcrumb.ts:107-114, 239-243, 307-315: opacity, pointer-events and preventDefault only.
    'A disabled item is still a link in the tab order. It has no `aria-disabled`, so a screen reader announces a normal link that does nothing.',
    // zeno-breadcrumb.ts:285: the class needs `isLast && !item.href`.
    'The current-page style is applied only when the last item has no `href`. With an `href`, the last item is still plain text but looks like the other items.',
    // zeno-breadcrumb.ts:359, 380: literals 'Breadcrumb navigation' and 'Show more breadcrumb items'.
    'The texts “Breadcrumb navigation” and “Show more breadcrumb items” are English. The first can be replaced with `aria-label`, the second cannot be changed.',
    // zeno-breadcrumb.ts:206, 356-392: `items` is the only source; the template has no slot.
    'Items can only be given as data, in the `items` property or as JSON in the `items` attribute. Links written as children of the element are ignored.',
  ],
};

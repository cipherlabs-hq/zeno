export default {
  category: 'Navigation',

  examples: [
    {
      title: 'Basic rail',
      description:
        'Set `items` and `activeItem` as properties. The rail fires `item-select` when an item is chosen.',
      html: `<zeno-nav-rail></zeno-nav-rail>
<p data-result>Nothing selected yet.</p>`,
      script: `const rail = document.querySelector('zeno-nav-rail');
rail.items = [
  { id: 'home', value: 'home', label: 'Home', icon: 'home' },
  { id: 'search', value: 'search', label: 'Search', icon: 'search' },
  { id: 'saved', value: 'saved', label: 'Saved', icon: 'heart' },
  { id: 'settings', value: 'settings', label: 'Settings', icon: 'settings' },
];
rail.activeItem = 'home';
rail.addEventListener('item-select', event => {
  document.querySelector('[data-result]').textContent = 'Selected: ' + event.detail.value;
});`,
    },
    {
      title: 'Expanded, with sections and a badge',
      description:
        'With `expanded` the rail is wider and shows the labels. Items with the same `section` are listed under that title.',
      html: `<zeno-nav-rail expanded></zeno-nav-rail>`,
      script: `const rail = document.querySelector('zeno-nav-rail');
rail.items = [
  { id: 'home', value: 'home', label: 'Home', icon: 'home', section: 'Workspace' },
  { id: 'saved', value: 'saved', label: 'Saved', icon: 'star', badge: 3, section: 'Workspace' },
  { id: 'profile', value: 'profile', label: 'Profile', icon: 'user', section: 'Account' },
  { id: 'settings', value: 'settings', label: 'Settings', icon: 'settings', section: 'Account' },
];
rail.activeItem = 'saved';`,
    },
    {
      title: 'The toggle button',
      description:
        'The button at the top switches `expanded` and fires `toggle`. Set the `showToggle` property to `false` to remove it.',
      html: `<zeno-nav-rail></zeno-nav-rail>
<p data-result>The rail is collapsed.</p>`,
      script: `const rail = document.querySelector('zeno-nav-rail');
rail.items = [
  { id: 'home', value: 'home', label: 'Home', icon: 'home' },
  { id: 'profile', value: 'profile', label: 'Profile', icon: 'user' },
];
rail.activeItem = 'home';
rail.addEventListener('toggle', event => {
  document.querySelector('[data-result]').textContent =
    event.detail.expanded ? 'The rail is expanded.' : 'The rail is collapsed.';
});`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to the toggle button, then to each item in turn. Every item is a Tab stop.',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'On the toggle button, expands or collapses the rail. On an item, selects it. Enter on an item with `href` follows the link.',
    },
    {
      keys: ['ArrowDown', 'ArrowUp'],
      action:
        'Selects the next or previous item and moves focus to it. Wraps at both ends.',
    },
    {
      keys: ['Home', 'End'],
      action: 'Selects the first or last item and moves focus to it.',
    },
  ],

  accessibility: [
    'Renders a `<nav>` landmark. It is named by the `aria-label` of the element, or “Navigation rail” when there is none.',
    'Items are native links when they have `href` and native buttons when they do not, inside nested lists.',
    'The active link has `aria-current="page"` and the active button has `aria-current="true"`.',
    'The toggle button has `aria-expanded` and is named “Expand navigation” or “Collapse navigation”.',
    'With reduced motion the rail has no transitions. The rail is hidden when the page is printed.',
  ],

  gaps: [
    // zeno-nav-rail.ts:438-456 builds <a></a> or <button></button> as a closed, empty element; 461-484 renders the icon, label, tooltip and badge after it as siblings; 485 is a template that holds only a closing tag, which the parser drops.
    'Each link or button is rendered empty. The icon, label and badge are placed after it, not inside it. The control has no accessible name, a click on the icon or label does nothing, and the item looks like an empty box with its content under it.',
    // zeno-nav-rail.ts:300-305: the tooltip selector needs the tooltip inside .nav-rail__link; 461-475 renders it as a sibling.
    'The tooltip of a collapsed rail never shows, because it is not inside the link that the hover style looks at.',
    // zeno-nav-rail.ts:230-238 hides labels with display: none when collapsed.
    'In a collapsed rail the labels are removed with `display: none`. Together with the two gaps above, items have no name at all for assistive technology.',
    // zeno-nav-rail.ts:560 passes the index inside the section; 388 indexes all enabled items; 422-423 indexes all links, disabled ones too.
    'The arrow keys go to the wrong item when the rail has sections or disabled items. The handler mixes three different ways of counting the items.',
    // zeno-nav-rail.ts:418-424: selectItem() is called before focus moves.
    'The arrow keys, Home and End select the item they move to. In a rail of links this changes `activeItem` and fires `item-select` without loading the page of that link.',
    // zeno-nav-rail.ts:213-217, 432-436: a CSS class only; no disabled attribute, no aria-disabled, no tabindex change.
    'A disabled item is only dimmed and closed to the pointer. It is still a Tab stop and is not announced as disabled.',
    // zeno-nav-rail.ts:351-352: a Boolean attribute that defaults to true cannot be set to false from HTML.
    '`show-toggle` is on by default and a Boolean attribute cannot turn it off. Only the property `showToggle = false` works.',
    // zeno-nav-rail.ts:516-540: the header slot is inside the showToggle branch.
    'The `header` slot is removed together with the toggle button when `showToggle` is `false`.',
    // zeno-nav-rail.ts:349: @property() activeItem has no attribute name, so the attribute is `activeitem`.
    'The attribute for `activeItem` is `activeitem`, with no dash. The other attributes of the element use dashes.',
    // zeno-nav-rail.ts:453: aria-current is 'true' or 'false' on buttons.
    'Buttons that are not active carry `aria-current="false"`. The attribute should be left out.',
    // zeno-nav-rail.ts:462, 534: size="24" and size="20"; zeno-icon.ts:33-51 styles xs to xl only; 233-252 lists the names.
    'Item icons only work for the names `zeno-icon` has built in or the page has registered. The sizes `24` and `20` that the rail asks for do not exist in `zeno-icon`.',
    // zeno-nav-rail.ts:513, 524-528: fixed strings.
    '“Navigation rail”, “Expand navigation” and “Collapse navigation” are English only. Only the first can be replaced, with `aria-label`.',
    // zeno-nav-rail.ts:42-43 defines --nav-rail-transition as `all <duration> <easing>`; 57 uses `transition: width var(--nav-rail-transition)`, which is not a valid value.
    'The width does not animate when the rail expands or collapses. The transition value is not valid CSS.',
    // zeno-nav-rail.ts:56, 203, 209, 264, 270: border-right, left, margin-left.
    'The border, the active marker, the badge and the tooltip are placed with left and right. They do not follow a right-to-left page.',
  ],
};

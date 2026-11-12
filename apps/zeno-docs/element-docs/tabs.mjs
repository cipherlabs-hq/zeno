export default {
  category: 'Navigation',

  examples: [
    {
      title: 'Basic',
      description:
        'Tabs are set with the `tabs` property. Each child of the element is a panel, and panels are matched to tabs by their order. Set `value` to the tab that is open at the start.',
      html: `<zeno-tabs value="overview">
  <div><p>Overview: 3 projects, 12 open tasks.</p></div>
  <div><p>Activity: the last change was made today.</p></div>
  <div><p>Settings: choose who can see this page.</p></div>
</zeno-tabs>`,
      script: `document.querySelector('zeno-tabs').tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
  { value: 'settings', label: 'Settings' },
];`,
    },
    {
      title: 'Variants',
      html: `<zeno-tabs variant="line" value="day">
  <div><p>Line: tasks for today.</p></div>
  <div><p>Line: tasks for this week.</p></div>
</zeno-tabs>
<zeno-tabs variant="pills" value="day">
  <div><p>Pills: tasks for today.</p></div>
  <div><p>Pills: tasks for this week.</p></div>
</zeno-tabs>
<zeno-tabs variant="card" value="day">
  <div><p>Card: tasks for today.</p></div>
  <div><p>Card: tasks for this week.</p></div>
</zeno-tabs>`,
      script: `document.querySelectorAll('zeno-tabs').forEach(tabs => {
  tabs.tabs = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
  ];
});`,
    },
    {
      title: 'Sizes and full width',
      description:
        '`full-width` makes the tabs share the whole width of the element.',
      html: `<zeno-tabs size="sm" value="files">
  <div><p>Small tabs.</p></div>
  <div><p>Shared files.</p></div>
</zeno-tabs>
<zeno-tabs size="lg" value="files">
  <div><p>Large tabs.</p></div>
  <div><p>Shared files.</p></div>
</zeno-tabs>
<zeno-tabs full-width value="files">
  <div><p>Full width tabs.</p></div>
  <div><p>Shared files.</p></div>
</zeno-tabs>`,
      script: `document.querySelectorAll('zeno-tabs').forEach(tabs => {
  tabs.tabs = [
    { value: 'files', label: 'My files' },
    { value: 'shared', label: 'Shared' },
  ];
});`,
    },
    {
      title: 'Vertical',
      html: `<zeno-tabs vertical value="profile">
  <div><p>Profile: your name and photo.</p></div>
  <div><p>Password: change your password.</p></div>
  <div><p>Notifications: choose what we send you.</p></div>
</zeno-tabs>`,
      script: `document.querySelector('zeno-tabs').tabs = [
  { value: 'profile', label: 'Profile' },
  { value: 'password', label: 'Password' },
  { value: 'notifications', label: 'Notifications' },
];`,
    },
    {
      title: 'Icons, badges, a disabled tab and the change event',
      description:
        'A tab can have an `icon`, a `badge` and `disabled`. The `change` event carries the new `value` in `event.detail`.',
      html: `<zeno-tabs value="home">
  <div><p>Home</p></div>
  <div><p>Favourites</p></div>
  <div><p>Account</p></div>
  <div><p>Admin</p></div>
</zeno-tabs>
<p data-result>Selected: home</p>`,
      script: `const tabs = document.querySelector('zeno-tabs');
tabs.tabs = [
  { value: 'home', label: 'Home', icon: 'home' },
  { value: 'favourites', label: 'Favourites', icon: 'star', badge: 4 },
  { value: 'account', label: 'Account', icon: 'user' },
  { value: 'admin', label: 'Admin', icon: 'settings', disabled: true },
];
tabs.addEventListener('change', event => {
  document.querySelector('[data-result]').textContent = 'Selected: ' + event.detail.value;
});`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to the first tab that is not disabled, then to each next tab, then into the page after the tabs.',
    },
    {
      keys: ['ArrowRight', 'ArrowDown'],
      action:
        'Moves focus to the next tab that is not disabled and selects it. From the last tab it goes to the first.',
    },
    {
      keys: ['ArrowLeft', 'ArrowUp'],
      action:
        'Moves focus to the previous tab that is not disabled and selects it. From the first tab it goes to the last.',
    },
    {
      keys: ['Home', 'End'],
      action:
        'Moves focus to the first or last tab that is not disabled and selects it.',
    },
    { keys: ['Enter', 'Space'], action: 'Selects the focused tab.' },
  ],

  accessibility: [
    'The row of tabs is a `<div role="tablist">`. Each tab is a native `<button>` with `role="tab"` and `aria-selected`. A disabled tab has the native `disabled` attribute.',
    'Each child of the element gets `role="tabpanel"`. Every panel except the selected one gets the `hidden` attribute.',
    'Selection follows focus: an arrow key selects the tab it moves to.',
    'With `prefers-reduced-motion: reduce` the tab transitions are turned off.',
  ],

  gaps: [
    // zeno-tabs.ts:329-332: firstUpdated() picks the first enabled tab.
    // 343-346: updated() then runs with `value` in changedProperties (its
    // first value, '') and sets activeTab = this.value. Checked in Chromium
    // with the built bundle: no tab has aria-selected="true" and all panels
    // are hidden.
    'Without `value`, no tab is selected and every panel is hidden. The code picks the first tab, but the next step sets the active tab back to the empty `value`. Always set `value`.',
    // zeno-tabs.ts:343-346: activeTab = this.value with no check against tabs.
    'A `value` that matches no tab also leaves every panel hidden and no tab selected.',
    // zeno-tabs.ts:484-495: no tabindex on the tab buttons.
    'Every enabled tab is a tab stop. The tab list does not use a roving `tabindex`, so the Tab key goes through all tabs before it reaches the panel.',
    // zeno-tabs.ts:491: aria-controls="panel-<value>". 373-381:
    // updatePanels() sets hidden, role and aria-labelledby, never an id.
    'Each tab has `aria-controls="panel-<value>"`, but no panel is given that `id`.',
    // zeno-tabs.ts:379: aria-labelledby="tab-<value>" on a light DOM panel.
    // 485: the element with that id is a button inside the shadow root.
    'Each panel has `aria-labelledby="tab-<value>"`. The tab with that `id` is inside the shadow root, so the reference does not resolve and the panel has no name.',
    // zeno-tabs.ts:472: role="tablist" with no aria-orientation, also when
    // `vertical` is set (466).
    'A `vertical` tab list has no `aria-orientation="vertical"`.',
    // zeno-tabs.ts:472: no aria-label or aria-labelledby on the tablist, and
    // no property that sets one.
    'The tab list has no accessible name, and there is no attribute to give it one.',
    // zeno-tabs.ts:151-160: the line indicator is an ::after at the bottom
    // of the active tab. 144-148 move the tab 2px below the list, and 57
    // (overflow-x: auto) makes the list clip it. Checked in Chromium with the
    // built bundle: no line is painted, and the list scrolls 2px up and down.
    'In the `line` variant the line under the selected tab is not painted. The tab list clips it, so the selected tab is shown by text colour only.',
    // zeno-tabs.ts:211: .tabs__panel has the fade animation. The panels are
    // slotted children (524) and never get that class.
    'The fade-in style for panels is never used, because slotted panels do not get the `tabs__panel` class.',
  ],
};

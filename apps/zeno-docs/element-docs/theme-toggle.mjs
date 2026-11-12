export default {
  category: 'Actions',

  examples: [
    {
      title: 'Basic',
      held: 'This example changes the theme of this whole site while it is on the page. Reload the page to put the site back in step.',
      description:
        'This button changes the theme of the whole page, not only this example. It writes `data-theme="light"` or `data-theme="dark"` on the `<html>` element. A toggle without a `theme` starts as `system`, and it removes `data-theme` from `<html>` when it is added to the page.',
      html: `<zeno-theme-toggle></zeno-theme-toggle>`,
    },
    {
      title: 'Variants',
      held: 'This example changes the theme of this whole site while it is on the page. Reload the page to put the site back in step.',
      description:
        'Each toggle changes the theme of the whole page. The toggles do not follow each other.',
      html: `<zeno-theme-toggle variant="default"></zeno-theme-toggle>
<zeno-theme-toggle variant="minimal"></zeno-theme-toggle>
<zeno-theme-toggle variant="outlined"></zeno-theme-toggle>`,
    },
    {
      title: 'Sizes',
      held: 'This example changes the theme of this whole site while it is on the page. Reload the page to put the site back in step.',
      description: 'Each toggle changes the theme of the whole page.',
      html: `<zeno-theme-toggle size="sm"></zeno-theme-toggle>
<zeno-theme-toggle size="md"></zeno-theme-toggle>
<zeno-theme-toggle size="lg"></zeno-theme-toggle>`,
    },
    {
      title: 'With the system option',
      held: 'This example changes the theme of this whole site while it is on the page. Reload the page to put the site back in step.',
      description:
        'With `show-system` the button goes through light, dark and system. This also changes the theme of the whole page. The `toggle` event carries the chosen preference, and `theme-change` carries the theme that is now in effect.',
      html: `<zeno-theme-toggle show-system></zeno-theme-toggle>
<p data-result>Preference: system</p>`,
      script: `document.querySelector('zeno-theme-toggle').addEventListener('toggle', event => {
  document.querySelector('[data-result]').textContent = 'Preference: ' + event.detail.theme;
});`,
    },
  ],

  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the button.' },
    {
      keys: ['Enter', 'Space'],
      action:
        'Changes the theme. With `show-system` it goes to the next of light, dark and system.',
    },
  ],

  accessibility: [
    'The control is a native `<button>`. Its `aria-label` is “Theme: light”, “Theme: dark” or “Theme: System (currently light)”. An `aria-label` on the element replaces that text.',
    'The button has `aria-pressed="true"` while the dark theme is in effect.',
    'While the preference is `system`, the element follows the operating system and updates when the system theme changes.',
    'With `prefers-reduced-motion: reduce` the hover movement and the loading rotation are turned off.',
  ],

  gaps: [
    // zeno-theme-toggle.ts:397 and 400: <zeno-icon name="sun"> and
    // name="moon". zeno-icon.ts:233-254: the registry has neither name.
    // Checked in Chromium with the built bundle: the button is an empty
    // circle.
    'The button shows no icon. It asks for the icons `sun` and `moon`, and neither is in the icon registry.',
    // zeno-theme-toggle.ts:237: theme defaults to 'system'. 254-266:
    // connectedCallback() calls updateCurrentTheme(), which calls
    // setTheme(this.theme) at 297. theme-utils.ts:62-63 removes data-theme
    // for 'system'.
    'The element does not read the theme that the page already has. When it connects, it writes its own `theme` to `<html>`. With the default `system`, this removes a `data-theme` that the page set before.',
    // zeno-theme-toggle.ts:291-302: resolvedTheme changes only in
    // updateCurrentTheme(). Nothing watches data-theme on <html>.
    'Two toggles on one page do not stay in step. A toggle does not notice when another toggle, or the page, changes `data-theme`.',
    // No storage call in zeno-theme-toggle.ts or lib/theme-utils.ts.
    'The choice is not saved. After a reload the theme is `system` again unless the page stores the value and sets `theme` itself.',
    // zeno-theme-toggle.ts:391-392: the label names the state and
    // aria-pressed gives the state again.
    'The button name changes with the state, and `aria-pressed` reports the state as well. A screen reader can read “Theme: dark, pressed”.',
    // zeno-theme-toggle.ts:364 and 367: fixed template strings.
    'The button names are fixed English text. The only way to change them is one `aria-label` on the element, which then stays the same in every state.',
    // zeno-theme-toggle.ts:241: animated = true with type Boolean.
    '`animated` is on by default and is a Boolean attribute, so HTML cannot turn it off. Set the `animated` property to `false` from script.',
    // zeno-theme-toggle.ts:172-174: pointer-events: none. 308: toggle()
    // returns early. 387-395: no disabled and no aria-busy on the button.
    'While `loading`, the button ignores clicks and keys, but it is not disabled and has no `aria-busy`. It still takes focus and reads as a normal button.',
  ],
};

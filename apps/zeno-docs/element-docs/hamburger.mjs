export default {
  category: 'Navigation',

  examples: [
    {
      title: 'Toggle',
      description:
        'A press switches `active` and fires `toggle` with the new state.',
      html: `<zeno-hamburger></zeno-hamburger>
<p data-result>The menu is closed.</p>`,
      script: `document.querySelector('zeno-hamburger').addEventListener('toggle', event => {
  document.querySelector('[data-result]').textContent =
    event.detail.active ? 'The menu is open.' : 'The menu is closed.';
});`,
    },
    {
      title: 'Variants',
      description:
        'Each variant moves from three bars to a cross in a different way. Press one to see it.',
      html: `<zeno-hamburger variant="basic"></zeno-hamburger>
<zeno-hamburger variant="spin"></zeno-hamburger>
<zeno-hamburger variant="squeeze"></zeno-hamburger>
<zeno-hamburger variant="vortex"></zeno-hamburger>
<zeno-hamburger variant="elastic"></zeno-hamburger>`,
    },
    {
      title: 'Sizes',
      html: `<zeno-hamburger size="sm"></zeno-hamburger>
<zeno-hamburger size="md"></zeno-hamburger>
<zeno-hamburger size="lg"></zeno-hamburger>`,
    },
    {
      title: 'Active and disabled',
      description: 'A disabled button does not toggle.',
      html: `<zeno-hamburger active></zeno-hamburger>
<zeno-hamburger disabled></zeno-hamburger>`,
    },
  ],

  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the button.' },
    {
      keys: ['Enter', 'Space'],
      action: 'Switches `active` and fires `toggle`.',
    },
  ],

  accessibility: [
    'Renders a native `<button>` in its shadow root.',
    'The button is named by `label`, “Menu” by default, or by an `aria-label` on the element. The name stays the same when the menu opens.',
    'The open state is exposed with `aria-expanded`.',
    'With reduced motion the bars change without a transition.',
    'The button is hidden when the page is printed.',
  ],

  gaps: [
    // zeno-hamburger.ts:358: this.ariaLabel is read in render; it is not a reactive property.
    'The `aria-label` is read when the button renders. Changing only `aria-label` later does not update the button until `active` or another property changes.',
  ],
};

export default {
  category: 'Navigation',

  examples: [
    {
      title: 'Basic',
      description:
        'Steps are set with the `steps` property. `current` is the index of the current step and starts at 0. Steps before it show a check mark.',
      html: `<zeno-stepper current="1"></zeno-stepper>`,
      script: `document.querySelector('zeno-stepper').steps = [
  { value: 'account', label: 'Account', description: 'Email and password' },
  { value: 'profile', label: 'Profile', description: 'Name and time zone' },
  { value: 'review', label: 'Review', description: 'Check your details' },
];`,
    },
    {
      title: 'Clickable steps',
      description:
        'With `clickable`, a click on a step makes it the current step. The `nextStep()` and `previousStep()` methods do the same from your own buttons. Each change sends a `change` event.',
      html: `<zeno-stepper clickable></zeno-stepper>
<p data-result>Step 1: Cart</p>
<zeno-button variant="outline">Back</zeno-button>
<zeno-button>Next</zeno-button>`,
      script: `const stepper = document.querySelector('zeno-stepper');
stepper.steps = [
  { value: 'cart', label: 'Cart' },
  { value: 'address', label: 'Address' },
  { value: 'payment', label: 'Payment' },
  { value: 'done', label: 'Done' },
];
stepper.addEventListener('change', event => {
  document.querySelector('[data-result]').textContent =
    'Step ' + (event.detail.current + 1) + ': ' + event.detail.step.label;
});
const buttons = document.querySelectorAll('zeno-button');
buttons[0].addEventListener('click', () => stepper.previousStep());
buttons[1].addEventListener('click', () => stepper.nextStep());`,
    },
    {
      title: 'Vertical',
      html: `<zeno-stepper orientation="vertical" current="1"></zeno-stepper>`,
      script: `document.querySelector('zeno-stepper').steps = [
  { value: 'upload', label: 'Upload the file', description: 'report.csv' },
  { value: 'check', label: 'Check the columns', description: 'Match each column to a field' },
  { value: 'import', label: 'Import', description: 'Add the rows to your list' },
];`,
    },
    {
      title: 'Sizes, icons and icon only',
      description:
        'A step can name an icon in its `icon` field. `icon-only` hides the titles and descriptions.',
      html: `<zeno-stepper size="sm" current="1"></zeno-stepper>
<zeno-stepper size="lg" current="1"></zeno-stepper>
<zeno-stepper icon-only current="1"></zeno-stepper>`,
      script: `document.querySelectorAll('zeno-stepper').forEach(stepper => {
  stepper.steps = [
    { value: 'account', label: 'Account', icon: 'user' },
    { value: 'settings', label: 'Settings', icon: 'settings' },
    { value: 'finish', label: 'Finish', icon: 'star' },
  ];
});`,
    },
    {
      title: 'Error and disabled steps',
      description:
        '`setStepError(index, true)` marks a step with an error. A step with `disabled: true` cannot become the current step.',
      html: `<zeno-stepper clickable current="1"></zeno-stepper>
<zeno-button variant="outline">Mark step 2 as failed</zeno-button>
<zeno-button variant="ghost">Clear the error</zeno-button>`,
      script: `const stepper = document.querySelector('zeno-stepper');
stepper.steps = [
  { value: 'details', label: 'Details' },
  { value: 'payment', label: 'Payment' },
  { value: 'invoice', label: 'Invoice', disabled: true },
];
const buttons = document.querySelectorAll('zeno-button');
buttons[0].addEventListener('click', () => stepper.setStepError(1, true));
buttons[1].addEventListener('click', () => stepper.setStepError(1, false));`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'With `clickable`, moves focus to each step that is not disabled, one after the other. Without `clickable`, no step can take focus.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Makes the focused step the current step.',
    },
    {
      keys: ['ArrowRight', 'ArrowDown'],
      action:
        'Makes the step after the focused step the current step. Focus stays where it is.',
    },
    {
      keys: ['ArrowLeft', 'ArrowUp'],
      action:
        'Makes the step before the focused step the current step. Focus stays where it is.',
    },
  ],

  accessibility: [
    'The steps are inside a `<div role="navigation">`. Its name is the `aria-label` of the element, or “Progress steps” when there is none.',
    'Each step is a native `<button>` whose `aria-label` is the step label. The current step has `aria-current="step"`.',
    'Without `clickable`, every step button has the native `disabled` attribute.',
    'The step label is rendered as an `<h3>` and the description as a `<p>` next to the button.',
    'With `prefers-reduced-motion: reduce` the transitions are turned off.',
  ],

  gaps: [
    // zeno-stepper.ts:446: role="navigation" on the wrapper. 480-482:
    // role="tab" and aria-selected on each button, with no tablist parent and
    // no tab panels.
    'Step buttons have `role="tab"` and `aria-selected`, but there is no `tablist` around them and there are no tab panels. They sit directly inside `role="navigation"`.',
    // zeno-stepper.ts:484: ?disabled=${isDisabled || !this.clickable}.
    'Without `clickable`, a stepper that only shows progress is a group of disabled buttons.',
    // zeno-stepper.ts:483: aria-label=${step.label} replaces the button
    // content. 412-426: the check and x icons are the only sign of the state;
    // zeno-icon.ts:204 hides an icon without a label.
    'The completed and error states are not given to assistive technology. Each button is named by the step label only, and the check and x icons have no text.',
    // zeno-stepper.ts:403: an error wins over 'active' in getStepStatus().
    // 455 and 481-482 take aria-current and aria-selected from 'active' only.
    'When the current step is marked with an error, it loses `aria-current="step"` and `aria-selected="true"`.',
    // zeno-stepper.ts:384-393: goToStep(index + 1) or goToStep(index - 1),
    // with no call to focus(). 476-488: no tabindex on the buttons.
    'The arrow keys change the current step but do not move focus, so a second press of the same key does nothing new. Every enabled step is its own tab stop.',
    // zeno-stepper.ts:251-258: the only rules for .stepper--label-bottom set
    // flex-direction on .stepper__indicator and a margin on .stepper__step.
    // .stepper__content is not moved. Checked in Chromium with the built
    // bundle: a stepper with label-bottom looks the same as one without.
    'The `label-bottom` attribute has no visible effect. The labels are below the buttons with or without it.',
    // zeno-stepper.ts:330-337: no check that index differs from current.
    '`goToStep()` sends `change` even when the step is already the current step.',
    // zeno-stepper.ts:334 returns for a disabled step; 343-352 call
    // goToStep(current + 1) and goToStep(current - 1).
    '`nextStep()`, `previousStep()` and the arrow keys stop at a disabled step. They do not skip over it.',
    // zeno-stepper.ts:507: <h3 class="stepper__title">.
    'Step labels are always `<h3>` elements. The heading level cannot be changed to fit the page.',
  ],
};

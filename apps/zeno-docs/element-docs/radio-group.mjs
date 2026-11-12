export default {
  category: 'Forms',

  examples: [
    {
      title: 'Basic group',
      description:
        'The `value` of the group picks the checked radio. The group fires one `input` and one `change` event when the choice changes.',
      html: `<zeno-radio-group label="Delivery" name="delivery" value="standard" helper-text="Express orders placed before noon arrive the next day.">
  <zeno-radio value="standard" label="Standard delivery"></zeno-radio>
  <zeno-radio value="express" label="Express delivery"></zeno-radio>
  <zeno-radio value="pickup" label="Pick up in store"></zeno-radio>
</zeno-radio-group>
<p data-result>Chosen: standard</p>`,
      script: `document.querySelector('zeno-radio-group').addEventListener('change', event => {
  document.querySelector('[data-result]').textContent = 'Chosen: ' + event.detail.value;
});`,
    },
    {
      title: 'Horizontal, and sizes',
      description: 'The `size` of the group is given to every radio in it.',
      html: `<zeno-radio-group label="Small" orientation="horizontal" size="sm" value="month">
  <zeno-radio value="month" label="Monthly"></zeno-radio>
  <zeno-radio value="year" label="Yearly"></zeno-radio>
</zeno-radio-group>
<zeno-radio-group label="Medium" orientation="horizontal" size="md" value="month">
  <zeno-radio value="month" label="Monthly"></zeno-radio>
  <zeno-radio value="year" label="Yearly"></zeno-radio>
</zeno-radio-group>
<zeno-radio-group label="Large" orientation="horizontal" size="lg" value="month">
  <zeno-radio value="month" label="Monthly"></zeno-radio>
  <zeno-radio value="year" label="Yearly"></zeno-radio>
</zeno-radio-group>`,
    },
    {
      title: 'Disabled',
      description:
        'A disabled group disables every radio. A single disabled radio is skipped by the arrow keys.',
      html: `<zeno-radio-group label="Plan" value="basic" disabled>
  <zeno-radio value="basic" label="Basic"></zeno-radio>
  <zeno-radio value="team" label="Team"></zeno-radio>
</zeno-radio-group>
<zeno-radio-group label="Seats" value="5">
  <zeno-radio value="5" label="5 seats"></zeno-radio>
  <zeno-radio value="10" label="10 seats" disabled></zeno-radio>
  <zeno-radio value="25" label="25 seats"></zeno-radio>
</zeno-radio-group>`,
    },
    {
      title: 'With an error',
      html: `<zeno-radio-group label="Plan" error="Choose a plan to continue.">
  <zeno-radio value="basic" label="Basic"></zeno-radio>
  <zeno-radio value="team" label="Team"></zeno-radio>
</zeno-radio-group>`,
    },
    {
      title: 'In a form',
      description:
        'The group is the form control: it sends one value under `name`. A `required` group blocks the submit until a radio is checked.',
      html: `<form>
  <zeno-radio-group label="Contact me by" name="contact" required>
    <zeno-radio value="email" label="Email"></zeno-radio>
    <zeno-radio value="phone" label="Phone"></zeno-radio>
    <zeno-radio value="post" label="Post"></zeno-radio>
  </zeno-radio-group>
  <zeno-button type="submit">Save changes</zeno-button>
  <zeno-button type="reset" variant="ghost">Reset</zeno-button>
  <p data-result>Nothing submitted yet.</p>
</form>`,
      script: `const form = document.querySelector('form');
form.addEventListener('submit', event => {
  event.preventDefault();
  const sent = [...new FormData(form)].map(([name, value]) => name + '=' + value);
  document.querySelector('[data-result]').textContent = 'Submitted: ' + sent.join('&');
});`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus into the group, to the checked radio or to the first enabled radio when none is checked. Tab again leaves the group.',
    },
    {
      keys: ['ArrowDown', 'ArrowRight'],
      action:
        'Moves focus to the next enabled radio and checks it. Wraps from the last radio to the first.',
    },
    {
      keys: ['ArrowUp', 'ArrowLeft'],
      action:
        'Moves focus to the previous enabled radio and checks it. Wraps from the first radio to the last.',
    },
    { keys: ['Space'], action: 'Checks the focused radio.' },
  ],

  accessibility: [
    'Renders a `<fieldset>` with `role="radiogroup"`. The `label` is its `<legend>` and names the group. Without `label`, the name comes from `aria-label` on the element.',
    'The group carries `aria-required` and `aria-invalid`. The helper text and the error text are linked with `aria-describedby`.',
    'The group has one Tab stop, as a set of native radios does.',
    'The group is the form control. It holds the value, checks `required` and resets. When a submit is refused, the message points at the first enabled radio.',
  ],

  gaps: [
    // zeno-radio-group.ts:135-136: queryAssignedElements only finds zeno-radio elements slotted directly; zeno-radio.ts:263-265: a radio with any zeno-radio-group ancestor stops submitting its own value.
    'Radios must be direct children of the group. A radio wrapped in another element is not managed by the group and is also left out of the form.',
    // zeno-radio-group.ts:168-177: checked and size are written to every radio on each update.
    'The `checked` and `size` attributes of a radio inside a group are overwritten. The choice comes only from the `value` of the group.',
    // zeno-radio-group.ts:209-221 filters on radio.disabled only; zeno-radio.ts:364 disables the inner input while loading, so focus() and click() do nothing.
    'The arrow keys do not skip a radio that is `loading`. Focus cannot move to it, so the keys stop at the radio before it.',
    // zeno-radio-group.ts:200-222: no branch for Home or End.
    'Home and End do not move to the first and last radio.',
    // mixins/form-field.ts:138 declares readonly; zeno-radio-group.ts never reads it.
    '`readonly` is declared but does nothing. The choice can still be changed.',
    // zeno-radio-group.ts:88-91: opacity 0.5 on the fieldset; zeno-radio.ts:57-60: opacity 0.5 on each disabled radio.
    'A disabled group is dimmed twice, once on the group and once on each radio, so the radios are much lighter than other disabled controls.',
    // zeno-radio-group.ts:240-249: the fieldset has no disabled or aria-disabled; only the radios are disabled (178).
    'A disabled group is not announced as disabled itself. Only the radios inside it are.',
    // zeno-radio-group.ts:159-161: fixed string.
    'The required message “Please select one of these options.” is English only. An `error` text replaces it.',
    // mixins/form-field.ts:305-310: the error div has no role="alert" or aria-live.
    'The error text is not a live region. An error that appears while the user is elsewhere is not announced.',
    // zeno-radio-group.ts:66-69: margin-left on .radio-group__required.
    'The gap before the required star uses `margin-left`, so it is on the wrong side in a right-to-left page.',
  ],
};

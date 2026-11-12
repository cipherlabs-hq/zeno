export default {
  category: 'Forms',

  examples: [
    {
      title: 'Label, placeholder and a start slot',
      description:
        'The `start` slot holds a short prefix or an icon in front of the text.',
      html: `<zeno-input label="Email" type="email" placeholder="ada@example.com"></zeno-input>
<zeno-input label="Amount" type="number" value="25">
  <span slot="start">$</span>
</zeno-input>
<zeno-input label="Search orders" type="search">
  <zeno-icon slot="start" name="search"></zeno-icon>
</zeno-input>`,
    },
    {
      title: 'Variants',
      description:
        '`outlined` is the default. `ghost` has no border and no side padding.',
      html: `<zeno-input label="Outlined" variant="outlined" value="Ada Lovelace"></zeno-input>
<zeno-input label="Filled" variant="filled" value="Ada Lovelace"></zeno-input>
<zeno-input label="Ghost" variant="ghost" value="Ada Lovelace"></zeno-input>`,
    },
    {
      title: 'Sizes',
      html: `<zeno-input label="Small" size="sm" placeholder="32px high"></zeno-input>
<zeno-input label="Medium" size="md" placeholder="40px high"></zeno-input>
<zeno-input label="Large" size="lg" placeholder="48px high"></zeno-input>`,
    },
    {
      title: 'States',
      description:
        'An `error` marks the field invalid and shows the text under it. `clearable` shows a clear button while the field has a value.',
      html: `<zeno-input label="Required" required placeholder="Your full name"></zeno-input>
<zeno-input label="Disabled" value="Ada Lovelace" disabled></zeno-input>
<zeno-input label="Read only" value="INV-2041" readonly></zeno-input>
<zeno-input label="With an error" value="ada@example" error="Enter a full email address."></zeno-input>
<zeno-input label="Success" value="ada@example.com" success></zeno-input>
<zeno-input label="Clearable" value="Quarterly report" clearable></zeno-input>
<zeno-input label="Loading" value="Checking the name" loading></zeno-input>`,
    },
    {
      title: 'In a form',
      description:
        'The value is sent under `name`. Enter in a field submits the form, and a `required` field blocks the submit while it is empty.',
      html: `<form>
  <zeno-input name="email" type="email" label="Email" required></zeno-input>
  <zeno-input name="seats" type="number" label="Seats" min="1" max="20" value="2"></zeno-input>
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
        'Moves focus to the text field. The clear button and the password button are skipped.',
    },
    {
      keys: ['Enter'],
      action:
        'Fires `enter`, then submits the form that holds the input. Cancel the `enter` event to stop the submit.',
    },
  ],

  accessibility: [
    'Renders a native `<input>` in its shadow root, so typing, selection and the on-screen keyboard for each `type` come from the browser.',
    'The `label` text is a real `<label>` for the input. Without `label`, the name comes from `aria-label` on the element or from an outside `<label for>`, and a click on that outside label focuses the input.',
    'The input always carries `aria-invalid`. When an error shows, `aria-describedby` points at the error text.',
    'Focus on the element goes to the inner input, and the required star is hidden from assistive technology.',
    'Enter is ignored while an input method editor is composing text.',
  ],

  gaps: [
    // types.ts:92: InputVariant = 'outlined' | 'filled' | 'underlined'; zeno-input.ts:100-114 styles .input--outlined, .input--filled, .input--ghost.
    'The `variant` type lists `underlined`, but there is no style for it, so it looks like a plain bordered field. The stylesheet has a `ghost` variant that the type does not list.',
    // zeno-input.ts:571-574 asks for 'eye' and 'eye-off'; zeno-icon.ts:233-252 does not register them.
    'With `show-password-toggle` the button to show the password is empty. It uses the icon names `eye` and `eye-off`, which `zeno-icon` does not have.',
    // zeno-input.ts:549 and 565: tabindex="-1" on both buttons; 443-453: the only key handled is Enter.
    'The clear button and the password button cannot be reached with the keyboard, and no key clears the field or shows the password.',
    // zeno-input.ts:550, 566-568: fixed strings.
    'The names “Clear input”, “Show password” and “Hide password” are English only and have no property.',
    // zeno-input.ts:244-246 makes the text transparent; 534-541 adds a spinner; 505-531 sets no aria-busy and no readonly.
    '`loading` hides the typed text and shows a spinner, but the field can still be edited and the input has no `aria-busy`. The spinner is announced as “Loading”, in English.',
    // zeno-input.ts:235-241, 483: border colour only.
    '`success` only changes the border colour. Nothing tells assistive technology or people who cannot see the colour.',
    // zeno-input.ts:337-339, 516-518: min, max and step are type Number.
    '`min`, `max` and `step` are numbers. A date or time string for `type="date"`, `time` or `datetime-local`, and `step="any"`, become `NaN`.',
    // zeno-input.ts:126-136: .input__icon has pointer-events: none; 150-155: .input__icon--clickable is never applied in render (494-503, 579-588).
    'Content in the `start` and `end` slots cannot be clicked. A button placed there does not work with a pointer.',
    // zeno-input.ts:582: the end slot is hidden while the clear button or the password button shows.
    'The `end` slot is hidden while the clear button or the password button shows.',
    // mixins/form-field.ts:305-310: the error div has no role="alert" or aria-live.
    'The error text is not a live region. An error that appears while the user is elsewhere is not announced.',
    // mixins/form-field.ts:286-288: describedBy is only the error id; the element has no help text property.
    'There is no help text. `aria-describedby` can only point at the error.',
    // zeno-input.ts:117-123, 142-148: left, right, padding-left and padding-right.
    'The slots and their padding use left and right. In a right-to-left page the `start` slot stays on the left.',
    // zeno-input.ts:553, 573: size="16"; zeno-icon.ts:33-51 styles xs to xl only.
    'The element gives its icons the size `16`, which `zeno-icon` does not have, so they render at the default size.',
  ],
};

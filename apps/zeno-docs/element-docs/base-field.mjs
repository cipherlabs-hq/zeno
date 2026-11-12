export default {
  category: 'Forms',

  examples: [
    {
      title: 'Label and help text',
      description:
        'The field draws a label and help text around the control you put inside. The control in these examples has its own `aria-label`, because the field’s label does not reach it. See the gaps below.',
      html: `<zeno-base-field label="Email" help-text="We only use it to send receipts.">
  <input type="email" aria-label="Email" placeholder="ada@example.com" />
</zeno-base-field>`,
    },
    {
      title: 'Error, success and warning',
      description:
        'A message shows only when its flag and its text are both set. An error wins over a success, and a success wins over a warning.',
      html: `<zeno-base-field label="File name" invalid error-message="Enter a file name.">
  <input type="text" aria-label="File name" aria-invalid="true" />
</zeno-base-field>
<zeno-base-field label="User name" success success-message="This name is free.">
  <input type="text" aria-label="User name" value="ada" />
</zeno-base-field>
<zeno-base-field label="Password" warning warning-message="Short passwords are easy to guess.">
  <input type="password" aria-label="Password" value="12345" />
</zeno-base-field>`,
    },
    {
      title: 'Required, and text after the label',
      description:
        '`required` adds a mark to the label. The `label-suffix` slot puts content after the label text.',
      html: `<zeno-base-field label="Project name" required>
  <input type="text" aria-label="Project name" required />
</zeno-base-field>
<zeno-base-field label="Notes">
  <span slot="label-suffix">(optional)</span>
  <textarea aria-label="Notes" rows="2"></textarea>
</zeno-base-field>`,
    },
    {
      title: 'Layout and sizes',
      description:
        '`layout="horizontal"` puts the label beside the control. `size` changes the label and message text.',
      html: `<zeno-base-field layout="horizontal" label="Language" help-text="Used for dates and numbers.">
  <select aria-label="Language">
    <option>English</option>
    <option>German</option>
  </select>
</zeno-base-field>
<zeno-base-field size="sm" label="Small" help-text="Small help text.">
  <input type="text" aria-label="Small" />
</zeno-base-field>
<zeno-base-field size="lg" label="Large" help-text="Large help text.">
  <input type="text" aria-label="Large" />
</zeno-base-field>`,
    },
  ],

  keyboard: [],

  accessibility: [
    'The label is a native `<label>` in the shadow root. `label-for` sets its `for` attribute.',
    'An error message has `role="alert"` and `aria-live="assertive"`. Success and warning messages have `role="status"` and `aria-live="polite"`.',
    'The message icon is hidden from assistive technology.',
    'The field does not take focus and handles no keys. Focus and keyboard behaviour belong to the control you slot in.',
  ],

  gaps: [
    // zeno-base-field.ts:298-305: <label for> is in the shadow root, the control is in the light DOM.
    'The label is not connected to the slotted control. `for` cannot point from the shadow root to an element outside it, so the control gets no name from the label and a click on the label does not focus it. Give the control its own `aria-label`.',
    // zeno-base-field.ts:311-332: `.assignedElements=${fn}` replaces the slot's method with a function that nothing calls.
    'The field means to copy `aria-describedby`, `required`, `disabled` and `aria-invalid` to the slotted control, but that code never runs. It is assigned over the slot’s `assignedElements` method and nothing calls it. Set these attributes on the control yourself.',
    // zeno-base-field.ts:249-269, 338, 351: the help and message ids are inside the shadow root.
    'Even if that code ran, `aria-describedby` could not work. The help text and the message are in the shadow root, and the control outside it cannot refer to their ids. Help text is never tied to the control.',
    // zeno-base-field.ts:201-202: Boolean property that defaults to true.
    '`show-message-icon` is on by default, and a Boolean attribute cannot be set to false in HTML. It can only be turned off from JavaScript with `showMessageIcon = false`.',
    // zeno-base-field.ts:296: the label is not rendered at all when `hideLabel` is set.
    '`hide-label` removes the label from the page. It is not kept for screen readers.',
    // zeno-base-field.ts:323-325 never runs; base/zeno-element.ts:32-35 only sets pointer-events: none.
    '`disabled` dims the label and blocks the mouse, but the slotted control is not disabled. It can still be reached and changed with the keyboard.',
    // zeno-base-field.ts:60-62, 289: the mark is `::after { content: '*' }` on the label; 320-322 never runs.
    '`required` only draws the mark on the label. It does not make the control required.',
    // components/lit/index.ts:19 is the only reference: no other element imports base-field.
    'No other Zeno form element uses this field. `zeno-input`, `zeno-select` and the others draw their own label and error text.',
  ],
};

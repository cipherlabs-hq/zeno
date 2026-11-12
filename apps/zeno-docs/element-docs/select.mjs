export default {
  category: 'Forms',

  examples: [
    {
      title: 'Basic',
      description:
        'Options are set with the `options` property. Each option has a `value`, a `label` and, when needed, `disabled`.',
      html: `<zeno-select label="Country" placeholder="Choose a country"></zeno-select>`,
      script: `document.querySelector('zeno-select').options = [
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'us', label: 'United States' },
  { value: 'aq', label: 'Antarctica', disabled: true },
];`,
    },
    {
      title: 'Search, clear and multiple',
      description:
        'With `searchable` the list has a field that filters the options. With `clearable` a button removes the selection. With `multiple` the list stays open and the `value` property is one string with the chosen values separated by commas.',
      html: `<zeno-select label="Time zone" value="utc" searchable clearable></zeno-select>
<zeno-select label="Working days" value="mon,wed" multiple clearable></zeno-select>`,
      script: `const selects = document.querySelectorAll('zeno-select');
selects[0].options = [
  { value: 'utc', label: 'UTC' },
  { value: 'lisbon', label: 'Lisbon' },
  { value: 'nairobi', label: 'Nairobi' },
  { value: 'tokyo', label: 'Tokyo' },
  { value: 'lima', label: 'Lima' },
];
selects[1].options = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
];`,
    },
    {
      title: 'Sizes and variants',
      html: `<zeno-select label="Small" size="sm" value="pdf"></zeno-select>
<zeno-select label="Medium" size="md" value="pdf"></zeno-select>
<zeno-select label="Large" size="lg" value="pdf"></zeno-select>
<zeno-select label="Filled" variant="filled" value="pdf"></zeno-select>`,
      script: `document.querySelectorAll('zeno-select').forEach(select => {
  select.options = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
    { value: 'txt', label: 'Plain text' },
  ];
});`,
    },
    {
      title: 'States',
      description:
        'A disabled or loading select cannot be opened. The `error` text shows below the field and marks it as invalid.',
      html: `<zeno-select label="Disabled" value="weekly" disabled></zeno-select>
<zeno-select label="Loading" placeholder="Loading options" loading></zeno-select>
<zeno-select label="With an error" error="Choose how often to send the report."></zeno-select>
<zeno-select label="Success" value="weekly" success></zeno-select>`,
      script: `document.querySelectorAll('zeno-select').forEach(select => {
  select.options = [
    { value: 'daily', label: 'Every day' },
    { value: 'weekly', label: 'Every week' },
    { value: 'monthly', label: 'Every month' },
  ];
});`,
    },
    {
      title: 'In a form',
      description:
        'A required select with no value stops the submit. After that the select shows a message below the field.',
      html: `<form>
  <zeno-select name="plan" label="Plan" placeholder="Choose a plan" required></zeno-select>
  <zeno-button type="submit">Continue</zeno-button>
  <p data-result>Nothing submitted yet.</p>
</form>`,
      script: `document.querySelector('zeno-select').options = [
  { value: 'free', label: 'Free' },
  { value: 'team', label: 'Team' },
  { value: 'company', label: 'Company' },
];
const form = document.querySelector('form');
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
        'Moves focus to the select. When the list is open, closes it and moves focus on.',
    },
    {
      keys: ['ArrowDown', 'ArrowUp'],
      action:
        'Opens the list. When the list is open, moves to the next or previous option. Disabled options are skipped and the movement wraps around.',
    },
    {
      keys: ['Home', 'End'],
      action:
        'When the list is open, moves to the first or last option that is not disabled. In the search field these keys move the text cursor.',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'Opens the list. When the list is open, chooses the active option. With `multiple` the list stays open. In the search field, Space types a space.',
    },
    {
      keys: ['Escape'],
      action: 'Closes the list and returns focus to the trigger.',
    },
  ],

  accessibility: [
    'The trigger is a native `<button>` with `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`. The list has `role="listbox"`, and each option has `role="option"` with `aria-selected` and, when disabled, `aria-disabled`.',
    'Focus stays on the trigger while the list is open, and the active option is given with `aria-activedescendant`. With `searchable`, focus moves to the search field, which is named “Filter options” and carries `aria-activedescendant` itself.',
    'The `label` attribute renders a `<label>` for the trigger. Without it, the name comes from an outside `<label for>` or from `aria-label` on the element, and after that from the `placeholder`.',
    'When the select is invalid, the trigger has `aria-invalid="true"` and `aria-describedby` points at the error text. The error text is not a live region. The trigger also has `aria-required`.',
    'The list opens in the top layer with the popover API. It closes on a press outside, when focus leaves the element, and on Escape. Escape is cancelled, so a dialog around the select stays open.',
  ],

  gaps: [
    // types.ts:92: InputVariant is 'outlined' | 'filled' | 'underlined'.
    // zeno-select.ts:100-114: styles exist for outlined, filled and ghost only.
    'The `variant` type lists `underlined`, but the element has no styles for it. It has styles for `ghost`, which the type does not list.',
    // zeno-select.ts:248-249: width and height are 20px. axe-core reports it
    // on this page (rule target-size).
    'The clear button is 20 by 20 pixels. WCAG 2.2 asks for a target of at least 24 by 24 pixels.',
    // zeno-select.ts:565-609: the key switch has no case for letter keys.
    'Typing a letter does not move to the option that starts with it. Only `searchable` gives a way to find an option by text.',
    // form-field.ts:138 declares readonly. zeno-select.ts:474: open() checks
    // isDisabled and loading only, and render() never reads readonly.
    'The `readonly` attribute does nothing. A read-only select still opens and its value can still be changed.',
    // zeno-select.ts:180-186 and 650: success only sets a border colour class.
    'The `success` state is shown by border colour only. It adds no text and no ARIA state.',
    // zeno-select.ts:456 'Please select an item in the list.', 713 'Clear
    // selection', 738 'Filter options', 758 'Options': fixed strings, no
    // property to change them.
    'The clear button label, the search field label, the fallback list label and the required message are fixed English strings. They cannot be translated.',
    // zeno-select.ts:676 and 741 set aria-controls="listbox"; 751-795 render
    // the listbox only when options.length > 0, else a plain div.
    'When no option matches, the listbox is not rendered. `aria-controls` then points at nothing, and the `empty-text` message is a plain `<div>` with no live region.',
    // zeno-select.ts:432 splits the value on ','; 515-518 joins with ','.
    'With `multiple`, the value is joined and split on commas. An option whose `value` contains a comma cannot be selected correctly.',
  ],
};

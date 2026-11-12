export default {
  category: 'Forms',

  examples: [
    {
      title: 'Basic',
      description:
        'The control is a button that opens a calendar. `value` is always an ISO date, `YYYY-MM-DD`, whatever format is shown.',
      html: `<zeno-date-picker label="Start date"></zeno-date-picker>
<zeno-date-picker label="Due date" value="2031-03-09"></zeno-date-picker>
<zeno-date-picker label="Date of birth" placeholder="Choose your date of birth"></zeno-date-picker>`,
    },
    {
      title: 'Format and first day of the week',
      description:
        '`format` builds the shown text from `DD`, `MM` and `YYYY`. `first-day-of-week` takes 0 for Sunday to 6 for Saturday.',
      html: `<zeno-date-picker label="Due date" value="2031-03-09" format="DD.MM.YYYY" first-day-of-week="1"></zeno-date-picker>
<zeno-date-picker label="Due date" value="2031-03-09" format="YYYY-MM-DD"></zeno-date-picker>`,
    },
    {
      title: 'Limits',
      description:
        'Days before `min`, after `max` or listed in `disabled-dates` cannot be chosen. `hide-today-button` removes the “Today” button.',
      html: `<zeno-date-picker
  label="Delivery date"
  value="2031-03-12"
  min="2031-03-03"
  max="2031-03-28"
  disabled-dates='["2031-03-17", "2031-03-18"]'
  hide-today-button
></zeno-date-picker>`,
    },
    {
      title: 'Sizes and states',
      html: `<zeno-date-picker size="sm" label="Small"></zeno-date-picker>
<zeno-date-picker size="lg" label="Large"></zeno-date-picker>
<zeno-date-picker label="Disabled" value="2031-03-09" disabled></zeno-date-picker>
<zeno-date-picker label="Read only" value="2031-03-09" readonly></zeno-date-picker>
<zeno-date-picker label="Due date" error="Choose a date after the start date."></zeno-date-picker>`,
    },
    {
      title: 'In a form',
      description:
        'The form gets the ISO date under `name`. A `required` picker with no date stops the submit and shows its message. `change` carries the value and a `Date` in `event.detail`.',
      html: `<form>
  <zeno-date-picker name="due" label="Due date" required></zeno-date-picker>
  <zeno-button type="submit">Save changes</zeno-button>
  <zeno-button type="reset" variant="ghost">Reset</zeno-button>
  <p data-result>Nothing submitted yet.</p>
</form>`,
      script: `const form = document.querySelector('form');
const result = document.querySelector('[data-result]');
document.querySelector('zeno-date-picker').addEventListener('change', event => {
  result.textContent = 'Chosen: ' + event.detail.value;
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const sent = [...new FormData(form)].map(([name, value]) => name + '=' + value);
  result.textContent = 'Submitted: ' + sent.join('&');
});`,
    },
  ],

  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the date button.' },
    {
      keys: ['Enter', 'Space'],
      action:
        'On the date button, opens the calendar and moves focus to the chosen day, or to today. Pressed again on the button, closes it.',
    },
    { keys: ['ArrowDown'], action: 'On the date button, opens the calendar.' },
    {
      keys: ['ArrowLeft', 'ArrowRight'],
      action: 'In the calendar, moves one day back or forward.',
    },
    {
      keys: ['ArrowUp', 'ArrowDown'],
      action: 'In the calendar, moves one week back or forward.',
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves to the first or the last day of the week.',
    },
    {
      keys: ['PageUp', 'PageDown'],
      action: 'Moves one month back or forward.',
    },
    {
      keys: ['Shift+PageUp', 'Shift+PageDown'],
      action: 'Moves one year back or forward.',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'On a day, chooses it, closes the calendar and returns focus to the date button.',
    },
    {
      keys: ['Tab'],
      action:
        'In the calendar, moves between the previous month button, the next month button, the day grid and “Today”. The grid is one tab stop. Leaving the picker closes the calendar.',
    },
    {
      keys: ['Escape'],
      action:
        'Closes the calendar and returns focus to the date button. A dialog around the picker stays open.',
    },
  ],

  accessibility: [
    'The control is a native `<button>` with `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`. Its name is the label and the shown date together, for example “Due date, 03/09/2031”. A `<label for>` outside the element also names it.',
    'The calendar has `role="dialog"` with the name “Choose a date” and opens in the top layer. A press outside it closes it.',
    'Every day is a native `<button>` named with the full date in the language of the page. Today has `aria-current="date"`, the chosen day has `aria-pressed="true"`, and days that cannot be chosen are disabled.',
    'The month title is a polite live region, so a change of month is announced. Month and weekday names follow the closest `lang` attribute.',
    'While the error text shows, `aria-describedby` on the date button points at it. Transitions are turned off when the user asks for reduced motion.',
  ],

  gaps: [
    // zeno-date-picker.ts:636-660: the control is a <button>, not an <input>.
    'A date cannot be typed. The only way to enter one is to pick it in the calendar, which is slow for dates far away, such as a date of birth. There is no way to jump to a year except Shift+PageUp and Shift+PageDown.',
    // zeno-date-picker.ts:549-566: selectDate and selectToday are the only ways the user changes the value.
    'A chosen date cannot be cleared by the user. There is no clear button.',
    // zeno-date-picker.ts:668, 675, 690, 755, 409-430: literals.
    'The texts “Choose a date”, “Previous month”, “Next month” and “Today” and the validation messages are English and cannot be changed, while the month and day names follow the language of the page.',
    // zeno-date-picker.ts:568-573: three plain replace() calls.
    '`format` knows only `DD`, `MM` and `YYYY`, always as numbers with leading zeros. Month names and two-digit years are not possible, and the format does not follow the language of the page.',
    // zeno-date-picker.ts:636-648: the button has no aria-required and no aria-invalid; mixins/form-field.ts:296-300 hides the asterisk.
    'The date button does not say that it is required or invalid. The asterisk is hidden from assistive technology and the button has no `aria-required` and no `aria-invalid`.',
    // zeno-date-picker.ts:446, 643: open() returns early for readonly; the button is rendered the same.
    'A `readonly` picker looks like a normal one and gives no sign that it is read only. Its button can still be pressed and keeps `aria-haspopup`, but nothing opens.',
    // zeno-date-picker.ts:662-670: role="dialog" on a popover="manual" element; no focus trap.
    'The calendar is a dialog that does not keep focus inside. Tab from its last button leaves the picker and closes the calendar.',
    // zeno-date-picker.ts:491-508, 731-732: moveFocusedDay does not skip disabled days, and a disabled <button> cannot take focus.
    'The arrow keys do not skip days that cannot be chosen. The position moves onto the disabled day, but focus cannot follow it, so each key press seems to do nothing until the position reaches a day that can be chosen again. Past `min` or `max` that never happens.',
    // mixins/form-field.ts:305-310: the error <div> has no role and no aria-live.
    'The error text is not a live region. A screen reader reads it when focus is on the date button, but does not announce it when it appears.',
  ],
};

export default {
  category: 'Forms',

  examples: [
    {
      title: 'Basic',
      description:
        'The `label` attribute renders a label above the field. `rows` sets the height in lines.',
      html: `<zeno-textarea label="Notes" placeholder="Add a note for your team" rows="4"></zeno-textarea>`,
    },
    {
      title: 'Sizes and variants',
      html: `<zeno-textarea size="sm" label="Small" value="Small text"></zeno-textarea>
<zeno-textarea size="md" label="Medium" value="Medium text"></zeno-textarea>
<zeno-textarea size="lg" label="Large" value="Large text"></zeno-textarea>
<zeno-textarea variant="outlined" label="Outlined" value="The default variant"></zeno-textarea>
<zeno-textarea variant="filled" label="Filled" value="A filled background"></zeno-textarea>`,
    },
    {
      title: 'Auto resize, counter and clear button',
      description:
        'With `auto-resize` the field grows with its text. `maxlength` limits the text and shows a counter. `show-count` shows a counter with no limit. With `clearable`, a clear button shows when the pointer is over the field or the field has focus.',
      html: `<zeno-textarea label="Grows with the text" auto-resize rows="2" value="Type a few lines here."></zeno-textarea>
<zeno-textarea label="Short description" maxlength="80" value="A weekly report for the sales team."></zeno-textarea>
<zeno-textarea label="Comment" show-count clearable resize="none" value="Looks good to me."></zeno-textarea>`,
    },
    {
      title: 'States',
      description:
        'The `error` text shows below the field. `success` and `loading` only change how the field looks.',
      html: `<zeno-textarea label="Disabled" value="You cannot change this text." disabled></zeno-textarea>
<zeno-textarea label="Read only" value="You can select this text but not change it." readonly></zeno-textarea>
<zeno-textarea label="With an error" value="Too short" error="Write at least 20 characters."></zeno-textarea>
<zeno-textarea label="Success" value="This description is long enough." success></zeno-textarea>
<zeno-textarea label="Loading" loading></zeno-textarea>`,
    },
    {
      title: 'In a form',
      description:
        'The value is sent under `name`. Submit the empty form to see the message for a required field.',
      html: `<form>
  <zeno-textarea name="message" label="Message" rows="3" required></zeno-textarea>
  <zeno-button type="submit">Send</zeno-button>
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
    { keys: ['Tab'], action: 'Moves focus to the text field.' },
    {
      keys: ['Enter'],
      action: 'Adds a new line. It does not submit the form.',
    },
  ],

  accessibility: [
    'The control is a native `<textarea>`. Typing, selection and the keys come from it.',
    'The `label` attribute renders a `<label>` for the field. Without it, the name comes from an outside `<label for>` or from `aria-label` on the element.',
    'A required field shows `*` after the label. The mark is hidden from assistive technology, and the native `required` attribute is set on the field.',
    'When the field is invalid, it has `aria-invalid="true"` and `aria-describedby` points at the error text.',
    '`disabled` and `readonly` set the native attributes with the same names on the field.',
  ],

  gaps: [
    // types.ts:92: InputVariant = 'outlined' | 'filled' | 'underlined'.
    // zeno-textarea.ts:95-109: styles for outlined, filled and ghost.
    'The `variant` type lists `underlined`, but the element has no styles for it. The element has styles for `ghost`, which the type does not list.',
    // zeno-textarea.ts:459: tabindex="-1" on the clear button. 223-231: it is
    // shown only on hover or while the textarea has focus.
    'The clear button has `tabindex="-1"`, so it cannot be reached with the keyboard.',
    // zeno-textarea.ts:460: aria-label="Clear textarea".
    'The clear button label is the fixed English text “Clear textarea”. No attribute changes it.',
    // zeno-textarea.ts:239-241: .textarea--loading sets color: transparent.
    // 432-433: only disabled and readonly reach the field; no aria-busy in
    // render (418-488).
    'While `loading`, the text is made transparent but the field can still be edited. The field has no `aria-busy`.',
    // zeno-textarea.ts:179-181 and 414: success only adds a border colour.
    'The `success` state is shown by the border colour only. No text or icon says that the value is good.',
    // zeno-textarea.ts:436: aria-describedby holds the error id only.
    // 475-483: the counter is a plain <span> with no id and no live region.
    'The character counter is not linked to the field and is not a live region, so assistive technology does not read it.',
    // zeno-textarea.ts:471: this.showCount || this.maxlength.
    'The counter shows whenever `maxlength` is set. It cannot be turned off for a field with a limit.',
  ],
};

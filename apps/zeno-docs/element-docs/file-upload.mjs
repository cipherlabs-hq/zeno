export default {
  category: 'Forms',

  examples: [
    {
      title: 'One file',
      description:
        'Without `multiple` the control keeps one file. Choosing another file replaces it.',
      html: `<zeno-file-upload label="Passport scan" name="passport"></zeno-file-upload>`,
    },
    {
      title: 'Several files with limits',
      description:
        '`max-size` is in bytes. A file that is refused only fires `file-error`, so the page has to show the message.',
      html: `<zeno-file-upload
  label="Receipts"
  name="receipts"
  multiple
  accept="image/*,.pdf"
  max-size="1048576"
  max-files="3"
></zeno-file-upload>
<p data-result>No file was refused.</p>`,
      script: `const upload = document.querySelector('zeno-file-upload');
upload.addEventListener('file-error', event => {
  document.querySelector('[data-result]').textContent =
    event.detail.file.name + ': ' + event.detail.error;
});`,
    },
    {
      title: 'Compact, with your own text',
      description:
        '`upload-text`, `browse-text` and `hint` replace the default English text.',
      html: `<zeno-file-upload
  label="Profile photo"
  compact
  size="sm"
  accept="image/*"
  upload-text="Drag a photo here or"
  browse-text="choose a file"
  hint="PNG or JPEG"
></zeno-file-upload>`,
    },
    {
      title: 'Disabled and invalid',
      html: `<zeno-file-upload label="Signed contract" disabled></zeno-file-upload>
<zeno-file-upload label="Proof of address" error="Upload a file that is less than 3 months old."></zeno-file-upload>`,
    },
    {
      title: 'In a form',
      description:
        'The files are sent under `name`. A `required` control blocks the submit until a file is chosen.',
      html: `<form>
  <zeno-file-upload label="Cover letter" name="letter" accept=".pdf" required></zeno-file-upload>
  <zeno-button type="submit">Send application</zeno-button>
  <p data-result>Nothing submitted yet.</p>
</form>`,
      script: `const form = document.querySelector('form');
form.addEventListener('submit', event => {
  event.preventDefault();
  const names = new FormData(form).getAll('letter').map(file => file.name);
  document.querySelector('[data-result]').textContent = 'Submitted: ' + names.join(', ');
});`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to the browse button, then to the remove button of each file in the list.',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'On the browse button, opens the file chooser of the browser. On a remove button, removes that file.',
    },
  ],

  accessibility: [
    'The control is a native `<button>` in the shadow root. The area around it only adds a larger target for the pointer and for dropped files, and is not focusable.',
    'The button is named by the label and the visible text together, for example “Passport scan: Drop files here or browse”. The label comes from `label`, from `aria-label` or from an outside `<label for>`.',
    'The hint is linked to the button with `aria-describedby`. When an error shows, its text is linked the same way.',
    'Each file in the list has a native remove button named “Remove” and the file name. After a file is removed, focus moves to the browse button.',
    'A `disabled` or `readonly` control disables the browse button and ignores dropped files.',
  ],

  gaps: [
    // zeno-file-upload.ts:803, 664-678, 683-694 use 'upload-cloud', 'image', 'film', 'music', 'file-text', 'file', 'check-circle', 'x-circle', 'upload'; zeno-icon.ts:233-252 registers none of them.
    'The drop area icon, the file type icons and the status icons use icon names that `zeno-icon` does not have. They show nothing unless the page registers those names. Only the remove icon is built in.',
    // zeno-file-upload.ts:714, 752, 803: size="20", "16", "48"; zeno-icon.ts:33-51 styles xs, sm, md, lg, xl only.
    'The element gives its icons the sizes `48`, `20` and `16`, which `zeno-icon` does not have, so all of them render at the default size.',
    // zeno-file-upload.ts:497-510: emitEvent('file-error') and nothing else.
    'A file that is too large, of the wrong type or over `max-files` is dropped silently. The element fires `file-error` but shows and announces nothing.',
    // zeno-file-upload.ts:503-510: break after the first file over the limit.
    'When a selection goes over `max-files`, only the first extra file gets a `file-error` event. The rest are dropped without one.',
    // zeno-file-upload.ts:847-859: plain div list, no role or aria-live; 568-578.
    'Nothing announces that a file was added or removed. The file list has no list role and no live region.',
    // zeno-file-upload.ts:733-739: plain div with a width; no role="progressbar" or value.
    'The upload progress bar is a plain `div`. It has no `progressbar` role and no value for assistive technology.',
    // zeno-file-upload.ts:209-211 styles .file-item--success; 700-703 never sets that class; the status icon at 708-715 has no label.
    'A finished upload is marked only by a status icon that has no label. The success colour in the stylesheet is never applied. Only a failed upload gets text.',
    // zeno-file-upload.ts:745-753: the remove button has no disabled binding.
    'The remove buttons still work when the control is `disabled` or `readonly`.',
    // zeno-file-upload.ts:568-578 and 431: the XMLHttpRequest is local to uploadFile and is not aborted.
    'Removing a file while it uploads does not stop the upload.',
    // zeno-file-upload.ts:421-422, 528-530.
    '`auto-upload` without `upload-url` does nothing and gives no warning.',
    // zeno-file-upload.ts:775-777: the default hint is 'Single file only' unless `multiple`.
    'For a single-file control the default hint is “Single file only”. It does not show the accepted types, even when `accept` is set.',
    // zeno-file-upload.ts:775-777, 830, 507, 745-753 and the validateFile messages at 535-563; required message at 387-389.
    'Several strings are English only and have no property: the default hints, “Max size”, “Remove”, the `file-error` messages and the required message “Please select a file.”',
    // zeno-file-upload.ts:784-789: role="group" with aria-disabled and no aria-label or aria-labelledby.
    'The wrapper has `role="group"` but no accessible name.',
    // mixins/form-field.ts:305-310: the error div has no role="alert" or aria-live.
    'The error text is not a live region. It is only read when focus is on the browse button.',
  ],
};

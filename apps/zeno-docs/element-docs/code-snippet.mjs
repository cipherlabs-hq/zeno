export default {
  category: 'Data display',

  examples: [
    {
      title: 'Single line',
      description:
        'A URL, a key or a short command. A long line scrolls sideways. The button copies the text and says “Copied”.',
      html: `<zeno-code-snippet label="Base URL">https://api.example.com/v1</zeno-code-snippet>`,
    },
    {
      title: 'Several lines',
      description:
        '`type="multi"` keeps the line breaks as written. The indentation of the markup around the text is not copied.',
      html: `<zeno-code-snippet type="multi" label="Example request">
curl -H "X-API-Key: $KEY" \\
  "https://api.example.com/v1/facilities?q=taco"
</zeno-code-snippet>`,
    },
    {
      title: 'Wrapped',
      description: '`wrap` breaks long lines instead of scrolling.',
      html: `<zeno-code-snippet type="multi" wrap>https://api.example.com/v1/facilities?q=taco&page_size=50&sort=score_desc&jurisdiction=la_county</zeno-code-snippet>`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves to the code, which then scrolls with the arrow keys, and on to the copy button.',
    },
    { keys: ['Enter', 'Space'], action: 'Copies the text, on the button.' },
  ],

  accessibility: [
    'The code is a focusable group named by `label`, so a keyboard user can scroll a long line.',
    'The copy button is a native button named by `copy-label`.',
    'After a copy, a polite live region says `feedback` (“Copied”). When the clipboard refuses, it says `error-feedback`.',
    'The copied state is shown by the text “Copied” and a check icon, not by colour alone.',
  ],

  gaps: [
    // zeno-code-snippet.ts: the text comes from textContent or `value`.
    'The code is plain text. There is no syntax highlighting.',
    // zeno-code-snippet.ts: there is no expand button in the template.
    'A long multi-line snippet scrolls inside `--code-snippet-max-height`. There is no “Show more” button.',
  ],
};

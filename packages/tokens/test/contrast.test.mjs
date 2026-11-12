import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { composite, contrast, parseColor } from './color.mjs';
import { pairs, TEXT, UI } from './contrast-pairs.mjs';

const built = JSON.parse(
  await readFile(new URL('../dist/tokens.json', import.meta.url), 'utf8')
);

function lookup(theme, path) {
  const token = path
    .split('.')
    .reduce((node, key) => node?.[key], built[theme]);
  assert.ok(token, `Token ${path} does not exist in the ${theme} theme`);
  return parseColor(token.value);
}

function measure(theme, pair) {
  let bg = lookup(theme, pair.bg);
  let fg = lookup(theme, pair.fg);
  if (pair.over) {
    bg = composite(bg, lookup(theme, pair.over));
  }
  assert.equal(bg[3], 1, `${pair.bg} is translucent and needs "over"`);
  if (fg[3] !== 1) {
    fg = composite(fg, bg);
  }
  return contrast(fg, bg);
}

test('WCAG contrast maths', () => {
  const black = parseColor('#000000');
  const white = parseColor('#fff');
  assert.equal(contrast(black, white), 21);
  assert.equal(contrast(white, white), 1);
  // #767676 on white is the well-known 4.54:1 boundary grey.
  assert.equal(contrast(parseColor('#767676'), white).toFixed(2), '4.54');
  assert.deepEqual(
    composite(parseColor('rgba(0, 0, 0, 0.5)'), white),
    [127.5, 127.5, 127.5, 1]
  );
});

for (const theme of ['light', 'dark']) {
  for (const [label, min] of [
    ['text 4.5:1', TEXT],
    ['large text and UI boundaries 3:1', UI],
  ]) {
    test(`${theme} theme: ${label}`, () => {
      const checked = pairs.filter(pair => pair.min === min);
      assert.ok(checked.length > 0);
      const results = checked.map(pair => ({
        pair,
        ratio: measure(theme, pair),
      }));
      const failures = results
        .filter(({ pair, ratio }) => ratio < pair.min)
        .map(
          ({ pair, ratio }) =>
            `  ${pair.fg} on ${pair.bg}${pair.over ? ` over ${pair.over}` : ''}: ` +
            `${ratio.toFixed(2)}:1, needs ${pair.min}:1 (${pair.why})`
        );
      const lowest = results.reduce((a, b) => (a.ratio < b.ratio ? a : b));
      console.log(
        `contrast ${theme} ${min}:1 - ${checked.length} pairs, ${failures.length} failures, ` +
          `lowest ${lowest.ratio.toFixed(2)}:1 (${lowest.pair.fg} on ${lowest.pair.bg})`
      );
      assert.equal(
        failures.length,
        0,
        `${failures.length} contrast failures in the ${theme} theme:\n${failures.join('\n')}`
      );
    });
  }
}

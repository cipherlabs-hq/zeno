// Checks the generated stylesheet and module: the theme selectors are there,
// light and dark declare the same properties, and nothing refers to a
// property that is not declared.

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const css = await readFile(
  new URL('../dist/css/tokens.css', import.meta.url),
  'utf8'
);

/** Returns the body of the first rule whose prelude is exactly `selector`. */
function block(source, selector) {
  const start = source.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `no rule for ${selector}`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') depth -= 1;
    if (depth === 0) return source.slice(open + 1, i);
  }
  throw new Error(`unterminated rule for ${selector}`);
}

const names = body =>
  [...body.matchAll(/(--zeno-[a-z0-9-]+)\s*:/g)].map(match => match[1]).sort();

const lightBody = block(css, ":root,\n[data-theme='light']");
const mediaBody = block(css, '@media (prefers-color-scheme: dark)');
const systemDarkBody = block(mediaBody, ":root:not([data-theme='light'])");
const forcedDarkBody = block(css, "\n[data-theme='dark']");

test('light is the default and can be forced with data-theme', () => {
  assert.match(lightBody, /color-scheme: light;/);
  assert.ok(names(lightBody).length > 50);
});

test('dark follows the system unless data-theme="light" is set', () => {
  assert.match(systemDarkBody, /color-scheme: dark;/);
  assert.deepEqual(names(systemDarkBody), names(lightBody));
});

test('data-theme="dark" forces dark with the same values as the system rule', () => {
  assert.match(forcedDarkBody, /color-scheme: dark;/);
  assert.equal(
    forcedDarkBody.replace(/\s+/g, ' ').trim(),
    systemDarkBody.replace(/\s+/g, ' ').trim()
  );
});

test('every property the stylesheet refers to is declared', () => {
  const declared = new Set(names(css));
  const used = [...css.matchAll(/var\((--zeno-[a-z0-9-]+)\)/g)].map(
    match => match[1]
  );
  assert.ok(used.length > 0);
  assert.deepEqual([...new Set(used.filter(name => !declared.has(name)))], []);
});

test('the module exports match the stylesheet', async () => {
  const { tokens, light, dark, vars } = await import('../dist/index.js');
  assert.equal(vars.color.accent.solid, 'var(--zeno-color-accent-solid)');
  assert.equal(
    vars.font.lineHeight.tight,
    'var(--zeno-font-line-height-tight)'
  );
  assert.match(light.color.accent.solid, /^#[0-9a-f]{6}$/);
  assert.match(dark.color.accent.solid, /^#[0-9a-f]{6}$/);
  assert.notEqual(light.color.background.page, dark.color.background.page);
  assert.equal(tokens.motion.duration.md, '200ms');

  const declared = new Set(names(css));
  const leaves = [];
  (function walk(node) {
    for (const value of Object.values(node)) {
      if (typeof value === 'string') leaves.push(value.slice(4, -1));
      else walk(value);
    }
  })(vars);
  assert.equal(leaves.length, declared.size);
  assert.deepEqual(
    leaves.filter(name => !declared.has(name)),
    []
  );
});

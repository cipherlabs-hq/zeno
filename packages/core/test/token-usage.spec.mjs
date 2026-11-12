// @vitest-environment node
//
// Elements carry no fallback values: every --zeno-* custom property they read
// must exist in the stylesheet @usezeno/tokens ships. This fails when an
// element refers to a token that was renamed, removed or never defined.

import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const src = join(dirname(fileURLToPath(import.meta.url)), '../src');

const stylesheet = readFileSync(require.resolve('@usezeno/tokens/css'), 'utf8');
const declared = new Set(
  [...stylesheet.matchAll(/(--zeno-[a-z0-9-]+)\s*:/g)].map(match => match[1])
);

function sources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.ts$/.test(entry.name) && !/\.spec\.ts$/.test(entry.name)
      ? [path]
      : [];
  });
}

describe('token usage in @usezeno/core', () => {
  const files = sources(src);

  it('reads only custom properties the token stylesheet declares', () => {
    const unknown = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      // A name that ends in `-${` is completed at run time; the prefix check
      // below covers those.
      for (const match of text.matchAll(/--zeno-[a-z0-9-]+/g)) {
        const name = match[0];
        if (text.startsWith('${', match.index + name.length)) continue;
        if (!declared.has(name)) {
          unknown.push(`${name} in ${file.slice(src.length + 1)}`);
        }
      }
    }
    expect(declared.size).toBeGreaterThan(200);
    expect(unknown).toEqual([]);
  });

  it('builds run-time property names from a real token group', () => {
    const prefixes = new Set();
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(/(--zeno-[a-z0-9-]+-)\$\{/g)) {
        prefixes.add(match[1]);
      }
    }
    for (const prefix of prefixes) {
      expect(
        [...declared].some(name => name.startsWith(prefix)),
        `${prefix}* matches no token`
      ).toBe(true);
    }
  });

  it('has no colour literals outside print rules', () => {
    const literal = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
    const found = [];
    for (const file of files.filter(path => path.includes('components'))) {
      let printDepth = 0;
      let depth = 0;
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          if (/@media\s+print/.test(line)) printDepth = depth + 1;
          if (printDepth === 0 && literal.test(line)) {
            found.push(`${file.slice(src.length + 1)}:${index + 1}`);
          }
          depth += (line.match(/\{/g) ?? []).length;
          depth -= (line.match(/\}/g) ?? []).length;
          if (printDepth > 0 && depth < printDepth) printDepth = 0;
        });
    }
    expect(found).toEqual([]);
  });
});

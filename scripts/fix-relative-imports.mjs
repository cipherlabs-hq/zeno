// Adds explicit `.js` extensions to relative imports so the emitted modules
// resolve in browsers and in Node without a bundler.
// Usage: node scripts/fix-relative-imports.mjs <dir> [<dir>...]
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(ts|mts)$/.test(entry.name) && !entry.name.endsWith('.d.ts'))
      out.push(p);
  }
  return out;
}

const pattern = /(\bfrom\s+|\bimport\s+|\bimport\()(['"])(\.{1,2}\/[^'"]*)\2/g;
let changed = 0;

for (const root of process.argv.slice(2)) {
  for (const file of walk(resolve(root))) {
    const source = readFileSync(file, 'utf8');
    const next = source.replace(pattern, (match, lead, quote, spec) => {
      if (/\.(js|mjs|cjs|json|css|scss|vue|svg)$/.test(spec)) return match;
      const target = resolve(dirname(file), spec);
      if (existsSync(`${target}.ts`))
        return `${lead}${quote}${spec}.js${quote}`;
      if (existsSync(target) && statSync(target).isDirectory())
        return `${lead}${quote}${spec.replace(/\/$/, '')}/index.js${quote}`;
      return match;
    });
    if (next !== source) {
      writeFileSync(file, next);
      changed += 1;
    }
  }
}
console.log(`updated ${changed} files`);

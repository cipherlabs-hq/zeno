// Bundles each per-element entry point and checks that it carries only that
// element and the elements it renders: '@usezeno/core/input' brings
// zeno-input, zeno-icon and zeno-spinner, and not zeno-select.
//
// Checked for '@usezeno/core/<element>', '@usezeno/react/<element>', and a
// named import from the '@usezeno/react' index, which must tree-shake the
// same way.
// Run after `pnpm build`.
//
//   pnpm check:entry-points          check every element
//   pnpm check:entry-points --sizes  also print gzip sizes

import { build } from 'esbuild';
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const lit = join(root, 'packages/core/src/components/lit');
// Resolve the packages the way an app would, through the React package's
// node_modules, where @usezeno/core is linked.
const from = join(root, 'packages/react');
const showSizes = process.argv.includes('--sizes');

const names = (await readdir(join(root, 'packages/core/src/elements')))
  .filter(file => file.endsWith('.ts'))
  .map(file => file.replace(/\.ts$/, ''))
  .sort();

/** The elements an element renders, read from its source. */
async function rendered(name) {
  const source = await readFile(join(lit, name, `zeno-${name}.ts`), 'utf8');
  return [...source.matchAll(/<zeno-([a-z-]+)/g)]
    .map(match => match[1])
    .filter(tag => tag !== name);
}

/** The element and everything it renders, all the way down. */
async function expected(name, seen = new Set()) {
  if (seen.has(name)) return seen;
  seen.add(name);
  for (const tag of await rendered(name)) await expected(tag, seen);
  return seen;
}

async function bundle(contents) {
  const result = await build({
    stdin: { contents, resolveDir: from, loader: 'js' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    minify: true,
    metafile: true,
    external: ['react', 'react-dom'],
    logLevel: 'silent',
  });
  // An element is in the bundle when some of its module's code is: esbuild
  // lists every module it read, with the bytes each left in the output.
  const elements = new Set();
  const [output] = Object.values(result.metafile.outputs);
  for (const [input, { bytesInOutput }] of Object.entries(output.inputs)) {
    const match = input.match(/components\/lit\/([a-z-]+)\/zeno-[a-z-]+\.js$/);
    // base/ holds the shared base classes, not an element.
    if (match && match[1] !== 'base' && bytesInOutput > 0) {
      elements.add(match[1]);
    }
  }
  const size = gzipSync(result.outputFiles[0].contents).length;
  return { elements, size };
}

const problems = [];
const rows = [];
for (const name of names) {
  const want = await expected(name);
  const className = `Zeno${name.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase())}`;
  const cases = {
    core: `import '@usezeno/core/${name}';`,
    react: `export { ${className} } from '@usezeno/react/${name}';`,
    'react index': `export { ${className} } from '@usezeno/react';`,
  };
  const row = { name };
  for (const [label, contents] of Object.entries(cases)) {
    const { elements, size } = await bundle(contents);
    row[label] = size;
    const extra = [...elements].filter(element => !want.has(element));
    const missing = [...want].filter(element => !elements.has(element));
    if (extra.length > 0) {
      problems.push(`${label} ${name} also bundles ${extra.join(', ')}`);
    }
    if (missing.length > 0) {
      problems.push(`${label} ${name} does not bundle ${missing.join(', ')}`);
    }
  }
  rows.push(row);
}

if (showSizes) {
  console.table(
    rows.map(row => ({
      element: row.name,
      'core (KB gz)': (row.core / 1024).toFixed(1),
      'react (KB gz)': (row.react / 1024).toFixed(1),
      'react index (KB gz)': (row['react index'] / 1024).toFixed(1),
    }))
  );
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(
  `${names.length} elements: each entry point carries only its element and what it renders`
);

// Installs the packages into a new, empty project outside this repository and
// checks that they work there, the way someone who ran `npm install` would
// have them.
//
//   node scripts/try-install.mjs --tarballs DIR   the tarballs `pnpm release:check --keep DIR` wrote
//   node scripts/try-install.mjs --version 0.1.0  the published packages, from npm
//
//   --offline   install from the local pnpm store only (nothing is downloaded)
//   --keep      leave the project on disk and print where it is
//
// What it checks in the new project:
//   1. every package installs, and every path in its `exports` resolves to a
//      file that is there
//   2. a small React and TypeScript file that uses the elements type-checks
//      against the shipped declarations (skipLibCheck is off)
//   3. a page bundled from `@usezeno/tokens/css` and
//      `@usezeno/core/web-components` registers every element in the
//      manifest, renders a button, and has the tokens on the page
//
// Vue and Svelte files are not compiled here. Their packages are installed and
// their exports are resolved, nothing more.

import { execFile } from 'node:child_process';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

const args = process.argv.slice(2);
const option = name => {
  const at = args.indexOf(name);
  return at === -1 ? null : args[at + 1];
};
const flag = name => args.includes(name);

const PACKAGES = [
  'tokens',
  'core',
  'react',
  'vue',
  'svelte',
  'styles',
  'composables',
];

const tarballDir = option('--tarballs') ? resolve(option('--tarballs')) : null;
const version = option('--version');
if (!tarballDir === !version) {
  console.error('Give --tarballs DIR or --version X.Y.Z, one of the two.');
  process.exit(2);
}

/** The version of a tool this repository already uses, so the store has it. */
function installed(name, from) {
  const require = createRequire(join(root, from, 'package.json'));
  return require(`${name}/package.json`).version;
}
function esbuildVersion() {
  // esbuild comes with Vite, which the examples build with.
  const example = createRequire(join(root, 'examples/html/package.json'));
  const vite = createRequire(example.resolve('vite/package.json'));
  return vite('esbuild/package.json').version;
}

/** Where each @usezeno package comes from: a tarball, or a version on npm. */
async function sources() {
  if (version) {
    return Object.fromEntries(
      PACKAGES.map(name => [`@usezeno/${name}`, version])
    );
  }
  const files = await readdir(tarballDir);
  return Object.fromEntries(
    PACKAGES.map(name => {
      const file = files.find(
        entry => entry.startsWith(`usezeno-${name}-`) && entry.endsWith('.tgz')
      );
      if (!file) throw new Error(`No tarball for ${name} in ${tarballDir}`);
      return [`@usezeno/${name}`, `file:${join(tarballDir, file)}`];
    })
  );
}

const exists = path =>
  access(path).then(
    () => true,
    () => false
  );

/** Every file an `exports` value can point at. */
function targets(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (value && typeof value === 'object') {
    for (const inner of Object.values(value)) targets(inner, out);
  }
  return out;
}

const rootManifest = JSON.parse(
  await readFile(join(root, 'package.json'), 'utf8')
);
const project = await mkdtemp(join(tmpdir(), 'zeno-try-install-'));
const results = [];
const pass = text => results.push({ ok: true, text });
const fail = text => results.push({ ok: false, text });

try {
  const zeno = await sources();
  await writeFile(
    join(project, 'package.json'),
    `${JSON.stringify(
      {
        name: 'zeno-try-install',
        private: true,
        type: 'module',
        // The same pnpm this repository uses.
        packageManager: rootManifest.packageManager,
        dependencies: {
          ...zeno,
          react: installed('react', 'examples/react'),
          'react-dom': installed('react-dom', 'examples/react'),
          vue: installed('vue', 'examples/vue'),
          svelte: installed('svelte', 'examples/svelte'),
        },
        devDependencies: {
          '@types/react': installed('@types/react', 'examples/react'),
          esbuild: esbuildVersion(),
          typescript: installed('typescript', '.'),
        },
        // A tarball names its siblings by version. Before anything is on npm
        // those versions exist only as the other tarballs.
        pnpm: tarballDir ? { overrides: zeno } : undefined,
      },
      null,
      2
    )}\n`
  );

  await run(
    'pnpm',
    [
      'install',
      '--ignore-workspace',
      ...(flag('--offline') ? ['--offline'] : []),
    ],
    { cwd: project }
  );
  pass(
    `pnpm install${flag('--offline') ? ' --offline' : ''} of ${PACKAGES.length} packages`
  );

  // 1. Every path in every `exports` is a file in the installed package.
  let paths = 0;
  const stillPrivate = [];
  for (const name of PACKAGES) {
    const dir = join(project, 'node_modules/@usezeno', name);
    const manifest = JSON.parse(
      await readFile(join(dir, 'package.json'), 'utf8')
    );
    if (version && manifest.version !== version) {
      fail(`@usezeno/${name} is ${manifest.version}, not ${version}`);
    }
    if (manifest.private === true) stillPrivate.push(name);
    for (const target of targets(manifest.exports)) {
      if (target.includes('*')) continue;
      paths += 1;
      if (!(await exists(join(dir, target)))) {
        fail(`@usezeno/${name}: exports names ${target}, which is not there`);
      }
    }
  }
  pass(`${paths} export paths are files in the installed packages`);
  if (stillPrivate.length > 0) {
    pass(
      `note: ${stillPrivate.length} of these tarballs still say "private": true, so npm would refuse to publish them`
    );
  }

  // 2. A React file type-checks against the shipped declarations.
  await mkdir(join(project, 'src'));
  await writeFile(
    join(project, 'src/app.tsx'),
    `import '@usezeno/tokens/css';
import type { ZenoButton as ZenoButtonElement } from '@usezeno/core/web-components';
import { ZenoButton, ZenoInput } from '@usezeno/react';
import { useState } from 'react';

export function SignUp() {
  const [email, setEmail] = useState('');
  return (
    <form>
      <ZenoInput
        name="email"
        type="email"
        label="Email"
        required
        value={email}
        onInput={event => setEmail(String((event.target as HTMLInputElement).value))}
      />
      <ZenoButton type="submit" variant="primary">
        Sign up
      </ZenoButton>
    </form>
  );
}

export const button: ZenoButtonElement = document.createElement('zeno-button');
`
  );
  await writeFile(join(project, 'src/css.d.ts'), `declare module '*/css';\n`);
  await writeFile(
    join(project, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          jsx: 'react-jsx',
          strict: true,
          noEmit: true,
          skipLibCheck: false,
          types: [],
        },
        include: ['src'],
      },
      null,
      2
    )}\n`
  );
  try {
    await run(join(project, 'node_modules/.bin/tsc'), ['-p', '.'], {
      cwd: project,
    });
    pass('a React and TypeScript file type-checks (skipLibCheck off)');
  } catch (error) {
    fail(`TypeScript: ${String(error.stdout || error.message).trim()}`);
  }

  // 3. A bundled page registers and renders the elements in a real browser.
  await writeFile(
    join(project, 'src/page.js'),
    `import '@usezeno/tokens/css';\nimport '@usezeno/core/web-components';\n`
  );
  await run(
    join(project, 'node_modules/.bin/esbuild'),
    ['src/page.js', '--bundle', '--format=iife', '--outfile=out/page.js'],
    { cwd: project }
  );
  await writeFile(
    join(project, 'out/index.html'),
    `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="page.css">
<zeno-button variant="primary">Sign up</zeno-button><script src="page.js"></script>\n`
  );
  const manifest = JSON.parse(
    await readFile(
      join(project, 'node_modules/@usezeno/core/dist/custom-elements.json'),
      'utf8'
    )
  );
  const tags = manifest.modules
    .flatMap(module => module.declarations ?? [])
    .map(declaration => declaration.tagName)
    .filter(Boolean);

  const core = createRequire(join(root, 'packages/core/package.json'));
  const { chromium } = core('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(pathToFileURL(join(project, 'out/index.html')).href);
    const seen = await page.evaluate(async names => {
      const button = document.querySelector('zeno-button');
      await button.updateComplete;
      return {
        missing: names.filter(name => !customElements.get(name)),
        inner: Boolean(button.shadowRoot?.querySelector('button')),
        token: getComputedStyle(document.documentElement)
          .getPropertyValue('--zeno-color-background-page')
          .trim(),
      };
    }, tags);
    if (seen.missing.length > 0) {
      fail(`not registered in the browser: ${seen.missing.join(', ')}`);
    } else {
      pass(`all ${tags.length} elements in the manifest register in Chromium`);
    }
    if (seen.inner) pass('<zeno-button> renders a button in its shadow root');
    else fail('<zeno-button> rendered no button');
    if (seen.token) pass(`the token stylesheet is on the page (${seen.token})`);
    else fail('--zeno-color-background-page is not set on the page');
    if (errors.length > 0) fail(`browser errors: ${errors.join(' | ')}`);
  } finally {
    await browser.close();
  }
} catch (error) {
  fail(String(error.stderr || error.stdout || error.message).trim());
} finally {
  if (flag('--keep')) console.log(`The project is in ${project}`);
  else await rm(project, { recursive: true, force: true });
}

for (const { ok, text } of results)
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${text}`);
const failed = results.filter(result => !result.ok).length;
console.log(
  failed === 0
    ? `The packages work in a new project (${version ?? dirname(join(tarballDir, 'x'))}).`
    : `${failed} check(s) failed.`
);
process.exitCode = failed === 0 ? 0 : 1;

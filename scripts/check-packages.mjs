// Packs every package that will be published and checks what is in each tarball.
// Nothing is published: `pnpm pack` only writes a .tgz to a temporary folder.
//
//   pnpm release:check            check, print a table
//   pnpm release:check --keep DIR also leave the tarballs in DIR
//   pnpm release:check --json FILE also write the table as JSON
//
// A tarball fails when it
//   - holds tests, stories, snapshots, node_modules, or a file that looks like
//     a secret (.env, .npmrc, a key)
//   - has no LICENSE or README
//   - still has a `workspace:` dependency range
//   - names a file in `main`, `module`, `types`, `exports`, `customElements`
//     or `svelte` that is not in the tarball
//   - has a source map without its sources inlined (the sources themselves are
//     not published, so such a map points at nothing)
//   - lacks the fields a public release needs
//   - is public at version 0.0.0 with no changeset waiting, or is public
//     while a package it depends on is still private

import { execFile } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const REPOSITORY = 'git+https://github.com/cipherlabs-hq/zeno.git';

const args = process.argv.slice(2);
const option = name => {
  const at = args.indexOf(name);
  return at === -1 ? null : args[at + 1];
};

const FORBIDDEN = [
  [/(^|\/)node_modules\//, 'node_modules'],
  [/\.(spec|test)\.[cm]?[jt]sx?(\.map)?$/, 'a test file'],
  [/\.(spec|test)\.d\.[cm]?ts$/, 'a test declaration'],
  [/\.stories\.[^/]+$/, 'a story'],
  [/(^|\/)__(snapshots|tests|mocks)__\//, 'a test folder'],
  [/(^|\/)(test|tests|test-utils)\//, 'a test folder'],
  [/(^|\/)\.env(\..+)?$/, 'an env file'],
  [/(^|\/)\.npmrc$/, 'an .npmrc'],
  [/\.(pem|key|p8|p12|pfx)$/, 'a key file'],
  [/(^|\/)\.DS_Store$/, 'a .DS_Store'],
  [/\.tsbuildinfo$/, 'a TypeScript build cache'],
];

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function publishablePackages() {
  const config = await readJson(resolve(root, '.changeset/config.json'));
  const names = new Set(config.fixed.flat());
  const found = [];
  for (const dir of await readdir(resolve(root, 'packages'))) {
    let manifest;
    try {
      manifest = await readJson(resolve(root, 'packages', dir, 'package.json'));
    } catch {
      continue;
    }
    if (names.has(manifest.name)) found.push({ dir, manifest });
  }
  const missing = [...names].filter(
    name => !found.some(pkg => pkg.manifest.name === name)
  );
  if (missing.length > 0) {
    throw new Error(`Not found under packages/: ${missing.join(', ')}`);
  }
  return found.sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));
}

/** Every file path an `exports` value can resolve to. */
function exportTargets(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (value && typeof value === 'object') {
    for (const inner of Object.values(value)) exportTargets(inner, out);
  }
  return out;
}

/** True while a changeset is waiting, which makes the next release a version bump. */
const changesetWaiting = (await readdir(join(root, '.changeset'))).some(
  file => file.endsWith('.md') && file !== 'README.md'
);

function checkManifest(source, packed, dir, problems) {
  if (source.license !== 'MIT') problems.push('license is not MIT');
  if (!source.description) problems.push('no description');
  if (!source.homepage) problems.push('no homepage');
  if (source.repository?.url !== REPOSITORY) {
    problems.push(`repository.url is not ${REPOSITORY}`);
  }
  if (source.repository?.directory !== `packages/${dir}`) {
    problems.push(`repository.directory is not packages/${dir}`);
  }
  if (source.publishConfig?.access !== 'public') {
    problems.push('publishConfig.access is not "public"');
  }
  if (source.publishConfig?.provenance !== true) {
    problems.push('publishConfig.provenance is not true');
  }
  if (!('sideEffects' in source)) problems.push('no sideEffects field');
  if (!source.exports) problems.push('no exports');
  if (!Array.isArray(source.files)) problems.push('no files list');
  // With no changeset waiting, the release workflow publishes every public
  // version that is not on npm yet. 0.0.0 is the placeholder, never a release.
  if (
    source.private !== true &&
    source.version === '0.0.0' &&
    !changesetWaiting
  ) {
    problems.push(
      'the package is public, its version is 0.0.0 and no changeset is waiting, so 0.0.0 would be published'
    );
  }

  for (const field of [
    'dependencies',
    'peerDependencies',
    'optionalDependencies',
    'devDependencies',
  ]) {
    for (const [name, range] of Object.entries(packed[field] ?? {})) {
      if (String(range).startsWith('workspace:')) {
        problems.push(`${field}.${name} is still "${range}" in the tarball`);
      }
    }
  }
}

function checkEntryPoints(packed, files, problems) {
  const has = path => files.has(posix.normalize(path.replace(/^\.\//, '')));
  const single = ['main', 'module', 'types', 'svelte', 'customElements'];
  for (const field of single) {
    if (packed[field] && !has(packed[field])) {
      problems.push(`${field} points at ${packed[field]}, which is not packed`);
    }
  }
  for (const target of exportTargets(packed.exports)) {
    if (target.includes('*')) {
      const [before, after] = target.replace(/^\.\//, '').split('*');
      const match = [...files].some(
        file => file.startsWith(before) && file.endsWith(after)
      );
      if (!match) problems.push(`exports pattern ${target} matches no file`);
    } else if (!has(target)) {
      problems.push(`exports points at ${target}, which is not packed`);
    }
  }
}

async function checkPackage({ dir, manifest }, outDir, keepDir) {
  const packageDir = resolve(root, 'packages', dir);
  const { stdout } = await run(
    'pnpm',
    ['pack', '--pack-destination', outDir, '--json'],
    { cwd: packageDir }
  );
  const report = JSON.parse(stdout);
  const tarball = report.filename;
  const bytes = (await stat(tarball)).size;

  const extractDir = join(outDir, `x-${dir}`);
  await mkdir(extractDir, { recursive: true });
  await run('tar', ['-xzf', tarball, '-C', extractDir]);
  // The tarball itself is the truth: pnpm adds the root LICENSE while packing,
  // and its JSON report does not list it.
  const listing = await run('tar', ['-tzf', tarball]);
  const files = new Set(
    listing.stdout
      .split('\n')
      .filter(line => line !== '' && !line.endsWith('/'))
      .map(line => line.replace(/^package\//, ''))
  );
  const packed = await readJson(join(extractDir, 'package', 'package.json'));

  const problems = [];
  for (const file of files) {
    for (const [pattern, what] of FORBIDDEN) {
      if (pattern.test(file)) problems.push(`${file} is ${what}`);
    }
  }
  if (!files.has('LICENSE')) problems.push('no LICENSE');
  if (!files.has('README.md')) problems.push('no README.md');

  checkManifest(manifest, packed, dir, problems);
  checkEntryPoints(packed, files, problems);

  let maps = 0;
  let unpackedBytes = 0;
  for (const file of files) {
    const path = join(extractDir, 'package', file);
    unpackedBytes += (await stat(path)).size;
    if (!file.endsWith('.map')) continue;
    maps += 1;
    if (file.endsWith('.d.ts.map')) {
      problems.push(`${file} is a declaration map, and src/ is not published`);
      continue;
    }
    const map = await readJson(path);
    if (!Array.isArray(map.sourcesContent) || map.sourcesContent.length === 0) {
      problems.push(`${file} does not inline its sources`);
    }
  }

  if (keepDir) {
    await mkdir(keepDir, { recursive: true });
    await writeFile(
      join(keepDir, tarball.split('/').pop()),
      await readFile(tarball)
    );
  }

  return {
    name: manifest.name,
    version: packed.version,
    private: manifest.private === true,
    tarball: tarball.split('/').pop(),
    bytes,
    unpackedBytes,
    files: files.size,
    sourceMaps: maps,
    needs: Object.keys({
      ...packed.dependencies,
      ...packed.peerDependencies,
    }),
    problems,
  };
}

const outDir = await mkdtemp(join(tmpdir(), 'zeno-pack-'));
try {
  const keepDir = option('--keep') ? resolve(option('--keep')) : null;
  const results = [];
  for (const pkg of await publishablePackages()) {
    results.push(await checkPackage(pkg, outDir, keepDir));
  }

  // A public package cannot depend on one that stays unpublished.
  const hidden = new Set(
    results.filter(result => result.private).map(result => result.name)
  );
  for (const result of results) {
    if (result.private) continue;
    for (const name of result.needs) {
      if (hidden.has(name)) {
        result.problems.push(`depends on ${name}, which is still private`);
      }
    }
  }

  const kb = bytes => `${(bytes / 1024).toFixed(1)} kB`;
  console.table(
    results.map(result => ({
      package: `${result.name}@${result.version}`,
      private: result.private,
      tarball: kb(result.bytes),
      unpacked: kb(result.unpackedBytes),
      files: result.files,
      'source maps': result.sourceMaps,
      problems: result.problems.length,
    }))
  );

  if (option('--json')) {
    await writeFile(
      resolve(option('--json')),
      `${JSON.stringify(results, null, 2)}\n`
    );
  }

  const failed = results.filter(result => result.problems.length > 0);
  for (const result of failed) {
    console.error(`\n${result.name}`);
    for (const problem of result.problems) console.error(`  - ${problem}`);
  }
  if (failed.length > 0) {
    console.error(`\n${failed.length} package(s) are not ready to publish.`);
    process.exitCode = 1;
  } else {
    console.log(`All ${results.length} tarballs are clean.`);
  }
} finally {
  await rm(outDir, { recursive: true, force: true });
}

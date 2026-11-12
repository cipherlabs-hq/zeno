// Writes the dated entry for the current version into the root CHANGELOG.md.
//
// `changeset version` writes one CHANGELOG.md per package and puts no date in
// them. The seven published packages share one version, so this script folds
// their newest sections into a single dated entry. The Releases page of the
// docs site is built from the root file.
//
// It runs right after `changeset version` (see `release:version` in
// package.json). The date is the day it ran, in UTC: the day the "Version
// packages" pull request was last regenerated, which is usually but not always
// the day it was merged. Set ZENO_RELEASE_DATE=YYYY-MM-DD to choose the date.

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const changelogPath = resolve(root, 'CHANGELOG.md');

export const CHANGELOG_HEADER = `# Changelog

Every \`@usezeno/*\` package is released together and shares one version number, so this file has
one entry per release. It is written by \`pnpm release:version\`. Do not edit it by hand: add a
changeset instead (\`pnpm changeset\`).
`;

const SECTION_TITLES = {
  'Major Changes': 'Breaking changes',
  'Minor Changes': 'New',
  'Patch Changes': 'Fixes',
};

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

/** The packages in the fixed group, with their folder and current version. */
async function fixedGroup() {
  const config = await readJson(resolve(root, '.changeset/config.json'));
  const names = new Set(config.fixed.flat());
  const group = [];
  for (const dir of await readdir(resolve(root, 'packages'))) {
    let manifest;
    try {
      manifest = await readJson(resolve(root, 'packages', dir, 'package.json'));
    } catch {
      continue;
    }
    if (names.has(manifest.name)) {
      group.push({ name: manifest.name, dir, version: manifest.version });
    }
  }
  return group.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The entries a package's changelog lists for one version, without the
 * "Updated dependencies" lines and without the leading commit hash.
 */
export function entriesForVersion(changelog, version) {
  const lines = changelog.split('\n');
  const start = lines.findIndex(line => line.trim() === `## ${version}`);
  if (start === -1) return [];

  const entries = [];
  let section = null;
  let current = null;
  const push = () => {
    if (current && !current.text.startsWith('Updated dependencies')) {
      entries.push(current);
    }
    current = null;
  };

  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) break;
    if (line.startsWith('### ')) {
      push();
      section = line.slice(4).trim();
    } else if (line.startsWith('- ')) {
      push();
      current = {
        section,
        text: line.slice(2).replace(/^[0-9a-f]{7,40}: /, ''),
      };
    } else if (current && line.trim() !== '') {
      current.text += `\n${line}`;
    }
  }
  push();
  return entries;
}

function renderEntry(version, date, merged, groupSize) {
  let out = `## ${version} (${date})\n`;
  for (const [heading, title] of Object.entries(SECTION_TITLES)) {
    const items = merged.filter(item => item.section === heading);
    if (items.length === 0) continue;
    out += `\n### ${title}\n\n`;
    for (const item of items) {
      const scope =
        item.packages.length === groupSize
          ? ''
          : ` (${item.packages.map(name => `\`${name}\``).join(', ')})`;
      const [first, ...rest] = item.text.split('\n');
      out += `- ${first}${scope}\n`;
      for (const line of rest) out += `${line}\n`;
    }
  }
  return out;
}

async function main() {
  const group = await fixedGroup();
  const versions = new Set(group.map(pkg => pkg.version));
  if (versions.size !== 1) {
    throw new Error(
      `The fixed group should share one version, found: ${[...versions].join(', ')}`
    );
  }
  const [version] = versions;

  const merged = [];
  for (const pkg of group) {
    let changelog;
    try {
      changelog = await readFile(
        resolve(root, 'packages', pkg.dir, 'CHANGELOG.md'),
        'utf8'
      );
    } catch {
      continue;
    }
    for (const entry of entriesForVersion(changelog, version)) {
      const existing = merged.find(
        item => item.section === entry.section && item.text === entry.text
      );
      if (existing) existing.packages.push(pkg.name);
      else merged.push({ ...entry, packages: [pkg.name] });
    }
  }

  if (merged.length === 0) {
    console.log(
      `No package changelog has an entry for ${version}. CHANGELOG.md is unchanged.`
    );
    return;
  }

  let existing = CHANGELOG_HEADER;
  try {
    existing = await readFile(changelogPath, 'utf8');
  } catch {
    // First release: start from the header.
  }

  const today = new Date().toISOString().slice(0, 10);
  const firstEntry = existing.search(/^## /m);
  const header = (
    firstEntry === -1 ? existing : existing.slice(0, firstEntry)
  ).trimEnd();
  let older = firstEntry === -1 ? '' : existing.slice(firstEntry);

  // Running twice for the same version replaces the entry and keeps its date.
  let date = process.env.ZENO_RELEASE_DATE ?? today;
  const sameVersion = older.match(
    new RegExp(
      `^## ${version.replaceAll('.', '\\.')} \\((\\d{4}-\\d{2}-\\d{2})\\)\\n`
    )
  );
  if (sameVersion) {
    date = process.env.ZENO_RELEASE_DATE ?? sameVersion[1];
    const next = older.indexOf('\n## ', 1);
    older = next === -1 ? '' : older.slice(next + 1);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(
      `ZENO_RELEASE_DATE must look like 2026-01-31, got "${date}"`
    );
  }

  const entry = renderEntry(version, date, merged, group.length);
  const text = [header, entry.trimEnd(), older.trimEnd()]
    .filter(Boolean)
    .join('\n\n');
  const options = await prettier.resolveConfig(changelogPath);
  await writeFile(
    changelogPath,
    await prettier.format(`${text}\n`, { ...options, filepath: changelogPath })
  );
  console.log(`CHANGELOG.md: wrote the entry for ${version} (${date}).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}

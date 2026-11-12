// Writes every part of the docs site that is derived from the source, so the
// site cannot drift from the code:
//
//   docs/elements/<name>.mdx          one page per element
//   docs/releases.md                  the changelog and what is waiting
//   src/generated/elements/<name>.*   the data and example scripts of a page
//   src/generated/elements.json       the list behind the index and sidebar
//   src/generated/tokens.json         the token tables
//   src/generated/sources.json        the example apps shown under Frameworks
//   src/generated/site.json           version and counts
//   src/generated/brand.json          the lockup that is put in the page
//
// It reads the custom-elements manifest that the core build writes
// (packages/core/dist/custom-elements.json), the notes in element-docs/, the
// core tests and stories, the token build, CHANGELOG.md, .changeset/ and
// examples/. All of its output is ignored by git.
//
// It fails when an example uses a tag or attribute that does not exist.

import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const app = resolve(fileURLToPath(new URL('..', import.meta.url)));
const root = resolve(app, '../..');
const core = join(root, 'packages/core');
const REPO = 'https://github.com/cipherlabs-hq/zeno';

const CATEGORIES = [
  'Actions',
  'Forms',
  'Feedback',
  'Overlays',
  'Navigation',
  'Data display',
  'Layout',
];

/** Attributes any HTML element takes. */
const GLOBAL_ATTRIBUTES = new Set([
  'id',
  'class',
  'slot',
  'style',
  'hidden',
  'title',
  'lang',
  'dir',
  'tabindex',
  'role',
  'part',
  'inert',
]);

/** Callbacks the browser calls. They are not part of an element's API. */
const PLATFORM_METHODS =
  /^(connected|disconnected|adopted|attributeChanged|formAssociated|formDisabled|formReset|formStateRestore)Callback$/;

const problems = [];

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function walk(dir, keep, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path, keep, out);
    else if (keep(path)) out.push(path);
  }
  return out;
}

const firstSentence = text => {
  const flat = text.replace(/\s+/g, ' ').trim();
  const end = flat.search(/\.(\s|$)/);
  return end === -1 ? flat : flat.slice(0, end + 1);
};

const titleOf = name => {
  const words = name.replaceAll('-', ' ');
  return words[0].toUpperCase() + words.slice(1);
};

// ---------------------------------------------------------------------------
// Types: every exported alias and interface in the core source, so a property
// typed `ButtonVariant` can show the values it takes.
// ---------------------------------------------------------------------------

async function readTypes() {
  const files = await walk(
    join(core, 'src'),
    path => path.endsWith('.ts') && !/\.(spec|test)\.ts$/.test(path)
  );
  const types = new Map();
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest);
    for (const node of source.statements) {
      const isAlias = ts.isTypeAliasDeclaration(node);
      if (!isAlias && !ts.isInterfaceDeclaration(node)) continue;
      const name = node.name.text;
      const entry = {
        name,
        file,
        declaration: node
          .getText(source)
          .replace(/^export\s+/, '')
          .replace(/^declare\s+/, ''),
        value: isAlias ? node.type.getText(source).replace(/\s+/g, ' ') : null,
      };
      if (!types.has(name)) types.set(name, []);
      types.get(name).push(entry);
    }
  }
  return types;
}

/** The declaration of `name` that is closest to `fromDir`. */
function findType(types, name, fromDir) {
  const found = types.get(name);
  if (!found) return null;
  return found.find(entry => entry.file.startsWith(fromDir)) ?? found[0];
}

const isLiteralUnion = value =>
  value !== null &&
  value.length <= 200 &&
  value
    .split('|')
    .every(part =>
      /^\s*('[^']*'|"[^"]*"|\d+|true|false|null|undefined|string|number|boolean)\s*$/.test(
        part
      )
    );

/**
 * A type as it is shown in a table. An alias for a short list of values is
 * replaced by the list. Other named types are collected in `used` so the page
 * can print their declarations.
 */
function showType(text, types, fromDir, used, depth = 0) {
  if (!text) return '';
  let shown = text.replace(/\s+/g, ' ').trim().replace(/^\| /, '');
  shown = shown.replace(/\b[A-Z][A-Za-z0-9]+\b/g, name => {
    const type = findType(types, name, fromDir);
    if (!type) return name;
    if (isLiteralUnion(type.value)) {
      return shown === name || /^\w+ \| undefined$/.test(shown)
        ? type.value
        : `(${type.value})`;
    }
    if (!used.has(name) && depth < 3) {
      used.set(name, type);
      // Types that this one mentions are printed as well.
      showType(
        type.declaration.slice(type.declaration.indexOf(name) + name.length),
        types,
        fromDir,
        used,
        depth + 1
      );
    }
    return name;
  });
  return shown.replace(/ \| undefined$/, '');
}

// ---------------------------------------------------------------------------
// Tests and stories
// ---------------------------------------------------------------------------

async function readCoverage(names) {
  const testDir = join(core, 'test/browser');
  const files = (await readdir(testDir)).filter(
    file => file.endsWith('.test.ts') && file !== 'smoke.test.ts'
  );
  const smoke = await readFile(join(testDir, 'smoke.test.ts'), 'utf8');
  const tests = [];
  for (const file of files) {
    tests.push({ file, text: await readFile(join(testDir, file), 'utf8') });
  }
  const storyDir = join(root, 'packages/storybook/stories');
  const stories = existsSync(storyDir) ? await readdir(storyDir) : [];

  const coverage = new Map();
  for (const name of names) {
    const tag = new RegExp(`zeno-${name}(?![a-z-])`, 'g');
    const inTitle = new RegExp(`zeno-${name}(?![a-z-])`);
    // A test file counts for an element when it is named after it, or mounts
    // it at least three times.
    const dedicated = tests.filter(
      test =>
        test.file === `${name}.test.ts` ||
        (test.text.match(tag) ?? []).length >= 3 ||
        test.text
          .split('\n')
          .some(line => /^\s*describe/.test(line) && inTitle.test(line))
    );
    coverage.set(name, {
      smoke: new RegExp(`'${name}'`).test(smoke),
      files: dedicated.map(test => `packages/core/test/browser/${test.file}`),
      axe: dedicated.some(test => test.text.includes('expectAccessible(')),
      story: stories.some(file => file.startsWith(`${name}.stories.`)),
    });
  }
  return coverage;
}

// ---------------------------------------------------------------------------
// Examples
// ---------------------------------------------------------------------------

const TAG =
  /<(zeno-[a-z0-9-]+)((?:\s+[^\s=>/]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g;
const ATTRIBUTE = /\s+([^\s=>/]+)(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/g;

function checkExample(owner, example, attributesByTag) {
  const where = `element-docs/${owner}.mjs, example "${example.title}"`;
  if (!example.title || typeof example.html !== 'string') {
    problems.push(`${where}: an example needs a title and html`);
    return;
  }
  for (const [, tag, attributes] of example.html.matchAll(TAG)) {
    const known = attributesByTag.get(tag);
    if (!known) {
      problems.push(`${where}: <${tag}> is not a Zeno element`);
      continue;
    }
    for (const [, attribute] of attributes.matchAll(ATTRIBUTE)) {
      const name = attribute.toLowerCase();
      if (
        known.has(name) ||
        GLOBAL_ATTRIBUTES.has(name) ||
        name.startsWith('aria-') ||
        name.startsWith('data-')
      ) {
        continue;
      }
      problems.push(`${where}: <${tag}> has no attribute "${attribute}"`);
    }
  }
  if (example.script) {
    try {
      // Only parsed here, to catch a syntax error. Never called.
      new Function('document', example.script);
    } catch (error) {
      problems.push(`${where}: the script does not parse: ${error.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Elements
// ---------------------------------------------------------------------------

function describeElement(declaration, types, coverage, notes) {
  const name = declaration.tagName.replace(/^zeno-/, '');
  const dir = join(core, declaration.path.replace(/\/[^/]+$/, ''));
  const used = new Map();
  const show = type => showType(type?.text, types, dir, used);
  const from = member => member.inheritedFrom?.name ?? null;
  const isPublic = member =>
    member.privacy !== 'private' &&
    member.privacy !== 'protected' &&
    !member.static &&
    !member.name.startsWith('_');

  const members = declaration.members ?? [];
  const properties = members
    .filter(member => member.kind === 'field' && isPublic(member))
    .map(member => ({
      name: member.name,
      attribute: member.attribute?.toLowerCase() ?? null,
      type: show(member.type),
      default: member.default ?? null,
      description: member.description ?? '',
      reflects: member.reflects === true,
      readonly: member.readonly === true,
      from: from(member),
    }));
  // An attribute with no property behind it still belongs in the table.
  for (const attribute of declaration.attributes ?? []) {
    if (
      properties.some(row => row.attribute === attribute.name.toLowerCase())
    ) {
      continue;
    }
    properties.push({
      name: attribute.fieldName ?? null,
      attribute: attribute.name.toLowerCase(),
      type: show(attribute.type),
      default: attribute.default ?? null,
      description: attribute.description ?? '',
      reflects: false,
      readonly: false,
      from: attribute.inheritedFrom?.name ?? null,
    });
  }

  const methods = members
    .filter(
      member =>
        member.kind === 'method' &&
        isPublic(member) &&
        !PLATFORM_METHODS.test(member.name)
    )
    .map(member => ({
      name: member.name,
      signature: `${member.name}(${(member.parameters ?? [])
        .map(
          parameter =>
            `${parameter.name}${parameter.optional ? '?' : ''}${
              parameter.type ? `: ${show(parameter.type)}` : ''
            }`
        )
        .join(
          ', '
        )})${member.return?.type ? `: ${show(member.return.type)}` : ''}`,
      description: member.description ?? '',
      from: from(member),
    }));

  const events = (declaration.events ?? []).map(event => {
    const type = show(event.type);
    const detail = /^CustomEvent<(.*)>$/.exec(type);
    return {
      name: event.name,
      detail: detail ? detail[1] : '',
      description: event.description ?? '',
    };
  });
  const slots = (declaration.slots ?? []).map(slot => ({
    name: slot.name,
    description: slot.description ?? '',
  }));
  const parts = (declaration.cssParts ?? []).map(part => ({
    name: part.name,
    description: part.description ?? '',
  }));
  const cssProperties = (declaration.cssProperties ?? []).map(property => ({
    name: property.name,
    default: property.default ?? null,
    description: property.description ?? '',
  }));

  const formControl = members.some(
    member => member.name === 'formAssociated' && member.static
  );
  const formField = (declaration.mixins ?? []).some(
    mixin => mixin.name === 'FormFieldMixin'
  );

  const undescribed = [
    ...properties
      .filter(row => !row.description)
      .map(row => `the property \`${row.name ?? row.attribute}\``),
    ...methods
      .filter(row => !row.description)
      .map(row => `the method \`${row.name}()\``),
    ...events
      .filter(row => !row.description)
      .map(row => `the event \`${row.name}\``),
    ...slots
      .filter(row => !row.description)
      .map(row => `the ${row.name ? `\`${row.name}\`` : 'default'} slot`),
    ...parts
      .filter(row => !row.description)
      .map(row => `the part \`${row.name}\``),
  ];

  const examples = notes?.examples ?? [];
  const accessibility = notes?.accessibility ?? [];
  const docGaps = [];
  if (!notes) docGaps.push('No notes file exists for this element yet.');
  if (examples.length === 0) docGaps.push('There is no example.');
  if (accessibility.length === 0) {
    docGaps.push('There are no accessibility notes.');
  }

  return {
    name,
    tag: declaration.tagName,
    className: declaration.name,
    title: titleOf(name),
    category: notes?.category ?? 'Layout',
    description: (declaration.description ?? '').replace(/\n(?!\n)/g, ' '),
    source: `packages/core/${declaration.path}`,
    sourceUrl: `${REPO}/blob/main/packages/core/${declaration.path}`,
    formControl,
    formField,
    properties,
    methods,
    events,
    slots,
    parts,
    cssProperties,
    types: [...used.values()].map(type => ({
      name: type.name,
      declaration: type.declaration,
    })),
    examples: examples.map(example => ({
      title: example.title,
      description: example.description ?? '',
      html: example.html.trim(),
      script: example.script?.trim() ?? '',
      // Set for an example that changes the page around it. The page then
      // shows it only when the reader asks.
      held: example.held ?? '',
    })),
    keyboard: notes?.keyboard ?? [],
    accessibility,
    gaps: notes?.gaps ?? [],
    docGaps,
    // The hand-written part: examples and accessibility notes.
    docsComplete: docGaps.length === 0,
    // The part that comes from the source: what has no description there.
    undescribed,
    apiItems:
      properties.length +
      methods.length +
      events.length +
      slots.length +
      parts.length,
    tests: coverage,
  };
}

/** The `--zeno-*` tokens the element's own source files read. */
async function tokensRead(element) {
  const dir = join(root, element.source.replace(/\/[^/]+$/, ''));
  const found = new Set();
  for (const file of await readdir(dir)) {
    if (!file.endsWith('.ts')) continue;
    const text = await readFile(join(dir, file), 'utf8');
    for (const [, token] of text.matchAll(/var\(\s*(--zeno-[a-z0-9-]+)/g)) {
      found.add(token);
    }
  }
  return [...found].sort();
}

/** Escapes text that is placed in MDX outside a code span. */
const mdx = text => text.replace(/[{}<>]/g, character => `\\${character}`);

function elementPage(element) {
  const lines = [
    '---',
    `title: ${JSON.stringify(element.title)}`,
    `description: ${JSON.stringify(firstSentence(element.description))}`,
    `slug: /elements/${element.name}`,
    // The page is generated. What a person can edit is its notes file.
    `custom_edit_url: ${REPO}/edit/main/apps/zeno-docs/element-docs/${element.name}.mjs`,
    '---',
    '',
    `{/* Generated by scripts/generate.mjs from ${element.source} and element-docs/${element.name}.mjs. Do not edit. */}`,
    '',
    `import data from '@site/src/generated/elements/${element.name}.json';`,
    `import run from '@site/src/generated/elements/${element.name}.examples.js';`,
    "import { ApiTable, Coverage, ElementIntro, Example, FormNotes, Keyboard, Notes, Tokens, TypeList } from '@site/src/components/element';",
    '',
    '<ElementIntro data={data} />',
    '',
    '## Examples',
    '',
  ];
  if (element.examples.length === 0) {
    lines.push('There is no example for this element yet.', '');
  }
  element.examples.forEach((example, index) => {
    lines.push(
      `### ${mdx(example.title)}`,
      '',
      `<Example example={data.examples[${index}]} run={run[${index}]} />`,
      ''
    );
  });

  const section = (title, rows, kind, empty) => {
    lines.push(`## ${title}`, '');
    lines.push(
      rows.length > 0
        ? `<ApiTable kind="${kind}" rows={data.${kind}} />`
        : empty,
      ''
    );
  };
  section(
    'Attributes and properties',
    element.properties,
    'properties',
    'This element has no attributes or properties of its own.'
  );
  if (element.methods.length > 0) {
    section('Methods', element.methods, 'methods', '');
  }
  section('Events', element.events, 'events', 'This element sends no events.');
  section('Slots', element.slots, 'slots', 'This element has no slots.');
  section('CSS parts', element.parts, 'parts', 'This element has no parts.');

  lines.push('## CSS custom properties', '');
  lines.push(
    element.cssProperties.length > 0
      ? '<ApiTable kind="cssProperties" rows={data.cssProperties} />'
      : 'This element documents no custom properties of its own. Style it through its parts and through the tokens it reads.',
    '',
    '<Tokens tokens={data.tokens} />',
    ''
  );
  if (element.types.length > 0) {
    lines.push('## Types', '', '<TypeList types={data.types} />', '');
  }

  lines.push('## Accessibility', '');
  lines.push('### Keyboard', '', '<Keyboard rows={data.keyboard} />', '');
  lines.push('### Forms', '', '<FormNotes data={data} />', '');
  lines.push(
    '### Notes',
    '',
    '<Notes items={data.accessibility} empty="No accessibility notes have been written for this element yet." />',
    ''
  );
  lines.push('## Tests and known gaps', '', '<Coverage data={data} />', '');
  return `${lines.join('\n')}`;
}

function exampleModule(element) {
  const functions = element.examples.map(example =>
    example.script
      ? `  function (document) {\n${example.script.replace(/^/gm, '    ')}\n  }`
      : '  null'
  );
  return `// Generated by scripts/generate.mjs from element-docs/${element.name}.mjs. Do not edit.
// Each function is the script of one example. \`document\` is scoped to the
// example, so a selector finds only that example's nodes.
export default [\n${functions.join(',\n')}${functions.length > 0 ? ',' : ''}\n];\n`;
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

const cssName = path =>
  `--zeno-${path
    .map(part => part.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`))
    .join('-')}`;

function flatten(tree, path = [], out = []) {
  for (const [key, value] of Object.entries(tree)) {
    if (
      value &&
      typeof value === 'object' &&
      'value' in value &&
      'type' in value
    ) {
      out.push({ path: [...path, key], type: value.type, value: value.value });
    } else if (value && typeof value === 'object') {
      flatten(value, [...path, key], out);
    }
  }
  return out;
}

async function readTokens() {
  const tokens = await readJson(join(root, 'packages/tokens/dist/tokens.json'));
  const css = await readFile(
    join(root, 'packages/tokens/dist/css/tokens.css'),
    'utf8'
  );
  const dark = new Map(
    flatten(tokens.dark).map(token => [token.path.join('.'), token.value])
  );
  const row = (token, themed) => {
    const variable = cssName(token.path);
    if (!css.includes(`${variable}:`)) {
      problems.push(`tokens: ${variable} is not in tokens.css`);
    }
    const name = token.path.join('.');
    return {
      name,
      variable,
      type: token.type,
      value: String(token.value),
      dark: themed ? String(dark.get(name) ?? '') : null,
    };
  };
  return {
    base: flatten(tokens.base).map(token => row(token, false)),
    theme: flatten(tokens.light).map(token => row(token, true)),
  };
}

// ---------------------------------------------------------------------------
// Releases
// ---------------------------------------------------------------------------

const BUMPS = ['patch', 'minor', 'major'];

function nextVersion(version, bump) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

async function readPendingChangesets() {
  const dir = join(root, '.changeset');
  const pending = [];
  for (const file of (await readdir(dir)).sort()) {
    if (!file.endsWith('.md') || file === 'README.md') continue;
    const text = await readFile(join(dir, file), 'utf8');
    const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
    if (!match) continue;
    const bumps = [...match[1].matchAll(/:\s*(patch|minor|major)\s*$/gm)].map(
      found => found[1]
    );
    pending.push({
      bump: BUMPS[Math.max(...bumps.map(bump => BUMPS.indexOf(bump)))],
      text: match[2].trim(),
    });
  }
  return pending;
}

async function releasesPage(version) {
  const changelog = await readFile(join(root, 'CHANGELOG.md'), 'utf8');
  const firstEntry = changelog.search(/^## /m);
  const released = firstEntry === -1 ? '' : changelog.slice(firstEntry).trim();
  const pending = await readPendingChangesets();

  const lines = [
    '---',
    'title: Releases',
    'description: Every version of Zeno, with its date and what changed.',
    'slug: /releases',
    'custom_edit_url: null',
    'format: md',
    '---',
    '',
    '<!-- Generated by scripts/generate.mjs from CHANGELOG.md and .changeset/. Do not edit. -->',
    '',
    '# Releases',
    '',
    'Every `@usezeno/*` package is released together and shares one version number. This page is built from the changelog in the repository, so it lists exactly what was published. For what a version number promises, see [Versioning and support](/versioning).',
    '',
  ];
  if (!released) {
    lines.push(
      ':::note[Nothing is published yet]',
      '',
      'No version of Zeno is on npm. The packages cannot be installed until the first release below is published.',
      '',
      ':::',
      ''
    );
  }
  if (pending.length > 0) {
    const bump =
      BUMPS[Math.max(...pending.map(entry => BUMPS.indexOf(entry.bump)))];
    lines.push(
      `## Next: ${nextVersion(version, bump)}`,
      '',
      'Not released. These changes are merged and waiting for the next release.',
      ''
    );
    for (const entry of pending) {
      const [first, ...rest] = entry.text.split('\n');
      lines.push(`- ${first}`, ...rest.map(line => `  ${line}`));
    }
    lines.push('');
  }
  if (released) {
    // "## 0.1.0 (2026-11-12)" reads better as a heading with a dash.
    lines.push(
      released.replace(/^## (\S+) \((\d{4}-\d{2}-\d{2})\)$/gm, '## $1 — $2'),
      ''
    );
  } else if (pending.length === 0) {
    lines.push('There are no releases and no changes waiting.', '');
  }
  return {
    page: lines.join('\n'),
    pending: pending.length,
    hasReleases: Boolean(released),
  };
}

// ---------------------------------------------------------------------------
// Example apps
// ---------------------------------------------------------------------------

const SOURCES = [
  'examples/html/index.html',
  'examples/html/src/app.ts',
  'examples/html/src/main.ts',
  'examples/react/src/App.tsx',
  'examples/vue/src/App.vue',
  'examples/svelte/src/App.svelte',
  'examples/shared/plans.ts',
];

// ---------------------------------------------------------------------------

async function main() {
  const manifestPath = join(core, 'dist/custom-elements.json');
  if (!existsSync(manifestPath)) {
    throw new Error(
      `${relative(root, manifestPath)} does not exist. Build the packages first: pnpm build`
    );
  }
  const manifest = await readJson(manifestPath);
  const declarations = manifest.modules
    .flatMap(module =>
      (module.declarations ?? []).map(declaration => ({
        ...declaration,
        path: module.path,
      }))
    )
    .filter(declaration => declaration.customElement && declaration.tagName)
    .sort((a, b) => a.tagName.localeCompare(b.tagName));
  const names = declarations.map(declaration =>
    declaration.tagName.replace(/^zeno-/, '')
  );

  const types = await readTypes();
  const coverage = await readCoverage(names);

  const notesDir = join(app, 'element-docs');
  const notes = new Map();
  for (const name of names) {
    const path = join(notesDir, `${name}.mjs`);
    if (!existsSync(path)) continue;
    const loaded = (await import(pathToFileURL(path).href)).default;
    if (!CATEGORIES.includes(loaded.category)) {
      problems.push(
        `element-docs/${name}.mjs: category must be one of ${CATEGORIES.join(', ')}`
      );
    }
    notes.set(name, loaded);
  }
  for (const file of await readdir(notesDir)) {
    if (file.endsWith('.mjs') && !names.includes(basename(file, '.mjs'))) {
      problems.push(`element-docs/${file}: there is no element with that name`);
    }
  }

  const attributesByTag = new Map(
    declarations.map(declaration => [
      declaration.tagName,
      new Set(
        // HTML attribute names have no case. The manifest keeps the case of
        // the property for an attribute that was not given a name.
        (declaration.attributes ?? []).map(attribute =>
          attribute.name.toLowerCase()
        )
      ),
    ])
  );

  const elements = [];
  for (const declaration of declarations) {
    const name = declaration.tagName.replace(/^zeno-/, '');
    const element = describeElement(
      declaration,
      types,
      coverage.get(name),
      notes.get(name)
    );
    element.tokens = await tokensRead(element);
    for (const example of element.examples) {
      checkExample(name, example, attributesByTag);
    }
    elements.push(element);
  }

  const tokens = await readTokens();
  const version = (await readJson(join(core, 'package.json'))).version;
  const releases = await releasesPage(version);

  const sources = {};
  for (const path of SOURCES) {
    sources[path] = (await readFile(join(root, path), 'utf8')).trimEnd();
  }

  if (problems.length > 0) {
    for (const problem of problems) console.error(`  - ${problem}`);
    throw new Error(`${problems.length} problem(s). Nothing was written.`);
  }

  // Write. Old output goes first so a removed element leaves no page behind.
  const pagesDir = join(app, 'docs/elements');
  const dataDir = join(app, 'src/generated');
  await rm(dataDir, { recursive: true, force: true });
  await mkdir(join(dataDir, 'elements'), { recursive: true });
  await mkdir(pagesDir, { recursive: true });
  for (const file of await readdir(pagesDir)) {
    if (file.endsWith('.mdx') && file !== 'index.mdx') {
      await rm(join(pagesDir, file));
    }
  }

  const write = (path, value) =>
    writeFile(
      path,
      typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`
    );
  for (const element of elements) {
    await write(join(pagesDir, `${element.name}.mdx`), elementPage(element));
    await write(join(dataDir, 'elements', `${element.name}.json`), element);
    await write(
      join(dataDir, 'elements', `${element.name}.examples.js`),
      exampleModule(element)
    );
  }
  await write(
    join(dataDir, 'elements.json'),
    elements.map(element => ({
      name: element.name,
      tag: element.tag,
      title: element.title,
      category: element.category,
      summary: firstSentence(element.description),
      formControl: element.formControl,
      examples: element.examples.length,
      gaps: element.gaps.length,
      docGaps: element.docGaps,
      docsComplete: element.docsComplete,
      undescribed: element.undescribed.length,
      apiItems: element.apiItems,
      keyboard: element.keyboard.length,
      accessibility: element.accessibility.length,
      tests: element.tests,
    }))
  );
  await write(join(dataDir, 'tokens.json'), tokens);
  await write(join(dataDir, 'sources.json'), sources);

  // The lockup for dark backgrounds draws its word in `currentColor`, so it
  // has to be in the page, not in an <img>, to take the text colour.
  const lockup = await readFile(
    join(app, 'static/img/zeno-lockup-on-dark.svg'),
    'utf8'
  );
  await write(join(dataDir, 'brand.json'), {
    lockupOnDark: lockup
      .replace(/<\?xml[^>]*\?>/, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim(),
  });
  await write(join(dataDir, 'site.json'), {
    version,
    published: releases.hasReleases,
    elements: elements.length,
    categories: CATEGORIES,
    repository: REPO,
  });
  await write(join(app, 'docs/releases.md'), releases.page);

  const complete = elements.filter(element => element.docsComplete).length;
  const apiItems = elements.reduce((sum, element) => sum + element.apiItems, 0);
  const undescribed = elements.reduce(
    (sum, element) => sum + element.undescribed.length,
    0
  );
  const tested = elements.filter(element => element.tests.files.length > 0);
  console.log(
    `Docs: ${elements.length} element pages (${complete} with complete docs, ` +
      `${tested.length} with their own browser tests, ` +
      `${tested.filter(element => element.tests.axe).length} checked with axe, ` +
      `${undescribed} of ${apiItems} API items with no description in the source), ` +
      `${tokens.base.length + tokens.theme.length} tokens, ` +
      `${releases.pending} change(s) waiting for release.`
  );
  if (process.argv.includes('--report')) {
    console.table(
      elements.map(element => ({
        element: element.name,
        category: element.category,
        examples: element.examples.length,
        a11y: element.accessibility.length,
        keyboard: element.keyboard.length,
        form: element.formControl ? 'yes' : '',
        tests: element.tests.files.length > 0 ? 'own' : 'smoke',
        axe: element.tests.axe ? 'yes' : '',
        story: element.tests.story ? 'yes' : '',
        gaps: element.gaps.length,
        'doc gaps': element.docGaps.length,
        'no description': `${element.undescribed.length}/${element.apiItems}`,
      }))
    );
  }
}

await main();

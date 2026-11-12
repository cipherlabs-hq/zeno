// Checks build/_headers against the pages that were just built.
//
// The content security policy lists the hash of each inline script it allows.
// When Docusaurus or the site config changes, an inline script can change or a
// new one can appear, and a browser would then block it without a word at
// build time. This script fails the build instead, and prints the hash to put
// in static/_headers.
//
//   node scripts/check-headers.mjs [build-dir]

import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const build = resolve(process.argv[2] ?? join(app, 'build'));

/** The headers of the rule for every path, by lower-case name. */
export function parseHeaders(text) {
  const headers = new Map();
  let inAll = false;
  for (const line of text.split('\n')) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      inAll = line.trim() === '/*';
      continue;
    }
    if (!inAll) continue;
    const at = line.indexOf(':');
    headers.set(
      line.slice(0, at).trim().toLowerCase(),
      line.slice(at + 1).trim()
    );
  }
  return headers;
}

/** A policy as a map from directive to its sources. */
export function parsePolicy(policy) {
  return new Map(
    policy
      .split(';')
      .map(part => part.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...sources]) => [name, sources])
  );
}

// Scripts a browser runs. A script with another type, such as JSON-LD, is
// data, and a policy does not apply to it.
const RUNS = new Set([
  '',
  'module',
  'text/javascript',
  'application/javascript',
]);

const attribute = (attributes, name) =>
  new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i').exec(attributes)?.[1];

async function main() {
  const problems = [];
  const headers = parseHeaders(await readFile(join(build, '_headers'), 'utf8'));
  const policy = parsePolicy(headers.get('content-security-policy') ?? '');
  if (policy.size === 0) {
    problems.push('build/_headers has no Content-Security-Policy for /*.');
  }
  const scriptSources = policy.get('script-src') ?? [];
  const styleSources = policy.get('style-src') ?? [];
  for (const unsafe of ["'unsafe-inline'", "'unsafe-eval'"]) {
    if (scriptSources.includes(unsafe)) {
      problems.push(`script-src allows ${unsafe}. Use a hash instead.`);
    }
  }

  const pages = (await readdir(build, { recursive: true })).filter(file =>
    file.endsWith('.html')
  );
  const inline = new Map();
  const outside = new Set();
  let inlineStyles = 0;
  let handlers = 0;

  for (const file of pages) {
    const html = await readFile(join(build, file), 'utf8');
    for (const [, attributes, body] of html.matchAll(
      /<script\b([^>]*)>([\s\S]*?)<\/script>/gi
    )) {
      const source = attribute(attributes, 'src');
      if (source !== undefined) {
        if (/^(https?:)?\/\//.test(source)) outside.add(source);
        continue;
      }
      if (!RUNS.has((attribute(attributes, 'type') ?? '').toLowerCase())) {
        continue;
      }
      const hash = `'sha256-${createHash('sha256').update(body).digest('base64')}'`;
      if (!inline.has(hash)) inline.set(hash, file);
    }
    for (const [, attributes] of html.matchAll(/<link\b([^>]*)>/gi)) {
      const href = attribute(attributes, 'href');
      const rel = attribute(attributes, 'rel') ?? '';
      if (href && /stylesheet|preload|modulepreload/.test(rel)) {
        if (/^(https?:)?\/\//.test(href)) outside.add(href);
      }
    }
    for (const [, attributes] of html.matchAll(
      /<(?:img|iframe|source)\b([^>]*)>/gi
    )) {
      const source = attribute(attributes, 'src');
      if (source && /^(https?:)?\/\//.test(source)) outside.add(source);
    }
    inlineStyles += (html.match(/<style\b|\sstyle="/gi) ?? []).length;
    handlers += (html.match(/<[^>]+\son[a-z]+="/gi) ?? []).length;
  }

  for (const [hash, file] of inline) {
    if (!scriptSources.includes(hash)) {
      problems.push(
        `An inline script in ${file} is not in script-src. Add ${hash} to static/_headers.`
      );
    }
  }
  for (const source of scriptSources) {
    if (source.startsWith("'sha256-") && !inline.has(source)) {
      problems.push(
        `script-src lists ${source}, which no page uses any more. Take it out of static/_headers.`
      );
    }
  }
  if (inlineStyles > 0 && !styleSources.includes("'unsafe-inline'")) {
    problems.push(
      "The pages use inline styles, and style-src has no 'unsafe-inline'."
    );
  }
  if (handlers > 0) {
    problems.push(
      `${handlers} inline event handler(s) such as onclick="" would be blocked.`
    );
  }
  for (const source of outside) {
    problems.push(
      `A page loads ${source} from another origin, which the policy blocks.`
    );
  }
  for (const name of [
    'x-content-type-options',
    'referrer-policy',
    'permissions-policy',
    'strict-transport-security',
  ]) {
    if (!headers.has(name))
      problems.push(`build/_headers has no ${name} for /*.`);
  }

  if (problems.length > 0) {
    console.error(
      `Headers check failed:\n${problems.map(line => `  - ${line}`).join('\n')}`
    );
    process.exit(1);
  }
  console.log(
    `Headers: ${pages.length} pages, ${inline.size} inline script(s), all covered by the policy in _headers.`
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}

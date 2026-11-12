# Releasing Zeno

How a release is made, how the site is hosted, and the list of steps that take
Zeno from this repository to npm and the web for the first time.

**State on 2026-11-11:** the repository is public at `cipherlabs-hq/zeno`,
`CI` passes on GitHub, and the site is live at zeno.thecipherlabs.com. Nothing
is on npm yet, so no release has been made. Each section says what has been
tried and what has not.

## What gets released

Seven packages, always together and always with the same version number:

| Package                | Depends on                              |
| ---------------------- | --------------------------------------- |
| `@usezeno/tokens`      | nothing                                 |
| `@usezeno/core`        | `@usezeno/tokens`                       |
| `@usezeno/react`       | `@usezeno/core`                         |
| `@usezeno/svelte`      | `@usezeno/core`                         |
| `@usezeno/composables` | `@usezeno/core`                         |
| `@usezeno/vue`         | `@usezeno/core`, `@usezeno/composables` |
| `@usezeno/styles`      | nothing, and nothing depends on it      |

They are a Changesets "fixed" group (`.changeset/config.json`), so one bump
moves all seven. The Storybook, the site and the examples are never published.

## How a release works

1. A pull request that changes a package adds a changeset (`pnpm changeset`):
   a small Markdown file that says what changed, for the people who use the
   packages.
2. When changesets are on `main`, the `Release` workflow
   (`.github/workflows/release.yml`) opens or updates a pull request called
   "Version packages". It runs `pnpm release:version`, which is
   `changeset version` followed by `scripts/release-changelog.mjs`. Together
   they set the new version in each package, write each package's
   `CHANGELOG.md`, add one dated entry to the root `CHANGELOG.md`, and delete
   the changesets.
3. GitHub does not start workflows on a pull request that GitHub Actions
   opened. Run the `CI` workflow by hand on the "Version packages" branch
   (Actions, CI, Run workflow) before merging it.
4. Merging that pull request leaves no changesets on `main` and package
   versions that are not on npm. The workflow then:
   - `pack`: installs, builds, runs `generate:check`, `typecheck`, `test` and
     `release:check`, and packs the tarballs
   - `publish`: publishes those tarballs to npm, pushes one tag per package
     (`@usezeno/core@0.1.0`) and creates the GitHub Releases
5. The site's Releases page is built from the root `CHANGELOG.md`, so the same
   merge updates it when Cloudflare Pages rebuilds the site.

The `publish` job is the only one that can ask GitHub for an identity token,
and it never runs a build. There is no npm token in the repository: npm
accepts the publish because the package's trusted publisher is this
repository and this workflow file.

### What was tried locally

- `changeset version` and `scripts/release-changelog.mjs` in a throwaway
  clone with the seven packages made public: all seven went to 0.1.0 and the
  root changelog got `## 0.1.0 (date)`.
- `changeset version` with every package still private: no file changes, and
  the changeset stays where it is. Nothing is versioned or published while the
  packages are private.
- `changeset pack` at 0.1.0: seven tarballs. `workspace:*` became the exact
  version `0.1.0`.
- `pnpm release:check` (`scripts/check-packages.mjs`): packs each package and
  fails if a tarball carries tests, stories, secrets or `node_modules`, if an
  export points at a missing file, or if a source map names a source that is
  not in the tarball.
- `node scripts/try-install.mjs --tarballs <dir>`: installs the seven
  tarballs into a new project outside the repository, type-checks a React
  file against the shipped types, and loads a bundled page in Chromium.

### What has run on GitHub

- `CI` on `main`, on GitHub's Linux runners, browser tests included.
- `Release`, once, while every package was still private. Its `version` job
  ran, changed no file, published nothing, and opened an empty "Version
  packages" pull request, which was closed.

### What was not tried

A "Version packages" pull request with changes in it, the publish to npm,
trusted publishing, provenance, the tags and the GitHub Releases. The first
release is the test of all of them.

## The changelog

- Root `CHANGELOG.md`: one entry per release, written by
  `pnpm release:version`. Do not edit it by hand.
- `packages/*/CHANGELOG.md`: written by Changesets. They do not exist until
  the first version bump.
- The date in the root changelog is the day the "Version packages" pull
  request was last updated, in UTC. If it is merged on a later day, the date
  is that much early. Push to `main` or re-run the workflow to refresh it.
- The site shows "Nothing is published yet" until the root changelog has its
  first entry. It reads the changelog, not npm, so if a publish fails after
  the merge the site says the version is out when it is not.

## The site on Cloudflare Pages

The site is the Docusaurus project in `apps/zeno-docs`. The Pages project is
called `usezeno`, so its own address is `usezeno.pages.dev`, and its custom
domain is `zeno.thecipherlabs.com`. It is connected to the GitHub repository
with these settings, and it builds with them. A pull request gets a preview
address from Pages.

| Setting                | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Production branch      | `main`                                         |
| Framework preset       | None                                           |
| Root directory         | the repository root (leave it empty)           |
| Build command          | `pnpm docs:build`                              |
| Build output directory | `apps/zeno-docs/build`                         |
| Node.js                | 22, read from `.nvmrc`. Or set `NODE_VERSION`. |
| Environment variable   | `PNPM_VERSION` = `10.12.1`                     |

`pnpm docs:build` builds `@usezeno/tokens` and `@usezeno/core`, generates the
element pages from the built manifest, builds the site, and then checks the
built pages against `_headers`.

The root directory has to be the repository root: the site depends on two
workspace packages and the lockfile is at the root.

Pages installs the dependencies with pnpm by itself: no install command and
no `SKIP_DEPENDENCY_INSTALL` are set.

### Headers

`apps/zeno-docs/static/_headers` is copied into the build and read by Pages.
It sets a content security policy, the usual security headers, long caching
for the hashed files in `/assets/`, and `noindex` on `*.pages.dev` addresses
so that only `zeno.thecipherlabs.com` is indexed.

- The policy allows one inline script by its hash: the small script
  Docusaurus puts at the top of every page to set the theme before the page
  is drawn. `scripts/check-headers.mjs` runs at the end of every site build
  and fails when the hash no longer matches, when a page loads something from
  another origin, or when a required header is missing. It prints the new
  hash to put in `_headers`.
- Inline `style` attributes are allowed (`style-src 'unsafe-inline'`).
  Docusaurus and the live examples use them.
- Anything loaded from another origin is blocked. That includes Cloudflare
  Web Analytics. Change the policy before turning on a service like that.
- `Strict-Transport-Security` is set for one year, without
  `includeSubDomains`.
- The policy was tried in Chromium by adding the headers to a local preview
  (`apps/zeno-docs/scripts/preview-screenshots.mjs`). On 2026-11-11 the
  headers were read as Cloudflare serves them on both addresses, and an
  element page on `usezeno.pages.dev` loaded in Chromium with nothing in the
  console. Firefox and Safari have not been tried.
- Cloudflare puts its own "content signals" text at the top of
  `/robots.txt` on the custom domain. It is a setting of the
  `thecipherlabs.com` zone, not a file in this repository.

No `_redirects` file is needed. Pages serves `/elements` from
`elements.html`, Docusaurus writes `404.html`, and the site has no old
addresses to keep alive.

## Going public: the checklist

In order. "Owner" steps need an account, a decision or a login. "Agent" steps
are changes in the repository that can be prepared as a pull request. Steps 1
to 9 and step 13 were done on 2026-11-11 and say what was done. The others
are still to do.

### Before anything is pushed

1. **Done. What the history shows.** The public history starts at one commit
   authored with the company email address. The earlier history was not
   pushed.
2. **Done. Which packages are published.** All seven. Nothing depends on
   `@usezeno/styles`, so it could have stayed private. `@usezeno/vue` depends
   on `@usezeno/composables`, so those two go together. `pnpm release:check`
   fails if a public package depends on a private one.

### Repository

3. **Done. The public repository `cipherlabs-hq/zeno`.** The name matters:
   the workflows only run in `cipherlabs-hq/zeno`, and npm compares it with
   `repository.url` in each `package.json`.
4. **Done. Repository settings:**
   - Settings, Actions, General: "Allow GitHub Actions to create and approve
     pull requests" is on. The "Version packages" pull request needs it.
   - Settings, Code security: "Private vulnerability reporting" is on.
     `SECURITY.md` and the site send people there. Secret scanning and push
     protection are on.
   - A ruleset protects `main`: changes need a pull request and the `check`
     job of the `CI` workflow, and nobody can force-push or delete it.
5. **Done. `main` was pushed.** `CI` passed. `Release` ran too: it found the
   first changeset, so its `version` job started, but `changeset version`
   changes no file while the packages are private. Nothing was published. It
   did open an empty "Version packages" pull request, which was closed.
6. **Done. The first CI run passed** as pushed, browser tests included. Until
   then they had only run on a Mac.

### Site

7. **Done. The Cloudflare Pages project `usezeno`,** made from the repository
   with the settings above. The first build passed.
8. **Done. The custom domain `zeno.thecipherlabs.com`.** The
   `thecipherlabs.com` zone is in the same Cloudflare account, so Pages added
   the DNS record itself: `CNAME`, name `zeno`, target `usezeno.pages.dev`,
   proxied.
9. **Done. The live site was checked:** the response headers on
   `https://zeno.thecipherlabs.com`, no errors in the browser console on
   `usezeno.pages.dev` (a blocked script shows up there), and that the
   `*.pages.dev` address answers with `X-Robots-Tag: noindex`.

### npm

10. **Owner. Make sure the `usezeno` organisation on npm exists** and that
    your account can publish to it with two-factor authentication on.
11. **Owner. Decide how the first version gets onto npm.** npm sets up a
    trusted publisher in the settings of a package that already exists. The
    seven packages do not exist yet. The choices:
    - **A. Publish 0.1.0 by hand, then switch.** After step 14, download the
      tarballs the `pack` job made, or build them with
      `pnpm release:check --keep <dir>`, and run `npm publish <tarball>` for
      each from your own machine, `tokens` first. Then set up the trusted
      publishers. From 0.1.1 on, the workflow publishes. 0.1.0 has no
      provenance, and its tags and GitHub Releases have to be made by hand.
    - **B. Reserve the names first.** Publish a placeholder of each package
      by hand (an empty package made outside this repository, at a version
      below 0.1.0), set up the trusted publishers, and let the workflow
      publish 0.1.0 with provenance, tags and GitHub Releases. This is the
      only choice where 0.1.0 goes through the workflow as written. The
      placeholder versions stay on npm for good. Deprecate them.
    - **C. A short-lived token for the first release only.** Needs a change
      to `release.yml` and a secret in the repository, both removed
      afterwards.

    **Decided: B.** The placeholders are version 0.0.1 and hold a README and
    nothing else. Deprecate each one as soon as it is published, so nobody
    installs an empty package without a warning:
    `npm deprecate @usezeno/<name>@0.0.1 "Placeholder that reserved the name. Use 0.1.0 or later."`
    The warning only applies to 0.0.1. It goes away when 0.1.0 is the latest
    version.

    Do not merge "Version packages" (step 15) until the placeholders are on
    npm and step 12 is done. The publish fails for a package npm does not
    know, or one without a trusted publisher.

12. **Owner. Set up the trusted publisher for each published package** on
    npmjs.com (package, Settings, Trusted publishing), when the package
    exists:
    - Organisation or user: `cipherlabs-hq`. Repository: `zeno`.
    - Workflow file name: `release.yml`. No environment.
    - Allow `npm publish`. A configuration that only allows staged
      publishing does not work: Changesets publishes with `npm publish`.
    - npm removes a new configuration that has not published within two
      days, so do this close to the release.

### The first release

13. **Done. `private` was flipped,** in one pull request, while
    `.changeset/first-release.md` was still there. The line
    `"private": true,` is gone from `package.json` in `packages/tokens`,
    `core`, `react`, `vue`, `svelte`, `composables` and `styles`. It stays in
    the root `package.json`, `packages/storybook`, `apps/zeno-docs` and
    `examples/*`. `pnpm release:check` passed: it fails when a public package
    is still at 0.0.0 with no changeset waiting, which is the state that
    would publish 0.0.0.

14. **Owner. Merge that pull request.** `Release` now finds a changeset and public packages
    and opens "Version packages": 0.1.0 in every published package, the
    package changelogs, and the entry in the root `CHANGELOG.md`.
15. **Owner. Run `CI` by hand on the "Version packages" branch,** read the
    diff, and merge it when CI is green.
16. **Owner. Watch the `Release` run.** `pack` builds and tests, `publish`
    publishes. With choice A in step 11 the publish step fails for packages
    npm does not know yet: publish by hand, then set up step 12.
17. **Agent. Check what was published:**

    ```bash
    node scripts/try-install.mjs --version 0.1.0
    ```

    It installs the packages from npm into a new project outside the
    repository and runs the same checks as before the release. Also look at
    each package page on npmjs.com for the provenance badge, at the seven
    tags, and at the GitHub Releases.

18. **Agent. Check the site** says 0.1.0 and no longer says that nothing is
    published.

## If a release goes wrong

- **The publish failed part of the way.** Re-run the `Release` workflow.
  Changesets only publishes versions that are not on npm yet, so the re-run
  should pick up the rest. This has not been tried.
- **A bad version is on npm.** Do not unpublish. Run
  `npm deprecate @usezeno/<name>@<version> "<reason>"` for each package and
  release a fix as the next patch.
- **0.0.0 was published.** Deprecate it the same way. The guard in
  `pnpm release:check` exists to stop this.

## Later releases

Add changesets, merge the "Version packages" pull request when it is time.
While Zeno is below 1.0 a breaking change is a `minor`. See "Versioning and
support" on the site for what a version promises.

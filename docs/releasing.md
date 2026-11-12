# Releasing Zeno

How a release is made, how the site is hosted, and the list of steps that take
Zeno from this repository to npm and the web for the first time.

**State on 2026-11-11:** nothing here has run outside a laptop. There is no
GitHub repository, nothing is on npm, and the site is not deployed. Every
package is marked `"private": true`. The parts that could be tried locally were
tried, and each section says which.

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

### What was not tried

The workflows have never run. Not tried: the "Version packages" pull request,
the publish to npm, trusted publishing, provenance, the tags and the GitHub
Releases. The first release is the test of all of them.

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

The site is the Docusaurus project in `apps/zeno-docs`. These are the settings
for a Pages project connected to the GitHub repository. They come from the
Cloudflare documentation and a clean local build. No deploy has been made, so
treat the first deploy as the test.

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

Not confirmed: that Pages installs the dependencies with pnpm by itself when
it finds `pnpm-lock.yaml`. If the first build fails at the install step, set
`SKIP_DEPENDENCY_INSTALL` = `1` and change the build command to
`pnpm install --frozen-lockfile && pnpm docs:build`.

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
  (`apps/zeno-docs/scripts/preview-screenshots.mjs`). It has not been seen
  served by Cloudflare.

No `_redirects` file is needed. Pages serves `/elements` from
`elements.html`, Docusaurus writes `404.html`, and the site has no old
addresses to keep alive.

## Going public: the checklist

In order. "Owner" steps need an account, a decision or a login. "Agent" steps
are changes in the repository that can be prepared as a pull request.

### Before anything is pushed

1. **Owner. Decide what the history shows.** Every commit is authored with a
   personal email address, and it becomes public with the repository. Keep
   it, or rewrite the history before the first push. After the push it cannot
   be taken back.
2. **Owner. Decide which packages are published.** Nothing depends on
   `@usezeno/styles`, so it can stay private. `@usezeno/vue` depends on
   `@usezeno/composables`, so those two go together. `pnpm release:check`
   fails if a public package depends on a private one.

### Repository

3. **Owner. Create the public repository `cipherlabs-hq/zeno`**, empty, with
   no README or licence added by GitHub. The name matters: the workflows only
   run in `cipherlabs-hq/zeno`, and npm compares it with `repository.url` in
   each `package.json`.
4. **Owner. Set up the repository before the first push:**
   - Settings, Actions, General: turn on "Allow GitHub Actions to create and
     approve pull requests". The "Version packages" pull request needs it.
   - Settings, Code security: turn on "Private vulnerability reporting".
     `SECURITY.md` and the site send people there.
   - Protect `main`: require a pull request and the `check` job of the `CI`
     workflow.
5. **Owner. Push `main`.**

   ```bash
   git remote add origin git@github.com:cipherlabs-hq/zeno.git
   git push -u origin main
   ```

   `CI` runs. `Release` runs too. It finds the first changeset, so its
   `version` job starts, but `changeset version` changes no file while the
   packages are private, and nothing is published. Whether the job still
   opens an empty pull request has not been seen. Close it if it does.

6. **Agent. Check the first CI run** and fix what differs from the local
   runs. The browser tests have only ever run on a Mac.

### Site

7. **Owner. Create the Cloudflare Pages project** from the repository with
   the settings above. Check the `*.pages.dev` address it gives you.
8. **Owner. Add the custom domain `zeno.thecipherlabs.com`** to the Pages
   project. If the `thecipherlabs.com` zone is in the same Cloudflare account,
   Pages adds the DNS record itself. If not, add it by hand in the zone:
   `CNAME`, name `zeno`, target `<project>.pages.dev`, proxied.
9. **Agent. Check the live site:** the response headers on
   `https://zeno.thecipherlabs.com`, no errors in the browser console (a
   blocked script shows up there), and that the `*.pages.dev` address answers
   with `X-Robots-Tag: noindex`.

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

    This document does not pick one. Whichever it is, do not flip `private`
    (step 13) until it is settled.

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

13. **Agent. Flip `private`,** in one pull request, while
    `.changeset/first-release.md` is still there:
    - delete the line `"private": true,` from `package.json` in
      `packages/tokens`, `core`, `react`, `vue`, `svelte`, `composables` and,
      if it is being published, `styles`
    - leave it in the root `package.json`, `packages/storybook`,
      `apps/zeno-docs` and `examples/*`
    - in the root `README.md`, replace the two sentences in "Status" that
      say nothing is published and the packages are private
    - in `.github/workflows/release.yml`, remove the comment that says
      nothing is versioned or published while every package is private
    - run `pnpm release:check`. It fails when a public package is still at
      0.0.0 with no changeset waiting, which is the state that would publish
      0.0.0.

    Nothing else changes: `publishConfig`, `exports`, `files`, `repository`
    and the rest are already in place.

14. **Owner. Merge it.** `Release` now finds a changeset and public packages
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

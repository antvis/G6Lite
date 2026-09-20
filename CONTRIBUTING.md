# Contributing to G6Lite

First off, thanks for taking the time to contribute! 🎉

G6Lite is a 100% WebGL, AI-first high-performance graph engine in the [AntV](https://antv.antgroup.com/) family. This guide explains how to propose changes and get them merged.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Workflow](#workflow)
- [Commit Convention](#commit-convention)
- [Developer Certificate of Origin (DCO)](#developer-certificate-of-origin-dco)
- [Pull Request Checklist](#pull-request-checklist)
- [Reporting Bugs & Requesting Features](#reporting-bugs--requesting-features)

## Code of Conduct

This project and everyone participating in it is governed by the
[Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to
uphold it. Please report unacceptable behavior to the maintainers.

## Ways to Contribute

- **Report bugs** — open an issue with a minimal reproduction.
- **Request features** — open an issue describing the use case.
- **Improve docs** — fix typos, clarify guides, add examples.
- **Submit code** — fix bugs or implement features via a Pull Request.

If you plan a large change, please open an issue to discuss it first so we can
align on the approach before you invest time.

## Development Setup

G6Lite uses **npm**. Lockfiles are local-only and are not committed to the repository.

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/G6Lite.git
cd G6Lite

# 2. Install dependencies
npm install

# 3. Run the playground (dev server)
npm run dev

# 4. Run the core CI checks before pushing
npm run ci   # lint + typecheck + test + library build + size limit
```

### Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server for `playground/` |
| `npm run build` | Build the library (`tsc` → `dist/`) |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | ESLint + Prettier checks; append `-- --fix` to fix |
| `npm run test` | Vitest; append `-- --watch` or `-- --coverage` as needed |
| `npm run benchmark` | Performance suites under `tests/perf/` |
| `npm run ci` | Run the core library checks used by CI |
| `npm run site` | Generate API docs and build the documentation site |

## Workflow

1. **Fork** the repo and create a topic branch from `master`:
   ```bash
   git checkout -b feat/my-feature   # or fix/..., docs/..., chore/...
   ```
2. **Make your change** with tests where applicable.
3. **Run `npm run ci`** locally and make sure it passes.
4. **Commit** using the [Conventional Commits](#commit-convention) format.
5. **Push** to your fork and open a **Pull Request** against `master`.
6. **CI must be green** and at least one maintainer review is required before merge.

We use **squash merge**, so keep your PR focused on a single logical change.

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). A commit
message looks like:

```
<type>(<optional scope>): <subject>
```

Common types:

| Type | When to use |
| --- | --- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `perf` | A performance improvement |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or fixing tests |
| `chore` | Build process, tooling, dependencies |

Examples:

```
feat(combo): support dragging collapsed combos
fix(picking): use viewport coords for hit detection
docs(metrics): add bundle-size report
```

## Developer Certificate of Origin (DCO)

By contributing, you certify that you wrote the code or otherwise have the right
to submit it under the project's MIT license, per the
[Developer Certificate of Origin](https://developercertificate.org/).

Sign off each commit with the `-s` flag:

```bash
git commit -s -m "feat: my change"
```

This appends a `Signed-off-by: Your Name <your@email.com>` line to the commit
message.

## Pull Request Checklist

Before requesting review, please confirm:

- [ ] `npm run ci` passes locally
- [ ] New code has tests (or you've explained why not)
- [ ] Public API changes are documented in `docs/`
- [ ] The PR description follows the template (context / approach / impact / testing / screenshots)
- [ ] Commits follow Conventional Commits and are signed off (DCO)

## Reporting Bugs & Requesting Features

Use the issue forms:

- 🐛 **Bug report** — include version, environment, reproduction steps, and expected vs. actual behavior.
- ✨ **Feature request** — describe the problem and your proposed solution.
- ❓ **Question** — for usage questions (consider GitHub Discussions for open-ended topics).

Thanks again for contributing to G6Lite! 💙

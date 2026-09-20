# G6Lite website

The product website and API documentation live in this directory. It uses Next.js, Fumadocs, MDX, and static export.

## Content model

- Chinese is the default language.
- Chinese documentation lives in `content/docs/zh`, and English documentation lives in `content/docs/en`.
- English routes use `/en`; Fumadocs maps the language directories with its `dir` locale parser.
- Documentation is organized into quick start, core concepts, configuration, API, examples, technical metrics, and compatibility.
- Generated API content comes from the package-root exports through TypeDoc.
- Website examples consume `playground/demos/catalog.json`; the deployed Playground is copied into the static site after the Next.js build.

## Development

From the repository root:

```bash
npm install
npm --prefix site install
npm --prefix site run dev
```

Open `http://localhost:3000`.

## Validation and build

```bash
npm --prefix site run types:check
node scripts/check-examples.mjs --profile release
npm run site
```

`npm run site` regenerates TypeDoc from `site/typedoc.json`, builds the Playground, statically exports the site to `site/out`, and copies the Playground to `site/out/playground`.

Use `NEXT_PUBLIC_SITE_URL` when validating a non-production canonical origin. Use `NEXT_PUBLIC_BASE_PATH` only for a deployment that actually serves the site under a subpath.

Search is intentionally disabled: the static site does not ship a search service or search index.

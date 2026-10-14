# Production Site Domain

## Goal

Use `g6lite.antv.vision` as the production website domain everywhere the repository currently references `g6-gl.antv.vision`.

## Scope

- Update the package homepage and site URL fallback.
- Update the deployment workflow's canonical URL and GitHub Pages CNAME.
- Update all README website links in each supported language.
- Preserve existing routes, locale prefixes, and documentation paths.

## Acceptance Criteria

- No production site references to `g6-gl.antv.vision` remain.
- All existing site links target `g6lite.antv.vision` without changing their paths.
- Deployment generates a CNAME containing `g6lite.antv.vision`.
- No unrelated project naming or historical changelog references are changed.

## Validation

- Search the repository for the old and new domains.
- Run the existing site build and repository checks relevant to the changed files.

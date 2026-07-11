# Documentation site

Hand-authored static HTML documentation for the workflow-server: semantic HTML pages, one shared stylesheet ([style.css](style.css)), and inline SVG diagrams. No client-side JavaScript.

The markdown files in the repository (`README.md`, `SETUP.md`, `docs/`, `schemas/README.md`) are the **canonical documentation source** for editing. The HTML site is the **browsable view** for reading: shorter prose, diagrams, and direct links to every page.

## Navigation

Every page includes **generated global navigation** (Guide, Architecture, API, Internals, Design) produced by [`scripts/generate-site-data.ts`](../scripts/generate-site-data.ts). The route registry lives in that script as `SITE_ROUTES`. Run `npm run build:site` after adding a page or changing nav structure.

Hand-authored regions sit outside `<!-- BEGIN GENERATED … -->` / `<!-- END GENERATED … -->` markers. Generated regions include:

| Marker | Content |
|--------|---------|
| `GENERATED NAV` | Global documentation nav in the header |
| `GENERATED BREADCRUMB` | Section breadcrumb below the header |
| `GENERATED PAGINATION` | Previous/next links for sequenced pages |
| `GENERATED` (content) | Tool and schema reference bodies on `api/tools.html` and `api/schemas.html` |

`tests/site.test.ts` fails when generated regions drift. `npm run check:site` verifies internal links and anchors.

## Linking policy

- **Prefer on-site HTML** when a mirror page exists (`guide/`, `specs/`, `api/`, `internals/`, `design/`).
- **Link to GitHub markdown** for editing source or for documents with no HTML mirror (for example `docs/development.md`, normative specifications).
- Label GitHub targets as "(source)" or "edit source" where it helps readers choose the right destination.

## Readability conventions

- User-facing pages use short paragraphs (`.prose`, max ~65 characters per line).
- Contributor-only pages use `.contributor-note` at the top.
- Dense API and schema material uses native `<details>` for full descriptions and nested fields.
- Tables and diagrams may use the full layout width.

Open [index.html](index.html) directly in a browser to preview. How the whole documentation system fits together is described in [docs/documentation-system.md](../docs/documentation-system.md).

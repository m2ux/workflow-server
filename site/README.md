# Documentation site

Hand-authored static HTML documentation for the workflow-server: semantic HTML pages, one shared stylesheet ([style.css](style.css)), and inline SVG diagrams. No site-generator toolchain.

The markdown files in the repository (`README.md`, `SETUP.md`, `docs/`, `schemas/README.md`) are the **canonical documentation source**; the pages under `guide/`, `specs/`, and `api/` are the navigable, illustrated view over them and link back to their sources. Two sections go beyond the markdown: `internals/` documents the server implementation (its canonical source is the code in `src/`, which every page links to), and `design/` records design rationale distilled from the engineering branch's decision records. Open [index.html](index.html) directly in a browser to preview.

How the whole documentation system fits together — every source's purpose and audience, and where new documentation belongs — is described in [docs/documentation-system.md](../docs/documentation-system.md).

# Documentation System

How this repository's documentation is organized: what each source is for, who it serves, and where new documentation belongs.

## The two layers

**Markdown is canonical.** Every fact about the system lives in a markdown file in this repository, and those files are the source of truth.

**The HTML site renders it.** [`site/`](../site/) is a hand-authored static documentation site — semantic HTML, one shared stylesheet, inline SVG diagrams, no client-side JavaScript — that presents the same material as a navigable, illustrated view. **Prefer on-site HTML links for reading**; link to markdown on GitHub for editing or for documents with no HTML mirror.

[`scripts/generate-site-data.ts`](../scripts/generate-site-data.ts) maintains a route registry (`SITE_ROUTES`) and regenerates global navigation, breadcrumbs, pagination, and the API reference bodies (`npm run build:site`). `tests/site.test.ts` fails when generated regions drift; `npm run check:site` verifies internal links and anchors.

Two site sections have no markdown counterpart because their canonical source is not markdown: `site/internals/` documents the server implementation (canonical source: the code in `src/`, `scripts/`, and `tests/`, which every page links to), and `site/design/` records design rationale distilled from the decision records on the engineering branch. When the implementation or a recorded decision changes, those pages are updated in the same change.

## Source map

| Source | Purpose | Audience |
|--------|---------|----------|
| [`README.md`](../README.md) | Project overview, quick start, the workflow model at a glance | Everyone — first contact |
| [`setup.md`](../setup.md) | Shared install sequence: transport, init-repo, IDE rule, day-two | Integrators |
| [`docs/engineering-storage.md`](engineering-storage.md) | How product repos store engineering (orphan, shared monorepo, in-branch) | Integrators |
| [`http.md`](../http.md) / [`stdio.md`](../stdio.md) | Transport-only differences (Docker/HTTP vs local stdio MCP config) | Integrators |
| [`docs/ide-setup.md`](ide-setup.md) | The always-applied bootstrap rule and connection verification | Integrators configuring an agent |
| [`docs/api-reference.md`](api-reference.md) | Catalog of MCP tools and HTTP routes (brief; links out for depth) | Integrators |
| [`docs/architecture.md`](architecture.md) | Hub for the six architecture models | Contributors |
| [`docs/dispatch_model.md`](dispatch_model.md), [`checkpoint_model.md`](checkpoint_model.md), [`state_management_model.md`](state_management_model.md), [`artifact_management_model.md`](artifact_management_model.md), [`resource_resolution_model.md`](resource_resolution_model.md), [`workflow-fidelity.md`](workflow-fidelity.md) | Behavioral deep specs (session, checkpoints, delivery, fidelity, …) | Contributors and agents needing depth |
| [`site/api/tools.html`](../site/api/tools.html) | Wire tool descriptions and parameter schemas (generated from `src/tools/`) | Agents / IDE tooling |
| [`docs/technique-protocol-specification.md`](technique-protocol-specification.md) | Normative contract for technique files: anatomy, addressing, composition, delivery | Workflow authors |
| [`docs/orchestra-specification.md`](orchestra-specification.md) | Normative workflow/activity definition language: primitives, grammar, constraints | Workflow authors |
| [`docs/development.md`](development.md) | Contributing to the server: build, test, conventions | Contributors |
| [`schemas/README.md`](../schemas/README.md) | Schema guide for authoring workflow definitions | Workflow authors |
| `schemas/*.schema.json` | JSON Schemas generated from the Zod sources (`npm run build:schemas`) | Authoring-time validation and tooling |
| [`site/`](../site/) | The rendered documentation site: user guide, technical specs, API reference, server internals, design rationale | Readers in a browser |
| `AGENTS.md`, `CLAUDE.md`, `.claude/rules/` | Instructions for AI agents working in this repository | AI agents |
| Engineering root (`.engineering/` or `$INSTALL/engineering/<owner>/<repo>`) | Planning artifacts, work packages, ADRs — engineering process, not product documentation | Project engineering |

Workflow definitions themselves (the `workflows` branch, checked out as a worktree) carry their own documentation inside each workflow's `techniques/` and `resources/` folders.

## Where new documentation belongs

- **A user-facing how-to** (installing, configuring, running) → `README.md` for first contact, [`setup.md`](../setup.md) for the shared sequence, [`http.md`](../http.md) / [`stdio.md`](../stdio.md) only for transport differences, `docs/ide-setup.md` for agent wiring; plus a page under `site/guide/` if it warrants the illustrated treatment.
- **A new architecture model or a change to one** → a `docs/*_model.md` document, linked from the [`docs/architecture.md`](architecture.md) hub, with a matching page under `site/specs/`.
- **Tool or schema surface changes** → the code and Zod schemas are the source; regenerate `schemas/` (`npm run build:schemas`) and the site's API pages (`npm run build:site`). Keep [`docs/api-reference.md`](api-reference.md) as a short index (update one-line descriptions and links); put behavioral depth in the relevant architecture model.
- **Workflow-authoring contracts** → the normative specifications ([`technique-protocol-specification.md`](technique-protocol-specification.md), [`orchestra-specification.md`](orchestra-specification.md)) and [`schemas/README.md`](../schemas/README.md).
- **Implementation documentation** (module structure, request handling, on-disk state, the guard and test system) → a page under `site/internals/`, linking to the source files it describes.
- **Design rationale** (why an architectural decision stands) → record the decision as an ADR on the engineering branch first, then surface the distilled rationale on `site/design/rationale.html`.
- **Engineering process artifacts** (plans, analyses, reviews, ADRs) → under the engineering root (`artifacts/` on an engineering-branch checkout, or `.engineering/artifacts/` in legacy in-tree layouts). These are never product documentation and are not linked from it; the rationale page restates decisions in its own words rather than linking there.

## Conventions

- **Describe the system as it is.** Documentation states current behaviour in plain present tense; evolution narratives belong in engineering planning artifacts. Rationale is the one exception: the standing reasons behind current decisions are product documentation, kept on the site's design-rationale page — still present tense, never a changelog.
- **Filenames are stable.** Documents are heavily cross-linked (from this repository and beyond), so structure changes are expressed through linking and navigation, never by renaming or moving existing files.
- **Everything is reachable.** Every HTML page is listed in `SITE_ROUTES` and linked from the generated global navigation. The home page "Where to start" table and section hubs provide additional entry points. No document should depend on full-text search alone.

# Documentation System

How this repository's documentation is organized: what each source is for, who it serves, and where new documentation belongs.

## The two layers

**Markdown is canonical.** Every fact about the system lives in a markdown file in this repository, and those files are the source of truth.

**The HTML site renders it.** [`site/`](../site/) is a hand-authored static documentation site — semantic HTML, one shared stylesheet, inline SVG diagrams, no client-side JavaScript — that presents the same material as a navigable, illustrated view. **Prefer on-site HTML links for reading**; link to markdown on GitHub for editing or for documents with no HTML mirror.

[`scripts/generate-site-data.ts`](../scripts/generate-site-data.ts) maintains a route registry (`SITE_ROUTES`) and regenerates global navigation, breadcrumbs, pagination, and the API reference bodies (`npm run build:site`). `tests/site.test.ts` fails when generated regions drift; `npm run check:site` verifies internal links and anchors.

`site/design/` has no single markdown counterpart: its pages narrate server structure and design decisions, with the code in `src/`, `scripts/`, and `tests/` as the implementation source of truth (each page links to the files it describes). When the implementation or a recorded decision changes, those pages are updated in the same change.

## Source map

| Source | Purpose | Audience |
|--------|---------|----------|
| [`README.md`](../README.md) | Project overview, quick start, the workflow model at a glance | Everyone — first contact |
| [`setup.md`](../setup.md) | Shared install sequence: transport, deploy, checkout under `HOST_PROJECTS_ROOT`, Cursor workspace, update workflows | Integrators |
| [`docs/engineering-storage.md`](engineering-storage.md) | How product repos store engineering (orphan, shared monorepo, in-branch) | Integrators |
| [`docs/install-projects-worktrees.md`](install-projects-worktrees.md) | Where checkouts, planning roots and feature worktrees sit on disk, and what creates each | Integrators |
| [`http.md`](../http.md) / [`stdio.md`](../stdio.md) | Transport-only differences (Docker/HTTP vs local stdio MCP config) | Integrators |
| [`docs/ide-setup.md`](ide-setup.md) | The always-applied bootstrap rule and connection verification | Integrators configuring an agent |
| [`docs/api-reference.md`](api-reference.md) | Catalog of MCP tools and HTTP routes (brief; links out for depth) | Integrators |
| [`docs/architecture.md`](architecture.md) | Hub for the six architecture models | Contributors |
| [`docs/dispatch-model.md`](dispatch-model.md), [`checkpoint-model.md`](checkpoint-model.md), [`state-management-model.md`](state-management-model.md), [`artifact-management-model.md`](artifact-management-model.md), [`resource-resolution-model.md`](resource-resolution-model.md), [`workflow-fidelity.md`](workflow-fidelity.md) | Behavioral deep specs (session, checkpoints, delivery, fidelity, …) | Contributors and agents needing depth |
| [`site/api/tools.html`](../site/api/tools.html) | Wire tool descriptions and parameter schemas (generated from `src/tools/`) | Agents / IDE tooling |
| [`docs/technique-protocol-specification.md`](technique-protocol-specification.md) | Normative contract for technique files: anatomy, addressing, composition, delivery | Workflow authors |
| [`docs/orchestra-specification.md`](orchestra-specification.md) | A proposed activity control-flow language the implementation did not follow — a design record, not an authoring guide | Anyone weighing the design |
| [`docs/development.md`](development.md) | Contributing to the server: build, test, conventions | Contributors |
| [`docs/documentation-system.md`](documentation-system.md) | This page: what each source is for, where new documentation belongs, and the conventions all of it follows | Anyone adding or changing documentation |
| [`schemas/README.md`](../schemas/README.md) | Schema guide for authoring workflow definitions | Workflow authors |
| `schemas/*.schema.json` | JSON Schemas generated from the Zod sources (`npm run build:schemas`) | Authoring-time validation and tooling |
| [`site/`](../site/) | The rendered documentation site: user guide, technical specs, API reference, design | Readers in a browser |
| `AGENTS.md`, `CLAUDE.md` | Instructions for AI agents working in this repository | AI agents |
| [`examples/cursor-workspace/.claude/rules/`](../examples/cursor-workspace/.claude/rules/) | Agent rules the workspace template ships into a deployed kickoff directory | AI agents in a deployed workspace |
| Engineering root (`.engineering/` or `$HOST_PROJECTS_ROOT/<repo>/.engineering`) | Planning artifacts, work packages, ADRs — engineering process, not product documentation | Project engineering |

Workflow definitions themselves (the `workflows` branch, checked out as a worktree) carry their own documentation inside each workflow's `techniques/` and `resources/` folders.

## Where new documentation belongs

- **A user-facing how-to** (installing, configuring, running) → `README.md` for first contact, [`setup.md`](../setup.md) for the shared sequence, [`http.md`](../http.md) / [`stdio.md`](../stdio.md) only for transport differences, `docs/ide-setup.md` for agent wiring; plus a page under `site/guide/` if it warrants the illustrated treatment.
- **A new architecture model or a change to one** → a `docs/*-model.md` document, linked from the [`docs/architecture.md`](architecture.md) hub, with a matching page under `site/specs/`.
- **Tool or schema surface changes** → the code and Zod schemas are the source; regenerate `schemas/` (`npm run build:schemas`) and the site's API pages (`npm run build:site`). Keep [`docs/api-reference.md`](api-reference.md) as a short index (update one-line descriptions and links); put behavioral depth in the relevant architecture model.
- **Workflow-authoring contracts** → the [technique protocol specification](technique-protocol-specification.md) for technique files, and the [schema guide](../schemas/README.md) for workflow and activity files.
- **Implementation documentation** (module structure, request handling, on-disk state, the guard and test system) → a page under `site/design/`, linking to the source files it describes.
- **Design rationale** (why an architectural decision stands) → record the decision as an ADR on the engineering branch first, then surface the distilled rationale on the relevant `site/design/` page (present tense; not a changelog).
- **Engineering process artifacts** (plans, analyses, reviews, ADRs) → under the engineering root (`artifacts/` on an engineering-branch checkout, or `.engineering/artifacts/` in in-tree layouts). These are never product documentation and are not linked from it; design pages restate standing decisions in their own words rather than linking there.

## Conventions

- **Describe the system as it is.** Documentation states current behaviour in plain present tense; evolution narratives belong in engineering planning artifacts. Standing reasons behind decisions may appear on `site/design/` pages — still present tense, never a changelog.
- **Avoid brittle counts.** Do not put fixed tallies of tools, routes, files, or similar inventory numbers in prose unless a number is required to complete a procedure. Point readers at generated catalogs (for example the [tool reference](../site/api/tools.html)) when they need the current list.
- **Filenames are kebab-case, and a rename is exceptional.** Documents are heavily cross-linked from this repository and beyond, so structure changes are expressed through linking and navigation. A rename is warranted only where the name itself is wrong. It moves the file with `git mv` so history follows it, repoints every reference in the repository in the same change, and passes `npm run check:site` and `npm run check:anchors` before it lands. Links reaching the old name from outside the repository stop resolving, and that cost is accepted with the decision rather than softened by a redirect stub.
- **Section headings are sentence case and carry no numbers.** A reader cites a section by its title, so the anchor stays readable and survives a reordering. Document titles spell out "and" rather than using an ampersand. The two normative specifications are the exception: a numbered clause is how a reader cites a contract term, so the [technique protocol specification](technique-protocol-specification.md) and the [orchestra specification](orchestra-specification.md) keep their numbering.
- **Everything is reachable.** Every HTML page is listed in `SITE_ROUTES` and linked from the generated global navigation. The home page "Where to start" table and section hubs provide additional entry points. No document should depend on full-text search alone.

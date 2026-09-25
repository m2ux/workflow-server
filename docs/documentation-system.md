# Documentation system

How this repository's documentation is organized: what each source is for, who it serves, and where new documentation belongs.

## The two layers

Documentation is written twice over, for two different readers, and the division is by what the reader is doing rather than by topic.

### Markdown holds the contract

[`docs/`](.) carries exact values, field names, ordering rules, edge cases and the commands that exercise them. Its reader is implementing against the server, auditing a run or debugging one, arrives by grep or by a link from code, and reads one section.

### The site holds the orientation

[`site/`](../site/) is a hand-authored static site — semantic HTML, one shared stylesheet, inline SVG diagrams, no client-side JavaScript. Its reader is forming a mental model of why the problem exists and how the pieces relate, and reads linearly. **Prefer on-site links for reading**; link to markdown on GitHub for editing, or for a document with no HTML page.

### Which layer a fact belongs to

The test is whether a reader would **check** it or **absorb** it. A default value, an exemption list, a ledger key: checked, so markdown. Why checkpoints travel up the agent chain at all: absorbed, so the site.

### What keeps the site consistent

[`scripts/generate-site-data.ts`](../scripts/generate-site-data.ts) maintains a route registry (`SITE_ROUTES`) and regenerates global navigation, breadcrumbs, pagination and the API reference bodies (`npm run build:site`). `tests/site.test.ts` fails when generated regions drift, and `npm run check:site` verifies internal links and anchors.

Neither can detect a prose divergence between a markdown document and its site page, so keeping the two in step is the author's job.

`site/design/` has no single markdown counterpart: its pages narrate server structure and design decisions, with the code in `src/`, `scripts/`, and `tests/` as the implementation source of truth (each page links to the files it describes). When the implementation or a recorded decision changes, those pages are updated in the same change.

## Source map

| Source | Purpose | Audience |
|--------|---------|----------|
| [`README.md`](../README.md) | Project overview, quick start, the workflow model at a glance | Everyone — first contact |
| [`docs/README.md`](README.md) | Index of this directory, routing by what the reader is doing | Anyone arriving in `docs/` |
| [`setup.md`](setup.md) | Shared install sequence: transport, deploy, checkout under `HOST_PROJECTS_ROOT`, Cursor workspace, update workflows | Integrators |
| [`http.md`](http.md) / [`stdio.md`](stdio.md) | Transport-only differences (Docker/HTTP vs local stdio MCP config) | Integrators |
| [`docs/api-reference.md`](api-reference.md) | Catalog of the tool surface and HTTP routes — brief, linking out for depth | Integrators |
| [`docs/configuration.md`](configuration.md) | Every flag and environment variable the server reads at startup | Integrators and contributors |
| [`docs/architecture.md`](architecture.md) | Hub introducing the architecture models and the pressure each answers | Contributors |
| [`docs/dispatch.md`](dispatch.md), [`checkpoint.md`](checkpoint.md), [`state.md`](state.md), [`resource-resolution.md`](resource-resolution.md), [`delivery.md`](delivery.md), [`workflow-fidelity.md`](workflow-fidelity.md) | The behavioural models, one concern each | Contributors and agents needing depth |
| [`site/api/tools.html`](../site/api/tools.html) | Wire tool descriptions and parameter schemas, generated from `src/tools/` | Agents and IDE tooling |
| [Document corpus](README.md#document-corpus) | The only list of links to definition docs on the `workflows` branch | Workflow authors |
| [Design canon](README.md#document-corpus) | Where the design principles, anti-pattern catalog, construct inventory and conformance live, and how to reach them | Workflow authors |
| [`docs/development.md`](development.md) | Building and testing the server, and the two-branch layout | Contributors |
| [`benchmark/README.md`](../benchmark/README.md) | The three benchmarks, the profiler, and the delivery gate | Contributors changing the delivery path |
| [`guards/README.md`](../guards/README.md) | Running the guard sweep, the delta runner, and how a ledger entry is a judgement | Contributors and workflow authors |
| [`docs/documentation-system.md`](documentation-system.md) | This page: what each source is for, where new documentation belongs, and the conventions all of it follows | Anyone adding or changing documentation |
| [`schemas/README.md`](../schemas/README.md) | Schema guide for authoring workflow definitions | Workflow authors |
| `schemas/*.schema.json` | JSON Schemas for authoring-time validation. Most are generated from their Zod sources (`npm run build:schemas`); `technique.schema.json` is hand-authored. `npm run check:schemas` verifies the generated set and reports any file in neither | Authoring-time validation and tooling |
| [`site/`](../site/) | The rendered documentation site: user guide, technical specs, API reference, design | Readers in a browser |
| [`PROJECT.md`](../PROJECT.md) | Project instructions for this repository. The workspace instructions name this file. It stays in the repository | AI agents |
| `AGENTS.md`, `CLAUDE.md` | Workspace instructions for AI agents. Deploy writes both into the checkout. Git ignores both paths. They name `PROJECT.md` | AI agents |
| Engineering root (`.engineering/` or `$HOST_PROJECTS_ROOT/<repo>/.engineering`) | Planning artifacts, work packages, ADRs — engineering process, not product documentation | Project engineering |

Workflow definitions live on the `workflows` branch. Each product workflow also carries documentation in its `techniques/` and `resources/` folders. Links to those docs are the [document corpus](README.md#document-corpus).

## Where new documentation belongs

- **A user-facing how-to** (installing, configuring, running) → `README.md` for first contact, [`setup.md`](setup.md) for the shared sequence, [`http.md`](http.md) / [`stdio.md`](stdio.md) only for transport differences; plus a page under `site/guide/` if it warrants the illustrated treatment.
- **A new architecture model or a change to one** → a document under [`docs/`](.), linked from the [`docs/architecture.md`](architecture.md) hub, with a matching page under `site/specs/`.
- **Tool or schema surface changes** → the code and Zod schemas are the source; regenerate `schemas/` (`npm run build:schemas`) and the site's API pages (`npm run build:site`). Keep [`docs/api-reference.md`](api-reference.md) as a short index (update one-line descriptions and links); put behavioral depth in the relevant architecture model.
- **Workflow-authoring contracts** → the [document corpus](README.md#document-corpus). A page that is about one of those documents links the name in the sentence. The [schema guide](../schemas/README.md) stays on this tree, generated from the Zod sources.
- **How a tool or program is run** → the README beside it. `guards/README.md` documents the guard sweep, because a reader who opens `guards/` should not have to leave it to find out how the programs there run.
- **Implementation documentation** (module structure, request handling, on-disk state, the guard and test system) → a page under `site/design/`, linking to the source files it describes.
- **Design rationale** (why an architectural decision stands) → record the decision as an ADR on the engineering branch first, then surface the distilled rationale on the relevant `site/design/` page (present tense; not a changelog).
- **Engineering process artifacts** (plans, analyses, reviews, ADRs) → under the engineering root (`artifacts/` on an engineering-branch checkout, or `.engineering/artifacts/` in in-tree layouts). These are never product documentation and are not linked from it; design pages restate standing decisions in their own words rather than linking there.

## Conventions

- **Describe the system as it is.** Documentation states current behaviour in plain present tense; evolution narratives belong in engineering planning artifacts. Standing reasons behind decisions may appear on `site/design/` pages — still present tense, never a changelog.
- **The corpus is a separate concern.** These pages describe the server, so they name no workflow, activity, technique, variable or rule that exists in the corpus, and quote no measurement taken against it. Definitions change without this tree being touched, so any such reference is stale the moment it is written. Illustrate with an invented example instead, and where a figure matters, name the command that produces it rather than its last value.
- **Keep only counts that are invariant.** A number is safe when this document's own design statement fixes it — three agent roles, two files in a session folder, the layers this page enumerates. A number counting an inventory that grows — tools, routes, guards, activities, walks, triage verdicts — goes stale silently. Drop the tally and let the table or list that follows be the count. Point readers at generated catalogs (for example the [tool reference](../site/api/tools.html)) when they need a current list.
- **Filenames are kebab-case, and a rename is exceptional.** Documents are heavily cross-linked from this repository and beyond, so structure changes are expressed through linking and navigation. A rename is warranted only where the name itself is wrong. It moves the file with `git mv` so history follows it, repoints every reference in the repository in the same change, and passes `npm run check:site` and `npm run check:anchors` before it lands. Links reaching the old name from outside the repository stop resolving, and that cost is accepted with the decision rather than softened by a redirect stub.
- **Titles and section headings are sentence case, and headings carry no numbers.** A reader cites a section by its title, so the anchor stays readable and survives a reordering. Titles spell out "and" rather than using an ampersand. The [technique protocol](README.md#document-corpus) is the one exception: a numbered clause is how a reader cites a contract term, so its sections keep their numbering.
- **A document changes for one reason.** Where two kinds of change would touch the same file — retuning a budget and adding a guard, say — they are two documents. The signal that a split is overdue is another page linking into the middle of this one: a section other documents cite by anchor is already being used as an interface of its own.
- **A sub-heading, never a bold lead-in.** Where a paragraph opens with a bold phrase that names what follows, that phrase is a heading doing the job badly: it does not appear in the document outline, cannot be linked to, and gives a reader scrolling for it nothing to catch. Write it as `###`. Bold stays for a labelled item inside a list, and for emphasis mid-sentence.
- **Every section is navigable.** A run of paragraphs under one heading is a wall to anyone who arrived looking for one of them. Give each its own sub-heading, or make the set a table or list.
- **Sentences carry one idea, and paragraphs carry one topic.** A reader arriving at a contract is checking something specific, and a sixty-word sentence with three clauses makes them parse before they can check. Prefer a table where the material is a set of cases, and keep a table cell to a line — a cell that has grown into a paragraph belongs in prose beneath the table.
- **Spell out a term of art at first use.** Give the full form once, then the short one.
- **Everything is reachable.** Every HTML page is listed in `SITE_ROUTES` and linked from the generated global navigation. The home page "Where to start" table and section hubs provide additional entry points. No document should depend on full-text search alone.

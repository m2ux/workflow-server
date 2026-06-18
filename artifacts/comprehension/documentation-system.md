# Documentation System — Comprehension Artifact

> **Last updated**: 2026-06-18
> **Work packages**: #132 — Coherent documentation system for workflow-server (2026-06-09-workflow-server-docs-system)
> **Coverage**: The workflow-server documentation surface (root docs, `docs/`, `schemas/`, agent-rule files) AND the concept-rag reference documentation system (`~/projects/dev/concept-rag`) treated as the structural exemplar to mirror.
> **Related artifacts**: [workflow-server.md](workflow-server.md) (source-code behavior — the system the docs describe), [orchestration.md](orchestration.md), [workflow-server-schemas.md](workflow-server-schemas.md)

This artifact treats *documentation as the codebase area*. "Architecture" here means the structure of the doc set (files, navigation, cross-links, tooling); "abstractions" are the recurring page types (landing, task guide, section index, model/spec, ADR); "domain mapping" connects each document to the audience and question it serves.

## Architecture Overview

### Project Structure — workflow-server documentation surface (target)

The target worktree is `/home/mike1/projects/work/workflow-server/2026-06-09-workflow-server-docs-system` (issue #132). Documentation is spread across four locations with **no site tooling, no landing page, and no navigation config**:

```
<repo root>
├── README.md            # 5.6 KB — project overview, quick start, tool-at-a-glance table, engineering layout
├── SETUP.md             # 4.7 KB — installation + MCP client config + deploy-to-projects
├── AGENTS.md            # 5.1 KB — agent instructions (setup, style, task mgmt, boundaries, where-to-look)
├── CLAUDE.md            # 5.1 KB — twin of AGENTS.md; differs ONLY on the H1 title line (otherwise identical)
├── LICENSE
├── docs/                # 12 top-level files, NO index.md, no subfolders
│   ├── architecture.md                       # 4.5 KB — overview HUB: numbered links to the 6 model docs + tool/dev pointers
│   ├── api-reference.md                       # 22.9 KB — MCP tool roster, params, session_index lifecycle
│   ├── development.md                         # 10.6 KB — dev setup, build/test commands
│   ├── ide-setup.md                           # 2.9 KB — bootstrap rule, what discover returns, verify connection
│   ├── workflow-fidelity.md                   # 23.9 KB — fidelity enforcement (manifests, trace tokens, audit)
│   ├── technique-protocol-specification.md    # 25.6 KB — technique composition/resolution spec
│   ├── orchestra-specification.md             # 33.7 KB — orchestration spec (largest doc)
│   ├── artifact_management_model.md           # 3.3 KB — .engineering boundaries, artifactPrefix, synthesized artifacts contract
│   ├── checkpoint_model.md                    # 7.8 KB — JIT checkpoint bubble-up model
│   ├── dispatch_model.md                       # 6.9 KB — hierarchical dispatch (L0/L1/L2 agents)
│   ├── resource_resolution_model.md           # 11.3 KB — technique/resource lazy-loading resolution
│   └── state_management_model.md              # 5.7 KB — deterministic state transitions, variant paths via activation variables
├── schemas/
│   ├── README.md         # 47.1 KB — schema-system guide (6 schemas, mermaid relationship diagrams)
│   └── *.schema.json     # 6 JSON schemas: workflow/activity/technique/condition/state/session-file (OUT OF SCOPE — server source)
├── .claude/
│   └── rules/            # concept-rag.md, workflow-server.md (IDE always-applied rules)
└── .engineering/artifacts/   # planning + adr (design records & ADRs; exempt from the docs/ voice rule)
    ├── adr/                  # ADR-0001..0005 (Nygard-style decision records)
    └── planning/2026-06-17-step-kinds-unification/step-kinds-unification.md   # 10.6 KB — design record for the kind-tagged steps[] model
```

Note the naming inconsistency: the six "model" docs use `snake_case_model.md`, the two specs use `kebab-case-specification.md`, and the task/reference guides use `kebab-case.md`. The three conventions partition the docs by purpose (model docs, specs, task/reference guides).

### Project Structure — concept-rag reference (exemplar, READ-ONLY)

`~/projects/dev/concept-rag` is a working **MkDocs Material** site. This is the shape to mirror:

```
concept-rag/
├── mkdocs.yml           # 8 KB — site config + theme + markdown extensions + the entire nav tree
├── README.md, SETUP.md, USAGE.md, FAQ.md, TROUBLESHOOTING.md, EXAMPLES.md,
│   CONTRIBUTING.md, SECURITY.md, REFERENCES.md   # root long-form docs (some mirrored into docs/)
└── docs/                # the published site root
    ├── index.md         # grid-card landing page (7 cards: How It Works, Getting Started, API, Architecture, FAQ, Troubleshooting, GitHub)
    ├── getting-started.md, how-it-works.md, troubleshooting.md, faq.md, api-reference.md   # task-oriented top-level guides
    ├── development.md, database-schema.md, stage-cache-structure.md
    ├── prompts/         # AGENT GUIDANCE section (this is concept-rag's analogue to wfs agent rules)
    │   ├── guidance.md, ide-setup.md
    │   ├── activities/  # index.md + 8 activity pages
    │   └── skills/      # index.md + 7 skill pages
    └── architecture/
        ├── README.md    # architecture overview HUB (repo-structure table + component links + ADR pointer)
        ├── seeding-architecture.md, bm25-keywords.md, wordnet-enrichment.md, skills-interface.md  # component deep-dives
        └── adr0001..adr0055-*.md   # numbered ADR series (54 ADRs), each title in mkdocs nav
```

### The concept-rag structural pattern (the thing to reproduce)

Distilled from `mkdocs.yml`, `docs/index.md`, and `docs/architecture/README.md`:

| Pattern element | Concept-rag instance | Purpose |
|-----------------|----------------------|---------|
| **Site tooling** | `mkdocs.yml` at repo root, `theme: material` | Single source of nav + theme; builds a searchable static site |
| **Theme features** | `navigation.tabs/sections/expand/top/indexes`, `toc.integrate`, `search.suggest/highlight`, `content.code.copy` | Tabbed top-level nav, expandable sections, section-index landing pages |
| **Markdown extensions** | `admonition`, `pymdownx.details/superfences (mermaid)/highlight/tabbed/emoji`, `tables`, `attr_list`, `md_in_html`, `toc(permalink)` | Admonitions, mermaid diagrams, code copy, emoji icons, grid cards |
| **Grid-card landing** | `docs/index.md` using `<div class="grid cards" markdown>` + `:material-*:` icons + `:octicons-arrow-right-24:` CTA links | Single discoverable entry point routing to each major area |
| **Grouped nav** | `nav:` with sections Home / How It Works / Agent Guidance / Activities / Skills / Getting Started / API Reference / Architecture / ADRs / FAQ | The map; coherent task/domain grouping rather than a flat file list |
| **Section index pages** | `prompts/activities/index.md`, `prompts/skills/index.md` (table + quick-match list); `architecture/README.md` (overview hub) | Each section opens on an "Overview" page (enabled by `navigation.indexes`) |
| **Architecture hub** | `architecture/README.md`: a repo-structure table + bulleted component links + a single pointer into the ADR series | Entry point into deep technical material |
| **ADR series** | `architecture/adrNNNN-kebab-title.md`, status/date/context/decision/alternatives template, each enumerated in nav | Numbered, append-only decision history |
| **Task-guide voice** | `getting-started.md` ("running in under 10 minutes", prereqs table, numbered Steps), `how-it-works.md` (mermaid pipeline) | Reader-facing, second-person, outcome-framed |

### Module Map — how the two surfaces correspond

| concept-rag section | workflow-server current equivalent | Mapping note |
|---------------------|-------------------------------------|--------------|
| `docs/index.md` (landing) | **none** | Must be created — the headline gap |
| `mkdocs.yml` nav | **none** | Must be created — the headline gap |
| How It Works | `README.md` "How It Works"/"Architecture" sections | Content exists, lives inside README; could be promoted to a `how-it-works.md` |
| Getting Started | `README.md` Quick Start + `SETUP.md` + `docs/ide-setup.md` | Content exists, scattered across 3 files |
| Agent Guidance (`prompts/`) | `AGENTS.md`/`CLAUDE.md` + `.claude/rules/` + `docs/ide-setup.md` | Content exists as repo-root rule files, not a docs section |
| Activities / Skills sections | workflow/activity/technique TOON content (in `workflows` worktree) | Not currently surfaced as docs; analogue is the technique/spec docs |
| API Reference | `docs/api-reference.md` | Direct 1:1 match |
| Architecture (overview + components) | `docs/architecture.md` (hub) + the 6 `*_model.md` docs + the two `*-specification.md` docs + `schemas/README.md` | `architecture.md` is a hub; its numbered links cover the 6 model docs + api/dev pointers. The two specs are `docs/` siblings the hub does not link. The model/spec docs are the component deep-dives. Design records sit in `.engineering/artifacts/planning/` alongside the ADRs (`.engineering/artifacts/adr/`), outside `docs/`. |
| ADRs | `.engineering/artifacts/adr/0001..0005` (OUTSIDE `docs/`) | workflow-server **has** an ADR series and a documented ADR practice (`workflows/work-package/resources/architecture-review.md`), but stores them in `.engineering/`, not in the docs site as cr does. Whether to surface them in the docs nav is DP-6 (see Deep-Dive 2 Q5). |
| FAQ / Troubleshooting | **none** | No FAQ or troubleshooting doc exists |

### Design Patterns (documentation architecture)

1. **Docs-as-code, single-nav-source** (concept-rag) — every page is a markdown file in the repo; `mkdocs.yml` is the single source of navigation truth. workflow-server is docs-as-code but **lacks the single nav source**.
2. **Hub-and-spoke for architecture** — both systems use this: concept-rag's `architecture/README.md` and workflow-server's `docs/architecture.md` are both overview hubs linking to deep-dive docs. workflow-server's hub is well-developed (numbered, prose-rich pointers to each model).
3. **Section-index convention** — concept-rag opens each multi-page section on an Overview/index page (`navigation.indexes`). workflow-server has zero section indexes: `docs/` is a flat list of files with no subfolders and no `index.md`, browsed directly on GitHub.
4. **Describe-as-it-is voice** — enforced by `.engineering/AGENTS.md` for workflow-server's *system* docs (`docs/`, READMEs, schema/technique content; no "deprecated"/"previously"/"now"), with `artifacts/` **explicitly exempt**. wfs's design records and ADR series live in the exempt `.engineering/artifacts/` tree — design records under `.engineering/artifacts/planning/` (e.g. `2026-06-17-step-kinds-unification/step-kinds-unification.md`, whose prose recounts a before/after for the kind-tagged steps[] model) and ADRs under `.engineering/artifacts/adr/`. Because both sit in the exemption, their evolution-narrating voice does not conflict with the `docs/` rule. concept-rag instead puts ADRs *inside* `docs/` (under the docs voice). (See Deep-Dive 2 Q5.)

## Key Abstractions

### Recurring page types (the "types" of the doc domain)

| Page type | concept-rag exemplar | workflow-server instance | Role |
|-----------|----------------------|--------------------------|------|
| Landing / grid-card index | `docs/index.md` | — (missing) | Single entry point; routes to areas |
| Task guide | `getting-started.md`, `how-it-works.md`, `troubleshooting.md`, `faq.md` | README sections, SETUP.md, ide-setup.md | Reader-facing, goal-oriented |
| Section index | `prompts/activities/index.md`, `architecture/README.md` | `docs/architecture.md` (partial) | Opens a nav section, lists its pages |
| API reference | `api-reference.md` | `docs/api-reference.md` | Exhaustive tool/param reference |
| Component deep-dive | `architecture/seeding-architecture.md` | the 6 `*_model.md` + 2 `*-specification.md` docs | Technical internals of one subsystem |
| ADR | `architecture/adrNNNN-*.md` (in docs) | `.engineering/artifacts/adr/NNNN-*.md` (outside docs) | Numbered decision record |
| Design record | (cr: ADRs serve this role) | `.engineering/artifacts/planning/2026-06-17-step-kinds-unification/step-kinds-unification.md` | Records a design decision + before/after (evolution-narrating; in the exempt `.engineering/artifacts/` tree, alongside the ADRs) |
| Agent-guidance | `prompts/guidance.md`, `prompts/ide-setup.md` | `AGENTS.md`, `.claude/rules/*`, `docs/ide-setup.md` | How an agent should drive the system |
| Schema reference | (concept-rag: `database-schema.md`) | `schemas/README.md` | Data/definition structure reference |

### Site-config abstraction (`mkdocs.yml`)

Three orthogonal concerns in one file: `theme` (Material + feature flags), `markdown_extensions` (admonition/superfences-mermaid/grid-card enablers), and `nav` (the ordered tree). Reproducing concept-rag's *shape* means reproducing all three — the nav tree is the load-bearing part; the theme/extension block is near-copyable boilerplate.

### Data Model — navigation tree

The nav is an ordered list of `Title: path` or `Title: [children]` entries. Section indexes attach via `navigation.indexes` (first child named "Overview" pointing at an `index.md`/`README.md`). The ADR section is a flat enumerated list of 54 entries, each with an explicit human title (`"ADR-0050: MkDocs Site": ...`).

### Cross-linking conventions

- **concept-rag**: relative markdown links within `docs/`; landing page uses CTA-style links (`[:octicons-arrow-right-24: Learn more](how-it-works.md)`); architecture hub links into components and the ADR series.
- **workflow-server**: README has an inline "•"-separated top nav bar of links; `docs/architecture.md` uses numbered prose pointers; `ide-setup.md` ends with a "Related" link list. Conventions are ad-hoc and per-file, not systematized.

## Design Rationale

### DR-1: Mirror MkDocs Material rather than lighter cross-linking
- **Observation**: The work package explicitly names concept-rag's system as the shape/style reference, and that system is MkDocs Material end-to-end.
- **Hypothesized rationale**: A working exemplar removes design uncertainty; matching it gives publishable parity (searchable site, GitHub Pages) rather than just better internal links.
- **Trade-offs**: Adopts a Python/MkDocs toolchain into a TypeScript repo (new dependency surface, CI for `gh-deploy`); buys discoverability, search, mobile, and a single nav source.
- **Implications for changes**: Need `mkdocs.yml`, a `docs/index.md` landing page, section index pages, and (per `architecture.md`'s ADR-0050 analogue) likely a deploy workflow. Schema JSON and `src/` stay untouched.

### DR-2: workflow-server's `docs/architecture.md` is a hub
- **Observation**: `docs/architecture.md` is a numbered (1–6) overview linking the six `*_model.md` docs plus tool/dev pointers — structurally identical to concept-rag's `architecture/README.md`. (The two `*-specification.md` docs are `docs/` siblings outside the hub's numbered list; design records sit in `.engineering/artifacts/planning/`, outside `docs/` entirely.)
- **Hypothesized rationale**: The author already converged on hub-and-spoke for the technical docs, just without the surrounding site scaffolding.
- **Trade-offs**: Reduces work — the architecture section largely exists; the gap is the *site frame* (landing, nav, section indexes), not the architecture content.
- **Implications**: Reorganization can largely preserve existing doc content and bodies; the new work is scaffolding + placement + a nav config, not rewriting.

### DR-3: Agent guidance lives in repo-root rule files, not a docs section
- **Observation**: workflow-server keeps agent instructions in `AGENTS.md`/`CLAUDE.md` (identical except the H1 title line) and `.claude/rules/`; concept-rag surfaces equivalent content as a first-class `Agent Guidance` docs section (`prompts/`).
- **Hypothesized rationale**: workflow-server's audience for those files is the IDE/agent harness (must live at repo root / `.claude/` to be picked up), so they can't simply move into `docs/`.
- **Trade-offs**: Matching concept-rag's "Agent Guidance" nav section may mean *referencing* or *mirroring* the rule content into docs rather than relocating it (the source must stay where the harness reads it).
- **Implications**: An "Agent Guidance" nav section can point at `docs/ide-setup.md` plus a new overview that summarizes/links the bootstrap rule — without moving `AGENTS.md`/`.claude/rules/`.

### DR-4: ADR history lives in `.engineering/`, not in the docs site
- **Observation**: workflow-server **has** an ADR series — `.engineering/artifacts/adr/0001..0005` — plus a documented ADR practice in `workflows/work-package/resources/architecture-review.md` (Nygard template, Status lifecycle incl. Deprecated/Superseded, alternatives, bidirectional superseding links). It *also* has six `*_model.md` and two `*-specification.md` docs that describe *how subsystems work* (mechanism), distinct from the ADRs' *why-over-alternatives* (decision). concept-rag has 54 ADRs but stores them **inside `docs/architecture/`**.
- **Hypothesized rationale**: wfs separates decision history (ADRs, in the `.engineering/` engineering tree) from system documentation (`docs/`, under the describe-as-it-is voice). cr instead publishes its decision history in the docs site.
- **Trade-offs**: Because wfs ADRs sit in `artifacts/` (the voice-rule exemption), they already legitimately narrate evolution with no rule conflict. Faithfully mirroring cr would relocate/mirror them under the `docs/` voice — *creating* the conflict. Surfacing them via a docs hub *link* (leaving them in `.engineering/`) avoids it.
- **Implications**: DP-6 (planning) — whether to surface the `.engineering/` ADRs in the docs nav (link-only, low risk) or relocate/mirror them into `docs/` (needs a voice exemption). No new ADR *convention* is needed; one exists.

## Data Flow and Operational Context

For a documentation work package, the "data flow" is **reader navigation** and the "build pipeline" is the site generator.

### Reader-navigation flow (target state, mirroring concept-rag)
```
reader/agent → docs/index.md (grid cards)
   → task area (Getting Started / How It Works / API / Troubleshooting / FAQ)
   → or Architecture hub → component deep-dive → ADR
   → or Agent Guidance → ide-setup / bootstrap rule
nav source of truth: mkdocs.yml
```
Current workflow-server state has no `index.md` and no nav — readers land on `README.md` (the de-facto entry) and follow its inline "•" link bar; `docs/` is browsed as a flat file list on GitHub.

### Build/publish pipeline (concept-rag, inferred from ADR-0050)
`mkdocs build`/`mkdocs gh-deploy` → GitHub Pages, triggered by a GitHub Action on push when docs change. workflow-server has no such pipeline today (no `mkdocs.yml`, no docs CI observed).

### Invariant alignment (doc/system fidelity)
| Invariant | Reference enforces? | workflow-server assumes? | Gap? |
|-----------|---------------------|--------------------------|------|
| Every nav entry resolves to a real file | MkDocs build fails on broken nav | n/a (no nav yet) | New nav must be validated by a build |
| Docs describe system as-is | `.engineering/AGENTS.md` voice rule (governs `docs/`; `artifacts/` exempt) | yes | ADRs sit in the exempt `.engineering/artifacts/adr/`; a voice exemption is only needed if they are mirrored *into* `docs/` (DR-4, Deep-Dive 2 Q5) |
| Engineering links resolve to committed remote files | push-before-linking rule | yes | Planning artifacts must be pushed before PR references them |

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|---------------------|-------------|
| Landing page | `docs/index.md` (grid cards) | Single discoverable entry point routing to each doc area |
| Nav / navigation tree | `mkdocs.yml` `nav:` | Ordered, grouped map of the site; single source of navigation truth |
| Section index | `index.md`/`README.md` as a section's first ("Overview") page | Opens a nav section, lists/links its pages |
| Architecture hub | `architecture/README.md` (cr) / `docs/architecture.md` (wfs) | Overview page linking into technical deep-dives |
| Component deep-dive | `architecture/*.md` (cr) / `*_model.md` + specs (wfs) | Detailed internals of one subsystem |
| ADR | cr: `docs/architecture/adrNNNN-*.md` (in docs); wfs: `.engineering/artifacts/adr/NNNN-*.md` (outside docs) | Numbered Architecture Decision Record (status/context/decision/alternatives). wfs's ADR practice is codified in `workflows/work-package/resources/architecture-review.md`. |
| Task guide | `getting-started.md`, `how-it-works.md`, etc. | Reader-facing, goal-oriented page |
| Agent guidance | `prompts/` (cr) / `AGENTS.md` + `.claude/rules/` (wfs) | How an agent should drive the system |
| Grid card | `<div class="grid cards" markdown>` + `:material-*:` icons | Material visual index element used on the landing page |
| Admonition | `!!! note` / `pymdownx.details` | Callout block (note/warning/tip) |
| MkDocs Material | `theme: material` in `mkdocs.yml` | The static-site generator + theme being mirrored |

### Domain Model
workflow-server's documentation domain is "how an agent or human discovers, configures, and operates the workflow engine." concept-rag's is "how an agent discovers, configures, and queries the RAG engine." The two map cleanly because both are **MCP servers with a Goal → Activity → (capability) → Tool model** — workflow-server binds **Techniques** at the capability tier (`Goal → Activity → Technique → Tool`), concept-rag uses **Skills** (`prompts/skills/`) — and they share near-identical surrounding concerns (Quick Start, API tool roster, architecture internals, agent guidance, IDE setup). The principal divergences: workflow-server has richer *spec/model* docs and a fidelity/audit subsystem; concept-rag has a richer *decision history* (ADRs) and surfaces its activities/skills as browsable docs.

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 1 | Does the reference use section-index landing pages, and via what mechanism? | Resolved | `navigation.indexes` theme feature + per-section `index.md`/`README.md` "Overview" pages (Activities/Skills/Architecture). | Deep-Dive Q1 |
| 2 | What exactly does the concept-rag landing page contain (cards, icons, link style) and is it reproducible in plain MkDocs Material? | Resolved | 7 grid cards (`grid cards` div, `:material-*:` icons, CTA `:octicons-arrow-right-24:` links); reproducible with `attr_list`+`md_in_html`+Material theme, no custom CSS; must be unique, not README-derived (ADR-0052). | Deep-Dive Q2 |
| 3 | How does the existing `docs/architecture.md` hub compare structurally to concept-rag's `architecture/README.md`? | Resolved | Both are hubs; cr adds a repo-structure table + component link list; wfs uses richer per-component prose but lacks the table. Relocate wfs hub to `architecture/README.md` folder. | Deep-Dive Q3 |
| 4 | Where should the six `*_model.md` and two `*-specification.md` docs land in a concept-rag-style nav? | Resolved | They are component deep-dives → an `Architecture` section: `Overview` (relocated `architecture.md`) + the model/spec docs as siblings + `schemas/README.md` as schema ref. Not ADRs. | Deep-Dive Q4 |
| 5 | How does surfacing the ADR series in the docs site reconcile with the describe-as-it-is voice rule? | **Planning-only** | wfs **has an ADR series AND a documented ADR practice.** `.engineering/artifacts/adr/` holds ADR-0001..0005 (Nygard-style: Status incl. Deprecated/Superseded, Context, Decision, Considered Options, Consequences); the practice is codified in `workflows/work-package/resources/architecture-review.md`. ADRs live **outside `docs/`** (in `.engineering/`), so they do **not** fall under the `docs/` describe-as-it-is voice rule — and `.engineering/AGENTS.md` exempts `artifacts/` content. The decision is narrow: whether to *surface* the `.engineering/` ADRs as a docs-site nav section (cr-style) — a planning choice, not a code-resolvable one (DP-6). | Deep-Dive 2 Q5 |
| 6 | How to surface agent-guidance content as a docs section without relocating harness-path files? | Resolved | New `Agent Guidance` section: an Overview page summarizing/linking `docs/ide-setup.md` + referencing (not moving) `AGENTS.md`/`.claude/rules/`; mirrors cr's docs-guidance-≠-harness-config split. | Deep-Dive Q6 |
| 7 | Are `AGENTS.md` and `CLAUDE.md` truly identical, and what is the maintenance implication? | Resolved | Differ on line 1 only (the H1 title); otherwise byte-identical lockstep twins — edits must apply to both; drift is a latent hazard. | Deep-Dive Q7 |
| 8 | Does mirroring require the MkDocs toolchain + gh-deploy pipeline, or can a lighter equivalent suffice? | **Tooling known; depth = planning-only** | Full cr toolchain: `mkdocs.yml` (Material, 14 markdown extensions, manual `nav`), `requirements.txt` (`mkdocs-material>=9.0`), `package.json` scripts (`docs:serve`/`docs:build` → `mkdocs serve`/`build`), and `.github/workflows/docs.yml` (Python 3.11 + `pip install mkdocs-material` + `mkdocs gh-deploy --force`, triggered on push to `docs/**`/`mkdocs.yml`/the workflow, `permissions: contents: write`, `concurrency` cancel-in-progress). **wfs has NO `.github/workflows/` at all** — adopting `docs.yml` introduces the repo's first GitHub Action and first Python dependency into a TS repo. Decomposable into 3 independently-approvable layers: (a) structure (`mkdocs.yml`+pages, no CI), (b) local build (`requirements.txt`/npm scripts), (c) deploy Action (the CI-approval-gated half). Which layers to adopt is a planning judgement (DP-8). | Deep-Dive 2 Q8 |
| 9 | Do FAQ/Troubleshooting docs need authoring from scratch, and what seeds them? | Resolved | No FAQ/troubleshooting content exists anywhere in wfs; would be authored fresh from thin seeds (SETUP gotchas, ide-setup "Verifying"/"If agent skips discover", fidelity failure modes); fidelity risk if invented. | Deep-Dive Q9 |
| 10 | If MkDocs is adopted, how is `mkdocs.yml` nav kept in sync with files to avoid orphaned/broken entries? | **Mechanism known; policy = planning-only** | cr uses **fully manual nav** — `plugins: - search` is the only plugin. All ~80 pages incl. 54 ADRs are hand-enumerated in `mkdocs.yml` with explicit titles; adding/moving a file requires a manual `nav` edit. The mechanical tripwire is `mkdocs build` (catches nav→missing-file; the default build flags file→missing-nav orphans only under `--strict` / `validation` config). Whether wfs adopts manual nav vs. a plugin, and whether CI runs `--strict`, is a planning decision. | Deep-Dive 2 Q10 |
| 11 | When relocating/renaming docs into a sectioned layout, how are existing inbound links (README links, `architecture.md` pointers, cross-refs) preserved? | **Links known; mitigation = planning-only** | Inbound-link inventory (see Deep-Dive 2 Q11): ~50 `.md` links across README/SETUP/AGENTS/CLAUDE/`docs/`/`schemas/README.md`. Highest-fan-in targets: `docs/ide-setup.md` (8 inbound), `docs/api-reference.md` (5), `README.md` (5), `SETUP.md` (4), `schemas/README.md` (3). Two anchor-fragment links (`state_management_model.md#5-persistence`) break on heading renames too. The harness-path files (`AGENTS.md`/`CLAUDE.md`/`.claude/rules/`) and `README.md`/`SETUP.md` (GitHub/npm entry points) **cannot move**. Whether to keep filenames (zero link rot), rename + add MkDocs redirects, or accept breakage is a planning decision. | Deep-Dive 2 Q11 |
| 12 | Where do design records (e.g. the step-kinds-unification before/after) belong, and should they be surfaced in a sectioned docs nav? | **Planning-only** | Design records live in `.engineering/artifacts/planning/` (e.g. `2026-06-17-step-kinds-unification/step-kinds-unification.md`), alongside the ADRs in `.engineering/artifacts/adr/` — inside the `artifacts/` voice exemption, so their evolution-narrating prose carries no `docs/` voice conflict (the same standing as the ADRs in Q5/DR-4). The only open aspect is the same nav-surfacing choice as DP-6: whether to link these `.engineering/` records from a docs Architecture hub (link-only, low risk) or relocate/mirror them into `docs/` (which would then need a voice exemption). | Deep-Dive 2 Q5 |

### Remaining follow-up items (planning decisions, not comprehension gaps)
For these rows the **code facts are fully established**; what remains is design judgement that further source inspection cannot decide. They are carried as planning decision points (DP-6, DP-8, and two nav/link DPs), not open comprehension questions:
- **Surface the `.engineering/` ADRs in the docs site? (DP-6)** — wfs *has* ADRs and an ADR practice; the question is whether to add a cr-style ADR nav section pointing at them (or relocate/mirror them into `docs/`). No voice-rule conflict, because ADRs live in `.engineering/` (exempt).
- **Which toolchain layers to adopt? (DP-8)** — structure-only vs. +local-build vs. +deploy-Action. The deploy Action is the repo's *first* GitHub workflow and needs CI approval (file-sensitivity-cicd-approval).
- **Nav-sync policy** — manual nav (cr's approach) vs. a plugin; whether CI runs `mkdocs build --strict`.
- **Link-preservation policy** — keep filenames vs. rename + redirects; harness-path and GitHub-entry files are fixed.
- Whether `AGENTS.md`/`CLAUDE.md` duplication should be de-duplicated via a symlink or shared include (a separate maintenance work package).

## Deep-Dive — 2026-06-09

Findings organized by question, against both repos.

### Q1 — Section-index mechanism
concept-rag enables section landing pages through the theme feature `navigation.indexes` (`mkdocs.yml` line 20). With it, the first child of a nav section can be an "Overview" page that *is* the section's landing page rather than a separate clickable parent. Instances: `Activities → Overview: prompts/activities/index.md`, `Skills → Overview: prompts/skills/index.md`, `Architecture → Overview: architecture/README.md`. Each index page is a table of the section's pages plus, for activities, a "Quick Match" goal→page list. **Reproduction for wfs**: enable `navigation.indexes`; author an `index.md`/`README.md` per nav section.

### Q2 — Landing page contents and reproducibility
`docs/index.md` is a single `<div class="grid cards" markdown>` block of 7 cards. Each card = a Material icon (`:material-cog-play:`, `:material-rocket-launch:`, `:material-api:`, `:material-sitemap:`, `:material-help-circle:`, `:material-wrench:`, `:material-github:`) with `{ .lg .middle }` sizing, a bold title, a `---` divider, a one-line description, and a CTA link (`[:octicons-arrow-right-24: Learn more](target.md)`). It is fully reproducible in plain MkDocs Material: the grid-card pattern requires only `attr_list` + `md_in_html` extensions (both present in `mkdocs.yml`) and the Material theme's bundled `grid cards` CSS — no custom CSS. **Note** (ADR-0052 §Context item 2): concept-rag's landing page is a unique landing experience rather than a duplicate of the README — a precedent wfs should follow (don't just paste README into `index.md`).

### Q3 — `docs/architecture.md` vs concept-rag `architecture/README.md`
Both are overview hubs but with different emphasis. concept-rag's `architecture/README.md`: a **Repository Structure table** (directory → contents) + a bulleted **Key Components** link list + one pointer into the ADR series. wfs's `docs/architecture.md`: a numbered, prose-rich list (1–6) where each entry is a paragraph *summarizing* a model/spec doc and linking it, plus a closing "Tool Reference"/"Development" pointer. wfs's hub is **more descriptive per component** but **lacks the repo-structure table**. Mapping to the reference shape: keep wfs's prose entries, optionally add a repo-structure table, and relocate the hub to `docs/architecture/README.md` (a folder) so the model/spec docs become its `architecture/` siblings — matching concept-rag's folder layout.

### Q4 — Placement of the 6 `*_model.md` + 2 spec docs
These are **component deep-dives**, directly analogous to concept-rag's `architecture/seeding-architecture.md` / `bm25-keywords.md` / etc. Recommended placement: an `Architecture` nav section with `Overview: architecture/README.md` (the relocated current `architecture.md`) followed by the six model docs and two specs as sibling entries (and `schemas/README.md` linked as the schema reference, as concept-rag links `database-schema.md`). They are NOT ADRs — they describe mechanisms, not decisions (see Q5). This keeps the hub→component relationship `architecture.md` encodes (DR-2), inside a nav section.

### Q5 — ADR series surfacing + voice-rule reconciliation (decision deferred to planning per DP-6)

The `*_model.md`/spec docs occupy the *mechanism* role, not the *decision* role — so they are not an ADR substitute. concept-rag's ADRs record evolution (Status/Date/Context/Decision/**Alternatives Considered**/Consequences; e.g. ADR-0050, ADR-0052). The full present-state analysis is in Deep-Dive 2 Q5: wfs holds an ADR series in `.engineering/artifacts/adr/` under the `artifacts/` voice exemption, and the planning choice (DP-6) is whether to surface it in the docs site, link-only vs. relocate/mirror.

### Q6 — Surfacing agent guidance without relocating harness files
The harness reads `AGENTS.md`/`CLAUDE.md` at repo root and rules at `.claude/rules/` — these **cannot move** into `docs/` without breaking pickup. concept-rag avoids this by authoring *separate* docs-side guidance (`prompts/guidance.md`, `prompts/ide-setup.md`) rather than relocating harness config. **Reproduction for wfs**: an `Agent Guidance` nav section whose Overview is a new `docs/` page summarizing the bootstrap model and linking the existing `docs/ide-setup.md`; it references (does not move) `AGENTS.md`/`.claude/rules/`. Mirrors concept-rag's "docs guidance ≠ harness config" separation. Note concept-rag also mirrors root long-form docs (FAQ/TROUBLESHOOTING) into `docs/` while leaving the root copies for GitHub browsing (ADR-0052 §Consequences/Neutral) — the same "canonical in docs, mirror at root" pattern applies to guidance.

### Q7 — AGENTS.md vs CLAUDE.md
`diff` shows the two files differ on **line 1 only** — the H1 (`# AGENTS.md` vs `# CLAUDE.md`); every other byte is identical. They are maintained-in-lockstep duplicates differentiated solely by filename/title for the two harness conventions (generic `AGENTS.md` and Claude Code's `CLAUDE.md`). Maintenance implication: edits must be applied to both; drift between them would be a latent inconsistency. De-duplication (symlink/include) is out of scope for this doc work package.

### Q8 — MkDocs toolchain + deploy pipeline vs lighter equivalent (decision deferred to planning per DP-8)
concept-rag's full toolchain is concrete: `mkdocs.yml` (Material theme + extensions + nav) **plus** a GitHub Action `.github/workflows/docs.yml` that runs `pip install mkdocs-material` then `mkdocs gh-deploy --force` on push to `docs/**`/`mkdocs.yml`/the workflow file (with `concurrency` cancel-in-progress and `permissions: contents: write` for Pages). "Same shape and style" most faithfully means adopting `mkdocs.yml` + the same nav/landing/section-index structure; the deploy Action is the publishing half and is a **CI change requiring approval** (file-sensitivity-cicd-approval). A lighter equivalent (cross-linked markdown + a hand-written `docs/index.md`) could approximate the *structure* but would not deliver the searchable published site that defines the reference. Final toolchain depth is a planning decision (DP-8); the deploy-pipeline subset additionally needs explicit approval.

### Q9 — FAQ/Troubleshooting source content
wfs has **no** FAQ or troubleshooting content anywhere in `docs/`, `README.md`, or `SETUP.md` (grep found none). concept-rag's `docs/faq.md` (164 lines) and `docs/troubleshooting.md` (285 lines) are condensed site versions of larger root `FAQ.md` (470) / `TROUBLESHOOTING.md` (883). For wfs, these sections would be **authored fresh**; seed material is thin — possible sources: `SETUP.md` MCP-client-config gotchas, `docs/ide-setup.md` "Verifying the Connection" / "If the agent skips discover…" troubleshooting note, and common workflow-fidelity failure modes. Whether to include FAQ/Troubleshooting (and how much to author vs. defer) is a scope decision for planning given the absence of source content.

## Deep-Dive 2 — Concrete inspection of the four deferred questions (2026-06-09)

Each remaining open question investigated against the actual files in both repos (wfs worktree `2026-06-09-workflow-server-docs-system`; cr at `~/projects/dev/concept-rag`). The toolchain/nav/link facts for Q8/Q10/Q11 are concrete, and Q5 has a complete present-state account below. None of the four is a *comprehension* gap; all are bounded *planning* decisions.

### Q5 — ADR series + voice rule (wfs has ADRs; no voice conflict)

Direct inspection found:

- **`.engineering/artifacts/adr/` contains five ADRs**: `0001-import-prism-families.md`, `0002-execution-model-schema.md`, `0003-server-managed-session-state.md`, `0004-dco-policy-compatibility.md`, `0005-canonical-identifier-naming-convention.md`. They use a Nygard-style template: `**Status:**` (with values incl. Proposed/Accepted), Date, Issue/PR links, Context, Decision, **Key design choices** (a "Choice / Decision / Alternatives considered" table), Rationale, Consequences (Positive/Negative/Neutral), Related. ADR-0005 records *alternatives rejected* and *deferred* items — i.e. it narrates decision evolution by design.
- **The ADR practice is codified in the workflow corpus**: `workflows/work-package/resources/architecture-review.md` ("ADRs Precede Design", "When to Write an ADR", "When to Create an ADR (Timing)", an ADR-anti-patterns table, a required/optional ADR section template, and a Status lifecycle incl. **Deprecated / Superseded by ADR-XXXX** with mandatory bidirectional linking). ADRs are a first-class, taught artifact type in this repo.
- **`.engineering/README.md` documents the location**: `adr/  # Architecture Decision Records`.

The `.engineering/AGENTS.md` describe-as-it-is rule governs *the system's own documentation* (`docs/`, READMEs, schema docs, technique/workflow content, code comments) and **explicitly exempts `artifacts/`** (planning artifacts "are *meant* to record evolution"). wfs ADRs live in `.engineering/artifacts/adr/`, **inside that exemption** — they legitimately narrate evolution (Status transitions, alternatives, deferrals) without violating any rule. A voice-rule conflict arises only *if* ADRs are physically relocated/mirrored into `docs/`.

**Divergence from cr that matters**: cr stores its 54 ADRs *inside* `docs/architecture/adrNNNN-*.md` (published in the site, under the docs voice). wfs stores its 5 ADRs *outside* `docs/`, in `.engineering/`. So "mirror cr's shape" does **not** transfer cleanly for ADRs — faithfully copying cr would mean moving wfs ADRs under the docs voice rule (the conflict), whereas the wfs-native pattern keeps decision history in the exempt `.engineering/` tree. The narrow planning choice (DP-6): leave ADRs in `.engineering/` and (optionally) link to them from a docs Architecture hub, vs. relocate/mirror them into `docs/` and add an ADR voice-exemption. The former is lower-risk and consistent with how wfs works.

### Q8 — MkDocs toolchain depth (tooling itemized; depth = planning)

Concrete cr toolchain (every file inspected):

| Component | cr file | Content |
|-----------|---------|---------|
| Site config + nav | `mkdocs.yml` (8.1 KB) | `theme: material` + 9 feature flags (incl. `navigation.indexes`, `toc.integrate`); **14 markdown_extensions** (admonition, pymdownx.details/superfences-mermaid/highlight/inlinehilite/snippets/tabbed/emoji, tables, attr_list, md_in_html, toc permalink); a fully **manual `nav` tree**; `plugins: - search` |
| Python deps | `requirements.txt` | `nltk>=3.8` (runtime) + `mkdocs-material>=9.0` (docs) |
| Dev scripts | `package.json` | `"docs:serve": "mkdocs serve"`, `"docs:build": "mkdocs build"` |
| Deploy CI | `.github/workflows/docs.yml` (955 B) | On push to `docs/**`/`mkdocs.yml`/itself + `workflow_dispatch`; `concurrency` cancel-in-progress; `permissions: contents: write`; steps: checkout `fetch-depth: 0` → setup-python 3.11 (`cache: pip`) → `pip install mkdocs-material` → `mkdocs gh-deploy --force` |
| Infra ADR | `adr0050-mkdocs-material-documentation-site.md` | Records the decision: Files Created = `mkdocs.yml`, `docs/index.md`, `.github/workflows/docs.yml`; Files Modified = `requirements.txt`, `package.json` |

**wfs baseline**: there is **no `.github/` directory and no CI of any kind** in either the worktree or `main` (confirmed by `ls`), and no `mkdocs.yml`, `requirements.txt`, or `pyproject.toml`. So adopting cr's pipeline introduces (a) the **repo's first GitHub Actions workflow**, (b) the **first Python dependency** into an otherwise pure-TypeScript repo, and (c) a GitHub Pages deploy target. These decompose into three independently-adoptable/approvable layers — structure-only (`mkdocs.yml` + pages, builds locally, no CI); +local-build (`requirements.txt` + npm `docs:*` scripts); +deploy-Action (the publishing half, CI-approval-gated per file-sensitivity-cicd-approval). The faithful-mirror reading wants all three; a lighter structural mirror could stop at layer (a)/(b). This is DP-8 — a depth/scope judgement, not a code question.

### Q10 — nav↔file sync mechanism (manual, no sync plugin)

cr keeps `mkdocs.yml` `nav` in sync with files **entirely by hand**. The `plugins:` block is just `- search`. Every one of the ~80 pages, including all 54 ADRs, is enumerated as an explicit `Title: path` (or `Title: [children]`) entry, with hand-written human titles (e.g. `"ADR-0050: MkDocs Site": architecture/adr0050-....md`). Consequences for any wfs adoption:

- Adding/moving/renaming a doc requires a **manual `nav` edit**; the nav is hand-maintained, not autodiscovered.
- The **mechanical tripwire is `mkdocs build`**, which errors on a nav entry pointing at a *missing* file. The reverse (a file present in `docs/` but absent from `nav` — an "orphaned" page that won't appear) surfaces under `mkdocs build --strict` or the `validation:` config block. cr's `docs.yml` calls `gh-deploy --force`, so cr relies on author discipline plus the missing-file build error.
- This is the concrete substance behind the "second source of truth" risk: the sync is manual and half-guarded. Whether wfs adds a plugin (autodiscovery) or runs `--strict` in CI is the planning decision; the *mechanism in the exemplar* is manual.

### Q11 — inbound-link inventory (mitigation = planning)

Full inventory of `.md` inbound links in the wfs docs surface (grep of README/SETUP/AGENTS/CLAUDE/`docs/`/`schemas/README.md` in the worktree). ~50 links total. Targets ranked by inbound count (fan-in = link-rot blast radius if the target is renamed/moved):

| Target | Inbound links | Linked from |
|--------|--------------:|-------------|
| `docs/ide-setup.md` | 8 | README, SETUP, AGENTS×2, CLAUDE×2, `docs/workflow-fidelity.md`, `schemas/README.md` |
| `docs/api-reference.md` | 5 | README×2, AGENTS, CLAUDE, `docs/ide-setup.md`, `docs/workflow-fidelity.md` |
| `README.md` | 5 | AGENTS×2, CLAUDE×2, `docs/ide-setup.md` |
| `SETUP.md` | 4 | README (+`#deploying-to-projects` anchor), AGENTS, CLAUDE |
| `schemas/README.md` | 3 | README, AGENTS, CLAUDE |
| `docs/workflow-fidelity.md` | 3 | README, `docs/architecture.md`, `docs/api-reference.md` |
| `docs/development.md` | 2 | README, `schemas/README.md` |
| `docs/state_management_model.md` | 2 (both with `#5-persistence` **anchor**) | `docs/dispatch_model.md`, `docs/workflow-fidelity.md` |
| the 6 `*_model.md` + `resource_resolution_model.md` | hub spokes | `docs/architecture.md` (numbered pointers), plus cross-refs (`checkpoint_model.md`→`dispatch_model.md`, `orchestra-specification.md`→`resource_resolution_model.md`, `schemas/README.md`→`resource_resolution_model.md`) |

Constraints that bound any relocation/rename:

- **Files that CANNOT move** (would break the harness or external entry points): `AGENTS.md`, `CLAUDE.md`, `.claude/rules/*` (harness reads them at fixed paths), and `README.md` / `SETUP.md` (GitHub repo + npm package landing pages). These are also the *highest-fan-out source* files — they hold most of the inbound links above.
- **Anchor-fragment links** (`state_management_model.md#5-persistence`, `SETUP.md#deploying-to-projects`) break not only on file rename but on **heading rename**, so any heading-level tidy must preserve those two anchors.
- **The `_model.md` snake_case vs `-specification.md`/`*.md` kebab-case naming inconsistency** (the thing a "consistency" restructure would want to rename) is exactly what carries the `docs/architecture.md` numbered hub pointers and the inter-model cross-refs — renaming for consistency is the single largest link-rot source.

Mitigation options are all planning decisions: (a) keep every filename, add only the site frame (`index.md`, `mkdocs.yml`, section folders via the cr `prompts -> ../prompts`-style symlink or `nav` paths) → **zero link rot**; (b) rename for consistency + add MkDocs `redirects` plugin entries for each old→new path; (c) accept breakage and fix links repo-wide. The exemplar itself (cr) demonstrates pattern (a) for cross-tree inclusion: `docs/prompts` is a **symlink** to `../prompts`, and its root long-form docs (`FAQ.md` 12 KB) coexist with **separate, diverged** `docs/faq.md` (4.9 KB) copies — the "canonical-in-docs, mirror-at-root, manage-the-drift" pattern, not a move.

## Deep-Dive — Portfolio Lens Findings (2026-06-09)

Two lenses applied independently to the concept-rag documentation system as a template that workflow-server would inherit by mirroring it. Lenses examined `mkdocs.yml`, `docs/index.md`, `architecture/README.md`, the ADR template (ADR-0050/0052), and `prompts/`.

### Lens: pedagogy

The concept-rag system makes explicit choices, each silently rejecting an alternative. A team mirroring it (workflow-server) internalizes the patterns but faces a *different* problem shape, unconsciously resurrecting rejected alternatives:

- **Choice: ADR series as decision history → rejects "decision history lives outside the docs site."** concept-rag chose to put 54 ADRs *inside* `docs/` and the published site. workflow-server's different problem: it *already* records decisions in `.engineering/artifacts/planning/` and enforces a describe-as-it-is voice rule on `docs/`. Mirroring "ADRs in docs" resurrects the rejected alternative (evolution-narrating prose in the system's own docs) — which **silently violates the voice rule**. Silent because a build still passes and pages still render; the violation only surfaces in review or when a reader notices the docs contradict their as-is framing.
- **Choice: grid-card landing that is *unique* (not README-derived) → rejects "landing == README."** ADR-0052 records concept-rag's choice of a unique landing over a README-duplication landing. A mirrorer who skims only the `index.md` may not see the rejected path and will resurrect "paste the README into index.md" — a **silent problem** (page looks fine) that produces a low-value landing and duplicated maintenance.
- **Choice: agent guidance authored as separate docs pages (`prompts/`) → rejects "guidance == the harness config files."** workflow-server's harness *requires* `AGENTS.md`/`.claude/rules/` at fixed paths. A naive mirror ("make a guidance section from the rule files") risks either moving the files (**visible failure** — harness stops picking them up) or duplicating them (**silent problem** — two sources drift, exactly the AGENTS/CLAUDE lockstep-maintenance hazard already present in the repo).
- **Choice: `navigation.indexes` + per-section Overview pages → rejects "flat file list."** Transfers cleanly, but assumes every section *has* enough pages to warrant an index. workflow-server sections like "API Reference" are single-page; forcing an index there is needless ceremony — a minor visible friction, not a failure.

**Pedagogy law**: *a constraint the exemplar resolved gets transferred as an unexamined assumption.* concept-rag resolved "where does decision history live" (answer: ADRs in docs) and "where does guidance live" (answer: separate docs pages). Mirroring transfers those *answers* as assumptions, even though workflow-server's constraints (existing planning artifacts + a voice rule; harness-fixed config paths) make different answers correct.

**Prediction — slowest-to-discover failure**: the ADR/voice-rule conflict (Q5). It fails *silently* — an adopted ADR series renders perfectly and is only caught when a careful reviewer notices `docs/` now narrates evolution against the repo's own rule, or when the next describe-as-it-is audit flags it. It is the latest to surface because nothing mechanical (build, link check) detects a *voice* violation.

### Lens: rejected-paths

Concrete problems in the as-is workflow-server docs, the decision that enabled each, and the rejected path that would prevent it (while creating another hidden danger):

- **Problem: no discoverable entry point.** Enabled by the decision to keep docs as flat per-purpose files with no nav/landing. *Rejected path*: adopt the full MkDocs Material site + landing + nav. **Visible problem vanishes** (single entry point, search). **Invisible danger emerges**: a build/deploy dependency (Python/MkDocs in a TS repo, a `gh-deploy` Action) and a *second* source of navigation truth (`mkdocs.yml`) that must be kept in sync with the files — a broken/orphaned nav entry becomes a new failure class that didn't exist when there was no nav at all.
- **Problem: scattered getting-started (README + SETUP + ide-setup).** Enabled by growing each doc independently. *Rejected path*: consolidate into one `getting-started.md`. **Visible problem vanishes** (one place to start). **Invisible danger**: content duplication between README (which must stay useful on GitHub/npm) and the docs-site getting-started — the exact "canonical in docs, mirror at root" drift concept-rag manages explicitly for FAQ/TROUBLESHOOTING (ADR-0052).
- **Problem: inconsistent file naming (`snake_case_model.md` vs `kebab-specification.md` vs `kebab.md`).** The three conventions partition the docs by purpose. *Rejected path*: rename everything to one convention during the restructure. **Visible problem vanishes** (uniform names). **Invisible danger**: breaks every existing inbound link (README "•" bar, `architecture.md` numbered pointers, external bookmarks, the `_model.md` cross-refs) — a migration cost and link-rot risk that the as-is inconsistency doesn't impose.
- **Problem: no FAQ/Troubleshooting.** Enabled by never authoring them. *Rejected path*: author them now. **Visible problem vanishes** (parity with reference). **Invisible danger**: with thin seed content (Q9), authored FAQ/Troubleshooting risk *inventing* behavior — directly tripping the success criterion "no drift introduced / describe-as-it-is."

**Rejected-paths law**: *the class of problem that migrates here is "discoverability vs. fidelity/sync."* Every restructure move that buys discoverability (site, consolidation, renaming, new pages) converts a *visible* navigation gap into an *invisible* synchronization or fidelity obligation (nav-to-file sync, root-vs-docs mirror drift, link rot, invented content).

**Prediction — first discovered under pressure**: nav-to-file sync breakage. The moment someone adds or moves a doc and forgets `mkdocs.yml`, the MkDocs build fails (or worse, ships an orphaned page). It is discovered first because it is the one migration with a *mechanical* tripwire (the build) — unlike the voice/fidelity dangers, which are silent.

### Cross-lens synthesis

| Finding | pedagogy | rejected-paths | Convergent / Unique |
|---------|----------|----------------|---------------------|
| ADR adoption conflicts with the describe-as-it-is voice rule | ✓ (slowest failure) | ✓ (FAQ-invention is the same fidelity class) | **Convergent** — both flag *fidelity* as the silent danger of mirroring. **Caveat**: the conflict materializes only if ADRs are placed *in `docs/`*; wfs's ADRs sit in the exempt `.engineering/` tree, so a link-only docs hub avoids it entirely (the FAQ-invention fidelity risk in Q9 remains live). |
| `mkdocs.yml` becomes a second source of nav truth requiring sync | — | ✓ (first-discovered, has a build tripwire) | Unique to rejected-paths |
| Landing page must be unique, not README-derived | ✓ | partially (consolidation-drift) | Mostly pedagogy |
| Agent-guidance files cannot move (harness paths) → duplicate-and-drift | ✓ | — (AGENTS/CLAUDE lockstep is the live instance) | Unique to pedagogy |
| Renaming for consistency trades visible inconsistency for link rot | — | ✓ | Unique to rejected-paths |

**Convergent high-confidence finding**: the dominant risk of faithfully mirroring concept-rag is **fidelity/sync drift**, not the structure itself. The structure transfers cleanly (it's a working exemplar); the danger lives in the *obligations the structure imposes* — keeping nav in sync with files, keeping root docs in sync with their docs-site mirrors, and not letting new page types (ADRs, FAQ) narrate evolution or invent behavior against the repo's own voice/fidelity rules.

---
*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*

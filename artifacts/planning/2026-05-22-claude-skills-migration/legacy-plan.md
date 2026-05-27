---
title: "TOON → markdown migration (work-package pilot)"
status: draft
phase: planning
date: 2026-05-23
references:
  architecture: ./architecture.md
  ontology-plan: ./workflow-canonical-plan.md
  ontology: ./workflow-canonical-ontology.md
  ontology-definition: ./sample/resources/workflow-canonical/SKILL.md
---

# TOON → markdown migration (work-package pilot)

> **Phase 1 of the markdown-skills migration.** Translate the existing TOON skill and resource content into markdown-skill form on the new architecture, landing it in **the one ontology** ([workflow-canonical](./sample/resources/workflow-canonical/SKILL.md)). A migrated TOON skill becomes a **technique** (`metadata.kind: technique`, `metadata.ontology: workflow-canonical`) that **keeps its existing section shape** (`Capability / Protocol / Rules / Errors`); a migrated TOON resource becomes a **freeform resource** (no `metadata.ontology`, no `metadata.kind`). Functional parity with the pre-migration workflow-server is the success criterion.
>
> **Why this phase exists:** the architectural move from TOON to markdown is substantive and largely orthogonal to the richer ontological restructuring. Phase 1 de-risks by performing the structural translation with minimal content re-cutting — every migrated skill keeps its TOON-shaped section body, which the one ontology accepts as a valid (self-contained) technique body. Phase 2 ([workflow-canonical-plan.md](./workflow-canonical-plan.md)) restructures that content into the ontology's richer composing-technique decomposition (a composing body that references nested techniques) on top of an already-proven architecture.

---

## 1. Goal & non-goals

### Goal

Translate every TOON skill file and every resource file from the existing `workflows` branch into the new markdown-skills architecture — TOON skills landing as **techniques** (carrying `metadata.ontology: workflow-canonical` + `metadata.kind: technique`, keeping their existing section shape) and TOON resources landing as **freeform resources** — on a new **`skills`** orphan branch, with **behaviour identical** to the pre-migration workflow-server when agents fetch and execute content.

Phase 1 completes when:

1. All 10 workflows' skill and resource content lives on the `skills` branch in markdown form.
2. The workflow-server serves agents exclusively from the `skills` branch (skill/resource content) and the `workflows` branch (workflow.toon, activities/).
3. The legacy TOON skills/resources are **removed** from the `workflows` branch (see Phase 1.8) — single source of truth.

### Non-goals (Phase 1 explicitly excludes)

- The richer workflow-canonical restructuring — decomposing each migrated technique into a composing body + nested techniques, pulling cross-cutting protocol phases into shared techniques, subsuming resources into technique bodies. Deferred to Phase 2 ([workflow-canonical-plan.md](./workflow-canonical-plan.md)). Phase 1 lands content in the one ontology but keeps each technique's body in its TOON-derived `Capability / Protocol / Rules / Errors` shape — a valid (self-contained) technique body, not yet decomposed.
- Any content edits beyond mechanical TOON-to-markdown translation, **except for three adopted refinements** (see §5.5): cross-references rendered as root-relative markdown hyperlinks, resource references distributed inline at point-of-use rather than collected in a `## Resources` section, and consistent tool-usage promoted to a tool-operations technique (the `gitnexus-operations` divergence). No other rewording, restructuring, or content-drift fixes.
- **Structural** changes to `workflow.toon` and `activities/*.toon` files. They stay in the existing `workflows` branch with their structure intact. **Exception:** path-shaped reference strings inside them are rewritten to slug-form by Phase 1.4b (see §6) — pure string replacement, no schema or shape changes.
- Schema migration (`schemas/skill.schema.ts` etc.). The one ontology is informally specified by its definition resource ([sample/resources/workflow-canonical/SKILL.md](./sample/resources/workflow-canonical/SKILL.md)), not by a Zod schema.
- Sub-skill nesting. Phase 1 migrated content is flat by construction (each TOON skill becomes a single self-contained technique; resources don't compose into deeper structures). The ontology permits nesting; Phase 1 chooses not to use it.

---

## 2. Settled decisions

| Decision | Value | Source |
|---|---|---|
| Workflow scope | All 10 workflows in one pass | User answer, 2026-05-23 |
| TOON→markdown mapping | Each top-level TOON field becomes a `##` section; nested objects become deeper headings | User answer, 2026-05-23 |
| Folder slug | Drop the `NN-` order prefix; folder is just the slug. Order preserved as `metadata.order`. | User answer, 2026-05-23 |
| Resource references | Root-relative markdown hyperlinks to the target SKILL.md (`[slug](legacy/<workflow>/resources/<slug>/SKILL.md)`), placed **inline at point-of-use** — no `## Resources` section | User decisions, 2026-05-23 / 2026-05-27 |
| Branch name | `skills` (new orphan branch, separate from existing `workflows` branch) | User instruction |
| Top-level folder | `legacy/` (under the orphan branch root) — a plain folder name, no ontological meaning | User instruction |
| Per-workflow structure | `legacy/<workflow>/techniques/` (techniques), `legacy/<workflow>/resources/` (freeform resources) | User instruction |
| Ontology definition location | `shared/resources/workflow-canonical/SKILL.md` (a shared freeform resource) | Architecture convention |

---

## 3. How migrated content fits the one ontology

There is **one ontology** ([workflow-canonical](./sample/resources/workflow-canonical/SKILL.md)). Migrated content maps onto its two content categories — **technique** and **freeform resource** — with no separate "legacy" ontology and no `skill`/`resource` content kinds.

### How the two TOON file types map

- **A TOON skill** (e.g. `10-implement-task.toon`) becomes a **technique** — `metadata.kind: technique`, `metadata.ontology: workflow-canonical`. It carries protocol, rules, inputs/outputs, error definitions, resource references. The ontology accepts a `Capability / Protocol / Rules / Errors` body as a valid self-contained technique body, so the migration **keeps the TOON section shape** rather than decomposing into nested techniques (that decomposition is Phase 2). Consumed by agents executing workflow activities; the server delivers it as TOON.
- **A TOON or markdown resource** (`resources/NN-*.md` or `resources/NN-*.toon`) becomes a **freeform resource** — `name` + `description` only, carrying **neither** `metadata.ontology` **nor** `metadata.kind`. Reference material — templates, criteria, primers, glossaries. Referenced from techniques by inline root-relative hyperlink at point-of-use; the server delivers it as simplified markdown.

### The ontology definition

The ontology is defined by a single freeform shared resource at `shared/resources/workflow-canonical/SKILL.md` — there is **no meta-skill kind** and **no `skills/meta/` location convention**. The definition resource (drafted at [sample/resources/workflow-canonical/SKILL.md](./sample/resources/workflow-canonical/SKILL.md)) describes:

- The two content categories (what a `technique` and a freeform `resource` are, structurally and semantically).
- The TOON-field → markdown-section mapping (§5 of this plan is the canonical reference for the migration convention).
- The cross-reference convention: root-relative markdown hyperlinks to the target SKILL.md (`[slug](legacy/<workflow>/<techniques|resources>/<slug>/SKILL.md)`).
- The frontmatter schema for techniques and resources.
- Bootstrap protocol: an agent encountering a technique whose `metadata.ontology` names `workflow-canonical` resolves that name (workflow-local → shared/) and loads this definition resource before interpreting the technique.

Phase 1 lands all 10 workflows in this one ontology, keeping technique bodies in TOON-derived section shape. Phase 2 ([workflow-canonical-plan.md](./workflow-canonical-plan.md)) restructures specific workflows into the ontology's richer composing-body decomposition (composing techniques that reference nested techniques).

---

## 4. Target on-disk structure

```
skills (orphan branch root)
├── shared/
│   └── resources/
│       └── workflow-canonical/SKILL.md       # the ONE ontology's definition (a freeform shared resource)
└── legacy/                                    # a plain folder name — no ontological meaning
    ├── work-package/
    │   ├── techniques/                        # migrated TOON skills → techniques (ontology: workflow-canonical, kind: technique)
    │   │   ├── review-code/SKILL.md          # was 00-review-code.toon
    │   │   ├── review-test-suite/SKILL.md    # was 01-review-test-suite.toon
    │   │   ├── …                              # 23 more
    │   │   └── dco-provenance/SKILL.md       # was 25-dco-provenance.toon
    │   └── resources/                         # migrated TOON/markdown resources → freeform resources (no ontology, no kind)
    │       ├── readme/SKILL.md               # was 01-readme.md
    │       ├── github-issue-creation/SKILL.md
    │       ├── …                              # 26 more
    │       └── pr-review-response/SKILL.md
    ├── prism/
    │   ├── techniques/ …
    │   └── resources/ …
    ├── prism-audit/
    │   ├── techniques/ …
    │   └── resources/ …
    ├── prism-evaluate/
    │   ├── techniques/ …
    │   └── resources/ …
    ├── prism-update/
    │   ├── techniques/ …
    │   └── resources/ …
    ├── remediate-vuln/
    │   ├── techniques/ …
    │   └── resources/ …
    ├── substrate-node-security-audit/
    │   ├── techniques/ …
    │   └── resources/ …
    ├── cicd-pipeline-security-audit/
    │   ├── techniques/ …
    │   └── resources/ …
    ├── work-packages/
    │   ├── techniques/ …
    │   └── resources/ …
    ├── workflow-design/
    │   ├── techniques/ …
    │   └── resources/ …
    └── meta/
        ├── techniques/ …
        └── resources/ …
```

Per-technique / per-resource shape: each is a folder containing a single `SKILL.md`. No sub-folders, no sub-files. Flat (Phase 1 does not nest; the ontology permits it, Phase 2 uses it).

---

## 5. TOON → markdown transformation rules

### 5.1 Frontmatter

Every migrated SKILL.md carries top-level fields per the agentskills.io spec. A migrated **technique** (from a TOON skill) also carries a `metadata:` block; a migrated **freeform resource** carries no `metadata.ontology`/`metadata.kind` (only `name`/`description` plus optional author data such as `order`/`legacy_id`).

| Source (TOON) | Target (markdown frontmatter) | Notes |
|---|---|---|
| `id:` | top-level `name:` | matches the directory slug |
| `description:` | top-level `description:` | 1–1024 chars per spec |
| (implicit, techniques only) | `metadata.ontology: workflow-canonical` | the one ontology; **techniques only** — resources carry neither this nor `kind` |
| (implicit, techniques only) | `metadata.kind: technique` | techniques only |
| `version:` | `metadata.version:` | preserved if present |
| (filename prefix) | `metadata.order: <NN>` | the numeric prefix from `NN-<slug>.toon`; preserved for workflow-iteration semantics |
| (filename prefix) | `metadata.legacy_id: <NN>` | preserved so cross-references by numeric ID still resolve during transition |

Example frontmatter for a migrated technique (from a TOON skill):

```yaml
---
name: implement-task
description: Implement a single task from the plan by writing code changes.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.1.3
  order: 10
  legacy_id: 10
---
```

For a migrated freeform resource (carries neither `ontology` nor `kind`):

```yaml
---
name: gitnexus-reference
description: GitNexus MCP tools and graph schema reference.
metadata:
  order: 27
  legacy_id: 27
---
```

### 5.2 Body — TOON field → `##` section

Each top-level TOON field becomes a `##` heading. Nested objects become `###` (and deeper) headings. Lists stay as markdown lists. The convention is **mechanical and round-trippable**.

The full mapping table for TOON skills:

| TOON field | Markdown section |
|---|---|
| `capability:` | `## Capability` (paragraph body) |
| `inputs[N]:` | `## Inputs`, each input as a `### <id>` subsection (lead the body with `*(optional)*` when `required: false`) |
| `protocol:` (with named phases) | `## Protocol`, each phase as `### N. <Phase Title>` (ordinal-numbered) with bullet-list body |
| `output[N]:` | `## Outputs` (**plural — renamed from the TOON singular `output`**), each output as a `### <id>` subsection |
| `rules:` (named rules with text) | `## Rules`, each rule as a `### <rule-name>` subsection |
| `resources[N]:` (list of refs) | **No `## Resources` section.** Each referenced resource is rendered as an inline hyperlink at its point-of-use within the consuming section (see §5.3) |
| `errors:` (named errors with cause/recovery) | `## Errors`, each error as `### <error-name>` with `**Cause:**` and `**Recovery:**` lines |

For resource files (mostly markdown already), the existing content body becomes the body verbatim. Only frontmatter is added.

For resource files that are TOON (the `*.toon` extension under `resources/`), apply the same field-to-section mapping as for skills.

### 5.3 Cross-reference rewriting (inline hyperlinks)

TOON skills reference resources by numeric ID inside the `resources:` field. These are **not** collected into a trailing `## Resources` section. Instead each resource is rendered as a **root-relative markdown hyperlink at its point-of-use** — inside the protocol phase, rule, or other section that actually consumes it:

| Source (TOON) | Target (markdown, inline at point-of-use) |
|---|---|
| `resources[N]: ["27"]` (referenced from a protocol step) | `… see [gitnexus-reference](legacy/<workflow>/resources/gitnexus-reference/SKILL.md) …` |

Convention:

- **Link text** is the target slug (e.g. `gitnexus-reference`); the **target** is root-relative from the skills-branch root and always ends in `/SKILL.md` so it resolves to a real, openable file. To fetch, an agent strips the trailing `/SKILL.md` and calls `get_skill` on the folder path.
- **Placement** is at point-of-use. A resource listed in the source `resources:` field but not named anywhere in the body is placed where its content is most relevant, or surfaced to the user when placement is ambiguous.

The rewrite requires the migration tooling to:
1. Walk the workflow's resources/ directory and build a numeric-ID → slug map.
2. For each in-body resource reference, look up the slug and emit the inline hyperlink at the consuming location.

Slug derivation: strip the `NN-` prefix and the file extension from the resource's filename. E.g. `27-gitnexus-reference.md` → `gitnexus-reference`.

References that fail to resolve (numeric ID not found in the workflow's resources/) are flagged as fidelity violations.

### 5.4 Worked example

**Source: `workflows/work-package/skills/10-implement-task.toon`**

```
id: implement-task
version: 2.1.3
capability: Implement a single task from the work package plan by writing code changes

description: "Implement a single task from the plan by writing code changes."

inputs[2]:
  - id: current-task
    description: "The task to implement from the plan (provided by the activity loop iterator)"
  - id: test-plan
    description: "Test plan with strategy and acceptance criteria for guidance"
    required: false

protocol:
  understand-context[3]:
    - Read the task description and requirements from the plan
    - Identify affected files, dependencies, and related code
    - Review test plan for acceptance criteria relevant to this task
  pre-edit-impact-check[3]:
    - "Run `gitnexus_impact({target: <symbol>, direction: 'upstream'})` on the target symbol before any edit"
    - "Read the impact report; if HIGH or CRITICAL risk, surface it to the user before proceeding"
    - "Use `gitnexus_context({name: <symbol>})` to understand callers/callees of the symbol — see resource 27 for the full reference"
  …

output[1]:
  - id: task-implementation
    description: "Code changes for a single task"

rules:
  single-task-focus: "Implement exactly one task — do not scope-creep into adjacent tasks"
  gitnexus-discipline: "Implementations MUST execute the pre-edit-impact-check…"

resources[3]:
  - "14"
  - "23"
  - "27"

errors:
  compilation_failure:
    cause: Code changes do not compile
    recovery: Review error messages, fix issues, and retry
```

**Target: `legacy/work-package/techniques/implement-task/SKILL.md`**

```markdown
---
name: implement-task
description: Implement a single task from the plan by writing code changes.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.1.3
  order: 10
  legacy_id: 10
---

## Capability

Implement a single task from the work package plan by writing code changes

## Inputs

### current-task

The task to implement from the plan (provided by the activity loop iterator)

### test-plan

*(optional)* Test plan with strategy and acceptance criteria for guidance

## Protocol

### 1. Understand Context

- Read the task description and requirements from the plan
- Identify affected files, dependencies, and related code
- Review test plan for acceptance criteria relevant to this task

### 2. Pre Edit Impact Check

- Apply the [gitnexus-operations](legacy/work-package/techniques/gitnexus-operations/SKILL.md) `impact` operation with `{target: <target-symbol>, direction: 'upstream'}` before any edit
- Read the resulting impact_report; if HIGH or CRITICAL risk, surface it to the user before proceeding
- Apply `gitnexus-operations::context` with `{name: <target-symbol>}` to understand callers/callees of the symbol

…

## Outputs

### task-implementation

Code changes for a single task

## Rules

### single-task-focus

Implement exactly one task — do not scope-creep into adjacent tasks

## Errors

### compilation_failure

**Cause:** Code changes do not compile

**Recovery:** Review error messages, fix issues, and retry
```

The target above reflects the adopted refinements (§5.5) layered on the mechanical mapping. Note three departures from a naive field-to-section translation of the source TOON:

- The source's `resource 27` in-body pointer becomes a **root-relative hyperlink** at point-of-use; resources are distributed inline, so there is **no `## Resources` section**.
- The source's raw `gitnexus_*` calls become references to the **`gitnexus-operations`** operations technique.
- The source's `gitnexus-discipline` rule is **dropped** — the tool-usage policy it restated now lives once inside `gitnexus-operations`.

### 5.5 Adopted refinements beyond mechanical mapping

Three refinements were adopted during the work-package pilot (2026-05-23 → 2026-05-27). They are deliberate departures from a pure 1:1 mechanical mirror; everything else stays mechanical.

#### Cross-references as root-relative hyperlinks

Every technique→technique and technique→resource reference is a root-relative markdown hyperlink to the target SKILL.md (link text = target slug; path rooted at the skills-branch root; always ends in `/SKILL.md`). This replaces the earlier `skill:<path>` specifier idea. The ontology definition resource documents this as its "Cross-reference format". To fetch, an agent strips the trailing `/SKILL.md` and calls `get_skill` on the folder.

#### Resources distributed inline (no `## Resources` section)

The source TOON collected resource references in a trailing `resources:` list. The migration distributes each to its point-of-use as an inline hyperlink (see §5.3); the `## Resources` section is removed entirely. Rationale: a reader encounters each reference where it matters rather than as a disconnected trailing list. A resource declared but never named in the body is placed where its content is most relevant, or surfaced to the user when ambiguous.

#### Consistent tool-usage promoted to operations techniques (the `gitnexus-operations` divergence)

Where a tool was driven in a consistent, parameterised way across many techniques, that usage is promoted to **operations in a tool-operations technique** and referenced from protocol steps as `<tool>-operations::<op>` — rather than restated inline in every technique and reinforced by per-technique "rules". This mirrors the pre-existing `cargo-operations` technique (operations with Inputs/Output/Procedure/Tools/Errors, referenced as `cargo-operations::check`, enforced by a single `resource-budget` rule).

The pilot applied this to GitNexus:

- **New technique** `legacy/work-package/techniques/gitnexus-operations/SKILL.md` (`metadata.kind: technique`, `metadata.ontology: workflow-canonical`). It is **migration-introduced** — it has no 1:1 source TOON file (the GitNexus analogue of `cargo-operations`). Assigned `order`/`legacy_id` 26 (unreferenced; net-new).
- **Five primitive operations** wrap the MCP tools with the canonical parameter set and output interpretation: `impact`, `context`, `detect-changes`, `query`, `cypher`.
- **Seven composite operations** encode the multi-call recipes that recurred across skills (formerly duplicated in the `gitnexus-reference` resource's "Work-package Integration Patterns" prose): `orphan-scan`, `public-api-enum`, `diff-coverage-map`, `scope-discipline-check`, `diagram-source-select`, `complexity-signal`, `reversibility-signal`.
- **Two policy rules** in the new skill: `must-use-operations` (analysis goes through the operations; grep is the unindexed/stale fallback) and `index-freshness` (staleness handling, centralised).
- **15 consuming techniques** had their inline `gitnexus_*` calls rewritten to operation references with parameter sets; **four tool-usage "rules" were removed** (`implement-task::gitnexus-discipline`, `build-comprehension::gitnexus-usage`, `analyze-implementation::gitnexus-first-locate`, `reconcile-assumptions::tool-usage`).
- The **`gitnexus-reference` resource** was trimmed: its "Work-package Integration Patterns" prose section was removed (now the composite operations); the tool/schema/CLI reference material remains.

Forward-compatibility: this flat operations-technique maps cleanly onto the workflow-canonical "Tool" concept (a tool-dedicated namespace resource) in Phase 2. The same lens applies to other tools driven via per-technique rules (e.g. `gh` in `create-issue`/`update-pr`) — candidates for the same treatment, deferred.

---

## 6. Phase plan

### Phase 1.0 — Pre-flight inventory

- Walk all 10 workflows in the existing `workflows` branch. List every skill file and every resource file. Note shape variance: any TOON field used in one workflow but not another, any non-standard frontmatter, any custom conventions.
- Output: `legacy-migration-inventory.md` artifact listing per-workflow file counts and shape oddities.
- Risk surfacing: any TOON skill with unusual fields gets flagged here so the migration tooling handles it.

### Phase 1.1 — Author the ontology definition resource

- Author `shared/resources/workflow-canonical/SKILL.md` (a freeform shared resource) on the new orphan branch (Phase 1.3 creates the branch; this content can be authored against the planning-folder sample at [sample/resources/workflow-canonical/SKILL.md](./sample/resources/workflow-canonical/SKILL.md) first and committed).
- Content: the two content categories (technique vs freeform resource), the TOON-field → markdown-section mapping (per §5 of this plan), the cross-reference (root-relative hyperlink) convention, the bootstrap protocol, frontmatter schema.
- Validate: an agent reading just this definition resource can correctly interpret a migrated SKILL.md.

### Phase 1.2 — Build the migration tooling

- One-off script (TypeScript, lives under `scripts/migrate-legacy/` in the workflow-server repo).
- Inputs: a workflow root path (e.g. `workflows/work-package/`).
- Outputs: a populated `legacy/<workflow>/` tree containing `techniques/<slug>/SKILL.md` and `resources/<slug>/SKILL.md` for every input file.
- Responsibilities:
  - Parse TOON skill files (`@toon-format/toon` library, already a dependency).
  - Parse resource files (markdown if `.md`; TOON if `.toon`).
  - Build the numeric-ID → slug map per workflow (resources first, since skills reference resources).
  - Emit markdown per the mapping in §5.
  - Rewrite resource references to inline root-relative hyperlinks at their point-of-use.
  - Validate every emitted SKILL.md round-trips (markdown → TOON-equivalent structure → byte-identical to source modulo formatting).
- Idempotent — running twice on the same input produces the same output.
- Reports per-workflow stats: count of skills migrated, count of resources migrated, count of references rewritten, count of unresolvable references (failures).

### Phase 1.3 — Create the orphan branch and scaffold

- Create the `skills` orphan branch in the workflow-server repo (`git checkout --orphan skills`).
- Initial commit: the bare folder structure (`legacy/`, `shared/resources/`) plus the authored ontology definition resource from Phase 1.1.
- Push to remote.
- Add a `git worktree` instruction to README.md (e.g. `git worktree add ./skills skills`) so contributors can check out the new branch alongside the main branch.

### Phase 1.4 — Migrate workflows (per-workflow batches)

For each of the 10 workflows, in this order:
1. `work-package` (largest; canary)
2. `prism`, `prism-audit`, `prism-evaluate`, `prism-update`, `prism-evaluate` family
3. `remediate-vuln`
4. `substrate-node-security-audit`
5. `cicd-pipeline-security-audit`
6. `work-packages`
7. `workflow-design`
8. `meta`

Steps per workflow:

1. Run the migration tooling against the workflow root.
2. Review the output: spot-check 3–5 randomly selected migrated files; confirm content fidelity.
3. Run the tooling's round-trip validation.
4. Commit to the `skills` branch under `legacy/<workflow>/`.
5. Note any unresolvable references; resolve manually if needed.

### Phase 1.4b — Update path-shaped references in `workflow.toon` and activities

Concurrent with Phase 1.4 (per-workflow): the workflow definition files (`workflow.toon` and `activities/*.toon`) contain some references in path-shape (e.g. `resource: resources/24-review-mode.md`) that break post-migration. These must be rewritten.

For each workflow, the migration tooling scans `workflow.toon` and `activities/*.toon` for:

- Path references of the form `resources/NN-<slug>.md|toon` — rewrite to plain slug (e.g. `review-mode`). The server resolves the slug per §8.2.
- Path references of the form `resources/NN-<slug>` (no extension) — same treatment.
- Numeric-ID-style references in description text ("see resource 27") — left as prose. The server resolves these at agent-fetch time via the `metadata.legacy_id` index per §8.2.

These changes commit to the **existing `workflows` branch** (NOT the new `skills` branch). It's the one part of Phase 1 that touches workflows/* files — but only path strings, never structure. The plan's earlier non-goal "workflow.toon stays unchanged" is **softened** to "workflow.toon structure stays unchanged; embedded path strings are updated to slug references."

### Phase 1.5 — Server-side support (markdown loader update)

- Implement the markdown loader in the workflow-server per [architecture.md §8](./architecture.md#8-migration-approach-any-workflow-any-ontology). The loader walks the `skills` branch (mounted as a worktree alongside the main repo).
- Generalise `get_skill(name)` to resolve names under the new tree by precedence (workflow-local → shared/): `legacy/<workflow>/techniques/<slug>`, `legacy/<workflow>/resources/<slug>`, `shared/resources/workflow-canonical`.
- No special server-side rewriting is needed for in-body references: the body contains root-relative markdown hyperlinks to SKILL.md files, which the agent resolves via subsequent `get_skill` calls (stripping the trailing `/SKILL.md`).
- **No regression on the TOON path** during the transition window: existing `get_skill(<id>)` calls into the `workflows` branch still work. The server runs in dual-mode (both branches loadable) until cutover (Phase 1.7).
- Add a CI check that validates every root-relative SKILL.md hyperlink in the new tree resolves to an existing file.

### Phase 1.6 — Parity validation

For each workflow (in the order from Phase 1.4):

- Run a representative agent task end-to-end using the NEW branch as the skill source.
- Compare against the same task run with the OLD `workflows` branch as the source. Both should produce equivalent artifacts.
- Acceptable variance: prose-level formatting differences in agent-produced output. Substantive differences (different decisions, missed steps, missed rules) are fidelity failures.
- Specifically test:
  - Skill loading by name resolves to the right SKILL.md.
  - Resource references within skill bodies resolve to the right resource SKILL.md.
  - The full content of each TOON field is preserved in the corresponding markdown section.
  - Numeric `legacy_id` references still work as a fallback (older agent sessions may still use them).

### Phase 1.7 — Cutover

- Switch the workflow-server's primary skill source from the `workflows` branch to the `skills` branch.
- The `workflows` branch retains `workflow.toon`, `activities/*.toon` (which the server continues to load from there).
- The `skills` branch carries all skill and resource content (which the server now loads from there).
- Deprecate `get_resource` (the legacy MCP tool); have it return a "moved to legacy/.../SKILL.md" indicator for any pre-migration resource ID still requested. Removed in a follow-up.

### Phase 1.8 — Remove legacy TOON skills and resources from the `workflows` branch

**Mandated**, not optional. Once Phase 1.6 (parity validation) has passed for every workflow:

- Delete every `workflows/<workflow>/skills/*.toon` file.
- Delete every `workflows/<workflow>/resources/*.md` and `workflows/<workflow>/resources/*.toon` file.
- Delete the now-empty `workflows/<workflow>/skills/` and `workflows/<workflow>/resources/` directories.
- The `workflows` branch ends Phase 1 containing only `workflow.toon` and `activities/*.toon` per workflow. All skill and resource content lives exclusively on the `skills` branch.
- Commit the deletions as a single squashed commit per workflow with a clear message (e.g. `legacy migration: remove TOON skills/resources for work-package (now on skills branch)`).
- Update the server's loader to refuse to fall back to the `workflows` branch for skill/resource content — fail-loud rather than silent inconsistency.

**Why mandated and not optional retention:** dual-source coexistence is a footgun. A reader (or a tool) finding TOON content on the `workflows` branch may treat it as authoritative when the markdown content on `skills` has since been edited. Removal forces a single source of truth.

**Rollback contingency:** the `workflows` branch's full TOON content is recoverable from git history (`git checkout <pre-Phase-1.8-commit> -- workflows/<workflow>/skills/`) if a regression is found post-removal. The migration tooling itself is also rerunnable from the same source.

---

## 7. Fidelity criteria

### 7.1 Content fidelity (mechanical)

For every migrated file, the union of (markdown body sections + frontmatter metadata) covers all content from the source TOON file. A diff-based audit script checks:

- Every TOON top-level field has a corresponding `##` section (or frontmatter entry) in the markdown output.
- Every TOON nested object has a corresponding `###` section.
- Every list item from TOON appears as a list item in markdown.
- Numeric resource IDs are preserved in `metadata.legacy_id` even after slug rewriting.

Round-trip validation: an inverse transformation (markdown → TOON-shaped structure) produces a result byte-equivalent to the source TOON modulo formatting (whitespace, key ordering).

### 7.2 Behavioural fidelity

For 3–5 representative agent tasks per workflow, the post-migration worker produces:

- The same tool-call sequence.
- The same produced artifacts (file contents identical modulo formatting).
- The same checkpoint decisions (refusals, escalations).

Acceptable variance: minor wording differences in prose-only output. Substantive variance = fidelity failure → investigate.

### 7.3 Reference fidelity

Every root-relative SKILL.md hyperlink in any migrated file resolves to an existing SKILL.md on the new branch. CI check enforces this.

Additionally, every numeric `legacy_id` reference (for any agent session that still uses them during transition) resolves to a skill with that `metadata.legacy_id` value in the new tree.

---

## 8. Risks and resolved decisions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| TOON field variance across workflows breaks the mechanical mapping | Medium | High | Phase 1.0 inventory surfaces variance before tooling is built. Tooling handles known shapes; flags unknowns. |
| Numeric resource references resolve to wrong slugs after slug derivation collision | Low | Medium | Migration tooling builds the ID→slug map per-workflow first; checks for collisions; aborts on collision. |
| Behavioural drift between TOON-served and markdown-served content | Low | High | Phase 1.6 parity validation runs the same task on both paths and diffs the outputs. |
| Loss of `NN-` ordering breaks workflow iteration semantics | Medium | Medium | Preserved as `metadata.order`. Server-side workflow.toon resolver consults `metadata.order` when iterating. |
| The `skills` orphan branch and `workflows` branch get out of sync | High pre-Phase-1.8 | Medium | Phase 1.8 *removes* the TOON content from `workflows`, forcing single source of truth. |
| Migration tooling has bugs that produce subtly-wrong markdown | Medium | High | Spot-check + round-trip validation + parity validation are layered defences. Reviewable diffs per workflow batch. |
| Stale `resource:` path references in workflow.toon break post-migration | High | High | New Phase 1.4b updates these in-place (slug-form references). See §6. |

### Resolved decisions (formerly "open questions")

#### 8.1 Resource file source format

The current `resources/` directories contain a mix of `.md` and `.toon` files. Both formats are migrated:

- **`.md` resources**: the existing body is preserved verbatim. The migration tooling wraps it with freeform-resource frontmatter (`name`, `description`, plus `metadata.legacy_id: <NN>` / `metadata.order: <NN>` — and **no** `metadata.ontology`/`metadata.kind`). The folder slug is derived from the filename minus the `NN-` prefix and `.md` extension.
- **`.toon` resources**: the same field-to-section mapping applied to techniques is applied here. Each top-level TOON field becomes a `##` section; nested objects become deeper headings. The result is still a freeform resource (no `metadata.ontology`/`metadata.kind`).

Phase 1.0 inventory enumerates which workflows have which kind of resource. Both paths are well-defined; no decision needed beyond "support both".

#### 8.2 Reference resolution (workflow.toon and activity → skill/resource)

After Phase 1, four reference shapes appear in the existing TOON content:

1. **Plain slug** (most common in activities — e.g. `review-code`, `manual-diff-review`): resolves to `legacy/<current-workflow>/techniques/<slug>/SKILL.md` OR `legacy/<current-workflow>/resources/<slug>/SKILL.md`. The server tries techniques first, then resources.
2. **Workflow-prefixed slug** (cross-workflow, e.g. `prism/structural-analysis`): resolves to `legacy/<workflow>/techniques/<slug>/SKILL.md`. Same fallback to resources.
3. **Numeric ID** (legacy in-body references like "resource 27"): resolves via the `metadata.legacy_id` reverse index — every migrated SKILL.md carries its `legacy_id`, and the server builds a `(workflow, folder, legacy_id) → path` map at load time (`folder` being `techniques` for techniques or `resources` for freeform resources).
4. **Direct path** (rare; e.g. workflow.toon's `resource: resources/24-review-mode.md`): handled by Phase 1.4b (a sub-step of per-workflow migration) — the migration tooling rewrites these to slug-form references in the workflow.toon source file directly.

The plain-slug path is the canonical post-migration form. Numeric IDs are transitional fallbacks; direct paths are eliminated entirely.

#### 8.3 Ontology versioning

**Not introduced by this migration.** Migrated techniques carry `metadata.ontology: workflow-canonical` with no version suffix; the migration does not add a versioning scheme. Whether the ontology definition itself is ever versioned is an ontology-level question owned by [workflow-canonical-plan.md](./workflow-canonical-plan.md) (its §9.2 open question 8), not this migration plan.

#### 8.4 Ontology-definition location

**`shared/resources/workflow-canonical/SKILL.md`** — a freeform shared resource under the root `shared/` layer, resolved by name under precedence (workflow-local → shared/). There is **no `skills/meta/` location convention and no meta-skill kind**: an ontology definition is just a shared resource, because the thing that defines an ontology cannot itself be governed by it. (`meta/` is not reserved — it is simply the folder of the workflow named `meta`.)

#### 8.5 Sub-skill nesting in Phase 1

**No nesting in Phase 1. Flat by choice.** Every `legacy/<workflow>/techniques/<slug>/` and `legacy/<workflow>/resources/<slug>/` folder contains exactly one `SKILL.md` and no nested folders. The ontology *permits* arbitrary nesting; Phase 1 chooses not to use it.

Reason: TOON skills are flat; Phase 1 is a structural translation that keeps each technique's body self-contained; nesting (a composing body that references nested techniques) is the Phase 2 restructuring. Don't introduce nesting in Phase 1.

#### 8.6 Migration tooling lifecycle

**Keep at `scripts/migrate-legacy/` for one release cycle post-cutover. Archive after Phase 2 (workflow-canonical migration) completes.** Specifically:

- During Phase 1.0–1.8: lives at `scripts/migrate-legacy/` in the workflow-server repo, active code.
- Post-Phase-1.8 cutover: stays in place for a release cycle (rollback insurance; rerunnable if a regression surfaces).
- After Phase 2 stabilises: moved to `.engineering/archive/migration-tooling-legacy-2026/` (no longer executed; preserved as documentation of how the translation was performed).
- Never deleted — the code is small and the historical value (auditing the translation) is real.

---

## 9. Out of scope (Phase 1)

- The richer workflow-canonical restructuring — composing-body decomposition, cross-cutting technique extraction, resource subsumption (Phase 2 — see [workflow-canonical-plan.md](./workflow-canonical-plan.md)).
- Any content edits, additions, deletions, or restructuring beyond field-to-section translation.
- `workflow.toon` and `activities/*.toon` migration.
- Schema migration (the one ontology is informally specified by its definition resource; no Zod schema).
- Server-side optimisation (caching, hot-reload, etc. beyond the minimum to load markdown).
- Authoring tooling for new skills (Phase 1 is a one-way migration; new technique/resource authoring is rare and manual).

---

## 10. Decision gate before implementation

Before any implementation begins, the user is asked to confirm:

1. **The one-ontology mapping** — TOON skills → techniques (`ontology: workflow-canonical`, `kind: technique`, keeping their `Capability/Protocol/Rules/Errors` body shape); TOON/markdown resources → freeform resources (no `ontology`/`kind`). Flat, no nesting in Phase 1.
2. **The target structure** — `skills` orphan branch, `legacy/<workflow>/{techniques,resources}/<slug>/SKILL.md`, with the ontology definition at `shared/resources/workflow-canonical/SKILL.md`.
3. **The TOON-to-markdown mapping** (§5) — each top-level TOON field becomes a `##` section; nested objects become deeper headings.
4. **Resource reference rewriting** — numeric IDs become inline root-relative hyperlinks (`[slug](legacy/<workflow>/resources/<slug>/SKILL.md)`), placed at point-of-use; no `## Resources` section.
5. **The phase plan** (§6) — 9 sub-phases (1.0–1.8 plus 1.4b for workflow.toon path rewrites), with Phase 1.6 (parity validation) as the no-regression gate.
6. **The fidelity criteria** (§7) — content, behavioural, reference.
7. **The mandated removal** of legacy TOON skills and resources from the `workflows` branch in Phase 1.8 — single source of truth post-migration.
8. **The resolved decisions** (§8.1–§8.6) — `.toon`/`.md` resource handling, reference resolution (slug + numeric-ID fallback + path-rewrite), no migration-introduced ontology versioning, ontology definition at `shared/resources/workflow-canonical/`, flat-only Phase 1 content, migration tooling preserved + archived.

Once confirmed, implementation proceeds in workflow batches per Phase 1.4.

---

## Sources & related documents

- [architecture.md](./architecture.md) — universal, ontology-agnostic skill architecture.
- [workflow-canonical-plan.md](./workflow-canonical-plan.md) — Phase 2 plan (the richer workflow-canonical restructuring).
- [workflow-canonical-ontology.md](./workflow-canonical-ontology.md) — the ontology in detail.
- [sample/resources/workflow-canonical/SKILL.md](./sample/resources/workflow-canonical/SKILL.md) — the ontology definition resource (operational form).

The one ontology's definition resource is authored as part of Phase 1.1 and lives operationally at `shared/resources/workflow-canonical/SKILL.md` on the new orphan branch (drafted from the planning-folder sample above). There is no separate legacy meta-skill.

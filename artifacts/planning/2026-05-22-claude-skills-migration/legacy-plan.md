---
title: "Legacy ontology — Phase 1 structural migration plan"
status: draft
phase: planning
date: 2026-05-23
references:
  architecture: ./architecture.md
  next-phase-plan: ./workflow-canonical-plan.md
  next-phase-ontology: ./workflow-canonical-ontology.md
---

# Legacy ontology — Phase 1 structural migration plan

> **Phase 1 of the markdown-skills migration.** Translate the existing TOON skill and resource content into markdown-skill form on the new architecture, under a **`legacy`** ontology that preserves the current two-kind structure (`skill`, `resource`). Functional parity with the pre-migration workflow-server is the success criterion.
>
> **Why this phase exists:** the architectural move from TOON to markdown is substantive and orthogonal to any ontological restructuring. Phase 1 de-risks by performing only the structural translation. Phase 2 (e.g. [workflow-canonical-plan.md](./workflow-canonical-plan.md)) restructures content into richer ontologies on top of an already-proven architecture.

---

## 1. Goal & non-goals

### Goal

Translate every TOON skill file and every resource file from the existing `workflows` branch into the new markdown-skills architecture, under a **legacy** ontology, on a new **`skills`** orphan branch, with **behaviour identical** to the pre-migration workflow-server when agents fetch and execute content.

Phase 1 completes when:

1. All 10 workflows' skill and resource content lives on the `skills` branch in markdown form.
2. The workflow-server serves agents exclusively from the `skills` branch (skill/resource content) and the `workflows` branch (workflow.toon, activities/).
3. The legacy TOON skills/resources are **removed** from the `workflows` branch (see Phase 1.8) — single source of truth.

### Non-goals (Phase 1 explicitly excludes)

- The workflow-canonical ontology (Skill / Technique / Role / Tool). Deferred to Phase 2.
- Any content edits beyond mechanical TOON-to-markdown translation. No rewording. No section restructuring beyond field-to-heading mapping. No fixes for content drift discovered in transit.
- **Structural** changes to `workflow.toon` and `activities/*.toon` files. They stay in the existing `workflows` branch with their structure intact. **Exception:** path-shaped reference strings inside them are rewritten to slug-form by Phase 1.4b (see §6) — pure string replacement, no schema or shape changes.
- Schema migration (`schemas/skill.schema.ts` etc.). The legacy ontology is informally specified by its meta-skill, not by a Zod schema.
- Sub-skill nesting. Legacy is flat by construction (skills and resources don't compose into deeper structures).

---

## 2. Settled decisions

| Decision | Value | Source |
|---|---|---|
| Workflow scope | All 10 workflows in one pass | User answer, 2026-05-23 |
| TOON→markdown mapping | Each top-level TOON field becomes a `##` section; nested objects become deeper headings | User answer, 2026-05-23 |
| Folder slug | Drop the `NN-` order prefix; folder is just the slug. Order preserved as `metadata.order`. | User answer, 2026-05-23 |
| Resource references | Rewrite to canonical-specifier form using slugs (e.g. `skill:legacy/<workflow>/resources/<slug>`) | User answer, 2026-05-23 |
| Branch name | `skills` (new orphan branch, separate from existing `workflows` branch) | User instruction |
| Top-level folder | `legacy/` (under the orphan branch root) | User instruction |
| Per-workflow structure | `legacy/<workflow>/skills/`, `legacy/<workflow>/resources/` | User instruction |
| Legacy meta-skill location | `skills/meta/legacy/SKILL.md` on the new branch (peer to `legacy/`) | Architectural convention |

---

## 3. The legacy ontology

The legacy ontology has exactly **two kinds**: `skill` and `resource`. Both are first-class. Skills and resources are flat (no nesting under either).

### Kinds

- **`kind: skill`** — corresponds to a current TOON skill file (e.g. `10-implement-task.toon`). Carries protocol, rules, inputs/outputs, error definitions, resource references. Consumed by agents executing workflow activities.
- **`kind: resource`** — corresponds to a current resource file (`resources/NN-*.md` or `resources/NN-*.toon`). Reference material — templates, criteria, primers, glossaries. Referenced from skills by canonical specifier.

### The meta-skill

`skills/meta/legacy/SKILL.md` is authored as part of Phase 1.2. It describes:

- The two-kind ontology (what `skill` and `resource` mean structurally and semantically).
- The TOON-field → markdown-section mapping (§5 of this plan; the meta-skill is the canonical reference for the convention).
- The canonical specifier convention: `skill:legacy/<workflow>/<kind-folder>/<slug>`.
- The frontmatter schema for legacy skills and resources.
- Bootstrap protocol: an agent encountering `metadata.ontology: legacy` fetches this meta-skill before interpreting other legacy skills.

After Phase 1, `legacy` is the only ontology in production use. Phase 2 introduces additional ontologies (e.g. `workflow-canonical`) and migrates specific workflows into them.

---

## 4. Target on-disk structure

```
skills (orphan branch root)
├── meta/
│   └── legacy/
│       └── SKILL.md              # the legacy ontology meta-skill
└── legacy/
    ├── work-package/
    │   ├── skills/
    │   │   ├── review-code/SKILL.md          # was 00-review-code.toon
    │   │   ├── review-test-suite/SKILL.md    # was 01-review-test-suite.toon
    │   │   ├── …                              # 23 more
    │   │   └── dco-provenance/SKILL.md       # was 25-dco-provenance.toon
    │   └── resources/
    │       ├── readme/SKILL.md               # was 01-readme.md
    │       ├── github-issue-creation/SKILL.md
    │       ├── …                              # 26 more
    │       └── pr-review-response/SKILL.md
    ├── prism/
    │   ├── skills/ …
    │   └── resources/ …
    ├── prism-audit/
    │   ├── skills/ …
    │   └── resources/ …
    ├── prism-evaluate/
    │   ├── skills/ …
    │   └── resources/ …
    ├── prism-update/
    │   ├── skills/ …
    │   └── resources/ …
    ├── remediate-vuln/
    │   ├── skills/ …
    │   └── resources/ …
    ├── substrate-node-security-audit/
    │   ├── skills/ …
    │   └── resources/ …
    ├── cicd-pipeline-security-audit/
    │   ├── skills/ …
    │   └── resources/ …
    ├── work-packages/
    │   ├── skills/ …
    │   └── resources/ …
    ├── workflow-design/
    │   ├── skills/ …
    │   └── resources/ …
    └── meta/
        ├── skills/ …
        └── resources/ …
```

Per-skill / per-resource shape: each is a folder containing a single `SKILL.md`. No sub-folders, no sub-files. Flat.

---

## 5. TOON → markdown transformation rules

### 5.1 Frontmatter

Every migrated SKILL.md carries top-level fields per the agentskills.io spec, plus a `metadata:` block per the architecture:

| Source (TOON) | Target (markdown frontmatter) | Notes |
|---|---|---|
| `id:` | top-level `name:` | matches the directory slug |
| `description:` | top-level `description:` | 1–1024 chars per spec |
| (implicit) | `metadata.ontology: legacy` | constant for Phase 1 |
| (implicit) | `metadata.kind: skill` or `resource` | per the folder it lives in |
| `version:` | `metadata.version:` | preserved if present |
| (filename prefix) | `metadata.order: <NN>` | the numeric prefix from `NN-<slug>.toon`; preserved for workflow-iteration semantics |
| (filename prefix) | `metadata.legacy_id: <NN>` | preserved so cross-references by numeric ID still resolve during transition |

Example frontmatter for a migrated skill:

```yaml
---
name: implement-task
description: Implement a single task from the plan by writing code changes.
metadata:
  ontology: legacy
  kind: skill
  version: 2.1.3
  order: 10
  legacy_id: 10
---
```

For a migrated resource:

```yaml
---
name: gitnexus-reference
description: GitNexus MCP tools and graph schema reference.
metadata:
  ontology: legacy
  kind: resource
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
| `inputs[N]:` | `## Inputs` with one bullet per input (`- **<id>** — <description>`) |
| `protocol:` (with named phases) | `## Protocol`, each phase as `### <Phase Title>` with bullet-list body |
| `output[N]:` | `## Output` with one bullet per output |
| `rules:` (named rules with text) | `## Rules` with one bullet per rule (`- **<rule-name>** — <text>`) |
| `resources[N]:` (list of refs) | `## Resources` with bullets, each rewritten to canonical specifier (see §5.3) |
| `errors:` (named errors with cause/recovery) | `## Errors`, each error as `### <error-name>` with `**Cause:**` and `**Recovery:**` lines |

For resource files (mostly markdown already), the existing content body becomes the body verbatim. Only frontmatter is added.

For resource files that are TOON (the `*.toon` extension under `resources/`), apply the same field-to-section mapping as for skills.

### 5.3 Resource reference rewriting

TOON skills reference resources by numeric ID inside the `resources:` field. Per the canonical specifier convention, these rewrite to `skill:` URIs:

| Source (TOON) | Target (markdown) |
|---|---|
| `resources[N]: ["27"]` | `## Resources`<br>`- [gitnexus-reference](skill:legacy/<workflow>/resources/gitnexus-reference)` |

The rewrite requires the migration tooling to:
1. Walk the workflow's resources/ directory and build a numeric-ID → slug map.
2. For each skill's resource references, look up the slug and emit the canonical specifier.

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

**Target: `legacy/work-package/skills/implement-task/SKILL.md`**

```markdown
---
name: implement-task
description: Implement a single task from the plan by writing code changes.
metadata:
  ontology: legacy
  kind: skill
  version: 2.1.3
  order: 10
  legacy_id: 10
---

## Capability

Implement a single task from the work package plan by writing code changes.

## Inputs

- **current-task** — The task to implement from the plan (provided by the activity loop iterator)
- **test-plan** *(optional)* — Test plan with strategy and acceptance criteria for guidance

## Protocol

### Understand context

- Read the task description and requirements from the plan
- Identify affected files, dependencies, and related code
- Review test plan for acceptance criteria relevant to this task

### Pre-edit impact check

- Run `gitnexus_impact({target: <symbol>, direction: 'upstream'})` on the target symbol before any edit
- Read the impact report; if HIGH or CRITICAL risk, surface it to the user before proceeding
- Use `gitnexus_context({name: <symbol>})` to understand callers/callees of the symbol — see [gitnexus-reference](skill:legacy/work-package/resources/gitnexus-reference) for the full reference

…

## Output

- **task-implementation** — Code changes for a single task

## Rules

- **single-task-focus** — Implement exactly one task — do not scope-creep into adjacent tasks
- **gitnexus-discipline** — Implementations MUST execute the pre-edit-impact-check…

## Resources

- [manage-artifacts](skill:legacy/work-package/resources/manage-artifacts)
- [tdd-concepts-rust](skill:legacy/work-package/resources/tdd-concepts-rust)
- [gitnexus-reference](skill:legacy/work-package/resources/gitnexus-reference)

## Errors

### compilation_failure

- **Cause:** Code changes do not compile
- **Recovery:** Review error messages, fix issues, and retry
```

---

## 6. Phase plan

### Phase 1.0 — Pre-flight inventory

- Walk all 10 workflows in the existing `workflows` branch. List every skill file and every resource file. Note shape variance: any TOON field used in one workflow but not another, any non-standard frontmatter, any custom conventions.
- Output: `legacy-migration-inventory.md` artifact listing per-workflow file counts and shape oddities.
- Risk surfacing: any TOON skill with unusual fields gets flagged here so the migration tooling handles it.

### Phase 1.1 — Author the legacy meta-skill

- Author `skills/meta/legacy/SKILL.md` on the new orphan branch (Phase 1.3 creates the branch; this content can be authored against the planning folder first and committed).
- Content: the two-kind ontology, the TOON-field → markdown-section mapping (per §5 of this plan), the canonical specifier convention, the bootstrap protocol, frontmatter schema.
- Validate: an agent reading just this meta-skill can correctly interpret a migrated SKILL.md.

### Phase 1.2 — Build the migration tooling

- One-off script (TypeScript, lives under `scripts/migrate-legacy/` in the workflow-server repo).
- Inputs: a workflow root path (e.g. `workflows/work-package/`).
- Outputs: a populated `legacy/<workflow>/` tree containing `skills/<slug>/SKILL.md` and `resources/<slug>/SKILL.md` for every input file.
- Responsibilities:
  - Parse TOON skill files (`@toon-format/toon` library, already a dependency).
  - Parse resource files (markdown if `.md`; TOON if `.toon`).
  - Build the numeric-ID → slug map per workflow (resources first, since skills reference resources).
  - Emit markdown per the mapping in §5.
  - Rewrite resource references to canonical specifiers.
  - Validate every emitted SKILL.md round-trips (markdown → TOON-equivalent structure → byte-identical to source modulo formatting).
- Idempotent — running twice on the same input produces the same output.
- Reports per-workflow stats: count of skills migrated, count of resources migrated, count of references rewritten, count of unresolvable references (failures).

### Phase 1.3 — Create the orphan branch and scaffold

- Create the `skills` orphan branch in the workflow-server repo (`git checkout --orphan skills`).
- Initial commit: the bare folder structure (`legacy/`, `meta/legacy/`) plus the authored meta-skill from Phase 1.1.
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
- Generalise `get_skill(path)` to accept paths under the new tree: `legacy/<workflow>/skills/<slug>`, `legacy/<workflow>/resources/<slug>`, `meta/legacy`.
- Add server-side resolution for the canonical specifier format: when the server returns a SKILL.md, any `skill:` URIs in the body remain unchanged (the agent resolves them via subsequent `get_skill` calls).
- **No regression on the TOON path** during the transition window: existing `get_skill(<id>)` calls into the `workflows` branch still work. The server runs in dual-mode (both branches loadable) until cutover (Phase 1.7).
- Add a CI check that validates every `skill:legacy/...` URI in the new tree resolves to an existing SKILL.md.

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
- Deprecate `get_resource` (the legacy MCP tool); have it return a "moved to skill:legacy/..." indicator for any pre-migration resource ID still requested. Removed in a follow-up.

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

Every `skill:legacy/...` canonical specifier in any migrated file resolves to an existing SKILL.md on the new branch. CI check enforces this.

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

- **`.md` resources**: the existing body is preserved verbatim. The migration tooling wraps it with the new frontmatter (`metadata.ontology: legacy`, `metadata.kind: resource`, `metadata.legacy_id: <NN>`, `metadata.order: <NN>`). The folder slug is derived from the filename minus the `NN-` prefix and `.md` extension.
- **`.toon` resources**: the same field-to-section mapping applied to skills is applied here. Each top-level TOON field becomes a `##` section; nested objects become deeper headings.

Phase 1.0 inventory enumerates which workflows have which kind of resource. Both paths are well-defined; no decision needed beyond "support both".

#### 8.2 Reference resolution (workflow.toon and activity → skill/resource)

After Phase 1, four reference shapes appear in the existing TOON content:

1. **Plain slug** (most common in activities — e.g. `review-code`, `manual-diff-review`): resolves to `legacy/<current-workflow>/skills/<slug>/SKILL.md` OR `legacy/<current-workflow>/resources/<slug>/SKILL.md`. The server tries skills first, then resources.
2. **Workflow-prefixed slug** (cross-workflow, e.g. `prism/structural-analysis`): resolves to `legacy/<workflow>/skills/<slug>/SKILL.md`. Same fallback to resources.
3. **Numeric ID** (legacy in-body references like "resource 27"): resolves via the `metadata.legacy_id` reverse index — every migrated SKILL.md carries its `legacy_id`, and the server builds an `(workflow, kind, legacy_id) → path` map at load time.
4. **Direct path** (rare; e.g. workflow.toon's `resource: resources/24-review-mode.md`): handled by Phase 1.4b (a sub-step of per-workflow migration) — the migration tooling rewrites these to slug-form references in the workflow.toon source file directly.

The plain-slug path is the canonical post-migration form. Numeric IDs are transitional fallbacks; direct paths are eliminated entirely.

#### 8.3 Versioning of the legacy ontology

**No versioning.** `metadata.ontology: legacy` carries no version suffix. The legacy ontology is a transition stage — by design it doesn't evolve. If a breaking change to the legacy meta-skill is ever needed (unexpected; this would mean the TOON content itself was misunderstood), we introduce `legacy-v2` at that point. Until then, single unversioned form.

#### 8.4 Meta-skill location

**`skills/meta/legacy/SKILL.md`** — a peer of the `legacy/` content tree, not nested under it. This places all meta-skills (regardless of which ontology they define) under one canonical `skills/meta/<ontology>/` location, mirroring the workflow-canonical convention used in [workflow-canonical-plan.md](./workflow-canonical-plan.md) Phase 4.

#### 8.5 Sub-skill nesting under legacy

**No sub-skills under legacy. Flat by mandate.** Every `legacy/<workflow>/skills/<slug>/` and `legacy/<workflow>/resources/<slug>/` folder contains exactly one `SKILL.md` and no nested folders. The legacy ontology's meta-skill enforces this — the architecture allows arbitrary nesting, but legacy chooses not to use it.

Reason: TOON skills are flat; legacy is a structural mirror; nesting is a feature of richer ontologies (workflow-canonical's competency-bundles and nested techniques). Don't introduce nesting in Phase 1.

#### 8.6 Migration tooling lifecycle

**Keep at `scripts/migrate-legacy/` for one release cycle post-cutover. Archive after Phase 2 (workflow-canonical migration) completes.** Specifically:

- During Phase 1.0–1.8: lives at `scripts/migrate-legacy/` in the workflow-server repo, active code.
- Post-Phase-1.8 cutover: stays in place for a release cycle (rollback insurance; rerunnable if a regression surfaces).
- After Phase 2 stabilises: moved to `.engineering/archive/migration-tooling-legacy-2026/` (no longer executed; preserved as documentation of how the translation was performed).
- Never deleted — the code is small and the historical value (auditing the translation) is real.

---

## 9. Out of scope (Phase 1)

- The workflow-canonical ontology (Phase 2 — see [workflow-canonical-plan.md](./workflow-canonical-plan.md)).
- Any content edits, additions, deletions, or restructuring beyond field-to-section translation.
- `workflow.toon` and `activities/*.toon` migration.
- Schema migration (the legacy ontology is informally specified by the meta-skill; no Zod schema).
- Server-side optimisation (caching, hot-reload, etc. beyond the minimum to load markdown).
- Authoring tooling for new skills (Phase 1 is a one-way migration; new skill authoring under the legacy ontology is rare and manual).

---

## 10. Decision gate before implementation

Before any implementation begins, the user is asked to confirm:

1. **The legacy ontology** — two kinds (`skill`, `resource`), flat, no nesting.
2. **The target structure** — `skills` orphan branch, `legacy/<workflow>/{skills,resources}/<slug>/SKILL.md`.
3. **The TOON-to-markdown mapping** (§5) — each top-level TOON field becomes a `##` section; nested objects become deeper headings.
4. **Resource reference rewriting** — numeric IDs become canonical specifiers (`skill:legacy/<workflow>/resources/<slug>`).
5. **The phase plan** (§6) — 9 sub-phases (1.0–1.8 plus 1.4b for workflow.toon path rewrites), with Phase 1.6 (parity validation) as the no-regression gate.
6. **The fidelity criteria** (§7) — content, behavioural, reference.
7. **The mandated removal** of legacy TOON skills and resources from the `workflows` branch in Phase 1.8 — single source of truth post-migration.
8. **The resolved decisions** (§8.1–§8.6) — `.toon`/`.md` resource handling, reference resolution (slug + numeric-ID fallback + path-rewrite), no ontology versioning, meta-skill at `skills/meta/legacy/`, flat-only legacy, migration tooling preserved + archived.

Once confirmed, implementation proceeds in workflow batches per Phase 1.4.

---

## Sources & related documents

- [architecture.md](./architecture.md) — universal, ontology-agnostic skill architecture.
- [workflow-canonical-plan.md](./workflow-canonical-plan.md) — Phase 2 plan (workflow-canonical ontology).
- [workflow-canonical-ontology.md](./workflow-canonical-ontology.md) — the Phase 2 ontology in detail.

The legacy ontology's descriptive companion document and the meta-skill itself will be authored as part of Phase 1.1. They will live at:

- `legacy-ontology.md` (planning folder companion — TBD if needed).
- `skills/meta/legacy/SKILL.md` (operational meta-skill on the new orphan branch).

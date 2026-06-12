# Implementation Plan — Flatten & rename workflow content layout

**Date:** 2026-06-01
**Status:** Plan — pending sign-off, then implementation
**Implements:** [09-flatten-layout-requirements.md](09-flatten-layout-requirements.md) (R1–R9)
**Vehicle:** revise **PR #126** (loader / source repo) + **PR #127** (content / workflows submodule) pre-merge.

## 1. Architecture findings (grounding)

- **Consumption path:** `SKILL.md` files are parsed by the server loader into a `Skill` object and served over MCP (`get_skill` / `get_activity` / `resolve_operations`) as a TOON projection. Nothing consumes them as native Claude skills.
- **Resolution layer is shape-agnostic:** `readSkill` → `tryLoadMarkdownSkill`, and `resolveOperations` selects the requested `op`/`rule`/`error` from the loaded `Skill`. It already loads the *whole* skill then selects — so op fan-out is granular at selection, not file-read.
- **All `SKILL.md` knowledge is confined to 3 files:** `src/loaders/skill-loader.ts`, `markdown-skill-loader.ts`, `resource-loader.ts`. The MCP tools call loader functions and need **no** change.
- **Activities bind operations by id** (`skill::op`) — relocating files does not break bindings; only markdown body links + READMEs reference paths.
- **Verified:** the 13 grouped skills are referenced only as `group::<specific-op>`, never whole-group or `group::rules` → removing nothing but renaming the index is safe.

## 2. Target resolution model (loader)

A skill id resolves to one of two on-disk shapes (checked in this order):

1. **Standalone** — `techniques/<id>.md` (flat, has frontmatter). Parsed as the index; operations come only from its inline `## Operations` section. Resources: `resources/<id>.md`.
2. **Grouped** — `techniques/<id>/TECHNIQUE.md` (index) + sibling `<op>.md` children. Operations come from the children (+ any inline).

The per-workflow `techniques/TECHNIQUE.md` root index is **not** an addressable skill (excluded from id enumeration/resolution), but it is **isomorphic to a technique** and its **Inputs / Outputs / Rules / Errors** are inherited by every nested technique in that workflow (Protocol is explicitly excluded) — see §5.

## 3. Loader changes — PR #126 (`src/loaders/`)

### 3.1 `markdown-skill-loader.ts`
- Replace `findTechniqueFolder` with a resolver returning a discriminated shape:
  `{kind:'flat', path:<id>.md}` if the flat file exists; else `{kind:'grouped', folder, index:<id>/TECHNIQUE.md}` if that exists; else `null`.
- `tryLoadMarkdownSkill`:
  - **flat** → `parseSkillIndex(flatRaw)`, no child enumeration (inline ops only).
  - **grouped** → `parseSkillIndex(TECHNIQUE.md)` + enumerate op-children.
- `listOpChildFiles`: exclude `TECHNIQUE.md` and `README.md` (was `SKILL.md`).
- Update the file-header doc comment (canonical section set / shapes) to describe flat + grouped + `TECHNIQUE.md`.

### 3.2 `skill-loader.ts`
- `listMarkdownTechniqueIds`: enumerate **both** flat `<slug>.md` files (id = slug; exclude `TECHNIQUE.md` and `README.md`) **and** grouped `<slug>/` dirs containing `TECHNIQUE.md`.
- `readSkillRaw` / `projectSkillToToon` — unchanged (shape-agnostic).
- **Root-contract inheritance (§5):** add a helper `loadWorkflowRootContract(workflowDir, workflowId)` that parses the workflow's `techniques/TECHNIQUE.md` and returns `{ inputs, output, rules, errors }` — **Protocol, Capability, and Operations are ignored** (the root is parsed with the existing index parser but is never routed through `tryLoadMarkdownSkill` as an addressable skill). Inheritance is **executing-workflow-only — never `meta`**.
  - `readSkill`: when loading a nested technique in workflow X, merge X's root `inputs` / `output` into the returned `Skill` (union; technique-local entries with the same id win). This is how root **inputs/outputs** reach the worker.
  - `resolveOperations`: gains an optional `workflowId`; after the existing per-touched-skill rule auto-inclusion, append the root's **rules** and **errors** (deduped against what's already in the bundle). This is how root **rules/errors** reach the worker.
  - Guard: when `workflowId === 'meta'` the root is the meta root (orchestrator context) — fine for meta sessions; for any non-meta workflow, meta's root is **never** consulted.
- Legacy-TOON fallback (`SKILL_LOADER_LEGACY_TOON`, default off) — leave untouched; removal is the separately-deferred Phase C (F-CR-04).

### 3.4 Tool changes (`src/tools/`)
- **Split `get_skill` → `get_resource` + `get_technique`** (A3). `get_resource` (already exists) serves flat `resources/<slug>.md`. `get_technique` is new: given a technique id it returns the **fully composed** technique (`composeTechnique` — inherited inputs/outputs/rules/errors + concatenated/renumbered protocol from the ancestor chain). This composed form is both what consumers receive and what authors inspect to see the assembled result (answers the on-disk≠runtime concern). Retire `get_skill`/`get_skills` (or alias `get_skills` → `get_techniques` listing).
- `get_activity` / `get_workflow` pass the **session's** `workflowId` into bundling so the executing workflow's inherited rules/errors (and protocol, for the composed technique view) are applied. No bundle wire-shape change for rules/errors — they appear as ordinary entries.

### 3.3 `resource-loader.ts`
- `findResourceSkillMd` → resolve flat `<resourceDir>/<id>.md`; frontmatter-name match across flat `.md` files (exclude `README.md`).
- `listResources`: enumerate flat `.md` files (exclude `README.md`); `path: resources/<id>.md`.
- `readResourceRaw` / `readResourceStructured`: unchanged once the finder/list return flat paths.

## 4. Content migration — PR #127 (workflows submodule)

Author a one-shot transform (under `scripts/`, mirroring `scripts/migrate-skills/`), idempotent, run per workflow:

1. **Standalone techniques:** `techniques/<slug>/SKILL.md` → `techniques/<slug>.md`; drop the redundant `# <Title>` H1 (R6).
2. **Grouped techniques:** rename `techniques/<group>/SKILL.md` → `TECHNIQUE.md` (shared contract retained); for each `<op>.md`: drop the redundant `# <op>` H1 (R6) **and rename its `## Procedure` heading → `## Protocol`** (A1). Apply the `## Procedure` → `## Protocol` rename to every op file repo-wide.
3. **Resources:** `resources/<slug>/SKILL.md` → `resources/<slug>.md`; keep titles (R6 excludes resources).
4. **Root index (R4):** create `techniques/TECHNIQUE.md` per workflow — Capability + a table indexing every technique (standalone + groups, with links) + a `## Rules` section for genuine workflow-wide technique rules (seed conservatively; see §5).
5. **Cross-references (R8):** rewrite body hyperlinks — `…/<slug>/SKILL.md` → `…/<slug>.md`; `…/<group>/SKILL.md` → `…/<group>/TECHNIQUE.md`; resource links likewise. Update `README.md` files (workflow root, `resources/README.md`, any techniques README).
6. **No `SKILL.md` remains** anywhere afterward (assert).

## 5. Root `TECHNIQUE.md` — DECIDED: isomorphic base-contract, runtime-inherited

The per-workflow root index is **isomorphic to a technique file** (same sections) and acts as a **base contract** every nested technique in that workflow inherits:

- **Inherited:** `Inputs`, `Outputs`, `Rules`, `Errors` — merged into every nested technique (union; technique-local key overrides; rules/errors deduped).
- **Protocol — inherited as a prepended preamble.** Protocol is an **ordered list of steps** (no keys, no "phase" construct), uniform across techniques and ops (op `## Procedure` is renamed to `## Protocol`; internal `procedure` field → `protocol`). Composition is pure positional concatenation: ancestors' steps then the leaf's, with the **server renumbering** the combined sequence `1..N`. No stable per-step id — renumbering is display-only; absolute intra-protocol step-number references are forbidden (lint + ontology rule).
- **Recursive.** Inheritance cascades the nesting chain: workflow root `TECHNIQUE.md` → grouped `<group>/TECHNIQUE.md` → leaf (`<op>.md` / standalone). Each level accumulates ancestors' contract; protocol steps stack root→group→leaf, renumbered as a whole.
- **Scope: executing workflow only — `meta` is never inherited.** Meta is orchestrator-scoped (a different context than a worker), so meta-level content must not bleed into a worker's technique bundle. A non-meta session never consults meta's root.

Mechanism: a shared `composeTechnique(workflowId, techniqueId)` walks the ancestor chain and merges (keyed union+override for inputs/outputs/rules/errors; positional concat+renumber for protocol). Used by both the new `get_technique` tool (§3.4) and `resolveOperations`/`get_activity` bundling.

**Resolved design points (was "foreseen issues"):** A1 protocol/procedure unified by rename; A2 renumber is display-only + absolute-ref lint; A3 `get_technique` exposes the composed form; A6 no phase construct → protocol is an ordered list, concat-only (no collision). Accepted as a deliberate behavioral feature (A4); root must stay minimal (A5).

**Authoring guidance:** the root carries *technique-level* shared contract for that workflow; keep it minimal and distinct from `workflow.toon` `rules[]` (which remain orchestration-level). Do not give the root a Protocol.

## 6. Ontology rewrite — R9 (`meta/resources/workflow-canonical`)

- The resource itself flattens to `meta/resources/workflow-canonical.md`.
- Rewrite to define: the three file types (standalone `techniques/<slug>.md` w/ frontmatter; grouped `techniques/<group>/<op>.md` no frontmatter; resource `resources/<slug>.md`); `TECHNIQUE.md` as the index (root + per-group), its role/sections; retire "every unit is a folder+`SKILL.md`"; cross-reference format ending in `<slug>.md` / `<group>/TECHNIQUE.md` / `<group>/<op>.md` (never `/SKILL.md`); frontmatter rules per type.
- Document the root `TECHNIQUE.md` as an isomorphic base-contract recursively inherited by every nested technique in the workflow: keyed union+override for Inputs/Outputs/Rules/Errors; Protocol prepended (ancestors→leaf) and renumbered as one ordered list; executing-workflow-only (meta is never inherited).
- Document that Protocol is a single ordered list of steps (no "phase" construct) and that **absolute intra-protocol step-number references are forbidden** (renumbering is server-assigned at compose time). Both techniques and ops use `## Protocol`.
- Keep the loader's "canonical section set" doc comment in sync.

## 7. Tests & validation

- **Fixtures:** migrate `tests/` fixtures (and `tests/skill-loader.test.ts` expectations) to the new shapes; add cases for flat-standalone resolution, grouped `TECHNIQUE.md` resolution, root-index exclusion, and resource flat resolution.
- **Equivalence harness (critical):** before/after the content migration, snapshot the served bundles for every `skill::op` / `skill::rules` reference used across all activities and assert **content-equivalence** — *except* for the intentional inherited root contract (inputs/outputs/rules/errors), which the harness must account for as expected new content rather than a regression.
- **Root-contract inheritance tests:** assert `get_technique` / bundling compose a nested technique with its ancestors' `inputs`/`output`/`rules`/`errors` (keyed union; leaf overrides) and a **protocol that concatenates ancestor steps before the leaf's, renumbered `1..N`**; assert recursion (root → group → op stacks correctly); assert a non-meta session **never** inherits meta's root.
- **Renumber-safety lint:** assert the lint flags absolute intra-protocol step-number references (`step \d+`, `§\d`) in any `## Protocol` body.
- **Link check:** assert no body hyperlink ends in `/SKILL.md`; assert every internal link resolves to an existing file.
- **No-SKILL.md assertion:** repo-wide check that zero `SKILL.md` files remain.
- `npm run typecheck` + `npm test` green.

## 8. Sequencing

The loader (source) reads content (workflows submodule), and tests use source-repo fixtures. Land as a coordinated pair:
1. PR #126: loader supports the new shapes + migrated fixtures + equivalence harness. (Optionally keep a transitional `SKILL.md` fallback during dev for green tests, then remove for the hard cutover.)
2. PR #127: run the content transform; rewrite links; add the root indexes; rewrite the ontology; bump the submodule pointer.
3. Validate equivalence against the migrated submodule; both PRs reviewed together; merge content first (#127) then source (#126), per the existing merge order.

## 9. Risks

- **Silent content loss on flatten** — section-heading parsing is convention-bound; a botched transform could drop a section. Mitigation: the equivalence harness + no-`SKILL.md` + link checks.
- **Root-contract inheritance breadth** — the root's inputs/outputs/rules/errors now flow into every technique in a workflow, so a careless root could bloat or skew every bundle. Mitigation: keep the root minimal (cross-technique only); union+override dedup; Protocol excluded by rule; meta never inherited; inheritance tests guard the behavior.
- **Fixture drift** — tests embed the old shape. Mitigation: migrate fixtures in the same PR as the loader.
- **Two-repo coordination** — loader and content must agree. Mitigation: transitional dual-shape support during dev; equivalence harness gates the cutover.

## 10. Phasing

1. Loader resolution (3 files) + root-contract inheritance (`loadWorkflowRootContract` + `readSkill` inputs/outputs merge + `resolveOperations` rules/errors injection + tool wiring) + unit tests for both shapes and inheritance.
2. Equivalence harness (capture baseline from current content).
3. Content transform script; dry-run; apply to a copy; run harness.
4. Root indexes + ontology rewrite.
5. Link/README rewrite + no-`SKILL.md` assertion.
6. Apply to the real submodule; revise PRs #126/#127; validate; review.

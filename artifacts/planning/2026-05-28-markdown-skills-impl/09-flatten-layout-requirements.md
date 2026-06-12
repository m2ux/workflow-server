# Requirements — Flatten & rename workflow content layout

**Date:** 2026-06-01
**Status:** Elicited — pending sign-off, then planning
**Relates to:** work package #125 (markdown-skills migration). Revises **PR #126** (loader, source) and **PR #127** (content) **pre-merge** — do not merge until this restructure lands.

## Goal

Structural honesty: the on-disk layout should reflect what the content actually is (workflow **techniques** and **resources**), not mimic the Claude-skill `SKILL.md` folder convention — which nothing in this system consumes as a native skill (the server's loader parses these files and serves them over MCP). Remove dead one-file folders and name files for what they are.

## Target layout

### Techniques — per workflow `techniques/`

| Path | Role |
|---|---|
| `techniques/TECHNIQUE.md` | **NEW** workflow-level index: table of every technique in the workflow (+ links) and any workflow-wide shared rules. Structured like today's grouped `SKILL.md` (Capability + index table + Rules). |
| `techniques/<slug>.md` | Standalone technique, flattened from `<slug>/SKILL.md`. Frontmatter retained; body intact (incl. inline Operations/Rules); redundant `# Title` removed. |
| `techniques/<group>/TECHNIQUE.md` | Grouped-operations index, **renamed** from `SKILL.md`. Structure unchanged — Capability + Operations table + **shared Rules retained**. |
| `techniques/<group>/<op>.md` | Operation file (unchanged); redundant `# title` (= filename) removed. |

### Resources — per workflow `resources/`

| Path | Role |
|---|---|
| `resources/<slug>.md` | Flattened from `<slug>/SKILL.md`. **No** index file. Titles retained (may carry context). |

**Net:** no `SKILL.md` remains anywhere; every index file is `TECHNIQUE.md`.

## Requirements

- **R1** Flatten standalone techniques: `techniques/<slug>/SKILL.md` → `techniques/<slug>.md` (frontmatter + body preserved, including inline `## Operations` / `## Rules`).
- **R2** Flatten resources: `resources/<slug>/SKILL.md` → `resources/<slug>.md`. No `RESOURCE.md` index.
- **R3** Keep grouped-operations folders structurally as-is; rename their `SKILL.md` → `TECHNIQUE.md`. **Shared rules stay in the group index** (the earlier "localize rules into op files" idea is dropped).
- **R4** Add a per-workflow `techniques/TECHNIQUE.md` root index, **isomorphic to a technique file** (all sections meaningful), serving two roles: (a) it indexes all techniques (standalone + groups); (b) it is a **base contract** inherited by every nested technique in that workflow:
  - `Inputs`, `Outputs`, `Rules`, `Errors` — merged in (union; technique-local entry with the same key overrides; rules/errors deduped).
  - `Protocol` — if present, **prepended** as a preamble before the nested technique's own Protocol; the **server renumbers** the combined sequence into one ordered list.
  - **Recursive:** inheritance cascades down the nesting chain (workflow root `TECHNIQUE.md` → grouped `<group>/TECHNIQUE.md` → leaf `<op>.md` / standalone). Each level accumulates its ancestors' contract; protocol preambles stack root→group→leaf and are renumbered as a whole.
  - **Scope: executing workflow only** — `meta`'s root is **never** inherited into another workflow (meta is orchestrator-scoped).
- **R5** Naming: every index file is `TECHNIQUE.md`; `SKILL.md` is retired.
- **R6** De-title: remove the redundant `# <Title>` heading (restates the name) from flattened **standalone technique files** and **`<op>.md` files**. Index `TECHNIQUE.md` files keep their heading. **Resources keep titles.**
- **R7** Loader (PR #126): resolve
  - standalone `slug::op` / `slug::rules` → sections in `techniques/<slug>.md`;
  - grouped `group::op` → `techniques/<group>/<op>.md`; read `<group>/TECHNIQUE.md` as the group index;
  - the workflow-root `techniques/TECHNIQUE.md` index;
  - resources → `resources/<slug>.md`;
  - remove all `SKILL.md` handling.
- **R8** Cross-references (PR #127): rewrite body hyperlinks — `…/<slug>/SKILL.md` → `…/<slug>.md` (flattened), `…/<group>/SKILL.md` → `…/<group>/TECHNIQUE.md` (grouped index). Update READMEs.
- **R10** Unify protocol shape: rename op `## Procedure` → `## Protocol` (and internal `procedure` field → `protocol`) so techniques and ops share one ordered-list Protocol. There is no "phase" construct; Protocol is a single ordered list of steps; absolute intra-protocol step-number references are forbidden (lint + ontology rule); the server renumbers composed protocols.
- **R11** Split `get_skill` into `get_resource` (flat resources) + `get_technique` (returns the fully composed technique — ancestor-chain inheritance applied). Composition logic (`composeTechnique`) is shared with `get_activity`/`resolveOperations`. Retire `get_skill`/`get_skills`.
- **R9** Update the canonical ontology resource — `meta/resources/workflow-canonical/SKILL.md` (which itself flattens to `meta/resources/workflow-canonical.md` per R2). This is the authoritative, agent-facing guide for interpreting the technique structure (`metadata.ontology: workflow-canonical` resolves here; loaded once per session). It currently defines the `SKILL.md` packaging model and a `/SKILL.md`-terminated cross-reference format — both must be rewritten to the new model:
  - the three file types — standalone technique (`techniques/<slug>.md`, has frontmatter), grouped operation (`techniques/<group>/<op>.md`, no frontmatter), resource (`resources/<slug>.md`);
  - `TECHNIQUE.md` as the index file (workflow-root + per-group), its role and sections;
  - retire the "every unit is structurally a skill / folder+SKILL.md" framing;
  - updated cross-reference format (links end in `<slug>.md`, `<group>/TECHNIQUE.md`, or `<group>/<op>.md` — never `/SKILL.md`);
  - frontmatter rules per file type. Keep the loader's "canonical section set" comment in sync.

## Feasibility (verified against content branch)

- Activities bind operations by **id** (`skill::op`), not by path → relocating files does **not** break activity bindings.
- All 13 grouped skills are referenced only as `group::<specific-op>` — never `group::rules` or whole-group → safe (rules are retained anyway under R3).
- Standalone techniques with inline multi-ops (e.g. `update-pr::render`, `update-pr::rules`) keep their body when flattened → unaffected.

## Open — to resolve in planning

- How the loader treats the new `techniques/TECHNIQUE.md` root index: a loadable "skill", a `get_skills` listing source, or purely an authoring/navigation doc.
- Relationship between the root `TECHNIQUE.md` **shared rules** and the existing `workflow.toon` `rules[]` — avoid duplication/conflict; seed root shared-rules conservatively (only genuine cross-technique rules).
- `get_skill` / `get_skills` behaviour across the new file types.
- Validation: confirm MCP-served operation/rule bundles are content-equivalent before/after (runtime contract unchanged).

## Out of scope

techniques-vs-resources conceptual split; `ontology`/`kind` frontmatter (inert, retained); membership of the 13 grouped folders; any runtime MCP contract change.

## Success criteria

1. No `SKILL.md` files remain.
2. Standalone techniques and all resources are flat `<slug>.md`.
3. Each grouped folder has `TECHNIQUE.md` + op files, rules retained.
4. Each workflow `techniques/` has a root `TECHNIQUE.md` index.
5. Redundant titles removed per R6.
6. Loader resolves all references; all internal links valid; MCP operation/rule bundles unchanged in content.
7. `workflow-canonical` ontology rewritten to define the new structure and cross-reference format; no `/SKILL.md` references remain in it; loader "canonical section set" comment kept in sync.
8. Every op uses `## Protocol` (no `## Procedure` remains); `get_technique` returns the composed technique and `get_resource` the flat resource; `get_skill`/`get_skills` retired.
9. Each root `TECHNIQUE.md` is minimal and correctly scoped — only genuinely cross-technique contract; no duplication of `workflow.toon` rules; no Protocol steps that don't sensibly precede every technique in the workflow.

# Markdown Skills Migration - Implementation Plan

**Date:** 2026-05-29
**Priority:** HIGH
**Status:** Ready
**Estimated Effort:** 4-6h agentic + 2h review

---

## Overview

### Problem Statement

The workflow-server today delivers per-workflow knowledge through TOON-encoded skill and resource files that live alongside the workflow definitions in `workflows/<workflow>/skills/` and `workflows/<workflow>/resources/`. Authoring those files requires understanding the TOON projection rules in addition to the underlying intent, and the format is harder for humans to read and edit than plain markdown. The 2026-05-22 planning artifact specified a target shape — per-workflow `techniques/` and `resources/` folders containing markdown files, with `workflows/meta/` doubling as the cross-workflow shared layer — and pre-migrated ~150 markdown files into `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/legacy/{work-package,meta}/`. The migration itself was deferred. This work-package executes that deferred work: place the pre-migrated content on the `workflows` branch, teach the workflow-server to read markdown techniques and resources with workflow-local → `meta` precedence, project techniques back to TOON on delivery so the MCP wire contract stays stable, and remove the legacy TOON sources.

### Scope

**In Scope:**

- New `workflows/<workflow>/{techniques,resources}/` content on a content-side branch (`feat/125-markdown-skills-content` off `workflows`), sourced from the planning-folder `legacy/{work-package,meta}/` trees.
- The ontology definition resource at `workflows/meta/resources/workflow-canonical/SKILL.md`.
- A new markdown skill reader replacing `tryLoadSkill` / `tryReadSkillRaw` in `src/loaders/skill-loader.ts:59-96`.
- A new precedence resolver inside `readSkill` / `readSkillRaw` (`src/loaders/skill-loader.ts:127-212`): workflow-local first, then `workflows/meta/`, replacing the cross-workflow scan-all.
- A new named `projectSkillToToon(skill)` projection function shared by `readSkill` / `readSkillRaw` and the consumers `get_skill` / `get_workflow` preamble / `get_skills`.
- Resource-loader precedence flip from TOON-wins to markdown-only at `src/loaders/resource-loader.ts:140-160, 196-217`.
- Op-as-child-files awareness in the markdown loader: a `<technique>/SKILL.md` index plus sibling `<op>.md` files materialise into a single `Skill.operations` map keyed by op basename.
- Migration script at `scripts/migrate-skills/` that copies the planning-folder `legacy/` trees into the workflows worktree (idempotent, rerunnable).
- Updated fixtures and tests at `tests/skill-loader.test.ts` covering workflow-local override of a meta technique, op-as-child-files folder shape, and projection-identity (markdown → TOON output equal to a baseline captured from the legacy loader on identical input).
- Removal of the legacy `workflows/<workflow>/skills/` directories and any legacy TOON resources, on the content-side branch.
- Removal of the cross-workflow scan-all fallback and the `parseActivityFilename` alias in `src/loaders/skill-loader.ts:10`, on the source-side branch.

**Out of Scope:**

- Workflow-canonical Phase 2 restructuring (decomposing techniques into composing bodies + nested techniques). Deferred to `workflow-canonical-plan.md`.
- Any structural change to `workflow.toon` files or `activities/*.toon` files. Path-shaped references inside those files were rewritten in earlier preparatory work and are not touched here.
- Schema migration. The existing `SkillSchema` and `OperationDefinitionSchema` already cover every field the new markdown source produces.
- The `guides/` legacy fallback in `resource-loader.ts:99-103` (Q9 in comprehension, deferred).
- Sunsetting the `workflow.skills.primary` legacy preamble path in `get_workflow` (Q8 in comprehension, deferred — markdown loader resolves it during the transition).
- New authoring tooling for techniques and resources.

---

## Research & Analysis

*See companion planning artifacts for full details:*

- **Design philosophy:** [01-design-philosophy.md](01-design-philosophy.md)
- **Codebase comprehension:** [02-codebase-comprehension.md](02-codebase-comprehension.md)
- **Legacy plan (source of truth for transformation rules):** [../2026-05-22-claude-skills-migration/legacy-plan.md](../2026-05-22-claude-skills-migration/legacy-plan.md)
- **Pre-migrated content:** [../2026-05-22-claude-skills-migration/legacy/](../2026-05-22-claude-skills-migration/legacy/)

### Key Findings Summary

**From Codebase Comprehension:**

- **Loader swap point is narrow.** `tryLoadSkill` (`src/loaders/skill-loader.ts:59-76`) and `tryReadSkillRaw` (`src/loaders/skill-loader.ts:79-96`) are the only two leaf functions touching on-disk TOON for skills. Every public surface (`readSkill`, `readSkillRaw`, `resolveOperations`, `formatOperationsBundle`) consumes their output via the `Skill` typed object or a raw passthrough string. Replacing those two with markdown readers keeps the entire tool layer untouched.
- **Precedence layer fits inside the existing public functions.** `readSkill:147-165` and `readSkillRaw:200-209` already iterate candidate workflows; the cross-workflow scan-all becomes a single explicit `meta` lookup. No new public symbols required.
- **`resolveOperations` + `formatOperationsBundle` are format-agnostic.** They operate on the in-memory `Skill` object and produce a TOON-encoded bundle. The markdown loader must yield `Skill` objects identical to what the TOON loader produces — the bundle code is reused verbatim.
- **Resource loader already reads markdown.** `resource-loader.ts:76-90, 140-160` parses both `.toon` and `.md` with a TOON-wins precedence; the migration only needs to flip that precedence to markdown-only. `parseFrontmatter` (`resource-loader.ts:291-306`) already produces the `{id, version, content}` shape `get_resource` returns.
- **Op-as-child-files materialisation is a parser concern, not a schema concern.** The existing `SkillSchema` / `OperationDefinitionSchema` accept the assembled `Skill` object regardless of whether operations came from a single SKILL.md body or from N sibling `<op>.md` files. The migration's parser builds a virtual `Skill` from `SKILL.md` frontmatter + body sections + per-op child files.
- **Pre-migrated content is structurally complete.** Sampled `cargo-operations/{SKILL.md, check.md}` and `build-comprehension/SKILL.md` — both match the canonical shape. 27 work-package techniques and 8 meta techniques are authored, with the op-as-child-files pattern applied to 6 techniques (~40 op files).

**Baseline (loader behaviour, today):**

- `get_skill` returns raw on-disk TOON via `readSkillRaw` — wire shape: `session_index: ...\n\n` + TOON body.
- `get_workflow` preamble = `primary-skill raw TOON` + `\n\n` + `encodeToon(formatOperationsBundle(resolveOperations([...workflow.operations, ...CORE_ORCHESTRATOR_OPS])))` + `\n\n---\n\n` + body.
- `get_activity` preamble = `encodeToon(formatOperationsBundle(resolveOperations([...activity.operations, ...CORE_WORKER_OPS])))` + `\n\n---\n\n` + `session_index: ...\n\n` + raw activity TOON.

**Gap:** Source-of-truth is TOON; authoring is friction-heavy; pre-migrated markdown content exists but is unreachable by the loader.

**Opportunity:** Markdown source + TOON projection on delivery decouples authoring from wire format. The projection layer becomes an isolated, testable contract.

---

## Proposed Approach

### Solution Design

Two coordinated feature branches, content-first / source-second:

1. **Content side** (`feat/125-markdown-skills-content` off `workflows`, worktree at `/home/mike1/projects/work/workflows/2026-05-28-markdown-skills-impl/`). Place the pre-migrated `techniques/` and `resources/` content under each workflow folder, sourced verbatim from the planning-folder `legacy/{work-package,meta}/` trees. The legacy TOON `skills/` directories are removed in the same branch (no dual-source coexistence). The ontology definition resource lands at `workflows/meta/resources/workflow-canonical/SKILL.md`. Merges first.
2. **Source side** (`feat/125-markdown-skills-migration` off `main`, worktree at `/home/mike1/projects/work/workflow-server/2026-05-28-markdown-skills-impl/`). Replace the two leaf TOON readers in `src/loaders/skill-loader.ts` with a markdown reader that understands the op-as-child-files pattern; flip the resource-loader to markdown-only; add a `projectSkillToToon(skill)` function that produces the TOON wire form from the in-memory `Skill`; replace the cross-workflow scan-all with explicit workflow-local → `meta` precedence. Merges second, once content is in place on `workflows`.

Both branches use the same migration script (`scripts/migrate-skills/`, committed on the source side) so the content placement is reproducible. The script is idempotent and reads from the 2026-05-22 planning folder.

The wire contract is preserved: `get_skill`, `get_workflow`, `get_activity`, and `get_resource` return byte-equivalent payloads modulo whitespace differences inherent to a projection round-trip. Projection-identity tests pin the TOON output of `projectSkillToToon` against captured baselines from the current TOON loader on identical input.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Markdown source + TOON projection on delivery (two-branch coordination) | Wire contract preserved; authoring in markdown; isolated, testable projection layer | Coordination across two branches; one extra projection function | **Selected** |
| Markdown source + markdown delivery (drop TOON on the wire) | Simpler server (no projection); single format | Forces a one-shot client-side migration; every existing `get_skill` consumer breaks | Rejected (comprehension §7.7) |
| Keep TOON on disk; only fix authoring with a generator | No loader change; no projection; no coordination | Generator becomes a new authoring step; still two source forms; doesn't solve the friction | Rejected (defeats the migration's purpose) |
| Single big-bang PR (content + source on one branch) | One merge | Submodule boundary makes it untenable; review surface ~150 files + loader rewrite simultaneously | Rejected (the workflows worktree is a separate branch) |

---

## Implementation Tasks

Tasks are grouped into three phases. Each task names its worktree explicitly. Tasks describe code/artifact changes only; verification (build/test/lint) is owned by the `validate` activity and is not enumerated as separate items.

### Phase A - Content Placement (content-side branch `feat/125-markdown-skills-content`)

**Worktree:** `/home/mike1/projects/work/workflows/2026-05-28-markdown-skills-impl/`

#### Task A1: Author the migration script (30-45 min)

**Goal:** Implement an idempotent script that copies the pre-migrated markdown content from the 2026-05-22 planning-folder `legacy/` trees into the workflows worktree at the target on-disk shape.

**Deliverables:**

- `scripts/migrate-skills/migrate.ts` (run with `tsx`) - reads `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/legacy/{work-package,meta}/{techniques,resources}/` and writes to `workflows/<workflow>/{techniques,resources}/<slug>/SKILL.md` (+ sibling `<op>.md` files where present in the source).
- `scripts/migrate-skills/README.md` - inputs, outputs, idempotency contract, how to rerun.
- Script preserves the ontology definition resource at `workflows/meta/resources/workflow-canonical/SKILL.md`.
- The script is authored against the source-side worktree (Phase B commits it on the source branch — Task B5); a local copy/symlink is used to run it against the content worktree in Phase A.

**Acceptance criteria:**

- Running the script populates 27 work-package techniques + 8 meta techniques + their op-child files in a single pass.
- Running it twice produces the same tree (idempotency).
- Per-workflow stats are reported to stdout (techniques migrated, op-child files materialised, resources migrated).

#### Task A2: Run the script and commit content (15-30 min)

**Goal:** Produce the new on-disk layout on the content-side branch.

**Deliverables:**

- New folders under each migrated workflow: `workflows/<workflow>/techniques/<slug>/SKILL.md` and `workflows/<workflow>/resources/<slug>/SKILL.md`.
- New ontology definition: `workflows/meta/resources/workflow-canonical/SKILL.md`.
- One commit per workflow with a clear message (e.g. `markdown-skills: add techniques and resources for work-package`).

**Acceptance criteria:**

- Every workflow that had a `skills/` directory now also has a sibling `techniques/` directory with the same set of named techniques.
- Every workflow that had a `resources/` directory now also has a sibling `resources/<slug>/SKILL.md` shape per migrated resource.
- `workflows/meta/resources/workflow-canonical/SKILL.md` exists.
- No `workflow.toon` or `activities/` files are modified.

#### Task A3: Update workflow READMEs (10-15 min)

**Goal:** Document the new `techniques/` and `resources/` directories so contributors find them.

**Deliverables:**

- `workflows/README.md` (top-level) - note the new layout and the workflow-local → `meta` precedence.
- `workflows/meta/README.md` - note the dual role of `meta`'s `techniques/`/`resources/` as the cross-workflow shared layer.

**Acceptance criteria:**

- Both READMEs link to the ontology definition resource.
- No other content is changed.

### Phase B - Source Side (source-side branch `feat/125-markdown-skills-migration`)

**Worktree:** `/home/mike1/projects/work/workflow-server/2026-05-28-markdown-skills-impl/`

**Dependencies:** None of B1-B7 depend on Phase A landing first — Phase B can be developed in parallel using the content worktree as its test fixture source. Phase B must not *merge* until Phase A merges (avoids the failure window where the loader expects markdown but `workflows` still has TOON).

#### Task B1: Add the markdown skill reader (60-90 min)

**Goal:** Implement the markdown reader that produces `Skill` objects from `SKILL.md` (single-file or folder-with-op-children) per comprehension §7.5.

**Deliverables:**

- `src/loaders/markdown-skill-loader.ts` - exports `tryLoadMarkdownSkill(skillDir: string, skillId: string): Promise<Result<Skill, SkillNotFoundError>>` and `tryReadMarkdownSkillRaw(skillDir: string, skillId: string): Promise<Result<string, SkillNotFoundError>>`.
- Parser logic for:
  - `SKILL.md` frontmatter → `Skill` top-level fields (`id` from `name`, `version` from `metadata.version`, etc.).
  - `## Capability` section → `Skill.capability`.
  - `## Protocol` named-phase subsections → `Skill.protocol`.
  - `## Operations` (when present, with the body in `SKILL.md`) → `Skill.operations` entries.
  - `## Rules` named-rule subsections → `Skill.rules`.
  - `## Errors` named-error subsections → `Skill.errors`.
- Op-as-child-files parser: enumerate sibling `*.md` files (excluding `SKILL.md`, `README.md`); each child is a single `OperationDefinition` with `## Inputs`, `## Output`, `## Procedure`, `## Errors`, `## Rules` materialised from the canonical section set.
- The raw variant returns the projected TOON string (calls into B3's `projectSkillToToon`).

**Acceptance criteria:**

- Returns a `Skill` object that validates against `SkillSchema` (`schemas/skill.schema.ts:156-184`).
- Single-file techniques (e.g. `build-comprehension`) and folder-with-op-children techniques (e.g. `cargo-operations`) both load correctly.
- Returns `SkillNotFoundError` when neither `<skillDir>/<skillId>/SKILL.md` exists.

#### Task B2: Refactor `tryLoadSkill` / `tryReadSkillRaw` to dispatch to markdown (30-45 min)

**Goal:** Route the existing public surface through the new markdown reader.

**Deliverables:**

- Modify `src/loaders/skill-loader.ts:59-76` (`tryLoadSkill`) and `:79-96` (`tryReadSkillRaw`) to call `tryLoadMarkdownSkill` / `tryReadMarkdownSkillRaw` first. The legacy TOON branch is retained behind a feature flag (`SKILL_LOADER_LEGACY_TOON=true`) for one release as a safety fallback — defaults off; removed in Phase C.
- Remove the `parseActivityFilename as parseSkillFilename` alias at `src/loaders/skill-loader.ts:10` (techniques use folder names, no NN- prefix). The activity parser stays unchanged.

**Acceptance criteria:**

- `readSkill('cargo-operations', WORKFLOW_DIR, 'work-package')` returns a populated `Skill` from the markdown source.
- The public exports of `skill-loader.ts` (`readSkill`, `readSkillRaw`, `listWorkflowSkillIds`, `resolveOperations`, `formatOperationsBundle`, `ResolvedOperation`) remain unchanged in name and signature.

#### Task B3: Add the TOON-projection function (45-60 min)

**Goal:** Single named function that produces the TOON wire form from an in-memory `Skill` object, consumed by `readSkillRaw` (via B2) and `get_skill` (via the existing tool handler).

**Deliverables:**

- `src/loaders/skill-loader.ts` - export `projectSkillToToon(skill: Skill): string`. Implementation calls `encodeToon` with the canonical Skill shape, ensuring field ordering matches the legacy on-disk TOON within the bounds the encoder allows.
- `tryReadMarkdownSkillRaw` (Task B1) calls `projectSkillToToon` rather than re-deriving the projection inline.

**Acceptance criteria:**

- For each migrated skill, `projectSkillToToon(loadedSkill)` produces output that decodes back to a `Skill` object equal to the input (round-trip identity).
- For each migrated skill that has a TOON baseline captured from the legacy loader, the projection's output matches the baseline modulo whitespace (see T-08, T-09 in the test plan).

#### Task B4: Replace cross-workflow scan-all with workflow-local → meta precedence (20-30 min)

**Goal:** The precedence resolver per comprehension §7.2.

**Deliverables:**

- `src/loaders/skill-loader.ts:147-165` (`readSkill` body) and `:192-209` (`readSkillRaw` body): replace the existing "iterate every workflow that has a skills/ subdir" fallback with a single explicit `meta` lookup (`tryLoadMarkdownSkill(join(workflowDir, 'meta', 'techniques'), skillId)`).
- Delete `findWorkflowsWithSkills` (`src/loaders/skill-loader.ts:35-56`) - the cross-workflow scan helper is no longer used.

**Acceptance criteria:**

- `readSkill('agent-conduct', WORKFLOW_DIR, 'work-package')` resolves to `workflows/meta/techniques/agent-conduct/SKILL.md` when no workflow-local override exists.
- Adding a workflow-local override at `workflows/work-package/techniques/agent-conduct/SKILL.md` causes the same call to return the override.
- Explicit-prefix lookups (`meta/agent-conduct`) still work unchanged.

#### Task B5: Flip resource-loader precedence to markdown-only (20-30 min)

**Goal:** Comprehension §7.4 - the resource loader already reads both formats with TOON-wins precedence; flip to markdown-only.

**Deliverables:**

- `src/loaders/resource-loader.ts:140-160` (the two-pass `.toon`-then-`.md` loop in `readResourceStructured` / `readResourceRaw`): replace with a single `.md` match. Remove the TOON-decode branch.
- `parseResourceFilename` (`:76-90`) regex stays format-agnostic; the loader simply ignores `.toon` matches.

**Acceptance criteria:**

- A resource that exists only as `<index>-<slug>.md` resolves correctly.
- A resource that exists only as `<index>-<slug>.toon` returns `ResourceNotFoundError` (matching the post-migration state where TOON resources have been removed).

#### Task B6: Commit the migration script on the source branch (10 min)

**Goal:** The same script Task A1 produced lands on the source branch so it's discoverable from the workflow-server repo.

**Deliverables:**

- `scripts/migrate-skills/` directory committed on `feat/125-markdown-skills-migration`. Contents identical to what A1 produced.
- `package.json` - add a script entry `"migrate-skills": "tsx scripts/migrate-skills/migrate.ts"`.

**Acceptance criteria:**

- `npm run migrate-skills -- --help` prints usage.
- The script is invocable from the source-side worktree against an arbitrary workflows worktree path.

#### Task B7: Update fixtures and tests at tests/skill-loader.test.ts (60-90 min)

**Goal:** Cover the new precedence resolver, op-as-child-files materialisation, and projection identity. See the companion [test plan](05-test-plan.md) for the full case list.

**Deliverables:**

- New fixture tree under `tests/fixtures/markdown-skills/` containing:
  - `meta/techniques/agent-conduct/SKILL.md` (rules-only technique).
  - `meta/techniques/workflow-engine/SKILL.md` (single-file technique with operations in the body).
  - `work-package/techniques/cargo-operations/{SKILL.md, check.md, test.md}` (op-as-child-files folder).
  - `work-package/techniques/agent-conduct/SKILL.md` (workflow-local override — different `description` than meta's).
- TOON projection baselines captured from the current TOON loader on the same inputs, stored at `tests/fixtures/markdown-skills/baselines/<skill>.toon` for projection-identity tests.
- New test cases per the test plan (T-01 through T-12).

**Acceptance criteria:**

- All new tests pass against the new markdown loader.
- The existing TOON-baseline tests at lines 11-89 continue to pass when run against `WORKFLOW_DIR` (the post-migration `workflows/meta/techniques/` content satisfies the same assertions).

### Phase C - Cutover (split across both branches)

**Dependencies:** Phase A merged; Phase B merged; one release cycle of dual-mode operation (markdown loader live with the legacy-TOON feature flag retained as a fallback).

#### Task C1: Remove legacy TOON skills and resources from the workflows branch (15-30 min)

**Worktree:** `/home/mike1/projects/work/workflows/2026-05-28-markdown-skills-impl/`

**Goal:** Single source of truth - the legacy TOON content is gone.

**Deliverables:**

- Delete every `workflows/<workflow>/skills/*.toon` file.
- Delete every `workflows/<workflow>/resources/*.toon` file (keep `.md` resources during the format transition; only TOON resources are removed - markdown resources move to the `<slug>/SKILL.md` shape via the migration script in Task A2).
- Delete the now-empty `workflows/<workflow>/skills/` directories.
- One commit per workflow (e.g. `markdown-skills: remove legacy TOON skills for work-package`).

**Acceptance criteria:**

- No `*.toon` files remain under any `workflows/<workflow>/skills/` directory.
- The new `techniques/` content remains untouched.

#### Task C2: Remove the legacy-TOON fallback in the loader (15 min)

**Worktree:** `/home/mike1/projects/work/workflow-server/2026-05-28-markdown-skills-impl/`

**Goal:** The markdown loader is now the only path. The feature flag from B2 is removed.

**Deliverables:**

- `src/loaders/skill-loader.ts` - delete the legacy-TOON branch in `tryLoadSkill` / `tryReadSkillRaw` and the `SKILL_LOADER_LEGACY_TOON` environment variable check.
- Remove `findSkillFile` and any other dead code paths that referenced the legacy `NN-{id}.toon` filename shape for skills (the equivalent for activities stays — they remain TOON).
- Update `.env.example` (if present) to drop the legacy flag.

**Acceptance criteria:**

- `grep -r SKILL_LOADER_LEGACY_TOON src/` returns no results.
- Skill loading still passes the full test suite.

---

## Success Criteria

### Functional Requirements

- [ ] Every `get_skill`, `get_workflow`, `get_activity`, `get_resource` call returns content equivalent to the pre-migration state (same fields, same semantics, same wire shape).
- [ ] All 14 work-package activities resolve their skill and resource references correctly across workflow-local and `meta` precedence.
- [ ] Workflow-local override of a meta technique is honoured (precedence resolver works).
- [ ] Op-as-child-files techniques materialise into a single `Skill.operations` map keyed by op basename.
- [ ] Legacy TOON skills + resources are removed at Phase C - single source of truth.

### Performance Targets

This work-package does not target a quantitative performance change. The projection layer adds one `encodeToon` call per `get_skill` invocation that previously returned the on-disk TOON verbatim. Response sizes are unchanged. No latency budget is specified; latency variance under `npm test` is expected to be negligible (markdown parse + frontmatter parse + `encodeToon` on a ~5 KB object).

### Quality Requirements

- [ ] All existing tests pass on both branches.
- [ ] New tests cover precedence resolver, op-as-child-files assembly, and projection-identity (see [05-test-plan.md](05-test-plan.md)).
- [ ] ADRs forward-referenced in [01-design-philosophy.md](01-design-philosophy.md) §Architectural Decisions are authored alongside this implementation. The five ADRs:
  1. No orphan branch — meta workflow doubles as shared layer.
  2. Operations-as-child-files pattern.
  3. TOON-projection delivery (techniques) + simplified-markdown delivery (resources).
  4. `agent-conduct` as rules-only technique.
  5. Canonical section set for op child files.
- [ ] `npm run typecheck` passes on the source branch.

### Measurement Strategy

**How will we validate the migration preserves behaviour?**

- **Projection-identity baselines.** Before any source-side change merges, capture the current TOON output of `get_skill` for every technique on the `workflows` branch. After the source-side change merges, re-run `get_skill` for the same set and compare to the baseline (modulo whitespace) — see T-08, T-09 in [05-test-plan.md](05-test-plan.md).
- **Existing test suite.** `tests/skill-loader.test.ts:11-89` exercises real workflows content (`meta/agent-conduct`, `meta/workflow-engine`); these tests continue to pass without modification once the markdown loader is reading the new `workflows/meta/techniques/` layout.
- **Manual spot-check.** A representative agent task end-to-end on the source branch produces the same artifacts as the same task run on `main` (acceptable variance: minor prose-only output differences).

---

## Testing Strategy

See [05-test-plan.md](05-test-plan.md) for the full case list. Summary:

### Unit Tests

- Markdown skill reader: frontmatter parsing, body section parsing, op-as-child-files assembly, rules-only technique (`agent-conduct`).
- Precedence resolver: workflow-local first, `meta` fallback, explicit-prefix unchanged.
- Resource loader: markdown-only after the flip.
- Projection function: round-trip identity (`projectSkillToToon(decodeToon(...)) === toon`) and baseline identity against captured TOON output of the legacy loader.

### Integration Tests

- `get_skill` end-to-end against the new fixture tree returns the projected TOON.
- `get_workflow` preamble assembly: `resolveOperations` + `formatOperationsBundle` produce the same bundle shape from the new markdown source as from the legacy TOON source.
- `get_activity` preamble assembly: same parity check.

### E2E Tests

- Not formally part of this migration — the `validate` activity runs the full test suite, which exercises the loaders against the real `workflows/` content.

---

## Dependencies & Risks

### Requires (Blockers)

- [ ] Pre-migrated content at `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/legacy/` is structurally complete (assumption A-001, confirmed by comprehension §9 spot-check; full audit is part of Task A1's read pass).
- [ ] The `workflows` worktree at `/home/mike1/projects/work/workflows/2026-05-28-markdown-skills-impl/` exists (orchestrator created it via `start-work-package`'s `compute-canonical-target-path`).
- [ ] PR #126 (source-side) is open and trackable; the content-side PR will be opened at submit-for-review.

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Markdown parser drift produces a `Skill` object that doesn't match the existing TOON loader's output for the same source | HIGH | MEDIUM | Projection-identity tests (T-08, T-09) catch drift before merge. Baselines captured from the legacy loader on identical input. |
| Precedence resolver returns the wrong layer (workflow-local vs meta) for a corner-case lookup | HIGH | LOW | Explicit precedence tests (T-04, T-05) cover override and fallback paths. The explicit-prefix path (`meta/foo`) is exercised by the existing test suite. |
| Op-as-child-files assembly silently drops an operation when the child file is malformed | MEDIUM | LOW | Parser fails loudly on missing canonical sections (`## Procedure` is mandatory per design philosophy §"Canonical Section Set"). Test T-06 covers a malformed child file. |
| Content-side branch merges with a typo or missing file; source-side branch then fails to resolve a skill | MEDIUM | LOW | Migration script is idempotent and is the single source of placement; running it again produces the canonical tree. Content-side PR review surfaces missing files. |
| Submodule branch coordination drifts (source merged before content) | HIGH | LOW | PRs are merged in order content→source. The orchestrator's `submit-for-review` activity enforces ordering. The legacy-TOON feature flag in Task B2 also covers the brief window during dual-mode operation. |
| The 2026-05-22 pre-migrated content has shape oddities not surfaced by the comprehension spot-check | MEDIUM | LOW | Task A1 reads every file in the legacy tree; structural anomalies surface there before content lands on the workflows branch. |

---

**Status:** Ready for implementation

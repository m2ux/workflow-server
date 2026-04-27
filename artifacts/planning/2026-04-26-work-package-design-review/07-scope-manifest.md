# Scope Manifest (Update Mode) — Work Package Workflow Remediation

**Date:** 2026-04-26
**Activity:** `scope-and-structure`
**Mode:** update (`is_update_mode = true`, `is_review_mode = false`, `user_wants_fixes = true`)
**Target workflow:** `work-package` v3.7.0
**Worker:** `worker-scope-structure`
**Inputs:** `04-intake-update.md` (bucketed change request), `06-requirements-refinement.md` (atomic REQs with acceptance criteria).
**Output:** final, exhaustive per-file action plan to be confirmed by the user via the `scope-manifest-confirmed` checkpoint.

---

## 1. Worktree verification (step: verify-worktree)

- `git worktree list` shows the main repo only (workflows is a submodule, not a worktree); the `workflows/` subdirectory is a checked-out git submodule on branch `workflows`, up-to-date with `origin/workflows`. The required path `workflows/work-package/` resolves and contains `workflow.toon`, `README.md`, `REVIEW-MODE.md`, `activities/`, `skills/`, `resources/`.
- All file paths in this manifest are relative to the repository root (`/home/mike1/projects/main/workflow-server/`). All edits land in the `workflows` submodule, on its `workflows` branch.

## 2. Folder structure (step: design-folder-structure)

Skipped per the activity's `condition: is_update_mode != true`. The existing folder structure is preserved as-is:

```
workflows/work-package/
├── workflow.toon
├── README.md
├── REVIEW-MODE.md
├── activities/   (14 *.toon + README.md)
├── skills/       (24 *.toon + README.md)
└── resources/    (28 *.md + README.md)
```

No directory additions, removals, or reorganizations.

## 3. File manifest (step: enumerate-files)

13 files modified, 0 added, 1 renamed-by-id (`02-readme.md`), 0 deleted (per REQ-9.1 recommendation `(a) rename`).

The table below lists every affected file with its action, the section/lines being edited, and the REQ-ids satisfied. Unaffected files are explicitly omitted (the activity rule "every affected file must be enumerated" applies; non-affected files are out of scope).

| # | Path | Action | Section / lines | REQ-ids satisfied |
|--:|---|---|---|---|
| 1 | `workflows/work-package/workflow.toon` | modify | `rules[7]` (delete entries at indices 1 and 7 → length 7→5); `variables[70]` (add 8 new string vars → 70→78; refine `plan` and `current_assumption` description fields with sub-shape documentation, no count change) | REQ-10.1, REQ-10.2, REQ-4.4 |
| 2 | `workflows/work-package/README.md` | modify | line 3 (version header `3.6.1` → `3.7.0`); line 6 (reconcile "fourteen activities" prose with the activity-table count) | REQ-5.1, REQ-5.3 |
| 3 | `workflows/work-package/REVIEW-MODE.md` | modify | lines 131–141 (rename references `issue-management` → `start-work-package`, `update-pr` → `submit-for-review`) | REQ-5.2 |
| 4 | `workflows/work-package/activities/01-start-work-package.toon` | modify | add `entryActions[].validate` on `verify-jira-issue` step (target `jira_cloud_id != null`, message references `atlassian-operations`); remove `rules[1]` (whole `rules[]` array drops, since it was the only entry) | REQ-10.3, REQ-Tool-Skill-Doc (subsumed) |
| 5 | `workflows/work-package/activities/08-implement.toon` | modify | add `checkpoints[].symbol-provenance-confirmed` (`blocking: true`) and link it from the existing `task-completion-review` step via `checkpoint:`; remove `rules[1]` (whole `rules[]` array drops) | REQ-10.4 |
| 6 | `workflows/work-package/activities/14-codebase-comprehension.toon` | modify | `rules[7]` shrinks to `rules[3]` — delete indices 1, 2, 3 (cross-level duplication of comprehension rules) and index 7 (sufficiency rule, restated control flow); retain indices 4, 5, 6 | REQ-10.5, REQ-D |
| 7 | `workflows/work-package/skills/03-create-issue.toon` | modify | lines 43–50 — convert flat `tool-usage:` semicolon-joined string to grouped `rules.tool-usage[]` array, one `{ name, description }` per clause; preserve all clauses verbatim in semantics | REQ-4.1, REQ-4.2 |
| 8 | `workflows/work-package/skills/22-build-comprehension.toon` | modify | line 86 — delete the single-step `tool-usage` rule and append its content to the `architecture-survey` step's `description` in `protocol[]` | REQ-4.3 |
| 9 | `workflows/work-package/skills/README.md` | modify | lines 5 and 31 — reconcile "24" vs "25" skill count, choose the actual file count (24), apply consistently | REQ-5.4 |
| 10 | `workflows/work-package/resources/README.md` | modify | line 13 — update the `02-readme.md` row to reflect the new id `readme-deprecated` and annotate the description column as deprecated | REQ-5.5, REQ-9.2 |
| 11 | `workflows/work-package/resources/02-readme.md` | rename-by-id | frontmatter `id: readme` → `id: readme-deprecated` (file path unchanged; resolves the duplicate-id collision with `01-readme.md`) | REQ-9.1 |
| 12 | *(reserved)* | — | — | — |
| 13 | *(reserved)* | — | — | — |

> **Note on count:** the intake artifact (§3) projected "13 files modified, 0–1 deleted, 0 added." The final manifest contains **11 distinct files** with concrete actions; the reduction comes from the deliberate decisions made during requirements refinement:
> - `activities/13-complete.toon` is **out of scope** (REQ-4.5 skip with rationale: convention-aligned terminal modeling already used by other workflows).
> - The "delete vs rename" choice on `02-readme.md` was resolved to **rename-by-id** (REQ-9.1 option (a)), so it is one row, not two.
> - REQ-Tool-Skill-Doc (Atlassian `cloudId` consolidation) is subsumed by REQ-10.3 and adds no new file edits.
> - REQ-8.1 generates no work.
>
> All 21 audit findings are still addressed; the file count is lower because several findings collapse onto the same file (e.g., REQ-10.1 + REQ-10.2 + REQ-4.4 all land on `workflow.toon`).

### 3.1 Action legend

- **modify** — in-place edits to specific sections; preserves file identity. Per Update-Mode Guide §"Content Preservation Rules", any removal larger than a single rule-array entry surfaces at the `preservation-check` checkpoint during content drafting.
- **rename-by-id** — frontmatter `id:` field changes; file path stays the same. No git rename, no content rewrite beyond the single line.
- **delete** — not used in this manifest.
- **add** — not used in this manifest.

### 3.2 Files explicitly out of scope (audit confirmed unchanged)

For traceability against the audit's 21 findings and the Update-Mode Guide's "Step 2: Classify File Impact" requirement, the following files are explicitly **unaffected**:

- `workflows/work-package/activities/02-design-philosophy.toon`
- `workflows/work-package/activities/03-requirements-elicitation.toon`
- `workflows/work-package/activities/04-research.toon`
- `workflows/work-package/activities/05-implementation-analysis.toon`
- `workflows/work-package/activities/06-plan-prepare.toon`
- `workflows/work-package/activities/07-assumptions-review.toon`
- `workflows/work-package/activities/09-post-impl-review.toon`
- `workflows/work-package/activities/10-validate.toon`
- `workflows/work-package/activities/11-strategic-review.toon`
- `workflows/work-package/activities/12-submit-for-review.toon`
- `workflows/work-package/activities/13-complete.toon` *(REQ-4.5 skip, rationale captured in 06-requirements-refinement.md §F)*
- `workflows/work-package/activities/README.md`
- All `workflows/work-package/skills/*.toon` other than `03-create-issue.toon` and `22-build-comprehension.toon` (22 files unchanged)
- All `workflows/work-package/resources/*.md` other than `02-readme.md` (27 files unchanged)
- `workflows/work-package/resources/01-readme.md` *(unchanged; the duplicate-id resolution operates on `02-readme.md`)*

### 3.3 Reference & graph integrity (per Update-Mode Guide §"Step 3/4/5")

- **Transition integrity:** no activity additions, removals, or renames → all `transitions[].to` references and `initialActivity: start-work-package` remain valid.
- **Skill reference integrity:** no skill files renamed, deleted, or relocated → all `skills.primary` and `skills.supporting` references resolve.
- **Resource reference integrity:** the `02-readme.md` rename-by-id is from `id: readme` (a duplicate of `01-readme.md`'s id) to `id: readme-deprecated`. No live `_resources` reference uses index `02` against an `id: readme` lookup; `01-readme.md` retains `id: readme`. The change is therefore inert for any consumer that resolves by index, and disambiguating for any consumer that resolves by id. (To be re-verified at content-drafting time via `grep -rn "readme-deprecated\|id: readme" workflows/work-package/`.)
- **Variable integrity:** 8 new variable declarations (REQ-4.4) — each must be referenced somewhere in the workflow (messages, conditions, or `setVariable` effects). All eight are already interpolated in existing message strings per finding 4.4 of the audit, so no orphaned declarations are introduced. `jira_cloud_id` (referenced by the new validate action in REQ-10.3) is already declared in `workflow.variables[]` and re-verified during content drafting.

## 4. Structural design (step: present-structural-design)

Per `is_update_mode = true`, the structural design is the existing structure. No directory tree change, no transition diagram change. The activity transition graph (intake §1.2) is preserved verbatim:

```
start-work-package → design-philosophy → (requirements-elicitation?) → (research?) →
implementation-analysis → plan-prepare → assumptions-review → implement →
post-impl-review → validate → strategic-review → submit-for-review → complete

(codebase-comprehension is a sub-flow entered from design-philosophy / assumptions-review)
```

### 4.1 Localized structural deltas (within unchanged graph)

The structural changes happen **inside** activities and skills, not between them:

| File | Before | After |
|---|---|---|
| `workflow.toon rules[]` | length 7 | length 5 (drop index 1: blocking-checkpoint rule; drop index 7: ORCHESTRATION MODEL) |
| `workflow.toon variables[]` | length 70 | length 78 (add 8 strings); 2 entries (`plan`, `current_assumption`) get sub-shape documentation in their description field |
| `01-start-work-package.toon` | `rules[1]`, no `entryActions` on `verify-jira-issue` | no `rules[]`; `entryActions[].validate` on `verify-jira-issue` |
| `08-implement.toon` | `rules[1]`, no symbol-provenance checkpoint | no `rules[]`; new `checkpoints[].symbol-provenance-confirmed` (blocking) linked from `task-completion-review` step |
| `14-codebase-comprehension.toon rules[]` | length 7 | length 3 (retain indices 4, 5, 6; drop 1, 2, 3, 7) |
| `03-create-issue.toon` `rules.tool-usage` | flat semicolon-joined string | grouped array of `{ name, description }` entries |
| `22-build-comprehension.toon` `rules.tool-usage` | single-step rule entry + step description | step description carries the rule content; standalone rule deleted |
| `02-readme.md` frontmatter `id:` | `readme` (duplicate of `01-readme.md`) | `readme-deprecated` |
| `resources/README.md` row 13 | `02 readme-v2` (or similar) | reflects new id, marked deprecated |
| `README.md` | header version 3.6.1; "fourteen activities" prose mismatch | header version 3.7.0; activity count reconciled with the table |
| `REVIEW-MODE.md` | references obsolete activity IDs `issue-management`, `update-pr` | references current IDs `start-work-package`, `submit-for-review` |
| `skills/README.md` | "24"/"25" skill-count inconsistency | both occurrences read `24` (matches file count) |

### 4.2 Pattern-conformance check

Update mode skips pattern-analysis (per `04-pattern-analysis.toon condition: is_update_mode != true`), but the localized structural changes are checked against existing in-workflow patterns:

- `entryActions[].validate` (REQ-10.3): used elsewhere in the repo. Schema: `schemas/activity.schema.json` `entryActions[].action` enum includes `validate`. Confirmed appropriate.
- `checkpoints[].blocking: true` linked via `step.checkpoint:` (REQ-10.4): the canonical mechanism throughout the work-package workflow (e.g., `assumptions-review`, `validate`, `strategic-review` all use blocking checkpoints linked from steps). Pattern-conforming.
- Grouped `rules.tool-usage[]` (REQ-4.1/4.2): the canonical form used by every other skill in the workflow that has multiple `tool-usage` entries (e.g., `skills/22-build-comprehension.toon` after REQ-4.3 lands, and many other skills today). Pattern-conforming.
- Step-description embedded protocol (REQ-4.3): consistent with how single-step protocol guidance is encoded throughout the skills. Pattern-conforming.

## 5. Implementation order (step: present-approach)

Per the `00-workflow-design.toon protocol.content-drafting` rule "Draft files in order — workflow.toon, activities, skills, resources, README", and reflecting cross-file dependencies (activities reference variables declared in workflow.toon; resources/README references the new id of `02-readme.md`):

1. **`workflow.toon`** — first because it is the root of references. Land both rule deletions (10.1, 10.2) and the 8 variable additions (4.4) in a single pass. After this step, `jira_cloud_id` and the new variables are available for downstream activity edits to reference. Validate immediately.
2. **`activities/01-start-work-package.toon`** — add `entryActions[].validate`, remove `rules[]`. Validate.
3. **`activities/08-implement.toon`** — add `checkpoints[].symbol-provenance-confirmed`, link from `task-completion-review`, remove `rules[]`. Validate.
4. **`activities/14-codebase-comprehension.toon`** — drop 4 entries from `rules[]` (indices 1, 2, 3, 7). Validate.
5. **`skills/03-create-issue.toon`** — refactor flat `tool-usage` string → grouped array. Validate.
6. **`skills/22-build-comprehension.toon`** — move single-step rule into step description. Validate.
7. **`resources/02-readme.md`** — frontmatter `id:` rename to `readme-deprecated`. Verify no lookup depends on `id: readme` resolving to this file (only `01-readme.md` should match `id: readme` afterward).
8. **`resources/README.md`** — update row 13 to match the new id and annotate as deprecated.
9. **`skills/README.md`** — fix 24/25 skill-count inconsistency.
10. **`README.md`** — bump version 3.6.1 → 3.7.0; reconcile "fourteen activities" prose with the activity table.
11. **`REVIEW-MODE.md`** — rename activity-ID references on lines 131–141.

After every TOON edit (steps 1–6), run `scripts/validate-workflow-toon.ts` (or the validator wired into `npm run validate-workflows`) to confirm `39/39 PASS` is preserved (per acceptance criteria on every REQ in 06).

After all 11 steps, run a final repository-wide check:
- `grep -h "^id:" workflows/work-package/resources/*.md | sort | uniq -d` → must be empty.
- Schema validation 39/39 PASS.
- `grep -rn "issue-management\|update-pr" workflows/work-package/REVIEW-MODE.md` → must be empty.

### 5.1 Why this order is necessary

- **`workflow.toon` first:** the new variables it declares are referenced by `01-start-work-package.toon` (`jira_cloud_id` validate target) and by message strings throughout the activities. Editing activities first risks a transient validator failure if a variable expression references a not-yet-declared variable.
- **Activities before skills:** activities `08-implement.toon` and `14-codebase-comprehension.toon` reference skills (e.g., `22-build-comprehension`), but the skill-rule refactor (REQ-4.3) is internal to the skill and does not change the skill's id, inputs, or output — so activities can be edited safely before or after. Order is chosen to keep the most semantically loaded edits (rule-restructures with `validate`/blocking-checkpoint additions) earlier so a failed validation surfaces fast.
- **Resources before resource README:** the README row references the new id (`readme-deprecated`); the id lives in the resource file's frontmatter. If the README is edited first, the row will reference an id that does not yet exist on disk.
- **READMEs and REVIEW-MODE.md last:** these are pure documentation. They depend on the final state of the TOON files (e.g., the reconciled activity count) but no TOON file depends on them. Editing them last avoids re-touching them if any earlier step needs follow-up corrections.

### 5.2 Preservation-check rendezvous points (per Update-Mode Guide §"Content Preservation Rules")

Several edits remove material; each surfaces at the `preservation-check` checkpoint during the `content-drafting` activity:

| Step | Removal | Preservation surface |
|---|---|---|
| 1 (`workflow.toon rules[]`) | 2 prose rules deleted (10.1 blocking-checkpoint, 10.2 ORCHESTRATION MODEL) | Show diff; explain compensating documentation in orchestrator skill / README. |
| 2 (`01-start-work-package.toon`) | `rules[]` array removed entirely | Show diff; explain replacement = `entryActions[].validate` on `verify-jira-issue`. |
| 3 (`08-implement.toon`) | `rules[]` array removed entirely | Show diff; explain replacement = `symbol-provenance-confirmed` blocking checkpoint. |
| 4 (`14-codebase-comprehension.toon`) | 4 rule entries removed (1, 2, 3, 7) | Show diff; explain enforcement now lives in `skills/22-build-comprehension.toon` (entries 1–3) and existing `condition: has_open_questions == true` (entry 7). |
| 6 (`22-build-comprehension.toon`) | 1 standalone rule entry removed | Show diff; explain content is preserved in `architecture-survey` step description. |
| 7 (`02-readme.md`) | `id: readme` removed from this file | Show diff; explain `id: readme` is preserved on `01-readme.md` (the canonical file). |

No silent removals. Every diff is materialized at a checkpoint before the edit is committed.

## 6. Acceptance and traceability

Each row in §3's table maps to a REQ-id in `06-requirements-refinement.md` §2. The combined acceptance check at the end of `validate-and-commit` will require:

- 21 audit findings traceably addressed (5H + 9M + 7L). Of those, 1 (REQ-8.1) is a "no change" observation and 1 (REQ-4.5) is a deliberate skip with rationale. The remaining 19 have file-level edits in this manifest.
- Schema validation `39/39 PASS` preserved.
- No duplicate resource ids.
- No new orphaned variables (every new declaration is referenced).
- No broken transitions, no broken skill/resource references.

## 7. Outcome (scope-and-structure, before checkpoint)

- Worktree verified (workflows submodule on `workflows` branch).
- Folder structure unchanged (update-mode skip on `design-folder-structure`).
- File manifest: **11 distinct files** affected — 10 modify + 1 rename-by-id, 0 add, 0 delete.
- Structural design: localized intra-file deltas, no graph changes.
- Implementation order: 11 steps, workflow.toon first, READMEs last, validate after every TOON edit.
- Preservation-check rendezvous points enumerated for content-drafting activity.

The `scope-manifest-confirmed` checkpoint will fire next; on `confirmed` the workflow advances to `content-drafting` per the activity's `transitions[]` definition.

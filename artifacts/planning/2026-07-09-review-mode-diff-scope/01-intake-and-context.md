# Intake and Context — Review-Mode Diff-Scope Fix

**Session:** HS4VHZ · **Workflow:** workflow-design · **Activity:** intake-and-context
**Date:** 2026-07-09 · **Source:** GitHub issue [#203](https://github.com/m2ux/workflow-server/issues/203) (m2ux/workflow-server)

---

## 1. Operation Classification

| Field | Value |
|-------|-------|
| **Operation type** | **UPDATE** (modify an existing workflow) |
| **`is_update_mode`** | `true` |
| **`is_review_mode`** | `false` (we are *designing* a change, not auditing a workflow) |
| **`target_workflow_id`** | `work-package` (v3.25.0) |
| **`workflow_id`** | `work-package` |
| **Change category** (per update-mode-guide) | **Modify technique(s) + resource** — behavioral fix inside review-mode's PR diff-scoping; no activity add/remove/reorder |

**Rationale for target:** The defect lives in the work-package workflow's **review mode** — the state-driven mode (`is_review_mode`) that adapts the standard work-package flow for reviewing existing PRs. There is no separate "review" workflow; review mode is expressed as conditional steps/checkpoints/transitions on `is_review_mode` within the `work-package` workflow. The diff-scoping logic the issue faults is authored in that workflow's techniques and resources.

---

## 2. Structural Inventory — `work-package` (target)

| Entity | Count / Detail |
|--------|----------------|
| Root files | `workflow.yaml`, `README.md`, `REVIEW-MODE.md` |
| Activities | 15 (`01-start-work-package` … `15-codebase-comprehension`) |
| Technique groups | 15 grouped (`codebase-comprehension`, `manage-git`, `review-assumptions`, `strategic-review`, `update-pr`, `implementation-analysis`, `manage-artifacts`, `finalize-documentation`, `design-philosophy`, `plan-prepare`, `requirements-elicitation`, `research`, `conduct-retrospective`, `dco-provenance`, `validate-build`) + ~24 standalone technique `.md` files |
| Resources | 28 `.md` files (incl. `review-mode.md`, `manual-diff-review.md`, `architecture-review.md`) |

---

## 3. Root-Cause Localization (where the fix must land)

The issue names two defects. Located in the corpus:

### Root cause 1 — wrong diff base (two-dot against a stored/stale base)

- **`techniques/review-baseline-state.md`** (v1.0.0), Protocol step 3:
  `git -C {target_path} diff {base_sha}..HEAD` — **two-dot** diff against `{base_sha}`, a base commit SHA captured earlier in step 1 (`git rev-parse HEAD` on the base branch at checkout time). This is precisely the "stored/stale merge-base + two-dot" defect. Output `base_pr_diff` feeds downstream review stages.
- **`techniques/strategic-review/review-scope.md`** (v1.1.0), Protocol step 1:
  `git diff <base-branch> HEAD` and `git diff <base-branch> HEAD -- <file>` — **two-dot** (space form). Scopes the strategic-review file set.
- **`techniques/review-diff.md`** (v1.1.0) already uses three-dot (`git diff {$base_branch}...HEAD`) but derives `{$base_branch}` by local heuristic ("typically main/master"), not from the authoritative PR base; no merge-in guard.
- **`techniques/review-code.md`** (v2.0.0) establishes `{changed_files}` via a bare "`git diff` for all files changed since the work package started" — unspecified base/range.

### Root cause 2 — inverted reconciliation ("diff-scope correction")

- No workflow step *explicitly* instructs a "diff-scope correction"; the behavior emerged because **no technique or resource establishes GitHub's changed-files list (`gh pr view <n> --json files` / three-dot) as the authoritative authored surface**, and nothing constrains downstream findings to that set. `resources/review-mode.md` (v1.4.0) describes baseline capture and expected-changes but never pins the authored file set to GitHub's list, leaving workers free to treat a larger local two-dot count as "more files to review."

### Downstream finding constraint (issue's 5th suggested-fix bullet)

- Findings are produced by `review-code.md`, `strategic-review/review-scope.md`, `review-test-suite.md`, and consolidated by `review-summary.md` / `resources/review-mode.md`. None currently filters findings against an authoritative authored-file set.

---

## 4. Requested Change (parsed from issue #203 — SUGGESTIONS, not a spec)

Determine the least-over-engineered fix that:
1. Defines the review-mode authored surface as **three-dot** against a freshly recomputed merge-base, or authoritatively as `gh pr view <n> --json files`; prefer the GitHub file list as source of truth for "what this PR changes"; use local git only to read content at the reviewed SHA.
2. Never scopes against a stored/older base with a two-dot diff.
3. Removes / inverts the "diff-scope correction" behavior — GitHub's changed-files list is authoritative; a disagreeing local diff is what needs correcting, not the file list.
4. Adds a guard: if the head is a merge commit or the branch contains merges from base, explicitly compute the three-dot set and log the merge-in so the discrepancy can't be silently misread as "more files."
5. Constrains every downstream finding to the authored file set — a finding on a file not in the PR changed-files list is dropped or clearly separated as "pre-existing / not introduced by this PR."

**Scope discipline:** This is a focused behavioral correction to review-mode diff-scoping. It touches the diff-base techniques, the review-mode resource, and a downstream finding-constraint. It must NOT expand into a broader review-mode redesign.

---

## 5. Impact / Side-Effect Notes (update-mode)

- Changes are **content edits to existing technique + resource files** — additive-preferred (add a canonical scoping rule + guard), plus a correction to the two-dot commands in `review-baseline-state.md` and `strategic-review/review-scope.md`.
- No activity add/remove ⇒ transition/reachability integrity unaffected.
- Variable integrity: may introduce a canonical authored-file-set output (e.g. an authoritative changed-files list) consumed downstream; to be finalized in requirements-refinement / drafting.
- Reference integrity: no technique/resource files removed.

---

## 6. Context Loading — Schema System & Format Literacy (update mode)

**Reference baseline:** In update mode the target workflow (`work-package`) **is** the pattern reference (pattern-analysis skipped per update-mode-guide). The schema system was internalized from `schemas/README.md` (six schemas: workflow, activity, technique, condition, state, session-file) and the `work-package` corpus.

### Applicable schema constructs for this change

| Construct | Applies? | Why |
|-----------|----------|-----|
| **Technique** (`inputs[]`, `outputs[]`, `protocol[]`, `rules[]`) | **Yes — primary** | The diff-base fix and the authored-surface / merge-in guard are protocol + rule edits to `review-baseline-state.md`, `strategic-review/review-scope.md`, and (finding-constraint) `review-code.md` / `review-summary.md`. |
| **Resource** (markdown) | **Yes** | `resources/review-mode.md` must state GitHub's changed-files list as the authoritative authored surface + the reconciliation rule. |
| **Workflow variable** | **Maybe** | A canonical authored-file-set output (e.g. `authored_files` / `pr_changed_files`) may need declaring in `work-package/workflow.yaml` `variables[]` if read across activities. Decide in requirements-refinement. |
| **Activity** (add/remove/reorder) | **No** | No new phase; behavior lives in existing review-mode-gated steps. |
| **Checkpoint / Transition / Decision** | **No** | No new user gate or routing; existing review-mode transitions unchanged. |
| **Loop** | **No** | Not applicable. |

### Format conventions observed (work-package corpus)

- **Technique files:** `techniques/<slug>.md` standalone or `techniques/<group>/<sub>.md` + `techniques/<group>/TECHNIQUE.md` base contract. Front-matter `metadata.version` (semver). Body: `## Capability`, `## Inputs` (`### <id>`), `## Outputs` (`### <id>`, optional `#### artifact`), `## Protocol` (`### N. Title` numbered), `## Rules` (`### <rule-slug>`).
- **Resources:** `resources/<slug>.md` with front-matter `name`, `description`, `metadata.version`/`order`/`legacy_id`.
- **Diff commands:** three-dot form written `git diff {$base}...HEAD`; defect sites use two-dot (`{base_sha}..HEAD`, `<base-branch> HEAD`).
- **Versioning:** bump technique/resource `metadata.version` on edit; bump `work-package/workflow.yaml` version on any change.
- **Cross-refs:** `[name](../path.md)` relative links; `group::op` operation references.

`format_literacy_confirmed` and `schema_constructs_confirmed` are **auto-set true** in update mode by the `auto-confirm-literacy` step (no format-literacy / constructs-confirmed checkpoints on the update path).

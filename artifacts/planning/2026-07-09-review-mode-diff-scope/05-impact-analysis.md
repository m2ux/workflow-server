# Impact Analysis — Review-Mode Diff-Scope Fix

**Session:** HS4VHZ · **Workflow:** workflow-design · **Activity:** impact-analysis
**Date:** 2026-07-09 · **Mode:** UPDATE (`is_update_mode = true`) · **Target:** `work-package` (v3.25.0)
**Source of truth:** confirmed design spec (03-requirements-refinement) — GitHub issue [#203](https://github.com/m2ux/workflow-server/issues/203) is guidance only.

> Assessed against the real corpus in the `workflows` submodule at `/home/mike1/projects/main/workflow-server/workflows/work-package`. Every impacted file was read; the removal inventory below is diff-based against current content.

---

## 1. File Inventory (target workflow — impact scope)

The `work-package` workflow holds `workflow.yaml` + `README.md` + `REVIEW-MODE.md`, 15 activities, 15 technique groups + ~24 standalone techniques, and 28 resources. Enumerated here are only the files this change classifies as directly modified, indirectly affected, or verified unaffected-but-checked. All other files are unaffected.

| # | File | Path (under `work-package/`) | Current version | Impact class |
|---|------|------------------------------|-----------------|--------------|
| 1 | `review-baseline-state.md` | `techniques/` | 1.0.0 | **Directly modified** — primary defect site |
| 2 | `strategic-review/review-scope.md` | `techniques/` | 1.1.0 | **Directly modified** — two-dot defect site + finding-constraint rule |
| 3 | `review-diff.md` | `techniques/` | 1.1.0 | **Directly modified** — base-source + merge-in guard |
| 4 | `review-code.md` | `techniques/` | 2.0.0 | **Directly modified** — consume canonical set + finding-constraint rule |
| 5 | `review-summary.md` | `techniques/` | 1.1.0 | **Directly modified** — finding-constraint enforcement at consolidation |
| 6 | `review-mode.md` | `resources/` | 1.4.0 | **Directly modified** — authoritative authored-surface + reconciliation text |
| 7 | `review-test-suite.md` | `techniques/` | 2.0.0 | **Directly modified** — finding-constraint rule (finding producer; spec §5 names it) |
| 8 | `workflow.yaml` | (root) | 3.25.0 | **Directly modified** — version bump only (any change bumps root version) |
| 9 | `05-implementation-analysis.yaml` | `activities/` | 2.10.0 | **Verified unaffected** — no step-binding change needed (see §3) |
| 10 | `12-strategic-review.yaml` | `activities/` | — | **Verified unaffected** — `review-scope` bound bare-string; no remap needed |
| 11 | `strategic-review/TECHNIQUE.md` | `techniques/` | 2.1.0 | **Verified unaffected** — already declares `changed_files` input; contract stands |

**Note on file #7 (`review-test-suite.md`):** the confirmed spec (§5, and refinement Dimension 5 rule 5) names `review-test-suite` among the finding producers that must carry the shared findings-constraint `## Rules` entry. It was not in the intake §3 "target files" shortlist but IS in the confirmed spec's producer set (RR-5). It is included here as a directly-modified file (shared-rule edit only). **This is a divergence from the intake shortlist of 6 → 7 files; flagged in §5 for confirmation.**

---

## 2. Impact Classification (per directly-modified file)

### 2.1 `techniques/review-baseline-state.md` (v1.0.0 → bump)
**Role:** primary diff-base defect site; becomes the canonical producer of the authored surface.

- **Protocol step 3 changed:** `git -C {target_path} diff {base_sha}..HEAD` (two-dot against stored `{base_sha}`) → three-dot against a freshly recomputed merge-base (or GitHub's list). Spec fix bullets 1 & 2.
- **New Output `changed_files`:** the technique gains a canonical `changed_files` output sourced from GitHub's changed-files list (`gh pr view {pr_number} --json files`) — the authoritative authored surface. Lands in the bag under its own id → consumed by the 4 finding producers via same-name binding (RR-3). Requires a new `pr_number` input (or reuse of an existing bag var) to call `gh pr view`.
- **New Protocol step — merge-in guard:** when HEAD is a merge commit or the branch contains base merges, recompute the three-dot set and **log** the merge-in (log-only, no user gate). Spec fix bullet 4.
- **New `## Rules` entries:** `authoritative-authored-surface` (GitHub list is authoritative; never a stored/stale two-dot base) and `merge-in-guard`. Spec fix bullets 1–4.

### 2.2 `techniques/strategic-review/review-scope.md` (v1.1.0 → bump)
**Role:** two-dot defect site + a finding producer.

- **Protocol step 1 changed:** the fenced example block `git diff --name-only <base-branch> HEAD` and `git diff <base-branch> HEAD -- <file>` (two-dot, space form) → three-dot `{base_branch}...HEAD`. It should scope against the authored surface (`{changed_files}`) rather than re-enumerating from a base. Spec fix bullets 1 & 2.
- **New shared `## Rules` entry — findings-constraint:** a finding on a file not in `{changed_files}` is dropped or separated as "pre-existing / not introduced by this PR." Spec fix bullet 5.
- `changed_files` is already a declared input (line 20) — no signature change to consume it.

### 2.3 `techniques/review-diff.md` (v1.1.0 → bump)
**Role:** already three-dot; only the base source and the guard are defective (RR-6).

- **Protocol step 1 changed:** `{$base_branch}` derivation "typically `main`/`master`" (local heuristic) → sourced from the authoritative PR base. Spec fix bullet 1. **No diff-form change** — steps 2/4 already use `{$base_branch}...HEAD` (three-dot).
- **New merge-in guard** reference/step consistent with 2.1. Spec fix bullet 4.

### 2.4 `techniques/review-code.md` (v2.0.0 → bump)
**Role:** finding producer; the `{changed_files}` consumer.

- **Protocol step 1 changed:** "Establish the `{changed_files}` set by running `git diff` for all files changed since the work package started" (unspecified base/range — a defect source) → consume the canonical `{changed_files}` authored surface (produced by `review-baseline-state`) rather than re-deriving it from a bare `git diff`. Spec fix bullets 1 & 3.
- **New shared `## Rules` entry — findings-constraint** (same text as 2.2). Spec fix bullet 5.
- `changed_files` already a declared input (line 12) — no signature change.

### 2.5 `techniques/review-summary.md` (v1.1.0 → bump)
**Role:** consolidation / enforcement point for the findings-constraint.

- **Protocol step 2 augmented:** enforce that every rendered finding lies within the authored set (`{changed_files}`); a finding outside it is dropped or rendered under a clearly-separated "pre-existing / not introduced by this PR" grouping. Spec fix bullet 5 (enforcement at consolidation).
- May need `changed_files` added as an input to `review-summary` (currently it consumes `consolidated_findings` / `review_mode_resource` / `prior_feedback_triage` / `rating_cap`, none of which is the authored set). **This is the one signature addition on a consumer — flagged in §5.**

### 2.6 `techniques/review-test-suite.md` (v2.0.0 → bump)
**Role:** finding producer (spec §5 / RR-5).

- **New shared `## Rules` entry — findings-constraint** (same text as 2.2/2.4). `changed_files` already a declared input (line 12) — no signature change.

### 2.7 `resources/review-mode.md` (v1.4.0 → bump)
**Role:** narrative owner of review-mode behavior.

- **"Implementation Analysis in Review Mode" / "Baseline Capture" (lines 98–128) augmented:** state that the authored file set is GitHub's changed-files list (three-dot / `gh pr view --json files`) — the authoritative authored surface — not a stored two-dot base. Spec fix bullet 1.
- **New reconciliation text:** GitHub's changed-files list is authoritative; a disagreeing (larger) local diff is what is wrong, not the file list — do NOT "correct" the list upward. Spec fix bullet 3.
- **New findings-constraint text** echoing the producers' shared rule, at the "Generating Review Comments / Consolidated Review Format" section. Spec fix bullet 5.

### 2.8 `workflow.yaml` (v3.25.0 → 3.26.0 recommended)
**Role:** root version bump only. No `variables[]` / `rules[]` / activity-reference changes (RR-2: no new workflow variable).

---

## 3. Integrity Checks

### 3.1 Transition-chain integrity — INTACT
No activity is added, removed, reordered, or re-gated (RR-4). All `to:` references across the 15 activities are unchanged. Reachability and the review-mode conditional-transition wiring are untouched.

### 3.2 Reference integrity — INTACT, with one intentional new producer edge
- **No technique or resource file is removed** → no orphaned technique/resource references.
- **Cross-references verified:** `review-summary` → `review-mode#consolidated-review-format` (intact); `review-scope` → `architecture-review` and the `gitnexus-operations` ops (intact); `review-code` → `rust-substrate-code-review` and `gitnexus-operations` (intact). None of these targets change identity.
- **New variable edge (intentional):** `review-baseline-state` becomes the **producer** of `changed_files`. Today `changed_files` is an **input** on 6 techniques (`review-code`, `review-test-suite`, `review-scope`, `strategic-review/TECHNIQUE.md`, `summarize-architecture`, `finalize-documentation/ensure-docs`) and is produced by **NO** technique as an output — it flows into the bag from unspecified upstream context. Making `review-baseline-state` its canonical producer **adds** a producer→consumer edge and removes the current "undeclared source" gap. The 3 review-mode consumers (`review-code`, `review-test-suite`, `review-scope`) resolve it by same-name binding — no per-call rename (RR-3, `canonical-rename-over-args`). The 2 non-review consumers (`summarize-architecture`, `ensure-docs`) run on the create path where `review-baseline-state` does not execute; they retain their existing (unchanged) source of `changed_files` and are **unaffected** — the new producer only populates the bag on the review path.

### 3.3 Step-binding / activity-YAML integrity — NO activity edits required
- `05-implementation-analysis.yaml` binds `review-baseline-state` as a **bare-string** technique (no `outputs` remap). Adding the `changed_files` output under its own id lands it in the bag by same-name binding → **no step-binding deviation needed**; the activity file is unchanged.
- `12-strategic-review.yaml` binds `review-scope` bare-string → unchanged.
- **Caveat (§5):** if `review-baseline-state` needs a `pr_number` input to call `gh pr view` and `pr_number` is not already in the bag at step `05`, a `step.technique.inputs` binding or an upstream producer must supply it. `pr_number` is used later by `review-scope` step 7 and is captured in review mode at `start-work-package`; it is expected to be in the bag by activity 05, but this must be verified in scope-and-draft.

### 3.4 Variable integrity — INTACT
No `workflow.yaml` `variables[]` change (RR-2). The dead output `base_pr_diff` (produced by `review-baseline-state`, consumed by nothing) is noted in §4.

---

## 4. Removal / Replacement Inventory (preservation discipline)

Per the confirmed spec and the corpus read, the fix is **additive-preferred**. There is **no wholesale content block deleted**. The material being *replaced* (old text superseded by corrected text) is inventoried below for explicit confirmation. **Crucially: there is NO literal "diff-scope correction" text block to remove** — a corpus-wide grep for "diff-scope" / "scope correction" found zero matches. The inverted reconciliation is an *emergent behavior from the absence* of an authoritative-surface rule, so "dropping" it (spec bullet 3) is satisfied by **adding** the authoritative-reconciliation rule/text, not by deleting an existing passage.

| # | File | Content replaced (old → new) | Nature |
|---|------|------------------------------|--------|
| R1 | `review-baseline-state.md` step 3 | `git -C {target_path} diff {base_sha}..HEAD` (two-dot) → three-dot merge-base / GitHub list | **Replace** — command corrected |
| R2 | `strategic-review/review-scope.md` step 1 | `git diff --name-only <base-branch> HEAD` and `git diff <base-branch> HEAD -- <file>` (two-dot) → three-dot `{base_branch}...HEAD` scoped to `{changed_files}` | **Replace** — command corrected |
| R3 | `review-diff.md` step 1 | `{$base_branch}` "typically `main`/`master`" heuristic → sourced from authoritative PR base | **Replace** — derivation corrected (diff-form kept) |
| R4 | `review-code.md` step 1 | "running `git diff` for all files changed since the work package started" (unspecified range) → consume canonical `{changed_files}` | **Replace** — source corrected |
| R5 | `resources/review-mode.md` Baseline Capture (98–128) | two-dot / stored-base baseline narrative → GitHub-list authoritative-surface narrative + reconciliation rule | **Replace/augment** — text corrected |

**Content flagged for removal that is genuinely deleted: NONE.** Every item above is a correction-in-place (superseded text replaced by corrected text on the same protocol step / narrative section). No `## Rules` entry, protocol step, input, output, resource section, or cross-reference is *deleted*.

**`base_pr_diff` (dead output) — retention recommendation:** `review-baseline-state` declares output `base_pr_diff` (step 3) consumed by no technique. The two-dot command that produces it is being corrected (R1). RECOMMENDATION: **retain** `base_pr_diff` as an output (repurposed to hold the corrected three-dot diff for later manual comparison, per its declared purpose "noted for later comparison") rather than removing it — removing an output is a signature deletion that would need preservation confirmation, and it is out of the minimal-fix scope. **Flagged in §5** as a judgement call.

**`has_unflagged_removals = false`** — every replaced item is inventoried above; nothing is silently removed.

---

## 5. Divergences & Judgement Calls Flagged for Confirmation

Under delegated design authority, these are resolved to the minimal option with recommendation + rationale; material ones are surfaced:

1. **File count 6 → 7** (intake shortlist named 6; confirmed spec §5/RR-5 names `review-test-suite` as a finding producer). **Recommend: include** `review-test-suite.md` (shared-rule edit only). Rationale: RR-5 explicitly lists it among finding producers; excluding it would leave a finding-constraint gap on test findings. *Minor divergence from intake shortlist — material to the file list, hence flagged.*
2. **`review-summary` gains a `changed_files` input** (the one consumer signature addition). **Recommend: add** the input. Rationale: consolidation enforcement (spec bullet 5) needs the authoritative set; consuming it by same-name binding is the generic-not-overfit choice.
3. **`base_pr_diff` dead output — retain vs remove.** **Recommend: retain** (repurpose to the corrected three-dot diff). Rationale: minimal-fix scope; removal is a signature deletion needing its own preservation confirmation and adds no value to the fix.
4. **`pr_number` availability at activity 05** for the `gh pr view` call. **Recommend: verify in scope-and-draft** that `pr_number` is in the bag by activity 05 (captured at `start-work-package` in review mode); add a `step.technique.inputs` binding only if the verification shows a gap. Rationale: avoids speculatively editing the activity YAML.

None of these expands the fix beyond the confirmed spec's structural surface (no new activity / checkpoint / workflow variable / technique file).

---

## 6. Outcome

- **Edit blast radius is bounded to 8 files:** 7 content files (6 techniques + 1 resource) + a `workflow.yaml` version bump. No activity YAML edits are required (bare-string bindings + same-name output landing).
- **Transitions and technique/resource references are verified intact** — nothing is orphaned or re-wired; the only new wiring is the intentional `changed_files` producer→consumer edge, which *closes* an existing undeclared-source gap rather than breaking anything.
- **No content disappears by accident** — the removal inventory (§4) is entirely correction-in-place; `has_unflagged_removals = false`; the only genuine-deletion candidate (`base_pr_diff`) is recommended for retention and flagged.
- Two checkpoints follow: `impact-confirmed` (scope correctness — 8 files, 7→ file-count divergence) and `preservation-confirmed` (the §4 replace inventory + the `base_pr_diff` retention call).

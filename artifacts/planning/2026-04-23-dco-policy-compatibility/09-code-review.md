# Code Review — PR #109 (DCO Policy Compatibility)

**Activity:** post-impl-review (resume mode, code-review step)
**Diff source:** `git diff workflows...HEAD` in target_path
**Validation surface run:** `npx tsx scripts/validate-workflow-toon.ts work-package` → all pass; `npm run typecheck` → clean; `npx vitest run` → 322 tests passed, 4 skipped.
**Reviewer:** post-impl-review worker (single-pass, resume mode).

---

## Method

Read each of the 14 changed files end-to-end in the target_path worktree. Cross-checked against:

- TOON schemas (the validator script confirms schema conformance).
- The work-package plan in `06-wp-plan.md` (per-task rationale).
- The supporting `dco-provenance` skill (T11) for cross-protocol consistency.
- The variable surface in `workflow.toon` (T1).

Severity ladder (per workflow-server convention): **Critical** = quality-gate failure that blocks merge; **Major** = correctness or contract bug that should be fixed before merge; **Minor** = behavioral wrinkle that should be fixed but is not strictly merge-blocking; **Nit** = cosmetic or wording issue; **Informational** = observation worth recording but not actionable in this PR.

---

## Findings

| ID | Severity | File | Line(s) | Finding |
|----|----------|------|--------:|---------|
| C1 | Minor | `work-package/activities/09-post-impl-review.toon` | 133–150 | **Inverted condition on the `rationale-amendment` checkpoint.** See detail below. **Resolved** in commit `1d490c8` (review-fix-cycle iteration 1). |
| C2 | Nit | `work-package/activities/12-submit-for-review.toon` | 149–163 | **Dead text in `merge-strategy-reminder` message.** See detail below. |
| C3 | Nit | `work-package/README.md` | 3 | **README header still reports `v3.7.0`** while `workflow.toon` declares `version: 3.12.0`. Pre-existing on `workflows` HEAD (not introduced by this PR — the only line this PR touches in `README.md` is L31, the skill-count). Recording as Informational rather than promoting to a fix here because the header drift predates the work package; would be appropriate to fix in a sweep PR. |
| C4 | Informational | `work-package/skills/15-manage-git.toon` | 66–70 | `squash-merge-instruction` example uses `'feat: description (#{pr_number})'` as the commit subject template. The example would benefit from referencing the existing `{type}` interpolation slot consistently (the protocol's own bullet 4 uses `{type}: {description}`, but the `12-submit-for-review` checkpoint message at L151 hard-codes `feat:`). Not a correctness issue — the checkpoint text is illustrative — but worth aligning if a follow-up sweep touches this skill. |

> Promotion to `needs_code_fixes`: per the workflow's `classify-and-route-findings` step rules — any finding at severity `>= Minor` flips the flag to true. C1 is Minor, so **`needs_code_fixes` = true** on the strict reading of the rule. The reviewer's judgement on whether to actually run the review-fix-cycle now or defer the C1 fix to a follow-up sweep is a strategic-review decision; this report sets the flag per the documented bar, and the user remains free to acknowledge the finding without queueing fixes by responding accordingly at the next checkpoint.

---

## Detail: C1 — Inverted condition on `rationale-amendment` checkpoint

### What the diff produces

In `09-post-impl-review.toon`, the rewritten `file-index-table` checkpoint has three options:

| Option ID | Sets `has_flagged_blocks` |
|-----------|--------------------------|
| `rationale-confirmed` | (no effect — variable stays false) |
| `rationale-confirmed-with-issues` | `true` |
| `has-issues` | `true` |

Immediately below, the new `rationale-amendment` checkpoint declares:

```
condition:
  type: simple
  variable: has_flagged_blocks
  operator: "=="
  value: false
```

And its message: *"Please provide any corrections to the agent rationale paragraphs in change-block-index.md, or confirm they are all accurate. Corrections are recorded in manual-diff-review-report.md as your provenance statement."*

### Why the gating reads as inverted

The condition fires when `has_flagged_blocks == false`. That is the state after the user has chosen `rationale-confirmed` ("Rationale confirmed — no issues"). The user has just told the workflow that the rationale paragraphs are accurate; the workflow then asks them, with a 20-second auto-advance, whether they want to provide corrections. In practice the auto-advance default (`all-accurate`) absorbs this case so the user observes no harm — but the gate is doing redundant work.

Conversely, when the user picks `rationale-confirmed-with-issues` (option label: "Rationale confirmed (with corrections) — issues found"; option description: "Provide corrections to any rationale paragraphs and comma-separated block indices with issues"), `has_flagged_blocks` is set to true and the `rationale-amendment` checkpoint does **not** fire. That option's user-stated intent — "I want to provide corrections to the rationale paragraphs" — has no follow-up checkpoint to land those corrections. The downstream `block-interview` checkpoint that fires next is scoped to "issue with this change", which is the per-block issue interview path, not a rationale-amendment path.

### Reading of the wp-plan T5 intent

`06-wp-plan.md` T5 paragraph 2 states the design intent: *"Add a new `rationale-amendment` checkpoint that lets the human correct any agent-written rationale paragraph before the diff goes to automated review."* That intent maps to the `rationale-confirmed-with-issues` option, not to the `rationale-confirmed` option. The condition should therefore gate on the state that means "the user wants to provide corrections" — likely a new boolean (`wants_rationale_amendment`) or simply the inverse of the current condition: `has_flagged_blocks == true` AND the option chosen was `rationale-confirmed-with-issues` (since `has-issues` says "rationale review deferred" — that path explicitly does NOT want amendment).

### Severity rationale

Marked **Minor** rather than Major because:

- The auto-advance default on the firing path absorbs the noisy case (no user-visible failure today).
- The non-firing case loses a UX affordance but does not produce a wrong outcome — the user can still raise rationale corrections at strategic-review's diff-review step, which runs immediately after.
- A clean fix requires deciding between (a) introducing a new boolean variable to capture amendment intent, or (b) restructuring the `file-index-table` options so that "wants amendment" and "has flagged blocks" are independent. Either path is a design choice that should land deliberately, not as a quick patch.

### Suggested resolution (for triage at strategic-review)

Option A — introduce `wants_rationale_amendment` boolean, set by the `rationale-confirmed-with-issues` option, and gate `rationale-amendment` on that boolean. Cleanest semantic split.

Option B — fold the rationale-amendment input into the `file-index-table` checkpoint message itself (free-text response carries both the index list and any rationale corrections), and delete the separate `rationale-amendment` checkpoint. Simpler surface; trades structure for terseness.

Either resolution is a one-activity change with no schema impact.

---

## Detail: C2 — Dead text in `merge-strategy-reminder` message

In `12-submit-for-review.toon` line 151 the `merge-strategy-reminder` checkpoint message ends:

> *"If squash merge is not available on this repo, branch commits land as-is — no signing required."*

The checkpoint's own `condition` (line 153–156) gates the entire message on `squash_merge_available == true`. The user therefore never reads the "if not available" tail because the checkpoint never fires in that state.

**Severity rationale.** This is a Nit because the dead text does not change runtime behavior; the workflow still routes correctly. It is worth tidying — either delete the tail, or split the message into two checkpoints (one for each value of `squash_merge_available`) so the user always sees applicable guidance. The latter is more useful: when `squash_merge_available == false`, the user currently sees **no** merge-strategy reminder at all, which is a quiet UX gap.

---

## Cross-cutting observations (Informational only — not promoted to findings)

These are agent-level reads that the strategic-review activity may choose to act on. They are recorded here for completeness; none are merge-blocking.

1. **Test coverage for the new TOON content is implicit.** No new vitest cases were added in this PR. That is appropriate for workflow-TOON edits — the validator script's schema-binding pass plus the existing `tests/mcp-server.test.ts` integration cases cover the surface (loaded, version detected, activities iterable). The 322 passing tests include the relevant binding cases. See `09-test-suite-review.md`.

2. **Description-hygiene posture.** All touched activity files have a single `description` field on the activity (AP-36/38 conformance); no embedded role-rules ("the worker MUST…"); the new `dco-provenance` skill description is one sentence stating capability (AP-40 conformance). Sweep through this PR is clean against the description-hygiene APs that the workflow-design retrospective just landed.

3. **Naming consistency for new identifiers.** `squash_merge_available`, `context_scope`, `provenance_log_path`, and `dco-sign-off` all follow the existing `snake_case`-for-variables / `kebab-case`-for-step-and-checkpoint-IDs convention. The new skill `25-dco-provenance` follows the `NN-skill-id` file-naming convention. No naming-consistency findings.

4. **Variable-surface arithmetic.** `workflow.toon` reports `variables[87]` after the change. Counted manually against the file: three removed (`unsigned_commits_in_pr`, `resign_unsigned_commits_requested`, `unsigned_commit_list_summary`), two added (`squash_merge_available`, `context_scope`), starting from 88. 88 − 3 + 2 = 87. Arithmetic checks out.

5. **Skill cross-reference count.** `skills/README.md` claims "26 workflow-specific + 6 cross-workflow". Directory listing shows 26 TOON files (00…25). 26 ✓. Cross-workflow references in the README table at L46–51: atlassian-operations, github-cli-protocol, knowledge-base-search, version-control, structural-analysis, portfolio-analysis = 6. ✓.

6. **`code-commits` protocol harness-awareness.** The `15-manage-git.toon` `code-commits[3]` bullet 2 contains harness-specific guidance ("Claude Code adds it automatically — do NOT add it again or it will appear twice"). This is the right place for that note — `manage-git` is the only skill all code-committing activities reference. The wording correctly distinguishes Claude Code from "other assistants that do not auto-inject the trailer". Confirmed against the CLAUDE.md Co-Authored-By convention at the repo root.

---

## Summary table for `classify-and-route-findings`

| Severity | Count | Findings |
|----------|------:|----------|
| Critical | 0 | — |
| Major | 0 | — |
| Minor | 1 | C1 (inverted rationale-amendment condition) |
| Nit | 2 | C2 (dead text in reminder), C3 (README v-string drift, pre-existing) |
| Informational | 1 | C4 (commit-subject template consistency) |

**Variables set by this report:**

- `needs_code_fixes` = **true** (one Minor finding at C1 trips the gate per the activity's strict reading).

---

## Resolution log (review-fix-cycle)

### Iteration 1 — C1 resolved (commit `1d490c8`, 2026-05-19)

Adopted **Option A** from the suggested resolution: introduced a new boolean variable `rationale_confirmed` on the work-package workflow surface (workflow.toon `variables[88]`) and set it from both `rationale-confirmed` and `rationale-confirmed-with-issues` options on the `file-index-table` checkpoint. The `rationale-amendment` checkpoint condition is now `rationale_confirmed == true`, which fires on both rationale-confirming paths and is bypassed on the `has-issues` path (which explicitly defers rationale review). `block-interview`'s condition remains `has_flagged_blocks == true` and is independent.

Files touched on the PR branch (`dco-update-2026-05-18`):

- `work-package/workflow.toon` — variables count `[87] → [88]`; added `rationale_confirmed` entry directly after `has_flagged_blocks`; bumped `version: 3.12.0 → 3.12.1`.
- `work-package/activities/09-post-impl-review.toon` — added `setVariable: rationale_confirmed: true` to `rationale-confirmed` option; extended `rationale-confirmed-with-issues` effect to also set `rationale_confirmed: true`; rewrote `rationale-amendment` condition from `has_flagged_blocks == false` to `rationale_confirmed == true`; bumped `version: 1.10.0 → 1.11.0`.

Verification on `main`:

- `npx tsx scripts/validate-workflow-toon.ts work-package` → all TOON files valid (workflow.toon ID `work-package`, version `3.12.1`, 14 activities; all 14 activity files and all 26 skill files pass).
- `npm run typecheck` → clean (no server source touched).

Variables set by this iteration:

- `needs_code_fixes` = **false** (C1 resolved; no other Minor+ code-review findings remain).
- `needs_test_improvements` = **false** (unchanged; test-suite review had no Minor+ findings).
- `has_critical_blocker` = **false** (unchanged).

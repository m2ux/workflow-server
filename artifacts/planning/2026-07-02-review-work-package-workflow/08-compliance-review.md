# Compliance Review: work-package

**Date:** 2026-07-02
**Workflow:** work-package v3.15.0
**Files audited:** 132 (workflow.yaml, 15 activities, 96 technique files, 26 resources, 3 READMEs)

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 2 |
| Medium   | 5 |
| Low      | 6 |
| Pass     | — |

**Total findings: 13.** No Critical (schema-invalid / structurally broken) findings. The workflow is in strong shape: all 15 activities + workflow.yaml pass schema validation, all `step.technique` references resolve, and binding-fidelity shows zero new drift over baseline. The two High findings are both localized to single technique files.

Method note: findings are grounded in the deterministic guards (`validate-workflow-yaml.ts`, `check-all-refs.ts`, `check-binding-fidelity.ts`) plus direct line-by-line reading of workflow.yaml and all 15 activity YAMLs. The technique-layer sweep relied on the schema validator as authoritative (it enforces AP-42/46/49/59 mechanically); non-deterministic scans were verified against source before inclusion — unverifiable candidates were dropped.

---

## Schema Validation Results (deterministic — authoritative)

- `validate-workflow-yaml.ts workflows/work-package`: **workflow.yaml + all 15 activity files PASS.** One technique file FAILS: `techniques/respond-to-pr-review.md` (3 unanchored protocol references). See Finding H-1.
- `check-all-refs.ts`: **0 unresolved references** across the workflow — every `step.technique` binding resolves through the loader.
- `check-binding-fidelity.ts`: **40 total, 40 baselined, 0 NEW, 0 fixed** — no new binding drift.

---

## High Findings

### H-1 — `respond-to-pr-review.md` fails schema validation (AP-49 / AP-59)
- **File:** `techniques/respond-to-pr-review.md`, Protocol §1 "Fetch Comments" (line 34).
- **Principle/AP:** Design Principle 6 (Never Modify Upward — content must conform to the fixed schema/validator); AP-49 (designator bracing) / AP-59 (code-token backticking).
- **Detail:** The validator reports three unanchored protocol references — `updated_at`, `html_url`, `unresolved_comments`. They occur inside a fenced ```bash block as `jq` JSON field accessors (`.updated_at >= "{$latest_review_date}"`, `html_url: .html_url`) and the literal path `/tmp/unresolved_comments.json`. Whether or not these are semantically bare references, the file **does not pass `validate-workflow-yaml.ts`**, so it violates the schema-conformance gate this workflow must clear before commit.
- **Severity:** High (only file failing deterministic validation; blocks the schema-validation pass).
- **Fix:** Resolve the three tokens so the validator passes — either restructure so the jq field names and the `/tmp/unresolved_comments.json` path are unambiguously code (already fenced, so confirm the validator's tokenizer boundary) or rename/reword to avoid the validator matching them as protocol designators. Re-run `validate-workflow-yaml.ts` to confirm clean.

### H-2 — `implement-task.md` uses an unbound protocol local (AP-58)
- **File:** `techniques/implement-task.md`, Protocol §2 "Pre Edit Impact Check" (lines 35, 37).
- **Principle/AP:** AP-58 (protocol-variable binding hygiene — unbound local); `signature-is-the-contract`.
- **Detail:** Line 35 reads `{$target_symbol}` and line 37 reads `{target_symbol}`, but **no protocol step produces / binds `{$target_symbol}`**, and `target_symbol` is not a declared input (the inputs are `current_task`, `test_plan`). The affected symbol lives inside `{current_task}` prose but is never extracted into a named binding, so the agent has no value to resolve when invoking `gitnexus-operations::impact` / `::context`. (Also a spelling split — one read carries the `$` sigil, the other does not.)
- **Severity:** High (a real binding gap — the impact/context calls interpolate a variable that never gets a value).
- **Fix:** Add a producing step in §1 or §2 that names the symbol — e.g. "Determine the primary edit target `{$target_symbol}` from `{current_task}`" — then read it bare as `{target_symbol}` in both call sites. Alternatively declare `target_symbol` as a component/derived input.

---

## Medium Findings

### M-1 — Redundant same-technique steps in `review-fix-cycle` loop (AP-73 collapse)
- **File:** `activities/10-post-impl-review.yaml`, loop `review-fix-cycle`, steps `regenerate-index` (line 117) and `re-manual-diff-review` (line 121).
- **AP:** AP-73(a)/AP-64-collapse — two consecutive steps bind the SAME technique (`review-diff`) with no distinguishing structural field (no `when`, no `technique.inputs`/`outputs` deviation, no intervening checkpoint).
- **Severity:** Medium.
- **Fix:** Collapse the two `review-diff` steps into one (the technique regenerates the index and reviews the diff in one pass), or, if the two invocations are genuinely distinct phases, add the distinguishing structural field / input deviation that justifies the split.

### M-2 — Redundant `declare-context-scope` set shadowed by the following checkpoint (AP-81-adjacent)
- **File:** `activities/04-research.yaml`, control step `declare-context-scope` (lines 85–90) immediately preceding checkpoint `context-scope-declaration` (lines 91–115).
- **AP:** Double-provision of one decision — the value-less `set target: context_scope` (no `value:`) is immediately overwritten by the checkpoint's option effects that set `context_scope` to `repo-only`/`web-retrieval`/`mixed`. The set carries no value and does no work.
- **Severity:** Medium.
- **Fix:** Delete the `declare-context-scope` step; the `context-scope-declaration` checkpoint is the single authoritative setter.

### M-3 — Checkpoint messages restate structure / narrate rationale (AP-36)
- **Files & locations:**
  - `activities/02-design-philosophy.yaml`, `classification-and-path-confirmed` message (line 18): "auto-advancing in 30s" restates `autoAdvanceMs`; the "(simple: … moderate: … complex: …)" clause enumerates a mode→path mapping already encoded in the option effects.
  - `activities/09-lean-coding-audit.yaml`, `audit-findings-confirmed` message (line 24): re-lists artifact contents ("findings under each taxonomy bucket (delete/stdlib/native/yagni/shrink) … are in review-findings.md, and the … debt ledger … is in debt-ledger.md") — content owned by the producing techniques' `## Outputs` (AP-36 / AP-79-adjacent).
  - `activities/04-research.yaml`, `context-scope-declaration` message (line 93): "This determines the provenance scope recorded in commit trailers and the provenance log" — downstream-consumer rationale.
- **AP:** AP-36 (rationale / process narration / restatement of adjacent structure in message fields).
- **Severity:** Medium.
- **Fix:** Trim each message to the decision the user is making; drop the auto-advance restatement, the artifact-content re-listing, and the downstream-consumer rationale.

### M-4 — `jira-project-selection` checkpoint carries no recorded effect (AP-82)
- **File:** `activities/01-start-work-package.yaml`, checkpoint `jira-project-selection` (lines 229–243).
- **AP:** AP-82 — both options (`select` / `specify`) set NO variable via `effect` and lead to the same next step; the checkpoint records nothing structurally, so it is guidance, not a decision gate.
- **Severity:** Medium.
- **Fix:** Either give the options an effect that captures the chosen project (a `setVariable` the create-issue step consumes) so it becomes a genuine gate, or convert it to an `action: message` if the selection is handled interactively without a recorded branch.

### M-5 — Comprehension-artifact message narrates flow + hardcodes an out-of-planning path (AP-36 / AP-61 / AP-57)
- **File:** `activities/15-codebase-comprehension.yaml`, step `create-comprehension-artifact` message (line 15).
- **AP:** AP-36/AP-61 — the message names a downstream checkpoint and narrates the flow ("Proceeding to mandatory initial deep-dive — comprehension-sufficient checkpoint surfaces only when unresolved questions remain"); AP-57 — the literal path `.engineering/artifacts/comprehension/{artifact_name}` is embedded in the message.
- **Severity:** Medium.
- **Fix:** Reduce the message to "Created/Updated the comprehension artifact"; drop the checkpoint/flow narration; if the comprehension-artifact directory is a fixed convention, route the path through a defaulted variable rather than a message literal.

---

## Low Findings

### L-1 — `set` action descriptions restate the target/value (AP-36)
- **Files:** `activities/01-start-work-package.yaml` line 98 (`gitnexus_indexed` set — "Set gitnexus_indexed=true on successful index."); `activities/02-design-philosophy.yaml` line 145 ("Force needs_elicitation=false in review mode."); `activities/10-post-impl-review.yaml` lines 111, 115 ("Reset code-fix flag before re-review." / "Reset test-improvement flag before re-review.").
- **AP:** AP-36 — the description restates the `target`+`value` the structure already encodes. (These `set`s themselves are legitimate: AP-67 exclusion (b) caller-specific value from a generic wrapper op, and exclusion (c) control-flow flag resets.)
- **Severity:** Low.
- **Fix:** Drop the descriptions; the `target`/`value`/`when` already say it.

### L-2 — Validate message carries a justification tail (AP-37)
- **File:** `activities/01-start-work-package.yaml`, `verify-signing-precondition` validate message (line 104).
- **AP:** AP-37 — after stating the misconfiguration and the fix, the trailing "The workflow does not modify your git configuration." is explanatory tail (the git-config scope-boundary is already a workflow rule, line 21).
- **Severity:** Low.
- **Fix:** Trim to the diagnostic + what the user must do; the scope-boundary rule already lives in `rules.workflow`.

### L-3 — "Resolved Assumptions" message tail narrates process/phase (AP-36 / AP-61)
- **Files:** `activities/04-research.yaml` line 84, `activities/05-implementation-analysis.yaml` line 69, `activities/08-implement.yaml` line 98 — "…were resolved through code analysis during this phase."
- **AP:** AP-36 (process narration) / AP-61-flavored ("during this phase"). Systemic: the same message pattern recurs in three activities.
- **Severity:** Low.
- **Fix:** "**Resolved Assumptions** — resolved through code analysis." Drop "during this phase".

### L-4 — `bind-planning-folder-path` set message carries narration (AP-36)
- **File:** `activities/01-start-work-package.yaml`, `bind-planning-folder-path` message (line 404).
- **AP:** AP-36 — "Never anchored to target_path or any CWD" is guidance narration on a control `set`. The artifact-location discipline is already the `agent-conduct.operational-discipline-artifact-location` rule.
- **Severity:** Low.
- **Fix:** Reduce to what the value is; the location invariant lives in the rule.

### L-5 — `document-philosophy` message states file creation mechanics (AP-66-adjacent)
- **File:** `activities/02-design-philosophy.yaml`, `document-philosophy` action message (line 67): "Created: design-philosophy.md".
- **AP:** AP-66-adjacent — a "<file> created" mechanical statement; the artifact's existence is encoded by the bound technique's `## Outputs`.
- **Severity:** Low.
- **Fix:** If a user-facing cue is wanted, state the value ("Design philosophy recorded for reference"); otherwise omit.

### L-6 — `review-received` polling checkpoint records nothing on the "waiting" branch (AP-82-adjacent)
- **File:** `activities/13-submit-for-review.yaml`, checkpoint `review-received` (lines 217–226).
- **AP:** AP-82-adjacent — the `no-waiting` option sets no variable; the checkpoint is a wait/proceed poll. Defensible as a genuine gate (proceed to comment-processing vs. keep waiting), so noted at Low rather than a firm demote.
- **Severity:** Low.
- **Fix:** Confirm from run traces whether the loop-back is ever exercised; if it is always answered "yes", demote to an `action: message` + proceed.

---

## Convention Conformance Findings

Pass. Sampled activities follow `NN-name.yaml` naming, present-then-checkpoint placement, inline `kind: checkpoint`/`kind: loop` steps (no parallel `checkpoints[]`/`loops[]` arrays), and structured `when`/`condition` gates. `techniques.activity: [variable-binding]` is correctly hoisted at the workflow level (AP-75), and `scatter-gather` correctly stays activity-scoped on the fan-out activities (05, 07, 08) — no AP-69 overlap with step bindings.

## Rule Hygiene Findings

Pass, with one observation. `workflow.yaml` `rules` is correctly partitioned by audience (`workflow` / `activity`) and the activity-level rule (line 27) is the sanctioned progress-tracker directive (worker-facing, correctly in `rules.activity`). No activity carries a prose `rules:` block (AP-62 clean). The `rules.workflow` lean-coding entries (`safety-floor-never-simplified`, `report-before-apply`, `leanness-reported-honestly`, `complementary-not-duplicative-with-strategic-review`) are orchestrator-scoped invariants — appropriately placed. Observation: no contradictions, restatements, or flat-prefix groupings detected.

## Rule Enforcement Findings

Pass. Critical constraints are backed by structure: the safety floor is validated by the `validate-safety-floor` action in the simplification loop (09, line 66); DCO attestation is a blocking checkpoint (13, `dco-sign-off-confirmation`); preconditions are `validate` actions (06 `env-prerequisites`, 08 `verify-preconditions`, 01 `verify-signing-precondition`); mode/path behaviour is expressed as boolean variables + `condition`/`when` gates and checkpoint `effect.setVariable`, not prose.

## Anti-Pattern Findings

Covered inline above. No instances of AP-65 (authored `artifacts[]`), AP-64 `description`/`name` on bound steps, AP-68 (intra-step input self-reference), AP-69, AP-71 (misfiled worker/orchestrator rules), or AP-76 (README transcription) were found. AP-64 loop-`name` carve-out correctly honored across all loops. AP-73 mostly clean (reconcile prime+loop and interview prime+loop patterns are documented exceptions); the one genuine collapse candidate is M-1.

## Tool-Technique-Doc Consistency Findings

Pass. All `step.technique` references resolve (`check-all-refs.ts`, 0 unresolved). Raw tool names are confined to the wrapping ops; techniques reference `gitnexus-operations::impact/context/detect-changes` via canonical hyperlinks (verified in `implement-task.md`, `respond-to-pr-review.md`). Both READMEs (root + activities/) carry orientation only — no step/checkpoint/variable/rule transcription (AP-76 clean), no per-activity estimated times.

## Recommended Fixes (prioritized)

1. **High — H-1:** Make `respond-to-pr-review.md` pass `validate-workflow-yaml.ts` (resolve `updated_at` / `html_url` / `unresolved_comments`).
2. **High — H-2:** Bind `{$target_symbol}` in `implement-task.md` before its impact/context reads.
3. **Medium — M-1:** Collapse the duplicate `review-diff` steps in `10-post-impl-review.yaml`'s `review-fix-cycle`.
4. **Medium — M-2:** Delete the shadowed `declare-context-scope` set in `04-research.yaml`.
5. **Medium — M-3, M-5:** Trim checkpoint/message narration in 02, 04, 09, 15.
6. **Medium — M-4:** Give `jira-project-selection` a recorded effect or demote to a message.
7. **Low — L-1…L-6:** Strip `set`/validate/message description narration; normalize the recurring "Resolved Assumptions" message tail.

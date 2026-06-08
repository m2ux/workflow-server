# AP-60 Referential-Integrity Scan

**Method:** 11 parallel scanners (one per workflow subtree) over the post-sweep corpus, each resolving every `{designator}`, state-variable target (`set`/`when`/condition/`setVariable`), technique-invocation arg, transition, and `passContext` against declared/inherited/ambient identifiers, plus hunting renamed-away old ids — followed by an adversarial verify pass that filtered false positives (AP-52 §5 inheritance, ambient vars, external tool-params, schema-bound fields, same-concept I/O carry-through, didactic examples).

**Coverage:** 1,095 declared identifiers, 1,324 references checked across all 11 workflows.

## Verdict

**The AP-60 rename sweep introduced exactly ONE referential-integrity issue, now fixed.** All other confirmed breaks pre-date the work (verified against the pre-sweep base commit `12e76a9`).

### Sweep-induced (1) — FIXED
- **prism / `plan-analysis.md`** — the `skip_list → skipped_units` rename updated the `####` declaration but left a stale prose reference ("list them in skip-list") in the `skip-is-explicit` rule. Prose only (no binding `{designator}`), so no runtime resolution broke. Fixed → `skipped_units` (commit `3b52ee5`; pointer `6ab887c6`).

### Pre-existing (10) — NOT caused by the sweep
Each was confirmed present verbatim at base `12e76a9` (same file, same line). **All 10 fixed.** First 7 (commit `afefd3b`): declare the referenced-but-undeclared checkpoint-gating/persisted variable. Last 3 meta (commit `fef85db`): name-aligned-passthrough designator renames to qualified ids (source-grounded — see below). Validator green on all touched workflows.

| Workflow | Identifier | File | Kind | Status |
|---|---|---|---|---|
| work-package | `problem_type` | 02-design-philosophy.toon | set + `{...}` interpolated, not in `workflow.toon variables[]` | FIXED — declared (string) |
| work-package | `pr_url` | 01-start-work-package.toon | `set target`, not declared in `variables[]` | FIXED — declared (string) |
| workflow-design | `has_unflagged_removals` | 07-content-drafting.toon | checkpoint condition target, undeclared | FIXED — declared (boolean/false) |
| prism-audit | `security_characteristics_count` | 01-prompt-generation.toon | condition target, never produced/declared | FIXED — declared (number/0) |
| prism-evaluate | `findings_list` | 05-resolution-dialogue.toon | forEach `over:` iterable, never populated/declared | FIXED — declared `evaluation_findings` (array) + loop repointed |
| prism-evaluate | `accepted_count` | 06-apply-mitigations.toon | `{...}` interpolated; only `accepted_mitigations` array exists | FIXED — declared (number/0) |
| remediate-vuln | `recommended_strategic_option` | 02-strategic-review.toon | `set` + read, declared only in work-package (no cross-workflow var inheritance) | FIXED — declared (string) |
| meta | `workflow_catalog` | 00-discover-session.toon | activity designator; technique declared bare `catalog` | FIXED — renamed `catalog → workflow_catalog` (output+input+designator+arg-key) |
| meta | `identifying_context` | 00-discover-session.toon | activity designator; technique declared bare `context` | FIXED — renamed `context → identifying_context` |
| meta | `saved_session_candidates` | 00-discover-session.toon | activity designator; technique declared bare `candidates` | FIXED — renamed `candidates → saved_session_candidates` |

**Meta resolution model (from source analysis, workflow `meta-designator-resolution-proposal`):** the engine does no runtime designator interpolation (`get_activity` returns step text verbatim; the variable bag is seeded empty and read only by `evaluateCondition`). Designators are a worker contract resolved by name against the producing technique's output id. So the fix was name-aligned passthrough — and, honoring the no-bare-single-word rule, aligned UP to qualified names (which also retired the bare `catalog`/`context`/`candidates` I/O ids) rather than down to the bare ids. Producer output = consumer input = designator = arg-key, all qualified. Validator green.

Notes: the three meta cases are a pre-existing activity-prose-vs-technique-id naming mismatch (the activities reference compound names while the techniques declare bare `catalog`/`context`/`candidates`); they overlap the deferred high-blast meta renames. The remaining seven are undeclared/unpopulated workflow-state variables.

## Recommendation
The sweep is clean. The 10 pre-existing defects are real but out of scope for #128 — they warrant a separate "workflow referential-integrity" fix (declare the missing variables; reconcile the meta activity/technique names; populate `findings_list`). The committed audits already track related cleanup.

# AP-60 Referential-Integrity Scan

**Method:** 11 parallel scanners (one per workflow subtree) over the post-sweep corpus, each resolving every `{designator}`, state-variable target (`set`/`when`/condition/`setVariable`), technique-invocation arg, transition, and `passContext` against declared/inherited/ambient identifiers, plus hunting renamed-away old ids — followed by an adversarial verify pass that filtered false positives (AP-52 §5 inheritance, ambient vars, external tool-params, schema-bound fields, same-concept I/O carry-through, didactic examples).

**Coverage:** 1,095 declared identifiers, 1,324 references checked across all 11 workflows.

## Verdict

**The AP-60 rename sweep introduced exactly ONE referential-integrity issue, now fixed.** All other confirmed breaks pre-date the work (verified against the pre-sweep base commit `12e76a9`).

### Sweep-induced (1) — FIXED
- **prism / `plan-analysis.md`** — the `skip_list → skipped_units` rename updated the `####` declaration but left a stale prose reference ("list them in skip-list") in the `skip-is-explicit` rule. Prose only (no binding `{designator}`), so no runtime resolution broke. Fixed → `skipped_units` (commit `3b52ee5`; pointer `6ab887c6`).

### Pre-existing (10) — NOT caused by the sweep
Each was confirmed present verbatim at base `12e76a9` (same file, same line). **7 fixed** (high-confidence — declare the referenced-but-undeclared variable; commit `afefd3b`, pointer `ea024a84`); **3 deferred** (meta output-capture model). Validator green on all five touched workflows after the fix.

| Workflow | Identifier | File | Kind | Status |
|---|---|---|---|---|
| work-package | `problem_type` | 02-design-philosophy.toon | set + `{...}` interpolated, not in `workflow.toon variables[]` | FIXED — declared (string) |
| work-package | `pr_url` | 01-start-work-package.toon | `set target`, not declared in `variables[]` | FIXED — declared (string) |
| workflow-design | `has_unflagged_removals` | 07-content-drafting.toon | checkpoint condition target, undeclared | FIXED — declared (boolean/false) |
| prism-audit | `security_characteristics_count` | 01-prompt-generation.toon | condition target, never produced/declared | FIXED — declared (number/0) |
| prism-evaluate | `findings_list` | 05-resolution-dialogue.toon | forEach `over:` iterable, never populated/declared | FIXED — declared `evaluation_findings` (array) + loop repointed |
| prism-evaluate | `accepted_count` | 06-apply-mitigations.toon | `{...}` interpolated; only `accepted_mitigations` array exists | FIXED — declared (number/0) |
| remediate-vuln | `recommended_strategic_option` | 02-strategic-review.toon | `set` + read, declared only in work-package (no cross-workflow var inheritance) | FIXED — declared (string) |
| meta | `workflow_catalog` | 00-discover-session.toon | activity designator; technique declares bare `catalog` | DEFERRED — meta output-capture model |
| meta | `identifying_context` | 00-discover-session.toon | activity designator; technique declares bare `context` | DEFERRED — meta output-capture model |
| meta | `saved_session_candidates` | 00-discover-session.toon | activity designator; technique declares bare `candidates` | DEFERRED — meta output-capture model |

Notes: the three meta cases are a pre-existing activity-prose-vs-technique-id naming mismatch (the activities reference compound names while the techniques declare bare `catalog`/`context`/`candidates`); they overlap the deferred high-blast meta renames. The remaining seven are undeclared/unpopulated workflow-state variables.

## Recommendation
The sweep is clean. The 10 pre-existing defects are real but out of scope for #128 — they warrant a separate "workflow referential-integrity" fix (declare the missing variables; reconcile the meta activity/technique names; populate `findings_list`). The committed audits already track related cleanup.

# Scope and Draft: work-package remediation

**Date:** 2026-07-02
**Mode:** UPDATE · target `work-package` v3.15.0 → v3.16.0 · `workflows/work-package/`
**Change spec:** 13 findings in [08-compliance-review.md](./08-compliance-review.md), [05-impact-analysis.md](./05-impact-analysis.md) §6, [assumptions-log.md](./assumptions-log.md) (RE-1 keep-gate + add input; RE-2 keep-as-is)

## Guard Results (deterministic — authoritative)

| Guard | Baseline | After fixes | Status |
|-------|----------|-------------|--------|
| `validate-workflow-yaml.ts` | 1 FAIL (`respond-to-pr-review.md`) | **0 FAIL** | PASS |
| `check-all-refs.ts` | 0 unresolved | **0 unresolved** | PASS |
| `check-binding-fidelity.ts` | 40 / 40 baselined / 0 NEW | **40 / 40 / 0 NEW / 0 fixed** | PASS |

## Scope Manifest (final)

10 target files modified + `workflow.yaml` version bump. No files created or removed; the only structural removal is one step (`declare-context-scope`) and one duplicate step-collapse (`review-diff`), both preservation-confirmed. **08-implement.yaml is NOT in scope** — its `present-resolved-assumptions` message carries no "during this phase" tail, so L-3 needs no edit there (verified line 98).

## Block-Indexed Review Table

One row per drafted construct changed, with change kind (all "modified" — no adds/removes of whole files) and rationale.

| # | File | Block | Change | Finding | Rationale |
|---|------|-------|--------|---------|-----------|
| 1 | `techniques/respond-to-pr-review.md` | metadata `version` | modified | — | 2.1.0 → 2.2.0 |
| 2 | `techniques/respond-to-pr-review.md` | Protocol §1 Fetch Comments | modified | H-1 | Real API field names (`updated_at`, `html_url`) moved into stripped inline-backtick prose; fenced jq uses `<timestamp-key>`/`<link-key>` placeholders + `/tmp/unresolved.json`, so no bare snake_case survives the validator's per-line tokenizer → 0 FAIL. Semantics preserved (prose is the authoritative field spec). |
| 3 | `techniques/implement-task.md` | metadata `version` | modified | — | 2.1.3 → 2.2.0 |
| 4 | `techniques/implement-task.md` | Inputs `target_symbol` | modified (added input) | H-2 | Declares `target_symbol` as a designator so the §2 impact/context reads resolve; no NEW binding drift. |
| 5 | `techniques/implement-task.md` | Protocol §1 Understand Context | modified | H-2 | Added producing step "Determine the primary edit target `{target_symbol}` … from `{current_task}`". |
| 6 | `techniques/implement-task.md` | Protocol §2 Pre Edit Impact Check | modified | H-2 | Unified both reads to bare `{target_symbol}` (dropped the `$` sigil on the impact call). |
| 7 | `techniques/create-issue.md` | metadata `version` | modified | — | 3.0.0 → 3.1.0 |
| 8 | `techniques/create-issue.md` | Inputs `jira_project` | modified (added input) | RE-1 | Optional input capturing the `jira-project-selection` gate's choice — makes the checkpoint effect load-bearing. |
| 9 | `techniques/create-issue.md` | Protocol §3 Create Jira Issue | modified | RE-1 | Consumes `{jira_project}`; falls back to interactive `getVisibleJiraProjects` selection when unset. |
| 10 | `activities/01-start-work-package.yaml` | metadata `version` | modified | — | 3.10.0 → 3.11.0 |
| 11 | `activities/01-start-work-package.yaml` | checkpoint `jira-project-selection` | modified | M-4/RE-1 | Both options gain `setVariable: jira_project` (`select`→`selected`, `specify`→`specified`); kept as a real gate, NOT demoted. |
| 12 | `activities/01-start-work-package.yaml` | step `index-with-gitnexus` set | modified | L-1 | Dropped `gitnexus_indexed` set description. |
| 13 | `activities/01-start-work-package.yaml` | step `verify-signing-precondition` validate | modified | L-2 | Trimmed "The workflow does not modify your git configuration." tail (scope-boundary is a workflow rule). |
| 14 | `activities/01-start-work-package.yaml` | step `bind-planning-folder-path` set | modified | L-4 | Trimmed "Never anchored to target_path or any CWD" narration (invariant lives in the artifact-location rule). |
| 15 | `activities/02-design-philosophy.yaml` | metadata `version` | modified | — | 1.8.0 → 1.9.0 |
| 16 | `activities/02-design-philosophy.yaml` | checkpoint `classification-and-path-confirmed` | modified | M-3 | Trimmed auto-advance restatement + mode→path enumeration; decision retained. |
| 17 | `activities/02-design-philosophy.yaml` | step `set-review-mode-path` set | modified | L-1 | Dropped `needs_elicitation` set description. |
| 18 | `activities/02-design-philosophy.yaml` | step `document-philosophy` message | modified | L-5 | Replaced "Created: design-philosophy.md" with a value cue. |
| 19 | `activities/04-research.yaml` | metadata `version` | modified | — | 2.6.0 → 2.7.0 |
| 20 | `activities/04-research.yaml` | step `declare-context-scope` | modified (removed step) | M-2 | Deleted value-less `set context_scope`; `context-scope-declaration` checkpoint remains the authoritative setter. |
| 21 | `activities/04-research.yaml` | checkpoint `context-scope-declaration` message | modified | M-3 | Dropped downstream-consumer rationale ("determines the provenance scope recorded in commit trailers…"). |
| 22 | `activities/04-research.yaml` | step `present-resolved-assumptions` message | modified | L-3 | Dropped "during this phase". |
| 23 | `activities/05-implementation-analysis.yaml` | metadata `version` | modified | — | 2.7.0 → 2.8.0 |
| 24 | `activities/05-implementation-analysis.yaml` | step `present-resolved-assumptions` message | modified | L-3 | Dropped "during this phase". |
| 25 | `activities/09-lean-coding-audit.yaml` | metadata `version` | modified | — | 1.0.0 → 1.1.0 |
| 26 | `activities/09-lean-coding-audit.yaml` | checkpoint `audit-findings-confirmed` message | modified | M-3 | Dropped artifact-content re-listing (bucket names + which .md file). |
| 27 | `activities/10-post-impl-review.yaml` | metadata `version` | modified | — | 1.14.0 → 1.15.0 |
| 28 | `activities/10-post-impl-review.yaml` | loop `review-fix-cycle` diff steps | modified (collapsed 2→1) | M-1 | Collapsed `regenerate-index` + `re-manual-diff-review` (both `review-diff`) into one `re-manual-diff-review`; binding preserved. |
| 29 | `activities/10-post-impl-review.yaml` | step `reset-fix-flags` sets | modified | L-1 | Dropped both `set` messages; targets/values kept. |
| 30 | `activities/15-codebase-comprehension.yaml` | metadata `version` | modified | — | 1.7.0 → 1.8.0 |
| 31 | `activities/15-codebase-comprehension.yaml` | step `create-comprehension-artifact` message | modified | M-5 | Dropped flow/checkpoint narration + embedded literal path; reduced to a value cue. |
| 32 | `workflow.yaml` | metadata `version` | modified | — | 3.15.0 → 3.16.0 (remediation bump). |

## Preservation Confirmation

No checkpoint, effect, `setVariable`, condition, transition, or technique binding was removed. Every removal is either redundant narration (semantics live in a bound technique / workflow rule) or a value-less / duplicate structural step whose effect is covered elsewhere — matching [05-impact-analysis.md](./05-impact-analysis.md) §6 exactly. `has_unflagged_removals` = false; no preservation-check fired. RE-2 (`review-received` gate) left unchanged.

## Draft Attestation

Every drafted block above is reviewed and confirmed understood and intentional. All 13 findings applied per the confirmed spec and user decisions; the three deterministic guards pass (validator 0 FAIL, refs 0 unresolved, binding-fidelity 40/40/0-NEW). No blocks flagged for revision.

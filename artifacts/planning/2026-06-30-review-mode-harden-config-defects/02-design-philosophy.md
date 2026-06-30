# Design Philosophy

**Work Package:** Review-Mode Hardening: Config-Change & Interaction Defects  
**Issue:** #145 - Harden review-mode path against config-change & interaction defects  
**Created:** 2026-06-30

---

## Problem Statement

The `work-package` workflow's review-mode path reviews a pull request by reading the proposed change in isolation and judging whether the newly written lines are correct. That frame is too narrow: it missed a real, merge-rated defect where a single-line configuration change was locally correct but globally harmful — it altered the behaviour of unrelated, untouched code and caused unbounded accumulation of orphan storage records on every routine governance close.

Five distinct gaps combined to let the defect through:

1. **Unread prior feedback** — another automated reviewer had flagged the exact problem on the same PR nineteen days earlier; the comment was never ingested or rebutted before the verdict.
2. **No config blast-radius trace** — a config/type setting changed, but the review never traced the change through the dependent code it silently re-governs.
3. **No lifecycle/conservation check** — nothing proved that every created record has a matching cleanup on every path, not just the path shown in the diff.
4. **Severity scale blind to "correct-but-harmful"** — a change that is technically correct yet causes unbounded growth had no axis on the severity scale, so it was rated safe.
5. **Reported failures / untested variants silently downgraded** — a runtime error reported in the field and an untested code variant were never elevated to findings that must be explained.

### System Context

The change set lives in the workflow definition layer of the workflow-server (the `workflows` worktree / submodule), not the TypeScript server source. The affected surface is the review-mode path of the `work-package` workflow and its supporting techniques:

- The PR-review / code-review activities and their techniques (where verdicts are formed).
- The structural review pass (where a lifecycle/conservation ledger would live).
- The severity model used to rate findings.
- The reported-failure triage and multi-instance coverage gate.

These are authored as workflow/technique definitions and validated by the three-layer E2E harness (deterministic walk, definition lint, agent smoke-run).

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | High |
| Scope | Every review-mode run of the `work-package` workflow; by extension every PR judged through it |
| Business Impact | Without it, the review process keeps rating "locally correct, globally harmful" config changes as safe to merge, re-admitting the exact class of defect that already shipped — including ignoring prior reviewer warnings and untested-variant failures |

---

## Problem Classification

**Type:** Inventive Goal (improvement goal — strengthen an existing capability so it catches a class of defect it currently misses)

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [x] Prevention goal

**Complexity:** Complex

**Rationale:** The defect's root cause is well understood (it was reconstructed from a real review), so the *cause* is not in question. But the remedy is not a single direct fix: it is five coordinated augmentations spread across multiple review activities, techniques, the severity model, and the coverage gate, all of which must compose without regressing the existing review path and must be backed by the E2E harness (walk + lint + smoke). That breadth and cross-cutting coordination, plus the need to preserve workflow fidelity and binding correctness, classify it as complex even though each individual augmentation is bounded.

---

## Workflow Path Decision

**Selected Path:** Skip optional activities (well-defined issue — proceed directly to comprehension and planning; no requirements elicitation, no research)

**Activities Included:**
- [ ] Requirements Elicitation
- [ ] Research
- [x] Codebase Comprehension
- [x] Plan & Prepare

**Rationale:** The issue is already fully specified: the five augmentations, their motivating defect, and the target review-mode surface are enumerated and agreed. Requirements are clear, so elicitation adds nothing; the patterns (blast-radius tracing, conservation ledgers, impact-based severity, prior-feedback ingestion, coverage gating) are familiar review-engineering practice rather than open research questions, so research adds nothing. The remaining risk is entirely in *where and how* the augmentations bind into the existing review-mode definitions — a codebase-comprehension and planning concern, not a discovery concern. Hence `skip-optional`: keep the path lean and move to comprehending the current review path before planning the changes. The underlying complexity classification stays `complex` and codebase comprehension remains required.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | 15-30m agentic for this activity; whole work package estimated 1-4h agentic implementation plus human review |
| Technical | Changes confined to workflow/technique definitions in the `workflows` worktree; server `src/`, `schemas/`, and TOON definitions are out of scope unless explicitly requested. Must preserve workflow fidelity, step-binding purity, and AP conventions |
| Dependencies | The three-layer E2E harness must cover the new behaviour (walk baselines, lint, smoke); changes to the `workflows` submodule should be isolated in a dedicated worktree |
| Resources | Single-author agentic work; checkpoints surfaced to the user for material gates only |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Prior PR feedback is ingested and rebutted before a verdict | Review path includes an ingest-and-rebut step over existing PR comments | Present and exercised in smoke run |
| Config/type changes get a blast-radius trace | A config-change blast-radius check exists in the review path | Traces dependents beyond the diff |
| Lifecycle conservation is proven | Structural pass includes a create/cleanup ledger over all paths | Flags unmatched creation as a finding |
| Severity captures "correct-but-harmful" | Severity model gains impact-based axes (e.g. unbounded growth) | Such a change is rated above "safe" |
| Reported failures / untested variants are findings | Reported-failure triage + multi-instance coverage gate exist | Neither is silently downgraded |
| No regression to existing review path | E2E walk + lint + smoke | All green; baselines updated intentionally |

---

## Design Decisions (if applicable at this stage)

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| Workflow path | Full workflow / Elicitation only / Research only / Skip optional | Skip optional | Issue fully specified; remaining risk is binding/placement, addressed in comprehension + planning |
| Where the changes live | Server source vs workflow/technique definitions | Workflow/technique definitions | The behaviour is authored in the review-mode workflow path, not the TS server |

---

## Notes

- The complexity classification (`complex`) and the path gating (`simple`/skip-optional) are intentionally distinct: the work is complex in breadth and coordination, but the *discovery* surface is small, so optional discovery activities are skipped while codebase comprehension is retained.
- Carry forward to comprehension: identify exactly which review-mode activities/techniques own each of the five augmentations, and confirm binding points before planning edits.
- Open questions are tracked in `02-assumptions-log.md`.

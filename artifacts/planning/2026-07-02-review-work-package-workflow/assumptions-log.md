# Assumptions Log

> work-package v3.15.0 remediation · review-work-package-workflow · updated 2026-07-02

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence.

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| RE-1 | Requirements Refinement | Checkpoint Necessity | M | M-4 `jira-project-selection` should be given a recorded `effect.setVariable` (capturing the chosen project) to become a genuine gate, rather than demoted to `action: message` — rationale: the create-issue step downstream could consume a captured project variable, making the selection structurally load-bearing | User interview → impact-analysis verification → user decision | **Resolved (final):** KEEP the `jira-project-selection` checkpoint as a real decision gate AND add a `jira_project` input to the `create-issue` technique so the option's `setVariable` effect is load-bearing (consumed downstream). Do NOT demote to `action: message`; do NOT leave a bare dead variable. Impact-analysis confirmed `create-issue.md` §3 currently selects the project interactively with no `jira_project` input (no structural consumer), so the consumer input must be added for the effect to be genuine. Supersedes the earlier "branch (a) bare setVariable, fallback to demote" caveat. |
| RE-2 | Requirements Refinement | Checkpoint Necessity | L | L-6 `review-received` polling checkpoint should be kept as a genuine wait/proceed gate rather than demoted to `action: message` + proceed — rationale: the loop-back models "reviewer hasn't responded yet", which is a real external-state poll; demotion is only safe if run traces show the waiting branch is never exercised | User interview | Confirmed: branch (a) — keep the gate as-is (no demote). Report declines a firm demote; trace-verification deferred (demote only if traces prove the waiting branch is never exercised). |
| RE-3 | Requirements Refinement | Schema Construct Choice | L | The remaining 11 findings (H-1, H-2, M-1, M-2, M-3, M-5, L-1, L-2, L-3, L-4, L-5) each have a single concrete report-specified fix with no decision space — treated as determined, not open | Report `08-compliance-review.md` | Validated (schema/convention/consistency-resolvable; no stakeholder input needed) |

## Wrap-Up

3 assumptions surfaced. RE-3 validated against the compliance report (11 findings determined, no decision space). RE-1 and RE-2 confirmed via user interview:

- **RE-1 (M-4)** — Resolved (final, user decision after impact-analysis verification): KEEP the `jira-project-selection` gate AND add a `jira_project` input to the `create-issue` technique so the `setVariable` effect is consumed downstream. Not demoted; not a bare dead variable. Impact-analysis found no existing consumer in `create-issue.md` (§3 selects the project interactively), so scope-and-draft must add the input to make the effect load-bearing. Supersedes the earlier branch-(a)-with-demote-fallback framing.
- **RE-2 (L-6)** — Confirmed branch (a): keep the `review-received` gate as-is; trace-based demote deferred.

No corrected or invalidated assumptions. Takeaway: the two open judgements were both AP-82-family "does this checkpoint record anything" questions, and both resolve toward preserving/adding a structural record consistent with the remediation's no-behavior-change purpose.

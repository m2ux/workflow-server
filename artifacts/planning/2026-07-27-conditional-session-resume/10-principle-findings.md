# Design Principle Findings — `meta`

**Mode:** update · **Date:** 2026-07-27
**Pass:** principles
**Target:** `meta` v5.9.0 · post-commit walk of `b3dc2506..aea417ec`

Classification only — each Partial or Violation cites the satellite that owns the underlying defect. No finding is re-stated here.

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| P-13 | Low | **#13 Separate Contract from Procedure — Violation.** A Protocol phase hosts a pure projection of a declared Output; the stance forbids trailing phases that only restate an output's identity | `techniques/workflow-engine/detect-resume-intent.md` — Protocol step 2 | [PA-1](10-anti-pattern-findings.md) |
| P-15 | Low | **#15 Phase by Sequenced Outcome — Partial.** The same step 2 carries a Protocol index without a distinct outcome that must complete before the next | `techniques/workflow-engine/detect-resume-intent.md` — Protocol step 2 | [PA-1](10-anti-pattern-findings.md) |
| P-05 | Low | **#5 Maximize Schema Expressiveness — Partial.** README prose restates YAML inventory the declaration already owns; the gate itself is fully formal (declared variable + step gates) | `README.md` — File Structure, `workflow.yaml` entry | [PA-2](10-anti-pattern-findings.md) |
| P-06 | Low | **#6 One Authoritative Home — Partial.** Sub-field sourcing for one Output is homed twice (Output description and Protocol step 4), and the compressed copy is the inaccurate one | `techniques/workflow-engine/scan-saved-sessions.md` — `saved_session_candidates` | [PA-4](10-anti-pattern-findings.md) |

**Finding count:** 4 (all four are the principle-side classification of PA-1, PA-2 and PA-4 — they add no new defects to the session total)

## Resolution

All four clear after the post-update remedia cycle; re-classification returns 29 of 29 principles compliant or not applicable, 0 Partial, 0 Violation.

| ID | Principle | Cleared by |
|----|-----------|------------|
| P-13 | #13 Separate Contract from Procedure | [PA-1](10-anti-pattern-findings.md#resolution) — the pure-projection Protocol phase is gone; the Output description is the sole definition of the boolean |
| P-15 | #15 Phase by Sequenced Outcome | [PA-1](10-anti-pattern-findings.md#resolution) — the remaining single phase is one sequenced outcome |
| P-05 | #5 Maximize Schema Expressiveness | [PA-2](10-anti-pattern-findings.md#resolution) — the README no longer restates YAML inventory |
| P-06 | #6 One Authoritative Home | [PA-4](10-anti-pattern-findings.md#resolution) — sub-field sourcing is homed once, in Protocol |

## Notes

**Compliant — 22 of 29 principles, with the load-bearing ones cited.**

| # | Principle | Verdict | Evidence |
|---|-----------|---------|----------|
| 3 | Define Complete Scope Before Execution | Pass | 8 of 8 [scope manifest](07-scope-manifest.md) items delivered; scope audit records zero drift |
| 4 | Clarify Before Assuming | Pass | A-7 (H risk) batched to Gate 2 rather than assumed — [assumptions log](04-assumptions-log.md) |
| 7 | Convention Over Invention | Pass | New leaves reuse sibling naming, section order, frontmatter, and version shapes |
| 9 | Encode Constraints as Structure | Pass | The precondition is a declared boolean plus five step gates; the prose activity rule that previously carried it was deleted rather than reworded |
| 10 | Non-Destructive Updates | Pass | Four removals classified in [impact § 3](06-impact-analysis.md#3-removals-inventory); the fifth (the activity rule) is the audit-driven R-1 repair recorded in [verified findings](08-verified-findings.md#resolution) |
| 11 | Complete Documentation Structure | Pass | Both README tiers and both resource indexes updated in step with the definitions |
| 14 | Single Source of Truth | Pass | `matched_session` is the one source both gates read; `resume-session` keeps its single `has_saved_state` condition with no compound shadow |
| 17 | Document in Positive Present | Pass | Header, activity table, description, and `outcome[0]` state current behaviour; `outcome[1]`'s else-branch clause is within the "not every English negation" carve-out |
| 18 | Prefer Shared Capability | Pass | Intent detection lands in the shared `meta/techniques/workflow-engine` group, reusable by any client workflow |
| 19 | Name Symbols Affirmatively | Pass | `resume_intent_requested` is an affirmative predicate in `snake_case` |
| 20 | Keep Orchestration in Structure | Pass | Neither new leaf names an activity, checkpoint, gate, or transition after the C-2 / C-3 repairs |
| 21 | Match the Harness Surface | Pass | No harness tool, return shape, or bootstrap path is claimed by any changed file |
| 22 | Modular Over Inline | Pass | Technique and vocabulary each land as their own file; the activity references, never embeds |
| 24 | Keep Session Interaction in Activities | Pass | `detect-resume-intent` is session-blind — input, match, output; the checkpoint that consumes the result stays in the activity |
| 26 | Atomic Techniques; Compose at Activities | Pass | Detection is its own op rather than a second output on `extract-identifying-context` (A-1) |
| 29 | Cite Resource Policy; Do Not Restate It | Pass | Protocol cites the lexicon's matching rule and negative cases without re-authoring either |

**Not applicable.** #1 (ossification stance), #16 (no new designator/parameter surface), #23 (change is committed with a PR open), #27 (no container `TECHNIQUE.md` touched), #28 (no new persisted planning artifact). #2, #8, #12, #25 are session-conduct principles already evidenced by the earlier gates and unaffected by the committed content.

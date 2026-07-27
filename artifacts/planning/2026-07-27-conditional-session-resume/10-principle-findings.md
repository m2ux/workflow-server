# Design Principle Findings — `meta`

**Mode:** update · **Date:** 2026-07-27
**Pass:** principles
**Target:** `meta` v5.9.0 · second post-commit walk of `b3dc2506..8bdc8f0c`

Classification only — each Partial or Violation cites the satellite that owns the underlying defect, or states the defect inline when no catalogue entry fires. No finding is re-stated here.

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| P-11 | Low | **#11 Complete Documentation Structure — Partial.** The file's top five-activity blurb still asserts the pre-change unconditional behaviour — "identify the target client workflow **and any saved session**" — while the counterpart sentence in `meta/README.md` was updated in this same change to "match any saved session **when the request states resume intent**". A reader of the activities index gets a materially wrong statement of the very gate this change introduces. No catalogue entry fires: the defect is the sentence's *accuracy*, not its shape (`readme-orients-not-transcribes` admits an at-a-glance activity sequence, and `avoidance-voice-in-definitions` covers voice, not staleness) | `meta/activities/README.md` — line 5 | Mirror the parent README's clause: "identify the target client workflow and, on stated resume intent, any saved session" |

**Finding count:** 1

This supersedes the first pass's `#11 — Pass` verdict, whose evidence ("both README tiers and both resource indexes updated in step with the definitions") is falsified by line 5. The first pass, the impact analysis (§ removals 4) and the draft attestation all located the unconditional phrasing at line 15 (the `### 00. Discover Session` entry) and corrected it there; line 5 is a third occurrence in the same file that no artifact recorded.

## Resolution

Cleared in the post-update remedia cycle (1 iteration); re-classification returns 29 of 29 principles compliant or not applicable, 0 Partial, 0 Violation.

| ID | Principle | Cleared by |
|----|-----------|------------|
| P-11 | #11 Complete Documentation Structure | `meta/activities/README.md` line 5 now reads "identify the target client workflow and, on stated resume intent, any saved session" — the same clause the activity table row at `meta/README.md` line 20 already carried. All three surfaces that state the gating behaviour now agree |

## Notes

**Principles re-verified against the remediated state.** The first pass's Pass verdicts were re-walked against `8bdc8f0c`, not carried forward. Those whose evidence the remediation commit touched:

| # | Principle | Verdict | Evidence |
|---|-----------|---------|----------|
| 5 | Maximize Schema Expressiveness | Pass | The README structure tree states no YAML inventory counts; the gate is a declared variable plus step gates |
| 6 | One Authoritative Home | Pass | `scan-saved-sessions`'s sub-field sourcing is homed once, in Protocol step 4; the Output description carries shape and meaning only |
| 11 | Complete Documentation Structure | Pass (after remedia) | Both README tiers, both resource indexes, and all three behaviour-stating surfaces now agree |
| 13 | Separate Contract from Procedure | Pass | `detect-resume-intent`'s Protocol is one phase emitting `{resume_intent_requested}`; the Output description is the sole definition of the boolean |
| 15 | Phase by Sequenced Outcome | Pass | Every remaining Protocol index in both changed techniques marks a distinct sequenced outcome |
| 29 | Cite Resource Policy; Do Not Restate It | Pass | Protocol cites the lexicon wholesale by resource link — the correct form for a whole-resource consult (157 such citations across the library), and it re-authors none of the vocabulary, negative cases, or matching rules |

Unchanged Pass verdicts, re-confirmed: #3 (8 of 8 manifest items delivered), #4, #7 (new leaves reuse sibling naming, section order, frontmatter, version shapes; `check-technique-template` clean), #9 (declared boolean plus step gates, prose activity rule deleted), #10, #14 (`matched_session` is the one source both gates read), #17, #18, #19, #20, #21, #22, #24, #26.

**Not applicable.** #1, #16, #23, #27, #28. #2, #8, #12, #25 are session-conduct principles evidenced by the earlier gates and unaffected by the committed content.

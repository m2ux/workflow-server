# Canon quality implementation

The user selects application of the canon review's proposed corrections and improvements. The 95 reconciled candidates contain 93 retained proposals and two rejected proposals. Related proposals share repairs; every candidate receives an explicit implementation disposition. The earlier review and its captured evidence remain historical records.

## Scope and ownership

- Corpus branch: workflow/technique-vocabulary, starting at e70b44778f71d9d699f746f78a16b892531c82d3.
- Dedicated worktree: /home/mike1/projects/dev/workflow-server/.worktrees/workflow/technique-vocabulary. The shared source checkout stays detached at the reviewed revision so other readers retain those bytes.
- Planning record: /home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-10-11-canon-quality-review/implementation.
- Normative changes: reconciled AP/DP wording, evidence and relationship conventions, repair examples and the supported additions in the review. Required local documentation, references and observing checks follow the changed owners.
- This work edits the criteria themselves, not workflow/activity/routine/technique definitions. The review's candidate inventory and linked repair cases are its verification surface. It does not claim that a rewritten criterion has semantically audited every production definition against itself.
- The prior skill-reading acceptance failures remain separate; the user explicitly selects the canon recommendations rather than those skill changes.

## Decisions

Every policy-dependent recommendation carries a user answer. Explicitly approved recommendations do not require repeated permission. A genuinely alternative policy arising later is asked separately, one question at a time.

| ID | Entries | Decision | Applied wording |
| --- | --- | --- | --- |
| AS-13 | AP-29, DP-08 | Environment maintenance is outside the supported task scope. | AP-29 keeps its absolute prohibition and states "These workflows diagnose user-owned environment state; environment maintenance is outside their supported task scope." No exception clause is added and DP-08 is unchanged. |
| AS-24 | AP-48, AP-54, AP-144 | An output reference is flagged on resolvability, not on its part of speech. | AP-48 Detect becomes "An output reference cannot be resolved to exactly one declared output or field from the current instruction and its already anchored noun." Do not flag gains "Same-instruction anaphora with a unique anchored output." |
| PD-16 | DP-39 | Three words is the heading boundary. | DP-39 reads "More than three words carries detail that belongs in the bullet" in place of "Past four words". The two-or-three count stands and no four-word allowance or proper-name exception is introduced. |

## Progress

- [x] Resolve the requested recommendation set and isolate the reviewed branch.
- [x] Apply reconciled wording in disjoint draft slices and integrate related repairs.
- [x] Verify corrected entries, repair examples, cross-entry consistency and affected consumers.
- [x] Commit and push each completed concern, then reconcile all 95 candidate dispositions.

All 93 retained proposals are applied across eight commits; [dispositions](dispositions.md) accounts for every candidate. The slices were applied directly rather than dispatched, because reconciliation had already settled the exact replacement wording.

## Verification

Each commit was measured against the [guard baseline](guard-baseline.md) before it landed. No commit introduced a guard failure. The structural pass reduced `fires-on-ids` from 209 to 207, matching the net removal of two entries; that index is open initiative work this change does not own.

The verification surface is the review's candidate inventory and its linked repair cases. A rewritten criterion has not been semantically re-applied to every production definition, and the guard suite does not read criterion prose, so a clean run is evidence that the corpus still parses and links, not that each criterion now judges its subject correctly.

## Bounded collaboration

Three workers draft disjoint AP ranges (1–68, 69–123, 124–161 plus manual-review entries); the coordinator owns principles, shared evidence/relationship conventions, policy answers and final integration. Workers write replacement blocks under this planning record, never concurrently edit the shared catalog. Cross-range proposals are handed to the owning slice. Each worker receives the approved recommendation text affecting its entries and reads any named neighboring source needed to preserve consistency. Captured source plus recommendation packets are measured before dispatch and fit with prompt, output and safety reserves. The coordinator then reviews the combined changes, including prescribed fixes against related criteria, and publishes incremental commits.

The closing review addresses this finite recommendation inventory. New unrelated ideas are recorded separately rather than extending the task automatically. A required unresolved decision remains open until the user answers.

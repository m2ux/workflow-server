# I17 Goal Trace

| Goal clause | Initiative criteria | Epics | Epic criteria | Source requirement |
| --- | --- | --- | --- | --- |
| Each fix found before the cutover is delivered in workflow-server | AC1 | E00 | AC1–AC8, one set per fix row | The user's goal, decision 2 |
| The extraction carries each fix | AC1 | E00 | AC1–AC8, held at the extraction source by I16 E00 W00's prerequisite | The user's goal, decision 2 |

No requirement source is marked; the criteria come from the confirmed goal.

## Gaps, Ranked

1. **Flagged. The extraction's pinned revision predates the fixes.** I16 E00's R2 and I16's evidence name workflow-server `785a5ee8c` as the extracted head. Once these fixes merge, the extraction is cut from a later commit. I16's prerequisite edge holds the order; re-pinning R2 and the evidence revision is I16's to make when W00 starts, and I16's issues are otherwise left unedited by decision.
2. **AC1's time bound rests on another initiative's edge.** The ancestry holds because I16 E00 W00 waits for this epic. The criterion states what this initiative achieves and names the extraction as its milestone, as the time-bound condition allows.
3. **Fixes found later.** A row added after the extraction starts is outside the goal, as the Non-Goals state.

## Outside Threats

- **Readers of what the plan changes.** Every workspace that installs the skill from `workspace` (md-composer, prosiform) takes the fixes on its next update; none depends on a planning branch, a discussion pull request or the title-prefix fetch.
- **Fail-closed paths.** The format check's label check keeps asking to decide a missing, repeated or descending label, so accepting gaps hides no other fault.
- **Instrument independence.** `git merge-base --is-ancestor` reads git history, independent of the skill it measures.

## E03 Delivery Lanes

| Goal clause | Initiative criteria | Epics | Epic criteria | Source requirement |
| --- | --- | --- | --- | --- |
| Each change found before the cutover is delivered in workflow-server, the lanes feature included | AC1 | E03 | AC2–AC14, covered by the undelivered rows | The user's E03 decision 1 |


## E03 Task-Table Lane Trace, 4 November 2026

| Confirmed clause | Initiative criterion | Epic criteria | Delivering rows | Source |
| --- | --- | --- | --- | --- |
| Lane is a bare task-table index after Joins and before Done | AC1 | AC11 | E03 W02 | User instruction, 4 November |
| Table assignment is the lane data home | AC1 | AC12 | E03 W03 | User instruction, 4 November |
| Joined units share one lane and malformed cells are reported | AC1 | AC3, AC4, AC13, AC14 | E03 W04–W06 | Existing joined-unit design and the confirmed table storage |
| A run admits its lane and unlaned units from task cells | AC1 | AC2, AC5, AC6 | E03 W07–W09 | Existing admission decisions |
| Planning writes confirmed indices into task rows | AC1 | AC7 | E03 W10 | Confirmed table storage and existing lane-planning decision |
| Ready-unit lanes are reported from issue snapshots | AC1 | AC8, AC9, AC10 | E03 W11–W13 | Existing reporting scope, decision held before W11 |

The initiative goal and criterion are unchanged. No marked external requirement source is added. The updated epic retains lane admission, joined-unit consistency and per-request routing while placing the assignment in the task table.


## E03 Arising Input Trace, 4 November 2026

The known pre-cutover input fault in #1630 traces to initiative AC1 through E03 AC15 and W14. It enforces the existing within-epic delivery shape and adds no cross-epic delivery capability.

## E02 Fields and Transformations, 6 November 2026

| Confirmed clause | Initiative criterion | Epic criteria | Delivering rows | Source |
| --- | --- | --- | --- | --- |
| State the shape/operation boundary and identify similar hidden behavior | AC1 | E02 AC1, AC2, AC10 | Existing E02 W01, W02 | User request, 6 November |
| Give Status Changes a cohesive artifact home and preserve its behavior | AC1 | E02 AC5, AC6, AC7, AC8 | Existing one-home audit fixes and E02 W06–W08 | User-confirmed Board Status extraction |
| Checks identify observed and similar candidates while accepting legitimate constraints | AC1 | E02 AC9 | E02 W09 | User request, with positive/negative specimens |

The initiative criterion, epic order and E01 producer edge are preserved. Known consumer updates are joined with the extraction; additional components discovered by the audit receive rows before dispatch. The existing E02 prose/script/one-home fix rows are refined by that audit, as their Proposal already requires. This plan does not claim a universal automatic prose classifier or implement the future performed-operation verifier.

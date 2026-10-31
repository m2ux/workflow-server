# Retrieval baseline and final verdict

User selected A: one owner, a pinned baseline and no increase for every matched scenario.

## Ownership and order

- E14 W11 owns the final comparison and verdict, covering E14 AC23 and I11 AC30.
- E10 W23/AC34 supplies reproducible measurements; it does not own another no-increase criterion.
- E14 W11 waits for E14 W10 final manifests and E10 W26 final whole-corpus verification. No E10 task depends on E14, so this introduces no cycle.
- E12 historical measurements retain their completed record; I11's active AC30 coverage belongs to E14 alone.

## Baseline and instrument

Baseline is `04de875a8517dcf229462e3b939099e16ffe3e63`, the remote workspace revision verified when this decision was made. It is the accepted input to the remaining layout work, not a moving branch alias. The final result revision is the settled E14 integration head containing all required input edits. Record both full commit IDs.

Use one pinned instrument implementation on both revisions with identical scenario inputs. Freeze the instrument commit and executable scenario fixtures before either measurement; retain their content hashes and the exact command. Changing that instrument or a scenario requires both sides to be rerun. The old depth-one walk and its recorded numbers are historical evidence only: it excludes command-specification and deeper required reads and cannot be compared directly with the new complete traversal.

## Scenario roster

Each case is a complete mode run, with the same task facts and branch conditions on both revisions:

| Skill | Mode | Fixed scenario intent |
| --- | --- | --- |
| Work Planner | Propose | Scope a problem and raise its proposal |
| Work Planner | Plan | Raise an epic and write its work items |
| Work Planner | Align | Check an epic against criteria and templates |
| Work Planner | Sync | Record a merged task and verify its criteria |
| Work Planner | Advance | Place the next eligible epic Ready |
| Work Planner | Deliver | Merge a passing task and dispatch the next unit |
| Work Planner | Understand | Explain a pull request's architecture |
| Work Planner | Hoist | Place a standalone issue |
| Work Planner | Standup | Summarize the board's reporting window |
| Work Planner | Revise | Change the skill's instructions |
| Workflow Canon | Author | Author an activity definition |
| Workflow Canon | Audit | Audit a workflow against the canon |
| Workflow Canon | Review | Assess integration readiness |
| Workflow Canon | Revise | Change the skill's instructions |

Freeze concrete fixture inputs for every case before running either side; the roster above fixes coverage, not fabricated run data. Include any additional modes present in either measured revision. A missing counterpart, required source or scenario result is unresolved and blocks the whole verdict; do not drop that case or treat it as zero. New unmatched behavior requires an explicit comparable scenario decision.

## Metric and threshold

Count distinct instruction files actually required for each complete scenario, including the entry point, selected mode, required prerequisites, and transitive required citations from procedures and command specifications. Respect section boundaries and conditional loading, and distinguish descriptive links from required reads. Deduplicate files by normalized identity. Keep ordered section/read traces so omitted obligations can be audited; file-count improvement cannot excuse missing required content.

For every matched scenario: result file count minus baseline file count must be less than or equal to zero. No average, aggregate saving or larger improvement elsewhere offsets a regression. Lines or tokens may be reported as secondary observations, not substitutes for this threshold.

Missing, incomplete, incomparable or failing evidence blocks the verdict. Record the baseline and result commits, instrument commit, scenario fixture hashes, complete per-scenario traces, counts and verdicts. Subsequent changes to required inputs invalidate affected result measurements and require a fresh comparison before handoff. The baseline does not advance to make a failure disappear.

## Status

This defines the required comparison; it does not claim measurements or a passing verdict. I11 AC30, E10 AC34 and E14 AC23 remain unchecked. F12 is reconciled at plan level.

All three published issue bodies match exact live readbacks.

# Delivery Evidence

## Scope

W02 and W03 establish one lane data home: the epic task table. W02 covers AC11 through the seven-column table and its population operation. W03 covers AC12 through the component-only work-item contract. The two artifacts ship together.

The session verifies both artifact contracts, exercises the table with supplied and empty lane values, and runs the planner suite and shared skill-file check against the task checkout. Lane parsing, semantic validation, routing and queue reporting are the later units' work.

## Checklist

- [x] Confirm the live joined-row reservation and published plans.
- [x] Dispatch each artifact component to its implementation group.
- [x] Integrate the artifacts and current-schema consumers.
- [x] Verify the committed unit and publish criterion evidence.
- [ ] Publish the task PR and record both task links. **In progress.**
- [ ] Merge the passing task PR into its epic base.
- [ ] Record AC11/AC12 and task completion, update draft integration and verify board state.
- [ ] Publish final change and arising-issue dispositions.

## Existing Evidence Disposition

W01 is historical delivery through #1626, whose original AC1 is retired by the user's revised plan. Its original test evidence is preserved. Integration #1627 remains draft while the epic's later rows are undelivered.


## Verified Revision

All observations below apply to committed task head `f5c2ce46ed6e1203e9e1cdc7360c9e400649af3d`, on base `7ac78e21ec2a41b58862c963ffe4cd85cc28075e`. The task checkout is clean. No server or workflow-definition source changes are part of this unit.

## T1

**AC11 — Pass.** The Epic Issue Body artifact's population inputs include optional row lane indices. Its population operation writes each supplied index into the row's Lane cell and leaves the cell empty when none is supplied. Its template and Work Breakdown field declare exactly Task, Description, Coverage, Depends on, Joins, Lane, Done. The Lane field defines a bare decimal index, empty/unlaned value and opaque board-wide identity.

The real `format.Template('epic')` reads those seven columns from the committed artifact. Specimens based on the revised epic populate W02 with `2` and with an empty string; `format.Review` returns each body with no finding or mechanical change, preserves the supplied Lane cell and keeps Done last. Running the unit's `skills/work-planner/scripts/format.py` against the revised epic reports zero fixed, zero to apply and zero to decide. This uses the real artifact template, not the proposed-model override used during planning.

## T2

**AC12 — Pass.** Inspection and a case-insensitive search of the committed Work Item artifact confirm that its population inputs, template, Fields and Sections contain Component as its declaration and no Lane declaration path. The artifact retains its component, identity, scope, implementation and test-plan guidance.

Disclosure review follows Deliver's Work Item population call to that component-only contract, and Plan's Epic Issue Body population call to the table contract. The format reader reaches the owning artifact's template. No external Workflow Server session or paid model evaluation is claimed.

## T3

**Planner suite — Pass.** From the committed task checkout, `python3 -m unittest discover -s skills/work-planner/test -q` ran 848 tests in 97.573 seconds: 847 passed and one opt-in live-link check was skipped. The suite covers table normalization, delivery recording, reservation, release and template readers. This is local fixture evidence; the skipped live check was not executed.

The initial run after the template change found five old-schema expectations in template and Sync tests. The current fixture factories and Done-column expectations use the seven-column model; the final full run passes. The focused Sync run also passes all 183 tests.

## T4

**Skill-file check — Pass.** `python3 skills/scripts/check_skill_files.py skills/work-planner` reports 52 files checked and zero findings.

The target branch's user edit removes the italicized-verb guideline. Its rule map still named that absent guideline, which caused a finding. The unit removes that stale mapping and preserves the user's guideline edit.

## T5

**Shared checker suite — Pass.** `python3 -m unittest discover -s skills/test -q` runs 208 tests and passes. It verifies the shared skill-file checker used by this unit.

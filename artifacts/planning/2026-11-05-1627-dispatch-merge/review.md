# Merge Resolution Review

## Parent Accounting

The target adds #1636’s automatic coordinator, dispatch batch, prepared-unit recovery, publication/reservation/start protocol and survey export. The Lane branch supplies opaque task-table indices, admission, invalid-unit diagnostics, labels, shared board state, Ready Units and DRY ownership. Three textual conflicts are resolved by composing those interfaces, with no shared-history rewrite.

The preserved Unit Dispatch protocol and the complete delivery worker/outcomes match the target byte-for-byte. Refill matches the target except for explicit lane input. All dispatch functions match the target after normalizing the shared Lane validator call. The only existing delivery functions changed from the Lane parent are hotfix_units, survey and main, to carry the export. Lane, Board Queue/Ready Units and the lane/board/dependency/format modules match the Lane parent byte-for-byte. No unresolved paths or conflict markers remain. The preservation JSON records these checks.

## Behavioral Validation

- Full combined planner suite: 923 run, 922 passed and one opt-in live skip.
- Shared suite: 208 passed.
- Dispatch suite: 19 passed, including two new real survey-to-batch integration cases.
- Structural check: 55 Work Planner files, zero findings.
- Whitespace checks pass.

The new cases exercise absent/requested lane, opaque `02` versus `2`, unlaned hot-fixes, exact report/export agreement, authorization/capacity selection and independently verified units beside malformed/mixed-lane findings. Existing target cases exercise refill, capacity-only preparation recovery, holds, duplicate-session refusal, ordered start evidence and failed-survey export invalidation. Pass counts are local evidence; no live worker was dispatched.

## Independent Reading Checks

Two fresh-context independent readers traced authorized I17/lane `02` through Deliver, Lane, survey/export, Dispatch Batch and Unit Dispatch. Both found W01/02 and unlaned W03 admitted, W02/2 excluded, mixed joined rows invalid, existing holds reconciled without duplicates, and retained preparations resumed with the fixed lane after a capacity event. They inspected both parent comparisons and found no dropped behavior or confirmed merge defect.

Both walks were bounded static contract checks, not complete mode executions or recursive-prerequisite certifications. Broad outputs truncated and central content was recovered. One reader’s sandbox probe failed before execution; its proposed identity-regex defect was withdrawn after root executed the real m2ux/workflow-server identity successfully and rejected a repository name containing whitespace. No context-saving claim or live-harness execution is made.

## Ownership

Lane owns index validity and admission. The survey owns eligibility and export order, Dispatch Batch owns authorization/occupancy/capacity, and Unit Dispatch owns publication/hold/start effects. The new batch consumer links to Lane’s rule and uses its existing is_index function. Deliver’s report uses the existing report and session contracts without enumerating their fields.

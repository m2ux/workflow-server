# Proposal Board Prefixes and Epic Task Rows

Delivery evidence for [issue #1470](https://github.com/m2ux/workflow-server/issues/1470).

## Scope

Work Planner carries a proposal's exact designator into newly created board titles and finds those boards by theme. New tasks stay in epic rows with details in the epic and planning record. Planning retains existing hoisted issue records. The implementation changes six skill documents on branch `skill/1470-proposal-board-tasks`. The initial implementation is commit `6e61bba48`; its review correction preserves proposal provenance in the initiative.

## Work Checklist

- [x] Inspect the naming, lookup, planning and existing-issue paths.
- [x] Update their governing instructions and callers.
- [x] Run local regression and structure checks.
- [x] Exercise representative planning and lookup paths.
- [x] Publish the implementation pull request: [#1471](https://github.com/m2ux/workflow-server/pull/1471), targeting `workspace`.

## Regression Checks

All 397 work-planner unittest tests passed. The shared skill checker inspected 49 files with zero findings. The diff whitespace check passed. These are local results, not remote CI results.

## Board Lookup

Executed the jq filter extracted from the edited Find Theme Board command against local JSON fixtures. It returned open `[P007] Atlas: Reliable Delivery` and `Atlas: Other Theme Instance` boards, excluding a closed Atlas board, an Atlas Extra board, and another theme. This exercises AC2 without changing remote boards.

## Planning Walkthrough

An independent agent simulated one initiative, one epic and two new task rows, including a row needing its own discussion and evidence. The epic also held a row linked to existing issue #637.

The proposed issue-creation log contains one initiative create and one epic create, followed by patches resolving their links. It contains zero task-issue creates. New task discussion and evidence reside in the epic and work-item records. This observes AC3.

The supplied issue #637 snapshot is identical before and after planning: state `open`, title `Existing task`, body `Evidence retained`, labels `["enhancement"]`. The planning operation schedules no write to that issue and retains its row link. This observes AC4 within the simulated planning operation.

For the absent-board path, the agent traced Sync through proposal retrieval, Copy Project Board and Create Theme Board. Proposal `[P007]` and theme Atlas produce `[P007] Atlas: Reliable Delivery`, preserving leading zeroes. Missing proposal provenance blocks creation. This observes AC1 through a representative walkthrough.

## Skill Review

Reviewed all five changed documents and searched the skill for the removed task-creation exception. The remaining discussion-or-evidence condition in Placement governs disposition of existing orphan issues, not creation of new task issues. Existing-task readers remain relevant to retained issues. This review supports AC5.

## Disclosure and Limits

The affected routes are Plan's epic population and publication, and Sync's board selection and creation. Plan reaches the new-task rule through Epic Issue Body. Sync already requires Issue and Board and passes the proposal record into the board operation. Task Body remains reachable from Placement for existing issues; Plan has no direct need for it.

The independent walkthrough inspected the entry point, selected modes, changed artifacts and supporting guidance. The agent recovered initially truncated guidance and repeated the bounded paths with proposal `[P12]`, an evidence-heavy task and the existing issue. It again scheduled zero task-issue creates and no mutation to #637, generated `[P12] Atlas: Reliable Delivery`, and executed the lookup filter successfully. The affected paths reach their governing rules and Plan's removed prerequisite matches its removed call.

This is repeated targeted behavior evidence, not a completed Plan or Sync lifecycle. Transitive prerequisites of unrelated lifecycle operations were not exhausted. No external board or issue was created or changed during validation. Initial oversized reads required recovery; no context-efficiency improvement is claimed.

## Change Review

Review found a missing persistence contract: Sync required the originating proposal, but initiative drafting did not require retaining its identity. A fresh Sync session could therefore block creation after a valid planning session. The correction requires the proposal's exact title and issue URL in initiative References and makes Sync read that reference explicitly. Draft Initiative Issue Body already requires all Fields, so the provenance rule applies before publication. Sync already requires Initiative Issue Body, so the reference adds no missing prerequisite.

The corrected skill passes the 49-file structure and link check with zero findings. The original 397-test result applies to the implementation before this prose-only correction; the correction changes no scripts or consumed templates.

An independent review traced proposal identity from Plan's scoped-proposal input through Draft's required Fields, publication and saved-body readback, then into a fresh Sync session's References lookup. Repeated cases preserve `[P007]` and `[P12]` exactly; the documented jq filter matched both. No further concrete defect was found in the correction. This is instruction-path review and local lookup execution, not remote publication or a live Sync run.

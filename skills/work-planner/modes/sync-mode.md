# Sync Mode

Records delivery on an initiative, its epics, and their task issues. Each task that has a pull request is linked to that pull request, open or merged. Criteria that now hold are recorded, complete rows are marked done, complete issues are closed, and the initiative's theme board is brought up to date.

## Prerequisites

Read these files first.

- [Issue](../artifacts/issue.md)
- [Issue Body](../artifacts/issue-body.md)
- [Acceptance Criteria](../artifacts/acceptance-criteria.md)
- [Task Body](../artifacts/task-body.md)
- [Pull Request](../artifacts/pull-request.md)
- [Delivery Evidence](../artifacts/delivery-evidence.md)
- [Epic](../artifacts/epic.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Initiative Issue Body](../artifacts/initiative-issue-body.md)
- [Board](../artifacts/board.md)
- [Understand Mode](understand-mode.md)
- [Board Delivery](../artifacts/board-delivery.md)
- [Issue Closure](../protocols/issue-closure.md)
- [Review Pull Request](../protocols/review-pull-request.md)
- [Epic Integration](../protocols/epic-integration.md)
- [Plan Change](../artifacts/plan-change.md)

## Procedure

The main path meets [Outcomes](#outcomes).

1. **Select.**
   Select an initiative with its open epics, or the epics the user names.
   - Run [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for each selected issue before inspecting its Open Questions or format.
   - Use the returned current JSON and body in the following checks.
   - For an epic with Open Questions:
     - Obtain the user's decision on each question.
     - Apply confirmed resolutions through [Apply Body Corrections](../artifacts/issue-body.md#apply-body-corrections) with the epic template and field conditions.
     - Publish through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
     - Fetch the saved epic.
     - Continue only when its Open Questions section is resolved; otherwise return the unresolved questions as blockers.
   - For an issue rejected by [Validate Issue Body](../artifacts/issue-body.md#validate-issue-body):
     - Run [Repair Issue Format](../artifacts/issue-body.md#repair-issue-format) with that issue identity, current JSON, kind template and field conditions, required related evidence and output body path.
     - When it returns, fetch the saved body again.
     - Validate that saved body before continuing to the fetch step.
     - Return a remaining format failure as a blocker.
2. **Fetch.**
   - Run [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for each issue, including each task issue under an epic being synced, titled as [Titles](../artifacts/task-body.md#titles) states.
   - Run [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence) with the selected repositories and initiative prefix, fetched epic JSON, authenticated access and destination snapshot files.
   - Use its returned pull request records, complete issue-link snapshot and findings in the following steps.
   - Run [Confirm Repository Auto-Close](../artifacts/issue.md#confirm-repository-auto-close) for the repository holding the issues, which gates every link, merge and closure this run makes.
   - Capture each issue's Development links.
   - Fetch linked pull requests absent from the initiative list before evaluating closure.
3. **Unnamed deliveries.**
   When the user says work has landed but no pull request names its epic:
   - Find the pull request.
   - Confirm it with the user.
   - Give it the epic's reference, `[I07:E00] Purpose`, with [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request).
   - Run [Read Initiative Pull Requests](../artifacts/pull-request.md#read-initiative-pull-requests) again.
   - Run [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links) again.
4. **Match pull requests to tasks.**
   Run [Inspect Epic Delivery](../artifacts/epic.md#inspect-epic-delivery) for each epic.
   - Use the unmatched and in-flight results defined in [Delivery Findings](../artifacts/epic.md#delivery-findings).
   - Read its changes and description against the tasks' Descriptions.
   - Name the tasks it works on: one task, or tasks that name each other in Joins.
   - Put any match that is not clear to the user.
5. **Sync each task issue.**
   For a task with a delivering pull request, open or merged, run [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) with its current body, selected criteria, delivery evidence, revisions, named instruments and the project checkout.
   - Run [Record Task Delivery](../artifacts/task-body.md#record-task-delivery) with the task JSON, pull request records, complete issue-link snapshot, delivering pull request number, returned verified criterion ids and output body path.
   - Publish the returned body through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) before closure.
   - Once the pull request has merged, record it with [Comment on Issue](../artifacts/issue.md#comment-on-issue): `Delivered by #950.`
   - [Issue Closure](../protocols/issue-closure.md) when it reports closable.
6. **Sync each epic.**
   Run [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery), linking every match from the match step, open or merged, with the task issues and the project checkout its long-lived branch names come from:
   Linking a pull request replaces the planning-record link on that task.
   - Handle the returned delivery findings:
     - **Conflict.**
       - Put it to the user.
     - **Unmatched.**
       - Match them as in the match step.
     - **In flight.**
       - Match them as in the match step.
     - **Draft.**
       - Open it as a draft review pull request.
       - Leave the epic open while its delivery is incomplete.
     - **Unmerged.**
       - The close step opens or merges that pull request.
     - **References.**
       - Bring the body up to the merges with [Review Pull Request](../protocols/review-pull-request.md).
     - **Uncited.**
       - Set the link with [Link Pull Request to Issue](../artifacts/pull-request.md#link-pull-request-to-issue).
       - Run [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links) again.
     - **Note.**
       - Link the pull request as in the match step.
     - **Unplaced.**
       - Draft the missing task row against [Work Breakdown](../artifacts/epic-issue-body.md#work-breakdown).
       - Run [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy) for the row, which is a task creation, with the allowance the caller supplied.
         - An automatic row is confirmed as drafted and recorded through [Record Plan Change](../artifacts/plan-change.md#record-plan-change).
         - A held row is settled as [Held Change](../artifacts/plan-change.md#held-change) states; an unanswered placement stays pending.
       - Apply the confirmed row through [Revise Epic Rows](../artifacts/epic-issue-body.md#revise-epic-rows).
       - Publish through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
       - Repeat Record Epic Delivery with the saved epic and refreshed task records. An unanswered placement stays pending.
     - **Open questions.**
       - Return to the select step for this epic.
       - Resolve the questions there.
       - Fetch the saved body before repeating Record Epic Delivery.
     - **Ticked early.**
       - Untick them, or link the missing delivery.
     - **Disagreement.**
       - Continue recording links, verified criteria and Done despite the reported coverage disagreement.
   - After applying the returned findings, repeat Record Epic Delivery with the revised epic body and refreshed delivery records, retaining the complete issue-link snapshot and output body path. Recording the epic's delivery is finished when unmatched, in flight, uncited, note, and unplaced are clear, apart from a pull request the user leaves unmatched.
7. **Verify.**
   Run [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) for the criteria reported ready to verify, supplying the current issue body, delivery findings, relevant delivery revisions, named instruments and the project checkout.
   - Retain the returned verified criterion ids and evidence for the tick step.
   - For an unresolved epic criterion requiring further work:
     - Follow [Plan Gap Task](../artifacts/epic-issue-body.md#plan-gap-task) with the current epic JSON and body, delivered task row, unmet criterion ids, delivery records, complete issue-link snapshot and output body path.
     - For each criterion it returns as already holding, repeat [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) with that criterion id, the current epic body, delivery findings, delivery revisions, named instruments and the project checkout.
     - Pass the returned verified ids to [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria) with the current epic JSON, pull request records, complete issue-link snapshot and output body path, and publish through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
     - Resume with its recorded disposition; a criterion that cannot be confirmed stays unticked.
8. **Tick.**
   Tick the confirmed criteria with [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria).
9. **Patch.**
   Patch each changed body from its output body file with [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
10. **Close.**
    - Run [Select Project Board](../artifacts/board.md#select-project-board) for the initiative theme when the caller supplied no board identity. Report an absent board; integration still follows its own evidence gates.
    - When [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) reports an epic base unmerged and names no open pull request, open it as a draft review pull request and leave the epic open. Epic Integration establishes readiness from the completed delivery evidence.
    - For each open epic pull request:
      - Follow [Epic Integration](../protocols/epic-integration.md) with the epic identity and body, review identity, project checkout, current delivery records, complete issue-link snapshot, criterion verification evidence and selected board identity or its confirmed absence.
      - Report incomplete delivery or unmet merge requirements.
    - Fetch the pull requests again after merging.
    - Re-run [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) with the refreshed records and the same project checkout.
    - [Issue Closure](../protocols/issue-closure.md) each epic the re-run reports closable.
11. **Sync the initiative.**
    Run [Record Initiative Delivery](../artifacts/initiative-issue-body.md#record-initiative-delivery), with the epic JSON fetched after closing. An epic row is delivered when its issue is closed as completed, and Done is ticked on it as [Work Breakdown](../artifacts/initiative-issue-body.md#work-breakdown) states.
    - For returned criteria ready to verify:
      - Run [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) with their ids, current initiative body, delivery findings, delivery revisions, named instruments and the project checkout.
      - Pass returned verified ids to [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria) with the initiative JSON, every linked epic record and output body file.
      - Report the remaining findings as pending.
    - [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) the initiative from its output body file when a tick changed it, so the board sync reads every criterion ticked.
    - [Issue Closure](../protocols/issue-closure.md) the initiative when it reports closable.
12. **Sync the board.**
    Run [Select Project Board](../artifacts/board.md#select-project-board) for the initiative's theme.
    - When the board is absent:
      - Read the originating proposal identified in the initiative's [References](../artifacts/initiative-issue-body.md#references) through [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue); return unresolved provenance before board creation for a proposal-derived initiative.
      - Run [Copy Project Board](../artifacts/board.md#copy-project-board) with the owner, repository, theme title and originating proposal record when applicable.
    - Follow [Record Board Delivery](../artifacts/board-delivery.md#record-board-delivery) after the issue bodies and closures are saved.
13. **Explain each change entering review.**
    For each task or epic newly confirmed In Review by the board step:
    - Run [Understand Mode](understand-mode.md) with the task's open pull request or each epic review pull request, one run per base.
    - Complete each overview before continuing; an initiative has no overview of its own. An issue already In Review when the sync began keeps the overview it has: the pull request it explains is the one already reviewed. A reviewer meets the overview on the pull request it explains. The run that integrates an epic base owns that epic's overview; this step writes one only where the board step confirms a task or epic In Review that integration did not already explain.
14. **Report.**
    Return saved delivery results and unresolved findings to the caller, or present them to the user for a direct request.
    - Report queue decisions unevaluated by this run.
    Report per issue: tasks linked, criteria ticked, rows marked done, criteria left unticked and why, conflicts, test plan disagreements, what was closed, each board and assignee change, and each overview written. What the report names about criteria is [Coverage Reports](../artifacts/issue-body.md#coverage-reports).

## Outcomes

- **Delivery recorded.**
  The user has each landed task tied to the pull request that delivered it, and has what now holds recorded on the initiative and its epics.
- **Complete work closed.**
  Work that is complete is closed.
- **The board is current.**
  The theme board shows where the initiative and its epics stand, including what a reviewer can take up.
- **A change entering review is explained.**
  Each task and epic that enters review has an overview on the pull request a reviewer reads.
- **The queue stays undecided.**
  A sync on its own leaves the choice of what to start next undecided.

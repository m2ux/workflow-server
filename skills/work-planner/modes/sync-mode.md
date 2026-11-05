# Sync Mode

Records delivery on an initiative, its epics, and their task issues. Each task that has a pull request is linked to that pull request, open or merged. Criteria that now hold are recorded, complete rows are marked done, complete issues are closed, and the initiative's theme board is brought up to date.

**Runs in:** the project checkout.

Follow the [Procedure](#procedure), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

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
- [Work Item](../artifacts/work-item.md)
- [Understand Mode](understand-mode.md)
- [Board Delivery](../artifacts/board-delivery.md)
- [Issue Closure](../protocols/issue-closure.md)
- [Review Pull Request](../protocols/review-pull-request.md)
- [Epic Integration](../protocols/epic-integration.md)
- [Plan Change](../artifacts/plan-change.md)

## Procedure

### 1. Select

Select an initiative with its open epics, or the epics the user names.

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for each selected issue before inspecting its Open Questions or format.
- Use the returned current JSON and body in the following checks.

For an epic with Open Questions:

- Obtain the user's decision on each question.
- Apply [Apply Body Corrections](../artifacts/issue-body.md#apply-body-corrections) with confirmed resolutions with the epic template and field conditions.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with the returned body.
- Fetch the saved epic.
- Continue only when its Open Questions section is resolved; otherwise return the unresolved questions as blockers.

Apply [Validate Issue Body](../artifacts/issue-body.md#validate-issue-body). For a rejected issue:

- Apply [Repair Issue Format](../artifacts/issue-body.md#repair-issue-format) with that issue identity, current JSON, kind template and field conditions, required related evidence and output body path.
- When it returns, fetch the saved body again.
- Validate that saved body before continuing to the fetch step.
- Return a remaining format failure as a blocker.

### 2. Fetch

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for each issue, including each task issue under an epic being synced, titled as [Titles](../artifacts/task-body.md#titles) states.
- Apply [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence) with the selected repositories and initiative prefix, the fetched initiative, epic and task issue JSON, authenticated access and destination snapshot files.
- Use its returned pull request records, complete issue-link snapshot and findings in the following steps.
- Apply [Confirm Repository Auto-Close](../artifacts/issue.md#confirm-repository-auto-close) for the repository holding the issues, which gates every link, merge and closure this run makes.
- Capture each issue's Development links.

### 3. Unnamed Deliveries

When the user says work has landed but no pull request names its epic:

- Find the pull request.
- Confirm it with the user.
- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request) with the epic's reference, `[I07:E00] Purpose`.
- Apply [Read Initiative Pull Requests](../artifacts/pull-request.md#read-initiative-pull-requests) again, with the fetched issue files.
- Apply [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links) again.

### 4. Match Pull Requests to Tasks

Apply [Inspect Epic Delivery](../artifacts/epic.md#inspect-epic-delivery) for each epic.

- Use the unmatched and in-flight results defined in [Delivery Findings](../artifacts/epic.md#delivery-findings).
- Read its changes and description against the tasks' Descriptions.
- Name the tasks it works on: one task, or tasks that name each other in Joins.
- Put any match that is not clear to the user.

### 5. Sync Each Task Issue

For a task with a delivering pull request, open or merged, Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) with its current body, selected criteria, delivery evidence, revisions, named instruments and the project checkout.

- Apply [Record Task Delivery](../artifacts/task-body.md#record-task-delivery) with the task JSON, pull request records, complete issue-link snapshot, delivering pull request number, returned verified criterion ids and output body path.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with the returned body before closure.
- Once the pull request has merged, Apply [Comment on Issue](../artifacts/issue.md#comment-on-issue) to record it: `Delivered by #950.`
- Follow [Issue Closure](../protocols/issue-closure.md) when it reports closable.

### 6. Sync Each Epic

Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery), linking every match from the match step, open or merged, with the task issues, the project checkout and the fetched epic bases its long-lived branch names are read at. Linking a pull request replaces the planning-record link on that task.

Handle the returned delivery findings:

**Normalized.**

- The patch step publishes the corrected table.

**Retitle.**

- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request) with the pull request and the title it names.

**Conflict.**

- Put it to the user.

**Unmatched.**

- Match them as in the match step.

**In flight.**

- Match them as in the match step.

**Draft.**

- Open it as a draft review pull request.
- Leave the epic open while its delivery is incomplete.

**Unmerged.**

- The close step opens or merges that pull request.

**Target.**

Confirm the base it names against its work item's [Component](../artifacts/work-item.md#component): the confirmed base is the epic base of the long-lived branch that Component names, whether the finding names that base, another, or one of several.

- A unit whose work items name several long-lived branches takes each task branch's base from the long-lived branch its last slug word names.

Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request) with an open pull request and the confirmed base.

- Put a merged one to the user, since its merge cannot be moved.

**References.**

- Follow [Review Pull Request](../protocols/review-pull-request.md) to bring the body up to the merges, with the project checkout and the fetched epic bases.

**Changes.**

- Follow [Review Pull Request](../protocols/review-pull-request.md) to restate the bullet naming the absent path, with the project checkout and the fetched epic bases.

**No epic.**

- Give it the epic it works on as the unnamed-deliveries step does, once the user confirms which.

**Uncited.**

- Apply [Link Pull Request to Issue](../artifacts/pull-request.md#link-pull-request-to-issue) with the link.
- Apply [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links) again.

**Note.**

- Link the pull request as in the match step.

**Unplaced.**

- Draft the missing task row against [Work Breakdown](../artifacts/epic-issue-body.md#work-breakdown).

Apply [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy) for the row, which is a task creation, with the allowance the caller supplied.

- Confirm an automatic row as drafted and Apply [Record Plan Change](../artifacts/plan-change.md#record-plan-change) with that row.
- A held row is settled as [Held Change](../artifacts/plan-change.md#held-change) states; an unanswered placement stays pending.

Apply [Revise Epic Rows](../artifacts/epic-issue-body.md#revise-epic-rows) with the confirmed row.

- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with the returned body.
- Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) again with the saved epic, refreshed task records and the same epic bases. An unanswered placement stays pending.

**Open questions.**

- Return to the select step for this epic.
- Resolve the questions there.
- Fetch the saved body, then Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) again with the same epic bases.

**Ready to verify.**

- The verify step settles them.

**Unmet.**

- The verify step settles the unticked criteria, planning a gap task for any that need further work.

**Ticked early.**

- Untick them, or link the missing delivery.

**Disagreement.**

- Continue recording links, verified criteria and Done despite the reported coverage disagreement.

**Unevaluable.**

- Report each source and why to the user, with each check the run names not checked.
- Leave an unmatched or in-flight pull request whose head is an epic base unmatched, since the run could not tell it from a task delivery.
- Fetch each draft base, long-lived branch or review head named unread, and Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) again with the same epic bases.
- The epic stays open until every epic base states the same readable declaration.

**Source.**

- Report it with the results.

**Not checked.**

- Report each check with the unevaluable sources that left it unread.

After applying the returned findings, Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) again with the revised epic body and refreshed delivery records, retaining the complete issue-link snapshot, the same epic bases and output body path. Recording the epic's delivery is finished when unmatched, in flight, uncited, note, unchanged, and unplaced are clear, apart from a pull request the user leaves unmatched.

### 7. Verify

Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) for the criteria reported ready to verify, supplying the current issue body, delivery findings, relevant delivery revisions, named instruments and the project checkout.

- Retain the returned verified criterion ids and evidence for the tick step.

For an unresolved epic criterion requiring further work:

- Apply [Plan Gap Task](../artifacts/epic-issue-body.md#plan-gap-task) with the current epic JSON and body, delivered task row, unmet criterion ids, delivery records, complete issue-link snapshot, project checkout, fetched epic bases and output body path.
- For each criterion it returns as already holding, Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) again with that criterion id, the current epic body, delivery findings, delivery revisions, named instruments and the project checkout.
- Apply [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria) with the returned verified ids, the current epic JSON, pull request records, complete issue-link snapshot and output body path, and Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with the returned body.
- Resume with its recorded disposition; a criterion that cannot be confirmed stays unticked.

### 8. Tick

Apply [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria) with the confirmed criteria.

### 9. Patch

Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with each changed body from its output body file.

### 10. Close

- Apply [Select Project Board](../artifacts/board.md#select-project-board) for the initiative theme when the caller supplied no board identity. Report an absent board; integration still follows its own evidence gates.
- When the preceding Record Epic Delivery call reports an epic base unmerged and names no open pull request, open it as a draft review pull request and leave the epic open. Epic Integration establishes readiness from the completed delivery evidence.

For each open epic pull request:

- Follow [Epic Integration](../protocols/epic-integration.md) with the epic identity and body, review identity, project checkout, current delivery records, complete issue-link snapshot, criterion verification evidence and selected board identity or its confirmed absence.
- Report incomplete delivery or unmet merge requirements.

Fetch the pull requests again after merging.

- Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) again with the refreshed records, the same project checkout and the same epic bases.
- Follow [Issue Closure](../protocols/issue-closure.md) each epic the re-run reports closable.

### 11. Sync the Initiative

Apply [Record Initiative Delivery](../artifacts/initiative-issue-body.md#record-initiative-delivery) with the epic JSON fetched after closing.

For returned criteria ready to verify:

- Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) with their ids, current initiative body, delivery findings, delivery revisions, named instruments and the project checkout.
- Apply [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria) with returned verified ids, the initiative JSON, every linked epic record and output body file.
- Report the remaining findings as pending.

#### Save Verified Initiative

When a tick changed the initiative, Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with its output body file, so the board sync reads every criterion ticked.

#### Close Complete Initiative

Follow [Issue Closure](../protocols/issue-closure.md) for the initiative when it reports closable.

### 12. Sync the Board

Apply [Select Project Board](../artifacts/board.md#select-project-board) for the initiative's theme.

When the board is absent:

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for the originating proposal identified in the initiative's [References](../artifacts/initiative-issue-body.md#references); return unresolved provenance before board creation for a proposal-derived initiative.
- Apply [Copy Project Board](../artifacts/board.md#copy-project-board) with the owner, repository, theme title and originating proposal record when applicable.

Apply [Record Board Delivery](../artifacts/board-delivery.md#record-board-delivery) after the issue bodies and closures are saved.

### 13. Explain Each Change Entering Review

For each epic newly confirmed In Review by the board step:

- Follow [Understand Mode](understand-mode.md) with each epic review pull request, one run per base.
- Complete each overview before continuing; an initiative has no overview of its own. An issue already In Review when the sync began keeps the overview it has: the pull request it explains is the one already reviewed. A reviewer meets the overview on the pull request it explains. The run that integrates an epic base owns that epic's overview; this step writes one only where the board step confirms an epic In Review that integration did not already explain.

### 14. Report

Return saved delivery results and unresolved findings to the caller, or present them to the user for a direct request.

- Report queue decisions unevaluated by this run.
- Apply [Audit Closure Evidence](../artifacts/issue.md#audit-closure-evidence) for the repository holding the issues, naming the initiative, epics and tasks this run touched. Report each unsupported and unevaluable issue it returns, with its state reason and findings, and the not-planned closures apart. This run changes none of them.
- Report per issue: tasks linked, criteria ticked, rows marked done, criteria left unticked and why, conflicts, test plan disagreements, what was closed, each board and assignee change, and each overview written. What the report names about criteria is [Coverage Reports](../artifacts/issue-body.md#coverage-reports).

## Outcomes

- **Delivery recorded.**
  The user has each landed task tied to the pull request that delivered it, and has what now holds recorded on the initiative and its epics.
- **Complete work closed.**
  Work that is complete is closed.
- **The board is current.**
  The theme board shows where the initiative and its epics stand, including what a reviewer can take up.
- **A change entering review is explained.**
  Each epic that enters review has an overview on the pull request a reviewer reads.
- **The queue stays undecided.**
  A sync on its own leaves the choice of what to start next undecided.

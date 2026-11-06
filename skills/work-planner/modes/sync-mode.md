# Sync Mode

Records delivery on an initiative, its epics, and their task issues. Each task that has a pull request is linked to that pull request, open or merged. Criteria that now hold are recorded, complete rows are marked done, complete issues are closed, and the initiative's theme board is brought up to date.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

## Procedure

### 1. Select

- Select an initiative with its open epics, or the epics the user names.

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for each selected issue before inspecting its Open Questions or format.
- Use the provided current JSON and body in the following checks.

- For an epic with Open Questions:

- Obtain the user's decision on each question.
- Apply [Apply Body Corrections](../artifacts/issue-body.md#apply-body-corrections "ƒ") with confirmed resolutions with the epic template and field conditions.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the provided body.
- Fetch the saved epic.
- Continue only when its Open Questions section is resolved; otherwise provide the unresolved questions as blockers.

- Apply [Validate Issue Body](../artifacts/issue-body.md#validate-issue-body "ƒ"). For a rejected issue:

- Apply [Repair Issue Format](../artifacts/issue-body.md#repair-issue-format "ƒ") for the selected issue against its kind’s template and field conditions.
- When it returns, fetch the saved body again.
- Validate that saved body before continuing to the fetch step.
- Provide a remaining format failure as a blocker.

### 2. Fetch

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for each issue, including each task issue under an epic being synced, titled as [Titles](../artifacts/task-body.md#titles) states.
- Apply [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence "ƒ") for the selected repositories and initiative against current issue records.
- Use its provided pull request records, complete issue-link snapshot and findings in the following steps.
- Apply [Confirm Repository Auto-Close](../artifacts/issue.md#confirm-repository-auto-close "ƒ") for the repository holding the issues, which gates every link, merge and closure this run makes.
- Capture each issue's Development links.

### 3. Unnamed Deliveries

- When the user says work has landed but no pull request names its epic:

- Find the pull request.
- Confirm it with the user.
- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request "ƒ") with the epic's reference, `[I07:E00] Purpose`.
- Apply [Read Initiative Pull Requests](../artifacts/pull-request.md#read-initiative-pull-requests "ƒ") again, with the fetched issue files.
- Apply [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links "ƒ") again.

### 4. Match Pull Requests to Tasks

- Apply [Inspect Epic Delivery](../artifacts/epic.md#inspect-epic-delivery "ƒ") for each epic.

- Use the unmatched and in-flight results defined in [Delivery Findings](../artifacts/epic.md#delivery-findings).
- Read its changes and description against the tasks' Descriptions.
- Name the tasks it works on: one task, or tasks that name each other in Joins.
- Put any match that is not clear to the user.

### 5. Sync Each Task Issue

- For a task with a delivering pull request, open or merged, Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria "ƒ") for the selected criterion ids against current delivery evidence in the project checkout.

- Run [Sync Task Issue](../artifacts/task-body.md#sync-task-issue "ƒ") for the selected task and delivering pull request with the verified criterion ids.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the provided body before closure.
- Once the pull request has merged, Apply [Comment on Issue](../artifacts/issue.md#comment-on-issue "ƒ") to record it: `Delivered by #950.`
- Follow [Issue Closure](../protocols/issue-closure.md "ƒ") when it reports closable.

### 6. Sync Each Epic

- Run [Sync Epic](../artifacts/epic-issue-body.md#sync-epic "ƒ"), linking every match from the match step, open or merged, with the task issues, the project checkout and the fetched epic bases its long-lived branch names are read at. Linking a pull request replaces the planning-record link on that task.

- Handle the provided delivery findings:

**Normalized.**

- The patch step publishes the corrected table.

**Retitle.**

- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request "ƒ") with the pull request and the title it names.

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

- Confirm the base it names against its work item's [Component](../artifacts/work-item.md#component): the confirmed base is the epic base of the long-lived branch that Component names, whether the finding names that base, another, or one of several.

- A unit whose work items name several long-lived branches takes each task branch's base from the long-lived branch its last slug word names.

- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request "ƒ") with an open pull request and the confirmed base.

- Put a merged one to the user, since its merge cannot be moved.

**References.**

- Follow [Review Pull Request](../protocols/review-pull-request.md "ƒ") to bring the body up to the merges, with the project checkout and the fetched epic bases.

**Changes.**

- Follow [Review Pull Request](../protocols/review-pull-request.md "ƒ") to restate the bullet naming the absent path, with the project checkout and the fetched epic bases.

**No epic.**

- Give it the epic it works on as the unnamed-deliveries step does, once the user confirms which.

**Uncited.**

- Apply [Link Pull Request to Issue](../artifacts/pull-request.md#link-pull-request-to-issue "ƒ") with the link.
- Apply [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links "ƒ") again.

**Note.**

- Link the pull request as in the match step.

**Unplaced.**

- Draft the missing task row against [Work Breakdown](../artifacts/epic-issue-body.md#work-breakdown).

- Apply [Check Plan Change Autonomy](../artifacts/plan-change.md#check-plan-change-autonomy "ƒ") for the row, which is a task creation, with the allowance the caller supplied.

- Confirm an automatic row as drafted and Apply [Record Plan Change](../artifacts/plan-change.md#record-plan-change "ƒ") with that row.
- A held row is settled as [Held Change](../artifacts/plan-change.md#held-change) states; an unanswered placement stays pending.

- Apply [Revise Epic Rows](../artifacts/epic-issue-body.md#revise-epic-rows "ƒ") with the confirmed row.

- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the provided body.
- Run [Sync Epic](../artifacts/epic-issue-body.md#sync-epic "ƒ") again with the saved epic, refreshed task records and the same epic bases. An unanswered placement stays pending.

**Open questions.**

- Return to the select step for this epic.
- Resolve the questions there.
- Fetch the saved body, then Run [Sync Epic](../artifacts/epic-issue-body.md#sync-epic "ƒ") again with the same epic bases.

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
- Fetch each draft base, long-lived branch or review head named unread, and Run [Sync Epic](../artifacts/epic-issue-body.md#sync-epic "ƒ") again with the same epic bases.
- The epic stays open until every epic base states the same readable declaration.

**Source.**

- Report it with the results.

**Not checked.**

- Report each check with the unevaluable sources that left it unread.

- After applying the provided findings, Run [Sync Epic](../artifacts/epic-issue-body.md#sync-epic "ƒ") again for the refreshed epic evidence in the project checkout with the fetched epic bases. Recording the epic's delivery is finished when unmatched, in flight, uncited, note, unchanged, and unplaced are clear, apart from a pull request the user leaves unmatched.

### 7. Verify

- Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria "ƒ") for the selected criterion ids against current delivery evidence in the project checkout.

- Retain the provided verified criterion ids and evidence for the tick step.

- For an unresolved epic criterion requiring further work:

- Apply [Plan Gap Task](../artifacts/epic-issue-body.md#plan-gap-task "ƒ") for the delivered row and unmet criterion ids, using the project checkout and fetched epic bases.
- For each criterion it returns as already holding, Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria "ƒ") for the selected criterion ids against current delivery evidence in the project checkout.
- Apply [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria "ƒ") with the provided verified ids, the current epic JSON, pull request records, complete issue-link snapshot and output body path, and Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the provided body.
- Resume with its recorded disposition; a criterion that cannot be confirmed stays unticked.

### 8. Tick

Apply [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria "ƒ") with the confirmed criteria.

### 9. Patch

Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with each changed body from its output body file.

### 10. Close

- Apply [Select Project Board](../artifacts/board.md#select-project-board "ƒ") for the initiative theme when the caller supplied no board identity. Report an absent board; integration still follows its own evidence gates.
- When the preceding Sync Epic call reports an epic base unmerged and names no open pull request, open it as a draft review pull request and leave the epic open. Epic Integration establishes readiness from the completed delivery evidence.

- For each open epic pull request:

- Follow [Epic Integration](../protocols/epic-integration.md "ƒ") with the epic identity and body, review identity, project checkout, current delivery records, complete issue-link snapshot, criterion verification evidence and selected board identity or its confirmed absence.
- Report incomplete delivery or unmet merge requirements.

- Fetch the pull requests again after merging.

- Run [Sync Epic](../artifacts/epic-issue-body.md#sync-epic "ƒ") again with the refreshed records, the same project checkout and the same epic bases.
- Follow [Issue Closure](../protocols/issue-closure.md "ƒ") each epic the re-run reports closable.

### 11. Sync the Initiative

- Run [Sync Initiative](../artifacts/initiative-issue-body.md#sync-initiative "ƒ") with the epic JSON fetched after closing.

- For provided criteria ready to verify:

- Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria "ƒ") for the selected criterion ids against current delivery evidence in the project checkout.
- Apply [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria "ƒ") with provided verified ids, the initiative JSON, every linked epic record and output body file.
- Report the remaining findings as pending.

#### Save Verified Initiative

- When a tick changed the initiative, Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with its output body file, so the board sync reads every criterion ticked.

#### Close Complete Initiative

- Follow [Issue Closure](../protocols/issue-closure.md "ƒ") for the initiative when it reports closable.

### 12. Sync the Board

- Apply [Select Project Board](../artifacts/board.md#select-project-board "ƒ") for the initiative's theme.

- When the board is absent:

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for the originating proposal identified in the initiative's [References](../artifacts/initiative-issue-body.md#references); provide unresolved provenance before board creation for a proposal-derived initiative.

#### Missing Board

- When the selected board is absent, use the owner, repository, theme title and originating proposal record when applicable.

##### 1. Create Absent Proposals Board

When [Selected Kind](../artifacts/board.md#selected-kind) is proposals and no open board under [Board Owner](../artifacts/board.md#board-owner) has the [proposals title](../configuration.md#proposals-board), Apply [Create Proposals Board](../artifacts/board.md#create-proposals-board "ƒ"). The copy source and the title must meet [Proposals](../artifacts/board.md#proposals).

##### 2. Create Absent Theme Board

- When the selected theme board is absent:
- Use the owner, [repository](../artifacts/board.md#repository), theme title and originating proposal record when applicable.

- Require the originating proposal record in [Theme Provenance](../artifacts/board.md#theme-provenance) for a proposal-derived board; provide a missing-input finding when its designator is unavailable.

- Run [Find Board Template](../artifacts/board.md#find-board-template "ƒ") under [Board Owner](../artifacts/board.md#board-owner) with the exact [theme-template title](../configuration.md#theme-boards).

- Use the provided number as the copy source.

- Run [Copy Board Template](../artifacts/board.md#copy-board-template "ƒ") with that template number, the owner and the title required by [Theme Board Title](../artifacts/board.md#theme-board-title).

- Retain the new board number. The copy carries the [theme-board fields](../configuration.md#theme-boards).

- Run [Link Board to Repository](../artifacts/board.md#link-board-to-repository "ƒ") with the owner, new board number and [repository](../artifacts/board.md#repository).

- Retain the [Copied Board](../artifacts/board.md#copied-board) after linking succeeds.
- Require the new theme's label and board before an initiative takes that theme.

- The theme board must hold the theme's initiatives, epics, task issues and hot-fixes.

##### 3. Retain Copied Board

Retain the [Copied Board](../artifacts/board.md#copied-board) after the selected creation path succeeds.

#### Saved Board Delivery

- After the issue bodies and closures are saved:

##### 1. Read Current Delivery Evidence

- Read the issues, the board and its delivery records.
- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for the [Saved Identities](../artifacts/board-delivery.md#saved-identities).
- Apply [Read Board State](../artifacts/board.md#read-board-state "ƒ") for the selected board.
- Apply [Fetch All Delivery Pull Requests](../artifacts/pull-request.md#fetch-all-delivery-pull-requests "ƒ") for its repositories and items.
- Apply [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links "ƒ") for those records.
- Fetch the published agent review records linked from each open epic integration pull request, retaining absent or unreadable evidence as a handoff blocker.
- Apply [Read Board Configuration](../artifacts/board.md#read-board-configuration "ƒ").
- Run [Find User](../artifacts/board.md#find-user "ƒ").
- Retain these provided snapshots for the following computation.

##### 2. Plan Delivery Changes

- Run [Compute Board Changes](../artifacts/board-delivery.md#compute-board-changes "ƒ") to the captured evidence.
- Fetch each unresolved issue.
- Run [Compute Board Changes](../artifacts/board-delivery.md#compute-board-changes "ƒ") again, adding the fetched off-board issue records to the retained evidence.

##### 3. Apply and Confirm Calls

- Run each emitted call, including the assignee calls, which act on the issue rather than the board item.
- Apply [Read Board Configuration](../artifacts/board.md#read-board-configuration "ƒ") for each changed item to confirm its current status.

- If that item still shows the preceding status:
- Repeat its emitted write call.
- Apply [Read Board Configuration](../artifacts/board.md#read-board-configuration "ƒ") again for the same item. The item list can lag a write.

##### 4. Recompute Refreshed Board

- Fetch the issues and items again.
- Refresh the pull request metadata and linked published agent review records before recomputing statuses; either tip may have changed during the writes.
- Run [Compute Board Changes](../artifacts/board-delivery.md#compute-board-changes "ƒ") to the refreshed evidence, retaining every resolved off-board issue record.
- Stop when it emits no further call and every changed item has been confirmed. An issue added in one pass gets its status in the next.

##### 5. Retain Confirmed Board Statuses

Retain [Confirmed Statuses](../artifacts/board-delivery.md#confirmed-statuses) after every changed item has been confirmed, retaining any unresolved discrepancy.

### 13. Explain Each Change Entering Review

- For each epic newly confirmed In Review by the board step:

- Follow [Understand Mode](understand-mode.md "ƒ") with each epic review pull request, one run per base.
- Complete each overview before continuing; an initiative has no overview of its own. An issue already In Review when the sync began keeps the overview it has: the pull request it explains is the one already reviewed. A reviewer meets the overview on the pull request it explains. The run that integrates an epic base owns that epic's overview; this step writes one only where the board step confirms an epic In Review that integration did not already explain.

### 14. Report

- Provide saved delivery results and unresolved findings to the caller, or present them to the user for a direct request.

- Report queue decisions unevaluated by this run.

#### Closure Evidence Audit

- Select the repository holding the issues and the initiative, epics and tasks this run touched as [Audit Selection](../artifacts/issue.md#audit-selection).

- Fetch only the closed issues in [Audit Selection](../artifacts/issue.md#audit-selection) using [Authenticated Access](../artifacts/issue.md#authenticated-access), saving evidence to [Output Files](../artifacts/issue.md#output-files):
- For named issues, Run [Fetch Selected Closed Issues](../artifacts/issue.md#fetch-selected-closed-issues "ƒ") with their numbers.
- For the whole [repository](../artifacts/issue.md#repository), Run [Fetch Closed Issues](../artifacts/issue.md#fetch-closed-issues "ƒ").
- An empty collection means none of the named issues is closed; retain an empty audit result and continue to the per-issue report.

- Run [Capture Issue Links](../artifacts/issue.md#capture-issue-links "ƒ") with that collection; an unreadable relation is provided as a blocker and the sweep does not run.

- Run [Sweep Closure Evidence](../artifacts/issue.md#sweep-closure-evidence "ƒ") with the collection and the issue-links file.

- Retain [Closure Findings](../artifacts/issue.md#closure-findings) with each unsupported issue’s state reason and findings, and each unevaluable issue as missing evidence. List not-planned closures separately for reference. The audit changes no issue.

#### Per-Issue Report

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

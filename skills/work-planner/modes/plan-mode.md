# Plan Mode

Scopes the solution: the design, the criteria, and the breakdown of an initiative and its epics, and keeps them current as work lands.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

## Procedure

### 1. Take the Proposal

- When the user names a proposal, its associated issue body defines the problem scope.
- When the user names an initiative that already exists, Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for its body. That body defines the problem scope, and no proposal is raised for work it already carries.

- When neither a proposal nor an existing initiative is named:

- Follow [Propose Mode](propose-mode.md "ƒ") with the user's goal.
- Resume this selection step with its published proposal; an unresolved proposal blocks initiative drafting.

### 2. Prepare the Planning Record

- For an initiative, epic or complex plan, Apply [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record "ƒ") for the selected record with the supplied evidence files.
- Use [Layout](../artifacts/planning-record.md#layout) for draft paths.
- Apply [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record "ƒ") for the record's folder.

### 3. Draft Each Initiative Body

- For a new initiative, Apply [Select Tracker Number](../artifacts/issue.md#select-tracker-number "ƒ") for its proposed prefix with the initiative prefix letter.
- Apply [Draft Initiative Issue Body](../artifacts/initiative-issue-body.md#draft-initiative-issue-body "ƒ") for each initiative with the scoped proposal, confirmed goal clauses, requirement sources, epic summaries and an output path in the record's folder. The epics' acceptance criteria carry the detail that makes the initiative's criteria true.

### 4. Populate the Epics

- Ask once per initiative whether it uses lanes as an [Interview](../guidelines.md#modes), recommending a choice from its proposed parallel delivery. Reuse the initiative's recorded decision when it has one.
- For an initiative using lanes, propose each task row's [Lane](../artifacts/lane.md#index) index as a map for the user to confirm, assigning joined rows together as [Unit Consistency](../artifacts/lane.md#unit-consistency) requires. Record the confirmed map in the planning record. For an initiative without lanes, leave the row lanes empty.
- Apply [Populate Epic Issue Body](../artifacts/epic-issue-body.md#populate-epic-issue-body "ƒ") for each epic and each new task row, passing each confirmed optional lane index with the row and an output path in the record's folder.
- Apply [Populate Work Item](../artifacts/work-item.md#populate-work-item "ƒ") for each task with its scope, design, the component its implementation extends, criteria, test requirements and an output file in the record's folder.
- Register each draft body and provided work-item file in the planning record.
- Resolve Open Questions before work starts.
- Apply [Check Dependencies and Numbering](../artifacts/dependency-graph.md#check-dependencies-and-numbering "ƒ") across the drafts and the provided work-item files.
- Provide each epic draft and its format results to the review step.

### 5. Review the Drafts

- Apply [Review Initiative Goal](../artifacts/goal-trace.md#review-initiative-goal "ƒ").

- Apply [Report Review Finding](../artifacts/review-finding.md#report-review-finding "ƒ") for each provided finding, with its scope, evidence and proposed resolution.

- Apply each confirmed resolution to the drafts:

- For a local epic finding, Apply [Populate Epic Issue Body](../artifacts/epic-issue-body.md#populate-epic-issue-body "ƒ") with the confirmed Proposal, row and criterion changes, including every new or renumbered criterion in Coverage, retaining the same output path in the record's folder.

- For a confirmed distinct concern:

- Draft its own epic and initiative row.
- Repeat ordering review for the new epic and initiative row.

- Record the finding, resolution and decision in the planning record.

- Apply [Review Initiative Goal](../artifacts/goal-trace.md#review-initiative-goal "ƒ") again with the revised initiative and epic bodies and retained goal clauses and sources. No issue is created while a content or structural finding remains. Unresolved links to unpublished issues are recorded with their intended row identities and resolved during publication; no other finding is deferred.
- An acceptance criterion is created only once it meets [Initiative Acceptance Criteria](../artifacts/initiative-issue-body.md#initiative-acceptance-criteria).

### 6. Publish

- Put the proposed [Epic Priority](../artifacts/dependency-graph.md#epic-priority) map for the reviewed epics to the user as an [Interview](../guidelines.md#modes), the proposal the recommended answer.

- Take the positive integer the user confirms for each epic.
- Apply [Ensure Repository Labels](../artifacts/repository-labels.md#ensure-repository-labels "ƒ") with the required definitions, the priority label each confirmed number names among them, before saving the issues.

#### Parent Identity

- For a new initiative, Apply [Select Tracker Number](../artifacts/issue.md#select-tracker-number "ƒ") with the initiative prefix letter.
- For a new initiative, Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") for its draft with temporary epic-row links.
- For an existing initiative, retain its confirmed issue identity.
- On a failed save or disagreeing saved fields, provide the failure evidence and stop before further publication, saved-plan validation or delivery preparation.

#### Epic Publication

- For each new or revised epic in dependency order:

- Replace its temporary prerequisite links with the confirmed issue identities already provided by saves.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with its intended body and confirmed priority label, retaining an existing epic's issue identity.
- On a failed save or disagreeing saved fields, provide the failure evidence and stop before saving a dependent epic, validating the saved plan or preparing delivery.
- Use the provided saved identity in the initiative row and each dependent draft.

- After every epic is saved, confirm no unresolved epic placeholder remains in the initiative or epic bodies.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") for the initiative with its complete intended rows, for either parent path.
- On a failed parent save or disagreeing saved fields, provide the failure evidence and stop before saved-plan validation or delivery preparation.

#### Saved Validation

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for the initiative and every epic its saved Work Breakdown names.
- On unreadable or disagreeing saved context, provide the discrepancy and stop before validation or delivery preparation.
- Apply [Validate Epic Body](../artifacts/epic-issue-body.md#validate-epic-body "ƒ") for each epic with that fresh saved initiative context.
- Apply [Validate Initiative Body](../artifacts/initiative-issue-body.md#validate-initiative-body "ƒ") with every fresh saved epic.
- Apply [Review Initiative Goal](../artifacts/goal-trace.md#review-initiative-goal "ƒ") with the fresh saved bodies and retained goal clauses and sources.
- Apply [Check Dependencies and Numbering](../artifacts/dependency-graph.md#check-dependencies-and-numbering "ƒ") with the fresh saved bodies and the provided work-item files.
- Resolve findings in the drafts and repeat Epic Publication and Saved Validation with the affected bodies, retaining every saved issue identity; unresolved findings block delivery preparation.
- Continue only when the saved-context checks pass.
- Update the planning record with evidence, decisions and issue links.
- Apply [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record "ƒ") for the record's folder.

### 7. Keep the Goal Current

- When the goal, a criterion, a Problem, a Proposal or an epic changes:

- Apply [Review Initiative Goal](../artifacts/goal-trace.md#review-initiative-goal "ƒ") again with the revised bodies and current sources.
- Apply [Report Review Finding](../artifacts/review-finding.md#report-review-finding "ƒ") for each finding.
- Apply confirmed resolutions.
- Repeat that review until clear.
- After each round, Apply [Check Round of Edits](../artifacts/issue-body.md#check-round-of-edits "ƒ") on affected bodies.

- Whenever tasks, edges or a work item's component change, Apply [Check Dependencies and Numbering](../artifacts/dependency-graph.md#check-dependencies-and-numbering "ƒ") again.

- Put the proposed Epic Priority map to the user again where the edges or the contention moved an epic's number.
- Save each confirmed change as that epic's priority label.

- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with affected bodies, matching titles to current numbers and Coverage to current criteria.

- Keep the record's body files as the source for the next pass.
- Update work-item files and the README inventory for added, renamed or removed tasks.
- Update the planning record.
- Apply [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record "ƒ") for the record's folder.

### 8. Prepare Epic Delivery

- Before any task starts:

- Resolve every Open Question with the user.
- Record the answer.
- Update the affected bodies, removing each settled question.
- Split multi-condition criteria at the end of the list.
- Update Coverage for the split criteria.
- Apply [Check Epic Prerequisites](../artifacts/epic.md#check-epic-prerequisites "ƒ") with current initiative and prerequisite evidence; stop on a failed or incomplete result.
- After prerequisites pass, Apply [Prepare Delivery Bases](../artifacts/delivery-branches.md#prepare-delivery-bases "ƒ") with the project checkout.
- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request "ƒ") to retarget each affected open task pull request to its epic base.
- Repeat goal and ordering review on changed bodies before returning readiness.

### 9. Record Delivered Work

- When work has landed:

- Follow [Sync Mode](sync-mode.md "ƒ") for the affected initiative.

- For an unplaced task issue:

- Apply [Populate Epic Issue Body](../artifacts/epic-issue-body.md#populate-epic-issue-body "ƒ") with its new row and the output path in the record's folder.
- Save that body.
- Follow [Sync Mode](sync-mode.md "ƒ") again with the refreshed epic.

- Provide the saved delivery state or blockers.

## Outcomes

- **A scoped initiative.**
  The user has an initiative scoped to the proposal they named, or to a proposal raised for that problem.
- **Several initiatives.**
  One proposal may become several initiatives. A partition by solution maturity, such as an MVP demo, a functional prototype, and a production-intent version, is an example of that result. Those initiatives may run in series or in parallel. The example does not limit the partition.
- **A goal made true.**
  Each clause of the goal the user confirmed is made true by the initiative's criteria, and the epics the initiative lists are the work that delivers those criteria.
- **Epics that start together.**
  The user has settled which of the initiative's epics start alongside each other, from a proposal the dependency graph makes.
- **Review before creation.**
  Findings on that initiative are folded in before any of its issues are created.

# Align Mode

Brings one or more existing proposal, initiative, epic, task, and standalone issues and/or pull requests into line with the plan they belong to and structurally aligns them with the guidelines they are held to.

**Runs in:** the project checkout.

Alignment checks conformity to work-planning rules; judgement of content fitness belongs to goal review.

Follow the [Procedure](#procedure), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

## Prerequisites

Read these files first.

- [Issue](../artifacts/issue.md)
- [Initiative Issue Body](../artifacts/initiative-issue-body.md)
- [Proposal Body](../artifacts/proposal-body.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Issue Body](../artifacts/issue-body.md)
- [Acceptance Criteria](../artifacts/acceptance-criteria.md)
- [Task Body](../artifacts/task-body.md)
- [Standalone Body](../artifacts/standalone-body.md)
- [Goal Trace](../artifacts/goal-trace.md)
- [Review Finding](../artifacts/review-finding.md)
- [Dependency Graph](../artifacts/dependency-graph.md)
- [Requirement Characteristics](../references/requirement-characteristics.md)
- [Pull Request](../artifacts/pull-request.md)
- [Pull Request Body](../artifacts/pull-request-body.md)
- [Delivery Evidence](../artifacts/delivery-evidence.md)
- [Initiative](../artifacts/initiative.md)
- [Epic](../artifacts/epic.md)
- [Delivery Branches](../artifacts/delivery-branches.md)

## Procedure

### 1. Discover Every Issue

- Scope: issues the user names, an initiative with its open epics or a board with it's complete set of initiatives and epics.
- Open issues only. A closed issue is aligned only when named.
- Naming another initiative's issue approves format edits to it.
- An open standalone issue that an aligned initiative, epic, or task cites is aligned with it.

### 2. Fetch Each Issue

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for its JSON and body.
- A board fetch includes every initiative it holds.
- An initiative's fetch includes every epic its table links, closed epics included, as supplied context for validation.
- The fetch includes each source the initiative's References mark, for an epic as for the initiative.
- A closed epic's own body is checked only when the epic is named.

### 3. Validate the Bodies

- Apply [Validate Proposal Body](../artifacts/proposal-body.md#validate-proposal-body), Apply [Validate Initiative Body](../artifacts/initiative-issue-body.md#validate-initiative-body) or Apply [Validate Epic Body](../artifacts/epic-issue-body.md#validate-epic-body) for that kind.
- Apply [Validate Issue Body](../artifacts/issue-body.md#validate-issue-body) with [task field conditions](../artifacts/task-body.md#fields) or [standalone field conditions](../artifacts/standalone-body.md#fields) for those bodies.
- Supply the fetched context and output files.
- Apply [Check Reference Visibility](../artifacts/issue-body.md#check-reference-visibility) for each issue being aligned; carry its findings to the content-decisions step.
- Route the returned [Format Findings](../artifacts/issue-body.md#format-findings) through the following steps.

### 4. Publish Mechanical Fixes

- Confirm the returned diff changes structure only.

- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with that body and the returned title or label corrections, without asking.

### 5. Review the Goal

- For initiative or epic scope, Apply [Review Initiative Goal](../artifacts/goal-trace.md#review-initiative-goal) with the current initiative and epic evidence, confirmed goal clauses and marked sources.
- For proposal, task or standalone scope, Apply [Check Round of Edits](../artifacts/issue-body.md#check-round-of-edits) with the selected body, its kind's field conditions and format inputs; skip initiative goal review when no initiative is in scope.
- Apply [Report Review Finding](../artifacts/review-finding.md#report-review-finding) with each finding. Numbering changes affect only rows no pull request names.

### 6. Resolve Content Decisions

- Decide each non-mechanical finding with the user.

- Apply [Apply Body Corrections](../artifacts/issue-body.md#apply-body-corrections) with confirmed local resolutions, using the selected kind's template and field conditions.
- Move initiative boundaries found as Non-Goals in an epic or task into the initiative's Non-Goals.
- Remove the misplaced section.
- For a standalone body, Apply [Revise Standalone Body](../artifacts/standalone-body.md#revise-standalone-body).
- Apply [Revise Epic Rows](../artifacts/epic-issue-body.md#revise-epic-rows) with confirmed task splits and Coverage corrections.
- Replace an epic a task row names with the rows it consumes when correcting dependencies through the dependency step.

- For a wrong-kind body:

- Confirm either its rewrite to the intended template or its tracker kind/title change.
- Keep the initiative row consistent with any epic title change.

- When several row ids link one issue, obtain the user's choice between one issue per task and a shared reference.

- For a shared reference:

- Remove the row links.
- Cite that issue under the epic's References.

- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with returned bodies and metadata.

- Validate the affected bodies again.

### 7. Check Criteria

- Check every acceptance criterion of the issues being aligned against [Requirement Characteristics](../references/requirement-characteristics.md), through [Verifiable](../artifacts/issue-body.md#verifiable).

- Report each that fails it. The alignment is not clear while a criterion that fails the characteristics remains, and a finding from this check is not one the user keeps.
- Align the criteria with the sources the initiative's References mark, as [Sources](../artifacts/initiative-issue-body.md#sources) defines.
- Report each departure and each gap.
- Draft the criterion a gap calls for.
- Decide it with the user.
- The alignment is not clear while a marked source stays unread. A source whose link is dead is repaired, or the mark is removed and the criteria it bound are decided with the user.
- A departure from a marked source is corrected in the criterion, unless the user records the departure as a Non-Goal.

### 8. Check Dependencies

- Check them whenever an initiative or epic is aligned.

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for the initiative's body and every epic's body.
- Take each task row's work-item file from the planning record that registered it, which holds one per task whatever that row currently links, so contention is measured rather than reported as unchecked.
- Apply [Check Dependencies and Numbering](../artifacts/dependency-graph.md#check-dependencies-and-numbering) with those bodies, those work-item files, current pull request records, confirmed maps when any, and explicitly authorized outside-initiative files.
- Resume this alignment with its checked bodies or unresolved findings.
- Put each problem it reports to the user.

### 9. Coverage

- For a pull request explicitly selected for alignment, Apply [Repair Test Plan](../artifacts/pull-request-body.md#repair-test-plan), Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request) with a converted body, and report its URL. When no initiative or epic is selected, continue at step 13, Re-run.

- For initiative or epic scope, Apply [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence) with the fetched initiative, epic and task issue JSON.
- Continue with its returned records.
- For each task pull request in those records, Apply [Repair Test Plan](../artifacts/pull-request-body.md#repair-test-plan), then Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request) with each converted body. Report each converted pull request by URL and refresh its record before recording coverage.
- An epic review carries no task test plan.

- For each epic being aligned, Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) with its current JSON, returned pull request records and complete issue-link snapshot, task records, confirmed matches, project checkout, fetched epic bases and output body file:

**Unmet.**

- Each task the preceding Record Epic Delivery call reports unmet is a gap.
- Apply [Plan Gap Task](../artifacts/epic-issue-body.md#plan-gap-task) with the current epic JSON and body, delivered task row, unmet criterion ids, delivery records, complete issue-link snapshot, project checkout, fetched epic bases and output body path.
- For each criterion it returns as already holding, Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria), Apply [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria) with the verified ids, and Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with the returned body.

**Repair.**

- Repair Done cells as [Tables](../artifacts/issue-body.md#tables) states.
- When the preceding Record Epic Delivery call reports a row done, or a tick cleared, Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) from the output body file, without asking.

**Unlinked.**

- For a criterion ticked while its row links no pull request and no commit, Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for its discussion.
- Link the one delivery that discussion names, taking a path as the commit that holds it. Several candidates, or none, go to the user before linking.
- Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) again with the corrected evidence, the same epic bases and the same output body file.

- For an initiative being aligned:

- Apply [Record Initiative Delivery](../artifacts/initiative-issue-body.md#record-initiative-delivery) with the current initiative JSON, every linked epic's current JSON and an output body file.
- Present the returned [Delivery Findings](../artifacts/initiative.md#delivery-findings) to the user.

- When the user chooses to verify ready criteria now:

- Apply [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) with those criterion ids, current initiative body, delivery findings, delivery revisions, named instruments and the project checkout.
- Apply [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria) with only returned verified ids, the current initiative JSON, all linked epic records and output body file.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with the returned body.
- Report failed verification or deferred findings as pending; no criterion is ticked for them.

- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with a Done change in the output body, without asking.

- Report criterion evidence as [Coverage Reports](../artifacts/issue-body.md#coverage-reports) defines.

### 10. Branches

- For each open epic of the selected initiative:

- Apply [Check Epic Prerequisites](../artifacts/epic.md#check-epic-prerequisites) with the current initiative and epic bodies and prerequisite issue and base-merge records.
- Apply [Prepare Delivery Bases](../artifacts/delivery-branches.md#prepare-delivery-bases) with only a confirmed result, the project checkout, epic identity and changed long-lived branches.
- Return missing prerequisite evidence before creating a base.

- After preparing the bases, align the selected initiative's pull requests:

- Apply [Read Initiative Pull Requests](../artifacts/pull-request.md#read-initiative-pull-requests) with the initiative, epic and task issues this alignment fetched.
- For each open epic, Apply [Read Delivery Branches](../artifacts/delivery-branches.md#read-delivery-branches) in the project checkout, at the revision [Branches](../artifacts/delivery-branches.md#branches) names for a read of one epic. Unevaluable branch names stop this step with a finding.
- Use the returned long-lived target; for example, `main` and `i07/e00/main` identify the same target.
- Apply [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request) to point an open task pull request at its epic base.
- When that pull request is not mergeable, Apply [Update Task Branch](../artifacts/delivery-branches.md#update-task-branch) with the epic base, task branch and the unit checkout holding it. A conflict is reported and the pull request stays open.
- An open pull request whose head is an epic base targets its corresponding long-lived branch.
- A merged pull request is left as merged.
- A base that is none of these is put to the user.

### 11. Unplaced Task Issues

- For each task issue the preceding Record Epic Delivery call returned as unplaced:

- Draft its row against [Work Breakdown](../artifacts/epic-issue-body.md#work-breakdown).
- Confirm it with the user; an unanswered placement stays pending.
- Apply [Revise Epic Rows](../artifacts/epic-issue-body.md#revise-epic-rows) with the confirmed row.
- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) with the returned body.
- Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) again with the saved epic JSON, current task records, pull request records, complete issue-link snapshot, the project checkout, the fetched epic bases and the same output body file. An unanswered placement stays pending.

### 12. Review Pull Requests

- Apply [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) for each open epic, with the project checkout and its fetched epic bases.

- Open a reported base as a draft review pull request.
- Leave the epic open. A subsequent delivery or sync run establishes readiness from the completed delivery evidence.

### 13. Re-Run

- After a published correction:

- Fetch the changed bodies.
- Repeat steps 3–12 for the affected issues with refreshed delivery evidence.
- Stop when the checks are clear or every remaining finding is one the user chose to keep. A finding from the criteria check is not one the user keeps. The alignment is not clear while a criterion that fails [Requirement Characteristics](../references/requirement-characteristics.md) remains.

- With or without a correction:

- Report what changed on each issue, including each finding the criteria check reported.

## Outcomes

- **Issues brought into line.**
  The issues the user named, or an initiative and its open epics, agree with the plan they state, and the user has decided what still needs a judgement.
- **Delivery brought into line.**
  Each epic's recorded delivery matches the pull requests that landed, and a gap the user accepts is drafted with them.
- **Branches brought into line.**
  Each open epic's branches follow the delivery structure.

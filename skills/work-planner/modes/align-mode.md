# Align Mode

Brings one or more existing proposal, initiative, epic, task, and standalone issues and/or PRs into line with the plan they belong to and structurally aligns them with the guidelines they are held to. 

Alignment checks conformity to work-planning rules; judgement of content fitness belongs to goal review.

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
- [Delivery Evidence](../artifacts/delivery-evidence.md)
- [Initiative](../artifacts/initiative.md)
- [Epic](../artifacts/epic.md)
- [Delivery Branches](../artifacts/delivery-branches.md)

## Procedure

The main path meets [Outcomes](#outcomes).

1. **Discover every issue.**
   - Scope: issues the user names, an initiative with its open epics or a board with it's complete set of initiatives and epics.
   - Open issues only. A closed issue is aligned only when named.
   - Naming another initiative's issue approves format edits to it.
   - An open standalone issue that an aligned initiative, epic, or task cites is aligned with it.
2. **Fetch each issue.**
   - Use [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for its JSON and body.
   - A board fetch includes every initiative it holds.
   - An initiative's fetch includes every epic its table links, closed epics included, as supplied context for validation.
   - The fetch includes each source the initiative's References mark, for an epic as for the initiative.
   - A closed epic's own body is checked only when the epic is named.
3. **Validate the bodies.**
   - Call [Validate Proposal Body](../artifacts/proposal-body.md#validate-proposal-body), [Validate Initiative Body](../artifacts/initiative-issue-body.md#validate-initiative-body) or [Validate Epic Body](../artifacts/epic-issue-body.md#validate-epic-body) for that kind.
   - Run [Validate Issue Body](../artifacts/issue-body.md#validate-issue-body) with [task field conditions](../artifacts/task-body.md#fields) or [standalone field conditions](../artifacts/standalone-body.md#fields) for those bodies.
   - Supply the fetched context and output files.
   - Route the returned [Format Findings](../artifacts/issue-body.md#format-findings) through the following steps.
4. **Publish mechanical fixes.**
   Confirm the returned diff changes structure only.
   - Publish that body and the returned title or label corrections through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue), without asking.
5. **Review the goal.**
   - For initiative or epic scope, follow [Review Initiative Goal](../artifacts/goal-trace.md#review-initiative-goal) with the current initiative and epic evidence, confirmed goal clauses and marked sources.
   - For proposal, task or standalone scope, run [Check Round of Edits](../artifacts/issue-body.md#check-round-of-edits) with the selected body, its kind's field conditions and format inputs; skip initiative goal review when no initiative is in scope.
   - Present each finding through [Report Review Finding](../artifacts/review-finding.md#report-review-finding). Numbering changes affect only rows no pull request names.
6. **Resolve content decisions.**
   Decide each non-mechanical finding with the user.
   - Pass confirmed local resolutions to [Apply Body Corrections](../artifacts/issue-body.md#apply-body-corrections), using the selected kind's template and field conditions.
   - Move initiative boundaries found as Non-Goals in an epic or task into the initiative's Non-Goals.
   - Remove the misplaced section.
   - For a standalone body, call [Revise Standalone Body](../artifacts/standalone-body.md#revise-standalone-body).
   - Pass confirmed task splits and Coverage corrections to [Revise Epic Rows](../artifacts/epic-issue-body.md#revise-epic-rows).
   - Replace an epic a task row names with the rows it consumes when correcting dependencies through the dependency step.
   - For a wrong-kind body:
     - Confirm either its rewrite to the intended template or its tracker kind/title change.
     - Keep the initiative row consistent with any epic title change.
   - When several row ids link one issue, obtain the user's choice between one issue per task and a shared reference.
   - For a shared reference:
     - Remove the row links.
     - Cite that issue under the epic's References.
   - Publish returned bodies and metadata through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
   - Validate the affected bodies again.
7. **Check criteria.**
   Check every acceptance criterion of the issues being aligned against [Requirement Characteristics](../references/requirement-characteristics.md), through [Verifiable](../artifacts/issue-body.md#verifiable).
   - Report each that fails it. The alignment is not clear while a criterion that fails the characteristics remains, and a finding from this check is not one the user keeps.
   - Align the criteria with the sources the initiative's References mark, as [Sources](../artifacts/initiative-issue-body.md#sources) defines.
   - Report each departure and each gap.
   - Draft the criterion a gap calls for.
   - Decide it with the user.
   - The alignment is not clear while a marked source stays unread. A source whose link is dead is repaired, or the mark is removed and the criteria it bound are decided with the user.
   - A departure from a marked source is corrected in the criterion, unless the user records the departure as a Non-Goal.
8. **Check dependencies.**
   Check them whenever an initiative or epic is aligned.
   - Take the initiative's body and every epic's body with [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue).
   - Take each task row's work-item file from the planning record that registered it, which holds one per task whatever that row currently links, so contention is measured rather than reported as unchecked.
   - Follow [Check Dependencies and Numbering](../artifacts/dependency-graph.md#check-dependencies-and-numbering) with those bodies, those work-item files, current pull request records, confirmed maps when any, and explicitly authorized outside-initiative files.
   - Resume this alignment with its checked bodies or unresolved findings.
   - Put each problem it reports to the user. An initiative Depends on cell takes the epics it derives, as [Work Breakdown](../artifacts/initiative-issue-body.md#work-breakdown) states.
9. **Coverage.**
   When no initiative or epic is selected, continue at step 13, Re-run.
   - For initiative or epic scope, run [Read Delivery Evidence](../artifacts/delivery-evidence.md#read-delivery-evidence) for the selected initiative and epics.
   - Continue with its returned records.
   - For each epic being aligned, run [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) with its current JSON, the body file it was read from, returned pull request records and complete issue-link snapshot, task records, confirmed matches, project checkout and output body file:
     - **Unmet.**
       - Each task [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) reports unmet is a gap.
       - Follow [Plan Gap Task](../artifacts/epic-issue-body.md#plan-gap-task) with the current epic JSON and body, delivered task row, unmet criterion ids, delivery records, complete issue-link snapshot and output body path.
       - For each criterion it returns as already holding, run [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria), pass the verified ids to [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria), and publish through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
     - **Repair.**
       - Repair Done cells as [Tables](../artifacts/issue-body.md#tables) states.
       - When the preceding Record Epic Delivery call reports a row done, or a tick cleared, run [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue) from the output body file, without asking.
     - **Absent.**
       - Fetch a linked pull request missing from the records with [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state).
       - Repeat Record Epic Delivery with the refreshed records and the same output body file.
     - **Unlinked.**
       - For a criterion ticked while its row links no pull request and no commit, request issue discussion through [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue).
       - Link the one delivery that discussion names, taking a path as the commit that holds it. Several candidates, or none, go to the user before linking.
       - Repeat Record Epic Delivery with the corrected evidence and the same output body file.
   - For an initiative being aligned:
     - Run [Record Initiative Delivery](../artifacts/initiative-issue-body.md#record-initiative-delivery) with the current initiative JSON, every linked epic's current JSON and an output body file.
     - Present the returned [Delivery Findings](../artifacts/initiative.md#delivery-findings) to the user.
   - When the user chooses to verify ready criteria now:
     - Run [Verify Selected Criteria](../artifacts/acceptance-criteria.md#verify-selected-criteria) with those criterion ids, current initiative body, delivery findings, delivery revisions, named instruments and the project checkout.
     - Pass only returned verified ids to [Tick Verified Criteria](../artifacts/acceptance-criteria.md#tick-verified-criteria), with the current initiative JSON, all linked epic records and output body file.
     - Publish the returned body through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
     - Report failed verification or deferred findings as pending; no criterion is ticked for them.
   - Apply a Done change in the output body through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue), without asking.
   - Report criterion evidence as [Coverage Reports](../artifacts/issue-body.md#coverage-reports) defines.
10. **Branches.**
    For each open epic of the selected initiative:
    - Run [Check Epic Prerequisites](../artifacts/epic.md#check-epic-prerequisites) with the current initiative and epic bodies and prerequisite issue and base-merge records.
    - Pass only a confirmed result, project checkout, epic identity and changed long-lived branches to [Prepare Delivery Bases](../artifacts/delivery-branches.md#prepare-delivery-bases).
    - Return missing prerequisite evidence before creating a base.

    After preparing the bases, align the selected initiative's pull requests:
    - Read the pull requests through [Read Initiative Pull Requests](../artifacts/pull-request.md#read-initiative-pull-requests).
    - Read each open epic's branches through [Read Delivery Branches](../artifacts/delivery-branches.md#read-delivery-branches). Unevaluable branch names stop this step with a finding.
    - Use the returned long-lived target; for example, `main` and `i07/e00/main` identify the same target.
    - Point an open task pull request at its epic base with [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request).
    - When that pull request is not mergeable, [Update Task Branch](../artifacts/delivery-branches.md#update-task-branch) merges the epic base into the task branch. A conflict is reported and the pull request stays open.
    - An open pull request whose head is an epic base targets its corresponding long-lived branch.
    - A merged pull request is left as merged.
    - A base that is none of these is put to the user.
11. **Unplaced task issues.**
    For each task issue returned as unplaced by [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery):
    - Draft its row against [Work Breakdown](../artifacts/epic-issue-body.md#work-breakdown).
    - Confirm it with the user; an unanswered placement stays pending.
    - Apply the confirmed row through [Revise Epic Rows](../artifacts/epic-issue-body.md#revise-epic-rows).
    - Publish the returned body through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
    - Repeat Record Epic Delivery with the saved epic JSON, current task records, pull request records, complete issue-link snapshot and the same output body file. An unanswered placement stays pending.
12. **Review pull requests.**
    Run [Record Epic Delivery](../artifacts/epic-issue-body.md#record-epic-delivery) for each open epic.
    - Open a reported base as a draft review pull request.
    - Leave the epic open. The user marks the draft ready when the epic is complete.
13. **Re-run.**
    After a published correction:
    - Fetch the changed bodies.
    - Repeat steps 3–12 for the affected issues with refreshed delivery evidence.
    - Stop when the checks are clear or every remaining finding is one the user chose to keep. A finding from the criteria check is not one the user keeps. The alignment is not clear while a criterion that fails [Requirement Characteristics](../references/requirement-characteristics.md) remains.

    With or without a correction:
    - Report what changed on each issue, including each finding the criteria check reported.

## Outcomes

- **Issues brought into line.**
  The issues the user named, or an initiative and its open epics, agree with the plan they state, and the user has decided what still needs a judgement.
- **Delivery brought into line.**
  Each epic's recorded delivery matches the pull requests that landed, and a gap the user accepts is drafted with them.
- **Branches brought into line.**
  Each open epic's branches follow the delivery structure.

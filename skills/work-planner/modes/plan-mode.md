# Plan Mode

Scopes the solution: the design, the criteria, and the breakdown of an initiative and its epics, and keeps them current as work lands.

## Prerequisites

Read these files first.

- [Propose Mode](propose-mode.md)
- [Guidelines](../guidelines.md)
- [Planning Record](../artifacts/planning-record.md)
- [Pull Request Body](../artifacts/pull-request-body.md)
- [Pull Request](../artifacts/pull-request.md)
- [Issue](../artifacts/issue.md)
- [Initiative Issue Body](../artifacts/initiative-issue-body.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Work Item](../artifacts/work-item.md)
- [Repository Labels](../artifacts/repository-labels.md)
- [Issue Body](../artifacts/issue-body.md)
- [Epic](../artifacts/epic.md)
- [Delivery Branches](../artifacts/delivery-branches.md)
- [Sync Mode](sync-mode.md)
- [Review Finding](../artifacts/review-finding.md)
- [Goal Trace](../artifacts/goal-trace.md)
- [Dependency Graph](../artifacts/dependency-graph.md)

## Procedure

The main path meets [Outcomes](#outcomes).

1. **Take the proposal.**
   - When the user names a proposal, its associated issue body defines the problem scope.
   - When the user names an initiative that already exists, fetch its body with [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue). That body defines the problem scope, and no proposal is raised for work it already carries.
   - When neither a proposal nor an existing initiative is named:
     - Run [Propose Mode](propose-mode.md) with the user's goal.
     - Resume this selection step with its published proposal; an unresolved proposal blocks initiative drafting.
2. **Prepare the planning record.**
   - For an initiative, epic or complex plan, call [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record) with the record identity, folder and supplied evidence files.
   - For initiative or epic planning:
     - Populate a discussion body through [Populate Pull Request Body](../artifacts/pull-request-body.md#populate-pull-request-body).
     - Run [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request) as a draft with the planning branch, target, title and body file. Only the user decides to merge that discussion pull request.
3. **Draft each initiative body.**
   - For a new initiative, obtain its proposed prefix through [Select Tracker Number](../artifacts/issue.md#select-tracker-number) with the initiative prefix letter.
   - Run [Draft Initiative Issue Body](../artifacts/initiative-issue-body.md#draft-initiative-issue-body) for each initiative with the scoped proposal, confirmed goal clauses, requirement sources, epic summaries and output path. The epics' acceptance criteria carry the detail that makes the initiative's criteria true.
4. **Populate the epics.**
   Run [Populate Epic Issue Body](../artifacts/epic-issue-body.md#populate-epic-issue-body) for each epic and each new task row.
   - Call [Populate Work Item](../artifacts/work-item.md#populate-work-item) for each task with its scope, design, the component its implementation extends, criteria and test requirements.
   - Register each returned file in the planning record.
   - Resolve Open Questions before work starts.
   - Run [Check Dependencies and Numbering](../artifacts/dependency-graph.md#check-dependencies-and-numbering) across the drafts and the returned work-item files.
   - Return each epic draft and its format results to the review step.
5. **Review the drafts.**
   Follow [Review Initiative Goal](../artifacts/goal-trace.md#review-initiative-goal).
   - Run [Report Review Finding](../artifacts/review-finding.md#report-review-finding) for each returned finding, with its scope, evidence and proposed resolution.
   - Apply each confirmed resolution to the drafts:
     - For a local epic finding, call Populate Epic Issue Body with the confirmed Proposal, row and criterion changes, including every new or renumbered criterion in Coverage.
     - For a confirmed distinct concern:
       - Draft its own epic and initiative row.
       - Repeat ordering review for the new epic and initiative row.
   - Record the finding, resolution and decision in the planning record.
   - Repeat Review Initiative Goal with the revised initiative and epic bodies and retained goal clauses and sources. No issue is created while a content or structural finding remains. Unresolved links to unpublished issues are recorded with their intended row identities and resolved during publication; no other finding is deferred.
   - An acceptance criterion is created only once it meets [Initiative Acceptance Criteria](../artifacts/initiative-issue-body.md#initiative-acceptance-criteria).
6. **Publish.**
   Put the proposed [Epic Priority](../artifacts/dependency-graph.md#epic-priority) map for the reviewed epics to the user as an [Interview](../guidelines.md#modes), the proposal the recommended answer.
   - Take the positive integer the user confirms for each epic.
   - Call [Ensure Repository Labels](../artifacts/repository-labels.md#ensure-repository-labels) with the required definitions, the priority label each confirmed number names among them, before saving the issues.
   - For a new initiative:
     - Call [Select Tracker Number](../artifacts/issue.md#select-tracker-number) with the initiative prefix letter.
     - Save it through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue), using temporary epic-row links until issue identities exist.
     - Save the epics in dependency order, each carrying its confirmed priority label.
     - Replace every temporary link in the initiative and epic bodies with the saved issue identity.
     - Confirm no unresolved epic placeholder remains.
   - Call [Validate Epic Body](../artifacts/epic-issue-body.md#validate-epic-body) with the saved initiative context.
   - Call [Validate Initiative Body](../artifacts/initiative-issue-body.md#validate-initiative-body) with every saved epic.
   - Resolve findings.
   - Save the corrected bodies.
   - Update the planning record with evidence, decisions and issue links.
7. **Keep the goal current.**
   When the goal, a criterion, a Problem, a Proposal or an epic changes:
   - Repeat Review Initiative Goal with the revised bodies and current sources.
   - Run Report Review Finding for each finding.
   - Apply confirmed resolutions.
   - Repeat that review until clear.
   - After each round, run [Check Round of Edits](../artifacts/issue-body.md#check-round-of-edits) on affected bodies.
   - Whenever tasks, edges or a work item's component change, repeat Check Dependencies and Numbering.
     - Put the proposed Epic Priority map to the user again where the edges or the contention moved an epic's number.
     - Save each confirmed change as that epic's priority label.
   - Save affected bodies through Save Tracker Issue, matching titles to current numbers and Coverage to current criteria.
   - Keep local body files as the source for the next pass.
   - Update work-item files and the README inventory for added, renamed or removed tasks.
   - Update the discussion pull request body and planning record.
   - Commit.
   - Push.
8. **Prepare epic delivery.**
   Before any task starts:
   - Resolve every Open Question with the user.
   - Record the answer.
   - Update the affected bodies, removing each settled question.
   - Split multi-condition criteria at the end of the list.
   - Update Coverage for the split criteria.
   - Run [Check Epic Prerequisites](../artifacts/epic.md#check-epic-prerequisites) with current initiative and prerequisite evidence; stop on a failed or incomplete result.
   - After prerequisites pass, call [Prepare Delivery Bases](../artifacts/delivery-branches.md#prepare-delivery-bases).
   - Run [Publish Pull Request](../artifacts/pull-request.md#publish-pull-request) to retarget each affected open task pull request to its epic base.
   - Repeat goal and ordering review on changed bodies before returning readiness.
9. **Record delivered work.**
   When work has landed:
   - Run [Sync Mode](sync-mode.md) for the affected initiative.
   - For an unplaced task issue:
     - Add its row through Populate Epic Issue Body.
     - Save that body.
     - Repeat Sync Mode with the refreshed epic.
   - Return the saved delivery state or blockers.

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

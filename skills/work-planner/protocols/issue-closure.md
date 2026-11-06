# Issue Closure

Fresh closure evidence assembled across an issue and its linked pull requests, and the closure it permits.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

## Procedure

### 1. Issue

- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for the issue selected by the delivery checks.
- Apply [Capture Issue Development](../artifacts/issue.md#capture-issue-development "ƒ") for that issue.

### 2. Pull Requests

- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") for every captured link, across repositories and all states.
- Use a fresh destination file so an earlier snapshot cannot supply membership.

### 3. Check Delivery Completion

- For a task or a hot-fix, retain the task delivery result its delivering pull request established.

#### Epic Completion

- For an epic:
- Apply [Read Delivery Branches](../artifacts/delivery-branches.md#read-delivery-branches "ƒ") in the project checkout for the complete expected bases, at the revision [Branches](../artifacts/delivery-branches.md#branches) names for a read of one epic.
- Apply [Read Pull Request State](../artifacts/pull-request.md#read-pull-request-state "ƒ") for their merge evidence.
- Use the current delivery and criterion evidence and confirmed base-merge records.

- Apply [Check Epic Readiness](../artifacts/epic.md#check-epic-readiness "ƒ") against current delivery and verification evidence.

- Reconcile the expected bases with the task delivery targets.

- Confirm from [Base Merges](../artifacts/epic.md#base-merges) that every base has merged into its corresponding long-lived branch. An unknown or incomplete base list, or missing merge evidence, leaves completion unconfirmed even when every task is delivered and every criterion is ticked.

- Retain the completion result in [Delivery State](../artifacts/epic.md#delivery-state), identifying remaining blockers. Passing normal delivery checks supplies the evidence for the closure step; the tracker issue's current Development-link gate still governs the write.

#### Initiative Completion

- For an initiative:
- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for every linked epic.
- Use the current initiative JSON, all linked epic records, criterion verification evidence and captured Development links and pull requests.

- Evaluate [Initiative Record](../artifacts/initiative.md#initiative-record), [Epic Records](../artifacts/initiative.md#epic-records), [Verification Evidence](../artifacts/initiative.md#verification-evidence) and [Development Evidence](../artifacts/initiative.md#development-evidence) against [Delivery State](../artifacts/initiative.md#delivery-state).

- Identify each missing, open or cancelled epic, each unverified or unticked criterion, and each unmerged or unreadable Development-linked pull request. Incomplete link evidence leaves completion unconfirmed.

- Retain the completion result and its supporting issue identities, evidence revisions and blockers. Passing normal delivery checks supplies the caller's closure evidence; the tracker issue's current Development-link gate still governs the write.

#### Completion Result

- Provide any incomplete or failed result before closure.

### 4. Close

- Use the issue identity and successful normal delivery result.

- Apply [Capture Issue Development](../artifacts/issue.md#capture-issue-development "ƒ") for the issue in [Identity](../artifacts/issue.md#identity), saving its current JSON and Development snapshot to [Output Files](../artifacts/issue.md#output-files).
- The issue's entire Development field establishes membership, across repositories and states. Titles, branch names, body mentions and a list filtered to one initiative do not. An empty field adds no [pull request](../artifacts/pull-request.md#identity) requirement.

- Run [Check Issue Closure](../artifacts/issue.md#check-issue-closure "ƒ") with those two files.

- Require the normal delivery checks in [Delivery Evidence](../artifacts/issue.md#delivery-evidence) to pass, every criterion to be verified and ticked, and every currently linked pull request to be merged.
- Keep the issue open for an open, draft or closed-without-merge linked pull request, and for links never read.
- Retain an abandoned or incorrect Development link for the user's decision on its removal in the Incorrect Link branch below. A replacement pull request does not remove the requirement on a link still present.

- Repeat the Development-link gate immediately before the write.

- Apply [Capture Issue Development](../artifacts/issue.md#capture-issue-development "ƒ") immediately before closure.

- Run [Check Issue Closure](../artifacts/issue.md#check-issue-closure "ƒ") with the issue and Development files it wrote, using absolute evidence paths when changing directory.

- Require exit 0 and passing normal checks from [Delivery Evidence](../artifacts/issue.md#delivery-evidence); a sync report of closable does not permit skipping this gate.

- Immediately after the gate passes, Run [Set Completed State](../artifacts/issue.md#set-completed-state "ƒ") with the issue's [repository](../artifacts/issue.md#repository) and number and the passing evidence.

- Retain the saved [State](../artifacts/issue.md#state) or [Closure Findings](../artifacts/issue.md#closure-findings) with the failure.

- Retain the confirmed [State](../artifacts/issue.md#state) or [Closure Findings](../artifacts/issue.md#closure-findings) identifying the closure blocker.

#### Missing Evidence

- If the operation reports missing evidence:
- Refresh those inputs.
- Repeat the completion check before trying again.

#### Incorrect Link

- If the operation returns an abandoned or incorrect link:
- Obtain the user's decision on removing it.
- On a decision to remove, Apply [Access Development Links](../artifacts/pull-request.md#access-development-links "ƒ") with the link's pull request and issue identities, the removal request, that decision and the confirmed repository setting.
- Repeat from the issue step.

#### Closure Result

- Report any unmerged link or unmet criterion.
- Provide the confirmed [State](../artifacts/issue.md#state) or [Closure Findings](../artifacts/issue.md#closure-findings) with the closure blocker.

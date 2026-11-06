# Epic

An epic's prerequisite evidence, task delivery findings, integration readiness and completion state.

## Operations

### Check Epic Prerequisites

The evidence required before starting an epic's work.

#### 1. Identify Named Prerequisites

Identify each prerequisite the initiative row in [Initiative Evidence](#initiative-evidence) names for [Epic Body](#epic-body).

#### 2. Apply Whole-Epic Dependency

Apply the initiative's [whole-epic dependency rule](initiative-issue-body.md#work-breakdown); a task row's reference to a row of another epic gates that row rather than this epic.

#### 3. Confirm Prerequisite Delivery

Confirm from [Prerequisite Records](#prerequisite-records) that each prerequisite epic is closed as completed and every one of its bases has merged. Missing records leave the prerequisite unconfirmed.

#### 4. Provide Prerequisite Evidence

Provide the [Prerequisite Evidence](#prerequisite-evidence), identifying each confirmed prerequisite and missing condition. Only a confirmed result permits an unstarted epic's bases to be created or its task to be dispatched.

### Inspect Epic Delivery

The delivery findings for one epic from supplied evidence.

#### 1. Match Supplied Delivery

- Run [Match Pull Requests](#match-pull-requests "ƒ") for the selected epic, using a local scratch output body.
- A closed epic is normalized to the current Work Breakdown columns before its tasks are read, using the shared format rules. Ambiguous or unsupported table content is a blocker.
- For reported table normalization, Apply [Save Tracker Issue](issue.md#save-tracker-issue "ƒ"), fetch the saved epic and repeat the match before returning its evidence.

#### 2. Provide Delivery Findings

Provide the [Delivery Findings](#delivery-findings); missing linked pull requests are missing evidence for the caller to supply.

### Check Epic Readiness

The epic's eligibility for integration from current delivery and criterion evidence.

#### 1. Inspect Current Delivery

Apply [Inspect Epic Delivery](#inspect-epic-delivery "ƒ") for the selected epic.

#### 2. Confirm Integration Conditions

Confirm every task is delivered, every epic criterion has current [Verification Evidence](#verification-evidence) and is ticked, and no open question or unresolved delivery discrepancy remains. An unmerged epic base awaiting integration is expected at this stage. Missing or stale verification leaves readiness unconfirmed.

#### 3. Provide Integration Readiness

Provide the integration readiness in [Delivery State](#delivery-state), with the evidence revisions and each blocker. Readiness establishes the epic's content conditions; the caller supplies pull-request review, target and head-check evidence for the merge.

## Commands

### Match Pull Requests

Report an epic's delivery state against the pull requests that name it and provide [Delivery Findings](#delivery-findings "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;epic-json-file&gt;**](#epic-record "○")' &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-links "○")' &#92;
  --fix '[**&lt;epic-body-file&gt;**](#output-body "○")'
</pre></big>

## Fields

### Prerequisite Evidence

Each prerequisite has its issue identity and completion state, expected delivery bases and their merge evidence. The result identifies confirmed and missing conditions for the candidate epic.

### Delivery State

The epic is identified by its repository and issue number. Its state contains task delivery findings, criterion verification and ticks, open questions, expected delivery bases and their merges, and the revisions supporting the evidence. Integration readiness and completion are separate results, each with its unresolved conditions. An epic may be ready to integrate while one or more bases await merging.

### Delivery Findings

| Line | What it names |
| --- | --- |
| Normalized | Closed-epic table corrections present in the output body. |
| Retitle | A merged pull request linked by a task row whose title has no prefix or only a matching initiative or task prefix, or any pull request whose title names an epic of the initiative by a task id, with the required title for publication and readback. |
| Conflict | Tasks that share a pull request and do not name each other in Joins. A row linked to a pull request whose title names another epic. |
| Unmatched | A merged pull request that names the epic and that no row links. |
| In flight | An open pull request that names the epic and that no row links. A pull request whose head is an epic base is not a task match. |
| Draft | An epic base a merged task targets that holds a commit its long-lived branch lacks and has no open pull request merging it, while a task is undelivered or a criterion is unticked. A base level with or behind its branch is not draft. |
| Unmerged | An epic base its pull requests target that has not merged into its long-lived branch, once every task is delivered and every criterion is ticked. A draft pull request is named draft. |
| References | A review pull request whose cited pull requests differ from the task pull requests merged into its base. |
| Changes | A review pull request whose Changes section names, in a code span, a file absent from the head commit of the base it fronts, with that span. A span, less any `#anchor` or `:line` suffix, names a path when it holds a directory and carries an extension or opens with a top-level directory of that head, or is a bare name whose extension a file at that head carries; a component `<branch>:<path>` names its path only for the base of that branch. A path stands where the head holds a file or a directory at it. |
| Uncited | A linked pull request whose task has its own issue and does not link it, or a review pull request that does not link the epic's issue. |
| Note | A row that links its task issue. |
| Unchanged | A row that links a task issue the run was not given. Its Done cell stands, and the epic is not closable until a run is given that issue. |
| Unplaced | A task issue of this epic whose id is not a row. |
| Open questions | The epic's Open Questions section remains. |
| Ready to verify | An unticked criterion whose delivering rows are all delivered and whose linked passed checks do not settle it. |
| Ticked early | A criterion ticked while a delivering row is not delivered. |
| Disagreement | A linked pull request's test plan against the Coverage of the rows it delivers. |
| Target | An open or merged pull request naming the epic off its delivery routes: a task pull request into anything but one of the epic's bases, or an integration pull request into anything but the long-lived branch its head names. Each names the base it belongs in: for a task pull request, the epic base of the long-lived branch its task branch's last slug word names where another of the epic's pull requests comes from a branch of the same stem ending in another long-lived branch, as a unit changing several takes one task branch per base; else of the one its target names; else each epic base as one of them. |
| No epic | A pull request whose title opens with the initiative's id, `[I07`, and names neither an epic as `[I07:E00]` nor a task as `[I07:E00:W01]`: a bare `[I07]`, or an epic id in any other form, such as `[I07:E1]`. Nothing reads it as delivery. |
| Source | The configuration path, commit and repository of each `config/branches` statement the long-lived branch names were read from. |
| Unevaluable | A `config/branches` statement that is absent, empty or unreadable at its epic base, or a revision resolving to no commit, with its source; statements that disagree across the epic bases, each with its source and names; no long-lived branches given; a base that would be draft whose commits cannot be compared with its long-lived branch; or a review whose head commit the checkout does not hold, so its Changes paths are unread; each with the reason. |
| Not checked | Each epic check that reads the long-lived branches, while their names are unevaluable. |

An unmet row links a merged pull request while a covered criterion remains unticked. A linked pull request naming another epic is a conflict and delivers its linked task once merged. A missing linked pull request leaves the supplied evidence incomplete.

A coverage disagreement identifies the pull request and row, a criterion absent from either the test plan or row Coverage, an empty Test cell, or prose assigning the criterion to another task. Recording links, verified criteria and Done continues despite that finding.

### Epic Record

The supplied complete current epic issue JSON. eg `issue-943.json`

### Initiative Evidence

The current initiative body and row, including each prerequisite the row names.

### Prerequisite Records

The current issue and base-merge records for every prerequisite named by the initiative row.

### Pull Request Records

The supplied current pull request records for the epic. eg `prs.json`

### Issue Links

The complete supplied snapshot of the pull requests' Development-linked issues. eg `links.json`

### Verification Evidence

The criterion verification evidence for the current delivery revisions.

### Base Merges

The complete expected epic-base list and each base's merge evidence into its corresponding long-lived branch.

### Output Body

The supplied local scratch destination for the corrected epic body. eg `epic-body.md`

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.

### Epic Body

The supplied complete current epic body text.

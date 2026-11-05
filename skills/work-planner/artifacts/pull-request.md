# Pull Request

A pull request's identity, head and base, issue links, review state and merge result. Its populated body is an input.

## Prerequisites

Read these files first.

- [Issue](issue.md)
- [Delivery Branches](delivery-branches.md)
- [Agent Review](agent-review.md)
- [Hot-fix](hotfix.md)

## Operations

### Merge Delivery Pull Request

One task or epic pull request's merge result, or its handoff for human approval.

**Inputs:** [Identity](#identity), [Kind](#kind), [Verified Head](#verified-head), [Target Requirements](#target-requirements), [Readiness Evidence](#readiness-evidence), [Repository Prerequisite](#repository-prerequisite).

**Outputs:** [Merge Result](#merge-result), [Failure](#failure).

#### 1. Read Target Review Requirements

- Read the supplied target branch's current required reviews and checks alongside the verified head. A branch whose protection or active rules require an approving review takes that review from a person. An agent cannot approve a pull request it opened; on such a branch, the merge belongs to the reviewer even when every other condition holds.
- Report the pull request as ready for approval, naming what was verified.
- Stop merge attempts. This handoff is a finished outcome.
- Keep approval with that reviewer. Another account, an administrative bypass or a setting change cannot supply it. Changing repository protection requires the user's explicit authorization, asked for separately.
- For example, workflow-server's `main` requires one approving review, so carry an epic to ready and stop.

#### 2. Merge Approved Delivery

- When approval permits the agent to merge:
- Apply [Merge Pull Request](#merge-pull-request) for a task or Apply [Merge Epic Pull Request](#merge-epic-pull-request) for an epic, passing the verified readiness evidence and authorization result. For an epic, also supply the target requirements and exact verified head SHA.
- If GitHub refuses the merge, return the refusal to the caller for fresh verification.
- If the agent's own permission layer refuses it, the harness declines to run the merge command and GitHub returns nothing. On a target with no review requirement, that refusal is neither a handoff for approval nor a branch blocker. Return the pull request as ready and verified, naming the refusal and the [merge permission](#merge-permission) it lacks, and stop merge attempts. A later Deliver run merges it in its merge step or reports the missing permission; neither asks the user to approve it.

#### 3. Return Delivery Merge Result

Return the merge result, including its merge commit when supplied, for the caller's readback.

### Access Development Links

The observed or updated Development relation for a pull request.

**Inputs:** [Identity](#identity), [Authenticated Access](#authenticated-access), [Link Request](#link-request); for an edit, [Issue Identity](#issue-identity) and [Repository Prerequisite](#repository-prerequisite); for removal, [Removal Decision](#removal-decision).

**Outputs:** [Development Relation](#development-relation), [Failure](#failure).

#### 1. Read Complete Development Relation

- For a read-only request:
- Apply [Read Pull Request State](#read-pull-request-state) for the pull request's metadata, which carries the `html_url` the capture keys it by.
- Apply [Capture Pull Request Links](#capture-pull-request-links) with that record and return its entry, every page read. An unreadable relation is a blocker, not an empty link set.

#### 2. Edit Authorized Development Relation

- For a link edit:
- Take the supplied repository prerequisite from [Repository Prerequisite](#repository-prerequisite); an unconfirmed setting blocks the edit.
- For an addition, Apply [Set Development Link](#set-development-link) with the pull request and issue identities.

- For removal of an abandoned or incorrect link:
- Require the supplied user decision.
- Apply [Remove Development Link](#remove-development-link) with those identities.

#### 3. Return Verified Relation

Return the relation the command verified from both ends, or the discrepancy or failure it names. A failed write is a blocker carrying its operation and error, never an unavailable field.

### Fetch Pull Request Issue Links

The complete issue-link snapshot for a supplied set of pull requests.

**Inputs:** [Pull Request Records](#pull-request-records), [Authenticated Access](#authenticated-access), [Link-Snapshot Path](#link-snapshot-path).

**Outputs:** [Issue-Link Snapshot](#issue-link-snapshot), [Failure](#failure).

#### 1. Capture Complete Issue Links

Apply [Capture Pull Request Links](#capture-pull-request-links) with `prs.json` and destination `links.json`.

#### 2. Require Complete Relation Evidence

If it names an unreadable relation, stop and return each one named as a blocker. Incomplete evidence is never a partial snapshot.

#### 3. Refresh Changed Link Snapshot

After a link changes, Apply [Capture Pull Request Links](#capture-pull-request-links) again with the refreshed pull request records, the same authenticated access and destination.

#### 4. Return Complete Snapshot

Return the snapshot for the scripts' `--links` input.

### Link Pull Request to Issue

The verified delivery-issue relation for a pull request.

**Inputs:** [Identity](#identity), [Issue Identity](#issue-identity), [Pull Request Records](#pull-request-records), [Link-Snapshot Path](#link-snapshot-path), [Authenticated Access](#authenticated-access), [Repository Prerequisite](#repository-prerequisite).

**Outputs:** [Development Relation](#development-relation), [Issue-Link Snapshot](#issue-link-snapshot), [Failure](#failure).

#### 1. Add Development Relation

Apply [Access Development Links](#access-development-links) with the supplied identities, requested link addition and confirmed repository prerequisite.

#### 2. Require Verified Edit

Stop on a blocker or an unverified edit.

#### 3. Refresh Issue-Link Snapshot

Apply [Fetch Pull Request Issue Links](#fetch-pull-request-issue-links) with the current records and destination after the edit.

#### 4. Return Relation Evidence

Return the verified relation and refreshed snapshot.

### Merge Epic Pull Request

The epic's verified merge into its long-lived target.

**Inputs:** [Identity](#identity), [Verified Head](#verified-head), [Target Requirements](#target-requirements), [Readiness Evidence](#readiness-evidence), [Merge Authorization](#merge-authorization).

**Outputs:** [Merge Result](#merge-result), [Failure](#failure).

#### 1. Require Epic Merge Evidence

Require the supplied target requirements, readiness evidence and authorization.

#### 2. Submit Verified Epic Merge

Apply [Submit Epic Merge](#submit-epic-merge) with the exact head whose checks and target requirements were verified; return a refusal without continuing.

#### 3. Read Epic Merge Result

Apply [Read Merge Result](#read-merge-result) for that pull request.

#### 4. Confirm Exact Merge State

Confirm the merged state, merge commit, verified head and target.

#### 5. Return Epic Merge Result

Return the result or discrepancy.

### Fetch All Delivery Pull Requests

The pull request collection covering every supplied board repository and every pull request the board's issues link.

**Inputs:** [Repository List](#repository-list), [Issue Records](#issue-records), [Collection Path](#collection-path).

**Outputs:** [Pull Request Records](#pull-request-records), [Failure](#failure).

#### 1. Create Fresh Pull Collection

Apply [Fetch Repository Delivery Pull Requests](#fetch-repository-delivery-pull-requests) for the first repository and destination `prs.json`. This replaces the destination with a fresh collection.

#### 2. Stop on Initial Failure

Stop on failure.

#### 3. Append Remaining Repositories

Apply [Append Repository Delivery Pull Requests](#append-repository-delivery-pull-requests) for each further repository, passing the same destination.

#### 4. Fetch Plan-Linked Pull Requests

Apply [Fetch Linked Pull Requests](#fetch-linked-pull-requests) with that destination and the board items file.

#### 5. Report Incomplete Fetch

If any fetch failed, return incomplete evidence.

#### 6. Return Complete Pull Collection

Return the complete collection only after every fetch succeeds.

### Read Initiative Pull Requests

The current delivery pull requests for one initiative: each one whose title names it, and each one its plan links, whatever its title.

**Inputs:** [Repository](#repository), [Initiative Prefix](#initiative-prefix), [Issue Records](#issue-records), [Collection Path](#collection-path).

**Outputs:** [Pull Request Records](#pull-request-records), [Failure](#failure).

#### 1. Fetch Initiative-Prefixed Pull Requests

Apply [Fetch Initiative Pull Requests](#fetch-initiative-pull-requests) with the supplied repository and prefix, saving the collection to the supplied file.

#### 2. Fetch All Plan-Linked Pull Requests

Apply [Fetch Linked Pull Requests](#fetch-linked-pull-requests) with that collection and the supplied issue files.

#### 3. Return Initiative Pull Collection

Return the collection, or an incomplete-fetch finding naming each unreadable relation or pull request.

### Read Pull Request State

One current pull request and its requested supporting records.

**Inputs:** [Identity](#identity), [Output Files](#output-files), [Record Selection](#record-selection).

**Outputs:** [Pull Request Record](#pull-request-record), [Changed Paths](#changed-paths), [Reviews](#reviews), [Failure](#failure).

#### 1. Save Complete Pull Response

Apply [Save Pull Request Snapshot](#save-pull-request-snapshot) with the pull request identity and destination JSON path.

#### 2. Fetch Requested Supporting Records

Apply [Fetch Pull Request Files](#fetch-pull-request-files) or Apply [Fetch Pull Request Reviews](#fetch-pull-request-reviews) when the caller requests those records.

#### 3. Return Requested Pull Records

Return the snapshots or missing evidence.

### Publish Pull Request

One pull request created or updated from supplied content and metadata.

**Inputs:** [Repository](#repository), [Kind](#kind), [Selected Changes](#selected-changes); [Identity](#identity) for an existing pull request; [Body File](#body-file) for creation or body replacement; for creation with a delivery issue, [Issue Identity](#issue-identity), [Repository Prerequisite](#repository-prerequisite) and [Link-Snapshot Path](#link-snapshot-path).

**Outputs:** [Pull Request Record](#pull-request-record), [Failure](#failure).

#### 1. Create Delivery Pull Request

- For creation, Apply [Open Task Pull Request](#open-task-pull-request) or Apply [Open Epic Pull Request](#open-epic-pull-request) for the supplied kind, body, title, head and base.
- For a task or epic pull request with a delivery issue, Apply [Link Pull Request to Issue](#link-pull-request-to-issue) with it, the supplied delivery issue, that confirmed setting and the snapshot destination, meeting [Issue Links](#issue-links).

#### 2. Update Selected Pull Fields

For an existing pull request, Apply [Patch Pull Request Body](#patch-pull-request-body), Apply [Retitle Pull Request](#retitle-pull-request) or Apply [Retarget Pull Request](#retarget-pull-request) for the supplied changes, preserving other fields.

#### 3. Read Saved Pull State

Apply [Read Pull Request State](#read-pull-request-state) again.

#### 4. Return Saved Pull Record

Return the saved state or discrepancy.

### Locate Review Pull Request

The review pull request for a supplied epic base.

**Inputs:** [Repository](#repository), [Head Branch](#head-branch).

**Outputs:** [Review Number](#review-number), [Failure](#failure).

#### 1. Find Epic Review Pull

Apply [Find Review Pull Request](#find-review-pull-request) with the supplied head.

#### 2. Return Review Pull Number

Return its number or an absent-review finding.

### Read Head Evidence

The check-run and status evidence for one literal head commit.

**Inputs:** [Repository](#repository), [Verified Head](#verified-head), [Output Files](#output-files).

**Outputs:** [Head Checks](#head-checks), [Head Status](#head-status), [Failure](#failure).

#### 1. Fetch Literal Head Checks

Apply [Fetch Head Check Runs](#fetch-head-check-runs) for the supplied literal SHA.

#### 2. Fetch Literal Head Status

Apply [Fetch Head Status](#fetch-head-status) for the same SHA.

#### 3. Return Current Head Evidence

Return both snapshots, retaining missing or pending evidence as unresolved. The caller compares them with supplied target requirements and current reviews.

### Merge Task Pull Requests

Merges each open task pull request whose test plan has passed.

**Inputs:** [Identity](#identity), [Base Branch](#base-branch), [Project Checkout](#project-checkout), [Unit Checkout](#unit-checkout), [Repository Prerequisite](#repository-prerequisite), [Readiness Evidence](#readiness-evidence).

**Outputs:** [Merge Result](#merge-result), [Failure](#failure).

#### 1. Confirm Repository and Base

Apply [Confirm Repository Auto-Close](issue.md#confirm-repository-auto-close) for the repository, and confirm the task pull request's base, as [Task Branches](delivery-branches.md#task-branches) names it. An epic base carries no review requirement of its own; carry any applicable target review requirement into the merge step.

#### 2. Merge Verified Task Pull

- Merge the task pull request.
- Where its base is an epic base, Apply [Update Epic Base](delivery-branches.md#update-epic-base) with the project checkout and that base.
- Apply [Fetch Merge Readiness](#fetch-merge-readiness) for the task pull request and its base.
- Apply [Merge Delivery Pull Request](#merge-delivery-pull-request) with delivery kind task, the verified head, target requirements, repository prerequisite and passing evidence, without further confirmation.
- Stop on a handoff for human approval or a permission-layer refusal, returning it to the caller.

- If GitHub refuses the merge:
- Apply [Update Task Branch](delivery-branches.md#update-task-branch) with the unit checkout, the task branch and its base.
- Apply [Fetch Merge Readiness](#fetch-merge-readiness) again for the updated task head.
- Apply [Merge Delivery Pull Request](#merge-delivery-pull-request) once more with that verified evidence. A conflict or repeated refusal leaves the pull request open with the blocker reported.

#### 3. Confirm Task Merge Result

- Apply [Read Pull Request State](#read-pull-request-state) to confirm the merged state, head, base and merge commit.
- Return that result to the caller.

### Fetch Merge Readiness

The current pull request's readiness against its target requirements and head checks.

**Inputs:** [Identity](#identity), [Base Branch](#base-branch), [Output Files](#output-files).

**Outputs:** [Verified Head](#verified-head), [Target Requirements](#target-requirements), [Readiness Evidence](#readiness-evidence), [Failure](#failure).

#### 1. Read Current Pull Head

- Apply [Read Pull Request State](#read-pull-request-state) with the pull request identity and destination `epic-pr.json`.
- Retain the literal head SHA and target branch for the evidence calls.

#### 2. Read Current Target Requirements

- Apply [Read Target Requirements](delivery-branches.md#read-target-requirements) with the repository, target and protection/rules output paths.
- Carry any unresolved requirement into the readiness result.

#### 3. Read Literal Head Evidence

- Read the head evidence.
- Apply [Read Head Evidence](#read-head-evidence) with the exact head SHA and check/status output paths.
- Apply [Read Pull Request State](#read-pull-request-state) for reviews with the pull request identity and reviews output path. A missing or pending check, blocked merge state or unmet required review leaves readiness unresolved.

#### 4. Confirm Stable Pull Head

- Apply [Read Pull Request State](#read-pull-request-state) again with the same identity and destination.
- Compare its head with the retained SHA; a changed head requires fresh evidence.
- Return the verified head, target requirements and readiness result, including unresolved conditions.

### Hold Epic Review

An open epic review returned to draft while its handoff evidence is unresolved.

**Inputs:** [Identity](#identity).

**Outputs:** [Review State](#review-state), [Failure](#failure).

#### 1. Return Open Review to Draft

Apply [Read Pull Request State](#read-pull-request-state) for full metadata. For an open ready pull request, Apply [Mark Review Draft](#mark-review-draft).

#### 2. Confirm Review Draft State

Apply [Read Pull Request State](#read-pull-request-state) again with the same identity and return the confirmed draft state or discrepancy.

### Ready Epic Review

The complete epic's pull request made ready for review.

**Inputs:** [Identity](#identity), [Published Reviews](#published-reviews), [Epic Readiness](#epic-readiness).

**Outputs:** [Review State](#review-state), [Failure](#failure).

#### 1. Require Complete Epic Evidence

Require the supplied readiness evidence and Apply [Read Pull Request State](#read-pull-request-state) for the pull request.

#### 2. Check Published Review Evidence

Apply [Check Agent Review](agent-review.md#check-agent-review) with the fresh metadata and published records. On a finding, Apply [Hold Epic Review](#hold-epic-review) and stop. For a draft with passing evidence, Apply [Mark Review Ready](#mark-review-ready) with the node id its metadata names.

#### 3. Confirm Current Review State

Apply [Read Pull Request State](#read-pull-request-state) again with the same identity, then Apply [Check Agent Review](agent-review.md#check-agent-review) again with that fresh metadata and the same published records. For a changed revision, Apply [Hold Epic Review](#hold-epic-review) and report the discrepancy. Return the confirmed ready state only with current evidence. Target review requirements still govern the merge.

### Ready Hot-fix Pull Request

A hot-fix's draft delivering pull request made ready for review once its review cycle is complete.

**Inputs:** [Identity](#identity), [Published Reviews](#published-reviews).

**Outputs:** [Review State](#review-state), [Failure](#failure).

#### 1. Read Current Hot-Fix Metadata

Apply [Read Pull Request State](#read-pull-request-state) for its full metadata.

#### 2. Check Published Hot-Fix Review

- Apply [Check Agent Review](agent-review.md#check-agent-review) with that metadata and the published records.
- On a finding, return it to the caller; the pull request stays a draft.

#### 3. Mark Verified Hot-Fix Ready

For a draft with passing evidence, Apply [Mark Review Ready](#mark-review-ready) with the node id its metadata names.

#### 4. Confirm Hot-Fix Review State

Apply [Read Pull Request State](#read-pull-request-state) again with the same identity, then Apply [Check Agent Review](agent-review.md#check-agent-review) again with that fresh metadata and the same published records. Return the confirmed ready state, or the changed revision or finding that leaves it unconfirmed.

### Retarget Pull Request

Points a pull request at another base branch, such as its epic's base branch.

**Inputs:** [Identity](#identity), [Base Branch](#base-branch).

**Outputs:** [Base Branch](#base-branch), [Failure](#failure).

#### 1. Retarget Pull Request

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)' -f base='[**<target-branch>**](#base-branch)' --jq .base.ref
</pre></big>

**Example:**

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/950' -f base='i07/e00/main' --jq .base.ref
</pre></big>

### Retitle Pull Request

Replaces a pull request's title.

**Inputs:** [Identity](#identity), [Title](#title).

**Outputs:** [Title](#title), [Failure](#failure).

#### 1. Retitle Pull Request

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)' -f title='[**<title>**](#title)' --jq .title
</pre></big>

**Example:**

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/950' -f title='[I07:E00] Purpose' --jq .title
</pre></big>

### Open Task Pull Request

Creates a pull request from a unit's branch to its base.

**Inputs:** [Repository](#repository), [Title](#title), [Head Branch](#head-branch), [Base Branch](#base-branch), [Body File](#body-file).

**Outputs:** [Identity](#identity), [Failure](#failure).

#### 1. Open Task Pull Request

- Supply the title, the task branch as head, the base [Task Branches](delivery-branches.md#task-branches) names as base, and the complete body file.
- A title opening with a hot-fix prefix, `[F00]`, always adds `-F draft=true`, as a [delivering pull request](hotfix.md#delivering-pull-request) opens.

<big><pre>
gh api --method POST 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls' -f title='[**<title>**](#title)' -f head='[**<task-branch>**](#head-branch)' -f base='[**<base>**](#base-branch)' -F 'body=@[**<body-file>**](#body-file)' --jq .html_url
</pre></big>

**Example:**

<big><pre>
gh api --method POST 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls' -f title='[I07:E00] Purpose' -f head='i07/e00/w01-purpose' -f base='i07/e00/main' -F body=@body.md --jq .html_url
</pre></big>

**Example:** A hot-fix's delivering pull request.

<big><pre>
gh api --method POST 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls' -f title='[F00] Reject Bad Keys' -f head='f00-key-validation' -f base='workspace' -F body=@body.md -F draft=true --jq .html_url
</pre></big>

### Open Epic Pull Request

Creates the draft pull request from an epic base to its long-lived target.

**Inputs:** [Repository](#repository), [Title](#title), [Head Branch](#head-branch), [Base Branch](#base-branch), [Body File](#body-file).

**Outputs:** [Identity](#identity), [Failure](#failure).

#### 1. Open Epic Pull Request

- Supply the epic prefix and name as title, the epic base as head, its long-lived branch as base, and the populated review body file.
- `draft` is true, including when the work is already complete.

<big><pre>
gh api --method POST 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls' -f title='[**<title>**](#title)' -f head='[**<epic-base>**](#head-branch)' -f base='[**<long-lived-base>**](#base-branch)' -F draft=true -F 'body=@[**<body-file>**](#body-file)' --jq .html_url
</pre></big>

**Example:**

<big><pre>
gh api --method POST 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls' -f title='[I07:E00] Name' -f head='i07/e00/main' -f base='main' -F draft=true -F body=@body.md --jq .html_url
</pre></big>

### Merge Pull Request

Merges the task pull request into its base.

**Inputs:** [Identity](#identity), [Readiness Evidence](#readiness-evidence), [Merge Authorization](#merge-authorization).

**Outputs:** [Merge Result](#merge-result), [Failure](#failure).

#### 1. Merge Pull Request

- Require the supplied readiness evidence and authorization before issuing the merge.
- The merge method is a merge commit.

<big><pre>
gh api --method PUT 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)/merge' -f merge_method='merge' --jq .merged
</pre></big>

**Example:**

<big><pre>
gh api --method PUT 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/950/merge' -f merge_method='merge' --jq .merged
</pre></big>

### Patch Pull Request Body

Replaces a pull request's body.

**Inputs:** [Identity](#identity), [Body File](#body-file).

**Outputs:** [Identity](#identity), [Failure](#failure).

#### 1. Patch Pull Request Body

The file is the whole body. The issue a pull request delivers is linked on the pull request itself, so this call leaves that link standing.

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)' -F 'body=@[**<body-file>**](#body-file)' --jq .html_url
</pre></big>

**Example:**

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/950' -F body=@pr-950.md --jq .html_url
</pre></big>

### Find Review Pull Request

Returns the open pull request whose head is the supplied epic base, or no result when none exists.

**Inputs:** [Repository](#repository), [Head Branch](#head-branch).

**Outputs:** [Review Number](#review-number), [Failure](#failure).

#### 1. Find Review Pull Request

<big><pre>
gh api "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=open&head=[**<owner>**](#repository):[**<epic-base>**](#head-branch)" --jq '.[0].number'
</pre></big>

**Example:**

<big><pre>
gh api "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=open&head=[**<owner>**](#repository):i07/e00/main" --jq '.[0].number'
</pre></big>

### Submit Epic Merge

Merges the epic base into its long-lived target at the supplied head.

**Inputs:** [Identity](#identity), [Verified Head](#verified-head), [Target Requirements](#target-requirements), [Readiness Evidence](#readiness-evidence), [Merge Authorization](#merge-authorization).

**Outputs:** [Merge Result](#merge-result), [Failure](#failure).

#### 1. Submit Epic Merge

The merge method is a merge commit. The endpoint refuses a different head.

<big><pre>
gh api --method PUT 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)/merge' -f merge_method='merge' -f sha='[**<head-sha>**](#verified-head)' --jq '{merged, message, sha}'
</pre></big>

**Example:**

<big><pre>
gh api --method PUT 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/980/merge' -f merge_method='merge' -f sha='[**<head-sha>**](#verified-head)' --jq '{merged, message, sha}'
</pre></big>

### Read Merge Result

Returns a pull request's merge state, merge commit, head and base.

**Inputs:** [Identity](#identity).

**Outputs:** [Merge Result](#merge-result), [Failure](#failure).

#### 1. Read Merge Result

<big><pre>
gh api 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)' --jq '{merged, merge_commit_sha, head: .head.sha, base: .base.ref}'
</pre></big>

**Example:**

<big><pre>
gh api 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/980' --jq '{merged, merge_commit_sha, head: .head.sha, base: .base.ref}'
</pre></big>

### Set Development Link

Adds one pull request to an issue's Development relation, and reads the relation back from both ends.

**Inputs:** [Workspace](#workspace), [Identity](#identity), [Issue Identity](#issue-identity), [Authenticated Access](#authenticated-access), [Repository Prerequisite](#repository-prerequisite).

**Outputs:** [Development Relation](#development-relation), [Failure](#failure).

#### 1. Set Development Link

**REST gap:** REST exposes no write to the Development relation; `addCloseIssueReferences` is a GraphQL mutation alone.

- The issue and pull request may sit in different repositories, and the pull request may be a draft on any base branch.
- The script reads both node ids through REST and sends `addCloseIssueReferences` from a generated query file, so the command runs outside `sbx`, where `gh` reaches the tracker.
- Exit 0 means the issue holds the pull request exactly once, the pull request holds the issue, and every other link on the issue stands. Running it again for a linked pair holds the same relation.
- Exit 1 prints `failed:` with the operation, the step and the tracker's error, or `discrepancy:` with the relation read back.

<big><pre>
cd "[**<workspace>**](#workspace)" && python3 skills/work-planner/scripts/development-link.py add --issue '[**<issue-owner>**](#issue-identity)/[**<issue-repo>**](#issue-identity)#[**<issue-number>**](#issue-identity)' --pull '[**<pr-owner>**](#identity)/[**<pr-repo>**](#identity)#[**<pull-request-number>**](#identity)'
</pre></big>

**Example:**

<big><pre>
cd "[**<workspace>**](#workspace)" && python3 skills/work-planner/scripts/development-link.py add --issue 'm2ux/workflow-server#637' --pull 'm2ux/workflow-server#950'
</pre></big>

**Example output:**

```text
issue m2ux/workflow-server#637: m2ux/workflow-server#950
pull request m2ux/workflow-server#950: m2ux/workflow-server#637
verified: add m2ux/workflow-server#950 -> m2ux/workflow-server#637
```

### Remove Development Link

Removes one pull request from an issue's Development relation, and reads the relation back from both ends.

**Inputs:** [Workspace](#workspace), [Identity](#identity), [Issue Identity](#issue-identity), [Authenticated Access](#authenticated-access), [Removal Decision](#removal-decision).

**Outputs:** [Development Relation](#development-relation), [Failure](#failure).

#### 1. Remove Development Link

**REST gap:** REST exposes no write to the Development relation; `removeCloseIssueReferences` is a GraphQL mutation alone.

- The script sends `removeCloseIssueReferences` from a generated query file, so the command runs outside `sbx`.
- Exit 0 means neither end holds the other and every other link on the issue stands.
- Exit 1 prints `failed:` or `discrepancy:` with the operation, step and tracker error, or the relation read back.

<big><pre>
cd "[**<workspace>**](#workspace)" && python3 skills/work-planner/scripts/development-link.py remove --issue '[**<issue-owner>**](#issue-identity)/[**<issue-repo>**](#issue-identity)#[**<issue-number>**](#issue-identity)' --pull '[**<pr-owner>**](#identity)/[**<pr-repo>**](#identity)#[**<pull-request-number>**](#identity)'
</pre></big>

**Example:**

<big><pre>
cd "[**<workspace>**](#workspace)" && python3 skills/work-planner/scripts/development-link.py remove --issue 'm2ux/workflow-server#637' --pull 'm2ux/workflow-server#950'
</pre></big>

**Example output:**

```text
failed: remove m2ux/workflow-server#950 -> m2ux/workflow-server#637: removeCloseIssueReferences: Resource not accessible by integration
```

### Capture Pull Request Links

Writes the complete issue-link snapshot for a pull request collection, read from the pull-request end of the Development relation.

**Inputs:** [Workspace](#workspace), [Pull Request Records](#pull-request-records), [Link-Snapshot Path](#link-snapshot-path), [Authenticated Access](#authenticated-access).

**Outputs:** [Issue-Link Snapshot](#issue-link-snapshot), [Failure](#failure).

#### 1. Capture Pull Request Links

**REST gap:** REST exposes no read of a pull request's closing issue references.

- The snapshot meets [Issue-Link Snapshot](#issue-link-snapshot).
- Each batch of pull requests costs one `gh api graphql` call from a generated query file, so the command runs outside `sbx`, where `gh` reaches the tracker.
- A relation is unreadable when any page of it does not arrive whole: the tracker returns no node for its subject, names the subject in an error, or reports a further page it does not supply.
- Exit 0 means the snapshot is complete. Exit 1 names each unreadable relation with the tracker's reason and writes no snapshot; the caller treats it as a blocker.
- A call the tracker refuses outright, such as a rejected credential, exits 1 with `GraphQL read failed:` and what `gh` reported, and writes nothing.

<big><pre>
cd "[**<workspace>**](#workspace)" && python3 skills/work-planner/scripts/links-by-pull-request.py --prs '[**<pull-request-records-file>**](#pull-request-records)' --out '[**<issue-link-snapshot-file>**](#link-snapshot-path)'
</pre></big>

**Example:**

<big><pre>
cd "[**<workspace>**](#workspace)" && python3 skills/work-planner/scripts/links-by-pull-request.py --prs prs.json --out links.json
</pre></big>

**Example payload:**

```json
[
  {
    "repo": "owner/repo",
    "number": 950,
    "closingIssuesReferences": [{"repo": "owner/repo", "number": 637}]
  }
]
```

### Save Pull Request Snapshot

Saves one complete pull request response, replacing the destination file.

**Inputs:** [Identity](#identity), [Output Files](#output-files).

**Outputs:** [Pull Request Record](#pull-request-record), [Failure](#failure).

#### 1. Save Pull Request Snapshot

<big><pre>
gh api 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)' > '[**<pull-request-json-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/980' > epic-pr.json
</pre></big>

### Fetch Pull Request Reviews

Saves every review on one pull request.

**Inputs:** [Identity](#identity), [Output Files](#output-files).

**Outputs:** [Reviews](#reviews), [Failure](#failure).

#### 1. Fetch Pull Request Reviews

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)/reviews?per_page=100' > '[**<reviews-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/980/reviews?per_page=100' > reviews.json
</pre></big>

### Fetch Initiative Pull Requests

Saves the task and epic pull requests that name one initiative's epics.

**Inputs:** [Repository](#repository), [Initiative Prefix](#initiative-prefix), [Collection Path](#collection-path).

**Outputs:** [Pull Request Records](#pull-request-records), [Failure](#failure).

#### 1. Fetch Initiative Pull Requests

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[**<initiative-prefix>**](#initiative-prefix)"))' > '[**<pull-request-records-file>**](#pull-request-records)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07"))' > prs.json
</pre></big>

### Fetch Linked Pull Requests

Appends to a pull request collection each pull request the plan links that the collection lacks, whatever its title.

**Inputs:** [Workspace](#workspace), [Collection Path](#collection-path), [Issue Records](#issue-records).

**Outputs:** [Pull Request Records](#pull-request-records), [Failure](#failure).

#### 1. Fetch Linked Pull Requests

**REST gap:** REST exposes no read of the pull requests an issue's Development field holds.

- A pull request is linked when a Work Breakdown row's id cell links it or an issue's Development field names it, open, closed or merged, in whichever repository it lives.
- A pull request no row or Development link names is found by its title alone, through the title-matched fetch this command follows.
- The command reads the Development field by `gh api graphql` and each missing pull request by REST, so it runs outside `sbx`, where `gh` reaches the tracker.
- Exit 0 means every linked pull request is in the collection. Exit 1 names each unreadable relation or pull request and appends nothing; the caller treats it as a blocker.

<big><pre>
cd "[**<workspace>**](#workspace)" && python3 skills/work-planner/scripts/linked-pull-requests.py --prs '[**<pull-request-records-file>**](#pull-request-records)' --issues '[**<issue-file>**](#issue-records)' ...
</pre></big>

**Example:**

<big><pre>
cd "[**<workspace>**](#workspace)" && python3 skills/work-planner/scripts/linked-pull-requests.py --prs prs.json --issues issue-936.json issue-943.json issue-637.json
</pre></big>

### Fetch Repository Delivery Pull Requests

Starts a collection with all initiative- and hot-fix-prefixed pull requests from one repository.

**Inputs:** [Repository](#repository), [Collection Path](#collection-path).

**Outputs:** [Pull Request Records](#pull-request-records), [Failure](#failure).

#### 1. Fetch Repository Delivery Pull Requests

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' > '[**<pull-request-records-file>**](#pull-request-records)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' > prs.json
</pre></big>

### Append Repository Delivery Pull Requests

Appends all initiative- and hot-fix-prefixed pull requests from one further repository.

**Inputs:** [Repository](#repository), [Collection Path](#collection-path).

**Outputs:** [Pull Request Records](#pull-request-records), [Failure](#failure).

#### 1. Append Repository Delivery Pull Requests

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' >> '[**<pull-request-records-file>**](#pull-request-records)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' >> prs.json
</pre></big>

### Fetch Pull Request Files

Saves the paths a pull request changes.

**Inputs:** [Identity](#identity), [Output Files](#output-files).

**Outputs:** [Changed Paths](#changed-paths), [Failure](#failure).

#### 1. Fetch Pull Request Files

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)/files' --jq '.[].filename' > '[**<changed-paths-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/950/files' --jq '.[].filename' > changed-files.txt
</pre></big>

### Fetch Head Check Runs

Saves every check run for one exact commit.

**Inputs:** [Repository](#repository), [Verified Head](#verified-head), [Output Files](#output-files).

**Outputs:** [Head Checks](#head-checks), [Failure](#failure).

#### 1. Fetch Head Check Runs

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/commits/[**<head-sha>**](#verified-head)/check-runs?per_page=100' > '[**<check-runs-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/commits/[**<head-sha>**](#verified-head)/check-runs?per_page=100' > checks.json
</pre></big>

### Fetch Head Status

Saves commit status evidence for one exact commit.

**Inputs:** [Repository](#repository), [Verified Head](#verified-head), [Output Files](#output-files).

**Outputs:** [Head Status](#head-status), [Failure](#failure).

#### 1. Fetch Head Status

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/commits/[**<head-sha>**](#verified-head)/status?per_page=100' > '[**<commit-status-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/commits/[**<head-sha>**](#verified-head)/status?per_page=100' > status.json
</pre></big>

### Mark Review Ready

Marks a draft pull request ready for review.

**Inputs:** [Node Metadata](#node-metadata), [Query File](#query-file).

**Outputs:** [Review State](#review-state), [Failure](#failure).

#### 1. Mark Review Ready

**REST gap:** REST has no endpoint that marks a draft ready for review.

The query file holds the mutation with the node id inlined, since a GraphQL variable is a literal `$`:

  ```graphql
  mutation { markPullRequestReadyForReview(input: {pullRequestId: "<pull-request-node-id>"}) { pullRequest { isDraft } } }
  ```

<big><pre>
gh api graphql -F query=@'[**<query-file>**](#query-file)' --jq .data.markPullRequestReadyForReview.pullRequest.isDraft
</pre></big>

### Mark Review Draft

Returns an open integration pull request with blocked handoff evidence to draft.

**Inputs:** [Identity](#identity).

**Outputs:** [Review State](#review-state), [Failure](#failure).

#### 1. Mark Review Draft

<big><pre>
gh pr ready '[**<pull-request-number>**](#identity)' --undo --repo '[**<owner>**](#repository)/[**<repository>**](#repository)'
</pre></big>

## Fields

### State

A pull request is open, draft, ready for review, merged or closed without merge. A draft is never merged. A merged result identifies the verified head, target and merge commit. An epic review is draft from the first task merge until every task is delivered, every epic criterion is verified and ticked, and current agent review evidence passes.

### Scope

A task pull request delivers one task, or a set of tasks that name each other in Joins.

### Other Pull Requests

A pull request outside epic delivery targets a long-lived branch. An open stacked pull request targets its long-lived branch once its base merges.

### Merge Permission

The agent harness lets a delivery session merge a task pull request into an [epic base](delivery-branches.md#epic-bases), such as `i07/e00/main`, without a prompt. A merge into the default branch stays with a person.

- **Claude Code.**
  User settings (`~/.claude/settings.json`) grant it with an `autoMode.allow` rule and an `autoMode.environment` entry, each array keeping `"$defaults"`; auto mode reads neither from project settings. `claude auto-mode config` prints the rules in effect.

  ```json
  {
    "autoMode": {
      "environment": [
        "$defaults",
        "Source control: github.com/m2ux/workflow-server. Epic bases named iNN/eNN/<branch> carry no review requirement; the default branch requires an approving review"
      ],
      "allow": [
        "$defaults",
        "Merging a task pull request into an epic base iNN/eNN/<branch> of github.com/m2ux/workflow-server is allowed: the work-planner skill's Deliver mode authorizes it and the base requires no review. Merges into the default branch are not covered"
      ]
    }
  }
  ```

### Issue Links

- GitHub shows the link in the pull request's Development field and in the issue's Linked pull requests field, which the project board reads.
- A task pull request links the task's issue, and a review pull request links its epic's issue.
- The link is addressed by issue, so a pull request whose work carries no issue links nothing. A task pull request delivering rows that have no issue of their own is the whole of what stays unlinked.
- The link is stored on the pull request. It holds on any base branch and on a pull request that has merged, and a later body edit leaves it standing.
- A linked issue remains open until its criteria and delivery requirements hold and every Development-linked pull request is merged.
- The field is the whole of the relation: neither body links the other. The pull request's References carry its sources, and the issue it delivers is not among them.
- A pull request with a delivery issue but no Development link is uncited.

### Identity

The pull request’s repository-qualified identity, or its repository and local number. A new pull request has no saved identity until creation succeeds.

### Kind

The selected task or epic delivery kind.

### Verified Head

The literal head commit SHA verified by current checks and target requirements.

### Target Requirements

The supplied current protection and active rules of the target branch.

### Readiness Evidence

Current passing test-plan and head evidence, reviews and target requirements; unresolved conditions remain explicit.

### Repository Prerequisite

The caller’s repository auto-close setting confirmed for the session, meeting [Auto-Close Setting](issue.md#auto-close-setting).

### Merge Authorization

The confirmed authorization for the agent to merge.

### Merge Result

The merge command result and merge commit when supplied, with the verified head and target; a refusal or discrepancy remains explicit.

### Link Request

The requested read, addition or removal of a Development relation.

### Issue Identity

The delivery issue’s repository-qualified identity; absent where the work carries no issue of its own.

### Removal Decision

The user decision authorizing removal of the supplied abandoned or incorrect Development link.

### Pull Request Records

Complete pull request REST responses stored as JSON lines, from one or more repositories. Each record includes its repository identity and `html_url`.

### Issue-Link Snapshot

The complete saved Development snapshot, with one entry per pull request and every linked issue’s repository and number, or an empty array.

### Link-Snapshot Path

The supplied destination for a complete Development snapshot. The snapshot is absent before a successful capture writes it.

### Development Relation

The issue and pull request identities verified from both ends, or an explicit unreadable or failed relation.

### Repository List

The ordered repositories included in a board delivery fetch.

### Issue Records

The fetched plan issues supplied as issue files, or board items containing their complete issues.

### Collection Path

The JSON-lines pull request collection destination. It is absent before a fresh fetch creates it; an append receives the existing collection.

### Initiative Prefix

The opening bracket and initiative id matched against task and epic titles, such as `[I07`.

### Output Files

The caller-supplied destinations for complete metadata, changed-paths, reviews, protection, rules, check and status snapshots, selected by the operation.

### Record Selection

The requested supporting records: full metadata, changed paths or reviews.

### Pull Request Record

One complete pull request REST JSON response, including `html_url`, `node_id`, draft state, literal head and base.

### Changed Paths

The saved path list for the requested pull request.

### Reviews

Every page of reviews for the selected pull request.

### Body File

The complete populated body text supplied through a file.

### Title

The complete selected pull request title.

### Head Branch

The task branch or epic-base head selected for creation.

### Base Branch

The task base, epic’s long-lived target or replacement base selected by the operation.

### Selected Changes

The supplied body, title, head or base fields for creation or update; an existing pull request retains fields the caller does not select.

### Review Number

The open review pull request number for an epic-base head, or an absent-review finding.

### Head Checks

Every check-run page for the exact verified head SHA.

### Head Status

Every status page for the exact verified head SHA.

### Published Reviews

The published agent review records supplied for the current revision.

### Epic Readiness

Confirmed readiness showing every task delivered, every criterion verified and ticked, and no unresolved question or delivery discrepancy.

### Review State

The freshly confirmed draft or ready state, or the discrepancy that leaves it unconfirmed.

### Node Metadata

The pull request’s REST `node_id`, used by the ready-for-review mutation.

### Query File

The working file holding the complete GraphQL mutation with its node id inlined.

### Workspace

The checkout holding the installed skill, its scripts and tests.

### Repository

The owner and repository addressed by the operation, written as `owner/repo`.

### Project Checkout

The project repository checkout supplied for branch and delivery reads or writes.

### Unit Checkout

The task branch checkout supplied for this unit.

### Authenticated Access

Authenticated tracker access for the selected repositories.

### Failure

The operation and error, discrepancy or missing evidence that prevents a verified result.

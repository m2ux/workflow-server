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

#### 1. Read Target Review Requirements

- Read the supplied target branch's current required reviews and checks alongside the [verified head](#verified-head "input"). A branch whose protection or active rules require an approving review takes that review from a person. An agent cannot approve a [pull request](#identity "input") it opened; on such a branch, the merge belongs to the reviewer even when every other condition holds.
- Report the pull request as ready for approval, naming what was verified.
- Stop merge attempts. This handoff is a finished outcome.
- Keep approval with that reviewer. Another account, an administrative bypass or a setting change cannot supply it. Changing repository protection requires the user's explicit authorization, asked for separately.
- For example, workflow-server's `main` requires one approving review, so carry an epic to ready and stop.

#### 2. Merge Approved Delivery

- When approval permits the agent to merge and [Repository Prerequisite](#repository-prerequisite "input") is confirmed, select the merge operation from [Kind](#kind "input"):
- Apply [Merge Pull Request](#merge-pull-request "operation") for a task or Apply [Merge Epic Pull Request](#merge-epic-pull-request "operation") for an epic, passing the verified [readiness evidence](#readiness-evidence "input") and authorization result. For an epic, also supply the [target requirements](#target-requirements "input") and exact verified head SHA.
- If GitHub refuses the merge, provide [Failure](#failure "output") with the refusal for fresh verification.
- If the agent's own permission layer refuses it, the harness declines to run the merge command and GitHub returns nothing. On a target with no review requirement, that refusal is neither a handoff for approval nor a branch blocker. Provide the pull request as ready and verified, naming the refusal and the [merge permission](#merge-permission) it lacks, and stop merge attempts. A later Deliver run merges it in its merge step or reports the missing permission; neither asks the user to approve it.

#### 3. Provide Delivery Merge Result

Provide the [merge result](#merge-result "output"), including its merge commit when supplied, for the caller's readback.

### Access Development Links

The observed or updated Development relation for a pull request.

#### 1. Read Complete Development Relation

- For a read-only [Link Request](#link-request "input"), use [Authenticated Access](#authenticated-access "input"):
- Apply [Read Pull Request State](#read-pull-request-state "operation") for the [pull request](#identity "input")'s metadata, which carries the `html_url` the capture keys it by.
- Apply [Capture Pull Request Links](#capture-pull-request-links "operation") with that record and provide its entry, every page read. An unreadable relation is a blocker, not an empty link set.

#### 2. Edit Authorized Development Relation

- For a link edit:
- Require confirmed [Repository Prerequisite](#repository-prerequisite "input"); an unconfirmed setting blocks the edit.
- For an addition, Apply [Set Development Link](#set-development-link "operation") with the pull request and [Issue Identity](#issue-identity "input").

- For removal of an abandoned or incorrect link:
- Require [Removal Decision](#removal-decision "input").
- Apply [Remove Development Link](#remove-development-link "operation") with those identities.

#### 3. Provide Verified Relation

Provide [Development Relation](#development-relation "output") verified from both ends, or the discrepancy or [Failure](#failure "output") it names. A failed write is a blocker carrying its operation and error, never an unavailable field.

### Fetch Pull Request Issue Links

The complete issue-link snapshot for a supplied set of pull requests.

#### 1. Capture Complete Issue Links

Apply [Capture Pull Request Links](#capture-pull-request-links "operation") with the supplied [Pull Request Records](#pull-request-records "input"), saving at [Link-Snapshot Path](#link-snapshot-path "input"), such as `links.json`.

#### 2. Require Complete Relation Evidence

If it names an unreadable relation, stop and provide each one named as a blocker. Incomplete evidence is never a partial snapshot.

#### 3. Refresh Changed Link Snapshot

After a link changes, Apply [Capture Pull Request Links](#capture-pull-request-links "operation") again with the refreshed [pull request records](#pull-request-records "input"), the same [authenticated access](#authenticated-access "input") and destination.

#### 4. Provide Complete Snapshot

Provide [Issue-Link Snapshot](#issue-link-snapshot "output") for the scripts’ `--links` input, or [Failure](#failure "output") with each unreadable relation.

### Link Pull Request to Issue

The verified delivery-issue relation for a pull request.

#### 1. Add Development Relation

Apply [Access Development Links](#access-development-links "operation") to add [Issue Identity](#issue-identity "input") to [Identity](#identity "input") using [Authenticated Access](#authenticated-access "input") and confirmed [Repository Prerequisite](#repository-prerequisite "input").

#### 2. Require Verified Edit

Stop on a blocker or an unverified edit.

#### 3. Refresh Issue-Link Snapshot

Apply [Fetch Pull Request Issue Links](#fetch-pull-request-issue-links "operation") with [Pull Request Records](#pull-request-records "input") and [Link-Snapshot Path](#link-snapshot-path "input") after the edit.

#### 4. Provide Relation Evidence

Provide verified [Development Relation](#development-relation "output") and refreshed [Issue-Link Snapshot](#issue-link-snapshot "output"), or [Failure](#failure "output") for an unverified edit or read.

### Merge Epic Pull Request

The epic's verified merge into its long-lived target.

#### 1. Require Epic Merge Evidence

Require the supplied [Target Requirements](#target-requirements "input"), [Readiness Evidence](#readiness-evidence "input") and [Merge Authorization](#merge-authorization "input").

#### 2. Submit Verified Epic Merge

Apply [Submit Epic Merge](#submit-epic-merge "operation") with the exact head whose checks and target requirements were verified; provide a refusal without continuing.

#### 3. Read Epic Merge Result

Apply [Read Merge Result](#read-merge-result "operation") for that [pull request](#identity "input").

#### 4. Confirm Exact Merge State

Confirm the merged state, merge commit, [verified head](#verified-head "input") and target.

#### 5. Provide Epic Merge Result

Provide [Merge Result](#merge-result "output") or [Failure](#failure "output") with the discrepancy.

### Fetch All Delivery Pull Requests

The pull request collection covering every supplied board repository and every pull request the board's issues link.

#### 1. Create Fresh Pull Collection

Apply [Fetch Repository Delivery Pull Requests](#fetch-repository-delivery-pull-requests "operation") for the first entry in [Repository List](#repository-list "input"), saving at [Collection Path](#collection-path "input"), such as `prs.json`. This replaces the destination with a fresh collection.

#### 2. Stop on Initial Failure

Stop on failure.

#### 3. Append Remaining Repositories

Apply [Append Repository Delivery Pull Requests](#append-repository-delivery-pull-requests "operation") for each further repository, passing the same destination.

#### 4. Fetch Plan-Linked Pull Requests

Apply [Fetch Linked Pull Requests](#fetch-linked-pull-requests "operation") with that destination and the board issue entries in [Issue Records](#issue-records "input").

#### 5. Report Incomplete Fetch

If any fetch failed, provide incomplete evidence.

#### 6. Provide Complete Pull Collection

Provide the complete [Pull Request Records](#pull-request-records "output") only after every fetch succeeds, or [Failure](#failure "output") with incomplete evidence.

### Read Initiative Pull Requests

The current delivery pull requests for one initiative: each one whose title names it, and each one its plan links, whatever its title.

#### 1. Fetch Initiative-Prefixed Pull Requests

Apply [Fetch Initiative Pull Requests](#fetch-initiative-pull-requests "operation") with the supplied [Repository](#repository "input") and [Initiative Prefix](#initiative-prefix "input"), saving at [Collection Path](#collection-path "input").

#### 2. Fetch All Plan-Linked Pull Requests

Apply [Fetch Linked Pull Requests](#fetch-linked-pull-requests "operation") with that collection and [Issue Records](#issue-records "input").

#### 3. Provide Initiative Pull Collection

Provide [Pull Request Records](#pull-request-records "output"), or [Failure](#failure "output") naming each unreadable relation or pull request.

### Read Pull Request State

One current pull request and its requested supporting records.

#### 1. Save Complete Pull Response

Apply [Save Pull Request Snapshot](#save-pull-request-snapshot "operation") with [Identity](#identity "input"), saving JSON at [Output Files](#output-files "input").

#### 2. Fetch Requested Supporting Records

Apply [Fetch Pull Request Files](#fetch-pull-request-files "operation") or Apply [Fetch Pull Request Reviews](#fetch-pull-request-reviews "operation") when [Record Selection](#record-selection "input") requests those records.

#### 3. Provide Requested Pull Records

Provide [Pull Request Record](#pull-request-record "output"), [Changed Paths](#changed-paths "output") and [Reviews](#reviews "output") as selected, or [Failure](#failure "output") for missing evidence.

### Publish Pull Request

One pull request created or updated from supplied content and metadata.

#### 1. Create Delivery Pull Request

- For creation, Apply [Open Task Pull Request](#open-task-pull-request "operation") or Apply [Open Epic Pull Request](#open-epic-pull-request "operation") in [Repository](#repository "input") for the supplied [Kind](#kind "input"), using [Body File](#body-file "input") and the title, head and base in [Selected Changes](#selected-changes "input").
- For a task or epic pull request with a delivery issue, Apply [Link Pull Request to Issue](#link-pull-request-to-issue "operation") with [Issue Identity](#issue-identity "input"), confirmed [Repository Prerequisite](#repository-prerequisite "input") and [Link-Snapshot Path](#link-snapshot-path "input"), meeting [Issue Links](#issue-links).

#### 2. Update Selected Pull Fields

For an existing [Identity](#identity "input"), Apply [Patch Pull Request Body](#patch-pull-request-body "operation"), Apply [Retitle Pull Request](#retitle-pull-request "operation") or Apply [Retarget Pull Request](#retarget-pull-request "operation") for the selected changes, preserving other fields.

#### 3. Read Saved Pull State

Apply [Read Pull Request State](#read-pull-request-state "operation") again.

#### 4. Provide Saved Pull Record

Provide the saved [Pull Request Record](#pull-request-record "output") or [Failure](#failure "output") with the discrepancy.

### Locate Review Pull Request

The review pull request for a supplied epic base.

#### 1. Find Epic Review Pull

Apply [Find Review Pull Request](#find-review-pull-request "operation") for [Head Branch](#head-branch "input") in [Repository](#repository "input").

#### 2. Provide Review Pull Number

Provide [Review Number](#review-number "output") or [Failure](#failure "output") with an absent-review finding.

### Read Head Evidence

The check-run and status evidence for one literal head commit.

#### 1. Fetch Literal Head Checks

Apply [Fetch Head Check Runs](#fetch-head-check-runs "operation") for [Verified Head](#verified-head "input") in [Repository](#repository "input"), saving evidence at [Output Files](#output-files "input").

#### 2. Fetch Literal Head Status

Apply [Fetch Head Status](#fetch-head-status "operation") for the same SHA.

#### 3. Provide Current Head Evidence

Provide [Head Checks](#head-checks "output") and [Head Status](#head-status "output"), retaining missing or pending evidence as unresolved [Failure](#failure "output"). The requester compares them with supplied target requirements and current reviews.

### Merge Task Pull Requests

Merges each open task pull request whose test plan has passed.

#### 1. Confirm Repository and Base

Apply [Confirm Repository Auto-Close](issue.md#confirm-repository-auto-close "operation") for the repository, and confirm the task [Identity](#identity "input") targets [Base Branch](#base-branch "input"), as [Task Branches](delivery-branches.md#task-branches) names it. An epic base carries no review requirement of its own; carry any applicable target review requirement into the merge step.

#### 2. Merge Verified Task Pull

- Merge the task pull request.
- Where its base is an epic base, Apply [Update Epic Base](delivery-branches.md#update-epic-base "operation") with the [project checkout](#project-checkout "input") and that base.
- Apply [Fetch Merge Readiness](#fetch-merge-readiness "operation") for the task pull request and its base.
- Apply [Merge Delivery Pull Request](#merge-delivery-pull-request "operation") with delivery kind task, verified head, target requirements, [Repository Prerequisite](#repository-prerequisite "input") and passing [Readiness Evidence](#readiness-evidence "input"), without further confirmation.
- Stop on a handoff for human approval or a permission-layer refusal, returning it to the caller.

- If GitHub refuses the merge:
- Apply [Update Task Branch](delivery-branches.md#update-task-branch "operation") with the [unit checkout](#unit-checkout "input"), the task branch and its base.
- Apply [Fetch Merge Readiness](#fetch-merge-readiness "operation") again for the updated task head.
- Apply [Merge Delivery Pull Request](#merge-delivery-pull-request "operation") once more with that verified evidence. A conflict or repeated refusal leaves the pull request open with the blocker reported.

#### 3. Confirm Task Merge Result

- Apply [Read Pull Request State](#read-pull-request-state "operation") to confirm the merged state, head, base and merge commit.
- Provide [Merge Result](#merge-result "output"), or [Failure](#failure "output") with the unresolved conflict, refusal or handoff.

### Fetch Merge Readiness

The current pull request's readiness against its target requirements and head checks.

#### 1. Read Current Pull Head

- Apply [Read Pull Request State](#read-pull-request-state "operation") with the [pull request identity](#identity "input") and destination `epic-pr.json`.
- Retain the literal head SHA and target branch for the evidence calls.

#### 2. Read Current Target Requirements

- Apply [Read Target Requirements](delivery-branches.md#read-target-requirements "operation") with the repository and [Base Branch](#base-branch "input"), saving protection/rules evidence at [Output Files](#output-files "input").
- Carry any unresolved requirement into the readiness result.

#### 3. Read Literal Head Evidence

- Read the head evidence.
- Apply [Read Head Evidence](#read-head-evidence "operation") with the exact head SHA and check/status output paths.
- Apply [Read Pull Request State](#read-pull-request-state "operation") for reviews with the pull request identity and reviews output path. A missing or pending check, blocked merge state or unmet required review leaves readiness unresolved.

#### 4. Confirm Stable Pull Head

- Apply [Read Pull Request State](#read-pull-request-state "operation") again with the same identity and destination.
- Compare its head with the retained SHA; a changed head requires fresh evidence.
- Provide [Verified Head](#verified-head "output"), [Target Requirements](#target-requirements "output") and [Readiness Evidence](#readiness-evidence "output"), retaining unresolved conditions as [Failure](#failure "output").

### Hold Epic Review

An open epic review provided to draft while its handoff evidence is unresolved.

#### 1. Provide Open Review to Draft

Apply [Read Pull Request State](#read-pull-request-state "operation") for full metadata. For an open ready [pull request](#identity "input"), Apply [Mark Review Draft](#mark-review-draft "operation").

#### 2. Confirm Review Draft State

Apply [Read Pull Request State](#read-pull-request-state "operation") again with the same identity and provide [Review State](#review-state "output") with the confirmed draft state, or [Failure](#failure "output") with the discrepancy.

### Ready Epic Review

The complete epic's pull request made ready for review.

#### 1. Require Complete Epic Evidence

Require [Epic Readiness](#epic-readiness "input") and Apply [Read Pull Request State](#read-pull-request-state "operation") for [Identity](#identity "input").

#### 2. Check Published Review Evidence

Apply [Check Agent Review](agent-review.md#check-agent-review "operation") with the fresh metadata and [Published Reviews](#published-reviews "input"). On a finding, Apply [Hold Epic Review](#hold-epic-review "operation") and stop. For a draft with passing evidence, Apply [Mark Review Ready](#mark-review-ready "operation") with its node id.

#### 3. Confirm Current Review State

Apply [Read Pull Request State](#read-pull-request-state "operation") again with the same identity, then Apply [Check Agent Review](agent-review.md#check-agent-review "operation") again with that fresh metadata and the same published records. For a changed revision, Apply [Hold Epic Review](#hold-epic-review "operation") and report the discrepancy. Provide [Review State](#review-state "output") only with current evidence, or [Failure](#failure "output") for the changed revision or discrepancy. Target review requirements still govern the merge.

### Ready Hot-fix Pull Request

A hot-fix's draft delivering pull request made ready for review once its review cycle is complete.

#### 1. Read Current Hot-Fix Metadata

Apply [Read Pull Request State](#read-pull-request-state "operation") for its full metadata.

#### 2. Check Published Hot-Fix Review

- Apply [Check Agent Review](agent-review.md#check-agent-review "operation") with that metadata and [Published Reviews](#published-reviews "input").
- On a finding, provide it to the caller; the [pull request](#identity "input") stays a draft.

#### 3. Mark Verified Hot-Fix Ready

For a draft with passing evidence, Apply [Mark Review Ready](#mark-review-ready "operation") with the node id its metadata names.

#### 4. Confirm Hot-Fix Review State

Apply [Read Pull Request State](#read-pull-request-state "operation") again with the same identity, then Apply [Check Agent Review](agent-review.md#check-agent-review "operation") again with that fresh metadata and the same published records. Provide [Review State](#review-state "output"), or [Failure](#failure "output") with the changed revision or finding that leaves it unconfirmed.

### Retarget Pull Request

Points a pull request at another base branch, such as its epic's base branch.

#### 1. Retarget Pull Request

Run the command using [Identity](#identity "input"), [Base Branch](#base-branch "input"), [Repository](#repository "input").

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)' -f base='[**<target-branch>**](#base-branch)' --jq .base.ref
</pre></big>

**Example:**

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/950' -f base='i07/e00/main' --jq .base.ref
</pre></big>

#### 2. Provide Retargeted Pull Request

Provide [Base Branch](#base-branch "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Retitle Pull Request

Replaces a pull request's title.

#### 1. Retitle Pull Request

Run the command using [Identity](#identity "input"), [Title](#title "input"), [Repository](#repository "input").

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)' -f title='[**<title>**](#title)' --jq .title
</pre></big>

**Example:**

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/950' -f title='[I07:E00] Purpose' --jq .title
</pre></big>

#### 2. Provide Retitled Pull Request

Provide [Title](#title "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Open Task Pull Request

Creates a pull request from a unit's branch to its base.

#### 1. Open Task Pull Request

- Run the command using [Repository](#repository "input"), [Head Branch](#head-branch "input"), [Base Branch](#base-branch "input").

- Supply the [title](#title "input"), the task branch as head, the base [Task Branches](delivery-branches.md#task-branches) names as base, and the [complete body file](#body-file "input").
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

#### 2. Provide Open Task Pull Request

Provide [Identity](#identity "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Open Epic Pull Request

Creates the draft pull request from an epic base to its long-lived target.

#### 1. Open Epic Pull Request

- Run the command using [Repository](#repository "input"), [Head Branch](#head-branch "input"), [Base Branch](#base-branch "input").

- Supply the epic prefix and name as [title](#title "input"), the epic base as head, its long-lived branch as base, and the populated review [body file](#body-file "input").
- `draft` is true, including when the work is already complete.

<big><pre>
gh api --method POST 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls' -f title='[**<title>**](#title)' -f head='[**<epic-base>**](#head-branch)' -f base='[**<long-lived-base>**](#base-branch)' -F draft=true -F 'body=@[**<body-file>**](#body-file)' --jq .html_url
</pre></big>

**Example:**

<big><pre>
gh api --method POST 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls' -f title='[I07:E00] Name' -f head='i07/e00/main' -f base='main' -F draft=true -F body=@body.md --jq .html_url
</pre></big>

#### 2. Provide Open Epic Pull Request

Provide [Identity](#identity "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Merge Pull Request

Merges the task pull request into its base.

#### 1. Merge Pull Request

- Run the command using [Identity](#identity "input"), [Merge Authorization](#merge-authorization "input"), [Repository](#repository "input").

- Require the supplied [readiness evidence](#readiness-evidence "input") and authorization before issuing the merge.
- The merge method is a merge commit.

<big><pre>
gh api --method PUT 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)/merge' -f merge_method='merge' --jq .merged
</pre></big>

**Example:**

<big><pre>
gh api --method PUT 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/950/merge' -f merge_method='merge' --jq .merged
</pre></big>

#### 2. Provide Merged Pull Request

Provide [Merge Result](#merge-result "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Patch Pull Request Body

Replaces a pull request's body.

#### 1. Patch Pull Request Body

- Run the command using [Identity](#identity "input"), [Body File](#body-file "input"), [Repository](#repository "input").

- The file is the whole body. The issue a pull request delivers is linked on the pull request itself, so this call leaves that link standing.

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)' -F 'body=@[**<body-file>**](#body-file)' --jq .html_url
</pre></big>

**Example:**

<big><pre>
gh api --method PATCH 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/950' -F body=@pr-950.md --jq .html_url
</pre></big>

#### 2. Provide Patch Pull Request Body

Provide [Identity](#identity "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Find Review Pull Request

Returns the open pull request whose head is the supplied epic base, or no result when none exists.

#### 1. Find Review Pull Request

Run the command using [Repository](#repository "input"), [Head Branch](#head-branch "input").

<big><pre>
gh api "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=open&head=[**<owner>**](#repository):[**<epic-base>**](#head-branch)" --jq '.[0].number'
</pre></big>

**Example:**

<big><pre>
gh api "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=open&head=[**<owner>**](#repository):i07/e00/main" --jq '.[0].number'
</pre></big>

#### 2. Provide Located Review Pull Request

Provide [Review Number](#review-number "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Submit Epic Merge

Merges the epic base into its long-lived target at the supplied head.

#### 1. Submit Epic Merge

- Run the command using [Identity](#identity "input"), [Verified Head](#verified-head "input"), [Target Requirements](#target-requirements "input"), [Readiness Evidence](#readiness-evidence "input"), [Merge Authorization](#merge-authorization "input"), [Repository](#repository "input").

- The merge method is a merge commit. The endpoint refuses a different head.

<big><pre>
gh api --method PUT 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)/merge' -f merge_method='merge' -f sha='[**<head-sha>**](#verified-head)' --jq '{merged, message, sha}'
</pre></big>

**Example:**

<big><pre>
gh api --method PUT 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/980/merge' -f merge_method='merge' -f sha='[**<head-sha>**](#verified-head)' --jq '{merged, message, sha}'
</pre></big>

#### 2. Provide Submit Epic Merge

Provide [Merge Result](#merge-result "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Read Merge Result

Returns a pull request's merge state, merge commit, head and base.

#### 1. Read Merge Result

Run the command using [Identity](#identity "input"), [Repository](#repository "input").

<big><pre>
gh api 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)' --jq '{merged, merge_commit_sha, head: .head.sha, base: .base.ref}'
</pre></big>

**Example:**

<big><pre>
gh api 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/980' --jq '{merged, merge_commit_sha, head: .head.sha, base: .base.ref}'
</pre></big>

#### 2. Provide Read Merge Result

Provide [Merge Result](#merge-result "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Set Development Link

Adds one pull request to an issue's Development relation, and reads the relation back from both ends.

#### 1. Set Development Link

- Run the command using [Workspace](#workspace "input"), [Issue Identity](#issue-identity "input"), [Authenticated Access](#authenticated-access "input"), [Repository Prerequisite](#repository-prerequisite "input").

**REST gap:** REST exposes no write to the Development relation; `addCloseIssueReferences` is a GraphQL mutation alone.

- The issue and [pull request](#identity "input") may sit in different repositories, and the pull request may be a draft on any base branch.
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

#### 2. Provide Saved Development Link

Provide [Development Relation](#development-relation "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Remove Development Link

Removes one pull request from an issue's Development relation, and reads the relation back from both ends.

#### 1. Remove Development Link

- Run the command using [Workspace](#workspace "input"), [Identity](#identity "input"), [Issue Identity](#issue-identity "input"), [Authenticated Access](#authenticated-access "input"), [Removal Decision](#removal-decision "input").

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

#### 2. Provide Removed Development Link

Provide [Development Relation](#development-relation "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Capture Pull Request Links

Writes the complete issue-link snapshot for a pull request collection, read from the pull-request end of the Development relation.

#### 1. Capture Pull Request Links

- Run the command using [Workspace](#workspace "input"), [Link-Snapshot Path](#link-snapshot-path "input"), [Authenticated Access](#authenticated-access "input").

**REST gap:** REST exposes no read of a pull request's closing issue references.

- The snapshot meets [Issue-Link Snapshot](#issue-link-snapshot "output").
- Each batch of [pull requests](#pull-request-records "input") costs one `gh api graphql` call from a generated query file, so the command runs outside `sbx`, where `gh` reaches the tracker.
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

#### 2. Provide Capture Pull Request Links

Provide [Issue-Link Snapshot](#issue-link-snapshot "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Save Pull Request Snapshot

Saves one complete pull request response, replacing the destination file.

#### 1. Save Pull Request Snapshot

Run the command using [Identity](#identity "input"), [Output Files](#output-files "input"), [Repository](#repository "input").

<big><pre>
gh api 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)' > '[**<pull-request-json-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/980' > epic-pr.json
</pre></big>

#### 2. Provide Save Pull Request Snapshot

Provide [Pull Request Record](#pull-request-record "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Fetch Pull Request Reviews

Saves every review on one pull request.

#### 1. Fetch Pull Request Reviews

Run the command using [Identity](#identity "input"), [Output Files](#output-files "input"), [Repository](#repository "input").

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)/reviews?per_page=100' > '[**<reviews-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/980/reviews?per_page=100' > reviews.json
</pre></big>

#### 2. Provide Fetched Pull Request Reviews

Provide [Reviews](#reviews "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Fetch Initiative Pull Requests

Saves the task and epic pull requests that name one initiative's epics.

#### 1. Fetch Initiative Pull Requests

Run the command using [Repository](#repository "input"), [Initiative Prefix](#initiative-prefix "input"), [Collection Path](#collection-path "input"), [Pull Request Records](#pull-request-records "input").

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[**<initiative-prefix>**](#initiative-prefix)"))' > '[**<pull-request-records-file>**](#pull-request-records)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07"))' > prs.json
</pre></big>

#### 2. Provide Fetched Initiative Pull Requests

Provide [Pull Request Records](#pull-request-records "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Fetch Linked Pull Requests

Appends to a pull request collection each pull request the plan links that the collection lacks, whatever its title.

#### 1. Fetch Linked Pull Requests

- Run the command using [Workspace](#workspace "input"), [Collection Path](#collection-path "input"), [Issue Records](#issue-records "input"), [Pull Request Records](#pull-request-records "input").

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

#### 2. Provide Fetched Linked Pull Requests

Provide [Pull Request Records](#pull-request-records "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Fetch Repository Delivery Pull Requests

Starts a collection with all initiative- and hot-fix-prefixed pull requests from one repository.

#### 1. Fetch Repository Delivery Pull Requests

Run the command using [Repository](#repository "input"), [Collection Path](#collection-path "input"), [Pull Request Records](#pull-request-records "input").

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' > '[**<pull-request-records-file>**](#pull-request-records)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' > prs.json
</pre></big>

#### 2. Provide Fetched Repository Delivery Pull Requests

Provide [Pull Request Records](#pull-request-records "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Append Repository Delivery Pull Requests

Appends all initiative- and hot-fix-prefixed pull requests from one further repository.

#### 1. Append Repository Delivery Pull Requests

Run the command using [Repository](#repository "input"), [Collection Path](#collection-path "input"), [Pull Request Records](#pull-request-records "input").

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' >> '[**<pull-request-records-file>**](#pull-request-records)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' >> prs.json
</pre></big>

#### 2. Provide Appended Repository Delivery Pull Requests

Provide [Pull Request Records](#pull-request-records "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Fetch Pull Request Files

Saves the paths a pull request changes.

#### 1. Fetch Pull Request Files

Run the command using [Identity](#identity "input"), [Output Files](#output-files "input"), [Repository](#repository "input").

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/[**<pull-request-number>**](#identity)/files' --jq '.[].filename' > '[**<changed-paths-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/pulls/950/files' --jq '.[].filename' > changed-files.txt
</pre></big>

#### 2. Provide Fetched Pull Request Files

Provide [Changed Paths](#changed-paths "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Fetch Head Check Runs

Saves every check run for one exact commit.

#### 1. Fetch Head Check Runs

Run the command using [Repository](#repository "input"), [Verified Head](#verified-head "input"), [Output Files](#output-files "input").

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/commits/[**<head-sha>**](#verified-head)/check-runs?per_page=100' > '[**<check-runs-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/commits/[**<head-sha>**](#verified-head)/check-runs?per_page=100' > checks.json
</pre></big>

#### 2. Provide Fetched Head Check Runs

Provide [Head Checks](#head-checks "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Fetch Head Status

Saves commit status evidence for one exact commit.

#### 1. Fetch Head Status

Run the command using [Repository](#repository "input"), [Verified Head](#verified-head "input"), [Output Files](#output-files "input").

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/commits/[**<head-sha>**](#verified-head)/status?per_page=100' > '[**<commit-status-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/commits/[**<head-sha>**](#verified-head)/status?per_page=100' > status.json
</pre></big>

#### 2. Provide Fetched Head Status

Provide [Head Status](#head-status "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Mark Review Ready

Marks a draft pull request ready for review.

#### 1. Mark Review Ready

- Run the command using [Node Metadata](#node-metadata "input").

**REST gap:** REST has no endpoint that marks a draft ready for review.

- The [query file](#query-file "input") holds the mutation with the node id inlined, since a GraphQL variable is a literal `$`:

  ```graphql
  mutation { markPullRequestReadyForReview(input: {pullRequestId: "<pull-request-node-id>"}) { pullRequest { isDraft } } }
  ```

<big><pre>
gh api graphql -F query=@'[**<query-file>**](#query-file)' --jq .data.markPullRequestReadyForReview.pullRequest.isDraft
</pre></big>

#### 2. Provide Mark Review Ready

Provide [Review State](#review-state "output") to the requester, or [Failure](#failure "output") if the operation fails.

### Mark Review Draft

Returns an open integration pull request with blocked handoff evidence to draft.

#### 1. Mark Review Draft

Run the command using [Identity](#identity "input"), [Repository](#repository "input").

<big><pre>
gh pr ready '[**<pull-request-number>**](#identity)' --undo --repo '[**<owner>**](#repository)/[**<repository>**](#repository)'
</pre></big>

#### 2. Provide Mark Review Draft

Provide [Review State](#review-state "output") to the requester, or [Failure](#failure "output") if the operation fails.

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

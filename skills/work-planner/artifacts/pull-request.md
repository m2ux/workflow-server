# Pull Request

A pull request's identity, head and base, issue links, review state and merge result. Its populated body is an input.

## Operations

### Merge Delivery Pull Request

One delivery pull request's confirmed merge, human handoff or classified refusal.

#### 1. Read Target Review Requirements

- Read the supplied [Target Requirements](#target-requirements) alongside the [Verified Head](#verified-head) and confirm the supplied [Merge Authorization](#merge-authorization) against [Merge Permission](#merge-permission).
- When the target is the default branch or requires an approving review from a person, provide [Merge Result](#merge-result) with outcome `human-handoff`, the verified head and target requirements, and return without a merge attempt. The reviewer owns the merge even when every other condition holds.
- An agent cannot approve a [pull request](#identity) it opened.
- Keep approval with that reviewer. Another account, an administrative bypass or a setting change cannot supply it. Changing repository protection requires the user's explicit authorization, asked for separately.
- For example, workflow-server's `main` requires one approving review, so carry an epic to ready and stop.
- Otherwise continue to merge approved delivery only when the authorization permits this delivery target and [Repository Prerequisite](#repository-prerequisite) is confirmed; provide a missing condition as [Failure](#failure) and return.

#### 2. Merge Approved Delivery

- Select the mutation from [Kind](#kind), using the current [Readiness Evidence](#readiness-evidence), authorization, target requirements and exact verified head SHA.

##### Task Merge

Run [Merge Pull Request](#merge-pull-request "ƒ") for a task with that evidence.

##### Epic Merge

Run [Submit Epic Merge](#submit-epic-merge "ƒ") for an epic with that evidence.

##### Mutation Outcome

- For either selected mutation, retain its [Merge Response](#merge-response), or the observed permission-layer refusal or [Failure](#failure).
- When the harness declines to execute the mutation, provide [Merge Result](#merge-result) with outcome `harness-denial`, the verified head and target, the observed refusal and missing permission, and return. GitHub supplies no response to that attempt. Report current ready-and-verified state only while its evidence remains current; this outcome requests no human approval and permits no further merge attempt in this run.
- When GitHub returns a refusal, including a head-SHA mismatch or a response with `merged: false`, provide [Merge Result](#merge-result) with outcome `github-refusal`, the exact attempted head and target and GitHub's refusal evidence, and return for the caller's bounded fresh-verification route.
- For an unreadable response or transport failure, provide [Failure](#failure) with the unknown mutation outcome and return; no merge is confirmed.
- Only a response with `merged: true` continues to confirm the merge.

#### 3. Confirm Delivery Merge

- Run [Read Merge Result](#read-merge-result "ƒ") for the same [Identity](#identity).
- Compare its [Merge State](#merge-state) with the verified head, target and mutation's merge commit.
- On a missing merge, changed head or target, absent merge commit or disagreeing commit, provide [Failure](#failure) with the discrepancy and return.
- Provide [Merge Result](#merge-result) with outcome `confirmed-merge`, the verified head and target, and the confirmed merge commit.

### Access Development Links

The observed or updated Development relation for a pull request.

#### 1. Read Complete Development Relation

- For a read-only [Link Request](#link-request), use [Authenticated Access](#authenticated-access):
- Apply [Read Pull Request State](#read-pull-request-state "ƒ") for the [pull request](#identity)'s metadata, which carries the `html_url` the capture keys it by.
- Run [Capture Pull Request Links](#capture-pull-request-links "ƒ") with that record and provide its entry, every page read. An unreadable relation is a blocker, not an empty link set.

#### 2. Edit Authorized Development Relation

- For a link edit:
- Require confirmed [Repository Prerequisite](#repository-prerequisite); an unconfirmed setting blocks the edit.
- For an addition, Run [Set Development Link](#set-development-link "ƒ") with the pull request and [Issue Identity](#issue-identity).

- For removal of an abandoned or incorrect link:
- Require [Removal Decision](#removal-decision).
- Run [Remove Development Link](#remove-development-link "ƒ") with those identities.

#### 3. Provide Verified Relation

Provide [Development Relation](#development-relation) verified from both ends, or the discrepancy or [Failure](#failure) it names. A failed write is a blocker carrying its operation and error, never an unavailable field.

### Fetch Pull Request Issue Links

The complete issue-link snapshot for a supplied set of pull requests.

#### 1. Capture Complete Issue Links

Run [Capture Pull Request Links](#capture-pull-request-links "ƒ") with the supplied [Pull Request Records](#pull-request-records), saving at [Link-Snapshot Path](#link-snapshot-path), such as `links.json`.

#### 2. Require Complete Relation Evidence

If it names an unreadable relation, stop and provide each one named as a blocker. Incomplete evidence is never a partial snapshot.

#### 3. Refresh Changed Link Snapshot

After a link changes, Run [Capture Pull Request Links](#capture-pull-request-links "ƒ") again with the refreshed [pull request records](#pull-request-records), the same [authenticated access](#authenticated-access) and destination.

#### 4. Provide Complete Snapshot

Provide [Issue-Link Snapshot](#issue-link-snapshot) for the scripts’ `--links` input, or [Failure](#failure) with each unreadable relation.

### Link Pull Request to Issue

The verified delivery-issue relation for a pull request.

#### 1. Add Development Relation

Apply [Access Development Links](#access-development-links "ƒ") to add the selected issue to the pull request.

#### 2. Require Verified Edit

Stop on a blocker or an unverified edit.

#### 3. Refresh Issue-Link Snapshot

Apply [Fetch Pull Request Issue Links](#fetch-pull-request-issue-links "ƒ") with [Pull Request Records](#pull-request-records) and [Link-Snapshot Path](#link-snapshot-path) after the edit.

#### 4. Provide Relation Evidence

Provide verified [Development Relation](#development-relation) and refreshed [Issue-Link Snapshot](#issue-link-snapshot), or [Failure](#failure) for an unverified edit or read.

### Fetch All Delivery Pull Requests

The pull request collection covering every supplied board repository and every pull request the board's issues link.

#### 1. Create Fresh Pull Collection

Run [Fetch Repository Delivery Pull Requests](#fetch-repository-delivery-pull-requests "ƒ") for the first entry in [Repository List](#repository-list), saving at [Collection Path](#collection-path), such as `prs.json`. This replaces the destination with a fresh collection.

#### 2. Stop on Initial Failure

Stop on failure.

#### 3. Append Remaining Repositories

Run [Append Repository Delivery Pull Requests](#append-repository-delivery-pull-requests "ƒ") for each further repository, passing the same destination.

#### 4. Fetch Plan-Linked Pull Requests

Run [Fetch Linked Pull Requests](#fetch-linked-pull-requests "ƒ") with that destination and the board issue entries in [Issue Records](#issue-records).

#### 5. Report Incomplete Fetch

If any fetch failed, provide incomplete evidence.

#### 6. Provide Complete Pull Collection

Provide the complete [Pull Request Records](#pull-request-records) only after every fetch succeeds, or [Failure](#failure) with incomplete evidence.

### Read Initiative Pull Requests

The current delivery pull requests for one initiative: each one whose title names it, and each one its plan links, whatever its title.

#### 1. Fetch Initiative-Prefixed Pull Requests

Run [Fetch Initiative Pull Requests](#fetch-initiative-pull-requests "ƒ") for the selected initiative.

#### 2. Fetch All Plan-Linked Pull Requests

Run [Fetch Linked Pull Requests](#fetch-linked-pull-requests "ƒ") with that collection and [Issue Records](#issue-records).

#### 3. Provide Initiative Pull Collection

Provide [Pull Request Records](#pull-request-records), or [Failure](#failure) naming each unreadable relation or pull request.

### Read Pull Request State

One current pull request and its requested supporting records.

#### 1. Save Complete Pull Response

Run [Save Pull Request Snapshot](#save-pull-request-snapshot "ƒ") with [Identity](#identity), saving JSON at [Output Files](#output-files).

#### 2. Fetch Requested Supporting Records

Run [Fetch Pull Request Files](#fetch-pull-request-files "ƒ") or Run [Fetch Pull Request Reviews](#fetch-pull-request-reviews "ƒ") when [Record Selection](#record-selection) requests those records.

#### 3. Provide Requested Pull Records

Provide [Pull Request Record](#pull-request-record), [Changed Paths](#changed-paths) and [Reviews](#reviews) as selected, or [Failure](#failure) for missing evidence.

### Publish Pull Request

One pull request created or updated from supplied content and metadata.

#### 1. Create Delivery Pull Request

- For creation, Run [Open Task Pull Request](#open-task-pull-request "ƒ") or Run [Open Epic Pull Request](#open-epic-pull-request "ƒ") as the selected kind requires.
- For a task or epic pull request with a delivery issue, Apply [Link Pull Request to Issue](#link-pull-request-to-issue "ƒ"), meeting [Issue Links](#issue-links).

- A pull request outside epic delivery targets a long-lived branch. An open stacked pull request targets its long-lived branch once its base merges.

#### 2. Update Selected Pull Fields

For an existing [Identity](#identity), Run [Patch Pull Request Body](#patch-pull-request-body "ƒ"), Run [Retitle Pull Request](#retitle-pull-request "ƒ") or Run [Retarget Pull Request](#retarget-pull-request "ƒ") for the selected changes, preserving other fields.

#### 3. Read Saved Pull State

Apply [Read Pull Request State](#read-pull-request-state "ƒ") again.

#### 4. Provide Saved Pull Record

Provide the saved [Pull Request Record](#pull-request-record) or [Failure](#failure) with the discrepancy.

### Merge Task Pull Requests

Merges each open task pull request whose test plan has passed.

#### 1. Confirm Repository and Base

Apply [Confirm Repository Auto-Close](issue.md#confirm-repository-auto-close "ƒ") for the repository, and confirm the task [Identity](#identity) targets [Base Branch](#base-branch), as [Task Branches](delivery-branches.md#task-branches) names it. An epic base carries no review requirement of its own; carry any applicable target review requirement into the merge step.

#### 2. Merge Verified Task Pull

- Where its base is an epic base, Apply [Update Epic Base](delivery-branches.md#update-epic-base "ƒ") with the [project checkout](#project-checkout) and that base.
- Apply [Fetch Merge Readiness](#fetch-merge-readiness "ƒ") for the task pull request and its base.
- Apply [Merge Delivery Pull Request](#merge-delivery-pull-request "ƒ") with delivery kind task, verified head, target requirements, [Repository Prerequisite](#repository-prerequisite) and passing [Readiness Evidence](#readiness-evidence), without further confirmation.
- Stop on `human-handoff`, `harness-denial` or an unconfirmed mutation outcome, returning the provided result to the caller.

- Only for `github-refusal`, refresh once:
- Apply [Update Task Branch](delivery-branches.md#update-task-branch "ƒ") with the [unit checkout](#unit-checkout), the task branch and its base.
- Apply [Fetch Merge Readiness](#fetch-merge-readiness "ƒ") again for the updated task head.
- Apply [Merge Delivery Pull Request](#merge-delivery-pull-request "ƒ") once more with that verified evidence. Continue to confirmation only for `confirmed-merge`; return any other result without another attempt. A conflict or repeated refusal leaves the pull request open with the blocker reported.

#### 3. Confirm Task Merge Result

- Only for `confirmed-merge`, Apply [Read Pull Request State](#read-pull-request-state "ƒ") to confirm the merged state, head, base and merge commit.
- Provide [Merge Result](#merge-result), or [Failure](#failure) with the unresolved conflict, refusal or handoff.

### Fetch Merge Readiness

The current pull request's readiness against its target requirements and head checks.

#### 1. Read Current Pull Head

- Apply [Read Pull Request State](#read-pull-request-state "ƒ") with the [pull request identity](#identity) and destination `epic-pr.json`.
- Retain the literal head SHA and target branch for the evidence calls.

#### 2. Read Current Target Requirements

- For the repository, use [Base Branch](#base-branch) as the [target branch](delivery-branches.md#target-branch), saving protection/rules evidence at [Output Files](#output-files).

- Run [Fetch Branch Protection](delivery-branches.md#fetch-branch-protection "ƒ") for [Target Branch](delivery-branches.md#target-branch) in [Repository](delivery-branches.md#repository), using [Output Files](delivery-branches.md#output-files) for the evidence destinations.

- Run [Fetch Active Branch Rules](delivery-branches.md#fetch-active-branch-rules "ƒ") for the same target.

- Retain [Target Requirements](delivery-branches.md#target-requirements) with both records, or [Failure](delivery-branches.md#failure) when a requirement is unreadable. A protection 404 does not establish the absence of active rules.
- Carry any unresolved requirement into the readiness result.

#### 3. Read Literal Head Evidence

- Read the head evidence.
- Use the exact head SHA and check/status output paths.

- Run [Fetch Head Check Runs](#fetch-head-check-runs "ƒ") for the verified head.

- Run [Fetch Head Status](#fetch-head-status "ƒ") for the same SHA.

- Retain [Head Checks](#head-checks) and [Head Status](#head-status), retaining missing or pending evidence as unresolved [Failure](#failure).
- Apply [Read Pull Request State](#read-pull-request-state "ƒ") for reviews with the pull request identity and reviews output path.
- Compare the check-run and status evidence with the target requirements and current reviews. A missing or pending check, blocked merge state or unmet required review leaves readiness unresolved.

#### 4. Confirm Stable Pull Head

- Apply [Read Pull Request State](#read-pull-request-state "ƒ") again with the same identity and destination.
- Compare its head with the retained SHA; a changed head requires fresh evidence.
- Provide [Verified Head](#verified-head), [Target Requirements](#target-requirements) and [Readiness Evidence](#readiness-evidence), retaining unresolved conditions as [Failure](#failure).

### Hold Epic Review

An open epic review held in draft while its handoff evidence is unresolved.

#### 1. Mark Open Review Draft

Apply [Read Pull Request State](#read-pull-request-state "ƒ") for full metadata. For an open ready [pull request](#identity), Run [Mark Review Draft](#mark-review-draft "ƒ").

#### 2. Confirm Review Draft State

Apply [Read Pull Request State](#read-pull-request-state "ƒ") again with the same identity and provide [Review State](#review-state) with the confirmed draft state, or [Failure](#failure) with the discrepancy.

## Commands

### Retarget Pull Request

Point a pull request at another base branch, such as its epic's base branch, and provide [Base Branch](#base-branch "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api &#92;
  --method PATCH repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls/[**&lt;pull-request-number&gt;**](#identity "○") &#92;
  -f base='[**&lt;target-branch&gt;**](#base-branch "○")' &#92;
  --jq .base.ref
</pre></big>

### Retitle Pull Request

Replace a pull request's title and provide [Title](#title "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api --method PATCH repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls/[**&lt;pull-request-number&gt;**](#identity "○") -f title='[**&lt;title&gt;**](#title "○")' --jq .title
</pre></big>

### Open Task Pull Request

Create a pull request from a unit's branch to its base and provide [Identity](#identity "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api &#92;
  --method POST repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls &#92;
  -f title='[**&lt;title&gt;**](#title "○")' &#92;
  -f head='[**&lt;task-branch&gt;**](#head-branch "○")' &#92;
  -f base='[**&lt;base&gt;**](#base-branch "○")' &#92;
  -F 'body=@[**&lt;body-file&gt;**](#body-file "○")' &#92;
  --jq .html_url
</pre></big>

- Supply the [title](#title "○"), the task branch as head, the base [Task Branches](delivery-branches.md#task-branches) names as base, and the [complete body file](#body-file "○").
- A title opening with a hot-fix prefix, `[F00]`, always adds `-F draft=true`, as a [delivering pull request](hotfix.md#delivering-pull-request) opens.

### Open Epic Pull Request

Create the draft pull request from an epic base to its long-lived target and provide [Identity](#identity "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api &#92;
  --method POST repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls &#92;
  -f title='[**&lt;title&gt;**](#title "○")' &#92;
  -f head='[**&lt;epic-base&gt;**](#head-branch "○")' &#92;
  -f base='[**&lt;long-lived-base&gt;**](#base-branch "○")' &#92;
  -F draft=true &#92;
  -F 'body=@[**&lt;body-file&gt;**](#body-file "○")' &#92;
  --jq .html_url
</pre></big>

- Supply the epic prefix and name as [title](#title "○"), the epic base as head, its long-lived branch as base, and the populated review [body file](#body-file "○").
- `draft` is true, including when the work is already complete.

### Merge Pull Request

Merge the task pull request at the supplied verified head and provide [Merge Response](#merge-response "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api &#92;
  --method PUT repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls/[**&lt;pull-request-number&gt;**](#identity "○")/merge &#92;
  -f merge_method=merge &#92;
  -f sha=[**&lt;head-sha&gt;**](#verified-head "○") &#92;
  --jq '{merged, message, sha}'
</pre></big>

- Require [Merge Authorization](#merge-authorization "○") before executing the command.

- Require the supplied [readiness evidence](#readiness-evidence "○") and authorization before issuing the merge.
- The merge method is a merge commit. The endpoint refuses a different head; the refusal is evidence for fresh verification, never confirmation of a merge.

### Patch Pull Request Body

Replace a pull request's body and provide [Identity](#identity "●") to the requester, or [Failure](#failure "●") if the operation fails.

The file is the whole body. The issue a pull request delivers is linked on the pull request itself, so this call leaves that link standing.

<big><pre>
gh api --method PATCH repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls/[**&lt;pull-request-number&gt;**](#identity "○") -F 'body=@[**&lt;body-file&gt;**](#body-file "○")' --jq .html_url
</pre></big>

### Find Review Pull Request

Find the open pull request whose head is the supplied epic base and provide [Review Number](#review-number "●") to the requester, or [Failure](#failure "●") if the operation fails. If none exists, provide no result.

<big><pre>
gh api "repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls?state=open&head=[**&lt;owner&gt;**](#repository "○"):[**&lt;epic-base&gt;**](#head-branch "○")" --jq '.[0].number'
</pre></big>

### Submit Epic Merge

Merge the epic base into its long-lived target at the supplied head and provide [Merge Response](#merge-response "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api &#92;
  --method PUT repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls/[**&lt;pull-request-number&gt;**](#identity "○")/merge &#92;
  -f merge_method=merge &#92;
  -f sha=[**&lt;head-sha&gt;**](#verified-head "○") &#92;
  --jq '{merged, message, sha}'
</pre></big>

- Require [Merge Authorization](#merge-authorization "○"), [Readiness Evidence](#readiness-evidence "○"), [Target Requirements](#target-requirements "○") before executing the command.

- The merge method is a merge commit. The endpoint refuses a different head.

### Read Merge Result

Read the merge state, merge commit, head and base of a pull request and provide [Merge State](#merge-state "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls/[**&lt;pull-request-number&gt;**](#identity "○") &#92;
  --jq '{merged, merge_commit_sha, head: .head.sha, base: .base.ref}'
</pre></big>

### Set Development Link

Add one pull request to an issue's Development relation, read the relation back from both ends, and provide [Development Relation](#development-relation "●") to the requester, or [Failure](#failure "●") if the operation fails.

**REST gap:** REST exposes no write to the Development relation; `addCloseIssueReferences` is a GraphQL mutation alone.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  python3 skills/work-planner/scripts/development-link.py add &#92;
  --issue [**&lt;issue-owner&gt;**](#issue-identity "○")/[**&lt;issue-repo&gt;**](#issue-identity "○")#[**&lt;issue-number&gt;**](#issue-identity "○") &#92;
  --pull [**&lt;pr-owner&gt;**](#identity "○")/[**&lt;pr-repo&gt;**](#identity "○")#[**&lt;pull-request-number&gt;**](#identity "○")
</pre></big>

- Require [Authenticated Access](#authenticated-access "○"), [Repository Prerequisite](#repository-prerequisite "○") before executing the command.


- The issue and [pull request](#identity "○") may sit in different repositories, and the pull request may be a draft on any base branch.
- The script reads both node ids through REST and sends `addCloseIssueReferences` from a generated query file, so the command runs outside `sbx`, where `gh` reaches the tracker.
- Exit 0 means the issue holds the pull request exactly once, the pull request holds the issue, and every other link on the issue stands. Running it again for a linked pair holds the same relation.
- Exit 1 prints `failed:` with the operation, the step and the tracker's error, or `discrepancy:` with the relation read back.

### Remove Development Link

Remove one pull request from an issue's Development relation, read the relation back from both ends, and provide [Development Relation](#development-relation "●") to the requester, or [Failure](#failure "●") if the operation fails.

**REST gap:** REST exposes no write to the Development relation; `removeCloseIssueReferences` is a GraphQL mutation alone.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  python3 skills/work-planner/scripts/development-link.py remove &#92;
  --issue [**&lt;issue-owner&gt;**](#issue-identity "○")/[**&lt;issue-repo&gt;**](#issue-identity "○")#[**&lt;issue-number&gt;**](#issue-identity "○") &#92;
  --pull [**&lt;pr-owner&gt;**](#identity "○")/[**&lt;pr-repo&gt;**](#identity "○")#[**&lt;pull-request-number&gt;**](#identity "○")
</pre></big>

- Require [Authenticated Access](#authenticated-access "○"), [Removal Decision](#removal-decision "○") before executing the command.


- The script sends `removeCloseIssueReferences` from a generated query file, so the command runs outside `sbx`.
- Exit 0 means neither end holds the other and every other link on the issue stands.
- Exit 1 prints `failed:` or `discrepancy:` with the operation, step and tracker error, or the relation read back.

### Capture Pull Request Links

Write the complete issue-link snapshot for a pull request collection from the pull-request end of the Development relation and provide [Issue-Link Snapshot](#issue-link-snapshot "●") to the requester, or [Failure](#failure "●") if the operation fails.

**REST gap:** REST exposes no read of a pull request's closing issue references.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  python3 skills/work-planner/scripts/links-by-pull-request.py &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --out '[**&lt;issue-link-snapshot-file&gt;**](#link-snapshot-path "○")'
</pre></big>

- Require [Authenticated Access](#authenticated-access "○") before executing the command.


- The snapshot should meet [Issue-Link Snapshot](#issue-link-snapshot "●").
- Each batch of [pull requests](#pull-request-records "○") costs one `gh api graphql` call from a generated query file, so the command runs outside `sbx`, where `gh` reaches the tracker.
- A relation is unreadable when any page of it does not arrive whole: the tracker returns no node for its subject, names the subject in an error, or reports a further page it does not supply.
- Exit 0 means the snapshot is complete. Exit 1 names each unreadable relation with the tracker's reason and writes no snapshot; the caller treats it as a blocker.
- A call the tracker refuses outright, such as a rejected credential, exits 1 with `GraphQL read failed:` and what `gh` reported, and writes nothing.

### Save Pull Request Snapshot

Replace the destination file with one complete pull request response and provide [Pull Request Record](#pull-request-record "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls/[**&lt;pull-request-number&gt;**](#identity "○") &gt; '[**&lt;pull-request-json-file&gt;**](#output-files "○")'
</pre></big>

### Fetch Pull Request Reviews

Save every review on one pull request and provide [Reviews](#reviews "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api --paginate 'repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls/[**&lt;pull-request-number&gt;**](#identity "○")/reviews?per_page=100' &gt; '[**&lt;reviews-file&gt;**](#output-files "○")'
</pre></big>

### Fetch Initiative Pull Requests

Save the task and epic pull requests that name one initiative's epics and provide [Pull Request Records](#pull-request-records "●") to the requester, or [Failure](#failure "●") if the operation fails.

Use [Collection Path](#collection-path "○") for the saved collection.

<big><pre>
gh api &#92;
  --paginate "repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls?state=all&per_page=100" &#92;
  --jq '.[] | select(.title | startswith("[**&lt;initiative-prefix&gt;**](#initiative-prefix "○")"))' &#92;
  &gt; '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")'
</pre></big>

### Fetch Linked Pull Requests

Append each pull request linked by the plan but missing from the collection, regardless of its title, and provide [Pull Request Records](#pull-request-records "●") to the requester, or [Failure](#failure "●") if the operation fails.

**REST gap:** REST exposes no read of the pull requests an issue's Development field holds.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  python3 skills/work-planner/scripts/linked-pull-requests.py &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --issues '[**&lt;issue-file&gt;**](#issue-records "○")' ...
</pre></big>

- Use [Collection Path](#collection-path "○") for the saved collection.


- A pull request is linked when a Work Breakdown row's id cell links it or an issue's Development field names it, open, closed or merged, in whichever repository it lives.
- A pull request no row or Development link names is found by its title alone, through the title-matched fetch this command follows.
- The command reads the Development field by `gh api graphql` and each missing pull request by REST, so it runs outside `sbx`, where `gh` reaches the tracker.
- Exit 0 means every linked pull request is in the collection. Exit 1 names each unreadable relation or pull request and appends nothing; the caller treats it as a blocker.

### Fetch Repository Delivery Pull Requests

Start a collection with all initiative- and hot-fix-prefixed pull requests from one repository and provide [Pull Request Records](#pull-request-records "●") to the requester, or [Failure](#failure "●") if the operation fails.

Use [Collection Path](#collection-path "○") for the saved collection.

<big><pre>
gh api &#92;
  --paginate "repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls?state=all&per_page=100" &#92;
  --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' &#92;
  &gt; '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")'
</pre></big>

### Append Repository Delivery Pull Requests

Append all initiative- and hot-fix-prefixed pull requests from one further repository and provide [Pull Request Records](#pull-request-records "●") to the requester, or [Failure](#failure "●") if the operation fails.

Use [Collection Path](#collection-path "○") for the saved collection.

<big><pre>
gh api &#92;
  --paginate "repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls?state=all&per_page=100" &#92;
  --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' &#92;
  &gt;&gt; '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")'
</pre></big>

### Fetch Pull Request Files

Save the paths a pull request changes and provide [Changed Paths](#changed-paths "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api &#92;
  --paginate repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/pulls/[**&lt;pull-request-number&gt;**](#identity "○")/files &#92;
  --jq '.[].filename' &#92;
  &gt; '[**&lt;changed-paths-file&gt;**](#output-files "○")'
</pre></big>

### Fetch Head Check Runs

Save every check run for one exact commit and provide [Head Checks](#head-checks "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api --paginate 'repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/commits/[**&lt;head-sha&gt;**](#verified-head "○")/check-runs?per_page=100' &gt; '[**&lt;check-runs-file&gt;**](#output-files "○")'
</pre></big>

### Fetch Head Status

Save commit status evidence for one exact commit and provide [Head Status](#head-status "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api --paginate 'repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/commits/[**&lt;head-sha&gt;**](#verified-head "○")/status?per_page=100' &gt; '[**&lt;commit-status-file&gt;**](#output-files "○")'
</pre></big>

### Mark Review Ready

Mark a draft pull request ready for review and provide [Review State](#review-state "●") to the requester, or [Failure](#failure "●") if the operation fails.

**REST gap:** REST has no endpoint that marks a draft ready for review.

<big><pre>
gh api graphql -F query=@'[**&lt;query-file&gt;**](#query-file "○")' --jq .data.markPullRequestReadyForReview.pullRequest.isDraft
</pre></big>

- Build the selected GraphQL mutation from [Node Metadata](#node-metadata "○") before running it.


- The [query file](#query-file "○") holds the mutation with the node id inlined, since a GraphQL variable is a literal `$`:

  ```graphql
  mutation { markPullRequestReadyForReview(input: {pullRequestId: "<pull-request-node-id>"}) { pullRequest { isDraft } } }
  ```

### Mark Review Draft

Mark an open pull request with blocked readiness evidence as draft and provide [Review State](#review-state "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh pr ready [**&lt;pull-request-number&gt;**](#identity "○") --undo --repo [**&lt;owner&gt;**](#repository "○")/[**&lt;repository&gt;**](#repository "○")
</pre></big>

## Fields

### State

A pull request is open, draft, ready for review, merged or closed without merge. A draft is never merged. A merged result identifies the verified head, target and merge commit. An epic review is draft from the first task merge until every task is delivered, every epic criterion is verified and ticked, and current agent review evidence passes.

### Scope

The task-id set delivered by the pull request. A task pull request delivers one task, or a set of tasks that name each other in Joins.

### Issue Links

The set of Development relations between issue and pull-request identities.

- GitHub shows the link in the pull request's Development field and in the issue's Linked pull requests field, which the project board reads.
- A task pull request links the task's issue, and a review pull request links its epic's issue.
- The link is addressed by issue, so a pull request whose work carries no issue links nothing. A task pull request delivering rows that have no issue of their own is the whole of what stays unlinked.
- The link is stored on the pull request. It holds on any base branch and on a pull request that has merged, and a later body edit leaves it standing.
- A linked issue remains open until its criteria and delivery requirements hold and every Development-linked pull request is merged.
- The field is the whole of the relation: neither body links the other. The pull request's References carry its sources, and the issue it delivers is not among them.
- A pull request with a delivery issue but no Development link is uncited.

### Identity

The pull request’s repository-qualified identity, or its repository and local number. A new pull request has no saved identity until creation succeeds. eg `m2ux/workflow-server#950`, `950`

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

The operation's result has `outcome`, pull request identity, exact verified `head`, `target` and evidence. Its outcomes are `confirmed-merge` (the readback-confirmed merge commit), `human-handoff` (the default-branch or required-person merge boundary), `harness-denial` (the observed permission refusal with no GitHub response), and `github-refusal` (GitHub's refusal response). Only `confirmed-merge` carries a confirmed merge commit; every other outcome leaves the pull request open. An unreadable response or disagreeing readback is [Failure](#failure), with no confirmed merge. eg `{"outcome":"confirmed-merge","pull_request":"m2ux/workflow-server#950","head":"0123456789abcdef0123456789abcdef01234567","target":"i07/e00/main","merge_commit":"89abcdef0123456789abcdef0123456789abcdef01","evidence":"merge response and matching readback"}`

### Merge Response

The merge endpoint's JSON object `{merged, message, sha}`: `merged` is a boolean, `message` is GitHub's response text and `sha` is the resulting merge commit on success. A refused request retains its HTTP status and response; a harness denial has no response. eg `{"merged":true,"message":"Pull Request successfully merged","sha":"89abcdef0123456789abcdef0123456789abcdef01"}`

### Merge State

The readback JSON object `{merged, merge_commit_sha, head, base}`: `merged` is a boolean, the merge commit is nullable, `head` is the literal commit SHA and `base` is the target branch. An absent or unreadable response supplies no confirmed state. eg `{"merged":true,"merge_commit_sha":"89abcdef0123456789abcdef0123456789abcdef01","head":"0123456789abcdef0123456789abcdef01234567","base":"i07/e00/main"}`

### Link Request

The requested read, addition or removal of a Development relation.

### Issue Identity

The delivery issue’s repository-qualified identity; absent where the work carries no issue of its own. eg `m2ux/workflow-server#637`

### Removal Decision

The user decision authorizing removal of the supplied abandoned or incorrect Development link.

### Pull Request Records

Complete pull request REST responses stored as JSON lines, from one or more repositories. Each record includes its repository identity and `html_url`. eg `prs.json`

### Issue-Link Snapshot

The complete saved Development snapshot, with one entry per pull request and every linked issue’s repository and number, or an empty array. eg `[{"repo": "owner/repo", "number": 950, "closingIssuesReferences": [{"repo": "owner/repo", "number": 637}]}]`

### Link-Snapshot Path

The supplied destination for a complete Development snapshot. The snapshot is absent before a successful capture writes it. eg `links.json`

### Development Relation

The issue and pull request identities verified from both ends, or an explicit unreadable or failed relation. eg `issue m2ux/workflow-server#637: m2ux/workflow-server#950`, `pull request m2ux/workflow-server#950: m2ux/workflow-server#637`, `verified: add m2ux/workflow-server#950 -> m2ux/workflow-server#637`

### Repository List

The ordered repositories included in a board delivery fetch.

### Issue Records

The fetched plan issues supplied as issue files, or board items containing their complete issues. eg `issue-936.json issue-943.json issue-637.json`

### Collection Path

The JSON-lines pull request collection destination. It is absent before a fresh fetch creates it; an append receives the existing collection.

### Initiative Prefix

The opening bracket and initiative id matched against task and epic titles. eg `[I07`

### Output Files

The caller-supplied destinations for complete metadata, changed-paths, reviews, protection, rules, check and status snapshots, selected by the operation. eg `pull-request-json-file: epic-pr.json`, `reviews-file: reviews.json`, `changed-paths-file: changed-files.txt`, `check-runs-file: checks.json`, `commit-status-file: status.json`

### Record Selection

The requested supporting records: full metadata, changed paths or reviews.

### Pull Request Record

One complete pull request REST JSON response, including `html_url`, `node_id`, draft state, literal head and base.

### Changed Paths

The saved path list for the requested pull request.

### Reviews

Every page of reviews for the selected pull request.

### Body File

The complete populated body text supplied through a file. eg `body.md`

### Title

The complete selected pull request title. eg `[I07:E00] Purpose`, `[F00] Reject Bad Keys`

### Head Branch

The task branch or epic-base head selected for creation. eg `task-branch: i07/e00/w01-purpose`, `hot-fix-branch: f00-key-validation`, `epic-base: i07/e00/main`

### Base Branch

The task base, epic’s long-lived target or replacement base selected by the operation. eg `target-branch: i07/e00/main`, `base: i07/e00/main`, `long-lived-base: main`

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

The operation and error, discrepancy or missing evidence that prevents a verified result. eg `failed: remove m2ux/workflow-server#950 -> m2ux/workflow-server#637: removeCloseIssueReferences: Resource not accessible by integration`

## Guidance

### Merge Permission

Delivery requires both the user's authorization for the selected target and the harness capability to execute its mutation. A task targets its [epic base](delivery-branches.md#epic-bases); an epic targets that base's long-lived branch; a hot-fix uses task delivery against its declared long-lived target. The allowance for an epic base supplies no permission for another target. A merge into the default branch stays with a person. Another target requiring a person's approving review stays with that reviewer. A target without that requirement can be merged only within the authorization and harness permission actually granted for it. Neither the skill nor a ready result expands those grants or authorizes a protection bypass.

- **Claude Code.**
  User settings (`~/.claude/settings.json`) grant it with an `autoMode.allow` rule and an `autoMode.environment` entry, each array keeping `"$defaults"`; auto mode reads neither from project settings. `claude auto-mode config` prints the rules in effect. eg `{"autoMode": {"environment": ["$defaults", "Source control: github.com/m2ux/workflow-server. Epic bases named iNN/eNN/<branch> carry no review requirement; the default branch requires an approving review"], "allow": ["$defaults", "Merging a task pull request into an epic base iNN/eNN/<branch> of github.com/m2ux/workflow-server is allowed: the work-planner skill's Deliver mode authorizes it and the base requires no review. Merges into the default branch are not covered"]}}`

# Issue

A tracker issue: its identity, saved body, metadata, discussion and closure state. The caller supplies the populated body and the delivery decision.

## Operations

### Read Tracker Issue

The current issue, its saved body and discussion.

#### 1. Select Issue Response

Apply [Fetch Tracker Issue](#fetch-tracker-issue "operation") for the complete JSON, or Apply [Fetch Issue Body](#fetch-issue-body "operation") for its body, using [Identity](#identity "input") in [Repository](#repository "input") and saving it to [Output Files](#output-files "input").

#### 2. Read Requested Discussion

Apply [Fetch Issue Comments](#fetch-issue-comments "operation") when [Discussion Selection](#discussion-selection "input") requires the discussion.

#### 3. Provide Read Tracker Issue

Provide [Issue Record](#issue-record "output") or [Issue Body](#issue-body "output") as requested, with [Discussion](#discussion "output") when selected.

### Save Tracker Issue

One populated body and its metadata, written to the tracker.

#### 1. Take Supplied Changes

Take [Issue Changes](#issue-changes "input") for [Identity](#identity "input") in [Repository](#repository "input"), preserving each field the requester does not change for an existing issue.

#### 2. Check Assigned Labels

Check the assignments against [Label Names](#label-names); provide a missing-label result for any unavailable name.

#### 3. Create New Issue

For a new issue, Apply [Create Tracker Issue](#create-tracker-issue "operation") with the body's file, title and labels.

#### 4. Change Existing Fields

For an existing issue, Apply [Patch Issue Body](#patch-issue-body "operation"), Apply [Retitle Tracker Issue](#retitle-tracker-issue "operation"), Apply [Add Issue Labels](#add-issue-labels "operation") or Apply [Remove Issue Label](#remove-issue-label "operation") for the fields being changed.

#### 5. Publish Required Comment

Apply [Comment on Issue](#comment-on-issue "operation") with [Comment](#comment "input") when the requester requires an answer, using the issue number and supplied text or file.

#### 6. Read Saved Issue

Apply [Fetch Tracker Issue](#fetch-tracker-issue "operation").

#### 7. Compare Saved Fields

Compare the saved fields with the intended body and metadata.

#### 8. Provide Save Tracker Issue

Provide [Issue Record](#issue-record "output") after the saved fields match the intended body and metadata.

### Close Tracker Issue

Verified completion of an issue and its linked delivery.

#### 1. Capture Current Development

- Apply [Capture Issue Development](#capture-issue-development "operation") for the issue in [Identity](#identity "input"), saving its current JSON and Development snapshot to [Output Files](#output-files "input").
- The issue's entire Development field establishes membership, across repositories and states. Titles, branch names, body mentions and a list filtered to one initiative do not. An empty field adds no [pull request](#identity "input") requirement.

#### 2. Check Closure Evidence

Apply [Check Issue Closure](#check-issue-closure "operation") with those two files.

#### 3. Require Completed Delivery

- Require the normal delivery checks in [Delivery Evidence](#delivery-evidence "input") to pass, every criterion to be verified and ticked, and every currently linked pull request to be merged.
- Keep the issue open for an open, draft or closed-without-merge linked pull request, and for links never read.
- Provide an abandoned or incorrect Development link to the caller for the user's decision on its removal. A replacement pull request does not remove the requirement on a link still present.

#### 4. Close Verified Issue

Apply [Close as Completed](#close-as-completed "operation"), which repeats the gate immediately before the write.

#### 5. Provide Closed Tracker Issue

Provide the confirmed [State](#state "output") or [Closure Findings](#closure-findings "output") identifying the closure blocker.

### Close Transferred Work

An issue whose work is tracked by another issue.

#### 1. Confirm Destination Evidence

Confirm [Transfer Evidence](#transfer-evidence "input") establishes that the destination contains the work and cites the source issue in [Identity](#identity "input").

#### 2. Comment With Destination

Apply [Comment on Issue](#comment-on-issue "operation") with the destination reference and [Comment](#comment "input").

#### 3. Close Transferred Issue

Apply [Close as Not Planned](#close-as-not-planned "operation"), retaining the issue's body.

#### 4. Confirm Saved State

Apply [Fetch Tracker Issue](#fetch-tracker-issue "operation") to confirm its state and reason.

#### 5. Provide Closed Transferred Work

Provide the confirmed [State](#state "output") and reason after the saved issue is read back.

### Comment on Issue

The supplied discussion text saved on one issue.

#### 1. Prepare Feedback Reply

When replying to feedback already folded into the body, compose a precise, factual reply addressing each point and mentioning the reviewer, with no thanks or filler. Name what the body now says, by criterion id where one carries it, or the issue that takes the point.

#### 2. Publish Supplied Comment

- Publish [Comment](#comment "input") on [Identity](#identity "input") in [Repository](#repository "input"):
- For a one-line comment, Apply [Post Inline Comment](#post-inline-comment "operation") with the exact text.
- For a longer comment, Apply [Post Comment File](#post-comment-file "operation") with the complete file.

#### 3. Provide Comment URL

Provide the saved [comment](#comment "output") URL.

### Close as Completed

An issue closed after its final evidence check.

#### 1. Capture Fresh Development

Apply [Capture Issue Development](#capture-issue-development "operation") immediately before closure with [Identity](#identity "input"), [Authenticated Access](#authenticated-access "input") and [Closure Evidence Paths](#closure-evidence-paths "input").

#### 2. Run Fresh Closure Gate

Apply [Check Issue Closure](#check-issue-closure "operation") with the issue and Development files it wrote, using absolute evidence paths when changing directory.

#### 3. Require Passing Evidence

Require exit 0 and passing normal checks from [Delivery Evidence](#delivery-evidence "input"); a sync report of closable does not permit skipping this gate.

#### 4. Set Completed State

Immediately after the gate passes, Apply [Set Completed State](#set-completed-state "operation") with the issue's [repository](#repository "input") and number and the passing evidence.

#### 5. Provide Saved State

Provide the saved [State](#state "output") or [Closure Findings](#closure-findings "output") with the failure.

### Capture Issue Development

The issue's current content and its Development pull requests, as GitHub exposes them.

#### 1. Fetch Current Issue

Apply [Fetch Tracker Issue](#fetch-tracker-issue "operation") for [Identity](#identity "input") using [Authenticated Access](#authenticated-access "input"), saving it at [Output Files](#output-files "input"), such as `issue-943.json`.

#### 2. Read Development Links

Apply [Read Issue Development](#read-issue-development "operation") with that file, saving `links-943.json` or the supplied path. An unreadable relation writes no snapshot, which blocks the caller; an empty array means the field was read and is empty.

#### 3. Provide Captured Files

Provide [Issue Record](#issue-record "output") and [Development Snapshot](#development-snapshot "output"), or the unreadable relation.

### Read Issue Development

The Development pull requests of one issue, or of every issue in one repository, keyed by issue number.

#### 1. Capture Supplied Relations

Apply [Capture Issue Links](#capture-issue-links "operation") to [Issue Collection](#issue-collection "input") using [Authenticated Access](#authenticated-access "input"), saving the snapshot at [Output Files](#output-files "input").

#### 2. Provide Complete Relations

Provide [Development Snapshot](#development-snapshot "output") with each issue’s observed pull requests, or stop and provide each unreadable relation the capture names as a blocker.

### Audit Closure Evidence

Each closed issue in one repository whose criteria or Development links do not support its closure, with the reason it was closed.

#### 1. Fetch Selected Closed Issues

- Fetch only the closed issues in [Audit Selection](#audit-selection "input") using [Authenticated Access](#authenticated-access "input"), saving evidence to [Output Files](#output-files "input"):
- For named issues, Apply [Fetch Selected Closed Issues](#fetch-selected-closed-issues "operation") with their numbers.
- For the whole [repository](#repository "input"), Apply [Fetch Closed Issues](#fetch-closed-issues "operation").
- An empty collection means none of the named issues is closed; provide nothing listed.

#### 2. Read Complete Development

Apply [Read Issue Development](#read-issue-development "operation") with that collection; an unreadable relation is provided as a blocker and the sweep does not run.

#### 3. Run Closure Sweep

Apply [Sweep Closure Evidence](#sweep-closure-evidence "operation") with the collection and the issue-links file.

#### 4. Provide Audit Findings

Provide [Closure Findings](#closure-findings "output") with each unsupported issue’s state reason and findings, and each unevaluable issue as missing evidence. List not-planned closures separately for reference. The audit changes no issue.

### Confirm Repository Auto-Close

Whether the repository auto-closes issues whose linked pull requests merge, established for this session.

#### 1. Read Exposed Setting

Read the auto-close setting for [Repository](#repository "input") using [Authenticated Access](#authenticated-access "input") where the API exposes it, and take a read value as the answer.

#### 2. Confirm Unexposed Setting

Where no API field carries it, put the setting to the user and take their explicit answer, meeting [Auto-Close Setting](#auto-close-setting "output").

#### 3. Provide Confirmed Setting

Provide the confirmed value. An unconfirmed setting is a blocker, and an enabled one leaves the caller to obtain authorization before the repository is reconfigured.

### Read Repository Issues

The issue collection used for repository-wide selection.

#### 1. Fetch Repository Issues

Apply [Fetch All Issues](#fetch-all-issues "operation") for [Repository](#repository "input"), saving the complete collection to [Output Files](#output-files "input").

#### 2. Provide Issue Collection

Provide [Issue Collection](#issue-collection "output") with pull requests distinguishable from issues.

### Locate Initiative Issue

The tracker identity matching one initiative prefix.

#### 1. Find Supplied Prefix

Apply [Find Initiative Issue](#find-initiative-issue "operation") with the supplied [Repository](#repository "input") and [Tracker Prefix](#tracker-prefix "input").

#### 2. Provide Resolved Identity

Provide its issue number as [Tracker Number](#tracker-number "output") or an unresolved [Identity](#identity "output").

### Select Tracker Number

The next unused number for one prefixed issue kind in the repository.

#### 1. Read Existing Titles

Apply [List Prefixed Titles](#list-prefixed-titles "operation") for the supplied [Repository](#repository "input") and [Tracker Prefix](#tracker-prefix "input"), covering all issue states.

#### 2. Read Highest Prefix

Read the highest prefix carrying that letter.

#### 3. Confirm Unused Number

Confirm the following number, or `00` when there is no prefix, remains unused before creation.

#### 4. Provide Confirmed Number

Provide the confirmed [Tracker Number](#tracker-number "output").

### Create Tracker Issue

Creates an issue from a body file, with its title and labels, and prints its number.

#### 1. Create Tracker Issue

- Run this command from the [repository](#repository "input") checkout using [Issue Changes](#issue-changes "input"), [Label Names](#label-names "input").

- Repeat `-f 'labels[]=<label>'` for each supplied label.

<big><pre>
gh api --method POST 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues' -f title='[**&lt;title&gt;**](#issue-changes)' -F 'body=@[**&lt;body-file&gt;**](#issue-changes)' -f 'labels&#91;&#93;=[**&lt;label&gt;**](#label-names)' --jq .number
</pre></big>

**Example:**

<big><pre>
gh api --method POST 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues' -f title='[**&lt;title&gt;**](#issue-changes)' -F body=@body.md -f 'labels&#91;&#93;=[**&lt;label&gt;**](#label-names)' --jq .number
</pre></big>

#### 2. Provide Created Tracker Issue

Provide [Identity](#identity "output") to the requester.

### Patch Issue Body

Replaces an issue's body from a file.

#### 1. Patch Issue Body

Run this command from the [repository](#repository "input") checkout using [Identity](#identity "input"), [Issue Changes](#issue-changes "input").

<big><pre>
gh api --method PATCH 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/[**&lt;issue-number&gt;**](#identity)' -F 'body=@[**&lt;body-file&gt;**](#issue-changes)' --jq .number
</pre></big>

**Example:**

<big><pre>
gh api --method PATCH 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/943' -F body=@body.md --jq .number
</pre></big>

#### 2. Provide Patch Issue Body

Provide [Identity](#identity "output"), [Content](#content "output") to the requester.

### Fetch Issue Body

Saves an issue's body alone.

#### 1. Fetch Issue Body

Run this command from the [repository](#repository "input") checkout using [Identity](#identity "input"), [Output Files](#output-files "input").

<big><pre>
gh api 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/[**&lt;issue-number&gt;**](#identity)' --jq .body > '[**&lt;output-body-file&gt;**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/943' --jq .body > live-943.md
</pre></big>

#### 2. Provide Fetched Issue Body

Provide [Issue Body](#issue-body "output") to the requester.

### Retitle Tracker Issue

Replaces an issue's title.

#### 1. Retitle Tracker Issue

Run this command from the [repository](#repository "input") checkout using [Identity](#identity "input"), [Issue Changes](#issue-changes "input").

<big><pre>
gh api --method PATCH 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/[**&lt;issue-number&gt;**](#identity)' -f title='[**&lt;title&gt;**](#issue-changes)' --jq .title
</pre></big>

**Example:**

<big><pre>
gh api --method PATCH 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/943' -f title='[**&lt;title&gt;**](#issue-changes)' --jq .title
</pre></big>

#### 2. Provide Retitled Tracker Issue

Provide [Content](#content "output") to the requester.

### Add Issue Labels

Adds labels to an issue.

#### 1. Add Issue Labels

- Run this command from the [repository](#repository "input") checkout using [Identity](#identity "input"), [Label Names](#label-names "input").

- Repeat `-f 'labels[]=<label>'` for each supplied label.

<big><pre>
gh api --method POST 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/[**&lt;issue-number&gt;**](#identity)/labels' -f 'labels&#91;&#93;=[**&lt;label&gt;**](#label-names)' --jq '.&#91;&#93;.name'
</pre></big>

**Example:**

<big><pre>
gh api --method POST 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/943/labels' -f 'labels&#91;&#93;=[**&lt;label&gt;**](#label-names)' --jq '.&#91;&#93;.name'
</pre></big>

#### 2. Provide Added Issue Labels

Provide [Label Names](#label-names "output") to the requester.

### Remove Issue Label

Removes one label from an issue.

#### 1. Remove Issue Label

Run this command from the [repository](#repository "input") checkout using [Identity](#identity "input"), [Label Names](#label-names "input").

<big><pre>
gh api --method DELETE 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/[**&lt;issue-number&gt;**](#identity)/labels/[**&lt;label&gt;**](#label-names)' --jq '.&#91;&#93;.name'
</pre></big>

**Example:**

<big><pre>
gh api --method DELETE 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/943/labels/[**&lt;label&gt;**](#label-names)' --jq '.&#91;&#93;.name'
</pre></big>

#### 2. Provide Removed Issue Label

Provide [Label Names](#label-names "output") to the requester.

### Fetch Issue Comments

Prints an issue's comments.

#### 1. Fetch Issue Comments

Run this command from the [repository](#repository "input") checkout using [Identity](#identity "input").

<big><pre>
gh api --paginate 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/[**&lt;issue-number&gt;**](#identity)/comments'
</pre></big>

**Example:**

<big><pre>
gh api --paginate 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/874/comments'
</pre></big>

#### 2. Provide Fetched Issue Comments

Provide [Discussion](#discussion "output") to the requester.

### Fetch Tracker Issue

Saves an issue whole, as JSON, for the scripts that read issues.

#### 1. Fetch Tracker Issue

Run this command from the [repository](#repository "input") checkout using [Identity](#identity "input"), [Output Files](#output-files "input"), [Issue Record](#issue-record "input").

<big><pre>
gh api 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/[**&lt;issue-number&gt;**](#identity)' > '[**&lt;issue-json-file&gt;**](#issue-record)'
</pre></big>

**Example:**

<big><pre>
gh api 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/943' > issue-943.json
</pre></big>

#### 2. Provide Fetched Tracker Issue

Provide [Issue Record](#issue-record "output") to the requester.

### Check Issue Closure

Checks the issue's criteria and the state of every pull request its Development field holds.

#### 1. Check Issue Closure

- Run this command from the [workspace](#workspace "input") checkout using [Issue Record](#issue-record "input"), [Development Snapshot](#development-snapshot "input").

- The gate reads only those two files, each a field GitHub exposes.
- An issue the snapshot maps to an empty array adds no pull request requirement. An issue the snapshot holds no entry for, a missing or unreadable snapshot, or a snapshot of another repository's issues blocks as missing evidence.
- Exit 0 means the closure gate passes; normal delivery checks must also pass. Exit 1 reports blockers. The command performs no network calls or writes.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/closure.py --issue '[**&lt;issue-json-file&gt;**](#issue-record)' --development '[**&lt;issue-links-file&gt;**](#development-snapshot)'
</pre></big>

**Example:**

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/closure.py --issue issue-943.json --development links-943.json
</pre></big>

#### 2. Provide Checked Issue Closure

Provide [Closure Findings](#closure-findings "output") to the requester.

### Sweep Closure Evidence

Lists each closed issue whose acceptance criteria are missing or unticked, or whose Development field holds a pull request that has not merged, with the issue's state reason.

#### 1. Sweep Closure Evidence

- Run this command from the [workspace](#workspace "input") checkout using [Issue Collection](#issue-collection "input"), [Development Snapshot](#development-snapshot "input").

- The sweep audits every closed issue in the collection, so the collection sets its scope. Apply [Check Issue Closure](#check-issue-closure "operation") to each issue. Open issues and pull requests in the collection are skipped.
- `--issue-links` takes the issue-links file of the collection's repository alone; any other shape, or another repository's file, is refused as unreadable evidence.
- Each line names the issue, its state reason (`completed`, `not_planned`, or `unknown` when none is recorded) and its findings, under one of three labels:
- `unsupported:` for an issue closed for any reason but `not_planned` whose evidence does not support it.
- `unevaluable:` for a closed issue the file holds no link list for, which is missing evidence rather than an empty link set.
- `not planned:` for an issue closed as `not_planned` whose evidence would not support completion; these follow the findings, listed for reference.
- The last line counts each label. Exit 0 means no issue is unsupported or unevaluable. Exit 1 means at least one is, or the evidence is unreadable. The command performs no network calls or writes.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/closure-sweep.py --issues '[**&lt;issues-json-file&gt;**](#issue-collection)' --issue-links '[**&lt;issue-links-file&gt;**](#development-snapshot)'
</pre></big>

**Example:**

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/closure-sweep.py --issues closed-issues.json --issue-links issue-links.json
</pre></big>

**Example output:**

```text
unsupported: owner/repo#943 closed as completed: acceptance criteria are missing or unticked; owner/repo#980 not merged (closed) - Work Title
unevaluable: owner/repo#944 closed as completed: Development links not captured - Other Title
not planned: owner/repo#945 closed as not_planned: acceptance criteria are missing or unticked - Moved Title
1 unsupported, 1 unevaluable, 1 not planned
```

#### 2. Provide Sweep Closure Evidence

Provide [Closure Findings](#closure-findings "output") to the requester.

### Close as Not Planned

Closes an issue whose work another issue tracks.

#### 1. Close as Not Planned

Run this command from the [repository](#repository "input") checkout using [Identity](#identity "input"), [Transfer Evidence](#transfer-evidence "input").

<big><pre>
gh api --method PATCH 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/[**&lt;issue-number&gt;**](#identity)' -f state=closed -f state_reason=not_planned --jq .state
</pre></big>

**Example:**

<big><pre>
gh api --method PATCH 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/874' -f state=closed -f state_reason=not_planned --jq .state
</pre></big>

#### 2. Provide Closed as Not Planned

Provide [State](#state "output") to the requester.

### Post Inline Comment

Posts one line of exact comment text and returns its URL.

#### 1. Post Inline Comment

Run this command from the [repository](#repository "input") checkout using [Identity](#identity "input"), [Comment](#comment "input").

<big><pre>
gh api --method POST 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/[**&lt;issue-number&gt;**](#identity)/comments' -f body='[**&lt;comment-text&gt;**](#comment)' --jq .html_url
</pre></big>

**Example:**

<big><pre>
gh api --method POST 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/637/comments' -f body='Delivered by #950.' --jq .html_url
</pre></big>

#### 2. Provide Post Inline Comment

Provide [Comment](#comment "output") to the requester.

### Post Comment File

Posts a complete comment file and returns its URL.

#### 1. Post Comment File

Run this command from the [repository](#repository "input") checkout using [Identity](#identity "input"), [Comment](#comment "input").

<big><pre>
gh api --method POST 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/[**&lt;issue-number&gt;**](#identity)/comments' -F 'body=@[**&lt;comment-file&gt;**](#comment)' --jq .html_url
</pre></big>

**Example:**

<big><pre>
gh api --method POST 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/874/comments' -F body=@comment-874.md --jq .html_url
</pre></big>

#### 2. Provide Post Comment File

Provide [Comment](#comment "output") to the requester.

### Set Completed State

Sets an issue to closed with the completed reason and returns its state.

#### 1. Set Completed State

Run this command from the [repository](#repository "input") checkout using [Identity](#identity "input"), [Delivery Evidence](#delivery-evidence "input"), [Closure Findings](#closure-findings "input").

<big><pre>
gh api --method PATCH 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/[**&lt;issue-number&gt;**](#identity)' -f state=closed -f state_reason=completed --jq .state
</pre></big>

**Example:**

<big><pre>
gh api --method PATCH 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues/943' -f state=closed -f state_reason=completed --jq .state
</pre></big>

#### 2. Provide Saved Completed State

Provide [State](#state "output") to the requester.

### Capture Issue Links

Writes each issue's Development pull requests, read from the issue end of the relation, keyed by issue number.

#### 1. Capture Issue Links

- Run this command from the repository checkout using [Issue Collection](#issue-collection "input"), [Authenticated Access](#authenticated-access "input"), [Output Files](#output-files "input"), [Workspace](#workspace "input"), [Development Snapshot](#development-snapshot "input").

**REST gap:** REST exposes no read of the pull requests an issue's Development field holds.

- The snapshot names the repository its issues belong to. Each issue maps to every pull request its Development field holds, open, closed and merged, as repository, number and state, or to an empty array. Pull requests in the collection are skipped.
- Each batch of issues costs one `gh api graphql` call from a generated query file, so the command runs outside `sbx`, where `gh` reaches the tracker.
- A relation is unreadable when any page of it does not arrive whole: the tracker returns no node for its subject, names the subject in an error, or reports a further page it does not supply.
- Exit 0 means every relation was read. Exit 1 names each unreadable relation with the tracker's reason and writes nothing; the caller treats it as a blocker.
- A call the tracker refuses outright, such as a rejected credential, exits 1 with `GraphQL read failed:` and what `gh` reported, and writes nothing.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && python3 skills/work-planner/scripts/links-by-issue.py --issues '[**&lt;issues-json-file&gt;**](#issue-collection)' --out '[**&lt;issue-links-file&gt;**](#development-snapshot)'
</pre></big>

**Example:**

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && python3 skills/work-planner/scripts/links-by-issue.py --issues issue-943.json --out links-943.json
</pre></big>

**Example payload:**

```json
{
  "943": [{"repo": "owner/repo", "number": 980, "state": "MERGED"}]
}
```

#### 2. Provide Capture Issue Links

Provide [Development Snapshot](#development-snapshot "output") to the requester.

### Fetch All Issues

Saves every issue in the repository; the scripts skip the pull requests among them.

#### 1. Fetch All Issues

Run this command from the [repository](#repository "input") checkout using [Output Files](#output-files "input"), [Issue Collection](#issue-collection "input").

<big><pre>
gh api --paginate "repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues?state=all&per_page=100" > '[**&lt;issues-json-file&gt;**](#issue-collection)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues?state=all&per_page=100" > issues.json
</pre></big>

#### 2. Provide Fetched All Issues

Provide [Issue Collection](#issue-collection "output") to the requester.

### Fetch Closed Issues

Saves every closed issue in the repository; the scripts skip the pull requests among them.

#### 1. Fetch Closed Issues

Run this command from the [repository](#repository "input") checkout using [Output Files](#output-files "input"), [Issue Collection](#issue-collection "input").

<big><pre>
gh api --paginate "repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues?state=closed&per_page=100" > '[**&lt;issues-json-file&gt;**](#issue-collection)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues?state=closed&per_page=100" > closed-issues.json
</pre></big>

#### 2. Provide Fetched Closed Issues

Provide [Issue Collection](#issue-collection "output") to the requester.

### Fetch Selected Closed Issues

Saves the named issues that are closed, one per line; an issue that is open or absent is left out.

#### 1. Fetch Named Closed Records

Run this command from the [repository](#repository "input") checkout using [Audit Selection](#audit-selection "input"), [Output Files](#output-files "input"), [Issue Collection](#issue-collection "input").

<big><pre>
gh api --paginate "repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues?state=closed&per_page=100" --jq '.&#91;&#93; | select(&#91;.number&#93; | inside(&#91;[**&lt;issue-numbers&gt;**](#audit-selection)&#93;))' > '[**&lt;issues-json-file&gt;**](#issue-collection)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues?state=closed&per_page=100" --jq '.&#91;&#93; | select(&#91;.number&#93; | inside(&#91;637, 943, 946&#93;))' > closed-issues.json
</pre></big>

#### 2. Provide Fetched Selected Closed Issues

Provide [Issue Collection](#issue-collection "output") to the requester.

### Find Initiative Issue

Prints an initiative's issue number, found by its title's prefix.

#### 1. Find Initiative Issue

- Run this command from the [repository](#repository "input") checkout using [Tracker Prefix](#tracker-prefix "input").

- `<initiative-prefix>` includes the initiative id and its enclosing brackets.

<big><pre>
gh api --paginate "repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues?state=all&per_page=100" --jq '.&#91;&#93; | select(.pull_request == null) | select(.title | startswith("[**&lt;initiative-prefix&gt;**](#tracker-prefix)")) | .number'
</pre></big>

**Example:**

<big><pre>
gh api --paginate "repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/issues?state=all&per_page=100" --jq '.&#91;&#93; | select(.pull_request == null) | select(.title | startswith("&#91;I08&#93;")) | .number'
</pre></big>

#### 2. Provide Located Initiative Issue

Provide [Identity](#identity "output"), [Tracker Number](#tracker-number "output") to the requester.

### List Prefixed Titles

Lists titles carrying one kind's prefix letter, across all states.

#### 1. List Prefixed Titles

Run this command from the [repository](#repository "input") checkout using [Tracker Prefix](#tracker-prefix "input").

<big><pre>
gh api --paginate 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repository&gt;**](#repository)/issues?state=all&per_page=100' --jq '.&#91;&#93; | select(.title | test("^\\&#91;[**&lt;prefix-letter&gt;**](#tracker-prefix)&#91;0-9&#93;{2}\\&#93;")) | .title'
</pre></big>

**Example:** Initiatives in one repository.

<big><pre>
gh api --paginate 'repos/m2ux/workflow-server/issues?state=all&per_page=100' --jq '.&#91;&#93; | select(.title | test("^\\&#91;I&#91;0-9&#93;{2}\\&#93;")) | .title'
</pre></big>

#### 2. Provide Listed Prefixed Titles

Provide [Tracker Prefix](#tracker-prefix "output") to the requester.

## Fields

### Identity

The issue has its repository, number and URL. A new issue has its repository before creation supplies its number and URL.

### Content

The saved title, body and labels equal the supplied values.

### Discussion

The issue's comments, in saved order. A saved comment preserves the supplied text.

### State

The issue is open or closed with its recorded completion reason. Completed work satisfies its criteria and delivery checks; transferred work identifies the issue tracking it.

### Auto-Close Setting

GitHub's **Auto-close issues with merged linked pull requests** repository setting, which must be disabled before a delivery pull request is linked or merged, so that closure follows the criteria rather than the merge.

- The setting is confirmed per repository and holds for the session; it is not inferred from an issue that stayed open.
- No REST field and no GraphQL field of `gh` 2.46 carries it, so on such a host the user's explicit answer is the only source.
- An enabled or unconfirmed setting blocks delivery links and merges until the setting is confirmed disabled. Changing the setting requires the user's explicit authorization.
- The setting gates the links and merges that precede closure; the closure gate takes no input from it.

### Repository

The tracker repository owner and name. Commands use these supplied values as owner and repo, or repository.

### Issue Record

The complete current tracker issue JSON at the supplied local path, carrying its [Identity](#identity), [Content](#content) and [State](#state).

### Output Files

The supplied local destinations for the requested issue, body, discussion, collection or Development evidence.

### Closure Evidence Paths

The absolute local destinations for the current issue JSON and complete Development snapshot.

### Discussion Selection

Whether the supplied request needs the issue discussion.

### Issue Changes

The supplied complete body file, title and labels for creation, or the selected body and metadata changes for an existing issue, with an optional comment file.

### Label Names

The supplied repository label names for creation, addition or removal. An assignment names an existing repository label.

### Comment

The supplied exact comment text, as one line or a complete local file, with the reviewer identity and addressed feedback for a reply. A posted comment also has its saved URL.

### Delivery Evidence

The normal delivery result supplied by the caller, with its check results, criterion evidence and linked delivery records.

### Transfer Evidence

The supplied destination issue record, its destination reference and accompanying comment file.

### Authenticated Access

Authenticated access to the repository and its issue Development relations.

### Development Snapshot

A complete issue-links file, keyed by issue number and carrying its repository identity. Each issue maps to all Development pull requests across repositories and states, or an empty array after a complete empty read.

### Issue Collection

One supplied tracker issue JSON or a collection of issue records. Pull request entries carry a pull_request field.

### Audit Selection

The supplied issue numbers to audit, separated by commas, or the selection of every closed issue in the repository.

### Closure Findings

The closure gate verdict or the sweep results, retaining each issue identity, state reason and finding, with execution failures identified.

### Tracker Prefix

The supplied kind prefix letter, initiative prefix or existing prefixed titles. An initiative prefix includes the initiative id and its enclosing brackets.

### Tracker Number

The resolved two-digit tracker number, or an unresolved identity when lookup fails.

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.

### Issue Body

The current issue body as text, saved at the supplied local Markdown path when requested without the surrounding issue record.

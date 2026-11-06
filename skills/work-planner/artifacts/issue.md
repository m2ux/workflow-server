# Issue

A tracker issue: its identity, saved body, metadata, discussion and closure state. The caller supplies the populated body and the delivery decision.

## Operations

### Read Tracker Issue

The current issue, its saved body and discussion.

#### 1. Select Issue Response

Run [Fetch Tracker Issue](#fetch-tracker-issue "ƒ") for the complete JSON, or Run [Fetch Issue Body](#fetch-issue-body "ƒ") for its body.

#### 2. Read Requested Discussion

Run [Fetch Issue Comments](#fetch-issue-comments "ƒ") when [Discussion Selection](#discussion-selection) requires the discussion.

#### 3. Provide Read Tracker Issue

Provide [Issue Record](#issue-record) or [Issue Body](#issue-body) as requested, with [Discussion](#discussion) when selected.

### Save Tracker Issue

One populated body and its metadata, written to the tracker.

#### 1. Take Supplied Changes

Take [Issue Changes](#issue-changes) for [Identity](#identity) in [Repository](#repository), preserving each field the requester does not change for an existing issue.

#### 2. Check Assigned Labels

Check the assignments against [Label Names](#label-names); provide a missing-label result for any unavailable name.

#### 3. Create New Issue

For a new issue, Run [Create Tracker Issue](#create-tracker-issue "ƒ") with the body's file, title and labels.

#### 4. Change Existing Fields

For an existing issue, Run [Patch Issue Body](#patch-issue-body "ƒ"), Run [Retitle Tracker Issue](#retitle-tracker-issue "ƒ"), Run [Add Issue Labels](#add-issue-labels "ƒ") or Run [Remove Issue Label](#remove-issue-label "ƒ") for the fields being changed.

#### 5. Publish Required Comment

Apply [Comment on Issue](#comment-on-issue "ƒ") with [Comment](#comment) when the requester requires an answer, using the issue number and supplied text or file.

#### 6. Read Saved Issue

Run [Fetch Tracker Issue](#fetch-tracker-issue "ƒ").

#### 7. Compare Saved Fields

Compare the saved fields with the intended body and metadata.

#### 8. Provide Save Tracker Issue

Provide [Issue Record](#issue-record) after the saved fields match the intended body and metadata.

### Comment on Issue

The supplied discussion text saved on one issue.

#### 1. Prepare Feedback Reply

When replying to feedback already folded into the body, compose a precise, factual reply addressing each point and mentioning the reviewer, with no thanks or filler. Name what the body now says, by criterion id where one carries it, or the issue that takes the point.

#### 2. Publish Supplied Comment

- Publish [Comment](#comment) on [Identity](#identity) in [Repository](#repository):
- For a one-line comment, Run [Post Inline Comment](#post-inline-comment "ƒ") with the exact text.
- For a longer comment, Run [Post Comment File](#post-comment-file "ƒ") with the complete file.

#### 3. Provide Comment URL

Provide the saved [comment](#comment) URL.

### Capture Issue Development

The issue's current content and its Development pull requests, as GitHub exposes them.

#### 1. Fetch Current Issue

Run [Fetch Tracker Issue](#fetch-tracker-issue "ƒ") for the selected issue.

#### 2. Read Development Links

Run [Capture Issue Links](#capture-issue-links "ƒ") with that file, saving `links-943.json` or the supplied path. An unreadable relation writes no snapshot, which blocks the caller; an empty array means the field was read and is empty.

#### 3. Provide Captured Files

Provide [Issue Record](#issue-record) and [Development Snapshot](#development-snapshot), or the unreadable relation.

### Confirm Repository Auto-Close

Whether the repository auto-closes issues whose linked pull requests merge, established for this session.

#### 1. Read Exposed Setting

Read the auto-close setting for [Repository](#repository) using [Authenticated Access](#authenticated-access) where the API exposes it, and take a read value as the answer.

#### 2. Confirm Unexposed Setting

Where no API field carries it, put the setting to the user and take their explicit answer, meeting [Auto-Close Setting](#auto-close-setting).

#### 3. Provide Confirmed Setting

- Provide the confirmed value. An unconfirmed setting is a blocker, and an enabled one leaves the caller to obtain authorization before the repository is reconfigured.

- GitHub's **Auto-close issues with merged linked pull requests** repository setting, which must be disabled before a delivery pull request is linked or merged, so that closure follows the criteria rather than the merge.

- The setting is confirmed per repository and holds for the session; it is not inferred from an issue that stayed open.
- No REST field and no GraphQL field of `gh` 2.46 carries it, so on such a host the user's explicit answer is the only source.
- An enabled or unconfirmed setting blocks delivery links and merges until the setting is confirmed disabled. Changing the setting requires the user's explicit authorization.
- The setting gates the links and merges that precede closure; the closure gate takes no input from it.

### Select Tracker Number

The next unused number for one prefixed issue kind in the repository.

#### 1. Read Existing Titles

Run [List Prefixed Titles](#list-prefixed-titles "ƒ") for the supplied [Repository](#repository) and [Tracker Prefix](#tracker-prefix), covering all issue states.

#### 2. Read Highest Prefix

Read the highest prefix carrying that letter.

#### 3. Confirm Unused Number

Confirm the following number, or `00` when there is no prefix, remains unused before creation.

#### 4. Provide Confirmed Number

Provide the confirmed [Tracker Number](#tracker-number).

## Commands

### Create Tracker Issue

Create an issue from a body file with its title and labels, print its number, and provide [Identity](#identity "●") to the requester.

<big><pre>
gh api &#92;
  --method POST repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues &#92;
  -f title='[**&lt;title&gt;**](#issue-changes "○")' &#92;
  -F 'body=@[**&lt;body-file&gt;**](#issue-changes "○")' &#92;
  -f 'labels&#91;&#93;=[**&lt;label&gt;**](#label-names "○")' &#92;
  --jq .number
</pre></big>

- Run in the repository checkout.

- Repeat `-f 'labels[]=<label>'` for each supplied label.

### Patch Issue Body

Replace an issue's body from a file and provide [Identity](#identity "●") and [Content](#content "●") to the requester.

Run in the repository checkout.

<big><pre>
gh api --method PATCH repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues/[**&lt;issue-number&gt;**](#identity "○") -F 'body=@[**&lt;body-file&gt;**](#issue-changes "○")' --jq .number
</pre></big>

### Fetch Issue Body

Save an issue's body alone and provide [Issue Body](#issue-body "●") to the requester.

Run in the repository checkout.

<big><pre>
gh api repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues/[**&lt;issue-number&gt;**](#identity "○") --jq .body &gt; '[**&lt;output-body-file&gt;**](#output-files "○")'
</pre></big>

### Retitle Tracker Issue

Replace an issue's title and provide [Content](#content "●") to the requester.

Run in the repository checkout.

<big><pre>
gh api --method PATCH repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues/[**&lt;issue-number&gt;**](#identity "○") -f title='[**&lt;title&gt;**](#issue-changes "○")' --jq .title
</pre></big>

### Add Issue Labels

Add labels to an issue and provide [Label Names](#label-names "●") to the requester.

<big><pre>
gh api --method POST repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues/[**&lt;issue-number&gt;**](#identity "○")/labels -f 'labels&#91;&#93;=[**&lt;label&gt;**](#label-names "○")' --jq '.&#91;&#93;.name'
</pre></big>

- Run in the repository checkout.

- Repeat `-f 'labels[]=<label>'` for each supplied label.

### Remove Issue Label

Remove one label from an issue and provide [Label Names](#label-names "●") to the requester.

Run in the repository checkout.

<big><pre>
gh api --method DELETE 'repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues/[**&lt;issue-number&gt;**](#identity "○")/labels/[**&lt;label&gt;**](#label-names "○")' --jq '.&#91;&#93;.name'
</pre></big>

### Fetch Issue Comments

Print an issue's comments and provide [Discussion](#discussion "●") to the requester.

Run in the repository checkout.

<big><pre>
gh api --paginate repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues/[**&lt;issue-number&gt;**](#identity "○")/comments
</pre></big>

### Fetch Tracker Issue

Save one complete issue as JSON for the issue-reading scripts and provide [Issue Record](#issue-record "●") to the requester.

<big><pre>
gh api repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues/[**&lt;issue-number&gt;**](#identity "○") &gt; '[**&lt;issue-json-file&gt;**](#issue-record "○")'
</pre></big>

- Run in the repository checkout.
- Use [Output Files](#output-files "○") to select the destination.

### Check Issue Closure

Check the issue's criteria and the state of every pull request its Development field holds and provide [Closure Findings](#closure-findings "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/closure.py &#92;
  --issue '[**&lt;issue-json-file&gt;**](#issue-record "○")' &#92;
  --development '[**&lt;issue-links-file&gt;**](#development-snapshot "○")'
</pre></big>

- The gate reads only those two files, each a field GitHub exposes.
- An issue the snapshot maps to an empty array adds no pull request requirement. An issue the snapshot holds no entry for, a missing or unreadable snapshot, or a snapshot of another repository's issues blocks as missing evidence.
- Exit 0 means the closure gate passes; normal delivery checks must also pass. Exit 1 reports blockers. The command performs no network calls or writes.

### Sweep Closure Evidence

List each closed issue with missing or unticked acceptance criteria or an unmerged Development pull request, include its state reason, and provide [Closure Findings](#closure-findings "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/closure-sweep.py &#92;
  --issues '[**&lt;issues-json-file&gt;**](#issue-collection "○")' &#92;
  --issue-links '[**&lt;issue-links-file&gt;**](#development-snapshot "○")'
</pre></big>

- The sweep audits every closed issue in the collection, so the collection sets its scope. Run [Check Issue Closure](#check-issue-closure "ƒ") to each issue. Open issues and pull requests in the collection are skipped.
- `--issue-links` takes the issue-links file of the collection's repository alone; any other shape, or another repository's file, is refused as unreadable evidence.
- Each line names the issue, its state reason (`completed`, `not_planned`, or `unknown` when none is recorded) and its findings, under one of three labels:
- `unsupported:` for an issue closed for any reason but `not_planned` whose evidence does not support it.
- `unevaluable:` for a closed issue the file holds no link list for, which is missing evidence rather than an empty link set.
- `not planned:` for an issue closed as `not_planned` whose evidence would not support completion; these follow the findings, listed for reference.
- The last line counts each label. Exit 0 means no issue is unsupported or unevaluable. Exit 1 means at least one is, or the evidence is unreadable. The command performs no network calls or writes.

### Close as Not Planned

Close an issue whose work another issue tracks and provide [State](#state "●") to the requester.

<big><pre>
gh api &#92;
  --method PATCH repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues/[**&lt;issue-number&gt;**](#identity "○") &#92;
  -f state=closed &#92;
  -f state_reason=not_planned &#92;
  --jq .state
</pre></big>

- Run in the repository checkout.
- Base the transfer pointer on [Transfer Evidence](#transfer-evidence "○").

### Post Inline Comment

Post one line of exact comment text, capture its URL, and provide [Comment](#comment "●") to the requester.

Run in the repository checkout.

<big><pre>
gh api &#92;
  --method POST repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues/[**&lt;issue-number&gt;**](#identity "○")/comments &#92;
  -f body='[**&lt;comment-text&gt;**](#comment "○")' &#92;
  --jq .html_url
</pre></big>

### Post Comment File

Post a complete comment file, capture its URL, and provide [Comment](#comment "●") to the requester.

Run in the repository checkout.

<big><pre>
gh api &#92;
  --method POST repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues/[**&lt;issue-number&gt;**](#identity "○")/comments &#92;
  -F 'body=@[**&lt;comment-file&gt;**](#comment "○")' &#92;
  --jq .html_url
</pre></big>

### Set Completed State

Close an issue with the completed reason, read its state, and provide [State](#state "●") to the requester.

<big><pre>
gh api &#92;
  --method PATCH repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues/[**&lt;issue-number&gt;**](#identity "○") &#92;
  -f state=closed &#92;
  -f state_reason=completed &#92;
  --jq .state
</pre></big>

- Run in the repository checkout.
- Require [Closure Findings](#closure-findings "○"), [Delivery Evidence](#delivery-evidence "○") before executing the command.

### Capture Issue Links

Write each issue's Development pull requests from the issue end of the relation, keyed by issue number, and provide [Development Snapshot](#development-snapshot "●") to the requester.

**REST gap:** REST exposes no read of the pull requests an issue's Development field holds.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  python3 skills/work-planner/scripts/links-by-issue.py &#92;
  --issues '[**&lt;issues-json-file&gt;**](#issue-collection "○")' &#92;
  --out '[**&lt;issue-links-file&gt;**](#development-snapshot "○")'
</pre></big>

- Run in the repository checkout.
- Require [Authenticated Access](#authenticated-access "○") before executing the command.
- Use [Output Files](#output-files "○") to select the destination.


- The snapshot names the repository its issues belong to. Each issue maps to every pull request its Development field holds, open, closed and merged, as repository, number and state, or to an empty array. Pull requests in the collection are skipped.
- Each batch of issues costs one `gh api graphql` call from a generated query file, so the command runs outside `sbx`, where `gh` reaches the tracker.
- A relation is unreadable when any page of it does not arrive whole: the tracker returns no node for its subject, names the subject in an error, or reports a further page it does not supply.
- Exit 0 means every relation was read. Exit 1 names each unreadable relation with the tracker's reason and writes nothing; the caller treats it as a blocker.
- A call the tracker refuses outright, such as a rejected credential, exits 1 with `GraphQL read failed:` and what `gh` reported, and writes nothing.

### Fetch All Issues

Save every issue in the repository and provide [Issue Collection](#issue-collection "●") to the requester. The scripts skip any pull requests among them.

<big><pre>
gh api --paginate "repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues?state=all&per_page=100" &gt; '[**&lt;issues-json-file&gt;**](#issue-collection "○")'
</pre></big>

- Run in the repository checkout.
- Use [Output Files](#output-files "○") to select the destination.

### Fetch Closed Issues

Save every closed issue in the repository and provide [Issue Collection](#issue-collection "●") to the requester. The scripts skip any pull requests among them.

<big><pre>
gh api --paginate "repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues?state=closed&per_page=100" &gt; '[**&lt;issues-json-file&gt;**](#issue-collection "○")'
</pre></big>

- Run in the repository checkout.
- Use [Output Files](#output-files "○") to select the destination.

### Fetch Selected Closed Issues

Save the named closed issues with one issue per line and provide [Issue Collection](#issue-collection "●") to the requester. Leave out any issue that is open or absent.

<big><pre>
gh api &#92;
  --paginate "repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues?state=closed&per_page=100" &#92;
  --jq '.&#91;&#93; | select(&#91;.number&#93; | inside(&#91;[**&lt;issue-numbers&gt;**](#audit-selection "○")&#93;))' &#92;
  &gt; '[**&lt;issues-json-file&gt;**](#issue-collection "○")'
</pre></big>

- Run in the repository checkout.
- Use [Output Files](#output-files "○") to select the destination.

### Find Initiative Issue

Find an initiative by its title prefix, print its issue number, and provide [Identity](#identity "●") and [Tracker Number](#tracker-number "●") to the requester.

<big><pre>
gh api &#92;
  --paginate "repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/issues?state=all&per_page=100" &#92;
  --jq '.&#91;&#93; | select(.pull_request == null) | select(.title | startswith("[**&lt;initiative-prefix&gt;**](#tracker-prefix "○")")) | .number'
</pre></big>

- Run in the repository checkout.

- `<initiative-prefix>` includes the initiative id and its enclosing brackets.

### List Prefixed Titles

List titles carrying one kind's prefix letter in all states and provide [Tracker Prefix](#tracker-prefix "●") to the requester.

Run in the repository checkout.

<big><pre>
gh api &#92;
  --paginate 'repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repository&gt;**](#repository "○")/issues?state=all&per_page=100' &#92;
  --jq '.&#91;&#93; | select(.title | test("^\\&#91;[**&lt;prefix-letter&gt;**](#tracker-prefix "○")&#91;0-9&#93;{2}\\&#93;")) | .title'
</pre></big>

## Fields

### Identity

The issue has its repository, number and URL. A new issue has its repository before creation supplies its number and URL. eg `943`

### Content

The saved title, body and labels equal the supplied values.

### Discussion

The issue's comments, in saved order. A saved comment preserves the supplied text.

### State

The issue is open or closed with its recorded completion reason. Completed work satisfies its criteria and delivery checks; transferred work identifies the issue tracking it.

### Auto-Close Setting

The repository's boolean **Auto-close issues with merged linked pull requests** setting, recorded as enabled or disabled with its repository identity and session confirmation evidence; an unknown value is unconfirmed. [Confirm Repository Auto-Close](#confirm-repository-auto-close "ƒ") establishes the value and the delivery gate.

### Repository

The tracker repository owner and name. Commands use these supplied values as owner and repo, or repository. eg `m2ux/workflow-server`

### Issue Record

The complete current tracker issue JSON at the supplied local path, carrying its [Identity](#identity), [Content](#content) and [State](#state). eg `issue-943.json`

### Output Files

The supplied local destinations for the requested issue, body, discussion, collection or Development evidence. eg `live-943.md`

### Closure Evidence Paths

The absolute local destinations for the current issue JSON and complete Development snapshot.

### Discussion Selection

Whether the supplied request needs the issue discussion.

### Issue Changes

The supplied complete body file, title and labels for creation, or the selected body and metadata changes for an existing issue, with an optional comment file. eg `body.md`

### Label Names

The supplied repository label names for creation, addition or removal. An assignment names an existing repository label.

### Comment

The supplied exact comment text, as one line or a complete local file, with the reviewer identity and addressed feedback for a reply. A posted comment also has its saved URL. eg `comment-text: Delivered by #950.`, `comment-file: comment-874.md`

### Delivery Evidence

The normal delivery result supplied by the caller, with its check results, criterion evidence and linked delivery records.

### Transfer Evidence

The supplied destination issue record, its destination reference and accompanying comment file.

### Authenticated Access

Authenticated access to the repository and its issue Development relations.

### Development Snapshot

A complete issue-links file with a `repository` identity and an `issues` object keyed by issue number. Each issue maps to all Development pull requests across repositories and states, or an empty array after a complete empty read. eg `links-943.json`, `{"repository": "owner/repo", "issues": {"943": [{"repo": "owner/repo", "number": 980, "state": "MERGED"}]}}`

### Issue Collection

One supplied tracker issue JSON or a collection of issue records. Pull request entries carry a pull_request field. eg `closed-issues.json`

### Audit Selection

The supplied issue numbers to audit, separated by commas, or the selection of every closed issue in the repository. eg `637, 943, 946`

### Closure Findings

The closure gate verdict or the sweep results, retaining each issue identity, state reason and finding, with execution failures identified. eg `unsupported: owner/repo#943 closed as completed: acceptance criteria are missing or unticked; owner/repo#980 not merged (closed) - Work Title`, `unevaluable: owner/repo#944 closed as completed: Development links not captured - Other Title`, `not planned: owner/repo#945 closed as not_planned: acceptance criteria are missing or unticked - Moved Title`, `1 unsupported, 1 unevaluable, 1 not planned`

### Tracker Prefix

The supplied kind prefix letter, initiative prefix or existing prefixed titles. An initiative prefix includes the initiative id and its enclosing brackets. eg `initiative-prefix: [I08]`, `prefix-letter: I`

### Tracker Number

The resolved two-digit tracker number, or an unresolved identity when lookup fails.

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.

### Issue Body

The current issue body as text, saved at the supplied local Markdown path when requested without the surrounding issue record.

# Issue

A tracker issue: its identity, saved body, metadata, discussion and closure state. The caller supplies the populated body and the delivery decision.

## Operations

### *Read* Tracker Issue

The current issue, its saved body and discussion.

**Inputs:** Repository, issue number and output files; whether discussion is needed.

1. Run [Fetch Tracker Issue](#fetch-tracker-issue) for the complete JSON, or [Fetch Issue Body](#fetch-issue-body) for its body, with the issue number and destination file.
2. Run [Fetch Issue Comments](#fetch-issue-comments) when the request depends on the discussion.

### *Save* Tracker Issue

One populated body and its metadata, written to the tracker.

**Inputs:** Repository, optional existing issue number, populated body file, title and existing labels for creation; selected body or metadata changes for an existing issue. Optional comment file.

1. Take the supplied body and metadata, preserving each field the caller does not change for an existing issue.
2. Return a missing-label result when an assignment names a label the repository does not contain.
3. For a new issue, run [Create Tracker Issue](#create-tracker-issue) with the body's file, title and labels.
4. For an existing issue, run [Patch Issue Body](#patch-issue-body), [Retitle Tracker Issue](#retitle-tracker-issue), [Add Issue Labels](#add-issue-labels) or [Remove Issue Label](#remove-issue-label) for the fields being changed.
5. Run [Comment on Issue](#comment-on-issue) for an answer or a preserved body the caller requires, with the issue number and comment file.
6. Re-read with [Fetch Tracker Issue](#fetch-tracker-issue).
7. Compare the saved fields with the intended body and metadata.

### *Close* Tracker Issue

Verified completion of an issue and its linked delivery.

**Inputs:** Issue identity, successful normal delivery result, current issue JSON, complete Development snapshot, confirmed repository setting and fresh linked pull request records.

1. Run [Capture Issue Development](#capture-issue-development) for the issue's complete links and confirmed repository setting.
2. Take the caller's fresh records for every linked pull request, across repositories and states; return missing evidence to the caller.
   - Confirm GitHub's **Auto-close issues with merged linked pull requests** setting is disabled before any delivery pull request is linked or merged. An enabled or unknown setting blocks those actions until configuration is confirmed. Changing repository settings requires explicit authorization.
   - Use the issue's entire Development field to establish membership. Titles, branch names, body mentions and a list filtered to one initiative do not establish completeness. An explicitly empty field adds no pull request requirement.
3. Run [Check Issue Closure](#check-issue-closure) with `--issue`, `--development`, and `--prs` for those fresh records.
4. Require normal delivery checks to pass, every criterion to be verified and ticked, and every currently linked pull request to be merged.
   - Keep the issue open for an open, draft, closed without merge, or unreadable linked pull request.
   - Return an abandoned or incorrect Development link to the caller for the user's decision on its removal. A replacement pull request does not remove the requirement on a link still present.
5. Run [Close as Completed](#close-as-completed), which repeats the gate immediately before the write. A changed link set requires another capture and check.

### *Close* Transferred Work

An issue whose work is tracked by another issue.

**Inputs:** Issue identity, confirmed destination evidence and comment file.

1. Confirm the supplied destination contains the work and cites its source issue.
2. Run [Comment on Issue](#comment-on-issue) with the destination reference and supplied comment file.
3. Run [Close as Not Planned](#close-as-not-planned), retaining the issue's body.
4. Re-read it with [Fetch Tracker Issue](#fetch-tracker-issue) to confirm its state and reason.

### *Comment* on Issue

The supplied discussion text saved on one issue.

**Inputs:** Repository, issue number and exact comment text or file; reviewer identity and addressed feedback when replying to a review.

1. When replying to feedback already folded into the body, compose a precise, factual reply addressing each point and mentioning the reviewer, with no thanks or filler. Name what the body now says, by criterion id where one carries it, or the issue that takes the point.
2. Publish the supplied comment:
   - For a one-line comment, run [Post Inline Comment](#post-inline-comment) with the exact text.
   - For a longer comment, run [Post Comment File](#post-comment-file) with the complete file.
3. Return the saved comment URL.

### *Close* as Completed

An issue closed after its final evidence check.

**Inputs:** Repository, issue number, authenticated access, confirmed repository auto-closing setting, passing normal delivery checks and absolute paths to the current issue, Development and linked pull request evidence.

1. Run [Capture Issue Development](#capture-issue-development) immediately before closure with the issue identity, authenticated access, confirmed repository setting and evidence paths.
2. Compare its links with the supplied fresh pull request records; return a changed link set or missing evidence to the caller for refresh.
3. Run [Check Issue Closure](#check-issue-closure) with the current issue, Development and linked pull request files, using absolute evidence paths when changing directory.
4. Require exit 0 and passing normal delivery checks; a sync report of closable does not permit skipping this gate.
5. Immediately after the gate passes, run [Set Completed State](#set-completed-state) with the issue's repository and number and the passing evidence.
6. Return the saved state or failure.

### *Capture* Issue Development

The issue's current content and complete Development snapshot.

**Inputs:** Issue identity, authenticated access, observed repository auto-closing setting and issue and Development output paths.

1. Run [Fetch Tracker Issue](#fetch-tracker-issue) into `issue-943.json` or the supplied path.
2. Run [Read Issue Development](#read-issue-development) with that file for the entire field across repositories and states, saving `links-943.json` or the supplied path. An unreadable relation is incomplete evidence, which blocks the caller; an empty array means the field was checked and empty.
3. Run [Write Development Snapshot](#write-development-snapshot) with the issue identity, completeness result and repository setting, saving `development-943.json` or the supplied path.
   - Each `{repo, number}` entry under the issue's number in the links file is the pull request URL `https://github.com/<repo>/pull/<number>`; supply one URL per entry, in the file's order.
   - Set `complete` true only after the full read, and `auto_close_issues` false only after the repository setting is confirmed disabled.
4. Return both files and any incomplete evidence. The caller supplies fresh linked pull request records in `development-prs-943.json`.

### *Read* Issue Development

The Development pull requests of one issue, or of every issue in one repository, keyed by issue number.

**Inputs:** One issue's JSON or one repository's issue collection, authenticated access and destination file.

1. Run [Capture Issue Links](#capture-issue-links) with the supplied issues and destination.
2. Return each issue's observed pull requests, or stop and return each unreadable relation the capture names as a blocker.

### *Audit* Closure Evidence

Each closed issue in one repository whose criteria or Development links do not support its closure, with the reason it was closed.

**Inputs:** Repository, authenticated access, the issue numbers to audit or every closed issue, and destination files for the issue collection and its issue-links file.

1. Fetch the closed issues alone:
   - For named issues, run [Fetch Selected Closed Issues](#fetch-selected-closed-issues) with their numbers.
   - For the whole repository, run [Fetch Closed Issues](#fetch-closed-issues).
   - An empty collection means none of the named issues is closed; return nothing listed.
2. Run [Read Issue Development](#read-issue-development) with that collection; an unreadable relation is returned as a blocker and the sweep does not run.
3. Run [Sweep Closure Evidence](#sweep-closure-evidence) with the collection and the issue-links file.
4. Return each unsupported issue with its state reason and findings, and each unevaluable issue as missing evidence, as findings. Return the not-planned closures apart, as listed for reference. The audit changes no issue.

### *Confirm* Repository Auto-Close

Whether the repository auto-closes issues whose linked pull requests merge, established for this session.

**Inputs:** Repository and authenticated access.

1. Read the setting where the authenticated API exposes it, and take a read value as the answer.
2. Where no API field carries it, put the setting to the user and take their explicit answer, meeting [Auto-Close Setting](#auto-close-setting).
3. Return the confirmed value. An unconfirmed setting is a blocker, and an enabled one leaves the caller to obtain authorization before the repository is reconfigured.

### *Read* Repository Issues

The issue collection used for repository-wide selection.

**Inputs:** Repository and destination JSON file.

1. Run [Fetch All Issues](#fetch-all-issues), saving the complete collection.
2. Return it with pull requests distinguishable from issues.

### *Locate* Initiative Issue

The tracker identity matching one initiative prefix.

**Inputs:** Repository and initiative prefix.

1. Run [Find Initiative Issue](#find-initiative-issue) with the supplied repository and prefix.
2. Return its issue number or an unresolved identity.

### *Select* Tracker Number

The next unused number for one prefixed issue kind in the repository.

**Inputs:** Repository, the kind's prefix letter and its existing titles.

1. Run [List Prefixed Titles](#list-prefixed-titles) for the supplied repository and prefix letter, covering all issue states.
2. Read the highest prefix carrying that letter.
3. Confirm the following number, or `00` when there is no prefix, remains unused before creation.
4. Return the confirmed number.

## Fields

- **Identity.** The issue has its repository, number and URL.
- **Content.** The saved title, body and labels equal the supplied values.
- **Discussion.** A saved comment preserves the supplied text.
- **State.**
  The issue is open or closed with its recorded completion reason. Completed work satisfies its criteria and delivery checks; transferred work identifies the issue tracking it.

### Auto-Close Setting

GitHub's **Auto-close issues with merged linked pull requests** repository setting, which must be disabled before a delivery pull request is linked or merged, so that closure follows the criteria rather than the merge.

- The setting is confirmed per repository and holds for the session; it is not inferred from an issue that stayed open.
- No REST field and no GraphQL field of `gh` 2.46 carries it, so on such a host the user's explicit answer is the only source.
- An enabled setting blocks delivery links and merges until the setting is confirmed disabled.

## Commands

### Create Tracker Issue

Creates an issue from a body file, with its title and labels, and prints its number.

**Inputs:** Repository, populated body file, title and existing label names.

Repeat `-f 'labels[]=<label>'` for each supplied label.

```bash
gh api --method POST 'repos/<owner>/<repo>/issues' -f title='<title>' -F 'body=@<body-file>' -f 'labels[]=<label>' --jq .number
```

**Example:**

```bash
gh api --method POST 'repos/<owner>/<repo>/issues' -f title='<title>' -F body=@body.md -f 'labels[]=<label>' --jq .number
```

### Patch Issue Body

Replaces an issue's body from a file.

**Inputs:** Repository, issue number and complete populated body file.

```bash
gh api --method PATCH 'repos/<owner>/<repo>/issues/<issue-number>' -F 'body=@<body-file>' --jq .number
```

**Example:**

```bash
gh api --method PATCH 'repos/<owner>/<repo>/issues/943' -F body=@body.md --jq .number
```

### Fetch Issue Body

Saves an issue's body alone.

**Inputs:** Repository, issue number and destination file.

```bash
gh api 'repos/<owner>/<repo>/issues/<issue-number>' --jq .body > '<output-body-file>'
```

**Example:**

```bash
gh api 'repos/<owner>/<repo>/issues/943' --jq .body > live-943.md
```

### Retitle Tracker Issue

Replaces an issue's title.

**Inputs:** Repository, issue number and complete title.

```bash
gh api --method PATCH 'repos/<owner>/<repo>/issues/<issue-number>' -f title='<title>' --jq .title
```

**Example:**

```bash
gh api --method PATCH 'repos/<owner>/<repo>/issues/943' -f title='<title>' --jq .title
```

### Add Issue Labels

Adds labels to an issue.

**Inputs:** Repository, issue number and existing label names.

Repeat `-f 'labels[]=<label>'` for each supplied label.

```bash
gh api --method POST 'repos/<owner>/<repo>/issues/<issue-number>/labels' -f 'labels[]=<label>' --jq '.[].name'
```

**Example:**

```bash
gh api --method POST 'repos/<owner>/<repo>/issues/943/labels' -f 'labels[]=<label>' --jq '.[].name'
```

### Remove Issue Label

Removes one label from an issue.

**Inputs:** Repository, issue number and label name.

```bash
gh api --method DELETE 'repos/<owner>/<repo>/issues/<issue-number>/labels/<label>' --jq '.[].name'
```

**Example:**

```bash
gh api --method DELETE 'repos/<owner>/<repo>/issues/943/labels/<label>' --jq '.[].name'
```

### Fetch Issue Comments

Prints an issue's comments.

**Inputs:** Repository and issue number.

```bash
gh api --paginate 'repos/<owner>/<repo>/issues/<issue-number>/comments'
```

**Example:**

```bash
gh api --paginate 'repos/<owner>/<repo>/issues/874/comments'
```

### Fetch Tracker Issue

Saves an issue whole, as JSON, for the scripts that read issues.

**Inputs:** Repository, issue number and destination JSON file.

```bash
gh api 'repos/<owner>/<repo>/issues/<issue-number>' > '<issue-json-file>'
```

**Example:**

```bash
gh api 'repos/<owner>/<repo>/issues/943' > issue-943.json
```

### Check Issue Closure

Checks the issue criteria, the complete link snapshot and every linked pull request.

**Inputs:** Current issue JSON, complete Development snapshot and fresh linked pull request records.

- `--issue`, `--development`, and `--prs` are the fresh issue JSON, Development snapshot, and linked pull request records.
- Exit 0 means the closure gate passes; normal delivery checks must also pass. Exit 1 reports blockers. The command performs no network calls or writes.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/closure.py --issue '<issue-json-file>' --development '<development-snapshot-file>' --prs '<linked-pull-request-records-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/closure.py --issue issue-943.json --development development-943.json --prs development-prs-943.json
```

### Sweep Closure Evidence

Lists each closed issue whose acceptance criteria are missing or unticked, or whose Development field holds a pull request that has not merged, with the issue's state reason.

**Inputs:** One repository's closed issues, as [Fetch Closed Issues](#fetch-closed-issues) or [Fetch Selected Closed Issues](#fetch-selected-closed-issues) saves them, and the issue-links file [Capture Issue Links](#capture-issue-links) wrote from them.

- The sweep audits every closed issue in the collection, so the collection sets its scope. Criteria are read as [Check Issue Closure](#check-issue-closure) reads them. Open issues and pull requests in the collection are skipped.
- `--issue-links` takes the issue-links file alone; a [Write Development Snapshot](#write-development-snapshot) file, or any other shape, is refused as unreadable evidence.
- Each line names the issue, its state reason (`completed`, `not_planned`, or `unknown` when none is recorded) and its findings, under one of three labels:
  - `unsupported:` for an issue closed for any reason but `not_planned` whose evidence does not support it.
  - `unevaluable:` for a closed issue the file holds no link list for, which is missing evidence rather than an empty link set.
  - `not planned:` for an issue closed as `not_planned` whose evidence would not support completion; these follow the findings, listed for reference.
- The last line counts each label. Exit 0 means no issue is unsupported or unevaluable. Exit 1 means at least one is, or the evidence is unreadable. The command performs no network calls or writes.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/closure-sweep.py --issues '<issues-json-file>' --issue-links '<issue-links-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/closure-sweep.py --issues closed-issues.json --issue-links issue-links.json
```

**Example output:**

```text
unsupported: owner/repo#943 closed as completed: acceptance criteria are missing or unticked; owner/repo#980 not merged (closed) - Work Title
unevaluable: owner/repo#944 closed as completed: Development links not captured - Other Title
not planned: owner/repo#945 closed as not_planned: acceptance criteria are missing or unticked - Moved Title
1 unsupported, 1 unevaluable, 1 not planned
```

### Close as Not Planned

Closes an issue whose work another issue tracks.

**Inputs:** Issue identity and confirmed evidence that the work is tracked by its recorded destination.

```bash
gh api --method PATCH 'repos/<owner>/<repo>/issues/<issue-number>' -f state=closed -f state_reason=not_planned --jq .state
```

**Example:**

```bash
gh api --method PATCH 'repos/<owner>/<repo>/issues/874' -f state=closed -f state_reason=not_planned --jq .state
```

### Post Inline Comment

Posts one line of exact comment text and returns its URL.

**Inputs:** Repository, issue number and one-line comment text.

```bash
gh api --method POST 'repos/<owner>/<repo>/issues/<issue-number>/comments' -f body='<comment-text>' --jq .html_url
```

**Example:**

```bash
gh api --method POST 'repos/<owner>/<repo>/issues/637/comments' -f body='Delivered by #950.' --jq .html_url
```

### Post Comment File

Posts a complete comment file and returns its URL.

**Inputs:** Repository, issue number and exact comment file.

```bash
gh api --method POST 'repos/<owner>/<repo>/issues/<issue-number>/comments' -F 'body=@<comment-file>' --jq .html_url
```

**Example:**

```bash
gh api --method POST 'repos/<owner>/<repo>/issues/874/comments' -F body=@comment-874.md --jq .html_url
```

### Set Completed State

Sets an issue to closed with the completed reason and returns its state.

**Inputs:** Repository, issue number, passing normal delivery checks and an immediately preceding successful closure gate on current evidence.

```bash
gh api --method PATCH 'repos/<owner>/<repo>/issues/<issue-number>' -f state=closed -f state_reason=completed --jq .state
```

**Example:**

```bash
gh api --method PATCH 'repos/<owner>/<repo>/issues/943' -f state=closed -f state_reason=completed --jq .state
```

### Write Development Snapshot

Saves an observed Development field and repository setting as JSON.

**Inputs:** Repository and issue number, observed links, completeness result, confirmed or unknown auto-closing setting and destination file.

Write the supplied values in this shape. Substitute the issue number as a JSON integer, completeness as a boolean, and the auto-closing setting as a boolean or `null` when unknown. Supply every observed pull request URL, or an empty array when there are none. Preserve incomplete evidence as incomplete.

```text
{
  "repo": "<owner>/<repo>",
  "number": <issue-number>,
  "complete": <complete>,
  "auto_close_issues": <auto-close-issues>,
  "pull_requests": ["<pull-request-url>"]
}
```

**Example payload:**

```json
{
  "repo": "owner/repo",
  "number": 943,
  "complete": true,
  "auto_close_issues": false,
  "pull_requests": ["https://github.com/owner/repo/pull/980"]
}
```

### Capture Issue Links

Writes each issue's Development pull requests, read from the issue end of the relation, keyed by issue number.

**Inputs:** One issue's JSON or one repository's issue collection, as [Fetch Tracker Issue](#fetch-tracker-issue) or [Fetch All Issues](#fetch-all-issues) saves it, and destination file.

- Each issue maps to every pull request its Development field holds, open, closed and merged, as repository, number and state, or to an empty array. Pull requests in the collection are skipped.
- Each batch of issues costs one `gh api graphql` call from a generated query file, so the command runs outside `sbx`, where `gh` reaches the tracker.
- A relation is unreadable when any page of it does not arrive whole: the tracker returns no node for its subject, names the subject in an error, or reports a further page it does not supply.
- Exit 0 means every relation was read. Exit 1 names each unreadable relation with the tracker's reason and writes nothing; the caller treats it as a blocker.
- A call the tracker refuses outright, such as a rejected credential, exits 1 with `GraphQL read failed:` and what `gh` reported, and writes nothing.

```bash
cd "<workspace>" && python3 skills/work-planner/scripts/links-by-issue.py --issues '<issues-json-file>' --out '<issue-links-file>'
```

**Example:**

```bash
cd "<workspace>" && python3 skills/work-planner/scripts/links-by-issue.py --issues issue-943.json --out links-943.json
```

**Example payload:**

```json
{
  "943": [{"repo": "owner/repo", "number": 980, "state": "MERGED"}]
}
```

### Fetch All Issues

Saves every issue in the repository; the scripts skip the pull requests among them.

**Inputs:** Repository and destination JSON file.

```bash
gh api --paginate "repos/<owner>/<repo>/issues?state=all&per_page=100" > '<issues-json-file>'
```

**Example:**

```bash
gh api --paginate "repos/<owner>/<repo>/issues?state=all&per_page=100" > issues.json
```

### Fetch Closed Issues

Saves every closed issue in the repository; the scripts skip the pull requests among them.

**Inputs:** Repository and destination JSON file.

```bash
gh api --paginate "repos/<owner>/<repo>/issues?state=closed&per_page=100" > '<issues-json-file>'
```

**Example:**

```bash
gh api --paginate "repos/<owner>/<repo>/issues?state=closed&per_page=100" > closed-issues.json
```

### Fetch Selected Closed Issues

Saves the named issues that are closed, one per line; an issue that is open or absent is left out.

**Inputs:** Repository, issue numbers separated by commas, and destination JSON file.

```bash
gh api --paginate "repos/<owner>/<repo>/issues?state=closed&per_page=100" --jq '.[] | select([.number] | inside([<issue-numbers>]))' > '<issues-json-file>'
```

**Example:**

```bash
gh api --paginate "repos/<owner>/<repo>/issues?state=closed&per_page=100" --jq '.[] | select([.number] | inside([637, 943, 946]))' > closed-issues.json
```

### Find Initiative Issue

Prints an initiative's issue number, found by its title's prefix.

**Inputs:** Repository and initiative prefix.

`<initiative-prefix>` includes the initiative id and its enclosing brackets.

```bash
gh api --paginate "repos/<owner>/<repo>/issues?state=all&per_page=100" --jq '.[] | select(.pull_request == null) | select(.title | startswith("<initiative-prefix>")) | .number'
```

**Example:**

```bash
gh api --paginate "repos/<owner>/<repo>/issues?state=all&per_page=100" --jq '.[] | select(.pull_request == null) | select(.title | startswith("[I08]")) | .number'
```

### List Prefixed Titles

Lists titles carrying one kind's prefix letter, across all states.

**Inputs:** Repository owner and name, and the kind's prefix letter.

```bash
gh api --paginate 'repos/<owner>/<repository>/issues?state=all&per_page=100' --jq '.[] | select(.title | test("^\\[<prefix-letter>[0-9]{2}\\]")) | .title'
```

**Example:** Initiatives in one repository.

```bash
gh api --paginate 'repos/m2ux/workflow-server/issues?state=all&per_page=100' --jq '.[] | select(.title | test("^\\[I[0-9]{2}\\]")) | .title'
```

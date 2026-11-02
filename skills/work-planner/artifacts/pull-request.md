# Pull Request

A pull request's identity, head and base, issue links, review state and merge result. Its populated body is an input.

## Prerequisites

Read these files first.

- [Issue](issue.md)
- [Delivery Branches](delivery-branches.md)
- [Agent Review](agent-review.md)
- [Hot-fix](hotfix.md)

## Operations

### *Merge* Delivery Pull Request

One task or epic pull request's merge result, or its handoff for human approval.

**Inputs:** Pull request identity, delivery kind, verified head, target requirements, current passing readiness evidence and the caller's confirmed repository prerequisite documented in [Auto-Close Setting](issue.md#auto-close-setting).

1. Read the supplied target branch's current required reviews and checks alongside the verified head. A branch whose protection or active rules require an approving review takes that review from a person. An agent cannot approve a pull request it opened; on such a branch, the merge belongs to the reviewer even when every other condition holds.
   - Report the pull request as ready for approval, naming what was verified.
   - Stop merge attempts. This handoff is a finished outcome.
   - Keep approval with that reviewer. Another account, an administrative bypass or a setting change cannot supply it. Changing repository protection requires the user's explicit authorization, asked for separately.
   - For example, workflow-server's `main` requires one approving review, so carry an epic to ready and stop.
2. When approval permits the agent to merge:
   - Call [Merge Pull Request](#merge-pull-request) for a task or [Merge Epic Pull Request](#merge-epic-pull-request) for an epic, passing the verified readiness evidence and authorization result. For an epic, also supply the target requirements and exact verified head SHA.
   - If GitHub refuses the merge, return the refusal to the caller for fresh verification.
   - If the agent's own permission layer refuses it, the harness declines to run the merge command and GitHub returns nothing. On a target with no review requirement, that refusal is neither a handoff for approval nor a branch blocker. Return the pull request as ready and verified, naming the refusal and the [merge permission](#merge-permission) it lacks, and stop merge attempts. A later Deliver run merges it in its merge step or reports the missing permission; neither asks the user to approve it.
3. Return the merge result, including its merge commit when supplied, for the caller's readback.

### *Access* Development Links

The observed or updated Development relation for a pull request.

**Inputs:** Pull request identity, authenticated access and requested relation read or write; for an edit, the issue identity, confirmed repository prerequisite and any user decision authorizing removal of an abandoned or incorrect link, meeting [Auto-Close Setting](issue.md#auto-close-setting) and the removal precondition in [Close Tracker Issue](issue.md#close-tracker-issue).

1. For a read-only request:
   - Run [Read Pull Request State](#read-pull-request-state) for the pull request's metadata, which carries the `html_url` the capture keys it by.
   - Run [Capture Pull Request Links](#capture-pull-request-links) with that record and return its entry, every page read. An unreadable relation is a blocker, not an empty link set.
2. For a link edit:
   - Take the supplied repository prerequisite from [Confirm Repository Auto-Close](issue.md#confirm-repository-auto-close); an unconfirmed setting blocks the edit.
   - For an addition, run [Set Development Link](#set-development-link) with the pull request and issue identities.
   - For removal of an abandoned or incorrect link:
     - Require the supplied user decision.
     - Run [Remove Development Link](#remove-development-link) with those identities.
3. Return the relation the command verified from both ends, or the discrepancy or failure it names. A failed write is a blocker carrying its operation and error, never an unavailable field.

### *Fetch* Pull Request Issue Links

The complete issue-link snapshot for a supplied set of pull requests.

**Inputs:** Current pull request records, authenticated access and destination link-snapshot file.

1. Run [Capture Pull Request Links](#capture-pull-request-links) with `prs.json` and destination `links.json`.
2. If it names an unreadable relation, stop and return each one named as a blocker. Incomplete evidence is never a partial snapshot.
3. Repeat the capture after a link changes.
4. Return the snapshot for the scripts' `--links` input.

### *Link* Pull Request to Issue

The verified delivery-issue relation for a pull request.

**Inputs:** Pull request identity, delivery issue identity, current pull request records, link-snapshot destination, authenticated access and the caller's confirmed repository prerequisite documented in [Auto-Close Setting](issue.md#auto-close-setting).

1. Run [Access Development Links](#access-development-links) with the supplied identities, requested link addition and confirmed repository prerequisite.
2. Stop on a blocker or an unverified edit.
3. Run [Fetch Pull Request Issue Links](#fetch-pull-request-issue-links) with the current records and destination after the edit.
4. Return the verified relation and refreshed snapshot.

### *Merge* Epic Pull Request

The epic's verified merge into its long-lived target.

**Inputs:** Pull request identity, verified head SHA, target requirements, current passing readiness evidence and confirmed authorization for the agent to merge.

1. Require the supplied target requirements, readiness evidence and authorization.
2. Run [Submit Epic Merge](#submit-epic-merge) with the exact head whose checks and target requirements were verified; return a refusal without continuing.
3. Run [Read Merge Result](#read-merge-result) for that pull request.
4. Confirm the merged state, merge commit, verified head and target.
5. Return the result or discrepancy.

### *Fetch* All Delivery Pull Requests

The pull request collection covering every supplied board repository and every pull request the board's issues link.

**Inputs:** Ordered repository list, the board items file and destination JSON-lines file.

1. Run [Fetch Repository Delivery Pull Requests](#fetch-repository-delivery-pull-requests) for the first repository and destination `prs.json`. This replaces the destination with a fresh collection.
2. Stop on failure.
3. Run [Append Repository Delivery Pull Requests](#append-repository-delivery-pull-requests) for each further repository, passing the same destination.
4. Run [Fetch Linked Pull Requests](#fetch-linked-pull-requests) with that destination and the board items file.
5. If any fetch failed, return incomplete evidence.
6. Return the complete collection only after every fetch succeeds.

### *Read* Initiative Pull Requests

The current delivery pull requests for one initiative: each one whose title names it, and each one its plan links, whatever its title.

**Inputs:** Repository, initiative prefix, the initiative's issue files (the initiative, its epics and their task issues) and destination collection file.

1. Run [Fetch Initiative Pull Requests](#fetch-initiative-pull-requests) with the supplied repository and prefix, saving the collection to the supplied file.
2. Run [Fetch Linked Pull Requests](#fetch-linked-pull-requests) with that collection and the supplied issue files.
3. Return the collection, or an incomplete-fetch finding naming each unreadable relation or pull request.

### *Read* Pull Request State

One current pull request and its requested supporting records.

**Inputs:** Repository, pull request number, output paths and requested records: metadata, changed paths or reviews.

1. Run [Save Pull Request Snapshot](#save-pull-request-snapshot) for full REST metadata, including URL, body and both revision SHAs, replacing the supplied destination with one JSON object on every refresh.
2. Run [Fetch Pull Request Files](#fetch-pull-request-files) or [Fetch Pull Request Reviews](#fetch-pull-request-reviews) when the caller requests those records.
3. Return the snapshots or missing evidence.

### *Publish* Pull Request

One pull request created or updated from supplied content and metadata.

**Inputs:** Repository, optional pull request number, task or epic kind, body file and selected title, head or base changes, and, for a created delivery pull request, its delivery issue identity, the repository setting confirmed for the session and a link-snapshot destination.

1. For creation, run [Open Task Pull Request](#open-task-pull-request) or [Open Epic Pull Request](#open-epic-pull-request) for the supplied kind, body, title, head and base, preserving epic draft state. A task pull request titled with a hot-fix prefix always opens as a draft.
   - For a task or epic pull request, run [Link Pull Request to Issue](#link-pull-request-to-issue) with it, the supplied delivery issue, that confirmed setting and the snapshot destination, meeting [Issue Links](#issue-links).
2. For an existing pull request, run [Patch Pull Request Body](#patch-pull-request-body), [Retitle Pull Request](#retitle-pull-request) or [Retarget Pull Request](#retarget-pull-request) for the supplied changes, preserving other fields.
3. Re-read through [Read Pull Request State](#read-pull-request-state).
4. Return the saved state or discrepancy.

### *Locate* Review Pull Request

The review pull request for a supplied epic base.

**Inputs:** Repository and epic-base head.

1. Run [Find Review Pull Request](#find-review-pull-request) with the supplied head.
2. Return its number or an absent-review finding.

### *Read* Head Evidence

The check-run and status evidence for one literal head commit.

**Inputs:** Repository, verified head SHA and destination files.

1. Run [Fetch Head Check Runs](#fetch-head-check-runs) for the supplied literal SHA.
2. Run [Fetch Head Status](#fetch-head-status) for the same SHA.
3. Return both snapshots, retaining missing or pending evidence as unresolved. The caller compares them with supplied target requirements and current reviews.

### *Merge* Task Pull Requests

Merges each open task pull request whose test plan has passed.

**Inputs:** Task pull request identity, its base, the project checkout, the unit checkout holding its task branch, the repository prerequisite and the passing test-plan evidence.

1. Run [Confirm Repository Auto-Close](issue.md#confirm-repository-auto-close) for the repository, and confirm the task pull request's base, as [Task Branches](delivery-branches.md#task-branches) names it. An epic base carries no review requirement of its own; where one applies, [Merge Delivery Pull Request](#merge-delivery-pull-request) governs.
2. Merge the task pull request.
   - Where its base is an epic base, run [Update Epic Base](delivery-branches.md#update-epic-base) with the project checkout and that base.
   - Fetch readiness with [Fetch Merge Readiness](#fetch-merge-readiness) for the task pull request and its base.
   - Run [Merge Delivery Pull Request](#merge-delivery-pull-request) with delivery kind task, the verified head, target requirements, repository prerequisite and passing evidence, without further confirmation.
   - Stop on a handoff for human approval or a permission-layer refusal, returning it to the caller.
   - If GitHub refuses the merge:
     - Run [Update Task Branch](delivery-branches.md#update-task-branch) with the unit checkout, the task branch and its base.
     - Repeat Fetch Merge Readiness for the updated task head.
     - Retry Merge Delivery Pull Request once with that verified evidence. A conflict or repeated refusal leaves the pull request open with the blocker reported.
3. Run [Read Pull Request State](#read-pull-request-state) to confirm the merged state, head, base and merge commit.
   - Return that result to the caller.

### *Fetch* Merge Readiness

The current pull request's readiness against its target requirements and head checks.

**Inputs:** Pull request identity, its target branch, and the protection, rules, check and status output paths.

1. Run [Read Pull Request State](#read-pull-request-state) with the pull request identity and destination `epic-pr.json`.
   - Retain the literal head SHA and target branch for the evidence calls.
2. Call [Read Target Requirements](delivery-branches.md#read-target-requirements) with the repository, target and protection/rules output paths.
   - Carry any unresolved requirement into the readiness result.
3. Read the head evidence.
   - Call [Read Head Evidence](#read-head-evidence) with the exact head SHA and check/status output paths.
   - Request reviews through [Read Pull Request State](#read-pull-request-state) with the pull request identity and reviews output path. A missing or pending check, blocked merge state or unmet required review leaves readiness unresolved.
4. Run [Read Pull Request State](#read-pull-request-state) again with the same identity and destination.
   - Compare its head with the retained SHA; a changed head requires fresh evidence.
   - Return the verified head, target requirements and readiness result, including unresolved conditions.

### *Hold* Epic Review

An open epic review returned to draft while its handoff evidence is unresolved.

**Inputs:** Review pull request identity.

1. Read full metadata through [Read Pull Request State](#read-pull-request-state). For an open ready pull request, run [Mark Review Draft](#mark-review-draft).
2. Read the state again and return the confirmed draft state or discrepancy.

### *Ready* Epic Review

The complete epic's pull request made ready for review.

**Inputs:** Review pull request identity, published agent review records and confirmed readiness showing every task delivered, every criterion verified and ticked, and no unresolved question or delivery discrepancy.

1. Require the supplied readiness evidence and read the pull request through [Read Pull Request State](#read-pull-request-state).
2. Run [Check Agent Review](agent-review.md#check-agent-review) with the fresh metadata and published records. On a finding, run [Hold Epic Review](#hold-epic-review) and stop. For a draft with passing evidence, run [Mark Review Ready](#mark-review-ready) with the node id its metadata names.
3. Read the pull request again and repeat Check Agent Review. A changed revision returns to draft and reports the discrepancy. Return the confirmed ready state only with current evidence. Target review requirements still govern the merge.

### *Ready* Hot-fix Pull Request

A hot-fix's draft delivering pull request made ready for review once its review cycle is complete.

**Inputs:** Delivering pull request identity and its published agent review records.

1. Run [Read Pull Request State](#read-pull-request-state) for its full metadata.
2. Run [Check Agent Review](agent-review.md#check-agent-review) with that metadata and the published records.
   - On a finding, return it to the caller; the pull request stays a draft.
3. For a draft with passing evidence, run [Mark Review Ready](#mark-review-ready) with the node id its metadata names.
4. Run Read Pull Request State again and repeat Check Agent Review. Return the confirmed ready state, or the changed revision or finding that leaves it unconfirmed.

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

## Commands

### Retarget Pull Request

Points a pull request at another base branch, such as its epic's base branch.

**Inputs:** Repository, pull request number and target branch.

```bash
gh api --method PATCH 'repos/<owner>/<repo>/pulls/<pull-request-number>' -f base='<target-branch>' --jq .base.ref
```

**Example:**

```bash
gh api --method PATCH 'repos/<owner>/<repo>/pulls/950' -f base='i07/e00/main' --jq .base.ref
```

### Retitle Pull Request

Replaces a pull request's title.

**Inputs:** Repository, pull request number and complete title.

```bash
gh api --method PATCH 'repos/<owner>/<repo>/pulls/<pull-request-number>' -f title='<title>' --jq .title
```

**Example:**

```bash
gh api --method PATCH 'repos/<owner>/<repo>/pulls/950' -f title='[I07:E00] Purpose' --jq .title
```

### Open Task Pull Request

Creates a pull request from a unit's branch to its base.

**Inputs:** Repository, title, task head, base and populated body file.

- Supply the title, the task branch as head, the base [Task Branches](delivery-branches.md#task-branches) names as base, and the complete body file.
- A title opening with a hot-fix prefix, `[F00]`, always adds `-F draft=true`, as a [delivering pull request](hotfix.md#delivering-pull-request) opens.

```bash
gh api --method POST 'repos/<owner>/<repo>/pulls' -f title='<title>' -f head='<task-branch>' -f base='<base>' -F 'body=@<body-file>' --jq .html_url
```

**Example:**

```bash
gh api --method POST 'repos/<owner>/<repo>/pulls' -f title='[I07:E00] Purpose' -f head='i07/e00/w01-purpose' -f base='i07/e00/main' -F body=@body.md --jq .html_url
```

**Example:** A hot-fix's delivering pull request.

```bash
gh api --method POST 'repos/<owner>/<repo>/pulls' -f title='[F00] Reject Bad Keys' -f head='f00-key-validation' -f base='workspace' -F body=@body.md -F draft=true --jq .html_url
```

### Open Epic Pull Request

Creates the draft pull request from an epic base to its long-lived target.

**Inputs:** Repository, title, epic head, long-lived base and populated review body file.

- Supply the epic prefix and name as title, the epic base as head, its long-lived branch as base, and the populated review body file.
- `draft` is true, including when the work is already complete.

```bash
gh api --method POST 'repos/<owner>/<repo>/pulls' -f title='<title>' -f head='<epic-base>' -f base='<long-lived-base>' -F draft=true -F 'body=@<body-file>' --jq .html_url
```

**Example:**

```bash
gh api --method POST 'repos/<owner>/<repo>/pulls' -f title='[I07:E00] Name' -f head='i07/e00/main' -f base='main' -F draft=true -F body=@body.md --jq .html_url
```

### Merge Pull Request

Merges the task pull request into its base.

**Inputs:** Pull request identity, current passing readiness evidence and confirmed authorization for the agent to merge.

- Require the supplied readiness evidence and authorization before issuing the merge.
- The merge method is a merge commit.

```bash
gh api --method PUT 'repos/<owner>/<repo>/pulls/<pull-request-number>/merge' -f merge_method='merge' --jq .merged
```

**Example:**

```bash
gh api --method PUT 'repos/<owner>/<repo>/pulls/950/merge' -f merge_method='merge' --jq .merged
```

### Patch Pull Request Body

Replaces a pull request's body.

**Inputs:** Repository, pull request number and complete populated body file.

- The file is the whole body. The issue a pull request delivers is linked on the pull request itself, so this call leaves that link standing.

```bash
gh api --method PATCH 'repos/<owner>/<repo>/pulls/<pull-request-number>' -F 'body=@<body-file>' --jq .html_url
```

**Example:**

```bash
gh api --method PATCH 'repos/<owner>/<repo>/pulls/950' -F body=@pr-950.md --jq .html_url
```

### Find Review Pull Request

Returns the open pull request whose head is the supplied epic base, or no result when none exists.

**Inputs:** Repository owner, repository and epic base name.

```bash
gh api "repos/<owner>/<repo>/pulls?state=open&head=<owner>:<epic-base>" --jq '.[0].number'
```

**Example:**

```bash
gh api "repos/<owner>/<repo>/pulls?state=open&head=<owner>:i07/e00/main" --jq '.[0].number'
```

### Submit Epic Merge

Merges the epic base into its long-lived target at the supplied head.

**Inputs:** Pull request identity, exact verified head SHA, passing target and readiness evidence and confirmed merge authorization.

The merge method is a merge commit. The endpoint refuses a different head.

```bash
gh api --method PUT 'repos/<owner>/<repo>/pulls/<pull-request-number>/merge' -f merge_method='merge' -f sha='<head-sha>' --jq '{merged, message, sha}'
```

**Example:**

```bash
gh api --method PUT 'repos/<owner>/<repo>/pulls/980/merge' -f merge_method='merge' -f sha='<head-sha>' --jq '{merged, message, sha}'
```

### Read Merge Result

Returns a pull request's merge state, merge commit, head and base.

**Inputs:** Repository and pull request number.

```bash
gh api 'repos/<owner>/<repo>/pulls/<pull-request-number>' --jq '{merged, merge_commit_sha, head: .head.sha, base: .base.ref}'
```

**Example:**

```bash
gh api 'repos/<owner>/<repo>/pulls/980' --jq '{merged, merge_commit_sha, head: .head.sha, base: .base.ref}'
```

### Set Development Link

Adds one pull request to an issue's Development relation, and reads the relation back from both ends.

**Inputs:** Pull request identity, issue identity, authenticated access and confirmed repository prerequisite.

**REST gap:** REST exposes no write to the Development relation; `addCloseIssueReferences` is a GraphQL mutation alone.

- The issue and pull request may sit in different repositories, and the pull request may be a draft on any base branch.
- The script reads both node ids through REST and sends `addCloseIssueReferences` from a generated query file, so the command runs outside `sbx`, where `gh` reaches the tracker.
- Exit 0 means the issue holds the pull request exactly once, the pull request holds the issue, and every other link on the issue stands. Running it again for a linked pair holds the same relation.
- Exit 1 prints `failed:` with the operation, the step and the tracker's error, or `discrepancy:` with the relation read back.

```bash
cd "<workspace>" && python3 skills/work-planner/scripts/development-link.py add --issue '<issue-owner>/<issue-repo>#<issue-number>' --pull '<pr-owner>/<pr-repo>#<pull-request-number>'
```

**Example:**

```bash
cd "<workspace>" && python3 skills/work-planner/scripts/development-link.py add --issue 'm2ux/workflow-server#637' --pull 'm2ux/workflow-server#950'
```

**Example output:**

```text
issue m2ux/workflow-server#637: m2ux/workflow-server#950
pull request m2ux/workflow-server#950: m2ux/workflow-server#637
verified: add m2ux/workflow-server#950 -> m2ux/workflow-server#637
```

### Remove Development Link

Removes one pull request from an issue's Development relation, and reads the relation back from both ends.

**Inputs:** Pull request and issue identities, authenticated access and the user's decision authorizing removal of the abandoned or incorrect link.

**REST gap:** REST exposes no write to the Development relation; `removeCloseIssueReferences` is a GraphQL mutation alone.

- The script sends `removeCloseIssueReferences` from a generated query file, so the command runs outside `sbx`.
- Exit 0 means neither end holds the other and every other link on the issue stands.
- Exit 1 prints `failed:` or `discrepancy:` as [Set Development Link](#set-development-link) does.

```bash
cd "<workspace>" && python3 skills/work-planner/scripts/development-link.py remove --issue '<issue-owner>/<issue-repo>#<issue-number>' --pull '<pr-owner>/<pr-repo>#<pull-request-number>'
```

**Example:**

```bash
cd "<workspace>" && python3 skills/work-planner/scripts/development-link.py remove --issue 'm2ux/workflow-server#637' --pull 'm2ux/workflow-server#950'
```

**Example output:**

```text
failed: remove m2ux/workflow-server#950 -> m2ux/workflow-server#637: removeCloseIssueReferences: Resource not accessible by integration
```

### Capture Pull Request Links

Writes the complete issue-link snapshot for a pull request collection, read from the pull-request end of the Development relation.

**Inputs:** Pull request records as JSON lines, from any number of repositories, and destination link-snapshot file.

**REST gap:** REST exposes no read of a pull request's closing issue references.

- The snapshot holds one entry per pull request, with every linked issue's repository and number, or an empty array.
- Each batch of pull requests costs one `gh api graphql` call from a generated query file, so the command runs outside `sbx`, where `gh` reaches the tracker.
- A relation is unreadable when any page of it does not arrive whole: the tracker returns no node for its subject, names the subject in an error, or reports a further page it does not supply.
- Exit 0 means the snapshot is complete. Exit 1 names each unreadable relation with the tracker's reason and writes no snapshot; the caller treats it as a blocker.
- A call the tracker refuses outright, such as a rejected credential, exits 1 with `GraphQL read failed:` and what `gh` reported, and writes nothing.

```bash
cd "<workspace>" && python3 skills/work-planner/scripts/links-by-pull-request.py --prs '<pull-request-records-file>' --out '<issue-link-snapshot-file>'
```

**Example:**

```bash
cd "<workspace>" && python3 skills/work-planner/scripts/links-by-pull-request.py --prs prs.json --out links.json
```

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

**Inputs:** Repository, pull request number and destination JSON file.

```bash
gh api 'repos/<owner>/<repo>/pulls/<pull-request-number>' > '<pull-request-json-file>'
```

**Example:**

```bash
gh api 'repos/<owner>/<repo>/pulls/980' > epic-pr.json
```

### Fetch Pull Request Reviews

Saves every review on one pull request.

**Inputs:** Repository, pull request number and destination file.

```bash
gh api --paginate 'repos/<owner>/<repo>/pulls/<pull-request-number>/reviews?per_page=100' > '<reviews-file>'
```

**Example:**

```bash
gh api --paginate 'repos/<owner>/<repo>/pulls/980/reviews?per_page=100' > reviews.json
```

### Fetch Initiative Pull Requests

Saves the task and epic pull requests that name one initiative's epics.

**Inputs:** Repository, initiative prefix and destination JSON-lines file.

`<initiative-prefix>` includes the opening bracket and initiative id, matching its task and epic titles.

```bash
gh api --paginate "repos/<owner>/<repo>/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("<initiative-prefix>"))' > '<pull-request-records-file>'
```

**Example:**

```bash
gh api --paginate "repos/<owner>/<repo>/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07"))' > prs.json
```

### Fetch Linked Pull Requests

Appends to a pull request collection each pull request the plan links that the collection lacks, whatever its title.

**Inputs:** Existing destination JSON-lines file and the plan's issues: issue files, or a board items file whose items each carry their issue whole.

**REST gap:** REST exposes no read of the pull requests an issue's Development field holds.

- A pull request is linked when a Work Breakdown row's id cell links it or an issue's Development field names it, open, closed or merged, in whichever repository it lives.
- A pull request no row or Development link names is found by its title alone, through the title-matched fetch this command follows.
- The command reads the Development field by `gh api graphql` and each missing pull request by REST, so it runs outside `sbx`, where `gh` reaches the tracker.
- Exit 0 means every linked pull request is in the collection. Exit 1 names each unreadable relation or pull request and appends nothing; the caller treats it as a blocker.

```bash
cd "<workspace>" && python3 skills/work-planner/scripts/linked-pull-requests.py --prs '<pull-request-records-file>' --issues '<issue-file>' ...
```

**Example:**

```bash
cd "<workspace>" && python3 skills/work-planner/scripts/linked-pull-requests.py --prs prs.json --issues issue-936.json issue-943.json issue-637.json
```

### Fetch Repository Delivery Pull Requests

Starts a collection with all initiative- and hot-fix-prefixed pull requests from one repository.

**Inputs:** Repository and destination JSON-lines file.

```bash
gh api --paginate "repos/<owner>/<repo>/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' > '<pull-request-records-file>'
```

**Example:**

```bash
gh api --paginate "repos/<owner>/<repo>/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' > prs.json
```

### Append Repository Delivery Pull Requests

Appends all initiative- and hot-fix-prefixed pull requests from one further repository.

**Inputs:** Repository and existing destination JSON-lines file.

```bash
gh api --paginate "repos/<owner>/<repo>/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' >> '<pull-request-records-file>'
```

**Example:**

```bash
gh api --paginate "repos/<owner>/<repo>/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I") or startswith("[F"))' >> prs.json
```

### Fetch Pull Request Files

Saves the paths a pull request changes.

**Inputs:** Repository, pull request number and destination path-list file.

```bash
gh api --paginate 'repos/<owner>/<repo>/pulls/<pull-request-number>/files' --jq '.[].filename' > '<changed-paths-file>'
```

**Example:**

```bash
gh api --paginate 'repos/<owner>/<repo>/pulls/950/files' --jq '.[].filename' > changed-files.txt
```

### Fetch Head Check Runs

Saves every check run for one exact commit.

**Inputs:** Repository, literal head SHA and destination file.

```bash
gh api --paginate 'repos/<owner>/<repo>/commits/<head-sha>/check-runs?per_page=100' > '<check-runs-file>'
```

**Example:**

```bash
gh api --paginate 'repos/<owner>/<repo>/commits/<head-sha>/check-runs?per_page=100' > checks.json
```

### Fetch Head Status

Saves commit status evidence for one exact commit.

**Inputs:** Repository, literal head SHA and destination file.

```bash
gh api --paginate 'repos/<owner>/<repo>/commits/<head-sha>/status?per_page=100' > '<commit-status-file>'
```

**Example:**

```bash
gh api --paginate 'repos/<owner>/<repo>/commits/<head-sha>/status?per_page=100' > status.json
```

### Mark Review Ready

Marks a draft pull request ready for review.

**Inputs:** The pull request's node id, from its REST record's `node_id`, and a query file.

**REST gap:** REST has no endpoint that marks a draft ready for review.

- The query file holds the mutation with the node id inlined, since a GraphQL variable is a literal `$`:

  ```graphql
  mutation { markPullRequestReadyForReview(input: {pullRequestId: "<pull-request-node-id>"}) { pullRequest { isDraft } } }
  ```

```bash
gh api graphql -F query=@'<query-file>' --jq .data.markPullRequestReadyForReview.pullRequest.isDraft
```

### Mark Review Draft

Returns an open integration pull request with blocked handoff evidence to draft.

**Inputs:** Repository and pull request number.

```bash
gh pr ready '<pull-request-number>' --undo --repo '<owner>/<repository>'
```

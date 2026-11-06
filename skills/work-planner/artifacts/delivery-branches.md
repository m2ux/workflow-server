# Delivery Branches

The long-lived branches, epic bases and task branches used for delivery.

## Prerequisites

Read these files first.

- [Work Item](work-item.md)
- [Hot-fix](hotfix.md)

## Operations

### Prepare Delivery Bases

The branches a task pull request targets.

#### 1. Read Changed Branches

For each branch in [Changed Branches](#changed-branches "○"), Apply [Fetch Remote Branch](#fetch-remote-branch "ƒ") in the [project checkout](#project-checkout "○"), then Apply [List Long-Lived Branches](#list-long-lived-branches "ƒ") with `--project` set to the checkout and `--revision` to that remote branch, such as `origin/main`, as [Branches](#branches) names for base preparation.

#### 2. List Existing Epic Bases

Apply [List Epic Bases](#list-epic-bases "ƒ") in the project checkout for [Epic Identity](#epic-identity "○").

#### 3. Resolve Missing Branch Configuration

- If `config/branches` is missing or empty at that revision, or does not name the changed branch:
- Report the names as unevaluable at that revision.
- Obtain the project's branch names before creating delivery branches.

#### 4. Require Confirmed Prerequisites

Require the caller's confirmed [prerequisite evidence](#prerequisite-evidence "○") before creating a base. The board status alone supplies no such evidence.

#### 5. Create Missing Epic Bases

Apply [Create Epic Base](#create-epic-base "ƒ") in the project checkout for each missing base, passing the corresponding long-lived branch, epic base name and confirmed prerequisite evidence.

#### 6. Provide Prepare Delivery Bases

Provide [Epic-Base Names](#epic-base-names "●") after preparation, or [Failure](#failure "●") when preparation cannot complete.

### Create Epic Base

The missing epic branch rooted in its remote long-lived branch.

#### 1. Require Missing Destination

Require confirmed [Prerequisite Evidence](#prerequisite-evidence "○") and a missing destination for [Epic-Base Name](#epic-base-name "○"). Refuse a destination that already exists.

#### 2. Fetch Long-Lived Source

Apply [Fetch Remote Branch](#fetch-remote-branch "ƒ") in the [project checkout](#project-checkout "○") with the corresponding long-lived [source branch](#source-branch "○"), such as `main`.

#### 3. Publish Missing Epic Base

- After a successful fetch:
- Apply [Publish Epic Base](#publish-epic-base "ƒ") in the project checkout with that remote source and the missing epic base name, such as `i07/e00/main`, meeting [Epic Bases](#epic-bases).
- Provide [Branch Result](#branch-result "●") with the created branch, or [Failure](#failure "●").

### Update Epic Base

The current long-lived target merged into an epic base.

#### 1. Resolve Epic Target

Take the long-lived target and epic base checkout’s path from [Epic-Base Name](#epic-base-name "○"), meeting [Epic Bases](#epic-bases).

#### 2. Fetch Current Epic Base

Apply [Fetch Remote Branch](#fetch-remote-branch "ƒ") in the [Project Checkout](#project-checkout "○") with that epic base; stop on failure.

#### 3. Prepare Epic Base Checkout

Apply [Add Epic Base Worktree](#add-epic-base-worktree "ƒ") in the project checkout for an absent epic base checkout, and reuse an existing one; stop on failure, which a base checked out elsewhere returns.

#### 4. Fetch Long-Lived Target

Apply [Fetch Remote Branch](#fetch-remote-branch "ƒ") in the epic base checkout with the long-lived target, such as `main`; stop on failure.

#### 5. Merge Current Target

Apply [Merge Remote Branch](#merge-remote-branch "ƒ") in the epic base checkout with the target branch name, such as `main`, to merge `origin/main`. A conflict stops the update, leaves the pull request open and is reported.

#### 6. Publish Updated Epic Base

- After a successful merge:
- Apply [Push Epic Base](#push-epic-base "ƒ") in the epic base checkout.
- Provide [Branch Result](#branch-result "●") with the updated branch, or [Failure](#failure "●").

### Update Task Branch

The current base merged into a unit's task branch.

#### 1. Fetch Current Task Base

Apply [Fetch Remote Branch](#fetch-remote-branch "ƒ") in the [unit checkout](#unit-checkout "○") with [Base Branch](#base-branch "○"), such as `i07/e00/main`.

#### 2. Stop on Fetch Failure

Stop on failure.

#### 3. Merge Current Task Base

Apply [Merge Remote Branch](#merge-remote-branch "ƒ") in the unit checkout with the base name, such as `i07/e00/main`, to merge `origin/i07/e00/main`. A conflict stops the update, leaves the pull request open and is reported.

#### 4. Publish Updated Task Branch

- After a successful merge:
- Apply [Push Task Branch](#push-task-branch "ƒ") in the unit checkout with [Task Branch](#task-branch "○") as destination.
- Provide [Branch Result](#branch-result "●") with the updated branch, or [Failure](#failure "●").

### Create Task Worktree

The worktree and branch one unit's session works in.

#### 1. Require Unit Prerequisites

Require [Prerequisite Evidence](#prerequisite-evidence "○") and names meeting [Task Branches](#task-branches).

#### 2. Fetch Task Base

Apply [Fetch Remote Branch](#fetch-remote-branch "ƒ") in the [project checkout](#project-checkout "○") of the repository the work changes, passing the base; stop on failure.

#### 3. Add Unit Worktree

Apply [Add Task Worktree](#add-task-worktree "ƒ") in the project checkout at [Worktree Path](#worktree-path "○") for the [task branch](#task-branch "○"), rooted in the fetched [Base Branch](#base-branch "○").

#### 4. Provide Unit Checkout

- Provide [Worktree Result](#worktree-result "●") with the worktree path, branch and base, or [Failure](#failure "●").

- A unit that changes several long-lived branches runs this once for each epic base, with the branch and worktree [Task Branches](#task-branches) names for it.

### Create Pull Request Worktree

The detached worktree where the graph reads the reviewed change.

#### 1. Fetch Verified Review Head

Apply [Fetch Review Head](#fetch-review-head "ƒ") in the [project checkout](#project-checkout "○") of the repository the pull request changes, passing its number; stop on failure.

#### 2. Resolve Fetched Review Commit

Apply [Read Checkout Revision](#read-checkout-revision "ƒ") on the project checkout for `FETCH_HEAD`.

#### 3. Check Verified Head

If the fetched commit differs from [Verified Head](#verified-head "○"), provide a changed-head finding before creating a worktree.

#### 4. Place Review Worktree

Take the worktree path from the [pull request number](#pull-request-number "○"), meeting [Review Worktrees](#review-worktrees).

#### 5. Check Existing Review Worktree

- If that worktree already exists:
- Apply [Read Checkout Revision](#read-checkout-revision "ƒ") in that review checkout for `HEAD`.
- Apply [Read Checkout Status](#read-checkout-status "ƒ") there.
- Reuse it only at the verified head and when its status reports detached HEAD with no tracked or untracked changes.
- Otherwise retain it and select an unused path suffixed with the verified commit.

#### 6. Add Detached Review Worktree

For an unused path, Apply [Add Review Worktree](#add-review-worktree "ƒ") in the project checkout with that path and the verified commit.

#### 7. Confirm Review Checkout Head

Apply [Read Checkout Revision](#read-checkout-revision "ƒ") in the selected review checkout for `HEAD` to confirm its commit.

#### 8. Provide Review Checkout

Provide [Worktree Result](#worktree-result "●") with the selected detached worktree path and head, or [Failure](#failure "●") with the discrepancy before measuring.

### Read Target Requirements

The protection and active rules governing one target branch.

#### 1. Fetch Target Protection

Apply [Fetch Branch Protection](#fetch-branch-protection "ƒ") for [Target Branch](#target-branch "○") in [Repository](#repository "○"), using [Output Files](#output-files "○") for the evidence destinations.

#### 2. Fetch Active Target Rules

Apply [Fetch Active Branch Rules](#fetch-active-branch-rules "ƒ") for the same target.

#### 3. Provide Target Requirements

Provide [Target Requirements](#target-requirements "●") with both records, or [Failure](#failure "●") when a requirement is unreadable. A protection 404 does not establish the absence of active rules.

### Read Delivery Branches

The configured long-lived branches and existing epic bases.

#### 1. Read Declared Branch Names

Apply [List Long-Lived Branches](#list-long-lived-branches "ƒ") with the supplied [checkout](#project-checkout "○") and [revision](#revision "○"). Absent, empty or unreadable configuration at that revision leaves branch names unevaluable, reported with its source.

#### 2. List Current Epic Bases

Apply [List Epic Bases](#list-epic-bases "ƒ") in the project checkout for [Epic Identity](#epic-identity "○").

#### 3. Provide Delivery Branches

Provide [Branch Names](#branch-names "●") and [Epic-Base Names](#epic-base-names "●"), or [Failure](#failure "●") with any missing configuration.

### List Epic Bases

Prints one epic's base branch names, one per line.

#### 1. List Epic Bases

- Run in the [Project Checkout](#project-checkout "○").

**Acts on:** the checkout it runs in.

- A base is `<epic-branch-prefix>/<name>` whose `<name>` is a [long-lived branch](#branches), named as [Epic Bases](#epic-bases) states.
- The prefix has the form `i<initiative-number>/e<epic-number>`. **Example:** `i07/e00`; a corresponding base is `i07/e00/main`.

<big><pre>
git ls-remote --heads origin 'refs/heads/[**<epic-branch-prefix>**](#epic-identity "○")/*' | cut -f2 | sed 's|refs/heads/||'
</pre></big>

#### 2. Provide Listed Epic Bases

Provide [Epic-Base Names](#epic-base-names "●") to the requester, or [Failure](#failure "●") if the operation fails.

### List Long-Lived Branches

Prints the long-lived branch names, one per line.

#### 1. List Long-Lived Branches

- The names meet [Branches](#branches).
- Select the evaluated revision according to [Branches](#branches).
- The names are the ones `config/branches` states at the commit `--revision` resolves to. Standard error carries their source: the configuration path, that commit and the repository.
- `--names` reads one `--revision`.
- An absent, empty or unreadable statement, or a revision resolving to no commit, prints `unevaluable:` with the source and why, and exits 1.

<big><pre>
cd "[**<workspace>**](#workspace "○")" && \
  "[**<workspace>**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/sync.py \
  --names \
  --project '[**<checkout>**](#project-checkout "○")' \
  --revision '[**<revision>**](#revision "○")'
</pre></big>

#### 2. Provide Listed Long-Lived Branches

Provide [Branch Names](#branch-names "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Fetch Remote Branch

Fetches one source branch from origin.

#### 1. Fetch Remote Branch

Run in the [Checkout](#checkout "○").

**Acts on:** the checkout it runs in.

<big><pre>
git fetch origin '[**<source-branch>**](#source-branch "○")'
</pre></big>

#### 2. Provide Fetched Remote Branch

Provide [Branch Result](#branch-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Publish Epic Base

Creates a remote epic base from the fetched source branch.

#### 1. Publish Epic Base

- Run in the [Project Checkout](#project-checkout "○").
- Require [Missing Destination](#missing-destination "○"), [Prerequisite Evidence](#prerequisite-evidence "○") before executing the command.

**Acts on:** the checkout it runs in.

<big><pre>
git push origin 'origin/[**<source-branch>**](#source-branch "○"):refs/heads/[**<epic-base>**](#epic-base-name "○")'
</pre></big>

#### 2. Provide Published Epic Base

Provide [Branch Result](#branch-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Merge Remote Branch

Merges one fetched remote branch into the branch of the checkout it runs in.

#### 1. Merge Remote Branch

Run in the [Checkout](#checkout "○").

**Acts on:** the checkout it runs in.

<big><pre>
git merge --no-edit 'origin/[**<source-branch>**](#source-branch "○")'
</pre></big>

#### 2. Provide Merged Remote Branch

Provide [Branch Result](#branch-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Push Epic Base

Pushes the epic base checked out where it runs to its configured upstream.

#### 1. Push Epic Base

- Run in the [Checkout](#checkout "○").
- Require [Successful Merge](#successful-merge "○") before executing the command.

**Acts on:** the checkout it runs in.

<big><pre>
git push
</pre></big>

#### 2. Provide Pushed Epic Base

Provide [Branch Result](#branch-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Push Task Branch

Pushes the head of the checkout it runs in to its named remote task branch.

#### 1. Push Task Branch

- Run in the [Unit Checkout](#unit-checkout "○").
- Require [Successful Merge](#successful-merge "○") before executing the command.

**Acts on:** the checkout it runs in.

<big><pre>
git push origin 'HEAD:refs/heads/[**<task-branch>**](#task-branch "○")'
</pre></big>

#### 2. Provide Published Task Branch

Provide [Branch Result](#branch-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Add Task Worktree

Creates a task branch and worktree at the fetched base.

#### 1. Add Task Worktree

- Run in the [Project Checkout](#project-checkout "○").
- Require [Prerequisite Evidence](#prerequisite-evidence "○") before executing the command.

**Acts on:** the checkout it runs in.

- The path resolves against the directory the command runs in, so supply it as [Task Branches](#task-branches) anchors it rather than relative to a linked worktree.

<big><pre>
git worktree add '[**<worktree-path>**](#worktree-path "○")' -b '[**<task-branch>**](#task-branch "○")' 'origin/[**<base>**](#base-branch "○")'
</pre></big>

#### 2. Provide Added Task Worktree

Provide [Worktree Result](#worktree-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Fetch Review Head

Fetches one pull request head into FETCH_HEAD.

#### 1. Fetch Review Head

Run in the [Project Checkout](#project-checkout "○").

**Acts on:** the checkout it runs in.

<big><pre>
git fetch origin pull/[**<pull-request-number>**](#pull-request-number "○")/head
</pre></big>

#### 2. Provide Fetched Review Head

Provide [Checkout Commit](#checkout-commit "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Add Epic Base Worktree

Creates the worktree for an existing epic base.

#### 1. Add Epic Base Worktree

- Run in the [Project Checkout](#project-checkout "○").

**Acts on:** the checkout it runs in.

- The path resolves against the directory the command runs in, so supply it as [Epic Bases](#epic-bases) anchors it rather than relative to a linked worktree.

<big><pre>
git worktree add '[**<worktree-path>**](#worktree-path "○")' '[**<epic-base>**](#epic-base-name "○")'
</pre></big>

#### 2. Provide Added Epic Base Worktree

Provide [Worktree Result](#worktree-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Add Review Worktree

Creates a detached worktree at the fetched review head.

#### 1. Add Review Worktree

- Run in the [Project Checkout](#project-checkout "○").

**Acts on:** the checkout it runs in.

- The path resolves against the directory the command runs in, so supply it as [Review Worktrees](#review-worktrees) anchors it rather than relative to a linked worktree.

<big><pre>
git worktree add --detach '[**<worktree-path>**](#worktree-path "○")' [**<head-commit>**](#verified-head "○")
</pre></big>

#### 2. Provide Added Review Worktree

Provide [Worktree Result](#worktree-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Fetch Branch Protection

Saves the target branch protection response.

#### 1. Fetch Branch Protection

<big><pre>
gh api 'repos/[**<owner>**](#repository "○")/[**<repo>**](#repository "○")/branches/[**<target-branch>**](#target-branch "○")/protection' > '[**<branch-protection-file>**](#output-files "○")'
</pre></big>

#### 2. Provide Fetched Branch Protection

Provide [Target Requirements](#target-requirements "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Fetch Active Branch Rules

Saves every active rule for the target branch.

#### 1. Fetch Active Branch Rules

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository "○")/[**<repo>**](#repository "○")/rules/branches/[**<target-branch>**](#target-branch "○")' > '[**<branch-rules-file>**](#output-files "○")'
</pre></big>

#### 2. Provide Fetched Active Branch Rules

Provide [Target Requirements](#target-requirements "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Read Checkout Revision

Resolves one revision to its commit in the selected checkout.

#### 1. Read Checkout Revision

<big><pre>
git -C '[**<checkout>**](#checkout "○")' rev-parse '[**<revision>**](#revision "○")^{commit}'
</pre></big>

#### 2. Provide Read Checkout Revision

Provide [Checkout Commit](#checkout-commit "●") to the requester, or [Failure](#failure "●") if the operation fails.

### Read Checkout Status

Reports branch or detached-HEAD state and tracked and untracked changes in one checkout.

#### 1. Read Checkout Status

<big><pre>
git -C '[**<checkout>**](#checkout "○")' status --porcelain --branch
</pre></big>

#### 2. Provide Read Checkout Status

Provide [Checkout Status](#checkout-status "●") to the requester, or [Failure](#failure "●") if the operation fails.

## Fields

### Branches

A project states its long-lived branches in `config/branches` at its root, one name per line. A run reads the statement at the commit it evaluates, in the repository its checkout locates; which worktree the checkout is, and what its working files hold, choose nothing. The evaluated revision is fetched before it is read.

- An epic sync evaluates each of its epic bases, such as `origin/i07/e00/main` and `origin/i07/e00/workflows`. Declarations that disagree across those bases leave the names unevaluable, and each is reported with its source.
- A read of one epic's branches evaluates its epic base, such as `origin/i07/e00/main`.
- Base preparation, before a base exists, evaluates the long-lived branch the base is cut from, such as `origin/main`.
- A delivery survey evaluates the long-lived branch that states the project's branches, such as `origin/workspace`.
- Verification of merged delivery evaluates the merged commit.

- **Example.**
  workflow-server's `config/branches` names `docker`, `main`, `workflows` and `workspace`.

### Epic Bases

- Each long-lived branch an epic changes has a base branch, named for the initiative, the epic and that branch, and rooted in that long-lived branch. Its prerequisite epics are closed as completed with every delivery base merged.
- **Example.**
  An epic base cut from `main` is `i07/e00/main`.
- The base's last segment is its long-lived branch, which gives the target it merges and is merged into.
- Each base is worked in one worktree, named by the base under the worktree directory of the repository's main working tree.
- **Example.**
  `i07/e00/main` merges `main`, and is checked out at `.worktrees/i07/e00/main`.
- Every pull request delivering the epic's tasks targets that epic base.
- A completed epic is delivered by merging each base into its long-lived branch. The epic stays open until every base has merged. Another epic still incomplete holds no base back unless it is a prerequisite.
- An epic sync reports each open or merged pull request off these routes as `target`: a task pull request into anything but one of its epic's bases, and an integration pull request into anything but the long-lived branch its head names.

### Producer Outputs

A task row naming another epic's row starts once that row is delivered and each output it delivered is available at the consumer's base commit.

- **The output.**
  Each merged pull request the producer row links carries its merge commit, on the long-lived branch its base names. Each commit the row links is an output of its own.
- **Available.**
  The output is an ancestor of the consumer epic's base on that branch, as the remote holds it at the evaluated commit, or of the long-lived branch itself while the consumer has no base there. An output another repository holds is available once it has reached its long-lived branch: delivered there, or carried by an integration pull request merged after it.
- **Not available.**
  A merge into the producer's own base alone, a merge into a ref that is neither an epic base nor a long-lived branch, such as a task branch, an output recording no merge commit, a commit the checkout does not hold, and a consumer base moved to a commit without the output each leave the row waiting.
- **Not gates.**
  The producer epic's other rows and its closure.
- **Record.**
  Each reading names the producer row, the delivery, the output commit, the consumer revision and commit, and the answer. The integration, review and human-approval gates on each epic stand apart from it.
- **Example.**
  `#944 W02: E00:W01 #9 3f2a1c0d9b1e available at origin/i07/e01/main 8c4d2e7a1f30`.

### Review Worktrees

A reviewed pull request is read in a detached worktree, named by its number under the `pr` folder of the worktree directory of the repository's main working tree.

- **Example.**
  Pull request 950 is read at `.worktrees/pr/950`.

### Task Branches

A unit's task branch is cut from the epic base for the long-lived branch the unit changes, named for its initiative, epic and first task in lowercase separated by slashes, and hyphenated with a slug of at most four words from its Description when one exists: `i01/e02/w04-write-defaults`. The unit's pull request is opened from this branch into that base.

- **Changed branches.**
  A unit changes the long-lived branches its rows' work items name in their [Component](work-item.md#component) declarations. A unit of an epic with one base changes that base.
- **Unplanned rows.**
  A free row linking no work item is unplanned: its session writes the work item after dispatch. Its unit changes every epic base, and the session opens a pull request only from each branch its work changes.
- **Several long-lived branches.**
  A unit whose rows name more than one long-lived branch takes one task branch per epic base it changes, cut from that base, since the bases share no history. Each is the unit's branch with the base's long-lived branch as its last slug word, and opens its own pull request into its own base.
- **Example.**
  A unit changing `main` and `workflows` works on `i01/e02/w04-write-defaults-main` from `i01/e02/main` and `i01/e02/w04-write-defaults-workflows` from `i01/e02/workflows`.
- **Hot-fix.**
  A hot-fix works on the branch its [Branch](hotfix.md#branch) names.

Each worktree is named by its branch under the worktree directory of the repository's main working tree.

### Stash Entries

Every worktree of a repository shares one stash list, so a delivery session that stashes names its entry with a message no other session's entry carries, and acts on that entry alone.

- **Found.**
  An entry is found by its message, never by its position in the list.
- **Restored.**
  An entry is restored with `git stash apply` on that entry's commit, never with a bare `git stash pop`, which takes whichever entry tops the list.
- **Dropped.**
  The session that made an entry drops it once restored, by the `stash@{<n>}` reference its message holds at that moment, since `git stash drop` takes no bare commit.
- **Example.**
  `git stash push -m "i11/e10/w29 before base merge"`, then `git stash list --format='%H %gd %s'` to find the entry, `git stash apply <entry-commit>`, and `git stash drop "stash@{<n>}"`.

### Epic Identity

The initiative and epic identifier, with an epic branch prefix of `i<initiative-number>/e<epic-number>`.

**Example:**

```text
i07/e00
```

### Changed Branches

The long-lived branches the unit changes.

### Prerequisite Evidence

The caller’s confirmed evidence that the prerequisite epics are completed with every delivery base merged.

### Source Branch

The source branch name without the `origin/` prefix.

### Epic-Base Name

The full epic-base branch name.

**Example:**

```text
i07/e00/main
```

### Task Branch

The destination task branch name.

**Example:**

```text
i07/e00/w01-queue-plan
```

### Base Branch

The fetched base from which the task branch is rooted.

**Example:**

```text
i07/e00/main
```

### Worktree Path

The caller-composed lasting path, resolved against the checkout running the command and placed under the project’s worktree directory.

**Example:**

```text
.worktrees/i07/e00/w01-queue-plan
```

### Pull Request Number

The repository-local pull request number.

**Example:**

```text
950
```

### Verified Head

The literal verified head commit used to read a reviewed change.

### Target Branch

The long-lived target branch whose current protection and active rules govern readiness.

**Example:**

```text
main
```

### Output Files

Destination paths for the requested protection and active-rule responses.

**Example:**

```text
branch-protection-file: protection.json
branch-rules-file: branch-rules.json
```

### Branch Names

The configured long-lived names, with the configuration path, commit and repository identifying their source on standard error.

### Epic-Base Names

The full existing epic-base names, one per line.

### Branch Result

The created, fetched, merged or published branch and successful command result.

### Worktree Result

The selected checkout path, branch or detached head, and base where applicable.

### Target Requirements

The complete branch-protection and active-rule responses.

### Checkout Commit

The commit a selected checkout’s revision resolves to.

### Checkout Status

Branch or detached-HEAD state and all tracked and untracked changes.

### Workspace

The checkout holding the installed skill, its scripts and tests.

### Repository

The owner and repository addressed by the operation, written as `owner/repo`.

### Project Checkout

The project repository checkout supplied for branch and delivery reads or writes.

### Unit Checkout

The task branch checkout supplied for this unit.

### Checkout

The supplied repository checkout in which a git operation acts; callers name the project, epic base, unit or review checkout for that call.

### Revision

The fetched commit or revision evaluated by the run.

**Example:**

```text
origin/i07/e00/main
```

### Failure

The operation and error, discrepancy or missing evidence that prevents a verified result.

### Missing Destination

The supplied evidence that the destination epic base does not exist.

### Successful Merge

The successful result of merging the fetched source into the checked-out branch.

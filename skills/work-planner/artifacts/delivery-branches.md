# Delivery Branches

The long-lived branches, epic bases and task branches used for delivery.

## Operations

### Prepare Delivery Bases

The branches a task pull request targets.

#### 1. Read Changed Branches

For each branch in [Changed Branches](#changed-branches), Run [Fetch Remote Branch](#fetch-remote-branch "ƒ") in the [project checkout](#project-checkout), then Run [List Long-Lived Branches](#list-long-lived-branches "ƒ") with `--project` set to the checkout and `--revision` to that remote branch, such as `origin/main`, as [Branches](#branches) names for base preparation.

#### 2. List Existing Epic Bases

Run [List Epic Bases](#list-epic-bases "ƒ") in the project checkout for [Epic Identity](#epic-identity).

#### 3. Resolve Missing Branch Configuration

- If `config/branches` is missing or empty at that revision, or does not name the changed branch:
- Report the names as unevaluable at that revision.
- Obtain the project's branch names before creating delivery branches.

#### 4. Require Confirmed Prerequisites

Require the caller's confirmed [prerequisite evidence](#prerequisite-evidence) before creating a base. The board status alone supplies no such evidence.

#### 5. Create Missing Epic Bases

- For each missing base in the project checkout, use its corresponding long-lived branch, epic base name and confirmed prerequisites:

- Require confirmed [Prerequisite Evidence](#prerequisite-evidence) and a missing destination for [Epic-Base Name](#epic-base-name). Refuse a destination that already exists.

- Run [Fetch Remote Branch](#fetch-remote-branch "ƒ") in the [project checkout](#project-checkout) with the corresponding long-lived [source branch](#source-branch), such as `main`.

- After a successful fetch:
- Run [Publish Epic Base](#publish-epic-base "ƒ") in the project checkout with that remote source and the missing epic base name, such as `i07/e00/main`, meeting [Epic Bases](#epic-bases).
- Retain [Branch Result](#branch-result) with the created branch, or [Failure](#failure).

#### 6. Provide Prepare Delivery Bases

Provide [Epic-Base Names](#epic-base-names) after preparation, or [Failure](#failure) when preparation cannot complete.

### Update Epic Base

The current long-lived target merged into an epic base.

#### 1. Resolve Epic Target

Take the long-lived target and epic base checkout’s path from [Epic-Base Name](#epic-base-name), meeting [Epic Bases](#epic-bases).

#### 2. Fetch Current Epic Base

Run [Fetch Remote Branch](#fetch-remote-branch "ƒ") in the [Project Checkout](#project-checkout) with that epic base; stop on failure.

#### 3. Prepare Epic Base Checkout

Run [Add Epic Base Worktree](#add-epic-base-worktree "ƒ") in the project checkout for an absent epic base checkout, and reuse an existing one; stop on failure, which a base checked out elsewhere returns.

#### 4. Fetch Long-Lived Target

Run [Fetch Remote Branch](#fetch-remote-branch "ƒ") in the epic base checkout with the long-lived target, such as `main`; stop on failure.

#### 5. Merge Current Target

Run [Merge Remote Branch](#merge-remote-branch "ƒ") in the epic base checkout with the target branch name, such as `main`, to merge `origin/main`. A conflict stops the update, leaves the pull request open and is reported.

#### 6. Publish Updated Epic Base

- After a successful merge:
- Run [Push Epic Base](#push-epic-base "ƒ") in the epic base checkout.
- Provide [Branch Result](#branch-result) with the updated branch, or [Failure](#failure).

### Update Task Branch

The current base merged into a unit's task branch.

#### 1. Fetch Current Task Base

Run [Fetch Remote Branch](#fetch-remote-branch "ƒ") in the [unit checkout](#unit-checkout) with [Base Branch](#base-branch), such as `i07/e00/main`.

#### 2. Stop on Fetch Failure

Stop on failure.

#### 3. Merge Current Task Base

Run [Merge Remote Branch](#merge-remote-branch "ƒ") in the unit checkout with the base name, such as `i07/e00/main`, to merge `origin/i07/e00/main`. A conflict stops the update, leaves the pull request open and is reported.

#### 4. Publish Updated Task Branch

- After a successful merge:
- Run [Push Task Branch](#push-task-branch "ƒ") in the unit checkout with [Task Branch](#task-branch) as destination.
- Provide [Branch Result](#branch-result) with the updated branch, or [Failure](#failure).

### Create Pull Request Worktree

The detached worktree where the graph reads the reviewed change.

#### 1. Fetch Verified Review Head

Run [Fetch Review Head](#fetch-review-head "ƒ") in the [project checkout](#project-checkout) of the repository the pull request changes, passing its number; stop on failure.

#### 2. Resolve Fetched Review Commit

Run [Read Checkout Revision](#read-checkout-revision "ƒ") on the project checkout for `FETCH_HEAD`.

#### 3. Check Verified Head

If the fetched commit differs from [Verified Head](#verified-head), provide a changed-head finding before creating a worktree.

#### 4. Place Review Worktree

Take the worktree path from the [pull request number](#pull-request-number), meeting [Review Worktrees](#review-worktrees).

#### 5. Check Existing Review Worktree

- If that worktree already exists:
- Run [Read Checkout Revision](#read-checkout-revision "ƒ") in that review checkout for `HEAD`.
- Run [Read Checkout Status](#read-checkout-status "ƒ") there.
- Reuse it only at the verified head and when its status reports detached HEAD with no tracked or untracked changes.
- Otherwise retain it and select an unused path suffixed with the verified commit.

#### 6. Add Detached Review Worktree

For an unused path, Run [Add Review Worktree](#add-review-worktree "ƒ") in the project checkout with that path and the verified commit.

#### 7. Confirm Review Checkout Head

Run [Read Checkout Revision](#read-checkout-revision "ƒ") in the selected review checkout for `HEAD` to confirm its commit.

#### 8. Provide Review Checkout

Provide [Worktree Result](#worktree-result) with the selected detached worktree path and head, or [Failure](#failure) with the discrepancy before measuring.

### Read Delivery Branches

The configured long-lived branches and existing epic bases.

#### 1. Read Declared Branch Names

Run [List Long-Lived Branches](#list-long-lived-branches "ƒ") with the supplied [checkout](#project-checkout) and [revision](#revision). Absent, empty or unreadable configuration at that revision leaves branch names unevaluable, reported with its source.

#### 2. List Current Epic Bases

Run [List Epic Bases](#list-epic-bases "ƒ") in the project checkout for [Epic Identity](#epic-identity).

#### 3. Provide Delivery Branches

Provide [Branch Names](#branch-names) and [Epic-Base Names](#epic-base-names), or [Failure](#failure) with any missing configuration.

## Commands

### List Epic Bases

Print one epic's base branch names with one name per line and provide [Epic-Base Names](#epic-base-names "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
git ls-remote --heads origin 'refs/heads/[**&lt;epic-branch-prefix&gt;**](#epic-identity "○")/*' | cut -f2 | sed 's|refs/heads/||'
</pre></big>

- Run in the [Project Checkout](#project-checkout "○").

- A base is `<epic-branch-prefix>/<name>` whose `<name>` is a [long-lived branch](#branches), named as [Epic Bases](#epic-bases) states.
- The prefix has the form `i<initiative-number>/e<epic-number>`. **Example:** `i07/e00`; a corresponding base is `i07/e00/main`.

### List Long-Lived Branches

Print the long-lived branch names with one name per line and provide [Branch Names](#branch-names "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/sync.py &#92;
  --names &#92;
  --project '[**&lt;checkout&gt;**](#project-checkout "○")' &#92;
  --revision '[**&lt;revision&gt;**](#revision "○")'
</pre></big>

- The names should meet [Branches](#branches).
- Select the evaluated revision according to [Branches](#branches).
- The names are the ones `config/branches` states at the commit `--revision` resolves to. Standard error carries their source: the configuration path, that commit and the repository.
- `--names` reads one `--revision`.
- An absent, empty or unreadable statement, or a revision resolving to no commit, prints `unevaluable:` with the source and why, and exits 1.

### Fetch Remote Branch

Fetch one source branch from origin and provide [Branch Result](#branch-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

Run in the [Checkout](#checkout "○").

<big><pre>
git fetch origin '[**&lt;source-branch&gt;**](#source-branch "○")'
</pre></big>

### Publish Epic Base

Create a remote epic base from the fetched source branch and provide [Branch Result](#branch-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
git push origin 'origin/[**&lt;source-branch&gt;**](#source-branch "○"):refs/heads/[**&lt;epic-base&gt;**](#epic-base-name "○")'
</pre></big>

- Run in the [Project Checkout](#project-checkout "○").
- Require [Missing Destination](#missing-destination "○"), [Prerequisite Evidence](#prerequisite-evidence "○") before executing the command.

### Merge Remote Branch

Merge one fetched remote branch into the branch of the checkout it runs in and provide [Branch Result](#branch-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

Run in the [Checkout](#checkout "○").

<big><pre>
git merge --no-edit 'origin/[**&lt;source-branch&gt;**](#source-branch "○")'
</pre></big>

- Every worktree of a repository shares one stash list, so a delivery session that stashes names its entry with a message no other session's entry carries, and acts on that entry alone.

- **Found.**
  An entry is found by its message, never by its position in the list.
- **Restored.**
  An entry is restored with `git stash apply` on that entry's commit, never with a bare `git stash pop`, which takes whichever entry tops the list.
- **Dropped.**
  The session that made an entry drops it once restored, by the `stash@{<n>}` reference its message holds at that moment, since `git stash drop` takes no bare commit.
- eg `git stash push -m "i11/e10/w29 before base merge"`, then `git stash list --format='%H %gd %s'` to find the entry, `git stash apply <entry-commit>`, and `git stash drop "stash@{<n>}"`.

### Push Epic Base

Push the epic base checked out where it runs to its configured upstream and provide [Branch Result](#branch-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
git push
</pre></big>

- Run in the [Checkout](#checkout "○").
- Require [Successful Merge](#successful-merge "○") before executing the command.

### Push Task Branch

Push the head of the checkout it runs in to its named remote task branch and provide [Branch Result](#branch-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
git push origin 'HEAD:refs/heads/[**&lt;task-branch&gt;**](#task-branch "○")'
</pre></big>

- Run in the [Unit Checkout](#unit-checkout "○").
- Require [Successful Merge](#successful-merge "○") before executing the command.

### Add Task Worktree

Create a task branch and worktree at the fetched base and provide [Worktree Result](#worktree-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
git worktree add '[**&lt;worktree-path&gt;**](#worktree-path "○")' -b '[**&lt;task-branch&gt;**](#task-branch "○")' 'origin/[**&lt;base&gt;**](#base-branch "○")'
</pre></big>

- Run in the [Project Checkout](#project-checkout "○").
- Require [Prerequisite Evidence](#prerequisite-evidence "○") before executing the command.

- The path resolves against the directory the command runs in, so supply it as [Task Branches](#task-branches) anchors it rather than relative to a linked worktree.

### Fetch Review Head

Fetch one pull request head into FETCH_HEAD and provide [Checkout Commit](#checkout-commit "●") to the requester, or [Failure](#failure "●") if the operation fails.

Run in the [Project Checkout](#project-checkout "○").

<big><pre>
git fetch origin pull/[**&lt;pull-request-number&gt;**](#pull-request-number "○")/head
</pre></big>

### Add Epic Base Worktree

Create the worktree for an existing epic base and provide [Worktree Result](#worktree-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
git worktree add '[**&lt;worktree-path&gt;**](#worktree-path "○")' '[**&lt;epic-base&gt;**](#epic-base-name "○")'
</pre></big>

- Run in the [Project Checkout](#project-checkout "○").

- The path resolves against the directory the command runs in, so supply it as [Epic Bases](#epic-bases) anchors it rather than relative to a linked worktree.

### Add Review Worktree

Create a detached worktree at the fetched review head and provide [Worktree Result](#worktree-result "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
git worktree add --detach '[**&lt;worktree-path&gt;**](#worktree-path "○")' [**&lt;head-commit&gt;**](#verified-head "○")
</pre></big>

- Run in the [Project Checkout](#project-checkout "○").

- The path resolves against the directory the command runs in, so supply it as [Review Worktrees](#review-worktrees) anchors it rather than relative to a linked worktree.

### Fetch Branch Protection

Save the target branch protection response and provide [Target Requirements](#target-requirements "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api 'repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/branches/[**&lt;target-branch&gt;**](#target-branch "○")/protection' &gt; '[**&lt;branch-protection-file&gt;**](#output-files "○")'
</pre></big>

### Fetch Active Branch Rules

Save every active rule for the target branch and provide [Target Requirements](#target-requirements "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
gh api --paginate 'repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/rules/branches/[**&lt;target-branch&gt;**](#target-branch "○")' &gt; '[**&lt;branch-rules-file&gt;**](#output-files "○")'
</pre></big>

### Read Checkout Revision

Resolve one revision to its commit in the selected checkout and provide [Checkout Commit](#checkout-commit "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
git -C '[**&lt;checkout&gt;**](#checkout "○")' rev-parse '[**&lt;revision&gt;**](#revision "○")^{commit}'
</pre></big>

### Read Checkout Status

Report branch or detached-HEAD state and tracked and untracked changes in one checkout and provide [Checkout Status](#checkout-status "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
git -C '[**&lt;checkout&gt;**](#checkout "○")' status --porcelain --branch
</pre></big>

## Fields

### Branches

The project's ordered long-lived branch names, declared in `config/branches` at its root, one name per line. A run reads the statement at the commit it evaluates, in the repository its checkout locates; which worktree the checkout is, and what its working files hold, choose nothing. The evaluated revision is fetched before it is read.

- An epic sync evaluates each of its epic bases, such as `origin/i07/e00/main` and `origin/i07/e00/workflows`. Declarations that disagree across those bases leave the names unevaluable, and each is reported with its source.
- A read of one epic's branches evaluates its epic base, such as `origin/i07/e00/main`.
- Base preparation, before a base exists, evaluates the long-lived branch the base is cut from, such as `origin/main`.
- A delivery survey evaluates the long-lived branch that states the project's branches, such as `origin/workspace`.
- Verification of merged delivery evaluates the merged commit.

- eg `docker`, `main`, `workflows` and `workspace` in workflow-server's `config/branches`.

### Epic Bases

The epic's base-branch collection, one branch per changed long-lived branch.

- Each long-lived branch an epic changes has a base branch, named for the initiative, the epic and that branch, and rooted in that long-lived branch. Its prerequisite epics are closed as completed with every delivery base merged.
- eg `i07/e00/main` for an epic base cut from `main`.
- The base's last segment is its long-lived branch, which gives the target it merges and is merged into.
- Each base is worked in one worktree, named by the base under the worktree directory of the repository's main working tree.
- eg `i07/e00/main` merges `main` and is checked out at `.worktrees/i07/e00/main`.
- Every pull request delivering the epic's tasks targets that epic base.
- A completed epic is delivered by merging each base into its long-lived branch. The epic stays open until every base has merged. Another epic still incomplete holds no base back unless it is a prerequisite.
- An epic sync reports each open or merged pull request off these routes as `target`: a task pull request into anything but one of its epic's bases, and an integration pull request into anything but the long-lived branch its head names.

### Review Worktrees

The detached checkout path for a reviewed pull request, named by its repository-local number under the `pr` folder of the worktree directory of the repository's main working tree.

- eg `.worktrees/pr/950` for pull request 950.

### Task Branches

A collection of task-branch, base-branch and worktree-path triples for the unit. Each task branch is cut from the epic base for the long-lived branch the unit changes, named for its initiative, epic and first task in lowercase separated by slashes, and hyphenated with a slug of at most four words from its Description when one exists: `i01/e02/w04-write-defaults`. The unit's pull request is opened from this branch into that base.

- **Changed branches.**
  A unit changes the long-lived branches its rows' work items name in their [Component](work-item.md#component) declarations. A unit of an epic with one base changes that base.
- **Unplanned rows.**
  A free row linking no work item is unplanned: its session writes the work item after dispatch. Its unit changes every epic base, and the session opens a pull request only from each branch its work changes.
- **Several long-lived branches.**
  A unit whose rows name more than one long-lived branch takes one task branch per epic base it changes, cut from that base, since the bases share no history. Each is the unit's branch with the base's long-lived branch as its last slug word, and opens its own pull request into its own base.
- eg `i01/e02/w04-write-defaults-main` from `i01/e02/main` and `i01/e02/w04-write-defaults-workflows` from `i01/e02/workflows` for a unit changing `main` and `workflows`.
- **Hot-fix.**
  A hot-fix works on the branch its [Branch](hotfix.md#branch) names.

Each worktree is named by its branch under the worktree directory of the repository's main working tree.

### Epic Identity

The initiative and epic identifier, with an epic branch prefix of `i<initiative-number>/e<epic-number>`. eg `i07/e00`

### Changed Branches

The long-lived branches the unit changes.

### Prerequisite Evidence

The caller’s confirmed evidence that the prerequisite epics are completed with every delivery base merged.

### Source Branch

The source branch name without the `origin/` prefix.

### Epic-Base Name

The full epic-base branch name. eg `i07/e00/main`

### Task Branch

The destination task branch name. eg `i07/e00/w01-queue-plan`

### Base Branch

The fetched base from which the task branch is rooted. eg `i07/e00/main`

### Worktree Path

The caller-composed lasting path, resolved against the checkout running the command and placed under the project’s worktree directory. eg `.worktrees/i07/e00/w01-queue-plan`

### Pull Request Number

The repository-local pull request number. eg `950`

### Verified Head

The literal verified head commit used to read a reviewed change.

### Target Branch

The long-lived target branch whose current protection and active rules govern readiness. eg `main`

### Output Files

Destination paths for the requested protection and active-rule responses. eg `branch-protection-file: protection.json`, `branch-rules-file: branch-rules.json`

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

The fetched commit or revision evaluated by the run. eg `origin/i07/e00/main`

### Failure

The operation and error, discrepancy or missing evidence that prevents a verified result.

### Missing Destination

The supplied evidence that the destination epic base does not exist.

### Successful Merge

The successful result of merging the fetched source into the checked-out branch.

## Guidance

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
- eg `#944 W02: E00:W01 #9 3f2a1c0d9b1e available at origin/i07/e01/main 8c4d2e7a1f30`.

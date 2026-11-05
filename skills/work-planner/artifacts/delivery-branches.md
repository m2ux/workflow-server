# Delivery Branches

The long-lived branches, epic bases and task branches used for delivery.

## Prerequisites

Read these files first.

- [Work Item](work-item.md)
- [Hot-fix](hotfix.md)

## Operations

### Prepare Delivery Bases

The branches a task pull request targets.

**Inputs:** [Project Checkout](#project-checkout), [Epic Identity](#epic-identity), [Changed Branches](#changed-branches), [Prerequisite Evidence](#prerequisite-evidence).

**Outputs:** [Epic-Base Names](#epic-base-names), [Failure](#failure).

#### 1. Read Changed Branches

For each changed long-lived branch, Apply [Fetch Remote Branch](#fetch-remote-branch) in the project checkout, then Apply [List Long-Lived Branches](#list-long-lived-branches) with `--project` set to the checkout and `--revision` to that remote branch, such as `origin/main`, as [Branches](#branches) names for base preparation.

#### 2. List Existing Epic Bases

Apply [List Epic Bases](#list-epic-bases) in the project checkout for the epic.

#### 3. Resolve Missing Branch Configuration

If `config/branches` is missing or empty at that revision, or does not name the changed branch:
- Report the names as unevaluable at that revision.
- Obtain the project's branch names before creating delivery branches.

#### 4. Require Confirmed Prerequisites

Require the caller's confirmed prerequisite evidence before creating a base. The board status alone supplies no such evidence.

#### 5. Create Missing Epic Bases

Apply [Create Epic Base](#create-epic-base) in the project checkout for each missing base, passing the corresponding long-lived branch, epic base name and confirmed prerequisite evidence.

### Create Epic Base

The missing epic branch rooted in its remote long-lived branch.

**Inputs:** [Project Checkout](#project-checkout), [Source Branch](#source-branch), [Epic-Base Name](#epic-base-name), [Prerequisite Evidence](#prerequisite-evidence).

**Outputs:** [Branch Result](#branch-result), [Failure](#failure).

#### 1. Require Missing Destination

Require the confirmed prerequisites and a missing destination. Refuse a destination that already exists.

#### 2. Fetch Long-Lived Source

Apply [Fetch Remote Branch](#fetch-remote-branch) in the project checkout with the corresponding long-lived source branch, such as `main`.

#### 3. Publish Missing Epic Base

After a successful fetch:
- Apply [Publish Epic Base](#publish-epic-base) in the project checkout with that remote source and the missing epic base name, such as `i07/e00/main`, meeting [Epic Bases](#epic-bases).
- Return the created branch or the failure.

### Update Epic Base

The current long-lived target merged into an epic base.

**Inputs:** [Project Checkout](#project-checkout), [Epic-Base Name](#epic-base-name).

**Outputs:** [Branch Result](#branch-result), [Failure](#failure).

#### 1. Resolve Epic Target

Take the long-lived target and the epic base checkout's path from the base name, meeting [Epic Bases](#epic-bases).

#### 2. Fetch Current Epic Base

Apply [Fetch Remote Branch](#fetch-remote-branch) in the project checkout with that epic base; stop on failure.

#### 3. Prepare Epic Base Checkout

Apply [Add Epic Base Worktree](#add-epic-base-worktree) in the project checkout for an absent epic base checkout, and reuse an existing one; stop on failure, which a base checked out elsewhere returns.

#### 4. Fetch Long-Lived Target

Apply [Fetch Remote Branch](#fetch-remote-branch) in the epic base checkout with the long-lived target, such as `main`; stop on failure.

#### 5. Merge Current Target

Apply [Merge Remote Branch](#merge-remote-branch) in the epic base checkout with the target branch name, such as `main`, to merge `origin/main`. A conflict stops the update, leaves the pull request open and is reported.

#### 6. Publish Updated Epic Base

After a successful merge:
- Apply [Push Epic Base](#push-epic-base) in the epic base checkout.
- Return the updated branch or the failure.

### Update Task Branch

The current base merged into a unit's task branch.

**Inputs:** [Unit Checkout](#unit-checkout), [Task Branch](#task-branch), [Base Branch](#base-branch).

**Outputs:** [Branch Result](#branch-result), [Failure](#failure).

#### 1. Fetch Current Task Base

Apply [Fetch Remote Branch](#fetch-remote-branch) in the unit checkout with the base, such as `i07/e00/main`.

#### 2. Stop on Fetch Failure

Stop on failure.

#### 3. Merge Current Task Base

Apply [Merge Remote Branch](#merge-remote-branch) in the unit checkout with the base name, such as `i07/e00/main`, to merge `origin/i07/e00/main`. A conflict stops the update, leaves the pull request open and is reported.

#### 4. Publish Updated Task Branch

After a successful merge:
- Apply [Push Task Branch](#push-task-branch) in the unit checkout with the task branch as destination.
- Return the updated branch or the failure.

### Create Task Worktree

The worktree and branch one unit's session works in.

**Inputs:** [Project Checkout](#project-checkout), [Worktree Path](#worktree-path), [Task Branch](#task-branch), [Base Branch](#base-branch), [Prerequisite Evidence](#prerequisite-evidence).

**Outputs:** [Worktree Result](#worktree-result), [Failure](#failure).

#### 1. Require Unit Prerequisites

Require the supplied prerequisites and names meeting [Task Branches](#task-branches).

#### 2. Fetch Task Base

Apply [Fetch Remote Branch](#fetch-remote-branch) in the project checkout of the repository the work changes, passing the base; stop on failure.

#### 3. Add Unit Worktree

Apply [Add Task Worktree](#add-task-worktree) in the project checkout with the supplied path and task branch, rooted in the fetched base.

#### 4. Return Unit Checkout

Return the worktree path, branch and base, or the failure.

A unit that changes several long-lived branches runs this once for each epic base, with the branch and worktree [Task Branches](#task-branches) names for it.

### Create Pull Request Worktree

The detached worktree where the graph reads the reviewed change.

**Inputs:** [Project Checkout](#project-checkout), [Pull Request Number](#pull-request-number), [Verified Head](#verified-head).

**Outputs:** [Worktree Result](#worktree-result), [Failure](#failure).

#### 1. Fetch Verified Review Head

Apply [Fetch Review Head](#fetch-review-head) in the project checkout of the repository the pull request changes, passing its number; stop on failure.

#### 2. Resolve Fetched Review Commit

Apply [Read Checkout Revision](#read-checkout-revision) on the project checkout for `FETCH_HEAD`.

#### 3. Check Verified Head

If it differs from the verified head, return a changed-head finding before creating a worktree.

#### 4. Place Review Worktree

Take the worktree path from the pull request number, meeting [Review Worktrees](#review-worktrees).

#### 5. Check Existing Review Worktree

If that worktree already exists:
- Apply [Read Checkout Revision](#read-checkout-revision) in that review checkout for `HEAD`.
- Apply [Read Checkout Status](#read-checkout-status) there.
- Reuse it only at the verified head and when its status reports detached HEAD with no tracked or untracked changes.
- Otherwise retain it and select an unused path suffixed with the verified commit.

#### 6. Add Detached Review Worktree

For an unused path, Apply [Add Review Worktree](#add-review-worktree) in the project checkout with that path and the verified commit.

#### 7. Confirm Review Checkout Head

Apply [Read Checkout Revision](#read-checkout-revision) in the selected review checkout for `HEAD` to confirm its commit.

#### 8. Return Review Checkout

Return the selected detached worktree path and head, or the discrepancy before measuring.

### Read Target Requirements

The protection and active rules governing one target branch.

**Inputs:** [Repository](#repository), [Target Branch](#target-branch), [Output Files](#output-files).

**Outputs:** [Target Requirements](#target-requirements), [Failure](#failure).

#### 1. Fetch Target Protection

Apply [Fetch Branch Protection](#fetch-branch-protection) for the supplied target.

#### 2. Fetch Active Target Rules

Apply [Fetch Active Branch Rules](#fetch-active-branch-rules) for the same target.

#### 3. Return Target Requirements

Return both records. An unreadable requirement remains unresolved; a protection 404 does not establish the absence of active rules.

### Read Delivery Branches

The configured long-lived branches and existing epic bases.

**Inputs:** [Project Checkout](#project-checkout), [Epic Identity](#epic-identity), [Revision](#revision).

**Outputs:** [Branch Names](#branch-names), [Epic-Base Names](#epic-base-names), [Failure](#failure).

#### 1. Read Declared Branch Names

Apply [List Long-Lived Branches](#list-long-lived-branches) with the supplied checkout and revision. Absent, empty or unreadable configuration at that revision leaves branch names unevaluable, reported with its source.

#### 2. List Current Epic Bases

Apply [List Epic Bases](#list-epic-bases) in the project checkout for the supplied epic.

#### 3. Return Delivery Branches

Return both collections and any missing configuration.

### List Epic Bases

Prints one epic's base branch names, one per line.

**Inputs:** [Project Checkout](#project-checkout), [Epic Identity](#epic-identity).

**Outputs:** [Epic-Base Names](#epic-base-names), [Failure](#failure).

#### 1. List Epic Bases

**Acts on:** the checkout it runs in.

- A base is `<epic-branch-prefix>/<name>` whose `<name>` is a [long-lived branch](#branches), named as [Epic Bases](#epic-bases) states.
- The prefix has the form `i<initiative-number>/e<epic-number>`. **Example:** `i07/e00`; a corresponding base is `i07/e00/main`.

<big><pre>
git ls-remote --heads origin 'refs/heads/[**<epic-branch-prefix>**](#epic-identity)/*' | cut -f2 | sed 's|refs/heads/||'
</pre></big>

**Example:**

<big><pre>
git ls-remote --heads origin 'refs/heads/i07/e00/*' | cut -f2 | sed 's|refs/heads/||'
</pre></big>

### List Long-Lived Branches

Prints the long-lived branch names, one per line.

**Inputs:** [Workspace](#workspace), [Project Checkout](#project-checkout), [Revision](#revision).

**Outputs:** [Branch Names](#branch-names), [Failure](#failure).

#### 1. List Long-Lived Branches

- The names meet [Branches](#branches).
- `--project` is any checkout of the project. `--revision` is the evaluated revision [Branches](#branches) names for the run.
- The names are the ones `config/branches` states at the commit `--revision` resolves to. Standard error carries their source: the configuration path, that commit and the repository.
- `--names` reads one `--revision`.
- An absent, empty or unreadable statement, or a revision resolving to no commit, prints `unevaluable:` with the source and why, and exits 1.

<big><pre>
cd "[**<workspace>**](#workspace)" && "[**<workspace>**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/sync.py --names --project '[**<checkout>**](#project-checkout)' --revision '[**<revision>**](#revision)'
</pre></big>

**Example:**

<big><pre>
cd "[**<workspace>**](#workspace)" && "[**<workspace>**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/sync.py --names --project '[**<checkout>**](#project-checkout)' --revision origin/i07/e00/main
</pre></big>

### Fetch Remote Branch

Fetches one source branch from origin.

**Inputs:** [Checkout](#checkout), [Source Branch](#source-branch).

**Outputs:** [Branch Result](#branch-result), [Failure](#failure).

#### 1. Fetch Remote Branch

**Acts on:** the checkout it runs in.

<big><pre>
git fetch origin '[**<source-branch>**](#source-branch)'
</pre></big>

### Publish Epic Base

Creates a remote epic base from the fetched source branch.

**Inputs:** [Project Checkout](#project-checkout), [Source Branch](#source-branch), [Epic-Base Name](#epic-base-name), [Prerequisite Evidence](#prerequisite-evidence), [Missing Destination](#missing-destination).

**Outputs:** [Branch Result](#branch-result), [Failure](#failure).

#### 1. Publish Epic Base

**Acts on:** the checkout it runs in.

<big><pre>
git push origin 'origin/[**<source-branch>**](#source-branch):refs/heads/[**<epic-base>**](#epic-base-name)'
</pre></big>

### Merge Remote Branch

Merges one fetched remote branch into the branch of the checkout it runs in.

**Inputs:** [Checkout](#checkout), [Source Branch](#source-branch).

**Outputs:** [Branch Result](#branch-result), [Failure](#failure).

#### 1. Merge Remote Branch

**Acts on:** the checkout it runs in.

<big><pre>
git merge --no-edit 'origin/[**<source-branch>**](#source-branch)'
</pre></big>

### Push Epic Base

Pushes the epic base checked out where it runs to its configured upstream.

**Inputs:** [Checkout](#checkout), [Successful Merge](#successful-merge).

**Outputs:** [Branch Result](#branch-result), [Failure](#failure).

#### 1. Push Epic Base

**Acts on:** the checkout it runs in.

<big><pre>
git push
</pre></big>

### Push Task Branch

Pushes the head of the checkout it runs in to its named remote task branch.

**Inputs:** [Unit Checkout](#unit-checkout), [Task Branch](#task-branch), [Successful Merge](#successful-merge).

**Outputs:** [Branch Result](#branch-result), [Failure](#failure).

#### 1. Push Task Branch

**Acts on:** the checkout it runs in.

<big><pre>
git push origin 'HEAD:refs/heads/[**<task-branch>**](#task-branch)'
</pre></big>

**Example:**

<big><pre>
git push origin HEAD:refs/heads/i07/e00/w01-queue-plan
</pre></big>

### Add Task Worktree

Creates a task branch and worktree at the fetched base.

**Inputs:** [Project Checkout](#project-checkout), [Worktree Path](#worktree-path), [Task Branch](#task-branch), [Base Branch](#base-branch), [Prerequisite Evidence](#prerequisite-evidence).

**Outputs:** [Worktree Result](#worktree-result), [Failure](#failure).

#### 1. Add Task Worktree

**Acts on:** the checkout it runs in.

- The path resolves against the directory the command runs in, so supply it as [Task Branches](#task-branches) anchors it rather than relative to a linked worktree.

<big><pre>
git worktree add '[**<worktree-path>**](#worktree-path)' -b '[**<task-branch>**](#task-branch)' 'origin/[**<base>**](#base-branch)'
</pre></big>

**Example:**

<big><pre>
git worktree add .worktrees/i07/e00/w01-queue-plan -b i07/e00/w01-queue-plan origin/i07/e00/main
</pre></big>

### Fetch Review Head

Fetches one pull request head into FETCH_HEAD.

**Inputs:** [Project Checkout](#project-checkout), [Pull Request Number](#pull-request-number).

**Outputs:** [Checkout Commit](#checkout-commit), [Failure](#failure).

#### 1. Fetch Review Head

**Acts on:** the checkout it runs in.

<big><pre>
git fetch origin 'pull/[**<pull-request-number>**](#pull-request-number)/head'
</pre></big>

**Example:**

<big><pre>
git fetch origin pull/950/head
</pre></big>

### Add Epic Base Worktree

Creates the worktree for an existing epic base.

**Inputs:** [Project Checkout](#project-checkout), [Worktree Path](#worktree-path), [Epic-Base Name](#epic-base-name).

**Outputs:** [Worktree Result](#worktree-result), [Failure](#failure).

#### 1. Add Epic Base Worktree

**Acts on:** the checkout it runs in.

- The path resolves against the directory the command runs in, so supply it as [Epic Bases](#epic-bases) anchors it rather than relative to a linked worktree.

<big><pre>
git worktree add '[**<worktree-path>**](#worktree-path)' '[**<epic-base>**](#epic-base-name)'
</pre></big>

**Example:**

<big><pre>
git worktree add .worktrees/i07/e00/main i07/e00/main
</pre></big>

### Add Review Worktree

Creates a detached worktree at the fetched review head.

**Inputs:** [Project Checkout](#project-checkout), [Worktree Path](#worktree-path), [Verified Head](#verified-head).

**Outputs:** [Worktree Result](#worktree-result), [Failure](#failure).

#### 1. Add Review Worktree

**Acts on:** the checkout it runs in.

- The path resolves against the directory the command runs in, so supply it as [Review Worktrees](#review-worktrees) anchors it rather than relative to a linked worktree.

<big><pre>
git worktree add --detach '[**<worktree-path>**](#worktree-path)' '[**<head-commit>**](#verified-head)'
</pre></big>

### Fetch Branch Protection

Saves the target branch protection response.

**Inputs:** [Repository](#repository), [Target Branch](#target-branch), [Output Files](#output-files).

**Outputs:** [Target Requirements](#target-requirements), [Failure](#failure).

#### 1. Fetch Branch Protection

<big><pre>
gh api 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/branches/[**<target-branch>**](#target-branch)/protection' > '[**<branch-protection-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/branches/main/protection' > protection.json
</pre></big>

### Fetch Active Branch Rules

Saves every active rule for the target branch.

**Inputs:** [Repository](#repository), [Target Branch](#target-branch), [Output Files](#output-files).

**Outputs:** [Target Requirements](#target-requirements), [Failure](#failure).

#### 1. Fetch Active Branch Rules

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/rules/branches/[**<target-branch>**](#target-branch)' > '[**<branch-rules-file>**](#output-files)'
</pre></big>

**Example:**

<big><pre>
gh api --paginate 'repos/[**<owner>**](#repository)/[**<repo>**](#repository)/rules/branches/main' > branch-rules.json
</pre></big>

### Read Checkout Revision

Resolves one revision to its commit in the selected checkout.

**Inputs:** [Checkout](#checkout), [Revision](#revision).

**Outputs:** [Checkout Commit](#checkout-commit), [Failure](#failure).

#### 1. Read Checkout Revision

<big><pre>
git -C '[**<checkout>**](#checkout)' rev-parse '[**<revision>**](#revision)^{commit}'
</pre></big>

### Read Checkout Status

Reports branch or detached-HEAD state and tracked and untracked changes in one checkout.

**Inputs:** [Checkout](#checkout).

**Outputs:** [Checkout Status](#checkout-status), [Failure](#failure).

#### 1. Read Checkout Status

<big><pre>
git -C '[**<checkout>**](#checkout)' status --porcelain --branch
</pre></big>

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

The initiative and epic identifier, with an epic branch prefix of `i<initiative-number>/e<epic-number>`; **Example:** `i07/e00`.

### Changed Branches

The long-lived branches the unit changes.

### Prerequisite Evidence

The caller’s confirmed evidence that the prerequisite epics are completed with every delivery base merged.

### Source Branch

The source branch name without the `origin/` prefix.

### Epic-Base Name

The full epic-base branch name.

### Task Branch

The destination task branch name.

### Base Branch

The fetched base from which the task branch is rooted.

### Worktree Path

The caller-composed lasting path, resolved against the checkout running the command and placed under the project’s worktree directory.

### Pull Request Number

The repository-local pull request number.

### Verified Head

The literal verified head commit used to read a reviewed change.

### Target Branch

The long-lived target branch whose current protection and active rules govern readiness.

### Output Files

Destination paths for the requested protection and active-rule responses.

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

### Failure

The operation and error, discrepancy or missing evidence that prevents a verified result.

### Missing Destination

The supplied evidence that the destination epic base does not exist.

### Successful Merge

The successful result of merging the fetched source into the checked-out branch.

# Planning Record

A planning record is a folder. README.md is its entry point: it answers what the work is, and links to every other artifact the plan produces. Each artifact is the home of its own content. The progress of the work is the theme's project board.

## Prerequisites

Read these files first.

- [Planning Records Configuration](../configuration.md#planning-records)

## Operations

### Populate Planning Record

One planning directory and its artifact inventory.

#### 1. Prepare Selected Record

- Prepare the directory in [Record Selection](#record-selection "○") using the matching branch.

##### New Record

- Apply [Add Planning Record](#add-planning-record "ƒ") with the engineering checkout and supplied planning-folder path.
- Populate README.md from the [Template](#template).

##### Existing Record

- Read its README, retaining its creation date, other artifacts and links.
- Update only the supplied content.

##### Common Record Conditions

- The folder must meet [Layout](#layout).
- All populated README fields must meet [Fields](#fields).

#### 2. Register Supplied Artifacts

- Register the artifact files supplied by the caller, using their chosen names.
- Each file must have a row meeting [Layout](#layout) and [Artifacts](#artifacts).
- File content remains supplied by the caller; this operation does not author that artifact's content.

#### 3. Provide Populated Planning Record

Provide [Planning Folder](#planning-folder "●") with the populated record and registered artifacts.

### Publish Planning Record

The record's folder committed and pushed, so every link into it resolves for a reader.

#### 1. Find Engineering Checkout

Apply [Find Engineering Worktree](#find-engineering-worktree "ƒ") for [Planning Folder](#planning-folder "○").

#### 2. Publish Planning Files

- Apply [Commit Planning Record](#commit-planning-record "ƒ") using [Commit Message File](#commit-message-file "○").
- Confirm the files this record wrote reached `origin/engineering`, meeting [Shared Worktree](#shared-worktree).
- Report a rebase that stops on a conflict rather than rewriting the branch.

#### 3. Provide Published Planning Record

Provide [Publication Result](#publication-result "●") after confirming publication, or with the conflict that prevents it.

### Find Engineering Worktree

Prints the checkout holding the engineering branch, which is where every planning record is written.

#### 1. Find Engineering Worktree

- Run the following command using [Project Checkout](#project-checkout "○").

- The engineering branch has one long-lived worktree and takes no further one.

<big><pre>
git -C '[**&lt;checkout&gt;**](#project-checkout)' worktree list | grep '\&#91;engineering\&#93;'
</pre></big>

#### 2. Provide Located Engineering Worktree

Provide [Engineering Worktree](#engineering-worktree "●") to the requester.

### Commit Planning Record

Commits everything pending in the engineering worktree and publishes the branch, so every record's links resolve.

#### 1. Commit Planning Record

- Run the following command using [Engineering Worktree](#engineering-worktree "○"), [Commit Message File](#commit-message-file "○").

- It stages the whole worktree, commits only when anything is staged, rebases on `origin/engineering` and pushes. A run with nothing new leaves the branch unchanged, so any session runs it at any time. See [Shared Worktree](#shared-worktree).
- Planning records go straight to the branch; they take no pull request.
- Pass the message through a file outside the worktree; the worktree is a linked one, so git writes here run unsandboxed.

<big><pre>
cd '[**&lt;engineering-worktree&gt;**](#engineering-worktree)' && git add -A && (git diff --cached --quiet || git commit -F '[**&lt;message-file&gt;**](#commit-message-file)') && git fetch origin engineering && git rebase origin/engineering && git push
</pre></big>

**Example:**

<big><pre>
cd .engineering && git add -A && (git diff --cached --quiet || git commit -F /tmp/msg.txt) && git fetch origin engineering && git rebase origin/engineering && git push
</pre></big>

#### 2. Provide Commit Planning Record

Provide [Publication Result](#publication-result "●") to the requester.

### Add Planning Record

Adds the folder for one planning record on the long-lived engineering worktree.

#### 1. Add Planning Record

- Run the following command using [Engineering Worktree](#engineering-worktree "○"), [Planning Folder](#planning-folder "○").

- `<planning-folder-path>` is `<yyyy-mm-dd>[-<ref>]-<slug>/` under the [configured planning directory](../configuration.md#planning-records). The date is the day the record is opened.
- `<ref>` is the bare number of the issue or the pull request the record is for. A record for ad hoc work, which has neither, has no ref segment.
- The slug is lowercase words separated by hyphens, a short name of the work.
- The folder's files are the [planning layout](planning-record.md#layout).
- Edits are made on that worktree. The engineering branch takes no further worktree and no branch.

<big><pre>
mkdir -p '[**&lt;planning-folder-path&gt;**](#planning-folder)'
</pre></big>

**Example:**

<big><pre>
mkdir -p artifacts/planning/2026-10-15-950-queue-plan
</pre></big>

#### 2. Provide Added Planning Record

Provide [Planning Folder](#planning-folder "●") to the requester.

## Fields

### Template

```markdown
# [Descriptive name] — [Month Year]

> [Classifier] · Created [YYYY-MM-DD]

## Executive Summary

[Two paragraphs on the purpose of this work and why it matters.]

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Name](file.md) | What this artifact holds |

## Links

| Resource | Link |
| --- | --- |
| [External reference] | [link] |
```

### Shared Worktree

The engineering branch has one worktree and every session writes its records there, so they share one index. A commit on engineering may include other sessions' uncommitted or unpushed work, a `design.md` amendment among them. A session confirms only that its own files reached `origin/engineering` after the push.

### Layout

README.md is the one file the folder must hold. Any file beyond README.md is added as the work needs it.

```text
./
├── README.md
└── …
```

Each file beyond README.md is a row in the README's Artifacts.

A plan's draft issue bodies and its work items are files of its record. Each draft is the source every later edit and save of its issue reads, and it reaches readers through [Publish Planning Record](#publish-planning-record "ƒ").

### Header

One blockquote: the classifier, the day the record was created, and a revised date when the README is updated after the work is done.

### Executive Summary

Two paragraphs: the purpose of this work, and why it matters.

### Artifacts

- One row for every artifact in the record other than README.md, added when the file is produced.
- The link sits on the artifact's name. The row says what the artifact holds, and the artifact is the home of that content.

### Links

External references only: a tracker issue, a parent epic, a pull request. An artifact of this plan is an Artifacts row.

### Record Selection

The supplied record identity, folder path, artifact files and external links.

### Planning Folder

The supplied folder path and its registered artifact files, meeting [Layout](#layout). A new folder is absent until created.

### Engineering Worktree

The checkout holding the engineering branch, as an absolute path.

### Project Checkout

Any supplied checkout of the project.

### Commit Message File

The supplied local file holding the exact commit message.

### Publication Result

The published planning files and confirmed remote branch, or a stopped publication with its conflict or other blocker.

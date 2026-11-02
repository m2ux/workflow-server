# Planning Record

A planning record is a folder. README.md is its entry point: it answers what the work is, and links to every other artifact the plan produces. Each artifact is the home of its own content. The progress of the work is the theme's project board.

## Operations

### *Populate* Planning Record

One planning directory and its artifact inventory.

**Inputs:** Record identity, folder path and supplied artifact files and links.

1. Prepare the selected record:
   - For a new record:
     - Create the folder with [Add Planning Record](#add-planning-record).
     - Populate README.md from the [Template](#template).
   - For an existing record:
     - Read its README, retaining its creation date, other artifacts and links.
     - Update only the supplied content.
   - The folder must meet [Layout](#layout).
   - All populated README fields must meet [Fields](#fields).
2. Register the artifact files supplied by the caller, using their chosen names.
   - Each file must have a row meeting [Layout](#layout) and [Artifacts](#artifacts).
   - File content remains supplied by the caller; this operation does not author that artifact's content.


### *Publish* Planning Record

The record's folder committed and pushed, so every link into it resolves for a reader.

**Inputs:** Planning-folder path, the files written into it and a commit message file.

1. Run [Find Engineering Worktree](#find-engineering-worktree) for the path the record is written on.
2. Run [Commit Planning Record](#commit-planning-record).
   - Confirm the files this record wrote reached `origin/engineering`, meeting [Shared Worktree](#shared-worktree).
   - Report a rebase that stops on a conflict rather than rewriting the branch.

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

A plan's draft issue bodies and its work items are files of its record. Each draft is the source every later edit and save of its issue reads, and it reaches readers through [Publish Planning Record](#publish-planning-record).

### Header

One blockquote: the classifier, the day the record was created, and a revised date when the README is updated after the work is done.

### Executive Summary

Two paragraphs: the purpose of this work, and why it matters.

### Artifacts

- One row for every artifact in the record other than README.md, added when the file is produced.
- The link sits on the artifact's name. The row says what the artifact holds, and the artifact is the home of that content.

### Links

External references only: a tracker issue, a parent epic, a pull request. An artifact of this plan is an Artifacts row.

## Commands

### Find Engineering Worktree

Prints the checkout holding the engineering branch, which is where every planning record is written.

**Inputs:** Any checkout of the project.

- The engineering branch has one long-lived worktree and takes no further one.

```bash
git -C '<checkout>' worktree list | grep '\[engineering\]'
```

### Commit Planning Record

Commits everything pending in the engineering worktree and publishes the branch, so every record's links resolve.

**Inputs:** Engineering worktree and a commit message file.

- It stages the whole worktree, commits only when anything is staged, rebases on `origin/engineering` and pushes. A run with nothing new leaves the branch unchanged, so any session runs it at any time. See [Shared Worktree](#shared-worktree).
- Planning records go straight to the branch; they take no pull request.
- Pass the message through a file outside the worktree; the worktree is a linked one, so git writes here run unsandboxed.

```bash
cd '<engineering-worktree>' && git add -A && (git diff --cached --quiet || git commit -F '<message-file>') && git fetch origin engineering && git rebase origin/engineering && git push
```

**Example:**

```bash
cd .engineering && git add -A && (git diff --cached --quiet || git commit -F /tmp/msg.txt) && git fetch origin engineering && git rebase origin/engineering && git push
```

### Add Planning Record

Adds the folder for one planning record on the long-lived engineering worktree.

**Inputs:** Engineering worktree and planning-folder path composed from the date, optional issue or pull request number, and slug.

- `<planning-folder-path>` is `artifacts/planning/<yyyy-mm-dd>[-<ref>]-<slug>/`. The date is the day the record is opened.
- `<ref>` is the bare number of the issue or the pull request the record is for. A record for ad hoc work, which has neither, has no ref segment.
- The slug is lowercase words separated by hyphens, a short name of the work.
- The folder's files are the [planning layout](planning-record.md#layout).
- Edits are made on that worktree. The engineering branch takes no further worktree and no branch.

```bash
mkdir -p '<planning-folder-path>'
```

**Example:**

```bash
mkdir -p artifacts/planning/2026-10-15-950-queue-plan
```

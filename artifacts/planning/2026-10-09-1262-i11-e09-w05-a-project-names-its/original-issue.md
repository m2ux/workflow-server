# Original Issue

> [Branch Statement: A Project Names Its Own Long-Lived Branches](https://github.com/m2ux/workflow-server/issues/1262) · opened 2026-10-08 · closed

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E09:W05] Branch Statement: A Project Names Its Own Long-Lived Branches` |
| Labels | `bug`, `type:task` |
| Opened | 2026-10-08 |
| State | closed |
| Assignee | m2ux |

## Body

## Overview

The long-lived branch names a run reads decide which branches an epic's work may reach and which bases a unit is delivered on. This task makes a project state those names in a file it owns, so a directory holding something else is never read as a branch list, and a run from a linked worktree reads the same statement as a run from the main working tree.

## Problem

- **The directory read is not reserved for branch names.**
  [`long_lived_names`](https://github.com/m2ux/workflow-server/blob/360f0081a6375bec8e430df1493e66eeb9262c98/skills/work-planner/scripts/sync.py#L601-L615) takes every subfolder of `.project` as a branch. A project whose `.project` holds sixteen component checkouts yields sixteen names, and its one long-lived branch is not among them.
- **The wrong set is answered confidently.**
  Nothing marks the reading unevaluable, so an epic's closability is settled against branches that do not exist, and the branch its work is delivered on is in neither the set nor the report.
- **A linked worktree has no path that answers.**
  A worktree carries no `.project` of its own, and the [integration-branch fallback](https://github.com/m2ux/workflow-server/blob/360f0081a6375bec8e430df1493e66eeb9262c98/skills/work-planner/scripts/sync.py#L612-L615) recognises a name only where an integration branch already carries it, so a unit's session is handed the main working tree by hand.

## Proposal

- **`config/branches` states the names.**
  A project names its long-lived branches in `config/branches` at its root, one name per line. The reading takes that file where it exists, and reads no directory entry as a branch.
- **A worktree resolves through its main tree.**
  A run resolves the main working tree from the checkout it is given and reads the statement that tree holds, so a linked worktree answers without a second path passed in.
- **The fallback is reported rather than guessed.**
  Where no statement exists and no integration branch names a branch, the set is unevaluable and the report names the statement that is missing, as the reading already does when the fallback yields nothing.
- **The callers take the one reading.**
  [`deliver.py`](https://github.com/m2ux/workflow-server/blob/360f0081a6375bec8e430df1493e66eeb9262c98/skills/work-planner/scripts/deliver.py#L219) and the [`--names`](https://github.com/m2ux/workflow-server/blob/360f0081a6375bec8e430df1493e66eeb9262c98/skills/work-planner/scripts/sync.py#L675-L690) path reach the branch names through it, and this repository's statement names `docker`, `main` and `workflows`.

## Acceptance Criteria

- [x] **AC1.** `sync.py --names` returns the branches a project's `config/branches` states and no directory entry beside them, as the skill's fixture suite shows against a project whose `.project` holds component checkouts.
- [x] **AC2.** `sync.py --names` run from a linked worktree returns the set its main working tree returns, as the skill's fixture suite shows against a worktree of one project.
- [x] **AC3.** A project stating no long-lived branches and carrying no integration branch naming one is reported unevaluable, naming the statement that is missing, as the skill's fixture suite shows against such a project.

## References

- **R1.** [Long-Lived Branch Reading](https://github.com/shieldedtech/midnight-agent-eng/issues/80) — The reading as it was met from both paths while delivering a unit, with the sixteen names it returned.
- **R2.** [Work Planner Scripts](https://github.com/m2ux/workflow-server/tree/workspace/skills/work-planner/scripts) — The reading, its callers and the fixture suite that keeps them.

---
*AI assistance: this issue was substantively produced with AI tooling.*


## Comment 1

> m2ux · 2026-10-09

The body before this issue took the [I11:E09:W05] layout:

## Overview

Work Planner reads a project's long-lived branches from the subfolder names of a `.project` directory in the main working tree. A project whose `.project` holds something other than one folder per branch is read confidently and wrongly, and a session running from a linked worktree has no path that answers at all. This issue asks for a reading a project states for itself.

## Problem

- **The directory it reads is not reserved for branch names.**
  In <project-redacated> `.project` holds sixteen component clones — <names-redacted> and thirteen more. That repository's one long-lived branch, `workflows`, is not among them.
- **The reading answers confidently with the wrong set.**
  `sync.py --project` takes those subfolder names as the long-lived branches rather than reporting the set unevaluable. An epic's closability is then settled against branches that do not exist, and the branch its work is delivered on is in neither the set nor the report.
- **A linked worktree is refused outright.**
  A worktree carries no `.project` of its own, and the integration-branch fallback recognises a name only where an integration branch already carries it. A session delivering a unit therefore has no path that answers correctly, and must be handed the main working tree by hand.

## Proposal

- **The project states its own long-lived branches.**
  A file the project owns names them, and the reading takes that file where it exists, so a directory holding something else is never read as a branch list.
- **The fallback is reported rather than guessed.**
  Where no such file exists and no integration branch names a branch, the set is unevaluable and the report names what is missing, as the reading already does for a worktree.
- **A linked worktree resolves through its main tree.**
  A command run from a worktree reads the project statement its main working tree holds, so a unit's session answers without a second path passed in.

## Acceptance Criteria

- [ ] **AC1.** `sync.py --project` names a project's long-lived branches from the statement that project holds, and names no directory entry that is not one, as a run against a project whose `.project` holds component checkouts shows.
- [ ] **AC2.** `sync.py --project` run from a linked worktree reports the same set as a run from its main working tree, as two runs over one epic show.
- [ ] **AC3.** A project that states no long-lived branches and carries no integration branch naming one is reported unevaluable, naming what is missing, as a run against such a project shows.

## References

- **R1.** [Long-Lived Branch Reading](https://github.com/shieldedtech/midnight-agent-eng/issues/80) — The reading as it was met from both paths while delivering a unit, with the sixteen names it returned.

---
*AI assistance: this issue was substantively produced with AI tooling.*



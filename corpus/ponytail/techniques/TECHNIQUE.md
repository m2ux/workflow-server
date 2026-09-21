---
metadata:
  version: 3.0.0
---

## Capability

Holds the lean-coding contract: what the pass is working on, how strict a lens it runs under, and the discipline every operation in the set applies.

## Inputs

### task_description

The coding task, change, or audit target to be made lean.

### target_path

Path to the code or repo under the lazy lens.

#### default

`.`

### artifact_dir

Directory the pass writes its artifacts into.

#### default

`.ponytail`

### lazy_intensity

Strictness of the lazy lens: `lite`, `full`, or `ultra`.

#### default

`full`

### pass_scope

Breadth of the pass — `change` (diff-scoped) or `repo` (whole-tree).

#### default

`change`

## Rules

### trailing-prose-is-capped

The code leads, and the lines that follow it name what was skipped and the trigger that would justify adding it — at most three of them, and never longer than the code they follow. A paragraph defending a simplification is complexity smuggled back in as prose.

### no-unrequested-prose

Produce no unrequested explanation, summary, or documentation. Explanation the user asked for — a report, a walkthrough, per-phase notes — is a requested artifact and is given in full.

### boring-over-clever

Prefer boring over clever — clever is what someone decodes at 3am — and the fewest files the change can occupy.

### shortest-diff-once-understood

The shortest diff wins only once the problem is understood. The smallest change in the wrong place is not lazy; it is a second bug.

### no-scaffolding-for-later

No boilerplate or scaffolding built "for later" — later can scaffold for itself.

### correct-on-edge-cases

When two options at the same rung are equal in size, take the one that is correct on edge cases. Lazy means writing less code, not picking the flimsier algorithm.

### report-only-no-apply

Only the climb changes code. Every other operation writes what it found into its own artifact and leaves the tree untouched.

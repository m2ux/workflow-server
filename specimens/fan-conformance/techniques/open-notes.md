---
metadata:
  version: 1.0.0
---

## Capability

Choose the probed directories worth a committed note, and name each choice so its writer has a branch, a slot and an identity of its own.

## Inputs

### probe_directory_outputs

The probe container: one slot per entry of `{probe_targets}`, each carrying what that instance found.

## Outputs

### has_notes

Whether any probe found something worth committing. False where none did, which is what routes the run past the writers.

### note_targets

One entry per note, in probe order.

#### id

The note's designator, `N1` through `Nn`. Names its slot in the branch container, its row in the gather manifest, and the instance that writes it.

#### directory

The directory the note covers, copied from the probe whose finding earned it.

#### finding

The one thing about that directory worth committing — the largest file, an unexpected subdirectory count, or whatever the probe surfaced that a reader would want recorded.

#### branch

The branch this note's writer commits on, `fan-note-<id>`. Derived from the entry's own designator, which is unique across the roster by construction, so no two writers can name one branch.

#### worktree

The checkout that writer works in, a path of its own under the planning folder named for the same designator. Git registers one checkout per path, so two writers naming one path would be asking for a checkout that cannot exist twice.

## Protocol

### 1. Read What The Probes Found

- Walk `{probe_directory_outputs}` in order. Each slot holds one probe's finding for one directory; a slot with no values is an instance that did not report, and it contributes no note rather than an empty one.

### 2. Choose What Is Worth Committing

- Take the probes whose finding says something a reader would want recorded, and leave the rest. A note per probe by reflex makes the run's commits a count of the fan's width; a note per finding makes them evidence.
- Where every probe found something ordinary, choose none and emit an empty `{note_targets}`. The exit that fans over it refuses an empty collection, so the graph routes past the notes rather than opening writers with nothing to write — see [an-empty-choice-routes-past](#an-empty-choice-routes-past).

### 3. Name Each Note

- Emit `{note_targets}` in probe order, each entry carrying `id` (`N1`-`Nn`), `directory`, the `finding` that earned it, and the `branch` and `worktree` derived from that id. The designator is what makes them collision-free, and deriving them here rather than inside each writer is what lets the writer's first step be the one that materialises the checkout.
- Set `{has_notes}` true where that list holds anything and false where it is empty, which is the value the exit predicate reads.

## Rules

### an-empty-choice-routes-past

A fan of no instances is refused when it opens, because the activity the branches converge on would be entered with an activity the graph says runs having never run. Where nothing is worth a note, the exit whose predicate reaches the writers is not the exit taken, and the run continues past them with an empty container the convergence reads as no branches rather than as missing ones.

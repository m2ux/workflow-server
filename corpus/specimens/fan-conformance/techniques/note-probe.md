---
metadata:
  version: 1.1.0
---

## Capability

Write one note in a checkout of its own and commit it there, reporting the branch it landed on.

## Inputs

### note_target

This instance's own note: its designator at `id`, the directory it covers at `directory`, what its probe found at `finding`, and at `note_path` where the note goes inside this instance's checkout.

## Outputs

### note_path

The note file this instance wrote, which is the `note_path` it was handed — reported back so a writer that wrote somewhere else is visible at the convergence. It is the one path the commit step stages.

### note_message

The commit message for this note, naming the directory it covers so the branch reads as attributable without opening the file.

### note_commit

What this instance committed, and when it ran.

#### commit

The commit it landed, or empty where it had nothing to commit.

#### started_at

The instant this instance began, ISO 8601 UTC.

#### finished_at

The instant this instance finished, ISO 8601 UTC.

## Protocol

### 1. Write The Note

- Write `{note_target.finding}` as a short markdown note at `{note_target.note_path}` inside that checkout and nowhere else, and record that same path as `{note_path}`, with `{note_message}` naming the directory it covers. The path arrives already chosen, so every writer of a fan lands its note in the same place under its own designator; a writer that picks its own makes the run's layout a function of which instance ran. Siblings are writing their own checkouts at the same moment, and a write outside this one lands in a tree another instance is also changing, which is the arrangement a checkout of one's own exists to avoid.
- Record the commit the following step lands as `{note_commit.commit}`. Where the note turned out to say nothing worth committing, leave it empty and still report the branch — the activity the fan converges on accounts for an empty branch as an outcome rather than a gap.

### 2. Record The Interval

- Read the current instant and record it as `{note_commit.finished_at}`.

## Rules

### the-checkout-is-this-instance-s-alone

Every write this instance makes lands inside the checkout it materialised. That checkout is what makes its commit attributable: a commit derives its paths from the tree it runs in, so a write that escapes into the shared tree is attributed to whichever instance happens to commit next.

### the-branch-is-reported-not-assumed

The branch name goes into this instance's output rather than being left for the convergence to reconstruct. The convergence merges what the container names, so a branch it cannot see is a commit the run made and abandoned.

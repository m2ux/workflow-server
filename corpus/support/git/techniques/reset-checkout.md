---
metadata:
  version: 1.0.0
---

## Capability

Working tree returned to what its repository records — tracked modifications discarded and nested checkouts moved to the commits the tree names — with what was discarded answered back.

## Inputs

### repo_path

Working tree to return to its recorded state.

## Outputs

### discarded_paths

The tracked paths whose modifications the reset discarded, read before it ran. Empty where the tree already stood as its repository records it.

### nested_checkouts

Each nested checkout the reset moved, with the commit it stands at afterwards. Empty where the tree holds none, and where none had left the commit the tree names.

### reset_refusal

Why the tree was left as it stood. Null where the reset ran.

## Protocol

### 1. Read What the Reset Will Discard

- `git -C {repo_path} status --porcelain`, and record every tracked path it names as `{discarded_paths}`. This read comes before anything is written, because afterwards the modifications are gone and nothing else says what they were.
  > Where the command fails, the path is not a checkout: set `{reset_refusal}` naming it, leave the tree untouched, and stop.

### 2. Discard the Tracked Modifications

- `git -C {repo_path} restore --source=HEAD --staged --worktree .`, which returns every tracked path in the index and the worktree to the commit `HEAD` stands at. A path staged as an addition is removed; a path whose index entry differs from `HEAD` is returned to that commit.

### 3. Return the Nested Checkouts

- `git -C {repo_path} submodule update`, which moves each nested checkout the tree already holds to the commit this tree records for it, and record each one moved with that commit as `{nested_checkouts}`.
  > The update is asked without `--init`, so a nested checkout the tree has never populated stays absent rather than being cloned. Bringing one into existence is a different act from returning one to its recorded commit, and this technique performs only the second.

### 4. Confirm the Tree Stands Clean

- `git -C {repo_path} status --porcelain` again, which prints nothing once the reset has landed. Where it still prints tracked paths, set `{reset_refusal}` naming them: the reset ran and something the tree holds is not reached by it.

## Rules

### an-untracked-file-survives-a-reset

The reset reaches tracked modifications and nested checkout positions, and nothing else. A file the repository does not track is left where it stands, whatever it holds.

That is what lets configuration live beside a tree it is not committed to. A tool that pins its behaviour in a file next to the code, excluded through the repository's local exclude rather than its tracked ignore list, keeps that pin across every reset — and a reset that swept untracked files would remove the pin and restore the behaviour it was written to prevent.

### what-was-discarded-is-answered

What the reset discarded is read before it runs and answered afterwards, so a caller learns what the tree held. A reset that reports only that it succeeded leaves no record of the work it destroyed, and the tree it produces is indistinguishable from one that was already clean.

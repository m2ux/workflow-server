---
metadata:
  version: 1.0.0
---

## Capability

Bring the branches an isolated fan committed back onto one branch, in a stated order, reporting what merged cleanly and what did not.

## Inputs

### branches_to_merge

Ordered list of the branches to bring together, each `{ id, branch_name, worktree_path }` — the units' own records, in the order the collection named them.

### integration_branch

*(optional)* The branch the work is brought onto.

#### default

The branch the instances were created off, which is where their histories diverged and so the one their merges converge on. A caller names another only where the run is integrating somewhere other than it started.

## Outputs

### merge_report

What happened to each branch, in input order.

#### merged

Ids whose branch merged cleanly, with the resulting commit.

#### conflicted

Ids whose merge stopped on a conflict, each with the paths that conflicted and whether it was resolved here.

#### empty

Ids whose branch held no commit — a unit that ran and produced no change, which is a result and not a failure.

#### integration_head

The commit the integration branch points at once every branch has been dealt with.

## Protocol

### 1. Read What The Branches Hold

- For each entry in `{branches_to_merge}`, in order, read whether its branch holds any commit beyond the point it was created from. Record the ones that do not under `{merge_report.empty}` and carry on: a unit reporting no change is an outcome the fan is entitled to produce.

### 2. Merge In Order

- Check out `{integration_branch}` and merge each non-empty branch into it one at a time, in input order, so a conflict names one unit rather than a set. Record each clean merge under `{merge_report.merged}` with its commit.
- On a conflict, stop that merge and record the conflicting paths under `{merge_report.conflicted}`. Resolve it only where the resolution is mechanical and the intent of both sides survives — two units appending to one list, or edits to disjoint regions a rename made overlap. Leave anything else conflicted and named.
  > A conflict between two units is a statement that the work was not as independent as the fan assumed. Resolving it by preferring one side discards a unit's work silently, which is worse than reporting it.

### 3. Report Before Continuing

- Emit `{merge_report}` with every id accounted for under exactly one of merged, conflicted or empty, and `{merge_report.integration_head}` at the commit the integration branch now points at.

## Rules

### every-branch-is-accounted-for

Each id in `{branches_to_merge}` appears exactly once in the report. A fan pays for every branch it opens, so a branch missing from the report is work the run bought and lost track of — and the count is the only place that is visible, the branches having been committed in checkouts nothing else reads.

### a-conflict-is-reported-not-absorbed

An unresolved conflict is named with its paths and its unit, and the activity holding this operation decides what happens next. This operation never abandons a branch, never forces one side, and never leaves the integration branch mid-merge: an unresolved conflict is backed out of so the integration branch stands at a commit, with the conflict recorded.

### merge-order-is-the-collection-order

Branches merge in the order their collection named them, which is the order the container holds them in. It makes the result reproducible and it makes a conflict attributable to the later unit of a pair rather than to whichever happened to go first.

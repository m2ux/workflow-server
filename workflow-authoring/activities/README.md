# Workflow Authoring Activities

> Part of the [Workflow Authoring Workflow](../README.md)

Heading numbers match the on-disk `NN-` file prefixes. Prefixes are sparse by design: they are the server-computed artifact prefix and the activity sort key, so a gap costs nothing and a renumber renames artifacts.

This file is an orientation map. Authoritative definitions live in the per-activity YAML linked from each section below.

---

### 01. Intake and Context

Classifies the request as create, update or review, names the target, and derives the edit-surface path in every mode. Create and update runs seed the planning folder and produce a change brief; update runs additionally produce an impact classification and take approval for the removals it inventories. Gate 1 fires only when intent needs confirmation, and is suppressed on a run that re-enters carrying an already-decided mode. A review run whose target set the user rejects ends here rather than proceeding to audit content the user declined.

Definition: [`01-intake-and-context.yaml`](./01-intake-and-context.yaml). Leads to [Scope and Draft](#06-scope-and-draft), except on a review run whose target set was rejected, which ends here.

---

### 06. Scope and Draft

Prepares a dedicated worktree on the run's own branch, so no edit lands in the shared library checkout. Enumerates the complete set of files the change touches and holds that manifest at a soft gate before anything is written; revising the manifest re-enters the activity rather than continuing into drafting. Then authors each enumerated file against the schema its kind selects, and stops on any reduction the removals inventory does not account for so the operator disposes of it. Closes by bringing the target README and the planning artifacts into line with what was drafted. Skipped whole in review mode: every step is either mode-gated or gated on a manifest confirmation a review run never reaches.

Definition: [`06-scope-and-draft.yaml`](./06-scope-and-draft.yaml). Leads to [Quality Review](#08-quality-review).

---

### 08. Quality Review

Runs in every mode. Loads the exclusions a prior pass accepted, takes the library catalog as the reference set, then sweeps each target in scope: resolves that target's current surface and the base ref its change is measured against, resolves the references other workflows hold into it, walks every criteria home against both surfaces in a single pass, and runs the repository's definition guards against the tree the run edits. A create or update run sweeps its one target; a review run sweeps each named target in turn, accumulating a register section per target.

On a remediation round it also applies the fixes the re-derived findings prescribe and records what changed, before sweeping again.

Definition: [`08-quality-review.yaml`](./08-quality-review.yaml). Leads to [Validate and Commit](#09-validate-and-commit).

---

### 09. Validate and Commit

Terminal. Re-derives every high-severity finding independently, refuting by default, so a finding that cannot be reproduced from the construct it cites never drives an edit. Persists the register, then takes the operator's disposition: a review run closes on the register or escalates to update mode against one narrowed target; a create or update run either remediates and returns to the sweep, or accepts the findings as recorded. Past the disposition it re-verifies scope in both directions, gates the commit, then commits, publishes a non-draft pull request, writes the close-out and tears the worktree down.

Everything past the disposition is suppressed on any path that has chosen to go back, because a recorded transition does not itself move the run. A remediation round therefore leaves the worktree, the branch and the register intact for the round that resolves it.

Definition: [`09-validate-and-commit.yaml`](./09-validate-and-commit.yaml). Terminal in every mode.

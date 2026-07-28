# Workflow Authoring Activities

> Part of the [Workflow Authoring Workflow](../README.md)

Heading numbers match the on-disk `NN-` file prefixes. Prefixes are sparse by design: they are the server-computed artifact prefix and the activity sort key, so a gap costs nothing and a renumber renames artifacts.

This file is an orientation map. Authoritative definitions live in the per-activity YAML linked from each section below.

---

### 01. Intake and Context

Classifies the request as create, update or review, names the target, and derives the edit-surface path in every mode. Create and update runs seed the planning folder and produce a change brief; update runs additionally produce an impact classification and take approval for the removals it inventories. Gate 1 fires only when intent needs confirmation, and is suppressed on a run that re-enters carrying an already-decided mode. A review run whose target set the user rejects ends here rather than proceeding to audit content the user declined.

Definition: [`01-intake-and-context.yaml`](./01-intake-and-context.yaml).

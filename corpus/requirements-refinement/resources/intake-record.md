---
name: intake-record
description: Creation guide for the intake record a run persists.
metadata:
  order: 5
---

# Intake Record

Creation guide for bare filename `intake.md`. The record of what a refinement run was given: which sources, which target specification, how each source was classified, and whether the run augments an existing specification or creates one. Written before any analysis, so a later reader can tell what the run was working from.

## Template

```markdown
# Intake — {spec basename}

| Source | Source type |
|--------|-------------|
| `{source path}` | meeting \| document |

| Field | Value |
|-------|-------|
| Target specification | `{target path}` |
| Mode | augment \| create |

{One line per source on how its type was inferred, where the document's form is not obvious.}
```

## Rules

- **Captured values only.** The record holds what intake captured and classified. Analysis findings, requirement identifiers, and coverage belong to the analysis artifact.
- **One row per source.** The source table carries a row for every document the run was given.
- **Source type carries its reference form.** A meeting source is referenced downstream as `SRC-MTG###`, a document source as `SRC-DOC###` — see [Source Reference Format](./specification-protocol.md#source-reference-format). State each source's type; the format stays there.
- **Mode is the target's existence.** Augment when the target file exists, create when it does not. No narration of what either mode will do next.
- **Line budget:** ~20 lines.

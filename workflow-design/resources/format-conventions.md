---
name: format-conventions
description: Guidelines for creating the format-conventions planning artifact (YAML and project literacy for this change).
metadata:
  order: 12
---

# Format Conventions Guide

Literacy surface for create/update drafting. Answers: which YAML and project conventions does this change need? Agent-facing; keep short for human skim at literacy gates.

## Template

```markdown
# Format Conventions

Literacy surface for [create/update] of `{workflow-id}`. Grounded in schema docs, `convention-conformance`, and live YAML from reference workflows.

## YAML syntax

- **Block mappings:** `key: value`; children indent two spaces.
- **Block sequences:** `-`-prefixed items; nested maps indent under the `-`.
- **Scalars:** Unquoted when safe; quote when needed; `|-` / `|` for multi-line prose.

## Project conventions

| Concern | Convention |
|---------|------------|
| Activity files | `NN-kebab-name.yaml` under `activities/` |
| Technique / resource files | kebab-case `.md`; container `TECHNIQUE.md` for groups |
| Field order | `id`, `version`, `name`/`title`, `description` early |
| Versions | Semantic `X.Y.Z` |
| Steps | Ordered `steps[]` with `kind:` technique / action / checkpoint / loop |
| Technique binding | Bare op inside activity-named groups; `group::op` otherwise |
| Checkpoints | Inline `kind: checkpoint` with statement `message`, `options[]`, effects |
| Transitions | Activity-level `transitions[]` (`to` / `condition` / `isDefault`) |
| Artifacts | Declared on technique outputs; activity `artifacts[]` is server-computed |
| Artifact links | `[label]({path_variable})` in checkpoint/action messages |

## Change-relevant shapes

- [Only rows/bullets this draft will use — omit the rest.]
```

## Rules

- **Only what this change needs.** Drop convention rows the draft will not touch.
- **Tables over prose.** No tutorial narrative; the schema README stays the deep home.
- **Line budget:** ~40 lines.
- Skip writing this artifact in review mode.

---
name: convention-conformance
description: Reference conventions for conformance audit against sibling workflows.
metadata:
  order: 10
---

# Convention Conformance

Operative checklist for comparing drafted content to reference workflows of similar type. Pair with live reference workflows as the pattern baseline; this resource does not replace reading those files.

## Reference Conventions

| Concern | Established convention |
|---------|------------------------|
| File naming | Activities `NN-name.yaml`; techniques/resources kebab-case `.md` |
| Field ordering | Follow existing files of the same type — typically `id`, `version`, `name` (or capability) and `description` first |
| Version format | Semantic `X.Y.Z` |
| Transition patterns | Activity-level `transitions[]` with `to` / `condition` / `isDefault` as used by siblings |
| Checkpoint structure | Inline `kind: checkpoint` steps with `message`, `options`, effects — same shapes as references |
| Technique structure | Capability / Protocol / Inputs / Outputs / Rules sections; binding via `step.technique` |

For each divergence: decide whether it is justified (document why) or should be brought into conformance. Where drafted content uses different naming or structural patterns than existing workflows, align with the established conventions unless the user has approved an exception (`no-invented-naming`).

YAML syntax literacy (block sequences, quoting, scalars) is out of scope here — this resource owns cross-workflow convention comparison only.

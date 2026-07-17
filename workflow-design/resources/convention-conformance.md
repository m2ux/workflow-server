---
name: convention-conformance
description: Reference conventions and documentation-voice criteria for conformance audit against sibling workflows.
metadata:
  order: 10
---

# Convention Conformance

**Purpose:** Operative checklist for the `audit-conformance` pass — what to compare against reference workflows, and the documentation-voice standard. Pair with live reference workflows as the pattern baseline; this resource does not replace reading those files.

---

## Reference Conventions

When comparing drafted content to reference workflows of similar type, check:

| Concern | Established convention |
|---------|------------------------|
| File naming | Activities `NN-name.yaml`; techniques/resources kebab-case `.md` |
| Field ordering | Follow existing files of the same type — typically `id`, `version`, `name` (or capability) and `description` first |
| Version format | Semantic `X.Y.Z` |
| Transition patterns | Activity-level `transitions[]` with `to` / `condition` / `isDefault` as used by siblings |
| Checkpoint structure | Inline `kind: checkpoint` steps with `message`, `options`, effects — same shapes as references |
| Technique structure | Capability / Protocol / Inputs / Outputs / Rules sections; binding via `step.technique` |

For each divergence: decide whether it is justified (document why) or should be brought into conformance. Where drafted content uses different naming or structural patterns than existing workflows, align with the established conventions unless the user has approved an exception (`no-invented-naming`).

Drafting mechanics for YAML syntax (block sequences, quoting, scalars) live in `yaml-authoring` — this resource owns cross-workflow convention comparison, not YAML syntax literacy.

---

## Documentation Voice

Every prose passage in workflow definitions states what the system does, in positive declarative present tense — describing current behaviour and structure.

Operative Detect for avoidance/comparative framing: `documentation-voice-positive`. Apply that entry; this section is the positive convention statement only — do not maintain a parallel marker list here (`no-technique-resource-dual-home`).

---

## Related

- [Design Principles](design-principles.md) §5 Convention Over Invention
- [Anti-Patterns](anti-patterns.md) — `documentation-voice-positive`, `no-invented-naming`, Description Hygiene entries
- [Schema Construct Inventory](schema-construct-inventory.md)

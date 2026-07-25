---
name: routing-workflow-design-resources
description: >-
  Routes an agent's current intention to the correct workflow-design resource
  file. Use while working inside the workflow-design workflow — drafting or
  reviewing planning artifacts, checking anti-patterns, running elicitation,
  classifying update-mode changes, and similar design-session tasks.
disable-model-invocation: true
---

# Routing Workflow-Design Resources

This skill is a **dispatcher**, not a reference. It tells you which resource file to open for your current intention; it does not contain the resource content itself.

## Canonical index

### Principles & patterns

| Intention / trigger | Resource | One-line purpose |
|---------------------|----------|------------------|
| About to choose a prefer/before design stance (not name a specific smell) | [design-principles.md](../../../workflows/workflow-design/resources/design-principles.md) | Prefer/before stance that avoids smell families (no Detect triad) |
| About to map informal prose to formal schema constructs | [schema-construct-inventory.md](../../../workflows/workflow-design/resources/schema-construct-inventory.md) | Prose-to-formal construct mapping tables |
| About to name or fix a specific design smell | [anti-patterns.md](../../../workflows/workflow-design/resources/anti-patterns.md) | Specific smell instances — Detect/Do not flag/Fix |

## How to use this index

1. Match your current task against the **Intention / trigger** column (agent POV: what you are about to do).
2. Open **only** the matched resource file(s) via the link — do not preload the whole catalog.
3. Cite resources by id (e.g. `workflow-design/anti-patterns`) per the cross-workflow access convention in the [resources README](../../../workflows/workflow-design/resources/README.md).
4. Never inline or paraphrase a resource's substantive content into this skill file or into technique/protocol prose; open the resource and cite it.

## Multi-root note

Relative links above assume a `workflows/` directory reachable from this kickoff folder (same shape as the live workspace skill). When using the five-root Cursor workspace, prefer opening the same files under the **📦 workflows** root:

`workflow-design/resources/<name>.md`

# Analysis Plan — workflow-server YAML definition grammar (Consistency)

**Scope:** module · **Budget:** standard · **Units:** 1 · **Dispatches:** 3

One question is on the table: does the workflow-server definition language give like constructs like treatment? That is a soundness question about a surface authors write against every day, so it gets the deepest mode available rather than a single opinion — a structural read, an adversarial read that never sees the first, and a synthesis that reconciles them. The corpus is 139 YAML definitions (122 activity files across 17 workflows), the three JSON Schemas that describe them, and the reference evaluator the string grammar is defined by.

## Units

| # | Target | Role | Risk | Mode | Lenses | Why |
|---|--------|------|------|------|--------|-----|
| 1 | `workflows/**/*.yaml`, `schemas/{activity,workflow,condition}.schema.json`, `src/schema/` | api-surface | high | full-prism | l12, l12-complement-adversarial, l12-synthesis | The grammar is the interface every workflow author writes against, and the goal names inconsistency in it as the concern — which elevates an api-surface unit from medium to high, and high under a standard budget takes full-prism. |

## Passes

Three isolated dispatches, in order. Each reads the prior pass from its artifact path; none inherits another's generation history.

1. **Structural** (`l12`, resource 00) — reads the corpus directly and reports what the grammar does.
2. **Adversarial** (`l12-complement-adversarial`, resource 01) — reads the corpus directly, never pass 1's output, and reports independently.
3. **Synthesis** (`l12-synthesis`, resource 02) — reads both artifacts and reconciles agreement, conflict, and what neither pass saw.

Each pass takes the model its lens resource declares. The L12 set carries no target-type restriction, so a `general` target is in range.

## Evidence the passes are pointed at

Carried from the evaluation that commissioned this run; the passes confirm or overturn these rather than assuming them.

- Two parallel predicate grammars with no lowering between them: 281 string `when:` gates against 109 structured `condition:` trees. The same four-term predicate is written both ways in `workflow-authoring/activities/09-validate-and-commit.yaml`.
- A third, undeclared grammar inside `actions[].target` — 38 uses, 22 carrying operators — competing with 11 `actions[].condition` trees on the same verb.
- An asymmetry in how state is declared: 618 bare strings against 525 four-key objects across `reads`/`writes`.
- Whether a construct that appears at both activity and workflow level is written the same way in both places.

## Boundary

The run settles a target grammar and specifies it. It does not write `grammar/*.ebnf` or `constraints/*.als`.

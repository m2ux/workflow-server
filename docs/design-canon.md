# Design canon

The criteria a workflow definition is authored toward and audited against. Four homes, served from the `canon` namespace on the [`workflows` branch](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/README.md).

The canon lives in the corpus rather than here because agents read it **during a run**: a technique links an entry, and the server serves that section through `get_resource`. A copy in this tree could not be served, and a second copy would drift from the first.

## The four homes

| Home | Owns |
|------|------|
| [Design Principles](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/design-principles.md) | The *prefer / before / only after* stance an author writes toward |
| [Anti-Patterns](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/anti-patterns.md) | Specific smells, each as **Detect / Do not flag / Fix** |
| [Schema Construct Inventory](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/schema-construct-inventory.md) | Mapping tables from an informal prose pattern to the construct carrying it |
| [Convention Conformance](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/convention-conformance.md) | Comparison against sibling workflows — naming, field order, structure |

In a checkout holding the corpus worktree they are at `.worktrees/workflows/corpus/canon/resources/`.

## Reaching them

| From | Form |
|------|------|
| A prose link in a definition | `/canon/resources/anti-patterns.md#some-section` |
| A running agent | `get_resource { resource_id: "canon/anti-patterns#some-section" }` |
| A skill or a person | the paths above |

### Fetch by section

`anti-patterns.md` exceeds the per-resource eager-delivery cap on its own, so a whole-file reference is never bundled — see [the delivery model](delivery-model.md#resources-bodies-only-under-reference-delivery). Cite the narrowest section carrying what you need.

### Cite a principle by title

Anchors on the principles home embed the section ordinal, so an anchor breaks when the canon gains a principle ahead of it while the heading survives. Where an anchor fails to resolve, re-read the heading rather than guessing at a number.

## What lives here instead

This tree holds the contracts the canon is written against, not the canon itself:

- [technique-protocol-specification.md](technique-protocol-specification.md) — the technique file contract
- [identifier-conventions.md](identifier-conventions.md) — how every id is spelled and shaped
- [`schemas/README.md`](../schemas/README.md) — the workflow and activity file shapes
- [`guards/README.md`](../guards/README.md) — the checks that enforce them mechanically

The split is the same one [the documentation system](documentation-system.md#the-two-layers) draws everywhere: what the server *is* lives here, and what the definitions must *say* lives with the definitions.

# Design canon

The criteria a workflow definition is authored toward and audited against. Four homes, served from the [canon](../corpus/canon/README.md) namespace.

Agents read the canon during a run: a technique links an entry, and the server serves that section. The schema those files are checked against, and the guards that enforce them, live on the server tree.

## Reaching them

| From | Form |
|------|------|
| A prose link in a definition | `/canon/resources/anti-patterns.md#some-section` |
| A running agent | `get_resource { resource_id: "canon/anti-patterns#some-section" }` |
| A skill or a person | the [canon](../corpus/canon/README.md) |

### Fetch by section

The anti-pattern catalog exceeds the per-resource eager-delivery cap on its own, so a whole-file reference is never bundled. See [resource bodies](https://github.com/m2ux/workflow-server/blob/main/docs/delivery.md#resources-bodies-only-under-reference-delivery). Cite the narrowest section carrying what you need.

### Cite a principle by title

Anchors on the principles home embed the section ordinal, so an anchor breaks when the canon gains a principle ahead of it while the heading survives. Where an anchor fails to resolve, re-read the heading rather than guessing at a number.

## What the server holds

The [technique protocol](technique-protocol-specification.md) and the [identifier conventions](identifier-conventions.md) live with the definitions. The server holds the schema those files are checked against, and the guards that enforce them:

- [schemas/README.md](https://github.com/m2ux/workflow-server/blob/main/schemas/README.md) — the workflow and activity file shapes
- [guards/README.md](https://github.com/m2ux/workflow-server/blob/main/guards/README.md) — the checks that enforce them mechanically

The split is the same one the [documentation system](https://github.com/m2ux/workflow-server/blob/main/docs/documentation-system.md#the-two-layers) draws everywhere: what the server is lives on the server tree, and what the definitions must say lives with the definitions.

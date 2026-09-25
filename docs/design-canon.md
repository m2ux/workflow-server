# Design canon

The criteria a workflow definition is authored toward and audited against. Four homes, served from the [canon](README.md#document-corpus) namespace.

The canon lives in the corpus rather than here because agents read it during a run: a technique links an entry, and the server serves that section through `get_resource`. A copy in this tree could not be served, and a second copy would drift from the first.

## Reaching them

| From | Form |
|------|------|
| A prose link in a definition | `/canon/resources/anti-patterns.md#some-section` |
| A running agent | `get_resource { resource_id: "canon/anti-patterns#some-section" }` |
| A skill or a person | the [canon](README.md#document-corpus) |

### Fetch by section

`anti-patterns.md` exceeds the per-resource eager-delivery cap on its own, so a whole-file reference is never bundled — see [the delivery model](delivery.md#resources-bodies-only-under-reference-delivery). Cite the narrowest section carrying what you need.

### Cite a principle by title

Anchors on the principles home embed the section ordinal, so an anchor breaks when the canon gains a principle ahead of it while the heading survives. Where an anchor fails to resolve, re-read the heading rather than guessing at a number.

## What lives here instead

The [technique protocol](README.md#document-corpus) and the [identifier conventions](README.md#document-corpus) live with the definitions. This tree holds the schema those files are checked against, and the guards that enforce them:

- [schemas/README.md](../schemas/README.md) — the workflow and activity file shapes
- [guards/README.md](../guards/README.md) — the checks that enforce them mechanically

The split is the same one [the documentation system](documentation-system.md#the-two-layers) draws everywhere: what the server *is* lives here, and what the definitions must *say* lives with the definitions.

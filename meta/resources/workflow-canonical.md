---
name: workflow-canonical
description: >
  Canonical ontology for workflow techniques. Defines how techniques (including
  nested techniques), resources, roles, and tools are laid out on disk, how a
  technique's base contract is inherited, and how cross-references resolve. A
  governed file's `metadata.ontology: workflow-canonical` resolves here. Load
  once per session before interpreting such files.
metadata:
  ontology: workflow-canonical
---

# Workflow-canonical ontology

Any file whose frontmatter declares `metadata.ontology: workflow-canonical` is
interpreted according to this document. Read once per session; contents do not
change during execution.

## On-disk layout

There is **one kind of technique**. A technique can contain nested techniques in its
folder. A workflow's content lives under `techniques/` and `resources/` in three
shapes:

| Shape | Path | Frontmatter | Notes |
|-------|------|-------------|-------|
| **Standalone technique** | `techniques/<id>.md` | yes (`metadata.version`) | A single technique. |
| **Container technique** | `techniques/<group>/TECHNIQUE.md` + `techniques/<group>/<sub>.md` | yes (each file carries `metadata.version`) | The folder is a namespace; `TECHNIQUE.md` is the container technique; each `<sub>.md` is a nested technique. |
| **Resource** | `resources/<slug>.md` | yes | Freeform reference material. |

Each workflow also has a **root base contract** at `techniques/TECHNIQUE.md` —
isomorphic to a technique, carrying no technique list (the technique set is implied
by the folder contents). See *Base-contract inheritance* below.

A technique is addressed by its id (the file/folder slug). A nested technique is
addressed `group::sub`, resolving to `techniques/<group>/<sub>.md`. Addressing uses
`::` paths: a reference to a technique in the same workflow is implicit, and
resolution searches the current workflow first, then `meta`.

## Sections

A **technique** (`techniques/<id>.md`, a container `TECHNIQUE.md`, or a nested
`<sub>.md`) carries `metadata.version` frontmatter and may contain:
`## Capability` (required), `## Inputs`, `## Output(s)`, `## Protocol`, `## Rules`.

`## Inputs` and `## Output(s)` list entries; each entry uses `####` sub-section
components, including the reserved `#### artifact` and `#### default` components.

Failure handling lives **inline in the protocol step that triggers it**.

### Protocol

`## Protocol` is a **single ordered list of steps**. It may be a flat
numbered/bulleted list, or `### N. Title` blocks each holding an ordered list. The
server treats it as one ordered sequence and assigns step numbers at load time.
**Do not write absolute intra-protocol step-number references** ("go to step 3") —
composition and renumbering shift them; refer to steps descriptively.

## Base-contract inheritance

`techniques/TECHNIQUE.md` is the per-workflow **root base contract** — *isomorphic to a
technique* (frontmatter + `## Capability` + optional contract sections, no technique
list). Its sections are inherited by every technique in the workflow:

- **Inputs / Outputs / Rules** — merged in (union; a technique-local entry
  with the same id/name overrides the inherited one).
- **Protocol** — the root's steps combine with the technique's own, and the server
  **renumbers** the combined sequence.

Inheritance is **recursive** down the nesting chain: workflow root `TECHNIQUE.md` →
container `<group>/TECHNIQUE.md` → nested technique (`<sub>.md`) or standalone. Each
level accumulates its ancestors' contract.

Inheritance is **executing-workflow-only**: a technique inherits the root of the
workflow it runs in — **never `meta`'s root** (meta is orchestrator-scoped, a
different context than a worker).

The server composes this automatically. `get_technique` returns the **fully composed**
technique; agents do not assemble it by hand.

## Roles

A persona contract: responsibilities, authority, refusals, qualified techniques.
Roles have **no on-disk file** — they live as `##` sections within the workflow
definition (`workflow.yaml`, e.g. `## Engineer`, `## Reviewer`). Role-to-technique
binding lives in `workflow.yaml` activity definitions, not in frontmatter.

## Tools

An external primitive: a binary, an MCP server, a CLI command, an API. Tools have
**no first-class on-disk representation**. Two realisations:

- **Inline** — simple tools (`git`, `cargo`, Claude Code primitives) appear as bare
  command strings in protocol step text.
- **Tool-dedicated namespace** — complex tools (`gitnexus`, `concept-rag`) warrant a
  container technique whose nested `<sub>.md` files each describe one API endpoint.

## Cross-reference format

References between techniques and resources are **file-relative markdown hyperlinks**
to the target file — relative to the *referencing file's own directory*, so they click
through in any IDE / GitHub / markdown renderer. The link text is the target's name;
the target path ends in the target's real filename. The `../` depth follows from where
the two files sit. Target paths by kind:

```
standalone technique:   ../techniques/<id>.md            (or <id>.md from a sibling)
container technique:     ../techniques/<group>/TECHNIQUE.md
nested technique:        <sub>.md                         (within the group folder)
resource:               ../resources/<slug>.md
```

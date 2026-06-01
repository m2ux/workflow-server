---
name: workflow-canonical
description: >
  Canonical ontology for workflow techniques. Defines how techniques, operations,
  resources, roles, and tools are laid out on disk, how a technique's base contract
  is inherited, and how cross-references resolve. A governed file's
  `metadata.ontology: workflow-canonical` resolves here. Load once per session
  before interpreting such files.
metadata:
  ontology: workflow-canonical
---

# Workflow-canonical ontology

Any file whose frontmatter declares `metadata.ontology: workflow-canonical` is
interpreted according to this document. Read once per session; contents do not
change during execution.

## On-disk layout

There is **no `SKILL.md`**. A workflow's content lives under `techniques/` and
`resources/` in three shapes:

| Shape | Path | Frontmatter | Notes |
|-------|------|-------------|-------|
| **Standalone technique** | `techniques/<slug>.md` | yes (`name`, `metadata.version`) | A single technique. May define inline operations. |
| **Grouped operations** | `techniques/<group>/TECHNIQUE.md` + `techniques/<group>/<op>.md` | index: yes; op files: none | The folder is a namespace; `TECHNIQUE.md` is its index; each `<op>.md` is one operation. |
| **Resource** | `resources/<slug>.md` | yes | Freeform reference material; no operations. |

Each workflow also has a **root base contract** at `techniques/TECHNIQUE.md` —
isomorphic to a technique, carrying no technique list (the technique set is implied
by the folder contents). See *Base-contract inheritance* below.

A technique is addressed by its `name` (the file/folder slug). An operation is
addressed `group::op`, resolving to `techniques/<group>/<op>.md`. Operations on a
standalone technique are addressed `technique::op` and resolve to its inline
`## Operations`.

## Sections

A **technique** (`techniques/<slug>.md` or a grouped `TECHNIQUE.md`) may contain:
`## Capability` (required), `## Inputs`, `## Protocol`, `## Operations`,
`## Outputs`, `## Rules`, `## Errors`.

An **operation** (`<op>.md`) has no frontmatter and may contain: a lead description
paragraph, `## Inputs`, `## Outputs`, `## Protocol` (required), `## Errors`,
`## Rules`.

### Protocol

`## Protocol` is a **single ordered list of steps** — there is no "phase" construct.
It may be a flat numbered/bulleted list, or `### ` sub-blocks each holding an ordered
list. The server treats it as one ordered sequence and assigns step numbers at
load time. **Do not write absolute intra-protocol step-number references** ("go to
step 3") — composition and renumbering shift them; refer to steps descriptively.

Techniques and operations both use `## Protocol`. There is no `## Procedure`.

## Base-contract inheritance

`techniques/TECHNIQUE.md` is the per-workflow **root base contract** — *isomorphic to a
technique* (frontmatter + `## Capability` + optional contract sections, no technique
list). Its sections are inherited by every technique in the workflow:

- **Inputs / Outputs / Rules / Errors** — merged in (union; a technique-local entry
  with the same id/name overrides the inherited one).
- **Protocol** — the root's steps are **prepended** before the technique's own, and
  the combined sequence is **renumbered** by the server.

Inheritance is **recursive** down the nesting chain: workflow root `TECHNIQUE.md` →
grouped `<group>/TECHNIQUE.md` → leaf (`<op>.md` / standalone). Each level accumulates
its ancestors' contract.

Inheritance is **executing-workflow-only**: a technique inherits the root of the
workflow it runs in — **never `meta`'s root** (meta is orchestrator-scoped, a
different context than a worker).

The server composes this automatically. `get_technique` returns the **fully composed**
technique; agents do not assemble it by hand.

## Roles

A persona contract: responsibilities, authority, refusals, qualified techniques.
Roles have **no on-disk file** — they live as `##` sections within the workflow
definition (`workflow.toon`, e.g. `## Engineer`, `## Reviewer`). Role-to-technique
binding lives in `workflow.toon` activity definitions, not in frontmatter.

## Tools

An external primitive: a binary, an MCP server, a CLI command, an API. Tools have
**no first-class on-disk representation**. Two realisations:

- **Inline** — simple tools (`git`, `cargo`, Claude Code primitives) appear as bare
  command strings in protocol step text.
- **Tool-dedicated namespace** — complex tools (`gitnexus`, `concept-rag`) warrant a
  grouped technique whose `<op>.md` files each describe one API endpoint.

## Cross-reference format

References between techniques and resources are **file-relative markdown hyperlinks**
to the target file — relative to the *referencing file's own directory*, so they click
through in any IDE / GitHub / markdown renderer. The link text is the target's name;
the target path ends in the target's real filename — **never `/SKILL.md`**. The `../`
depth follows from where the two files sit. Target paths by kind:

```
standalone technique:   ../techniques/<name>.md          (or <name>.md from a sibling)
grouped index:          ../techniques/<name>/TECHNIQUE.md
single operation:       <op>.md                          (within the group folder)
resource:               ../resources/<name>.md
```

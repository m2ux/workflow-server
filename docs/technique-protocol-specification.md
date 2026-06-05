# Technique Protocol Specification

Status: current as of the technique-unification work (branch `test/technique-e2e-harness`).
Authoritative schema: [`schemas/technique.schema.json`](../schemas/technique.schema.json) /
[`src/schema/technique.schema.ts`](../src/schema/technique.schema.ts). Loader of record:
[`src/loaders/markdown-technique-loader.ts`](../src/loaders/markdown-technique-loader.ts) and
[`src/loaders/technique-loader.ts`](../src/loaders/technique-loader.ts).

This document specifies what a **technique** is, how technique files are authored and parsed, how
techniques are addressed and composed, and what the server delivers when one is referenced. It is
the contract shared by workflow authors (who write technique files) and the server (which resolves
and delivers them).

---

## 1. The technique model

A **technique** is a unit of reusable procedure-and-interface: a capability statement, an optional
typed interface (inputs/outputs), an ordered protocol, and optional rules and errors. Techniques
are the leaf of the `Goal → Activity → Technique → Tools` model — an activity step names a technique;
the technique tells the agent *how*.

There is exactly **one kind of technique.** A technique may *contain* other techniques (nesting), but
a nested technique is not a different kind — it is a technique that happens to sit deeper in the
containment tree. "Sub-technique" is informal shorthand for "a technique composed under another"; it
has **no formal footprint** in the schema, parser, projection, or wire output. Everything below
applies uniformly to a standalone technique, a container technique, and a nested technique.

> Design note: this isomorphism is deliberate. Earlier models had a separate `operations[]` construct
> and a distinct sub-technique parse/type/projection; those are gone. One format, parsed one way,
> projected one way.

---

## 2. File layout and resolution

Techniques live under a workflow's `techniques/` directory. Three on-disk shapes, all parsed
identically:

| Shape | Path | Role |
|-------|------|------|
| Standalone | `<wf>/techniques/<id>.md` | A technique with no children |
| Container index | `<wf>/techniques/<group>/TECHNIQUE.md` | The `<group>` technique itself; its folder holds children |
| Nested | `<wf>/techniques/<group>/<op>.md` (any depth) | A technique composed under `<group>` |

`locateTechnique` resolves an id to the standalone file first, else the container index. A nested
technique is loaded by path via `tryLoadNestedTechnique`. The special id `TECHNIQUE` at the root of a
workflow's `techniques/` dir is the **workflow-root technique** — the ancestor of every technique in
that workflow. It carries shared contract but is never itself an addressable technique
(`listWorkflowTechniqueIds` excludes it).

Resolution precedence for an unprefixed reference: the **current workflow first** (its technique
shadows a same-named meta one), then the shared **meta** layer.

---

## 3. Anatomy of a technique file

Every technique file — standalone, container index, or nested — has the **same strict format**:

```markdown
---
metadata:
  version: 1.0.0
---

## Capability

<one paragraph: what this technique does>

## Inputs            (optional)
### <input-id>
<description>
#### <member>        (optional: composite member)
<member description>
#### default         (optional, reserved: the input's default value)
<value>

## Output            (optional; "## Outputs" also accepted)
### <output-id>
<description>
#### <member>        (optional: composite member)
<member description>
#### artifact        (optional, reserved: persistence filename)
`<filename-or-{token}-template>`

## Protocol          (required for a technique that does work)
### <N>. <Title>
- <imperative step>
- <imperative step>

## Rules             (optional)
### <rule-name>
<rule text>

## Errors            (optional)
### <error-name>
**Cause:** <cause>
**Recovery:** <recovery>
```

### 3.1 Frontmatter and Capability

- **Frontmatter is required** and must carry `metadata.version`. No other frontmatter field is read
  by the loader (`ontology`, `kind`, `order`, `legacy_id` are ignored if present).
- **`## Capability` is required** — a single paragraph describing what the technique *is/does*.
  Capability/description must not encode behavioral rules or activity sequences (see §8).

### 3.2 Inputs and Output — sub-section components

Each `### <id>` under `## Inputs`/`## Output` is one entry. An entry may be a scalar (just a
description) or a **composite** whose members are authored as `####` sub-sections:

- A `#### <member>` under an entry becomes a named **component** (`components[member] = body`).
  This is documentation granularity, not a binding contract — see §7.4.
- Two **reserved** sub-section titles carry metadata rather than a component:
  - In **Output**: `#### artifact` → the persistence filename (`output[].artifact.name`). The value
    may be a literal (`code-review.md`) or a `{token}`-template the worker interpolates at runtime
    (`{package-name}-plan.md`).
  - In **Inputs**: `#### default` → the input's default value (`inputs[].default`).
- An entry whose lead description begins with `optional` (e.g. `*(optional)*`) marks the input
  `required: false`.

Composite members are expressed as **sub-sections, never bullets**. (The component data model — a
`{ name: description }` map plus the reserved markers — is identical regardless; only the markdown
surface is sub-sections.) `parseEntrySubsections` performs this split for both inputs and outputs.

### 3.3 Protocol

`## Protocol` is parsed into an ordered list of **blocks** `{ title?, steps[] }`:

- When the body uses `### <N>. <Title>` sub-headings, each becomes a titled block; its bullets (or
  numbered items) are the block's `steps`. The ordinal prefix (`<N>.`) is stripped from the title.
- When the body is a flat numbered/bulleted list, it becomes a single untitled block.

Block titles are thematic groupings. Use titled blocks when a protocol spans distinct phases; use a
flat list for an atomic procedure. Two titles are **reserved for composition** — `Initial` and
`Final` (see §6).

### 3.4 Rules and Errors

- `### <rule-name>` under `## Rules` → `rules[name] = text`. Rules are behavioral constraints.
- `### <error-name>` under `## Errors` with `**Cause:**` / `**Recovery:**` → `errors[name]`.

---

## 4. Addressing

A technique reference is a `::`-delimited path:

```
[<workflow>::]<technique>[::<nested>[::<nested>…]]
```

- The **parent workflow is implicit** for same-workflow references — omit it; the current workflow is
  filled in at resolution. Include a leading `<workflow>::` segment only to reach another workflow.
- `<technique>` alone is a **whole-technique** reference (deliver the technique itself).
- `<technique>::<nested>` addresses a technique nested in `<technique>`'s folder; deeper `::` segments
  recurse into deeper folders.
- A trailing segment that is not a file resolves as a **rule** or **error** on the technique, or as a
  **group-prefix rule reference** (`<technique>::<group>` expands to every rule named `<group>-*`).
- Legacy `<workflow>/<technique>` (slash) is accepted and normalized to `::`.

`parseTechniquePath` performs normalization and splitting; `resolveTechniques` performs lookup with
the current-workflow-first precedence of §2.

---

## 5. Inheritance of contract (inputs / outputs / rules / errors)

A workflow-root `TECHNIQUE.md` may define shared **Inputs, Outputs, Rules, Errors** that are inherited
by every technique in the workflow (`composeTechnique`, R4 — executing-workflow-only, never meta's).
Keyed sections union, with the technique-local entry overriding by id/name.

A technique's **own rules** are delivered as separate `rule` entries via the auto-include pass (§7.2),
not inlined into its body — uniformly for standalone and nested techniques. A containing group's
shared rules reach a nested technique the same way (the group index is auto-included when one of its
children is referenced).

---

## 6. Protocol composition — Initial/Final recursive wrapping

This is the one place protocol content flows between techniques, and it is **positional, not a blanket
prepend**.

When a technique is delivered, the `## Protocol` blocks titled **`Initial`** and **`Final`** of each
**ancestor container** wrap the technique's own protocol:

```
ancestorRoot.Initial
  …
  immediateParent.Initial
    <the technique's own protocol, in authored order>
  immediateParent.Final
  …
ancestorRoot.Final
```

Rules:

1. **Only `Initial` and `Final` flow into descendants.** Any other protocol block on an ancestor is
   *ancestor-only*: it is excluded from descendant composition and appears solely when that ancestor
   is **referenced directly**.
2. **The wrap is recursive across the full ancestor chain.** For a nested technique
   `wf::group::op`, the ancestors are the workflow root and `group` (and any intermediate folders).
   The workflow root is outermost; the immediate parent is innermost.
3. **A technique referenced directly delivers its own protocol in full** — all its blocks
   (`Initial`, `Final`, and any others) in authored order — itself wrapped by *its* ancestors'
   `Initial`/`Final`.
4. The server renumbers the combined sequence for display; authored array order is the order.

Example — delivering `work-package::cargo-operations::check`:

```
work-package root TECHNIQUE.md  → Initial blocks
cargo-operations TECHNIQUE.md   → Initial blocks
check.md                        → its own protocol
cargo-operations TECHNIQUE.md   → Final blocks
work-package root TECHNIQUE.md  → Final blocks
```

If `cargo-operations` also defines a non-`Initial`/`Final` block (e.g. `### Setup`), that block is
absent from `check`'s delivery but present when `cargo-operations` is referenced directly.

Implementation: `wrapProtocolWithAncestors` (bundle path, full recursion) and `composeTechnique`
(the `get_technique` path, where the resolved unit is a whole technique whose sole ancestor is the
workflow root).

---

## 7. Delivery — what the server returns

### 7.1 Projected body

A delivered technique body (`projectTechniqueBody`) carries: `capability`, `flow?`, `inputs?`,
`protocol?` (ancestor-wrapped per §6), `output?`, and `errors?`. Errors are delivered **in-body** for
every technique; rules are **not** in-body (they come as `rule` entries — §7.2), avoiding duplication.

### 7.2 The bundle

`formatTechniqueBundle` shapes a resolved set into:

| Key | Contents |
|-----|----------|
| `techniques` | Every delivered technique body, keyed by its path. A nested technique is keyed by its full `::` path (e.g. `cargo-operations::check`); a standalone by its id. **There is no separate `sub-techniques` bucket.** |
| `rules` | `[name, text]` pairs — a technique's own rules plus inherited/group rules, auto-included. |
| `errors` | Bodies of explicitly-addressed `::<error>` references. |
| `unresolved` | Refs that did not resolve (a non-empty list is a definition defect). |

### 7.3 Activity bundling

`get_activity` / `get_workflow` deliver an activity's `techniques.primary` plus `techniques.supporting[]`
as full protocols through this bundle; `get_technique` delivers a single technique via `composeTechnique`.

### 7.4 What "reference must be valid" means

The engine binds on **workflow state variables** (set by a worker reading a technique's result and
mapping it in prose) and on the **named identifiers** a consumer actually uses — not on declared
output *structure*. Component granularity (the `####` members of §3.2) is documentation for the
reader; nothing in the engine binds to a component by id. Consequently, composite structure is *not*
a machine contract and is not modeled as one (no stale membership index).

---

## 8. Authoring discipline (decoupling)

Techniques are reusable; their contracts must stay workflow-agnostic. The canonical anti-patterns
live in [`workflows/workflow-design/resources/anti-patterns.md`](../workflows/workflow-design/resources/anti-patterns.md);
the protocol-relevant ones:

- **I/O agnosticism** — `inputs`/`output`/`errors` describe *what a value is*, never where it comes
  from or goes (no "from [analyze-failure]", no "for the X activity"). The only place a technique
  names another technique is `## Protocol`/`## Capability` as utilisation ("use `cargo-operations::fmt-fix`")
  or an `## Errors` "apply technique X" recovery.
- **Canonical identifiers in Protocol** — Protocol references data by its Input/Output id, never by a
  literal artifact filename or path. Artifact names live in the `#### artifact` declaration (literal,
  `{token}`-template, or discriminator-keyed), not in Protocol prose.
- **No prose sequences in descriptions** — capability/description states what the construct *is*; the
  sequence of steps/phases is canonical in `protocol[]`, not restated in prose.
- **No role rules in descriptions** — "the orchestrator coordinates only" is a rule and belongs in
  `## Rules` (at the technique, a containing group, or the workflow root), not in a description.
- **Resources don't name their callers** — a resource (template/guide/prompt) never back-references
  the technique that produces or consumes it.

---

## 9. Validation

Every parsed technique is validated against `TechniqueSchema` (zod) before delivery; a failure logs a
warning and the technique is treated as unloadable. Required: `metadata.version`, `## Capability`. A
technique that does work needs a non-empty `## Protocol`. Authoring tools should additionally check
that all `::` references in an activity's `techniques`/steps resolve (an `unresolved` entry in a
bundle is a defect) — this is what the Layer-2 definition-lint gate enforces.

---

## 10. Summary of guarantees

- One technique kind; nesting is containment, not a separate type.
- One strict file format (frontmatter `version` + `## Capability` + optional typed sections).
- Composite I/O members and the `artifact`/`default` markers are `####` sub-sections.
- Protocol composition wraps with ancestor `Initial`/`Final` recursively; other ancestor blocks are
  direct-reference-only.
- Rules deliver as `rule` entries (auto-included); errors deliver in-body; techniques deliver under a
  single `techniques` bucket keyed by `::` path.
- Contracts are workflow-agnostic; composition relationships are not encoded as machine contracts.

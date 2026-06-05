# Technique Protocol Specification

Authoritative schema: [`schemas/technique.schema.json`](../schemas/technique.schema.json) /
[`src/schema/technique.schema.ts`](../src/schema/technique.schema.ts). Loaders:
[`src/loaders/markdown-technique-loader.ts`](../src/loaders/markdown-technique-loader.ts),
[`src/loaders/technique-loader.ts`](../src/loaders/technique-loader.ts).

This document specifies what a technique is, how technique files are authored and parsed, how
techniques are addressed and composed, and what the server delivers when one is referenced.

---

## 1. The technique model

A technique is a unit of reusable procedure and interface: a capability statement, an optional typed
interface (inputs and outputs), an ordered protocol, and optional rules. Techniques are the leaf of
the `Goal → Activity → Technique → Tools` model — an activity step names a technique, and the
technique tells the agent how.

A technique can contain other techniques, nested within its folder. A nested technique is a
technique; it sits deeper in the containment tree and takes contract from its ancestors (§5, §6).

---

## 2. File layout and resolution

Techniques live under a workflow's `techniques/` directory:

| Shape | Path | Role |
|-------|------|------|
| Standalone | `<wf>/techniques/<id>.md` | A technique with no children |
| Container | `<wf>/techniques/<group>/TECHNIQUE.md` | The `<group>` technique; its folder holds child techniques |
| Nested | `<wf>/techniques/<group>/<op>.md` (any depth) | A technique within `<group>` |

`locateTechnique` resolves an id to the standalone file or the container's `TECHNIQUE.md`; a nested
technique is loaded by path (`tryLoadNestedTechnique`). The id `TECHNIQUE` at the root of a workflow's
`techniques/` directory is the workflow-root technique — the ancestor of every technique in that
workflow; it carries shared contract and is excluded from the addressable technique list.

An unprefixed reference resolves against the current workflow first, then the shared `meta` layer.

---

## 3. Anatomy of a technique file

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
#### <member>        (optional: a component of this input)
<member description>
#### default         (optional: the input's default value)
<value>

## Output            (optional; "## Outputs" also accepted)
### <output-id>
<description>
#### <member>        (optional: a component of this output)
<member description>
#### artifact        (optional: the persistence filename)
`<filename-or-{token}-template>`

## Protocol          (present when the technique does work)
### <N>. <Title>
- <imperative step>
- <imperative step>

## Rules             (optional)
### <rule-name>
<rule text>
```

### 3.1 Frontmatter and Capability

- Frontmatter declares `metadata.version`; the loader uses it as the technique's version.
- `## Capability` is a single paragraph stating what the technique does.

### 3.2 Inputs and Output

Each `### <id>` under `## Inputs` / `## Output` is an entry: a description, optionally with `####`
sub-section members.

- `#### <member>` is a named component of the entry (`components[member]`).
- `#### artifact` (Output) is the persistence filename — a literal (`code-review.md`) or a
  `{token}`-template the worker interpolates at runtime (`{package-name}-plan.md`).
- `#### default` (Inputs) is the input's default value.
- An entry whose description opens with `optional` (e.g. `*(optional)*`) is `required: false`.

`parseEntrySubsections` splits an entry's lead description from its `####` members for both inputs
and outputs.

### 3.3 Protocol

`## Protocol` is an ordered list of blocks `{ title?, steps[] }`:

- A `### <N>. <Title>` sub-heading is a titled block; its bullets (or numbered items) are the block's
  `steps`, and the ordinal prefix is dropped from the title.
- A flat numbered or bulleted body is one untitled block.

Titled blocks group a protocol's phases; a flat list suits an atomic procedure. The titles `Initial`
and `Final` position an ancestor's content around its descendants (§6).

### 3.4 Rules

`### <rule-name>` under `## Rules` is a cross-cutting behavioral constraint. A constraint specific to
one step belongs in that step.

### 3.5 Error handling

An error arises from a specific step's action, so its handling lives in that step: the step states the
failure condition and the recovery inline ("if `cargo check` fails — type errors — surface the
diagnostics and retry"). A recovery that applies another technique names it inline, as any protocol
technique reference ("apply `cargo-operations::fmt-fix`").

---

## 4. Addressing

A technique reference is a `::`-delimited path:

```
[<workflow>::]<technique>[::<nested>[::<nested>…]]
```

- The workflow is implicit for a same-workflow reference; a leading `<workflow>::` targets another
  workflow.
- `<technique>` delivers the technique itself.
- `<technique>::<nested>` addresses a technique within `<technique>`'s folder; deeper segments recurse
  into deeper folders.
- A trailing segment matching a rule name resolves to that rule; `<technique>::<group>` expands to
  every rule named `<group>-*`.
- A `<workflow>/<technique>` (slash) form is normalized to `::`.

`parseTechniquePath` normalizes and splits a reference; `resolveTechniques` looks it up with the
current-workflow-first precedence of §2.

---

## 5. Contract inheritance

A workflow-root `TECHNIQUE.md` defines Inputs, Outputs, and Rules shared by every technique in the
workflow (`composeTechnique`, against the executing workflow's root). Keyed sections union, with the
technique-local entry taking precedence by id or name.

A technique's rules reach the agent as `rule` entries (§7.2); a containing group's shared rules reach
a nested technique the same way — the group's `TECHNIQUE.md` is included when one of its children is
referenced.

---

## 6. Protocol composition — Initial/Final wrapping

When a technique is delivered, the `## Protocol` blocks titled `Initial` and `Final` on each ancestor
container wrap the technique's own protocol:

```
ancestorRoot.Initial
  …
  immediateParent.Initial
    <the technique's own protocol, in authored order>
  immediateParent.Final
  …
ancestorRoot.Final
```

- `Initial` and `Final` flow into descendants. An ancestor's other protocol blocks belong to that
  ancestor and appear when the ancestor is delivered directly.
- The wrap applies across the full ancestor chain: the workflow root is outermost, the immediate
  parent innermost.
- A technique delivered directly carries its own protocol in full — `Initial`, `Final`, and any other
  blocks in authored order — itself wrapped by its ancestors' `Initial`/`Final`.
- The server renumbers the combined sequence; the authored array order is the order.

Example — delivering `work-package::cargo-operations::check`:

```
work-package root TECHNIQUE.md  → Initial blocks
cargo-operations TECHNIQUE.md   → Initial blocks
check.md                        → its own protocol
cargo-operations TECHNIQUE.md   → Final blocks
work-package root TECHNIQUE.md  → Final blocks
```

`wrapProtocolWithAncestors` applies the full chain on the bundle path; `composeTechnique` applies it
on the `get_technique` path, where the workflow root is the ancestor.

---

## 7. Delivery

### 7.1 Body

A delivered technique body (`projectTechniqueBody`) carries `capability`, `flow?`, `inputs?`,
`protocol?` (wrapped per §6), and `output?`. A technique's rules are delivered as `rule` entries
(§7.2).

### 7.2 Bundle

`formatTechniqueBundle` produces:

| Key | Contents |
|-----|----------|
| `techniques` | Each delivered technique body, keyed by path — a nested technique by its full `::` path (e.g. `cargo-operations::check`), a standalone by its id. |
| `rules` | `[name, text]` pairs: a technique's rules plus its inherited and group rules. |
| `unresolved` | References that did not resolve (a non-empty list is a definition defect). |

### 7.3 Activity bundling

`get_activity` and `get_workflow` deliver an activity's `techniques.primary` and
`techniques.supporting[]` through this bundle; `get_technique` delivers a single technique via
`composeTechnique`.

### 7.4 Binding

The engine binds by name: workflow state variables (a worker sets them from a technique's result) and
the entry ids a consumer references. The `####` components of an entry document its shape for the
reader; a consumer references an entry by its id.

---

## 8. Authoring rules

A technique's interface stays workflow-agnostic; the full set lives in
[`workflows/workflow-design/resources/anti-patterns.md`](../workflows/workflow-design/resources/anti-patterns.md).
The protocol-relevant rules:

- An input or output describes what a value is — its meaning, shape, allowed values. A technique names
  another technique only in `## Protocol` or `## Capability`, as utilisation ("use
  `cargo-operations::fmt-fix`").
- A protocol references data by its Input/Output id. An artifact filename lives in the `#### artifact`
  declaration (literal, `{token}`-template, or discriminator-keyed).
- A capability or description states what a construct is; the sequence of steps and phases lives in
  `protocol[]`.
- A behavioral constraint is a rule (`## Rules`); a description states meaning.
- A resource describes what it is; it does not name the techniques that use it.

---

## 9. Validation

The server validates every parsed technique against `TechniqueSchema` (zod) before delivery; on
failure it logs a warning and treats the technique as unloadable. A technique declares
`metadata.version` and `## Capability`; a technique that does work declares a `## Protocol`. An
activity's `::` references resolve to a technique or rule — an `unresolved` entry in a bundle is a
definition defect, which the definition-lint gate enforces.

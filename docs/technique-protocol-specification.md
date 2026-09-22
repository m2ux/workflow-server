# Technique protocol specification

## Before the formal rules

### Who this is for

Workflow authors and contributors who write or change technique markdown.

A technique is a reusable capability file — what it does, what it needs, the ordered steps to follow, and any rules that hold across them — which an activity step names so that the agent knows how to act. That chain is the product model in full: a user's goal becomes a workflow, a workflow is a sequence of activities, an activity's steps name techniques, and a technique reaches for tools.

### Writing one

Put the file under a workflow's `techniques/` directory, in one of the shapes §2 sets out. Give it a clear capability statement, inputs and outputs where they earn their place, and an ordered protocol. Then reference it from an activity step, and the server loads and composes it as the run reaches that step.

### How to read the rest

Everything from §1 onward is the normative contract — addressing, composition and delivery — and it is written to be precise rather than brisk. The identifiers in it are the contract, so they appear exactly as the loader expects them.

### Where the implementation lives

The loader validates against [the Zod source](../src/schema/technique.schema.ts), and [`technique.schema.json`](../schemas/technique.schema.json) is its hand-maintained, editor-facing mirror. Reading a technique off disk is split between [the markdown loader](../src/loaders/markdown-technique-loader.ts) and [the resolver](../src/loaders/technique-loader.ts). For a short catalogue of the tools involved, see the [API reference](api-reference.md).

---

## 1. The technique model

A technique is a unit of reusable procedure and interface: a capability statement, an optional typed
interface (inputs and outputs), an ordered protocol, and optional rules. Techniques are the leaf of
the `Goal → Workflow → Activities → Techniques → Tools` model — an activity step names a technique, and the
technique tells the agent how.

A technique can contain other techniques, nested within its folder. A nested technique is a
technique; it sits deeper in the containment tree and takes contract from its ancestors (§5).

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

## Outputs           (optional)
### <output-id>
<description>
#### <member>        (optional: a component of this output)
<member description>
##### <field>        (optional: a field one entry of this member carries)
<field description>
#### entry           (optional: this output IS a list; its ##### are one entry's fields)
##### <field>        (a field one entry of this output carries)
<field description>
#### artifact        (optional: the persistence filename)
`<filename-or-{token}-template>`
#### audience        (optional: the intended reader — human | agent)
`agent`

## Protocol          (present when the technique does work)
### <N>. <Title>
- <imperative step that binds {$local_var}>
- <imperative step that reads {local_var}>

## Rules             (optional)
### <rule-name>
<rule text>
```

### 3.1 Frontmatter and Capability

- Frontmatter declares `metadata.version`; the loader uses it as the technique's version.
- `## Capability` is a single paragraph stating what the technique does.

### 3.2 Inputs and Outputs

Each `### <id>` under `## Inputs` / `## Outputs` is an entry: a description, optionally with `####`
sub-section members. The section headers are exactly the plural `## Inputs` and `## Outputs`; the
loader rejects the singular `## Input` / `## Output` (and `## Output(s)`) variants with a parse error.

- `#### <member>` is a named component of the entry (`components[member]`).
- `##### <field>` (Outputs) is a field one ENTRY of that component carries, where the component holds
  a list (`components[member].entry[field]`). A component with fields becomes an object carrying its
  description and them; one without stays the description string. This is what makes a read off a
  loop's item checkable: the item name is introduced by the loop and appears in no signature, so
  without the declaration a step reading `{item.summary}` is making a claim nothing can settle.
- `#### entry` (Outputs) is reserved, for an output that IS a list rather than a value with parts.
  Its `#####` children are the fields one entry carries (`entry[field]`), and its presence is how an
  output states that it is a list. Reserving the name is what keeps `####` meaning one thing: a part
  of the value everywhere else, never a field of each entry depending on the output's shape.
- `#### artifact` (Outputs) is the persistence filename — a literal (`code-review.md`) or a
  `{token}`-template the worker interpolates at runtime (`{package_name}-plan.md`, the token being a snake_case symbol).
  One filename per output: one path segment ending in an extension, with `{token}` placeholders standing where
  literal text would. The loader rejects anything else — a technique whose artifact body is prose, several
  names, or a declaration key is dropped with a logged warning, as a mistyped `audience` is. A technique that
  writes several files declares one output per artifact; a name selected by a mode is one op per mode.
- `#### audience` (Outputs) is the intended reader of the output/artifact — `human` or `agent`.
  Absent means `human`. An `agent`-audience artifact is serialized as **JSON** on disk (named under
  the same `artifactPrefix` rule as any artifact); a `human`-audience artifact is prose markdown.
- `#### default` (Inputs) is the input's default value.
- An entry whose description opens with `optional` (e.g. `*(optional)*`) is `required: false`.

`parseEntrySubsections` splits an entry's lead description from its `####` members for both inputs
and outputs.

##### Choosing the audience

`audience` makes format follow function, so pick it from who reads the artifact:

- **`agent`** — an artifact written *only* for the next agent to consume as state: ID-bearing
  tables, routing / reconciliation / index state, anything a later step reads back mechanically.
- **`human`** — an artifact a person reads linearly: design write-ups, summaries, READMEs.
- **absent ⇒ `human`** — the default when a declaration omits `audience`.

Anti-patterns, per side:

- **`agent`**: no prose narrative and no restating another artifact — reference it by ID or link and
  keep the content structured JSON.
- **`human`**: keep the existing state-once, single-source-and-link, and exception-only reporting
  discipline.
- **cross-cutting**: don't serialize agent state as prose, and don't dress a human document up as a
  data dump.

The attribute states *who reads* an artifact and *that* an agent artifact is JSON. It does not fix
the shape of any particular JSON payload — the per-artifact field schemas belong to each artifact's
own creation guide.

###### Naming the reader and converting the file are one act

Because `agent` implies JSON on disk, a declaration cannot name a later step as the reader while the
file is still markdown. An ID-bearing register in that position therefore carries **no** `audience`
at all until it is converted: a declaration states the reader of the artifact as it exists, and the
absent case is the honest one while the format is in transit.

The registers waiting are listed in the conversion issue, and `check-audience` deliberately does not
require presence, so the wait is not a standing failure.

#### Symbols and naming

A technique has one namespace of **mutable symbols**, and direction is structural rather than
spelled: an Input is populated on entry, an Output is exposed on completion, and a protocol variable
(§3.3) is neither. A symbol may be declared in **both** Inputs and Outputs — the idempotent
receive-or-compute-then-expose case — which is what lets a value one technique produces be hoisted to
a common ancestor (§5) as a shared input, with the producing technique additionally declaring it as
an output.

How an id is spelled, why a symbol id is `snake_case` where a name is `kebab-case`, and how an id's
grammatical shape encodes its kind are in [identifier conventions](identifier-conventions.md). Those
rules bind here and corpus-wide; `check:technique-template` enforces them on this file shape.

### 3.3 Protocol

`## Protocol` is an ordered list of blocks `{ title?, steps[] }`:

- A `### <N>. <Title>` sub-heading is a titled block; its bullets (or numbered items) are the block's
  `steps`, and the ordinal prefix is dropped from the title.
- A flat numbered or bulleted body is one untitled block.

Titled blocks group a protocol's phases; a flat list suits an atomic procedure. Every block belongs
to the technique that authors it — a title carries no composition meaning.

A step is an imperative action the agent performs. A standing prohibition, invariant, or precondition
is not a step: a constraint that governs the technique (or several steps) is a rule (§3.4); a
constraint that qualifies ONE step's action either folds inline as a guard ("append the attestation —
but only after the user has signed off") or, when it is a distinct caveat/fallback/conditional ("If
the PR has not merged, wait"), is written as a markdown blockquote **`>` note immediately beneath that
step's bullet**. The `>` note folds into the step as a continuation, keeping the constraint attached;
authoring it instead as an indented sub-bullet is wrong — the parser's step regex treats a `  - …`
line as a new step and flattens the caveat into a disconnected peer step (AP-56). A bullet whose whole
substance is "never X" or "always Y" with no action of its own is mis-modelled and belongs in a rule
or a note. (A genuine enumeration or sequential sub-step legitimately stays a sub-bullet.)

#### Protocol variables, declared once

A step may bind an intermediate value for later steps to read.
The binding carries the dollar sigil — `{$name}`, snake_case, a protocol variable being a symbol
(§3.2) — and marks the single point where the value is produced. **Every later reference drops the `$`
and reads it as `{name}`**, identical in form to an interface designator.

The `$` is the act of declaration, as `let` is in a programming language, not a per-occurrence marker.
Write `{$name}` once and `{name}` thereafter.

A protocol variable is scoped to one protocol run: one step creates it, later steps consume it. It is
*not* part of the technique's interface. It is neither an Input, a value the technique receives from
its caller, nor an Output, a value the technique returns. It is not delivered in the bundle and is not
`::`-addressable. Use it for technique-internal data — a captured artifact path, an assembled context
block, a parsed intermediate.

A step creates one with an explicit verb: "Capture `{$structural_path}` from the worker's response",
or "Build `{$verified_knowledge}` from `{gap_data}`". Later steps reference it bare
(`{structural_path}`). The sigil already marks the binding, so the prose should not narrate it: name
the value in place as an appositive — "the component git directory `{$component_git_dir}`" — or let it
fall out of the producing verb, rather than restating the mechanism with "bind it to …".

The binding must textually precede every read. Where a value is produced in mutually exclusive
branches, each producing branch carries the sigil, since it is bound on exactly one path at runtime;
reads after the branches rejoin stay `{name}`.

The classification test: a value the technique computes itself is a protocol variable, never an Input.
A value a caller consumes is an Output, never a protocol variable.

Two defects follow from the declare-once form, and the resolvability audit flags both. A `{name}` read
that is neither a declared input or output nor bound by any `{$name}` is an **unbound local** — consume
with no produce. A `{$name}` binding never read as `{name}` is a **dead binding** — produce with no
consume.

Rendering note: every reference is written in backticks (§4) — `` `{id}` ``, `` `{$name}` ``,
`` `{name}` `` — so a protocol variable's `$` always sits inside a code span and is math-exempt; the
old `{\$name}` escape is obsolete. Escaping now concerns only a LITERAL `$` left in rendered prose
outside code (a price `\$0.05`, a `${VAR}` shown in running text), which GitHub-flavored markdown would
otherwise read as an inline-math delimiter — backslash-escape it (`\$` renders as a literal `$`). A `$`
already inside a code span or fenced block is math-exempt and stays raw.

### 3.4 Rules

`### <rule-name>` under `## Rules` is a cross-cutting behavioral constraint — an invariant that
governs the technique as a whole, not a single action. A rule lives at the smallest containment scope
that covers everything it governs:

- A constraint specific to one step belongs in that step, not in `## Rules`.
- A constraint a protocol step already states is not restated as a rule.
- A constraint shared by sibling techniques belongs on their common container — the group or
  workflow-root `TECHNIQUE.md` — which delivers it to each by inheritance (§5), not duplicated onto
  each sibling.
- A constraint that governs only one child belongs on that child, not on the container.

A `<rule-name>` is `kebab-case`, and states the invariant it guards as a positive assertion — see
[identifier conventions](identifier-conventions.md#rule-names-state-the-invariant).

### 3.5 Error handling

An error arises from a specific step's action, so its handling lives in that step: the step states the
failure condition and the recovery inline ("if the type check fails, surface the diagnostics and
retry"). A recovery that applies another technique names it inline, as any protocol technique
reference ("apply `lint::autofix`").

---

## 4. Addressing

A technique reference is a `::`-delimited path:

```
[<workflow>::]<technique>[::<nested>[::<nested>…]]
```

- The workflow is implicit for a same-workflow reference; a leading `<workflow>::` targets another
  workflow. The leading segment names a workflow when the corpus declares one of that name and at
  least one segment follows it — a workflow is a workflow from the moment its `workflow.yaml`
  exists, whether or not it has written a technique yet. Otherwise every segment is a path inside
  the referring workflow's own `techniques/`.
- `<technique>` delivers the technique itself.
- `<technique>::<nested>` addresses a technique within `<technique>`'s folder; deeper segments recurse
  into deeper folders. Depth is unbounded.
- A trailing segment matching a rule name resolves to that rule; `<technique>::<group>` expands to
  every rule named `<group>-*`.
- A `<workflow>/<technique>` (slash) form spells the same workflow prefix. The slash carries no
  other meaning: it appears once, before the technique, and always names a workflow.
- A reference carrying an empty segment (`::op`, `group::`, `a::::b`), or a slash anywhere else,
  addresses no file under any reading and is refused at load with a message naming this rule.

`parseTechniqueRef` ([`src/loaders/technique-ref.ts`](../src/loaders/technique-ref.ts)) is the one
implementation of the rule above: the loader's read and compose paths and the binding-fidelity guard
all reach it, so a `::` path means one thing wherever it is read. `resolveTechniques` looks the
parsed reference up with the current-workflow-first precedence of §2.

### 4.1 Executable references (`::`) vs symbol references (`.`)

A `::` path is an **executable reference** — it names a technique or operation to apply/invoke
("apply `lint::autofix`", "go through `index::context`"). The
rule-resolution and group-expansion forms above are the bundle layer: how an activity's technique
list pulls rule entries into delivery.

A `.` path is a **symbol reference** — it names an addressable symbol (a rule) by walking its
ancestry, without invoking anything: `[<workflow>.]<technique>.<rule-name>` (e.g.
`build.validate.no-network-here`). A protocol step that cites or relies on a rule
uses the dotted symbol address — never prose ("per the index-freshness rule") and never the `::`
executable form. The workflow segment is implicit for a same-workflow reference; when the rule is in
the citing technique's own ancestry (its own rule, or one it inherits from a containing group or the
workflow root) the reference shortens to the bare rule name reachable by walking up — the full path
is needed only to reach a rule outside the current ancestry.

The distinction is invoke vs name: `::` invokes a technique; `.` names a symbol. A rule is named, not
invoked.

### 4.2 Invocation arguments (`(…)`)

When a protocol step invokes an operation with arguments, the argument list is written in
**parentheses attached to the operation reference** — `[group](path)::[op](path)(arg: value, …)` —
never in curly braces. Curly braces are reserved for the designator namespace (`{input_id}`,
`{output_id}.field`, `{$local}`); a brace-wrapped argument list (`::op {arg: value}`) collides with
that namespace and cannot be told apart from a designator. Inside the parens, an argument value that
is itself a variable or input keeps its designator brace (`::context(name: {$symbol})`); a literal
value stays bare (`::detect-changes(*diff_scope*: 'compare')`); the argument keys are the
operation's own parameter names and are italicised, which keeps them out of the brace namespace
values use and the backtick namespace code tokens use. The distinction parallels §4.1: `()` carries the call
shape, `{}` carries the data reference — parentheses call, braces name.

### 4.3 Backticking

Every LITERAL CODE-LIKE TOKEN in rendered prose is written in backticks, so code reads as code and
never as a prose word. The kinds: a **designator** (`` `{id}` `` / `` `{id}.field` ``, `` `{$name}` ``
/ `` `{name}` ``); a **symbol (rule) address** (`` `technique.rule-name` ``); a **CLI/shell command**
(`` `git -C {repo_root} remote get-url origin` ``, `` `gh pr ready` ``); an **MCP tool call**
(`` `get_workflow('<workflow_id>')` ``) or **resource URI** (`` `concept-rag://activities` ``); and a
**literal path or filename** (`` `/tmp/pr-body.md` ``, `` `START-HERE.md` ``). A token already inside a
larger code span is not wrapped again (no nesting). A token that CONTAINS a designator is ONE span with
the braces inside it — `` `git -C {repo_root} remote get-url origin` ``, `` `report-{section_name}.md` ``
— never split into adjacent spans and never with a designator's backticks butting a literal with no
separator (CommonMark mis-parses adjacent code spans). Markdown hyperlinks (`[text](path)`) and the
`::` / `.` link targets of an executable or symbol reference carry their own markup — they are not
backticked; only an invocation's argument VALUES are. Backticks are formatting, not braces: resolution
keys off the braces, and because a backticked `$` is math-exempt this retires the bare-prose `{\$name}`
escape (§3.3). A code token left un-backticked in prose is a defect (AP-59); a token with backticks but
no braces is still an unanchored reference (AP-49).

---

## 5. Contract inheritance

A container `TECHNIQUE.md` — a group's or the workflow root's — defines Inputs, Outputs, and Rules
shared by the techniques it contains. Keyed sections union, with the technique-local entry taking
precedence by id or name.

### What merges, and how

Both delivery paths (`get_technique` and the `get_activity` / `get_workflow` bundle) use the same
`composeLoaded` implementation. In memory the merge is complete. On the wire:

- **Inputs and Outputs**: merged from every ancestor container outward to the executing workflow root;
  the technique-local entry overrides any ancestor entry of the same id. Own entries ride the body;
  ancestor entries ride that ancestor's block under `contracts`.
- **Rules**: merged from every ancestor container; the technique-local entry overrides any ancestor
  entry of the same name. Own rules ride the body. Shared rules ride `contracts`. Role-level rules
  that govern no one operation remain `rule` entries in the bundle's `rules` list (§6.2).

A container contributes a contract, never a procedure. Protocol does not inherit: a technique's
`## Protocol` is delivered as authored, and the steps a shared stage owns belong to the activity or
routine that binds both operations rather than to the folder that holds them.

### Whose ancestors count

Ancestry follows the executing workflow: the containers considered are the executing workflow's root
`TECHNIQUE.md` and each containing group's `TECHNIQUE.md` along the technique's path. Containers
from a different (source) workflow — relevant when a meta technique is used in another workflow's
session — are not included; only the executing workflow's containers apply.

---

## 6. Delivery

### 6.1 Body

A delivered technique body (`projectTechniqueBody` / `projectTechniqueWire`) carries `capability`,
`inputs?` as authored on that technique, `protocol?`, `outputs?`, the rules that technique itself
declares, and `inherits` naming the ancestor scopes whose contracts ride beside it.

### 6.2 Bundle

`formatTechniqueBundle` produces:

| Key | Contents |
|-----|----------|
| `techniques` | Each delivered technique body, keyed by path — a nested technique by its full `::` path (e.g. `validate::analyse-failure`), a standalone by its id. Own rules ride the body; `inherits` names the scopes in `contracts`. |
| `contracts` | Each ancestor's authored rules and shared inputs/outputs, once per scope id. |
| `rules` | `[name, text]` pairs: the role's own rules, which govern no one operation. |
| `unresolved` | References that did not resolve (a non-empty list is a definition defect). |

### 6.3 Activity bundling

`get_activity` and `get_workflow` deliver an activity's `techniques[]` through this bundle;
`get_technique` delivers a single technique via `composeTechnique` projected with
`projectTechniqueWire`, and carries the named `contracts` beside that body.

### 6.4 Binding

The engine binds by name: workflow state variables (a worker sets them from a technique's result) and
the entry ids a consumer references. The `####` components of an entry document its shape for the
reader, and the `#####` fields beneath a component document what one entry of it carries; a consumer
references an entry by its id. Both levels are what a read addressing into a value is held against —
`binding-fidelity` reports a member no component declares, and a field no component's entry declares.

### 6.5 Step manifest

A worker reports what a step produced through the `step_manifest` entry `output` field passed to
`next_activity` (one entry per completed step, keyed by `step_id`). `output` is a JSON object keyed
by the output id the bound operation declares, whatever the number of outputs — a step with one
output reports `{"needs_migration": false}`, a step with several reports
`{"repo_root": "lib/x", "component_name": "x"}`. A step-bound technique's `provenance_note` cites
this form at point of use.

A key the operation does not declare lands a value under a name nothing downstream reads, and is
surfaced in `_meta.validation`. The converse is not reported: an output can be optional, and a
gated path or an error answer produces fewer values than the declarations allow, so a declared id
with no key is as often the run as the report.

An output lands in the session bag under its declared id, unless the step binding remaps it — in
which case the step-bound `get_technique` delivery annotates that output with a `destination:` line
naming the bag variable it lands under (§6.1 delivers `destination:` only on remapped outputs).

---

## 7. Authoring rules

A technique's interface stays workflow-agnostic; the full set lives in
[`workflow-design/resources/anti-patterns.md`](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/anti-patterns.md) (on the `workflows` branch).
The protocol-relevant rules:

- An input or output describes what a value is — its meaning, shape, allowed values. A technique names
  another technique only in `## Protocol` or `## Capability`, as utilisation ("use
  `lint::autofix`").
- A protocol references data by its Input/Output id. An artifact filename lives in the `#### artifact`
  declaration (literal or `{token}`-template), one filename per output.
- A capability or description states what a construct is; the sequence of steps and phases lives in
  `protocol[]`.
- A protocol step is an action. A standing prohibition or invariant is a rule (§3.4) or a guard
  folded into the step it qualifies — never a step on its own.
- A behavioral constraint is a rule (`## Rules`); a description states meaning. A rule lives at the
  smallest container that covers what it governs (§3.4): inline in a step if step-specific, on the
  common container if shared by siblings, on the child if it governs only that child.
- A resource describes what it is; it does not name the techniques that use it.
- An identifier's alphabet and grammatical shape both carry meaning — see
  [identifier conventions](identifier-conventions.md).

---

## 8. Validation

The server validates every parsed technique against `TechniqueSchema` (zod) before delivery; on
failure it logs a warning and treats the technique as unloadable. A technique declares
`metadata.version` and `## Capability`; a technique that does work declares a `## Protocol`. An
activity's `::` references resolve to a technique or rule — an `unresolved` entry in a bundle is a
definition defect, which the definition-lint gate enforces.

The file shape of §3 is normative, and the `check:technique-template` guard
(`guards/check-technique-template.ts`, run by `check:all`) enforces it corpus-wide: frontmatter
carries `metadata.version` and nothing else; no H1 title; the H2 sections are the canonical five in
canonical order (Outputs precede Protocol); entry ids are `snake_case`, a tool-parameter mirror
keeping the tool's spelling; rule names are `kebab-case`; every `{$name}` binding is
`snake_case`. `README.md` navigation docs inside `techniques/` are exempt.

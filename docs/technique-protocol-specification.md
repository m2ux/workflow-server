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

## Outputs           (optional)
### <output-id>
<description>
#### <member>        (optional: a component of this output)
<member description>
#### artifact        (optional: the persistence filename)
`<filename-or-{token}-template>`

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
- `#### artifact` (Outputs) is the persistence filename — a literal (`code-review.md`) or a
  `{token}`-template the worker interpolates at runtime (`{package_name}-plan.md`, the token being a snake_case symbol).
- `#### default` (Inputs) is the input's default value.
- An entry whose description opens with `optional` (e.g. `*(optional)*`) is `required: false`.

`parseEntrySubsections` splits an entry's lead description from its `####` members for both inputs
and outputs.

#### The symbol model

A technique has one namespace of **mutable symbols**. Direction is **structural — carried by the
section a symbol is declared under, never by its spelling**:

- An **input** (`## Inputs`) is a symbol *populated on entry* — by the caller, or by an upstream
  technique's output bound to it. Optional inputs may be absent and fall back to `#### default`.
- An **output** (`## Outputs`) is a symbol *exposed at the technique's surface on completion*.
- A **protocol variable** (`{$name}`, §3.3) is a symbol created and used within one protocol run,
  neither received nor exposed.

A symbol may be declared in **both** Inputs and Output. This is not a contradiction: it means the
symbol arrives populated **if** the caller provides it, may be mutated or freshly computed during the
protocol, and its final value is exposed on completion. An idempotent resolver (receive-or-compute,
then expose) is the canonical case, and it is exactly why a value that one technique produces and
others consume can still be hoisted to a common ancestor (§5): declare it as a shared input on the
ancestor, and the producing technique additionally declares it as an output.

**Symbol ids are `snake_case`; names are `kebab-case`.** The two namespaces are distinct:

- A **symbol** — an input, output, or protocol variable — becomes a **runtime variable**. The engine
  stores variables in a name-keyed bag and resolves references by **exact string match**
  (`getVariableValue`); the agent sets a variable under the name the prose dictates, and activity
  conditions/transitions read it by that same name. So a symbol id must be the *same string* as the
  variable it binds to. Activities, conditions, and session state are authored in `snake_case`
  (`target_path`, `is_review_mode`, `planning_folder_path`), so **symbol ids are `snake_case`** — and
  protocol variables follow suit (`{$resolved_content}`). Case carries no meaning beyond this; it does
  **not** distinguish input from output (direction is structural). An id that mirrors an external tool
  / MCP / CLI parameter takes that **tool's exact spelling** — usually already snake (`session_index`,
  `repo_path`), occasionally camelCase (Atlassian's `cloudId`) — so it binds natively with no
  translation.
- A **name** — a technique, operation, or resource identity, and the file / hyperlink / `::` target
  that addresses it — is a slug, never an evaluated variable, and is **`kebab-case`**
  (`create-issue`, `gitnexus-operations`, `resolve-cloud-id.md`). **Rule names are names too**: a rule
  is never an evaluated variable; it is cited by its dotted symbol address `[workflow.]technique.rule-name`
  (§4.1), sitting beside the kebab technique name, so a rule name is `kebab-case` and the citation reads
  uniformly (`gitnexus-operations.index-freshness-first`).

The split is the classical one: evaluated identifiers are snake (a `-` is the subtraction operator),
surface/slug tokens are kebab. Here it is also a binding requirement — a kebab symbol id would not
match the snake variable the engine looks up.

#### Naming structure

Beyond case (above), a symbol id's **grammatical shape encodes its kind**, so a reader infers from the
shape alone whether a value is a flag, a scalar, a collection, or a map:

- A **boolean** is an **affirmative predicate** — the statement that holds when the value is `true`
  (`squash_merge_supported`, `index_fresh`, `pr_merged`), so a condition reads as an assertion. An
  `is_`/`has_`/`can_`/`should_` prefix is **value-gated**, added only where it sharpens the predicate,
  not mandatory: a bare affirmative noun phrase or a past-participle result flag (`worktree_created`,
  `review_passed`, the `*_confirmed` cluster) already states the condition that holds and is conformant
  as written. A negated stem (`not_ready`), a generic-noun id that buries the predicate (`…_flag`,
  `…_status`, `…_check`), or an ambiguous noun is non-conformant.
- A **collection** iterated as a whole is a **plural item noun** (`tasks`, `failures`,
  `open_assumptions`) with no `_list`/`_array`/`_collection`/`_set` representation suffix; a value
  addressed **by key** is **singular** and names the mapping (`domain_to_range`). Shape, not the
  underlying container type, decides.
- An **I/O id** is a **qualified noun phrase, head noun last** — adjectival/role qualifiers precede the
  head, and the rightmost token is the thing the value IS (`reconciled_assumptions`, `lint_diagnostics`).
  One concept carries one name corpus-wide (hoist to the common ancestor per §5 rather than letting
  per-technique synonyms drift). The representation is never part of the id (`assumptions-log`, not
  `assumptions-log-path`) and direction is never encoded in the id (it is structural). A legitimate
  **kind suffix** that IS the concept — `_mode`, `_type` for an enum/mode discriminator — is a head
  noun and stays.

This is the structural complement to the case rule: case settles which alphabet an id uses, structure
settles which words and in what order. See AP-60.

### 3.3 Protocol

`## Protocol` is an ordered list of blocks `{ title?, steps[] }`:

- A `### <N>. <Title>` sub-heading is a titled block; its bullets (or numbered items) are the block's
  `steps`, and the ordinal prefix is dropped from the title.
- A flat numbered or bulleted body is one untitled block.

Titled blocks group a protocol's phases; a flat list suits an atomic procedure. The titles `Initial`
and `Final` position an ancestor's content around its descendants (§6).

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

**Protocol variables (declare-once).** A step may bind an intermediate value for later steps to read.
The binding is written with the dollar sigil — `{$name}` (snake_case — a protocol variable is a symbol,
§3.2) — and marks the single point where the value is produced; **every later reference drops the `$`
and reads it as `{name}`**, identical in form to an interface designator. The `$` is therefore the act
of declaration (as `let` is in a programming language), not a per-occurrence marker: write `{$name}`
once, `{name}` thereafter. A protocol variable is scoped to a single protocol run — one step creates
it, later steps consume it — and is *not* part of the technique's interface: it is neither an Input (a
value the technique receives from its caller) nor an Output (a value the technique returns), is not
delivered in the bundle, and is not `::`-addressable. Use it for technique-internal data — a captured
artifact path, an assembled context block, a parsed intermediate. A step creates one with an explicit
verb ("Capture `{$structural_path}` from the worker's response"; "Build `{$verified_knowledge}` from
`{gap_data}`") and later steps reference it bare (`{structural_path}`). The sigil itself marks the
binding, so the prose need not — and should not — narrate it: name the value in place as an appositive
("the component git directory `{$component_git_dir}`") or let it fall out of the producing verb, rather
than restating the mechanism with "bind it to …". The binding must textually
precede every read; when a value is produced in mutually-exclusive branches, EACH producing branch
carries the sigil (`{$name}`) — it is bound on exactly one path at runtime — and reads after the
branches rejoin stay `{name}`. The classification test: a value the technique computes itself is a
protocol variable, never an Input; a value a caller consumes is an Output, never a protocol variable.
Two defects follow from the declare-once form: a `{name}` read that is neither a declared input/output
nor bound by any `{$name}` is an **unbound local** (consume with no produce); a `{$name}` binding never
read as `{name}` is a **dead binding** (produce with no consume) — the resolvability audit flags both.

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

A `<rule-name>` is a **positive declarative assertion of the invariant it guards** — it names the
state that must hold, not a negation or a process narration (`assumptions-resolved-before-review`, not
`do-not-review-unresolved`; a grouped-key + qualifier slug stays positive, `commit.signed` not
`commit.not-unsigned`). The positive form is preferred only where it reads at least as clearly; a
negation that carries irreplaceable clarity (`no-cargo-here`, `do-not-mask-flaky`, `never-resume`) is
the right name and stays. Rule names are `kebab-case` (§3.2 — a rule is a name, never an evaluated
variable). See AP-60.

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

### 4.1 Executable references (`::`) vs symbol references (`.`)

A `::` path is an **executable reference** — it names a technique or operation to apply/invoke
("apply `cargo-operations::fmt-fix`", "go through `gitnexus-operations::context`"). The
rule-resolution and group-expansion forms above are the bundle layer: how an activity's technique
list pulls rule entries into delivery.

A `.` path is a **symbol reference** — it names an addressable symbol (a rule) by walking its
ancestry, without invoking anything: `[<workflow>.]<technique>.<rule-name>` (e.g.
`meta.gitnexus-operations.index-freshness-first`). A protocol step that cites or relies on a rule
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
value stays bare (`::diagram-source-select(diagram_type: 'package')`); the argument keys are the
operation's own parameter names and stay bare. The distinction parallels §4.1: `()` carries the call
shape, `{}` carries the data reference — parentheses call, braces name.

### 4.3 Backticking

Every LITERAL CODE-LIKE TOKEN in rendered prose is written in backticks, so code reads as code and
never as a prose word. Five kinds: a **designator** (`` `{id}` `` / `` `{id}.field` ``, `` `{$name}` ``
/ `` `{name}` ``); a **symbol (rule) address** (`` `technique.rule-name` ``); a **CLI/shell command**
(`` `git -C {reference_path} remote get-url origin` ``, `` `gh pr ready` ``); an **MCP tool call**
(`` `get_workflow('work-package')` ``) or **resource URI** (`` `concept-rag://activities` ``); and a
**literal path or filename** (`` `/tmp/pr-body.md` ``, `` `START-HERE.md` ``). A token already inside a
larger code span is not wrapped again (no nesting). A token that CONTAINS a designator is ONE span with
the braces inside it — `` `git -C {reference_path} remote get-url origin` ``, `` `portfolio-{lens_name}.md` ``
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

Both delivery paths (`get_technique` and the `get_activity` / `get_workflow` bundle) use the same
`composeLoaded` implementation:

- **Inputs / Output**: merged from every ancestor container outward to the executing workflow root;
  the technique-local entry overrides any ancestor entry of the same id.
- **Rules**: merged from every ancestor container; the technique-local entry overrides any ancestor
  entry of the same name. On the bundle path rules are additionally emitted as separate `rule`
  entries (§7.2) so they can be addressed and selectively included.
- **Protocol**: wrapped with every ancestor's `Initial` and `Final` blocks via
  `wrapProtocolWithAncestors` (the full ancestor chain, not the root only — see §6).

Ancestry follows the executing workflow: the containers considered are the executing workflow's root
`TECHNIQUE.md` and each containing group's `TECHNIQUE.md` along the technique's path. Containers
from a different (source) workflow — relevant when a meta technique is used in another workflow's
session — are not included; only the executing workflow's containers apply.

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

A delivered technique body (`projectTechniqueBody`) carries `capability`, `inputs?`, `protocol?`
(wrapped per §6), and `outputs?`. A technique's rules are delivered as `rule` entries (§7.2).

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
[`workflow-design/resources/anti-patterns.md`](https://github.com/m2ux/workflow-server/blob/workflows/workflow-design/resources/anti-patterns.md) (in the `workflows` branch/submodule).
The protocol-relevant rules:

- An input or output describes what a value is — its meaning, shape, allowed values. A technique names
  another technique only in `## Protocol` or `## Capability`, as utilisation ("use
  `cargo-operations::fmt-fix`").
- A protocol references data by its Input/Output id. An artifact filename lives in the `#### artifact`
  declaration (literal, `{token}`-template, or discriminator-keyed).
- A capability or description states what a construct is; the sequence of steps and phases lives in
  `protocol[]`.
- A protocol step is an action. A standing prohibition or invariant is a rule (§3.4) or a guard
  folded into the step it qualifies — never a step on its own.
- A behavioral constraint is a rule (`## Rules`); a description states meaning. A rule lives at the
  smallest container that covers what it governs (§3.4): inline in a step if step-specific, on the
  common container if shared by siblings, on the child if it governs only that child.
- A resource describes what it is; it does not name the techniques that use it.
- An identifier's grammatical shape encodes its kind (§3.2): a boolean is an affirmative predicate
  (prefix value-gated), a collection is a plural item noun and a key-addressed map is singular, an I/O
  id is a qualified noun phrase with the head noun last, and a rule name is a positive declarative
  assertion of the invariant it guards (§3.4). See AP-60.

---

## 9. Validation

The server validates every parsed technique against `TechniqueSchema` (zod) before delivery; on
failure it logs a warning and treats the technique as unloadable. A technique declares
`metadata.version` and `## Capability`; a technique that does work declares a `## Protocol`. An
activity's `::` references resolve to a technique or rule — an `unresolved` entry in a bundle is a
definition defect, which the definition-lint gate enforces.

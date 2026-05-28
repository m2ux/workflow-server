---
name: workflow-canonical
description: >
  Canonical ontology for workflow skills. Defines Skill, Technique,
  Role, Tool — what they are, how they compose on disk, and how
  cross-references resolve. This is the ontology's definition resource:
  a governed skill's `metadata.ontology: workflow-canonical` resolves
  here. Load once per session before interpreting such skills.
---

# Workflow-canonical ontology

Any skill whose frontmatter declares `metadata.ontology: workflow-canonical`
is interpreted according to this document. Read once per session;
contents do not change during execution.

## The four concepts

### Skill (the structural primitive — not a content kind)

A folder containing a `SKILL.md`, identified by its position in the
`skills/` directory tree. "Skill" is the **packaging**, not a kind of
content: every unit on disk — top-level or nested — is structurally a
skill. The kind of *content* a governed skill carries is declared as
`metadata.kind` — for this ontology, just `technique`. There is no
`skill` kind (skill = packaging) and no `meta-skill` kind: an ontology
definition (like this document) is a freeform **resource**, carrying no
`metadata.ontology` at all.

### Technique (the only content kind)

An independently-demonstrable unit of practice — `metadata.kind:
technique`. It is the sole kind of practice content; there is no
separate `deliverable` or `competency-bundle` kind.

The delegation boundary is **not** a technique property. A
`workflow.toon` activity binds a role to a technique **by name**; that
binding — not any frontmatter flag — marks the technique as the unit of
workflow delegation, and the technique's `Output` section names the
work product. Deliverable-ness is therefore a workflow-level binding
fact, not something a technique declares about itself. A technique that
no activity binds is an internal contributing unit.

A technique's **body** may be either **self-contained** (it states its
own procedure) OR **composing** (it references/sequences other
techniques). This is just what the body contains — not a recognised
"shape" or kind; the server does not distinguish the two:

- `implement-task` — composes sub-techniques and is bound by a workflow activity: the activity-bound composing technique.
- `write-task-code` — self-contained, bound by no activity: a contributing operation.

A **pure index/manifest** that only lists or points at other skills —
with no procedure or `Output` of its own (e.g. a `gitnexus` namespace
that merely groups endpoint-techniques) — is a freeform **resource**,
not a technique.

Techniques are **independent**: they do not declare ordering relative
to other techniques. Sequencing emerges from each technique's
preconditions and from role contracts. The agent assembles the
sequence at execution time.

### Role

A persona contract: responsibilities, authority, refusals, qualified
skills.

Has **no on-disk folder**. Role contracts live as `##` sections
within [workflow](../../workflow/SKILL.md) (e.g. `## Engineer`,
`## Reviewer`, `## Planner`).

Role-to-skill binding lives in `workflow.toon` activity definitions,
not in skill frontmatter.

### Tool

An external primitive: a binary, an MCP server, a CLI command, an
API. Tools have **no first-class on-disk representation**. Two
realisations:

- **Inline** — simple tools (`git`, `cargo`, Claude Code primitives)
  appear as bare command strings in technique procedure text.
- **Tool-dedicated namespace** — complex tools (`gitnexus`,
  `concept-rag`) warrant a namespace resource (no procedure or `Output`
  of its own) whose nested techniques each describe one API endpoint
  operationally. The namespace IS the tool's interface documentation;
  because it only groups its endpoint-techniques, it is a freeform
  resource, not a technique.

## Technique bodies

A technique's body may be either **self-contained** — it states its own
procedure (typically `## Pre-conditions`, `## Invariants`,
`## Procedure`, `## Output`, `## Refusal paths`) — or **composing** — it
references and sequences other techniques (e.g. via a `## Techniques`
section). This is the author's choice and is simply what the body
contains; it is not a recognised "shape" or kind, and the server does
not distinguish the two. A pure index/manifest that only lists or points
at other skills, with no procedure or `Output` of its own, is a freeform
resource rather than a technique.

## Cross-reference format

References between skills (including techniques, which are structurally
skills) are **file-relative markdown hyperlinks** to the target
`SKILL.md` — relative to the *referencing file's own directory*, so
they click through in any IDE / GitHub / markdown renderer:

```
[<skill-name>](<relative-path>/SKILL.md)
```

The link always ends in `/SKILL.md` so it resolves to a real, openable
file. `<skill-name>` is the link text — the target's `name` (its final
path segment), so the reference reads as the thing it names. The `../`
depth follows from where the two files sit. From a technique to a
sibling technique: `[<name>](../<name>/SKILL.md)`; from a technique to a
resource: `[<name>](../../resources/<name>/SKILL.md)`. Examples:

- [understand-task-context](understand-task-context/SKILL.md) — a
  nested child technique (one level down from the referencing file).
- [impact](../gitnexus/impact/SKILL.md) — an endpoint technique under a
  sibling `gitnexus` tool namespace.
- [dco-attest-commit](../workflow/dco-attest-commit/SKILL.md) —
  cross-bundle reference to a sibling bundle.

To reference a **specific operation or section** of another skill,
hyperlink BOTH parts — the skill name to its `SKILL.md` and the
op/section name to wherever it lives — joined by `::`, with any params
after:

```
[<skill>](../<skill>/SKILL.md)::[<op>](../<skill>/SKILL.md#<op>) (`{params}`)
```

When the operation lives in its own **child file** (the
`*-operations` pattern — see composition rule #2 below), the second
link targets the file directly with no anchor:

```
[<skill>](../<skill>/SKILL.md)::[<op>](../<skill>/<op>.md) (`{params}`)
```

e.g. `[gitnexus-operations](../gitnexus-operations/SKILL.md)::[impact](../gitnexus-operations/impact.md) (`{target, direction}`)`.
Within the same skill folder a sibling operation is `[<op>](<op>.md)`;
within the same file a section is `[<op>](#<op>)`.

At rest these are clickable file-relative hyperlinks (human navigation);
on delivery the server simplifies each to a bare **name** (`<skill>` or
`<skill>/<section>`) resolved by precedence via `get_skill`
(workflow-local → shared/), which also auto-detects governed-vs-resource
for delivery. The reference is ultimately the name; the file-relative
path is the at-rest human-navigable form.

## Composition rules

1. **One `SKILL.md` per folder**, mandatory. Filename uppercase
   (`SKILL.md`).
2. **Sub-files are reserved for the operations pattern.** Templates,
   criteria, primers — promote each to a named nested technique, OR
   fold into the relevant skill body. The only exception is the
   `*-operations` pattern: a skill whose body is a flat library of
   named, externally-callable operations may store one operation per
   sibling file (`<skill>/<op>.md`, no frontmatter — they are
   sub-documents of the parent skill, not skills in their own right).
   The parent `SKILL.md` is the index (Capability + Operations table +
   Rules) and each child file carries the operation's per-section shape.
   Protocol-style techniques (ordered numbered steps) MUST keep their
   protocol in `SKILL.md` — steps are sequential, not externally
   addressable.
3. **Every folder under `skills/` is a skill (structural).** Nested
   folders are nested skills. Arbitrary depth is permitted. The content
   kind is `metadata.kind` (`technique`); a `SKILL.md` with no
   `metadata.ontology` is a freeform resource.
4. **Nested-skill names are action-oriented, verb-phrased, and
   disambiguated.** Generic stubs are banned: `procedure`, `execute`,
   `main`, `step-1`, `do`, `run`. Disambiguation example:
   `understand-task-context` (under `implement-task`) vs
   `understand-codebase-context` (under `analyze-implementation`).
5. **Delegation is a workflow-level binding.** A `workflow.toon`
   activity binds a role to a technique **by name**; that binding marks
   the bound unit as the deliverable, and the technique's `Output`
   section names the work product. Techniques no activity binds are
   internal/contributing units. A pure index/manifest that only groups
   other skills (no procedure or `Output` of its own) is a freeform
   resource, not a technique.
6. **Composition is what a body contains, not a fixed shape.** A
   composing body references its sub-techniques (e.g. via a
   `## Techniques` section) without hard-sequencing them; a
   self-contained body composes tool invocations and judgement steps
   directly. The server does not distinguish the two.
7. **Techniques are independent.** They declare own preconditions /
   invariants / procedure / output / refusal-paths. They do NOT
   prescribe ordering relative to other techniques.
8. **Skills do not tell the agent how to interpret skills.** That is
   this ontology definition's job.

## Frontmatter schema

Frontmatter splits into two layers:

**Top-level fields (agentskills.io spec):**

| Field | Required | Values |
|---|---|---|
| `name` | yes | lowercase-kebab slug; matches the directory name |
| `description` | yes | 1–2 sentence summary (agentskills.io compatible) |

**Under `metadata:` (spec-blessed nesting for author-defined data) — governed skills only:**

| Field | Required | Values |
|---|---|---|
| `metadata.ontology` | yes (governed) | A **name** that resolves (by precedence — workflow-local → shared/) to this ontology's definition resource. For this ontology: `workflow-canonical`. |
| `metadata.kind` | yes (governed) | This skill's content kind: `technique`. |

There is no `produces` frontmatter field. Which technique a workflow
activity delegates to — and therefore which technique is the unit of
delegation — is declared in `workflow.toon` (an activity binds a role
to a technique **by name**), not by any frontmatter flag; the
technique's `Output` body section names the work product. A pure
index/manifest that only groups other skills, with no procedure or
`Output` of its own, is a freeform resource, not a technique.

A **resource** (like this document) carries neither `metadata.ontology` nor `metadata.kind` — only `name` + `description`. That absence is what makes it freeform and ungoverned.

**Why nested under `metadata:`?** The agentskills.io spec only blesses `name`, `description`, `license`, `compatibility`, `metadata`, and `allowed-tools` as top-level frontmatter fields. We place ontology entries under `metadata:` (a spec-approved map), keeping SKILL.md files spec-compliant and portable.

**Resolution convention.** `metadata.ontology` is a **name**. The agent resolves it by precedence — the current workflow's resource folder first, then `shared/` — to this definition resource (`shared/resources/workflow-canonical`), and loads it once. There is no `meta/` location convention and no `meta-skill` kind.

**No recursion.** This document is a *resource*: it carries no `metadata.ontology` of its own, so loading it never re-triggers the bootstrap. It defines the ontology; it is not governed by it.

Example (an activity-bound technique — its `Output` section names the work product; the activity binding lives in `workflow.toon`):

```yaml
---
name: implement-task
description: Produces a code change scoped to one task from a work-package plan.
metadata:
  ontology: workflow-canonical
  kind: technique
---
```

Example (a nested technique):

```yaml
---
name: write-task-code
description: Make code edits scoped to a single work-package task.
metadata:
  ontology: workflow-canonical
  kind: technique
---
```

## Agent bootstrap procedure

When the agent receives a workflow activity assignment:

1. Read the assigned skill via `get_skill(<name>)` — a workflow
   activity binds a role to a technique by name; the server
   auto-detects it as a technique and delivers it as TOON.
2. Inspect the skill's `metadata.ontology` field. If it names an
   ontology whose definition resource is not yet loaded, resolve the
   name (workflow-local → shared/) and load that resource FIRST, then
   apply its definitions.
3. For `metadata.ontology: workflow-canonical`: apply the rules in
   this document.
   - If the technique's body **composes** other techniques (has a
     `## Techniques` section), enumerate the referenced techniques but
     do NOT pre-fetch. Fetch each on demand when its preconditions are
     satisfied and the role contract calls for it.
   - If the body is **self-contained**, treat it as a procedure to
     execute directly.
4. Apply role contracts from [workflow](../../workflow/SKILL.md) per the
   activity's assigned role.
5. Honour refusal paths — they are non-negotiable stops, not
   advisory.

## Refusal paths (agent-level)

The agent must stop and surface to the user when:

- A referenced name fails to resolve via `get_skill`.
- A skill's `metadata.ontology` names an ontology whose definition
  resource is not resolvable.
- A governed skill's `kind` value is outside `{technique}` — undefined
  under this ontology.
- A technique's preconditions cannot be satisfied because a required
  upstream technique has not produced its expected output.
- A technique's invariant would be violated by the work the agent is
  about to perform.
- Two or more techniques' invariants conflict with each other and the
  agent cannot satisfy both.

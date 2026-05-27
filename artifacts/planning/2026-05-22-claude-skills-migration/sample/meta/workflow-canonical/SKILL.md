---
name: workflow-canonical
description: >
  Canonical ontology for workflow skills. Defines Skill, Technique,
  Role, Tool — what they are, how they compose on disk, and how the
  canonical specifier resolves. Bootstrap meta-skill: load once before
  interpreting any skill tagged with this ontology.
metadata:
  ontology: workflow-canonical    # self-referential bootstrap
  kind: meta-skill
---

# Workflow-canonical ontology

Any skill whose frontmatter declares `ontology: skill:meta/workflow-canonical`
is interpreted according to this document. Read once per session;
contents do not change during execution.

## The four concepts

### Skill (the only structural primitive)

A coherent unit of practice, identified by its position in the
`skills/` directory tree (a folder containing a `SKILL.md`). Two
kinds, declared in frontmatter:

- **deliverable** — produces a named work product. The unit of
  workflow delegation; a `workflow.toon` activity binds an agent to a
  deliverable skill.
- **competency-bundle** — a coherent grouping of related techniques.
  No deliverable of its own. Examples: `gitnexus` (tool operations),
  `workflow` (role contracts + orchestration techniques),
  `code-review` (review techniques).

### Technique

An independently-demonstrable unit of practice. Carries its own
preconditions, invariants, procedure, output, and refusal paths.
Reusable when extracted from any particular skill.

Structurally a nested skill — `skills/<owner>/<technique>/SKILL.md`
with frontmatter `kind: technique`. Same file shape as skills;
position in the tree distinguishes the two.

Techniques are **independent**: they do not declare ordering relative
to other techniques. Sequencing emerges from each technique's
preconditions and from role contracts. The agent assembles the
sequence at execution time.

### Role

A persona contract: responsibilities, authority, refusals, qualified
skills.

Has **no on-disk folder**. Role contracts live as `##` sections
within [skill:workflow](skill:workflow) (e.g. `## Engineer`,
`## Reviewer`, `## Planner`).

Role-to-skill binding lives in `workflow.toon` activity definitions,
not in skill frontmatter.

### Tool

An external primitive: a binary, an MCP server, a CLI command, an
API. Tools have **no first-class on-disk representation**. Two
realisations:

- **Inline** — simple tools (`git`, `cargo`, Claude Code primitives)
  appear as bare command strings in technique procedure text.
- **Tool-dedicated skill** — complex tools (`gitnexus`,
  `concept-rag`) warrant a competency-bundle skill where each nested
  technique describes one API endpoint operationally. The skill IS
  the tool's interface documentation.

## Top-level skill shapes

A top-level skill (kind=deliverable or kind=competency-bundle) is
either of two shapes — author's choice per skill:

### Navigator-style

`SKILL.md` is a thin navigator (~80 lines or less). Frontmatter +
optional context paragraphs + a `## Techniques` section listing
nested and cross-referenced techniques. Substance lives in nested
techniques.

### Singleton-style

`SKILL.md` is a self-contained technique-shape body — no nested
techniques under it. Contains the same sections a technique would:
`## Pre-conditions`, `## Invariants`, `## Procedure`, `## Output`,
`## Refusal paths`.

Use when nested-technique decomposition would be overkill.

## Canonical specifier format

References to skills (including techniques, which are structurally
skills) use this URI scheme:

```
skill:<path>
```

Where `<path>` is the full path under `skills/`, slashes preserved,
no leading slash, no `SKILL.md` suffix. Examples:

- `skill:implement-task` — top-level deliverable skill.
- `skill:implement-task/understand-task-context` — nested technique.
- `skill:gitnexus/impact` — endpoint technique under the gitnexus
  tool-bundle.
- `skill:gitnexus/impact-analysis/analysis1` — deeper nesting is
  permitted; arbitrary depth.
- `skill:workflow/dco-attest-commit` — cross-bundle reference.

In markdown body content, references appear as standard markdown
links: `[display-text](skill:<path>)`. Display text is human-readable
(typically the slug or a friendly phrasing); the URL is the canonical
specifier.

The agent fetches a skill by calling `get_skill(<path>)` — the path
is the URI minus the `skill:` prefix.

## Composition rules

1. **One `SKILL.md` per folder**, mandatory. Filename uppercase
   (`SKILL.md`).
2. **No sub-files.** Templates, criteria, primers — promote each to a
   named nested technique, OR fold into the relevant skill body.
3. **Every folder under `skills/` is a skill.** Nested folders are
   nested skills. Arbitrary depth is permitted.
4. **Nested-skill names are action-oriented, verb-phrased, and
   disambiguated.** Generic stubs are banned: `procedure`, `execute`,
   `main`, `step-1`, `do`, `run`. Disambiguation example:
   `understand-task-context` (under `implement-task`) vs
   `understand-codebase-context` (under `analyze-implementation`).
5. **Techniques are independent.** They declare own preconditions /
   invariants / procedure / output / refusal-paths. They do NOT
   prescribe ordering relative to other techniques.
6. **Skills do not tell the agent how to interpret skills.** That is
   this meta-skill's job.

## Frontmatter schema

Frontmatter splits into two layers:

**Top-level fields (agentskills.io spec):**

| Field | Required | Values |
|---|---|---|
| `name` | yes | lowercase-kebab slug; matches the directory name |
| `description` | yes | 1–2 sentence summary (agentskills.io compatible) |

**Under `metadata:` (spec-blessed nesting for author-defined data):**

| Field | Required | Values |
|---|---|---|
| `metadata.ontology` | yes | A bare slug naming the ontology this skill participates in. For this ontology: `workflow-canonical`. |
| `metadata.kind` | yes | A bare slug naming this skill's kind within the ontology: `deliverable` \| `competency-bundle` \| `technique` \| `meta-skill`. |
| `metadata.produces` | yes for `kind: deliverable` | named work-product slug |

**Why nested under `metadata:`?** The agentskills.io spec only blesses `name`, `description`, `license`, `compatibility`, `metadata`, and `allowed-tools` as top-level frontmatter fields. Anything else risks failing strict spec validators on other hosts. We place architecture and ontology-specific entries under `metadata:` (a spec-approved map for author-defined data), keeping SKILL.md files fully spec-compliant and portable.

**Resolution convention.** Given `metadata.ontology: <slug>`, the agent fetches the meta-skill at `meta/<slug>` (i.e. `get_skill("meta/<slug>")`). For this ontology, that's `get_skill("meta/workflow-canonical")` — fetching this very document. The agent then interprets `metadata.kind` per this meta-skill's rules.

The server validates that `metadata.ontology` and `metadata.kind` are present; it does not interpret their values. This meta-skill defines what each kind means; semantic validation is the agent's responsibility.

**Bootstrap convention.** This meta-skill's own frontmatter declares `ontology: workflow-canonical`, `kind: meta-skill` (self-referential). The agent's bootstrap protocol recognises the self-reference: encountering `kind: meta-skill` when fetching `meta/workflow-canonical` means this IS the canonical definition; no further indirection.

Example (a deliverable-shaped skill):

```yaml
---
name: implement-task
description: Produces a code change scoped to one task from a work-package plan.
metadata:
  ontology: workflow-canonical
  kind: deliverable
  produces: task-implementation
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

1. Read the assigned skill via `get_skill(<path>)`.
2. Inspect the skill's `ontology:` frontmatter field. If it names a
   meta-skill not yet loaded in the session, fetch the meta-skill
   FIRST and apply its definitions.
3. For ontology `skill:meta/workflow-canonical`: apply the rules in
   this document.
   - If the skill is **navigator-style** (has a `## Techniques`
     section), enumerate the techniques but do NOT pre-fetch. Fetch
     each on demand when its preconditions are satisfied and the role
     contract calls for it.
   - If **singleton-style**, treat the body as a technique-shape body
     to execute directly.
4. Apply role contracts from [skill:workflow](skill:workflow) per the
   activity's assigned role.
5. Honour refusal paths — they are non-negotiable stops, not
   advisory.

## Refusal paths (agent-level)

The agent must stop and surface to the user when:

- A `skill:` URI fails to resolve via `get_skill`.
- A skill's `ontology` field names an ontology whose meta-skill is
  not loadable.
- A skill's `kind` value is outside `{deliverable, competency-bundle,
  technique, meta-skill}` — undefined under this ontology.
- A technique's preconditions cannot be satisfied because a required
  upstream technique has not produced its expected output.
- A technique's invariant would be violated by the work the agent is
  about to perform.
- Two or more techniques' invariants conflict with each other and the
  agent cannot satisfy both.

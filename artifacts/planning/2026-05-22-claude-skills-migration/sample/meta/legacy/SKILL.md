---
name: legacy
description: >
  The legacy ontology — a structural mirror of the pre-migration TOON
  skill+resource model, preserved verbatim on the markdown-skill
  architecture. Two kinds: skill, resource. Flat by mandate. Bootstrap
  meta-skill: load once before interpreting any skill tagged
  `metadata.ontology: legacy`.
metadata:
  ontology: legacy    # self-referential bootstrap
  kind: meta-skill
---

# Legacy ontology

Any skill whose frontmatter declares `metadata.ontology: legacy` is
interpreted according to this document. Read once per session; contents
do not change during execution.

The legacy ontology exists as a **structural migration target only** —
it preserves the shape of pre-migration TOON content so that the
architectural move from TOON to markdown can be made without any
ontological restructuring. Subsequent migrations (e.g. workflow-canonical)
restructure content into richer ontologies; this meta-skill is the
authoritative reference for how legacy content is interpreted in the
meantime.

## When to read this

When an agent first encounters a skill with `metadata.ontology: legacy`
in its frontmatter, it fetches this meta-skill (via
`get_skill("meta/legacy")`) before interpreting the skill body. The
agent caches this meta-skill for the rest of the session.

## The two kinds

The legacy ontology has exactly two kinds, declared via `metadata.kind`:

### `kind: skill`

A content unit that maps 1:1 to a pre-migration TOON skill file (e.g.
`workflows/<wf>/skills/10-implement-task.toon`). Carries the workflow's
agent guidance: capability description, protocol phases, rules, errors,
input/output definitions, resource references.

A skill is the unit of agent guidance — when a workflow activity assigns
a skill, the agent fetches its body and follows the protocol described
within.

### `kind: resource`

A content unit that maps 1:1 to a pre-migration resource file (e.g.
`workflows/<wf>/resources/27-gitnexus-reference.md` or
`27-gitnexus-reference.toon`). Reference material — templates, criteria,
primers, glossaries — consumed by skills.

A resource is referenced from a skill body via the canonical specifier
(see §"Canonical specifier format" below) and fetched on demand.

## Structural layout

```
skills (orphan branch root)
├── meta/
│   └── legacy/
│       └── SKILL.md              # this file
└── legacy/
    └── <workflow-name>/
        ├── skills/
        │   └── <slug>/
        │       └── SKILL.md      # metadata.kind: skill
        └── resources/
            └── <slug>/
                └── SKILL.md      # metadata.kind: resource
```

**Flat by mandate.** No sub-folders inside `legacy/<workflow>/skills/<slug>/`
or `legacy/<workflow>/resources/<slug>/`. The architecture permits arbitrary
nesting; the legacy ontology chooses not to use it. Sub-skill composition is
a feature of richer ontologies (e.g. workflow-canonical's competency-bundles
and nested techniques) — not legacy.

**Slug derivation.** The folder slug is derived from the original TOON
filename by stripping the `NN-` numeric prefix and the file extension:

- `10-implement-task.toon` → `implement-task`
- `27-gitnexus-reference.md` → `gitnexus-reference`

The numeric prefix is preserved in `metadata.order` (for workflow-iteration
semantics) and `metadata.legacy_id` (for transitional reference resolution).

## Frontmatter schema

Every SKILL.md under legacy carries:

**Top-level (agentskills.io spec):**

| Field | Required | Values |
|---|---|---|
| `name` | yes | lowercase-kebab slug; matches the directory name |
| `description` | yes | 1–1024 chars; copied from the source TOON `description:` field if present, else from `capability:` |

**Under `metadata:` (architecture-required):**

| Field | Required | Values |
|---|---|---|
| `metadata.ontology` | yes | `legacy` |
| `metadata.kind` | yes | `skill` \| `resource` \| `meta-skill` (this file uses the third) |

**Under `metadata:` (legacy-defined):**

| Field | Required | Values |
|---|---|---|
| `metadata.order` | yes | the `NN` numeric prefix from the source TOON filename — preserves workflow-iteration ordering |
| `metadata.legacy_id` | yes | the same `NN` value — the integer ID used by pre-migration references (e.g. "see resource 27") |
| `metadata.version` | optional | copied from the source TOON `version:` field if present |

The server validates that the architecture-required fields are present.
This meta-skill defines the semantics of the legacy-defined fields;
semantic validation is the agent's responsibility.

## TOON field → markdown section mapping

The body of every migrated SKILL.md follows a mechanical, round-trippable
mapping from TOON fields to markdown sections. Each top-level TOON field
becomes a `##` section; nested objects become `###` (and deeper) headings;
lists become markdown bullet lists.

**Identified elements use `### <name>` subsections, not bullets, and carry NO canonical identifier.** (An earlier draft experimented with token-efficient canonical IDs like `I-01`, `O-01`; that was reverted — plain `### <name>` subsections are the final form.) Two sections are exempt from the subsection treatment: **Capability** (always a singleton) and **Resources** (external references).

| TOON field | Markdown section |
|---|---|
| `capability:` | `## Capability` — a plain paragraph. Singleton: no subsection, no identifier. |
| `inputs[N]:` | `## Inputs` — each input as a `### <id>` subsection; the description is the body. If `required: false`, lead the body with `*(optional)*`. |
| `protocol:` (with named phases) | `## Protocol` — each phase as `### N. <Phase Title>` (simple ordinal number, Title-Cased from the kebab phase name). Each phase's body is a **bullet list** of constituent actions. The phases ARE the linear sequence; the bullets are the actions within each phase. Protocol uses ordinal numbers, not the subsection-name form. |
| `output[N]:` | `## Outputs` (**plural — renamed from the TOON singular `output`**) — each output as a `### <id>` subsection; the description is the body. Sub-properties (e.g. a `components:` map) render as bullets within the output's subsection. |
| `rules:` (map of `<name>: <text>`) | `## Rules` — each rule as a `### <rule-name>` subsection; the rule text is the body. |
| `errors:` (map of `<name>: {cause, recovery}`) | `## Errors` — each error as a `### <error-name>` subsection with `**Cause:** <text>` and `**Recovery:** <text>` lines. |
| `operations:` (map of `<op-name>: {description, inputs, output, procedure, tools, errors}`) | `## Operations` — each op as `### <op-name>` subsection containing the op's sub-fields. See §"Operation sub-field mapping" below. |
| `resources[N]:` | `## Resources` — **always the LAST section.** A plain bullet list of links, each rewritten to canonical specifier (see §"Reference resolution"). Resources are external references; they carry no within-skill identifier and are not subsectioned. |

### Section ordering

Body sections follow the source TOON field order, with **one override: `## Resources` is always moved to last.** So a typical skill renders as: Capability → Inputs → Protocol (and/or Operations) → Outputs → Rules → Errors → Resources.

### Operation sub-field mapping

When an `operations:` field is present, each operation gets its own `### <op-name>` heading (preserving the kebab-case slug). The operation's sub-fields render as nested labels-and-content (not deeper `####` headings — keep it visually flat):

| Op sub-field | Rendering |
|---|---|
| `description:` | `**Description:** <text>` (paragraph) |
| `inputs[N]:` (list of `{<param>: <description>}`) | `**Inputs:**` followed by bullet list `- **<param>** — <description>` |
| `output[N]:` (list of `{<name>: <description>}`) | `**Output:**` followed by bullet list `- **<name>** — <description>` |
| `procedure[N]:` (list of strings) | `**Procedure:**` followed by ordered or bullet list of the procedure steps verbatim |
| `tools:` (map like `{shell: [<tool-name>, ...]}`) | `**Tools:**` followed by bullet list `- **<tool-kind>:** <comma-separated tool names>` |
| `errors:` (same shape as skill-level errors) | `**Errors:**` followed by bullet list `- **<error-name>** — Cause: <text> · Recovery: <text>` (compact inline form; the skill-level `errors:` uses `####` subheadings, but operation-local errors stay inline for readability) |

Worked snippet (one operation under `## Operations`):

```markdown
### check

**Description:** Type-check without producing binaries; the cheapest validation pass

**Inputs:**

- **scope** — `'--workspace'` for the full workspace, or `'-p <crate>'` to scope to one crate
- **features** — Optional --features flags (empty string when none)

**Output:**

- **check_status** — Pass/fail and the rustc diagnostics emitted

**Procedure:**

- `nice -n 19 SKIP_WASM_BUILD=1 CARGO_BUILD_JOBS=${CARGO_BUILD_JOBS:-4} cargo check {scope} {features}`

**Tools:**

- **shell:** cargo

**Errors:**

- **out_of_memory** — Cause: Compile peaked above available RAM even with the budget · Recovery: Halve CARGO_BUILD_JOBS (export CARGO_BUILD_JOBS=2) and retry; if still failing, narrow scope to `-p <crate>`
- **compile_error** — Cause: Type-check failed in the source · Recovery: Address the rustc errors and retry
```

For resource files (`kind: resource`), the source body is preserved
verbatim (for `.md` sources) or undergoes the same field-to-section
mapping (for `.toon` sources).

Any TOON field not in this table is preserved as a `##` section with
the field name in Title Case. The migration tooling flags unknown
fields for review.

## Canonical specifier format

References to legacy skills and resources use the architecture's
canonical specifier scheme:

```
skill:legacy/<workflow>/<kind-folder>/<slug>
```

Where:

- `<workflow>` is the workflow name (e.g. `work-package`, `prism`).
- `<kind-folder>` is `skills` or `resources`.
- `<slug>` is the post-migration folder name (no `NN-` prefix).

Examples:

```
skill:legacy/work-package/skills/implement-task
skill:legacy/work-package/resources/gitnexus-reference
skill:legacy/prism/skills/structural-analysis
```

In markdown body content, references appear as standard markdown links:
`[display-text](skill:legacy/<workflow>/<kind-folder>/<slug>)`.

The agent fetches the target by calling `get_skill(<path>)` — the URI
minus the `skill:` prefix.

## Reference resolution

Pre-migration TOON content uses several reference shapes. The agent
resolves each as follows:

1. **Canonical specifier** (`skill:legacy/<workflow>/<kind-folder>/<slug>`)
   — the post-migration form. Resolve directly via `get_skill`.

2. **Plain slug** (e.g. `review-code`, common in activity definitions)
   — resolve against the current workflow:
   1. Try `legacy/<current-workflow>/skills/<slug>` first.
   2. Then `legacy/<current-workflow>/resources/<slug>`.
   3. If neither resolves, refuse and surface to user.

3. **Workflow-prefixed slug** (e.g. `prism/structural-analysis`,
   used for cross-workflow references) — resolve against the named
   workflow:
   1. Try `legacy/<workflow>/skills/<slug>` first.
   2. Then `legacy/<workflow>/resources/<slug>`.

4. **Numeric ID** (e.g. "see resource 27", appearing in prose text only)
   — this is a transitional fallback for content authored before the
   migration. The agent finds the skill or resource in the current
   workflow whose `metadata.legacy_id: 27` matches. Numeric IDs are
   never used in fresh content — they exist only in body prose
   carried over from the source TOON.

## Composition rules

1. **One `SKILL.md` per folder**, mandatory. Filename is uppercase.
2. **No sub-folders** inside `legacy/<workflow>/skills/<slug>/` or
   `legacy/<workflow>/resources/<slug>/`. Flat only.
3. **No sub-files** of any kind. The content lives entirely in the
   single `SKILL.md`; sections within that file are the only structure.
4. **Slugs are lowercase-kebab.** Match the directory name. No `NN-`
   prefix.
5. **References use the canonical specifier** (`skill:legacy/...`) in
   freshly-authored content. Carried-over forms (plain slug,
   workflow-prefixed slug, numeric ID) remain valid for transition.
6. **Skills and resources are flat content.** Skills do not compose
   skills; resources are inert reference material. Workflow.toon
   handles all skill-to-skill orchestration via activity definitions.

## Agent bootstrap procedure

When the agent receives a workflow activity assignment under the legacy
ontology:

1. The activity definition names a skill (by plain slug or workflow-
   prefixed slug per §"Reference resolution").
2. The agent calls `get_skill(<path>)` to fetch the skill.
3. The agent inspects the skill's `metadata.ontology` field. If
   `legacy` and this meta-skill is not yet loaded for the session,
   fetch it first via `get_skill("meta/legacy")`.
4. The agent reads the skill body, following its `## Protocol`,
   `## Rules`, and other sections per their semantics.
5. When the skill body references resources (in `## Resources`,
   `## Protocol`, or elsewhere), the agent fetches each resource as
   needed using its canonical specifier.

## Refusal paths (agent-level)

The agent must stop and surface to the user when:

- A skill or resource reference fails to resolve via any of the four
  shapes in §"Reference resolution".
- A skill carries `metadata.ontology: legacy` but `metadata.kind` is
  outside `{skill, resource, meta-skill}`.
- A `## Protocol` step depends on a tool or resource that is not
  available in the runtime environment.
- A skill's body references a numeric ID with no matching
  `metadata.legacy_id` in the current workflow's catalogue (an
  orphaned cross-reference from the pre-migration content).

## Relationship to other ontologies

The legacy ontology is **transitional**. After workflows migrate to
richer ontologies (e.g. workflow-canonical with Skill / Technique /
Role / Tool kinds), their content moves out of `legacy/<workflow>/`
into a new tree governed by the new ontology, and the corresponding
`legacy/<workflow>/` folder is removed.

Migrations from `legacy` to a richer ontology are workflow-by-workflow
— a workflow may use the legacy ontology while another workflow uses
workflow-canonical. The `metadata.ontology` field tells the agent
which interpretation to apply for each skill it fetches.

This meta-skill stays valid as long as any workflow still uses legacy.
When all workflows have migrated to richer ontologies, this meta-skill
and the `legacy/` tree can be removed.

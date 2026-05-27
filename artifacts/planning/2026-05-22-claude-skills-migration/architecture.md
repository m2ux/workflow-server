---
title: "Skill architecture — ontology-agnostic server design"
status: draft
phase: planning
date: 2026-05-23
---

# Skill architecture

> The architecture that supports skill-based agent workflows. **Ontology-agnostic by design**: the server understands directories, files, and a minimal frontmatter contract; everything else  is defined at the skill level via meta-skills that workflows ship with.

---

## 1. The architectural posture

The server is intentionally minimal. It knows:

- A skill is a folder under `skills/` containing a `SKILL.md` file.
- Folders nest arbitrarily — `skills/<a>/<b>/<c>/.../SKILL.md`.
- Each `SKILL.md` carries YAML frontmatter declaring `name`, `description`, and `ontology` (the only three fields the server enforces).
- A single MCP accessor — `get_skill(path)` — resolves any path-wise descent.
- Markdown is delivered verbatim on the wire. No transcoding.

The server explicitly does NOT know:

- What `kind: deliverable`, `kind: technique`, or any other ontology-specific frontmatter value means.
- What `produces:`, `uses-techniques:`, or any extension field is for.
- Whether a particular skill is a "deliverable", a "technique", a "navigator", a "singleton", or anything else.
- How references between skills should be resolved beyond passing through their content.

All of that semantic interpretation is the agent's responsibility, informed by the **meta-skill** referenced from each skill's `ontology:` frontmatter field. Different workflows can carry different meta-skills with different ontologies; the server treats them all the same way.

---

## 2. The Claude Agent Skills standard (formal core)

The architecture conforms to the [agentskills.io](https://agentskills.io/specification) open standard. Claude Code is one implementation alongside Cursor, Goose, Gemini CLI, and others — all of which honour the base spec.

### 2.1 What is formally required

| Requirement | Detail |
|---|---|
| **A directory per skill.** | Directory name in `lowercase-kebab-case`, 1–64 chars, must not start/end with `-`, must not contain `--`. |
| **A `SKILL.md` file.** | Uppercase `SKILL.md`, `.md` extension, at the root of the skill directory. |
| **YAML frontmatter** | Between `---` markers at the top of `SKILL.md`. Two required fields by spec:<br>• `name` — must match the parent directory name<br>• `description` — 1–1024 chars, non-empty |
| **Discovery contract.** | The host runtime scans known directories. Sub-files inside a skill folder are **not** auto-loaded — they are loaded only when `SKILL.md` *textually references them* and the agent follows the link. |
| **Three-tier progressive disclosure.** | Tier 1: metadata (`name` + `description`) always pre-loaded. Tier 2: full `SKILL.md` loaded when triggered. Tier 3: sub-files / nested content loaded on demand when referenced. |

### 2.2 Spec-blessed optional fields

The spec blesses four optional top-level fields beyond the required `name` and `description`:

- `license` — license name or filename reference.
- `compatibility` — environment requirements; max 500 chars.
- `metadata` — arbitrary `string → string` map for author/host-defined data.
- `allowed-tools` — space-separated pre-approved tool names. **Marked Experimental in the spec.**

Authors MAY use any of these. The server treats them as opaque pass-through content.

### 2.3 Our addition — `metadata.ontology` and `metadata.kind`

The architecture requires two bare-slug entries inside the spec-blessed `metadata:` slot:

```yaml
---
name: <slug>
description: <text>
metadata:
  ontology: <ontology-slug>    # e.g. workflow-canonical
  kind: <kind-slug>             # e.g. deliverable
---
```

- **`metadata.ontology`** names the ontology this skill participates in. The agent resolves the meta-skill via convention: `get_skill("meta/<ontology-slug>")`.
- **`metadata.kind`** names this skill's kind within that ontology. The ontology meta-skill defines what each kind means.

The server validates presence of both. It does NOT interpret either value — semantic interpretation is the agent's job, informed by the meta-skill it fetches.

SKILL.md files authored under this architecture remain valid agentskills.io skills — `metadata` is spec-approved, `ontology` and `kind` are just entries in an author-defined map. Hosts that don't know about them ignore them; the file remains a valid skill from their perspective.

Ontology-specific fields (e.g. `produces` under workflow-canonical) live as sibling entries under the same `metadata:` block. See §5.

The architecture adds no other constraints on top of the spec's contract.

---

## 3. Examples studied (illustrative only)

Two canonical Claude skills packages were surveyed for *inspiration*, not as authority. The agentskills.io spec is normative; these are guidelines.

- **[`mattpocock/skills`](https://github.com/mattpocock/skills)** — flat-inside-each-skill convention with a thin `SKILL.md` (~80–130 lines) plus sibling reference files. Sub-files split by topic. Cross-skill references use relative paths.
- **[`anthropics/claude-for-legal`](https://github.com/anthropics/claude-for-legal)** — longer monolithic `SKILL.md` (200–1000+ lines) with no sub-files; decomposition happens *inside* one file. Cross-skill handoffs use slash-command notation.

**What the architecture may borrow** (not normative):

- Thin `SKILL.md` with explicit cross-links to nested content (mattpocock model).
- Numbered preamble + reference body for skills that don't decompose well (claude-for-legal model).
- Explicit refusal-paths and pre-condition gates (claude-for-legal model).

**What the architecture may ignore**:

- Long monolithic skill files (token-cost footgun).
- Inconsistent file naming.
- Host-specific frontmatter (Claude Code's `when_to_use`, `argument-hint`, `model`, etc.) — not portable.

---

## 4. On-disk shape

```
<workflow-root>/
  workflow.toon                  # workflow definition (out of scope here)
  activities/                    # workflow activities (out of scope here)
  skills/
    <skill-name>/
      SKILL.md                   # mandatory
      [optional nested skill folders]
        <nested-skill-name>/
          SKILL.md
          [optional deeper nesting]
    <other-skill>/
      SKILL.md
    meta/                        # one convention: meta-skills live under meta/
      <ontology-name>/
        SKILL.md                 # the meta-skill defining an ontology
```

Architecture-level conventions:

- **`SKILL.md` is mandatory** at every skill folder's root (uppercase, agentskills.io requirement).
- **Lowercase-kebab directory names** matching the `name:` frontmatter field.
- **Arbitrary nesting depth permitted.** The server walks the tree without depth restriction.
- **No filename constraints on sibling files** — though specific ontologies may add their own conventions (the workflow-canonical ontology, for instance, mandates no sub-files at all).

What is `meta/`? It's a convention for where meta-skills live. Architecturally, a meta-skill is just a skill like any other — same `SKILL.md` shape, same `get_skill` accessor. By convention we put them under `skills/meta/<ontology-name>/` so they're discoverable, but the server does not require this location.

---

## 5. Frontmatter contract

### 5.1 Server-enforced (required on every SKILL.md)

Two top-level spec-required fields, plus one entry inside the spec-blessed `metadata:` slot:

| Field | Constraint | Purpose |
|---|---|---|
| `name` | lowercase-kebab; matches directory name; 1–64 chars | agentskills.io top-level requirement |
| `description` | 1–1024 chars, non-empty | agentskills.io top-level requirement |
| `metadata.ontology` | lowercase-kebab slug | architecture extension — names the ontology meta-skill (resolved by the agent as `meta/<slug>`) |
| `metadata.kind` | lowercase-kebab slug | architecture extension — names this skill's kind within the ontology |

The server validates presence of all four. It does not interpret the values of `metadata.ontology` or `metadata.kind` — the ontology meta-skill (fetched by the agent) defines what each kind means.

Authors MAY also use the spec's other optional top-level fields (`license`, `compatibility`, `allowed-tools`) at their discretion; the server passes them through opaquely.

### 5.2 Ontology-specific (opaque to the server)

The ontology meta-skill defines additional frontmatter entries and their semantics. These live as **sibling entries inside the same `metadata:` block** — keeping the SKILL.md spec-compliant.

Example (a deliverable-shaped skill under workflow-canonical):

```yaml
---
name: implement-task
description: Produces a code change scoped to one task.
metadata:
  ontology: workflow-canonical    # architecture-required
  kind: deliverable                # architecture-required
  produces: task-implementation    # ontology-defined
---
```

Example (a nested technique under workflow-canonical):

```yaml
---
name: write-task-code
description: Make code edits scoped to one task.
metadata:
  ontology: workflow-canonical
  kind: technique
---
```

Under a different ontology, `metadata.ontology` would name a different meta-skill, and different entries could appear under `metadata:`. The server does not care — it passes the entire `metadata:` map through verbatim.

### 5.3 Validation responsibility split

| Concern | Who validates |
|---|---|
| Frontmatter parseable as YAML | Server |
| Required fields present (`name`, `description`, `ontology`) | Server |
| `name` matches directory; `description` within length bound | Server |
| `ontology` value is a resolvable specifier (does the meta-skill load?) | Server checks resolvability at fetch time; semantic validation deferred to agent |
| `kind`, `produces`, other ontology-specific values | Agent, informed by the meta-skill |
| Composition rules (no sub-files? max nesting depth? etc.) | Meta-skill defines; agent enforces |

---

## 6. MCP surface

### 6.1 The single accessor

**`get_skill(path)`** — fetches the SKILL.md at `skills/<path>/SKILL.md`. Returns raw markdown content (frontmatter + body) verbatim.

- `path` is a relative path under `skills/`, slashes preserved, no leading slash, no `SKILL.md` suffix.
- Path can be arbitrary depth. All of these are valid:
  - `meta/workflow-canonical`
  - `implement-task`
  - `gitnexus/impact`
  - `gitnexus/impact-analysis/analysis1`
- The server validates the required frontmatter fields and returns either the markdown body or a not-found indicator.

### 6.2 What's NOT in the MCP surface

- `get_technique`, `get_role`, `get_tool`, `get_subfile` — all unnecessary. Techniques, roles, tools, and sub-files (if any) are interpretations the meta-skill defines; from the server's perspective every fetch is just a path resolution via `get_skill`.
- `get_resource` (legacy) — deprecated during migration; returns "moved to X" indicator post-migration; removed in a follow-up.

### 6.3 The canonical specifier format

The architecture mandates one thing about cross-skill referencing: the URI format used in markdown bodies and frontmatter for referencing other skills **must be path-resolvable by `get_skill`**. The exact format (URI scheme, syntax, etc.) is meta-skill-defined; the server treats URIs as opaque content.

Workflow-canonical uses `skill:<path>` — agents strip the `skill:` prefix and call `get_skill(<path>)`. Other ontologies could use different schemes. The server doesn't care.

---

## 7. Wire format

**Markdown, verbatim, no transcoding.**

Token efficiency comes from *structural* mechanisms, not encoding:

- The ontology (meta-skill-defined) typically de-duplicates cross-cutting concerns into reusable composable units, so agents fetch each one once.
- Lean top-level skills act as navigators, deferring substance to nested content that's fetched on demand.
- Lazy loading is the default: an agent fetches what it needs when it needs it.

TOON encoding was considered and rejected — skill content is prose-heavy; markdown is already near-optimal token-wise; transcoding adds fidelity-loss risk on links, code fences, headings, with no meaningful saving.

---

## 8. Migration approach (any workflow, any ontology)

The architecture supports migrating any TOON-based skill workflow to a markdown-skill workflow under any ontology. The generic phases:

1. **Author the meta-skill.** Define the target ontology — what kinds of content exist, how they compose, what frontmatter fields they carry, how the canonical specifier works.
2. **Scaffold the server's markdown loader.** Add the minimal frontmatter schema (server-enforced fields only); implement path-wise resolution at arbitrary depth; deliver markdown verbatim. No transcoding.
3. **Author the target skill tree** per the meta-skill's structure — top-level skills, nested content, cross-references in the canonical specifier format.
4. **Migrate legacy content** (TOON skills, ancillary resources) into the new structure one skill at a time. The meta-skill defines the destination shape.
5. **Cutover and verify** behavioural fidelity — the post-migration worker should produce the same artifacts and make the same decisions as the pre-migration worker on representative tasks.

The specific instantiation of these phases depends on the workflow being migrated and the ontology it adopts. For `work-package` migrating to the workflow-canonical ontology, see [work-package-pilot.md](./work-package-pilot.md).

---

## 9. Architecture-level risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Markdown loader breaks existing TOON-skill workers during transition | Low | High | Round-trip every existing TOON skill identically through `get_skill` after the loader extension lands. No regression on the TOON path during the migration window. |
| Schema drift between server-enforced and meta-skill-defined fields | Low | Medium | Schema validation on `get_skill` is a hard fail for missing required fields; ontology-specific fields are pass-through with no validation. The split is deliberate. |
| Cross-skill references break when a skill moves | Medium | Low | The meta-skill defines the canonical specifier; refactors that move skills require updating references. A CI `validate-references` check (per workflow) verifies every specifier resolves. |
| Frontmatter compatibility with vanilla agentskills.io hosts | Low | Low | Required fields (`name`, `description`) are spec-compliant. The `ontology` extension is one additional field; vanilla hosts can ignore it. SKILL.md files produced under this architecture are portable. |

---

## 10. Out of scope (architecture-level)

The architecture deliberately does NOT specify:

- **Which ontologies are valid.** Any meta-skill defining a coherent set of frontmatter fields and composition rules is a valid ontology.
- **What composition patterns workflows should use.** Top-level navigators vs singletons, technique decomposition, role contracts, tool documentation — all meta-skill-defined.
- **How agents should interpret skill content.** Reading sequence, refusal handling, sub-file conventions — all meta-skill-defined.
- **Workflow definition (`workflow.toon`) format.** Activities, role bindings, lifecycle structure live in `workflow.toon` and are an orthogonal concern.

---

## 11. References

- agentskills.io specification — https://agentskills.io/specification
- Claude Code skills documentation — https://code.claude.com/docs/en/skills
- Anthropic Agent Skills overview — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- Anthropic Agent Skills best practices — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

For specific applications of this architecture:
- [workflow-canonical-ontology.md](./workflow-canonical-ontology.md) — one ontology built on top of this architecture.
- [work-package-pilot.md](./work-package-pilot.md) — the pilot migration of the work-package workflow.

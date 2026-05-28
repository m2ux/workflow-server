---
title: "Skill architecture — ontology-agnostic server design"
status: draft
phase: planning
date: 2026-05-23
---

# Skill architecture

> The architecture that supports skill-based agent workflows. **Ontology-agnostic by design**: the server understands directories, files, and a minimal frontmatter contract; everything else is defined at the skill level via ontology definitions (resources) that workflows ship with.

---

## 1. The architectural posture

The server is intentionally minimal. It knows:

- A skill is a folder containing a `SKILL.md` file. Folders nest arbitrarily — `<a>/<b>/<c>/.../SKILL.md`.
- Every `SKILL.md` carries `name` + `description` (spec-required). **Ontology-governed** skills additionally carry `metadata.ontology` + `metadata.kind`; the **absence** of `metadata.ontology` marks a freeform **resource** (still a `SKILL.md`-rooted skill, just un-governed).
- One MCP accessor, `get_skill(name)`, resolves a **name** to a `SKILL.md` by **precedence** — the current workflow's folder first, then the `shared/` layer (local shadows shared). The server **auto-detects** the target from its frontmatter (governed technique vs freeform resource) and delivers it in the appropriate form (§7); the caller never distinguishes.
- `get_skill` also supports **per-section** addressing: `get_skill("<name>/<section>")` returns just that section, so a skill can cite another's individual section instead of its whole body.
- Markdown is the **stored** format; **delivery is a token-efficiency projection, not byte-verbatim** — structured **techniques** ship as TOON, freeform **resources** as simplified markdown (links → bare names, human-only affordances trimmed). Stored = human-optimized; delivered = agent-optimized. See §7.

The server explicitly does NOT know:

- What `kind: technique` or any other ontology-specific frontmatter value means.
- Whether a technique's body is self-contained or composes other techniques — the server makes no such distinction. It only tells governed technique apart from freeform resource (see §7).
- How references resolve *semantically* — only name-by-precedence lookup to a path.

All semantic interpretation is the agent's responsibility, informed by the **ontology definition** that a skill's `metadata.ontology` name resolves to — itself an ordinary freeform resource (see §4), not a special location or kind. Different workflows can carry different ontologies; the server treats them all the same way.

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

### 2.3 Our addition — `metadata.ontology` and `metadata.kind` (on governed skills only)

An **ontology-governed** skill carries two bare-slug entries inside the spec-blessed `metadata:` slot:

```yaml
---
name: <slug>
description: <text>
metadata:
  ontology: <ontology-name>    # e.g. workflow-canonical
  kind: <kind-slug>             # e.g. technique
---
```

- **`metadata.ontology`** is a **name** that resolves — by the same precedence as any reference (workflow-local → root, see §6.3) — to the ontology's **definition resource** (e.g. `shared/resources/workflow-canonical`). There is no `meta/` location convention and no `meta-skill` kind: an ontology definition is just a freeform resource, because the thing that defines an ontology cannot itself be governed by it.
- **`metadata.kind`** names this skill's kind within that ontology. The ontology definition says what each kind means.

A **resource** carries *neither* field — only `name` + `description`. That absence is the discriminator: ontology present ⇒ governed skill; ontology absent ⇒ freeform resource (also how a "foreign" third-party skill is recognized). The server validates `ontology` + `kind` presence *for governed skills*; it does not interpret their values.

SKILL.md files authored under this architecture remain valid agentskills.io skills — `metadata` is spec-approved, `ontology`/`kind` are just entries in an author-defined map. Hosts that don't know about them ignore them.

Ontology-specific fields (any sibling entries an ontology defines under workflow-canonical) live under the same `metadata:` block. See §5.

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
<skills-root>/
  shared/                          # SHARED layer — ontology-agnostic, cross-workflow
    resources/                     #   shared freeform resources
      workflow-canonical/SKILL.md  #     the ontology definition is just a shared resource
      <shared-resource>/SKILL.md
    techniques/                    #   shared / common techniques
      <common-technique>/SKILL.md
  <workflow>/                      # per-workflow LOCAL layer (shadows shared by name)
    resources/<name>/SKILL.md      #   workflow-local resources
    techniques/<name>/SKILL.md     #   workflow-local techniques
    <skill>/SKILL.md               #   governed skills (may nest)
      <nested>/SKILL.md
  meta/                            # NOT special — just the folder of the workflow named `meta`
    ...
```

Architecture-level conventions:

- **`SKILL.md` is mandatory** at every skill folder's root (uppercase, agentskills.io requirement) — resources included. A resource is a `SKILL.md`-rooted skill that simply lacks `metadata.ontology`.
- **Lowercase-kebab directory names** matching the `name:` field.
- **Arbitrary nesting depth permitted.** The server walks the tree without depth restriction.
- **Sibling supporting files** (`<skill>/<segment>.md`, no frontmatter) are progressively-disclosed sub-documents of the parent skill, not skills in their own right. They have no `SKILL.md` and carry no ontology metadata. Used to split a parent skill's body into per-sub-unit files (the operations-style pattern: `cargo-operations/check.md`, `gitnexus-operations/impact.md`, etc.) so the index stays small and each sub-unit is individually fetchable via per-section addressing (§6.1).
- **Two resolution layers.** A **`shared/`** layer (`shared/resources/`, `shared/techniques/`) and **per-workflow** folders. A referenced name resolves workflow-local first, then `shared/` (§6.3) — local overrides shared. Both layers coexist by design.
- **`meta/` is not a reserved namespace.** It is simply the folder of the workflow named `meta`. Ontology definitions do NOT live under `meta/`; they are shared resources at `shared/resources/<ontology>/`.

---

## 5. Frontmatter contract

### 5.1 Server-enforced

Always required (every `SKILL.md`, governed or resource):

| Field | Constraint | Purpose |
|---|---|---|
| `name` | lowercase-kebab; matches directory name; 1–64 chars | agentskills.io top-level requirement |
| `description` | 1–1024 chars, non-empty | agentskills.io top-level requirement |

Required on **governed** skills, absent on **resources**:

| Field | Constraint | Purpose |
|---|---|---|
| `metadata.ontology` | name resolvable by precedence to the ontology-definition resource | marks the skill as governed; selects its ontology |
| `metadata.kind` | lowercase-kebab slug | this skill's kind within that ontology |

The server validates that a skill carrying `metadata.ontology` also carries `metadata.kind`; a `SKILL.md` with neither is a valid **resource**. It does not interpret the values — the ontology definition (resolved by the agent) defines what each kind means.

Authors MAY also use the spec's other optional top-level fields (`license`, `compatibility`, `allowed-tools`); the server passes them through opaquely.

### 5.2 Ontology-specific (opaque to the server)

The ontology definition defines additional frontmatter entries and their semantics. These live as **sibling entries inside the same `metadata:` block** — keeping the SKILL.md spec-compliant.

Example (an activity-bound technique under workflow-canonical):

```yaml
---
name: implement-task
description: Produces a code change scoped to one task.
metadata:
  ontology: workflow-canonical    # architecture-required
  kind: technique                  # architecture-required
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

Under a different ontology, `metadata.ontology` would name a different ontology, and different entries could appear under `metadata:`. The server does not care — it passes the entire `metadata:` map through unchanged.

### 5.3 Validation responsibility split

| Concern | Who validates |
|---|---|
| Frontmatter parseable as YAML | Server |
| `name` + `description` present; `name` matches directory; `description` within length | Server |
| `ontology` + `kind` present together (governed) or both absent (resource) | Server |
| `ontology` name resolves by precedence to a definition resource | Server, at fetch time; semantic validation deferred to agent |
| `kind` and any other ontology-specific values | Agent, informed by the ontology definition |
| Composition rules (no sub-files? max nesting depth? etc.) | Ontology definition specifies; agent enforces |

---

## 6. MCP surface

### 6.1 One accessor: `get_skill`, name-resolved by precedence, with per-section addressing

**`get_skill(name)`** resolves a **name** to a `SKILL.md` by precedence — the current workflow's folder first, then the `shared/` layer (local shadows shared) — and returns the body via the §7 delivery projection (or a not-found indicator). The server **auto-detects** the target from its frontmatter: a governed technique (`metadata.ontology` + `kind: technique`) is delivered as TOON; a freeform resource (no `metadata.ontology`) as simplified markdown. **One accessor covers both — the caller does not choose.**

**Per-section addressing.** `get_skill("<name>/<segment>")` returns only the named sub-unit. Trailing-segment resolution proceeds in priority order:

1. **Child-skill folder** — if `<name>/<segment>/SKILL.md` exists, it's a nested-skill fetch.
2. **Sibling supporting file** — if `<name>/<segment>.md` exists (a child file with no SKILL.md), return that file. This is how skills like `cargo-operations` and `gitnexus-operations` carry one operation per file: `cargo-operations/check` resolves to `cargo-operations/check.md`, `gitnexus-operations/impact` to `gitnexus-operations/impact.md`. The parent SKILL.md acts as the index; child files are progressively-disclosed sub-documents (no frontmatter — they are not skills in their own right).
3. **Slugified section heading** — otherwise the segment is a heading inside `<name>/SKILL.md` and only that section is returned.

This lets a skill cite another's individual sub-unit without pulling the whole body — whether the sub-unit lives as a nested skill, a child file, or a section.

Names are unique within the resolution scope (the ontology's disambiguation rule guarantees this), so the server keeps a name→path index per layer; a workflow-local entry shadows a `shared/` entry. Storage may be nested at any depth — the **reference is the name**, not the path.

### 6.2 What's NOT in the MCP surface

- `get_technique`, `get_role`, `get_tool`, `get_subfile` — none needed. One `get_skill` covers every fetch; the server auto-detects governed-vs-freeform and delivers appropriately.
- `get_resource` (legacy) — folded into `get_skill` (resources are `SKILL.md`-rooted skills). Deprecated during migration; removed in a follow-up.

### 6.3 Referencing: authored vs delivered

At rest, references are human-friendly **file-relative** markdown hyperlinks — relative to the referencing file's own directory, so they click through in any IDE / GitHub / markdown renderer — to a whole skill (`[name](../name/SKILL.md)`) or to a section (`[name](../name/SKILL.md#section)`). To address a **specific operation or section** of another skill, hyperlink both parts joined by `::`: `[skill](../skill/SKILL.md)::[op](../skill/SKILL.md#op)` (params after, e.g. `` (`{target, direction}`) ``). When the operation lives in its own **child file** (the `*-operations` pattern), the second link targets the file directly: `[skill](../skill/SKILL.md)::[op](../skill/op.md)` — same `::` form, no anchor. Within the same skill folder, a sibling operation is just `[op](op.md)`; within the same file, a section is `[op](#op)`. On delivery the §7 pass **simplifies each to a bare name** (`<name>` or `<name>/<segment>`), which the agent fetches via `get_skill` under precedence resolution — the underlying storage (section, child file, or nested skill) is transparent to the caller. The at-rest form optimizes human navigation; the on-the-wire form optimizes tokens (and enables section-level fetches) and lets the server apply local-overrides-common without re-authoring.

---

## 7. Wire format

**Stored as human markdown; delivered as a token-efficiency projection, by content kind.**

The file at rest is human-optimized (clickable links, rich formatting). On every `get_skill` delivery the server auto-detects the target's kind from its frontmatter and projects it into the most efficient *faithful* form:

- **Techniques (structured) → TOON.** A technique has a fixed schema (a self-contained body: `Pre-conditions / Invariants / Procedure / Output / Refusal paths`; a composing body: context + techniques table), so markdown → structured object → TOON is deterministic and round-trippable. **Field values stay verbatim** — a procedure body with code fences, nested lists, or inline links is an opaque string blob, never re-encoded — so the fidelity loss that sank TOON for prose does not arise. The saving is the structural envelope plus key de-duplication when several techniques ship in one payload (a composing technique's set), so the payoff scales with batch delivery, not single fetches.
- **Resources (freeform) → simplified markdown.** Nothing regular to encode; the pass only strips links (`[name](path/SKILL.md)` → bare `name`) and trims human-only affordances.

Both projections are **semantics-preserving** — presentation changes, meaning never does. This supersedes the earlier "markdown verbatim, no TOON" stance: TOON was rejected for *unstructured prose skills*; it is viable precisely because techniques now carry a formal schema, while resources stay markdown for the same reason TOON was rejected before — no schema.

Structural savings compound either projection: the ontology de-duplicates cross-cutting concerns into reusable units fetched once; lean composing techniques defer substance to nested content fetched on demand; lazy loading is the default.

---

## 8. Migration approach (any workflow, any ontology)

The architecture supports migrating any TOON-based skill workflow to a markdown-skill workflow under any ontology. The generic phases:

1. **Author the ontology definition** (a shared resource). Define the target ontology — what kinds of content exist, how they compose, what frontmatter fields they carry.
2. **Scaffold the server's loader + delivery pass.** Add the minimal frontmatter schema (server-enforced fields only); implement name resolution by precedence (workflow-local → root); deliver via the §7 projection (TOON for techniques, simplified markdown for resources).
3. **Author the target skill tree** per the ontology's structure — governed skills, nested content, resources, cross-references as file-relative hyperlinks.
4. **Migrate legacy content** (TOON skills, ancillary resources) into the new structure one skill at a time. The ontology definition defines the destination shape.
5. **Cutover and verify** behavioural fidelity — the post-migration worker should produce the same artifacts and make the same decisions as the pre-migration worker on representative tasks.

The specific instantiation of these phases depends on the workflow being migrated and the ontology it adopts. For `work-package` migrating to the workflow-canonical ontology, see [workflow-canonical-plan.md](./workflow-canonical-plan.md).

---

## 9. Architecture-level risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Markdown loader breaks existing TOON-skill workers during transition | Low | High | Round-trip every existing TOON skill identically through `get_skill` after the loader extension lands. No regression on the TOON path during the migration window. |
| Schema drift between server-enforced and ontology-defined fields | Low | Medium | Schema validation on `get_skill` is a hard fail for missing required fields; ontology-specific fields are pass-through with no validation. The split is deliberate. |
| Cross-skill references break when a skill moves/renames | Medium | Low | References are by **name** resolved by precedence, so relocating a skill within a layer does not break refs; only renaming does. A CI `validate-references` check verifies every referenced name resolves. |
| Frontmatter compatibility with vanilla agentskills.io hosts | Low | Low | Required fields (`name`, `description`) are spec-compliant. The `ontology` extension is one additional field; vanilla hosts can ignore it. SKILL.md files produced under this architecture are portable. |

---

## 10. Out of scope (architecture-level)

The architecture deliberately does NOT specify:

- **Which ontologies are valid.** Any ontology definition specifying a coherent set of frontmatter fields and composition rules is valid.
- **What composition patterns workflows should use.** Whether a technique's body is self-contained or composes other techniques, technique decomposition, role contracts, tool documentation — all ontology-defined.
- **How agents should interpret skill content.** Reading sequence, refusal handling, sub-file conventions — all ontology-defined.
- **Workflow definition (`workflow.toon`) format.** Activities, role bindings, lifecycle structure live in `workflow.toon` and are an orthogonal concern.

---

## 11. References

- agentskills.io specification — https://agentskills.io/specification
- Claude Code skills documentation — https://code.claude.com/docs/en/skills
- Anthropic Agent Skills overview — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- Anthropic Agent Skills best practices — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

For specific applications of this architecture:
- [workflow-canonical-ontology.md](./workflow-canonical-ontology.md) — one ontology built on top of this architecture.
- [workflow-canonical-plan.md](./workflow-canonical-plan.md) — the pilot migration of the work-package workflow.

---
title: "Workflow-canonical ontology — human-facing companion"
status: draft
phase: planning
date: 2026-05-23
relates-to: ./workflow-canonical-plan.md
implemented-as: ./sample/resources/workflow-canonical/SKILL.md
---

# Workflow-canonical ontology

> This document is the **human-facing companion** to the agent-facing ontology definition at [./sample/resources/workflow-canonical/SKILL.md](./sample/resources/workflow-canonical/SKILL.md). Same conceptual content; more discursive; includes the rationale, the boundary tests as prose, the plumber analogy, the SPEM 2.0 grounding, and the empirical validation against the existing 25 work-package skills + 28 resources.
>
> The ontology definition is the operational artifact the agent reads at session start. This document is what a human reads to *understand* the ontology and decide whether to extend, modify, or replace it.

---

## 1. Why we need an ontology

The current TOON skills conflate three distinct concepts under the single name "skill":

- The persona of the agent invoking the skill (implicit; never named).
- The work product the unit produces (named — `id:` identifies this in TOON; now named by the technique's `Output` section, with the delegation declared in `workflow.toon`).
- The reusable operations the skill performs internally (named as protocol phases but appearing across many skills as de-facto cross-cutting concerns — e.g. `pre-edit-impact-check` is functionally identical to "perform impact analysis before any edit" wherever it appears).

The empirical inventory (see [Appendix A](./appendix-empirical-reuse.md)) shows this conflation has real cost:

- `gitnexus-discipline` rule appears in **11 of 25 skills** under near-identical wording but with slight naming drift (`gitnexus-discipline`, `gitnexus-first-locate`, `gitnexus-usage`).
- `load-guidance` → `document-findings` → `write-artifact` phase trio appears together in **13+ skills** with the same shape and intent.
- Resource ID `27` (GitNexus reference) is referenced by **15 of 25 skills**.

These are reuse signals the ontology should make first-class.

---

## 2. Architecture vs ontology — separable layers

The architecture (server-enforced, ontology-agnostic) is one thing; the ontology (ontology-defined, agent-interpreted) is another. The workflow-canonical ontology is *one specific ontology definition's content* — not an architectural property of the server. Other ontologies could substitute.

This document covers the **ontology layer**: what the workflow-canonical ontology definition says. The architecture layer (server seam, frontmatter schema, MCP surface) lives in [architecture.md](./architecture.md).

---

## 3. The four ontological concepts

The workflow-canonical ontology has **four first-class concepts**. Only one of them (Skill) is structurally first-class on disk; the other three are concept-level only.

### 3.1 Skill — the structural primitive (not a content kind)

A **skill** is the *packaging*: a folder containing a `SKILL.md`, identified by its position in the `skills/` directory tree. "Skill" is structural — it is NOT a kind of content. Every unit on disk, top-level or nested, is structurally a skill; what *kind of content* a governed skill carries is declared by `metadata.kind` (`technique`). There is no `skill` content kind, and no `ontology definition` kind — an ontology definition is a freeform resource (carries no `metadata.ontology`).

Earlier drafts split content into `deliverable` and `competency-bundle` kinds. Those are gone — both reduce to a single content kind (`technique`) plus a structural fact and a workflow-level binding:

- **Deliverable-ness → a workflow-level binding fact, not a technique property.** "Is the unit of workflow delegation" is not something a technique declares about itself. A `workflow.toon` activity binds a role to a technique **by name**; that binding (not a frontmatter field) marks the delegation/deliverable unit, and the technique's `Output` section names the work product. So "deliverable-ness" is read off `workflow.toon`, not off the technique. (See §3.2.)
- **Composing-ness → what the body contains.** A technique that draws on related sub-techniques (composes them in its body) is still a *technique* — a composing technique (e.g. `implement-task`). By contrast, a pure index/manifest that only groups other skills with no procedure or `Output` of its own (e.g. a `gitnexus` namespace) is a freeform **resource**, not a technique. You read this off the body; no kind label is needed.

> **SPEM 2.0 grounding**: SPEM TaskDefinition (the most-direct analogue) has Work Product Definitions on its input/output associations and Steps as its internal decomposition. In our collapsed model, an *activity-bound technique* plays the TaskDefinition role; a *pure namespace with no procedure or `Output` of its own* (a grouping/library — e.g. `gitnexus`) is a freeform resource closer to a SPEM CapabilityPattern; the reusable practice content maps to SPEM Practices. Governed techniques are all the same on-disk kind (`technique`) — the distinctions are carried by whether a `workflow.toon` activity binds them and by whether the body is self-contained or composing.

### 3.2 Technique — the only content kind

A **technique** (`metadata.kind: technique`) is the sole kind of practice content. A self-contained technique body has:

1. **Pre-conditions** — what must be true to invoke.
2. **Invariants** — what must remain true throughout.
3. **Procedure** — the canonical way to perform it.
4. **Output** — what it produces (an artifact, a state change, a verified condition).
5. **Refusal paths** — when it must stop and surface rather than continue.

The delegation boundary is **not** a technique property. A `workflow.toon` activity binds a role to a technique **by name**; that binding — not any frontmatter flag — marks the technique as the unit of workflow delegation (what earlier drafts called a "deliverable"), and the technique's `Output` section names the work product. Deliverable-ness is therefore a workflow-level binding fact, read off `workflow.toon`, not a property a technique carries. A technique no activity binds is an internal contributing unit.

Separately, a technique's **body** may be either **self-contained** (it states its own procedure — the 5 sections above) OR **composing** (it references and sequences other techniques, e.g. via a `## Techniques` manifest). This is just what the body contains — NOT a recognised "shape" or kind; the server does not distinguish the two. (See §6.) A *pure index/manifest* that only lists other skills — no procedure or `Output` of its own (e.g. a `gitnexus` namespace) — is a freeform **resource**, not a technique.

A technique is just a technique; its body is **self-contained** or **composing**:

- **composing body** — references and sequences sub-techniques (e.g. `implement-task`, or a contributing technique that sequences others).
- **self-contained body** — states its own procedure (e.g. `write-task-code`, `gitnexus/impact`, or a small `elicit-requirements`).

Whether any given technique is the unit of workflow delegation is independent of its body form and is decided by `workflow.toon` (the activity binding), not by the technique itself. (A pure namespace that only groups other skills — no procedure or `Output` of its own, e.g. `gitnexus`, `workflow` — is a freeform resource, not a technique.)

A technique stands alone in two senses:

- **Definitionally** — its description does not depend on any particular parent. You can read a technique cold and understand it.
- **Demonstrably** — you can demonstrate a self-contained technique on a contrived input without invoking anything above it.

**Techniques are independent** — they do NOT declare ordering relative to other techniques. Sequencing emerges from each technique's preconditions and from the role contract that mandates discipline. The agent assembles the sequence at execution time.

**Everything is structurally a skill.** A technique is a folder with a `SKILL.md` at `skills/<owner>/<technique>/SKILL.md` (no `techniques/` intermediate directory). There is no structural difference between a "top-level" technique and a nested one — only tree position and whether a `workflow.toon` activity binds it.

**Direct invocability.** Because every node is structurally a skill, an agent may fetch any technique directly via `get_skill(<path>)` — the same accessor for every node. The agent picks its abstraction level: a raw per-endpoint self-contained technique for a one-off, or a composing technique when a pre-packaged composite exists.

> **SPEM grounding**: SPEM's "Practice" Guidance kind is the closest formal match — "a proven way of doing things… that addresses one or more concerns of a development effort." Practices are reusable across Tasks and Processes, exactly the cross-cutting property we want. A technique that a `workflow.toon` activity binds additionally plays the SPEM TaskDefinition role.

### 3.3 Role (concept, not a first-class structural element)

A **role** is a *persona contract*. It declares:

1. **Responsibilities** — what the agent in this role is on the hook for.
2. **Authority** — what the role is permitted to do.
3. **Refusals** — what the role MUST decline, and the recovery routing.
4. **Technique qualifications** — the set of activity-bound techniques (those a `workflow.toon` activity binds) this role is rated to perform.

Roles named in the pilot: `engineer`, `reviewer`, `planner`, `architect`, `maintainer`.

**Role definitions DO NOT get a dedicated `roles/` folder.** Role contracts live as `##` sections inside the workflow technique ([workflow/SKILL.md](workflow/SKILL.md)). The body of that technique carries `## Engineer`, `## Reviewer`, `## Planner`, `## Architect`, `## Maintainer` sections; each is a complete persona contract.

**Role-to-skill binding lives in `workflow.toon` activity definitions**, NOT in skill frontmatter. Individual skill SKILL.md files do not carry a `role:` frontmatter field; the workflow author declares "step 3: an agent in the Reviewer role performs `review-diff`" inside the activity definition.

> **SPEM grounding & departure**: SPEM 2.0 RoleDefinition is a first-class Method Content Element with its own typed associations (Default Task Definition Performer with RACI-style kinds). We depart from SPEM by *not* making Role first-class on-disk — purely to fit the Claude Skills standard cleanly (which only recognises `SKILL.md`-rooted folders as first-class entities). The conceptual content of a role contract is preserved; only the architectural slot changes.

### 3.4 Tool (concept, no on-disk representation)

A **tool** is an *external primitive*: a binary, an MCP server, a CLI command, an API, or other named executable/queryable system whose operations a technique invokes.

Tools have **no first-class on-disk representation**. They appear in two forms:

- **Inline** — simple tools (`git`, `cargo`, Claude Code primitives like `Bash`/`Edit`/`Read`) appear as bare command strings woven into technique procedure text. There is no separate file describing them; the technique's prose is the documentation.
- **Tool-dedicated namespace** — complex tools (`gitnexus`, possibly `concept-rag`) warrant a namespace resource (no procedure or `Output` of its own) where each nested technique is the operational description of one API endpoint. Example: `skills/gitnexus/SKILL.md` is the namespace; `skills/gitnexus/impact/SKILL.md` is the operational spec for the `gitnexus_impact()` API. The namespace **is** the tool's interface documentation; because it only groups its endpoint-techniques, it is a freeform resource, not a technique.

There is no `tools/` directory, no `uses-tools:` frontmatter field, no `get_tool` MCP accessor. The Tool concept is fully absorbed into the fabric of technique prose (inline mode) or into a tool-dedicated namespace resource (when warranted).

A tool is the **named system**, not the individual invocation. `gitnexus` is the tool; `gitnexus_impact()` is one of its operations. `cargo` is the tool; `cargo test --release` is one of its invocations.

> **SPEM grounding**: SPEM 2.0's ToolDefinition is "a means or instrument used to perform some Task." Tasks (= our Skills) and the Steps inside them (= our Techniques) reference Tools via the Task's tool-mentoring associations. Our model matches conceptually; the structural realisation differs (no separate `tools/` slot).

---

## 4. Boundary tests (negative definitions)

The positive definitions alone are not enough. Crisp boundary tests resolve ambiguity at the edges. Note that with the collapse, *"is this a skill or a technique?"* is no longer a question — **skill** is the packaging and **technique** is the content; every node is both. The live questions are technique-vs-neighbours.

### 4.1 What a technique is **not**

| A technique is NOT a | Boundary test (the diagnostic question) |
|---|---|
| **Role** | Does it describe *what an agent is qualified to do* (role) or *what an agent is performing right now* (technique)? Plumber-the-role vs. installing-this-specific-boiler. |
| **Workflow** | Does it cover the *whole lifecycle* (workflow) or *one unit of practice within it* (technique)? A workflow chains many activities; each binds a role to a technique by name. |
| **Activity** | Is it the *competency exercised* (technique) or the *workflow's slot* that binds a role to a technique (activity)? Activities are workflow-structural; techniques are content. |
| **Tool call** | Is it a single primitive invocation (tool) or a *procedure* that may compose tools, judgment, and reference checks (technique)? `gitnexus_impact()` is a tool invocation; the technique describes how to use it — parameter selection, result interpretation, escalation discipline. |
| **Rule** | Does it *describe how to perform an operation* (technique) or *constrain whether an operation may be performed* (rule)? "Never edit without an impact check" is a rule. "How to run an impact check and interpret the report" is a technique. The rule mandates the technique. |
| **Inline procedure step** | Is it *only ever used inside one technique* (a `## Procedure` bullet) or *reused across several* (a nested technique worth promoting)? Reuse is the diagnostic. Promoting a one-use step to its own folder is over-engineering until reuse arrives. |

The two extremes are the same kind: a top-level activity-bound composite (`implement-task` — composes sub-techniques) and a self-contained operation (`write-task-code`) are both `kind: technique`. What differs is whether a `workflow.toon` activity binds them and whether the body is self-contained or composing, not kind.

Plumber illustration: "Install a residential boiler" is an activity-bound technique (its `Output` is a working heating system) and composes its steps. "Bend a pipe to 45°" and "solder a copper joint" are self-contained techniques. "Identify the position of joists" is an inline procedure step inside the planning technique — it doesn't earn its own folder unless reused.

### 4.2 What a role is **not**

| A role is NOT a | Boundary test |
|---|---|
| **Technique set** | Is it the *enumeration of techniques* (set) or the *persona contract* — responsibilities, authority, refusals (role)? A role's qualifications are a property of the role, not the whole thing. |
| **Agent type** | Is it a *configuration concern* (agent type — model, tool palette, context window) or a *behavioural-responsibility concern* (role)? Multiple agent types may share a role; one agent type can play multiple roles. |
| **Workflow phase** | Is it *who* is doing the work (role) or *when in the lifecycle it happens* (phase)? Roles are persistent identities; phases are temporal slots. |
| **Title** | Is it a meaningful behavioural contract or just a label? "Senior Engineer" is a title; "Engineer who must run impact analysis before any edit and hand review to a Reviewer on PR creation" is a role. |

### 4.3 What a tool is **not**

| A tool is NOT a | Boundary test |
|---|---|
| **Technique** | Does it *expose operations* (tool) or *compose them into procedures* (technique)? `gitnexus` is the tool; "perform impact analysis, interpret the report, escalate on HIGH/CRITICAL" is the technique. |
| **Activity-bound technique** | Does it have an `Output` and get bound by a workflow activity, or is it just an interface to invoke (tool)? Tools are inert until invoked. (Note: a *tool-dedicated namespace* is content *about* a tool — the namespace resource groups the endpoint-techniques that describe it; the tool is the external system itself.) |
| **Operation / invocation** | Is it the *named system* (tool) or *one call to one of its operations* (invocation)? `gitnexus` is the tool; `gitnexus_impact()` is one invocation. |

### 4.4 What a skill (structural) is **not**

"Skill" is packaging, so most boundary questions dissolve. Two worth stating:

| A (structural) skill is NOT a | Boundary test |
|---|---|
| **Content kind** | "Skill" is never a value of `metadata.kind` — the content kind is `technique`. A folder being "a skill" tells you only that it has a `SKILL.md`. |
| **Guarantee of a deliverable** | A folder being a skill does not mean it produces anything. Only a technique bound by a `workflow.toon` activity is a deliverable; a pure namespace that only groups other skills (no procedure or `Output` of its own) is a freeform resource library. |

---

## 5. Composition rules

The ontology is operationalised by a small set of composition rules:

1. **Workflows compose activities; activities bind a role to a technique by name.** A workflow's structure is "step 1: Engineer performs `create-plan`; step 2: Engineer performs `implement-task`; step 3: Reviewer performs `review-diff`." The activity is the binding; the bound unit is a technique named in `workflow.toon`, and its `Output` section names the work product. Pure tool namespaces (like `gitnexus`) are NOT bound to activities — they are freeform resource libraries.

2. **A composing technique body draws on its nested techniques.** A composing body's `## Techniques` manifest names the techniques it draws on. An activity-bound technique does NOT call other activity-bound techniques — inter-unit coordination happens at the workflow level (handoffs between activities), not inside a technique body. (Pure tool namespaces like `gitnexus` are openly referenced by many techniques — that's their purpose.)

3. **A self-contained technique body composes tool invocations and judgement — not sibling techniques.** Self-contained bodies are the procedures at the bottom. If you find yourself orchestrating other techniques, the body is composing rather than self-contained.

4. **Techniques nest inside their owner; ownership is the tree, not a field.** Every technique sits at `skills/<owner>/<technique-name>/SKILL.md`. No `techniques/` intermediate directory; no `owned-by:` frontmatter field — the directory tree IS the ownership claim.

5. **Rules constrain techniques; rules are not invokable.** A rule like "MUST run impact analysis before any edit" mandates the use of a technique but is not itself executable.

6. **No sub-files.** Every folder under `skills/` is a skill (a `SKILL.md`, possibly with nested skill folders). No flat markdown sub-files. Templates, criteria, primers, role contracts — EITHER promoted to named techniques OR folded into a body as `##` sections (the workflow technique's role contracts are the canonical example).

7. **A role qualifies one or more activity-bound techniques.** A role's persona contract (a `##` section inside [workflow/SKILL.md](workflow/SKILL.md)) declares which activity-bound techniques the role is rated to perform. Workflow.toon activities use the qualification to bind agents. Pure tool namespaces are implicitly available to any role whose qualified techniques draw from them.

8. **Tools have no first-class slot.** Tool API calls live inline in technique prose (simple tools) or in tool-dedicated namespace resources (complex tools). No `uses-tools:` frontmatter; no `tools/` directory.

9. **Single MCP accessor.** `get_skill` resolves every fetch by name (precedence — workflow-local → root) — any technique, resource, or the ontology definition — and supports per-section addressing (`<name>/<section>`). The server auto-detects governed-vs-freeform and delivers the token-efficiency projection (TOON for techniques, simplified markdown for resources). The agent picks its abstraction level by choosing which name to fetch.

10. **Every nested folder is a named, action-oriented technique.** Generic stub names banned: `procedure/`, `execute/`, `main/`, `do/`, `run/`, `step-1/`. Names are verb-phrased, disambiguated where two owners would produce identical slugs (e.g. `understand-task-context` under `implement-task` vs `understand-codebase-context` under `analyze-implementation`).

11. **A technique body is either self-contained or composes sub-techniques.** See §6.

---

## 6. Technique bodies — self-contained or composing

A technique's body may be either **self-contained** (it states its own procedure) or **composing** (it references and sequences other techniques). This is just what the body contains — NOT a recognised "shape" or kind, and the server does not distinguish the two. It is the author's choice, based on whether decomposition pays. Either form may or may not be the unit a `workflow.toon` activity binds; the ontology definition treats both as legitimate.

### Composing body

`SKILL.md` is lean (~80 lines or less). Contains:

- Frontmatter — top-level: `name`, `description`. Under `metadata:`: `ontology: workflow-canonical`, `kind: technique`. (Whether it is the activity-bound unit is declared in `workflow.toon`, not in frontmatter.)
- 0–2 paragraphs of context.
- A `## Techniques` section with a table referencing nested and cross-referenced techniques.

The substance lives in the referenced techniques. A composing body draws on them rather than spelling out a single procedure.

**When to use**: when the technique has multiple meaningful operational phases that benefit from independent invocation, reuse, or progressive disclosure. `implement-task` is canonical — a composing technique that a workflow activity binds.

A separate case is a *pure tool namespace* (no procedure or `Output` of its own, e.g. `gitnexus`) that merely groups its endpoint-techniques. Because it only points at other skills, it is a freeform **resource**, not a technique.

### Self-contained body

`SKILL.md` is a self-contained procedure — it does not delegate to other techniques. Contains:

- Frontmatter.
- `## Pre-conditions`, `## Invariants`, `## Procedure`, `## Output`, `## Refusal paths`.

**When to use**: when delegating to nested techniques would be overkill. Small techniques with a tightly-coupled single procedure. Examples: per-endpoint tool techniques like `gitnexus/impact`; possibly `elicit-requirements`, `research-knowledge-base` if their internal structure doesn't decompose meaningfully.

---

## 7. Cross-reference format

References between techniques (every node is structurally a skill, so one mechanism covers all) are **file-relative markdown hyperlinks** to the target `SKILL.md` — relative to the *referencing file's own directory*, so they click through in any IDE / GitHub / markdown renderer:

```
[<name>](<relative-path>/SKILL.md)
```

The `../` depth follows from where the two files sit; the link always ends in `/SKILL.md` so it resolves to a real, openable file. Link text is the target's `name` (its final path segment). From a technique to a sibling technique: `[<name>](../<name>/SKILL.md)`; from a technique to a resource: `[<name>](../../resources/<name>/SKILL.md)`. Examples (paths shown from inside `implement-task/SKILL.md`):

```
[understand-task-context](understand-task-context/SKILL.md)  # nested child technique
[write-task-code](write-task-code/SKILL.md)                  # nested child technique
[impact](../gitnexus/impact/SKILL.md)                        # sibling tool-namespace endpoint
[dco-attest-commit](../workflow/dco-attest-commit/SKILL.md)  # sibling-bundle reference
```

To reference a **specific operation or section** of another skill, hyperlink BOTH parts — the skill name to its `SKILL.md` and the op/section name to its `#<anchor>` — joined by `::`, with any params after:

```
[<skill>](../<skill>/SKILL.md)::[<op>](../<skill>/SKILL.md#<op>) (`{params}`)
```

e.g. `[gitnexus](../gitnexus/SKILL.md)::[impact](../gitnexus/SKILL.md#impact) (`{target, direction}`)`. Within the same file, a sibling section is just `[<op>](#<op>)`. At rest these are clickable file-relative hyperlinks; on delivery the server simplifies each to a bare name (`<skill>` or `<skill>/<section>`), so to fetch, the agent strips the trailing `/SKILL.md` and calls `get_skill` on the resolved name.

---

## 8. The plumber analogy applied to workflow-server

The plumber analogy that anchored the ontology design maps cleanly to the workflow-server domain:

| Plumbing | Workflow-server |
|---|---|
| Plumber (the role — a concept described in the trade body's handbook) | Engineer / Reviewer / Architect / Planner / Maintainer — concepts described as `##` sections inside [workflow/SKILL.md](workflow/SKILL.md). No first-class on-disk slot. Bound to producing techniques at the workflow-activity level. |
| Install a residential boiler (an activity-bound technique — its `Output` is a working heating system) | `implement-task`, `create-plan`, `review-code`, `validate-build`, etc. |
| Soldering, calibration, bleeding, pressurising (self-contained techniques) | `understand-task-context`, `gitnexus/impact`, `write-and-validate-artifact`, `dco-attest-commit`, etc. Each is a folder with `SKILL.md`, nested inside its owner. |
| Propane torch, manometer, pressure tester (tools) | `gitnexus` (MCP server — gets a tool-dedicated namespace resource), `git`, `cargo`, `Bash`/`Edit`/`Read` (Claude Code primitives — appear inline in technique prose). |
| Safety glasses, the gas regulations (rules) | "MUST run impact analysis before any edit"; "MUST validate build after change" — mandated in the engineer role contract (`## Engineer` section of [workflow/SKILL.md](workflow/SKILL.md)). |
| The boiler manual, the union code (reference content) | Folded into the technique body that uses it. No separate sub-files. |
| The whole-job lifecycle: survey → install → commission → handover (workflow) | `work-package` workflow: plan → implement → validate → review → finalise (workflow chaining activities in `workflow.toon`). |

**Diagnostic from the analogy**: a plumber's job description includes "competent to install residential boilers, service heating systems, fit kitchen plumbing" (role qualifications). A given install (an activity-bound technique) yields a working heating system (its `Output`). Inside the install, the plumber solders many joints (a self-contained technique applied many times). The plumber does NOT "do soldering as a job" — soldering is a means; the install is the end. The ontology preserves this distinction: an activity-bound technique's identity is its deliverable; a self-contained technique's identity is its procedure.

---

## 9. Empirical validation — mapping the existing 25 skills + 28 resources

The ontology must explain the existing surface. Two appendices contain the full mappings; the headline below.

### Roles
5 named roles cover the 25 existing skills, described as `##` sections inside [workflow/SKILL.md](workflow/SKILL.md) (NOT first-class folders):

| Role | Qualified techniques (count) | Examples |
|---|---|---|
| Engineer | 12 | implement-task, validate-build, manage-git |
| Reviewer | 6 | review-code, review-diff, review-strategy |
| Planner | 3 | create-plan, elicit-requirements, research-knowledge-base |
| Architect | 2 | summarize-architecture, create-adr |
| Maintainer | 2 | classify-problem, conduct-retrospective |

### Skills

25 → 25. The grain is largely correct. Most existing files map 1:1 to a skill in the new ontology. A handful of large skills (`analyze-implementation`, `create-plan`, `implement-task`, `build-comprehension`) have multi-phase protocols that decompose into named nested techniques.

Three single-phase wrapper skills are handled specially: `dco-provenance` collapses to a direct binding to [dco-attest-commit](workflow/dco-attest-commit/SKILL.md) (no composing wrapper); `elicit-requirements` and `research-knowledge-base` keep a composing body with one named nested technique each.

### Techniques

**~30–35 total techniques** in the catalogue after empirical analysis. Sources:

- **6 derived from skill-body reuse evidence** (Appendix A): `load-guidance`, `document-findings`, `write-and-validate-artifact`, `collect-and-classify-assumptions`, `present-and-respond-checkpoint`, `dco-attest-commit`.
- **10 promoted from existing `resources/`** (Appendix C): `elicit-structured-requirements`, `analyze-implementation-baseline`, `search-knowledge-base`, `search-external-sources`, `apply-design-framework`, `verify-task-deliverables`, `conduct-architecture-review`, `index-and-review-diffs`, `reconcile-assumptions-autonomously`, etc.
- **6–10 per-endpoint techniques** under the `gitnexus` tool namespace, distributed from resource 27: `gitnexus/impact`, `gitnexus/context`, `gitnexus/cypher`, `gitnexus/detect-changes`, `gitnexus/query`, `gitnexus/rename`, `gitnexus/shape-check`, etc. Exact set finalised in Phase 5.
- **N owner-specific named techniques** lifted from each producing technique's protocol phases (e.g. `implement-task` decomposes into `understand-task-context`, `write-task-code`, `verify-task-locally` per the sample).

### Resources

The 28 existing files are fully redistributed (no `resources/` directory post-migration):

- **10 promoted to techniques** under appropriate composing techniques.
- **14 promoted to named nested techniques** under producing techniques (templates and criteria — `pr-description-template.md` → `compose-pr-description/SKILL.md`, etc.).
- **1 folded into a technique body** (`tdd-concepts-rust.md` becomes the body of `testing/tdd-design-rust/SKILL.md`).
- **1 distributed across a tool namespace** (resource 27 → `gitnexus/SKILL.md` overview + per-endpoint technique bodies).
- **1 belongs in workflow docs** (mode definitions).
- **1 deleted** (obsolete deprecation pointer).

Net effect: ~30–40% reduction in duplicated guidance plus elimination of the resources/ peripheral category, with consistent semantics across the board.

> See [Appendix A](./appendix-empirical-reuse.md) for skill-body reuse evidence, [Appendix B](./appendix-skill-mapping.md) for the per-skill mapping, [Appendix C](./appendix-resource-subsumption.md) for the per-resource disposition.

---

## 10. Relationship to the ontology definition

This document and the ontology definition at [./sample/resources/workflow-canonical/SKILL.md](./sample/resources/workflow-canonical/SKILL.md) carry the same ontology but serve different audiences:

| Aspect | This document | The ontology definition |
|---|---|---|
| Audience | Humans (workflow designers, plan reviewers, future contributors) | Agents (the runtime artifact) |
| Style | Discursive — includes rationale, plumber analogy, empirical validation, SPEM grounding | Terse — operational definitions and rules |
| Authority | Companion (this doc cites the ontology definition as authoritative) | Authoritative for agent execution |
| Stability | Lives in `.engineering/` planning folder; revised as we iterate | Lives at `resources/<ontology>/` (a root resource); treat as a versioned artifact |

When the ontology definition and this document conflict, the **ontology definition is authoritative** for what the agent does. This document explains *why* the ontology definition says what it says.

If the ontology evolves, both should be updated in lockstep. The ontology definition carries the breaking-change risk (agents in flight may have the old version loaded); this document carries the historical context.

---

## 11. Open questions specific to the ontology

(General architectural opens live in [workflow-canonical-plan.md §9.2](./workflow-canonical-plan.md#92-open-questions) and [architecture.md §9](./architecture.md#9-architecture-level-risks).)

1. **Self-contained vs composing bodies.** The pilot favours composing bodies for most techniques. Self-contained bodies are supported but underused so far. After Phase 6 (migration of the 25 legacy skills), revisit: which migrated techniques would benefit from collapsing back to a single self-contained procedure?
2. **Tool-dedicated bundle adoption beyond gitnexus.** `concept-rag` is a candidate (multiple search endpoints, complex usage). Default for the pilot: only `gitnexus` gets a dedicated bundle; others remain inline. Re-evaluate after the migration.
3. **Role contract granularity.** Role contracts are `##` sections inside [workflow/SKILL.md](workflow/SKILL.md). Each is targeted to be ~30 lines. If a role's responsibilities grow past that, do we sub-split into multiple `###` sub-sections, or promote the role to its own structural slot? Defer until empirical evidence warrants.
4. **Ontology-definition versioning.** Should the definition carry an explicit version (`resources/workflow-canonical-v1`)? Skills frozen at v1 stay interpretable even if v2 introduces breaking ontology changes. Open until the definition needs its first revision.

---
title: "Workflow-canonical ontology — human-facing companion"
status: draft
phase: planning
date: 2026-05-23
relates-to: ./workflow-canonical-plan.md
implemented-as: ./sample/meta/workflow-canonical/SKILL.md
---

# Workflow-canonical ontology

> This document is the **human-facing companion** to the agent-facing meta-skill at [./sample/meta/workflow-canonical/SKILL.md](./sample/meta/workflow-canonical/SKILL.md). Same conceptual content; more discursive; includes the rationale, the boundary tests as prose, the plumber analogy, the SPEM 2.0 grounding, and the empirical validation against the existing 25 work-package skills + 28 resources.
>
> The meta-skill is the operational artifact the agent reads at session start. This document is what a human reads to *understand* the ontology and decide whether to extend, modify, or replace it.

---

## 1. Why we need an ontology

The current TOON skills conflate three distinct concepts under the single name "skill":

- The persona of the agent invoking the skill (implicit; never named).
- The deliverable-shaped competency the skill produces (named — `id:` identifies this).
- The reusable operations the skill performs internally (named as protocol phases but appearing across many skills as de-facto cross-cutting concerns — e.g. `pre-edit-impact-check` is functionally identical to "perform impact analysis before any edit" wherever it appears).

The empirical inventory (see [Appendix A](./appendix-empirical-reuse.md)) shows this conflation has real cost:

- `gitnexus-discipline` rule appears in **11 of 25 skills** under near-identical wording but with slight naming drift (`gitnexus-discipline`, `gitnexus-first-locate`, `gitnexus-usage`).
- `load-guidance` → `document-findings` → `write-artifact` phase trio appears together in **13+ skills** with the same shape and intent.
- Resource ID `27` (GitNexus reference) is referenced by **15 of 25 skills**.

These are reuse signals the ontology should make first-class.

---

## 2. Architecture vs ontology — separable layers

The architecture (server-enforced, ontology-agnostic) is one thing; the ontology (meta-skill-defined, agent-interpreted) is another. The workflow-canonical ontology is *one specific meta-skill's content* — not an architectural property of the server. Other ontologies could substitute.

This document covers the **ontology layer**: what the workflow-canonical meta-skill says. The architecture layer (server seam, frontmatter schema, MCP surface) lives in [architecture.md](./architecture.md).

---

## 3. The four ontological concepts

The workflow-canonical ontology has **four first-class concepts**. Only one of them (Skill) is structurally first-class on disk; the other three are concept-level only.

### 3.1 Skill — the structural primitive

A **skill** is a coherent unit of practice, identified by its position in the `skills/` directory tree (a folder containing a `SKILL.md`).

Two kinds, declared via the `metadata.kind` frontmatter field:

- **deliverable** — produces a named work product. The unit of workflow delegation: a `workflow.toon` activity binds an agent (with an assigned role) to a deliverable skill.
- **competency-bundle** — a coherent grouping of related techniques. No deliverable of its own. Examples: `gitnexus` (tool operations), `workflow` (role contracts + orchestration techniques), `code-review` (review techniques), `research`, `design`, `assumption-management`, `testing`.

A skill is named after the **deliverable it produces** (for deliverable skills) or the **domain it covers** (for competency-bundles), not the operations it performs internally. "Implement a task" produces an implementation; "Create a plan" produces a plan; "GitNexus" covers the gitnexus domain.

A deliverable skill is **the unit of delegation** — the granularity at which the workflow dispatches an agent to do a piece of work and produce a defined output.

> **SPEM 2.0 grounding**: SPEM TaskDefinition (the most-direct analogue) has Work Product Definitions on its input/output associations and Steps as its internal decomposition. Steps in SPEM correspond loosely to phases-within-a-skill in our model; where steps recur identically across many Tasks, SPEM extracts them as Practices. Our techniques are Practices; our deliverable skills are TaskDefinitions; our competency-bundles are closer to SPEM CapabilityPatterns.

### 3.2 Technique

A **technique** is an *independently-demonstrable unit of practice*. It has:

1. **Pre-conditions** — what must be true to invoke.
2. **Invariants** — what must remain true throughout.
3. **Procedure** — the canonical way to perform this operation.
4. **Output** — what the technique produces (an artifact, a state change, a verified condition).
5. **Refusal paths** — when the technique must stop and surface rather than continue.

A technique is **not** a deliverable-producing competency on its own — it produces a *capability execution* that contributes to a skill's deliverable. Soldering a joint contributes to a working boiler; running an impact check contributes to a safe code edit.

A technique stands alone in two senses:

- **Definitionally** — its description does not depend on any particular skill. You can read a technique cold and understand it.
- **Demonstrably** — you can demonstrate the technique on a contrived input without invoking a skill at all.

**Techniques are independent** — they do NOT declare ordering relative to other techniques. Sequencing emerges from each technique's preconditions and from the role contract that mandates discipline. The agent assembles the sequence at execution time.

**On-disk isomorphism with skills.** A technique uses the same on-disk shape as a skill: a folder containing a `SKILL.md` with the same frontmatter schema. Path: `skills/<owner-skill>/<technique-name>/SKILL.md` (no `techniques/` intermediate directory). Identified by `metadata.kind: technique` (under `metadata.ontology: workflow-canonical`) in frontmatter. From the file system's perspective, techniques are just nested skills.

**Direct invocability.** Because techniques are structurally indistinguishable from skills, an agent may invoke a technique directly via `get_skill(<path>)` — the same accessor used for top-level skills. The agent can therefore choose its abstraction level: a raw per-endpoint technique for a one-off, or a higher-level orchestrating skill when a pre-packaged composite exists.

> **SPEM grounding**: SPEM's "Practice" Guidance kind is the closest formal match — "a proven way of doing things, validated in industry, that addresses one or more concerns of a development effort." Practices in SPEM are reusable across Tasks and Processes, exactly the cross-cutting property we want.

### 3.3 Role (concept, not a first-class structural element)

A **role** is a *persona contract*. It declares:

1. **Responsibilities** — what the agent in this role is on the hook for.
2. **Authority** — what the role is permitted to do.
3. **Refusals** — what the role MUST decline, and the recovery routing.
4. **Skill qualifications** — the set of deliverable skills this role is rated to perform.

Roles named in the pilot: `engineer`, `reviewer`, `planner`, `architect`, `maintainer`.

**Role definitions DO NOT get a dedicated `roles/` folder.** Role contracts live as `##` sections inside the workflow competency-bundle skill (`skill:workflow/SKILL.md`). The body of that skill carries `## Engineer`, `## Reviewer`, `## Planner`, `## Architect`, `## Maintainer` sections; each is a complete persona contract.

**Role-to-skill binding lives in `workflow.toon` activity definitions**, NOT in skill frontmatter. Individual skill SKILL.md files do not carry a `role:` frontmatter field; the workflow author declares "step 3: an agent in the Reviewer role performs `review-diff`" inside the activity definition.

> **SPEM grounding & departure**: SPEM 2.0 RoleDefinition is a first-class Method Content Element with its own typed associations (Default Task Definition Performer with RACI-style kinds). We depart from SPEM by *not* making Role first-class on-disk — purely to fit the Claude Skills standard cleanly (which only recognises `SKILL.md`-rooted folders as first-class entities). The conceptual content of a role contract is preserved; only the architectural slot changes.

### 3.4 Tool (concept, no on-disk representation)

A **tool** is an *external primitive*: a binary, an MCP server, a CLI command, an API, or other named executable/queryable system whose operations a technique invokes.

Tools have **no first-class on-disk representation**. They appear in two forms:

- **Inline** — simple tools (`git`, `cargo`, Claude Code primitives like `Bash`/`Edit`/`Read`) appear as bare command strings woven into technique procedure text. There is no separate file describing them; the technique's prose is the documentation.
- **Tool-dedicated competency-bundle skill** — complex tools (`gitnexus`, possibly `concept-rag`) warrant a competency-bundle skill where each nested technique is the operational description of one API endpoint. Example: `skills/gitnexus/SKILL.md` is the navigator; `skills/gitnexus/impact/SKILL.md` is the operational spec for the `gitnexus_impact()` API. The skill **is** the tool's interface documentation.

There is no `tools/` directory, no `uses-tools:` frontmatter field, no `get_tool` MCP accessor. The Tool concept is fully absorbed into the fabric of technique prose (inline mode) or into a tool-dedicated bundle skill (when warranted).

A tool is the **named system**, not the individual invocation. `gitnexus` is the tool; `gitnexus_impact()` is one of its operations. `cargo` is the tool; `cargo test --release` is one of its invocations.

> **SPEM grounding**: SPEM 2.0's ToolDefinition is "a means or instrument used to perform some Task." Tasks (= our Skills) and the Steps inside them (= our Techniques) reference Tools via the Task's tool-mentoring associations. Our model matches conceptually; the structural realisation differs (no separate `tools/` slot).

---

## 4. Boundary tests (negative definitions)

The positive definitions alone are not enough. Crisp boundary tests resolve ambiguity at the edges.

### 4.1 What a skill is **not**

| A skill is NOT a | Boundary test (the diagnostic question) |
|---|---|
| **Role** | Does it describe *what an agent is qualified to do* (role) or *what an agent is performing right now* (skill)? Plumber-the-role vs. installing-this-specific-boiler. |
| **Technique** | Does it produce a *deliverable* of its own (skill) or *contribute to* a deliverable (technique)? A skill answers "is the job done?"; a technique answers "did I execute this operation correctly?" |
| **Workflow** | Does it cover the *whole lifecycle* (workflow) or *one activity in the lifecycle* (skill)? A workflow chains many activities, each of which exposes a skill. |
| **Protocol step** | Does it produce a *deliverable* (skill) or *advance state inside a deliverable's production* (step)? If the named phase appears only inside one skill and would never be invoked on its own, it's a step, not a skill. |
| **Activity** | Is it the *competency* exposed by an activity (skill), or the *workflow's slot* that binds a role to a skill (activity)? Activities are workflow-structural; skills are content. |

Plumber illustration: "Install a residential boiler" is a skill (deliverable: working heating system). "Bend a pipe to 45°" is a technique. "Plan the route the pipes will take" is also a skill (deliverable: a routing plan). "Identify the position of joists" is a step inside the planning skill — it doesn't produce a standalone deliverable.

### 4.2 What a technique is **not**

| A technique is NOT a | Boundary test |
|---|---|
| **Skill** | Does it produce a *deliverable*? If yes, it's a skill. Techniques produce *operation outcomes* that feed deliverables. |
| **Tool call** | Is it a single primitive invocation (tool) or a *procedure* that may compose tools, judgment, and reference checks (technique)? `gitnexus_impact()` is a tool invocation; the technique describes how to use it including parameter selection, result interpretation, and escalation discipline. |
| **Rule** | Does it *describe how to perform an operation* (technique) or *constrain whether an operation may be performed* (rule)? "Never edit without an impact check" is a rule. "How to run an impact check and interpret the report" is a technique. The rule mandates the technique. |
| **Step within a skill** | Is it *only ever invoked inside this one skill* (step) or *reused across many skills* (technique)? Reuse is the diagnostic. A step used in exactly one skill is a step; pulling it up to a technique would be over-engineering until reuse arrives. |

Plumber illustration: "Soldering a copper joint" is a technique. The propane torch is a tool. "Always wear safety glasses when soldering" is a rule. The plumber's union code is reference content that gets folded into the technique body, not held as a separate sub-file.

### 4.3 What a role is **not**

| A role is NOT a | Boundary test |
|---|---|
| **Skill set** | Is it the *enumeration of skills* (set) or the *persona contract that includes responsibilities, authority, and refusals* (role)? A role's qualifications are a property of the role, not the whole thing. |
| **Agent type** | Is it a *configuration concern* (agent type — model, tool palette, context window) or a *behavioural-responsibility concern* (role)? Multiple agent types may share a role; one agent type can be configured to play multiple roles in different sessions. |
| **Workflow phase** | Is it *who* is doing the work (role) or *when in the lifecycle the work happens* (phase)? Roles are persistent identities; phases are temporal slots. |
| **Title** | Is it a meaningful behavioural contract or just a label? "Senior Engineer" is a title; "Engineer who must run impact analysis before any edit and must hand off review to a Reviewer role on PR creation" is a role. |

### 4.4 What a tool is **not**

| A tool is NOT a | Boundary test |
|---|---|
| **Technique** | Does it *expose operations* (tool) or *compose them into procedures* (technique)? `gitnexus` is the tool; "perform impact analysis, interpret the report, escalate on HIGH/CRITICAL" is the technique. |
| **Skill** | Does it have a deliverable (skill) or just an interface to invoke (tool)? Tools are inert until invoked; skills produce work products. (Note: a *tool-dedicated bundle skill* is a Skill *about* a Tool — the bundle skill itself is the skill; the Tool is what its techniques describe.) |
| **Operation / invocation** | Is it the *named system* (tool) or *one call to one of its operations* (invocation)? `gitnexus` is the tool; `gitnexus_impact()` is one invocation of one of its operations. |

---

## 5. Composition rules

The ontology is operationalised by a small set of composition rules:

1. **Workflows compose activities; activities bind a role to a (deliverable-shaped) skill.** A workflow's structure is "step 1: Engineer performs `create-plan`; step 2: Engineer performs `implement-task`; step 3: Reviewer performs `review-diff`." The activity is the binding; the deliverable-shaped skill is the competency exercised. Competency-bundle skills (like `gitnexus`) are NOT bound to activities — they exist as technique libraries.

2. **Deliverable-shaped skills compose techniques.** A deliverable skill's body (or its `## Techniques` table if navigator-style) names the techniques it draws on. It does NOT call other deliverable skills — inter-skill coordination happens at the workflow level (handoffs between activities), not inside a skill body. (Competency-bundle skills are openly referenced by many deliverable skills — that's the point of competency-bundles.)

3. **Techniques compose tool invocations and judgement steps.** Techniques are leaf-level procedures. They do not compose other techniques. (If you want composition, you have a skill on your hands.)

4. **Techniques live inside their owning skill folder; ownership is tacit, not declared.** Every technique sits at `skills/<owner-skill>/<technique-name>/SKILL.md`. No `techniques/` intermediate directory. No `owned-by:` frontmatter field — the directory tree IS the ownership claim.

5. **Rules constrain skills and techniques; rules are not invokable.** A rule like "MUST run impact analysis before any edit" mandates the use of a technique but is not itself executable.

6. **No sub-files.** Every folder under `skills/` is a skill (top-level or nested technique) containing a `SKILL.md` and possibly more nested skill folders. No flat markdown sub-files. Templates, criteria, primers, role contracts — these are EITHER promoted to named techniques OR folded into the relevant skill body as `##` sections (the workflow skill's role contracts are the canonical example).

7. **A role qualifies one or more deliverable-shaped skills.** A role's persona contract (a `##` section inside `skill:workflow/SKILL.md`) declares which deliverable skills the role is rated to perform. Workflow.toon activities use the qualification to bind agents to skills. Competency-bundle skills are implicitly available to any role whose qualified skills draw techniques from them.

8. **Tools have no first-class slot.** Tool API calls live inline in technique prose (simple tools) or in tool-dedicated bundle skills (complex tools). No `uses-tools:` frontmatter; no `tools/` directory.

9. **Single MCP accessor.** `get_skill(<path>)` resolves every fetch — top-level skills, nested techniques, the meta-skill, arbitrary depth. Wire format is markdown. The agent picks its abstraction level by choosing which path to fetch.

10. **Every nested folder under a skill is a named, action-oriented technique.** Generic stub names banned: `procedure/`, `execute/`, `main/`, `do/`, `run/`, `step-1/`. Names are verb-phrased, disambiguated where two skills would produce identical slugs (e.g. `understand-task-context` under `implement-task` vs `understand-codebase-context` under `analyze-implementation`).

11. **Top-level skills are lean navigators (or singletons).** See §6.

---

## 6. Top-level skill shapes — navigator vs singleton

A top-level skill (kind=deliverable or kind=competency-bundle) takes one of two shapes. Author's choice per skill based on whether decomposition pays.

### Navigator-style

`SKILL.md` is a thin navigator (~80 lines or less). Contains:

- Frontmatter — top-level: `name`, `description`. Under `metadata:`: `ontology: workflow-canonical`, `kind: <deliverable|competency-bundle|technique|meta-skill>`, plus `produces:` for deliverable skills.
- 0–2 paragraphs of context.
- A `## Techniques` section with a table listing nested and cross-referenced techniques.

The substance lives in nested techniques. The navigator is purely a manifest; it does NOT contain protocol body.

**When to use**: when the skill has multiple meaningful operational phases that benefit from independent invocation, reuse, or progressive disclosure. `implement-task` is canonical.

### Singleton-style

`SKILL.md` is a self-contained technique-shape body — no nested techniques under it. Contains:

- Frontmatter.
- `## Pre-conditions`, `## Invariants`, `## Procedure`, `## Output`, `## Refusal paths` — the same sections a technique uses.

**When to use**: when nested-technique decomposition would be overkill. Small skills with a tightly-coupled single procedure. Examples (under workflow-canonical): possibly `elicit-requirements`, `research-knowledge-base` if their internal structure doesn't decompose meaningfully.

Both shapes are first-class. The ontology supports either; the meta-skill defines both as legitimate.

---

## 7. Canonical specifier format

References to skills (including techniques, since techniques are structurally skills) use this URI scheme:

```
skill:<path>
```

Where `<path>` is the full path under `skills/`, slashes preserved, no leading slash, no `SKILL.md` suffix. Examples:

```
skill:implement-task                                  # top-level deliverable
skill:implement-task/understand-task-context          # nested technique
skill:gitnexus/impact                                 # tool-bundle endpoint
skill:gitnexus/impact-analysis/analysis1              # deeper nesting permitted
skill:workflow/dco-attest-commit                      # cross-bundle reference
skill:meta/workflow-canonical                         # the meta-skill itself
```

In markdown body, references appear as standard markdown links: `[display-text](skill:<path>)`. Display text is human-readable; the URL is the canonical specifier.

The agent fetches a skill by calling `get_skill(<path>)` — the URI minus `skill:` prefix.

---

## 8. The plumber analogy applied to workflow-server

The plumber analogy that anchored the ontology design maps cleanly to the workflow-server domain:

| Plumbing | Workflow-server |
|---|---|
| Plumber (the role — a concept described in the trade body's handbook) | Engineer / Reviewer / Architect / Planner / Maintainer — concepts described as `##` sections inside `skill:workflow/SKILL.md`. No first-class on-disk slot. Bound to skills at the workflow-activity level. |
| Install a residential boiler (a deliverable-shaped skill) | `implement-task`, `create-plan`, `review-code`, `validate-build`, etc. |
| Soldering, calibration, bleeding, pressurising (techniques) | `understand-task-context`, `gitnexus/impact`, `write-and-validate-artifact`, `dco-attest-commit`, etc. Each is a folder with `SKILL.md`, nested inside its owning skill. |
| Propane torch, manometer, pressure tester (tools) | `gitnexus` (MCP server — gets a tool-dedicated bundle skill), `git`, `cargo`, `Bash`/`Edit`/`Read` (Claude Code primitives — appear inline in technique prose). |
| Safety glasses, the gas regulations (rules) | "MUST run impact analysis before any edit"; "MUST validate build after change" — mandated in the engineer role contract (`## Engineer` section of `skill:workflow/SKILL.md`). |
| The boiler manual, the union code (reference content) | Folded into the technique body that uses it. No separate sub-files. |
| The whole-job lifecycle: survey → install → commission → handover (workflow) | `work-package` workflow: plan → implement → validate → review → finalise (workflow chaining activities in `workflow.toon`). |

**Diagnostic from the analogy**: a plumber's job description includes "competent to install residential boilers, service heating systems, fit kitchen plumbing" (role qualifications). A given install (skill) produces a working heating system (deliverable). Inside the install, the plumber solders many joints (technique applied many times). The plumber does NOT "do soldering as a job" — soldering is a means; the install is the end. The ontology preserves this distinction: a skill's identity is its deliverable; a technique's identity is its procedure.

---

## 9. Empirical validation — mapping the existing 25 skills + 28 resources

The ontology must explain the existing surface. Two appendices contain the full mappings; the headline below.

### Roles
5 named roles cover the 25 existing skills, described as `##` sections inside `skill:workflow/SKILL.md` (NOT first-class folders):

| Role | Qualified skills (count) | Examples |
|---|---|---|
| Engineer | 12 | implement-task, validate-build, manage-git |
| Reviewer | 6 | review-code, review-diff, review-strategy |
| Planner | 3 | create-plan, elicit-requirements, research-knowledge-base |
| Architect | 2 | summarize-architecture, create-adr |
| Maintainer | 2 | classify-problem, conduct-retrospective |

### Skills

25 → 25. The grain is largely correct. Most existing files map 1:1 to a skill in the new ontology. A handful of large skills (`analyze-implementation`, `create-plan`, `implement-task`, `build-comprehension`) have multi-phase protocols that decompose into named nested techniques.

Three single-phase wrapper skills are handled specially: `dco-provenance` collapses to a direct binding to `skill:workflow/dco-attest-commit` (no navigator); `elicit-requirements` and `research-knowledge-base` keep navigators with one named nested technique each.

### Techniques

**~30–35 total techniques** in the catalogue after empirical analysis. Sources:

- **6 derived from skill-body reuse evidence** (Appendix A): `load-guidance`, `document-findings`, `write-and-validate-artifact`, `collect-and-classify-assumptions`, `present-and-respond-checkpoint`, `dco-attest-commit`.
- **10 promoted from existing `resources/`** (Appendix C): `elicit-structured-requirements`, `analyze-implementation-baseline`, `search-knowledge-base`, `search-external-sources`, `apply-design-framework`, `verify-task-deliverables`, `conduct-architecture-review`, `index-and-review-diffs`, `reconcile-assumptions-autonomously`, etc.
- **6–10 per-endpoint techniques** under the `gitnexus` tool-dedicated bundle, distributed from resource 27: `gitnexus/impact`, `gitnexus/context`, `gitnexus/cypher`, `gitnexus/detect-changes`, `gitnexus/query`, `gitnexus/rename`, `gitnexus/shape-check`, etc. Exact set finalised in Phase 5.
- **N skill-specific named techniques** lifted from each deliverable skill's protocol phases (e.g. `implement-task` produces `understand-task-context`, `write-task-code`, `verify-task-locally` per the sample).

### Resources

The 28 existing files are fully redistributed (no `resources/` directory post-migration):

- **10 promoted to techniques** under appropriate bundles.
- **14 promoted to named nested techniques** under deliverable skills (templates and criteria — `pr-description-template.md` → `compose-pr-description/SKILL.md`, etc.).
- **1 folded into a technique body** (`tdd-concepts-rust.md` becomes the body of `testing/tdd-design-rust/SKILL.md`).
- **1 distributed across a tool-dedicated bundle** (resource 27 → `gitnexus/SKILL.md` overview + per-endpoint technique bodies).
- **1 belongs in workflow docs** (mode definitions).
- **1 deleted** (obsolete deprecation pointer).

Net effect: ~30–40% reduction in duplicated guidance plus elimination of the resources/ peripheral category, with consistent semantics across the board.

> See [Appendix A](./appendix-empirical-reuse.md) for skill-body reuse evidence, [Appendix B](./appendix-skill-mapping.md) for the per-skill mapping, [Appendix C](./appendix-resource-subsumption.md) for the per-resource disposition.

---

## 10. Relationship to the meta-skill

This document and the meta-skill at [./sample/meta/workflow-canonical/SKILL.md](./sample/meta/workflow-canonical/SKILL.md) carry the same ontology but serve different audiences:

| Aspect | This document | The meta-skill |
|---|---|---|
| Audience | Humans (workflow designers, plan reviewers, future contributors) | Agents (the runtime artifact) |
| Style | Discursive — includes rationale, plumber analogy, empirical validation, SPEM grounding | Terse — operational definitions and rules |
| Authority | Companion (this doc cites the meta-skill as authoritative) | Authoritative for agent execution |
| Stability | Lives in `.engineering/` planning folder; revised as we iterate | Lives in `workflows/<workflow>/skills/meta/`; treat as a versioned artifact |

When the meta-skill and this document conflict, the **meta-skill is authoritative** for what the agent does. This document explains *why* the meta-skill says what it says.

If the ontology evolves, both should be updated in lockstep. The meta-skill carries the breaking-change risk (agents in flight may have the old version loaded); this document carries the historical context.

---

## 11. Open questions specific to the ontology

(General architectural opens live in [workflow-canonical-plan.md §9.2](./workflow-canonical-plan.md#92-open-questions) and [architecture.md §9](./architecture.md#9-architecture-level-risks).)

1. **Singleton-style adoption.** The pilot favours navigator-style for most skills. Singleton-style is supported but underused so far. After Phase 6 (migration of the 25 legacy skills), revisit: which migrated skills would benefit from collapsing back to singleton-style?
2. **Tool-dedicated bundle adoption beyond gitnexus.** `concept-rag` is a candidate (multiple search endpoints, complex usage). Default for the pilot: only `gitnexus` gets a dedicated bundle; others remain inline. Re-evaluate after the migration.
3. **Role contract granularity.** Role contracts are `##` sections inside `skill:workflow/SKILL.md`. Each is targeted to be ~30 lines. If a role's responsibilities grow past that, do we sub-split into multiple `###` sub-sections, or promote the role to its own structural slot? Defer until empirical evidence warrants.
4. **Meta-skill versioning.** Should the meta-skill carry an explicit version (`skill:meta/workflow-canonical-v1`)? Skills frozen at v1 stay interpretable even if v2 introduces breaking ontology changes. Open until the meta-skill needs its first revision.

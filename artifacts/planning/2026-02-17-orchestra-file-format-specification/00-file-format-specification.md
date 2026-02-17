# Workflow File Format Specification

**Date:** 2026-02-17
**Version:** 3.0.0
**Status:** Draft

---

## 1. Purpose

This specification defines the file format, structure, and validation rules for the three workflow primitives used by the workflow-server: **Activity**, **Skill**, and **Resource**. It serves two purposes:

1. **Conversion:** Guide migration of existing TOON-format activities, skills, and resources to the new format.
2. **Validation:** Provide rules for validating new and modified files against the specification.

**Note:** The Orchestra DSL specification (in the `orchestra` repository) extends this format with runner-mediated variable substitution and Situation assembly. This document covers the file format as consumed by the workflow-server MCP server, which serves content to agents without active template processing.

---

## 2. Design Foundations

### 2.1 The Formal Spine / Prose Flesh Principle

The workflow file format derives from a fundamental boundary principle:

> **If it provides structural metadata for indexing and serving, it should be formal. If only the agent needs it to perform quality work, it can be prose.**

This principle partitions all workflow content into three categories:

| Category | Audience | Format | Purpose |
|---|---|---|---|
| **Formal Structure** | Server (indexing, routing) | YAML | Execution graph: flow, decisions, loops, checkpoints, transitions, variables |
| **Prose Content** | Agent (interpretive actor) | Markdown | Methodology, domain knowledge, quality guidance |
| **Gray Zone** | Both | Formal skeleton + prose annotation | Checkpoint options, decision descriptions, transition rationale |

### 2.2 Server-Agent Architecture

The workflow-server operates as an MCP server with two parties:

- **Server** (MCP): Loads, indexes, and serves workflow content via MCP tools (`get_activity`, `get_skill`, `get_resource`). Reads YAML for structural indexing and markdown for content serving.
- **Agent** (Consumer): Calls MCP tools to retrieve workflow content. Interprets prose, makes decisions, executes work.

The server serves files. The agent interprets content. The file format boundary distinguishes structural metadata (YAML, frontmatter) from prose content (markdown body).

### 2.3 Derivation from Standards

This design synthesizes three standards:

| Standard | Contribution to Workflow Design |
|---|---|
| **SPEM 2.0** (OMG) | Separation of Method Content (reusable knowledge) from Process Structure (specific sequencing). Skills = Method Content; Activities = Process Structure. |
| **BPMN 2.0** (OMG) | Execution semantics: token-based flow, gateway patterns, task type taxonomy. Activities adopt these for deterministic execution. |
| **Essence 1.2** (OMG/SEMAT) | Composable practices, state-driven progress tracking. Skills are composable; variables track Alpha-like state progression. |

### 2.4 Relationship to ASPICE / ISO Standards

Workflow primitives map to established standards vocabulary:

| Workflow Primitive | ISO 12207/15288 | SPEM 2.0 | ASPICE |
|---|---|---|---|
| Activity | Activity | Activity (Process Structure) | — (not a lifecycle model) |
| Skill | — | Task Definition (Method Content) | — |
| Resource | — | Guidance (Method Content) | Information Item |
| Step | Task | Step | — |
| Checkpoint | — | Milestone | — |
| Variable | — | — | — |
| Artifact | Work Product | Work Product Definition | Work Product |

These workflows form a **prescriptive lifecycle blueprint**, not an assessment model. ASPICE's base practices describe "what to look for" during assessment; workflow activities describe "what to do" during execution.

---

## 3. Primitives

The workflow-server uses three file-format primitives. Each has a distinct on-disk shape.

### 3.1 Overview

| Primitive | On Disk | Formal Part | Prose Part | Server Indexes | Agent Reads |
|---|---|---|---|---|---|
| **Activity** | Single `.yaml` file | The whole file | Step/checkpoint descriptions (terse) | Entire file | Structural context via MCP |
| **Skill** | Single `.md` file | None | Entire body | Serves as-is via MCP | Prose methodology |
| **Resource** | Single `.md` file | Frontmatter (`id`, `version`, `role`) | Entire body | Frontmatter for indexing | Body as prose via MCP |

### 3.2 Directory Layout

```
workflows/
  {workflow-id}/
    workflow.yaml                       # Workflow-level metadata and variable declarations

    activities/
      {activity-id}.yaml                # One file per activity (formal spine)

    skills/
      {skill-id}.md                     # Prose methodology document

    resources/
      {resource-id}.md                  # Shared reference material (static prose)
```

**Naming conventions:**
- All identifiers use kebab-case: `elicit-requirements`, `review-code`
- Activity files: `{id}.yaml`
- Skill files: `{id}.md` (filename IS the skill ID)
- Resource files: `{id}.md` (filename IS the resource ID)
- Numeric prefixes (e.g., `03-`, `16-`) from legacy format are dropped; ordering is defined by the activity's formal spine, not filename sorting

---

## 4. Activity Format

### 4.1 Description

An Activity is the **formal spine** of execution. It defines the execution graph: steps, checkpoints, decisions, loops, transitions, and variables. It references Skills (for capability) and Resources (for domain knowledge) by ID.

An Activity is a single YAML file. Prose content within it is limited to terse descriptions in step, checkpoint, and decision elements -- just enough for the agent to understand intent.

### 4.2 Schema

```yaml
# === Identity (REQUIRED) ===
id: string                              # Unique identifier (kebab-case)
version: string                         # Semantic version (X.Y.Z)
name: string                            # Human-readable name

# === Description (REQUIRED) ===
description: string                     # One-paragraph purpose statement

# === Applicability (OPTIONAL) ===
required: boolean                       # Whether this activity is mandatory in the workflow
applicability: string                   # When this activity applies (prose, for agent)
estimatedTime: string                   # Estimated duration (e.g., "15-30m")

# === References (OPTIONAL) ===
skills:
  primary: string                       # Primary skill ID
  supporting: string[]                  # Supporting skill IDs
resources: string[]                     # Resource IDs to attach

# === Variables (OPTIONAL) ===
variables:
  {name}:
    type: string | boolean | number | list
    default: any                        # Default value (optional)

# === Steps (REQUIRED) ===
steps:
  - id: string                          # Step identifier (unique within activity)
    name: string                        # Human-readable step name
    description: string                 # Terse prose: what this step accomplishes (OPTIONAL)
    skill: string                       # Skill ID to invoke (OPTIONAL)
    checkpoint: string                  # Checkpoint ID to trigger (OPTIONAL)
    loop: string                        # Loop ID to execute (OPTIONAL)
    decision: string                    # Decision ID to evaluate (OPTIONAL)
    artifact: string                    # Artifact ID this step produces (OPTIONAL)
    condition:                          # Guard condition for this step (OPTIONAL)
      variable: string
      operator: string                  # ==, !=, >, <, >=, <=, in, not-in
      value: any

# === Loops (OPTIONAL) ===
loops:
  - id: string                          # Loop identifier
    type: forEach | while               # Loop type
    variable: string                    # Iterator variable name (forEach)
    over: string                        # Variable containing the collection (forEach)
    condition:                          # Loop condition (while)
      variable: string
      operator: string
      value: any
    maxIterations: number               # Safety bound
    steps:                              # Steps within the loop (same schema as top-level steps)
      - id: string
        name: string
        description: string
        decision: string

# === Decisions (OPTIONAL) ===
decisions:
  - id: string                          # Decision identifier
    description: string                 # What is being decided (OPTIONAL, terse prose)
    branches:
      - id: string                      # Branch identifier
        label: string                   # Human-readable branch label
        transitionTo: string            # Step ID, loop keyword, or activity step to go to
        condition:                      # Formal guard (OPTIONAL — if absent, agent selects)
          variable: string
          operator: string
          value: any

# === Checkpoints (OPTIONAL) ===
checkpoints:
  - id: string                          # Checkpoint identifier
    message: string                     # Prose message presented to user/agent
    blocking: boolean                   # Whether execution suspends (default: true)
    options:
      - id: string                      # Option identifier
        label: string                   # Human-readable label
        description: string             # Prose: what this option means (OPTIONAL)
        effect:                         # State change on selection (OPTIONAL)
          setVariable:
            {name}: any

# === Transitions (OPTIONAL) ===
transitions:
  - to: string                          # Target activity ID
    condition:                          # Guard condition
      variable: string
      operator: string
      value: any
    isDefault: boolean                  # Whether this is the default transition

# === Artifacts (OPTIONAL) ===
artifacts:
  - id: string                          # Artifact identifier
    name: string                        # Filename (e.g., "requirements-elicitation.md")
    location: string                    # Storage location (e.g., "planning")
```

### 4.3 Validation Rules

**Structural:**
1. `id`, `version`, `name`, `description`, and `steps` are REQUIRED.
2. Every `id` within `steps`, `loops`, `decisions`, `checkpoints`, `transitions`, and `artifacts` MUST be unique within the activity.
3. Step references (`checkpoint`, `loop`, `decision`, `artifact`, `skill`) MUST resolve to a declared element within the activity or a known skill/resource ID.
4. Transition `to` values MUST reference a valid activity ID within the workflow.
5. Decision `transitionTo` values MUST reference a valid step ID, loop keyword (`next-loop-iteration`), or activity step within scope.

**Semantic:**
6. Every checkpoint option MUST have a unique `id`.
7. Variables referenced in conditions MUST be declared in `variables` or be loop iterator variables.
8. Loops MUST have a `maxIterations` bound.
9. At least one transition SHOULD have `isDefault: true`.
10. Artifact `id` values referenced in steps MUST match a declared artifact.

**Prose content rules:**
11. `description` fields MUST be terse (one sentence to one short paragraph). Extended methodology belongs in the skill or a resource.
12. Checkpoint `message` fields are prose presented to the user — they may be longer but should not contain methodology or instructions.
13. No step, checkpoint, or decision should contain "how to" guidance — that belongs in the skill or resource.

### 4.4 Complete Example

```yaml
id: requirements-elicitation
version: 3.0.0
name: Requirements Elicitation
description: >
  Discover and clarify what the work package should accomplish
  through structured sequential conversation.

required: false
applicability: "New features and major enhancements only"
estimatedTime: 15-30m

skills:
  primary: elicit-requirements
  supporting:
    - atlassian-operations
    - manage-artifacts
resources:
  - requirements-elicitation

variables:
  has_stakeholder_input:
    type: boolean
    default: false
  elicitation_complete:
    type: boolean
    default: false
  current_domain:
    type: string
  question_domains:
    type: list
    default:
      - problem-exploration
      - stakeholder-identification
      - context-environment
      - scope-definition
      - success-criteria

steps:
  - id: stakeholder-discussion
    name: Stakeholder Discussion
    checkpoint: stakeholder-transcript

  - id: elicit-requirements
    name: Elicit requirements through conversation
    loop: domain-iteration

  - id: collect-assumptions
    name: Collect assumptions
    description: >
      Identify assumptions from requirement interpretation.
      Categories: Requirement Interpretation, Scope Boundaries,
      Implicit Requirements, Success Criteria.

  - id: post-assumptions
    name: Post assumptions for stakeholder review
    skill: atlassian-operations
    condition:
      variable: issue_platform
      operator: "=="
      value: jira

  - id: create-document
    name: Create requirements document
    artifact: requirements-document

  - id: review-document
    name: Review requirements document
    checkpoint: document-review

loops:
  - id: domain-iteration
    type: forEach
    variable: current_domain
    over: question_domains
    maxIterations: 5
    steps:
      - id: ask-question
        name: Ask domain question
      - id: record-response
        name: Record response
        decision: user-intent

decisions:
  - id: user-intent
    description: Determine next action based on user response
    branches:
      - id: answered
        label: User answered
        transitionTo: ask-question
      - id: skip-question
        label: Skip this question
        transitionTo: ask-question
      - id: skip-domain
        label: Skip rest of domain
        transitionTo: next-loop-iteration
      - id: done
        label: Done with questions
        transitionTo: collect-assumptions

checkpoints:
  - id: stakeholder-transcript
    message: >
      Before we begin, please discuss requirements with key stakeholders
      (product owner, domain experts, end users). Provide the discussion
      transcript or summary when ready.
    blocking: true
    options:
      - id: provide-transcript
        label: Provide transcript
        effect:
          setVariable:
            has_stakeholder_input: true
      - id: skip-discussion
        label: Skip (not recommended)
        effect:
          setVariable:
            has_stakeholder_input: false

  - id: document-review
    message: "Requirements captured. Ready to proceed?"
    options:
      - id: proceed
        label: Proceed to Research
        effect:
          setVariable:
            elicitation_complete: true
      - id: revise
        label: Revise requirements

transitions:
  - to: research
    condition:
      variable: elicitation_complete
      operator: "=="
      value: true
    isDefault: true
  - to: requirements-elicitation
    condition:
      variable: elicitation_complete
      operator: "=="
      value: false

artifacts:
  - id: requirements-document
    name: requirements-elicitation.md
    location: planning
```

---

## 5. Skill Format

### 5.1 Description

A Skill is a **prose document** containing methodology, principles, tool usage guidance, and troubleshooting advice. The MCP server serves it to the agent when an activity references the skill. The server does not process or transform skill content -- it serves the markdown as-is.

A Skill is a single `.md` file. The filename IS the skill ID.

### 5.2 File Format

```
skills/
  {skill-id}.md                         # Prose methodology document
```

The skill file is a plain markdown document with no YAML frontmatter. Identity comes from the filename; versioning is tracked by source control.

### 5.3 Content Guidelines

**Structure conventions:**
- Start with a level-1 heading describing the skill's purpose
- Organize into sections that describe the approach
- Use prose, not numbered procedural steps -- the activity's formal spine controls ordering
- Reference resources by name when the agent should consult them
- Do NOT duplicate content that lives in a resource -- point to it

**Recommended sections:**
- **Principles** -- Behavioral constraints (replaces former `rules`)
- **Approach sections** -- Methodology organized by concern (replaces former `protocol`)
- **Tool usage** -- When and how to use specific tools, with parameters (replaces former `tools`)
- **Troubleshooting** -- Common error scenarios and recovery guidance (replaces former `errors`)

**Prose quality:**
- Write for an AI agent audience: clear, direct, judgment-oriented
- Sections SHOULD describe approach and methodology, not sequential protocol phases
- Include adaptation guidance (how to adjust based on context)

### 5.4 Validation Rules

1. Every skill MUST be a single `.md` file in the `skills/` directory.
2. The filename (without `.md`) MUST match the skill ID referenced by activities.
3. The file MUST NOT contain YAML frontmatter.
4. Skills MUST NOT contain execution flow elements (steps, decisions, loops, transitions, checkpoints). Flow control belongs in the activity.
5. If a resource exists for the skill's domain knowledge (question banks, templates, reference tables), the skill MUST reference the resource rather than duplicating its content.
6. Skills SHOULD include a Principles section for behavioral constraints when applicable.
7. Skills SHOULD include a Troubleshooting section for error recovery guidance when applicable.
8. Skills SHOULD include tool usage guidance (tool names, when to call, parameters, expected returns) inline in the relevant approach section or in a dedicated Tools section.

### 5.5 Complete Example

#### `skills/elicit-requirements.md`

```markdown
# Elicit Requirements

Discover what the user actually needs through structured, adaptive
conversation across five question domains.

## Principles

- **Conversation, not interrogation.** Discover what the user actually
  needs, which may differ from what they initially ask for.
- **One question per turn.** Never present multiple questions in a
  single message. Ask one, wait for the response, then adapt.
- **Adapt to responses.** Skip irrelevant follow-ups. Probe deeper
  when answers are vague or reveal hidden complexity.
- **Skip is always available.** The user can say "skip" at any time
  to move past a question or an entire domain.

## Working with Stakeholder Input

If a stakeholder transcript was provided, read it first and use it to:
- Pre-populate known answers (don't re-ask what's already clear)
- Identify gaps the stakeholder discussion didn't cover
- Calibrate question depth to the complexity signaled in the transcript

If no transcript was provided, note this limitation and be more thorough
in probing assumptions -- there's no external validation to fall back on.

## Conducting the Conversation

Work through the question domains from the requirements-elicitation
resource. The domains are ordered from problem understanding to
success criteria, but adapt based on what emerges:

- **Start broad** with problem exploration to understand context
- **Follow threads** -- if a response reveals complexity, probe before
  moving on, even if it crosses domain boundaries
- **Summarize back** after each domain to confirm understanding
- **Watch for red flags** listed in the resource's anti-patterns table

## Collecting Assumptions

As you interpret responses, track assumptions in four categories:

1. **Requirement Interpretation** -- "I understood X to mean Y"
2. **Scope Boundaries** -- "I assumed Z is out of scope because..."
3. **Implicit Requirements** -- "This implies we also need..."
4. **Success Criteria** -- "I interpreted 'working correctly' as..."

## Posting Assumptions for Review

When the issue is on Jira, post assumptions as a comment on the
ticket using `addCommentToJiraIssue`. Format as a numbered list
with clear accept/reject options per assumption.

Requires cloudId -- call `getAccessibleAtlassianResources` first
if not already resolved. See the atlassian-operations skill for
the full Atlassian tool usage protocol.

## Creating the Document

Write the requirements document to the planning artifacts folder.
Use the document template from the requirements-elicitation resource.
Populate every section from the conversation. The elicitation log
should capture every question asked and its response summary,
not just the final distilled requirements.

## Troubleshooting

**No stakeholder input** -- If the user skipped the stakeholder discussion,
note the limitation explicitly in the requirements document. Be more
thorough in probing assumptions since there's no external validation.
Flag any assumptions that would particularly benefit from stakeholder
review before implementation begins.

**Vague or circular responses** -- If the user consistently gives
non-specific answers, switch to concrete scenario questions: "Can you
walk me through what happens when...?" or "Give me an example of..."
Avoid accepting vague answers -- they become dangerous assumptions.

**Scope disagreement** -- If the user resists defining out-of-scope items,
explain that explicit exclusions prevent misaligned expectations during
implementation. Offer to mark contested items as "deferred" rather
than "excluded" to reduce friction.
```

---

## 6. Resource Format

### 6.1 Description

A Resource is **shared reference material** -- domain knowledge, templates, question banks, anti-patterns, checklists. It is pure prose that the MCP server serves to the agent. The server does not evaluate resource content.

A Resource is a single markdown file with minimal YAML frontmatter for identity and classification.

### 6.2 Schema

```markdown
---
id: string                              # REQUIRED: unique identifier (kebab-case)
version: string                         # REQUIRED: semantic version (X.Y.Z)
role: guide | template | checklist | reference   # REQUIRED: resource classification
applicability: string                   # OPTIONAL: when this resource applies
---

(markdown body: unrestricted prose content)
```

**Role classification:**

| Role | Meaning | Content Pattern |
|---|---|---|
| `guide` | Domain knowledge and methodology | How-to knowledge, question banks, heuristics, anti-patterns |
| `template` | Artifact format specification | Output structure, field descriptions, format examples |
| `checklist` | Verification/review criteria | Ordered check items, pass/fail criteria |
| `reference` | Factual/lookup information | API guides, tool usage patterns, configuration reference |

### 6.3 Validation Rules

**Structural:**
1. YAML frontmatter MUST contain `id`, `version`, and `role`.
2. `role` MUST be one of: `guide`, `template`, `checklist`, `reference`.
3. The markdown body MUST NOT be empty.
4. The `id` MUST match the filename (without `.md` extension).

**Content:**
5. Resources MUST NOT contain execution flow elements (steps, decisions, loops, transitions, checkpoints). If content controls execution, it belongs in an activity.
6. Resources MUST NOT contain formal interface declarations (inputs, outputs, tools). If content defines a capability methodology, it belongs in a skill.
7. Resources SHOULD be self-contained — a reader should understand the resource without needing to read the referencing skill or activity.
8. Resources referenced by multiple skills SHOULD be written generically enough to apply across contexts.

### 6.4 Complete Example

#### `resources/requirements-elicitation.md`

```markdown
---
id: requirements-elicitation
version: 2.0.0
role: guide
applicability: >
  New features and major enhancements only.
  Skip for bug fixes, refactors, chores, and minor updates.
---

# Requirements Elicitation Guide

**Purpose:** Reference material for requirements elicitation methodology.
Question banks, anti-patterns, templates, and completion heuristics.

---

## Question Domain Reference

The five domains below cover the complete requirements space.

### 1. Problem Exploration

**Goal:** Understand the core problem and its impact.

**Questions:**
- What problem are we trying to solve?
- What's not working well today?
- What triggers the need for this now?
- What would happen if we didn't address this?
- Have you tried any workarounds?
- How long has this been a problem?

**Red flags to probe:**
- Vague problem statements ("it's just not good enough")
- Solutions disguised as problems ("we need a caching layer")
- Symptoms rather than root causes

### 2. Stakeholder Identification

**Goal:** Understand who is affected and their specific needs.

**Questions:**
- Who will use this feature?
- Are there different user types with different needs?
- Who else is affected by this change?
- Who makes decisions about this area?
- Are there any external parties involved?

**User story format:**
> As a **[user type]**, I want **[capability]** so that **[benefit]**.

### 3. Context & Environment

**Goal:** Understand the operating environment and constraints.

**Questions:**
- What systems or components does this interact with?
- Are there any dependencies on external services?
- What's the expected usage volume/frequency?
- Are there any technology constraints?
- What's the timeline or deadline?
- Are there any regulatory or compliance requirements?

### 4. Scope Definition

**Goal:** Establish clear boundaries to prevent scope creep.

**Questions:**
- What should definitely be included?
- What should explicitly NOT be included?
- What's the minimum viable version?
- What can be deferred to a later phase?
- Are there any constraints on complexity?

**Scope boundary format:**
- In scope: [Explicit inclusions]
- Out of scope: [Explicit exclusions]
- Deferred: [Future considerations]

### 5. Success Criteria

**Goal:** Define measurable outcomes that indicate completion.

**Questions:**
- How will we know this is working correctly?
- What would a successful outcome look like?
- Are there any performance targets?
- What would make this a failure?
- How will this be tested/validated?

**SMART criteria format:**
- **S**pecific: Clear and unambiguous
- **M**easurable: Quantifiable or observable
- **A**chievable: Realistic given constraints
- **R**elevant: Aligned with the problem
- **T**ime-bound: Has a clear timeline

---

## Document Template

    # Requirements Elicitation: [Work Package Name]

    **Date:** YYYY-MM-DD
    **Status:** Confirmed | Pending Confirmation

    ## Problem Statement
    [2-3 sentences describing the core problem being solved]

    ## Goal
    [What success looks like — the desired end state]

    ## Stakeholders

    ### Primary Users
    | User Type | Needs | User Story |
    |-----------|-------|------------|
    | [Type] | [Needs] | As a [type], I want [X] so that [Y] |

    ## Context

    ### Integration Points
    - [System/component] — [How it interacts]

    ### Constraints
    - **Technical:** [Constraints]
    - **Timeline:** [Constraints]

    ## Scope

    ### In Scope
    1. [Must-have item]

    ### Out of Scope
    1. [Exclusion] — [Why excluded]

    ### Deferred
    1. [Future item] — [When to revisit]

    ## Success Criteria
    | ID | Criterion | Verification Method |
    |----|-----------|---------------------|
    | SC-1 | [Criterion] | [How to verify] |

    ## Elicitation Log
    | Domain | Question | Response Summary |
    |--------|----------|------------------|
    | Problem | [Question] | [Key points] |

    ## Confirmation
    **Confirmed by:** [User]
    **Date:** YYYY-MM-DD

---

## Anti-Patterns

| Don't | Why | Do Instead |
|-------|-----|------------|
| Ask leading questions | Biases responses | Ask open-ended questions |
| Accept vague answers | Creates assumptions | Probe for specifics |
| Skip scope boundaries | Leads to scope creep | Always define in/out |
| Assume you understand | Hidden misunderstandings | Confirm understanding |
| Mix requirements and solutions | Constrains design | Keep "what" from "how" |
| Accept the first answer | May miss deeper needs | Ask "why" and "what else" |

---

## Completion Heuristics

### Minimum Viable Elicitation
- [ ] One-sentence problem statement
- [ ] Primary user/stakeholder
- [ ] 3-5 in-scope items
- [ ] 2-3 explicit exclusions
- [ ] 2-3 success criteria

### When to Stop
Stop when you can confidently answer:
1. What problem are we solving?
2. For whom?
3. What's included and excluded?
4. How will we know it's done?
```

---

## 7. Concern Ownership Map

This table defines where each type of content lives. Each concern has exactly one home. This is the primary tool for resolving "where does this go?" questions during conversion and authoring.

| Concern | Home | Primitive | Rationale |
|---|---|---|---|
| Step ordering and sequencing | `activities/{id}.yaml` -> `steps` | Activity | Structural: defines execution order |
| Checkpoint options and suspension | `activities/{id}.yaml` -> `checkpoints` | Activity | Structural: defines decision points |
| Decision branching and guards | `activities/{id}.yaml` -> `decisions` | Activity | Structural: defines branching |
| Loop iteration | `activities/{id}.yaml` -> `loops` | Activity | Structural: defines iteration |
| Transition targets and conditions | `activities/{id}.yaml` -> `transitions` | Activity | Structural: defines navigation |
| Variable declarations and state | `activities/{id}.yaml` -> `variables` | Activity | Structural: defines state schema |
| Artifact declarations | `activities/{id}.yaml` -> `artifacts` | Activity | Structural: defines expected outputs |
| Skill references | `activities/{id}.yaml` -> `skills` | Activity | Server resolves skill for serving |
| Resource references | `activities/{id}.yaml` -> `resources` | Activity | Server resolves resource for serving |
| Tool usage guidance | `skills/{id}.md` (inline or dedicated section) | Skill | Agent interprets; tools available via MCP environment |
| Behavioral constraints / principles | `skills/{id}.md` → Principles section | Skill | Agent interprets |
| Error/troubleshooting guidance | `skills/{id}.md` → Troubleshooting section | Skill | Agent interprets |
| Methodology / approach | `skills/{id}.md` | Skill | Agent interprets for quality |
| Adaptation guidance | `skills/{id}.md` | Skill | Agent interprets for context adjustment |
| Judgment heuristics | `skills/{id}.md` | Skill | Agent interprets for decision quality |
| Question banks | `resources/{id}.md` | Resource | Shared knowledge, agent-interpreted |
| Document/artifact templates | `resources/{id}.md` | Resource | Shared templates, agent-interpreted |
| Anti-patterns and pitfalls | `resources/{id}.md` | Resource | Shared knowledge, agent-interpreted |
| Domain reference material | `resources/{id}.md` | Resource | Shared knowledge, agent-interpreted |
| Completion heuristics | `resources/{id}.md` | Resource | Shared knowledge, agent-interpreted |

---

## 8. Conversion Guide

### 8.1 Converting a TOON Activity

**Source:** `activities/{nn}-{name}.toon`
**Target:** `activities/{name}.yaml`

| TOON Element | Maps To | Notes |
|---|---|---|
| `id` | `id` | Drop numeric prefix |
| `version` | `version` | Preserve |
| `name` | `name` | Preserve |
| `description` | `description` | Preserve |
| `problem` | Drop | Absorbed into `description` |
| `recognition` | Drop | Intent matching moves to workflow-level routing |
| `skills.primary` | `skills.primary` | Preserve |
| `skills.supporting` | `skills.supporting` | Preserve |
| `required` | `required` | Preserve |
| `estimatedTime` | `estimatedTime` | Preserve |
| `artifactPrefix` | Drop | Numeric prefixes eliminated |
| `rules` | Drop from activity | Move rule content to skill `rules` if methodological, or drop if purely routing guidance |
| `steps` | `steps` | Convert each step; drop redundant description if it just restates the skill's methodology |
| `loops` | `loops` | Preserve structure |
| `decisions` | `decisions` | Preserve structure |
| `checkpoints` | `checkpoints` | Preserve structure; ensure `options` have `id`, `label`, `effect` |
| `transitions` | `transitions` | Preserve structure |
| `artifacts` | `artifacts` | Preserve structure |
| `outcome` | Drop | Outcomes are implicit in the artifact declarations and transition conditions |
| `context_to_preserve` | `variables` | Convert to typed variable declarations with defaults |

**Steps:**
1. Create `activities/{name}.yaml` (drop numeric prefix from folder name).
2. Copy identity fields (`id`, `version`, `name`, `description`).
3. Convert `context_to_preserve` entries to typed `variables` declarations.
4. Copy `steps`, `loops`, `decisions`, `checkpoints`, `transitions`, `artifacts` preserving structure.
5. Add `skills` and `resources` references.
6. Drop `problem`, `recognition`, `artifactPrefix`, `outcome`, `rules` (relocate rules to skill if needed).
7. Validate against Section 4.3 rules.

### 8.2 Converting a TOON Skill

**Source:** `skills/{nn}-{name}.toon`
**Target:** `skills/{name}.md`

| TOON Element | Maps To | Notes |
|---|---|---|
| `id` | Filename | `skills/{name}.md` — drop numeric prefix |
| `version` | Drop | Tracked by source control or workflow metadata |
| `capability` | Opening heading + paragraph | First heading and opening line of the skill |
| `description` | Opening paragraph | Merge with capability as the skill's introduction |
| `inputs` | Prose references | Mention inputs naturally in the methodology prose where they're used |
| `output` | Prose references | Mention output artifacts naturally in the relevant approach section |
| `tools` | Inline tool usage guidance | Convert detailed tool objects to prose sections describing when/how to use each tool |
| `rules` | Principles section | Each rule becomes a bold-prefaced list item with expanded prose |
| `resources` | Prose references | "See the {resource-name} resource for..." |
| `errors` | Troubleshooting section | Each error becomes a bold-prefaced paragraph |
| `protocol` | Approach sections | Each phase becomes a markdown section (##) |

**Steps:**
1. Create `skills/{name}.md` (drop numeric prefix).
2. Write the opening heading from `capability` and opening paragraph from `description`.
3. Convert `rules` entries into a **Principles** section:
   - Each rule key becomes a bold-prefaced list item.
   - Expand terse rule text into full prose with context and rationale.
4. Convert `protocol` phases into approach sections:
   - Each protocol phase becomes a markdown section (##).
   - Phase items become prose paragraphs, not numbered lists.
   - Remove procedural framing ("Step 1: ...", "First, ...") — the activity controls ordering.
   - Add judgment guidance: when to adapt, what to watch for, how to calibrate.
5. Reference inputs and outputs naturally in the prose:
   - Where the TOON protocol says "Load resource 05", write "See the requirements-elicitation resource..."
   - Where the TOON protocol references an input, describe it in context.
   - Where the TOON protocol produces an output artifact, describe the output location and format.
6. Convert `tools` from structured objects to inline prose guidance:
   - Describe when to call each tool, what parameters to pass, and what to expect.
   - Place tool guidance in the relevant approach section or in a dedicated Tools section.
7. Convert `errors` entries into a **Troubleshooting** section:
   - Each error key becomes a bold-prefaced paragraph.
   - The `cause` becomes the scenario description.
   - The `recovery` becomes the guidance prose.
8. Check for duplication with referenced resources:
   - If protocol content duplicates a resource, replace with a reference.
   - If protocol content is unique methodology, keep in the skill.
9. Validate against Section 5.4 rules.

### 8.3 Converting a Markdown Resource

**Source:** `resources/{nn}-{name}.md`
**Target:** `resources/{name}.md`

| Current Element | Maps To | Notes |
|---|---|---|
| `id` (frontmatter) | `id` | Preserve |
| `version` (frontmatter) | `version` | Preserve |
| `applicability` (frontmatter) | `applicability` | Preserve |
| — | `role` | ADD: classify as `guide`, `template`, `checklist`, or `reference` |
| Markdown body | Markdown body | Preserve content; verify no execution flow or formal interface content |

**Steps:**
1. Rename file: drop numeric prefix (`16-rust-substrate-code-review.md` → `rust-substrate-code-review.md`).
2. Add `role` field to frontmatter.
3. Verify `id` matches new filename (without `.md`).
4. Audit content for execution flow elements (steps, decisions, transitions) — if found, move to activity.
5. Audit content for interface declarations (inputs, outputs, tools) — if found, move to skill.
6. Validate against Section 6.3 rules.

### 8.4 Identifying the Skill ↔ Resource Boundary

During conversion, the hardest decision is whether skill-embedded knowledge should become a resource or stay in the skill. Use this decision rule:

```
Is this knowledge reusable by other skills or activities?
  YES → Extract to a resource, reference by ID
  NO  → Keep in the skill

Is this knowledge a question bank, template, checklist, or reference table?
  YES → Extract to a resource (even if only one skill uses it today)
  NO  → Keep in the skill

Is this knowledge methodology (how to approach the work)?
  YES → Keep in the skill
  NO  → It's probably a resource
```

---

## 9. MCP Server Resolution Protocol

The workflow-server MCP server resolves primitives by convention when agents call its tools:

### 9.1 Activity Resolution (`get_activity`)
```
Input:  activity ID (e.g., "requirements-elicitation"), workflow ID
Lookup: workflows/{workflow-id}/activities/{nn}-{id}.toon (current) or activities/{id}.yaml (new format)
Result: Parsed content returned to agent as structured response
```

### 9.2 Skill Resolution (`get_skill`)
```
Input:  skill ID (e.g., "elicit-requirements"), optional workflow ID
Lookup: Workflow-specific first: workflows/{workflow-id}/skills/{nn}-{id}.toon (or skills/{id}.md)
        Fallback to universal: workflows/meta/skills/{nn}-{id}.toon (or skills/{id}.md)
Result: Markdown content returned to agent as-is (no processing or transformation)
```

### 9.3 Resource Resolution (`get_resource`)
```
Input:  resource ID or index, workflow ID
Lookup: workflows/{workflow-id}/resources/{nn}-{id}.md (or resources/{id}.md)
Result: Markdown content returned to agent as-is
```

### 9.4 Agent-Driven Execution

Unlike the Orchestra runner (which actively assembles Situations and substitutes variables), the workflow-server is a passive content provider. The agent drives execution by:

1. Calling `get_activity` to retrieve the current activity's formal spine
2. Interpreting the steps, checkpoints, and decisions in the response
3. Calling `get_skill` to retrieve methodology for the current step
4. Calling `get_resource` to retrieve reference material as needed
5. Performing work based on the prose guidance received
6. Making checkpoint selections when presented with options

The agent is responsible for maintaining its own execution context. The MCP server does not track state, substitute variables, or assemble composite responses.

---

## 10. Migration Checklist

For each workflow being converted:

### Activities
- [ ] List all `.toon` activity files
- [ ] For each: create `.yaml` following Section 8.1
- [ ] Validate all step/checkpoint/decision/loop cross-references resolve
- [ ] Validate all skill and resource references resolve
- [ ] Validate all transition targets reference valid activity IDs

### Skills
- [ ] List all `.toon` skill files
- [ ] For each: create `skills/{name}.md` following Section 8.2
- [ ] Verify all `inputs` are referenced naturally in the prose where they're used
- [ ] Verify all `outputs` and artifacts are described in the relevant approach section
- [ ] Verify `rules` have been converted to a Principles section
- [ ] Verify `errors` have been converted to a Troubleshooting section
- [ ] Verify `tools` have been converted to inline tool usage prose
- [ ] Verify `protocol` phases have been converted to approach sections
- [ ] Verify NO YAML frontmatter exists in skill files
- [ ] Audit each skill for resource duplication (Section 8.4)

### Resources
- [ ] List all resource `.md` files
- [ ] For each: rename, add `role`, validate following Section 8.3
- [ ] Audit for execution flow content (move to activity if found)
- [ ] Audit for interface content (move to skill if found)
- [ ] Verify no resource duplicates skill content

### Cross-Cutting
- [ ] Every concern in the Concern Ownership Map (Section 7) has exactly one home
- [ ] No skill restates content from a referenced resource
- [ ] No activity `description` contains methodology (belongs in skill)
- [ ] No resource contains execution flow or interface declarations

---

## Appendix A: Format Decision Record

### A.1 Skill as Plain Prose Document

**Decision:** A skill is a single `.md` file with no frontmatter. The MCP server serves it as-is. There is no `interface.yaml`.

**Evolution:** This decision evolved through several iterations during the design session:

| Iteration | Format | Rejected Because |
|---|---|---|
| 1. Pure TOON | Everything in TOON format including prose | TOON not designed for long-form prose |
| 2. Markdown + YAML frontmatter | Single file; frontmatter = interface, body = guide | Agent would need to interpret YAML frontmatter |
| 3. Named folder (`interface.yaml` + `guide.md`) | Folder per skill; formal contract + prose guide | MCP server doesn't evaluate any interface fields except `capability` for indexing |
| 4. Single `.md` plain prose | **Chosen** | -- |

**Key finding:** Systematic analysis of every `interface.yaml` field revealed that the workflow-server MCP server acts on none of them:
- `inputs` / `outputs` -- parsed by Zod, no validation logic
- `tools` -- no allowlist enforcement
- `rules` -- no enforcement logic
- `errors` -- no error-matching logic
- `components` -- no content validation

The formal interface was a contract that nothing enforced. A skill is prose that the agent interprets. The simplest format is a plain markdown file.

**Rationale:** The MCP server's role with skills is: load the file and serve it. Everything in the skill -- methodology, principles, tool guidance, troubleshooting -- is prose for the agent. A single `.md` file is the simplest format that serves both parties.

**Note:** The Orchestra DSL extends this format with `{variable}` placeholders that the Orchestra runner substitutes at render time. In the workflow-server context, skills are served as plain markdown without variable processing.

### A.2 Error Definitions Moved to Prose

**Decision:** Remove `errors` from `interface.yaml`; move error/recovery content to `guide.md` Troubleshooting section.

**Analysis:** The existing TOON skill format includes an `errors` section with `cause` and `recovery` fields. Code inspection of the workflow-server MCP server (`src/loaders/skill-loader.ts`, `src/tools/workflow-tools.ts`) confirmed that:
- The Zod schema (`ErrorDefinitionSchema`) validates the structure on load
- No runtime code matches tool failures against error definitions
- No runtime code reads `recovery` fields to take automatic action
- The entire `errors` section is passed through to the agent as part of the skill response

The `errors` section is therefore prose guidance formatted as structured data -- it serves the agent, not the server.

**Options considered:**

| Option | Description | Rejected Because |
|---|---|---|
| Keep in `interface.yaml` | Preserve as formal contract element | Server has no error-matching logic; formal placement implies a contract that nothing enforces |
| Keep in `interface.yaml` as forward-looking | Design for future runner error handling | Premature; adds complexity now for a speculative future feature |
| **Move to `guide.md` (chosen)** | **Troubleshooting section in prose** | — |

**Rationale:** The formal spine / prose flesh principle states that if the runner doesn't evaluate it, it belongs in prose. Error recovery guidance is agent-interpreted troubleshooting advice. Placing it in the formal interface is misleading. If the runner gains error-handling semantics in the future (e.g., matching tool failures and presenting recovery checkpoints), a formal error schema can be reintroduced with actual execution semantics at that time.

### A.3 Rules Moved to Prose

**Decision:** Remove `rules` from `interface.yaml`; move behavioral constraints to `guide.md` Principles section.

**Analysis:** The TOON skill format includes a `rules` section — a flat `Record<string, string>` mapping rule names to constraint descriptions. Code inspection confirmed no reference to `.rules` anywhere in the server source (`src/`). Rules are validated by Zod on load and passed through to the agent as part of the serialized skill response. The runner never reads, evaluates, or enforces them.

Rules are behavioral constraints for the agent ("one question per turn", "conversation not interrogation"). They are more effective as prose in `guide.md` where they have context alongside the methodology they govern, rather than as terse key-value pairs divorced from that context.

**Rationale:** Same principle as errors (A.2): if the runner doesn't evaluate it, it belongs in prose. If the runner gains rule-enforcement semantics in the future, a formal rules schema can be reintroduced with actual enforcement logic.

### A.4 Output Components Dropped

**Decision:** Remove `components` from output definitions in `interface.yaml`.

**Analysis:** The TOON skill format includes a `components` field on outputs — a flat `Record<string, string>` mapping component names to descriptions (e.g., `requirements: "Captured requirements list"`). Code inspection confirmed:
- The Zod schema (`OutputComponentsDefinitionSchema`) validates the structure on load
- No runtime code inspects component keys or values
- No runtime code validates that produced artifacts contain declared components
- No downstream skill or activity references components by key

The `components` field duplicates content that already exists in the resource's document template. The template defines the artifact's structure in full detail; `components` is a terse summary of the same information.

**Rationale:** What goes inside an artifact is defined by the resource template (where the agent reads it) and described in `guide.md` (where the agent gets methodology). Declaring it a third time in `interface.yaml` adds no value — the runner doesn't validate artifact content, and the agent already has richer guidance from the template and guide.

---

## Appendix B: Glossary

| Term | Definition |
|---|---|
| **Activity** | A formal execution graph defining steps, decisions, loops, checkpoints, and transitions. The unit of orchestrated work. |
| **Artifact** | A tangible output produced by an activity (e.g., a markdown document, a report). |
| **Checkpoint** | A suspension point where the runner presents options and the agent (or user) makes a selection. |
| **Decision** | A branching point evaluated by the runner based on variable conditions or agent selection. |
| **Formal Spine** | The subset of workflow content that the runner evaluates for execution path determination. Always YAML. |
| **Guide** | (Deprecated -- see Skill) Formerly the prose file within a skill folder. Now the skill IS the guide. |
| **Loop** | An iteration construct within an activity (forEach, while). |
| **Prose Flesh** | The subset of workflow content interpreted by the agent for work quality. Always markdown. |
| **Resource** | Shared reference material (domain knowledge, templates, checklists) consumed by the agent. |
| **Skill** | A prose methodology document. A single `.md` file in `skills/` served to the agent by the MCP server. |
| **Step** | An atomic unit of work within an activity. May invoke a skill, trigger a checkpoint, or produce an artifact. |
| **Transition** | A navigation from one activity to another, guarded by a condition on variables. |
| **Variable** | A typed, named piece of state managed by the runner. Scoped to an activity or workflow. |

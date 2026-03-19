# Compliance Review: work-packages

**Date:** 2026-03-19
**Workflow:** work-packages v2.1.0
**Files audited:** 11 (1 workflow.toon, 7 activity .toon, 2 README.md, 1 activities/README.md)

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High     | 6 |
| Medium   | 5 |
| Low      | 2 |
| Pass     | 8 |

**Overall assessment:** The work-packages workflow has sound structural bones — sequential activity chain, checkpoints at decision points, loops for iteration, and a trigger to the work-package workflow. However, it operates entirely without workflow-specific skills or resources. All procedural guidance is embedded as prose in step descriptions. By contrast, the sibling `work-package` workflow has 24 skills and 28 resources for comparable complexity. This represents the workflow's most significant structural gap and the primary migration opportunity.

---

## Pass 1: Schema Expressiveness Findings

### F-01: No `artifacts` fields (Critical)

Six of seven activities produce artifacts referenced only in step description prose. The `artifacts[]` schema construct exists for exactly this purpose.

| Activity | Artifacts described in prose | Schema construct to use |
|----------|------------------------------|------------------------|
| folder-setup | START-HERE.md, README.md | `artifacts[].name`, `.location`, `.action: create` |
| analysis | 01-COMPLETION-ANALYSIS.md or 02-CONTEXT-ANALYSIS.md | `artifacts[].name`, `.location`, `.action: create` |
| package-planning | NN-package-name-plan.md (per package) | `artifacts[].name`, `.location`, `.action: create` |
| prioritization | dependency graph, priority ranking | `artifacts[].name`, `.description` |
| finalize-roadmap | Updated START-HERE.md, README.md, timeline | `artifacts[].name`, `.action: update` |
| implementation | Updated START-HERE.md (progress) | `artifacts[].name`, `.action: update` |

### F-02: Conditional logic as prose in analysis step (High)

`03-analysis.toon` step `perform-analysis`:

> "Execute completion analysis (if continuing) or context analysis (if new)"

This is an "if X then A, otherwise B" pattern. The `decision` construct with `branches` and `conditions` (referencing `analysis_type`) would replace this prose. The checkpoint that sets `analysis_type` already exists, so the condition variable is available.

### F-03: Undeclared variables in `context_to_preserve` (High)

Multiple activities reference variables in `context_to_preserve` that are not declared in the workflow's `variables[]`:

| Activity | Undeclared variable | Should be in workflow variables |
|----------|--------------------|---------------------------------|
| folder-setup | `documents_created` | Yes — tracks created file paths |
| analysis | `analysis_document` | Yes — path to analysis document |
| analysis | `key_findings` | Yes — summary of analysis |
| package-planning | `dependency_map` | Yes — inter-package dependencies |
| prioritization | `dependency_graph` | Yes — graph representation |
| prioritization | `prioritization_rationale` | Yes — reasoning for order |
| finalize-roadmap | `roadmap_complete` | Yes — boolean gate |
| finalize-roadmap | `timeline_estimate` | Yes — overall timeline |
| implementation | `parent_workflow` | Yes — back-reference |

**Anti-pattern #13:** "Track whether the user approved" (implicit). These are implied variables not wired to `variables[]`.

### F-04: Procedural protocol as step descriptions (Critical — primary migration target)

Every activity uses the generic `workflow-execution` skill. No workflow-specific skills exist to provide procedural protocol. Step descriptions serve as the only guidance for how to perform each step. Compare:

**Current (work-packages, step description):**
> "Identify what is in scope and out of scope for the work package"

**Reference (work-package `elicit-requirements` skill, protocol):**
```
"iterate-domains": [
  "Load resource 05 for question domains",
  "Iterate through domains one question at a time",
  "Record responses and adapt follow-ups",
  "Skip irrelevant follow-ups; probe deeper when needed"
]
```

The skill construct provides structured protocol, inputs, outputs, rules, error handling, and tool references — none of which exist in work-packages.

### F-05: Missing `artifactLocations` in workflow.toon (Medium)

The workflow creates artifacts at `.engineering/artifacts/planning/YYYY-MM-DD-initiative-name/` (described in folder-setup README), but `workflow.toon` declares no `artifactLocations`. This mapping should be explicit:

```
artifactLocations:
  planning:
    path: ".engineering/artifacts/planning/"
    description: "Planning folder for initiative documentation"
```

### F-06: Checkpoint option `transitionTo` format inconsistency (Medium)

Four activities use bare `transitionTo` on options; two use `effect.transitionTo`:

| Pattern | Activities using it |
|---------|-------------------|
| Bare `transitionTo` on option | scope-assessment, folder-setup, prioritization, finalize-roadmap |
| `effect: { transitionTo: ... }` | analysis, package-planning |

The schema construct inventory specifies `effect.transitionTo`. All should use the `effect` wrapper for consistency.

### F-07: Implementation activity has no checkpoints (Low)

The implementation activity iterates through packages and triggers the work-package workflow but has no checkpoint for the user to confirm or adjust the iteration. While the work-package workflow itself has checkpoints, the parent orchestration loop lacks a per-iteration or pre-start checkpoint.

---

## Pass 2: Convention Conformance Findings

| Convention | Status | Detail |
|-----------|--------|--------|
| File naming | **Pass** | Activities use `NN-name.toon` consistently |
| Folder structure | **Fail** | No `skills/` or `resources/` directories. Work-package and other mature workflows have both. |
| Version format | **Pass** | All versions use `X.Y.Z` |
| Field ordering | **Pass** | Consistent: id, version, name, description, problem, skills, steps, checkpoints, transitions, outcome, context_to_preserve |
| Transition patterns | **Pass** | Sequential with `initialActivity: scope-assessment` and `isDefault: true` transitions |
| Checkpoint structure | **Partial** | All checkpoints have id, name, message, options — but inconsistent `effect` wrapping (see F-06) |
| Skill references | **Fail** | Every activity references `workflow-execution` as primary. No workflow-specific skills defined. Mature workflows define domain-specific skills. |
| Modular content | **Fail** | Activities are correctly modular. However, all procedural guidance is inline in step descriptions rather than extracted to skills and resources. |
| README completeness | **Pass** | Root README has workflow overview, mermaid diagrams, activity tables, skills summary, context preservation. Activities/README has table and flow diagram. |

### F-08: No skills/ or resources/ directories (Critical)

The workflow has no `skills/` or `resources/` directories. For comparison:

| Workflow | Skills | Resources |
|----------|--------|-----------|
| work-packages | **0** | **0** |
| work-package | 24 | 28 |
| workflow-design | 2 | 5 |
| prism | 7 | 47 |

This is the most significant convention divergence.

---

## Pass 3: Rule Enforcement Findings

| # | Rule text | Can be violated by ignoring? | Structural enforcement | Verdict |
|---|-----------|------------------------------|----------------------|---------|
| 1 | "PREREQUISITE: Agents MUST read and follow AGENTS.md before starting any work" | **Yes** | None — no `validate` entry action, no checkpoint | **Text-only** (High) |
| 2 | "Agents must NOT proceed past checkpoints without user confirmation" | No | Checkpoints with `blocking: true` (on analysis) enforce this. Other checkpoints default to blocking via schema. | **Enforced** (Pass) |
| 3 | "Ask, don't assume - Clarify scope and priorities before planning" | **Yes** | Partial — scope-confirmed checkpoint covers scope; no equivalent for priorities until prioritization activity | **Partially enforced** (Medium) |
| 4 | "User controls priorities - Never assume priority order without confirmation" | No | `priority-confirmed` checkpoint enforces this | **Enforced** (Pass) |
| 5 | "Explicit approval - Get clear 'yes' or 'proceed' before creating documents" | **Yes** | Partial — checkpoints come after document creation in folder-setup (create first, confirm after) | **Partially enforced** (Medium) |

### F-09: AGENTS.md prerequisite rule has no structural enforcement (High)

Rule 1 states agents MUST read AGENTS.md, but no `validate` entry action or checkpoint exists to enforce this. Recommended fix: add an `entryActions` validate action on the first activity:

```
entryActions:
  - action: validate
    target: agents_md_read
    message: "AGENTS.md must be read before starting workflow"
```

### F-10: Document creation before approval checkpoint (Medium)

Rule 5 requires "explicit approval before creating documents," but `folder-setup` creates START-HERE.md and README.md in steps 2-3, then asks for approval in the checkpoint. The checkpoint confirms *after* creation rather than *before*. This is a sequence enforcement gap — the rule says "before" but the structure says "after."

---

## Pass 4: Anti-Pattern Findings

| # | Anti-pattern | Matched? | Location | Detail |
|---|-------------|----------|----------|--------|
| 1 | Inline content | **Yes** | Entire workflow | No skills or resources extracted; all guidance inline in step descriptions |
| 9 | Checkpoint as prose | Pass | — | Checkpoints are properly used as schema constructs |
| 10 | Loop as prose | Pass | — | Loops are properly used in package-planning and implementation |
| 11 | Conditional as prose | **Yes** | `03-analysis.toon` step `perform-analysis` | "if continuing... or... if new" — should be a `decision` construct |
| 12 | Artifact buried in description | **Yes** | 6 of 7 activities | Artifacts described only in step descriptions, no `artifacts[]` fields |
| 13 | Implicit variable tracking | **Yes** | 9 undeclared variables in `context_to_preserve` | Variables referenced but not in `variables[]` |
| 15 | Protocol as prose | **Yes** | `07-implementation.toon` step `trigger-workflow` | "Call get_workflow(work-package) and start the workflow" — should be skill protocol |
| 19 | Rule without structure | **Yes** | Rule 1 (AGENTS.md prerequisite) | Critical rule with zero structural enforcement |

No matches found for anti-patterns 2-8, 14, 16-18, 20-23.

---

## Pass 5: Schema Validation Results

| File | Status | Notes |
|------|--------|-------|
| `workflow.toon` | **Pass** | Valid TOON syntax, well-formed |
| `01-scope-assessment.toon` | **Pass** | Valid structure |
| `02-folder-setup.toon` | **Pass** | Valid structure |
| `03-analysis.toon` | **Pass** | Valid structure |
| `04-package-planning.toon` | **Pass** | Valid structure |
| `05-prioritization.toon` | **Pass** | Valid structure |
| `06-finalize-roadmap.toon` | **Pass** | Valid structure |
| `07-implementation.toon` | **Pass** | Valid structure |

All TOON files pass basic schema validation. The findings above are expressiveness and conformance gaps rather than syntax errors.

---

## Prose-to-Skills/Resources Migration Analysis

This section directly addresses the user's question: **what existing prose could be migrated to a skills/resources structure?**

### Candidate Skills

| # | Proposed Skill ID | Capability | Source Activities | Prose Being Replaced |
|---|-------------------|-----------|-------------------|---------------------|
| S1 | `assess-initiative-scope` | Identify and categorize work packages from user requirements | scope-assessment | Steps: "Verify this is a multi-work-package initiative," "List all work packages," "Summarize the identified work packages" — currently no guidance on *how* to decompose requirements into packages |
| S2 | `analyze-initiative-context` | Perform completion or context analysis for a multi-package initiative | analysis | Steps: "Execute completion analysis (if continuing) or context analysis (if new)" — no protocol for what either analysis involves |
| S3 | `plan-work-package-scope` | Define scope, dependencies, effort, and success criteria for a single package within a multi-package initiative | package-planning | Loop steps: "Identify what is in scope," "Document dependencies," "Provide rough effort estimate," "Establish measurable success criteria" — no methodology |
| S4 | `prioritize-packages` | Evaluate and order work packages by dependencies, value, risk, and effort | prioritization | Steps: "Create dependency graph," "Assess each package on: business value, risk, effort," "Generate recommended execution order" — no framework |
| S5 | `document-roadmap` | Produce roadmap documentation (START-HERE.md, README.md, timeline, success criteria) | finalize-roadmap | Steps describe what documents to produce but not templates or structure |
| S6 | `orchestrate-package-execution` | Trigger and manage work-package workflow instances within iteration loop | implementation | Steps: "Call get_workflow(work-package) and start the workflow," "Pass package context" — procedural protocol for workflow triggering |

### Candidate Resources

| # | Proposed Resource ID | Format | Content Source | Purpose |
|---|---------------------|--------|---------------|---------|
| R1 | `planning-folder-template` | markdown | folder-setup step descriptions + README | Template for START-HERE.md skeleton and README.md skeleton |
| R2 | `completion-analysis-guide` | markdown | New content (currently absent) | Guide for performing completion analysis: what to examine, what artifacts to check, how to assess progress |
| R3 | `context-analysis-guide` | markdown | New content (currently absent) | Guide for performing context analysis: what to survey, how to document dependencies, how to assess scope |
| R4 | `package-plan-template` | markdown | Could adapt work-package resource 10 (`wp-plan`) | Template for NN-package-name-plan.md with sections: scope, dependencies, effort, success criteria |
| R5 | `prioritization-framework` | markdown | prioritization step descriptions + new content | Framework for evaluating packages: criteria definitions, weighting approach, dependency graph conventions |
| R6 | `roadmap-template` | markdown | finalize-roadmap step descriptions | Template for final START-HERE.md: executive summary format, status table format, timeline format, success criteria format |
| R7 | `workflow-triggering-protocol` | markdown | implementation step descriptions | How to pass context between work-packages and work-package workflows, how to handle completion and failure |

### Reuse Opportunities from work-package

Several work-package skills and resources overlap with work-packages needs:

| work-package Asset | Reuse Potential for work-packages | Approach |
|--------------------|----------------------------------|----------|
| `elicit-requirements` skill | Medium — scope-assessment shares elicitation patterns | Adapt protocol for multi-package scope elicitation |
| `create-plan` skill | High — package-planning is plan creation per package | Adapt for lighter-weight planning (scope, deps, effort, criteria) |
| Resource 10 (`wp-plan`) | High — plan template directly applicable | Simplify for package-level plans vs. full work package plans |
| Resource 09 (`design-framework`) | Medium — analysis activity could use classification approach | Adapt for initiative-level vs. implementation-level analysis |
| `manage-artifacts` skill | High — folder-setup is artifact management | Reference or adapt for multi-package folder structure |
| `finalize-documentation` skill | Medium — finalize-roadmap is documentation finalization | Adapt for roadmap documentation vs. PR documentation |

### Structural Impact of Migration

If skills and resources were added, the activity files would change to reference specific skills:

```
# Before (current)
skills:
  primary: workflow-execution

# After (proposed)
skills:
  primary: plan-work-package-scope
  supporting:
    - workflow-execution
```

Each skill would provide:
- **protocol** — step-by-step procedure replacing prose descriptions
- **inputs** — explicit declarations of what the skill needs
- **output** — what the skill produces (with artifact references)
- **rules** — constraints specific to this capability
- **resources** — references to template/guide resources
- **tools** — which MCP tools to use and when
- **errors** — recovery guidance when things go wrong

This transforms the workflow from a structural skeleton that relies on agent improvisation into a guided methodology with reproducible outcomes.

---

## Recommended Fixes (Prioritized)

### Critical (3 findings)

1. **Create skills/ and resources/ directories** (F-08, F-04)
   - Create 6 skills (S1-S6) with protocol, inputs, outputs, rules
   - Create 7 resources (R1-R7) with templates and guides
   - Update activity files to reference workflow-specific skills as primary

2. **Add `artifacts[]` fields to all activities** (F-01)
   - Declare artifacts formally with id, name, location, action
   - Reference `artifactLocations` from workflow.toon

3. **Add `artifactLocations` to workflow.toon** (F-05)
   - Declare the planning folder location

### High (6 findings)

4. **Declare undeclared variables** (F-03)
   - Add 9 missing variables to workflow.toon `variables[]`

5. **Replace conditional prose with `decision` construct** (F-02)
   - In analysis activity, replace prose conditional with schema decision

6. **Add structural enforcement for AGENTS.md rule** (F-09)
   - Add `entryActions` validate action on scope-assessment

7. **Normalize checkpoint option format** (F-06)
   - Convert bare `transitionTo` to `effect.transitionTo` in 4 activities

### Medium (5 findings)

8. **Reorder folder-setup steps to create after approval** (F-10)
9. **Set `blocking: true` explicitly on all checkpoints** (Pass 3, Rule 2)
10. **Add per-iteration checkpoint to implementation** (F-07)

### Low (2 findings)

11. Workflow has no modes — acceptable given the workflow's straightforward sequential nature
12. Implementation activity has no checkpoints — acceptable if the work-package workflow provides sufficient user interaction

---

## Summary

The work-packages workflow is structurally sound but operationally thin. It defines *what* to do (clear activity sequence with checkpoints and loops) but provides no guidance on *how* to do it (no skills with protocol, no resources with templates). The most impactful improvement would be creating a skills/resources layer that transforms step description prose into structured, reusable procedural guidance — bringing the workflow to parity with the maturity level of the work-package workflow it depends on.

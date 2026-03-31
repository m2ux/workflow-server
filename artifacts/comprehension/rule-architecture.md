# Rule Architecture — Comprehension Artifact

> **Last updated**: 2026-03-31  
> **Work packages**: [#88 Rule-to-Skill Migration](../planning/2026-03-31-rule-to-skill-migration/README.md)  
> **Coverage**: Rule architecture across all 10 workflows, meta/rules.toon, orchestrate-workflow and execute-activity skills, skill/rules loader infrastructure  
> **Related artifacts**: [orchestration.md](orchestration.md), [workflow-server.md](workflow-server.md)

## Architecture Overview

### Three-Layer Rule Architecture

The workflow server delivers behavioral constraints to agents through three layers, each with different delivery mechanisms:

```
Layer 1: Global Rules (meta/rules.toon)
  └─ Loaded by rules-loader.ts → returned in start_session response
  └─ 85 rules across 16 sections
  └─ Delivered once per session, before any activity begins

Layer 2: Workflow-Level Rules (each workflow.toon rules[] array)
  └─ Part of the workflow definition loaded by workflow-loader.ts
  └─ 118 rules across 10 workflows (heavy duplication)
  └─ Returned via get_workflow/next_activity responses

Layer 3: Skill-Level Rules (inside skill TOON files)
  └─ Loaded by skill-loader.ts → returned in get_skills response
  └─ Formalized: protocol + rules + inputs + output + tools + errors
  └─ Delivered on-demand per activity via get_skills
```

### Key Modules

| Module | Lines | Responsibility |
|--------|-------|---------------|
| `src/loaders/rules-loader.ts` | 63 | Loads meta/rules.toon, validates against RulesSchema |
| `src/loaders/skill-loader.ts` | ~200 | Layered skill resolution: workflow → universal → cross-workflow |
| `src/loaders/workflow-loader.ts` | 250 | Loads workflows, activities; provides listWorkflows |
| `src/tools/resource-tools.ts` | 175 | start_session (returns rules), get_skills (returns skills) |
| `src/schema/rules.schema.ts` | 25 | RulesSchema + RulesSectionSchema (Zod, passthrough) |
| `src/schema/skill.schema.ts` | 161 | SkillSchema (comprehensive, additionalProperties: false) |

### Design Rationale

1. **Global rules as monolithic payload**: Originally designed when the server had fewer workflows. Every agent sees the same rules regardless of workflow. This was appropriate when the rule set was small but has become a context budget concern at 85 rules.

2. **Workflow rules as inline arrays**: Each workflow embeds its behavioral constraints as prose strings. This made workflows self-contained but led to duplication as new workflows copied rules from existing ones with slight rewording.

3. **Skills as formalized protocols**: The skill layer was designed later (with the Goal → Activity → Skill → Tools model) and provides structured definitions. Skills are the natural target for rule migration because they already support protocol steps, named rules, tool constraints, and error handling.

## Key Abstractions

### Rules Schema (rules.schema.ts)

```
RulesSchema {
  id: string          // e.g., "agent-rules"
  version: string     // e.g., "1.0.0"
  title: string       // e.g., "AI Agent Guidelines"
  description: string
  precedence: string  // e.g., "Workflow-specific rules override..."
  sections: RulesSectionSchema[]
}

RulesSectionSchema {
  id: string          // e.g., "session-protocol"
  title: string       // e.g., "Session Protocol"
  priority?: string   // "critical" | "high" | "medium" | "low"
  rules?: string[]    // Optional — sections can be empty
  ...passthrough()    // Allows arbitrary additional fields
}
```

The passthrough on RulesSectionSchema allows sections to use non-standard fields (e.g., `whenToCreate`, `commitStandards`, `destructiveOperations`) — this flexibility is important because rules.toon uses varied section structures.

### Skill Resolution Chain (skill-loader.ts)

```
readSkill(skillId, workflowDir, workflowId?)
  1. Try workflow-specific: {workflowDir}/{workflowId}/skills/{skillId}.toon
  2. Try universal:         {workflowDir}/meta/skills/{skillId}.toon
  3. Try cross-workflow:    {workflowDir}/*/skills/{skillId}.toon (sorted)
  → Result<Skill, SkillNotFoundError>
```

This chain means placing a skill in `meta/skills/` makes it universally available. Workflow-specific skills can override universal ones.

### Workflow Rule Format vs Skill Rule Format

| Aspect | Workflow rules[] | Skill rules{} |
|--------|-----------------|---------------|
| Format | Ordered string array | Named key-value object |
| Addressing | By index (fragile) | By name (stable) |
| Structure | Prose text only | Name + constraint text |
| Schema | Array of strings | Object with string values |
| Composability | Copy-paste | Reference by skill ID |

## Rule Duplication Map

### Cross-Workflow Duplication Analysis

| Rule Concept | work-package | prism | prism-audit | prism-evaluate | prism-update | cicd-audit | substrate-audit | workflow-design | work-packages |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Execution model declaration | ✓ | ✓ | ✓ | ✓ | | ✓ | | | |
| Orchestrator discipline (no domain work) | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | | |
| Automatic transitions | ✓ | ✓ | ✓ | ✓ | ✓ | | | | |
| Skill-loading boundary | ✓ | | | | | | | | |
| Checkpoint enforcement | ✓ | | | | | | | | |
| Worker permissions | | ✓ | ✓ | ✓ | | | | | |
| Artifact verification | | ✓ | ✓ | ✓ | | | | | |
| No permission questions | | ✓ | | | | | | | |
| Operational directives | | ✓ | | | | | | | |
| Blocker surfacing | | ✓ | | | | | | | |
| Concurrent dispatch | | | | | | ✓ | ✓ | | |
| Dispatch completeness gate | | | | | | ✓ | ✓ | | |
| Verification agent gate | | | | | | ✓ | ✓ | | |
| Merge agent gate | | | | | | ✓ | ✓ | | |
| Finding count reconciliation | | | | | | ✓ | ✓ | | |
| AGENTS.md prerequisite | ✓ | | | | | ✓ | ✓ | | ✓ |

### Duplication Clusters

**Cluster 1: Orchestrator Discipline** (~24 instances across 6 workflows)
Rules covering: execution model, no-domain-work, automatic transitions, checkpoint enforcement, skill-loading boundary. **CORRECTION**: These should NOT merge into a single `meta/skills/orchestrate-workflow` skill because different workflow families use fundamentally different orchestration models:
- **Persistent-worker model** (work-package): One worker resumed across all activities, preserving context.
- **Disposable-worker model** (prism, prism-audit, prism-evaluate): Fresh worker per analytical pass, ensuring isolation.
- **Concurrent-dispatch model** (cicd-audit, substrate-audit): Parallel scanner agents dispatched simultaneously, with verification and merge gates.

A single canonical skill would confuse agents running workflows with different patterns. Instead, orchestration discipline should be workflow-family-specific or encoded as workflow-level skill overrides.

**Cluster 2: Worker Execution** (~12 instances across 5 workflows)
Rules covering: self-bootstrap, step execution, checkpoint yield, artifact prefixing, README progress. Already present in `meta/skills/05-execute-activity.toon` (7 rules). Workflow instances are semantic duplicates. **Note**: `meta/skills/01-workflow-execution.toon` (v3.0.0) is a shallow API reference (tool call sequence) that `execute-activity` (v2.0.0) fully supersedes. `workflow-execution` should be absorbed or deprecated — it provides no behavioral guidance beyond what `execute-activity` covers in greater detail.

**Cluster 3: Prism Worker Protocols** (~19 instances across 3 workflows)
Rules covering: worker permissions, artifact verification, no permission questions, operational directives, blocker surfacing, analytical isolation. Unique to prism-family workflows. NOT currently in any skill.

**Cluster 4: Dispatch-Verify-Merge Pipeline** (~13 instances across 2 workflows)
Rules covering: concurrent dispatch, dispatch completeness gate, verification agent gate, merge agent gate, finding count reconciliation. Shared between cicd-audit and substrate-audit. NOT currently in any skill.

**Cluster 5: Workflow-Authoring Discipline** (14 rules, 1 workflow)
Rules in workflow-design covering schema validation, convention conformance, format literacy. Unique to workflow-design. Candidate for extraction but single-workflow, lower priority.

### meta/rules.toon Section Migration Map

| Section | Rules | Stays / Migrates | Destination |
|---------|-------|-------------------|-------------|
| session-protocol | 11 | **STAYS** | Bootstrap dependency — agents need this before get_skills |
| workflow-fidelity | 4 | MIGRATES | New skill: workflow-fidelity (not merge — orchestration model varies) |
| code-modification | 6 | STAYS (guardrail) | Generic behavioral constraint |
| implementation-workflow | 5 | MIGRATES | Merge into execute-activity |
| file-restrictions | 4 | STAYS (guardrail) | Generic behavioral constraint |
| communication | 6 | STAYS (guardrail) | Generic behavioral constraint |
| documentation | 5 | STAYS (guardrail) | Generic behavioral constraint |
| task-management | 12 | STAYS (guardrail) | IDE-level concern |
| error-recovery | 9 | STAYS (guardrail) | Generic behavioral constraint |
| version-control | 14 | MIGRATES | New skill: version-control-protocol |
| engineering-artifacts | 14 | MIGRATES | New skill: engineering-artifacts-management |
| github-cli | 10 | MIGRATES | New skill: github-cli-protocol |
| context-management | 7 | STAYS (guardrail) | IDE-level concern |
| orchestration | 9 | MIGRATES | Workflow-family-specific skills (see Correction 1 below) |
| build-commands | 2 | STAYS (guardrail) | Too small for a skill |
| domain-tool-discipline | 4 | STAYS (guardrail) | Pure safety constraint |

**Migration totals**: 56 rules migrate to skills, 29 rules stay as guardrails in slimmed rules.toon.

### Correction 1: Orchestration Discipline is Family-Specific

The orchestration section (9 rules in meta/rules.toon) and orchestrator-discipline rules duplicated across workflow.toon files should NOT merge into a single universal `orchestrate-workflow` skill. Three distinct orchestration models exist:

| Model | Workflows | Key Difference |
|-------|-----------|---------------|
| Persistent worker | work-package, workflow-design | Single worker resumed across activities; context preserved |
| Disposable workers | prism, prism-audit, prism-evaluate | Fresh worker per pass; isolation is the core invariant |
| Concurrent dispatch | cicd-audit, substrate-audit | Parallel scanner agents; verification and merge gates |

The existing `meta/skills/04-orchestrate-workflow.toon` already targets the persistent-worker model. Prism-family and audit-family workflows need their own orchestration skills, or the rules should stay workflow-level but be deduplicated within each family.

### Correction 2: workflow-execution Should Be Absorbed or Deprecated

Two meta skills overlap significantly:
- `01-workflow-execution.toon` (v3.0.0): Shallow API reference — lists which MCP tools to call and in what order. 98 lines.
- `05-execute-activity.toon` (v2.0.0): Full behavioral protocol — bootstrap, step execution, checkpoints, traces, reporting. 138 lines.

`execute-activity` supersedes `workflow-execution` in every dimension. The API reference content in `workflow-execution` is either redundant or could be absorbed into `execute-activity`'s tools section. `workflow-execution` should be deprecated or absorbed as part of this migration.

### Correction 3: orchestrate-workflow Must Leave meta/skills/

Since `meta/skills/` is auto-ingested on the first `get_skills` call for ALL workflows, `orchestrate-workflow` (which encodes the persistent-worker model) MUST be moved out of `meta/skills/` to avoid conflicting with other orchestration models. It moves to `work-package/skills/` (and `work-packages/skills/` if applicable). `execute-activity` stays in meta because worker execution IS model-agnostic.

**meta/skills/ post-migration inventory**: 00-activity-resolution, 02-state-management, 03-artifact-management, 05-execute-activity, 06-knowledge-base-search, 07-atlassian-operations, 08-gitnexus-operations, plus new: version-control-protocol, engineering-artifacts-management, github-cli-protocol. (-2 removed: 01-workflow-execution, 04-orchestrate-workflow. +3 added.)

## Domain Concept Mapping

| Domain Concept | Technical Construct | Location |
|---|---|---|
| Global rules | `Rules` type from `meta/rules.toon` | rules-loader.ts, rules.schema.ts |
| Workflow rules | `rules` string array in `workflow.toon` | workflow.schema.ts |
| Universal skills | TOON files in `meta/skills/` | skill-loader.ts `getUniversalSkillDir()` |
| Workflow-specific skills | TOON files in `{workflow}/skills/` | skill-loader.ts `getWorkflowSkillDir()` |
| Skill rules | `rules` key-value object in skill TOON | skill.schema.ts `rulesDefinition` |
| Skill protocol | Phase-keyed procedure steps in skill TOON | skill.schema.ts `protocolDefinition` |
| Bootstrap payload | `start_session` response with rules + token | resource-tools.ts |
| On-demand loading | `get_skills` response with skills + resources | resource-tools.ts |
| Meta exclusion | Not filtering meta from `listWorkflows` | workflow-loader.ts |

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 1 | Can prism-family workflows share skills via cross-workflow resolution? | Resolved | Yes — skill-loader tier 3 searches all workflow skill dirs. Skills in `prism/skills/` are discoverable by prism-audit and prism-evaluate. | Skill Resolution Chain |
| 2 | Does the workflow schema validate workflow-level rules differently from skill-level rules? | Resolved | Yes — workflow rules are `string[]` (ordered array), skill rules are `object` (named key-value). Different schemas, different formats. | Key Abstractions |
| 3 | Will removing rules from workflow.toon cause schema validation failures? | Resolved | No — `rules` is optional in the workflow schema. A workflow with zero rules is valid. | Verified via WorkflowSchema |
| 4 | Are there workflows that DON'T use orchestrator/worker pattern? | Resolved | Yes — meta, workflow-design, work-packages, and prism-update are single-agent or direct execution. Only work-package, prism, prism-audit, prism-evaluate, cicd-audit, and substrate-audit use orchestrated patterns. | Rule Duplication Map |
| 5 | How do tests reference rules.toon content? | Resolved | `rules-loader.test.ts` asserts `id: 'agent-rules'`, section count > 0, and section structure. `mcp-server.test.ts` calls start_session in beforeEach. Tests check structure, not content of individual rules. | A-02-05 in assumptions log |
| 6 | Should orchestration discipline merge into a single universal skill? | Resolved | **No** — three distinct orchestration models exist (persistent worker, disposable worker, concurrent dispatch). A single canonical skill would confuse agents. Family-specific skills or workflow-level rules needed. | Correction 1 |
| 7 | Should workflow-execution and execute-activity be separate skills? | Resolved | **No** — execute-activity (v2.0.0) fully supersedes workflow-execution (v3.0.0). The latter is a shallow API reference with no behavioral guidance beyond what execute-activity covers. Should be absorbed or deprecated. | Correction 2 |

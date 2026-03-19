# Workflow Design Workflow

Guides agents through creating or updating workflow definitions. Accepts a free-form user description and systematically elicits design details through sequential checkpoints, enforcing schema expressiveness, convention conformance, and structural enforcement of critical constraints.

## Modes

| Mode | Activation | Description |
|------|------------|-------------|
| **Create** (default) | "create a workflow", "new workflow" | Build a new workflow from a free-form description |
| **Update** | "update workflow", "modify workflow" | Modify an existing workflow with content preservation checks |

## Activity Sequence

```mermaid
stateDiagram-v2
    direction LR
    [*] --> Intake
    Intake --> ContextAndLiteracy
    ContextAndLiteracy --> RequirementsRefinement
    RequirementsRefinement --> PatternAnalysis
    RequirementsRefinement --> ImpactAnalysis
    PatternAnalysis --> ScopeAndStructure
    ImpactAnalysis --> ScopeAndStructure
    ScopeAndStructure --> ContentDrafting
    ContentDrafting --> QualityReview
    QualityReview --> ValidateAndCommit
    ValidateAndCommit --> [*]
```

| # | Activity | Mode | Est. Time | Purpose |
|---|----------|------|-----------|---------|
| 01 | Intake | Both | 5-10m | Accept description, classify as create or update, extract design intent |
| 02 | Context and Literacy | Both | 10-15m | Load schemas, read existing workflows, verify TOON format understanding |
| 03 | Requirements Refinement | Both | 15-30m | Elicit design details one question at a time (8 checkpoints) |
| 04 | Pattern Analysis | Create only | 10-15m | Audit 2+ reference workflows for reusable patterns |
| 05 | Impact Analysis | Update only | 10-20m | Enumerate affected files, check integrity, flag removals |
| 06 | Scope and Structure | Both | 10-20m | Define file manifest, folder structure, implementation order |
| 07 | Content Drafting | Both | 30-60m | Draft each file with per-file approach and review checkpoints |
| 08 | Quality Review | Both | 15-25m | Expressiveness, conformance, and rule-to-structure audits |
| 09 | Validate and Commit | Both | 10-15m | Schema validation, scope verification, commit to worktree |

## Design Principles

This workflow encodes 13 design principles derived from analysis of 175+ historical workflow creation sessions. Each principle is backed by structural enforcement (checkpoints, conditions, validate actions) rather than relying on rule text alone.

| # | Principle | Enforcement |
|---|-----------|-------------|
| 1 | Internalize before producing | Context-and-literacy gate checkpoints |
| 2 | Define complete scope before execution | Scope-confirmed checkpoint gates content drafting |
| 3 | One question at a time | 8 separate checkpoints in requirements refinement |
| 4 | Maximize schema expressiveness | Expressiveness review in quality review |
| 5 | Convention over invention | Conformance review in quality review |
| 6 | Never modify upward | Schema validation on every TOON file |
| 7 | Confirm before irreversible changes | Impact analysis checkpoints (update mode) |
| 8 | Corrections must persist | Cross-cutting: tracked throughout all activities |
| 9 | Modular over inline | Conformance check flags inline content |
| 10 | Encode constraints as structure | Rule-to-structure audit in quality review |
| 11 | Plan before acting | Approach checkpoint before each file |
| 12 | Non-destructive updates | Preservation checkpoints (update mode) |
| 13 | Format literacy before content | Format-literacy checkpoint gates content drafting |

## Resources

| # | Resource | Purpose |
|---|----------|---------|
| 00 | Design principles | Condensed reference of all 13 principles |
| 01 | Schema construct inventory | Prose-to-formal construct mapping tables |
| 02 | Anti-patterns | 23 prohibited patterns by category |
| 03 | Update mode guide | Content preservation and impact analysis procedures |

## Skills

| # | Skill | Purpose |
|---|-------|---------|
| 00 | workflow-design | Primary: design principles, construct inventory, quality checklist |
| 01 | toon-authoring | Supporting: TOON format rules, validation patterns |

## Output

A complete workflow file set in the `workflows/` worktree:

```
workflows/{workflow-id}/
├── workflow.toon
├── activities/
│   └── NN-activity-name.toon (one per activity)
├── skills/
│   └── NN-skill-name.toon (one per skill)
├── resources/
│   └── NN-resource-name.md (one per resource)
└── README.md
```

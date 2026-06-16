# Prism Update Workflow

> v1.1.0 — Sync the prism workflow's resources, techniques, and documentation with upstream changes from the agi-in-md project.

---

## Overview

When the upstream [agi-in-md](https://github.com/Cranot/agi-in-md) project adds, renames, or modifies prisms, those changes need to be imported into the prism workflow as indexed resources, with corresponding updates to skill routing (goal-mapping, portfolio catalog, model sensitivity) and documentation (READMEs, prompt guide).

This workflow codifies that process into a repeatable 7-activity pipeline: discover what changed, review with the user, import resources, update routing, update docs, verify consistency, and submit a PR.

**Use this workflow when:**
- Upstream agi-in-md has new commits that add or modify prisms
- Prism names have changed upstream (renames)
- Upstream prisms have been removed or deprecated

**What it does:**
- Diffs the upstream prisms/ directory against current workflow resources
- Categorizes changes as new, modified, renamed, or deleted
- Copies resource files with proper indexed naming
- Updates skill routing tables (plan-analysis, portfolio-analysis, behavioral-pipeline, orchestrate-prism)
- Rebuilds documentation (prompt guide, resource catalog, model sensitivity)
- Verifies consistency (no stale references, no routing mismatches, no duplicate indices)
- Creates a feature branch and PR

---

## Workflow Flow

```mermaid
graph TD
    Start([Start]) --> DC["00 discover-changes"]
    DC --> RC["01 review-changes"]
    RC --> IR["02 import-resources"]
    IR --> UR["03 update-routing"]
    UR --> UD["04 update-docs"]
    UD --> VF["05 verify"]
    VF --> VFD{"issues found?"}
    VFD -->|"no"| CM["06 commit-and-submit"]
    VFD -->|"yes"| IR
    CM --> Done([End])
```

---

## Activities

Each step binds its technique via `step.technique`. The Step Technique column names the technique an activity's steps run; every activity declares `variable-binding` as its supporting strategy technique.

| # | Activity | Steps | Step Technique | Supporting | Description |
|---|----------|-------|----------------|------------|-------------|
| 00 | **Discover Changes** | 1 | `diff-upstream` | `variable-binding` | Diff upstream prisms/ against current resources, categorize changes |
| 01 | **Review Changes** | 2 | `review-change-set::present-summary`, `review-change-set::apply-exclusions` | `variable-binding` | Present change summary, user confirms scope and exclusions |
| 02 | **Import Resources** | 1 | `sync-resources` | `variable-binding` | Copy/rename/delete resource files, commit per change type |
| 03 | **Update Routing** | 1 | `update-skill-routing` | `variable-binding` | Fix renamed refs, add goal-mapping entries, expand catalogs |
| 04 | **Update Documentation** | 1 | `update-prism-docs` | `variable-binding` | Rebuild resource README, prompt guide, model sensitivity |
| 05 | **Verify Consistency** | 1 | `verify-prism-consistency` | `variable-binding` | Check for stale refs, routing mismatches, count/index errors |
| 06 | **Commit and Submit** | 1 | `submit-update` | `variable-binding` | Create branch, push, create PR |

---

## Techniques

| Technique | Bound by | Capability |
|-----------|----------|------------|
| `diff-upstream` | Discover Changes | Diff upstream prisms against current resources, classify changes by type and family |
| `review-change-set::present-summary` | Review Changes | Present the categorized change set to the user as a reviewable summary |
| `review-change-set::apply-exclusions` | Review Changes | Apply user-requested exclusion adjustments, yielding the approved change set |
| `sync-resources` | Import Resources | Apply file changes: copy modified, git mv renames, import new with indexed names, remove deleted |
| `update-skill-routing` | Update Routing | Update goal-mapping matrix, portfolio catalog, model sensitivity, resource lists in all prism techniques |
| `update-prism-docs` | Update Documentation | Rebuild resource catalog, prompt guide entries, model sensitivity table, file structure |
| `verify-prism-consistency` | Verify Consistency | Verify content integrity, stale references, prompt routing, counts, and duplicate indices |
| `submit-update` | Commit and Submit | Ensure a feature branch, push commits, open a pull request, and report the result |

The `review-change-set` technique is an operation-group: a `review-change-set/` directory (`TECHNIQUE.md` shared contract plus one file per operation) whose ops are referenced as `review-change-set::present-summary` and `review-change-set::apply-exclusions`. All other techniques are flat standalones.

In addition, every activity declares the `variable-binding` strategy technique in its `techniques[]` list.

---

## Usage

```
Sync the prism workflow with upstream agi-in-md changes.

User provides:
- upstream_path: /path/to/agi-in-md/prisms/
- exclusions (optional): [arc_code.md, codegen.md]

Workflow executes:
1. Discovers 16 new, 28 modified, 4 renamed, 0 deleted prisms
2. Presents summary for user review
3. Imports resources (up to 4 commits: sync modified, apply renames, import new, remove deleted)
4. Updates plan-analysis, portfolio-analysis, behavioral-pipeline, orchestrate-prism
5. Updates READMEs with expanded catalog and prompt guide
6. Verifies no stale references or routing mismatches
7. Creates PR against workflows branch

User receives:
- Feature branch with clean commit history
- PR with change summary
```

---

## Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `planning_folder_path` | string | — | — | Path to the planning folder for this workflow execution |
| `upstream_path` | string | yes | — | Path to upstream prisms directory |
| `resource_path` | string | no | `prism/resources/` | Path to workflow resources directory |
| `change_set` | object | — | — | Categorized diff: new, modified, renamed, deleted |
| `exclusions` | array | no | `[]` | Upstream filenames to exclude |
| `next_index` | number | — | — | Next available resource index |
| `branch_name` | string | — | — | Feature branch name |
| `exclusions_adjusted` | boolean | — | `false` | Whether the user adjusted exclusions at the review checkpoint |
| `has_issues` | boolean | — | `false` | Whether verification found issues |

---

## Checkpoints

| Checkpoint | Activity | Blocking | Purpose |
|------------|----------|----------|---------|
| `change-review` | review-changes | yes | User confirms which changes to apply |
| `verification-result` | verify | no (30s) | User reviews consistency check findings |

---

## File Structure

```
workflows/prism-update/
├── workflow.toon
├── README.md
├── activities/
│   ├── README.md
│   ├── 00-discover-changes.toon
│   ├── 01-review-changes.toon
│   ├── 02-import-resources.toon
│   ├── 03-update-routing.toon
│   ├── 04-update-docs.toon
│   ├── 05-verify.toon
│   └── 06-commit-and-submit.toon
└── techniques/
    ├── TECHNIQUE.md
    ├── diff-upstream.md
    ├── sync-resources.md
    ├── update-skill-routing.md
    ├── update-prism-docs.md
    ├── verify-prism-consistency.md
    ├── submit-update.md
    └── review-change-set/
        ├── TECHNIQUE.md
        ├── present-summary.md
        └── apply-exclusions.md
```

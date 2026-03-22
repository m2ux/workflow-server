# Skills

> prism-update workflow — 5 skills

## Skill Catalog

| # | Skill | Capability | Used By | Inputs | Outputs |
|---|-------|------------|---------|--------|---------|
| 00 | `diff-upstream` | Diff upstream prisms against current resources, classify changes | discover-changes, review-changes | upstream-path, resource-path, exclusions | change-set |
| 01 | `sync-resources` | Apply file changes: copy, rename, import, remove | import-resources, commit-and-submit | changes, resource-path, next-index | import-result |
| 02 | `update-skill-routing` | Update goal-mapping, catalogs, and resource lists in prism skills | update-routing | changes | routing-result |
| 03 | `update-prism-docs` | Rebuild resource catalog, prompt guide, and model sensitivity docs | update-docs | changes | docs-result |
| 04 | `verify-prism-consistency` | Check for stale refs, routing mismatches, count/index errors | verify | changes, resource-path | verification-report |

## Skill Details

### 00 — diff-upstream

Compares the upstream prisms/ directory against the workflow resources/ directory. Produces a categorized change set (new, modified, renamed, deleted) with family classification and metadata extraction from YAML frontmatter for new prisms.

**Protocol phases:** enumerate-upstream → enumerate-resources → build-name-mapping → classify-new-prisms → compute-next-index

### 01 — sync-resources

Executes the approved change set against the resources directory. Each change type (sync modified, apply renames, import new, remove deleted) is committed separately for clean git history. Verifies final file count matches expectations.

**Protocol phases:** sync-modified → apply-renames → import-new → remove-deleted → verify-count

### 02 — update-skill-routing

Updates skill TOON files in the prism workflow to reflect resource changes. Covers four skills: plan-analysis (goal-mapping, model-sensitivity), portfolio-analysis (lens catalog), behavioral-pipeline (lens names), and orchestrate-prism (index mappings).

**Protocol phases:** update-plan-analysis → update-portfolio-analysis → update-behavioral-pipeline → update-orchestrate-prism → commit

### 03 — update-prism-docs

Rebuilds documentation across three README files: resources/README.md (full catalog table), workflow README.md (resource table, model sensitivity, prompt guide), and skills/README.md (resource counts).

**Protocol phases:** update-resources-readme → update-workflow-readme → update-skills-readme → commit

### 04 — verify-prism-consistency

Runs four consistency checks: searches for stale name references in TOON files, verifies prompt guide routing against the goal-mapping matrix, confirms resource file counts match documentation, and detects duplicate resource index prefixes.

**Protocol phases:** check-stale-references → verify-prompt-routing → verify-resource-counts → check-duplicate-indices → compile-findings

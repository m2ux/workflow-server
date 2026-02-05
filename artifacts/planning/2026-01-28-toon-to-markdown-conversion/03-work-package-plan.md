# Work Package Plan: TOON to Markdown Conversion

**Date:** 2026-01-28  
**Status:** Ready  
**Priority:** MEDIUM  
**Estimated Effort:** 1-2h agentic + 30m review

---

## Problem Statement

The work-package resources folder contains 19 TOON files that were originally markdown guides. The TOON format is less readable and harder to maintain than markdown. The original markdown guides contain richer content (embedded templates, examples, explanatory prose) that was compressed during the TOON migration. Converting back to markdown will restore this content while preserving the extracted standalone templates as references.

---

## Scope

### ✅ In Scope

1. Convert 19 TOON resource files to markdown format
2. Restore content from original markdown guides where available
3. Replace embedded templates with references to standalone template files
4. Preserve TOON-unique metadata (id, version, applicability)
5. Convert `19-end-here.toon` directly (no original exists)
6. Delete TOON files after verification

### ❌ Out of Scope

- TOON files in `meta/` workflow (skills, activities, rules)
- TOON files in `work-packages/` workflow
- Template files (already markdown, remain unchanged)
- Loader infrastructure changes (already supports .md)

---

## Template Reference Mapping

| Resource | Template Reference | Template File |
|----------|-------------------|---------------|
| 00-start-here | N/A | (uses 13 but doesn't exist - skip) |
| 06-implementation-analysis | templates/01 | 01-implementation-analysis.md |
| 07-knowledge-base-research | templates/02 | 02-kb-research.md |
| 09-plan | templates/03 | 03-work-package-plan.md |
| 10-test-plan | templates/04, 05 | 04-test-plan-initial.md, 05-test-plan-final.md |
| 14-architecture-review | templates/06 | 06-adr.md |
| 16-complete | templates/07 | 07-complete.md |
| 11-pr-description | templates/08, 09 | 08-pr-description-initial.md, 09-pr-description-final.md |
| 03-github-issue-creation | templates/10 | 10-github-issue.md |
| 04-jira-issue-creation | templates/11 | 11-jira-issue.md |

---

## Implementation Tasks

### Task 1: Create Batch 1 Resources (Core Guides)

Convert the first 6 resource files:

| Index | Source (original) | Target | Template Ref |
|-------|-------------------|--------|--------------|
| 00 | start-here.guide.md | 00-start-here.md | None |
| 02 | readme.guide.md | 02-readme.md | None |
| 03 | github-issue-creation.guide.md | 03-github-issue-creation.md | templates/10 |
| 04 | jira-issue-creation.guide.md | 04-jira-issue-creation.md | templates/11 |
| 05 | requirements-elicitation.guide.md | 05-requirements-elicitation.md | None |
| 06 | implementation-analysis.guide.md | 06-implementation-analysis.md | templates/01 |

**Steps:**
1. Copy original markdown from agent-resources
2. Add YAML frontmatter with id, version from TOON
3. Replace embedded templates with reference links
4. Verify content completeness against TOON

---

### Task 2: Create Batch 2 Resources (Research & Planning)

| Index | Source (original) | Target | Template Ref |
|-------|-------------------|--------|--------------|
| 07 | knowledge-base-research.guide.md | 07-knowledge-base-research.md | templates/02 |
| 08 | design-framework.guide.md | 08-design-framework.md | None |
| 09 | plan.guide.md | 09-plan.md | templates/03 |
| 10 | test-plan.guide.md | 10-test-plan.md | templates/04, 05 |
| 11 | pr-description.guide.md | 11-pr-description.md | templates/08, 09 |

---

### Task 3: Create Batch 3 Resources (Reviews)

| Index | Source (original) | Target | Template Ref |
|-------|-------------------|--------|--------------|
| 12 | assumptions-review.guide.md | 12-assumptions-review.md | None |
| 13 | task-completion-review.guide.md | 13-task-completion-review.md | None |
| 14 | architecture-review.guide.md | 14-architecture-review.md | templates/06 |
| 15 | strategic-review.guide.md | 15-strategic-review.md | None |

---

### Task 4: Create Batch 4 Resources (Completion & Workflow)

| Index | Source (original) | Target | Template Ref |
|-------|-------------------|--------|--------------|
| 16 | complete.guide.md | 16-complete.md | templates/07 |
| 17 | workflow-retrospective.guide.md | 17-workflow-retrospective.md | None |
| 18 | resume-work.md | 18-resume-here.md | None |

---

### Task 5: Convert 19-end-here.toon (New Content)

This file has no original markdown. Convert TOON directly:

1. Read TOON structure
2. Convert sections to markdown headers
3. Convert structured arrays to markdown lists/tables
4. Add YAML frontmatter
5. Write as `19-end-here.md`

---

### Task 6: Cleanup & Verification

1. Delete all 19 TOON files from resources/
2. Run loader tests to verify markdown files load correctly
3. Verify `list_workflow_resources` returns correct format
4. Spot-check 2-3 resources via `get_resource` tool

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| All 19 TOON files converted to .md | `ls resources/*.md | wc -l` = 19 |
| No TOON files remain | `ls resources/*.toon` returns empty |
| Loader tests pass | `npm test` passes |
| Resources load correctly | MCP tool returns content |
| Template references work | Links resolve to template files |

---

## YAML Frontmatter Format

Each markdown resource should include:

```yaml
---
id: resource-id
version: 1.0.0
---
```

Optional fields (preserve if present in TOON):
- `applicability`: When the guide applies
- `purpose`: One-line description

---

## Template Reference Format

Replace embedded templates with:

```markdown
## Template

**Location:** `.engineering/artifacts/planning/YYYY-MM-DD-work-package-name/XX-filename.md`

**Template:** See [`templates/XX-name.md`](../templates/XX-name.md)
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Content loss from TOON | Diff check before deleting TOON files |
| Broken template references | Verify all template files exist |
| Loader regression | Run full test suite after conversion |
